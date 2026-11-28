import { defineLesson, r } from '../define.ts';
import { extra } from './03-distributions.extra.ts';
import { practice } from './03-distributions.practice.ts';

export default defineLesson({
  id: 'pr-03',
  moduleId: 'probability',
  title: 'Discrete distributions',
  blurb: 'Random variables, the PMF and CDF, binomial and Poisson',
  minutes: 7,
  deeper: [
    { title: 'Probability distributions', url: 'https://seeing-theory.brown.edu/probability-distributions/index.html', source: 'Seeing Theory (Brown University) · interactive visualisation' },
    { title: 'Random variable', url: 'https://www.statlect.com/fundamentals-of-probability/random-variables', source: 'StatLect · free textbook page with proofs and exercises' },
  ],
  lecture: [
    {
      title: 'Random variables',
      covers: ['1', 'x1', 'x3'],
      blocks: [
        {
          kind: 'text',
          text: r`A <i>random variable</i> $X$ assigns a number to each outcome: the number of heads, a waiting time, a measurement. Its <i>distribution</i> says how likely each value is.

For a discrete $X$ (values you can list) that is the <i>probability mass function</i> (PMF) $p(x) = P(X = x)$, with $\sum_x p(x) = 1$. The <i>cumulative distribution function</i> (CDF) adds up from the left: $F(x) = P(X \le x)$.`,
        },
        {
          kind: 'example',
          title: 'Heads in three tosses',
          prompt: r`$X$ = number of heads in 3 fair tosses.`,
          steps: [
            r`8 equally likely sequences; $\binom3k$ of them have $k$ heads.`,
            r`$p(0) = \frac18$, $p(1) = \frac38$, $p(2) = \frac38$, $p(3) = \frac18$. They add up to 1, so a missing value can always be found as 1 minus the others.`,
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
      title: 'Bernoulli and binomial',
      covers: ['2', '7', '9', 'x2', 'x7'],
      blocks: [
        {
          kind: 'text',
          text: r`• <i>Bernoulli</i>$(p)$: one trial with success probability $p$: $P(X = 1) = p$, $P(X = 0) = 1 - p$.

• <i>Binomial</i>$(n, p)$: the number of successes in $n$ independent trials. A particular sequence with $k$ successes has probability $p^k(1 - p)^{n-k}$, and there are $\binom nk$ such sequences:`,
        },
        { kind: 'formula', tex: r`P(X = k) = \binom nk p^k(1 - p)^{n-k}, \qquad k = 0, 1, \dots, n` },
        {
          kind: 'example',
          title: 'Exactly two, at least one, at least two',
          prompt: r`Each of 5 emails is opened with probability $0.2$, independently. Find $P(X = 2)$, $P(X \ge 1)$ and $P(X \ge 2)$.`,
          steps: [
            r`$P(X = 2) = \binom52\,0.2^2\,0.8^3 = 10\cdot 0.04\cdot 0.512 = 0.2048$.`,
            r`"At least one" is easiest through the complement "none": $P(X \ge 1) = 1 - P(X = 0) = 1 - 0.8^5 \approx 0.672$.`,
            r`Adding $5\cdot 0.2 = 1$ would be wrong: the events "email $i$ is opened" overlap.`,
            r`"At least two" = 1 minus "zero or one": $P(X = 1) = 5\cdot 0.2\cdot 0.8^4 \approx 0.410$, so $P(X \ge 2) \approx 1 - 0.328 - 0.410 = 0.262$.`,
          ],
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
      title: 'Poisson',
      covers: ['3', '8', 'x4', 'x8'],
      blocks: [
        {
          kind: 'text',
          text: r`The <i>Poisson</i>$(\lambda)$ distribution counts events that happen independently at a steady average rate: requests per second, typos per page, calls per minute. $\lambda$ is the average count in the window.`,
        },
        { kind: 'formula', tex: r`P(X = k) = e^{-\lambda}\frac{\lambda^k}{k!}, \qquad k = 0, 1, 2, \dots` },
        {
          kind: 'example',
          title: 'Calls to a help desk',
          prompt: r`Calls arrive at 2 per minute on average. Find the probability of no calls in a minute, of at most one call in a minute, and of exactly 3 calls in 3 minutes.`,
          steps: [
            r`One minute: $\lambda = 2$. $P(X = 0) = e^{-2}\frac{2^0}{0!} = e^{-2} \approx 0.135$.`,
            r`$P(X \le 1) = P(0) + P(1) = e^{-2} + 2e^{-2} = 3e^{-2} \approx 0.406$.`,
            r`Three minutes: the average count is $\lambda = 2\cdot 3 = 6$ — the rate scales with the window.`,
            r`$P(X = 3) = e^{-6}\frac{6^3}{3!} = 36e^{-6} \approx 0.089$.`,
          ],
        },
        {
          kind: 'quiz',
          id: 'pr-03-q3',
          prompt: r`Emails arrive at 3 per hour on average (Poisson). What is the probability of none in an hour?`,
          options: [
            { id: 'a', label: r`$e^{-3} \approx 0.05$`, value: Math.exp(-3) },
            { id: 'b', label: r`$3e^{-3} \approx 0.15$`, value: 3 * Math.exp(-3), trapExplanation: r`That is $P(X = 1)$: $e^{-3}\frac{3^1}{1!}$.` },
            { id: 'c', label: r`$1 - e^{-3} \approx 0.95$`, value: 1 - Math.exp(-3), trapExplanation: r`That is the probability of at least one email.` },
          ],
          correctOptionId: 'a',
          explanation: r`$P(X = 0) = e^{-3}\frac{3^0}{0!} = e^{-3}$.`,
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

• Quantities that vary continuously — waiting times, measurements — need densities instead of a PMF: the next lesson.`,
        },
        {
          kind: 'box',
          variant: 'tip',
          title: 'Binomial or Poisson?',
          text: r`Binomial counts successes among a fixed number $n$ of trials, so $X \le n$. Poisson has no upper limit: it counts events in a window. For many trials with a small $p$, Binomial$(n, p)$ is close to Poisson$(np)$.`,
        },
      ],
    },
    {
      title: 'Summary',
      blocks: [
        {
          kind: 'text',
          text: r`• Discrete: $p(x) = P(X = x)$, $\sum p = 1$. CDF $F(x) = P(X \le x)$.

• Binomial: $\binom nk p^k(1 - p)^{n-k}$. "At least one": $1 - P(X = 0)$.

• Poisson: $e^{-\lambda}\lambda^k/k!$, with $\lambda$ = rate × length of the window.`,
        },
      ],
    },
  ],
  extra,
  questions: practice,
});
