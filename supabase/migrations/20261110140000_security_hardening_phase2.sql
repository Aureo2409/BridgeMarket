-- =====================================================================
-- Bridge Market — Bloqueio de segurança (Fase 2)
--
-- ⚠️  APLICAR SÓ DEPOIS de o site novo estar publicado (o que usa as funções
--     match_order / cancel_order / approve_recharge / reject_recharge).
--     Com o site ANTIGO ainda no ar, este bloqueio impede-o de mexer em
--     créditos (que é precisamente o objectivo) e as recargas/matchings
--     feitos por ele deixam de debitar/creditar.
--
-- Princípio: tudo o que é dinheiro, identidade (KYC) ou estado oficial de um
-- pedido passa a ser decidido PELO SERVIDOR. O browser só pode escrever o que
-- precisa de escrever. O que vem da API pública (roles authenticated/anon) é
-- validado; o que vem do servidor (funções SECURITY DEFINER, bot, webhooks,
-- service_role, SQL Editor) passa livre.
--
-- Como distinguimos: dentro de um trigger SECURITY INVOKER, current_user é o
-- role da ligação. Pedidos da API => 'authenticated' ou 'anon'. As funções do
-- servidor (SECURITY DEFINER) correm como dono => não são afectadas.
--
-- 100% idempotente. Rollback: supabase/rollback/20261110140000_security_hardening_phase2_ROLLBACK.sql
-- =====================================================================


-- ---------------------------------------------------------------------
-- 1) PROFILES — créditos, contadores, KYC e acesso só mudam pelo servidor
--    Antes: qualquer utilizador podia fazer update profiles set credits_balance = 999999,
--    kyc_status = 'verified' where id = <o seu id>.
-- ---------------------------------------------------------------------
create or replace function public.profiles_guard_write()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if current_user not in ('authenticated', 'anon') then
    return new;                                   -- servidor: livre
  end if;

  if tg_op = 'INSERT' then
    -- um perfil criado pela API nunca nasce com créditos/KYC/acesso "oferecidos"
    new.credits_balance   := 2;                   -- bónus de boas-vindas
    new.credits_reserved  := 0;
    new.total_spent_kz    := 0;
    new.cancelled_count   := 0;
    new.last_cancelled_at := null;
    new.kyc_status        := 'pending';
    new.access_status     := 'inactive';
    new.access_expires_at := null;
    return new;
  end if;

  -- UPDATE
  if new.id is distinct from old.id then
    raise exception 'CAMPO_PROTEGIDO: o identificador do perfil não pode ser alterado' using errcode = '42501';
  end if;

  -- créditos e contadores: NUNCA pela API (nem admin) — usar as funções do servidor
  if new.credits_balance   is distinct from old.credits_balance
     or new.credits_reserved  is distinct from old.credits_reserved
     or new.total_spent_kz    is distinct from old.total_spent_kz
     or new.cancelled_count   is distinct from old.cancelled_count
     or new.last_cancelled_at is distinct from old.last_cancelled_at then
    raise exception 'CAMPO_PROTEGIDO: créditos e contadores só podem ser alterados pelo servidor (use as funções approve_recharge, match_order, cancel_order ou admin_adjust_credits)'
      using errcode = '42501';
  end if;

  -- estado de verificação e de acesso: só administradores
  if (new.kyc_status        is distinct from old.kyc_status
      or new.access_status     is distinct from old.access_status
      or new.access_expires_at is distinct from old.access_expires_at)
     and not public.is_admin() then
    raise exception 'CAMPO_PROTEGIDO: o estado de verificação e de acesso só podem ser alterados pelo servidor'
      using errcode = '42501';
  end if;

  return new;
end $$;

drop trigger if exists aa_profiles_guard_ins on public.profiles;
create trigger aa_profiles_guard_ins before insert on public.profiles
  for each row execute function public.profiles_guard_write();

drop trigger if exists aa_profiles_guard_upd on public.profiles;
create trigger aa_profiles_guard_upd before update on public.profiles
  for each row execute function public.profiles_guard_write();


-- ---------------------------------------------------------------------
-- 2) KYC_VERIFICATIONS — ninguém se auto-aprova
--    Antes: o utilizador podia inserir/actualizar a sua própria linha com
--    liveness_status='passed', ocr_status='passed' e passava a "verificado".
--    Agora: o utilizador NÃO escreve nesta tabela (só lê a sua linha).
--    - Criar/actualizar/aprovar/recusar: só o admin (RLS) e o servidor
--      (bot/DIDIT com service_role, que ignora a RLS).
--    - "Tentar novamente" após recusa: função kyc_retry() (SECURITY DEFINER).
--      Só actua sobre processos RECUSADOS, nunca sobre aprovados nem sobre os
--      que estão em análise, e guarda o rasto na tabela audit_logs antes de
--      limpar o processo (as colunas de estado são NOT NULL, por isso o
--      antigo "update ... = null" do site nunca funcionou).
-- ---------------------------------------------------------------------
drop trigger if exists aa_kyc_guard_ins on public.kyc_verifications;
drop trigger if exists aa_kyc_guard_upd on public.kyc_verifications;
drop function if exists public.kyc_guard_write();

drop policy if exists kyc_insert on public.kyc_verifications;
create policy kyc_insert on public.kyc_verifications
  for insert with check (public.is_admin());

drop policy if exists kyc_update on public.kyc_verifications;
create policy kyc_update on public.kyc_verifications
  for update using (public.is_admin()) with check (public.is_admin());

create or replace function public.kyc_retry()
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  v_row public.kyc_verifications%rowtype;
begin
  if v_uid is null then
    return jsonb_build_object('ok', false, 'reason', 'not_authenticated');
  end if;

  select * into v_row from public.kyc_verifications where user_id = v_uid for update;
  if not found then
    return jsonb_build_object('ok', true, 'reset', false);
  end if;

  if v_row.liveness_status = 'passed' and v_row.ocr_status = 'passed' then
    return jsonb_build_object('ok', false, 'reason', 'already_verified');
  end if;
  if v_row.liveness_status is distinct from 'rejected' and v_row.ocr_status is distinct from 'rejected' then
    return jsonb_build_object('ok', false, 'reason', 'not_rejected');
  end if;

  insert into public.audit_logs (user_id, actor_id, action, target_table, target_id, details)
  values (v_uid, v_uid, 'kyc_retry', 'kyc_verifications', v_row.id,
          jsonb_build_object('liveness_status', v_row.liveness_status,
                             'ocr_status', v_row.ocr_status,
                             'rejection_reason', v_row.rejection_reason,
                             'provider', v_row.provider));

  delete from public.kyc_verifications where id = v_row.id;
  update public.profiles set kyc_status = 'pending' where id = v_uid and kyc_status <> 'verified';

  return jsonb_build_object('ok', true, 'reset', true);
end $$;

revoke all on function public.kyc_retry() from public, anon;
grant execute on function public.kyc_retry() to authenticated;

-- índice duplicado (mantém-se kyc_verifications_one_per_user)
drop index if exists public.kyc_verifications_user_id_uidx;

-- A tabela legada kyc_documents não é usada pelo site: só o admin altera estados
drop policy if exists kyc_docs_update on public.kyc_documents;
create policy kyc_docs_update on public.kyc_documents
  for update using (public.is_admin()) with check (public.is_admin());


-- ---------------------------------------------------------------------
-- 3) ORDERS — o participante só escreve o que o fluxo precisa
--    Antes: o criador (ou o parceiro) podia alterar QUALQUER coluna: valores,
--    taxa, flags de OCR (que fazem o pedido saltar para "pagamento recebido"),
--    marcar-se como concluído sem parceiro, mexer em flags de cobrança, etc.
--    Agora:
--      INSERT  → o pedido nasce em branco (sem parceiro, sem OCR, sem cobrança)
--                e respeita o limite de 1 pedido activo por utilizador.
--      UPDATE  → só colunas do fluxo; estados só na ordem certa e por quem deve:
--                  processing      → payment_received   (parceiro: "Já enviei os dólares")
--                  payment_received → completed         (criador: "Recebi os dólares")
--                cancelar passa pela função cancel_order; aceitar pela match_order.
-- ---------------------------------------------------------------------
create or replace function public.orders_guard_write()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  v_allowed constant text[] := array[
    'status', 'sent_at', 'proof_uploaded',
    'funder_rating', 'buyer_rating', 'rating_done',
    'selected_destination', 'selected_destination_account',
    'biometric_video_url', 'biometric_verified_at',
    'chat_onboarding_buyer_at', 'chat_onboarding_seller_at',
    'updated_at'
  ];
  v_uid    uuid := auth.uid();
  v_key    text;
  v_active integer;
begin
  if current_user not in ('authenticated', 'anon') then
    return new;
  end if;
  if public.is_admin() then
    return new;
  end if;

  if tg_op = 'INSERT' then
    new.status                      := 'awaiting_payment';
    new.funder_id                   := null;
    new.fee_usd                     := 0;
    new.fee_debited_at              := null;
    new.buyer_credit_reserved       := false;
    new.seller_credit_reserved      := false;
    new.ocr_iban_match              := null;
    new.ocr_time_valid              := null;
    new.ocr_tx_id                   := null;
    new.ocr_amount_match            := null;
    new.ocr_all_passed              := null;
    new.receipt_url                 := null;
    new.receipt_verified_at         := null;
    new.admin_notes                 := null;
    new.sent_at                     := null;
    new.proof_uploaded              := false;
    new.funder_rating               := null;
    new.buyer_rating                := null;
    new.seller_rating               := null;
    new.rating_done                 := false;
    new.biometric_video_url         := null;
    new.biometric_verified_at       := null;
    new.gateway_payment_confirmed_at := null;
    new.gateway_provider            := null;
    new.gateway_raw_payload         := null;
    new.chat_onboarding_buyer_at    := null;
    new.chat_onboarding_seller_at   := null;

    -- limite de 1 pedido activo por utilizador (a regra que o site já mostrava, agora a sério)
    perform pg_advisory_xact_lock(hashtextextended('orders_active:' || new.user_id::text, 0));
    select count(*) into v_active
      from public.orders
     where user_id = new.user_id
       and status in ('awaiting_payment', 'processing');
    if v_active >= 1 then
      raise exception 'LIMITE_PEDIDOS_ATIVOS: só podes ter 1 pedido activo em simultâneo' using errcode = 'P0001';
    end if;
    return new;
  end if;

  -- UPDATE por participante: nenhuma coluna fora da lista pode mudar
  select key into v_key
    from jsonb_each(to_jsonb(new)) n(key, value)
   where not (key = any (v_allowed))
     and (to_jsonb(old) -> key) is distinct from value
   limit 1;
  if v_key is not null then
    raise exception 'CAMPO_PROTEGIDO: a coluna "%" do pedido não pode ser alterada directamente', v_key
      using errcode = '42501';
  end if;

  if new.status is distinct from old.status then
    if old.status = 'processing' and new.status = 'payment_received' and v_uid = old.funder_id then
      null;   -- o parceiro confirma que enviou
    elsif old.status = 'payment_received' and new.status = 'completed' and v_uid = old.user_id then
      null;   -- o criador confirma que recebeu
    else
      raise exception 'TRANSICAO_INVALIDA: % -> % não é permitida', old.status, new.status
        using errcode = '42501';
    end if;
  end if;

  -- avaliações: cada parte só avalia a outra, entre 1 e 5
  if new.funder_rating is distinct from old.funder_rating then
    if v_uid is distinct from old.user_id then
      raise exception 'AVALIACAO_INVALIDA: só o criador do pedido avalia o parceiro' using errcode = '42501';
    end if;
    if new.funder_rating is not null and (new.funder_rating < 1 or new.funder_rating > 5) then
      raise exception 'AVALIACAO_INVALIDA: a nota tem de estar entre 1 e 5' using errcode = '22023';
    end if;
  end if;
  if new.buyer_rating is distinct from old.buyer_rating then
    if v_uid is distinct from old.funder_id then
      raise exception 'AVALIACAO_INVALIDA: só o parceiro avalia o criador do pedido' using errcode = '42501';
    end if;
    if new.buyer_rating is not null and (new.buyer_rating < 1 or new.buyer_rating > 5) then
      raise exception 'AVALIACAO_INVALIDA: a nota tem de estar entre 1 e 5' using errcode = '22023';
    end if;
  end if;

  return new;
end $$;

drop trigger if exists aa_orders_guard_ins on public.orders;
create trigger aa_orders_guard_ins before insert on public.orders
  for each row execute function public.orders_guard_write();

drop trigger if exists aa_orders_guard_upd on public.orders;
create trigger aa_orders_guard_upd before update on public.orders
  for each row execute function public.orders_guard_write();


-- ---------------------------------------------------------------------
-- 4) CHAT — só participantes, identidade verdadeira, sem "Bridge Bot" falso
--    Antes: (a) a política "Permitir insercao para participantes" deixava QUALQUER
--    utilizador autenticado escrever no chat de QUALQUER pedido; (b) a política
--    chat_insert_participants aceitava auth.uid() = user_id, coluna que o próprio
--    utilizador preenche; (c) qualquer um podia escrever como 'admin' ou como
--    "🤖 Bridge Bot" a dar instruções de pagamento falsas à contraparte;
--    (d) o filtro de IBAN/telefone/links só existia no browser.
-- ---------------------------------------------------------------------
drop policy if exists "Permitir insercao para participantes" on public.chat_messages;

drop policy if exists chat_insert_participants on public.chat_messages;
create policy chat_insert_participants on public.chat_messages
  for insert to authenticated
  with check (
    auth.uid() = sender_id
    and (
      public.is_admin()
      or exists (
        select 1 from public.orders o
         where o.id = chat_messages.order_id
           and (o.user_id = auth.uid() or o.funder_id = auth.uid())
      )
    )
  );

create or replace function public.chat_guard_insert()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  v_uid   uuid := auth.uid();
  v_order public.orders%rowtype;
  v_body  text := coalesce(new.body, '');
begin
  if current_user not in ('authenticated', 'anon') then
    return new;
  end if;
  if public.is_admin() then
    return new;
  end if;

  select * into v_order from public.orders where id = new.order_id;
  if not found then
    raise exception 'PEDIDO_NAO_ENCONTRADO' using errcode = 'P0002';
  end if;
  if v_uid is distinct from v_order.user_id and v_uid is distinct from v_order.funder_id then
    raise exception 'FORBIDDEN: só os participantes do pedido podem escrever no chat' using errcode = '42501';
  end if;

  -- identidade coerente com o pedido (não se pode escrever como 'admin' nem como a outra parte)
  new.user_id     := v_order.user_id;
  new.sender_role := case when v_uid = v_order.user_id then 'client' else 'partner' end;

  -- Mensagens "Bridge Bot": só a que o site gera quando o parceiro escolhe o destino,
  -- e só se bater certo com o destino REGISTADO no pedido.
  if v_body ~* 'bridge\s*bot' then
    if v_uid is distinct from v_order.funder_id
       or v_order.selected_destination_account is null
       or v_body !~ '^🤖 Bridge Bot: O parceiro confirmou que enviará os dólares via \*\*[^*]+\*\* \(Conta: `[^`]+`\)\.$'
       or position('(Conta: `' || v_order.selected_destination_account || '`)' in v_body) = 0 then
      raise exception 'MENSAGEM_RESERVADA: as mensagens do "Bridge Bot" são geradas pela plataforma' using errcode = '42501';
    end if;
    return new;
  end if;

  -- Comprovativo anexado pelo chat: o nome do ficheiro não passa pelo filtro, mas tem de trazer ficheiro
  if v_body like '📎 Envio de Comprovativo:%' then
    if new.file_url is null then
      raise exception 'MENSAGEM_INVALIDA: anexo sem ficheiro' using errcode = '22023';
    end if;
    return new;
  end if;

  -- Filtro de conteúdo (mesmos padrões do site): IBAN, telefone angolano, links externos
  if v_body ~* 'AO06|PT\d{2}'
     or v_body ~* '(\+244|9\d{8})'
     or v_body ~* 'https?://[^\s]+|www\.[^\s]+' then
    raise exception 'CONTEUDO_BLOQUEADO: por segurança não é permitido partilhar IBANs, telefones ou links no chat' using errcode = 'P0001';
  end if;

  return new;
end $$;

drop trigger if exists aa_chat_guard_ins on public.chat_messages;
create trigger aa_chat_guard_ins before insert on public.chat_messages
  for each row execute function public.chat_guard_insert();


-- ---------------------------------------------------------------------
-- 5) COMPROVATIVOS — só nos pedidos em que participo, sempre "pending"
--    Antes: qualquer utilizador inseria um comprovativo para o pedido de OUTRO
--    e o trigger advance_order_on_proof (SECURITY DEFINER) avançava esse pedido.
-- ---------------------------------------------------------------------
drop policy if exists proofs_insert on public.payment_proofs;
create policy proofs_insert on public.payment_proofs
  for insert to authenticated
  with check (
    auth.uid() = user_id
    and status = 'pending'
    and exists (
      select 1 from public.orders o
       where o.id = payment_proofs.order_id
         and (o.user_id = auth.uid() or o.funder_id = auth.uid())
    )
  );


-- ---------------------------------------------------------------------
-- 6) AUDITORIA / NOTIFICAÇÕES / ALERTAS
--    - audit_logs: o INSERT estava aberto a TODOS (até sem login) => qualquer um forjava
--      registos de auditoria. Todas as funções que escrevem lá são SECURITY DEFINER.
--    - notifications: um utilizador podia inserir uma notificação com
--      recipient_phone/message_body à escolha e o bot enviava-a por WhatsApp
--      (relay de spam/phishing a partir do número oficial). Os triggers de
--      notificação são SECURITY DEFINER; o admin continua a poder inserir.
--    - admin_alerts: já não aceita alertas sem pedido associado vindos de utilizadores.
-- ---------------------------------------------------------------------
drop policy if exists audit_logs_insert on public.audit_logs;

drop policy if exists notif_insert_admin_or_system on public.notifications;
create policy notif_insert_admin_only on public.notifications
  for insert with check (public.is_admin());

drop policy if exists alerts_insert_participants on public.admin_alerts;
create policy alerts_insert_participants on public.admin_alerts
  for insert to authenticated
  with check (
    public.is_admin()
    or (
      order_id is not null
      and exists (
        select 1 from public.orders o
         where o.id = admin_alerts.order_id
           and (o.user_id = auth.uid() or o.funder_id = auth.uid())
      )
    )
  );

-- o site já tenta registar este tipo (tentativa de negociar taxa no chat), mas o CHECK recusava-o
alter table public.admin_alerts drop constraint if exists admin_alerts_type_check;
alter table public.admin_alerts
  add constraint admin_alerts_type_check
  check (type = any (array['new_order','payment_received','kyc_pending','cancelled','credit_warning','recharge_pending','rate_manipulation_attempt']));


-- ---------------------------------------------------------------------
-- 7) HIGIENE DE PERMISSÕES
--    Funções de trigger não devem ser chamáveis pela API; tabelas não precisam
--    de TRUNCATE/TRIGGER/REFERENCES para os roles públicos.
--    (is_admin() mantém-se executável: as políticas RLS avaliam-na como o utilizador.)
-- ---------------------------------------------------------------------
revoke execute on function public.handle_new_user()          from public, anon, authenticated;
grant  execute on function public.handle_new_user()          to supabase_auth_admin, service_role;
revoke execute on function public.notify_admin_on_order()    from public, anon, authenticated;
revoke execute on function public.notify_admin_on_payment()  from public, anon, authenticated;
revoke execute on function public.advance_order_on_ocr()     from public, anon, authenticated;
revoke execute on function public.check_kyc_before_order()   from public, anon, authenticated;
revoke execute on function public.profiles_guard_write()     from public, anon, authenticated;
revoke execute on function public.orders_guard_write()       from public, anon, authenticated;
revoke execute on function public.chat_guard_insert()        from public, anon, authenticated;

revoke truncate, trigger, references on all tables in schema public from anon, authenticated;
