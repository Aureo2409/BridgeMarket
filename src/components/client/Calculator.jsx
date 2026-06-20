import { useState, useEffect } from "react";
import { DESTS, CURRENCIES } from "../../lib/constants.js";
import { Icon } from "../shared/UI.jsx";

export const ANGOLAN_BANKS = [
  { id: "bai", label: "BAI", desc: "Banco Angolano de Investimentos", color: "#002147", bg: "#f0f4ff" },
  { id: "bfa", label: "BFA", desc: "Banco de Fomento Angola", color: "#FF6600", bg: "#fff3eb" },
  { id: "bic", label: "BIC", desc: "Banco BIC", color: "#CC0000", bg: "#fff0f0" },
  { id: "atlantico", label: "ATLANTICO", desc: "Banco Millennium Atlântico", color: "#008B9B", bg: "#e6f2f2" },
  { id: "sba", label: "SBA", desc: "Standard Bank de Angola", color: "#0033A0", bg: "#f0f4ff" },
  { id: "sol", label: "SOL", desc: "Banco Sol", color: "#FFCC00", bg: "#fffdeb" },
  { id: "bpc", label: "BPC", desc: "Banco de Poupança e Crédito", color: "#0079C1", bg: "#f0f7f4" },
  { id: "bci", label: "BCI", desc: "Banco de Comércio e Indústria", color: "#B3105C", bg: "#fdf2f6" },
  { id: "keve", label: "KEVE", desc: "Banco Keve", color: "#00529F", bg: "#fdf0fd" },
  { id: "yetu", label: "YETU", desc: "Banco Yetu", color: "#9E7E38", bg: "#fffcf2" },
  { id: "bni", label: "BNI", desc: "Banco de Negócios Internacional", color: "#A87232", bg: "#fdf8f2" },
  { id: "economico", label: "Banco Económico", desc: "Banco Económico", color: "#5F259F", bg: "#fbf2ff" },
  { id: "cga", label: "Caixa Geral Angola", desc: "Caixa Geral Angola", color: "#005BA6", bg: "#f0f6fc" },
  { id: "express", label: "Express", desc: "Multicaixa Express", color: "#FF9344", bg: "#FFF4EC" }
];

const BANK_LOGOS = {
  bai: `<svg width="100%" height="100%" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bai-bg-grad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#5290D5"/>
        <stop offset="100%" stop-color="#184F8D"/>
      </linearGradient>
      <radialGradient id="bai-globe-grad" cx="35%" cy="35%" r="65%">
        <stop offset="0%" stop-color="#4ea2e3" />
        <stop offset="100%" stop-color="#0b2c5e" />
      </radialGradient>
      <pattern id="bai-dot-grid" width="1.4" height="1.4" patternUnits="userSpaceOnUse">
        <circle cx="0.7" cy="0.7" r="0.4" fill="#ffffff" opacity="0.95" />
      </pattern>
      <clipPath id="bai-globe-clip">
        <circle cx="20" cy="20" r="11" />
      </clipPath>
      <radialGradient id="bai-globe-gloss" cx="30%" cy="30%" r="50%">
        <stop offset="0%" stop-color="#ffffff"/>
        <stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>
      </radialGradient>
    </defs>
    <rect width="40" height="40" rx="8" fill="url(#bai-bg-grad)"/>
    <rect x="0.5" y="0.5" width="39" height="39" rx="7.5" stroke="rgba(255, 255, 255, 0.12)" stroke-width="1" fill="none"/>
    <circle cx="20" cy="20" r="11" fill="url(#bai-globe-grad)"/>
    <g clip-path="url(#bai-globe-clip)">
      <path d="M12 11 C13 9, 15 9, 17 11 C16 13, 15 14, 13 16 Z M18 8 L20 10 L17 10 Z M13 16 C16 19, 16 21, 14 28 C11 23, 12 20, 13 16 Z M21 10 H24 L23 14 L21 12 Z M20 14 C24 14, 25 17, 23 25 C19 18, 20 16, 20 14 Z M24 11 H30 L32 14 L28 18 Z" fill="url(#bai-dot-grid)"/>
    </g>
    <circle cx="20" cy="20" r="11" fill="url(#bai-globe-gloss)" opacity="0.15" pointer-events="none"/>
  </svg>`,
  bfa: `<svg width="100%" height="100%" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="40" height="40" rx="8" fill="#F05A24"/>
    <g transform="translate(20, 20) rotate(-15) scale(1.5)">
      <g fill="#FFFFFF">
        <path d="M 0 -8 C -3 -6.8, -4 -3, -2.5 -0.5 C -1.5 1, 1.5 1, 2.5 -0.5 C 4 -3, 3 -6.8, 0 -8 Z" transform="rotate(0)"/>
        <path d="M 0 -8 C -3 -6.8, -4 -3, -2.5 -0.5 C -1.5 1, 1.5 1, 2.5 -0.5 C 4 -3, 3 -6.8, 0 -8 Z" transform="rotate(90)"/>
        <path d="M 0 -8 C -3 -6.8, -4 -3, -2.5 -0.5 C -1.5 1, 1.5 1, 2.5 -0.5 C 4 -3, 3 -6.8, 0 -8 Z" transform="rotate(180)"/>
        <path d="M 0 -8 C -3 -6.8, -4 -3, -2.5 -0.5 C -1.5 1, 1.5 1, 2.5 -0.5 C 4 -3, 3 -6.8, 0 -8 Z" transform="rotate(270)"/>
      </g>
      <g stroke="#F05A24" stroke-width="0.45" stroke-linecap="round">
        <line x1="0" y1="0" x2="0" y2="-4.2"/>
        <line x1="0" y1="0" x2="2.97" y2="-2.97"/>
        <line x1="0" y1="0" x2="4.2" y2="0"/>
        <line x1="0" y1="0" x2="2.97" y2="2.97"/>
        <line x1="0" y1="0" x2="0" y2="4.2"/>
        <line x1="0" y1="0" x2="-2.97" y2="2.97"/>
        <line x1="0" y1="0" x2="-4.2" y2="0"/>
        <line x1="0" y1="0" x2="-2.97" y2="-2.97"/>
      </g>
      <circle cx="0" cy="-4.2" r="0.45" fill="#F05A24"/>
      <circle cx="2.97" cy="-2.97" r="0.45" fill="#F05A24"/>
      <circle cx="4.2" cy="0" r="0.45" fill="#F05A24"/>
      <circle cx="2.97" cy="2.97" r="0.45" fill="#F05A24"/>
      <circle cx="0" cy="4.2" r="0.45" fill="#F05A24"/>
      <circle cx="-2.97" cy="2.97" r="0.45" fill="#F05A24"/>
      <circle cx="-4.2" cy="0" r="0.45" fill="#F05A24"/>
      <circle cx="-2.97" cy="-2.97" r="0.45" fill="#F05A24"/>
      <circle cx="0" cy="0" r="1.15" fill="#F05A24"/>
    </g>
  </svg>`,
  bic: `<svg width="100%" height="100%" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <mask id="bic-tree-mask">
        <rect width="40" height="40" fill="#FFFFFF"/>
        <ellipse cx="14" cy="14" rx="1.2" ry="2.2" transform="rotate(-30 14 14)" fill="#000000"/>
        <ellipse cx="18" cy="12.5" rx="1.2" ry="2.2" transform="rotate(-15 18 12.5)" fill="#000000"/>
        <ellipse cx="22" cy="12.5" rx="1.2" ry="2.2" transform="rotate(15 22 12.5)" fill="#000000"/>
        <ellipse cx="26" cy="14" rx="1.2" ry="2.2" transform="rotate(30 26 14)" fill="#000000"/>
        <ellipse cx="13" cy="18.5" rx="1.2" ry="2.2" transform="rotate(-45 13 18.5)" fill="#000000"/>
        <ellipse cx="20" cy="15.5" rx="1.2" ry="2.5" fill="#000000"/>
        <ellipse cx="27" cy="18.5" rx="1.2" ry="2.2" transform="rotate(45 27 18.5)" fill="#000000"/>
        <ellipse cx="17.5" cy="20.5" rx="1.2" ry="3" transform="rotate(-30 17.5 20.5)" fill="#000000"/>
        <ellipse cx="22.5" cy="20.5" rx="1.2" ry="3" transform="rotate(30 22.5 20.5)" fill="#000000"/>
        <ellipse cx="20" cy="22.5" rx="1" ry="3.5" fill="#000000"/>
      </mask>
    </defs>
    <rect width="40" height="40" rx="8" fill="#E21A1A"/>
    <rect x="0.5" y="0.5" width="39" height="39" rx="7.5" stroke="rgba(255,255,255,0.08)" stroke-width="1" fill="none"/>
    <path d="M 17.5 28 C 17.5 25.5, 16.5 24.5, 14 23.5 C 9.5 21.5, 7.5 15.5, 11 11.5 C 14.5 7.5, 25.5 7.5, 29 11.5 C 32.5 15.5, 30.5 21.5, 26 23.5 C 23.5 24.5, 22.5 25.5, 22.5 28 Z" fill="#FFFFFF" mask="url(#bic-tree-mask)"/>
    <text x="20" y="35" fill="#FFFFFF" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle" font-size="5.2" font-weight="600" letter-spacing="-0.1">Banco<tspan font-weight="900">BIC</tspan></text>
  </svg>`,
  atlantico: `<svg width="100%" height="100%" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="40" height="40" rx="8" fill="#FFFFFF"/>
    <circle cx="20" cy="20" r="8" stroke="#008B9B" stroke-width="2.5" fill="none"/>
    <line x1="20" y1="8" x2="20" y2="32" stroke="#008B9B" stroke-width="2.5" stroke-linecap="round"/>
    <circle cx="20" cy="20" r="2.5" fill="#008B9B"/>
  </svg>`,
  sba: `<svg width="100%" height="100%" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="40" height="40" rx="8" fill="#0033A0"/>
    <g transform="translate(11, 8)">
      <path d="M0 0 H18 V10 C18 16 13 21 9 24 C5 21 0 16 0 10 Z" fill="#FFFFFF"/>
      <path d="M3 3 H15 V10 C15 14.5 11 18.5 9 21 C7 18.5 3 14.5 3 10 Z" fill="#0033A0"/>
      <rect x="7.5" y="6" width="3" height="12" fill="#FFFFFF"/>
      <path d="M7.5 6 H13 V11 H7.5 Z" fill="#FFFFFF"/>
    </g>
  </svg>`,
  sol: `<svg width="100%" height="100%" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="40" height="40" rx="8" fill="#FFFFFF"/>
    <circle cx="20" cy="20" r="9" fill="url(#solGradient)"/>
    <defs>
      <linearGradient id="solGradient" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#FFD600"/>
        <stop offset="100%" stop-color="#FF9E00"/>
      </linearGradient>
    </defs>
  </svg>`,
  bpc: `<svg width="100%" height="100%" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="40" height="40" rx="8" fill="#00357A"/>
    <rect x="0.5" y="0.5" width="39" height="39" rx="7.5" stroke="rgba(255,255,255,0.08)" stroke-width="1" fill="none"/>
    <rect x="9" y="9" width="22" height="22" rx="4.5" transform="rotate(45 20 20)" fill="#00AEEF"/>
    <g transform="translate(20, 20) scale(1.85)">
      <path d="M -5 -5 H 2 A 3 3 0 0 1 5 -2 V 5" stroke="white" stroke-width="1.8" stroke-linecap="round" fill="none"/>
      <path d="M 5 -5 V 2 A 3 3 0 0 1 2 5 H -5" stroke="white" stroke-width="1.8" stroke-linecap="round" fill="none"/>
      <path d="M 5 5 H -2 A 3 3 0 0 1 -5 2 V -5" stroke="white" stroke-width="1.8" stroke-linecap="round" fill="none"/>
      <path d="M -5 5 V -2 A 3 3 0 0 1 -2 -5 H 5" stroke="white" stroke-width="1.8" stroke-linecap="round" fill="none"/>
    </g>
  </svg>`,
  bci: `<svg width="100%" height="100%" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="40" height="40" rx="8" fill="#FFFFFF"/>
    <g transform="translate(12, 10)" stroke="#B3105C" stroke-width="2" fill="none">
      <path d="M0 20V0h20"/>
      <path d="M3 20V3h17"/>
      <path d="M6 20V6h14"/>
      <path d="M9 20V9h11"/>
    </g>
  </svg>`,
  keve: `<svg width="100%" height="100%" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="40" height="40" rx="8" fill="#FFFFFF"/>
    <path d="M10 23 C14 23 16 17 20 17 C24 17 26 23 30 23" stroke="#FF8C00" stroke-width="3" stroke-linecap="round" fill="none"/>
    <path d="M10 17 C14 17 16 23 20 23 C24 23 26 17 30 17" stroke="#00529F" stroke-width="3" stroke-linecap="round" fill="none"/>
  </svg>`,
  yetu: `<svg width="100%" height="100%" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="40" height="40" rx="8" fill="#FFFFFF"/>
    <g stroke="#9E7E38" stroke-width="2.2" stroke-linecap="round" fill="none" transform="translate(0, -1)">
      <line x1="12" y1="12" x2="20" y2="18"/>
      <line x1="12" y1="18" x2="20" y2="24"/>
      <line x1="12" y1="24" x2="20" y2="30"/>
      <line x1="28" y1="12" x2="20" y2="18"/>
      <line x1="28" y1="18" x2="20" y2="24"/>
      <line x1="28" y1="24" x2="20" y2="30"/>
      <line x1="20" y1="10" x2="20" y2="30" stroke-width="1.5"/>
    </g>
  </svg>`,
  bni: `<svg width="100%" height="100%" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="40" height="40" rx="8" fill="#FFFFFF"/>
    <rect x="10" y="10" width="20" height="20" rx="5" stroke="#C47D2B" stroke-width="2" fill="none"/>
    <path d="M15 17c2-2 4 0 5 2s3 4 5 2" stroke="#C47D2B" stroke-width="2" stroke-linecap="round" fill="none"/>
    <path d="M15 23c2 2 4 0 5-2s3-4 5-2" stroke="#C47D2B" stroke-width="2" stroke-linecap="round" fill="none"/>
  </svg>`,
  economico: `<svg width="100%" height="100%" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="40" height="40" rx="8" fill="#5F259F"/>
    <path d="M12 13 H28 M12 20 H24 M12 27 H28" stroke="#00B0FF" stroke-width="2.5" stroke-linecap="round"/>
    <path d="M12 13 V27" stroke="#00B0FF" stroke-width="2.5" stroke-linecap="round"/>
    <path d="M16 16 H24 M16 24 H24" stroke="#00B0FF" stroke-width="1.5" stroke-linecap="round" opacity="0.6"/>
  </svg>`,
  cga: `<svg width="100%" height="100%" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="40" height="40" rx="8" fill="#FFFFFF"/>
    <g fill="#005A9C">
      <path d="M11 11h7v2h-5v5h-2v-7z"/>
      <path d="M22 11h7v7h-2v-5h-5v-2z"/>
      <path d="M22 22h5v5h-7v-7h2v2z"/>
      <path d="M11 22h2v5h5v2h-7v-7z"/>
      <rect x="15" y="15" width="10" height="10" fill="#005A9C"/>
    </g>
  </svg>`,
  express: `<svg width="100%" height="100%" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="40" height="40" rx="8" fill="#FFA461"/>
    <rect x="0.5" y="0.5" width="39" height="39" rx="7.5" stroke="rgba(255,255,255,0.08)" stroke-width="1" fill="none"/>
    <g transform="translate(20, 16) scale(1.15)">
      <g stroke="#FFFFFF" stroke-width="0.8" stroke-linejoin="round" fill="#B44252">
        <rect x="-1.4" y="-2.25" width="2.8" height="4.5" rx="0.6" transform="rotate(0) translate(0, -3.5) rotate(15)"/>
        <rect x="-1.4" y="-2.25" width="2.8" height="4.5" rx="0.6" transform="rotate(45) translate(0, -3.5) rotate(15)"/>
        <rect x="-1.4" y="-2.25" width="2.8" height="4.5" rx="0.6" transform="rotate(90) translate(0, -3.5) rotate(15)"/>
        <rect x="-1.4" y="-2.25" width="2.8" height="4.5" rx="0.6" transform="rotate(135) translate(0, -3.5) rotate(15)"/>
        <rect x="-1.4" y="-2.25" width="2.8" height="4.5" rx="0.6" transform="rotate(180) translate(0, -3.5) rotate(15)"/>
        <rect x="-1.4" y="-2.25" width="2.8" height="4.5" rx="0.6" transform="rotate(225) translate(0, -3.5) rotate(15)"/>
        <rect x="-1.4" y="-2.25" width="2.8" height="4.5" rx="0.6" transform="rotate(270) translate(0, -3.5) rotate(15)"/>
        <rect x="-1.4" y="-2.25" width="2.8" height="4.5" rx="0.6" transform="rotate(315) translate(0, -3.5) rotate(15)"/>
      </g>
      <circle cx="0" cy="0" r="1.8" fill="#FFA461" stroke="#FFFFFF" stroke-width="0.8"/>
    </g>
    <text x="20" y="32" fill="#B44252" font-family="system-ui, -apple-system, sans-serif" font-weight="900" font-size="6.2" text-anchor="middle" letter-spacing="-0.2">express</text>
  </svg>`
};

function SelectionModal({ isOpen, title, items, selectedId, onSelect, onClose, renderIcon, renderFlag }) {
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
                  <div style={{ width: 36, height: 36, borderRadius: 10, overflow: "hidden", flexShrink: 0, background: item.logoBg || item.bg || "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", fontSize: renderFlag ? 22 : undefined }}>
                    {renderFlag ? (
                      <span>{renderFlag(item)}</span>
                    ) : renderIcon(item) ? (
                      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }} dangerouslySetInnerHTML={{ __html: renderIcon(item) }} />
                    ) : item.logo ? (
                      <img src={item.logo} alt={item.label} style={{ width: 36, height: 36, objectFit: "contain", borderRadius: 10 }} onError={e => { e.target.style.display = "none"; }} />
                    ) : null}
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 800, color: "#1e1b4b" }}>{item.id ? `${item.id} — ${item.label}` : item.label}</div>
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

export function Calculator({ appliedRate, rate, onSubmit, loading, user, kycStep, config, multiRates }) {
  const applied = parseFloat(appliedRate) || 1165;
  const [opType, setOpType] = useState("buy"); // "buy" or "sell"
  const [currency, setCurrency] = useState("USD");
  const [swapped, setSwapped] = useState(false); // false = moeda estrangeira em cima
  const [usd, setUsd] = useState("100");
  const [aoa, setAoa] = useState(() => Math.round(100 * applied).toLocaleString("pt-AO"));
  const [field, setField] = useState("usd");
  const [dest, setDest] = useState("redotpay");
  const [selectedBank, setSelectedBank] = useState("bai");
  const [account, setAcc] = useState("");
  const [showCurrencyModal, setShowCurrencyModal] = useState(false);

  // Modal display states
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [showBankModal, setShowBankModal] = useState(false);

  // Taxa actual para a moeda seleccionada
  const currentCurrencyDef = CURRENCIES.find(c => c.id === currency) || CURRENCIES[0];
  const currencyRateAvailable = currency === "USD" || !!multiRates?.[currency];
  const currentRate = currency === "USD"
    ? applied
    : (multiRates?.[currency] || applied);

  // Destinos filtrados pela moeda seleccionada
  const filteredDests = currentCurrencyDef.dests
    ? DESTS.filter(d => currentCurrencyDef.dests.includes(d.id))
    : DESTS;

  // Se o destino actual não existe na nova moeda, resetar
  useEffect(() => {
    if (filteredDests.length > 0 && !filteredDests.find(d => d.id === dest)) {
      setDest(filteredDests[0].id);
    }
  }, [currency]);

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

  const destInfo = filteredDests.find(d => d.id === dest) || filteredDests[0];
  const bInfo = ANGOLAN_BANKS.find(b => b.id === selectedBank);

  const usdNum = parseFloat(usd) || 0;
  const minUsd = parseFloat(config?.min_amount_usd) || 10;
  const maxUsd = parseFloat(config?.max_amount_usd) || 5000;
  const isOutOfLimits = usdNum > 0 && (usdNum < minUsd || usdNum > maxUsd);

  function onUsd(v) {
    setUsd(v);
    setField("usd");
    const n = parseFloat(v) || 0;
    setAoa(n > 0 ? Math.round(n * currentRate).toLocaleString("pt-AO") : "");
  }

  function onAoa(v) {
    setAoa(v);
    setField("aoa");
    const n = parseFloat(v.replace(/\s/g, "").replace(/\./g, "").replace(",", ".")) || 0;
    setUsd(n > 0 ? (n / currentRate).toFixed(2) : "");
  }

  function swap() {
    setSwapped(s => !s);
    if (field === "usd") {
      setField("aoa");
      const n = parseFloat((aoa + "").replace(/\s/g, "").replace(/\./g, "").replace(",", ".")) || 0;
      if (n > 0) setUsd((n / currentRate).toFixed(2));
    } else {
      setField("usd");
      const n = parseFloat(usd) || 0;
      if (n > 0) setAoa(Math.round(n * currentRate).toLocaleString("pt-AO"));
    }
  }

  function handleOpTypeChange(type) {
    setOpType(type);
    setAcc(""); // Clear input when toggling mode
  }

  function submit() {
    onSubmit({
      usd: usdNum,
      aoa: Math.round(usdNum * currentRate),
      dest,
      account,
      appliedRate: currentRate,
      side: opType,
      bank: selectedBank,
      currency,
      currencySymbol: currentCurrencyDef.symbol,
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
          🟢 QUERO COMPRAR {currency}
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
          🔴 QUERO VENDER {currency}
        </button>
      </div>

      <div className="hero">
        <div style={{ fontSize: 10, fontWeight: 700, opacity: .7, textTransform: "uppercase", letterSpacing: .5, marginBottom: 3 }}>Taxa de hoje</div>
        <div style={{ fontSize: 34, fontWeight: 900, letterSpacing: -2 }}>{applied.toLocaleString("pt-AO")} Kz</div>
        <div style={{ fontSize: 11, opacity: .7, fontWeight: 600 }}>por 1 USD · base {parseFloat(rate.base_rate).toLocaleString("pt-AO")} + margem {parseFloat(rate.margin)} Kz</div>
      </div>

      <div className="card">
        {/* ── Caixa de cima: muda consoante swapped ── */}
        {!swapped ? (
          <div className={`calc-box${field === "usd" ? " active" : ""}`} onClick={() => setField("usd")}>
            <div className="calc-flag" style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}
              onClick={e => { e.stopPropagation(); setShowCurrencyModal(true); }}>
              <span style={{ fontSize: 16 }}>{currentCurrencyDef.flag}</span>
              <span style={{ fontWeight: 700, color: currentCurrencyDef.color }}>{currency}</span>
              <span style={{ color: "#8b92a9", fontSize: 12 }}>— {currentCurrencyDef.label}</span>
              <span style={{ fontSize: 10, color: "#6366f1", marginLeft: 4, background: "#eff6ff", padding: "1px 6px", borderRadius: 6, display: "flex", alignItems: "center", gap: 2 }}>▼ trocar</span>
            </div>
            <input className="calc-num" type="number" placeholder="0.00" value={usd}
              onChange={e => onUsd(e.target.value)} onFocus={() => setField("usd")} />
            <div className="calc-hint">{opType === "buy" ? "Digita o valor que desejas comprar" : "Digita o valor que desejas vender"}</div>
          </div>
        ) : (
          <div className={`calc-box${field === "aoa" ? " active" : ""}`} onClick={() => setField("aoa")}>
            <div className="calc-flag" style={{ display: "flex", alignItems: "center", gap: 6 }}><Icon name="bank" size={14} /> AOA — Kwanza angolano</div>
            <input className="calc-num" type="text" placeholder="0" value={aoa}
              onChange={e => onAoa(e.target.value)} onFocus={() => setField("aoa")} />
            <div className="calc-hint">{opType === "buy" ? "Valor correspondente em Kwanzas" : "Valor que irás receber em Kwanzas"}</div>
          </div>
        )}

        {/* ── Botão de swap com duas setas, inverte fisicamente as caixas ── */}
        <div className="swap-row">
          <div className="swap-line" />
          <button
            className="swap-btn"
            onClick={swap}
            title="Trocar posição das moedas"
            style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: -2, padding: 6 }}
          >
            <Icon name="arrowRight" size={13} style={{ transform: "rotate(-90deg)", marginBottom: -3 }} />
            <Icon name="arrowRight" size={13} style={{ transform: "rotate(90deg)", marginTop: -3 }} />
          </button>
          <div className="swap-line" />
        </div>

        {/* ── Caixa de baixo: a outra metade do swap ── */}
        {!swapped ? (
          <div className={`calc-box${field === "aoa" ? " active" : ""}`} onClick={() => setField("aoa")}>
            <div className="calc-flag" style={{ display: "flex", alignItems: "center", gap: 6 }}><Icon name="bank" size={14} /> AOA — Kwanza angolano</div>
            <input className="calc-num" type="text" placeholder="0" value={aoa}
              onChange={e => onAoa(e.target.value)} onFocus={() => setField("aoa")} />
            <div className="calc-hint">{opType === "buy" ? "Valor correspondente em Kwanzas" : "Valor que irás receber em Kwanzas"}</div>
          </div>
        ) : (
          <div className={`calc-box${field === "usd" ? " active" : ""}`} onClick={() => setField("usd")}>
            <div className="calc-flag" style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}
              onClick={e => { e.stopPropagation(); setShowCurrencyModal(true); }}>
              <span style={{ fontSize: 16 }}>{currentCurrencyDef.flag}</span>
              <span style={{ fontWeight: 700, color: currentCurrencyDef.color }}>{currency}</span>
              <span style={{ color: "#8b92a9", fontSize: 12 }}>— {currentCurrencyDef.label}</span>
              <span style={{ fontSize: 10, color: "#6366f1", marginLeft: 4, background: "#eff6ff", padding: "1px 6px", borderRadius: 6 }}>▼ trocar</span>
            </div>
            <input className="calc-num" type="number" placeholder="0.00" value={usd}
              onChange={e => onUsd(e.target.value)} onFocus={() => setField("usd")} />
            <div className="calc-hint">{opType === "buy" ? "Digita o valor que desejas comprar" : "Digita o valor que desejas vender"}</div>
          </div>
        )}

        <div className="rate-note">
          <span style={{ fontSize: 11, color: "#6b7280", fontWeight: 600 }}>Taxa aplicada</span>
          <span className="rate-val" style={{ display: "flex", alignItems: "center", gap: 6 }}><Icon name="chart" size={14} /> 1 {currency} = {currentRate.toLocaleString("pt-AO")} Kz</span>
        </div>
        {!currencyRateAvailable && (
          <div style={{ marginTop: 8, padding: "8px 12px", background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 10, fontSize: 10.5, color: "#92400e", fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>
            ⚠️ Taxa {currency} ainda não foi sincronizada pelo admin — a usar taxa USD como referência temporária.
          </div>
        )}
      </div>

      {/* Currency Selector Bottom Sheet Modal */}
      <SelectionModal
        isOpen={showCurrencyModal}
        title="Selecionar Moeda"
        items={CURRENCIES}
        selectedId={currency}
        onSelect={id => { setCurrency(id); setShowCurrencyModal(false); }}
        onClose={() => setShowCurrencyModal(false)}
        renderIcon={item => null}
        renderFlag={item => item.flag}
      />

      <div className="card" style={{ padding: "18px 20px" }}>
        {/* Caixa de Métodos de Pagamento unificada */}
        <div style={{
          border: "1.5px solid #e0e7ff",
          borderRadius: 20,
          padding: "16px",
          background: "rgba(99, 102, 241, 0.02)",
          marginBottom: 16
        }}>
          <span className="slbl" style={{ color: "#6366f1", fontSize: 10.5, fontWeight: 900, marginBottom: 14, display: "block", textTransform: "uppercase", letterSpacing: "0.5px" }}>
            Métodos de pagamento (carteiras digitais, bancos)
          </span>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {/* Sleek Selector Box 1 (USD Wallet) */}
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span className="slbl" style={{ fontSize: 9, color: "#94a3b8", fontWeight: 800, marginBottom: 6, display: "block" }}>
                {opType === "buy" ? "Carteira de Destino (USD)" : "Carteira de Origem (USD)"}
              </span>
              <div 
                onClick={() => setShowWalletModal(true)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  background: "#ffffff",
                  border: "1.5px solid #e2e8f0",
                  borderRadius: 14,
                  padding: "12px 14px",
                  cursor: "pointer",
                  transition: "all 0.2s"
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = "#6366f1";
                  e.currentTarget.style.boxShadow = "0 4px 12px rgba(99,102,241,0.05)";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = "#e2e8f0";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 36, height: 36, flexShrink: 0, borderRadius: 10, overflow: "hidden", background: destInfo?.logoBg || "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {destInfo?.svg ? (
                      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }} dangerouslySetInnerHTML={{ __html: destInfo.svg }} />
                    ) : destInfo?.logo ? (
                      <img src={destInfo.logo} alt={destInfo.label} style={{ width: 36, height: 36, objectFit: "contain", borderRadius: 10 }} onError={e => { e.target.style.display = "none"; }} />
                    ) : null}
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 800, color: "#1e1b4b" }}>{destInfo?.label}</div>
                    <div style={{ fontSize: 9.5, color: "#8b92a9", fontWeight: 600, marginTop: 1 }}>{destInfo?.desc}</div>
                  </div>
                </div>
                <div style={{ color: "#6366f1", fontSize: 11, fontWeight: 900 }}>▼</div>
              </div>
            </div>

            {/* Sleek Selector Box 2 (Angolan Bank) */}
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span className="slbl" style={{ fontSize: 9, color: "#94a3b8", fontWeight: 800, marginBottom: 6, display: "block" }}>
                {opType === "buy" ? "Banco de Pagamento (AOA)" : "Banco de Recebimento (AOA)"}
              </span>
              <div 
                onClick={() => setShowBankModal(true)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  background: "#ffffff",
                  border: "1.5px solid #e2e8f0",
                  borderRadius: 14,
                  padding: "12px 14px",
                  cursor: "pointer",
                  transition: "all 0.2s"
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = "#6366f1";
                  e.currentTarget.style.boxShadow = "0 4px 12px rgba(99,102,241,0.05)";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = "#e2e8f0";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div 
                    style={{ width: 36, height: 36, flexShrink: 0, borderRadius: 8, overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }} 
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
            ? `Comprar ${currentCurrencyDef.symbol}${usd || "0"} → ${destInfo?.label}` 
            : `Vender ${currentCurrencyDef.symbol}${usd || "0"} → Receber em Kwanza`}
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
