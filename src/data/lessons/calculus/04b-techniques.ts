import { defineLesson, r } from '../define.ts';
import { extra } from './04b-techniques.extra.ts';
import { practice } from './04b-techniques.practice.ts';

export default defineLesson({
  id: 'ca-04b',
  moduleId: 'calculus',
  title: 'Integration techniques',
  blurb: 'Substitution, integration by parts, infinite intervals and densities',
  minutes: 8,
  deeper: [
    { title: 'Substitution rule for definite integrals', url: 'https://tutorial.math.lamar.edu/Classes/CalcI/SubstitutionRuleDefinite.aspx', source: "Paul's Online Math Notes (Lamar University) · notes with many worked examples" },
    { title: 'Integration by parts', url: 'https://tutorial.math.lamar.edu/Classes/CalcII/IntegrationByParts.aspx', source: "Paul's Online Math Notes (Lamar University) · notes with many worked examples" },
    { title: 'Improper integrals', url: 'https://tutorial.math.lamar.edu/Classes/CalcII/ImproperIntegrals.aspx', source: "Paul's Online Math Notes (Lamar University) · notes with many worked examples" },
  ],
  lecture: [
    {
      title: 'Substitution',
      covers: ['1', '5', 'x1', 'x5'],
      blocks: [
        {
          kind: 'text',
          text: r`Substitution is the chain rule backwards. If the integrand has the form $f(g(x))\,g'(x)$ — an inside function and its derivative next to it — set $u = g(x)$. Then $du = g'(x)\,dx$, and the integral turns into $\int f(u)\,du$.

For a definite integral, change the limits too: $x = a$ becomes $u = g(a)$. Then there is no need to go back to $x$.`,
        },
        {
          kind: 'example',
          title: 'An indefinite integral',
          prompt: r`Find $\int 2x\,e^{x^2}\,dx$ and $\int \cos(3x)\,dx$.`,
          steps: [
            r`$u = x^2$, $du = 2x\,dx$: the integral is $\int e^u\,du = e^u + C = e^{x^2} + C$.`,
            r`$u = 3x$, $du = 3\,dx$, so $dx = \frac13 du$: $\int \cos u\cdot\frac13\,du = \frac13\sin(3x) + C$.`,
            r`Check by differentiating: $\big(\frac13\sin 3x\big)' = \frac13\cdot 3\cos 3x$. ✓`,
          ],
        },
        {
          kind: 'example',
          title: 'A definite integral with new limits',
          prompt: r`Compute $\int_0^1 3x^2\,(x^3 + 1)^4\,dx$.`,
          steps: [
            r`Inside function $u = x^3 + 1$; its derivative $3x^2$ is right there: $du = 3x^2\,dx$.`,
            r`New limits: $x = 0$ gives $u = 1$; $x = 1$ gives $u = 2$.`,
            r`$\int_1^2 u^4\,du = \Big[\frac{u^5}{5}\Big]_1^2 = \frac{32 - 1}{5} = \frac{31}{5}$.`,
            r`Keeping the old limits $0$ and $1$ for $u$ would give $\frac15$ — the most common slip with substitution.`,
          ],
        },
        {
          kind: 'quiz',
          id: 'ca-04b-q1',
          prompt: r`Find $\int \cos(3x)\,dx$.`,
          options: [
            { id: 'a', label: r`$\frac13\sin(3x) + C$` },
            { id: 'b', label: r`$3\sin(3x) + C$`, trapExplanation: r`$(3\sin 3x)' = 9\cos 3x$. Integration divides by the inner factor 3; differentiation multiplies.` },
            { id: 'c', label: r`$-\frac13\sin(3x) + C$`, trapExplanation: r`$\int\cos u\,du = +\sin u$. The minus belongs to $\int \sin u\,du = -\cos u$.` },
          ],
          correctOptionId: 'a',
          explanation: r`With $u = 3x$: $\frac13\int\cos u\,du = \frac13\sin 3x + C$.`,
        },
      ],
    },
    {
      title: 'Integration by parts',
      covers: ['3', 'x3'],
      blocks: [
        {
          kind: 'text',
          text: r`Integration by parts is the product rule backwards. Integrating $(uv)' = u'v + uv'$ gives:`,
        },
        { kind: 'formula', tex: r`\int u\,dv = uv - \int v\,du, \qquad \int_a^b u\,dv = \big[uv\big]_a^b - \int_a^b v\,du` },
        {
          kind: 'box',
          variant: 'tip',
          title: 'Which factor is u',
          text: r`Choose $u$ = the factor that gets simpler when differentiated (a power of $x$), and $dv$ = the factor that is easy to integrate ($e^{kx}$, $\sin x$, $\cos x$). Then $\int v\,du$ is easier than the original.`,
        },
        {
          kind: 'example',
          title: 'x times an exponential',
          prompt: r`Find $\int x\,e^x\,dx$, then $\int_0^1 x\,e^x\,dx$.`,
          steps: [
            r`$u = x$, $dv = e^x\,dx$, so $du = dx$ and $v = e^x$.`,
            r`$\int x e^x\,dx = x e^x - \int e^x\,dx = x e^x - e^x + C$.`,
            r`Check: $(xe^x - e^x)' = e^x + xe^x - e^x = xe^x$. ✓`,
            r`$\int_0^1 x e^x\,dx = \big[xe^x - e^x\big]_0^1 = (e - e) - (0 - 1) = 1$.`,
          ],
        },
        {
          kind: 'quiz',
          id: 'ca-04b-q2',
          prompt: r`Find $\int x\cos x\,dx$.`,
          options: [
            { id: 'a', label: r`$x\sin x + \cos x + C$` },
            { id: 'b', label: r`$x\sin x - \cos x + C$`, trapExplanation: r`$\int v\,du = \int \sin x\,dx = -\cos x$, and it is subtracted: $-(-\cos x) = +\cos x$.` },
            { id: 'c', label: r`$\frac{x^2}{2}\sin x + C$`, trapExplanation: r`The two factors cannot be integrated separately: $\int uv \ne \int u\cdot\int v$.` },
          ],
          correctOptionId: 'a',
          explanation: r`$u = x$, $dv = \cos x\,dx$: $x\sin x - \int\sin x\,dx = x\sin x + \cos x + C$.`,
        },
      ],
    },
    {
      title: 'Infinite intervals',
      covers: ['2', 'x2'],
      blocks: [
        {
          kind: 'text',
          text: r`An integral up to $\infty$ is a limit: $\int_a^\infty f(x)\,dx = \lim_{b\to\infty}\int_a^b f(x)\,dx$. If the limit is a finite number the integral <i>converges</i>; otherwise it <i>diverges</i>. An infinitely long region can have a finite area if $f$ shrinks fast enough.`,
        },
        {
          kind: 'example',
          title: 'Two that converge, one that does not',
          prompt: r`Compute $\int_0^\infty e^{-2x}\,dx$, $\int_1^\infty \frac{dx}{x^2}$ and $\int_1^\infty \frac{dx}{x}$.`,
          steps: [
            r`$\int_0^b e^{-2x}dx = \big[-\tfrac12 e^{-2x}\big]_0^b = \tfrac12 - \tfrac12 e^{-2b} \to \tfrac12$.`,
            r`$\int_1^b x^{-2}dx = \big[-x^{-1}\big]_1^b = 1 - \frac1b \to 1$.`,
            r`$\int_1^b \frac{dx}{x} = \ln b \to \infty$: diverges. In general $\int_1^\infty x^{-p}\,dx = \frac{1}{p - 1}$ for $p > 1$ and diverges for $p \le 1$.`,
          ],
        },
        {
          kind: 'box',
          variant: 'pitfall',
          title: 'Watch for blow-ups inside the interval',
          text: r`$\int_{-1}^{1}\frac{dx}{x^2}$ is not $\big[-\frac1x\big]_{-1}^{1} = -2$: the integrand is infinite at 0 and the area there is unbounded. The fundamental theorem needs $f$ continuous on the whole interval.`,
        },
        {
          kind: 'quiz',
          id: 'ca-04b-q3',
          prompt: r`Compute $\int_1^\infty x^{-3}\,dx$.`,
          options: [
            { id: 'a', label: r`$\frac12$`, value: 0.5 },
            { id: 'b', label: 'It diverges', trapExplanation: r`$x^{-3}$ shrinks fast enough: $\int_1^b x^{-3}dx = \frac12 - \frac{1}{2b^2} \to \frac12$.` },
            { id: 'c', label: r`$-\frac12$`, value: -0.5, trapExplanation: r`A positive function has a positive area. $\big[-\frac{1}{2x^2}\big]_1^\infty = 0 - \big(-\frac12\big)$.` },
          ],
          correctOptionId: 'a',
          explanation: r`$\frac{1}{p - 1}$ with $p = 3$: $\frac12$.`,
        },
      ],
    },
    {
      title: 'Integrals in probability',
      covers: ['4', '6', 'x4', 'x6'],
      blocks: [
        {
          kind: 'text',
          text: r`A continuous random variable is described by a <i>probability density</i> $p(x) \ge 0$ with total area 1. Probabilities are areas under it, and the mean is a weighted integral:`,
        },
        { kind: 'formula', tex: r`\int p(x)\,dx = 1, \qquad P(a \le X \le b) = \int_a^b p(x)\,dx, \qquad E[X] = \int x\,p(x)\,dx` },
        {
          kind: 'example',
          title: 'A density on [0, 1]',
          prompt: r`$X$ has density $p(x) = 3x^2$ on $[0, 1]$. Check that it is a density, then find $P(X \le \frac12)$ and $E[X]$.`,
          steps: [
            r`Total area: $\int_0^1 3x^2\,dx = [x^3]_0^1 = 1$. ✓`,
            r`$P(X \le \frac12) = \int_0^{1/2} 3x^2\,dx = \big(\tfrac12\big)^3 = \tfrac18$.`,
            r`The value $p(\frac12) = \frac34$ is <i>not</i> a probability: a density is probability per unit length.`,
            r`$E[X] = \int_0^1 x\cdot 3x^2\,dx = \big[\tfrac34 x^4\big]_0^1 = \tfrac34$.`,
          ],
        },
        {
          kind: 'box',
          variant: 'tip',
          title: 'The exponential distribution',
          text: r`Waiting times are often modelled by $p(x) = \lambda e^{-\lambda x}$ for $x \ge 0$. Then $P(X > t) = \int_t^\infty \lambda e^{-\lambda x}dx = e^{-\lambda t}$. The probability module returns to densities in detail.`,
        },
      ],
    },
    {
      title: 'Summary',
      blocks: [
        {
          kind: 'text',
          text: r`• Substitution: $u = g(x)$, $du = g'(x)\,dx$; change the limits along with the variable.

• By parts: $\int u\,dv = uv - \int v\,du$; let $u$ be the power of $x$.

• $\int_a^\infty f = \lim_{b\to\infty}\int_a^b f$; $\int_1^\infty x^{-p}dx = \frac{1}{p - 1}$ for $p > 1$.

• Densities: $\int p = 1$, $P(a \le X \le b) = \int_a^b p$, $E[X] = \int x\,p(x)\,dx$.`,
        },
      ],
    },
  ],
  extra,
  questions: practice,
});
