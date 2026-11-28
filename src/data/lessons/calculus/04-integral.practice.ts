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
    id: 'ca-04-7',
    difficulty: 3,
    keyConceptTag: 'Total area versus signed area',
    correctOptionId: 'a',
    generate: (g) => {
      const { a, b } = g.until(
        () => {
          const a = g.int(1, 4);
          return { a, b: a + g.int(1, 5) };
        },
        ({ a, b }) => allDistinct([a * a + (b - a) ** 2, b * b - 2 * a * b, (b - a) ** 2, b * b]),
      );
      const total = a * a + (b - a) ** 2;
      return {
        params: { a, b },
        promptText: r`What is the total area between the graph of $f(x) = x - ${a}$ and the $x$-axis for $0 \le x \le ${b}$?`,
        options: [
          { id: 'a', label: `$${frac(total, 2)}$`, value: total / 2 },
          { id: 'b', label: `$${frac(b * b - 2 * a * b, 2)}$`, value: (b * b - 2 * a * b) / 2, trapExplanation: r`That is the signed integral $\int_0^{${b}} (x - ${a})\,dx$: the part below the axis was subtracted instead of added.` },
          { id: 'c', label: `$${frac((b - a) ** 2, 2)}$`, value: (b - a) ** 2 / 2, trapExplanation: r`Only the part above the axis. The triangle below it, on $[0, ${a}]$, has area $${frac(a * a, 2)}$ as well.` },
          { id: 'd', label: `$${frac(b * b, 2)}$`, value: (b * b) / 2, trapExplanation: r`That is the area under $y = x$: the shift by ${a} was dropped.` },
        ],
        stepByStepSolution: [
          r`$f$ is negative on $[0, ${a}]$ and positive on $[${a}, ${b}]$: split the interval at $x = ${a}$.`,
          r`$\int_0^{${a}} (x - ${a})\,dx = -${frac(a * a, 2)}$, so that piece has area $${frac(a * a, 2)}$; $\int_{${a}}^{${b}} (x - ${a})\,dx = ${frac((b - a) ** 2, 2)}$.`,
          r`Total area: $${frac(a * a, 2)} + ${frac((b - a) ** 2, 2)} = ${frac(total, 2)}$.`,
        ],
      };
    },
  },
  {
    id: 'ca-04-8',
    difficulty: 3,
    keyConceptTag: 'The integral of a rate is the total change',
    correctOptionId: 'a',
    generate: (g) => {
      const { p, q, t1, t2 } = g.until(
        () => {
          const t1 = g.int(0, 3);
          return { p: g.int(1, 4), q: g.int(1, 6), t1, t2: t1 + g.int(1, 3) };
        },
        ({ p, q, t1, t2 }) => allDistinct([p * (t2 * t2 - t1 * t1) + 2 * q * (t2 - t1), 2 * p * (t2 - t1), 2 * (p * t2 + q) * (t2 - t1), p * (t2 * t2 - t1 * t1)]),
      );
      const total2 = p * (t2 * t2 - t1 * t1) + 2 * q * (t2 - t1);
      return {
        params: { p, q, t1, t2 },
        promptText: r`Water flows into a tank at the rate $r(t) = ${poly([q, p], 't')}$ litres per minute. How many litres flow in between $t = ${t1}$ and $t = ${t2}$ minutes?`,
        options: [
          { id: 'a', label: `$${frac(total2, 2)}$`, value: total2 / 2 },
          { id: 'b', label: `$${p * (t2 - t1)}$`, value: p * (t2 - t1), trapExplanation: r`$r(${t2}) - r(${t1})$ is how much the <i>rate</i> changed. The amount of water is the area under the rate.` },
          { id: 'c', label: `$${(p * t2 + q) * (t2 - t1)}$`, value: (p * t2 + q) * (t2 - t1), trapExplanation: r`That treats the rate as constant at its final value $r(${t2}) = ${p * t2 + q}$. It grew from $r(${t1}) = ${p * t1 + q}$, so integrate.` },
          { id: 'd', label: `$${frac(p * (t2 * t2 - t1 * t1), 2)}$`, value: (p * (t2 * t2 - t1 * t1)) / 2, trapExplanation: r`The constant part of the rate also adds water: $${q}\cdot(${t2} - ${t1}) = ${q * (t2 - t1)}$ litres.` },
        ],
        stepByStepSolution: [
          r`The total change is the integral of the rate: $\int_{${t1}}^{${t2}} (${poly([q, p], 't')})\,dt$.`,
          r`Antiderivative: $F(t) = ${p === 2 ? '' : frac(p, 2)}t^2 + ${q}t$.`,
          r`$F(${t2}) - F(${t1}) = ${frac(p * t2 * t2 + 2 * q * t2, 2)} - ${frac(p * t1 * t1 + 2 * q * t1, 2)} = ${frac(total2, 2)}$ litres.`,
        ],
      };
    },
  },
];
