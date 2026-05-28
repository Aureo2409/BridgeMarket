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
      <path d="M14 12h8a5 5 0 110 10h-8V12z" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M18 22l6 7" stroke="white" stroke-width="3" stroke-linecap="round"/>
      <circle cx="14" cy="20" r="2.5" fill="white"/>
    </svg>`,
  },
  {
    id:    "airtm",
    label: "Airtm",
    color: "#00A8E8",
    bg:    "#f0faff",
    desc:  "Conta digital global",
    hint:  "Email da conta Airtm",
    svg: `<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="40" height="40" rx="10" fill="#00A8E8"/>
      <path d="M13 23.5a4.5 4.5 0 011.5-8.7 6 6 0 0111 0 4.5 4.5 0 011.5 8.7" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M17 21l3-3 3 3M20 18v8" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
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
      <rect width="40" height="40" rx="10" fill="#121212"/>
      <path d="M20 10l3.5 3.5L20 17l-3.5-3.5L20 10zm-6.5 6.5l3.5 3.5-3.5 3.5-3.5-3.5 3.5-3.5zm13 0l3.5 3.5-3.5 3.5-3.5-3.5 3.5-3.5zM20 23l3.5 3.5L20 30l-3.5-3.5L20 23zm0-6.2l2.7 2.7-2.7 2.7-2.7-2.7 2.7-2.7z" fill="#F0B90B"/>
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
      <path d="M8 15h3.8l2.4 6.8 1.4-5.8c.2-.9.8-1 1.6-1H22l-3.2 8h-3.8L11.2 17l-.8-3.5C10.2 13 9 13 8 13.2V15z" fill="white"/>
      <path d="M22 15h3.2l2 8H24l-.4-1.8h-2.4L21 23h-2.2l3.2-8zm.8 4.6l.8-3.4-.6 3.4H22.8z" fill="white"/>
      <path d="M27.5 18c0-1.2.8-1.8 1.8-1.8 1.2 0 1.8.6 1.8 1.4h-1.4c0-.4-.3-.6-.7-.6-.4 0-.6.2-.6.4 0 .4.4.5.9.7 1.1.4 1.7 1 1.7 1.8 0 1.3-1 2-2.2 2-1.3 0-2-.6-2-1.5h1.4c0 .5.3.7.8.7.4 0 .7-.1.7-.4 0-.4-.4-.5-.9-.7-1.1-.4-1.8-1-1.8-1.9z" fill="white"/>
      <path d="M12.5 15l-1.5 6L9.6 15" stroke="#F0B90B" stroke-width="1.8" stroke-linecap="round"/>
    </svg>`,
  }
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

.shell{font-family:'Plus Jakarta Sans',sans-serif;background:#F6F7FE;width:100%;max-width:540px;margin:40px auto;border-radius:24px;overflow:hidden;position:relative;box-shadow:0 20px 60px rgba(99,102,241,.12),0 4px 20px rgba(0,0,0,.03);border:1px solid rgba(255,255,255,.8);display:flex;flex-direction:column}
.blob{position:absolute;border-radius:50%;filter:blur(60px);pointer-events:none;z-index:0}
.b1{width:260px;height:260px;background:radial-gradient(circle,rgba(167,139,250,.4) 0%,transparent 70%);top:-80px;right:-60px}
.b2{width:220px;height:220px;background:radial-gradient(circle,rgba(134,239,172,.35) 0%,transparent 70%);bottom:-60px;left:-60px}

.hdr{position:relative;z-index:5;display:flex;align-items:center;justify-content:space-between;padding:12px 16px;background:rgba(255,255,255,.8);backdrop-filter:blur(24px);border-bottom:1px solid rgba(99,102,241,.06);flex-shrink:0}
.logo{display:flex;align-items:center;gap:8px}
.logo-mark{width:32px;height:32px;border-radius:10px;background:linear-gradient(135deg,#6366f1,#8b5cf6);display:flex;align-items:center;justify-content:center;box-shadow:0 4px 12px rgba(99,102,241,.25);flex-shrink:0}
.logo-text{font-size:16px;font-weight:900;color:#1e1b4b;letter-spacing:-.5px}
.logo-sub{font-size:9.5px;color:#8b92a9;font-weight:700;margin-top:-2px}
.rate-chip{display:flex;align-items:center;gap:5px;background:#ecfdf5;border:1px solid #10b98122;border-radius:20px;padding:5px 10px;font-size:11px;font-weight:800;color:#059669;box-shadow:0 2px 6px rgba(16,185,129,.05)}
.live-dot{width:7px;height:7px;border-radius:50%;background:#10b981;animation:lp 2s infinite}
@keyframes lp{0%,100%{box-shadow:0 0 0 0 rgba(16,185,129,.55)}60%{box-shadow:0 0 0 6px rgba(16,185,129,0)}}

.steps-bar{position:relative;z-index:4;display:flex;align-items:center;padding:8px 16px;background:rgba(255,255,255,.5);backdrop-filter:blur(16px);border-bottom:1px solid rgba(99,102,241,.05);flex-shrink:0}
.sdot{width:22px;height:22px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:9.5px;font-weight:800;flex-shrink:0;transition:all .3s}
.sdot.done{background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;box-shadow:0 2px 8px rgba(99,102,241,.25)}
.sdot.active{background:#fff;color:#6366f1;border:2px solid #6366f1;box-shadow:0 2px 6px rgba(99,102,241,.1)}
.sdot.idle{background:#e5e7eb;color:#9ca3af}
.sline{flex:1;height:2px;background:#e5e7eb;margin:0 4px;border-radius:1px;transition:background .3s}
.sline.done{background:linear-gradient(90deg,#6366f1,#8b5cf6)}

.pg{position:relative;z-index:1;padding:12px 14px 16px;display:flex;flex-direction:column}

.card{background:rgba(255,255,255,.85);backdrop-filter:blur(20px);border:1px solid rgba(255,255,255,.7);border-radius:20px;padding:14px 16px;box-shadow:0 10px 25px -10px rgba(99,102,241,.05),0 1px 3px rgba(99,102,241,.01);margin-bottom:10px}
.hero{background:linear-gradient(135deg,#4f46e5 0%,#7c3aed 55%,#9333ea 100%);border-radius:20px;padding:16px 18px;box-shadow:0 12px 30px rgba(99,102,241,.25);margin-bottom:10px;color:#fff;position:relative;overflow:hidden}

.calc-box{background:rgba(247,246,255,.65);border:1.5px solid #e0e7ff;border-radius:16px;padding:12px 14px;transition:all .2s cubic-bezier(0.4,0,0.2,1);cursor:text}
.calc-box.active{border-color:#6366f1;background:#fff;box-shadow:0 6px 16px -8px rgba(99,102,241,.12)}
.calc-flag{font-size:9.5px;font-weight:800;color:#6b7280;letter-spacing:.5px;text-transform:uppercase;margin-bottom:6px;display:flex;align-items:center;gap:5px}
.calc-num{width:100%;border:none;background:none;font-family:inherit;font-size:28px;font-weight:900;color:#1e1b4b;outline:none;letter-spacing:-1px}
.calc-num::placeholder{color:#d1d5db}
.calc-hint{font-size:10px;color:#9ca3af;margin-top:3px;font-weight:600}
.swap-row{display:flex;align-items:center;gap:6px;margin:4px 0;position:relative;z-index:2}
.swap-line{flex:1;height:1.5px;background:linear-gradient(90deg,transparent,#e0e7ff,transparent)}
.swap-btn{width:36px;height:36px;border-radius:50%;background:#fff;border:1.5px solid #e0e7ff;display:flex;align-items:center;justify-content:center;cursor:pointer;box-shadow:0 3px 8px rgba(99,102,241,.08);transition:all .25s;flex-shrink:0;z-index:10}
.swap-btn:hover{border-color:#6366f1;box-shadow:0 4px 12px rgba(99,102,241,.15);transform:scale(1.05)}
.rate-note{display:flex;justify-content:space-between;align-items:center;padding:8px 12px;background:rgba(247,246,255,.4);border-radius:12px;margin-top:10px;border:1px solid rgba(224,231,255,.3)}
.rate-val{display:inline-flex;align-items:center;gap:4px;background:#f0fdf4;border:1px solid #bbf7d0;color:#16a34a;font-size:10.5px;font-weight:800;padding:3px 8px;border-radius:20px}

.dest-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:10px 0}
.dest-card{border:1.5px solid rgba(229,231,235,.8);border-radius:14px;padding:10px 10px;cursor:pointer;transition:all .2s;background:rgba(255,255,255,.7);display:flex;align-items:center;gap:8px;position:relative}
.dest-card:hover{border-color:#c7d2fe;transform:translateY(-1px);box-shadow:0 4px 12px rgba(99,102,241,.03)}
.dest-card.sel{border-width:2px;box-shadow:0 6px 16px -8px rgba(99,102,241,.2)}
.dest-logo{width:32px;height:32px;flex-shrink:0;border-radius:8px;overflow:hidden}
.dest-logo svg{width:32px;height:32px}
.d-name{font-size:12px;font-weight:800;color:#1e1b4b}
.d-desc{font-size:9px;color:#9ca3af;font-weight:600;margin-top:1px}

.lbl{font-size:9.5px;font-weight:800;color:#6b7280;text-transform:uppercase;letter-spacing:.5px;margin-bottom:4px;display:block}
.inp{width:100%;padding:10px 14px;background:rgba(247,246,255,.6);border:1.5px solid #e0e7ff;border-radius:12px;font-family:inherit;font-size:13px;font-weight:600;color:#1e1b4b;outline:none;transition:all .2s}
.inp:focus{border-color:#6366f1;background:#fff;box-shadow:0 4px 12px rgba(99,102,241,.05)}
.inp::placeholder{color:#c4c4d0;font-weight:500}

.btn{width:100%;padding:13px;border:none;border-radius:16px;cursor:pointer;font-family:inherit;font-size:13px;font-weight:800;transition:all .25s cubic-bezier(0.4,0,0.2,1);display:flex;align-items:center;justify-content:center;gap:6px}
.btn-p{background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;box-shadow:0 6px 18 rgba(99,102,241,.25)}
.btn-p:hover{transform:translateY(-1px);box-shadow:0 10px 22px rgba(99,102,241,.35)}
.btn-p:disabled{opacity:.55;transform:none;cursor:not-allowed;box-shadow:none}
.btn-o{background:rgba(255,255,255,.8);border:1.5px solid #e0e7ff;color:#6366f1;margin-top:8px}
.btn-o:hover{border-color:#6366f1;background:#f5f6ff;color:#4f46e5}
.btn-g{background:none;border:none;font-family:inherit;font-size:11px;font-weight:800;color:#9ca3af;cursor:pointer;padding:4px 6px;transition:color .2s}
.btn-g:hover{color:#6366f1}

.upload-zone{border:2px dashed #c7d2fe;border-radius:16px;padding:24px 16px;text-align:center;cursor:pointer;transition:all .2s;background:rgba(247,246,255,.5)}
.upload-zone:hover{border-color:#6366f1;background:#eef2ff}
.upload-zone.has-file{border-color:#10b981;border-style:solid;background:#f0fdf4}
.up-icon{margin-bottom:8px;color:#6366f1;display:flex;justify-content:center}
.up-title{font-size:13px;font-weight:800;color:#1e1b4b;margin-bottom:3px}
.up-sub{font-size:10px;color:#9ca3af;font-weight:600}
.up-prog{height:4px;background:#e0e7ff;border-radius:2px;margin-top:10px;overflow:hidden}
.up-fill{height:100%;background:linear-gradient(90deg,#6366f1,#8b5cf6);border-radius:2px;transition:width .3s}

.o-card{background:rgba(255,255,255,.9);border:1px solid rgba(229,231,235,.7);border-radius:18px;padding:12px 14px;margin-bottom:8px;box-shadow:0 2px 8px rgba(0,0,0,.02);transition:transform .2s}
.o-card:hover{transform:translateY(-1px);box-shadow:0 6px 14px rgba(99,102,241,.03)}
.o-ref{font-size:9.5px;font-weight:800;color:#9ca3af;font-family:monospace;margin-bottom:4px;letter-spacing:.2px}
.pill{display:inline-flex;align-items:center;gap:3px;font-size:9.5px;font-weight:800;padding:3px 8px;border-radius:20px;letter-spacing:.2px}

.sum-row{display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid rgba(243,244,246,.8);font-size:12.5px}
.sum-row:last-child{border-bottom:none}
.sum-l{color:#6b7280;font-weight:600}
.sum-v{color:#1e1b4b;font-weight:800;text-align:right;max-width:60%;word-break:break-all}

.succ{text-align:center;padding:12px 6px}
.succ-ico{margin-bottom:12px;animation:pop .65s cubic-bezier(.34,1.56,.64,1);display:flex;justify-content:center;color:#10b981}
.succ-title{font-size:20px;font-weight:900;color:#1e1b4b;letter-spacing:-.5px;margin-bottom:4px}
.succ-sub{font-size:11.5px;color:#6b7280;font-weight:600;line-height:1.6}
@keyframes pop{from{transform:scale(0);opacity:0}to{transform:scale(1);opacity:1}}

.warn{display:flex;align-items:flex-start;gap:6px;padding:10px 12px;background:#fffbeb;border:1px solid #fde68a;border-radius:14px;margin-bottom:10px;font-size:11.5px;font-weight:600;color:#92400e;line-height:1.5}
.info{display:flex;align-items:flex-start;gap:6px;padding:10px 12px;background:rgba(247,246,255,.65);border:1px solid rgba(224,231,255,.5);border-radius:14px;margin-bottom:10px;font-size:10.5px;font-weight:600;color:#6b7280;line-height:1.5}

.toast{position:absolute;bottom:20px;left:50%;transform:translateX(-50%);white-space:nowrap;padding:10px 18px;border-radius:12px;font-size:11.5px;font-weight:800;z-index:99;animation:tIn .3s cubic-bezier(0.16,1,0.3,1);box-shadow:0 10px 25px rgba(30,27,75,.15)}
.toast.ok{background:#1e1b4b;color:#fff}
.toast.err{background:#7f1d1d;color:#fecaca}
@keyframes tIn{from{opacity:0;transform:translateX(-50%) translateY(12px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}

.slbl{font-size:9.5px;font-weight:800;color:#9ca3af;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px;display:block}

.adm-shell{font-family:'Plus Jakarta Sans',sans-serif;background:#0f172a;width:95%;max-width:1000px;margin:40px auto;border-radius:24px;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,.45);position:relative;border:1px solid rgba(255,255,255,.05);display:flex;flex-direction:column}
.adm-hdr{display:flex;align-items:center;justify-content:space-between;padding:12px 16px;background:#1e293b;border-bottom:1px solid rgba(255,255,255,.05);flex-shrink:0}
.adm-logo{font-size:14px;font-weight:900;color:#f8fafc;letter-spacing:-.3px;display:flex;align-items:center;gap:6px}
.adm-badge{background:#ef4444;color:#fff;border-radius:8px;font-size:8.5px;font-weight:800;padding:1px 6px}
.adm-tabs{display:flex;background:#1e293b;border-bottom:1px solid rgba(255,255,255,.05);flex-shrink:0}
.adm-tab{flex:1;padding:10px 4px;font-size:11.5px;font-weight:800;color:#64748b;border:none;background:none;cursor:pointer;border-bottom:2.5px solid transparent;font-family:inherit;transition:all .2s;display:flex;align-items:center;justify-content:center}
.adm-tab.on{color:#a5b4fc;border-bottom-color:#6366f1}
.adm-pg{flex:1;padding:12px 12px 20px;overflow-y:auto}
.adm-section{font-size:8.5px;font-weight:800;color:#64748b;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px;display:block}
.adm-inp{width:100%;padding:9px 12px;background:#0f172a;border:1.5px solid rgba(255,255,255,.08);border-radius:10px;font-family:inherit;font-size:12.5px;font-weight:600;color:#f8fafc;outline:none;transition:border-color .2s;margin-bottom:6px}
.adm-inp:focus{border-color:#6366f1}
.adm-btn{width:100%;padding:11px;border:none;border-radius:12px;cursor:pointer;font-family:inherit;font-size:12.5px;font-weight:800;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;transition:all .2s;display:flex;align-items:center;justify-content:center;gap:5px}
.adm-btn:hover{transform:translateY(-1px)}
.adm-btn:disabled{opacity:.5;cursor:not-allowed;transform:none}
.adm-card{background:#1e293b;border:1px solid rgba(255,255,255,.05);border-radius:16px;padding:12px;margin-bottom:8px}
.adm-card.alert-new{border-color:#ef4444;background:#1c1010;animation:aIn .45s ease}
@keyframes aIn{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}
.adm-card:hover{background:#233045}
.adm-alert-type{font-size:8.5px;font-weight:800;text-transform:uppercase;letter-spacing:.5px;margin-bottom:3px}
.adm-alert-title{font-size:13px;font-weight:800;color:#f8fafc;margin-bottom:2px}
.adm-alert-body{font-size:11.5px;color:#94a3b8;font-weight:600;line-height:1.4}
.adm-alert-time{font-size:9.5px;color:#475569;margin-top:5px;font-weight:700}
.adm-sent-btn{padding:6px 12px;border:none;border-radius:8px;cursor:pointer;font-family:inherit;font-size:10.5px;font-weight:800;background:#10b981;color:#fff;margin-top:6px;transition:background .2s;display:flex;align-items:center;justify-content:center;gap:4px}
.adm-sent-btn:hover{background:#059669}
.proof-box{background:#0f172a;border:1px solid rgba(255,255,255,.05);border-radius:8px;padding:8px 10px;margin-top:6px}
.proof-link{font-size:10.5px;color:#818cf8;font-weight:800;text-decoration:none;word-break:break-all}
.proof-link:hover{text-decoration:underline}
.adm-stat-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:12px}
.adm-stat{background:#1e293b;border:1px solid rgba(255,255,255,.04);border-radius:14px;padding:12px}
.adm-stat-val{font-size:20px;font-weight:900;color:#a5b4fc;letter-spacing:-1px}
.adm-stat-lbl{font-size:9.5px;color:#64748b;font-weight:700;margin-top:2px}

/* Responsive Adaptive Styling */
@media(min-width:600px){
  .shell{max-width:600px;margin:40px auto}
  .card{padding:20px 24px;margin-bottom:14px}
  .hero{padding:24px;margin-bottom:14px}
  .calc-box{padding:16px 20px}
  .calc-num{font-size:32px}
  .pg{padding:20px 24px 32px}
  .hdr{padding:16px 24px}
  .steps-bar{padding:12px 24px}
  .dest-grid{grid-template-columns:1fr 1fr 1fr 1fr;gap:10px}
  .dest-card{padding:12px 10px;gap:10px}
}

@media(min-width:768px){
  .adm-stat-grid{grid-template-columns:1fr 1fr 1fr 1fr;gap:12px}
}

@media(max-width:480px){
  .shell{margin:0;border-radius:0;max-width:100%;min-height:100vh;border:none}
  .adm-shell{margin:0;border-radius:0;max-width:100%;min-height:100vh;border:none}
  body{background:#F6F7FE}
}

/* --- NEW CUSTOM PREMIUM STYLES --- */
.bottom-nav {
  position: absolute;
  bottom: 16px;
  left: 16px;
  right: 16px;
  height: 68px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(24px);
  border-radius: 20px;
  box-shadow: 0 12px 35px rgba(99,102,241,0.18), 0 4px 12px rgba(0,0,0,0.03);
  border: 1px solid rgba(255,255,255,0.7);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px;
  z-index: 1000;
}

.bottom-nav-item {
  flex: 1;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border: none;
  background: none;
  font-family: inherit;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 16px;
  color: #8b92a9;
  font-weight: 800;
  font-size: 10px;
  gap: 4px;
}

.bottom-nav-item:hover {
  color: #6366f1;
  background: rgba(99,102,241,0.04);
}

.bottom-nav-item.active {
  background: linear-gradient(135deg,#6366f1,#8b5cf6);
  color: #ffffff;
  box-shadow: 0 6px 18px rgba(99,102,241,0.25);
}

.metric-card {
  background: #ffffff;
  border: 1px solid rgba(255,255,255,0.7);
  border-radius: 20px;
  padding: 18px 20px;
  box-shadow: 0 10px 25px -10px rgba(99,102,241,0.05), 0 1px 3px rgba(0,0,0,0.01);
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 16px;
  transition: all 0.2s ease;
}

.metric-card:hover {
  transform: translateY(-1px);
  box-shadow: 0 12px 28px -10px rgba(99,102,241,0.08);
}

.metric-icon-box {
  width: 44px;
  height: 44px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.metric-icon-box.green {
  background: #ecfdf5;
  color: #10b981;
}

.metric-icon-box.blue {
  background: #eff6ff;
  color: #3b82f6;
}

.metric-content {
  flex: 1;
}

.metric-label {
  font-size: 10px;
  font-weight: 800;
  color: #8b92a9;
  letter-spacing: 0.8px;
  text-transform: uppercase;
  margin-bottom: 4px;
}

.metric-value {
  font-size: 26px;
  font-weight: 900;
  color: #1e1b4b;
  letter-spacing: -0.5px;
  line-height: 1.1;
}

.metric-value span {
  font-size: 12px;
  color: #8b92a9;
  font-weight: 700;
  margin-left: 4px;
}

.metric-bar-container {
  width: 100%;
  height: 6px;
  background: #f1f5f9;
  border-radius: 3px;
  margin-top: 8px;
  overflow: hidden;
}

.metric-bar-fill {
  height: 100%;
  background: #3b82f6;
  border-radius: 3px;
  transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

.purple-hero-card {
  background: linear-gradient(135deg, #7c3aed 0%, #8b5cf6 100%);
  border-radius: 20px;
  padding: 22px 24px;
  color: #ffffff;
  margin-bottom: 12px;
  position: relative;
  overflow: hidden;
  box-shadow: 0 12px 30px rgba(124,58,237,0.22);
  display: flex;
  align-items: center;
  gap: 16px;
}

.purple-hero-icon {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: rgba(255,255,255,0.12);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.purple-hero-text {
  font-size: 15px;
  font-weight: 800;
  line-height: 1.4;
}

.search-container {
  position: relative;
  margin-bottom: 12px;
}

.search-input {
  width: 100%;
  padding: 12px 16px 12px 42px;
  background: rgba(255,255,255,0.9);
  border: 1px solid rgba(224,231,255,0.8);
  border-radius: 14px;
  font-family: inherit;
  font-size: 13px;
  font-weight: 600;
  color: #1e1b4b;
  outline: none;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(0,0,0,0.01);
}

.search-input:focus {
  border-color: #6366f1;
  background: #ffffff;
  box-shadow: 0 6px 16px -8px rgba(99,102,241,0.15);
}

.search-icon-box {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: #8b92a9;
  pointer-events: none;
  display: flex;
  align-items: center;
}

.p2p-offer-card {
  background: #ffffff;
  border: 1px solid rgba(224,231,255,0.8);
  border-radius: 20px;
  padding: 18px;
  margin-bottom: 12px;
  box-shadow: 0 4px 15px -4px rgba(99,102,241,0.04);
  transition: all 0.2s ease;
}

.p2p-offer-card:hover {
  transform: translateY(-1px);
  box-shadow: 0 8px 24px -6px rgba(99,102,241,0.08);
}

.p2p-user-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 14px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f8fafc;
}

.p2p-avatar-wrapper {
  position: relative;
  width: 42px;
  height: 42px;
}

.p2p-avatar {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  border: 2px solid #8b5cf6;
  background: #f8f6ff;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #8b5cf6;
  font-weight: 800;
  font-size: 18px;
  overflow: hidden;
}

.p2p-avatar-badge {
  position: absolute;
  top: -2px;
  right: -2px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #10b981;
  border: 2px solid #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
}

.p2p-avatar-badge svg {
  width: 9px;
  height: 9px;
  stroke: #ffffff;
  stroke-width: 4;
}

.p2p-user-details {
  flex: 1;
}

.p2p-user-name {
  font-size: 14px;
  font-weight: 800;
  color: #1e1b4b;
  display: flex;
  align-items: center;
  gap: 6px;
}

.p2p-user-rating {
  font-size: 11px;
  font-weight: 800;
  color: #10b981;
  display: flex;
  align-items: center;
  gap: 3px;
}

.p2p-user-stats {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 10px;
  color: #8b92a9;
  font-weight: 700;
  margin-top: 2px;
  text-transform: uppercase;
}

.p2p-stat-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.p2p-grid-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 14px;
}

.p2p-grid-col {
  display: flex;
  flex-direction: column;
}

.p2p-grid-label {
  font-size: 10px;
  font-weight: 800;
  color: #8b92a9;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  margin-bottom: 4px;
}

.p2p-grid-value {
  font-size: 20px;
  font-weight: 900;
  color: #1e1b4b;
  letter-spacing: -0.5px;
}

.p2p-grid-value.rate {
  color: #1e1b4b;
}

.p2p-grid-value.limits {
  font-size: 14px;
  font-weight: 800;
  color: #1e1b4b;
  margin-top: 3px;
}

.p2p-negotiate-btn {
  width: 100%;
  background: #8b5cf6;
  color: #ffffff;
  border: none;
  border-radius: 12px;
  padding: 10px;
  font-family: inherit;
  font-size: 13px;
  font-weight: 800;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  box-shadow: 0 4px 12px rgba(139,92,246,0.15);
}

.p2p-negotiate-btn:hover {
  background: #7c3aed;
  box-shadow: 0 6px 18px rgba(139,92,246,0.25);
  transform: translateY(-0.5px);
}

.security-chat-warning {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  background: #fef2f2;
  border: 1px solid #fee2e2;
  border-radius: 12px;
  padding: 10px 14px;
  margin-bottom: 16px;
  font-size: 11px;
  color: #991b1b;
  line-height: 1.5;
  font-weight: 600;
}

/* Spacer at the bottom to prevent content overlapping with the floating bottom-nav */
.content-nav-spacer {
  height: 84px;
  width: 100%;
  flex-shrink: 0;
}
`;
