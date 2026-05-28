import { useState } from "react";
import { DESTS } from "../../lib/constants.js";
import { Icon } from "../shared/UI.jsx";

export function Calculator({ appliedRate, rate, onSubmit, loading, user, kycStep, config }) {
  const applied = parseFloat(appliedRate) || 1165;
  const [opType, setOpType] = useState("buy"); // "buy" or "sell"
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

  function onUsd(v) { 
    setUsd(v); 
    setField("usd"); 
    const n = parseFloat(v) || 0; 
    setAoa(n > 0 ? Math.round(n * applied).toLocaleString("pt-AO") : ""); 
  }

  function onAoa(v) { 
    setAoa(v); 
    setField("aoa"); 
    const n = parseFloat(v.replace(/\s/g, "").replace(/\./g, "").replace(",", ".")) || 0; 
    setUsd(n > 0 ? (n / applied).toFixed(2) : ""); 
  }

  function swap() {
    if (field === "usd") { 
      setField("aoa"); 
      const n = parseFloat((aoa + "").replace(/\s/g, "").replace(/\./g, "").replace(",", ".")) || 0; 
      if (n > 0) setUsd((n / applied).toFixed(2)); 
    } else { 
      setField("usd"); 
      const n = parseFloat(usd) || 0; 
      if (n > 0) setAoa(Math.round(n * applied).toLocaleString("pt-AO")); 
    }
  }

  function handleOpTypeChange(type) {
    setOpType(type);
    setAcc(""); // Clear input when toggling mode
  }

  function submit() { 
    onSubmit({ 
      usd: usdNum, 
      aoa: Math.round(usdNum * applied), 
      dest, 
      account, 
      appliedRate: applied,
      side: opType
    }); 
  }

  return (
    <>
      {/* Visual Option Selector Switch */}
      <div style={{ display: "flex", gap: 6, background: "rgba(99,102,241,0.06)", borderRadius: 14, padding: 4, marginBottom: 14 }}>
        <button
          onClick={() => handleOpTypeChange("buy")}
          style={{
            flex: 1,
            padding: "10px",
            border: "none",
            borderRadius: 10,
            fontFamily: "inherit",
            fontSize: 12,
            fontWeight: 800,
            cursor: "pointer",
            transition: "all 0.2s",
            background: opType === "buy" ? "linear-gradient(135deg,#6366f1,#8b5cf6)" : "transparent",
            color: opType === "buy" ? "#ffffff" : "#64748b",
            boxShadow: opType === "buy" ? "0 4px 12px rgba(99,102,241,0.2)" : "none"
          }}
        >
          🟢 QUERO COMPRAR USD
        </button>
        <button
          onClick={() => handleOpTypeChange("sell")}
          style={{
            flex: 1,
            padding: "10px",
            border: "none",
            borderRadius: 10,
            fontFamily: "inherit",
            fontSize: 12,
            fontWeight: 800,
            cursor: "pointer",
            transition: "all 0.2s",
            background: opType === "sell" ? "linear-gradient(135deg,#6366f1,#8b5cf6)" : "transparent",
            color: opType === "sell" ? "#ffffff" : "#64748b",
            boxShadow: opType === "sell" ? "0 4px 12px rgba(99,102,241,0.2)" : "none"
          }}
        >
          🔴 QUERO VENDER USD
        </button>
      </div>

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
          <div className="calc-hint">{opType === "buy" ? "Digita o valor que desejas comprar" : "Digita o valor que desejas vender"}</div>
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
          <div className="calc-hint">{opType === "buy" ? "Valor correspondente em Kwanzas" : "Valor que irás receber em Kwanzas"}</div>
        </div>
        <div className="rate-note">
          <span style={{ fontSize: 11, color: "#6b7280", fontWeight: 600 }}>Taxa aplicada</span>
          <span className="rate-val" style={{ display: "flex", alignItems: "center", gap: 6 }}><Icon name="chart" size={14} /> 1 USD = {applied.toLocaleString("pt-AO")} Kz</span>
        </div>
      </div>

      <div className="card">
        <span className="slbl">{opType === "buy" ? "Para onde vai o dólar?" : "De onde vais enviar o dólar?"}</span>
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
        <label className="lbl" style={{ marginTop: 6 }}>
          {opType === "buy" 
            ? (destInfo?.hint ?? "Conta de destino") 
            : "O teu IBAN / Número de Conta Angolana (para receberes os Kwanzas)"}
        </label>
        <input 
          className="inp" 
          type="text" 
          placeholder={opType === "buy" ? destInfo?.hint : "AO06 0000 0000 0000 0000 0"} 
          value={account} 
          onChange={e => setAcc(e.target.value)} 
        />
      </div>

      {isOutOfLimits && (
        <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 11, padding: "9px 13px", fontSize: 12, color: "#b91c1c", fontWeight: 600, marginBottom: 11 }}>
          <Icon name="alertTriangle" size={16} style={{ flexShrink: 0 }} /> O valor deve estar entre ${minUsd} e ${maxUsd}.
        </div>
      )}

      {!user && <div className="warn" style={{ display: "flex", alignItems: "center", gap: 8 }}><Icon name="user" size={16} /> Faz login para criar um pedido.</div>}

      <button className="btn btn-p" onClick={submit} disabled={!user || usdNum <= 0 || isOutOfLimits || !account.trim() || loading}>
        {loading 
          ? `A criar pedido...` 
          : opType === "buy" 
            ? `Comprar $${usd || "0"} → ${destInfo?.label}` 
            : `Vender $${usd || "0"} → Receber em Kwanza`}
      </button>
      <div style={{ textAlign: "center", marginTop: 7, fontSize: 10, color: "#9ca3af", fontWeight: 600 }}>
        O administrador é notificado instantaneamente
      </div>
    </>
  );
}
