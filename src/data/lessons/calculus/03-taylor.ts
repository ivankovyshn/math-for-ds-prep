import { defineLesson, r } from '../define.ts';
import { extra } from './03-taylor.extra.ts';
import { practice } from './03-taylor.practice.ts';

export default defineLesson({
  id: 'ca-03',
  moduleId: 'calculus',
  title: "Taylor's formula",
  blurb: 'Approximating a function by polynomials',
  minutes: 8,
  deeper: [
    { title: 'Taylor series', url: 'https://www.3blue1brown.com/lessons/taylor-series', source: '3Blue1Brown · animated video lesson' },
    { title: 'Taylor series', url: 'https://tutorial.math.lamar.edu/Classes/CalcII/TaylorSeries.aspx', source: "Paul's Online Math Notes (Lamar University) · notes with many worked examples" },
  ],
  lecture: [
    {
      title: 'Linear approximation',
      blocks: [
        {
          kind: 'text',
          text: r`Near a point $a$, a differentiable function looks like its tangent line:`,
        },
        { kind: 'formula', tex: r`f(a + h) \approx f(a) + f'(a)\,h` },
        {
          kind: 'example',
          title: 'A square root by hand',
          prompt: r`Estimate $\sqrt{4.1}$.`,
          steps: [
            r`$f(x) = \sqrt x$, $a = 4$, $h = 0.1$. Then $f(4) = 2$ and $f'(x) = \frac{1}{2\sqrt x}$, so $f'(4) = \frac14$.`,
            r`$\sqrt{4.1} \approx 2 + \frac14\cdot0.1 = 2.025$.`,
            r`The true value is $2.02485\ldots$: the error is about $0.00016$, of order $h^2$.`,
          ],
        },
        {
          kind: 'quiz',
          id: 'ca-03-q1',
          prompt: r`Use the linear approximation at 0 to estimate $e^{0.1}$.`,
          options: [
            { id: 'a', label: '$1.1$', value: 1.1 },
            { id: 'b', label: '$0.1$', value: 0.1, trapExplanation: r`The approximation starts from the value $f(0) = e^0 = 1$ and adds $f'(0)\,h = 0.1$.` },
            { id: 'c', label: '$1$', value: 1, trapExplanation: r`That is only $f(0)$; add the linear term $f'(0)\cdot0.1$.` },
          ],
          correctOptionId: 'a',
          explanation: r`$e^{0.1} \approx e^0 + e^0\cdot0.1 = 1.1$ (true value $1.10517\ldots$).`,
        },
      ],
    },
    {
      title: 'The Taylor polynomial',
      blocks: [
        {
          kind: 'text',
          text: r`Matching more derivatives at $a$ gives better approximations. The Taylor polynomial of degree $n$ has the same value and the same first $n$ derivatives as $f$ at $a$:`,
        },
        { kind: 'formula', tex: r`T_n(x) = \sum_{k=0}^{n}\frac{f^{(k)}(a)}{k!}(x - a)^k = f(a) + f'(a)(x - a) + \frac{f''(a)}{2}(x - a)^2 + \dots` },
        { kind: 'diagram', type: 'taylor', caption: r`$\sin x$ with $T_1(x) = x$ and $T_3(x) = x - \frac{x^3}{6}$ at $a = 0$: each extra term hugs the curve over a wider range.` },
        {
          kind: 'text',
          text: r`At $a = 0$ (the Maclaurin series) the most useful ones are:`,
        },
        { kind: 'formula', tex: r`e^x = 1 + x + \frac{x^2}{2!} + \frac{x^3}{3!} + \dots, \quad \sin x = x - \frac{x^3}{3!} + \dots, \quad \cos x = 1 - \frac{x^2}{2!} + \dots` },
        { kind: 'formula', tex: r`\ln(1 + x) = x - \frac{x^2}{2} + \frac{x^3}{3} - \dots, \qquad \frac{1}{1 - x} = 1 + x + x^2 + \dots \quad (|x| < 1)` },
        {
          kind: 'quiz',
          id: 'ca-03-q2',
          prompt: r`What is the coefficient of $x^3$ in the Taylor series of $e^x$ at 0?`,
          options: [
            { id: 'a', label: r`$\tfrac16$`, value: 1 / 6 },
            { id: 'b', label: r`$\tfrac13$`, value: 1 / 3, trapExplanation: r`The denominator is $3! = 6$, not 3.` },
            { id: 'c', label: '$1$', value: 1, trapExplanation: r`All derivatives of $e^x$ at 0 are 1, but each is divided by $k!$.` },
          ],
          correctOptionId: 'a',
          explanation: r`$\frac{f'''(0)}{3!} = \frac{1}{6}$.`,
        },
      ],
    },
    {
      title: 'Building series from known ones',
      blocks: [
        {
          kind: 'text',
          text: r`You rarely differentiate many times. Substitute into a known series instead:`,
        },
        {
          kind: 'example',
          title: 'Substitution',
          prompt: r`Find the series of $e^{-x^2}$ up to $x^4$.`,
          steps: [
            r`Put $u = -x^2$ into $e^u = 1 + u + \frac{u^2}{2} + \dots$`,
            r`$e^{-x^2} = 1 - x^2 + \frac{x^4}{2} - \dots$`,
            r`So the coefficient of $x^4$ is $\frac12$ — without computing four derivatives of $e^{-x^2}$.`,
          ],
        },
        {
          kind: 'quiz',
          id: 'ca-03-q3',
          prompt: r`What is the coefficient of $x^2$ in the series of $e^{3x}$?`,
          options: [
            { id: 'a', label: r`$\tfrac92$`, value: 4.5 },
            { id: 'b', label: r`$\tfrac32$`, value: 1.5, trapExplanation: r`Substitute $u = 3x$ into $\frac{u^2}{2}$: $\frac{(3x)^2}{2}$, so the 3 is squared too.` },
            { id: 'c', label: '$9$', value: 9, trapExplanation: r`$f''(0) = 9$, but it is divided by $2! = 2$.` },
          ],
          correctOptionId: 'a',
          explanation: r`$\frac{(3x)^2}{2!} = \frac{9}{2}x^2$.`,
        },
      ],
    },
    {
      title: 'How good is the approximation?',
      blocks: [
        {
          kind: 'box',
          variant: 'theorem',
          title: "Taylor's theorem",
          text: r`If $f$ has $n + 1$ derivatives, then $f(x) = T_n(x) + R_n(x)$ with

$R_n(x) = \frac{f^{(n+1)}(\xi)}{(n + 1)!}(x - a)^{n+1}$ for some $\xi$ between $a$ and $x$.

Near $a$ the error shrinks like $(x - a)^{n+1}$.`,
        },
        {
          kind: 'box',
          variant: 'tip',
          title: 'Where it shows up',
          text: r`Second-order Taylor in many variables, $f(\mathbf{x} + \mathbf{h}) \approx f(\mathbf{x}) + \nabla f\cdot\mathbf{h} + \frac12\mathbf{h}^TH\mathbf{h}$, is the basis of Newton's method. Approximations such as $\ln(1 + x) \approx x$ and $e^x \approx 1 + x$ for small $x$ are used all the time in deriving formulas.`,
        },
        {
          kind: 'box',
          variant: 'pitfall',
          title: 'Not every series works everywhere',
          text: r`The series of $\frac{1}{1 - x}$ and $\ln(1 + x)$ converge only for $|x| < 1$. At $x = 2$, $1 + 2 + 4 + \dots$ is no approximation of $\frac{1}{1 - 2} = -1$.`,
        },
      ],
    },
    {
      title: 'Summary',
      blocks: [
        {
          kind: 'text',
          text: r`• Linear approximation: $f(a + h) \approx f(a) + f'(a)h$.

• $T_n(x) = \sum_{k \le n}\frac{f^{(k)}(a)}{k!}(x - a)^k$; don't forget the $k!$.

• Know $e^x$, $\sin x$, $\cos x$, $\ln(1 + x)$, $\frac{1}{1 - x}$ at 0.

• Build new series by substitution: $e^{3x}$, $e^{-x^2}$.

• Error of order $(x - a)^{n+1}$ near $a$; some series need $|x| < 1$.`,
        },
      ],
    },
  ],
  extra,
  questions: practice,
});
