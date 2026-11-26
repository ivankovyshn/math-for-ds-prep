import { defineLesson, r } from '../define.ts';
import { extra } from './06-complex.extra.ts';
import { practice } from './06-complex.practice.ts';

export default defineLesson({
  id: 'ml-06',
  moduleId: 'intro',
  title: 'Complex numbers',
  blurb: 'Arithmetic, the complex plane, polar form, roots',
  minutes: 8,
  lecture: [
    {
      title: 'The number i',
      blocks: [
        {
          kind: 'text',
          text: r`The equation $x^2 = -1$ has no real solution. Complex numbers add one new number $i$ with $i^2 = -1$, and everything else follows from the usual rules of algebra.

A complex number is $z = a + bi$ with real $a = \operatorname{Re} z$ (real part) and $b = \operatorname{Im} z$ (imaginary part). Add and multiply like polynomials in $i$, replacing $i^2$ by $-1$:`,
        },
        { kind: 'formula', tex: r`(a + bi)(c + di) = (ac - bd) + (ad + bc)\,i` },
        {
          kind: 'text',
          text: r`The <i>conjugate</i> of $z = a + bi$ is $\bar z = a - bi$, and $z\bar z = a^2 + b^2$ is a non-negative real number. That is the trick for division: multiply top and bottom by the conjugate of the denominator.`,
        },
        {
          kind: 'example',
          title: 'Division',
          prompt: r`Compute $\dfrac{3 + 2i}{1 - i}$.`,
          steps: [
            r`Multiply by $\frac{1 + i}{1 + i}$: the denominator becomes $(1 - i)(1 + i) = 1 + 1 = 2$.`,
            r`Numerator: $(3 + 2i)(1 + i) = 3 + 3i + 2i + 2i^2 = 1 + 5i$.`,
            r`Result: $\dfrac{1 + 5i}{2} = \tfrac12 + \tfrac52 i$.`,
          ],
        },
        {
          kind: 'quiz',
          id: 'ml-06-q1',
          prompt: r`What is $i^3$?`,
          options: [
            { id: 'a', label: r`$-i$`, value: [0, -1] },
            { id: 'b', label: r`$i$`, value: [0, 1], trapExplanation: r`$i^3 = i^2 \cdot i = -i$. The powers of $i$ cycle $i, -1, -i, 1$.` },
            { id: 'c', label: r`$-1$`, value: [-1, 0], trapExplanation: r`$-1$ is $i^2$. One more factor of $i$ gives $-i$.` },
          ],
          correctOptionId: 'a',
          explanation: r`$i^3 = i^2 \cdot i = (-1) \cdot i = -i$.`,
        },
      ],
    },
    {
      title: 'The complex plane',
      blocks: [
        {
          kind: 'text',
          text: r`Draw $z = a + bi$ as the point $(a, b)$. Then a complex number has a length and a direction:

• the <i>modulus</i> $|z| = \sqrt{a^2 + b^2}$ (distance from 0);

• the <i>argument</i> $\arg z = \varphi$, the angle from the positive real axis.`,
        },
        { kind: 'diagram', type: 'complexPlane' },
        { kind: 'formula', tex: r`z = r(\cos\varphi + i\sin\varphi) = r\,e^{i\varphi}, \qquad r = |z|`, caption: r`Polar form. The notation $e^{i\varphi}$ comes from Euler's formula $e^{i\varphi} = \cos\varphi + i\sin\varphi$.` },
        {
          kind: 'box',
          variant: 'pitfall',
          title: 'Mind the quadrant',
          text: r`$\tan\varphi = b/a$ does not determine $\varphi$ on its own: $1 + i$ and $-1 - i$ have the same ratio but opposite directions. Always check which quadrant the point is in.`,
        },
        {
          kind: 'quiz',
          id: 'ml-06-q2',
          prompt: r`In which quadrant of the complex plane does $z = -2 + i$ lie?`,
          options: [
            { id: 'a', label: 'Second (upper left)' },
            { id: 'b', label: 'First (upper right)', trapExplanation: r`The real part $-2$ is negative, so the point is left of the imaginary axis.` },
            { id: 'c', label: 'Third (lower left)', trapExplanation: r`The imaginary part $+1$ is positive, so the point is above the real axis.` },
          ],
          correctOptionId: 'a',
          explanation: r`$z = a + bi$ is the point $(a, b)$. Here $(-2, 1)$: left and up — the second quadrant.`,
        },
      ],
    },
    {
      title: 'Multiplying in polar form',
      blocks: [
        {
          kind: 'text',
          text: r`In polar form multiplication becomes simple: <i>moduli multiply, arguments add</i>. Geometrically, multiplying by $z$ scales by $|z|$ and rotates by $\arg z$ — multiplying by $i$ is a $90^\circ$ rotation.`,
        },
        { kind: 'formula', tex: r`r_1e^{i\varphi_1}\cdot r_2e^{i\varphi_2} = r_1r_2\,e^{i(\varphi_1 + \varphi_2)}, \qquad \big(re^{i\varphi}\big)^{n} = r^{n}e^{in\varphi}`, caption: "The second formula is De Moivre's theorem." },
        {
          kind: 'example',
          title: 'A high power',
          prompt: r`Compute $(1 + i)^8$.`,
          steps: [
            r`$|1 + i| = \sqrt2$, $\arg(1 + i) = 45^\circ$.`,
            r`$(1 + i)^8$ has modulus $(\sqrt2)^8 = 16$ and argument $8\cdot45^\circ = 360^\circ$.`,
            r`An angle of $360^\circ$ points along the positive real axis: $(1 + i)^8 = 16$.`,
          ],
        },
      ],
    },
    {
      title: 'Roots and polynomials',
      blocks: [
        {
          kind: 'text',
          text: r`Solving $z^n = w$ reverses the rule: take the $n$-th root of the modulus and divide the argument by $n$ — but the argument is only known up to multiples of $360^\circ$, which gives $n$ different answers, evenly spaced on a circle.`,
        },
        { kind: 'diagram', type: 'rootsOfUnity', caption: r`The six solutions of $z^6 = 1$: $e^{ik\cdot 60^\circ}$ for $k = 0, \dots, 5$.` },
        {
          kind: 'box',
          variant: 'theorem',
          title: 'Fundamental theorem of algebra',
          text: r`Every polynomial of degree $n \ge 1$ with complex coefficients has exactly $n$ complex roots, counted with multiplicity. If the coefficients are real, non-real roots come in conjugate pairs $z$, $\bar z$.`,
        },
        {
          kind: 'quiz',
          id: 'ml-06-q3',
          prompt: r`Which numbers solve $z^2 + 2z + 5 = 0$?`,
          options: [
            { id: 'a', label: r`$z = -1 \pm 2i$` },
            { id: 'b', label: r`$z = 1 \pm 2i$`, trapExplanation: r`The roots have real part $-\frac{b}{2a} = -1$. A sign was lost.` },
            { id: 'c', label: r`$z = -1 \pm 4i$`, trapExplanation: r`$\sqrt{-16} = 4i$ must still be divided by $2a = 2$.` },
          ],
          correctOptionId: 'a',
          explanation: r`$z = \frac{-2 \pm \sqrt{4 - 20}}{2} = \frac{-2 \pm 4i}{2} = -1 \pm 2i$ — a conjugate pair, as expected for real coefficients.`,
        },
      ],
    },
    {
      title: 'Summary',
      blocks: [
        {
          kind: 'text',
          text: r`• $i^2 = -1$; $z = a + bi$; divide by multiplying with the conjugate.

• $|z| = \sqrt{a^2 + b^2}$; $\arg z$ = angle, check the quadrant.

• $z = re^{i\varphi}$: multiply ⇒ moduli multiply, arguments add; $(re^{i\varphi})^n = r^ne^{in\varphi}$.

• $z^n = w$ has $n$ roots on a circle; degree-$n$ polynomials have $n$ complex roots.`,
        },
      ],
    },
  ],
  extra,
  questions: practice,
});
