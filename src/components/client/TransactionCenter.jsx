import { useState, useEffect, useRef } from "react";
import { sb, uploadProof } from "../../lib/supabase.js";
import { DESTS } from "../../lib/constants.js";
import { Icon, StatusPill } from "../shared/UI.jsx";

export function TransactionCenter({ order, user, onBack, onCancel }) {
  const [tab, setTab] = useState("partner"); // "partner" or "chat"
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [partnerProfile, setPartnerProfile] = useState(null);
  const [rating, setRating] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [copied, setCopied] = useState(false);
  const chatEndRef = useRef(null);

  const destInfo = DESTS.find(d => d.id === order?.destination);
  const isCreator = user?.id === order?.user_id;

  // Real-time Chat Sync
  useEffect(() => {
    fetchMessages();
    fetchPartnerProfile();

    const channel = sb.channel(`chat_messages_${order.id}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "chat_messages", filter: `order_id=eq.${order.id}` }, () => {
        fetchMessages();
      })
      .subscribe();

    return () => sb.removeChannel(channel);
  }, [order.id]);

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
    // If current user is order creator, partner is funder. Otherwise, partner is order creator.
    const partnerId = isCreator ? order?.funder_id : order?.user_id;
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
      setPartnerProfile(data);
    }
  }

  async function handleSendMessage(e) {
    e?.preventDefault();
    if (!newMessage.trim()) return;

    const { error } = await sb.from("chat_messages").insert({
      order_id: order.id,
      user_id: order.user_id,
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
      const { signedUrl } = await uploadProof(user.id, order.id, file);
      
      // Insert chat message with the uploaded file url
      const { error } = await sb.from("chat_messages").insert({
        order_id: order.id,
        user_id: order.user_id,
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
    navigator.clipboard.writeText(order.order_ref ?? order.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  // Get active step index based on order status
  // Steps: 0: Solicitar envio, 1: Correspondência de parceiro, 2: Enviar fundos, 3: Transação concluída
  let activeStep = 0;
  if (order.status === "awaiting_payment") activeStep = 0;
  if (order.status === "pending" || order.funder_id) activeStep = 1;
  if (order.status === "pending" && order.receipt_url) activeStep = 2;
  if (order.status === "completed") activeStep = 3;

  const STEPS = ["Solicitar envio", "Correspondência de parceiro", "Enviar fundos", "Transação concluída"];

  return (
    <div style={{ animation: "fadeIn 0.25s ease-out" }}>
      {/* Back Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <button onClick={onBack} style={{ background: "none", border: "none", color: "#6366f1", fontSize: 12, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
          <Icon name="arrowLeft" size={14} /> Voltar aos pedidos
        </button>
        {onCancel && isCreator && (order.status === "awaiting_payment" || order.status === "pending") && (
          <button onClick={() => onCancel(order.id)} style={{ background: "none", border: "none", color: "#ef4444", fontSize: 12, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
            <Icon name="ban" size={14} /> Cancelar Pedido
          </button>
        )}
      </div>

      {/* Premium Step Header */}
      <div style={{ display: "flex", justifyContent: "space-between", gap: 6, marginBottom: 24, background: "#f8fafc", padding: "12px 16px", borderRadius: 12, border: "1px solid #e2e8f0" }}>
        {STEPS.map((s, idx) => {
          const isDone = activeStep >= idx && order.status !== "cancelled";
          const isActive = activeStep === idx && order.status !== "cancelled";
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
          {order.status === "completed" 
            ? `$${parseFloat(order.amount_usd).toFixed(2)} USD foram adicionados com sucesso!`
            : order.status === "cancelled"
              ? "Este pedido foi cancelado"
              : `Pedido ${order.order_ref ?? "P2P"} em processamento`}
        </h2>
        <p style={{ fontSize: 12, color: "#64748b", fontWeight: 500 }}>
          {order.status === "completed"
            ? `Você economizou $0.08 USDC de taxas P2P nesta transação!`
            : order.status === "cancelled"
              ? "A transação foi cancelada e os fundos não foram transferidos."
              : "Acompanhe e confirme os dados abaixo para transacionar com segurança."}
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
                {/* Profile Circle Avatar */}
                <div style={{ display: "flex", justifyContent: "center", marginBottom: 14 }}>
                  <div style={{
                    width: 70, height: 70, borderRadius: "50%",
                    background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
                    color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 24, fontWeight: 900,
                    boxShadow: "0 6px 16px rgba(99,102,241,0.2)"
                  }}>
                    {partnerProfile?.full_name?.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase() || "BR"}
                  </div>
                </div>

                <div style={{ fontSize: 16, fontWeight: 900, color: "#1e1b4b", marginBottom: 4 }}>
                  {partnerProfile?.full_name || "Aguardando Parceiro..."}
                </div>
                <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 16 }}>
                  {partnerProfile?.full_name === "Administrador Bridge" ? "Suporte Oficial" : `Membro desde ${new Date(partnerProfile?.created_at || Date.now()).toLocaleDateString("pt-PT", { month: "short", year: "numeric" })}`}
                </div>

                {/* Rating Interactive Questionnaire */}
                <div style={{ marginTop: 24, paddingTop: 16, borderTop: "1px solid #f1f5f9" }}>
                  <div style={{ fontSize: 12, fontWeight: 800, color: "#475569", marginBottom: 8 }}>
                    Como foi a experiência com seu parceiro?
                  </div>
                  <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 12 }}>
                    {[1, 2, 3, 4, 5].map(val => (
                      <button
                        key={val}
                        onClick={() => setRating(val)}
                        style={{
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          color: val <= rating ? "#f59e0b" : "#e2e8f0",
                          fontSize: 24,
                          transition: "transform 0.15s ease"
                        }}
                        onMouseEnter={e => e.currentTarget.style.transform = "scale(1.2)"}
                        onMouseLeave={e => e.currentTarget.style.transform = "scale(1.0)"}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                  {rating > 0 && (
                    <div style={{ animation: "fadeIn 0.2s ease-out", fontSize: 11, fontWeight: 700, color: "#16a34a", background: "#f0fdf4", display: "inline-block", padding: "6px 12px", borderRadius: 8 }}>
                      Avaliado com {rating} Estrelas! Obrigado pelo seu feedback.
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* Real-time Chat interface */
              <div style={{ display: "flex", flexDirection: "column", height: 320 }}>
                {/* Scrollable messages container */}
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

                            {/* Render Attachment in message if exists */}
                            {msg.file_url && (
                              <div style={{ marginTop: 8, borderTop: isMe ? "1px solid rgba(255,255,255,0.2)" : "1px solid #cbd5e1", paddingTop: 6 }}>
                                {msg.file_url.match(/\.(jpeg|jpg|gif|png|webp)/i) ? (
                                  <a href={msg.file_url} target="_blank" rel="noreferrer">
                                    <img src={msg.file_url} alt="Anexo" style={{ maxWidth: "100%", maxHeight: 110, borderRadius: 8, marginTop: 4, border: "1px solid #cbd5e1" }} />
                                  </a>
                                ) : (
                                  <a href={msg.file_url} target="_blank" rel="noreferrer" style={{ display: "flex", alignItems: "center", gap: 5, color: isMe ? "#fff" : "#6366f1", textDecoration: "underline", fontSize: 10 }}>
                                    <Icon name="file" size={12} /> Ver documento anexo
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

                {/* Input row */}
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
                    onMouseOver={e => e.currentTarget.style.background = "#e2e8f0"}
                    onMouseOut={e => e.currentTarget.style.background = "#f1f5f9"}
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
                      cursor: "pointer", transition: "all 0.2s",
                      boxShadow: "0 4px 10px rgba(99,102,241,0.2)"
                    }}
                    onMouseOver={e => e.currentTarget.style.transform = "scale(1.05)"}
                    onMouseOut={e => e.currentTarget.style.transform = "scale(1)"}
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
            <StatusPill status={order.status} />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {/* Sender row */}
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
                {parseFloat(order.amount_aoa).toLocaleString("pt-AO")} Kz
              </span>
            </div>

            {/* Receiver row */}
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
                  {destInfo?.label || "USD"} · {order.destination_account}
                </div>
              </div>
              <span style={{ fontSize: 14, fontWeight: 900, color: "#6366f1" }}>
                ${parseFloat(order.amount_usd).toFixed(2)}
              </span>
            </div>

            {/* Exchange rate row */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: 10, borderBottom: "1px solid #f1f5f9" }}>
              <span style={{ fontSize: 11, color: "#64748b", fontWeight: 700 }}>Taxa de câmbio líquida</span>
              <span style={{ fontSize: 12, fontWeight: 800, color: "#1e1b4b" }}>
                1 USD = {parseFloat(order.rate_applied).toLocaleString("pt-AO")} Kz
              </span>
            </div>

            {/* Transaction ID row */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <span style={{ fontSize: 10, color: "#94a3b8", fontWeight: 700 }}>ID DA TRANSAÇÃO</span>
                <div style={{ fontSize: 11, fontWeight: 800, color: "#1e1b4b", fontFamily: "monospace", marginTop: 2 }}>
                  {order.order_ref ?? order.id.slice(0, 18).toUpperCase()}
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
        </div>

      </div>
    </div>
  );
}
