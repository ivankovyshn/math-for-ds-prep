import type { QuestionTemplate } from '../../../types.ts';
import { r } from '../define.ts';
import { allDistinct } from '../gen.ts';
import { out, pyList, src } from './fmt.ts';
import { PRINTS } from './01-basics.practice.ts';
import { FRUITS } from './03-data-structures.practice.ts';

const list = (g: { int(a: number, b: number): number }, n: number) => Array.from({ length: n }, () => g.int(1, 20));

/** Extra practice (Practice 2): gentler questions on the same ideas, with new numbers every time. */
export const extra: QuestionTemplate[] = [
  {
    id: 'pg-03-x1',
    difficulty: 1,
    keyConceptTag: 'Slicing a list',
    correctOptionId: 'a',
    generate: (g) => {
      const { xs, i, j } = g.until(
        () => {
          const xs = list(g, 6);
          const i = g.int(1, 3);
          return { xs, i, j: g.int(i + 2, 5) };
        },
        ({ xs, i, j }) => allDistinct([xs.slice(i, j), xs.slice(i, j + 1), xs.slice(i - 1, j), xs.slice(i + 1, j + 1)].map(String)),
      );
      return {
        params: { xs, i, j },
        codeSnippet: `xs = ${src(xs)}\nprint(xs[${i}:${j}])`,
        promptText: PRINTS,
        options: [
          { id: 'a', label: out(pyList(xs.slice(i, j))) },
          { id: 'b', label: out(pyList(xs.slice(i, j + 1))), trapExplanation: r`The end index ${j} is excluded.` },
          { id: 'c', label: out(pyList(xs.slice(i - 1, j))), trapExplanation: r`Index ${i} is the ${i + 1}${i === 1 ? 'nd' : i === 2 ? 'rd' : 'th'} element; counting starts at 0.` },
          { id: 'd', label: out(pyList(xs.slice(i + 1, j + 1))), trapExplanation: r`The slice starts at index ${i} itself.` },
        ],
        stepByStepSolution: [
          r`Indices of <c>xs</c>: ${xs.map((x, k) => `${k}:${x}`).join(', ')}.`,
          r`<c>xs[${i}:${j}]</c> takes indices ${i} to ${j - 1}.`,
          r`Output: <c>${pyList(xs.slice(i, j))}</c>.`,
        ],
      };
    },
  },
  {
    id: 'pg-03-x2',
    difficulty: 1,
    keyConceptTag: 'append and pop',
    correctOptionId: 'a',
    generate: (g) => {
      const { xs, v } = g.until(() => ({ xs: list(g, 3), v: g.int(1, 20) }), ({ xs, v }) => allDistinct([...xs, v]));
      return {
        params: { xs, v },
        codeSnippet: `xs = ${src(xs)}\nxs.append(${v})\nxs.pop(0)\nprint(xs)`,
        promptText: PRINTS,
        options: [
          { id: 'a', label: out(pyList([...xs.slice(1), v])) },
          { id: 'b', label: out(pyList([...xs])), trapExplanation: r`<c>pop(0)</c> removes the <i>first</i> element, ${xs[0]}, not the one just added.` },
          { id: 'c', label: out(pyList([v, ...xs.slice(1)])), trapExplanation: r`<c>append</c> adds at the end of the list.` },
          { id: 'd', label: out(pyList([...xs.slice(0, 2), v])), trapExplanation: r`<c>pop(0)</c> removes index 0; <c>pop()</c> without an argument would remove the last element.` },
        ],
        stepByStepSolution: [
          r`After <c>append(${v})</c>: <c>${pyList([...xs, v])}</c>.`,
          r`<c>pop(0)</c> removes the element at index 0, ${xs[0]}.`,
          r`Output: <c>${pyList([...xs.slice(1), v])}</c>.`,
        ],
      };
    },
  },
  {
    id: 'pg-03-x3',
    difficulty: 1,
    keyConceptTag: 'Removing duplicates with a set',
    correctOptionId: 'a',
    generate: (g) => {
      const xs = g.until(() => Array.from({ length: 7 }, () => g.int(1, 5)), (xs) => {
        const d = new Set(xs).size;
        return d >= 2 && d <= 4;
      });
      const d = new Set(xs).size;
      const dupes = xs.length - d;
      return {
        params: { xs },
        codeSnippet: `xs = ${src(xs)}\nprint(len(xs), len(set(xs)))`,
        promptText: PRINTS,
        options: [
          { id: 'a', label: out(`${xs.length} ${d}`) },
          { id: 'b', label: out(`${xs.length} ${xs.length}`), trapExplanation: r`A set keeps each value once; there are only ${d} different values.` },
          { id: 'c', label: out(`${d} ${xs.length}`), trapExplanation: r`<c>len(xs)</c> counts every element, duplicates included.` },
          { id: 'd', label: out(`${xs.length} ${dupes}`), trapExplanation: r`${dupes} is the number of repeated entries; the set's size is the number of distinct values.` },
        ].filter((o, i, arr) => arr.findIndex((p) => p.label === o.label) === i),
        stepByStepSolution: [
          r`<c>xs</c> has ${xs.length} elements.`,
          r`Its distinct values are ${[...new Set(xs)].sort((p, q) => p - q).join(', ')}.`,
          r`Output: <c>${xs.length} ${d}</c>.`,
        ],
      };
    },
  },
  {
    id: 'pg-03-x4',
    difficulty: 2,
    keyConceptTag: 'Looping over a dictionary',
    correctOptionId: 'a',
    generate: (g) => {
      const { vals, t } = g.until(() => ({ vals: FRUITS.slice(0, 4).map(() => g.int(1, 12)), t: g.int(3, 8) }), ({ vals, t }) => {
        const above = vals.filter((v) => v > t);
        const s = (xs: number[]) => xs.reduce((a, b) => a + b, 0);
        return above.length > 0 && above.length < 4 && allDistinct([s(above), above.length, s(vals), s(vals.filter((v) => v >= t))]);
      });
      const s = (xs: number[]) => xs.reduce((a, b) => a + b, 0);
      const above = vals.filter((v) => v > t);
      const dict = `{${FRUITS.slice(0, 4).map((f, i) => `"${f}": ${vals[i]}`).join(', ')}}`;
      return {
        params: { vals, t },
        codeSnippet: `stock = ${dict}\nprint(sum(v for k, v in stock.items() if v > ${t}))`,
        promptText: PRINTS,
        options: [
          { id: 'a', label: out(s(above)) },
          { id: 'b', label: out(above.length), trapExplanation: r`The generator yields the values themselves; <c>sum</c> adds them rather than counting them.` },
          { id: 'c', label: out(s(vals)), trapExplanation: r`The <c>if v > ${t}</c> filter drops the small values.` },
          { id: 'd', label: out(s(vals.filter((v) => v >= t))), trapExplanation: r`<c>></c> is strict: a value equal to ${t} is not included.` },
        ],
        stepByStepSolution: [
          r`<c>items()</c> gives the pairs (key, value).`,
          r`Values above ${t}: ${above.join(', ')}.`,
          r`Output: <c>${s(above)}</c>.`,
        ],
      };
    },
  },
  {
    id: 'pg-03-x5',
    difficulty: 2,
    keyConceptTag: 'enumerate',
    correctOptionId: 'a',
    generate: (g) => {
      const { xs, t } = g.until(() => ({ xs: list(g, 6), t: g.int(6, 14) }), ({ xs, t }) => {
        const idx = xs.map((x, i) => (x > t ? i : -1)).filter((i) => i >= 0);
        const rest = xs.map((x, i) => (x <= t ? i : -1)).filter((i) => i >= 0);
        return idx.length >= 1 && idx.length <= 4 && allDistinct([idx, idx.map((i) => i + 1), xs.filter((x) => x > t), rest].map(String));
      });
      const idx = xs.map((x, i) => (x > t ? i : -1)).filter((i) => i >= 0);
      return {
        params: { xs, t },
        codeSnippet: `xs = ${src(xs)}\nprint([i for i, x in enumerate(xs) if x > ${t}])`,
        promptText: PRINTS,
        options: [
          { id: 'a', label: out(pyList(idx)) },
          { id: 'b', label: out(pyList(idx.map((i) => i + 1))), trapExplanation: r`<c>enumerate</c> counts from 0.` },
          { id: 'c', label: out(pyList(xs.filter((x) => x > t))), trapExplanation: r`The comprehension collects <c>i</c>, the positions, not the values <c>x</c>.` },
          { id: 'd', label: out(pyList(xs.map((x, i) => (x <= t ? i : -1)).filter((i) => i >= 0))), trapExplanation: r`The condition keeps values <i>above</i> ${t}.` },
        ],
        stepByStepSolution: [
          r`<c>enumerate</c> pairs each value with its index: ${xs.map((x, i) => `(${i}, ${x})`).join(', ')}.`,
          r`Keep the indices whose value exceeds ${t}.`,
          r`Output: <c>${pyList(idx)}</c>.`,
        ],
      };
    },
  },
  {
    id: 'pg-03-x6',
    difficulty: 2,
    keyConceptTag: 'zip stops at the shorter list',
    correctOptionId: 'a',
    generate: (g) => {
      const xs = list(g, 4).map((x) => x % 9 + 1);
      const ys = list(g, 3).map((y) => y % 9 + 1);
      const prods = ys.map((y, i) => xs[i] * y);
      return {
        params: { xs, ys },
        codeSnippet: `xs = ${src(xs)}\nys = ${src(ys)}\nprint([a * b for a, b in zip(xs, ys)])`,
        promptText: PRINTS,
        options: [
          { id: 'a', label: out(pyList(prods)) },
          { id: 'b', label: out(pyList([...prods, xs[3]])), trapExplanation: r`<c>zip</c> stops when the shorter list runs out; the extra ${xs[3]} is dropped, not copied.` },
          { id: 'c', label: out(pyList([...prods, 0])), trapExplanation: r`<c>zip</c> does not pad the shorter list with zeros.` },
          { id: 'd', label: out('ValueError'), trapExplanation: r`Different lengths are allowed: <c>zip</c> simply stops at the shorter one.` },
        ],
        stepByStepSolution: [
          r`<c>zip</c> pairs the elements: ${ys.map((y, i) => `(${xs[i]}, ${y})`).join(', ')}; the fourth element of <c>xs</c> has no partner.`,
          r`Multiply each pair.`,
          r`Output: <c>${pyList(prods)}</c>.`,
        ],
      };
    },
  },
];
