import type { QuestionTemplate } from '../../../types.ts';
import { r } from '../define.ts';
import { allDistinct, coef, dec, frac, paren, poly } from '../gen.ts';

const r6 = (x: number) => Math.round(x * 1e6) / 1e6;
/** (c, η) pairs for f = cx² with a tidy factor 1 − 2cη per step. */
export const STEPS = [[1, 0.25], [1, 0.75], [1, 0.4], [1, 0.2], [2, 0.1], [2, 0.125], [5, 0.05], [5, 0.15], [5, 0.02], [2, 0.3], [1, 0.6]];
export const vecTex = (v: number[]) => `(${v.map((x) => dec(r6(x))).join(',\\ ')})`;

export const practice: QuestionTemplate[] = [
  {
    id: 'op-02-1',
    difficulty: 1,
    keyConceptTag: 'One gradient step',
    correctOptionId: 'a',
    generate: (g) => {
      const { a, b, x0, eta } = g.until(
        () => ({ a: g.int(1, 4), b: g.int(-6, 6), x0: g.nonzero(-5, 5), eta: g.pick([0.05, 0.1, 0.2, 0.25]) }),
        ({ a, b, x0, eta }) => {
          const d = 2 * a * x0 + b;
          return d !== 0 && allDistinct([x0 - eta * d, x0 + eta * d, x0 - d, x0 - eta * (a * x0 * x0 + b * x0)].map(r6));
        },
      );
      const d = 2 * a * x0 + b;
      const fx = a * x0 * x0 + b * x0;
      return {
        params: { a, b, x0, eta },
        promptText: r`Gradient descent on $f(x) = ${poly([0, b, a])}$ starts at $x_0 = ${x0}$ with learning rate $\eta = ${eta}$. What is $x_1$?`,
        options: [
          { id: 'a', label: `$${dec(r6(x0 - eta * d))}$`, value: r6(x0 - eta * d) },
          { id: 'b', label: `$${dec(r6(x0 + eta * d))}$`, value: r6(x0 + eta * d), trapExplanation: r`That moves along the gradient, uphill. The update subtracts $\eta f'(x_0)$.` },
          { id: 'c', label: `$${dec(x0 - d)}$`, value: x0 - d, trapExplanation: r`The gradient must be scaled by the learning rate $\eta = ${eta}$.` },
          { id: 'd', label: `$${dec(r6(x0 - eta * fx))}$`, value: r6(x0 - eta * fx), trapExplanation: r`The step uses the derivative $f'(x_0)$, not the value $f(x_0) = ${fx}$.` },
        ],
        stepByStepSolution: [
          r`$f'(x) = ${poly([b, 2 * a])}$, so $f'(${x0}) = ${d}$.`,
          r`$x_1 = x_0 - \eta f'(x_0) = ${x0} - ${eta}\cdot${paren(d)}$.`,
          r`$x_1 = ${dec(r6(x0 - eta * d))}$.`,
        ],
      };
    },
  },
  {
    id: 'op-02-2',
    difficulty: 1,
    keyConceptTag: 'A step in two variables',
    correctOptionId: 'a',
    generate: (g) => {
      const { a, b, p, q, eta } = g.until(
        () => ({ a: g.int(1, 4), b: g.int(1, 5), p: g.nonzero(-4, 4), q: g.nonzero(-4, 4), eta: g.pick([0.05, 0.1, 0.125, 0.2, 0.25]) }),
        ({ a, b, p, q, eta }) => a !== b && allDistinct([[p - 2 * a * eta * p, q - 2 * b * eta * q], [p + 2 * a * eta * p, q + 2 * b * eta * q], [p - a * eta * p, q - b * eta * q], [-2 * a * eta * p, -2 * b * eta * q]].map((v) => v.map(r6))),
      );
      const gr = [2 * a * p, 2 * b * q];
      const opt = (v: number[]) => ({ label: `$${vecTex(v)}$`, value: v.map(r6) });
      return {
        params: { a, b, p, q, eta },
        promptText: r`One gradient-descent step on $f(x, y) = ${coef(a)}x^2 + ${coef(b)}y^2$ from $(${p}, ${q})$ with $\eta = ${eta}$ lands where?`,
        options: [
          { id: 'a', ...opt([p - eta * gr[0], q - eta * gr[1]]) },
          { id: 'b', ...opt([p + eta * gr[0], q + eta * gr[1]]), trapExplanation: r`Descent subtracts the gradient; adding it climbs.` },
          { id: 'c', ...opt([p - eta * a * p, q - eta * b * q]), trapExplanation: r`$\frac{\partial}{\partial x}${coef(a)}x^2 = ${2 * a}x$: the factor 2 from differentiating is missing.` },
          { id: 'd', ...opt([-eta * gr[0], -eta * gr[1]]), trapExplanation: r`That is only the step $-\eta\nabla f$; add it to the current point.` },
        ],
        stepByStepSolution: [
          r`$\nabla f = (${2 * a}x, ${2 * b}y) = (${gr[0]}, ${gr[1]})$ at $(${p}, ${q})$.`,
          r`$\eta\nabla f = ${vecTex([eta * gr[0], eta * gr[1]])}$.`,
          r`New point: $(${p}, ${q}) - ${vecTex([eta * gr[0], eta * gr[1]])} = ${vecTex([p - eta * gr[0], q - eta * gr[1]])}$.`,
        ],
      };
    },
  },
  {
    id: 'op-02-3',
    difficulty: 2,
    keyConceptTag: 'The largest stable learning rate',
    correctOptionId: 'a',
    generate: (g) => {
      const c = g.pick([2, 3, 4, 5, 8, 10, 20, 25]);
      const b = g.nonzero(-9, 9);
      return {
        params: { c, b },
        promptText: r`For $f(x) = ${c}x^2 ${b < 0 ? '-' : '+'} ${Math.abs(b)}x$, what is the largest learning rate for which gradient descent converges (from any start)?`,
        options: [
          { id: 'a', label: `$${frac(1, c)}$`, value: 1 / c },
          { id: 'b', label: `$${frac(2, c)}$`, value: 2 / c, trapExplanation: r`The limit is $\frac{2}{f''}$, and $f'' = ${2 * c}$, not ${c}.` },
          { id: 'c', label: `$${frac(1, 2 * c)}$`, value: 1 / (2 * c), trapExplanation: r`$\frac{1}{f''}$ is the best step (one-step convergence), not the largest stable one.` },
          { id: 'd', label: `$${2 * c}$`, value: 2 * c, trapExplanation: r`Steeper functions need <i>smaller</i> steps: the limit is $\frac{2}{f''}$, not $f''$.` },
        ],
        stepByStepSolution: [
          r`$f''(x) = ${2 * c}$. The linear term shifts the minimum but not the curvature.`,
          r`The distance to the minimum is multiplied by $1 - ${2 * c}\eta$ each step; convergence needs $|1 - ${2 * c}\eta| < 1$.`,
          r`So $\eta < \frac{2}{${2 * c}} = ${frac(1, c)}$.`,
        ],
      };
    },
  },
  {
    id: 'op-02-4',
    difficulty: 2,
    keyConceptTag: 'Iterating gradient descent',
    correctOptionId: 'a',
    generate: (g) => {
      const { st, x0 } = g.until(
        () => ({ st: g.pick(STEPS), x0: g.pick([10, 20, 25, 40, 50, 100, -20, -50]) }),
        ({ st: [c, eta], x0 }) => {
          const rr = 1 - 2 * c * eta;
          return allDistinct([rr ** 3 * x0, (1 - c * eta) ** 3 * x0, rr * x0, x0 - 3 * eta * 2 * c * x0].map(r6));
        },
      );
      const [c, eta] = st;
      const rr = r6(1 - 2 * c * eta);
      const v = (x: number) => ({ label: `$${dec(r6(x))}$`, value: r6(x) });
      return {
        params: { c, eta, x0 },
        promptText: r`Gradient descent on $f(x) = ${coef(c)}x^2$ with $\eta = ${eta}$ starts at $x_0 = ${x0}$. What is $x_3$, after three steps?`,
        options: [
          { id: 'a', ...v(rr ** 3 * x0) },
          { id: 'b', ...v((1 - c * eta) ** 3 * x0), trapExplanation: r`$f'(x) = ${2 * c}x$, so each step multiplies by $1 - ${2 * c}\eta$, not $1 - ${c}\eta$.` },
          { id: 'c', ...v(rr * x0), trapExplanation: r`That is $x_1$; the factor is applied three times.` },
          { id: 'd', ...v(x0 - 3 * eta * 2 * c * x0), trapExplanation: r`The gradient changes as $x$ moves; reusing $f'(x_0)$ for all three steps is wrong.` },
        ],
        stepByStepSolution: [
          r`$x_{k+1} = x_k - ${eta}\cdot${2 * c}x_k = ${dec(rr)}\,x_k$.`,
          r`So $x_3 = ${paren(rr)}^3\cdot${paren(x0)}$.`,
          r`$x_3 = ${dec(r6(rr ** 3 * x0))}$.`,
        ],
      };
    },
  },
  {
    id: 'op-02-5',
    difficulty: 3,
    keyConceptTag: 'Condition number and speed',
    correctOptionId: 'a',
    generate: (g) => {
      const [l1, l2] = g.pick([[1, 3], [1, 9], [2, 6], [1, 4], [2, 8], [1, 19], [3, 5], [1, 99], [2, 18]]);
      const K = (num: number, den: number) => ({ label: `$${frac(num, den)}$`, value: num / den });
      return {
        params: { l1, l2 },
        promptText: r`Gradient descent on $f(x, y) = \tfrac12(${coef(l1)}x^2 + ${l2}y^2)$ uses the step $\eta = \frac{2}{\lambda_{\min} + \lambda_{\max}}$. By what factor does the distance to the minimum shrink per step in the worst direction?`,
        options: [
          { id: 'a', ...K(l2 - l1, l2 + l1) },
          { id: 'b', ...K(l1, l2), trapExplanation: r`$\frac{\lambda_{\min}}{\lambda_{\max}} = \frac1\kappa$ is not a per-step factor. Compute $|1 - \eta\lambda|$ for both eigenvalues.` },
          { id: 'c', ...K(l2 - l1, l2), trapExplanation: r`That is $1 - \frac{\lambda_{\min}}{\lambda_{\max}}$, the factor for the smaller step $\eta = \frac{1}{\lambda_{\max}}$.` },
          { id: 'd', ...K((l2 - l1) ** 2, (l2 + l1) ** 2), trapExplanation: r`The squared factor describes how $f - f^*$ shrinks, not the distance.` },
        ],
        stepByStepSolution: [
          r`$\eta = \frac{2}{${l1} + ${l2}} = ${frac(2, l1 + l2)}$. Each direction is multiplied by $1 - \eta\lambda_i$.`,
          r`$1 - ${frac(2, l1 + l2)}\cdot${l1} = ${frac(l2 - l1, l1 + l2)}$ and $1 - ${frac(2, l1 + l2)}\cdot${l2} = ${frac(l1 - l2, l1 + l2)}$: equal size, opposite signs.`,
          r`Factor $\frac{\kappa - 1}{\kappa + 1} = ${frac(l2 - l1, l2 + l1)}$ with $\kappa = ${frac(l2, l1)}$: the larger $\kappa$, the closer to 1 and the slower.`,
        ],
      };
    },
  },
  {
    id: 'op-02-6',
    difficulty: 3,
    keyConceptTag: 'Gradient descent for least squares',
    correctOptionId: 'a',
    generate: (g) => {
      const { xs, ys, w0, eta } = g.until(
        () => ({ xs: [g.int(1, 3), g.int(1, 3), g.int(-2, 3)], ys: [g.int(-4, 8), g.int(-4, 8), g.int(-4, 8)], w0: g.int(-2, 3), eta: g.pick([0.01, 0.02, 0.05]) }),
        ({ xs, ys, w0, eta }) => {
          const G = 2 * xs.reduce((s, x, i) => s + x * (w0 * x - ys[i]), 0);
          return G !== 0 && allDistinct([w0 - eta * G, w0 + eta * G, w0 - (eta * G) / 2, w0 - G].map(r6));
        },
      );
      const res = xs.map((x, i) => w0 * x - ys[i]);
      const G = 2 * xs.reduce((s, x, i) => s + x * res[i], 0);
      const pts = xs.map((x, i) => `(${x}, ${ys[i]})`).join(',\\ ');
      return {
        params: { xs, ys, w0, eta },
        promptText: r`Fit $y \approx wx$ to the points $${pts}$ by minimising $L(w) = \sum_i (wx_i - y_i)^2$. One gradient step from $w_0 = ${w0}$ with $\eta = ${eta}$ gives which $w_1$?`,
        options: [
          { id: 'a', label: `$${dec(r6(w0 - eta * G))}$`, value: r6(w0 - eta * G) },
          { id: 'b', label: `$${dec(r6(w0 + eta * G))}$`, value: r6(w0 + eta * G), trapExplanation: r`The sign is reversed: step against $L'(w_0) = ${G}$.` },
          { id: 'c', label: `$${dec(r6(w0 - (eta * G) / 2))}$`, value: r6(w0 - (eta * G) / 2), trapExplanation: r`Differentiating the square gives a factor 2: $L'(w) = 2\sum x_i(wx_i - y_i)$.` },
          { id: 'd', label: `$${dec(w0 - G)}$`, value: w0 - G, trapExplanation: r`The gradient is scaled by $\eta = ${eta}$ before stepping.` },
        ],
        stepByStepSolution: [
          r`Residuals $w_0x_i - y_i$: $${res.join(',\ ')}$.`,
          r`$L'(w_0) = 2\sum x_i(w_0x_i - y_i) = 2\cdot(${xs.map((x, i) => r`${paren(x)}\cdot${paren(res[i])}`).join(' + ')}) = ${G}$.`,
          r`$w_1 = ${w0} - ${eta}\cdot${paren(G)} = ${dec(r6(w0 - eta * G))}$.`,
        ],
      };
    },
  },
];
