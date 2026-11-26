import type { QuestionTemplate } from '../../../types.ts';
import { r } from '../define.ts';
import { allDistinct, binomial, factorial, frac } from '../gen.ts';

/** Extra practice (Practice 2): gentler questions on the same ideas, with new numbers every time. */
export const extra: QuestionTemplate[] = [
  {
    id: 'pr-01-x1',
    difficulty: 1,
    keyConceptTag: 'Equally likely outcomes',
    correctOptionId: 'a',
    generate: (g) => {
      const k = g.until(() => g.int(2, 5), (k) => allDistinct([(7 - k) / 6, (6 - k) / 6, k / 6, 1 / 6]));
      return {
        params: { k },
        promptText: r`A fair die is rolled. What is the probability of rolling at least ${k}?`,
        options: [
          { id: 'a', label: `$${frac(7 - k, 6)}$`, value: (7 - k) / 6 },
          { id: 'b', label: `$${frac(6 - k, 6)}$`, value: (6 - k) / 6, trapExplanation: r`"At least ${k}" includes ${k} itself: the faces ${k} to 6.` },
          { id: 'c', label: `$${frac(k, 6)}$`, value: k / 6, trapExplanation: r`That counts the faces 1 to ${k}, the wrong end of the die.` },
          { id: 'd', label: r`$\tfrac16$`, value: 1 / 6, trapExplanation: r`$\frac16$ is the chance of one particular face; the event contains several faces.` },
        ],
        stepByStepSolution: [
          r`$\Omega = \{1, \dots, 6\}$, all equally likely.`,
          r`The event is $\{${Array.from({ length: 7 - k }, (_, i) => k + i).join(', ')}\}$, with ${7 - k} outcomes.`,
          r`$P = ${frac(7 - k, 6)}$.`,
        ],
      };
    },
  },
  {
    id: 'pr-01-x2',
    difficulty: 1,
    keyConceptTag: 'The complement',
    correctOptionId: 'a',
    generate: (g) => {
      const { rd, bl } = g.until(() => ({ rd: g.int(2, 9), bl: g.int(2, 9) }), ({ rd, bl }) => rd !== bl && allDistinct([bl / (rd + bl), rd / (rd + bl), bl / rd, 1 / (rd + bl)]));
      const N = rd + bl;
      return {
        params: { rd, bl },
        promptText: r`A bag holds ${rd} red and ${bl} blue balls. One is drawn at random. What is the probability that it is <i>not</i> red?`,
        options: [
          { id: 'a', label: `$${frac(bl, N)}$`, value: bl / N },
          { id: 'b', label: `$${frac(rd, N)}$`, value: rd / N, trapExplanation: r`That is $P(\text{red})$; the question asks for its complement.` },
          { id: 'c', label: `$${frac(bl, rd)}$`, value: bl / rd, trapExplanation: r`Blue over red is a ratio (odds), not a probability: divide by all ${N} balls.` },
          { id: 'd', label: `$${frac(1, N)}$`, value: 1 / N, trapExplanation: r`That is the chance of one particular ball.` },
        ],
        stepByStepSolution: [
          r`$P(\text{red}) = \frac{${rd}}{${N}}$.`,
          r`$P(\text{not red}) = 1 - \frac{${rd}}{${N}}$.`,
          r`$= ${frac(bl, N)}$.`,
        ],
      };
    },
  },
  {
    id: 'pr-01-x3',
    difficulty: 1,
    keyConceptTag: 'Counting orderings',
    correctOptionId: 'a',
    generate: (g) => {
      const n = g.pick([3, 5, 6]);
      return {
        params: { n },
        promptText: r`In how many different orders can ${n} different books be placed on a shelf?`,
        options: [
          { id: 'a', label: `$${factorial(n)}$`, value: factorial(n) },
          { id: 'b', label: `$${n * n}$`, value: n * n, trapExplanation: r`After the first book there are only ${n - 1} left: the choices shrink, $${n}\cdot${n - 1}\cdots1$.` },
          { id: 'c', label: `$${n}$`, value: n, trapExplanation: r`${n} is the number of choices for the first position only.` },
          { id: 'd', label: `$${2 ** n}$`, value: 2 ** n, trapExplanation: r`$2^{${n}}$ counts subsets (each book in or out), not orderings.` },
        ],
        stepByStepSolution: [
          r`First position: ${n} choices; second: ${n - 1}; and so on.`,
          r`$${n}! = ${Array.from({ length: n }, (_, i) => n - i).join('\\cdot')}$.`,
          r`$= ${factorial(n)}$.`,
        ],
      };
    },
  },
  {
    id: 'pr-01-x4',
    difficulty: 2,
    keyConceptTag: 'Counting with combinations',
    correctOptionId: 'a',
    generate: (g) => {
      const { n, k } = g.until(
        () => ({ n: g.int(5, 9), k: g.int(2, 3) }),
        ({ n, k }) => allDistinct([binomial(n, k), factorial(n) / factorial(n - k), n ** k, n * k]),
      );
      return {
        params: { n, k },
        promptText: r`In how many ways can a team of ${k} be chosen from ${n} people?`,
        options: [
          { id: 'a', label: `$${binomial(n, k)}$`, value: binomial(n, k) },
          { id: 'b', label: `$${factorial(n) / factorial(n - k)}$`, value: factorial(n) / factorial(n - k), trapExplanation: r`That counts ordered selections; each team is counted $${k}! = ${factorial(k)}$ times.` },
          { id: 'c', label: `$${n ** k}$`, value: n ** k, trapExplanation: r`$${n}^{${k}}$ allows the same person twice and counts order.` },
          { id: 'd', label: `$${n * k}$`, value: n * k, trapExplanation: r`Choices multiply step by step, and order must then be divided out: $\frac{${n}\cdots}{${k}!}$.` },
        ],
        stepByStepSolution: [
          r`Order does not matter in a team: use $\binom{n}{k}$.`,
          r`$\binom{${n}}{${k}} = \frac{${Array.from({ length: k }, (_, i) => n - i).join('\\cdot')}}{${k}!}$.`,
          r`$= ${binomial(n, k)}$.`,
        ],
      };
    },
  },
  {
    id: 'pr-01-x5',
    difficulty: 2,
    keyConceptTag: 'At least one: the complement trick',
    correctOptionId: 'a',
    generate: (g) => {
      const q = g.int(1, 4);
      const none = (6 - q) ** 2;
      return {
        params: { q },
        promptText: r`Two fair dice are rolled. What is the probability that at least one of them shows a number from 1 to ${q}?`,
        options: [
          { id: 'a', label: `$${frac(36 - none, 36)}$`, value: (36 - none) / 36 },
          { id: 'b', label: `$${frac(2 * q, 6)}$`, value: (2 * q) / 6, trapExplanation: r`Adding $\frac{${q}}{6} + \frac{${q}}{6}$ counts the case "both dice" twice.` },
          { id: 'c', label: `$${frac(q * q, 36)}$`, value: (q * q) / 36, trapExplanation: r`That is the probability that <i>both</i> dice qualify.` },
          { id: 'd', label: `$${frac(q, 6)}$`, value: q / 6, trapExplanation: r`That is for one die. With two dice there are two chances.` },
        ],
        stepByStepSolution: [
          r`Complement: neither die shows 1 to ${q}. Each misses with probability $\frac{${6 - q}}{6}$.`,
          r`$P(\text{neither}) = \frac{${none}}{36}$.`,
          r`$P(\text{at least one}) = 1 - \frac{${none}}{36} = ${frac(36 - none, 36)}$.`,
        ],
      };
    },
  },
  {
    id: 'pr-01-x6',
    difficulty: 2,
    keyConceptTag: 'Equally likely outcomes',
    correctOptionId: 'a',
    generate: (g) => {
      const { N, m } = g.until(
        () => ({ N: g.int(20, 40), m: g.pick([3, 4, 6, 7]) }),
        ({ N, m }) => N % m !== 0 && allDistinct([Math.floor(N / m) / N, 1 / m, m / N, Math.ceil(N / m) / N]),
      );
      const k = Math.floor(N / m);
      return {
        params: { N, m },
        promptText: r`A number is drawn at random from $1, 2, \dots, ${N}$. What is the probability that it is divisible by ${m}?`,
        options: [
          { id: 'a', label: `$${frac(k, N)}$`, value: k / N },
          { id: 'b', label: `$${frac(1, m)}$`, value: 1 / m, trapExplanation: r`"One in ${m}" holds only when ${N} is a multiple of ${m}. Count the multiples exactly.` },
          { id: 'c', label: `$${frac(m, N)}$`, value: m / N, trapExplanation: r`That treats ${m} as the number of good outcomes; the good outcomes are the multiples of ${m}.` },
          { id: 'd', label: `$${frac(k + 1, N)}$`, value: (k + 1) / N, trapExplanation: r`The last multiple of ${m} up to ${N} is ${k * m}: there are ${k}, not ${k + 1}.` },
        ],
        stepByStepSolution: [
          r`Multiples of ${m} up to ${N}: $${m}, ${2 * m}, \dots, ${k * m}$.`,
          r`There are $\lfloor ${N}/${m} \rfloor = ${k}$ of them.`,
          r`$P = ${frac(k, N)}$.`,
        ],
      };
    },
  },
];
