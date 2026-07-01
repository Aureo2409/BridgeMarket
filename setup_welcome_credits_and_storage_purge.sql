-- ════════════════════════════════════════════════════════════════════════════
-- BRIDGE MARKET — Créditos de Boas-Vindas e Purga de Biometria Cancelada
-- ════════════════════════════════════════════════════════════════════════════

-- 1. Alterar o padrão de créditos na tabela profiles para 2
ALTER TABLE public.profiles 
  ALTER COLUMN credits_balance SET DEFAULT 2;

-- 2. Oferecer 2 créditos aos utilizadores existentes que atualmente têm 0
UPDATE public.profiles 
  SET credits_balance = 2 
  WHERE credits_balance = 0;

-- 3. Função de limpeza de vídeos biométricos para ordens CANCELADAS
-- Desta forma, preservamos a biometria de ordens concluídas (completeds)
-- como prova de identidade em caso de burla pós-transação, mas libertamos
-- o storage de ordens que nunca chegaram a acontecer.
CREATE OR REPLACE FUNCTION public.delete_cancelled_biometric_video()
RETURNS TRIGGER AS $$
BEGIN
  -- Se o status mudou para 'cancelled' e havia um vídeo biométrico associado
  IF NEW.status = 'cancelled' AND OLD.biometric_video_url IS NOT NULL THEN
    -- Apaga o registo correspondente na tabela de objectos do Supabase Storage
    DELETE FROM storage.objects 
    WHERE bucket_id = 'transação-biometria' 
      AND name = OLD.biometric_video_url;
      
    -- Limpa a referência ao url na ordem
    NEW.biometric_video_url := NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Criar o Trigger de Auditoria/Purga
DROP TRIGGER IF EXISTS trigger_delete_cancelled_biometric ON public.orders;

CREATE TRIGGER trigger_delete_cancelled_biometric
  BEFORE UPDATE OF status ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.delete_cancelled_biometric_video();
