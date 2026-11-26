import type { QuestionTemplate } from '../../../types.ts';
import { r } from '../define.ts';
import { allDistinct, dec, paren, pm, sumOf } from '../gen.ts';
import { jointProbs, jointTable } from './05-covariance.practice.ts';

const r4 = (x: number) => Math.round(x * 1e4) / 1e4;

/** Extra practice (Practice 2): gentler questions on the same ideas, with new numbers every time. */
export const extra: QuestionTemplate[] = [
  {
    id: 'pr-05-x1',
    difficulty: 1,
    keyConceptTag: 'Marginal distributions',
    correctOptionId: 'a',
    generate: (g) => {
      const P = g.until(() => jointProbs(g, 2, 2), (P) => allDistinct([sumOf(P[0]), P[0][0], P[0][0] + P[1][0], 0.5].map(r4)));
      return {
        params: { P },
        promptText: r`$X$ and $Y$ have the joint distribution below. What is $P(X = 0)$?`,
        mathFormula: jointTable([0, 1], [0, 1], P),
        options: [
          { id: 'a', label: `$${dec(r4(sumOf(P[0])))}$`, value: sumOf(P[0]) },
          { id: 'b', label: `$${dec(P[0][0])}$`, value: P[0][0], trapExplanation: r`That is $P(X = 0, Y = 0)$. Add the other cell of the row, $Y = 1$.` },
          { id: 'c', label: `$${dec(r4(P[0][0] + P[1][0]))}$`, value: P[0][0] + P[1][0], trapExplanation: r`That is $P(Y = 0)$, a column sum.` },
          { id: 'd', label: '$0.5$', value: 0.5, trapExplanation: r`The two values of $X$ need not be equally likely; add up the row.` },
        ],
        stepByStepSolution: [
          r`$P(X = 0) = P(X = 0, Y = 0) + P(X = 0, Y = 1)$.`,
          r`$= ${dec(P[0][0])} + ${dec(P[0][1])}$.`,
          r`$= ${dec(r4(sumOf(P[0])))}$.`,
        ],
      };
    },
  },
  {
    id: 'pr-05-x2',
    difficulty: 1,
    keyConceptTag: 'Independent random variables',
    correctOptionId: 'a',
    generate: (g) => {
      const { a, b } = g.until(() => ({ a: g.int(1, 9), b: g.int(1, 9) }), ({ a, b }) => allDistinct([a * b, 10 * (a + b), 5 * (a + b), 10 * (a + b) - a * b]));
      return {
        params: { a, b },
        promptText: r`$X$ and $Y$ are independent 0/1 variables with $P(X = 1) = ${dec(a / 10)}$ and $P(Y = 1) = ${dec(b / 10)}$. What is $P(X = 1, Y = 1)$?`,
        options: [
          { id: 'a', label: `$${dec((a * b) / 100)}$`, value: (a * b) / 100 },
          { id: 'b', label: `$${dec((a + b) / 10)}$`, value: (a + b) / 10, trapExplanation: r`For independent variables the joint probability is a product, not a sum.` },
          { id: 'c', label: `$${dec((a + b) / 20)}$`, value: (a + b) / 20, trapExplanation: r`Averaging the marginals does not give a joint probability.` },
          { id: 'd', label: `$${dec((10 * (a + b) - a * b) / 100)}$`, value: (10 * (a + b) - a * b) / 100, trapExplanation: r`That is $P(X = 1 \text{ or } Y = 1)$.` },
        ],
        stepByStepSolution: [
          r`Independent: $p(x, y) = P(X = x)\,P(Y = y)$.`,
          r`$= ${dec(a / 10)}\cdot${dec(b / 10)}$.`,
          r`$= ${dec((a * b) / 100)}$.`,
        ],
      };
    },
  },
  {
    id: 'pr-05-x3',
    difficulty: 1,
    keyConceptTag: 'Covariance is bilinear',
    correctOptionId: 'a',
    generate: (g) => {
      const { a, b, c } = g.until(
        () => ({ a: g.pick([-3, -2, 2, 3, 4]), b: g.pick([-3, -2, 2, 3, 4]), c: g.nonzero(-5, 5) }),
        ({ a, b, c }) => allDistinct([a * b * c, c, (a + b) * c, a * a * b * b * c]),
      );
      return {
        params: { a, b, c },
        promptText: r`$\operatorname{Cov}(X, Y) = ${c}$. What is $\operatorname{Cov}(${a}X, ${b}Y)$?`,
        options: [
          { id: 'a', label: `$${a * b * c}$`, value: a * b * c },
          { id: 'b', label: `$${c}$`, value: c, trapExplanation: r`Covariance has units: scaling $X$ by ${a} scales it by ${a}. (Correlation is the scale-free version.)` },
          { id: 'c', label: `$${(a + b) * c}$`, value: (a + b) * c, trapExplanation: r`The factors multiply: $\operatorname{Cov}(aX, bY) = ab\operatorname{Cov}(X, Y)$.` },
          { id: 'd', label: `$${a * a * b * b * c}$`, value: a * a * b * b * c, trapExplanation: r`Each variable appears once in the covariance, so each factor appears once — not squared as in a variance.` },
        ],
        stepByStepSolution: [
          r`$\operatorname{Cov}(aX, bY) = ab\,\operatorname{Cov}(X, Y)$.`,
          r`$= ${paren(a)}\cdot${paren(b)}\cdot${paren(c)}$.`,
          r`$= ${a * b * c}$.`,
        ],
      };
    },
  },
  {
    id: 'pr-05-x4',
    difficulty: 2,
    keyConceptTag: 'Expectation of a product',
    correctOptionId: 'a',
    generate: (g) => {
      const { mx, my } = g.until(() => ({ mx: g.nonzero(-4, 6), my: g.nonzero(-4, 6) }), ({ mx, my }) => allDistinct([mx * my, mx + my, 0, mx * mx * my * my]));
      return {
        params: { mx, my },
        promptText: r`$X$ and $Y$ are independent with $E[X] = ${mx}$ and $E[Y] = ${my}$. What is $E[XY]$?`,
        options: [
          { id: 'a', label: `$${mx * my}$`, value: mx * my },
          { id: 'b', label: `$${mx + my}$`, value: mx + my, trapExplanation: r`That is $E[X + Y]$.` },
          { id: 'c', label: '$0$', value: 0, trapExplanation: r`Independence makes the <i>covariance</i> 0, not $E[XY]$: $E[XY] = \operatorname{Cov} + E[X]E[Y]$.` },
          { id: 'd', label: `$${mx * mx * my * my}$`, value: mx * mx * my * my, trapExplanation: r`Nothing is squared: $E[XY] = E[X]\,E[Y]$.` },
        ],
        stepByStepSolution: [
          r`Independent variables are uncorrelated: $\operatorname{Cov}(X, Y) = E[XY] - E[X]E[Y] = 0$.`,
          r`So $E[XY] = E[X]E[Y] = ${paren(mx)}\cdot${paren(my)}$.`,
          r`$= ${mx * my}$.`,
        ],
      };
    },
  },
  {
    id: 'pr-05-x5',
    difficulty: 2,
    keyConceptTag: 'Variance of a difference',
    correctOptionId: 'a',
    generate: (g) => {
      const { sx, sy } = g.until(() => ({ sx: g.int(1, 6), sy: g.int(1, 6) }), ({ sx, sy }) => allDistinct([sx * sx + sy * sy, sx * sx - sy * sy, (sx - sy) ** 2, sx * sx * sy * sy]));
      return {
        params: { vx: sx * sx, vy: sy * sy },
        promptText: r`$X$ and $Y$ are independent with $\operatorname{Var}X = ${sx * sx}$ and $\operatorname{Var}Y = ${sy * sy}$. What is $\operatorname{Var}(X - Y)$?`,
        options: [
          { id: 'a', label: `$${sx * sx + sy * sy}$`, value: sx * sx + sy * sy },
          { id: 'b', label: `$${sx * sx - sy * sy}$`, value: sx * sx - sy * sy, trapExplanation: r`Subtracting $Y$ adds its uncertainty: $\operatorname{Var}(-Y) = (-1)^2\operatorname{Var}Y$.` },
          { id: 'c', label: `$${(sx - sy) ** 2}$`, value: (sx - sy) ** 2, trapExplanation: r`Standard deviations do not subtract; independent variances add.` },
          { id: 'd', label: `$${sx * sx * sy * sy}$`, value: sx * sx * sy * sy, trapExplanation: r`Variances of independent terms add; they don't multiply.` },
        ],
        stepByStepSolution: [
          r`$\operatorname{Var}(X - Y) = \operatorname{Var}X + (-1)^2\operatorname{Var}Y - 2\operatorname{Cov}(X, Y)$, and the covariance is 0.`,
          r`$= ${sx * sx} + ${sy * sy}$.`,
          r`$= ${sx * sx + sy * sy}$.`,
        ],
      };
    },
  },
  {
    id: 'pr-05-x6',
    difficulty: 2,
    keyConceptTag: 'Correlation from a covariance matrix',
    correctOptionId: 'a',
    generate: (g) => {
      const { s1, s2, rho } = g.until(
        () => ({ s1: g.pick([2, 3, 4, 5]), s2: g.pick([2, 3, 4, 5]), rho: g.pick([-0.75, -0.5, -0.25, 0.25, 0.5, 0.75]) }),
        ({ s1, s2, rho }) => {
          const c = rho * s1 * s2;
          return Number.isInteger(c) && allDistinct([rho, c, c / (s1 * s1 * s2 * s2), c / (s1 * s1)].map(r4));
        },
      );
      const c = rho * s1 * s2;
      return {
        params: { sx: s1, sy: s2, rho },
        promptText: r`A covariance matrix is $\Sigma = ${pm([[s1 * s1, c], [c, s2 * s2]])}$. What is the correlation between the two variables?`,
        options: [
          { id: 'a', label: `$${dec(rho)}$`, value: rho },
          { id: 'b', label: `$${c}$`, value: c, trapExplanation: r`That is the covariance $\Sigma_{12}$; divide by $\sigma_1\sigma_2 = ${s1 * s2}$.` },
          { id: 'c', label: `$${dec(r4(c / (s1 * s1 * s2 * s2)))}$`, value: c / (s1 * s1 * s2 * s2), trapExplanation: r`The diagonal holds variances; take their square roots first: $\sigma_1 = ${s1}$, $\sigma_2 = ${s2}$.` },
          { id: 'd', label: `$${dec(r4(c / (s1 * s1)))}$`, value: c / (s1 * s1), trapExplanation: r`Both standard deviations go in the denominator: $\sqrt{\Sigma_{11}\Sigma_{22}}$.` },
        ],
        stepByStepSolution: [
          r`$\sigma_1 = \sqrt{${s1 * s1}} = ${s1}$, $\sigma_2 = \sqrt{${s2 * s2}} = ${s2}$, $\operatorname{Cov} = ${c}$.`,
          r`$\rho = \frac{${c}}{${s1}\cdot${s2}}$.`,
          r`$= ${dec(rho)}$.`,
        ],
      };
    },
  },
];
