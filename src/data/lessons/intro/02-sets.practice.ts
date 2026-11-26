import type { QuestionTemplate, Rng } from '../../../types.ts';
import { r } from '../define.ts';
import { allDistinct, shuffle } from '../gen.ts';

/** A set of numbers as TeX: {1, 2, 3}; the empty set as ∅. */
export const set = (xs: number[]) => (xs.length ? `\\{${[...xs].sort((a, b) => a - b).join(', ')}\\}` : '\\varnothing');
export const sorted = (xs: number[]) => [...xs].sort((a, b) => a - b);
/** Two random sets from {1, …, 9} that overlap but neither contains the other. */
export function twoSets(g: Rng) {
  return g.until(
    () => {
      const U = shuffle(g, [1, 2, 3, 4, 5, 6, 7, 8, 9]);
      const [na, nb, k] = [g.int(3, 5), g.int(2, 4), g.int(1, 2)];
      const A = U.slice(0, na);
      const B = [...A.slice(0, k), ...U.slice(na, na + nb - k)];
      return { A: sorted(A), B: sorted(B) };
    },
    ({ A, B }) => A.some((x) => !B.includes(x)) && B.some((x) => !A.includes(x)),
  );
}
export const inter = (A: number[], B: number[]) => A.filter((x) => B.includes(x));
export const minus = (A: number[], B: number[]) => A.filter((x) => !B.includes(x));
export const union = (A: number[], B: number[]) => sorted([...new Set([...A, ...B])]);

/** The two De Morgan laws for sets, with the same wrong options as before. */
export const DE_MORGAN = [
  {
    s: '(A \\cup B)^{c}', a: 'A^{c} \\cap B^{c}', b: 'A^{c} \\cup B^{c}', c: 'A \\cap B', d: 'A \\setminus B',
    tb: r`This is $(A \cap B)^{c}$. Taking a complement swaps $\cup$ and $\cap$ (De Morgan).`,
    tc: r`An element of $A \cap B$ is in $A \cup B$, so it is definitely <i>not</i> in the complement.`,
    td: r`Elements of $A \setminus B$ are in $A$, hence in $A \cup B$ — the opposite of what we want.`,
    steps: [r`$x \in (A \cup B)^{c}$ means: not ($x \in A$ or $x \in B$).`, r`By De Morgan's law in logic: $x \notin A$ and $x \notin B$.`, r`That is $x \in A^{c} \cap B^{c}$.`],
  },
  {
    s: '(A \\cap B)^{c}', a: 'A^{c} \\cup B^{c}', b: 'A^{c} \\cap B^{c}', c: 'A \\cup B', d: 'A^{c} \\cap B',
    tb: r`The complement flips $\cap$ into $\cup$. $A^c \cap B^c$ is $(A \cup B)^c$, a smaller set.`,
    tc: r`No complement was taken. An element in both $A$ and $B$ lies in $A \cup B$ but not in $(A \cap B)^c$.`,
    td: r`This misses the elements outside $B$ — for example one that is in $A$ but not in $B$.`,
    steps: [r`$x \in (A \cap B)^c$ means: not ($x \in A$ and $x \in B$).`, r`By De Morgan for statements this is: $x \notin A$ or $x \notin B$.`, r`That is $x \in A^c \cup B^c$.`],
  },
];
export function deMorgan(g: Rng) {
  const form = g.int(0, 1);
  const f = DE_MORGAN[form];
  return {
    params: { form },
    promptText: r`Which set is always equal to $${f.s}$?`,
    options: [
      { id: 'a', label: `$${f.a}$` },
      { id: 'b', label: `$${f.b}$`, trapExplanation: f.tb },
      { id: 'c', label: `$${f.c}$`, trapExplanation: f.tc },
      { id: 'd', label: `$${f.d}$`, trapExplanation: f.td },
    ],
    stepByStepSolution: f.steps,
  };
}

const PAIRS = [
  ['Maths', 'Computer Science'],
  ['French', 'German'],
  ['football', 'basketball'],
  ['the choir', 'the drama club'],
  ['Physics', 'Chemistry'],
];
const COLOURS = ['red', 'green', 'blue', 'white', 'black'];

export const practice: QuestionTemplate[] = [
  {
    id: 'ml-02-1',
    difficulty: 1,
    keyConceptTag: 'Set difference',
    correctOptionId: 'a',
    generate: (g) => {
      const { A, B } = twoSets(g);
      const sym = union(minus(A, B), minus(B, A));
      return {
        params: { A, B },
        promptText: r`Let $A = ${set(A)}$ and $B = ${set(B)}$. What is $A \setminus B$?`,
        options: [
          { id: 'a', label: `$${set(minus(A, B))}$`, value: minus(A, B) },
          { id: 'b', label: `$${set(minus(B, A))}$`, value: minus(B, A), trapExplanation: r`That is $B \setminus A$. $A \setminus B$ keeps the elements of $A$ and removes those also in $B$.` },
          { id: 'c', label: `$${set(inter(A, B))}$`, value: inter(A, B), trapExplanation: r`That is the intersection — exactly the elements that $A \setminus B$ removes.` },
          { id: 'd', label: `$${set(sym)}$`, value: sym, trapExplanation: r`This is the symmetric difference: elements in exactly one of the sets. $A \setminus B$ contains only elements of $A$.` },
        ],
        stepByStepSolution: [
          r`Go through $A$: ${minus(A, B).join(', ')} ${minus(A, B).length === 1 ? 'is' : 'are'} not in $B$, keep ${minus(A, B).length === 1 ? 'it' : 'them'}.`,
          r`${inter(A, B).join(', ')} ${inter(A, B).length === 1 ? 'is' : 'are'} in $B$, remove ${inter(A, B).length === 1 ? 'it' : 'them'}.`,
          r`$A \setminus B = ${set(minus(A, B))}$.`,
        ],
      };
    },
  },
  {
    id: 'ml-02-2',
    difficulty: 1,
    keyConceptTag: 'Size of the power set',
    correctOptionId: 'a',
    generate: (g) => {
      const n = g.pick([3, 5, 6]);
      const fact = [1, 1, 2, 6, 24, 120, 720][n];
      const els = 'abcdef'.slice(0, n).split('').join(', ');
      return {
        params: { n },
        promptText: r`How many subsets does $\{${els}\}$ have?`,
        options: [
          { id: 'a', label: `$${2 ** n}$`, value: 2 ** n },
          { id: 'b', label: `$${fact}$`, value: fact, trapExplanation: r`$${fact} = ${n}!$ counts orderings. A subset is a yes/no choice for each element: $2^${n}$.` },
          { id: 'c', label: `$${2 ** n - 1}$`, value: 2 ** n - 1, trapExplanation: r`The empty set is a subset too (choose "no" for every element). Including it gives $${2 ** n}$.` },
          { id: 'd', label: `$${n * n}$`, value: n * n, trapExplanation: r`$${n}^2$ has base and exponent swapped. Two choices per element, ${n} elements: $2^${n}$.` },
        ],
        stepByStepSolution: [
          r`Each of the ${n} elements is either in the subset or not: 2 choices each.`,
          r`$2^${n} = ${2 ** n}$.`,
          r`This count includes $\varnothing$ and the whole set itself.`,
        ],
      };
    },
  },
  {
    id: 'ml-02-3',
    difficulty: 2,
    keyConceptTag: 'Inclusion–exclusion',
    correctOptionId: 'a',
    generate: (g) => {
      const { N, a, b, k } = g.until(
        () => {
          const N = g.pick([30, 40, 50, 60, 80, 100]);
          return { N, a: g.int(N / 5, (N * 3) / 5), b: g.int(N / 5, (N * 3) / 5), k: g.int(2, N / 4) };
        },
        ({ N, a, b, k }) => k < Math.min(a, b) && a + b - k < N && allDistinct([N - (a + b - k), N - a - b, N - a, a - k]),
      );
      const [s1, s2] = g.pick(PAIRS);
      const none = N - (a + b - k);
      return {
        params: { N, a, b, k },
        promptText: r`Of ${N} students, ${a} take ${s1}, ${b} take ${s2} and ${k} take both. How many take neither?`,
        options: [
          { id: 'a', label: `$${none}$`, value: none },
          { id: 'b', label: `$${N - a - b}$`, value: N - a - b, trapExplanation: r`$${N} - ${a} - ${b}$ subtracts the ${k} students who take both twice.` },
          { id: 'c', label: `$${N - a}$`, value: N - a, trapExplanation: r`$${N} - ${a}$ removes only the ${s1} students; those who take ${s2} but not ${s1} still have to be removed.` },
          { id: 'd', label: `$${a - k}$`, value: a - k, trapExplanation: r`$${a} - ${k} = ${a - k}$ is the number who take ${s1} but not ${s2}.` },
        ],
        stepByStepSolution: [
          r`Inclusion–exclusion: $|A \cup B| = ${a} + ${b} - ${k} = ${a + b - k}$.`,
          r`Neither: $${N} - ${a + b - k} = ${none}$.`,
          r`Check by parts: ${a - k} only ${s1}, ${b - k} only ${s2}, ${k} both, ${none} neither: $${a - k} + ${b - k} + ${k} + ${none} = ${N}$. ✓`,
        ],
      };
    },
  },
  {
    id: 'ml-02-4',
    difficulty: 2,
    keyConceptTag: "De Morgan's laws for sets",
    correctOptionId: 'a',
    generate: deMorgan,
  },
  {
    id: 'ml-02-5',
    difficulty: 3,
    keyConceptTag: 'Cartesian product',
    correctOptionId: 'a',
    generate: (g) => {
      const size = (m: number) => 2 * Math.floor(Math.sqrt(m)) + 1;
      const { m, nB } = g.until(
        () => ({ m: g.pick([1, 2, 4, 5, 9, 10, 16]), nB: g.int(2, 4) }),
        ({ m, nB }) => allDistinct([size(m) * nB, size(m) + nB, (Math.floor(Math.sqrt(m)) + 1) * nB, nB ** size(m)]),
      );
      const root = Math.floor(Math.sqrt(m));
      const sizeA = size(m);
      const B = shuffle(g, COLOURS).slice(0, nB);
      const A = Array.from({ length: sizeA }, (_, i) => i - root);
      return {
        params: { m, nB },
        promptText: r`Let $A = \{x \in \mathbb{Z} : x^2 \le ${m}\}$ and $B = \{${B.map((c) => `\\text{${c}}`).join(', ')}\}$. How many elements does $A \times B$ have?`,
        options: [
          { id: 'a', label: `$${sizeA * nB}$`, value: sizeA * nB },
          { id: 'b', label: `$${sizeA + nB}$`, value: sizeA + nB, trapExplanation: r`$${sizeA} + ${nB}$ adds the sizes; that would be $|A \cup B|$ for disjoint sets. Pairs multiply: $|A|\cdot|B|$.` },
          { id: 'c', label: `$${(root + 1) * nB}$`, value: (root + 1) * nB, trapExplanation: r`$A$ is not $\{0, \dots, ${root}\}$: negative integers also satisfy $x^2 \le ${m}$, so $A = ${set(A)}$.` },
          { id: 'd', label: `$${nB ** sizeA}$`, value: nB ** sizeA, trapExplanation: r`$${nB}^{${sizeA}}$ counts functions from $A$ to $B$. The product only pairs one element of each.` },
        ],
        stepByStepSolution: [
          r`$x^2 \le ${m}$ for integers means $-${root} \le x \le ${root}$: $A = ${set(A)}$, so $|A| = ${sizeA}$.`,
          r`$|B| = ${nB}$.`,
          r`$|A \times B| = ${sizeA} \cdot ${nB} = ${sizeA * nB}$ ordered pairs.`,
        ],
      };
    },
  },
];
