-- =====================================================================
-- Bridge Market — correcções de compatibilidade entre código e base de dados
-- Aplicada em produção a 2026-11-10 (directamente no SQL Editor) e registada aqui
-- para que o repositório volte a ser a fonte de verdade. 100% idempotente.
--
-- O que corrige:
--  1. Chat P2P: o site grava sender_role = 'partner' mas a base só aceitava
--     'client' e 'admin' → a contraparte NUNCA conseguia escrever no chat.
--  2. Alertas do admin: o aviso 'credit_warning' e o novo 'recharge_pending'
--     eram rejeitados pelo CHECK de admin_alerts.type.
--  3. KYC (DIDIT): bot.js grava document_url / selfie_url em kyc_verifications,
--     mas essas colunas não existiam → cada upsert falhava em silêncio e a
--     verificação nunca chegava a ser registada. O provider 'didit' também
--     não era aceite pelo CHECK.
--  4. Bucket de vídeos biométricos: passa a privado, limitado a 25 MB e só
--     webm/mp4.
-- =====================================================================

-- 1) Chat: permitir o papel 'partner'
alter table public.chat_messages drop constraint if exists chat_messages_sender_role_check;
alter table public.chat_messages
  add constraint chat_messages_sender_role_check
  check (sender_role = any (array['client'::text, 'partner'::text, 'admin'::text]));

-- 2) Alertas do admin: novos tipos
alter table public.admin_alerts drop constraint if exists admin_alerts_type_check;
alter table public.admin_alerts
  add constraint admin_alerts_type_check
  check (type = any (array['new_order','payment_received','kyc_pending','cancelled','credit_warning','recharge_pending']));

-- 3) KYC: colunas que o bot (DIDIT) já escreve + provider 'didit'
alter table public.kyc_verifications
  add column if not exists document_url text,
  add column if not exists selfie_url   text;

alter table public.kyc_verifications drop constraint if exists kyc_verifications_provider_check;
alter table public.kyc_verifications
  add constraint kyc_verifications_provider_check
  check (provider = any (array['internal','sumsub','onfido','didit']));

-- 4) Bucket dos vídeos biométricos: privado, 25 MB, só vídeo
update storage.buckets
   set public = false,
       file_size_limit = 26214400,
       allowed_mime_types = array['video/webm','video/mp4']
 where id = 'transaction-biometrics';
