import { defineLesson, r } from '../define.ts';
import { extra } from './02-systems.extra.ts';
import { practice } from './02-systems.practice.ts';

export default defineLesson({
  id: 'la-02',
  moduleId: 'linalg',
  title: 'Linear systems and Gaussian elimination',
  blurb: 'Augmented matrices, row operations, echelon form',
  minutes: 8,
  lecture: [
    {
      title: 'What a linear system is',
      blocks: [
        {
          kind: 'text',
          text: r`A <i>linear equation</i> in unknowns $x_1, \dots, x_n$ has the form $a_1x_1 + \dots + a_nx_n = b$: no products of unknowns, no powers, no $\sin x$. A <i>system</i> is several such equations that must hold at the same time.

All the information sits in the numbers, so we drop the letters and keep a table — the <i>augmented matrix</i>.`,
        },
        {
          kind: 'formula',
          tex: r`\begin{cases} x + y + z = 6 \\ 2x + 3y + z = 11 \\ x - y + 2z = 5 \end{cases} \quad\longleftrightarrow\quad \left(\begin{array}{ccc|c} 1 & 1 & 1 & 6 \\ 2 & 3 & 1 & 11 \\ 1 & -1 & 2 & 5 \end{array}\right)`,
          caption: r`Each row is an equation; each column left of the bar belongs to one unknown. In matrix form the system is $A\mathbf{x} = \mathbf{b}$.`,
        },
        {
          kind: 'text',
          text: r`With two unknowns each equation is a line in the plane, and a solution is a point lying on every line. Two lines can meet in exactly three ways:`,
        },
        { kind: 'diagram', type: 'lineCases' },
        {
          kind: 'box',
          variant: 'theorem',
          title: 'Only three possibilities',
          text: r`Every linear system has either <i>no solution</i>, <i>exactly one</i>, or <i>infinitely many</i>. It can never have exactly two: if $\mathbf{p}$ and $\mathbf{q}$ are solutions, so is every point $\mathbf{p} + t(\mathbf{q} - \mathbf{p})$ on the line through them.`,
        },
        {
          kind: 'quiz',
          id: 'la-02-q1',
          prompt: r`Is $(x, y) = (1, 2)$ a solution of the system $x + y = 3$, $2x - y = 0$?`,
          options: [
            { id: 'a', label: 'Yes: it satisfies both equations' },
            { id: 'b', label: 'No: it satisfies only the first equation', trapExplanation: r`Check the second one too: $2 \cdot 1 - 2 = 0$. It holds.` },
            { id: 'c', label: 'No: it satisfies only the second equation', trapExplanation: r`$1 + 2 = 3$, so the first equation holds as well.` },
          ],
          correctOptionId: 'a',
          explanation: r`$1 + 2 = 3$ and $2 \cdot 1 - 2 = 0$. A solution must satisfy <i>every</i> equation — this one does.`,
        },
      ],
    },
    {
      title: 'Row operations',
      covers: ['2'],
      blocks: [
        {
          kind: 'text',
          text: r`To solve a system we change it into a simpler one with <i>the same solutions</i>. Three moves are allowed — the elementary row operations:

• <i>Swap</i> two rows.

• <i>Scale</i> a row by a non-zero number $c$.

• <i>Replace</i> a row by itself plus a multiple of another row: $R_i \to R_i + cR_j$.

Each move can be undone (swap back, scale by $1/c$, subtract $cR_j$ again), so no solution is lost and none is created.`,
        },
        {
          kind: 'box',
          variant: 'pitfall',
          title: 'Never multiply a row by zero',
          text: r`$R_2 \to 0\cdot R_2$ turns an equation into $0 = 0$ and throws its information away. The new system has more solutions than the old one, and the step cannot be undone.`,
        },
        {
          kind: 'example',
          title: 'Legal moves, and one that is not',
          prompt: r`Start from $x + 2y = 5$, $3x + 4y = 11$. Which of these keep the solutions: swapping the rows, $R_2 \to R_2 - 3R_1$, or multiplying $R_2$ by 0?`,
          steps: [
            r`Swapping only reorders the equations: same solutions.`,
            r`$R_2 - 3R_1$ gives $-2y = -4$. It follows from both equations and can be undone by adding $3R_1$ back: same solutions, here $y = 2$, $x = 1$.`,
            r`Multiplying $R_2$ by 0 turns it into $0 = 0$. Its information is lost: every point of the line $x + 2y = 5$ would now "solve" the system. The step cannot be undone, so it is not allowed.`,
          ],
        },
      ],
    },
    {
      title: 'Gaussian elimination',
      covers: ['3', 'x1', 'x4'],
      blocks: [
        {
          kind: 'text',
          text: r`The strategy is always the same. Use the first row to create zeros below the first entry, then use the second row to create zeros below its first non-zero entry, and so on. The result is <i>row echelon form</i>: a staircase of leading entries called <i>pivots</i>, with zeros below each of them. Then solve from the bottom up — <i>back substitution</i>.`,
        },
        {
          kind: 'example',
          title: 'Three equations, three unknowns',
          prompt: r`Solve the system from the first section: rows $(1, 1, 1 \mid 6)$, $(2, 3, 1 \mid 11)$, $(1, -1, 2 \mid 5)$.`,
          steps: [
            r`$R_2 \to R_2 - 2R_1$ gives $(0, 1, -1 \mid -1)$. $R_3 \to R_3 - R_1$ gives $(0, -2, 1 \mid -1)$.`,
            r`$R_3 \to R_3 + 2R_2$ gives $(0, 0, -1 \mid -3)$. The matrix is now in echelon form with pivots $1, 1, -1$.`,
            r`Bottom row: $-z = -3$, so $z = 3$.`,
            r`Middle row: $y - z = -1$, so $y = 2$.`,
            r`Top row: $x + y + z = 6$, so $x = 1$. Check in the original third equation: $1 - 2 + 6 = 5$. ✓`,
          ],
        },
        {
          kind: 'box',
          variant: 'tip',
          title: 'Always check in the original system',
          text: r`Arithmetic slips are the most common error in elimination. Substituting the answer into <i>every</i> original equation takes a few seconds and catches them.`,
        },
        {
          kind: 'quiz',
          id: 'la-02-q2',
          prompt: r`The rows are $R_1 = (1 \ \ 2 \mid 5)$ and $R_2 = (3 \ \ 1 \mid 5)$. What is $R_2 - 3R_1$?`,
          options: [
            { id: 'a', label: r`$(0 \ \ {-5} \mid {-10})$`, value: [0, -5, -10] },
            { id: 'b', label: r`$(0 \ \ {-5} \mid 10)$`, value: [0, -5, 10], trapExplanation: r`The right side changes too: $5 - 3 \cdot 5 = -10$.` },
            { id: 'c', label: r`$(2 \ \ {-1} \mid 0)$`, value: [2, -1, 0], trapExplanation: r`That is $R_2 - R_1$. To clear the 3 below the pivot 1 you subtract $3R_1$.` },
          ],
          correctOptionId: 'a',
          explanation: r`Entry by entry: $3 - 3 = 0$, $1 - 6 = -5$, $5 - 15 = -10$. The $x$ entry is now 0, so $R_2$ reads $-5y = -10$, $y = 2$.`,
        },
      ],
    },
    {
      title: 'Reading the echelon form',
      covers: ['1', '4', '5', '6', 'x2', 'x3', 'x5', 'x6'],
      blocks: [
        {
          kind: 'text',
          text: r`Once the staircase is built, the number of solutions can be read off directly.

• A row $(0\ 0\ \dots\ 0 \mid c)$ with $c \ne 0$ says $0 = c$: <i>no solution</i>. The system is inconsistent.

• Otherwise, if every unknown has a pivot: <i>exactly one solution</i>.

• Otherwise the unknowns without a pivot are <i>free variables</i>. Each can take any value, and the solution set is a line, a plane, … — <i>infinitely many</i> solutions.`,
        },
        {
          kind: 'formula',
          tex: r`\text{number of free variables} = (\text{number of unknowns}) - (\text{number of pivots})`,
        },
        {
          kind: 'box',
          variant: 'pitfall',
          title: 'A zero row is harmless',
          text: r`A row $(0\ 0\ 0 \mid 0)$ says $0 = 0$. It is not a contradiction — it only shows that one equation was a combination of the others.`,
        },
        {
          kind: 'example',
          title: 'A parameter that decides',
          prompt: r`For which $k$ does $x + 2y = 3$, $2x + 4y = k$ have no solution, and for which infinitely many?`,
          steps: [
            r`$R_2 - 2R_1$ gives the row $(0\ 0 \mid k - 6)$.`,
            r`If $k \ne 6$ that row says $0 = k - 6 \ne 0$: a contradiction, so there is no solution.`,
            r`If $k = 6$ it says $0 = 0$: one real equation in two unknowns, so $y$ is free and there are infinitely many solutions.`,
            r`Free variables = unknowns − pivots $= 2 - 1 = 1$.`,
          ],
        },
        {
          kind: 'quiz',
          id: 'la-02-q3',
          prompt: r`An echelon form has rows $(1, 3, 0, 2 \mid 1)$, $(0, 0, 1, -1 \mid 4)$ and $(0, 0, 0, 0 \mid 0)$. What does it tell you?`,
          options: [
            { id: 'a', label: r`Infinitely many solutions; $x_2$ and $x_4$ are free`, value: 2 },
            { id: 'b', label: r`Infinitely many solutions; only $x_4$ is free`, value: 1, trapExplanation: r`$x_2$ has no pivot either: the pivots are in the columns of $x_1$ and $x_3$ only.` },
            { id: 'c', label: 'No solution, because of the zero row', value: -1, trapExplanation: r`A zero row with 0 on the right says $0 = 0$, which is harmless. Only $(0 \cdots 0 \mid c)$ with $c \ne 0$ is a contradiction.` },
          ],
          correctOptionId: 'a',
          explanation: r`Pivots are in the columns of $x_1$ and $x_3$; there is no contradictory row. So $x_2$ and $x_4$ are free and there are infinitely many solutions (a two-parameter family).`,
        },
      ],
    },
    {
      title: 'Summary',
      blocks: [
        {
          kind: 'text',
          text: r`• A system $A\mathbf{x} = \mathbf{b}$ is stored as the augmented matrix $(A \mid \mathbf{b})$.

• Swap, scale by $c \ne 0$, add a multiple of another row: these keep the solution set.

• Eliminate down to echelon form, then back-substitute.

• A row $0 = c$ with $c \ne 0$ means no solution. Unknowns without pivots are free; if there are any, there are infinitely many solutions.

• 0, 1 or ∞ solutions — never exactly 2.`,
        },
      ],
    },
  ],
  extra,
  questions: [
    ...practice,
    {
      id: 'la-02-2',
      difficulty: 1,
      promptText: r`Which of these operations on an augmented matrix can <i>change</i> the set of solutions?`,
      options: [
        { id: 'a', label: r`Multiplying a row by $0$` },
        { id: 'b', label: r`Swapping rows 1 and 3`, trapExplanation: r`Swapping only changes the order in which the equations are written. The same equations must hold, so the solutions are the same.` },
        { id: 'c', label: r`Multiplying a row by $-3$`, trapExplanation: r`Scaling by a non-zero number is safe: $-3(\ldots) = -3b$ holds exactly when the original equation holds, and you can undo it by multiplying by $-\tfrac13$.` },
        { id: 'd', label: r`Adding $5\times$ row 1 to row 2`, trapExplanation: r`This is the main tool of elimination. It can be undone by subtracting $5\times$ row 1 again, so no solution is gained or lost.` },
      ],
      correctOptionId: 'a',
      stepByStepSolution: [
        r`An operation is safe exactly when it can be undone: then old and new systems imply each other.`,
        r`Swaps, non-zero scaling and adding a multiple of another row are all reversible.`,
        r`Multiplying by $0$ turns the row into $0 = 0$. The information is lost and cannot be recovered, so new "solutions" appear.`,
      ],
      keyConceptTag: 'Elementary row operations',
    },
  ],
});
