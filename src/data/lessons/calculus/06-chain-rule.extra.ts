import type { QuestionTemplate } from '../../../types.ts';
import { r } from '../define.ts';
import { allDistinct, paren, poly } from '../gen.ts';

/** Extra practice (Practice 2): gentler questions on the same ideas, with new numbers every time. */
export const extra: QuestionTemplate[] = [
  {
    id: 'ca-06-x1',
    difficulty: 1,
    keyConceptTag: 'Chain rule in one variable',
    correctOptionId: 'a',
    generate: (g) => {
      const { A, B, a } = g.until(
        () => ({ A: g.nonzero(-6, 6), B: g.nonzero(-6, 6), a: g.int(-3, 3) }),
        ({ A, B }) => allDistinct([A * B, A + B, A, B]),
      );
      return {
        params: { A, B, a },
        promptText: r`At $x = ${a}$: $g'(${a}) = ${B}$ and $f'(g(${a})) = ${A}$. What is $(f\circ g)'(${a})$?`,
        options: [
          { id: 'a', label: `$${A * B}$`, value: A * B },
          { id: 'b', label: `$${A + B}$`, value: A + B, trapExplanation: r`The rates along a chain multiply: $f'(g(x))\cdot g'(x)$.` },
          { id: 'c', label: `$${A}$`, value: A, trapExplanation: r`The outer derivative alone forgets the inner rate $g'(${a}) = ${B}$.` },
          { id: 'd', label: `$${B}$`, value: B, trapExplanation: r`The inner derivative alone forgets the outer rate $f'(g(${a})) = ${A}$.` },
        ],
        stepByStepSolution: [
          r`$(f\circ g)'(x) = f'(g(x))\,g'(x)$.`,
          r`$= ${A}\cdot${paren(B)}$.`,
          r`$= ${A * B}$.`,
        ],
      };
    },
  },
  {
    id: 'ca-06-x2',
    difficulty: 1,
    keyConceptTag: 'Chain rule with two paths',
    correctOptionId: 'a',
    generate: (g) => {
      const { a, b, t } = g.until(
        () => ({ a: g.nonzero(-4, 4), b: g.nonzero(-3, 3), t: g.nonzero(-2, 2) }),
        ({ a, b, t }) => allDistinct([a + 2 * b * b * t, a + 2 * b * t, a + b, a + 2 * b * b * t * t]),
      );
      return {
        params: { a, b, t },
        promptText: r`$z = x + y^2$ with $x = ${poly([0, a], 't')}$ and $y = ${poly([0, b], 't')}$. What is $\dfrac{dz}{dt}$ at $t = ${t}$?`,
        options: [
          { id: 'a', label: `$${a + 2 * b * b * t}$`, value: a + 2 * b * b * t },
          { id: 'b', label: `$${a + 2 * b * t}$`, value: a + 2 * b * t, trapExplanation: r`$\frac{\partial z}{\partial y} = 2y = ${2 * b * t}$ must still be multiplied by $\frac{dy}{dt} = ${b}$.` },
          { id: 'c', label: `$${a + b}$`, value: a + b, trapExplanation: r`That adds $\frac{dx}{dt}$ and $\frac{dy}{dt}$ without the partial derivatives of $z$: $\frac{\partial z}{\partial y} = 2y$, not 1.` },
          { id: 'd', label: `$${a + 2 * b * b * t * t}$`, value: a + 2 * b * b * t * t, trapExplanation: r`$2y\cdot\frac{dy}{dt} = 2\cdot${paren(b * t)}\cdot${paren(b)}$: $t$ appears only once.` },
        ],
        stepByStepSolution: [
          r`$\frac{dz}{dt} = 1\cdot\frac{dx}{dt} + 2y\cdot\frac{dy}{dt} = ${a} + 2y\cdot${paren(b)}$.`,
          r`At $t = ${t}$: $y = ${b * t}$.`,
          r`$${a} + 2\cdot${paren(b * t)}\cdot${paren(b)} = ${a + 2 * b * b * t}$.`,
        ],
      };
    },
  },
  {
    id: 'ca-06-x3',
    difficulty: 1,
    keyConceptTag: 'Derivative of a squared error',
    correctOptionId: 'a',
    generate: (g) => {
      const { p, y } = g.until(() => ({ p: g.int(-5, 8), y: g.int(-5, 8) }), ({ p, y }) => allDistinct([2 * (p - y), (p - y) ** 2, 2 * (y - p), p - y]));
      return {
        params: { p, y },
        promptText: r`The loss is $L = (\hat y - y)^2$ with prediction $\hat y = ${p}$ and target $y = ${y}$. What is $\dfrac{\partial L}{\partial\hat y}$?`,
        options: [
          { id: 'a', label: `$${2 * (p - y)}$`, value: 2 * (p - y) },
          { id: 'b', label: `$${(p - y) ** 2}$`, value: (p - y) ** 2, trapExplanation: r`That is the loss itself, not its derivative.` },
          { id: 'c', label: `$${2 * (y - p)}$`, value: 2 * (y - p), trapExplanation: r`Sign: the inner derivative $\frac{\partial}{\partial\hat y}(\hat y - y) = +1$.` },
          { id: 'd', label: `$${p - y}$`, value: p - y, trapExplanation: r`$(u^2)' = 2u$: the factor 2 is missing (it would cancel only with a $\frac12$ in front of the loss).` },
        ],
        stepByStepSolution: [
          r`$\frac{\partial L}{\partial\hat y} = 2(\hat y - y)\cdot1$.`,
          r`$= 2(${p} - ${paren(y)})$.`,
          r`$= ${2 * (p - y)}$.`,
        ],
      };
    },
  },
  {
    id: 'ca-06-x4',
    difficulty: 2,
    keyConceptTag: 'Chain rule in one variable',
    correctOptionId: 'a',
    generate: (g) => {
      const { a, b, x } = g.until(
        () => ({ a: g.pick([-3, -2, 2, 3, 4]), b: g.int(-4, 4), x: g.int(-2, 2) }),
        ({ a, b, x }) => {
          const u = a * x + b;
          return u !== 0 && allDistinct([2 * a * u, 2 * u, u * u, 2 * a]);
        },
      );
      const u = a * x + b;
      return {
        params: { a, b, x },
        promptText: r`$f(x) = (${poly([b, a])})^2$. What is $f'(${x})$?`,
        options: [
          { id: 'a', label: `$${2 * a * u}$`, value: 2 * a * u },
          { id: 'b', label: `$${2 * u}$`, value: 2 * u, trapExplanation: r`Multiply by the inner derivative $(${poly([b, a])})' = ${a}$.` },
          { id: 'c', label: `$${u * u}$`, value: u * u, trapExplanation: r`That is $f(${x})$, the value.` },
          { id: 'd', label: `$${2 * a}$`, value: 2 * a, trapExplanation: r`The outer derivative $2u$ is evaluated at $u = ${u}$, not dropped.` },
        ],
        stepByStepSolution: [
          r`$f'(x) = 2(${poly([b, a])})\cdot${paren(a)}$.`,
          r`At $x = ${x}$: $${poly([b, a])} = ${u}$.`,
          r`$f'(${x}) = 2\cdot${paren(u)}\cdot${paren(a)} = ${2 * a * u}$.`,
        ],
      };
    },
  },
  {
    id: 'ca-06-x5',
    difficulty: 2,
    keyConceptTag: 'Chain rule with two paths',
    correctOptionId: 'a',
    generate: (g) => {
      const { k, c } = g.until(() => ({ k: g.nonzero(-4, 5), c: g.int(-4, 5) }), ({ k, c }) => allDistinct([c + k, c * k, c, k]));
      return {
        params: { k, c },
        promptText: r`$z = xy$ with $x = e^t$ and $y = ${poly([c, k], 't')}$. What is $\dfrac{dz}{dt}$ at $t = 0$?`,
        options: [
          { id: 'a', label: `$${c + k}$`, value: c + k },
          { id: 'b', label: `$${c * k}$`, value: c * k, trapExplanation: r`The two paths add: $y\cdot\frac{dx}{dt} + x\cdot\frac{dy}{dt}$.` },
          { id: 'c', label: `$${c}$`, value: c, trapExplanation: r`That is only the path through $x$; add $x\cdot\frac{dy}{dt} = 1\cdot${paren(k)}$.` },
          { id: 'd', label: `$${k}$`, value: k, trapExplanation: r`That is only the path through $y$; add $y\cdot\frac{dx}{dt} = ${c}\cdot1$.` },
        ],
        stepByStepSolution: [
          r`At $t = 0$: $x = 1$, $\frac{dx}{dt} = e^0 = 1$; $y = ${c}$, $\frac{dy}{dt} = ${k}$.`,
          r`$\frac{dz}{dt} = y\cdot1 + x\cdot${paren(k)}$.`,
          r`$= ${c} + ${paren(k)} = ${c + k}$.`,
        ],
      };
    },
  },
  {
    id: 'ca-06-x6',
    difficulty: 2,
    keyConceptTag: 'Backpropagation',
    correctOptionId: 'a',
    generate: (g) => {
      const { w, x, y } = g.until(
        () => ({ w: g.nonzero(-3, 3), x: g.nonzero(-3, 4), y: g.int(-6, 6) }),
        ({ w, x, y }) => {
          const e = w * x - y;
          return e !== 0 && allDistinct([e * x, e, 2 * e * x, e * w]);
        },
      );
      const e = w * x - y;
      return {
        params: { w, x, y },
        promptText: r`$\hat y = wx$ and $L = \frac12(\hat y - y)^2$ with $w = ${w}$, $x = ${x}$, $y = ${y}$. What is $\dfrac{\partial L}{\partial w}$?`,
        options: [
          { id: 'a', label: `$${e * x}$`, value: e * x },
          { id: 'b', label: `$${e}$`, value: e, trapExplanation: r`That is $\frac{\partial L}{\partial\hat y}$. Multiply by $\frac{\partial\hat y}{\partial w} = x = ${x}$.` },
          { id: 'c', label: `$${2 * e * x}$`, value: 2 * e * x, trapExplanation: r`The $\frac12$ in front of the square cancels the 2 from differentiating it.` },
          { id: 'd', label: `$${e * w}$`, value: e * w, trapExplanation: r`That is $\frac{\partial L}{\partial x}$; the local derivative of $wx$ with respect to $w$ is $x$.` },
        ],
        stepByStepSolution: [
          r`Forward: $\hat y = ${w * x}$, error $\hat y - y = ${e}$.`,
          r`$\frac{\partial L}{\partial w} = (\hat y - y)\cdot\frac{\partial\hat y}{\partial w} = ${e}\cdot${paren(x)}$.`,
          r`$= ${e * x}$.`,
        ],
      };
    },
  },
];
