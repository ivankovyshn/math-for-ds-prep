import { defineLesson, r } from '../define.ts';
import { extra } from './06-chain-rule.extra.ts';
import { practice } from './06-chain-rule.practice.ts';

export default defineLesson({
  id: 'ca-06',
  moduleId: 'calculus',
  title: 'The multivariable chain rule',
  blurb: 'How changes flow through a composition — the idea behind backpropagation',
  minutes: 8,
  deeper: [
    { title: 'Backpropagation calculus', url: 'https://www.3blue1brown.com/lessons/backpropagation-calculus', source: '3Blue1Brown · animated video lesson' },
    { title: 'Chain rule in several variables', url: 'https://tutorial.math.lamar.edu/Classes/CalcIII/ChainRule.aspx', source: "Paul's Online Math Notes (Lamar University) · notes with many worked examples" },
  ],
  lecture: [
    {
      title: 'One variable, revisited',
      covers: ['2', 'x1', 'x4'],
      blocks: [
        {
          kind: 'text',
          text: r`If $y = g(x)$ and $z = f(y)$, a small change in $x$ is multiplied by $g'(x)$ on its way to $y$, then by $f'(y)$ on its way to $z$. In Leibniz notation the rates simply chain:`,
        },
        { kind: 'formula', tex: r`\frac{dz}{dx} = \frac{dz}{dy}\cdot\frac{dy}{dx} = f'(g(x))\,g'(x)` },
        {
          kind: 'box',
          variant: 'pitfall',
          title: 'Evaluate at the right point',
          text: r`$f'$ is evaluated at $g(x)$, the point where $f$ is actually applied — not at $x$. If $g(2) = 5$, the chain rule at $x = 2$ needs $f'(5)$.`,
        },
        {
          kind: 'example',
          title: 'Evaluate at the inside value',
          prompt: r`$g(1) = 2$, $g'(1) = 3$, $f'(1) = 7$ and $f'(2) = 5$. Find $(f\circ g)'(1)$.`,
          steps: [
            r`Chain rule: $(f\circ g)'(1) = f'(g(1))\cdot g'(1)$.`,
            r`The outer derivative is taken at the inside value $g(1) = 2$, not at 1: $f'(2) = 5$.`,
            r`$(f\circ g)'(1) = 5\cdot 3 = 15$. Using $f'(1) = 7$ would give 21 — the classic slip.`,
          ],
        },
      ],
    },
    {
      title: 'Several paths',
      covers: ['1', '4', 'x2', 'x5'],
      blocks: [
        {
          kind: 'text',
          text: r`Now let $z = f(x, y)$ where both $x$ and $y$ depend on $t$. A change in $t$ reaches $z$ along two paths, and the contributions add up:`,
        },
        { kind: 'formula', tex: r`\frac{dz}{dt} = \frac{\partial f}{\partial x}\frac{dx}{dt} + \frac{\partial f}{\partial y}\frac{dy}{dt}` },
        {
          kind: 'example',
          title: 'Two paths',
          prompt: r`$z = xy$ with $x = t^2$ and $y = 3t$. Find $\frac{dz}{dt}$.`,
          steps: [
            r`$\frac{\partial z}{\partial x} = y$, $\frac{dx}{dt} = 2t$; $\frac{\partial z}{\partial y} = x$, $\frac{dy}{dt} = 3$.`,
            r`$\frac{dz}{dt} = y\cdot2t + x\cdot3 = 3t\cdot2t + t^2\cdot3 = 9t^2$.`,
            r`Check directly: $z = t^2\cdot3t = 3t^3$, and $(3t^3)' = 9t^2$. ✓`,
          ],
        },
        {
          kind: 'quiz',
          id: 'ca-06-q1',
          prompt: r`Same $z = xy$, $x = t^2$, $y = 3t$. What is $\frac{dz}{dt}$ at $t = 1$?`,
          options: [
            { id: 'a', label: '$9$', value: 9 },
            { id: 'b', label: '$6$', value: 6, trapExplanation: r`That is only the path through $x$: $y\cdot\frac{dx}{dt} = 3\cdot2$. Add the path through $y$.` },
            { id: 'c', label: '$3$', value: 3, trapExplanation: r`That is only the path through $y$: $x\cdot\frac{dy}{dt} = 1\cdot3$.` },
          ],
          correctOptionId: 'a',
          explanation: r`$y\cdot2t + x\cdot3 = 3\cdot2 + 1\cdot3 = 9$.`,
        },
      ],
    },
    {
      title: 'Computational graphs',
      covers: ['3'],
      blocks: [
        {
          kind: 'text',
          text: r`Break a formula into elementary steps — a <i>computational graph</i>. Each node knows only its own local derivative. The derivative of the output with respect to any input is the product of the local derivatives along each path, summed over all paths.`,
        },
        { kind: 'diagram', type: 'compGraph', caption: r`$L = (wx + b)^2$ as a graph. Forward: compute $u = wx + b$, then $L = u^2$. Backward: $\frac{\partial L}{\partial u} = 2u$, then multiply by the local derivatives $\frac{\partial u}{\partial w} = x$ and $\frac{\partial u}{\partial b} = 1$.` },
        {
          kind: 'example',
          title: 'Forward, then backward',
          prompt: r`$L = (wx + b)^2$ with $w = 2$, $x = 3$, $b = 1$. Find $\frac{\partial L}{\partial w}$.`,
          steps: [
            r`Forward: $u = 2\cdot3 + 1 = 7$, $L = 49$.`,
            r`Backward: $\frac{\partial L}{\partial u} = 2u = 14$.`,
            r`$\frac{\partial L}{\partial w} = \frac{\partial L}{\partial u}\cdot\frac{\partial u}{\partial w} = 14\cdot x = 42$.`,
          ],
        },
        {
          kind: 'quiz',
          id: 'ca-06-q2',
          prompt: r`In the same graph, what is $\frac{\partial L}{\partial b}$?`,
          options: [
            { id: 'a', label: '$14$', value: 14 },
            { id: 'b', label: '$42$', value: 42, trapExplanation: r`That is $\frac{\partial L}{\partial w}$, which picks up the factor $x = 3$. For $b$ the local derivative is $\frac{\partial u}{\partial b} = 1$.` },
            { id: 'c', label: '$49$', value: 49, trapExplanation: r`49 is the value of $L$, computed in the forward pass.` },
          ],
          correctOptionId: 'a',
          explanation: r`$\frac{\partial L}{\partial b} = 2u\cdot1 = 14$.`,
        },
      ],
    },
    {
      title: 'Backpropagation',
      covers: ['5', '6', 'x3', 'x6'],
      blocks: [
        {
          kind: 'text',
          text: r`A neural network is one big computational graph from weights to loss. <i>Backpropagation</i> runs the chain rule from the loss backwards: each node receives $\frac{\partial L}{\partial(\text{its output})}$, multiplies by its local derivatives and passes the result to its inputs. One backward pass, costing about as much as the forward pass, gives the derivative with respect to every weight.`,
        },
        {
          kind: 'example',
          title: 'A one-weight model',
          prompt: r`Prediction $\hat y = wx$, loss $L = \frac12(\hat y - y)^2$. Find $\frac{\partial L}{\partial w}$.`,
          steps: [
            r`$\frac{\partial L}{\partial\hat y} = \hat y - y$ (the $\frac12$ cancels the 2).`,
            r`$\frac{\partial\hat y}{\partial w} = x$.`,
            r`$\frac{\partial L}{\partial w} = (\hat y - y)\,x$: the error times the input — the update rule of linear regression.`,
          ],
        },
        {
          kind: 'example',
          title: 'The gradient of the logistic loss',
          prompt: r`Logistic regression: $\hat p = \sigma(z)$ with $z = wx$, and $L = -\big[y\ln\hat p + (1 - y)\ln(1 - \hat p)\big]$. Show that $\frac{\partial L}{\partial w} = (\hat p - y)\,x$.`,
          steps: [
            r`Chain: $\frac{\partial L}{\partial w} = \frac{\partial L}{\partial\hat p}\cdot\frac{d\hat p}{dz}\cdot\frac{\partial z}{\partial w}$.`,
            r`$\frac{\partial L}{\partial\hat p} = -\frac{y}{\hat p} + \frac{1 - y}{1 - \hat p}$; $\frac{d\hat p}{dz} = \hat p(1 - \hat p)$ (the sigmoid derivative); $\frac{\partial z}{\partial w} = x$.`,
            r`Multiply the first two: $-y(1 - \hat p) + (1 - y)\hat p = -y + y\hat p + \hat p - y\hat p = \hat p - y$.`,
            r`So $\frac{\partial L}{\partial w} = (\hat p - y)\,x$: prediction minus target, times the input. With $x = 2$, $y = 1$, $\hat p = 0.7$: $(0.7 - 1)\cdot 2 = -0.6$.`,
          ],
        },
        {
          kind: 'quiz',
          id: 'ca-06-q3',
          prompt: r`With $w = 2$, $x = 3$, $y = 4$: what is $\frac{\partial L}{\partial w}$ for $L = \frac12(wx - y)^2$?`,
          options: [
            { id: 'a', label: '$6$', value: 6 },
            { id: 'b', label: '$2$', value: 2, trapExplanation: r`$\hat y - y = 2$ is $\frac{\partial L}{\partial\hat y}$; multiply by $\frac{\partial\hat y}{\partial w} = x = 3$.` },
            { id: 'c', label: '$12$', value: 12, trapExplanation: r`The $\frac12$ in the loss cancels the 2 from the square: $(\hat y - y)x$, not $2(\hat y - y)x$.` },
          ],
          correctOptionId: 'a',
          explanation: r`$\hat y = 6$, so $\frac{\partial L}{\partial w} = (6 - 4)\cdot3 = 6$.`,
        },
        {
          kind: 'box',
          variant: 'tip',
          title: 'Gates',
          text: r`A ReLU passes the incoming derivative unchanged where its input was positive and blocks it (multiplies by 0) where it was negative. Weights behind a "dead" ReLU get no gradient from that example.`,
        },
      ],
    },
    {
      title: 'Summary',
      blocks: [
        {
          kind: 'text',
          text: r`• One variable: $\frac{dz}{dx} = f'(g(x))\,g'(x)$ — evaluate $f'$ at $g(x)$.

• Several paths: $\frac{dz}{dt} = \sum_i \frac{\partial f}{\partial x_i}\frac{dx_i}{dt}$.

• Computational graph: multiply local derivatives along a path, add over paths.

• Backpropagation: one backward pass gives the gradient for all weights.

• $L = \frac12(\hat y - y)^2$, $\hat y = wx$: $\frac{\partial L}{\partial w} = (\hat y - y)x$.`,
        },
      ],
    },
  ],
  extra,
  questions: practice,
});
