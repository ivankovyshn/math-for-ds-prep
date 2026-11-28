import { defineLesson, r } from '../define.ts';
import { extra } from './01-vectors.extra.ts';
import { practice } from './01-vectors.practice.ts';

export default defineLesson({
  id: 'la-01',
  moduleId: 'linalg',
  title: 'Vectors and linear combinations',
  blurb: 'Arrows and lists of numbers, dot product, span',
  minutes: 7,
  lecture: [
    {
      title: 'Two faces of a vector',
      blocks: [
        {
          kind: 'text',
          text: r`Linear algebra starts with one object seen in two ways. Geometrically, a <i>vector</i> is an arrow: it has a length and a direction, and it does not care where it starts. Algebraically, it is an ordered list of numbers — its <i>components</i>.

The arrow from the origin to the point $(3, 2)$ <i>is</i> the vector $\mathbf{v} = (3, 2)$. In three dimensions you need three numbers, in $n$ dimensions $n$ numbers. The set of all such lists is called $\mathbb{R}^n$.`,
        },
        {
          kind: 'formula',
          tex: r`\mathbf{v} = \begin{pmatrix} v_1 \\ v_2 \\ \vdots \\ v_n \end{pmatrix} \in \mathbb{R}^n`,
          caption: 'By convention vectors are written as columns.',
        },
        {
          kind: 'box',
          variant: 'tip',
          title: 'Why both pictures matter',
          text: r`The arrow picture gives intuition in 2D and 3D. The list picture works in any dimension — a customer described by 50 features is a vector in $\mathbb{R}^{50}$. Every rule you learn is designed so that both pictures agree.`,
        },
      ],
    },
    {
      title: 'Adding and scaling',
      covers: ['1', 'x1', 'x2'],
      blocks: [
        {
          kind: 'text',
          text: r`Only two operations are needed to build all of linear algebra, and both work component by component.

• <i>Addition:</i> $(u_1, u_2) + (v_1, v_2) = (u_1 + v_1,\ u_2 + v_2)$. Geometrically: put the tail of $\mathbf{v}$ at the tip of $\mathbf{u}$; the sum goes from the start to the end.

• <i>Scalar multiplication:</i> $c\,(v_1, v_2) = (c v_1,\ c v_2)$. The arrow is stretched by $c$; a negative $c$ also flips it.`,
        },
        { kind: 'diagram', type: 'vectorAdd', caption: r`Tip to tail in either order gives the same sum: $\mathbf{u} + \mathbf{v} = \mathbf{v} + \mathbf{u}$.` },
        {
          kind: 'quiz',
          id: 'la-01-q1',
          prompt: r`Let $\mathbf{u} = (1, -2)$ and $\mathbf{v} = (3, 4)$. What is $\mathbf{u} - 2\mathbf{v}$?`,
          options: [
            { id: 'a', label: r`$(-5, -10)$`, value: [-5, -10] },
            { id: 'b', label: r`$(-2, -6)$`, value: [-2, -6], trapExplanation: r`That is $\mathbf{u} - \mathbf{v}$: the factor 2 was not applied to $\mathbf{v}$.` },
            { id: 'c', label: r`$(7, 6)$`, value: [7, 6], trapExplanation: r`That is $\mathbf{u} + 2\mathbf{v}$. The minus sign applies to every component of $2\mathbf{v}$.` },
          ],
          correctOptionId: 'a',
          explanation: r`$2\mathbf{v} = (6, 8)$, so $\mathbf{u} - 2\mathbf{v} = (1 - 6,\ -2 - 8) = (-5, -10)$.`,
        },
      ],
    },
    {
      title: 'Dot product, length and angle',
      covers: ['2', '3', '4', '5', 'x3', 'x4', 'x5'],
      blocks: [
        {
          kind: 'text',
          text: r`The <i>dot product</i> turns two vectors into one number: multiply matching components and add.`,
        },
        { kind: 'formula', tex: r`\mathbf{u}\cdot\mathbf{v} = u_1v_1 + u_2v_2 + \dots + u_nv_n` },
        {
          kind: 'text',
          text: r`From it come length and angle. The length (norm) of a vector is Pythagoras in disguise, $\|\mathbf{v}\| = \sqrt{\mathbf{v}\cdot\mathbf{v}}$, and the angle $\theta$ between two non-zero vectors satisfies`,
        },
        { kind: 'formula', tex: r`\cos\theta = \frac{\mathbf{u}\cdot\mathbf{v}}{\|\mathbf{u}\|\,\|\mathbf{v}\|}` },
        {
          kind: 'box',
          variant: 'theorem',
          title: 'Orthogonality',
          text: r`$\mathbf{u}$ and $\mathbf{v}$ are perpendicular (orthogonal) exactly when $\mathbf{u}\cdot\mathbf{v} = 0$. The sign of the dot product tells you more: positive means an acute angle, negative an obtuse one.`,
        },
        {
          kind: 'example',
          title: 'An angle in 3D',
          prompt: r`Find the angle between $\mathbf{u} = (1, 2, 2)$ and $\mathbf{v} = (2, 0, 0)$.`,
          steps: [
            r`Dot product: $1\cdot 2 + 2\cdot 0 + 2\cdot 0 = 2$.`,
            r`Lengths: $\|\mathbf{u}\| = \sqrt{1 + 4 + 4} = 3$ and $\|\mathbf{v}\| = 2$.`,
            r`$\cos\theta = \dfrac{2}{3\cdot 2} = \dfrac{1}{3}$, so $\theta = \arccos\tfrac13 \approx 70.5^\circ$.`,
          ],
        },
        {
          kind: 'box',
          variant: 'pitfall',
          title: 'Length is not a sum',
          text: r`$\|(3, -4)\| = \sqrt{9 + 16} = 5$, not $3 + 4 = 7$ and not $3 - 4 = -1$. Square, add, then take the root.`,
        },
        {
          kind: 'quiz',
          id: 'la-01-q2',
          prompt: r`Compute $(1, 2) \cdot (3, -1)$.`,
          options: [
            { id: 'a', label: '$1$', value: 1 },
            { id: 'b', label: r`$(3, -2)$`, value: [3, -2], trapExplanation: r`The products of the components must also be added: the dot product is a number.` },
            { id: 'c', label: '$5$', value: 5, trapExplanation: r`$2 \cdot (-1) = -2$, so the sum is $3 - 2$, not $3 + 2$.` },
          ],
          correctOptionId: 'a',
          explanation: r`$1 \cdot 3 + 2 \cdot (-1) = 3 - 2 = 1$.`,
        },
      ],
    },
    {
      title: 'Linear combinations and span',
      covers: ['6', 'x6'],
      blocks: [
        {
          kind: 'text',
          text: r`Put both operations together and you get the central idea of the subject. A <i>linear combination</i> of $\mathbf{v}_1, \dots, \mathbf{v}_k$ is any vector of the form`,
        },
        { kind: 'formula', tex: r`c_1\mathbf{v}_1 + c_2\mathbf{v}_2 + \dots + c_k\mathbf{v}_k, \qquad c_i \in \mathbb{R}` },
        {
          kind: 'box',
          variant: 'definition',
          title: 'Span',
          text: r`The <i>span</i> of a set of vectors is the set of all their linear combinations: everything you can reach using only "stretch" and "add".`,
        },
        {
          kind: 'text',
          text: r`• One non-zero vector spans a line through the origin.

• Two vectors in $\mathbb{R}^2$ that are not parallel span the whole plane.

• Two parallel vectors span only a line — the second adds nothing new.`,
        },
        { kind: 'diagram', type: 'linearCombo', caption: r`Reaching $\mathbf{w} = (5, 1)$ with $\mathbf{v}_1 = (1, 1)$ and $\mathbf{v}_2 = (1, -1)$: three steps along $\mathbf{v}_1$, two along $\mathbf{v}_2$.` },
        {
          kind: 'example',
          title: 'Finding the coefficients',
          prompt: r`Write $\mathbf{w} = (5, 1)$ as $a(1, 1) + b(1, -1)$.`,
          steps: [
            r`Compare components: $a + b = 5$ and $a - b = 1$.`,
            r`Add the equations: $2a = 6$, so $a = 3$. Then $b = 5 - 3 = 2$.`,
            r`Check: $3(1, 1) + 2(1, -1) = (3 + 2,\ 3 - 2) = (5, 1)$. ✓`,
          ],
        },
        {
          kind: 'text',
          text: r`Notice what just happened: a question about vectors became a <i>system of linear equations</i>. That is the next lesson.`,
        },
      ],
    },
    {
      title: 'Summary',
      blocks: [
        {
          kind: 'formula',
          tex: r`\begin{aligned} \mathbf{u}+\mathbf{v} &= (u_1+v_1, \dots, u_n+v_n) \\ c\mathbf{v} &= (cv_1, \dots, cv_n) \\ \mathbf{u}\cdot\mathbf{v} &= \textstyle\sum_i u_iv_i \\ \|\mathbf{v}\| &= \sqrt{\mathbf{v}\cdot\mathbf{v}} \\ \cos\theta &= \dfrac{\mathbf{u}\cdot\mathbf{v}}{\|\mathbf{u}\|\|\mathbf{v}\|} \end{aligned}`,
        },
        {
          kind: 'text',
          text: r`• $\mathbf{u}\cdot\mathbf{v} = 0$ means perpendicular.

• Span = every linear combination. Two non-parallel vectors span $\mathbb{R}^2$.

• Finding coefficients of a linear combination = solving a linear system.`,
        },
        {
          kind: 'quiz',
          id: 'la-01-q3',
          prompt: r`Can $(2, 4)$ and $(-1, -2)$ together reach the point $(1, 0)$?`,
          options: [
            { id: 'a', label: r`No: both lie on the line $y = 2x$` },
            { id: 'b', label: r`Yes: two vectors in the plane always span it`, trapExplanation: r`Only two <i>independent</i> vectors span the plane. Here $(2, 4) = -2 \cdot (-1, -2)$.` },
            { id: 'c', label: r`Yes, but only with negative coefficients`, trapExplanation: r`Any combination $a(2, 4) + b(-1, -2) = (2a - b)(1, 2)$ stays on the line $y = 2x$, whatever the signs.` },
          ],
          correctOptionId: 'a',
          explanation: r`$(2, 4) = -2\cdot(-1, -2)$, so both vectors lie on the line $y = 2x$ and their span is only that line. The point $(1, 0)$ is not on it.`,
        },
      ],
    },
  ],
  extra,
  questions: practice,
});
