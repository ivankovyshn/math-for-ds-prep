import type { QuestionTemplate } from '../../../types.ts';
import { r } from '../define.ts';
import { allDistinct, dec, frac } from '../gen.ts';

/** Extra practice (Practice 2): gentler questions on the same ideas, with new numbers every time. */
export const extra: QuestionTemplate[] = [
  {
    id: 'pr-02-x1',
    difficulty: 1,
    keyConceptTag: 'Conditioning shrinks the sample space',
    correctOptionId: 'a',
    generate: (g) => {
      const k = g.until(
        () => g.int(2, 6),
        (k) => {
          const both = [2, 4, 6].filter((x) => x >= k).length;
          const A = 7 - k;
          return allDistinct([both / 3, both / 6, A / 6, both / A]);
        },
      );
      const evens = [2, 4, 6].filter((x) => x >= k);
      const both = evens.length;
      const A = 7 - k;
      return {
        params: { k },
        promptText: r`A fair die shows an even number. What is the probability that it is at least ${k}?`,
        options: [
          { id: 'a', label: `$${frac(both, 3)}$`, value: both / 3 },
          { id: 'b', label: `$${frac(both, 6)}$`, value: both / 6, trapExplanation: r`Given "even", only the 3 even faces remain: divide by 3, not 6.` },
          { id: 'c', label: `$${frac(A, 6)}$`, value: A / 6, trapExplanation: r`That ignores the information that the number is even.` },
          { id: 'd', label: `$${frac(both, A)}$`, value: both / A, trapExplanation: r`That is the reverse, $P(\text{even} \mid \text{at least } ${k})$.` },
        ],
        stepByStepSolution: [
          r`Given "even", the outcomes are $\{2, 4, 6\}$, equally likely.`,
          r`Of these, ${both ? `$${evens.join(', ')}$` : 'none'} ${both === 1 ? 'is' : 'are'} at least ${k}.`,
          r`$P = ${frac(both, 3)}$.`,
        ],
      };
    },
  },
  {
    id: 'pr-02-x2',
    difficulty: 1,
    keyConceptTag: 'The multiplication rule',
    correctOptionId: 'a',
    generate: (g) => {
      const { p, q } = g.until(
        () => ({ p: g.pick([20, 30, 40, 50, 60]), q: g.pick([10, 20, 25, 50]) }),
        ({ p, q }) => allDistinct([(p * q) / 100, q, p, p + q]),
      );
      return {
        params: { p: p / 10, q: q / 10 },
        promptText: r`${p}% of customers are new, and ${q}% of new customers make a purchase. What percentage of all customers are new customers who make a purchase?`,
        options: [
          { id: 'a', label: `$${dec((p * q) / 100)}\\%$`, value: (p * q) / 100 },
          { id: 'b', label: `$${q}\\%$`, value: q, trapExplanation: r`${q}% is a share of the <i>new</i> customers only; multiply by their share ${p}%.` },
          { id: 'c', label: `$${p}\\%$`, value: p, trapExplanation: r`That counts all new customers, buying or not.` },
          { id: 'd', label: `$${p + q}\\%$`, value: p + q, trapExplanation: r`"And" with a conditional multiplies: $P(A \cap B) = P(B \mid A)P(A)$.` },
        ],
        stepByStepSolution: [
          r`$P(\text{new} \cap \text{buys}) = P(\text{buys} \mid \text{new})\,P(\text{new})$.`,
          r`$= ${dec(q / 100)}\cdot${dec(p / 100)}$.`,
          r`$= ${dec((p * q) / 10000)}$, i.e. ${dec((p * q) / 100)}%.`,
        ],
      };
    },
  },
  {
    id: 'pr-02-x3',
    difficulty: 1,
    keyConceptTag: 'Complement of a conditional',
    correctOptionId: 'a',
    generate: (g) => {
      const { q, c } = g.until(() => ({ q: g.int(1, 9), c: g.int(1, 9) }), ({ q, c }) => allDistinct([10 - q, q, 10 - c, (c * (10 - q)) / 10]));
      return {
        params: { q, c },
        promptText: r`$P(\text{cloudy}) = ${dec(c / 10)}$ and $P(\text{rain} \mid \text{cloudy}) = ${dec(q / 10)}$. What is $P(\text{no rain} \mid \text{cloudy})$?`,
        options: [
          { id: 'a', label: `$${dec((10 - q) / 10)}$`, value: (10 - q) / 10 },
          { id: 'b', label: `$${dec(q / 10)}$`, value: q / 10, trapExplanation: r`That is $P(\text{rain} \mid \text{cloudy})$ itself.` },
          { id: 'c', label: `$${dec((10 - c) / 10)}$`, value: (10 - c) / 10, trapExplanation: r`That is $P(\text{not cloudy})$. The condition stays; only the event is complemented.` },
          { id: 'd', label: `$${dec((c * (10 - q)) / 100)}$`, value: (c * (10 - q)) / 100, trapExplanation: r`That is $P(\text{cloudy and no rain})$, a joint probability, not a conditional one.` },
        ],
        stepByStepSolution: [
          r`Given "cloudy", rain and no rain are complementary.`,
          r`$P(\text{no rain} \mid \text{cloudy}) = 1 - P(\text{rain} \mid \text{cloudy})$.`,
          r`$= 1 - ${dec(q / 10)} = ${dec((10 - q) / 10)}$.`,
        ],
      };
    },
  },
  {
    id: 'pr-02-x4',
    difficulty: 2,
    keyConceptTag: 'Law of total probability',
    correctOptionId: 'a',
    generate: (g) => {
      const { r1, n1, r2, n2 } = g.until(
        () => {
          const n1 = g.int(3, 8);
          const n2 = g.int(3, 8);
          return { n1, n2, r1: g.int(1, n1 - 1), r2: g.int(1, n2 - 1) };
        },
        ({ r1, n1, r2, n2 }) => n1 !== n2 && allDistinct([(r1 * n2 + r2 * n1) / (2 * n1 * n2), (r1 + r2) / (n1 + n2), (r1 * r2) / (n1 * n2), r1 / n1]),
      );
      return {
        params: { rs: [r1, r2], ns: [n1, n2] },
        promptText: r`Urn 1 has ${r1} red of ${n1} balls, urn 2 has ${r2} red of ${n2}. A fair coin picks the urn, then a ball is drawn. What is $P(\text{red})$?`,
        options: [
          { id: 'a', label: `$${frac(r1 * n2 + r2 * n1, 2 * n1 * n2)}$`, value: (r1 * n2 + r2 * n1) / (2 * n1 * n2) },
          { id: 'b', label: `$${frac(r1 + r2, n1 + n2)}$`, value: (r1 + r2) / (n1 + n2), trapExplanation: r`Pooling the balls assumes each ball is equally likely, but the coin makes each <i>urn</i> equally likely.` },
          { id: 'c', label: `$${frac(r1 * r2, n1 * n2)}$`, value: (r1 * r2) / (n1 * n2), trapExplanation: r`Multiplying is "red from both urns". Only one ball is drawn.` },
          { id: 'd', label: `$${frac(r1, n1)}$`, value: r1 / n1, trapExplanation: r`That is $P(\text{red} \mid \text{urn 1})$ only.` },
        ],
        stepByStepSolution: [
          r`$P(\text{red}) = \frac12 P(\text{red} \mid U_1) + \frac12 P(\text{red} \mid U_2)$.`,
          r`$= \frac12\cdot${frac(r1, n1)} + \frac12\cdot${frac(r2, n2)}$.`,
          r`$= ${frac(r1 * n2 + r2 * n1, 2 * n1 * n2)}$.`,
        ],
      };
    },
  },
  {
    id: 'pr-02-x5',
    difficulty: 2,
    keyConceptTag: 'Independent events',
    correctOptionId: 'a',
    generate: (g) => {
      const { a, b } = g.until(() => ({ a: g.int(1, 9), b: g.int(1, 9) }), ({ a, b }) => a + b <= 10 && allDistinct([a * b, 10 * (a + b), 10 * (a + b) - a * b, 0]));
      return {
        params: { a, b },
        promptText: r`$A$ and $B$ are independent with $P(A) = ${dec(a / 10)}$ and $P(B) = ${dec(b / 10)}$. What is $P(A \cap B)$?`,
        options: [
          { id: 'a', label: `$${dec((a * b) / 100)}$`, value: (a * b) / 100 },
          { id: 'b', label: `$${dec((a + b) / 10)}$`, value: (a + b) / 10, trapExplanation: r`Adding gives (at most) the union, "$A$ or $B$". "And" multiplies for independent events.` },
          { id: 'c', label: `$${dec((10 * (a + b) - a * b) / 100)}$`, value: (10 * (a + b) - a * b) / 100, trapExplanation: r`That is $P(A \cup B) = P(A) + P(B) - P(A)P(B)$.` },
          { id: 'd', label: '$0$', value: 0, trapExplanation: r`0 would mean disjoint. Independent events with positive probabilities always overlap.` },
        ],
        stepByStepSolution: [
          r`Independent: $P(A \cap B) = P(A)\,P(B)$.`,
          r`$= ${dec(a / 10)}\cdot${dec(b / 10)}$.`,
          r`$= ${dec((a * b) / 100)}$.`,
        ],
      };
    },
  },
  {
    id: 'pr-02-x6',
    difficulty: 2,
    keyConceptTag: "Bayes' theorem",
    correctOptionId: 'a',
    generate: (g) => {
      const { m, n } = g.until(
        () => ({ m: g.int(1, 3), n: g.int(3, 8) }),
        ({ m, n }) => m < n && allDistinct([(2 * m) / (n + m), m / n, 1 / 2, m / (n + m)]),
      );
      return {
        params: { m, n },
        promptText: r`A bag holds ${n} coins: ${m} with heads on both sides, the rest fair. A coin is picked at random and tossed; it lands heads. What is the probability that it is a two-headed coin?`,
        options: [
          { id: 'a', label: `$${frac(2 * m, n + m)}$`, value: (2 * m) / (n + m) },
          { id: 'b', label: `$${frac(m, n)}$`, value: m / n, trapExplanation: r`That is the prior. Heads is more likely with a two-headed coin, so the probability goes up.` },
          { id: 'c', label: r`$\tfrac12$`, value: 1 / 2, trapExplanation: r`There is no reason for $\frac12$: the answer depends on how many coins of each kind there are.` },
          { id: 'd', label: `$${frac(m, n + m)}$`, value: m / (n + m), trapExplanation: r`A two-headed coin gives heads with probability 1, a fair one with $\frac12$: weigh the ${m} special coin${m === 1 ? '' : 's'} by 1 and the ${n - m} fair by $\frac12$.` },
        ],
        stepByStepSolution: [
          r`$P(H \mid \text{two-headed}) = 1$, $P(H \mid \text{fair}) = \frac12$; priors $\frac{${m}}{${n}}$ and $\frac{${n - m}}{${n}}$.`,
          r`$P(\text{two-headed} \mid H) = \dfrac{1\cdot\frac{${m}}{${n}}}{1\cdot\frac{${m}}{${n}} + \frac12\cdot\frac{${n - m}}{${n}}} = \dfrac{${2 * m}}{${2 * m} + ${n - m}}$.`,
          r`$= ${frac(2 * m, n + m)}$.`,
        ],
      };
    },
  },
];
