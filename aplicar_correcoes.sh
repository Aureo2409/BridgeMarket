#!/bin/bash
# ============================================================
# Bridge Marketplace — Script de correcções automáticas
# Corre este script NA RAIZ do teu repositório BridgeMarket
# Uso: bash aplicar_correcoes.sh
# ============================================================

set -e
echo "🔧 A aplicar correcções ao Bridge Marketplace..."

# ── 1. Detectar onde está a pasta src ────────────────────────
if [ -d "bridge-marketplace/src" ]; then
  ROOT="bridge-marketplace"
elif [ -d "src" ]; then
  ROOT="."
else
  echo "❌ Não encontrei a pasta src. Corre este script na raiz do repositório."
  exit 1
fi

echo "📁 Pasta raiz detectada: $ROOT"

# ── 4. Garantir que existe .env com as chaves ─────────────────
ENV_FILE="$ROOT/../.env"
if [ ! -f "$ENV_FILE" ] && [ ! -f ".env" ]; then
  cat > .env << 'ENVEOF'
VITE_SUPABASE_URL=https://gexlmuclvadddhlbmgkl.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdleGxtdWNsdmFkZGRobGJtZ2tsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgwOTM2NjksImV4cCI6MjA5MzY2OTY2OX0.c4Bgf2C-QcTSsl_CzCvyBHzpFDmKVXVdQ0x34LywFTk
ENVEOF
  echo "✅ .env criado"
  echo "✅ .env criado"
fi

# ── 6. Gerar ficheiro de correcção SQL ────────────────────────
cat > "$ROOT/fix_kyc_constraints.sql" << 'SQLEOF'
-- 0. Adiciona a coluna para guardar o motivo da rejeição
ALTER TABLE public.kyc_verifications ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

ALTER TABLE public.kyc_verifications DROP CONSTRAINT IF EXISTS kyc_verifications_liveness_status_check;
ALTER TABLE public.kyc_verifications DROP CONSTRAINT IF EXISTS kyc_verifications_ocr_status_check;

ALTER TABLE public.kyc_verifications ADD CONSTRAINT kyc_verifications_liveness_status_check CHECK (liveness_status IN ('pending', 'passed', 'rejected'));
ALTER TABLE public.kyc_verifications ADD CONSTRAINT kyc_verifications_ocr_status_check CHECK (ocr_status IN ('pending', 'passed', 'rejected'));
SQLEOF
echo "✅ Ficheiro fix_kyc_constraints.sql gerado"

# ── 7. Gerar ficheiro SQL para Apagar Conta ───────────────────
cat > "$ROOT/setup_delete_user.sql" << 'SQLEOF'
CREATE OR REPLACE FUNCTION delete_user()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM public.profiles WHERE id = auth.uid();
  DELETE FROM auth.users WHERE id = auth.uid();
END;
$$;
SQLEOF
echo "✅ Ficheiro setup_delete_user.sql gerado"

# Os ficheiros React agora são geridos diretamente no código-fonte para não sobrescrever a versão moderna do painel.
echo "✅ Ficheiros React mantidos intactos."

# ── 5. Git commit e push ──────────────────────────────────────
echo ""
echo "📦 A fazer commit e push para o GitHub..."
git add .
git commit -m "fix: corrigir hooks em map e fallback env vars"
git push origin master

echo ""
echo "🎉 Concluído! O Vercel vai redeployar automaticamente em ~30 segundos."
echo "🌐 URL: https://bridge-market-delta.vercel.app"
