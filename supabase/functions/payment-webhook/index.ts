import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-webhook-secret",
};

// Estados da ordem que já representam um desfecho final — uma vez aqui,
// o webhook nunca deve voltar a mexer na ordem, mesmo que receba uma
// notificação de pagamento (ex: chamada duplicada do fornecedor, ou uma
// notificação que chega depois de o utilizador já ter cancelado).
const FINAL_STATES = ["completed", "cancelled"];

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  // Cliente admin disponível em todo o handler — também usado para
  // registar tentativas rejeitadas no log de auditoria.
  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  async function logAttempt(outcome, { transactionId = null, provider = null, rawStatus = null, orderId = null, payload = null } = {}) {
    try {
      await supabaseAdmin.from("payment_webhook_log").insert({
        transaction_id: transactionId,
        provider,
        raw_status: rawStatus,
        outcome,
        order_id_matched: orderId,
        payload,
      });
    } catch (logErr) {
      // Nunca deixar uma falha de logging impedir a resposta ao fornecedor —
      // mas registar no console do servidor para não passar despercebido.
      console.error("Falha ao escrever payment_webhook_log:", logErr.message);
    }
  }

  try {
    // ── 1. Validação de Segurança do Webhook ──
    // Obrigatória, não opcional — ver histórico do commit anterior para o
    // porquê. Sem PAYMENT_WEBHOOK_SECRET configurado, recusa tudo.
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
      await logAttempt("rejected_unauthorized");
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
    const isPaidStatus = ["PAID", "SUCCESS", "COMPLETED", "SETTLED"].includes(rawStatus);

    if (!transactionId) {
      await logAttempt("order_not_found", { provider, rawStatus, payload: body });
      return new Response(
        JSON.stringify({ success: false, error: "Pedido sem identificador de transacção (transactionId)." }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    if (!isPaidStatus) {
      // Estado que não representa pagamento confirmado (ex: PENDING, FAILED)
      // — registado para auditoria, mas não altera nada na ordem.
      await logAttempt("stale_status_ignored", { transactionId, provider, rawStatus, payload: body });
      return new Response(
        JSON.stringify({ success: true, message: "Estado recebido e registado; nenhuma acção necessária.", received: { transactionId, status: rawStatus, provider } }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    // ── 2. Localizar a ordem de forma determinística ──
    // .maybeSingle() garante que, se o .or() corresponder a mais do que uma
    // linha (o que não devia acontecer, mas não era verificado antes), a
    // função falha de forma explícita em vez de actualizar silenciosamente
    // múltiplas ordens com o identificador errado.
    const { data: existingOrder, error: fetchError } = await supabaseAdmin
      .from("orders")
      .select("id, status, gateway_payment_confirmed_at")
      .or(`id.eq.${transactionId},order_ref.eq.${transactionId}`)
      .maybeSingle();

    if (fetchError) {
      console.error("Erro ao localizar a ordem (possível correspondência ambígua):", fetchError.message);
      await logAttempt("order_not_found", { transactionId, provider, rawStatus, payload: body });
      return new Response(
        JSON.stringify({ success: false, error: "Não foi possível identificar a ordem de forma inequívoca." }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 409 }
      );
    }

    if (!existingOrder) {
      await logAttempt("order_not_found", { transactionId, provider, rawStatus, payload: body });
      return new Response(
        JSON.stringify({ success: false, error: "Nenhuma ordem encontrada para este identificador." }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 404 }
      );
    }

    // ── 3. Idempotência ──
    // Se esta ordem já recebeu uma confirmação de pagamento do gateway
    // antes, esta é uma chamada duplicada (comum em sistemas de pagamento
    // reais, que reenviam notificações até receberem 200 OK). Respondemos
    // sucesso ao fornecedor (para ele parar de reenviar), mas não repetimos
    // nenhum efeito sobre a ordem.
    if (existingOrder.gateway_payment_confirmed_at) {
      await logAttempt("duplicate_ignored", { transactionId, provider, rawStatus, orderId: existingOrder.id, payload: body });
      return new Response(
        JSON.stringify({ success: true, message: "Pagamento já tinha sido confirmado anteriormente — chamada duplicada ignorada.", received: { transactionId, status: rawStatus, provider } }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    // ── 4. Protecção contra reversão de estado ──
    // Nunca sobrepor um estado final (completed/cancelled) com uma
    // notificação de pagamento que chega atrasada ou fora de ordem.
    if (FINAL_STATES.includes(existingOrder.status)) {
      await logAttempt("stale_status_ignored", { transactionId, provider, rawStatus, orderId: existingOrder.id, payload: body });
      return new Response(
        JSON.stringify({ success: true, message: `Ordem já está num estado final (${existingOrder.status}) — notificação ignorada.`, received: { transactionId, status: rawStatus, provider } }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    // ── 5. Aplicar a confirmação de pagamento ──
    const nowIso = new Date().toISOString();
    const { error: updateError } = await supabaseAdmin
      .from("orders")
      .update({
        status: "completed",
        updated_at: nowIso,
        gateway_payment_confirmed_at: nowIso,
        gateway_provider: provider,
        gateway_raw_payload: body,
      })
      .eq("id", existingOrder.id); // por ID exacto, já resolvido no passo 2 — nunca mais .or() num update

    if (updateError) {
      console.error("Erro ao atualizar status da ordem:", updateError.message);
      await logAttempt("order_not_found", { transactionId, provider, rawStatus, orderId: existingOrder.id, payload: body });
      return new Response(
        JSON.stringify({ success: false, error: "Falha ao actualizar a ordem: " + updateError.message }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    await logAttempt("applied", { transactionId, provider, rawStatus, orderId: existingOrder.id, payload: body });

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
