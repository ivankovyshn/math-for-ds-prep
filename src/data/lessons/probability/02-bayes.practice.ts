import type { QuestionTemplate } from '../../../types.ts';
import { r } from '../define.ts';
import { allDistinct, dec, frac, gcd, shuffle } from '../gen.ts';
import { approx } from './01-spaces.practice.ts';

/** A 2×2 table of counts as a display formula. */
export const table = (rows: [string, string], cols: [string, string], n: number[]) =>
  `\\begin{array}{l|cc} & \\text{${cols[0]}} & \\text{${cols[1]}} \\\\ \\hline \\text{${rows[0]}} & ${n[0]} & ${n[1]} \\\\ \\text{${rows[1]}} & ${n[2]} & ${n[3]} \\end{array}`;
export const pct = (x: number) => `${dec(Math.round(x * 1e4) / 100)}\\%`;
const STATEMENTS = [
  'Independent: $P(A \\cap B) = P(A)\\,P(B)$',
  'Dependent: $P(A \\mid B) \\ne P(A)$',
  'Dependent, because $A$ and $B$ can happen together',
  'Independent, because neither event causes the other',
];

export const practice: QuestionTemplate[] = [
  {
    id: 'pr-02-1',
    difficulty: 1,
    keyConceptTag: 'Conditional probability from a table',
    correctOptionId: 'a',
    generate: (g) => {
      const n = g.until(
        () => [g.int(5, 30), g.int(2, 15), g.int(3, 20), g.int(2, 20)],
        ([a, b, c, d]) => allDistinct([a / (a + b), a / (a + b + c + d), a / (a + c), (a + c) / (a + b + c + d)]),
      );
      const [a, b, c] = n;
      const N = n[0] + n[1] + n[2] + n[3];
      return {
        params: { n },
        promptText: r`A class is surveyed. What is the probability that a student passed, given that the student studied?`,
        mathFormula: table(['studied', "didn't study"], ['passed', 'failed'], n),
        options: [
          { id: 'a', label: `$${frac(a, a + b)}$`, value: a / (a + b) },
          { id: 'b', label: `$${frac(a, N)}$`, value: a / N, trapExplanation: r`That is $P(\text{studied and passed})$ over all ${N} students. Given "studied", only the ${a + b} who studied count.` },
          { id: 'c', label: `$${frac(a, a + c)}$`, value: a / (a + c), trapExplanation: r`That is the reverse, $P(\text{studied} \mid \text{passed})$: it divides by the ${a + c} who passed.` },
          { id: 'd', label: `$${frac(a + c, N)}$`, value: (a + c) / N, trapExplanation: r`That is $P(\text{passed})$ for everyone, ignoring the condition.` },
        ],
        stepByStepSolution: [
          r`Condition on "studied": the first row, ${a} + ${b} = ${a + b} students.`,
          r`Of those, ${a} passed.`,
          r`$P(\text{passed} \mid \text{studied}) = \frac{${a}}{${a + b}} = ${frac(a, a + b)}$.`,
        ],
      };
    },
  },
  {
    id: 'pr-02-2',
    difficulty: 1,
    keyConceptTag: 'The multiplication rule',
    correctOptionId: 'a',
    generate: (g) => {
      const { p, q } = g.until(
        () => ({ p: g.int(1, 9), q: g.int(1, 9) }),
        ({ p, q }) => allDistinct([p * q, 10 * q, 10 * p, p * (10 - q)]),
      );
      const P = (x: number) => dec(x / 100);
      return {
        params: { p, q },
        promptText: r`${p * 10}% of emails contain a link, and ${q * 10}% of the emails with a link are spam. What is the probability that a random email contains a link <i>and</i> is spam?`,
        options: [
          { id: 'a', label: `$${P(p * q)}$`, value: (p * q) / 100 },
          { id: 'b', label: `$${P(10 * q)}$`, value: q / 10, trapExplanation: r`That is $P(\text{spam} \mid \text{link})$, which applies only within the emails with a link.` },
          { id: 'c', label: `$${P(10 * p)}$`, value: p / 10, trapExplanation: r`That is $P(\text{link})$ alone.` },
          { id: 'd', label: `$${P(p * (10 - q))}$`, value: (p * (10 - q)) / 100, trapExplanation: r`That is $P(\text{link and not spam})$.` },
        ],
        stepByStepSolution: [
          r`$P(\text{link} \cap \text{spam}) = P(\text{spam} \mid \text{link})\,P(\text{link})$.`,
          r`$= ${dec(q / 10)}\cdot${dec(p / 10)}$.`,
          r`$= ${P(p * q)}$.`,
        ],
      };
    },
  },
  {
    id: 'pr-02-3',
    difficulty: 2,
    keyConceptTag: 'Law of total probability',
    correctOptionId: 'a',
    generate: (g) => {
      const { w, d1, d2 } = g.until(
        () => ({ w: 10 * g.int(2, 8), d1: g.int(1, 9), d2: g.int(1, 9) }),
        ({ w, d1, d2 }) => d1 !== d2 && w !== 50 && allDistinct([w * d1 + (100 - w) * d2, 50 * (d1 + d2), 100 * (d1 + d2), w * d1]),
      );
      const tot = (w * d1 + (100 - w) * d2) / 100;
      return {
        params: { w, d1, d2 },
        promptText: r`Machine 1 makes ${w}% of the items, of which ${d1}% are defective; machine 2 makes the rest, of which ${d2}% are defective. What percentage of all items is defective?`,
        options: [
          { id: 'a', label: `$${dec(tot)}\\%$`, value: tot },
          { id: 'b', label: `$${dec((d1 + d2) / 2)}\\%$`, value: (d1 + d2) / 2, trapExplanation: r`The plain average ignores that the machines make different shares (${w}% and ${100 - w}%).` },
          { id: 'c', label: `$${d1 + d2}\\%$`, value: d1 + d2, trapExplanation: r`Each defect rate applies only to its own machine's share; weight them, don't add them.` },
          { id: 'd', label: `$${dec((w * d1) / 100)}\\%$`, value: (w * d1) / 100, trapExplanation: r`That counts only machine 1's defects. Add machine 2's: $${dec((100 - w) / 100)}\cdot${d2}\%$.` },
        ],
        stepByStepSolution: [
          r`$P(D) = P(D \mid M_1)P(M_1) + P(D \mid M_2)P(M_2)$.`,
          r`$= ${d1}\%\cdot${dec(w / 100)} + ${d2}\%\cdot${dec((100 - w) / 100)}$.`,
          r`$= ${dec(tot)}\%$.`,
        ],
      };
    },
  },
  {
    id: 'pr-02-4',
    difficulty: 2,
    keyConceptTag: "Bayes' theorem and base rates",
    correctOptionId: 'a',
    generate: (g) => {
      const { p, s, f } = g.until(
        () => ({ p: g.pick([1, 2, 5, 10]), s: g.pick([80, 90, 95]), f: g.pick([2, 5, 10]) }),
        ({ p, s, f }) => {
          const TP = p * s;
          const FP = (100 - p) * f;
          return allDistinct([TP / (TP + FP), s / 100, p / 100, 1 - f / 100].map((x) => Math.round(x * 1000)));
        },
      );
      const TP = p * s;
      const FP = (100 - p) * f;
      return {
        params: { p, s, f },
        promptText: r`A disease affects ${p}% of people. A test detects it in ${s}% of sick people, and gives a false positive for ${f}% of healthy people. A person tests positive. What is the probability that they are sick?`,
        options: [
          { id: 'a', label: `$${approx(TP / (TP + FP), 3)}$`, value: TP / (TP + FP) },
          { id: 'b', label: `$${dec(s / 100)}$`, value: s / 100, trapExplanation: r`${s}% is $P(+ \mid \text{sick})$. The question asks the reverse, $P(\text{sick} \mid +)$.` },
          { id: 'c', label: `$${dec(p / 100)}$`, value: p / 100, trapExplanation: r`That is the prior. A positive test is evidence and must raise it.` },
          { id: 'd', label: `$${dec(1 - f / 100)}$`, value: 1 - f / 100, trapExplanation: r`$${dec(1 - f / 100)}$ is $P(- \mid \text{healthy})$, the specificity — not a probability of being sick.` },
        ],
        stepByStepSolution: [
          r`Out of 10 000 people: ${100 * p} sick, of whom ${TP} test positive; ${10000 - 100 * p} healthy, of whom ${FP} test positive.`,
          r`$P(\text{sick} \mid +) = \frac{${TP}}{${TP} + ${FP}} = \frac{${TP}}{${TP + FP}}$.`,
          TP / (TP + FP) < 0.5
            ? r`$${approx(TP / (TP + FP), 3)}$: most positive tests come from the large healthy group, so a positive result is far from certain.`
            : r`$${approx(TP / (TP + FP), 3)}$: here the false positives (${FP}) are few compared with the true positives (${TP}).`,
        ],
      };
    },
  },
  {
    id: 'pr-02-5',
    difficulty: 3,
    keyConceptTag: "Bayes' theorem with several hypotheses",
    correctOptionId: 'a',
    generate: (g) => {
      const { rs, ns } = g.until(
        () => {
          const ns = [g.int(3, 8), g.int(3, 8), g.int(3, 8)];
          return { ns, rs: ns.map((n) => g.int(1, n - 1)) };
        },
        ({ rs, ns }) => {
          const L = ns.reduce((acc, n) => (acc * n) / gcd(acc, n), 1);
          const w = rs.map((x, i) => (x * L) / ns[i]);
          const post = w[0] / (w[0] + w[1] + w[2]);
          return allDistinct([post, rs[0] / ns[0], 1 / 3, rs[0] / (rs[0] + rs[1] + rs[2])]);
        },
      );
      const L = ns.reduce((acc, n) => (acc * n) / gcd(acc, n), 1);
      const w = rs.map((x, i) => (x * L) / ns[i]);
      const W = w[0] + w[1] + w[2];
      const R = rs[0] + rs[1] + rs[2];
      return {
        params: { rs, ns },
        promptText: r`Three urns contain ${rs.map((x, i) => `${x} red of ${ns[i]}`).join(', ')} balls respectively. An urn is chosen at random (each with probability $\frac13$) and a ball drawn from it is red. What is the probability that it came from urn 1?`,
        options: [
          { id: 'a', label: `$${frac(w[0], W)}$`, value: w[0] / W },
          { id: 'b', label: `$${frac(rs[0], ns[0])}$`, value: rs[0] / ns[0], trapExplanation: r`That is $P(\text{red} \mid \text{urn 1})$, the likelihood, not the posterior.` },
          { id: 'c', label: r`$\tfrac13$`, value: 1 / 3, trapExplanation: r`That is the prior. Drawing red favours the urns with a higher share of red.` },
          { id: 'd', label: `$${frac(rs[0], R)}$`, value: rs[0] / R, trapExplanation: r`Pooling all red balls treats them as equally likely, but a ball in a small urn is more likely to be drawn than one in a large urn.` },
        ],
        stepByStepSolution: [
          r`Likelihoods: $P(\text{red} \mid U_i) = ${rs.map((x, i) => frac(x, ns[i])).join(',\\ ')}$, priors $\frac13$ each.`,
          r`$P(U_1 \mid \text{red}) = \dfrac{${frac(rs[0], ns[0])}\cdot\frac13}{\big(${rs.map((x, i) => frac(x, ns[i])).join(' + ')}\big)\cdot\frac13}$; the $\frac13$ cancels.`,
          r`$= \frac{${w[0]}}{${w[0]} + ${w[1]} + ${w[2]}} = ${frac(w[0], W)}$ (multiplying through by ${L}).`,
        ],
      };
    },
  },
  {
    id: 'pr-02-6',
    difficulty: 3,
    keyConceptTag: 'Testing independence',
    correctOptionId: 'a',
    generate: (g) => {
      const { a, b, delta } = g.until(
        () => ({ a: g.int(2, 8), b: g.int(2, 8), delta: g.pick([0, 0, -3, -2, 2, 3]) }),
        ({ a, b, delta }) => {
          const n = [a * b + delta, a * (10 - b) - delta, (10 - a) * b - delta, (10 - a) * (10 - b) + delta];
          return n.every((x) => x > 0);
        },
      );
      const n = [a * b + delta, a * (10 - b) - delta, (10 - a) * b - delta, (10 - a) * (10 - b) + delta];
      const indep = delta === 0;
      const order = [indep ? 0 : 1, ...shuffle(g, [0, 1, 2, 3].filter((k) => k !== (indep ? 0 : 1)))];
      const why = [
        r`Here $P(A \cap B) = ${dec(n[0] / 100)}$ but $P(A)P(B) = ${dec((a * b) / 100)}$.`,
        r`Here $P(A \mid B) = \frac{${n[0]}}{${10 * b}} = ${dec(n[0] / (10 * b))}$ equals $P(A) = ${dec(a / 10)}$.`,
        r`Overlap says nothing about dependence: compare $P(A \cap B)$ with $P(A)P(B)$.`,
        r`Independence is a statement about probabilities, not about causes; check $P(A \cap B) = P(A)P(B)$.`,
      ];
      return {
        params: { n, order },
        promptText: r`100 people are classified by two events $A$ and $B$ (counts below). Are $A$ and $B$ independent?`,
        mathFormula: table(['A', 'not A'], ['B', 'not B'], n),
        options: order.map((k, i) => ({
          id: 'abcd'[i],
          label: STATEMENTS[k],
          ...(i === 0 ? {} : { trapExplanation: k === 0 ? why[0] : k === 1 ? why[1] : why[k] }),
        })),
        stepByStepSolution: [
          r`$P(A) = \frac{${n[0] + n[1]}}{100} = ${dec(a / 10)}$, $P(B) = \frac{${n[0] + n[2]}}{100} = ${dec(b / 10)}$, so $P(A)P(B) = ${dec((a * b) / 100)}$.`,
          r`$P(A \cap B) = \frac{${n[0]}}{100} = ${dec(n[0] / 100)}$.`,
          indep ? r`They are equal: $A$ and $B$ are independent.` : r`They differ: $A$ and $B$ are dependent, even though the totals look ordinary.`,
        ],
      };
    },
  },
];
