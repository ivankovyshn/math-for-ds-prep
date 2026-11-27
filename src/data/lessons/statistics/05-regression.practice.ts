import type { QuestionTemplate, Rng } from '../../../types.ts';
import { r } from '../define.ts';
import { allDistinct, dec, frac, paren, pm, shuffle, signed, sumOf } from '../gen.ts';

const r4 = (x: number) => Math.round(x * 1e4) / 1e4;
/** "(1, 3), (2, 5), …" */
export const pts = (xs: number[], ys: number[]) => xs.map((x, i) => `(${x}, ${ys[i]})`).join(',\\ ');
/** n·S_xy and n·S_xx (integers for integer data). */
export const sums = (xs: number[], ys: number[]) => {
  const n = xs.length;
  const sxy = n * sumOf(xs.map((x, i) => x * ys[i])) - sumOf(xs) * sumOf(ys);
  const sxx = n * sumOf(xs.map((x) => x * x)) - sumOf(xs) ** 2;
  const syy = n * sumOf(ys.map((y) => y * y)) - sumOf(ys) ** 2;
  return { sxy, sxx, syy };
};
/** n distinct sorted x values in [lo, hi]. */
export const xsOf = (g: Rng, n: number, lo: number, hi: number) =>
  shuffle(g, Array.from({ length: hi - lo + 1 }, (_, i) => lo + i)).slice(0, n).sort((a, b) => a - b);
/** A line "a + bx" with tidy signs. */
export const lineOf = (b0: number, b1: number) => `${b0} ${b1 < 0 ? "-" : "+"} ${Math.abs(b1) === 1 ? "" : Math.abs(b1)}x`;

export const practice: QuestionTemplate[] = [
  {
    id: 'st-05-1',
    difficulty: 1,
    keyConceptTag: 'Predicting with a fitted line',
    correctOptionId: 'a',
    generate: (g) => {
      const { b0, b1, x } = g.until(
        () => ({ b0: g.int(20, 120), b1: g.pick([1.5, 2, 2.5, 3, 4, 5]), x: g.int(10, 60) }),
        ({ b0, b1, x }) => allDistinct([b0 + b1 * x, b1 * x, b0 + b1, b0 * x + b1]),
      );
      return {
        params: { b0, b1, x },
        promptText: r`A regression of a flat's price (in thousands) on its area $x$ (in m²) gives $\hat y = ${lineOf(b0, b1)}$. What price does it predict for $x = ${x}$?`,
        options: [
          { id: 'a', label: `$${dec(b0 + b1 * x)}$`, value: b0 + b1 * x },
          { id: 'b', label: `$${dec(b1 * x)}$`, value: b1 * x, trapExplanation: r`The intercept ${b0} is part of every prediction.` },
          { id: 'c', label: `$${dec(b0 + b1)}$`, value: b0 + b1, trapExplanation: r`That is the prediction for $x = 1$; multiply the slope by $x = ${x}$.` },
          { id: 'd', label: `$${dec(b0 * x + b1)}$`, value: b0 * x + b1, trapExplanation: r`The slope multiplies $x$; the intercept is added as it is.` },
        ],
        stepByStepSolution: [
          r`Substitute $x = ${x}$ into $\hat y = ${lineOf(b0, b1)}$.`,
          r`$\hat y = ${b0} + ${b1}\cdot${x} = ${b0} + ${dec(b1 * x)}$.`,
          r`$= ${dec(b0 + b1 * x)}$.`,
        ],
      };
    },
  },
  {
    id: 'st-05-2',
    difficulty: 1,
    keyConceptTag: 'Residuals',
    correctOptionId: 'a',
    generate: (g) => {
      const { b0, b1, x, e } = g.until(
        () => ({ b0: g.int(-10, 20), b1: g.nonzero(-4, 5), x: g.int(1, 12), e: g.nonzero(-9, 9) }),
        ({ b0, b1, x, e }) => {
          const yh = b0 + b1 * x;
          return allDistinct([e, -e, yh, yh + e - b0]);
        },
      );
      const yh = b0 + b1 * x;
      const y = yh + e;
      return {
        params: { b0, b1, x, y },
        promptText: r`The fitted line is $\hat y = ${lineOf(b0, b1)}$. What is the residual of the observation $(${x}, ${y})$?`,
        options: [
          { id: 'a', label: `$${e}$`, value: e },
          { id: 'b', label: `$${-e}$`, value: -e, trapExplanation: r`The residual is $y - \hat y$, observed minus predicted, not the other way round.` },
          { id: 'c', label: `$${yh}$`, value: yh, trapExplanation: r`${yh} is the prediction $\hat y$; the residual is the gap between $y = ${y}$ and it.` },
          { id: 'd', label: `$${y - b0}$`, value: y - b0, trapExplanation: r`Subtract the whole prediction $\hat y = ${yh}$, not only the intercept.` },
        ],
        stepByStepSolution: [
          r`$\hat y = ${b0} ${signed(b1)}\cdot${x} = ${yh}$.`,
          r`$e = y - \hat y = ${y} - ${paren(yh)}$.`,
          r`$e = ${e}$: the point lies ${e > 0 ? 'above' : 'below'} the line.`,
        ],
      };
    },
  },
  {
    id: 'st-05-3',
    difficulty: 2,
    keyConceptTag: 'The least-squares slope',
    correctOptionId: 'a',
    generate: (g) => {
      const { xs, ys } = g.until(
        () => {
          const xs = xsOf(g, 4, 0, 6);
          const b = g.nonzero(-3, 3);
          const ys = xs.map((x) => 5 + b * x + g.int(-2, 2));
          return { xs, ys };
        },
        ({ xs, ys }) => {
          const { sxy, sxx } = sums(xs, ys);
          const end = (ys[3] - ys[0]) / (xs[3] - xs[0]);
          const mx = sumOf(xs) / 4;
          return sxy !== 0 && mx !== 0 && allDistinct([sxy / sxx, end, sxx / sxy, sumOf(ys) / 4 / mx].map(r4));
        },
      );
      const { sxy, sxx } = sums(xs, ys);
      const end = (ys[3] - ys[0]) / (xs[3] - xs[0]);
      const sx = sumOf(xs);
      const sy = sumOf(ys);
      return {
        params: { xs, ys },
        promptText: r`Fit a least-squares line to the points $${pts(xs, ys)}$. What is the slope $\hat\beta_1$?`,
        options: [
          { id: 'a', label: `$${frac(sxy, sxx)}$`, value: sxy / sxx },
          { id: 'b', label: `$${frac(ys[3] - ys[0], xs[3] - xs[0])}$`, value: end, trapExplanation: r`That is the slope through the two end points only. Least squares uses all four points.` },
          { id: 'c', label: `$${frac(sxx, sxy)}$`, value: sxx / sxy, trapExplanation: r`The slope is $\frac{S_{xy}}{S_{xx}}$, not its reciprocal.` },
          { id: 'd', label: `$${frac(sy, sx)}$`, value: sy / sx, trapExplanation: r`$\frac{\bar y}{\bar x}$ is the slope of the line from the origin to the point of means; it ignores how $y$ varies with $x$.` },
        ],
        stepByStepSolution: [
          r`$\bar x = ${frac(sx, 4)}$, $\bar y = ${frac(sy, 4)}$.`,
          r`$S_{xy} = \sum (x_i - \bar x)(y_i - \bar y) = ${frac(sxy, 4)}$ and $S_{xx} = \sum (x_i - \bar x)^2 = ${frac(sxx, 4)}$.`,
          r`$\hat\beta_1 = \frac{S_{xy}}{S_{xx}} = ${frac(sxy, sxx)}$.`,
        ],
      };
    },
  },
  {
    id: 'st-05-4',
    difficulty: 2,
    keyConceptTag: 'Slope from correlation',
    correctOptionId: 'a',
    generate: (g) => {
      const { rho, sx, sy } = g.until(
        () => ({ rho: g.pick([-0.9, -0.8, -0.6, -0.5, -0.4, -0.3, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9]), sx: g.int(2, 10), sy: g.int(2, 20) }),
        ({ rho, sx, sy }) => sx !== sy && allDistinct([(rho * sy) / sx, (rho * sx) / sy, rho, sy / sx].map(r4)),
      );
      const ans = r4((rho * sy) / sx);
      return {
        params: { rho, sx, sy },
        promptText: r`Hours studied $x$ and exam score $y$ have standard deviations $s_x = ${sx}$ and $s_y = ${sy}$ and correlation $r = ${rho}$. What is the slope of the least-squares line of $y$ on $x$?`,
        options: [
          { id: 'a', label: `$${dec(ans)}$`, value: ans },
          { id: 'b', label: `$${dec(r4((rho * sx) / sy))}$`, value: r4((rho * sx) / sy), trapExplanation: r`That is the slope of $x$ on $y$. For $y$ on $x$: $r\frac{s_y}{s_x}$.` },
          { id: 'c', label: `$${rho}$`, value: rho, trapExplanation: r`$r$ is unit-free. The slope converts it to points per hour: multiply by $\frac{s_y}{s_x}$.` },
          { id: 'd', label: `$${dec(r4(sy / sx))}$`, value: r4(sy / sx), trapExplanation: r`That would be the slope for a perfect correlation $r = 1$.` },
        ],
        stepByStepSolution: [
          r`$\hat\beta_1 = r\frac{s_y}{s_x}$.`,
          r`$= ${rho}\cdot\frac{${sy}}{${sx}}$.`,
          r`$= ${dec(ans)}$ points per hour.`,
        ],
      };
    },
  },
  {
    id: 'st-05-5',
    difficulty: 3,
    keyConceptTag: 'R² of a fit',
    correctOptionId: 'a',
    generate: (g) => {
      const { xs, ys } = g.until(
        () => {
          const xs = xsOf(g, 5, 0, 8);
          const b = g.nonzero(-2, 2);
          const ys = xs.map((x) => 10 + b * x + g.int(-3, 3));
          return { xs, ys };
        },
        ({ xs, ys }) => {
          const { sxy, sxx, syy } = sums(xs, ys);
          if (syy === 0 || sxy === 0) return false;
          const R2 = (sxy * sxy) / (sxx * syy);
          return R2 < 0.98 && allDistinct([R2, 1 - R2, Math.sqrt(R2), sxy / sxx].map(r4));
        },
      );
      const { sxy, sxx, syy } = sums(xs, ys);
      const R2 = (sxy * sxy) / (sxx * syy);
      const slope = sxy / sxx;
      const lab = (x: number) => `$\\approx ${dec(r4(x))}$`;
      return {
        params: { xs, ys },
        promptText: r`A least-squares line is fitted to the points $${pts(xs, ys)}$. What is its $R^2$?`,
        options: [
          { id: 'a', label: lab(R2), value: R2 },
          { id: 'b', label: lab(1 - R2), value: 1 - R2, trapExplanation: r`That is $\frac{\mathrm{SS}_{\text{res}}}{\mathrm{SS}_{\text{tot}}}$, the <i>unexplained</i> share.` },
          { id: 'c', label: lab(Math.sqrt(R2)), value: Math.sqrt(R2), trapExplanation: r`That is $|r|$; $R^2$ is its square.` },
          { id: 'd', label: lab(slope), value: slope, trapExplanation: r`That is the slope $\hat\beta_1$, which depends on units; $R^2$ is a share between 0 and 1.` },
        ],
        stepByStepSolution: [
          r`$S_{xy} = ${frac(sxy, 5)}$, $S_{xx} = ${frac(sxx, 5)}$, $S_{yy} = \mathrm{SS}_{\text{tot}} = ${frac(syy, 5)}$.`,
          r`For a least-squares line $\mathrm{SS}_{\text{res}} = S_{yy} - \frac{S_{xy}^2}{S_{xx}}$, so $R^2 = \frac{S_{xy}^2}{S_{xx}S_{yy}}$.`,
          r`$R^2 = ${frac(sxy * sxy, sxx * syy)} \approx ${dec(r4(R2))}$.`,
        ],
      };
    },
  },
  {
    id: 'st-05-6',
    difficulty: 3,
    keyConceptTag: 'The normal equations',
    correctOptionId: 'a',
    generate: (g) => {
      const { xs, b } = g.until(
        () => ({ xs: xsOf(g, g.pick([3, 4]), 0, 5), b: [g.int(-5, 9), g.nonzero(-4, 4)] }),
        ({ xs, b }) => {
          const n = xs.length;
          const S1 = sumOf(xs);
          const S2 = sumOf(xs.map((x) => x * x));
          const t = [n * b[0] + S1 * b[1], S1 * b[0] + S2 * b[1]];
          return allDistinct([b, [t[0] / n, t[1] / S2], [b[1], b[0]], [t[0] / n, t[1] / n]].map((v) => v.map(r4)));
        },
      );
      const n = xs.length;
      const S1 = sumOf(xs);
      const S2 = sumOf(xs.map((x) => x * x));
      const A = [[n, S1], [S1, S2]];
      const t = [n * b[0] + S1 * b[1], S1 * b[0] + S2 * b[1]];
      const v = (a: string, c: string) => `$(${a},\\ ${c})$`;
      return {
        params: { A, t },
        promptText: r`For a regression with an intercept, the data give $X^\top X = ${pm(A)}$ and $X^\top y = ${pm(t.map((x) => [x]))}$. Solve the normal equations for $\hat\beta = (\hat\beta_0, \hat\beta_1)$.`,
        options: [
          { id: 'a', label: v(`${b[0]}`, `${b[1]}`), value: b },
          { id: 'b', label: v(frac(t[0], n), frac(t[1], S2)), value: [t[0] / n, t[1] / S2], trapExplanation: r`Dividing each equation by its diagonal entry ignores the off-diagonal ${S1}: the two coefficients must be solved together.` },
          { id: 'c', label: v(`${b[1]}`, `${b[0]}`), value: [b[1], b[0]], trapExplanation: r`The first row of $X^\top X$ belongs to the intercept (the column of ones), so the first entry is $\hat\beta_0$.` },
          { id: 'd', label: v(frac(t[0], n), frac(t[1], n)), value: [t[0] / n, t[1] / n], trapExplanation: r`$X^\top y$ divided by $n$ gives averages such as $\bar y$, not the coefficients.` },
        ],
        stepByStepSolution: [
          r`The system is $${n}\beta_0 + ${S1}\beta_1 = ${t[0]}$ and $${S1}\beta_0 + ${S2}\beta_1 = ${t[1]}$.`,
          r`$\det X^\top X = ${n}\cdot${S2} - ${S1}^2 = ${n * S2 - S1 * S1}$, so $\hat\beta = \frac{1}{${n * S2 - S1 * S1}}${pm([[S2, -S1], [-S1, n]])}${pm(t.map((x) => [x]))}$.`,
          r`$\hat\beta = (${b[0]},\ ${b[1]})$; check: $${n}\cdot${b[0] < 0 ? `(${b[0]})` : b[0]} + ${S1}\cdot${b[1] < 0 ? `(${b[1]})` : b[1]} = ${t[0]}$.`,
        ],
      };
    },
  },
];
