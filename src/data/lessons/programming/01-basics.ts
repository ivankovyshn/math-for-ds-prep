import { defineLesson, r } from '../define.ts';
import { extra } from './01-basics.extra.ts';
import { practice } from './01-basics.practice.ts';

export default defineLesson({
  id: 'pg-01',
  moduleId: 'programming',
  title: 'Python basics',
  blurb: 'Values, types, arithmetic and strings: reading Python precisely',
  minutes: 7,
  lecture: [
    {
      title: 'Values, variables and types',
      blocks: [
        {
          kind: 'text',
          text: r`A Python program manipulates <i>values</i>, and every value has a <i>type</i>: <c>int</c> (whole numbers), <c>float</c> (decimals), <c>str</c> (text) and <c>bool</c> (<c>True</c> or <c>False</c>). The statement <c>x = 7</c> makes the name <c>x</c> refer to the value 7; <c>print</c> shows values, and <c>type</c> tells you their type.`,
        },
        {
          kind: 'code',
          code: `x = 7\ny = 2.5\nname = "Ada"\nprint(x * y, type(x), type(name))`,
          output: `17.5 <class 'int'> <class 'str'>`,
        },
        {
          kind: 'quiz',
          id: 'pg-01-q1',
          prompt: r`What does <c>print(type(6 / 3))</c> print?`,
          options: [
            { id: 'a', label: r`<c><class 'float'></c>` },
            { id: 'b', label: r`<c><class 'int'></c>`, trapExplanation: r`The operator <c>/</c> always produces a float in Python 3, even when the division is exact: <c>6 / 3</c> is <c>2.0</c>.` },
            { id: 'c', label: r`<c>2</c>`, trapExplanation: r`<c>type</c> reports the type of the value, not the value itself.` },
          ],
          correctOptionId: 'a',
          explanation: r`<c>6 / 3</c> is <c>2.0</c>, a float.`,
        },
      ],
    },
    {
      title: 'Arithmetic',
      blocks: [
        {
          kind: 'text',
          text: r`• <c>/</c> is true division and always returns a float: <c>7 / 2</c> is <c>3.5</c>.

• <c>//</c> is floor division: it rounds <i>down</i>, so <c>7 // 2</c> is <c>3</c> and <c>-7 // 2</c> is <c>-4</c>.

• <c>%</c> is the remainder that goes with it: <c>a == (a // b) * b + a % b</c>, and for positive <c>b</c> the remainder is never negative.

• <c>**</c> is a power and binds tighter than <c>*</c>: <c>2 * 3 ** 2</c> is 18.`,
        },
        {
          kind: 'quiz',
          id: 'pg-01-q2',
          prompt: r`What does <c>print(17 // 5, 17 % 5)</c> print?`,
          options: [
            { id: 'a', label: r`<c>3 2</c>` },
            { id: 'b', label: r`<c>3.4 2</c>`, trapExplanation: r`<c>//</c> drops the fractional part; <c>3.4</c> would be <c>17 / 5</c>.` },
            { id: 'c', label: r`<c>2 3</c>`, trapExplanation: r`The quotient comes first: 17 = 3·5 + 2.` },
          ],
          correctOptionId: 'a',
          explanation: r`$17 = 3\cdot5 + 2$: quotient 3, remainder 2.`,
        },
      ],
    },
    {
      title: 'Strings',
      blocks: [
        {
          kind: 'text',
          text: r`Strings are sequences of characters. <c>+</c> joins them, <c>*</c> repeats them, <c>len</c> counts characters. Positions start at 0, and negative positions count from the end: <c>s[-1]</c> is the last character. A slice <c>s[a:b]</c> takes positions <c>a</c> up to but <i>not including</i> <c>b</c>; omitted ends mean "from the start" or "to the end". F-strings insert values: <c>f"{x:.2f}"</c> formats <c>x</c> with two decimals.`,
        },
        {
          kind: 'code',
          code: `s = "statistics"\nprint(s[0], s[-1], s[1:4], len(s))\nprint(f"{2 / 3:.2f}")`,
          output: `s s tat 10\n0.67`,
        },
        {
          kind: 'quiz',
          id: 'pg-01-q3',
          prompt: r`<c>s = "python"</c>. What does <c>print(s[1:4])</c> print?`,
          options: [
            { id: 'a', label: r`<c>yth</c>` },
            { id: 'b', label: r`<c>ytho</c>`, trapExplanation: r`The end position 4 is excluded: positions 1, 2, 3.` },
            { id: 'c', label: r`<c>pyt</c>`, trapExplanation: r`Positions start at 0, so position 1 is <c>y</c>.` },
          ],
          correctOptionId: 'a',
          explanation: r`Positions 1, 2, 3 of <c>python</c> are <c>y</c>, <c>t</c>, <c>h</c>.`,
        },
      ],
    },
    {
      title: 'Booleans and comparisons',
      blocks: [
        {
          kind: 'text',
          text: r`Comparisons (<c>==</c>, <c>!=</c>, <c><</c>, <c><=</c> …) produce <c>True</c> or <c>False</c>, combined with <c>and</c>, <c>or</c>, <c>not</c>. Python allows chains: <c>0 < x < 10</c> means <c>0 < x and x < 10</c>.`,
        },
        {
          kind: 'box',
          variant: 'pitfall',
          title: 'Floats are approximations',
          text: r`<c>0.1 + 0.2 == 0.3</c> is <c>False</c>: decimals like 0.1 have no exact binary representation, and the tiny errors show up in equality tests. Compare floats with a tolerance, e.g. <c>abs(a - b) < 1e-9</c> or <c>math.isclose(a, b)</c>. Also note <c>round(2.5)</c> is 2: Python rounds halves to the nearest even number.`,
        },
        {
          kind: 'box',
          variant: 'tip',
          title: 'Read code like a computer',
          text: r`The questions in this module ask what code prints. Trace it line by line, writing down each variable's value; most mistakes come from guessing instead of tracing.`,
        },
      ],
    },
    {
      title: 'Summary',
      blocks: [
        {
          kind: 'text',
          text: r`• Types: <c>int</c>, <c>float</c>, <c>str</c>, <c>bool</c>; <c>type(x)</c> tells which.

• <c>/</c> gives a float; <c>//</c> floors; <c>%</c> is the matching remainder; <c>**</c> binds tightest.

• Strings index from 0, <c>s[-1]</c> is last, <c>s[a:b]</c> excludes <c>b</c>.

• Chained comparisons work; never test floats with <c>==</c>.`,
        },
      ],
    },
  ],
  extra,
  questions: practice,
});
