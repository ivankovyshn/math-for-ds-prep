import type { QuestionTemplate } from '../../../types.ts';
import { r } from '../define.ts';
import { allDistinct, det2, mm, mv, paren, PYTHAGOREAN, shuffle, tr } from '../gen.ts';
import { npInts, npWholeFloats, out, shape, src, src2 } from './fmt.ts';
import { PRINTS } from './01-basics.practice.ts';
import { NP } from './04-numpy.practice.ts';

const PRINTS_OR_ERROR = 'What does this code print? (If it raises an error, pick the error.)';
export const mat2 = (g: { int(a: number, b: number): number }) => [[g.int(-3, 5), g.int(-3, 5)], [g.int(-3, 5), g.int(-3, 5)]];

export const practice: QuestionTemplate[] = [
  {
    id: 'pg-05-1',
    difficulty: 1,
    keyConceptTag: 'Matrix times vector',
    correctOptionId: 'a',
    generate: (g) => {
      const { A, v } = g.until(() => ({ A: mat2(g), v: [g.int(-3, 4), g.int(-3, 4)] }), ({ A, v }) => {
        const Av = mv(A, v);
        return allDistinct([Av, mv(tr(A), v), [A[0][0] * v[0], A[1][1] * v[1]], [Av[0] + Av[1]]].map(String));
      });
      const Av = mv(A, v);
      return {
        params: { A, v },
        codeSnippet: `${NP}A = np.array(${src2(A)})\nv = np.array(${src(v)})\nprint(A @ v)`,
        promptText: PRINTS,
        options: [
          { id: 'a', label: out(npInts(Av)) },
          { id: 'b', label: out(npInts(mv(tr(A), v))), trapExplanation: r`That is <c>v @ A</c> (columns of <c>A</c> dotted with <c>v</c>); <c>A @ v</c> uses the rows.` },
          { id: 'c', label: out(npInts([A[0][0] * v[0], A[1][1] * v[1]])), trapExplanation: r`<c>@</c> is a full matrix–vector product: each row of <c>A</c> is dotted with <c>v</c>.` },
          { id: 'd', label: out(Av[0] + Av[1]), trapExplanation: r`A matrix times a vector is a vector, one entry per row.` },
        ],
        stepByStepSolution: [
          r`Row 0: ${paren(A[0][0])}·${paren(v[0])} + ${paren(A[0][1])}·${paren(v[1])} = ${Av[0]}.`,
          r`Row 1: ${paren(A[1][0])}·${paren(v[0])} + ${paren(A[1][1])}·${paren(v[1])} = ${Av[1]}.`,
          r`Output: <c>${npInts(Av)}</c>.`,
        ],
      };
    },
  },
  {
    id: 'pg-05-2',
    difficulty: 1,
    keyConceptTag: 'Shapes of products',
    correctOptionId: 'a',
    generate: (g) => {
      const { m, n, p } = g.until(() => ({ m: g.int(2, 9), n: g.int(2, 9), p: g.int(2, 9) }), ({ m, n, p }) => allDistinct([m, n, p]));
      return {
        params: { m, n, p },
        codeSnippet: `${NP}A = np.ones((${m}, ${n}))\nB = np.ones((${n}, ${p}))\nprint((A @ B).shape)`,
        promptText: PRINTS_OR_ERROR,
        options: [
          { id: 'a', label: out(shape([m, p])) },
          { id: 'b', label: out(shape([n, n])), trapExplanation: r`The inner sizes ${n} and ${n} are the ones that cancel; the outer sizes ${m} and ${p} remain.` },
          { id: 'c', label: out(shape([p, m])), trapExplanation: r`Rows come from <c>A</c> (${m}), columns from <c>B</c> (${p}).` },
          { id: 'd', label: out('ValueError'), trapExplanation: r`The inner sizes agree (${n} and ${n}), so the product is defined.` },
        ],
        stepByStepSolution: [
          r`<c>(${m}, ${n}) @ (${n}, ${p})</c>: the inner sizes agree.`,
          r`They disappear; the outer sizes remain.`,
          r`Output: <c>${shape([m, p])}</c>.`,
        ],
      };
    },
  },
  {
    id: 'pg-05-3',
    difficulty: 2,
    keyConceptTag: '@ versus *',
    correctOptionId: 'a',
    generate: (g) => {
      const { A, B, i, j } = g.until(
        () => ({ A: mat2(g), B: mat2(g), i: g.int(0, 1), j: g.int(0, 1) }),
        ({ A, B, i, j }) => allDistinct([mm(A, B)[i][j], A[i][j] * B[i][j], mm(B, A)[i][j], A[i][0] * B[j][0] + A[i][1] * B[j][1]]),
      );
      const P = mm(A, B);
      return {
        params: { A, B, i, j },
        codeSnippet: `${NP}A = np.array(${src2(A)})\nB = np.array(${src2(B)})\nprint((A @ B)[${i}, ${j}], (A * B)[${i}, ${j}])`,
        promptText: PRINTS,
        options: [
          { id: 'a', label: out(`${P[i][j]} ${A[i][j] * B[i][j]}`) },
          { id: 'b', label: out(`${A[i][j] * B[i][j]} ${P[i][j]}`), trapExplanation: r`<c>@</c> is the matrix product and comes first; <c>*</c> multiplies matching entries.` },
          { id: 'c', label: out(`${mm(B, A)[i][j]} ${A[i][j] * B[i][j]}`), trapExplanation: r`That entry belongs to <c>B @ A</c>; the order of a matrix product matters.` },
          { id: 'd', label: out(`${A[i][0] * B[j][0] + A[i][1] * B[j][1]} ${A[i][j] * B[i][j]}`), trapExplanation: r`Entry (${i}, ${j}) of <c>A @ B</c> is row ${i} of <c>A</c> dotted with <i>column</i> ${j} of <c>B</c>, not row ${j}.` },
        ],
        stepByStepSolution: [
          r`<c>(A @ B)[${i}, ${j}]</c> = row ${i} of A · column ${j} of B = ${paren(A[i][0])}·${paren(B[0][j])} + ${paren(A[i][1])}·${paren(B[1][j])} = ${P[i][j]}.`,
          r`<c>(A * B)[${i}, ${j}]</c> = ${A[i][j]}·${B[i][j]} = ${A[i][j] * B[i][j]}.`,
          r`Output: <c>${P[i][j]} ${A[i][j] * B[i][j]}</c>.`,
        ],
      };
    },
  },
  {
    id: 'pg-05-4',
    difficulty: 2,
    keyConceptTag: 'Vector norms',
    correctOptionId: 'a',
    generate: (g) => {
      const [p, q, h] = g.pick(PYTHAGOREAN);
      const k = g.int(1, 3);
      const v = shuffle(g, [p * k * g.pick([-1, 1]), q * k]);
      return {
        params: { v },
        codeSnippet: `${NP}v = np.array(${src(v)})\nprint(np.linalg.norm(v))`,
        promptText: PRINTS,
        options: [
          { id: 'a', label: out(`${h * k}.0`) },
          { id: 'b', label: out(`${(h * k) ** 2}`), trapExplanation: r`That is the sum of squares; the norm takes its square root.` },
          { id: 'c', label: out(`${(p + q) * k}`), trapExplanation: r`That is the sum of absolute values (the 1-norm); the default is the Euclidean 2-norm.` },
          { id: 'd', label: out(`${Math.max(p, q) * k}`), trapExplanation: r`That is the largest absolute entry (the max-norm).` },
        ],
        stepByStepSolution: [
          r`$\lVert v\rVert = \sqrt{${paren(v[0])}^2 + ${paren(v[1])}^2} = \sqrt{${(h * k) ** 2}}$.`,
          r`$= ${h * k}$, returned as a float.`,
          r`Output: <c>${h * k}.0</c>.`,
        ],
      };
    },
  },
  {
    id: 'pg-05-5',
    difficulty: 3,
    keyConceptTag: 'Solving a linear system',
    correctOptionId: 'a',
    generate: (g) => {
      const { A, x } = g.until(() => ({ A: mat2(g), x: [g.nonzero(-4, 4), g.nonzero(-4, 4)] }), ({ A, x }) => det2(A) !== 0 && x[0] !== x[1] && allDistinct([x, mv(A, x), [x[1], x[0]], x.map((t) => -t)].map(String)));
      const b = mv(A, x);
      return {
        params: { A, b },
        codeSnippet: `${NP}A = np.array(${src2(A)})\nb = np.array(${src(b)})\nprint(np.linalg.solve(A, b))`,
        promptText: PRINTS,
        options: [
          { id: 'a', label: out(npWholeFloats(x)) },
          { id: 'b', label: out(npInts(mv(A, b))), trapExplanation: r`That is <c>A @ b</c>; <c>solve</c> finds the <c>x</c> with <c>A @ x == b</c>.` },
          { id: 'c', label: out(npWholeFloats([x[1], x[0]])), trapExplanation: r`The entries are in variable order: check <c>A @ x</c> against <c>b</c>.` },
          { id: 'd', label: out(npWholeFloats(x.map((t) => -t))), trapExplanation: r`Check the signs: <c>A @ x</c> must equal <c>b</c>, not <c>-b</c>.` },
        ],
        stepByStepSolution: [
          r`Solve $${A[0][0]}x_0 ${A[0][1] < 0 ? '-' : '+'} ${Math.abs(A[0][1])}x_1 = ${b[0]}$ and $${A[1][0]}x_0 ${A[1][1] < 0 ? '-' : '+'} ${Math.abs(A[1][1])}x_1 = ${b[1]}$.`,
          r`The solution is $x = (${x[0]}, ${x[1]})$; check: <c>A @ x</c> = <c>${npInts(mv(A, x))}</c> = <c>b</c>.`,
          r`<c>solve</c> returns floats: <c>${npWholeFloats(x)}</c>.`,
        ],
      };
    },
  },
  {
    id: 'pg-05-6',
    difficulty: 3,
    keyConceptTag: 'Getting the orientation right',
    correctOptionId: 'a',
    generate: (g) => {
      const { m, n } = g.until(() => ({ m: g.pick([50, 100, 200]), n: g.int(2, 6) }), () => true);
      const opts: [string, string][] = [
        ['X.T @ y', ''],
        ['X @ y', r`<c>X @ y</c> needs <c>y</c> of length ${n} (the columns of <c>X</c>); here it has ${m}, so it raises <c>ValueError</c>.`],
        ['X.T @ X', r`<c>X.T @ X</c> is ${n} × ${n}, shape <c>(${n}, ${n})</c>.`],
        ['y @ X.T', r`<c>(${m},) @ (${n}, ${m})</c>: the inner sizes ${m} and ${n} do not match.`],
      ];
      return {
        params: { m, n },
        codeSnippet: `${NP}X = np.ones((${m}, ${n}))   # ${m} examples, ${n} features\ny = np.ones(${m})`,
        promptText: r`Which expression has shape <c>(${n},)</c>, one number per feature?`,
        options: opts.map(([e, why], i) => ({ id: 'abcd'[i], label: out(e), ...(i === 0 ? {} : { trapExplanation: why }) })),
        stepByStepSolution: [
          r`<c>X.T</c> has shape <c>(${n}, ${m})</c>.`,
          r`<c>(${n}, ${m}) @ (${m},)</c>: the inner sizes agree and the result has shape <c>(${n},)</c>.`,
          r`This is the $X^\top y$ in the normal equations.`,
        ],
      };
    },
  },
];
