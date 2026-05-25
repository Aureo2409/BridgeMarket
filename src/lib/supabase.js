import { createClient } from "@supabase/supabase-js";

// Tenta ler do .env; se não existir usa os valores directos como fallback
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "https://gexlmuclvadddhlbmgkl.supabase.co";

const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdleGxtdWNsdmFkZGRobGJtZ2tsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgwOTM2NjksImV4cCI6MjA5MzY2OTY2OX0.c4Bgf2C-QcTSsl_CzCvyBHzpFDmKVXVdQ0x34LywFTk";

export const sb = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export async function checkIsAdmin(userId) {
  // Verifica se o utilizador está na tabela admin_roles
  let id = userId;
  if (!id) {
    const { data: { session } } = await sb.auth.getSession();
    id = session?.user?.id;
  }
  if (!id) return false;
  const { data } = await sb.from("admin_roles").select("user_id").eq("user_id", id).maybeSingle();
  return !!data;
}

export async function fetchLatestRate() {
  const { data } = await sb
    .from("exchange_rates")
    .select("*")
    .order("fetched_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  return data ?? { base_rate: 1150, margin: 15, applied_rate: 1165 };
}

export async function fetchAdminConfig() {
  const { data } = await sb.from("admin_config").select("key,value");
  if (!data) return {};
  return Object.fromEntries(data.map(r => [r.key, r.value]));
}

export async function uploadProof(userId, orderId, file) {
  const ext = file.name.split(".").pop().toLowerCase();
  const path = `${userId}/${orderId}/${Date.now()}.${ext}`;

  const { error } = await sb.storage
    .from("payment-proofs")
    .upload(path, file, { cacheControl: "3600", contentType: file.type });

  if (error) throw error;

  const { data } = await sb.storage
    .from("payment-proofs")
    .createSignedUrl(path, 3600);

  return { path, signedUrl: data?.signedUrl ?? null };
}

export async function uploadKycDocument(userId, file, type) {
  const ext = file.name.split(".").pop().toLowerCase();
  const path = `${userId}/${type}_${Date.now()}.${ext}`;

  const { error } = await sb.storage
    .from("kyc-documents")
    .upload(path, file, { cacheControl: "3600", contentType: file.type });

  if (error) throw error;

  return { path };
}

export async function uploadAvatar(userId, file) {
  const ext = file.name.split(".").pop().toLowerCase();
  const path = `avatars/${userId}.${ext}`;

  const { error } = await sb.storage
    .from("payment-proofs")
    .upload(path, file, { cacheControl: "3600", contentType: file.type, upsert: true });

  if (error) throw error;

  const { data } = await sb.storage
    .from("payment-proofs")
    .createSignedUrl(path, 31536000); // 1 year signed url

  return { path, signedUrl: data?.signedUrl ?? null };
}

