import type { QuestionTemplate } from '../../../types.ts';
import { r } from '../define.ts';
import { allDistinct, coef, dec, frac, shuffle } from '../gen.ts';
import { STEPS, vecTex } from './02-gradient-descent.practice.ts';

const r6 = (x: number) => Math.round(x * 1e6) / 1e6;
/** 0 steady convergence, 1 overshooting convergence, 2 divergence, 3 no movement. */
const BEHAVIOUR = ['It converges steadily, staying on one side of the minimum', 'It converges, jumping across the minimum every step', 'It diverges: the steps overshoot more and more', 'It does not move'];
const behaviourOf = (factor: number) => (factor > 0 && factor < 1 ? 0 : factor < 0 && factor > -1 ? 1 : factor === 1 ? 3 : 2);

/** Extra practice (Practice 2): gentler questions on the same ideas, with new numbers every time. */
export const extra: QuestionTemplate[] = [
  {
    id: 'op-02-x1',
    difficulty: 1,
    keyConceptTag: 'One gradient step',
    correctOptionId: 'a',
    generate: (g) => {
      const { x0, eta } = g.until(() => ({ x0: g.nonzero(-10, 10), eta: g.pick([0.1, 0.2, 0.25, 0.3, 0.4]) }), ({ x0, eta }) => allDistinct([x0 * (1 - 2 * eta), x0 * (1 + 2 * eta), x0 * (1 - eta), x0 - eta].map(r6)));
      return {
        params: { x0, eta },
        promptText: r`Gradient descent on $f(x) = x^2$ with $\eta = ${eta}$ is at $x = ${x0}$. Where is it after one step?`,
        options: [
          { id: 'a', label: `$${dec(r6(x0 * (1 - 2 * eta)))}$`, value: r6(x0 * (1 - 2 * eta)) },
          { id: 'b', label: `$${dec(r6(x0 * (1 + 2 * eta)))}$`, value: r6(x0 * (1 + 2 * eta)), trapExplanation: r`That adds the gradient; gradient descent subtracts it.` },
          { id: 'c', label: `$${dec(r6(x0 * (1 - eta)))}$`, value: r6(x0 * (1 - eta)), trapExplanation: r`$f'(x) = 2x$, so the step is $\eta\cdot2x$.` },
          { id: 'd', label: `$${dec(r6(x0 - eta))}$`, value: r6(x0 - eta), trapExplanation: r`The step is $\eta$ times the gradient $2x = ${2 * x0}$, not $\eta$ alone.` },
        ],
        stepByStepSolution: [
          r`$f'(${x0}) = ${2 * x0}$.`,
          r`$x_1 = ${x0} - ${eta}\cdot${2 * x0 < 0 ? `(${2 * x0})` : 2 * x0}$.`,
          r`$x_1 = ${dec(r6(x0 * (1 - 2 * eta)))}$.`,
        ],
      };
    },
  },
  {
    id: 'op-02-x2',
    difficulty: 1,
    keyConceptTag: 'The gradient',
    correctOptionId: 'a',
    generate: (g) => {
      const { a, b, p, q } = g.until(
        () => ({ a: g.int(1, 5), b: g.int(1, 5), p: g.nonzero(-4, 4), q: g.nonzero(-4, 4) }),
        ({ a, b, p, q }) => allDistinct([[2 * a * p, 2 * b * q], [a * p, b * q], [-2 * a * p, -2 * b * q], [2 * a, 2 * b]]),
      );
      const v = (x: number[]) => ({ label: `$${vecTex(x)}$`, value: x });
      return {
        params: { a, b, p, q },
        promptText: r`What is $\nabla f$ at $(${p}, ${q})$ for $f(x, y) = ${coef(a)}x^2 + ${coef(b)}y^2$?`,
        options: [
          { id: 'a', ...v([2 * a * p, 2 * b * q]) },
          { id: 'b', ...v([a * p, b * q]), trapExplanation: r`The derivative of $x^2$ is $2x$; the factor 2 is missing.` },
          { id: 'c', ...v([-2 * a * p, -2 * b * q]), trapExplanation: r`That is $-\nabla f$, the direction gradient descent moves in.` },
          { id: 'd', ...v([2 * a, 2 * b]), trapExplanation: r`Those are the second derivatives; the gradient depends on the point.` },
        ],
        stepByStepSolution: [
          r`$\frac{\partial f}{\partial x} = ${2 * a}x$ and $\frac{\partial f}{\partial y} = ${2 * b}y$.`,
          r`At $(${p}, ${q})$: $${2 * a}\cdot${p < 0 ? `(${p})` : p}$ and $${2 * b}\cdot${q < 0 ? `(${q})` : q}$.`,
          r`$\nabla f = ${vecTex([2 * a * p, 2 * b * q])}$.`,
        ],
      };
    },
  },
  {
    id: 'op-02-x3',
    difficulty: 1,
    keyConceptTag: 'Learning rate too small or too large',
    correctOptionId: 'a',
    generate: (g) => {
      const c = g.pick([1, 2, 5]);
      const factor = g.pick([0.6, 0.5, 0.2, -0.2, -0.5, -0.6, -1.4, -2]);
      const eta = r6((1 - factor) / (2 * c));
      const k = behaviourOf(r6(1 - 2 * c * eta));
      const order = [k, ...shuffle(g, [0, 1, 2, 3].filter((x) => x !== k))];
      return {
        params: { c, eta, order },
        promptText: r`Gradient descent runs on $f(x) = ${coef(c)}x^2$ with learning rate $\eta = ${dec(eta)}$, starting at $x_0 = 1$. What happens?`,
        options: order.map((b, i) => ({
          id: 'abcd'[i],
          label: BEHAVIOUR[b],
          ...(i === 0 ? {} : { trapExplanation: r`Each step multiplies $x$ by $1 - ${2 * c}\cdot${dec(eta)} = ${dec(factor)}$; that factor decides the behaviour.` }),
        })),
        stepByStepSolution: [
          r`$x_{k+1} = x_k - \eta\cdot${2 * c}x_k = (1 - ${2 * c}\eta)\,x_k$.`,
          r`$1 - ${2 * c}\cdot${dec(eta)} = ${dec(factor)}$.`,
          r`${k === 0 ? 'Between 0 and 1: $x$ shrinks without changing sign.' : k === 1 ? 'Between $-1$ and 0: the sign flips each step while the size shrinks.' : 'Below $-1$: the size grows every step.'}`,
        ],
      };
    },
  },
  {
    id: 'op-02-x4',
    difficulty: 2,
    keyConceptTag: 'Learning rate in many directions',
    correctOptionId: 'a',
    generate: (g) => {
      const { l1, l2 } = g.until(() => ({ l1: g.int(1, 5), l2: g.pick([8, 10, 20, 25, 40, 50, 100]) }), ({ l1, l2 }) => allDistinct([2 / l2, 2 / l1, 1 / l2, 2 / (l1 + l2)]));
      return {
        params: { l1, l2 },
        promptText: r`The Hessian of a quadratic loss has eigenvalues ${l1} and ${l2}. What is the largest learning rate for which gradient descent converges?`,
        options: [
          { id: 'a', label: `$${frac(2, l2)}$`, value: 2 / l2 },
          { id: 'b', label: `$${frac(2, l1)}$`, value: 2 / l1, trapExplanation: r`With that step the steep direction (eigenvalue ${l2}) diverges.` },
          { id: 'c', label: `$${frac(1, l2)}$`, value: 1 / l2, trapExplanation: r`That is safe, but the limit is twice as large: $\frac{2}{\lambda_{\max}}$.` },
          { id: 'd', label: `$${frac(2, l1 + l2)}$`, value: 2 / (l1 + l2), trapExplanation: r`That is the step that balances the two directions, not the stability limit.` },
        ],
        stepByStepSolution: [
          r`Along each eigenvector the error is multiplied by $1 - \eta\lambda_i$.`,
          r`Both factors need $|1 - \eta\lambda_i| < 1$, i.e. $\eta < \frac{2}{\lambda_i}$.`,
          r`The tighter limit comes from $\lambda_{\max} = ${l2}$: $\eta < ${frac(2, l2)}$.`,
        ],
      };
    },
  },
  {
    id: 'op-02-x5',
    difficulty: 2,
    keyConceptTag: 'The condition number',
    correctOptionId: 'a',
    generate: (g) => {
      const { a, b } = g.until(() => ({ a: g.int(1, 6), b: g.int(1, 60) }), ({ a, b }) => a !== b && allDistinct([Math.max(a, b) / Math.min(a, b), Math.min(a, b) / Math.max(a, b), Math.abs(a - b), a * b]));
      const [lo, hi] = [Math.min(a, b), Math.max(a, b)];
      return {
        params: { a, b },
        promptText: r`What is the condition number $\kappa = \frac{\lambda_{\max}}{\lambda_{\min}}$ of the Hessian of $f(x, y) = ${coef(a)}x^2 + ${coef(b)}y^2$?`,
        options: [
          { id: 'a', label: `$${frac(hi, lo)}$`, value: hi / lo },
          { id: 'b', label: `$${frac(lo, hi)}$`, value: lo / hi, trapExplanation: r`The condition number puts the largest eigenvalue on top, so $\kappa \ge 1$.` },
          { id: 'c', label: `$${hi - lo}$`, value: hi - lo, trapExplanation: r`$\kappa$ is a ratio, not a difference.` },
          { id: 'd', label: `$${a * b}$`, value: a * b, trapExplanation: r`$\kappa$ compares the eigenvalues by dividing them.` },
        ],
        stepByStepSolution: [
          r`$H = \operatorname{diag}(${2 * a}, ${2 * b})$, so the eigenvalues are ${2 * a} and ${2 * b}.`,
          r`$\kappa = \frac{${2 * hi}}{${2 * lo}}$; the factor 2 cancels.`,
          r`$\kappa = ${frac(hi, lo)}$.${hi / lo >= 10 ? ' A long, narrow valley: gradient descent will be slow.' : ''}`,
        ],
      };
    },
  },
  {
    id: 'op-02-x6',
    difficulty: 2,
    keyConceptTag: 'How many steps',
    correctOptionId: 'a',
    generate: (g) => {
      const { st, x0 } = g.until(() => ({ st: g.pick(STEPS), x0: g.pick([10, 20, 30, 50, 80, 100, 200]) }), ({ st: [c, eta], x0 }) => {
        const f = 1 - 2 * c * eta;
        return Math.abs(f) <= 0.6 && Math.abs(f) > 0;
      });
      const [c, eta] = st;
      const f = r6(1 - 2 * c * eta);
      let n = 0;
      for (let x = x0; Math.abs(x) >= 1; x *= f) n++;
      return {
        params: { c, eta, x0 },
        promptText: r`Gradient descent on $f(x) = ${coef(c)}x^2$ with $\eta = ${eta}$ starts at $x_0 = ${x0}$. After how many steps is $|x_k| < 1$ for the first time?`,
        options: [
          { id: 'a', label: `$${n}$`, value: n },
          { id: 'b', label: `$${n - 1}$`, value: n - 1, trapExplanation: r`After ${n - 1} steps $|x| = ${x0}\cdot${dec(Math.abs(f))}^{${n - 1}} \ge 1$ still.` },
          { id: 'c', label: `$${n + 1}$`, value: n + 1, trapExplanation: r`Already after ${n} steps $|x| < 1$.` },
          { id: 'd', label: `$${2 * n + 2}$`, value: 2 * n + 2, trapExplanation: r`Each step multiplies $|x|$ by $${dec(Math.abs(f))}$; count how many factors bring ${x0} below 1.` },
        ],
        stepByStepSolution: [
          r`Each step: $x_{k+1} = (1 - ${2 * c}\cdot${eta})\,x_k = ${dec(f)}\,x_k$.`,
          r`$|x_k| = ${x0}\cdot${dec(Math.abs(f))}^k$.`,
          r`The first $k$ with $${x0}\cdot${dec(Math.abs(f))}^k < 1$ is $k = ${n}$.`,
        ],
      };
    },
  },
];
