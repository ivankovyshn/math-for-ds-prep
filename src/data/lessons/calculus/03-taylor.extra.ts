import type { QuestionTemplate } from '../../../types.ts';
import { r } from '../define.ts';
import { allDistinct, dec, factorial, frac, fracPoly, paren } from '../gen.ts';

/** Extra practice (Practice 2): gentler questions on the same ideas, with new numbers every time. */
export const extra: QuestionTemplate[] = [
  {
    id: 'ca-03-x1',
    difficulty: 1,
    keyConceptTag: 'Linear approximation',
    correctOptionId: 'a',
    generate: (g) => {
      const { a, y0, m, h } = g.until(
        () => ({ a: g.int(-3, 5), y0: g.int(-5, 9), m: g.nonzero(-6, 6), h: g.pick([0.1, 0.2, -0.1, 0.5, -0.2]) }),
        ({ y0, m, h }) => allDistinct([y0 + m * h, y0 + m, m * h, y0 - m * h].map(dec)),
      );
      return {
        params: { a, y0, m, h },
        promptText: r`$f(${a}) = ${y0}$ and $f'(${a}) = ${m}$. Use the linear approximation to estimate $f(${dec(a + h)})$.`,
        options: [
          { id: 'a', label: `$${dec(y0 + m * h)}$`, value: y0 + m * h },
          { id: 'b', label: `$${dec(y0 + m)}$`, value: y0 + m, trapExplanation: r`The slope is multiplied by the step $h = ${dec(h)}$, not by 1.` },
          { id: 'c', label: `$${dec(m * h)}$`, value: m * h, trapExplanation: r`That is only the change; start from $f(${a}) = ${y0}$.` },
          { id: 'd', label: `$${dec(y0 - m * h)}$`, value: y0 - m * h, trapExplanation: r`The step is $h = ${dec(a + h)} - ${paren(a)} = ${dec(h)}$; mind its sign.` },
        ],
        stepByStepSolution: [
          r`$f(a + h) \approx f(a) + f'(a)\,h$ with $h = ${dec(h)}$.`,
          r`$${y0} + ${paren(m)}\cdot${h < 0 ? `(${dec(h)})` : dec(h)}$.`,
          r`$= ${dec(y0 + m * h)}$.`,
        ],
      };
    },
  },
  {
    id: 'ca-03-x2',
    difficulty: 1,
    keyConceptTag: 'Taylor series of e^x',
    correctOptionId: 'a',
    generate: (g) => {
      const n = g.int(3, 5);
      const nf = factorial(n);
      return {
        params: { k: 1, n },
        promptText: r`What is the coefficient of $x^{${n}}$ in the Taylor series of $e^x$ at 0?`,
        options: [
          { id: 'a', label: `$${frac(1, nf)}$`, value: 1 / nf },
          { id: 'b', label: `$${frac(1, n)}$`, value: 1 / n, trapExplanation: r`The denominator is $${n}! = ${nf}$, not ${n}.` },
          { id: 'c', label: '$1$', value: 1, trapExplanation: r`Every derivative of $e^x$ at 0 is 1, but the coefficient divides by $${n}!$.` },
          { id: 'd', label: `$${nf}$`, value: nf, trapExplanation: r`The factorial goes in the denominator: $\frac{x^{${n}}}{${n}!}$.` },
        ],
        stepByStepSolution: [
          r`Coefficient $= \frac{f^{(${n})}(0)}{${n}!}$.`,
          r`All derivatives of $e^x$ equal $e^x$, so $f^{(${n})}(0) = 1$.`,
          r`$\frac{1}{${n}!} = ${frac(1, nf)}$.`,
        ],
      };
    },
  },
  {
    id: 'ca-03-x3',
    difficulty: 1,
    keyConceptTag: 'Linear approximation',
    correctOptionId: 'a',
    generate: (g) => {
      const k = g.pick([-3, -2, 2, 3, 4]);
      const T = (cs: number[][]) => `$${fracPoly(cs)}$`;
      return {
        params: { k },
        promptText: r`What is the linear approximation (degree-1 Taylor polynomial) of $e^{${k}x}$ at 0?`,
        options: [
          { id: 'a', label: T([[1, 1], [k, 1]]), value: [1, k] },
          { id: 'b', label: T([[0, 1], [k, 1]]), value: [0, k], trapExplanation: r`The constant term is $f(0) = e^0 = 1$.` },
          { id: 'c', label: T([[1, 1], [1, 1]]), value: [1, 1], trapExplanation: r`That is for $e^x$. Here $f'(0) = ${k}e^0 = ${k}$.` },
          { id: 'd', label: T([[k, 1], [1, 1]]), value: [k, 1], trapExplanation: r`The roles are swapped: $f(0) = 1$ is the constant, $f'(0) = ${k}$ multiplies $x$.` },
        ],
        stepByStepSolution: [
          r`$T_1(x) = f(0) + f'(0)\,x$.`,
          r`$f(0) = 1$; $f'(x) = ${k}e^{${k}x}$ so $f'(0) = ${k}$.`,
          r`$T_1(x) = ${fracPoly([[1, 1], [k, 1]])}$.`,
        ],
      };
    },
  },
  {
    id: 'ca-03-x4',
    difficulty: 2,
    keyConceptTag: 'Taylor series of cosine',
    correctOptionId: 'a',
    generate: (g) => {
      const k = g.int(2, 5);
      return {
        params: { k },
        promptText: r`What is the coefficient of $x^2$ in the Taylor series of $\cos(${k}x)$ at 0?`,
        options: [
          { id: 'a', label: `$${frac(-k * k, 2)}$`, value: (-k * k) / 2 },
          { id: 'b', label: `$${frac(k * k, 2)}$`, value: (k * k) / 2, trapExplanation: r`$\cos u = 1 - \frac{u^2}{2} + \dots$: the quadratic term is negative.` },
          { id: 'c', label: `$${-k * k}$`, value: -k * k, trapExplanation: r`Divide by $2! = 2$.` },
          { id: 'd', label: `$${frac(-k, 2)}$`, value: -k / 2, trapExplanation: r`$(${k}x)^2 = ${k * k}x^2$: square the ${k} too.` },
        ],
        stepByStepSolution: [
          r`$\cos u = 1 - \frac{u^2}{2} + \dots$ with $u = ${k}x$.`,
          r`$-\frac{(${k}x)^2}{2} = -\frac{${k * k}}{2}x^2$.`,
          r`Coefficient: $${frac(-k * k, 2)}$.`,
        ],
      };
    },
  },
  {
    id: 'ca-03-x5',
    difficulty: 2,
    keyConceptTag: 'Taylor expansion around a ≠ 0',
    correctOptionId: 'a',
    generate: (g) => {
      const a = g.until(() => g.pick([-3, -2, -1, 2, 3, 4]), (a) => allDistinct([3 * a * a, a ** 3, 3 * a, 6 * a]));
      return {
        params: { n: 3, a },
        promptText: r`Expand $f(x) = x^3$ around $a = ${a}$. What is the coefficient of $(x ${a < 0 ? '+' : '-'} ${Math.abs(a)})$?`,
        options: [
          { id: 'a', label: `$${3 * a * a}$`, value: 3 * a * a },
          { id: 'b', label: `$${a ** 3}$`, value: a ** 3, trapExplanation: r`$f(${a}) = ${a ** 3}$ is the constant term, not the coefficient of $(x - a)$.` },
          { id: 'c', label: `$${3 * a}$`, value: 3 * a, trapExplanation: r`$f'(x) = 3x^2$, so the coefficient is $3\cdot${paren(a)}^2$.` },
          { id: 'd', label: `$${6 * a}$`, value: 6 * a, trapExplanation: r`$6a$ is $f''(a)$, which belongs (halved) to the $(x - a)^2$ term.` },
        ],
        stepByStepSolution: [
          r`The coefficient of $(x - a)$ is $f'(a)$.`,
          r`$f'(x) = 3x^2$.`,
          r`$f'(${a}) = ${3 * a * a}$.`,
        ],
      };
    },
  },
  {
    id: 'ca-03-x6',
    difficulty: 2,
    keyConceptTag: 'Series of the logarithm',
    correctOptionId: 'a',
    generate: (g) => {
      const h = g.pick([0.1, 0.2, 0.3, -0.1, -0.2]);
      const t2 = h - (h * h) / 2;
      return {
        params: { h },
        promptText: r`Use $\ln(1 + x) \approx x - \frac{x^2}{2}$ to approximate $\ln(${dec(1 + h)})$.`,
        options: [
          { id: 'a', label: `$${dec(t2)}$`, value: t2 },
          { id: 'b', label: `$${dec(h)}$`, value: h, trapExplanation: r`That is the linear approximation only; subtract $\frac{x^2}{2} = ${dec((h * h) / 2)}$.` },
          { id: 'c', label: `$${dec(h + (h * h) / 2)}$`, value: h + (h * h) / 2, trapExplanation: r`The series alternates: $x - \frac{x^2}{2} + \frac{x^3}{3} - \dots$` },
          { id: 'd', label: `$${dec(1 + h)}$`, value: 1 + h, trapExplanation: r`$\ln(1 + x)$ starts at $\ln 1 = 0$, not at 1. Here $x = ${dec(h)}$.` },
        ],
        stepByStepSolution: [
          r`$\ln(${dec(1 + h)}) = \ln(1 + x)$ with $x = ${dec(h)}$.`,
          r`$x - \frac{x^2}{2} = ${dec(h)} - ${dec((h * h) / 2)}$.`,
          r`$\approx ${dec(t2)}$ (true value $${dec(Math.round(Math.log(1 + h) * 1e5) / 1e5)}\ldots$).`,
        ],
      };
    },
  },
];
