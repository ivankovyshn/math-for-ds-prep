import type { QuestionTemplate } from '../../../types.ts';
import { r } from '../define.ts';
import { allDistinct, shuffle } from '../gen.ts';
import { out } from './fmt.ts';
import { PRINTS, WORDS } from './01-basics.practice.ts';

const TYPES = ['int', 'float', 'str', 'bool'];
const cls = (t: string) => `<class '${t}'>`;

/** Extra practice (Practice 2): gentler questions on the same ideas, with new numbers every time. */
export const extra: QuestionTemplate[] = [
  {
    id: 'pg-01-x1',
    difficulty: 1,
    keyConceptTag: 'Types of values',
    correctOptionId: 'a',
    generate: (g) => {
      const a = g.int(2, 9);
      const b = g.int(2, 9);
      const exprs: [string, number, string][] = [
        [`${a * b} / ${b}`, 1, '<c>/</c> always returns a float, even for an exact division.'],
        [`${a} // ${b}`, 0, '<c>//</c> of two ints is an int.'],
        [`${a} * ${b}`, 0, 'The product of two ints is an int.'],
        [`${a} * 1.0`, 1, 'Any arithmetic with a float gives a float.'],
        [`str(${a}) + "${b}"`, 2, 'Joining two strings gives a string.'],
        [`${a} > ${b}`, 3, 'A comparison gives a bool.'],
        [`len("${g.pick(WORDS)}")`, 0, '<c>len</c> returns an int.'],
      ];
      const [e, t, why] = g.pick(exprs);
      const order = [t, ...shuffle(g, [0, 1, 2, 3].filter((x) => x !== t))];
      return {
        params: { t },
        codeSnippet: `print(type(${e}))`,
        promptText: PRINTS,
        options: order.map((k, i) => ({ id: 'abcd'[i], label: out(cls(TYPES[k])), ...(i === 0 ? {} : { trapExplanation: why }) })),
        stepByStepSolution: [
          r`Evaluate <c>${e}</c> first.`,
          why,
          r`Output: <c>${cls(TYPES[t])}</c>.`,
        ],
      };
    },
  },
  {
    id: 'pg-01-x2',
    difficulty: 1,
    keyConceptTag: 'String operators',
    correctOptionId: 'a',
    generate: (g) => {
      const s = g.pick(['ab', 'xy', 'na', 'ha', 'go']);
      const n = g.int(2, 4);
      return {
        params: { n },
        codeSnippet: `s = "${s}"\nprint(s * ${n} + "!")`,
        promptText: PRINTS,
        options: [
          { id: 'a', label: out(`${s.repeat(n)}!`) },
          { id: 'b', label: out(`${s}${n}!`), trapExplanation: r`<c>*</c> with a string and an int repeats the string; it does not append the digit.` },
          { id: 'c', label: out(`${s.repeat(n)}`), trapExplanation: r`<c>+ "!"</c> adds the exclamation mark at the end.` },
          { id: 'd', label: out(`${(s + '!').repeat(n)}`), trapExplanation: r`<c>*</c> binds tighter than <c>+</c>: the repetition happens first, then <c>"!"</c> is added once.` },
        ],
        stepByStepSolution: [
          r`<c>s * ${n}</c> repeats the string: <c>${s.repeat(n)}</c>.`,
          r`Then <c>+ "!"</c> appends one character.`,
          r`Output: <c>${s.repeat(n)}!</c>.`,
        ],
      };
    },
  },
  {
    id: 'pg-01-x3',
    difficulty: 1,
    keyConceptTag: 'Length of a string',
    correctOptionId: 'a',
    generate: (g) => {
      const { w1, w2 } = g.until(
        () => ({ w1: g.pick(WORDS), w2: g.pick(WORDS) }),
        ({ w1, w2 }) => w1 !== w2 && allDistinct([w2[w2.length - 1], w2[w2.length - 2], w1[0]]),
      );
      const s = `${w1} ${w2}`;
      return {
        params: { n: s.length },
        codeSnippet: `s = "${s}"\nprint(len(s), s[-1])`,
        promptText: PRINTS,
        options: [
          { id: 'a', label: out(`${s.length} ${s[s.length - 1]}`) },
          { id: 'b', label: out(`${s.length - 1} ${s[s.length - 1]}`), trapExplanation: r`The space counts as a character too.` },
          { id: 'c', label: out(`${s.length} ${s[s.length - 2]}`), trapExplanation: r`<c>s[-1]</c> is the very last character.` },
          { id: 'd', label: out(`${s.length} ${s[0]}`), trapExplanation: r`<c>s[-1]</c> counts from the end, not the start.` },
        ],
        stepByStepSolution: [
          r`<c>${w1}</c> has ${w1.length} characters, the space 1, <c>${w2}</c> ${w2.length}: ${s.length} in total.`,
          r`<c>s[-1]</c> is the last character, <c>${s[s.length - 1]}</c>.`,
          r`Output: <c>${s.length} ${s[s.length - 1]}</c>.`,
        ],
      };
    },
  },
  {
    id: 'pg-01-x4',
    difficulty: 2,
    keyConceptTag: 'Formatting floats',
    correctOptionId: 'a',
    generate: (g) => {
      const { a, b } = g.until(() => ({ a: g.int(1, 30), b: g.pick([3, 6, 7, 9, 11]) }), ({ a, b }) => a % b !== 0 && allDistinct([(a / b).toFixed(2), (Math.floor((a / b) * 100) / 100).toFixed(2), (a / b).toFixed(1)]));
      const x = a / b;
      return {
        params: { a, b },
        codeSnippet: `x = ${a} / ${b}\nprint(f"{x:.2f}")`,
        promptText: PRINTS,
        options: [
          { id: 'a', label: out(x.toFixed(2)) },
          { id: 'b', label: out((Math.floor(x * 100) / 100).toFixed(2)), trapExplanation: r`<c>:.2f</c> rounds to two decimals; it does not cut off.` },
          { id: 'c', label: out(x.toFixed(1)), trapExplanation: r`<c>.2f</c> means two digits after the point.` },
          { id: 'd', label: out(`${Math.floor(x)}`), trapExplanation: r`<c>/</c> keeps the fraction; the f-string then shows two decimals.` },
        ],
        stepByStepSolution: [
          r`$\frac{${a}}{${b}} = ${x.toFixed(5)}\ldots$`,
          r`<c>:.2f</c> rounds to two decimal places.`,
          r`Output: <c>${x.toFixed(2)}</c>.`,
        ],
      };
    },
  },
  {
    id: 'pg-01-x5',
    difficulty: 2,
    keyConceptTag: 'Boolean expressions',
    correctOptionId: 'a',
    generate: (g) => {
      const x = g.int(1, 15);
      const [lo, hi, t] = [g.int(2, 6), g.int(8, 12), g.int(5, 10)];
      const p = x > lo && x < hi;
      const q = x % 2 === 0 || x > t;
      const B = (v: boolean) => (v ? 'True' : 'False');
      const combos = [[p, q], [!p, q], [p, !q], [!p, !q]];
      return {
        params: { x },
        codeSnippet: `x = ${x}\nprint(x > ${lo} and x < ${hi}, x % 2 == 0 or x > ${t})`,
        promptText: PRINTS,
        options: combos.map(([u, v], i) => ({
          id: 'abcd'[i],
          label: out(`${B(u)} ${B(v)}`),
          ...(i === 0 ? {} : { trapExplanation: r`Check each part: ${x} > ${lo} is ${B(x > lo)}, ${x} < ${hi} is ${B(x < hi)}; ${x} % 2 == 0 is ${B(x % 2 === 0)}, ${x} > ${t} is ${B(x > t)}.` }),
        })),
        stepByStepSolution: [
          r`<c>and</c> needs both parts: <c>${x} > ${lo}</c> is ${B(x > lo)} and <c>${x} < ${hi}</c> is ${B(x < hi)}, so ${B(p)}.`,
          r`<c>or</c> needs one: <c>${x} % 2 == 0</c> is ${B(x % 2 === 0)} and <c>${x} > ${t}</c> is ${B(x > t)}, so ${B(q)}.`,
          r`Output: <c>${B(p)} ${B(q)}</c>.`,
        ],
      };
    },
  },
  {
    id: 'pg-01-x6',
    difficulty: 2,
    keyConceptTag: 'Chained comparisons',
    correctOptionId: 'a',
    generate: (g) => {
      const [a, b, c] = [g.int(1, 9), g.int(1, 9), g.int(0, 3)];
      const chain = a < b && b < c;
      const grouped = Number(a < b) < c;
      const B = (v: boolean) => (v ? 'True' : 'False');
      const combos = [[chain, grouped], [!chain, grouped], [chain, !grouped], [!chain, !grouped]];
      return {
        params: { a, b, c },
        codeSnippet: `a, b, c = ${a}, ${b}, ${c}\nprint(a < b < c, (a < b) < c)`,
        promptText: PRINTS,
        options: combos.map(([u, v], i) => ({
          id: 'abcd'[i],
          label: out(`${B(u)} ${B(v)}`),
          ...(i === 0 ? {} : { trapExplanation: r`<c>a < b < c</c> means <c>a < b and b < c</c>; <c>(a < b) < c</c> compares a bool (counted as ${Number(a < b)}) with ${c}.` }),
        })),
        stepByStepSolution: [
          r`Chain: <c>${a} < ${b}</c> is ${B(a < b)} and <c>${b} < ${c}</c> is ${B(b < c)}, so ${B(chain)}.`,
          r`Grouped: <c>(${a} < ${b})</c> is ${B(a < b)}, which compares as ${Number(a < b)}; <c>${Number(a < b)} < ${c}</c> is ${B(grouped)}.`,
          r`Output: <c>${B(chain)} ${B(grouped)}</c>.`,
        ],
      };
    },
  },
];
