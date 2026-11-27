import type { QuestionTemplate } from '../../../types.ts';
import { r } from '../define.ts';
import { allDistinct, dec, frac, ints, sumOf } from '../gen.ts';
import { intMeanData, list, meanOf, ssOf } from './01-estimators.practice.ts';

const r4 = (x: number) => Math.round(x * 1e4) / 1e4;
const median = (xs: number[]) => [...xs].sort((a, b) => a - b)[(xs.length - 1) / 2];

export const practice: QuestionTemplate[] = [
  {
    id: 'st-02-1',
    difficulty: 1,
    keyConceptTag: 'MLE of a probability',
    correctOptionId: 'a',
    generate: (g) => {
      const n = g.pick([10, 20, 25, 40, 50, 80, 100]);
      const k = g.until(() => g.int(1, n - 1), (k) => allDistinct([k / n, (n - k) / n, r4(k / (n - k)), 0.5]));
      return {
        params: { k, n },
        promptText: r`An ad was shown $n = ${n}$ times and clicked ${k} times. Each view is clicked independently with probability $p$. What is the maximum likelihood estimate of $p$?`,
        options: [
          { id: 'a', label: `$${dec(k / n)}$`, value: k / n },
          { id: 'b', label: `$${dec((n - k) / n)}$`, value: (n - k) / n, trapExplanation: r`That is the share of views <i>without</i> a click.` },
          { id: 'c', label: `$${dec(r4(k / (n - k)))}$`, value: r4(k / (n - k)), trapExplanation: r`$\frac{k}{n - k}$ is the odds of a click, not its probability.` },
          { id: 'd', label: '$0.5$', value: 0.5, trapExplanation: r`0.5 ignores the data. The likelihood $p^{${k}}(1-p)^{${n - k}}$ peaks at the observed share.` },
        ],
        stepByStepSolution: [
          r`$\ell(p) = ${k}\log p + ${n - k}\log(1 - p)$.`,
          r`$\ell'(p) = \frac{${k}}{p} - \frac{${n - k}}{1-p} = 0$ gives $p = \frac{${k}}{${n}}$.`,
          r`$\hat p = ${dec(k / n)}$.`,
        ],
      };
    },
  },
  {
    id: 'st-02-2',
    difficulty: 1,
    keyConceptTag: 'MLE for a Poisson rate',
    correctOptionId: 'a',
    generate: (g) => {
      const xs = g.until(() => ints(g, 5, 0, 9), (xs) => allDistinct([sumOf(xs) / 5, sumOf(xs) / 4, median(xs), Math.max(...xs)]));
      const s = sumOf(xs);
      return {
        params: { xs },
        promptText: r`A help desk counts support tickets on five days: $${list(xs)}$. Modelling the daily count as Poisson$(\lambda)$, what is the MLE of $\lambda$?`,
        options: [
          { id: 'a', label: `$${dec(s / 5)}$`, value: s / 5 },
          { id: 'b', label: `$${dec(s / 4)}$`, value: s / 4, trapExplanation: r`The MLE divides the total by the number of days, 5, not by $n - 1$.` },
          { id: 'c', label: `$${median(xs)}$`, value: median(xs), trapExplanation: r`That is the median day. The Poisson likelihood is maximised by the mean.` },
          { id: 'd', label: `$${Math.max(...xs)}$`, value: Math.max(...xs), trapExplanation: r`The busiest day is not a typical day; $\lambda$ is the expected count.` },
        ],
        stepByStepSolution: [
          r`$\ell(\lambda) = \sum (x_i\log\lambda - \lambda) + \text{const} = ${s}\log\lambda - 5\lambda + \text{const}$.`,
          r`$\ell'(\lambda) = \frac{${s}}{\lambda} - 5 = 0$.`,
          r`$\hat\lambda = \frac{${s}}{5} = ${dec(s / 5)}$, the sample mean.`,
        ],
      };
    },
  },
  {
    id: 'st-02-3',
    difficulty: 2,
    keyConceptTag: 'MLE for an exponential rate',
    correctOptionId: 'a',
    generate: (g) => {
      const m = g.pick([2, 4, 5, 8, 10]);
      const xs = g.until(() => ints(g, 4, 1, 3 * m), (xs) => sumOf(xs) === 4 * m && allDistinct([1 / m, m, 1 / (4 * m), 1 / Math.max(...xs)]));
      return {
        params: { xs },
        promptText: r`Times between server failures (in days) are $${list(xs)}$, modelled as i.i.d. Exponential$(\lambda)$ with density $\lambda e^{-\lambda x}$. What is the MLE of the rate $\lambda$?`,
        options: [
          { id: 'a', label: `$${frac(1, m)}$`, value: 1 / m },
          { id: 'b', label: `$${m}$`, value: m, trapExplanation: r`${m} days is the estimated <i>mean</i> time $\frac1\lambda$; the rate is its reciprocal.` },
          { id: 'c', label: `$${frac(1, 4 * m)}$`, value: 1 / (4 * m), trapExplanation: r`$\hat\lambda = \frac{n}{\sum x_i}$: the factor $n = 4$ is missing.` },
          { id: 'd', label: `$${frac(1, Math.max(...xs))}$`, value: 1 / Math.max(...xs), trapExplanation: r`All four times enter the likelihood, through their sum.` },
        ],
        stepByStepSolution: [
          r`$\ell(\lambda) = 4\log\lambda - \lambda\sum x_i = 4\log\lambda - ${4 * m}\lambda$.`,
          r`$\ell'(\lambda) = \frac{4}{\lambda} - ${4 * m} = 0$.`,
          r`$\hat\lambda = \frac{4}{${4 * m}} = ${frac(1, m)}$ per day, one over the mean time ${m}.`,
        ],
      };
    },
  },
  {
    id: 'st-02-4',
    difficulty: 2,
    keyConceptTag: 'MLE of a normal variance',
    correctOptionId: 'a',
    generate: (g) => {
      const n = g.pick([4, 5]);
      const xs = g.until(() => intMeanData(g, n, 0, 14), (xs) => ssOf(xs) > 0 && allDistinct([ssOf(xs) / n, ssOf(xs) / (n - 1), ssOf(xs), Math.sqrt(ssOf(xs) / n)].map(r4)));
      const ss = ssOf(xs);
      const m = meanOf(xs);
      return {
        params: { xs },
        promptText: r`The data $${list(xs)}$ are modelled as i.i.d. $N(\mu, \sigma^2)$ with both parameters unknown. What is the maximum likelihood estimate of $\sigma^2$?`,
        options: [
          { id: 'a', label: `$${frac(ss, n)}$`, value: ss / n },
          { id: 'b', label: `$${frac(ss, n - 1)}$`, value: ss / (n - 1), trapExplanation: r`That is the unbiased $s^2$. The likelihood is maximised by dividing by $n = ${n}$.` },
          { id: 'c', label: `$${ss}$`, value: ss, trapExplanation: r`${ss} is the sum of squared deviations; the MLE divides it by $n$.` },
          { id: 'd', label: `$\\sqrt{${frac(ss, n)}}$`, value: Math.sqrt(ss / n), trapExplanation: r`That is $\hat\sigma$, the estimate of the standard deviation, not of $\sigma^2$.` },
        ],
        stepByStepSolution: [
          r`$\hat\mu = \bar x = ${m}$; the squared deviations add up to $${ss}$.`,
          r`$\ell(\sigma^2) = -\frac{${n}}{2}\log\sigma^2 - \frac{${ss}}{2\sigma^2} + \text{const}$; setting the derivative to zero gives $\sigma^2 = \frac{${ss}}{${n}}$.`,
          r`$\hat\sigma^2 = ${frac(ss, n)}$.`,
        ],
      };
    },
  },
  {
    id: 'st-02-5',
    difficulty: 3,
    keyConceptTag: 'An MLE at the boundary',
    correctOptionId: 'a',
    generate: (g) => {
      const xs = g.until(() => ints(g, 5, 1, 20), (xs) => {
        const mx = Math.max(...xs);
        return allDistinct([mx, (2 * sumOf(xs)) / 5, sumOf(xs) / 5, (6 * mx) / 5]);
      });
      const mx = Math.max(...xs);
      const s = sumOf(xs);
      return {
        params: { xs },
        promptText: r`The data $${list(xs)}$ are i.i.d. Uniform$(0, \theta)$, with density $\frac1\theta$ on $[0, \theta]$. What is the MLE of $\theta$?`,
        options: [
          { id: 'a', label: `$${mx}$`, value: mx },
          { id: 'b', label: `$${dec((2 * s) / 5)}$`, value: (2 * s) / 5, trapExplanation: r`$2\bar x$ matches the mean $\frac\theta2$ (the method of moments), but it does not maximise the likelihood.` },
          { id: 'c', label: `$${dec(s / 5)}$`, value: s / 5, trapExplanation: r`$\theta$ is the upper end of the range, not its mean; with $\theta = ${dec(s / 5)}$ the value ${mx} would be impossible.` },
          { id: 'd', label: `$${dec((6 * mx) / 5)}$`, value: (6 * mx) / 5, trapExplanation: r`$\frac{n+1}{n}\max x_i$ corrects the bias of the MLE, but it is not the MLE: the likelihood is larger at $\theta = ${mx}$.` },
        ],
        stepByStepSolution: [
          r`$L(\theta) = \theta^{-5}$ if every $x_i \le \theta$, and $0$ otherwise (a value above $\theta$ is impossible).`,
          r`So $\theta$ must be at least $\max x_i = ${mx}$, and on that range $\theta^{-5}$ decreases. Setting a derivative to zero would not find this.`,
          r`The maximum is at the boundary: $\hat\theta = ${mx}$.`,
        ],
      };
    },
  },
  {
    id: 'st-02-6',
    difficulty: 3,
    keyConceptTag: 'Pooling data in the likelihood',
    correctOptionId: 'a',
    generate: (g) => {
      const ns = g.pick([[10, 20, 70], [20, 30, 50], [10, 40, 50], [25, 25, 50], [10, 10, 80], [20, 20, 60]]);
      const ks = g.until(() => ns.map((n) => g.int(1, n - 1)), (ks) => {
        const pooled = sumOf(ks) / 100;
        const avg = sumOf(ks.map((k, i) => k / ns[i])) / 3;
        return allDistinct([pooled, r4(avg), ks[2] / ns[2], 1 - pooled].map(r4));
      });
      const K = sumOf(ks);
      const avg = sumOf(ks.map((k, i) => k / ns[i])) / 3;
      return {
        params: { ks, ns },
        promptText: r`Three stores ran the same promotion. Store sizes (customers) were ${ns.join(', ')} and the numbers who bought were ${ks.join(', ')}. Assuming every customer buys independently with the same probability $p$, what is the MLE of $p$?`,
        options: [
          { id: 'a', label: `$${dec(K / 100)}$`, value: K / 100 },
          { id: 'b', label: `$${dec(r4(avg))}$`, value: r4(avg), trapExplanation: r`Averaging the three rates gives the small stores as much weight as the big one. The likelihood treats all 100 customers equally.` },
          { id: 'c', label: `$${dec(ks[2] / ns[2])}$`, value: ks[2] / ns[2], trapExplanation: r`That uses only the largest store; every customer carries information about $p$.` },
          { id: 'd', label: `$${dec(1 - K / 100)}$`, value: 1 - K / 100, trapExplanation: r`That is the share of customers who did not buy.` },
        ],
        stepByStepSolution: [
          r`$\ell(p) = \sum_i \big[k_i\log p + (n_i - k_i)\log(1-p)\big] = ${K}\log p + ${100 - K}\log(1 - p)$.`,
          r`This is the coin likelihood with $k = ${K}$ successes in $n = 100$ trials.`,
          r`$\hat p = \frac{${K}}{100} = ${dec(K / 100)}$.`,
        ],
      };
    },
  },
];
