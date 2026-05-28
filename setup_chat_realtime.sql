-- ── AVISO: EXECUTA ESTE SCRIPT NO EDITOR SQL DO TEU PAINEL SUPABASE ──

-- 1. Ativar o Realtime para a tabela chat_messages (Se der erro 42710, significa que já está ativo, pode ignorar esta linha)
-- ALTER PUBLICATION supabase_realtime ADD TABLE chat_messages;

-- 2. Limpar quaisquer políticas de segurança RLS anteriores que possam estar em conflito
DROP POLICY IF EXISTS "Permitir tudo" ON public.chat_messages;
DROP POLICY IF EXISTS "Permitir leitura para participantes" ON public.chat_messages;
DROP POLICY IF EXISTS "Permitir insercao para participantes" ON public.chat_messages;

-- 3. Garantir que a Segurança de Nível de Linha (RLS) está ativa na tabela
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- 4. Criar política de Leitura (SELECT)
-- (Permite ler mensagens apenas se o utilizador for o criador do pedido, o parceiro P2P, o remetente, ou um administrador)
CREATE POLICY "Permitir leitura para participantes" ON public.chat_messages
FOR SELECT TO authenticated
USING (
  auth.uid() = sender_id OR 
  auth.uid() = user_id OR
  auth.uid() IN (SELECT user_id FROM public.orders WHERE id = order_id) OR
  auth.uid() IN (SELECT funder_id FROM public.orders WHERE id = order_id) OR
  EXISTS (SELECT 1 FROM public.admin_roles WHERE user_id = auth.uid())
);

-- 5. Criar política de Escrita (INSERT)
-- (Garante que um utilizador autenticado só pode enviar mensagens usando o seu próprio sender_id, impedindo falsificação)
CREATE POLICY "Permitir insercao para participantes" ON public.chat_messages
FOR INSERT TO authenticated
WITH CHECK (
  auth.uid() = sender_id
);

-- 6. Adicionar as colunas necessárias para suporte a biometria P2P mútua na tabela de ordens (se não existirem)
ALTER TABLE public.orders 
  ADD COLUMN IF NOT EXISTS biometric_video_url TEXT,
  ADD COLUMN IF NOT EXISTS biometric_verified_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS biometric_phrase TEXT;
