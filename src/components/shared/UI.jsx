import { STATUS_META } from "../../lib/constants.js";

export function Icon({ name, size = 16, color = "currentColor", className, style }) {
  const paths = {
    user: <><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></>,
    loader: <path d="M21 12a9 9 0 1 1-6.219-8.56" />,
    alertTriangle: <><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></>,
    trash: <><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /><line x1="10" y1="11" x2="10" y2="17" /><line x1="14" y1="11" x2="14" y2="17" /></>,
    lock: <><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></>,
    arrowRight: <><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></>,
    arrowLeft: <><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></>,
    checkCircle: <><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></>,
    xCircle: <><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></>,
    globe: <><circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></>,
    check: <polyline points="20 6 9 17 4 12" />,
    file: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></>,
    clipboard: <><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" /><rect x="8" y="2" width="8" height="4" rx="1" ry="1" /></>,
    sun: <><circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" /></>,
    moon: <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />,
    bank: <><rect x="3" y="21" width="18" height="2" rx="1" ry="1" /><rect x="5" y="11" width="3" height="8" rx="1" ry="1" /><rect x="11" y="11" width="3" height="8" rx="1" ry="1" /><rect x="17" y="11" width="3" height="8" rx="1" ry="1" /><path d="M12 2L2 9h20L12 2z" /></>,
    chart: <><line x1="12" y1="20" x2="12" y2="10" /><line x1="18" y1="20" x2="18" y2="4" /><line x1="6" y1="20" x2="6" y2="16" /></>,
    inbox: <><polyline points="22 12 16 12 14 15 10 15 8 12 2 12" /><path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" /></>,
    upload: <><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></>,
    shield: <><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></>,
    creditCard: <><rect x="1" y="4" width="22" height="16" rx="2" ry="2" /><line x1="1" y1="10" x2="23" y2="10" /></>,
    x: <><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></>,
    bell: <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9 M13.73 21a2 2 0 0 1-3.46 0" />,
    bellOff: <><path d="M13.73 21a2 2 0 0 1-3.46 0" /><path d="M18.63 13A17.89 17.89 0 0 1 18 8" /><path d="M6.26 6.26A5.86 5.86 0 0 0 6 8c0 7-3 9-3 9h14" /><path d="M18 8a6 6 0 0 0-9.33-5" /><line x1="1" y1="1" x2="23" y2="23" /></>,
    ban: <><circle cx="12" cy="12" r="10" /><line x1="4.93" y1="4.93" x2="19.07" y2="19.07" /></>,
    settings: <><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" /></>,
    cart: <><circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" /><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" /></>,
    money: <><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></>,
    mail: <><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></>,
    edit: <><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></>,
    save: <><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" /><polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" /></>,
    download: <><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></>,
    info: <><circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" /></>,
    arrowUpRight: <><line x1="7" y1="17" x2="17" y2="7" /><polyline points="7 7 17 7 17 17" /></>,
    list: <><line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" /></>,
    clock: <><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></>
  };
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      {paths[name]}
    </svg>
  );
}

export function Toast({ toast }) {
  if (!toast) return null;
  return <div className={`toast ${toast.type}`}>{toast.msg}</div>;
}

export function StepBar({ step }) {
  const labels = ["Calcular", "Confirmar", "Comprovante", "Concluído"];
  return (
    <div className="steps-bar">
      {labels.map((_, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", flex: i < labels.length - 1 ? 1 : "unset" }}>
          <div className={`sdot ${step > i ? "done" : step === i ? "active" : "idle"}`}>
            {step > i ? "✓" : i + 1}
          </div>
          {i < labels.length - 1 && <div className={`sline${step > i ? " done" : ""}`} />}
        </div>
      ))}
    </div>
  );
}

export function StatusPill({ status }) {
  const m = STATUS_META[status] ?? STATUS_META.failed;
  return (
    <span className="pill" style={{ background: m.bg, color: m.color, display: "inline-flex", alignItems: "center", gap: 5 }}>
      <Icon name={m.icon} size={12} color={m.color} />
      <span>{m.label}</span>
    </span>
  );
}

export function Header({ appliedRate, rateAnim, onOrdersClick, showOrders, user, onLogout, onProfileClick, showProfile, avatarUrl, creditsBalance, onCreditsClick }) {
  return (
    <div className="hdr" style={{ position: "sticky", top: 0, zIndex: 1000 }}>
      <div className="logo">
        <div className="logo-mark" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg viewBox="185 -45 500 500" width="18" height="18">
            <path d="M 230,300 C 230,170 310,120 375,120 C 420,120 445,160 445,210" fill="none" stroke="#fff" strokeWidth="36" strokeLinecap="butt" strokeLinejoin="round" />
            <path d="M 425,210 C 425,160 450,120 495,120 C 560,120 640,170 640,300" fill="none" stroke="#fff" strokeWidth="36" strokeLinecap="butt" strokeLinejoin="round" />
            <path d="M 375,120 C 375,170 350,260 350,300" fill="none" stroke="#fff" strokeWidth="36" strokeLinecap="butt" strokeLinejoin="round" />
            <path d="M 362,210 C 390,190 410,165 445,150" fill="none" stroke="#fff" strokeWidth="36" strokeLinecap="butt" strokeLinejoin="round" />
            <path d="M 362,210 C 390,230 435,260 490,300" fill="none" stroke="#fff" strokeWidth="36" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M 200,210 L 670,210" fill="none" stroke="#fff" strokeWidth="36" strokeLinecap="butt" strokeLinejoin="round" />
          </svg>
        </div>
        <div>
          <div className="logo-text">Bridge</div>
          <div className="logo-sub">AOA / USD</div>
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
        <div className="rate-chip">
          <div className="live-dot" />
          {parseFloat(appliedRate).toLocaleString("pt-AO")} Kz/$
        </div>
        {user && (
          <>
            {typeof creditsBalance === "number" && (
              <button
                className="btn-g"
                onClick={onCreditsClick}
                title="A Minha Carteira de Créditos"
                style={{
                  display: "flex", alignItems: "center", gap: 5,
                  height: 30, padding: "0 10px", borderRadius: 8,
                  background: creditsBalance > 0 ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.08)",
                  border: "none", cursor: "pointer", transition: "all 0.2s"
                }}
              >
                <Icon name="creditCard" size={13} color={creditsBalance > 0 ? "#059669" : "#dc2626"} />
                <span style={{ fontSize: 12, fontWeight: 800, color: creditsBalance > 0 ? "#059669" : "#dc2626" }}>
                  {creditsBalance}
                </span>
              </button>
            )}
            <button className="btn-g" onClick={onOrdersClick} title="Os Meus Pedidos" style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 30, height: 30, borderRadius: 8, background: showOrders && !showProfile ? "rgba(99,102,241,0.12)" : "rgba(99,102,241,0.06)", border: "none", color: "#6366f1", cursor: "pointer", transition: "all 0.2s" }}>
              <Icon name="list" size={14} />
            </button>
            <button className="btn-g" onClick={onProfileClick} title="O Meu Perfil" style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 30, height: 30, borderRadius: 8, background: showProfile ? "rgba(99,102,241,0.12)" : "rgba(99,102,241,0.06)", border: "none", color: "#6366f1", cursor: "pointer", transition: "all 0.2s", overflow: "hidden", padding: 0 }}>
              {avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                <Icon name="user" size={14} />
              )}
            </button>
            <button className="btn-g" onClick={onLogout} style={{ color: "#ef4444", fontSize: 12, fontWeight: 700, border: "none", background: "none", cursor: "pointer", marginLeft: 4 }}>Sair</button>
          </>
        )}
      </div>
    </div>
  );
}

export function ConfirmModal({ isOpen, title, message, confirmText = "Confirmar", cancelText = "Cancelar", onConfirm, onCancel }) {
  if (!isOpen) return null;
  return (
    <div style={{
      position: "fixed",
      inset: 0,
      background: "rgba(15, 23, 42, 0.75)",
      backdropFilter: "blur(4px)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 9999,
      padding: 16,
      animation: "fadeIn 0.2s ease-out"
    }}>
      <div style={{
        background: "#fff",
        borderRadius: 20,
        padding: "24px 20px",
        width: "100%",
        maxWidth: 400,
        boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
        border: "1px solid rgba(229, 231, 235, 0.5)",
        textAlign: "center",
        animation: "scaleUp 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)"
      }}>
        <div style={{
          width: 50,
          height: 50,
          borderRadius: "50%",
          background: "rgba(99, 102, 241, 0.1)",
          color: "#6366f1",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 16px",
          fontSize: 24
        }}>
          ⚠️
        </div>
        <h3 style={{ fontSize: 17, fontWeight: 900, color: "#1e1b4b", marginBottom: 8, letterSpacing: "-0.3px" }}>
          {title}
        </h3>
        <p style={{ fontSize: 12.5, color: "#64748b", lineHeight: 1.6, marginBottom: 24 }}>
          {message}
        </p>
        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={onConfirm}
            style={{
              flex: 1,
              background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
              border: "none",
              color: "#fff",
              padding: "10px 14px",
              borderRadius: 12,
              fontSize: 12,
              fontWeight: 800,
              cursor: "pointer",
              boxShadow: "0 4px 12px rgba(99,102,241,0.18)",
              transition: "transform 0.15s ease"
            }}
          >
            {confirmText}
          </button>
          <button
            onClick={onCancel}
            style={{
              flex: 1,
              background: "#f1f5f9",
              border: "none",
              color: "#475569",
              padding: "10px 14px",
              borderRadius: 12,
              fontSize: 12,
              fontWeight: 800,
              cursor: "pointer"
            }}
          >
            {cancelText}
          </button>
        </div>
      </div>
    </div>
  );
}

