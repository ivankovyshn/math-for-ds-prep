import type { QuestionTemplate } from '../../../types.ts';
import { r } from '../define.ts';
import { PYTHAGOREAN, allDistinct, dec, frac, lin, paren, sqrtTex, vec } from '../gen.ts';
import { legs } from '../linalg/08-norms.practice.ts';

/** A linear expression followed by a constant: withConst("2x + y", -3) -> "2x + y - 3". */
export const withConst = (expr: string, c: number) => (c === 0 ? expr : `${expr} ${c < 0 ? '-' : '+'} ${Math.abs(c)}`);
/** "x - y" for decimals, with a negative y in parentheses. */
const minusDec = (x: number, y: number) => `${x} - ${y < 0 ? `(${dec(y)})` : dec(y)}`;

/** A vector of decimals, e.g. "(1.6, -0.4)". */
export const dvec = (v: number[]) => `(${v.map(dec).join(', ')})`;

export const practice: QuestionTemplate[] = [
  {
    id: 'ca-05-1',
    difficulty: 1,
    keyConceptTag: 'Partial derivatives',
    correctOptionId: 'a',
    generate: (g) => {
      const { a, b, c, p, q } = g.until(
        () => ({ a: g.nonzero(-3, 4), b: g.nonzero(-4, 4), c: g.nonzero(-3, 3), p: g.nonzero(-3, 3), q: g.nonzero(-3, 3) }),
        ({ a, b, c, p, q }) => allDistinct([2 * a * p + b * q, b * p + 2 * c * q, 2 * a * p, 2 * a * p + b * q + 2 * c * q]),
      );
      return {
        params: { k: [a, b, c], P: [p, q] },
        promptText: r`$f(x, y) = ${lin([a, b, c], ['x^2', 'xy', 'y^2'])}$. What is $\dfrac{\partial f}{\partial x}$ at $(${p}, ${q})$?`,
        options: [
          { id: 'a', label: `$${2 * a * p + b * q}$`, value: 2 * a * p + b * q },
          { id: 'b', label: `$${b * p + 2 * c * q}$`, value: b * p + 2 * c * q, trapExplanation: r`That is $\frac{\partial f}{\partial y}$, the slope in the $y$ direction.` },
          { id: 'c', label: `$${2 * a * p}$`, value: 2 * a * p, trapExplanation: r`With $y$ held fixed, $${lin([b], ['xy'])}$ is a multiple of $x$; its derivative is $${b}y = ${b * q}$.` },
          { id: 'd', label: `$${2 * a * p + b * q + 2 * c * q}$`, value: 2 * a * p + b * q + 2 * c * q, trapExplanation: r`$${lin([c], ['y^2'])}$ does not depend on $x$: as a constant it has $x$-derivative 0.` },
        ],
        stepByStepSolution: [
          r`Hold $y$ fixed: $f_x = ${lin([2 * a, b], ['x', 'y'])}$.`,
          r`At $(${p}, ${q})$: $${2 * a}\cdot${paren(p)} + ${paren(b)}\cdot${paren(q)}$.`,
          r`$= ${2 * a * p + b * q}$.`,
        ],
      };
    },
  },
  {
    id: 'ca-05-2',
    difficulty: 1,
    keyConceptTag: 'The gradient',
    correctOptionId: 'a',
    generate: (g) => {
      const { a, b, c, p, q } = g.until(
        () => ({ a: g.nonzero(-5, 5), b: g.nonzero(-5, 5), c: g.nonzero(-3, 3), p: g.nonzero(-3, 3), q: g.nonzero(-3, 3) }),
        ({ a, b, c, p, q }) => allDistinct([[a + c * q, b + c * p], [a, b], [a + c * p, b + c * q], [c * q, c * p]]),
      );
      const grad = [a + c * q, b + c * p];
      return {
        params: { k: [a, b, c], P: [p, q] },
        promptText: r`$f(x, y) = ${lin([a, b, c], ['x', 'y', 'xy'])}$. What is $\nabla f(${p}, ${q})$?`,
        options: [
          { id: 'a', label: `$${vec(grad)}$`, value: grad },
          { id: 'b', label: `$${vec([a, b])}$`, value: [a, b], trapExplanation: r`The term $${lin([c], ['xy'])}$ contributes $${c}y$ to $f_x$ and $${c}x$ to $f_y$.` },
          { id: 'c', label: `$${vec([a + c * p, b + c * q])}$`, value: [a + c * p, b + c * q], trapExplanation: r`Swapped: $\frac{\partial}{\partial x}(${lin([c], ['xy'])}) = ${c}y$, which uses $y = ${q}$.` },
          { id: 'd', label: `$${vec([c * q, c * p])}$`, value: [c * q, c * p], trapExplanation: r`The linear terms $${lin([a, b], ['x', 'y'])}$ have derivatives ${a} and ${b}; they do not vanish.` },
        ],
        stepByStepSolution: [
          r`$f_x = ${withConst(lin([c], ['y']), a)}$ and $f_y = ${withConst(lin([c], ['x']), b)}$.`,
          r`At $(${p}, ${q})$: $f_x = ${a} + ${paren(c)}\cdot${paren(q)} = ${grad[0]}$, $f_y = ${b} + ${paren(c)}\cdot${paren(p)} = ${grad[1]}$.`,
          r`$\nabla f = ${vec(grad)}$.`,
        ],
      };
    },
  },
  {
    id: 'ca-05-3',
    difficulty: 2,
    keyConceptTag: 'Steepest ascent',
    correctOptionId: 'a',
    generate: (g) => {
      const { a: p, b: q, c: h } = legs(g, PYTHAGOREAN.slice(0, 2));
      const a = g.int(1, 3);
      return {
        params: { k: [a, a], P: [p, q] },
        promptText: r`$f(x, y) = ${lin([a, a], ['x^2', 'y^2'])}$. What is the greatest rate of increase of $f$ at $(${p}, ${q})$?`,
        options: [
          { id: 'a', label: `$${2 * a * h}$`, value: 2 * a * h },
          { id: 'b', label: `$${a * h}$`, value: a * h, trapExplanation: r`$\nabla f = (${2 * a}x, ${2 * a}y)$: the factor 2 from differentiating the squares is missing.` },
          { id: 'c', label: `$${2 * a * (Math.abs(p) + Math.abs(q))}$`, value: 2 * a * (Math.abs(p) + Math.abs(q)), trapExplanation: r`The rate is the Euclidean length $\|\nabla f\|$, not the sum of the absolute components.` },
          { id: 'd', label: `$${4 * a * a * h * h}$`, value: 4 * a * a * h * h, trapExplanation: r`That is $\|\nabla f\|^2$; take the square root.` },
        ],
        stepByStepSolution: [
          r`$\nabla f = (${2 * a}x, ${2 * a}y) = ${vec([2 * a * p, 2 * a * q])}$ at $(${p}, ${q})$.`,
          r`The greatest rate of increase is $\|\nabla f\| = \sqrt{${(2 * a * p) ** 2} + ${(2 * a * q) ** 2}}$.`,
          r`$= ${2 * a * h}$, in the direction of $\nabla f$.`,
        ],
      };
    },
  },
  {
    id: 'ca-05-4',
    difficulty: 2,
    keyConceptTag: 'Directional derivative',
    correctOptionId: 'a',
    generate: (g) => {
      const { p, q, s, t, h } = g.until(
        () => {
          const { a: s, b: t, c: h } = legs(g, PYTHAGOREAN.slice(0, 2));
          return { p: g.nonzero(-2, 2), q: g.nonzero(-2, 2), s, t, h };
        },
        ({ p, q, s, t, h }) => {
          const gr = [2 * p * q, p * p];
          return allDistinct([(gr[0] * s + gr[1] * t) / h, gr[0] * s + gr[1] * t, Math.hypot(gr[0], gr[1]), (gr[0] * t + gr[1] * s) / h]);
        },
      );
      const gr = [2 * p * q, p * p];
      const D = gr[0] * s + gr[1] * t;
      const N = gr[0] ** 2 + gr[1] ** 2;
      return {
        params: { P: [p, q], u: [s / h, t / h] },
        promptText: r`$f(x, y) = x^2y$. Find the rate of change of $f$ at $(${p}, ${q})$ in the direction of the unit vector $\mathbf{u} = (${frac(s, h)}, ${frac(t, h)})$.`,
        options: [
          { id: 'a', label: `$${frac(D, h)}$`, value: D / h },
          { id: 'b', label: `$${D}$`, value: D, trapExplanation: r`That dots $\nabla f$ with $${vec([s, t])}$, which has length ${h}. Use the unit vector $\mathbf{u}$.` },
          { id: 'c', label: `$${sqrtTex(N)}$`, value: Math.sqrt(N), trapExplanation: r`$\|\nabla f\|$ is the rate in the steepest direction only. Here the direction is fixed: $\nabla f\cdot\mathbf{u}$.` },
          { id: 'd', label: `$${frac(gr[0] * t + gr[1] * s, h)}$`, value: (gr[0] * t + gr[1] * s) / h, trapExplanation: r`The components were paired the wrong way: $f_x$ goes with $u_1 = ${frac(s, h)}$.` },
        ],
        stepByStepSolution: [
          r`$\nabla f = (2xy, x^2) = ${vec(gr)}$ at $(${p}, ${q})$.`,
          r`$D_{\mathbf{u}}f = \nabla f\cdot\mathbf{u} = \frac{${gr[0]}\cdot${paren(s)} + ${gr[1]}\cdot${paren(t)}}{${h}}$.`,
          r`$= ${frac(D, h)}$.`,
        ],
      };
    },
  },
  {
    id: 'ca-05-5',
    difficulty: 3,
    keyConceptTag: 'A gradient-descent step',
    correctOptionId: 'a',
    generate: (g) => {
      const { a, b, p, q, eta } = g.until(
        () => ({ a: g.int(1, 3), b: g.int(1, 3), p: g.nonzero(-4, 4), q: g.nonzero(-4, 4), eta: g.pick([0.1, 0.05, 0.25]) }),
        ({ a, b, p, q, eta }) => {
          const opts = [[p * (1 - 2 * a * eta), q * (1 - 2 * b * eta)], [p * (1 + 2 * a * eta), q * (1 + 2 * b * eta)], [p * (1 - a * eta), q * (1 - b * eta)], [p - 2 * a * p, q - 2 * b * q]];
          return allDistinct(opts.map(dvec));
        },
      );
      const grad = [2 * a * p, 2 * b * q];
      const step = (s: number, f: number) => [p - s * f * a * p, q - s * f * b * q];
      const ans = step(eta, 2);
      return {
        params: { k: [a, b], P: [p, q], eta },
        promptText: r`$f(x, y) = ${lin([a, b], ['x^2', 'y^2'])}$. Take one gradient-descent step from $(${p}, ${q})$ with learning rate $\eta = ${eta}$.`,
        options: [
          { id: 'a', label: `$${dvec(ans)}$`, value: ans },
          { id: 'b', label: `$${dvec(step(-eta, 2))}$`, value: step(-eta, 2), trapExplanation: r`That adds $\eta\nabla f$: a step uphill. Descent subtracts it.` },
          { id: 'c', label: `$${dvec(step(eta, 1))}$`, value: step(eta, 1), trapExplanation: r`$\nabla f = (${2 * a}x, ${2 * b}y)$: the factor 2 from the squares is missing.` },
          { id: 'd', label: `$${dvec(step(1, 2))}$`, value: step(1, 2), trapExplanation: r`The gradient must be scaled by $\eta = ${eta}$ before subtracting.` },
        ],
        stepByStepSolution: [
          r`$\nabla f = (${2 * a}x, ${2 * b}y) = ${vec(grad)}$ at $(${p}, ${q})$.`,
          r`$(${p}, ${q}) - ${eta}\cdot${vec(grad)} = (${minusDec(p, eta * grad[0])}, ${minusDec(q, eta * grad[1])})$.`,
          r`$= ${dvec(ans)}$.`,
        ],
      };
    },
  },
  {
    id: 'ca-05-6',
    difficulty: 3,
    keyConceptTag: 'Finding a critical point',
    correctOptionId: 'a',
    generate: (g) => {
      const { a, b, c, x0, y0 } = g.until(
        () => ({ a: g.int(1, 3), b: g.nonzero(-3, 3), c: g.int(1, 3), x0: g.int(-3, 3), y0: g.int(-3, 3) }),
        ({ a, b, c, x0, y0 }) => {
          const d = -(2 * a * x0 + b * y0);
          const e = -(b * x0 + 2 * c * y0);
          return 4 * a * c - b * b !== 0 && allDistinct([[x0, y0], [-x0, -y0], [y0, x0], [-d / (2 * a), -e / (2 * c)]]);
        },
      );
      const d = -(2 * a * x0 + b * y0);
      const e = -(b * x0 + 2 * c * y0);
      return {
        params: { k: [a, b, c, d, e] },
        promptText: r`Find the critical point of $f(x, y) = ${lin([a, b, c, d, e], ['x^2', 'xy', 'y^2', 'x', 'y'])}$.`,
        options: [
          { id: 'a', label: `$${vec([x0, y0])}$`, value: [x0, y0] },
          { id: 'b', label: `$${vec([-x0, -y0])}$`, value: [-x0, -y0], trapExplanation: r`Sign slip when moving the linear terms across: the system is $${lin([2 * a, b], ['x', 'y'])} = ${-d}$, $${lin([b, 2 * c], ['x', 'y'])} = ${-e}$.` },
          { id: 'c', label: `$${vec([y0, x0])}$`, value: [y0, x0], trapExplanation: r`The coordinates are swapped. Check: $f_x$ must vanish, and $f_x(${y0}, ${x0}) = ${2 * a * y0 + b * x0 + d} \ne 0$.` },
          { id: 'd', label: `$(${frac(-d, 2 * a)}, ${frac(-e, 2 * c)})$`, value: [-d / (2 * a), -e / (2 * c)], trapExplanation: r`That ignores the cross term $${lin([b], ['xy'])}$, which appears in both $f_x$ and $f_y$.` },
        ],
        stepByStepSolution: [
          r`$f_x = ${withConst(lin([2 * a, b], ['x', 'y']), d)} = 0$ and $f_y = ${withConst(lin([b, 2 * c], ['x', 'y']), e)} = 0$.`,
          r`Solve $${lin([2 * a, b], ['x', 'y'])} = ${-d}$, $${lin([b, 2 * c], ['x', 'y'])} = ${-e}$ (determinant $${4 * a * c - b * b} \ne 0$).`,
          r`$(x, y) = ${vec([x0, y0])}$. Check: $f_x = ${2 * a * x0 + b * y0 + d}$, $f_y = ${b * x0 + 2 * c * y0 + e}$. ✓`,
        ],
      };
    },
  },
];
