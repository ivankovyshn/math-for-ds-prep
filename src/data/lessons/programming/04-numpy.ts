import { defineLesson, r } from '../define.ts';
import { extra } from './04-numpy.extra.ts';
import { practice } from './04-numpy.practice.ts';

export default defineLesson({
  id: 'pg-04',
  moduleId: 'programming',
  title: 'NumPy and vectorisation',
  blurb: 'Arrays, shapes, axes and broadcasting instead of loops',
  minutes: 8,
  lecture: [
    {
      title: 'Arrays',
      blocks: [
        {
          kind: 'text',
          text: r`NumPy (<c>import numpy as np</c>) provides the <i>array</i>: a grid of numbers of one type. Arithmetic on arrays works element by element and runs in compiled code, typically 10 to 100 times faster than a Python loop. Note the difference from lists: <c>+</c> concatenates lists but adds arrays.`,
        },
        {
          kind: 'code',
          code: `import numpy as np\n\nx = np.array([1, 2, 3])\nprint(x * 2, x + x, x ** 2)\nprint([1, 2, 3] * 2)`,
          output: `[2 4 6] [2 4 6] [1 4 9]\n[1, 2, 3, 1, 2, 3]`,
          caption: r`Arrays print without commas; lists print with them.`,
        },
        {
          kind: 'quiz',
          id: 'pg-04-q1',
          prompt: r`What does <c>print(np.array([1, 2, 3]) * 2)</c> print?`,
          options: [
            { id: 'a', label: r`<c>[2 4 6]</c>` },
            { id: 'b', label: r`<c>[1, 2, 3, 1, 2, 3]</c>`, trapExplanation: r`That is what a Python <i>list</i> does with <c>* 2</c>; an array multiplies each element.` },
            { id: 'c', label: r`<c>[1 2 3 1 2 3]</c>`, trapExplanation: r`Arrays do arithmetic element by element; they do not repeat.` },
          ],
          correctOptionId: 'a',
          explanation: r`Each element is doubled.`,
        },
      ],
    },
    {
      title: 'Shapes',
      blocks: [
        {
          kind: 'text',
          text: r`Every array has a <c>shape</c>, a tuple of sizes per dimension: a vector of 5 numbers has shape <c>(5,)</c>, a 3 × 4 matrix <c>(3, 4)</c>. <c>np.arange(n)</c> gives 0, …, n − 1; <c>reshape</c> rearranges the same numbers into a new shape, and one size may be <c>-1</c> to let NumPy work it out. <c>A.T</c> transposes.`,
        },
        {
          kind: 'code',
          code: `A = np.arange(6).reshape(2, 3)\nprint(A)\nprint(A.shape, A.T.shape, A.size)`,
          output: `[[0 1 2]\n [3 4 5]]\n(2, 3) (3, 2) 6`,
        },
        {
          kind: 'quiz',
          id: 'pg-04-q2',
          prompt: r`What is <c>np.arange(12).reshape(3, -1).shape</c>?`,
          options: [
            { id: 'a', label: r`<c>(3, 4)</c>` },
            { id: 'b', label: r`<c>(4, 3)</c>`, trapExplanation: r`The first size is the 3 you gave; <c>-1</c> fills in the second.` },
            { id: 'c', label: r`<c>(3, -1)</c>`, trapExplanation: r`<c>-1</c> is replaced by the size that makes the total 12.` },
          ],
          correctOptionId: 'a',
          explanation: r`12 numbers in 3 rows: 4 columns.`,
        },
      ],
    },
    {
      title: 'Aggregating along an axis',
      blocks: [
        {
          kind: 'text',
          text: r`<c>sum</c>, <c>mean</c>, <c>max</c>, <c>argmax</c> and friends work on the whole array or along an axis. <c>axis=0</c> collapses the rows: you get one result per <i>column</i>. <c>axis=1</c> collapses the columns: one result per <i>row</i>. A data matrix has one row per example, so <c>X.mean(axis=0)</c> is the vector of feature means.`,
        },
        {
          kind: 'code',
          code: `A = np.array([[1, 2, 3],\n              [4, 5, 6]])\nprint(A.sum(), A.sum(axis=0), A.sum(axis=1))`,
          output: `21 [5 7 9] [ 6 15]`,
          caption: r`NumPy pads entries to a common width, hence the space in <c>[ 6 15]</c>.`,
        },
        {
          kind: 'quiz',
          id: 'pg-04-q3',
          prompt: r`<c>A</c> has shape <c>(4, 5)</c>. What is <c>A.sum(axis=0).shape</c>?`,
          options: [
            { id: 'a', label: r`<c>(5,)</c>` },
            { id: 'b', label: r`<c>(4,)</c>`, trapExplanation: r`<c>axis=0</c> is the axis that disappears: the 4 rows are summed, leaving one value per column.` },
            { id: 'c', label: r`<c>(4, 5)</c>`, trapExplanation: r`Summing along an axis removes it.` },
          ],
          correctOptionId: 'a',
          explanation: r`The axis of length 4 is summed away, leaving 5 column sums.`,
        },
      ],
    },
    {
      title: 'Broadcasting and masks',
      blocks: [
        {
          kind: 'text',
          text: r`Arrays of different shapes can be combined when their shapes are compatible. Compare the shapes from the right: two sizes match if they are equal or one of them is 1, and a missing dimension counts as 1. Size-1 dimensions are stretched. So <c>(3, 4) + (4,)</c> adds a row vector to every row, <c>(3, 1) + (1, 4)</c> gives <c>(3, 4)</c>, but <c>(3, 4) + (3,)</c> fails with a <c>ValueError</c>.`,
        },
        {
          kind: 'code',
          code: `X = np.array([[1, 2], [3, 4], [5, 6]])\nprint(X - X.mean(axis=0))\nx = np.array([4, -1, 7, 0, 2])\nprint(x[x > 1], (x > 1).sum(), (x > 1).mean())`,
          output: `[[-2. -2.]\n [ 0.  0.]\n [ 2.  2.]]\n[4 7 2] 3 0.6`,
          caption: r`Centring the columns by broadcasting, then a boolean mask: <c>x > 1</c> is an array of True/False that selects, counts and gives a share.`,
        },
        {
          kind: 'box',
          variant: 'tip',
          title: 'Think in whole arrays',
          text: r`Whenever you are about to write a loop over the entries of an array, look for the vectorised form: <c>np.sum</c>, a mask, broadcasting or a matrix product. It is shorter, faster and closer to the mathematics.`,
        },
      ],
    },
    {
      title: 'Summary',
      blocks: [
        {
          kind: 'text',
          text: r`• Arrays compute element-wise; <c>+</c> adds arrays but concatenates lists.

• <c>shape</c> is a tuple; <c>reshape</c> rearranges, <c>-1</c> is inferred.

• <c>axis=0</c> gives one result per column, <c>axis=1</c> per row.

• Broadcasting compares shapes from the right (equal or 1); masks like <c>x[x > 0]</c> select entries.`,
        },
      ],
    },
  ],
  extra,
  questions: practice,
});
