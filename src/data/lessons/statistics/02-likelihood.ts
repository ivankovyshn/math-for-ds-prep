import { defineLesson, r } from '../define.ts';
import { extra } from './02-likelihood.extra.ts';
import { practice } from './02-likelihood.practice.ts';

export default defineLesson({
  id: 'st-02',
  moduleId: 'statistics',
  title: 'Maximum likelihood',
  blurb: 'Choose the parameter that makes the observed data most probable',
  minutes: 8,
  deeper: [
    { title: 'Maximum likelihood estimation', url: 'https://www.statlect.com/fundamentals-of-statistics/maximum-likelihood', source: 'StatLect · free textbook page with proofs and exercises' },
    { title: 'Normal distribution: maximum likelihood estimation (the σ² derivation)', url: 'https://www.statlect.com/fundamentals-of-statistics/normal-distribution-maximum-likelihood', source: 'StatLect · free textbook page with proofs and exercises' },
  ],
  lecture: [
    {
      title: 'The likelihood',
      blocks: [
        {
          kind: 'text',
          text: r`Fix the data and let the parameter vary. For independent observations with density or probability $f(x;\theta)$, the <i>likelihood</i> is the probability of exactly this data, seen as a function of $\theta$:`,
        },
        { kind: 'formula', tex: r`L(\theta) = \prod_{i=1}^n f(x_i;\theta)` },
        {
          kind: 'text',
          text: r`For coin tosses with $P(\text{H}) = p$, a sequence with $k$ heads among $n$ tosses has $L(p) = p^k(1 - p)^{n-k}$. The likelihood is not a distribution over $\theta$: it need not integrate to 1. It only compares parameter values against each other.`,
        },
        {
          kind: 'quiz',
          id: 'st-02-q1',
          prompt: r`Three tosses give H, T, H. What is the likelihood at $p = 0.6$?`,
          options: [
            { id: 'a', label: '$0.144$', value: 0.144 },
            { id: 'b', label: '$0.432$', value: 0.432, trapExplanation: r`That is $P(\text{2 heads in 3})$, which counts all three orders. The likelihood of this particular sequence has no factor 3.` },
            { id: 'c', label: '$0.24$', value: 0.24, trapExplanation: r`There are three tosses: $0.6\cdot0.4\cdot0.6$.` },
          ],
          correctOptionId: 'a',
          explanation: r`$L(0.6) = 0.6\cdot0.4\cdot0.6 = 0.144$.`,
        },
      ],
    },
    {
      title: 'Maximising it',
      blocks: [
        {
          kind: 'box',
          variant: 'definition',
          title: 'Maximum likelihood estimate',
          text: r`$\hat\theta_{\text{MLE}}$ is the value of $\theta$ that maximises $L(\theta)$, the parameter under which the observed data are most probable.`,
        },
        {
          kind: 'text',
          text: r`Products are awkward to differentiate, so maximise the <i>log-likelihood</i> $\ell(\theta) = \sum \log f(x_i;\theta)$ instead. The logarithm is increasing, so the maximiser is the same. For the coin: $\ell(p) = k\log p + (n - k)\log(1 - p)$ and`,
        },
        { kind: 'formula', tex: r`\ell'(p) = \frac{k}{p} - \frac{n-k}{1-p} = 0 \quad\Longrightarrow\quad \hat p = \frac{k}{n}` },
        { kind: 'diagram', type: 'likelihood', caption: r`$L(p) = p^7(1-p)^3$ for 7 heads in 10 tosses. The peak is at $\hat p = 0.7$, the observed share.` },
        {
          kind: 'quiz',
          id: 'st-02-q2',
          prompt: r`12 of 40 independent trials succeed. What is the MLE of the success probability?`,
          options: [
            { id: 'a', label: '$0.3$', value: 0.3 },
            { id: 'b', label: '$0.7$', value: 0.7, trapExplanation: r`0.7 is the share of failures.` },
            { id: 'c', label: '$0.5$', value: 0.5, trapExplanation: r`0.5 is a prior guess, not what the data say. $L(0.5) < L(0.3)$ here.` },
          ],
          correctOptionId: 'a',
          explanation: r`$\hat p = \frac{12}{40} = 0.3$.`,
        },
      ],
    },
    {
      title: 'Common MLEs',
      blocks: [
        {
          kind: 'text',
          text: r`The same recipe (log, differentiate, set to zero) gives:

• Bernoulli$(p)$: $\hat p = \frac{k}{n}$, the share of successes.

• Poisson$(\lambda)$: $\hat\lambda = \bar x$.

• Exponential$(\lambda)$: $\hat\lambda = \frac{1}{\bar x}$, since the mean is $\frac1\lambda$.

• Normal$(\mu, \sigma^2)$: $\hat\mu = \bar x$ and $\hat\sigma^2 = \frac1n\sum (x_i - \bar x)^2$.`,
        },
        {
          kind: 'box',
          variant: 'pitfall',
          title: 'MLEs can be biased',
          text: r`The normal MLE of $\sigma^2$ divides by $n$, so it underestimates on average: $E[\hat\sigma^2] = \frac{n-1}{n}\sigma^2$. Maximum likelihood optimises fit to the data, not unbiasedness. Its bias vanishes as $n$ grows.`,
        },
        {
          kind: 'quiz',
          id: 'st-02-q3',
          prompt: r`Waiting times are modelled as Exponential$(\lambda)$. The observed times have mean 4 minutes. What is $\hat\lambda$?`,
          options: [
            { id: 'a', label: '$0.25$', value: 0.25 },
            { id: 'b', label: '$4$', value: 4, trapExplanation: r`4 estimates the mean $\frac1\lambda$; the rate is its reciprocal.` },
            { id: 'c', label: '$0.5$', value: 0.5, trapExplanation: r`$\hat\lambda = \frac{1}{\bar x} = \frac14$, not $\frac{1}{\sqrt4}$.` },
          ],
          correctOptionId: 'a',
          explanation: r`$\hat\lambda = \frac{1}{\bar x} = \frac14 = 0.25$ per minute.`,
        },
      ],
    },
    {
      title: 'Likelihood and loss functions',
      blocks: [
        {
          kind: 'text',
          text: r`Machine-learning losses are usually negative log-likelihoods, and training is maximum likelihood estimation:

• Regression with Gaussian noise: $-\ell = \frac{1}{2\sigma^2}\sum (y_i - \hat y_i)^2 + \text{const}$, so maximising the likelihood is <i>least squares</i>.

• Classification with predicted probabilities $\hat p_i$: $-\ell = -\sum \big[y_i\log\hat p_i + (1 - y_i)\log(1 - \hat p_i)\big]$, the <i>cross-entropy</i> (log loss).`,
        },
        {
          kind: 'example',
          title: 'Log loss of a prediction',
          prompt: r`A classifier gives $\hat p = 0.9$ to a positive example and $\hat p = 0.2$ to a negative one. What is the negative log-likelihood?`,
          steps: [
            r`The likelihood of what happened: $0.9$ for the positive and $1 - 0.2 = 0.8$ for the negative.`,
            r`$-\ell = -\log 0.9 - \log 0.8 \approx 0.105 + 0.223$.`,
            r`$\approx 0.33$. A confident wrong prediction, say $\hat p = 0.01$ for a positive, would alone cost $-\log 0.01 \approx 4.6$.`,
          ],
        },
        {
          kind: 'box',
          variant: 'tip',
          title: 'Why the MLE is the default',
          text: r`For large samples the MLE is consistent, approximately normal and has the smallest possible variance among well-behaved estimators. That is why "fit by maximum likelihood" is the default in statistics and ML.`,
        },
      ],
    },
    {
      title: 'Summary',
      blocks: [
        {
          kind: 'text',
          text: r`• $L(\theta) = \prod f(x_i;\theta)$ is the probability of the data as a function of $\theta$.

• The MLE maximises $L$, equivalently the log-likelihood $\ell = \sum\log f(x_i;\theta)$.

• Bernoulli: $\hat p = \frac kn$; Poisson: $\hat\lambda = \bar x$; exponential: $\hat\lambda = \frac{1}{\bar x}$; normal: $\bar x$ and $\frac1n\sum(x_i - \bar x)^2$.

• Least squares and cross-entropy are negative log-likelihoods.`,
        },
      ],
    },
  ],
  extra,
  questions: practice,
});
