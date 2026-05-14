CREATE OR REPLACE FUNCTION delete_user()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  DELETE FROM public.admin_alerts WHERE order_id IN (SELECT id FROM public.orders WHERE user_id = auth.uid());
  DELETE FROM public.payment_proofs WHERE user_id = auth.uid();
  DELETE FROM public.orders WHERE user_id = auth.uid();
  DELETE FROM public.kyc_verifications WHERE user_id = auth.uid();

  DELETE FROM public.profiles WHERE id = auth.uid();
  DELETE FROM auth.users WHERE id = auth.uid();
END;
$$;
