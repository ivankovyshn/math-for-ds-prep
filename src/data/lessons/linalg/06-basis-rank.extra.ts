import type { QuestionTemplate } from '../../../types.ts';
import { r } from '../define.ts';
import { add, allDistinct, ints, paren, pm, shuffle, times, vec } from '../gen.ts';
import { parallel } from './06-basis-rank.practice.ts';

/** Extra practice (Practice 2): gentler questions on the same ideas, with fresh numbers every time. */
export const extra: QuestionTemplate[] = [
  {
    id: 'la-06-x1',
    difficulty: 1,
    keyConceptTag: 'Linear dependence',
    correctOptionId: 'a',
    generate: (g) => {
      const base = [g.int(1, 3), g.nonzero(-3, 3)];
      const k = g.pick([-2, 2, 3]);
      const dep = [base, times(k, base)];
      const indep = () => g.until(() => [ints(g, 2, -3, 3), ints(g, 2, -3, 3)], ([u, v]) => u[0] * v[1] - u[1] * v[0] !== 0);
      const others = [indep(), [[1, 0], [0, 1]], indep()];
      const ids = shuffle(g, ['b', 'c', 'd']);
      const pairText = ([u, v]: number[][]) => r`$${vec(u)}$ and $${vec(v)}$`;
      return {
        params: { a: dep, [ids[0]]: others[0], [ids[1]]: others[1], [ids[2]]: others[2] },
        promptText: r`Which pair of vectors is linearly <i>dependent</i>?`,
        options: [
          { id: 'a', label: pairText(dep) },
          ...others.map((pair, n) => ({ id: ids[n], label: pairText(pair), trapExplanation: r`Neither vector is a multiple of the other ($\det = ${pair[0][0] * pair[1][1] - pair[0][1] * pair[1][0]} \ne 0$), so they are independent.` })),
        ].sort((x, y) => x.id.localeCompare(y.id)),
        stepByStepSolution: [
          r`Two vectors are dependent exactly when one is a multiple of the other.`,
          r`$${vec(dep[1])} = ${k} \cdot ${vec(base)}$.`,
          r`So $${k}${vec(base)} - ${vec(dep[1])} = \mathbf{0}$ is a non-trivial combination giving zero.`,
        ],
      };
    },
  },
  {
    id: 'la-06-x2',
    difficulty: 1,
    keyConceptTag: 'Dimension of a span',
    correctOptionId: 'a',
    generate: (g) => {
      const { v1, v2, p, q } = g.until(
        () => ({ v1: ints(g, 3, -2, 3), v2: ints(g, 3, -2, 3), p: g.nonzero(-2, 2), q: g.nonzero(-2, 2) }),
        ({ v1, v2 }) => v1.some((x) => x !== 0) && v2.some((x) => x !== 0) && !parallel(v1, v2),
      );
      const v3 = add(times(p, v1), times(q, v2));
      return {
        params: { vs: [v1, v2, v3] },
        promptText: r`What is the dimension of the span of $${vec(v1)}$, $${vec(v2)}$ and $${vec(v3)}$?`,
        options: [
          { id: 'a', label: '2', value: 2 },
          { id: 'b', label: '3', value: 3, trapExplanation: r`Three vectors do not guarantee dimension 3: $${vec(v3)} = ${p}${vec(v1)} + ${paren(q)}${vec(v2)}$.` },
          { id: 'c', label: '1', value: 1, trapExplanation: r`$${vec(v1)}$ and $${vec(v2)}$ are not multiples of each other, so they point in two independent directions.` },
          { id: 'd', label: '0', value: 0, trapExplanation: r`Only the span of the zero vector has dimension 0.` },
        ],
        stepByStepSolution: [
          r`$${vec(v3)} = ${p}${vec(v1)} + ${paren(q)}${vec(v2)}$ adds no new direction.`,
          r`$${vec(v1)}$ and $${vec(v2)}$ are independent.`,
          r`The span is a plane: dimension 2.`,
        ],
      };
    },
  },
  {
    id: 'la-06-x3',
    difficulty: 1,
    keyConceptTag: 'Basis and dimension',
    correctOptionId: 'a',
    generate: (g) => {
      const n = g.int(2, 5);
      return {
        params: { n },
        promptText: r`How many vectors does every basis of $\mathbb{R}^${n}$ contain?`,
        options: [
          { id: 'a', label: `${n}`, value: n },
          { id: 'b', label: `${n - 1}`, value: n - 1, trapExplanation: r`${n - 1} vectors span at most a ${n - 1}-dimensional subspace; they cannot reach every point of $\mathbb{R}^${n}$.` },
          { id: 'c', label: `${n + 1}`, value: n + 1, trapExplanation: r`${n + 1} vectors in $\mathbb{R}^${n}$ are always dependent, so they are never a basis.` },
          { id: 'd', label: 'It depends on the basis', value: 99, trapExplanation: r`Bases differ, but they all have the same size — that size is the dimension.` },
        ],
        stepByStepSolution: [
          r`A basis is independent and spans the space.`,
          r`All bases of a space have the same number of vectors: the dimension.`,
          r`$\dim \mathbb{R}^${n} = ${n}$, as the standard basis $\mathbf{e}_1, \dots, \mathbf{e}_${n}$ shows.`,
        ],
      };
    },
  },
  {
    id: 'la-06-x4',
    difficulty: 2,
    keyConceptTag: 'Rank by elimination',
    correctOptionId: 'a',
    generate: (g) => {
      const { r1, k, r3 } = g.until(
        () => ({ r1: [g.int(1, 3), g.int(-3, 4)], k: g.pick([-2, 2, 3]), r3: ints(g, 2, -3, 3) }),
        ({ r1, r3 }) => r3.some((x) => x !== 0) && !parallel(r1, r3),
      );
      const A = [r1, times(k, r1), r3];
      return {
        params: { A },
        promptText: r`What is the rank of $${pm(A)}$?`,
        options: [
          { id: 'a', label: '2', value: 2 },
          { id: 'b', label: '1', value: 1, trapExplanation: r`Rows 1 and 2 are dependent, but row 3 $${vec(r3)}$ is not a multiple of $${vec(r1)}$.` },
          { id: 'c', label: '3', value: 3, trapExplanation: r`The rank is at most the number of columns, 2.` },
          { id: 'd', label: '0', value: 0, trapExplanation: r`Only the zero matrix has rank 0.` },
        ],
        stepByStepSolution: [
          r`$R_2 - ${paren(k)}R_1 = (0, 0)$.`,
          r`The remaining rows $${vec(r1)}$ and $${vec(r3)}$ are not parallel: 2 pivots.`,
          r`Rank $= 2$ (it can never exceed the 2 columns).`,
        ],
      };
    },
  },
  {
    id: 'la-06-x5',
    difficulty: 2,
    keyConceptTag: 'Rank–nullity theorem',
    correctOptionId: 'a',
    generate: (g) => {
      const { m, n } = g.until(() => ({ m: g.int(2, 5), n: g.int(3, 8) }), ({ m, n }) => n > m && allDistinct([n - m, 0, m, n]));
      return {
        params: { m, n, rk: m },
        promptText: r`$A$ is a $${m} \times ${n}$ matrix of rank ${m}. What is the dimension of the solution space of $A\mathbf{x} = \mathbf{0}$?`,
        options: [
          { id: 'a', label: `${n - m}`, value: n - m },
          { id: 'b', label: '0', value: 0, trapExplanation: r`With ${n} unknowns and only ${m} pivots, $${n} - ${m}$ variables are free.` },
          { id: 'c', label: `${m}`, value: m, trapExplanation: r`${m} is the rank. The null space has dimension (columns) $-$ (rank).` },
          { id: 'd', label: `${n}`, value: n, trapExplanation: r`Only the zero matrix would have every variable free.` },
        ],
        stepByStepSolution: [
          r`Rank–nullity: $\operatorname{rank} A + \dim \ker A = $ number of columns.`,
          r`$${m} + \dim \ker A = ${n}$.`,
          r`$\dim \ker A = ${n - m}$: that many free variables.`,
        ],
      };
    },
  },
  {
    id: 'la-06-x6',
    difficulty: 2,
    keyConceptTag: 'Coordinates in a basis',
    correctOptionId: 'a',
    generate: (g) => {
      const { p, q } = g.until(
        () => ({ p: g.int(-5, 6), q: g.nonzero(-4, 5) }),
        ({ p, q }) => allDistinct([[p - q, q], [p, q], [q, p - q], [p + q, q]]),
      );
      const a = p - q;
      return {
        params: { b1: [1, 0], b2: [1, 1], v: [p, q] },
        promptText: r`What are the coordinates of $\mathbf{v} = (${p}, ${q})$ in the basis $\mathbf{b}_1 = (1, 0)$, $\mathbf{b}_2 = (1, 1)$?`,
        options: [
          { id: 'a', label: r`$(${a}, ${q})$`, value: [a, q] },
          { id: 'b', label: r`$(${p}, ${q})$`, value: [p, q], trapExplanation: r`Those are the standard coordinates. $${p}\mathbf{b}_1 + ${paren(q)}\mathbf{b}_2 = (${p + q}, ${q})$.` },
          { id: 'c', label: r`$(${q}, ${a})$`, value: [q, a], trapExplanation: r`The order of the coordinates follows the order of the basis: first $\mathbf{b}_1$, then $\mathbf{b}_2$.` },
          { id: 'd', label: r`$(${p + q}, ${q})$`, value: [p + q, q], trapExplanation: r`$${p + q}(1, 0) + ${paren(q)}(1, 1) = (${p + 2 * q}, ${q})$; the first coordinate must be $${p} - ${paren(q)} = ${a}$.` },
        ],
        stepByStepSolution: [
          r`Solve $a(1, 0) + b(1, 1) = (${p}, ${q})$.`,
          r`Second component: $b = ${q}$. First: $a + b = ${p}$, so $a = ${a}$.`,
          r`Coordinates $(${a}, ${q})$. Check: $${a}(1, 0) + ${paren(q)}(1, 1) = (${p}, ${q})$.`,
        ],
      };
    },
  },
];
