-- ─────────────────────────────────────────────────────────────────────────────
-- Bridge Market — Fix: Corrigir constraints inválidas na tabela orders
-- Problema: orders_payment_method_check e orders_destination_check têm
--           valores desactualizados que bloqueiam a criação de pedidos.
-- Executar no Supabase Dashboard → SQL Editor
-- ─────────────────────────────────────────────────────────────────────────────

-- ── 1. FIX: orders_payment_method_check ─────────────────────────────────────
-- Problema: só aceitava 'multicaixa_express' e 'transferencia'
-- Fix: aceitar todos os bancos angolanos suportados pela app
ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_payment_method_check;
ALTER TABLE public.orders
  ADD CONSTRAINT orders_payment_method_check
  CHECK (payment_method = ANY (ARRAY[
    'bai', 'bfa', 'bic', 'atlantico', 'sba', 'sol',
    'bpc', 'bci', 'keve', 'yetu', 'bni', 'economico',
    'cga', 'express', 'multicaixa_express', 'transferencia'
  ]));

-- ── 2. FIX: orders_destination_check ─────────────────────────────────────────
-- Problema: só aceitava 'redotpay', 'airtm', 'binance', 'visa'
-- Fix: aceitar todos os destinos de pagamento suportados pela app
ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_destination_check;
ALTER TABLE public.orders
  ADD CONSTRAINT orders_destination_check
  CHECK (destination = ANY (ARRAY[
    'visa_virtual', 'mastercard', 'paypal', 'wise',
    'airtm', 'redotpay', 'binance',
    'iban_eu', 'iban_us', 'mbway', 'pix', 'eft_zar'
  ]));

-- ── 3. Garantir colunas necessárias existem ───────────────────────────────────
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'bai',
  ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'USD',
  ADD COLUMN IF NOT EXISTS currency_symbol TEXT DEFAULT '$',
  ADD COLUMN IF NOT EXISTS side TEXT DEFAULT 'buy',
  ADD COLUMN IF NOT EXISTS exchange_reason TEXT DEFAULT 'OU',
  ADD COLUMN IF NOT EXISTS exchange_reason_detail TEXT;

-- ── 4. Corrigir registos existentes com valores inválidos ─────────────────────
UPDATE public.orders SET payment_method = 'bai'  WHERE payment_method IS NULL;
UPDATE public.orders SET exchange_reason = 'OU'  WHERE exchange_reason IS NULL;
UPDATE public.orders SET currency = 'USD'         WHERE currency IS NULL;
UPDATE public.orders SET currency_symbol = '$'    WHERE currency_symbol IS NULL;
UPDATE public.orders SET side = 'buy'             WHERE side IS NULL;

-- ── 5. Verificação final ──────────────────────────────────────────────────────
SELECT conname AS constraint_name, pg_get_constraintdef(oid) AS constraint_def
FROM pg_constraint
WHERE conrelid = 'public.orders'::regclass AND contype = 'c'
ORDER BY conname;
