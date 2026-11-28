import { defineLesson, r } from '../define.ts';
import { extra } from './12-pca.extra.ts';
import { practice } from './12-pca.practice.ts';

export default defineLesson({
  id: 'la-12',
  moduleId: 'linalg',
  title: 'Principal component analysis',
  blurb: 'Covariance, principal directions and explained variance',
  minutes: 8,
  deeper: [
    { title: 'Principal Component Analysis (PCA), step by step', url: 'https://www.youtube.com/watch?v=FgakZw6K1QQ', source: 'StatQuest with Josh Starmer · video' },
    { title: 'Mathematics for Machine Learning, chapter 10: dimensionality reduction with PCA', url: 'https://mml-book.github.io/', source: 'Deisenroth, Faisal & Ong, Mathematics for Machine Learning · free textbook' },
  ],
  lecture: [
    {
      title: 'Variance and covariance in one minute',
      covers: ['3', 'x4', 'x5'],
      blocks: [
        {
          kind: 'text',
          text: r`PCA needs two ideas from statistics; the probability module treats them in full (expectation and variance, then joint distributions and covariance). Here is the short version for a data table $X$ with $n$ rows (samples) and $d$ columns (features).

<i>Centre</i> each column: subtract its mean, so every column averages 0. Then:

• the <i>variance</i> of a feature is the average squared value, $\frac{1}{n - 1}\sum_i x_i^2$: how spread out it is;

• the <i>covariance</i> of two features is $\frac{1}{n - 1}\sum_i x_i y_i$: positive if they tend to be large together, negative if one is large when the other is small.`,
        },
        { kind: 'formula', tex: r`C = \frac{1}{n - 1}X^TX, \qquad C_{jj} = \text{variance of feature } j, \quad C_{jk} = \text{covariance of features } j, k`, caption: r`The covariance matrix of centred data. Dividing by $n - 1$ rather than $n$ is the usual sample convention.` },
        {
          kind: 'example',
          title: 'A covariance matrix by hand',
          prompt: r`Three samples of two features: $(5, 3)$, $(3, 2)$, $(1, 1)$. Find the covariance matrix.`,
          steps: [
            r`Means: $\frac{5 + 3 + 1}{3} = 3$ and $\frac{3 + 2 + 1}{3} = 2$. Centred rows: $(2, 1)$, $(0, 0)$, $(-2, -1)$.`,
            r`Variance of feature 1: $\frac{2^2 + 0^2 + (-2)^2}{3 - 1} = \frac82 = 4$. Of feature 2: $\frac{1 + 0 + 1}{2} = 1$.`,
            r`Covariance: $\frac{2\cdot1 + 0\cdot0 + (-2)(-1)}{2} = \frac42 = 2$: the features grow together.`,
            r`$C = \begin{pmatrix} 4 & 2 \\ 2 & 1 \end{pmatrix}$, a symmetric matrix.`,
          ],
        },
        {
          kind: 'quiz',
          id: 'la-12-q1',
          prompt: r`A centred feature takes the values $3, -1, -2$ on three samples. What is its variance?`,
          options: [
            { id: 'a', label: '$7$', value: 7 },
            { id: 'b', label: r`$\tfrac{14}{3}$`, value: 14 / 3, trapExplanation: r`The sample variance divides by $n - 1 = 2$, not by $n = 3$.` },
            { id: 'c', label: '$0$', value: 0, trapExplanation: r`The values average 0 — that is what centring means. The variance averages their <i>squares</i>.` },
          ],
          correctOptionId: 'a',
          explanation: r`$\frac{9 + 1 + 4}{3 - 1} = \frac{14}{2} = 7$.`,
        },
      ],
    },
    {
      title: 'Principal components',
      covers: ['x1', 'x2', 'x6'],
      blocks: [
        {
          kind: 'text',
          text: r`The covariance matrix is symmetric and positive semidefinite, so by the spectral theorem it has perpendicular eigenvectors with eigenvalues $\lambda_1 \ge \lambda_2 \ge \dots \ge 0$. These eigenvectors are the <i>principal components</i> (PCs):

• the eigenvalue $\lambda_i$ is the variance of the data along PC $i$, so its standard deviation there is $\sqrt{\lambda_i}$;

• PC1 is the direction of largest variance; PC2 the largest among directions perpendicular to PC1, and so on;

• the total variance $\operatorname{tr}C$ (the sum of the feature variances) equals $\lambda_1 + \dots + \lambda_d$.

The same directions come out of the SVD of the centred data: the PCs are the right singular vectors of $X$, and $\lambda_i = \frac{\sigma_i^2}{n - 1}$.`,
        },
        { kind: 'diagram', type: 'pca', caption: r`PC1 points along the direction of largest spread; PC2 is perpendicular to it. Keeping only PC1 turns 2D data into 1D with little loss.` },
        {
          kind: 'example',
          title: 'Finding PC1',
          prompt: r`Centred data has covariance $C = \begin{pmatrix} 5 & 2 \\ 2 & 2 \end{pmatrix}$. Find the principal components.`,
          steps: [
            r`Eigenvalues: trace 7, determinant 6, so $\lambda_1 = 6$ and $\lambda_2 = 1$.`,
            r`For $\lambda = 6$: $(C - 6I)\mathbf{v} = \mathbf{0}$ gives $-v_1 + 2v_2 = 0$, so PC1 points along $(2, 1)$. Check: $C(2, 1) = (12, 6) = 6\,(2, 1)$. ✓`,
            r`PC2 is perpendicular: $(-1, 2)$, with variance 1.`,
            r`The total variance $5 + 2 = 7 = 6 + 1$ is shared out among the components, not changed.`,
          ],
        },
      ],
    },
    {
      title: 'Explained variance',
      covers: ['1', '2', '5', '6', 'x3'],
      blocks: [
        {
          kind: 'formula',
          tex: r`\text{share of variance explained by PC}_i = \frac{\lambda_i}{\lambda_1 + \dots + \lambda_d} = \frac{\sigma_i^2}{\sigma_1^2 + \dots + \sigma_d^2}`,
        },
        {
          kind: 'example',
          title: 'How many components to keep',
          prompt: r`The covariance matrix of a dataset with 4 features has eigenvalues $12, 5, 2, 1$. What share does PC1 explain, and how many PCs keep at least 90% of the variance?`,
          steps: [
            r`Total variance: $12 + 5 + 2 + 1 = 20$ (also $\operatorname{tr}C$).`,
            r`PC1: $\frac{12}{20} = 60\%$.`,
            r`Add components until 90% is reached: one PC gives 60%, two give $\frac{17}{20} = 85\%$, three give $\frac{19}{20} = 95\%$.`,
            r`So 3 components are needed; 4 features become 3 numbers per sample.`,
          ],
        },
        {
          kind: 'quiz',
          id: 'la-12-q2',
          prompt: r`The covariance matrix of some data has eigenvalues $8$, $1.5$ and $0.5$. What share of the variance does PC1 explain?`,
          options: [
            { id: 'a', label: '$80\\%$', value: 80 },
            { id: 'b', label: r`$33\%$`, value: 100 / 3, trapExplanation: r`The components do not share the variance equally: PC1 carries $\frac{8}{10}$ of it.` },
            { id: 'c', label: r`$94\%$`, value: (8 / 8.5) * 100, trapExplanation: r`$\frac{8}{8.5}$ leaves out the last eigenvalue: the total is $8 + 1.5 + 0.5 = 10$.` },
          ],
          correctOptionId: 'a',
          explanation: r`$\frac{8}{8 + 1.5 + 0.5} = \frac{8}{10} = 80\%$.`,
        },
      ],
    },
    {
      title: 'Using PCA',
      covers: ['4'],
      blocks: [
        {
          kind: 'text',
          text: r`To reduce the data, describe each centred sample $\mathbf{x}$ by its <i>scores</i>: its coordinates along the first few PCs, $z_i = \mathbf{x}\cdot\mathbf{v}_i$ with $\mathbf{v}_i$ a <i>unit</i> vector. With $k$ PCs, $d$ numbers per sample become $k$.`,
        },
        {
          kind: 'example',
          title: 'A score on PC1',
          prompt: r`PC1 points along $(3, 4)$. What is the PC1 score of the centred sample $\mathbf{x} = (2, -1)$?`,
          steps: [
            r`Make the direction a unit vector: $\|(3, 4)\| = 5$, so $\mathbf{v}_1 = (0.6, 0.8)$.`,
            r`Score: $z_1 = \mathbf{x}\cdot\mathbf{v}_1 = 2\cdot 0.6 + (-1)\cdot 0.8 = 0.4$.`,
            r`Dotting with $(3, 4)$ itself would give $2$, five times too large: the length of the direction vector would leak into the score.`,
          ],
        },
        {
          kind: 'box',
          variant: 'pitfall',
          title: 'Centre and scale first',
          text: r`Without centring, PC1 just points at the mean of the data. And if features are in different units (metres and grams), the one with the biggest numbers dominates: standardise the columns first unless the units are comparable.`,
        },
        {
          kind: 'quiz',
          id: 'la-12-q3',
          prompt: r`Two centred features: height in centimetres (variance 100) and weight in tonnes (variance 0.0001), uncorrelated. Without standardising, where does PC1 point?`,
          options: [
            { id: 'a', label: 'Almost exactly along height' },
            { id: 'b', label: 'Almost exactly along weight', trapExplanation: r`PC1 follows the largest variance, and in these units height's 100 dwarfs weight's 0.0001.` },
            { id: 'c', label: 'Diagonally, between the two', trapExplanation: r`A diagonal PC1 would need comparable variances or a strong correlation. Here the covariance matrix is $\operatorname{diag}(100, 0.0001)$.` },
          ],
          correctOptionId: 'a',
          explanation: r`$C = \operatorname{diag}(100, 0.0001)$: PC1 is the height axis. The units decided that, not the data — which is why features are standardised first.`,
        },
      ],
    },
    {
      title: 'Summary',
      blocks: [
        {
          kind: 'text',
          text: r`• Centre the data; $C = \frac{1}{n - 1}X^TX$: variances on the diagonal, covariances off it.

• PCs = eigenvectors of $C$ (= right singular vectors of $X$); $\lambda_i$ = variance along PC $i$.

• Total variance $\operatorname{tr}C = \sum\lambda_i$; PC $i$ explains $\lambda_i / \sum\lambda_j$.

• Scores: dot the centred sample with the <i>unit</i> PC direction.

• Standardise features measured in different units.`,
        },
      ],
    },
  ],
  extra,
  questions: practice,
});
