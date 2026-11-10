// Dashboard do painel ADM — visão geral, destinos, utilizadores e actividade.
// Os cálculos vivem em dashboardData.js; aqui só há estado e ecrã.
import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { DESTS } from "../../lib/constants.js";
import {
  PERIODS, computeDashboard, emptyFilters, countFilters, monthLabel,
  kz, kzParts, fullInt, fullKz, pct, duration, timeAgo, dateTimeLuanda, plural, userName, initials, statusGroup, compact, MONTHS_SHORT,
} from "./dashboardData.js";
import { I, Card, Seg, Kpi, Empty, BarChart, SegBar, Heatmap, HeatScale, DataTable, Avatar, Badge, FUNNEL_RAMP } from "./dashboardParts.jsx";
import { PrepareDialog, Presentation, buildSlides } from "./DashboardPresent.jsx";
import "./dashboard.css";

// ── Nomes legíveis ───────────────────────────────────────────────────────────
const DEST_BY_ID = Object.fromEntries(DESTS.map((d) => [d.id, d]));
const titleCase = (s) => String(s || "—").replace(/[_-]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
export function destMeta(id, merged = 0) {
  if (id === "__other__") return { label: `Outros (${merged})`, color: "#A7ADC6" };
  const d = DEST_BY_ID[id];
  return { label: d ? d.label : titleCase(id), color: d ? d.color : "#A7ADC6" };
}
const METHODS = {
  bai: "BAI", bfa: "BFA", bic: "BIC", atlantico: "Millennium Atlântico", sba: "Standard Bank", sol: "Banco Sol", bpc: "BPC",
  bci: "BCI", keve: "Keve", yetu: "Yetu", bni: "BNI", economico: "Banco Económico", cga: "Caixa Geral Angola",
  express: "Multicaixa Express", multicaixa_express: "Multicaixa Express",
};
export const methodLabel = (id) => METHODS[id] || titleCase(id);
const SIDES = { buy: "Compra", sell: "Venda" };
const sideLabel = (id) => SIDES[id] || titleCase(id);
const CUR_SYM = { USD: "US$", EUR: "€", BRL: "R$", ZAR: "R" };
const KYC_LABEL = { verified: "Verificado", pending: "Pendente", in_progress: "Em curso", rejected: "Recusado" };
const OPEN_LABEL = { awaiting_kyc: "Aguarda KYC", awaiting_payment: "Aguarda pagamento", payment_received: "Pago", processing: "A processar" };
const money2 = (v) => (Number(v) || 0).toLocaleString("pt-AO", { maximumFractionDigits: 2 });

const TABS = [
  { id: "overview", label: "Visão geral" },
  { id: "dests", label: "Destinos" },
  { id: "users", label: "Utilizadores" },
  { id: "activity", label: "Actividade" },
];

// ── Dados: carrega, guarda e actualiza (a cada minuto e a pedido) ────────────
function useRows(loadRows, version) {
  const [st, setSt] = useState({ rows: null, at: null, loading: true, error: null });
  const alive = useRef(true);
  const seq = useRef(0);
  const load = useCallback(async () => {
    const my = ++seq.current;
    setSt((s) => ({ ...s, loading: true, error: null }));
    try {
      const rows = await loadRows();
      if (alive.current && my === seq.current) setSt({ rows, at: Date.now(), loading: false, error: null });
    } catch (e) {
      console.error("dashboard:", e);
      if (alive.current && my === seq.current) setSt((s) => ({ ...s, loading: false, error: (e && e.message) || "Não foi possível carregar os dados." }));
    }
  }, [loadRows]);
  useEffect(() => { alive.current = true; return () => { alive.current = false; }; }, []);
  useEffect(() => { load(); }, [load, version]);
  useEffect(() => {
    const t = setInterval(() => { if (!document.hidden) load(); }, 60000);
    return () => clearInterval(t);
  }, [load]);
  return { ...st, reload: load };
}

// ── Filtros (janela por baixo do botão) ──────────────────────────────────────
function FilterPop({ options, filters, setFilters, onClose, hasRevenueNote }) {
  const ref = useRef(null);
  useEffect(() => {
    const down = (e) => { if (ref.current && !ref.current.contains(e.target) && !e.target.closest("[data-filters-btn]")) onClose(); };
    const key = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("mousedown", down);
    document.addEventListener("keydown", key);
    return () => { document.removeEventListener("mousedown", down); document.removeEventListener("keydown", key); };
  }, [onClose]);
  const toggle = (k, v) => setFilters((f) => ({ ...f, [k]: f[k].includes(v) ? f[k].filter((x) => x !== v) : [...f[k], v] }));
  const group = (k, title, items, label) =>
    items.length > 1 || (items.length === 1 && filters[k].length) ? (
      <>
        <h4>{title}</h4>
        <div className="chips">
          {items.map((v) => (
            <button key={v} type="button" className="dash-chip" aria-pressed={filters[k].includes(v)} onClick={() => toggle(k, v)}>{label(v)}</button>
          ))}
        </div>
      </>
    ) : null;
  const anything = options.dests.length + options.methods.length + options.sides.length + options.currencies.length > 0;
  return (
    <div className="dash-pop" ref={ref} role="dialog" aria-label="Filtros">
      {!anything && <p className="dash-pop-note">Ainda não há operações para filtrar.</p>}
      {group("dests", "Destino", options.dests, (v) => destMeta(v).label)}
      {group("methods", "Método de pagamento", options.methods, methodLabel)}
      {group("sides", "Tipo", options.sides, sideLabel)}
      {group("currencies", "Moeda", options.currencies, (v) => v)}
      <div className="dash-pop-foot">
        <span>Os filtros actuam sobre as operações{hasRevenueNote ? "; a receita é de toda a plataforma" : ""}.</span>
        <button type="button" className="dash-link" onClick={() => setFilters(emptyFilters())} disabled={countFilters(filters) === 0}>Limpar</button>
      </div>
    </div>
  );
}

// ── Actividade: descreve um evento ───────────────────────────────────────────
function describe(ev, byId) {
  if (ev.kind === "order") {
    const o = ev.order;
    const who = userName(byId.get(o.user_id));
    const g = statusGroup(o.status);
    const sym = CUR_SYM[o.currency || "USD"] || o.currency || "";
    const dest = destMeta(o.destination).label;
    const method = o.payment_method ? ` · ${methodLabel(o.payment_method)}` : "";
    const badge = g === "done" ? { tone: "good", icon: "check", text: "Concluída" }
      : g === "lost" ? { tone: "bad", icon: "ban", text: o.status === "failed" ? "Falhou" : "Cancelada" }
      : { tone: "open", icon: "clock", text: OPEN_LABEL[o.status] || "Em curso" };
    return {
      who, badge, sub: `${sideLabel(o.side)} · ${dest}`,
      body: `${sym} ${money2(o.amount_usd)} ⇄ ${fullKz(o.amount_aoa)}${method}`,
    };
  }
  if (ev.kind === "recharge") {
    const r = ev.recharge;
    const badge = r.status === "confirmed" ? { tone: "good", icon: "check", text: "Confirmada" }
      : r.status === "pending_payment" ? { tone: "open", icon: "clock", text: "Pendente" }
      : { tone: "bad", icon: "ban", text: r.status === "rejected" ? "Recusada" : "Cancelada" };
    return {
      who: userName(byId.get(r.user_id)), badge, sub: "Recarga de créditos",
      body: `${fullKz(r.amount_kz)} · ${fullInt(r.credits_added)} ${plural(r.credits_added, "crédito", "créditos")}`,
    };
  }
  const p = ev.profile;
  const ok = p.kyc_status === "verified";
  return {
    who: userName(p),
    badge: ok ? { tone: "good", icon: "check", text: "KYC verificado" } : { tone: "open", icon: "clock", text: `KYC ${(KYC_LABEL[p.kyc_status] || "pendente").toLowerCase()}` },
    sub: "Novo registo", body: `Conta criada a ${dateTimeLuanda(ev.ts)}`,
  };
}

function ActivityItem({ ev, byId, now }) {
  const d = describe(ev, byId);
  return (
    <li className="dash-act-item">
      <div className="dash-act-top">
        <Avatar name={d.who} initials={initials(d.who)} />
        <div className="dash-act-who">
          <b>{d.who}</b>
          <small>{d.sub} · {timeAgo(ev.ts, now)}</small>
        </div>
        <Badge tone={d.badge.tone} icon={d.badge.icon}>{d.badge.text}</Badge>
      </div>
      <p className="dash-act-body">{d.body}</p>
    </li>
  );
}

// ── Tabelas de classificação ─────────────────────────────────────────────────
function RankTable({ rows, label, dot, noun, compact }) {
  if (!rows.length) return <Empty title="Sem operações neste período">Alarga o período ou limpa os filtros.</Empty>;
  const maxVol = Math.max(...rows.map((r) => r.volume), 0);
  return (
    <div className="dash-tablewrap">
      <table className="dash-tbl">
        <thead>
          <tr>
            <th scope="col">{noun}</th>
            <th scope="col">Operações</th>
            {!compact && <th scope="col" className="hide-sm">Concluídas</th>}
            <th scope="col">Conclusão</th>
            <th scope="col">Volume concluído</th>
            {!compact && <th scope="col" className="hide-sm">Ticket médio</th>}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => {
            const c = dot ? dot(r.key) : null;
            return (
              <tr key={r.key}>
                <th scope="row">
                  <span className="dash-rowlbl">{c ? <i style={{ background: c }} /> : null}<span>{label(r.key)}</span></span>
                </th>
                <td>{fullInt(r.total)}</td>
                {!compact && <td className="hide-sm">{fullInt(r.done)}</td>}
                <td>{pct(r.rate)}</td>
                <td>
                  <div className="dash-barcell">
                    <span>{r.volume > 0 ? kz(r.volume) : "—"}</span>
                    <span className="dash-mbar" aria-hidden="true"><i style={{ width: maxVol > 0 ? `${(r.volume / maxVol) * 100}%` : 0 }} /></span>
                  </div>
                </td>
                {!compact && <td className="hide-sm">{r.ticket != null ? kz(r.ticket) : "—"}</td>}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default function Dashboard({ loadRows, version }) {
  const { rows, at, loading, error, reload } = useRows(loadRows, version);
  const [periodId, setPeriodId] = useState("12m");
  const [filters, setFilters] = useState(emptyFilters);
  const [tab, setTab] = useState("overview");
  const [chartMetric, setChartMetric] = useState("volume");
  const [chartView, setChartView] = useState("chart");
  const [heatMetric, setHeatMetric] = useState("ops");
  const [heatView, setHeatView] = useState("chart");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [prep, setPrep] = useState(false);
  const [playing, setPlaying] = useState(null);
  const [actKind, setActKind] = useState("all");
  const [actLimit, setActLimit] = useState(20);
  const closeFilters = useCallback(() => setFiltersOpen(false), []);

  const data = useMemo(
    () => (rows ? computeDashboard({ ...rows, periodId, filters, nowMs: at }) : null),
    [rows, periodId, filters, at]
  );
  const byId = useMemo(() => new Map(((rows && rows.profiles) || []).map((p) => [p.id, p])), [rows]);

  if (!data) {
    return (
      <div className="dash" aria-busy={loading}>
        {error ? (
          <Card>
            <Empty title="Não foi possível carregar o dashboard">{error}</Empty>
            <div style={{ textAlign: "center" }}><button type="button" className="dash-btn" onClick={reload}>Tentar de novo</button></div>
          </Card>
        ) : (
          <Card><Empty title="A carregar os dados…" /></Card>
        )}
      </div>
    );
  }

  const nFilters = countFilters(filters);
  const k = data.kpi;
  const d = data.distribution;
  const prev = data.period.prev;
  const prevText = prev ? `Em relação a ${monthLabel(prev.start, { year: true })} – ${monthLabel(prev.end, { year: true })}` : undefined;
  const nowText = dateTimeLuanda(at);
  const onTabKey = (e) => {
    const i = TABS.findIndex((t) => t.id === tab);
    const to = e.key === "ArrowRight" ? (i + 1) % TABS.length : e.key === "ArrowLeft" ? (i - 1 + TABS.length) % TABS.length : e.key === "Home" ? 0 : e.key === "End" ? TABS.length - 1 : -1;
    if (to < 0) return;
    e.preventDefault();
    setTab(TABS[to].id);
    const el = document.getElementById(`dash-tab-${TABS[to].id}`);
    if (el) el.focus();
  };
  const toggleDest = (id) => setFilters((f) => ({ ...f, dests: f.dests.includes(id) ? f.dests.filter((x) => x !== id) : [...f.dests, id] }));

  const [volN, volU] = kzParts(k.volume.value);
  const [revN, revU] = kzParts(k.revenue.value);
  const none = data.counts.orders === 0;

  // ── textos do gráfico mensal ──
  const chartTitle = { volume: "Volume por mês", ops: "Operações por mês", revenue: "Receita por mês" }[chartMetric];
  const chartSub = { volume: "Operações concluídas, em Kz", ops: "Todas as operações criadas", revenue: "Recargas de créditos confirmadas, em Kz" }[chartMetric];

  // ── mapa de calor: "os N mais usados" (+ os restantes juntos) ──
  const heatNamed = data.heat.rows.filter((r) => r.id !== "__other__").length;
  const heatOther = data.heat.rows.find((r) => r.id === "__other__");
  const heatSub = data.heat.rows.length === 0 ? "Sem operações neste período"
    : heatOther ? `Os ${heatNamed} destinos mais usados; os outros ${heatOther.merged} aparecem juntos`
    : `${heatNamed} ${plural(heatNamed, "destino", "destinos")} com operações`;

  // ── actividade ──
  const actAll = data.activity;
  const actFiltered = actKind === "all" ? actAll : actAll.filter((e) => ({ orders: "order", recharges: "recharge", signups: "signup" }[actKind] === e.kind));

  const slides = buildSlides(data, { destMeta, methodLabel, nowText });

  return (
    <div className="dash" aria-busy={loading}>
      {/* Cabeçalho */}
      <header className="dash-hd">
        <div>
          <h2>Dashboard</h2>
          <p>
            {data.counts.orders} {plural(data.counts.orders, "operação", "operações")} de {data.counts.users} {plural(data.counts.users, "utilizador", "utilizadores")}, {data.period.rangeText}
          </p>
        </div>
        <div className="dash-actions">
          <Seg label="Período" value={periodId} onChange={setPeriodId} options={PERIODS.map((p) => ({ id: p.id, label: p.label }))} />
          <div className="dash-popwrap">
            <button type="button" className="dash-btn" data-filters-btn aria-expanded={filtersOpen} onClick={() => setFiltersOpen((v) => !v)}>
              <I n="sliders" s={16} /> Filtros {nFilters > 0 && <span className="dash-count">{nFilters}</span>}
            </button>
            {filtersOpen && <FilterPop options={data.options} filters={filters} setFilters={setFilters} onClose={closeFilters} hasRevenueNote />}
          </div>
          <button type="button" className="dash-btn icon" onClick={reload} aria-label="Actualizar dados" title={`Actualizado a ${nowText}`}>
            <span className={loading ? "spin" : ""}><I n="refresh" s={16} /></span>
          </button>
          <button type="button" className="dash-btn primary" onClick={() => setPrep(true)}>
            <I n="play" s={14} /> Modo apresentação
          </button>
        </div>
      </header>

      {/* Separadores + destinos mais usados */}
      <div className="dash-tabsrow">
        <div className="dash-tabs" role="tablist" aria-label="Secções do dashboard" onKeyDown={onTabKey}>
          {TABS.map((t) => (
            <button
              key={t.id} type="button" role="tab" id={`dash-tab-${t.id}`} aria-controls="dash-panel"
              aria-selected={tab === t.id} tabIndex={tab === t.id ? 0 : -1} onClick={() => setTab(t.id)}
            >{t.label}</button>
          ))}
        </div>
        {data.topDests.length > 0 && (
          <div className="dash-quick">
            <span>Mais usados</span>
            {data.topDests.map((x) => (
              <button key={x.id} type="button" className="dash-chip" aria-pressed={filters.dests.includes(x.id)} onClick={() => toggleDest(x.id)}>
                {destMeta(x.id).label}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className={`dash-main${loading ? " is-loading" : ""}`} role="tabpanel" id="dash-panel" aria-labelledby={`dash-tab-${tab}`}>
        {error && <p className="dash-warn" role="status">Não foi possível actualizar agora; a mostrar os últimos dados carregados. ({error})</p>}

        {/* ───────────── VISÃO GERAL ───────────── */}
        {tab === "overview" && (
          <>
            <div className="dash-kpis">
              <Kpi
                hero label="Volume concluído" value={volN} unit={volU}
                delta={k.volume.delta} deltaTitle={prevText}
                caption={`${k.volume.done} de ${k.volume.total} ${k.volume.total === 1 ? "operação concluída" : "operações concluídas"}`}
                sub={k.volume.ticket != null ? `Ticket médio ${kz(k.volume.ticket)}` : null}
              />
              <Kpi
                label="Taxa de conclusão" value={k.completion.value == null ? "—" : String(Math.round(k.completion.value * 100))} unit={k.completion.value == null ? "" : "%"}
                delta={k.completion.delta} deltaTitle={prevText}
                caption={k.completion.value == null ? "Ainda sem operações encerradas" : `${k.completion.done} de ${k.completion.closed} ${k.completion.closed === 1 ? "operação encerrada" : "operações encerradas"}`}
                sub={k.completion.open > 0 ? `${k.completion.open} em curso` : null}
              />
              <Kpi
                label="Recorrência" value={k.recurrence.value == null ? "—" : String(Math.round(k.recurrence.value * 100))} unit={k.recurrence.value == null ? "" : "%"}
                delta={k.recurrence.delta} deltaTitle={prevText}
                caption={k.recurrence.value == null ? "Ainda sem operações concluídas" : `${k.recurrence.returning} de ${k.recurrence.active} ${plural(k.recurrence.active, "utilizador voltou", "utilizadores voltaram")} a concluir`}
              />
              <Kpi
                label="Receita de créditos" value={revN} unit={revU}
                delta={k.revenue.delta} deltaTitle={prevText}
                caption={`${k.revenue.recharges} ${plural(k.revenue.recharges, "recarga", "recargas")} · ${fullInt(k.revenue.creditsUsed)} ${plural(k.revenue.creditsUsed, "crédito usado", "créditos usados")}`}
                sub={nFilters > 0 ? "Total da plataforma (não usa os filtros)" : null}
              />
            </div>

            <div className="dash-row r2">
              <Card
                title={chartTitle}
                sub={`${chartSub} · ${data.period.rangeText}`}
                right={
                  <>
                    {chartView === "chart" && (
                      <div className="dash-legend" aria-hidden="true">
                        <span><i style={{ background: "var(--d-accent)" }} />Mês em curso</span>
                        <span><i style={{ background: "var(--d-bar)" }} />Meses anteriores</span>
                      </div>
                    )}
                    <Seg small label="Métrica do gráfico" value={chartMetric} onChange={setChartMetric} options={[{ id: "volume", label: "Volume" }, { id: "ops", label: "Operações" }, { id: "revenue", label: "Receita" }]} />
                    <Seg small label="Forma de ver" value={chartView} onChange={setChartView} options={[{ id: "chart", icon: "bars", title: "Gráfico" }, { id: "table", icon: "table", title: "Tabela" }]} />
                  </>
                }
              >
                {chartView === "chart" ? (
                  <BarChart data={data.monthly} metric={chartMetric} />
                ) : (
                  <DataTable
                    caption="Resumo mensal"
                    head={["Mês", "Volume concluído", "Operações", "Concluídas", "Canceladas", "Em curso", "Receita"]}
                    rows={data.monthly.map((m) => [`${m.label} ${m.year}`, fullKz(m.volume), fullInt(m.ops), fullInt(m.done), fullInt(m.lost), fullInt(m.open), fullKz(m.revenue)])}
                  />
                )}
              </Card>

              <Card className="dash-dist" title="Distribuição das operações" sub={data.period.label === "Tudo" ? "Desde o início" : `Últimos ${data.period.label}`}>
                <div className="dash-dist-big">{fullInt(d.total)}<small>{plural(d.total, "operação criada", "operações criadas")}</small></div>
                <SegBar parts={[{ label: "Concluídas", value: d.done, color: "var(--d-good)" }, { label: "Em curso", value: d.open, color: "var(--d-neutral)" }, { label: "Canceladas", value: d.lost, color: "var(--d-bad)" }]} />
                <div className="dash-dist-rows">
                  {[
                    { label: "Concluídas", note: "enviadas ao destino", v: d.done, c: "var(--d-good)" },
                    { label: "Em curso", note: "à espera de pagamento ou envio", v: d.open, c: "var(--d-neutral)" },
                    { label: "Canceladas", note: "inclui falhadas", v: d.lost, c: "var(--d-bad)" },
                  ].map((r) => (
                    <div className="dash-dist-row" key={r.label}>
                      <i className="dash-sw" style={{ background: r.c }} />
                      <span><b>{r.label}</b><small>{r.note}</small></span>
                      <span className="n">{fullInt(r.v)}</span>
                      <span className="p">{d.total > 0 ? `${Math.round((r.v / d.total) * 100)}%` : "—"}</span>
                    </div>
                  ))}
                </div>
                <dl className="dash-dist-foot">
                  <div><dt>Tempo mediano de conclusão</dt><dd>{duration(data.medianMinutes)}</dd></div>
                  <div><dt>Avaliação média</dt><dd>{data.rating ? `${data.rating.value.toFixed(1).replace(".", ",")} / 5` : "—"}</dd></div>
                </dl>
              </Card>
            </div>

            <div className="dash-row r3">
              <Card
                className="grow"
                title={heatMetric === "volume" ? "Volume por destino e mês" : "Operações por destino e mês"}
                sub={heatSub}
                right={
                  <>
                    {heatView === "chart" && <HeatScale metric={heatMetric} />}
                    <Seg small label="Métrica do mapa" value={heatMetric} onChange={setHeatMetric} options={[{ id: "ops", label: "Operações" }, { id: "volume", label: "Volume" }]} />
                    <Seg small label="Forma de ver" value={heatView} onChange={setHeatView} options={[{ id: "chart", icon: "bars", title: "Mapa" }, { id: "table", icon: "table", title: "Tabela" }]} />
                  </>
                }
              >
                {data.heat.rows.length === 0 ? (
                  <Empty title={none ? "Sem operações neste período" : "Sem operações com estes filtros"}>Alarga o período ou limpa os filtros.</Empty>
                ) : heatView === "chart" ? (
                  <Heatmap heat={data.heat} metric={heatMetric} meta={destMeta} />
                ) : (
                  <DataTable
                    caption="Operações por destino e mês"
                    head={["Destino", ...data.heat.months.map((i) => `${MONTHS_SHORT[i % 12]} ${String(Math.floor(i / 12)).slice(2)}`), "Total"]}
                    rows={data.heat.rows.map((r) => [destMeta(r.id, r.merged).label, ...r.cells.map((c) => (heatMetric === "volume" ? (c.volume ? compact(c.volume) : "–") : c.ops || "–")), heatMetric === "volume" ? kz(r.volume) : r.total])}
                  />
                )}
              </Card>

              <Card
                title="Actividade recente"
                sub={`${actAll.length} ${plural(actAll.length, "evento", "eventos")} no total`}
                right={<button type="button" className="dash-link" onClick={() => setTab("activity")}>Ver todos <I n="chevron" s={14} /></button>}
              >
                {actAll.length === 0 ? (
                  <Empty title="Ainda sem actividade" />
                ) : (
                  <ul className="dash-act">
                    {actAll.slice(0, 4).map((ev, i) => <ActivityItem key={i} ev={ev} byId={byId} now={at} />)}
                  </ul>
                )}
              </Card>
            </div>
          </>
        )}

        {/* ───────────── DESTINOS ───────────── */}
        {tab === "dests" && (
          <>
            <div className="dash-tiles">
              <Card className="dash-tile"><p>Ticket médio</p><b>{k.volume.ticket != null ? kz(k.volume.ticket) : "—"}</b><small>por operação concluída</small></Card>
              <Card className="dash-tile"><p>Tempo mediano de conclusão</p><b>{duration(data.medianMinutes)}</b><small>entre criar e enviar</small></Card>
              <Card className="dash-tile">
                <p>Avaliação média</p>
                <b>{data.rating ? `${data.rating.value.toFixed(1).replace(".", ",")} / 5` : "—"}</b>
                <small>{data.rating ? `${data.rating.count} ${plural(data.rating.count, "avaliação", "avaliações")}` : "Ainda sem avaliações"}</small>
              </Card>
            </div>
            <Card title="Destinos" sub={`Para onde vai o dinheiro · ${data.period.rangeText}`}>
              <RankTable rows={data.byDest} label={(x) => destMeta(x).label} dot={(x) => destMeta(x).color} noun="Destino" />
            </Card>
            <div className="dash-row eq">
              <Card title="Métodos de pagamento" sub="Como pagam em kwanzas">
                <RankTable compact rows={data.byMethod} label={methodLabel} noun="Método" />
              </Card>
              <Card title="Tipo e moeda" sub="Compra ou venda, e moeda estrangeira">
                <RankTable compact rows={data.bySide} label={sideLabel} noun="Tipo" />
                <div style={{ height: 14 }} />
                <RankTable compact rows={data.byCurrency} label={(x) => x} noun="Moeda" />
              </Card>
            </div>
          </>
        )}

        {/* ───────────── UTILIZADORES ───────────── */}
        {tab === "users" && (
          <>
            <div className="dash-tiles four">
              <Card className="dash-tile"><p>Registados</p><b>{fullInt(data.users.total)}</b><small>{data.users.newInWindow > 0 ? `+${data.users.newInWindow} no período` : "nenhum novo no período"}</small></Card>
              <Card className="dash-tile"><p>Identidade verificada</p><b>{fullInt(data.users.verified)}</b><small>{data.users.total > 0 ? `${Math.round((data.users.verified / data.users.total) * 100)}% dos registados` : "—"}</small></Card>
              <Card className="dash-tile"><p>Com operações</p><b>{fullInt(data.users.withOrders)}</b><small>no período e filtros escolhidos</small></Card>
              <Card className="dash-tile"><p>Créditos em carteira</p><b>{fullInt(data.users.credits)}</b><small>somados nos saldos</small></Card>
            </div>
            <div className="dash-row r2eq">
              <Card title="Do registo à recorrência" sub="Utilizadores em cada passo, desde o início (sem filtros)">
                <div className="dash-fun">
                  {data.users.funnel.map((f, i) => {
                    const first = data.users.funnel[0].value;
                    const before = i > 0 ? data.users.funnel[i - 1].value : null;
                    return (
                      <div className="dash-fun-row" key={f.id}>
                        <span className="dash-fun-lbl">{f.label}</span>
                        <span className="dash-fun-bar"><i style={{ width: first > 0 ? `${Math.max((f.value / first) * 100, f.value > 0 ? 2 : 0)}%` : 0, background: FUNNEL_RAMP[i] }} /></span>
                        <span className="dash-fun-n"><b>{fullInt(f.value)}</b>{before ? <small>{before > 0 ? `${Math.round((f.value / before) * 100)}% do anterior` : ""}</small> : null}</span>
                      </div>
                    );
                  })}
                </div>
              </Card>
              <Card title="Quem mais movimenta" sub="Por volume concluído no período">
                {data.users.top.length === 0 ? (
                  <Empty title="Sem operações neste período" />
                ) : (
                  <div className="dash-tablewrap">
                    <table className="dash-tbl">
                      <thead>
                        <tr><th scope="col">Utilizador</th><th scope="col">Operações</th><th scope="col">Concluídas</th><th scope="col">Volume</th><th scope="col" className="hide-sm">Última</th></tr>
                      </thead>
                      <tbody>
                        {data.users.top.slice(0, 8).map((u) => (
                          <tr key={u.id}>
                            <th scope="row">
                              <span className="dash-person">
                                <Avatar name={u.name} initials={initials(u.name)} />
                                <span><b>{u.name}</b><small>KYC {(KYC_LABEL[u.kyc] || u.kyc).toLowerCase()}</small></span>
                              </span>
                            </th>
                            <td>{fullInt(u.ops)}</td>
                            <td>{fullInt(u.done)}</td>
                            <td>{u.volume > 0 ? kz(u.volume) : "—"}</td>
                            <td className="hide-sm">{u.last ? timeAgo(u.last, at) : "—"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </Card>
            </div>
          </>
        )}

        {/* ───────────── ACTIVIDADE ───────────── */}
        {tab === "activity" && (
          <Card
            title="Actividade"
            sub="Operações, recargas e novos registos, do mais recente para o mais antigo"
            right={
              <Seg
                small label="Tipo de evento" value={actKind}
                onChange={(v) => { setActKind(v); setActLimit(20); }}
                options={[{ id: "all", label: "Tudo" }, { id: "orders", label: "Operações" }, { id: "recharges", label: "Recargas" }, { id: "signups", label: "Registos" }]}
              />
            }
          >
            {actFiltered.length === 0 ? (
              <Empty title="Nada por aqui" />
            ) : (
              <>
                <ul className="dash-act wide">
                  {actFiltered.slice(0, actLimit).map((ev, i) => <ActivityItem key={i} ev={ev} byId={byId} now={at} />)}
                </ul>
                {actFiltered.length > actLimit && (
                  <div style={{ textAlign: "center", marginTop: 16 }}>
                    <button type="button" className="dash-btn" onClick={() => setActLimit((n) => n + 20)}>Mostrar mais ({actFiltered.length - actLimit})</button>
                  </div>
                )}
              </>
            )}
          </Card>
        )}

        <p className="dash-foot">
          Actualizado a {nowText} (hora de Luanda). As operações contam pela data de criação.{" "}
          {prev ? "As variações comparam com o período anterior do mesmo tamanho." : "Ainda não há um período anterior com dados, por isso não aparecem variações; escolhe 3 ou 6 meses para as ver quando existirem."}
        </p>
      </div>

      {prep && (
        <PrepareDialog
          slides={slides}
          onClose={() => setPrep(false)}
          onStart={(picked) => { setPrep(false); setPlaying(picked); }}
        />
      )}
      {playing && <Presentation slides={playing} onClose={() => setPlaying(null)} footerLeft={`Bridge Market · ${data.period.rangeText}`} footerRight={nowText} />}
    </div>
  );
}
