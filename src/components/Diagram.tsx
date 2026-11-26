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

  vennOps: {
    title: 'Three Venn diagrams: the union of A and B, their intersection, and the difference A minus B, each shaded',
    viewBox: '0 0 345 140',
    body: () => {
      const panel = (x: number, name: string, shade: ReactNode) => (
        <g key={name}>
          <rect x={x + 4} y={8} width={104} height={100} rx={8} {...faint} opacity={0.5} />
          {shade}
          <circle cx={x + 42} cy={58} r={29} {...thin} strokeWidth={1.8} />
          <circle cx={x + 70} cy={58} r={29} {...thin} strokeWidth={1.8} />
          <text x={x + 28} y={34} {...label} fontSize={13}>A</text>
          <text x={x + 86} y={34} {...label} fontSize={13}>B</text>
          <text x={x + 56} y={130} {...caption} fontSize={13}>{name}</text>
        </g>
      );
      return (
        <>
          <defs>
            <clipPath id="venn-clip-a">
              <circle cx={159} cy={58} r={29} />
            </clipPath>
            <mask id="venn-mask-diff">
              <circle cx={276} cy={58} r={29} fill="white" />
              <circle cx={304} cy={58} r={29} fill="black" />
            </mask>
          </defs>
          {panel(0, 'A ∪ B', (
            <g opacity={0.4}>
              <circle cx={42} cy={58} r={29} fill={BLUE} />
              <circle cx={70} cy={58} r={29} fill={BLUE} />
            </g>
          ))}
          {panel(117, 'A ∩ B', <circle cx={187} cy={58} r={29} fill={BLUE} fillOpacity={0.4} clipPath="url(#venn-clip-a)" />)}
          {panel(234, 'A \\ B', <rect x={240} y={20} width={100} height={80} fill={BLUE} fillOpacity={0.4} mask="url(#venn-mask-diff)" />)}
        </>
      );
    },
  },

  mappingKinds: {
    title: 'Three functions drawn as arrows between two sets: injective but not surjective, surjective but not injective, and bijective',
    viewBox: '0 0 345 150',
    body: () => {
      const panel = (x: number, name: string, left: number[], right: number[], arrows: [number, number][], missed?: number) => (
        <g key={name}>
          <ellipse cx={x + 24} cy={62} rx={17} ry={46} {...thin} opacity={0.6} />
          <ellipse cx={x + 88} cy={62} rx={17} ry={46} {...thin} opacity={0.6} />
          {arrows.map(([a, b], i) => (
            <Arrow key={i} from={[x + 29, left[a]]} to={[x + 82, right[b]]} color={BLUE} width={2} />
          ))}
          {left.map((y, i) => <Dot key={`l${i}`} at={[x + 24, y]} />)}
          {right.map((y, i) => <Dot key={`r${i}`} at={[x + 88, y]} color={i === missed ? RED : 'currentColor'} />)}
          <text x={x + 24} y={124} {...label} fontSize={13}>X</text>
          <text x={x + 88} y={124} {...label} fontSize={13}>Y</text>
          <text x={x + 56} y={143} {...caption} fontSize={12}>{name}</text>
        </g>
      );
      return (
        <>
          {panel(0, 'injective only', [45, 80], [37, 62, 87], [[0, 0], [1, 1]], 2)}
          {panel(117, 'surjective only', [37, 62, 87], [45, 80], [[0, 0], [1, 0], [2, 1]])}
          {panel(234, 'bijective', [37, 62, 87], [37, 62, 87], [[0, 1], [1, 2], [2, 0]])}
        </>
      );
    },
  },

  dominoes: {
    title: 'A row of dominoes: the first one is pushed (base case) and each falling domino knocks over the next (inductive step)',
    viewBox: '0 0 340 150',
    body: () => {
      const tilt = [62, 38, 14, 0, 0, 0];
      return (
        <>
          <line x1={10} y1={110} x2={330} y2={110} {...thin} opacity={0.5} />
          {tilt.map((t, i) => {
            const x = 40 + i * 48;
            return (
              <g key={i} transform={`rotate(${t} ${x + 14} 110)`}>
                <rect x={x} y={50} width={14} height={60} rx={3} fill={i < 3 ? YELLOW : 'currentColor'} fillOpacity={i < 3 ? 0.55 : 0.18} stroke={i < 3 ? YELLOW : 'currentColor'} strokeWidth={1.5} />
              </g>
            );
          })}
          {tilt.map((_, i) => (
            <text key={i} x={47 + i * 48} y={128} {...label} fontSize={12}>{`P(${i + 1})`}</text>
          ))}
          <path d="M150 40 Q178 14 206 40" {...thin} strokeWidth={2} stroke={GREEN} />
          <polygon points="208,44 198,40 206,34" fill={GREEN} />
          <text x={178} y={16} {...caption} fill={GREEN} opacity={1}>P(n) ⇒ P(n+1)</text>
          <text x={47} y={146} {...caption} fontSize={11.5}>base case</text>
        </>
      );
    },
  },

  complexPlane: {
    title: 'The complex plane: z = a + bi is the point (a, b), at distance r = |z| from 0 and angle φ from the positive real axis; its conjugate is the mirror image below the real axis',
    viewBox: '0 0 300 235',
    body: () => {
      const p = plane(55, 125, 34);
      return (
        <>
          <Axes o={p(0, 0)} x0={15} x1={290} y0={10} y1={225} />
          <text x={284} y={118} {...caption}>Re</text>
          <text x={68} y={18} {...caption}>Im</text>
          <line x1={p(3, 2)[0]} y1={p(3, 2)[1]} x2={p(3, 0)[0]} y2={p(3, 0)[1]} {...dashed} />
          <line x1={p(3, 2)[0]} y1={p(3, 2)[1]} x2={p(0, 2)[0]} y2={p(0, 2)[1]} {...dashed} />
          <line x1={p(3, -2)[0]} y1={p(3, -2)[1]} x2={p(3, 0)[0]} y2={p(3, 0)[1]} {...dashed} />
          <Arrow from={p(0, 0)} to={p(3, 2)} color={BLUE} width={3} />
          <Arrow from={p(0, 0)} to={p(3, -2)} color={GREEN} width={2.2} opacity={0.7} />
          <path d={`M${p(1.1, 0)} A37 37 0 0 0 ${p(0.915, 0.61)}`} {...thin} stroke={YELLOW} strokeWidth={2} />
          <Text at={p(1.35, 0.32)} color={YELLOW}>φ</Text>
          <Text at={p(1.5, 1)} dx={-8} dy={-8} color={BLUE}>r</Text>
          <Text at={p(3, 2)} dx={50} dy={-2} color={BLUE}>z = a + bi</Text>
          <Text at={p(3, -2)} dx={50} dy={6} color={GREEN}>z̄ = a − bi</Text>
          <Text at={p(3, 0)} dx={8} dy={18}>a</Text>
          <Text at={p(0, 2)} dx={-12} dy={5}>b</Text>
          <Dot at={p(3, 2)} color={BLUE} />
        </>
      );
    },
  },

  rootsOfUnity: {
    title: 'The six solutions of z^6 = 1 lie on the unit circle at angles 0, 60, 120, 180, 240 and 300 degrees, forming a regular hexagon',
    viewBox: '0 0 300 220',
    body: () => {
      const c: Pt = [150, 110];
      const R = 82;
      const pts = [0, 1, 2, 3, 4, 5].map((k): Pt => [c[0] + R * Math.cos((k * Math.PI) / 3), c[1] - R * Math.sin((k * Math.PI) / 3)]);
      return (
        <>
          <Axes o={c} x0={30} x1={270} y0={12} y1={208} />
          <circle cx={c[0]} cy={c[1]} r={R} {...thin} opacity={0.6} />
          <polygon points={pts.map((q) => q.join(',')).join(' ')} fill={BLUE} fillOpacity={0.12} stroke={BLUE} strokeWidth={1.5} />
          <path d={`M${c[0] + 26} ${c[1]} A26 26 0 0 0 ${c[0] + 13} ${c[1] - 22.5}`} {...thin} stroke={YELLOW} strokeWidth={2} />
          <text x={c[0] + 32} y={c[1] - 12} {...caption} fill={YELLOW} opacity={1}>60°</text>
          {pts.map((q, k) => <Dot key={k} at={q} color={k === 0 ? GREEN : BLUE} />)}
          <Text at={pts[0]} dx={12} dy={-8} color={GREEN}>1</Text>
          <Text at={pts[1]} dx={10} dy={-6} color={BLUE}>ω</Text>
          <Text at={pts[2]} dx={-12} dy={-6} color={BLUE}>ω²</Text>
          <Text at={pts[3]} dx={-16} dy={-6} color={BLUE}>−1</Text>
        </>
      );
    },
  },

  tangent: {
    title: 'A curve with a point a on it: two secant lines through a and points further right, and the tangent line at a that the secants approach',
    viewBox: '0 0 300 210',
    body: () => {
      const p = plane(30, 190, 40);
      const f = (x: number) => 0.1 * x * x + 0.5;
      const a = 2.5;
      const curve = Array.from({ length: 61 }, (_, i) => p(0.2 + i * 0.105, f(0.2 + i * 0.105)).join(',')).join(' ');
      const line = (x0: number, x1: number, slope: number) => [p(x0, f(a) + slope * (x0 - a)), p(x1, f(a) + slope * (x1 - a))];
      const sec = (b: number) => line(0.6, b + 0.6, (f(b) - f(a)) / (b - a));
      const tan = line(0.4, 6.2, 0.2 * a);
      return (
        <>
          <Axes o={p(0, 0)} x0={15} x1={290} y0={10} y1={200} />
          <polyline points={curve} {...thin} strokeWidth={2.2} />
          {[5.5, 4].map((b, i) => (
            <g key={b}>
              <line x1={sec(b)[0][0]} y1={sec(b)[0][1]} x2={sec(b)[1][0]} y2={sec(b)[1][1]} stroke={YELLOW} strokeWidth={1.8} strokeDasharray="6 4" opacity={i ? 0.85 : 0.5} />
              <Dot at={p(b, f(b))} color={YELLOW} />
            </g>
          ))}
          <line x1={tan[0][0]} y1={tan[0][1]} x2={tan[1][0]} y2={tan[1][1]} stroke={BLUE} strokeWidth={2.8} />
          <Dot at={p(a, f(a))} color={GREEN} />
          <Text at={p(a, f(a))} dx={4} dy={22} color={GREEN}>a</Text>
          <Text at={p(5.5, f(5.5))} dx={-30} dy={-6} color={YELLOW} style={caption}>secant</Text>
          <Text at={tan[1]} dx={-22} dy={22} color={BLUE} style={caption}>tangent</Text>
          <Text at={p(6.2, f(6.2))} dx={-6} dy={-10}>f</Text>
        </>
      );
    },
  },

  taylor: {
    title: 'The graph of sin x with its Taylor polynomials T1(x) = x and T3(x) = x − x³/6 around 0; T3 stays close to sin x over a wider range',
    viewBox: '0 0 320 200',
    body: () => {
      const p = plane(160, 100, 36);
      const path = (f: (x: number) => number, lo: number, hi: number) =>
        Array.from({ length: 121 }, (_, i) => lo + ((hi - lo) * i) / 120)
          .map((x) => [x, f(x)] as const)
          .filter(([, y]) => Math.abs(y) < 2.6)
          .map(([x, y]) => p(x, y).join(','))
          .join(' ');
      return (
        <>
          <Axes o={p(0, 0)} x0={10} x1={310} y0={8} y1={192} />
          <polyline points={path(Math.sin, -4.1, 4.1)} {...thin} strokeWidth={2.4} />
          <polyline points={path((x) => x, -2.6, 2.6)} fill="none" stroke={YELLOW} strokeWidth={2} strokeDasharray="6 4" />
          <polyline points={path((x) => x - x ** 3 / 6, -4.1, 4.1)} fill="none" stroke={BLUE} strokeWidth={2.2} />
          <Text at={p(2.3, 2.3)} dx={18} dy={6} color={YELLOW} style={caption}>T₁</Text>
          <Text at={p(3.6, -0.9)} dx={-6} dy={22} color={BLUE} style={caption}>T₃</Text>
          <Text at={p(-2.9, -0.55)} dy={22} style={caption}>sin x</Text>
        </>
      );
    },
  },

  riemann: {
    title: 'An increasing curve over an interval split into five strips; each rectangle takes its height from the left end of its strip, so the rectangles stay under the curve',
    viewBox: '0 0 300 200',
    body: () => {
      const p = plane(30, 180, 42);
      const f = (x: number) => 0.11 * x * x + 0.5;
      const [a, b, n] = [0.5, 5.5, 5];
      const w = (b - a) / n;
      const curve = Array.from({ length: 61 }, (_, i) => p(0.2 + i * 0.095, f(0.2 + i * 0.095)).join(',')).join(' ');
      return (
        <>
          <Axes o={p(0, 0)} x0={12} x1={292} y0={8} y1={192} />
          {Array.from({ length: n }, (_, i) => {
            const x = a + i * w;
            const [x0, y0] = p(x, f(x));
            const [x1, y1] = p(x + w, 0);
            return <rect key={i} x={x0} y={y0} width={x1 - x0} height={y1 - y0} fill={BLUE} fillOpacity={0.22} stroke={BLUE} strokeWidth={1.4} />;
          })}
          <polyline points={curve} {...thin} strokeWidth={2.4} />
          <Text at={p(a, 0)} dy={16} style={caption}>a</Text>
          <Text at={p(b, 0)} dy={16} style={caption}>b</Text>
          <Text at={p(5.9, f(5.9))} dx={-4} dy={-10}>f</Text>
          <Text at={p(a + 2.5 * w, 0)} dy={16} color={BLUE} style={caption}>Δx</Text>
        </>
      );
    },
  },

  contours: {
    title: 'Level curves of f(x, y) = x² + 2y² are nested ellipses; at a point on one of them the gradient arrow points outward, perpendicular to the curve, and minus the gradient points inward',
    viewBox: '0 0 300 200',
    body: () => {
      const c: Pt = [150, 100];
      const u = 38;
      const P: Pt = [1.6, Math.sqrt((4 - 1.6 * 1.6) / 2)];
      const g: Pt = [2 * P[0], 4 * P[1]];
      const at = (x: number, y: number): Pt => [c[0] + u * x, c[1] - u * y];
      const k = 0.32;
      return (
        <>
          <Axes o={c} x0={10} x1={290} y0={8} y1={192} />
          {[1, 2, 4, 7].map((lvl) => (
            <ellipse key={lvl} cx={c[0]} cy={c[1]} rx={u * Math.sqrt(lvl)} ry={u * Math.sqrt(lvl / 2)} {...thin} opacity={lvl === 4 ? 0.85 : 0.4} />
          ))}
          <Arrow from={at(...P)} to={at(P[0] + k * g[0], P[1] + k * g[1])} color={GREEN} width={2.8} />
          <Arrow from={at(...P)} to={at(P[0] - k * g[0] * 0.6, P[1] - k * g[1] * 0.6)} color={YELLOW} width={2.4} dash="5 4" />
          <Dot at={at(...P)} />
          <Text at={at(P[0] + k * g[0], P[1] + k * g[1])} dx={18} dy={4} color={GREEN} style={caption}>∇f</Text>
          <Text at={at(P[0] - k * g[0] * 0.6, P[1] - k * g[1] * 0.6)} dx={16} dy={18} color={YELLOW} style={caption}>−∇f</Text>
          <Text at={at(0, 0)} dx={-16} dy={16} style={caption}>min</Text>
        </>
      );
    },
  },

  compGraph: {
    title: 'Computational graph of L = (wx + b)²: inputs w, x and b feed a node u = wx + b, which feeds L = u². Backward arrows carry 2u from L to u, then 2u·x to w and 2u·1 to b',
    viewBox: '0 0 330 180',
    body: () => {
      const node = (at: Pt, label: string, color = 'currentColor', rad = 17) => (
        <g>
          <circle cx={at[0]} cy={at[1]} r={rad} fill="none" stroke={color} strokeWidth={1.8} />
          <Text at={at} dy={5} color={color}>{label}</Text>
        </g>
      );
      const [W, X, B, U, L]: Pt[] = [[38, 38], [38, 92], [38, 146], [170, 92], [285, 92]];
      const edge = (a: Pt, b: Pt, ra = 17, rb = 22) => {
        const d = Math.hypot(b[0] - a[0], b[1] - a[1]);
        const ux = (b[0] - a[0]) / d;
        const uy = (b[1] - a[1]) / d;
        return <Arrow from={[a[0] + ux * ra, a[1] + uy * ra]} to={[b[0] - ux * rb, b[1] - uy * rb]} width={1.8} opacity={0.8} />;
      };
      return (
        <>
          {edge(W, U)}
          {edge(X, U)}
          {edge(B, U)}
          {edge(U, L, 22, 17)}
          {node(W, 'w', GREEN)}
          {node(X, 'x')}
          {node(B, 'b', GREEN)}
          {node(U, 'u', BLUE, 22)}
          {node(L, 'L', YELLOW)}
          <Text at={U} dy={-32} color={BLUE} style={caption}>u = wx + b</Text>
          <Text at={L} dy={-28} color={YELLOW} style={caption}>L = u²</Text>
          <Arrow from={[265, 118]} to={[192, 118]} color={RED} width={1.8} dash="5 4" />
          <Text at={[228, 118]} dy={16} color={RED} style={caption}>∂L/∂u = 2u</Text>
          <Arrow from={[150, 76]} to={[62, 40]} color={RED} width={1.8} dash="5 4" />
          <Text at={[106, 50]} dx={4} dy={-8} color={RED} style={caption}>· x</Text>
          <Arrow from={[150, 110]} to={[62, 146]} color={RED} width={1.8} dash="5 4" />
          <Text at={[106, 136]} dx={6} dy={14} color={RED} style={caption}>· 1</Text>
        </>
      );
    },
  },

  projection: {
    title: 'The vector b, its projection p onto the line through a, and the error e = b − p, which meets the line at a right angle',
    viewBox: '0 0 300 200',
    body: () => {
      const p = plane(40, 172, 40);
      const P: Pt = [2.8, 1.4];
      const B: Pt = [2, 3];
      const s = 0.22;
      const ua: Pt = [2 / Math.sqrt(5), 1 / Math.sqrt(5)];
      const ue: Pt = [-1 / Math.sqrt(5), 2 / Math.sqrt(5)];
      const corner = [p(P[0] + s * ua[0] * -1, P[1] + s * ua[1] * -1), p(P[0] - s * ua[0] + s * ue[0], P[1] - s * ua[1] + s * ue[1]), p(P[0] + s * ue[0], P[1] + s * ue[1])];
      return (
        <>
          <line x1={p(-0.6, -0.3)[0]} y1={p(-0.6, -0.3)[1]} x2={p(6.2, 3.1)[0]} y2={p(6.2, 3.1)[1]} {...dashed} />
          <Arrow from={p(0, 0)} to={p(...P)} color={BLUE} width={6} opacity={0.45} />
          <Arrow from={p(0, 0)} to={p(1.5, 0.75)} color={GREEN} width={2.6} />
          <Arrow from={p(0, 0)} to={p(...B)} color={YELLOW} width={2.8} />
          <line x1={p(...P)[0]} y1={p(...P)[1]} x2={p(...B)[0]} y2={p(...B)[1]} stroke={RED} strokeWidth={2.4} strokeDasharray="6 4" />
          <polyline points={corner.map((q) => q.join(',')).join(' ')} {...thin} strokeWidth={1.4} />
          <Text at={p(1.5, 0.75)} dx={6} dy={20} color={GREEN}>a</Text>
          <Text at={p(...B)} dx={-12} dy={-4} color={YELLOW}>b</Text>
          <Text at={p(...P)} dx={14} dy={18} color={BLUE}>p</Text>
          <Text at={p(2.4, 2.2)} dx={16} color={RED}>e</Text>
          <Dot at={p(0, 0)} />
        </>
      );
    },
  },

  spectral: {
    title: 'A symmetric matrix maps the unit circle to an ellipse whose axes point along its orthogonal eigenvectors q1 and q2, stretched by λ1 = 3 and λ2 = 1',
    viewBox: '0 0 300 220',
    body: () => {
      const c: Pt = [150, 110];
      const u = 30;
      const d = Math.SQRT1_2;
      return (
        <>
          <Axes o={c} x0={20} x1={280} y0={10} y1={210} />
          <circle cx={c[0]} cy={c[1]} r={u} {...dashed} />
          <ellipse cx={c[0]} cy={c[1]} rx={3 * u} ry={u} transform={`rotate(-45 ${c[0]} ${c[1]})`} fill={BLUE} fillOpacity={0.1} stroke={BLUE} strokeWidth={1.6} />
          <Arrow from={c} to={[c[0] + 3 * u * d, c[1] - 3 * u * d]} color={BLUE} width={3} />
          <Arrow from={c} to={[c[0] + u * d, c[1] + u * d]} color={GREEN} width={3} />
          <Text at={[c[0] + 3 * u * d, c[1] - 3 * u * d]} dx={26} dy={6} color={BLUE} style={caption}>λ₁q₁</Text>
          <Text at={[c[0] + u * d, c[1] + u * d]} dx={20} dy={14} color={GREEN} style={caption}>λ₂q₂</Text>
          <line x1={c[0] - u * d} y1={c[1] - u * d} x2={c[0] - 52} y2={c[1] - 44} {...thin} opacity={0.5} />
          <Text at={[c[0] - 58, c[1] - 50]} style={caption}>unit circle</Text>
        </>
      );
    },
  },

  svd: {
    title: 'The SVD: A maps the unit circle with orthonormal v1 and v2 to an ellipse with semi-axes σ1·u1 and σ2·u2',
    viewBox: '0 0 340 180',
    body: () => {
      const L: Pt = [70, 92];
      const R: Pt = [250, 92];
      const at = (o: Pt, len: number, deg: number): Pt => [o[0] + len * Math.cos((deg * Math.PI) / 180), o[1] - len * Math.sin((deg * Math.PI) / 180)];
      return (
        <>
          <circle cx={L[0]} cy={L[1]} r={42} {...thin} opacity={0.6} />
          <Arrow from={L} to={at(L, 42, 25)} color={BLUE} width={2.6} />
          <Arrow from={L} to={at(L, 42, 115)} color={GREEN} width={2.6} />
          <Text at={at(L, 42, 25)} dx={12} dy={-2} color={BLUE}>v₁</Text>
          <Text at={at(L, 42, 115)} dx={-10} dy={-6} color={GREEN}>v₂</Text>
          <Arrow from={[128, 92]} to={[180, 92]} width={2} />
          <Text at={[154, 92]} dy={-10}>A</Text>
          <ellipse cx={R[0]} cy={R[1]} rx={72} ry={26} transform={`rotate(-55 ${R[0]} ${R[1]})`} fill={BLUE} fillOpacity={0.1} stroke={BLUE} strokeWidth={1.6} />
          <Arrow from={R} to={at(R, 72, 55)} color={BLUE} width={2.8} />
          <Arrow from={R} to={at(R, 26, 145)} color={GREEN} width={2.8} />
          <Text at={at(R, 72, 55)} dx={22} dy={10} color={BLUE} style={caption}>σ₁u₁</Text>
          <Text at={at(R, 26, 145)} dx={-20} dy={-4} color={GREEN} style={caption}>σ₂u₂</Text>
        </>
      );
    },
  },

  pca: {
    title: 'A cloud of centred data points stretched along one direction: PC1 points along the spread, PC2 is perpendicular and short',
    viewBox: '0 0 300 200',
    body: () => {
      const c: Pt = [150, 100];
      const unit = 48;
      const u: Pt = [Math.cos(Math.PI / 6), Math.sin(Math.PI / 6)];
      const w: Pt = [-u[1], u[0]];
      const at = (t: number, s: number): Pt => [c[0] + unit * (t * u[0] + s * w[0]), c[1] - unit * (t * u[1] + s * w[1])];
      // An evenly filled ellipse (golden-angle spiral), long along PC1 and short along PC2.
      const pts = Array.from({ length: 36 }, (_, i) => {
        const rad = Math.sqrt((i + 0.5) / 36);
        const ang = i * 2.39996;
        return at(2.05 * rad * Math.cos(ang), 0.6 * rad * Math.sin(ang));
      });
      return (
        <>
          <Axes o={c} x0={15} x1={285} y0={10} y1={190} />
          {pts.map((q, i) => <circle key={i} cx={q[0]} cy={q[1]} r={3} fill="currentColor" opacity={0.45} />)}
          <Arrow from={c} to={at(2.2, 0)} color={BLUE} width={3.2} />
          <Arrow from={c} to={at(0, 0.75)} color={GREEN} width={3.2} />
          <Text at={at(2.2, 0)} dx={4} dy={-12} color={BLUE} style={caption}>PC1</Text>
          <Text at={at(0, 0.75)} dx={-18} dy={-4} color={GREEN} style={caption}>PC2</Text>
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
