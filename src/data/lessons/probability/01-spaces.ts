import { defineLesson, r } from '../define.ts';
import { extra } from './01-spaces.extra.ts';
import { practice } from './01-spaces.practice.ts';

export default defineLesson({
  id: 'pr-01',
  moduleId: 'probability',
  title: 'Probability spaces',
  blurb: 'Outcomes, events and the rules every probability obeys',
  minutes: 8,
  lecture: [
    {
      title: 'Outcomes and events',
      blocks: [
        {
          kind: 'text',
          text: r`A random experiment has a <i>sample space</i> $\Omega$, the set of all possible outcomes. An <i>event</i> is a subset of $\Omega$ — so union, intersection and complement from the sets lesson become "or", "and" and "not".`,
        },
        {
          kind: 'text',
          text: r`When all outcomes are equally likely, probability is counting:`,
        },
        { kind: 'formula', tex: r`P(A) = \frac{|A|}{|\Omega|}` },
        { kind: 'diagram', type: 'diceGrid', caption: r`Two dice: 36 equally likely ordered pairs. The six highlighted pairs have sum 7, so $P(\text{sum} = 7) = \frac{6}{36} = \frac16$.` },
        {
          kind: 'quiz',
          id: 'pr-01-q1',
          prompt: r`Two fair dice are rolled. What is $P(\text{sum} = 8)$?`,
          options: [
            { id: 'a', label: r`$\tfrac{5}{36}$`, value: 5 / 36 },
            { id: 'b', label: r`$\tfrac{1}{11}$`, value: 1 / 11, trapExplanation: r`The 11 possible sums are not equally likely. Count ordered pairs: $(2,6), (3,5), (4,4), (5,3), (6,2)$.` },
            { id: 'c', label: r`$\tfrac{3}{21}$`, value: 3 / 21, trapExplanation: r`Unordered pairs are not equally likely: $\{3, 5\}$ happens two ways, $\{4, 4\}$ only one.` },
          ],
          correctOptionId: 'a',
          explanation: r`Five ordered pairs out of 36: $\frac{5}{36}$.`,
        },
      ],
    },
    {
      title: 'The rules of probability',
      blocks: [
        {
          kind: 'box',
          variant: 'definition',
          title: 'Axioms (Kolmogorov)',
          text: r`• $P(A) \ge 0$ for every event $A$.

• $P(\Omega) = 1$.

• If $A$ and $B$ are disjoint, $P(A \cup B) = P(A) + P(B)$ (and likewise for countably many).`,
        },
        {
          kind: 'text',
          text: r`Everything else follows. Two consequences used constantly:`,
        },
        { kind: 'formula', tex: r`P(A^c) = 1 - P(A), \qquad P(A \cup B) = P(A) + P(B) - P(A \cap B)` },
        {
          kind: 'quiz',
          id: 'pr-01-q2',
          prompt: r`$P(A) = 0.5$, $P(B) = 0.4$ and $P(A \cap B) = 0.2$. What is $P(A \cup B)$?`,
          options: [
            { id: 'a', label: '$0.7$', value: 0.7 },
            { id: 'b', label: '$0.9$', value: 0.9, trapExplanation: r`Adding counts the overlap $A \cap B$ twice; subtract it once.` },
            { id: 'c', label: '$0.5$', value: 0.5, trapExplanation: r`That subtracts the overlap twice, which gives "exactly one of the two".` },
          ],
          correctOptionId: 'a',
          explanation: r`$0.5 + 0.4 - 0.2 = 0.7$.`,
        },
      ],
    },
    {
      title: 'Counting',
      blocks: [
        {
          kind: 'text',
          text: r`• Multiplication principle: $k$ steps with $n_1, \dots, n_k$ choices give $n_1 n_2\cdots n_k$ outcomes.

• Orderings of $n$ distinct objects: $n!$.

• Ways to choose $k$ of $n$ (order irrelevant): $\binom{n}{k} = \frac{n!}{k!\,(n - k)!}$.`,
        },
        {
          kind: 'example',
          title: 'Heads in four tosses',
          prompt: r`Toss a fair coin 4 times. What is $P(\text{exactly 2 heads})$?`,
          steps: [
            r`$|\Omega| = 2^4 = 16$ equally likely sequences.`,
            r`Sequences with exactly 2 heads: choose the 2 positions, $\binom42 = 6$.`,
            r`$P = \frac{6}{16} = \frac38$. Note: "0, 1, 2, 3 or 4 heads" are five outcomes, but not equally likely ones.`,
          ],
        },
        {
          kind: 'quiz',
          id: 'pr-01-q3',
          prompt: r`In how many ways can you choose 2 of 5 people for a committee?`,
          options: [
            { id: 'a', label: '$10$', value: 10 },
            { id: 'b', label: '$20$', value: 20, trapExplanation: r`$5\cdot4 = 20$ counts ordered pairs; each committee appears twice.` },
            { id: 'c', label: '$25$', value: 25, trapExplanation: r`$5^2$ allows choosing the same person twice and counts order.` },
          ],
          correctOptionId: 'a',
          explanation: r`$\binom52 = \frac{5\cdot4}{2} = 10$.`,
        },
      ],
    },
    {
      title: 'The complement trick',
      blocks: [
        {
          kind: 'text',
          text: r`"At least one" is usually easiest through its complement, "none":`,
        },
        {
          kind: 'example',
          title: 'At least one six',
          prompt: r`Roll a die 4 times. What is $P(\text{at least one six})$?`,
          steps: [
            r`$P(\text{no six}) = \big(\frac56\big)^4 = \frac{625}{1296}$, because each roll independently avoids 6 with probability $\frac56$.`,
            r`$P(\text{at least one six}) = 1 - \frac{625}{1296} = \frac{671}{1296} \approx 0.52$.`,
            r`Tempting but wrong: $4\cdot\frac16 = \frac23$. That adds overlapping events — with 7 rolls it would exceed 1.`,
          ],
        },
        {
          kind: 'box',
          variant: 'pitfall',
          title: 'Equally likely?',
          text: r`$P(A) = |A|/|\Omega|$ only works when every outcome really is equally likely. Sums of dice, numbers of heads, or "it either happens or it doesn't" are not uniform sample spaces.`,
        },
      ],
    },
    {
      title: 'Summary',
      blocks: [
        {
          kind: 'text',
          text: r`• Sample space $\Omega$, events are subsets; equally likely outcomes: $P(A) = |A|/|\Omega|$.

• $P(A^c) = 1 - P(A)$; $P(A \cup B) = P(A) + P(B) - P(A \cap B)$.

• Counting: $n!$ orderings, $\binom nk$ choices.

• "At least one" $= 1 - P(\text{none})$.`,
        },
      ],
    },
  ],
  extra,
  questions: practice,
});
