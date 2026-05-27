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

  const destInfo = DESTS.find(d => d.id === currentOrder?.destination);
  const isCreator = user?.id === currentOrder?.user_id;

  // Real-time Chat & Order Status Sync
  useEffect(() => {
    fetchMessages();
    fetchPartnerProfile();

    const channel = sb.channel(`chat_and_order_sync_${order.id}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "chat_messages", filter: `order_id=eq.${order.id}` }, () => {
        fetchMessages();
      })
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "orders", filter: `id=eq.${order.id}` }, p => {
        setCurrentOrder(p.new);
      })
      .subscribe();

    return () => sb.removeChannel(channel);
  }, [order.id, currentOrder?.funder_id]);

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
    if (!newMessage.trim()) return;

    const { error } = await sb.from("chat_messages").insert({
      order_id: currentOrder.id,
      user_id: currentOrder.user_id,
      sender_id: user.id,
      sender_role: isCreator ? "client" : "partner",
      body: newMessage.trim()
    });

    if (!error) {
      setNewMessage("");
      fetchMessages();
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
        fetchMessages();
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
    const { error } = await sb.from("orders").update({
      funder_rating: val
    }).eq("id", currentOrder.id);
    if (error) {
      alert("Erro ao salvar avaliação: " + error.message);
    }
  }

  // Active step evaluation
  let activeStep = 0;
  if (currentOrder.status === "awaiting_payment") activeStep = 0;
  if (currentOrder.status === "processing") activeStep = 1;
  if (currentOrder.status === "payment_received" || currentOrder.status === "pending") activeStep = 2;
  if (currentOrder.status === "completed") activeStep = 3;

  const STEPS = ["Solicitar envio", "Correspondência de parceiro", "Enviar fundos", "Transação concluída"];

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
                  <div style={{ marginTop: 24, paddingTop: 16, borderTop: "1px solid #f1f5f9" }}>
                    <div style={{ fontSize: 12, fontWeight: 800, color: "#475569", marginBottom: 8 }}>
                      Como foi a experiência com seu parceiro?
                    </div>
                    <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 12 }}>
                      {[1, 2, 3, 4, 5].map(val => (
                        <button
                          key={val}
                          onClick={() => handleSaveRating(val)}
                          style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            color: val <= rating ? "#f59e0b" : "#e2e8f0",
                            fontSize: 24,
                            transition: "transform 0.15s ease"
                          }}
                        >
                          ★
                        </button>
                      ))}
                    </div>
                    {rating > 0 && (
                      <div style={{ animation: "fadeIn 0.2s ease-out", fontSize: 11, fontWeight: 700, color: "#16a34a", background: "#f0fdf4", display: "inline-block", padding: "6px 12px", borderRadius: 8 }}>
                        Avaliado com {rating} Estrelas! Excelente.
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", height: 320 }}>
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
                width: 32, height: 32, borderRadius: "50%", background: destInfo?.bg || "rgba(99,102,241,0.06)",
                display: "flex", alignItems: "center", justifyContent: "center", color: destInfo?.color || "#6366f1", flexShrink: 0, overflow: "hidden"
              }}>
                {destInfo?.svg ? (
                  <div style={{ width: 32, height: 32 }} dangerouslySetInnerHTML={{ __html: destInfo.svg }} />
                ) : (
                  <Icon name="globe" size={14} />
                )}
              </div>
              <div style={{ flex: 1 }}>
                <span style={{ fontSize: 10, color: "#94a3b8", fontWeight: 700 }}>VOCÊ RECEBEU EM</span>
                <div style={{ fontSize: 12, fontWeight: 800, color: "#1e1b4b", marginTop: 2 }}>
                  {destInfo?.label || "USD"} · {currentOrder.destination_account}
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
                  <>
                    <div style={{ fontSize: 13, fontWeight: 900, color: "#1e1b4b", marginBottom: 6 }}>Ação Requerida: Enviar USD</div>
                    <div style={{ fontSize: 11, color: "#64748b", lineHeight: 1.5, marginBottom: 12 }}>
                      Envia <strong>${parseFloat(currentOrder.amount_usd).toFixed(2)} USD</strong> para a conta do usuário e confirma o envio.
                    </div>
                    <button
                      onClick={handleConfirmSent}
                      style={{
                        width: "100%",
                        background: "linear-gradient(135deg,#10b981,#059669)",
                        border: "none",
                        color: "#fff",
                        padding: "10px 14px",
                        borderRadius: 10,
                        fontSize: 12,
                        fontWeight: 800,
                        cursor: "pointer",
                        boxShadow: "0 4px 12px rgba(16,185,129,0.18)"
                      }}
                    >
                      Já Enviei os Dólares (Confirmar Envio)
                    </button>
                  </>
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
