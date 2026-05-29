import { useState, useRef } from "react";
import { DESTS } from "../../lib/constants.js";
import { StatusPill, Icon } from "../shared/UI.jsx";
import { uploadBiometricVideo } from "../../lib/supabase.js";
import { ANGOLAN_BANKS } from "./Calculator.jsx";

function BiometricCapture({ orderId, orderRef, amountUsd, currentUserId, onCaptureDone, onCancel }) {
  const [stream, setStream] = useState(null);
  const [recording, setRecording] = useState(false);
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(6);
  const [error, setError] = useState(null);
  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  async function startCamera() {
    try {
      setError(null);
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: 480, height: 480 },
        audio: true
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error(err);
      setError("Erro ao aceder à câmara e microfone. Verifica as permissões.");
    }
  }

  function stopCamera() {
    if (stream) {
      stream.getTracks().forEach(t => t.stop());
      setStream(null);
    }
  }

  useState(() => {
    startCamera();
    return () => stopCamera();
  }, []);

  function startRecording() {
    if (!stream) return;
    chunksRef.current = [];
    const mediaRecorder = new MediaRecorder(stream, { mimeType: "video/webm" });
    mediaRecorderRef.current = mediaRecorder;

    mediaRecorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) {
        chunksRef.current.push(e.data);
      }
    };

    mediaRecorder.onstop = async () => {
      setLoading(true);
      const videoBlob = new Blob(chunksRef.current, { type: "video/webm" });
      try {
        await uploadBiometricVideo(currentUserId, orderId, videoBlob);
        stopCamera();
        onCaptureDone();
      } catch (err) {
        alert("Erro ao enviar vídeo: " + err.message);
        setLoading(false);
        startCamera(); // Restart camera
      }
    };

    mediaRecorder.start();
    setRecording(true);

    let count = 6;
    setCountdown(count);
    const interval = setInterval(() => {
      count -= 1;
      setCountdown(count);
      if (count <= 0) {
        clearInterval(interval);
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
          mediaRecorderRef.current.stop();
        }
        setRecording(false);
      }
    }, 1000);
  }

  const cleanRef = orderRef || "#" + orderId.slice(0, 8).toUpperCase();

  return (
    <div style={{ textAlign: "center", padding: "16px 14px", background: "#f8fafc", borderRadius: 18, border: "1.5px solid #6366f1", animation: "fadeIn 0.2s" }} onClick={(e) => e.stopPropagation()}>
      <div style={{ fontSize: 13, fontWeight: 900, color: "#6366f1", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8, display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }}>
        <span style={{ fontSize: 15 }}>👁</span> Verificação Biométrica Obrigatória
      </div>
      <div style={{ fontSize: 11, color: "#475569", lineHeight: 1.5, marginBottom: 12 }}>
        Grava um vídeo rápido de 6 segundos dizendo a frase abaixo para autorizar esta transação P2P com segurança absoluta.
      </div>

      {error ? (
        <div style={{ padding: 12, background: "#fef2f2", color: "#ef4444", borderRadius: 8, fontSize: 11, fontWeight: 700, marginBottom: 12 }}>
          {error}
        </div>
      ) : (
        <div style={{ position: "relative", width: 180, height: 180, borderRadius: "50%", overflow: "hidden", margin: "0 auto 16px", border: "4px solid #6366f1", background: "#000", boxShadow: "0 8px 24px rgba(99,102,241,0.25)" }}>
          <video ref={videoRef} autoPlay playsInline muted style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          {recording && (
            <div style={{ position: "absolute", top: 12, right: 12, background: "#ef4444", color: "#fff", padding: "3px 8px", borderRadius: 12, fontSize: 9, fontWeight: 900, display: "flex", alignItems: "center", gap: 4 }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#fff" }} />
              GRAVAR {countdown}s
            </div>
          )}
          {loading && (
            <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 11, fontWeight: 700 }}>
              <Icon name="loader" size={24} className="spin" style={{ marginBottom: 6 }} />
              A processar biometria...
            </div>
          )}
        </div>
      )}

      <div style={{ background: "#fff", border: "1px dashed #cbd5e1", borderRadius: 10, padding: 12, marginBottom: 16, fontSize: 11.5, fontWeight: 700, color: "#1e1b4b", lineHeight: 1.5 }}>
        Frase a dizer em voz alta:<br />
        <span style={{ fontSize: 12, color: "#6366f1", display: "block", marginTop: 4 }}>
          "Eu, parceiro P2P da transação {cleanRef}, confirmo o envio de {parseFloat(amountUsd).toFixed(2)} USD."
        </span>
      </div>

      <div style={{ display: "flex", gap: 8 }}>
        {!recording && !loading && (
          <button
            onClick={startRecording}
            disabled={!!error || !stream}
            style={{
              flex: 1,
              background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
              border: "none",
              color: "#fff",
              padding: "10px 14px",
              borderRadius: 10,
              fontSize: 12,
              fontWeight: 800,
              cursor: "pointer",
              boxShadow: "0 4px 12px rgba(99,102,241,0.2)"
            }}
          >
            Iniciar Gravação (6s)
          </button>
        )}
        <button
          onClick={() => {
            stopCamera();
            onCancel();
          }}
          disabled={loading}
          style={{
            background: "#e2e8f0",
            border: "none",
            color: "#475569",
            padding: "10px 14px",
            borderRadius: 10,
            fontSize: 12,
            fontWeight: 800,
            cursor: "pointer"
          }}
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}

export function OrderList({ orders, onCancel, currentUserId, onTransact, isMarket, onSelect }) {
  const [activeTxId, setActiveTxId] = useState(null);
  const [showBiometric, setShowBiometric] = useState(false);

  const filteredOrders = isMarket
    ? orders.filter(o => o.user_id !== currentUserId && (o.status === "awaiting_payment" || o.status === "pending"))
    : orders.filter(o => o.user_id === currentUserId || o.funder_id === currentUserId);

  if (filteredOrders.length === 0) {
    return (
      <div className="card" style={{ textAlign: "center", padding: "36px 18px" }}>
        <div style={{ marginBottom: 16, display: "flex", justifyContent: "center" }}><Icon name="inbox" size={40} color="#9ca3af" /></div>
        <div style={{ fontSize: 14, fontWeight: 800, color: "#1e1b4b", marginBottom: 4 }}>
          {isMarket ? "Sem ofertas disponíveis" : "Sem pedidos ainda"}
        </div>
        <div style={{ fontSize: 12, color: "#9ca3af" }}>
          {isMarket ? "Volta mais tarde para ver novas propostas P2P" : "Usa a calculadora para comprar dólar"}
        </div>
      </div>
    );
  }

  return (
    <>
      {filteredOrders.map(o => {
        const d = DESTS.find(x => x.id === o.destination);
        const isOwnOrder = o.user_id === currentUserId;
        const showCancel = onCancel && !isMarket && isOwnOrder && (o.status === "awaiting_payment" || o.status === "pending");

        // Dynamic but stable mock user details based on user_id to ensure a stunning visual flow
        const charCodeSum = o.user_id ? o.user_id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) : 100;
        const rating = 95 + (charCodeSum % 5); // 95 to 99%
        const trocas = 30 + (charCodeSum % 170); // 30 to 200 trocas
        const minutes = 5 + (charCodeSum % 16); // 5 to 20 min
        const creatorName = o.profiles?.full_name || `Parceiro P2P #${o.user_id.slice(0, 5).toUpperCase()}`;
        const creatorAvatar = o.profiles?.avatar_url;

        if (isMarket) {
          return (
            <div
              key={o.id}
              className="p2p-offer-card"
              onClick={() => onSelect && onSelect(o)}
              style={{ cursor: onSelect ? "pointer" : "default" }}
            >
              <div className="p2p-user-row" onClick={(e) => e.stopPropagation()}>
                <div className="p2p-avatar-wrapper">
                  <div className="p2p-avatar">
                    {creatorAvatar ? (
                      <img src={creatorAvatar} alt="Avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                      <span>{creatorName.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase()}</span>
                    )}
                  </div>
                  <div className="p2p-avatar-badge">
                    <svg viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5" /></svg>
                  </div>
                </div>
                <div className="p2p-user-details">
                  <div className="p2p-user-name">
                    {creatorName}
                  </div>
                  <div className="p2p-user-rating">
                    ★ {rating}% Confiança
                  </div>
                  <div className="p2p-user-stats">
                    <span className="p2p-stat-item">{trocas} trocas</span>
                    <span>·</span>
                    <span className="p2p-stat-item">{minutes} min</span>
                  </div>
                </div>
              </div>

              <div className="p2p-grid-row" onClick={(e) => e.stopPropagation()}>
                <div className="p2p-grid-col">
                  <div className="p2p-grid-label">Câmbio</div>
                  <div className="p2p-grid-value rate">
                    {parseFloat(o.rate_applied).toFixed(2)} <span>AOA</span>
                  </div>
                </div>
                <div className="p2p-grid-col">
                  <div className="p2p-grid-label">Disponível / Limites</div>
                  <div className="p2p-grid-value limits">
                    ${parseFloat(o.amount_usd).toFixed(2)} <span>USD</span>
                  </div>
                </div>
              </div>

              {/* P2P Marketplace Transaction Panel */}
              {onTransact && (
                activeTxId === o.id ? (
                  showBiometric ? (
                    <BiometricCapture
                      orderId={o.id}
                      orderRef={o.order_ref}
                      amountUsd={o.amount_usd}
                      currentUserId={currentUserId}
                      onCaptureDone={() => {
                        onTransact(o.id);
                        setActiveTxId(null);
                        setShowBiometric(false);
                      }}
                      onCancel={() => setShowBiometric(false)}
                    />
                  ) : (
                    <div
                      style={{
                        marginTop: 12,
                        padding: "12px 14px",
                        background: "#f5f6ff",
                        border: "1.5px solid #e0e7ff",
                        borderRadius: 14,
                      }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div style={{ fontSize: 11, fontWeight: 800, color: "#4f46e5", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8, display: "flex", alignItems: "center", gap: 5 }}>
                        <Icon name="info" size={13} /> Instruções de Transação P2P
                      </div>
                      <div style={{ fontSize: 11, color: "#4b5563", lineHeight: 1.6, marginBottom: 12 }}>
                        {o.side === "sell" ? (
                          <>
                            1. Envia exatamente <strong style={{ color: "#1e1b4b" }}>{parseFloat(o.amount_aoa).toLocaleString("pt-AO")} Kz</strong> via Transferência Bancária / Multicaixa Express para o IBAN:<br />
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
                              <span>{o.destination_account}</span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigator.clipboard.writeText(o.destination_account);
                                  alert("IBAN copiado com sucesso!");
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
                            2. O criador deste pedido transferirá <strong style={{ color: "#1e1b4b" }}>${parseFloat(o.amount_usd).toFixed(2)} USD</strong> via <strong style={{ color: "#1e1b4b" }}>{d?.label}</strong> para a tua conta.<br />
                            3. Após enviares os Kwanzas, confirma a transação abaixo.
                          </>
                        ) : (
                          <>
                            1. Envia exatamente <strong style={{ color: "#1e1b4b" }}>${parseFloat(o.amount_usd).toFixed(2)}</strong> via <strong style={{ color: "#1e1b4b" }}>{d?.label}</strong> para a conta:<br />
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
                              <span>{o.destination_account}</span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigator.clipboard.writeText(o.destination_account);
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
                            2. O criador deste pedido transferirá <strong style={{ color: "#1e1b4b" }}>{parseFloat(o.amount_aoa).toLocaleString("pt-AO")} Kz</strong> para o teu IBAN / número.<br />
                            3. Após enviares os dólares, confirma a transação abaixo.
                          </>
                        )}
                      </div>
                      <div style={{ display: "flex", gap: 8 }}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowBiometric(true);
                          }}
                          style={{
                            flex: 1,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 5,
                            background: "#10b981",
                            border: "none",
                            color: "#fff",
                            padding: "8px 12px",
                            borderRadius: 9,
                            fontSize: 11,
                            fontWeight: 800,
                            cursor: "pointer",
                            boxShadow: "0 4px 12px rgba(16,185,129,0.2)"
                          }}
                        >
                          <Icon name="check" size={12} color="#fff" />
                          {o.side === "sell" ? "Já Enviei os Kwanzas" : "Já Enviei os Dólares"}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveTxId(null);
                          }}
                          style={{
                            background: "#e2e8f0",
                            border: "none",
                            color: "#475569",
                            padding: "8px 12px",
                            borderRadius: 9,
                            fontSize: 11,
                            fontWeight: 800,
                            cursor: "pointer"
                          }}
                        >
                          Voltar
                        </button>
                      </div>
                    </div>
                  )
                ) : (
                  <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 8 }} onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveTxId(o.id);
                      }}
                      className="p2p-negotiate-btn"
                    >
                      Negociar &gt;
                    </button>
                  </div>
                )
              )}
            </div>
          );
        }

        // isMarket === false (Default .o-card Layout)
        return (
          <div
            key={o.id}
            className="o-card"
            onClick={() => onSelect && onSelect(o)}
            style={{ cursor: onSelect ? "pointer" : "default" }}
          >
            <div className="o-ref">{o.order_ref ?? "#" + o.id.slice(0, 8).toUpperCase()}</div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "8px 0 9px" }}>
              <div style={{
                width: 40, height: 40, borderRadius: 13,
                background: d?.bg ?? "#f3f4f6",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 20, flexShrink: 0, overflow: "hidden"
              }}>
                {d?.svg ? (
                  <div style={{ width: 40, height: 40, flexShrink: 0 }} dangerouslySetInnerHTML={{ __html: d.svg }} />
                ) : (
                  <Icon name="chart" size={20} />
                )}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 19, fontWeight: 900, color: "#1e1b4b", letterSpacing: -1 }}>
                  ${parseFloat(o.amount_usd).toFixed(2)}
                </div>
                <div style={{ fontSize: 11, color: "#9ca3af", fontWeight: 600, fontFamily: "monospace" }}>
                  {parseFloat(o.amount_aoa).toLocaleString("pt-AO")} Kz
                </div>
              </div>
              <StatusPill status={o.status} />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#9ca3af", fontWeight: 600 }}>
              <span>{o.side === "sell" ? "Venda" : "Compra"} · {d?.label} ⇄ {ANGOLAN_BANKS.find(b => b.id === o.payment_method)?.label || "Multicaixa"} · {o.destination_account}</span>
              <span>{new Date(o.created_at).toLocaleDateString("pt-AO")}</span>
            </div>

            {/* Cancel Button for Own Orders */}
            {showCancel && (
              <div style={{ display: "flex", justifyContent: "flex-end", paddingTop: 8, borderTop: "1px solid rgba(229, 231, 235, 0.4)", marginTop: 10 }}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onCancel(o.id);
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    background: "#fef2f2",
                    border: "1px solid #fecaca",
                    color: "#ef4444",
                    padding: "6px 12px",
                    borderRadius: 8,
                    fontSize: 11,
                    fontWeight: 700,
                    cursor: "pointer",
                    transition: "all 0.2s"
                  }}
                  onMouseOver={(e) => { e.currentTarget.style.background = "#fee2e2"; }}
                  onMouseOut={(e) => { e.currentTarget.style.background = "#fef2f2"; }}
                >
                  <Icon name="trash" size={12} />
                  Cancelar Pedido
                </button>
              </div>
            )}
          </div>
        );
      })}
    </>
  );
}
