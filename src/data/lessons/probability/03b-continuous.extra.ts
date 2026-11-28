import type { QuestionTemplate } from '../../../types.ts';
import { r } from '../define.ts';
import { allDistinct, dec, frac } from '../gen.ts';
import { RULE_CASES, ruleOptions, ruleQuestion } from './03-distributions.practice.ts';

/** Extra practice (Practice 2): gentler questions on the same ideas, with new numbers every time. */
export const extra: QuestionTemplate[] = [
  {
    id: 'pr-03b-x1',
    difficulty: 1,
    keyConceptTag: 'A single value has probability 0',
    correctOptionId: 'a',
    generate: (g) => {
      const a = g.int(0, 4);
      const b = a + g.pick([4, 5, 10]);
      const c = g.int(a + 2, b - 1);
      return {
        params: { a, b, c },
        promptText: r`$X \sim \text{Uniform}(${a}, ${b})$, a continuous variable. What is $P(X = ${c})$?`,
        options: [
          { id: 'a', label: '$0$', value: 0 },
          { id: 'b', label: `$${frac(1, b - a)}$`, value: 1 / (b - a), trapExplanation: r`That is the density, probability per unit length. A single point has length 0.` },
          { id: 'c', label: `$${frac(c - a, b - a)}$`, value: (c - a) / (b - a), trapExplanation: r`That is $P(X \le ${c})$, an interval.` },
          { id: 'd', label: `$${frac(1, b - a + 1)}$`, value: 1 / (b - a + 1), trapExplanation: r`That counts the whole numbers ${a}, …, ${b} as for a die. A continuous variable takes every value in between, so each single value gets probability 0.` },
        ],
        stepByStepSolution: [
          r`For a continuous variable, probabilities are areas under the density.`,
          r`The "interval" $[${c}, ${c}]$ has length 0, so the area above it is 0.`,
          r`$P(X = ${c}) = 0$; only intervals have positive probability.`,
        ],
      };
    },
  },
  {
    id: 'pr-03b-x2',
    difficulty: 1,
    keyConceptTag: 'Standardising',
    correctOptionId: 'a',
    generate: (g) => {
      const mu = g.pick([20, 50, 70, 100]);
      const s = g.pick([4, 5, 10, 15]);
      const z = g.pick([-2, -1.5, -1, 0.5, 1, 1.5, 2, 2.5]);
      const x = mu + z * s;
      return {
        params: { mu, s, x },
        promptText: r`$X \sim N(${mu}, ${s}^2)$. What is the $z$-value of $x = ${dec(x)}$?`,
        options: [
          { id: 'a', label: `$${dec(z)}$`, value: z },
          { id: 'b', label: `$${dec(z / s)}$`, value: z / s, trapExplanation: r`Divide by the standard deviation $\sigma = ${s}$, not by the variance $\sigma^2 = ${s * s}$.` },
          { id: 'c', label: `$${dec(-z)}$`, value: -z, trapExplanation: r`$z$ is positive above the mean and negative below it: $x - \mu = ${dec(z * s)}$.` },
          { id: 'd', label: `$${dec(z * s)}$`, value: z * s, trapExplanation: r`That is the distance in the original units. Divide by $\sigma = ${s}$ to count standard deviations.` },
        ],
        stepByStepSolution: [
          r`$z = \dfrac{x - \mu}{\sigma}$.`,
          r`$x - \mu = ${dec(x)} - ${mu} = ${dec(z * s)}$.`,
          r`$z = \frac{${dec(z * s)}}{${s}} = ${dec(z)}$.`,
        ],
      };
    },
  },
  {
    id: 'pr-03b-x3',
    difficulty: 2,
    keyConceptTag: 'The uniform distribution',
    correctOptionId: 'a',
    generate: (g) => {
      const { a, b, c, d } = g.until(
        () => {
          const a = g.int(0, 4);
          const b = a + g.int(4, 10);
          const c = g.int(a, b - 1);
          return { a, b, c, d: g.int(c + 1, b) };
        },
        ({ a, b, c, d }) => allDistinct([(d - c) / (b - a), 1 / (b - a), d - c, (d - c) / b]),
      );
      return {
        params: { a, b, c, d },
        promptText: r`$X \sim \text{Uniform}(${a}, ${b})$. What is $P(${c} \le X \le ${d})$?`,
        options: [
          { id: 'a', label: `$${frac(d - c, b - a)}$`, value: (d - c) / (b - a) },
          { id: 'b', label: `$${frac(1, b - a)}$`, value: 1 / (b - a), trapExplanation: r`That is the height of the density; multiply by the length ${d - c}.` },
          { id: 'c', label: `$${d - c}$`, value: d - c, trapExplanation: r`A length is not a probability: divide by the total length ${b - a}.` },
          { id: 'd', label: `$${frac(d - c, b)}$`, value: (d - c) / b, trapExplanation: r`The range is $[${a}, ${b}]$, of length ${b - a}, not ${b}.` },
        ],
        stepByStepSolution: [
          r`For a uniform variable, probability = length / total length.`,
          r`$\frac{${d} - ${c}}{${b} - ${a}} = \frac{${d - c}}{${b - a}}$.`,
          r`$= ${frac(d - c, b - a)}$.`,
        ],
      };
    },
  },
  {
    id: 'pr-03b-x4',
    difficulty: 2,
    keyConceptTag: 'The 68–95–99.7 rule',
    correctOptionId: 'a',
    generate: (g) => {
      const c = g.pick(RULE_CASES.filter((x) => Number.isFinite(x.lo) && Number.isFinite(x.hi)));
      const m = g.pick([20, 50, 100, 250]);
      const s = g.pick([3, 5, 10, 25]);
      return {
        params: { m, s, lo: c.lo, hi: c.hi },
        promptText: r`$X \sim N(${m}, ${s}^2)$. Approximately what is $${ruleQuestion(c, m, s)}$?`,
        options: ruleOptions(c),
        stepByStepSolution: [
          r`$${m + c.lo * s}$ and $${m + c.hi * s}$ are $\mu \pm ${c.hi === 1 ? '' : c.hi}\sigma$.`,
          r`The rule: about 68% within $1\sigma$, 95% within $2\sigma$, 99.7% within $3\sigma$.`,
          r`So about ${c.ans}%.`,
        ],
      };
    },
  },
  {
    id: 'pr-03b-x5',
    difficulty: 2,
    keyConceptTag: 'Normal tails',
    correctOptionId: 'a',
    generate: (g) => {
      const c = g.pick(RULE_CASES.filter((x) => !Number.isFinite(x.lo) || !Number.isFinite(x.hi)));
      const m = g.pick([20, 50, 100, 250]);
      const s = g.pick([3, 5, 10, 25]);
      const k = c.hi === Infinity ? c.lo : c.hi;
      return {
        params: { m, s, lo: c.lo, hi: c.hi },
        promptText: r`$X \sim N(${m}, ${s}^2)$. Approximately what is $${ruleQuestion(c, m, s)}$?`,
        options: ruleOptions(c),
        stepByStepSolution: [
          r`$${m + k * s}$ is $${Math.abs(k) === 1 ? '' : Math.abs(k)}\sigma$ ${k > 0 ? 'above' : 'below'} the mean.`,
          r`Within $1\sigma$ lie 68%, so 32% lie outside: 16% in each tail. Within $2\sigma$ lie 95%, so 2.5% in each tail.`,
          r`So about ${c.ans}%.`,
        ],
      };
    },
  },
  {
    id: 'pr-03b-x6',
    difficulty: 2,
    keyConceptTag: 'Mean waiting time and the rate',
    correctOptionId: 'a',
    generate: (g) => {
      const lam = g.pick([2, 3, 4, 5, 6, 10, 12]);
      return {
        params: { lam },
        promptText: r`Buses arrive as a Poisson stream, ${lam} per hour on average, so the wait for the next one is exponential with rate $\lambda = ${lam}$ per hour. What is the mean wait in minutes?`,
        options: [
          { id: 'a', label: `$${dec(60 / lam)}$`, value: 60 / lam },
          { id: 'b', label: `$${lam}$`, value: lam, trapExplanation: r`${lam} is the number of buses per hour. The mean wait is its reciprocal, $\frac{1}{${lam}}$ hour.` },
          { id: 'c', label: `$${frac(1, lam)}$`, value: 1 / lam, trapExplanation: r`$\frac{1}{${lam}}$ is the mean wait in <i>hours</i>. In minutes that is $\frac{60}{${lam}}$.` },
          { id: 'd', label: `$${60 * lam}$`, value: 60 * lam, trapExplanation: r`More buses per hour must mean a shorter wait, so divide by the rate, not multiply.` },
        ],
        stepByStepSolution: [
          r`For an exponential waiting time, $E[X] = \frac{1}{\lambda}$.`,
          r`$\frac{1}{${lam}}$ hour.`,
          r`In minutes: $\frac{60}{${lam}} = ${dec(60 / lam)}$.`,
        ],
      };
    },
  },
];
