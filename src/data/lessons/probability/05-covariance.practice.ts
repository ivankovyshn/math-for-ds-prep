import type { QuestionTemplate, Rng } from '../../../types.ts';
import { r } from '../define.ts';
import { allDistinct, dec, paren, pm, sumOf } from '../gen.ts';

/** A joint table P(X = x, Y = y): rows are values of X, columns values of Y. */
export const jointTable = (xs: number[], ys: number[], P: number[][]) =>
  `\\begin{array}{c|${'c'.repeat(ys.length)}} X \\backslash Y & ${ys.join(' & ')} \\\\ \\hline ${xs.map((x, i) => `${x} & ${P[i].map((p) => dec(p)).join(' & ')}`).join(' \\\\ ')} \\end{array}`;

/** A rows × cols table of probabilities in multiples of 0.05, all positive, adding up to 1. */
export function jointProbs(g: Rng, rows: number, cols: number): number[][] {
  const cells = g.until(
    () => {
      const c = Array.from({ length: rows * cols - 1 }, () => g.int(1, 5));
      return [...c, 20 - sumOf(c)];
    },
    (c) => c[c.length - 1] >= 1,
  );
  return Array.from({ length: rows }, (_, i) => cells.slice(i * cols, (i + 1) * cols).map((k) => k / 20));
}
const r4 = (x: number) => Math.round(x * 1e4) / 1e4;
const RHOS = [-0.8, -0.75, -0.6, -0.5, -0.25, -0.2, 0.2, 0.25, 0.5, 0.6, 0.75, 0.8];

export const practice: QuestionTemplate[] = [
  {
    id: 'pr-05-1',
    difficulty: 1,
    keyConceptTag: 'Marginal distributions',
    correctOptionId: 'a',
    generate: (g) => {
      const { P, y } = g.until(
        () => ({ P: jointProbs(g, 2, 3), y: g.int(0, 2) }),
        ({ P, y }) => allDistinct([P[0][y] + P[1][y], P[1][y], sumOf(P[1]), 1 / 3].map(r4)),
      );
      const col = P[0][y] + P[1][y];
      return {
        params: { P, y },
        promptText: r`$X$ and $Y$ have the joint distribution below. What is $P(Y = ${y})$?`,
        mathFormula: jointTable([0, 1], [0, 1, 2], P),
        options: [
          { id: 'a', label: `$${dec(r4(col))}$`, value: col },
          { id: 'b', label: `$${dec(P[1][y])}$`, value: P[1][y], trapExplanation: r`That is $P(X = 1, Y = ${y})$, one cell. $Y = ${y}$ can happen with $X = 0$ too.` },
          { id: 'c', label: `$${dec(r4(sumOf(P[1])))}$`, value: sumOf(P[1]), trapExplanation: r`That is $P(X = 1)$, a row sum. $P(Y = ${y})$ is the sum of column ${y}.` },
          { id: 'd', label: r`$\tfrac13$`, value: 1 / 3, trapExplanation: r`The three values of $Y$ are not equally likely; add up the column.` },
        ],
        stepByStepSolution: [
          r`$P(Y = ${y}) = \sum_x P(X = x, Y = ${y})$: the column under $Y = ${y}$.`,
          r`$= ${dec(P[0][y])} + ${dec(P[1][y])}$.`,
          r`$= ${dec(r4(col))}$.`,
        ],
      };
    },
  },
  {
    id: 'pr-05-2',
    difficulty: 1,
    keyConceptTag: 'Conditional distributions',
    correctOptionId: 'a',
    generate: (g) => {
      const P = g.until(
        () => jointProbs(g, 2, 2),
        (P) => {
          const rowX1 = P[1][0] + P[1][1];
          const colY1 = P[0][1] + P[1][1];
          return allDistinct([P[1][1] / rowX1, P[1][1], P[1][1] / colY1, colY1].map(r4));
        },
      );
      const rowX1 = P[1][0] + P[1][1];
      const colY1 = P[0][1] + P[1][1];
      return {
        params: { P },
        promptText: r`$X$ and $Y$ have the joint distribution below. What is $P(Y = 1 \mid X = 1)$?`,
        mathFormula: jointTable([0, 1], [0, 1], P),
        options: [
          { id: 'a', label: `$${dec(r4(P[1][1] / rowX1))}$`, value: P[1][1] / rowX1 },
          { id: 'b', label: `$${dec(P[1][1])}$`, value: P[1][1], trapExplanation: r`That is the joint $P(X = 1, Y = 1)$; divide by $P(X = 1) = ${dec(r4(rowX1))}$.` },
          { id: 'c', label: `$${dec(r4(P[1][1] / colY1))}$`, value: P[1][1] / colY1, trapExplanation: r`That is $P(X = 1 \mid Y = 1)$, conditioning on the column instead of the row.` },
          { id: 'd', label: `$${dec(r4(colY1))}$`, value: colY1, trapExplanation: r`That is the unconditional $P(Y = 1)$.` },
        ],
        stepByStepSolution: [
          r`$P(X = 1) = ${dec(P[1][0])} + ${dec(P[1][1])} = ${dec(r4(rowX1))}$.`,
          r`$P(Y = 1 \mid X = 1) = \frac{P(X = 1, Y = 1)}{P(X = 1)} = \frac{${dec(P[1][1])}}{${dec(r4(rowX1))}}$.`,
          r`$\approx ${dec(r4(P[1][1] / rowX1))}$.`,
        ],
      };
    },
  },
  {
    id: 'pr-05-3',
    difficulty: 2,
    keyConceptTag: 'Covariance from a joint table',
    correctOptionId: 'a',
    generate: (g) => {
      const P = g.until(
        () => jointProbs(g, 2, 2),
        (P) => {
          const pX = P[1][0] + P[1][1];
          const pY = P[0][1] + P[1][1];
          const c = P[1][1] - pX * pY;
          return Math.abs(c) > 1e-9 && allDistinct([c, P[1][1], pX * pY, -c].map(r4));
        },
      );
      const pX = P[1][0] + P[1][1];
      const pY = P[0][1] + P[1][1];
      const c = P[1][1] - pX * pY;
      return {
        params: { P },
        promptText: r`$X$ and $Y$ take the values 0 and 1 with the joint distribution below. What is $\operatorname{Cov}(X, Y)$?`,
        mathFormula: jointTable([0, 1], [0, 1], P),
        options: [
          { id: 'a', label: `$${dec(r4(c))}$`, value: c },
          { id: 'b', label: `$${dec(P[1][1])}$`, value: P[1][1], trapExplanation: r`That is $E[XY] = P(X = 1, Y = 1)$; subtract $E[X]E[Y]$.` },
          { id: 'c', label: `$${dec(r4(pX * pY))}$`, value: pX * pY, trapExplanation: r`That is $E[X]E[Y]$, only the second term.` },
          { id: 'd', label: `$${dec(r4(-c))}$`, value: -c, trapExplanation: r`Sign slip: $\operatorname{Cov} = E[XY] - E[X]E[Y]$, not the other way round.` },
        ],
        stepByStepSolution: [
          r`For 0/1 variables: $E[X] = P(X = 1) = ${dec(r4(pX))}$, $E[Y] = P(Y = 1) = ${dec(r4(pY))}$, $E[XY] = P(X = 1, Y = 1) = ${dec(P[1][1])}$.`,
          r`$\operatorname{Cov}(X, Y) = ${dec(P[1][1])} - ${dec(r4(pX))}\cdot${dec(r4(pY))}$.`,
          r`$= ${dec(r4(c))}$ — ${c > 0 ? 'positive: the 1s tend to occur together' : 'negative: when one is 1 the other tends to be 0'}.`,
        ],
      };
    },
  },
  {
    id: 'pr-05-4',
    difficulty: 2,
    keyConceptTag: 'Variance of a sum',
    correctOptionId: 'a',
    generate: (g) => {
      const { vx, vy, c } = g.until(
        () => ({ vx: g.int(1, 16), vy: g.int(1, 16), c: g.nonzero(-6, 6) }),
        ({ vx, vy, c }) => c * c < vx * vy && allDistinct([vx + vy + 2 * c, vx + vy, vx + vy + c, vx + vy - 2 * c]),
      );
      return {
        params: { vx, vy, c },
        promptText: r`$\operatorname{Var}X = ${vx}$, $\operatorname{Var}Y = ${vy}$ and $\operatorname{Cov}(X, Y) = ${c}$. What is $\operatorname{Var}(X + Y)$?`,
        options: [
          { id: 'a', label: `$${vx + vy + 2 * c}$`, value: vx + vy + 2 * c },
          { id: 'b', label: `$${vx + vy}$`, value: vx + vy, trapExplanation: r`That holds only for uncorrelated variables. Here $\operatorname{Cov} = ${c} \ne 0$.` },
          { id: 'c', label: `$${vx + vy + c}$`, value: vx + vy + c, trapExplanation: r`The covariance appears twice: $(X + Y)^2$ has the cross term $2XY$.` },
          { id: 'd', label: `$${vx + vy - 2 * c}$`, value: vx + vy - 2 * c, trapExplanation: r`That is $\operatorname{Var}(X - Y)$.` },
        ],
        stepByStepSolution: [
          r`$\operatorname{Var}(X + Y) = \operatorname{Var}X + \operatorname{Var}Y + 2\operatorname{Cov}(X, Y)$.`,
          r`$= ${vx} + ${vy} + 2\cdot${paren(c)}$.`,
          r`$= ${vx + vy + 2 * c}$.`,
        ],
      };
    },
  },
  {
    id: 'pr-05-5',
    difficulty: 3,
    keyConceptTag: 'Correlation',
    correctOptionId: 'a',
    generate: (g) => {
      const { sx, sy, rho } = g.until(
        () => ({ sx: g.pick([2, 3, 4, 5, 10]), sy: g.pick([2, 3, 4, 5, 10]), rho: g.pick(RHOS) }),
        ({ sx, sy, rho }) => {
          const c = rho * sx * sy;
          return allDistinct([rho, c, c / (sx * sx * sy * sy), c / (sx + sy)].map(r4));
        },
      );
      const c = r4(rho * sx * sy);
      return {
        params: { sx, sy, rho },
        promptText: r`$\sigma_X = ${sx}$, $\sigma_Y = ${sy}$ and $\operatorname{Cov}(X, Y) = ${dec(c)}$. What is the correlation $\rho(X, Y)$?`,
        options: [
          { id: 'a', label: `$${dec(rho)}$`, value: rho },
          { id: 'b', label: `$${dec(c)}$`, value: c, trapExplanation: r`That is the covariance itself; correlation divides it by $\sigma_X\sigma_Y = ${sx * sy}$ to remove the units.` },
          { id: 'c', label: `$${dec(r4(c / (sx * sx * sy * sy)))}$`, value: c / (sx * sx * sy * sy), trapExplanation: r`Divide by the standard deviations, not by the variances.` },
          { id: 'd', label: `$${dec(r4(c / (sx + sy)))}$`, value: c / (sx + sy), trapExplanation: r`The denominator is the product $\sigma_X\sigma_Y$, not the sum.` },
        ],
        stepByStepSolution: [
          r`$\rho = \dfrac{\operatorname{Cov}(X, Y)}{\sigma_X\sigma_Y}$.`,
          r`$= \dfrac{${dec(c)}}{${sx}\cdot${sy}} = \dfrac{${dec(c)}}{${sx * sy}}$.`,
          r`$= ${dec(rho)}$, safely inside $[-1, 1]$.`,
        ],
      };
    },
  },
  {
    id: 'pr-05-6',
    difficulty: 3,
    keyConceptTag: 'Variance of a linear combination',
    correctOptionId: 'a',
    generate: (g) => {
      const { v1, v2, c, a1, a2 } = g.until(
        () => ({ v1: g.int(1, 9), v2: g.int(1, 9), c: g.nonzero(-4, 4), a1: g.nonzero(-3, 3), a2: g.nonzero(-3, 3) }),
        ({ v1, v2, c, a1, a2 }) =>
          c * c < v1 * v2 &&
          allDistinct([a1 * a1 * v1 + 2 * a1 * a2 * c + a2 * a2 * v2, a1 * a1 * v1 + a2 * a2 * v2, a1 * a1 * v1 + a1 * a2 * c + a2 * a2 * v2, a1 * v1 + a2 * v2]),
      );
      const S = [[v1, c], [c, v2]];
      const val = a1 * a1 * v1 + 2 * a1 * a2 * c + a2 * a2 * v2;
      return {
        params: { S, a: [a1, a2] },
        promptText: r`$(X_1, X_2)$ has covariance matrix $\Sigma = ${pm(S)}$. What is $\operatorname{Var}(${a1 === 1 ? '' : a1 === -1 ? '-' : a1}X_1 ${a2 < 0 ? '-' : '+'} ${Math.abs(a2) === 1 ? '' : Math.abs(a2)}X_2)$?`,
        options: [
          { id: 'a', label: `$${val}$`, value: val },
          { id: 'b', label: `$${a1 * a1 * v1 + a2 * a2 * v2}$`, value: a1 * a1 * v1 + a2 * a2 * v2, trapExplanation: r`The off-diagonal covariance ${c} contributes $2a_1a_2\Sigma_{12} = ${2 * a1 * a2 * c}$.` },
          { id: 'c', label: `$${a1 * a1 * v1 + a1 * a2 * c + a2 * a2 * v2}$`, value: a1 * a1 * v1 + a1 * a2 * c + a2 * a2 * v2, trapExplanation: r`$\mathbf{a}^T\Sigma\mathbf{a}$ uses both off-diagonal entries: the covariance term counts twice.` },
          { id: 'd', label: `$${a1 * v1 + a2 * v2}$`, value: a1 * v1 + a2 * v2, trapExplanation: r`Coefficients enter squared, as in $\operatorname{Var}(aX) = a^2\operatorname{Var}X$, and the covariance term is missing.` },
        ],
        stepByStepSolution: [
          r`$\operatorname{Var}(\mathbf{a}^T\mathbf{X}) = \mathbf{a}^T\Sigma\mathbf{a} = a_1^2\Sigma_{11} + 2a_1a_2\Sigma_{12} + a_2^2\Sigma_{22}$ with $\mathbf{a} = (${a1}, ${a2})$.`,
          r`$= ${a1 * a1}\cdot${v1} + 2\cdot${paren(a1)}\cdot${paren(a2)}\cdot${paren(c)} + ${a2 * a2}\cdot${v2}$.`,
          r`$= ${val}$.`,
        ],
      };
    },
  },
];
