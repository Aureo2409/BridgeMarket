import { useState, useEffect } from "react";
import { sb } from "../../lib/supabase.js";
import { DESTS, STATUS_META } from "../../lib/constants.js";
import { Toast, StatusPill, Icon } from "../shared/UI.jsx";


// ── ConfigField — each field needs its own component so hooks work correctly ──
function ConfigField({ field, initialValue, onSave }) {
  const [val, setVal] = useState(initialValue ?? "");
  useEffect(() => { setVal(initialValue ?? ""); }, [initialValue]);
  return (
    <div className="adm-card" style={{ cursor: "default", marginBottom: 9 }}>
      <div style={{ fontSize: 9, color: "#475569", fontWeight: 700, marginBottom: 6, textTransform: "uppercase", letterSpacing: .4 }}>
        {field.label}
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <input
          className="adm-inp" style={{ marginBottom: 0, flex: 1 }}
          type={field.type} placeholder={field.ph}
          value={val} onChange={e => setVal(e.target.value)}
        />
        <button
          onClick={() => onSave(field.key, val)}
          style={{ padding: "10px 14px", border: "none", borderRadius: 9, background: "#6366f1", color: "#fff", cursor: "pointer", fontSize: 12, fontWeight: 800, flexShrink: 0 }}>
          Guardar
        </button>
      </div>
    </div>
  );
}

const CONFIG_FIELDS = [
  { key: "mcx_number", label: "Número MCX Express", type: "text", ph: "923 000 000" },
  { key: "mcx_name", label: "Nome na conta MCX", type: "text", ph: "Bridge Marketplace" },
  { key: "min_amount_usd", label: "Valor mínimo (USD)", type: "number", ph: "10" },
  { key: "max_amount_usd", label: "Valor máximo (USD)", type: "number", ph: "5000" },
  { key: "support_whatsapp", label: "WhatsApp suporte (intl.)", type: "text", ph: "244923000000" },
];

function ConfigTab({ config, updateConfig }) {
  return (
    <>
      <span className="adm-section">Configurações do marketplace</span>
      {CONFIG_FIELDS.map(f => (
        <ConfigField key={f.key} field={f} initialValue={config[f.key]} onSave={updateConfig} />
      ))}
    </>
  );
}

const ALERT_COLOR = {
  new_order: "#f59e0b",
  payment_received: "#10b981",
  kyc_pending: "#6366f1",
  cancelled: "#ef4444",
};

export function AdminPanel({ user, onLogout }) {
  const [tab, setTab] = useState("alerts");
  const [alerts, setAlerts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [proofs, setProofs] = useState({});
  const [stats, setStats] = useState(null);
  const [rate, setRate] = useState({ base_rate: 1150, margin: 15, applied_rate: 1165 });
  const [config, setConfig] = useState({});
  const [newBase, setNB] = useState("");
  const [newMargin, setNM] = useState("");
  const [rateLoad, setRL] = useState(false);
  const [currencyDrafts, setCurrencyDrafts] = useState({
    EUR: { base: "", margin: "" },
    BRL: { base: "", margin: "" },
    ZAR: { base: "", margin: "" },
  });
  const [toast, setToast] = useState(null);
  const [kycs, setKycs] = useState([]);
  const [rejectedKycs, setRejectedKycs] = useState([]);
  const [accessRequests, setAccessRequests] = useState([]);
  const [editingOrder, setEditingOrder] = useState(null);
  const [editForm, setEditForm] = useState({});

  const unread = alerts.filter(a => !a.read).length;
  const toast_ = (msg, type = "ok") => { setToast({ msg, type }); setTimeout(() => setToast(null), 3000); };

  function playAlertSound() {
    try {
      const audio = new Audio("https://actions.google.com/sounds/v1/cartoon/pop.ogg");
      audio.volume = 0.6; // Ajusta o volume (0.0 a 1.0)
      audio.play().catch(e => console.warn("O navegador bloqueou o áudio automático:", e));
    } catch (e) { }
  }

  useEffect(() => {
    boot();
    const ch = sb.channel("adm_rt")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "admin_alerts" }, p => {
        setAlerts(prev => [p.new, ...prev]);
        toast_("Novo alerta: " + p.new.title);
        playAlertSound();
      })
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "payment_proofs" }, p => {
        setProofs(prev => ({ ...prev, [p.new.order_id]: p.new }));
        toast_("Comprovante recebido!");
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "kyc_verifications" }, () => fetchKycs())
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, () => { fetchOrders(); fetchStats(); })
      .on("postgres_changes", { event: "*", schema: "public", table: "credit_recharges" }, () => fetchPendingRecharges())
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "exchange_rates" }, p => setRate(p.new))
      .subscribe();
    return () => sb.removeChannel(ch);
  }, []);

  async function boot() {
    await Promise.all([fetchAlerts(), fetchOrders(), fetchProofs(), fetchStats(), fetchConfig(), fetchKycs(), fetchPendingRecharges()]);
    const { data } = await sb.from("exchange_rates").select("*").order("fetched_at", { ascending: false }).limit(1).maybeSingle();
    if (data) setRate(data);
  }

  async function fetchAlerts() {
    const { data } = await sb.from("admin_alerts").select("*").order("created_at", { ascending: false }).limit(80);
    if (data) setAlerts(data);
  }
  async function fetchOrders() {
    const { data } = await sb.from("orders").select("*").order("created_at", { ascending: false }).limit(1000);
    if (data) setOrders(data);
  }
  async function fetchProofs() {
    const { data } = await sb.from("payment_proofs").select("*").order("created_at", { ascending: false });
    if (data) { const m = {}; data.forEach(p => { m[p.order_id] = p; }); setProofs(m); }
  }
  async function fetchStats() {
    const { data } = await sb.from("daily_stats").select("*").maybeSingle();
    if (data) setStats(data);
  }
  async function fetchConfig() {
    const { data } = await sb.from("admin_config").select("key,value");
    if (data) setConfig(Object.fromEntries(data.map(r => [r.key, r.value])));
  }

  async function fetchKycs() {
    const { data: pData } = await sb.from("kyc_verifications").select("*, profiles(full_name, phone)").eq("ocr_status", "pending").order("created_at", { ascending: false });
    if (pData) {
      const updatedKycs = await Promise.all(pData.map(async (k) => {
        let docSigned = k.document_url;
        let selfieSigned = k.selfie_url;
        if (k.document_url && !k.document_url.startsWith("http")) {
          const { data: dData } = await sb.storage.from("Documentos kyc").createSignedUrl(k.document_url, 3600);
          if (dData) docSigned = dData.signedUrl;
        }
        if (k.selfie_url && !k.selfie_url.startsWith("http")) {
          const { data: sData } = await sb.storage.from("Documentos kyc").createSignedUrl(k.selfie_url, 3600);
          if (sData) selfieSigned = sData.signedUrl;
        }
        return { ...k, docSigned, selfieSigned };
      }));
      setKycs(updatedKycs);
    } else setKycs([]);

    // Puxar também o histórico de rejeitados
    const { data: rData } = await sb.from("kyc_verifications").select("*, profiles(full_name, phone)").eq("ocr_status", "rejected").order("updated_at", { ascending: false });
    if (rData) setRejectedKycs(rData);
  }

  async function fetchPendingRecharges() {
    const { data, error } = await sb
      .from("credit_recharges")
      .select("id, user_id, package_id, amount_kz, credits_added, proof_url, created_at, profiles!credit_recharges_user_id_fkey(full_name, phone)")
      .eq("status", "pending_payment")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Erro ao buscar recargas pendentes:", error);
      return;
    }

    if (data) {
      const requestsWithUrls = await Promise.all(data.map(async (r) => {
        let signedUrl = r.proof_url;
        if (r.proof_url && !r.proof_url.startsWith("http")) {
          const { data: sData } = await sb.storage.from("comprovantes de pagamento").createSignedUrl(r.proof_url, 3600);
          if (sData) signedUrl = sData.signedUrl;
        }
        return {
          id: r.id,
          user_id: r.user_id,
          full_name: r.profiles?.full_name,
          phone: r.profiles?.phone,
          package_id: r.package_id,
          amount_kz: r.amount_kz,
          credits_added: r.credits_added,
          proof_url: r.proof_url,
          created_at: r.created_at,
          signedUrl
        };
      }));
      setAccessRequests(requestsWithUrls);
    } else {
      setAccessRequests([]);
    }
  }

  async function approveRecharge(recharge) {
    setRL(true);
    try {
      // 1. Buscar saldo actual do utilizador
      const { data: profileData, error: profErr } = await sb
        .from("profiles")
        .select("credits_balance")
        .eq("id", recharge.user_id)
        .maybeSingle();
      if (profErr) throw profErr;

      const newBalance = (parseInt(profileData?.credits_balance || 0, 10)) + recharge.credits_added;

      // 2. Creditar a carteira do utilizador
      const { error: updErr } = await sb.from("profiles")
        .update({ credits_balance: newBalance })
        .eq("id", recharge.user_id);
      if (updErr) throw updErr;

      // 3. Marcar recarga como confirmada
      const { error: rechErr } = await sb.from("credit_recharges")
        .update({ status: "confirmed", confirmed_at: new Date().toISOString() })
        .eq("id", recharge.id);
      if (rechErr) throw rechErr;

      // 4. Log de auditoria
      await sb.from("credit_transactions").insert({
        user_id: recharge.user_id,
        recharge_id: recharge.id,
        type: "recharge",
        amount: recharge.credits_added,
        balance_after: newBalance
      });

      // 5. Notificar o utilizador via WhatsApp
      if (recharge.phone) {
        await sb.from("notifications").insert({
          user_id: recharge.user_id,
          channel: "whatsapp",
          recipient_phone: recharge.phone,
          message_body: `Olá ${recharge.full_name || "Cliente"}, a tua recarga de ${recharge.amount_kz?.toLocaleString("pt-AO")} Kz foi confirmada! ${recharge.credits_added} créditos já estão disponíveis na tua conta — cada crédito dá direito a 1 transacção completa na Bridge. Bons negócios!`,
          status: "pending"
        });
      }

      toast_(`Recarga aprovada — ${recharge.credits_added} créditos creditados!`, "ok");
      fetchPendingRecharges();
    } catch (err) {
      toast_("Erro ao aprovar recarga: " + err.message, "err");
    } finally {
      setRL(false);
    }
  }

  async function rejectRecharge(recharge) {
    const reason = window.prompt("Motivo da rejeição (será enviado por notificação):");
    if (reason === null) return;

    const { error } = await sb.from("credit_recharges")
      .update({ status: "rejected", rejection_reason: reason || "Comprovativo inválido ou ilegível" })
      .eq("id", recharge.id);

    if (error) {
      toast_("Erro ao rejeitar: " + error.message, "err");
    } else {
      toast_("Recarga rejeitada.");
      fetchPendingRecharges();

      if (recharge.proof_url && !recharge.proof_url.startsWith("http")) {
        await sb.storage.from("comprovantes de pagamento").remove([recharge.proof_url]);
      }

      if (recharge.phone) {
        await sb.from("notifications").insert({
          user_id: recharge.user_id,
          channel: "whatsapp",
          recipient_phone: recharge.phone,
          message_body: `Olá ${recharge.full_name || "Cliente"}, a tua recarga de ${recharge.amount_kz?.toLocaleString("pt-AO")} Kz foi recusada. Motivo: ${reason || "Comprovativo inválido ou ilegível"}. Por favor, tenta novamente submetendo o comprovativo correto.`,
          status: "pending"
        });
      }
    }
  }

  async function markRead(id) {
    await sb.from("admin_alerts").update({ read: true }).eq("id", id);
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, read: true } : a));
  }
  async function markAllRead() {
    await sb.from("admin_alerts").update({ read: true }).eq("read", false);
    setAlerts(prev => prev.map(a => ({ ...a, read: true })));
  }
  async function markSent(orderId) {
    const { error } = await sb.from("orders")
      .update({ status: "completed", sent_at: new Date().toISOString() })
      .eq("id", orderId);
    if (error) toast_(error.message, "err");
    else { toast_("Marcado como enviado!"); fetchOrders(); fetchStats(); }
  }
  async function updateRate() {
    const base = parseFloat(newBase);
    const margin = parseFloat(newMargin) || parseFloat(rate.margin);
    if (!base || base <= 0) { toast_("Taxa inválida", "err"); return; }
    setRL(true);
    // Buscar a linha mais recente directamente da BD (não confiar apenas no
    // estado local 'rate'), para herdar as taxas EUR/BRL/ZAR mais actuais
    // possíveis e nunca reverter uma publicação recente de outra moeda.
    const { data: freshRate } = await sb.from("exchange_rates")
      .select("*").order("fetched_at", { ascending: false }).limit(1).maybeSingle();
    const current = freshRate || rate;
    const { error } = await sb.from("exchange_rates").insert({
      base_rate: base, margin, source: "manual",
      eur_rate: current.eur_rate || null,
      brl_rate: current.brl_rate || null,
      zar_rate: current.zar_rate || null,
      last_auto_sync: current.last_auto_sync || null,
    });
    setRL(false);
    if (error) { toast_(error.message, "err"); return; }
    toast_("Câmbio publicado!"); setNB(""); setNM("");
  }
  async function updateConfig(key, value) {
    await sb.from("admin_config").upsert({ key, value, updated_at: new Date().toISOString() });
    setConfig(prev => ({ ...prev, [key]: value }));
    toast_("Configuração guardada!");
  }

  async function updateKyc(k, status) {
    let reason = null;
    if (status === "rejected") {
      reason = window.prompt("Motivo da rejeição (será mostrado ao cliente):");
      if (reason === null) return; // Cancela a acção se fechares a janela
    }

    const updates = { liveness_status: status, ocr_status: status, updated_at: new Date().toISOString() };
    if (status === "rejected") {
      updates.rejection_reason = reason || "Documentos ilegíveis ou inválidos.";

      // Apagar permanentemente os ficheiros pesados do Supabase Storage
      const toRemove = [];
      if (k.document_url && !k.document_url.startsWith("http")) toRemove.push(k.document_url);
      if (k.selfie_url && !k.selfie_url.startsWith("http")) toRemove.push(k.selfie_url);

      if (toRemove.length > 0) {
        await sb.storage.from("Documentos kyc").remove(toRemove);
      }
      updates.document_url = null;
      updates.selfie_url = null;
    }

    const { error } = await sb.from("kyc_verifications").update(updates).eq("id", k.id);
    if (error) {
      if (error.message.includes("violates check constraint") || error.message.includes("kyc_verifications_liven")) {
        toast_("Erro SQL: Por favor, corre o ficheiro fix_kyc_constraints.sql no Supabase!", "err");
      } else {
        toast_(error.message, "err");
      }
    } else {
      toast_("KYC " + (status === "passed" ? "Aprovado" : "Rejeitado"));
      fetchKycs();
      sb.functions.invoke("send-kyc-email", { body: { recordId: k.id, status: status } }).catch(() => { });
    }
  }

  async function remindKyc(userId) {
    toast_("A enviar lembrete...");
    const { error } = await sb.functions.invoke("remind-kyc", { body: { userId } });
    if (error) toast_("Erro ao enviar: " + error.message, "err");
    else toast_("Lembrete enviado com sucesso!");
  }

  function startEdit(o) { setEditingOrder(o.id); setEditForm({ ...o }); }
  function cancelEdit() { setEditingOrder(null); }
  async function saveEdit() {
    const { error } = await sb.from("orders").update({
      amount_usd: editForm.amount_usd,
      amount_aoa: editForm.amount_aoa,
      rate_applied: editForm.rate_applied,
      destination: editForm.destination,
      destination_account: editForm.destination_account,
      status: editForm.status
    }).eq("id", editingOrder);
    if (error) toast_(error.message, "err");
    else { toast_("Atualizado!"); setEditingOrder(null); fetchOrders(); fetchStats(); }
  }

  function exportToCSV() {
    if (orders.length === 0) { toast_("Nenhum pedido", "err"); return; }
    const headers = ["ID", "Ref", "Data/Hora", "Status", "USD", "AOA", "Taxa AOA/USD",
      "Destino", "Conta Destino", "Motivo Cambial", "Comprador ID", "Vendedor ID",
      "Comprovativo", "Avaliação Vendedor", "Avaliação Comprador"];
    const rows = orders.map(o => [
      o.id,
      o.order_ref || "",
      new Date(o.created_at).toLocaleString("pt-AO").replace(/,/g, ""),
      o.status,
      parseFloat(o.amount_usd || 0).toFixed(2),
      parseFloat(o.amount_aoa || 0).toFixed(2),
      o.rate_applied || "1140",
      o.destination || "",
      o.destination_account || "",
      o.exchange_reason || "Não declarado",
      o.user_id || "",
      o.funder_id || "",
      o.proof_url ? "Sim" : "Não",
      o.funder_rating || "",
      o.buyer_rating || ""
    ]);
    const csvContent = [headers.join(","), ...rows.map(e => e.map(v => `"${v}"`).join(","))].join("\n");
    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `bridge_relatorio_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast_("Relatório exportado com sucesso", "ok");
  }

  function exportUIFReport() {
    const completed = orders.filter(o => o.status === "completed");
    if (completed.length === 0) { toast_("Sem transacções concluídas", "err"); return; }

    // Relatório UIF — formato conforme Lei 34/11
    const headers = [
      "ID_TRANSACCAO", "REFERENCIA", "DATA_OPERACAO", "HORA_OPERACAO",
      "VALOR_USD", "VALOR_AOA", "TAXA_CAMBIO",
      "MOTIVO_CAMBIAL", "DESTINO_FUNDOS", "CONTA_DESTINO",
      "ID_COMPRADOR", "ID_VENDEDOR",
      "KYC_COMPRADOR", "KYC_VENDEDOR",
      "COMPROVATIVO_SUBMETIDO", "ESTADO_FINAL"
    ];
    const rows = completed.map(o => {
      const dt = new Date(o.created_at);
      return [
        o.id,
        o.order_ref || "",
        dt.toLocaleDateString("pt-AO"),
        dt.toLocaleTimeString("pt-AO"),
        parseFloat(o.amount_usd || 0).toFixed(2),
        parseFloat(o.amount_aoa || 0).toFixed(2),
        o.rate_applied || "1140",
        o.exchange_reason || "NAO_DECLARADO",
        o.destination || "",
        o.destination_account || "",
        o.user_id || "",
        o.funder_id || "",
        o.kyc_status_buyer || "VERIFICADO",
        o.kyc_status_seller || "VERIFICADO",
        o.proof_url ? "SIM" : "NAO",
        "CONCLUIDO"
      ];
    });

    // Adicionar resumo no topo
    const totalUSD = completed.reduce((s, o) => s + parseFloat(o.amount_usd || 0), 0);
    const totalAOA = completed.reduce((s, o) => s + parseFloat(o.amount_aoa || 0), 0);
    const summary = [
      [`# RELATÓRIO UIF — BRIDGE MARKET`],
      [`# Gerado em: ${new Date().toLocaleString("pt-AO")}`],
      [`# Total de transacções: ${completed.length}`],
      [`# Volume total USD: $${totalUSD.toFixed(2)}`],
      [`# Volume total AOA: ${totalAOA.toFixed(2)} Kz`],
      [`# Conformidade: Lei 34/11 — Prevenção e Combate ao Branqueamento de Capitais`],
      [`# Promotor: Aureo Mendes — Bridge Market — Luanda, Angola`],
      [``],
    ];

    const csvContent = [
      ...summary.map(r => r[0]),
      headers.join(","),
      ...rows.map(e => e.map(v => `"${v}"`).join(","))
    ].join("\n");

    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `bridge_relatorio_UIF_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast_(`Relatório UIF exportado — ${completed.length} transacções`, "ok");
  }

  const TABS = [
    { id: "alerts", icon: "bell", label: unread > 0 ? ` (${unread})` : "" },
    { id: "orders", icon: "list" },
    { id: "cancelled", icon: "ban" },
    { id: "rate", icon: "chart" },
    { id: "kyc", icon: "user" },
    { id: "config", icon: "settings" },
  ];

  return (
    <div className="adm-shell">
      <Toast toast={toast} />

      <div className="adm-hdr">
        <div className="adm-logo" style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Icon name="settings" size={18} /> Bridge Admin
          {unread > 0 && <span className="adm-badge">{unread}</span>}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 10, color: "#334155", fontWeight: 600 }}>{user.email}</span>
          <button onClick={onLogout} style={{ background: "#0f172a", border: "1px solid rgba(255,255,255,.1)", borderRadius: 7, padding: "5px 10px", fontSize: 11, fontWeight: 700, color: "#94a3b8", cursor: "pointer" }}>Sair</button>
        </div>
      </div>

      <div className="adm-tabs">
        {TABS.map(t => (
          <button key={t.id} className={`adm-tab${tab === t.id ? " on" : ""}`} onClick={() => setTab(t.id)}>
            <Icon name={t.icon} size={16} />
            {t.label && <span style={{ marginLeft: 4 }}>{t.label}</span>}
          </button>
        ))}
      </div>

      <div className="adm-pg">

        {/* ── ALERTS ── */}
        {tab === "alerts" && (
          <>
            {/* Stats */}
            {stats && (
              <div className="adm-stat-grid">
                <div className="adm-stat">
                  <div className="adm-stat-val">{stats.orders_completed ?? 0}</div>
                  <div className="adm-stat-lbl">Pedidos hoje</div>
                </div>
                <div className="adm-stat">
                  <div className="adm-stat-val">${parseFloat(stats.total_usd_sent ?? 0).toFixed(0)}</div>
                  <div className="adm-stat-lbl">USD enviados hoje</div>
                </div>
                <div className="adm-stat">
                  <div className="adm-stat-val">{stats.orders_pending ?? 0}</div>
                  <div className="adm-stat-lbl">A aguardar pagto.</div>
                </div>
                <div className="adm-stat">
                  <div className="adm-stat-val">{parseFloat(stats.current_rate ?? rate.applied_rate).toLocaleString("pt-AO")}</div>
                  <div className="adm-stat-lbl">Kz/$ actual</div>
                </div>
              </div>
            )}

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <span className="adm-section" style={{ marginBottom: 0 }}>Notificações em tempo real</span>
              {unread > 0 && <button onClick={markAllRead} style={{ background: "none", border: "none", fontSize: 10, fontWeight: 700, color: "#6366f1", cursor: "pointer" }}>Marcar todas lidas</button>}
            </div>

            {alerts.length === 0 && (
              <div style={{ textAlign: "center", padding: "36px 0", color: "#334155", fontSize: 13, fontWeight: 600 }}>
                <div style={{ marginBottom: 12, display: "flex", justifyContent: "center" }}><Icon name="bellOff" size={34} color="#94a3b8" /></div>Sem notificações
              </div>
            )}

            {alerts.map(a => (
              <div key={a.id} className={`adm-card${!a.read ? " alert-new" : ""}`} style={{ cursor: "pointer" }}
                onClick={() => {
                  if (!a.read) markRead(a.id);
                  if (a.order_id) {
                    setTab("orders");
                    const targetOrder = orders.find(o => o.id === a.order_id);
                    if (targetOrder) startEdit(targetOrder);
                  }
                }}>
                <div className="adm-alert-type" style={{ color: ALERT_COLOR[a.type] ?? "#94a3b8" }}>
                  {a.type === "new_order" ? <div style={{ display: "flex", alignItems: "center", gap: 6 }}><Icon name="cart" size={14} /> NOVO PEDIDO</div>
                    : a.type === "payment_received" ? <div style={{ display: "flex", alignItems: "center", gap: 6 }}><Icon name="money" size={14} /> PAGAMENTO RECEBIDO</div>
                      : a.type === "cancelled" ? <div style={{ display: "flex", alignItems: "center", gap: 6 }}><Icon name="ban" size={14} /> PEDIDO CANCELADO</div>
                        : <div style={{ display: "flex", alignItems: "center", gap: 6 }}><Icon name="bell" size={14} /> ALERTA</div>}
                </div>
                <div className="adm-alert-title">{a.title}</div>
                <div className="adm-alert-body">{a.body}</div>
                <div className="adm-alert-time">{new Date(a.created_at).toLocaleString("pt-AO")}</div>
                {a.type === "payment_received" && a.order_id && (
                  <button className="adm-sent-btn" onClick={e => { e.stopPropagation(); markSent(a.order_id); }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}><Icon name="check" size={14} /> Confirmar envio</div>
                  </button>
                )}
              </div>
            ))}
          </>
        )}

        {/* ── ORDERS ── */}
        {tab === "orders" && (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <span className="adm-section" style={{ marginBottom: 0 }}>Pedidos pendentes / concluídos</span>
              <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                <button onClick={exportToCSV} style={{ background: "none", border: "none", fontSize: 10, fontWeight: 700, color: "#10b981", cursor: "pointer" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}><Icon name="download" size={14} /> Exportar CSV</div>
                </button>
                <button onClick={exportUIFReport} style={{ background: "rgba(79,70,229,.1)", border: "1px solid rgba(79,70,229,.3)", borderRadius: 6, fontSize: 10, fontWeight: 700, color: "#6366f1", cursor: "pointer", padding: "4px 10px", display: "flex", alignItems: "center", gap: 5 }}>
                  <Icon name="download" size={13} /> Relatório UIF
                </button>
              </div>
            </div>
            {orders.filter(o => o.status !== "cancelled" && o.status !== "failed").length === 0 && <div style={{ textAlign: "center", padding: "36px 0", color: "#94a3b8", fontWeight: 600, fontSize: 13 }}>Nenhum pedido activo.</div>}
            {orders.filter(o => o.status !== "cancelled" && o.status !== "failed").map(o => {
              const d = DESTS.find(x => x.id === o.destination);
              const sm = STATUS_META[o.status] ?? STATUS_META.failed;
              const proof = proofs[o.id];
              return (
                <div key={o.id} className="adm-card" style={{ cursor: editingOrder === o.id ? "default" : "pointer" }} onClick={() => { if (editingOrder !== o.id) startEdit(o); }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 7 }}>
                    <div>
                      <div style={{ fontSize: 9, fontFamily: "monospace", color: "#334155", fontWeight: 700 }}>{o.order_ref ?? "#" + o.id.slice(0, 8).toUpperCase()}</div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: "#e2e8f0", marginTop: 2, display: "flex", alignItems: "center", gap: 6 }}>
                        {d?.svg ? (
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 14, height: 14, flexShrink: 0 }} dangerouslySetInnerHTML={{ __html: d.svg }} />
                        ) : null}
                        <span>{d?.label} · {o.destination_account}</span>
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 17, fontWeight: 900, color: "#a5b4fc" }}>${parseFloat(o.amount_usd).toFixed(2)}</div>
                      <div style={{ fontSize: 10, color: "#334155", fontFamily: "monospace" }}>{parseFloat(o.amount_aoa).toLocaleString("pt-AO")} Kz</div>
                    </div>
                  </div>

                  <StatusPill status={o.status} />

                  <div style={{ fontSize: 10, color: "#64748b", fontWeight: 500, marginTop: 4 }}>
                    Taxa {parseFloat(o.rate_applied).toLocaleString("pt-AO")} Kz/$ · {new Date(o.created_at).toLocaleString("pt-AO")}
                  </div>

                  {proof && (
                    <div className="proof-box">
                      <div style={{ fontSize: 9, fontWeight: 800, color: "#10b981", textTransform: "uppercase", letterSpacing: .4, marginBottom: 3 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 4 }}><Icon name="file" size={12} /> Comprovante recebido</div>
                      </div>
                      {proof.file_url?.startsWith("https") ? (
                        <a href={proof.file_url} target="_blank" rel="noopener noreferrer" className="proof-link" onClick={e => e.stopPropagation()} style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                          <Icon name="arrowUpRight" size={11} /> Ver ficheiro
                        </a>
                      ) : (
                        <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 500 }}>
                          {proof.file_name || proof.tx_reference || proof.file_url}
                        </div>
                      )}
                      <div style={{ fontSize: 9, color: "#334155", marginTop: 3 }}>
                        {new Date(proof.created_at).toLocaleString("pt-AO")}
                      </div>
                    </div>
                  )}

                  {editingOrder === o.id ? (
                    <div style={{ marginTop: 10, padding: 10, background: "rgba(0,0,0,.2)", borderRadius: 8 }}>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 10 }}>
                        <div><div style={{ fontSize: 9, color: "#94a3b8", marginBottom: 3 }}>USD</div><input className="adm-inp" style={{ padding: 6, fontSize: 11, marginBottom: 0 }} type="number" value={editForm.amount_usd} onChange={e => setEditForm({ ...editForm, amount_usd: e.target.value })} /></div>
                        <div><div style={{ fontSize: 9, color: "#94a3b8", marginBottom: 3 }}>AOA</div><input className="adm-inp" style={{ padding: 6, fontSize: 11, marginBottom: 0 }} type="number" value={editForm.amount_aoa} onChange={e => setEditForm({ ...editForm, amount_aoa: e.target.value })} /></div>
                        <div><div style={{ fontSize: 9, color: "#94a3b8", marginBottom: 3 }}>Taxa</div><input className="adm-inp" style={{ padding: 6, fontSize: 11, marginBottom: 0 }} type="number" value={editForm.rate_applied} onChange={e => setEditForm({ ...editForm, rate_applied: e.target.value })} /></div>
                        <div>
                          <div style={{ fontSize: 9, color: "#94a3b8", marginBottom: 3 }}>Status</div>
                          <select className="adm-inp" style={{ padding: 6, fontSize: 11, marginBottom: 0 }} value={editForm.status} onChange={e => setEditForm({ ...editForm, status: e.target.value })}>
                            {Object.keys(STATUS_META).map(k => <option key={k} value={k}>{STATUS_META[k].label}</option>)}
                          </select>
                        </div>
                        <div>
                          <div style={{ fontSize: 9, color: "#94a3b8", marginBottom: 3 }}>Destino</div>
                          <select className="adm-inp" style={{ padding: 6, fontSize: 11, marginBottom: 0 }} value={editForm.destination} onChange={e => setEditForm({ ...editForm, destination: e.target.value })}>
                            {DESTS.map(d => <option key={d.id} value={d.id}>{d.label}</option>)}
                          </select>
                        </div>
                        <div><div style={{ fontSize: 9, color: "#94a3b8", marginBottom: 3 }}>Conta Dest.</div><input className="adm-inp" style={{ padding: 6, fontSize: 11, marginBottom: 0 }} type="text" value={editForm.destination_account} onChange={e => setEditForm({ ...editForm, destination_account: e.target.value })} /></div>
                      </div>
                      <div style={{ display: "flex", gap: 8 }}>
                        <button className="adm-btn" style={{ padding: 8, fontSize: 11 }} onClick={saveEdit}><div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}><Icon name="save" size={14} /> Guardar</div></button>
                        <button className="adm-btn" style={{ padding: 8, fontSize: 11, background: "#475569" }} onClick={cancelEdit}>Cancelar</button>
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 }}>
                      {(o.status === "awaiting_payment" || o.status === "payment_received") && <button className="adm-sent-btn" style={{ flex: 1, margin: 0 }} onClick={(e) => { e.stopPropagation(); markSent(o.id); }}><div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}><Icon name="check" size={14} /> Confirmar envio</div></button>}
                      {o.status === "awaiting_kyc" && <button className="adm-sent-btn" style={{ flex: 1, margin: 0, background: "#f59e0b", color: "#fff" }} onClick={(e) => { e.stopPropagation(); remindKyc(o.user_id); }}><div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}><Icon name="mail" size={14} /> Lembrete KYC</div></button>}
                      <button className="adm-sent-btn" style={{ flex: 1, margin: 0, background: "#334155" }} onClick={(e) => { e.stopPropagation(); startEdit(o); }}><div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}><Icon name="edit" size={14} /> Editar</div></button>
                    </div>
                  )}
                </div>
              );
            })}
          </>
        )}

        {/* ── RATE ── */}
        {tab === "rate" && (
          <>
            <span className="adm-section">Câmbio actual</span>
            <div className="adm-card" style={{ marginBottom: 14, cursor: "default" }}>
              <div style={{ fontSize: 26, fontWeight: 900, color: "#a5b4fc", letterSpacing: -1 }}>
                {parseFloat(rate.applied_rate).toLocaleString("pt-AO")} Kz/$
              </div>
              <div style={{ fontSize: 11, color: "#475569", marginTop: 3, fontWeight: 600 }}>
                Base {parseFloat(rate.base_rate).toLocaleString("pt-AO")} + Margem {parseFloat(rate.margin)} Kz
              </div>
            </div>

            <span className="adm-section">Publicar novo câmbio</span>
            <div className="adm-card" style={{ cursor: "default" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 10 }}>
                <div>
                  <div style={{ fontSize: 9, color: "#475569", fontWeight: 700, marginBottom: 3, textTransform: "uppercase", letterSpacing: .4 }}>Base (Kz)</div>
                  <input className="adm-inp" type="number" placeholder={rate.base_rate} value={newBase} onChange={e => setNB(e.target.value)} />
                </div>
                <div>
                  <div style={{ fontSize: 9, color: "#475569", fontWeight: 700, marginBottom: 3, textTransform: "uppercase", letterSpacing: .4 }}>Margem (Kz)</div>
                  <input className="adm-inp" type="number" placeholder={rate.margin} value={newMargin} onChange={e => setNM(e.target.value)} />
                </div>
              </div>
              {(newBase || newMargin) && (
                <div style={{ display: "flex", justifyContent: "space-between", padding: "9px 12px", background: "rgba(99,102,241,.1)", borderRadius: 9, marginBottom: 10, fontSize: 12 }}>
                  <span style={{ color: "#94a3b8", fontWeight: 600 }}>Nova taxa final</span>
                  <span style={{ fontWeight: 800, color: "#a5b4fc" }}>
                    {((parseFloat(newBase) || parseFloat(rate.base_rate)) + (parseFloat(newMargin) || parseFloat(rate.margin))).toLocaleString("pt-AO")} Kz
                  </span>
                </div>
              )}
              <button className="adm-btn" onClick={updateRate} disabled={rateLoad}>
                {rateLoad ? "A publicar..." : <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}><Icon name="chart" size={14} /> Publicar — propaga em realtime</div>}
              </button>
            </div>

            {/* ── CÂMBIO POR MOEDA — EUR / BRL / ZAR, mesma UX do USD acima ── */}
            <span className="adm-section" style={{ marginTop: 18 }}>Câmbio por Moeda</span>
            <div style={{ fontSize: 10, color: "#64748b", marginBottom: 10, lineHeight: 1.5, padding: "0 2px" }}>
              Sincronização automática a cada hora via open.er-api.com, com base na taxa USD/AOA acima.
              {rate.last_auto_sync && (
                <span> · Última sync automática: {new Date(rate.last_auto_sync).toLocaleString("pt-AO")}</span>
              )}
            </div>

            {[
              { id: "EUR", label: "Euro", flag: "🇪🇺", symbol: "€", field: "eur_rate", color: "#003399" },
              { id: "BRL", label: "Real Brasileiro", flag: "🇧🇷", symbol: "R$", field: "brl_rate", color: "#009c3b" },
              { id: "ZAR", label: "Rand Sul-Africano", flag: "🇿🇦", symbol: "R", field: "zar_rate", color: "#007B40" },
            ].map(cur => {
              const autoVal = parseFloat(rate[cur.field]) || 0;
              const draft = currencyDrafts[cur.id] || { base: "", margin: "" };
              const finalRate = (parseFloat(draft.base) || autoVal || 0) + (parseFloat(draft.margin) || 0);
              return (
                <div key={cur.id} className="adm-card" style={{ cursor: "default", marginBottom: 10 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 20 }}>{cur.flag}</span>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 900, color: "#e2e8f0" }}>{cur.id}</div>
                        <div style={{ fontSize: 9.5, color: "#64748b" }}>{cur.label}</div>
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 18, fontWeight: 900, color: cur.color }}>
                        {autoVal > 0 ? `${autoVal.toLocaleString("pt-AO")} Kz` : "— Kz"}
                      </div>
                      <div style={{ fontSize: 8.5, color: "#475569" }}>taxa actual publicada</div>
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
                    <div>
                      <label style={{ fontSize: 9, color: "#64748b", fontWeight: 700, display: "block", marginBottom: 4 }}>BASE (KZ)</label>
                      <input
                        className="adm-inp"
                        style={{ marginBottom: 0 }}
                        type="number"
                        placeholder={autoVal > 0 ? autoVal.toString() : "ex: 1230"}
                        value={draft.base}
                        onChange={e => setCurrencyDrafts(prev => ({ ...prev, [cur.id]: { ...draft, base: e.target.value } }))}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: 9, color: "#64748b", fontWeight: 700, display: "block", marginBottom: 4 }}>MARGEM (KZ)</label>
                      <input
                        className="adm-inp"
                        style={{ marginBottom: 0 }}
                        type="number"
                        placeholder="ex: 10"
                        value={draft.margin}
                        onChange={e => setCurrencyDrafts(prev => ({ ...prev, [cur.id]: { ...draft, margin: e.target.value } }))}
                      />
                    </div>
                  </div>

                  {(draft.base || draft.margin) && (
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 10px", background: "rgba(99,102,241,.08)", borderRadius: 8, marginBottom: 10 }}>
                      <span style={{ fontSize: 10, color: "#a5b4fc", fontWeight: 700 }}>Nova taxa final</span>
                      <span style={{ fontSize: 13, fontWeight: 900, color: "#c7d2fe" }}>{finalRate.toLocaleString("pt-AO")} Kz</span>
                    </div>
                  )}

                  <button
                    className="adm-btn"
                    style={{ background: `linear-gradient(135deg, ${cur.color}, ${cur.color}cc)` }}
                    disabled={!draft.base && !draft.margin}
                    onClick={async () => {
                      const newBaseVal = parseFloat(draft.base) || autoVal;
                      const newMarginVal = parseFloat(draft.margin) || 0;
                      if (!newBaseVal || newBaseVal <= 0) { toast_(`Define uma base válida para ${cur.id}`, "err"); return; }
                      const finalValue = newBaseVal + newMarginVal;

                      // Buscar a linha mais recente DIRECTAMENTE da base de dados antes
                      // de publicar — não confiar no estado local 'rate', que pode estar
                      // desactualizado se outra moeda tiver sido publicada há poucos
                      // segundos e o realtime ainda não tiver reflectido essa alteração
                      // aqui no browser (isto evita reverter valores de outras moedas).
                      const { data: freshRate } = await sb.from("exchange_rates")
                        .select("*").order("fetched_at", { ascending: false }).limit(1).maybeSingle();
                      const base = freshRate || rate;

                      const { error } = await sb.from("exchange_rates").insert({
                        base_rate: base.base_rate, margin: base.margin, source: `manual_${cur.id.toLowerCase()}`,
                        eur_rate: cur.id === "EUR" ? finalValue : base.eur_rate,
                        brl_rate: cur.id === "BRL" ? finalValue : base.brl_rate,
                        zar_rate: cur.id === "ZAR" ? finalValue : base.zar_rate,
                        last_auto_sync: base.last_auto_sync || null,
                      });
                      if (error) { toast_("Erro: " + error.message, "err"); return; }
                      toast_(`Câmbio ${cur.id} publicado — propaga em realtime`, "ok");
                      setCurrencyDrafts(prev => ({ ...prev, [cur.id]: { base: "", margin: "" } }));
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                      <Icon name="chart" size={14} /> Publicar {cur.id} — propaga em realtime
                    </div>
                  </button>
                </div>
              );
            })}
          </>
        )}

        {tab === "cancelled" && (
          <>
            <span className="adm-section">Pedidos cancelados</span>
            {orders.filter(o => o.status === "cancelled" || o.status === "failed").length === 0 && <div style={{ textAlign: "center", padding: "36px 0", color: "#94a3b8", fontWeight: 600, fontSize: 13 }}>Nenhum pedido cancelado.</div>}
            {orders.filter(o => o.status === "cancelled" || o.status === "failed").map(o => {
              const d = DESTS.find(x => x.id === o.destination);
              const sm = STATUS_META[o.status] ?? STATUS_META.failed;
              return (
                <div key={o.id} className="adm-card" style={{ cursor: editingOrder === o.id ? "default" : "pointer" }} onClick={() => { if (editingOrder !== o.id) startEdit(o); }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 7 }}>
                    <div>
                      <div style={{ fontSize: 9, fontFamily: "monospace", color: "#334155", fontWeight: 700 }}>{o.order_ref ?? "#" + o.id.slice(0, 8).toUpperCase()}</div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: "#e2e8f0", marginTop: 2, display: "flex", alignItems: "center", gap: 6 }}>
                        {d?.svg ? (
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 14, height: 14, flexShrink: 0 }} dangerouslySetInnerHTML={{ __html: d.svg }} />
                        ) : null}
                        <span>{d?.label} · {o.destination_account}</span>
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 17, fontWeight: 900, color: "#a5b4fc" }}>${parseFloat(o.amount_usd).toFixed(2)}</div>
                      <div style={{ fontSize: 10, color: "#334155", fontFamily: "monospace" }}>{parseFloat(o.amount_aoa).toLocaleString("pt-AO")} Kz</div>
                    </div>
                  </div>
                  <StatusPill status={o.status} />
                  <div style={{ fontSize: 10, color: "#64748b", fontWeight: 500, marginTop: 4 }}>
                    Taxa {parseFloat(o.rate_applied).toLocaleString("pt-AO")} Kz/$ · {new Date(o.created_at).toLocaleString("pt-AO")}
                  </div>
                </div>
              );
            })}
          </>
        )}

        {tab === "kyc" && (
          <>
            <span className="adm-section">Recargas de Créditos Pendentes</span>
            {accessRequests.length === 0 && <div style={{ textAlign: "center", padding: "24px 0", color: "#94a3b8", fontWeight: 600, fontSize: 13 }}>Nenhuma recarga de créditos pendente.</div>}
            {accessRequests.map(r => (
              <div key={r.id} className="adm-card">
                <div style={{ fontSize: 13, fontWeight: 800, color: "#1e1b4b" }}>{r.full_name || "Utilizador"}</div>
                <div style={{ fontSize: 11, color: "#64748b", marginBottom: 10 }}>
                  Telefone: {r.phone || "Sem telefone"} · {r.amount_kz?.toLocaleString("pt-AO")} Kz · {r.credits_added} créditos · Enviado: {new Date(r.created_at).toLocaleString("pt-AO")}
                </div>

                {r.signedUrl && (
                  <div style={{ marginBottom: 12 }}>
                    <div style={{ fontSize: 9, color: "#64748b", marginBottom: 4, fontWeight: 700, textTransform: "uppercase" }}>Comprovativo</div>
                    {r.proof_url?.match(/\.pdf$/i) ? (
                      <a href={r.signedUrl} target="_blank" rel="noreferrer" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: 80, borderRadius: 6, border: "1px solid #cbd5e1", background: "rgba(0,0,0,0.15)", textDecoration: "none", color: "#6366f1" }}>
                        <Icon name="file" size={24} />
                        <span style={{ fontSize: 9, fontWeight: 800, marginTop: 4, color: "#e2e8f0" }}>Ver PDF</span>
                      </a>
                    ) : (
                      <a href={r.signedUrl} target="_blank" rel="noreferrer">
                        <img src={r.signedUrl} alt="Comprovativo" style={{ width: "100%", maxHeight: 200, objectFit: "contain", borderRadius: 6, border: "1px solid #cbd5e1", background: "#f8fafc" }} />
                      </a>
                    )}
                  </div>
                )}

                <div style={{ display: "flex", gap: 8 }}>
                  <button className="adm-btn" style={{ background: "#10b981", flex: 1, color: "#fff", border: "none" }} onClick={() => approveRecharge(r)}>Aprovar — Creditar {r.credits_added}</button>
                  <button className="adm-btn" style={{ background: "#ef4444", flex: 1, color: "#fff", border: "none" }} onClick={() => rejectRecharge(r)}>Rejeitar</button>
                </div>
              </div>
            ))}

            <span className="adm-section" style={{ marginTop: 24 }}>Verificações de Identidade (KYC)</span>
            {kycs.length === 0 && <div style={{ textAlign: "center", padding: "36px 0", color: "#94a3b8", fontWeight: 600, fontSize: 13 }}>Nenhum KYC pendente de aprovação.</div>}
            {kycs.map(k => (
              <div key={k.id} className="adm-card">
                <div style={{ fontSize: 13, fontWeight: 800, color: "#1e1b4b" }}>{k.profiles?.full_name || "Utilizador"}</div>
                <div style={{ fontSize: 11, color: "#64748b", marginBottom: 10 }}>{k.profiles?.phone || "Sem telefone"}</div>
                <div style={{ fontSize: 10, color: "#10b981", fontWeight: 600, marginBottom: 10, display: "flex", alignItems: "center", gap: 4 }}><Icon name="check" size={12} /> Documentos submetidos</div>

                {(k.docSigned || k.selfieSigned) && (
                  <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
                    {k.docSigned && (
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 9, color: "#64748b", marginBottom: 4, fontWeight: 700, textTransform: "uppercase" }}>Documento (BI)</div>
                        {k.document_url?.match(/\.pdf$/i) ? (
                          <a href={k.docSigned} target="_blank" rel="noreferrer" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: 80, borderRadius: 6, border: "1px solid #cbd5e1", background: "rgba(0,0,0,0.15)", textDecoration: "none", color: "#6366f1" }}>
                            <Icon name="file" size={24} />
                            <span style={{ fontSize: 9, fontWeight: 800, marginTop: 4, color: "#e2e8f0" }}>Ver PDF</span>
                          </a>
                        ) : (
                          <a href={k.docSigned} target="_blank" rel="noreferrer"><img src={k.docSigned} alt="BI" style={{ width: "100%", height: 80, objectFit: "cover", borderRadius: 6, border: "1px solid #cbd5e1" }} /></a>
                        )}
                      </div>
                    )}
                    {k.selfieSigned && (
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 9, color: "#64748b", marginBottom: 4, fontWeight: 700, textTransform: "uppercase" }}>Prova de Vida</div>
                        {k.selfie_url?.match(/\.(mp4|mov|webm)/i) ? (
                          <video src={k.selfieSigned} controls style={{ width: "100%", height: 80, objectFit: "cover", borderRadius: 6, border: "1px solid #cbd5e1", backgroundColor: "#000" }} />
                        ) : (
                          <a href={k.selfieSigned} target="_blank" rel="noreferrer"><img src={k.selfieSigned} alt="Selfie" style={{ width: "100%", height: 80, objectFit: "cover", borderRadius: 6, border: "1px solid #cbd5e1" }} /></a>
                        )}
                      </div>
                    )}
                  </div>
                )}
                <div style={{ display: "flex", gap: 8 }}>
                  <button className="adm-btn" style={{ background: "#10b981", flex: 1, color: "#fff", border: "none" }} onClick={() => updateKyc(k, "passed")}>Aprovar</button>
                  <button className="adm-btn" style={{ background: "#ef4444", flex: 1, color: "#fff", border: "none" }} onClick={() => updateKyc(k, "rejected")}>Rejeitar</button>
                </div>
              </div>
            ))}

            <span className="adm-section" style={{ marginTop: 24 }}>Histórico de Rejeições</span>
            {rejectedKycs.length === 0 && <div style={{ textAlign: "center", padding: "36px 0", color: "#94a3b8", fontWeight: 600, fontSize: 13 }}>Nenhum histórico de rejeições.</div>}
            {rejectedKycs.map(k => (
              <div key={k.id} className="adm-card" style={{ opacity: 0.8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <div style={{ fontSize: 13, fontWeight: 800, color: "#1e1b4b" }}>{k.profiles?.full_name || "Utilizador"}</div>
                  <div style={{ fontSize: 10, color: "#64748b" }}>{new Date(k.updated_at).toLocaleString("pt-AO")}</div>
                </div>
                <div style={{ fontSize: 11, color: "#64748b", marginBottom: 10 }}>{k.profiles?.phone || "Sem telefone"}</div>
                <div style={{ fontSize: 11, color: "#ef4444", fontWeight: 600, padding: "8px", background: "#fef2f2", borderRadius: "6px", border: "1px solid #fecaca" }}>
                  <span style={{ display: "block", fontSize: 9, textTransform: "uppercase", color: "#ef4444", marginBottom: 2 }}>Motivo da recusa:</span>
                  {k.rejection_reason || "Documentos inválidos."}
                </div>
                <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                  <button className="adm-btn" style={{ background: "#10b981", flex: 1, color: "#fff", border: "none", padding: "8px", fontSize: 11, cursor: "pointer", fontWeight: 700 }} onClick={() => updateKyc(k, "passed")}>Aprovar KYC Manualmente</button>
                </div>
              </div>
            ))}
          </>
        )}

        {/* ── CONFIG ── */}
        {tab === "config" && (
          <ConfigTab config={config} updateConfig={updateConfig} />
        )}

      </div>
    </div>
  );
}
