import type { Question } from '../../types.ts';

const r = String.raw;
const E = Math.E;
const PI = Math.PI;

export const calculus: Question[] = [
  {
    id: 'cal-01',
    moduleId: 'calculus',
    difficulty: 1,
    promptText: r`Let $f(x) = x^3 - 2x$.

What is the slope of the tangent to the graph of $f$ at $x = 2$?`,
    options: [
      { id: 'a', label: r`$4$`, value: 4, trapExplanation: r`$4$ is $f(2)$ — the <i>height</i> of the graph at $x=2$, not its slope. Slope means derivative.` },
      { id: 'b', label: r`$6$`, value: 6, trapExplanation: r`The derivative of $x^3$ is $3x^2$, not $3x$. The exponent drops by one, it does not disappear.` },
      { id: 'c', label: r`$8$`, value: 8, trapExplanation: r`$8 = 2^3$ is just the first term of $f(2)$. Differentiate first, then substitute.` },
      { id: 'd', label: r`$10$`, value: 10 },
      { id: 'e', label: r`$12$`, value: 12, trapExplanation: r`You differentiated $x^3$ correctly but forgot the term $-2x$, whose derivative is $-2$.` },
    ],
    correctOptionId: 'd',
    stepByStepSolution: [
      r`The slope of the tangent at a point is the value of the derivative there.`,
      r`Power rule term by term: $f'(x) = 3x^2 - 2$.`,
      r`Substitute: $f'(2) = 3\cdot 4 - 2 = 10$.`,
    ],
    keyConceptTag: 'Derivative = slope of the tangent',
  },
  {
    id: 'cal-02',
    moduleId: 'calculus',
    difficulty: 1,
    promptText: r`Let $f(x) = e^{2x}$.

What is $f'(0)$?`,
    options: [
      { id: 'a', label: r`$0$`, value: 0, trapExplanation: r`You substituted first ($e^0 = 1$, a constant) and then differentiated. Always differentiate the function first, then plug in.` },
      { id: 'b', label: r`$1$`, value: 1, trapExplanation: r`The chain rule was forgotten: the inner function $2x$ contributes a factor $2$.` },
      { id: 'c', label: r`$2$`, value: 2 },
      { id: 'd', label: r`$e$`, value: E, trapExplanation: r`$e^{0} = 1$, not $e$. Anything to the power $0$ equals $1$.` },
      { id: 'e', label: r`$2e$`, value: 2 * E, trapExplanation: r`The factor $2$ is right, but $e^{2\cdot 0} = e^0 = 1$, not $e$.` },
    ],
    correctOptionId: 'c',
    stepByStepSolution: [
      r`$e^{2x}$ is a composition: outer $e^{u}$, inner $u = 2x$.`,
      r`Chain rule: $f'(x) = e^{2x}\cdot 2$.`,
      r`$f'(0) = 2\cdot e^0 = 2$. Intuition: $e^{2x}$ runs through the values of $e^x$ twice as fast, so it is twice as steep.`,
    ],
    keyConceptTag: 'Chain rule · exponential',
  },
  {
    id: 'cal-03',
    moduleId: 'calculus',
    difficulty: 1,
    promptText: r`Evaluate the definite integral.`,
    mathFormula: r`\int_0^2 3x^2\,\mathrm{d}x`,
    options: [
      { id: 'a', label: r`$4$`, value: 4, trapExplanation: r`$4 = 2^2$: the antiderivative of $3x^2$ is $x^3$, not $x^2$.` },
      { id: 'b', label: r`$6$`, value: 6, trapExplanation: r`You differentiated ($6x$) instead of integrating. Integration raises the power by one.` },
      { id: 'c', label: r`$8$`, value: 8 },
      { id: 'd', label: r`$12$`, value: 12, trapExplanation: r`$12$ is the value of the integrand at $x=2$. The integral is the area under the whole curve from 0 to 2.` },
      { id: 'e', label: r`$24$`, value: 24, trapExplanation: r`$3\cdot 2^3 = 24$: the power went up but you did not divide by the new exponent, $3$.` },
    ],
    correctOptionId: 'c',
    stepByStepSolution: [
      r`Find a function whose derivative is $3x^2$: that is $x^3$.`,
      r`Evaluate at the limits: $\left[x^3\right]_0^2 = 2^3 - 0^3 = 8$.`,
      r`Sanity check: the area must be less than the bounding rectangle $2 \times 12 = 24$ and more than $0$.`,
    ],
    keyConceptTag: 'Definite integral · power rule',
  },
  {
    id: 'cal-04',
    moduleId: 'calculus',
    difficulty: 1,
    promptText: r`A differentiable function $f$ satisfies $f'(x) > 0$ for $x < 1$, $\ f'(1) = 0$, and $f'(x) < 0$ for $x > 1$.

What does the graph of $f$ have at $x = 1$?`,
    options: [
      { id: 'a', label: r`A local minimum`, trapExplanation: r`A minimum needs the opposite pattern: falling first ($f'<0$), then rising ($f'>0$).` },
      { id: 'b', label: r`A local maximum` },
      { id: 'c', label: r`An inflection point`, trapExplanation: r`At an inflection point with $f'=0$ the derivative keeps the <i>same</i> sign on both sides (like $x^3$ at 0). Here the sign changes.` },
      { id: 'd', label: r`A zero of $f$`, trapExplanation: r`$f'(1)=0$ says the <i>slope</i> is zero, not the function value. Nothing is known about $f(1)$ itself.` },
      { id: 'e', label: r`A jump (discontinuity)`, trapExplanation: r`A differentiable function is always continuous, so it cannot jump.` },
    ],
    correctOptionId: 'b',
    stepByStepSolution: [
      r`$f' > 0$ means the graph is rising; $f' < 0$ means it is falling.`,
      r`So $f$ rises up to $x=1$, is momentarily flat, and falls afterwards.`,
      r`Rising then falling is a hilltop: a local maximum.`,
    ],
    keyConceptTag: 'Sign of f′ · extrema',
  },
  {
    id: 'cal-05',
    moduleId: 'calculus',
    difficulty: 2,
    promptText: r`The functions $f$ and $g$ are given by $f(x) = a\cdot x^3$ and $g(x) = e^{2x} + a$, where $a \in \mathbb{R}$ is a parameter.

For which value of $a$ do $f$ and $g$ have the same slope at $x = 1$?`,
    options: [
      { id: 'a', label: r`$\dfrac{e^2}{3}$`, value: (E * E) / 3, trapExplanation: r`The chain-rule factor is missing: the derivative of $e^{2x}$ is $2e^{2x}$.` },
      { id: 'b', label: r`$\dfrac{2e^2}{3}$`, value: (2 * E * E) / 3 },
      { id: 'c', label: r`$2e^2$`, value: 2 * E * E, trapExplanation: r`The power rule gives $f'(x) = 3ax^2$, so $f'(1) = 3a$, not $a$.` },
      { id: 'd', label: r`$\dfrac{3e^2}{2}$`, value: (3 * E * E) / 2, trapExplanation: r`The equation $3a = 2e^2$ was solved upside down. Divide by $3$.` },
      { id: 'e', label: r`$\dfrac{2e}{3}$`, value: (2 * E) / 3, trapExplanation: r`At $x=1$ the exponent is $2\cdot 1 = 2$, so the value is $e^2$, not $e$.` },
    ],
    correctOptionId: 'b',
    stepByStepSolution: [
      r`"Same slope" means equal derivatives at that point: $f'(1) = g'(1)$.`,
      r`$f'(x) = 3a x^2$, so $f'(1) = 3a$.`,
      r`$g'(x) = 2e^{2x}$ — the constant $+a$ shifts the graph up or down but does not change its slope. So $g'(1) = 2e^2$.`,
      r`$3a = 2e^2 \;\Rightarrow\; a = \dfrac{2e^2}{3}$.`,
    ],
    keyConceptTag: 'Equal slopes · parameter',
  },
  {
    id: 'cal-06',
    moduleId: 'calculus',
    difficulty: 2,
    promptText: r`Let $f(x) = x^2 + kx$, where $k$ is a real parameter.

For which value of $k$ does the graph of $f$ have a horizontal tangent at $x = 3$?`,
    options: [
      { id: 'a', label: r`$6$`, value: 6, trapExplanation: r`Sign error: from $6 + k = 0$ we get $k = -6$.` },
      { id: 'b', label: r`$3$`, value: 3, trapExplanation: r`This combines two slips: setting $f(3)=0$ instead of $f'(3)=0$, and then losing the sign.` },
      { id: 'c', label: r`$-3$`, value: -3, trapExplanation: r`This solves $f(3) = 0$ — where the graph crosses the axis. A horizontal tangent is about $f'(3) = 0$.` },
      { id: 'd', label: r`$-6$`, value: -6 },
      { id: 'e', label: r`$-9$`, value: -9, trapExplanation: r`$9 = 3^2$ is the value of $x^2$, but you need its derivative $2x = 6$.` },
    ],
    correctOptionId: 'd',
    stepByStepSolution: [
      r`A horizontal tangent has slope $0$, so we need $f'(3) = 0$.`,
      r`$f'(x) = 2x + k$.`,
      r`$f'(3) = 6 + k = 0 \;\Rightarrow\; k = -6$.`,
      r`Check: $x^2 - 6x$ is a parabola with vertex at $x = 3$. ✓`,
    ],
    keyConceptTag: 'Horizontal tangent · f′ = 0',
  },
  {
    id: 'cal-07',
    moduleId: 'calculus',
    difficulty: 2,
    promptText: r`Evaluate the definite integral.`,
    mathFormula: r`\int_0^{\pi} \sin(x)\,\mathrm{d}x`,
    options: [
      { id: 'a', label: r`$-2$`, value: -2, trapExplanation: r`Sign slip: the antiderivative of $\sin x$ is $-\cos x$. Also, $\sin x \ge 0$ on $[0,\pi]$, so the area cannot be negative.` },
      { id: 'b', label: r`$0$`, value: 0, trapExplanation: r`The integral is $0$ over a <i>full</i> period $[0, 2\pi]$. On $[0,\pi]$ the sine is entirely above the axis.` },
      { id: 'c', label: r`$1$`, value: 1, trapExplanation: r`$1$ is the area of only the first half of the arch, from $0$ to $\tfrac{\pi}{2}$.` },
      { id: 'd', label: r`$2$`, value: 2 },
      { id: 'e', label: r`$\pi$`, value: PI, trapExplanation: r`$\pi$ is the area of the bounding rectangle (width $\pi$, height $1$). The arch fills only part of it.` },
    ],
    correctOptionId: 'd',
    stepByStepSolution: [
      r`Antiderivative: $\int \sin x\,\mathrm{d}x = -\cos x$.`,
      r`$\left[-\cos x\right]_0^{\pi} = -\cos\pi + \cos 0 = 1 + 1 = 2$.`,
      r`Plausibility: the arch lies inside a $\pi \times 1$ rectangle (area $\approx 3.14$) and fills about two thirds of it.`,
    ],
    keyConceptTag: 'Trigonometric integral · area',
  },
  {
    id: 'cal-08',
    moduleId: 'calculus',
    difficulty: 2,
    promptText: r`Let $f(x) = x\,e^{-x}$ for $x \ge 0$.

What is the maximum value of $f$?`,
    options: [
      { id: 'a', label: r`$1$`, value: 1, trapExplanation: r`$x = 1$ is <i>where</i> the maximum occurs. The question asks for the value $f(1)$.` },
      { id: 'b', label: r`$\dfrac{1}{e}$`, value: 1 / E },
      { id: 'c', label: r`$e$`, value: E, trapExplanation: r`The sign of the exponent was lost: $f(1) = 1\cdot e^{-1}$, not $e^{+1}$.` },
      { id: 'd', label: r`$\dfrac{1}{e^2}$`, value: 1 / (E * E), trapExplanation: r`This is $e^{-2}$; it would come from the critical point $x=2$, but $f'(x)=0$ gives $x = 1$.` },
      { id: 'e', label: r`$\dfrac{2}{e^2}$`, value: 2 / (E * E), trapExplanation: r`This is $f(2)$. At $x = 2$ the <i>second</i> derivative vanishes (inflection point), not the first.` },
    ],
    correctOptionId: 'b',
    stepByStepSolution: [
      r`Product rule: $f'(x) = 1\cdot e^{-x} + x\cdot(-e^{-x}) = (1 - x)\,e^{-x}$.`,
      r`$e^{-x}$ is never zero, so $f'(x) = 0$ only at $x = 1$.`,
      r`$f' > 0$ before $x=1$ and $f' < 0$ after it, so this is a maximum.`,
      r`$f(1) = 1\cdot e^{-1} = \dfrac{1}{e} \approx 0.37$.`,
    ],
    keyConceptTag: 'Optimisation · product rule',
  },
  {
    id: 'cal-09',
    moduleId: 'calculus',
    difficulty: 3,
    promptText: r`We are given the following information about a twice differentiable function $f:\mathbb{R}\to\mathbb{R}$:

• $f'(0) = 1$ and $f'\!\left(\tfrac{\pi}{2}\right) = 3$

• $f''(x) + f(x) = 3\sin(x)$ for all $x \in \mathbb{R}$

Use this information to evaluate the integral.`,
    mathFormula: r`\int_0^{\pi/2} f(x)\,\mathrm{d}x`,
    options: [
      { id: 'a', label: r`$5$`, value: 5, trapExplanation: r`Sign error: $f = 3\sin x - f''$, so the change of $f'$ is <i>subtracted</i>: $3 - 2$, not $3 + 2$.` },
      { id: 'b', label: r`$3$`, value: 3, trapExplanation: r`This is only $\int 3\sin x\,\mathrm{d}x$. The term $-\int f''$ was ignored.` },
      { id: 'c', label: r`$2$`, value: 2, trapExplanation: r`$2 = f'(\tfrac{\pi}{2}) - f'(0)$ is only the integral of $f''$. It still has to be subtracted from $3$.` },
      { id: 'd', label: r`$1$`, value: 1 },
      { id: 'e', label: r`$-2$`, value: -2, trapExplanation: r`This takes $\int_0^{\pi/2}\sin x\,\mathrm{d}x$ to be $0$. It equals $1$ (area of half an arch).` },
    ],
    correctOptionId: 'd',
    stepByStepSolution: [
      r`You do not need to find $f$. Solve the given relation for $f$: $f(x) = 3\sin x - f''(x)$.`,
      r`Integrate both sides from $0$ to $\tfrac{\pi}{2}$: $\int f = 3\int \sin x\,\mathrm{d}x - \int f''(x)\,\mathrm{d}x$.`,
      r`$\int_0^{\pi/2}\sin x\,\mathrm{d}x = \left[-\cos x\right]_0^{\pi/2} = 1$, so the first part is $3$.`,
      r`Integrating a derivative gives back the function: $\int_0^{\pi/2} f'' = f'(\tfrac{\pi}{2}) - f'(0) = 3 - 1 = 2$.`,
      r`Result: $3 - 2 = 1$.`,
    ],
    keyConceptTag: 'Fundamental theorem · ∫f″ = f′',
  },
  {
    id: 'cal-10',
    moduleId: 'calculus',
    difficulty: 3,
    promptText: r`Evaluate the definite integral without long calculations.`,
    mathFormula: r`\int_{-2}^{2} \left(x^3\cos(x) + 3x^2\right)\mathrm{d}x`,
    options: [
      { id: 'a', label: r`$0$`, value: 0, trapExplanation: r`Only the first term is odd and cancels. $3x^2$ is even and positive, so it contributes a positive area.` },
      { id: 'b', label: r`$8$`, value: 8, trapExplanation: r`$8$ is $\int_0^2 3x^2\,\mathrm{d}x$ — only the right half. The left half contributes the same amount again.` },
      { id: 'c', label: r`$16$`, value: 16 },
      { id: 'd', label: r`$24$`, value: 24, trapExplanation: r`This multiplies the endpoint value $3\cdot 2^2 = 12$ by $2$. An integral is not "height at the end times width".` },
      { id: 'e', label: r`$32$`, value: 32, trapExplanation: r`The symmetry factor $2$ was applied twice. $2\cdot 8 = 16$.` },
    ],
    correctOptionId: 'c',
    stepByStepSolution: [
      r`The interval $[-2, 2]$ is symmetric about $0$ — look for odd and even parts.`,
      r`$x^3\cos x$ is odd (odd $\times$ even), so its integral over a symmetric interval is $0$.`,
      r`$3x^2$ is even, so $\int_{-2}^{2} 3x^2\,\mathrm{d}x = 2\int_0^2 3x^2\,\mathrm{d}x = 2\left[x^3\right]_0^2 = 16$.`,
      r`Total: $0 + 16 = 16$. No integration by parts needed.`,
    ],
    keyConceptTag: 'Symmetry · odd and even functions',
  },
  {
    id: 'cal-11',
    moduleId: 'calculus',
    difficulty: 3,
    promptText: r`Define $F$ by the formula below.

What is $F'(1)$?`,
    mathFormula: r`F(x) = \int_0^{x^2} e^{-t^2}\,\mathrm{d}t`,
    options: [
      { id: 'a', label: r`$0$`, value: 0, trapExplanation: r`An integral with fixed limits is a constant, but here the upper limit $x^2$ moves with $x$, so $F$ changes.` },
      { id: 'b', label: r`$\dfrac{1}{e}$`, value: 1 / E, trapExplanation: r`The integrand at the upper limit is right, but the upper limit $x^2$ itself moves at rate $2x$. The chain-rule factor $2$ is missing.` },
      { id: 'c', label: r`$\dfrac{2}{e}$`, value: 2 / E },
      { id: 'd', label: r`$2$`, value: 2, trapExplanation: r`The factor $2x = 2$ is right, but the integrand must be evaluated at the upper limit $t = 1$: $e^{-1}$, not $e^{0}$.` },
      { id: 'e', label: r`$2e$`, value: 2 * E, trapExplanation: r`The minus sign in the exponent was lost: $e^{-1} = \tfrac1e$.` },
    ],
    correctOptionId: 'c',
    stepByStepSolution: [
      r`Fundamental theorem: if $G(u) = \int_0^u e^{-t^2}\mathrm{d}t$ then $G'(u) = e^{-u^2}$ — the rate of area growth equals the height of the curve at the moving edge.`,
      r`Here $F(x) = G(x^2)$, a composition. Chain rule: $F'(x) = G'(x^2)\cdot 2x = e^{-x^4}\cdot 2x$.`,
      r`$F'(1) = e^{-1}\cdot 2 = \dfrac{2}{e}$.`,
      r`Note that $e^{-t^2}$ has no elementary antiderivative — and none is needed.`,
    ],
    keyConceptTag: 'Fundamental theorem + chain rule',
  },
  {
    id: 'cal-12',
    moduleId: 'calculus',
    difficulty: 3,
    promptText: r`The line $y = 4x + c$ is tangent to the parabola $y = x^2$.

What is the value of $c$?`,
    options: [
      { id: 'a', label: r`$-8$`, value: -8, trapExplanation: r`You subtracted $4\cdot 2 = 8$ but forgot to start from the height $y = 4$ of the touching point: $c = 4 - 8$.` },
      { id: 'b', label: r`$-4$`, value: -4 },
      { id: 'c', label: r`$0$`, value: 0, trapExplanation: r`With $c = 0$ the line $y=4x$ cuts the parabola at two points ($x=0$ and $x=4$). A tangent touches at exactly one.` },
      { id: 'd', label: r`$4$`, value: 4, trapExplanation: r`$4$ is the $y$-coordinate of the touching point, not the intercept of the line.` },
      { id: 'e', label: r`$8$`, value: 8, trapExplanation: r`$8 = 4\cdot 2$ is the term $4x$ at the touching point; it must be subtracted from $y = 4$.` },
    ],
    correctOptionId: 'b',
    stepByStepSolution: [
      r`At the touching point the parabola must have the same slope as the line: $2x = 4$, so $x = 2$.`,
      r`The point on the parabola is $(2, 4)$.`,
      r`The line must pass through it: $4 = 4\cdot 2 + c \;\Rightarrow\; c = -4$.`,
      r`Check: $x^2 = 4x - 4 \iff (x-2)^2 = 0$, a double root — exactly one common point. ✓`,
    ],
    keyConceptTag: 'Tangency = same point + same slope',
  },
];
