import { defineLesson, r } from '../define.ts';
import { extra } from './05-trig.extra.ts';
import { practice } from './05-trig.practice.ts';

export default defineLesson({
  id: 'sm-05',
  moduleId: 'school',
  title: 'Trigonometry and the unit circle',
  blurb: 'Radians, sine and cosine of the standard angles, and the four quadrants',
  minutes: 8,
  lecture: [
    {
      title: 'Radians',
      covers: ['1', 'x1', 'x6'],
      blocks: [
        {
          kind: 'text',
          text: r`Mathematics measures angles in <i>radians</i>: the length of the arc that the angle cuts out of a circle of radius 1. A full turn is the whole circumference, $2\pi$, so`,
        },
        {
          kind: 'formula',
          tex: r`180^\circ = \pi, \qquad \text{radians} = \text{degrees}\cdot\frac{\pi}{180}, \qquad \text{arc length} = r\,\theta`,
        },
        {
          kind: 'text',
          text: r`The standard angles: $30^\circ = \frac\pi6$, $45^\circ = \frac\pi4$, $60^\circ = \frac\pi3$, $90^\circ = \frac\pi2$, $180^\circ = \pi$, $360^\circ = 2\pi$. Calculus formulas such as $(\sin x)' = \cos x$ and $\lim_{x\to0}\frac{\sin x}{x} = 1$ hold only in radians.`,
        },
        {
          kind: 'quiz',
          id: 'sm-05-q1',
          prompt: r`What is $90^\circ$ in radians?`,
          options: [
            { id: 'a', label: r`$\tfrac{\pi}{2}$`, value: Math.PI / 2 },
            { id: 'b', label: r`$\tfrac{\pi}{4}$`, value: Math.PI / 4, trapExplanation: r`$\frac\pi4$ is $45^\circ$. Half of $180^\circ = \pi$ is $\frac\pi2$.` },
            { id: 'c', label: r`$2\pi$`, value: 2 * Math.PI, trapExplanation: r`$2\pi$ is the full turn, $360^\circ$.` },
          ],
          correctOptionId: 'a',
          explanation: r`$90\cdot\frac{\pi}{180} = \frac{\pi}{2}$: a quarter of the full turn $2\pi$.`,
        },
      ],
    },
    {
      title: 'Sine and cosine on the unit circle',
      covers: ['2', 'x2', 'x3'],
      blocks: [
        {
          kind: 'text',
          text: r`Walk the angle $\theta$ anticlockwise from the positive $x$-axis around the circle of radius 1. The point you reach has coordinates $(\cos\theta, \sin\theta)$: cosine is the horizontal coordinate, sine the vertical one. Pythagoras on the right triangle gives the most used identity, and the tangent is their ratio:`,
        },
        { kind: 'formula', tex: r`\sin^2\theta + \cos^2\theta = 1, \qquad \tan\theta = \frac{\sin\theta}{\cos\theta}` },
        { kind: 'diagram', type: 'unitCircle' },
        {
          kind: 'formula',
          tex: r`\begin{array}{c|ccccc} \theta & 0 & 30^\circ & 45^\circ & 60^\circ & 90^\circ \\ \hline \sin\theta & 0 & \tfrac12 & \tfrac{\sqrt2}{2} & \tfrac{\sqrt3}{2} & 1 \\ \cos\theta & 1 & \tfrac{\sqrt3}{2} & \tfrac{\sqrt2}{2} & \tfrac12 & 0 \end{array}`,
          caption: r`Memory aid: the sines are $\frac{\sqrt0}{2}, \frac{\sqrt1}{2}, \frac{\sqrt2}{2}, \frac{\sqrt3}{2}, \frac{\sqrt4}{2}$; the cosines are the same list backwards. $\frac{\sqrt2}{2} \approx 0.707$, $\frac{\sqrt3}{2} \approx 0.866$.`,
        },
        {
          kind: 'quiz',
          id: 'sm-05-q2',
          prompt: r`What is $\sin 30^\circ$?`,
          options: [
            { id: 'a', label: r`$\tfrac12$`, value: 0.5 },
            { id: 'b', label: r`$\tfrac{\sqrt3}{2}$`, value: Math.sqrt(3) / 2, trapExplanation: r`$\frac{\sqrt3}{2}$ is $\cos 30^\circ$ (and $\sin 60^\circ$). A $30^\circ$ angle is low, so its height is small.` },
            { id: 'c', label: r`$\tfrac{\sqrt2}{2}$`, value: Math.SQRT2 / 2, trapExplanation: r`$\frac{\sqrt2}{2}$ belongs to $45^\circ$, where sine and cosine are equal.` },
          ],
          correctOptionId: 'a',
          explanation: r`$\sin 30^\circ = \frac12$: at $30^\circ$ the point on the unit circle is at height one half.`,
        },
      ],
    },
    {
      title: 'The four quadrants',
      covers: ['3', '4', '5', 'x4'],
      blocks: [
        {
          kind: 'text',
          text: r`Beyond $90^\circ$ the coordinates change sign: cosine is negative on the left half of the circle, sine on the lower half. To evaluate any angle:

• find its <i>reference angle</i>, the acute angle to the nearest part of the $x$-axis;

• take the value of the reference angle from the table;

• attach the sign of the quadrant: I $(+, +)$, II $(-, +)$, III $(-, -)$, IV $(+, -)$ for $(\cos, \sin)$.`,
        },
        {
          kind: 'example',
          title: 'Two angles outside the first quadrant',
          prompt: r`Compute $\cos 135^\circ$ and $\sin 210^\circ$.`,
          steps: [
            r`$135^\circ$ is in quadrant II, $45^\circ$ short of $180^\circ$: reference angle $45^\circ$, cosine negative there. $\cos 135^\circ = -\frac{\sqrt2}{2}$.`,
            r`$210^\circ$ is in quadrant III, $30^\circ$ past $180^\circ$: reference angle $30^\circ$, sine negative there.`,
            r`$\sin 210^\circ = -\frac12$.`,
          ],
        },
        {
          kind: 'box',
          variant: 'pitfall',
          title: 'arctan only knows two quadrants',
          text: r`$\tan\theta = \frac yx$ is the same for $(1, 1)$ and $(-1, -1)$, and $\arctan$ always answers between $-90^\circ$ and $90^\circ$. To find the angle of a point, look at the signs of $x$ and $y$ and correct by $180^\circ$ if the point is on the left. The same care is needed for the argument of a complex number.`,
        },
        {
          kind: 'quiz',
          id: 'sm-05-q3',
          prompt: r`What is the sign of $\cos 120^\circ$?`,
          options: [
            { id: 'a', label: 'Negative', value: -1 },
            { id: 'b', label: 'Positive', value: 1, trapExplanation: r`$120^\circ$ lies in quadrant II, on the left of the circle, where the $x$-coordinate is negative.` },
            { id: 'c', label: 'Zero', value: 0, trapExplanation: r`Cosine is zero only at $90^\circ$ and $270^\circ$.` },
          ],
          correctOptionId: 'a',
          explanation: r`$120^\circ$ is in quadrant II; with reference angle $60^\circ$, $\cos 120^\circ = -\frac12$.`,
        },
      ],
    },
    {
      title: 'Periodicity and symmetry',
      covers: ['6', 'x5'],
      blocks: [
        {
          kind: 'text',
          text: r`After a full turn the point is back where it started, so sine and cosine repeat every $2\pi$: $\sin(\theta + 2\pi) = \sin\theta$. Mirroring in the $x$-axis gives $\cos(-\theta) = \cos\theta$ and $\sin(-\theta) = -\sin\theta$. Because $\sin x = \frac12$ has a solution in quadrant I <i>and</i> one in quadrant II, equations like this have two solutions in every turn: $x = \frac\pi6$ and $x = \pi - \frac\pi6 = \frac{5\pi}{6}$.`,
        },
        {
          kind: 'example',
          title: 'Two solutions and a full turn',
          prompt: r`Solve $\cos x = \frac12$ for $0 \le x < 2\pi$, and compute $\sin 390^\circ$.`,
          steps: [
            r`$\cos x = \frac12$ in quadrant I: $x = \frac\pi3$ (that is $60^\circ$).`,
            r`Cosine is also positive in quadrant IV: the mirror angle $x = 2\pi - \frac\pi3 = \frac{5\pi}{3}$.`,
            r`Two solutions per turn: $\frac\pi3$ and $\frac{5\pi}{3}$.`,
            r`$390^\circ = 360^\circ + 30^\circ$, a full turn plus $30^\circ$, so $\sin 390^\circ = \sin 30^\circ = \frac12$.`,
          ],
        },
        {
          kind: 'box',
          variant: 'tip',
          title: 'Where this comes back',
          text: r`The rotation by $\theta$ is the matrix $\begin{pmatrix} \cos\theta & -\sin\theta \\ \sin\theta & \cos\theta \end{pmatrix}$; the angle between two vectors comes from $\cos\theta = \frac{\mathbf u\cdot\mathbf v}{\|\mathbf u\|\|\mathbf v\|}$ ("cosine similarity" in NLP); and complex numbers in polar form are $r(\cos\varphi + i\sin\varphi)$.`,
        },
      ],
    },
    {
      title: 'Summary',
      blocks: [
        {
          kind: 'text',
          text: r`• $180^\circ = \pi$; radians $=$ degrees $\cdot\frac{\pi}{180}$; arc length $r\theta$.

• The point at angle $\theta$ on the unit circle is $(\cos\theta, \sin\theta)$; $\sin^2\theta + \cos^2\theta = 1$, $\tan\theta = \frac{\sin\theta}{\cos\theta}$.

• Table: $\sin = \frac{\sqrt0}{2}, \frac{\sqrt1}{2}, \frac{\sqrt2}{2}, \frac{\sqrt3}{2}, \frac{\sqrt4}{2}$ at $0, 30^\circ, 45^\circ, 60^\circ, 90^\circ$; cosine backwards.

• Other angles: reference angle plus the quadrant sign; check quadrants when using $\arctan$; equations such as $\sin x = c$ have two solutions per turn.`,
        },
      ],
    },
  ],
  extra,
  questions: practice,
});
