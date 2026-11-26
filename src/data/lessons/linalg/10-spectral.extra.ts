import type { QuestionTemplate } from '../../../types.ts';
import { r } from '../define.ts';
import { allDistinct, paren, pm, vec } from '../gen.ts';
import { CLASSES, classOf, classOptions } from './10-spectral.practice.ts';

const desc = (xs: number[]) => [...xs].sort((p, q) => q - p);
const list = (xs: number[]) => `$${xs.join(', ')}$`;

/** Extra practice (Practice 2): gentler questions on the same ideas, with new numbers every time. */
export const extra: QuestionTemplate[] = [
  {
    id: 'la-10-x1',
    difficulty: 1,
    keyConceptTag: 'Symmetric matrices',
    correctOptionId: 'a',
    generate: (g) => {
      const S = g.until(
        () => {
          const [p, q, s] = [g.nonzero(-4, 5), g.nonzero(-4, 5), g.nonzero(-4, 5)];
          return [[g.int(-4, 5), p, q], [p, g.int(-4, 5), s], [q, s, g.int(-4, 5)]];
        },
        (S) => new Set([S[0][1], S[0][2], S[1][2]]).size === 3,
      );
      const d1 = g.pick([-2, -1, 1, 2]);
      const B = S.map((row) => [...row]);
      B[0][1] += d1;
      const C = S.map((row) => [...row]);
      C[2][1] = C[0][1];
      const U = S.map((row, i) => row.map((x, j) => (j < i ? 0 : x)));
      return {
        params: { a: S, b: B, c: C, d: U },
        promptText: r`Which matrix is symmetric?`,
        options: [
          { id: 'a', label: `$${pm(S)}$` },
          { id: 'b', label: `$${pm(B)}$`, trapExplanation: r`Entry $(1, 2)$ is ${B[0][1]} but entry $(2, 1)$ is ${B[1][0]}: it does not equal its transpose.` },
          { id: 'c', label: `$${pm(C)}$`, trapExplanation: r`Entry $(3, 2)$ is ${C[2][1]} but entry $(2, 3)$ is ${C[1][2]}. Every entry must match its mirror image across the main diagonal.` },
          { id: 'd', label: `$${pm(U)}$`, trapExplanation: r`A triangular matrix is symmetric only if it is diagonal: the entries below the diagonal must mirror those above.` },
        ],
        stepByStepSolution: [
          r`Symmetric means $A = A^T$: $a_{ij} = a_{ji}$ for all $i, j$.`,
          r`Compare each entry above the diagonal with its mirror below it: $(1,2)$ with $(2,1)$, $(1,3)$ with $(3,1)$, $(2,3)$ with $(3,2)$.`,
          r`Only $${pm(S)}$ passes all three checks.`,
        ],
      };
    },
  },
  {
    id: 'la-10-x2',
    difficulty: 1,
    keyConceptTag: 'Evaluating a quadratic form',
    correctOptionId: 'a',
    generate: (g) => {
      const { p, q, x } = g.until(
        () => ({ p: g.nonzero(-4, 5), q: g.nonzero(-4, 5), x: [g.nonzero(-3, 3), g.nonzero(-3, 3)] }),
        ({ p, q, x: [x1, x2] }) => allDistinct([p * x1 * x1 + q * x2 * x2, p * x1 + q * x2, (p * x1 + q * x2) ** 2, p * p * x1 * x1 + q * q * x2 * x2]),
      );
      const [x1, x2] = x;
      const Q = p * x1 * x1 + q * x2 * x2;
      return {
        params: { A: [[p, 0], [0, q]], x },
        promptText: r`Compute $\mathbf{x}^TA\mathbf{x}$ for $A = ${pm([[p, 0], [0, q]])}$ and $\mathbf{x} = ${vec(x)}$.`,
        options: [
          { id: 'a', label: `$${Q}$`, value: Q },
          { id: 'b', label: `$${p * x1 + q * x2}$`, value: p * x1 + q * x2, trapExplanation: r`The form is quadratic: each $x_i$ appears squared, $p\,x_1^2 + q\,x_2^2$.` },
          { id: 'c', label: `$${(p * x1 + q * x2) ** 2}$`, value: (p * x1 + q * x2) ** 2, trapExplanation: r`Squaring the sum adds a cross term that a diagonal matrix does not have.` },
          { id: 'd', label: `$${p * p * x1 * x1 + q * q * x2 * x2}$`, value: p * p * x1 * x1 + q * q * x2 * x2, trapExplanation: r`That is $\|A\mathbf{x}\|^2 = \mathbf{x}^TA^2\mathbf{x}$: the diagonal entries got squared too.` },
        ],
        stepByStepSolution: [
          r`For a diagonal matrix $\mathbf{x}^TA\mathbf{x} = a_{11}x_1^2 + a_{22}x_2^2$: no cross term.`,
          r`$= ${p}\cdot${x1 * x1} + ${paren(q)}\cdot${x2 * x2}$.`,
          r`$= ${Q}$.`,
        ],
      };
    },
  },
  {
    id: 'la-10-x3',
    difficulty: 1,
    keyConceptTag: 'Eigenvectors of a symmetric matrix are orthogonal',
    correctOptionId: 'a',
    generate: (g) => {
      const v = g.until(() => [g.nonzero(-3, 3), g.nonzero(-3, 3)], ([p, q]) => Math.abs(p) !== Math.abs(q));
      const m = g.pick([1, -1, 2]);
      const ans = [-m * v[1], m * v[0]];
      return {
        params: { v, a: ans, b: [2 * v[0], 2 * v[1]], c: [v[1], v[0]], d: [v[0], -v[1]] },
        promptText: r`A symmetric $2\times2$ matrix has two different eigenvalues, and $${vec(v)}$ is an eigenvector for the first one. Which vector must be an eigenvector for the second?`,
        options: [
          { id: 'a', label: `$${vec(ans)}$` },
          { id: 'b', label: `$${vec([2 * v[0], 2 * v[1]])}$`, trapExplanation: r`That is a multiple of $${vec(v)}$, so it is an eigenvector for the <i>first</i> eigenvalue.` },
          { id: 'c', label: `$${vec([v[1], v[0]])}$`, trapExplanation: r`Swapping the entries does not make it perpendicular: the dot product is $${2 * v[0] * v[1]}$.` },
          { id: 'd', label: `$${vec([v[0], -v[1]])}$`, trapExplanation: r`The dot product with $${vec(v)}$ is $${v[0] * v[0] - v[1] * v[1]} \ne 0$, so it is not perpendicular.` },
        ],
        stepByStepSolution: [
          r`For a symmetric matrix, eigenvectors for different eigenvalues are perpendicular.`,
          r`In the plane, the vectors perpendicular to $(a, b)$ are the multiples of $(-b, a)$, here $${vec([-v[1], v[0]])}$.`,
          r`$${vec(ans)}\cdot${vec(v)} = 0$. ✓`,
        ],
      };
    },
  },
  {
    id: 'la-10-x4',
    difficulty: 2,
    keyConceptTag: 'Definiteness from eigenvalues',
    correctOptionId: 'a',
    generate: (g) => {
      const target = g.int(0, 3);
      const ls = g.until(
        () => desc([g.int(-5, 6), g.int(-5, 6), g.int(-5, 6)]),
        (ls) => classOf(ls) === target && new Set(ls).size === 3,
      );
      const { order, options } = classOptions(g, target, ls);
      return {
        params: { ls, order },
        promptText: r`A symmetric $3\times3$ matrix has eigenvalues $${ls.join(', ')}$. How is it classified?`,
        options,
        stepByStepSolution: [
          r`For a symmetric matrix, $\mathbf{x}^TA\mathbf{x} = \lambda_1y_1^2 + \lambda_2y_2^2 + \lambda_3y_3^2$ in eigenvector coordinates.`,
          r`So only the signs of $${ls.join(', ')}$ matter.`,
          r`${CLASSES[target]}.`,
        ],
      };
    },
  },
  {
    id: 'la-10-x5',
    difficulty: 2,
    keyConceptTag: 'Building A = QΛQᵀ',
    correctOptionId: 'a',
    generate: (g) => {
      const [l1, l2] = g.until(() => [g.int(-4, 6), g.int(-4, 6)], ([p, q]) => p !== q && (p - q) % 2 === 0 && p + q !== 0);
      const [s, h] = [(l1 + l2) / 2, (l1 - l2) / 2];
      const A = [[s, h], [h, s]];
      return {
        params: { l1, l2 },
        promptText: r`A symmetric matrix has eigenvalue $${l1}$ with $\mathbf{q}_1 = \tfrac{1}{\sqrt2}(1, 1)$ and eigenvalue $${l2}$ with $\mathbf{q}_2 = \tfrac{1}{\sqrt2}(1, -1)$. What is $A$?`,
        options: [
          { id: 'a', label: `$${pm(A)}$`, value: A.flat() },
          { id: 'b', label: `$${pm([[l1, 0], [0, l2]])}$`, value: [l1, 0, 0, l2], trapExplanation: r`That is $\Lambda$; it equals $A$ only when the eigenvectors are the coordinate axes.` },
          { id: 'c', label: `$${pm([[2 * s, 2 * h], [2 * h, 2 * s]])}$`, value: [2 * s, 2 * h, 2 * h, 2 * s], trapExplanation: r`$\mathbf{q}_i\mathbf{q}_i^T$ carries the factor $\tfrac12$ from $\big(\tfrac{1}{\sqrt2}\big)^2$.` },
          { id: 'd', label: `$${pm([[s, -h], [-h, s]])}$`, value: [s, -h, -h, s], trapExplanation: r`This matrix has the eigenvalues the other way round: it sends $(1, 1)$ to $${l2}\cdot(1, 1)$.` },
        ],
        stepByStepSolution: [
          r`$\mathbf{q}_1\mathbf{q}_1^T = \tfrac12${pm([[1, 1], [1, 1]])}$ and $\mathbf{q}_2\mathbf{q}_2^T = \tfrac12${pm([[1, -1], [-1, 1]])}$.`,
          r`$A = ${l1}\cdot\tfrac12${pm([[1, 1], [1, 1]])} ${l2 < 0 ? '-' : '+'} ${Math.abs(l2)}\cdot\tfrac12${pm([[1, -1], [-1, 1]])}$.`,
          r`$A = ${pm(A)}$. Check: $A(1, 1) = (${s + h}, ${s + h}) = ${l1}\cdot(1, 1)$. ✓`,
        ],
      };
    },
  },
  {
    id: 'la-10-x6',
    difficulty: 2,
    keyConceptTag: 'Eigenvalues of a power',
    correctOptionId: 'a',
    generate: (g) => {
      const ls = g.until(
        () => desc([g.int(-4, 4), g.int(-4, 4), g.int(-4, 4)]),
        (ls) => {
          const sq = desc(ls.map((l) => l * l));
          return new Set(ls).size === 3 && ls.some((l) => l < 0) && allDistinct([sq, ls, desc(ls.map((l) => 2 * l)), desc(ls.map(Math.abs))]);
        },
      );
      const sq = desc(ls.map((l) => l * l));
      return {
        params: { ls },
        promptText: r`A symmetric matrix $A$ has eigenvalues $${ls.join(', ')}$. What are the eigenvalues of $A^2$?`,
        options: [
          { id: 'a', label: list(sq), value: sq },
          { id: 'b', label: list(ls), value: ls, trapExplanation: r`$A^2$ keeps the eigenvectors of $A$, but each eigenvalue is squared: $A^2\mathbf{q} = A(\lambda\mathbf{q}) = \lambda^2\mathbf{q}$.` },
          { id: 'c', label: list(desc(ls.map((l) => 2 * l))), value: desc(ls.map((l) => 2 * l)), trapExplanation: r`Those are the eigenvalues of $2A$, not $A^2$.` },
          { id: 'd', label: list(desc(ls.map(Math.abs))), value: desc(ls.map(Math.abs)), trapExplanation: r`Those are the absolute values (the singular values of $A$). Squaring also removes the signs, but $(${ls.find((l) => l < 0)})^2 = ${ls.find((l) => l < 0)! ** 2}$.` },
        ],
        stepByStepSolution: [
          r`$A = Q\Lambda Q^T$ gives $A^2 = Q\Lambda Q^TQ\Lambda Q^T = Q\Lambda^2Q^T$.`,
          r`So the eigenvalues of $A^2$ are $\lambda_i^2$: $${ls.map((l) => `${paren(l)}^2`).join(', ')}$.`,
          r`In decreasing order: ${list(sq)}. All are $\ge 0$: $A^2$ is positive semidefinite.`,
        ],
      };
    },
  },
];
