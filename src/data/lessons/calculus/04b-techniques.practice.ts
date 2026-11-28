import type { QuestionTemplate } from '../../../types.ts';
import { r } from '../define.ts';
import { allDistinct, frac, poly } from '../gen.ts';

export const practice: QuestionTemplate[] = [
  {
    id: 'ca-04b-1',
    difficulty: 1,
    keyConceptTag: 'Substitution with a linear inside',
    correctOptionId: 'a',
    generate: (g) => {
      const k = g.int(2, 5);
      const fnId = g.int(0, 1); // 0: cos, 1: sin
      const c = frac(1, k);
      const [f, F] = fnId === 0 ? ['\\cos', '\\sin'] : ['\\sin', '\\cos'];
      const s = fnId === 0 ? '' : '-';
      const t = fnId === 0 ? '-' : '';
      return {
        params: { k, fnId },
        promptText: r`Find $\displaystyle\int ${f}(${k}x)\,dx$.`,
        options: [
          { id: 'a', label: `$${s}${c}${F}(${k}x) + C$` },
          { id: 'b', label: `$${s}${k}${F}(${k}x) + C$`, trapExplanation: r`Differentiating that gives $${k * k}$ times the integrand. Integration divides by the inner factor ${k}; differentiation multiplies.` },
          { id: 'c', label: `$${t}${c}${F}(${k}x) + C$`, trapExplanation: fnId === 0 ? r`$\int\cos u\,du = +\sin u$. The minus belongs to $\int\sin u\,du = -\cos u$.` : r`$\int\sin u\,du = -\cos u$: differentiating $\cos$ gives $-\sin$, so the minus is needed.` },
          { id: 'd', label: `$${s}${F}(${k}x) + C$`, trapExplanation: r`Differentiating that gives an extra factor ${k} from the chain rule. Divide by ${k} to cancel it.` },
        ],
        stepByStepSolution: [
          r`Substitute $u = ${k}x$: $du = ${k}\,dx$, so $dx = \frac{du}{${k}}$.`,
          r`$\int ${f} u\,\frac{du}{${k}} = ${c}\int ${f} u\,du = ${s}${c}${F} u + C$.`,
          r`Back to $x$: $${s}${c}${F}(${k}x) + C$. Check: its derivative is $${f}(${k}x)$. ✓`,
        ],
      };
    },
  },
  {
    id: 'ca-04b-2',
    difficulty: 1,
    keyConceptTag: 'An integral over an infinite interval',
    correctOptionId: 'a',
    generate: (g) => {
      const k = g.int(2, 6);
      return {
        params: { k },
        promptText: r`Compute $\displaystyle\int_0^{\infty} e^{-${k}x}\,dx$.`,
        options: [
          { id: 'a', label: `$${frac(1, k)}$`, value: 1 / k },
          { id: 'b', label: 'It diverges', trapExplanation: r`An infinitely long region can have finite area: $e^{-${k}x}$ shrinks so fast that the integrals up to $b$ approach a limit.` },
          { id: 'c', label: `$${k}$`, value: k, trapExplanation: r`Integrating $e^{-${k}x}$ divides by $-${k}$; it does not multiply.` },
          { id: 'd', label: '$1$', value: 1, trapExplanation: r`The antiderivative is $-\frac{1}{${k}}e^{-${k}x}$: the factor $\frac{1}{${k}}$ stays in the answer.` },
        ],
        stepByStepSolution: [
          r`$\int_0^b e^{-${k}x}\,dx = \Big[-\tfrac{1}{${k}}e^{-${k}x}\Big]_0^b = \tfrac{1}{${k}} - \tfrac{1}{${k}}e^{-${k}b}$.`,
          r`As $b \to \infty$, $e^{-${k}b} \to 0$.`,
          r`The integral converges to $${frac(1, k)}$.`,
        ],
      };
    },
  },
  {
    id: 'ca-04b-3',
    difficulty: 2,
    keyConceptTag: 'Integration by parts',
    correctOptionId: 'a',
    generate: (g) => {
      const k = g.int(1, 3);
      const E = k === 1 ? 'e^{x}' : `e^{${k}x}`;
      const c1 = k === 1 ? '' : frac(1, k);
      const c2 = k === 1 ? '' : frac(1, k * k);
      return {
        params: { k },
        promptText: r`Find $\displaystyle\int x\,${E}\,dx$.`,
        options: [
          { id: 'a', label: `$${c1}x\\,${E} - ${c2}${E} + C$` },
          { id: 'b', label: `$${c1}x\\,${E} + C$`, trapExplanation: r`That is only $uv$. The formula subtracts $\int v\,du = \int ${c1}${E}\,dx$ as well.` },
          { id: 'c', label: `$\\tfrac{x^2}{${2 * k}}${E} + C$`, trapExplanation: r`The two factors cannot be integrated separately: $\int uv \ne \int u\cdot\int v$. Differentiate this answer to see it fail.` },
          { id: 'd', label: `$${c1}x\\,${E} + ${c2}${E} + C$`, trapExplanation: r`The sign: $\int u\,dv = uv - \int v\,du$. Differentiating this answer gives an extra $${k === 1 ? '2' : frac(2, k)}${E}$.` },
        ],
        stepByStepSolution: [
          r`$u = x$, $dv = ${E}\,dx$: then $du = dx$ and $v = ${c1}${E}$.`,
          r`$\int x\,${E}\,dx = ${c1}x\,${E} - \int ${c1}${E}\,dx$.`,
          r`$= ${c1}x\,${E} - ${c2}${E} + C$. Check: the derivative is $${c1 ? `${c1}${E} + x\\,${E} - ${c1}${E}` : `${E} + x\\,${E} - ${E}`} = x\,${E}$. ✓`,
        ],
      };
    },
  },
  {
    id: 'ca-04b-4',
    difficulty: 2,
    keyConceptTag: 'Probability as an area',
    correctOptionId: 'a',
    generate: (g) => {
      const { n, d } = g.until(
        () => ({ n: g.int(1, 4), d: g.int(2, 3) }),
        ({ n, d }) => allDistinct([1 / d ** (n + 1), (n + 1) / d ** n, 1 / d, 1 - 1 / d ** (n + 1)]),
      );
      const pw = n === 1 ? 'x' : `x^{${n}}`;
      return {
        params: { n, d },
        promptText: r`$X$ has density $p(x) = ${n + 1}${pw}$ on $[0, 1]$. What is $P(X \le ${frac(1, d)})$?`,
        options: [
          { id: 'a', label: `$${frac(1, d ** (n + 1))}$`, value: 1 / d ** (n + 1) },
          { id: 'b', label: `$${frac(n + 1, d ** n)}$`, value: (n + 1) / d ** n, trapExplanation: r`That is the density at $${frac(1, d)}$. A density is not a probability; the probability is the area under it.` },
          { id: 'c', label: `$${frac(1, d)}$`, value: 1 / d, trapExplanation: r`That would hold for the uniform density $p(x) = 1$. This density puts more weight near 1.` },
          { id: 'd', label: `$${frac(d ** (n + 1) - 1, d ** (n + 1))}$`, value: 1 - 1 / d ** (n + 1), trapExplanation: r`That is $P(X > ${frac(1, d)})$, the area to the right.` },
        ],
        stepByStepSolution: [
          r`$P(X \le ${frac(1, d)}) = \int_0^{1/${d}} ${n + 1}${pw}\,dx$.`,
          r`An antiderivative of $${n + 1}${pw}$ is $x^{${n + 1}}$.`,
          r`$\big(${frac(1, d)}\big)^{${n + 1}} - 0 = ${frac(1, d ** (n + 1))}$.`,
        ],
      };
    },
  },
  {
    id: 'ca-04b-5',
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
    id: 'ca-04b-6',
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
