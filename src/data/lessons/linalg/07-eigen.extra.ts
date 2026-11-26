import type { QuestionTemplate } from '../../../types.ts';
import { r } from '../define.ts';
import { allDistinct, frac, paren, pm, times, vec } from '../gen.ts';

const sorted = (xs: number[]) => [...xs].sort((a, b) => a - b);
const pair = ([x, y]: number[]) => (x === y ? r`$${x}$ and $${y}$` : r`$${x}$ and $${y}$`);

/** Extra practice (Practice 2): gentler questions on the same ideas, with fresh numbers every time. */
export const extra: QuestionTemplate[] = [
  {
    id: 'la-07-x1',
    difficulty: 1,
    keyConceptTag: 'Eigenvalues of a diagonal matrix',
    correctOptionId: 'a',
    generate: (g) => {
      const [a, b] = g.until(
        () => [g.nonzero(-5, 6), g.nonzero(-5, 6)],
        ([a, b]) => (a < 0 || b < 0) && allDistinct([sorted([a, b]), sorted([Math.abs(a), Math.abs(b)]), [0, 0], [1, 1]]),
      );
      const A = [[a, 0], [0, b]];
      return {
        params: { A },
        promptText: r`What are the eigenvalues of $${pm(A)}$?`,
        options: [
          { id: 'a', label: pair(sorted([a, b])), value: sorted([a, b]) },
          { id: 'b', label: pair(sorted([Math.abs(a), Math.abs(b)])), value: sorted([Math.abs(a), Math.abs(b)]), trapExplanation: r`The sign matters: a negative diagonal entry flips its axis, and the eigenvalue keeps the minus sign.` },
          { id: 'c', label: r`$0$ and $0$`, value: [0, 0], trapExplanation: r`The zeros off the diagonal are not eigenvalues. For a diagonal matrix the eigenvalues sit <i>on</i> the diagonal.` },
          { id: 'd', label: r`$1$ and $1$`, value: [1, 1], trapExplanation: r`Eigenvalue 1 would mean vectors are left unchanged; this matrix scales them by ${a} and ${b}.` },
        ],
        stepByStepSolution: [
          r`A diagonal matrix scales each axis separately.`,
          r`$A\mathbf{e}_1 = ${a}\mathbf{e}_1$ and $A\mathbf{e}_2 = ${b}\mathbf{e}_2$.`,
          r`So the eigenvalues are the diagonal entries, ${a} and ${b}.`,
        ],
      };
    },
  },
  {
    id: 'la-07-x2',
    difficulty: 1,
    keyConceptTag: 'Eigenvalue from Av = λv',
    correctOptionId: 'a',
    generate: (g) => {
      const [a, b] = g.until(() => [g.nonzero(-4, 7), g.nonzero(-4, 7)], ([a, b]) => a !== b && a !== -99);
      const A = [[a, 0], [0, b]];
      return {
        params: { A, v: [1, 0] },
        promptText: r`$A = ${pm(A)}$ and $\mathbf{v} = (1, 0)$. Is $\mathbf{v}$ an eigenvector, and with which eigenvalue?`,
        options: [
          { id: 'a', label: r`Yes, $\lambda = ${a}$`, value: a },
          { id: 'b', label: r`Yes, $\lambda = ${b}$`, value: b, trapExplanation: r`$\lambda = ${b}$ belongs to $(0, 1)$. $A(1, 0) = (${a}, 0)$.` },
          { id: 'c', label: r`Yes, $\lambda = 0$`, value: 0, trapExplanation: r`$A\mathbf{v} = (${a}, 0) \ne \mathbf{0}$, so the eigenvalue is not 0.` },
          { id: 'd', label: 'No', value: -99, trapExplanation: r`$A\mathbf{v} = (${a}, 0) = ${a}\mathbf{v}$ lies on the same line as $\mathbf{v}$, so it is an eigenvector.` },
        ],
        stepByStepSolution: [
          r`Compute $A\mathbf{v} = (${a} \cdot 1 + 0,\ 0 + ${paren(b)} \cdot 0) = (${a}, 0)$.`,
          r`$(${a}, 0) = ${a} \cdot (1, 0)$.`,
          r`So $A\mathbf{v} = ${a}\mathbf{v}$: eigenvector with $\lambda = ${a}$.`,
        ],
      };
    },
  },
  {
    id: 'la-07-x3',
    difficulty: 1,
    keyConceptTag: 'Multiples of eigenvectors',
    correctOptionId: 'a',
    generate: (g) => {
      const { v, lam, c } = g.until(
        () => ({ v: [g.int(1, 3), g.nonzero(-3, 3)], lam: g.pick([-2, 2, 3, 4, 5]), c: g.pick([2, 3, -1, -2]) }),
        ({ v, lam, c }) => allDistinct([times(c * lam, v), times(c, v), times(lam, v), times(c, v).map((x) => x + lam)]),
      );
      const w = times(c, v);
      return {
        params: { v, lam, c },
        promptText: r`$A\mathbf{v} = ${lam}\mathbf{v}$ for $\mathbf{v} = ${vec(v)}$. What is $A\,${vec(w)}$?`,
        options: [
          { id: 'a', label: r`$${vec(times(c * lam, v))}$`, value: times(c * lam, v) },
          { id: 'b', label: r`$${vec(w)}$`, value: w, trapExplanation: r`$${vec(w)}$ is an eigenvector too, so it is scaled by ${lam}, not left alone.` },
          { id: 'c', label: r`$${vec(times(lam, v))}$`, value: times(lam, v), trapExplanation: r`$${vec(times(lam, v))} = A${vec(v)}$. Here the input is $${c}${vec(v)}$, so the output is $${c} \cdot ${vec(times(lam, v))}$.` },
          { id: 'd', label: r`$${vec(w.map((x) => x + lam))}$`, value: w.map((x) => x + lam), trapExplanation: r`Adding ${lam} is not what eigenvalues do; they multiply.` },
        ],
        stepByStepSolution: [
          r`$${vec(w)} = ${c}\mathbf{v}$.`,
          r`By linearity $A(${c}\mathbf{v}) = ${c}A\mathbf{v} = ${c} \cdot ${lam}\mathbf{v}$.`,
          r`$= ${c * lam}\mathbf{v} = ${vec(times(c * lam, v))}$. Every non-zero multiple of an eigenvector is an eigenvector.`,
        ],
      };
    },
  },
  {
    id: 'la-07-x4',
    difficulty: 2,
    keyConceptTag: 'Characteristic equation',
    correctOptionId: 'a',
    generate: (g) => {
      const { a, b } = g.until(
        () => ({ a: g.int(1, 5), b: g.int(1, 4) }),
        ({ a, b }) => a !== b && allDistinct([sorted([a - b, a + b]), [a, a], sorted([b - a, a + b]), [0, 2 * a]]),
      );
      const A = [[a, b], [b, a]];
      const det = a * a - b * b;
      return {
        params: { A },
        promptText: r`Find the eigenvalues of $${pm(A)}$.`,
        options: [
          { id: 'a', label: pair(sorted([a - b, a + b])), value: sorted([a - b, a + b]) },
          { id: 'b', label: pair([a, a]), value: [a, a], trapExplanation: r`Reading off the diagonal works only for triangular matrices. This one has non-zero entries off the diagonal.` },
          { id: 'c', label: pair(sorted([b - a, a + b])), value: sorted([b - a, a + b]), trapExplanation: r`The eigenvalues multiply to $\det A = ${det}$; check the product of these two.` },
          { id: 'd', label: pair([0, 2 * a]), value: [0, 2 * a], trapExplanation: r`An eigenvalue 0 would need $\det A = 0$, but $\det A = ${det}$.` },
        ],
        stepByStepSolution: [
          r`$\det(A - \lambda I) = (${a} - \lambda)^2 - ${b * b} = 0$.`,
          r`$${a} - \lambda = \pm ${b}$.`,
          r`$\lambda = ${a - b}$ or $\lambda = ${a + b}$. Check: sum $= ${2 * a} = \operatorname{tr} A$, product $= ${det} = \det A$.`,
        ],
      };
    },
  },
  {
    id: 'la-07-x5',
    difficulty: 2,
    keyConceptTag: 'Trace and determinant',
    correctOptionId: 'a',
    generate: (g) => {
      const { l1, l2 } = g.until(
        () => ({ l1: g.int(2, 4), l2: g.int(4, 8) }),
        ({ l1, l2 }) => l2 - l1 >= 2 && allDistinct([[l1, l2], [l1 + 1, l2 - 1], [-l2, -l1], sorted([1, l1 * l2])]),
      );
      const [t, d] = [l1 + l2, l1 * l2];
      return {
        params: { t, d },
        promptText: r`A $2 \times 2$ matrix has trace ${t} and determinant ${d}. What are its eigenvalues?`,
        options: [
          { id: 'a', label: pair([l1, l2]), value: [l1, l2] },
          { id: 'b', label: pair([l1 + 1, l2 - 1]), value: [l1 + 1, l2 - 1], trapExplanation: r`They add up to ${t}, but $${l1 + 1} \cdot ${l2 - 1} = ${(l1 + 1) * (l2 - 1)} \ne ${d}$.` },
          { id: 'c', label: pair([-l2, -l1]), value: [-l2, -l1], trapExplanation: r`Their product is ${d}, but their sum is $${-t}$, not ${t}.` },
          { id: 'd', label: pair([1, d]), value: [1, d], trapExplanation: r`Their product is ${d}, but their sum is ${d + 1}.` },
        ],
        stepByStepSolution: [
          r`For a $2 \times 2$ matrix: $\lambda_1 + \lambda_2 = \operatorname{tr} A$ and $\lambda_1 \lambda_2 = \det A$.`,
          r`So $\lambda$ solves $\lambda^2 - ${t}\lambda + ${d} = 0$.`,
          r`$(\lambda - ${l1})(\lambda - ${l2}) = 0$: $\lambda = ${l1}, ${l2}$.`,
        ],
      };
    },
  },
  {
    id: 'la-07-x6',
    difficulty: 2,
    keyConceptTag: 'Powers via eigenvalues',
    correctOptionId: 'a',
    generate: (g) => {
      const { lam, k } = g.until(
        () => ({ lam: g.pick([-3, -2, 2, 3, 4]), k: g.pick([2, 3]) }),
        ({ lam, k }) => allDistinct([lam ** k, k * lam, lam, 1 / lam]),
      );
      return {
        params: { lam, k },
        promptText: r`$A\mathbf{v} = ${lam}\mathbf{v}$ with $\mathbf{v} \ne \mathbf{0}$. What is $A^${k}\mathbf{v}$?`,
        options: [
          { id: 'a', label: r`$${lam ** k}\mathbf{v}$`, value: lam ** k },
          { id: 'b', label: r`$${k * lam}\mathbf{v}$`, value: k * lam, trapExplanation: r`Applying $A$ ${k} times multiplies by ${lam} each time: $${paren(lam)}^${k}$, not $${k} \cdot ${paren(lam)}$.` },
          { id: 'c', label: r`$${lam}\mathbf{v}$`, value: lam, trapExplanation: r`That is one application of $A$. $A^${k}\mathbf{v} = A(\dots A(A\mathbf{v}))$.` },
          { id: 'd', label: r`$${frac(1, lam)}\mathbf{v}$`, value: 1 / lam, trapExplanation: r`$${frac(1, lam)}$ is the eigenvalue of $A^{-1}$, not of $A^${k}$.` },
        ],
        stepByStepSolution: [
          r`$A^2\mathbf{v} = A(A\mathbf{v}) = A(${lam}\mathbf{v}) = ${lam}A\mathbf{v} = ${paren(lam)}^2\mathbf{v}$.`,
          r`Each further factor $A$ multiplies by ${lam} again.`,
          r`$A^${k}\mathbf{v} = ${paren(lam)}^${k}\mathbf{v} = ${lam ** k}\mathbf{v}$. In general $A^k\mathbf{v} = \lambda^k\mathbf{v}$.`,
        ],
      };
    },
  },
];
