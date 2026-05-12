import { useState, useEffect } from "react";
import { sb } from "../../lib/supabase.js";
import { DESTS, STATUS_META } from "../../lib/constants.js";
import { Toast } from "../shared/UI.jsx";

// ── ConfigField — each field needs its own component so hooks work correctly ──
function ConfigField({ field, initialValue, onSave }) {
  const [val, setVal] = useState(initialValue ?? "");
  useEffect(() => { setVal(initialValue ?? ""); }, [initialValue]);
  return (
    <div className="adm-card" style={{ cursor: "default", marginBottom: 9 }}>
      <div style={{ fontSize: 9, color: "#475569", fontWeight: 700, marginBottom: 6, textTransform: "uppercase", letterSpacing: .4 }}>
        {field.label}
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <input
          className="adm-inp" style={{ marginBottom: 0, flex: 1 }}
          type={field.type} placeholder={field.ph}
          value={val} onChange={e => setVal(e.target.value)}
        />
        <button
          onClick={() => onSave(field.key, val)}
          style={{ padding: "10px 14px", border: "none", borderRadius: 9, background: "#6366f1", color: "#fff", cursor: "pointer", fontSize: 12, fontWeight: 800, flexShrink: 0 }}>
          Guardar
        </button>
      </div>
    </div>
  );
}

const CONFIG_FIELDS = [
  { key: "mcx_number",       label: "Número MCX Express",       type: "text",   ph: "923 000 000" },
  { key: "mcx_name",         label: "Nome na conta MCX",        type: "text",   ph: "Bridge Marketplace" },
  { key: "min_amount_usd",   label: "Valor mínimo (USD)",       type: "number", ph: "10" },
  { key: "max_amount_usd",   label: "Valor máximo (USD)",       type: "number", ph: "5000" },
  { key: "support_whatsapp", label: "WhatsApp suporte (intl.)", type: "text",   ph: "244923000000" },
];

function ConfigTab({ config, updateConfig }) {
  return (
    <>
      <span className="adm-section">Configurações do marketplace</span>
      {CONFIG_FIELDS.map(f => (
        <ConfigField key={f.key} field={f} initialValue={config[f.key]} onSave={updateConfig} />
      ))}
    </>
  );
}

const ALERT_COLOR = {
  new_order:        "#f59e0b",
  payment_received: "#10b981",
  kyc_pending:      "#6366f1",
  cancelled:        "#ef4444",
};

export function AdminPanel({ user, onLogout }) {
  const [tab, setTab]         = useState("alerts");
  const [alerts, setAlerts]   = useState([]);
  const [orders, setOrders]   = useState([]);
  const [proofs, setProofs]   = useState({});
  const [stats, setStats]     = useState(null);
  const [rate, setRate]       = useState({ base_rate: 1150, margin: 15, applied_rate: 1165 });
  const [config, setConfig]   = useState({});
  const [newBase, setNB]      = useState("");
  const [newMargin, setNM]    = useState("");
  const [rateLoad, setRL]     = useState(false);
  const [toast, setToast]     = useState(null);

  const unread = alerts.filter(a => !a.read).length;
  const toast_ = (msg, type = "ok") => { setToast({ msg, type }); setTimeout(() => setToast(null), 3000); };

  useEffect(() => {
    boot();
    const ch = sb.channel("adm_rt")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "admin_alerts" }, p => {
        setAlerts(prev => [p.new, ...prev]);
        toast_("🔔 " + p.new.title);
      })
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "payment_proofs" }, p => {
        setProofs(prev => ({ ...prev, [p.new.order_id]: p.new }));
        toast_("📄 Comprovante recebido!");
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, () => { fetchOrders(); fetchStats(); })
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "exchange_rates" }, p => setRate(p.new))
      .subscribe();
    return () => sb.removeChannel(ch);
  }, []);

  async function boot() {
    await Promise.all([fetchAlerts(), fetchOrders(), fetchProofs(), fetchStats(), fetchConfig()]);
    const { data } = await sb.from("exchange_rates").select("*").order("fetched_at", { ascending: false }).limit(1).maybeSingle();
    if (data) setRate(data);
  }

  async function fetchAlerts() {
    const { data } = await sb.from("admin_alerts").select("*").order("created_at", { ascending: false }).limit(80);
    if (data) setAlerts(data);
  }
  async function fetchOrders() {
    const { data } = await sb.from("orders").select("*").order("created_at", { ascending: false }).limit(60);
    if (data) setOrders(data);
  }
  async function fetchProofs() {
    const { data } = await sb.from("payment_proofs").select("*").order("created_at", { ascending: false });
    if (data) { const m = {}; data.forEach(p => { m[p.order_id] = p; }); setProofs(m); }
  }
  async function fetchStats() {
    const { data } = await sb.from("daily_stats").select("*").maybeSingle();
    if (data) setStats(data);
  }
  async function fetchConfig() {
    const { data } = await sb.from("admin_config").select("key,value");
    if (data) setConfig(Object.fromEntries(data.map(r => [r.key, r.value])));
  }

  async function markRead(id) {
    await sb.from("admin_alerts").update({ read: true }).eq("id", id);
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, read: true } : a));
  }
  async function markAllRead() {
    await sb.from("admin_alerts").update({ read: true }).eq("read", false);
    setAlerts(prev => prev.map(a => ({ ...a, read: true })));
  }
  async function markSent(orderId) {
    const { error } = await sb.from("orders")
      .update({ status: "completed", sent_at: new Date().toISOString() })
      .eq("id", orderId);
    if (error) toast_(error.message, "err");
    else { toast_("✅ Marcado como enviado!"); fetchOrders(); fetchStats(); }
  }
  async function updateRate() {
    const base   = parseFloat(newBase);
    const margin = parseFloat(newMargin) || parseFloat(rate.margin);
    if (!base || base <= 0) { toast_("Taxa inválida", "err"); return; }
    setRL(true);
    const { error } = await sb.from("exchange_rates").insert({ base_rate: base, margin, source: "manual" });
    setRL(false);
    if (error) { toast_(error.message, "err"); return; }
    toast_("📊 Câmbio publicado!"); setNB(""); setNM("");
  }
  async function updateConfig(key, value) {
    await sb.from("admin_config").upsert({ key, value, updated_at: new Date().toISOString() });
    setConfig(prev => ({ ...prev, [key]: value }));
    toast_("✅ Configuração guardada!");
  }

  const TABS = [
    ["alerts",  `🔔${unread > 0 ? ` (${unread})` : ""}`],
    ["orders",  "📋"],
    ["rate",    "📊"],
    ["config",  "⚙️"],
  ];

  return (
    <div className="adm-shell">
      <Toast toast={toast} />

      <div className="adm-hdr">
        <div className="adm-logo">
          ⚙️ Bridge Admin
          {unread > 0 && <span className="adm-badge">{unread}</span>}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 10, color: "#334155", fontWeight: 600 }}>{user.email}</span>
          <button onClick={onLogout} style={{ background: "#0f172a", border: "1px solid rgba(255,255,255,.1)", borderRadius: 7, padding: "5px 10px", fontSize: 11, fontWeight: 700, color: "#94a3b8", cursor: "pointer" }}>Sair</button>
        </div>
      </div>

      <div className="adm-tabs">
        {TABS.map(([id, lbl]) => (
          <button key={id} className={`adm-tab${tab === id ? " on" : ""}`} onClick={() => setTab(id)}>{lbl}</button>
        ))}
      </div>

      <div className="adm-pg">

        {/* ── ALERTS ── */}
        {tab === "alerts" && (
          <>
            {/* Stats */}
            {stats && (
              <div className="adm-stat-grid">
                <div className="adm-stat">
                  <div className="adm-stat-val">{stats.orders_completed ?? 0}</div>
                  <div className="adm-stat-lbl">Pedidos hoje</div>
                </div>
                <div className="adm-stat">
                  <div className="adm-stat-val">${parseFloat(stats.total_usd_sent ?? 0).toFixed(0)}</div>
                  <div className="adm-stat-lbl">USD enviados hoje</div>
                </div>
                <div className="adm-stat">
                  <div className="adm-stat-val">{stats.orders_pending ?? 0}</div>
                  <div className="adm-stat-lbl">A aguardar pagto.</div>
                </div>
                <div className="adm-stat">
                  <div className="adm-stat-val">{parseFloat(stats.current_rate ?? rate.applied_rate).toLocaleString("pt-AO")}</div>
                  <div className="adm-stat-lbl">Kz/$ actual</div>
                </div>
              </div>
            )}

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <span className="adm-section" style={{ marginBottom: 0 }}>Notificações em tempo real</span>
              {unread > 0 && <button onClick={markAllRead} style={{ background: "none", border: "none", fontSize: 10, fontWeight: 700, color: "#6366f1", cursor: "pointer" }}>Marcar todas lidas</button>}
            </div>

            {alerts.length === 0 && (
              <div style={{ textAlign: "center", padding: "36px 0", color: "#334155", fontSize: 13, fontWeight: 600 }}>
                <div style={{ fontSize: 34, marginBottom: 8 }}>🔕</div>Sem notificações
              </div>
            )}

            {alerts.map(a => (
              <div key={a.id} className={`adm-card${!a.read ? " alert-new" : ""}`}
                onClick={() => !a.read && markRead(a.id)}>
                <div className="adm-alert-type" style={{ color: ALERT_COLOR[a.type] ?? "#94a3b8" }}>
                  {a.type === "new_order" ? "🛒 NOVO PEDIDO"
                    : a.type === "payment_received" ? "💰 PAGAMENTO RECEBIDO"
                    : "🔔 ALERTA"}
                </div>
                <div className="adm-alert-title">{a.title}</div>
                <div className="adm-alert-body">{a.body}</div>
                <div className="adm-alert-time">{new Date(a.created_at).toLocaleString("pt-AO")}</div>
                {a.type === "payment_received" && a.order_id && (
                  <button className="adm-sent-btn" onClick={e => { e.stopPropagation(); markSent(a.order_id); }}>
                    ✅ Confirmar envio do dólar
                  </button>
                )}
              </div>
            ))}
          </>
        )}

        {/* ── ORDERS ── */}
        {tab === "orders" && (
          <>
            <span className="adm-section">Todos os pedidos</span>
            {orders.map(o => {
              const d     = DESTS.find(x => x.id === o.destination);
              const sm    = STATUS_META[o.status] ?? STATUS_META.failed;
              const proof = proofs[o.id];
              return (
                <div key={o.id} className="adm-card" style={{ cursor: "default" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 7 }}>
                    <div>
                      <div style={{ fontSize: 9, fontFamily: "monospace", color: "#334155", fontWeight: 700 }}>{o.order_ref ?? "#" + o.id.slice(0, 8).toUpperCase()}</div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: "#e2e8f0", marginTop: 2 }}>
                        {d?.icon} {d?.label} · {o.destination_account}
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 17, fontWeight: 900, color: "#a5b4fc" }}>${parseFloat(o.amount_usd).toFixed(2)}</div>
                      <div style={{ fontSize: 10, color: "#334155", fontFamily: "monospace" }}>{parseFloat(o.amount_aoa).toLocaleString("pt-AO")} Kz</div>
                    </div>
                  </div>

                  <span className="pill" style={{ background: "rgba(255,255,255,.05)", color: sm.color, border: `1px solid ${sm.color}44`, marginBottom: 5 }}>
                    {sm.icon} {sm.label}
                  </span>

                  <div style={{ fontSize: 10, color: "#64748b", fontWeight: 500, marginTop: 4 }}>
                    Taxa {parseFloat(o.rate_applied).toLocaleString("pt-AO")} Kz/$ · {new Date(o.created_at).toLocaleString("pt-AO")}
                  </div>

                  {proof && (
                    <div className="proof-box">
                      <div style={{ fontSize: 9, fontWeight: 800, color: "#10b981", textTransform: "uppercase", letterSpacing: .4, marginBottom: 3 }}>
                        📄 Comprovante recebido
                      </div>
                      {proof.file_url?.startsWith("https") ? (
                        <a href={proof.file_url} target="_blank" rel="noopener noreferrer" className="proof-link">
                          🔗 Ver ficheiro →
                        </a>
                      ) : (
                        <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 500 }}>
                          {proof.file_name || proof.tx_reference || proof.file_url}
                        </div>
                      )}
                      <div style={{ fontSize: 9, color: "#334155", marginTop: 3 }}>
                        {new Date(proof.created_at).toLocaleString("pt-AO")}
                      </div>
                    </div>
                  )}

                  {(o.status === "awaiting_payment" || o.status === "payment_received") && (
                    <button className="adm-sent-btn" onClick={() => markSent(o.id)}>
                      ✅ Confirmar envio do dólar
                    </button>
                  )}
                </div>
              );
            })}
          </>
        )}

        {/* ── RATE ── */}
        {tab === "rate" && (
          <>
            <span className="adm-section">Câmbio actual</span>
            <div className="adm-card" style={{ marginBottom: 14, cursor: "default" }}>
              <div style={{ fontSize: 26, fontWeight: 900, color: "#a5b4fc", letterSpacing: -1 }}>
                {parseFloat(rate.applied_rate).toLocaleString("pt-AO")} Kz/$
              </div>
              <div style={{ fontSize: 11, color: "#475569", marginTop: 3, fontWeight: 600 }}>
                Base {parseFloat(rate.base_rate).toLocaleString("pt-AO")} + Margem {parseFloat(rate.margin)} Kz
              </div>
            </div>

            <span className="adm-section">Publicar novo câmbio</span>
            <div className="adm-card" style={{ cursor: "default" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 10 }}>
                <div>
                  <div style={{ fontSize: 9, color: "#475569", fontWeight: 700, marginBottom: 3, textTransform: "uppercase", letterSpacing: .4 }}>Base (Kz)</div>
                  <input className="adm-inp" type="number" placeholder={rate.base_rate} value={newBase} onChange={e => setNB(e.target.value)} />
                </div>
                <div>
                  <div style={{ fontSize: 9, color: "#475569", fontWeight: 700, marginBottom: 3, textTransform: "uppercase", letterSpacing: .4 }}>Margem (Kz)</div>
                  <input className="adm-inp" type="number" placeholder={rate.margin} value={newMargin} onChange={e => setNM(e.target.value)} />
                </div>
              </div>
              {(newBase || newMargin) && (
                <div style={{ display: "flex", justifyContent: "space-between", padding: "9px 12px", background: "rgba(99,102,241,.1)", borderRadius: 9, marginBottom: 10, fontSize: 12 }}>
                  <span style={{ color: "#94a3b8", fontWeight: 600 }}>Nova taxa final</span>
                  <span style={{ fontWeight: 800, color: "#a5b4fc" }}>
                    {((parseFloat(newBase) || parseFloat(rate.base_rate)) + (parseFloat(newMargin) || parseFloat(rate.margin))).toLocaleString("pt-AO")} Kz
                  </span>
                </div>
              )}
              <button className="adm-btn" onClick={updateRate} disabled={rateLoad}>
                {rateLoad ? "A publicar..." : "📊 Publicar — propaga em realtime"}
              </button>
            </div>
          </>
        )}

        {/* ── CONFIG ── */}
        {tab === "config" && (
          <ConfigTab config={config} updateConfig={updateConfig} />
        )}

      </div>
    </div>
  );
}
