import type { QuestionTemplate } from '../../../types.ts';
import { r } from '../define.ts';
import { allDistinct, frac, paren, poly } from '../gen.ts';

/** An antiderivative label: a polynomial plus the constant C. */
export const plusC = (cs: number[]) => `$${poly(cs)} + C$`;

export const practice: QuestionTemplate[] = [
  {
    id: 'ca-04-1',
    difficulty: 1,
    keyConceptTag: 'Definite integral of a linear function',
    correctOptionId: 'a',
    generate: (g) => {
      const { p, q, b } = g.until(
        () => ({ p: g.nonzero(-4, 6), q: g.nonzero(-5, 6), b: g.int(1, 5) }),
        ({ p, q, b }) => (p * b * b) % 2 === 0 && allDistinct([(p * b * b) / 2 + q * b, p * b + q, p * b * b + q * b, q * b]),
      );
      const val = (p * b * b) / 2 + q * b;
      return {
        params: { cs: [q, p], a: 0, b },
        promptText: r`Compute $\displaystyle\int_0^{${b}} (${poly([q, p])})\,dx$.`,
        options: [
          { id: 'a', label: `$${val}$`, value: val },
          { id: 'b', label: `$${p * b + q}$`, value: p * b + q, trapExplanation: r`That is the integrand at $x = ${b}$, a height, not an area.` },
          { id: 'c', label: `$${p * b * b + q * b}$`, value: p * b * b + q * b, trapExplanation: r`$\int x\,dx = \frac{x^2}{2}$: the factor $\frac12$ is missing.` },
          { id: 'd', label: `$${q * b}$`, value: q * b, trapExplanation: r`That is one rectangle of height $f(0) = ${q}$ over the whole interval. The function is not constant: add the triangle $\frac{${p}\cdot${b}^2}{2}$.` },
        ],
        stepByStepSolution: [
          r`Antiderivative: $F(x) = ${frac(p, 2)}x^2 ${q < 0 ? '-' : '+'} ${Math.abs(q) === 1 ? '' : Math.abs(q)}x$.`,
          r`$F(${b}) - F(0) = ${frac(p, 2)}\cdot${b * b} + ${paren(q)}\cdot${b} - 0$.`,
          r`$= ${val}$.`,
        ],
      };
    },
  },
  {
    id: 'ca-04-2',
    difficulty: 1,
    keyConceptTag: 'Antiderivative of a power',
    correctOptionId: 'a',
    generate: (g) => {
      const n = g.int(1, 4);
      const m = g.pick([-3, -2, 2, 3]);
      const k = m * (n + 1);
      const mono = (coef: number, pow: number) => {
        const cs = Array(pow + 1).fill(0);
        cs[pow] = coef;
        return cs;
      };
      const opts = { a: mono(m, n + 1), b: mono(k, n + 1), c: mono(k * n, n - 1), d: mono(m, n) };
      return {
        params: { k, n, ...opts },
        promptText: r`Find $\displaystyle\int ${poly(mono(k, n))}\,dx$.`,
        options: [
          { id: 'a', label: plusC(opts.a) },
          { id: 'b', label: plusC(opts.b), trapExplanation: r`$(${poly(opts.b)})' = ${poly(mono(k * (n + 1), n))}$: divide by the new exponent ${n + 1}.` },
          { id: 'c', label: plusC(opts.c), trapExplanation: r`That is the <i>derivative</i> of $${poly(mono(k, n))}$; integration goes the other way and raises the exponent.` },
          { id: 'd', label: plusC(opts.d), trapExplanation: r`The exponent goes up by one: $x^{${n}} \to \frac{x^{${n + 1}}}{${n + 1}}$.` },
        ],
        stepByStepSolution: [
          r`$\int x^n\,dx = \frac{x^{n+1}}{n + 1} + C$.`,
          r`$\int ${poly(mono(k, n))}\,dx = ${k}\cdot\frac{x^{${n + 1}}}{${n + 1}} + C = ${poly(opts.a)} + C$.`,
          r`Check: $(${poly(opts.a)})' = ${poly(mono(k, n))}$. ✓`,
        ],
      };
    },
  },
  {
    id: 'ca-04-3',
    difficulty: 2,
    keyConceptTag: 'The fundamental theorem',
    correctOptionId: 'a',
    generate: (g) => {
      const { p, q, a, b } = g.until(
        () => ({ p: g.pick([-3, 3, 6]), q: g.int(-4, 4), a: g.nonzero(-2, 1), b: g.int(1, 3) }),
        ({ p, q, a, b }) => {
          const F = (x: number) => (p / 3) * x ** 3 + q * x;
          const f = (x: number) => p * x * x + q;
          return a < b && allDistinct([F(b) - F(a), F(b), F(a) - F(b), f(b) - f(a)]);
        },
      );
      const F = (x: number) => (p / 3) * x ** 3 + q * x;
      const f = (x: number) => p * x * x + q;
      return {
        params: { cs: [q, 0, p], a, b },
        promptText: r`Compute $\displaystyle\int_{${a}}^{${b}} (${poly([q, 0, p])})\,dx$.`,
        options: [
          { id: 'a', label: `$${F(b) - F(a)}$`, value: F(b) - F(a) },
          { id: 'b', label: `$${F(b)}$`, value: F(b), trapExplanation: r`That is $F(${b})$ alone. The lower limit is $${a}$, not 0: subtract $F(${a}) = ${F(a)}$.` },
          { id: 'c', label: `$${F(a) - F(b)}$`, value: F(a) - F(b), trapExplanation: r`The order is upper minus lower: $F(${b}) - F(${a})$.` },
          { id: 'd', label: `$${f(b) - f(a)}$`, value: f(b) - f(a), trapExplanation: r`That subtracts values of the integrand. Use an antiderivative $F$ instead.` },
        ],
        stepByStepSolution: [
          r`Antiderivative: $F(x) = ${poly([0, q, 0, p / 3])}$.`,
          r`$F(${b}) = ${F(b)}$ and $F(${a}) = ${F(a)}$.`,
          r`$F(${b}) - F(${a}) = ${F(b) - F(a)}$.`,
        ],
      };
    },
  },
  {
    id: 'ca-04-4',
    difficulty: 2,
    keyConceptTag: 'Signed area',
    correctOptionId: 'a',
    generate: (g) => {
      const { a, b } = g.until(
        () => ({ a: g.int(1, 6), b: g.int(1, 6) }),
        ({ a, b }) => a !== b && (a + b) % 2 === 0 && allDistinct([(b * b - a * a) / 2, (a * a + b * b) / 2, (b * b) / 2, b * b - a * a]),
      );
      return {
        params: { cs: [0, 1], a: -a, b },
        promptText: r`Compute $\displaystyle\int_{-${a}}^{${b}} x\,dx$.`,
        options: [
          { id: 'a', label: `$${(b * b - a * a) / 2}$`, value: (b * b - a * a) / 2 },
          { id: 'b', label: `$${(a * a + b * b) / 2}$`, value: (a * a + b * b) / 2, trapExplanation: r`That is the total shaded area. The integral counts the part below the axis (on $[-${a}, 0]$) as negative.` },
          { id: 'c', label: `$${(b * b) / 2}$`, value: (b * b) / 2, trapExplanation: r`That is $\int_0^{${b}}$. The interval starts at $-${a}$.` },
          { id: 'd', label: `$${b * b - a * a}$`, value: b * b - a * a, trapExplanation: r`$\int x\,dx = \frac{x^2}{2}$: divide by 2.` },
        ],
        stepByStepSolution: [
          r`$F(x) = \frac{x^2}{2}$.`,
          r`$F(${b}) - F(-${a}) = \frac{${b * b}}{2} - \frac{${a * a}}{2}$.`,
          r`$= ${(b * b - a * a) / 2}$: the triangle below the axis cancels part of the one above.`,
        ],
      };
    },
  },
  {
    id: 'ca-04-5',
    difficulty: 3,
    keyConceptTag: 'Integration by substitution',
    correctOptionId: 'a',
    generate: (g) => {
      const { c, m, n } = g.until(
        () => ({ c: g.int(1, 2), m: g.int(1, 3), n: g.int(1, 2) }),
        ({ c, m, n }) => {
          const top = (c * c + m) ** (n + 1);
          const bot = m ** (n + 1);
          return allDistinct([(top - bot) / (n + 1), top - bot, top / (n + 1), (top - bot) / (2 * (n + 1))]);
        },
      );
      const top = (c * c + m) ** (n + 1);
      const bot = m ** (n + 1);
      const inner = poly([m, 0, 1]);
      return {
        params: { c, m, n },
        promptText: r`Compute $\displaystyle\int_0^{${c}} 2x\,(${inner})^{${n}}\,dx$.`,
        options: [
          { id: 'a', label: `$${frac(top - bot, n + 1)}$`, value: (top - bot) / (n + 1) },
          { id: 'b', label: `$${top - bot}$`, value: top - bot, trapExplanation: r`$\int u^{${n}}\,du = \frac{u^{${n + 1}}}{${n + 1}}$: divide by ${n + 1}.` },
          { id: 'c', label: `$${frac(top, n + 1)}$`, value: top / (n + 1), trapExplanation: r`The lower limit $x = 0$ gives $u = ${m}$, not $u = 0$: subtract $\frac{${m}^{${n + 1}}}{${n + 1}}$.` },
          { id: 'd', label: `$${frac(top - bot, 2 * (n + 1))}$`, value: (top - bot) / (2 * (n + 1)), trapExplanation: r`With $u = ${inner}$, $du = 2x\,dx$ absorbs the whole factor $2x$: there is no extra $\frac12$.` },
        ],
        stepByStepSolution: [
          r`Substitute $u = ${inner}$, $du = 2x\,dx$. The limits $x = 0 \to u = ${m}$ and $x = ${c} \to u = ${c * c + m}$.`,
          r`$\int_{${m}}^{${c * c + m}} u^{${n}}\,du = \Big[\frac{u^{${n + 1}}}{${n + 1}}\Big]_{${m}}^{${c * c + m}} = \frac{${top} - ${bot}}{${n + 1}}$.`,
          r`$= ${frac(top - bot, n + 1)}$.`,
        ],
      };
    },
  },
  {
    id: 'ca-04-6',
    difficulty: 3,
    keyConceptTag: 'Expectation as an integral',
    correctOptionId: 'a',
    generate: (g) => {
      const n = g.int(2, 7);
      return {
        params: { n },
        promptText: r`A random variable $X$ on $[0, 1]$ has density $p(x) = ${n + 1}x^{${n}}$. What is $E[X] = \int_0^1 x\,p(x)\,dx$?`,
        options: [
          { id: 'a', label: `$${frac(n + 1, n + 2)}$`, value: (n + 1) / (n + 2) },
          { id: 'b', label: r`$\tfrac12$`, value: 0.5, trapExplanation: r`$\frac12$ is the mean of the <i>uniform</i> density. This density puts more weight near 1.` },
          { id: 'c', label: `$${frac(n, n + 1)}$`, value: n / (n + 1), trapExplanation: r`The integrand is $x\cdot${n + 1}x^{${n}} = ${n + 1}x^{${n + 1}}$, whose antiderivative has $x^{${n + 2}}$ and the denominator ${n + 2}.` },
          { id: 'd', label: `$${frac(1, n + 2)}$`, value: 1 / (n + 2), trapExplanation: r`The constant ${n + 1} in the density stays in front of the integral.` },
        ],
        stepByStepSolution: [
          r`$E[X] = \int_0^1 x\cdot${n + 1}x^{${n}}\,dx = ${n + 1}\int_0^1 x^{${n + 1}}\,dx$.`,
          r`$= ${n + 1}\cdot\Big[\frac{x^{${n + 2}}}{${n + 2}}\Big]_0^1 = \frac{${n + 1}}{${n + 2}}$.`,
          r`Check: $\int_0^1 p = [x^{${n + 1}}]_0^1 = 1$, so $p$ is a density. ✓`,
        ],
      };
    },
  },
];
