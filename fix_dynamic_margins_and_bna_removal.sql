-- ─────────────────────────────────────────────────────────────────────────────
-- Bridge Market — Migração: Margens Dinâmicas (±10, ±20, ±30 Kz) & Remoção BNA
-- Executar no Supabase Dashboard → SQL Editor
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. Adicionar colunas de margem dinâmica e taxa final à tabela orders
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS selected_margin NUMERIC DEFAULT 0,
  ADD COLUMN IF NOT EXISTS final_exchange_rate NUMERIC;

-- 2. Atualizar registos existentes para preencher final_exchange_rate com rate_applied caso esteja nulo
UPDATE public.orders
SET final_exchange_rate = rate_applied
WHERE final_exchange_rate IS NULL AND rate_applied IS NOT NULL;

-- 3. Inserir ou atualizar limites de margem na tabela admin_config
INSERT INTO public.admin_config (key, value)
VALUES 
  ('max_margin_step_1', '10'),
  ('max_margin_step_2', '20'),
  ('max_margin_step_3', '30')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- 4. Remover restrição de verificação do motivo cambial (regras do BNA eliminadas)
ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_exchange_reason_check;

-- 5. Tornar exchange_reason opcional
ALTER TABLE public.orders ALTER COLUMN exchange_reason DROP NOT NULL;

-- 6. Índices para otimizar a ordenação por taxa final no Livro de Ordens
CREATE INDEX IF NOT EXISTS idx_orders_final_rate ON public.orders (final_exchange_rate, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_currency_final_rate ON public.orders (currency, final_exchange_rate, created_at DESC);
