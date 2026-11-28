import type { QuestionTemplate } from '../../../types.ts';
import { r } from '../define.ts';
import { allDistinct, frac, paren, poly } from '../gen.ts';

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
    id: 'ml-06-7',
    difficulty: 2,
    keyConceptTag: 'Powers of i',
    correctOptionId: 'a',
    generate: (g) => {
      const n = g.int(10, 99);
      const k = n % 4;
      const LAB = ['1', 'i', '-1', '-i'];
      const VAL = [[1, 0], [0, 1], [-1, 0], [0, -1]];
      const wrong = [0, 1, 2, 3].filter((j) => j !== k);
      return {
        params: { n },
        promptText: r`Compute $i^{${n}}$.`,
        options: [
          { id: 'a', label: `$${LAB[k]}$`, value: VAL[k] },
          ...wrong.map((j, i) => ({
            id: 'bcd'[i],
            label: `$${LAB[j]}$`,
            value: VAL[j],
            trapExplanation: j === 1 && k === 3
              ? r`$i^3 = i^2\cdot i = -i$, not $i$: the remainder of ${n} divided by 4 is ${k}.`
              : r`$${LAB[j]}$ is $i^{${j}}$, for exponents that leave remainder ${j} after division by 4. ${n} leaves remainder ${k}.`,
          })),
        ],
        stepByStepSolution: [
          r`Powers of $i$ repeat every 4 steps, so only the remainder of the exponent divided by 4 matters.`,
          r`$${n} = 4\cdot ${(n - k) / 4} + ${k}$, so $i^{${n}} = (i^4)^{${(n - k) / 4}}\cdot i^{${k}} = i^{${k}}$.`,
          r`$i^{${k}} = ${LAB[k]}$.`,
        ],
      };
    },
  },
  {
    id: 'ml-06-8',
    difficulty: 3,
    keyConceptTag: 'Complex roots of a quadratic',
    correctOptionId: 'a',
    generate: (g) => {
      const p = g.nonzero(-4, 4);
      const q = g.int(1, 4);
      const c = p * p + q * q;
      const pm = (re: number, im: number) => `${re} \\pm ${im === 1 ? '' : im}i`;
      return {
        params: { b: -2 * p, c },
        promptText: r`Solve $${poly([c, -2 * p, 1], 'z')} = 0$.`,
        options: [
          { id: 'a', label: `$z = ${pm(p, q)}$`, value: [p, q] },
          { id: 'b', label: `$z = ${pm(-p, q)}$`, value: [-p, q], trapExplanation: r`The real part is $-\frac{b}{2a} = -\frac{${-2 * p}}{2} = ${p}$: the sign of $b$ has to be flipped.` },
          { id: 'c', label: `$z = ${pm(p, 2 * q)}$`, value: [p, 2 * q], trapExplanation: r`$\sqrt{D} = ${2 * q}i$ must still be divided by $2a = 2$, like the $-b$ part.` },
          { id: 'd', label: 'No solutions: the discriminant is negative', trapExplanation: r`No <i>real</i> solutions. Among complex numbers $\sqrt{${-4 * q * q}} = ${2 * q}i$ exists, so there are two roots.` },
        ],
        stepByStepSolution: [
          r`$D = ${paren(-2 * p)}^2 - 4\cdot ${c} = ${4 * p * p} - ${4 * c} = ${-4 * q * q}$.`,
          r`$\sqrt{${-4 * q * q}} = ${2 * q}i$, because $(${2 * q}i)^2 = ${-4 * q * q}$.`,
          r`$z = \frac{${2 * p} \pm ${2 * q}i}{2} = ${pm(p, q)}$: a conjugate pair.`,
        ],
      };
    },
  },
  {
    id: 'ml-06-9',
    difficulty: 3,
    keyConceptTag: 'Conjugate pairs of roots',
    correctOptionId: 'a',
    generate: (g) => {
      const p = g.nonzero(-4, 4);
      const q = g.nonzero(-4, 4);
      const right = [p * p + q * q, -2 * p, 1];
      const sign = [p * p + q * q, 2 * p, 1];
      const minus = [p * p - q * q, -2 * p, 1];
      const half = [p * p + q * q, -p, 1];
      const P = (cs: number[]) => `$${poly(cs, 'z')}$`;
      return {
        params: { p, q },
        promptText: r`A quadratic $z^2 + bz + c$ with real coefficients $b$ and $c$ has the root $z = ${cx(p, q)}$. Which quadratic is it?`,
        options: [
          { id: 'a', label: P(right), value: right },
          { id: 'b', label: P(sign), value: sign, trapExplanation: r`$(z - z_1)(z - z_2) = z^2 - (z_1 + z_2)z + z_1z_2$: the sum of the roots, $${2 * p}$, enters with a minus.` },
          { id: 'c', label: P(minus), value: minus, trapExplanation: r`$(${cx(p, q)})(${cx(p, -q)}) = ${p * p} - (${cx(0, q)})^2 = ${p * p} + ${q * q}$: $i^2 = -1$ turns the minus into a plus.` },
          { id: 'd', label: P(half), value: half, trapExplanation: r`The two roots $${cx(p, q)}$ and $${cx(p, -q)}$ add up to $${2 * p}$, not $${p}$.` },
        ],
        stepByStepSolution: [
          r`Real coefficients: the conjugate $${cx(p, -q)}$ is the other root.`,
          r`Sum of the roots: $${2 * p}$. Product: $(${cx(p, q)})(${cx(p, -q)}) = ${p * p} + ${q * q} = ${p * p + q * q}$.`,
          r`$z^2 - (\text{sum})\,z + \text{product} = ${poly(right, 'z')}$.`,
        ],
      };
    },
  },
];
