import type { QuestionTemplate, Rng } from '../../../types.ts';
import { r } from '../define.ts';
import { allDistinct, lin, mv, paren, pm, shuffle, sub, times, vec } from '../gen.ts';

export const KINDS = ['A local minimum', 'A local maximum', 'A saddle point', 'The test is inconclusive'];
const NEEDS = ['$\\det H > 0$ and $f_{xx} > 0$', '$\\det H > 0$ and $f_{xx} < 0$', '$\\det H < 0$', '$\\det H = 0$'];
/** 0 minimum, 1 maximum, 2 saddle, 3 inconclusive, from f_xx and det H of a 2×2 Hessian. */
export const kindOf = (fxx: number, det: number) => (det > 0 ? (fxx > 0 ? 0 : 1) : det < 0 ? 2 : 3);

/** Options a–d for "classify the critical point": a is the true kind, b–d the others in random order. */
export function kindOptions(g: Rng, kind: number, fxx: number, det: number) {
  const order = [kind, ...shuffle(g, [0, 1, 2, 3].filter((k) => k !== kind))];
  return {
    order,
    options: order.map((k, i) => ({
      id: 'abcd'[i],
      label: KINDS[k],
      ...(i === 0 ? {} : { trapExplanation: `That needs ${NEEDS[k]}; here $f_{xx} = ${fxx}$ and $\\det H = ${det}$.` }),
    })),
  };
}

/** Symmetric positive definite 2×2 matrices with determinant 1 (integer inverses). */
const SPD = [[[2, 1], [1, 1]], [[1, 1], [1, 2]], [[5, 2], [2, 1]], [[1, 2], [2, 5]], [[2, -1], [-1, 1]], [[1, -1], [-1, 2]], [[5, -2], [-2, 1]], [[2, 3], [3, 5]], [[10, 3], [3, 1]]];

export const practice: QuestionTemplate[] = [
  {
    id: 'ca-07-1',
    difficulty: 1,
    keyConceptTag: 'Jacobian of a linear map',
    correctOptionId: 'a',
    generate: (g) => {
      const { a, b, c, d } = g.until(
        () => ({ a: g.nonzero(-5, 5), b: g.nonzero(-5, 5), c: g.nonzero(-5, 5), d: g.nonzero(-5, 5) }),
        ({ a, b, c, d }) => allDistinct([[a, b, c, d], [a, c, b, d], [a, 0, 0, d], [b, a, d, c]]),
      );
      const M = [[a, b], [c, d]];
      return {
        params: { M },
        promptText: r`$F(x, y) = \big(${lin([a, b], ['x', 'y'])},\ ${lin([c, d], ['x', 'y'])}\big)$. What is its Jacobian?`,
        options: [
          { id: 'a', label: `$${pm(M)}$`, value: [a, b, c, d] },
          { id: 'b', label: `$${pm([[a, c], [b, d]])}$`, value: [a, c, b, d], trapExplanation: r`That is the transpose. Row $i$ holds the partial derivatives of the $i$-th component.` },
          { id: 'c', label: `$${pm([[a, 0], [0, d]])}$`, value: [a, 0, 0, d], trapExplanation: r`The first component depends on $y$ too: $\frac{\partial F_1}{\partial y} = ${b}$.` },
          { id: 'd', label: `$${pm([[b, a], [d, c]])}$`, value: [b, a, d, c], trapExplanation: r`Columns go in the order of the variables: first $\frac{\partial}{\partial x}$, then $\frac{\partial}{\partial y}$.` },
        ],
        stepByStepSolution: [
          r`Row 1: $\nabla(${lin([a, b], ['x', 'y'])}) = ${vec([a, b])}$.`,
          r`Row 2: $\nabla(${lin([c, d], ['x', 'y'])}) = ${vec([c, d])}$.`,
          r`$J_F = ${pm(M)}$: a linear map is its own Jacobian, at every point.`,
        ],
      };
    },
  },
  {
    id: 'ca-07-2',
    difficulty: 1,
    keyConceptTag: 'Hessian of a quadratic',
    correctOptionId: 'a',
    generate: (g) => {
      const { a, b, c } = g.until(
        () => ({ a: g.nonzero(-4, 4), b: 2 * g.nonzero(-3, 3), c: g.nonzero(-4, 4) }),
        ({ a, b, c }) => allDistinct([[2 * a, b, b, 2 * c], [a, b, b, c], [2 * a, 2 * b, 2 * b, 2 * c], [a, b / 2, b / 2, c]]),
      );
      return {
        params: { k: [a, b, c] },
        promptText: r`What is the Hessian of $f(x, y) = ${lin([a, b, c], ['x^2', 'xy', 'y^2'])}$?`,
        options: [
          { id: 'a', label: `$${pm([[2 * a, b], [b, 2 * c]])}$`, value: [2 * a, b, b, 2 * c] },
          { id: 'b', label: `$${pm([[a, b], [b, c]])}$`, value: [a, b, b, c], trapExplanation: r`$\frac{\partial^2}{\partial x^2}(${lin([a], ['x^2'])}) = ${2 * a}$: the diagonal entries double.` },
          { id: 'c', label: `$${pm([[2 * a, 2 * b], [2 * b, 2 * c]])}$`, value: [2 * a, 2 * b, 2 * b, 2 * c], trapExplanation: r`$\frac{\partial^2}{\partial x\,\partial y}(${lin([b], ['xy'])}) = ${b}$: the cross term is not doubled.` },
          { id: 'd', label: `$${pm([[a, b / 2], [b / 2, c]])}$`, value: [a, b / 2, b / 2, c], trapExplanation: r`That is the matrix $M$ with $f = \mathbf{x}^TM\mathbf{x}$. The Hessian is $2M$.` },
        ],
        stepByStepSolution: [
          r`$f_x = ${lin([2 * a, b], ['x', 'y'])}$, $f_y = ${lin([b, 2 * c], ['x', 'y'])}$.`,
          r`$f_{xx} = ${2 * a}$, $f_{xy} = f_{yx} = ${b}$, $f_{yy} = ${2 * c}$.`,
          r`$H = ${pm([[2 * a, b], [b, 2 * c]])}$, constant because $f$ is quadratic.`,
        ],
      };
    },
  },
  {
    id: 'ca-07-3',
    difficulty: 2,
    keyConceptTag: 'Jacobian of a nonlinear map',
    correctOptionId: 'a',
    generate: (g) => {
      const { p, q } = g.until(
        () => ({ p: g.nonzero(-2, 2), q: g.nonzero(-2, 2) }),
        ({ p, q }) => allDistinct([[2 * p * q, p * p, 1, 3 * q * q], [2 * p * q, 1, p * p, 3 * q * q], [2 * p * q, 0, 0, 3 * q * q], [2 * p * q, q * q, 1, 3 * p * p]]),
      );
      const J = [[2 * p * q, p * p], [1, 3 * q * q]];
      return {
        params: { P: [p, q] },
        promptText: r`$F(x, y) = (x^2y,\ x + y^3)$. What is $J_F(${p}, ${q})$?`,
        options: [
          { id: 'a', label: `$${pm(J)}$`, value: J.flat() },
          { id: 'b', label: `$${pm([[2 * p * q, 1], [p * p, 3 * q * q]])}$`, value: [2 * p * q, 1, p * p, 3 * q * q], trapExplanation: r`That is the transpose: the rows must be the gradients of $x^2y$ and of $x + y^3$.` },
          { id: 'c', label: `$${pm([[2 * p * q, 0], [0, 3 * q * q]])}$`, value: [2 * p * q, 0, 0, 3 * q * q], trapExplanation: r`Every component is differentiated with respect to every variable: $\frac{\partial(x^2y)}{\partial y} = x^2$ and $\frac{\partial(x + y^3)}{\partial x} = 1$.` },
          { id: 'd', label: `$${pm([[2 * p * q, q * q], [1, 3 * p * p]])}$`, value: [2 * p * q, q * q, 1, 3 * p * p], trapExplanation: r`That evaluates at $(${q}, ${p})$: $x = ${p}$ and $y = ${q}$.` },
        ],
        stepByStepSolution: [
          r`$J_F = \begin{pmatrix} 2xy & x^2 \\ 1 & 3y^2 \end{pmatrix}$.`,
          r`At $x = ${p}$, $y = ${q}$: $2xy = ${2 * p * q}$, $x^2 = ${p * p}$, $3y^2 = ${3 * q * q}$.`,
          r`$J_F(${p}, ${q}) = ${pm(J)}$.`,
        ],
      };
    },
  },
  {
    id: 'ca-07-4',
    difficulty: 2,
    keyConceptTag: 'The second-derivative test',
    correctOptionId: 'a',
    generate: (g) => {
      const target = g.int(0, 3);
      const { a, b, c } = g.until(
        () => ({ a: g.nonzero(-3, 3), b: g.nonzero(-4, 4), c: g.nonzero(-3, 3) }),
        ({ a, b, c }) => kindOf(2 * a, 4 * a * c - b * b) === target,
      );
      const det = 4 * a * c - b * b;
      const { order, options } = kindOptions(g, target, 2 * a, det);
      return {
        params: { k: [a, b, c], order },
        promptText: r`$f(x, y) = ${lin([a, b, c], ['x^2', 'xy', 'y^2'])}$ has a critical point at the origin. What does the second-derivative test say about it?`,
        options,
        stepByStepSolution: [
          r`$H = ${pm([[2 * a, b], [b, 2 * c]])}$.`,
          r`$\det H = ${2 * a}\cdot${paren(2 * c)} - ${paren(b)}^2 = ${det}$ and $f_{xx} = ${2 * a}$.`,
          r`${KINDS[target]}: ${NEEDS[target]}.`,
        ],
      };
    },
  },
  {
    id: 'ca-07-5',
    difficulty: 3,
    keyConceptTag: "Newton's method on a quadratic",
    correctOptionId: 'a',
    generate: (g) => {
      const { A, xs, x0 } = g.until(
        () => ({ A: g.pick(SPD), xs: [g.int(-3, 3), g.int(-3, 3)], x0: [g.int(-2, 2), g.int(-2, 2)] }),
        ({ A, xs, x0 }) => {
          const b = mv(A, xs);
          const gd = sub(x0, sub(mv(A, x0), b));
          return b.every((v) => Math.abs(v) <= 12) && allDistinct([xs, gd, times(-1, xs), b, x0]);
        },
      );
      const b = mv(A, xs);
      const gr = sub(mv(A, x0), b);
      const gd = sub(x0, gr);
      return {
        params: { A, b, x0 },
        promptText: r`$f(\mathbf{x}) = \tfrac12\mathbf{x}^TA\mathbf{x} - \mathbf{b}^T\mathbf{x}$ with $A = ${pm(A)}$ and $\mathbf{b} = ${vec(b)}$. Where does one Newton step from $\mathbf{x}_0 = ${vec(x0)}$ land?`,
        options: [
          { id: 'a', label: `$${vec(xs)}$`, value: xs },
          { id: 'b', label: `$${vec(gd)}$`, value: gd, trapExplanation: r`That is a gradient step with $\eta = 1$: $\mathbf{x}_0 - \nabla f$. Newton multiplies the gradient by $H^{-1} = A^{-1}$ first.` },
          { id: 'c', label: `$${vec(times(-1, xs))}$`, value: times(-1, xs), trapExplanation: r`Sign slip: the step is $\mathbf{x}_0 - H^{-1}\nabla f$, which lands on $A^{-1}\mathbf{b}$.` },
          { id: 'd', label: `$${vec(b)}$`, value: b, trapExplanation: r`That is $\mathbf{b}$ itself; the minimum solves $A\mathbf{x} = \mathbf{b}$, so it is $A^{-1}\mathbf{b}$.` },
        ],
        stepByStepSolution: [
          r`$\nabla f = A\mathbf{x} - \mathbf{b}$ and $H = A$. At $\mathbf{x}_0$: $\nabla f = ${vec(mv(A, x0))} - ${vec(b)} = ${vec(gr)}$.`,
          r`$\mathbf{x}_1 = \mathbf{x}_0 - A^{-1}\nabla f = \mathbf{x}_0 - A^{-1}(A\mathbf{x}_0 - \mathbf{b}) = A^{-1}\mathbf{b}$.`,
          r`Solve $A\mathbf{x} = ${vec(b)}$: $\mathbf{x}_1 = ${vec(xs)}$. Check: $A${vec(xs)} = ${vec(mv(A, xs))}$. ✓ For a quadratic, one Newton step reaches the minimum.`,
        ],
      };
    },
  },
  {
    id: 'ca-07-6',
    difficulty: 3,
    keyConceptTag: 'Mixed partial derivatives',
    correctOptionId: 'a',
    generate: (g) => {
      const { p, q } = g.until(
        () => ({ p: g.nonzero(-2, 3), q: g.nonzero(-3, 3) }),
        ({ p, q }) => allDistinct([6 * p * p * q, 6 * p * q * q, 2 * p ** 3, 3 * p * p * q * q]),
      );
      return {
        params: { P: [p, q] },
        promptText: r`$f(x, y) = x^3y^2$. What is the Hessian entry $\dfrac{\partial^2 f}{\partial x\,\partial y}$ at $(${p}, ${q})$?`,
        options: [
          { id: 'a', label: `$${6 * p * p * q}$`, value: 6 * p * p * q },
          { id: 'b', label: `$${6 * p * q * q}$`, value: 6 * p * q * q, trapExplanation: r`That is $f_{xx} = 6xy^2$, differentiating twice in $x$.` },
          { id: 'c', label: `$${2 * p ** 3}$`, value: 2 * p ** 3, trapExplanation: r`That is $f_{yy} = 2x^3$, differentiating twice in $y$.` },
          { id: 'd', label: `$${3 * p * p * q * q}$`, value: 3 * p * p * q * q, trapExplanation: r`That is $f_x = 3x^2y^2$, only one derivative. Differentiate it once more in $y$.` },
        ],
        stepByStepSolution: [
          r`$f_x = 3x^2y^2$.`,
          r`$f_{xy} = \frac{\partial}{\partial y}(3x^2y^2) = 6x^2y$ (and $f_{yx}$ gives the same, as Schwarz promises).`,
          r`At $(${p}, ${q})$: $6\cdot${p * p}\cdot${paren(q)} = ${6 * p * p * q}$.`,
        ],
      };
    },
  },
];
