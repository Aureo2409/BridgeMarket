import { useState, useEffect, useCallback } from "react";
import { sb, checkIsAdmin, fetchLatestRate, fetchAdminConfig } from "./lib/supabase.js";
import { CSS, DESTS } from "./lib/constants.js";
import { Toast, StepBar, Header } from "./components/shared/UI.jsx";
import { Calculator } from "./components/client/Calculator.jsx";
import { ProofUpload } from "./components/client/ProofUpload.jsx";
import { OrderList } from "./components/client/OrderList.jsx";
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

  async function submit() {
    setLoad(true); setErr("");
    if (mode === "register") {
      if (!phone.trim()) { setErr("O número de telefone é obrigatório."); setLoad(false); return; }
      const { error, data } = await sb.auth.signUp({ email, password: pwd });
      if (error) { setErr(error.message); setLoad(false); return; }
      // Save phone + name to profile
      if (data?.user) {
        await sb.from("profiles").upsert({
          id: data.user.id,
          full_name: name || null,
          phone: phone,
        });
      }
      setErr("✅ Registo feito! Verifica o teu email para activar a conta.");
    } else {
      const { error } = await sb.auth.signInWithPassword({ email, password: pwd });
      if (error) setErr("Email ou senha incorrectos.");
    }
    setLoad(false);
  }

  return (
    <div className="shell">
      <div className="blob b1" /><div className="blob b2" />
      <div style={{ position: "relative", zIndex: 2, padding: "44px 22px" }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ width: 62, height: 62, borderRadius: 18, background: "linear-gradient(135deg,#6366f1,#8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, margin: "0 auto 12px", boxShadow: "0 10px 28px rgba(99,102,241,.45)" }}>₿</div>
          <div style={{ fontSize: 24, fontWeight: 900, color: "#1e1b4b", letterSpacing: -1 }}>Bridge</div>
          <div style={{ fontSize: 12, color: "#6b7280", fontWeight: 600, marginTop: 3 }}>Marketplace AOA/USD · Angola</div>
        </div>

        <div className="card" style={{ background: "rgba(255,255,255,.96)" }}>
          <div style={{ display: "flex", gap: 4, background: "#f0efff", borderRadius: 13, padding: 4, marginBottom: 16 }}>
            {["login", "register"].map(m => (
              <button key={m} onClick={() => { setMode(m); setErr(""); }}
                style={{ flex: 1, padding: "9px", border: "none", borderRadius: 10, fontFamily: "inherit", fontSize: 13, fontWeight: 700, cursor: "pointer", transition: "all .2s", background: mode === m ? "white" : "transparent", color: mode === m ? "#1e1b4b" : "#6b7280", boxShadow: mode === m ? "0 2px 8px rgba(0,0,0,.08)" : "none" }}>
                {m === "login" ? "Entrar" : "Criar conta"}
              </button>
            ))}
          </div>

          {err && (
            <div style={{ background: err.startsWith("✅") ? "#f0fdf4" : "#fef2f2", border: `1px solid ${err.startsWith("✅") ? "#bbf7d0" : "#fecaca"}`, borderRadius: 9, padding: "9px 12px", fontSize: 12, fontWeight: 600, marginBottom: 12, color: err.startsWith("✅") ? "#16a34a" : "#b91c1c" }}>
              {err}
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

          <label className="lbl">Senha</label>
          <input className="inp" style={{ marginBottom: 14 }} type="password" placeholder="Mínimo 6 caracteres"
            value={pwd} onChange={e => setPwd(e.target.value)}
            onKeyDown={e => e.key === "Enter" && submit()} />

          <button className="btn btn-p" onClick={submit} disabled={load}>
            {load ? "A carregar..." : mode === "login" ? "→  Entrar" : "→  Criar conta"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── KYC ONBOARDING ─────────────────────────────────────────────────────────────
function KycOnboarding({ user, currentStep, kycRecord, onLogout }) {
  const [step, setStep] = useState(currentStep);
  const [loading, setLoading] = useState(false);

  const isPending = kycRecord?.ocr_status === "pending" || kycRecord?.liveness_status === "pending";
  const isRejected = kycRecord?.ocr_status === "rejected" || kycRecord?.liveness_status === "rejected";

  async function handleNext() {
    setLoading(true);
    const updates = { user_id: user.id, updated_at: new Date().toISOString() };
    if (step === 0) updates.step_personal_done = true;
    if (step === 1) updates.liveness_status = "pending";
    if (step === 2) updates.ocr_status = "pending";

    // Busca o registo existente para garantir que o upsert não duplica
    const { data: existing } = await sb.from("kyc_verifications").select("id").eq("user_id", user.id).maybeSingle();
    if (existing) updates.id = existing.id;

    const { error } = await sb.from("kyc_verifications").upsert(updates);
    setLoading(false);

    if (!error) {
      setStep(s => s + 1);
    } else {
      alert("Erro ao guardar o progresso do KYC: " + error.message);
    }
  }

  async function handleRetry() {
    await sb.from("kyc_verifications").update({ liveness_status: null, ocr_status: null, step_personal_done: false }).eq("user_id", user.id);
    setStep(0);
  }

  if (isPending) {
    return (
      <div className="shell" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 20px", textAlign: "center" }}>
        <div style={{ fontSize: 50, marginBottom: 16 }}>⏳</div>
        <div style={{ fontSize: 24, fontWeight: 900, color: "#1e1b4b", letterSpacing: -1 }}>Em análise</div>
        <div style={{ fontSize: 13, color: "#6b7280", fontWeight: 600, marginTop: 10, maxWidth: 300, lineHeight: 1.5 }}>A tua identidade está a ser verificada pela nossa equipa. Por favor, aguarda a aprovação.</div>
        <button className="btn btn-o" onClick={onLogout} style={{ marginTop: 24 }}>Sair</button>
      </div>
    );
  }

  if (isRejected) {
    return (
      <div className="shell" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 20px", textAlign: "center" }}>
        <div style={{ fontSize: 50, marginBottom: 16 }}>❌</div>
        <div style={{ fontSize: 24, fontWeight: 900, color: "#ef4444", letterSpacing: -1 }}>Verificação Recusada</div>
        <div style={{ fontSize: 13, color: "#6b7280", fontWeight: 600, marginTop: 10, maxWidth: 300, lineHeight: 1.5 }}>Não foi possível validar a tua identidade com os dados fornecidos.</div>
        <button className="btn btn-p" onClick={handleRetry} style={{ marginTop: 24 }}>Tentar Novamente</button>
        <button className="btn btn-o" onClick={onLogout} style={{ marginTop: 10 }}>Sair</button>
      </div>
    );
  }

  return (
    <div className="shell">
      <div className="blob b1" /><div className="blob b2" />
      <div style={{ position: "relative", zIndex: 2, padding: "44px 22px", maxWidth: 400, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ fontSize: 24, fontWeight: 900, color: "#1e1b4b", letterSpacing: -1 }}>Verificação de Conta</div>
          <div style={{ fontSize: 13, color: "#6b7280", fontWeight: 600, marginTop: 6 }}>Precisamos de confirmar a tua identidade antes de continuares.</div>
        </div>

        <div className="card" style={{ background: "rgba(255,255,255,.96)" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, opacity: step > 0 ? 0.5 : 1 }}>
              <div style={{ width: 30, height: 30, borderRadius: 15, background: step > 0 ? "#10b981" : "#6366f1", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 }}>{step > 0 ? "✓" : "1"}</div>
              <div style={{ fontWeight: 600, color: "#1e1b4b" }}>Dados Pessoais</div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, opacity: step === 1 ? 1 : step > 1 ? 0.5 : 0.4 }}>
              <div style={{ width: 30, height: 30, borderRadius: 15, background: step > 1 ? "#10b981" : step === 1 ? "#6366f1" : "#e2e8f0", color: step > 1 ? "#fff" : step === 1 ? "#fff" : "#64748b", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 }}>{step > 1 ? "✓" : "2"}</div>
              <div style={{ fontWeight: 600, color: "#1e1b4b" }}>Prova de Vida (Selfie)</div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, opacity: step === 2 ? 1 : step > 2 ? 0.5 : 0.4 }}>
              <div style={{ width: 30, height: 30, borderRadius: 15, background: step > 2 ? "#10b981" : step === 2 ? "#6366f1" : "#e2e8f0", color: step > 2 ? "#fff" : step === 2 ? "#fff" : "#64748b", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 }}>{step > 2 ? "✓" : "3"}</div>
              <div style={{ fontWeight: 600, color: "#1e1b4b" }}>Documento de Identidade</div>
            </div>
          </div>

          <div style={{ background: "#f0fdfa", border: "1px solid #bbf7d0", padding: 12, borderRadius: 8, marginBottom: 16, fontSize: 12, color: "#166534", fontWeight: 500 }}>
            {step === 0 && "Nesta etapa, confirmamos o teu nome, morada e data de nascimento."}
            {step === 1 && "Nesta etapa, deves tirar uma selfie para confirmarmos que és uma pessoa real."}
            {step === 2 && "Nesta etapa, fazes o upload do teu BI ou Passaporte."}
          </div>

          <button className="btn btn-p" onClick={handleNext} disabled={loading}>
            {loading ? "A processar..." : step === 2 ? "Enviar para Revisão" : "Simular Etapa Concluída →"}
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

  const toast_ = useCallback((msg, type = "ok") => {
    setToast({ msg, type }); setTimeout(() => setToast(null), 3000);
  }, []);

  useEffect(() => {
    fetchLatestRate().then(r => setRate(r));
    fetchAdminConfig().then(c => setConfig(c));
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
        toast_("📈 Novo câmbio: " + parseFloat(p.new.applied_rate).toLocaleString("pt-AO") + " Kz/$");
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
    toast_("✅ Pedido criado! Admin notificado.");
  }

  function resetFlow() { setStep(0); setOrder(null); }
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
        onOrdersClick={() => { setShowO(!showOrders); if (!showOrders) loadOrders(); }} />

      {showOrders ? (
        <div className="pg">
          <div style={{ fontWeight: 900, fontSize: 17, color: "#1e1b4b", marginBottom: 12, letterSpacing: "-.4px" }}>Os meus pedidos</div>
          <OrderList orders={orders} />
        </div>
      ) : (
        <>
          <StepBar step={step} />
          <div className="pg">

            {step === 0 && (
              <Calculator appliedRate={applied} rate={rate} onSubmit={handleCalcSubmit}
                loading={orderLoad} user={user} kycStep={kycStep} />
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
                <button className="btn btn-o" onClick={resetFlow}>← Alterar pedido</button>
              </>
            )}

            {step === 2 && currentOrder && (
              <ProofUpload order={currentOrder} user={user} config={config}
                onSuccess={() => setStep(3)} onBack={() => setStep(1)} />
            )}

            {step === 3 && (
              <div className="succ">
                <div className="succ-ico">🎉</div>
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
                      <span className="pill" style={{ background: "#eff6ff", color: "#2563eb" }}>📨 Comprovante OK</span>
                    </div>
                  </div>
                )}
                <button className="btn btn-p" style={{ marginTop: 16 }} onClick={resetFlow}>Nova transação</button>
                <button className="btn btn-o" onClick={() => { setShowO(true); loadOrders(); }}>📋 Ver todos os pedidos</button>
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
        <div style={{ color: "#9ca3af", fontSize: 13, fontWeight: 600 }}>A carregar...</div>
      </div>
    </>
  );

  return (
    <>
      <style>{CSS}</style>
      {!user ? <AuthScreen /> : isAdmin ? <AdminPanel user={user} onLogout={handleLogout} /> : <ClientApp user={user} onLogout={handleLogout} />}
    </>
  );
}
