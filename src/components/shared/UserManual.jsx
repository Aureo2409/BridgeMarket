import { Icon } from "./UI.jsx";

// ── Ícones vectoriais próprios do manual (mesmo traço fino usado no PDF) ────
function ManualIcon({ kind, size = 20, color = "#6c4fd6" }) {
  const sw = 1.8;
  const common = { fill: "none", stroke: color, strokeWidth: sw, strokeLinecap: "round", strokeLinejoin: "round" };

  const icons = {
    swap: (
      <>
        <line x1="4" y1="8" x2="20" y2="8" {...common} />
        <polyline points="15,3 20,8 15,13" {...common} />
        <line x1="20" y1="16" x2="4" y2="16" {...common} />
        <polyline points="9,11 4,16 9,21" {...common} />
      </>
    ),
    shield: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" {...common} />,
    chat: (
      <>
        <rect x="3" y="6" width="18" height="11" rx="2" {...common} />
        <polyline points="6,6 5,2 9,6" {...common} />
        <line x1="6.5" y1="10.5" x2="14" y2="10.5" {...common} />
        <line x1="6.5" y1="13.5" x2="11" y2="13.5" {...common} />
      </>
    ),
    globe: (
      <>
        <circle cx="12" cy="12" r="9" {...common} />
        <line x1="3" y1="12" x2="21" y2="12" {...common} />
        <ellipse cx="12" cy="12" rx="4" ry="9" {...common} />
      </>
    ),
    id: (
      <>
        <rect x="2" y="5" width="20" height="14" rx="2" {...common} />
        <circle cx="8" cy="12" r="2.2" {...common} />
        <line x1="13" y1="10" x2="18" y2="10" {...common} />
        <line x1="13" y1="14" x2="16" y2="14" {...common} />
      </>
    ),
    video: (
      <>
        <rect x="2" y="7" width="13" height="10" rx="1.2" {...common} />
        <path d="M15 10l6-3.2v10.4L15 14" {...common} />
      </>
    ),
    fixed: (
      <>
        <line x1="12" y1="2" x2="12" y2="22" {...common} />
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" {...common} />
      </>
    ),
    doc: (
      <>
        <path d="M6 2h9l5 5v15H6z" {...common} />
        <polyline points="15,2 15,7 20,7" {...common} />
        <line x1="9" y1="12" x2="16" y2="12" {...common} />
        <line x1="9" y1="16" x2="14" y2="16" {...common} />
      </>
    ),
    clock: (
      <>
        <circle cx="12" cy="12" r="9" {...common} />
        <polyline points="12,7 12,12 16,14" {...common} />
      </>
    ),
    spark: (
      <path d="M12 2l2 7 7 2-7 2-2 7-2-7-7-2 7-2z" {...common} />
    ),
    bridge: (
      <>
        <line x1="2" y1="4" x2="22" y2="4" {...common} />
        <line x1="4" y1="4" x2="4" y2="13" {...common} />
        <line x1="20" y1="4" x2="20" y2="13" {...common} />
        <path d="M4 13l8 7 8-7" {...common} />
        <line x1="9" y1="4" x2="9" y2="8.5" {...common} />
        <line x1="15" y1="4" x2="15" y2="8.5" {...common} />
        <line x1="9" y1="8.5" x2="15" y2="8.5" {...common} />
      </>
    ),
  };

  return (
    <svg viewBox="0 0 24 24" width={size} height={size}>
      {icons[kind] || null}
    </svg>
  );
}

function IconBox({ kind, color, bg, size = 34 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: size * 0.28,
      background: bg, display: "flex", alignItems: "center", justifyContent: "center",
      flexShrink: 0
    }}>
      <ManualIcon kind={kind} size={size * 0.5} color={color} />
    </div>
  );
}

function Callout({ title, children, color = "#c08a2e", bg = "#f1ead9" }) {
  return (
    <div style={{
      background: bg, borderLeft: `3px solid ${color}`, borderRadius: "0 12px 12px 0",
      padding: "14px 18px", fontSize: 13.5, color: "#5a5147", lineHeight: 1.6, margin: "16px 0"
    }}>
      {title && <strong style={{ color: "#1c1814" }}>{title}: </strong>}
      {children}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL — Manual de Utilização
// ══════════════════════════════════════════════════════════════════════════
export function UserManual({ onClose, onDownloadPdf }) {
  const steps = [
    {
      num: 1, title: "Cria a tua conta",
      body: "Regista-te com o teu email, uma senha e o teu número de telemóvel. É rápido e simples — só pedimos o essencial para garantir que a tua conta é segura."
    },
    {
      num: 2, title: "Confirma quem és",
      body: "Antes de poderes negociar, pedimos que confirmes a tua identidade — tira uma foto do teu Bilhete de Identidade ou Passaporte, e um pequeno vídeo a olhar para a câmara. Isto protege-te a ti e a todas as outras pessoas que usam a plataforma.",
      tip: "Este processo demora poucos minutos. Assim que for aprovado, já podes começar a usar a Bridge livremente.",
      tipIcon: "clock"
    },
    {
      num: 3, title: "Explora o mercado, sem compromisso",
      body: "Depois de confirmada a tua identidade, já podes ver todos os pedidos de compra e venda que estão activos na plataforma. Olhar é sempre grátis — não pagas nada só por explorar."
    },
    {
      num: 4, title: "Cria o teu pedido — também é grátis",
      body: "Decide se queres comprar ou vender dólares, escreve o valor que pretendes, e escolhe onde queres receber ou de onde vais enviar o dinheiro (Multicaixa Express, PayPal, Pix, e outros). O teu pedido fica visível no mercado para outras pessoas o encontrarem.",
      tip: "Criar um pedido nunca tem custo. Só pagas quando, de facto, encontras alguém para negociar.",
      tipIcon: "spark"
    },
    {
      num: 5, title: "Negoceia e recebe o teu dinheiro",
      body: "Quando alguém aceita o teu pedido — ou tu aceitas o pedido de outra pessoa — abre-se uma conversa privada entre vocês os dois. Combinam os detalhes, fazem a transferência, e confirmam quando o dinheiro chega. Simples assim."
    },
  ];

  const features = [
    { icon: "swap", color: "#6c4fd6", bg: "#ece7fb", title: "Um preço, igual para todos", body: "A taxa do dia é a mesma para qualquer pessoa na plataforma. Sem surpresas, sem negociar valores diferentes em segredo." },
    { icon: "shield", color: "#1f8a7a", bg: "#e3f3f0", title: "Pessoas verificadas", body: "Todos os utilizadores confirmam a sua identidade antes de poderem negociar. Sabes sempre com quem estás a falar." },
    { icon: "chat", color: "#c08a2e", bg: "#f7eede", title: "Conversa protegida", body: "Cada negócio tem o seu próprio espaço de conversa, só entre ti e a outra pessoa, com avisos de segurança sempre visíveis." },
    { icon: "globe", color: "#dc2626", bg: "#fbe7e7", title: "Várias moedas", body: "Para além do dólar, também podes negociar em Euro, Real e Rand, com os métodos de pagamento que usas no dia a dia." },
  ];

  const safetyItems = [
    { icon: "id", title: "Todos confirmam quem são.", body: "Ninguém negoceia na Bridge sem ter confirmado a sua identidade primeiro." },
    { icon: "video", title: "Um pequeno vídeo antes de cada negócio.", body: "Quando alguém aceita negociar contigo, grava um vídeo curto a confirmar — assim sabes que é uma pessoa real, naquele preciso momento." },
    { icon: "fixed", title: "O preço nunca muda a meio.", body: "O valor combinado no início fica fixo durante toda a conversa — ninguém pode tentar cobrar-te mais por fora." },
    { icon: "doc", title: "Tudo fica registado.", body: "A conversa entre ti e a outra pessoa fica guardada, para que, se algo correr mal, possas mostrar o que aconteceu." },
  ];

  const faqs = [
    { q: "Quanto custa usar a Bridge?", a: "Nada, até começares a negociar. Ver o mercado e criar pedidos é sempre grátis. Só pagas 1 crédito (500 Kz) quando, de facto, encontras alguém e começam a conversar." },
    { q: "Como sei que a pessoa do outro lado é de confiança?", a: "Todas as pessoas na Bridge confirmaram a sua identidade antes de poderem usar a plataforma. Além disso, antes de cada negócio, há um pequeno vídeo de confirmação, para garantires que estás mesmo a falar com uma pessoa real." },
    { q: "Posso mudar o preço depois de combinado?", a: "Não. O valor é definido pela taxa oficial do dia e fica fixo durante todo o negócio. Se alguém tentar cobrar-te mais ou propuser um preço diferente na conversa, a Bridge avisa-te automaticamente." },
    { q: "O que acontece se não houver ninguém para negociar comigo?", a: "O teu pedido fica visível no mercado até alguém o encontrar. Como criar um pedido é grátis, não perdes nada por esperar — podes deixar vários pedidos activos se quiseres." },
    { q: "Onde posso receber o meu dinheiro?", a: "Podes escolher entre vários métodos — Multicaixa Express, Unitel Money, PayPal, Pix, IBAN, Binance, e outros — consoante a moeda que estás a negociar. Configura os teus métodos preferidos no teu perfil." },
    { q: "Preciso de pagar para criar uma conta?", a: "Não. Criar conta, confirmar a tua identidade e explorar o mercado são sempre gratuitos. Só pagas quando, de facto, encontras alguém para negociar." },
  ];

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 10000, background: "#fbf8f3",
      overflowY: "auto", WebkitOverflowScrolling: "touch"
    }}>
      {/* ── Barra superior fixa ── */}
      <div style={{
        position: "sticky", top: 0, zIndex: 10, background: "#ffffff",
        borderBottom: "1px solid #e8e0d4", padding: "14px 18px",
        display: "flex", alignItems: "center", justifyContent: "space-between"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <ManualIcon kind="bridge" size={18} color="#6c4fd6" />
          <span style={{ fontSize: 14, fontWeight: 800, color: "#1c1814" }}>Manual do Utilizador</span>
        </div>
        <button
          onClick={onClose}
          style={{
            background: "#f1ead9", border: "none", borderRadius: 10,
            width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", color: "#5a5147"
          }}
        >
          <Icon name="x" size={16} />
        </button>
      </div>

      {/* ── Hero ── */}
      <div style={{
        background: "linear-gradient(170deg, #4a3296 0%, #6c4fd6 55%, #8a6ce8 100%)",
        padding: "38px 22px 46px", textAlign: "center"
      }}>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          background: "rgba(255,255,255,0.16)", border: "1px solid rgba(255,255,255,0.25)",
          padding: "6px 16px", borderRadius: 30, fontSize: 11.5, fontWeight: 700,
          color: "#fff", marginBottom: 18
        }}>
          <ManualIcon kind="bridge" size={14} color="#fff" />
          Guia rápido
        </div>
        <div style={{ fontSize: 23, fontWeight: 800, color: "#fff", lineHeight: 1.25, marginBottom: 10, fontFamily: "Georgia, serif" }}>
          Tudo o que precisas de saber<br/>para usar a <em style={{ color: "#ffe9b3" }}>Bridge</em>
        </div>
        <div style={{ fontSize: 13, color: "rgba(255,255,255,0.88)", maxWidth: 340, margin: "0 auto", lineHeight: 1.5 }}>
          Um guia simples, sem termos complicados, para comprares e venderes dólares com segurança em Angola.
        </div>
      </div>

      <div style={{ maxWidth: 560, margin: "-26px auto 0", padding: "0 18px 50px", position: "relative" }}>

        {/* ── Cartão de 3 passos ── */}
        <div style={{
          background: "#fff", borderRadius: 20, padding: "22px 18px",
          boxShadow: "0 20px 50px -25px rgba(74,50,150,0.35)",
          display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14, marginBottom: 34
        }}>
          {[
            ["01", "Regista-te e confirma a tua identidade"],
            ["02", "Vê o mercado e cria o teu pedido — é grátis"],
            ["03", "Negocia em segurança e recebe o teu dinheiro"],
          ].map(([n, label]) => (
            <div key={n} style={{ textAlign: "center" }}>
              <div style={{ fontSize: 26, fontWeight: 800, color: "#6c4fd6", fontFamily: "Georgia, serif", marginBottom: 4 }}>{n}</div>
              <div style={{ fontSize: 10.5, color: "#5a5147", lineHeight: 1.4 }}>{label}</div>
            </div>
          ))}
        </div>

        {/* ── O que é a Bridge ── */}
        <div style={{ fontSize: 11.5, fontWeight: 800, color: "#6c4fd6", letterSpacing: 1, textTransform: "uppercase", marginBottom: 8 }}>Para começar</div>
        <div style={{ fontSize: 21, fontWeight: 800, color: "#1c1814", fontFamily: "Georgia, serif", marginBottom: 12 }}>O que é a Bridge?</div>
        <p style={{ fontSize: 13.5, color: "#5a5147", lineHeight: 1.7, marginBottom: 18 }}>
          A Bridge é um espaço onde pessoas em Angola compram e vendem dólares directamente umas às
          outras, de forma seria, transparente e protegida. Não precisas de ir ao banco nem de confiar
          num cambista desconhecido na rua — aqui falas com pessoas verificadas, a um preço justo e
          igual para todos.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 34 }}>
          {features.map((f, i) => (
            <div key={i} style={{ background: "#fff", border: "1px solid #e8e0d4", borderRadius: 14, padding: "16px 14px" }}>
              <IconBox kind={f.icon} color={f.color} bg={f.bg} />
              <div style={{ fontSize: 12.5, fontWeight: 800, color: "#1c1814", margin: "10px 0 5px", fontFamily: "Georgia, serif" }}>{f.title}</div>
              <div style={{ fontSize: 11, color: "#5a5147", lineHeight: 1.5 }}>{f.body}</div>
            </div>
          ))}
        </div>

        {/* ── Como começar ── */}
        <div style={{ fontSize: 11.5, fontWeight: 800, color: "#6c4fd6", letterSpacing: 1, textTransform: "uppercase", marginBottom: 8 }}>Os primeiros passos</div>
        <div style={{ fontSize: 21, fontWeight: 800, color: "#1c1814", fontFamily: "Georgia, serif", marginBottom: 12 }}>Como começar a usar a Bridge</div>
        <p style={{ fontSize: 13.5, color: "#5a5147", lineHeight: 1.7, marginBottom: 20 }}>Cinco passos simples, do registo até à tua primeira negociação.</p>

        {steps.map((s, i) => (
          <div key={s.num} style={{ display: "flex", gap: 14, marginBottom: i < steps.length - 1 ? 20 : 34, paddingBottom: i < steps.length - 1 ? 20 : 0, borderBottom: i < steps.length - 1 ? "1px solid #e8e0d4" : "none" }}>
            <div style={{
              width: 38, height: 38, borderRadius: 12, background: "#f1ead9",
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
              fontSize: 16, fontWeight: 800, color: "#6c4fd6", fontFamily: "Georgia, serif"
            }}>{s.num}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14.5, fontWeight: 800, color: "#1c1814", marginBottom: 5, fontFamily: "Georgia, serif" }}>{s.title}</div>
              <div style={{ fontSize: 12.5, color: "#5a5147", lineHeight: 1.6 }}>{s.body}</div>
              {s.tip && (
                <div style={{ marginTop: 10, background: "#f1ead9", borderRadius: 10, padding: "10px 12px", display: "flex", gap: 8, alignItems: "flex-start" }}>
                  <ManualIcon kind={s.tipIcon} size={14} color="#c08a2e" />
                  <span style={{ fontSize: 11.5, color: "#5a5147", lineHeight: 1.5 }}>{s.tip}</span>
                </div>
              )}
            </div>
          </div>
        ))}

        {/* ── Créditos ── */}
        <div style={{ fontSize: 11.5, fontWeight: 800, color: "#6c4fd6", letterSpacing: 1, textTransform: "uppercase", marginBottom: 8 }}>Como funciona o pagamento</div>
        <div style={{ fontSize: 21, fontWeight: 800, color: "#1c1814", fontFamily: "Georgia, serif", marginBottom: 12 }}>Os créditos da Bridge</div>
        <p style={{ fontSize: 13.5, color: "#5a5147", lineHeight: 1.7, marginBottom: 18 }}>
          A Bridge não cobra mensalidade nem assinatura. Funciona com créditos — só pagas quando,
          de facto, encontras alguém para negociar.
        </p>

        <div style={{ background: "linear-gradient(135deg,#2d1f5e,#4a3296)", borderRadius: 18, padding: "22px 20px", marginBottom: 16 }}>
          <div style={{ fontSize: 10.5, fontWeight: 800, color: "#ffe9b3", letterSpacing: 1, textTransform: "uppercase", marginBottom: 6 }}>Como funciona</div>
          <div style={{ fontSize: 19, fontWeight: 800, color: "#fff", fontFamily: "Georgia, serif", marginBottom: 16 }}>1 crédito = 500 Kz</div>
          {[
            ["Ver o mercado e explorar pedidos", "Grátis"],
            ["Criar o teu próprio pedido", "Grátis"],
            ["Encontrar alguém e começar a negociar", "1 crédito"],
            ["Conversar e concluir o negócio", "Incluído"],
          ].map(([label, val], i, arr) => (
            <div key={i} style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              padding: "11px 0", borderBottom: i < arr.length - 1 ? "1px solid rgba(255,255,255,0.14)" : "none"
            }}>
              <span style={{ fontSize: 12.5, color: "rgba(255,255,255,0.85)" }}>{label}</span>
              <span style={{ fontSize: 13, fontWeight: 800, color: "#ffe9b3", fontFamily: "Georgia, serif" }}>{val}</span>
            </div>
          ))}
        </div>

        <Callout title="Em palavras simples" color="#c08a2e" bg="#f1ead9">
          só pagas quando a Bridge te liga de facto a outra pessoa para negociar. Carrega créditos
          uma vez na tua carteira e usa-os quando quiseres — sem prazos, sem mensalidade.
        </Callout>

        <div style={{ marginBottom: 34 }} />

        {/* ── Segurança ── */}
        <div style={{ fontSize: 11.5, fontWeight: 800, color: "#6c4fd6", letterSpacing: 1, textTransform: "uppercase", marginBottom: 8 }}>A tua protecção</div>
        <div style={{ fontSize: 21, fontWeight: 800, color: "#1c1814", fontFamily: "Georgia, serif", marginBottom: 12 }}>Como a Bridge te protege</div>
        <p style={{ fontSize: 13.5, color: "#5a5147", lineHeight: 1.7, marginBottom: 18 }}>A confiança é a base de todo o negócio. Por isso, construímos várias camadas de protecção.</p>

        {safetyItems.map((s, i) => (
          <div key={i} style={{
            display: "flex", gap: 12, alignItems: "flex-start",
            background: "#fff", border: "1px solid #e8e0d4", borderRadius: 14,
            padding: "14px 16px", marginBottom: 10
          }}>
            <IconBox kind={s.icon} color="#1f8a7a" bg="#e3f3f0" size={32} />
            <div style={{ fontSize: 12.5, color: "#5a5147", lineHeight: 1.55 }}>
              <strong style={{ color: "#1c1814" }}>{s.title}</strong> {s.body}
            </div>
          </div>
        ))}

        <Callout title="Importante" color="#c08a2e" bg="#f1ead9">
          nunca partilhes números de telefone, IBANs ou outros contactos directamente na conversa
          da Bridge. Usa sempre os métodos de pagamento que já configuraste no teu perfil — é mais
          seguro para ti.
        </Callout>

        <div style={{ marginBottom: 30 }} />

        {/* ── FAQ ── */}
        <div style={{ fontSize: 11.5, fontWeight: 800, color: "#6c4fd6", letterSpacing: 1, textTransform: "uppercase", marginBottom: 8 }}>Dúvidas comuns</div>
        <div style={{ fontSize: 21, fontWeight: 800, color: "#1c1814", fontFamily: "Georgia, serif", marginBottom: 16 }}>Perguntas frequentes</div>

        {faqs.map((f, i) => (
          <div key={i} style={{ paddingBottom: 16, marginBottom: 16, borderBottom: i < faqs.length - 1 ? "1px solid #e8e0d4" : "none" }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: "#1c1814", marginBottom: 6, fontFamily: "Georgia, serif" }}>{f.q}</div>
            <div style={{ fontSize: 12.5, color: "#5a5147", lineHeight: 1.65 }}>{f.a}</div>
          </div>
        ))}

        {/* ── Download PDF ── */}
        <button
          onClick={onDownloadPdf}
          style={{
            width: "100%", marginTop: 20, padding: "14px", borderRadius: 12,
            background: "#fff", border: "1.5px solid #6c4fd6", color: "#6c4fd6",
            fontSize: 13, fontWeight: 800, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8
          }}
        >
          <Icon name="download" size={15} />
          Descarregar em PDF
        </button>

        {/* ── Rodapé ── */}
        <div style={{ textAlign: "center", marginTop: 40, paddingTop: 24, borderTop: "1px solid #e8e0d4" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 7, marginBottom: 6 }}>
            <ManualIcon kind="bridge" size={16} color="#6c4fd6" />
            <span style={{ fontSize: 15, fontWeight: 800, color: "#6c4fd6", fontFamily: "Georgia, serif" }}>Bridge</span>
          </div>
          <div style={{ fontSize: 11, color: "#9a9488" }}>Manual do Utilizador · Bridge Market, Angola</div>
        </div>
      </div>
    </div>
  );
}
