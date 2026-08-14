// â”€â”€ Destinos de Pagamento â€” logos reais via URL â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export const DESTS = [

  // â”€â”€ CARTÃ•ES INTERNACIONAIS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  {
    id:    "visa_virtual",
    label: "Visa Virtual",
    color: "#0A2458",
    bg:    "#eef2ff",
    desc:  "CartÃ£o Visa Virtual",
    hint:  "NÃºmero do cartÃ£o Visa virtual",
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
    desc:  "CartÃ£o Mastercard",
    hint:  "NÃºmero do cartÃ£o Mastercard",
    logo:  "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Mastercard-logo.svg/320px-Mastercard-logo.svg.png",
    logoBg: "#1A1F71",
    svg: `<svg width="100%" height="100%" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="40" height="40" rx="8" fill="#FFFFFF"/>
      <circle cx="15" cy="20" r="9.5" fill="#EB001B"/>
      <circle cx="25" cy="20" r="9.5" fill="#F79E1B"/>
      <path d="M 20 11.92 A 9.5 9.5 0 0 1 20 28.08 A 9.5 9.5 0 0 1 20 11.92 Z" fill="#FF5F00"/>
    </svg>`,
  },

  // â”€â”€ CARTEIRAS DIGITAIS INTERNACIONAIS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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
    desc:  "TransferÃªncia Wise",
    hint:  "E-mail ou nÃºmero de conta Wise",
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

  // â”€â”€ TRANSFERÃŠNCIAS BANCÃRIAS INTERNACIONAIS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  {
    id:    "iban_eu",
    label: "IBAN Europeu",
    color: "#003399",
    bg:    "#eff6ff",
    desc:  "TransferÃªncia bancÃ¡ria SEPA",
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
    desc:  "TransferÃªncia bancÃ¡ria EUA",
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

  // â”€â”€ MB WAY (EUR â€” Portugal) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  {
    id:    "mbway",
    label: "MB WAY",
    color: "#E8001C",
    bg:    "#fff0f2",
    desc:  "TransferÃªncia instantÃ¢nea MB WAY",
    hint:  "NÃºmero de telemÃ³vel associado ao MB WAY (+351...)",
    logo:  "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a6/MB_WAY_logo.png/320px-MB_WAY_logo.png",
    logoBg: "#E8001C",
    currencies: ["EUR"],
  },

  // â”€â”€ PIX (BRL â€” Brasil) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  {
    id:    "pix",
    label: "Pix",
    color: "#00BDAE",
    bg:    "#f0fdfc",
    desc:  "TransferÃªncia instantÃ¢nea Pix (Brasil)",
    hint:  "Chave Pix: CPF, email, telefone ou chave aleatÃ³ria",
    logo:  "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Logoâ€”pix_powered_by_Banco_Central_%28Brazil%2C_2020%29.svg/320px-Logoâ€”pix_powered_by_Banco_Central_%28Brazil%2C_2020%29.svg.png",
    logoBg: "#00BDAE",
    currencies: ["BRL"],
  },

  // â”€â”€ EFT Sul Africano (ZAR) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  {
    id:    "eft_zar",
    label: "EFT â€” FNB / Capitec",
    color: "#007B40",
    bg:    "#f0fdf4",
    desc:  "TransferÃªncia bancÃ¡ria EFT (Ãfrica do Sul)",
    hint:  "NÃºmero de conta bancÃ¡ria FNB, Capitec ou Standard Bank ZA",
    logo:  "https://upload.wikimedia.org/wikipedia/commons/thumb/3/38/Flag_of_South_Africa.svg/320px-Flag_of_South_Africa.svg.png",
    logoBg: "#007B40",
    currencies: ["ZAR"],
  },
];

// â”€â”€ DefiniÃ§Ãµes de Moedas Suportadas â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export const CURRENCIES = [
  {
    id:     "USD",
    label:  "DÃ³lar Americano",
    desc:   "Carteiras, cartÃµes e Binance",
    symbol: "$",
    flag:   "ðŸ‡ºðŸ‡¸",
    color:  "#1a3a6e",
    // destinos disponÃ­veis para USD (todos os padrÃ£o)
    dests:  null, // null = mostrar todos
  },
  {
    id:     "EUR",
    label:  "Euro",
    desc:   "MB WAY, IBAN SEPA, Wise, PayPal",
    symbol: "â‚¬",
    flag:   "ðŸ‡ªðŸ‡º",
    color:  "#003399",
    dests:  ["mbway", "iban_eu", "wise", "paypal", "binance", "visa_virtual", "mastercard"],
  },
  {
    id:     "BRL",
    label:  "Real Brasileiro",
    desc:   "Pix, Wise, Binance",
    symbol: "R$",
    flag:   "ðŸ‡§ðŸ‡·",
    color:  "#009c3b",
    dests:  ["pix", "wise", "binance"],
  },
  {
    id:     "ZAR",
    label:  "Rand Sul-Africano",
    desc:   "EFT (FNB, Capitec), Wise, Binance",
    symbol: "R",
    flag:   "ðŸ‡¿ðŸ‡¦",
    color:  "#007B40",
    dests:  ["eft_zar", "wise", "binance"],
  },
];

// â”€â”€ Estados dos pedidos â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export const STATUS_META = {
  awaiting_kyc:     { label: "KYC Pendente",   color: "#7c3aed", bg: "#f5f3ff", icon: "lock" },
  awaiting_payment: { label: "Aguarda Pagto.",  color: "#d97706", bg: "#fffbeb", icon: "clock" },
  payment_received: { label: "Pago",            color: "#2563eb", bg: "#eff6ff", icon: "file" },
  processing:       { label: "A processar",     color: "#d97706", bg: "#fffbeb", icon: "loader" },
  completed:        { label: "Enviado",         color: "#16a34a", bg: "#f0fdf4", icon: "checkCircle" },
  cancelled:        { label: "Cancelado",        color: "#6b7280", bg: "#f9fafb", icon: "ban" },
  failed:           { label: "Falhou",           color: "#dc2626", bg: "#fef2f2", icon: "alertTriangle" },
};

// â”€â”€ CSS global â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Plus Jakarta Sans',sans-serif;background:#EEEEF8;color:#0E0C1E;-webkit-font-smoothing:antialiased}

/* â”€â”€â”€ ANIMAÃ‡Ã•ES â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
@keyframes slideUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
@keyframes shimmer{0%{background-position:-200% center}100%{background-position:200% center}}
@keyframes pulse-live{0%,100%{box-shadow:0 0 0 0 rgba(0,200,150,.55)}70%{box-shadow:0 0 0 7px rgba(0,200,150,0)}}
@keyframes lp{0%,100%{box-shadow:0 0 0 0 rgba(16,185,129,.55)}60%{box-shadow:0 0 0 6px rgba(16,185,129,0)}}
@keyframes spin{100%{transform:rotate(360deg)}}
@keyframes pop{from{transform:scale(0);opacity:0}to{transform:scale(1);opacity:1}}
@keyframes tIn{from{opacity:0;transform:translateX(-50%) translateY(12px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}
@keyframes aIn{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}
@keyframes glow-pulse{0%,100%{box-shadow:0 0 0 0 rgba(91,110,245,0)}50%{box-shadow:0 0 0 4px rgba(91,110,245,.12)}}

/* â”€â”€â”€ AUTH SPLIT SCREEN â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
.auth-split{display:flex;min-height:100vh;width:100%;background:#F0F1FA}
.auth-left{display:none;flex-direction:column;justify-content:center;padding:60px 52px;background:linear-gradient(160deg,#0F0D1A 0%,#1a1040 60%,#251660 100%);position:relative;overflow:hidden;flex-shrink:0}
@media(min-width:768px){.auth-left{display:flex;width:42%}}
.auth-left-blob1{position:absolute;width:320px;height:320px;border-radius:50%;background:radial-gradient(circle,rgba(99,102,241,.22) 0%,transparent 70%);top:-80px;left:-80px;pointer-events:none}
.auth-left-blob2{position:absolute;width:260px;height:260px;border-radius:50%;background:radial-gradient(circle,rgba(139,92,246,.18) 0%,transparent 70%);bottom:-60px;right:-60px;pointer-events:none}
.auth-left-logo{font-size:36px;font-weight:900;color:#ffffff;letter-spacing:-1.5px;margin-bottom:10px}
.auth-left-tag{font-size:16px;color:rgba(255,255,255,.65);font-weight:500;line-height:1.6;margin-bottom:40px;max-width:320px}
.auth-left-bullets{display:flex;flex-direction:column;gap:16px}
.auth-left-bullet{display:flex;align-items:center;gap:14px;color:rgba(255,255,255,.85);font-size:14px;font-weight:600}
.auth-left-bullet-icon{width:36px;height:36px;border-radius:10px;background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.1);display:flex;align-items:center;justify-content:center;flex-shrink:0}
.auth-right{flex:1;display:flex;align-items:center;justify-content:center;padding:24px}
.auth-card{background:#ffffff;border-radius:24px;padding:36px 32px;width:100%;max-width:420px;box-shadow:0 24px 64px rgba(14,12,30,.10),0 4px 16px rgba(14,12,30,.06);animation:slideUp .35s ease}
.auth-tabs{display:flex;gap:0;border-bottom:2px solid #E5E7EB;margin-bottom:28px}
.auth-tab-btn{flex:1;padding:0 0 14px;border:none;background:none;font-family:inherit;font-size:15px;font-weight:700;color:#9CA3AF;cursor:pointer;transition:color .2s;position:relative;text-align:left}
.auth-tab-btn.active{color:#0E0C1E}
.auth-tab-btn.active::after{content:'';position:absolute;bottom:-2px;left:0;right:0;height:2px;background:#5B6EF5;border-radius:2px}
.auth-label{font-size:11px;font-weight:800;color:#6B7389;text-transform:uppercase;letter-spacing:.7px;margin-bottom:6px;display:block}
.auth-input-wrap{position:relative;margin-bottom:14px}
.auth-input-icon{position:absolute;left:14px;top:50%;transform:translateY(-50%);color:#9CA3AF;pointer-events:none;display:flex;align-items:center}
.auth-inp{width:100%;padding:12px 14px 12px 42px;background:#F7F8FF;border:1.5px solid #E5E7EB;border-radius:12px;font-family:inherit;font-size:14px;font-weight:600;color:#0E0C1E;outline:none;transition:all .2s}
.auth-inp:focus{border-color:#5B6EF5;background:#fff;box-shadow:0 0 0 3px rgba(91,110,245,.08)}
.auth-inp::placeholder{color:#C4C4D0;font-weight:500}
.auth-forgot{text-align:right;margin-bottom:16px}
.auth-forgot-btn{background:none;border:none;color:#5B6EF5;font-size:12px;font-weight:700;cursor:pointer;font-family:inherit;padding:0}
.auth-btn-primary{width:100%;padding:14px;border:none;border-radius:12px;cursor:pointer;font-family:inherit;font-size:14px;font-weight:800;color:#fff;background:linear-gradient(135deg,#5B6EF5 0%,#8B5CF6 100%);background-size:200% auto;transition:all .25s;display:flex;align-items:center;justify-content:center;gap:8px;box-shadow:0 6px 20px rgba(91,110,245,.30)}
.auth-btn-primary:hover{background-position:right center;box-shadow:0 10px 28px rgba(91,110,245,.40);transform:translateY(-1px)}
.auth-btn-primary:disabled{opacity:.6;transform:none;cursor:not-allowed;box-shadow:none}
.auth-divider{display:flex;align-items:center;margin:20px 0;gap:12px;color:#9CA3AF;font-size:11px;font-weight:700;letter-spacing:.5px}
.auth-divider::before,.auth-divider::after{content:'';flex:1;height:1px;background:#E5E7EB}
.auth-social-btn{display:flex;align-items:center;justify-content:center;gap:10px;width:100%;padding:12px;border:1.5px solid #E5E7EB;border-radius:12px;background:#fff;cursor:pointer;transition:all .2s;font-family:inherit;font-size:13px;font-weight:700;color:#0E0C1E}
.auth-social-btn:hover{background:#F7F8FF;border-color:#C7D2FE}
.auth-error{display:flex;align-items:center;gap:8px;background:#FEF2F2;border:1px solid #FECACA;border-radius:10px;padding:10px 12px;font-size:12px;font-weight:600;margin-bottom:14px;color:#B91C1C;animation:slideUp .2s ease}
.auth-error.ok{background:#F0FDF4;border-color:#BBF7D0;color:#16A34A}
.auth-error.load{background:#F0F4FF;border-color:#C7D2FE;color:#4F46E5}

/* â”€â”€â”€ MOBILE SHELL â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
.shell{font-family:'Plus Jakarta Sans',sans-serif;background:#F0F1FA;width:100%;max-width:420px;margin:0 auto;min-height:100vh;position:relative;display:flex;flex-direction:column;overflow:hidden}
@media(min-width:480px){.shell{margin:32px auto;max-height:none;border-radius:28px;box-shadow:0 24px 60px rgba(14,12,30,.14);border:1px solid rgba(255,255,255,.7)}}
.blob{position:absolute;border-radius:50%;filter:blur(60px);pointer-events:none;z-index:0}
.b1{width:260px;height:260px;background:radial-gradient(circle,rgba(91,110,245,.3) 0%,transparent 70%);top:-80px;right:-60px}
.b2{width:220px;height:220px;background:radial-gradient(circle,rgba(139,92,246,.22) 0%,transparent 70%);bottom:-60px;left:-60px}

/* â”€â”€â”€ MOBILE TOP HEADER â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
.mobile-top-header{display:flex;align-items:center;justify-content:space-between;padding:20px 20px 12px;background:transparent;position:relative;z-index:10}
.mobile-brand{font-size:22px;font-weight:900;color:#0E0C1E;letter-spacing:-0.8px}
.mobile-header-right{display:flex;align-items:center;gap:8px}
.mobile-notif-btn{width:38px;height:38px;border-radius:50%;background:rgba(255,255,255,.85);border:1.5px solid rgba(91,110,245,.1);display:flex;align-items:center;justify-content:center;cursor:pointer;color:#6B7389;transition:all .2s;box-shadow:0 2px 8px rgba(0,0,0,.05)}
.mobile-notif-btn:hover{background:#fff;border-color:#5B6EF5;color:#5B6EF5}

/* â”€â”€â”€ CREDITS HERO CARD â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
.credits-hero-card{margin:0 16px 16px;border-radius:20px;padding:22px 24px;background:linear-gradient(135deg,#1a0533 0%,#2d1065 55%,#4c1d95 100%);color:#fff;position:relative;overflow:hidden;box-shadow:0 12px 36px rgba(76,29,149,.35)}
.credits-hero-card::before{content:'';position:absolute;top:-40px;right:-40px;width:160px;height:160px;border-radius:50%;background:rgba(255,255,255,.04);pointer-events:none}
.credits-hero-card::after{content:'';position:absolute;bottom:-60px;left:-30px;width:200px;height:200px;border-radius:50%;background:rgba(99,102,241,.07);pointer-events:none}
.credits-hero-label{font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:1px;color:rgba(255,255,255,.55);margin-bottom:6px}
.credits-hero-amount{font-size:36px;font-weight:900;letter-spacing:-1.5px;line-height:1;margin-bottom:4px}
.credits-hero-sub{font-size:12px;color:rgba(255,255,255,.5);font-weight:600;margin-bottom:16px}
.live-badge{display:inline-flex;align-items:center;gap:5px;background:rgba(0,200,150,.15);border:1px solid rgba(0,200,150,.3);border-radius:20px;padding:4px 10px;font-size:10px;font-weight:800;color:#00C896;position:absolute;top:18px;right:18px}
.live-dot-green{width:6px;height:6px;border-radius:50%;background:#00C896;animation:pulse-live 2s infinite}
.credits-add-btn{display:inline-flex;align-items:center;gap:6px;padding:10px 18px;background:rgba(255,255,255,.15);border:1.5px solid rgba(255,255,255,.2);border-radius:12px;color:#fff;font-family:inherit;font-size:13px;font-weight:700;cursor:pointer;transition:all .2s;backdrop-filter:blur(8px)}
.credits-add-btn:hover{background:rgba(255,255,255,.22);transform:translateY(-1px)}

/* â”€â”€â”€ METRIC CARDS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
.metric-card{background:#ffffff;border:1px solid rgba(91,110,245,.08);border-radius:18px;padding:16px 18px;box-shadow:0 4px 16px rgba(14,12,30,.04);display:flex;align-items:center;gap:14px;transition:all .2s}
.metric-card:hover{transform:translateY(-1px);box-shadow:0 8px 24px rgba(14,12,30,.07)}
.metric-icon-box{width:42px;height:42px;border-radius:13px;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.metric-icon-box.green{background:#ECFDF5;color:#10B981}
.metric-icon-box.blue{background:#EFF6FF;color:#3B82F6}
.metric-icon-box.purple{background:#F5F3FF;color:#7C3AED}
.metric-content{flex:1;min-width:0}
.metric-label{font-size:10px;font-weight:800;color:#6B7389;letter-spacing:.6px;text-transform:uppercase;margin-bottom:4px}
.metric-value{font-size:20px;font-weight:900;color:#0E0C1E;letter-spacing:-.5px;line-height:1.1}
.metric-value span{font-size:11px;color:#6B7389;font-weight:700;margin-left:4px}
.metric-trend{display:inline-flex;align-items:center;gap:3px;font-size:10.5px;font-weight:800;color:#10B981;margin-top:3px}
.metric-bar-container{width:100%;height:5px;background:#F1F5F9;border-radius:3px;margin-top:8px;overflow:hidden}
.metric-bar-fill{height:100%;background:linear-gradient(90deg,#5B6EF5,#8B5CF6);border-radius:3px;transition:width .6s cubic-bezier(.4,0,.2,1)}

/* â”€â”€â”€ P2P OFFER CARDS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
.p2p-section-title{font-size:15px;font-weight:900;color:#0E0C1E;letter-spacing:-.3px;margin-bottom:12px}
.p2p-offer-card{background:#ffffff;border-radius:16px;padding:14px 16px;margin-bottom:10px;display:flex;align-items:center;gap:14px;box-shadow:0 2px 12px rgba(14,12,30,.04);border:1.5px solid transparent;transition:all .2s;cursor:pointer;position:relative;overflow:hidden;border-left-width:4px;border-left-style:solid}
.p2p-offer-card:hover{transform:translateY(-1px);box-shadow:0 8px 24px rgba(14,12,30,.08)}
.p2p-offer-card.currency-USD{border-left-color:#5B6EF5}
.p2p-offer-card.currency-EUR{border-left-color:#F59E0B}
.p2p-offer-card.currency-BRL{border-left-color:#10B981}
.p2p-offer-card.currency-ZAR{border-left-color:#EF4444}
.p2p-offer-card.currency-DEFAULT{border-left-color:#8B5CF6}
.p2p-avatar-wrapper{position:relative;flex-shrink:0}
.p2p-avatar{width:44px;height:44px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:16px;color:#fff;overflow:hidden;flex-shrink:0}
.p2p-avatar-badge{position:absolute;top:-2px;right:-2px;width:16px;height:16px;border-radius:50%;background:#10B981;border:2px solid #fff;display:flex;align-items:center;justify-content:center}
.p2p-avatar-badge svg{width:8px;height:8px;stroke:#fff;stroke-width:4}
.p2p-card-info{flex:1;min-width:0}
.p2p-user-name{font-size:14px;font-weight:800;color:#0E0C1E;display:flex;align-items:center;gap:6px;margin-bottom:3px}
.p2p-verified-badge{font-size:10px;font-weight:700;color:#10B981}
.p2p-card-meta{font-size:12px;color:#6B7389;font-weight:600;display:flex;align-items:center;gap:6px}
.p2p-currency-chip{display:inline-flex;align-items:center;gap:3px;background:#F3F4FF;color:#5B6EF5;font-size:10.5px;font-weight:800;padding:2px 7px;border-radius:8px}
.p2p-currency-chip.EUR{background:#FFFBEB;color:#D97706}
.p2p-currency-chip.BRL{background:#ECFDF5;color:#059669}
.p2p-currency-chip.ZAR{background:#FEF2F2;color:#DC2626}
.p2p-negotiate-btn{display:inline-flex;align-items:center;gap:5px;padding:9px 16px;background:linear-gradient(135deg,#5B6EF5,#8B5CF6);color:#fff;border:none;border-radius:12px;font-family:inherit;font-size:12px;font-weight:800;cursor:pointer;white-space:nowrap;transition:all .2s;box-shadow:0 4px 14px rgba(91,110,245,.25);flex-shrink:0}
.p2p-negotiate-btn:hover{box-shadow:0 8px 20px rgba(91,110,245,.35);transform:translateY(-1px)}
.p2p-negotiate-arrow{display:inline-flex;align-items:center;justify-content:center;width:32px;height:32px;border-radius:50%;background:rgba(91,110,245,.08);color:#5B6EF5;flex-shrink:0;transition:all .2s}
.p2p-offer-card:hover .p2p-negotiate-arrow{background:#5B6EF5;color:#fff}

/* â”€â”€â”€ P2P CARD user row (old compat kept for non-market view) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
.p2p-user-row{display:flex;align-items:center;gap:12px;margin-bottom:14px;padding-bottom:12px;border-bottom:1px solid #F8FAFC}
.p2p-user-details{flex:1}
.p2p-user-rating{font-size:11px;font-weight:800;color:#10B981}
.p2p-user-stats{display:flex;align-items:center;gap:10px;font-size:10px;color:#6B7389;font-weight:700;margin-top:2px;text-transform:uppercase}
.p2p-stat-item{display:flex;align-items:center;gap:4px}
.p2p-grid-row{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:14px}
.p2p-grid-col{display:flex;flex-direction:column}
.p2p-grid-label{font-size:10px;font-weight:800;color:#6B7389;letter-spacing:.5px;text-transform:uppercase;margin-bottom:4px}
.p2p-grid-value{font-size:20px;font-weight:900;color:#0E0C1E;letter-spacing:-.5px}
.p2p-grid-value.rate{color:#0E0C1E}
.p2p-grid-value.limits{font-size:14px;font-weight:800;color:#0E0C1E;margin-top:3px}

/* â”€â”€â”€ CALCULATOR â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
.calc-currency-tabs{display:flex;gap:8px;margin-bottom:20px;flex-wrap:wrap}
.calc-currency-tab{padding:7px 18px;border-radius:20px;border:1.5px solid #E5E7EB;background:#fff;font-family:inherit;font-size:13px;font-weight:700;color:#6B7389;cursor:pointer;transition:all .2s}
.calc-currency-tab.active{background:#5B6EF5;border-color:#5B6EF5;color:#fff;box-shadow:0 4px 14px rgba(91,110,245,.25)}
.calc-send-card{background:#0E0C1E;border-radius:16px;padding:18px 20px;margin-bottom:4px}
.calc-send-label{font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:.8px;color:rgba(255,255,255,.45);margin-bottom:8px}
.calc-send-amount{width:100%;border:none;background:none;font-family:inherit;font-size:32px;font-weight:900;color:#ffffff;outline:none;letter-spacing:-1px}
.calc-send-amount::placeholder{color:rgba(255,255,255,.25)}
.calc-send-suffix{font-size:14px;font-weight:700;color:rgba(255,255,255,.4);margin-top:4px}
.calc-arrow-row{display:flex;align-items:center;justify-content:center;margin:4px 0;position:relative;z-index:2}
.calc-arrow-btn{width:40px;height:40px;border-radius:50%;background:#5B6EF5;border:none;display:flex;align-items:center;justify-content:center;cursor:pointer;box-shadow:0 4px 14px rgba(91,110,245,.30);transition:all .25s;color:#fff}
.calc-arrow-btn:hover{transform:scale(1.08) rotate(180deg);box-shadow:0 6px 18px rgba(91,110,245,.40)}
.calc-recv-card{background:#F3F4FF;border-radius:16px;padding:18px 20px;margin-bottom:20px;border:1.5px solid rgba(91,110,245,.1)}
.calc-recv-label{font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:.8px;color:#8B92A9;margin-bottom:8px}
.calc-recv-amount{font-size:32px;font-weight:900;color:#0E0C1E;letter-spacing:-1px}
.calc-recv-suffix{font-size:14px;font-weight:700;color:#6B7389;margin-left:6px}
.calc-margin-label{font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:.7px;color:#6B7389;margin-bottom:8px}
.calc-margin-tabs{display:flex;gap:8px;margin-bottom:20px}
.calc-margin-tab{flex:1;padding:10px;border:1.5px solid #E5E7EB;border-radius:12px;background:#fff;font-family:inherit;font-size:13px;font-weight:700;color:#6B7389;cursor:pointer;transition:all .2s}
.calc-margin-tab.active{background:#5B6EF5;border-color:#5B6EF5;color:#fff;box-shadow:0 4px 12px rgba(91,110,245,.22)}
.calc-dest-label{font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:.7px;color:#6B7389;margin-bottom:10px}
.calc-dest-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:20px}
.calc-dest-card{border:1.5px solid #E5E7EB;border-radius:14px;padding:14px 8px 10px;cursor:pointer;transition:all .2s;background:#fff;display:flex;flex-direction:column;align-items:center;gap:8px;text-align:center}
.calc-dest-card:hover{border-color:#C7D2FE;transform:translateY(-1px);box-shadow:0 4px 12px rgba(91,110,245,.06)}
.calc-dest-card.sel{border-color:#5B6EF5;border-width:2px;background:#F3F4FF}
.calc-dest-icon{width:44px;height:44px;border-radius:14px;overflow:hidden;display:flex;align-items:center;justify-content:center}
.calc-dest-icon svg,.calc-dest-icon img{width:100%;height:100%;object-fit:contain}
.calc-dest-name{font-size:11px;font-weight:800;color:#0E0C1E;line-height:1.3}
.calc-account-wrap{margin-bottom:16px}
.calc-title{font-size:18px;font-weight:900;color:#0E0C1E;letter-spacing:-.4px;margin-bottom:18px}

/* â”€â”€â”€ CARDS & GENERICS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
.card{background:rgba(255,255,255,.85);backdrop-filter:blur(20px);border:1px solid rgba(255,255,255,.75);border-radius:20px;padding:16px 18px;box-shadow:0 8px 24px rgba(14,12,30,.05);margin-bottom:12px}
.hero{background:linear-gradient(135deg,#3730A3 0%,#5B6EF5 50%,#7C3AED 100%);border-radius:20px;padding:18px 20px;box-shadow:0 12px 32px rgba(91,110,245,.28);margin-bottom:12px;color:#fff;position:relative;overflow:hidden}

/* OLD calc compat */
.calc-box{background:rgba(247,246,255,.65);border:1.5px solid #E0E7FF;border-radius:16px;padding:12px 14px;transition:all .2s;cursor:text}
.calc-box.active{border-color:#5B6EF5;background:#fff;box-shadow:0 6px 16px rgba(91,110,245,.10)}
.calc-flag{font-size:9.5px;font-weight:800;color:#6b7280;letter-spacing:.5px;text-transform:uppercase;margin-bottom:6px;display:flex;align-items:center;gap:5px}
.calc-num{width:100%;border:none;background:none;font-family:inherit;font-size:28px;font-weight:900;color:#0E0C1E;outline:none;letter-spacing:-1px}
.calc-num::placeholder{color:#d1d5db}
.calc-hint{font-size:10px;color:#9ca3af;margin-top:3px;font-weight:600}
.swap-row{display:flex;align-items:center;gap:6px;margin:4px 0;position:relative;z-index:2}
.swap-line{flex:1;height:1.5px;background:linear-gradient(90deg,transparent,#E0E7FF,transparent)}
.swap-btn{width:36px;height:36px;border-radius:50%;background:#fff;border:1.5px solid #E0E7FF;display:flex;align-items:center;justify-content:center;cursor:pointer;box-shadow:0 3px 8px rgba(91,110,245,.08);transition:all .25s;flex-shrink:0}
.swap-btn:hover{border-color:#5B6EF5;box-shadow:0 4px 12px rgba(91,110,245,.15);transform:scale(1.05)}
.rate-note{display:flex;justify-content:space-between;align-items:center;padding:8px 12px;background:rgba(247,246,255,.4);border-radius:12px;margin-top:10px;border:1px solid rgba(224,231,255,.3)}
.rate-val{display:inline-flex;align-items:center;gap:4px;background:#f0fdf4;border:1px solid #bbf7d0;color:#16a34a;font-size:10.5px;font-weight:800;padding:3px 8px;border-radius:20px}

.dest-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:10px 0}
.dest-card{border:1.5px solid rgba(229,231,235,.8);border-radius:14px;padding:10px;cursor:pointer;transition:all .2s;background:rgba(255,255,255,.7);display:flex;align-items:center;gap:8px;position:relative}
.dest-card:hover{border-color:#c7d2fe;transform:translateY(-1px)}
.dest-card.sel{border-width:2px;border-color:#5B6EF5;box-shadow:0 6px 16px rgba(91,110,245,.12)}
.dest-logo{width:36px;height:36px;flex-shrink:0;border-radius:10px;overflow:hidden;display:flex;align-items:center;justify-content:center;background:#f8fafc}
.dest-logo img{width:36px;height:36px;object-fit:contain;border-radius:10px}
.dest-logo svg{width:36px;height:36px}
.d-name{font-size:12px;font-weight:800;color:#0E0C1E}
.d-desc{font-size:9px;color:#9ca3af;font-weight:600;margin-top:1px}

/* â”€â”€â”€ INPUTS & BUTTONS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
.lbl{font-size:9.5px;font-weight:800;color:#6B7389;text-transform:uppercase;letter-spacing:.5px;margin-bottom:4px;display:block}
.inp{width:100%;padding:11px 14px;background:#F7F8FF;border:1.5px solid #E5E7EB;border-radius:12px;font-family:inherit;font-size:13px;font-weight:600;color:#0E0C1E;outline:none;transition:all .2s}
.inp:focus{border-color:#5B6EF5;background:#fff;box-shadow:0 0 0 3px rgba(91,110,245,.08)}
.inp::placeholder{color:#C4C4D0;font-weight:500}

.btn{width:100%;padding:13px;border:none;border-radius:14px;cursor:pointer;font-family:inherit;font-size:13px;font-weight:800;transition:all .25s;display:flex;align-items:center;justify-content:center;gap:6px}
.btn-p{background:linear-gradient(135deg,#5B6EF5,#8B5CF6);background-size:200% auto;color:#fff;box-shadow:0 6px 20px rgba(91,110,245,.28)}
.btn-p:hover{background-position:right center;box-shadow:0 10px 26px rgba(91,110,245,.38);transform:translateY(-1px)}
.btn-p:disabled{opacity:.55;transform:none;cursor:not-allowed;box-shadow:none}
.btn-o{background:rgba(255,255,255,.85);border:1.5px solid #E5E7EB;color:#5B6EF5;margin-top:8px}
.btn-o:hover{border-color:#5B6EF5;background:#F3F4FF}
.btn-g{background:none;border:none;font-family:inherit;font-size:11px;font-weight:800;color:#9ca3af;cursor:pointer;padding:4px 6px;transition:color .2s}
.btn-g:hover{color:#5B6EF5}

.upload-zone{border:2px dashed #C7D2FE;border-radius:16px;padding:24px 16px;text-align:center;cursor:pointer;transition:all .2s;background:rgba(247,246,255,.5)}
.upload-zone:hover{border-color:#5B6EF5;background:#EEF2FF}
.upload-zone.has-file{border-color:#10b981;border-style:solid;background:#F0FDF4}
.up-icon{margin-bottom:8px;color:#5B6EF5;display:flex;justify-content:center}
.up-title{font-size:13px;font-weight:800;color:#0E0C1E;margin-bottom:3px}
.up-sub{font-size:10px;color:#9ca3af;font-weight:600}
.up-prog{height:4px;background:#E0E7FF;border-radius:2px;margin-top:10px;overflow:hidden}
.up-fill{height:100%;background:linear-gradient(90deg,#5B6EF5,#8B5CF6);border-radius:2px;transition:width .3s}

.o-card{background:rgba(255,255,255,.9);border:1px solid rgba(229,231,235,.7);border-radius:18px;padding:12px 14px;margin-bottom:8px;box-shadow:0 2px 8px rgba(0,0,0,.02);transition:transform .2s}
.o-card:hover{transform:translateY(-1px);box-shadow:0 6px 14px rgba(91,110,245,.05)}
.o-ref{font-size:9.5px;font-weight:800;color:#9ca3af;font-family:monospace;margin-bottom:4px;letter-spacing:.2px}
.pill{display:inline-flex;align-items:center;gap:3px;font-size:9.5px;font-weight:800;padding:3px 8px;border-radius:20px;letter-spacing:.2px}

.sum-row{display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid rgba(243,244,246,.8);font-size:12.5px}
.sum-row:last-child{border-bottom:none}
.sum-l{color:#6b7280;font-weight:600}
.sum-v{color:#0E0C1E;font-weight:800;text-align:right;max-width:60%;word-break:break-all}

.succ{text-align:center;padding:12px 6px}
.succ-ico{margin-bottom:12px;animation:pop .65s cubic-bezier(.34,1.56,.64,1);display:flex;justify-content:center;color:#10b981}
.succ-title{font-size:20px;font-weight:900;color:#0E0C1E;letter-spacing:-.5px;margin-bottom:4px}
.succ-sub{font-size:11.5px;color:#6b7280;font-weight:600;line-height:1.6}

.warn{display:flex;align-items:flex-start;gap:6px;padding:10px 12px;background:#fffbeb;border:1px solid #fde68a;border-radius:14px;margin-bottom:10px;font-size:11.5px;font-weight:600;color:#92400e;line-height:1.5}
.info{display:flex;align-items:flex-start;gap:6px;padding:10px 12px;background:rgba(243,244,255,.65);border:1px solid rgba(224,231,255,.5);border-radius:14px;margin-bottom:10px;font-size:10.5px;font-weight:600;color:#6b7280;line-height:1.5}
.toast{position:fixed;bottom:24px;left:50%;transform:translateX(-50%);white-space:nowrap;padding:11px 20px;border-radius:14px;font-size:12px;font-weight:800;z-index:9999;animation:tIn .3s cubic-bezier(0.16,1,0.3,1);box-shadow:0 12px 32px rgba(14,12,30,.18)}
.toast.ok{background:#0E0C1E;color:#fff}
.toast.err{background:#7f1d1d;color:#fecaca}

/* â”€â”€â”€ MOBILE BOTTOM NAV â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
.bottom-nav{position:fixed;bottom:16px;left:50%;transform:translateX(-50%);height:68px;background:rgba(255,255,255,.92);backdrop-filter:blur(24px);border-radius:22px;box-shadow:0 12px 40px rgba(14,12,30,.14),0 4px 12px rgba(0,0,0,.04);border:1px solid rgba(255,255,255,.8);display:flex;align-items:center;justify-content:space-between;padding:6px;z-index:1000;width:calc(100% - 40px);max-width:380px}
.bottom-nav-item{flex:1;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;cursor:pointer;border:none;background:none;font-family:inherit;transition:all .25s;border-radius:16px;color:#8B92A9;font-weight:800;font-size:10px;gap:4px;padding:0 4px}
.bottom-nav-item:hover{color:#5B6EF5;background:rgba(91,110,245,.05)}
.bottom-nav-item.active{background:linear-gradient(135deg,#5B6EF5,#8B5CF6);color:#fff;box-shadow:0 6px 18px rgba(91,110,245,.28)}
.content-nav-spacer{height:100px;width:100%;flex-shrink:0}

/* â”€â”€â”€ STEP BAR â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
.steps-bar{position:relative;z-index:4;display:flex;align-items:center;padding:8px 16px;background:rgba(255,255,255,.5);backdrop-filter:blur(16px);border-bottom:1px solid rgba(91,110,245,.05);flex-shrink:0}
.sdot{width:22px;height:22px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:9.5px;font-weight:800;flex-shrink:0;transition:all .3s}
.sdot.done{background:linear-gradient(135deg,#5B6EF5,#8B5CF6);color:#fff;box-shadow:0 2px 8px rgba(91,110,245,.25)}
.sdot.active{background:#fff;color:#5B6EF5;border:2px solid #5B6EF5;box-shadow:0 2px 6px rgba(91,110,245,.1)}
.sdot.idle{background:#E5E7EB;color:#9ca3af}
.sline{flex:1;height:2px;background:#E5E7EB;margin:0 4px;border-radius:1px;transition:background .3s}
.sline.done{background:linear-gradient(90deg,#5B6EF5,#8B5CF6)}

/* â”€â”€â”€ HEADER â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
.hdr{position:relative;z-index:5;display:flex;align-items:center;justify-content:space-between;padding:12px 16px;background:rgba(255,255,255,.8);backdrop-filter:blur(24px);border-bottom:1px solid rgba(91,110,245,.06);flex-shrink:0}
.logo{display:flex;align-items:center;gap:8px}
.logo-mark{width:32px;height:32px;border-radius:10px;background:linear-gradient(135deg,#5B6EF5,#8B5CF6);display:flex;align-items:center;justify-content:center;box-shadow:0 4px 12px rgba(91,110,245,.25);flex-shrink:0}
.logo-text{font-size:16px;font-weight:900;color:#0E0C1E;letter-spacing:-.5px}
.logo-sub{font-size:9.5px;color:#6B7389;font-weight:700;margin-top:-2px}
.rate-chip{display:flex;align-items:center;gap:5px;background:#ECFDF5;border:1px solid rgba(16,185,129,.2);border-radius:20px;padding:5px 10px;font-size:11px;font-weight:800;color:#059669;box-shadow:0 2px 6px rgba(16,185,129,.05)}
.live-dot{width:7px;height:7px;border-radius:50%;background:#10b981;animation:lp 2s infinite}

/* â”€â”€â”€ DESKTOP LAYOUT â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
.app-layout{display:flex;min-height:100vh;width:100vw;background:#EEEEF8}

/* SIDEBAR */
.sidebar{width:240px;background:#ffffff;border-right:1px solid rgba(91,110,245,.08);display:flex;flex-direction:column;padding:0;position:fixed;top:0;bottom:0;left:0;z-index:100;box-shadow:2px 0 20px rgba(14,12,30,.04)}
.sidebar-logo{padding:28px 24px 20px;border-bottom:1px solid rgba(91,110,245,.06)}
.sidebar-brand{font-size:22px;font-weight:900;color:#0E0C1E;letter-spacing:-0.8px;margin-bottom:4px}
.sidebar-live-tag{display:inline-flex;align-items:center;gap:5px;font-size:10px;font-weight:800;color:#10B981;letter-spacing:.3px}
.sidebar-live-dot{width:6px;height:6px;border-radius:50%;background:#10B981;animation:pulse-live 2s infinite}
.sidebar-nav{display:flex;flex-direction:column;gap:4px;padding:16px 12px;flex:1}
.sidebar-link{display:flex;align-items:center;gap:12px;padding:11px 14px;color:#6B7389;font-size:14px;font-weight:700;text-decoration:none;border-radius:12px;cursor:pointer;transition:all .2s;border:none;background:none;font-family:inherit;width:100%;text-align:left}
.sidebar-link:hover{color:#0E0C1E;background:rgba(91,110,245,.06)}
.sidebar-link.active{background:linear-gradient(135deg,#5B6EF5,#8B5CF6);color:#fff;box-shadow:0 6px 18px rgba(91,110,245,.22)}
.sidebar-footer{padding:16px 20px;border-top:1px solid rgba(91,110,245,.08)}
.sidebar-user{display:flex;align-items:center;gap:10px}
.sidebar-user-avatar{width:38px;height:38px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:14px;color:#fff;flex-shrink:0}
.sidebar-user-name{font-size:13px;font-weight:800;color:#0E0C1E}
.sidebar-user-credits{display:inline-flex;align-items:center;gap:4px;background:#ECFDF5;color:#059669;font-size:10.5px;font-weight:800;padding:3px 8px;border-radius:8px;margin-top:3px}

/* MAIN CONTENT */
.main-content{margin-left:240px;flex:1;padding:28px 32px;min-height:100vh;width:calc(100% - 240px)}
.page-header{display:flex;align-items:center;justify-content:space-between;padding:0 0 24px;background:transparent}
.page-header-left{display:flex;flex-direction:column;gap:4px}
.page-header-brand{font-size:20px;font-weight:900;color:#0E0C1E;letter-spacing:-.4px;display:none}

/* DESKTOP HERO CARD */
.desktop-hero-card{border-radius:20px;padding:28px 32px;background:linear-gradient(135deg,#1a0533 0%,#2d1065 55%,#4c1d95 100%);color:#fff;position:relative;overflow:hidden;box-shadow:0 16px 48px rgba(76,29,149,.35);margin-bottom:20px;animation:slideUp .3s ease}
.desktop-hero-card::before{content:'';position:absolute;top:-60px;right:-60px;width:240px;height:240px;border-radius:50%;background:rgba(255,255,255,.04);pointer-events:none}
.desktop-hero-card::after{content:'';position:absolute;bottom:-80px;left:-40px;width:280px;height:280px;border-radius:50%;background:rgba(99,102,241,.07);pointer-events:none}
.desktop-hero-label{font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:1.2px;color:rgba(255,255,255,.5);margin-bottom:8px}
.desktop-hero-amount{font-size:52px;font-weight:900;letter-spacing:-2px;line-height:1;margin-bottom:4px}
.desktop-hero-amount span{font-size:20px;font-weight:700;color:rgba(255,255,255,.5);margin-left:8px;letter-spacing:0}
.desktop-hero-sub{font-size:13px;color:rgba(255,255,255,.45);font-weight:600;margin-bottom:24px}
.desktop-hero-top{display:flex;align-items:flex-start;justify-content:space-between}
.desktop-live-badge{display:inline-flex;align-items:center;gap:5px;background:rgba(0,200,150,.15);border:1px solid rgba(0,200,150,.3);border-radius:20px;padding:5px 12px;font-size:10px;font-weight:800;color:#00C896}

/* DESKTOP METRICS */
.desktop-metrics-row{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:24px}

/* SEARCH BAR */
.search-container{position:relative;margin-bottom:14px}
.search-input{width:100%;padding:12px 16px 12px 44px;background:#fff;border:1.5px solid rgba(91,110,245,.1);border-radius:14px;font-family:inherit;font-size:13px;font-weight:600;color:#0E0C1E;outline:none;transition:all .2s;box-shadow:0 2px 8px rgba(14,12,30,.03)}
.search-input:focus{border-color:#5B6EF5;box-shadow:0 4px 16px rgba(91,110,245,.1)}
.search-icon-box{position:absolute;left:14px;top:50%;transform:translateY(-50%);color:#8B92A9;pointer-events:none;display:flex;align-items:center}
.purple-hero-card{background:linear-gradient(135deg,#4f46e5 0%,#7c3aed 100%);border-radius:18px;padding:16px 20px;color:#fff;margin-bottom:12px;display:flex;align-items:center;gap:14px;box-shadow:0 10px 28px rgba(79,70,229,.22)}
.purple-hero-icon{width:40px;height:40px;border-radius:12px;background:rgba(255,255,255,.12);display:flex;align-items:center;justify-content:center;flex-shrink:0}
.purple-hero-text{font-size:13.5px;font-weight:800;line-height:1.4}

/* â”€â”€â”€ NAVBAR (DESKTOP TOP BAR) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
.notification-bell{width:38px;height:38px;border-radius:50%;background:rgba(255,255,255,.8);border:1.5px solid rgba(91,110,245,.1);display:flex;align-items:center;justify-content:center;cursor:pointer;color:#6B7389;transition:all .2s;box-shadow:0 2px 8px rgba(14,12,30,.04)}
.notification-bell:hover{background:#fff;border-color:#5B6EF5;color:#5B6EF5}
.user-avatar-btn{border:none;background:none;display:flex;align-items:center;gap:10px;cursor:pointer;padding:6px 10px;border-radius:14px;transition:background .2s}
.user-avatar-btn:hover{background:rgba(91,110,245,.06)}
.user-avatar-circle{width:36px;height:36px;border-radius:50%;background:linear-gradient(135deg,#5B6EF5,#8B5CF6);display:flex;align-items:center;justify-content:center;font-weight:800;font-size:13px;color:#fff;overflow:hidden;flex-shrink:0}
.user-info-text{display:flex;flex-direction:column;gap:1px;text-align:left}
.user-name-label{font-size:13px;font-weight:800;color:#0E0C1E}
.user-email-label{font-size:10.5px;color:#6B7389;font-weight:600}
.bell-badge{width:8px;height:8px;background:#EF4444;border-radius:50%;border:2px solid #fff;position:absolute;top:-1px;right:-1px}

/* â”€â”€â”€ PAGE SECTIONS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
.pg{position:relative;z-index:1;padding:12px 14px 16px;display:flex;flex-direction:column}
.slbl{font-size:9.5px;font-weight:800;color:#9ca3af;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px;display:block}
.rate-rate-chip{display:flex;align-items:center;gap:5px;background:#ECFDF5;border:1px solid rgba(16,185,129,.2);border-radius:20px;padding:5px 10px;font-size:11px;font-weight:800;color:#059669}

/* â”€â”€â”€ ADMIN PANEL â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
.adm-shell{font-family:'Plus Jakarta Sans',sans-serif;background:#0f172a;width:95%;max-width:1000px;margin:40px auto;border-radius:24px;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,.45);position:relative;border:1px solid rgba(255,255,255,.05);display:flex;flex-direction:column}
.adm-hdr{display:flex;align-items:center;justify-content:space-between;padding:12px 16px;background:#1e293b;border-bottom:1px solid rgba(255,255,255,.05);flex-shrink:0}
.adm-logo{font-size:14px;font-weight:900;color:#f8fafc;letter-spacing:-.3px;display:flex;align-items:center;gap:6px}
.adm-badge{background:#ef4444;color:#fff;border-radius:8px;font-size:8.5px;font-weight:800;padding:1px 6px}
.adm-tabs{display:flex;background:#1e293b;border-bottom:1px solid rgba(255,255,255,.05);flex-shrink:0}
.adm-tab{flex:1;padding:10px 4px;font-size:11.5px;font-weight:800;color:#64748b;border:none;background:none;cursor:pointer;border-bottom:2.5px solid transparent;font-family:inherit;transition:all .2s;display:flex;align-items:center;justify-content:center}
.adm-tab.on{color:#a5b4fc;border-bottom-color:#5B6EF5}
.adm-pg{flex:1;padding:12px 12px 20px;overflow-y:auto}
.adm-section{font-size:8.5px;font-weight:800;color:#64748b;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px;display:block}
.adm-inp{width:100%;padding:9px 12px;background:#0f172a;border:1.5px solid rgba(255,255,255,.08);border-radius:10px;font-family:inherit;font-size:12.5px;font-weight:600;color:#f8fafc;outline:none;transition:border-color .2s;margin-bottom:6px}
.adm-inp:focus{border-color:#5B6EF5}
.adm-btn{width:100%;padding:11px;border:none;border-radius:12px;cursor:pointer;font-family:inherit;font-size:12.5px;font-weight:800;background:linear-gradient(135deg,#5B6EF5,#8B5CF6);color:#fff;transition:all .2s;display:flex;align-items:center;justify-content:center;gap:5px}
.adm-btn:hover{transform:translateY(-1px)}
.adm-btn:disabled{opacity:.5;cursor:not-allowed;transform:none}
.adm-card{background:#1e293b;border:1px solid rgba(255,255,255,.05);border-radius:16px;padding:12px;margin-bottom:8px}
.adm-card.alert-new{border-color:#ef4444;background:#1c1010;animation:aIn .45s ease}
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

/* â”€â”€â”€ SECURITY CHAT â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
.security-chat-warning{display:flex;align-items:flex-start;gap:10px;background:#fef2f2;border:1px solid #fee2e2;border-radius:12px;padding:10px 14px;margin-bottom:16px;font-size:11px;color:#991b1b;line-height:1.5;font-weight:600}
.p2p-negotiate-btn2{width:100%;background:#5B6EF5;color:#fff;border:none;border-radius:12px;padding:10px;font-family:inherit;font-size:13px;font-weight:800;cursor:pointer;transition:all .2s;display:flex;align-items:center;justify-content:center;gap:6px;box-shadow:0 4px 14px rgba(91,110,245,.2)}
.p2p-negotiate-btn2:hover{background:#4F46E5;box-shadow:0 6px 20px rgba(91,110,245,.30);transform:translateY(-.5px)}

/* â”€â”€â”€ RESPONSIVE â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
@media(min-width:600px){
  .card{padding:20px 24px;margin-bottom:14px}
  .hero{padding:24px;margin-bottom:14px}
  .calc-box{padding:16px 20px}
  .calc-num{font-size:32px}
  .pg{padding:20px 24px 32px}
  .hdr{padding:16px 24px}
  .steps-bar{padding:12px 24px}
  .calc-dest-grid{grid-template-columns:repeat(4,1fr)}
}
@media(min-width:768px){
  .adm-stat-grid{grid-template-columns:repeat(4,1fr);gap:12px}
  .bottom-nav{display:none}
}
@media(max-width:480px){
  .shell{margin:0;border-radius:0;max-width:100%}
  .adm-shell{margin:0;border-radius:0;max-width:100%;min-height:100vh;border:none}
  body{background:#F0F1FA}
}

/* â”€â”€â”€ SETTINGS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
.settings-tab-bar{display:flex;gap:0;border-bottom:2px solid #E5E7EB;margin-bottom:24px}
.settings-tab-btn{padding:0 0 12px 0;margin-right:24px;border:none;background:none;font-family:inherit;font-size:13px;font-weight:700;color:#9CA3AF;cursor:pointer;transition:color .2s;position:relative}
.settings-tab-btn.active{color:#5B6EF5}
.settings-tab-btn.active::after{content:'';position:absolute;bottom:-2px;left:0;right:0;height:2px;background:#5B6EF5;border-radius:2px}
.settings-grid{display:grid;grid-template-columns:1fr;gap:20px}
@media(min-width:1024px){.settings-grid{grid-template-columns:2fr 1fr}}
`;
