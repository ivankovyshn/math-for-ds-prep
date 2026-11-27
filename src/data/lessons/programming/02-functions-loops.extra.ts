import type { QuestionTemplate } from '../../../types.ts';
import { r } from '../define.ts';
import { allDistinct } from '../gen.ts';
import { out, pyList } from './fmt.ts';
import { PRINTS } from './01-basics.practice.ts';

const rng = (a: number, b: number, s = 1) => {
  const xs: number[] = [];
  for (let x = a; x < b; x += s) xs.push(x);
  return xs;
};

/** Extra practice (Practice 2): gentler questions on the same ideas, with new numbers every time. */
export const extra: QuestionTemplate[] = [
  {
    id: 'pg-02-x1',
    difficulty: 1,
    keyConceptTag: 'How many values in a range',
    correctOptionId: 'a',
    generate: (g) => {
      const { a, b, s } = g.until(() => ({ a: g.int(0, 5), b: g.int(12, 30), s: g.int(2, 5) }), ({ a, b, s }) => (b - a) % s !== 0 && allDistinct([rng(a, b, s).length, Math.floor((b - a) / s), b - a, rng(a, b, s).length + 1]));
      const n = rng(a, b, s).length;
      return {
        params: { a, b, s },
        codeSnippet: `print(len(range(${a}, ${b}, ${s})))`,
        promptText: PRINTS,
        options: [
          { id: 'a', label: out(n) },
          { id: 'b', label: out(Math.floor((b - a) / s)), trapExplanation: r`Count the values: the first is ${a} itself, so the count rounds up, $\lceil ${b - a}/${s} \rceil$.` },
          { id: 'c', label: out(b - a), trapExplanation: r`That ignores the step ${s}.` },
          { id: 'd', label: out(n + 1), trapExplanation: r`The stop value ${b} is never included.` },
        ],
        stepByStepSolution: [
          r`The values are ${rng(a, b, s).join(', ')}.`,
          r`The next one, ${a + n * s}, is not below ${b}.`,
          r`Output: <c>${n}</c>.`,
        ],
      };
    },
  },
  {
    id: 'pg-02-x2',
    difficulty: 1,
    keyConceptTag: 'range as a list',
    correctOptionId: 'a',
    generate: (g) => {
      const a = g.int(1, 5);
      const b = a + g.int(3, 5);
      return {
        params: { a, b },
        codeSnippet: `print(list(range(${a}, ${b})))`,
        promptText: PRINTS,
        options: [
          { id: 'a', label: out(pyList(rng(a, b))) },
          { id: 'b', label: out(pyList(rng(a, b + 1))), trapExplanation: r`The stop value ${b} is excluded.` },
          { id: 'c', label: out(pyList(rng(0, b))), trapExplanation: r`With two arguments the first is the start, ${a}.` },
          { id: 'd', label: out(pyList(rng(a + 1, b + 1))), trapExplanation: r`The range starts at ${a} itself.` },
        ],
        stepByStepSolution: [
          r`<c>range(${a}, ${b})</c> starts at ${a}.`,
          r`It stops before ${b}.`,
          r`Output: <c>${pyList(rng(a, b))}</c>.`,
        ],
      };
    },
  },
  {
    id: 'pg-02-x3',
    difficulty: 1,
    keyConceptTag: 'Calling a function',
    correctOptionId: 'a',
    generate: (g) => {
      const { a, b } = g.until(() => ({ a: g.int(1, 6), b: g.int(1, 6) }), ({ a, b }) => allDistinct([a * a + b * b - 2, (a + b) ** 2 - 1, a * a - 1, 2 * a + 2 * b - 2]));
      const f = (x: number) => x * x - 1;
      return {
        params: { a, b },
        codeSnippet: `def f(x):\n    return x ** 2 - 1\n\nprint(f(${a}) + f(${b}))`,
        promptText: PRINTS,
        options: [
          { id: 'a', label: out(f(a) + f(b)) },
          { id: 'b', label: out(f(a + b)), trapExplanation: r`<c>f(${a}) + f(${b})</c> calls <c>f</c> twice; it is not <c>f(${a + b})</c>.` },
          { id: 'c', label: out(f(a)), trapExplanation: r`Both calls contribute.` },
          { id: 'd', label: out(2 * a + 2 * b - 2), trapExplanation: r`<c>**</c> is a power: <c>x ** 2</c> is $x^2$, not $2x$.` },
        ],
        stepByStepSolution: [
          r`<c>f(${a})</c> = ${a}² − 1 = ${f(a)}.`,
          r`<c>f(${b})</c> = ${b}² − 1 = ${f(b)}.`,
          r`Output: <c>${f(a) + f(b)}</c>.`,
        ],
      };
    },
  },
  {
    id: 'pg-02-x4',
    difficulty: 2,
    keyConceptTag: 'Printing is not returning',
    correctOptionId: 'a',
    generate: (g) => {
      const a = g.int(2, 9);
      const k = g.int(2, 5);
      return {
        params: { a, k },
        codeSnippet: `def f(x):\n    print(x * ${k})\n\ny = f(${a})\nprint(y)`,
        promptText: PRINTS,
        options: [
          { id: 'a', label: out(`${a * k}\nNone`) },
          { id: 'b', label: out(`${a * k}\n${a * k}`), trapExplanation: r`<c>f</c> prints the product but returns nothing, so <c>y</c> is <c>None</c>.` },
          { id: 'c', label: out('None'), trapExplanation: r`Calling <c>f(${a})</c> runs its <c>print</c> first.` },
          { id: 'd', label: out(`${a * k}`), trapExplanation: r`The last line prints <c>y</c> as well, and <c>y</c> is <c>None</c>.` },
        ],
        stepByStepSolution: [
          r`<c>y = f(${a})</c> runs the body, which prints ${a * k}.`,
          r`There is no <c>return</c>, so <c>y</c> is <c>None</c>.`,
          r`<c>print(y)</c> prints <c>None</c> on a second line.`,
        ],
      };
    },
  },
  {
    id: 'pg-02-x5',
    difficulty: 2,
    keyConceptTag: 'Leaving a loop with break',
    correctOptionId: 'a',
    generate: (g) => {
      const t = g.int(10, 90);
      const first = Math.floor(Math.sqrt(t)) + 1;
      return {
        params: { t },
        codeSnippet: `for i in range(1, 20):\n    if i * i > ${t}:\n        break\nprint(i)`,
        promptText: PRINTS,
        options: [
          { id: 'a', label: out(first) },
          { id: 'b', label: out(first - 1), trapExplanation: r`<c>${first - 1}² = ${(first - 1) ** 2}</c> is not above ${t}; the loop breaks at the first <c>i</c> whose square is.` },
          { id: 'c', label: out(19), trapExplanation: r`<c>break</c> stops the loop early, and <c>i</c> keeps the value it had then.` },
          { id: 'd', label: out(first * first), trapExplanation: r`The loop prints <c>i</c>, not <c>i * i</c>.` },
        ],
        stepByStepSolution: [
          r`The loop tries <c>i</c> = 1, 2, 3, … and stops at the first <c>i</c> with <c>i * i > ${t}</c>.`,
          r`${first - 1}² = ${(first - 1) ** 2} ≤ ${t}, but ${first}² = ${first * first} > ${t}.`,
          r`Output: <c>${first}</c>.`,
        ],
      };
    },
  },
  {
    id: 'pg-02-x6',
    difficulty: 2,
    keyConceptTag: 'Loops with conditions',
    correctOptionId: 'a',
    generate: (g) => {
      const n = g.int(6, 15);
      const ev = rng(0, n).filter((x) => x % 2 === 0);
      const od = rng(0, n).filter((x) => x % 2 === 1);
      const sum = (xs: number[]) => xs.reduce((s, x) => s + x, 0);
      return {
        params: { n },
        codeSnippet: `total = 0\nfor x in range(${n}):\n    if x % 2 == 0:\n        total += x\nprint(total)`,
        promptText: PRINTS,
        options: [
          { id: 'a', label: out(sum(ev)) },
          { id: 'b', label: out(sum(od)), trapExplanation: r`<c>x % 2 == 0</c> is true for <i>even</i> numbers.` },
          { id: 'c', label: out(ev.length), trapExplanation: r`The loop adds the values, not 1 per match.` },
          { id: 'd', label: out(sum(ev) + sum(od)), trapExplanation: r`The <c>if</c> lets only the even values through; that total adds every number below ${n}.` },
        ],
        stepByStepSolution: [
          r`The even numbers below ${n}: ${ev.join(', ')}.`,
          r`Their sum is ${sum(ev)}.`,
          r`Output: <c>${sum(ev)}</c>.`,
        ],
      };
    },
  },
];
