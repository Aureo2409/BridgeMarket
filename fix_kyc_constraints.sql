-- 0. Adiciona a coluna para guardar o motivo da rejeição
ALTER TABLE public.kyc_verifications ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- 1. Remove as restrições antigas das colunas
ALTER TABLE public.kyc_verifications DROP CONSTRAINT IF EXISTS kyc_verifications_liveness_status_check;
ALTER TABLE public.kyc_verifications DROP CONSTRAINT IF EXISTS kyc_verifications_ocr_status_check;

-- 2. Cria as novas restrições permitindo 'pending', 'passed' e 'rejected'
ALTER TABLE public.kyc_verifications ADD CONSTRAINT kyc_verifications_liveness_status_check CHECK (liveness_status IN ('pending', 'passed', 'rejected'));
ALTER TABLE public.kyc_verifications ADD CONSTRAINT kyc_verifications_ocr_status_check CHECK (ocr_status IN ('pending', 'passed', 'rejected'));