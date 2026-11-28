import type { QuestionTemplate } from '../../../types.ts';
import { r } from '../define.ts';
import { allDistinct, frac, lin, paren, poly } from '../gen.ts';
import { ineq } from './03-lines.practice.ts';

const r6 = (x: number) => Math.round(x * 1e6) / 1e6;

/** Extra practice (Practice 2): gentler questions on the same ideas, with new numbers every time. */
export const extra: QuestionTemplate[] = [
  {
    id: 'sm-03-x1',
    difficulty: 1,
    keyConceptTag: 'Solving a linear equation',
    correctOptionId: 'a',
    generate: (g) => {
      const { a, b, x0 } = g.until(
        () => ({ a: g.int(2, 9), b: g.nonzero(-20, 20), x0: g.int(-9, 9) }),
        ({ a, b, x0 }) => allDistinct([x0, (a * x0 + 2 * b) / a, a * x0, (a * x0 + b) / a - b].map(r6)),
      );
      const c = a * x0 + b;
      return {
        params: { a, b, c },
        promptText: r`Solve $${poly([b, a])} = ${c}$.`,
        options: [
          { id: 'a', label: `$x = ${x0}$`, value: x0 },
          { id: 'b', label: `$x = ${frac(c + b, a)}$`, value: (c + b) / a, trapExplanation: r`Moving $${paren(b)}$ across changes its sign: $${a}x = ${c} - ${paren(b)}$.` },
          { id: 'c', label: `$x = ${c - b}$`, value: c - b, trapExplanation: r`$${a}x = ${c - b}$ still has to be divided by ${a}.` },
          { id: 'd', label: `$x = ${frac(c - a * b, a)}$`, value: c / a - b, trapExplanation: r`Dividing by ${a} must divide the whole side: subtract ${b} first, then divide.` },
        ],
        stepByStepSolution: [r`Subtract ${paren(b)} from both sides: $${a}x = ${c} - ${paren(b)} = ${c - b}$.`, r`Divide by ${a}.`, r`$x = ${x0}$.`],
      };
    },
  },
  {
    id: 'sm-03-x2',
    difficulty: 1,
    keyConceptTag: 'Where a line meets the axes',
    correctOptionId: 'a',
    generate: (g) => {
      const { m, x0 } = g.until(() => ({ m: g.nonzero(-5, 5), x0: g.nonzero(-6, 6) }), ({ m, x0 }) => allDistinct([x0, -x0, -m * x0, m].map(r6)));
      const c = -m * x0;
      return {
        params: { m, c },
        promptText: r`At which $x$ does the line $y = ${poly([c, m])}$ cross the $x$-axis?`,
        options: [
          { id: 'a', label: `$x = ${x0}$`, value: x0 },
          { id: 'b', label: `$x = ${-x0}$`, value: -x0, trapExplanation: r`Solve $${poly([c, m])} = 0$: $${m}x = ${-c}$, so $x = ${x0}$. Watch the sign.` },
          { id: 'c', label: `$x = ${c}$`, value: c, trapExplanation: r`${c} is where the line crosses the $y$-axis ($x = 0$). The $x$-axis is where $y = 0$.` },
          { id: 'd', label: `$x = ${m}$`, value: m, trapExplanation: r`${m} is the slope, not a crossing point.` },
        ],
        stepByStepSolution: [r`On the $x$-axis, $y = 0$: $${poly([c, m])} = 0$.`, r`$${m}x = ${-c}$.`, r`$x = ${x0}$.`],
      };
    },
  },
  {
    id: 'sm-03-x3',
    difficulty: 2,
    keyConceptTag: 'Reading the slope',
    correctOptionId: 'a',
    generate: (g) => {
      const { a, b, c } = g.until(
        () => ({ a: g.nonzero(-6, 6), b: g.nonzero(-6, 6), c: g.nonzero(-12, 12) }),
        ({ a, b, c }) => allDistinct([-a / b, a / b, -b / a, c / b].map(r6)),
      );
      return {
        params: { a, b, c },
        promptText: r`What is the slope of the line $${lin([a, b], ['x', 'y'])} = ${c}$?`,
        options: [
          { id: 'a', label: `$${frac(-a, b)}$`, value: -a / b },
          { id: 'b', label: `$${frac(a, b)}$`, value: a / b, trapExplanation: r`Moving $${a}x$ to the right side changes its sign.` },
          { id: 'c', label: `$${frac(-b, a)}$`, value: -b / a, trapExplanation: r`Solve for $y$, not for $x$: divide by ${b}, the coefficient of $y$.` },
          { id: 'd', label: `$${frac(c, b)}$`, value: c / b, trapExplanation: r`$${frac(c, b)}$ is the intercept $c$ of $y = mx + c$, not the slope.` },
        ],
        stepByStepSolution: [
          r`Solve for $y$: $${b}y = ${c} ${a < 0 ? '+' : '-'} ${Math.abs(a)}x$.`,
          r`Divide by ${b}: $y = ${frac(-a, b)}x ${c * b < 0 ? '-' : '+'} ${frac(Math.abs(c), Math.abs(b))}$.`,
          r`The slope is the coefficient of $x$: $${frac(-a, b)}$.`,
        ],
      };
    },
  },
  {
    id: 'sm-03-x4',
    difficulty: 2,
    keyConceptTag: 'Elimination',
    correctOptionId: 'a',
    generate: (g) => {
      const { x, y } = g.until(() => ({ x: g.int(-9, 9), y: g.int(-9, 9) }), ({ x, y }) => x !== y && x !== -y && y !== 0 && x !== 0);
      const s = x + y;
      const d = x - y;
      const pt = (u: number, v: number) => `$(x, y) = (${u}, ${v})$`;
      return {
        params: { s, d },
        promptText: r`Solve $x + y = ${s}$, $\ x - y = ${d}$.`,
        options: [
          { id: 'a', label: pt(x, y), value: [x, y] },
          { id: 'b', label: pt(y, x), value: [y, x], trapExplanation: r`Swapped: with these values $x - y = ${y - x}$, not ${d}.` },
          { id: 'c', label: pt(x, -y), value: [x, -y], trapExplanation: r`Check $x + y$: $${x} + ${paren(-y)} = ${x - y} \ne ${s}$.` },
          { id: 'd', label: pt(s + d, s - d), value: [s + d, s - d], trapExplanation: r`Adding the equations gives $2x = ${s + d}$: still divide by 2.` },
        ],
        stepByStepSolution: [r`Add the equations: $2x = ${s} + ${paren(d)} = ${s + d}$, so $x = ${x}$.`, r`Then $y = ${s} - ${paren(x)} = ${y}$.`, r`Check: $${x} - ${paren(y)} = ${d}$. ✓`],
      };
    },
  },
  {
    id: 'sm-03-x5',
    difficulty: 2,
    keyConceptTag: 'Perpendicular lines',
    correctOptionId: 'a',
    generate: (g) => {
      const { p, q } = g.until(() => ({ p: g.nonzero(-5, 5), q: g.int(1, 5) }), ({ p, q }) => allDistinct([-q / p, -p / q, q / p, p / q].map(r6)));
      return {
        params: { p, q },
        promptText: r`A line has slope $${frac(p, q)}$. What is the slope of a line perpendicular to it?`,
        options: [
          { id: 'a', label: `$${frac(-q, p)}$`, value: -q / p },
          { id: 'b', label: `$${frac(-p, q)}$`, value: -p / q, trapExplanation: r`Changing only the sign is not enough: the product of the slopes must be $-1$, but $${frac(p, q)}\cdot\big(${frac(-p, q)}\big) = ${frac(-p * p, q * q)}$.` },
          { id: 'c', label: `$${frac(q, p)}$`, value: q / p, trapExplanation: r`Flip <i>and</i> change the sign: $m_1m_2 = -1$.` },
          { id: 'd', label: `$${frac(p, q)}$`, value: p / q, trapExplanation: r`The same slope gives a parallel line.` },
        ],
        stepByStepSolution: [r`Perpendicular slopes satisfy $m_1m_2 = -1$.`, r`$m_2 = -\frac{1}{m_1} = -\frac{1}{${frac(p, q)}}$.`, r`$m_2 = ${frac(-q, p)}$.`],
      };
    },
  },
  {
    id: 'sm-03-x6',
    difficulty: 1,
    keyConceptTag: 'Inequalities with a negative coefficient',
    correctOptionId: 'a',
    generate: (g) => {
      const { k, t } = g.until(() => ({ k: g.int(-6, -2), t: g.nonzero(-7, 7) }), () => true);
      const n = k * t;
      return {
        params: { k, m: 0, n },
        promptText: r`Solve $${k}x > ${n}$.`,
        options: [
          { id: 'a', ...ineq(-1, t) },
          { id: 'b', ...ineq(1, t), trapExplanation: r`Dividing by the negative number ${k} flips the sign.` },
          { id: 'c', ...ineq(-1, -t), trapExplanation: r`$\frac{${n}}{${k}} = ${t}$: check the sign of the bound.` },
          { id: 'd', ...ineq(1, -t), trapExplanation: r`Test a value: $x = ${t - 1}$ gives $${k * (t - 1)} > ${n}$, which is true, so the answer contains numbers below ${t}.` },
        ],
        stepByStepSolution: [r`Divide both sides by ${k}.`, r`${k} is negative, so $>$ turns into $<$.`, r`$x < \frac{${n}}{${k}} = ${t}$.`],
      };
    },
  },
];
