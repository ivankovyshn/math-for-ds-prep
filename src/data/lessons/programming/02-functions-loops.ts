import { defineLesson, r } from '../define.ts';
import { extra } from './02-functions-loops.extra.ts';
import { practice } from './02-functions-loops.practice.ts';

export default defineLesson({
  id: 'pg-02',
  moduleId: 'programming',
  title: 'Functions and loops',
  blurb: 'Reusable code, repetition and decisions',
  minutes: 8,
  lecture: [
    {
      title: 'Functions',
      blocks: [
        {
          kind: 'text',
          text: r`A function packages code under a name. <c>def</c> defines it, the parameters receive the arguments, and <c>return</c> sends a value back to the caller. A parameter with a default (<c>k=2</c>) may be left out. A function without <c>return</c> returns <c>None</c>; printing inside a function is not the same as returning.`,
        },
        {
          kind: 'code',
          code: `def scale(x, k=2):\n    return x * k\n\nprint(scale(5), scale(5, 3))`,
          output: `10 15`,
        },
        {
          kind: 'quiz',
          id: 'pg-02-q1',
          prompt: r`<c>def f(x):</c> has the single line <c>x * 2</c> as its body (no <c>return</c>). What does <c>print(f(3))</c> print?`,
          options: [
            { id: 'a', label: r`<c>None</c>` },
            { id: 'b', label: r`<c>6</c>`, trapExplanation: r`The product is computed and thrown away; without <c>return</c> the function gives back <c>None</c>.` },
            { id: 'c', label: r`<c>3</c>`, trapExplanation: r`The function does not return its argument either; it returns <c>None</c>.` },
          ],
          correctOptionId: 'a',
          explanation: r`No <c>return</c> statement means the call evaluates to <c>None</c>.`,
        },
      ],
    },
    {
      title: 'for loops and range',
      blocks: [
        {
          kind: 'text',
          text: r`<c>for x in items:</c> runs its indented body once per item. <c>range(stop)</c> gives 0, 1, …, stop − 1; <c>range(start, stop, step)</c> starts at <c>start</c> and stops <i>before</i> <c>stop</c>. A typical pattern is the accumulator: start a total at 0 and add to it inside the loop.`,
        },
        {
          kind: 'code',
          code: `total = 0\nfor i in range(1, 6):\n    total += i * i\nprint(total, list(range(0, 10, 3)))`,
          output: `55 [0, 3, 6, 9]`,
        },
        {
          kind: 'quiz',
          id: 'pg-02-q2',
          prompt: r`What does this print? <c>total = 0</c>, then <c>for i in range(1, 5): total += i</c>, then <c>print(total)</c>.`,
          options: [
            { id: 'a', label: r`<c>10</c>` },
            { id: 'b', label: r`<c>15</c>`, trapExplanation: r`<c>range(1, 5)</c> stops before 5: it adds 1 + 2 + 3 + 4.` },
            { id: 'c', label: r`<c>4</c>`, trapExplanation: r`That counts the iterations; the loop adds the values of <c>i</c>.` },
          ],
          correctOptionId: 'a',
          explanation: r`1 + 2 + 3 + 4 = 10.`,
        },
      ],
    },
    {
      title: 'Decisions and while loops',
      blocks: [
        {
          kind: 'text',
          text: r`<c>if</c> / <c>elif</c> / <c>else</c> run the first branch whose condition holds, so the order of the conditions matters. A <c>while</c> loop repeats as long as its condition is true; something in the body must eventually make it false. <c>break</c> leaves a loop at once.`,
        },
        {
          kind: 'code',
          code: `n = 100\nsteps = 0\nwhile n > 1:\n    n = n // 2\n    steps += 1\nprint(steps)`,
          output: `6`,
          caption: r`Halving 100 until it reaches 1: 50, 25, 12, 6, 3, 1, six steps (about $\log_2 100$).`,
        },
        {
          kind: 'quiz',
          id: 'pg-02-q3',
          prompt: r`Starting from <c>n = 20</c>, how many times does <c>n = n // 2</c> run in <c>while n > 1</c>?`,
          options: [
            { id: 'a', label: r`<c>4</c>` },
            { id: 'b', label: r`<c>5</c>`, trapExplanation: r`Trace it: 20 → 10 → 5 → 2 → 1. When <c>n</c> is 1 the condition fails and the loop stops.` },
            { id: 'c', label: r`<c>10</c>`, trapExplanation: r`The loop halves <c>n</c> each time; it does not count down by 1.` },
          ],
          correctOptionId: 'a',
          explanation: r`20 → 10 → 5 → 2 → 1: four halvings.`,
        },
      ],
    },
    {
      title: 'Common traps',
      blocks: [
        {
          kind: 'box',
          variant: 'pitfall',
          title: 'Off by one',
          text: r`<c>range(n)</c> has <c>n</c> values but stops at <c>n - 1</c>; <c>range(1, n)</c> has only <c>n - 1</c> values. Most loop bugs are one iteration too many or too few. Check the first and last iteration by hand.`,
        },
        {
          kind: 'box',
          variant: 'pitfall',
          title: 'Mutable default arguments',
          text: r`A default value is created <i>once</i>, when the function is defined. With <c>def add(x, acc=[])</c>, every call that leaves out <c>acc</c> appends to the same list, which keeps growing between calls. Use <c>acc=None</c> and create a new list inside the function.`,
        },
        {
          kind: 'text',
          text: r`Variables assigned inside a function are <i>local</i>: they disappear when the function returns and do not change variables of the same name outside.`,
        },
      ],
    },
    {
      title: 'Summary',
      blocks: [
        {
          kind: 'text',
          text: r`• <c>def f(x, k=2): return …</c>; no <c>return</c> means <c>None</c>.

• <c>range(a, b, s)</c> starts at <c>a</c>, steps by <c>s</c>, stops before <c>b</c>.

• <c>if</c>/<c>elif</c>/<c>else</c>: the first true branch wins. <c>while</c> repeats until its condition fails; <c>break</c> exits.

• Watch for off-by-one errors and mutable default arguments.`,
        },
      ],
    },
  ],
  extra,
  questions: practice,
});
