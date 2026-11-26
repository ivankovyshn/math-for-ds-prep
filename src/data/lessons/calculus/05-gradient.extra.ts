import type { QuestionTemplate } from '../../../types.ts';
import { r } from '../define.ts';
import { PYTHAGOREAN, allDistinct, dec, fvec, lin, paren, vec } from '../gen.ts';
import { legs } from '../linalg/08-norms.practice.ts';
import { withConst } from './05-gradient.practice.ts';

/** Extra practice (Practice 2): gentler questions on the same ideas, with new numbers every time. */
export const extra: QuestionTemplate[] = [
  {
    id: 'ca-05-x1',
    difficulty: 1,
    keyConceptTag: 'The gradient',
    correctOptionId: 'a',
    generate: (g) => {
      const { a, b, c } = g.until(() => ({ a: g.nonzero(-6, 6), b: g.nonzero(-6, 6), c: g.nonzero(-9, 9) }), ({ a, b }) => Math.abs(a) !== Math.abs(b));
      return {
        params: { k: [a, b, c] },
        promptText: r`What is $\nabla f$ for $f(x, y) = ${withConst(lin([a, b], ['x', 'y']), c)}$?`,
        options: [
          { id: 'a', label: `$${vec([a, b])}$`, value: [a, b] },
          { id: 'b', label: `$${vec([b, a])}$`, value: [b, a], trapExplanation: r`The first component is $\frac{\partial f}{\partial x} = ${a}$.` },
          { id: 'c', label: `$${vec([a, b, c])}$`, value: [a, b, c], trapExplanation: r`A function of two variables has a gradient with two components; the constant ${c} has derivative 0.` },
          { id: 'd', label: `$${vec([-a, -b])}$`, value: [-a, -b], trapExplanation: r`That is $-\nabla f$, the direction of steepest <i>descent</i>.` },
        ],
        stepByStepSolution: [
          r`$\frac{\partial f}{\partial x} = ${a}$ (with $y$ fixed, the other terms are constants).`,
          r`$\frac{\partial f}{\partial y} = ${b}$.`,
          r`$\nabla f = ${vec([a, b])}$, the same at every point: the graph is a tilted plane.`,
        ],
      };
    },
  },
  {
    id: 'ca-05-x2',
    difficulty: 1,
    keyConceptTag: 'Partial derivatives',
    correctOptionId: 'a',
    generate: (g) => {
      const { p, q } = g.until(
        () => ({ p: g.nonzero(-2, 3), q: g.nonzero(-2, 2) }),
        ({ p, q }) => allDistinct([3 * p * p * q * q, 2 * p * q ** 3, p * p * q ** 3, 3 * p * p * q ** 3]),
      );
      return {
        params: { P: [p, q] },
        promptText: r`$f(x, y) = x^2y^3$. What is $\dfrac{\partial f}{\partial y}$ at $(${p}, ${q})$?`,
        options: [
          { id: 'a', label: `$${3 * p * p * q * q}$`, value: 3 * p * p * q * q },
          { id: 'b', label: `$${2 * p * q ** 3}$`, value: 2 * p * q ** 3, trapExplanation: r`That is $\frac{\partial f}{\partial x} = 2xy^3$.` },
          { id: 'c', label: `$${p * p * q ** 3}$`, value: p * p * q ** 3, trapExplanation: r`That is the value $f(${p}, ${q})$.` },
          { id: 'd', label: `$${3 * p * p * q ** 3}$`, value: 3 * p * p * q ** 3, trapExplanation: r`The power of $y$ drops by one: $(y^3)' = 3y^2$.` },
        ],
        stepByStepSolution: [
          r`Hold $x$ fixed: $x^2$ is a constant factor.`,
          r`$\frac{\partial f}{\partial y} = x^2\cdot3y^2 = 3x^2y^2$.`,
          r`At $(${p}, ${q})$: $3\cdot${p * p}\cdot${q * q} = ${3 * p * p * q * q}$.`,
        ],
      };
    },
  },
  {
    id: 'ca-05-x3',
    difficulty: 1,
    keyConceptTag: 'Steepest ascent',
    correctOptionId: 'a',
    generate: (g) => {
      const { a, b, c } = legs(g, PYTHAGOREAN.slice(0, 2));
      const k = g.int(1, 2);
      const [ga, gb] = [k * a, k * b];
      return {
        params: { grad: [ga, gb] },
        promptText: r`At a point $P$, $\nabla f(P) = ${vec([ga, gb])}$. What is the greatest rate of increase of $f$ at $P$?`,
        options: [
          { id: 'a', label: `$${k * c}$`, value: k * c },
          { id: 'b', label: `$${Math.abs(ga) + Math.abs(gb)}$`, value: Math.abs(ga) + Math.abs(gb), trapExplanation: r`The rate is the length of the gradient, $\sqrt{${ga * ga} + ${gb * gb}}$, not the sum of its components.` },
          { id: 'c', label: `$${k * k * c * c}$`, value: k * k * c * c, trapExplanation: r`That is $\|\nabla f\|^2$; take the square root.` },
          { id: 'd', label: `$${Math.max(Math.abs(ga), Math.abs(gb))}$`, value: Math.max(Math.abs(ga), Math.abs(gb)), trapExplanation: r`Walking diagonally, along $\nabla f$ itself, beats both coordinate directions.` },
        ],
        stepByStepSolution: [
          r`The greatest rate of increase is $\|\nabla f\|$, reached in the direction of $\nabla f$.`,
          r`$\|\nabla f\| = \sqrt{${ga * ga} + ${gb * gb}} = \sqrt{${k * k * c * c}}$.`,
          r`$= ${k * c}$.`,
        ],
      };
    },
  },
  {
    id: 'ca-05-x4',
    difficulty: 2,
    keyConceptTag: 'A gradient-descent step',
    correctOptionId: 'a',
    generate: (g) => {
      const { w, t, eta } = g.until(
        () => ({ w: g.int(-5, 8), t: g.int(-3, 5), eta: g.pick([0.1, 0.25, 0.05]) }),
        ({ w, t, eta }) => w !== t && allDistinct([w - eta * 2 * (w - t), w + eta * 2 * (w - t), w - eta * (w - t), w - 2 * (w - t)].map(dec)),
      );
      const d = 2 * (w - t);
      return {
        params: { w, t, eta },
        promptText: r`The loss is $L(w) = (w - ${paren(t)})^2$. Take one gradient-descent step from $w = ${w}$ with $\eta = ${eta}$.`,
        options: [
          { id: 'a', label: `$${dec(w - eta * d)}$`, value: w - eta * d },
          { id: 'b', label: `$${dec(w + eta * d)}$`, value: w + eta * d, trapExplanation: r`That moves uphill: descent subtracts $\eta L'(w)$.` },
          { id: 'c', label: `$${dec(w - (eta * d) / 2)}$`, value: w - (eta * d) / 2, trapExplanation: r`$L'(w) = 2(w - ${paren(t)})$: the factor 2 is missing.` },
          { id: 'd', label: `$${dec(w - d)}$`, value: w - d, trapExplanation: r`The derivative must be scaled by the learning rate $\eta = ${eta}$.` },
        ],
        stepByStepSolution: [
          r`$L'(w) = 2(w - ${paren(t)})$, so $L'(${w}) = ${d}$.`,
          r`$w_{\text{new}} = ${w} - ${eta}\cdot${paren(d)}$.`,
          r`$= ${dec(w - eta * d)}$, closer to the minimum at $w = ${t}$.`,
        ],
      };
    },
  },
  {
    id: 'ca-05-x5',
    difficulty: 2,
    keyConceptTag: 'Direction of steepest descent',
    correctOptionId: 'a',
    generate: (g) => {
      const { a, b, c } = legs(g, PYTHAGOREAN.slice(0, 2));
      return {
        params: { grad: [a, b] },
        promptText: r`$\nabla f(P) = ${vec([a, b])}$. Which unit vector points in the direction of steepest descent at $P$?`,
        options: [
          { id: 'a', label: `$${fvec([-a, -b], c)}$`, value: [-a / c, -b / c] },
          { id: 'b', label: `$${fvec([a, b], c)}$`, value: [a / c, b / c], trapExplanation: r`That is the direction of steepest <i>ascent</i>, along $\nabla f$.` },
          { id: 'c', label: `$${fvec([b, -a], c)}$`, value: [b / c, -a / c], trapExplanation: r`That is perpendicular to $\nabla f$: along the level curve, where $f$ does not change at first.` },
          { id: 'd', label: `$${fvec([-a, -b], c * c)}$`, value: [-a / (c * c), -b / (c * c)], trapExplanation: r`Divide by $\|\nabla f\| = ${c}$, not by $\|\nabla f\|^2$: this vector has length $\frac{1}{${c}}$.` },
        ],
        stepByStepSolution: [
          r`Steepest descent is along $-\nabla f = ${vec([-a, -b])}$.`,
          r`Its length is $\sqrt{${a * a} + ${b * b}} = ${c}$.`,
          r`Unit vector: $${fvec([-a, -b], c)}$.`,
        ],
      };
    },
  },
  {
    id: 'ca-05-x6',
    difficulty: 2,
    keyConceptTag: 'Partial derivatives',
    correctOptionId: 'a',
    generate: (g) => {
      const { a, b } = g.until(
        () => ({ a: g.nonzero(-4, 5), b: g.nonzero(-4, 5) }),
        ({ a, b }) => allDistinct([a, b, 1, a + b]),
      );
      return {
        params: { a, b },
        promptText: r`$f(x, y) = e^{${lin([a, b], ['x', 'y'])}}$. What is $\dfrac{\partial f}{\partial x}(0, 0)$?`,
        options: [
          { id: 'a', label: `$${a}$`, value: a },
          { id: 'b', label: `$${b}$`, value: b, trapExplanation: r`That is $\frac{\partial f}{\partial y}(0, 0)$, from the coefficient of $y$.` },
          { id: 'c', label: '$1$', value: 1, trapExplanation: r`$e^u$ is its own derivative, but the chain rule multiplies by $\frac{\partial u}{\partial x} = ${a}$.` },
          { id: 'd', label: `$${a + b}$`, value: a + b, trapExplanation: r`With $y$ fixed, only the $x$-coefficient ${a} comes out of the exponent.` },
        ],
        stepByStepSolution: [
          r`$\frac{\partial f}{\partial x} = e^{${lin([a, b], ['x', 'y'])}}\cdot${paren(a)}$ (chain rule, $y$ fixed).`,
          r`At $(0, 0)$, $e^0 = 1$.`,
          r`$\frac{\partial f}{\partial x}(0, 0) = ${a}$; this is why the gradient of $e^{\mathbf{w}\cdot\mathbf{x}}$ is proportional to $\mathbf{w}$.`,
        ],
      };
    },
  },
];
