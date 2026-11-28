import { defineLesson, r } from '../define.ts';
import { extra } from './04-expectation.extra.ts';
import { practice } from './04-expectation.practice.ts';

export default defineLesson({
  id: 'pr-04',
  moduleId: 'probability',
  title: 'Expectation and variance',
  blurb: 'The centre and the spread of a random variable',
  minutes: 8,
  lecture: [
    {
      title: 'Expectation',
      covers: ['1', 'x1'],
      blocks: [
        {
          kind: 'text',
          text: r`The <i>expectation</i> (mean) is the probability-weighted average of the values — the long-run average over many repetitions:`,
        },
        { kind: 'formula', tex: r`E[X] = \sum_x x\,P(X = x) \qquad\text{or}\qquad E[X] = \int x\,f(x)\,dx` },
        {
          kind: 'example',
          title: 'A fair die',
          prompt: r`Find $E[X]$ for one roll of a fair die.`,
          steps: [
            r`$E[X] = \frac16(1 + 2 + 3 + 4 + 5 + 6)$.`,
            r`$= \frac{21}{6} = 3.5$.`,
            r`The mean need not be a possible value: no roll shows 3.5.`,
          ],
        },
        {
          kind: 'quiz',
          id: 'pr-04-q1',
          prompt: r`$P(X = 0) = 0.5$, $P(X = 1) = 0.3$, $P(X = 2) = 0.2$. What is $E[X]$?`,
          options: [
            { id: 'a', label: '$0.7$', value: 0.7 },
            { id: 'b', label: '$1$', value: 1, trapExplanation: r`1 is the plain average of the values 0, 1, 2. Weight each value by its probability.` },
            { id: 'c', label: '$0$', value: 0, trapExplanation: r`0 is the most likely value (the mode), not the mean.` },
          ],
          correctOptionId: 'a',
          explanation: r`$0\cdot0.5 + 1\cdot0.3 + 2\cdot0.2 = 0.7$.`,
        },
      ],
    },
    {
      title: 'Linearity',
      covers: ['2', 'x2', 'x6'],
      blocks: [
        { kind: 'formula', tex: r`E[aX + b] = a\,E[X] + b, \qquad E[X + Y] = E[X] + E[Y]` },
        {
          kind: 'text',
          text: r`The second rule holds for <i>any</i> $X$ and $Y$, independent or not. It makes many expectations easy: write a count as a sum of indicators (1 if something happens, else 0). Expected number of sixes in 10 rolls: ten indicators, each with mean $\frac16$, so $\frac{10}{6}$.`,
        },
        {
          kind: 'box',
          variant: 'pitfall',
          title: 'E of a function is not the function of E',
          text: r`In general $E[g(X)] \ne g(E[X])$. If $X = \pm1$ with equal probability, $E[X] = 0$ but $E[X^2] = 1$.`,
        },
        {
          kind: 'quiz',
          id: 'pr-04-q2',
          prompt: r`$E[X] = 4$. What is $E[3X - 2]$?`,
          options: [
            { id: 'a', label: '$10$', value: 10 },
            { id: 'b', label: '$12$', value: 12, trapExplanation: r`The shift $-2$ moves the mean too.` },
            { id: 'c', label: '$6$', value: 6, trapExplanation: r`That is $3(4 - 2)$; the order is $3\cdot4 - 2$.` },
          ],
          correctOptionId: 'a',
          explanation: r`$3\cdot4 - 2 = 10$.`,
        },
      ],
    },
    {
      title: 'Variance',
      covers: ['3', '4', '6', 'x5'],
      blocks: [
        {
          kind: 'text',
          text: r`The variance measures the spread around the mean $\mu = E[X]$; the standard deviation $\sigma = \sqrt{\operatorname{Var}X}$ is in the units of $X$.`,
        },
        { kind: 'formula', tex: r`\operatorname{Var}X = E\big[(X - \mu)^2\big] = E[X^2] - \mu^2` },
        {
          kind: 'box',
          variant: 'theorem',
          title: 'Rules',
          text: r`• $\operatorname{Var}(aX + b) = a^2\operatorname{Var}X$: shifting does not change spread, scaling multiplies it by $a^2$.

• If $X$ and $Y$ are independent, $\operatorname{Var}(X + Y) = \operatorname{Var}X + \operatorname{Var}Y$ — and also $\operatorname{Var}(X - Y) = \operatorname{Var}X + \operatorname{Var}Y$.`,
        },
        {
          kind: 'example',
          title: 'A variance from a table',
          prompt: r`$P(X = 0) = 0.5$, $P(X = 1) = 0.3$, $P(X = 2) = 0.2$. Find $\operatorname{Var}X$.`,
          steps: [
            r`$E[X] = 0\cdot0.5 + 1\cdot0.3 + 2\cdot0.2 = 0.7$.`,
            r`$E[X^2] = 0 + 1\cdot0.3 + 4\cdot0.2 = 1.1$.`,
            r`$\operatorname{Var}X = E[X^2] - (E[X])^2 = 1.1 - 0.49 = 0.61$.`,
            r`Check with the definition: $0.5\cdot0.7^2 + 0.3\cdot0.3^2 + 0.2\cdot1.3^2 = 0.245 + 0.027 + 0.338 = 0.61$. ✓`,
          ],
        },
        {
          kind: 'quiz',
          id: 'pr-04-q3',
          prompt: r`$\operatorname{Var}X = 4$. What is $\operatorname{Var}(3X + 2)$?`,
          options: [
            { id: 'a', label: '$36$', value: 36 },
            { id: 'b', label: '$12$', value: 12, trapExplanation: r`Scaling by 3 multiplies the variance by $3^2 = 9$, not 3.` },
            { id: 'c', label: '$38$', value: 38, trapExplanation: r`Adding a constant shifts the values but not their spread.` },
          ],
          correctOptionId: 'a',
          explanation: r`$3^2\cdot4 = 36$.`,
        },
      ],
    },
    {
      title: 'The standard results',
      covers: ['5', 'x3', 'x4'],
      blocks: [
        {
          kind: 'text',
          text: r`• Bernoulli$(p)$: mean $p$, variance $p(1 - p)$.

• Binomial$(n, p)$: mean $np$, variance $np(1 - p)$ — a sum of $n$ independent Bernoullis.

• Poisson$(\lambda)$: mean and variance both $\lambda$.

• Uniform$(a, b)$: mean $\frac{a + b}{2}$, variance $\frac{(b - a)^2}{12}$.

• Exponential$(\lambda)$: mean $\frac1\lambda$, variance $\frac{1}{\lambda^2}$. Normal $N(\mu, \sigma^2)$: mean $\mu$, variance $\sigma^2$.`,
        },
        {
          kind: 'box',
          variant: 'tip',
          title: 'In machine learning',
          text: r`Mean squared error is an expectation, $E[(\hat y - y)^2]$, and it splits into bias² + variance — the bias–variance trade-off of the Statistics module. Standardising features means subtracting the mean and dividing by the standard deviation.`,
        },
        {
          kind: 'example',
          title: 'Mean and variance of a count',
          prompt: r`Each of 200 emails is spam with probability 0.05, independently. Find the mean, variance and standard deviation of the number of spam emails.`,
          steps: [
            r`The count $X$ is Binomial$(200, 0.05)$: a sum of 200 independent Bernoulli$(0.05)$ variables.`,
            r`Each Bernoulli$(p)$ has mean $p = 0.05$ and variance $p(1 - p) = 0.0475$.`,
            r`Means always add; for independent terms variances add too: $E[X] = np = 10$ and $\operatorname{Var}X = np(1 - p) = 9.5$.`,
            r`$\sigma = \sqrt{9.5} \approx 3.08$.`,
          ],
        },
      ],
    },
    {
      title: 'Summary',
      blocks: [
        {
          kind: 'text',
          text: r`• $E[X] = \sum x\,p(x)$; linear: $E[aX + b] = aE[X] + b$, $E[X + Y] = E[X] + E[Y]$ always.

• $E[g(X)] \ne g(E[X])$ in general.

• $\operatorname{Var}X = E[X^2] - (E[X])^2$; $\operatorname{Var}(aX + b) = a^2\operatorname{Var}X$.

• Independent: variances add, for sums and for differences.

• Binomial: $np$ and $np(1 - p)$.`,
        },
      ],
    },
  ],
  extra,
  questions: practice,
});
