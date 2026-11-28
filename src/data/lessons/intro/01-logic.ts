import { defineLesson, r } from '../define.ts';
import { extra } from './01-logic.extra.ts';
import { practice } from './01-logic.practice.ts';

export default defineLesson({
  id: 'ml-01',
  moduleId: 'intro',
  title: 'Logic and quantifiers',
  blurb: 'Implication, negation, ∀ and ∃',
  minutes: 8,
  lecture: [
    {
      title: 'Statements and connectives',
      covers: ['2', 'x2'],
      blocks: [
        {
          kind: 'text',
          text: r`Mathematics is written in <i>statements</i>: sentences that are either true or false. "$7$ is prime" is a statement; "$x > 3$" is not, until we know what $x$ is.

Statements are combined with five connectives: $\neg P$ (not $P$), $P \land Q$ (and), $P \lor Q$ (or — inclusive: both may be true), $P \Rightarrow Q$ (if $P$ then $Q$) and $P \Leftrightarrow Q$ (if and only if).`,
        },
        {
          kind: 'formula',
          tex: r`\begin{array}{cc|c|c|c} P & Q & P \land Q & P \lor Q & P \Rightarrow Q \\ \hline T & T & T & T & T \\ T & F & F & T & F \\ F & T & F & T & T \\ F & F & F & F & T \end{array}`,
          caption: 'A truth table lists every combination of truth values.',
        },
        {
          kind: 'box',
          variant: 'theorem',
          title: 'When an implication is false',
          text: r`$P \Rightarrow Q$ is false in exactly one case: $P$ true and $Q$ false. Think of it as a promise — "if you pass the exam, I'll buy you a coffee" is broken only if you pass and get no coffee. If $P$ is false the promise is kept automatically ("vacuously true").`,
        },
        {
          kind: 'example',
          title: 'When is an implication false?',
          prompt: r`Take $P$: "$n$ is divisible by 4" and $Q$: "$n$ is even". Is $P \Rightarrow Q$ true for $n = 8$, $n = 6$ and $n = 3$?`,
          steps: [
            r`$n = 8$: $P$ true, $Q$ true, so $P \Rightarrow Q$ is true.`,
            r`$n = 6$: $P$ false, $Q$ true. The implication is true: it promises nothing about numbers that are not divisible by 4.`,
            r`$n = 3$: $P$ false, $Q$ false. Again true.`,
            r`Only "$P$ true and $Q$ false" makes an implication false. For the same reason "if $0 > 1$, then the Moon is made of cheese" is true: its premise is false.`,
          ],
        },
      ],
    },
    {
      title: 'Equivalent forms',
      covers: ['1', '5', 'x1', 'x5'],
      blocks: [
        {
          kind: 'text',
          text: r`Two statements are <i>equivalent</i> if they have the same truth table. A few equivalences are used constantly:`,
        },
        {
          kind: 'formula',
          tex: r`\begin{aligned} P \Rightarrow Q \;&\equiv\; \neg Q \Rightarrow \neg P && \text{(contrapositive)} \\ \neg(P \land Q) \;&\equiv\; \neg P \lor \neg Q && \text{(De Morgan)} \\ \neg(P \lor Q) \;&\equiv\; \neg P \land \neg Q && \text{(De Morgan)} \\ \neg(P \Rightarrow Q) \;&\equiv\; P \land \neg Q \end{aligned}`,
        },
        {
          kind: 'box',
          variant: 'pitfall',
          title: 'The converse is a different statement',
          text: r`The <i>converse</i> of $P \Rightarrow Q$ is $Q \Rightarrow P$. "If $n$ is divisible by 4 then $n$ is even" is true; its converse "if $n$ is even then $n$ is divisible by 4" is false ($n = 6$). Only the contrapositive is guaranteed to mean the same.`,
        },
        {
          kind: 'quiz',
          id: 'ml-01-q1',
          prompt: r`Which sentence is the negation of "the function is continuous and bounded"?`,
          options: [
            { id: 'a', label: 'The function is not continuous or not bounded' },
            { id: 'b', label: 'The function is not continuous and not bounded', trapExplanation: r`De Morgan's law turns "and" into "or". A continuous but unbounded function also makes the original false.` },
            { id: 'c', label: 'The function is continuous or bounded', trapExplanation: r`Nothing was negated here; this is weaker than the original, not its opposite.` },
          ],
          correctOptionId: 'a',
          explanation: r`$\neg(C \wedge B) \equiv \neg C \vee \neg B$: it is enough for <i>one</i> of the two properties to fail.`,
        },
      ],
    },
    {
      title: 'Quantifiers',
      covers: ['4', 'x4'],
      blocks: [
        {
          kind: 'text',
          text: r`A statement about variables needs a <i>quantifier</i> to say for which values it is claimed.

• $\forall x \in S:\ P(x)$ — "for all $x$ in $S$, $P(x)$". One counterexample makes it false.

• $\exists x \in S:\ P(x)$ — "there exists an $x$ in $S$ with $P(x)$". One example makes it true.`,
        },
        {
          kind: 'box',
          variant: 'pitfall',
          title: 'Order of quantifiers matters',
          text: r`$\forall x \in \mathbb{R}\ \exists y \in \mathbb{R}:\ y > x$ — "every number has a larger one": true, $y$ may depend on $x$.

$\exists y \in \mathbb{R}\ \forall x \in \mathbb{R}:\ y > x$ — "some number is larger than all numbers": false. Swapping $\forall$ and $\exists$ changed the meaning completely.`,
        },
        {
          kind: 'quiz',
          id: 'ml-01-q2',
          prompt: r`Let $S = \{1, 2, 3\}$. Which statement is true?`,
          options: [
            { id: 'a', label: r`$\forall x \in S\ \exists y \in S:\ x + y = 4$` },
            { id: 'b', label: r`$\exists y \in S\ \forall x \in S:\ x + y = 4$`, trapExplanation: r`One fixed $y$ would have to work for $x = 1$ and $x = 3$ at once, which needs $y = 3$ and $y = 1$.` },
            { id: 'c', label: r`$\forall x \in S\ \forall y \in S:\ x + y = 4$`, trapExplanation: r`$x = y = 1$ gives $2 \ne 4$.` },
          ],
          correctOptionId: 'a',
          explanation: r`For each $x$ choose $y = 4 - x$, which is again in $S$. In (a) $y$ may depend on $x$; in (b) it may not — the order of quantifiers matters.`,
        },
      ],
    },
    {
      title: 'Negating quantified statements',
      covers: ['3', '6', 'x3', 'x6'],
      blocks: [
        {
          kind: 'text',
          text: r`To negate, move $\neg$ from left to right: every $\forall$ becomes $\exists$, every $\exists$ becomes $\forall$, and the final property is negated. Restrictions like $x \in S$ or $\varepsilon > 0$ stay as they are.`,
        },
        { kind: 'formula', tex: r`\neg\big(\forall x\ P(x)\big) \equiv \exists x\ \neg P(x), \qquad \neg\big(\exists x\ P(x)\big) \equiv \forall x\ \neg P(x)` },
        {
          kind: 'example',
          title: 'Negating a three-quantifier statement',
          prompt: r`Negate: "$\forall \varepsilon > 0\ \exists N\ \forall n \ge N:\ |a_n - L| < \varepsilon$" (the definition of $a_n \to L$, coming in Analysis I).`,
          steps: [
            r`$\forall \varepsilon > 0$ becomes $\exists \varepsilon > 0$ — the restriction $\varepsilon > 0$ is kept.`,
            r`$\exists N$ becomes $\forall N$, and $\forall n \ge N$ becomes $\exists n \ge N$.`,
            r`$|a_n - L| < \varepsilon$ becomes $|a_n - L| \ge \varepsilon$.`,
            r`Result: $\exists \varepsilon > 0\ \forall N\ \exists n \ge N:\ |a_n - L| \ge \varepsilon$ — "some tolerance is broken again and again, however far you go".`,
          ],
        },
        {
          kind: 'quiz',
          id: 'ml-01-q3',
          prompt: r`Which sentence is the negation of "every student passed the exam"?`,
          options: [
            { id: 'a', label: 'At least one student did not pass' },
            { id: 'b', label: 'No student passed', trapExplanation: r`That is much stronger than the negation. If one student failed and the rest passed, "every student passed" is already false.` },
            { id: 'c', label: 'At least one student passed', trapExplanation: r`This can be true together with the original, so it cannot be its negation.` },
          ],
          correctOptionId: 'a',
          explanation: r`$\neg \forall x\ P(x) \equiv \exists x\ \neg P(x)$: to refute "every", one counterexample is enough.`,
        },
      ],
    },
    {
      title: 'Summary',
      blocks: [
        {
          kind: 'text',
          text: r`• $P \Rightarrow Q$ is false only when $P$ is true and $Q$ is false.

• $P \Rightarrow Q \equiv \neg Q \Rightarrow \neg P$; the converse $Q \Rightarrow P$ is not equivalent.

• De Morgan: negating swaps "and" and "or".

• Negating swaps $\forall$ and $\exists$ and negates the property; restrictions stay.

• The order of different quantifiers matters.`,
        },
      ],
    },
  ],
  extra,
  questions: [
    ...practice,
    {
      id: 'ml-01-2',
      difficulty: 1,
      promptText: r`In which case is the implication $P \Rightarrow Q$ <i>false</i>?`,
      options: [
        { id: 'a', label: r`$P$ true, $Q$ false` },
        { id: 'b', label: r`$P$ false, $Q$ true`, trapExplanation: r`When $P$ is false the implication makes no claim, so it is (vacuously) true.` },
        { id: 'c', label: r`$P$ false, $Q$ false`, trapExplanation: r`Again $P$ is false, so nothing was promised and nothing was broken: the implication is true.` },
        { id: 'd', label: 'It is never false', trapExplanation: r`An implication can fail: "if $n$ is even then $n$ is divisible by 4" is false for $n = 6$, where $P$ is true and $Q$ is false.` },
      ],
      correctOptionId: 'a',
      stepByStepSolution: [
        r`$P \Rightarrow Q$ promises: whenever $P$ holds, $Q$ holds too.`,
        r`The promise is broken only when $P$ holds and $Q$ does not.`,
        r`In the other three rows of the truth table the implication is true.`,
      ],
      keyConceptTag: 'Truth table of implication',
    },
    {
      id: 'ml-01-6',
      difficulty: 3,
      promptText: r`Which statement is the negation of "$\forall \varepsilon > 0\ \exists N\ \forall n \ge N:\ |a_n - L| < \varepsilon$"?`,
      options: [
        { id: 'a', label: r`$\exists \varepsilon > 0\ \forall N\ \exists n \ge N:\ |a_n - L| \ge \varepsilon$` },
        { id: 'b', label: r`$\exists \varepsilon > 0\ \forall N\ \forall n \ge N:\ |a_n - L| \ge \varepsilon$`, trapExplanation: r`The last quantifier was not flipped. The negation only needs <i>some</i> late $n$ that breaks the bound, not all of them.` },
        { id: 'c', label: r`$\forall \varepsilon > 0\ \exists N\ \forall n \ge N:\ |a_n - L| \ge \varepsilon$`, trapExplanation: r`Only the inequality was negated. All three quantifiers must flip.` },
        { id: 'd', label: r`$\exists \varepsilon \le 0\ \forall N\ \exists n \ge N:\ |a_n - L| \ge \varepsilon$`, trapExplanation: r`The restriction $\varepsilon > 0$ belongs to the quantifier and stays unchanged. With $\varepsilon \le 0$ the statement is trivially true.` },
      ],
      correctOptionId: 'a',
      stepByStepSolution: [
        r`Flip each quantifier from left to right: $\forall\varepsilon \to \exists\varepsilon$, $\exists N \to \forall N$, $\forall n \to \exists n$.`,
        r`Keep the restrictions $\varepsilon > 0$ and $n \ge N$.`,
        r`Negate the property: $|a_n - L| < \varepsilon$ becomes $|a_n - L| \ge \varepsilon$.`,
      ],
      keyConceptTag: 'Negating ε–N statements',
    },
  ],
});
