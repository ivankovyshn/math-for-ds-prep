import type { QuestionTemplate, Rng } from '../../../types.ts';
import { r } from '../define.ts';
import { allDistinct, frac, ints, sumOf } from '../gen.ts';

/** Data values as TeX: "3,\ 5,\ 8". */
export const list = (xs: number[]) => xs.join(',\\ ');
export const meanOf = (xs: number[]) => sumOf(xs) / xs.length;
/** Sum of squared deviations from the mean. */
export const ssOf = (xs: number[]) => {
  const m = meanOf(xs);
  return sumOf(xs.map((x) => (x - m) ** 2));
};
/** n integers in [lo, hi] whose mean is a whole number. */
export const intMeanData = (g: Rng, n: number, lo: number, hi: number) => g.until(() => ints(g, n, lo, hi), (xs) => sumOf(xs) % n === 0);
const median = (xs: number[]) => {
  const s = [...xs].sort((a, b) => a - b);
  return s.length % 2 ? s[(s.length - 1) / 2] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2;
};

export const practice: QuestionTemplate[] = [
  {
    id: 'st-01-1',
    difficulty: 1,
    keyConceptTag: 'The sample mean',
    correctOptionId: 'a',
    generate: (g) => {
      const xs = g.until(() => intMeanData(g, 5, 1, 30), (xs) => allDistinct([meanOf(xs), median(xs), sumOf(xs) / 4, sumOf(xs)]));
      const m = meanOf(xs);
      const s = sumOf(xs);
      return {
        params: { xs },
        promptText: r`A sample of five measurements is $${list(xs)}$. What is the sample mean $\bar x$?`,
        options: [
          { id: 'a', label: `$${m}$`, value: m },
          { id: 'b', label: `$${median(xs)}$`, value: median(xs), trapExplanation: r`${median(xs)} is the median, the middle value after sorting. The mean adds all values and divides by $n$.` },
          { id: 'c', label: `$${frac(s, 4)}$`, value: s / 4, trapExplanation: r`That divides the sum by $n - 1 = 4$. The divisor $n - 1$ belongs to the sample variance, not the mean.` },
          { id: 'd', label: `$${s}$`, value: s, trapExplanation: r`${s} is the sum; divide it by $n = 5$.` },
        ],
        stepByStepSolution: [
          r`Add the values: $${xs.join(' + ')} = ${s}$.`,
          r`Divide by $n = 5$: $\frac{${s}}{5}$.`,
          r`$\bar x = ${m}$.`,
        ],
      };
    },
  },
  {
    id: 'st-01-2',
    difficulty: 1,
    keyConceptTag: 'The sample variance',
    correctOptionId: 'a',
    generate: (g) => {
      const n = g.pick([4, 5]);
      const xs = g.until(() => intMeanData(g, n, 0, 12), (xs) => {
        const ss = ssOf(xs);
        return ss > 0 && allDistinct([ss / (n - 1), ss / n, ss, sumOf(xs.map((x) => x * x)) / (n - 1)]);
      });
      const m = meanOf(xs);
      const ss = ssOf(xs);
      const raw = sumOf(xs.map((x) => x * x));
      return {
        params: { xs },
        promptText: r`Compute the sample variance $s^2 = \frac{1}{n-1}\sum (x_i - \bar x)^2$ of the data $${list(xs)}$.`,
        options: [
          { id: 'a', label: `$${frac(ss, n - 1)}$`, value: ss / (n - 1) },
          { id: 'b', label: `$${frac(ss, n)}$`, value: ss / n, trapExplanation: r`That divides by $n = ${n}$; the unbiased $s^2$ divides by $n - 1 = ${n - 1}$.` },
          { id: 'c', label: `$${ss}$`, value: ss, trapExplanation: r`${ss} is the sum of squared deviations; it still has to be divided by $n - 1$.` },
          { id: 'd', label: `$${frac(raw, n - 1)}$`, value: raw / (n - 1), trapExplanation: r`The squares must be of the deviations $x_i - \bar x$, not of the raw values.` },
        ],
        stepByStepSolution: [
          r`Mean: $\bar x = \frac{${sumOf(xs)}}{${n}} = ${m}$.`,
          r`Squared deviations: $${xs.map((x) => `${(x - m) ** 2}`).join(' + ')} = ${ss}$.`,
          r`$s^2 = \frac{${ss}}{${n - 1}} = ${frac(ss, n - 1)}$.`,
        ],
      };
    },
  },
  {
    id: 'st-01-3',
    difficulty: 2,
    keyConceptTag: 'Computing a bias',
    correctOptionId: 'a',
    generate: (g) => {
      const n = g.pick([3, 4, 5, 7, 9, 11]);
      const m = g.int(2, 30);
      return {
        params: { m, n },
        promptText: r`$X_1, \dots, X_{${n}}$ are i.i.d. with mean $\mu = ${m}$. The estimator $\hat\theta = \frac{1}{${n + 1}}\sum_{i=1}^{${n}} X_i$ divides the sum by $n + 1$. What is its bias as an estimator of $\mu$?`,
        options: [
          { id: 'a', label: `$${frac(-m, n + 1)}$`, value: -m / (n + 1) },
          { id: 'b', label: `$${frac(m, n + 1)}$`, value: m / (n + 1), trapExplanation: r`Bias is $E[\hat\theta] - \mu$. Dividing by too much makes the estimate too small, so the bias is negative.` },
          { id: 'c', label: '$0$', value: 0, trapExplanation: r`Only the divisor $n$ gives an unbiased mean; here $E[\hat\theta] = \frac{${n}}{${n + 1}}\mu \ne \mu$.` },
          { id: 'd', label: `$${frac(-m, n)}$`, value: -m / n, trapExplanation: r`$\mu - \frac{n}{n+1}\mu = \frac{\mu}{n+1}$, with $n + 1 = ${n + 1}$ in the denominator.` },
        ],
        stepByStepSolution: [
          r`$E\big[\sum X_i\big] = ${n}\mu = ${n * m}$ by linearity.`,
          r`$E[\hat\theta] = \frac{${n * m}}{${n + 1}}$.`,
          r`Bias $= \frac{${n * m}}{${n + 1}} - ${m} = ${frac(-m, n + 1)}$.`,
        ],
      };
    },
  },
  {
    id: 'st-01-4',
    difficulty: 2,
    keyConceptTag: 'Mean squared error',
    correctOptionId: 'a',
    generate: (g) => {
      const { t, b, v } = g.until(
        () => ({ t: g.int(5, 50), b: g.nonzero(-4, 4), v: g.int(1, 20) }),
        ({ b, v }) => allDistinct([b * b + v, Math.abs(b) + v, v, b * b + v * v]),
      );
      return {
        params: { t, b, v },
        promptText: r`An estimator $\hat\theta$ of $\theta = ${t}$ has $E[\hat\theta] = ${t + b}$ and $\operatorname{Var}\hat\theta = ${v}$. What is its mean squared error?`,
        options: [
          { id: 'a', label: `$${b * b + v}$`, value: b * b + v },
          { id: 'b', label: `$${Math.abs(b) + v}$`, value: Math.abs(b) + v, trapExplanation: r`The bias enters squared: $(${b})^2 = ${b * b}$.` },
          { id: 'c', label: `$${v}$`, value: v, trapExplanation: r`The variance alone ignores the bias $${t + b} - ${t} = ${b}$.` },
          { id: 'd', label: `$${b * b + v * v}$`, value: b * b + v * v, trapExplanation: r`The variance is already a squared quantity; add it as it is.` },
        ],
        stepByStepSolution: [
          r`Bias $= E[\hat\theta] - \theta = ${t + b} - ${t} = ${b}$.`,
          r`$\operatorname{MSE} = \operatorname{Bias}^2 + \operatorname{Var} = (${b})^2 + ${v}$.`,
          r`$= ${b * b + v}$.`,
        ],
      };
    },
  },
  {
    id: 'st-01-5',
    difficulty: 3,
    keyConceptTag: 'Why the variance divides by n − 1',
    correctOptionId: 'a',
    generate: (g) => {
      const n = g.pick([3, 4, 5, 6, 8, 10]);
      const v = g.until(() => g.int(2, 40), (v) => allDistinct([(v * (n - 1)) / n, v, v / n, (v * n) / (n - 1)]));
      return {
        params: { n, v },
        promptText: r`$X_1, \dots, X_{${n}}$ are i.i.d. with variance $\sigma^2 = ${v}$. What is the expected value of the estimator $\hat\sigma^2 = \frac{1}{n}\sum (X_i - \bar X)^2$, which divides by $n$?`,
        options: [
          { id: 'a', label: `$${frac(v * (n - 1), n)}$`, value: (v * (n - 1)) / n },
          { id: 'b', label: `$${v}$`, value: v, trapExplanation: r`That is $E[s^2]$, with divisor $n - 1$. Dividing by $n$ underestimates on average.` },
          { id: 'c', label: `$${frac(v, n)}$`, value: v / n, trapExplanation: r`$\frac{\sigma^2}{n}$ is the variance of $\bar X$, a different quantity.` },
          { id: 'd', label: `$${frac(v * n, n - 1)}$`, value: (v * n) / (n - 1), trapExplanation: r`The factor is $\frac{n-1}{n}$, not its reciprocal: deviations from $\bar X$ are too <i>small</i>.` },
        ],
        stepByStepSolution: [
          r`$E\big[\sum (X_i - \bar X)^2\big] = (n - 1)\sigma^2 = ${n - 1}\cdot${v}$.`,
          r`Divide by $n = ${n}$: $E[\hat\sigma^2] = \frac{${(n - 1) * v}}{${n}}$.`,
          r`$= ${frac(v * (n - 1), n)}$, below $\sigma^2 = ${v}$: a negative bias of $${frac(-v, n)}$.`,
        ],
      };
    },
  },
  {
    id: 'st-01-6',
    difficulty: 3,
    keyConceptTag: 'Shrinkage: trading bias for variance',
    correctOptionId: 'a',
    generate: (g) => {
      const c = g.pick([0.5, 0.75]);
      const cTex = c === 0.5 ? r`\tfrac12` : r`\tfrac34`;
      const { m, s, n } = g.until(
        () => ({ m: g.int(1, 6), s: g.int(2, 10), n: g.pick([4, 9, 16, 25]) }),
        ({ m, s, n }) => {
          const b2 = (1 - c) ** 2 * m * m;
          const vr = (c * c * s * s) / n;
          return allDistinct([b2 + vr, vr, b2 + (s * s) / n, (1 - c) * m + vr]);
        },
      );
      // Everything over the common denominator 16n.
      const d = 16 * n;
      const bias2 = 16 * (1 - c) ** 2 * m * m * n;
      const varc = 16 * c * c * s * s;
      const T = (num: number) => frac(num, d);
      return {
        params: { c, m, s, n },
        promptText: r`$X_1, \dots, X_{${n}}$ are i.i.d. with mean $\mu = ${m}$ and standard deviation $\sigma = ${s}$. What is the mean squared error of the shrunken estimator $\tilde\theta = ${cTex}\bar X$ of $\mu$?`,
        options: [
          { id: 'a', label: `$${T(bias2 + varc)}$`, value: (bias2 + varc) / d },
          { id: 'b', label: `$${T(varc)}$`, value: varc / d, trapExplanation: r`That is only the variance. $\tilde\theta$ is biased: $E[\tilde\theta] = ${cTex}\cdot${m}$, not ${m}.` },
          { id: 'c', label: `$${T(bias2 + 16 * s * s)}$`, value: (bias2 + 16 * s * s) / d, trapExplanation: r`Scaling by $c$ scales the variance by $c^2$: $\operatorname{Var}(c\bar X) = c^2\frac{\sigma^2}{n}$.` },
          { id: 'd', label: `$${T(16 * (1 - c) * m * n + varc)}$`, value: (16 * (1 - c) * m * n + varc) / d, trapExplanation: r`The bias enters the MSE squared.` },
        ],
        stepByStepSolution: [
          r`Bias: $E[\tilde\theta] - \mu = (${cTex} - 1)\cdot${m} = ${T(-16 * (1 - c) * m * n)}$, so $\operatorname{Bias}^2 = ${T(bias2)}$.`,
          r`Variance: $${cTex}^2\cdot\frac{${s * s}}{${n}} = ${T(varc)}$.`,
          r`$\operatorname{MSE} = ${T(bias2)} + ${T(varc)} = ${T(bias2 + varc)}$, compared with $\frac{\sigma^2}{n} = ${frac(s * s, n)}$ for $\bar X$.`,
        ],
      };
    },
  },
];
