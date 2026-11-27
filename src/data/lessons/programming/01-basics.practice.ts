import type { QuestionTemplate } from '../../../types.ts';
import { r } from '../define.ts';
import { allDistinct } from '../gen.ts';
import { out } from './fmt.ts';

export const WORDS = ['python', 'numpy', 'vector', 'matrix', 'gradient', 'sample', 'random', 'tensor', 'average', 'dataset'];
export const PRINTS = 'What does this code print?';

export const practice: QuestionTemplate[] = [
  {
    id: 'pg-01-1',
    difficulty: 1,
    keyConceptTag: 'Floor division and remainder',
    correctOptionId: 'a',
    generate: (g) => {
      const { a, b } = g.until(() => ({ a: g.int(11, 60), b: g.int(3, 9) }), ({ a, b }) => a % b !== 0 && Math.floor(a / b) !== a % b);
      const [q, rem] = [Math.floor(a / b), a % b];
      return {
        params: { a, b },
        codeSnippet: `a = ${a}\nb = ${b}\nprint(a // b, a % b)`,
        promptText: PRINTS,
        options: [
          { id: 'a', label: out(`${q} ${rem}`) },
          { id: 'b', label: out(`${rem} ${q}`), trapExplanation: r`The quotient <c>a // b</c> is printed first, then the remainder.` },
          { id: 'c', label: out(`${q}.0 ${rem}`), trapExplanation: r`<c>//</c> of two ints is an int; only <c>/</c> produces a float.` },
          { id: 'd', label: out(`${q + 1} ${rem}`), trapExplanation: r`<c>//</c> rounds down, never up: $${a} = ${q}\cdot${b} + ${rem}$.` },
        ],
        stepByStepSolution: [
          r`$${a} = ${q}\cdot${b} + ${rem}$.`,
          r`<c>a // b</c> is the quotient ${q}; <c>a % b</c> is the remainder ${rem}.`,
          r`Output: <c>${q} ${rem}</c>.`,
        ],
      };
    },
  },
  {
    id: 'pg-01-2',
    difficulty: 1,
    keyConceptTag: 'String slicing',
    correctOptionId: 'a',
    generate: (g) => {
      const { w, i, j } = g.until(
        () => {
          const w = g.pick(WORDS);
          const i = g.int(1, w.length - 3);
          return { w, i, j: g.int(i + 2, w.length - 1) };
        },
        ({ w, i, j }) => allDistinct([w.slice(i, j), w.slice(i, j + 1), w.slice(i - 1, j), w.slice(i - 1, j - 1)]),
      );
      return {
        params: { i, j },
        codeSnippet: `s = "${w}"\nprint(s[${i}:${j}])`,
        promptText: PRINTS,
        options: [
          { id: 'a', label: out(w.slice(i, j)) },
          { id: 'b', label: out(w.slice(i, j + 1)), trapExplanation: r`The end of a slice is excluded: <c>s[${i}:${j}]</c> stops before position ${j}.` },
          { id: 'c', label: out(w.slice(i - 1, j)), trapExplanation: r`Positions start at 0, so <c>s[${i}]</c> is the ${i + 1}${i === 0 ? 'st' : i === 1 ? 'nd' : i === 2 ? 'rd' : 'th'} character, <c>${w[i]}</c>.` },
          { id: 'd', label: out(w.slice(i - 1, j - 1)), trapExplanation: r`That counts positions from 1. Python counts from 0.` },
        ],
        stepByStepSolution: [
          r`Number the characters of <c>${w}</c> from 0: ${[...w].map((c, k) => `${k}:<c>${c}</c>`).join(' ')}.`,
          r`<c>s[${i}:${j}]</c> takes positions ${i} to ${j - 1}.`,
          r`Output: <c>${w.slice(i, j)}</c>.`,
        ],
      };
    },
  },
  {
    id: 'pg-01-3',
    difficulty: 2,
    keyConceptTag: 'Negative indices and slices',
    correctOptionId: 'a',
    generate: (g) => {
      const { w, k } = g.until(() => ({ w: g.pick(WORDS), k: g.int(2, 4) }), ({ w, k }) => allDistinct([w.slice(-k), w.slice(0, -k), w[w.length - k], w.slice(k)]));
      return {
        params: { k },
        codeSnippet: `s = "${w}"\nprint(s[-${k}:])`,
        promptText: PRINTS,
        options: [
          { id: 'a', label: out(w.slice(-k)) },
          { id: 'b', label: out(w.slice(0, -k)), trapExplanation: r`<c>s[:-${k}]</c> would drop the last ${k} characters; <c>s[-${k}:]</c> keeps only them.` },
          { id: 'c', label: out(w[w.length - k]), trapExplanation: r`<c>s[-${k}]</c> (no colon) is a single character; the slice runs to the end.` },
          { id: 'd', label: out(w.slice(k)), trapExplanation: r`<c>s[${k}:]</c> starts ${k} from the front; the minus sign counts from the end.` },
        ],
        stepByStepSolution: [
          r`<c>s[-${k}]</c> is the ${k}${k === 2 ? 'nd' : k === 3 ? 'rd' : 'th'} character from the end, <c>${w[w.length - k]}</c>.`,
          r`<c>s[-${k}:]</c> runs from there to the end.`,
          r`Output: <c>${w.slice(-k)}</c>, the last ${k} characters.`,
        ],
      };
    },
  },
  {
    id: 'pg-01-4',
    difficulty: 2,
    keyConceptTag: 'Operator precedence',
    correctOptionId: 'a',
    generate: (g) => {
      const { a, b, c } = g.until(
        () => ({ a: g.int(1, 9), b: g.int(2, 5), c: g.int(2, 4) }),
        ({ a, b, c }) => allDistinct([a + b * c ** 2, (a + b) * c ** 2, (a + b * c) ** 2, a + (b * c) ** 2]),
      );
      return {
        params: { a, b, c },
        codeSnippet: `a, b, c = ${a}, ${b}, ${c}\nprint(a + b * c ** 2)`,
        promptText: PRINTS,
        options: [
          { id: 'a', label: out(a + b * c ** 2) },
          { id: 'b', label: out((a + b) * c ** 2), trapExplanation: r`Multiplication binds tighter than addition: <c>b * c ** 2</c> is computed before adding <c>a</c>.` },
          { id: 'c', label: out((a + b * c) ** 2), trapExplanation: r`<c>**</c> applies only to <c>c</c>, not to the whole expression.` },
          { id: 'd', label: out(a + (b * c) ** 2), trapExplanation: r`<c>**</c> binds tighter than <c>*</c>: it squares <c>c</c> alone.` },
        ],
        stepByStepSolution: [
          r`Powers first: <c>c ** 2</c> = ${c * c}.`,
          r`Then multiplication: <c>b * ${c * c}</c> = ${b * c * c}.`,
          r`Then addition: ${a} + ${b * c * c} = ${a + b * c * c}.`,
        ],
      };
    },
  },
  {
    id: 'pg-01-5',
    difficulty: 3,
    keyConceptTag: 'Floor division with negative numbers',
    correctOptionId: 'a',
    generate: (g) => {
      const { a, b } = g.until(() => ({ a: g.int(7, 40), b: g.int(3, 8) }), ({ a, b }) => a % b !== 0);
      const q = Math.floor(-a / b);
      const rem = -a - b * q;
      const tq = -Math.trunc(a / b);
      const trem = -(a % b);
      return {
        params: { a, b },
        codeSnippet: `print(-${a} // ${b}, -${a} % ${b})`,
        promptText: PRINTS,
        options: [
          { id: 'a', label: out(`${q} ${rem}`) },
          { id: 'b', label: out(`${tq} ${trem}`), trapExplanation: r`That truncates towards zero (as C or Java do). Python's <c>//</c> rounds <i>down</i>, to ${q}, and the remainder is then non-negative.` },
          { id: 'c', label: out(`${q} ${trem}`), trapExplanation: r`The remainder must satisfy <c>-${a} == ${q} * ${b} + r</c>, which gives r = ${rem}.` },
          { id: 'd', label: out(`${tq} ${rem}`), trapExplanation: r`$-${a}/${b} \approx ${(-a / b).toFixed(2)}$ rounds down to ${q}, not ${tq}.` },
        ],
        stepByStepSolution: [
          r`$-${a}/${b} \approx ${(-a / b).toFixed(2)}$; floor division rounds down: ${q}.`,
          r`The remainder satisfies $-${a} = ${q}\cdot${b} + r$, so $r = ${rem}$ (between 0 and ${b - 1}).`,
          r`Output: <c>${q} ${rem}</c>.`,
        ],
      };
    },
  },
  {
    id: 'pg-01-6',
    difficulty: 3,
    keyConceptTag: 'Rounding halves',
    correctOptionId: 'a',
    generate: (g) => {
      const n = 2 * g.int(1, 20);
      const m = n + 1;
      return {
        params: { n },
        codeSnippet: `x = ${n}.5\ny = ${m}.5\nprint(round(x), round(y), int(x))`,
        promptText: PRINTS,
        options: [
          { id: 'a', label: out(`${n} ${m + 1} ${n}`) },
          { id: 'b', label: out(`${n + 1} ${m + 1} ${n}`), trapExplanation: r`Python rounds an exact half to the nearest <i>even</i> number: <c>round(${n}.5)</c> is ${n}.` },
          { id: 'c', label: out(`${n + 1} ${m + 1} ${n + 1}`), trapExplanation: r`<c>int</c> does not round at all: it drops the fractional part.` },
          { id: 'd', label: out(`${n} ${m} ${n}`), trapExplanation: r`For <c>${m}.5</c> the nearest even number is ${m + 1}.` },
        ],
        stepByStepSolution: [
          r`<c>round</c> sends halves to the even neighbour ("banker's rounding"): ${n}.5 → ${n}, ${m}.5 → ${m + 1}.`,
          r`<c>int(${n}.5)</c> truncates to ${n}.`,
          r`Output: <c>${n} ${m + 1} ${n}</c>. This avoids a systematic upward bias when many halves are rounded.`,
        ],
      };
    },
  },
];
