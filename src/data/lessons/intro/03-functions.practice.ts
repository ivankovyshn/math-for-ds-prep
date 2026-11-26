import type { QuestionTemplate, Rng } from '../../../types.ts';
import { r } from '../define.ts';
import { allDistinct, paren, shuffle, signed } from '../gen.ts';

/**
 * Function pools. scripts/verify.mjs keeps the same lists, in the same order, as JavaScript functions
 * (INJ / NONINJ / SURJ / NONSURJ) and checks every property independently.
 */
export const INJECTIVE = ['x^3', '2x + 1', 'e^x', 'x^3 + x', '-3x + 2', 'x^5'];
export const NOT_INJECTIVE = [
  { f: 'x^2', why: r`$f(-2) = f(2) = 4$: two inputs share an output.` },
  { f: '|x|', why: r`$|-1| = |1|$. Any even function fails injectivity.` },
  { f: '\\sin x', why: r`$\sin 0 = \sin\pi = 0$. A periodic function repeats every value infinitely often.` },
  { f: '\\cos x', why: r`$\cos 0 = \cos 2\pi = 1$. A periodic function repeats its values.` },
  { f: 'x^2 + 1', why: r`$f(-1) = f(1) = 2$: two inputs share an output.` },
  { f: 'x^3 - x', why: r`$f(-1) = f(0) = f(1) = 0$: three inputs share the output 0.` },
];
export const SURJECTIVE = ['x^3', '2x - 1', 'x^3 - x', '-x + 4', 'x^5'];
export const NOT_SURJECTIVE = [
  { f: 'x^2', why: r`$x^2 \ge 0$, so negative values such as $-1$ are never taken.` },
  { f: 'e^x', why: r`$e^x > 0$ for every $x$: zero and the negative numbers are missed.` },
  { f: '\\sin x', why: r`$\sin x$ stays between $-1$ and $1$, so a value like 2 is never reached.` },
  { f: '|x|', why: r`$|x| \ge 0$: negative values are never taken.` },
  { f: 'x^2 + 1', why: r`$x^2 + 1 \ge 1$: every value below 1 is missed.` },
  { f: '\\arctan x', why: r`$\arctan x$ stays strictly between $-\tfrac{\pi}{2}$ and $\tfrac{\pi}{2}$, so 2 is never reached.` },
];

/** Maps ℤ → ℤ and their properties, for "injective / surjective" classification. */
export const Z_MAPS = [
  { f: (k: number) => `n + ${k}`, inj: true, surj: true, injWhy: (k: number) => r`$n + ${k} = m + ${k}$ forces $n = m$.`, surjWhy: (k: number) => r`Every integer $m$ is hit: $f(m - ${k}) = m$.` },
  { f: (k: number) => `${k}n`, inj: true, surj: false, injWhy: (k: number) => r`$${k}n_1 = ${k}n_2$ forces $n_1 = n_2$.`, surjWhy: (k: number) => r`$1$ is never hit: $${k}n = 1$ has no integer solution.` },
  { f: () => `n^2`, inj: false, surj: false, injWhy: () => r`$f(-1) = f(1) = 1$: two inputs share an output.`, surjWhy: () => r`Negative integers such as $-1$ are never hit.` },
  { f: (k: number) => `\\lfloor n/${k} \\rfloor`, inj: false, surj: true, injWhy: () => r`$f(0) = f(1) = 0$: two inputs share an output.`, surjWhy: (k: number) => r`Every integer $m$ is hit: $f(${k}m) = m$.` },
];
const CATEGORIES = ['Bijective', 'Injective but not surjective', 'Surjective but not injective', 'Neither injective nor surjective'];
const categoryOf = (inj: boolean, surj: boolean) => (inj && surj ? 0 : inj ? 1 : surj ? 2 : 3);
const catProps = [[true, true], [true, false], [false, true], [false, false]];

/** Classify a map ℤ → ℤ. The correct category is option a; the other three follow in a fixed order. */
export function classifyZ(g: Rng, kinds: number[]) {
  const kind = g.pick(kinds);
  const k = g.int(2, 4);
  const m = Z_MAPS[kind];
  const aCat = categoryOf(m.inj, m.surj);
  const others = [0, 1, 2, 3].filter((c) => c !== aCat);
  const trap = (c: number) => (catProps[c][0] !== m.inj ? m.injWhy(k) : m.surjWhy(k));
  return {
    params: { kind, k, aCat },
    promptText: r`Consider $f: \mathbb{Z} \to \mathbb{Z}$, $f(n) = ${m.f(k)}$. Which statement is true?`,
    options: [
      { id: 'a', label: CATEGORIES[aCat] },
      ...others.map((c, i) => ({ id: 'bcd'[i], label: CATEGORIES[c], trapExplanation: trap(c) })),
    ],
    stepByStepSolution: [
      r`Injective? ${m.injWhy(k)} So ${m.inj ? 'yes' : 'no'}.`,
      r`Surjective? ${m.surjWhy(k)} So ${m.surj ? 'yes' : 'no'}.`,
      r`Together: ${CATEGORIES[aCat].toLowerCase()}. The codomain matters: the same rule on $\mathbb{R}$ may behave differently.`,
    ],
  };
}

/** One function with the property and three without, each with its own reason. */
export function pickProperty(g: Rng, good: string[], bad: { f: string; why: string }[], question: string) {
  const gi = g.int(0, good.length - 1);
  const bi = shuffle(g, bad.map((_, i) => i)).slice(0, 3);
  return {
    params: { good: gi, bad: bi },
    promptText: question,
    options: [
      { id: 'a', label: `$f(x) = ${good[gi]}$` },
      ...bi.map((b, i) => ({ id: 'bcd'[i], label: `$f(x) = ${bad[b].f}$`, trapExplanation: bad[b].why })),
    ],
  };
}

const fact = (n: number): number => (n <= 1 ? 1 : n * fact(n - 1));
export const perm = (n: number, k: number) => fact(n) / fact(n - k);
export const choose = (n: number, k: number) => perm(n, k) / fact(k);

export const practice: QuestionTemplate[] = [
  {
    id: 'ml-03-1',
    difficulty: 1,
    keyConceptTag: 'Composition order',
    correctOptionId: 'a',
    generate: (g) => {
      const { a, b, x } = g.until(
        () => ({ a: g.int(1, 5), b: g.int(2, 4), x: g.nonzero(-3, 4) }),
        ({ a, b, x }) => allDistinct([b * (x * x + a), (b * x) ** 2 + a, x * x + a, b * x * x + a]),
      );
      const fx = x * x + a;
      return {
        params: { a, b, x },
        promptText: r`Let $f(x) = x^2 + ${a}$ and $g(x) = ${b}x$. Compute $(g \circ f)(${x})$.`,
        options: [
          { id: 'a', label: `$${b * fx}$`, value: b * fx },
          { id: 'b', label: `$${(b * x) ** 2 + a}$`, value: (b * x) ** 2 + a, trapExplanation: r`$${(b * x) ** 2 + a} = f(g(${x}))$: the order is reversed. $g \circ f$ applies $f$ first.` },
          { id: 'c', label: `$${fx}$`, value: fx, trapExplanation: r`$${fx} = f(${x})$ is only the first step. Then $g$ multiplies it by ${b}.` },
          { id: 'd', label: `$${b * x * x + a}$`, value: b * x * x + a, trapExplanation: r`$${b}\cdot ${x * x} + ${a}$ scales $x^2$ before adding ${a}. $g$ acts on the whole output $f(${x}) = ${fx}$.` },
        ],
        stepByStepSolution: [
          r`$(g \circ f)(${x}) = g(f(${x}))$ — first $f$.`,
          r`$f(${x}) = ${x * x} + ${a} = ${fx}$.`,
          r`$g(${fx}) = ${b * fx}$.`,
        ],
      };
    },
  },
  {
    id: 'ml-03-2',
    difficulty: 1,
    keyConceptTag: 'Injectivity',
    correctOptionId: 'a',
    generate: (g) => {
      const base = pickProperty(g, INJECTIVE, NOT_INJECTIVE, r`Which function $\mathbb{R} \to \mathbb{R}$ is injective?`);
      const f = INJECTIVE[base.params.good];
      return {
        ...base,
        stepByStepSolution: [
          r`Injective: $f(x_1) = f(x_2)$ forces $x_1 = x_2$.`,
          r`$f(x) = ${f}$ is strictly monotonic, so different inputs give different outputs; every horizontal line meets its graph at most once.`,
          r`Each of the other three has two different inputs with the same output.`,
        ],
      };
    },
  },
  {
    id: 'ml-03-3',
    difficulty: 2,
    keyConceptTag: 'Finding an inverse',
    correctOptionId: 'a',
    generate: (g) => {
      // f(x) = (ax + b)/(x - c), inverse (cx + b)/(x - a); needs ac + b ≠ 0.
      const { a, b, c, t } = g.until(
        () => ({ a: g.int(1, 4), b: g.nonzero(-4, 4), c: g.int(1, 5), t: g.int(-3, 6) }),
        ({ a, b, c, t }) => {
          if (a === c || a * c + b === 0 || t === c || (a * t + b) % (t - c) !== 0) return false;
          const y = (a * t + b) / (t - c);
          // The wrong formulas must visibly fail at the test point used in their explanations.
          return y !== a && y + a !== 0 && a * y - b !== 0 && (c * y - b) / (y + a) !== t && (y + c) / (a * y - b) !== t;
        },
      );
      const y = (a * t + b) / (t - c);
      const fr = (num: string, den: string) => r`$f^{-1}(x) = \dfrac{${num}}{${den}}$`;
      return {
        params: { a, b, c },
        promptText: r`Find the inverse of $f(x) = \dfrac{${a === 1 ? '' : a}x ${signed(b)}}{x - ${c}}$ (for $x \ne ${c}$, values $\ne ${a}$).`,
        options: [
          { id: 'a', label: fr(`${c === 1 ? '' : c}x ${signed(b)}`, `x - ${a}`) },
          { id: 'b', label: fr(`x - ${c}`, `${a === 1 ? '' : a}x ${signed(b)}`), trapExplanation: r`This is $1/f(x)$, the reciprocal. The inverse undoes $f$ — check: it does not return $x$ when applied to $f(x)$.` },
          { id: 'c', label: fr(`${c === 1 ? '' : c}x ${signed(-b)}`, `x + ${a}`), trapExplanation: r`Signs slipped when collecting the $x$ terms. Test $x = ${t}$: $f(${t}) = ${y}$, and this formula does not return ${t}.` },
          { id: 'd', label: fr(`x + ${c}`, `${a === 1 ? '' : a}x ${signed(-b)}`), trapExplanation: r`Swapping signs and positions does not invert. Solve $y = f(x)$ for $x$ instead; test $f(${t}) = ${y}$.` },
        ],
        stepByStepSolution: [
          r`$y = f(x)$ gives $y(x - ${c}) = ${a === 1 ? '' : a}x ${signed(b)}$, i.e. $xy - ${c}y = ${a === 1 ? '' : a}x ${signed(b)}$.`,
          r`Collect $x$: $x(y - ${a}) = ${c === 1 ? '' : c}y ${signed(b)}$, so $x = \dfrac{${c === 1 ? '' : c}y ${signed(b)}}{y - ${a}}$.`,
          r`Check with $x = ${t}$: $f(${t}) = ${y}$ and $\dfrac{${c}\cdot ${paren(y)} ${signed(b)}}{${y} - ${a}} = ${t}$. ✓`,
        ],
      };
    },
  },
  {
    id: 'ml-03-4',
    difficulty: 2,
    keyConceptTag: 'Counting functions',
    correctOptionId: 'a',
    generate: (g) => {
      const { n, m } = g.until(
        () => ({ n: g.int(2, 4), m: g.int(2, 4) }),
        ({ n, m }) => allDistinct([m ** n, n ** m, n * m, m >= n ? perm(m, n) : 0]),
      );
      const inj = m >= n ? perm(m, n) : 0;
      const X = Array.from({ length: n }, (_, i) => i + 1).join(', ');
      const Y = 'abcd'.slice(0, m).split('').join(', ');
      return {
        params: { n, m },
        promptText: r`How many functions are there from $\{${X}\}$ to $\{${Y}\}$?`,
        options: [
          { id: 'a', label: `$${m ** n}$`, value: m ** n },
          { id: 'b', label: `$${n ** m}$`, value: n ** m, trapExplanation: r`$${n}^${m}$ would count functions from a ${m}-element set to a ${n}-element set. Here each of ${n} inputs picks one of ${m} outputs: $${m}^${n}$.` },
          { id: 'c', label: `$${n * m}$`, value: n * m, trapExplanation: r`$${n} \cdot ${m}$ counts pairs (input, output), i.e. $|X \times Y|$. A function makes a choice for <i>every</i> input at once.` },
          { id: 'd', label: `$${inj}$`, value: inj, trapExplanation: inj === 0 ? r`That is the number of <i>injective</i> functions: ${n} inputs cannot get different outputs from only ${m}. Ordinary functions may repeat outputs.` : r`That is the number of <i>injective</i> functions. Ordinary functions may repeat outputs.` },
        ],
        stepByStepSolution: [
          r`Each of the ${n} inputs has ${m} possible outputs.`,
          r`The choices are independent: $${Array(n).fill(m).join(' \\cdot ')}$.`,
          r`$${m}^${n} = ${m ** n}$ functions.`,
        ],
      };
    },
  },
  {
    id: 'ml-03-5',
    difficulty: 3,
    keyConceptTag: 'Counting injections',
    correctOptionId: 'a',
    generate: (g) => {
      const { k, n } = g.until(
        () => ({ k: g.int(2, 3), n: g.int(4, 6) }),
        ({ k, n }) => allDistinct([perm(n, k), n ** k, choose(n, k), k ** n]),
      );
      return {
        params: { k, n },
        promptText: r`How many <i>injective</i> functions are there from a ${k}-element set to a ${n}-element set?`,
        options: [
          { id: 'a', label: `$${perm(n, k)}$`, value: perm(n, k) },
          { id: 'b', label: `$${n ** k}$`, value: n ** k, trapExplanation: r`$${n}^${k}$ counts all functions, including those that repeat an output.` },
          { id: 'c', label: `$${choose(n, k)}$`, value: choose(n, k), trapExplanation: r`$\binom{${n}}{${k}} = ${choose(n, k)}$ counts which ${k} outputs are used, but not which input goes to which. Multiply by $${k}! = ${fact(k)}$.` },
          { id: 'd', label: `$${k ** n}$`, value: k ** n, trapExplanation: r`$${k}^${n}$ has base and exponent swapped: it counts functions from the ${n}-element set to the ${k}-element set.` },
        ],
        stepByStepSolution: [
          r`The first input has ${n} possible outputs.`,
          r`Each next input must avoid the outputs already used: ${Array.from({ length: k }, (_, i) => n - i).join(', ')} choices.`,
          r`$${Array.from({ length: k }, (_, i) => n - i).join(' \\cdot ')} = ${perm(n, k)}$.`,
        ],
      };
    },
  },
  {
    id: 'ml-03-6',
    difficulty: 3,
    keyConceptTag: 'Injective vs surjective',
    correctOptionId: 'a',
    generate: (g) => classifyZ(g, [1, 2, 3]),
  },
];
