import { useEffect, useLayoutEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Calculator as CalculatorIcon, ChevronDown, ChevronLeft, ChevronRight, ChevronUp, Delete, Eraser, Pencil, Trash2, Undo2, X } from 'lucide-react';
import { CalcError, evaluate, formatNumber } from '../lib/calc.ts';
import { useProgress } from '../store/useProgress.ts';
import { useTools, type InkColor, type Stroke, type ToolTab } from '../store/useTools.ts';
import { Inline } from './RichText.tsx';
import { IconButton } from './ui.tsx';

/*
 * Calculator and scratchpad, available in lectures and every kind of practice.
 * Desktop (≥ 1024 px): a panel docked on the right; the page shifts left so nothing is covered.
 * Phone and tablet: a bottom sheet above the page's bottom bar, at half height or almost full screen.
 * The page opts in with the classes `tools-shift` (its root) and `tools-shift-fixed` (fixed bars),
 * and marks its bottom bar with `data-tools-bar` so the sheet can sit right above it.
 */

const DESKTOP = '(min-width: 1024px)';

function useMedia(query: string) {
  const [match, setMatch] = useState(() => window.matchMedia(query).matches);
  useEffect(() => {
    const m = window.matchMedia(query);
    const on = () => setMatch(m.matches);
    m.addEventListener('change', on);
    return () => m.removeEventListener('change', on);
  }, [query]);
  return match;
}

/** True when a key press belongs to the tools (typing in the calculator, drawing), not to the page. */
export const isToolsEvent = (e: Event) => e.target instanceof Element && !!e.target.closest('[data-tools-panel]');

/** The two header buttons that open and close the tools. */
export function ToolButtons() {
  const open = useTools((s) => s.open);
  const toggle = useTools((s) => s.toggle);
  const item = (tab: ToolTab, label: string, key: string, icon: React.ReactNode) => (
    <IconButton
      label={`${label} (${key})`}
      aria-pressed={open === tab}
      onClick={() => toggle(tab)}
      className={`!h-10 !w-10 shrink-0 ${open === tab ? '!border-accent !bg-accent-soft !text-accent' : ''}`}
    >
      {icon}
    </IconButton>
  );
  return (
    <>
      {item('calc', 'Calculator', 'C', <CalculatorIcon size={20} />)}
      {item('notes', 'Scratchpad', 'N', <Pencil size={20} />)}
    </>
  );
}

interface PanelProps {
  /** Identifies the current question or section: each gets its own scratch sheet. */
  pageKey: string;
  pageLabel: string;
  /** Short reminder of the task, shown at the top of the full-height phone sheet. */
  pin?: string;
  /** Hides the phone sheet for a moment (while the answer feedback is shown); the desktop panel stays. */
  suspended?: boolean;
}

export function ToolsPanel({ pageKey, pageLabel, pin, suspended = false }: PanelProps) {
  const desktop = useMedia(DESKTOP);
  const { open, full, show, close, setFull, toggle, resetPages, ensurePage } = useTools();
  const visible = !!open && (desktop || !suspended);

  // A new screen starts with no scratch sheets.
  useEffect(() => {
    resetPages();
  }, [resetPages]);
  useEffect(() => {
    ensurePage(pageKey, pageLabel);
  }, [pageKey, pageLabel, ensurePage]);

  // Tell the page how to make room: see .tools-shift in index.css.
  useLayoutEffect(() => {
    const root = document.documentElement;
    root.dataset.tools = visible ? (desktop ? 'side' : 'sheet') : '';
    root.style.setProperty('--sheet-h', full ? 'calc(100dvh - var(--bar-h, 0px) - 4.5rem)' : 'min(52dvh, 430px)');
  }, [visible, desktop, full]);
  useEffect(() => () => void (document.documentElement.dataset.tools = ''), []);
  // While the panel animates out, its input must not keep the keyboard focus.
  useEffect(() => {
    const el = document.activeElement;
    if (!visible && el instanceof HTMLElement && el.closest('[data-tools-panel]')) el.blur();
  }, [visible]);

  // Sit right above the page's bottom bar on phones.
  useLayoutEffect(() => {
    const bar = document.querySelector<HTMLElement>('[data-tools-bar]');
    const set = () => document.documentElement.style.setProperty('--bar-h', `${bar?.offsetHeight ?? 0}px`);
    set();
    if (!bar) return;
    const ro = new ResizeObserver(set);
    ro.observe(bar);
    return () => ro.disconnect();
  });

  // C toggles the calculator, N the scratchpad, Esc closes.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === 'Escape' && useTools.getState().open) {
        close();
        return;
      }
      const t = e.target;
      if (t instanceof HTMLInputElement || t instanceof HTMLTextAreaElement) return;
      const tab = e.key === 'c' || e.key === 'C' ? 'calc' : e.key === 'n' || e.key === 'N' ? 'notes' : null;
      if (!tab) return;
      e.preventDefault(); // the letter must not land in the calculator, which takes focus as it opens
      toggle(tab);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [close, toggle]);

  const tabs = (
    <div className="flex gap-1 rounded-xl bg-bg p-1">
      {(['calc', 'notes'] as const).map((t) => (
        <button
          key={t}
          type="button"
          onClick={() => show(t)}
          className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-extrabold ${open === t ? 'bg-surface2 text-fg' : 'text-muted hover:text-fg'}`}
        >
          {t === 'calc' ? <CalculatorIcon size={16} /> : <Pencil size={16} />}
          {t === 'calc' ? 'Calculator' : 'Notes'}
        </button>
      ))}
    </div>
  );
  const closeBtn = (
    <IconButton label="Close tools (Esc)" onClick={close} className="!h-9 !w-9 !border-0 !bg-transparent">
      <X size={20} />
    </IconButton>
  );
  const body = open === 'calc' ? <Calculator compact={!desktop && !full} /> : <Scratchpad pageKey={pageKey} />;

  if (desktop) {
    return (
      <AnimatePresence>
        {visible && (
          <motion.aside
            data-tools-panel
            initial={{ x: 40, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 40, opacity: 0 }}
            transition={{ duration: 0.16 }}
            className="fixed inset-y-0 right-0 z-30 flex w-[var(--tools-w)] flex-col gap-3 border-l-2 border-line bg-surface p-3"
          >
            <div className="flex items-center justify-between">
              {tabs}
              {closeBtn}
            </div>
            {body}
          </motion.aside>
        )}
      </AnimatePresence>
    );
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.aside
          data-tools-panel
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%', transition: { duration: 0.15 } }}
          transition={{ type: 'spring', stiffness: 380, damping: 36 }}
          style={{ bottom: 'var(--bar-h, 0px)', height: 'var(--sheet-h)' }}
          className="fixed inset-x-0 z-30 flex flex-col gap-2 rounded-t-3xl border-2 border-b-0 border-line bg-surface px-3 pb-3 shadow-[0_-10px_30px_rgba(0,0,0,0.3)] transition-[height] duration-200"
        >
          <SheetHandle full={full} setFull={setFull} close={close} />
          {full && pin && (
            <div className="line-clamp-2 rounded-xl border-2 border-line bg-bg px-3 py-1.5 text-sm text-muted">
              <Inline text={pin} />
            </div>
          )}
          <div className="flex items-center gap-1">
            {tabs}
            <IconButton label={full ? 'Smaller' : 'Larger'} onClick={() => setFull(!full)} className="ml-auto !h-9 !w-9 !border-0 !bg-transparent">
              {full ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
            </IconButton>
            {closeBtn}
          </div>
          {body}
        </motion.aside>
      )}
    </AnimatePresence>
  );
}

/** Drag handle of the phone sheet: tap toggles the height, swipe up enlarges, swipe down shrinks or closes. */
function SheetHandle({ full, setFull, close }: { full: boolean; setFull: (v: boolean) => void; close: () => void }) {
  const start = useRef<number | null>(null);
  const onDown = (e: ReactPointerEvent) => {
    start.current = e.clientY;
    (e.target as Element).setPointerCapture(e.pointerId);
  };
  const onUp = (e: ReactPointerEvent) => {
    if (start.current === null) return;
    const dy = e.clientY - start.current;
    start.current = null;
    if (dy < -30) setFull(true);
    else if (dy > 30) {
      if (full) setFull(false);
      else close();
    } else setFull(!full);
  };
  return (
    <button
      type="button"
      aria-label={full ? 'Make the sheet smaller' : 'Make the sheet larger'}
      onPointerDown={onDown}
      onPointerUp={onUp}
      onPointerCancel={() => (start.current = null)}
      className="-mb-1 flex h-6 w-full shrink-0 touch-none items-center justify-center"
    >
      <span className="h-1.5 w-12 rounded-full bg-line" />
    </button>
  );
}

// ---------------------------------------------------------------- Calculator

const FN_KEYS: [string, string][] = [
  ['ln', 'ln('],
  ['log', 'log('],
  ['exp', 'exp('],
  ['e', 'e'],
  ['n!', '!'],
  ['nCr', 'C('],
  [',', ','],
  ['sin', 'sin('],
  ['cos', 'cos('],
  ['tan', 'tan('],
  ['|x|', 'abs('],
];
const KEYS: [string, string][] = [
  ['AC', 'clear'], ['(', '('], [')', ')'], ['^', '^'], ['⌫', 'back'],
  ['7', '7'], ['8', '8'], ['9', '9'], ['÷', '÷'], ['√', '√('],
  ['4', '4'], ['5', '5'], ['6', '6'], ['×', '×'], ['x²', '^2'],
  ['1', '1'], ['2', '2'], ['3', '3'], ['−', '−'], ['π', 'π'],
  ['0', '0'], ['.', '.'], ['ans', 'ans'], ['+', '+'], ['=', 'enter'],
];

function Calculator({ compact }: { compact: boolean }) {
  const { expr, ans, history, setExpr, pushResult, clearHistory } = useTools();
  const coarse = useMedia('(pointer: coarse)');
  const input = useRef<HTMLInputElement>(null);
  const caret = useRef({ start: expr.length, end: expr.length });
  const [error, setError] = useState('');

  const preview = useMemo(() => {
    if (!expr.trim()) return '';
    try {
      return formatNumber(evaluate(expr, ans));
    } catch {
      return null;
    }
  }, [expr, ans]);

  useEffect(() => {
    if (!coarse) input.current?.focus();
  }, [coarse]);

  const remember = () => {
    const el = input.current;
    if (el) caret.current = { start: el.selectionStart ?? el.value.length, end: el.selectionEnd ?? el.value.length };
  };
  // After a key button or Enter changes the text, put the caret where the edit ended (right after React renders it).
  const pendingCaret = useRef<number | null>(null);
  useLayoutEffect(() => {
    const el = input.current;
    const pos = pendingCaret.current;
    pendingCaret.current = null;
    if (el && pos !== null && document.activeElement === el) el.setSelectionRange(pos, pos);
  });
  const place = (pos: number) => {
    caret.current = { start: pos, end: pos };
    pendingCaret.current = pos;
  };
  const change = (value: string, pos: number) => {
    setExpr(value);
    setError('');
    place(pos);
  };

  const commit = () => {
    if (!expr.trim()) return;
    try {
      const v = evaluate(expr, ans);
      pushResult(expr, v);
      const shown = Number.isFinite(v) ? formatNumber(v) : expr;
      change(shown, shown.length);
    } catch (e) {
      setError(e instanceof CalcError ? e.message : 'Cannot evaluate');
    }
  };

  const press = (k: string) => {
    const { start, end } = caret.current;
    if (k === 'enter') return commit();
    if (k === 'clear') return change('', 0);
    if (k === 'back') {
      if (start !== end) return change(expr.slice(0, start) + expr.slice(end), start);
      if (start === 0) return;
      return change(expr.slice(0, start - 1) + expr.slice(start), start - 1);
    }
    change(expr.slice(0, start) + k + expr.slice(end), start + k.length);
  };

  // Keep the caret in the input while a key button is clicked.
  const keep = (e: React.MouseEvent) => e.preventDefault();
  const key = (label: string, k: string, extra = '') => (
    <button
      key={label}
      type="button"
      onMouseDown={keep}
      onClick={() => press(k)}
      aria-label={label === '⌫' ? 'Delete' : label}
      className={`flex items-center justify-center rounded-xl border-2 border-b-4 font-extrabold transition-transform active:translate-y-[2px] ${compact ? 'h-9 text-base' : 'h-11 text-lg'} ${extra}`}
    >
      {label === '⌫' ? <Delete size={20} /> : label}
    </button>
  );

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-2">
      {!compact && (
        <div className="min-h-0 flex-1 overflow-y-auto rounded-xl bg-bg px-3 py-2 font-mono text-sm">
          {history.length ? (
            <>
              {history.map((h, i) => (
                <button
                  key={history.length - i}
                  type="button"
                  onMouseDown={keep}
                  onClick={() => press(formatNumber(h.value))}
                  title="Insert this result"
                  className="flex w-full justify-between gap-3 rounded-md px-1 py-0.5 text-left text-muted hover:bg-surface2 hover:text-fg"
                >
                  <span className="truncate">{h.expr}</span>
                  <span className="shrink-0 text-fg">= {formatNumber(h.value)}</span>
                </button>
              ))}
              <button type="button" onClick={clearHistory} className="mt-1 px-1 font-sans text-xs font-bold text-muted hover:text-fg">
                Clear history
              </button>
            </>
          ) : (
            <p className="font-sans text-xs leading-relaxed text-muted">
              Type an expression such as <span className="font-mono">sqrt(0.25/100)</span> or <span className="font-mono">C(5,2)·0.5^5</span>. Enter or = saves it here; tap a result to reuse it. Angles are in radians.
            </p>
          )}
        </div>
      )}
      <div className="rounded-xl border-2 border-line bg-bg px-3 py-1.5 focus-within:border-accent">
        <input
          ref={input}
          value={expr}
          inputMode={coarse ? 'none' : 'text'}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          aria-label="Expression"
          placeholder="0"
          onChange={(e) => {
            setExpr(e.target.value);
            setError('');
            remember();
          }}
          onSelect={remember}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              commit();
            }
          }}
          className="w-full bg-transparent font-mono text-lg outline-none placeholder:text-muted"
        />
        <div className={`h-6 truncate text-right font-mono text-base font-bold tabular-nums ${error ? 'text-danger' : preview === null ? 'text-muted' : 'text-fg'}`} aria-live="polite">
          {error || (preview === null ? '…' : preview && `= ${preview}`)}
        </div>
      </div>
      <div className="-mx-1 flex shrink-0 gap-1 overflow-x-auto px-1 pb-0.5">
        {FN_KEYS.map(([label, k]) => (
          <button
            key={label}
            type="button"
            onMouseDown={keep}
            onClick={() => press(k)}
            className="h-8 shrink-0 rounded-lg border-2 border-line bg-bg px-2.5 font-mono text-sm font-bold text-muted hover:text-fg"
          >
            {label}
          </button>
        ))}
      </div>
      <div className="grid shrink-0 grid-cols-5 gap-1.5">
        {KEYS.map(([label, k]) =>
          key(
            label,
            k,
            k === 'enter'
              ? 'border-primary-deep bg-primary text-white'
              : /^[\d.]$/.test(label)
                ? 'border-line bg-surface2 text-fg'
                : 'border-line bg-bg text-accent',
          ),
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- Scratchpad

const INKS: InkColor[] = ['fg', 'accent', 'danger'];
const INK_VAR: Record<InkColor, string> = { fg: '--c-fg', accent: '--c-accent', danger: '--c-danger' };

/** Distance from p to the segment ab. */
function segDist(p: [number, number], a: [number, number, number], b: [number, number, number]) {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const len = dx * dx + dy * dy;
  const t = len ? Math.max(0, Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / len)) : 0;
  return Math.hypot(p[0] - a[0] - t * dx, p[1] - a[1] - t * dy);
}

function drawStroke(ctx: CanvasRenderingContext2D, s: Stroke, color: string) {
  const pts = s.points;
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  if (pts.length === 1) {
    ctx.beginPath();
    ctx.arc(pts[0][0], pts[0][1], (s.width * (0.4 + pts[0][2] * 1.2)) / 2, 0, Math.PI * 2);
    ctx.fill();
    return;
  }
  // Each segment gets its own width so pen pressure shows; midpoints keep the line smooth.
  for (let i = 1; i < pts.length; i++) {
    const [x0, y0] = i > 1 ? [(pts[i - 2][0] + pts[i - 1][0]) / 2, (pts[i - 2][1] + pts[i - 1][1]) / 2] : pts[0];
    const [x1, y1] = [(pts[i - 1][0] + pts[i][0]) / 2, (pts[i - 1][1] + pts[i][1]) / 2];
    ctx.lineWidth = s.width * (0.4 + pts[i][2] * 1.2);
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.quadraticCurveTo(pts[i - 1][0], pts[i - 1][1], i === pts.length - 1 ? pts[i][0] : x1, i === pts.length - 1 ? pts[i][1] : y1);
    ctx.stroke();
  }
}

function Scratchpad({ pageKey }: { pageKey: string }) {
  const pages = useTools((s) => s.pages);
  const { setStrokes, undo } = useTools.getState();
  const theme = useProgress((s) => s.theme);
  const [viewKey, setViewKey] = useState(pageKey);
  const [ink, setInk] = useState<InkColor>('fg');
  const [erasing, setErasing] = useState(false);
  const [drawing, setDrawing] = useState(false);
  const canvas = useRef<HTMLCanvasElement>(null);
  const live = useRef<{ id: number; stroke?: Stroke; strokes?: Stroke[] } | null>(null);
  const penSeen = useRef(false);

  // A new question shows its own, fresh sheet.
  useEffect(() => setViewKey(pageKey), [pageKey]);
  // The sheet being viewed; undefined for a moment while a new question's sheet is created.
  const index = pages.findIndex((p) => p.key === viewKey);
  const page = index >= 0 ? pages[index] : undefined;

  const redraw = () => {
    const cv = canvas.current;
    if (!cv) return;
    const ctx = cv.getContext('2d')!;
    const dpr = window.devicePixelRatio || 1;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, cv.width, cv.height);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    const css = getComputedStyle(document.documentElement);
    const colors = Object.fromEntries(INKS.map((c) => [c, css.getPropertyValue(INK_VAR[c]).trim()])) as Record<InkColor, string>;
    const strokes = live.current?.strokes ?? page?.strokes ?? [];
    for (const s of strokes) drawStroke(ctx, s, colors[s.color]);
    if (live.current?.stroke) drawStroke(ctx, live.current.stroke, colors[live.current.stroke.color]);
  };

  // The resize observer is created once, so it calls the latest redraw through a ref.
  const redrawRef = useRef(redraw);
  redrawRef.current = redraw;
  useEffect(redraw);
  useEffect(() => {
    const cv = canvas.current!;
    const ro = new ResizeObserver(() => {
      const dpr = window.devicePixelRatio || 1;
      cv.width = Math.round(cv.clientWidth * dpr);
      cv.height = Math.round(cv.clientHeight * dpr);
      redrawRef.current();
    });
    ro.observe(cv);
    return () => ro.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(redraw, [theme]); // eslint-disable-line react-hooks/exhaustive-deps

  const at = (e: { clientX: number; clientY: number; pointerType: string; pressure: number }): [number, number, number] => {
    const r = canvas.current!.getBoundingClientRect();
    const pressure = e.pointerType === 'pen' ? e.pressure || 0.5 : 0.5;
    return [e.clientX - r.left, e.clientY - r.top, pressure];
  };
  const eraseAt = (p: [number, number, number]) => {
    const cur = live.current!;
    const before = cur.strokes!;
    const after = before.filter((s) => !s.points.some((q, i) => segDist([p[0], p[1]], s.points[Math.max(0, i - 1)], q) < 12));
    if (after.length !== before.length) {
      cur.strokes = after;
      redraw();
    }
  };

  const onDown = (e: ReactPointerEvent<HTMLCanvasElement>) => {
    if (!page || live.current) return;
    if (e.pointerType === 'pen') penSeen.current = true;
    else if (e.pointerType === 'touch' && penSeen.current) return; // palm rejection once a stylus is used
    if (e.button > 0) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    setDrawing(true);
    const p = at(e);
    if (erasing) {
      live.current = { id: e.pointerId, strokes: page.strokes };
      eraseAt(p);
    } else {
      live.current = { id: e.pointerId, stroke: { color: ink, width: 2.6, points: [p] } };
      redraw();
    }
  };
  const onMove = (e: ReactPointerEvent<HTMLCanvasElement>) => {
    const cur = live.current;
    if (!cur || cur.id !== e.pointerId) return;
    const events = e.nativeEvent.getCoalescedEvents?.() ?? [e.nativeEvent];
    for (const ev of events.length ? events : [e.nativeEvent]) {
      const p = at(ev);
      if (cur.stroke) cur.stroke.points.push(p);
      else eraseAt(p);
    }
    redraw();
  };
  const onUp = (e: ReactPointerEvent<HTMLCanvasElement>) => {
    const cur = live.current;
    if (!cur || cur.id !== e.pointerId || !page) return;
    live.current = null;
    setDrawing(false);
    if (cur.stroke) setStrokes(page.key, [...page.strokes, cur.stroke]);
    else if (cur.strokes && cur.strokes.length !== page.strokes.length) setStrokes(page.key, cur.strokes);
    else redraw();
  };

  const tool = (active: boolean, label: string, onClick: () => void, child: React.ReactNode) => (
    <button
      type="button"
      aria-label={label}
      title={label}
      aria-pressed={active}
      onClick={onClick}
      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border-2 ${active ? 'border-accent bg-accent-soft text-accent' : 'border-line bg-bg text-muted hover:text-fg'}`}
    >
      {child}
    </button>
  );

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-2">
      <div className="flex items-center gap-1.5">
        {INKS.map((c) =>
          tool(!erasing && ink === c, { fg: 'Pen', accent: 'Blue pen', danger: 'Red pen' }[c], () => {
            setInk(c);
            setErasing(false);
          }, <span className="h-4 w-4 rounded-full" style={{ background: `var(${INK_VAR[c]})` }} />),
        )}
        {tool(erasing, 'Eraser: removes whole strokes', () => setErasing(true), <Eraser size={18} />)}
        {tool(false, 'Undo', () => page && undo(page.key), <Undo2 size={18} />)}
        {tool(false, 'Clear the sheet', () => page && page.strokes.length && setStrokes(page.key, []), <Trash2 size={18} />)}
        {page && pages.length > 1 && (
          <div className="ml-auto flex items-center text-xs font-extrabold tabular-nums text-muted" title={page?.label}>
            <button type="button" aria-label="Previous sheet" disabled={index === 0} onClick={() => setViewKey(pages[index - 1].key)} className="p-1 disabled:opacity-30">
              <ChevronLeft size={18} />
            </button>
            {index + 1}/{pages.length}
            <button type="button" aria-label="Next sheet" disabled={index === pages.length - 1} onClick={() => setViewKey(pages[index + 1].key)} className="p-1 disabled:opacity-30">
              <ChevronRight size={18} />
            </button>
          </div>
        )}
      </div>
      <div className="scratch-grid relative min-h-0 flex-1 overflow-hidden rounded-xl border-2 border-line bg-bg">
        <canvas
          ref={canvas}
          aria-label="Scratchpad: draw with a mouse, finger or pen"
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerCancel={onUp}
          onContextMenu={(e) => e.preventDefault()}
          className={`absolute inset-0 h-full w-full touch-none ${erasing ? 'cursor-cell' : 'cursor-crosshair'}`}
        />
        {page && !page.strokes.length && !drawing && (
          <span className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 text-center text-sm font-bold text-muted/70">
            {index === pages.length - 1 ? 'A fresh sheet for this task' : page.label}
          </span>
        )}
        {page && index !== pages.length - 1 && (
          <span className="pointer-events-none absolute left-2 top-2 rounded-md bg-surface px-2 py-0.5 text-xs font-bold text-muted">{page?.label}</span>
        )}
      </div>
    </div>
  );
}
