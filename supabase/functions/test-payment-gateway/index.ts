import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { provider } = await req.json();

    // Aqui usamos os tokens/certificados configurados nas variáveis do Supabase
    const apiKey = Deno.env.get(`${provider.toUpperCase()}_API_KEY`);

    // Simulação de resposta da Sandbox Visa/Mastercard
    const mockResponse = {
      success: true,
      provider,
      status: "CONNECTED",
      message: `Conexão Sandbox com a API do ${provider.toUpperCase()} estabelecida com sucesso!`,
      timestamp: new Date().toISOString(),
    };

    return new Response(JSON.stringify(mockResponse), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
