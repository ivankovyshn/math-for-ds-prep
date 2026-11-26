import type { QuestionTemplate } from '../../../types.ts';
import { r } from '../define.ts';
import { allDistinct, frac, paren, shuffle, signed } from '../gen.ts';
import { NOT_SURJECTIVE, SURJECTIVE, classifyZ, perm, pickProperty } from './03-functions.practice.ts';

/** Extra practice (Practice 2): gentler questions on the same ideas, with new numbers every time. */
export const extra: QuestionTemplate[] = [
  {
    id: 'ml-03-x1',
    difficulty: 1,
    keyConceptTag: 'Composition order',
    correctOptionId: 'a',
    generate: (g) => {
      const { a, b, x } = g.until(
        () => ({ a: g.int(2, 5), b: g.int(-4, 4), x: g.nonzero(-3, 3) }),
        ({ a, b, x }) => allDistinct([a * x * x + b, (a * x + b) ** 2, (a * x + b) * x * x, a * x + b + x * x]),
      );
      const fx = a * x + b;
      return {
        params: { a, b, x },
        promptText: r`Let $f(x) = ${a}x ${b === 0 ? '' : signed(b)}$ and $g(x) = x^2$. Compute $(f \circ g)(${x})$.`,
        options: [
          { id: 'a', label: `$${a * x * x + b}$`, value: a * x * x + b },
          { id: 'b', label: `$${fx ** 2}$`, value: fx ** 2, trapExplanation: r`$${fx ** 2}$ is $(g \circ f)(${x}) = g(${fx})$. In $f \circ g$ the function written on the right, $g$, acts first.` },
          { id: 'c', label: `$${fx * x * x}$`, value: fx * x * x, trapExplanation: r`That is the product $f(${x}) \cdot g(${x})$. Composition feeds one output into the other function.` },
          { id: 'd', label: `$${fx + x * x}$`, value: fx + x * x, trapExplanation: r`That is the sum $f(${x}) + g(${x})$, not a composition.` },
        ],
        stepByStepSolution: [
          r`$(f \circ g)(${x}) = f(g(${x}))$: apply $g$ first.`,
          r`$g(${x}) = ${paren(x)}^2 = ${x * x}$.`,
          r`$f(${x * x}) = ${a} \cdot ${x * x} ${b === 0 ? '' : signed(b)} = ${a * x * x + b}$.`,
        ],
      };
    },
  },
  {
    id: 'ml-03-x2',
    difficulty: 1,
    keyConceptTag: 'Surjectivity',
    correctOptionId: 'a',
    generate: (g) => {
      const base = pickProperty(g, SURJECTIVE, NOT_SURJECTIVE, r`Which function $\mathbb{R} \to \mathbb{R}$ is surjective (takes every real value)?`);
      const f = SURJECTIVE[base.params.good];
      return {
        ...base,
        stepByStepSolution: [
          r`Surjective means: every $y \in \mathbb{R}$ equals $f(x)$ for some $x$.`,
          r`$f(x) = ${f}$ is continuous and runs from $-\infty$ to $+\infty$ (or back), so by the intermediate value theorem it passes every real value.`,
          r`Each of the other three misses some values.`,
        ],
      };
    },
  },
  {
    id: 'ml-03-x3',
    difficulty: 1,
    keyConceptTag: 'Finding an inverse',
    correctOptionId: 'a',
    generate: (g) => {
      const [a, b] = [g.pick([2, 3, 4, 5, -2, -3]), g.nonzero(-6, 6)];
      const lin = `${a}x ${signed(b)}`;
      const inv = (num: string) => r`$f^{-1}(x) = \dfrac{${num}}{${a}}$`;
      const x0 = g.int(-3, 3);
      return {
        params: { a, b },
        promptText: r`What is the inverse of $f(x) = ${lin}$?`,
        options: [
          { id: 'a', label: inv(`x ${signed(-b)}`) },
          { id: 'b', label: inv(`x ${signed(b)}`), trapExplanation: r`To undo "${b < 0 ? 'subtract' : 'add'} ${Math.abs(b)}" you must ${b < 0 ? 'add' : 'subtract'} ${Math.abs(b)}. Check: $f(${x0}) = ${a * x0 + b}$, but this formula does not send ${a * x0 + b} back to ${x0}.` },
          { id: 'c', label: r`$f^{-1}(x) = \dfrac{1}{${lin}}$`, trapExplanation: r`$f^{-1}$ is the inverse <i>function</i> (undo $f$), not the reciprocal $1/f(x)$.` },
          { id: 'd', label: r`$f^{-1}(x) = ${a}x ${signed(-b)}$`, trapExplanation: r`The operations must be undone in reverse order: first undo the ${b < 0 ? 'subtraction' : 'addition'}, then divide by ${a}.` },
        ],
        stepByStepSolution: [
          r`Write $y = ${a}x ${signed(b)}$ and solve for $x$.`,
          r`$y ${signed(-b)} = ${a}x$, so $x = \dfrac{y ${signed(-b)}}{${a}}$.`,
          r`Rename the variable: $f^{-1}(x) = \dfrac{x ${signed(-b)}}{${a}}$. Check: $f^{-1}(f(${x0})) = f^{-1}(${a * x0 + b}) = ${frac(a * x0 + b - b, a)}$.`,
        ],
      };
    },
  },
  {
    id: 'ml-03-x4',
    difficulty: 2,
    keyConceptTag: 'Counting functions',
    correctOptionId: 'a',
    generate: (g) => {
      const { m, n } = g.until(
        () => ({ m: g.int(2, 3), n: g.int(2, 5) }),
        ({ m, n }) => allDistinct([n ** m, m ** n, n >= m ? perm(n, m) : 0, m + n]),
      );
      const X = Array.from({ length: m }, (_, i) => i + 1).join(', ');
      const Y = 'abcde'.slice(0, n).split('').join(', ');
      const inj = n >= m ? perm(n, m) : 0;
      return {
        params: { n: m, m: n },
        promptText: r`How many functions are there from $\{${X}\}$ to $\{${Y}\}$?`,
        options: [
          { id: 'a', label: `${n ** m}`, value: n ** m },
          { id: 'b', label: `${m ** n}`, value: m ** n, trapExplanation: r`$${m}^${n}$ swaps the roles: it counts functions from a ${n}-element set to a ${m}-element set.` },
          { id: 'c', label: `${inj}`, value: inj, trapExplanation: r`${inj} counts the <i>injective</i> functions. A function may send two inputs to the same letter.` },
          { id: 'd', label: `${m + n}`, value: m + n, trapExplanation: r`Adding the set sizes does not count anything useful here; choices multiply.` },
        ],
        stepByStepSolution: [
          r`A function picks one value in the second set for each element of the first.`,
          r`${n} choices for each of the ${m} inputs, independently.`,
          r`$${n}^${m} = ${n ** m}$. In general there are $|B|^{|A|}$ functions $A \to B$.`,
        ],
      };
    },
  },
  {
    id: 'ml-03-x5',
    difficulty: 2,
    keyConceptTag: 'Inverse function',
    correctOptionId: 'a',
    generate: (g) => {
      const { f, t } = g.until(
        () => {
          const n = g.int(3, 4);
          return { f: shuffle(g, Array.from({ length: n }, (_, i) => i + 1)), t: g.int(1, n) };
        },
        ({ f, t }) => {
          const pre = f.indexOf(t) + 1;
          return allDistinct([pre, f[t - 1], t, -1]);
        },
      );
      const pre = f.indexOf(t) + 1;
      const n = f.length;
      return {
        params: { f, t },
        promptText: r`A function $f: \{1, \dots, ${n}\} \to \{1, \dots, ${n}\}$ has ${f.map((v, i) => `$f(${i + 1}) = ${v}$`).join(', ')}. What is $f^{-1}(${t})$?`,
        options: [
          { id: 'a', label: `${pre}`, value: pre },
          { id: 'b', label: `${f[t - 1]}`, value: f[t - 1], trapExplanation: r`${f[t - 1]} is $f(${t})$. The inverse asks the opposite question: which input is sent to ${t}?` },
          { id: 'c', label: `${t}`, value: t, trapExplanation: r`$f(${t}) = ${f[t - 1]}$, not ${t}, so ${t} is not the preimage of ${t}.` },
          { id: 'd', label: 'It does not exist', value: -1, trapExplanation: r`$f$ is a bijection (each value is hit exactly once), so the inverse exists.` },
        ],
        stepByStepSolution: [
          r`$f^{-1}(${t})$ is the input $x$ with $f(x) = ${t}$.`,
          r`Scan the table: $f(${pre}) = ${t}$.`,
          r`So $f^{-1}(${t}) = ${pre}$. The inverse simply reads the arrows backwards.`,
        ],
      };
    },
  },
  {
    id: 'ml-03-x6',
    difficulty: 2,
    keyConceptTag: 'Injective vs surjective',
    correctOptionId: 'a',
    generate: (g) => classifyZ(g, [0, 1, 2, 3]),
  },
];
