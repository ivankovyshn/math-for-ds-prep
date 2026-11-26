import type { QuestionTemplate } from '../../../types.ts';
import { r } from '../define.ts';
import { allDistinct, coef, frac, paren, poly, sumOf } from '../gen.ts';

/** Extra practice (Practice 2): gentler questions on the same ideas, with new numbers every time. */
export const extra: QuestionTemplate[] = [
  {
    id: 'ca-04-x1',
    difficulty: 1,
    keyConceptTag: 'Area under a line',
    correctOptionId: 'a',
    generate: (g) => {
      const b = g.int(3, 10);
      return {
        params: { cs: [0, 1], a: 0, b },
        promptText: r`Compute $\displaystyle\int_0^{${b}} x\,dx$.`,
        options: [
          { id: 'a', label: `$${frac(b * b, 2)}$`, value: (b * b) / 2 },
          { id: 'b', label: `$${b * b}$`, value: b * b, trapExplanation: r`$\int x\,dx = \frac{x^2}{2}$; the area is a triangle, half of the square.` },
          { id: 'c', label: `$${b}$`, value: b, trapExplanation: r`That is the height of the line at $x = ${b}$, not the area under it.` },
          { id: 'd', label: `$${frac(b, 2)}$`, value: b / 2, trapExplanation: r`The triangle has base ${b} and height ${b}: area $\frac{${b}\cdot${b}}{2}$.` },
        ],
        stepByStepSolution: [
          r`$\int_0^{${b}} x\,dx = \Big[\frac{x^2}{2}\Big]_0^{${b}}$.`,
          r`$= \frac{${b * b}}{2} - 0$.`,
          r`$= ${frac(b * b, 2)}$, the area of a right triangle with legs ${b} and ${b}.`,
        ],
      };
    },
  },
  {
    id: 'ca-04-x2',
    difficulty: 1,
    keyConceptTag: 'Antiderivative of an exponential',
    correctOptionId: 'a',
    generate: (g) => {
      const k = g.pick([-3, 2, 3, 4, 5]);
      const e = (m: number) => `e^{${coef(m)}x}`;
      return {
        params: { k },
        promptText: r`Find $\displaystyle\int ${e(k)}\,dx$.`,
        options: [
          { id: 'a', label: `$${frac(1, k)}${e(k)} + C$` },
          { id: 'b', label: `$${k}${e(k)} + C$`, trapExplanation: r`$(${k}${e(k)})' = ${k * k}${e(k)}$. Integration divides by ${k}; differentiation multiplies.` },
          { id: 'c', label: `$${e(k)} + C$`, trapExplanation: r`$(${e(k)})' = ${k}${e(k)}$ by the chain rule, so a factor $\frac{1}{${k}}$ is needed.` },
          { id: 'd', label: `$${frac(1, k + 1)}e^{${coef(k + 1)}x} + C$`, trapExplanation: r`The power rule $x^n \to \frac{x^{n+1}}{n+1}$ does not apply to exponentials.` },
        ],
        stepByStepSolution: [
          r`Guess $F(x) = c\,${e(k)}$: then $F'(x) = ${k}c\,${e(k)}$.`,
          r`We need $${k}c = 1$, so $c = ${frac(1, k)}$.`,
          r`$\int ${e(k)}\,dx = ${frac(1, k)}${e(k)} + C$.`,
        ],
      };
    },
  },
  {
    id: 'ca-04-x3',
    difficulty: 1,
    keyConceptTag: 'Riemann sums',
    correctOptionId: 'a',
    generate: (g) => {
      const n = g.int(3, 6);
      const idx = Array.from({ length: n }, (_, i) => i);
      const left = sumOf(idx.map((i) => i * i));
      const right = sumOf(idx.map((i) => (i + 1) ** 2));
      return {
        params: { n },
        promptText: r`Compute the left Riemann sum of $f(x) = x^2$ on $[0, ${n}]$ with ${n} strips of width 1.`,
        options: [
          { id: 'a', label: `$${left}$`, value: left },
          { id: 'b', label: `$${right}$`, value: right, trapExplanation: r`That uses the right ends $1, \dots, ${n}$. The left sum takes heights at $0, \dots, ${n - 1}$.` },
          { id: 'c', label: `$${frac(n ** 3, 3)}$`, value: n ** 3 / 3, trapExplanation: r`That is the exact integral $\frac{${n}^3}{3}$. A Riemann sum with only ${n} strips is an approximation.` },
          { id: 'd', label: `$${sumOf(idx)}$`, value: sumOf(idx), trapExplanation: r`The heights are $f(x_i) = x_i^2$, not $x_i$.` },
        ],
        stepByStepSolution: [
          r`Left ends: $x = ${idx.join(', ')}$; heights $${idx.map((i) => i * i).join(', ')}$.`,
          r`Each strip has width 1, so the sum is $${idx.map((i) => i * i).join(' + ')}$.`,
          r`$= ${left}$ (the exact area is $${frac(n ** 3, 3)}$).`,
        ],
      };
    },
  },
  {
    id: 'ca-04-x4',
    difficulty: 2,
    keyConceptTag: 'The fundamental theorem',
    correctOptionId: 'a',
    generate: (g) => {
      const { a, b } = g.until(
        () => ({ a: g.nonzero(-3, 3), b: g.int(1, 5) }),
        ({ a, b }) => a < b && allDistinct([b * b - a * a, (b - a) ** 2, 2 * (b - a), b * b]),
      );
      return {
        params: { cs: [0, 2], a, b },
        promptText: r`Compute $\displaystyle\int_{${a}}^{${b}} 2x\,dx$.`,
        options: [
          { id: 'a', label: `$${b * b - a * a}$`, value: b * b - a * a },
          { id: 'b', label: `$${(b - a) ** 2}$`, value: (b - a) ** 2, trapExplanation: r`$F(b) - F(a) = b^2 - a^2$, which is not $(b - a)^2$.` },
          { id: 'c', label: `$${2 * (b - a)}$`, value: 2 * (b - a), trapExplanation: r`That integrates the constant 2. The integrand is $2x$, with antiderivative $x^2$.` },
          { id: 'd', label: `$${b * b}$`, value: b * b, trapExplanation: r`Subtract $F(${a}) = ${a * a}$ for the lower limit.` },
        ],
        stepByStepSolution: [
          r`$F(x) = x^2$.`,
          r`$F(${b}) - F(${a}) = ${b * b} - ${a * a}$.`,
          r`$= ${b * b - a * a}$.`,
        ],
      };
    },
  },
  {
    id: 'ca-04-x5',
    difficulty: 2,
    keyConceptTag: 'Differentiating an integral',
    correctOptionId: 'a',
    generate: (g) => {
      const { c, a } = g.until(
        () => ({ c: g.nonzero(-5, 5), a: g.nonzero(-3, 3) }),
        ({ c, a }) => allDistinct([a * a + c, a ** 3 / 3 + c * a, 2 * a, c]),
      );
      return {
        params: { c, a },
        promptText: r`$F(x) = \displaystyle\int_0^x (${poly([c, 0, 1], 't')})\,dt$. What is $F'(${a})$?`,
        options: [
          { id: 'a', label: `$${a * a + c}$`, value: a * a + c },
          { id: 'b', label: `$${frac(a ** 3 + 3 * c * a, 3)}$`, value: a ** 3 / 3 + c * a, trapExplanation: r`That is $F(${a})$, the accumulated area. Differentiating undoes the integral.` },
          { id: 'c', label: `$${2 * a}$`, value: 2 * a, trapExplanation: r`That differentiates the integrand once more. $F' = $ the integrand itself.` },
          { id: 'd', label: `$${c}$`, value: c, trapExplanation: r`That is the integrand at $t = 0$. $F'(x)$ is the integrand at the upper limit $x = ${a}$.` },
        ],
        stepByStepSolution: [
          r`Fundamental theorem: $\frac{d}{dx}\int_0^x f(t)\,dt = f(x)$.`,
          r`So $F'(x) = ${poly([c, 0, 1])}$.`,
          r`$F'(${a}) = ${a * a} + ${paren(c)} = ${a * a + c}$.`,
        ],
      };
    },
  },
  {
    id: 'ca-04-x6',
    difficulty: 2,
    keyConceptTag: 'Average value',
    correctOptionId: 'a',
    generate: (g) => {
      const { p, b } = g.until(
        () => ({ p: g.nonzero(-5, 6), b: g.int(2, 8) }),
        ({ p, b }) => allDistinct([(p * b) / 2, p * b, (p * b * b) / 2, p / 2]),
      );
      return {
        params: { p, b },
        promptText: r`What is the average value of $f(x) = ${poly([0, p])}$ on $[0, ${b}]$?`,
        options: [
          { id: 'a', label: `$${frac(p * b, 2)}$`, value: (p * b) / 2 },
          { id: 'b', label: `$${p * b}$`, value: p * b, trapExplanation: r`That is the largest value $f(${b})$. A linear function averages to its midpoint value.` },
          { id: 'c', label: `$${frac(p * b * b, 2)}$`, value: (p * b * b) / 2, trapExplanation: r`That is the integral. The average divides it by the length ${b}.` },
          { id: 'd', label: `$${frac(p, 2)}$`, value: p / 2, trapExplanation: r`Average $= \frac{1}{${b}}\cdot\frac{${p}\cdot${b}^2}{2}$: one factor ${b} remains.` },
        ],
        stepByStepSolution: [
          r`Average value $= \frac{1}{b - a}\int_a^b f(x)\,dx$.`,
          r`$\int_0^{${b}} ${poly([0, p])}\,dx = ${frac(p * b * b, 2)}$.`,
          r`Divide by ${b}: $${frac(p * b, 2)}$, which is $f(${frac(b, 2)})$, the value at the midpoint.`,
        ],
      };
    },
  },
];
