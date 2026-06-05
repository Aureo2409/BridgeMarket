import { useState, useEffect, useRef } from "react";
import { sb, uploadProof } from "../../lib/supabase.js";
import { DESTS } from "../../lib/constants.js";
import { Icon, StatusPill, ConfirmModal } from "../shared/UI.jsx";

export function TransactionCenter({ order, user, onBack, onCancel }) {
  const [tab, setTab] = useState("partner"); // "partner" or "chat"
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [partnerProfile, setPartnerProfile] = useState(null);
  const [rating, setRating] = useState(order.funder_rating || 0);
  const [biometricSignedUrl, setBiometricSignedUrl] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [currentOrder, setCurrentOrder] = useState(order);
  const [showConfirmSentModal, setShowConfirmSentModal] = useState(false);
  const [showReleaseModal, setShowReleaseModal] = useState(false);
  const chatEndRef = useRef(null);
  const [securityAlert, setSecurityAlert] = useState("");
  // Onboarding de segurança — ambas as partes devem confirmar antes do chat
  const [chatOnboardingDone, setChatOnboardingDone] = useState(false);
  const [onboardingConfirmed, setOnboardingConfirmed] = useState(false);

  const destInfo = DESTS.find(d => d.id === currentOrder?.destination);
  const isCreator = user?.id === currentOrder?.user_id;
  const selectedDest = currentOrder?.selected_destination 
    ? DESTS.find(d => d.id === currentOrder.selected_destination)
    : destInfo;
  const selectedAccount = currentOrder?.selected_destination_account || currentOrder?.destination_account;

  // Real-time Chat & Order Status Sync - Uninterrupted WebSocket channel
  useEffect(() => {
    fetchMessages();

    const channel = sb.channel(`chat_and_order_sync_${order.id}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "chat_messages", filter: `order_id=eq.${order.id}` }, () => {
        fetchMessages();
      })
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "orders", filter: `id=eq.${order.id}` }, p => {
        setCurrentOrder(p.new);
      })
      .subscribe();

    return () => sb.removeChannel(channel);
  }, [order.id]);

  // Sync Partner Profile dynamically whenever the partner shifts/updates
  useEffect(() => {
    fetchPartnerProfile();
  }, [currentOrder?.funder_id, isCreator, currentOrder?.user_id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, tab]);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  async function fetchMessages() {
    const { data, error } = await sb
      .from("chat_messages")
      .select("*")
      .eq("order_id", order.id)
      .order("created_at", { ascending: true });
    if (!error && data) {
      setMessages(data);
    }
  }

  async function fetchPartnerProfile() {
    const partnerId = isCreator ? currentOrder?.funder_id : currentOrder?.user_id;
    if (!partnerId) {
      setPartnerProfile({
        full_name: "Administrador Bridge",
        email: "suporte@bridge.market",
        phone: "+244 976 344 207",
        created_at: new Date().toISOString()
      });
      return;
    }
    const { data } = await sb.from("profiles").select("*").eq("id", partnerId).maybeSingle();
    if (data) {
      const { data: ratingData } = await sb
        .from("orders")
        .select("funder_rating")
        .eq("funder_id", partnerId)
        .not("funder_rating", "is", null);
      
      let avgRating = 0;
      let totalRatings = 0;
      if (ratingData && ratingData.length > 0) {
        totalRatings = ratingData.length;
        avgRating = ratingData.reduce((acc, curr) => acc + curr.funder_rating, 0) / totalRatings;
      }
      setPartnerProfile({ ...data, avgRating, totalRatings });
    }
  }

  useEffect(() => {
    if (currentOrder.biometric_video_url) {
      sb.storage
        .from("transaction-biometrics")
        .createSignedUrl(currentOrder.biometric_video_url, 3600)
        .then(({ data }) => {
          if (data?.signedUrl) setBiometricSignedUrl(data.signedUrl);
        });
    }
  }, [currentOrder.biometric_video_url]);

  async function handleSendMessage(e) {
    e?.preventDefault();
    const text = newMessage.trim();
    if (!text) return;

    // Padrões de segurança: IBAN (AO06 ou PT\d{2}), Telefone angolano (+244 ou 9 dígitos começados por 9), Links externos (http, https, www)
    const ibanPattern = /AO06|PT\d{2}/i;
    const phonePattern = /(\+244|9\d{8})/i;
    const linkPattern = /https?:\/\/[^\s]+|www\.[^\s]+/i;

    if (ibanPattern.test(text) || phonePattern.test(text) || linkPattern.test(text)) {
      setSecurityAlert("Por razões de segurança contra fraudes e spam, não podes enviar dados de pagamento (IBANs), números de telefone ou links de terceiros directamente no chat. Utiliza os destinos oficiais no painel do negócio.");
      return;
    }

    setSecurityAlert(""); // Limpar alerta se passar

    const { error } = await sb.from("chat_messages").insert({
      order_id: currentOrder.id,
      user_id: currentOrder.user_id,
      sender_id: user.id,
      sender_role: isCreator ? "client" : "partner",
      body: text
    });

    if (!error) {
      setNewMessage("");
      fetchMessages();
    } else {
      alert("Erro ao enviar mensagem: " + error.message);
    }
  }

  async function handleFileUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const { signedUrl } = await uploadProof(user.id, currentOrder.id, file);
      
      const { error } = await sb.from("chat_messages").insert({
        order_id: currentOrder.id,
        user_id: currentOrder.user_id,
        sender_id: user.id,
        sender_role: isCreator ? "client" : "partner",
        body: `📎 Envio de Comprovativo: ${file.name}`,
        file_url: signedUrl
      });

      if (!error) {
        // Atualizar proof_uploaded na base de dados e estado local
        const { error: proofError } = await sb
          .from("orders")
          .update({ proof_uploaded: true })
          .eq("id", currentOrder.id);

        if (!proofError) {
          setCurrentOrder(prev => ({ ...prev, proof_uploaded: true }));
        } else {
          console.error("Erro ao atualizar proof_uploaded:", proofError);
        }
        
        fetchMessages();
      } else {
        alert("Erro ao enviar comprovativo: " + error.message);
      }
    } catch (err) {
      alert("Erro ao carregar ficheiro: " + err.message);
    } finally {
      setUploading(false);
    }
  }

  function handleCopyRef() {
    navigator.clipboard.writeText(currentOrder.order_ref ?? currentOrder.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  // Sequential Step Triggers
  async function handleConfirmSent(bypassConfirm = false) {
    if (!bypassConfirm) {
      setShowConfirmSentModal(true);
      return;
    }
    setShowConfirmSentModal(false);
    const { error } = await sb.from("orders").update({
      status: "payment_received"
    }).eq("id", currentOrder.id);

    if (error) {
      alert("Erro ao confirmar envio: " + error.message);
    } else {
      // Send auto chat notification message
      await sb.from("chat_messages").insert({
        order_id: currentOrder.id,
        user_id: currentOrder.user_id,
        sender_id: user.id,
        sender_role: "partner",
        body: "✅ Confirmei a transferência dos dólares! Por favor, verifica o teu saldo e liberta os Kwanzas."
      });
      
      // Update local state
      const { data } = await sb.from("orders").select("*").eq("id", currentOrder.id).maybeSingle();
      if (data) setCurrentOrder(data);
      alert("Envio de dólares confirmado com sucesso!");
    }
  }

  async function handleReleaseOrder(bypassConfirm = false) {
    if (!bypassConfirm) {
      setShowReleaseModal(true);
      return;
    }
    setShowReleaseModal(false);
    const { error } = await sb.from("orders").update({
      status: "completed",
      sent_at: new Date().toISOString()
    }).eq("id", currentOrder.id);

    if (error) {
      alert("Erro ao concluir transação: " + error.message);
    } else {
      // Send auto chat notification message
      await sb.from("chat_messages").insert({
        order_id: currentOrder.id,
        user_id: currentOrder.user_id,
        sender_id: user.id,
        sender_role: "client",
        body: "🎉 Dólares recebidos com sucesso! Transação P2P finalizada. Obrigado pelo negócio!"
      });
      
      // Update local state
      const { data } = await sb.from("orders").select("*").eq("id", currentOrder.id).maybeSingle();
      if (data) setCurrentOrder(data);
      alert("Transação finalizada com sucesso!");
    }
  }

  async function handleSaveRating(val) {
    setRating(val);
    // Comprador avalia o vendedor (funder_rating)
    // Vendedor avalia o comprador (buyer_rating)
    const updateField = isCreator ? "funder_rating" : "buyer_rating";
    const { error } = await sb.from("orders").update({
      [updateField]: val,
      rating_done: true
    }).eq("id", currentOrder.id);
    if (error) {
      alert("Erro ao salvar avaliação: " + error.message);
    } else {
      setCurrentOrder(prev => ({ ...prev, [updateField]: val, rating_done: true }));
    }
  }

  async function handleSelectDestination(destId, destAcc) {
    const d = DESTS.find(x => x.id === destId);
    const destLabel = d ? d.label : destId.toUpperCase();
    
    const { error } = await sb.from("orders").update({
      selected_destination: destId,
      selected_destination_account: destAcc
    }).eq("id", currentOrder.id);
    
    if (error) {
      alert("Erro ao selecionar método: " + error.message);
    } else {
      await sb.from("chat_messages").insert({
        order_id: currentOrder.id,
        user_id: currentOrder.user_id,
        sender_id: user.id,
        sender_role: "partner",
        body: `🤖 Bridge Bot: O parceiro confirmou que enviará os dólares via **${destLabel}** (Conta: \`${destAcc}\`).`
      });
      
      const { data } = await sb.from("orders").select("*").eq("id", currentOrder.id).maybeSingle();
      if (data) setCurrentOrder(data);
    }
  }

  // Active step evaluation
  let activeStep = 0;
  if (currentOrder.status === "awaiting_payment") activeStep = 0;
  if (currentOrder.status === "processing") activeStep = 1;
  if (currentOrder.status === "payment_received" || currentOrder.status === "pending") activeStep = 2;
  if (currentOrder.status === "completed") activeStep = 3;

  const STEPS = ["Solicitar envio", "Correspondência de parceiro", "Enviar fundos", "Transação concluída"];

  // ── ONBOARDING DE SEGURANÇA ─────────────────────────────────────────────────
  // Mostrar apenas quando a transacção está em processamento (parceiro encontrado)
  // e o utilizador ainda não confirmou o onboarding nesta sessão
  const isProcessing = currentOrder.status === "processing" || currentOrder.status === "payment_received";
  if (isProcessing && !chatOnboardingDone) {
    const isBuyer = currentOrder.user_id === (user?.id || "");
    const destInfo = (currentOrder.payment_destinations || {})[currentOrder.destination] || {};
    const motivos = {
      IM: "Importação de mercadoria", SP: "Pagamento de serviços/propinas",
      RF: "Remessa familiar", PS: "Prestação de serviços recebida",
      VI: "Viagem internacional", IN: "Investimento / poupança", OU: "Outro"
    };
    return (
      <div style={{ animation: "fadeIn 0.3s ease-out" }}>
        {/* Header voltar */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <button onClick={onBack} style={{ background: "none", border: "none", color: "#6366f1", fontSize: 12, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
            <Icon name="arrowLeft" size={14} /> Voltar
          </button>
        </div>

        {/* Card de onboarding */}
        <div style={{ background: "#fff", borderRadius: 20, border: "1px solid #e2e8f0", overflow: "hidden", boxShadow: "0 4px 24px rgba(99,102,241,0.08)" }}>
          
          {/* Header */}
          <div style={{ background: "linear-gradient(135deg, #1e1b4b, #312e81)", padding: "20px 22px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
              <div style={{ width: 40, height: 40, borderRadius: "50%", background: "rgba(99,102,241,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>🛡️</div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 900, color: "#fff" }}>Verificação de Segurança</div>
                <div style={{ fontSize: 11, color: "#a5b4fc" }}>Pedido #{currentOrder.order_ref || currentOrder.id?.slice(0,8).toUpperCase()}</div>
              </div>
            </div>
          </div>

          {/* Resumo da transacção */}
          <div style={{ padding: "18px 22px", borderBottom: "1px solid #f1f5f9" }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: 1, marginBottom: 12 }}>Detalhes da Transacção</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {[
                { label: "Valor USD", val: `$${parseFloat(currentOrder.amount_usd).toFixed(2)}`, icon: "💵", color: "#059669" },
                { label: "Valor AOA", val: `${parseFloat(currentOrder.amount_aoa).toLocaleString("pt-AO")} Kz`, icon: "🇦🇴", color: "#1e1b4b" },
                { label: "Taxa Aplicada", val: `${currentOrder.rate_applied} AOA/$`, icon: "📊", color: "#6366f1" },
                { label: "Motivo Cambial", val: motivos[currentOrder.exchange_reason] || "Não especificado", icon: "📋", color: "#d97706" },
              ].map((item, i) => (
                <div key={i} style={{ background: "#f8fafc", borderRadius: 10, padding: "10px 12px", border: "1px solid #e2e8f0" }}>
                  <div style={{ fontSize: 10, color: "#94a3b8", marginBottom: 3 }}>{item.icon} {item.label}</div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: item.color }}>{item.val}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Destino */}
          <div style={{ padding: "14px 22px", borderBottom: "1px solid #f1f5f9" }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>💳 Destino de Recebimento</div>
            <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 10, padding: "10px 14px" }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#065f46" }}>{currentOrder.destination?.toUpperCase?.() || "—"}</div>
              <div style={{ fontSize: 11, color: "#047857", fontFamily: "monospace", marginTop: 2 }}>{currentOrder.destination_account || "—"}</div>
            </div>
          </div>

          {/* Regras de segurança */}
          <div style={{ padding: "16px 22px", borderBottom: "1px solid #f1f5f9" }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: 1, marginBottom: 12 }}>⚠️ Regras Obrigatórias</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[
                { icon: "🔒", text: "Nunca comuniques fora desta plataforma. Qualquer pedido para continuar no WhatsApp ou outro canal é uma tentativa de burla.", color: "#dc2626", bg: "#fef2f2", border: "#fecaca" },
                { icon: "✅", text: isBuyer ? "Só confirma o recebimento depois de verificares que o saldo está DISPONÍVEL na tua conta — não retido ou pendente." : "Só marques como enviado depois de a transferência estar efectivamente concluída. Faz upload do comprovativo.", color: "#059669", bg: "#f0fdf4", border: "#bbf7d0" },
                { icon: "📸", text: "Este chat é rastreado e gravado. Toda a comunicação fica registada e pode ser consultada pelo administrador e autoridades.", color: "#6366f1", bg: "#eef2ff", border: "#c7d2fe" },
                { icon: "🏛️", text: "Esta transacção está sujeita à Lei Cambial de Angola e aos Avisos do BNA. Os dados da operação são reportados à UIF se necessário.", color: "#d97706", bg: "#fffbeb", border: "#fde68a" },
              ].map((r, i) => (
                <div key={i} style={{ display: "flex", gap: 10, background: r.bg, border: `1px solid ${r.border}`, borderRadius: 10, padding: "10px 12px", alignItems: "flex-start" }}>
                  <span style={{ fontSize: 16, flexShrink: 0 }}>{r.icon}</span>
                  <span style={{ fontSize: 12, color: r.color, lineHeight: 1.5, fontWeight: 500 }}>{r.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Confirmação */}
          <div style={{ padding: "16px 22px" }}>
            <label style={{ display: "flex", gap: 12, alignItems: "flex-start", cursor: "pointer", marginBottom: 16 }}>
              <input type="checkbox" checked={onboardingConfirmed} onChange={e => setOnboardingConfirmed(e.target.checked)}
                style={{ width: 18, height: 18, marginTop: 1, accentColor: "#6366f1", cursor: "pointer" }} />
              <span style={{ fontSize: 12.5, color: "#374151", lineHeight: 1.6 }}>
                <strong>Li e compreendi</strong> todas as regras de segurança acima. Confirmo que a minha identidade foi verificada e que vou agir de boa-fé nesta transacção.
              </span>
            </label>
            <button
              onClick={() => { if (onboardingConfirmed) setChatOnboardingDone(true); }}
              disabled={!onboardingConfirmed}
              style={{
                width: "100%", padding: "14px", borderRadius: 12, border: "none",
                background: onboardingConfirmed ? "linear-gradient(135deg, #6366f1, #4f46e5)" : "#e2e8f0",
                color: onboardingConfirmed ? "#fff" : "#94a3b8",
                fontSize: 14, fontWeight: 800, cursor: onboardingConfirmed ? "pointer" : "not-allowed",
                transition: "all 0.2s"
              }}
            >
              {onboardingConfirmed ? "Entendi — Entrar no Chat ▶" : "Confirma as regras para continuar"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ animation: "fadeIn 0.25s ease-out" }}>
      {/* Back Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <button onClick={onBack} style={{ background: "none", border: "none", color: "#6366f1", fontSize: 12, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
          <Icon name="arrowLeft" size={14} /> Voltar aos pedidos
        </button>
        {onCancel && isCreator && (currentOrder.status === "awaiting_payment" || currentOrder.status === "pending") && (
          <button onClick={() => onCancel(currentOrder.id)} style={{ background: "none", border: "none", color: "#ef4444", fontSize: 12, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
            <Icon name="ban" size={14} /> Cancelar Pedido
          </button>
        )}
      </div>

      {/* Premium Step Header */}
      <div style={{ display: "flex", justifyContent: "space-between", gap: 6, marginBottom: 24, background: "#f8fafc", padding: "12px 16px", borderRadius: 12, border: "1px solid #e2e8f0" }}>
        {STEPS.map((s, idx) => {
          const isDone = activeStep >= idx && currentOrder.status !== "cancelled";
          const isActive = activeStep === idx && currentOrder.status !== "cancelled";
          return (
            <div key={idx} style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
              <div style={{ height: 4, borderRadius: 2, background: isDone ? "#10b981" : "#cbd5e1" }} />
              <div style={{ fontSize: 9, fontWeight: 800, color: isActive ? "#6366f1" : isDone ? "#10b981" : "#94a3b8", textAlign: "center", textTransform: "uppercase" }}>
                {s}
              </div>
            </div>
          );
        })}
      </div>

      {/* Status Hero Title */}
      <div style={{ marginBottom: 24, textAlign: "center" }}>
        <h2 style={{ fontSize: 20, fontWeight: 900, color: "#1e1b4b", letterSpacing: "-0.5px", marginBottom: 6 }}>
          {currentOrder.status === "completed" 
            ? `$${parseFloat(currentOrder.amount_usd).toFixed(2)} USD adicionados com sucesso!`
            : currentOrder.status === "cancelled"
              ? "Este pedido foi cancelado"
              : currentOrder.status === "awaiting_payment"
                ? "Aguardando pareamento de parceiro..."
                : currentOrder.status === "processing"
                  ? "Parceiro correspondido com sucesso!"
                  : "Dólares transferidos pelo parceiro!"}
        </h2>
        <p style={{ fontSize: 12, color: "#64748b", fontWeight: 500 }}>
          {currentOrder.status === "completed"
            ? "O negócio P2P foi concluído. Saldo creditado e comprovativos registados!"
            : currentOrder.status === "cancelled"
              ? "A transação foi anulada e nenhum valor foi movimentado."
              : currentOrder.status === "awaiting_payment"
                ? "O teu pedido está ativo no mercado P2P. Aguarda aceitação."
                : currentOrder.status === "processing"
                  ? "Entra na aba de Conversa para combinar os detalhes com o teu parceiro!"
                  : "Criador do pedido deve verificar a conta e libertar Kwanzas."}
        </p>
      </div>

      {/* Main Two-Column Layout */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        
        {/* Left Side Tab Control */}
        <div className="card" style={{ padding: 0, overflow: "hidden", display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", borderBottom: "1px solid #f1f5f9", background: "#f8fafc" }}>
            <button
              onClick={() => setTab("partner")}
              style={{
                flex: 1,
                padding: "14px 0",
                background: "none",
                border: "none",
                borderBottom: tab === "partner" ? "3px solid #6366f1" : "3px solid transparent",
                color: tab === "partner" ? "#6366f1" : "#64748b",
                fontWeight: 800,
                fontSize: 12,
                cursor: "pointer",
                transition: "all 0.2s"
              }}
            >
              PARCEIRO
            </button>
            <button
              onClick={() => setTab("chat")}
              style={{
                flex: 1,
                padding: "14px 0",
                background: "none",
                border: "none",
                borderBottom: tab === "chat" ? "3px solid #6366f1" : "3px solid transparent",
                color: tab === "chat" ? "#6366f1" : "#64748b",
                fontWeight: 800,
                fontSize: 12,
                cursor: "pointer",
                transition: "all 0.2s",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6
              }}
            >
              CONVERSA
              {messages.length > 0 && (
                <span style={{ background: "#6366f1", color: "#fff", borderRadius: 8, padding: "2px 6px", fontSize: 9, fontWeight: 900 }}>
                  {messages.length}
                </span>
              )}
            </button>
          </div>

          <div style={{ padding: 20, minHeight: 280, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            {tab === "partner" ? (
              <div style={{ textAlign: "center", padding: "10px 0" }}>
                <div style={{ display: "flex", justifyContent: "center", marginBottom: 14 }}>
                  <div style={{
                    width: 70, height: 70, borderRadius: "50%",
                    background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
                    color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 24, fontWeight: 900,
                    boxShadow: "0 6px 16px rgba(99,102,241,0.2)",
                    overflow: "hidden"
                  }}>
                    {partnerProfile?.avatar_url ? (
                      <img src={partnerProfile.avatar_url} alt="Avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                      partnerProfile?.full_name?.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase() || "BR"
                    )}
                  </div>
                </div>

                <div style={{ fontSize: 16, fontWeight: 900, color: "#1e1b4b", marginBottom: 4 }}>
                  {partnerProfile?.full_name || "Aguardando Parceiro..."}
                </div>
                {partnerProfile?.totalRatings > 0 ? (
                  <div style={{ fontSize: 12, color: "#f59e0b", fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", gap: 4, marginBottom: 8 }}>
                    ★ {partnerProfile.avgRating.toFixed(1)} ({partnerProfile.totalRatings} avaliações)
                  </div>
                ) : (
                  partnerProfile && partnerProfile.full_name !== "Administrador Bridge" && (
                    <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600, marginBottom: 8 }}>
                      Sem avaliações ainda
                    </div>
                  )
                )}
                <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 16 }}>
                  {partnerProfile?.full_name === "Administrador Bridge" ? "Suporte Oficial" : `Membro desde ${new Date(partnerProfile?.created_at || Date.now()).toLocaleDateString("pt-PT", { month: "short", year: "numeric" })}`}
                </div>

                {/* Biometric Video Mutual Verification Box */}
                {biometricSignedUrl && (
                  <div style={{ marginTop: 8, marginBottom: 16, padding: "14px 16px", background: "rgba(0, 229, 195, 0.05)", border: "1px solid rgba(0, 229, 195, 0.2)", borderRadius: 12, textAlign: "left", animation: "fadeIn 0.2s" }} onClick={(e) => e.stopPropagation()}>
                    <div style={{ fontSize: 11, fontWeight: 900, color: "#00e5c3", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6, display: "flex", alignItems: "center", gap: 5 }}>
                      <span style={{ fontSize: 14 }}>👁</span> Verificação Biométrica do Parceiro
                    </div>
                    <div style={{ fontSize: 11, color: "#64748b", lineHeight: 1.5, marginBottom: 10 }}>
                      Este parceiro gravou e autenticou com sucesso um vídeo selfie de 4s ao aceitar esta transação. Assista para confirmar a sua identidade facial:
                    </div>
                    <video
                      src={biometricSignedUrl}
                      controls
                      playsInline
                      style={{ width: "100%", maxHeight: 200, borderRadius: 10, border: "2px solid #00e5c3", backgroundColor: "#000" }}
                    />
                  </div>
                )}

                {currentOrder.status === "completed" && (
                  <div style={{ marginTop: 20, padding: "16px", background: "linear-gradient(135deg, #f8fafc, #f1f5f9)", borderRadius: 14, border: "1px solid #e2e8f0" }}>
                    {/* Cabeçalho */}
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                      <span style={{ fontSize: 18 }}>⭐</span>
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 800, color: "#0f172a" }}>
                          {rating > 0 ? "Avaliação Enviada" : "Avalia a tua Experiência"}
                        </div>
                        <div style={{ fontSize: 10, color: "#64748b", marginTop: 1 }}>
                          {isCreator ? "Como foi o serviço do vendedor?" : "Como foi a experiência com o comprador?"}
                        </div>
                      </div>
                    </div>

                    {/* Estrelas */}
                    <div style={{ display: "flex", justifyContent: "center", gap: 6, marginBottom: 10 }}>
                      {[1, 2, 3, 4, 5].map(val => (
                        <button
                          key={val}
                          onClick={() => !rating && handleSaveRating(val)}
                          style={{
                            background: "none",
                            border: "none",
                            cursor: rating > 0 ? "default" : "pointer",
                            color: val <= rating ? "#f59e0b" : "#cbd5e1",
                            fontSize: 28,
                            transition: "transform 0.15s ease, color 0.15s ease",
                            transform: val <= rating ? "scale(1.1)" : "scale(1)",
                            padding: 2
                          }}
                        >★</button>
                      ))}
                    </div>

                    {/* Labels de texto */}
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9, color: "#94a3b8", marginBottom: 10, paddingX: 4 }}>
                      <span>Muito mau</span>
                      <span>Excelente</span>
                    </div>

                    {/* Feedback pós-avaliação */}
                    {rating > 0 && (
                      <div style={{ animation: "fadeIn 0.3s ease-out", background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 10, padding: "10px 14px", display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: 18 }}>
                          {rating >= 4 ? "🙌" : rating === 3 ? "👍" : "💬"}
                        </span>
                        <div>
                          <div style={{ fontSize: 11, fontWeight: 800, color: "#16a34a" }}>
                            {rating === 5 ? "Excelente! Obrigado pelo feedback." :
                             rating === 4 ? "Muito bom! Avaliação registada." :
                             rating === 3 ? "Aceitável. Avaliação registada." :
                             rating === 2 ? "Feedback registado. Vamos melhorar." :
                             "Feedback registado. Analisaremos a situação."}
                          </div>
                          <div style={{ fontSize: 10, color: "#4ade80", marginTop: 2 }}>
                            {rating} {rating === 1 ? "estrela" : "estrelas"} guardadas na transacção
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Avaliação média do parceiro */}
                    {partnerProfile?.totalRatings > 0 && (
                      <div style={{ marginTop: 10, fontSize: 10, color: "#64748b", textAlign: "center" }}>
                        Média do parceiro: <strong style={{ color: "#f59e0b" }}>★ {partnerProfile.avgRating.toFixed(1)}</strong> ({partnerProfile.totalRatings} avaliações)
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", height: 320 }}>
                <div style={{
                  background: "linear-gradient(135deg, #fffbeb, #fef3c7)",
                  border: "1px solid #f59e0b",
                  borderRadius: 12,
                  padding: "10px 12px",
                  fontSize: 11,
                  lineHeight: 1.4,
                  color: "#b45309",
                  fontWeight: 700,
                  marginBottom: 10,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  boxShadow: "0 2px 8px rgba(245, 158, 11, 0.08)",
                  textAlign: "left"
                }}>
                  <span style={{ fontSize: 16 }}>🛡️</span>
                  <span><strong>Aviso de Segurança:</strong> Nunca partilhes dados de pagamento, IBANs ou contactos no chat. O matching já foi feito de forma segura e automática!</span>
                </div>
                <div style={{ flex: 1, overflowY: "auto", paddingRight: 4, display: "flex", flexDirection: "column", gap: 10, marginBottom: 12 }}>
                  {messages.length === 0 ? (
                    <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#94a3b8", fontSize: 11, fontWeight: 600 }}>
                      <Icon name="mail" size={24} style={{ marginBottom: 6 }} />
                      Nenhuma mensagem enviada ainda.<br />Escreva algo abaixo para conversar com seu parceiro!
                    </div>
                  ) : (
                    messages.map(msg => {
                      const isMe = msg.sender_id === user.id;
                      return (
                        <div key={msg.id} style={{
                          alignSelf: isMe ? "flex-end" : "flex-start",
                          maxWidth: "75%",
                          display: "flex",
                          flexDirection: "column",
                          alignItems: isMe ? "flex-end" : "flex-start"
                        }}>
                          <div style={{
                            background: isMe ? "linear-gradient(135deg,#6366f1,#8b5cf6)" : "#f1f5f9",
                            color: isMe ? "#fff" : "#1e1b4b",
                            padding: "8px 12px",
                            borderRadius: 14,
                            borderTopRightRadius: isMe ? 2 : 14,
                            borderTopLeftRadius: isMe ? 14 : 2,
                            fontSize: 12,
                            fontWeight: 600,
                            lineHeight: 1.5,
                            wordBreak: "break-word",
                            boxShadow: "0 2px 6px rgba(0,0,0,0.02)"
                          }}>
                            {msg.body}

                            {msg.file_url && (
                              <div style={{ marginTop: 8, borderTop: isMe ? "1px solid rgba(255,255,255,0.2)" : "1px solid #cbd5e1", paddingTop: 6 }}>
                                {msg.file_url.match(/\.(jpeg|jpg|gif|png|webp)/i) ? (
                                  <a href={msg.file_url} target="_blank" rel="noreferrer">
                                    <img src={msg.file_url} alt="Anexo" style={{ maxWidth: "100%", maxHeight: 110, borderRadius: 8, marginTop: 4, border: "1px solid #cbd5e1" }} />
                                  </a>
                                ) : (
                                  <a href={msg.file_url} target="_blank" rel="noreferrer" style={{ display: "flex", alignItems: "center", gap: 5, color: isMe ? "#fff" : "#6366f1", textDecoration: "underline", fontSize: 10 }}>
                                    <Icon name="file" size={12} /> Ver comprovativo
                                  </a>
                                )}
                              </div>
                            )}
                          </div>
                          <span style={{ fontSize: 9, color: "#94a3b8", fontWeight: 700, marginTop: 3 }}>
                            {new Date(msg.created_at).toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </div>
                      );
                    })
                  )}
                  <div ref={chatEndRef} />
                </div>

                {securityAlert && (
                  <div style={{
                    background: "rgba(239, 68, 68, 0.08)",
                    border: "1px solid rgba(239, 68, 68, 0.2)",
                    borderRadius: 12,
                    padding: "8px 12px",
                    margin: "4px 0 8px",
                    color: "#ef4444",
                    fontSize: 10.5,
                    lineHeight: 1.5,
                    fontWeight: 700,
                    display: "flex",
                    flexDirection: "column",
                    gap: 6
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                      <span>⚠️</span>
                      <span>{securityAlert}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSecurityAlert("")}
                      style={{
                        alignSelf: "flex-end",
                        background: "rgba(239, 68, 68, 0.12)",
                        border: "none",
                        color: "#ef4444",
                        padding: "3px 8px",
                        borderRadius: 6,
                        fontSize: 9,
                        fontWeight: 800,
                        cursor: "pointer"
                      }}
                    >
                      Compreendo
                    </button>
                  </div>
                )}

                <form onSubmit={handleSendMessage} style={{ display: "flex", gap: 8, borderTop: "1px solid #f1f5f9", paddingTop: 10 }}>
                  <button
                    type="button"
                    disabled={uploading}
                    onClick={() => document.getElementById("chat-file-inp").click()}
                    style={{
                      width: 36, height: 36, borderRadius: "50%",
                      background: "#f1f5f9", border: "none", color: "#64748b",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      cursor: "pointer", transition: "all 0.2s"
                    }}
                  >
                    <Icon name="upload" size={14} />
                  </button>
                  <input
                    id="chat-file-inp"
                    type="file"
                    style={{ display: "none" }}
                    accept="image/*,application/pdf"
                    onChange={handleFileUpload}
                  />

                  <input
                    className="inp"
                    style={{ marginBottom: 0, flex: 1, padding: "8px 14px", borderRadius: 20 }}
                    type="text"
                    placeholder="Escreve uma mensagem..."
                    value={newMessage}
                    onChange={e => setNewMessage(e.target.value)}
                  />

                  <button
                    type="submit"
                    style={{
                      width: 36, height: 36, borderRadius: "50%",
                      background: "linear-gradient(135deg,#6366f1,#8b5cf6)", border: "none", color: "#fff",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      cursor: "pointer", transition: "all 0.2s"
                    }}
                  >
                    <Icon name="arrowRight" size={14} color="#fff" />
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>

        {/* Right Side Transaction Details Card */}
        <div className="card" style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 11, color: "#94a3b8", fontWeight: 800, textTransform: "uppercase", letterSpacing: 0.5 }}>
              DETALHES DA TRANSAÇÃO
            </span>
            <StatusPill status={currentOrder.status} />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, paddingBottom: 10, borderBottom: "1px solid #f1f5f9" }}>
              <div style={{
                width: 32, height: 32, borderRadius: "50%", background: "rgba(99,102,241,0.06)",
                display: "flex", alignItems: "center", justifyContent: "center", color: "#6366f1", flexShrink: 0
              }}>
                <Icon name="bank" size={14} />
              </div>
              <div style={{ flex: 1 }}>
                <span style={{ fontSize: 10, color: "#94a3b8", fontWeight: 700 }}>FOI ENVIADO DESDE</span>
                <div style={{ fontSize: 12, fontWeight: 800, color: "#1e1b4b", marginTop: 2 }}>
                  Transferência MCX (AOA)
                </div>
              </div>
              <span style={{ fontSize: 14, fontWeight: 900, color: "#1e1b4b" }}>
                {parseFloat(currentOrder.amount_aoa).toLocaleString("pt-AO")} Kz
              </span>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 10, paddingBottom: 10, borderBottom: "1px solid #f1f5f9" }}>
              <div style={{
                width: 32, height: 32, borderRadius: "50%", background: selectedDest?.bg || "rgba(99,102,241,0.06)",
                display: "flex", alignItems: "center", justifyContent: "center", color: selectedDest?.color || "#6366f1", flexShrink: 0, overflow: "hidden"
              }}>
                {selectedDest?.logo ? (
                  <img src={selectedDest.logo} alt={selectedDest.label} style={{ width: 32, height: 32, objectFit: "contain", borderRadius: "50%" }} onError={e => { e.target.style.display = "none"; }} />
                ) : selectedDest?.svg ? (
                  <div style={{ width: 32, height: 32 }} dangerouslySetInnerHTML={{ __html: selectedDest.svg }} />
                ) : (
                  <Icon name="globe" size={14} />
                )}
              </div>
              <div style={{ flex: 1 }}>
                <span style={{ fontSize: 10, color: "#94a3b8", fontWeight: 700 }}>{isCreator ? "VOCÊ RECEBEU EM" : "ENVIAR PARA"}</span>
                <div style={{ fontSize: 12, fontWeight: 800, color: "#1e1b4b", marginTop: 2 }}>
                  {selectedDest?.label || "USD"} · {selectedAccount}
                </div>
              </div>
              <span style={{ fontSize: 14, fontWeight: 900, color: "#6366f1" }}>
                ${parseFloat(currentOrder.amount_usd).toFixed(2)}
              </span>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: 10, borderBottom: "1px solid #f1f5f9" }}>
              <span style={{ fontSize: 11, color: "#64748b", fontWeight: 700 }}>Taxa de câmbio líquida</span>
              <span style={{ fontSize: 12, fontWeight: 800, color: "#1e1b4b" }}>
                1 USD = {parseFloat(currentOrder.rate_applied).toLocaleString("pt-AO")} Kz
              </span>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <span style={{ fontSize: 10, color: "#94a3b8", fontWeight: 700 }}>ID DA TRANSAÇÃO</span>
                <div style={{ fontSize: 11, fontWeight: 800, color: "#1e1b4b", fontFamily: "monospace", marginTop: 2 }}>
                  {currentOrder.order_ref ?? currentOrder.id.slice(0, 18).toUpperCase()}
                </div>
              </div>
              <button
                onClick={handleCopyRef}
                style={{
                  background: copied ? "#f0fdf4" : "rgba(99,102,241,0.06)",
                  border: "none",
                  color: copied ? "#16a34a" : "#6366f1",
                  padding: "6px 12px",
                  borderRadius: 8,
                  fontSize: 10,
                  fontWeight: 800,
                  cursor: "pointer",
                  transition: "all 0.2s"
                }}
              >
                {copied ? "Copiado!" : "Copiar"}
              </button>
            </div>
          </div>

          {/* Real-time Interactive P2P Action Card */}
          {currentOrder.status !== "completed" && currentOrder.status !== "cancelled" && (
            <div style={{
              background: "linear-gradient(135deg,#f5f3ff,#fcfaff)",
              border: "1.5px dashed #6366f1",
              borderRadius: 14,
              padding: "16px 20px",
              marginTop: 10,
              textAlign: "center"
            }}>
              {currentOrder.status === "awaiting_payment" && (
                <>
                  <div style={{ fontSize: 13, fontWeight: 900, color: "#1e1b4b", marginBottom: 6 }}>Aguardando Pareamento</div>
                  <div style={{ fontSize: 11, color: "#64748b", lineHeight: 1.5, marginBottom: 12 }}>
                    O teu pedido foi publicado no mercado. Aguarda que um parceiro P2P o aceite.
                  </div>
                </>
              )}

              {currentOrder.status === "processing" && (
                isCreator ? (
                  <>
                    <div style={{ fontSize: 13, fontWeight: 900, color: "#1e1b4b", marginBottom: 6 }}>Parceiro Correspondido!</div>
                    <div style={{ fontSize: 11, color: "#64748b", lineHeight: 1.5, marginBottom: 12 }}>
                      <strong>{partnerProfile?.full_name || "Parceiro"}</strong> aceitou a tua transação. Aguarda que ele envie os dólares para a tua conta.
                    </div>
                  </>
                ) : (
                  !currentOrder.selected_destination ? (
                    (() => {
                      const activeBuyerDests = Object.entries(partnerProfile?.payment_destinations || {})
                        .filter(([_, info]) => info.active && info.value);
                      if (activeBuyerDests.length > 0) {
                        return (
                          <>
                            <div style={{ fontSize: 13, fontWeight: 900, color: "#1e1b4b", marginBottom: 6 }}>Selecionar Método de Envio</div>
                            <div style={{ fontSize: 11.5, color: "#64748b", lineHeight: 1.5, marginBottom: 12 }}>
                              O comprador aceita receber através dos seguintes destinos. Seleciona o método que pretendes utilizar para transferir os dólares:
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 12, textAlign: "left" }}>
                              {activeBuyerDests.map(([id, info]) => {
                                const d = DESTS.find(x => x.id === id);
                                if (!d) return null;
                                return (
                                  <button
                                    key={id}
                                    onClick={() => handleSelectDestination(id, info.value)}
                                    style={{
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "space-between",
                                      padding: "10px 12px",
                                      background: "#fff",
                                      border: "1px solid #cbd5e1",
                                      borderRadius: 12,
                                      cursor: "pointer",
                                      width: "100%",
                                      fontFamily: "inherit",
                                      transition: "all 0.2s"
                                    }}
                                  >
                                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                      <div style={{ width: 28, height: 28, borderRadius: 8, background: d.logoBg || d.bg, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", flexShrink: 0 }}>
                                        {d.logo
                                          ? <img src={d.logo} alt={d.label} style={{ width: 28, height: 28, objectFit: "contain" }} onError={e => { e.target.style.display = "none"; }} />
                                          : d.svg ? <div dangerouslySetInnerHTML={{ __html: d.svg }} /> : null
                                        }
                                      </div>
                                      <div>
                                        <div style={{ fontSize: 11.5, fontWeight: 800, color: "#1e1b4b" }}>{d.label}</div>
                                        <div style={{ fontSize: 10, color: "#64748b", fontFamily: "monospace", marginTop: 2 }}>{info.value}</div>
                                      </div>
                                    </div>
                                    <span style={{ fontSize: 10, fontWeight: 800, color: "#6366f1" }}>Escolher &gt;</span>
                                  </button>
                                );
                              })}
                            </div>
                          </>
                        );
                      } else {
                        // Fallback to order destination
                        return (
                          <>
                            <div style={{ fontSize: 13, fontWeight: 900, color: "#1e1b4b", marginBottom: 6 }}>Confirmar Método de Envio</div>
                            <div style={{ fontSize: 11, color: "#64748b", lineHeight: 1.5, marginBottom: 12 }}>
                              O comprador não registou métodos adicionais no seu perfil. Confirmas o envio dos dólares para o destino padrão do pedido?
                              <strong style={{ display: "block", marginTop: 6, color: "#1e1b4b" }}>{destInfo?.label || "USD"} ({currentOrder.destination_account})</strong>
                            </div>
                            <button
                              onClick={() => handleSelectDestination(currentOrder.destination, currentOrder.destination_account)}
                              className="btn btn-p"
                              style={{ width: "100%" }}
                            >
                              Confirmar Envio via {destInfo?.label || "USD"}
                            </button>
                          </>
                        );
                      }
                    })()
                  ) : (
                    <>
                      <div style={{ fontSize: 13, fontWeight: 900, color: "#1e1b4b", marginBottom: 6 }}>Ação Requerida: Enviar USD</div>
                      <div style={{ fontSize: 11, color: "#64748b", lineHeight: 1.5, marginBottom: 12 }}>
                        Envia exactamente <strong>${parseFloat(currentOrder.amount_usd).toFixed(2)} USD</strong> via <strong style={{ color: "#6366f1" }}>{selectedDest?.label}</strong> para a conta:<br />
                        <div style={{
                          margin: "6px 0",
                          padding: "8px 10px",
                          background: "#fff",
                          border: "1px dashed #cbd5e1",
                          borderRadius: 8,
                          fontWeight: 700,
                          color: "#6366f1",
                          fontSize: 12,
                          fontFamily: "monospace",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center"
                        }}>
                          <span>{selectedAccount}</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigator.clipboard.writeText(selectedAccount);
                              alert("Conta copiada com sucesso!");
                            }}
                            style={{
                              background: "none",
                              border: "none",
                              color: "#6366f1",
                              cursor: "pointer",
                              fontSize: 10,
                              fontWeight: 700
                            }}
                          >
                            Copiar
                          </button>
                        </div>
                        Após enviares, confirma a transação abaixo.
                      </div>
                      <button
                        onClick={handleConfirmSent}
                        disabled={!currentOrder.proof_uploaded}
                        style={{
                          width: "100%",
                          background: currentOrder.proof_uploaded ? "linear-gradient(135deg,#10b981,#059669)" : "#94a3b8",
                          border: "none",
                          color: "#fff",
                          padding: "10px 14px",
                          borderRadius: 10,
                          fontSize: 12,
                          fontWeight: 800,
                          cursor: currentOrder.proof_uploaded ? "pointer" : "not-allowed",
                          boxShadow: currentOrder.proof_uploaded ? "0 4px 12px rgba(16,185,129,0.18)" : "none",
                          opacity: currentOrder.proof_uploaded ? 1 : 0.65
                        }}
                      >
                        Já Enviei os Dólares (Confirmar Envio)
                      </button>
                      {!currentOrder.proof_uploaded && (
                        <div style={{ fontSize: 10.5, color: "#d97706", fontWeight: 700, marginTop: 8, textAlign: "center" }}>
                          ⚠️ Deves carregar o comprovativo (ícone 📎) antes de confirmar.
                        </div>
                      )}
                    </>
                  )
                )
              )}

              {(currentOrder.status === "payment_received" || currentOrder.status === "pending") && (
                isCreator ? (
                  <>
                    <div style={{ fontSize: 13, fontWeight: 900, color: "#1e1b4b", marginBottom: 6 }}>USD Recebido?</div>
                    <div style={{ fontSize: 11, color: "#64748b", lineHeight: 1.5, marginBottom: 12 }}>
                      O teu parceiro confirmou o envio de <strong>${parseFloat(currentOrder.amount_usd).toFixed(2)} USD</strong>. Confirma na tua conta e liberta os Kwanzas.
                    </div>
                    <button
                      onClick={handleReleaseOrder}
                      style={{
                        width: "100%",
                        background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
                        border: "none",
                        color: "#fff",
                        padding: "10px 14px",
                        borderRadius: 10,
                        fontSize: 12,
                        fontWeight: 800,
                        cursor: "pointer",
                        boxShadow: "0 4px 12px rgba(99,102,241,0.18)"
                      }}
                    >
                      Confirmo Recebimento, Concluir P2P
                    </button>
                  </>
                ) : (
                  <>
                    <div style={{ fontSize: 13, fontWeight: 900, color: "#1e1b4b", marginBottom: 6 }}>Aguardando Confirmação</div>
                    <div style={{ fontSize: 11, color: "#64748b", lineHeight: 1.5, marginBottom: 12 }}>
                      Confirmaste o envio! Aguarda que o criador verifique a conta dele e conclua a transação.
                    </div>
                  </>
                )
              )}
            </div>
          )}
        </div>

      </div>

      <ConfirmModal
        isOpen={showConfirmSentModal}
        title="Confirmar Envio de Dólares"
        message={`Confirma que já transferiu exactamente $${parseFloat(currentOrder.amount_usd).toFixed(2)} USD para a conta do usuário?`}
        confirmText="Sim, transferi"
        cancelText="Voltar"
        onConfirm={() => handleConfirmSent(true)}
        onCancel={() => setShowConfirmSentModal(false)}
      />

      <ConfirmModal
        isOpen={showReleaseModal}
        title="Libertar Fundos e Concluir"
        message={`Confirma que recebeu os $${parseFloat(currentOrder.amount_usd).toFixed(2)} USD na sua conta e deseja concluir a transação P2P, libertando os Kwanzas?`}
        confirmText="Sim, libertar"
        cancelText="Cancelar"
        onConfirm={() => handleReleaseOrder(true)}
        onCancel={() => setShowReleaseModal(false)}
      />
    </div>
  );
}
