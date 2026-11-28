import type { QuestionTemplate } from '../../../types.ts';
import { r } from '../define.ts';
import { allDistinct, frac, lin, paren, poly } from '../gen.ts';

const r6 = (x: number) => Math.round(x * 1e6) / 1e6;
/** "y = 3x - 5" */
export const lineLab = (m: number, c: number) => `$y = ${poly([c, m])}$`;
/** An inequality answer "x < 3" with its value [direction, bound]: direction −1 for <, +1 for >. */
export const ineq = (dir: number, t: number) => ({ label: `$x ${dir < 0 ? '<' : '>'} ${t}$`, value: [dir, t] });

export const practice: QuestionTemplate[] = [
  {
    id: 'sm-03-1',
    difficulty: 1,
    keyConceptTag: 'Solving a linear equation',
    correctOptionId: 'a',
    generate: (g) => {
      const { a, b, c, x0 } = g.until(
        () => ({ a: g.nonzero(-9, 9), b: g.int(-15, 15), c: g.nonzero(-9, 9), x0: g.int(-8, 8) }),
        ({ a, b, c, x0 }) => {
          const d = (a - c) * x0 + b;
          return a !== c && a + c !== 0 && allDistinct([x0, (d + b) / (a - c), (d - b) / (a + c), (d - b) / a].map(r6));
        },
      );
      const d = (a - c) * x0 + b;
      return {
        params: { a, b, c, d },
        promptText: r`Solve $${poly([b, a])} = ${poly([d, c])}$.`,
        options: [
          { id: 'a', label: `$x = ${x0}$`, value: x0 },
          { id: 'b', label: `$x = ${frac(d + b, a - c)}$`, value: (d + b) / (a - c), trapExplanation: r`Moving $${paren(b)}$ to the other side changes its sign: the numbers give $${d} - ${paren(b)}$.` },
          { id: 'c', label: `$x = ${frac(d - b, a + c)}$`, value: (d - b) / (a + c), trapExplanation: r`Moving $${c}x$ to the left side changes its sign: $${a}x - ${paren(c)}x = ${a - c}x$.` },
          { id: 'd', label: `$x = ${frac(d - b, a)}$`, value: (d - b) / a, trapExplanation: r`The term $${c}x$ on the right has to be collected with $${a}x$ first.` },
        ],
        stepByStepSolution: [
          r`Collect $x$ on the left: $${a}x - ${paren(c)}x = ${a - c}x$.`,
          r`Collect the numbers on the right: $${d} - ${paren(b)} = ${d - b}$. So $${a - c}x = ${d - b}$.`,
          r`$x = \frac{${d - b}}{${a - c}} = ${x0}$.`,
        ],
      };
    },
  },
  {
    id: 'sm-03-2',
    difficulty: 1,
    keyConceptTag: 'The slope through two points',
    correctOptionId: 'a',
    generate: (g) => {
      const { x1, y1, x2, y2 } = g.until(
        () => ({ x1: g.int(-6, 6), y1: g.int(-9, 9), x2: g.int(-6, 6), y2: g.int(-9, 9) }),
        ({ x1, y1, x2, y2 }) => x1 !== x2 && y1 !== y2 && allDistinct([(y2 - y1) / (x2 - x1), (x2 - x1) / (y2 - y1), -(y2 - y1) / (x2 - x1), y2 - y1].map(r6)),
      );
      const dy = y2 - y1;
      const dx = x2 - x1;
      return {
        params: { x1, y1, x2, y2 },
        promptText: r`What is the slope of the line through $(${x1}, ${y1})$ and $(${x2}, ${y2})$?`,
        options: [
          { id: 'a', label: `$${frac(dy, dx)}$`, value: dy / dx },
          { id: 'b', label: `$${frac(dx, dy)}$`, value: dx / dy, trapExplanation: r`Upside down: the change in $y$ goes on top.` },
          { id: 'c', label: `$${frac(-dy, dx)}$`, value: -dy / dx, trapExplanation: r`Subtract in the same order on top and bottom: $\frac{y_2 - y_1}{x_2 - x_1}$.` },
          { id: 'd', label: `$${dy}$`, value: dy, trapExplanation: r`${dy} is $\Delta y$; divide it by $\Delta x = ${dx}$.` },
        ],
        stepByStepSolution: [
          r`$\Delta y = ${y2} - ${paren(y1)} = ${dy}$.`,
          r`$\Delta x = ${x2} - ${paren(x1)} = ${dx}$.`,
          r`$m = \frac{${dy}}{${dx}} = ${frac(dy, dx)}$.`,
        ],
      };
    },
  },
  {
    id: 'sm-03-3',
    difficulty: 2,
    keyConceptTag: 'The line through two points',
    correctOptionId: 'a',
    generate: (g) => {
      const { m, c, x1, x2 } = g.until(
        () => ({ m: g.nonzero(-4, 4), c: g.int(-9, 9), x1: g.int(-4, 4), x2: g.int(-4, 5) }),
        ({ m, c, x1, x2 }) => x1 !== x2 && x1 !== 0 && allDistinct([[m, c], [m, m * x1 + c + m * x1], [m, m * x1 + c], [-m, m * x1 + c + m * x1]].map(String)),
      );
      const y1 = m * x1 + c;
      const y2 = m * x2 + c;
      const wrongC = y1 + m * x1;
      return {
        params: { x1, y1, x2, y2 },
        promptText: r`Which line passes through $(${x1}, ${y1})$ and $(${x2}, ${y2})$?`,
        options: [
          { id: 'a', label: lineLab(m, c), value: [m, c] },
          { id: 'b', label: lineLab(m, wrongC), value: [m, wrongC], trapExplanation: r`$c = y_1 - m x_1 = ${y1} - ${paren(m)}\cdot${paren(x1)}$; the product is subtracted, not added.` },
          { id: 'c', label: lineLab(m, y1), value: [m, y1], trapExplanation: r`The intercept is $y$ at $x = 0$, not at $x = ${x1}$.` },
          { id: 'd', label: lineLab(-m, wrongC), value: [-m, wrongC], trapExplanation: r`Check a point: this line does not pass through $(${x2}, ${y2})$. The slope is $\frac{${y2 - y1}}{${x2 - x1}} = ${m}$.` },
        ],
        stepByStepSolution: [
          r`$m = \frac{${y2} - ${paren(y1)}}{${x2} - ${paren(x1)}} = \frac{${y2 - y1}}{${x2 - x1}} = ${m}$.`,
          r`$c = y_1 - m x_1 = ${y1} - ${paren(m)}\cdot${paren(x1)} = ${c}$.`,
          r`$y = ${poly([c, m])}$. Check: $${paren(m)}\cdot${paren(x2)} ${c < 0 ? '-' : '+'} ${Math.abs(c)} = ${y2}$. ✓`,
        ],
      };
    },
  },
  {
    id: 'sm-03-4',
    difficulty: 2,
    keyConceptTag: 'Solving a 2×2 system',
    correctOptionId: 'a',
    generate: (g) => {
      const { A, x, y } = g.until(
        () => ({ A: [[g.nonzero(-5, 5), g.nonzero(-5, 5)], [g.nonzero(-5, 5), g.nonzero(-5, 5)]], x: g.int(-6, 6), y: g.int(-6, 6) }),
        ({ A, x, y }) => A[0][0] * A[1][1] - A[0][1] * A[1][0] !== 0 && x !== y && x !== -y && x !== 0 && y !== 0,
      );
      const e = A[0][0] * x + A[0][1] * y;
      const f = A[1][0] * x + A[1][1] * y;
      const pt = (u: number, v: number) => `$(x, y) = (${u}, ${v})$`;
      return {
        params: { A, e, f },
        promptText: r`Solve the system $${lin(A[0], ['x', 'y'])} = ${e}$, $\ ${lin(A[1], ['x', 'y'])} = ${f}$.`,
        options: [
          { id: 'a', label: pt(x, y), value: [x, y] },
          { id: 'b', label: pt(y, x), value: [y, x], trapExplanation: r`The values are swapped: substitute them back and the first equation gives $${A[0][0] * y + A[0][1] * x}$, not ${e}.` },
          { id: 'c', label: pt(-x, y), value: [-x, y], trapExplanation: r`Check the first equation: $${A[0][0] * -x + A[0][1] * y} \ne ${e}$. A sign slipped while eliminating.` },
          { id: 'd', label: pt(x, -y), value: [x, -y], trapExplanation: r`Check the second equation: $${A[1][0] * x + A[1][1] * -y} \ne ${f}$.` },
        ],
        stepByStepSolution: [
          r`Eliminate $y$: multiply the first equation by ${A[1][1]} and the second by ${A[0][1]}, then subtract: $${A[0][0] * A[1][1] - A[0][1] * A[1][0]}x = ${e * A[1][1] - f * A[0][1]}$.`,
          r`So $x = ${x}$. Substitute into the first equation: $${A[0][0] * x} ${A[0][1] < 0 ? '-' : '+'} ${Math.abs(A[0][1])}y = ${e}$, so $y = ${y}$.`,
          r`Check the second: $${A[1][0]}\cdot${paren(x)} ${A[1][1] < 0 ? '-' : '+'} ${Math.abs(A[1][1])}\cdot${paren(y)} = ${f}$. ✓`,
        ],
      };
    },
  },
  {
    id: 'sm-03-5',
    difficulty: 3,
    keyConceptTag: 'Inequalities with a negative coefficient',
    correctOptionId: 'a',
    generate: (g) => {
      const { k, m, t } = g.until(() => ({ k: g.int(-7, -2), m: g.nonzero(-12, 12), t: g.nonzero(-8, 8) }), () => true);
      const n = k * t + m;
      return {
        params: { k, m, n },
        promptText: r`Solve the inequality $${poly([m, k])} > ${n}$.`,
        options: [
          { id: 'a', ...ineq(-1, t) },
          { id: 'b', ...ineq(1, t), trapExplanation: r`Dividing by the negative number ${k} flips the inequality sign.` },
          { id: 'c', ...ineq(-1, -t), trapExplanation: r`$${n} - ${paren(m)} = ${n - m}$ and $\frac{${n - m}}{${k}} = ${t}$: check the sign of the bound.` },
          { id: 'd', ...ineq(1, -t), trapExplanation: r`Both the bound and the direction are off. Test $x = ${t - 1}$: $${k * (t - 1) + m} > ${n}$ is true.` },
        ],
        stepByStepSolution: [
          r`Subtract ${m < 0 ? `$(${m})$` : m}: $${k}x > ${n - m}$.`,
          r`Divide by $${k}$, a negative number, and flip the sign: $x < \frac{${n - m}}{${k}}$.`,
          r`$x < ${t}$. Check with $x = ${t - 1}$: $${k * (t - 1) + m} > ${n}$. ✓`,
        ],
      };
    },
  },
  {
    id: 'sm-03-6',
    difficulty: 3,
    keyConceptTag: 'Setting up a system',
    correctOptionId: 'a',
    generate: (g) => {
      const { A, C, a, c } = g.until(
        () => ({ A: g.pick([8, 9, 10, 12, 14, 15]), C: g.pick([4, 5, 6, 7]), a: g.int(3, 40), c: g.int(3, 40) }),
        ({ A, C, a, c }) => A > C && a !== c && allDistinct([a, c, (A * a + C * c) / (A + C), (A * a + C * c - C * (a + c)) / A].map(r6)),
      );
      const n = a + c;
      const T = A * a + C * c;
      return {
        params: { A, C, n, T },
        promptText: r`A cinema sells adult tickets for ${A} € and child tickets for ${C} €. One evening it sold ${n} tickets for ${T} € in total. How many adult tickets were sold?`,
        options: [
          { id: 'a', label: `$${a}$`, value: a },
          { id: 'b', label: `$${c}$`, value: c, trapExplanation: r`${c} is the number of <i>child</i> tickets: $${n} - ${c} = ${a}$ adults.` },
          { id: 'c', label: `$${frac(T, A + C)}$`, value: T / (A + C), trapExplanation: r`That treats every ticket as a pair costing $${A} + ${C}$. Use two unknowns: $a + c = ${n}$ and $${A}a + ${C}c = ${T}$.` },
          { id: 'd', label: `$${frac(T - C * n, A)}$`, value: (T - C * n) / A, trapExplanation: r`After substituting $c = ${n} - a$, the coefficient of $a$ is $${A} - ${C} = ${A - C}$, not ${A}.` },
        ],
        stepByStepSolution: [
          r`Unknowns: $a$ adults, $c$ children. Then $a + c = ${n}$ and $${A}a + ${C}c = ${T}$.`,
          r`Substitute $c = ${n} - a$: $${A}a + ${C}(${n} - a) = ${T}$, i.e. $${A - C}a = ${T} - ${C * n} = ${T - C * n}$.`,
          r`$a = \frac{${T - C * n}}{${A - C}} = ${a}$ (and $c = ${c}$; check: $${A * a} + ${C * c} = ${T}$ ✓).`,
        ],
      };
    },
  },
];
