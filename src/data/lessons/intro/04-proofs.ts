import { defineLesson, r } from '../define.ts';
import { extra } from './04-proofs.extra.ts';
import { practice } from './04-proofs.practice.ts';

export default defineLesson({
  id: 'ml-04',
  moduleId: 'intro',
  title: 'Proof techniques',
  blurb: 'Direct proof, contrapositive, contradiction, counterexample',
  minutes: 8,
  deeper: [
    { title: 'Book of Proof, chapters 4–6: direct proof, contrapositive and contradiction', url: 'https://richardhammack.github.io/BookOfProof/', source: 'Richard Hammack, Book of Proof · free textbook' },
  ],
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
      covers: ['2', 'x2', 'x4', 'x5'],
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
          kind: 'example',
          title: 'Working with remainders',
          prompt: r`An integer has the form $n = 3k + 2$. What remainder does $n^2$ leave on division by 3?`,
          steps: [
            r`$n^2 = (3k + 2)^2 = 9k^2 + 12k + 4$.`,
            r`Split off everything divisible by 3: $9k^2 + 12k + 3 + 1 = 3(3k^2 + 4k + 1) + 1$.`,
            r`So $n^2$ leaves remainder 1 for <i>every</i> $k$ — which makes this a proof, not just an example.`,
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
      covers: ['1', '6', 'x3'],
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
          kind: 'box',
          variant: 'definition',
          title: 'Divisibility',
          text: r`$a \mid b$ ("$a$ divides $b$") means $b = a\cdot m$ for some integer $m$: $5 \mid 35$, but $5 \nmid 12$. For a prime $p$: if $p \mid a^2$, then $p \mid a$ — a prime that divides a product divides one of the factors. With $p = 2$ this is the step "$a^2$ even, so $a$ even" in the proof above; the same proof with any prime $p$ shows that $\sqrt p$ is irrational.`,
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
      covers: ['3', '4', '5', 'x1', 'x6'],
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
    ...practice,
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
  ],
});
