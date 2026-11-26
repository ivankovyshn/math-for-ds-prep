import type { QuestionTemplate, Rng } from '../../../types.ts';
import { r } from '../define.ts';
import { add, allDistinct, coef, cross, dot, frac, fvec, gcd, ints, lineTex, mat, outer, pm, sumOf, times, vec } from '../gen.ts';

/** b = t·a + s·w with w ⊥ a in the plane: its projection onto the line through a is t·a. */
export function splitPlane(g: Rng, ts: number[] = [-3, -2, -1, 1, 2, 3]) {
  const a = [g.nonzero(-3, 3), g.nonzero(-3, 3)];
  const w = [-a[1], a[0]];
  const t = g.pick(ts);
  const s = g.nonzero(-2, 2);
  return { a, w, t, s, b: add(times(t, a), times(s, w)) };
}

/** Rank by floating-point elimination (small integer matrices only). */
export function rankOf(M: number[][]): number {
  const A = M.map((row) => [...row]);
  let rank = 0;
  for (let c = 0; c < A[0].length && rank < A.length; c++) {
    const p = A.findIndex((row, i) => i >= rank && Math.abs(row[c]) > 1e-9);
    if (p < 0) continue;
    [A[p], A[rank]] = [A[rank], A[p]];
    for (let i = rank + 1; i < A.length; i++) {
      const f = A[i][c] / A[rank][c];
      A[i] = A[i].map((x, j) => x - f * A[rank][j]);
    }
    rank++;
  }
  return rank;
}

export const points = (t: number[], y: number[]) => t.map((ti, i) => `(${ti}, ${y[i]})`).join(', ');
/** A number as TeX: integers plainly, halves and quarters as decimals. */
export const num = (x: number) => `${Math.round(x * 1000) / 1000}`;

export const practice: QuestionTemplate[] = [
  {
    id: 'la-09-1',
    difficulty: 1,
    keyConceptTag: 'Projection onto a line',
    correctOptionId: 'a',
    generate: (g) => {
      const { a, w, t, s, b } = g.until(
        () => splitPlane(g),
        ({ a, w, t, s, b }) => allDistinct([times(t, a), times(t * dot(a, a), a), times(s, w), b.map((x) => (x * dot(a, b)) / dot(b, b))]),
      );
      const n = dot(a, a);
      const ab = dot(a, b);
      const bb = dot(b, b);
      return {
        params: { a, b },
        promptText: r`Project $\mathbf{b} = ${vec(b)}$ onto the line through $\mathbf{a} = ${vec(a)}$.`,
        options: [
          { id: 'a', label: `$${vec(times(t, a))}$`, value: times(t, a) },
          { id: 'b', label: `$${vec(times(ab, a))}$`, value: times(ab, a), trapExplanation: r`That is $(\mathbf{a}\cdot\mathbf{b})\,\mathbf{a}$. Divide by $\mathbf{a}\cdot\mathbf{a} = ${n}$ too, unless $\mathbf{a}$ is a unit vector.` },
          { id: 'c', label: `$${vec(times(s, w))}$`, value: times(s, w), trapExplanation: r`That is the error $\mathbf{e} = \mathbf{b} - \mathbf{p}$, the part of $\mathbf{b}$ perpendicular to the line.` },
          { id: 'd', label: `$${fvec(times(ab, b), bb)}$`, value: b.map((x) => (x * ab) / bb), trapExplanation: r`That projects $\mathbf{a}$ onto $\mathbf{b}$, the other way round. The result must lie on the line through $\mathbf{a}$.` },
        ],
        stepByStepSolution: [
          r`$\mathbf{a}\cdot\mathbf{b} = ${ab}$ and $\mathbf{a}\cdot\mathbf{a} = ${n}$, so $\hat{x} = \frac{${ab}}{${n}} = ${t}$.`,
          r`$\mathbf{p} = ${t}\cdot${vec(a)} = ${vec(times(t, a))}$.`,
          r`Check: $\mathbf{e} = \mathbf{b} - \mathbf{p} = ${vec(times(s, w))}$ and $\mathbf{e}\cdot\mathbf{a} = 0$. ✓`,
        ],
      };
    },
  },
  {
    id: 'la-09-2',
    difficulty: 1,
    keyConceptTag: 'Projection matrix onto a line',
    correctOptionId: 'a',
    generate: (g) => {
      const a = [g.nonzero(-3, 3), g.nonzero(-3, 3)];
      const n = dot(a, a);
      const aat = outer(a, a);
      const perp = [[a[1] * a[1], -a[0] * a[1]], [-a[0] * a[1], a[0] * a[0]]];
      const diag = [[a[0] * a[0], 0], [0, a[1] * a[1]]];
      const over = (M: number[][]) => M.flat().map((x) => x / n);
      return {
        params: { a },
        promptText: r`What is the matrix $P$ of the projection onto the line through $\mathbf{a} = ${vec(a)}$?`,
        options: [
          { id: 'a', label: `$\\tfrac{1}{${n}}${pm(aat)}$`, value: over(aat) },
          { id: 'b', label: `$${pm(aat)}$`, value: aat.flat(), trapExplanation: r`$\mathbf{a}\mathbf{a}^T$ must be divided by $\mathbf{a}^T\mathbf{a} = ${n}$. Without it $P\mathbf{a} = ${n}\mathbf{a}$ instead of $\mathbf{a}$.` },
          { id: 'c', label: `$\\tfrac{1}{${n}}${pm(perp)}$`, value: over(perp), trapExplanation: r`That is $I - P$, the projection onto the perpendicular line: it sends $\mathbf{a}$ to $\mathbf{0}$.` },
          { id: 'd', label: `$\\tfrac{1}{${n}}${pm(diag)}$`, value: over(diag), trapExplanation: r`The off-diagonal entries of $\mathbf{a}\mathbf{a}^T$ are $a_1a_2 = ${a[0] * a[1]}$, not 0.` },
        ],
        stepByStepSolution: [
          r`$P = \dfrac{\mathbf{a}\mathbf{a}^T}{\mathbf{a}^T\mathbf{a}}$ with $\mathbf{a}^T\mathbf{a} = ${a[0] * a[0]} + ${a[1] * a[1]} = ${n}$.`,
          r`$\mathbf{a}\mathbf{a}^T = ${pm(aat)}$.`,
          r`$P = \tfrac{1}{${n}}${pm(aat)}$. Check: $P\mathbf{a} = \tfrac{1}{${n}}${vec(times(n, a))} = \mathbf{a}$. ✓`,
        ],
      };
    },
  },
  {
    id: 'la-09-3',
    difficulty: 2,
    keyConceptTag: 'Least squares with one unknown',
    correctOptionId: 'a',
    generate: (g) => {
      const { t, y } = g.until(
        () => {
          const t = [-3, -2, -1, 1, 2, 3].filter(() => g.next() < 0.5).slice(0, 3);
          return { t, y: ints(g, t.length, -6, 6) };
        },
        ({ t, y }) => {
          if (t.length !== 3) return false;
          const [St2, Sty, St, Sy] = [dot(t, t), dot(t, y), sumOf(t), sumOf(y)];
          return Sty !== 0 && St !== 0 && allDistinct([Sty / St2, Sty, Sy / St, St2 / Sty]);
        },
      );
      const [St2, Sty, St, Sy] = [dot(t, t), dot(t, y), sumOf(t), sumOf(y)];
      return {
        params: { t, y },
        promptText: r`Fit the line $y = kt$ through the origin to the points $${points(t, y)}$ by least squares. What is $\hat k$?`,
        options: [
          { id: 'a', label: `$${frac(Sty, St2)}$`, value: Sty / St2 },
          { id: 'b', label: `$${Sty}$`, value: Sty, trapExplanation: r`${Sty} is $A^T\mathbf{b} = \sum t_iy_i$. The normal equation divides it by $A^TA = \sum t_i^2 = ${St2}$.` },
          { id: 'c', label: `$${frac(Sy, St)}$`, value: Sy / St, trapExplanation: r`$\frac{\sum y_i}{\sum t_i}$ is not the least-squares slope. Minimising $\sum (y_i - kt_i)^2$ gives $\frac{\sum t_iy_i}{\sum t_i^2}$.` },
          { id: 'd', label: `$${frac(St2, Sty)}$`, value: St2 / Sty, trapExplanation: r`The fraction is upside down: $\hat k = \frac{A^T\mathbf{b}}{A^TA}$.` },
        ],
        stepByStepSolution: [
          r`One unknown: $A$ is the column $${vec(t)}$ and $\mathbf{b} = ${vec(y)}$.`,
          r`$A^TA = \sum t_i^2 = ${St2}$ and $A^T\mathbf{b} = \sum t_iy_i = ${Sty}$.`,
          r`Normal equation $${St2}\hat k = ${Sty}$, so $\hat k = ${frac(Sty, St2)}$.`,
        ],
      };
    },
  },
  {
    id: 'la-09-4',
    difficulty: 2,
    keyConceptTag: 'Trace of a projection',
    correctOptionId: 'a',
    generate: (g) => {
      const { n, k, A } = g.until(
        () => {
          const n = g.int(3, 4);
          const k = g.int(1, n - 1);
          return { n, k, A: mat(g, n, k, -2, 2) };
        },
        ({ n, k, A }) => k !== n - k && rankOf(A) === k && A.flat().filter((x) => x !== 0).length >= n,
      );
      return {
        params: { A },
        promptText: r`$P$ is the matrix of the projection onto the column space of $A = ${pm(A)}$, whose columns are independent. What is $\operatorname{tr}P$?`,
        options: [
          { id: 'a', label: `$${k}$`, value: k },
          { id: 'b', label: `$${n}$`, value: n, trapExplanation: r`$\operatorname{tr}I = ${n}$, but $P$ acts like $I$ only on the column space; perpendicular directions are sent to $\mathbf{0}$.` },
          { id: 'c', label: `$${n - k}$`, value: n - k, trapExplanation: r`${n - k} is the trace of $I - P$, the projection onto the directions perpendicular to the columns.` },
          { id: 'd', label: '$0$', value: 0, trapExplanation: r`Only the zero matrix projects everything to $\mathbf{0}$. $P$ keeps the column space, so it has eigenvalue 1 there.` },
        ],
        stepByStepSolution: [
          r`$P$ has eigenvalue 1 on the column space, which has dimension ${k} (the columns are independent), and eigenvalue 0 on the ${n - k} perpendicular direction${n - k === 1 ? '' : 's'}.`,
          r`The trace is the sum of the eigenvalues: $${Array(k).fill(1).join(' + ')}${n - k ? ' + ' + Array(n - k).fill(0).join(' + ') : ''} = ${k}$.`,
          r`Or directly: $\operatorname{tr}\big(A(A^TA)^{-1}A^T\big) = \operatorname{tr}\big((A^TA)^{-1}A^TA\big) = \operatorname{tr}I_{${k}} = ${k}$.`,
        ],
      };
    },
  },
  {
    id: 'la-09-5',
    difficulty: 3,
    keyConceptTag: 'Fitting a line by least squares',
    correctOptionId: 'a',
    generate: (g) => {
      const { t, c, d, s } = g.until(
        () => {
          const t0 = g.int(-1, 1);
          return { t: [t0, t0 + 1, t0 + 2], c: g.int(-5, 6), d: g.nonzero(-4, 4), s: g.nonzero(-2, 2) };
        },
        ({ t, c, d, s }) => allDistinct([[c, d], [c + s, d], [c + s + 3 * s * t[0], d - 3 * s], [d, c]]),
      );
      const e = [s, -2 * s, s];
      const y = t.map((ti, i) => c + d * ti + e[i]);
      const A = t.map((ti) => [1, ti]);
      const AtA = [[3, sumOf(t)], [sumOf(t), dot(t, t)]];
      const Atb = [sumOf(y), dot(t, y)];
      const two = [c + s + 3 * s * t[0], d - 3 * s];
      const line = ([cc, dd]: number[]) => `$y = ${lineTex(cc, dd)}$`;
      return {
        params: { t, y },
        promptText: r`Find the least-squares line $y = c + dt$ through the points $${points(t, y)}$.`,
        options: [
          { id: 'a', label: line([c, d]), value: [c, d] },
          { id: 'b', label: line([c + s, d]), value: [c + s, d], trapExplanation: r`That line passes exactly through the first and last points and leaves the whole error, $${-3 * s}$, at the middle one. Least squares spreads the error over all three points.` },
          { id: 'c', label: line(two), value: two, trapExplanation: r`That line passes through the first two points only and ignores the third. Least squares uses every point.` },
          { id: 'd', label: line([d, c]), value: [d, c], trapExplanation: r`The intercept and the slope are swapped. The unknowns follow the columns of $A$: first the column of ones ($c$), then $t$ ($d$).` },
        ],
        stepByStepSolution: [
          r`$A = ${pm(A)}$, $\mathbf{b} = ${vec(y)}$; $A^TA = ${pm(AtA)}$, $A^T\mathbf{b} = ${vec(Atb)}$.`,
          r`Solving $A^TA\,(c, d) = A^T\mathbf{b}$ gives $c = ${c}$, $d = ${d}$: the line $y = ${lineTex(c, d)}$.`,
          r`Check: the residuals $\mathbf{b} - A\hat{\mathbf{x}} = ${vec(e)}$ add up to 0 and are perpendicular to $${vec(t)}$. ✓`,
        ],
      };
    },
  },
  {
    id: 'la-09-6',
    difficulty: 3,
    keyConceptTag: 'Projection onto a plane',
    correctOptionId: 'a',
    generate: (g) => {
      const { u1, u2, nn, t1, t2, s } = g.until(
        () => {
          const u1 = ints(g, 3, -2, 2);
          const u2 = ints(g, 3, -2, 2);
          const c = cross(u1, u2);
          const k = gcd(gcd(c[0], c[1]), c[2]) || 1;
          return { u1, u2, nn: c.map((x) => x / k), t1: g.nonzero(-2, 2), t2: g.nonzero(-2, 2), s: g.pick([-1, 1]) };
        },
        ({ u1, u2, nn, t1, t2, s }) => {
          if (dot(u1, u2) !== 0 || dot(u1, u1) < 2 || dot(u2, u2) < 2) return false;
          const p = add(times(t1, u1), times(t2, u2));
          const b = add(p, times(s, nn));
          const naive = add(times(dot(b, u1), u1), times(dot(b, u2), u2));
          return b.every((x) => Math.abs(x) <= 12) && allDistinct([p, times(s, nn), times(t1, u1), naive]);
        },
      );
      const p = add(times(t1, u1), times(t2, u2));
      const b = add(p, times(s, nn));
      const [b1, b2, n1, n2] = [dot(b, u1), dot(b, u2), dot(u1, u1), dot(u2, u2)];
      const naive = add(times(b1, u1), times(b2, u2));
      return {
        params: { u1, u2, b },
        promptText: r`The vectors $\mathbf{u}_1 = ${vec(u1)}$ and $\mathbf{u}_2 = ${vec(u2)}$ are orthogonal. Project $\mathbf{b} = ${vec(b)}$ onto the plane they span.`,
        options: [
          { id: 'a', label: `$${vec(p)}$`, value: p },
          { id: 'b', label: `$${vec(times(s, nn))}$`, value: times(s, nn), trapExplanation: r`That is the error $\mathbf{b} - \mathbf{p}$: the part of $\mathbf{b}$ perpendicular to the plane.` },
          { id: 'c', label: `$${vec(times(t1, u1))}$`, value: times(t1, u1), trapExplanation: r`That is the projection onto the line through $\mathbf{u}_1$ only. Add the projection onto $\mathbf{u}_2$.` },
          { id: 'd', label: `$${vec(naive)}$`, value: naive, trapExplanation: r`Each coefficient must be divided by $\mathbf{u}_i\cdot\mathbf{u}_i$ (${n1} and ${n2}): the $\mathbf{u}_i$ are orthogonal but not unit vectors.` },
        ],
        stepByStepSolution: [
          r`Because $\mathbf{u}_1 \perp \mathbf{u}_2$, project onto each line and add: $\mathbf{p} = \frac{\mathbf{b}\cdot\mathbf{u}_1}{\mathbf{u}_1\cdot\mathbf{u}_1}\mathbf{u}_1 + \frac{\mathbf{b}\cdot\mathbf{u}_2}{\mathbf{u}_2\cdot\mathbf{u}_2}\mathbf{u}_2$.`,
          r`$\frac{${b1}}{${n1}} = ${t1}$ and $\frac{${b2}}{${n2}} = ${t2}$, so $\mathbf{p} = ${coef(t1)}${vec(u1)} ${t2 < 0 ? '-' : '+'} ${coef(Math.abs(t2))}${vec(u2)} = ${vec(p)}$.`,
          r`Check: $\mathbf{e} = \mathbf{b} - \mathbf{p} = ${vec(times(s, nn))}$ is perpendicular to both $\mathbf{u}_1$ and $\mathbf{u}_2$. ✓`,
        ],
      };
    },
  },
];

