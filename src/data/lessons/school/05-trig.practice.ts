import type { QuestionTemplate } from '../../../types.ts';
import { r } from '../define.ts';
import { allDistinct, frac, gcd, PYTHAGOREAN } from '../gen.ts';

const RAD = Math.PI / 180;
const r6 = (x: number) => Math.round(x * 1e6) / 1e6;
export const FN = ['sin', 'cos'] as const;
/** "\sin" or "\cos" as TeX. */
export const fnT = (fnId: number) => '\\' + FN[fnId];
/** sin (fnId 0) or cos (fnId 1) of an angle in degrees, with float noise removed. */
export const trig = (fnId: number, deg: number) => r6(fnId === 0 ? Math.sin(deg * RAD) : Math.cos(deg * RAD)) + 0;

/** (num/den)·π as TeX: piFrac(2, 3) -> "\tfrac{2\pi}{3}". */
export function piFrac(num: number, den: number): string {
  if (num === 0) return '0';
  const d = gcd(num, den);
  const [p, q] = [Math.abs(num / d), den / d];
  const top = p === 1 ? '\\pi' : `${p}\\pi`;
  return `${num < 0 ? '-' : ''}${q === 1 ? top : `\\tfrac{${top}}{${q}}`}`;
}
/** An angle in degrees as a multiple of π. */
export const piTex = (deg: number) => piFrac(deg, 180);

const SPECIAL: [number, string][] = [
  [0, '0'],
  [0.5, '\\tfrac{1}{2}'],
  [Math.SQRT2 / 2, '\\tfrac{\\sqrt{2}}{2}'],
  [Math.sqrt(3) / 2, '\\tfrac{\\sqrt{3}}{2}'],
  [1, '1'],
];
/** An exact value of sine or cosine as TeX. */
export function trigTex(v: number): string {
  const hit = SPECIAL.find(([x]) => Math.abs(Math.abs(v) - x) < 1e-6);
  if (!hit) throw new Error(`no exact form for ${v}`);
  return v < -1e-9 ? `-${hit[1]}` : hit[1];
}
/** Which standard function value equals w (w ≥ 0), preferring the other function at the same angle. */
export function whose(w: number, fnId: number, deg: number): string {
  const cands: [number, number][] = [[1 - fnId, deg], ...[0, 30, 45, 60, 90].flatMap((a) => [[0, a], [1, a]] as [number, number][])];
  const [f, a] = cands.find(([f, a]) => Math.abs(trig(f, a) - w) < 1e-6)!;
  return `\\${FN[f]} ${a}^\\circ`;
}
const QUAD = ['I', 'II', 'III', 'IV'];
export const quadrantOf = (deg: number) => Math.floor((((deg % 360) + 360) % 360) / 90) + 1;

export const practice: QuestionTemplate[] = [
  {
    id: 'sm-05-1',
    difficulty: 1,
    keyConceptTag: 'Degrees to radians',
    correctOptionId: 'a',
    generate: (g) => {
      const deg = g.until(() => g.pick([30, 45, 60, 120, 135, 150, 210, 225, 240, 270, 300, 315, 330]), (d) => allDistinct([d / 180, 180 / d, d, d / 180 / Math.PI].map(r6)));
      return {
        params: { deg },
        promptText: r`What is $${deg}^\circ$ in radians?`,
        options: [
          { id: 'a', label: `$${piTex(deg)}$`, value: deg * RAD },
          { id: 'b', label: `$${piFrac(180, deg)}$`, value: (180 / deg) * Math.PI, trapExplanation: r`Upside down: multiply by $\frac{\pi}{180}$, so the degrees go on top: $\frac{${deg}}{180}\pi$.` },
          { id: 'c', label: `$${deg}\\pi$`, value: deg * Math.PI, trapExplanation: r`$\pi$ stands for $180^\circ$, so the degrees must also be divided by 180.` },
          { id: 'd', label: `$${frac(deg, 180)}$`, value: deg / 180, trapExplanation: r`$\frac{${deg}}{180}$ is the fraction of a half turn; a half turn is $\pi$ radians, so multiply by $\pi$.` },
        ],
        stepByStepSolution: [r`Radians $=$ degrees $\cdot\frac{\pi}{180}$.`, r`$${deg}\cdot\frac{\pi}{180} = \frac{${deg}}{180}\pi$.`, r`Simplify: $${piTex(deg)}$.`],
      };
    },
  },
  {
    id: 'sm-05-2',
    difficulty: 1,
    keyConceptTag: 'The standard values',
    correctOptionId: 'a',
    hint: r`Picture the point at this angle on the unit circle: $\cos$ is its horizontal coordinate, $\sin$ its vertical one. The three special values are $\frac12$, $\frac{\sqrt2}{2}$ and $\frac{\sqrt3}{2}$; a steeper angle has the larger height.`,
    generate: (g) => {
      const fnId = g.int(0, 1);
      const deg = g.pick([30, 45, 60]);
      const v = trig(fnId, deg);
      const order = [trig(1 - fnId, deg), Math.SQRT2 / 2, 0.5, Math.sqrt(3) / 2, 1, 0].map(r6);
      const wrong = [...new Set(order)].filter((w) => Math.abs(w - v) > 1e-6).slice(0, 3);
      const fn = FN[fnId];
      return {
        params: { fnId, deg },
        promptText: r`What is $${fnT(fnId)} ${deg}^\circ$?`,
        options: [
          { id: 'a', label: `$${trigTex(v)}$`, value: v },
          ...wrong.map((w, i) => ({ id: 'bcd'[i], label: `$${trigTex(w)}$`, value: w, trapExplanation: r`$${trigTex(w)}$ is $${whose(w, fnId, deg)}$, not $${fnT(fnId)} ${deg}^\circ$.` })),
        ],
        stepByStepSolution: [
          r`On the unit circle the point at $${deg}^\circ$ is $(\cos ${deg}^\circ, \sin ${deg}^\circ) = (${trigTex(trig(1, deg))}, ${trigTex(trig(0, deg))})$.`,
          r`$${fnT(fnId)}$ is its ${fnId === 0 ? 'vertical' : 'horizontal'} coordinate.`,
          r`$${fnT(fnId)} ${deg}^\circ = ${trigTex(v)}$.`,
        ],
      };
    },
  },
  {
    id: 'sm-05-3',
    difficulty: 2,
    keyConceptTag: 'Reference angles and quadrant signs',
    correctOptionId: 'a',
    generate: (g) => {
      const fnId = g.int(0, 1);
      const deg = g.pick([120, 135, 150, 210, 225, 240, 300, 315, 330]);
      const v = trig(fnId, deg);
      const ref = Math.min(deg % 180, 180 - (deg % 180));
      const Q = quadrantOf(deg);
      const sgn = Math.sign(v);
      const u = trig(1 - fnId, ref);
      const pool = [-v, sgn * u, -sgn * u, sgn * 0.5, -sgn * 0.5, sgn * Math.sqrt(3) / 2, -sgn * Math.sqrt(3) / 2].map(r6);
      const wrong = [...new Set(pool)].filter((w) => Math.abs(w - v) > 1e-6).slice(0, 3);
      const fn = FN[fnId];
      const why = (w: number) =>
        Math.abs(w + v) < 1e-6
          ? r`Right size, wrong sign: $${deg}^\circ$ is in quadrant ${QUAD[Q - 1]}, where $${fnT(fnId)}$ is ${sgn < 0 ? 'negative' : 'positive'}.`
          : r`The reference angle of $${deg}^\circ$ is $${ref}^\circ$, and $${fnT(fnId)} ${ref}^\circ = ${trigTex(Math.abs(v))}$; then attach the sign of quadrant ${QUAD[Q - 1]}.`;
      return {
        params: { fnId, deg },
        promptText: r`What is $${fnT(fnId)} ${deg}^\circ$?`,
        options: [{ id: 'a', label: `$${trigTex(v)}$`, value: v }, ...wrong.map((w, i) => ({ id: 'bcd'[i], label: `$${trigTex(w)}$`, value: w, trapExplanation: why(w) }))],
        stepByStepSolution: [
          r`$${deg}^\circ$ lies in quadrant ${QUAD[Q - 1]}; its reference angle (distance to the $x$-axis) is $${ref}^\circ$.`,
          r`$${fnT(fnId)} ${ref}^\circ = ${trigTex(Math.abs(v))}$, and in quadrant ${QUAD[Q - 1]} $${fnT(fnId)}$ is ${sgn < 0 ? 'negative' : 'positive'}.`,
          r`$${fnT(fnId)} ${deg}^\circ = ${trigTex(v)}$.`,
        ],
      };
    },
  },
  {
    id: 'sm-05-4',
    difficulty: 2,
    keyConceptTag: 'sin² + cos² = 1',
    correctOptionId: 'a',
    generate: (g) => {
      const { a, b, c, Q } = g.until(
        () => {
          const [p, q, c] = g.pick(PYTHAGOREAN);
          const swap = g.int(0, 1) === 1;
          return { a: swap ? q : p, b: swap ? p : q, c, Q: g.int(1, 4) };
        },
        () => true,
      );
      const ss = Q <= 2 ? 1 : -1;
      const cs = Q === 1 || Q === 4 ? 1 : -1;
      const sn = ss * a;
      const cv = (cs * b) / c;
      return {
        params: { sn, c, Q },
        promptText: r`$\sin\theta = ${frac(sn, c)}$ and $\theta$ lies in quadrant ${QUAD[Q - 1]}. What is $\cos\theta$?`,
        options: [
          { id: 'a', label: `$${frac(cs * b, c)}$`, value: cv },
          { id: 'b', label: `$${frac(-cs * b, c)}$`, value: -cv, trapExplanation: r`The size is right, but in quadrant ${QUAD[Q - 1]} cosine is ${cs < 0 ? 'negative' : 'positive'}.` },
          { id: 'c', label: `$${frac(cs * a, b)}$`, value: (cs * a) / b, trapExplanation: r`$\frac{${a}}{${b}}$ is the size of $\tan\theta = \frac{\sin\theta}{\cos\theta}$, not of $\cos\theta$.` },
          { id: 'd', label: `$${frac(cs * (c - a), c)}$`, value: (cs * (c - a)) / c, trapExplanation: r`The identity is about squares: $\cos^2\theta = 1 - \sin^2\theta$, not $\cos\theta = 1 - \sin\theta$.` },
        ],
        stepByStepSolution: [
          r`$\cos^2\theta = 1 - \sin^2\theta = 1 - \frac{${a * a}}{${c * c}} = \frac{${b * b}}{${c * c}}$.`,
          r`So $\cos\theta = \pm\frac{${b}}{${c}}$.`,
          r`In quadrant ${QUAD[Q - 1]} cosine is ${cs < 0 ? 'negative' : 'positive'}: $\cos\theta = ${frac(cs * b, c)}$.`,
        ],
      };
    },
  },
  {
    id: 'sm-05-5',
    difficulty: 3,
    keyConceptTag: 'The angle of a point',
    correctOptionId: 'a',
    generate: (g) => {
      const deg = g.pick([120, 135, 150, 210, 225, 240, 300, 315, 330]);
      const k = g.int(1, 3);
      const ref = Math.min(deg % 180, 180 - (deg % 180));
      const sx = Math.sign(trig(1, deg));
      const sy = Math.sign(trig(0, deg));
      // Coordinates proportional to (cos, sin): (√3, 1) for 30°, (1, √3) for 60°, (1, 1) for 45°.
      const [ax, ay] = ref === 30 ? [Math.sqrt(3), 1] : ref === 60 ? [1, Math.sqrt(3)] : [1, 1];
      const coord = (s: number, isRoot: boolean) => `${s < 0 ? '-' : ''}${isRoot ? `${k === 1 ? '' : k}\\sqrt{3}` : k}`;
      const x = sx * k * ax;
      const y = sy * k * ay;
      const at = Math.round(Math.atan(y / x) / RAD);
      const cands: [number, string][] = [
        [at, r`$\arctan\frac{y}{x} = ${at}^\circ$, but $\arctan$ only returns angles between $-90^\circ$ and $90^\circ$. The point has $x ${sx < 0 ? '<' : '>'} 0$, ${sy < 0 ? 'y < 0' : 'y > 0'}: quadrant ${QUAD[quadrantOf(deg) - 1]}.`],
        [(deg + 180) % 360, r`That is the angle of the opposite point $(${coord(-sx, ref === 30)}, ${coord(-sy, ref === 60)})$.`],
        [360 - deg, r`That is the angle of the mirror image $(${coord(sx, ref === 30)}, ${coord(-sy, ref === 60)})$ below or above the $x$-axis.`],
        [ref, r`$${ref}^\circ$ is only the reference angle; the point is in quadrant ${QUAD[quadrantOf(deg) - 1]}.`],
        [(540 - deg) % 360, r`That is the angle of the mirror image $(${coord(-sx, ref === 30)}, ${coord(sy, ref === 60)})$ on the other side of the $y$-axis.`],
        [(deg + 90) % 360, r`That is a quarter turn too far: check the signs of $x$ and $y$.`],
      ];
      const wrong = cands.filter(([d], i) => d !== deg && cands.findIndex(([e]) => e === d) === i).slice(0, 3);
      return {
        params: { x, y },
        promptText: r`The point $(${coord(sx, ref === 30)}, ${coord(sy, ref === 60)})$ is at angle $\theta$ from the positive $x$-axis, with $0^\circ \le \theta < 360^\circ$. What is $\theta$?`,
        options: [{ id: 'a', label: `$${deg}^\\circ$`, value: deg }, ...wrong.map(([d, t], i) => ({ id: 'bcd'[i], label: `$${d}^\\circ$`, value: d, trapExplanation: t }))],
        stepByStepSolution: [
          r`$x ${sx < 0 ? '<' : '>'} 0$ and $y ${sy < 0 ? '<' : '>'} 0$: the point is in quadrant ${QUAD[quadrantOf(deg) - 1]}.`,
          r`$\tan\theta = \frac yx$ has size $${ref === 45 ? '1' : ref === 30 ? '\\tfrac{1}{\\sqrt3}' : '\\sqrt3'}$, so the reference angle is $${ref}^\circ$.`,
          r`In quadrant ${QUAD[quadrantOf(deg) - 1]} that gives $\theta = ${deg}^\circ$.`,
        ],
      };
    },
  },
  {
    id: 'sm-05-6',
    difficulty: 3,
    keyConceptTag: 'Two solutions per turn',
    correctOptionId: 'a',
    generate: (g) => {
      const { fnId, ref, sgn } = g.until(() => ({ fnId: g.int(0, 1), ref: g.pick([30, 45, 60]), sgn: g.pick([1, -1]) }), () => true);
      const v = sgn * trig(fnId, ref);
      const sols = (f: number, s: number) => (f === 0 ? (s > 0 ? [ref, 180 - ref] : [180 + ref, 360 - ref]) : s > 0 ? [ref, 360 - ref] : [180 - ref, 180 + ref]);
      // The angles where the other function takes the same value.
      const refOther = 90 - ref;
      const solsOther = fnId === 0 ? (sgn > 0 ? [refOther, 360 - refOther] : [180 - refOther, 180 + refOther]) : sgn > 0 ? [refOther, 180 - refOther] : [180 + refOther, 360 - refOther];
      const correct = sols(fnId, sgn);
      const cands: [number[], string][] = [
        [[correct[0]], r`That is one solution. In every full turn $${fnT(fnId)}$ takes the value $${trigTex(v)}$ twice.`],
        [sols(fnId, -sgn), r`These solve $${fnT(fnId)} x = ${trigTex(-v)}$: the sign is the other way round.`],
        [solsOther, r`These solve $${fnT(1 - fnId)} x = ${trigTex(v)}$: sine and cosine were mixed up.`],
      ];
      const lab = (ds: number[]) => (ds.length === 1 ? `$x = ${piTex(ds[0])}$ only` : `$x = ${piTex(ds[0])}$ or $x = ${piTex(ds[1])}$`);
      const vals = (ds: number[]) => ds.map((d) => r6(d * RAD));
      const fn = FN[fnId];
      return {
        params: { fnId, v },
        promptText: r`Solve $${fnT(fnId)} x = ${trigTex(v)}$ for $0 \le x < 2\pi$.`,
        options: [{ id: 'a', label: lab(correct), value: vals(correct) }, ...cands.map(([ds, t], i) => ({ id: 'bcd'[i], label: lab(ds), value: vals(ds), trapExplanation: t }))],
        stepByStepSolution: [
          r`From the table, $${fnT(fnId)} ${ref}^\circ = ${trigTex(Math.abs(v))}$: the reference angle is $${ref}^\circ$.`,
          r`$${fnT(fnId)}$ is ${sgn > 0 ? 'positive' : 'negative'} in quadrants ${fnId === 0 ? (sgn > 0 ? 'I and II' : 'III and IV') : sgn > 0 ? 'I and IV' : 'II and III'}: $x = ${correct[0]}^\circ$ and $x = ${correct[1]}^\circ$.`,
          r`In radians: $x = ${piTex(correct[0])}$ or $x = ${piTex(correct[1])}$.`,
        ],
      };
    },
  },
];
