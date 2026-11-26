import type { QuestionTemplate } from '../../../types.ts';
import { r } from '../define.ts';
import { allDistinct, frac, paren, poly } from '../gen.ts';

/** Extra practice (Practice 2): gentler questions on the same ideas, with new numbers every time. */
export const extra: QuestionTemplate[] = [
  {
    id: 'ca-02-x1',
    difficulty: 1,
    keyConceptTag: 'Power rule',
    correctOptionId: 'a',
    generate: (g) => {
      const { c, n, a } = g.until(
        () => ({ c: g.pick([-3, -2, 2, 3, 4, 5]), n: g.int(2, 4), a: g.pick([-2, -1, 2, 3]) }),
        ({ c, n, a }) => allDistinct([c * n * a ** (n - 1), c * a ** n, c * n * a ** n, n * a ** (n - 1)]),
      );
      const cs = Array(n + 1).fill(0);
      cs[n] = c;
      return {
        params: { cs, a },
        promptText: r`Find $f'(${a})$ for $f(x) = ${poly(cs)}$.`,
        options: [
          { id: 'a', label: `$${c * n * a ** (n - 1)}$`, value: c * n * a ** (n - 1) },
          { id: 'b', label: `$${c * a ** n}$`, value: c * a ** n, trapExplanation: r`That is $f(${a})$, the value of the function.` },
          { id: 'c', label: `$${c * n * a ** n}$`, value: c * n * a ** n, trapExplanation: r`The exponent drops by one: $(x^{${n}})' = ${n}x^{${n - 1}}$.` },
          { id: 'd', label: `$${n * a ** (n - 1)}$`, value: n * a ** (n - 1), trapExplanation: r`The constant factor ${c} stays in front: $(${c}x^{${n}})' = ${c * n}x^{${n - 1}}$.` },
        ],
        stepByStepSolution: [
          r`$(cx^n)' = cnx^{n-1}$, so $f'(x) = ${poly([...Array(n - 1).fill(0), c * n])}$.`,
          r`$f'(${a}) = ${c * n}\cdot${paren(a)}^{${n - 1}}$.`,
          r`$= ${c * n * a ** (n - 1)}$.`,
        ],
      };
    },
  },
  {
    id: 'ca-02-x2',
    difficulty: 1,
    keyConceptTag: 'Derivative of a polynomial',
    correctOptionId: 'a',
    generate: (g) => {
      const { p, q, c } = g.until(
        () => ({ p: g.nonzero(-5, 6), q: g.nonzero(-7, 7), c: g.nonzero(-9, 9) }),
        ({ p, q, c }) => Math.abs(p) !== 1 && allDistinct([[q, 2 * p], [q + c, 2 * p], [q, p], [0, 2 * p]]),
      );
      return {
        params: { cs: [c, q, p] },
        promptText: r`What is $f'(x)$ for $f(x) = ${poly([c, q, p])}$?`,
        options: [
          { id: 'a', label: `$${poly([q, 2 * p])}$`, value: [q, 2 * p] },
          { id: 'b', label: `$${poly([q, 2 * p])} ${c < 0 ? '-' : '+'} ${Math.abs(c)}$`, value: [q + c, 2 * p], trapExplanation: r`The constant ${c} does not change, so its derivative is 0.` },
          { id: 'c', label: `$${poly([q, p])}$`, value: [q, p], trapExplanation: r`$(x^2)' = 2x$: the exponent comes down as a factor, so $(${p}x^2)' = ${2 * p}x$.` },
          { id: 'd', label: `$${poly([0, 2 * p])}$`, value: [0, 2 * p], trapExplanation: r`The derivative of $${poly([0, q])}$ is the constant $${q}$, not 0.` },
        ],
        stepByStepSolution: [
          r`Differentiate term by term: $(${p}x^2)' = ${2 * p}x$, $(${poly([0, q])})' = ${q}$, $(${c})' = 0$.`,
          r`Add them up.`,
          r`$f'(x) = ${poly([q, 2 * p])}$.`,
        ],
      };
    },
  },
  {
    id: 'ca-02-x3',
    difficulty: 1,
    keyConceptTag: 'Average rate of change',
    correctOptionId: 'a',
    generate: (g) => {
      const { p, a, b } = g.until(
        () => ({ p: g.nonzero(-3, 3), a: g.int(-3, 2), b: g.int(-1, 5) }),
        ({ p, a, b }) => b - a >= 2 && allDistinct([p * (a + b), p * (b * b - a * a), 2 * p * a, 2 * p * b]),
      );
      return {
        params: { cs: [0, 0, p], a, b },
        promptText: r`What is the average rate of change of $f(x) = ${poly([0, 0, p])}$ between $x = ${a}$ and $x = ${b}$?`,
        options: [
          { id: 'a', label: `$${p * (a + b)}$`, value: p * (a + b) },
          { id: 'b', label: `$${p * (b * b - a * a)}$`, value: p * (b * b - a * a), trapExplanation: r`That is the change in $f$. A rate divides by the change in $x$, here ${b - a}.` },
          { id: 'c', label: `$${2 * p * a}$`, value: 2 * p * a, trapExplanation: r`That is $f'(${a})$, the instantaneous rate at the left end.` },
          { id: 'd', label: `$${2 * p * b}$`, value: 2 * p * b, trapExplanation: r`That is $f'(${b})$, the instantaneous rate at the right end.` },
        ],
        stepByStepSolution: [
          r`Average rate $= \dfrac{f(${b}) - f(${a})}{${b} - ${paren(a)}}$.`,
          r`$= \dfrac{${p * b * b} - ${paren(p * a * a)}}{${b - a}} = \dfrac{${p * (b * b - a * a)}}{${b - a}}$.`,
          r`$= ${p * (a + b)}$.`,
        ],
      };
    },
  },
  {
    id: 'ca-02-x4',
    difficulty: 2,
    keyConceptTag: 'Derivative of the logarithm',
    correctOptionId: 'a',
    generate: (g) => {
      const { p, q, a } = g.until(
        () => ({ p: g.pick([-3, -2, 2, 3, 4]), q: g.int(-3, 9), a: g.int(-2, 3) }),
        ({ p, q, a }) => {
          const u = p * a + q;
          return u > 0 && allDistinct([p / u, 1 / u, p, u / p]);
        },
      );
      const u = p * a + q;
      return {
        params: { p, q, a },
        promptText: r`Find $f'(${a})$ for $f(x) = \ln(${poly([q, p])})$.`,
        options: [
          { id: 'a', label: `$${frac(p, u)}$`, value: p / u },
          { id: 'b', label: `$${frac(1, u)}$`, value: 1 / u, trapExplanation: r`Chain rule: multiply $\frac1u$ by the derivative of the inside, ${p}.` },
          { id: 'c', label: `$${p}$`, value: p, trapExplanation: r`That is only the inner derivative. The outer one, $\frac{1}{u}$, contributes $\frac{1}{${u}}$.` },
          { id: 'd', label: `$${frac(u, p)}$`, value: u / p, trapExplanation: r`Upside down: $(\ln u)' = \frac{u'}{u}$.` },
        ],
        stepByStepSolution: [
          r`$(\ln u)' = \dfrac{u'}{u}$ with $u = ${poly([q, p])}$, $u' = ${p}$.`,
          r`At $x = ${a}$: $u = ${u}$.`,
          r`$f'(${a}) = ${frac(p, u)}$.`,
        ],
      };
    },
  },
  {
    id: 'ca-02-x5',
    difficulty: 2,
    keyConceptTag: 'Slope of the tangent',
    correctOptionId: 'a',
    generate: (g) => {
      const { q, a } = g.until(
        () => ({ q: g.nonzero(-6, 6), a: g.nonzero(-3, 3) }),
        ({ q, a }) => allDistinct([3 * a * a + q, a ** 3 + q * a, 3 * a + q, 3 * a * a]),
      );
      return {
        params: { cs: [0, q, 0, 1], a },
        promptText: r`What is the slope of the tangent to $f(x) = ${poly([0, q, 0, 1])}$ at $x = ${a}$?`,
        options: [
          { id: 'a', label: `$${3 * a * a + q}$`, value: 3 * a * a + q },
          { id: 'b', label: `$${a ** 3 + q * a}$`, value: a ** 3 + q * a, trapExplanation: r`That is $f(${a})$, the height of the point, not the slope.` },
          { id: 'c', label: `$${3 * a + q}$`, value: 3 * a + q, trapExplanation: r`$(x^3)' = 3x^2$: square $${a}$ before multiplying by 3.` },
          { id: 'd', label: `$${3 * a * a}$`, value: 3 * a * a, trapExplanation: r`The term $${poly([0, q])}$ contributes ${q} to the slope.` },
        ],
        stepByStepSolution: [
          r`The slope of the tangent is $f'(${a})$.`,
          r`$f'(x) = ${poly([q, 0, 3])}$.`,
          r`$f'(${a}) = 3\cdot${a * a} + ${paren(q)} = ${3 * a * a + q}$.`,
        ],
      };
    },
  },
  {
    id: 'ca-02-x6',
    difficulty: 2,
    keyConceptTag: 'Increasing and decreasing',
    correctOptionId: 'a',
    generate: (g) => {
      const s = g.nonzero(-4, 4);
      const c = g.int(-5, 5);
      const cs = [c, -2 * s, 1];
      return {
        params: { cs, a: [-1, s], b: [1, s], c: [-1, -s], d: [-1, 2 * s] },
        promptText: r`On which interval is $f(x) = ${poly(cs)}$ decreasing?`,
        options: [
          { id: 'a', label: `$x < ${s}$` },
          { id: 'b', label: `$x > ${s}$`, trapExplanation: r`For $x > ${s}$, $f'(x) = 2(x - ${paren(s)}) > 0$: $f$ increases there.` },
          { id: 'c', label: `$x < ${-s}$`, trapExplanation: r`$f'(x) = ${poly([-2 * s, 2])}$ is zero at $x = ${s}$, not at $${-s}$.` },
          { id: 'd', label: `$x < ${2 * s}$`, trapExplanation: r`Solve $f'(x) = ${poly([-2 * s, 2])} < 0$: divide by 2 as well, giving $x < ${s}$.` },
        ],
        stepByStepSolution: [
          r`$f'(x) = ${poly([-2 * s, 2])} = 2(x - ${paren(s)})$.`,
          r`$f'(x) < 0$ exactly when $x < ${s}$.`,
          r`So $f$ decreases on $x < ${s}$ and increases on $x > ${s}$ (the vertex of the parabola).`,
        ],
      };
    },
  },
];
