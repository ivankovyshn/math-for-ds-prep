import type { QuestionTemplate } from '../../../types.ts';
import { r } from '../define.ts';
import { allDistinct, paren, shuffle } from '../gen.ts';
import { trigTex } from '../school/05-trig.practice.ts';
import { cx, mul } from './06-complex.practice.ts';

const RAD = Math.PI / 180;
const r9 = (x: number) => Math.round(x * 1e9) / 1e9 + 0;
export const cosd = (t: number) => r9(Math.cos(t * RAD));
export const sind = (t: number) => r9(Math.sin(t * RAD));

/** A number of the form (m/2)·1, (m/2)·√3 or (m/2)·√2 as TeX: 2\sqrt3, \tfrac{\sqrt3}{2}, -3. */
export function surd(v: number): string {
  for (const [root, tex] of [[1, ''], [Math.sqrt(3), '\\sqrt3'], [Math.SQRT2, '\\sqrt2']] as const) {
    const m = (v / root) * 2;
    if (Math.abs(m - Math.round(m)) > 1e-6) continue;
    const M = Math.round(m);
    if (M === 0) return '0';
    const sign = M < 0 ? '-' : '';
    const a = Math.abs(M);
    if (a % 2 === 0) {
      const k = a / 2;
      return `${sign}${tex ? `${k === 1 ? '' : k}${tex}` : k}`;
    }
    return `${sign}\\tfrac{${tex ? `${a === 1 ? '' : a}${tex}` : a}}{2}`;
  }
  throw new Error(`no exact form for ${v}`);
}
/** a + bi with surd parts, as TeX. */
export function cxs(a: number, b: number): string {
  const im = (v: number) => (Math.abs(v - 1) < 1e-9 ? 'i' : `${surd(v)}\\,i`);
  if (Math.abs(b) < 1e-9) return surd(a);
  if (Math.abs(a) < 1e-9) return b < 0 ? `-${im(-b)}` : im(b);
  return `${surd(a)} ${b < 0 ? '-' : '+'} ${im(Math.abs(b))}`;
}

/**
 * Points with "nice" arguments: radius factor k times (±1, ±√3), (±√3, ±1) or (±1, ±1).
 * Each gives the TeX of the real and imaginary parts and the exact angle.
 */
const NICE = [
  { re: '1', im: '\\sqrt3', x: 1, y: Math.sqrt(3), deg: 60 },
  { re: '\\sqrt3', im: '1', x: Math.sqrt(3), y: 1, deg: 30 },
  { re: '1', im: '1', x: 1, y: 1, deg: 45 },
];

/** The point e^{iθ} for θ a multiple of 90°, as TeX and as a direction. */
const AXIS = [
  { t: 90, where: 'straight up, along the positive imaginary axis' },
  { t: 180, where: 'to the left, along the negative real axis' },
  { t: 270, where: 'straight down, along the negative imaginary axis' },
  { t: 360, where: 'to the right, along the positive real axis (a full turn)' },
];

export const practice: QuestionTemplate[] = [
  {
    id: 'ml-07-1',
    difficulty: 1,
    keyConceptTag: "Euler's formula on the axes",
    correctOptionId: 'a',
    generate: (g) => {
      const R = g.int(2, 7);
      const A = g.pick(AXIS);
      const val = (t: number) => [R * cosd(t), R * sind(t)];
      const wrong = AXIS.filter((x) => x.t !== A.t);
      return {
        params: { R, t: A.t },
        promptText: r`Write $z = ${R}e^{i\cdot ${A.t}^\circ}$ in the form $a + bi$.`,
        options: [
          { id: 'a', label: `$${cx(...(val(A.t) as [number, number]))}$`, value: val(A.t) },
          ...wrong.map((x, i) => ({
            id: 'bcd'[i],
            label: `$${cx(...(val(x.t) as [number, number]))}$`,
            value: val(x.t),
            trapExplanation: r`That is the point at $${x.t === 360 ? 0 : x.t}^\circ$. An angle of $${A.t}^\circ$ points ${A.where}.`,
          })),
        ],
        stepByStepSolution: [
          r`Euler's formula: $re^{i\varphi} = r(\cos\varphi + i\sin\varphi)$.`,
          r`$\cos ${A.t}^\circ = ${cosd(A.t)}$ and $\sin ${A.t}^\circ = ${sind(A.t)}$: the direction is ${A.where}.`,
          r`$z = ${R}\,(${cx(cosd(A.t), sind(A.t))}) = ${cx(R * cosd(A.t), R * sind(A.t))}$.`,
        ],
      };
    },
  },
  {
    id: 'ml-07-2',
    difficulty: 1,
    keyConceptTag: 'Multiplying by i is a quarter turn',
    correctOptionId: 'a',
    generate: (g) => {
      const [a, b] = g.until(() => [g.nonzero(-6, 6), g.nonzero(-6, 6)], ([a, b]) => Math.abs(a) !== Math.abs(b));
      return {
        params: { a, b },
        promptText: r`Multiplying by $i$ turns a point $90^\circ$ counter-clockwise about 0. What is $i\,(${cx(a, b)})$?`,
        options: [
          { id: 'a', label: `$${cx(-b, a)}$`, value: [-b, a] },
          { id: 'b', label: `$${cx(b, -a)}$`, value: [b, -a], trapExplanation: r`That is a clockwise quarter turn, i.e. multiplying by $-i$. Expand: $i\,(${cx(a, b)}) = ${a}i + ${paren(b)}\,i^2$.` },
          { id: 'c', label: `$${cx(a, -b)}$`, value: [a, -b], trapExplanation: r`That is the conjugate: a mirror image in the real axis, not a rotation.` },
          { id: 'd', label: `$${cx(-a, -b)}$`, value: [-a, -b], trapExplanation: r`That is a half turn ($180^\circ$), i.e. multiplying by $i^2 = -1$.` },
        ],
        stepByStepSolution: [
          r`Expand: $i\,(${cx(a, b)}) = ${a}i + ${paren(b)}\,i^2$.`,
          r`$i^2 = -1$, so $${paren(b)}\,i^2 = ${-b}$ becomes the real part.`,
          r`$${cx(-b, a)}$: the point $(${a}, ${b})$ moved to $(${-b}, ${a})$, a quarter turn counter-clockwise.`,
        ],
      };
    },
  },
  {
    id: 'ml-07-3',
    difficulty: 2,
    keyConceptTag: 'Argument and quadrants',
    correctOptionId: 'a',
    generate: (g) => {
      const P = g.pick(NICE);
      const k = g.pick([1, 2]);
      const up = g.pick([true, false]); // 2nd quadrant (up) or 3rd quadrant (down); the real part is negative
      const theta = up ? 180 - P.deg : -(180 - P.deg);
      const atanDeg = up ? -P.deg : P.deg;
      const mirror = up ? P.deg : -P.deg;
      const kk = (s: string) => (k === 1 ? s : s === '1' ? '2' : `2${s}`);
      const label = `-${kk(P.re)} ${up ? '+' : '-'} ${kk(P.im) === '1' ? '' : kk(P.im)}i`;
      return {
        params: { re: -k * P.x, im: (up ? 1 : -1) * k * P.y },
        promptText: r`What is the argument of $z = ${label}$ (in degrees, between $-180^\circ$ and $180^\circ$)?`,
        options: [
          { id: 'a', label: r`$${theta}^\circ$`, value: theta },
          { id: 'b', label: r`$${atanDeg}^\circ$`, value: atanDeg, trapExplanation: r`$\arctan(b/a)$ gives $${atanDeg}^\circ$, which points into the wrong quadrant. $z$ has a negative real part, so the angle is shifted by $180^\circ$.` },
          { id: 'c', label: r`$${mirror}^\circ$`, value: mirror, trapExplanation: r`$${mirror}^\circ$ is the direction of $${kk(P.re)} ${up ? '+' : '-'} ${kk(P.im) === '1' ? '' : kk(P.im)}i$. The real part here is negative.` },
          { id: 'd', label: r`$${-theta}^\circ$`, value: -theta, trapExplanation: r`$${-theta}^\circ$ is the argument of the conjugate $\bar z$: the sign of the imaginary part decides the sign of the angle.` },
        ],
        stepByStepSolution: [
          r`$|z| = ${k * 2 === 2 && P.deg === 45 ? '\\sqrt2' : P.deg === 45 ? '2\\sqrt2' : `${2 * k}`}$; the real part is negative and the imaginary part is ${up ? 'positive' : 'negative'}.`,
          r`So $z$ lies in the ${up ? '2nd' : '3rd'} quadrant, at angle $${P.deg}^\circ$ from the negative real axis.`,
          r`$\varphi = ${theta}^\circ$.`,
        ],
      };
    },
  },
  {
    id: 'ml-07-4',
    difficulty: 2,
    keyConceptTag: 'From polar form to a + bi',
    correctOptionId: 'a',
    generate: (g) => {
      const R = g.pick([2, 4, 6]);
      const t = g.pick([120, 150, 210, 240, 300, 330]);
      const [c, s] = [cosd(t), sind(t)];
      const ref = [120, 240].includes(t) || [300].includes(t) ? 60 : 30;
      const quad = Math.floor(t / 90) + 1;
      const right = [R * c, R * s];
      const swapped = [Math.sign(c) * R * Math.abs(s), Math.sign(s) * R * Math.abs(c)];
      const firstQ = [R * Math.abs(c), R * Math.abs(s)];
      return {
        params: { R, t },
        promptText: r`Write $z = ${R}e^{i\cdot ${t}^\circ}$ in the form $a + bi$.`,
        options: [
          { id: 'a', label: `$${cxs(right[0], right[1])}$`, value: right },
          { id: 'b', label: `$${cxs(swapped[0], swapped[1])}$`, value: swapped, trapExplanation: r`Cosine and sine are swapped: the real part is $a = r\cos\varphi$, the imaginary part $b = r\sin\varphi$.` },
          { id: 'c', label: `$${cxs(firstQ[0], firstQ[1])}$`, value: firstQ, trapExplanation: r`That is the point at the reference angle $${ref}^\circ$, in the first quadrant. $${t}^\circ$ is in quadrant ${['I', 'II', 'III', 'IV'][quad - 1]}, so the signs change.` },
          { id: 'd', label: `$${cxs(c, s)}$`, value: [c, s], trapExplanation: r`That point has modulus 1. Both parts must still be multiplied by $r = ${R}$.` },
        ],
        stepByStepSolution: [
          r`$a = r\cos\varphi$ and $b = r\sin\varphi$.`,
          r`$${t}^\circ$ is in quadrant ${['I', 'II', 'III', 'IV'][quad - 1]}, $${ref}^\circ$ from the horizontal axis: $\cos ${t}^\circ = ${trigTex(c)}$, $\sin ${t}^\circ = ${trigTex(s)}$.`,
          r`$z = ${R}\cdot(${trigTex(c)}) + ${R}\cdot(${trigTex(s)})\,i = ${cxs(right[0], right[1])}$.`,
        ],
      };
    },
  },
  {
    id: 'ml-07-5',
    difficulty: 3,
    keyConceptTag: "De Moivre's theorem",
    correctOptionId: 'a',
    generate: (g) => {
      const { z, n } = g.until(
        () => ({ z: g.pick([[1, 1], [1, -1], [-1, 1], [-1, -1]]), n: g.pick([4, 6, 8, 10, 12]) }),
        ({ z, n }) => {
          let p = [1, 0];
          for (let i = 0; i < n; i++) p = mul(p, z);
          return allDistinct([p, p.map((v) => v * 2 ** (n / 2)), p.map((v) => -v), [-p[1], p[0]]]);
        },
      );
      let p = [1, 0];
      for (let i = 0; i < n; i++) p = mul(p, z);
      const arg = Math.atan2(z[1], z[0]) * (180 / Math.PI);
      const big = p.map((v) => v * 2 ** (n / 2));
      const rot = [-p[1], p[0]];
      return {
        params: { z, n },
        promptText: r`Compute $(${cx(z[0], z[1])})^{${n}}$.`,
        options: [
          { id: 'a', label: `$${cx(p[0], p[1])}$`, value: p },
          { id: 'b', label: `$${cx(big[0], big[1])}$`, value: big, trapExplanation: r`$2^{${n}}$ uses modulus 2, but $|${cx(z[0], z[1])}| = \sqrt2$. So the modulus of the power is $(\sqrt2)^{${n}} = ${2 ** (n / 2)}$.` },
          { id: 'c', label: `$${cx(-p[0], -p[1])}$`, value: p.map((v) => -v), trapExplanation: r`$${n}\cdot ${arg}^\circ = ${n * arg}^\circ$; reduce it modulo $360^\circ$ carefully — the sign is wrong here.` },
          { id: 'd', label: `$${cx(rot[0], rot[1])}$`, value: rot, trapExplanation: r`That is the answer turned by an extra $90^\circ$. The angle of the power is exactly $${n}\cdot ${arg}^\circ$.` },
        ],
        stepByStepSolution: [
          r`$${cx(z[0], z[1])} = \sqrt2\,e^{i\cdot${arg}^\circ}$.`,
          r`De Moivre: modulus $(\sqrt2)^{${n}} = ${2 ** (n / 2)}$, angle $${n}\cdot ${arg}^\circ = ${n * arg}^\circ$.`,
          r`Reducing the angle modulo $360^\circ$ gives $${cx(p[0], p[1])}$.`,
        ],
      };
    },
  },
  {
    id: 'ml-07-6',
    difficulty: 3,
    keyConceptTag: 'Complex roots',
    correctOptionId: 'a',
    generate: (g) => {
      const m = g.pick([1, 2, 3]);
      const k = g.int(0, 3);
      const coef = m === 2 ? '\\sqrt2' : m === 1 ? '\\tfrac{\\sqrt2}{2}' : '\\tfrac{3\\sqrt2}{2}';
      const [sx, sy] = [[1, 1], [-1, 1], [-1, -1], [1, -1]][k];
      const root = `${sx < 0 ? '-' : ''}${coef} ${sy < 0 ? '-' : '+'} ${coef}\\,i`;
      const angle = 45 + 90 * k;
      const fake = shuffle(g, [`${m === 1 ? '' : m}i`, `-${m}`, `${m}`]);
      const whyOf = (s: string) =>
        s.endsWith('i') ? r`$(${s})^4 = ${m ** 4}i^4 = ${m ** 4}$, not $-${m ** 4}$. Its argument $90^\circ$ times 4 is $360^\circ$.`
        : s.startsWith('-') ? r`An even power of a real number is non-negative: $(${s})^4 = ${m ** 4}$.`
        : r`$${s}^4 = ${m ** 4}$. No real number solves $z^4 = -${m ** 4}$.`;
      return {
        params: { m, k },
        promptText: r`Which number is a solution of $z^4 = -${m ** 4}$?`,
        options: [
          { id: 'a', label: `$${root}$` },
          ...fake.map((s, i) => ({ id: 'bcd'[i], label: `$${s}$`, trapExplanation: whyOf(s) })),
        ],
        stepByStepSolution: [
          r`$-${m ** 4} = ${m ** 4}e^{i\cdot180^\circ}$. Roots: modulus $\sqrt[4]{${m ** 4}} = ${m}$, arguments $45^\circ + j\cdot90^\circ$.`,
          r`For $j = ${k}$: $${m === 1 ? '' : m}e^{i\cdot${angle}^\circ} = ${root}$.`,
          r`Check: its square has argument $${2 * angle}^\circ$, i.e. it is $\pm ${m * m}i$, and $(\pm ${m * m}i)^2 = -${m ** 4}$. ✓`,
        ],
      };
    },
  },
];
