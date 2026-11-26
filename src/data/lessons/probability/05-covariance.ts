import { defineLesson, r } from '../define.ts';
import { extra } from './05-covariance.extra.ts';
import { practice } from './05-covariance.practice.ts';

export default defineLesson({
  id: 'pr-05',
  moduleId: 'probability',
  title: 'Joint distributions and covariance',
  blurb: 'How two random variables move together',
  minutes: 8,
  lecture: [
    {
      title: 'Joint and marginal distributions',
      blocks: [
        {
          kind: 'text',
          text: r`Two discrete random variables are described together by their <i>joint distribution</i> $p(x, y) = P(X = x, Y = y)$, a table whose entries add up to 1. Summing a row or a column gives the <i>marginal</i> distributions:`,
        },
        { kind: 'formula', tex: r`P(X = x) = \sum_y p(x, y), \qquad P(Y = y \mid X = x) = \frac{p(x, y)}{P(X = x)}` },
        {
          kind: 'quiz',
          id: 'pr-05-q1',
          prompt: r`$p(0, 0) = 0.3$, $p(0, 1) = 0.2$, $p(1, 0) = 0.1$, $p(1, 1) = 0.4$. What is $P(Y = 1)$?`,
          options: [
            { id: 'a', label: '$0.6$', value: 0.6 },
            { id: 'b', label: '$0.4$', value: 0.4, trapExplanation: r`That is $p(1, 1)$ only. $Y = 1$ also happens together with $X = 0$.` },
            { id: 'c', label: '$0.5$', value: 0.5, trapExplanation: r`That is $P(X = 0) = 0.3 + 0.2$, a row instead of a column.` },
          ],
          correctOptionId: 'a',
          explanation: r`$P(Y = 1) = p(0, 1) + p(1, 1) = 0.2 + 0.4 = 0.6$.`,
        },
      ],
    },
    {
      title: 'Independent random variables',
      blocks: [
        {
          kind: 'text',
          text: r`$X$ and $Y$ are independent when every cell factorises: $p(x, y) = P(X = x)\,P(Y = y)$. Then $E[XY] = E[X]\,E[Y]$, and knowing $X$ tells nothing about $Y$. In the table above, $p(1, 1) = 0.4$ but $P(X = 1)P(Y = 1) = 0.5\cdot0.6 = 0.3$: dependent.`,
        },
      ],
    },
    {
      title: 'Covariance and correlation',
      blocks: [
        { kind: 'formula', tex: r`\operatorname{Cov}(X, Y) = E\big[(X - \mu_X)(Y - \mu_Y)\big] = E[XY] - E[X]E[Y], \qquad \rho = \frac{\operatorname{Cov}(X, Y)}{\sigma_X\sigma_Y}` },
        {
          kind: 'text',
          text: r`Covariance is positive when $X$ and $Y$ tend to be above their means together, negative when one tends to be above while the other is below. Its size depends on units; the <i>correlation</i> $\rho$ is unit-free and always lies in $[-1, 1]$, with $\pm1$ only for an exact linear relation.`,
        },
        { kind: 'diagram', type: 'scatterCorr', caption: r`Clouds of points with correlation close to $+0.9$, close to 0, and close to $-0.9$.` },
        {
          kind: 'quiz',
          id: 'pr-05-q2',
          prompt: r`For the table in the first section, what is $\operatorname{Cov}(X, Y)$?`,
          options: [
            { id: 'a', label: '$0.1$', value: 0.1 },
            { id: 'b', label: '$0.4$', value: 0.4, trapExplanation: r`0.4 is $E[XY] = p(1, 1)$; subtract $E[X]E[Y] = 0.5\cdot0.6$.` },
            { id: 'c', label: '$0.3$', value: 0.3, trapExplanation: r`0.3 is $E[X]E[Y]$, only the second term.` },
          ],
          correctOptionId: 'a',
          explanation: r`$E[XY] - E[X]E[Y] = 0.4 - 0.3 = 0.1 > 0$: $X$ and $Y$ tend to be 1 together.`,
        },
        {
          kind: 'box',
          variant: 'pitfall',
          title: 'Uncorrelated is not independent',
          text: r`If $X$ is $-1, 0, 1$ with equal probability and $Y = X^2$, then $\operatorname{Cov}(X, Y) = E[X^3] - E[X]E[X^2] = 0$, yet $Y$ is completely determined by $X$. Covariance only detects <i>linear</i> relationships.`,
        },
      ],
    },
    {
      title: 'Covariance matrices',
      blocks: [
        {
          kind: 'text',
          text: r`For a random vector $\mathbf{X} = (X_1, \dots, X_n)$, the covariance matrix has $\Sigma_{ij} = \operatorname{Cov}(X_i, X_j)$, with variances on the diagonal. It is symmetric and positive semidefinite — exactly the matrices of the spectral-decomposition lesson, and the starting point of PCA.`,
        },
        { kind: 'formula', tex: r`\operatorname{Var}(\mathbf{a}^T\mathbf{X}) = \mathbf{a}^T\Sigma\,\mathbf{a}, \qquad \operatorname{Var}(X + Y) = \operatorname{Var}X + \operatorname{Var}Y + 2\operatorname{Cov}(X, Y)` },
        {
          kind: 'quiz',
          id: 'pr-05-q3',
          prompt: r`$\operatorname{Var}X = 4$, $\operatorname{Var}Y = 9$, $\operatorname{Cov}(X, Y) = -3$. What is $\operatorname{Var}(X + Y)$?`,
          options: [
            { id: 'a', label: '$7$', value: 7 },
            { id: 'b', label: '$13$', value: 13, trapExplanation: r`Variances simply add only when the covariance is 0. Here add $2\cdot(-3)$.` },
            { id: 'c', label: '$10$', value: 10, trapExplanation: r`The covariance enters twice: $2\operatorname{Cov}(X, Y)$.` },
          ],
          correctOptionId: 'a',
          explanation: r`$4 + 9 + 2\cdot(-3) = 7$: negatively correlated parts partly cancel — the idea behind diversification.`,
        },
      ],
    },
    {
      title: 'Summary',
      blocks: [
        {
          kind: 'text',
          text: r`• Joint table $p(x, y)$; marginals are row and column sums.

• Independent: $p(x, y) = p_X(x)\,p_Y(y)$ for every cell.

• $\operatorname{Cov}(X, Y) = E[XY] - E[X]E[Y]$; $\rho = \operatorname{Cov}/(\sigma_X\sigma_Y) \in [-1, 1]$.

• Uncorrelated does not imply independent.

• $\operatorname{Var}(X + Y) = \operatorname{Var}X + \operatorname{Var}Y + 2\operatorname{Cov}$; $\operatorname{Var}(\mathbf{a}^T\mathbf{X}) = \mathbf{a}^T\Sigma\mathbf{a}$.`,
        },
      ],
    },
  ],
  extra,
  questions: practice,
});
