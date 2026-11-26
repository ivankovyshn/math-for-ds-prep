import type { QuestionTemplate } from '../../../types.ts';
import { r } from '../define.ts';
import { allDistinct, lin, paren, pm } from '../gen.ts';
import { KINDS, kindOf, kindOptions } from './07-jacobian-hessian.practice.ts';
import { withConst } from './05-gradient.practice.ts';

/** Extra practice (Practice 2): gentler questions on the same ideas, with new numbers every time. */
export const extra: QuestionTemplate[] = [
  {
    id: 'ca-07-x1',
    difficulty: 1,
    keyConceptTag: 'Jacobian of a simple map',
    correctOptionId: 'a',
    generate: (g) => {
      const { a, b, c } = g.until(() => ({ a: g.nonzero(-6, 6), b: g.nonzero(-6, 6), c: g.nonzero(-6, 6) }), ({ a, b, c }) => allDistinct([a, b, c]));
      return {
        params: { a, b, c },
        promptText: r`$F(x, y) = \big(${withConst(lin([a], ['x']), b)},\ ${lin([c], ['y'])}\big)$. What is $J_F$?`,
        options: [
          { id: 'a', label: `$${pm([[a, 0], [0, c]])}$`, value: [a, 0, 0, c] },
          { id: 'b', label: `$${pm([[a, b], [0, c]])}$`, value: [a, b, 0, c], trapExplanation: r`The constant ${b} does not depend on $y$; $\frac{\partial F_1}{\partial y} = 0$.` },
          { id: 'c', label: `$${pm([[0, a], [c, 0]])}$`, value: [0, a, c, 0], trapExplanation: r`Column 1 is $\frac{\partial}{\partial x}$: $F_1$ depends on $x$ with slope ${a}, so ${a} goes in position $(1, 1)$.` },
          { id: 'd', label: `$${pm([[c, 0], [0, a]])}$`, value: [c, 0, 0, a], trapExplanation: r`Row 1 belongs to the first component, $${withConst(lin([a], ['x']), b)}$.` },
        ],
        stepByStepSolution: [
          r`Row 1: $\nabla F_1 = (${a}, 0)$.`,
          r`Row 2: $\nabla F_2 = (0, ${c})$.`,
          r`$J_F = ${pm([[a, 0], [0, c]])}$: each output depends on one input only, so $J$ is diagonal.`,
        ],
      };
    },
  },
  {
    id: 'ca-07-x2',
    difficulty: 1,
    keyConceptTag: 'Hessian of a quadratic',
    correctOptionId: 'a',
    generate: (g) => {
      const { a, c } = g.until(() => ({ a: g.nonzero(-5, 5), c: g.nonzero(-5, 5) }), ({ a, c }) => a !== c);
      return {
        params: { k: [a, 0, c] },
        promptText: r`What is the Hessian of $f(x, y) = ${lin([a, c], ['x^2', 'y^2'])}$?`,
        options: [
          { id: 'a', label: `$${pm([[2 * a, 0], [0, 2 * c]])}$`, value: [2 * a, 0, 0, 2 * c] },
          { id: 'b', label: `$${pm([[a, 0], [0, c]])}$`, value: [a, 0, 0, c], trapExplanation: r`$\frac{\partial^2}{\partial x^2}(${lin([a], ['x^2'])}) = ${2 * a}$: differentiate twice.` },
          { id: 'c', label: `$(${lin([2 * a], ['x'])},\ ${lin([2 * c], ['y'])})$`, value: [2 * a, 2 * c], trapExplanation: r`That is the gradient, the first derivatives. The Hessian holds the second derivatives in a matrix.` },
          { id: 'd', label: `$${pm([[2 * a, 1], [1, 2 * c]])}$`, value: [2 * a, 1, 1, 2 * c], trapExplanation: r`There is no $xy$ term, so the mixed derivative is 0.` },
        ],
        stepByStepSolution: [
          r`$f_x = ${lin([2 * a], ['x'])}$, $f_y = ${lin([2 * c], ['y'])}$.`,
          r`$f_{xx} = ${2 * a}$, $f_{yy} = ${2 * c}$, $f_{xy} = 0$.`,
          r`$H = ${pm([[2 * a, 0], [0, 2 * c]])}$.`,
        ],
      };
    },
  },
  {
    id: 'ca-07-x3',
    difficulty: 1,
    keyConceptTag: 'Shape of the Jacobian',
    correctOptionId: 'a',
    generate: (g) => {
      const { n, m } = g.until(() => ({ n: g.int(2, 6), m: g.int(2, 5) }), ({ n, m }) => n !== m && m * n !== m + n);
      return {
        params: { n, m },
        promptText: r`$F: \mathbb{R}^{${n}} \to \mathbb{R}^{${m}}$. What is the size of its Jacobian?`,
        options: [
          { id: 'a', label: `$${m}\\times${n}$`, value: [m, n] },
          { id: 'b', label: `$${n}\\times${m}$`, value: [n, m], trapExplanation: r`One row per output component (${m}) and one column per input variable (${n}).` },
          { id: 'c', label: `$${m * n}\\times1$`, value: [m * n, 1], trapExplanation: r`There are ${m * n} partial derivatives, but they are arranged as a matrix: rows = outputs, columns = inputs.` },
          { id: 'd', label: `$${m + n}\\times1$`, value: [m + n, 1], trapExplanation: r`Each of the ${m} outputs has ${n} partial derivatives: ${m * n} entries, not ${m + n}.` },
        ],
        stepByStepSolution: [
          r`Row $i$ is the gradient of the output $F_i$.`,
          r`There are ${m} outputs and each gradient has ${n} entries.`,
          r`So $J_F$ is ${m}×${n}.`,
        ],
      };
    },
  },
  {
    id: 'ca-07-x4',
    difficulty: 2,
    keyConceptTag: 'The second-derivative test',
    correctOptionId: 'a',
    generate: (g) => {
      const target = g.int(0, 3);
      const { h11, h12, h22 } = g.until(
        () => ({ h11: g.nonzero(-6, 6), h12: g.int(-4, 4), h22: g.nonzero(-6, 6) }),
        ({ h11, h12, h22 }) => kindOf(h11, h11 * h22 - h12 * h12) === target,
      );
      const det = h11 * h22 - h12 * h12;
      const { order, options } = kindOptions(g, target, h11, det);
      return {
        params: { H: [[h11, h12], [h12, h22]], order },
        promptText: r`At a critical point of $f$, the Hessian is $H = ${pm([[h11, h12], [h12, h22]])}$. What kind of point is it?`,
        options,
        stepByStepSolution: [
          r`$\det H = ${h11}\cdot${paren(h22)} - ${paren(h12)}^2 = ${det}$.`,
          r`$f_{xx} = ${h11}$.`,
          r`${KINDS[target]}.`,
        ],
      };
    },
  },
  {
    id: 'ca-07-x5',
    difficulty: 2,
    keyConceptTag: 'Mixed partial derivatives',
    correctOptionId: 'a',
    generate: (g) => {
      const { a, b, p, q } = g.until(
        () => ({ a: g.nonzero(-3, 3), b: g.nonzero(-2, 2), p: g.nonzero(-2, 2), q: g.nonzero(-2, 2) }),
        ({ a, b, p, q }) => allDistinct([2 * a * p + 3 * b * q * q, 2 * a * q, 6 * b * p * q, 2 * a * p * q + b * q ** 3]),
      );
      return {
        params: { a, b, P: [p, q] },
        promptText: r`$f(x, y) = ${lin([a, b], ['x^2y', 'xy^3'])}$. What is $\dfrac{\partial^2 f}{\partial x\,\partial y}$ at $(${p}, ${q})$?`,
        options: [
          { id: 'a', label: `$${2 * a * p + 3 * b * q * q}$`, value: 2 * a * p + 3 * b * q * q },
          { id: 'b', label: `$${2 * a * q}$`, value: 2 * a * q, trapExplanation: r`That is $f_{xx}$, two derivatives in $x$.` },
          { id: 'c', label: `$${6 * b * p * q}$`, value: 6 * b * p * q, trapExplanation: r`That is $f_{yy}$, two derivatives in $y$.` },
          { id: 'd', label: `$${2 * a * p * q + b * q ** 3}$`, value: 2 * a * p * q + b * q ** 3, trapExplanation: r`That is $f_x$; differentiate it once more, in $y$.` },
        ],
        stepByStepSolution: [
          r`$f_x = ${lin([2 * a, b], ['xy', 'y^3'])}$.`,
          r`$f_{xy} = \frac{\partial}{\partial y}f_x = ${lin([2 * a, 3 * b], ['x', 'y^2'])}$.`,
          r`At $(${p}, ${q})$: $${2 * a * p} + ${paren(3 * b * q * q)} = ${2 * a * p + 3 * b * q * q}$.`,
        ],
      };
    },
  },
  {
    id: 'ca-07-x6',
    difficulty: 2,
    keyConceptTag: 'The Jacobian determinant',
    correctOptionId: 'a',
    generate: (g) => {
      const { a, b, c, d } = g.until(
        () => ({ a: g.nonzero(-4, 4), b: g.nonzero(-4, 4), c: g.nonzero(-4, 4), d: g.nonzero(-4, 4) }),
        ({ a, b, c, d }) => a * d - b * c !== 0 && allDistinct([Math.abs(a * d - b * c), Math.abs(a * d + b * c), a + d, a * d]),
      );
      const det = a * d - b * c;
      return {
        params: { M: [[a, b], [c, d]] },
        promptText: r`$F(x, y) = \big(${lin([a, b], ['x', 'y'])},\ ${lin([c, d], ['x', 'y'])}\big)$. By what factor does $F$ scale areas?`,
        options: [
          { id: 'a', label: `$${Math.abs(det)}$`, value: Math.abs(det) },
          { id: 'b', label: `$${Math.abs(a * d + b * c)}$`, value: Math.abs(a * d + b * c), trapExplanation: r`The determinant subtracts: $ad - bc$.` },
          { id: 'c', label: `$${a + d}$`, value: a + d, trapExplanation: r`That is the trace. Area scaling is the absolute value of the determinant.` },
          { id: 'd', label: `$${a * d}$`, value: a * d, trapExplanation: r`Only the diagonal: the off-diagonal entries ${b} and ${c} shear the square and change its area too.` },
        ],
        stepByStepSolution: [
          r`$J_F = ${pm([[a, b], [c, d]])}$ (a linear map is its own Jacobian).`,
          r`$\det J_F = ${a}\cdot${paren(d)} - ${paren(b)}\cdot${paren(c)} = ${det}$.`,
          r`Areas are scaled by $|\det J_F| = ${Math.abs(det)}$${det < 0 ? ' (the negative sign means orientation is flipped)' : ''}.`,
        ],
      };
    },
  },
];
