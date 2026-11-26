import type { QuestionDraft } from '../../../types.ts';
import { r } from '../define.ts';

/** Extra practice (Practice 2): gentler questions on the same ideas. */
export const extra: QuestionDraft[] = [
  {
    id: 'la-02-x1',
    difficulty: 1,
    promptText: r`Solve $x + y = 5$, $x - y = 1$.`,
    options: [
      { id: 'a', label: r`$x = 3,\ y = 2$`, value: [3, 2] },
      { id: 'b', label: r`$x = 2,\ y = 3$`, value: [2, 3], trapExplanation: r`Check the second equation: $2 - 3 = -1$, not 1.` },
      { id: 'c', label: r`$x = 5,\ y = 1$`, value: [5, 1], trapExplanation: r`The right-hand sides are not the unknowns: $5 + 1 = 6 \ne 5$.` },
      { id: 'd', label: r`$x = 4,\ y = 1$`, value: [4, 1], trapExplanation: r`$4 + 1 = 5$ works, but $4 - 1 = 3 \ne 1$. A solution must satisfy <i>every</i> equation.` },
    ],
    correctOptionId: 'a',
    stepByStepSolution: [
      r`Add the equations: $2x = 6$, so $x = 3$.`,
      r`Substitute: $3 + y = 5$, so $y = 2$.`,
      r`Check both equations: $3 + 2 = 5$, $3 - 2 = 1$.`,
    ],
    keyConceptTag: 'Elimination and back substitution',
  },
  {
    id: 'la-02-x2',
    difficulty: 1,
    promptText: r`How many solutions does the system $x + y = 2$, $x + y = 5$ have?`,
    options: [
      { id: 'a', label: 'None', value: -1 },
      { id: 'b', label: 'Exactly one', value: 0, trapExplanation: r`Two equations and two unknowns do not guarantee one solution. Here the left sides are identical.` },
      { id: 'c', label: 'Infinitely many', value: 1, trapExplanation: r`That happens when one equation is a copy of the other. Here the right sides differ, so they contradict each other.` },
      { id: 'd', label: 'Exactly two', value: 99, trapExplanation: r`A linear system has 0, 1 or infinitely many solutions — never exactly two.` },
    ],
    correctOptionId: 'a',
    stepByStepSolution: [
      r`Subtract the first equation from the second: $0 = 3$.`,
      r`That is impossible, so no $(x, y)$ satisfies both.`,
      r`Geometrically: two parallel lines that never meet.`,
    ],
    keyConceptTag: 'A row 0 = c means no solution',
  },
  {
    id: 'la-02-x3',
    difficulty: 1,
    promptText: r`After elimination, the last row of an augmented matrix reads $(0 \ \ 0 \mid 3)$. What does this mean?`,
    options: [
      { id: 'a', label: 'The system has no solution', value: -1 },
      { id: 'b', label: r`The last variable equals 3`, value: 0, trapExplanation: r`The row has no pivot: it says $0x + 0y = 3$, i.e. $0 = 3$.` },
      { id: 'c', label: 'The system has infinitely many solutions', value: 1, trapExplanation: r`A zero row $(0 \ 0 \mid 0)$ would be harmless. With 3 on the right it is a contradiction.` },
      { id: 'd', label: 'The row can be deleted', value: 99, trapExplanation: r`Only a row of zeros <i>including</i> the right side can be dropped.` },
    ],
    correctOptionId: 'a',
    stepByStepSolution: [
      r`Each row stands for an equation. This one is $0 \cdot x + 0 \cdot y = 3$.`,
      r`No values of $x$, $y$ make $0 = 3$ true.`,
      r`Row operations do not change the solution set, so the original system has no solution either.`,
    ],
    keyConceptTag: 'A row 0 = c means no solution',
  },
  {
    id: 'la-02-x4',
    difficulty: 2,
    promptText: r`Solve by back substitution: $x + y + z = 6$, $y + z = 5$, $z = 3$.`,
    options: [
      { id: 'a', label: r`$(1, 2, 3)$`, value: [1, 2, 3] },
      { id: 'b', label: r`$(3, 2, 1)$`, value: [3, 2, 1], trapExplanation: r`The order was reversed: $z = 3$ is given directly, so the vector ends with 3.` },
      { id: 'c', label: r`$(6, 5, 3)$`, value: [6, 5, 3], trapExplanation: r`These are the right-hand sides, not the unknowns.` },
      { id: 'd', label: r`$(1, 3, 2)$`, value: [1, 3, 2], trapExplanation: r`$z$ is given as 3, so it cannot be 2.` },
    ],
    correctOptionId: 'a',
    stepByStepSolution: [
      r`Start at the bottom: $z = 3$.`,
      r`Second equation: $y = 5 - z = 2$.`,
      r`First equation: $x = 6 - y - z = 1$. Solution $(1, 2, 3)$.`,
    ],
    keyConceptTag: 'Elimination and back substitution',
  },
  {
    id: 'la-02-x5',
    difficulty: 2,
    promptText: r`For which $k$ does the system $x + 2y = 3$, $2x + 4y = k$ have infinitely many solutions?`,
    options: [
      { id: 'a', label: r`$k = 6$`, value: 6 },
      { id: 'b', label: r`$k = 3$`, value: 3, trapExplanation: r`The second left side is twice the first, so its right side must be twice 3 as well.` },
      { id: 'c', label: r`$k = 0$`, value: 0, trapExplanation: r`With $k = 0$ subtracting twice the first equation gives $0 = -6$: no solution.` },
      { id: 'd', label: r`$k = 12$`, value: 12, trapExplanation: r`Only the factor 2 is needed: $2 \cdot 3 = 6$.` },
    ],
    correctOptionId: 'a',
    stepByStepSolution: [
      r`$R_2 - 2R_1$ gives $0 = k - 6$.`,
      r`If $k \ne 6$ this is a contradiction: no solution.`,
      r`If $k = 6$ the row is $0 = 0$, one equation remains for two unknowns: infinitely many solutions.`,
    ],
    keyConceptTag: 'Parameter that makes a system consistent',
  },
  {
    id: 'la-02-x6',
    difficulty: 2,
    promptText: r`How many free variables does the system $x + y + z = 1$, $2x + 2y + 2z = 2$ have?`,
    options: [
      { id: 'a', label: '2', value: 2 },
      { id: 'b', label: '1', value: 1, trapExplanation: r`Two equations, but the second is twice the first: only one pivot remains, so $3 - 1 = 2$ variables are free.` },
      { id: 'c', label: '0', value: 0, trapExplanation: r`Zero free variables would mean a unique solution; one equation in three unknowns cannot pin them down.` },
      { id: 'd', label: 'There is no solution', value: -1, trapExplanation: r`$R_2 - 2R_1$ gives $0 = 0$, not a contradiction.` },
    ],
    correctOptionId: 'a',
    stepByStepSolution: [
      r`$R_2 - 2R_1 = (0 \ 0 \ 0 \mid 0)$: the second equation adds nothing.`,
      r`One pivot (in the $x$ column) for three unknowns.`,
      r`Free variables $= 3 - 1 = 2$ ($y$ and $z$).`,
    ],
    keyConceptTag: 'Counting free variables',
  },
];
