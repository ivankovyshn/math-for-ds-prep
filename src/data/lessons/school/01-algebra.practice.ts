import type { QuestionTemplate } from '../../../types.ts';
import { r } from '../define.ts';
import { allDistinct, frac, gcd, poly, sqrtTex } from '../gen.ts';

const lcm = (a: number, b: number) => (a * b) / gcd(a, b);
/** Rounded for comparing option values. */
const r6 = (x: number) => Math.round(x * 1e6) / 1e6;

export const practice: QuestionTemplate[] = [
  {
    id: 'sm-01-1',
    difficulty: 1,
    keyConceptTag: 'Adding fractions',
    correctOptionId: 'a',
    generate: (g) => {
      const { a, b, c, d } = g.until(
        () => {
          const b = g.int(2, 9);
          const d = g.int(2, 9);
          return { a: g.int(1, b - 1), b, c: g.int(1, d - 1), d };
        },
        ({ a, b, c, d }) => b !== d && allDistinct([a / b + c / d, (a + c) / (b + d), (a + c) / (b * d), (a * c) / (b * d)].map(r6)),
      );
      const L = lcm(b, d);
      return {
        params: { a, b, c, d },
        promptText: r`Compute $\frac{${a}}{${b}} + \frac{${c}}{${d}}$.`,
        options: [
          { id: 'a', label: `$${frac(a * d + c * b, b * d)}$`, value: a / b + c / d },
          { id: 'b', label: `$${frac(a + c, b + d)}$`, value: (a + c) / (b + d), trapExplanation: r`Tops and bottoms are not added separately. Rewrite both fractions over the common denominator ${L} first.` },
          { id: 'c', label: `$${frac(a + c, b * d)}$`, value: (a + c) / (b * d), trapExplanation: r`Over the denominator ${b * d} the tops must be scaled too: $\frac{${a}}{${b}} = \frac{${a * d}}{${b * d}}$.` },
          { id: 'd', label: `$${frac(a * c, b * d)}$`, value: (a * c) / (b * d), trapExplanation: r`That is the product of the two fractions, not their sum.` },
        ],
        stepByStepSolution: [
          r`Common denominator: ${L}. $\frac{${a}}{${b}} = \frac{${(a * L) / b}}{${L}}$ and $\frac{${c}}{${d}} = \frac{${(c * L) / d}}{${L}}$.`,
          r`Add the tops: $\frac{${(a * L) / b + (c * L) / d}}{${L}}$.`,
          r`Simplified: $${frac(a * d + c * b, b * d)}$.`,
        ],
      };
    },
  },
  {
    id: 'sm-01-2',
    difficulty: 1,
    keyConceptTag: 'Rules for powers',
    correctOptionId: 'a',
    generate: (g) => {
      const { m, n, k } = g.until(
        () => ({ m: g.int(2, 7), n: g.int(2, 7), k: g.int(1, 6) }),
        ({ m, n, k }) => m + n - k >= 1 && allDistinct([m + n - k, m * n - k, m + n + k, m - n + k]),
      );
      const e = m + n - k;
      return {
        params: { m, n, k },
        promptText: r`Simplify $\dfrac{x^{${m}}\cdot x^{${n}}}{x^{${k}}}$ for $x \ne 0$.`,
        options: [
          { id: 'a', label: `$x^{${e}}$`, value: e },
          { id: 'b', label: `$x^{${m * n - k}}$`, value: m * n - k, trapExplanation: r`In a product of powers the exponents add, they do not multiply: $x^{${m}}x^{${n}} = x^{${m + n}}$.` },
          { id: 'c', label: `$x^{${m + n + k}}$`, value: m + n + k, trapExplanation: r`Dividing by $x^{${k}}$ subtracts its exponent.` },
          { id: 'd', label: `$x^{${m - n + k}}$`, value: m - n + k, trapExplanation: r`The two factors on top both add: $${m} + ${n}$. Only the exponent below is subtracted.` },
        ],
        stepByStepSolution: [
          r`Top: $x^{${m}}\cdot x^{${n}} = x^{${m} + ${n}} = x^{${m + n}}$.`,
          r`Divide: $\frac{x^{${m + n}}}{x^{${k}}} = x^{${m + n} - ${k}}$.`,
          r`$= x^{${e}}$.`,
        ],
      };
    },
  },
  {
    id: 'sm-01-3',
    difficulty: 2,
    keyConceptTag: 'Dividing fractions',
    correctOptionId: 'a',
    generate: (g) => {
      const { a, b, c, d } = g.until(
        () => ({ a: g.int(1, 9), b: g.int(2, 9), c: g.int(1, 9), d: g.int(2, 9) }),
        ({ a, b, c, d }) => gcd(a, b) === 1 && gcd(c, d) === 1 && allDistinct([(a * d) / (b * c), (a * c) / (b * d), (b * c) / (a * d), (a + d) / (b + c)].map(r6)),
      );
      return {
        params: { a, b, c, d },
        promptText: r`Compute $\frac{${a}}{${b}} \div \frac{${c}}{${d}}$.`,
        options: [
          { id: 'a', label: `$${frac(a * d, b * c)}$`, value: (a * d) / (b * c) },
          { id: 'b', label: `$${frac(a * c, b * d)}$`, value: (a * c) / (b * d), trapExplanation: r`That multiplies the fractions. To divide, flip the second one first.` },
          { id: 'c', label: `$${frac(b * c, a * d)}$`, value: (b * c) / (a * d), trapExplanation: r`The first fraction was flipped instead of the second: this is $\frac{${c}}{${d}} \div \frac{${a}}{${b}}$.` },
          { id: 'd', label: `$${frac(a + d, b + c)}$`, value: (a + d) / (b + c), trapExplanation: r`Cross-<i>adding</i> has no meaning. Multiply by the flipped fraction $\frac{${d}}{${c}}$.` },
        ],
        stepByStepSolution: [
          r`Dividing by $\frac{${c}}{${d}}$ is multiplying by $\frac{${d}}{${c}}$.`,
          r`$\frac{${a}}{${b}}\cdot\frac{${d}}{${c}} = \frac{${a * d}}{${b * c}}$.`,
          r`Simplified: $${frac(a * d, b * c)}$.`,
        ],
      };
    },
  },
  {
    id: 'sm-01-4',
    difficulty: 2,
    keyConceptTag: 'Fractional and negative powers',
    correctOptionId: 'a',
    generate: (g) => {
      const { k, q, p, s } = g.until(
        () => {
          const [k, q] = g.pick([[2, 2], [3, 2], [4, 2], [5, 2], [6, 2], [7, 2], [2, 3], [3, 3], [4, 3], [5, 3], [2, 4], [3, 4]]);
          return { k, q, p: g.pick([1, 2, 3].filter((x) => x !== q && gcd(x, q) === 1)), s: g.pick([1, -1]) };
        },
        ({ k, q, p, s }) => {
          const v = s > 0 ? k ** p : 1 / k ** p;
          return allDistinct([v, (s * k ** q * p) / q, s > 0 ? 1 / k ** p : k ** p, s > 0 ? k * p : -(k ** p)].map(r6));
        },
      );
      const b = k ** q;
      const v = s > 0 ? k ** p : 1 / k ** p;
      const show = (x: number) => (Number.isInteger(x) ? `${x}` : frac(1, Math.round(1 / x)));
      const flip = s > 0 ? 1 / k ** p : k ** p;
      const third = s > 0 ? k * p : -(k ** p);
      return {
        params: { b, p, q, s },
        promptText: r`Compute $${b}^{${s < 0 ? '-' : ''}${p}/${q}}$.`,
        options: [
          { id: 'a', label: `$${show(v)}$`, value: v },
          { id: 'b', label: `$${frac(s * b * p, q)}$`, value: (s * b * p) / q, trapExplanation: r`A power is not a product: $${b}^{${s < 0 ? '-' : ''}${p}/${q}} \ne ${b}\cdot${s < 0 ? '(-' : ''}\frac{${p}}{${q}}${s < 0 ? ')' : ''}$. Take the ${q === 2 ? 'square' : q === 3 ? 'cube' : `${q}th`} root, then the power.` },
          {
            id: 'c',
            label: `$${show(flip)}$`,
            value: flip,
            trapExplanation: s > 0 ? r`That is the value for the exponent $-\frac{${p}}{${q}}$; here the exponent is positive.` : r`The minus sign in the exponent was dropped. $a^{-n} = \frac{1}{a^n}$.`,
          },
          {
            id: 'd',
            label: `$${third}$`,
            value: third,
            trapExplanation: s > 0 ? r`After the root ${k}, raise it to the power ${p}, do not multiply by ${p}.` : r`A negative exponent means "one over", not a negative number.`,
          },
        ],
        stepByStepSolution: [
          r`$\sqrt[${q}]{${b}} = ${k}$, because $${k}^{${q}} = ${b}$.`,
          r`Raise to the power ${p}: $${k}^{${p}} = ${k ** p}$.`,
          s > 0 ? r`So $${b}^{${p}/${q}} = ${k ** p}$.` : r`The minus sign means "one over": $${b}^{-${p}/${q}} = \frac{1}{${k ** p}}$.`,
        ],
      };
    },
  },
  {
    id: 'sm-01-5',
    difficulty: 3,
    keyConceptTag: 'Simplifying square roots',
    correctOptionId: 'a',
    generate: (g) => {
      const { k, a, b } = g.until(
        () => ({ k: g.pick([2, 3, 5, 6, 7]), a: g.int(1, 5), b: g.int(2, 6) }),
        ({ k, a, b }) => a < b && b * b * k <= 200,
      );
      const m = a * a * k;
      const n = b * b * k;
      const sk = Math.sqrt(k);
      const term = (c: number, rad: number) => `${c === 1 ? '' : c}\\sqrt{${rad}}`;
      return {
        params: { m, n },
        promptText: r`Simplify $\sqrt{${m}} + \sqrt{${n}}$.`,
        options: [
          { id: 'a', label: `$${term(a + b, k)}$`, value: (a + b) * sk },
          { id: 'b', label: `$${sqrtTex(m + n)}$`, value: Math.sqrt(m + n), trapExplanation: r`Roots of a sum do not combine: $\sqrt{${m}} + \sqrt{${n}} \ne \sqrt{${m + n}}$.` },
          { id: 'c', label: `$${term(a * b, k)}$`, value: a * b * sk, trapExplanation: r`The two terms are added, so their coefficients ${a} and ${b} add as well.` },
          { id: 'd', label: `$${term(a + b, 2 * k)}$`, value: (a + b) * Math.sqrt(2 * k), trapExplanation: r`Like $3x + 2x = 5x$, the common $\sqrt{${k}}$ stays as it is; it does not double.` },
        ],
        stepByStepSolution: [
          r`$${m} = ${a * a}\cdot${k}$, so $\sqrt{${m}} = ${term(a, k)}$${a === 1 ? ' already' : ''}.`,
          r`$${n} = ${b * b}\cdot${k}$, so $\sqrt{${n}} = ${term(b, k)}$.`,
          r`Both are multiples of $\sqrt{${k}}$: $${term(a, k)} + ${term(b, k)} = ${term(a + b, k)}$.`,
        ],
      };
    },
  },
  {
    id: 'sm-01-6',
    difficulty: 3,
    keyConceptTag: 'Factoring to simplify a fraction',
    correctOptionId: 'a',
    generate: (g) => {
      const k = g.int(2, 6);
      const a = g.int(1, 9);
      return {
        params: { k, a },
        promptText: r`Simplify $\dfrac{${k}x^2 - ${k * a * a}}{x - ${a}}$ for $x \ne ${a}$.`,
        options: [
          { id: 'a', label: `$${poly([k * a, k])}$`, value: [k * a, k] },
          { id: 'b', label: `$${poly([-k * a, k])}$`, value: [-k * a, k], trapExplanation: r`Check the sign: $x^2 - ${a * a} = (x - ${a})(x + ${a})$, and the factor that remains is $x + ${a}$.` },
          { id: 'c', label: `$${poly([a, 1])}$`, value: [a, 1], trapExplanation: r`The common factor ${k} does not cancel: it is only on top.` },
          { id: 'd', label: `$${poly([a, k])}$`, value: [a, k], trapExplanation: r`The factor ${k} multiplies the whole bracket: $${k}(x + ${a}) = ${poly([k * a, k])}$.` },
        ],
        stepByStepSolution: [
          r`Take out the common factor: $${k}x^2 - ${k * a * a} = ${k}(x^2 - ${a * a})$.`,
          r`Difference of squares: $x^2 - ${a * a} = (x - ${a})(x + ${a})$.`,
          r`Cancel $x - ${a}$: the result is $${k}(x + ${a}) = ${poly([k * a, k])}$.`,
        ],
      };
    },
  },
];
