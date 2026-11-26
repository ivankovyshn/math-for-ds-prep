import type { QuestionTemplate } from '../../../types.ts';
import { r } from '../define.ts';
import { allDistinct, binomial, dec, frac } from '../gen.ts';
import { approx } from './01-spaces.practice.ts';
import { RULE_CASES, pmfTable, ruleOptions, ruleQuestion, tenths } from './03-distributions.practice.ts';

/** Extra practice (Practice 2): gentler questions on the same ideas, with new numbers every time. */
export const extra: QuestionTemplate[] = [
  {
    id: 'pr-03-x1',
    difficulty: 1,
    keyConceptTag: 'Probabilities add up to 1',
    correctOptionId: 'a',
    generate: (g) => {
      const ps = g.until(() => tenths(g, 4), (ps) => allDistinct([ps[3], 10 - ps[3], 2.5, ps[2]]));
      const shown = ps.slice(0, 3).map((p) => dec(p / 10));
      return {
        params: { ps },
        promptText: r`$X$ takes the values 0, 1, 2, 3. Three probabilities are given below. What is $P(X = 3)$?`,
        mathFormula: pmfTable([0, 1, 2, 3], [...shown, '?']),
        options: [
          { id: 'a', label: `$${dec(ps[3] / 10)}$`, value: ps[3] / 10 },
          { id: 'b', label: `$${dec((10 - ps[3]) / 10)}$`, value: (10 - ps[3]) / 10, trapExplanation: r`That is the sum of the three given values. $P(X = 3)$ is what is left to reach 1.` },
          { id: 'c', label: '$0.25$', value: 0.25, trapExplanation: r`The values are not equally likely; use $\sum p = 1$.` },
          { id: 'd', label: `$${dec(ps[2] / 10)}$`, value: ps[2] / 10, trapExplanation: r`That is $P(X = 2)$, copied from the table.` },
        ],
        stepByStepSolution: [
          r`All probabilities add up to 1.`,
          r`$${shown.join(' + ')} = ${dec((10 - ps[3]) / 10)}$.`,
          r`$P(X = 3) = 1 - ${dec((10 - ps[3]) / 10)} = ${dec(ps[3] / 10)}$.`,
        ],
      };
    },
  },
  {
    id: 'pr-03-x2',
    difficulty: 1,
    keyConceptTag: 'The binomial distribution',
    correctOptionId: 'a',
    generate: (g) => {
      const { n, k } = g.until(
        () => ({ n: g.int(2, 4), k: g.int(0, 4) }),
        ({ n, k }) => k <= n && allDistinct([binomial(n, k) / 2 ** n, 1 / 2 ** n, k / n, 1 / (n + 1)]),
      );
      return {
        params: { n, pn: 1, pd: 2, k },
        promptText: r`$X \sim \text{Binomial}(${n}, \tfrac12)$. What is $P(X = ${k})$?`,
        options: [
          { id: 'a', label: `$${frac(binomial(n, k), 2 ** n)}$`, value: binomial(n, k) / 2 ** n },
          { id: 'b', label: `$${frac(1, 2 ** n)}$`, value: 1 / 2 ** n, trapExplanation: r`That is one sequence; there are $\binom{${n}}{${k}} = ${binomial(n, k)}$ sequences with ${k} successes.` },
          { id: 'c', label: `$${frac(k, n)}$`, value: k / n, trapExplanation: r`A proportion of trials is not a probability of a count.` },
          { id: 'd', label: `$${frac(1, n + 1)}$`, value: 1 / (n + 1), trapExplanation: r`The ${n + 1} possible counts are not equally likely.` },
        ],
        stepByStepSolution: [
          r`$P(X = ${k}) = \binom{${n}}{${k}}\big(\tfrac12\big)^{${n}}$.`,
          r`$= \frac{${binomial(n, k)}}{${2 ** n}}$.`,
          r`$= ${frac(binomial(n, k), 2 ** n)}$.`,
        ],
      };
    },
  },
  {
    id: 'pr-03-x3',
    difficulty: 1,
    keyConceptTag: 'The cumulative distribution function',
    correctOptionId: 'a',
    generate: (g) => {
      const { k, n } = g.until(
        () => ({ n: g.pick([6, 8, 10, 12, 20]), k: g.int(2, 18) }),
        ({ k, n }) => k < n && allDistinct([k, k - 1, 1, n - k]),
      );
      return {
        params: { k, n },
        promptText: r`$X$ is the result of a fair ${n}-sided die (faces 1 to ${n}). What is $F(${k}) = P(X \le ${k})$?`,
        options: [
          { id: 'a', label: `$${frac(k, n)}$`, value: k / n },
          { id: 'b', label: `$${frac(k - 1, n)}$`, value: (k - 1) / n, trapExplanation: r`That is $P(X < ${k})$; "$\le$" includes ${k}.` },
          { id: 'c', label: `$${frac(1, n)}$`, value: 1 / n, trapExplanation: r`That is $P(X = ${k})$. The CDF accumulates all values up to ${k}.` },
          { id: 'd', label: `$${frac(n - k, n)}$`, value: (n - k) / n, trapExplanation: r`That is $P(X > ${k})$.` },
        ],
        stepByStepSolution: [
          r`$F(${k}) = P(X = 1) + \dots + P(X = ${k})$.`,
          r`Each face has probability $\frac{1}{${n}}$.`,
          r`$F(${k}) = ${frac(k, n)}$.`,
        ],
      };
    },
  },
  {
    id: 'pr-03-x4',
    difficulty: 2,
    keyConceptTag: 'The Poisson distribution',
    correctOptionId: 'a',
    generate: (g) => {
      const lam = g.int(2, 5);
      const e = Math.exp(-lam);
      return {
        params: { lam, k: 0 },
        promptText: r`Typos per page follow a Poisson distribution with mean ${lam}. What is the probability that a page has no typos?`,
        options: [
          { id: 'a', label: `$e^{-${lam}} ${approx(e)}$`, value: e },
          { id: 'b', label: `$1 - e^{-${lam}} ${approx(1 - e)}$`, value: 1 - e, trapExplanation: r`That is $P(X \ge 1)$, at least one typo.` },
          { id: 'c', label: `$${lam}e^{-${lam}} ${approx(lam * e)}$`, value: lam * e, trapExplanation: r`That is $P(X = 1)$.` },
          { id: 'd', label: '$0$', value: 0, trapExplanation: r`A mean of ${lam} does not rule out zero; every count $k \ge 0$ has positive probability.` },
        ],
        stepByStepSolution: [
          r`$P(X = k) = e^{-\lambda}\frac{\lambda^k}{k!}$.`,
          r`For $k = 0$: $\frac{\lambda^0}{0!} = 1$.`,
          r`$P(X = 0) = e^{-${lam}} ${approx(e)}$.`,
        ],
      };
    },
  },
  {
    id: 'pr-03-x5',
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
    id: 'pr-03-x6',
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
];
