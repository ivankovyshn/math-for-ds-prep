import type { QuestionTemplate } from '../../../types.ts';
import { r } from '../define.ts';
import { allDistinct, shuffle } from '../gen.ts';
import { out, pyList, src, src2 } from './fmt.ts';
import { PRINTS } from './01-basics.practice.ts';

export const FRUITS = ['apple', 'pear', 'fig', 'plum', 'kiwi'];

export const practice: QuestionTemplate[] = [
  {
    id: 'pg-03-1',
    difficulty: 1,
    keyConceptTag: 'List comprehensions',
    correctOptionId: 'a',
    generate: (g) => {
      const xs = g.until(() => Array.from({ length: 5 }, () => g.int(1, 9)), (xs) => {
        const ev = xs.filter((x) => x % 2 === 0);
        return ev.length >= 1 && ev.length <= 3;
      });
      const ev = xs.filter((x) => x % 2 === 0);
      const od = xs.filter((x) => x % 2 === 1);
      return {
        params: { xs },
        codeSnippet: `xs = ${src(xs)}\nprint([x ** 2 for x in xs if x % 2 == 0])`,
        promptText: PRINTS,
        options: [
          { id: 'a', label: out(pyList(ev.map((x) => x * x))) },
          { id: 'b', label: out(pyList(xs.map((x) => x * x))), trapExplanation: r`The <c>if</c> keeps only the even values before squaring.` },
          { id: 'c', label: out(pyList(ev)), trapExplanation: r`Each kept value is squared by <c>x ** 2</c>.` },
          { id: 'd', label: out(pyList(od.map((x) => x * x))), trapExplanation: r`<c>x % 2 == 0</c> selects even numbers, not odd ones.` },
        ],
        stepByStepSolution: [
          r`Even values of <c>xs</c>, in order: ${ev.join(', ')}.`,
          r`Square each: ${ev.map((x) => x * x).join(', ')}.`,
          r`Output: <c>${pyList(ev.map((x) => x * x))}</c>.`,
        ],
      };
    },
  },
  {
    id: 'pg-03-2',
    difficulty: 1,
    keyConceptTag: 'Counting with a dictionary',
    correctOptionId: 'a',
    generate: (g) => {
      const { words, k } = g.until(
        () => ({ words: Array.from({ length: 7 }, () => g.pick(FRUITS.slice(0, 3))), k: g.pick(FRUITS.slice(0, 3)) }),
        ({ words, k }) => {
          const c = words.filter((w) => w === k).length;
          return c >= 2 && allDistinct([c, words.length, new Set(words).size, c - 1]);
        },
      );
      const c = words.filter((w) => w === k).length;
      return {
        params: { c },
        codeSnippet: `words = ${pyList(words)}\ncounts = {}\nfor w in words:\n    counts[w] = counts.get(w, 0) + 1\nprint(counts["${k}"])`,
        promptText: PRINTS,
        options: [
          { id: 'a', label: out(c) },
          { id: 'b', label: out(words.length), trapExplanation: r`That is the total number of words; <c>counts["${k}"]</c> counts only <c>${k}</c>.` },
          { id: 'c', label: out(new Set(words).size), trapExplanation: r`That is the number of different words, <c>len(counts)</c>.` },
          { id: 'd', label: out(c - 1), trapExplanation: r`The first occurrence counts too: <c>get</c> returns 0, and 1 is added.` },
        ],
        stepByStepSolution: [
          r`Each time a word appears, its count goes up by 1 (starting from <c>get(w, 0)</c> = 0).`,
          r`<c>${k}</c> appears ${c} times in the list.`,
          r`Output: <c>${c}</c>.`,
        ],
      };
    },
  },
  {
    id: 'pg-03-3',
    difficulty: 2,
    keyConceptTag: 'Aliasing and copies',
    correctOptionId: 'a',
    generate: (g) => {
      const { a, x, y } = g.until(() => ({ a: [g.int(1, 9), g.int(1, 9)], x: g.int(1, 9), y: g.int(1, 9) }), ({ a, x, y }) => allDistinct([...a, x, y]));
      return {
        params: { a, x, y },
        codeSnippet: `a = ${src(a)}\nb = a\nc = a[:]\nb.append(${x})\nc.append(${y})\nprint(a)`,
        promptText: PRINTS,
        options: [
          { id: 'a', label: out(pyList([...a, x])) },
          { id: 'b', label: out(pyList(a)), trapExplanation: r`<c>b = a</c> makes <c>b</c> another name for the same list, so <c>b.append(${x})</c> changes <c>a</c>.` },
          { id: 'c', label: out(pyList([...a, x, y])), trapExplanation: r`<c>c = a[:]</c> is a copy; appending to it leaves <c>a</c> alone.` },
          { id: 'd', label: out(pyList([...a, y])), trapExplanation: r`<c>${y}</c> went into the copy <c>c</c>; <c>${x}</c> went into the shared list.` },
        ],
        stepByStepSolution: [
          r`<c>b</c> and <c>a</c> are the same list; <c>c</c> is a separate copy.`,
          r`<c>b.append(${x})</c> changes the shared list; <c>c.append(${y})</c> changes only the copy.`,
          r`Output: <c>${pyList([...a, x])}</c>.`,
        ],
      };
    },
  },
  {
    id: 'pg-03-4',
    difficulty: 2,
    keyConceptTag: 'Sorting with a key',
    correctOptionId: 'a',
    generate: (g) => {
      const xs = g.until(() => shuffle(g, [1, 2, 3, 4, 5, 6, 7, 8, 9]).slice(0, 4).map((v) => v * g.pick([-1, 1])), (xs) => {
        const byAbs = [...xs].sort((p, q) => Math.abs(p) - Math.abs(q));
        const lists = [byAbs, [...xs].sort((p, q) => p - q), byAbs.map(Math.abs), [...byAbs].reverse()];
        return xs.some((x) => x < 0) && xs.some((x) => x > 0) && allDistinct(lists.map(String));
      });
      const byAbs = [...xs].sort((p, q) => Math.abs(p) - Math.abs(q));
      const plain = [...xs].sort((p, q) => p - q);
      const absRev = [...byAbs].reverse();
      const absVals = byAbs.map(Math.abs);
      return {
        params: { xs },
        codeSnippet: `xs = ${src(xs)}\nprint(sorted(xs, key=abs))`,
        promptText: PRINTS,
        options: [
          { id: 'a', label: out(pyList(byAbs)) },
          { id: 'b', label: out(pyList(plain)), trapExplanation: r`That sorts by the values themselves; <c>key=abs</c> sorts by distance from 0.` },
          { id: 'c', label: out(pyList(absVals)), trapExplanation: r`The key is used only for comparing; the list keeps the original values with their signs.` },
          { id: 'd', label: out(pyList(absRev)), trapExplanation: r`<c>sorted</c> is ascending unless <c>reverse=True</c> is given.` },
        ],
        stepByStepSolution: [
          r`Keys: ${xs.map((x) => `|${x}| = ${Math.abs(x)}`).join(', ')}.`,
          r`Order the original values by their keys, smallest first.`,
          r`Output: <c>${pyList(byAbs)}</c>.`,
        ],
      };
    },
  },
  {
    id: 'pg-03-5',
    difficulty: 3,
    keyConceptTag: 'Set operations',
    correctOptionId: 'a',
    generate: (g) => {
      const { A, B } = g.until(
        () => ({ A: g.until(() => Array.from({ length: 6 }, () => g.int(1, 9)), () => true), B: Array.from({ length: 6 }, () => g.int(1, 9)) }),
        ({ A, B }) => {
          const sa = new Set(A);
          const sb = new Set(B);
          const u = new Set([...A, ...B]).size;
          const i = [...sa].filter((x) => sb.has(x)).length;
          const d = [...sa].filter((x) => !sb.has(x)).length;
          return i > 0 && d > 0 && allDistinct([`${u} ${i} ${d}`, `${A.length + B.length} ${i} ${d}`, `${u} ${i} ${sb.size - i}`, `${i} ${u} ${d}`]);
        },
      );
      const sa = new Set(A);
      const sb = new Set(B);
      const u = new Set([...A, ...B]).size;
      const i = [...sa].filter((x) => sb.has(x)).length;
      const d = [...sa].filter((x) => !sb.has(x)).length;
      return {
        params: { A, B },
        codeSnippet: `a = set(${src(A)})\nb = set(${src(B)})\nprint(len(a | b), len(a & b), len(a - b))`,
        promptText: PRINTS,
        options: [
          { id: 'a', label: out(`${u} ${i} ${d}`) },
          { id: 'b', label: out(`${A.length + B.length} ${i} ${d}`), trapExplanation: r`Sets drop duplicates, so the union has ${u} distinct values, not ${A.length + B.length}.` },
          { id: 'c', label: out(`${u} ${i} ${sb.size - i}`), trapExplanation: r`<c>a - b</c> keeps the elements of <c>a</c> that are not in <c>b</c>; you computed <c>b - a</c>.` },
          { id: 'd', label: out(`${i} ${u} ${d}`), trapExplanation: r`<c>|</c> is the union and <c>&</c> the intersection.` },
        ],
        stepByStepSolution: [
          r`<c>a</c> = {${[...sa].sort((p, q) => p - q).join(', ')}}, <c>b</c> = {${[...sb].sort((p, q) => p - q).join(', ')}}.`,
          r`Union: ${u} values; intersection: {${[...sa].filter((x) => sb.has(x)).sort((p, q) => p - q).join(', ')}}; <c>a - b</c>: {${[...sa].filter((x) => !sb.has(x)).sort((p, q) => p - q).join(', ')}}.`,
          r`Output: <c>${u} ${i} ${d}</c>.`,
        ],
      };
    },
  },
  {
    id: 'pg-03-6',
    difficulty: 3,
    keyConceptTag: 'Nested lists',
    correctOptionId: 'a',
    generate: (g) => {
      const { M, k } = g.until(
        () => ({ M: Array.from({ length: 3 }, () => Array.from({ length: 3 }, () => g.int(1, 9))), k: g.int(0, 2) }),
        ({ M, k }) => allDistinct([M.map((row) => row[k]), M[k], M.map((row, i) => row[i]), M.map((row) => row[(k + 1) % 3])].map(String)),
      );
      return {
        params: { M, k },
        codeSnippet: `grid = ${src2(M)}\nprint([row[${k}] for row in grid])`,
        promptText: PRINTS,
        options: [
          { id: 'a', label: out(pyList(M.map((row) => row[k]))) },
          { id: 'b', label: out(pyList(M[k])), trapExplanation: r`<c>grid[${k}]</c> would be a row; <c>row[${k}]</c> for every row collects a column.` },
          { id: 'c', label: out(pyList(M.map((row, i) => row[i]))), trapExplanation: r`That is the diagonal <c>grid[i][i]</c>; here the column index stays ${k}.` },
          { id: 'd', label: out(pyList(M.map((row) => row[(k + 1) % 3]))), trapExplanation: r`Indices start at 0: <c>row[${k}]</c> is the ${['first', 'second', 'third'][k]} entry.` },
        ],
        stepByStepSolution: [
          r`The comprehension visits the rows ${M.map((row) => `<c>${src(row)}</c>`).join(', ')}.`,
          r`From each it takes the entry at index ${k}.`,
          r`Output: <c>${pyList(M.map((row) => row[k]))}</c>, column ${k} of the grid.`,
        ],
      };
    },
  },
];
