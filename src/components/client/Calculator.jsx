import { useState, useEffect } from "react";
import { DESTS } from "../../lib/constants.js";
import { Icon } from "../shared/UI.jsx";

export const ANGOLAN_BANKS = [
  { id: "bai", label: "BAI", desc: "Banco Angolano de Investimentos", color: "#003399", bg: "#f0f4ff" },
  { id: "bfa", label: "BFA", desc: "Banco de Fomento Angola", color: "#FF6600", bg: "#fff3eb" },
  { id: "bic", label: "BIC", desc: "Banco BIC", color: "#CC0000", bg: "#fff0f0" },
  { id: "atlantico", label: "ATLANTICO", desc: "Banco Millennium Atlântico", color: "#008080", bg: "#e6f2f2" },
  { id: "sba", label: "SBA", desc: "Standard Bank de Angola", color: "#0033A0", bg: "#f0f4ff" },
  { id: "sol", label: "SOL", desc: "Banco Sol", color: "#FFCC00", bg: "#fffdeb" },
  { id: "bpc", label: "BPC", desc: "Banco de Poupança e Crédito", color: "#006633", bg: "#f0f7f4" },
  { id: "bci", label: "BCI", desc: "Banco de Comércio e Indústria", color: "#333333", bg: "#f5f5f5" },
  { id: "keve", label: "KEVE", desc: "Banco Keve", color: "#800080", bg: "#fdf0fd" },
  { id: "yetu", label: "YETU", desc: "Banco Yetu", color: "#FF5050", bg: "#fff2f2" },
  { id: "express", label: "Express", desc: "Multicaixa Express", color: "#0099FF", bg: "#f0f9ff" }
];

const BANK_LOGOS = {
  bai: `<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="40" height="40" rx="10" fill="#002147"/>
    <path d="M15 15c0 2.2 1.8 4 4 4s4-1.8 4-4" stroke="#FF8C00" stroke-width="2.5" stroke-linecap="round"/>
    <path d="M25 25c0-2.2-1.8-4-4-4s-4 1.8-4 4" stroke="#FFA500" stroke-width="2.5" stroke-linecap="round"/>
    <circle cx="20" cy="20" r="2.2" fill="white"/>
    <text x="20" y="32" font-family="system-ui, sans-serif" font-size="8" font-weight="900" fill="white" text-anchor="middle" letter-spacing="0.5">BAI</text>
  </svg>`,
  bfa: `<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="40" height="40" rx="10" fill="#FF6600"/>
    <path d="M20 24V12M20 24c-2.5-2.5-5-1.5-6-4.5M20 24c2.5-2.5 5-1.5 6-4.5" stroke="white" stroke-width="2.5" stroke-linecap="round"/>
    <circle cx="14" cy="19.5" r="1.5" fill="#006633"/>
    <circle cx="26" cy="19.5" r="1.5" fill="#006633"/>
    <circle cx="20" cy="12" r="1.5" fill="#006633"/>
    <text x="20" y="32" font-family="system-ui, sans-serif" font-size="8" font-weight="900" fill="white" text-anchor="middle" letter-spacing="0.5">BFA</text>
  </svg>`,
  bic: `<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="40" height="40" rx="10" fill="#CC0000"/>
    <rect x="12" y="12" width="16" height="16" rx="3" stroke="white" stroke-width="2" fill="none"/>
    <path d="M12 20h16M20 12v16" stroke="white" stroke-width="1.5" stroke-dasharray="2"/>
    <text x="20" y="24" font-family="system-ui, sans-serif" font-size="9" font-weight="900" fill="white" text-anchor="middle">BIC</text>
  </svg>`,
  atlantico: `<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="40" height="40" rx="10" fill="#008080"/>
    <g transform="translate(20,18)">
      <path d="M0 0c-3-3-3-8 0-10c3 2 3 7 0 10z" fill="white" opacity="0.9"/>
      <path d="M0 0c3-3 8-3 10 0c-2 3-7 3-10 0z" fill="white" opacity="0.9"/>
      <path d="M0 0c3 3 3 8 0 10c-3-2-3-7 0-10z" fill="white" opacity="0.9"/>
      <path d="M0 0c-3 3-8 3-10 0c2-3 7-3 10 0z" fill="white" opacity="0.9"/>
    </g>
    <text x="20" y="34" font-family="system-ui, sans-serif" font-size="7" font-weight="900" fill="white" text-anchor="middle" letter-spacing="0.2">ATLANTICO</text>
  </svg>`,
  sba: `<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="40" height="40" rx="10" fill="#0033A0"/>
    <path d="M14 14h12v4c0 3.3-2.7 6-6 6h-0c-3.3 0-6-2.7-6-6v-4z" fill="none" stroke="white" stroke-width="2.5"/>
    <path d="M20 14v10M14 18h12" stroke="white" stroke-width="1.5"/>
    <text x="20" y="33" font-family="system-ui, sans-serif" font-size="8.5" font-weight="900" fill="white" text-anchor="middle">SBA</text>
  </svg>`,
  sol: `<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="40" height="40" rx="10" fill="#FFCC00"/>
    <circle cx="20" cy="18" r="6" fill="#FF6600"/>
    <circle cx="20" cy="18" r="4" fill="#FFCC00"/>
    <path d="M20 8v4M20 24v4M10 18h4M26 18h4M13 11l3 3M24 22l3 3M13 25l3-3M24 14l3-3" stroke="#FF6600" stroke-width="2" stroke-linecap="round"/>
    <text x="20" y="34" font-family="system-ui, sans-serif" font-size="8" font-weight="900" fill="#1e1b4b" text-anchor="middle">SOL</text>
  </svg>`,
  bpc: `<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="40" height="40" rx="10" fill="#006633"/>
    <path d="M15 13h10v6c0 3-2 5-5 5s-5-2-5-5v-6z" fill="none" stroke="#FFCC00" stroke-width="2.5"/>
    <path d="M18 17l2-2 2 2M20 15v6" stroke="#FFCC00" stroke-width="2" stroke-linecap="round"/>
    <text x="20" y="33" font-family="system-ui, sans-serif" font-size="8.5" font-weight="900" fill="white" text-anchor="middle">BPC</text>
  </svg>`,
  bci: `<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="40" height="40" rx="10" fill="#333333"/>
    <path d="M12 14h16M14 20h12M16 26h8" stroke="white" stroke-width="2.5" stroke-linecap="round"/>
    <path d="M22 14l-4 12" stroke="#CC0000" stroke-width="3" stroke-linecap="round"/>
    <text x="20" y="33" font-family="system-ui, sans-serif" font-size="8" font-weight="900" fill="white" text-anchor="middle">BCI</text>
  </svg>`,
  keve: `<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="40" height="40" rx="10" fill="#800080"/>
    <path d="M14 22c0-3 3-5 6-5s6 2 6 5M20 13v4" stroke="#FFD700" stroke-width="2" stroke-linecap="round"/>
    <circle cx="20" cy="13" r="2" fill="#FFD700"/>
    <text x="20" y="33" font-family="system-ui, sans-serif" font-size="8" font-weight="900" fill="white" text-anchor="middle">KEVE</text>
  </svg>`,
  yetu: `<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="40" height="40" rx="10" fill="#FF5050"/>
    <path d="M20 12c-4 2-5 7-5 10c0 4 3 6 5 6s5-2 5-6c0-3-1-8-5-10z" fill="white" opacity="0.3"/>
    <path d="M20 11v11M16 17h8" stroke="white" stroke-width="2" stroke-linecap="round"/>
    <text x="20" y="33" font-family="system-ui, sans-serif" font-size="8" font-weight="900" fill="white" text-anchor="middle">YETU</text>
  </svg>`,
  express: `<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="40" height="40" rx="10" fill="#0099FF"/>
    <circle cx="20" cy="18" r="7" stroke="white" stroke-width="2" opacity="0.2"/>
    <path d="M20 11a7 7 0 0 1 7 7M20 25a7 7 0 0 1-7-7" stroke="white" stroke-width="2.5" stroke-linecap="round"/>
    <path d="M27 15l2 3-3 1M13 21l-2-3 3-1" stroke="white" stroke-width="2" stroke-linecap="round"/>
    <text x="20" y="33" font-family="system-ui, sans-serif" font-size="7.5" font-weight="900" fill="white" text-anchor="middle">EXPRESS</text>
  </svg>`
};

function SelectionModal({ isOpen, title, items, selectedId, onSelect, onClose, renderIcon }) {
  if (!isOpen) return null;
  return (
    <div 
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(15, 23, 42, 0.75)",
        backdropFilter: "blur(6px)",
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
        zIndex: 10000,
        animation: "fadeIn 0.2s ease-out"
      }} 
      onClick={onClose}
    >
      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
      <div 
        style={{
          background: "#fff",
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          padding: "20px 20px 30px",
          width: "100%",
          maxWidth: 540,
          boxShadow: "0 -10px 40px rgba(0,0,0,0.15)",
          border: "1px solid rgba(229, 231, 235, 0.5)",
          maxHeight: "80vh",
          display: "flex",
          flexDirection: "column",
          animation: "slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)"
        }} 
        onClick={e => e.stopPropagation()}
      >
        {/* Drag handle line indicator */}
        <div style={{ width: 38, height: 4, background: "#cbd5e1", borderRadius: 2, margin: "0 auto 16px", flexShrink: 0 }} />

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18, flexShrink: 0 }}>
          <h3 style={{ fontSize: 15, fontWeight: 900, color: "#1e1b4b", letterSpacing: "-0.3px" }}>{title}</h3>
          <button 
            onClick={onClose} 
            style={{ background: "rgba(15, 23, 42, 0.05)", border: "none", color: "#64748b", borderRadius: "50%", width: 28, height: 28, display: "flex", alignItems: "center", justify: "center", cursor: "pointer", fontWeight: 700 }}
          >
            ✕
          </button>
        </div>

        <div style={{ overflowY: "auto", flex: 1, display: "flex", flexDirection: "column", gap: 8, paddingRight: 4 }}>
          {items.map(item => {
            const isSel = item.id === selectedId;
            return (
              <div
                key={item.id}
                onClick={() => {
                  onSelect(item.id);
                  onClose();
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "12px 14px",
                  borderRadius: 14,
                  cursor: "pointer",
                  transition: "all 0.2s",
                  border: isSel ? "2px solid #6366f1" : "1.5px solid #f1f5f9",
                  background: isSel ? "#f5f6ff" : "#fff"
                }}
                onMouseEnter={e => {
                  if (!isSel) {
                    e.currentTarget.style.borderColor = "#c7d2fe";
                    e.currentTarget.style.background = "#fafafa";
                  }
                }}
                onMouseLeave={e => {
                  if (!isSel) {
                    e.currentTarget.style.borderColor = "#f1f5f9";
                    e.currentTarget.style.background = "#fff";
                  }
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div 
                    style={{ width: 36, height: 36, borderRadius: 8, overflow: "hidden", flexShrink: 0 }}
                    dangerouslySetInnerHTML={{ __html: renderIcon(item) }} 
                  />
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 800, color: "#1e1b4b" }}>{item.label}</div>
                    <div style={{ fontSize: 10, color: "#8b92a9", fontWeight: 600, marginTop: 1 }}>{item.desc}</div>
                  </div>
                </div>
                {isSel && (
                  <div style={{ width: 20, height: 20, borderRadius: "50%", background: "#6366f1", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 900 }}>
                    ✓
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function Calculator({ appliedRate, rate, onSubmit, loading, user, kycStep, config }) {
  const applied = parseFloat(appliedRate) || 1165;
  const [opType, setOpType] = useState("buy"); // "buy" or "sell"
  const [usd, setUsd] = useState("100");
  const [aoa, setAoa] = useState(() => Math.round(100 * applied).toLocaleString("pt-AO"));
  const [field, setField] = useState("usd");
  const [dest, setDest] = useState("redotpay");
  const [selectedBank, setSelectedBank] = useState("bai");
  const [account, setAcc] = useState("");

  // Modal display states
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [showBankModal, setShowBankModal] = useState(false);

  useEffect(() => {
    const isModalOpen = showWalletModal || showBankModal;
    const nav = document.querySelector(".bottom-nav");
    if (nav) {
      if (isModalOpen) {
        nav.style.opacity = "0";
        nav.style.pointerEvents = "none";
        nav.style.transform = "translateY(24px)";
        nav.style.transition = "all 0.25s cubic-bezier(0.16, 1, 0.3, 1)";
      } else {
        nav.style.opacity = "1";
        nav.style.pointerEvents = "auto";
        nav.style.transform = "translateY(0)";
        nav.style.transition = "all 0.25s cubic-bezier(0.16, 1, 0.3, 1)";
      }
    }
  }, [showWalletModal, showBankModal]);

  const destInfo = DESTS.find(d => d.id === dest);
  const bInfo = ANGOLAN_BANKS.find(b => b.id === selectedBank);

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
      side: opType,
      bank: selectedBank
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

      <div className="card" style={{ padding: "18px 20px" }}>
        {/* Sleek Selector Box 1 (USD Wallet) */}
        <div>
          <span className="slbl">{opType === "buy" ? "1. Carteira de Destino (USD)" : "1. Carteira de Origem (USD)"}</span>
          <div 
            onClick={() => setShowWalletModal(true)}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              background: "#f8fafc",
              border: "1.5px solid #e0e7ff",
              borderRadius: 16,
              padding: "12px 16px",
              cursor: "pointer",
              transition: "all 0.2s",
              marginBottom: 14
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = "#6366f1";
              e.currentTarget.style.background = "#fff";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = "#e0e7ff";
              e.currentTarget.style.background = "#f8fafc";
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div 
                style={{ width: 36, height: 36, flexShrink: 0, borderRadius: 8, overflow: "hidden" }} 
                dangerouslySetInnerHTML={{ __html: destInfo?.svg }} 
              />
              <div>
                <div style={{ fontSize: 13, fontWeight: 800, color: "#1e1b4b" }}>{destInfo?.label}</div>
                <div style={{ fontSize: 9.5, color: "#8b92a9", fontWeight: 600, marginTop: 1 }}>{destInfo?.desc}</div>
              </div>
            </div>
            <div style={{ color: "#6366f1", fontSize: 11, fontWeight: 900 }}>▼</div>
          </div>
        </div>

        {/* Sleek Selector Box 2 (Angolan Bank) - ALWAYS shown for a highly professional flow */}
        <div>
          <span className="slbl">{opType === "buy" ? "2. Banco de Pagamento (AOA)" : "2. Banco de Recebimento (AOA)"}</span>
          <div 
            onClick={() => setShowBankModal(true)}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              background: "#f8fafc",
              border: "1.5px solid #e0e7ff",
              borderRadius: 16,
              padding: "12px 16px",
              cursor: "pointer",
              transition: "all 0.2s",
              marginBottom: 14
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = "#6366f1";
              e.currentTarget.style.background = "#fff";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = "#e0e7ff";
              e.currentTarget.style.background = "#f8fafc";
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div 
                style={{ width: 36, height: 36, flexShrink: 0, borderRadius: 8, overflow: "hidden" }} 
                dangerouslySetInnerHTML={{ __html: BANK_LOGOS[selectedBank] }} 
              />
              <div>
                <div style={{ fontSize: 13, fontWeight: 800, color: "#1e1b4b" }}>{bInfo?.label}</div>
                <div style={{ fontSize: 9.5, color: "#8b92a9", fontWeight: 600, marginTop: 1 }}>{bInfo?.desc}</div>
              </div>
            </div>
            <div style={{ color: "#6366f1", fontSize: 11, fontWeight: 900 }}>▼</div>
          </div>
        </div>

        <label className="lbl">
          {opType === "buy" 
            ? "3. " + (destInfo?.hint ?? "Conta de destino USD") 
            : "3. O teu IBAN / Conta Bancária Angolana (para receberes os Kwanzas)"}
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

      {/* Wallet Selector Bottom Sheet Modal */}
      <SelectionModal 
        isOpen={showWalletModal}
        title={opType === "buy" ? "Selecionar Carteira de Destino (USD)" : "Selecionar Carteira de Origem (USD)"}
        items={DESTS}
        selectedId={dest}
        onSelect={setDest}
        onClose={() => setShowWalletModal(false)}
        renderIcon={item => item.svg}
      />

      {/* Bank Selector Bottom Sheet Modal */}
      <SelectionModal 
        isOpen={showBankModal}
        title="Selecionar Banco Angolano para Receber AOA"
        items={ANGOLAN_BANKS}
        selectedId={selectedBank}
        onSelect={setSelectedBank}
        onClose={() => setShowBankModal(false)}
        renderIcon={item => BANK_LOGOS[item.id]}
      />
    </>
  );
}
