import type { QuestionTemplate } from '../../../types.ts';
import { r } from '../define.ts';
import { add, allDistinct, dot, frac, ints, pm, sub, sumOf, times, tr, vec } from '../gen.ts';
import { num, points, splitPlane } from './09-projections.practice.ts';

/** Extra practice (Practice 2): gentler questions on the same ideas, with new numbers every time. */
export const extra: QuestionTemplate[] = [
  {
    id: 'la-09-x1',
    difficulty: 1,
    keyConceptTag: 'Projection coefficient',
    correctOptionId: 'a',
    generate: (g) => {
      const { a, b, t } = g.until(
        () => splitPlane(g, [-3, -2, 2, 3]),
        ({ a, b, t }) => allDistinct([t, t * dot(a, a), 1 / t, dot(a, b) / dot(b, b)]),
      );
      const [ab, n, bb] = [dot(a, b), dot(a, a), dot(b, b)];
      return {
        params: { a, b },
        promptText: r`The projection of $\mathbf{b} = ${vec(b)}$ onto the line through $\mathbf{a} = ${vec(a)}$ is $\hat{x}\,\mathbf{a}$. What is $\hat{x}$?`,
        options: [
          { id: 'a', label: `$${t}$`, value: t },
          { id: 'b', label: `$${ab}$`, value: ab, trapExplanation: r`${ab} is $\mathbf{a}\cdot\mathbf{b}$ alone; divide it by $\mathbf{a}\cdot\mathbf{a} = ${n}$.` },
          { id: 'c', label: `$${frac(1, t)}$`, value: 1 / t, trapExplanation: r`The fraction is upside down: $\hat{x} = \frac{\mathbf{a}\cdot\mathbf{b}}{\mathbf{a}\cdot\mathbf{a}}$, not $\frac{\mathbf{a}\cdot\mathbf{a}}{\mathbf{a}\cdot\mathbf{b}}$.` },
          { id: 'd', label: `$${frac(ab, bb)}$`, value: ab / bb, trapExplanation: r`The denominator is $\mathbf{a}\cdot\mathbf{a}$: we project onto $\mathbf{a}$, so we divide by its squared length, not by $\mathbf{b}\cdot\mathbf{b} = ${bb}$.` },
        ],
        stepByStepSolution: [
          r`$\hat{x} = \dfrac{\mathbf{a}\cdot\mathbf{b}}{\mathbf{a}\cdot\mathbf{a}}$.`,
          r`$\mathbf{a}\cdot\mathbf{b} = ${ab}$, $\mathbf{a}\cdot\mathbf{a} = ${n}$.`,
          r`$\hat{x} = \frac{${ab}}{${n}} = ${t}$.`,
        ],
      };
    },
  },
  {
    id: 'la-09-x2',
    difficulty: 1,
    keyConceptTag: 'The error is perpendicular',
    correctOptionId: 'a',
    generate: (g) => {
      const { a, b, t, s, w } = g.until(
        () => splitPlane(g),
        ({ a, b, t, s, w }) => allDistinct([times(s, w), times(-s, w), add(b, times(t, a)), times(t, a)]),
      );
      const p = times(t, a);
      return {
        params: { a, b },
        promptText: r`The projection of $\mathbf{b} = ${vec(b)}$ onto the line through $\mathbf{a} = ${vec(a)}$ is $\mathbf{p} = ${vec(p)}$. What is the error vector $\mathbf{e}$?`,
        options: [
          { id: 'a', label: `$${vec(sub(b, p))}$`, value: sub(b, p) },
          { id: 'b', label: `$${vec(sub(p, b))}$`, value: sub(p, b), trapExplanation: r`That is $\mathbf{p} - \mathbf{b}$. The error points from the projection to $\mathbf{b}$: $\mathbf{e} = \mathbf{b} - \mathbf{p}$, so that $\mathbf{b} = \mathbf{p} + \mathbf{e}$.` },
          { id: 'c', label: `$${vec(add(b, p))}$`, value: add(b, p), trapExplanation: r`The error is a difference, not a sum. Check: this vector is not perpendicular to $\mathbf{a}$.` },
          { id: 'd', label: `$${vec(p)}$`, value: p, trapExplanation: r`That is the projection itself, which lies on the line. The error is the remaining part of $\mathbf{b}$.` },
        ],
        stepByStepSolution: [
          r`$\mathbf{e} = \mathbf{b} - \mathbf{p} = ${vec(b)} - ${vec(p)}$.`,
          r`$= ${vec(sub(b, p))}$.`,
          r`Check: $\mathbf{e}\cdot\mathbf{a} = ${dot(sub(b, p), a)}$, so $\mathbf{e}$ is perpendicular to the line. ✓`,
        ],
      };
    },
  },
  {
    id: 'la-09-x3',
    difficulty: 1,
    keyConceptTag: 'Projection matrix on special vectors',
    correctOptionId: 'a',
    generate: (g) => {
      const a = [g.nonzero(-3, 3), g.nonzero(-3, 3)];
      const k = g.pick([-3, -2, 2, 3]);
      const onLine = g.next() < 0.5;
      const b = onLine ? times(k, a) : times(k, [-a[1], a[0]]);
      const zero = [0, 0];
      const answer = onLine ? b : zero;
      const other = onLine ? zero : b;
      const minus = times(-1, b);
      return {
        params: { a, b },
        promptText: r`$P$ is the projection matrix onto the line through $\mathbf{a} = ${vec(a)}$. What is $P\mathbf{b}$ for $\mathbf{b} = ${vec(b)}$?`,
        options: [
          { id: 'a', label: `$${vec(answer)}$`, value: answer },
          {
            id: 'b',
            label: `$${vec(other)}$`,
            value: other,
            trapExplanation: onLine
              ? r`$\mathbf{b} = ${k}\mathbf{a}$ already lies on the line, so projecting changes nothing.`
              : r`$P\mathbf{b} = \mathbf{b}$ only for vectors on the line. Here $\mathbf{a}\cdot\mathbf{b} = 0$: $\mathbf{b}$ is perpendicular to the line.`,
          },
          { id: 'c', label: `$${vec(a)}$`, value: a, trapExplanation: r`$P\mathbf{b}$ is a multiple of $\mathbf{a}$, but the multiple is $\frac{\mathbf{a}\cdot\mathbf{b}}{\mathbf{a}\cdot\mathbf{a}} = ${onLine ? k : 0}$, not 1.` },
          { id: 'd', label: `$${vec(minus)}$`, value: minus, trapExplanation: r`A projection never reverses vectors: its eigenvalues are only 1 and 0.` },
        ],
        stepByStepSolution: [
          r`$P\mathbf{b} = \frac{\mathbf{a}\cdot\mathbf{b}}{\mathbf{a}\cdot\mathbf{a}}\,\mathbf{a}$ with $\mathbf{a}\cdot\mathbf{b} = ${dot(a, b)}$ and $\mathbf{a}\cdot\mathbf{a} = ${dot(a, a)}$.`,
          onLine ? r`The coefficient is ${k}: $\mathbf{b} = ${k}\mathbf{a}$ is on the line.` : r`The coefficient is 0: $\mathbf{b}$ is perpendicular to the line.`,
          r`$P\mathbf{b} = ${vec(answer)}$.`,
        ],
      };
    },
  },
  {
    id: 'la-09-x4',
    difficulty: 2,
    keyConceptTag: 'Computing AᵀA',
    correctOptionId: 'a',
    generate: (g) => {
      const { c1, c2 } = g.until(
        () => ({ c1: ints(g, 3, -3, 3), c2: ints(g, 3, -3, 3) }),
        ({ c1, c2 }) => dot(c1, c2) !== 0 && dot(c1, c1) !== dot(c2, c2) && dot(c1, c1) > 0 && dot(c2, c2) > 0,
      );
      const A = tr([c1, c2]);
      const [n1, n2, d] = [dot(c1, c1), dot(c2, c2), dot(c1, c2)];
      const M = [[n1, d], [d, n2]];
      return {
        params: { A },
        promptText: r`For $A = ${pm(A)}$, compute $A^TA$, the matrix of the normal equations.`,
        options: [
          { id: 'a', label: `$${pm(M)}$`, value: M.flat() },
          { id: 'b', label: `$${pm([[n1, 0], [0, n2]])}$`, value: [n1, 0, 0, n2], trapExplanation: r`The off-diagonal entries are the dot product of the two columns, $${d}$, not 0: the columns are not perpendicular.` },
          { id: 'c', label: `$${pm([[n1, -d], [-d, n2]])}$`, value: [n1, -d, -d, n2], trapExplanation: r`Check the sign of the off-diagonal entry: column 1 $\cdot$ column 2 $= ${d}$.` },
          { id: 'd', label: `$${pm([[n2, d], [d, n1]])}$`, value: [n2, d, d, n1], trapExplanation: r`Entry $(1, 1)$ is column 1 dotted with itself, $${n1}$; the diagonal is swapped.` },
        ],
        stepByStepSolution: [
          r`Entry $(i, j)$ of $A^TA$ is column $i$ dotted with column $j$.`,
          r`Columns $${vec(c1)}$ and $${vec(c2)}$: lengths squared ${n1} and ${n2}, dot product ${d}.`,
          r`$A^TA = ${pm(M)}$: symmetric, as always.`,
        ],
      };
    },
  },
  {
    id: 'la-09-x5',
    difficulty: 1,
    keyConceptTag: 'Least squares for a constant',
    correctOptionId: 'a',
    generate: (g) => {
      const y = g.until(
        () => ints(g, 4, 0, 12),
        (y) => {
          const s = [...y].sort((p, q) => p - q);
          const mean = sumOf(y) / 4;
          return Number.isInteger(mean) && allDistinct([mean, (s[1] + s[2]) / 2, (s[0] + s[3]) / 2, sumOf(y)]);
        },
      );
      const s = [...y].sort((p, q) => p - q);
      const [mean, median, mid] = [sumOf(y) / 4, (s[1] + s[2]) / 2, (s[0] + s[3]) / 2];
      return {
        params: { y },
        promptText: r`Fit a constant $y = c$ to the values $${y.join(', ')}$ by least squares. What is $\hat c$?`,
        options: [
          { id: 'a', label: `$${num(mean)}$`, value: mean },
          { id: 'b', label: `$${num(median)}$`, value: median, trapExplanation: r`${num(median)} is the median, which minimises the sum of <i>absolute</i> errors. Least squares gives the mean.` },
          { id: 'c', label: `$${num(mid)}$`, value: mid, trapExplanation: r`That is the midpoint of the smallest and largest values; it ignores the others.` },
          { id: 'd', label: `$${sumOf(y)}$`, value: sumOf(y), trapExplanation: r`${sumOf(y)} is $A^T\mathbf{b}$, the sum. Divide by $A^TA = 4$.` },
        ],
        stepByStepSolution: [
          r`$A$ is the column of ones $(1, 1, 1, 1)$ and $\mathbf{b} = ${vec(y)}$.`,
          r`$A^TA = 4$ and $A^T\mathbf{b} = ${sumOf(y)}$.`,
          r`$\hat c = \frac{${sumOf(y)}}{4} = ${num(mean)}$: least squares with a constant gives the mean.`,
        ],
      };
    },
  },
  {
    id: 'la-09-x6',
    difficulty: 2,
    keyConceptTag: 'Least squares with one unknown',
    correctOptionId: 'a',
    generate: (g) => {
      const { t, y } = g.until(
        () => ({ t: [g.nonzero(-3, 3), g.nonzero(-3, 3)], y: ints(g, 2, -6, 6) }),
        ({ t, y }) => {
          const [St2, Sty, St, Sy] = [dot(t, t), dot(t, y), sumOf(t), sumOf(y)];
          return t[0] < t[1] && Sty !== 0 && St !== 0 && allDistinct([Sty / St2, Sty, Sy / St, St2 / Sty]);
        },
      );
      const [St2, Sty, St, Sy] = [dot(t, t), dot(t, y), sumOf(t), sumOf(y)];
      return {
        params: { t, y },
        promptText: r`Fit $y = kt$ to the two points $${points(t, y)}$ by least squares. What is $\hat k$?`,
        options: [
          { id: 'a', label: `$${frac(Sty, St2)}$`, value: Sty / St2 },
          { id: 'b', label: `$${Sty}$`, value: Sty, trapExplanation: r`That is $\sum t_iy_i$; divide by $\sum t_i^2 = ${St2}$.` },
          { id: 'c', label: `$${frac(Sy, St)}$`, value: Sy / St, trapExplanation: r`The ratio of sums is not the least-squares slope: the formula is $\frac{\sum t_iy_i}{\sum t_i^2}$.` },
          { id: 'd', label: `$${frac(St2, Sty)}$`, value: St2 / Sty, trapExplanation: r`Upside down: $\hat k = \frac{A^T\mathbf{b}}{A^TA}$.` },
        ],
        stepByStepSolution: [
          r`$A = ${vec(t)}$ as a column, $\mathbf{b} = ${vec(y)}$.`,
          r`$A^TA = ${t.map((x) => `${x < 0 ? `(${x})` : x}^2`).join(' + ')} = ${St2}$, $A^T\mathbf{b} = ${Sty}$.`,
          r`$\hat k = ${frac(Sty, St2)}$.`,
        ],
      };
    },
  },
];
