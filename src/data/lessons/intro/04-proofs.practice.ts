import type { QuestionTemplate, Rng } from '../../../types.ts';
import { r } from '../define.ts';
import { shuffle } from '../gen.ts';
import { IMPLICATIONS } from './01-logic.practice.ts';

/**
 * Claims about every integer n. scripts/verify.mjs keeps the same lists (INT_TRUE / INT_FALSE) as
 * predicates and checks each on a window of integers.
 */
export const TRUE_CLAIMS = [
  { s: r`$n^2 - n$ is even`, why: r`$n^2 - n = n(n - 1)$ is a product of two consecutive integers, one of which is even. True.` },
  { s: r`$n^3 - n$ is divisible by 6`, why: r`$n^3 - n = (n - 1)n(n + 1)$: among three consecutive integers one is even and one is a multiple of 3. True.` },
  { s: r`$2n + 1$ is odd`, why: r`$2n + 1$ is the definition of an odd number. True.` },
  { s: r`$(n + 1)^2 - n^2$ is odd`, why: r`$(n + 1)^2 - n^2 = 2n + 1$, which is odd. True.` },
  { s: r`$n(n + 1)(n + 2)$ is divisible by 3`, why: r`Among three consecutive integers one is a multiple of 3. True.` },
  { s: r`$n^2 + n$ is even`, why: r`$n^2 + n = n(n + 1)$, a product of consecutive integers. True.` },
];
export const FALSE_CLAIMS = [
  { s: r`$n^2 + 1$ is odd`, cex: r`$n = 1$: $n^2 + 1 = 2$, which is even. In general $n^2 + 1$ is odd exactly when $n$ is even.` },
  { s: r`$n^2 + n + 1$ is even`, cex: r`$n = 1$: $n^2 + n + 1 = 3$, which is odd. In fact $n^2 + n$ is always even, so $n^2 + n + 1$ is always odd.` },
  { s: r`$n^2 - 1$ is divisible by 4`, cex: r`$n = 2$: $n^2 - 1 = 3$. (It works for odd $n$ only.)` },
  { s: r`$3n + 1$ is even`, cex: r`$n = 2$: $3n + 1 = 7$, which is odd.` },
  { s: r`$n^3 + n$ is divisible by 3`, cex: r`$n = 1$: $n^3 + n = 2$, not divisible by 3.` },
];

/** Remainder of (mk + s)² on division by m, with distractors from typical slips. */
export function squareRemainder(g: Rng, moduli: number[]) {
  const candidates = (m: number, s: number) => {
    const ans = (s * s) % m;
    return [s, s * s, 0, (2 * s) % m, m - s].filter((v, i, all) => v !== ans && all.indexOf(v) === i);
  };
  // Some (m, s) leave fewer than three different wrong answers; draw again then.
  const { m, s } = g.until(() => {
    const m = g.pick(moduli);
    return { m, s: g.int(1, m - 1) };
  }, ({ m, s }) => candidates(m, s).length >= 3);
  const ans = (s * s) % m;
  const k2 = Math.floor((s * s) / m);
  const pool = [
    { v: s, why: r`Squaring changes the remainder: $(${m}k + ${s})^2 = ${m}(\dots) + ${s * s}$, and ${s * s} leaves remainder ${ans}.` },
    { v: s * s, why: r`A remainder on division by ${m} is between $0$ and $${m - 1}$. $${s * s} = ${m}\cdot ${k2} + ${ans}$.` },
    { v: 0, why: r`Only multiples of ${m} are guaranteed to have squares divisible by ${m}. Check $k = 0$: $n = ${s}$, $n^2 = ${s * s}$.` },
    { v: (2 * s) % m, why: r`Doubling is not squaring: the remainder of $n^2$ comes from $${s}^2$, not from $2 \cdot ${s}$.` },
    { v: m - s, why: r`$${m - s}$ is the remainder of $-n$, not of $n^2$.` },
  ].filter((o, i, all) => o.v !== ans && all.findIndex((p) => p.v === o.v) === i);
  const wrong = shuffle(g, pool).slice(0, 3);
  return {
    params: { m, s },
    promptText: r`An integer has the form $n = ${m}k + ${s}$. What remainder does $n^2$ leave on division by ${m}?`,
    options: [
      { id: 'a', label: `$${ans}$`, value: ans },
      ...wrong.map((o, i) => ({ id: 'bcd'[i], label: `$${o.v}$`, value: o.v, trapExplanation: o.why })),
    ],
    stepByStepSolution: [
      r`$(${m}k + ${s})^2 = ${m * m}k^2 + ${2 * m * s}k + ${s * s}$.`,
      r`$= ${m}(${m}k^2 + ${2 * s}k${k2 ? ` + ${k2}` : ''}) + ${ans}$.`,
      r`Remainder $${ans}$. (Check with $k = 1$: $${m + s}^2 = ${(m + s) ** 2} = ${m}\cdot ${Math.floor((m + s) ** 2 / m)} + ${ans}$.)`,
    ],
  };
}

/** Euler-type polynomials n² + n + p that are prime for n = 1, …, p − 2 and fail at n = p − 1. */
const LUCKY = [11, 17, 41];

export const practice: QuestionTemplate[] = [
  {
    id: 'ml-04-1',
    difficulty: 1,
    keyConceptTag: 'Proof by contrapositive',
    correctOptionId: 'a',
    generate: (g) => {
      const { p, q, np, nq } = IMPLICATIONS[g.int(0, IMPLICATIONS.length - 1)];
      return {
        params: {},
        promptText: r`To prove "if ${p}, then ${q}" by <i>contrapositive</i>, what do you assume and what do you show?`,
        options: [
          { id: 'a', label: `Assume ${nq}, show ${np}` },
          { id: 'b', label: `Assume ${q}, show ${p}`, trapExplanation: r`That proves the converse $Q \Rightarrow P$, a different statement.` },
          { id: 'c', label: `Assume ${np}, show ${nq}`, trapExplanation: r`That proves $\neg P \Rightarrow \neg Q$, which is equivalent to the converse, not to $P \Rightarrow Q$.` },
          { id: 'd', label: `Assume ${p} and ${nq}, reach a contradiction`, trapExplanation: r`That is a valid method too, but it is proof by <i>contradiction</i>, not by contrapositive.` },
        ],
        stepByStepSolution: [
          r`With $P$ = "${p}" and $Q$ = "${q}", the contrapositive of $P \Rightarrow Q$ is $\neg Q \Rightarrow \neg P$.`,
          r`They have the same truth table, so proving one proves the other.`,
          r`A direct proof of $\neg Q \Rightarrow \neg P$ assumes "${nq}" and derives "${np}".`,
        ],
      };
    },
  },
  {
    id: 'ml-04-2',
    difficulty: 1,
    keyConceptTag: 'Working with remainders',
    correctOptionId: 'a',
    generate: (g) => squareRemainder(g, [3, 4, 5, 7]),
  },
  {
    id: 'ml-04-3',
    difficulty: 2,
    keyConceptTag: 'Disproof by counterexample',
    correctOptionId: 'a',
    generate: (g) => {
      const f = g.int(0, FALSE_CLAIMS.length - 1);
      const t = shuffle(g, TRUE_CLAIMS.map((_, i) => i)).slice(0, 3);
      return {
        params: { f, t },
        promptText: r`Which statement about integers is <i>false</i>?`,
        options: [
          { id: 'a', label: r`For every integer $n$, ${FALSE_CLAIMS[f].s}` },
          ...t.map((i, n) => ({ id: 'bcd'[n], label: r`For every integer $n$, ${TRUE_CLAIMS[i].s}`, trapExplanation: TRUE_CLAIMS[i].why })),
        ],
        stepByStepSolution: [
          r`To show a "for all" statement is false, find one counterexample.`,
          FALSE_CLAIMS[f].cex,
          r`The other three statements hold for every integer, each by a short argument.`,
        ],
      };
    },
  },
  {
    id: 'ml-04-4',
    difficulty: 2,
    keyConceptTag: 'Examples are not proofs',
    correctOptionId: 'a',
    hint: r`Look for an $n$ that makes every term share a factor. Since $n^2 + n = n(n + 1)$, pick $n$ so that $n(n + 1)$ is a multiple of the constant term.`,
    generate: (g) => {
      const p = g.pick(LUCKY);
      const P = (n: number) => n * n + n + p;
      const [n1, n2] = shuffle(g, Array.from({ length: p - 3 }, (_, i) => i + 1)).slice(0, 2);
      const ns = [p - 1, p - 2, n1, n2];
      return {
        params: { p, ns },
        promptText: r`Which $n$ is a counterexample to "for every integer $n \ge 1$, $n^2 + n + ${p}$ is prime"?`,
        options: [
          { id: 'a', label: `$${p - 1}$`, value: p - 1 },
          { id: 'b', label: `$${p - 2}$`, value: p - 2, trapExplanation: r`$${p - 2}^2 + ${p - 2} + ${p} = ${P(p - 2)}$, which is prime. The formula survives up to $n = ${p - 2}$ — that is why it looks convincing.` },
          { id: 'c', label: `$${n1}$`, value: n1, trapExplanation: r`$${n1}^2 + ${n1} + ${p} = ${P(n1)}$ is prime. Testing values that work proves nothing.` },
          { id: 'd', label: `$${n2}$`, value: n2, trapExplanation: r`$${n2}^2 + ${n2} + ${p} = ${P(n2)}$, which is prime.` },
        ],
        stepByStepSolution: [
          r`Look for an $n$ that makes every term share a factor. With $n = ${p - 1}$: $${p - 1}^2 + ${p - 1} = ${p - 1}\cdot${p}$.`,
          r`So $n^2 + n + ${p} = ${p - 1}\cdot ${p} + ${p} = ${p}\cdot${p} = ${p * p}$.`,
          r`$${p * p} = ${p}^2$ is not prime: one counterexample disproves the claim.`,
        ],
      };
    },
  },
  {
    id: 'ml-04-6',
    difficulty: 3,
    keyConceptTag: 'Proof by contradiction',
    correctOptionId: 'a',
    generate: (g) => {
      const p = g.pick([2, 3, 5, 7]);
      return {
        params: { p },
        promptText: r`Proving that $\sqrt${p}$ is irrational: assume $\sqrt${p} = \frac{a}{b}$ in lowest terms, so $a^2 = ${p}b^2$. One shows $${p} \mid a$ and writes $a = ${p}m$. What equation follows for $b$?`,
        options: [
          { id: 'a', label: r`$b^2 = ${p}m^2$` },
          { id: 'b', label: r`$b^2 = ${p * p}m^2$`, trapExplanation: r`Substituting gives $${p * p}m^2 = ${p}b^2$; dividing by ${p} leaves $${p}m^2$, not $${p * p}m^2$.` },
          { id: 'c', label: r`$b^2 = m^2$`, trapExplanation: r`Both sides were divided by ${p * p}, but the right-hand side only has the factor ${p}.` },
          { id: 'd', label: r`$b = ${p}m$`, trapExplanation: r`That would mean $a = b$, i.e. $\sqrt${p} = 1$. Substitute into $a^2 = ${p}b^2$ and simplify carefully.` },
        ],
        stepByStepSolution: [
          r`Substitute $a = ${p}m$: $${p * p}m^2 = ${p}b^2$.`,
          r`Divide by ${p}: $b^2 = ${p}m^2$, so $${p} \mid b^2$ and hence $${p} \mid b$ (${p} is prime).`,
          r`Now ${p} divides both $a$ and $b$, contradicting lowest terms. So $\sqrt${p}$ is irrational.`,
        ],
      };
    },
  },
];
