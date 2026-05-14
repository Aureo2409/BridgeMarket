-- Cria a tabela temporária para verificar números
CREATE TABLE IF NOT EXISTS public.whatsapp_checks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Configura as políticas de segurança (Permite à aplicação web e ao bot ler/escrever livremente)
ALTER TABLE public.whatsapp_checks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Permitir tudo" ON public.whatsapp_checks FOR ALL USING (true) WITH CHECK (true);