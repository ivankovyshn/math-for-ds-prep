import { defineLesson, r } from '../define.ts';
import { extra } from './07-polar.extra.ts';
import { practice } from './07-polar.practice.ts';

export default defineLesson({
  id: 'ml-07',
  moduleId: 'intro',
  title: 'Polar form and roots',
  blurb: "Modulus and argument, Euler's formula, De Moivre and n-th roots",
  minutes: 8,
  deeper: [
    { title: 'Complex Number Primer: polar and exponential forms', url: 'https://tutorial.math.lamar.edu/Extras/ComplexPrimer/Forms.aspx', source: "Paul's Online Math Notes (Lamar University) · notes with many worked examples" },
    { title: 'Complex Number Primer: powers and roots', url: 'https://tutorial.math.lamar.edu/Extras/ComplexPrimer/Roots.aspx', source: "Paul's Online Math Notes (Lamar University) · notes with many worked examples" },
  ],
  lecture: [
    {
      title: 'Modulus and argument',
      covers: ['3', 'x5'],
      blocks: [
        {
          kind: 'text',
          text: r`The previous lesson drew $z = a + bi$ as the point $(a, b)$. A point can also be given by <i>how far</i> and <i>in which direction</i>:

• the <i>modulus</i> $r = |z| = \sqrt{a^2 + b^2}$, the distance from 0;

• the <i>argument</i> $\varphi = \arg z$, the angle from the positive real axis, counter-clockwise positive. We take it between $-180^\circ$ and $180^\circ$.

The angles here are the unit-circle angles of the school trigonometry lesson: $a = r\cos\varphi$ and $b = r\sin\varphi$.`,
        },
        { kind: 'diagram', type: 'complexPlane' },
        { kind: 'formula', tex: r`z = r(\cos\varphi + i\sin\varphi), \qquad a = r\cos\varphi,\quad b = r\sin\varphi`, caption: 'Polar form' },
        {
          kind: 'box',
          variant: 'pitfall',
          title: 'Mind the quadrant',
          text: r`$\tan\varphi = b/a$ does not determine $\varphi$ on its own: $1 + i$ and $-1 - i$ have the same ratio but opposite directions. The calculator's $\arctan$ always answers between $-90^\circ$ and $90^\circ$, so for a negative real part add or subtract $180^\circ$. Always check which quadrant the point is in.`,
        },
        {
          kind: 'example',
          title: 'An argument in the third quadrant',
          prompt: r`Find the modulus and argument of $z = -\sqrt3 - i$.`,
          steps: [
            r`Modulus: $|z| = \sqrt{3 + 1} = 2$.`,
            r`Reference angle (the angle with the horizontal axis): $\tan\alpha = \frac{1}{\sqrt3}$, so $\alpha = 30^\circ$.`,
            r`The point $(-\sqrt3, -1)$ is left and down: the third quadrant. Going clockwise from the positive real axis, that is $180^\circ - 30^\circ = 150^\circ$ below it: $\varphi = -150^\circ$.`,
            r`The calculator's $\arctan\frac{-1}{-\sqrt3} = 30^\circ$ points into the first quadrant: exactly the trap.`,
            r`Check: $2(\cos(-150^\circ) + i\sin(-150^\circ)) = 2\big(-\tfrac{\sqrt3}{2} - \tfrac12 i\big) = -\sqrt3 - i$. ✓`,
          ],
        },
        {
          kind: 'quiz',
          id: 'ml-07-q1',
          prompt: r`What is the argument of $z = -3 + 3i$?`,
          options: [
            { id: 'a', label: r`$135^\circ$`, value: 135 },
            { id: 'b', label: r`$-45^\circ$`, value: -45, trapExplanation: r`That is $\arctan\frac{3}{-3}$, which points right and down. The point $(-3, 3)$ is left and up.` },
            { id: 'c', label: r`$45^\circ$`, value: 45, trapExplanation: r`$45^\circ$ is the direction of $3 + 3i$. Here the real part is negative.` },
          ],
          correctOptionId: 'a',
          explanation: r`$(-3, 3)$ is in the second quadrant, on the diagonal: $180^\circ - 45^\circ = 135^\circ$.`,
        },
      ],
    },
    {
      title: "Euler's formula",
      covers: ['1', '4'],
      blocks: [
        {
          kind: 'text',
          text: r`Polar form has a short notation, explained by Euler's formula. It connects the exponential function with the unit circle: $e^{i\varphi}$ is the point at angle $\varphi$ on the circle of radius 1.`,
        },
        { kind: 'formula', tex: r`e^{i\varphi} = \cos\varphi + i\sin\varphi, \qquad z = re^{i\varphi}` },
        {
          kind: 'text',
          text: r`The four directions along the axes are worth knowing by heart: $e^{i\cdot 0^\circ} = 1$, $e^{i\cdot 90^\circ} = i$, $e^{i\cdot 180^\circ} = -1$, $e^{i\cdot 270^\circ} = -i$. In radians, $180^\circ = \pi$ gives the famous $e^{i\pi} = -1$.

To go back from $re^{i\varphi}$ to $a + bi$, compute $a = r\cos\varphi$ and $b = r\sin\varphi$ with the signs of the quadrant.`,
        },
        {
          kind: 'example',
          title: 'Back to a + bi',
          prompt: r`Write $z = 4e^{i\cdot 150^\circ}$ in the form $a + bi$.`,
          steps: [
            r`$150^\circ$ is in the second quadrant, $30^\circ$ from the negative real axis: cosine negative, sine positive.`,
            r`$\cos 150^\circ = -\cos 30^\circ = -\tfrac{\sqrt3}{2}$ and $\sin 150^\circ = \sin 30^\circ = \tfrac12$.`,
            r`$a = 4\cdot\big(-\tfrac{\sqrt3}{2}\big) = -2\sqrt3$, $b = 4\cdot\tfrac12 = 2$.`,
            r`$z = -2\sqrt3 + 2i$.`,
          ],
        },
        {
          kind: 'quiz',
          id: 'ml-07-q2',
          prompt: r`What is $e^{i\pi}$?`,
          options: [
            { id: 'a', label: r`$-1$`, value: [-1, 0] },
            { id: 'b', label: r`$1$`, value: [1, 0], trapExplanation: r`$1 = e^{i\cdot 0}$. The angle $\pi$ is a half turn.` },
            { id: 'c', label: r`$i$`, value: [0, 1], trapExplanation: r`$i = e^{i\pi/2}$, a quarter turn. $\pi$ radians is $180^\circ$.` },
          ],
          correctOptionId: 'a',
          explanation: r`$e^{i\pi} = \cos\pi + i\sin\pi = -1 + 0i$: the point half a turn from 1.`,
        },
      ],
    },
    {
      title: 'Multiplying in polar form',
      covers: ['2', 'x2', 'x3'],
      blocks: [
        {
          kind: 'text',
          text: r`Multiplying $a + bi$ by $c + di$ in the usual way hides a simple picture. In polar form it is clear: <i>moduli multiply, arguments add</i>. That is the rule $e^{i\alpha}e^{i\beta} = e^{i(\alpha + \beta)}$ for exponents.

Geometrically, multiplying by $w$ scales by $|w|$ and turns by $\arg w$. In particular, multiplying by $i = e^{i\cdot 90^\circ}$ is a quarter turn counter-clockwise.`,
        },
        { kind: 'formula', tex: r`r_1e^{i\varphi_1}\cdot r_2e^{i\varphi_2} = r_1r_2\,e^{i(\varphi_1 + \varphi_2)}` },
        {
          kind: 'example',
          title: 'Two ways to the same product',
          prompt: r`Compute $zw$ for $z = 2e^{i\cdot 50^\circ}$ and $w = 3e^{i\cdot 40^\circ}$. Then compute $i\,(3 + 2i)$.`,
          steps: [
            r`Moduli multiply: $2\cdot 3 = 6$. Arguments add: $50^\circ + 40^\circ = 90^\circ$.`,
            r`$zw = 6e^{i\cdot 90^\circ} = 6(\cos 90^\circ + i\sin 90^\circ) = 6i$.`,
            r`$i\,(3 + 2i) = 3i + 2i^2 = -2 + 3i$.`,
            r`The point $(3, 2)$ went to $(-2, 3)$: a quarter turn, exactly what multiplying by $i = e^{i\cdot 90^\circ}$ promises.`,
          ],
        },
        {
          kind: 'quiz',
          id: 'ml-07-q3',
          prompt: r`$z$ has modulus 2 and argument $30^\circ$. What are the modulus and argument of $z^3$?`,
          options: [
            { id: 'a', label: r`Modulus $8$, argument $90^\circ$`, value: [8, 90] },
            { id: 'b', label: r`Modulus $6$, argument $90^\circ$`, value: [6, 90], trapExplanation: r`$z^3 = z\cdot z\cdot z$: the moduli multiply, $2\cdot2\cdot2 = 8$.` },
            { id: 'c', label: r`Modulus $8$, argument $33^\circ$`, value: [8, 33], trapExplanation: r`Each factor adds another $30^\circ$: $3\cdot 30^\circ = 90^\circ$.` },
          ],
          correctOptionId: 'a',
          explanation: r`Three factors: modulus $2^3 = 8$, argument $30^\circ + 30^\circ + 30^\circ = 90^\circ$. So $z^3 = 8i$.`,
        },
      ],
    },
    {
      title: "Powers: De Moivre's theorem",
      covers: ['5', 'x4'],
      blocks: [
        {
          kind: 'text',
          text: r`Repeating the product rule $n$ times gives De Moivre's theorem: raise the modulus to the power and multiply the angle by $n$. A power like $(1 + i)^{8}$ would take eight multiplications in the form $a + bi$; in polar form it is two lines.`,
        },
        { kind: 'formula', tex: r`\big(re^{i\varphi}\big)^{n} = r^{n}e^{in\varphi}`, caption: "De Moivre's theorem" },
        {
          kind: 'example',
          title: 'A power with an angle of 135°',
          prompt: r`Compute $(-1 + i)^6$.`,
          steps: [
            r`$|-1 + i| = \sqrt2$. The point $(-1, 1)$ is left and up, on the diagonal: $\arg = 135^\circ$.`,
            r`Modulus of the power: $(\sqrt2)^6 = 2^3 = 8$.`,
            r`Angle: $6\cdot 135^\circ = 810^\circ$. Remove full turns: $810^\circ - 2\cdot 360^\circ = 90^\circ$.`,
            r`$(-1 + i)^6 = 8e^{i\cdot 90^\circ} = 8i$.`,
            r`The same way, $(1 + i)^8$ has modulus $(\sqrt2)^8 = 16$ and angle $8\cdot 45^\circ = 360^\circ$, so it equals $16$.`,
          ],
        },
      ],
    },
    {
      title: 'Roots',
      covers: ['6', 'x1', 'x6'],
      blocks: [
        {
          kind: 'text',
          text: r`Solving $z^n = w$ reverses De Moivre: take the $n$-th root of the modulus and divide the argument by $n$. But the argument of $w$ is only known up to full turns: $\varphi$, $\varphi + 360^\circ$, $\varphi + 720^\circ$, … all describe the same direction. Divided by $n$, they give $n$ different angles, $\frac{360^\circ}{n}$ apart.`,
        },
        { kind: 'formula', tex: r`z^n = Re^{i\psi} \;\Longrightarrow\; z_k = \sqrt[n]{R}\;e^{\,i\,(\psi + 360^\circ k)/n}, \qquad k = 0, 1, \dots, n - 1` },
        { kind: 'diagram', type: 'rootsOfUnity', caption: r`The six solutions of $z^6 = 1$: $e^{ik\cdot 60^\circ}$ for $k = 0, \dots, 5$.` },
        {
          kind: 'example',
          title: 'Solving z³ = 8i',
          prompt: r`Find all solutions of $z^3 = 8i$.`,
          steps: [
            r`Polar form of the right side: $8i = 8e^{i\cdot 90^\circ}$.`,
            r`Modulus of every root: $\sqrt[3]{8} = 2$.`,
            r`Arguments: $\frac{90^\circ + 360^\circ k}{3} = 30^\circ + 120^\circ k$, so $30^\circ$, $150^\circ$ and $270^\circ$.`,
            r`$2e^{i\cdot30^\circ} = \sqrt3 + i$, $2e^{i\cdot150^\circ} = -\sqrt3 + i$, $2e^{i\cdot270^\circ} = -2i$.`,
            r`Check one: $(-2i)^3 = -8i^3 = -8\cdot(-i) = 8i$. ✓`,
          ],
        },
        {
          kind: 'box',
          variant: 'theorem',
          title: 'How many roots',
          text: r`For $w \ne 0$, the equation $z^n = w$ has exactly $n$ solutions. They lie on the circle of radius $\sqrt[n]{|w|}$, evenly spaced $\frac{360^\circ}{n}$ apart — the fundamental theorem of algebra in action.`,
        },
      ],
    },
    {
      title: 'Summary',
      blocks: [
        {
          kind: 'text',
          text: r`• $z = re^{i\varphi} = r(\cos\varphi + i\sin\varphi)$ with $r = |z|$ and $\varphi = \arg z$; check the quadrant, not just $\arctan\frac ba$.

• Back to $a + bi$: $a = r\cos\varphi$, $b = r\sin\varphi$.

• Products: moduli multiply, arguments add. Multiplying by $i$ is a quarter turn.

• Powers: $(re^{i\varphi})^n = r^ne^{in\varphi}$; remove full turns from the angle.

• Roots: $z^n = w$ has $n$ solutions on a circle, $\frac{360^\circ}{n}$ apart.`,
        },
      ],
    },
  ],
  extra,
  questions: practice,
});
