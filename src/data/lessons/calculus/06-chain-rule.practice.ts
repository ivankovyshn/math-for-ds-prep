import type { QuestionTemplate } from '../../../types.ts';
import { r } from '../define.ts';
import { allDistinct, frac, paren, poly } from '../gen.ts';

const PROBS = [[1, 4], [3, 4], [1, 5], [4, 5], [1, 3], [2, 3], [2, 5], [3, 5], [1, 10], [9, 10]];

export const practice: QuestionTemplate[] = [
  {
    id: 'ca-06-1',
    difficulty: 1,
    keyConceptTag: 'Chain rule with two paths',
    correctOptionId: 'a',
    generate: (g) => {
      const { a, b, c, t } = g.until(
        () => ({ a: g.nonzero(-3, 4), b: g.nonzero(-3, 4), c: g.int(-4, 4), t: g.nonzero(-2, 3) }),
        ({ a, b, c, t }) => {
          const [x, y] = [a * t, b * t + c];
          return allDistinct([y * a + x * b, a * b, y * a, a + b]);
        },
      );
      const [x, y] = [a * t, b * t + c];
      return {
        params: { a, b, c, t },
        promptText: r`$z = xy$ with $x = ${poly([0, a], 't')}$ and $y = ${poly([c, b], 't')}$. What is $\dfrac{dz}{dt}$ at $t = ${t}$?`,
        options: [
          { id: 'a', label: `$${y * a + x * b}$`, value: y * a + x * b },
          { id: 'b', label: `$${a * b}$`, value: a * b, trapExplanation: r`Multiplying $\frac{dx}{dt}\cdot\frac{dy}{dt}$ is not the chain rule. Each path is (partial derivative) × (rate of its variable).` },
          { id: 'c', label: `$${y * a}$`, value: y * a, trapExplanation: r`That is only the path through $x$. Add $\frac{\partial z}{\partial y}\frac{dy}{dt} = x\cdot${paren(b)} = ${x * b}$.` },
          { id: 'd', label: `$${a + b}$`, value: a + b, trapExplanation: r`That would be the rate of $x + y$. For $z = xy$ each rate is weighted by the other factor.` },
        ],
        stepByStepSolution: [
          r`At $t = ${t}$: $x = ${x}$, $y = ${y}$; $\frac{dx}{dt} = ${a}$, $\frac{dy}{dt} = ${b}$.`,
          r`$\frac{dz}{dt} = \frac{\partial z}{\partial x}\frac{dx}{dt} + \frac{\partial z}{\partial y}\frac{dy}{dt} = y\cdot${paren(a)} + x\cdot${paren(b)}$.`,
          r`$= ${y}\cdot${paren(a)} + ${paren(x)}\cdot${paren(b)} = ${y * a + x * b}$.`,
        ],
      };
    },
  },
  {
    id: 'ca-06-2',
    difficulty: 1,
    keyConceptTag: 'Where to evaluate f′',
    correctOptionId: 'a',
    generate: (g) => {
      const { x0, g0, g1, A, B } = g.until(
        () => ({ x0: g.int(-3, 3), g0: g.int(-3, 5), g1: g.nonzero(-4, 4), A: g.nonzero(-5, 5), B: g.nonzero(-5, 5) }),
        ({ x0, g0, g1, A, B }) => x0 !== g0 && allDistinct([A * g1, B * g1, A + g1, A * g0]),
      );
      return {
        params: { x0, g0, g1, A, B },
        promptText: r`$g(${x0}) = ${g0}$, $g'(${x0}) = ${g1}$, $f'(${g0}) = ${A}$ and $f'(${x0}) = ${B}$. What is $(f\circ g)'(${x0})$?`,
        options: [
          { id: 'a', label: `$${A * g1}$`, value: A * g1 },
          { id: 'b', label: `$${B * g1}$`, value: B * g1, trapExplanation: r`$f$ is applied at $g(${x0}) = ${g0}$, so use $f'(${g0})$, not $f'(${x0})$.` },
          { id: 'c', label: `$${A + g1}$`, value: A + g1, trapExplanation: r`Along one path the rates multiply; they add only across different paths.` },
          { id: 'd', label: `$${A * g0}$`, value: A * g0, trapExplanation: r`Multiply by the derivative $g'(${x0}) = ${g1}$, not by the value $g(${x0})$.` },
        ],
        stepByStepSolution: [
          r`$(f\circ g)'(x) = f'(g(x))\,g'(x)$.`,
          r`At $x = ${x0}$: $f'(g(${x0})) = f'(${g0}) = ${A}$ and $g'(${x0}) = ${g1}$.`,
          r`$(f\circ g)'(${x0}) = ${A}\cdot${paren(g1)} = ${A * g1}$.`,
        ],
      };
    },
  },
  {
    id: 'ca-06-3',
    difficulty: 2,
    keyConceptTag: 'Gradient through a computational graph',
    correctOptionId: 'a',
    generate: (g) => {
      const { w, x, b } = g.until(
        () => ({ w: g.nonzero(-3, 3), x: g.nonzero(-3, 4), b: g.int(-4, 4) }),
        ({ w, x, b }) => {
          const u = w * x + b;
          return u !== 0 && allDistinct([2 * u * x, 2 * u, u * u, 2 * u * w]);
        },
      );
      const u = w * x + b;
      return {
        params: { w, x, b },
        promptText: r`$L = (wx + b)^2$ with $w = ${w}$, $x = ${x}$, $b = ${b}$. What is $\dfrac{\partial L}{\partial w}$?`,
        options: [
          { id: 'a', label: `$${2 * u * x}$`, value: 2 * u * x },
          { id: 'b', label: `$${2 * u}$`, value: 2 * u, trapExplanation: r`That is $\frac{\partial L}{\partial u}$ (and also $\frac{\partial L}{\partial b}$). Multiply by $\frac{\partial u}{\partial w} = x = ${x}$.` },
          { id: 'c', label: `$${u * u}$`, value: u * u, trapExplanation: r`That is the loss itself from the forward pass.` },
          { id: 'd', label: `$${2 * u * w}$`, value: 2 * u * w, trapExplanation: r`That is $\frac{\partial L}{\partial x}$: the local derivative of $wx$ with respect to $w$ is $x$, not $w$.` },
        ],
        stepByStepSolution: [
          r`Forward: $u = ${w}\cdot${paren(x)} + ${paren(b)} = ${u}$, $L = u^2 = ${u * u}$.`,
          r`Backward: $\frac{\partial L}{\partial u} = 2u = ${2 * u}$, $\frac{\partial u}{\partial w} = x = ${x}$.`,
          r`$\frac{\partial L}{\partial w} = ${2 * u}\cdot${paren(x)} = ${2 * u * x}$.`,
        ],
      };
    },
  },
  {
    id: 'ca-06-4',
    difficulty: 2,
    keyConceptTag: 'Partial derivatives through a change of variables',
    correctOptionId: 'a',
    generate: (g) => {
      const { s, t } = g.until(
        () => ({ s: g.int(-3, 3), t: g.int(-3, 3) }),
        ({ s, t }) => {
          const [x, y] = [s + t, s - t];
          return x !== 0 && y !== 0 && allDistinct([2 * x * y - x * x, 2 * x * y + x * x, 2 * x * y, x * x * y]);
        },
      );
      const [x, y] = [s + t, s - t];
      return {
        params: { s, t },
        promptText: r`$z = x^2y$ with $x = s + t$ and $y = s - t$. What is $\dfrac{\partial z}{\partial t}$ at $(s, t) = (${s}, ${t})$?`,
        options: [
          { id: 'a', label: `$${2 * x * y - x * x}$`, value: 2 * x * y - x * x },
          { id: 'b', label: `$${2 * x * y + x * x}$`, value: 2 * x * y + x * x, trapExplanation: r`$\frac{\partial y}{\partial t} = -1$: the path through $y$ carries a minus sign.` },
          { id: 'c', label: `$${2 * x * y}$`, value: 2 * x * y, trapExplanation: r`That is only the path through $x$. $t$ also changes $y$.` },
          { id: 'd', label: `$${x * x * y}$`, value: x * x * y, trapExplanation: r`That is the value of $z$, not its rate of change.` },
        ],
        stepByStepSolution: [
          r`$\frac{\partial z}{\partial t} = \frac{\partial z}{\partial x}\frac{\partial x}{\partial t} + \frac{\partial z}{\partial y}\frac{\partial y}{\partial t} = 2xy\cdot1 + x^2\cdot(-1)$.`,
          r`At $(${s}, ${t})$: $x = ${x}$, $y = ${y}$.`,
          r`$2\cdot${paren(x)}\cdot${paren(y)} - ${paren(x)}^2 = ${2 * x * y} - ${x * x} = ${2 * x * y - x * x}$.`,
        ],
      };
    },
  },
  {
    id: 'ca-06-5',
    difficulty: 3,
    keyConceptTag: 'Backpropagation through a ReLU',
    correctOptionId: 'a',
    generate: (g) => {
      const { w1, w2, x, y } = g.until(
        () => ({ w1: g.nonzero(-3, 3), w2: g.nonzero(-3, 3), x: g.nonzero(-3, 3), y: g.int(-5, 5) }),
        ({ w1, w2, x, y }) => {
          const h = Math.max(0, w1 * x);
          const e = w2 * h - y;
          const on = w1 * x > 0;
          const opts = on ? [e * w2 * x, e * h, e * w2, e * x] : [0, e * w2 * x, e * w2, e * x];
          return e !== 0 && allDistinct(opts);
        },
      );
      const z = w1 * x;
      const h = Math.max(0, z);
      const out = w2 * h;
      const e = out - y;
      const on = z > 0;
      const opts = on
        ? [
            { v: e * w2 * x },
            { v: e * h, t: r`That is $\frac{\partial L}{\partial w_2} = (\text{out} - y)\,h$. For $w_1$ the path goes back through $w_2$ and the ReLU to $x$.` },
            { v: e * w2, t: r`One more local derivative: $\frac{\partial z}{\partial w_1} = x = ${x}$.` },
            { v: e * x, t: r`The path from the loss back to $w_1$ passes through the weight $w_2 = ${w2}$; multiply by it.` },
          ]
        : [
            { v: 0 },
            { v: e * w2 * x, t: r`$z = w_1x = ${z} < 0$, so the ReLU outputs 0 and its local derivative is 0: no gradient reaches $w_1$.` },
            { v: e * w2, t: r`The ReLU is closed ($z = ${z} < 0$): it multiplies the incoming derivative by 0.` },
            { v: e * x, t: r`Whatever the other factors, the ReLU's local derivative here is 0 because $z = ${z} < 0$.` },
          ];
      return {
        params: { w1, w2, x, y },
        promptText: r`A tiny network: $z = w_1x$, $h = \operatorname{ReLU}(z)$, $\text{out} = w_2h$, $L = \frac12(\text{out} - y)^2$. With $w_1 = ${w1}$, $w_2 = ${w2}$, $x = ${x}$, $y = ${y}$, what is $\dfrac{\partial L}{\partial w_1}$?`,
        options: opts.map((o, i) => ({ id: 'abcd'[i], label: `$${o.v}$`, value: o.v, ...(i ? { trapExplanation: o.t } : {}) })),
        stepByStepSolution: [
          r`Forward: $z = ${z}$, $h = ${h}$, $\text{out} = ${out}$, $L = \frac12(${out} - ${paren(y)})^2$.`,
          r`Backward: $\frac{\partial L}{\partial\text{out}} = ${e}$, $\frac{\partial\text{out}}{\partial h} = w_2 = ${w2}$, $\frac{\partial h}{\partial z} = ${on ? 1 : 0}$ (ReLU ${on ? 'open' : 'closed'}), $\frac{\partial z}{\partial w_1} = x = ${x}$.`,
          r`$\frac{\partial L}{\partial w_1} = ${e}\cdot${paren(w2)}\cdot${on ? 1 : 0}\cdot${paren(x)} = ${on ? e * w2 * x : 0}$.`,
        ],
      };
    },
  },
  {
    id: 'ca-06-6',
    difficulty: 3,
    keyConceptTag: 'Gradient of the logistic loss',
    correctOptionId: 'a',
    generate: (g) => {
      const { pn, pd, y, x } = g.until(
        () => {
          const [pn, pd] = g.pick(PROBS);
          return { pn, pd, y: g.int(0, 1), x: g.pick([-4, -3, -2, 2, 3, 4, 5]) };
        },
        ({ pn, pd, y, x }) => {
          const dn = pn - y * pd;
          return allDistinct([(dn * x) / pd, (-dn * x) / pd, (pn * (pd - pn) * x) / (pd * pd), dn / pd]);
        },
      );
      const dn = pn - y * pd;
      return {
        params: { pn, pd, y, x },
        promptText: r`Logistic regression: $\hat p = \sigma(wx)$ and $L = -\big[y\ln\hat p + (1 - y)\ln(1 - \hat p)\big]$. For one example with $x = ${x}$, $y = ${y}$ and $\hat p = ${frac(pn, pd)}$, what is $\dfrac{\partial L}{\partial w}$?`,
        options: [
          { id: 'a', label: `$${frac(dn * x, pd)}$`, value: (dn * x) / pd },
          { id: 'b', label: `$${frac(-dn * x, pd)}$`, value: (-dn * x) / pd, trapExplanation: r`Sign: the derivative is $(\hat p - y)x$. Minimising moves $w$ against it.` },
          { id: 'c', label: `$${frac(pn * (pd - pn) * x, pd * pd)}$`, value: (pn * (pd - pn) * x) / (pd * pd), trapExplanation: r`$\sigma'(z) = \hat p(1 - \hat p)$ is only one factor; it cancels against $\frac{\partial L}{\partial\hat p}$, leaving $\hat p - y$.` },
          { id: 'd', label: `$${frac(dn, pd)}$`, value: dn / pd, trapExplanation: r`That is $\frac{\partial L}{\partial z}$ with $z = wx$. One more factor: $\frac{\partial z}{\partial w} = x = ${x}$.` },
        ],
        stepByStepSolution: [
          r`$\frac{\partial L}{\partial\hat p} = -\frac{y}{\hat p} + \frac{1 - y}{1 - \hat p}$ and $\frac{\partial\hat p}{\partial z} = \hat p(1 - \hat p)$; their product simplifies to $\hat p - y$.`,
          r`$\frac{\partial z}{\partial w} = x$, so $\frac{\partial L}{\partial w} = (\hat p - y)\,x$.`,
          r`$(${frac(pn, pd)} - ${y})\cdot${paren(x)} = ${frac(dn * x, pd)}$.`,
        ],
      };
    },
  },
];
