import type { QuestionTemplate } from '../../../types.ts';
import { r } from '../define.ts';
import { allDistinct, dec, frac, paren } from '../gen.ts';

/** Extra practice (Practice 2): gentler questions on the same ideas, with new numbers every time. */
export const extra: QuestionTemplate[] = [
  {
    id: 'pr-04-x1',
    difficulty: 1,
    keyConceptTag: 'Expectation of a uniform variable',
    correctOptionId: 'a',
    generate: (g) => {
      const n = g.pick([4, 6, 8, 10, 12, 20]);
      return {
        params: { n },
        promptText: r`$X$ is the result of a fair ${n}-sided die (faces 1 to ${n}). What is $E[X]$?`,
        options: [
          { id: 'a', label: `$${frac(n + 1, 2)}$`, value: (n + 1) / 2 },
          { id: 'b', label: `$${frac(n, 2)}$`, value: n / 2, trapExplanation: r`The faces run from 1 (not 0) to ${n}; their middle is $\frac{1 + ${n}}{2}$.` },
          { id: 'c', label: `$${n + 1}$`, value: n + 1, trapExplanation: r`That is the sum of the smallest and largest face; the mean is half of it.` },
          { id: 'd', label: `$${frac(1, n)}$`, value: 1 / n, trapExplanation: r`$\frac{1}{${n}}$ is the probability of each face, not the average value.` },
        ],
        stepByStepSolution: [
          r`$E[X] = \frac{1}{${n}}(1 + 2 + \dots + ${n})$.`,
          r`$1 + \dots + ${n} = \frac{${n}\cdot${n + 1}}{2} = ${(n * (n + 1)) / 2}$.`,
          r`$E[X] = \frac{${n + 1}}{2} = ${frac(n + 1, 2)}$.`,
        ],
      };
    },
  },
  {
    id: 'pr-04-x2',
    difficulty: 1,
    keyConceptTag: 'Linearity of expectation',
    correctOptionId: 'a',
    generate: (g) => {
      const { mx, my } = g.until(() => ({ mx: g.int(-4, 9), my: g.int(-4, 9) }), ({ mx, my }) => allDistinct([mx + my, mx * my, (mx + my) / 2, -9999]));
      return {
        params: { mx, my },
        promptText: r`$E[X] = ${mx}$ and $E[Y] = ${my}$; $X$ and $Y$ are <i>not</i> independent. What is $E[X + Y]$?`,
        options: [
          { id: 'a', label: `$${mx + my}$`, value: mx + my },
          { id: 'b', label: `$${mx * my}$`, value: mx * my, trapExplanation: r`Expectations of a sum add; products appear in $E[XY]$, and only for independent variables.` },
          { id: 'c', label: `$${dec((mx + my) / 2)}$`, value: (mx + my) / 2, trapExplanation: r`That is the mean of $\frac{X + Y}{2}$, not of $X + Y$.` },
          { id: 'd', label: 'It cannot be found without independence', value: -9999, trapExplanation: r`Linearity $E[X + Y] = E[X] + E[Y]$ holds for any $X$ and $Y$, dependent or not.` },
        ],
        stepByStepSolution: [
          r`$E[X + Y] = E[X] + E[Y]$ always — no independence needed.`,
          r`$= ${mx} + ${paren(my)}$.`,
          r`$= ${mx + my}$.`,
        ],
      };
    },
  },
  {
    id: 'pr-04-x3',
    difficulty: 1,
    keyConceptTag: 'Variance of a Bernoulli variable',
    correctOptionId: 'a',
    generate: (g) => {
      const p = g.pick([1, 2, 3, 4, 6, 7, 8, 9]);
      return {
        params: { p },
        promptText: r`$X \sim \text{Bernoulli}(${dec(p / 10)})$. What is $\operatorname{Var}X$?`,
        options: [
          { id: 'a', label: `$${dec((p * (10 - p)) / 100)}$`, value: (p * (10 - p)) / 100 },
          { id: 'b', label: `$${dec(p / 10)}$`, value: p / 10, trapExplanation: r`${dec(p / 10)} is the mean $E[X] = p$.` },
          { id: 'c', label: `$${dec((p * p) / 100)}$`, value: (p * p) / 100, trapExplanation: r`$p^2 = (E[X])^2$; the variance is $E[X^2] - p^2 = p - p^2$.` },
          { id: 'd', label: `$${dec((10 - p) / 10)}$`, value: (10 - p) / 10, trapExplanation: r`That is $1 - p = P(X = 0)$.` },
        ],
        stepByStepSolution: [
          r`$X^2 = X$ for a 0/1 variable, so $E[X^2] = p$.`,
          r`$\operatorname{Var}X = p - p^2 = p(1 - p) = ${dec(p / 10)}\cdot${dec((10 - p) / 10)}$.`,
          r`$= ${dec((p * (10 - p)) / 100)}$.`,
        ],
      };
    },
  },
  {
    id: 'pr-04-x4',
    difficulty: 2,
    keyConceptTag: 'Expected count of successes',
    correctOptionId: 'a',
    generate: (g) => {
      const { n, p } = g.until(
        () => ({ n: g.pick([20, 50, 100, 200, 500]), p: g.pick([2, 5, 10, 20, 25]) }),
        ({ n, p }) => allDistinct([(n * p) / 100, p / 100, n, (n * p * (100 - p)) / 10000]),
      );
      return {
        params: { n, p },
        promptText: r`An ad is shown ${n} times and each view is clicked independently with probability ${p}%. What is the expected number of clicks?`,
        options: [
          { id: 'a', label: `$${dec((n * p) / 100)}$`, value: (n * p) / 100 },
          { id: 'b', label: `$${dec(p / 100)}$`, value: p / 100, trapExplanation: r`That is the expectation for a single view.` },
          { id: 'c', label: `$${n}$`, value: n, trapExplanation: r`That would need every view to be clicked.` },
          { id: 'd', label: `$${dec((n * p * (100 - p)) / 10000)}$`, value: (n * p * (100 - p)) / 10000, trapExplanation: r`$np(1 - p)$ is the variance of the count, not its mean.` },
        ],
        stepByStepSolution: [
          r`Write the count as a sum of ${n} indicators, each with mean $p = ${dec(p / 100)}$.`,
          r`By linearity, $E[X] = np = ${n}\cdot${dec(p / 100)}$.`,
          r`$= ${dec((n * p) / 100)}$.`,
        ],
      };
    },
  },
  {
    id: 'pr-04-x5',
    difficulty: 2,
    keyConceptTag: 'Variance from moments',
    correctOptionId: 'a',
    generate: (g) => {
      const { m, s } = g.until(() => ({ m: g.int(-4, 5), s: g.int(2, 40) }), ({ m, s }) => s > m * m && allDistinct([s - m * m, s - m, s, (s - m) ** 2]));
      return {
        params: { m, s },
        promptText: r`$E[X] = ${m}$ and $E[X^2] = ${s}$. What is $\operatorname{Var}X$?`,
        options: [
          { id: 'a', label: `$${s - m * m}$`, value: s - m * m },
          { id: 'b', label: `$${s - m}$`, value: s - m, trapExplanation: r`Subtract the square of the mean, $${paren(m)}^2 = ${m * m}$.` },
          { id: 'c', label: `$${s}$`, value: s, trapExplanation: r`$E[X^2]$ alone measures size, not spread around the mean.` },
          { id: 'd', label: `$${(s - m) ** 2}$`, value: (s - m) ** 2, trapExplanation: r`The formula is $E[X^2] - (E[X])^2$: only the mean is squared.` },
        ],
        stepByStepSolution: [
          r`$\operatorname{Var}X = E[X^2] - (E[X])^2$.`,
          r`$= ${s} - ${m * m}$.`,
          r`$= ${s - m * m}$.`,
        ],
      };
    },
  },
  {
    id: 'pr-04-x6',
    difficulty: 2,
    keyConceptTag: 'E of a function is not the function of E',
    correctOptionId: 'a',
    generate: (g) => {
      const a = g.int(2, 6);
      return {
        params: { a },
        promptText: r`$X = ${a}$ or $X = -${a}$, each with probability $\tfrac12$. What is $E[X^2]$?`,
        options: [
          { id: 'a', label: `$${a * a}$`, value: a * a },
          { id: 'b', label: '$0$', value: 0, trapExplanation: r`$0 = (E[X])^2$. Squaring first removes the signs: $E[X^2] \ne (E[X])^2$.` },
          { id: 'c', label: `$${a}$`, value: a, trapExplanation: r`That is $E[|X|]$. Each value is squared.` },
          { id: 'd', label: `$${2 * a * a}$`, value: 2 * a * a, trapExplanation: r`Weight each value by its probability $\frac12$; the two terms are averaged, not added.` },
        ],
        stepByStepSolution: [
          r`$X^2 = ${a * a}$ in both cases.`,
          r`So $E[X^2] = ${a * a}$, while $E[X] = 0$.`,
          r`This also gives $\operatorname{Var}X = ${a * a} - 0 = ${a * a}$.`,
        ],
      };
    },
  },
];
