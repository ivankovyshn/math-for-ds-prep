import { defineLesson, r } from '../define.ts';
import { extra } from './03-distributions.extra.ts';
import { practice } from './03-distributions.practice.ts';

export default defineLesson({
  id: 'pr-03',
  moduleId: 'probability',
  title: 'Random variables and distributions',
  blurb: 'Bernoulli, binomial, Poisson, uniform, exponential and normal',
  minutes: 8,
  lecture: [
    {
      title: 'Random variables',
      blocks: [
        {
          kind: 'text',
          text: r`A <i>random variable</i> $X$ assigns a number to each outcome: the number of heads, a waiting time, a measurement. Its <i>distribution</i> says how likely each value is. For a discrete $X$ that is the probability mass function $p(x) = P(X = x)$, with $\sum_x p(x) = 1$. For any $X$, the cumulative distribution function is $F(x) = P(X \le x)$.`,
        },
        {
          kind: 'example',
          title: 'Heads in three tosses',
          prompt: r`$X$ = number of heads in 3 fair tosses.`,
          steps: [
            r`8 equally likely sequences; $\binom3k$ of them have $k$ heads.`,
            r`$p(0) = \frac18$, $p(1) = \frac38$, $p(2) = \frac38$, $p(3) = \frac18$. They add up to 1.`,
            r`$F(1) = P(X \le 1) = \frac18 + \frac38 = \frac12$.`,
          ],
        },
        {
          kind: 'quiz',
          id: 'pr-03-q1',
          prompt: r`For the same $X$, what is $P(X \ge 2)$?`,
          options: [
            { id: 'a', label: r`$\tfrac12$`, value: 0.5 },
            { id: 'b', label: r`$\tfrac38$`, value: 0.375, trapExplanation: r`That is $P(X = 2)$ only; "at least 2" also includes $X = 3$.` },
            { id: 'c', label: r`$\tfrac78$`, value: 0.875, trapExplanation: r`That is $P(X \ge 1)$.` },
          ],
          correctOptionId: 'a',
          explanation: r`$p(2) + p(3) = \frac38 + \frac18 = \frac12$.`,
        },
      ],
    },
    {
      title: 'Discrete families',
      blocks: [
        {
          kind: 'text',
          text: r`• <i>Bernoulli</i>$(p)$: one trial, $P(X = 1) = p$, $P(X = 0) = 1 - p$.

• <i>Binomial</i>$(n, p)$: successes in $n$ independent trials, $P(X = k) = \binom nk p^k(1 - p)^{n-k}$.

• <i>Poisson</i>$(\lambda)$: counts of rare events in a fixed window (visits per minute), $P(X = k) = e^{-\lambda}\frac{\lambda^k}{k!}$, $k = 0, 1, 2, \dots$`,
        },
        {
          kind: 'quiz',
          id: 'pr-03-q2',
          prompt: r`$X \sim \text{Binomial}(4, \tfrac12)$. What is $P(X = 2)$?`,
          options: [
            { id: 'a', label: r`$\tfrac38$`, value: 0.375 },
            { id: 'b', label: r`$\tfrac1{16}$`, value: 1 / 16, trapExplanation: r`That is one particular sequence such as HHTT; there are $\binom42 = 6$ of them.` },
            { id: 'c', label: r`$\tfrac12$`, value: 0.5, trapExplanation: r`"Half the tosses are heads" is the most likely count, but it is not the only one.` },
          ],
          correctOptionId: 'a',
          explanation: r`$\binom42\big(\frac12\big)^4 = \frac{6}{16} = \frac38$.`,
        },
      ],
    },
    {
      title: 'Continuous distributions',
      blocks: [
        {
          kind: 'text',
          text: r`A continuous $X$ has a density $f \ge 0$ with $\int f = 1$, and probabilities are areas: $P(a \le X \le b) = \int_a^b f(x)\,dx$. Any single value has probability 0.`,
        },
        {
          kind: 'text',
          text: r`• <i>Uniform</i>$(a, b)$: $f = \frac{1}{b - a}$ on $[a, b]$; probability is proportional to length.

• <i>Exponential</i>$(\lambda)$: $f(x) = \lambda e^{-\lambda x}$ for $x \ge 0$; waiting times; $P(X > t) = e^{-\lambda t}$.

• <i>Normal</i> $N(\mu, \sigma^2)$: the bell curve, $f(x) = \frac{1}{\sigma\sqrt{2\pi}}e^{-(x - \mu)^2/(2\sigma^2)}$. Standardise with $Z = \frac{X - \mu}{\sigma} \sim N(0, 1)$.`,
        },
        { kind: 'diagram', type: 'normal', caption: r`The 68–95–99.7 rule: a normal variable lies within $1\sigma$ of the mean about 68% of the time, within $2\sigma$ about 95%, within $3\sigma$ about 99.7%.` },
        {
          kind: 'quiz',
          id: 'pr-03-q3',
          prompt: r`IQ scores are roughly $N(100, 15^2)$. About what share lies between 85 and 115?`,
          options: [
            { id: 'a', label: r`$68\%$`, value: 68 },
            { id: 'b', label: r`$95\%$`, value: 95, trapExplanation: r`95% is within $2\sigma$, i.e. 70 to 130.` },
            { id: 'c', label: r`$34\%$`, value: 34, trapExplanation: r`34% is one side only, 100 to 115.` },
          ],
          correctOptionId: 'a',
          explanation: r`85 and 115 are $\mu \pm \sigma$, so about 68%.`,
        },
      ],
    },
    {
      title: 'Where they appear',
      blocks: [
        {
          kind: 'text',
          text: r`• Clicks, conversions and yes/no labels: Bernoulli and binomial (logistic regression models $p$).

• Counts per time window — requests, arrivals, typos: Poisson.

• Waiting times between such events: exponential.

• Measurement noise and sums of many small effects: normal (the next lessons explain why).`,
        },
        {
          kind: 'box',
          variant: 'pitfall',
          title: 'Density is not probability',
          text: r`A density can exceed 1: Uniform$(0, \frac12)$ has $f = 2$. Only areas under $f$ are probabilities.`,
        },
      ],
    },
    {
      title: 'Summary',
      blocks: [
        {
          kind: 'text',
          text: r`• Discrete: $p(x) = P(X = x)$, $\sum p = 1$. CDF $F(x) = P(X \le x)$.

• Binomial $\binom nk p^k(1 - p)^{n-k}$; Poisson $e^{-\lambda}\lambda^k/k!$.

• Continuous: $P(a \le X \le b) = \int_a^b f$; single points have probability 0.

• Uniform: length over length; exponential: $P(X > t) = e^{-\lambda t}$.

• Normal: 68–95–99.7 within $1, 2, 3$ standard deviations.`,
        },
      ],
    },
  ],
  extra,
  questions: practice,
});
