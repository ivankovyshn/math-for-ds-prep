import type { QuestionTemplate } from '../../../types.ts';
import { r } from '../define.ts';
import { allDistinct, aug, ints, lin, mv, paren, system, times, vec } from '../gen.ts';

const XY = ['x', 'y'];
const XYZ = ['x', 'y', 'z'];

/** Extra practice (Practice 2): gentler questions on the same ideas, with fresh numbers every time. */
export const extra: QuestionTemplate[] = [
  {
    id: 'la-02-x1',
    difficulty: 1,
    keyConceptTag: 'Elimination and back substitution',
    correctOptionId: 'a',
    generate: (g) => {
      const { x, y } = g.until(
        () => ({ x: g.int(-6, 6), y: g.int(-6, 6) }),
        ({ x, y }) => allDistinct([[x, y], [y, x], [x + y, x - y], [x + 1, y - 1]]),
      );
      const [s, d] = [x + y, x - y];
      return {
        params: { s, d },
        promptText: r`Solve $x + y = ${s}$, $x - y = ${d}$.`,
        options: [
          { id: 'a', label: r`$x = ${x},\ y = ${y}$`, value: [x, y] },
          { id: 'b', label: r`$x = ${y},\ y = ${x}$`, value: [y, x], trapExplanation: r`Check the second equation: $${y} - ${paren(x)} = ${y - x}$, not ${d}.` },
          { id: 'c', label: r`$x = ${s},\ y = ${d}$`, value: [s, d], trapExplanation: r`The right-hand sides are not the unknowns: $${s} + ${paren(d)} = ${s + d} \ne ${s}$.` },
          { id: 'd', label: r`$x = ${x + 1},\ y = ${y - 1}$`, value: [x + 1, y - 1], trapExplanation: r`It fits the first equation, but $${x + 1} - ${paren(y - 1)} = ${x - y + 2} \ne ${d}$. A solution must satisfy <i>every</i> equation.` },
        ],
        stepByStepSolution: [
          r`Add the equations: $2x = ${s + d}$, so $x = ${x}$.`,
          r`Substitute: $${x} + y = ${s}$, so $y = ${y}$.`,
          r`Check both equations: $${x} + ${paren(y)} = ${s}$, $${x} - ${paren(y)} = ${d}$.`,
        ],
      };
    },
  },
  {
    id: 'la-02-x2',
    difficulty: 1,
    keyConceptTag: 'A row 0 = c means no solution',
    correctOptionId: 'a',
    generate: (g) => {
      const [a, b] = [g.nonzero(-4, 4), g.nonzero(-4, 4)];
      const [c1, c2] = g.until(() => [g.int(-6, 6), g.int(-6, 6)], ([p, q]) => p !== q);
      return {
        params: { A: [[a, b], [a, b]], b: [c1, c2] },
        promptText: r`How many solutions does the system $${lin([a, b], XY)} = ${c1}$, $${lin([a, b], XY)} = ${c2}$ have?`,
        options: [
          { id: 'a', label: 'None', value: -1 },
          { id: 'b', label: 'Exactly one', value: 0, trapExplanation: r`Two equations and two unknowns do not guarantee one solution. Here the left sides are identical.` },
          { id: 'c', label: 'Infinitely many', value: 1, trapExplanation: r`That happens when one equation is a copy of the other. Here the right sides differ, so they contradict each other.` },
          { id: 'd', label: 'Exactly two', value: 99, trapExplanation: r`A linear system has 0, 1 or infinitely many solutions — never exactly two.` },
        ],
        stepByStepSolution: [
          r`Subtract the first equation from the second: $0 = ${c2 - c1}$.`,
          r`That is impossible, so no $(x, y)$ satisfies both.`,
          r`Geometrically: two parallel lines that never meet.`,
        ],
      };
    },
  },
  {
    id: 'la-02-x3',
    difficulty: 1,
    keyConceptTag: 'A row 0 = c means no solution',
    correctOptionId: 'a',
    generate: (g) => {
      const c = g.nonzero(-7, 7);
      const A = [[1, g.int(-4, 4)], [0, 0]];
      const rhs = [g.int(-5, 5), c];
      return {
        params: { A, b: rhs },
        promptText: r`After elimination, the augmented matrix of a system in $x, y$ is shown. What does its last row mean?`,
        mathFormula: aug(A, rhs),
        options: [
          { id: 'a', label: 'The system has no solution', value: -1 },
          { id: 'b', label: r`$y = ${c}$`, value: 0, trapExplanation: r`The row has no pivot: it says $0x + 0y = ${c}$, i.e. $0 = ${c}$.` },
          { id: 'c', label: 'The system has infinitely many solutions', value: 1, trapExplanation: r`A zero row $(0 \ 0 \mid 0)$ would be harmless. With ${c} on the right it is a contradiction.` },
          { id: 'd', label: 'The row can be deleted', value: 99, trapExplanation: r`Only a row of zeros <i>including</i> the right side can be dropped.` },
        ],
        stepByStepSolution: [
          r`Each row stands for an equation. The last one is $0 \cdot x + 0 \cdot y = ${c}$.`,
          r`No values of $x$, $y$ make $0 = ${c}$ true.`,
          r`Row operations do not change the solution set, so the original system has no solution either.`,
        ],
      };
    },
  },
  {
    id: 'la-02-x4',
    difficulty: 2,
    keyConceptTag: 'Elimination and back substitution',
    correctOptionId: 'a',
    generate: (g) => {
      const { A, sol } = g.until(
        () => ({ A: [[1, g.int(-2, 2), g.int(-2, 2)], [0, 1, g.int(-2, 2)], [0, 0, 1]], sol: ints(g, 3, -4, 4) }),
        ({ A, sol }) => {
          const [x, y, z] = sol;
          return allDistinct([sol, [z, y, x], mv(A, sol), [x, z, y]]);
        },
      );
      const rhs = mv(A, sol);
      const [x, y, z] = sol;
      return {
        params: { A, b: rhs },
        promptText: r`Solve by back substitution.`,
        mathFormula: system(A, rhs, XYZ),
        options: [
          { id: 'a', label: r`$${vec(sol)}$`, value: sol },
          { id: 'b', label: r`$${vec([z, y, x])}$`, value: [z, y, x], trapExplanation: r`The order was reversed: $z = ${z}$ is read off the last equation, so the vector ends with ${z}.` },
          { id: 'c', label: r`$${vec(rhs)}$`, value: rhs, trapExplanation: r`These are the right-hand sides, not the unknowns.` },
          { id: 'd', label: r`$${vec([x, z, y])}$`, value: [x, z, y], trapExplanation: r`$y$ and $z$ were swapped. The last equation fixes $z = ${z}$.` },
        ],
        stepByStepSolution: [
          r`Start at the bottom: $z = ${z}$.`,
          r`Second equation: $y = ${rhs[1]} - ${paren(A[1][2])}\cdot ${paren(z)} = ${y}$.`,
          r`First equation: $x = ${rhs[0]} - ${paren(A[0][1])}\cdot ${paren(y)} - ${paren(A[0][2])}\cdot ${paren(z)} = ${x}$. Solution $${vec(sol)}$.`,
        ],
      };
    },
  },
  {
    id: 'la-02-x5',
    difficulty: 2,
    keyConceptTag: 'Parameter that makes a system consistent',
    correctOptionId: 'a',
    generate: (g) => {
      const { p, q, s } = g.until(
        () => ({ p: g.nonzero(-3, 3), q: g.pick([2, 3, -2, -3]), s: g.nonzero(-5, 5) }),
        ({ q, s }) => allDistinct([q * s, s, 0, 2 * q * s]),
      );
      return {
        params: { p, q, s },
        promptText: r`For which $k$ does the system $${lin([1, p], XY)} = ${s}$, $${lin([q, q * p], XY)} = k$ have infinitely many solutions?`,
        options: [
          { id: 'a', label: r`$k = ${q * s}$`, value: q * s },
          { id: 'b', label: r`$k = ${s}$`, value: s, trapExplanation: r`The second left side is ${q} times the first, so its right side must be ${q} times ${s} as well.` },
          { id: 'c', label: r`$k = 0$`, value: 0, trapExplanation: r`With $k = 0$, subtracting ${q} times the first equation gives $0 = ${-q * s}$: no solution.` },
          { id: 'd', label: r`$k = ${2 * q * s}$`, value: 2 * q * s, trapExplanation: r`Only the factor ${q} is needed: $${q} \cdot ${paren(s)} = ${q * s}$.` },
        ],
        stepByStepSolution: [
          r`$R_2 - ${paren(q)}R_1$ gives $0 = k - ${paren(q * s)}$.`,
          r`If $k \ne ${q * s}$ this is a contradiction: no solution.`,
          r`If $k = ${q * s}$ the row is $0 = 0$, one equation remains for two unknowns: infinitely many solutions.`,
        ],
      };
    },
  },
  {
    id: 'la-02-x6',
    difficulty: 2,
    keyConceptTag: 'Counting free variables',
    correctOptionId: 'a',
    generate: (g) => {
      const row = [1, g.nonzero(-3, 3), g.nonzero(-3, 3)];
      const h = g.int(-5, 5);
      const k = g.pick([2, 3, -1, -2]);
      const A = [row, times(k, row)];
      const rhs = [h, k * h];
      return {
        params: { A, b: rhs },
        promptText: r`How many free variables does the system $${lin(A[0], XYZ)} = ${h}$, $${lin(A[1], XYZ)} = ${k * h}$ have?`,
        options: [
          { id: 'a', label: '2', value: 2 },
          { id: 'b', label: '1', value: 1, trapExplanation: r`Two equations, but the second is ${k} times the first: only one pivot remains, so $3 - 1 = 2$ variables are free.` },
          { id: 'c', label: '0', value: 0, trapExplanation: r`Zero free variables would mean a unique solution; one equation in three unknowns cannot pin them down.` },
          { id: 'd', label: 'There is no solution', value: -1, trapExplanation: r`$R_2 - ${paren(k)}R_1$ gives $0 = 0$, not a contradiction.` },
        ],
        stepByStepSolution: [
          r`$R_2 - ${paren(k)}R_1 = (0 \ 0 \ 0 \mid 0)$: the second equation adds nothing.`,
          r`One pivot (in the $x$ column) for three unknowns.`,
          r`Free variables $= 3 - 1 = 2$ ($y$ and $z$).`,
        ],
      };
    },
  },
];
