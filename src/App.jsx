import { useState, useEffect, useCallback } from "react";
import { sb, checkIsAdmin, fetchLatestRate, fetchAdminConfig, uploadKycDocument, uploadAvatar, uploadAccessProof } from "./lib/supabase.js";
import { CSS, DESTS, CURRENCIES } from "./lib/constants.js";
import { Toast, StepBar, Header, Icon, ConfirmModal } from "./components/shared/UI.jsx";
import { Calculator } from "./components/client/Calculator.jsx";
import { ProofUpload } from "./components/client/ProofUpload.jsx";
import { OrderList } from "./components/client/OrderList.jsx";
import { TransactionCenter } from "./components/client/TransactionCenter.jsx";
import { AdminPanel } from "./components/admin/AdminPanel.jsx";

const API_URL = import.meta.env.VITE_API_URL || window.location.origin;

// ── AUTH ──────────────────────────────────────────────────────────────────────
function AuthScreen() {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [pwd, setPwd] = useState("");
  const [name, setName] = useState("");
  const [err, setErr] = useState("");
  const [load, setLoad] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  async function submit() {
    setLoad(true); setErr("");

    if (mode === "reset") {
      if (!email.trim()) { setErr("Insere o teu email."); setLoad(false); return; }
      setErr("load:A enviar link de recuperação...");
      const { error } = await sb.auth.resetPasswordForEmail(email);
      if (error) { setErr("Erro: " + error.message); }
      else { setErr("ok:Enviámos um link de recuperação para o teu email."); }
      setLoad(false); return;
    }

    if (mode === "register") {
      if (!termsAccepted) { setErr("err:Precisas de aceitar os Termos e Condições para prosseguir."); setLoad(false); return; }
      if (!phone.trim()) { setErr("O número de telefone é obrigatório."); setLoad(false); return; }

      // Validação para números de Angola (+244)
      const cleanPhone = phone.replace(/\D/g, "");
      if (!((cleanPhone.length === 9 && cleanPhone.startsWith("9")) || (cleanPhone.length === 12 && cleanPhone.startsWith("2449")))) {
        setErr("err:Apenas números válidos de Angola (+244) são permitidos.");
        setLoad(false); return;
      }

      // Anti-SPAM: Previne múltiplas tentativas de registo seguidas
      const lastAttempt = localStorage.getItem("last_register_attempt");
      if (lastAttempt && Date.now() - parseInt(lastAttempt) < 60000) { // 60 segundos de bloqueio
        setErr("err:Aguarda 1 minuto antes de tentares criar outra conta.");
        setLoad(false); return;
      }
      localStorage.setItem("last_register_attempt", Date.now().toString());

      // Garante que o número começa sempre por +244 antes de salvar na base de dados
      const formattedPhone = cleanPhone.length === 9 ? `+244${cleanPhone}` : `+${cleanPhone}`;

      setErr("load:A criar a conta...");
      const { error, data } = await sb.auth.signUp({ email, password: pwd });
      if (error) { setErr(error.message); setLoad(false); return; }
      if (data?.user) {
        await sb.from("profiles").upsert({
          id: data.user.id,
          full_name: name || null,
          phone: formattedPhone,
        });
      }
      setErr("ok:Registo feito! Verifica o teu email para activar a conta.");
    } else {
      const { error } = await sb.auth.signInWithPassword({ email, password: pwd });
      if (error) setErr("Email ou senha incorrectos.");
    }
    setLoad(false);
  }

  async function handleSocialLogin(providerName) {
    setLoad(true); setErr("");
    const { error } = await sb.auth.signInWithOAuth({
      provider: providerName,
      options: {
        redirectTo: window.location.origin
      }
    });
    if (error) {
      setErr("err:Erro ao ligar: " + error.message);
      setLoad(false);
    }
  }

  return (
    <div className="shell">
      <style>{`.spin { animation: spin 1s linear infinite; } @keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
      <div className="blob b1" /><div className="blob b2" />
      <div style={{ position: "relative", zIndex: 2, padding: "44px 22px" }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <img src="/logo.svg" alt="Logo" style={{ width: 68, height: 68, margin: "0 auto 12px", display: "block", objectFit: "contain" }} />
          <div style={{ fontSize: 24, fontWeight: 900, color: "#1e1b4b", letterSpacing: -1 }}>Bridge</div>
          <div style={{ fontSize: 12, color: "#6b7280", fontWeight: 600, marginTop: 3 }}>MarketPlace de Câmbio Angola</div>
        </div>

        <div className="card" style={{ background: "rgba(255,255,255,.96)" }}>
          {mode !== "reset" ? (
            <div style={{ display: "flex", gap: 4, background: "#f0efff", borderRadius: 13, padding: 4, marginBottom: 16 }}>
              {["login", "register"].map(m => (
                <button key={m} onClick={() => { setMode(m); setErr(""); }}
                  style={{ flex: 1, padding: "9px", border: "none", borderRadius: 10, fontFamily: "inherit", fontSize: 13, fontWeight: 700, cursor: "pointer", transition: "all .2s", background: mode === m ? "white" : "transparent", color: mode === m ? "#1e1b4b" : "#6b7280", boxShadow: mode === m ? "0 2px 8px rgba(0,0,0,.08)" : "none" }}>
                  {m === "login" ? "Entrar" : "Criar conta"}
                </button>
              ))}
            </div>
          ) : (
            <div style={{ marginBottom: 16, textAlign: "center", fontSize: 14, fontWeight: 800, color: "#1e1b4b" }}>
              Recuperar Senha
            </div>
          )}

          {err && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, background: err.startsWith("ok:") ? "#f0fdf4" : "#fef2f2", border: `1px solid ${err.startsWith("ok:") ? "#bbf7d0" : "#fecaca"}`, borderRadius: 9, padding: "9px 12px", fontSize: 12, fontWeight: 600, marginBottom: 12, color: err.startsWith("ok:") ? "#16a34a" : "#b91c1c" }}>
              <Icon name={err.startsWith("ok:") ? "checkCircle" : err.startsWith("load:") ? "loader" : err.startsWith("warn:") ? "alertTriangle" : "xCircle"} size={16} className={err.startsWith("load:") ? "spin" : ""} style={{ flexShrink: 0 }} />
              {err.replace(/ok:|err:|load:|warn:/g, "").trim()}
            </div>
          )}

          {mode === "register" && (
            <>
              <label className="lbl">Nome completo</label>
              <input className="inp" style={{ marginBottom: 9 }} type="text" placeholder="Ex: João Silva"
                value={name} onChange={e => setName(e.target.value)} />
            </>
          )}

          <label className="lbl">Email</label>
          <input className="inp" style={{ marginBottom: 9 }} type="email" placeholder="nome@exemplo.com"
            value={email} onChange={e => setEmail(e.target.value)} />

          {mode === "register" && (
            <>
              <label className="lbl">Número de telefone</label>
              <input className="inp" style={{ marginBottom: 9 }} type="tel" placeholder="+244 9XX XXX XXX"
                value={phone} onChange={e => setPhone(e.target.value)} />
            </>
          )}

          {mode !== "reset" && (
            <>
              <label className="lbl">Senha</label>
              <input className="inp" style={{ marginBottom: mode === "login" ? 4 : (mode === "register" ? 8 : 14) }} type="password" placeholder="Mínimo 6 caracteres"
                value={pwd} onChange={e => setPwd(e.target.value)}
                onKeyDown={e => e.key === "Enter" && submit()} />
              {mode === "login" && (
                <div style={{ textAlign: "right", marginBottom: 14 }}>
                  <button onClick={() => { setMode("reset"); setErr(""); }} style={{ background: "none", border: "none", color: "#6366f1", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>Esqueci-me da senha</button>
                </div>
              )}
            </>
          )}

          {mode === "register" && (
            <div style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 14 }}>
              <input type="checkbox" id="terms" checked={termsAccepted} onChange={e => setTermsAccepted(e.target.checked)} style={{ marginTop: 2, accentColor: "#6366f1", cursor: "pointer", width: 14, height: 14 }} />
              <label htmlFor="terms" style={{ fontSize: 11, color: "#475569", lineHeight: 1.4, cursor: "pointer" }}>
                Confirmo que li e aceito os <a href="#" style={{ color: "#6366f1", textDecoration: "none", fontWeight: 700 }}>Termos e Condições</a> e a <a href="#" style={{ color: "#6366f1", textDecoration: "none", fontWeight: 700 }}>Política de Privacidade</a> da plataforma.
              </label>
            </div>
          )}

          <button className="btn btn-p" onClick={submit} disabled={load}>
            {load ? "A processar..." : mode === "login" ? <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>Entrar <Icon name="arrowRight" size={16} /></div> : mode === "register" ? <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>Criar conta <Icon name="arrowRight" size={16} /></div> : "Receber link no email"}
          </button>

          {mode !== "reset" && (
            <>
              <div style={{ display: "flex", alignItems: "center", margin: "20px 0 16px", color: "#94a3b8", fontSize: 11, fontWeight: 700, letterSpacing: 0.5 }}>
                <div style={{ flex: 1, height: 1, background: "#e2e8f0" }}></div>
                <span style={{ padding: "0 12px" }}>OU ENTRAR COM</span>
                <div style={{ flex: 1, height: 1, background: "#e2e8f0" }}></div>
              </div>

              <button onClick={() => handleSocialLogin("google")} disabled={load}
                style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, width: "100%", padding: "12px", border: "1px solid #e2e8f0", borderRadius: 10, background: "#ffffff", cursor: "pointer", transition: "all 0.2s", fontFamily: "inherit", fontSize: 13, fontWeight: 700, color: "#1e1b4b" }}
                onMouseEnter={e => { e.currentTarget.style.background = "#f8fafc"; e.currentTarget.style.borderColor = "#cbd5e1"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "#ffffff"; e.currentTarget.style.borderColor = "#e2e8f0"; }}>
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path fill="#ea4335" d="M12 5.04c1.7 0 3.2.6 4.4 1.7l3.3-3.3C17.7 1.6 15 1 12 1 7.3 1 3.3 3.7 1.4 7.6l3.9 3c.9-2.6 3.4-4.56 6.7-4.56z"/>
                  <path fill="#4285f4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.4h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.1-2 3.7-4.9 3.7-8.7z"/>
                  <path fill="#fbbc05" d="M5.3 14.6c-.2-.6-.3-1.3-.3-2s.1-1.4.3-2L1.4 7.6C.5 9.4 0 11.4 0 13.5s.5 4.1 1.4 5.9l3.9-3z"/>
                  <path fill="#34a853" d="M12 18.96c-3.3 0-5.8-2-6.7-4.6l-3.9 3C3.3 21.3 7.3 24 12 24c3.2 0 5.9-1.1 7.9-2.9l-3.7-2.9c-1.1.7-2.6 1.16-4.2 1.16z"/>
                </svg>
                Continuar com o Google
              </button>
            </>
          )}

          {mode === "reset" && (
            <button className="btn btn-o" style={{ marginTop: 8 }} onClick={() => { setMode("login"); setErr(""); }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}><Icon name="arrowLeft" size={14} /> Voltar ao Login</div>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── KYC ONBOARDING ─────────────────────────────────────────────────────────────
function KycOnboarding({ user, currentStep, kycRecord, onLogout, onBack }) {
  const [loading, setLoading] = useState(false);
  const [sessionUrl, setSessionUrl] = useState(null);
  const [preFetchError, setPreFetchError] = useState(null);

  // Pré-carrega a sessão do DIDIT em background para zero latência!
  useEffect(() => {
    sb.auth.getSession().then(({ data: sessionData }) => {
      const token = sessionData.session?.access_token;
      fetch(`${API_URL}/api/didit-session`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ user_id: user.id })
      })
        .then(res => res.json())
        .then(data => {
          if (data.session_url) {
            setSessionUrl(data.session_url);
          } else {
            setPreFetchError(data.error || "DIDIt não devolveu URL de verificação.");
          }
        })
        .catch(err => {
          setPreFetchError(err.message || "Erro de ligação ao servidor.");
        });
    });
  }, [user.id]);

  const isPending = kycRecord?.ocr_status === "pending" || kycRecord?.liveness_status === "pending";
  const isRejected = kycRecord?.ocr_status === "rejected" || kycRecord?.liveness_status === "rejected";

  async function handleStartVerification() {
    setLoading(true);

    // Se a URL já foi pré-carregada com sucesso em background, redireciona IMEDIATAMENTE!
    if (sessionUrl) {
      window.location.href = sessionUrl;
      return;
    }

    // Se o utilizador clicou muito rápido antes de terminar a chamada de background, faz a chamada direta com timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    try {
      const { data: sessionData } = await sb.auth.getSession();
      const token = sessionData.session?.access_token;

      const res = await fetch(`${API_URL}/api/didit-session`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ user_id: user.id }),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      const data = await res.json();
      if (data.session_url) {
        window.location.href = data.session_url;
      } else {
        throw new Error(data.error || preFetchError || "DIDIt não devolveu URL de verificação.");
      }
    } catch (e) {
      clearTimeout(timeoutId);
      console.error("Erro na verificação direta:", e);
      if (e.name === "AbortError") {
        alert("O servidor do DIDIt está a demorar muito a responder. Por favor, tente novamente ou fale com o nosso suporte técnico para efetuar a verificação manual.");
      } else {
        alert(e.message || "Erro ao conectar ao DIDIt. Por favor, tente novamente em instantes ou contacte o suporte.");
      }
    }
    setLoading(false);
  }

  async function handleRetry() {
    await sb.from("kyc_verifications").update({ liveness_status: null, ocr_status: null, step_personal_done: false }).eq("user_id", user.id);
    window.location.reload();
  }

  if (isPending) {
    return (
      <div className="shell" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 20px", textAlign: "center" }}>
        <div style={{ marginBottom: 16 }}><Icon name="loader" size={50} color="#6366f1" className="spin" /></div>
        <div style={{ fontSize: 24, fontWeight: 900, color: "#1e1b4b", letterSpacing: -1 }}>Em análise</div>
        <div style={{ fontSize: 13, color: "#6b7280", fontWeight: 600, marginTop: 10, maxWidth: 300, lineHeight: 1.5 }}>A tua identidade está sob análise. O processo de verificação de conta pode demorar até 24 horas, embora geralmente seja concluído em poucos minutos. Agradecemos a paciência.</div>
        {onBack && (
          <button className="btn btn-p" onClick={onBack} style={{ marginTop: 24, width: "100%", maxWidth: 200 }}>
            Voltar para a Calculadora
          </button>
        )}
        <button className="btn btn-o" onClick={onLogout} style={{ marginTop: onBack ? 10 : 24, width: "100%", maxWidth: 200 }}>Sair</button>
      </div>
    );
  }

  if (isRejected) {
    return (
      <div className="shell" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 20px", textAlign: "center" }}>
        <div style={{ marginBottom: 16 }}><Icon name="xCircle" size={50} color="#ef4444" /></div>
        <div style={{ fontSize: 24, fontWeight: 900, color: "#ef4444", letterSpacing: -1 }}>Verificação Recusada</div>
        <div style={{ fontSize: 13, color: "#6b7280", fontWeight: 600, marginTop: 10, maxWidth: 300, lineHeight: 1.5 }}>Não foi possível validar a tua identidade com os dados fornecidos.</div>
        {kycRecord?.rejection_reason && (
          <div style={{ marginTop: 12, padding: "8px 12px", background: "#fef2f2", color: "#991b1b", fontSize: 12, borderRadius: 8, border: "1px solid #fecaca", fontWeight: 600, maxWidth: 300, textAlign: "left" }}>
            <span style={{ display: "block", fontSize: 10, textTransform: "uppercase", color: "#ef4444", marginBottom: 2 }}>Motivo:</span>
            {kycRecord.rejection_reason}
          </div>
        )}
        <button className="btn btn-p" onClick={handleRetry} style={{ marginTop: 24, width: "100%", maxWidth: 200 }}>Tentar Novamente</button>
        {onBack && (
          <button className="btn btn-p" onClick={onBack} style={{ marginTop: 10, width: "100%", maxWidth: 200, background: "#475569" }}>
            Voltar para a Calculadora
          </button>
        )}
        <button className="btn btn-o" onClick={onLogout} style={{ marginTop: 10, width: "100%", maxWidth: 200 }}>Sair</button>
      </div>
    );
  }

  return (
    <div className="shell">
      <style>{`.spin { animation: spin 1s linear infinite; } @keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
      <div className="blob b1" /><div className="blob b2" />
      <div style={{ position: "relative", zIndex: 2, padding: "44px 22px", maxWidth: 600, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ fontSize: 24, fontWeight: 900, color: "#1e1b4b", letterSpacing: -1 }}>Verificação de Conta</div>
          <div style={{ fontSize: 13, color: "#6b7280", fontWeight: 600, marginTop: 6 }}>Precisamos de confirmar a tua identidade antes de continuares.</div>
        </div>

        <div className="card" style={{ background: "rgba(255,255,255,.96)" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 22 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 34, height: 34, borderRadius: 12, background: "linear-gradient(135deg,#6366f1,#8b5cf6)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, boxShadow: "0 4px 12px rgba(99,102,241,0.2)" }}>
                <Icon name="lock" size={16} color="#fff" />
              </div>
              <div style={{ fontWeight: 800, color: "#1e1b4b", fontSize: 15 }}>Verificação Segura Integrada</div>
            </div>
            <div style={{ fontSize: 13, color: "#475569", lineHeight: 1.6 }}>
              A plataforma utiliza a tecnologia oficial e certificada do **DIDIT** para validar a sua identidade. O processo é rápido, simples e completamente protegido por criptografia avançada.
            </div>
            <div className="info" style={{ display: "flex", gap: 8, background: "#f8fafc", border: "1px solid #e2e8f0", padding: "10px 12px", borderRadius: 10, fontSize: 11, color: "#475569", lineHeight: 1.5 }}>
              <Icon name="shield" size={15} style={{ flexShrink: 0, marginTop: 1, color: "#10b981" }} />
              <span>O DIDIt recolherá com segurança a fotografia do seu documento (BI/Passaporte) e fará um teste de Prova de Vida facial rápida de 30 segundos.</span>
            </div>
          </div>

          <button className="btn btn-p" onClick={handleStartVerification} disabled={loading}>
            {loading ? <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}><Icon name="loader" size={16} className="spin" /> A conectar...</div> : <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>Iniciar Verificação com DIDIT <Icon name="arrowRight" size={16} /></div>}
          </button>
          
          {onBack && (
            <button className="btn btn-p" onClick={onBack} style={{ marginTop: 10, background: "#475569" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                <Icon name="arrowLeft" size={16} /> Voltar para a Calculadora
              </div>
            </button>
          )}

          <button className="btn btn-o" onClick={onLogout} style={{ marginTop: 10 }}>Sair</button>

          <div style={{ marginTop: 18, textAlign: "center" }}>
            <a href={`https://wa.me/244976344207?text=Olá!%20Estou%20com%20dificuldades%20na%20verificação%20automática%20do%20DIDIT%20na%20plataforma%20Bridge%20(ID:%20${user.id}).%20Gostaria%20de%20fazer%20a%20minha%20verificação%20de%20conta%20manualmente.`}
               target="_blank" rel="noopener noreferrer"
               style={{ color: "#6366f1", fontSize: 12, fontWeight: 700, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 6, transition: "color 0.2s" }}
               onMouseEnter={e => e.currentTarget.style.color = "#4f46e5"}
               onMouseLeave={e => e.currentTarget.style.color = "#6366f1"}>
              <Icon name="messageSquare" size={14} /> Problemas com o DIDIT? Verificação Manual 💬
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── RATES GRID — mini-card com as taxas de todas as moedas (USD/EUR/BRL/ZAR) ──
function RatesGrid({ applied, rate }) {
  const rates = [
    { id: "USD", flag: "🇺🇸", color: "#1a3a6e", value: applied },
    { id: "EUR", flag: "🇪🇺", color: "#003399", value: parseFloat(rate?.eur_rate) || null },
    { id: "BRL", flag: "🇧🇷", color: "#009c3b", value: parseFloat(rate?.brl_rate) || null },
    { id: "ZAR", flag: "🇿🇦", color: "#007B40", value: parseFloat(rate?.zar_rate) || null },
  ];
  return (
    <div className="metric-card" style={{ flexDirection: "column", alignItems: "stretch", gap: 10 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div className="metric-icon-box green">
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="7" y1="17" x2="17" y2="7" />
            <polyline points="7 7 17 7 17 17" />
          </svg>
        </div>
        <div className="metric-label">Taxas de Hoje</div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
        {rates.map(r => (
          <div key={r.id} style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "6px 10px", borderRadius: 9, background: "#f8fafc", border: "1px solid #f1f5f9"
          }}>
            <span style={{ fontSize: 11, fontWeight: 800, color: r.color, display: "flex", alignItems: "center", gap: 4 }}>
              <span style={{ fontSize: 13 }}>{r.flag}</span>{r.id}
            </span>
            <span style={{ fontSize: 11.5, fontWeight: 900, color: "#1e1b4b" }}>
              {r.value ? r.value.toLocaleString("pt-AO") : "—"} Kz
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}


// ── CLIENT ────────────────────────────────────────────────────────────────────
function ClientApp({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState("mercado"); // "mercado" or "perfil"
  const [marketCategory, setMarketCategory] = useState("comprar"); // "comprar", "vender", "meus_pedidos"
  const [searchQuery, setSearchQuery] = useState("");
  const [showCalculator, setShowCalculator] = useState(false);

  const [step, setStep] = useState(0);
  const [rate, setRate] = useState(() => {
    try {
      const cached = localStorage.getItem("bridge_rate");
      return cached ? JSON.parse(cached) : { base_rate: 1150, margin: 15, applied_rate: 1165 };
    } catch {
      return { base_rate: 1150, margin: 15, applied_rate: 1165 };
    }
  });
  const [rateAnim, setRateAnim] = useState(false);
  const [config, setConfig] = useState(() => {
    try {
      const cached = localStorage.getItem("bridge_config");
      return cached ? JSON.parse(cached) : {};
    } catch {
      return {};
    }
  });
  const [currentOrder, setOrder] = useState(null);
  const [orders, setOrders] = useState([]);
  const [showOrders, setShowO] = useState(false);
  const [ordersTab, setOrdersTab] = useState("my"); // "my" or "market"
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showExchangeReasonModal, setShowExchangeReasonModal] = useState(false);
  const [pendingCalcData, setPendingCalcData] = useState(null);
  const [pendingExchangeReason, setPendingExchangeReason] = useState("IM");
  const [pendingExchangeReasonDetail, setPendingExchangeReasonDetail] = useState("");
  const [kycStep, setKycStep] = useState(() => {
    try {
      const k = JSON.parse(localStorage.getItem("bridge_kyc"));
      let s = 0;
      if (k) {
        if (k.step_personal_done) s = 1;
        if (k.liveness_status && k.liveness_status !== "rejected") s = 2;
        if (k.ocr_status && k.ocr_status !== "rejected") s = 3;
      }
      return s;
    } catch {
      return 0;
    }
  });
  const [orderLoad, setOrdLoad] = useState(false);
  const [toast, setToast] = useState(null);
  const [kycLoading, setKycLoading] = useState(() => {
    try {
      const k = JSON.parse(localStorage.getItem("bridge_kyc"));
      const isComplete = k && k.ocr_status === "passed" && k.liveness_status === "passed";
      return !isComplete;
    } catch {
      return true;
    }
  });
  const [kycRecord, setKycRecord] = useState(() => {
    try {
      const cached = localStorage.getItem("bridge_kyc");
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  });

  const [showProfile, setShowProfile] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [destCurrencyFilter, setDestCurrencyFilter] = useState("ALL");
  const [showKycTrigger, setShowKycTrigger] = useState(false);
  const [newPwd, setNewPwd] = useState("");
  const [pwdLoad, setPwdLoad] = useState(false);
  const [profile, setProfile] = useState(() => {
    try {
      const cached = localStorage.getItem("bridge_profile");
      return cached ? JSON.parse(cached) : { full_name: "", phone: "", date_of_birth: "", nationality: "", whatsapp: "", address: "", kyc_status: "", avatar_url: "", payment_destinations: {}, cancelled_count: 0, last_cancelled_at: null, credits_balance: 0, credits_reserved: 0, total_spent_kz: 0 };
    } catch {
      return { full_name: "", phone: "", date_of_birth: "", nationality: "", whatsapp: "", address: "", kyc_status: "", avatar_url: "", payment_destinations: {}, cancelled_count: 0, last_cancelled_at: null, credits_balance: 0, credits_reserved: 0, total_spent_kz: 0 };
    }
  });
  const [profileLoad, setProfileLoad] = useState(false);
  const [showActivationScreen, setShowActivationScreen] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [accessFile, setAccessFile] = useState(null);
  const [accessFileLoad, setAccessFileLoad] = useState(false);
  const [recharges, setRecharges] = useState([]);
  const [selectedCreditPackage, setSelectedCreditPackage] = useState("standard");

  const [userRating, setUserRating] = useState({ avg: 0, total: 0 });
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 768);
  const [activeSettingsTab, setActiveSettingsTab] = useState("perfil");

  const [confirmState, setConfirmState] = useState({
    isOpen: false,
    title: "",
    message: "",
    confirmText: "Confirmar",
    cancelText: "Cancelar",
    onConfirm: () => {},
    onCancel: () => {}
  });

  const triggerConfirm = (title, message, onConfirm, confirmText = "Confirmar", cancelText = "Cancelar") => {
    setConfirmState({
      isOpen: true,
      title,
      message,
      confirmText,
      cancelText,
      onConfirm: () => {
        onConfirm();
        setConfirmState(prev => ({ ...prev, isOpen: false }));
      },
      onCancel: () => {
        setConfirmState(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  const toast_ = useCallback((msg, type = "ok") => {
    setToast({ msg, type }); setTimeout(() => setToast(null), 3000);
  }, []);

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 768);
    window.addEventListener("resize", handleResize);

    loadOrders(); // Load ratings and orders immediately

    fetchLatestRate().then(r => {
      setRate(r);
      localStorage.setItem("bridge_rate", JSON.stringify(r));
    }).catch(() => { });

    fetchAdminConfig().then(c => {
      setConfig(c);
      localStorage.setItem("bridge_config", JSON.stringify(c));
    }).catch(() => { });

    sb.from("profiles").select("full_name, phone, date_of_birth, nationality, whatsapp, address, kyc_status, avatar_url, payment_destinations, cancelled_count, last_cancelled_at, credits_balance, credits_reserved, total_spent_kz").eq("id", user.id).maybeSingle().then(({ data }) => {
      if (data) {
        const p = {
          full_name: data.full_name || "",
          phone: data.phone || "",
          date_of_birth: data.date_of_birth || "",
          nationality: data.nationality || "",
          whatsapp: data.whatsapp || "",
          address: data.address || "",
          kyc_status: data.kyc_status || "",
          avatar_url: data.avatar_url || "",
          payment_destinations: data.payment_destinations || {},
          cancelled_count: data.cancelled_count || 0,
          last_cancelled_at: data.last_cancelled_at || null,
          credits_balance: data.credits_balance || 0,
          credits_reserved: data.credits_reserved || 0,
          total_spent_kz: data.total_spent_kz || 0
        };
        setProfile(p);
        localStorage.setItem("bridge_profile", JSON.stringify(p));
      }
    }).catch(() => { });

    // Carregar recargas pendentes do utilizador (para mostrar o ecrã "Recarga em Validação" ao recarregar a página)
    sb.from("credit_recharges").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).then(({ data }) => {
      if (data) setRecharges(data);
    }).catch(() => { });

    const kycTimeout = setTimeout(() => {
      console.warn("[KYC] Timeout na verificação — a forçar kycLoading=false");
      setKycLoading(false);
    }, 2500);

    sb.from("kyc_verifications").select("*").eq("user_id", user.id)
      .order("created_at", { ascending: false }).limit(1).maybeSingle()
      .then(({ data: k }) => {
        clearTimeout(kycTimeout);
        let s = 0;
        if (k) {
          setKycRecord(k);
          localStorage.setItem("bridge_kyc", JSON.stringify(k));
          if (k.step_personal_done) s = 1;
          if (k.liveness_status && k.liveness_status !== "rejected") s = 2;
          if (k.ocr_status && k.ocr_status !== "rejected") s = 3;
        } else {
          localStorage.removeItem("bridge_kyc");
        }
        setKycStep(s);
        setKycLoading(false);
      }).catch((err) => {
        console.error("Erro ao carregar KYC:", err);
        clearTimeout(kycTimeout);
        setKycLoading(false);
      });

    const ch = sb.channel("client_ch")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "exchange_rates" }, p => {
        setRate(p.new); setRateAnim(true); setTimeout(() => setRateAnim(false), 900);
        localStorage.setItem("bridge_rate", JSON.stringify(p.new));
        toast_("Novo câmbio: " + parseFloat(p.new.applied_rate).toLocaleString("pt-AO") + " Kz/$");
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" },
        () => loadOrders())
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "kyc_verifications", filter: `user_id=eq.${user.id}` },
        (p) => {
          const k = p.new;
          setKycRecord(k);
          localStorage.setItem("bridge_kyc", JSON.stringify(k));
          let s = 0;
          if (k.step_personal_done) s = 1;
          if (k.liveness_status && k.liveness_status !== "rejected") s = 2;
          if (k.ocr_status && k.ocr_status !== "rejected") s = 3;
          setKycStep(s);
        })
      .subscribe();
    return () => {
      sb.removeChannel(ch);
      window.removeEventListener("resize", handleResize);
    };
  }, [user.id]);

  async function loadOrders() {
    const { data } = await sb.from("orders").select("*, profiles(full_name, avatar_url)").order("created_at", { ascending: false }).limit(100);
    
    let userRatingsMap = {};
    try {
      const { data: ratingData } = await sb
        .from("orders")
        .select("user_id, funder_id, buyer_rating, seller_rating")
        .or("buyer_rating.not.is.null,seller_rating.not.is.null");

      if (ratingData) {
        ratingData.forEach(o => {
          if (o.buyer_rating !== null && o.buyer_rating !== undefined) {
            if (!userRatingsMap[o.user_id]) userRatingsMap[o.user_id] = { sum: 0, count: 0 };
            userRatingsMap[o.user_id].sum += o.buyer_rating;
            userRatingsMap[o.user_id].count += 1;
          }
          if (o.seller_rating !== null && o.seller_rating !== undefined && o.funder_id) {
            if (!userRatingsMap[o.funder_id]) userRatingsMap[o.funder_id] = { sum: 0, count: 0 };
            userRatingsMap[o.funder_id].sum += o.seller_rating;
            userRatingsMap[o.funder_id].count += 1;
          }
        });
      }
    } catch (e) {
      console.error("Erro ao carregar classificações:", e);
    }

    if (data) {
      const ordersWithRatings = data.map(o => {
        const creatorRating = userRatingsMap[o.user_id];
        return {
          ...o,
          creator_rating: creatorRating ? creatorRating.sum / creatorRating.count : 0,
          creator_rating_count: creatorRating ? creatorRating.count : 0
        };
      });

      setOrders(ordersWithRatings);

      const ownRating = userRatingsMap[user.id];
      setUserRating({
        avg: ownRating ? ownRating.sum / ownRating.count : 0,
        total: ownRating ? ownRating.count : 0
      });

      setSelectedOrder(prev => {
        if (!prev) return null;
        const fresh = ordersWithRatings.find(o => o.id === prev.id);
        return fresh ? fresh : prev;
      });
      setOrder(prev => {
        if (!prev) return null;
        const fresh = ordersWithRatings.find(o => o.id === prev.id);
        return fresh ? fresh : prev;
      });
    }
  }


  async function handleCalcSubmit({ usd, aoa, dest, account, appliedRate, side, bank, currency }) {
    // Guardar dados do pedido e mostrar modal de motivo cambial (exigência BNA)
    setPendingCalcData({ usd, aoa, dest, account, appliedRate, side, bank, currency });
    setPendingExchangeReason("IM");
    setPendingExchangeReasonDetail("");
    setShowExchangeReasonModal(true);
  }

  async function handleCalcSubmitFinal({ usd, aoa, dest, account, appliedRate, side, bank, currency }) {
    const minUsd = parseFloat(config?.min_amount_usd) || 10;
    const maxUsd = parseFloat(config?.max_amount_usd) || 5000;

    if (usd < minUsd || usd > maxUsd) {
      toast_(`O valor deve estar entre $${minUsd} e $${maxUsd}.`, "err");
      return;
    }
    if (usd <= 0 || !account.trim()) return;

    // Se o utilizador não está verificado, impede a criação e abre o ecrã de KYC dinamicamente
    const isKycComplete = (profile?.kyc_status === "verified") || 
                          (kycRecord?.step_personal_done === true && 
                           kycRecord?.ocr_status === "passed" && 
                           kycRecord?.liveness_status === "passed");
    if (!isKycComplete) {
      setShowKycTrigger(true);
      return;
    }

    // NOTA: criar pedido é GRATUITO — não bloqueia por falta de créditos.
    // O crédito só é exigido e descontado no momento do matching (handleTransactOrder),
    // quando o vendedor aceita e o canal de comunicação é aberto entre as partes.

    // Verificar suspensão por excesso de cancelamentos (>= 3 cancelamentos nos últimos 30 dias)
    const cancelledCount = parseInt(profile?.cancelled_count || 0, 10);
    if (cancelledCount >= 3 && profile?.last_cancelled_at) {
      const lastCancel = new Date(profile.last_cancelled_at);
      const daysDiff = (new Date() - lastCancel) / (1000 * 60 * 60 * 24);
      if (daysDiff < 30) {
        const remainingDays = Math.ceil(30 - daysDiff);
        toast_(`A tua conta foi suspensa para novas ordens por 30 dias devido a cancelamentos repetidos. Restam ${remainingDays} dias.`, "err");
        return;
      }
    }

    setOrdLoad(true);

    // Verificar se o utilizador já tem um pedido ativo (limite de 1 por utilizador)
    try {
      const { count, error: countError } = await sb
        .from("orders")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .in("status", ["awaiting_payment", "pending", "processing"]);

      if (countError) {
        console.error("Erro ao verificar limite de pedidos ativos:", countError);
      } else if (count && count >= 1) {
        toast_("Limitação de uso: Só podes ter 1 pedido ativo simultaneamente.", "err");
        setOrdLoad(false);
        return;
      }
    } catch (e) {
      console.error(e);
    }

    const timeoutPromise = (promise, ms) => {
      return new Promise((resolve, reject) => {
        const timer = setTimeout(() => reject(new Error("TIMEOUT")), ms);
        promise
          .then((res) => {
            clearTimeout(timer);
            resolve(res);
          })
          .catch((err) => {
            clearTimeout(timer);
            reject(err);
          });
      });
    };

    try {
      const insertPromise = sb.from("orders").insert({
        user_id: user.id, amount_usd: usd, amount_aoa: aoa,
        rate_applied: appliedRate, destination: dest,
        destination_account: account,
        status: "awaiting_payment",
        side: side || "buy",
        payment_method: bank || "bai",
        currency: currency || "USD",
        currency_symbol: ({ USD: "$", EUR: "€", BRL: "R$", ZAR: "R" })[currency || "USD"],
        exchange_reason: pendingExchangeReason || "OU",
        exchange_reason_detail: pendingExchangeReasonDetail || null
      }).select().single();

      let result;
      try {
        result = await timeoutPromise(insertPromise, 5500);
      } catch (err) {
        if (err.message === "TIMEOUT") {
          console.warn("Criar pedido expirou. A tentar recuperar o pedido criado...");
          // Fallback query: check if order was actually inserted despite the network timeout!
          const nowStr = new Date(Date.now() - 30 * 1000).toISOString();
          const { data: recoveryData, error: recoveryError } = await sb
            .from("orders")
            .select("*")
            .eq("user_id", user.id)
            .eq("amount_usd", usd)
            .eq("destination", dest)
            .eq("destination_account", account)
            .eq("side", side || "buy")
            .gte("created_at", nowStr)
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle();

          if (!recoveryError && recoveryData) {
            console.log("Pedido recuperado com sucesso!", recoveryData);
            result = { data: recoveryData, error: null };
          } else {
            throw err;
          }
        } else {
          throw err;
        }
      }

      const { data, error } = result;

      if (error) {
        toast_(error.message, "err");
      } else {
        // Criar pedido é GRATUITO — sem desconto de crédito.
        // O crédito só é cobrado no momento do matching (ver handleTransactOrder),
        // porque é aí que a Bridge entrega o serviço real: abre o canal de
        // comunicação seguro entre as duas partes verificadas.
        setOrder(data); setStep(1);
        toast_("Pedido criado! Admin notificado.");
      }
    } catch (e) {
      console.error("Erro ao criar pedido:", e);
      if (e.message === "TIMEOUT") {
        toast_("A ligação falhou. A verificar se o pedido foi registado...", "err");
      } else {
        toast_(e.message || "Erro de ligação ao criar pedido. Tente novamente.", "err");
      }
    } finally {
      setOrdLoad(false);
    }
  }

  function resetFlow() { setStep(0); setOrder(null); }

  async function handleCancelOrder(orderId) {
    triggerConfirm(
      "Cancelar Pedido",
      "Tens a certeza que queres cancelar este pedido? Esta ação não pode ser desfeita.",
      async () => {
        const { error } = await sb.from("orders").update({ status: "cancelled" }).eq("id", orderId).eq("user_id", user.id);
        if (error) { toast_("Erro ao cancelar: " + error.message, "err"); }
        else {
          toast_("Pedido cancelado.");

          // ── Devolver crédito do comprador, SE o cancelamento acontecer depois do
          // matching (ou seja, o crédito já foi debitado em handleTransactOrder).
          // Se o pedido ainda estava só no mercado sem vendedor (awaiting_payment/pending),
          // nunca houve cobrança — criar pedido continua a ser gratuito.
          const cancelledOrder = orders.find(o => o.id === orderId) || currentOrder;
          if (cancelledOrder?.fee_debited_at) {
            const { data: freshProfile } = await sb.from("profiles").select("credits_balance").eq("id", user.id).maybeSingle();
            const newBalanceBack = (parseInt(freshProfile?.credits_balance || 0, 10)) + 1;
            const { error: refundErr } = await sb.from("profiles")
              .update({ credits_balance: newBalanceBack })
              .eq("id", user.id);
            if (!refundErr) {
              setProfile(prev => ({ ...prev, credits_balance: newBalanceBack }));
              await sb.from("credit_transactions").insert({
                user_id: user.id, order_id: orderId, type: "refund_cancel", amount: 1,
                balance_after: newBalanceBack
              });
            }
          }

          // Incrementar contador de cancelamentos no perfil
          const currentCount = parseInt(profile?.cancelled_count || 0, 10);
          const newCount = currentCount + 1;
          const nowIso = new Date().toISOString();
          
          const { error: profileError } = await sb.from("profiles").update({
            cancelled_count: newCount,
            last_cancelled_at: nowIso
          }).eq("id", user.id);

          if (!profileError) {
            const updatedP = { ...profile, cancelled_count: newCount, last_cancelled_at: nowIso };
            setProfile(updatedP);
            localStorage.setItem("bridge_profile", JSON.stringify(updatedP));
          } else {
            console.error("Erro ao atualizar contador de cancelamentos no perfil:", profileError);
          }

          const oRef = (orders.find(o => o.id === orderId) || currentOrder)?.order_ref || `#${orderId.slice(0, 8).toUpperCase()}`;
          sb.from("admin_alerts").insert({
            type: "cancelled",
            title: "Pedido Cancelado",
            body: `O cliente cancelou o pedido ${oRef}.`,
            order_id: orderId
          }).then();
          if (currentOrder?.id === orderId) resetFlow();
          loadOrders();
        }
      },
      "Sim, Cancelar",
      "Voltar"
    );
  }

  async function handleTransactOrder(orderId) {
    // NOTA IMPORTANTE: quem clica "Negociar" pode ser tanto o comprador como o
    // vendedor de USD — depende do lado do pedido original (side: "buy"/"sell").
    // O débito de crédito acontece para AMBAS as partes assim que o matching
    // ocorre, independentemente de quem tomou a iniciativa de aceitar o pedido.
    const availableCreditsPartner = (parseInt(profile?.credits_balance || 0, 10) - parseInt(profile?.credits_reserved || 0, 10));
    if (availableCreditsPartner < 1) {
      setShowActivationScreen(true);
      return;
    }
    triggerConfirm(
      "Iniciar Negociação P2P",
      "Confirmas que queres aceitar este pedido P2P e iniciar a correspondência com a outra parte? Este passo desconta 1 crédito (500 Kz) da tua carteira — é o que abre o canal de comunicação seguro entre vocês.",
      async () => {
        const { data: orderData, error } = await sb.from("orders").update({
          status: "processing",
          funder_id: user.id,
          admin_notes: `Correspondência P2P iniciada pelo parceiro ${user.email}`
        }).eq("id", orderId).select().maybeSingle();

        if (error) {
          toast_("Erro ao iniciar correspondência: " + error.message, "err");
        } else {
          // ── COBRANÇA NO MATCHING — momento em que o serviço é entregue de facto ──
          // O crédito é debitado AQUI, não na criação do pedido nem na conclusão.
          // É neste instante que a Bridge entrega o valor real: liga duas identidades
          // verificadas e abre um canal de comunicação seguro entre elas.
          // Acontece sempre dos DOIS lados — quem clicou "Negociar" agora (funder_id)
          // E quem criou o pedido originalmente (user_id) — não importa qual dos
          // dois é o "comprador" ou "vendedor" de USD nesta transacção específica.
          try {
            // Débito de quem está a aceitar o pedido agora (clicou "Negociar")
            const partnerNewBalance = Math.max(0, (parseInt(profile?.credits_balance || 0, 10)) - 1);
            await sb.from("profiles").update({ credits_balance: partnerNewBalance }).eq("id", user.id);
            setProfile(prev => ({ ...prev, credits_balance: partnerNewBalance }));
            await sb.from("credit_transactions").insert({
              user_id: user.id, order_id: orderId, type: "debit_matching", amount: -1, balance_after: partnerNewBalance
            });

            // Débito de quem criou o pedido originalmente
            if (orderData?.user_id) {
              const { data: creatorProfile } = await sb.from("profiles")
                .select("credits_balance, credits_reserved")
                .eq("id", orderData.user_id)
                .maybeSingle();
              if (creatorProfile) {
                const creatorAvailable = (parseInt(creatorProfile.credits_balance || 0, 10)) - (parseInt(creatorProfile.credits_reserved || 0, 10));
                if (creatorAvailable < 1) {
                  // O criador do pedido ficou sem créditos entre a criação e agora.
                  // Não bloqueamos quem aceitou — já pagou e o canal já abriu — mas
                  // registamos a situação para o admin acompanhar.
                  await sb.from("admin_alerts").insert({
                    type: "credit_warning",
                    title: "Criador do pedido sem créditos no matching",
                    body: `O utilizador que criou a transacção ${orderId} ficou sem créditos disponíveis no momento do matching. Pode ser necessário intervir.`,
                    order_id: orderId
                  });
                } else {
                  const creatorNewBalance = Math.max(0, (parseInt(creatorProfile.credits_balance || 0, 10)) - 1);
                  await sb.from("profiles").update({ credits_balance: creatorNewBalance }).eq("id", orderData.user_id);
                  await sb.from("credit_transactions").insert({
                    user_id: orderData.user_id, order_id: orderId, type: "debit_matching", amount: -1, balance_after: creatorNewBalance
                  });
                }
              }
            }

            await sb.from("orders").update({
              buyer_credit_reserved: true,
              seller_credit_reserved: true,
              fee_debited_at: new Date().toISOString()
            }).eq("id", orderId);
          } catch (creditErr) {
            console.error("Erro ao debitar créditos no matching:", creditErr);
          }

          toast_("Correspondência iniciada — canal de chat desbloqueado!");

          if (orderData) {
            await sb.from("chat_messages").insert({
              order_id: orderId,
              user_id: orderData.user_id,
              sender_id: user.id,
              sender_role: "partner",
              body: `👋 Olá! Aceitei o teu pedido P2P. Vamos conversar por aqui para transacionar com segurança.`
            });
          }

          sb.from("admin_alerts").insert({
            type: "payment_received",
            title: "Parceiro P2P Correspondido",
            body: `O usuário ${user.email} aceitou parear o pedido do usuário.`,
            order_id: orderId
          }).then();

          if (orderData) setSelectedOrder(orderData);
          loadOrders();
        }
      },
      "Confirmar e Iniciar",
      "Cancelar"
    );
  }

  async function handleUpdatePassword() {
    if (newPwd.length < 6) { toast_("A senha deve ter pelo menos 6 caracteres.", "err"); return; }
    setPwdLoad(true);
    const { error } = await sb.auth.updateUser({ password: newPwd });
    setPwdLoad(false);
    if (error) toast_("Erro ao alterar senha: " + error.message, "err");
    else { toast_("Palavra-passe atualizada com sucesso!"); setNewPwd(""); setShowProfile(false); }
  }

  async function handleUpdateProfile() {
    if (!profile.full_name?.trim() || !profile.phone?.trim()) { toast_("Preenche todos os campos obrigatórios.", "err"); return; }
    const cleanPhone = profile.phone.replace(/\D/g, "");
    const formattedPhone = cleanPhone.length === 9 ? `+244${cleanPhone}` : `+${cleanPhone}`;
    setProfileLoad(true);
    const { error } = await sb.from("profiles").update({
      full_name: profile.full_name,
      phone: formattedPhone,
      date_of_birth: profile.date_of_birth || null,
      nationality: profile.nationality || null,
      whatsapp: profile.whatsapp || null,
      address: profile.address || null,
      payment_destinations: profile.payment_destinations || {}
    }).eq("id", user.id);
    setProfileLoad(false);
    if (error) toast_("Erro ao atualizar: " + error.message, "err");
    else {
      toast_("Perfil atualizado com sucesso!");
      const p = {
        ...profile,
        phone: formattedPhone,
        date_of_birth: profile.date_of_birth,
        nationality: profile.nationality,
        whatsapp: profile.whatsapp,
        address: profile.address,
        payment_destinations: profile.payment_destinations || {}
      };
      setProfile(p);
      localStorage.setItem("bridge_profile", JSON.stringify(p));
      setIsEditingProfile(false);
    }
  }

  async function handleDeleteAccount() {
    triggerConfirm(
      "Apagar Conta Permanentemente",
      "ATENÇÃO! Tens a certeza absoluta que queres APAGAR a tua conta permanentemente?\n\nEsta acção não pode ser desfeita e perderás acesso a todo o teu histórico.",
      async () => {
        setProfileLoad(true);
        const { error } = await sb.rpc("delete_user");
        if (error) {
          toast_("Erro ao apagar conta: " + error.message, "err");
          setProfileLoad(false);
        } else {
          await sb.auth.signOut();
          window.location.reload();
        }
      },
      "Apagar Definitivamente",
      "Cancelar"
    );
  }

  async function handleAvatarUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    setAvatarUploading(true);
    try {
      const { signedUrl } = await uploadAvatar(user.id, file);
      if (signedUrl) {
        const { error } = await sb.from("profiles").update({ avatar_url: signedUrl }).eq("id", user.id);
        if (error) throw error;

        const updatedProfile = { ...profile, avatar_url: signedUrl };
        setProfile(updatedProfile);
        localStorage.setItem("bridge_profile", JSON.stringify(updatedProfile));
        toast_("Foto de perfil atualizada com sucesso!");
      }
    } catch (err) {
      toast_("Erro ao enviar foto: " + err.message, "err");
    } finally {
      setAvatarUploading(false);
    }
  }

  const handleProfileClick = () => {
    setSelectedOrder(null);
    setShowCalculator(false);
    setShowActivationScreen(false);
    if (activeTab === "perfil") {
      setActiveTab("mercado");
      setMarketCategory("comprar");
      setShowProfile(false);
      setShowO(false);
    } else {
      setActiveTab("perfil");
      setShowProfile(true);
      setShowO(false);
    }
  };

  const handleOrdersClick = () => {
    setSelectedOrder(null);
    setShowCalculator(false);
    setShowActivationScreen(false);
    if (activeTab === "mercado" && marketCategory === "meus_pedidos") {
      setMarketCategory("comprar");
      setShowO(false);
      setShowProfile(false);
    } else {
      setActiveTab("mercado");
      setMarketCategory("meus_pedidos");
      setShowO(true);
      setShowProfile(false);
      loadOrders();
    }
  };

  const destInfo = DESTS.find(d => d.id === currentOrder?.destination);
  const applied = parseFloat(rate.applied_rate) || 1165;

  if (kycLoading) return <div className="shell" style={{ display: "flex", alignItems: "center", justifyContent: "center", color: "#9ca3af", fontWeight: 600 }}>A verificar estado da conta...</div>;

  const isKycComplete = (profile?.kyc_status === "verified") || 
                        (kycRecord?.step_personal_done === true && 
                         kycRecord?.ocr_status === "passed" && 
                         kycRecord?.liveness_status === "passed");

  // SE KYC ESTÁ COMPLETO, MAS O ACESSO SEMANAL NÃO ESTÁ ACTIVO
  const userCredits = (parseInt(profile?.credits_balance || 0, 10) - parseInt(profile?.credits_reserved || 0, 10));
  const hasActiveAccess = userCredits >= 1;

  function renderSettingsTabs() {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {/* Tab Selector */}
        <div className="settings-tabs-container">
          {[
            { id: "perfil", label: "Perfil" },
            { id: "preferencias", label: "Preferências" },
            { id: "verificacao", label: "Verificação" },
            { id: "seguranca", label: "Segurança" },
            { id: "metodos", label: "Métodos de Pagamento" }
          ].map(t => (
            <button
              key={t.id}
              className={`settings-tab-btn${activeSettingsTab === t.id ? " active" : ""}`}
              onClick={() => {
                setActiveSettingsTab(t.id);
                setIsEditingProfile(false); // reset edit state when switching tabs
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeSettingsTab === "perfil" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {!isEditingProfile ? (
              <div className="card" style={{ padding: "20px 24px", background: "#fff", border: "1px solid #e2e8f0" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
                  <div style={{ fontSize: 15, fontWeight: 900, color: "#1e1b4b" }}>Dados Pessoais</div>
                  <button onClick={() => setIsEditingProfile(true)} style={{ background: "rgba(99,102,241,0.08)", border: "none", color: "#6366f1", borderRadius: 8, padding: "6px 12px", fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
                    <Icon name="edit" size={13} /> Editar
                  </button>
                </div>

                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 24, paddingBottom: 18, borderBottom: "1px solid #f1f5f9" }}>
                  <div
                    onClick={() => !avatarUploading && document.getElementById("avatar-upload-file").click()}
                    style={{
                      position: "relative",
                      width: 80,
                      height: 80,
                      borderRadius: "50%",
                      background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      overflow: "hidden",
                      boxShadow: "0 6px 16px rgba(99,102,241,0.18)",
                      border: "3px solid #fff"
                    }}
                  >
                    {avatarUploading ? (
                      <div style={{ color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", animation: "spin 1s linear infinite" }}>
                        <Icon name="loader" size={24} />
                      </div>
                    ) : profile.avatar_url ? (
                      <img src={profile.avatar_url} alt="Avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                      <div style={{ color: "#fff", fontSize: 24, fontWeight: 900 }}>
                        {profile.full_name?.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase() || "B"}
                      </div>
                    )}
                    <div className="avatar-overlay" style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "rgba(0,0,0,0.5)", color: "#fff", fontSize: 9, fontWeight: 800, padding: "4px 0", textAlign: "center", opacity: 0, transition: "opacity 0.2s", display: "flex", justifyContent: "center", alignItems: "center" }}>ALTERAR</div>
                  </div>
                  <input id="avatar-upload-file" type="file" style={{ display: "none" }} accept="image/*" onChange={handleAvatarUpload} />
                  <div style={{ fontSize: 13, fontWeight: 900, color: "#1e1b4b", marginTop: 8 }}>{profile.full_name || "Utilizador"}</div>
                  <div style={{ fontSize: 10, color: "#94a3b8", fontWeight: 700, marginTop: 2 }}>Clica no círculo para alterar a foto</div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  {[
                    { label: "Nome Completo", val: profile.full_name || "Não definido" },
                    { label: "E-mail", val: user.email, isSecure: true },
                    { label: "Endereço", val: profile.address || "Não definido" },
                    { label: "Número de Telefone", val: profile.phone || "Não definido" },
                    { label: "Data de Nascimento", val: profile.date_of_birth ? new Date(profile.date_of_birth).toLocaleDateString('pt-PT') : "Não definido" },
                    { label: "Nacionalidade", val: profile.nationality || "Não definido" },
                    { label: "WhatsApp", val: profile.whatsapp || "Não definido" },
                  ].map((item, idx) => (
                    <div key={idx} style={{ display: "flex", flexDirection: "column", paddingBottom: 10, borderBottom: idx < 6 ? "1px solid #f1f5f9" : "none" }}>
                      <span style={{ fontSize: 11, color: "#94a3b8", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 4 }}>{item.label}</span>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <span style={{ fontSize: 13, color: "#1e1b4b", fontWeight: 600 }}>{item.val}</span>
                        {item.isSecure && <Icon name="lock" size={12} color="#94a3b8" />}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="card" style={{ padding: "20px 24px", background: "#fff", border: "1px solid #e2e8f0" }}>
                <div style={{ fontSize: 15, fontWeight: 900, color: "#1e1b4b", marginBottom: 18 }}>Editar Dados Pessoais</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  <div>
                    <label className="lbl">Nome Completo</label>
                    <input className="inp" type="text" placeholder="Nome Completo" value={profile.full_name} onChange={e => setProfile({ ...profile, full_name: e.target.value })} />
                  </div>
                  <div>
                    <label className="lbl">Endereço</label>
                    <input className="inp" type="text" placeholder="Endereço" value={profile.address || ""} onChange={e => setProfile({ ...profile, address: e.target.value })} />
                  </div>
                  <div>
                    <label className="lbl">Número de Telefone</label>
                    <input className="inp" type="tel" placeholder="+244 9XX XXX XXX" value={profile.phone} onChange={e => setProfile({ ...profile, phone: e.target.value })} />
                  </div>
                  <div>
                    <label className="lbl">Data de Nascimento</label>
                    <input className="inp" type="date" value={profile.date_of_birth || ""} onChange={e => setProfile({ ...profile, date_of_birth: e.target.value })} />
                  </div>
                  <div>
                    <label className="lbl">Nacionalidade</label>
                    <input className="inp" type="text" placeholder="Nacionalidade" value={profile.nationality || ""} onChange={e => setProfile({ ...profile, nationality: e.target.value })} />
                  </div>
                  <div>
                    <label className="lbl">WhatsApp</label>
                    <input className="inp" type="tel" placeholder="WhatsApp" value={profile.whatsapp || ""} onChange={e => setProfile({ ...profile, whatsapp: e.target.value })} />
                  </div>

                  <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
                    <button className="btn btn-p" onClick={handleUpdateProfile} disabled={profileLoad} style={{ flex: 1 }}>
                      {profileLoad ? "A guardar..." : "Guardar Alterações"}
                    </button>
                    <button className="btn btn-o" onClick={() => setIsEditingProfile(false)} disabled={profileLoad} style={{ flex: 1, marginTop: 0 }}>
                      Cancelar
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Zona de Perigo em Perfil */}
            <div className="card" style={{ padding: "20px 24px", background: "#fff", border: "1px solid #fee2e2" }}>
              <div style={{ fontSize: 13, color: "#ef4444", marginBottom: 10, fontWeight: 800 }}>ZONA DE PERIGO</div>
              <div style={{ fontSize: 11.5, color: "#64748b", marginBottom: 14 }}>Esta acção irá eliminar permanentemente a tua conta e todos os teus dados da nossa plataforma. Esta acção é irreversível.</div>
              <button className="btn" style={{ background: "#fef2f2", border: "1px solid #fecaca", color: "#ef4444", fontWeight: 800 }} onClick={handleDeleteAccount} disabled={profileLoad}>
                Eliminar Conta
              </button>
            </div>
          </div>
        )}

        {activeSettingsTab === "preferencias" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Local Details matching Screenshot 3 */}
            <div className="card" style={{ padding: "20px 24px", background: "#fff", border: "1px solid #e2e8f0" }}>
              <div style={{ fontSize: 16, fontWeight: 900, color: "#1e1b4b", marginBottom: 6 }}>Detalhes locais</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: 16 }}>
                <div>
                  <label className="lbl">Moeda local (mostrada na taxa média do mercado)</label>
                  <select className="inp" style={{ background: "#fff", cursor: "pointer" }} defaultValue="aoa">
                    <option value="aoa">AOA - Kwanza</option>
                  </select>
                </div>
                <div>
                  <label className="lbl">Idioma</label>
                  <select className="inp" style={{ background: "#fff", cursor: "pointer" }} defaultValue="pt">
                    <option value="pt">PT - Português</option>
                  </select>
                </div>
                <div>
                  <label className="lbl">Fuso horário</label>
                  <select className="inp" style={{ background: "#fff", cursor: "pointer" }} defaultValue="luanda">
                    <option value="luanda">África/Luanda (UTC +01:00)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Secondary Email matching Screenshot 3 */}
            <div className="card" style={{ padding: "20px 24px", background: "#fff", border: "1px solid #e2e8f0" }}>
              <div style={{ fontSize: 16, fontWeight: 900, color: "#1e1b4b", marginBottom: 6 }}>Email secundário</div>
              <div style={{ fontSize: 12, color: "#64748b", lineHeight: 1.5, marginBottom: 14 }}>
                Use e-mails secundários para configurar métodos de pagamento com um e-mail diferente do e-mail principal associado à sua conta Airtm.
              </div>
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <input className="inp" type="email" placeholder="Insira o e-mail secundário" style={{ flex: 1 }} defaultValue="" />
                <button className="btn btn-o" style={{ width: "auto", margin: 0, whiteSpace: "nowrap", padding: "10px 16px" }} onClick={() => toast_("Envio de verificação simulado com sucesso!")}>
                  Verifique o e-mail secundário
                </button>
              </div>
              <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 8 }}>
                Principal: {user.email}
              </div>
            </div>
          </div>
        )}

        {activeSettingsTab === "verificacao" && (
          <div className="card" style={{ padding: "20px 24px", background: "#fff", border: "1px solid #e2e8f0" }}>
            <div style={{ fontSize: 16, fontWeight: 900, color: "#1e1b4b", marginBottom: 14 }}>Verificação de Identidade</div>
            {isKycComplete ? (
              <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "16px", background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 16 }}>
                <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#10b981", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Icon name="check" size={20} color="#fff" />
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 900, color: "#16a34a" }}>Conta Verificada (DIDIT KYC)</div>
                  <div style={{ fontSize: 12, color: "#15803d", fontWeight: 600, marginTop: 2 }}>Sua identidade foi confirmada e sua conta está totalmente aprovada para negociar no mercado P2P.</div>
                </div>
              </div>
            ) : (
              <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "16px", background: "#fffbeb", border: "1px solid #fef3c7", borderRadius: 16 }}>
                <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#f59e0b", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Icon name="alertTriangle" size={20} color="#fff" />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 900, color: "#d97706" }}>Identidade Não Verificada</div>
                  <div style={{ fontSize: 12, color: "#b45309", fontWeight: 600, marginTop: 2 }}>A sua conta encontra-se pendente de validação. Complete a verificação biométrica para transacionar sem limites.</div>
                </div>
                <button className="btn btn-p" style={{ width: "auto", padding: "10px 18px", fontSize: 12 }} onClick={() => setShowKycTrigger(true)}>
                  Verificar
                </button>
              </div>
            )}
          </div>
        )}

        {activeSettingsTab === "seguranca" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Security level progress matching Screenshot 4 */}
            <div className="card" style={{ padding: "20px 24px", background: "#fff", border: "1px solid #e2e8f0" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 18px", background: "#eff6ff", borderRadius: 16, border: "1px solid #bfdbfe", marginBottom: 20 }}>
                <div style={{ color: "#3b82f6", display: "flex", alignItems: "center" }}>
                  <Icon name="lock" size={24} color="#3b82f6" />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 900, color: "#1e3a8a" }}>Nível de segurança: 3/3</div>
                  <div style={{ fontSize: 11.5, color: "#2563eb", fontWeight: 700, marginTop: 2 }}>Seus fundos estão seguros.</div>
                </div>
              </div>

              {/* Password update form */}
              <div style={{ fontSize: 16, fontWeight: 900, color: "#1e1b4b", marginBottom: 12 }}>Senha</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div>
                  <label className="lbl">Nova palavra-passe</label>
                  <input className="inp" type="password" placeholder="Mínimo 6 caracteres" value={newPwd} onChange={e => setNewPwd(e.target.value)} />
                </div>
                <button className="btn btn-p" style={{ background: "#475569" }} onClick={handleUpdatePassword} disabled={pwdLoad}>
                  {pwdLoad ? "A guardar..." : "Alterar a senha"}
                </button>
              </div>
            </div>

            {/* 2FA switches matching Screenshot 4 */}
            <div className="card" style={{ padding: "20px 24px", background: "#fff", border: "1px solid #e2e8f0" }}>
              <div style={{ fontSize: 16, fontWeight: 900, color: "#1e1b4b", marginBottom: 4 }}>Autenticação de dois fatores (2FA)</div>
              <div style={{ fontSize: 12, color: "#64748b", marginBottom: 18 }}>Pode exigir a instalação de aplicativos em seu smartphone.</div>

              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 800, color: "#1e1b4b" }}>Iniciar sessão</div>
                    <div style={{ fontSize: 11, color: "#94a3b8" }}>Solicitar código 2FA ao fazer login</div>
                  </div>
                  <input type="checkbox" defaultChecked style={{ width: 40, height: 20 }} />
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #f1f5f9", paddingTop: 12 }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 800, color: "#1e1b4b" }}>Transações</div>
                    <div style={{ fontSize: 11, color: "#94a3b8" }}>Solicitar confirmação adicional para transacionar</div>
                  </div>
                  <input type="checkbox" defaultChecked style={{ width: 40, height: 20 }} />
                </div>
              </div>

              <button className="btn btn-p" style={{ marginTop: 20, background: "#6366f1" }} onClick={() => toast_("Definições 2FA reiniciadas")}>
                Reiniciar 2FA
              </button>
            </div>
          </div>
        )}

        {activeSettingsTab === "metodos" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Active Methods Display as Grid + Add Button matching Screenshot 5 */}
            <div className="card" style={{ padding: "20px 24px", background: "#fff", border: "1px solid #e2e8f0" }}>
              <div style={{ fontSize: 16, fontWeight: 900, color: "#1e1b4b", marginBottom: 16 }}>Métodos de Pagamento</div>
              
              {!isEditingProfile ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  {/* Grid layout */}
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12 }}>
                    {/* Add button card */}
                    <div
                      onClick={() => setIsEditingProfile(true)}
                      style={{
                        border: "2px dashed #cbd5e1",
                        borderRadius: 16,
                        padding: 20,
                        textAlign: "center",
                        cursor: "pointer",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 8,
                        minHeight: 120,
                        transition: "all 0.2s"
                      }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = "#6366f1"; e.currentTarget.style.background = "#f8faff"; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = "#cbd5e1"; e.currentTarget.style.background = "none"; }}
                    >
                      <span style={{ fontSize: 24, color: "#6366f1" }}>+</span>
                      <div style={{ fontSize: 12, fontWeight: 800, color: "#6366f1" }}>Adicionar novo método de pagamento</div>
                    </div>

                    {/* Active Cards */}
                    {Object.entries(profile.payment_destinations || {}).filter(([_, info]) => info.active && info.value).map(([id, info]) => {
                      const d = DESTS.find(x => x.id === id);
                      if (!d) return null;
                      return (
                        <div
                          key={id}
                          style={{
                            border: "1px solid #e2e8f0",
                            borderRadius: 16,
                            padding: 16,
                            background: "#fff",
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "space-between",
                            minHeight: 120,
                            boxShadow: "0 2px 6px rgba(0,0,0,0.02)"
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <div style={{ width: 28, height: 28, borderRadius: 8, background: d.logoBg || d.bg, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", flexShrink: 0 }}>
                              {d.logo
                                ? <img src={d.logo} alt={d.label} style={{ width: 28, height: 28, objectFit: "contain" }} onError={e => { e.target.style.display = "none"; }} />
                                : d.svg ? <div dangerouslySetInnerHTML={{ __html: d.svg }} /> : null
                              }
                            </div>
                            <div style={{ fontSize: 12, fontWeight: 800, color: "#1e1b4b" }}>{d.label}</div>
                          </div>
                          <div style={{ fontSize: 11, color: "#64748b", fontFamily: "monospace", marginTop: 12, wordBreak: "break-all" }}>{info.value}</div>
                        </div>
                      );
                    })}
                  </div>

                  <button className="btn btn-o" onClick={() => setIsEditingProfile(true)}>
                    Gerir Métodos de Pagamento
                  </button>
                </div>
              ) : (
                /* Configurator form */
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  <div style={{ fontSize: 13, fontWeight: 900, color: "#1e1b4b", marginBottom: 4 }}>Gerir Métodos de Recebimento</div>
                  <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 4 }}>
                    {[{ id: "ALL", label: "Todos", flag: "🌐" }, ...CURRENCIES].map(c => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setDestCurrencyFilter(c.id)}
                        style={{
                          flexShrink: 0, padding: "6px 12px", borderRadius: 18, fontSize: 11, fontWeight: 800,
                          border: (destCurrencyFilter || "ALL") === c.id ? "1.5px solid #6366f1" : "1.5px solid #e5e7eb",
                          background: (destCurrencyFilter || "ALL") === c.id ? "rgba(99,102,241,.08)" : "#fff",
                          color: (destCurrencyFilter || "ALL") === c.id ? "#4f46e5" : "#64748b",
                          cursor: "pointer", display: "flex", alignItems: "center", gap: 4
                        }}
                      >
                        <span>{c.flag}</span>{c.id === "ALL" ? c.label : c.id}
                      </button>
                    ))}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {DESTS.filter(d => {
                      const filt = destCurrencyFilter || "ALL";
                      if (filt === "ALL") return true;
                      const curDef = CURRENCIES.find(c => c.id === filt);
                      return curDef && (curDef.dests === null || curDef.dests.includes(d.id));
                    }).map(d => {
                      const active = !!profile.payment_destinations?.[d.id]?.active;
                      const val = profile.payment_destinations?.[d.id]?.value || "";
                      return (
                        <div key={d.id} style={{ display: "flex", flexDirection: "column", gap: 6, padding: 10, background: "#f8fafc", borderRadius: 10, border: "1px solid #e2e8f0" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <input
                              type="checkbox"
                              checked={active}
                              onChange={e => {
                                const updated = {
                                  ...profile.payment_destinations,
                                  [d.id]: { active: e.target.checked, value: val }
                                };
                                setProfile({ ...profile, payment_destinations: updated });
                              }}
                            />
                            <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                              <div style={{ width: 24, height: 24, borderRadius: 6, background: d.logoBg || d.bg, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", flexShrink: 0 }}>
                                {d.logo
                                  ? <img src={d.logo} alt={d.label} style={{ width: 24, height: 24, objectFit: "contain" }} onError={e => { e.target.style.display = "none"; }} />
                                  : d.svg ? <div dangerouslySetInnerHTML={{ __html: d.svg }} /> : null
                                }
                              </div>
                              <span style={{ fontSize: 12, fontWeight: 800, color: "#1e1b4b" }}>{d.label}</span>
                              <div style={{ display: "flex", gap: 3, marginLeft: 2 }}>
                                {CURRENCIES.filter(c => c.dests === null || c.dests.includes(d.id)).map(c => (
                                  <span key={c.id} title={c.label} style={{ fontSize: 10, opacity: 0.7 }}>{c.flag}</span>
                                ))}
                              </div>
                            </div>
                          </div>
                          {active && (
                            <input
                              className="inp"
                              style={{ padding: "6px 10px", fontSize: 11.5 }}
                              type="text"
                              placeholder={d.hint}
                              value={val}
                              onChange={e => {
                                const updated = {
                                  ...profile.payment_destinations,
                                  [d.id]: { active: true, value: e.target.value }
                                };
                                setProfile({ ...profile, payment_destinations: updated });
                              }}
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
                    <button className="btn btn-p" onClick={handleUpdateProfile} disabled={profileLoad} style={{ flex: 1 }}>
                      {profileLoad ? "A guardar..." : "Guardar Métodos"}
                    </button>
                    <button className="btn btn-o" onClick={() => setIsEditingProfile(false)} disabled={profileLoad} style={{ flex: 1, marginTop: 0 }}>
                      Cancelar
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  function renderActivationCard() {
    const isPending = recharges.find(r => r.status === "pending_payment");

    if (isPending) {
      return (
        <div className="card" style={{ padding: "28px 22px", textAlign: "center", border: "1.5px solid #f59e0b", borderRadius: 20, maxWidth: 500, margin: "20px auto" }}>
          <div style={{ width: 56, height: 56, borderRadius: "50%", background: "rgba(245,158,11,0.08)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", color: "#f59e0b" }}>
            <Icon name="clock" size={28} />
          </div>

          <h2 style={{ fontSize: 18, fontWeight: 900, color: "#1e1b4b", letterSpacing: "-0.4px", marginBottom: 6 }}>
            Recarga em Validação
          </h2>
          <div style={{ fontSize: 12, color: "#f59e0b", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 12 }}>
            Aguardando Aprovação ({isPending.amount_kz?.toLocaleString("pt-AO")} Kz · {isPending.credits_added} créditos)
          </div>
          <p style={{ fontSize: 12, color: "#6b7280", lineHeight: 1.6, marginBottom: 20, fontWeight: 500 }}>
            O teu comprovativo de pagamento foi enviado com sucesso e está sob análise. A validação dos créditos pode demorar até 24 horas, embora geralmente ocorra em poucos minutos. Agradecemos a paciência!
          </p>

          <button
            className="btn btn-p"
            onClick={() => setShowActivationScreen(false)}
            style={{ width: "100%", background: "linear-gradient(135deg,#6366f1,#8b5cf6)", boxShadow: "0 6px 16px rgba(99,102,241,0.2)" }}
          >
            Voltar ao Mercado
          </button>

          <button
            className="btn"
            onClick={async () => {
              triggerConfirm(
                "Cancelar Recarga",
                "Tens a certeza que queres cancelar esta recarga para enviar outro comprovativo?",
                async () => {
                  setAccessFileLoad(true);
                  const { error } = await sb.from("credit_recharges").update({ status: "cancelled" }).eq("id", isPending.id);
                  setAccessFileLoad(false);
                  if (error) {
                    toast_("Erro ao cancelar: " + error.message, "err");
                  } else {
                    toast_("Recarga cancelada. Podes carregar outro comprovativo.");
                    setRecharges(prev => prev.filter(r => r.id !== isPending.id));
                    setAccessFile(null);
                  }
                }
              );
            }}
            disabled={accessFileLoad}
            style={{ width: "100%", marginTop: 12, background: "rgba(239, 68, 68, 0.08)", color: "#ef4444", border: "1px solid rgba(239, 68, 68, 0.15)" }}
          >
            {accessFileLoad ? "A processar..." : "Cancelar e Enviar Outro Comprovativo"}
          </button>
        </div>
      );
    }

    const CREDIT_PACKAGES = [
      { id: "starter",  label: "Starter",  price: 2000,  credits: 4,  bonus: 0, popular: false },
      { id: "standard", label: "Standard", price: 5000,  credits: 11, bonus: 1, popular: true  },
      { id: "pro",      label: "Pro",      price: 10000, credits: 24, bonus: 4, popular: false },
      { id: "business", label: "Business", price: 25000, credits: 65, bonus: 15, popular: false },
    ];
    const selectedPkg = CREDIT_PACKAGES.find(p => p.id === selectedCreditPackage) || CREDIT_PACKAGES[1];

    return (
      <div className="card" style={{ padding: "28px 22px", textAlign: "center", border: "1.5px solid #6366f1", borderRadius: 20, maxWidth: 520, margin: "20px auto" }}>
        <div style={{ width: 56, height: 56, borderRadius: "50%", background: "rgba(99,102,241,0.08)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", color: "#6366f1" }}>
          <Icon name="creditCard" size={28} />
        </div>

        <h2 style={{ fontSize: 18, fontWeight: 900, color: "#1e1b4b", letterSpacing: "-0.4px", marginBottom: 6 }}>
          Carteira de Créditos
        </h2>
        <div style={{ fontSize: 12, color: "#64748b", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>
          Tens {userCredits} {userCredits === 1 ? "crédito" : "créditos"} disponíveis
        </div>
        <p style={{ fontSize: 12, color: "#6b7280", lineHeight: 1.6, marginBottom: 20, fontWeight: 500 }}>
          Criar um pedido é sempre grátis. O crédito (500 Kz) só é descontado quando encontras um
          parceiro e o canal de chat seguro é aberto — sem subscrição, sem mensalidade.
          Recarrega uma vez e usa os créditos quando quiseres.
        </p>

        {/* Pacotes de créditos */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>
          {CREDIT_PACKAGES.map(pkg => {
            const isSel = selectedCreditPackage === pkg.id || (!selectedCreditPackage && pkg.id === "standard");
            return (
              <div
                key={pkg.id}
                onClick={() => setSelectedCreditPackage(pkg.id)}
                style={{
                  position: "relative",
                  border: isSel ? "2px solid #6366f1" : "1.5px solid #e5e7eb",
                  background: isSel ? "#f5f6ff" : "#fff",
                  borderRadius: 14, padding: "14px 12px", cursor: "pointer", textAlign: "left",
                  transition: "all 0.15s"
                }}
              >
                {pkg.popular && (
                  <div style={{ position: "absolute", top: -9, right: 10, background: "#6366f1", color: "#fff", fontSize: 8.5, fontWeight: 900, padding: "2px 8px", borderRadius: 6, letterSpacing: 0.3 }}>
                    MAIS POPULAR
                  </div>
                )}
                <div style={{ fontSize: 12, fontWeight: 900, color: "#1e1b4b" }}>{pkg.label}</div>
                <div style={{ fontSize: 17, fontWeight: 900, color: "#4f46e5", marginTop: 4 }}>{pkg.price.toLocaleString("pt-AO")} Kz</div>
                <div style={{ fontSize: 10.5, color: "#64748b", fontWeight: 700, marginTop: 3 }}>
                  {pkg.credits} créditos {pkg.bonus > 0 && <span style={{ color: "#16a34a" }}>(+{pkg.bonus} bónus)</span>}
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ background: "#f8fafc", border: "1px dashed #cbd5e1", borderRadius: 12, padding: 14, textAlign: "left", marginBottom: 20 }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: "#475569", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6 }}>
            Dados para Transferência — {selectedPkg.price.toLocaleString("pt-AO")} Kz
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 12, color: "#1e1b4b", fontWeight: 600 }}>
            <div>Canal: <span style={{ color: "#4f46e5" }}>Multicaixa Express</span></div>
            <div>Número: <span style={{ color: "#4f46e5", fontFamily: "monospace" }}>952740023</span></div>
            <div>Destinatário: <span style={{ color: "#475569" }}>BridgeP2P</span></div>
          </div>
        </div>

        {/* Upload zone */}
        <div
          className={`upload-zone${accessFile ? " has-file" : ""}`}
          onClick={() => document.getElementById("access-pf-inp").click()}
          style={{ marginBottom: 20 }}
        >
          <input id="access-pf-inp" type="file" accept="image/jpeg,image/png,image/webp,application/pdf"
            style={{ display: "none" }}
            onChange={e => { if (e.target.files[0]) { setAccessFile(e.target.files[0]); } }} />
          <div className="up-icon">{accessFile ? <Icon name="file" size={24} style={{ color: "#10b981" }} /> : <Icon name="upload" size={24} style={{ color: "#6366f1" }} />}</div>
          <div className="up-title" style={{ fontSize: 13, fontWeight: 700, color: "#1e1b4b", marginTop: 8 }}>
            {accessFile ? accessFile.name : "Selecionar Comprovativo"}
          </div>
          <div className="up-sub" style={{ fontSize: 10, color: "#94a3b8", marginTop: 4 }}>
            {accessFile
              ? `${(accessFile.size / 1024).toFixed(1)} KB · ${accessFile.type}`
              : "PNG, JPG, WEBP ou PDF — máx. 5 MB"}
          </div>
        </div>

        <button
          className="btn btn-p"
          onClick={async () => {
            if (!accessFile) {
              toast_("Por favor, seleciona o comprovativo do pagamento.", "err");
              return;
            }
            setAccessFileLoad(true);
            try {
              const { path } = await uploadAccessProof(user.id, accessFile);
              const pkg = selectedPkg;
              const { data: rechargeData, error } = await sb.from("credit_recharges").insert({
                user_id: user.id,
                package_id: pkg.id,
                amount_kz: pkg.price,
                credits_added: pkg.credits + pkg.bonus,
                proof_url: path,
                status: "pending_payment"
              }).select().single();

              if (error) {
                toast_("Erro ao enviar comprovativo: " + error.message, "err");
              } else {
                toast_("Comprovativo enviado para validação com sucesso!");
                setRecharges(prev => [...prev, rechargeData]);
                setAccessFile(null);
              }
            } catch (err) {
              toast_("Erro no upload do ficheiro: " + err.message, "err");
            } finally {
              setAccessFileLoad(false);
            }
          }}
          disabled={accessFileLoad || !accessFile}
          style={{ width: "100%", background: "linear-gradient(135deg,#6366f1,#8b5cf6)", boxShadow: "0 6px 16px rgba(99,102,241,0.2)" }}
        >
          {accessFileLoad ? "A enviar..." : `Enviar Comprovativo — ${selectedPkg.credits + selectedPkg.bonus} créditos`}
        </button>

        <button
          className="btn"
          onClick={() => setShowActivationScreen(false)}
          style={{ width: "100%", marginTop: 12, background: "rgba(107, 114, 128, 0.08)", color: "#64748b", border: "1px solid rgba(148, 163, 184, 0.15)" }}
        >
          Voltar ao Mercado
        </button>

        <div style={{ fontSize: 10, color: "#94a3b8", fontWeight: 700, marginTop: 10 }}>
          Nota: 1 crédito = 500 Kz, descontado apenas no momento do matching com um parceiro. Sem expiração, sem mensalidade.
        </div>
      </div>
    );
  }

  function renderDesktopSettings() {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <div style={{ fontSize: 24, fontWeight: 900, color: "#1e1b4b", letterSpacing: "-0.5px" }}>
          Configurações da Conta
        </div>
        {renderSettingsTabs()}
      </div>
    );
  }

  function renderDesktopMarket() {
    if (showCalculator) {
      return (
        <div className="card" style={{ padding: 24, background: "#fff" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <h3 style={{ fontSize: 18, fontWeight: 900, color: "#1e1b4b" }}>Criar Nova Oferta P2P</h3>
            <button className="btn btn-o" style={{ width: "auto", margin: 0, padding: "8px 16px" }} onClick={() => setShowCalculator(false)}>
              Voltar ao Mercado
            </button>
          </div>
          <Calculator
            onClose={() => setShowCalculator(false)}
            onSubmit={handleCalcSubmit}
            user={user}
            config={config}
            profile={profile}
            appliedRate={applied}
            rate={rate}
            multiRates={{ EUR: parseFloat(rate.eur_rate) || null, BRL: parseFloat(rate.brl_rate) || null, ZAR: parseFloat(rate.zar_rate) || null }}
            loading={orderLoad}
            kycStep={kycStep}
          />
        </div>
      );
    }

    if (selectedOrder) {
      const isOwnOrder = selectedOrder.user_id === user.id;
      return (
        <div className="card" style={{ padding: 24, background: "#fff" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <h3 style={{ fontSize: 18, fontWeight: 900, color: "#1e1b4b" }}>
              Detalhes do Pedido P2P
            </h3>
            <button className="btn btn-o" style={{ width: "auto", margin: 0, padding: "8px 16px" }} onClick={() => setSelectedOrder(null)}>
              Voltar ao Mercado
            </button>
          </div>
          
          <TransactionCenter
            order={selectedOrder}
            currentUserId={user?.id}
            isCreator={isOwnOrder}
            onBack={() => { setSelectedOrder(null); loadOrders(); }}
            appliedRate={applied}
            sb={sb}
            toast={toast_}
          />
        </div>
      );
    }

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {/* Metric banner matching Airtm Dashboard center */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <RatesGrid applied={applied} rate={rate} />

          <div className="metric-card">
            <div className="metric-icon-box blue">
              <Icon name="shield" size={22} color="#3b82f6" />
            </div>
            <div className="metric-content">
              <div className="metric-label">Sua Confiança</div>
              <div className="metric-value">
                {userRating.total > 0 ? `${userRating.avg.toFixed(1)} ★` : "Sem avaliações"}
              </div>
              <div className="metric-bar-container">
                <div className="metric-bar-fill" style={{ width: userRating.total > 0 ? `${(userRating.avg / 5) * 100}%` : "0%" }} />
              </div>
            </div>
          </div>
        </div>

        {/* Hero Card */}
        <div className="purple-hero-card">
          <div className="purple-hero-icon">
            <Icon name="lock" size={20} color="#ffffff" />
          </div>
          <div className="purple-hero-text">
            Suas trocas são 100% garantidas · Transacione com segurança absoluta
          </div>
        </div>

        {/* Search & Actions Bar */}
        <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
          <div className="search-container" style={{ flex: 1, marginBottom: 0 }}>
            <div className="search-icon-box">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </div>
            <input
              type="text"
              className="search-input"
              placeholder="Procurar ofertas de compra ou venda..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>

          <button
            onClick={() => {
              if (!isKycComplete) {
                setShowKycTrigger(true);
              } else {
                resetFlow();
                setShowCalculator(true);
              }
            }}
            style={{
              background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
              border: "none",
              color: "#fff",
              borderRadius: 14,
              padding: "12px 24px",
              fontSize: 13,
              fontWeight: 800,
              display: "flex",
              alignItems: "center",
              gap: 8,
              cursor: "pointer",
              boxShadow: "0 6px 16px rgba(99,102,241,0.2)"
            }}
          >
            ➕ Criar Oferta
          </button>
        </div>

        {/* Category selector tabs */}
        <div style={{ display: "flex", gap: 8, background: "#f0efff", borderRadius: 13, padding: 6 }}>
          {[
            { id: "comprar", label: "Comprar USD" },
            { id: "vender", label: "Vender USD" },
            { id: "meus_pedidos", label: "Meus Pedidos P2P" }
          ].map(c => (
            <button
              key={c.id}
              onClick={() => setMarketCategory(c.id)}
              style={{
                flex: 1,
                padding: "10px",
                border: "none",
                borderRadius: 10,
                fontFamily: "inherit",
                fontSize: 13,
                fontWeight: 700,
                cursor: "pointer",
                transition: "all 0.2s",
                background: marketCategory === c.id ? "white" : "transparent",
                color: marketCategory === c.id ? "#1e1b4b" : "#6b7280",
                boxShadow: marketCategory === c.id ? "0 2px 8px rgba(0,0,0,.08)" : "none"
              }}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* Main listings */}
        <div className="card" style={{ padding: 24, background: "#fff" }}>
          <div style={{ fontWeight: 900, fontSize: 16, color: "#1e1b4b", marginBottom: 16 }}>
            {marketCategory === "meus_pedidos" ? "Os Meus Pedidos Ativos" : "Ofertas P2P Disponíveis no Mercado"}
          </div>
          <OrderList
            orders={orders.filter(o => {
              if (marketCategory === "comprar" && (o.side || "buy") !== "sell") return false;
              if (marketCategory === "vender" && (o.side || "buy") !== "buy") return false;

              if (!searchQuery.trim()) return true;
              const query = searchQuery.toLowerCase();
              return (
                o.destination_account?.toLowerCase().includes(query) ||
                o.amount_usd?.toString().includes(query) ||
                o.amount_aoa?.toString().includes(query) ||
                (o.order_ref && o.order_ref.toLowerCase().includes(query))
              );
            })}
            onCancel={handleCancelOrder}
            currentUserId={user?.id}
            onTransact={handleTransactOrder}
            isMarket={marketCategory !== "meus_pedidos"}
            onSelect={setSelectedOrder}
          />
        </div>
      </div>
    );
  }

  if (isDesktop) {
    return (
      <div className="app-layout">
        <style>{`
          body {
            background: #f4f6f9;
            overflow-x: hidden;
          }
        `}</style>
        <Toast toast={toast} />
        
        {/* Left Sidebar */}
        <div className="sidebar">
          <div className="sidebar-logo">
            <img src="/logo.svg" alt="Logo" className="logo-mark" style={{ objectFit: "contain", background: "none", boxShadow: "none" }} />
            <div>
              <div className="logo-text">Bridge</div>
              <div className="logo-sub">Câmbio Angola</div>
            </div>
          </div>
          
          <div className="sidebar-nav">
            <button
              className={`sidebar-link${activeTab === "mercado" ? " active" : ""}`}
              onClick={() => {
                setActiveTab("mercado");
                setSelectedOrder(null);
                setShowCalculator(false);
              }}
            >
              <Icon name="globe" size={16} />
              <span>Mercado</span>
            </button>
            
            <button
              className={`sidebar-link${activeTab === "perfil" ? " active" : ""}`}
              onClick={() => {
                setActiveTab("perfil");
                setSelectedOrder(null);
                setShowCalculator(false);
              }}
            >
              <Icon name="settings" size={16} />
              <span>Configurações</span>
            </button>
          </div>
          
          <div className="sidebar-footer">
            <a
              href="https://wa.me/244923000000"
              target="_blank"
              rel="noopener noreferrer"
              className="sidebar-link"
              style={{ color: "#25D366" }}
            >
              <span>💬 Suporte (WhatsApp)</span>
            </a>
            
            <button className="sidebar-link" style={{ color: "#ef4444" }} onClick={onLogout}>
              <Icon name="loader" size={16} color="#ef4444" className="spin" />
              <span>Sair</span>
            </button>
          </div>
        </div>
        
        {/* Main desktop area */}
        <div className="desktop-content">
          <div className="desktop-topbar">
            <div className="topbar-title">
              {activeTab === "mercado" ? "MERCADO P2P" : "CONFIGURAÇÕES"}
            </div>
            
            <div className="topbar-right">
              <button
                className="notification-bell"
                onClick={() => toast_("Não tem novas notificações", "ok")}
                title="Notificações"
              >
                <Icon name="bell" size={20} />
                <span className="bell-badge" />
              </button>
              
              <button
                className="user-avatar-btn"
                onClick={() => {
                  setActiveTab("perfil");
                  setSelectedOrder(null);
                  setShowCalculator(false);
                }}
                style={{ border: "none", background: "none", display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}
                title="Ver Perfil"
              >
                <div className="user-avatar-circle">
                  {profile.avatar_url ? (
                    <img src={profile.avatar_url} alt="Avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    profile.full_name?.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase() || "B"
                  )}
                </div>
                <div className="user-info-text">
                  <span className="user-name-label">{profile.full_name || user.email.split("@")[0]}</span>
                  <span className="user-email-label">{user.email}</span>
                </div>
              </button>
            </div>
          </div>
          
          <div style={{ padding: 32, flex: 1, overflowY: "auto" }}>
            {showKycTrigger ? (
              <div className="card" style={{ padding: 24, background: "#fff" }}>
                <KycOnboarding user={user} currentStep={kycStep} kycRecord={kycRecord} onLogout={onLogout} onBack={() => setShowKycTrigger(false)} />
              </div>
            ) : showActivationScreen ? (
              <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "80vh" }}>
                {renderActivationCard()}
              </div>
            ) : activeTab === "mercado" ? (
              renderDesktopMarket()
            ) : (
              renderDesktopSettings()
            )}
          </div>
        </div>
        
        <ConfirmModal
          isOpen={confirmState.isOpen}
          title={confirmState.title}
          message={confirmState.message}
          confirmText={confirmState.confirmText}
          cancelText={confirmState.cancelText}
          onConfirm={confirmState.onConfirm}
          onCancel={confirmState.onCancel}
        />
      </div>
    );
  }

  if (showKycTrigger) {
    return (
      <div className="shell" style={{ position: "relative", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
        <div className="blob b1" /><div className="blob b2" />
        <Toast toast={toast} />
        <Header appliedRate={applied} rateAnim={rateAnim} user={user} onLogout={onLogout}
          showOrders={showOrders} showProfile={showProfile}
          onOrdersClick={handleOrdersClick}
          onProfileClick={handleProfileClick}
          avatarUrl={profile?.avatar_url}
          creditsBalance={Math.max(0, (parseInt(profile?.credits_balance || 0, 10)) - (parseInt(profile?.credits_reserved || 0, 10)))}
          onCreditsClick={() => setShowActivationScreen(true)} />
        <KycOnboarding user={user} currentStep={kycStep} kycRecord={kycRecord} onLogout={onLogout} onBack={() => setShowKycTrigger(false)} />
      </div>
    );
  }

  // ── MODAL DE MOTIVO CAMBIAL (Exigência BNA / Lei Cambial Angola) ─────────────
  const EXCHANGE_REASONS = [
    { id: "IM", label: "Importação de mercadoria", desc: "Pagamento a fornecedores internacionais", icon: "📦" },
    { id: "SP", label: "Serviços / Propinas", desc: "Pagamento de propinas ou serviços no exterior", icon: "🎓" },
    { id: "RF", label: "Remessa familiar", desc: "Transferência para familiares no estrangeiro", icon: "👨‍👩‍👧" },
    { id: "PS", label: "Prestação de serviços", desc: "Recebimento por serviços prestados", icon: "💼" },
    { id: "VI", label: "Viagem internacional", desc: "Despesas de viagem ao exterior", icon: "✈️" },
    { id: "IN", label: "Investimento / Poupança", desc: "Reserva de valor ou investimento", icon: "📈" },
    { id: "OU", label: "Outro motivo", desc: "Motivo não listado — descrição obrigatória", icon: "📝" },
  ];

  if (showExchangeReasonModal && pendingCalcData) {
    return (
      <div style={{ minHeight: "100vh", background: "#f8fafc", display: "flex", flexDirection: "column" }}>
        {/* Header */}
        <div style={{ background: "linear-gradient(135deg, #1e1b4b, #312e81)", padding: "20px 20px 16px", display: "flex", alignItems: "center", gap: 12 }}>
          <button onClick={() => { setShowExchangeReasonModal(false); setPendingCalcData(null); }}
            style={{ background: "none", border: "none", color: "#a5b4fc", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 700 }}>
            <Icon name="arrowLeft" size={16} /> Voltar
          </button>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 16, fontWeight: 900, color: "#fff" }}>Declaração Cambial</div>
            <div style={{ fontSize: 11, color: "#a5b4fc" }}>Exigência do Banco Nacional de Angola</div>
          </div>
          <div style={{ fontSize: 22 }}>🏛️</div>
        </div>

        <div style={{ padding: "20px 16px", flex: 1 }}>
          {/* Explicação */}
          <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 12, padding: "12px 14px", marginBottom: 20, display: "flex", gap: 10, alignItems: "flex-start" }}>
            <span style={{ fontSize: 18, flexShrink: 0 }}>⚖️</span>
            <div style={{ fontSize: 12.5, color: "#92400e", lineHeight: 1.6 }}>
              <strong>Declaração obrigatória por lei.</strong> Ao abrigo da Lei Cambial de Angola e dos Avisos do BNA, todas as operações cambiais devem identificar o motivo da transacção. Esta informação é guardada e pode ser reportada à UIF.
            </div>
          </div>

          {/* Resumo do pedido */}
          <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0", padding: "14px 16px", marginBottom: 20 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>Resumo do Pedido</div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: 22, fontWeight: 900, color: "#059669" }}>${parseFloat(pendingCalcData.usd).toFixed(2)}</div>
                <div style={{ fontSize: 11, color: "#64748b" }}>{parseFloat(pendingCalcData.aoa).toLocaleString("pt-AO")} Kz • {pendingCalcData.dest?.toUpperCase?.()}</div>
              </div>
              <div style={{ fontSize: 12, color: "#6366f1", fontWeight: 700 }}>{pendingCalcData.appliedRate} AOA/$</div>
            </div>
          </div>

          {/* Selecção do motivo */}
          <div style={{ fontSize: 13, fontWeight: 700, color: "#1e293b", marginBottom: 12 }}>Qual o motivo desta operação cambial?</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
            {EXCHANGE_REASONS.map(r => (
              <button key={r.id}
                onClick={() => setPendingExchangeReason(r.id)}
                style={{
                  display: "flex", alignItems: "center", gap: 12,
                  background: pendingExchangeReason === r.id ? "#eef2ff" : "#fff",
                  border: `2px solid ${pendingExchangeReason === r.id ? "#6366f1" : "#e2e8f0"}`,
                  borderRadius: 12, padding: "12px 14px", cursor: "pointer",
                  transition: "all 0.15s", textAlign: "left"
                }}>
                <span style={{ fontSize: 22, flexShrink: 0 }}>{r.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: pendingExchangeReason === r.id ? "#4f46e5" : "#1e293b" }}>{r.label}</div>
                  <div style={{ fontSize: 11, color: "#64748b", marginTop: 1 }}>{r.desc}</div>
                </div>
                {pendingExchangeReason === r.id && (
                  <div style={{ width: 20, height: 20, borderRadius: "50%", background: "#6366f1", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <span style={{ color: "#fff", fontSize: 12, fontWeight: 900 }}>✓</span>
                  </div>
                )}
              </button>
            ))}
          </div>

          {/* Campo de detalhe para "Outro" */}
          {pendingExchangeReason === "OU" && (
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#374151", marginBottom: 6 }}>Descreve o motivo (obrigatório):</div>
              <textarea
                value={pendingExchangeReasonDetail}
                onChange={e => setPendingExchangeReasonDetail(e.target.value)}
                placeholder="Descreve o motivo da operação cambial..."
                rows={3}
                style={{ width: "100%", borderRadius: 10, border: "1px solid #d1d5db", padding: "10px 12px", fontSize: 13, resize: "none", fontFamily: "inherit" }}
              />
            </div>
          )}

          {/* Botão confirmar */}
          <button
            onClick={() => {
              if (pendingExchangeReason === "OU" && !pendingExchangeReasonDetail.trim()) {
                toast_("Descreve o motivo da operação para continuar.", "err");
                return;
              }
              setShowExchangeReasonModal(false);
              handleCalcSubmitFinal(pendingCalcData);
            }}
            style={{
              width: "100%", padding: "16px", borderRadius: 14, border: "none",
              background: "linear-gradient(135deg, #6366f1, #4f46e5)",
              color: "#fff", fontSize: 15, fontWeight: 800, cursor: "pointer"
            }}
          >
            Confirmar e Criar Pedido ▶
          </button>

          <div style={{ fontSize: 10.5, color: "#94a3b8", textAlign: "center", marginTop: 12, lineHeight: 1.5 }}>
            Ao confirmar, declaro que o motivo indicado é verdadeiro. Declaração falsa constitui crime cambial ao abrigo da Lei Cambial de Angola.
          </div>
        </div>
      </div>
    );
  }

  if (showActivationScreen) {
    return (
      <div className="shell" style={{ position: "relative", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
        <div className="blob b1" /><div className="blob b2" />
        <Toast toast={toast} />
        <Header appliedRate={applied} rateAnim={rateAnim} user={user} onLogout={onLogout}
          showOrders={showOrders} showProfile={showProfile}
          onOrdersClick={handleOrdersClick}
          onProfileClick={handleProfileClick}
          avatarUrl={profile?.avatar_url}
          creditsBalance={Math.max(0, (parseInt(profile?.credits_balance || 0, 10)) - (parseInt(profile?.credits_reserved || 0, 10)))}
          onCreditsClick={() => setShowActivationScreen(true)} />
        
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", padding: "24px 20px" }}>
          {renderActivationCard()}
        </div>
      </div>
    );
  }

  return (
    <div className="shell" style={{ position: "relative", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <div className="blob b1" /><div className="blob b2" />
      <Toast toast={toast} />
      
      {/* Branded Header matching screenshots */}
      <Header appliedRate={applied} rateAnim={rateAnim} user={user} onLogout={onLogout}
        showOrders={showOrders} showProfile={showProfile}
        onOrdersClick={handleOrdersClick}
        onProfileClick={handleProfileClick}
        avatarUrl={profile?.avatar_url}
        creditsBalance={Math.max(0, (parseInt(profile?.credits_balance || 0, 10)) - (parseInt(profile?.credits_reserved || 0, 10)))}
        onCreditsClick={() => setShowActivationScreen(true)} />

      <div className="pg" style={{ flex: 1, overflowY: "auto" }}>
        {activeTab === "perfil" ? (
          <>
            <div style={{ fontWeight: 900, fontSize: 17, color: "#1e1b4b", letterSpacing: "-.4px", marginBottom: 12 }}>
              Configurações
            </div>
            {renderSettingsTabs()}
          </>
        ) : (
          /* activeTab === "mercado" */
          selectedOrder ? (
            <TransactionCenter
              order={selectedOrder}
              user={user}
              onBack={() => { setSelectedOrder(null); loadOrders(); }}
              onCancel={handleCancelOrder}
            />
          ) : showCalculator ? (
            /* Calculator view toggled */
            <>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <button className="btn-g" onClick={() => setShowCalculator(false)} style={{ display: "flex", alignItems: "center", gap: 5, padding: "6px 12px", background: "rgba(99,102,241,0.06)", borderRadius: 10, border: "none", color: "#6366f1", cursor: "pointer", fontWeight: 800, fontSize: 12 }}>
                  <Icon name="arrowLeft" size={14} /> Voltar ao Mercado
                </button>
              </div>
              <StepBar step={step} />
              
              {step === 0 && (
                <Calculator appliedRate={applied} rate={rate} onSubmit={handleCalcSubmit}
                  multiRates={{ EUR: parseFloat(rate.eur_rate) || null, BRL: parseFloat(rate.brl_rate) || null, ZAR: parseFloat(rate.zar_rate) || null }}
                  loading={orderLoad} user={user} kycStep={kycStep} config={config} />
              )}

              {step === 1 && currentOrder && (
                <>
                  <div style={{ fontWeight: 900, fontSize: 19, color: "#1e1b4b", marginBottom: 3, letterSpacing: "-.5px" }}>Resumo do pedido</div>
                  <div style={{ fontSize: 12, color: "#9ca3af", marginBottom: 14, fontWeight: 500 }}>Confirma os detalhes</div>
                  <div className="card">
                    <div className="o-ref">{currentOrder.order_ref ?? "#" + currentOrder.id.slice(0, 8).toUpperCase()}</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "10px 0 13px" }}>
                      <div style={{ width: 46, height: 46, borderRadius: 13, background: destInfo?.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}
                        dangerouslySetInnerHTML={{ __html: destInfo?.svg ?? "" }} />
                      <div>
                        <div style={{ fontSize: 26, fontWeight: 900, color: "#1e1b4b", letterSpacing: -1 }}>${parseFloat(currentOrder.amount_usd).toFixed(2)}</div>
                        <div style={{ fontSize: 11, color: "#9ca3af", fontWeight: 600 }}>{parseFloat(currentOrder.amount_aoa).toLocaleString("pt-AO")} Kz · taxa {parseFloat(currentOrder.rate_applied).toLocaleString("pt-AO")} Kz/$</div>
                      </div>
                    </div>
                    {[
                      currentOrder.side === "sell" ? ["Origem USD", `${destInfo?.label}`] : ["Destino USD", `${destInfo?.label}`],
                      currentOrder.side === "sell" ? ["Conta Kwanza (IBAN)", currentOrder.destination_account] : ["Conta USD", currentOrder.destination_account],
                      ["Referência", currentOrder.order_ref]
                    ].map(([l, v]) => (
                      <div key={l} className="sum-row"><span className="sum-l">{l}</span><span className="sum-v">{v}</span></div>
                    ))}
                  </div>
                  <button className="btn btn-p" onClick={() => setStep(2)}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                      Já paguei — Enviar comprovante <Icon name="arrowRight" size={14} />
                    </div>
                  </button>
                  <button className="btn btn-o" onClick={() => handleCancelOrder(currentOrder.id)}><div style={{ display: "flex", alignItems: "center", gap: 6, justifyContent: "center" }}><Icon name="arrowLeft" size={14} /> Cancelar pedido</div></button>
                </>
              )}

              {step === 2 && currentOrder && (
                <ProofUpload order={currentOrder} user={user} config={config}
                  onSuccess={() => setStep(3)} onBack={() => setStep(1)} />
              )}

              {step === 3 && (
                <div className="succ">
                  <div className="succ-ico"><Icon name="checkCircle" size={60} color="#10b981" /></div>
                  <div className="succ-title">Pedido submetido!</div>
                  <div className="succ-sub">
                    O teu comprovante foi enviado.<br />
                    O admin vai verificar e enviar os dólares<br />
                    para a tua conta <strong>{destInfo?.label}</strong>.
                  </div>
                  {currentOrder && (
                    <div className="card" style={{ textAlign: "left", marginTop: 18 }}>
                      <div className="o-ref">{currentOrder.order_ref ?? "#" + currentOrder.id.slice(0, 8).toUpperCase()}</div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
                        <div>
                          <div style={{ fontSize: 20, fontWeight: 900, color: "#6366f1" }}>${parseFloat(currentOrder.amount_usd).toFixed(2)}</div>
                          <div style={{ fontSize: 11, color: "#9ca3af", fontWeight: 600 }}>{parseFloat(currentOrder.amount_aoa).toLocaleString("pt-AO")} Kz</div>
                        </div>
                        <span className="pill" style={{ background: "#eff6ff", color: "#2563eb", display: "flex", alignItems: "center", gap: 4 }}><Icon name="file" size={12} /> Comprovante OK</span>
                      </div>
                    </div>
                  )}
                  <button className="btn btn-p" style={{ marginTop: 16 }} onClick={() => { resetFlow(); setShowCalculator(false); }}>Nova transação</button>
                  <button className="btn btn-o" onClick={() => { setSelectedOrder(currentOrder); setShowCalculator(false); loadOrders(); }}><div style={{ display: "flex", alignItems: "center", gap: 6, justifyContent: "center" }}><Icon name="clipboard" size={14} /> Ver todos os pedidos</div></button>
                </div>
              )}
            </>
          ) : (
            /* Home/Market dashboard view active */
            <>
              {/* Branded metrics cards matching Screenshot 1 */}
              <RatesGrid applied={applied} rate={rate} />

              <div className="metric-card">
                <div className="metric-icon-box blue">
                  <Icon name="shield" size={22} color="#3b82f6" />
                </div>
                <div className="metric-content">
                  <div className="metric-label">Sua Confiança</div>
                  <div className="metric-value">
                    {userRating.total > 0 ? `${userRating.avg.toFixed(1)} ★` : "Sem avaliações"}
                  </div>
                  <div className="metric-bar-container">
                    <div className="metric-bar-fill" style={{ width: userRating.total > 0 ? `${(userRating.avg / 5) * 100}%` : "0%" }} />
                  </div>
                </div>
              </div>

              {/* Purple Safety Hero Card */}
              <div className="purple-hero-card">
                <div className="purple-hero-icon">
                  <Icon name="lock" size={20} color="#ffffff" />
                </div>
                <div className="purple-hero-text">
                  Suas trocas são 100% garantidas
                </div>
              </div>

              {/* Search Box matching Screenshot 2 */}
              <div className="search-container">
                <div className="search-icon-box">
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                </div>
                <input
                  type="text"
                  className="search-input"
                  placeholder="Procurar ofertas..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Category selector pills matching Screenshot 2 */}
              <div style={{ display: "flex", gap: 4, background: "#f0efff", borderRadius: 13, padding: 4, marginBottom: 16 }}>
                {[
                  { id: "comprar", label: "Comprar" },
                  { id: "vender", label: "Vender" },
                  { id: "meus_pedidos", label: "Meus Pedidos" }
                ].map(c => (
                  <button
                    key={c.id}
                    onClick={() => setMarketCategory(c.id)}
                    style={{
                      flex: 1,
                      padding: "9px",
                      border: "none",
                      borderRadius: 10,
                      fontFamily: "inherit",
                      fontSize: 13,
                      fontWeight: 700,
                      cursor: "pointer",
                      transition: "all 0.2s",
                      background: marketCategory === c.id ? "white" : "transparent",
                      color: marketCategory === c.id ? "#1e1b4b" : "#6b7280",
                      boxShadow: marketCategory === c.id ? "0 2px 8px rgba(0,0,0,.08)" : "none"
                    }}
                  >
                    {c.label}
                  </button>
                ))}
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <div style={{ fontWeight: 900, fontSize: 16, color: "#1e1b4b", letterSpacing: "-.4px" }}>
                  {marketCategory === "meus_pedidos" ? "Os Meus Pedidos" : "Ofertas Recomendadas"}
                </div>
                {marketCategory !== "meus_pedidos" && (
                  <button
                    onClick={() => {
                      const isKycComp = (profile?.kyc_status === "verified") || 
                                        (kycRecord?.step_personal_done === true && 
                                         kycRecord?.ocr_status === "passed" && 
                                         kycRecord?.liveness_status === "passed");
                      if (!isKycComp) {
                        setShowKycTrigger(true);
                      } else {
                        resetFlow();
                        setShowCalculator(true);
                      }
                    }}
                    style={{
                      background: "rgba(99,102,241,0.08)",
                      border: "none",
                      color: "#6366f1",
                      borderRadius: 8,
                      padding: "6px 12px",
                      fontSize: 11,
                      fontWeight: 800,
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                      cursor: "pointer"
                    }}
                  >
                    ➕ Criar Oferta
                  </button>
                )}
              </div>

              {/* public/private list */}
              <OrderList
                orders={orders.filter(o => {
                  // 1. Filtrar por lado da oferta P2P (Comprar USD mostra quem vende; Vender USD mostra quem compra)
                  if (marketCategory === "comprar" && (o.side || "buy") !== "sell") return false;
                  if (marketCategory === "vender" && (o.side || "buy") !== "buy") return false;

                  // 2. Filtrar por barra de pesquisa
                  if (!searchQuery.trim()) return true;
                  const query = searchQuery.toLowerCase();
                  return (
                    o.destination_account?.toLowerCase().includes(query) ||
                    o.amount_usd?.toString().includes(query) ||
                    o.amount_aoa?.toString().includes(query) ||
                    (o.order_ref && o.order_ref.toLowerCase().includes(query))
                  );
                })}
                onCancel={handleCancelOrder}
                currentUserId={user?.id}
                onTransact={handleTransactOrder}
                isMarket={marketCategory !== "meus_pedidos"}
                onSelect={setSelectedOrder}
              />
            </>
          )
        )}
        {!selectedOrder && !showCalculator && <div className="content-nav-spacer" />}
      </div>

      {/* Floating Bottom Nav matching screenshots */}
      {!selectedOrder && !showCalculator && (
        <div className="bottom-nav">
          <button
            className={`bottom-nav-item${activeTab === "mercado" ? " active" : ""}`}
            onClick={() => {
              setActiveTab("mercado");
              setSelectedOrder(null);
              setShowCalculator(false);
            }}
          >
            <Icon name="globe" size={20} color={activeTab === "mercado" ? "#ffffff" : "#8b92a9"} />
            MERCADO
          </button>
          <button
            className={`bottom-nav-item${activeTab === "perfil" ? " active" : ""}`}
            onClick={() => {
              setActiveTab("perfil");
              setSelectedOrder(null);
              setShowCalculator(false);
            }}
          >
            <Icon name="user" size={20} color={activeTab === "perfil" ? "#ffffff" : "#8b92a9"} />
            PERFIL
          </button>
        </div>
      )}
      <ConfirmModal
        isOpen={confirmState.isOpen}
        title={confirmState.title}
        message={confirmState.message}
        confirmText={confirmState.confirmText}
        cancelText={confirmState.cancelText}
        onConfirm={confirmState.onConfirm}
        onCancel={confirmState.onCancel}
      />
    </div>
  );
}

// ── ROOT ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [user, setUser] = useState(null);
  const [isAdmin, setAdmin] = useState(false);
  const [ready, setReady] = useState(false);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem("theme") === "dark");

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  useEffect(() => {
    // Timeout de segurança: se a sessão não resolver em 2.5s, mostra a app na mesma
    const safetyTimeout = setTimeout(() => {
      console.warn("[Auth] Timeout — a forçar ready=true");
      setReady(true);
    }, 2500);

    sb.auth.getSession()
      .then(async ({ data }) => {
        try {
          const u = data?.session?.user ?? null;
          setUser(u);
          if (u) setAdmin(await checkIsAdmin(u.id));
        } finally {
          clearTimeout(safetyTimeout);
          setReady(true);
        }
      })
      .catch((err) => {
        console.error("Erro de sessão:", err);
        clearTimeout(safetyTimeout);
        setReady(true);
      });

    const { data: { subscription } } = sb.auth.onAuthStateChange(async (_e, s) => {
      const u = s?.user ?? null;
      if (u) {
        setUser(u);
        checkIsAdmin(u.id).then(isAdm => {
          setAdmin(isAdm);
        }).catch(() => {
          setAdmin(false);
        });
      } else {
        setAdmin(false);
        setUser(null);
      }

      // Se o cliente clicar no link do email para recuperar senha, ele cai aqui!
      if (_e === "PASSWORD_RECOVERY") {
        const newPassword = window.prompt("Insere a tua nova palavra-passe (mínimo 6 caracteres):");
        if (newPassword && newPassword.length >= 6) {
          const { error } = await sb.auth.updateUser({ password: newPassword });
          if (error) alert("Erro ao atualizar a senha: " + error.message);
          else alert("Palavra-passe atualizada com sucesso! A tua conta está segura.");
        } else {
          alert("Palavra-passe inválida. Recuperação cancelada.");
        }
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  async function handleLogout() {
    try {
      localStorage.removeItem("bridge_rate");
      localStorage.removeItem("bridge_config");
      localStorage.removeItem("bridge_profile");
      localStorage.removeItem("bridge_kyc");
    } catch (e) {
      console.error(e);
    }
    try {
      setUser(null);
      setAdmin(false);
      await sb.auth.signOut();
    } catch (e) {
      console.error("Erro ao fazer signOut:", e);
    } finally {
      window.location.reload();
    }
  }

  if (!ready) return (
    <>
      <style>{CSS}</style>
      <div className="shell" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ color: "#9ca3af", fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", gap: 8 }}><Icon name="loader" size={20} className="spin" color="#6366f1" /> A carregar a tua sessão...</div>
      </div>
    </>
  );

  return (
    <>
      <style>{CSS}</style>
      <style>{`
        /* Smart Dark Mode (Filtro Inverso + Rotação de Matiz) */
        html.dark {
          filter: invert(1) hue-rotate(180deg);
          background: #0f172a;
        }
        html.dark img,
        html.dark video,
        html.dark .blob,
        html.dark .dest-logo,
        html.dark .adm-logo {
          filter: invert(1) hue-rotate(180deg); /* Duplo inverso para manter as cores originais das imagens */
        }
        html.dark .shell, html.dark .adm-shell { background: transparent; }
      `}</style>
      {!user ? <AuthScreen /> : isAdmin ? <AdminPanel user={user} onLogout={handleLogout} /> : <ClientApp user={user} onLogout={handleLogout} />}

      {/* Botão Flutuante de Modo Escuro Universal */}
      <button
        onClick={() => setDarkMode(!darkMode)}
        title="Alternar Modo Escuro"
        style={{
          position: "fixed", bottom: 24, right: 24, zIndex: 9999,
          background: darkMode ? "#1e1b4b" : "#fff", color: darkMode ? "#fff" : "#1e1b4b",
          border: "1px solid rgba(0,0,0,0.1)", borderRadius: "50%", width: 50, height: 50,
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 10px 25px rgba(0,0,0,0.2)", cursor: "pointer", transition: "transform 0.2s"
        }}
        onMouseEnter={e => e.currentTarget.style.transform = "scale(1.1)"}
        onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
      >
        <Icon name={darkMode ? "sun" : "moon"} size={22} />
      </button>
    </>
  );
}
