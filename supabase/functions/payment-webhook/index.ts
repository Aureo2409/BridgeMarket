import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-webhook-secret",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // ── 1. Validação de Segurança do Webhook ──
    // CRÍTICO: esta validação é OBRIGATÓRIA, não opcional. Se
    // PAYMENT_WEBHOOK_SECRET não estiver configurada no servidor, a função
    // recusa TODOS os pedidos — não os aceita sem verificação. Sem isto,
    // e como esta função tem verify_jwt=false (chamável por qualquer pessoa
    // na internet, sem conta), qualquer um poderia marcar qualquer
    // transacção como paga sem nunca ter transferido dinheiro real.
    const expectedSecret = Deno.env.get("PAYMENT_WEBHOOK_SECRET");
    if (!expectedSecret) {
      console.error("PAYMENT_WEBHOOK_SECRET não está configurado no servidor — a recusar pedido por segurança.");
      return new Response(
        JSON.stringify({ success: false, error: "Webhook não configurado — contacte o suporte." }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 503 }
      );
    }

    const webhookSecret = req.headers.get("x-webhook-secret") ||
                          req.headers.get("authorization")?.replace("Bearer ", "").trim();

    if (webhookSecret !== expectedSecret) {
      console.warn("Tentativa de acesso ao Webhook sem secret válido.");
      return new Response(
        JSON.stringify({ success: false, error: "Acesso não autorizado ao Webhook" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 401 }
      );
    }

    const body = await req.json();
    console.log("Notificação de pagamento recebida no Webhook:", body);

    const transactionId = body.transactionId || body.transaction_id || body.orderId || body.order_id || body.id;
    const rawStatus = (body.status || "").toUpperCase();
    const provider = body.provider || "gateway";

    // Inicializa o cliente do Supabase com privilégios administrativos
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Se a transação foi paga com sucesso no provedor (SIBS, Binance, RedotPay, Airtm, etc.)
    if (["PAID", "SUCCESS", "COMPLETED", "SETTLED"].includes(rawStatus)) {
      if (transactionId) {
        // Tenta atualizar por id da ordem ou por transaction_id / order_ref
        const { error } = await supabaseAdmin
          .from("orders")
          .update({ 
            status: "completed", 
            updated_at: new Date().toISOString() 
          })
          .or(`id.eq.${transactionId},order_ref.eq.${transactionId}`);

        if (error) {
          console.error("Erro ao atualizar status da ordem:", error);
        }
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Webhook processado com sucesso!",
        received: { transactionId, status: rawStatus, provider }
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );

  } catch (error) {
    console.error("Erro no processamento do Webhook:", error.message);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
    );
  }
});
