import type { QuestionTemplate } from '../../../types.ts';
import { r } from '../define.ts';
import { allDistinct, frac, sumOf } from '../gen.ts';
import { intMeanData, list, meanOf, ssOf } from './01-estimators.practice.ts';

/** Extra practice (Practice 2): gentler questions on the same ideas, with new numbers every time. */
export const extra: QuestionTemplate[] = [
  {
    id: 'st-01-x1',
    difficulty: 1,
    keyConceptTag: 'The sample mean',
    correctOptionId: 'a',
    generate: (g) => {
      const xs = g.until(() => intMeanData(g, 4, 1, 25), (xs) => allDistinct([meanOf(xs), sumOf(xs), sumOf(xs) / 3, Math.max(...xs)]));
      const s = sumOf(xs);
      return {
        params: { xs },
        promptText: r`Four delivery times (in minutes) are $${list(xs)}$. What is their sample mean?`,
        options: [
          { id: 'a', label: `$${meanOf(xs)}$`, value: meanOf(xs) },
          { id: 'b', label: `$${s}$`, value: s, trapExplanation: r`${s} is the total; divide it by the number of values, 4.` },
          { id: 'c', label: `$${frac(s, 3)}$`, value: s / 3, trapExplanation: r`The mean divides by $n = 4$, not by $n - 1$.` },
          { id: 'd', label: `$${Math.max(...xs)}$`, value: Math.max(...xs), trapExplanation: r`That is the largest value, not the average.` },
        ],
        stepByStepSolution: [
          r`Sum: $${xs.join(' + ')} = ${s}$.`,
          r`Divide by 4: $\frac{${s}}{4}$.`,
          r`$\bar x = ${meanOf(xs)}$ minutes.`,
        ],
      };
    },
  },
  {
    id: 'st-01-x2',
    difficulty: 2,
    keyConceptTag: 'Computing a bias',
    correctOptionId: 'a',
    generate: (g) => {
      const k = g.pick([2, 4, 5]);
      const m = g.int(2, 20);
      const bias = ((3 - k) * m) / k;
      return {
        params: { k, m },
        promptText: r`$X_1$ and $X_2$ each have mean $\mu = ${m}$. What is the bias of $\hat\theta = \frac{2X_1 + X_2}{${k}}$ as an estimator of $\mu$?`,
        options: [
          { id: 'a', label: `$${frac((3 - k) * m, k)}$`, value: bias },
          { id: 'b', label: `$${frac(3 * m, k)}$`, value: (3 * m) / k, trapExplanation: r`That is $E[\hat\theta]$. The bias subtracts the true value: $E[\hat\theta] - ${m}$.` },
          { id: 'c', label: `$${frac((k - 3) * m, k)}$`, value: -bias, trapExplanation: r`Bias is $E[\hat\theta] - \mu$, not $\mu - E[\hat\theta]$.` },
          { id: 'd', label: '$0$', value: 0, trapExplanation: r`The weights add up to $\frac{3}{${k}} \ne 1$, so the estimator is biased.` },
        ],
        stepByStepSolution: [
          r`$E[\hat\theta] = \frac{2\mu + \mu}{${k}} = \frac{3\cdot${m}}{${k}} = ${frac(3 * m, k)}$.`,
          r`Bias $= ${frac(3 * m, k)} - ${m}$.`,
          r`$= ${frac((3 - k) * m, k)}$.`,
        ],
      };
    },
  },
  {
    id: 'st-01-x3',
    difficulty: 1,
    keyConceptTag: 'The sample variance',
    correctOptionId: 'a',
    generate: (g) => {
      const xs = g.until(() => intMeanData(g, 3, 0, 15), (xs) => ssOf(xs) > 0 && allDistinct([ssOf(xs) / 2, ssOf(xs) / 3, ssOf(xs), Math.sqrt(ssOf(xs) / 2)]));
      const m = meanOf(xs);
      const ss = ssOf(xs);
      return {
        params: { xs },
        promptText: r`What is the sample variance $s^2$ (divisor $n - 1$) of $${list(xs)}$?`,
        options: [
          { id: 'a', label: `$${frac(ss, 2)}$`, value: ss / 2 },
          { id: 'b', label: `$${frac(ss, 3)}$`, value: ss / 3, trapExplanation: r`That divides by $n = 3$; the sample variance divides by $n - 1 = 2$.` },
          { id: 'c', label: `$${ss}$`, value: ss, trapExplanation: r`${ss} is the sum of squared deviations before dividing.` },
          { id: 'd', label: `$\\sqrt{${frac(ss, 2)}}$`, value: Math.sqrt(ss / 2), trapExplanation: r`That is the sample standard deviation $s$, the square root of $s^2$.` },
        ],
        stepByStepSolution: [
          r`$\bar x = ${m}$; deviations $${xs.map((x) => x - m).join(',\ ')}$.`,
          r`Squares add up to $${ss}$.`,
          r`$s^2 = \frac{${ss}}{2} = ${frac(ss, 2)}$.`,
        ],
      };
    },
  },
  {
    id: 'st-01-x4',
    difficulty: 1,
    keyConceptTag: 'Mean squared error',
    correctOptionId: 'a',
    generate: (g) => {
      const { b, v } = g.until(() => ({ b: g.int(1, 5), v: g.int(1, 30) }), ({ b, v }) => allDistinct([b * b + v, b + v, v, b * b]));
      return {
        params: { b, v },
        promptText: r`An estimator has bias ${b} and variance ${v}. What is its mean squared error?`,
        options: [
          { id: 'a', label: `$${b * b + v}$`, value: b * b + v },
          { id: 'b', label: `$${b + v}$`, value: b + v, trapExplanation: r`The bias is squared before adding: $${b}^2 = ${b * b}$.` },
          { id: 'c', label: `$${v}$`, value: v, trapExplanation: r`The bias also contributes to the error.` },
          { id: 'd', label: `$${b * b}$`, value: b * b, trapExplanation: r`The variance also contributes to the error.` },
        ],
        stepByStepSolution: [
          r`$\operatorname{MSE} = \operatorname{Bias}^2 + \operatorname{Var}$.`,
          r`$= ${b}^2 + ${v}$.`,
          r`$= ${b * b + v}$.`,
        ],
      };
    },
  },
  {
    id: 'st-01-x5',
    difficulty: 1,
    keyConceptTag: 'Averaging reduces variance',
    correctOptionId: 'a',
    generate: (g) => {
      const n = g.pick([4, 5, 8, 9, 10, 16, 20, 25]);
      return {
        params: { n },
        promptText: r`To estimate $\mu$ you can use a single observation $X_1$ or the mean $\bar X$ of $n = ${n}$ i.i.d. observations. Both are unbiased. How many times larger is $\operatorname{Var}X_1$ than $\operatorname{Var}\bar X$?`,
        options: [
          { id: 'a', label: `$${n}$`, value: n },
          { id: 'b', label: `$\\sqrt{${n}}$`, value: Math.sqrt(n), trapExplanation: r`$\sqrt n$ is the ratio of the standard deviations; the variances differ by $n$.` },
          { id: 'c', label: `$${n * n}$`, value: n * n, trapExplanation: r`$\operatorname{Var}\bar X = \frac{\sigma^2}{n}$: one factor of $n$, not two.` },
          { id: 'd', label: '$1$', value: 1, trapExplanation: r`Being unbiased says nothing about the spread; averaging shrinks it.` },
        ],
        stepByStepSolution: [
          r`$\operatorname{Var}X_1 = \sigma^2$.`,
          r`$\operatorname{Var}\bar X = \frac{\sigma^2}{${n}}$.`,
          r`Ratio: ${n}. With equal bias, the lower variance makes $\bar X$ the better estimator.`,
        ],
      };
    },
  },
  {
    id: 'st-01-x6',
    difficulty: 2,
    keyConceptTag: 'Comparing estimators by MSE',
    correctOptionId: 'a',
    generate: (g) => {
      const { bA, vA, vB } = g.until(
        () => ({ bA: g.int(1, 4), vA: g.int(1, 10), vB: g.int(2, 25) }),
        ({ bA, vA, vB }) => vA < vB && bA * bA + vA !== vB,
      );
      const mA = bA * bA + vA;
      const aWins = mA < vB;
      const [W, L, mW, mL] = aWins ? ['A', 'B', mA, vB] : ['B', 'A', vB, mA];
      return {
        params: { bA, vA, vB, aIsA: aWins ? 1 : 0 },
        promptText: r`Estimator A has bias ${bA} and variance ${vA}. Estimator B is unbiased with variance ${vB}. Which has the smaller mean squared error?`,
        options: [
          { id: 'a', label: `${W}, with MSE $${mW}$`, value: mW },
          { id: 'b', label: `${L}, with MSE $${mL}$`, value: mL, trapExplanation: r`Compare the two MSEs: $${mL} > ${mW}$.` },
          aWins
            ? { id: 'c', label: 'B, because it is unbiased', value: -1, trapExplanation: r`Unbiasedness is not enough: B's variance ${vB} exceeds A's whole MSE $${bA}^2 + ${vA} = ${mA}$.` }
            : { id: 'c', label: 'A, because its variance is smaller', value: -1, trapExplanation: r`A's bias counts too: $${bA}^2 + ${vA} = ${mA} > ${vB}$.` },
          { id: 'd', label: 'They have the same MSE', value: -2, trapExplanation: r`$\operatorname{MSE}_A = ${mA}$ and $\operatorname{MSE}_B = ${vB}$ differ.` },
        ],
        stepByStepSolution: [
          r`$\operatorname{MSE}_A = ${bA}^2 + ${vA} = ${mA}$.`,
          r`$\operatorname{MSE}_B = 0^2 + ${vB} = ${vB}$.`,
          r`The smaller one is ${W}'s, $${mW}$.`,
        ],
      };
    },
  },
];
