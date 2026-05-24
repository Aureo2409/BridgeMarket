import { useState } from "react";
import { DESTS } from "../../lib/constants.js";
import { StatusPill, Icon } from "../shared/UI.jsx";


export function OrderList({ orders, onCancel, currentUserId, onTransact, isMarket }) {
  const [activeTxId, setActiveTxId] = useState(null);

  const filteredOrders = isMarket
    ? orders.filter(o => o.user_id !== currentUserId && (o.status === "awaiting_payment" || o.status === "pending"))
    : orders.filter(o => o.user_id === currentUserId);

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

        return (
          <div key={o.id} className="o-card">
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
              <span>{d?.label} · {o.destination_account}</span>
              <span>{new Date(o.created_at).toLocaleDateString("pt-AO")}</span>
            </div>

            {/* Cancel Button for Own Orders */}
            {showCancel && (
              <div style={{ display: "flex", justifyContent: "flex-end", paddingTop: 8, borderTop: "1px solid rgba(229, 231, 235, 0.4)", marginTop: 10 }}>
                <button
                  onClick={() => onCancel(o.id)}
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

            {/* P2P Marketplace Transaction Panel */}
            {isMarket && onTransact && (
              activeTxId === o.id ? (
                <div style={{
                  marginTop: 12,
                  padding: "12px 14px",
                  background: "#f5f6ff",
                  border: "1.5px solid #e0e7ff",
                  borderRadius: 14,
                }}>
                  <div style={{ fontSize: 11, fontWeight: 800, color: "#4f46e5", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8, display: "flex", alignItems: "center", gap: 5 }}>
                    <Icon name="info" size={13} /> Instruções de Transação P2P
                  </div>
                  <div style={{ fontSize: 11, color: "#4b5563", lineHeight: 1.6, marginBottom: 12 }}>
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
                        onClick={() => {
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
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button
                      onClick={() => {
                        onTransact(o.id);
                        setActiveTxId(null);
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
                      Já Enviei os Dólares
                    </button>
                    <button
                      onClick={() => setActiveTxId(null)}
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
              ) : (
                <div style={{ display: "flex", justifyContent: "flex-end", paddingTop: 8, borderTop: "1px solid rgba(229, 231, 235, 0.4)", marginTop: 10 }}>
                  <button
                    onClick={() => setActiveTxId(o.id)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
                      border: "none",
                      color: "#fff",
                      padding: "6px 12px",
                      borderRadius: 8,
                      fontSize: 11,
                      fontWeight: 700,
                      cursor: "pointer",
                      boxShadow: "0 4px 12px rgba(99,102,241,0.15)",
                      transition: "all 0.2s"
                    }}
                    onMouseOver={(e) => { e.currentTarget.style.transform = "translateY(-1px)"; }}
                    onMouseOut={(e) => { e.currentTarget.style.transform = "translateY(0)"; }}
                  >
                    <Icon name="arrowUpRight" size={12} color="#fff" />
                    Transacionar P2P
                  </button>
                </div>
              )
            )}
          </div>
        );
      })}
    </>
  );
}
