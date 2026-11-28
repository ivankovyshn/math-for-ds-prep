import type { QuestionTemplate } from '../../../types.ts';
import { r } from '../define.ts';
import { allDistinct, dec, frac } from '../gen.ts';
import { approx } from './01-spaces.practice.ts';
import { RULE_CASES, ruleOptions, ruleQuestion } from './03-distributions.practice.ts';

export const practice: QuestionTemplate[] = [
  {
    id: 'pr-03b-1',
    difficulty: 1,
    keyConceptTag: 'The uniform density',
    correctOptionId: 'a',
    generate: (g) => {
      const [a, b] = g.pick([[0, 0.5], [0, 0.25], [1, 1.5], [2, 6], [1, 5], [0, 10], [3, 8], [2, 2.5], [5, 7]]);
      const L = b - a;
      return {
        params: { a, b },
        promptText: r`$X \sim \text{Uniform}(${dec(a)}, ${dec(b)})$. What is its density on that interval?`,
        options: [
          { id: 'a', label: `$${dec(1 / L)}$`, value: 1 / L },
          { id: 'b', label: `$${dec(L)}$`, value: L, trapExplanation: r`That is the length of the interval. The density times the length must give area 1.` },
          { id: 'c', label: '$0$', value: 0, trapExplanation: r`Each single value has probability 0, but the density — probability per unit length — is not 0 inside the interval.` },
          { id: 'd', label: '$1$', value: 1, trapExplanation: r`A density need not be 1; its <i>area</i> must be. Over a length of ${dec(L)} that takes a height of $${dec(1 / L)}$.` },
        ],
        stepByStepSolution: [
          r`The density is a constant $c$ on $[${dec(a)}, ${dec(b)}]$ and 0 elsewhere.`,
          r`Total area: $c\cdot(${dec(b)} - ${dec(a)}) = c\cdot ${dec(L)} = 1$.`,
          r`$c = \frac{1}{${dec(L)}} = ${dec(1 / L)}$${1 / L > 1 ? ' — more than 1, which is fine for a density' : ''}.`,
        ],
      };
    },
  },
  {
    id: 'pr-03b-2',
    difficulty: 1,
    keyConceptTag: 'Interval probabilities from the CDF',
    correctOptionId: 'a',
    generate: (g) => {
      const { a, b } = g.until(
        () => ({ a: g.int(1, 4), b: g.int(5, 9) }),
        ({ a, b }) => allDistinct([b * b - a * a, b * b, 10 * (b - a), (b - a) ** 2]),
      );
      const p = (x: number) => dec(x / 100);
      return {
        params: { a: a / 10, b: b / 10 },
        promptText: r`$X$ has the CDF $F(x) = x^2$ for $0 \le x \le 1$. What is $P(${dec(a / 10)} < X \le ${dec(b / 10)})$?`,
        options: [
          { id: 'a', label: `$${p(b * b - a * a)}$`, value: (b * b - a * a) / 100 },
          { id: 'b', label: `$${p(b * b)}$`, value: (b * b) / 100, trapExplanation: r`That is $F(${dec(b / 10)}) = P(X \le ${dec(b / 10)})$. The part up to ${dec(a / 10)} must be subtracted.` },
          { id: 'c', label: `$${p(10 * (b - a))}$`, value: (b - a) / 10, trapExplanation: r`Probability proportional to length holds for a uniform variable, whose CDF is $F(x) = x$. Here $F(x) = x^2$.` },
          { id: 'd', label: `$${p((b - a) ** 2)}$`, value: (b - a) ** 2 / 100, trapExplanation: r`$F(b) - F(a)$ is not $F(b - a)$: $${dec(b / 10)}^2 - ${dec(a / 10)}^2 \ne ${dec((b - a) / 10)}^2$.` },
        ],
        stepByStepSolution: [
          r`$P(a < X \le b) = F(b) - F(a)$.`,
          r`$F(${dec(b / 10)}) = ${p(b * b)}$ and $F(${dec(a / 10)}) = ${p(a * a)}$.`,
          r`$${p(b * b)} - ${p(a * a)} = ${p(b * b - a * a)}$.`,
        ],
      };
    },
  },
  {
    id: 'pr-03b-3',
    difficulty: 2,
    keyConceptTag: 'Mean waiting time and the rate',
    correctOptionId: 'a',
    generate: (g) => {
      const m = g.pick([2, 4, 5, 10]);
      const [p, q] = g.pick([[1, 2], [1, 1], [2, 1], [3, 1]]); // t / m
      const t = (m * p) / q;
      const ex = p === q ? '-1' : `-${frac(p, q)}`;
      const P = 1 - Math.exp(-p / q);
      return {
        params: { m, t },
        promptText: r`The wait for a support reply is exponential with mean ${m} minutes. What is the probability of waiting at most ${dec(t)} minutes?`,
        options: [
          { id: 'a', label: `$1 - e^{${ex}} ${approx(P)}$`, value: P },
          { id: 'b', label: `$e^{${ex}} ${approx(1 - P)}$`, value: 1 - P, trapExplanation: r`That is $P(X > ${dec(t)})$, waiting longer.` },
          { id: 'c', label: `$1 - e^{-${dec(m * t)}} ${approx(1 - Math.exp(-m * t))}$`, value: 1 - Math.exp(-m * t), trapExplanation: r`A mean of ${m} minutes is a rate of $\lambda = \frac{1}{${m}}$ per minute, not ${m}. With $\lambda = ${m}$ the wait would be very short.` },
          { id: 'd', label: `$\\tfrac{1}{${m}}e^{${ex}} ${approx(Math.exp(-p / q) / m)}$`, value: Math.exp(-p / q) / m, trapExplanation: r`That is the density at $t = ${dec(t)}$, not a probability. Integrate the density from 0 to ${dec(t)}.` },
        ],
        stepByStepSolution: [
          r`Mean ${m} minutes means rate $\lambda = \frac{1}{${m}}$ per minute.`,
          r`$P(X \le t) = 1 - e^{-\lambda t}$ with $\lambda t = \frac{${dec(t)}}{${m}} = ${dec(p / q)}$.`,
          r`$1 - e^{${ex}} ${approx(P)}$.`,
        ],
      };
    },
  },
  {
    id: 'pr-03b-4',
    difficulty: 2,
    keyConceptTag: 'The exponential distribution',
    correctOptionId: 'a',
    generate: (g) => {
      const lam = g.pick([0.5, 2, 3]);
      const t = g.int(1, 3);
      const lt = lam * t;
      const v = [Math.exp(-lt), 1 - Math.exp(-lt), lam * Math.exp(-lt), Math.exp(-t / lam)];
      return {
        params: { lam, t },
        promptText: r`The time $X$ (in minutes) until the next bus is exponential with rate $\lambda = ${lam}$ per minute. What is $P(X > ${t})$?`,
        options: [
          { id: 'a', label: `$e^{-${dec(lt)}} ${approx(v[0])}$`, value: v[0] },
          { id: 'b', label: `$1 - e^{-${dec(lt)}} ${approx(v[1])}$`, value: v[1], trapExplanation: r`That is $P(X \le ${t})$, the CDF. "Longer than ${t}" is the complement.` },
          { id: 'c', label: `$${dec(lam)}e^{-${dec(lt)}} ${approx(v[2])}$`, value: v[2], trapExplanation: r`That is the density $f(${t})$. A probability is an area: $\int_{${t}}^{\infty}\lambda e^{-\lambda x}dx$.` },
          { id: 'd', label: `$e^{-${dec(t / lam)}} ${approx(v[3])}$`, value: v[3], trapExplanation: r`That treats ${lam} as the mean waiting time. With rate $\lambda$, the mean is $\frac1\lambda = ${dec(1 / lam)}$.` },
        ],
        stepByStepSolution: [
          r`$P(X > t) = \int_t^\infty \lambda e^{-\lambda x}\,dx = e^{-\lambda t}$.`,
          r`$\lambda t = ${dec(lam)}\cdot${t} = ${dec(lt)}$.`,
          r`$P(X > ${t}) = e^{-${dec(lt)}} ${approx(v[0])}$.`,
        ],
      };
    },
  },
  {
    id: 'pr-03b-5',
    difficulty: 3,
    keyConceptTag: 'The 68–95–99.7 rule',
    correctOptionId: 'a',
    generate: (g) => {
      const c = g.pick(RULE_CASES);
      const m = g.pick([50, 60, 70, 100, 170, 500]);
      const s = g.pick([2, 4, 5, 10, 15, 20]);
      return {
        params: { m, s, lo: c.lo === -Infinity ? -1e9 : c.lo, hi: c.hi === Infinity ? 1e9 : c.hi },
        promptText: r`$X \sim N(${m}, ${s}^2)$. Approximately what is $${ruleQuestion(c, m, s)}$?`,
        options: ruleOptions(c),
        stepByStepSolution: [
          r`Standardise: ${[c.lo, c.hi].filter((z) => Number.isFinite(z)).map((z) => `$${m + z * s}$ is $\\mu ${z < 0 ? '-' : '+'} ${Math.abs(z) === 1 ? '' : Math.abs(z)}\\sigma$`).join(' and ')}.`,
          r`Within $1\sigma$: 68%, so each tail beyond $1\sigma$ holds 16%; within $2\sigma$: 95%, so each tail beyond $2\sigma$ holds 2.5%.`,
          r`So the probability is about ${c.ans}%.`,
        ],
      };
    },
  },
  {
    id: 'pr-03b-6',
    difficulty: 3,
    keyConceptTag: 'The uniform distribution',
    correctOptionId: 'a',
    generate: (g) => {
      const { a, b, c, d } = g.until(
        () => {
          const a = g.int(0, 5);
          const b = a + g.int(4, 10);
          const left = g.next() < 0.5;
          const c = left ? a - g.int(1, 3) : g.int(a + 1, b - 1);
          const d = left ? g.int(a + 1, b - 1) : b + g.int(1, 3);
          return { a, b, c, d };
        },
        ({ a, b, c, d }) => {
          const ov = Math.min(d, b) - Math.max(c, a);
          return allDistinct([ov / (b - a), (d - c) / (b - a), 1 / (b - a), (d - c) / b]);
        },
      );
      const lo = Math.max(c, a);
      const hi = Math.min(d, b);
      return {
        params: { a, b, c, d },
        promptText: r`$X \sim \text{Uniform}(${a}, ${b})$. What is $P(${c} \le X \le ${d})$?`,
        options: [
          { id: 'a', label: `$${frac(hi - lo, b - a)}$`, value: (hi - lo) / (b - a) },
          { id: 'b', label: `$${frac(d - c, b - a)}$`, value: (d - c) / (b - a), trapExplanation: r`$X$ never leaves $[${a}, ${b}]$: only the part of $[${c}, ${d}]$ inside it counts.` },
          { id: 'c', label: `$${frac(1, b - a)}$`, value: 1 / (b - a), trapExplanation: r`$\frac{1}{${b - a}}$ is the height of the density, not an area.` },
          { id: 'd', label: `$${frac(d - c, b)}$`, value: (d - c) / b, trapExplanation: r`Divide by the length of the whole range, $${b} - ${a} = ${b - a}$, and use only the overlap.` },
        ],
        stepByStepSolution: [
          r`The density is $\frac{1}{${b - a}}$ on $[${a}, ${b}]$ and 0 outside.`,
          r`$[${c}, ${d}] \cap [${a}, ${b}] = [${lo}, ${hi}]$, of length ${hi - lo}.`,
          r`$P = \frac{${hi - lo}}{${b - a}} = ${frac(hi - lo, b - a)}$.`,
        ],
      };
    },
  },
];
