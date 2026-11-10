// Modo apresentação: escolher os slides ("Preparar apresentação") e mostrá-los
// em ecrã inteiro, um número de cada vez, para reuniões com bancos e parceiros.
// Mostra exactamente os mesmos números do dashboard (mesmo período e filtros).
import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { I, BarChart, SegBar, Delta, FUNNEL_RAMP } from "./dashboardParts.jsx";
import { kzParts, kz, pct, fullInt, plural } from "./dashboardData.js";

export function buildSlides(data, { destMeta, nowText }) {
  const k = data.kpi, d = data.distribution, period = data.period;
  const [vN, vU] = kzParts(k.volume.value);
  const [rN, rU] = kzParts(k.revenue.value);
  const maxDest = Math.max(1, ...data.byDest.map((r) => r.total));
  const first = data.users.funnel[0] ? data.users.funnel[0].value : 0;

  return [
    {
      id: "volume", label: "Volume concluído", available: k.volume.done > 0,
      hint: k.volume.done > 0 ? `${kz(k.volume.value)} em ${k.volume.done} ${plural(k.volume.done, "operação", "operações")}` : "",
      render: () => (
        <div className="ps">
          <p className="ps-kicker">Volume concluído</p>
          <div className="ps-num"><span>{vN}</span><small>{vU}</small></div>
          <div className="ps-line">
            <Delta d={k.volume.delta} />
            <span>{k.volume.done} {plural(k.volume.done, "operação concluída", "operações concluídas")}, {period.rangeText}</span>
          </div>
          {k.volume.ticket != null && <p className="ps-note">Ticket médio de {kz(k.volume.ticket)} por operação.</p>}
        </div>
      ),
    },
    {
      id: "completion", label: "Taxa de conclusão", available: k.completion.value != null,
      hint: k.completion.value != null ? `${pct(k.completion.value)} das operações encerradas` : "",
      render: () => (
        <div className="ps">
          <p className="ps-kicker">Taxa de conclusão</p>
          <div className="ps-num"><span>{Math.round((k.completion.value || 0) * 100)}</span><small>%</small></div>
          <div className="ps-line"><Delta d={k.completion.delta} /><span>{k.completion.done} de {k.completion.closed} {plural(k.completion.closed, "operação encerrada foi concluída", "operações encerradas foram concluídas")}</span></div>
          <div className="ps-seg"><SegBar height={14} parts={[{ label: "Concluídas", value: d.done, color: "var(--d-good)" }, { label: "Em curso", value: d.open, color: "var(--d-neutral)" }, { label: "Canceladas", value: d.lost, color: "var(--d-bad)" }]} /></div>
          <ul className="ps-legend">
            <li><i style={{ background: "var(--d-good)" }} />{d.done} concluídas</li>
            <li><i style={{ background: "var(--d-neutral)" }} />{d.open} em curso</li>
            <li><i style={{ background: "var(--d-bad)" }} />{d.lost} canceladas</li>
          </ul>
        </div>
      ),
    },
    {
      id: "monthly", label: "Volume por mês", available: data.monthly.some((m) => m.volume > 0),
      hint: data.monthly.some((m) => m.volume > 0) ? period.rangeText : "",
      render: () => (
        <div className="ps wide">
          <p className="ps-kicker">Volume por mês</p>
          <p className="ps-sub">Operações concluídas, em Kz · {period.rangeText}</p>
          <BarChart data={data.monthly} metric="volume" height={340} />
        </div>
      ),
    },
    {
      id: "recurrence", label: "Recorrência", available: k.recurrence.value != null,
      hint: k.recurrence.value != null ? `${k.recurrence.returning} de ${k.recurrence.active} utilizadores voltaram` : "",
      render: () => (
        <div className="ps">
          <p className="ps-kicker">Recorrência</p>
          <div className="ps-num"><span>{Math.round((k.recurrence.value || 0) * 100)}</span><small>%</small></div>
          <div className="ps-line"><Delta d={k.recurrence.delta} /><span>{k.recurrence.returning} de {k.recurrence.active} {plural(k.recurrence.active, "utilizador voltou", "utilizadores voltaram")} a concluir operações</span></div>
          <p className="ps-note">Voltar = ter 2 ou mais operações concluídas.</p>
        </div>
      ),
    },
    {
      id: "dests", label: "Destinos mais usados", available: data.byDest.length > 0,
      hint: data.byDest.length > 0 ? data.byDest.slice(0, 3).map((r) => destMeta(r.key).label).join(", ") : "",
      render: () => (
        <div className="ps wide">
          <p className="ps-kicker">Destinos mais usados</p>
          <p className="ps-sub">Número de operações por destino · {period.rangeText}</p>
          <ul className="ps-rank">
            {data.byDest.slice(0, 5).map((r) => {
              const m = destMeta(r.key);
              return (
                <li key={r.key}>
                  <span className="ps-rank-l"><i style={{ background: m.color }} />{m.label}</span>
                  <span className="ps-rank-bar"><i style={{ width: `${(r.total / maxDest) * 100}%` }} /></span>
                  <span className="ps-rank-n"><b>{fullInt(r.total)}</b> {plural(r.total, "operação", "operações")}{r.done > 0 ? ` · ${r.done} ${plural(r.done, "concluída", "concluídas")}` : ""}</span>
                </li>
              );
            })}
          </ul>
        </div>
      ),
    },
    {
      id: "revenue", label: "Receita de créditos", available: k.revenue.value > 0 || k.revenue.recharges > 0,
      hint: k.revenue.value > 0 ? `${kz(k.revenue.value)} em ${k.revenue.recharges} ${plural(k.revenue.recharges, "recarga", "recargas")}` : "",
      render: () => (
        <div className="ps">
          <p className="ps-kicker">Receita de créditos</p>
          <div className="ps-num"><span>{rN}</span><small>{rU}</small></div>
          <div className="ps-line"><Delta d={k.revenue.delta} /><span>{k.revenue.recharges} {plural(k.revenue.recharges, "recarga confirmada", "recargas confirmadas")}, {period.rangeText}</span></div>
          <p className="ps-note">{fullInt(k.revenue.creditsUsed)} {plural(k.revenue.creditsUsed, "crédito usado", "créditos usados")} em operações.</p>
        </div>
      ),
    },
    {
      id: "users", label: "Utilizadores", available: data.users.total > 0,
      hint: data.users.total > 0 ? `${data.users.total} registados, ${data.users.verified} verificados` : "",
      render: () => (
        <div className="ps wide">
          <p className="ps-kicker">Utilizadores</p>
          <p className="ps-sub">Do registo à recorrência, desde o início da plataforma</p>
          <div className="dash-fun big">
            {data.users.funnel.map((f, i) => (
              <div className="dash-fun-row" key={f.id}>
                <span className="dash-fun-lbl">{f.label}</span>
                <span className="dash-fun-bar"><i style={{ width: first > 0 ? `${Math.max((f.value / first) * 100, f.value > 0 ? 2 : 0)}%` : 0, background: FUNNEL_RAMP[i] }} /></span>
                <span className="dash-fun-n"><b>{fullInt(f.value)}</b></span>
              </div>
            ))}
          </div>
        </div>
      ),
    },
    {
      id: "end", label: "Fecho", locked: true, available: true, hint: "Sempre incluído",
      render: () => (
        <div className="ps">
          <p className="ps-end-t">Bridge Market</p>
          <p className="ps-end-s">Mercado P2P de câmbio entre kwanzas e moeda estrangeira.</p>
          <p className="ps-end-n">Dados da plataforma a {nowText}.</p>
        </div>
      ),
    },
  ];
}

// ── "Preparar apresentação" ──────────────────────────────────────────────────
export function PrepareDialog({ slides, onStart, onClose }) {
  const [sel, setSel] = useState(() => new Set(slides.filter((s) => s.available && !s.locked).map((s) => s.id)));
  const box = useRef(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  useEffect(() => {
    if (box.current) box.current.focus();
    const key = (e) => { if (e.key === "Escape") closeRef.current(); };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, []);
  const toggle = (id) => setSel((s) => { const n = new Set(s); if (n.has(id)) n.delete(id); else n.add(id); return n; });
  const picked = slides.filter((s) => s.locked || sel.has(s.id));
  const contentPicked = picked.filter((s) => !s.locked).length;

  return createPortal(
    <div className="dprep-back" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="dprep" role="dialog" aria-modal="true" aria-labelledby="dprep-t" tabIndex={-1} ref={box}>
        <h3 id="dprep-t">Preparar apresentação</h3>
        <p className="dprep-sub">Escolhe o que mostrar. Os números são os do período e dos filtros que estão activos no dashboard.</p>
        <ul className="dprep-list">
          {slides.map((s) => (
            <li key={s.id}>
              <label className={`dprep-item${!s.available ? " off" : ""}`}>
                <input type="checkbox" checked={!!s.locked || sel.has(s.id)} disabled={!!s.locked || !s.available} onChange={() => toggle(s.id)} />
                <span><b>{s.label}</b><small>{s.available ? s.hint : "Sem dados neste período"}</small></span>
              </label>
            </li>
          ))}
        </ul>
        <footer className="dprep-foot">
          <button type="button" className="dash-btn" onClick={onClose}>Cancelar</button>
          <button type="button" className="dash-btn primary" disabled={contentPicked === 0} onClick={() => onStart(picked)}>
            <I n="play" s={14} /> Iniciar apresentação
          </button>
        </footer>
      </div>
    </div>,
    document.body
  );
}

// ── Apresentação em ecrã inteiro ─────────────────────────────────────────────
export function Presentation({ slides, onClose, footerLeft, footerRight }) {
  const [i, setI] = useState(0);
  const root = useRef(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  const last = slides.length - 1;
  const go = useCallback((fn) => setI((x) => Math.min(last, Math.max(0, fn(x)))), [last]);

  useEffect(() => {
    const key = (e) => {
      if (e.key === "Escape") { closeRef.current(); return; }
      if (["ArrowRight", "PageDown", " ", "Enter"].includes(e.key)) { e.preventDefault(); go((x) => x + 1); }
      else if (["ArrowLeft", "PageUp", "Backspace"].includes(e.key)) { e.preventDefault(); go((x) => x - 1); }
      else if (e.key === "Home") go(() => 0);
      else if (e.key === "End") go(() => last);
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, [go, last]);

  // Ecrã inteiro quando o navegador deixa; sair do ecrã inteiro termina a apresentação.
  useEffect(() => {
    let entered = false;
    const el = root.current;
    try {
      if (el && el.requestFullscreen) el.requestFullscreen().then(() => { entered = true; }).catch(() => {});
    } catch (_) { /* sem ecrã inteiro: a apresentação cobre a janela na mesma */ }
    const onFs = () => { if (entered && !document.fullscreenElement) closeRef.current(); };
    document.addEventListener("fullscreenchange", onFs);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("fullscreenchange", onFs);
      document.body.style.overflow = prevOverflow;
      try { if (document.fullscreenElement) document.exitFullscreen(); } catch (_) { /* nada */ }
    };
  }, []);

  const slide = slides[i];
  return createPortal(
    <div className={`dpres${slide.id === "end" ? " is-end" : ""}`} ref={root} role="dialog" aria-modal="true" aria-label="Apresentação">
      <div className="dpres-progress" aria-hidden="true"><i style={{ width: `${((i + 1) / slides.length) * 100}%` }} /></div>
      <button type="button" className="dpres-x" onClick={onClose} aria-label="Sair da apresentação" title="Sair (Esc)"><I n="x" s={22} /></button>
      <button type="button" className="dpres-nav prev" onClick={() => go((x) => x - 1)} disabled={i === 0} aria-label="Slide anterior"><I n="left" s={26} /></button>
      <button type="button" className="dpres-nav next" onClick={() => go((x) => x + 1)} disabled={i === last} aria-label="Slide seguinte"><I n="chevron" s={26} /></button>
      <div className={`dpres-stage s-${slide.id}`} key={slide.id} aria-live="polite">{slide.render()}</div>
      <footer className="dpres-foot">
        <span>{footerLeft}</span>
        <span className="dpres-count">{i + 1} / {slides.length}</span>
        <span className="dpres-r">{footerRight}</span>
      </footer>
    </div>,
    document.body
  );
}
