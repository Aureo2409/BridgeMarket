-- ════════════════════════════════════════════════════════════════════════════
-- BRIDGE MARKET — Controlo do Manual de Utilização visto pelo utilizador
-- ════════════════════════════════════════════════════════════════════════════
-- Guarda se o utilizador já viu o manual de boas-vindas, para o mostrar
-- automaticamente apenas na primeira vez que entra na plataforma.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS manual_seen_at TIMESTAMPTZ;

-- Nada mais é necessário: se manual_seen_at for NULL, é a primeira vez do
-- utilizador e o manual aparece automaticamente. Depois disso, fica sempre
-- acessível através do botão de Ajuda no cabeçalho da plataforma.
