import { useState, useEffect, useCallback } from "react";
import { sb, checkIsAdmin, fetchLatestRate, fetchAdminConfig, uploadKycDocument, uploadAvatar } from "./lib/supabase.js";
import { CSS, DESTS } from "./lib/constants.js";
import { Toast, StepBar, Header, Icon, ConfirmModal } from "./components/shared/UI.jsx";
import { Calculator } from "./components/client/Calculator.jsx";
import { ProofUpload } from "./components/client/ProofUpload.jsx";
import { OrderList } from "./components/client/OrderList.jsx";
import { TransactionCenter } from "./components/client/TransactionCenter.jsx";
import { AdminPanel } from "./components/admin/AdminPanel.jsx";


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

  return (
    <div className="shell">
      <style>{`.spin { animation: spin 1s linear infinite; } @keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
      <div className="blob b1" /><div className="blob b2" />
      <div style={{ position: "relative", zIndex: 2, padding: "44px 22px" }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ width: 62, height: 62, borderRadius: 18, background: "linear-gradient(135deg,#6366f1,#8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px", boxShadow: "0 10px 28px rgba(99,102,241,.45)" }}>
            <svg viewBox="185 -45 500 500" width="34" height="34">
              <path d="M 230,300 C 230,170 310,120 375,120 C 420,120 445,160 445,210" fill="none" stroke="#fff" strokeWidth="36" strokeLinecap="butt" strokeLinejoin="round" />
              <path d="M 425,210 C 425,160 450,120 495,120 C 560,120 640,170 640,300" fill="none" stroke="#fff" strokeWidth="36" strokeLinecap="butt" strokeLinejoin="round" />
              <path d="M 375,120 C 375,170 350,260 350,300" fill="none" stroke="#fff" strokeWidth="36" strokeLinecap="butt" strokeLinejoin="round" />
              <path d="M 362,210 C 390,190 410,165 445,150" fill="none" stroke="#fff" strokeWidth="36" strokeLinecap="butt" strokeLinejoin="round" />
              <path d="M 362,210 C 390,230 435,260 490,300" fill="none" stroke="#fff" strokeWidth="36" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M 200,210 L 670,210" fill="none" stroke="#fff" strokeWidth="36" strokeLinecap="butt" strokeLinejoin="round" />
            </svg>
          </div>
          <div style={{ fontSize: 24, fontWeight: 900, color: "#1e1b4b", letterSpacing: -1 }}>Bridge</div>
          <div style={{ fontSize: 12, color: "#6b7280", fontWeight: 600, marginTop: 3 }}>Marketplace AOA/USD · Angola</div>
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
      fetch("/api/didit-session", {
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

      const res = await fetch("/api/didit-session", {
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
        <div style={{ fontSize: 13, color: "#6b7280", fontWeight: 600, marginTop: 10, maxWidth: 300, lineHeight: 1.5 }}>A tua identidade está a ser verificada pela nossa equipa. Por favor, aguarda a aprovação.</div>
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
  const [showKycTrigger, setShowKycTrigger] = useState(false);
  const [newPwd, setNewPwd] = useState("");
  const [pwdLoad, setPwdLoad] = useState(false);
  const [profile, setProfile] = useState(() => {
    try {
      const cached = localStorage.getItem("bridge_profile");
      return cached ? JSON.parse(cached) : { full_name: "", phone: "", date_of_birth: "", nationality: "", whatsapp: "", address: "", kyc_status: "", avatar_url: "", access_status: "inactive", access_expires_at: null, payment_destinations: {}, cancelled_count: 0, last_cancelled_at: null };
    } catch {
      return { full_name: "", phone: "", date_of_birth: "", nationality: "", whatsapp: "", address: "", kyc_status: "", avatar_url: "", access_status: "inactive", access_expires_at: null, payment_destinations: {}, cancelled_count: 0, last_cancelled_at: null };
    }
  });
  const [profileLoad, setProfileLoad] = useState(false);
  const [showActivationScreen, setShowActivationScreen] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);

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
    fetchLatestRate().then(r => {
      setRate(r);
      localStorage.setItem("bridge_rate", JSON.stringify(r));
    }).catch(() => { });

    fetchAdminConfig().then(c => {
      setConfig(c);
      localStorage.setItem("bridge_config", JSON.stringify(c));
    }).catch(() => { });

    sb.from("profiles").select("full_name, phone, date_of_birth, nationality, whatsapp, address, kyc_status, avatar_url, access_status, access_expires_at, payment_destinations, cancelled_count, last_cancelled_at").eq("id", user.id).maybeSingle().then(({ data }) => {
      if (data) {
        let currentStatus = data.access_status || "inactive";
        if (data.access_expires_at && new Date() > new Date(data.access_expires_at) && (currentStatus === "active" || currentStatus === "expiring_soon")) {
          currentStatus = "expired";
          sb.from("profiles").update({ access_status: "expired" }).eq("id", user.id).then();
        }
        
        const p = {
          full_name: data.full_name || "",
          phone: data.phone || "",
          date_of_birth: data.date_of_birth || "",
          nationality: data.nationality || "",
          whatsapp: data.whatsapp || "",
          address: data.address || "",
          kyc_status: data.kyc_status || "",
          avatar_url: data.avatar_url || "",
          access_status: currentStatus,
          access_expires_at: data.access_expires_at || null,
          payment_destinations: data.payment_destinations || {},
          cancelled_count: data.cancelled_count || 0,
          last_cancelled_at: data.last_cancelled_at || null
        };
        setProfile(p);
        localStorage.setItem("bridge_profile", JSON.stringify(p));
      }
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
    return () => sb.removeChannel(ch);
  }, [user.id]);

  async function loadOrders() {
    const { data } = await sb.from("orders").select("*, profiles(full_name, avatar_url)").order("created_at", { ascending: false }).limit(100);
    if (data) {
      setOrders(data);
      // Mantém a ordem selecionada em sincronia com o estado global se estiver aberta no TransactionCenter
      setSelectedOrder(prev => {
        if (!prev) return null;
        const fresh = data.find(o => o.id === prev.id);
        return fresh ? fresh : prev;
      });
      // Mantém a ordem ativa do fluxo de criação também sincronizada
      setOrder(prev => {
        if (!prev) return null;
        const fresh = data.find(o => o.id === prev.id);
        return fresh ? fresh : prev;
      });
    }
  }


  async function handleCalcSubmit({ usd, aoa, dest, account, appliedRate, side, bank }) {
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

    const hasActiveAccess = profile?.access_status === "active" || profile?.access_status === "expiring_soon";
    if (!hasActiveAccess) {
      setShowActivationScreen(true);
      return;
    }

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
        status: "awaiting_payment", // Como o KYC está completo, passa logo a aguardar pagamento!
        side: side || "buy",
        payment_method: bank || "bai"
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
    const hasActiveAccess = profile?.access_status === "active" || profile?.access_status === "expiring_soon";
    if (!hasActiveAccess) {
      setShowActivationScreen(true);
      return;
    }
    triggerConfirm(
      "Iniciar Negociação P2P",
      "Confirmas que queres aceitar este pedido P2P e iniciar a correspondência com o comprador?",
      async () => {
        const { data: orderData, error } = await sb.from("orders").update({
          status: "processing",
          funder_id: user.id,
          admin_notes: `Correspondência P2P iniciada pelo parceiro ${user.email}`
        }).eq("id", orderId).select().maybeSingle();

        if (error) {
          toast_("Erro ao iniciar correspondência: " + error.message, "err");
        } else {
          toast_("Correspondência iniciada com sucesso!");
          
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
    if (showProfile) {
      setShowProfile(false);
      setShowO(false);
    } else {
      setShowProfile(true);
      setShowO(true);
    }
  };

  const handleOrdersClick = () => {
    setSelectedOrder(null);
    if (showOrders && !showProfile) {
      setShowO(false);
    } else {
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
  const hasActiveAccess = profile?.access_status === "active" || profile?.access_status === "expiring_soon";

  if (showActivationScreen) {
    return (
      <div className="shell" style={{ position: "relative", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
        <div className="blob b1" /><div className="blob b2" />
        <Toast toast={toast} />
        <Header appliedRate={applied} rateAnim={rateAnim} user={user} onLogout={onLogout}
          showOrders={false} showProfile={false}
          onOrdersClick={() => {}}
          onProfileClick={() => {}}
          avatarUrl={profile?.avatar_url} />
        
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", padding: "24px 20px" }}>
          <div className="card" style={{ padding: "28px 22px", textAlign: "center", border: "1.5px solid #6366f1", borderRadius: 20 }}>
            <div style={{ width: 56, height: 56, borderRadius: "50%", background: "rgba(99,102,241,0.08)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", color: "#6366f1" }}>
              <Icon name="shield" size={28} />
            </div>
            
            <h2 style={{ fontSize: 18, fontWeight: 900, color: "#1e1b4b", letterSpacing: "-0.4px", marginBottom: 6 }}>
              Acesso Semanal Pré-Pago
            </h2>
            <div style={{ fontSize: 12, color: "#64748b", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 12 }}>
              Taxa de Acesso: 500 Kz
            </div>
            <p style={{ fontSize: 12, color: "#6b7280", lineHeight: 1.6, marginBottom: 20, fontWeight: 500 }}>
              Paga apenas 500 Kz e obtém 7 dias de acesso ativo e ilimitado para comprar ou vender dólares sem qualquer comissão por transação!
            </p>
            
            <div style={{ background: "#f8fafc", border: "1px dashed #cbd5e1", borderRadius: 12, padding: 14, textAlign: "left", marginBottom: 20 }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: "#475569", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6 }}>
                Dados para Transferência
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 12, color: "#1e1b4b", fontWeight: 600 }}>
                <div>Banco: <span style={{ color: "#4f46e5" }}>BAI</span></div>
                <div>IBAN: <span style={{ color: "#4f46e5", fontFamily: "monospace" }}>AO06 0040 0000 5543 2190 1012 3</span></div>
                <div>Destinatário: <span style={{ color: "#475569" }}>Pixel Flex Lda.</span></div>
              </div>
            </div>

            {/* Test Simulation Bypass Button */}
            <button
              className="btn btn-p"
              onClick={async () => {
                setOrdLoad(true);
                const expiryDate = new Date();
                expiryDate.setDate(expiryDate.getDate() + 7);
                const { error } = await sb.from("profiles").update({
                  access_status: "active",
                  access_expires_at: expiryDate.toISOString()
                }).eq("id", user.id);
                setOrdLoad(false);
                if (error) {
                  toast_("Erro ao ativar acesso: " + error.message, "err");
                } else {
                  toast_("Acesso ativado com sucesso por 7 dias!");
                  const updatedP = { ...profile, access_status: "active", access_expires_at: expiryDate.toISOString() };
                  setProfile(updatedP);
                  localStorage.setItem("bridge_profile", JSON.stringify(updatedP));
                  setShowActivationScreen(false);
                }
              }}
              disabled={orderLoad}
              style={{ width: "100%", background: "linear-gradient(135deg,#6366f1,#8b5cf6)", boxShadow: "0 6px 16px rgba(99,102,241,0.2)" }}
            >
              {orderLoad ? "A processar..." : "Simular Pagamento e Activar"}
            </button>

            <button
              className="btn"
              onClick={() => setShowActivationScreen(false)}
              style={{ width: "100%", marginTop: 12, background: "rgba(107, 114, 128, 0.08)", color: "#64748b", border: "1px solid rgba(148, 163, 184, 0.15)" }}
            >
              Voltar ao Mercado
            </button>
            
            <div style={{ fontSize: 10, color: "#94a3b8", fontWeight: 700, marginTop: 10 }}>
              Nota: O acesso expira automaticamente após 7 dias
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (showKycTrigger) {
    return (
      <div className="shell">
        <div className="blob b1" /><div className="blob b2" />
        <Toast toast={toast} />
        <Header appliedRate={applied} rateAnim={rateAnim} user={user} onLogout={onLogout}
          showOrders={showOrders} showProfile={showProfile}
          onOrdersClick={handleOrdersClick}
          onProfileClick={handleProfileClick}
          avatarUrl={profile?.avatar_url} />
        <KycOnboarding user={user} currentStep={kycStep} kycRecord={kycRecord} onLogout={onLogout} onBack={() => setShowKycTrigger(false)} />
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
        avatarUrl={profile?.avatar_url} />

      <div className="pg" style={{ flex: 1, overflowY: "auto" }}>
        {activeTab === "perfil" ? (
          <>
            <div style={{ fontWeight: 900, fontSize: 17, color: "#1e1b4b", letterSpacing: "-.4px", marginBottom: 12 }}>
              O meu Perfil
            </div>
            
            {/* Dados Pessoais Redesenhados e Premium */}
            {!isEditingProfile ? (
              <div className="card" style={{ padding: "20px 24px", marginBottom: 14, borderRadius: 16, background: "#fff", border: "1px solid #e2e8f0" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
                  <div style={{ fontSize: 15, fontWeight: 900, color: "#1e1b4b", letterSpacing: "-0.3px" }}>Dados Pessoais</div>
                  <button onClick={() => setIsEditingProfile(true)} style={{ background: "rgba(99,102,241,0.08)", border: "none", color: "#6366f1", borderRadius: 8, padding: "6px 12px", fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", gap: 6, cursor: "pointer", transition: "all 0.2s" }} onMouseEnter={e => e.currentTarget.style.background = "rgba(99,102,241,0.15)"} onMouseLeave={e => e.currentTarget.style.background = "rgba(99,102,241,0.08)"}>
                    <Icon name="edit" size={13} /> Editar
                  </button>
                </div>

                {/* Premium Profile Photo Frame Upload Box */}
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
                      transition: "all 0.2s",
                      border: "3px solid #fff"
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "scale(1.04)";
                      const overlay = e.currentTarget.querySelector(".avatar-overlay");
                      if (overlay) overlay.style.opacity = 1;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "scale(1)";
                      const overlay = e.currentTarget.querySelector(".avatar-overlay");
                      if (overlay) overlay.style.opacity = 0;
                    }}
                  >
                    {avatarUploading ? (
                      <div style={{ color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", animation: "spin 1s linear infinite" }}>
                        <Icon name="loader" size={24} />
                      </div>
                    ) : profile.avatar_url ? (
                      <img
                        src={profile.avatar_url}
                        alt="Avatar"
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    ) : (
                      <div style={{ color: "#fff", fontSize: 24, fontWeight: 900 }}>
                        {profile.full_name?.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase() || "B"}
                      </div>
                    )}
                    
                    {/* Interactive Camera Hover Overlay */}
                    <div 
                      style={{
                        position: "absolute",
                        bottom: 0,
                        left: 0,
                        right: 0,
                        background: "rgba(0,0,0,0.5)",
                        color: "#fff",
                        fontSize: 9,
                        fontWeight: 800,
                        padding: "4px 0",
                        textAlign: "center",
                        opacity: 0,
                        transition: "opacity 0.2s",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center"
                      }}
                      className="avatar-overlay"
                    >
                      ALTERAR
                    </div>
                  </div>
                  
                  <input
                    id="avatar-upload-file"
                    type="file"
                    style={{ display: "none" }}
                    accept="image/*"
                    onChange={handleAvatarUpload}
                  />
                  
                  <div style={{ fontSize: 13, fontWeight: 900, color: "#1e1b4b", marginTop: 8 }}>
                    {profile.full_name || "Utilizador"}
                  </div>
                  <div style={{ fontSize: 10, color: "#94a3b8", fontWeight: 700, marginTop: 2 }}>
                    Clica no círculo para alterar a foto
                  </div>
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
                        {item.isSecure && <Icon name="lock" size={12} color="#94a3b8" title="Verificado e Protegido" />}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Active Payment Destinations Display */}
                <div style={{ marginTop: 20, paddingTop: 16, borderTop: "1px solid #f1f5f9" }}>
                  <div style={{ fontSize: 13, fontWeight: 900, color: "#1e1b4b", marginBottom: 12 }}>Métodos de Recebimento Ativos</div>
                  {Object.entries(profile.payment_destinations || {}).filter(([_, info]) => info.active && info.value).length === 0 ? (
                    <div style={{ fontSize: 11, color: "#64748b", background: "#f8fafc", padding: "10px 14px", borderRadius: 10, textAlign: "center", border: "1px dashed #cbd5e1" }}>
                      Nenhum método configurado. Edita os teus dados para adicionar os teus destinos de recebimento!
                    </div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {Object.entries(profile.payment_destinations || {}).filter(([_, info]) => info.active && info.value).map(([id, info]) => {
                        const d = DESTS.find(x => x.id === id);
                        if (!d) return null;
                        return (
                          <div key={id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", background: "#f8fafc", borderRadius: 12, border: "1px solid #e2e8f0" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              <div style={{ width: 28, height: 28, borderRadius: 8, background: d.bg, display: "flex", alignItems: "center", justifyContent: "center" }} dangerouslySetInnerHTML={{ __html: d.svg }} />
                              <div>
                                <div style={{ fontSize: 12, fontWeight: 800, color: "#1e1b4b" }}>{d.label}</div>
                                <div style={{ fontSize: 11, color: "#64748b", fontFamily: "monospace", marginTop: 2 }}>{info.value}</div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="card" style={{ padding: "20px 24px", marginBottom: 14, borderRadius: 16, background: "#fff", border: "1px solid #e2e8f0" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
                  <div style={{ fontSize: 15, fontWeight: 900, color: "#1e1b4b", letterSpacing: "-0.3px" }}>Editar Dados Pessoais</div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  <div>
                    <label className="lbl">Nome Completo</label>
                    <input className="inp" type="text" placeholder="Nome Completo" value={profile.full_name} onChange={e => setProfile({ ...profile, full_name: e.target.value })} />
                  </div>
                  <div>
                    <label className="lbl">E-mail (Seguro)</label>
                    <input className="inp" type="text" disabled value={user.email} style={{ background: "#f8fafc", color: "#64748b", cursor: "not-allowed" }} />
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
                    <input className="inp" type="text" placeholder="Nacionalidade" value={profile.address || ""} onChange={e => setProfile({ ...profile, nationality: e.target.value })} />
                  </div>
                  <div>
                    <label className="lbl">WhatsApp</label>
                    <input className="inp" type="tel" placeholder="WhatsApp" value={profile.whatsapp || ""} onChange={e => setProfile({ ...profile, whatsapp: e.target.value })} />
                  </div>

                  <div style={{ borderTop: "1px solid #e2e8f0", paddingTop: 14, marginTop: 10 }}>
                    <div style={{ fontSize: 13, fontWeight: 900, color: "#1e1b4b", marginBottom: 10 }}>Os Meus Destinos de Recebimento</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      {DESTS.map(d => {
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
                                <div style={{ width: 24, height: 24, borderRadius: 6, background: d.bg, display: "flex", alignItems: "center", justifyContent: "center" }} dangerouslySetInnerHTML={{ __html: d.svg }} fill="none" />
                                <span style={{ fontSize: 12, fontWeight: 800, color: "#1e1b4b" }}>{d.label}</span>
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

            {/* Verificação de Identidade */}
            <div className="card" style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: "#1e1b4b", marginBottom: 10 }}>Verificação de Identidade</div>
              {isKycComplete ? (
                <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 12 }}>
                  <div style={{ width: 30, height: 30, borderRadius: "50%", background: "#10b981", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Icon name="check" size={16} />
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 800, color: "#16a34a" }}>Identidade Verificada (DIDIT)</div>
                    <div style={{ fontSize: 11, color: "#15803d", fontWeight: 600, marginTop: 2 }}>A tua conta está totalmente validada e segura para transações.</div>
                  </div>
                </div>
              ) : (
                <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", background: "#fffbeb", border: "1px solid #fef3c7", borderRadius: 12 }}>
                  <div style={{ width: 30, height: 30, borderRadius: "50%", background: "#f59e0b", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Icon name="alertTriangle" size={16} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 800, color: "#d97706" }}>Identidade Não Verificada</div>
                    <div style={{ fontSize: 11, color: "#b45309", fontWeight: 600, marginTop: 2 }}>Verifica a tua identidade para poderes criar pedidos e transacionar.</div>
                  </div>
                  <button className="btn btn-p" style={{ width: "auto", padding: "6px 12px", fontSize: 11, height: "auto" }} onClick={() => setShowKycTrigger(true)}>
                    Verificar
                  </button>
                </div>
              )}
            </div>

            {/* Segurança da Conta */}
            <div className="card" style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: "#1e1b4b", marginBottom: 10 }}>Segurança da Conta</div>
              <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 14, fontWeight: 500 }}>Define uma nova palavra-passe para a tua conta ({user.email}).</div>
              <label className="lbl">Nova palavra-passe</label>
              <input className="inp" style={{ marginBottom: 10 }} type="password" placeholder="Mínimo 6 caracteres" value={newPwd} onChange={e => setNewPwd(e.target.value)} />
              <button className="btn btn-p" style={{ background: "#475569" }} onClick={handleUpdatePassword} disabled={pwdLoad}>
                {pwdLoad ? "A guardar..." : "Guardar nova senha"}
              </button>

              <div style={{ marginTop: 24, paddingTop: 14, borderTop: "1px solid #e2e8f0" }}>
                <div style={{ fontSize: 12, color: "#ef4444", marginBottom: 10, fontWeight: 600 }}>Zona de Perigo</div>
                <button className="btn btn-o" style={{ color: "#ef4444", borderColor: "#fecaca", background: "#fef2f2" }} onClick={handleDeleteAccount} disabled={profileLoad}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, justifyContent: "center" }}><Icon name="trash" size={14} /> Apagar conta permanentemente</div>
                </button>
              </div>
            </div>
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
              <div className="metric-card">
                <div className="metric-icon-box green">
                  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="7" y1="17" x2="17" y2="7" />
                    <polyline points="7 7 17 7 17 17" />
                  </svg>
                </div>
                <div className="metric-content">
                  <div className="metric-label">Taxa de Hoje</div>
                  <div className="metric-value">
                    {applied.toFixed(2)} <span>AOA/USD</span>
                  </div>
                </div>
              </div>

              <div className="metric-card">
                <div className="metric-icon-box blue">
                  <Icon name="shield" size={22} color="#3b82f6" />
                </div>
                <div className="metric-content">
                  <div className="metric-label">Sua Confiança</div>
                  <div className="metric-value">98%</div>
                  <div className="metric-bar-container">
                    <div className="metric-bar-fill" style={{ width: "98%" }} />
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
                      } else if (!hasActiveAccess) {
                        setShowActivationScreen(true);
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
