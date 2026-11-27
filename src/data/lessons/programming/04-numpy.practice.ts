import type { QuestionTemplate } from '../../../types.ts';
import { r } from '../define.ts';
import { allDistinct, shuffle } from '../gen.ts';
import { npInts, out, shape, src, src2 } from './fmt.ts';
import { PRINTS } from './01-basics.practice.ts';

export const NP = 'import numpy as np\n\n';
const PRINTS_OR_ERROR = 'What does this code print? (If it raises an error, pick the error.)';

/** Result shape of broadcasting two shapes, or null if they are incompatible. */
export function broadcast(s: number[], t: number[]): number[] | null {
  const n = Math.max(s.length, t.length);
  const a = [...Array(n - s.length).fill(1), ...s];
  const b = [...Array(n - t.length).fill(1), ...t];
  const outShape: number[] = [];
  for (let i = 0; i < n; i++) {
    if (a[i] !== b[i] && a[i] !== 1 && b[i] !== 1) return null;
    outShape.push(Math.max(a[i], b[i]));
  }
  return outShape;
}

export const practice: QuestionTemplate[] = [
  {
    id: 'pg-04-1',
    difficulty: 1,
    keyConceptTag: 'Element-wise arithmetic',
    correctOptionId: 'a',
    generate: (g) => {
      const { xs, k, c } = g.until(
        () => ({ xs: Array.from({ length: 4 }, () => g.int(0, 9)), k: g.int(2, 5), c: g.nonzero(-5, 5) }),
        ({ xs, k, c }) => allDistinct([xs.map((x) => x * k + c), xs.map((x) => k * (x + c)), xs.map((x) => x * k), xs.map((x) => x + k + c)].map(String)),
      );
      return {
        params: { xs, k, c },
        codeSnippet: `${NP}x = np.array(${src(xs)})\nprint(x * ${k} ${c < 0 ? '-' : '+'} ${Math.abs(c)})`,
        promptText: PRINTS,
        options: [
          { id: 'a', label: out(npInts(xs.map((x) => x * k + c))) },
          { id: 'b', label: out(npInts(xs.map((x) => k * (x + c)))), trapExplanation: r`Multiplication comes first; the constant is added afterwards to each element.` },
          { id: 'c', label: out(npInts(xs.map((x) => x * k))), trapExplanation: r`The scalar ${c} is broadcast to every element too.` },
          { id: 'd', label: out(npInts(xs.map((x) => x + k + c))), trapExplanation: r`<c>* ${k}</c> multiplies each element; it does not add ${k}.` },
        ],
        stepByStepSolution: [
          r`Arithmetic with a scalar applies to every element.`,
          r`Each entry becomes <c>x * ${k} ${c < 0 ? '-' : '+'} ${Math.abs(c)}</c>: ${xs.map((x) => x * k + c).join(', ')}.`,
          r`Output: <c>${npInts(xs.map((x) => x * k + c))}</c>.`,
        ],
      };
    },
  },
  {
    id: 'pg-04-2',
    difficulty: 1,
    keyConceptTag: 'Shapes and reshape',
    correctOptionId: 'a',
    generate: (g) => {
      const { rr, c } = g.until(() => ({ rr: g.int(2, 6), c: g.int(2, 6) }), ({ rr, c }) => rr !== c);
      const n = rr * c;
      return {
        params: { rr, c },
        codeSnippet: `${NP}A = np.arange(${n}).reshape(${rr}, -1)\nprint(A.shape)`,
        promptText: PRINTS,
        options: [
          { id: 'a', label: out(shape([rr, c])) },
          { id: 'b', label: out(shape([c, rr])), trapExplanation: r`The first size is the ${rr} you specified; <c>-1</c> stands for the second.` },
          { id: 'c', label: out(shape([n])), trapExplanation: r`After <c>reshape</c> the array is two-dimensional.` },
          { id: 'd', label: out(`(${rr}, -1)`), trapExplanation: r`<c>-1</c> is replaced by the size that keeps all ${n} numbers: $${n}/${rr} = ${c}$.` },
        ],
        stepByStepSolution: [
          r`<c>np.arange(${n})</c> has ${n} numbers.`,
          r`${rr} rows need $${n}/${rr} = ${c}$ columns.`,
          r`Output: <c>${shape([rr, c])}</c>.`,
        ],
      };
    },
  },
  {
    id: 'pg-04-3',
    difficulty: 2,
    keyConceptTag: 'Sums along an axis',
    correctOptionId: 'a',
    generate: (g) => {
      const A = g.until(() => Array.from({ length: 2 }, () => Array.from({ length: 3 }, () => g.int(0, 9))), (A) => {
        const col = [0, 1, 2].map((j) => A[0][j] + A[1][j]);
        const row = A.map((rw) => rw[0] + rw[1] + rw[2]);
        const mx = [0, 1, 2].map((j) => Math.max(A[0][j], A[1][j]));
        return allDistinct([col, row, mx].map(String));
      });
      const col = [0, 1, 2].map((j) => A[0][j] + A[1][j]);
      const row = A.map((rw) => rw[0] + rw[1] + rw[2]);
      const mx = [0, 1, 2].map((j) => Math.max(A[0][j], A[1][j]));
      return {
        params: { A },
        codeSnippet: `${NP}A = np.array(${src2(A)})\nprint(A.sum(axis=0))`,
        promptText: PRINTS,
        options: [
          { id: 'a', label: out(npInts(col)) },
          { id: 'b', label: out(npInts(row)), trapExplanation: r`Those are the row sums, <c>axis=1</c>. <c>axis=0</c> adds down each column.` },
          { id: 'c', label: out(col.reduce((s, x) => s + x, 0)), trapExplanation: r`Without an axis <c>sum</c> would give the total; with <c>axis=0</c> you get one sum per column.` },
          { id: 'd', label: out(npInts(mx)), trapExplanation: r`That is <c>A.max(axis=0)</c>; <c>sum</c> adds the two entries of each column.` },
        ],
        stepByStepSolution: [
          r`<c>axis=0</c> runs down the rows, so each column is collapsed to one number.`,
          r`Column sums: ${[0, 1, 2].map((j) => `${A[0][j]} + ${A[1][j]} = ${col[j]}`).join(', ')}.`,
          r`Output: <c>${npInts(col)}</c>.`,
        ],
      };
    },
  },
  {
    id: 'pg-04-4',
    difficulty: 2,
    keyConceptTag: 'Broadcasting rules',
    correctOptionId: 'a',
    generate: (g) => {
      const { m, n } = g.until(() => ({ m: g.int(2, 5), n: g.int(2, 5) }), ({ m, n }) => m !== n);
      const cases: [number[], number[]][] = [[[m, 1], [1, n]], [[m, n], [n]], [[m, n], [m]], [[m, 1], [n]], [[m, n], [1, n]]];
      const [s, t] = g.pick(cases);
      const res = broadcast(s, t);
      const right = res ? shape(res) : 'ValueError';
      const pool = [shape([m, n]), shape([n, m]), shape([m]), 'ValueError', shape([m, 1])].filter((o) => o !== right);
      const wrong = shuffle(g, pool).slice(0, 3);
      const why = (o: string) =>
        o === 'ValueError'
          ? r`The shapes are compatible: compared from the right, each pair of sizes is equal or contains a 1.`
          : res
            ? r`Align the shapes from the right: <c>${shape(s)}</c> and <c>${shape(t)}</c> give <c>${right}</c>, each size-1 dimension stretched.`
            : r`Compared from the right, the last sizes ${s[s.length - 1]} and ${t[t.length - 1]} differ and neither is 1, so NumPy raises an error.`;
      return {
        params: { s, t },
        codeSnippet: `${NP}X = np.ones(${shape(s)})\nY = np.ones(${shape(t)})\nprint((X + Y).shape)`,
        promptText: PRINTS_OR_ERROR,
        options: [
          { id: 'a', label: out(right) },
          ...wrong.map((o, i) => ({ id: 'bcd'[i], label: out(o), trapExplanation: why(o) })),
        ],
        stepByStepSolution: [
          r`Write the shapes right-aligned: <c>${shape(s)}</c> and <c>${shape(t)}</c>${t.length < s.length ? r` (a missing leading dimension counts as 1)` : ''}.`,
          res ? r`Each pair of sizes is equal or contains a 1, so the result takes the larger size in each position.` : r`The last sizes ${s[s.length - 1]} and ${t[t.length - 1]} differ and neither is 1.`,
          res ? r`Output: <c>${right}</c>.` : r`NumPy raises <c>ValueError</c> (operands could not be broadcast together).`,
        ],
      };
    },
  },
  {
    id: 'pg-04-5',
    difficulty: 3,
    keyConceptTag: 'Boolean masks',
    correctOptionId: 'a',
    generate: (g) => {
      const { xs, t } = g.until(
        () => ({ xs: Array.from({ length: 6 }, () => g.int(-5, 12)), t: g.int(1, 6) }),
        ({ xs, t }) => {
          const sel = xs.filter((x) => x > t);
          const idx = xs.map((x, i) => (x > t ? i : -1)).filter((i) => i >= 0);
          return sel.length >= 2 && sel.length <= 4 && allDistinct([sel, xs.filter((x) => x <= t), idx].map(String));
        },
      );
      const sel = xs.filter((x) => x > t);
      const idx = xs.map((x, i) => (x > t ? i : -1)).filter((i) => i >= 0);
      return {
        params: { xs, t },
        codeSnippet: `${NP}x = np.array(${src(xs)})\nprint(x[x > ${t}])`,
        promptText: PRINTS,
        options: [
          { id: 'a', label: out(npInts(sel)) },
          { id: 'b', label: out(npInts(xs.filter((x) => x <= t))), trapExplanation: r`The mask keeps the entries where the condition is <c>True</c>, i.e. those above ${t}.` },
          { id: 'c', label: out(npInts(idx)), trapExplanation: r`Those are the positions (what <c>np.where</c> would give); indexing with a mask returns the values.` },
          { id: 'd', label: out(sel.length), trapExplanation: r`<c>(x > ${t}).sum()</c> would count them; <c>x[x > ${t}]</c> returns the entries themselves.` },
        ],
        stepByStepSolution: [
          r`<c>x > ${t}</c> is a boolean array marking the entries above ${t}.`,
          r`Indexing with it keeps those entries in their original order: ${sel.join(', ')}.`,
          r`Output: <c>${npInts(sel)}</c>.`,
        ],
      };
    },
  },
  {
    id: 'pg-04-6',
    difficulty: 3,
    keyConceptTag: 'argmax along an axis',
    correctOptionId: 'a',
    generate: (g) => {
      const A = g.until(
        () => Array.from({ length: 3 }, () => shuffle(g, [1, 2, 3, 4, 5, 6, 7, 8, 9]).slice(0, 3)),
        (A) => {
          const am1 = A.map((rw) => rw.indexOf(Math.max(...rw)));
          const am0 = [0, 1, 2].map((j) => [0, 1, 2].reduce((b, i) => (A[i][j] > A[b][j] ? i : b), 0));
          const colMax = [0, 1, 2].map((j) => Math.max(A[0][j], A[1][j], A[2][j]));
          const unique = new Set(colMax).size === 3 && [0, 1, 2].every((j) => [0, 1, 2].filter((i) => A[i][j] === colMax[j]).length === 1);
          return unique && allDistinct([am1, am0, A.map((rw) => Math.max(...rw))].map(String));
        },
      );
      const am1 = A.map((rw) => rw.indexOf(Math.max(...rw)));
      const am0 = [0, 1, 2].map((j) => [0, 1, 2].reduce((b, i) => (A[i][j] > A[b][j] ? i : b), 0));
      const flat = A.flat();
      const fl = flat.indexOf(Math.max(...flat));
      return {
        params: { A },
        codeSnippet: `${NP}A = np.array(${src2(A)})\nprint(A.argmax(axis=1))`,
        promptText: PRINTS,
        options: [
          { id: 'a', label: out(npInts(am1)) },
          { id: 'b', label: out(npInts(A.map((rw) => Math.max(...rw)))), trapExplanation: r`<c>argmax</c> returns positions; <c>max</c> would return the values.` },
          { id: 'c', label: out(npInts(am0)), trapExplanation: r`That is <c>axis=0</c>: for each column, the row of its largest entry.` },
          { id: 'd', label: out(fl), trapExplanation: r`Without an axis, <c>argmax</c> gives one position in the flattened array; with <c>axis=1</c> it gives one per row.` },
        ],
        stepByStepSolution: [
          r`<c>axis=1</c>: look along each row.`,
          r`Largest entries: ${A.map((rw, i) => `row ${i}: ${Math.max(...rw)} at column ${am1[i]}`).join('; ')}.`,
          r`Output: <c>${npInts(am1)}</c>.`,
        ],
      };
    },
  },
];
