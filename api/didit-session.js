// api/didit-session.js
// Vercel Serverless Function para criação instantânea de sessões da DIDIT v3

export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Tratar requisição OPTIONS (Preflight CORS)
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { user_id } = req.body;
  if (!user_id) {
    return res.status(400).json({ error: 'user_id é obrigatório.' });
  }

  const DIDIT_API_KEY = 'OFb8lJF-ShhMs-Gg28d5AZqQF2Dqt6uNDNtnPIR5z14';

  try {
    const response = await fetch('https://verification.didit.me/v3/session/', {
      method: 'POST',
      headers: {
        'x-api-key': DIDIT_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
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
