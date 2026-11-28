import { defineLesson, r } from '../define.ts';
import { extra } from './06-clt.extra.ts';
import { practice } from './06-clt.practice.ts';

export default defineLesson({
  id: 'pr-06',
  moduleId: 'probability',
  title: 'Law of large numbers and CLT',
  blurb: 'Why averages are reliable, and why the bell curve is everywhere',
  minutes: 8,
  deeper: [
    { title: 'But what is the Central Limit Theorem?', url: 'https://www.3blue1brown.com/lessons/clt', source: '3Blue1Brown · animated video lesson' },
    { title: 'Central Limit Theorem', url: 'https://www.statlect.com/asymptotic-theory/central-limit-theorem', source: 'StatLect · free textbook page with proofs and exercises' },
  ],
  lecture: [
    {
      title: 'The sample mean',
      blocks: [
        {
          kind: 'text',
          text: r`Let $X_1, \dots, X_n$ be independent and identically distributed (i.i.d.), each with mean $\mu$ and standard deviation $\sigma$. Their average $\bar X = \frac1n\sum X_i$ is itself random, with`,
        },
        { kind: 'formula', tex: r`E[\bar X] = \mu, \qquad \operatorname{Var}\bar X = \frac{\sigma^2}{n}, \qquad \operatorname{SD}(\bar X) = \frac{\sigma}{\sqrt n}` },
        {
          kind: 'text',
          text: r`The last quantity is the <i>standard error</i>. It follows from linearity and from independent variances adding: $\operatorname{Var}\sum X_i = n\sigma^2$, divided by $n^2$.`,
        },
        {
          kind: 'quiz',
          id: 'pr-06-q1',
          prompt: r`Measurements have $\sigma = 10$. What is the standard error of the mean of 25 measurements?`,
          options: [
            { id: 'a', label: '$2$', value: 2 },
            { id: 'b', label: '$0.4$', value: 0.4, trapExplanation: r`Divide by $\sqrt{25} = 5$, not by 25.` },
            { id: 'c', label: '$4$', value: 4, trapExplanation: r`$\frac{\sigma^2}{n} = 4$ is the variance of $\bar X$; the standard error is its square root.` },
          ],
          correctOptionId: 'a',
          explanation: r`$\frac{10}{\sqrt{25}} = 2$.`,
        },
      ],
    },
    {
      title: 'The law of large numbers',
      blocks: [
        {
          kind: 'box',
          variant: 'theorem',
          title: 'Law of large numbers',
          text: r`As $n \to \infty$, $\bar X \to \mu$ (with probability 1). Averages of many independent observations settle at the true mean.`,
        },
        { kind: 'diagram', type: 'lln', caption: r`The running share of heads in a sequence of fair coin tosses: wild at first, then closer and closer to 0.5. The band shrinks like $\frac{1}{\sqrt n}$.` },
        {
          kind: 'text',
          text: r`This is why frequencies estimate probabilities, why Monte Carlo simulation works, and why the average training loss over a large batch approximates the true expected loss.`,
        },
        {
          kind: 'box',
          variant: 'pitfall',
          title: "The gambler's fallacy",
          text: r`After ten heads in a row, tails is <i>not</i> "due". The coin has no memory; the law of large numbers works by drowning early deviations in many new tosses, not by correcting them.`,
        },
      ],
    },
    {
      title: 'The central limit theorem',
      blocks: [
        {
          kind: 'box',
          variant: 'theorem',
          title: 'Central limit theorem',
          text: r`For large $n$, whatever the distribution of the $X_i$ (with finite variance),

$\bar X \approx N\Big(\mu, \frac{\sigma^2}{n}\Big)$, equivalently $\frac{\bar X - \mu}{\sigma/\sqrt n} \approx N(0, 1)$.

The sum $\sum X_i$ is approximately $N(n\mu, n\sigma^2)$.`,
        },
        {
          kind: 'example',
          title: 'Averaging dice',
          prompt: r`Roll a die 36 times. About how likely is an average above 4?`,
          steps: [
            r`One roll: $\mu = 3.5$, $\sigma^2 = \frac{35}{12} \approx 2.92$, $\sigma \approx 1.71$.`,
            r`Standard error: $\frac{1.71}{\sqrt{36}} \approx 0.285$. So 4 is $\frac{0.5}{0.285} \approx 1.75$ standard errors above the mean.`,
            r`$P(Z > 1.75) \approx 4\%$ — although a single die is far from normal.`,
          ],
        },
        {
          kind: 'quiz',
          id: 'pr-06-q2',
          prompt: r`Each of 100 i.i.d. variables has mean 2 and standard deviation 3. What are the mean and standard deviation of their sum?`,
          options: [
            { id: 'a', label: '$200$ and $30$', value: [200, 30] },
            { id: 'b', label: '$200$ and $300$', value: [200, 300], trapExplanation: r`Variances add ($100\cdot9 = 900$), so the standard deviation is $\sqrt{900} = 30$, not $100\cdot3$.` },
            { id: 'c', label: '$2$ and $0.3$', value: [2, 0.3], trapExplanation: r`Those are the mean and standard error of the <i>average</i>, not of the sum.` },
          ],
          correctOptionId: 'a',
          explanation: r`Mean $100\cdot2 = 200$; variance $100\cdot3^2 = 900$, so SD $= 30 = 3\sqrt{100}$.`,
        },
      ],
    },
    {
      title: 'Using the CLT',
      blocks: [
        {
          kind: 'text',
          text: r`• Probabilities for averages: standardise with the standard error and use the normal distribution.

• Confidence intervals: $\bar X \pm 2\frac{\sigma}{\sqrt n}$ covers $\mu$ about 95% of the time (more precisely $\pm1.96$).

• Sample size: the error shrinks like $\frac{1}{\sqrt n}$ — four times the data halves the error.`,
        },
        {
          kind: 'quiz',
          id: 'pr-06-q3',
          prompt: r`An A/B test's estimate has standard error 0.4 with 1000 users. How many users give a standard error of 0.2?`,
          options: [
            { id: 'a', label: '$4000$', value: 4000 },
            { id: 'b', label: '$2000$', value: 2000, trapExplanation: r`The error scales like $\frac{1}{\sqrt n}$: doubling $n$ only divides it by $\sqrt2$.` },
            { id: 'c', label: '$1414$', value: 1414, trapExplanation: r`That multiplies $n$ by $\sqrt2$. To halve $\frac{\sigma}{\sqrt n}$, $\sqrt n$ must double, so $n$ quadruples.` },
          ],
          correctOptionId: 'a',
          explanation: r`Halving the error needs $\sqrt n$ twice as large: $n = 4\cdot1000$.`,
        },
      ],
    },
    {
      title: 'Summary',
      blocks: [
        {
          kind: 'text',
          text: r`• $E[\bar X] = \mu$, $\operatorname{SD}(\bar X) = \sigma/\sqrt n$ (standard error).

• Law of large numbers: $\bar X \to \mu$.

• CLT: $\bar X \approx N(\mu, \sigma^2/n)$ and $\sum X_i \approx N(n\mu, n\sigma^2)$, whatever the shape of one $X_i$.

• 95% interval: $\bar X \pm 2\sigma/\sqrt n$; 4× data halves the error.`,
        },
      ],
    },
  ],
  extra,
  questions: practice,
});
