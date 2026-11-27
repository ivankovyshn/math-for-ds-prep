import type { QuestionTemplate } from '../../../types.ts';
import { r } from '../define.ts';
import { allDistinct, det2, dot, paren } from '../gen.ts';
import { npInts, npWholeFloats, out, shape, src, src2 } from './fmt.ts';
import { PRINTS } from './01-basics.practice.ts';
import { NP } from './04-numpy.practice.ts';
import { mat2 } from './05-linalg-numpy.practice.ts';

const PRINTS_OR_ERROR = 'What does this code print? (If it raises an error, pick the error.)';

/** Extra practice (Practice 2): gentler questions on the same ideas, with new numbers every time. */
export const extra: QuestionTemplate[] = [
  {
    id: 'pg-05-x1',
    difficulty: 1,
    keyConceptTag: 'Transpose',
    correctOptionId: 'a',
    generate: (g) => {
      const A = g.until(() => [[g.int(1, 9), g.int(1, 9), g.int(1, 9)], [g.int(1, 9), g.int(1, 9), g.int(1, 9)]], (A) => allDistinct([[A[0][0], A[1][0]], A[0].slice(0, 2), [A[0][0], A[0][1]].reverse(), [A[1][0], A[1][1]]].map(String)));
      return {
        params: { A },
        codeSnippet: `${NP}A = np.array(${src2(A)})\nprint(A.T.shape, A.T[0])`,
        promptText: PRINTS,
        options: [
          { id: 'a', label: out(`${shape([3, 2])} ${npInts([A[0][0], A[1][0]])}`) },
          { id: 'b', label: out(`${shape([2, 3])} ${npInts([A[0][0], A[1][0]])}`), trapExplanation: r`Transposing swaps the shape: (2, 3) becomes (3, 2).` },
          { id: 'c', label: out(`${shape([3, 2])} ${npInts(A[0].slice(0, 2))}`), trapExplanation: r`Row 0 of <c>A.T</c> is column 0 of <c>A</c>.` },
          { id: 'd', label: out(`${shape([3, 2])} ${npInts([A[1][0], A[1][1]])}`), trapExplanation: r`<c>A.T[0]</c> collects the first entry of every row of <c>A</c>.` },
        ],
        stepByStepSolution: [
          r`<c>A</c> is 2 × 3, so <c>A.T</c> is 3 × 2.`,
          r`Row 0 of <c>A.T</c> is column 0 of <c>A</c>: ${A[0][0]}, ${A[1][0]}.`,
          r`Output: <c>${shape([3, 2])} ${npInts([A[0][0], A[1][0]])}</c>.`,
        ],
      };
    },
  },
  {
    id: 'pg-05-x2',
    difficulty: 1,
    keyConceptTag: 'Dot products',
    correctOptionId: 'a',
    generate: (g) => {
      const { u, v } = g.until(() => ({ u: [g.int(-3, 5), g.int(-3, 5), g.int(-3, 5)], v: [g.int(-3, 5), g.int(-3, 5), g.int(-3, 5)] }), ({ u, v }) => allDistinct([dot(u, v), u.reduce((s, x) => s + x, 0) + v.reduce((s, x) => s + x, 0), u[0] * v[0]]));
      return {
        params: { u, v },
        codeSnippet: `${NP}u = np.array(${src(u)})\nv = np.array(${src(v)})\nprint(u @ v, u * v)`,
        promptText: PRINTS,
        options: [
          { id: 'a', label: out(`${dot(u, v)} ${npInts(u.map((x, i) => x * v[i]))}`) },
          { id: 'b', label: out(`${npInts(u.map((x, i) => x * v[i]))} ${dot(u, v)}`), trapExplanation: r`<c>@</c> of two vectors gives a single number (the dot product); <c>*</c> keeps the vector.` },
          { id: 'c', label: out(`${dot(u, v)} ${dot(u, v)}`), trapExplanation: r`<c>*</c> multiplies matching entries and returns an array.` },
          { id: 'd', label: out(`${u.reduce((s, x) => s + x, 0) + v.reduce((s, x) => s + x, 0)} ${npInts(u.map((x, i) => x * v[i]))}`), trapExplanation: r`The dot product multiplies matching entries before adding.` },
        ],
        stepByStepSolution: [
          r`<c>u * v</c> = ${npInts(u.map((x, i) => x * v[i]))}.`,
          r`<c>u @ v</c> adds those products: ${dot(u, v)}.`,
          r`Output: <c>${dot(u, v)} ${npInts(u.map((x, i) => x * v[i]))}</c>.`,
        ],
      };
    },
  },
  {
    id: 'pg-05-x3',
    difficulty: 1,
    keyConceptTag: 'Trace',
    correctOptionId: 'a',
    generate: (g) => {
      const A = g.until(() => [0, 1, 2].map(() => [g.int(-2, 9), g.int(-2, 9), g.int(-2, 9)]), (A) => {
        const t = A[0][0] + A[1][1] + A[2][2];
        return allDistinct([t, A.flat().reduce((s, x) => s + x, 0), A[0][2] + A[1][1] + A[2][0], A[0][0] * A[1][1] * A[2][2]]);
      });
      const t = A[0][0] + A[1][1] + A[2][2];
      return {
        params: { A },
        codeSnippet: `${NP}A = np.array(${src2(A)})\nprint(np.trace(A))`,
        promptText: PRINTS,
        options: [
          { id: 'a', label: out(t) },
          { id: 'b', label: out(A.flat().reduce((s, x) => s + x, 0)), trapExplanation: r`That sums every entry; the trace uses only the diagonal.` },
          { id: 'c', label: out(A[0][2] + A[1][1] + A[2][0]), trapExplanation: r`That is the anti-diagonal; the trace runs from top left to bottom right.` },
          { id: 'd', label: out(A[0][0] * A[1][1] * A[2][2]), trapExplanation: r`The trace adds the diagonal entries; it does not multiply them.` },
        ],
        stepByStepSolution: [
          r`Diagonal entries: ${A[0][0]}, ${A[1][1]}, ${A[2][2]}.`,
          r`Their sum is ${t}.`,
          r`Output: <c>${t}</c>.`,
        ],
      };
    },
  },
  {
    id: 'pg-05-x4',
    difficulty: 2,
    keyConceptTag: 'The order of a product',
    correctOptionId: 'a',
    generate: (g) => {
      const { m, n } = g.until(() => ({ m: g.int(2, 7), n: g.int(2, 7) }), ({ m, n }) => m !== n);
      return {
        params: { m, n },
        codeSnippet: `${NP}A = np.ones((${m}, ${n}))\nB = np.ones((${n}, ${m}))\nprint((B @ A).shape)`,
        promptText: PRINTS_OR_ERROR,
        options: [
          { id: 'a', label: out(shape([n, n])) },
          { id: 'b', label: out(shape([m, m])), trapExplanation: r`That is <c>A @ B</c>. In <c>B @ A</c> the rows come from <c>B</c> (${n}) and the columns from <c>A</c> (${n}).` },
          { id: 'c', label: out(shape([n, m])), trapExplanation: r`The inner sizes ${m} and ${m} disappear.` },
          { id: 'd', label: out('ValueError'), trapExplanation: r`<c>(${n}, ${m}) @ (${m}, ${n})</c>: the inner sizes match.` },
        ],
        stepByStepSolution: [
          r`<c>B @ A</c> is <c>(${n}, ${m}) @ (${m}, ${n})</c>.`,
          r`Inner sizes ${m} and ${m} agree and cancel.`,
          r`Output: <c>${shape([n, n])}</c>.`,
        ],
      };
    },
  },
  {
    id: 'pg-05-x5',
    difficulty: 2,
    keyConceptTag: 'Determinants',
    correctOptionId: 'a',
    generate: (g) => {
      const A = g.until(() => mat2(g), (A) => {
        const d = det2(A);
        return d !== 0 && allDistinct([d, A[0][0] * A[1][1] + A[0][1] * A[1][0], -d, A[0][0] * A[1][1]]);
      });
      const d = det2(A);
      return {
        params: { A },
        codeSnippet: `${NP}A = np.array(${src2(A)})\nprint(round(np.linalg.det(A)))`,
        promptText: PRINTS,
        options: [
          { id: 'a', label: out(d) },
          { id: 'b', label: out(A[0][0] * A[1][1] + A[0][1] * A[1][0]), trapExplanation: r`The determinant subtracts the off-diagonal product: $ad - bc$.` },
          { id: 'c', label: out(-d), trapExplanation: r`It is $ad - bc$ (main diagonal first), not $bc - ad$.` },
          { id: 'd', label: out(A[0][0] * A[1][1]), trapExplanation: r`The off-diagonal product $bc$ must be subtracted.` },
        ],
        stepByStepSolution: [
          r`$\det A = ad - bc = ${paren(A[0][0])}\cdot${paren(A[1][1])} - ${paren(A[0][1])}\cdot${paren(A[1][0])}$.`,
          r`<c>np.linalg.det</c> returns a float with a tiny rounding error, which <c>round</c> removes.`,
          r`Output: <c>${d}</c>.`,
        ],
      };
    },
  },
  {
    id: 'pg-05-x6',
    difficulty: 2,
    keyConceptTag: 'Column means of a data matrix',
    correctOptionId: 'a',
    generate: (g) => {
      const X = g.until(() => [0, 1, 2].map(() => [g.int(0, 9), g.int(0, 9)]), (X) => {
        const cs = [0, 1].map((j) => X[0][j] + X[1][j] + X[2][j]);
        return cs.every((c) => c % 3 === 0) && cs[0] !== cs[1];
      });
      const cs = [0, 1].map((j) => X[0][j] + X[1][j] + X[2][j]);
      const means = cs.map((c) => c / 3);
      return {
        params: { X },
        codeSnippet: `${NP}X = np.array(${src2(X)})   # 3 examples, 2 features\nprint(X.mean(axis=0))`,
        promptText: PRINTS,
        options: [
          { id: 'a', label: out(npWholeFloats(means)) },
          { id: 'b', label: out(npInts(cs)), trapExplanation: r`Those are the column sums; the mean divides by the 3 rows.` },
          { id: 'c', label: out(npInts(means)), trapExplanation: r`<c>mean</c> always returns floats, printed with a decimal point.` },
          { id: 'd', label: out(npWholeFloats([...means].reverse())), trapExplanation: r`Entry 0 is the mean of column 0.` },
        ],
        stepByStepSolution: [
          r`<c>axis=0</c> averages down each column (over the examples).`,
          r`Column 0: ${cs[0]}/3 = ${means[0]}; column 1: ${cs[1]}/3 = ${means[1]}.`,
          r`Output: <c>${npWholeFloats(means)}</c>.`,
        ],
      };
    },
  },
];
