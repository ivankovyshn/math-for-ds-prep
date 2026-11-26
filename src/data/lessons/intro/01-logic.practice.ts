import type { QuestionTemplate, Rng } from '../../../types.ts';
import { r } from '../define.ts';

/** Everyday and mathematical implications "if P then Q", with negations written out. */
export const IMPLICATIONS = [
  { p: 'it rains', q: 'the street is wet', np: 'it does not rain', nq: 'the street is not wet' },
  { p: 'you live in Kyiv', q: 'you live in Ukraine', np: 'you do not live in Kyiv', nq: 'you do not live in Ukraine' },
  { p: '$f$ is differentiable', q: '$f$ is continuous', np: '$f$ is not differentiable', nq: '$f$ is not continuous' },
  { p: '$n$ is divisible by 6', q: '$n$ is even', np: '$n$ is not divisible by 6', nq: '$n$ is odd' },
  { p: 'the battery is dead', q: 'the phone does not turn on', np: 'the battery is not dead', nq: 'the phone turns on' },
  { p: 'the shape is a square', q: 'the shape has four equal sides', np: 'the shape is not a square', nq: 'the shape does not have four equal sides' },
  { p: '$A$ has a zero row', q: '$\\det A = 0$', np: '$A$ has no zero row', nq: '$\\det A \\ne 0$' },
  { p: 'the train is late', q: 'I miss the lecture', np: 'the train is not late', nq: 'I do not miss the lecture' },
];
export const cap = (s: string) => (s.startsWith('$') ? s : s[0].toUpperCase() + s.slice(1));

/** Relations R(x, y) with their negations, for quantifier questions. */
export const RELATIONS = [
  { r: 'y^2 = x', n: 'y^2 \\ne x' },
  { r: 'y > x', n: 'y \\le x' },
  { r: 'x + y = 0', n: 'x + y \\ne 0' },
  { r: 'xy = 1', n: 'xy \\ne 1' },
  { r: 'y < x^2', n: 'y \\ge x^2' },
  { r: 'y \\ge 2x', n: 'y < 2x' },
  { r: 'x - y = 3', n: 'x - y \\ne 3' },
];
const Q = ['\\forall', '\\exists'];
/** "∀x ∈ ℝ ∃y ∈ ℝ: R" for quantifier codes (0 = ∀, 1 = ∃). */
export const quant = (a: number, b: number, body: string) => `$${Q[a]} x \\in \\mathbb{R}\\ ${Q[b]} y \\in \\mathbb{R}:\\ ${body}$`;

/**
 * Compound statements and their negations. Option a is the negation; b keeps the implication,
 * c applies De Morgan wrongly, d negates the parts of the implication. scripts/verify.mjs has the
 * same table as truth functions (`NEGATION_FORMS`) and checks each one independently.
 */
export const NEGATION_FORMS = [
  { s: 'P \\Rightarrow (Q \\lor R)', a: 'P \\land \\neg Q \\land \\neg R', b: '\\neg P \\lor (\\neg Q \\land \\neg R)', c: 'P \\land (\\neg Q \\lor \\neg R)', d: '\\neg P \\Rightarrow (\\neg Q \\lor \\neg R)', inner: 'Q \\lor R', negInner: '\\neg Q \\land \\neg R' },
  { s: 'P \\Rightarrow (Q \\land R)', a: 'P \\land (\\neg Q \\lor \\neg R)', b: '\\neg P \\lor (\\neg Q \\lor \\neg R)', c: 'P \\land \\neg Q \\land \\neg R', d: '\\neg P \\Rightarrow (\\neg Q \\land \\neg R)', inner: 'Q \\land R', negInner: '\\neg Q \\lor \\neg R' },
  { s: '(P \\land Q) \\Rightarrow R', a: 'P \\land Q \\land \\neg R', b: '\\neg P \\lor \\neg Q \\lor \\neg R', c: '(P \\lor Q) \\land \\neg R', d: '(\\neg P \\land \\neg Q) \\Rightarrow \\neg R', inner: 'R', negInner: '\\neg R' },
  { s: '(P \\lor Q) \\Rightarrow R', a: '(P \\lor Q) \\land \\neg R', b: '(\\neg P \\land \\neg Q) \\lor \\neg R', c: 'P \\land Q \\land \\neg R', d: '(\\neg P \\lor \\neg Q) \\Rightarrow \\neg R', inner: 'R', negInner: '\\neg R' },
];

/** Contrapositive question for an implication from the pool (used by Practice 1 and Extra practice). */
export function contrapositive(g: Rng, fourth: 'and' | 'negation') {
  const k = g.int(0, IMPLICATIONS.length - 1);
  const { p, q, np, nq } = IMPLICATIONS[k];
  return {
    params: { k },
    promptText: r`Which statement means the same as "if ${p}, then ${q}"?`,
    options: [
      { id: 'a', label: `If ${nq}, then ${np}` },
      { id: 'b', label: `If ${q}, then ${p}`, trapExplanation: r`This is the <i>converse</i> $Q \Rightarrow P$. It can fail even when the original is true, so it is not equivalent.` },
      { id: 'c', label: `If ${np}, then ${nq}`, trapExplanation: r`This is the <i>inverse</i> $\neg P \Rightarrow \neg Q$, equivalent to the converse — not to the original.` },
      fourth === 'and'
        ? { id: 'd', label: `${cap(p)} and ${q}`, trapExplanation: r`An implication does not claim that its "if" part happens. It is also true when ${p} is false.` }
        : { id: 'd', label: `${cap(p)}, and ${nq}`, trapExplanation: r`This is the <i>negation</i> $P \land \neg Q$ — the opposite claim, not an equivalent one.` },
    ],
    stepByStepSolution: [
      r`Let $P$ = "${p}", $Q$ = "${q}". The statement is $P \Rightarrow Q$.`,
      r`The contrapositive $\neg Q \Rightarrow \neg P$ swaps the parts <i>and</i> negates both; it has the same truth table.`,
      r`$\neg Q \Rightarrow \neg P$ reads: if ${nq}, then ${np}.`,
    ],
  };
}

/** Negating a two-quantifier statement: both quantifiers flip, the relation is negated. */
export function negateTwo(g: Rng, structures: number[][]) {
  const k = g.int(0, RELATIONS.length - 1);
  const [a, b] = g.pick(structures);
  const { r: rel, n } = RELATIONS[k];
  return {
    params: { k, a, b },
    promptText: r`Which statement is the negation of ${quant(a, b, rel)}?`,
    options: [
      { id: 'a', label: quant(1 - a, 1 - b, n) },
      { id: 'b', label: quant(a, b, n), trapExplanation: r`Only the relation was negated. The quantifiers must flip too: $\forall$ becomes $\exists$ and $\exists$ becomes $\forall$.` },
      { id: 'c', label: quant(1 - a, b, n), trapExplanation: r`Only the first quantifier was flipped. The second one must flip as well.` },
      { id: 'd', label: quant(a, 1 - b, n), trapExplanation: r`The outer quantifier stayed the same. Each quantifier the negation passes changes: $${Q[a]}$ becomes $${Q[1 - a]}$.` },
    ],
    stepByStepSolution: [
      r`Push $\neg$ inside step by step: $\neg${Q[a]} x\,(\ldots) \equiv ${Q[1 - a]} x\,\neg(\ldots)$.`,
      r`Then $\neg${Q[b]} y\,(${rel}) \equiv ${Q[1 - b]} y\,(${n})$.`,
      r`Result: ${quant(1 - a, 1 - b, n)}.`,
    ],
  };
}

export const practice: QuestionTemplate[] = [
  {
    id: 'ml-01-1',
    difficulty: 1,
    keyConceptTag: 'Contrapositive',
    correctOptionId: 'a',
    generate: (g) => contrapositive(g, 'and'),
  },
  {
    id: 'ml-01-3',
    difficulty: 2,
    keyConceptTag: 'Negating quantifiers',
    correctOptionId: 'a',
    generate: (g) => negateTwo(g, [[0, 1], [1, 0]]),
  },
  {
    id: 'ml-01-4',
    difficulty: 2,
    keyConceptTag: 'Order of quantifiers',
    correctOptionId: 'a',
    generate: (g) => {
      const c = g.nonzero(-5, 5);
      const minus = g.pick([false, true]);
      const rel = minus ? `x - y = ${c}` : `x + y = ${c}`;
      const yOf = minus ? `y = x ${c < 0 ? '+' : '-'} ${Math.abs(c)}` : `y = ${c} - x`;
      const d = g.nonzero(2, 6);
      return {
        params: { c, minus: minus ? 1 : 0, d },
        promptText: r`Which of these statements about real numbers is <i>true</i>?`,
        options: [
          { id: 'a', label: r`$\forall x\ \exists y:\ ${rel}$` },
          { id: 'b', label: r`$\exists y\ \forall x:\ ${rel}$`, trapExplanation: r`This needs one $y$ that works for every $x$ at once. The $y$ that works depends on $x$, so no single $y$ works.` },
          { id: 'c', label: r`$\forall x\ \forall y:\ ${rel}$`, trapExplanation: r`Take $x = 0$, $y = 0$: the relation fails. One counterexample kills a "for all".` },
          { id: 'd', label: r`$\exists x\ \forall y:\ xy = ${d}$`, trapExplanation: r`Whatever $x$ is, $y = 0$ gives $xy = 0 \ne ${d}$. No single $x$ works for all $y$.` },
        ],
        stepByStepSolution: [
          r`For (a): given any $x$, choose $${yOf}$. Then $${rel}$ holds. True.`,
          r`For (b) the order is swapped: one $y$ would have to fit every $x$ — impossible.`,
          r`The difference between (a) and (b) is only the order of $\forall$ and $\exists$.`,
        ],
      };
    },
  },
  {
    id: 'ml-01-5',
    difficulty: 3,
    keyConceptTag: 'Negating an implication',
    correctOptionId: 'a',
    generate: (g) => {
      const form = g.int(0, NEGATION_FORMS.length - 1);
      const f = NEGATION_FORMS[form];
      const [lhs] = f.s.split(' \\Rightarrow ');
      return {
        params: { form },
        promptText: r`Which statement is equivalent to $\neg\big(${f.s}\big)$?`,
        options: [
          { id: 'a', label: `$${f.a}$` },
          { id: 'b', label: `$${f.b}$`, trapExplanation: r`This is still an implication in disguise ($\neg A \lor B$). Negating an implication gives an "and": $\neg(A \Rightarrow B) \equiv A \land \neg B$.` },
          { id: 'c', label: `$${f.c}$`, trapExplanation: r`De Morgan was applied wrongly: negation swaps "or" and "and", and only the part after $\Rightarrow$ is negated.` },
          { id: 'd', label: `$${f.d}$`, trapExplanation: r`Negating each part of an implication does not negate the implication. Check a row where the left side is false: the negation must be false there.` },
        ],
        stepByStepSolution: [
          r`$\neg(A \Rightarrow B) \equiv A \land \neg B$ with $A = ${lhs.replace(/^\((.*)\)$/, '$1')}$, $B = ${f.inner}$.`,
          r`Negate $B$: $\neg(${f.inner}) \equiv ${f.negInner}$.`,
          r`So the negation is $${f.a}$.`,
        ],
      };
    },
  },
];
