-- ── BRIDGE MARKET — Multi-Moeda ────────────────────────────────────────────
-- Suporte a USD, EUR, ZAR, BRL + MB WAY + motor cambial automático

-- 1. Adicionar currency às ordens
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'USD',
  ADD COLUMN IF NOT EXISTS currency_symbol TEXT DEFAULT '$',
  ADD COLUMN IF NOT EXISTS rate_eur_aoa NUMERIC,
  ADD COLUMN IF NOT EXISTS rate_brl_aoa NUMERIC,
  ADD COLUMN IF NOT EXISTS rate_zar_aoa NUMERIC;

-- 2. Adicionar currency à tabela exchange_rates
ALTER TABLE exchange_rates
  ADD COLUMN IF NOT EXISTS eur_rate NUMERIC DEFAULT 0,
  ADD COLUMN IF NOT EXISTS brl_rate NUMERIC DEFAULT 0,
  ADD COLUMN IF NOT EXISTS zar_rate NUMERIC DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_auto_sync TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS auto_sync_enabled BOOLEAN DEFAULT true;

-- 3. Tabela DICT para chaves de pagamento P2P por utilizador
CREATE TABLE IF NOT EXISTS payment_keys (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id      UUID REFERENCES profiles(id) ON DELETE CASCADE,
  key_type     TEXT NOT NULL, -- 'pix', 'mbway', 'iban', 'eft', 'mcx', 'rtm'
  currency     TEXT NOT NULL, -- 'BRL', 'EUR', 'ZAR', 'AOA', 'USD'
  key_value    TEXT NOT NULL, -- número, IBAN, email, etc.
  label        TEXT,          -- ex: "Meu Pix Principal"
  is_active    BOOLEAN DEFAULT true,
  created_at   TIMESTAMPTZ DEFAULT now()
);

-- 4. Índices para performance
CREATE INDEX IF NOT EXISTS idx_orders_currency ON orders(currency);
CREATE INDEX IF NOT EXISTS idx_payment_keys_user ON payment_keys(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_keys_type ON payment_keys(key_type, currency);

-- 5. RLS na tabela payment_keys
ALTER TABLE payment_keys ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "users_own_keys" ON payment_keys
  FOR ALL USING (user_id = auth.uid());

-- Comentários
COMMENT ON COLUMN orders.currency IS 'Moeda da transacção: USD, EUR, ZAR, BRL';
COMMENT ON TABLE payment_keys IS 'Chaves de pagamento P2P: Pix (BRL), MB WAY (EUR), IBAN, EFT (ZAR), MCX';
