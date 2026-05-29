-- ── SCRIPT DE MIGRAÇÃO SQL PARA CONTROLO DE ACESSO E DESTINOS (FASE 1) ──
-- Executa este script no Supabase SQL Editor para atualizar a estrutura da BD.

-- 1. Adicionar colunas de controlo de acesso à tabela de perfis (profiles)
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS access_status TEXT DEFAULT 'inactive',
  ADD COLUMN IF NOT EXISTS access_expires_at TIMESTAMPTZ DEFAULT NULL;

-- 2. Limpar e recriar a constraint CHECK para garantir estados válidos
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_access_status_check;
ALTER TABLE public.profiles 
  ADD CONSTRAINT profiles_access_status_check 
  CHECK (access_status IN ('inactive', 'pending_payment', 'active', 'expiring_soon', 'expired'));

-- 3. Adicionar coluna para guardar múltiplos destinos estruturados de pagamento no perfil
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS payment_destinations JSONB DEFAULT '{}'::jsonb;

-- 4. Adicionar colunas para registar o destino acordado/selecionado na tabela de ordens (orders)
ALTER TABLE public.orders 
  ADD COLUMN IF NOT EXISTS selected_destination TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS selected_destination_account TEXT DEFAULT NULL;

-- Garantir que as colunas existentes de RLS na tabela profiles estão operacionais
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 5. Atualizar as políticas de RLS de perfis para permitir aos utilizadores autenticados lerem perfis alheios
-- (necessário para ver dados dos parceiros no chat/mercado)
DROP POLICY IF EXISTS "Permitir leitura pública de perfis" ON public.profiles;
CREATE POLICY "Permitir leitura pública de perfis" ON public.profiles
  FOR SELECT TO authenticated USING (true);
