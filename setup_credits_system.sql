-- ════════════════════════════════════════════════════════════════════════════
-- BRIDGE MARKET — Sistema de Créditos por Transacção
-- Substitui o modelo de subscrição semanal (500 Kz/semana) por créditos
-- pré-carregados: 1 crédito = 500 Kz = direito a 1 transacção.
-- Cada transacção concluída consome 1 crédito do comprador + 1 crédito do vendedor.
-- ════════════════════════════════════════════════════════════════════════════

-- 1. Carteira de créditos no perfil do utilizador
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS credits_balance   INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS credits_reserved  INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_spent_kz    INT DEFAULT 0;

-- 2. Tabela de recargas de créditos (pedidos de compra de créditos)
CREATE TABLE IF NOT EXISTS public.credit_recharges (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id       UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  package_id    TEXT NOT NULL,            -- 'starter' | 'standard' | 'pro' | 'business'
  amount_kz     INT NOT NULL,
  credits_added INT NOT NULL,
  proof_url     TEXT,
  status        TEXT DEFAULT 'pending_payment', -- pending_payment | confirmed | rejected
  confirmed_at  TIMESTAMPTZ,
  confirmed_by  UUID,
  rejection_reason TEXT,
  created_at    TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_recharges_user   ON public.credit_recharges(user_id);
CREATE INDEX IF NOT EXISTS idx_recharges_status ON public.credit_recharges(status);

-- 3. Log de movimentos de créditos (auditoria completa)
CREATE TABLE IF NOT EXISTS public.credit_transactions (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id       UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  order_id      UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  recharge_id   UUID REFERENCES public.credit_recharges(id) ON DELETE SET NULL,
  type          TEXT NOT NULL,   -- 'reserve' | 'debit' | 'refund' | 'recharge'
  amount        INT NOT NULL,    -- positivo = entrada, negativo = saída
  balance_after INT,
  created_at    TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_credit_tx_user  ON public.credit_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_tx_order ON public.credit_transactions(order_id);

-- 4. Colunas na tabela orders para rastrear consumo de créditos
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS buyer_credit_reserved   BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS seller_credit_reserved  BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS fee_debited_at           TIMESTAMPTZ;

-- 5. RLS — utilizador só vê as suas próprias recargas e movimentos
ALTER TABLE public.credit_recharges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users_view_own_recharges" ON public.credit_recharges;
CREATE POLICY "users_view_own_recharges" ON public.credit_recharges
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "users_create_own_recharges" ON public.credit_recharges;
CREATE POLICY "users_create_own_recharges" ON public.credit_recharges
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "users_view_own_credit_tx" ON public.credit_transactions;
CREATE POLICY "users_view_own_credit_tx" ON public.credit_transactions
  FOR SELECT USING (auth.uid() = user_id);

-- 6. Bucket de storage para comprovativos de recarga (reutiliza o mesmo padrão do KYC)
-- Executar manualmente no Supabase Dashboard se o bucket "access-proofs" ainda não existir:
-- INSERT INTO storage.buckets (id, name, public) VALUES ('access-proofs', 'access-proofs', false);

-- ════════════════════════════════════════════════════════════════════════════
-- NOTA DE MIGRAÇÃO: as colunas access_status / access_expires_at / access_proof_url
-- da tabela profiles deixam de ser usadas para bloqueio de acesso (sistema antigo
-- de subscrição semanal). Mantidas na tabela para não quebrar dados históricos,
-- mas a lógica de bloqueio agora usa exclusivamente credits_balance/credits_reserved.
-- ════════════════════════════════════════════════════════════════════════════
