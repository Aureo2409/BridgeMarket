import { STATUS_META } from "../../lib/constants.js";

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
    <span className="pill" style={{ background: m.bg, color: m.color }}>
      {m.icon} {m.label}
    </span>
  );
}

export function Header({ appliedRate, rateAnim, onOrdersClick, showOrders, user, onLogout }) {
  return (
    <div className="hdr">
      <div className="logo">
        <div className="logo-mark">₿</div>
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
            <button className="btn-g" onClick={onOrdersClick}>
              {showOrders ? "← Voltar" : "📋"}
            </button>
            <button className="btn-g" onClick={onLogout} style={{ color: "#ef4444" }}>Sair</button>
          </>
        )}
      </div>
    </div>
  );
}
