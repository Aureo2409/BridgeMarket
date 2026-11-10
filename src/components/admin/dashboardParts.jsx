// Peças visuais do dashboard do ADM (sem dados próprios: recebem tudo por props).
import { useState, useRef, useLayoutEffect, useCallback } from "react";
import { compact, short, fullInt, fullKz, deltaText, deltaDir, niceMax, MONTHS_SHORT } from "./dashboardData.js";

// ── Ícones (traço) ───────────────────────────────────────────────────────────
const PATHS = {
  up: <path d="M12 19V5M5 12l7-7 7 7" />,
  down: <path d="M12 5v14M19 12l-7 7-7-7" />,
  check: <path d="M20 6L9 17l-5-5" />,
  clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
  x: <path d="M18 6L6 18M6 6l12 12" />,
  ban: <><circle cx="12" cy="12" r="9" /><path d="M5.6 5.6l12.8 12.8" /></>,
  sliders: <><path d="M4 6h9M17 6h3M4 12h3M11 12h9M4 18h11M19 18h1" /><circle cx="15" cy="6" r="2" /><circle cx="9" cy="12" r="2" /><circle cx="17" cy="18" r="2" /></>,
  play: <path d="M7 4.5l12 7.5-12 7.5z" fill="currentColor" />,
  table: <><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M3 10h18M9 10v10" /></>,
  bars: <path d="M6 20V11M12 20V4M18 20v-6" />,
  chevron: <path d="M9 6l6 6-6 6" />,
  left: <path d="M15 6l-6 6 6 6" />,
  refresh: <><path d="M21 12a9 9 0 0 1-15.5 6.2L3 16" /><path d="M3 12a9 9 0 0 1 15.5-6.2L21 8" /><path d="M21 3v5h-5M3 21v-5h5" /></>,
  user: <><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></>,
  wallet: <><path d="M3 7a2 2 0 0 1 2-2h13v4" /><rect x="3" y="7" width="18" height="13" rx="2" /><circle cx="16.5" cy="13.5" r="1.2" /></>,
  signup: <><circle cx="10" cy="8" r="4" /><path d="M2 21a8 8 0 0 1 13-6M19 14v6M16 17h6" /></>,
  swap: <path d="M4 8h14l-3-3M20 16H6l3 3" />,
  full: <path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" />,
};
export function I({ n, s = 16 }) {
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      {PATHS[n]}
    </svg>
  );
}

// ── Cartão e cabeçalho ───────────────────────────────────────────────────────
export function Card({ title, sub, right, children, className = "", id }) {
  return (
    <section className={`dash-card ${className}`} id={id}>
      {(title || right) && (
        <header className="dash-ch">
          <div>
            {title && <h3>{title}</h3>}
            {sub && <p>{sub}</p>}
          </div>
          {right && <div className="dash-ch-r">{right}</div>}
        </header>
      )}
      {children}
    </section>
  );
}

// Controlo segmentado pequeno (rádio): Tab entra no grupo, setas mudam a opção
export function Seg({ value, onChange, options, label, small }) {
  const refs = useRef([]);
  const has = options.some((o) => o.id === value);
  const move = (i, dir) => {
    const j = (i + dir + options.length) % options.length;
    onChange(options[j].id);
    if (refs.current[j]) refs.current[j].focus();
  };
  const onKey = (e, i) => {
    if (e.key === "ArrowRight" || e.key === "ArrowDown") { e.preventDefault(); move(i, 1); }
    else if (e.key === "ArrowLeft" || e.key === "ArrowUp") { e.preventDefault(); move(i, -1); }
  };
  return (
    <div className={`dash-seg${small ? " sm" : ""}`} role="radiogroup" aria-label={label}>
      {options.map((o, i) => (
        <button
          key={o.id} type="button" role="radio" ref={(el) => { refs.current[i] = el; }}
          aria-checked={value === o.id} tabIndex={value === o.id || (!has && i === 0) ? 0 : -1}
          title={o.title} onClick={() => onChange(o.id)} onKeyDown={(e) => onKey(e, i)}
        >
          {o.icon ? <I n={o.icon} s={14} /> : null}
          {o.label ? <span>{o.label}</span> : null}
          {o.icon && !o.label ? <span className="sr">{o.title}</span> : null}
        </button>
      ))}
    </div>
  );
}

// ── Variação (setinha + sinal + cor) ─────────────────────────────────────────
export function Delta({ d, onDark, title }) {
  const text = deltaText(d);
  if (!text) return null;
  const dir = deltaDir(d);
  const tone = dir === 0 ? "flat" : dir > 0 ? "good" : "bad"; // em todas as métricas, subir é bom
  return (
    <span className={`dash-delta ${tone}${onDark ? " on-dark" : ""}`} title={title}>
      {dir !== 0 && <I n={dir > 0 ? "up" : "down"} s={12} />}
      {text}
    </span>
  );
}

export function Kpi({ hero, label, value, unit, delta, caption, sub, deltaTitle }) {
  return (
    <article className={`dash-card dash-kpi${hero ? " is-hero" : ""}`}>
      <header>
        <span className="dash-kpi-lbl">{label}</span>
        <Delta d={delta} onDark={hero} title={deltaTitle} />
      </header>
      <div className="dash-kpi-val">
        <span>{value}</span>
        {unit ? <small>{unit}</small> : null}
      </div>
      <div className="dash-kpi-foot">
        <p className="dash-kpi-cap">{caption}</p>
        {sub ? <p className="dash-kpi-sub">{sub}</p> : null}
      </div>
    </article>
  );
}

export function Empty({ title, children }) {
  return (
    <div className="dash-empty">
      <b>{title}</b>
      {children ? <span>{children}</span> : null}
    </div>
  );
}

// ── Dica flutuante (hover, toque e teclado) ──────────────────────────────────
export function useTip() {
  const wrap = useRef(null);
  const el = useRef(null);
  const [tip, setTip] = useState(null);
  const [pos, setPos] = useState(null);

  const show = useCallback((e, node) => {
    const box = wrap.current && wrap.current.getBoundingClientRect();
    if (!box) return;
    let x, y;
    if (e.type === "focus" || e.type === "focusin" || e.clientX == null) {
      const r = e.currentTarget.getBoundingClientRect();
      x = r.left + r.width / 2 - box.left;
      y = r.top - box.top;
    } else {
      x = e.clientX - box.left;
      y = e.clientY - box.top;
    }
    setTip({ x, y, node });
  }, []);
  const hide = useCallback(() => { setTip(null); setPos(null); }, []);

  useLayoutEffect(() => {
    if (!tip || !el.current || !wrap.current) return;
    const w = el.current.offsetWidth, h = el.current.offsetHeight, W = wrap.current.clientWidth;
    const half = w / 2;
    setPos({ left: Math.min(Math.max(tip.x, half + 4), Math.max(half + 4, W - half - 4)), below: tip.y < h + 20 });
  }, [tip]);

  const node = tip ? (
    <div ref={el} className="dash-tip" role="tooltip" data-pos={pos && pos.below ? "below" : "above"} style={{ left: pos ? pos.left : tip.x, top: tip.y, visibility: pos ? "visible" : "hidden" }}>
      {tip.node}
    </div>
  ) : null;
  return { wrap, show, hide, node };
}

// Setas/Home/End movem o foco entre as marcas ([data-rv]); Esc fecha a dica.
function marksKeys(e, tip, cols) {
  if (e.key === "Escape") { tip.hide(); return; }
  if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End"].includes(e.key)) return;
  const items = [...e.currentTarget.querySelectorAll("[data-rv]")];
  const i = items.indexOf(document.activeElement);
  if (i < 0) return;
  const last = items.length - 1;
  let j = i;
  if (e.key === "ArrowRight") j = Math.min(last, i + 1);
  else if (e.key === "ArrowLeft") j = Math.max(0, i - 1);
  else if (e.key === "ArrowDown") j = Math.min(last, i + cols);
  else if (e.key === "ArrowUp") j = Math.max(0, i - cols);
  else if (e.key === "Home") j = 0;
  else j = last;
  e.preventDefault();
  if (j !== i) items[j].focus();
}

const tipBind = (tip, node) => ({
  onPointerEnter: (e) => tip.show(e, node),
  onPointerMove: (e) => tip.show(e, node),
  onPointerLeave: tip.hide,
  onFocus: (e) => tip.show(e, node),
  onBlur: tip.hide,
});

// ── Gráfico de barras por mês ────────────────────────────────────────────────
function countTop(max) {
  if (max <= 10) return Math.max(2, Math.ceil((max * 1.15) / 2) * 2); // par, para a marca do meio ser inteira
  return niceMax(max);
}

const METRIC = {
  volume: { get: (m) => m.volume, money: true, name: "Volume concluído" },
  ops: { get: (m) => m.ops, money: false, name: "Operações" },
  revenue: { get: (m) => m.revenue, money: true, name: "Receita" },
};

export function BarChart({ data, metric = "volume", height = 220 }) {
  const M = METRIC[metric] || METRIC.volume;
  const tip = useTip();
  const [act, setAct] = useState(0);
  const vals = data.map(M.get);
  const max = Math.max(0, ...vals);
  const top = M.money ? niceMax(max) : countTop(max);
  const mid = top / 2;
  const empty = max === 0;
  const ticks = empty ? [0] : [0, ...(M.money || Number.isInteger(mid) ? [mid] : []), top];
  const fmtTick = (v) => (M.money ? (v === 0 ? "0" : compact(v)) : String(v));
  const many = data.length > 8;
  const peak = vals.indexOf(max);
  const showLabel = (i) => vals[i] > 0 && (!many || i === peak || data[i].isCurrent);

  return (
    <div className="dash-chart" ref={tip.wrap} style={{ "--h": `${height}px` }}>
      <div className="dash-chart-y" aria-hidden="true">
        {ticks.map((t) => (
          <span key={t} style={{ bottom: `${(t / top) * 100}%` }}>{fmtTick(t)}</span>
        ))}
      </div>
      <div className="dash-chart-main">
        <div className="dash-chart-area" role="group" aria-label={`${M.name} por mês`}>
          {ticks.map((t) => (
            <i key={t} className={`dash-grid${t === 0 ? " base" : ""}`} style={{ bottom: `${(t / top) * 100}%` }} />
          ))}
          <div className="dash-cols" style={{ gridTemplateColumns: `repeat(${data.length}, minmax(0,1fr))` }} onKeyDown={(e) => marksKeys(e, tip, 1)}>
            {data.map((m, i) => {
              const v = vals[i];
              const h = v > 0 ? Math.max((v / top) * 100, 1.2) : 0;
              const full = `${m.label} ${m.year}`;
              const valueText = M.money ? fullKz(v) : `${fullInt(v)} ${v === 1 ? "operação" : "operações"}`;
              const node = (
                <>
                  <small>{full}{m.isCurrent ? " (em curso)" : ""}</small>
                  <b>{valueText}</b>
                  <small>{m.done} {m.done === 1 ? "concluída" : "concluídas"} · {m.lost} {m.lost === 1 ? "cancelada" : "canceladas"} · {m.open} em curso</small>
                </>
              );
              return (
                <div
                  key={m.idx} className={`dash-col${m.isCurrent ? " cur" : ""}`} data-rv
                  tabIndex={(act < data.length ? act : 0) === i ? 0 : -1} aria-label={`${full}: ${valueText}`}
                  {...tipBind(tip, node)} onFocus={(e) => { setAct(i); tip.show(e, node); }}
                >
                  <div className="dash-bar" style={{ height: `${h}%` }} />
                  {showLabel(i) && (
                    <span className="dash-val" style={{ bottom: `calc(${h}% + 5px)` }}>{M.money ? compact(v) : v}</span>
                  )}
                </div>
              );
            })}
          </div>
          {empty && <div className="dash-chart-empty">Sem dados neste período</div>}
        </div>
        <div className={`dash-chart-x${many ? " many" : ""}`} style={{ gridTemplateColumns: `repeat(${data.length}, minmax(0,1fr))` }} aria-hidden="true">
          {data.map((m, i) => (
            <span key={m.idx}>
              {m.label}
              {(i === 0 || m.label === MONTHS_SHORT[0]) && <em>{m.year}</em>}
            </span>
          ))}
        </div>
      </div>
      {tip.node}
    </div>
  );
}

// ── Barra segmentada fina (uma parte do todo, ao lado dos números) ───────────
export function SegBar({ parts, height = 8 }) {
  const total = parts.reduce((s, p) => s + p.value, 0);
  return (
    <div className="dash-segbar" style={{ height }} role="img" aria-label={parts.map((p) => `${p.label}: ${p.value}`).join(", ")}>
      {total === 0 ? <i style={{ flex: 1, background: "#E7E9F2" }} /> : parts.filter((p) => p.value > 0).map((p) => <i key={p.label} style={{ flex: p.value, background: p.color }} />)}
    </div>
  );
}

// ── Mapa de calor ────────────────────────────────────────────────────────────
// Um só tom (índigo), do claro ao escuro; o mais claro ainda se distingue do fundo branco (≥ 2:1).
// Texto escuro nos 3 primeiros (≥ 4,5:1) e branco nos 2 mais escuros (≥ 5,6:1).
export const HEAT_RAMP = ["#A4AFF4", "#8691F1", "#6B73EC", "#5453E1", "#4433D3"];
const heatColor = (v, max) => {
  if (!(v > 0) || !(max > 0)) return null;
  const b = Math.min(5, Math.max(1, Math.ceil((v / max) * 5)));
  return { bg: HEAT_RAMP[b - 1], fg: b >= 4 ? "#FFFFFF" : "#0F1222" };
};

export function Heatmap({ heat, metric, meta }) {
  const tip = useTip();
  const [act, setAct] = useState(0);
  const scroller = useRef(null);
  const n = heat.months.length;
  const max = metric === "volume" ? heat.maxVol : heat.maxOps;
  const monthName = (idx) => `${MONTHS_SHORT[idx % 12]} ${Math.floor(idx / 12)}`;
  // Em ecrãs estreitos o mapa não cabe: abre nos meses mais recentes (os que mais interessam).
  // Quando cabe tudo não há deslize e isto não faz nada.
  useLayoutEffect(() => {
    const el = scroller.current;
    if (el) el.scrollLeft = el.scrollWidth;
  }, [n, heat.rows.length]);
  return (
    <div className="dash-heatwrap" ref={tip.wrap}>
      <div className="dash-heat" ref={scroller} style={{ "--n": n, gridTemplateRows: `repeat(${heat.rows.length}, minmax(38px, 68px)) auto` }} onKeyDown={(e) => marksKeys(e, tip, n)}>
        {heat.rows.map((r, ri) => {
          const m = meta(r.id, r.merged);
          return (
            <div className="dash-heat-row" key={r.id}>
              <div className="dash-heat-lbl" title={m.label}>
                <i style={{ background: m.color }} />
                <span>{m.label}</span>
              </div>
              {r.cells.map((c, ci) => {
                const flat = ri * n + ci;
                const v = metric === "volume" ? c.volume : c.ops;
                const col = heatColor(v, max);
                const text = metric === "volume" ? `${fullKz(c.volume)} concluídos · ${fullInt(c.ops)} ${c.ops === 1 ? "operação" : "operações"}` : `${fullInt(c.ops)} ${c.ops === 1 ? "operação" : "operações"} · ${fullInt(c.done)} ${c.done === 1 ? "concluída" : "concluídas"}`;
                const node = (
                  <>
                    <small>{m.label} · {monthName(c.idx)}</small>
                    <b>{c.ops === 0 ? "Sem operações" : text}</b>
                  </>
                );
                return (
                  <div
                    key={c.idx}
                    className={`dash-cell${col ? "" : " none"}`}
                    style={col ? { background: col.bg, color: col.fg } : undefined}
                    data-rv tabIndex={(act < heat.rows.length * n ? act : 0) === flat ? 0 : -1}
                    aria-label={`${m.label}, ${monthName(c.idx)}: ${c.ops === 0 ? "sem operações" : text}`}
                    {...tipBind(tip, node)} onFocus={(e) => { setAct(flat); tip.show(e, node); }}
                  >
                    {v > 0 ? (metric === "volume" ? short(v) : v) : ""}
                  </div>
                );
              })}
            </div>
          );
        })}
        <div className="dash-heat-row dash-heat-x" aria-hidden="true">
          <span />
          {heat.months.map((idx) => (
            <span key={idx}>{MONTHS_SHORT[idx % 12]}</span>
          ))}
        </div>
      </div>
      {tip.node}
    </div>
  );
}

export function HeatScale({ metric }) {
  return (
    <div className="dash-scale" aria-hidden="true">
      <span>{metric === "volume" ? "menos Kz" : "menos"}</span>
      {HEAT_RAMP.map((c) => <i key={c} style={{ background: c }} />)}
      <span>{metric === "volume" ? "mais Kz" : "mais"}</span>
      <i className="none" /> <span>sem operações</span>
    </div>
  );
}

// Funil: um só tom, do claro ao escuro, na ordem dos passos
export const FUNNEL_RAMP = ["#98A3F6", "#6F7BEE", "#4F46E5", "#3B33C4"];

// ── Versão em tabela (o "gémeo" acessível de cada gráfico) ───────────────────
export function DataTable({ caption, head, rows }) {
  return (
    <div className="dash-tablewrap">
      <table className="dash-tbl">
        <caption className="sr">{caption}</caption>
        <thead>
          <tr>{head.map((h, i) => <th key={i} scope="col">{h}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>{r.map((c, j) => (j === 0 ? <th key={j} scope="row">{c}</th> : <td key={j}>{c}</td>))}</tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Avatar com iniciais ──────────────────────────────────────────────────────
export function Avatar({ name, initials }) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) % 360;
  return (
    <span className="dash-avatar" style={{ background: `hsl(${h} 70% 93%)`, color: `hsl(${h} 45% 28%)` }} aria-hidden="true">
      {initials}
    </span>
  );
}

export function Badge({ tone, icon, children }) {
  return (
    <span className={`dash-badge ${tone}`}>
      {icon ? <I n={icon} s={12} /> : null}
      {children}
    </span>
  );
}
