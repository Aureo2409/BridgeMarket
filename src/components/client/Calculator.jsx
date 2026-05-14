import { useState } from "react";
import { DESTS } from "../../lib/constants.js";

const Icon = ({ name, size = 16, color = "currentColor", style }) => {
  const paths = {
    globe: <><circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></>,
    bank: <><rect x="3" y="21" width="18" height="2" rx="1" ry="1" /><rect x="5" y="11" width="3" height="8" rx="1" ry="1" /><rect x="11" y="11" width="3" height="8" rx="1" ry="1" /><rect x="17" y="11" width="3" height="8" rx="1" ry="1" /><path d="M12 2L2 9h20L12 2z" /></>,
    arrowRight: <><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></>,
    chart: <><line x1="12" y1="20" x2="12" y2="10" /><line x1="18" y1="20" x2="18" y2="4" /><line x1="6" y1="20" x2="6" y2="16" /></>,
    user: <><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></>,
    alertTriangle: <><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></>
  };
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}>
      {paths[name]}
    </svg>
  );
};

export function Calculator({ appliedRate, rate, onSubmit, loading, user, kycStep, config }) {
  const applied = parseFloat(appliedRate) || 1165;
  const [usd, setUsd] = useState("100");
  const [aoa, setAoa] = useState(() => Math.round(100 * applied).toLocaleString("pt-AO"));
  const [field, setField] = useState("usd");
  const [dest, setDest] = useState("redotpay");
  const [account, setAcc] = useState("");

  const destInfo = DESTS.find(d => d.id === dest);
  const usdNum = parseFloat(usd) || 0;
  const minUsd = parseFloat(config?.min_amount_usd) || 10;
  const maxUsd = parseFloat(config?.max_amount_usd) || 5000;
  const isOutOfLimits = usdNum > 0 && (usdNum < minUsd || usdNum > maxUsd);

  function onUsd(v) { setUsd(v); setField("usd"); const n = parseFloat(v) || 0; setAoa(n > 0 ? Math.round(n * applied).toLocaleString("pt-AO") : ""); }
  function onAoa(v) { setAoa(v); setField("aoa"); const n = parseFloat(v.replace(/\s/g, "").replace(/\./g, "").replace(",", ".")) || 0; setUsd(n > 0 ? (n / applied).toFixed(2) : ""); }
  function swap() {
    if (field === "usd") { setField("aoa"); const n = parseFloat((aoa + "").replace(/\s/g, "").replace(/\./g, "").replace(",", ".")) || 0; if (n > 0) setUsd((n / applied).toFixed(2)); }
    else { setField("usd"); const n = parseFloat(usd) || 0; if (n > 0) setAoa(Math.round(n * applied).toLocaleString("pt-AO")); }
  }
  function submit() { onSubmit({ usd: usdNum, aoa: Math.round(usdNum * applied), dest, account, appliedRate: applied }); }

  return (
    <>
      <div className="hero">
        <div style={{ fontSize: 10, fontWeight: 700, opacity: .7, textTransform: "uppercase", letterSpacing: .5, marginBottom: 3 }}>Taxa de hoje</div>
        <div style={{ fontSize: 34, fontWeight: 900, letterSpacing: -2 }}>{applied.toLocaleString("pt-AO")} Kz</div>
        <div style={{ fontSize: 11, opacity: .7, fontWeight: 600 }}>por 1 USD · base {parseFloat(rate.base_rate).toLocaleString("pt-AO")} + margem {parseFloat(rate.margin)} Kz</div>
      </div>

      <div className="card">
        <div className={`calc-box${field === "usd" ? " active" : ""}`} onClick={() => setField("usd")}>
          <div className="calc-flag" style={{ display: "flex", alignItems: "center", gap: 6 }}><Icon name="globe" size={14} /> USD — Dólar americano</div>
          <input className="calc-num" type="number" placeholder="0.00" value={usd}
            onChange={e => onUsd(e.target.value)} onFocus={() => setField("usd")} />
          <div className="calc-hint">Digita o valor em dólares</div>
        </div>
        <div className="swap-row">
          <div className="swap-line" />
          <button className="swap-btn" onClick={swap}><Icon name="arrowRight" size={16} style={{ transform: "rotate(90deg)" }} /></button>
          <div className="swap-line" />
        </div>
        <div className={`calc-box${field === "aoa" ? " active" : ""}`} onClick={() => setField("aoa")}>
          <div className="calc-flag" style={{ display: "flex", alignItems: "center", gap: 6 }}><Icon name="bank" size={14} /> AOA — Kwanza angolano</div>
          <input className="calc-num" type="text" placeholder="0" value={aoa}
            onChange={e => onAoa(e.target.value)} onFocus={() => setField("aoa")} />
          <div className="calc-hint">Ou digita o valor em Kwanzas</div>
        </div>
        <div className="rate-note">
          <span style={{ fontSize: 11, color: "#6b7280", fontWeight: 600 }}>Taxa aplicada</span>
          <span className="rate-val" style={{ display: "flex", alignItems: "center", gap: 6 }}><Icon name="chart" size={14} /> 1 USD = {applied.toLocaleString("pt-AO")} Kz</span>
        </div>
      </div>

      <div className="card">
        <span className="slbl">Para onde vai o dólar?</span>
        <div className="dest-grid">
          {DESTS.map(d => (
            <div key={d.id} className={`dest-card${dest === d.id ? " sel" : ""}`}
              style={dest === d.id ? { borderColor: d.color, background: d.bg } : {}}
              onClick={() => { setDest(d.id); setAcc(""); }}>
              <div className="dest-logo" dangerouslySetInnerHTML={{ __html: d.svg }} />
              <div>
                <div className="d-name" style={dest === d.id ? { color: d.color } : {}}>{d.label}</div>
                <div className="d-desc">{d.desc}</div>
              </div>
            </div>
          ))}
        </div>
        <label className="lbl" style={{ marginTop: 6 }}>{destInfo?.hint ?? "Conta de destino"}</label>
        <input className="inp" type="text" placeholder={destInfo?.hint} value={account} onChange={e => setAcc(e.target.value)} />
      </div>

      {isOutOfLimits && (
        <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 11, padding: "9px 13px", fontSize: 12, color: "#b91c1c", fontWeight: 600, marginBottom: 11 }}>
          <Icon name="alertTriangle" size={16} style={{ flexShrink: 0 }} /> O valor deve estar entre ${minUsd} e ${maxUsd}.
        </div>
      )}

      {!user && <div className="warn" style={{ display: "flex", alignItems: "center", gap: 8 }}><Icon name="user" size={16} /> Faz login para criar um pedido.</div>}

      <button className="btn btn-p" onClick={submit} disabled={!user || usdNum <= 0 || isOutOfLimits || !account.trim() || loading}>
        {loading ? `A criar pedido...` : `Comprar $${usd || "0"} → ${destInfo?.label}`}
      </button>
      <div style={{ textAlign: "center", marginTop: 7, fontSize: 10, color: "#9ca3af", fontWeight: 600 }}>
        O administrador é notificado instantaneamente
      </div>
    </>
  );
}
