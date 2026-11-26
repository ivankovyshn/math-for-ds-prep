import type { QuestionTemplate } from '../../../types.ts';
import { r } from '../define.ts';
import { allDistinct, frac, paren, shuffle } from '../gen.ts';

/** A real number that is an integer or a fraction with a small denominator, as TeX. */
const num = (x: number) => {
  for (const q of [1, 2, 5, 10, 13, 17, 25, 26])
    if (Math.abs(x * q - Math.round(x * q)) < 1e-9) return frac(Math.round(x * q), q);
  return `${x}`;
};
/** a + bi as TeX, with tidy signs: 3 - 2i, -i, 5, \tfrac12 + \tfrac52 i. */
export function cx(a: number, b: number) {
  const im = (v: number) => (v === 1 ? 'i' : v === -1 ? '-i' : `${num(v)}i`);
  if (b === 0) return num(a);
  if (a === 0) return im(b);
  return b < 0 ? `${num(a)} - ${im(-b)}` : `${num(a)} + ${im(b)}`;
}
export const mul = ([a, b]: number[], [c, d]: number[]) => [a * c - b * d, a * d + b * c];
/** Pythagorean triples for moduli. */
export const TRIPLES = [[3, 4, 5], [6, 8, 10], [5, 12, 13], [8, 6, 10], [12, 5, 13], [4, 3, 5]];

/**
 * Points with "nice" arguments: radius factor k times (±1, ±√3), (±√3, ±1) or (±1, ±1).
 * Each gives the TeX of the real and imaginary parts and the exact angle.
 */
const NICE = [
  { re: '1', im: '\\sqrt3', x: 1, y: Math.sqrt(3), deg: 60 },
  { re: '\\sqrt3', im: '1', x: Math.sqrt(3), y: 1, deg: 30 },
  { re: '1', im: '1', x: 1, y: 1, deg: 45 },
];

export const practice: QuestionTemplate[] = [
  {
    id: 'ml-06-1',
    difficulty: 1,
    keyConceptTag: 'Complex multiplication',
    correctOptionId: 'a',
    generate: (g) => {
      const { z, w } = g.until(
        () => ({ z: [g.int(-4, 5), g.nonzero(-4, 5)], w: [g.nonzero(-3, 4), g.nonzero(-3, 4)] }),
        ({ z: [a, b], w: [c, d] }) => allDistinct([mul([a, b], [c, d]), [a * c + b * d, a * d + b * c], [a * c, b * d], [a * c - b * d, -(a * d + b * c)]]),
      );
      const [a, b] = z;
      const [c, d] = w;
      const p = mul(z, w);
      const plusOne = [a * c + b * d, a * d + b * c];
      return {
        params: { z, w },
        promptText: r`Compute $(${cx(a, b)})(${cx(c, d)})$.`,
        options: [
          { id: 'a', label: `$${cx(p[0], p[1])}$`, value: p },
          { id: 'b', label: `$${cx(plusOne[0], plusOne[1])}$`, value: plusOne, trapExplanation: r`The term $${paren(b * d)}i^2$ was treated as $${b * d}$. Since $i^2 = -1$, it is $${-b * d}$.` },
          { id: 'c', label: `$${cx(a * c, b * d)}$`, value: [a * c, b * d], trapExplanation: r`Multiplying real parts and imaginary parts separately is not complex multiplication. Expand all four products.` },
          { id: 'd', label: `$${cx(p[0], -p[1])}$`, value: [p[0], -p[1]], trapExplanation: r`The $i$ terms are $${a * d}i + ${paren(b * c)}i = ${cx(0, a * d + b * c)}$. A sign was lost.` },
        ],
        stepByStepSolution: [
          r`Expand: $${paren(a)}\cdot${paren(c)} + ${paren(a)}\cdot${paren(d)}i + ${paren(b)}\cdot${paren(c)}i + ${paren(b)}\cdot${paren(d)}i^2$.`,
          r`$${paren(b * d)}i^2 = ${-b * d}$.`,
          r`Real part $${a * c} - ${paren(b * d)} = ${p[0]}$, imaginary part $${a * d} + ${paren(b * c)} = ${p[1]}$: $${cx(p[0], p[1])}$.`,
        ],
      };
    },
  },
  {
    id: 'ml-06-2',
    difficulty: 1,
    keyConceptTag: 'Modulus',
    correctOptionId: 'a',
    generate: (g) => {
      const [p, q, m] = g.pick(TRIPLES);
      const [a, b] = [p * g.pick([-1, 1]), q * g.pick([-1, 1])];
      const signed = a + b;
      const wrong = [p + q, signed, m * m].filter((v, i, all) => v !== m && all.indexOf(v) === i);
      const extra = wrong.length < 3 ? [m + 1] : [];
      const values = [...wrong, ...extra].slice(0, 3);
      const why = (v: number) =>
        v === p + q ? r`$${p} + ${q}$ adds the absolute values. The modulus is a distance: $\sqrt{${p}^2 + ${q}^2}$.`
        : v === m * m ? r`$${m * m} = |z|^2 = z\bar z$. Take the square root.`
        : v < 0 ? r`A modulus is a length and is never negative.`
        : v === signed ? r`$${a} + ${paren(b)} = ${signed}$ adds the parts with their signs. The modulus squares them first.`
        : r`$\sqrt{${m * m}} = ${m}$ exactly; check the square root.`;
      return {
        params: { z: [a, b] },
        promptText: r`What is $|${cx(a, b)}|$?`,
        options: [
          { id: 'a', label: `$${m}$`, value: m },
          ...values.map((v, i) => ({ id: 'bcd'[i], label: `$${v}$`, value: v, trapExplanation: why(v) })),
        ],
        stepByStepSolution: [
          r`$|a + bi| = \sqrt{a^2 + b^2}$.`,
          r`$\sqrt{${p * p} + ${q * q}} = \sqrt{${m * m}}$.`,
          r`$= ${m}$.`,
        ],
      };
    },
  },
  {
    id: 'ml-06-3',
    difficulty: 2,
    keyConceptTag: 'Complex division',
    correctOptionId: 'a',
    generate: (g) => {
      const { z, w } = g.until(
        () => ({ z: [g.nonzero(-4, 5), g.nonzero(-4, 5)], w: g.pick([[1, -1], [1, 1], [1, 2], [2, -1], [1, -2], [2, 1], [3, 1], [1, 3]]) }),
        ({ z: [a, b], w: [c, d] }) => {
          const n = c * c + d * d;
          const q = [(a * c + b * d) / n, (b * c - a * d) / n];
          return allDistinct([q, [a / c, b / d], [a * c + b * d, b * c - a * d], [q[1], q[0]]]);
        },
      );
      const [a, b] = z;
      const [c, d] = w;
      const n = c * c + d * d;
      const top = [a * c + b * d, b * c - a * d];
      const q = [top[0] / n, top[1] / n];
      return {
        params: { z, w },
        promptText: r`Compute $\dfrac{${cx(a, b)}}{${cx(c, d)}}$.`,
        options: [
          { id: 'a', label: `$${cx(q[0], q[1])}$`, value: q },
          { id: 'b', label: `$${cx(a / c, b / d)}$`, value: [a / c, b / d], trapExplanation: r`Dividing real by real and imaginary by imaginary is not complex division. Multiply by the conjugate $${cx(c, -d)}$.` },
          { id: 'c', label: `$${cx(top[0], top[1])}$`, value: top, trapExplanation: r`That is the numerator after multiplying by $${cx(c, -d)}$; the denominator $${c * c + d * d}$ still has to be divided out.` },
          { id: 'd', label: `$${cx(q[1], q[0])}$`, value: [q[1], q[0]], trapExplanation: r`Real and imaginary parts are swapped. The numerator is $${cx(top[0], top[1])}$, so the real part is $${num(q[0])}$.` },
        ],
        stepByStepSolution: [
          r`Multiply top and bottom by the conjugate $${cx(c, -d)}$: denominator $(${cx(c, d)})(${cx(c, -d)}) = ${n}$.`,
          r`Numerator: $(${cx(a, b)})(${cx(c, -d)}) = ${cx(top[0], top[1])}$.`,
          r`$\dfrac{${cx(top[0], top[1])}}{${n}} = ${cx(q[0], q[1])}$.`,
        ],
      };
    },
  },
  {
    id: 'ml-06-4',
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
    id: 'ml-06-5',
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
    id: 'ml-06-6',
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
