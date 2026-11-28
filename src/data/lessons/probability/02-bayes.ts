import { defineLesson, r } from '../define.ts';
import { extra } from './02-bayes.extra.ts';
import { practice } from './02-bayes.practice.ts';

export default defineLesson({
  id: 'pr-02',
  moduleId: 'probability',
  title: 'Conditional probability and Bayes',
  blurb: 'Updating probabilities when new information arrives',
  minutes: 8,
  lecture: [
    {
      title: 'Conditioning',
      covers: ['1', 'x1', 'x3'],
      blocks: [
        {
          kind: 'text',
          text: r`Knowing that $B$ happened shrinks the sample space to $B$. The probability of $A$ <i>given</i> $B$ is the share of $B$ in which $A$ also happens:`,
        },
        { kind: 'formula', tex: r`P(A \mid B) = \frac{P(A \cap B)}{P(B)}, \qquad P(B) > 0` },
        {
          kind: 'example',
          title: 'Dice',
          prompt: r`Two dice are rolled and the first shows 3. What is $P(\text{sum} = 8 \mid \text{first} = 3)$?`,
          steps: [
            r`Given the first die is 3, the 6 outcomes $(3, 1), \dots, (3, 6)$ remain, equally likely.`,
            r`Sum 8 needs the second die to be 5: one outcome.`,
            r`$P = \frac16$, larger than the unconditional $\frac{5}{36}$.`,
          ],
        },
        {
          kind: 'quiz',
          id: 'pr-02-q1',
          prompt: r`Two fair coins are tossed and at least one shows heads. What is the probability that both are heads?`,
          options: [
            { id: 'a', label: r`$\tfrac13$`, value: 1 / 3 },
            { id: 'b', label: r`$\tfrac12$`, value: 1 / 2, trapExplanation: r`"At least one head" leaves three equally likely outcomes, HH, HT and TH, not two.` },
            { id: 'c', label: r`$\tfrac14$`, value: 1 / 4, trapExplanation: r`$\frac14$ is the unconditional $P(HH)$. The information removes TT.` },
          ],
          correctOptionId: 'a',
          explanation: r`$P(HH \mid \text{at least one H}) = \frac{1/4}{3/4} = \frac13$.`,
        },
      ],
    },
    {
      title: 'Multiplication rule and total probability',
      covers: ['2', '3', 'x2', 'x4'],
      blocks: [
        { kind: 'formula', tex: r`P(A \cap B) = P(A \mid B)\,P(B), \qquad P(A) = \sum_i P(A \mid B_i)\,P(B_i)` },
        {
          kind: 'text',
          text: r`The second formula — the law of total probability — splits $\Omega$ into disjoint cases $B_1, B_2, \dots$ and averages the conditional probabilities, weighted by how likely each case is.`,
        },
        {
          kind: 'quiz',
          id: 'pr-02-q2',
          prompt: r`Machine 1 makes 60% of the items with 2% defective; machine 2 makes 40% with 5% defective. What share of all items is defective?`,
          options: [
            { id: 'a', label: r`$3.2\%$`, value: 3.2 },
            { id: 'b', label: r`$3.5\%$`, value: 3.5, trapExplanation: r`The plain average of 2% and 5% ignores that machine 1 makes more items.` },
            { id: 'c', label: r`$7\%$`, value: 7, trapExplanation: r`Defect rates of the two machines cannot simply be added: each applies only to its share.` },
          ],
          correctOptionId: 'a',
          explanation: r`$0.6\cdot0.02 + 0.4\cdot0.05 = 0.012 + 0.020 = 0.032$.`,
        },
      ],
    },
    {
      title: "Bayes' theorem",
      covers: ['4', '5', 'x6'],
      blocks: [
        { kind: 'formula', tex: r`P(B \mid A) = \frac{P(A \mid B)\,P(B)}{P(A)} = \frac{P(A \mid B)\,P(B)}{P(A \mid B)P(B) + P(A \mid B^c)P(B^c)}` },
        {
          kind: 'text',
          text: r`Bayes turns $P(\text{evidence} \mid \text{hypothesis})$ into $P(\text{hypothesis} \mid \text{evidence})$. The <i>prior</i> $P(B)$ is updated by the evidence into the <i>posterior</i> $P(B \mid A)$.`,
        },
        { kind: 'diagram', type: 'bayesTree', caption: r`A test for a disease with 1% prevalence, 90% sensitivity and a 5% false-positive rate. Of every 1000 people, 9 are true positives and about 50 are false positives.` },
        {
          kind: 'example',
          title: 'A positive test',
          prompt: r`With the numbers above, what is $P(\text{disease} \mid +)$?`,
          steps: [
            r`$P(+ \mid D)P(D) = 0.9\cdot0.01 = 0.009$; $P(+ \mid D^c)P(D^c) = 0.05\cdot0.99 = 0.0495$.`,
            r`$P(D \mid +) = \frac{0.009}{0.009 + 0.0495} \approx 0.154$.`,
            r`Only about 15%: the disease is rare, so most positives come from the large healthy group.`,
          ],
        },
        {
          kind: 'quiz',
          id: 'pr-02-q3',
          prompt: r`In the example, which number is $P(+ \mid D)$, the sensitivity?`,
          options: [
            { id: 'a', label: '$0.9$', value: 0.9 },
            { id: 'b', label: r`$0.154$`, value: 0.154, trapExplanation: r`0.154 is $P(D \mid +)$, the reverse conditional. Confusing the two is the "base-rate fallacy".` },
            { id: 'c', label: '$0.01$', value: 0.01, trapExplanation: r`0.01 is the prior $P(D)$, the prevalence.` },
          ],
          correctOptionId: 'a',
          explanation: r`Sensitivity is the chance of a positive test <i>for a sick person</i>: $P(+ \mid D) = 0.9$.`,
        },
      ],
    },
    {
      title: 'Independence',
      covers: ['6', 'x5'],
      blocks: [
        {
          kind: 'box',
          variant: 'definition',
          title: 'Independent events',
          text: r`$A$ and $B$ are independent if $P(A \cap B) = P(A)\,P(B)$ — equivalently $P(A \mid B) = P(A)$: learning $B$ does not change the chance of $A$.`,
        },
        {
          kind: 'box',
          variant: 'pitfall',
          title: 'Independent is not disjoint',
          text: r`Disjoint events with positive probabilities are as dependent as can be: if one happens, the other cannot. Independence is about information, not about overlap.`,
        },
        {
          kind: 'box',
          variant: 'tip',
          title: 'Naive Bayes',
          text: r`The naive Bayes classifier computes $P(\text{class} \mid \text{features})$ with Bayes' theorem, assuming the features are independent given the class. The assumption is rarely true, yet the classifier often works well for text and spam filtering.`,
        },
        {
          kind: 'example',
          title: 'Testing independence from a table',
          prompt: r`Of 200 users, 120 use the mobile app ($M$) and 50 bought something ($B$); 30 did both. Are $M$ and $B$ independent?`,
          steps: [
            r`$P(M) = \frac{120}{200} = 0.6$, $P(B) = \frac{50}{200} = 0.25$, $P(M \cap B) = \frac{30}{200} = 0.15$.`,
            r`Independence needs $P(M \cap B) = P(M)\,P(B) = 0.6\cdot0.25 = 0.15$. ✓ They are independent.`,
            r`Equivalently $P(B \mid M) = \frac{30}{120} = 0.25 = P(B)$: knowing $M$ does not change the chance of $B$.`,
          ],
        },
      ],
    },
    {
      title: 'Summary',
      blocks: [
        {
          kind: 'text',
          text: r`• $P(A \mid B) = P(A \cap B)/P(B)$: restrict to $B$.

• $P(A \cap B) = P(A \mid B)P(B)$; total probability averages over cases.

• Bayes: $P(B \mid A) = P(A \mid B)P(B)/P(A)$ — mind the base rate.

• Independent: $P(A \cap B) = P(A)P(B)$; disjoint is not independent.`,
        },
      ],
    },
  ],
  extra,
  questions: practice,
});
