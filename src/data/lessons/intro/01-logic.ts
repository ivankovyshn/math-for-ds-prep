import { defineLesson, r } from '../define.ts';
import { extra } from './01-logic.extra.ts';

export default defineLesson({
  id: 'ml-01',
  moduleId: 'intro',
  title: 'Logic and quantifiers',
  blurb: 'Implication, negation, ∀ and ∃',
  minutes: 8,
  lecture: [
    {
      title: 'Statements and connectives',
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
      ],
    },
    {
      title: 'Equivalent forms',
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
    {
      id: 'ml-01-1',
      difficulty: 1,
      promptText: r`Which statement means the same as "If it rains, the street is wet"?`,
      options: [
        { id: 'a', label: 'If the street is not wet, it does not rain' },
        { id: 'b', label: 'If the street is wet, it rains', trapExplanation: r`This is the <i>converse</i>. The street can be wet for other reasons (a street cleaner), so it is not equivalent.` },
        { id: 'c', label: 'If it does not rain, the street is not wet', trapExplanation: r`This is the <i>inverse</i> $\neg P \Rightarrow \neg Q$, equivalent to the converse — not to the original.` },
        { id: 'd', label: 'It rains and the street is wet', trapExplanation: r`An implication does not claim that it rains. "If it rains…" is true on a dry sunny day too.` },
      ],
      correctOptionId: 'a',
      stepByStepSolution: [
        r`Let $P$ = "it rains", $Q$ = "the street is wet". The statement is $P \Rightarrow Q$.`,
        r`The contrapositive $\neg Q \Rightarrow \neg P$ has the same truth table.`,
        r`$\neg Q \Rightarrow \neg P$ reads: if the street is not wet, it does not rain.`,
      ],
      keyConceptTag: 'Contrapositive',
    },
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
      id: 'ml-01-3',
      difficulty: 2,
      promptText: r`Which statement is the negation of $\forall x \in \mathbb{R}\ \exists y \in \mathbb{R}:\ y^2 = x$?`,
      options: [
        { id: 'a', label: r`$\exists x \in \mathbb{R}\ \forall y \in \mathbb{R}:\ y^2 \ne x$` },
        { id: 'b', label: r`$\forall x \in \mathbb{R}\ \exists y \in \mathbb{R}:\ y^2 \ne x$`, trapExplanation: r`Only the final property was negated. The quantifiers must flip too: $\forall$ becomes $\exists$ and $\exists$ becomes $\forall$.` },
        { id: 'c', label: r`$\exists x \in \mathbb{R}\ \exists y \in \mathbb{R}:\ y^2 \ne x$`, trapExplanation: r`Only the first quantifier was flipped. The $\exists y$ must become $\forall y$: no $y$ at all works for that $x$.` },
        { id: 'd', label: r`$\forall x \in \mathbb{R}\ \forall y \in \mathbb{R}:\ y^2 \ne x$`, trapExplanation: r`This says no real number is a square, which is much stronger than the negation. The outer $\forall$ must become $\exists$.` },
      ],
      correctOptionId: 'a',
      stepByStepSolution: [
        r`Push $\neg$ inside step by step: $\neg\forall x\,(\ldots) \equiv \exists x\,\neg(\ldots)$.`,
        r`Then $\neg\exists y\,(y^2 = x) \equiv \forall y\,(y^2 \ne x)$.`,
        r`Result: $\exists x\ \forall y:\ y^2 \ne x$ — "some real number is not a square". It is true ($x = -1$), so the original was false.`,
      ],
      keyConceptTag: 'Negating quantifiers',
    },
    {
      id: 'ml-01-4',
      difficulty: 2,
      promptText: r`Which of these statements about real numbers is <i>true</i>?`,
      options: [
        { id: 'a', label: r`$\forall x\ \exists y:\ x + y = 0$` },
        { id: 'b', label: r`$\exists y\ \forall x:\ x + y = 0$`, trapExplanation: r`This needs one $y$ that works for every $x$ at once. $y = -x$ depends on $x$, so no single $y$ works.` },
        { id: 'c', label: r`$\forall x\ \forall y:\ x + y = 0$`, trapExplanation: r`$x = 1, y = 1$ gives $2 \ne 0$. One counterexample kills a "for all".` },
        { id: 'd', label: r`$\exists x\ \forall y:\ xy = 1$`, trapExplanation: r`Whatever $x$ is, $y = 0$ gives $xy = 0 \ne 1$. No single $x$ works for all $y$.` },
      ],
      correctOptionId: 'a',
      stepByStepSolution: [
        r`For (a): given any $x$, choose $y = -x$. Then $x + y = 0$. True.`,
        r`For (b) the order is swapped: one $y$ would have to equal $-x$ for every $x$ — impossible.`,
        r`The difference between (a) and (b) is only the order of $\forall$ and $\exists$.`,
      ],
      keyConceptTag: 'Order of quantifiers',
    },
    {
      id: 'ml-01-5',
      difficulty: 3,
      promptText: r`Which statement is equivalent to $\neg\big(P \Rightarrow (Q \lor R)\big)$?`,
      options: [
        { id: 'a', label: r`$P \land \neg Q \land \neg R$` },
        { id: 'b', label: r`$\neg P \lor (\neg Q \land \neg R)$`, trapExplanation: r`This is $P \Rightarrow (\neg Q \land \neg R)$: the implication survived. Negating an implication gives an "and": $\neg(A \Rightarrow B) \equiv A \land \neg B$.` },
        { id: 'c', label: r`$P \land (\neg Q \lor \neg R)$`, trapExplanation: r`De Morgan was applied wrongly: $\neg(Q \lor R)$ is $\neg Q \land \neg R$. Negation swaps "or" and "and".` },
        { id: 'd', label: r`$\neg P \Rightarrow (\neg Q \lor \neg R)$`, trapExplanation: r`Negating each part of an implication does not negate the implication. Check $P$ false: the original negation is false, but this is true.` },
      ],
      correctOptionId: 'a',
      stepByStepSolution: [
        r`$\neg(A \Rightarrow B) \equiv A \land \neg B$ with $A = P$, $B = Q \lor R$.`,
        r`De Morgan: $\neg(Q \lor R) \equiv \neg Q \land \neg R$.`,
        r`So the negation is $P \land \neg Q \land \neg R$: $P$ holds and neither $Q$ nor $R$ does.`,
      ],
      keyConceptTag: 'Negating an implication',
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
