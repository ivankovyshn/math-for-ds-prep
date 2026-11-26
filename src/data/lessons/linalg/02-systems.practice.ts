import type { QuestionTemplate } from '../../../types.ts';
import { r } from '../define.ts';
import { allDistinct, aug, augRow, det2, frac, ints, lin, mv, paren, signed, sub, system, times, vec } from '../gen.ts';

const XY = ['x', 'y'];
const XYZ = ['x', 'y', 'z'];
const X4 = ['x_1', 'x_2', 'x_3', 'x_4'];

export const practice: QuestionTemplate[] = [
  {
    id: 'la-02-1',
    difficulty: 1,
    keyConceptTag: 'Dependent equations give a free variable',
    correctOptionId: 'a',
    generate: (g) => {
      const [a, b, c] = [g.nonzero(-4, 4), g.nonzero(-4, 4), g.int(-6, 6)];
      const k = g.pick([-3, -2, 2, 3]);
      const A = [[a, b], [k * a, k * b]];
      const rhs = [c, k * c];
      return {
        params: { A, b: rhs },
        promptText: r`How many solutions does this system have?`,
        mathFormula: system(A, rhs, XY),
        options: [
          { id: 'a', label: 'Infinitely many: a whole line of solutions', value: 1 },
          { id: 'b', label: 'Exactly one', value: 0, trapExplanation: r`Two equations and two unknowns usually give one solution — but only if the equations are independent. Here the second is exactly ${k} times the first.` },
          { id: 'c', label: 'No solution', value: -1, trapExplanation: r`No solution needs a contradiction such as $0 = 5$ after elimination. $R_2 - ${paren(k)}R_1$ gives $0 = 0$, which is always true.` },
          { id: 'd', label: 'Infinitely many: every point of the plane', value: 2, trapExplanation: r`Every point would solve the system only if both equations were $0 = 0$. A point must still lie on the line $${lin([a, b], XY)} = ${c}$.` },
        ],
        stepByStepSolution: [
          r`$R_2 \to R_2 - ${paren(k)}R_1$ turns the second row into $(0 \ \ 0 \mid 0)$, i.e. $0 = 0$.`,
          r`Only one real equation remains: $${lin([a, b], XY)} = ${c}$. One pivot, two unknowns, so one free variable.`,
          r`Geometrically both equations describe the same line, and every point on it is a solution.`,
        ],
      };
    },
  },
  {
    id: 'la-02-3',
    difficulty: 2,
    keyConceptTag: 'Elimination and back substitution',
    correctOptionId: 'a',
    generate: (g) => {
      // Rows (1, 1, 1), (0, p, q), (c, s, t): eliminate x from row 3, solve the 2×2 for y, z, back-substitute.
      const { A, sol } = g.until(
        () => {
          const [p, q] = [g.nonzero(-3, 5), g.nonzero(-3, 5)];
          const [c, s, t] = [g.pick([2, 3, -1, -2]), g.int(-4, 5), g.int(-4, 4)];
          return { A: [[1, 1, 1], [0, p, q], [c, s, t]], sol: ints(g, 3, -5, 5) };
        },
        ({ A, sol }) => {
          const [, [, p, q], [c, s, t]] = A;
          const [x, y, z] = sol;
          return det2([[p, q], [s - c, t - c]]) !== 0 && z !== 0 && x !== z &&
            allDistinct([sol, [x + 1, y - 1, z], [x, y, -z], [z, y, x]]);
        },
      );
      const rhs = mv(A, sol);
      const [x, y, z] = sol;
      const [, [, p, q], [c, s, t]] = A;
      const r3 = [s - c, t - c, rhs[2] - c * rhs[0]];
      const guess = [x + 1, y - 1, z];
      return {
        params: { A, b: rhs },
        promptText: r`Solve the system.`,
        mathFormula: system(A, rhs, XYZ),
        options: [
          { id: 'a', label: r`$(x, y, z) = ${vec(sol)}$`, value: sol },
          { id: 'b', label: r`$(x, y, z) = ${vec(guess)}$`, value: guess, trapExplanation: r`It fits the first equation, but the second gives $${mv([A[1]], guess)[0]} \ne ${rhs[1]}$. A solution must satisfy every equation.` },
          { id: 'c', label: r`$(x, y, z) = ${vec([x, y, -z])}$`, value: [x, y, -z], trapExplanation: r`The sign of $z$ was lost: the first equation gives $${x + y - z} \ne ${rhs[0]}$. Check every value in the original system.` },
          { id: 'd', label: r`$(x, y, z) = ${vec([z, y, x])}$`, value: [z, y, x], trapExplanation: r`$x$ and $z$ were swapped. Keep track of which column belongs to which unknown.` },
        ],
        stepByStepSolution: [
          r`$R_3 \to R_3 - ${paren(c)}R_1$: $${lin(r3.slice(0, 2), ['y', 'z'])} = ${r3[2]}$.`,
          r`Solve it together with $${lin([p, q], ['y', 'z'])} = ${rhs[1]}$: $y = ${y}$, $z = ${z}$.`,
          r`Back to the first equation: $x = ${rhs[0]} - ${paren(y)} - ${paren(z)} = ${x}$. Check the third: $${mv([A[2]], sol)[0]} = ${rhs[2]}$. ✓`,
        ],
      };
    },
  },
  {
    id: 'la-02-4',
    difficulty: 2,
    keyConceptTag: 'A row 0 = c means no solution',
    correctOptionId: 'a',
    generate: (g) => {
      const [a, b, d] = [g.int(-3, 3), g.int(-3, 3), g.int(-4, 4)];
      const c = g.nonzero(-6, 6);
      const A = [[1, a, b], [0, 1, d], [0, 0, 0]];
      const rhs = [g.int(-5, 5), g.int(-5, 5), c];
      return {
        params: { A, b: rhs },
        promptText: r`After elimination, a system in $x_1, x_2, x_3$ has this augmented matrix. What can you conclude?`,
        mathFormula: aug(A, rhs),
        options: [
          { id: 'a', label: 'No solution', value: -1 },
          { id: 'b', label: 'Exactly one solution', value: 0, trapExplanation: r`Back substitution cannot even start: the last row reads $0 = ${c}$, which no choice of $x_1, x_2, x_3$ can satisfy.` },
          { id: 'c', label: r`Infinitely many solutions, $x_3$ is free`, value: 1, trapExplanation: r`$x_3$ has no pivot, which <i>would</i> make it free — but only in a consistent system. A row $0 = ${c}$ rules out every solution first.` },
          { id: 'd', label: r`Infinitely many solutions, two free variables`, value: 2, trapExplanation: r`The zero coefficients in the last row are not "missing pivots" of two variables; that row is the contradiction $0 = ${c}$.` },
        ],
        stepByStepSolution: [
          r`Read the last row as an equation: $0x_1 + 0x_2 + 0x_3 = ${c}$.`,
          r`The left side is $0$ for every choice of unknowns, so the equation says $0 = ${c}$.`,
          r`One impossible equation makes the whole system inconsistent: there is no solution.`,
        ],
      };
    },
  },
  {
    id: 'la-02-5',
    difficulty: 3,
    keyConceptTag: 'Parameter that makes a system inconsistent',
    correctOptionId: 'a',
    generate: (g) => {
      // x + p y = s, q x + a y = t: no solution iff a = pq and t ≠ qs.
      const { p, q, s, t } = g.until(
        () => ({ p: g.nonzero(-4, 4), q: g.pick([-3, -2, 2, 3, 4]), s: g.nonzero(-4, 4), t: g.int(-8, 8) }),
        ({ p, q, s, t }) => t !== q * s && allDistinct([p * q, p / q, -p * q, (p * t) / s]),
      );
      return {
        params: { p, q, s, t },
        promptText: r`For which value of $a$ does the system have <i>no</i> solution?`,
        mathFormula: r`\begin{cases} ${lin([1, p], XY)} = ${s} \\ ${q}x + ay = ${t} \end{cases}`,
        options: [
          { id: 'a', label: r`$a = ${p * q}$`, value: p * q },
          { id: 'b', label: r`$a = ${frac(p, q)}$`, value: p / q, trapExplanation: r`The ratio is upside down. The lines are parallel when the second equation's coefficients are ${q} times the first: $a = ${q}\cdot ${paren(p)}$.` },
          { id: 'c', label: r`$a = ${-p * q}$`, value: -p * q, trapExplanation: r`$R_2 - ${paren(q)}R_1$ gives $(a ${signed(-p * q)})y = ${t - q * s}$. The coefficient vanishes at $a = ${p * q}$, not at $${-p * q}$.` },
          { id: 'd', label: r`$a = ${frac(p * t, s)}$`, value: (p * t) / s, trapExplanation: r`Matching the ratio of the right-hand sides does not make the lines parallel. Parallel means the <i>left</i> sides are proportional.` },
        ],
        stepByStepSolution: [
          r`$R_2 \to R_2 - ${paren(q)}R_1$: $(a ${signed(-p * q)})y = ${t} - ${paren(q * s)} = ${t - q * s}$.`,
          r`If $a \ne ${p * q}$ we can divide: one solution. If $a = ${p * q}$ the row becomes $0 = ${t - q * s}$.`,
          r`So the system is inconsistent exactly for $a = ${p * q}$: the two lines are parallel and different.`,
        ],
      };
    },
  },
  {
    id: 'la-02-6',
    difficulty: 3,
    keyConceptTag: 'Counting free variables',
    correctOptionId: 'a',
    generate: (g) => {
      // R1 = (1, m, u, w | h), R2 = k R1 + (0, 0, 1, c | e), R3 = R1 + R2: pivots in x1 and x3 only.
      const [m, u, w, h] = [g.pick([2, 3, -2]), g.int(-2, 3), g.int(-2, 3), g.int(-4, 5)];
      const [k, c, e] = [g.pick([2, 3, -1]), g.nonzero(-3, 3), g.int(-3, 4)];
      const R1 = [1, m, u, w, h];
      const R2 = sub(times(k, R1), [0, 0, -1, -c, -e]);
      const R3 = R1.map((x, i) => x + R2[i]);
      const A = [R1, R2, R3].map((row) => row.slice(0, 4));
      const rhs = [R1, R2, R3].map((row) => row[4]);
      return {
        params: { A, b: rhs },
        promptText: r`How many free variables does the solution of this system have?`,
        mathFormula: system(A, rhs, X4),
        options: [
          { id: 'a', label: '2', value: 2 },
          { id: 'b', label: '1', value: 1, trapExplanation: r`"4 unknowns − 3 equations" assumes every equation brings a new pivot. Here the third equation is the sum of the first two, so there are only 2 pivots.` },
          { id: 'c', label: '3', value: 3, trapExplanation: r`After $R_2 - ${paren(k)}R_1$ the second row is $${augRow([0, 0, 1, c], e)}$: it has a pivot in the column of $x_3$. Only $x_2$ and $x_4$ are free.` },
          { id: 'd', label: 'None: the system has no solution', value: -1, trapExplanation: r`Elimination ends with a row $(0, 0, 0, 0 \mid 0)$, i.e. $0 = 0$. That is not a contradiction, so the system is consistent.` },
        ],
        stepByStepSolution: [
          r`$R_2 - ${paren(k)}R_1 = ${augRow([0, 0, 1, c], e)}$ and $R_3 - ${paren(k + 1)}R_1 = ${augRow([0, 0, 1, c], e)}$.`,
          r`Then the third row minus the second is $(0, 0, 0, 0 \mid 0)$: consistent, with pivots only in the columns of $x_1$ and $x_3$.`,
          r`Free variables = unknowns − pivots $= 4 - 2 = 2$ (namely $x_2$ and $x_4$).`,
        ],
      };
    },
  },
];
