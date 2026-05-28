import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || "https://gexlmuclvadddhlbmgkl.supabase.co";
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdleGxtdWNsdmFkZGRobGJtZ2tsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgwOTM2NjksImV4cCI6MjA5MzY2OTY2OX0.c4Bgf2C-QcTSsl_CzCvyBHzpFDmKVXVdQ0x34LywFTk";

const sb = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  // Tratar requisição OPTIONS (Preflight CORS)
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // 1. Validar autenticação JWT Supabase do utilizador
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Pedido não autorizado. Cabeçalho de autorização em falta ou inválido.' });
  }

  const token = authHeader.split(' ')[1];
  const { data: { user }, error: authError } = await sb.auth.getUser(token);
  
  if (authError || !user) {
    console.error('❌ Falha na autenticação JWT:', authError?.message);
    return res.status(401).json({ error: 'Sessão inválida ou expirada. Inicie sessão novamente.' });
  }

  const { user_id } = req.body;
  if (!user_id) {
    return res.status(400).json({ error: 'user_id é obrigatório.' });
  }

  // Garantir que o user_id do corpo do pedido coincide com o utilizador autenticado
  if (user_id !== user.id) {
    return res.status(403).json({ error: 'Acesso proibido. Não pode criar uma sessão de verificação para outro utilizador.' });
  }

  const DIDIT_API_KEY = process.env.DIDIT_API_KEY;
  if (!DIDIT_API_KEY) {
    console.error('❌ DIDIT_API_KEY em falta nas variáveis de ambiente!');
    return res.status(500).json({ error: 'O servidor do DIDIt está em falta de configuração no painel principal.' });
  }

  try {
    const response = await fetch('https://verification.didit.me/v3/session/', {
      method: 'POST',
      headers: {
        'x-api-key': DIDIT_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        workflow_id: '5b5b0273-9a79-4741-af8a-be62d770dc28',
        vendor_data: user_id,
        callback: 'https://bridge-market-delta.vercel.app'
      })
    });

    const text = await response.text();
    let data;
    try { data = JSON.parse(text); } catch { data = {}; }

    if (!response.ok) {
      console.error('❌ DIDIt API Error:', response.status, text);
      return res.status(502).json({ error: 'Falha ao criar sessão DIDIt: ' + (data.message || text) });
    }

    const session_url = data.url || data.session_url || data.verification_url;
    if (!session_url) {
      console.error('❌ DIDIt sem URL na resposta:', data);
      return res.status(502).json({ error: 'DIDIt não devolveu URL de verificação.' });
    }

    return res.status(200).json({ session_url });
  } catch (error) {
    console.error('Erro na sessão DIDIt:', error);
    return res.status(500).json({ error: 'Falha ao conectar com o servidor DIDIt.' });
  }
}
