import type { QuestionTemplate } from '../../../types.ts';
import { r } from '../define.ts';
import { allDistinct, dec, dot, frac, pm, sqrtTex, vec } from '../gen.ts';
import { symFrom } from './10-spectral.practice.ts';
import { charPoly } from './07-eigen.practice.ts';
import { desc, share } from './11-svd-pca.practice.ts';

export const practice: QuestionTemplate[] = [
  {
    id: 'la-12-1',
    difficulty: 1,
    keyConceptTag: 'Total variance is the trace',
    correctOptionId: 'a',
    generate: (g) => {
      const { a, b, c } = g.until(
        () => ({ a: g.int(2, 20), b: g.nonzero(-6, 6), c: g.int(2, 20) }),
        ({ a, b, c }) => b * b < a * c && a !== c && allDistinct([a + c, a + 2 * b + c, a * c - b * b, Math.max(a, c)]),
      );
      return {
        params: { C: [[a, b], [b, c]] },
        promptText: r`A centred dataset with two features has covariance matrix $C = ${pm([[a, b], [b, c]])}$. What is its total variance?`,
        options: [
          { id: 'a', label: `$${a + c}$`, value: a + c },
          { id: 'b', label: `$${a + 2 * b + c}$`, value: a + 2 * b + c, trapExplanation: r`The off-diagonal entries are covariances, not variances. The total variance adds the diagonal only.` },
          { id: 'c', label: `$${a * c - b * b}$`, value: a * c - b * b, trapExplanation: r`That is $\det C = \lambda_1\lambda_2$, the product of the eigenvalues. The total variance is their sum.` },
          { id: 'd', label: `$${Math.max(a, c)}$`, value: Math.max(a, c), trapExplanation: r`That is the variance of one feature. The total adds both.` },
        ],
        stepByStepSolution: [
          r`The diagonal of $C$ holds the variances of the features: $${a}$ and $${c}$.`,
          r`Total variance $= \operatorname{tr}C = ${a} + ${c}$, which also equals $\lambda_1 + \lambda_2$.`,
          r`$= ${a + c}$.`,
        ],
      };
    },
  },
  {
    id: 'la-12-2',
    difficulty: 1,
    keyConceptTag: 'Explained variance',
    correctOptionId: 'a',
    generate: (g) => {
      const S = g.pick([20, 25, 50, 100]);
      const ls = g.until(
        () => {
          const three = [g.int(1, S), g.int(1, S), g.int(1, S)];
          return desc([...three, S - three[0] - three[1] - three[2]]);
        },
        (ls) => ls[3] > 0 && new Set(ls).size === 4 && allDistinct([ls[0] + ls[1], ls[0], ls[2] + ls[3], S / 2]),
      );
      const pct = (x: number) => (100 * x) / S;
      return {
        params: { ls },
        promptText: r`The covariance matrix of a centred dataset with 4 features has eigenvalues $${ls.join(', ')}$. What share of the total variance do the first two principal components explain?`,
        options: [
          { id: 'a', label: r`$${pct(ls[0] + ls[1])}\%$`, value: pct(ls[0] + ls[1]) },
          { id: 'b', label: r`$${pct(ls[0])}\%$`, value: pct(ls[0]), trapExplanation: r`That is PC1 alone. Add PC2's share, $\frac{${ls[1]}}{${S}}$.` },
          { id: 'c', label: r`$${pct(ls[2] + ls[3])}\%$`, value: pct(ls[2] + ls[3]), trapExplanation: r`That is the share left out: the last two components.` },
          { id: 'd', label: r`$50\%$`, value: 50, trapExplanation: r`Two of four components do not explain half the variance: each carries its own eigenvalue's share.` },
        ],
        stepByStepSolution: [
          r`Total variance $= \lambda_1 + \dots + \lambda_4 = ${ls.join(' + ')} = ${S}$.`,
          r`The first two components carry $${ls[0]} + ${ls[1]} = ${ls[0] + ls[1]}$.`,
          r`Share: $\frac{${ls[0] + ls[1]}}{${S}} = ${pct(ls[0] + ls[1])}\%$.`,
        ],
      };
    },
  },
  {
    id: 'la-12-3',
    difficulty: 2,
    keyConceptTag: 'Covariance of two centred features',
    correctOptionId: 'a',
    generate: (g) => {
      const { x, y } = g.until(
        () => {
          const [p, q, r2, s] = [g.nonzero(-4, 4), g.nonzero(-4, 4), g.nonzero(-4, 4), g.nonzero(-4, 4)];
          return { x: [p, -p, q, -q], y: [r2, -r2, s, -s] };
        },
        ({ x, y }) => {
          const sxy = dot(x, y);
          const sxx = dot(x, x);
          return sxy !== 0 && allDistinct([sxy / 3, sxy / 4, sxy, sxx / 3]);
        },
      );
      const sxy = dot(x, y);
      const sxx = dot(x, x);
      return {
        params: { x, y },
        mathFormula: r`\begin{array}{c|cccc} \text{sample} & 1 & 2 & 3 & 4 \\ \hline x & ${x.join(' & ')} \\ y & ${y.join(' & ')} \end{array}`,
        promptText: r`Two features, already centred (each averages 0), on four samples. What is their sample covariance?`,
        options: [
          { id: 'a', label: `$${frac(sxy, 3)}$`, value: sxy / 3 },
          { id: 'b', label: `$${frac(sxy, 4)}$`, value: sxy / 4, trapExplanation: r`The sample covariance divides by $n - 1 = 3$, not by $n = 4$.` },
          { id: 'c', label: `$${sxy}$`, value: sxy, trapExplanation: r`That is the sum of the products; it still has to be divided by $n - 1 = 3$.` },
          { id: 'd', label: `$${frac(sxx, 3)}$`, value: sxx / 3, trapExplanation: r`That is the variance of $x$: $x$ times $x$. The covariance multiplies $x$ by $y$.` },
        ],
        stepByStepSolution: [
          r`Centred data: $\operatorname{cov}(x, y) = \frac{1}{n - 1}\sum_i x_iy_i$.`,
          r`$\sum x_iy_i = ${x.map((v, i) => `${v < 0 ? `(${v})` : v}\\cdot${y[i] < 0 ? `(${y[i]})` : y[i]}`).join(' + ')} = ${sxy}$.`,
          r`$\frac{${sxy}}{3} = ${frac(sxy, 3)}$.`,
        ],
      };
    },
  },
  {
    id: 'la-12-4',
    difficulty: 2,
    keyConceptTag: 'Scores along a principal component',
    correctOptionId: 'a',
    generate: (g) => {
      const { u, m, xs } = g.until(
        () => {
          const [u1, u2, m] = g.pick([[3, 4, 5], [4, 3, 5], [5, 12, 13], [12, 5, 13], [3, -4, 5], [4, -3, 5]]);
          return { u: [u1, u2], m, xs: [g.nonzero(-5, 5), g.nonzero(-5, 5)] };
        },
        ({ u, m, xs }) => {
          const z = dot(u, xs) / m;
          return z !== 0 && allDistinct([z, dot(u, xs), (u[1] * xs[0] + u[0] * xs[1]) / m, Math.sqrt(dot(xs, xs))].map((v) => Math.round(v * 1e6)));
        },
      );
      const z = dot(u, xs) / m;
      const swapped = (u[1] * xs[0] + u[0] * xs[1]) / m;
      return {
        params: { u, xs },
        promptText: r`PC1 of a dataset points along $${vec(u)}$. What is the PC1 score of the centred sample $\mathbf{x} = ${vec(xs)}$?`,
        options: [
          { id: 'a', label: `$${dec(z)}$`, value: z },
          { id: 'b', label: `$${dot(u, xs)}$`, value: dot(u, xs), trapExplanation: r`The direction must be a unit vector: $${vec(u)}$ has length ${m}, so this is ${m} times too large.` },
          { id: 'c', label: `$${dec(swapped)}$`, value: swapped, trapExplanation: r`The components were paired the wrong way round: $x_1$ goes with $\frac{${u[0]}}{${m}}$, $x_2$ with $\frac{${u[1]}}{${m}}$.` },
          { id: 'd', label: `$${sqrtTex(dot(xs, xs))}$`, value: Math.sqrt(dot(xs, xs)), trapExplanation: r`That is the length of the sample. The score is its coordinate along PC1, a projection.` },
        ],
        stepByStepSolution: [
          r`Unit direction: $\mathbf{v}_1 = \frac{1}{${m}}${vec(u)}$.`,
          r`Score: $z_1 = \mathbf{x}\cdot\mathbf{v}_1 = \frac{${xs[0]}\cdot${u[0] < 0 ? `(${u[0]})` : u[0]} + ${xs[1] < 0 ? `(${xs[1]})` : xs[1]}\cdot${u[1] < 0 ? `(${u[1]})` : u[1]}}{${m}} = \frac{${dot(u, xs)}}{${m}}$.`,
          r`$z_1 = ${dec(z)}$.`,
        ],
      };
    },
  },
  {
    id: 'la-12-5',
    difficulty: 3,
    keyConceptTag: 'How many components to keep',
    correctOptionId: 'a',
    generate: (g) => {
      const { ls, k } = g.until(
        () => {
          const l1 = g.int(8, 30);
          const l2 = g.int(2, l1 - 1);
          const l3 = g.int(1, l2 - 1);
          const ls = [l1, l2, l3, g.int(1, l3)];
          const tot = ls.reduce((s, x) => s + x, 0);
          let cum = 0;
          let k = 0;
          while (cum < 0.9 * tot) cum += ls[k++];
          return { ls, k };
        },
        ({ ls, k }) => {
          const tot = ls.reduce((s, x) => s + x, 0);
          const shares = [1, 2, 3].map((j) => ls.slice(0, j).reduce((s, x) => s + x, 0) / tot);
          return k <= 3 && shares.every((p) => Math.abs(p - 0.9) > 0.02);
        },
      );
      const tot = ls.reduce((s, x) => s + x, 0);
      const cum = (j: number) => ls.slice(0, j).reduce((s, x) => s + x, 0);
      const pct = (j: number) => Math.round((100 * cum(j)) / tot);
      const others = [1, 2, 3, 4].filter((j) => j !== k);
      const word = (j: number) => `$${j}$ component${j === 1 ? '' : 's'}`;
      return {
        params: { ls },
        promptText: r`The covariance matrix of a dataset with 4 features has eigenvalues $${ls.join(', ')}$. What is the smallest number of principal components that keeps at least 90% of the variance?`,
        options: [
          { id: 'a', label: word(k), value: k },
          ...others.map((j, i) => ({
            id: 'bcd'[i],
            label: word(j),
            value: j,
            trapExplanation: j < k ? r`${j} component${j === 1 ? '' : 's'} keep $\frac{${cum(j)}}{${tot}} \approx ${pct(j)}\%$: not yet 90%.` : r`${j} components keep enough, but fewer already do: ${k} keep $\frac{${cum(k)}}{${tot}} \approx ${pct(k)}\%$.`,
          })),
        ],
        stepByStepSolution: [
          r`Total variance: $${ls.join(' + ')} = ${tot}$.`,
          r`Running shares: ${[1, 2, 3].map((j) => `${j} PC${j === 1 ? '' : 's'} $\\approx ${pct(j)}\\%$`).join(', ')}.`,
          r`The first to reach 90% is ${k}.`,
        ],
      };
    },
  },
  {
    id: 'la-12-6',
    difficulty: 3,
    keyConceptTag: 'Explained variance from a covariance matrix',
    correctOptionId: 'a',
    generate: (g) => {
      const { A: C, l1, l2 } = g.until(
        () => symFrom(g, [[1, 1], [1, -1], [1, 2], [2, 1], [1, -2], [2, -1]], [1, 2], [1, 2, 3, 4]),
        ({ A, l1, l2 }) => {
          const t = l1 + l2;
          return A.flat().every((x) => Math.abs(x) <= 12) && allDistinct([l1 / t, Math.max(A[0][0], A[1][1]) / t, l2 / t, l1 / l2]);
        },
      );
      const t = l1 + l2;
      const d = l1 * l2;
      const top = Math.max(C[0][0], C[1][1]);
      return {
        params: { C },
        promptText: r`A centred dataset with two features has covariance matrix $C = ${pm(C)}$. What share of the total variance does the first principal component explain?`,
        options: [
          { id: 'a', label: share(l1, t), value: l1 / t },
          { id: 'b', label: share(top, t), value: top / t, trapExplanation: r`${top} is the variance of the more spread-out original feature. PC1 is a mix of both features and captures more: the largest eigenvalue, ${l1}.` },
          { id: 'c', label: share(l2, t), value: l2 / t, trapExplanation: r`That is PC2, the direction with the <i>smallest</i> variance.` },
          { id: 'd', label: `$${frac(l1, l2)}$`, value: l1 / l2, trapExplanation: r`$\frac{\lambda_1}{\lambda_2}$ compares PC1 with PC2. The share divides by the total, $\lambda_1 + \lambda_2 = ${t}$.` },
        ],
        stepByStepSolution: [
          r`Total variance $= \operatorname{tr}C = ${t}$; $\det C = ${d}$.`,
          r`Eigenvalues: $${charPoly(t, d)} = 0$ gives $\lambda_1 = ${l1}$, $\lambda_2 = ${l2}$.`,
          r`PC1 explains $\frac{\lambda_1}{\lambda_1 + \lambda_2} = \frac{${l1}}{${t}}$: ${share(l1, t)}.`,
        ],
      };
    },
  },
];
