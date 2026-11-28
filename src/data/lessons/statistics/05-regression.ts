import { defineLesson, r } from '../define.ts';
import { extra } from './05-regression.extra.ts';
import { practice } from './05-regression.practice.ts';

export default defineLesson({
  id: 'st-05',
  moduleId: 'statistics',
  title: 'Linear regression',
  blurb: 'Fitting a line by least squares, and how much of the data it explains',
  minutes: 8,
  deeper: [
    { title: 'Regression analysis', url: 'https://seeing-theory.brown.edu/regression-analysis/index.html', source: 'Seeing Theory (Brown University) · interactive visualisation' },
    { title: 'Linear regression model', url: 'https://www.statlect.com/fundamentals-of-statistics/linear-regression', source: 'StatLect · free textbook page with proofs and exercises' },
  ],
  lecture: [
    {
      title: 'The model and least squares',
      covers: ['1', '2', 'x1', 'x2'],
      blocks: [
        {
          kind: 'text',
          text: r`Simple linear regression models a response $y$ as a straight-line function of a feature $x$ plus noise: $y_i = \beta_0 + \beta_1 x_i + \varepsilon_i$. A fitted line $\hat y = \hat\beta_0 + \hat\beta_1 x$ leaves <i>residuals</i> $e_i = y_i - \hat y_i$. Least squares picks the line that minimises their squares:`,
        },
        { kind: 'formula', tex: r`\min_{\beta_0,\ \beta_1}\ \sum_{i=1}^n \big(y_i - \beta_0 - \beta_1 x_i\big)^2` },
        { kind: 'diagram', type: 'regression', caption: r`The least-squares line and the residuals (dashed). Squaring makes big misses expensive and lets positive and negative residuals not cancel.` },
        {
          kind: 'quiz',
          id: 'st-05-q1',
          prompt: r`The fitted line is $\hat y = 1 + 2x$. What is the residual of the data point $(3, 9)$?`,
          options: [
            { id: 'a', label: '$2$', value: 2 },
            { id: 'b', label: '$-2$', value: -2, trapExplanation: r`The residual is observed minus predicted, $y - \hat y = 9 - 7$. The point lies above the line.` },
            { id: 'c', label: '$7$', value: 7, trapExplanation: r`7 is the prediction $\hat y$; the residual is the gap $9 - 7$.` },
          ],
          correctOptionId: 'a',
          explanation: r`$\hat y = 1 + 2\cdot3 = 7$, so $e = 9 - 7 = 2$.`,
        },
      ],
    },
    {
      title: 'The formulas',
      covers: ['3', '4', 'x4', 'x5'],
      blocks: [
        {
          kind: 'text',
          text: r`Setting both partial derivatives to zero gives the slope and the intercept. With $S_{xy} = \sum (x_i - \bar x)(y_i - \bar y)$ and $S_{xx} = \sum (x_i - \bar x)^2$:`,
        },
        { kind: 'formula', tex: r`\hat\beta_1 = \frac{S_{xy}}{S_{xx}} = r\,\frac{s_y}{s_x}, \qquad \hat\beta_0 = \bar y - \hat\beta_1\bar x` },
        {
          kind: 'text',
          text: r`So the fitted line always passes through the point of means $(\bar x, \bar y)$, and its slope is the correlation rescaled from standard deviations to the units of the data.`,
        },
        {
          kind: 'example',
          title: 'A slope by hand',
          prompt: r`Fit a least-squares line to $(0, 1)$, $(1, 3)$, $(2, 2)$, $(3, 6)$.`,
          steps: [
            r`Means: $\bar x = 1.5$, $\bar y = 3$. Deviations: $x - \bar x = -1.5, -0.5, 0.5, 1.5$ and $y - \bar y = -2, 0, -1, 3$.`,
            r`$S_{xy} = 3 + 0 - 0.5 + 4.5 = 7$ and $S_{xx} = 2.25 + 0.25 + 0.25 + 2.25 = 5$.`,
            r`$\hat\beta_1 = \frac{S_{xy}}{S_{xx}} = 1.4$ and $\hat\beta_0 = \bar y - \hat\beta_1\bar x = 3 - 2.1 = 0.9$.`,
            r`The line $\hat y = 0.9 + 1.4x$ passes through $(\bar x, \bar y)$, as every least-squares line does.`,
          ],
        },
        {
          kind: 'quiz',
          id: 'st-05-q2',
          prompt: r`What is the least-squares slope for the points $(0, 1), (1, 3), (2, 2), (3, 6)$?`,
          options: [
            { id: 'a', label: '$1.4$', value: 1.4 },
            { id: 'b', label: r`$\tfrac53$`, value: 5 / 3, trapExplanation: r`That is the slope through the first and last points only. Least squares uses all four: $\frac{S_{xy}}{S_{xx}} = \frac{7}{5}$.` },
            { id: 'c', label: '$7$', value: 7, trapExplanation: r`$S_{xy} = 7$ still has to be divided by $S_{xx} = 5$.` },
          ],
          correctOptionId: 'a',
          explanation: r`$\bar x = 1.5$, $\bar y = 3$; $S_{xy} = 3 + 0 - 0.5 + 4.5 = 7$, $S_{xx} = 5$; slope $= 1.4$.`,
        },
      ],
    },
    {
      title: 'How good is the fit?',
      covers: ['5', 'x3', 'x6'],
      blocks: [
        {
          kind: 'text',
          text: r`Compare the residual variation with the total variation of $y$ around its mean:`,
        },
        { kind: 'formula', tex: r`R^2 = 1 - \frac{\mathrm{SS}_{\text{res}}}{\mathrm{SS}_{\text{tot}}} = 1 - \frac{\sum (y_i - \hat y_i)^2}{\sum (y_i - \bar y)^2}` },
        {
          kind: 'text',
          text: r`$R^2$ is the share of the variance of $y$ explained by the line: 0 means the line is no better than predicting $\bar y$, 1 means a perfect fit. For simple regression $R^2 = r^2$, the squared correlation.`,
        },
        {
          kind: 'example',
          title: 'R² from the sums',
          prompt: r`Find $R^2$ for the points $(1, 1)$, $(2, 3)$, $(3, 2)$.`,
          steps: [
            r`$\bar x = 2$, $\bar y = 2$. $S_{xx} = 1 + 0 + 1 = 2$, $S_{yy} = 1 + 1 + 0 = 2$, $S_{xy} = (-1)(-1) + 0 + (1)(0) = 1$.`,
            r`For a line fitted by least squares, $R^2 = r^2 = \frac{S_{xy}^2}{S_{xx}S_{yy}} = \frac{1}{2\cdot 2} = 0.25$.`,
            r`Check with $1 - \frac{\mathrm{SS}_{\text{res}}}{\mathrm{SS}_{\text{tot}}}$: the line is $\hat y = 1 + 0.5x$, with residuals $-0.5, 1, -0.5$, so $\mathrm{SS}_{\text{res}} = 1.5$ and $1 - \frac{1.5}{2} = 0.25$. ✓`,
          ],
        },
        {
          kind: 'quiz',
          id: 'st-05-q3',
          prompt: r`The correlation between $x$ and $y$ is $r = 0.8$. What share of the variance of $y$ does the regression line explain?`,
          options: [
            { id: 'a', label: '$0.64$', value: 0.64 },
            { id: 'b', label: '$0.8$', value: 0.8, trapExplanation: r`$R^2$ is the <i>square</i> of the correlation.` },
            { id: 'c', label: '$0.36$', value: 0.36, trapExplanation: r`0.36 is the unexplained share $1 - R^2$.` },
          ],
          correctOptionId: 'a',
          explanation: r`$R^2 = r^2 = 0.8^2 = 0.64$: 64% explained.`,
        },
      ],
    },
    {
      title: 'Many features: the matrix form',
      covers: ['6'],
      blocks: [
        {
          kind: 'text',
          text: r`With several features, stack the data into a design matrix $X$ (a column of ones for the intercept, then one column per feature). Least squares minimises $\lVert y - X\beta\rVert^2$, and the gradient condition gives the <i>normal equations</i>:`,
        },
        { kind: 'formula', tex: r`X^\top X\,\hat\beta = X^\top y \quad\Longrightarrow\quad \hat\beta = (X^\top X)^{-1}X^\top y` },
        {
          kind: 'text',
          text: r`Geometrically, $X\hat\beta$ is the orthogonal projection of $y$ onto the column space of $X$ (see the Linear Algebra lesson on projections). Statistically, if the noise is $N(0, \sigma^2)$, least squares is maximum likelihood.`,
        },
        {
          kind: 'box',
          variant: 'pitfall',
          title: 'What a regression does not tell you',
          text: r`A slope measures association, not causation: ice-cream sales predict drownings because both rise in summer. Predictions far outside the range of the observed $x$ (extrapolation) rely on the line staying straight where there is no data. A few outliers can pull a least-squares line a long way.`,
        },
        {
          kind: 'example',
          title: 'Solving the normal equations',
          prompt: r`Data $x = 1, 2, 3$ and $y = 2, 3, 4$, with an intercept column. Solve $X^\top X\hat\beta = X^\top y$.`,
          steps: [
            r`$X$ has rows $(1, x_i)$: $X^\top X = \begin{pmatrix} 3 & 6 \\ 6 & 14 \end{pmatrix}$ (count, $\sum x$; $\sum x$, $\sum x^2$) and $X^\top y = (9, 20)$ ($\sum y$, $\sum xy$).`,
            r`$\det = 42 - 36 = 6$, so $(X^\top X)^{-1} = \frac16\begin{pmatrix} 14 & -6 \\ -6 & 3 \end{pmatrix}$.`,
            r`$\hat\beta = \frac16(14\cdot9 - 6\cdot20,\ -6\cdot9 + 3\cdot20) = \frac16(6, 6) = (1, 1)$.`,
            r`The fit is $\hat y = 1 + x$, which passes through all three points exactly.`,
          ],
        },
      ],
    },
    {
      title: 'Summary',
      blocks: [
        {
          kind: 'text',
          text: r`• Model $y = \beta_0 + \beta_1 x + \varepsilon$; residual $e_i = y_i - \hat y_i$; least squares minimises $\sum e_i^2$.

• $\hat\beta_1 = \frac{S_{xy}}{S_{xx}} = r\frac{s_y}{s_x}$ and $\hat\beta_0 = \bar y - \hat\beta_1\bar x$: the line passes through $(\bar x, \bar y)$.

• $R^2 = 1 - \frac{\mathrm{SS}_{\text{res}}}{\mathrm{SS}_{\text{tot}}}$, and $R^2 = r^2$ for one feature.

• Matrix form: $X^\top X\hat\beta = X^\top y$, a projection of $y$ onto the columns of $X$.`,
        },
      ],
    },
  ],
  extra,
  questions: practice,
});
