import type { QuestionTemplate } from '../../../types.ts';
import { r } from '../define.ts';
import { allDistinct, frac, paren } from '../gen.ts';
import { TRIPLES, cx, mul } from './06-complex.practice.ts';

/** Extra practice (Practice 2): gentler questions on the same ideas, with new numbers every time. */
export const extra: QuestionTemplate[] = [
  {
    id: 'ml-06-x1',
    difficulty: 1,
    keyConceptTag: 'Complex addition',
    correctOptionId: 'a',
    generate: (g) => {
      const { z, w } = g.until(
        () => ({ z: [g.int(-5, 6), g.nonzero(-5, 6)], w: [g.int(-5, 6), g.nonzero(-5, 6)] }),
        ({ z: [a, b], w: [c, d] }) => allDistinct([[a + c, b + d], [a + c, b - d], mul([a, b], [c, d]), [a * c, b * d]]),
      );
      const [a, b] = z;
      const [c, d] = w;
      const p = mul(z, w);
      return {
        params: { z, w },
        promptText: r`Compute $(${cx(a, b)}) + (${cx(c, d)})$.`,
        options: [
          { id: 'a', label: `$${cx(a + c, b + d)}$`, value: [a + c, b + d] },
          { id: 'b', label: `$${cx(a + c, b - d)}$`, value: [a + c, b - d], trapExplanation: r`The imaginary parts are $${b}$ and $${d}$; their sum is $${b + d}$.` },
          { id: 'c', label: `$${cx(p[0], p[1])}$`, value: p, trapExplanation: r`That is the <i>product</i> of the two numbers. Addition works part by part.` },
          { id: 'd', label: `$${cx(a * c, b * d)}$`, value: [a * c, b * d], trapExplanation: r`Multiplying real parts and imaginary parts separately is neither addition nor multiplication.` },
        ],
        stepByStepSolution: [
          r`Add real parts and imaginary parts separately.`,
          r`Real: $${a} + ${paren(c)} = ${a + c}$. Imaginary: $${b} + ${paren(d)} = ${b + d}$.`,
          r`The sum is $${cx(a + c, b + d)}$ — just like adding vectors $(${a}, ${b}) + (${c}, ${d})$.`,
        ],
      };
    },
  },
  {
    id: 'ml-06-x2',
    difficulty: 1,
    keyConceptTag: 'Complex multiplication',
    correctOptionId: 'a',
    generate: (g) => {
      const { a, b } = g.until(
        () => ({ a: g.nonzero(-4, 4), b: g.nonzero(-4, 4) }),
        ({ a, b }) => allDistinct([[a * a - b * b, 2 * a * b], [a * a + b * b, 2 * a * b], [a * a - b * b, 0], [a * a, b * b]]),
      );
      const sq = [a * a - b * b, 2 * a * b];
      return {
        params: { z: [a, b] },
        promptText: r`Compute $(${cx(a, b)})^2$.`,
        options: [
          { id: 'a', label: `$${cx(sq[0], sq[1])}$`, value: sq },
          { id: 'b', label: `$${cx(a * a + b * b, 2 * a * b)}$`, value: [a * a + b * b, 2 * a * b], trapExplanation: r`$(${cx(0, b)})^2 = ${b * b}i^2 = ${-b * b}$, not $+${b * b}$: $i^2 = -1$.` },
          { id: 'c', label: `$${cx(a * a - b * b, 0)}$`, value: [a * a - b * b, 0], trapExplanation: r`$(x + y)^2 \ne x^2 + y^2$: the middle term $2\cdot${paren(a)}\cdot${paren(b)}i$ was dropped.` },
          { id: 'd', label: `$${cx(a * a, b * b)}$`, value: [a * a, b * b], trapExplanation: r`Squaring each part separately is not squaring the number. Expand $(a + bi)(a + bi)$.` },
        ],
        stepByStepSolution: [
          r`$(a + bi)^2 = a^2 + 2abi + b^2 i^2$.`,
          r`$= ${a * a} + ${paren(2 * a * b)}i + ${b * b}\cdot(-1)$.`,
          r`$= ${cx(sq[0], sq[1])}$.`,
        ],
      };
    },
  },
  {
    id: 'ml-06-x3',
    difficulty: 1,
    keyConceptTag: 'Conjugate',
    correctOptionId: 'a',
    generate: (g) => {
      const { a, b } = g.until(() => ({ a: g.nonzero(-7, 7), b: g.nonzero(-7, 7) }), ({ a, b }) => Math.abs(a) !== Math.abs(b));
      return {
        params: { z: [a, b] },
        promptText: r`What is the complex conjugate of $z = ${cx(a, b)}$?`,
        options: [
          { id: 'a', label: `$${cx(a, -b)}$`, value: [a, -b] },
          { id: 'b', label: `$${cx(-a, b)}$`, value: [-a, b], trapExplanation: r`Conjugation keeps the real part and flips only the sign of the imaginary part.` },
          { id: 'c', label: `$${cx(-a, -b)}$`, value: [-a, -b], trapExplanation: r`That is $-z$. Only the imaginary part changes sign; the real part ${a} stays.` },
          { id: 'd', label: `$${cx(b, a)}$`, value: [b, a], trapExplanation: r`Conjugation does not swap the real and imaginary parts; it reflects $z$ in the real axis.` },
        ],
        stepByStepSolution: [
          r`$\overline{a + bi} = a - bi$.`,
          r`Here $a = ${a}$, $b = ${b}$.`,
          r`$\bar z = ${cx(a, -b)}$: the mirror image of $z$ in the real axis.`,
        ],
      };
    },
  },
  {
    id: 'ml-06-x4',
    difficulty: 2,
    keyConceptTag: 'Modulus',
    correctOptionId: 'a',
    generate: (g) => {
      const [p, q, m] = g.pick(TRIPLES);
      const [a, b] = [p * g.pick([-1, 1]), q * g.pick([-1, 1])];
      return {
        params: { z: [a, b] },
        promptText: r`What is $|${cx(a, b)}|$?`,
        options: [
          { id: 'a', label: `$${m}$`, value: m },
          { id: 'b', label: `$${p + q}$`, value: p + q, trapExplanation: r`The modulus is a length, $\sqrt{a^2 + b^2}$, not the sum of the parts.` },
          { id: 'c', label: `$${m * m}$`, value: m * m, trapExplanation: r`$${p}^2 + ${q}^2 = ${m * m}$ is $|z|^2$; take the square root.` },
          { id: 'd', label: `$\\sqrt{${p + q}}$`, value: Math.sqrt(p + q), trapExplanation: r`Square the parts before adding: $${p * p} + ${q * q}$, not $${p} + ${q}$.` },
        ],
        stepByStepSolution: [
          r`$|a + bi| = \sqrt{a^2 + b^2}$ — the distance from 0 in the plane.`,
          r`$\sqrt{${p * p} + ${q * q}} = \sqrt{${m * m}}$.`,
          r`$= ${m}$.`,
        ],
      };
    },
  },
  {
    id: 'ml-06-x5',
    difficulty: 2,
    keyConceptTag: 'Conjugate and modulus',
    correctOptionId: 'a',
    generate: (g) => {
      const { a, b } = g.until(
        () => ({ a: g.nonzero(-5, 6), b: g.nonzero(-5, 6) }),
        ({ a, b }) => allDistinct([a * a + b * b, a * a - b * b, a + b, (a + b) ** 2]),
      );
      return {
        params: { z: [a, b] },
        promptText: r`For $z = ${cx(a, b)}$, compute $z \cdot \bar z$.`,
        options: [
          { id: 'a', label: `$${a * a + b * b}$`, value: a * a + b * b },
          { id: 'b', label: `$${a * a - b * b}$`, value: a * a - b * b, trapExplanation: r`$(${cx(0, b)})(${cx(0, -b)}) = ${-b * b}i^2 = +${b * b}$. The $i^2$ turns the minus into a plus.` },
          { id: 'c', label: `$${a + b}$`, value: a + b, trapExplanation: r`That adds the parts; the product gives $a^2 + b^2$.` },
          { id: 'd', label: `$${(a + b) ** 2}$`, value: (a + b) ** 2, trapExplanation: r`$(${a} + ${paren(b)})^2$ is not $z\bar z$. The product equals $a^2 + b^2$.` },
        ],
        stepByStepSolution: [
          r`$\bar z = ${cx(a, -b)}$.`,
          r`$(${cx(a, b)})(${cx(a, -b)}) = ${a * a} - ${paren(b * b)}i^2 = ${a * a} + ${b * b}$.`,
          r`$z \bar z = ${a * a + b * b} = |z|^2$ — always a non-negative real number.`,
        ],
      };
    },
  },
  {
    id: 'ml-06-x7',
    difficulty: 2,
    keyConceptTag: 'The reciprocal',
    correctOptionId: 'a',
    generate: (g) => {
      const [a, b] = g.until(() => g.pick([[1, 1], [1, -1], [2, 1], [2, -1], [1, 2], [1, -2], [3, 1], [1, 3], [3, -1], [2, 3]]), ([a, b]) => allDistinct([[a, -b], [1 / a, 1 / b]]));
      const n = a * a + b * b;
      const fr = (re: number, im: number) => r`\dfrac{${cx(re, im)}}{${n}}`;
      const recip = (x: number) => frac(1, x);
      const comp = `${recip(a)} ${b < 0 ? '-' : '+'} ${Math.abs(b) === 1 ? '' : recip(Math.abs(b))}i`;
      return {
        params: { a, b },
        promptText: r`What is $\dfrac{1}{${cx(a, b)}}$?`,
        options: [
          { id: 'a', label: `$${fr(a, -b)}$`, value: [a / n, -b / n] },
          { id: 'b', label: `$${cx(a, -b)}$`, value: [a, -b], trapExplanation: r`Multiplying the top by the conjugate also multiplies the bottom: $(${cx(a, b)})(${cx(a, -b)}) = ${n}$, which still has to be divided out.` },
          { id: 'c', label: `$${comp}$`, value: [1 / a, 1 / b], trapExplanation: r`$\frac{1}{a + bi}$ is not $\frac1a + \frac1b i$: a fraction cannot be split over a sum in the denominator.` },
          { id: 'd', label: `$${fr(a, b)}$`, value: [a / n, b / n], trapExplanation: r`The numerator is the conjugate $${cx(a, -b)}$, not the number itself: the imaginary part changes sign.` },
        ],
        stepByStepSolution: [
          r`Multiply top and bottom by the conjugate of the denominator, $${cx(a, -b)}$.`,
          r`Bottom: $(${cx(a, b)})(${cx(a, -b)}) = ${a * a} + ${b * b} = ${n}$. Top: $${cx(a, -b)}$.`,
          r`$\dfrac{1}{${cx(a, b)}} = ${fr(a, -b)}$.`,
        ],
      };
    },
  },
];
