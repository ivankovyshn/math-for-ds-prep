import { defineLesson, r } from '../define.ts';
import { extra } from './05-linalg-numpy.extra.ts';
import { practice } from './05-linalg-numpy.practice.ts';

export default defineLesson({
  id: 'pg-05',
  moduleId: 'programming',
  title: 'Linear algebra in NumPy',
  blurb: 'Matrix products, shapes, solving systems and the normal equations in code',
  minutes: 8,
  lecture: [
    {
      title: 'Matrix products',
      covers: ['1', '3', 'x2'],
      blocks: [
        {
          kind: 'text',
          text: r`In NumPy <c>*</c> multiplies <i>element by element</i>. The matrix product of linear algebra is <c>@</c> (or <c>np.dot</c>). For a matrix <c>A</c> and a 1-D array <c>v</c>, <c>A @ v</c> is the matrix–vector product $Av$, and <c>u @ v</c> of two 1-D arrays is their dot product.`,
        },
        {
          kind: 'code',
          code: `import numpy as np\n\nA = np.array([[1, 2], [3, 4]])\nv = np.array([1, 1])\nprint(A @ v, v @ v)\nprint(A * A)\nprint(A @ A)`,
          output: `[3 7] 2\n[[ 1  4]\n [ 9 16]]\n[[ 7 10]\n [15 22]]`,
        },
        {
          kind: 'quiz',
          id: 'pg-05-q1',
          prompt: r`With <c>A = np.array([[1, 2], [3, 4]])</c> and <c>v = np.array([2, 1])</c>, what does <c>print(A @ v)</c> print?`,
          options: [
            { id: 'a', label: r`<c>[ 4 10]</c>` },
            { id: 'b', label: r`<c>[5 8]</c>`, trapExplanation: r`That is <c>v @ A</c>, combining the rows of <c>A</c>; <c>A @ v</c> takes the dot product of each row with <c>v</c>.` },
            { id: 'c', label: r`<c>[2 4]</c>`, trapExplanation: r`<c>@</c> is the full matrix–vector product, not a product of diagonal entries.` },
          ],
          correctOptionId: 'a',
          explanation: r`Row 1: 1·2 + 2·1 = 4. Row 2: 3·2 + 4·1 = 10.`,
        },
      ],
    },
    {
      title: 'Shapes in products',
      covers: ['2', '6', 'x1', 'x4', 'x6'],
      blocks: [
        {
          kind: 'text',
          text: r`<c>(m, n) @ (n, p)</c> has shape <c>(m, p)</c>: the inner sizes must agree and disappear. A 1-D array of length <c>n</c> acts as a column on the right and as a row on the left, and its dimension disappears too: <c>(m, n) @ (n,)</c> is <c>(m,)</c>. A mismatch raises <c>ValueError</c>. Checking shapes is the fastest way to debug linear-algebra code.`,
        },
        {
          kind: 'code',
          code: `X = np.ones((100, 3))   # 100 examples, 3 features\nw = np.zeros(3)\nprint((X @ w).shape, (X.T @ X).shape)`,
          output: `(100,) (3, 3)`,
        },
        {
          kind: 'quiz',
          id: 'pg-05-q2',
          prompt: r`<c>A</c> has shape <c>(3, 2)</c> and <c>B</c> shape <c>(2, 5)</c>. What is <c>(A @ B).shape</c>?`,
          options: [
            { id: 'a', label: r`<c>(3, 5)</c>` },
            { id: 'b', label: r`<c>(2, 2)</c>`, trapExplanation: r`The inner sizes (2 and 2) cancel; the outer ones remain.` },
            { id: 'c', label: r`<c>ValueError</c>`, trapExplanation: r`The inner sizes agree (2 and 2), so the product is defined.` },
          ],
          correctOptionId: 'a',
          explanation: r`<c>(3, 2) @ (2, 5)</c> → <c>(3, 5)</c>.`,
        },
      ],
    },
    {
      title: 'Solving, inverting, measuring',
      covers: ['4', '5', 'x3', 'x5'],
      blocks: [
        {
          kind: 'text',
          text: r`The module <c>np.linalg</c> has the standard tools: <c>solve(A, b)</c> for $Ax = b$, <c>inv(A)</c>, <c>det(A)</c>, <c>norm(v)</c> (the Euclidean length), <c>eigh(S)</c> for eigenvalues and eigenvectors of a symmetric matrix. Prefer <c>solve(A, b)</c> to <c>inv(A) @ b</c>: it is faster and more accurate. Results are floats, and floats carry rounding errors, so compare them with <c>np.allclose</c>, not <c>==</c>.`,
        },
        {
          kind: 'code',
          code: `A = np.array([[2, 1], [1, 3]])\nb = np.array([3, 5])\nx = np.linalg.solve(A, b)\nprint(x, np.allclose(A @ x, b), np.linalg.norm([3, 4]))`,
          output: `[0.8 1.4] True 5.0`,
        },
        {
          kind: 'quiz',
          id: 'pg-05-q3',
          prompt: r`What does <c>print(np.linalg.norm(np.array([6, 8])))</c> print?`,
          options: [
            { id: 'a', label: r`<c>10.0</c>` },
            { id: 'b', label: r`<c>100</c>`, trapExplanation: r`The norm is the square root of the sum of squares: $\sqrt{100}$.` },
            { id: 'c', label: r`<c>14</c>`, trapExplanation: r`That is the sum of absolute values (the 1-norm); <c>norm</c> defaults to the Euclidean 2-norm.` },
          ],
          correctOptionId: 'a',
          explanation: r`$\sqrt{36 + 64} = 10$, printed as a float.`,
        },
      ],
    },
    {
      title: 'Data-science patterns',
      blocks: [
        {
          kind: 'code',
          code: `# Least squares: the normal equations, or lstsq directly\nw = np.linalg.solve(X.T @ X, X.T @ y)\nw, *_ = np.linalg.lstsq(X, y, rcond=None)\n\n# Covariance and PCA\nXc = X - X.mean(axis=0)\nS = Xc.T @ Xc / (len(X) - 1)\nvalues, vectors = np.linalg.eigh(S)   # ascending eigenvalues\npc1 = vectors[:, -1]                  # top principal direction`,
          caption: r`Every formula from the Linear Algebra and Statistics modules is one or two lines of NumPy.`,
        },
        {
          kind: 'box',
          variant: 'pitfall',
          title: 'Rows are examples',
          text: r`By convention a data matrix <c>X</c> has one row per example and one column per feature. Then <c>X.mean(axis=0)</c> gives feature means and <c>X.T @ X</c> is features × features. Mixing up the orientation gives shapes like <c>(100, 100)</c> where you expected <c>(3, 3)</c>.`,
        },
      ],
    },
    {
      title: 'Summary',
      blocks: [
        {
          kind: 'text',
          text: r`• <c>*</c> is element-wise; <c>@</c> is the matrix product; <c>u @ v</c> is a dot product.

• <c>(m, n) @ (n, p)</c> → <c>(m, p)</c>; a mismatch raises <c>ValueError</c>.

• <c>np.linalg.solve</c>, <c>norm</c>, <c>det</c>, <c>eigh</c>, <c>lstsq</c>; prefer <c>solve</c> to <c>inv</c>.

• Floats: compare with <c>np.allclose</c>. Rows are examples, columns are features.`,
        },
      ],
    },
  ],
  extra,
  questions: practice,
});
