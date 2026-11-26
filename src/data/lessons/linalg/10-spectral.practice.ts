import type { QuestionTemplate, Rng } from '../../../types.ts';
import { r } from '../define.ts';
import { add, allDistinct, coef, dot, mv, outer, paren, pm, shuffle, signed, times, vec } from '../gen.ts';
import { charPoly } from './07-eigen.practice.ts';

/** A factor written before another number: 1 -> "", -1 -> "-", 2 -> "2 \cdot ". */
const times2 = (k: number) => (k === 1 ? '' : k === -1 ? '-' : `${k} \\cdot `);

const VS = [[1, 1], [1, -1], [1, 2], [2, 1], [1, -2], [2, -1], [1, 3], [3, 1], [1, -3], [3, -1]];

/**
 * A symmetric matrix A = l2·I + k·v·vᵀ: eigenvalue l1 = l2 + k·|v|² along v, l2 along w = (−v₂, v₁).
 * Integer entries, and the eigenvectors are small integer vectors.
 */
export function symFrom(g: Rng, vs = VS, ks = [-2, -1, 1, 2], l2s = [-3, -2, -1, 0, 1, 2, 3, 4]) {
  const v = g.pick(vs);
  const k = g.pick(ks);
  const l2 = g.pick(l2s);
  const n = dot(v, v);
  const A = [[l2 + k * v[0] * v[0], k * v[0] * v[1]], [k * v[0] * v[1], l2 + k * v[1] * v[1]]];
  return { A, v, w: [-v[1], v[0]], k, n, l1: l2 + k * n, l2 };
}

export const CLASSES = ['Positive definite', 'Positive semidefinite, but not definite', 'Negative definite', 'Indefinite'];
const CONDITION = ['all eigenvalues $> 0$', 'all eigenvalues $\\ge 0$ with at least one equal to 0', 'all eigenvalues $< 0$', 'eigenvalues of both signs'];
export const classOf = (ls: number[]) =>
  ls.every((l) => l > 0) ? 0 : ls.every((l) => l >= 0) ? 1 : ls.every((l) => l < 0) ? 2 : ls.some((l) => l > 0) && ls.some((l) => l < 0) ? 3 : -1;

/** Options a–d for "classify this matrix": a is the true class, b–d the other three in random order. */
export function classOptions(g: Rng, cls: number, ls: number[]) {
  const others = shuffle(g, [0, 1, 2, 3].filter((c) => c !== cls));
  const order = [cls, ...others];
  const shown = ls.join(', ');
  return {
    order,
    options: order.map((c, i) => ({
      id: 'abcd'[i],
      label: CLASSES[c],
      ...(i === 0 ? {} : { trapExplanation: `${CLASSES[c]} needs ${CONDITION[c]}; here the eigenvalues are $${shown}$.` }),
    })),
  };
}

export const practice: QuestionTemplate[] = [
  {
    id: 'la-10-1',
    difficulty: 1,
    keyConceptTag: 'Evaluating a quadratic form',
    correctOptionId: 'a',
    generate: (g) => {
      const { a, b, d, x } = g.until(
        () => ({ a: g.int(-4, 5), b: g.nonzero(-3, 3), d: g.int(-4, 5), x: [g.nonzero(-3, 3), g.nonzero(-3, 3)] }),
        ({ a, b, d, x: [x1, x2] }) =>
          allDistinct([a * x1 * x1 + 2 * b * x1 * x2 + d * x2 * x2, a * x1 * x1 + b * x1 * x2 + d * x2 * x2, a * x1 * x1 + d * x2 * x2, a * x1 + b * x2 + b * x1 + d * x2]),
      );
      const A = [[a, b], [b, d]];
      const [x1, x2] = x;
      const Q = a * x1 * x1 + 2 * b * x1 * x2 + d * x2 * x2;
      const half = a * x1 * x1 + b * x1 * x2 + d * x2 * x2;
      const noCross = a * x1 * x1 + d * x2 * x2;
      const Ax = mv(A, x);
      const sumAx = Ax[0] + Ax[1];
      return {
        params: { A, x },
        promptText: r`Compute $\mathbf{x}^TA\mathbf{x}$ for $A = ${pm(A)}$ and $\mathbf{x} = ${vec(x)}$.`,
        options: [
          { id: 'a', label: `$${Q}$`, value: Q },
          { id: 'b', label: `$${half}$`, value: half, trapExplanation: r`The off-diagonal entry ${b} appears twice in $A$, so the cross term is $2\cdot${paren(b)}\,x_1x_2$.` },
          { id: 'c', label: `$${noCross}$`, value: noCross, trapExplanation: r`The cross term $2b\,x_1x_2 = ${2 * b * x1 * x2}$ was dropped. Only a diagonal $A$ has no cross term.` },
          { id: 'd', label: `$${sumAx}$`, value: sumAx, trapExplanation: r`That adds up the entries of $A\mathbf{x} = ${vec(Ax)}$. The quadratic form is the dot product $\mathbf{x}\cdot(A\mathbf{x})$.` },
        ],
        stepByStepSolution: [
          r`$\mathbf{x}^TA\mathbf{x} = ax_1^2 + 2bx_1x_2 + dx_2^2$ with $a = ${a}$, $b = ${b}$, $d = ${d}$.`,
          r`$= ${a}\cdot${x1 * x1} + 2\cdot${paren(b)}\cdot${paren(x1)}\cdot${paren(x2)} + ${paren(d)}\cdot${x2 * x2}$.`,
          r`$= ${a * x1 * x1} ${signed(2 * b * x1 * x2)} ${signed(d * x2 * x2)} = ${Q}$. Check: $A\mathbf{x} = ${vec(Ax)}$ and $\mathbf{x}\cdot A\mathbf{x} = ${dot(x, Ax)}$.`,
        ],
      };
    },
  },
  {
    id: 'la-10-2',
    difficulty: 1,
    keyConceptTag: 'Eigenvectors of a symmetric matrix are orthogonal',
    correctOptionId: 'a',
    generate: (g) => {
      const { A, v, w, l1, l2 } = g.until(
        () => symFrom(g, VS.filter(([p, q]) => Math.abs(p) !== Math.abs(q))),
        ({ A }) => A.flat().every((x) => Math.abs(x) <= 12),
      );
      const m = g.pick([1, -1, 2]);
      const ans = times(m, w);
      const sum = add(v, w);
      return {
        params: { A, v, a: ans, b: [v[1], v[0]], c: sum, d: [v[0], -v[1]] },
        promptText: r`The symmetric matrix $A = ${pm(A)}$ has the eigenvector $${vec(v)}$ with eigenvalue $${l1}$. Which vector is an eigenvector for its other eigenvalue?`,
        options: [
          { id: 'a', label: `$${vec(ans)}$` },
          { id: 'b', label: `$${vec([v[1], v[0]])}$`, trapExplanation: r`$${vec([v[1], v[0]])}\cdot${vec(v)} = ${2 * v[0] * v[1]} \ne 0$. For a symmetric matrix the second eigenvector is perpendicular to the first.` },
          { id: 'c', label: `$${vec(sum)}$`, trapExplanation: r`A sum of eigenvectors for different eigenvalues is not an eigenvector: $A${vec(sum)} = ${vec(mv(A, sum))}$.` },
          { id: 'd', label: `$${vec([v[0], -v[1]])}$`, trapExplanation: r`Flipping one sign does not give a perpendicular vector here: the dot product with $${vec(v)}$ is $${v[0] * v[0] - v[1] * v[1]}$.` },
        ],
        stepByStepSolution: [
          r`$A$ is symmetric, so eigenvectors for different eigenvalues are perpendicular.`,
          r`In the plane, the vectors perpendicular to $${vec(v)}$ are the multiples of $${vec(w)}$.`,
          r`Check: $A${vec(ans)} = ${vec(mv(A, ans))} = ${l2}\cdot${vec(ans)}$, eigenvalue $${l2}$; and $${l1} + ${paren(l2)} = ${A[0][0] + A[1][1]} = \operatorname{tr}A$.`,
        ],
      };
    },
  },
  {
    id: 'la-10-3',
    difficulty: 2,
    keyConceptTag: 'Definiteness from eigenvalues',
    correctOptionId: 'a',
    generate: (g) => {
      const target = g.int(0, 3);
      const { A, l1, l2 } = g.until(
        () => symFrom(g),
        ({ A, l1, l2 }) => classOf([l1, l2]) === target && A.flat().every((x) => Math.abs(x) <= 12),
      );
      const ls = [l1, l2].sort((p, q) => q - p);
      const { order, options } = classOptions(g, target, ls);
      const t = A[0][0] + A[1][1];
      const d = A[0][0] * A[1][1] - A[0][1] * A[1][0];
      return {
        params: { A, order },
        promptText: r`Classify the symmetric matrix $A = ${pm(A)}$.`,
        options,
        stepByStepSolution: [
          r`$\operatorname{tr}A = ${t}$ and $\det A = ${d}$, so the eigenvalues solve $${charPoly(t, d)} = 0$.`,
          r`They are $\lambda = ${ls[0]}$ and $\lambda = ${ls[1]}$ (sum ${t}, product ${d}).`,
          r`${CLASSES[target]}: ${CONDITION[target]}.`,
        ],
      };
    },
  },
  {
    id: 'la-10-4',
    difficulty: 2,
    keyConceptTag: 'Building A = QΛQᵀ',
    correctOptionId: 'a',
    generate: (g) => {
      const { A, v, w, k, n, l1, l2 } = g.until(
        () => symFrom(g, VS.slice(0, 6)),
        ({ A, l1, l2 }) => l1 !== 0 && l2 !== 0 && A.flat().every((x) => Math.abs(x) <= 12),
      );
      const raw = add(outer(v, v).flat().map((x) => l1 * x), outer(w, w).flat().map((x) => l2 * x));
      const swapped = [[l1 - k * v[0] * v[0], -k * v[0] * v[1]], [-k * v[0] * v[1], l1 - k * v[1] * v[1]]];
      const asM = (f: number[]) => [f.slice(0, 2), f.slice(2)];
      return {
        params: { v, w, l1, l2 },
        promptText: r`A symmetric $2\times2$ matrix has eigenvalue $${l1}$ with eigenvector $${vec(v)}$ and eigenvalue $${l2}$ with eigenvector $${vec(w)}$. What is $A$?`,
        options: [
          { id: 'a', label: `$${pm(A)}$`, value: A.flat() },
          { id: 'b', label: `$${pm([[l1, 0], [0, l2]])}$`, value: [l1, 0, 0, l2], trapExplanation: r`That is $\Lambda$, which equals $A$ only when the eigenvectors are the coordinate axes.` },
          { id: 'c', label: `$${pm(asM(raw))}$`, value: raw, trapExplanation: r`The $\mathbf{q}_i$ in $\sum\lambda_i\mathbf{q}_i\mathbf{q}_i^T$ are unit vectors: divide by $\|${vec(v)}\|^2 = ${n}$.` },
          { id: 'd', label: `$${pm(swapped)}$`, value: swapped.flat(), trapExplanation: r`This matrix has the eigenvalues the other way round: it sends $${vec(v)}$ to $${l2}\cdot${vec(v)}$.` },
        ],
        stepByStepSolution: [
          r`$A = \lambda_1\mathbf{q}_1\mathbf{q}_1^T + \lambda_2\mathbf{q}_2\mathbf{q}_2^T$ with $\mathbf{q}_1 = \tfrac{1}{\sqrt{${n}}}${vec(v)}$, $\mathbf{q}_2 = \tfrac{1}{\sqrt{${n}}}${vec(w)}$.`,
          r`$A = \tfrac{1}{${n}}\Big(${l1}${pm(outer(v, v))} ${l2 < 0 ? '-' : '+'} ${Math.abs(l2)}${pm(outer(w, w))}\Big) = \tfrac{1}{${n}}${pm(asM(raw))}$.`,
          r`$A = ${pm(A)}$. Check: $A${vec(v)} = ${vec(mv(A, v))} = ${l1}\cdot${vec(v)}$. ✓`,
        ],
      };
    },
  },
  {
    id: 'la-10-5',
    difficulty: 3,
    keyConceptTag: 'Powers through the eigenvectors',
    correctOptionId: 'a',
    generate: (g) => {
      const { A, v, w, l1, l2, m, al, be } = g.until(
        () => {
          const s = symFrom(g, VS.slice(0, 6), [-1, 1], [-3, -2, -1, 1, 2, 3]);
          const big = Math.max(Math.abs(s.l1), Math.abs(s.l2));
          const m = big >= 3 ? 2 : g.int(3, 4);
          return { ...s, m, al: big >= 3 ? g.pick([-1, 1]) : g.nonzero(-2, 2), be: big >= 3 ? g.pick([-1, 1]) : g.nonzero(-2, 2) };
        },
        ({ A, v, w, l1, l2, m, al, be }) => {
          if (l1 === 0 || Math.abs(l1) > 3 || l1 === l2) return false;
          const x = add(times(al, v), times(be, w));
          const ans = add(times(al * l1 ** m, v), times(be * l2 ** m, w));
          const once = add(times(al * l1, v), times(be * l2, w));
          const swap = add(times(al * l2 ** m, v), times(be * l1 ** m, w));
          return A.flat().every((y) => Math.abs(y) <= 9) && allDistinct([ans, once, swap, times(l1 ** m, x)]);
        },
      );
      const x = add(times(al, v), times(be, w));
      const ans = add(times(al * l1 ** m, v), times(be * l2 ** m, w));
      const once = add(times(al * l1, v), times(be * l2, w));
      const swap = add(times(al * l2 ** m, v), times(be * l1 ** m, w));
      return {
        params: { A, x, m },
        promptText: r`$A = ${pm(A)}$ has the eigenvectors $${vec(v)}$ and $${vec(w)}$. Compute $A^{${m}}\mathbf{x}$ for $\mathbf{x} = ${vec(x)}$.`,
        options: [
          { id: 'a', label: `$${vec(ans)}$`, value: ans },
          { id: 'b', label: `$${vec(once)}$`, value: once, trapExplanation: r`That is $A\mathbf{x}$: each eigenvalue was applied once instead of ${m} times.` },
          { id: 'c', label: `$${vec(swap)}$`, value: swap, trapExplanation: r`The eigenvalues are attached to the wrong eigenvectors: $${vec(v)}$ goes with $${l1}$.` },
          { id: 'd', label: `$${vec(times(l1 ** m, x))}$`, value: times(l1 ** m, x), trapExplanation: r`$A^{${m}}\mathbf{x} = ${l1}^{${m}}\mathbf{x}$ only if $\mathbf{x}$ were an eigenvector. Split $\mathbf{x}$ along both eigenvectors first.` },
        ],
        stepByStepSolution: [
          r`$A${vec(v)} = ${vec(mv(A, v))}$ gives $\lambda_1 = ${l1}$; $A${vec(w)} = ${vec(mv(A, w))}$ gives $\lambda_2 = ${l2}$.`,
          r`$\mathbf{x} = ${coef(al)}${vec(v)} ${be < 0 ? '-' : '+'} ${coef(Math.abs(be))}${vec(w)}$ (the coefficients are $\frac{\mathbf{x}\cdot\mathbf{v}}{\mathbf{v}\cdot\mathbf{v}}$, as the eigenvectors are perpendicular).`,
          r`$A^{${m}}\mathbf{x} = ${times2(al)}${paren(l1)}^{${m}}${vec(v)} ${be < 0 ? '-' : '+'} ${times2(Math.abs(be))}${paren(l2)}^{${m}}${vec(w)} = ${vec(ans)}$.`,
        ],
      };
    },
  },
  {
    id: 'la-10-6',
    difficulty: 3,
    keyConceptTag: 'Positive definite 2×2 test',
    correctOptionId: 'a',
    generate: (g) => {
      const { a, b } = g.until(
        () => ({ a: g.int(1, 4), b: g.nonzero(-6, 6) }),
        ({ a, b }) => (b * b) % a === 0 && (b * b) / a >= 2 && Math.abs(b) !== a,
      );
      const m = (b * b) / a;
      return {
        params: { a, b },
        promptText: r`What is the smallest integer $t$ for which $A = \begin{pmatrix} ${a} & ${b} \\ ${b} & t \end{pmatrix}$ is positive definite?`,
        options: [
          { id: 'a', label: `$${m + 1}$`, value: m + 1 },
          { id: 'b', label: `$${m}$`, value: m, trapExplanation: r`At $t = ${m}$, $\det A = ${a}\cdot${m} - ${b * b} = 0$: one eigenvalue is 0, so $A$ is only semidefinite.` },
          { id: 'c', label: '$1$', value: 1, trapExplanation: r`A positive diagonal is not enough: at $t = 1$, $\det A = ${a} - ${b * b} < 0$ and $A$ is indefinite.` },
          { id: 'd', label: `$${Math.abs(b) + 1}$`, value: Math.abs(b) + 1, trapExplanation: r`The condition is $at > b^2$, i.e. $t > \frac{${b * b}}{${a}} = ${m}$, not $t > |b|$.` },
        ],
        stepByStepSolution: [
          r`Positive definite ⇔ $a > 0$ and $\det A > 0$. Here $a = ${a} > 0$.`,
          r`$\det A = ${a}t - ${b * b} > 0$ ⇔ $t > ${m}$.`,
          r`The smallest integer is $${m + 1}$; at $t = ${m}$ the determinant is 0 and $A$ is only semidefinite.`,
        ],
      };
    },
  },
];
