import { useState, useEffect, useCallback } from "react";
import { sb, checkIsAdmin, fetchLatestRate, fetchAdminConfig } from "./lib/supabase.js";
import { CSS, DESTS } from "./lib/constants.js";
import { Toast, StepBar, Header } from "./components/shared/UI.jsx";
import { Calculator } from "./components/client/Calculator.jsx";
import { ProofUpload } from "./components/client/ProofUpload.jsx";
import { OrderList } from "./components/client/OrderList.jsx";
import { AdminPanel } from "./components/admin/AdminPanel.jsx";

const Icon = ({ name, size = 16, color = "currentColor", className, style }) => {
  const paths = {
    user: <><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></>,
    loader: <><line x1="12" y1="2" x2="12" y2="6" /><line x1="12" y1="18" x2="12" y2="22" /><line x1="4.93" y1="4.93" x2="7.76" y2="7.76" /><line x1="16.24" y1="16.24" x2="19.07" y2="19.07" /><line x1="2" y1="12" x2="6" y2="12" /><line x1="18" y1="12" x2="22" y2="12" /><line x1="4.93" y1="19.07" x2="7.76" y2="16.24" /><line x1="16.24" y1="7.76" x2="19.07" y2="4.93" /></>,
    alertTriangle: <><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></>,
    trash: <><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /><line x1="10" y1="11" x2="10" y2="17" /><line x1="14" y1="11" x2="14" y2="17" /></>,
    lock: <><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></>,
    arrowRight: <><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></>,
    arrowLeft: <><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></>,
    checkCircle: <><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></>,
    xCircle: <><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></>,
    globe: <><circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></>,
    check: <polyline points="20 6 9 17 4 12" />,
    file: <><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" /><polyline points="13 2 13 9 20 9" /></>,
    clipboard: <><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" /><rect x="8" y="2" width="8" height="4" rx="1" ry="1" /></>,
    sun: <><circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" /></>,
    moon: <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  };
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      {paths[name]}
    </svg>
  );
};

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
        setErr("⏳ Aguarda 1 minuto antes de tentares criar outra conta.");
        setLoad(false); return;
      }
      localStorage.setItem("last_register_attempt", Date.now().toString());

      // Garante que o número começa sempre por +244 antes de salvar na base de dados
      const formattedPhone = cleanPhone.length === 9 ? `+244${cleanPhone}` : `+${cleanPhone}`;

      setErr("⏳ A verificar o teu número de WhatsApp...");
      try {
        const { data: checkData, error: checkErr } = await sb.from("whatsapp_checks").insert({ phone: formattedPhone }).select().single();
        if (!checkErr) {
          const isValid = await new Promise((resolve, reject) => {
            let handled = false;
            const ch = sb.channel(`check_${checkData.id}`)
              .on("postgres_changes", { event: "UPDATE", schema: "public", table: "whatsapp_checks", filter: `id=eq.${checkData.id}` }, (p) => {
                handled = true;
                sb.removeChannel(ch);
                resolve(p.new.status === "valid");
              }).subscribe();

            setTimeout(() => {
              if (!handled) { sb.removeChannel(ch); reject(new Error("timeout")); }
            }, 12000); // Dá 12 segundos ao bot para processar
          });

          if (!isValid) {
            setErr("err:O número inserido não possui conta de WhatsApp activa.");
            setLoad(false); return;
          }
        }
      } catch (e) {
        setErr("warn:O serviço de verificação está offline. Tenta novamente mais tarde.");
        setLoad(false); return;
      }

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
          <div style={{ width: 62, height: 62, borderRadius: 18, background: "linear-gradient(135deg,#6366f1,#8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px", boxShadow: "0 10px 28px rgba(99,102,241,.45)" }}><Icon name="globe" size={30} color="#fff" /></div>
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
function KycOnboarding({ user, currentStep, kycRecord, onLogout }) {
  const [step, setStep] = useState(currentStep);
  const [loading, setLoading] = useState(false);
  const [selfieFile, setSelfieFile] = useState(null);
  const [docFile, setDocFile] = useState(null);

  const isPending = kycRecord?.ocr_status === "pending" || kycRecord?.liveness_status === "pending";
  const isRejected = kycRecord?.ocr_status === "rejected" || kycRecord?.liveness_status === "rejected";

  async function uploadFile(file, path) {
    const { error } = await sb.storage.from("kyc-documents").upload(path, file, { upsert: true });
    if (error) throw error;
    return path; // Retorna apenas o caminho, o Admin vai gerar o link seguro
  }

  async function handleNext() {
    setLoading(true);
    try {
      const updates = { user_id: user.id, updated_at: new Date().toISOString() };

      if (step === 0) updates.step_personal_done = true;
      if (step === 1) {
        if (!selfieFile) { alert("Por favor, grava o vídeo da tua prova de vida."); setLoading(false); return; }

        if (selfieFile.size > 5 * 1024 * 1024) {
          alert("O vídeo é demasiado grande. Grava um vídeo mais curto (máximo de 5MB).");
          setLoading(false); return;
        }

        const ext = selfieFile.name.split(".").pop().toLowerCase() || "mp4";
        updates.selfie_url = await uploadFile(selfieFile, `${user.id}/liveness_${Date.now()}.${ext}`);
        updates.liveness_status = "pending";
      }
      if (step === 2) {
        if (!docFile) { alert("Por favor, tira a fotografia do teu BI ou Passaporte."); setLoading(false); return; }
        if (docFile.size > 5 * 1024 * 1024) {
          alert("A imagem é demasiado grande. Tira uma foto com tamanho menor (máximo de 5MB).");
          setLoading(false); return;
        }
        const ext = docFile.name.split(".").pop().toLowerCase();
        updates.document_url = await uploadFile(docFile, `${user.id}/document_${Date.now()}.${ext}`);
        updates.ocr_status = "pending";
      }

      const { error } = await sb.from("kyc_verifications").upsert(updates);
      if (error) throw error;

      setStep(s => s + 1);
    } catch (e) {
      alert("Erro ao enviar o ficheiro: " + e.message);
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
        <button className="btn btn-o" onClick={onLogout} style={{ marginTop: 24 }}>Sair</button>
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
        <button className="btn btn-p" onClick={handleRetry} style={{ marginTop: 24 }}>Tentar Novamente</button>
        <button className="btn btn-o" onClick={onLogout} style={{ marginTop: 10 }}>Sair</button>
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
          <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, opacity: step > 0 ? 0.5 : 1 }}>
              <div style={{ width: 30, height: 30, borderRadius: 15, background: step > 0 ? "#10b981" : "#6366f1", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 }}>{step > 0 ? <Icon name="check" size={16} /> : "1"}</div>
              <div style={{ fontWeight: 600, color: "#1e1b4b" }}>Dados Pessoais</div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, opacity: step === 1 ? 1 : step > 1 ? 0.5 : 0.4 }}>
              <div style={{ width: 30, height: 30, borderRadius: 15, background: step > 1 ? "#10b981" : step === 1 ? "#6366f1" : "#e2e8f0", color: step > 1 ? "#fff" : step === 1 ? "#fff" : "#64748b", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 }}>{step > 1 ? <Icon name="check" size={16} /> : "2"}</div>
              <div style={{ fontWeight: 600, color: "#1e1b4b" }}>Prova de Vida (Vídeo)</div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, opacity: step === 2 ? 1 : step > 2 ? 0.5 : 0.4 }}>
              <div style={{ width: 30, height: 30, borderRadius: 15, background: step > 2 ? "#10b981" : step === 2 ? "#6366f1" : "#e2e8f0", color: step > 2 ? "#fff" : step === 2 ? "#fff" : "#64748b", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 }}>{step > 2 ? <Icon name="check" size={16} /> : "3"}</div>
              <div style={{ fontWeight: 600, color: "#1e1b4b" }}>Documento de Identidade</div>
            </div>
          </div>

          <div style={{ background: "#f0fdfa", border: "1px solid #bbf7d0", padding: 12, borderRadius: 8, marginBottom: 16, fontSize: 12, color: "#166534", fontWeight: 500 }}>
            {step === 0 && "Nesta etapa, confirmamos o teu nome, morada e data de nascimento."}
            {step === 1 && "Nesta etapa, deves gravar um vídeo curto do teu rosto (em tempo real) para confirmarmos a tua identidade."}
            {step === 2 && "Nesta etapa, tira uma fotografia nítida (em tempo real) ao teu BI ou Passaporte."}
          </div>

          {step === 1 && (
            <div style={{ marginBottom: 16 }}>
              <label className="lbl">Gravar Vídeo (Rosto)</label>
              <input type="file" accept="video/*" capture="user" onChange={e => setSelfieFile(e.target.files[0])} className="inp" style={{ padding: "8px", cursor: "pointer" }} />
            </div>
          )}
          {step === 2 && (
            <div style={{ marginBottom: 16 }}>
              <label className="lbl">Fotografia do BI ou Passaporte</label>
              <input type="file" accept="image/*" capture="environment" onChange={e => setDocFile(e.target.files[0])} className="inp" style={{ padding: "8px", cursor: "pointer" }} />
            </div>
          )}

          <button className="btn btn-p" onClick={handleNext} disabled={loading}>
            {loading ? "A processar..." : step === 0 ? "Confirmar Dados →" : step === 1 ? "Enviar Vídeo →" : "Enviar Documento e Concluir"}
          </button>
          <button className="btn btn-o" onClick={onLogout} style={{ marginTop: 10 }}>Sair</button>
        </div>
      </div>
    </div>
  );
}

// ── CLIENT ────────────────────────────────────────────────────────────────────
function ClientApp({ user, onLogout }) {
  const [step, setStep] = useState(0);
  const [rate, setRate] = useState({ base_rate: 1150, margin: 15, applied_rate: 1165 });
  const [rateAnim, setRateAnim] = useState(false);
  const [config, setConfig] = useState({});
  const [currentOrder, setOrder] = useState(null);
  const [orders, setOrders] = useState([]);
  const [showOrders, setShowO] = useState(false);
  const [kycStep, setKycStep] = useState(0);
  const [orderLoad, setOrdLoad] = useState(false);
  const [toast, setToast] = useState(null);
  const [kycLoading, setKycLoading] = useState(true);
  const [kycRecord, setKycRecord] = useState(null);

  const [showProfile, setShowProfile] = useState(false);
  const [newPwd, setNewPwd] = useState("");
  const [pwdLoad, setPwdLoad] = useState(false);
  const [profile, setProfile] = useState({ full_name: "", phone: "" });
  const [profileLoad, setProfileLoad] = useState(false);

  const toast_ = useCallback((msg, type = "ok") => {
    setToast({ msg, type }); setTimeout(() => setToast(null), 3000);
  }, []);

  useEffect(() => {
    fetchLatestRate().then(r => setRate(r));
    fetchAdminConfig().then(c => setConfig(c));
    sb.from("profiles").select("full_name, phone").eq("id", user.id).maybeSingle().then(({ data }) => {
      if (data) setProfile({ full_name: data.full_name || "", phone: data.phone || "" });
    });
    sb.from("kyc_verifications").select("*").eq("user_id", user.id)
      .order("created_at", { ascending: false }).limit(1).maybeSingle()
      .then(({ data: k }) => {
        let s = 0;
        if (k) {
          setKycRecord(k);
          if (k.step_personal_done) s = 1;
          if (k.liveness_status && k.liveness_status !== "rejected") s = 2;
          if (k.ocr_status && k.ocr_status !== "rejected") s = 3;
        }
        setKycStep(s);
        setKycLoading(false);
      });

    const ch = sb.channel("client_ch")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "exchange_rates" }, p => {
        setRate(p.new); setRateAnim(true); setTimeout(() => setRateAnim(false), 900);
        toast_("Novo câmbio: " + parseFloat(p.new.applied_rate).toLocaleString("pt-AO") + " Kz/$");
      })
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "orders", filter: `user_id=eq.${user.id}` },
        () => loadOrders())
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "kyc_verifications", filter: `user_id=eq.${user.id}` },
        (p) => {
          const k = p.new;
          setKycRecord(k);
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
    const { data } = await sb.from("orders").select("*").order("created_at", { ascending: false }).limit(20);
    if (data) setOrders(data);
  }

  async function handleCalcSubmit({ usd, aoa, dest, account, appliedRate }) {
    const minUsd = parseFloat(config?.min_amount_usd) || 10;
    const maxUsd = parseFloat(config?.max_amount_usd) || 5000;

    if (usd < minUsd || usd > maxUsd) {
      toast_(`O valor deve estar entre $${minUsd} e $${maxUsd}.`, "err");
      return;
    }
    if (usd <= 0 || !account.trim()) return;
    setOrdLoad(true);
    const { data, error } = await sb.from("orders").insert({
      user_id: user.id, amount_usd: usd, amount_aoa: aoa,
      rate_applied: appliedRate, destination: dest,
      destination_account: account,
      status: kycStep >= 3 ? "awaiting_payment" : "awaiting_kyc",
    }).select().single();
    setOrdLoad(false);
    if (error) { toast_(error.message, "err"); return; }
    setOrder(data); setStep(1);
    toast_("Pedido criado! Admin notificado.");
  }

  function resetFlow() { setStep(0); setOrder(null); }

  async function handleCancelOrder(orderId) {
    if (!window.confirm("Tens a certeza que queres cancelar este pedido?")) return;
    const { error } = await sb.from("orders").update({ status: "cancelled" }).eq("id", orderId).eq("user_id", user.id);
    if (error) { toast_("Erro ao cancelar: " + error.message, "err"); }
    else {
      toast_("Pedido cancelado.");

      // Enviar notificação em tempo real para o painel do Administrador
      const oRef = (orders.find(o => o.id === orderId) || currentOrder)?.order_ref || `#${orderId.slice(0, 8).toUpperCase()}`;
      sb.from("admin_alerts").insert({
        type: "cancelled",
        title: "Pedido Cancelado",
        body: `O cliente cancelou o pedido ${oRef}.`,
        order_id: orderId
      }).then(); // Executa em background (não atrasa a interface do cliente)

      if (currentOrder?.id === orderId) resetFlow();
      loadOrders();
    }
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
    if (!profile.full_name?.trim() || !profile.phone?.trim()) { toast_("Preenche todos os campos.", "err"); return; }
    const cleanPhone = profile.phone.replace(/\D/g, "");
    const formattedPhone = cleanPhone.length === 9 ? `+244${cleanPhone}` : `+${cleanPhone}`;
    setProfileLoad(true);
    const { error } = await sb.from("profiles").update({ full_name: profile.full_name, phone: formattedPhone }).eq("id", user.id);
    setProfileLoad(false);
    if (error) toast_("Erro ao atualizar: " + error.message, "err");
    else { toast_("Perfil atualizado com sucesso!"); setProfile({ ...profile, phone: formattedPhone }); }
  }

  async function handleDeleteAccount() {
    if (!window.confirm("⚠️ ATENÇÃO! Tens a certeza absoluta que queres APAGAR a tua conta permanentemente?\n\nEsta acção não pode ser desfeita e perderás acesso a todo o teu histórico.")) return;
    setProfileLoad(true);
    const { error } = await sb.rpc("delete_user");
    if (error) {
      toast_("Erro ao apagar conta: " + error.message, "err");
      setProfileLoad(false);
    } else {
      await sb.auth.signOut();
      window.location.reload();
    }
  }

  const destInfo = DESTS.find(d => d.id === currentOrder?.destination);
  const applied = parseFloat(rate.applied_rate) || 1165;

  if (kycLoading) return <div className="shell" style={{ display: "flex", alignItems: "center", justifyContent: "center", color: "#9ca3af", fontWeight: 600 }}>A verificar estado da conta...</div>;

  const isKycComplete = kycRecord?.ocr_status === "passed" && kycRecord?.liveness_status === "passed";

  if (!isKycComplete) {
    return <KycOnboarding user={user} currentStep={kycStep} kycRecord={kycRecord} onLogout={onLogout} />;
  }

  return (
    <div className="shell">
      <div className="blob b1" /><div className="blob b2" />
      <Toast toast={toast} />
      <Header appliedRate={applied} rateAnim={rateAnim} user={user} onLogout={onLogout}
        showOrders={showOrders}
        onOrdersClick={() => { setShowO(!showOrders); setShowProfile(false); if (!showOrders) loadOrders(); }} />

      {showOrders ? (
        <div className="pg">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <div style={{ fontWeight: 900, fontSize: 17, color: "#1e1b4b", letterSpacing: "-.4px" }}>
              {showProfile ? "O meu Perfil" : "Os meus pedidos"}
            </div>
            <button onClick={() => setShowProfile(!showProfile)} style={{ background: "none", border: "none", color: "#6366f1", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
              {showProfile ? <div style={{ display: "flex", alignItems: "center", gap: 6 }}><Icon name="arrowLeft" size={14} /> Ver pedidos</div> : <div style={{ display: "flex", alignItems: "center", gap: 6 }}><Icon name="user" size={14} /> O meu Perfil</div>}
            </button>
          </div>

          {showProfile ? (
            <>
              <div className="card" style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 14, fontWeight: 800, color: "#1e1b4b", marginBottom: 10 }}>Dados Pessoais</div>
                <label className="lbl">Nome Completo</label>
                <input className="inp" style={{ marginBottom: 10 }} type="text" placeholder="O teu nome" value={profile.full_name} onChange={e => setProfile({ ...profile, full_name: e.target.value })} />
                <label className="lbl">Número de Telefone</label>
                <input className="inp" style={{ marginBottom: 14 }} type="tel" placeholder="+244 9XX XXX XXX" value={profile.phone} onChange={e => setProfile({ ...profile, phone: e.target.value })} />
                <button className="btn btn-p" onClick={handleUpdateProfile} disabled={profileLoad}>
                  {profileLoad ? "A guardar..." : "Guardar Dados"}
                </button>
              </div>
              <div className="card">
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
            <OrderList orders={orders} onCancel={handleCancelOrder} />
          )}
        </div>
      ) : (
        <>
          <StepBar step={step} />
          <div className="pg">

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
                  {[["Destino", `${destInfo?.label}`], ["Conta", currentOrder.destination_account], ["Referência", currentOrder.order_ref]].map(([l, v]) => (
                    <div key={l} className="sum-row"><span className="sum-l">{l}</span><span className="sum-v">{v}</span></div>
                  ))}
                </div>
                <button className="btn btn-p" onClick={() => setStep(2)}>Já paguei — Enviar comprovante →</button>
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
                <button className="btn btn-p" style={{ marginTop: 16 }} onClick={resetFlow}>Nova transação</button>
                <button className="btn btn-o" onClick={() => { setShowO(true); loadOrders(); }}><div style={{ display: "flex", alignItems: "center", gap: 6, justifyContent: "center" }}><Icon name="clipboard" size={14} /> Ver todos os pedidos</div></button>
              </div>
            )}
          </div>
        </>
      )}
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
    sb.auth.getSession().then(async ({ data }) => {
      const u = data?.session?.user ?? null;
      setUser(u);
      if (u) setAdmin(await checkIsAdmin());
      setReady(true);
    });
    const { data: { subscription } } = sb.auth.onAuthStateChange(async (_e, s) => {
      const u = s?.user ?? null;
      setUser(u);
      setAdmin(u ? await checkIsAdmin() : false);

      // Se o cliente clicar no link do email para recuperar senha, ele cai aqui!
      if (_e === "PASSWORD_RECOVERY") {
        const newPassword = window.prompt("Insere a tua nova palavra-passe (mínimo 6 caracteres):");
        if (newPassword && newPassword.length >= 6) {
          const { error } = await sb.auth.updateUser({ password: newPassword });
          if (error) alert("Erro ao atualizar a senha: " + error.message);
          else alert("✅ Palavra-passe atualizada com sucesso! A tua conta está segura.");
        } else {
          alert("Palavra-passe inválida. Recuperação cancelada.");
        }
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  async function handleLogout() {
    await sb.auth.signOut();
    setUser(null); setAdmin(false);
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
