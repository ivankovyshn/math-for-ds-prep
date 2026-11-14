import type { ReactNode } from 'react';

/**
 * Geometry figures, keyed by Question.svgDiagramType.
 * All figures share one style: outline in the text colour, the region the
 * question asks about filled with the accent colour.
 */

const stroke = { stroke: 'currentColor', strokeWidth: 2.2, fill: 'none', strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const };
const thin = { ...stroke, strokeWidth: 1.4 };
const dashed = { ...thin, strokeDasharray: '5 5', opacity: 0.6 };
const shade = { fill: 'var(--c-accent)', fillOpacity: 0.38, stroke: 'var(--c-accent)', strokeWidth: 2 };
const label = { fill: 'currentColor', fontSize: 15, fontStyle: 'italic' as const, fontFamily: 'KaTeX_Math, "Times New Roman", serif', textAnchor: 'middle' as const };
const num = { ...label, fontStyle: 'normal' as const, fontFamily: 'KaTeX_Main, "Times New Roman", serif' };

const Dot = ({ x, y }: { x: number; y: number }) => <circle cx={x} cy={y} r={3.2} fill="currentColor" />;

const figures: Record<string, { title: string; viewBox: string; body: ReactNode }> = {
  cylinder: {
    title: 'A cylinder with radius r and height h',
    viewBox: '0 0 240 210',
    body: (
      <>
        <path d="M50 45 V165 A70 18 0 0 0 190 165 V45" {...stroke} />
        <ellipse cx={120} cy={45} rx={70} ry={18} {...stroke} />
        <path d="M50 165 A70 18 0 0 1 190 165" {...dashed} />
        <path d="M50 120 A70 18 0 0 0 190 120 V165 A70 18 0 0 1 50 165 Z" fill="var(--c-accent)" fillOpacity={0.22} />
        <line x1={120} y1={45} x2={190} y2={45} {...thin} />
        <Dot x={120} y={45} />
        <text x={155} y={39} {...label}>r</text>
        <line x1={210} y1={45} x2={210} y2={165} {...thin} />
        <line x1={204} y1={45} x2={216} y2={45} {...thin} />
        <line x1={204} y1={165} x2={216} y2={165} {...thin} />
        <text x={225} y={110} {...label}>h</text>
      </>
    ),
  },

  circleInSquare: {
    title: 'A circle inscribed in a square; the four corners outside the circle are shaded',
    viewBox: '0 0 220 200',
    body: (
      <>
        <path
          fillRule="evenodd"
          d="M30 20 H190 V180 H30 Z M30 100 a80 80 0 1 0 160 0 a80 80 0 1 0 -160 0 Z"
          fill="var(--c-accent)"
          fillOpacity={0.38}
        />
        <rect x={30} y={20} width={160} height={160} {...stroke} />
        <circle cx={110} cy={100} r={80} {...stroke} />
      </>
    ),
  },

  triangleArcs: {
    title: 'An equilateral triangle with side 2 and three arcs of radius 1 centred at the vertices; the region between the arcs is shaded',
    viewBox: '0 0 240 215',
    body: (
      <>
        <path d="M120 190 A100 100 0 0 0 70 103.4 A100 100 0 0 0 170 103.4 A100 100 0 0 0 120 190 Z" {...shade} />
        <path d="M20 190 L220 190 L120 16.8 Z" {...stroke} />
        <Dot x={20} y={190} /><Dot x={220} y={190} /><Dot x={120} y={16.8} />
        <Dot x={120} y={190} /><Dot x={70} y={103.4} /><Dot x={170} y={103.4} />
        <text x={70} y={207} {...num}>1</text>
        <text x={170} y={207} {...num}>1</text>
        <text x={36} y={150} {...num}>1</text>
        <text x={86} y={62} {...num}>1</text>
        <text x={204} y={150} {...num}>1</text>
        <text x={154} y={62} {...num}>1</text>
      </>
    ),
  },

  sphereInCylinder: {
    title: 'A sphere that exactly fits inside a cylinder',
    viewBox: '0 0 240 210',
    body: (
      <>
        <circle cx={120} cy={105} r={62} fill="var(--c-accent)" fillOpacity={0.3} stroke="var(--c-accent)" strokeWidth={2} />
        <path d="M58 105 A62 14 0 0 0 182 105" stroke="var(--c-accent)" strokeWidth={1.4} fill="none" />
        <path d="M58 105 A62 14 0 0 1 182 105" stroke="var(--c-accent)" strokeWidth={1.4} fill="none" strokeDasharray="5 5" opacity={0.7} />
        <path d="M58 43 V167 A62 14 0 0 0 182 167 V43" {...stroke} />
        <ellipse cx={120} cy={43} rx={62} ry={14} {...stroke} />
        <path d="M58 167 A62 14 0 0 1 182 167" {...dashed} />
        <line x1={120} y1={105} x2={182} y2={105} {...thin} />
        <Dot x={120} y={105} />
        <text x={151} y={99} {...label}>r</text>
      </>
    ),
  },

  hexagonInCircle: {
    title: 'A regular hexagon inscribed in a circle of radius 1',
    viewBox: '0 0 240 200',
    body: (
      <>
        <path d="M200 100 L160 30.7 L80 30.7 L40 100 L80 169.3 L160 169.3 Z" {...shade} />
        <circle cx={120} cy={100} r={80} {...stroke} />
        <line x1={120} y1={100} x2={200} y2={100} {...thin} />
        <line x1={120} y1={100} x2={160} y2={30.7} {...dashed} />
        <Dot x={120} y={100} />
        <text x={160} y={117} {...num}>1</text>
      </>
    ),
  },

  lensInSquare: {
    title: 'A square of side 2 with two quarter-circles of radius 2 centred at opposite corners; their overlap is shaded',
    viewBox: '0 0 240 205',
    body: (
      <>
        <path d="M200 180 A160 160 0 0 0 40 20 A160 160 0 0 0 200 180 Z" {...shade} />
        <rect x={40} y={20} width={160} height={160} {...stroke} />
        <Dot x={40} y={180} /><Dot x={200} y={20} />
        <text x={120} y={198} {...num}>2</text>
        <text x={26} y={105} {...num}>2</text>
      </>
    ),
  },

  segment: {
    title: 'A circle of radius 6 with a chord that subtends 60 degrees at the centre; the segment between chord and arc is shaded',
    viewBox: '0 0 240 205',
    body: (
      <>
        <path d="M77.5 31.4 A85 85 0 0 1 162.5 31.4 Z" {...shade} />
        <circle cx={120} cy={105} r={85} {...stroke} />
        <path d="M77.5 31.4 L120 105 L162.5 31.4" {...thin} />
        <path d="M109 86 A22 22 0 0 1 131 86" {...thin} />
        <Dot x={120} y={105} />
        <text x={121} y={70} {...num} fontSize={13}>60°</text>
        <text x={82} y={74} {...num}>6</text>
        <text x={158} y={74} {...num}>6</text>
      </>
    ),
  },

  coneHalf: {
    title: 'A cone pointing downwards, filled with water up to half of its height',
    viewBox: '0 0 240 210',
    body: (
      <>
        <path d="M82.5 112 L120 188 L157.5 112 A37.5 8 0 0 0 82.5 112 Z" fill="var(--c-accent)" fillOpacity={0.38} />
        <ellipse cx={120} cy={112} rx={37.5} ry={8} fill="var(--c-accent)" fillOpacity={0.25} stroke="var(--c-accent)" strokeWidth={1.6} />
        <path d="M45 36 L120 188 L195 36" {...stroke} />
        <ellipse cx={120} cy={36} rx={75} ry={15} {...stroke} />
        <line x1={215} y1={36} x2={215} y2={188} {...thin} />
        <line x1={209} y1={36} x2={221} y2={36} {...thin} />
        <line x1={209} y1={188} x2={221} y2={188} {...thin} />
        <line x1={209} y1={112} x2={221} y2={112} {...thin} />
        <text x={229} y={79} {...label} fontSize={13}>½h</text>
        <text x={229} y={155} {...label} fontSize={13}>½h</text>
      </>
    ),
  },

  gridPaths: {
    title: 'A grid 4 squares wide and 3 squares high, with A at the bottom left and B at the top right; one example path is highlighted',
    viewBox: '0 0 240 190',
    body: (
      <>
        {[0, 1, 2, 3, 4].map((i) => (
          <line key={`v${i}`} x1={40 + i * 40} y1={30} x2={40 + i * 40} y2={150} {...thin} opacity={0.55} />
        ))}
        {[0, 1, 2, 3].map((j) => (
          <line key={`h${j}`} x1={40} y1={30 + j * 40} x2={200} y2={30 + j * 40} {...thin} opacity={0.55} />
        ))}
        <path d="M40 150 H120 V110 H160 V30 H200" stroke="var(--c-accent)" strokeWidth={4} fill="none" strokeLinejoin="round" strokeLinecap="round" />
        <Dot x={40} y={150} /><Dot x={200} y={30} />
        <text x={26} y={166} {...label}>A</text>
        <text x={214} y={24} {...label}>B</text>
      </>
    ),
  },
};

export const DIAGRAM_TYPES = Object.keys(figures);

export function Diagram({ type }: { type: string }) {
  const fig = figures[type];
  if (!fig) return null;
  return (
    <div className="flex justify-center rounded-2xl border-2 border-line bg-bg py-3 text-fg">
      <svg viewBox={fig.viewBox} role="img" aria-label={fig.title} className="h-auto w-full max-w-[230px] sm:max-w-[270px]">
        <title>{fig.title}</title>
        {fig.body}
      </svg>
    </div>
  );
}
