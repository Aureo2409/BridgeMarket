-- ─────────────────────────────────────────────────────────────────────────────
-- Bridge Market — Migração BNA Compliance
-- Adiciona colunas exigidas pela Lei Cambial Angola e Avisos do BNA
-- Executar no Supabase Dashboard → SQL Editor
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. MOTIVO CAMBIAL — exigência Lei Cambial e Avisos BNA
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS exchange_reason        TEXT DEFAULT 'OU',
  ADD COLUMN IF NOT EXISTS exchange_reason_detail TEXT;

-- Validação: apenas códigos permitidos pelo BNA
ALTER TABLE public.orders
  DROP CONSTRAINT IF EXISTS orders_exchange_reason_check;
ALTER TABLE public.orders
  ADD CONSTRAINT orders_exchange_reason_check
  CHECK (exchange_reason IN ('IM','SP','RF','PS','VI','IN','OU'));

-- 2. ONBOARDING DO CHAT — registo de confirmação de segurança
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS chat_onboarding_buyer_at    TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS chat_onboarding_seller_at   TIMESTAMPTZ;

-- 3. LOGS DE AUDITORIA UIF — tabela dedicada
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id        UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  user_id         UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action          TEXT NOT NULL,
  details         JSONB DEFAULT '{}'::jsonb,
  ip_address      TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para queries rápidas UIF
CREATE INDEX IF NOT EXISTS idx_audit_logs_order    ON public.audit_logs (order_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user     ON public.audit_logs (user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created  ON public.audit_logs (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action   ON public.audit_logs (action);

-- RLS na tabela de auditoria — só admin tem acesso
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "audit_admin_only" ON public.audit_logs
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- 4. RELATÓRIO UIF — view para exportação
CREATE OR REPLACE VIEW public.uif_report AS
SELECT
  o.id                    AS transaction_id,
  o.order_ref             AS reference,
  o.created_at            AS date,
  o.amount_usd,
  o.amount_aoa,
  o.rate_applied,
  o.destination,
  o.destination_account,
  o.exchange_reason,
  o.exchange_reason_detail,
  o.status,
  o.side,
  -- Comprador
  pb.full_name            AS buyer_name,
  pb.phone                AS buyer_phone,
  -- Vendedor
  ps.full_name            AS seller_name,
  ps.phone                AS seller_phone,
  -- Timestamps
  o.chat_onboarding_buyer_at,
  o.chat_onboarding_seller_at
FROM public.orders o
LEFT JOIN public.profiles pb ON pb.id = o.user_id
LEFT JOIN public.profiles ps ON ps.id = o.funder_id
WHERE o.status = 'completed'
ORDER BY o.created_at DESC;

-- 5. ÍNDICE para pesquisa por motivo cambial (relatórios UIF)
CREATE INDEX IF NOT EXISTS idx_orders_exchange_reason
  ON public.orders (exchange_reason, created_at DESC);

COMMENT ON COLUMN public.orders.exchange_reason IS
  'Motivo cambial obrigatório - Lei Cambial Angola e Avisos BNA: IM=Importação, SP=Serviços/Propinas, RF=Remessa familiar, PS=Prestação serviços, VI=Viagem, IN=Investimento, OU=Outro';

COMMENT ON COLUMN public.orders.exchange_reason_detail IS
  'Descrição adicional obrigatória quando exchange_reason = OU';
