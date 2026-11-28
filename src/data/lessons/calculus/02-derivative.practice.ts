import type { QuestionTemplate } from '../../../types.ts';
import { r } from '../define.ts';
import { allDistinct, coef, dec, frac, paren, poly } from '../gen.ts';

export const practice: QuestionTemplate[] = [
  {
    id: 'ca-02-1',
    difficulty: 1,
    keyConceptTag: 'Power rule for polynomials',
    correctOptionId: 'a',
    generate: (g) => {
      const { cs, a } = g.until(
        () => ({ cs: [g.nonzero(-6, 6), g.int(-5, 5), g.int(-3, 3), g.nonzero(-2, 2)], a: g.nonzero(-2, 2) }),
        ({ cs: [c0, c1, c2, c3], a }) => {
          const d = 3 * c3 * a * a + 2 * c2 * a + c1;
          return allDistinct([d, c3 * a ** 3 + c2 * a * a + c1 * a + c0, c3 * a * a + c2 * a + c1, d + c0]);
        },
      );
      const [c0, c1, c2, c3] = cs;
      const d = 3 * c3 * a * a + 2 * c2 * a + c1;
      const val = c3 * a ** 3 + c2 * a * a + c1 * a + c0;
      const noPow = c3 * a * a + c2 * a + c1;
      return {
        params: { cs, a },
        promptText: r`Find $f'(${a})$ for $f(x) = ${poly(cs)}$.`,
        options: [
          { id: 'a', label: `$${d}$`, value: d },
          { id: 'b', label: `$${val}$`, value: val, trapExplanation: r`That is $f(${a})$, the value of the function, not its slope.` },
          { id: 'c', label: `$${noPow}$`, value: noPow, trapExplanation: r`The power rule also multiplies by the old exponent: $(x^3)' = 3x^2$, not $x^2$.` },
          { id: 'd', label: `$${d + c0}$`, value: d + c0, trapExplanation: r`The constant term $${c0}$ has derivative 0; it does not survive differentiation.` },
        ],
        stepByStepSolution: [
          r`$f'(x) = ${poly([c1, 2 * c2, 3 * c3])}$.`,
          r`$f'(${a}) = ${3 * c3}\cdot${paren(a)}^2 + ${paren(2 * c2)}\cdot${paren(a)} + ${paren(c1)}$.`,
          r`$= ${d}$.`,
        ],
      };
    },
  },
  {
    id: 'ca-02-2',
    difficulty: 1,
    keyConceptTag: 'The tangent line',
    correctOptionId: 'a',
    generate: (g) => {
      const { p, q, c, a } = g.until(
        () => ({ p: g.nonzero(-3, 3), q: g.int(-5, 5), c: g.int(-5, 5), a: g.nonzero(-3, 3) }),
        ({ p, q, c, a }) => {
          const fa = p * a * a + q * a + c;
          const m = 2 * p * a + q;
          const s = p * a + q;
          return m !== 0 && allDistinct([[fa - m * a, m], [fa, m], [fa - s * a, s], [fa + m * a, m]]);
        },
      );
      const fa = p * a * a + q * a + c;
      const m = 2 * p * a + q;
      const s = p * a + q;
      const line = (b0: number, k: number) => `$y = ${poly([b0, k])}$`;
      return {
        params: { cs: [c, q, p], a },
        promptText: r`Find the tangent line to $f(x) = ${poly([c, q, p])}$ at $x = ${a}$.`,
        options: [
          { id: 'a', label: line(fa - m * a, m), value: [fa - m * a, m] },
          { id: 'b', label: line(fa, m), value: [fa, m], trapExplanation: r`The line $y = ${poly([fa, m])}$ has the right slope but passes through $(0, ${fa})$, not $(${a}, ${fa})$. Use $y = f(a) + f'(a)(x - a)$.` },
          { id: 'c', label: line(fa - s * a, s), value: [fa - s * a, s], trapExplanation: r`Slope ${s} is the secant from $x = 0$ to $x = ${a}$. The tangent uses $f'(${a}) = ${m}$.` },
          { id: 'd', label: line(fa + m * a, m), value: [fa + m * a, m], trapExplanation: r`Sign slip: the formula has $(x - a) = (x - ${paren(a)})$.` },
        ],
        stepByStepSolution: [
          r`$f(${a}) = ${fa}$ and $f'(x) = ${poly([q, 2 * p])}$, so $f'(${a}) = ${m}$.`,
          r`$y = f(a) + f'(a)(x - a) = ${fa} + ${paren(m)}(x - ${paren(a)})$.`,
          r`$y = ${poly([fa - m * a, m])}$.`,
        ],
      };
    },
  },
  {
    id: 'ca-02-7',
    difficulty: 2,
    keyConceptTag: 'The table of derivatives',
    correctOptionId: 'a',
    generate: (g) => {
      const a = g.nonzero(-5, 5);
      const b = g.nonzero(-5, 5);
      const eT = (k: number, c: number) => `${coef(k)}e${c === 0 ? '' : ` ${c < 0 ? '-' : '+'} ${Math.abs(c)}`}`;
      return {
        params: { a, b },
        promptText: r`Find $f'(1)$ for $f(x) = ${coef(a)}e^x ${b < 0 ? '-' : '+'} ${coef(Math.abs(b))}\ln x$.`,
        options: [
          { id: 'a', label: `$${eT(a, b)}$`, value: a * Math.E + b },
          { id: 'b', label: `$${eT(a, 0)}$`, value: a * Math.E, trapExplanation: r`$\ln 1 = 0$ is the value of $\ln x$ at 1. Its derivative $\frac1x$ is $1$ there, so that term contributes $${b}$.` },
          { id: 'c', label: `$${a + b}$`, value: a + b, trapExplanation: r`The power rule is for $x^n$. $(e^x)' = e^x$, which is $e$ at $x = 1$, not 1.` },
          { id: 'd', label: `$${eT(a, -b)}$`, value: a * Math.E - b, trapExplanation: r`$(\ln x)' = +\frac1x$; the minus sign belongs to $(\cos x)' = -\sin x$.` },
        ],
        stepByStepSolution: [
          r`From the table: $(e^x)' = e^x$ and $(\ln x)' = \frac1x$.`,
          r`$f'(x) = ${coef(a)}e^x ${b < 0 ? '-' : '+'} \frac{${Math.abs(b)}}{x}$.`,
          r`$f'(1) = ${eT(a, b)} \approx ${dec(Math.round((a * Math.E + b) * 100) / 100)}$.`,
        ],
      };
    },
  },
  {
    id: 'ca-02-8',
    difficulty: 2,
    keyConceptTag: 'Velocity is the derivative',
    correctOptionId: 'a',
    generate: (g) => {
      const { p, q, t0 } = g.until(
        () => ({ p: g.nonzero(-5, 5), q: g.nonzero(-9, 9), t0: g.int(1, 4) }),
        ({ p, q, t0 }) => allDistinct([2 * p * t0 + q, p * t0 + q, p * t0 * t0 + q * t0, 2 * p * t0]),
      );
      const v = 2 * p * t0 + q;
      return {
        params: { p, q, t0 },
        promptText: r`A particle moves along a line; its position at time $t$ is $s(t) = ${poly([0, q, p], 't')}$. What is its velocity at $t = ${t0}$?`,
        options: [
          { id: 'a', label: `$${v}$`, value: v },
          { id: 'b', label: `$${p * t0 + q}$`, value: p * t0 + q, trapExplanation: r`That is the average velocity $\frac{s(${t0}) - s(0)}{${t0}}$ over the whole interval: the slope of a secant, not of the tangent.` },
          { id: 'c', label: `$${p * t0 * t0 + q * t0}$`, value: p * t0 * t0 + q * t0, trapExplanation: r`That is the position $s(${t0})$. Velocity is its rate of change, $s'(${t0})$.` },
          { id: 'd', label: `$${2 * p * t0}$`, value: 2 * p * t0, trapExplanation: r`The term $${coef(q)}t$ has derivative $${q}$; it was dropped.` },
        ],
        stepByStepSolution: [
          r`Velocity is the derivative of position: $v(t) = s'(t)$.`,
          r`$s'(t) = ${poly([q, 2 * p], 't')}$.`,
          r`$s'(${t0}) = ${2 * p}\cdot${t0} ${q < 0 ? '-' : '+'} ${Math.abs(q)} = ${v}$.`,
        ],
      };
    },
  },
  {
    id: 'ca-02-9',
    difficulty: 3,
    keyConceptTag: 'A tangent with a given slope',
    correctOptionId: 'a',
    generate: (g) => {
      const { x0, k, c, m } = g.until(
        () => ({ x0: g.nonzero(-3, 3), k: 2 * g.nonzero(-3, 3), c: g.int(-5, 5), m: g.int(-6, 6) }),
        ({ x0, k, c, m }) => {
          const b = k - 2 * x0;
          return allDistinct([x0, x0 - k / 2, 2 * x0]) && k * x0 + m !== x0 * x0 + b * x0 + c;
        },
      );
      const b = k - 2 * x0;
      const f = (x: number) => x * x + b * x + c;
      const v = -b / 2;
      const pt = (x: number, y: number) => `$(${x}, ${y})$`;
      return {
        params: { b, c, k },
        promptText: r`At which point of the curve $y = ${poly([c, b, 1])}$ is the tangent parallel to the line $y = ${poly([m, k])}$?`,
        options: [
          { id: 'a', label: pt(x0, f(x0)), value: [x0, f(x0)] },
          { id: 'b', label: pt(x0, k * x0 + m), value: [x0, k * x0 + m], trapExplanation: r`$x = ${x0}$ is right, but the point must lie on the curve: its height is $f(${x0}) = ${f(x0)}$, not the line's height.` },
          { id: 'c', label: pt(v, f(v)), value: [v, f(v)], trapExplanation: r`At $x = ${v}$ the derivative is 0: that is the vertex, where the tangent is horizontal. We need slope $${k}$.` },
          { id: 'd', label: pt(2 * x0, f(2 * x0)), value: [2 * x0, f(2 * x0)], trapExplanation: r`$f'(x) = ${poly([b, 2])} = ${k}$ gives $2x = ${2 * x0}$; divide by 2 as well.` },
        ],
        stepByStepSolution: [
          r`Parallel lines have equal slopes, so the tangent needs slope $${k}$: solve $f'(x) = ${k}$.`,
          r`$f'(x) = ${poly([b, 2])} = ${k}$ gives $x = ${x0}$.`,
          r`The point is on the curve: $y = f(${x0}) = ${f(x0)}$, so it is $(${x0}, ${f(x0)})$.`,
        ],
      };
    },
  },
  {
    id: 'ca-02-10',
    difficulty: 3,
    keyConceptTag: 'Where a cubic decreases',
    correctOptionId: 'a',
    generate: (g) => {
      const a = g.int(1, 4);
      const c = g.int(-6, 6);
      const cs = [c, -3 * a * a, 0, 1];
      return {
        params: { cs, a },
        promptText: r`On which set is $f(x) = ${poly(cs)}$ decreasing?`,
        options: [
          { id: 'a', label: `$${-a} < x < ${a}$` },
          { id: 'b', label: `$x < ${-a}$ or $x > ${a}$`, trapExplanation: r`There $f'(x) > 0$: both brackets of $3(x - ${a})(x + ${a})$ have the same sign, so $f$ increases.` },
          { id: 'c', label: `$x < ${a}$`, trapExplanation: r`$f'$ has two zeros, $\pm ${a}$. For $x < ${-a}$ both brackets of $3(x - ${a})(x + ${a})$ are negative, so $f' > 0$ there.` },
          { id: 'd', label: `$0 < x < ${a}$`, trapExplanation: r`$f$ also decreases for negative $x$ down to $${-a}$: for example $f'(${dec(-a / 2)}) = ${dec(3 * (a / 2) ** 2 - 3 * a * a)} < 0$.` },
        ],
        stepByStepSolution: [
          r`$f'(x) = ${poly([-3 * a * a, 0, 3])} = 3(x - ${a})(x + ${a})$.`,
          r`Between $${-a}$ and $${a}$ the brackets have opposite signs, so $f' < 0$; outside they have the same sign, so $f' > 0$.`,
          r`$f$ decreases exactly on $${-a} < x < ${a}$.`,
        ],
      };
    },
  },
];
