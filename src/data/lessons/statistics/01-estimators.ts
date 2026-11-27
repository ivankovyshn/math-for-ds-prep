import { defineLesson, r } from '../define.ts';
import { extra } from './01-estimators.extra.ts';
import { practice } from './01-estimators.practice.ts';

export default defineLesson({
  id: 'st-01',
  moduleId: 'statistics',
  title: 'Estimators, bias and variance',
  blurb: 'Guessing a parameter from data, and measuring how good the guess is',
  minutes: 7,
  lecture: [
    {
      title: 'Estimators',
      blocks: [
        {
          kind: 'text',
          text: r`Statistics runs probability backwards. The data $x_1, \dots, x_n$ are a sample from a distribution whose parameter $\theta$ (a mean $\mu$, a variance $\sigma^2$, a proportion $p$) is unknown. An <i>estimator</i> $\hat\theta$ is any rule that turns the sample into a guess for $\theta$. The two workhorses are the sample mean and the sample variance:`,
        },
        { kind: 'formula', tex: r`\bar x = \frac1n\sum_{i=1}^n x_i, \qquad s^2 = \frac{1}{n-1}\sum_{i=1}^n (x_i - \bar x)^2` },
        {
          kind: 'text',
          text: r`A new sample gives a new estimate, so $\hat\theta$ is a random variable with its own distribution, the <i>sampling distribution</i>. Judging an estimator means judging that distribution: where it is centred and how widely it spreads.`,
        },
        {
          kind: 'quiz',
          id: 'st-01-q1',
          prompt: r`What is the sample mean of the data $2,\ 4,\ 9$?`,
          options: [
            { id: 'a', label: '$5$', value: 5 },
            { id: 'b', label: '$4$', value: 4, trapExplanation: r`4 is the median, the middle value. The mean adds the values and divides by $n$.` },
            { id: 'c', label: '$7.5$', value: 7.5, trapExplanation: r`That divides the sum 15 by $n - 1 = 2$. The mean divides by $n = 3$.` },
          ],
          correctOptionId: 'a',
          explanation: r`$\bar x = \frac{2 + 4 + 9}{3} = \frac{15}{3} = 5$.`,
        },
      ],
    },
    {
      title: 'Bias',
      blocks: [
        {
          kind: 'box',
          variant: 'definition',
          title: 'Bias',
          text: r`$\operatorname{Bias}(\hat\theta) = E[\hat\theta] - \theta$. The estimator is <i>unbiased</i> if $E[\hat\theta] = \theta$: on average over many samples it hits the true value.`,
        },
        {
          kind: 'text',
          text: r`The sample mean is unbiased: $E[\bar X] = \mu$ by linearity. The variance is subtler. Deviations measured from $\bar x$ are systematically smaller than deviations from the unknown $\mu$, because $\bar x$ is fitted to the same data. Dividing by $n$ underestimates:`,
        },
        { kind: 'formula', tex: r`E\Big[\frac1n\sum (X_i - \bar X)^2\Big] = \frac{n-1}{n}\,\sigma^2, \qquad E[s^2] = \sigma^2` },
        {
          kind: 'text',
          text: r`Dividing by $n - 1$ instead (Bessel's correction) removes the bias. It matters for small samples; for $n = 1000$ the two versions are practically equal.`,
        },
        {
          kind: 'quiz',
          id: 'st-01-q2',
          prompt: r`What is the sample variance $s^2$ of the data $1,\ 3,\ 5$?`,
          options: [
            { id: 'a', label: '$4$', value: 4 },
            { id: 'b', label: r`$\tfrac83$`, value: 8 / 3, trapExplanation: r`That divides by $n = 3$. The unbiased $s^2$ divides by $n - 1 = 2$.` },
            { id: 'c', label: '$8$', value: 8, trapExplanation: r`8 is the sum of squared deviations; it still has to be divided by $n - 1$.` },
          ],
          correctOptionId: 'a',
          explanation: r`$\bar x = 3$; squared deviations $4 + 0 + 4 = 8$; $s^2 = \frac{8}{2} = 4$.`,
        },
      ],
    },
    {
      title: 'Variance and mean squared error',
      blocks: [
        {
          kind: 'text',
          text: r`Being right on average is not enough: an estimator can be unbiased and still jump wildly from sample to sample. Its spread is $\operatorname{Var}\hat\theta$, and the standard deviation of $\hat\theta$ is its <i>standard error</i>. For the sample mean, $\operatorname{Var}\bar X = \frac{\sigma^2}{n}$.`,
        },
        {
          kind: 'box',
          variant: 'theorem',
          title: 'Mean squared error',
          text: r`$\operatorname{MSE}(\hat\theta) = E\big[(\hat\theta - \theta)^2\big] = \operatorname{Bias}(\hat\theta)^2 + \operatorname{Var}\hat\theta$.`,
        },
        { kind: 'diagram', type: 'biasVariance', caption: r`Estimates from many samples, with the true value at the centre. Left: unbiased but scattered. Right: tightly clustered but off target. Both contribute to the MSE.` },
        {
          kind: 'quiz',
          id: 'st-01-q3',
          prompt: r`An estimator has bias 2 and variance 5. What is its mean squared error?`,
          options: [
            { id: 'a', label: '$9$', value: 9 },
            { id: 'b', label: '$7$', value: 7, trapExplanation: r`The bias enters squared: $2^2 + 5$.` },
            { id: 'c', label: '$5$', value: 5, trapExplanation: r`The variance alone ignores that the estimator is off target on average.` },
          ],
          correctOptionId: 'a',
          explanation: r`$\operatorname{MSE} = 2^2 + 5 = 9$.`,
        },
      ],
    },
    {
      title: 'Trading bias for variance',
      blocks: [
        {
          kind: 'text',
          text: r`Since the MSE adds both parts, a small bias can be worth paying for a large drop in variance. Shrinking an estimate towards zero is the classic way.`,
        },
        {
          kind: 'example',
          title: 'Shrinking the sample mean',
          prompt: r`Let $\mu = 1$, $\sigma^2 = 16$ and $n = 4$. Compare $\bar X$ with $\tilde\theta = \frac12\bar X$.`,
          steps: [
            r`$\bar X$: unbiased with variance $\frac{16}{4} = 4$, so $\operatorname{MSE} = 4$.`,
            r`$\tilde\theta$: $E[\tilde\theta] = \frac12$, so the bias is $-\frac12$; the variance is $\frac14\cdot4 = 1$.`,
            r`$\operatorname{MSE}(\tilde\theta) = \frac14 + 1 = 1.25$, much better here. But for $\mu = 10$ the bias is $-5$ and the MSE is $26$: shrinkage helps only when the truth is near the target.`,
          ],
        },
        {
          kind: 'box',
          variant: 'tip',
          title: 'Where this shows up',
          text: r`Regularisation in machine learning (ridge regression, weight decay) is exactly this trade: it shrinks coefficients, adds a little bias and removes a lot of variance. The same idea is called the bias–variance tradeoff when choosing model complexity.`,
        },
        {
          kind: 'text',
          text: r`A minimum requirement for any estimator is <i>consistency</i>: $\hat\theta \to \theta$ as $n \to \infty$. The sample mean is consistent by the law of large numbers.`,
        },
      ],
    },
    {
      title: 'Summary',
      blocks: [
        {
          kind: 'text',
          text: r`• An estimator $\hat\theta$ is a function of the sample; it is random and has a sampling distribution.

• $\bar x$ estimates $\mu$; $s^2$ with divisor $n - 1$ estimates $\sigma^2$ without bias.

• $\operatorname{Bias} = E[\hat\theta] - \theta$; standard error $= \operatorname{SD}(\hat\theta)$; $\operatorname{Var}\bar X = \frac{\sigma^2}{n}$.

• $\operatorname{MSE} = \operatorname{Bias}^2 + \operatorname{Var}$: a biased estimator can beat an unbiased one.`,
        },
      ],
    },
  ],
  extra,
  questions: practice,
});
