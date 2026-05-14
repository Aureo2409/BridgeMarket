import { useState } from "react";
import { sb, uploadProof } from "../../lib/supabase.js";
import { DESTS } from "../../lib/constants.js";

const Icon = ({ name, size = 16, color = "currentColor", style }) => {
  const paths = {
    bank: <><rect x="3" y="21" width="18" height="2" rx="1" ry="1" /><rect x="5" y="11" width="3" height="8" rx="1" ry="1" /><rect x="11" y="11" width="3" height="8" rx="1" ry="1" /><rect x="17" y="11" width="3" height="8" rx="1" ry="1" /><path d="M12 2L2 9h20L12 2z" /></>,
    file: <><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" /><polyline points="13 2 13 9 20 9" /></>,
    upload: <><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></>,
    shield: <><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></>,
    arrowLeft: <><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></>
  };
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}>
      {paths[name]}
    </svg>
  );
};

export function ProofUpload({ order, user, config, onSuccess, onBack }) {
  const [file, setFile] = useState(null);
  const [ref, setRef] = useState("");
  const [prog, setProg] = useState(0);
  const [loading, setL] = useState(false);
  const [error, setErr] = useState("");

  const destInfo = DESTS.find(d => d.id === order?.destination);
  const mcxNum = config?.mcx_number ?? "—";
  const mcxName = config?.mcx_name ?? "Bridge Marketplace";

  async function submit() {
    if (!file && !ref.trim()) { setErr("Anexa o comprovante ou insere a referência MCX."); return; }
    setL(true); setErr(""); setProg(10);

    try {
      let fileUrl = null;
      let fileName = null;

      if (file) {
        setProg(30);
        const { path, signedUrl } = await uploadProof(user.id, order.id, file);
        fileUrl = signedUrl ?? `storage://${path}`;
        fileName = file.name;
        setProg(75);
      }

      const { error: dbErr } = await sb.from("payment_proofs").insert({
        order_id: order.id,
        user_id: user.id,
        file_url: fileUrl ?? `ref://${ref}`,
        file_name: fileName,
        tx_reference: ref || null,
        status: "pending",
      });

      if (dbErr) throw dbErr;
      setProg(100);
      // trg_advance_on_proof trigger avança o pedido para payment_received automaticamente
      setTimeout(onSuccess, 400);
    } catch (e) {
      setErr(e.message ?? "Erro ao enviar.");
      setProg(0);
    }
    setL(false);
  }

  return (
    <>
      <div style={{ fontWeight: 900, fontSize: 19, color: "#1e1b4b", marginBottom: 3, letterSpacing: "-.5px" }}>
        Enviar comprovante
      </div>
      <div style={{ fontSize: 12, color: "#9ca3af", marginBottom: 14, fontWeight: 500 }}>
        Comprovante do pagamento Multicaixa Express
      </div>

      {/* Mini order card */}
      {order && (
        <div className="card" style={{ padding: "11px 14px", marginBottom: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 11, color: "#6b7280", fontWeight: 600 }}>
              {order.order_ref ?? "#" + order.id.slice(0, 8).toUpperCase()}
            </span>
            <span style={{ fontSize: 17, fontWeight: 900, color: "#6366f1" }}>
              ${parseFloat(order.amount_usd).toFixed(2)}
            </span>
          </div>
          <div style={{ fontSize: 11, color: "#9ca3af", fontWeight: 600, marginTop: 2 }}>
            {parseFloat(order.amount_aoa).toLocaleString("pt-AO")} Kz → {destInfo?.label} {destInfo?.icon}
          </div>
        </div>
      )}

      {/* Payment instructions */}
      <div className="warn" style={{ flexDirection: "column", gap: 6 }}>
        <div style={{ fontWeight: 800, color: "#78350f", marginBottom: 2, display: "flex", alignItems: "center", gap: 6 }}><Icon name="bank" size={14} /> Como pagar pelo Multicaixa Express</div>
        <div style={{ lineHeight: 1.8 }}>
          1. Número: <strong>{mcxNum}</strong> ({mcxName})<br />
          2. Valor: <strong>{order ? parseFloat(order.amount_aoa).toLocaleString("pt-AO") : "—"} Kz</strong><br />
          3. Referência: <strong>{order?.order_ref ?? "—"}</strong><br />
          4. Faz upload do comprovante abaixo
        </div>
      </div>

      {/* Upload zone */}
      <div
        className={`upload-zone${file ? " has-file" : ""}`}
        onClick={() => document.getElementById("pf-inp").click()}
      >
        <input id="pf-inp" type="file" accept="image/jpeg,image/png,image/webp,application/pdf"
          style={{ display: "none" }}
          onChange={e => { if (e.target.files[0]) { setFile(e.target.files[0]); setErr(""); } }} />
        <div className="up-icon">{file ? <Icon name="file" size={24} /> : <Icon name="upload" size={24} />}</div>
        <div className="up-title">{file ? file.name : "Clica para seleccionar o comprovante"}</div>
        <div className="up-sub">
          {file
            ? `${(file.size / 1024).toFixed(1)} KB · ${file.type}`
            : "PNG, JPG, WEBP ou PDF — máx. 5 MB"}
        </div>
        {loading && prog > 0 && prog < 100 && (
          <div className="up-prog"><div className="up-fill" style={{ width: `${prog}%` }} /></div>
        )}
      </div>

      <div style={{ margin: "12px 0 5px", fontSize: 10, color: "#9ca3af", fontWeight: 700, textAlign: "center", textTransform: "uppercase", letterSpacing: .5 }}>
        — ou indica a referência —
      </div>

      <label className="lbl">ID / Referência da transação MCX</label>
      <input className="inp" style={{ marginBottom: 10 }} type="text"
        placeholder="Ex: MCX-2025-00123456"
        value={ref} onChange={e => { setRef(e.target.value); setErr(""); }} />

      {error && (
        <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 11, padding: "9px 13px", fontSize: 12, color: "#b91c1c", fontWeight: 600, marginBottom: 11 }}>
          <Icon name="shield" size={16} style={{ flexShrink: 0 }} /> {error}
        </div>
      )}

      <div className="info" style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <Icon name="shield" size={16} style={{ flexShrink: 0 }} /> O sistema valida automaticamente: IBAN de origem, data/hora (máx. 30 min), ID único e valor.
      </div>

      <button className="btn btn-p" onClick={submit} disabled={loading || (!file && !ref.trim())}>
        {loading ? `A enviar... ${prog}%` : <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}><Icon name="upload" size={14} /> Enviar comprovante</div>}
      </button>
      <button className="btn btn-o" onClick={onBack}><div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}><Icon name="arrowLeft" size={14} /> Voltar</div></button>
    </>
  );
}
