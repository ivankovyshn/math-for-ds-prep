import type { QuestionTemplate } from '../../../types.ts';
import { r } from '../define.ts';
import { allDistinct, dec, frac, paren } from '../gen.ts';
import { lineOf } from './05-regression.practice.ts';

const r4 = (x: number) => Math.round(x * 1e4) / 1e4;

/** Extra practice (Practice 2): gentler questions on the same ideas, with new numbers every time. */
export const extra: QuestionTemplate[] = [
  {
    id: 'st-05-x1',
    difficulty: 1,
    keyConceptTag: 'Predicting with a fitted line',
    correctOptionId: 'a',
    generate: (g) => {
      const { b0, b1, x } = g.until(
        () => ({ b0: g.int(1, 30), b1: g.nonzero(-5, 8), x: g.int(2, 15) }),
        ({ b0, b1, x }) => allDistinct([b0 + b1 * x, b1 * x, b0 + b1, b0 + x]),
      );
      return {
        params: { b0, b1, x },
        promptText: r`A model predicts $\hat y = ${lineOf(b0, b1)}$. What is the prediction at $x = ${x}$?`,
        options: [
          { id: 'a', label: `$${b0 + b1 * x}$`, value: b0 + b1 * x },
          { id: 'b', label: `$${b1 * x}$`, value: b1 * x, trapExplanation: r`Add the intercept ${b0}.` },
          { id: 'c', label: `$${b0 + b1}$`, value: b0 + b1, trapExplanation: r`That is the prediction at $x = 1$.` },
          { id: 'd', label: `$${b0 + x}$`, value: b0 + x, trapExplanation: r`The slope ${b1} multiplies $x$.` },
        ],
        stepByStepSolution: [
          r`$\hat y = ${b0} + ${paren(b1)}\cdot${x}$.`,
          r`$= ${b0} + ${paren(b1 * x)}$.`,
          r`$= ${b0 + b1 * x}$.`,
        ],
      };
    },
  },
  {
    id: 'st-05-x2',
    difficulty: 1,
    keyConceptTag: 'Residuals',
    correctOptionId: 'a',
    generate: (g) => {
      const { b0, b1, x, e } = g.until(
        () => ({ b0: g.int(0, 20), b1: g.int(2, 6), x: g.int(1, 10), e: g.nonzero(-8, 8) }),
        ({ b0, b1, x, e }) => allDistinct([e, -e, b0 + b1 * x, e * e]),
      );
      const yh = b0 + b1 * x;
      return {
        params: { b0, b1, x, y: yh + e },
        promptText: r`For the line $\hat y = ${lineOf(b0, b1)}$, a data point $(${x}, ${yh + e})$ has which residual?`,
        options: [
          { id: 'a', label: `$${e}$`, value: e },
          { id: 'b', label: `$${-e}$`, value: -e, trapExplanation: r`Residual $= y - \hat y$; a point ${e > 0 ? 'above' : 'below'} the line has a ${e > 0 ? 'positive' : 'negative'} residual.` },
          { id: 'c', label: `$${yh}$`, value: yh, trapExplanation: r`${yh} is the predicted value.` },
          { id: 'd', label: `$${e * e}$`, value: e * e, trapExplanation: r`That is the squared residual, the point's contribution to the sum of squares.` },
        ],
        stepByStepSolution: [
          r`$\hat y = ${b0} + ${b1}\cdot${x} = ${yh}$.`,
          r`$e = ${yh + e} - ${yh}$.`,
          r`$e = ${e}$.`,
        ],
      };
    },
  },
  {
    id: 'st-05-x3',
    difficulty: 1,
    keyConceptTag: 'R² and correlation',
    correctOptionId: 'a',
    generate: (g) => {
      const rho = g.pick([-0.9, -0.7, -0.6, -0.3, 0.2, 0.3, 0.4, 0.6, 0.7, 0.9]);
      const a = Math.abs(rho);
      const v = (x: number) => Math.round(x * 100) / 100;
      return {
        params: { rho },
        promptText: r`In a simple regression the correlation between $x$ and $y$ is $r = ${rho}$. What is $R^2$?`,
        options: [
          { id: 'a', label: `$${dec(v(rho * rho))}$`, value: v(rho * rho) },
          { id: 'b', label: `$${a}$`, value: a, trapExplanation: r`$R^2$ is the square of $r$.` },
          { id: 'c', label: `$${dec(v(1 - rho * rho))}$`, value: v(1 - rho * rho), trapExplanation: r`That is the unexplained share $1 - R^2$.` },
          { id: 'd', label: `$${dec(v(1 - a))}$`, value: v(1 - a), trapExplanation: r`$R^2 = r^2$; nothing is subtracted from 1.` },
        ],
        stepByStepSolution: [
          r`For one feature, $R^2 = r^2$.`,
          r`$(${rho})^2 = ${dec(v(rho * rho))}$.`,
          r`The line explains ${Math.round(rho * rho * 100)}% of the variance of $y${rho < 0 ? r`$; the sign of $r$ does not matter` : '$'}.`,
        ],
      };
    },
  },
  {
    id: 'st-05-x4',
    difficulty: 2,
    keyConceptTag: 'The intercept',
    correctOptionId: 'a',
    generate: (g) => {
      const { mx, my, b1 } = g.until(
        () => ({ mx: g.int(2, 20), my: g.int(10, 80), b1: g.nonzero(-4, 5) }),
        ({ mx, my, b1 }) => allDistinct([my - b1 * mx, my + b1 * mx, my, b1 * mx - my]),
      );
      const b0 = my - b1 * mx;
      return {
        params: { mx, my, b1 },
        promptText: r`A least-squares line has slope $\hat\beta_1 = ${b1}$. The data have $\bar x = ${mx}$ and $\bar y = ${my}$. What is the intercept $\hat\beta_0$?`,
        options: [
          { id: 'a', label: `$${b0}$`, value: b0 },
          { id: 'b', label: `$${my + b1 * mx}$`, value: my + b1 * mx, trapExplanation: r`The line passes through $(\bar x, \bar y)$, so $\hat\beta_0 = \bar y - \hat\beta_1\bar x$: subtract.` },
          { id: 'c', label: `$${my}$`, value: my, trapExplanation: r`$\bar y$ is the height of the line at $x = \bar x = ${mx}$, not at $x = 0$.` },
          { id: 'd', label: `$${b1 * mx - my}$`, value: b1 * mx - my, trapExplanation: r`The sign is reversed: $\hat\beta_0 = \bar y - \hat\beta_1\bar x$.` },
        ],
        stepByStepSolution: [
          r`The least-squares line passes through $(\bar x, \bar y) = (${mx}, ${my})$.`,
          r`$\hat\beta_0 = \bar y - \hat\beta_1\bar x = ${my} - ${paren(b1)}\cdot${mx}$.`,
          r`$= ${b0}$.`,
        ],
      };
    },
  },
  {
    id: 'st-05-x5',
    difficulty: 2,
    keyConceptTag: 'Slope from covariance',
    correctOptionId: 'a',
    generate: (g) => {
      const { c, vx, vy } = g.until(
        () => ({ c: g.nonzero(-12, 12), vx: g.pick([4, 9, 16, 25]), vy: g.pick([4, 9, 16, 25, 36]) }),
        ({ c, vx, vy }) => vx !== vy && Math.abs(c) < Math.sqrt(vx * vy) && allDistinct([c / vx, c / vy, c / Math.sqrt(vx * vy), vx / c].map(r4)),
      );
      return {
        params: { c, vx, vy },
        promptText: r`For two variables, $\operatorname{Var}x = ${vx}$, $\operatorname{Var}y = ${vy}$ and $\operatorname{Cov}(x, y) = ${c}$. What is the least-squares slope of $y$ on $x$?`,
        options: [
          { id: 'a', label: `$${frac(c, vx)}$`, value: c / vx },
          { id: 'b', label: `$${frac(c, vy)}$`, value: c / vy, trapExplanation: r`Dividing by $\operatorname{Var}y$ gives the slope of $x$ on $y$.` },
          { id: 'c', label: `$${frac(c, Math.sqrt(vx * vy))}$`, value: c / Math.sqrt(vx * vy), trapExplanation: r`$\frac{\operatorname{Cov}}{s_x s_y}$ is the correlation $r$, not the slope.` },
          { id: 'd', label: `$${frac(vx, c)}$`, value: vx / c, trapExplanation: r`The slope is $\frac{\operatorname{Cov}(x, y)}{\operatorname{Var}x}$, not its reciprocal.` },
        ],
        stepByStepSolution: [
          r`$\hat\beta_1 = \frac{S_{xy}}{S_{xx}} = \frac{\operatorname{Cov}(x, y)}{\operatorname{Var}x}$ (the $n$'s cancel).`,
          r`$= \frac{${c}}{${vx}}$.`,
          r`$= ${frac(c, vx)}$.`,
        ],
      };
    },
  },
  {
    id: 'st-05-x6',
    difficulty: 2,
    keyConceptTag: 'R² from sums of squares',
    correctOptionId: 'a',
    generate: (g) => {
      const tot = g.pick([50, 80, 100, 120, 200, 250, 400]);
      const res = g.until(() => g.int(1, 19) * (tot / 20), (res) => res !== tot / 2 && allDistinct([1 - res / tot, res / tot, (tot - res) / res, tot - res]));
      return {
        params: { tot, res },
        promptText: r`A regression has total sum of squares $\mathrm{SS}_{\text{tot}} = ${tot}$ and residual sum of squares $\mathrm{SS}_{\text{res}} = ${dec(res)}$. What is $R^2$?`,
        options: [
          { id: 'a', label: `$${dec(1 - res / tot)}$`, value: 1 - res / tot },
          { id: 'b', label: `$${dec(res / tot)}$`, value: res / tot, trapExplanation: r`That is the unexplained share; $R^2 = 1 - \frac{\mathrm{SS}_{\text{res}}}{\mathrm{SS}_{\text{tot}}}$.` },
          { id: 'c', label: `$${dec(r4((tot - res) / res))}$`, value: (tot - res) / res, trapExplanation: r`Divide the explained part by the <i>total</i>, not by the residual part.` },
          { id: 'd', label: `$${dec(tot - res)}$`, value: tot - res, trapExplanation: r`${dec(tot - res)} is the explained sum of squares; $R^2$ is it as a share of ${tot}.` },
        ],
        stepByStepSolution: [
          r`$R^2 = 1 - \frac{\mathrm{SS}_{\text{res}}}{\mathrm{SS}_{\text{tot}}}$.`,
          r`$= 1 - \frac{${dec(res)}}{${tot}} = 1 - ${dec(res / tot)}$.`,
          r`$= ${dec(1 - res / tot)}$.`,
        ],
      };
    },
  },
];
