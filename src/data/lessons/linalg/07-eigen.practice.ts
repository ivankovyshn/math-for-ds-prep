import type { QuestionTemplate, Rng } from '../../../types.ts';
import { r } from '../define.ts';
import { type Mat, allDistinct, det2, frac, gcd, mm, mv, paren, pm, shuffle, signed, vec } from '../gen.ts';
import { adj2, unimodular } from './05-inverse.practice.ts';

const sorted = (xs: number[]) => [...xs].sort((a, b) => a - b);
const pair = ([x, y]: number[]) => (x === y ? r`$${x}$ (twice)` : r`$${x}$ and $${y}$`);

/** A matrix with integer eigenvalues l1, l2 and integer eigenvectors: A = P diag(l1, l2) P⁻¹ with det P = 1. */
export function withEigen(g: Rng, l1: number, l2: number) {
  const P = unimodular(g, -2, 3);
  const A = mm(mm(P, [[l1, 0], [0, l2]]), adj2(P));
  const prim = (v: number[]) => {
    const d = gcd(v[0], v[1]) || 1;
    const s = v[0] < 0 || (v[0] === 0 && v[1] < 0) ? -1 : 1;
    return v.map((x) => (s * x) / d);
  };
  return { A, v1: prim([P[0][0], P[1][0]]), v2: prim([P[0][1], P[1][1]]) };
}
/** "λ^2 - 7λ + 10" for the characteristic polynomial. */
export const charPoly = (t: number, d: number) => `\\lambda^2 ${t === 0 ? '' : `${t > 0 ? '-' : '+'} ${Math.abs(t) === 1 ? '' : Math.abs(t)}\\lambda `}${d === 0 ? '' : signed(d)}`.trim();

export const practice: QuestionTemplate[] = [
  {
    id: 'la-07-1',
    difficulty: 1,
    keyConceptTag: 'Eigenvalues of a triangular matrix',
    correctOptionId: 'a',
    generate: (g) => {
      const { p, q, s } = g.until(
        () => ({ p: g.int(-3, 6), q: g.nonzero(-5, 7), s: g.int(-3, 6) }),
        ({ p, q, s }) => p !== s && allDistinct([sorted([p, s]), sorted([p, q]), sorted([-p, -s]), sorted([s, q])]),
      );
      const A = [[p, q], [0, s]];
      return {
        params: { A },
        promptText: r`What are the eigenvalues of $A = ${pm(A)}$?`,
        options: [
          { id: 'a', label: pair(sorted([p, s])), value: sorted([p, s]) },
          { id: 'b', label: pair(sorted([p, q])), value: sorted([p, q]), trapExplanation: r`These are the entries of the first row. For a triangular matrix the eigenvalues sit on the <i>diagonal</i>.` },
          { id: 'c', label: pair(sorted([-p, -s])), value: sorted([-p, -s]), trapExplanation: r`$\det(A - \lambda I) = (${p} - \lambda)(${s} - \lambda)$ vanishes at $\lambda = ${p}$ and $${s}$, not at their negatives.` },
          { id: 'd', label: pair(sorted([s, q])), value: sorted([s, q]), trapExplanation: r`These are the entries of the second column. The off-diagonal ${q} does not affect the eigenvalues of a triangular matrix.` },
        ],
        stepByStepSolution: [
          r`$A - \lambda I = ${pm([[`${p} - \\lambda`, q], [0, `${s} - \\lambda`]] as unknown as Mat)}$ is triangular.`,
          r`Its determinant is the product of the diagonal: $(${p} - \lambda)(${s} - \lambda)$.`,
          r`Zero at $\lambda = ${p}$ and $\lambda = ${s}$.`,
        ],
      };
    },
  },
  {
    id: 'la-07-2',
    difficulty: 1,
    keyConceptTag: 'Eigenvalue from Av = λv',
    correctOptionId: 'a',
    generate: (g) => {
      const { a, b, sgn } = g.until(
        () => ({ a: g.int(1, 5), b: g.nonzero(-4, 4), sgn: g.pick([1, -1]) }),
        ({ a, b, sgn }) => allDistinct([a + sgn * b, a, a - sgn * b, b]) && a + sgn * b !== 0,
      );
      const A = [[a, b], [b, a]];
      const v = [1, sgn];
      const lam = a + sgn * b;
      const Av = mv(A, v);
      return {
        params: { A, v },
        promptText: r`$\mathbf{v} = ${vec(v)}$ is an eigenvector of $A = ${pm(A)}$. What is its eigenvalue?`,
        options: [
          { id: 'a', label: r`$${lam}$`, value: lam },
          { id: 'b', label: r`$${a}$`, value: a, trapExplanation: r`${a} is a diagonal entry. This matrix is not triangular, so the diagonal entries are not its eigenvalues. Compute $A\mathbf{v}$.` },
          { id: 'c', label: r`$${a - sgn * b}$`, value: a - sgn * b, trapExplanation: r`$${a - sgn * b}$ is the other eigenvalue of $A$, belonging to the direction $${vec([1, -sgn])}$. For $${vec(v)}$ compute $A\mathbf{v}$.` },
          { id: 'd', label: r`$${b}$`, value: b, trapExplanation: r`${b} is the off-diagonal entry, not an eigenvalue. The eigenvalue is the factor $\lambda$ in $A\mathbf{v} = \lambda\mathbf{v}$, here $A\mathbf{v} = ${vec(Av)}$.` },
        ],
        stepByStepSolution: [
          r`$A\mathbf{v} = (${a} ${signed(sgn * b)},\ ${b} ${signed(sgn * a)}) = ${vec(Av)}$.`,
          r`$${vec(Av)} = ${lam}\cdot${vec(v)}$.`,
          r`So $\lambda = ${lam}$.`,
        ],
      };
    },
  },
  {
    id: 'la-07-3',
    difficulty: 2,
    keyConceptTag: 'Characteristic equation',
    correctOptionId: 'a',
    generate: (g) => {
      const { A, ls } = g.until(
        () => {
          const ls = sorted([g.nonzero(-2, 6), g.nonzero(-2, 6)]);
          return { A: withEigen(g, ls[0], ls[1]).A, ls };
        },
        ({ A, ls }) =>
          ls[0] !== ls[1] && A[0][1] !== 0 && A[1][0] !== 0 && A.flat().every((x) => Math.abs(x) <= 9) &&
          allDistinct([ls, sorted([A[0][0], A[1][1]]), sorted([-ls[1], -ls[0]]), []]),
      );
      const t = A[0][0] + A[1][1];
      const d = det2(A);
      return {
        params: { A },
        promptText: r`Find the eigenvalues of $A = ${pm(A)}$.`,
        options: [
          { id: 'a', label: pair(ls), value: ls },
          { id: 'b', label: pair(sorted([A[0][0], A[1][1]])), value: sorted([A[0][0], A[1][1]]), trapExplanation: r`These are the diagonal entries, which are eigenvalues only for triangular matrices. Here the entries off the diagonal change them.` },
          { id: 'c', label: pair(sorted([-ls[1], -ls[0]])), value: sorted([-ls[1], -ls[0]]), trapExplanation: r`The roots of $${charPoly(t, d)}$ add up to $${t}$ (the trace). The signs were lost when factoring.` },
          { id: 'd', label: 'There are no real eigenvalues', value: [], trapExplanation: r`The discriminant is $${t * t} - 4\cdot ${paren(d)} = ${t * t - 4 * d} > 0$, so there are two real roots.` },
        ],
        stepByStepSolution: [
          r`$\operatorname{tr}A = ${t}$, $\det A = ${A[0][0]}\cdot ${paren(A[1][1])} - ${paren(A[0][1])}\cdot ${paren(A[1][0])} = ${d}$.`,
          r`$\det(A - \lambda I) = ${charPoly(t, d)} = (\lambda ${signed(-ls[0])})(\lambda ${signed(-ls[1])}) = 0$.`,
          r`$\lambda = ${ls[0]}$ and $\lambda = ${ls[1]}$; check: sum ${t} = trace, product ${d} = det.`,
        ],
      };
    },
  },
  {
    id: 'la-07-4',
    difficulty: 2,
    keyConceptTag: 'Eigenvector from (A − λI)v = 0',
    correctOptionId: 'a',
    generate: (g) => {
      const isEig = (A: Mat, v: number[]) => {
        const Av = mv(A, v);
        return Av[0] * v[1] === Av[1] * v[0];
      };
      const { A, l1, v1, v2 } = g.until(
        () => {
          const [l1, l2] = [g.int(-2, 6), g.int(-2, 6)];
          return { ...withEigen(g, l1, l2), l1, l2 };
        },
        ({ A, l1, l2, v1, v2 }) =>
          l1 !== l2 && A.flat().every((x) => Math.abs(x) <= 9) && !isEig(A, [1, 0]) && !isEig(A, [v1[0], -v1[1]]) &&
          allDistinct([v1, v2, [1, 0], [v1[0], -v1[1]]]),
      );
      const M = [[A[0][0] - l1, A[0][1]], [A[1][0], A[1][1] - l1]];
      const flip = [v1[0], -v1[1]];
      const ids = shuffle(g, ['b', 'c', 'd']);
      const cands = { a: v1, [ids[0]]: v2, [ids[1]]: [1, 0], [ids[2]]: flip };
      return {
        params: { A, lambda: l1, ...cands },
        promptText: r`Which vector is an eigenvector of $A = ${pm(A)}$ for the eigenvalue $\lambda = ${l1}$?`,
        options: [
          { id: 'a', label: r`$${vec(v1)}$`, value: v1 },
          { id: ids[0], label: r`$${vec(v2)}$`, value: v2, trapExplanation: r`$A${vec(v2)} = ${vec(mv(A, v2))}$: an eigenvector, but for the other eigenvalue, not ${l1}.` },
          { id: ids[1], label: '$(1, 0)$', value: [1, 0], trapExplanation: r`$A(1, 0) = ${vec(mv(A, [1, 0]))}$ is not a multiple of $(1, 0)$, so it is not an eigenvector at all.` },
          { id: ids[2], label: r`$${vec(flip)}$`, value: flip, trapExplanation: r`A sign slip: $A${vec(flip)} = ${vec(mv(A, flip))}$ is not a multiple of $${vec(flip)}$.` },
        ].sort((x, y) => x.id.localeCompare(y.id)),
        stepByStepSolution: [
          r`$A - ${paren(l1)}I = ${pm(M)}$.`,
          r`$(A - ${paren(l1)}I)\mathbf{v} = \mathbf{0}$ has the solutions $\mathbf{v} = c\,${vec(v1)}$ (the rows are proportional).`,
          r`$\mathbf{v} = ${vec(v1)}$. Check: $A${vec(v1)} = ${vec(mv(A, v1))} = ${l1}${vec(v1)}$. ✓`,
        ],
      };
    },
  },
  {
    id: 'la-07-5',
    difficulty: 3,
    keyConceptTag: 'det = product of eigenvalues',
    correctOptionId: 'a',
    generate: (g) => {
      const { e, k } = g.until(
        () => ({ e: sorted([g.pick([1, 2, 3, -1, -2]), g.pick([1, 2, 4, -2]), g.pick([1, 2, 3, 4])]), k: g.pick([2, 3]) }),
        ({ e, k }) => {
          const P = e[0] * e[1] * e[2];
          return allDistinct([k ** 3 / P, k / P, k * P, 1 / P]);
        },
      );
      const P = e[0] * e[1] * e[2];
      return {
        params: { e, k },
        promptText: r`A $3\times 3$ matrix $A$ has eigenvalues ${e.map((x) => r`$${x}$`).join(', ').replace(/, ([^,]*)$/, ' and $1')}. What is $\det(${k}A^{-1})$?`,
        options: [
          { id: 'a', label: r`$${frac(k ** 3, P)}$`, value: k ** 3 / P },
          { id: 'b', label: r`$${frac(k, P)}$`, value: k / P, trapExplanation: r`$${k}\cdot\det A^{-1}$ forgets that $${k}A^{-1}$ scales all 3 rows: the factor is $${k}^3 = ${k ** 3}$.` },
          { id: 'c', label: r`$${k * P}$`, value: k * P, trapExplanation: r`$${k}\cdot\det A$ uses $A$ instead of $A^{-1}$. The inverse has the reciprocal eigenvalues.` },
          { id: 'd', label: r`$${frac(1, P)}$`, value: 1 / P, trapExplanation: r`$${frac(1, P)} = \det(A^{-1})$. The factor ${k} in front still multiplies the determinant by $${k}^3$.` },
        ],
        stepByStepSolution: [
          r`$\det A$ = product of eigenvalues $= ${e.map(paren).join('\\cdot ')} = ${P}$, so $\det A^{-1} = ${frac(1, P)}$.`,
          r`$\det(${k}A^{-1}) = ${k}^3\det A^{-1}$ for a $3\times3$ matrix.`,
          r`$${k ** 3}\cdot ${frac(1, P).startsWith('-') ? `(${frac(1, P)})` : frac(1, P)} = ${frac(k ** 3, P)}$.`,
        ],
      };
    },
  },
  {
    id: 'la-07-6',
    difficulty: 3,
    keyConceptTag: 'Powers via diagonalisation',
    correctOptionId: 'a',
    generate: (g) => {
      const p = g.pick([2, 3]);
      const n = p === 2 ? g.int(6, 10) : g.int(4, 7);
      const corner = (p ** n - 1) / (p - 1);
      const A = [[p, 1], [0, 1]];
      return {
        params: { A, n },
        promptText: r`Let $A = ${pm(A)}$. What is the top-right entry of $A^{${n}}$?`,
        options: [
          { id: 'a', label: r`$${corner}$`, value: corner },
          { id: 'b', label: r`$${p ** n}$`, value: p ** n, trapExplanation: r`$${p ** n} = ${p}^{${n}}$ is the top-left entry. The top-right one collects $${p}^{${n - 1}} + ${p}^{${n - 2}} + \dots + 1$.` },
          { id: 'c', label: r`$${n}$`, value: n, trapExplanation: r`For $\begin{pmatrix} 1 & 1 \\ 0 & 1 \end{pmatrix}$ the corner grows by 1 each time. Here the diagonal entry ${p} multiplies what was there before, so it grows much faster.` },
          { id: 'd', label: '$1$', value: 1, trapExplanation: r`$1^{${n}} = 1$ raises the entry to the power. Matrix powers are repeated matrix products, not entrywise powers.` },
        ],
        stepByStepSolution: [
          r`Eigenvalues ${p} and 1 (triangular), with eigenvectors $(1, 0)$ and $(1, ${1 - p})$: $A = PDP^{-1}$ with $D = \operatorname{diag}(${p}, 1)$.`,
          r`$A^{k} = PD^{k}P^{-1} = \begin{pmatrix} ${p}^{k} & \frac{${p}^{k} - 1}{${p - 1}} \\ 0 & 1 \end{pmatrix}$. Check $k = 1$: the corner is 1. ✓`.replace('\\frac{2^{k} - 1}{1}', '2^{k} - 1'),
          r`For $k = ${n}$: $${p === 2 ? `2^{${n}} - 1` : `\\frac{3^{${n}} - 1}{2}`} = ${corner}$.`,
        ],
      };
    },
  },
];
