-- ============================================================================
-- BRIDGE MARKET — Migração 1: o servidor passa a controlar créditos e recargas
--
-- ADITIVA e idempotente: não remove nada do que existe hoje (o bloqueio final
-- das escritas directas em profiles vem na migração 2, depois do front-end novo
-- estar online). Pode ser corrida mais do que uma vez.
--
-- Contém:
--   A. Catálogo de pacotes, guarda de INSERT em credit_recharges, políticas
--      (admin vê recargas/ledger; utilizador pode cancelar a SUA recarga pendente),
--      restrições de integridade do ledger, bónus de registo no ledger.
--   B. Funções (RPC): approve_recharge, reject_recharge, match_order, cancel_order,
--      admin_adjust_credits, credit_ledger_mismatches.
--   C. Armazenamento: política de leitura dos comprovativos (nem o admin os
--      conseguia ver), bucket biométrico privado e com limites, correcção do
--      gatilho que tentava apagar de storage.objects (bloqueado pelo Supabase).
-- ============================================================================


-- ############################################################################
-- A. TABELAS, GATILHOS E POLÍTICAS
-- ############################################################################

-- A1. Catálogo de pacotes de créditos (fonte de verdade no servidor)
create table if not exists public.credit_packages (
  id         text    primary key,
  label      text    not null,
  price_kz   integer not null check (price_kz > 0),
  credits    integer not null check (credits > 0),
  bonus      integer not null default 0 check (bonus >= 0),
  active     boolean not null default true,
  sort_order integer not null default 0
);
alter table public.credit_packages enable row level security;
revoke all on public.credit_packages from anon, authenticated;
grant select on public.credit_packages to authenticated;
drop policy if exists credit_packages_read on public.credit_packages;
create policy credit_packages_read on public.credit_packages
  for select to authenticated using (active);

insert into public.credit_packages (id, label, price_kz, credits, bonus, sort_order) values
  ('starter',  'Starter',   2000,  4,  0, 1),
  ('standard', 'Standard',  5000, 11,  1, 2),
  ('pro',      'Pro',      10000, 24,  4, 3),
  ('business', 'Business', 25000, 65, 15, 4)
on conflict (id) do nothing;

-- A2. Integridade do ledger e das recargas
do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'credit_recharges_status_check') then
    alter table public.credit_recharges
      add constraint credit_recharges_status_check
      check (status in ('pending_payment','confirmed','rejected','cancelled'));
  end if;
  if not exists (select 1 from pg_constraint where conname = 'credit_transactions_type_check') then
    alter table public.credit_transactions
      add constraint credit_transactions_type_check
      check (type in ('signup_bonus','recharge','debit_matching','refund_cancel','admin_adjust'));
  end if;
  if not exists (select 1 from pg_constraint where conname = 'credit_transactions_amount_check') then
    alter table public.credit_transactions
      add constraint credit_transactions_amount_check check (amount <> 0);
  end if;
end $$;

-- Um débito/reembolso por utilizador e por pedido; uma recarga só credita uma vez.
create unique index if not exists credit_tx_once_per_order
  on public.credit_transactions (order_id, user_id, type)
  where type in ('debit_matching','refund_cancel');
create unique index if not exists credit_tx_once_per_recharge
  on public.credit_transactions (recharge_id)
  where type = 'recharge';

-- A3. Guarda de INSERT em credit_recharges: o cliente só escolhe o pacote;
--     valor, créditos e estado vêm sempre do servidor.
create or replace function public.credit_recharges_guard_insert()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  v_pkg record;
begin
  -- service_role / SQL directo (webhooks, administração) não são limitados.
  if current_user not in ('authenticated', 'anon') then
    return new;
  end if;

  select price_kz, credits, bonus into v_pkg
  from public.credit_packages
  where id = new.package_id and active;

  if not found then
    raise exception 'PACOTE_INVALIDO: pacote de créditos inexistente ou inactivo' using errcode = 'P0001';
  end if;

  new.amount_kz        := v_pkg.price_kz;
  new.credits_added    := v_pkg.credits + v_pkg.bonus;
  new.status           := 'pending_payment';
  new.confirmed_at     := null;
  new.confirmed_by     := null;
  new.rejection_reason := null;
  return new;
end $$;

revoke all on function public.credit_recharges_guard_insert() from public, anon, authenticated;

drop trigger if exists trg_credit_recharges_guard_insert on public.credit_recharges;
create trigger trg_credit_recharges_guard_insert
  before insert on public.credit_recharges
  for each row execute function public.credit_recharges_guard_insert();

-- A4. Políticas
-- O utilizador pode cancelar apenas a SUA recarga ainda pendente (o botão
-- "Cancelar e Enviar Outro Comprovativo" não fazia nada: não havia política de UPDATE).
drop policy if exists users_cancel_own_pending_recharge on public.credit_recharges;
create policy users_cancel_own_pending_recharge on public.credit_recharges
  for update to authenticated
  using      (auth.uid() = user_id and status = 'pending_payment')
  with check (auth.uid() = user_id and status = 'cancelled');

-- O admin não via recargas nem o ledger (só existiam políticas "do próprio").
drop policy if exists admin_select_recharges on public.credit_recharges;
create policy admin_select_recharges on public.credit_recharges
  for select to authenticated using (public.is_admin());

drop policy if exists admin_select_credit_tx on public.credit_transactions;
create policy admin_select_credit_tx on public.credit_transactions
  for select to authenticated using (public.is_admin());

-- A5. Bónus de registo passa a ficar no ledger (saldo = soma do ledger, sempre)
create or replace function public.profiles_signup_bonus_ledger()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if coalesce(new.credits_balance, 0) > 0 then
    insert into public.credit_transactions (user_id, type, amount, balance_after)
    values (new.id, 'signup_bonus', new.credits_balance, new.credits_balance);
  end if;
  return new;
end $$;

revoke all on function public.profiles_signup_bonus_ledger() from public, anon, authenticated;

drop trigger if exists trg_profiles_signup_bonus_ledger on public.profiles;
create trigger trg_profiles_signup_bonus_ledger
  after insert on public.profiles
  for each row execute function public.profiles_signup_bonus_ledger();

-- Backfill: utilizadores que já existem e ainda não têm movimentos no ledger
insert into public.credit_transactions (user_id, type, amount, balance_after, created_at)
select p.id, 'signup_bonus', p.credits_balance, p.credits_balance, p.created_at
from public.profiles p
where coalesce(p.credits_balance, 0) > 0
  and not exists (select 1 from public.credit_transactions t where t.user_id = p.id);


-- ############################################################################
-- B. FUNÇÕES DO SERVIDOR (RPC)
-- ############################################################################

-- B1. Aprovar recarga (admin) — atómico, com bloqueio de linha e ledger
create or replace function public.approve_recharge(p_recharge_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_rec public.credit_recharges%rowtype;
  v_bal integer;
begin
  if not public.is_admin() then
    raise exception 'FORBIDDEN: só administradores podem aprovar recargas' using errcode = '42501';
  end if;

  select * into v_rec from public.credit_recharges where id = p_recharge_id for update;
  if not found then
    raise exception 'RECARGA_NAO_ENCONTRADA' using errcode = 'P0002';
  end if;
  if v_rec.status <> 'pending_payment' then
    raise exception 'RECARGA_NAO_PENDENTE: estado actual = %', v_rec.status using errcode = 'P0001';
  end if;
  if v_rec.credits_added is null or v_rec.credits_added <= 0 then
    raise exception 'RECARGA_INVALIDA: créditos inválidos' using errcode = 'P0001';
  end if;

  update public.profiles
     set credits_balance = coalesce(credits_balance, 0) + v_rec.credits_added
   where id = v_rec.user_id
  returning credits_balance into v_bal;
  if not found then
    raise exception 'UTILIZADOR_NAO_ENCONTRADO' using errcode = 'P0002';
  end if;

  update public.credit_recharges
     set status = 'confirmed', confirmed_at = now(), confirmed_by = auth.uid()
   where id = v_rec.id;

  insert into public.credit_transactions (user_id, recharge_id, type, amount, balance_after)
  values (v_rec.user_id, v_rec.id, 'recharge', v_rec.credits_added, v_bal);

  return jsonb_build_object('ok', true, 'user_id', v_rec.user_id,
                            'credits_added', v_rec.credits_added, 'balance', v_bal);
end $$;

-- B2. Rejeitar recarga (admin)
create or replace function public.reject_recharge(p_recharge_id uuid, p_reason text default null)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_rec    public.credit_recharges%rowtype;
  v_reason text := coalesce(nullif(btrim(p_reason), ''), 'Comprovativo inválido ou ilegível');
begin
  if not public.is_admin() then
    raise exception 'FORBIDDEN: só administradores podem rejeitar recargas' using errcode = '42501';
  end if;

  select * into v_rec from public.credit_recharges where id = p_recharge_id for update;
  if not found then
    raise exception 'RECARGA_NAO_ENCONTRADA' using errcode = 'P0002';
  end if;
  if v_rec.status <> 'pending_payment' then
    raise exception 'RECARGA_NAO_PENDENTE: estado actual = %', v_rec.status using errcode = 'P0001';
  end if;

  update public.credit_recharges
     set status = 'rejected', rejection_reason = v_reason, confirmed_by = auth.uid()
   where id = v_rec.id;

  return jsonb_build_object('ok', true, 'user_id', v_rec.user_id, 'reason', v_reason);
end $$;

-- B3. Ajuste manual de créditos (admin) — sempre com motivo, ledger e auditoria
create or replace function public.admin_adjust_credits(p_user_id uuid, p_delta integer, p_reason text)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_bal   integer;
  v_email text;
begin
  if not public.is_admin() then
    raise exception 'FORBIDDEN: só administradores podem ajustar créditos' using errcode = '42501';
  end if;
  if p_delta is null or p_delta = 0 then
    raise exception 'AJUSTE_INVALIDO: o ajuste não pode ser zero' using errcode = 'P0001';
  end if;
  if coalesce(btrim(p_reason), '') = '' then
    raise exception 'MOTIVO_OBRIGATORIO: indica o motivo do ajuste' using errcode = 'P0001';
  end if;

  perform 1 from public.profiles where id = p_user_id for update;
  if not found then
    raise exception 'UTILIZADOR_NAO_ENCONTRADO' using errcode = 'P0002';
  end if;

  update public.profiles
     set credits_balance = coalesce(credits_balance, 0) + p_delta
   where id = p_user_id
  returning credits_balance into v_bal;

  if v_bal < 0 then
    raise exception 'SALDO_NEGATIVO: o ajuste deixaria o saldo negativo (%)', v_bal using errcode = 'P0001';
  end if;

  insert into public.credit_transactions (user_id, type, amount, balance_after)
  values (p_user_id, 'admin_adjust', p_delta, v_bal);

  select email into v_email from auth.users where id = auth.uid();
  insert into public.audit_logs (actor_id, actor_email, action, target_table, target_id, details, severity)
  values (auth.uid(), coalesce(v_email, 'admin'), 'credits_adjusted', 'profiles', p_user_id,
          jsonb_build_object('delta', p_delta, 'reason', p_reason, 'balance_after', v_bal), 'warning');

  return jsonb_build_object('ok', true, 'balance', v_bal);
end $$;

-- B4. Match (o parceiro aceita um pedido): cobra 1 crédito a CADA parte, atomicamente.
--     Devolve {ok:false, reason:...} em vez de lançar erro, para o cliente mostrar a mensagem certa.
create or replace function public.match_order(p_order_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid    uuid := auth.uid();
  v_order  public.orders%rowtype;
  v_pcred  integer;
  v_ccred  integer;
  v_pbal   integer;
  v_cbal   integer;
  v_email  text;
  v_kyc_ok boolean;
begin
  if v_uid is null then
    return jsonb_build_object('ok', false, 'reason', 'not_authenticated');
  end if;

  if exists (select 1 from public.admin_config where key = 'pause_transactions' and value = 'true') then
    return jsonb_build_object('ok', false, 'reason', 'paused');
  end if;

  select * into v_order from public.orders where id = p_order_id for update;
  if not found then
    return jsonb_build_object('ok', false, 'reason', 'not_found');
  end if;
  if v_order.user_id = v_uid then
    return jsonb_build_object('ok', false, 'reason', 'own_order');
  end if;
  if v_order.status <> 'awaiting_payment' or v_order.funder_id is not null then
    return jsonb_build_object('ok', false, 'reason', 'not_available');
  end if;

  -- O parceiro tem de estar verificado (mesma regra da criação de pedidos)
  select exists (select 1 from public.profiles p where p.id = v_uid and p.kyc_status = 'verified')
      or exists (select 1 from public.kyc_verifications k
                  where k.user_id = v_uid and k.step_personal_done = true
                    and k.liveness_status = 'passed' and k.ocr_status = 'passed')
    into v_kyc_ok;
  if not v_kyc_ok then
    return jsonb_build_object('ok', false, 'reason', 'kyc_required');
  end if;

  -- Bloquear os dois perfis por ordem de id (evita deadlocks)
  perform 1 from public.profiles where id in (v_uid, v_order.user_id) order by id for update;

  select coalesce(credits_balance, 0) - coalesce(credits_reserved, 0) into v_pcred
    from public.profiles where id = v_uid;
  select coalesce(credits_balance, 0) - coalesce(credits_reserved, 0) into v_ccred
    from public.profiles where id = v_order.user_id;

  if coalesce(v_pcred, 0) < 1 then
    return jsonb_build_object('ok', false, 'reason', 'partner_no_credits');
  end if;
  if coalesce(v_ccred, 0) < 1 then
    if not exists (select 1 from public.admin_alerts
                    where order_id = p_order_id and type = 'credit_warning'
                      and created_at > now() - interval '1 hour') then
      insert into public.admin_alerts (type, title, body, order_id, user_id)
      values ('credit_warning', 'Match recusado: criador do pedido sem créditos',
              'Um parceiro tentou aceitar o pedido ' || coalesce(v_order.order_ref, p_order_id::text)
              || ' mas o criador não tem créditos disponíveis.',
              p_order_id, v_order.user_id);
    end if;
    return jsonb_build_object('ok', false, 'reason', 'creator_no_credits');
  end if;

  update public.profiles set credits_balance = credits_balance - 1
   where id = v_uid returning credits_balance into v_pbal;
  update public.profiles set credits_balance = credits_balance - 1
   where id = v_order.user_id returning credits_balance into v_cbal;

  insert into public.credit_transactions (user_id, order_id, type, amount, balance_after) values
    (v_uid,           p_order_id, 'debit_matching', -1, v_pbal),
    (v_order.user_id, p_order_id, 'debit_matching', -1, v_cbal);

  select email into v_email from auth.users where id = v_uid;

  update public.orders
     set status                = 'processing',
         funder_id             = v_uid,
         admin_notes           = 'Correspondência P2P iniciada pelo parceiro ' || coalesce(v_email, v_uid::text),
         buyer_credit_reserved = true,
         seller_credit_reserved = true,
         fee_debited_at        = now()
   where id = p_order_id
  returning * into v_order;

  insert into public.chat_messages (order_id, user_id, sender_id, sender_role, body)
  values (p_order_id, v_order.user_id, v_uid, 'partner',
          '👋 Olá! Aceitei o teu pedido P2P. Vamos conversar por aqui para transacionar com segurança.');

  insert into public.admin_alerts (type, title, body, order_id, user_id)
  values ('payment_received', 'Parceiro P2P Correspondido',
          'O usuário ' || coalesce(v_email, '?') || ' aceitou parear o pedido do usuário.',
          p_order_id, v_uid);

  return jsonb_build_object('ok', true, 'balance', v_pbal, 'order', to_jsonb(v_order));
end $$;

-- B5. Cancelar pedido (só o criador). Reembolsa 1 crédito se já houve match (uma única vez).
create or replace function public.cancel_order(p_order_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid      uuid := auth.uid();
  v_order    public.orders%rowtype;
  v_bal      integer;
  v_cnt      integer;
  v_refunded boolean := false;
  v_now      timestamptz := now();
begin
  if v_uid is null then
    return jsonb_build_object('ok', false, 'reason', 'not_authenticated');
  end if;

  select * into v_order from public.orders where id = p_order_id for update;
  if not found or v_order.user_id <> v_uid then
    return jsonb_build_object('ok', false, 'reason', 'not_found');
  end if;
  if v_order.status in ('cancelled', 'completed', 'failed') then
    return jsonb_build_object('ok', false, 'reason', 'not_cancellable', 'status', v_order.status);
  end if;

  perform 1 from public.profiles where id = v_uid for update;

  update public.orders set status = 'cancelled' where id = p_order_id;

  if v_order.fee_debited_at is not null
     and not exists (select 1 from public.credit_transactions
                      where order_id = p_order_id and user_id = v_uid and type = 'refund_cancel') then
    update public.profiles set credits_balance = credits_balance + 1
     where id = v_uid returning credits_balance into v_bal;
    insert into public.credit_transactions (user_id, order_id, type, amount, balance_after)
    values (v_uid, p_order_id, 'refund_cancel', 1, v_bal);
    v_refunded := true;
  end if;

  update public.profiles
     set cancelled_count = coalesce(cancelled_count, 0) + 1, last_cancelled_at = v_now
   where id = v_uid
  returning cancelled_count, credits_balance into v_cnt, v_bal;

  insert into public.admin_alerts (type, title, body, order_id, user_id)
  values ('cancelled', 'Pedido Cancelado',
          'O cliente cancelou o pedido ' || coalesce(v_order.order_ref, '#' || upper(left(p_order_id::text, 8))) || '.',
          p_order_id, v_uid);

  return jsonb_build_object('ok', true, 'refunded', v_refunded, 'balance', v_bal,
                            'cancelled_count', v_cnt, 'last_cancelled_at', v_now,
                            'biometric_video_url', v_order.biometric_video_url);
end $$;

-- B6. Reconciliação: saldo de cada utilizador tem de ser igual à soma do ledger (admin)
create or replace function public.credit_ledger_mismatches()
returns table (uid uuid, balance integer, ledger_sum bigint)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not public.is_admin() then
    raise exception 'FORBIDDEN' using errcode = '42501';
  end if;
  return query
    select p.id, p.credits_balance, coalesce(sum(t.amount), 0)::bigint
      from public.profiles p
      left join public.credit_transactions t on t.user_id = p.id
     group by p.id, p.credits_balance
    having p.credits_balance <> coalesce(sum(t.amount), 0);
end $$;

-- Permissões: só utilizadores autenticados podem chamar (nunca anon / público)
revoke all on function public.approve_recharge(uuid)                 from public, anon;
revoke all on function public.reject_recharge(uuid, text)            from public, anon;
revoke all on function public.admin_adjust_credits(uuid, integer, text) from public, anon;
revoke all on function public.match_order(uuid)                      from public, anon;
revoke all on function public.cancel_order(uuid)                     from public, anon;
revoke all on function public.credit_ledger_mismatches()             from public, anon;
grant execute on function public.approve_recharge(uuid)                 to authenticated;
grant execute on function public.reject_recharge(uuid, text)            to authenticated;
grant execute on function public.admin_adjust_credits(uuid, integer, text) to authenticated;
grant execute on function public.match_order(uuid)                      to authenticated;
grant execute on function public.cancel_order(uuid)                     to authenticated;
grant execute on function public.credit_ledger_mismatches()             to authenticated;


-- ############################################################################
-- C. ARMAZENAMENTO (nomes reais dos buckets: payment-proofs, kyc-documents,
--    transaction-biometrics)
-- ############################################################################

-- C1. Comprovativos: o dono e o admin podem ler (antes ninguém conseguia: sem política de SELECT)
drop policy if exists payment_proofs_read on storage.objects;
create policy payment_proofs_read on storage.objects
  for select to authenticated
  using (bucket_id = 'payment-proofs'
         and ((auth.uid())::text = (storage.foldername(name))[1] or public.is_admin()));

-- C2. O painel admin apaga comprovativos/KYC depois de decidir
drop policy if exists payment_proofs_admin_delete on storage.objects;
create policy payment_proofs_admin_delete on storage.objects
  for delete to authenticated
  using (bucket_id = 'payment-proofs' and public.is_admin());

drop policy if exists kyc_docs_admin_delete on storage.objects;
create policy kyc_docs_admin_delete on storage.objects
  for delete to authenticated
  using (bucket_id = 'kyc-documents' and public.is_admin());

-- C3. Vídeos biométricos: bucket privado, com limite de tamanho e tipos permitidos
update storage.buckets
   set public = false,
       file_size_limit = 26214400,
       allowed_mime_types = array['video/webm', 'video/mp4']
 where id = 'transaction-biometrics';

-- Só os participantes do pedido podem enviar para a pasta biometric/<pedido>/
drop policy if exists "Allow insert for transaction-biometrics" on storage.objects;
drop policy if exists biometrics_insert_participants on storage.objects;
create policy biometrics_insert_participants on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'transaction-biometrics'
    and (storage.foldername(name))[1] = 'biometric'
    and exists (select 1 from public.orders o
                 where o.id::text = (storage.foldername(name))[2]
                   and (o.user_id = auth.uid() or o.funder_id = auth.uid()))
  );

-- Depois de cancelar, os participantes podem apagar o vídeo desse pedido (via Storage API)
drop policy if exists biometrics_delete_cancelled on storage.objects;
create policy biometrics_delete_cancelled on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'transaction-biometrics'
    and exists (select 1 from public.orders o
                 where o.id::text = (storage.foldername(name))[2]
                   and o.status = 'cancelled'
                   and (o.user_id = auth.uid() or o.funder_id = auth.uid()))
  );

-- C4. O gatilho antigo fazia DELETE directo em storage.objects com o nome de bucket
--     errado — e o Supabase bloqueia DELETE directo ("use a Storage API"), o que
--     faria falhar o cancelamento de qualquer pedido com vídeo. Agora só limpa a
--     referência; o ficheiro é removido pelo cliente (Storage API).
create or replace function public.delete_cancelled_biometric_video()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.status = 'cancelled' and old.biometric_video_url is not null then
    new.biometric_video_url := null;
  end if;
  return new;
end $$;
