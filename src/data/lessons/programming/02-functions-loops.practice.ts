import type { QuestionTemplate } from '../../../types.ts';
import { r } from '../define.ts';
import { allDistinct } from '../gen.ts';
import { out, pyList } from './fmt.ts';
import { PRINTS } from './01-basics.practice.ts';

const sumRange = (a: number, b: number) => ((a + b - 1) * (b - a)) / 2;

export const practice: QuestionTemplate[] = [
  {
    id: 'pg-02-1',
    difficulty: 1,
    keyConceptTag: 'Summing over a range',
    correctOptionId: 'a',
    generate: (g) => {
      const { a, b } = g.until(() => ({ a: g.int(1, 6), b: g.int(6, 14) }), ({ a, b }) => b - a >= 3 && allDistinct([sumRange(a, b), sumRange(a, b + 1), sumRange(a + 1, b), b - a]));
      return {
        params: { a, b },
        codeSnippet: `total = 0\nfor i in range(${a}, ${b}):\n    total += i\nprint(total)`,
        promptText: PRINTS,
        options: [
          { id: 'a', label: out(sumRange(a, b)) },
          { id: 'b', label: out(sumRange(a, b + 1)), trapExplanation: r`<c>range(${a}, ${b})</c> stops before ${b}; ${b} is not added.` },
          { id: 'c', label: out(sumRange(a + 1, b)), trapExplanation: r`The range starts at ${a} itself.` },
          { id: 'd', label: out(b - a), trapExplanation: r`${b - a} is the number of iterations; the loop adds the values.` },
        ],
        stepByStepSolution: [
          r`<c>i</c> takes the values ${a}, ${a + 1}, …, ${b - 1}.`,
          r`Their sum is $\frac{(${a} + ${b - 1})\cdot${b - a}}{2}$.`,
          r`Output: <c>${sumRange(a, b)}</c>.`,
        ],
      };
    },
  },
  {
    id: 'pg-02-2',
    difficulty: 1,
    keyConceptTag: 'Default arguments',
    correctOptionId: 'a',
    generate: (g) => {
      const { x, d, k, c } = g.until(
        () => ({ x: g.int(2, 9), d: g.int(2, 4), k: g.int(5, 9), c: g.int(1, 9) }),
        ({ x, d, k, c }) => allDistinct([[x * d + c, x * k + c], [x * d + c, x * d + c], [x + c, x * k + c], [x * k + c, x * d + c]].map(String)),
      );
      return {
        params: { x, d, k, c },
        codeSnippet: `def f(x, k=${d}):\n    return x * k + ${c}\n\nprint(f(${x}), f(${x}, ${k}))`,
        promptText: PRINTS,
        options: [
          { id: 'a', label: out(`${x * d + c} ${x * k + c}`) },
          { id: 'b', label: out(`${x * d + c} ${x * d + c}`), trapExplanation: r`A passed argument overrides the default: the second call uses <c>k = ${k}</c>.` },
          { id: 'c', label: out(`${x + c} ${x * k + c}`), trapExplanation: r`If <c>k</c> is left out it takes its default ${d}, not 1.` },
          { id: 'd', label: out(`${x * k + c} ${x * d + c}`), trapExplanation: r`The first call has no second argument, so it uses the default <c>k = ${d}</c>.` },
        ],
        stepByStepSolution: [
          r`<c>f(${x})</c> uses <c>k = ${d}</c>: ${x}·${d} + ${c} = ${x * d + c}.`,
          r`<c>f(${x}, ${k})</c> uses <c>k = ${k}</c>: ${x}·${k} + ${c} = ${x * k + c}.`,
          r`Output: <c>${x * d + c} ${x * k + c}</c>.`,
        ],
      };
    },
  },
  {
    id: 'pg-02-3',
    difficulty: 2,
    keyConceptTag: 'Tracing a while loop',
    correctOptionId: 'a',
    generate: (g) => {
      const { n0, d } = g.until(
        () => ({ n0: g.int(30, 200), d: g.pick([2, 3]) }),
        ({ n0, d }) => {
          let m = n0;
          while (m > 1) m = Math.floor(m / d);
          return m === 1;
        },
      );
      let n = n0;
      let steps = 0;
      while (n > 1) {
        n = Math.floor(n / d);
        steps++;
      }
      return {
        params: { n0, d },
        codeSnippet: `n = ${n0}\nsteps = 0\nwhile n > 1:\n    n = n // ${d}\n    steps += 1\nprint(steps, n)`,
        promptText: PRINTS,
        options: [
          { id: 'a', label: out(`${steps} ${n}`) },
          { id: 'b', label: out(`${steps + 1} ${n}`), trapExplanation: r`Once <c>n</c> is ${n} the condition <c>n > 1</c> fails, and the loop stops without another step.` },
          { id: 'c', label: out(`${steps - 1} ${n}`), trapExplanation: r`Trace it fully: the last division that brings <c>n</c> to ${n} also counts.` },
          { id: 'd', label: out(`${steps} 0`), trapExplanation: r`The loop stops as soon as <c>n</c> is no longer above 1, so it never reaches 0.` },
        ],
        stepByStepSolution: [
          r`Trace <c>n</c>: ${(() => {
            const seq = [n0];
            let m = n0;
            while (m > 1) seq.push((m = Math.floor(m / d)));
            return seq.join(' → ');
          })()}.`,
          r`That is ${steps} divisions; then <c>n = ${n}</c> fails <c>n > 1</c>.`,
          r`Output: <c>${steps} ${n}</c>.`,
        ],
      };
    },
  },
  {
    id: 'pg-02-4',
    difficulty: 2,
    keyConceptTag: 'if / elif / else',
    correctOptionId: 'a',
    generate: (g) => {
      const intended = (s: number) => (s >= 90 ? 'A' : s >= 75 ? 'B' : s >= 50 ? 'C' : 'D');
      const x = g.int(75, 100);
      const y = g.int(20, 49);
      return {
        params: { x, y },
        codeSnippet: `def grade(s):\n    if s >= 50:\n        return "C"\n    elif s >= 75:\n        return "B"\n    elif s >= 90:\n        return "A"\n    else:\n        return "D"\n\nprint(grade(${x}), grade(${y}))`,
        promptText: PRINTS,
        options: [
          { id: 'a', label: out(`C D`) },
          { id: 'b', label: out(`${intended(x)} D`), trapExplanation: r`That is what the author intended, but the branches are tried from the top: ${x} >= 50 is already true, so <c>"C"</c> is returned before the other tests are reached.` },
          { id: 'c', label: out(`D C`), trapExplanation: r`The first value printed is <c>grade(${x})</c>.` },
          { id: 'd', label: out(`C C`), trapExplanation: r`${y} is below 50, so none of the conditions hold and the <c>else</c> branch returns <c>"D"</c>.` },
        ],
        stepByStepSolution: [
          r`<c>grade(${x})</c>: the first condition <c>${x} >= 50</c> is true, so it returns <c>"C"</c>; the <c>elif</c> branches are never checked.`,
          r`<c>grade(${y})</c>: all three conditions are false, so <c>else</c> returns <c>"D"</c>.`,
          r`Output: <c>C D</c>. The <c>elif</c> tests should go from the highest threshold down.`,
        ],
      };
    },
  },
  {
    id: 'pg-02-5',
    difficulty: 3,
    keyConceptTag: 'Nested loops',
    correctOptionId: 'a',
    generate: (g) => {
      const n = g.int(4, 12);
      return {
        params: { n },
        codeSnippet: `count = 0\nfor i in range(${n}):\n    for j in range(i):\n        count += 1\nprint(count)`,
        promptText: PRINTS,
        options: [
          { id: 'a', label: out((n * (n - 1)) / 2) },
          { id: 'b', label: out(n * n), trapExplanation: r`The inner loop runs <c>i</c> times, not ${n} times.` },
          { id: 'c', label: out((n * (n + 1)) / 2), trapExplanation: r`<c>i</c> goes only up to ${n - 1}, and <c>range(i)</c> has <c>i</c> values: 0 + 1 + … + ${n - 1}.` },
          { id: 'd', label: out(n * (n - 1)), trapExplanation: r`Each pair <c>j < i</c> is counted once, so divide by 2.` },
        ],
        stepByStepSolution: [
          r`For <c>i</c> = 0, 1, …, ${n - 1} the inner loop runs <c>i</c> times.`,
          r`Total: $0 + 1 + \dots + ${n - 1} = \frac{${n}\cdot${n - 1}}{2}$.`,
          r`Output: <c>${(n * (n - 1)) / 2}</c>, the number of pairs $j < i$.`,
        ],
      };
    },
  },
  {
    id: 'pg-02-6',
    difficulty: 3,
    keyConceptTag: 'Mutable default arguments',
    correctOptionId: 'a',
    generate: (g) => {
      const { a, b, c } = g.until(() => ({ a: g.int(1, 9), b: g.int(1, 9), c: g.int(1, 9) }), ({ a, b, c }) => allDistinct([a, b, c]));
      return {
        params: { a, b, c },
        codeSnippet: `def add(x, acc=[]):\n    acc.append(x)\n    return acc\n\nadd(${a})\nadd(${b})\nprint(add(${c}))`,
        promptText: PRINTS,
        options: [
          { id: 'a', label: out(pyList([a, b, c])) },
          { id: 'b', label: out(pyList([c])), trapExplanation: r`The default list is created once, when <c>def</c> runs; every call without <c>acc</c> appends to that same list.` },
          { id: 'c', label: out(pyList([b, c])), trapExplanation: r`The first call already appended ${a} to the shared default list.` },
          { id: 'd', label: out(pyList([a])), trapExplanation: r`Each call appends; the list keeps growing.` },
        ],
        stepByStepSolution: [
          r`<c>acc=[]</c> is evaluated once; all three calls share that list.`,
          r`After <c>add(${a})</c> and <c>add(${b})</c> it holds <c>${pyList([a, b])}</c>.`,
          r`<c>add(${c})</c> appends ${c} and returns <c>${pyList([a, b, c])}</c>. Use <c>acc=None</c> to avoid this.`,
        ],
      };
    },
  },
];
