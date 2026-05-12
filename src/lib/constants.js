// ── Carteiras (ícones SVG reais) ─────────────────────────────────────────────
export const DESTS = [
  {
    id:    "redotpay",
    label: "RedotPay",
    color: "#E8173A",
    bg:    "#fff0f2",
    desc:  "Carteira cripto global",
    hint:  "ID ou endereço RedotPay (ex: UID12345678)",
    svg: `<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="40" height="40" rx="10" fill="#E8173A"/>
      <path d="M20 8C13.373 8 8 13.373 8 20s5.373 12 12 12 12-5.373 12-12S26.627 8 20 8zm0 4a8 8 0 110 16 8 8 0 010-16z" fill="white" opacity="0.3"/>
      <path d="M20 12a8 8 0 100 16A8 8 0 0020 12zm0 3a5 5 0 110 10A5 5 0 0120 15z" fill="white"/>
      <circle cx="20" cy="20" r="3" fill="#E8173A"/>
    </svg>`,
  },
  {
    id:    "airtm",
    label: "Airtm",
    color: "#1A1A1A",
    bg:    "#f5f5f5",
    desc:  "Conta digital global",
    hint:  "Email da conta Airtm",
    svg: `<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="40" height="40" rx="10" fill="#F5F5F5"/>
      <path d="M20 9L11 21h3.5l-2 10h15l-2-10H29L20 9z" fill="none" stroke="#1A1A1A" stroke-width="2.5" stroke-linejoin="round"/>
      <path d="M16 21h8" stroke="#1A1A1A" stroke-width="2" stroke-linecap="round"/>
    </svg>`,
  },
  {
    id:    "binance",
    label: "Binance",
    color: "#F0B90B",
    bg:    "#fffbeb",
    desc:  "Exchange cripto Binance",
    hint:  "UID Binance (ex: 123456789)",
    svg: `<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="40" height="40" rx="10" fill="#1A1A1A"/>
      <path d="M20 10l3 3-3 3-3-3 3-3zM13 17l3 3-3 3-3-3 3-3zM27 17l3 3-3 3-3-3 3-3zM20 24l3 3-3 3-3-3 3-3z" fill="#F0B90B"/>
      <path d="M17 20l3 3 3-3-3-3-3 3z" fill="#F0B90B"/>
    </svg>`,
  },
  {
    id:    "visa",
    label: "Visa Prepaid",
    color: "#1A1F71",
    bg:    "#f0f2ff",
    desc:  "Cartão Visa pré-pago",
    hint:  "Número do cartão (16 dígitos)",
    svg: `<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="40" height="40" rx="10" fill="#1A1F71"/>
      <rect x="6" y="14" width="28" height="12" rx="2" fill="#F5F5F5" opacity="0.15"/>
      <text x="20" y="23" font-family="Arial" font-size="9" font-weight="900" fill="white" text-anchor="middle" letter-spacing="0.5">VISA</text>
      <rect x="6" y="24" width="8" height="3" rx="1" fill="#F0B90B"/>
      <rect x="16" y="24" width="8" height="3" rx="1" fill="#F0B90B" opacity="0.6"/>
    </svg>`,
  },
];

// ── Estados dos pedidos ───────────────────────────────────────────────────────
export const STATUS_META = {
  awaiting_kyc:     { label: "KYC Pendente",   color: "#7c3aed", bg: "#f5f3ff", icon: "🔐" },
  awaiting_payment: { label: "Aguarda Pagto.",  color: "#d97706", bg: "#fffbeb", icon: "⏳" },
  payment_received: { label: "Pago ✓",          color: "#2563eb", bg: "#eff6ff", icon: "📨" },
  processing:       { label: "A processar",     color: "#d97706", bg: "#fffbeb", icon: "⚙️" },
  completed:        { label: "Enviado ✅",       color: "#16a34a", bg: "#f0fdf4", icon: "✅" },
  cancelled:        { label: "Cancelado",        color: "#6b7280", bg: "#f9fafb", icon: "❌" },
  failed:           { label: "Falhou",           color: "#dc2626", bg: "#fef2f2", icon: "⚠️" },
};

// ── CSS global ────────────────────────────────────────────────────────────────
export const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Plus Jakarta Sans',sans-serif;background:#e8e9f5}

.shell{font-family:'Plus Jakarta Sans',sans-serif;background:#F2F3FF;max-width:430px;margin:0 auto;border-radius:28px;overflow:hidden;position:relative;box-shadow:0 28px 72px rgba(99,102,241,.18),0 4px 16px rgba(0,0,0,.06);min-height:640px}
.blob{position:absolute;border-radius:50%;filter:blur(52px);pointer-events:none;z-index:0}
.b1{width:230px;height:230px;background:radial-gradient(circle,rgba(167,139,250,.5) 0%,transparent 70%);top:-70px;right:-50px}
.b2{width:180px;height:180px;background:radial-gradient(circle,rgba(134,239,172,.45) 0%,transparent 70%);bottom:-40px;left:-40px}

.hdr{position:relative;z-index:5;display:flex;align-items:center;justify-content:space-between;padding:14px 18px;background:rgba(255,255,255,.82);backdrop-filter:blur(20px);border-bottom:1px solid rgba(99,102,241,.1)}
.logo{display:flex;align-items:center;gap:9px}
.logo-mark{width:34px;height:34px;border-radius:11px;background:linear-gradient(135deg,#6366f1,#8b5cf6);display:flex;align-items:center;justify-content:center;font-size:17px;box-shadow:0 4px 12px rgba(99,102,241,.4);flex-shrink:0}
.logo-text{font-size:17px;font-weight:900;color:#1e1b4b;letter-spacing:-.5px}
.logo-sub{font-size:10px;color:#8b92a9;font-weight:600}
.rate-chip{display:flex;align-items:center;gap:5px;background:linear-gradient(135deg,#ecfdf5,#d1fae5);border:1.5px solid #6ee7b7;border-radius:20px;padding:5px 11px;font-size:12px;font-weight:800;color:#059669}
.live-dot{width:7px;height:7px;border-radius:50%;background:#10b981;animation:lp 2s infinite}
@keyframes lp{0%,100%{box-shadow:0 0 0 0 rgba(16,185,129,.5)}60%{box-shadow:0 0 0 5px rgba(16,185,129,0)}}

.steps-bar{position:relative;z-index:4;display:flex;align-items:center;padding:11px 20px;background:rgba(255,255,255,.6);backdrop-filter:blur(12px);border-bottom:1px solid rgba(99,102,241,.08)}
.sdot{width:24px;height:24px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:800;flex-shrink:0;transition:all .3s}
.sdot.done{background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;box-shadow:0 2px 8px rgba(99,102,241,.4)}
.sdot.active{background:#fff;color:#6366f1;border:2.5px solid #6366f1}
.sdot.idle{background:#e5e7eb;color:#9ca3af}
.sline{flex:1;height:2px;background:#e5e7eb;margin:0 4px;border-radius:1px;transition:background .3s}
.sline.done{background:linear-gradient(90deg,#6366f1,#8b5cf6)}

.pg{position:relative;z-index:1;padding:18px 18px 22px;overflow-y:auto;max-height:555px}

.card{background:rgba(255,255,255,.92);backdrop-filter:blur(14px);border:1.5px solid rgba(255,255,255,.96);border-radius:20px;padding:16px;box-shadow:0 4px 18px rgba(99,102,241,.07);margin-bottom:12px}
.hero{background:linear-gradient(135deg,#4f46e5 0%,#7c3aed 55%,#9333ea 100%);border-radius:20px;padding:20px;box-shadow:0 12px 36px rgba(99,102,241,.42);margin-bottom:14px;color:#fff}

.calc-box{background:#f7f6ff;border:2px solid #e0e7ff;border-radius:14px;padding:14px;transition:border-color .2s;cursor:text}
.calc-box.active{border-color:#6366f1;background:#fff}
.calc-flag{font-size:10px;font-weight:700;color:#6b7280;letter-spacing:.4px;text-transform:uppercase;margin-bottom:7px;display:flex;align-items:center;gap:5px}
.calc-num{width:100%;border:none;background:none;font-family:inherit;font-size:30px;font-weight:900;color:#1e1b4b;outline:none;letter-spacing:-1.5px}
.calc-num::placeholder{color:#d1d5db}
.calc-hint{font-size:10px;color:#9ca3af;margin-top:3px;font-weight:500}
.swap-row{display:flex;align-items:center;gap:8px;margin:8px 0}
.swap-line{flex:1;height:1.5px;background:linear-gradient(90deg,transparent,#e0e7ff,transparent)}
.swap-btn{width:38px;height:38px;border-radius:50%;background:#fff;border:2px solid #e0e7ff;display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:17px;box-shadow:0 2px 8px rgba(0,0,0,.06);transition:all .25s;flex-shrink:0}
.swap-btn:hover{border-color:#6366f1;transform:rotate(180deg)}
.rate-note{display:flex;justify-content:space-between;align-items:center;padding:9px 13px;background:#f7f6ff;border-radius:11px;margin-top:10px}
.rate-val{display:inline-flex;align-items:center;gap:4px;background:#f0fdf4;border:1px solid #bbf7d0;color:#16a34a;font-size:11px;font-weight:800;padding:3px 9px;border-radius:20px}

.dest-grid{display:grid;grid-template-columns:1fr 1fr;gap:9px;margin:10px 0}
.dest-card{border:2px solid #e5e7eb;border-radius:14px;padding:12px 10px;cursor:pointer;transition:all .18s;background:#fff;display:flex;align-items:center;gap:10px}
.dest-card:hover{border-color:#c7d2fe;transform:translateY(-1px)}
.dest-card.sel{border-width:2.5px}
.dest-logo{width:36px;height:36px;flex-shrink:0}
.dest-logo svg{width:36px;height:36px}
.d-name{font-size:13px;font-weight:800;color:#1e1b4b}
.d-desc{font-size:10px;color:#9ca3af;font-weight:500;margin-top:1px}

.lbl{font-size:10px;font-weight:800;color:#6b7280;text-transform:uppercase;letter-spacing:.4px;margin-bottom:5px;display:block}
.inp{width:100%;padding:12px 14px;background:#f7f6ff;border:2px solid #e0e7ff;border-radius:13px;font-family:inherit;font-size:14px;font-weight:600;color:#1e1b4b;outline:none;transition:border-color .2s}
.inp:focus{border-color:#6366f1;background:#fff}
.inp::placeholder{color:#c4c4d0;font-weight:400}

.btn{width:100%;padding:14px;border:none;border-radius:15px;cursor:pointer;font-family:inherit;font-size:14px;font-weight:800;transition:all .2s}
.btn-p{background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;box-shadow:0 6px 18px rgba(99,102,241,.35)}
.btn-p:hover{transform:translateY(-2px);box-shadow:0 10px 26px rgba(99,102,241,.42)}
.btn-p:disabled{opacity:.5;transform:none;cursor:not-allowed}
.btn-o{background:#fff;border:2px solid #e0e7ff;color:#6366f1;margin-top:8px}
.btn-o:hover{border-color:#6366f1;background:#eef2ff}
.btn-g{background:none;border:none;font-family:inherit;font-size:11px;font-weight:700;color:#9ca3af;cursor:pointer;padding:4px 6px}
.btn-g:hover{color:#6366f1}

.upload-zone{border:2.5px dashed #c7d2fe;border-radius:16px;padding:28px 18px;text-align:center;cursor:pointer;transition:all .2s;background:#f7f6ff}
.upload-zone:hover{border-color:#6366f1;background:#eef2ff}
.upload-zone.has-file{border-color:#10b981;border-style:solid;background:#f0fdf4}
.up-icon{font-size:36px;margin-bottom:8px}
.up-title{font-size:13px;font-weight:800;color:#1e1b4b;margin-bottom:3px}
.up-sub{font-size:11px;color:#9ca3af;font-weight:500}
.up-prog{height:4px;background:#e0e7ff;border-radius:2px;margin-top:10px;overflow:hidden}
.up-fill{height:100%;background:linear-gradient(90deg,#6366f1,#8b5cf6);border-radius:2px;transition:width .3s}

.o-card{background:#fff;border:1.5px solid #e5e7eb;border-radius:16px;padding:14px;margin-bottom:9px;box-shadow:0 2px 8px rgba(0,0,0,.04)}
.o-ref{font-size:10px;font-weight:700;color:#9ca3af;font-family:monospace;margin-bottom:3px}
.pill{display:inline-flex;align-items:center;gap:3px;font-size:10px;font-weight:800;padding:3px 9px;border-radius:20px;letter-spacing:.2px}

.sum-row{display:flex;justify-content:space-between;align-items:center;padding:9px 0;border-bottom:1px solid #f3f4f6;font-size:13px}
.sum-row:last-child{border-bottom:none}
.sum-l{color:#6b7280;font-weight:500}
.sum-v{color:#1e1b4b;font-weight:700;text-align:right;max-width:60%;word-break:break-all}

.succ{text-align:center;padding:12px 6px}
.succ-ico{font-size:60px;margin-bottom:12px;animation:pop .5s cubic-bezier(.34,1.56,.64,1)}
.succ-title{font-size:21px;font-weight:900;color:#1e1b4b;letter-spacing:-.5px;margin-bottom:5px}
.succ-sub{font-size:12px;color:#6b7280;font-weight:500;line-height:1.7}
@keyframes pop{from{transform:scale(0);opacity:0}to{transform:scale(1);opacity:1}}

.warn{display:flex;align-items:flex-start;gap:7px;padding:11px 13px;background:#fffbeb;border:1.5px solid #fde68a;border-radius:13px;margin-bottom:11px;font-size:12px;font-weight:600;color:#92400e;line-height:1.5}
.info{display:flex;align-items:flex-start;gap:7px;padding:10px 13px;background:#f7f6ff;border-radius:12px;margin-bottom:11px;font-size:11px;font-weight:500;color:#6b7280;line-height:1.6}

.toast{position:absolute;bottom:18px;left:50%;transform:translateX(-50%);white-space:nowrap;padding:11px 20px;border-radius:14px;font-size:12px;font-weight:800;z-index:99;animation:tIn .3s ease;box-shadow:0 8px 24px rgba(0,0,0,.14)}
.toast.ok{background:#1e1b4b;color:#fff}
.toast.err{background:#7f1d1d;color:#fecaca}
@keyframes tIn{from{opacity:0;transform:translateX(-50%) translateY(10px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}

.slbl{font-size:10px;font-weight:800;color:#9ca3af;text-transform:uppercase;letter-spacing:1.2px;margin-bottom:9px;display:block}

.adm-shell{font-family:'Plus Jakarta Sans',sans-serif;background:#0f172a;max-width:440px;margin:0 auto;border-radius:28px;overflow:hidden;box-shadow:0 28px 72px rgba(0,0,0,.5);min-height:640px;position:relative}
.adm-hdr{display:flex;align-items:center;justify-content:space-between;padding:14px 18px;background:#1e293b;border-bottom:1px solid rgba(255,255,255,.06)}
.adm-logo{font-size:14px;font-weight:900;color:#f8fafc;letter-spacing:-.4px;display:flex;align-items:center;gap:7px}
.adm-badge{background:#ef4444;color:#fff;border-radius:10px;font-size:9px;font-weight:800;padding:2px 7px}
.adm-tabs{display:flex;background:#1e293b;border-bottom:1px solid rgba(255,255,255,.06)}
.adm-tab{flex:1;padding:11px 6px;font-size:11px;font-weight:700;color:#475569;border:none;background:none;cursor:pointer;border-bottom:2px solid transparent;font-family:inherit;transition:all .2s}
.adm-tab.on{color:#a5b4fc;border-bottom-color:#6366f1}
.adm-pg{padding:14px 16px 22px;overflow-y:auto;max-height:555px}
.adm-section{font-size:9px;font-weight:800;color:#475569;text-transform:uppercase;letter-spacing:1.2px;margin-bottom:9px;display:block}
.adm-inp{width:100%;padding:10px 13px;background:#0f172a;border:1.5px solid rgba(255,255,255,.1);border-radius:10px;font-family:inherit;font-size:13px;font-weight:600;color:#f8fafc;outline:none;transition:border-color .2s;margin-bottom:7px}
.adm-inp:focus{border-color:#6366f1}
.adm-btn{width:100%;padding:12px;border:none;border-radius:12px;cursor:pointer;font-family:inherit;font-size:13px;font-weight:800;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;transition:all .2s}
.adm-btn:hover{transform:translateY(-1px)}
.adm-btn:disabled{opacity:.5;cursor:not-allowed;transform:none}
.adm-card{background:#1e293b;border:1.5px solid rgba(255,255,255,.06);border-radius:14px;padding:13px;margin-bottom:9px}
.adm-card.alert-new{border-color:#ef4444;background:#1f0a0a;animation:aIn .4s ease}
@keyframes aIn{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:translateY(0)}}
.adm-card:hover{background:#1e2d40}
.adm-alert-type{font-size:9px;font-weight:800;text-transform:uppercase;letter-spacing:.5px;margin-bottom:3px}
.adm-alert-title{font-size:13px;font-weight:800;color:#f8fafc;margin-bottom:2px}
.adm-alert-body{font-size:11px;color:#94a3b8;font-weight:500;line-height:1.5}
.adm-alert-time{font-size:10px;color:#334155;margin-top:5px;font-weight:600}
.adm-sent-btn{padding:7px 13px;border:none;border-radius:9px;cursor:pointer;font-family:inherit;font-size:11px;font-weight:800;background:#10b981;color:#fff;margin-top:8px;transition:background .2s}
.adm-sent-btn:hover{background:#059669}
.proof-box{background:#0f172a;border:1px solid rgba(255,255,255,.07);border-radius:9px;padding:9px 11px;margin-top:7px}
.proof-link{font-size:11px;color:#818cf8;font-weight:700;text-decoration:none;word-break:break-all}
.proof-link:hover{text-decoration:underline}
.adm-stat-grid{display:grid;grid-template-columns:1fr 1fr;gap:9px;margin-bottom:14px}
.adm-stat{background:#1e293b;border:1px solid rgba(255,255,255,.06);border-radius:12px;padding:12px}
.adm-stat-val{font-size:22px;font-weight:900;color:#a5b4fc;letter-spacing:-1px}
.adm-stat-lbl{font-size:10px;color:#475569;font-weight:600;margin-top:2px}
`;
