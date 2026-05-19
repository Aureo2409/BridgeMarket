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
  awaiting_kyc:     { label: "KYC Pendente",   color: "#7c3aed", bg: "#f5f3ff", icon: "lock" },
  awaiting_payment: { label: "Aguarda Pagto.",  color: "#d97706", bg: "#fffbeb", icon: "clock" },
  payment_received: { label: "Pago",            color: "#2563eb", bg: "#eff6ff", icon: "file" },
  processing:       { label: "A processar",     color: "#d97706", bg: "#fffbeb", icon: "loader" },
  completed:        { label: "Enviado",         color: "#16a34a", bg: "#f0fdf4", icon: "checkCircle" },
  cancelled:        { label: "Cancelado",        color: "#6b7280", bg: "#f9fafb", icon: "ban" },
  failed:           { label: "Falhou",           color: "#dc2626", bg: "#fef2f2", icon: "alertTriangle" },
};

// ── CSS global ────────────────────────────────────────────────────────────────
export const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Plus Jakarta Sans',sans-serif;background:#e8e9f5;color:#1e1b4b;-webkit-font-smoothing:antialiased}

.shell{font-family:'Plus Jakarta Sans',sans-serif;background:#F6F7FE;max-width:430px;margin:30px auto;border-radius:32px;overflow:hidden;position:relative;box-shadow:0 30px 80px rgba(99,102,241,.12),0 4px 20px rgba(0,0,0,.03);min-height:680px;border: 1px solid rgba(255,255,255,.8);}
.blob{position:absolute;border-radius:50%;filter:blur(60px);pointer-events:none;z-index:0}
.b1{width:260px;height:260px;background:radial-gradient(circle,rgba(167,139,250,.4) 0%,transparent 70%);top:-80px;right:-60px}
.b2{width:220px;height:220px;background:radial-gradient(circle,rgba(134,239,172,.35) 0%,transparent 70%);bottom:-60px;left:-60px}

.hdr{position:relative;z-index:5;display:flex;align-items:center;justify-content:space-between;padding:16px 20px;background:rgba(255,255,255,.8);backdrop-filter:blur(24px);border-bottom:1px solid rgba(99,102,241,.06)}
.logo{display:flex;align-items:center;gap:10px}
.logo-mark{width:36px;height:36px;border-radius:12px;background:linear-gradient(135deg,#6366f1,#8b5cf6);display:flex;align-items:center;justify-content:center;box-shadow:0 6px 16px rgba(99,102,241,.3);flex-shrink:0}
.logo-text{font-size:18px;font-weight:900;color:#1e1b4b;letter-spacing:-.6px}
.logo-sub{font-size:10px;color:#8b92a9;font-weight:700;margin-top:-1px}
.rate-chip{display:flex;align-items:center;gap:6px;background:#ecfdf5;border:1px solid #10b98122;border-radius:20px;padding:6px 12px;font-size:12px;font-weight:800;color:#059669;box-shadow: 0 2px 6px rgba(16,185,129,.05)}
.live-dot{width:8px;height:8px;border-radius:50%;background:#10b981;animation:lp 2s infinite}
@keyframes lp{0%,100%{box-shadow:0 0 0 0 rgba(16,185,129,.55)}60%{box-shadow:0 0 0 6px rgba(16,185,129,0)}}

.steps-bar{position:relative;z-index:4;display:flex;align-items:center;padding:12px 22px;background:rgba(255,255,255,.5);backdrop-filter:blur(16px);border-bottom:1px solid rgba(99,102,241,.05)}
.sdot{width:26px;height:26px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:800;flex-shrink:0;transition:all .3s}
.sdot.done{background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;box-shadow:0 3px 10px rgba(99,102,241,.3)}
.sdot.active{background:#fff;color:#6366f1;border:2.5px solid #6366f1;box-shadow:0 3px 8px rgba(99,102,241,.1)}
.sdot.idle{background:#e5e7eb;color:#9ca3af}
.sline{flex:1;height:2.5px;background:#e5e7eb;margin:0 5px;border-radius:1px;transition:background .3s}
.sline.done{background:linear-gradient(90deg,#6366f1,#8b5cf6)}

.pg{position:relative;z-index:1;padding:20px 20px 24px;overflow-y:auto;max-height:570px}

.card{background:rgba(255,255,255,.85);backdrop-filter:blur(20px);border:1px solid rgba(255,255,255,.7);border-radius:24px;padding:20px;box-shadow:0 12px 32px -10px rgba(99,102,241,.05),0 1px 3px rgba(99,102,241,.01);margin-bottom:14px}
.hero{background:linear-gradient(135deg,#4f46e5 0%,#7c3aed 55%,#9333ea 100%);border-radius:26px;padding:24px;box-shadow:0 14px 40px rgba(99,102,241,.35);margin-bottom:16px;color:#fff;position:relative;overflow:hidden}

.calc-box{background:rgba(247,246,255,.65);border:1.5px solid #e0e7ff;border-radius:20px;padding:16px;transition:all .2s cubic-bezier(0.4,0,0.2,1);cursor:text}
.calc-box.active{border-color:#6366f1;background:#fff;box-shadow:0 8px 24px -10px rgba(99,102,241,.12)}
.calc-flag{font-size:10px;font-weight:800;color:#6b7280;letter-spacing:.5px;text-transform:uppercase;margin-bottom:8px;display:flex;align-items:center;gap:6px}
.calc-num{width:100%;border:none;background:none;font-family:inherit;font-size:32px;font-weight:900;color:#1e1b4b;outline:none;letter-spacing:-1.5px}
.calc-num::placeholder{color:#d1d5db}
.calc-hint{font-size:11px;color:#9ca3af;margin-top:4px;font-weight:600}
.swap-row{display:flex;align-items:center;gap:8px;margin:6px 0;position:relative;z-index:2}
.swap-line{flex:1;height:1.5px;background:linear-gradient(90deg,transparent,#e0e7ff,transparent)}
.swap-btn{width:42px;height:42px;border-radius:50%;background:#fff;border:1.5px solid #e0e7ff;display:flex;align-items:center;justify-content:center;cursor:pointer;box-shadow:0 4px 12px rgba(99,102,241,.08);transition:all .25s;flex-shrink:0;z-index:10}
.swap-btn:hover{border-color:#6366f1;box-shadow:0 6px 16px rgba(99,102,241,.15);transform:scale(1.05)}
.rate-note{display:flex;justify-content:space-between;align-items:center;padding:10px 14px;background:rgba(247,246,255,.4);border-radius:14px;margin-top:12px;border:1px solid rgba(224,231,255,.3)}
.rate-val{display:inline-flex;align-items:center;gap:5px;background:#f0fdf4;border:1px solid #bbf7d0;color:#16a34a;font-size:11px;font-weight:800;padding:4px 10px;border-radius:20px}

.dest-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:12px 0}
.dest-card{border:1.5px solid rgba(229,231,235,.8);border-radius:18px;padding:14px 12px;cursor:pointer;transition:all .2s;background:rgba(255,255,255,.7);display:flex;align-items:center;gap:11px;position:relative}
.dest-card:hover{border-color:#c7d2fe;transform:translateY(-1px);box-shadow:0 4px 12px rgba(99,102,241,.03)}
.dest-card.sel{border-width:2px;box-shadow:0 8px 20px -8px rgba(99,102,241,.2)}
.dest-logo{width:38px;height:38px;flex-shrink:0;border-radius:10px;overflow:hidden}
.dest-logo svg{width:38px;height:38px}
.d-name{font-size:13px;font-weight:800;color:#1e1b4b}
.d-desc{font-size:10px;color:#9ca3af;font-weight:600;margin-top:2px}

.lbl{font-size:10px;font-weight:800;color:#6b7280;text-transform:uppercase;letter-spacing:.5px;margin-bottom:6px;display:block}
.inp{width:100%;padding:13px 16px;background:rgba(247,246,255,.6);border:1.5px solid #e0e7ff;border-radius:16px;font-family:inherit;font-size:14px;font-weight:600;color:#1e1b4b;outline:none;transition:all .2s}
.inp:focus{border-color:#6366f1;background:#fff;box-shadow:0 4px 12px rgba(99,102,241,.05)}
.inp::placeholder{color:#c4c4d0;font-weight:500}

.btn{width:100%;padding:16px;border:none;border-radius:9999px;cursor:pointer;font-family:inherit;font-size:14px;font-weight:800;transition:all .25s cubic-bezier(0.4,0,0.2,1);display:flex;align-items:center;justify-content:center;gap:8px}
.btn-p{background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;box-shadow:0 8px 24px rgba(99,102,241,.28)}
.btn-p:hover{transform:translateY(-1px);box-shadow:0 12px 28px rgba(99,102,241,.38)}
.btn-p:disabled{opacity:.55;transform:none;cursor:not-allowed;box-shadow:none}
.btn-o{background:rgba(255,255,255,.8);border:1.5px solid #e0e7ff;color:#6366f1;margin-top:10px}
.btn-o:hover{border-color:#6366f1;background:#f5f6ff;color:#4f46e5}
.btn-g{background:none;border:none;font-family:inherit;font-size:11px;font-weight:800;color:#9ca3af;cursor:pointer;padding:4px 6px;transition:color .2s}
.btn-g:hover{color:#6366f1}

.upload-zone{border:2px dashed #c7d2fe;border-radius:20px;padding:32px 20px;text-align:center;cursor:pointer;transition:all .2s;background:rgba(247,246,255,.5)}
.upload-zone:hover{border-color:#6366f1;background:#eef2ff}
.upload-zone.has-file{border-color:#10b981;border-style:solid;background:#f0fdf4}
.up-icon{margin-bottom:10px;color:#6366f1;display:flex;justify-content:center}
.up-title{font-size:14px;font-weight:800;color:#1e1b4b;margin-bottom:4px}
.up-sub{font-size:11px;color:#9ca3af;font-weight:600}
.up-prog{height:5px;background:#e0e7ff;border-radius:3px;margin-top:12px;overflow:hidden}
.up-fill{height:100%;background:linear-gradient(90deg,#6366f1,#8b5cf6);border-radius:3px;transition:width .3s}

.o-card{background:rgba(255,255,255,.9);border:1px solid rgba(229,231,235,.7);border-radius:22px;padding:16px;margin-bottom:10px;box-shadow:0 4px 14px rgba(0,0,0,.02);transition:transform .2s}
.o-card:hover{transform:translateY(-1px);box-shadow:0 8px 20px rgba(99,102,241,.03)}
.o-ref{font-size:10px;font-weight:800;color:#9ca3af;font-family:monospace;margin-bottom:4px;letter-spacing:.2px}
.pill{display:inline-flex;align-items:center;gap:4px;font-size:10px;font-weight:800;padding:4px 10px;border-radius:20px;letter-spacing:.2px}

.sum-row{display:flex;justify-content:space-between;align-items:center;padding:11px 0;border-bottom:1px solid rgba(243,244,246,.8);font-size:13px}
.sum-row:last-child{border-bottom:none}
.sum-l{color:#6b7280;font-weight:600}
.sum-v{color:#1e1b4b;font-weight:800;text-align:right;max-width:60%;word-break:break-all}

.succ{text-align:center;padding:16px 8px}
.succ-ico{margin-bottom:16px;animation:pop .65s cubic-bezier(.34,1.56,.64,1);display:flex;justify-content:center;color:#10b981}
.succ-title{font-size:22px;font-weight:900;color:#1e1b4b;letter-spacing:-.6px;margin-bottom:6px}
.succ-sub{font-size:12px;color:#6b7280;font-weight:600;line-height:1.7}
@keyframes pop{from{transform:scale(0);opacity:0}to{transform:scale(1);opacity:1}}

.warn{display:flex;align-items:flex-start;gap:8px;padding:12px 14px;background:#fffbeb;border:1px solid #fde68a;border-radius:18px;margin-bottom:12px;font-size:12px;font-weight:600;color:#92400e;line-height:1.6}
.info{display:flex;align-items:flex-start;gap:8px;padding:12px 14px;background:rgba(247,246,255,.65);border:1px solid rgba(224,231,255,.5);border-radius:18px;margin-bottom:12px;font-size:11px;font-weight:600;color:#6b7280;line-height:1.6}

.toast{position:absolute;bottom:20px;left:50%;transform:translateX(-50%);white-space:nowrap;padding:12px 22px;border-radius:16px;font-size:12px;font-weight:800;z-index:99;animation:tIn .3s cubic-bezier(0.16,1,0.3,1);box-shadow:0 12px 30px rgba(30,27,75,.15)}
.toast.ok{background:#1e1b4b;color:#fff}
.toast.err{background:#7f1d1d;color:#fecaca}
@keyframes tIn{from{opacity:0;transform:translateX(-50%) translateY(12px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}

.slbl{font-size:10px;font-weight:800;color:#9ca3af;text-transform:uppercase;letter-spacing:1.2px;margin-bottom:10px;display:block}

.adm-shell{font-family:'Plus Jakarta Sans',sans-serif;background:#0f172a;max-width:440px;margin:30px auto;border-radius:32px;overflow:hidden;box-shadow:0 30px 80px rgba(0,0,0,.45);min-height:680px;position:relative;border:1px solid rgba(255,255,255,.05)}
.adm-hdr{display:flex;align-items:center;justify-content:space-between;padding:16px 20px;background:#1e293b;border-bottom:1px solid rgba(255,255,255,.05)}
.adm-logo{font-size:15px;font-weight:900;color:#f8fafc;letter-spacing:-.4px;display:flex;align-items:center;gap:8px}
.adm-badge{background:#ef4444;color:#fff;border-radius:10px;font-size:9px;font-weight:800;padding:2px 7px}
.adm-tabs{display:flex;background:#1e293b;border-bottom:1px solid rgba(255,255,255,.05)}
.adm-tab{flex:1;padding:13px 6px;font-size:12px;font-weight:800;color:#64748b;border:none;background:none;cursor:pointer;border-bottom:2.5px solid transparent;font-family:inherit;transition:all .2s;display:flex;align-items:center;justify-content:center}
.adm-tab.on{color:#a5b4fc;border-bottom-color:#6366f1}
.adm-pg{padding:16px 16px 24px;overflow-y:auto;max-height:570px}
.adm-section{font-size:9px;font-weight:800;color:#64748b;text-transform:uppercase;letter-spacing:1.2px;margin-bottom:10px;display:block}
.adm-inp{width:100%;padding:11px 14px;background:#0f172a;border:1.5px solid rgba(255,255,255,.08);border-radius:12px;font-family:inherit;font-size:13px;font-weight:600;color:#f8fafc;outline:none;transition:border-color .2s;margin-bottom:8px}
.adm-inp:focus{border-color:#6366f1}
.adm-btn{width:100%;padding:13px;border:none;border-radius:14px;cursor:pointer;font-family:inherit;font-size:13px;font-weight:800;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;transition:all .2s;display:flex;align-items:center;justify-content:center;gap:6px}
.adm-btn:hover{transform:translateY(-1px)}
.adm-btn:disabled{opacity:.5;cursor:not-allowed;transform:none}
.adm-card{background:#1e293b;border:1px solid rgba(255,255,255,.05);border-radius:18px;padding:14px;margin-bottom:10px}
.adm-card.alert-new{border-color:#ef4444;background:#1c1010;animation:aIn .45s ease}
@keyframes aIn{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}
.adm-card:hover{background:#233045}
.adm-alert-type{font-size:9px;font-weight:800;text-transform:uppercase;letter-spacing:.6px;margin-bottom:4px}
.adm-alert-title{font-size:14px;font-weight:800;color:#f8fafc;margin-bottom:2px}
.adm-alert-body{font-size:12px;color:#94a3b8;font-weight:600;line-height:1.5}
.adm-alert-time{font-size:10px;color:#475569;margin-top:6px;font-weight:700}
.adm-sent-btn{padding:8px 14px;border:none;border-radius:10px;cursor:pointer;font-family:inherit;font-size:11px;font-weight:800;background:#10b981;color:#fff;margin-top:8px;transition:background .2s;display:flex;align-items:center;justify-content:center;gap:4px}
.adm-sent-btn:hover{background:#059669}
.proof-box{background:#0f172a;border:1px solid rgba(255,255,255,.05);border-radius:10px;padding:10px 12px;margin-top:8px}
.proof-link{font-size:11px;color:#818cf8;font-weight:800;text-decoration:none;word-break:break-all}
.proof-link:hover{text-decoration:underline}
.adm-stat-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:16px}
.adm-stat{background:#1e293b;border:1px solid rgba(255,255,255,.04);border-radius:16px;padding:14px}
.adm-stat-val{font-size:24px;font-weight:900;color:#a5b4fc;letter-spacing:-1px}
.adm-stat-lbl{font-size:10px;color:#64748b;font-weight:700;margin-top:3px}
`;
