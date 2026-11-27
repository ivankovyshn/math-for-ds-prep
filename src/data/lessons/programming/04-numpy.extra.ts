import type { QuestionTemplate } from '../../../types.ts';
import { r } from '../define.ts';
import { allDistinct, sumOf } from '../gen.ts';
import { npInts, out, pyFloat, pyList, shape, src } from './fmt.ts';
import { PRINTS } from './01-basics.practice.ts';
import { NP } from './04-numpy.practice.ts';

const arange = (a: number, b: number, s = 1) => {
  const xs: number[] = [];
  for (let x = a; x < b; x += s) xs.push(x);
  return xs;
};

/** Extra practice (Practice 2): gentler questions on the same ideas, with new numbers every time. */
export const extra: QuestionTemplate[] = [
  {
    id: 'pg-04-x1',
    difficulty: 1,
    keyConceptTag: 'Shapes',
    correctOptionId: 'a',
    generate: (g) => {
      const { a, b } = g.until(() => ({ a: g.int(2, 6), b: g.int(2, 6) }), ({ a, b }) => a !== b);
      return {
        params: { a, b },
        codeSnippet: `${NP}Z = np.zeros((${a}, ${b}))\nprint(Z.shape, Z.size)`,
        promptText: PRINTS,
        options: [
          { id: 'a', label: out(`${shape([a, b])} ${a * b}`) },
          { id: 'b', label: out(`${shape([b, a])} ${a * b}`), trapExplanation: r`The shape lists the sizes in the order given: ${a} rows, ${b} columns.` },
          { id: 'c', label: out(`${shape([a, b])} ${a + b}`), trapExplanation: r`<c>size</c> is the number of entries, ${a}·${b}.` },
          { id: 'd', label: out(`${shape([a * b])} ${a * b}`), trapExplanation: r`<c>np.zeros((${a}, ${b}))</c> is two-dimensional.` },
        ],
        stepByStepSolution: [
          r`The tuple <c>(${a}, ${b})</c> is the shape: ${a} rows and ${b} columns.`,
          r`<c>size</c> is the total number of entries: ${a * b}.`,
          r`Output: <c>${shape([a, b])} ${a * b}</c>.`,
        ],
      };
    },
  },
  {
    id: 'pg-04-x2',
    difficulty: 1,
    keyConceptTag: 'The mean of an array',
    correctOptionId: 'a',
    generate: (g) => {
      const xs = g.until(() => Array.from({ length: 4 }, () => g.int(0, 12)), (xs) => allDistinct([sumOf(xs) / 4, sumOf(xs), Math.max(...xs), Math.min(...xs)]));
      const m = sumOf(xs) / 4;
      return {
        params: { xs },
        codeSnippet: `${NP}x = np.array(${src(xs)})\nprint(x.mean())`,
        promptText: PRINTS,
        options: [
          { id: 'a', label: out(pyFloat(m)) },
          { id: 'b', label: out(sumOf(xs)), trapExplanation: r`That is <c>x.sum()</c>; the mean divides by the 4 entries.` },
          { id: 'c', label: out(Math.max(...xs)), trapExplanation: r`That is <c>x.max()</c>.` },
          { id: 'd', label: out(Math.min(...xs)), trapExplanation: r`That is <c>x.min()</c>.` },
        ],
        stepByStepSolution: [
          r`Sum: ${xs.join(' + ')} = ${sumOf(xs)}.`,
          r`Divide by 4: ${pyFloat(m)}. The mean is a float, so it prints with a decimal point.`,
          r`Output: <c>${pyFloat(m)}</c>.`,
        ],
      };
    },
  },
  {
    id: 'pg-04-x3',
    difficulty: 1,
    keyConceptTag: 'np.arange',
    correctOptionId: 'a',
    generate: (g) => {
      const { a, b, s } = g.until(() => ({ a: g.int(0, 4), b: g.int(9, 16), s: g.int(2, 4) }), ({ a, b, s }) => (b - a) % s === 0 && allDistinct([arange(a, b, s), arange(a, b + 1, s), arange(0, b, s), arange(a, b)].map(String)));
      return {
        params: { a, b, s },
        codeSnippet: `${NP}print(np.arange(${a}, ${b}, ${s}))`,
        promptText: PRINTS,
        options: [
          { id: 'a', label: out(npInts(arange(a, b, s))) },
          { id: 'b', label: out(npInts(arange(a, b + 1, s))), trapExplanation: r`Like <c>range</c>, <c>np.arange</c> stops <i>before</i> ${b}.` },
          { id: 'c', label: out(npInts(arange(0, b, s))), trapExplanation: r`The first argument ${a} is the start.` },
          { id: 'd', label: out(npInts(arange(a, b))), trapExplanation: r`The third argument is the step ${s}.` },
        ],
        stepByStepSolution: [
          r`Start at ${a}, add ${s} each time.`,
          r`Stop before ${b}.`,
          r`Output: <c>${npInts(arange(a, b, s))}</c>.`,
        ],
      };
    },
  },
  {
    id: 'pg-04-x4',
    difficulty: 2,
    keyConceptTag: 'Which axis disappears',
    correctOptionId: 'a',
    generate: (g) => {
      const { dims, k } = g.until(() => ({ dims: [g.int(2, 6), g.int(2, 6), g.int(2, 6)], k: g.int(0, 2) }), ({ dims }) => allDistinct(dims));
      const res = dims.filter((_, i) => i !== k);
      const other = dims.filter((_, i) => i !== (k + 1) % 3);
      return {
        params: { dims, k },
        codeSnippet: `${NP}T = np.zeros(${shape(dims)})\nprint(T.sum(axis=${k}).shape)`,
        promptText: PRINTS,
        options: [
          { id: 'a', label: out(shape(res)) },
          { id: 'b', label: out(shape(dims)), trapExplanation: r`Summing along an axis removes that axis.` },
          { id: 'c', label: out(shape(other)), trapExplanation: r`Axes are numbered from 0: <c>axis=${k}</c> is the one of size ${dims[k]}.` },
          { id: 'd', label: out(shape([dims[k]])), trapExplanation: r`Only axis ${k} is removed; the other two remain.` },
        ],
        stepByStepSolution: [
          r`Axis ${k} has size ${dims[k]}.`,
          r`Summing along it removes it from the shape.`,
          r`Output: <c>${shape(res)}</c>.`,
        ],
      };
    },
  },
  {
    id: 'pg-04-x5',
    difficulty: 2,
    keyConceptTag: 'Counting with a mask',
    correctOptionId: 'a',
    generate: (g) => {
      const { xs, t } = g.until(() => ({ xs: Array.from({ length: 7 }, () => g.int(0, 10)), t: g.int(3, 7) }), ({ xs, t }) => {
        const c = xs.filter((x) => x > t).length;
        return c > 0 && allDistinct([c, sumOf(xs.filter((x) => x > t)), xs.filter((x) => x >= t).length, xs.length - c]);
      });
      const sel = xs.filter((x) => x > t);
      return {
        params: { xs, t },
        codeSnippet: `${NP}x = np.array(${src(xs)})\nprint((x > ${t}).sum())`,
        promptText: PRINTS,
        options: [
          { id: 'a', label: out(sel.length) },
          { id: 'b', label: out(sumOf(sel)), trapExplanation: r`<c>(x > ${t})</c> holds True/False values; summing counts the Trues. <c>x[x > ${t}].sum()</c> would add the values.` },
          { id: 'c', label: out(xs.filter((x) => x >= t).length), trapExplanation: r`<c>></c> is strict: entries equal to ${t} are not counted.` },
          { id: 'd', label: out(xs.length - sel.length), trapExplanation: r`That counts the entries that are <i>not</i> above ${t}.` },
        ],
        stepByStepSolution: [
          r`<c>x > ${t}</c> is True for ${sel.join(', ')}.`,
          r`True counts as 1 and False as 0 in a sum.`,
          r`Output: <c>${sel.length}</c>.`,
        ],
      };
    },
  },
  {
    id: 'pg-04-x6',
    difficulty: 2,
    keyConceptTag: 'Lists are not arrays',
    correctOptionId: 'a',
    generate: (g) => {
      const { a, b } = g.until(() => ({ a: [g.int(1, 9), g.int(1, 9)], b: [g.int(1, 9), g.int(1, 9)] }), ({ a, b }) => allDistinct([...a, ...b]));
      const sum = [a[0] + b[0], a[1] + b[1]];
      return {
        params: { a, b },
        codeSnippet: `a = ${src(a)}\nb = ${src(b)}\nprint(a + b)`,
        promptText: PRINTS,
        options: [
          { id: 'a', label: out(pyList([...a, ...b])) },
          { id: 'b', label: out(pyList(sum)), trapExplanation: r`These are Python lists, not arrays: <c>+</c> joins them.` },
          { id: 'c', label: out(npInts(sum)), trapExplanation: r`Element-wise addition would need <c>np.array(a) + np.array(b)</c>.` },
          { id: 'd', label: out('TypeError'), trapExplanation: r`Adding two lists is allowed; it concatenates them.` },
        ],
        stepByStepSolution: [
          r`<c>a</c> and <c>b</c> are plain lists.`,
          r`<c>+</c> on lists concatenates.`,
          r`Output: <c>${pyList([...a, ...b])}</c>.`,
        ],
      };
    },
  },
];
