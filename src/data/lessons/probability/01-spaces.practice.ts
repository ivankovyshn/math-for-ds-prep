import type { QuestionTemplate } from '../../../types.ts';
import { r } from '../define.ts';
import { allDistinct, binomial, dec, frac } from '../gen.ts';

/** Ordered pairs of dice with the given sum. */
export const sumWays = (s: number) => Math.max(0, 6 - Math.abs(s - 7));
/** Unordered pairs {i ≤ j} of dice with the given sum. */
const unordered = (s: number) => [1, 2, 3, 4, 5, 6].filter((i) => s - i >= i && s - i <= 6).length;
/** Rounded for display: "≈ 0.427". */
export const approx = (x: number, digits = 3) => `\\approx ${dec(Math.round(x * 10 ** digits) / 10 ** digits)}`;
const FACES = ['a six', 'a 1 or a 2', 'an odd number', 'at least a 3'];

export const practice: QuestionTemplate[] = [
  {
    id: 'pr-01-1',
    difficulty: 1,
    keyConceptTag: 'Equally likely outcomes',
    correctOptionId: 'a',
    generate: (g) => {
      const s = g.until(() => g.int(3, 11), (s) => allDistinct([sumWays(s) / 36, 1 / 11, 1 / 36, unordered(s) / 21]));
      const w = sumWays(s);
      return {
        params: { s },
        promptText: r`Two fair dice are rolled. What is the probability that their sum is ${s}?`,
        options: [
          { id: 'a', label: `$${frac(w, 36)}$`, value: w / 36 },
          { id: 'b', label: r`$\tfrac{1}{11}$`, value: 1 / 11, trapExplanation: r`The 11 possible sums (2 to 12) are not equally likely: a middle sum can be made in more ways.` },
          { id: 'c', label: r`$\tfrac{1}{36}$`, value: 1 / 36, trapExplanation: r`That is one ordered pair. Sum ${s} can be made in ${w} ordered ways.` },
          { id: 'd', label: `$${frac(unordered(s), 21)}$`, value: unordered(s) / 21, trapExplanation: r`The 21 unordered pairs are not equally likely: $\{1, 2\}$ comes from two rolls, $(1,2)$ and $(2,1)$, while $\{3, 3\}$ comes from one.` },
        ],
        stepByStepSolution: [
          r`$\Omega$ = 36 equally likely ordered pairs $(i, j)$.`,
          r`Pairs with $i + j = ${s}$: ${[1, 2, 3, 4, 5, 6].filter((i) => s - i >= 1 && s - i <= 6).map((i) => `$(${i}, ${s - i})$`).join(', ')} — that is ${w}.`,
          r`$P = \frac{${w}}{36} = ${frac(w, 36)}$.`,
        ],
      };
    },
  },
  {
    id: 'pr-01-2',
    difficulty: 1,
    keyConceptTag: 'Inclusion–exclusion',
    correctOptionId: 'a',
    generate: (g) => {
      const { a, b, c } = g.until(
        () => ({ a: g.int(3, 12), b: g.int(3, 12), c: g.int(1, 6) }),
        ({ a, b, c }) => c < Math.min(a, b) && a + b - c <= 20 && allDistinct([a + b - c, a + b, a + b - 2 * c, c]),
      );
      const P = (n: number) => dec(n / 20);
      return {
        params: { a, b, c },
        promptText: r`$P(A) = ${P(a)}$, $P(B) = ${P(b)}$ and $P(A \cap B) = ${P(c)}$. What is $P(A \cup B)$?`,
        options: [
          { id: 'a', label: `$${P(a + b - c)}$`, value: (a + b - c) / 20 },
          { id: 'b', label: `$${P(a + b)}$`, value: (a + b) / 20, trapExplanation: r`Adding $P(A) + P(B)$ counts the outcomes in $A \cap B$ twice.` },
          { id: 'c', label: `$${P(a + b - 2 * c)}$`, value: (a + b - 2 * c) / 20, trapExplanation: r`Subtracting the overlap twice gives $P(\text{exactly one of } A, B)$, which leaves out $A \cap B$.` },
          { id: 'd', label: `$${P(c)}$`, value: c / 20, trapExplanation: r`That is $P(A \cap B)$, "both". "Or" is the union.` },
        ],
        stepByStepSolution: [
          r`$P(A \cup B) = P(A) + P(B) - P(A \cap B)$.`,
          r`$= ${P(a)} + ${P(b)} - ${P(c)}$.`,
          r`$= ${P(a + b - c)}$.`,
        ],
      };
    },
  },
  {
    id: 'pr-01-3',
    difficulty: 2,
    keyConceptTag: 'Counting with combinations',
    correctOptionId: 'a',
    generate: (g) => {
      const { n, k } = g.until(
        () => ({ n: g.int(4, 7), k: g.int(1, 6) }),
        ({ n, k }) => k < n && allDistinct([binomial(n, k) / 2 ** n, 1 / 2 ** n, k / n, 1 / (n + 1)]),
      );
      const C = binomial(n, k);
      return {
        params: { n, k },
        promptText: r`A fair coin is tossed ${n} times. What is the probability of exactly ${k} head${k === 1 ? '' : 's'}?`,
        options: [
          { id: 'a', label: `$${frac(C, 2 ** n)}$`, value: C / 2 ** n },
          { id: 'b', label: `$${frac(1, 2 ** n)}$`, value: 1 / 2 ** n, trapExplanation: r`That is one particular sequence. There are $\binom{${n}}{${k}} = ${C}$ sequences with ${k} head${k === 1 ? '' : 's'}.` },
          { id: 'c', label: `$${frac(k, n)}$`, value: k / n, trapExplanation: r`$\frac{${k}}{${n}}$ is a proportion of heads, not a probability of getting exactly ${k}.` },
          { id: 'd', label: `$${frac(1, n + 1)}$`, value: 1 / (n + 1), trapExplanation: r`The ${n + 1} possible head counts are not equally likely; middle counts arise in more ways.` },
        ],
        stepByStepSolution: [
          r`$|\Omega| = 2^{${n}} = ${2 ** n}$ equally likely sequences.`,
          r`Choose the positions of the heads: $\binom{${n}}{${k}} = ${C}$.`,
          r`$P = \frac{${C}}{${2 ** n}} = ${frac(C, 2 ** n)}$.`,
        ],
      };
    },
  },
  {
    id: 'pr-01-4',
    difficulty: 2,
    keyConceptTag: 'At least one: the complement trick',
    correctOptionId: 'a',
    generate: (g) => {
      const { j, n } = g.until(
        () => ({ j: g.int(0, 3), n: g.int(2, 4) }),
        ({ j, n }) => {
          const q = [1, 2, 3, 4][j];
          return allDistinct([1 - ((6 - q) / 6) ** n, (n * q) / 6, (q / 6) ** n, 1 - (q / 6) ** n]) && (n * q) / 6 !== 1;
        },
      );
      const q = [1, 2, 3, 4][j];
      const N = 6 ** n;
      const none = (6 - q) ** n;
      return {
        params: { j, n },
        promptText: r`A fair die is rolled ${n} times. What is the probability of rolling ${FACES[j]} at least once?`,
        options: [
          { id: 'a', label: `$${frac(N - none, N)}$`, value: (N - none) / N },
          { id: 'b', label: `$${frac(n * q, 6)}$`, value: (n * q) / 6, trapExplanation: r`Adding $\frac{${q}}{6}$ for each roll counts overlaps (success on several rolls) more than once.` },
          { id: 'c', label: `$${frac(q ** n, N)}$`, value: q ** n / N, trapExplanation: r`That is the probability of success on <i>every</i> roll.` },
          { id: 'd', label: `$${frac(N - q ** n, N)}$`, value: (N - q ** n) / N, trapExplanation: r`That is $1 - P(\text{success every time})$. The complement of "at least once" is "never".` },
        ],
        stepByStepSolution: [
          r`One roll misses with probability $\frac{${6 - q}}{6}$; the rolls are independent, so $P(\text{never}) = \big(\frac{${6 - q}}{6}\big)^{${n}} = \frac{${none}}{${N}}$.`,
          r`$P(\text{at least once}) = 1 - \frac{${none}}{${N}}$.`,
          r`$= ${frac(N - none, N)} ${approx((N - none) / N)}$.`,
        ],
      };
    },
  },
  {
    id: 'pr-01-5',
    difficulty: 3,
    keyConceptTag: 'Drawing without replacement',
    correctOptionId: 'a',
    generate: (g) => {
      const { rd, bl } = g.until(
        () => ({ rd: g.int(2, 7), bl: g.int(2, 7) }),
        ({ rd, bl }) => {
          const N = rd + bl;
          return allDistinct([binomial(rd, 2) / binomial(N, 2), (rd / N) ** 2, rd / N, (rd - 1) / (N - 1)]);
        },
      );
      const N = rd + bl;
      return {
        params: { rd, bl },
        promptText: r`A bag holds ${rd} red and ${bl} blue balls. Two are drawn without replacement. What is the probability that both are red?`,
        options: [
          { id: 'a', label: `$${frac(binomial(rd, 2), binomial(N, 2))}$`, value: binomial(rd, 2) / binomial(N, 2) },
          { id: 'b', label: `$${frac(rd * rd, N * N)}$`, value: (rd / N) ** 2, trapExplanation: r`$\big(\frac{${rd}}{${N}}\big)^2$ assumes the first ball goes back. Without replacement the second draw has ${rd - 1} red of ${N - 1}.` },
          { id: 'c', label: `$${frac(rd, N)}$`, value: rd / N, trapExplanation: r`That is the probability for one draw only.` },
          { id: 'd', label: `$${frac(rd - 1, N - 1)}$`, value: (rd - 1) / (N - 1), trapExplanation: r`That is the second draw given the first was red; multiply by $P(\text{first red}) = \frac{${rd}}{${N}}$.` },
        ],
        stepByStepSolution: [
          r`$P(\text{first red}) = \frac{${rd}}{${N}}$, then $P(\text{second red} \mid \text{first red}) = \frac{${rd - 1}}{${N - 1}}$.`,
          r`$P = \frac{${rd}}{${N}}\cdot\frac{${rd - 1}}{${N - 1}} = \frac{${rd * (rd - 1)}}{${N * (N - 1)}}$.`,
          r`$= ${frac(binomial(rd, 2), binomial(N, 2))}$ — the same as $\binom{${rd}}{2}\big/\binom{${N}}{2}$.`,
        ],
      };
    },
  },
  {
    id: 'pr-01-6',
    difficulty: 3,
    keyConceptTag: 'The birthday problem',
    correctOptionId: 'a',
    generate: (g) => {
      const { d, n } = g.until(
        () => ({ d: g.pick([6, 8, 10, 12]), n: g.int(3, 4) }),
        ({ d, n }) => {
          let all = 1;
          for (let i = 0; i < n; i++) all *= (d - i) / d;
          return allDistinct([1 - all, all, binomial(n, 2) / d, n / d].map((x) => dec(Math.round(x * 1000) / 1000)));
        },
      );
      let all = 1;
      for (let i = 0; i < n; i++) all *= (d - i) / d;
      const prod = Array.from({ length: n }, (_, i) => `\\tfrac{${d - i}}{${d}}`).join('\\cdot');
      return {
        params: { d, n },
        promptText: r`Each of ${n} people picks one of ${d} equally likely options independently. What is the probability that at least two pick the same option?`,
        options: [
          { id: 'a', label: `$${approx(1 - all)}$`, value: 1 - all },
          { id: 'b', label: `$${approx(all)}$`, value: all, trapExplanation: r`That is the probability that all picks are <i>different</i>, the complement.` },
          { id: 'c', label: `$${approx(binomial(n, 2) / d)}$`, value: binomial(n, 2) / d, trapExplanation: r`$\binom{${n}}{2}\cdot\frac{1}{${d}}$ adds the chances of each pair matching, counting overlaps several times — with more people it would even exceed 1.` },
          { id: 'd', label: `$${approx(n / d)}$`, value: n / d, trapExplanation: r`$\frac{${n}}{${d}}$ is not a probability of a match; it ignores how the picks can coincide.` },
        ],
        stepByStepSolution: [
          r`Complement: all ${n} picks different. Person 1 is free, person 2 avoids 1 option, and so on.`,
          r`$P(\text{all different}) = ${prod} ${approx(all)}$.`,
          r`$P(\text{a match}) = 1 - ${dec(Math.round(all * 1000) / 1000)} ${approx(1 - all)}$.`,
        ],
      };
    },
  },
];
