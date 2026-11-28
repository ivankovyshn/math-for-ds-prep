import type { QuestionTemplate } from '../../../types.ts';
import { r } from '../define.ts';
import { allDistinct, frac, paren, poly } from '../gen.ts';

/** Extra practice (Practice 2): gentler questions on the same ideas, with new numbers every time. */
export const extra: QuestionTemplate[] = [
  {
    id: 'ca-02b-x1',
    difficulty: 2,
    keyConceptTag: 'The product rule',
    correctOptionId: 'a',
    generate: (g) => {
      const [p, q] = g.until(() => [g.nonzero(-5, 5), g.nonzero(-5, 5)], ([p, q]) => allDistinct([3 * p + q, 3 * q, 3 * p, p + q]));
      return {
        params: { p, q },
        promptText: r`$f(x) = x^3\,g(x)$, where $g(1) = ${p}$ and $g'(1) = ${q}$. What is $f'(1)$?`,
        options: [
          { id: 'a', label: `$${3 * p + q}$`, value: 3 * p + q },
          { id: 'b', label: `$${3 * q}$`, value: 3 * q, trapExplanation: r`$(uv)' \ne u'v'$: that multiplies the two derivatives, $3\cdot${paren(q)}$.` },
          { id: 'c', label: `$${3 * p}$`, value: 3 * p, trapExplanation: r`Only the first half, $u'v$. The product rule adds $uv' = 1^3\cdot${paren(q)}$.` },
          { id: 'd', label: `$${p + q}$`, value: p + q, trapExplanation: r`$(x^3)' = 3x^2$, which is 3 at $x = 1$, not 1.` },
        ],
        stepByStepSolution: [
          r`$u = x^3$, $u' = 3x^2$; $v = g(x)$, $v' = g'(x)$.`,
          r`$f'(1) = u'(1)\,g(1) + u(1)\,g'(1) = 3\cdot${paren(p)} + 1\cdot${paren(q)}$.`,
          r`$f'(1) = ${3 * p + q}$.`,
        ],
      };
    },
  },
  {
    id: 'ca-02b-x2',
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
    id: 'ca-02b-x3',
    difficulty: 1,
    keyConceptTag: 'The second derivative',
    correctOptionId: 'a',
    generate: (g) => {
      const n = g.int(3, 6);
      const c = g.pick([2, 3, 4, 5, -2, -3]);
      const mono = (k: number, e: number) => `${k}${e === 0 ? '' : e === 1 ? 'x' : `x^{${e}}`}`;
      return {
        params: { c, n },
        promptText: r`What is $f''(x)$ for $f(x) = ${c}x^{${n}}$?`,
        options: [
          { id: 'a', label: `$${mono(c * n * (n - 1), n - 2)}$`, value: [c * n * (n - 1), n - 2] },
          { id: 'b', label: `$${mono(c * n, n - 1)}$`, value: [c * n, n - 1], trapExplanation: r`That is $f'(x)$. Differentiate it once more.` },
          { id: 'c', label: `$${mono(c * n * n, n - 2)}$`, value: [c * n * n, n - 2], trapExplanation: r`The second time the exponent is $${n - 1}$, not $${n}$: the factors are $${n}$ and $${n - 1}$.` },
          { id: 'd', label: `$${mono(c * n * (n - 1), n - 1)}$`, value: [c * n * (n - 1), n - 1], trapExplanation: r`Each differentiation lowers the exponent by one, so after two it is $${n - 2}$.` },
        ],
        stepByStepSolution: [
          r`$f'(x) = ${c}\cdot${n}x^{${n - 1}} = ${mono(c * n, n - 1)}$.`,
          r`$f''(x) = ${c * n}\cdot${n - 1}x^{${n - 2}}$.`,
          r`$f''(x) = ${mono(c * n * (n - 1), n - 2)}$.`,
        ],
      };
    },
  },
  {
    id: 'ca-02b-x4',
    difficulty: 2,
    keyConceptTag: 'Second derivative test',
    correctOptionId: 'a',
    generate: (g) => {
      const k = g.nonzero(-3, 3);
      const a = g.nonzero(-4, 4);
      const c = g.int(-5, 5);
      const cs = [c, -2 * k * a, k];
      const kind = k > 0 ? 'minimum' : 'maximum';
      const other = k > 0 ? 'maximum' : 'minimum';
      const T = k > 0 ? 1 : -1;
      return {
        params: { cs },
        promptText: r`$f(x) = ${poly(cs)}$ has one critical point. What is it?`,
        options: [
          { id: 'a', label: `A local ${kind} at $x = ${a}$`, value: [T, a] },
          { id: 'b', label: `A local ${other} at $x = ${a}$`, value: [-T, a], trapExplanation: r`$f''(x) = ${2 * k}$ is ${k > 0 ? 'positive: the graph is a cup, so the point is a minimum' : 'negative: the graph is a cap, so the point is a maximum'}.` },
          { id: 'c', label: `A local ${kind} at $x = ${-a}$`, value: [T, -a], trapExplanation: r`Solve $f'(x) = ${poly([-2 * k * a, 2 * k])} = 0$: $x = ${a}$. The sign was lost.` },
          { id: 'd', label: `A local ${other} at $x = ${-a}$`, value: [-T, -a], trapExplanation: r`Both the place and the type are off: $f'(x) = 0$ at $x = ${a}$, and $f'' = ${2 * k}$ ${k > 0 ? 'is positive, which means a minimum' : 'is negative, which means a maximum'}.` },
        ],
        stepByStepSolution: [
          r`$f'(x) = ${poly([-2 * k * a, 2 * k])}$, which is 0 at $x = ${a}$.`,
          r`$f''(x) = ${2 * k}$, which is ${k > 0 ? 'positive' : 'negative'}.`,
          r`So $x = ${a}$ is a local ${kind}.`,
        ],
      };
    },
  },
  {
    id: 'ca-02b-x5',
    difficulty: 2,
    keyConceptTag: 'The quotient rule',
    correctOptionId: 'a',
    generate: (g) => {
      const { a, b } = g.until(
        () => ({ a: g.int(-5, 5), b: g.pick([-4, -3, -2, 2, 3, 4]) }),
        ({ a, b }) => a !== b && allDistinct([(b - a) / (b * b), 1, (a - b) / (b * b), (b - a) / b]),
      );
      const lin = (x: number) => (x === 0 ? 'x' : `x ${x < 0 ? '-' : '+'} ${Math.abs(x)}`);
      return {
        params: { a, b },
        promptText: r`Find $f'(0)$ for $f(x) = \dfrac{${lin(a)}}{${lin(b)}}$.`,
        options: [
          { id: 'a', label: `$${frac(b - a, b * b)}$`, value: (b - a) / (b * b) },
          { id: 'b', label: '$1$', value: 1, trapExplanation: r`$\big(\frac uv\big)' \ne \frac{u'}{v'}$: that is $\frac11$. Use $\frac{u'v - uv'}{v^2}$.` },
          { id: 'c', label: `$${frac(a - b, b * b)}$`, value: (a - b) / (b * b), trapExplanation: r`The numerator is $u'v - uv'$ in this order; swapping the two terms flips the sign.` },
          { id: 'd', label: `$${frac(b - a, b)}$`, value: (b - a) / b, trapExplanation: r`The denominator of the quotient rule is $v^2 = ${b * b}$ at $x = 0$, not $v = ${b}$.` },
        ],
        stepByStepSolution: [
          r`$u = ${lin(a)}$, $v = ${lin(b)}$, $u' = v' = 1$.`,
          r`$f'(x) = \dfrac{1\cdot(${lin(b)}) - (${lin(a)})\cdot 1}{(${lin(b)})^2}$.`,
          r`At $x = 0$: $\dfrac{${b} - ${paren(a)}}{${b * b}} = ${frac(b - a, b * b)}$.`,
        ],
      };
    },
  },
  {
    id: 'ca-02b-x6',
    difficulty: 2,
    keyConceptTag: 'The chain rule',
    correctOptionId: 'a',
    generate: (g) => {
      const { n, a } = g.until(
        () => ({ n: g.int(2, 4), a: g.int(1, 3) }),
        ({ n, a }) => allDistinct([2 * n * (1 + a) ** (n - 1), n * (1 + a) ** (n - 1), 2 * n * (1 + a) ** n, (1 + a) ** n]),
      );
      const right = 2 * n * (1 + a) ** (n - 1);
      const pw = n - 1 === 1 ? '' : `^{${n - 1}}`;
      return {
        params: { n, a },
        promptText: r`Find $f'(1)$ for $f(x) = (x^2 + ${a})^{${n}}$.`,
        options: [
          { id: 'a', label: `$${right}$`, value: right },
          { id: 'b', label: `$${n * (1 + a) ** (n - 1)}$`, value: n * (1 + a) ** (n - 1), trapExplanation: r`The inner derivative $(x^2 + ${a})' = 2x$, which is 2 at $x = 1$, is missing.` },
          { id: 'c', label: `$${2 * n * (1 + a) ** n}$`, value: 2 * n * (1 + a) ** n, trapExplanation: r`The outer derivative of $u^{${n}}$ is $${n}u${pw}$: the exponent drops by one.` },
          { id: 'd', label: `$${(1 + a) ** n}$`, value: (1 + a) ** n, trapExplanation: r`That is $f(1)$, the value of the function, not its slope.` },
        ],
        stepByStepSolution: [
          r`Outer $u^{${n}}$, inner $u = x^2 + ${a}$ with $u' = 2x$.`,
          r`$f'(x) = ${n}(x^2 + ${a})${pw}\cdot 2x$.`,
          r`At $x = 1$: $${n}\cdot ${1 + a}${pw}\cdot 2 = ${right}$.`,
        ],
      };
    },
  },
];
