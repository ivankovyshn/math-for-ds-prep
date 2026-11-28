import type { QuestionTemplate } from '../../../types.ts';
import { r } from '../define.ts';
import { frac } from '../gen.ts';

/** Extra practice (Practice 2): gentler questions on the same ideas, with new numbers every time. */
export const extra: QuestionTemplate[] = [
  {
    id: 'ca-04b-x1',
    difficulty: 1,
    keyConceptTag: 'Substitution',
    correctOptionId: 'a',
    generate: (g) => {
      const c = g.int(1, 5);
      const n = g.int(2, 4);
      const inner = `(x^2 + ${c})`;
      return {
        params: { c, n },
        promptText: r`Find $\displaystyle\int 2x\,${inner}^{${n}}\,dx$.`,
        options: [
          { id: 'a', label: `$\\dfrac{${inner}^{${n + 1}}}{${n + 1}} + C$` },
          { id: 'b', label: `$${inner}^{${n + 1}} + C$`, trapExplanation: r`Differentiating gives $${n + 1}${inner}^{${n}}\cdot 2x$: divide by ${n + 1}.` },
          { id: 'c', label: `$x^2\\,\\dfrac{${inner}^{${n + 1}}}{${n + 1}} + C$`, trapExplanation: r`With $u = x^2 + ${c}$, the factor $2x\,dx$ is exactly $du$: it is used up, not integrated separately into $x^2$.` },
          { id: 'd', label: `$${2 * n}x\\,${inner}${n - 1 === 1 ? '' : `^{${n - 1}}`} + C$`, trapExplanation: r`That is the derivative of $${inner}^{${n}}$: the opposite direction.` },
        ],
        stepByStepSolution: [
          r`Substitute $u = x^2 + ${c}$: $du = 2x\,dx$, which is exactly the factor in front.`,
          r`$\int u^{${n}}\,du = \frac{u^{${n + 1}}}{${n + 1}} + C$.`,
          r`Back to $x$: $\dfrac{${inner}^{${n + 1}}}{${n + 1}} + C$.`,
        ],
      };
    },
  },
  {
    id: 'ca-04b-x2',
    difficulty: 1,
    keyConceptTag: 'Improper integral of a power',
    correctOptionId: 'a',
    generate: (g) => {
      const p = g.int(2, 5);
      return {
        params: { p },
        promptText: r`Compute $\displaystyle\int_1^{\infty} x^{-${p}}\,dx$.`,
        options: [
          { id: 'a', label: `$${frac(1, p - 1)}$`, value: 1 / (p - 1) },
          { id: 'b', label: 'It diverges', trapExplanation: r`$\int_1^\infty x^{-p}\,dx$ diverges only for $p \le 1$. Here $p = ${p}$: the tail shrinks fast enough.` },
          { id: 'c', label: `$${frac(1, p)}$`, value: 1 / p, trapExplanation: r`The antiderivative of $x^{-${p}}$ is $\frac{x^{${1 - p}}}{${1 - p}}$: the exponent goes up by one, so divide by $${p - 1}$.` },
          { id: 'd', label: `$${frac(1, p + 1)}$`, value: 1 / (p + 1), trapExplanation: r`Integration raises the exponent: $-${p} + 1 = ${1 - p}$, not $-${p + 1}$.` },
        ],
        stepByStepSolution: [
          r`$\int_1^b x^{-${p}}\,dx = \Big[\frac{x^{${1 - p}}}{${1 - p}}\Big]_1^b = \frac{1}{${p - 1}}\Big(1 - \frac{1}{b^{${p - 1}}}\Big)$.`,
          r`As $b \to \infty$ the bracket tends to 1.`,
          r`The integral converges to $${frac(1, p - 1)}$.`,
        ],
      };
    },
  },
  {
    id: 'ca-04b-x3',
    difficulty: 2,
    keyConceptTag: 'Integration by parts',
    correctOptionId: 'a',
    generate: (g) => {
      const c = g.int(1, 3);
      const e = (k: number, m: number) => {
        const base = c === 1 ? 'e' : `e^{${c}}`;
        const lead = k === 0 ? '' : `${k === 1 ? '' : k}${base}`;
        if (m === 0) return lead || '0';
        if (!lead) return `${m}`;
        return `${lead} ${m < 0 ? '-' : '+'} ${Math.abs(m)}`;
      };
      const E = Math.exp(c);
      const half = c * c;
      const sep = c === 1 ? r`\tfrac12(e - 1)` : r`${frac(half, 2)}(e^{${c}} - 1)`;
      return {
        params: { c },
        promptText: r`Compute $\displaystyle\int_0^{${c}} x\,e^x\,dx$.`,
        options: [
          { id: 'a', label: `$${e(c - 1, 1)}$`, value: (c - 1) * E + 1 },
          { id: 'b', label: `$${e(c, 0)}$`, value: c * E, trapExplanation: r`That is only $[uv]_0^{${c}}$. Integration by parts also subtracts $\int_0^{${c}} e^x\,dx = ${c === 1 ? 'e' : `e^{${c}}`} - 1$.` },
          { id: 'c', label: `$${sep}$`, value: (half / 2) * (E - 1), trapExplanation: r`$\int x\,e^x\,dx$ is not $\int x\,dx\cdot\int e^x\,dx$: a product needs the parts formula.` },
          { id: 'd', label: `$${e(c + 1, -1)}$`, value: (c + 1) * E - 1, trapExplanation: r`The sign: $\int u\,dv = uv - \int v\,du$, so $\int_0^{${c}} e^x\,dx$ is subtracted, not added.` },
        ],
        stepByStepSolution: [
          r`$u = x$, $dv = e^x\,dx$: $\int_0^{${c}} x e^x\,dx = \big[x e^x\big]_0^{${c}} - \int_0^{${c}} e^x\,dx$.`,
          r`$= ${e(c, 0)} - (${c === 1 ? 'e' : `e^{${c}}`} - 1)$.`,
          r`$= ${e(c - 1, 1)}$.`,
        ],
      };
    },
  },
  {
    id: 'ca-04b-x4',
    difficulty: 2,
    keyConceptTag: 'A density has total area 1',
    correctOptionId: 'a',
    generate: (g) => {
      const n = g.int(2, 5);
      return {
        params: { n },
        promptText: r`For which $k$ is $p(x) = k\,x^{${n}}$ a probability density on $[0, 1]$?`,
        options: [
          { id: 'a', label: `$k = ${n + 1}$`, value: n + 1 },
          { id: 'b', label: `$k = ${frac(1, n + 1)}$`, value: 1 / (n + 1), trapExplanation: r`$\int_0^1 x^{${n}}\,dx = ${frac(1, n + 1)}$, and $k$ must undo it: $k\cdot${frac(1, n + 1)} = 1$.` },
          { id: 'c', label: `$k = ${n}$`, value: n, trapExplanation: r`The antiderivative of $x^{${n}}$ is $\frac{x^{${n + 1}}}{${n + 1}}$: the new exponent ${n + 1}, not ${n}, goes in the denominator.` },
          { id: 'd', label: '$k = 1$', value: 1, trapExplanation: r`$x^{${n}}$ alone has area $${frac(1, n + 1)}$ on $[0, 1]$, not 1.` },
        ],
        stepByStepSolution: [
          r`A density must have total area 1: $\int_0^1 k\,x^{${n}}\,dx = 1$.`,
          r`$\int_0^1 x^{${n}}\,dx = \Big[\frac{x^{${n + 1}}}{${n + 1}}\Big]_0^1 = ${frac(1, n + 1)}$.`,
          r`$k\cdot ${frac(1, n + 1)} = 1$ gives $k = ${n + 1}$.`,
        ],
      };
    },
  },
  {
    id: 'ca-04b-x5',
    difficulty: 2,
    keyConceptTag: 'Substitution with new limits',
    correctOptionId: 'a',
    generate: (g) => {
      const [l, a] = g.pick([[0, 2], [0, 3], [1, 2], [1, 3]]);
      const ex = (v: number) => (v === 0 ? '1' : v === 1 ? 'e' : `e^{${v}}`);
      const diff = (hi: number, lo: number) => `${ex(hi)} - ${ex(lo)}`;
      return {
        params: { l, a },
        promptText: r`Compute $\displaystyle\int_{${l}}^{${a}} 2x\,e^{x^2}\,dx$.`,
        options: [
          { id: 'a', label: `$${diff(a * a, l * l)}$`, value: Math.exp(a * a) - Math.exp(l * l) },
          { id: 'b', label: `$${ex(a * a)}$`, value: Math.exp(a * a), trapExplanation: r`The lower limit contributes too: $e^u$ at $u = ${l * l}$ is $${ex(l * l)}$, not 0.` },
          { id: 'c', label: `$${diff(a, l)}$`, value: Math.exp(a) - Math.exp(l), trapExplanation: r`With $u = x^2$ the limits change as well: $u$ runs from $${l * l}$ to $${a * a}$.` },
          { id: 'd', label: `$2(${diff(a * a, l * l)})$`, value: 2 * (Math.exp(a * a) - Math.exp(l * l)), trapExplanation: r`$du = 2x\,dx$ already contains the factor 2; it is not counted twice.` },
        ],
        stepByStepSolution: [
          r`$u = x^2$, $du = 2x\,dx$. New limits: $x = ${l} \to u = ${l * l}$, $x = ${a} \to u = ${a * a}$.`,
          r`$\int_{${l * l}}^{${a * a}} e^u\,du = \big[e^u\big]_{${l * l}}^{${a * a}}$.`,
          r`$= ${diff(a * a, l * l)}$.`,
        ],
      };
    },
  },
  {
    id: 'ca-04b-x6',
    difficulty: 2,
    keyConceptTag: 'The exponential distribution',
    correctOptionId: 'a',
    generate: (g) => {
      const lam = g.int(2, 3);
      const t = g.int(1, 3);
      return {
        params: { lam, t },
        promptText: r`A waiting time $X$ has density $p(x) = ${lam}e^{-${lam}x}$ for $x \ge 0$. What is $P(X > ${t})$?`,
        options: [
          { id: 'a', label: `$e^{-${lam * t}}$`, value: Math.exp(-lam * t) },
          { id: 'b', label: `$${lam}e^{-${lam * t}}$`, value: lam * Math.exp(-lam * t), trapExplanation: r`That is the density at $x = ${t}$. The probability is the area under the density to the right of ${t}.` },
          { id: 'c', label: `$1 - e^{-${lam * t}}$`, value: 1 - Math.exp(-lam * t), trapExplanation: r`That is $P(X \le ${t})$, the area to the left.` },
          { id: 'd', label: `$e^{-${frac(t, lam)}}$`, value: Math.exp(-t / lam), trapExplanation: r`The rate multiplies the time: the exponent is $-${lam}\cdot ${t}$.` },
        ],
        stepByStepSolution: [
          r`$P(X > ${t}) = \int_{${t}}^{\infty} ${lam}e^{-${lam}x}\,dx$.`,
          r`An antiderivative is $-e^{-${lam}x}$, which tends to 0 as $x \to \infty$.`,
          r`$0 - (-e^{-${lam * t}}) = e^{-${lam * t}}$.`,
        ],
      };
    },
  },
];
