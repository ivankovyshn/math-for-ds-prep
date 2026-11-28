import { defineLesson, r } from '../define.ts';
import { extra } from './03-data-structures.extra.ts';
import { practice } from './03-data-structures.practice.ts';

export default defineLesson({
  id: 'pg-03',
  moduleId: 'programming',
  title: 'Data structures',
  blurb: 'Lists, dictionaries, sets and comprehensions',
  minutes: 8,
  lecture: [
    {
      title: 'Lists',
      covers: ['6', 'x1', 'x2'],
      blocks: [
        {
          kind: 'text',
          text: r`A list holds an ordered sequence of values: <c>xs = [3, 1, 2]</c>. Indexing and slicing work as for strings, but lists can be changed: <c>xs.append(5)</c> adds at the end, <c>xs.pop()</c> removes the last item (<c>xs.pop(0)</c> the first), <c>xs[0] = 9</c> replaces an item. <c>sorted(xs)</c> returns a new sorted list; <c>xs.sort()</c> sorts in place and returns <c>None</c>.`,
        },
        {
          kind: 'code',
          code: `xs = [3, 1, 2]\nxs.append(5)\nprint(xs, len(xs), sorted(xs), xs[-2:])`,
          output: `[3, 1, 2, 5] 4 [1, 2, 3, 5] [2, 5]`,
        },
        {
          kind: 'quiz',
          id: 'pg-03-q1',
          prompt: r`<c>xs = [4, 7, 1]</c>, then <c>xs.append(6)</c>. What does <c>print(xs[-1] + len(xs))</c> print?`,
          options: [
            { id: 'a', label: r`<c>10</c>` },
            { id: 'b', label: r`<c>9</c>`, trapExplanation: r`After the append the list has 4 elements, and the last one is 6.` },
            { id: 'c', label: r`<c>4</c>`, trapExplanation: r`<c>xs[-1]</c> is the new last element, 6, not 1.` },
          ],
          correctOptionId: 'a',
          explanation: r`<c>xs</c> is <c>[4, 7, 1, 6]</c>: 6 + 4 = 10.`,
        },
      ],
    },
    {
      title: 'Names and copies',
      covers: ['3'],
      blocks: [
        {
          kind: 'text',
          text: r`Assignment never copies a list. After <c>b = a</c> both names refer to the <i>same</i> list, so changing it through <c>b</c> changes what <c>a</c> shows. To get an independent copy use <c>a[:]</c>, <c>list(a)</c> or <c>a.copy()</c>.`,
        },
        {
          kind: 'code',
          code: `a = [1, 2]\nb = a\nc = a[:]\nb.append(3)\nprint(a, c)`,
          output: `[1, 2, 3] [1, 2]`,
        },
        {
          kind: 'quiz',
          id: 'pg-03-q2',
          prompt: r`<c>a = [1, 2]</c>, <c>b = a</c>, <c>b.append(3)</c>. What does <c>print(a)</c> print?`,
          options: [
            { id: 'a', label: r`<c>[1, 2, 3]</c>` },
            { id: 'b', label: r`<c>[1, 2]</c>`, trapExplanation: r`<c>b = a</c> does not copy: <c>a</c> and <c>b</c> are two names for one list.` },
            { id: 'c', label: r`<c>[3]</c>`, trapExplanation: r`<c>append</c> adds to the existing list.` },
          ],
          correctOptionId: 'a',
          explanation: r`The append went into the one shared list.`,
        },
      ],
    },
    {
      title: 'Dictionaries and sets',
      covers: ['2', '5', 'x3', 'x4'],
      blocks: [
        {
          kind: 'text',
          text: r`A dictionary maps keys to values: <c>ages = {"ana": 31, "bo": 25}</c>, <c>ages["bo"]</c> is 25. <c>d.get(k, 0)</c> returns 0 instead of failing when <c>k</c> is missing, which makes counting easy. A set keeps only distinct values and supports <c>|</c> (union), <c>&</c> (intersection) and <c>-</c> (difference).`,
        },
        {
          kind: 'code',
          code: `counts = {}\nfor w in ["a", "b", "a", "c", "a"]:\n    counts[w] = counts.get(w, 0) + 1\nprint(counts["a"], len(counts), set("hello") == set("olleh"))`,
          output: `3 3 True`,
        },
        {
          kind: 'quiz',
          id: 'pg-03-q3',
          prompt: r`What does <c>print(len(set("banana")))</c> print?`,
          options: [
            { id: 'a', label: r`<c>3</c>` },
            { id: 'b', label: r`<c>6</c>`, trapExplanation: r`A set keeps each distinct character once: <c>b</c>, <c>a</c>, <c>n</c>.` },
            { id: 'c', label: r`<c>1</c>`, trapExplanation: r`<c>set</c> of a string takes its characters, not the whole word.` },
          ],
          correctOptionId: 'a',
          explanation: r`The distinct letters are b, a, n.`,
        },
      ],
    },
    {
      title: 'Comprehensions and sorting',
      covers: ['1', '4', 'x5', 'x6'],
      blocks: [
        {
          kind: 'text',
          text: r`A list comprehension builds a list in one line: <c>[x ** 2 for x in xs if x % 2 == 0]</c> squares the even items. The same works for dictionaries (<c>{k: v for …}</c>) and sets. <c>zip(xs, ys)</c> walks two sequences in step (stopping at the shorter one), <c>enumerate(xs)</c> gives (index, value) pairs, and <c>sorted(xs, key=f)</c> sorts by <c>f(x)</c>.`,
        },
        {
          kind: 'code',
          code: `xs = [5, -2, 8, -7]\nprint([x * x for x in xs if x > 0])\nprint(sorted(xs, key=abs))\nprint([i for i, x in enumerate(xs) if x < 0])`,
          output: `[25, 64]\n[-2, 5, -7, 8]\n[1, 3]`,
        },
        {
          kind: 'box',
          variant: 'tip',
          title: 'Which structure?',
          text: r`List: order matters, duplicates allowed. Dict: look things up by a key (counts, configurations, a row of named fields). Set: fast membership tests and removing duplicates. Tuple: a fixed record such as a shape <c>(3, 4)</c>.`,
        },
        {
          kind: 'code',
          code: `names = ["a", "b", "c"]\nscores = [90, 75]\nprint(list(zip(names, scores)))\nfor i, n in enumerate(names, start=1):\n    print(i, n)`,
          output: `[('a', 90), ('b', 75)]\n1 a\n2 b\n3 c`,
          caption: r`<c>zip</c> stops at the shorter list; <c>enumerate</c> pairs each item with its position.`,
        },
      ],
    },
    {
      title: 'Summary',
      blocks: [
        {
          kind: 'text',
          text: r`• Lists are mutable: <c>append</c>, <c>pop</c>, item assignment; <c>sorted</c> makes a new list.

• <c>b = a</c> shares one list; copy with <c>a[:]</c> or <c>list(a)</c>.

• Dicts map keys to values (<c>get</c> with a default for counting); sets keep distinct values.

• Comprehensions, <c>zip</c>, <c>enumerate</c> and <c>sorted(key=…)</c> replace most hand-written loops.`,
        },
      ],
    },
  ],
  extra,
  questions: practice,
});
