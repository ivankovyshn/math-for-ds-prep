import { defineLesson, r } from '../define.ts';
import { extra } from './04-proofs.extra.ts';

export default defineLesson({
  id: 'ml-04',
  moduleId: 'intro',
  title: 'Proof techniques',
  blurb: 'Direct proof, contrapositive, contradiction, counterexample',
  minutes: 8,
  lecture: [
    {
      title: 'What counts as a proof',
      blocks: [
        {
          kind: 'text',
          text: r`A <i>proof</i> is a chain of steps, each following from definitions, earlier results or previous steps, that ends with the claim. Checking examples is not a proof: a statement about <i>all</i> integers cannot be confirmed by trying a million of them.

Most first-year proofs use one of four patterns.`,
        },
        {
          kind: 'box',
          variant: 'definition',
          title: 'Even and odd',
          text: r`An integer $n$ is <i>even</i> if $n = 2k$ for some integer $k$, and <i>odd</i> if $n = 2k + 1$. Proofs about parity start by writing these definitions down.`,
        },
      ],
    },
    {
      title: 'Direct proof',
      blocks: [
        {
          kind: 'text',
          text: r`To prove $P \Rightarrow Q$: assume $P$, unfold the definitions, compute, arrive at $Q$.`,
        },
        {
          kind: 'example',
          title: 'Odd plus odd is even',
          prompt: r`Prove: if $m$ and $n$ are odd, then $m + n$ is even.`,
          steps: [
            r`Assume $m$, $n$ odd: $m = 2a + 1$ and $n = 2b + 1$ for some integers $a$, $b$. Use different letters — $m$ and $n$ need not be equal.`,
            r`$m + n = 2a + 2b + 2 = 2(a + b + 1)$.`,
            r`$a + b + 1$ is an integer, so $m + n$ is even. $\blacksquare$`,
          ],
        },
        {
          kind: 'quiz',
          id: 'ml-04-q1',
          prompt: r`Write two odd numbers as $2a + 1$ and $2b + 1$. What does their sum show?`,
          options: [
            { id: 'a', label: r`The sum $2(a + b + 1)$ is always even` },
            { id: 'b', label: r`The sum is always odd`, trapExplanation: r`$(2a + 1) + (2b + 1) = 2a + 2b + 2$: the two 1s add up to 2, which is even.` },
            { id: 'c', label: r`It can be even or odd`, trapExplanation: r`The algebra covers every pair of odd numbers at once, so there is only one possible answer.` },
          ],
          correctOptionId: 'a',
          explanation: r`$(2a + 1) + (2b + 1) = 2(a + b + 1)$, which has the form $2m$. That is a complete direct proof: it works for <i>every</i> $a$, $b$.`,
        },
      ],
    },
    {
      title: 'Contrapositive and contradiction',
      blocks: [
        {
          kind: 'text',
          text: r`<i>Contrapositive:</i> since $P \Rightarrow Q \equiv \neg Q \Rightarrow \neg P$, you may assume $\neg Q$ and prove $\neg P$. Useful when $\neg Q$ gives you something concrete to compute with.

<i>Example.</i> "If $n^2$ is even, then $n$ is even." Directly, knowing $n^2 = 2k$ tells you little about $n$. Contrapositive: if $n = 2k + 1$ is odd, then $n^2 = 4k^2 + 4k + 1 = 2(2k^2 + 2k) + 1$ is odd. Done.

<i>Contradiction:</i> assume the claim is false and derive something impossible. Then the claim must be true.`,
        },
        {
          kind: 'example',
          title: '√2 is irrational',
          prompt: r`Prove that $\sqrt2$ is not a fraction.`,
          steps: [
            r`Suppose $\sqrt2 = \frac{p}{q}$ with integers $p, q$, and the fraction in lowest terms (no common factor).`,
            r`Squaring: $p^2 = 2q^2$, so $p^2$ is even, hence $p$ is even (the contrapositive result above): $p = 2m$.`,
            r`Then $4m^2 = 2q^2$, so $q^2 = 2m^2$ is even and $q$ is even.`,
            r`Both $p$ and $q$ are even — they share the factor 2, contradicting lowest terms. So $\sqrt2$ is irrational. $\blacksquare$`,
          ],
        },
        {
          kind: 'quiz',
          id: 'ml-04-q2',
          prompt: r`To prove "if $n^2$ is even, then $n$ is even" by contrapositive, you…`,
          options: [
            { id: 'a', label: r`assume $n$ is odd and show $n^2$ is odd` },
            { id: 'b', label: r`assume $n^2$ is odd and show $n$ is odd`, trapExplanation: r`This proves "if $n$ is even then $n^2$ is even" — the converse, a different statement.` },
            { id: 'c', label: r`assume $n$ is even and show $n^2$ is even`, trapExplanation: r`This proves the converse directly. It says nothing about the original implication.` },
          ],
          correctOptionId: 'a',
          explanation: r`The contrapositive of $P \Rightarrow Q$ is $\neg Q \Rightarrow \neg P$: assume "not $n$ even" and show "not $n^2$ even".`,
        },
      ],
    },
    {
      title: 'Counterexamples',
      blocks: [
        {
          kind: 'text',
          text: r`To <i>disprove</i> a "for all" statement, one counterexample is enough — and it is a complete, rigorous argument.

Examples can be deceiving. $n^2 + n + 41$ is prime for $n = 0, 1, 2, \dots, 39$. But for $n = 40$ it equals $40^2 + 40 + 41 = 40\cdot41 + 41 = 41^2$.`,
        },
        {
          kind: 'box',
          variant: 'pitfall',
          title: 'Hidden division by zero',
          text: r`A "proof" that $1 = 2$: let $a = b$; then $a^2 - b^2 = ab - b^2$, i.e. $(a + b)(a - b) = b(a - b)$; cancel $(a - b)$ to get $a + b = b$, so $2b = b$ and $2 = 1$. The cancellation divides by $a - b = 0$. Always check that what you divide by is non-zero.`,
        },
        {
          kind: 'quiz',
          id: 'ml-04-q3',
          prompt: r`What is enough to prove "there exists an integer $n$ with $n^2 = 2n$"?`,
          options: [
            { id: 'a', label: r`One example, such as $n = 2$` },
            { id: 'b', label: r`A proof that $n^2 = 2n$ for every integer $n$`, trapExplanation: r`That would be a much stronger claim — and it is false ($n = 1$). An existence claim needs only one witness.` },
            { id: 'c', label: r`A counterexample`, trapExplanation: r`A counterexample disproves a "for all" claim. Here we are proving an "exists" claim.` },
          ],
          correctOptionId: 'a',
          explanation: r`An existence claim needs just one example: $2^2 = 4 = 2 \cdot 2$ (or $n = 0$). No general argument is required.`,
        },
      ],
    },
    {
      title: 'Summary',
      blocks: [
        {
          kind: 'text',
          text: r`• Direct: assume $P$, unfold definitions, reach $Q$.

• Contrapositive: assume $\neg Q$, reach $\neg P$.

• Contradiction: assume the claim fails, reach something impossible.

• "For all" is disproved by one counterexample; "there exists" is proved by one example. Examples never prove a "for all".`,
        },
      ],
    },
  ],
  extra,
  questions: [
    {
      id: 'ml-04-1',
      difficulty: 1,
      promptText: r`To prove $P \Rightarrow Q$ by <i>contrapositive</i>, what do you assume and what do you show?`,
      options: [
        { id: 'a', label: r`Assume $\neg Q$, show $\neg P$` },
        { id: 'b', label: r`Assume $Q$, show $P$`, trapExplanation: r`That proves the converse $Q \Rightarrow P$, a different statement.` },
        { id: 'c', label: r`Assume $\neg P$, show $\neg Q$`, trapExplanation: r`That proves $\neg P \Rightarrow \neg Q$, which is equivalent to the converse, not to $P \Rightarrow Q$.` },
        { id: 'd', label: r`Assume $P$ and $\neg Q$, reach a contradiction`, trapExplanation: r`That is a valid method too, but it is proof by <i>contradiction</i>, not by contrapositive.` },
      ],
      correctOptionId: 'a',
      stepByStepSolution: [
        r`The contrapositive of $P \Rightarrow Q$ is $\neg Q \Rightarrow \neg P$.`,
        r`They have the same truth table, so proving one proves the other.`,
        r`A direct proof of $\neg Q \Rightarrow \neg P$ assumes $\neg Q$ and derives $\neg P$.`,
      ],
      keyConceptTag: 'Proof by contrapositive',
    },
    {
      id: 'ml-04-2',
      difficulty: 1,
      promptText: r`An integer has the form $n = 3k + 2$. What remainder does $n^2$ leave on division by $3$?`,
      options: [
        { id: 'a', label: '$1$', value: 1 },
        { id: 'b', label: '$2$', value: 2, trapExplanation: r`Squaring changes the remainder: $(3k + 2)^2 = 9k^2 + 12k + 4$, and $4$ leaves remainder 1.` },
        { id: 'c', label: '$4$', value: 4, trapExplanation: r`A remainder on division by 3 is $0$, $1$ or $2$. $4 = 3 + 1$, so the remainder is 1.` },
        { id: 'd', label: '$0$', value: 0, trapExplanation: r`Only multiples of 3 have squares divisible by 3. Check $k = 0$: $n = 2$, $n^2 = 4$.` },
      ],
      correctOptionId: 'a',
      stepByStepSolution: [
        r`$(3k + 2)^2 = 9k^2 + 12k + 4$.`,
        r`$= 3(3k^2 + 4k + 1) + 1$.`,
        r`Remainder $1$. (Check: $5^2 = 25 = 3\cdot8 + 1$.)`,
      ],
      keyConceptTag: 'Working with remainders',
    },
    {
      id: 'ml-04-3',
      difficulty: 2,
      promptText: r`Which statement about integers is <i>false</i>?`,
      options: [
        { id: 'a', label: r`For every integer $n$, $n^2 + 1$ is odd` },
        { id: 'b', label: r`For every integer $n$, $n^2 - n$ is even`, trapExplanation: r`$n^2 - n = n(n - 1)$ is a product of two consecutive integers, one of which is even. True.` },
        { id: 'c', label: r`For every integer $n$, $n^3 - n$ is divisible by 6`, trapExplanation: r`$n^3 - n = (n - 1)n(n + 1)$: among three consecutive integers one is even and one is a multiple of 3. True.` },
        { id: 'd', label: r`For every integer $n$, $2n + 1$ is odd`, trapExplanation: r`$2n + 1$ is the definition of an odd number. True.` },
      ],
      correctOptionId: 'a',
      stepByStepSolution: [
        r`To show a "for all" statement is false, find one counterexample.`,
        r`$n = 1$: $n^2 + 1 = 2$, which is even. So (a) is false.`,
        r`In general $n^2 + 1$ is odd exactly when $n$ is even.`,
      ],
      keyConceptTag: 'Disproof by counterexample',
    },
    {
      id: 'ml-04-4',
      difficulty: 2,
      promptText: r`Which $n$ is a counterexample to "for every integer $n \ge 1$, $n^2 + n + 41$ is prime"?`,
      options: [
        { id: 'a', label: '$40$', value: 40 },
        { id: 'b', label: '$39$', value: 39, trapExplanation: r`$39^2 + 39 + 41 = 1601$, which is prime. The formula survives up to 39 — that is why it is famous.` },
        { id: 'c', label: '$10$', value: 10, trapExplanation: r`$100 + 10 + 41 = 151$ is prime. Small values do not break this formula.` },
        { id: 'd', label: '$1$', value: 1, trapExplanation: r`$1 + 1 + 41 = 43$, which is prime.` },
      ],
      correctOptionId: 'a',
      stepByStepSolution: [
        r`Look for an $n$ that makes every term share a factor. With $n = 40$: $40^2 + 40 = 40\cdot41$.`,
        r`So $n^2 + n + 41 = 40\cdot 41 + 41 = 41\cdot41 = 1681$.`,
        r`$1681 = 41^2$ is not prime: one counterexample disproves the claim.`,
      ],
      keyConceptTag: 'Examples are not proofs',
    },
    {
      id: 'ml-04-5',
      difficulty: 3,
      promptText: r`Find the invalid step in this "proof" that $2 = 1$. Let $a = b \ne 0$.

• (1) $a^2 = ab$

• (2) $a^2 - b^2 = ab - b^2$

• (3) $(a + b)(a - b) = b(a - b)$

• (4) $a + b = b$

• (5) $2b = b$, so $2 = 1$`,
      options: [
        { id: 'a', label: 'Step (4)' },
        { id: 'b', label: 'Step (1)', trapExplanation: r`Multiplying both sides of $a = b$ by $a$ is always allowed.` },
        { id: 'c', label: 'Step (3)', trapExplanation: r`Both factorisations are correct algebra: $a^2 - b^2 = (a + b)(a - b)$ and $ab - b^2 = b(a - b)$.` },
        { id: 'd', label: 'Step (5)', trapExplanation: r`Dividing $2b = b$ by $b$ is fine because $b \ne 0$. The damage happened earlier.` },
      ],
      correctOptionId: 'a',
      stepByStepSolution: [
        r`Going from (3) to (4) divides both sides by $a - b$.`,
        r`Since $a = b$, that is division by $0$, which is not allowed.`,
        r`(3) is true ($0 = 0$); (4) does not follow from it.`,
      ],
      keyConceptTag: 'Hidden division by zero',
    },
    {
      id: 'ml-04-6',
      difficulty: 3,
      promptText: r`Proving that $\sqrt3$ is irrational: assume $\sqrt3 = \frac{p}{q}$ in lowest terms, so $p^2 = 3q^2$. One shows $3 \mid p$ and writes $p = 3m$. What equation follows for $q$?`,
      options: [
        { id: 'a', label: r`$q^2 = 3m^2$` },
        { id: 'b', label: r`$q^2 = 9m^2$`, trapExplanation: r`Substituting gives $9m^2 = 3q^2$; dividing by 3 leaves $3m^2$, not $9m^2$.` },
        { id: 'c', label: r`$q^2 = m^2$`, trapExplanation: r`Both sides were divided by 9, but the right-hand side only has the factor 3.` },
        { id: 'd', label: r`$q = 3m$`, trapExplanation: r`That would mean $p = q$, i.e. $\sqrt3 = 1$. Substitute into $p^2 = 3q^2$ and simplify carefully.` },
      ],
      correctOptionId: 'a',
      stepByStepSolution: [
        r`Substitute $p = 3m$: $9m^2 = 3q^2$.`,
        r`Divide by 3: $q^2 = 3m^2$, so $3 \mid q^2$ and hence $3 \mid q$.`,
        r`Now 3 divides both $p$ and $q$, contradicting lowest terms. So $\sqrt3$ is irrational.`,
      ],
      keyConceptTag: 'Proof by contradiction',
    },
  ],
});
