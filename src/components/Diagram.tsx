import type { ReactNode } from 'react';

/**
 * Figures for lectures and questions, keyed by `type`.
 * Shared style: outlines in the text colour; the vectors being discussed in the
 * theme's accent (blue), primary (green) and warn (yellow) colours.
 */

type Pt = [number, number];

const BLUE = 'var(--c-accent)';
const GREEN = 'var(--c-primary)';
const YELLOW = 'var(--c-warn)';
const RED = 'var(--c-danger)';

const thin = { stroke: 'currentColor', strokeWidth: 1.3, fill: 'none' };
const faint = { ...thin, opacity: 0.18 };
const dashed = { ...thin, strokeDasharray: '5 5', opacity: 0.55 };
interface TextStyle {
  fill: string;
  fontSize: number;
  fontStyle: 'italic' | 'normal';
  fontFamily: string;
  textAnchor: 'middle';
  fontWeight?: number;
  opacity?: number;
}
const label: TextStyle = { fill: 'currentColor', fontSize: 15, fontStyle: 'italic', fontFamily: 'KaTeX_Math, "Times New Roman", serif', textAnchor: 'middle' };
const caption: TextStyle = { ...label, fontStyle: 'normal', fontSize: 12.5, fontFamily: 'inherit', fontWeight: 700, opacity: 0.75 };

/** Maps maths coordinates (y up) to SVG coordinates for a given origin and unit length. */
const plane = (ox: number, oy: number, unit: number) => (x: number, y: number): Pt => [ox + unit * x, oy - unit * y];

/** An arrow from a to b with a solid head. */
function Arrow({ from, to, color = 'currentColor', width = 2.6, dash, opacity }: { from: Pt; to: Pt; color?: string; width?: number; dash?: string; opacity?: number }) {
  const [x1, y1] = from;
  const [x2, y2] = to;
  const len = Math.hypot(x2 - x1, y2 - y1) || 1;
  const ux = (x2 - x1) / len;
  const uy = (y2 - y1) / len;
  const head = 11;
  const bx = x2 - ux * head;
  const by = y2 - uy * head;
  const px = -uy * 5;
  const py = ux * 5;
  return (
    <g opacity={opacity}>
      <line x1={x1} y1={y1} x2={bx} y2={by} stroke={color} strokeWidth={width} strokeLinecap="round" strokeDasharray={dash} />
      <polygon points={`${x2},${y2} ${bx + px},${by + py} ${bx - px},${by - py}`} fill={color} />
    </g>
  );
}

const Dot = ({ at, color = 'currentColor' }: { at: Pt; color?: string }) => <circle cx={at[0]} cy={at[1]} r={3.2} fill={color} />;

const Text = ({ at, children, color, dx = 0, dy = 0, style = label }: { at: Pt; children: ReactNode; color?: string; dx?: number; dy?: number; style?: TextStyle }) => (
  <text x={at[0] + dx} y={at[1] + dy} {...style} fill={color ?? style.fill}>
    {children}
  </text>
);

/** Light axes through the origin. */
function Axes({ o, x0, x1, y0, y1 }: { o: Pt; x0: number; x1: number; y0: number; y1: number }) {
  return (
    <g {...thin} opacity={0.45}>
      <line x1={x0} y1={o[1]} x2={x1} y2={o[1]} />
      <line x1={o[0]} y1={y0} x2={o[0]} y2={y1} />
    </g>
  );
}

/** Lines i·a + t·b and i·b + t·a: the coordinate grid built from two vectors. */
function SkewGrid({ p, a, b, n = 3, clipId }: { p: (x: number, y: number) => Pt; a: Pt; b: Pt; n?: number; clipId: string }) {
  const lines: ReactNode[] = [];
  for (let i = -n; i <= n; i++) {
    const s1 = p(i * a[0] - n * b[0], i * a[1] - n * b[1]);
    const e1 = p(i * a[0] + n * b[0], i * a[1] + n * b[1]);
    const s2 = p(i * b[0] - n * a[0], i * b[1] - n * a[1]);
    const e2 = p(i * b[0] + n * a[0], i * b[1] + n * a[1]);
    lines.push(<line key={`a${i}`} x1={s1[0]} y1={s1[1]} x2={e1[0]} y2={e1[1]} />, <line key={`b${i}`} x1={s2[0]} y1={s2[1]} x2={e2[0]} y2={e2[1]} />);
  }
  return (
    <g clipPath={`url(#${clipId})`} {...faint} opacity={0.3}>
      {lines}
    </g>
  );
}

const figures: Record<string, { title: string; viewBox: string; body: () => ReactNode }> = {
  vectorAdd: {
    title: 'Vectors u and v placed tip to tail; their sum u + v is the diagonal of the parallelogram they span',
    viewBox: '0 0 320 220',
    body: () => {
      const p = plane(50, 190, 40);
      const u: Pt = [4, 1];
      const v: Pt = [1, 2.5];
      const s: Pt = [5, 3.5];
      return (
        <>
          <Axes o={p(0, 0)} x0={20} x1={305} y0={15} y1={205} />
          <Arrow from={p(...u)} to={p(...s)} color={GREEN} dash="6 5" opacity={0.6} />
          <Arrow from={p(...v)} to={p(...s)} color={BLUE} dash="6 5" opacity={0.6} />
          <Arrow from={p(0, 0)} to={p(...s)} color={YELLOW} width={3} />
          <Arrow from={p(0, 0)} to={p(...u)} color={BLUE} />
          <Arrow from={p(0, 0)} to={p(...v)} color={GREEN} />
          <Text at={p(2.2, 0.55)} dy={18} color={BLUE}>u</Text>
          <Text at={p(0.5, 1.4)} dx={-14} color={GREEN}>v</Text>
          <Text at={p(2.6, 1.95)} dx={-24} dy={-12} color={YELLOW}>u + v</Text>
          <Dot at={p(0, 0)} />
        </>
      );
    },
  },

  linearCombo: {
    title: 'The vector w = (5, 1) reached as 3 times v1 = (1, 1) plus 2 times v2 = (1, -1), drawn on the grid made by v1 and v2',
    viewBox: '0 0 300 210',
    body: () => {
      const p = plane(40, 170, 40);
      return (
        <>
          <defs>
            <clipPath id="clip-combo">
              <rect x={8} y={8} width={284} height={194} />
            </clipPath>
          </defs>
          <SkewGrid p={p} a={[1, 1]} b={[1, -1]} n={6} clipId="clip-combo" />
          <Arrow from={p(0, 0)} to={p(3, 3)} color={BLUE} dash="7 5" opacity={0.55} />
          <Arrow from={p(3, 3)} to={p(5, 1)} color={GREEN} dash="7 5" opacity={0.55} />
          <Arrow from={p(0, 0)} to={p(5, 1)} color={YELLOW} width={3} />
          <Arrow from={p(0, 0)} to={p(1, 1)} color={BLUE} width={3.2} />
          <Arrow from={p(0, 0)} to={p(1, -1)} color={GREEN} width={3.2} />
          <Text at={p(0.6, 1)} dx={-12} color={BLUE}>v₁</Text>
          <Text at={p(0.9, -0.5)} dx={14} dy={10} color={GREEN}>v₂</Text>
          <Text at={p(1.8, 2.3)} dx={-18} color={BLUE} style={caption}>3v₁</Text>
          <Text at={p(4.1, 2.4)} dx={16} color={GREEN} style={caption}>2v₂</Text>
          <Text at={p(3.6, 0.7)} dy={22} color={YELLOW}>w</Text>
          <Dot at={p(0, 0)} />
        </>
      );
    },
  },

  lineCases: {
    title: 'Three pictures of two linear equations in two unknowns: lines that cross once, parallel lines, and the same line drawn twice',
    viewBox: '0 0 330 150',
    body: () => (
      <>
        {/* one solution */}
        <line x1={12} y1={110} x2={98} y2={30} stroke={BLUE} strokeWidth={2.6} strokeLinecap="round" />
        <line x1={12} y1={40} x2={98} y2={104} stroke={GREEN} strokeWidth={2.6} strokeLinecap="round" />
        <circle cx={55.5} cy={72} r={5} fill={YELLOW} />
        <text x={55} y={138} {...caption}>one solution</text>
        {/* no solution */}
        <line x1={122} y1={100} x2={208} y2={40} stroke={BLUE} strokeWidth={2.6} strokeLinecap="round" />
        <line x1={122} y1={124} x2={208} y2={64} stroke={GREEN} strokeWidth={2.6} strokeLinecap="round" />
        <text x={165} y={138} {...caption}>no solution</text>
        {/* infinitely many */}
        <line x1={232} y1={110} x2={318} y2={30} stroke={GREEN} strokeWidth={7} strokeLinecap="round" opacity={0.55} />
        <line x1={232} y1={110} x2={318} y2={30} stroke={BLUE} strokeWidth={2.6} strokeLinecap="round" />
        <text x={275} y={138} {...caption}>infinitely many</text>
      </>
    ),
  },

  gridTransform: {
    title: 'The standard grid on the left; on the right the same grid after the matrix A with columns (2, 1) and (-1, 1): the columns of A are where e1 and e2 land',
    viewBox: '0 0 340 180',
    body: () => {
      const L = plane(78, 95, 22);
      const R = plane(258, 95, 22);
      return (
        <>
          <defs>
            <clipPath id="clip-gl">
              <rect x={8} y={12} width={140} height={160} rx={10} />
            </clipPath>
            <clipPath id="clip-gr">
              <rect x={190} y={12} width={140} height={160} rx={10} />
            </clipPath>
          </defs>
          <SkewGrid p={L} a={[1, 0]} b={[0, 1]} n={4} clipId="clip-gl" />
          <SkewGrid p={R} a={[2, 1]} b={[-1, 1]} n={4} clipId="clip-gr" />
          <path d={`M${L(0, 0)} L${L(1, 0)} L${L(1, 1)} L${L(0, 1)} Z`} fill={YELLOW} fillOpacity={0.3} />
          <path d={`M${R(0, 0)} L${R(2, 1)} L${R(1, 2)} L${R(-1, 1)} Z`} fill={YELLOW} fillOpacity={0.3} />
          <Arrow from={L(0, 0)} to={L(1, 0)} color={GREEN} width={3} />
          <Arrow from={L(0, 0)} to={L(0, 1)} color={BLUE} width={3} />
          <Arrow from={R(0, 0)} to={R(2, 1)} color={GREEN} width={3} />
          <Arrow from={R(0, 0)} to={R(-1, 1)} color={BLUE} width={3} />
          <Text at={L(1, 0)} dx={4} dy={18} color={GREEN}>e₁</Text>
          <Text at={L(0, 1)} dx={-14} dy={-2} color={BLUE}>e₂</Text>
          <Text at={R(2, 1)} dx={10} dy={-6} color={GREEN}>Ae₁</Text>
          <Text at={R(-1, 1)} dx={-14} dy={-6} color={BLUE}>Ae₂</Text>
          <Arrow from={[150, 95]} to={[186, 95]} width={2} />
          <text x={168} y={86} {...label}>A</text>
        </>
      );
    },
  },

  detArea: {
    title: 'The unit square and its image: the parallelogram spanned by the columns (3, 1) and (1, 2) of A, with area |det A| = 5',
    viewBox: '0 0 300 210',
    body: () => {
      const p = plane(40, 185, 40);
      return (
        <>
          <Axes o={p(0, 0)} x0={15} x1={290} y0={12} y1={200} />
          <path d={`M${p(0, 0)} L${p(3, 1)} L${p(4, 3)} L${p(1, 2)} Z`} fill={YELLOW} fillOpacity={0.3} stroke={YELLOW} strokeWidth={1.6} />
          <path d={`M${p(0, 0)} L${p(1, 0)} L${p(1, 1)} L${p(0, 1)} Z`} {...dashed} fill="currentColor" fillOpacity={0.12} />
          <Arrow from={p(0, 0)} to={p(3, 1)} color={GREEN} width={3} />
          <Arrow from={p(0, 0)} to={p(1, 2)} color={BLUE} width={3} />
          <Text at={p(0.5, 0.5)} dy={5} style={caption}>1</Text>
          <Text at={p(2, 1.5)} dy={5} style={{ ...caption, fontSize: 14 }}>area 5</Text>
          <Text at={p(3, 1)} dx={14} dy={14} color={GREEN}>Ae₁</Text>
          <Text at={p(1, 2)} dx={-16} dy={-4} color={BLUE}>Ae₂</Text>
        </>
      );
    },
  },

  inverseUndo: {
    title: 'A takes the unit square to a parallelogram; the inverse matrix takes the parallelogram back to the unit square',
    viewBox: '0 0 340 150',
    body: () => (
      <>
        <rect x={20} y={55} width={55} height={55} {...dashed} fill="currentColor" fillOpacity={0.12} />
        <path d="M140 110 L205 95 L230 45 L165 60 Z" fill={YELLOW} fillOpacity={0.3} stroke={YELLOW} strokeWidth={1.6} />
        <rect x={265} y={55} width={55} height={55} {...dashed} fill="currentColor" fillOpacity={0.12} />
        <path d="M80 60 Q108 30 136 58" {...thin} strokeWidth={2} />
        <polygon points="138,62 128,57 136,52" fill="currentColor" />
        <text x={108} y={34} {...label}>A</text>
        <path d="M232 60 Q248 30 262 58" {...thin} strokeWidth={2} stroke={GREEN} />
        <polygon points="264,62 254,57 262,52" fill={GREEN} />
        <text x={246} y={32} {...label} fill={GREEN}>A⁻¹</text>
        <text x={170} y={138} {...caption}>A⁻¹A = I: every point comes back</text>
      </>
    ),
  },

  independence: {
    title: 'Left: two vectors pointing in different directions are independent and span the plane. Right: one vector is twice the other, so they are dependent and span only a line',
    viewBox: '0 0 330 160',
    body: () => {
      const L = plane(40, 120, 30);
      const R = plane(200, 120, 30);
      return (
        <>
          <Arrow from={L(0, 0)} to={L(3, 1)} color={BLUE} width={3} />
          <Arrow from={L(0, 0)} to={L(1, 2.5)} color={GREEN} width={3} />
          <Text at={L(1.6, -1)} dy={-4} style={caption}>independent</Text>
          <line x1={R(-1, -0.5)[0]} y1={R(-1, -0.5)[1]} x2={R(4.2, 2.1)[0]} y2={R(4.2, 2.1)[1]} {...dashed} />
          <Arrow from={R(0, 0)} to={R(4, 2)} color={GREEN} width={6} opacity={0.5} />
          <Arrow from={R(0, 0)} to={R(2, 1)} color={BLUE} width={3} />
          <Text at={R(1.6, -1)} dy={-4} style={caption}>dependent</Text>
          <Text at={R(4, 2)} dx={8} dy={-8} color={GREEN} style={caption}>2v</Text>
          <Text at={R(2, 1)} dx={-4} dy={-10} color={BLUE} style={caption}>v</Text>
        </>
      );
    },
  },

  basisCoords: {
    title: 'The basis b1 = (2, 1), b2 = (1, 2) draws a slanted grid; the vector v = (4, 5) equals 1·b1 + 2·b2, so its coordinates in this basis are (1, 2)',
    viewBox: '0 0 300 220',
    body: () => {
      const p = plane(50, 195, 30);
      return (
        <>
          <defs>
            <clipPath id="clip-basis">
              <rect x={8} y={8} width={284} height={204} />
            </clipPath>
          </defs>
          <SkewGrid p={p} a={[2, 1]} b={[1, 2]} n={6} clipId="clip-basis" />
          <Arrow from={p(2, 1)} to={p(4, 5)} color={GREEN} dash="7 5" opacity={0.6} />
          <Arrow from={p(0, 0)} to={p(4, 5)} color={YELLOW} width={3} />
          <Arrow from={p(0, 0)} to={p(2, 1)} color={BLUE} width={3.2} />
          <Arrow from={p(0, 0)} to={p(1, 2)} color={GREEN} width={3.2} />
          <Text at={p(2, 1)} dx={12} dy={16} color={BLUE}>b₁</Text>
          <Text at={p(1, 2)} dx={-14} color={GREEN}>b₂</Text>
          <Text at={p(3.2, 3)} dx={20} color={GREEN} style={caption}>2b₂</Text>
          <Text at={p(4, 5)} dx={14} dy={4} color={YELLOW}>v</Text>
          <Dot at={p(0, 0)} />
        </>
      );
    },
  },

  eigen: {
    title: 'For A with rows (2, 1) and (1, 2): v = (1, 1) is stretched to Av = 3v along its own line, while w = (1, 0) is turned to Aw = (2, 1) off its line',
    viewBox: '0 0 300 210',
    body: () => {
      const p = plane(45, 180, 40);
      return (
        <>
          <Axes o={p(0, 0)} x0={15} x1={290} y0={12} y1={200} />
          <line x1={p(-0.5, -0.5)[0]} y1={p(-0.5, -0.5)[1]} x2={p(3.9, 3.9)[0]} y2={p(3.9, 3.9)[1]} {...dashed} />
          <Arrow from={p(0, 0)} to={p(3, 3)} color={BLUE} width={6} opacity={0.4} />
          <Arrow from={p(0, 0)} to={p(1, 1)} color={BLUE} width={3} />
          <Arrow from={p(0, 0)} to={p(2, 1)} color={RED} width={3} opacity={0.75} />
          <Arrow from={p(0, 0)} to={p(1, 0)} color={GREEN} width={3} />
          <Text at={p(1, 1)} dx={-14} dy={-2} color={BLUE}>v</Text>
          <Text at={p(3, 3)} dx={-30} color={BLUE} style={caption}>Av = 3v</Text>
          <Text at={p(1, 0)} dy={20} color={GREEN}>w</Text>
          <Text at={p(2, 1)} dx={22} dy={4} color={RED}>Aw</Text>
        </>
      );
    },
  },
};

export const DIAGRAM_TYPES = Object.keys(figures);

export function Diagram({ type, large = false }: { type: string; large?: boolean }) {
  const fig = figures[type];
  if (!fig) return null;
  return (
    <div className="flex justify-center rounded-2xl border-2 border-line bg-bg py-3 text-fg">
      <svg viewBox={fig.viewBox} role="img" aria-label={fig.title} className={`h-auto w-full ${large ? 'max-w-[400px]' : 'max-w-[260px] sm:max-w-[320px]'}`}>
        <title>{fig.title}</title>
        {fig.body()}
      </svg>
    </div>
  );
}
