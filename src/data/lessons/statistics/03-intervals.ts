import { defineLesson, r } from '../define.ts';
import { extra } from './03-intervals.extra.ts';
import { practice } from './03-intervals.practice.ts';

export default defineLesson({
  id: 'st-03',
  moduleId: 'statistics',
  title: 'Confidence intervals',
  blurb: 'An estimate with error bars, and what the 95% really promises',
  minutes: 7,
  lecture: [
    {
      title: 'Interval estimates',
      blocks: [
        {
          kind: 'text',
          text: r`A single number $\bar x$ hides how uncertain it is. A <i>confidence interval</i> reports a range instead. By the CLT, $\bar X \approx N\big(\mu, \frac{\sigma^2}{n}\big)$, so with the standard error $\operatorname{SE} = \frac{\sigma}{\sqrt n}$:`,
        },
        { kind: 'formula', tex: r`\bar x \pm z\cdot\frac{\sigma}{\sqrt n}, \qquad z = 1.645,\ 1.96,\ 2.576 \text{ for } 90\%,\ 95\%,\ 99\%` },
        {
          kind: 'text',
          text: r`The number $z$ is chosen so that $P(-z < Z < z)$ equals the confidence level for $Z \sim N(0, 1)$. The half-width $z\cdot\operatorname{SE}$ is called the <i>margin of error</i>.`,
        },
        {
          kind: 'quiz',
          id: 'st-03-q1',
          prompt: r`A sample of $n = 100$ has $\bar x = 50$; $\sigma = 20$ is known. What is the 95% confidence interval for $\mu$?`,
          options: [
            { id: 'a', label: r`$[46.08,\ 53.92]$`, value: [46.08, 53.92] },
            { id: 'b', label: r`$[10.8,\ 89.2]$`, value: [10.8, 89.2], trapExplanation: r`That uses $\sigma = 20$ itself. The mean of 100 values is far less variable: use $\operatorname{SE} = \frac{20}{10} = 2$.` },
            { id: 'c', label: r`$[48,\ 52]$`, value: [48, 52], trapExplanation: r`$\pm1$ standard error covers only about 68%. For 95% use $\pm1.96$.` },
          ],
          correctOptionId: 'a',
          explanation: r`$\operatorname{SE} = \frac{20}{\sqrt{100}} = 2$; $50 \pm 1.96\cdot2 = 50 \pm 3.92$.`,
        },
      ],
    },
    {
      title: 'What 95% means',
      blocks: [
        {
          kind: 'text',
          text: r`The parameter $\mu$ is fixed; the interval is random, because it is computed from a random sample. "95%" describes the procedure: if you repeated the study many times, about 95% of the intervals would contain $\mu$.`,
        },
        { kind: 'diagram', type: 'ciCoverage', caption: r`Twenty samples, twenty 95% intervals. Each is centred at its own $\bar x$; on average one in twenty misses the true mean.` },
        {
          kind: 'box',
          variant: 'pitfall',
          title: 'Not a probability about the mean',
          text: r`Once computed, an interval such as $[46.1, 53.9]$ either contains $\mu$ or it does not. Saying "$\mu$ is in it with probability 95%" mixes this up with a Bayesian credible interval, which needs a prior.`,
        },
        {
          kind: 'quiz',
          id: 'st-03-q2',
          prompt: r`Over a year a team computes 200 independent 95% confidence intervals. About how many of them miss the true value?`,
          options: [
            { id: 'a', label: '$10$', value: 10 },
            { id: 'b', label: '$5$', value: 5, trapExplanation: r`5% is the miss rate, so the count is $5\%$ of 200.` },
            { id: 'c', label: '$190$', value: 190, trapExplanation: r`190 is the number that cover it.` },
          ],
          correctOptionId: 'a',
          explanation: r`$200\cdot0.05 = 10$ intervals miss.`,
        },
      ],
    },
    {
      title: 'Width and sample size',
      blocks: [
        {
          kind: 'text',
          text: r`The margin $E = z\frac{\sigma}{\sqrt n}$ grows with the confidence level and with $\sigma$, and shrinks like $\frac{1}{\sqrt n}$. More confidence costs width; four times the data halves it. Solving for $n$ gives the sample size for a target margin:`,
        },
        { kind: 'formula', tex: r`n = \Big(\frac{z\,\sigma}{E}\Big)^2 \quad\text{(rounded up)}` },
        {
          kind: 'example',
          title: 'Planning a study',
          prompt: r`$\sigma = 15$. How many observations give a 95% margin of error of 3?`,
          steps: [
            r`$\frac{z\sigma}{E} = \frac{1.96\cdot15}{3} = 9.8$.`,
            r`$9.8^2 = 96.04$.`,
            r`Round up: $n = 97$.`,
          ],
        },
        {
          kind: 'quiz',
          id: 'st-03-q3',
          prompt: r`With $n = 50$ the margin of error is 6. About what $n$ gives a margin of 3, at the same confidence level?`,
          options: [
            { id: 'a', label: '$200$', value: 200 },
            { id: 'b', label: '$100$', value: 100, trapExplanation: r`Doubling $n$ only divides the margin by $\sqrt2$. To halve it, $\sqrt n$ must double.` },
            { id: 'c', label: '$71$', value: 71, trapExplanation: r`That multiplies $n$ by $\sqrt2$; the margin scales like $\frac{1}{\sqrt n}$, so $n$ must be multiplied by 4.` },
          ],
          correctOptionId: 'a',
          explanation: r`Half the margin needs $4\times$ the data: $4\cdot50 = 200$.`,
        },
      ],
    },
    {
      title: 'Unknown σ and proportions',
      blocks: [
        {
          kind: 'text',
          text: r`In practice $\sigma$ is unknown and is replaced by the sample standard deviation $s$. For small samples this adds uncertainty, and $z$ is replaced by a quantile of Student's $t$ distribution with $n - 1$ degrees of freedom, which is a little larger (2.262 instead of 1.96 for $n = 10$). For $n$ above about 30 the difference is small.

For a proportion, the share $\hat p$ of successes among $n$ is an average of 0/1 values with variance $p(1 - p)$, so`,
        },
        { kind: 'formula', tex: r`\hat p \pm 1.96\sqrt{\frac{\hat p(1 - \hat p)}{n}}` },
        {
          kind: 'example',
          title: 'A poll',
          prompt: r`220 of 400 people support a proposal. Give a 95% interval for the true share.`,
          steps: [
            r`$\hat p = \frac{220}{400} = 0.55$.`,
            r`$\operatorname{SE} = \sqrt{\frac{0.55\cdot0.45}{400}} \approx 0.0249$, so the margin is $1.96\cdot0.0249 \approx 0.049$.`,
            r`$[0.501,\ 0.599]$: "55% ± 5 points", just above one half.`,
          ],
        },
      ],
    },
    {
      title: 'Summary',
      blocks: [
        {
          kind: 'text',
          text: r`• Interval for a mean: $\bar x \pm z\frac{\sigma}{\sqrt n}$ with $z = 1.645, 1.96, 2.576$ for 90%, 95%, 99%.

• 95% is a property of the procedure: 95% of such intervals cover $\mu$.

• Margin $\propto \frac{1}{\sqrt n}$; required $n = (z\sigma/E)^2$.

• Unknown $\sigma$: use $s$ and a $t$ quantile. Proportion: $\hat p \pm 1.96\sqrt{\hat p(1 - \hat p)/n}$.`,
        },
      ],
    },
  ],
  extra,
  questions: practice,
});
