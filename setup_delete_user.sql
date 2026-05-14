CREATE OR REPLACE FUNCTION delete_user()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Apaga os dados públicos do perfil
  DELETE FROM public.profiles WHERE id = auth.uid();
  -- Apaga a conta de autenticação (Login)
  DELETE FROM auth.users WHERE id = auth.uid();
END;
$$;