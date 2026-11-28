import type { QuestionTemplate } from '../../../types.ts';
import { r } from '../define.ts';
import { allDistinct, dec, dot, frac, pm, sqrtTex, vec } from '../gen.ts';
import { symFrom } from './10-spectral.practice.ts';
import { desc, share } from './11-svd-pca.practice.ts';

/** Extra practice (Practice 2): gentler questions on the same ideas, with new numbers every time. */
export const extra: QuestionTemplate[] = [
  {
    id: 'la-12-x1',
    difficulty: 1,
    keyConceptTag: 'Eigenvalues are variances',
    correctOptionId: 'a',
    generate: (g) => {
      const [l1, l2] = g.pick([[9, 4], [16, 1], [25, 9], [36, 4], [49, 16], [64, 25], [100, 36], [81, 4]]);
      return {
        params: { ls: [l1, l2] },
        promptText: r`The covariance matrix of a centred dataset has eigenvalues $${l1}$ and $${l2}$. What is the standard deviation of the data along PC1?`,
        options: [
          { id: 'a', label: `$${Math.sqrt(l1)}$`, value: Math.sqrt(l1) },
          { id: 'b', label: `$${l1}$`, value: l1, trapExplanation: r`${l1} is the variance along PC1. The standard deviation is its square root.` },
          { id: 'c', label: `$${sqrtTex(l1 + l2)}$`, value: Math.sqrt(l1 + l2), trapExplanation: r`That combines both directions. Along PC1 only $\lambda_1$ counts.` },
          { id: 'd', label: `$${frac(l1, l1 + l2)}$`, value: l1 / (l1 + l2), trapExplanation: r`That is the share of the variance PC1 explains, not a spread.` },
        ],
        stepByStepSolution: [
          r`The eigenvalue $\lambda_1$ is the variance of the data along PC1.`,
          r`Standard deviation = square root of the variance.`,
          r`$\sqrt{${l1}} = ${Math.sqrt(l1)}$.`,
        ],
      };
    },
  },
  {
    id: 'la-12-x2',
    difficulty: 2,
    keyConceptTag: 'The first principal component',
    correctOptionId: 'a',
    generate: (g) => {
      const { A: C, v, w, l1, l2 } = g.until(
        () => symFrom(g, [[1, 2], [2, 1], [1, -2], [2, -1], [1, 3], [3, 1], [1, -3], [3, -1]], [1, 2], [1, 2, 3]),
        ({ A }) => A.flat().every((x) => Math.abs(x) <= 12),
      );
      const sg = g.pick([1, -1]);
      const a = v.map((x) => sg * x);
      const axis = C[0][0] >= C[1][1] ? [1, 0] : [0, 1];
      const swapped = [v[1], v[0]];
      return {
        params: { C, a, b: w, c: axis, d: swapped },
        promptText: r`A centred dataset has covariance matrix $C = ${pm(C)}$. Which vector points along its first principal component?`,
        options: [
          { id: 'a', label: `$${vec(a)}$` },
          { id: 'b', label: `$${vec(w)}$`, trapExplanation: r`$C${vec(w)} = ${l2}\cdot${vec(w)}$: that is PC2, the direction of <i>least</i> variance.` },
          { id: 'c', label: `$${vec(axis)}$`, trapExplanation: r`That is the feature with the larger variance (${Math.max(C[0][0], C[1][1])}). With non-zero covariance, PC1 is a mix of both features.` },
          { id: 'd', label: `$${vec(swapped)}$`, trapExplanation: r`$C${vec(swapped)} = (${C[0][0] * swapped[0] + C[0][1] * swapped[1]}, ${C[1][0] * swapped[0] + C[1][1] * swapped[1]})$ is not a multiple of $${vec(swapped)}$: not an eigenvector.` },
        ],
        stepByStepSolution: [
          r`PC1 is the eigenvector of $C$ with the largest eigenvalue.`,
          r`$C${vec(a)} = (${C[0][0] * a[0] + C[0][1] * a[1]}, ${C[1][0] * a[0] + C[1][1] * a[1]}) = ${l1}\cdot${vec(a)}$ and $C${vec(w)} = ${l2}\cdot${vec(w)}$.`,
          r`$${l1} > ${l2}$, so PC1 points along $${vec(a)}$ (the sign does not matter).`,
        ],
      };
    },
  },
  {
    id: 'la-12-x3',
    difficulty: 2,
    keyConceptTag: 'Explained variance from singular values',
    correctOptionId: 'a',
    generate: (g) => {
      const [s1, s2] = g.until(
        () => desc([g.int(1, 6), g.int(1, 6)]),
        ([p, q]) => p > q && allDistinct([(p * p) / (p * p + q * q), p / (p + q), (q * q) / (p * p + q * q), (p * p) / (q * q)]),
      );
      const tot = s1 * s1 + s2 * s2;
      return {
        params: { s: [s1, s2] },
        promptText: r`The centred data matrix $X$ (two features) has singular values $${s1}$ and $${s2}$. What share of the variance does PC1 explain?`,
        options: [
          { id: 'a', label: share(s1 * s1, tot), value: (s1 * s1) / tot },
          { id: 'b', label: share(s1, s1 + s2), value: s1 / (s1 + s2), trapExplanation: r`Variance goes with $\sigma_i^2$, not $\sigma_i$: $\lambda_i = \frac{\sigma_i^2}{n - 1}$.` },
          { id: 'c', label: share(s2 * s2, tot), value: (s2 * s2) / tot, trapExplanation: r`That is PC2's share, from the smaller singular value.` },
          { id: 'd', label: `$${frac(s1 * s1, s2 * s2)}$`, value: (s1 * s1) / (s2 * s2), trapExplanation: r`That compares PC1 with PC2. A share divides by the total $\sigma_1^2 + \sigma_2^2 = ${tot}$.` },
        ],
        stepByStepSolution: [
          r`The variance along PC $i$ is $\lambda_i = \frac{\sigma_i^2}{n - 1}$; the factor $\frac{1}{n-1}$ cancels in a share.`,
          r`$\sigma_1^2 = ${s1 * s1}$, $\sigma_2^2 = ${s2 * s2}$, total ${tot}.`,
          r`PC1: $\frac{${s1 * s1}}{${tot}}$, i.e. ${share(s1 * s1, tot)}.`,
        ],
      };
    },
  },
  {
    id: 'la-12-x4',
    difficulty: 1,
    keyConceptTag: 'Centring the data',
    correctOptionId: 'a',
    generate: (g) => {
      const vs = g.until(
        () => {
          const a = g.int(0, 12);
          const b = g.int(0, 12);
          const m = g.int(3, 9);
          return [a, b, 3 * m - a - b];
        },
        (vs) => {
          const m = (vs[0] + vs[1] + vs[2]) / 3;
          const med = [...vs].sort((p, q) => p - q)[1];
          return vs[2] >= 0 && new Set(vs).size === 3 && med !== m && Math.min(...vs) !== m;
        },
      );
      const m = (vs[0] + vs[1] + vs[2]) / 3;
      const med = [...vs].sort((p, q) => p - q)[1];
      const lo = Math.min(...vs);
      const t = (xs: number[]) => `$(${xs.join(', ')})$`;
      return {
        params: { vs },
        promptText: r`A feature takes the values $${vs.join(', ')}$ on three samples. What are the centred values?`,
        options: [
          { id: 'a', label: t(vs.map((v) => v - m)), value: vs.map((v) => v - m) },
          { id: 'b', label: t(vs.map((v) => v - lo)), value: vs.map((v) => v - lo), trapExplanation: r`Centring subtracts the mean, ${m}, not the smallest value.` },
          { id: 'c', label: t(vs.map((v) => v - med)), value: vs.map((v) => v - med), trapExplanation: r`${med} is the median. Centring subtracts the mean, $\frac{${vs.join(' + ')}}{3} = ${m}$.` },
          { id: 'd', label: t(vs.map((v) => m - v)), value: vs.map((v) => m - v), trapExplanation: r`The sign is reversed: a value above the mean must stay positive.` },
        ],
        stepByStepSolution: [
          r`Mean: $\frac{${vs.join(' + ')}}{3} = ${m}$.`,
          r`Subtract it from every value.`,
          r`${t(vs.map((v) => v - m))}: they now average 0.`,
        ],
      };
    },
  },
  {
    id: 'la-12-x5',
    difficulty: 2,
    keyConceptTag: 'Variance of a centred feature',
    correctOptionId: 'a',
    generate: (g) => {
      const { p, q } = g.until(() => ({ p: g.nonzero(-5, 5), q: g.nonzero(-5, 5) }), ({ p, q }) => Math.abs(p) !== Math.abs(q));
      const x = [p, -p, q, -q];
      const ss = dot(x, x);
      return {
        params: { x },
        promptText: r`A centred feature takes the values $${x.join(', ')}$ on four samples. What is its sample variance?`,
        options: [
          { id: 'a', label: `$${frac(ss, 3)}$`, value: ss / 3 },
          { id: 'b', label: `$${frac(ss, 4)}$`, value: ss / 4, trapExplanation: r`The sample variance divides by $n - 1 = 3$.` },
          { id: 'c', label: '$0$', value: 0, trapExplanation: r`The values average 0 — that is what centring means. The variance averages their <i>squares</i>.` },
          { id: 'd', label: `$${ss}$`, value: ss, trapExplanation: r`That is the sum of squares; divide it by $n - 1 = 3$.` },
        ],
        stepByStepSolution: [
          r`Centred data: variance $= \frac{1}{n - 1}\sum x_i^2$.`,
          r`$\sum x_i^2 = ${x.map((v) => (v < 0 ? `(${v})^2` : `${v}^2`)).join(' + ')} = ${ss}$.`,
          r`$\frac{${ss}}{3} = ${frac(ss, 3)}$.`,
        ],
      };
    },
  },
  {
    id: 'la-12-x6',
    difficulty: 2,
    keyConceptTag: 'Total variance is the trace',
    correctOptionId: 'a',
    generate: (g) => {
      const { A, l1, l2 } = g.until(
        () => symFrom(g, undefined, [1, 2], [1, 2, 3, 4]),
        ({ A, l1, l2 }) => A.flat().every((x) => Math.abs(x) <= 15) && allDistinct([l2, A[1][1], A[0][0] + A[1][1], (A[0][0] + A[1][1]) / 2, l1]),
      );
      const t = A[0][0] + A[1][1];
      return {
        params: { A, l1 },
        promptText: r`The covariance matrix $C = ${pm(A)}$ has the eigenvalue $${l1}$. What is its other eigenvalue?`,
        options: [
          { id: 'a', label: `$${l2}$`, value: l2 },
          { id: 'b', label: `$${A[1][1]}$`, value: A[1][1], trapExplanation: r`The eigenvalues are not the diagonal entries (unless $C$ is diagonal). Use that they add up to the trace.` },
          { id: 'c', label: `$${t}$`, value: t, trapExplanation: r`That is the trace, the sum of <i>both</i> eigenvalues. Subtract the one you know.` },
          { id: 'd', label: `$${dec(t / 2)}$`, value: t / 2, trapExplanation: r`That is the average variance. The eigenvalues add up to $${t}$ but are not equal.` },
        ],
        stepByStepSolution: [
          r`The eigenvalues add up to the trace: $\lambda_1 + \lambda_2 = ${A[0][0]} + ${A[1][1]} = ${t}$.`,
          r`$\lambda_2 = ${t} - ${l1}$.`,
          r`$\lambda_2 = ${l2}$. The total variance is shared out, not changed.`,
        ],
      };
    },
  },
];
