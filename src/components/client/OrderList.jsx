import { DESTS } from "../../lib/constants.js";
import { StatusPill, Icon } from "../shared/UI.jsx";


export function OrderList({ orders }) {
  if (orders.length === 0) {
    return (
      <div className="card" style={{ textAlign: "center", padding: "36px 18px" }}>
        <div style={{ marginBottom: 16, display: "flex", justifyContent: "center" }}><Icon name="inbox" size={40} color="#9ca3af" /></div>
        <div style={{ fontSize: 14, fontWeight: 800, color: "#1e1b4b", marginBottom: 4 }}>Sem pedidos ainda</div>
        <div style={{ fontSize: 12, color: "#9ca3af" }}>Usa a calculadora para comprar dólar</div>
      </div>
    );
  }

  return (
    <>
      {orders.map(o => {
        const d = DESTS.find(x => x.id === o.destination);
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
          </div>
        );
      })}
    </>
  );
}
