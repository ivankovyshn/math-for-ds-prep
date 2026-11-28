import type { QuestionTemplate } from '../../../types.ts';
import { r } from '../define.ts';
import { allDistinct, coef, frac, paren, poly } from '../gen.ts';

/** Sigmoid values with small denominators (1/2 is left out: there p(1 − p) = p²). */
const PROBS = [[1, 4], [3, 4], [1, 5], [4, 5], [1, 3], [2, 3], [1, 10], [9, 10], [2, 5], [3, 5]];

export const practice: QuestionTemplate[] = [
  {
    id: 'ca-02b-1',
    difficulty: 1,
    keyConceptTag: 'The second derivative',
    correctOptionId: 'a',
    generate: (g) => {
      const { cs, x0 } = g.until(
        () => ({ cs: [g.int(-5, 5), g.int(-6, 6), g.nonzero(-4, 4), g.nonzero(-3, 3)], x0: g.nonzero(-3, 3) }),
        ({ cs: [, c1, c2, c3], x0 }) => allDistinct([6 * c3 * x0 + 2 * c2, 3 * c3 * x0 * x0 + 2 * c2 * x0 + c1, 3 * c3 * x0 + 2 * c2, 6 * c3 * x0]),
      );
      const [, c1, c2, c3] = cs;
      const d2 = 6 * c3 * x0 + 2 * c2;
      const d1 = 3 * c3 * x0 * x0 + 2 * c2 * x0 + c1;
      return {
        params: { cs, x0 },
        promptText: r`Find $f''(${x0})$ for $f(x) = ${poly(cs)}$.`,
        options: [
          { id: 'a', label: `$${d2}$`, value: d2 },
          { id: 'b', label: `$${d1}$`, value: d1, trapExplanation: r`That is $f'(${x0})$. The second derivative differentiates $f'(x) = ${poly([c1, 2 * c2, 3 * c3])}$ once more.` },
          { id: 'c', label: `$${3 * c3 * x0 + 2 * c2}$`, value: 3 * c3 * x0 + 2 * c2, trapExplanation: r`$(${coef(3 * c3)}x^2)' = ${6 * c3}x$: the exponent 2 comes down as a factor.` },
          { id: 'd', label: `$${6 * c3 * x0}$`, value: 6 * c3 * x0, trapExplanation: r`$(${coef(2 * c2)}x)' = ${2 * c2}$: the term that came from $${coef(c2)}x^2$ survives the second differentiation.` },
        ],
        stepByStepSolution: [
          r`$f'(x) = ${poly([c1, 2 * c2, 3 * c3])}$.`,
          r`$f''(x) = ${poly([2 * c2, 6 * c3])}$.`,
          r`$f''(${x0}) = ${6 * c3}\cdot${paren(x0)} ${2 * c2 < 0 ? '-' : '+'} ${Math.abs(2 * c2)} = ${d2}$.`,
        ],
      };
    },
  },
  {
    id: 'ca-02b-2',
    difficulty: 1,
    keyConceptTag: 'Chain rule with a linear inside',
    correctOptionId: 'a',
    generate: (g) => {
      const [c, k] = g.until(() => [g.nonzero(-5, 5), g.nonzero(-4, 4)], ([c, k]) => allDistinct([c * k, c, k, 0]));
      return {
        params: { c, k },
        promptText: r`Find $f'(0)$ for $f(x) = ${coef(c)}e^{${coef(k)}x}$.`,
        options: [
          { id: 'a', label: `$${c * k}$`, value: c * k },
          { id: 'b', label: `$${c}$`, value: c, trapExplanation: r`The inner derivative is missing: $(e^{${coef(k)}x})' = ${k}e^{${coef(k)}x}$, by the chain rule.` },
          { id: 'c', label: `$${k}$`, value: k, trapExplanation: r`The constant factor $${c}$ stays in front when differentiating.` },
          { id: 'd', label: '$0$', value: 0, trapExplanation: r`At $x = 0$ the exponent is 0, but $e^0 = 1$, not 0: $f'(0) = ${c}\cdot${paren(k)}\cdot e^0$.` },
        ],
        stepByStepSolution: [
          r`Outer $e^u$, inner $u = ${coef(k)}x$ with $u' = ${k}$.`,
          r`$f'(x) = ${coef(c)}e^{${coef(k)}x}\cdot ${paren(k)}$.`,
          r`$f'(0) = ${c}\cdot${paren(k)}\cdot e^0 = ${c * k}$.`,
        ],
      };
    },
  },
  {
    id: 'ca-02b-3',
    difficulty: 2,
    keyConceptTag: 'The product rule',
    correctOptionId: 'a',
    generate: (g) => {
      const { p, q, k } = g.until(
        () => ({ p: g.nonzero(-5, 5), q: g.nonzero(-5, 5), k: g.nonzero(-3, 3) }),
        ({ p, q, k }) => allDistinct([p + q * k, p * k, p, q * k]),
      );
      return {
        params: { p, q, k },
        promptText: r`Find $f'(0)$ for $f(x) = (${poly([q, p])})\,e^{${coef(k)}x}$.`,
        options: [
          { id: 'a', label: `$${p + q * k}$`, value: p + q * k },
          { id: 'b', label: `$${p * k}$`, value: p * k, trapExplanation: r`$(uv)' \ne u'v'$. The product rule is $u'v + uv'$.` },
          { id: 'c', label: `$${p}$`, value: p, trapExplanation: r`That is only $u'v$. The second term $uv' = (${poly([q, p])})\cdot ${k}e^{${coef(k)}x}$ gives $${q * k}$ at $x = 0$.` },
          { id: 'd', label: `$${q * k}$`, value: q * k, trapExplanation: r`That is only $uv'$; add $u'v = ${p}\cdot e^0 = ${p}$.` },
        ],
        stepByStepSolution: [
          r`$u = ${poly([q, p])}$, $u' = ${p}$; $v = e^{${coef(k)}x}$, $v' = ${k}e^{${coef(k)}x}$ (chain rule).`,
          r`$f'(x) = ${p}e^{${coef(k)}x} + (${poly([q, p])})\cdot${paren(k)}e^{${coef(k)}x}$.`,
          r`At $x = 0$, $e^0 = 1$: $f'(0) = ${p} + ${paren(q)}\cdot${paren(k)} = ${p + q * k}$.`,
        ],
      };
    },
  },
  {
    id: 'ca-02b-4',
    difficulty: 2,
    keyConceptTag: 'The chain rule',
    correctOptionId: 'a',
    generate: (g) => {
      const { p, q, n, a } = g.until(
        () => ({ p: g.pick([-3, -2, 2, 3]), q: g.int(-4, 4), n: g.int(2, 4), a: g.int(-2, 2) }),
        ({ p, q, n, a }) => {
          const u = p * a + q;
          return u !== 0 && Math.abs(u) <= 3 && allDistinct([n * p * u ** (n - 1), n * u ** (n - 1), u ** n, n * p * u ** n]);
        },
      );
      const u = p * a + q;
      return {
        params: { p, q, n, a },
        promptText: r`Find $f'(${a})$ for $f(x) = (${poly([q, p])})^{${n}}$.`,
        options: [
          { id: 'a', label: `$${n * p * u ** (n - 1)}$`, value: n * p * u ** (n - 1) },
          { id: 'b', label: `$${n * u ** (n - 1)}$`, value: n * u ** (n - 1), trapExplanation: r`The chain rule multiplies by the derivative of the inside, $(${poly([q, p])})' = ${p}$.` },
          { id: 'c', label: `$${u ** n}$`, value: u ** n, trapExplanation: r`That is $f(${a})$, the value, not the derivative.` },
          { id: 'd', label: `$${n * p * u ** n}$`, value: n * p * u ** n, trapExplanation: r`The power drops by one: $(u^{${n}})' = ${n}u^{${n - 1}}\,u'$.` },
        ],
        stepByStepSolution: [
          r`Outer $u^{${n}}$, inner $u = ${poly([q, p])}$ with $u' = ${p}$: $f'(x) = ${n}(${poly([q, p])})^{${n - 1}}\cdot${paren(p)}$.`,
          r`At $x = ${a}$: $u = ${u}$.`,
          r`$f'(${a}) = ${n}\cdot${paren(u)}^{${n - 1}}\cdot${paren(p)} = ${n * p * u ** (n - 1)}$.`,
        ],
      };
    },
  },
  {
    id: 'ca-02b-5',
    difficulty: 3,
    keyConceptTag: 'Finding a local minimum',
    correctOptionId: 'a',
    generate: (g) => {
      const { r1, r2, c0 } = g.until(
        () => ({ r1: g.int(-4, 3), r2: g.int(-3, 4), c0: g.int(-5, 5) }),
        ({ r1, r2 }) => r1 < r2 && (r1 + r2) % 2 === 0 && allDistinct([r2, r1, (r1 + r2) / 2, -r2]),
      );
      const B = (-3 * (r1 + r2)) / 2;
      const C = 3 * r1 * r2;
      const cs = [c0, C, B, 1];
      return {
        params: { cs },
        promptText: r`At which $x$ does $f(x) = ${poly(cs)}$ have a local minimum?`,
        options: [
          { id: 'a', label: `$x = ${r2}$`, value: r2 },
          { id: 'b', label: `$x = ${r1}$`, value: r1, trapExplanation: r`$f'(${r1}) = 0$ too, but $f''(${r1}) = ${6 * r1 + 2 * B} < 0$: that is a local <i>maximum</i>.` },
          { id: 'c', label: `$x = ${(r1 + r2) / 2}$`, value: (r1 + r2) / 2, trapExplanation: r`There $f''(x) = 0$: the inflection point, where the curve switches from bending down to bending up.` },
          { id: 'd', label: `$x = ${-r2}$`, value: -r2, trapExplanation: r`Sign slip when reading the root off a factor: $x - ${paren(r2)} = 0$ gives $x = ${r2}$.` },
        ],
        stepByStepSolution: [
          r`$f'(x) = ${poly([C, 2 * B, 3])} = 3(${poly([-r1, 1])})(${poly([-r2, 1])})$: critical points $x = ${r1}$ and $x = ${r2}$.`,
          r`$f''(x) = ${poly([2 * B, 6])}$: $f''(${r1}) = ${6 * r1 + 2 * B}$ and $f''(${r2}) = ${6 * r2 + 2 * B}$.`,
          r`$f''(${r2}) > 0$, so the local minimum is at $x = ${r2}$.`,
        ],
      };
    },
  },
  {
    id: 'ca-02b-6',
    difficulty: 3,
    keyConceptTag: 'Derivative of the sigmoid',
    correctOptionId: 'a',
    generate: (g) => {
      const [pn, pd] = g.pick(PROBS);
      const qn = pd - pn;
      return {
        params: { pn, pd },
        promptText: r`The sigmoid $\sigma(x) = \dfrac{1}{1 + e^{-x}}$ satisfies $\sigma(x_0) = ${frac(pn, pd)}$. What is $\sigma'(x_0)$?`,
        options: [
          { id: 'a', label: `$${frac(pn * qn, pd * pd)}$`, value: (pn * qn) / (pd * pd) },
          { id: 'b', label: `$${frac(pn, pd)}$`, value: pn / pd, trapExplanation: r`Only $e^x$ is its own derivative. For the sigmoid $\sigma' = \sigma(1 - \sigma)$.` },
          { id: 'c', label: `$${frac(qn, pd)}$`, value: qn / pd, trapExplanation: r`That is $1 - \sigma(x_0)$, only one of the two factors of $\sigma'$.` },
          { id: 'd', label: `$${frac(pn * pn, pd * pd)}$`, value: (pn * pn) / (pd * pd), trapExplanation: r`$\sigma^2$ comes from the quotient rule, but the full derivative simplifies to $\sigma(1 - \sigma)$.` },
        ],
        stepByStepSolution: [
          r`$\sigma'(x) = \dfrac{e^{-x}}{(1 + e^{-x})^2} = \dfrac{1}{1 + e^{-x}}\cdot\dfrac{e^{-x}}{1 + e^{-x}} = \sigma(x)\big(1 - \sigma(x)\big)$.`,
          r`$\sigma(x_0) = ${frac(pn, pd)}$ and $1 - \sigma(x_0) = ${frac(qn, pd)}$.`,
          r`$\sigma'(x_0) = ${frac(pn, pd)}\cdot${frac(qn, pd)} = ${frac(pn * qn, pd * pd)}$.`,
        ],
      };
    },
  },
];
