// ── Destinos de Pagamento — logos reais via URL ───────────────────────────────
export const DESTS = [

  // ── CARTÕES INTERNACIONAIS ────────────────────────────────────────────────
  {
    id:    "visa_virtual",
    label: "Visa Virtual",
    color: "#0A2458",
    bg:    "#eef2ff",
    desc:  "Cartão Visa Virtual",
    hint:  "Número do cartão Visa virtual",
    logo:  "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Visa_Inc._logo.svg/320px-Visa_Inc._logo.svg.png",
    logoBg: "#0A2458",
    svg: `<svg width="100%" height="100%" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="40" height="40" rx="8" fill="#0A2458"/>
      <rect x="0.5" y="0.5" width="39" height="39" rx="7.5" stroke="rgba(255,255,255,0.08)" stroke-width="1" fill="none"/>
      <g transform="translate(9, 16) scale(1.0)">
        <path d="M 0 0 L 2.8 8 L 5.6 0 H 3.8 L 2.8 6 L 1.8 0 Z" fill="#ffffff"/>
        <path d="M 6.8 0 L 6.8 8 H 8.4 L 8.4 0 Z" fill="#ffffff"/>
        <path d="M 11.5 2 C 11.5 0.8 12.5 0.5 13.5 0.5 C 14.8 0.5 15.5 1 15.5 2 H 14 C 14 1.5 13.7 1.2 13.2 1.2 C 12.7 1.2 12.5 1.4 12.5 1.7 C 12.5 2.5 15.5 2.5 15.5 4.5 C 15.5 5.8 14.5 6.5 13.2 6.5 C 11.8 6.5 11 5.8 11 4.5 H 12.5 C 12.5 5 12.8 5.3 13.3 5.3 C 13.8 5.3 14 5 14 4.7 C 14 3.8 11.5 3.5 11.5 2 Z" fill="#ffffff"/>
        <path d="M 17 8 L 19 0 H 20.5 L 22.5 8 H 20.8 L 20.3 6 H 18.2 L 17.7 8 Z M 18.5 5 H 20 L 19.3 2 Z" fill="#ffffff"/>
      </g>
    </svg>`,
  },
  {
    id:    "mastercard",
    label: "Mastercard",
    color: "#EB001B",
    bg:    "#fff0f0",
    desc:  "Cartão Mastercard",
    hint:  "Número do cartão Mastercard",
    logo:  "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Mastercard-logo.svg/320px-Mastercard-logo.svg.png",
    logoBg: "#1A1F71",
    svg: `<svg width="100%" height="100%" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="40" height="40" rx="8" fill="#FFFFFF"/>
      <circle cx="15" cy="20" r="9.5" fill="#EB001B"/>
      <circle cx="25" cy="20" r="9.5" fill="#F79E1B"/>
      <path d="M 20 11.92 A 9.5 9.5 0 0 1 20 28.08 A 9.5 9.5 0 0 1 20 11.92 Z" fill="#FF5F00"/>
    </svg>`,
  },

  // ── CARTEIRAS DIGITAIS INTERNACIONAIS ─────────────────────────────────────
  {
    id:    "paypal",
    label: "PayPal",
    color: "#003087",
    bg:    "#eff6ff",
    desc:  "Carteira PayPal",
    hint:  "E-mail da conta PayPal",
    logo:  "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/PayPal.svg/320px-PayPal.svg.png",
    logoBg: "#003087",
    svg: `<svg width="100%" height="100%" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="40" height="40" rx="8" fill="#FFFFFF"/>
      <g transform="translate(10, 6)">
        <path d="M8.5 2C5.5 2 3.5 3.8 3.5 7L1.2 22C1.1 22.5 1.5 23 2 23H6L7.3 14H10C13 14 15 12 15.7 9C16.3 6 15 3.8 11.5 2.5C10.5 2.2 9.5 2 8.5 2Z" fill="#002C8A"/>
        <path d="M12.5 7C9.5 7 7.5 8.8 7.5 12L5.2 27C5.1 27.5 5.5 28 6 28H10L11.3 19H14C17 19 19 17 19.7 14C20.3 11 19 8.8 15.5 7.5C14.5 7.2 13.5 7 12.5 7Z" fill="#0079C1" opacity="0.95"/>
        <path d="M7.5 12L6.3 20H10.3C13.3 20 15.3 18 16 15C16.7 12 15.4 9.8 11.9 8.5C10.9 8.2 9.9 8 8.9 8C8.3 8 7.8 8.1 7.5 12Z" fill="#00457C" opacity="0.2"/>
      </g>
    </svg>`,
  },
  {
    id:    "wise",
    label: "Wise",
    color: "#00B9FF",
    bg:    "#f0fbff",
    desc:  "Transferência Wise",
    hint:  "E-mail ou número de conta Wise",
    logo:  "https://upload.wikimedia.org/wikipedia/commons/thumb/1/16/Wise_logo.svg/320px-Wise_logo.svg.png",
    logoBg: "#163300",
    svg: `<svg width="100%" height="100%" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="40" height="40" rx="8" fill="#9FE870"/>
      <path d="M11 11h16.5l-7.5 9 5.5 9h-4.5l-4.5-7.5-3.5 5.5-2-7 6.5-9z" fill="#1D2939"/>
    </svg>`,
  },
  {
    id:    "airtm",
    label: "Airtm",
    color: "#1E293B",
    bg:    "#F1F5F9",
    desc:  "Carteira digital Airtm",
    hint:  "E-mail da conta Airtm",
    logo:  "https://play-lh.googleusercontent.com/YKiMZ0ibGBjKHnVF9BJr-CjyHsVGa-zl0TJ4iuDhBRG5TgK1v3oLjPVAFrpF0wY8kw=w240-h480-rw",
    logoBg: "#FFFFFF",
    svg: `<svg width="100%" height="100%" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="40" height="40" rx="8" fill="#FFFFFF"/>
      <rect x="0.5" y="0.5" width="39" height="39" rx="7.5" stroke="#E2E8F0" stroke-width="1" fill="none"/>
      <path d="M 14 26 L 19 12 C 19.5 10.5, 20.5 10.5, 21 12 L 25.5 22 C 26 23.5, 24.5 25, 23.5 24.5 L 18 20.5 C 16.5 19.5, 16.5 18.5, 18 18.5 L 26 18.5" stroke="#111111" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
    </svg>`,
  },
  {
    id:    "redotpay",
    label: "RedotPay",
    color: "#FF334B",
    bg:    "#fff0f2",
    desc:  "Carteira digital RedotPay",
    hint:  "ID de utilizador RedotPay",
    logo:  "https://play-lh.googleusercontent.com/jSLtVLqp1JNr7iPOujdYJJTnqd7YFxwRF4gAYfXrX7MQJhqr0Mc_4RBSXI5ePqNEbw=w240-h480-rw",
    logoBg: "#111111",
    svg: `<svg width="100%" height="100%" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="40" height="40" rx="8" fill="#FFFFFF"/>
      <path d="M20 10c5.523 0 10 4.477 10 10s-4.477 10-10 10h-4v-4h4a6 6 0 1 0 0-12h-4v12h-4V10h8z" fill="#E51937" />
    </svg>`,
  },
  {
    id:    "binance",
    label: "Binance",
    color: "#F3BA2F",
    bg:    "#fffdf0",
    desc:  "Binance / Binance Pay",
    hint:  "Binance Pay ID ou Email da conta",
    logo:  "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e8/Binance_Logo.svg/320px-Binance_Logo.svg.png",
    logoBg: "#12161A",
    svg: `<svg width="100%" height="100%" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="40" height="40" rx="8" fill="#12161A"/>
      <path d="M20 8.5L14.7 13.8l1.8 1.8L20 12.1l3.5 3.5 1.8-1.8L20 8.5z" fill="#F3BA2F"/>
      <path d="M12.1 16.5l-1.8-1.8-5.3 5.3 5.3 5.3 1.8-1.8-3.5-3.5 3.5-3.5z" fill="#F3BA2F"/>
      <path d="M27.9 16.5l1.8-1.8 5.3 5.3-5.3 5.3-1.8-1.8 3.5-3.5-3.5-3.5z" fill="#F3BA2F"/>
      <path d="M20 31.5l5.3-5.3-1.8-1.8-3.5 3.5-3.5-3.5-1.8 1.8 5.3 5.3z" fill="#F3BA2F"/>
      <path d="M20 15.5L15.5 20l4.5 4.5 4.5-4.5-4.5-4.5z" fill="#F3BA2F"/>
    </svg>`,
  },

  // ── TRANSFERÊNCIAS BANCÁRIAS INTERNACIONAIS ───────────────────────────────
  {
    id:    "iban_eu",
    label: "IBAN Europeu",
    color: "#003399",
    bg:    "#eff6ff",
    desc:  "Transferência bancária SEPA",
    hint:  "IBAN europeu (ex: PT50, DE89, FR76...)",
    logo:  "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b7/Flag_of_Europe.svg/320px-Flag_of_Europe.svg.png",
    logoBg: "#003399",
    svg: `<svg width="100%" height="100%" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g clip-path="url(#eu-card-clip)">
        <rect width="40" height="40" fill="#003399"/>
        <defs>
          <clipPath id="eu-card-clip"><rect width="40" height="40" rx="8"/></clipPath>
          <g id="eu-star">
            <polygon points="0,-1.5 0.45,-0.45 1.5,-0.45 0.65,0.25 1,1.3 0,0.65 -1,1.3 -0.65,0.25 -1.5,-0.45 -0.45,-0.45" fill="#FFCC00"/>
          </g>
        </defs>
        <use href="#eu-star" x="20" y="10"/>
        <use href="#eu-star" x="25" y="11.34"/>
        <use href="#eu-star" x="28.66" y="15"/>
        <use href="#eu-star" x="30" y="20"/>
        <use href="#eu-star" x="28.66" y="25"/>
        <use href="#eu-star" x="25" y="28.66"/>
        <use href="#eu-star" x="20" y="30"/>
        <use href="#eu-star" x="15" y="28.66"/>
        <use href="#eu-star" x="11.34" y="25"/>
        <use href="#eu-star" x="10" y="20"/>
        <use href="#eu-star" x="11.34" y="15"/>
        <use href="#eu-star" x="15" y="11.34"/>
      </g>
      <rect x="0.5" y="0.5" width="39" height="39" rx="7.5" stroke="rgba(255, 255, 255, 0.08)" stroke-width="1" fill="none"/>
    </svg>`,
  },
  {
    id:    "iban_us",
    label: "IBAN Americano",
    color: "#B22234",
    bg:    "#fff0f0",
    desc:  "Transferência bancária EUA",
    hint:  "Routing + Account Number (EUA)",
    logo:  "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/Flag_of_the_United_States.svg/320px-Flag_of_the_United_States.svg.png",
    logoBg: "#B22234",
    svg: `<svg width="100%" height="100%" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g clip-path="url(#us-card-clip)">
        <rect width="40" height="40" fill="#FFFFFF"/>
        <rect x="0" y="0" width="40" height="3.08" fill="#B22234"/>
        <rect x="0" y="6.15" width="40" height="3.08" fill="#B22234"/>
        <rect x="0" y="12.31" width="40" height="3.08" fill="#B22234"/>
        <rect x="0" y="18.46" width="40" height="3.08" fill="#B22234"/>
        <rect x="0" y="24.62" width="40" height="3.08" fill="#B22234"/>
        <rect x="0" y="30.77" width="40" height="3.08" fill="#B22234"/>
        <rect x="0" y="36.92" width="40" height="3.08" fill="#B22234"/>
        <rect x="0" y="0" width="18" height="21.54" fill="#0A3161"/>
        <defs>
          <clipPath id="us-card-clip"><rect width="40" height="40" rx="8"/></clipPath>
          <g id="us-star">
            <polygon points="0,-0.8 0.24,-0.24 0.8,-0.24 0.35,0.1 0.52,0.66 0,0.3 -0.52,0.66 -0.35,0.1 -0.8,-0.24 -0.24,-0.24" fill="#FFFFFF"/>
          </g>
        </defs>
        <use href="#us-star" x="3" y="3.6"/>
        <use href="#us-star" x="6" y="3.6"/>
        <use href="#us-star" x="9" y="3.6"/>
        <use href="#us-star" x="12" y="3.6"/>
        <use href="#us-star" x="15" y="3.6"/>
        <use href="#us-star" x="4.5" y="7.2"/>
        <use href="#us-star" x="7.5" y="7.2"/>
        <use href="#us-star" x="10.5" y="7.2"/>
        <use href="#us-star" x="13.5" y="7.2"/>
        <use href="#us-star" x="3" y="10.8"/>
        <use href="#us-star" x="6" y="10.8"/>
        <use href="#us-star" x="9" y="10.8"/>
        <use href="#us-star" x="12" y="10.8"/>
        <use href="#us-star" x="15" y="10.8"/>
        <use href="#us-star" x="4.5" y="14.4"/>
        <use href="#us-star" x="7.5" y="14.4"/>
        <use href="#us-star" x="10.5" y="14.4"/>
        <use href="#us-star" x="13.5" y="14.4"/>
        <use href="#us-star" x="3" y="18.0"/>
        <use href="#us-star" x="6" y="18.0"/>
        <use href="#us-star" x="9" y="18.0"/>
        <use href="#us-star" x="12" y="18.0"/>
        <use href="#us-star" x="15" y="18.0"/>
      </g>
      <rect x="0.5" y="0.5" width="39" height="39" rx="7.5" stroke="rgba(255, 255, 255, 0.08)" stroke-width="1" fill="none"/>
    </svg>`,
  },

  // ── MB WAY (EUR — Portugal) ───────────────────────────────────────────────
  {
    id:    "mbway",
    label: "MB WAY",
    color: "#E8001C",
    bg:    "#fff0f2",
    desc:  "Transferência instantânea MB WAY",
    hint:  "Número de telemóvel associado ao MB WAY (+351...)",
    logo:  "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a6/MB_WAY_logo.png/320px-MB_WAY_logo.png",
    logoBg: "#E8001C",
    currencies: ["EUR"],
  },

  // ── PIX (BRL — Brasil) ────────────────────────────────────────────────────
  {
    id:    "pix",
    label: "Pix",
    color: "#00BDAE",
    bg:    "#f0fdfc",
    desc:  "Transferência instantânea Pix (Brasil)",
    hint:  "Chave Pix: CPF, email, telefone ou chave aleatória",
    logo:  "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Logo—pix_powered_by_Banco_Central_%28Brazil%2C_2020%29.svg/320px-Logo—pix_powered_by_Banco_Central_%28Brazil%2C_2020%29.svg.png",
    logoBg: "#00BDAE",
    currencies: ["BRL"],
  },

  // ── EFT Sul Africano (ZAR) ────────────────────────────────────────────────
  {
    id:    "eft_zar",
    label: "EFT — FNB / Capitec",
    color: "#007B40",
    bg:    "#f0fdf4",
    desc:  "Transferência bancária EFT (África do Sul)",
    hint:  "Número de conta bancária FNB, Capitec ou Standard Bank ZA",
    logo:  "https://upload.wikimedia.org/wikipedia/commons/thumb/3/38/Flag_of_South_Africa.svg/320px-Flag_of_South_Africa.svg.png",
    logoBg: "#007B40",
    currencies: ["ZAR"],
  },
];

// ── Definições de Moedas Suportadas ──────────────────────────────────────────
export const CURRENCIES = [
  {
    id:     "USD",
    label:  "Dólar Americano",
    symbol: "$",
    flag:   "🇺🇸",
    color:  "#1a3a6e",
    // destinos disponíveis para USD (todos os padrão)
    dests:  null, // null = mostrar todos
  },
  {
    id:     "EUR",
    label:  "Euro",
    symbol: "€",
    flag:   "🇪🇺",
    color:  "#003399",
    dests:  ["mbway", "iban_eu", "wise", "paypal", "binance", "visa_virtual", "mastercard"],
  },
  {
    id:     "BRL",
    label:  "Real Brasileiro",
    symbol: "R$",
    flag:   "🇧🇷",
    color:  "#009c3b",
    dests:  ["pix", "wise", "binance"],
  },
  {
    id:     "ZAR",
    label:  "Rand Sul-Africano",
    symbol: "R",
    flag:   "🇿🇦",
    color:  "#007B40",
    dests:  ["eft_zar", "wise", "binance"],
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
.dest-logo{width:36px;height:36px;flex-shrink:0;border-radius:10px;overflow:hidden;display:flex;align-items:center;justify-content:center;background:#f8fafc}
.dest-logo img{width:36px;height:36px;object-fit:contain;border-radius:10px}
.dest-logo svg{width:36px;height:36px}
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

/* --- AIRTM DESIGN SYSTEM RESPONSIVE LAYOUT (DESKTOP) --- */
.app-layout {
  display: flex;
  min-height: 100vh;
  width: 100vw;
  background: #f4f6f9;
}

.sidebar {
  width: 260px;
  background: #ffffff;
  border-right: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
  padding: 24px 16px;
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  z-index: 100;
}

.sidebar-logo {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 32px;
  padding-left: 8px;
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
}

.sidebar-link {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  color: #64748b;
  font-size: 14px;
  font-weight: 700;
  text-decoration: none;
  border-radius: 12px;
  background: none;
  border: none;
  width: 100%;
  cursor: pointer;
  text-align: left;
  transition: all 0.2s ease;
}

.sidebar-link:hover, .sidebar-link.active {
  color: #1e1b4b;
  background: #f1f5f9;
}

.sidebar-link.active {
  background: rgba(99,102,241,0.08);
  color: #6366f1;
}

.sidebar-footer {
  display: flex;
  flex-direction: column;
  gap: 8px;
  border-top: 1px solid #e2e8f0;
  padding-top: 16px;
}

.desktop-content {
  flex: 1;
  margin-left: 260px;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.desktop-topbar {
  height: 70px;
  background: #ffffff;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 32px;
  position: sticky;
  top: 0;
  z-index: 99;
}

.topbar-title {
  font-size: 20px;
  font-weight: 900;
  color: #1e1b4b;
  letter-spacing: -0.5px;
}

.topbar-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.notification-bell {
  position: relative;
  background: none;
  border: none;
  color: #64748b;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.notification-bell:hover {
  background: #f1f5f9;
  color: #1e1b4b;
}

.bell-badge {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 8px;
  height: 8px;
  background: #ef4444;
  border-radius: 50%;
  border: 1.5px solid #ffffff;
}

.user-avatar-btn {
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 4px 8px;
  border-radius: 20px;
  transition: all 0.2s;
}

.user-avatar-btn:hover {
  background: #f1f5f9;
}

.user-avatar-circle {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  overflow: hidden;
  background: linear-gradient(135deg,#6366f1,#8b5cf6);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 14px;
}

.user-info-text {
  display: flex;
  flex-direction: column;
  text-align: left;
}

.user-name-label {
  font-size: 13px;
  font-weight: 800;
  color: #1e1b4b;
  line-height: 1.2;
}

.user-email-label {
  font-size: 10.5px;
  color: #64748b;
  font-weight: 600;
}

/* Settings/Configurações Tabs System */
.settings-tabs-container {
  display: flex;
  border-bottom: 1.5px solid #e2e8f0;
  margin-bottom: 24px;
  overflow-x: auto;
  gap: 8px;
}

.settings-tab-btn {
  padding: 12px 18px;
  border: none;
  background: none;
  font-family: inherit;
  font-size: 12px;
  font-weight: 800;
  color: #64748b;
  cursor: pointer;
  border-bottom: 3px solid transparent;
  transition: all 0.2s;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  white-space: nowrap;
}

.settings-tab-btn:hover {
  color: #1e1b4b;
}

.settings-tab-btn.active {
  color: #6366f1;
  border-bottom-color: #6366f1;
}

.settings-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;
}

@media (min-width: 1024px) {
  .settings-grid {
    grid-template-columns: 2fr 1fr;
  }
}
`;
