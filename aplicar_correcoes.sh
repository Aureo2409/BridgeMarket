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
VITE_SUPABASE_URL=COLOQUE_AQUI_A_SUA_URL
VITE_SUPABASE_ANON_KEY=COLOQUE_AQUI_A_SUA_ANON_KEY
ENVEOF
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
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  -- Apaga os ficheiros/comprovativos para o Postgres não dar erro de foreign key
  DELETE FROM storage.objects WHERE owner = auth.uid();

  DELETE FROM public.admin_alerts WHERE order_id IN (SELECT id FROM public.orders WHERE user_id = auth.uid());
  DELETE FROM public.payment_proofs WHERE user_id = auth.uid();
  DELETE FROM public.orders WHERE user_id = auth.uid();
  DELETE FROM public.kyc_verifications WHERE user_id = auth.uid();

  DELETE FROM public.profiles WHERE id = auth.uid();
  DELETE FROM auth.users WHERE id = auth.uid();
END;
$$;
SQLEOF
echo "✅ Ficheiro setup_delete_user.sql gerado"

# ── 8. Gerar ficheiro para Realtime do Bot ────────────────────
cat > "$ROOT/setup_realtime_bot.sql" << 'SQLEOF'
ALTER TABLE public.kyc_verifications REPLICA IDENTITY FULL;
ALTER TABLE public.orders REPLICA IDENTITY FULL;
SQLEOF
echo "✅ Ficheiro setup_realtime_bot.sql gerado"

# Os ficheiros React agora são geridos diretamente no código-fonte para não sobrescrever a versão moderna do painel.
echo "✅ Ficheiros React mantidos intactos."

# ── 5. Git commit e push ──────────────────────────────────────
echo ""
echo "📦 A fazer commit e push para o GitHub..."
git add .
git commit -m "fix: corrigir fallback de env vars do Supabase no Vercel para evitar ecrã branco"
git push origin master

echo ""
echo "🎉 Concluído! O Vercel vai redeployar automaticamente em ~30 segundos."
echo "🌐 URL: https://bridge-market-delta.vercel.app"
