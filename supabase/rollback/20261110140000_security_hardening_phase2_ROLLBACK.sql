-- =====================================================================
-- ROLLBACK do bloqueio de segurança (Fase 2)
-- Só usar se, depois de aplicar 20261110140000_security_hardening_phase2.sql,
-- algo do site deixar de funcionar e for preciso voltar ao estado anterior
-- enquanto se corrige. Repõe as políticas originais e remove os guardas.
--
-- ⚠️  Repõe também as brechas (créditos/KYC editáveis pelo utilizador etc.).
--     É um travão de emergência, não um estado desejável.
-- =====================================================================

-- Guardas (triggers + funções)
drop trigger if exists aa_profiles_guard_ins on public.profiles;
drop trigger if exists aa_profiles_guard_upd on public.profiles;
drop trigger if exists aa_orders_guard_ins   on public.orders;
drop trigger if exists aa_orders_guard_upd   on public.orders;
drop trigger if exists aa_chat_guard_ins     on public.chat_messages;

drop function if exists public.profiles_guard_write();
drop function if exists public.kyc_retry();
drop function if exists public.orders_guard_write();
drop function if exists public.chat_guard_insert();

-- Chat: políticas originais
drop policy if exists chat_insert_participants on public.chat_messages;
create policy chat_insert_participants on public.chat_messages
  for insert
  with check (
    (auth.uid() = sender_id) and (
      (auth.uid() = user_id)
      or (auth.uid() in (select o.user_id   from public.orders o where o.id = chat_messages.order_id))
      or (auth.uid() in (select o.funder_id from public.orders o where o.id = chat_messages.order_id))
      or public.is_admin()
    )
  );
drop policy if exists "Permitir insercao para participantes" on public.chat_messages;
create policy "Permitir insercao para participantes" on public.chat_messages
  for insert to authenticated with check (auth.uid() = sender_id);

-- Comprovativos
drop policy if exists proofs_insert on public.payment_proofs;
create policy proofs_insert on public.payment_proofs
  for insert with check (auth.uid() = user_id);

-- Auditoria / notificações / alertas
drop policy if exists audit_logs_insert on public.audit_logs;
create policy audit_logs_insert on public.audit_logs for insert with check (true);

drop policy if exists notif_insert_admin_only on public.notifications;
create policy notif_insert_admin_or_system on public.notifications
  for insert with check (public.is_admin() or auth.uid() = user_id);

drop policy if exists alerts_insert_participants on public.admin_alerts;
create policy alerts_insert_participants on public.admin_alerts
  for insert
  with check (
    public.is_admin()
    or order_id is null
    or exists (select 1 from public.orders o
                where o.id = admin_alerts.order_id
                  and (o.user_id = auth.uid() or o.funder_id = auth.uid()))
  );

alter table public.admin_alerts drop constraint if exists admin_alerts_type_check;
alter table public.admin_alerts
  add constraint admin_alerts_type_check
  check (type = any (array['new_order','payment_received','kyc_pending','cancelled','credit_warning','recharge_pending']));

-- KYC: políticas originais (o utilizador volta a poder escrever na própria linha)
drop policy if exists kyc_insert on public.kyc_verifications;
create policy kyc_insert on public.kyc_verifications
  for insert with check (auth.uid() = user_id);

drop policy if exists kyc_update on public.kyc_verifications;
create policy kyc_update on public.kyc_verifications
  for update using (
    (auth.uid() = user_id)
    or exists (select 1 from public.admin_roles where admin_roles.user_id = auth.uid())
  );

-- KYC legado
drop policy if exists kyc_docs_update on public.kyc_documents;
create policy kyc_docs_update on public.kyc_documents
  for update using ((auth.uid() = user_id) or public.is_admin());

-- Permissões de execução e de tabela
grant execute on function public.handle_new_user()         to public;
grant execute on function public.notify_admin_on_order()   to public;
grant execute on function public.notify_admin_on_payment() to public;
grant execute on function public.advance_order_on_ocr()    to public;
grant execute on function public.check_kyc_before_order()  to public;
grant truncate, trigger, references on all tables in schema public to anon, authenticated;

-- Índice duplicado (apenas por fidelidade ao estado anterior)
create unique index if not exists kyc_verifications_user_id_uidx on public.kyc_verifications using btree (user_id);
