-- ============================================================
-- Bridge Marketplace — Script de Configuração de RLS e Limites
-- ============================================================

-- 1. Suporte a contagem de cancelamentos e bloqueios na tabela profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS cancelled_count INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_cancelled_at TIMESTAMPTZ;

-- 2. Suporte a comprovativo obrigatório e avaliações na tabela orders
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS proof_uploaded BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS buyer_rating INT,
  ADD COLUMN IF NOT EXISTS seller_rating INT,
  ADD COLUMN IF NOT EXISTS rating_done BOOLEAN DEFAULT false;

-- 3. Ativar Row Level Security (RLS) nas tabelas
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kyc_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_proofs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exchange_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- 4. Definir Políticas de Segurança RLS (Row Level Security)

-- Perfis (profiles)
DROP POLICY IF EXISTS "Permitir leitura de perfis por autenticados" ON public.profiles;
CREATE POLICY "Permitir leitura de perfis por autenticados" ON public.profiles
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Permitir atualização do próprio perfil" ON public.profiles;
CREATE POLICY "Permitir atualização do próprio perfil" ON public.profiles
  FOR UPDATE TO authenticated USING (auth.uid() = id);

-- Pedidos (orders)
DROP POLICY IF EXISTS "Permitir leitura de pedidos relevantes" ON public.orders;
CREATE POLICY "Permitir leitura de pedidos relevantes" ON public.orders
  FOR SELECT TO authenticated USING (
    user_id = auth.uid() OR 
    buyer_id = auth.uid() OR
    status = 'pending'
  );

DROP POLICY IF EXISTS "Permitir inserção de pedidos pelo próprio" ON public.orders;
CREATE POLICY "Permitir inserção de pedidos pelo próprio" ON public.orders
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Permitir atualização por partes envolvidas" ON public.orders;
CREATE POLICY "Permitir atualização por partes envolvidas" ON public.orders
  FOR UPDATE TO authenticated USING (
    user_id = auth.uid() OR 
    buyer_id = auth.uid()
  );

-- Verificações KYC (kyc_verifications)
DROP POLICY IF EXISTS "Permitir controlo total do KYC pelo próprio" ON public.kyc_verifications;
CREATE POLICY "Permitir controlo total do KYC pelo próprio" ON public.kyc_verifications
  FOR ALL TO authenticated USING (user_id = auth.uid());

-- Comprovativos de pagamento (payment_proofs)
DROP POLICY IF EXISTS "Permitir leitura de comprovativos por envolvidos" ON public.payment_proofs;
CREATE POLICY "Permitir leitura de comprovativos por envolvidos" ON public.payment_proofs
  FOR SELECT TO authenticated USING (
    user_id = auth.uid() OR
    order_id IN (
      SELECT id FROM public.orders WHERE user_id = auth.uid() OR buyer_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Permitir inserção de comprovativos pelo próprio" ON public.payment_proofs;
CREATE POLICY "Permitir inserção de comprovativos pelo próprio" ON public.payment_proofs
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

-- Mensagens de chat (chat_messages)
DROP POLICY IF EXISTS "Permitir leitura de mensagens por envolvidos na ordem" ON public.chat_messages;
CREATE POLICY "Permitir leitura de mensagens por envolvidos na ordem" ON public.chat_messages
  FOR SELECT TO authenticated USING (
    order_id IN (
      SELECT id FROM public.orders WHERE user_id = auth.uid() OR buyer_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Permitir inserção de mensagens por envolvidos na ordem" ON public.chat_messages;
CREATE POLICY "Permitir inserção de mensagens por envolvidos na ordem" ON public.chat_messages
  FOR INSERT TO authenticated WITH CHECK (
    sender_id = auth.uid() AND
    order_id IN (
      SELECT id FROM public.orders WHERE user_id = auth.uid() OR buyer_id = auth.uid()
    )
  );

-- Tabelas administrativas e de suporte

-- admin_roles
DROP POLICY IF EXISTS "Permitir leitura da própria role" ON public.admin_roles;
CREATE POLICY "Permitir leitura da própria role" ON public.admin_roles
  FOR SELECT TO authenticated USING (user_id = auth.uid());

-- exchange_rates
DROP POLICY IF EXISTS "Permitir leitura de taxas por autenticados" ON public.exchange_rates;
CREATE POLICY "Permitir leitura de taxas por autenticados" ON public.exchange_rates
  FOR SELECT TO authenticated USING (true);

-- admin_config
DROP POLICY IF EXISTS "Permitir leitura de configurações públicas" ON public.admin_config;
CREATE POLICY "Permitir leitura de configurações públicas" ON public.admin_config
  FOR SELECT TO authenticated USING (true);
