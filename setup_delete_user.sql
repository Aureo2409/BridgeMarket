CREATE OR REPLACE FUNCTION delete_user()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  -- 1. Remove primeiro todas as dependências do utilizador (Filhos)
  DELETE FROM public.admin_alerts WHERE order_id IN (SELECT id FROM public.orders WHERE user_id = auth.uid());
  DELETE FROM public.payment_proofs WHERE user_id = auth.uid();
  DELETE FROM public.orders WHERE user_id = auth.uid();
  DELETE FROM public.kyc_verifications WHERE user_id = auth.uid();

  -- 2. Apaga os dados públicos do perfil (Mãe)
  DELETE FROM public.profiles WHERE id = auth.uid();
  -- 3. Apaga a conta de autenticação (Login)
  DELETE FROM auth.users WHERE id = auth.uid();
END;
$$;