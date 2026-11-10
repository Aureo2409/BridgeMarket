// ─────────────────────────────────────────────────────────────────────────────
// Dashboard do ADM — cálculos.
//
// Funções puras: não usam React nem Supabase, por isso podem ser testadas à
// parte e dão sempre o mesmo resultado para os mesmos dados.
//
// Regras de negócio (para quem for conferir os números):
//  • Tempo: tudo em horário de Luanda (UTC+1, sem horário de verão). Os meses
//    são meses de calendário; o mês em curso conta só até hoje.
//  • Operações são agrupadas pela data de CRIAÇÃO (created_at).
//  • "Concluída" = status completed · "Cancelada" = cancelled ou failed ·
//    "Em curso" = qualquer outro (aguarda pagamento, pago, a processar…).
//  • Volume = soma de amount_aoa (Kz) das operações concluídas.
//  • Taxa de conclusão = concluídas ÷ (concluídas + canceladas). As que ainda
//    estão em curso não entram na conta (ainda não têm desfecho).
//  • Recorrência = utilizadores com 2 ou mais operações concluídas ÷
//    utilizadores com pelo menos 1 (como criador ou como contraparte).
//  • Receita = recargas de créditos confirmadas (amount_kz), pela data de
//    confirmação. "Créditos usados" = débitos de matching menos reembolsos.
//  • Variação = período actual contra o período imediatamente anterior, com o
//    mesmo número de meses. Só existe quando o período anterior já tem dados
//    da plataforma (senão não há com o que comparar).
// ─────────────────────────────────────────────────────────────────────────────

const HOUR = 3600 * 1000;
export const LUANDA_OFFSET = HOUR;

export const MONTHS_SHORT = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
export const MONTHS_LONG = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];

const toMs = (v) => {
  if (v == null || v === "") return NaN;
  return typeof v === "number" ? v : Date.parse(v);
};
const num = (v) => {
  const n = typeof v === "number" ? v : parseFloat(v);
  return Number.isFinite(n) ? n : 0;
};

// ── Meses (índice = ano*12 + mês, em hora de Luanda) ─────────────────────────
export function monthIdx(ts) {
  const d = new Date(ts + LUANDA_OFFSET);
  return d.getUTCFullYear() * 12 + d.getUTCMonth();
}
export function monthStart(idx) {
  return Date.UTC(Math.floor(idx / 12), idx % 12, 1) - LUANDA_OFFSET;
}
export function monthLabel(idx, opts = {}) {
  const { year = false, long = false } = opts;
  const base = (long ? MONTHS_LONG : MONTHS_SHORT)[((idx % 12) + 12) % 12];
  return year ? `${base} ${Math.floor(idx / 12)}` : base;
}

// ── Estado das operações ─────────────────────────────────────────────────────
export function statusGroup(status) {
  if (status === "completed") return "done";
  if (status === "cancelled" || status === "failed") return "lost";
  return "open";
}

// ── Períodos ─────────────────────────────────────────────────────────────────
export const PERIODS = [
  { id: "3m", label: "3 meses", months: 3 },
  { id: "6m", label: "6 meses", months: 6 },
  { id: "12m", label: "12 meses", months: 12 },
  { id: "all", label: "Tudo", months: 0 },
];

/**
 * @param {string} id        "3m" | "6m" | "12m" | "all"
 * @param {number} nowMs     agora (ms)
 * @param {number} firstMs   data do primeiro registo da plataforma (ms) — pode ser NaN
 */
export function resolvePeriod(id, nowMs, firstMs) {
  const cur = monthIdx(nowMs);
  const first = Number.isFinite(firstMs) ? Math.min(monthIdx(firstMs), cur) : cur;
  const p = PERIODS.find((x) => x.id === id) || PERIODS[2];

  // Nunca desenhar menos de 3 meses: um gráfico com 1 barra não diz nada.
  const minStart = cur - 2;
  const start = p.months === 0 ? Math.min(first, minStart) : cur - (p.months - 1);
  const visibleStart = Math.max(start, Math.min(first, minStart));

  let prev = null;
  if (p.months > 0) {
    const candidate = { start: start - p.months, end: start - 1 };
    if (candidate.end >= first) prev = candidate; // o período anterior já existia
  }

  const visible = [];
  for (let i = visibleStart; i <= cur; i++) visible.push(i);

  return {
    id: p.id,
    label: p.label,
    start,
    end: cur,
    prev,
    visible,
    current: cur,
    rangeText: `${monthLabel(visibleStart, { year: true })} a ${monthLabel(cur, { year: true })}`,
  };
}

const inWin = (ts, win) => {
  if (!win || !Number.isFinite(ts)) return false;
  const m = monthIdx(ts);
  return m >= win.start && m <= win.end;
};

// ── Filtros (só actuam sobre as operações) ───────────────────────────────────
export function emptyFilters() {
  return { dests: [], methods: [], sides: [], currencies: [] };
}
export function countFilters(f) {
  if (!f) return 0;
  return ["dests", "methods", "sides", "currencies"].reduce((n, k) => n + ((f[k] || []).length ? 1 : 0), 0);
}
export function filterOrders(orders, f) {
  if (!f || countFilters(f) === 0) return orders;
  const ok = (arr, v) => !arr || arr.length === 0 || arr.includes(v);
  return orders.filter(
    (o) =>
      ok(f.dests, o.destination) &&
      ok(f.methods, o.payment_method) &&
      ok(f.sides, o.side) &&
      ok(f.currencies, o.currency || "USD")
  );
}

// ── Somas ────────────────────────────────────────────────────────────────────
export function tally(list) {
  let done = 0, open = 0, lost = 0, volume = 0, volumeAll = 0;
  for (const o of list) {
    const g = statusGroup(o.status);
    const aoa = num(o.amount_aoa);
    volumeAll += aoa;
    if (g === "done") { done++; volume += aoa; }
    else if (g === "lost") lost++;
    else open++;
  }
  const closed = done + lost;
  return {
    total: list.length,
    done, open, lost, closed,
    volume,
    volumeAll,
    rate: closed > 0 ? done / closed : null,
    ticket: done > 0 ? volume / done : null,
  };
}

export function recurrence(list) {
  const per = new Map();
  for (const o of list) {
    if (o.status !== "completed") continue;
    for (const u of new Set([o.user_id, o.funder_id].filter(Boolean))) per.set(u, (per.get(u) || 0) + 1);
  }
  let returning = 0;
  per.forEach((n) => { if (n >= 2) returning++; });
  return { active: per.size, returning, rate: per.size > 0 ? returning / per.size : null };
}

export function participants(list) {
  const s = new Set();
  for (const o of list) { if (o.user_id) s.add(o.user_id); if (o.funder_id) s.add(o.funder_id); }
  return s;
}

export function revenue(recharges, ledger, win) {
  let cash = 0, n = 0, used = 0;
  for (const r of recharges || []) {
    if (r.status !== "confirmed") continue;
    if (!inWin(toMs(r.confirmed_at ?? r.created_at), win)) continue;
    cash += num(r.amount_kz);
    n++;
  }
  for (const t of ledger || []) {
    if (!inWin(toMs(t.created_at), win)) continue;
    if (t.type === "debit_matching") used += Math.abs(num(t.amount));
    else if (t.type === "refund_cancel") used -= Math.abs(num(t.amount));
  }
  return { cash, recharges: n, creditsUsed: Math.max(0, used) };
}

// Tempo mediano entre criar e concluir (minutos). A mediana ignora casos
// isolados (uma operação que ficou meses à espera estraga a média).
export function medianCompletionMinutes(list) {
  const v = [];
  for (const o of list) {
    if (o.status !== "completed") continue;
    const a = toMs(o.created_at), b = toMs(o.sent_at ?? o.updated_at);
    if (Number.isFinite(a) && Number.isFinite(b) && b >= a) v.push((b - a) / 60000);
  }
  if (!v.length) return null;
  v.sort((x, y) => x - y);
  const m = Math.floor(v.length / 2);
  return v.length % 2 ? v[m] : (v[m - 1] + v[m]) / 2;
}

// Média das avaliações dadas nas operações concluídas (1 a 5), se existirem.
export function averageRating(list) {
  let s = 0, n = 0;
  for (const o of list) {
    if (o.status !== "completed") continue;
    for (const k of ["funder_rating", "buyer_rating", "seller_rating"]) {
      const r = o[k];
      if (r != null && Number.isFinite(+r) && +r > 0) { s += +r; n++; }
    }
  }
  return n > 0 ? { value: s / n, count: n } : null;
}

// ── Variações ────────────────────────────────────────────────────────────────
// kind: "none" (sem comparação) | "new" (antes era zero) | "pct" | "pts"
export function pctDelta(cur, prev) {
  if (prev == null) return { kind: "none" };
  if (prev === 0) return cur > 0 ? { kind: "new" } : { kind: "none" };
  return { kind: "pct", value: ((cur - prev) / prev) * 100 };
}
export function ptsDelta(cur, prev) {
  if (cur == null || prev == null) return { kind: "none" };
  return { kind: "pts", value: (cur - prev) * 100 };
}

// ── Séries mensais ───────────────────────────────────────────────────────────
export function monthlySeries(orders, recharges, months, currentIdx) {
  const by = new Map(months.map((i) => [i, {
    idx: i, label: monthLabel(i), year: Math.floor(i / 12),
    ops: 0, done: 0, open: 0, lost: 0, volume: 0, revenue: 0,
    isCurrent: i === currentIdx,
  }]));
  for (const o of orders) {
    const b = by.get(monthIdx(toMs(o.created_at)));
    if (!b) continue;
    b.ops++;
    const g = statusGroup(o.status);
    b[g]++;
    if (g === "done") b.volume += num(o.amount_aoa);
  }
  for (const r of recharges || []) {
    if (r.status !== "confirmed") continue;
    const b = by.get(monthIdx(toMs(r.confirmed_at ?? r.created_at)));
    if (b) b.revenue += num(r.amount_kz);
  }
  return months.map((i) => by.get(i));
}

// ── Mapa de calor: linhas (destinos) × colunas (meses) ───────────────────────
export function heatmap(orders, months, topN = 5) {
  const set = new Set(months);
  const rows = new Map();
  for (const o of orders) {
    const m = monthIdx(toMs(o.created_at));
    if (!set.has(m)) continue;
    const key = o.destination || "—";
    if (!rows.has(key)) rows.set(key, { id: key, total: 0, volume: 0, cells: new Map() });
    const r = rows.get(key);
    r.total++;
    const c = r.cells.get(m) || { ops: 0, done: 0, volume: 0 };
    c.ops++;
    if (o.status === "completed") { c.done++; c.volume += num(o.amount_aoa); r.volume += num(o.amount_aoa); }
    r.cells.set(m, c);
  }
  let list = [...rows.values()].sort((a, b) => b.total - a.total || b.volume - a.volume);
  if (list.length > topN) {
    const head = list.slice(0, topN - 1);
    const tail = list.slice(topN - 1);
    const other = { id: "__other__", total: 0, volume: 0, cells: new Map(), merged: tail.length };
    for (const r of tail) {
      other.total += r.total; other.volume += r.volume;
      r.cells.forEach((c, m) => {
        const x = other.cells.get(m) || { ops: 0, done: 0, volume: 0 };
        x.ops += c.ops; x.done += c.done; x.volume += c.volume;
        other.cells.set(m, x);
      });
    }
    list = [...head, other];
  }
  let maxOps = 0, maxVol = 0;
  const out = list.map((r) => ({
    id: r.id, total: r.total, volume: r.volume, merged: r.merged || 0,
    cells: months.map((m) => {
      const c = r.cells.get(m) || { ops: 0, done: 0, volume: 0 };
      if (c.ops > maxOps) maxOps = c.ops;
      if (c.volume > maxVol) maxVol = c.volume;
      return { idx: m, ...c };
    }),
  }));
  return { rows: out, months, maxOps, maxVol };
}

// ── Classificações (por destino, método, lado, moeda) ────────────────────────
export function rank(orders, keyFn) {
  const by = new Map();
  for (const o of orders) {
    const k = keyFn(o) || "—";
    if (!by.has(k)) by.set(k, []);
    by.get(k).push(o);
  }
  const totalVol = tally(orders).volume;
  return [...by.entries()]
    .map(([key, list]) => {
      const t = tally(list);
      return { key, ...t, share: totalVol > 0 ? t.volume / totalVol : 0 };
    })
    .sort((a, b) => b.total - a.total || b.volume - a.volume);
}

// ── Utilizadores ─────────────────────────────────────────────────────────────
export function userName(p) {
  if (!p) return "Utilizador";
  const n = (p.full_name || [p.first_name, p.last_name].filter(Boolean).join(" ")).trim();
  return n || "Utilizador";
}
export function initials(name) {
  const parts = String(name || "").trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "?";
  return ((parts[0][0] || "") + (parts.length > 1 ? parts[parts.length - 1][0] : "")).toUpperCase();
}

export function usersBlock({ profiles, orders, allOrders, win }) {
  const everyone = profiles || [];
  const known = new Set(everyone.map((p) => p.id));
  const verified = everyone.filter((p) => p.kyc_status === "verified").length;
  const inWindow = everyone.filter((p) => inWin(toMs(p.created_at), win)).length;
  const ever = participants(orders); // no período e filtros escolhidos
  const credits = everyone.reduce((s, p) => s + Math.max(0, num(p.credits_balance)), 0);

  // Funil: acumulado da plataforma desde o início (todas as operações, sem período nem filtros),
  // para cada passo ser um subconjunto do anterior.
  const base = allOrders || orders;
  const countKnown = (set) => [...set].filter((id) => known.has(id)).length;
  const madeOrder = countKnown(participants(base));
  const completed = Math.min(madeOrder, countKnown(participants(base.filter((o) => o.status === "completed"))));
  const returning = Math.min(completed, recurrence(base).returning);
  const funnel = [
    { id: "signup", label: "Registados", value: everyone.length },
    { id: "order", label: "Fizeram uma operação", value: Math.min(everyone.length, madeOrder) },
    { id: "done", label: "Concluíram uma operação", value: completed },
    { id: "repeat", label: "Voltaram a concluir", value: returning },
  ];

  // Quem mais movimenta
  const per = new Map();
  for (const o of orders) {
    for (const u of new Set([o.user_id, o.funder_id].filter(Boolean))) {
      const x = per.get(u) || { id: u, ops: 0, done: 0, volume: 0, last: 0 };
      x.ops++;
      const t = toMs(o.created_at);
      if (Number.isFinite(t) && t > x.last) x.last = t;
      if (o.status === "completed") { x.done++; x.volume += num(o.amount_aoa); }
      per.set(u, x);
    }
  }
  const byId = new Map(everyone.map((p) => [p.id, p]));
  const top = [...per.values()]
    .sort((a, b) => b.volume - a.volume || b.ops - a.ops)
    .slice(0, 10)
    .map((x) => {
      const p = byId.get(x.id);
      return { ...x, name: userName(p), kyc: p?.kyc_status || "pending", credits: p ? num(p.credits_balance) : 0 };
    });

  return { total: everyone.length, verified, newInWindow: inWindow, withOrders: ever.size, credits, funnel, top };
}

// ── Actividade recente (operações, recargas, registos) ───────────────────────
export function activityFeed({ orders, recharges, profiles, limit = 200 }) {
  const ev = [];
  for (const o of orders || []) {
    const g = statusGroup(o.status);
    const ts = g === "done" ? toMs(o.sent_at ?? o.updated_at ?? o.created_at) : toMs(o.updated_at ?? o.created_at);
    if (Number.isFinite(ts)) ev.push({ kind: "order", ts, order: o, group: g });
  }
  for (const r of recharges || []) {
    const ts = toMs(r.status === "confirmed" ? (r.confirmed_at ?? r.created_at) : r.created_at);
    if (Number.isFinite(ts)) ev.push({ kind: "recharge", ts, recharge: r });
  }
  for (const p of profiles || []) {
    const ts = toMs(p.created_at);
    if (Number.isFinite(ts)) ev.push({ kind: "signup", ts, profile: p });
  }
  ev.sort((a, b) => b.ts - a.ts);
  return ev.slice(0, limit);
}

// ── Tudo junto ───────────────────────────────────────────────────────────────
export function firstTimestamp({ orders, recharges, profiles, ledger }) {
  let first = Infinity;
  for (const list of [orders, recharges, profiles, ledger]) {
    for (const r of list || []) {
      const t = toMs(r.created_at);
      if (Number.isFinite(t) && t < first) first = t;
    }
  }
  return Number.isFinite(first) ? first : NaN;
}

export function computeDashboard({ orders = [], recharges = [], ledger = [], profiles = [], periodId = "12m", filters, nowMs = Date.now() }) {
  const firstMs = firstTimestamp({ orders, recharges, profiles, ledger });
  const period = resolvePeriod(periodId, nowMs, firstMs);

  // Todas as operações (sem filtros) servem para "Mais usados" e para as opções do filtro
  const allInWin = orders.filter((o) => inWin(toMs(o.created_at), period));
  const scoped = filterOrders(orders, filters);
  const cur = scoped.filter((o) => inWin(toMs(o.created_at), period));
  const prev = period.prev ? scoped.filter((o) => inWin(toMs(o.created_at), period.prev)) : null;

  const tCur = tally(cur);
  const tPrev = prev ? tally(prev) : null;
  const rCur = recurrence(cur);
  const rPrev = prev ? recurrence(prev) : null;
  const revCur = revenue(recharges, ledger, period);
  const revPrev = period.prev ? revenue(recharges, ledger, period.prev) : null;

  const kpi = {
    volume: {
      value: tCur.volume, done: tCur.done, total: tCur.total, ticket: tCur.ticket,
      delta: pctDelta(tCur.volume, tPrev ? tPrev.volume : null),
    },
    completion: {
      value: tCur.rate, done: tCur.done, closed: tCur.closed, open: tCur.open,
      delta: ptsDelta(tCur.rate, tPrev ? tPrev.rate : null),
    },
    recurrence: {
      value: rCur.rate, returning: rCur.returning, active: rCur.active,
      delta: ptsDelta(rCur.rate, rPrev ? rPrev.rate : null),
    },
    revenue: {
      value: revCur.cash, recharges: revCur.recharges, creditsUsed: revCur.creditsUsed,
      delta: pctDelta(revCur.cash, revPrev ? revPrev.cash : null),
    },
  };

  const monthly = monthlySeries(scoped, recharges, period.visible, period.current);
  const heat = heatmap(cur.filter((o) => inWin(toMs(o.created_at), { start: period.visible[0], end: period.current })), period.visible, 5);

  const topDests = rank(allInWin, (o) => o.destination).slice(0, 3).map((r) => ({ id: r.key, total: r.total }));

  return {
    period,
    firstMs,
    counts: { orders: tCur.total, users: participants(cur).size },
    kpi,
    distribution: { total: tCur.total, done: tCur.done, open: tCur.open, lost: tCur.lost },
    monthly,
    heat,
    topDests,
    byDest: rank(cur, (o) => o.destination),
    byMethod: rank(cur, (o) => o.payment_method),
    bySide: rank(cur, (o) => o.side),
    byCurrency: rank(cur, (o) => o.currency || "USD"),
    medianMinutes: medianCompletionMinutes(cur),
    rating: averageRating(cur),
    users: usersBlock({ profiles, orders: cur, allOrders: orders, win: period }),
    revenue: revCur,
    activity: activityFeed({ orders: scoped, recharges, profiles }),
    options: {
      dests: [...new Set(orders.map((o) => o.destination).filter(Boolean))],
      methods: [...new Set(orders.map((o) => o.payment_method).filter(Boolean))],
      sides: [...new Set(orders.map((o) => o.side).filter(Boolean))],
      currencies: [...new Set(orders.map((o) => o.currency || "USD"))],
    },
  };
}

// ── Formatação (pt-AO) ───────────────────────────────────────────────────────
const dec = (x, d = 1) => x.toFixed(d).replace(/\.0+$/, "").replace(".", ",");

export function compact(n) {
  const a = Math.abs(n);
  if (a >= 1e9) return `${dec(n / 1e9)} mil M`;
  if (a >= 1e6) return `${dec(n / 1e6)} M`;
  if (a >= 1e3) return `${dec(n / 1e3)} mil`;
  return String(Math.round(n));
}
export const kz = (n) => `${compact(n)} Kz`;
export const fullInt = (n) => Math.round(n).toLocaleString("pt-AO");
export const fullKz = (n) => `${fullInt(n)} Kz`;
export const pct = (r, d = 0) => (r == null ? "—" : `${dec(r * 100, d)}%`);

export function deltaText(d) {
  if (!d || d.kind === "none") return null;
  if (d.kind === "new") return "novo";
  const v = d.value;
  if (Math.abs(v) < 0.5) return d.kind === "pts" ? "0 pontos" : "0%";
  const sign = v > 0 ? "+" : "−";
  const a = Math.abs(v);
  const s = a >= 100 ? Math.round(a).toString() : dec(a, a < 10 ? 1 : 0);
  return d.kind === "pts" ? `${sign}${s} ${a >= 1.5 ? "pontos" : "ponto"}` : `${sign}${s}%`;
}
export function deltaDir(d) {
  if (!d || d.kind === "none") return 0;
  if (d.kind === "new") return 1;
  if (Math.abs(d.value) < 0.5) return 0;
  return d.value > 0 ? 1 : -1;
}

export function duration(min) {
  if (min == null) return "—";
  if (min < 1) return "< 1 min";
  if (min < 60) return `${Math.round(min)} min`;
  if (min < 60 * 48) return `${dec(min / 60)} h`;
  return `${dec(min / 1440, 0)} dias`;
}

export function timeAgo(ts, nowMs = Date.now()) {
  const s = Math.max(0, (nowMs - ts) / 1000);
  if (s < 60) return "agora";
  if (s < 3600) return `há ${Math.floor(s / 60)} min`;
  if (s < 86400) return `há ${Math.floor(s / 3600)} h`;
  if (s < 86400 * 7) { const d = Math.floor(s / 86400); return `há ${d} ${d === 1 ? "dia" : "dias"}`; }
  const d = new Date(ts + LUANDA_OFFSET);
  const base = `${d.getUTCDate()} ${MONTHS_SHORT[d.getUTCMonth()]}`;
  return d.getUTCFullYear() === new Date(nowMs + LUANDA_OFFSET).getUTCFullYear() ? base : `${base} ${d.getUTCFullYear()}`;
}

export function dateTimeLuanda(ts) {
  const d = new Date(ts + LUANDA_OFFSET);
  const p = (x) => String(x).padStart(2, "0");
  return `${p(d.getUTCDate())} ${MONTHS_SHORT[d.getUTCMonth()]} ${d.getUTCFullYear()}, ${p(d.getUTCHours())}:${p(d.getUTCMinutes())}`;
}

// Máximo "bonito" para o eixo: um destes valores × 10^k, sempre com folga por cima do dado
// (a etiqueta do valor não bate no topo) e com metade redonda (para a marca do meio).
const NICE = [1, 1.2, 1.6, 2, 2.4, 3, 4, 5, 6, 8, 10];
export function niceMax(v) {
  if (!(v > 0)) return 1;
  const want = v * 1.12;
  const p = Math.pow(10, Math.floor(Math.log10(want)));
  const f = want / p;
  return (NICE.find((x) => x >= f - 1e-9) || 10) * p;
}

// Número grande + unidade pequena: 245100 → ["245,1", "mil Kz"]
export function kzParts(n) {
  const a = Math.abs(n);
  if (a >= 1e9) return [dec(n / 1e9), "mil M Kz"];
  if (a >= 1e6) return [dec(n / 1e6), "M Kz"];
  if (a >= 1e3) return [dec(n / 1e3), "mil Kz"];
  return [String(Math.round(n)), "Kz"];
}

// Versão curta para células pequenas: 114000 → "114k", 1230000 → "1,2M"
export function short(n) {
  const a = Math.abs(n);
  if (a >= 1e9) return `${dec(n / 1e9)}B`;
  if (a >= 1e6) return `${dec(n / 1e6)}M`;
  if (a >= 1e3) return `${dec(n / 1e3, a >= 1e5 ? 0 : 1)}k`;
  return String(Math.round(n));
}

export function plural(n, one, many) {
  return n === 1 ? one : many;
}

// Cumprimenta o número de operações em linguagem natural
export function countLabel(n, one, many) {
  return `${n} ${plural(n, one, many)}`;
}
