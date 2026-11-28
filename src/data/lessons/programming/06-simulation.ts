import { defineLesson, r } from '../define.ts';
import { extra } from './06-simulation.extra.ts';
import { practice } from './06-simulation.practice.ts';

export default defineLesson({
  id: 'pg-06',
  moduleId: 'programming',
  title: 'Simulating probability',
  blurb: 'Random numbers, Monte Carlo estimates and how accurate they are',
  minutes: 8,
  lecture: [
    {
      title: 'Random numbers',
      covers: ['2', 'x1', 'x3'],
      blocks: [
        {
          kind: 'text',
          text: r`Python's <c>random</c> module and NumPy's generator produce pseudo-random numbers. A <i>seed</i> fixes the sequence, so a simulation can be repeated exactly.

• <c>random.randint(a, b)</c> returns an integer from <c>a</c> to <c>b</c> <i>inclusive</i>.

• <c>rng = np.random.default_rng(42)</c> creates a NumPy generator; <c>rng.integers(a, b, size=n)</c> draws from <c>a</c> to <c>b - 1</c> (the upper end is <i>excluded</i>, like <c>range</c>), <c>rng.random(n)</c> draws uniformly from [0, 1), <c>rng.normal(mu, sigma, n)</c> from a normal distribution.`,
        },
        {
          kind: 'code',
          code: `import random\n\nrandom.seed(7)\nfirst = [random.randint(1, 6) for _ in range(5)]\nrandom.seed(7)\nsecond = [random.randint(1, 6) for _ in range(5)]\nprint(first == second, min(first) >= 1, max(first) <= 6)`,
          output: `True True True`,
        },
        {
          kind: 'quiz',
          id: 'pg-06-q1',
          prompt: r`How many different values can <c>random.randint(1, 6)</c> return?`,
          options: [
            { id: 'a', label: r`<c>6</c>` },
            { id: 'b', label: r`<c>5</c>`, trapExplanation: r`Unlike <c>range</c> and <c>rng.integers</c>, <c>randint</c> includes its upper end.` },
            { id: 'c', label: r`<c>7</c>`, trapExplanation: r`It returns 1 to 6: six values.` },
          ],
          correctOptionId: 'a',
          explanation: r`1, 2, 3, 4, 5, 6: both ends are included.`,
        },
      ],
    },
    {
      title: 'Monte Carlo estimates',
      covers: ['1', '4', 'x2', 'x6'],
      blocks: [
        {
          kind: 'text',
          text: r`To estimate a probability, simulate the experiment many times and take the share of runs where the event happens. With NumPy this is a boolean array and its mean: <c>True</c> counts as 1, <c>False</c> as 0. By the law of large numbers the share converges to the probability.`,
        },
        {
          kind: 'code',
          code: `import numpy as np\n\nrng = np.random.default_rng(0)\nrolls = rng.integers(1, 7, size=(100_000, 2))   # two dice per row\nprint((rolls.sum(axis=1) == 7).mean())          # about 1/6`,
          caption: r`The exact answer is $\frac{6}{36} \approx 0.1667$; the simulation lands within a few thousandths.`,
        },
        {
          kind: 'quiz',
          id: 'pg-06-q2',
          prompt: r`<c>x = rng.integers(1, 7, size=100_000)</c>. About what does <c>(x >= 5).mean()</c> print?`,
          options: [
            { id: 'a', label: r`$\approx 0.333$`, value: 1 / 3 },
            { id: 'b', label: r`$\approx 0.5$`, value: 0.5, trapExplanation: r`Only 5 and 6 qualify: two faces out of six.` },
            { id: 'c', label: r`$\approx 0.167$`, value: 1 / 6, trapExplanation: r`<c>>=</c> includes 5 as well as 6.` },
          ],
          correctOptionId: 'a',
          explanation: r`The values are 1 to 6; $P(X \ge 5) = \frac26$.`,
        },
      ],
    },
    {
      title: 'How accurate is a simulation?',
      covers: ['3', '5', 'x4'],
      blocks: [
        {
          kind: 'text',
          text: r`A simulated share $\hat p$ from $n$ independent runs is an average of 0/1 values, so its standard error is $\sqrt{\frac{p(1-p)}{n}}$. The error shrinks like $\frac{1}{\sqrt n}$: one more correct decimal digit costs 100 times as many runs. Report a simulation result with its error, e.g. $\hat p \pm 2\,\mathrm{SE}$.`,
        },
        {
          kind: 'quiz',
          id: 'pg-06-q3',
          prompt: r`A simulation with $n = 10\,000$ runs estimates a probability near 0.5. What is its standard error?`,
          options: [
            { id: 'a', label: '$0.005$', value: 0.005 },
            { id: 'b', label: '$0.000025$', value: 0.000025, trapExplanation: r`That is the variance $\frac{p(1-p)}{n}$; take the square root.` },
            { id: 'c', label: '$0.00005$', value: 0.00005, trapExplanation: r`The standard error divides by $\sqrt n = 100$, not by $n$.` },
          ],
          correctOptionId: 'a',
          explanation: r`$\sqrt{\frac{0.25}{10\,000}} = \frac{0.5}{100} = 0.005$.`,
        },
      ],
    },
    {
      title: 'Beyond probabilities',
      covers: ['6', 'x5'],
      blocks: [
        {
          kind: 'text',
          text: r`• <i>Expectations</i>: the mean of simulated values estimates $E[X]$, with error $\frac{\sigma}{\sqrt n}$.

• <i>Random walks</i>: <c>rng.choice([-1, 1], size=n).sum()</c> has mean 0 and standard deviation $\sqrt n$.

• <i>The bootstrap</i>: to see how much a statistic would vary, resample the data <i>with replacement</i> many times and recompute it. The spread of the recomputed values approximates its standard error, with no formula needed.`,
        },
        {
          kind: 'code',
          code: `data = np.array([2.1, 3.4, 1.9, 5.2, 4.4, 3.0])\nboot = [rng.choice(data, size=len(data), replace=True).mean()\n        for _ in range(5000)]\nprint(np.std(boot))   # bootstrap standard error of the mean`,
        },
        {
          kind: 'box',
          variant: 'tip',
          title: 'Check formulas by simulation',
          text: r`Whenever you derive a probability or an expectation, a ten-line simulation is a cheap independent check. If the two disagree by much more than the standard error, one of them is wrong.`,
        },
        {
          kind: 'example',
          title: 'Spread of a random walk, and a bootstrap sample',
          prompt: r`(a) A walk takes 100 independent steps of $+1$ or $-1$ with equal chance. What is the standard deviation of where it ends? (b) A bootstrap sample draws 6 values with replacement from 6 data points. What is the chance that a given point is never drawn?`,
          steps: [
            r`(a) One step has mean 0 and variance 1. Variances of independent steps add: the end point has variance 100.`,
            r`Standard deviation $\sqrt{100} = 10$ — it grows like $\sqrt n$, not like $n$.`,
            r`(b) Each draw misses the point with probability $\frac56$, independently: $\big(\frac56\big)^6 \approx 0.335$.`,
            r`For large $n$, $(1 - \frac1n)^n \to e^{-1} \approx 0.37$: about a third of the data is left out of every bootstrap sample.`,
          ],
        },
      ],
    },
    {
      title: 'Summary',
      blocks: [
        {
          kind: 'text',
          text: r`• Seeds make randomness reproducible. <c>randint(a, b)</c> includes <c>b</c>; <c>rng.integers(a, b)</c> excludes it.

• Probability ≈ mean of a boolean array; expectation ≈ mean of simulated values.

• Standard error $\sqrt{p(1-p)/n}$: 4× the runs halves the error.

• Bootstrap: resample with replacement to estimate the variability of any statistic.`,
        },
      ],
    },
  ],
  extra,
  questions: practice,
});
