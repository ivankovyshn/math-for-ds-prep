import { defineLesson, r } from '../define.ts';

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
      blocks: [
        {
          kind: 'text',
          text: r`Only two operations are needed to build all of linear algebra, and both work component by component.

• <i>Addition:</i> $(u_1, u_2) + (v_1, v_2) = (u_1 + v_1,\ u_2 + v_2)$. Geometrically: put the tail of $\mathbf{v}$ at the tip of $\mathbf{u}$; the sum goes from the start to the end.

• <i>Scalar multiplication:</i> $c\,(v_1, v_2) = (c v_1,\ c v_2)$. The arrow is stretched by $c$; a negative $c$ also flips it.`,
        },
        { kind: 'diagram', type: 'vectorAdd', caption: r`Tip to tail in either order gives the same sum: $\mathbf{u} + \mathbf{v} = \mathbf{v} + \mathbf{u}$.` },
        {
          kind: 'check',
          prompt: r`Let $\mathbf{u} = (1, -2)$ and $\mathbf{v} = (3, 4)$. What is $\mathbf{u} - 2\mathbf{v}$?`,
          answer: r`$2\mathbf{v} = (6, 8)$, so $\mathbf{u} - 2\mathbf{v} = (1 - 6,\ -2 - 8) = (-5, -10)$.`,
        },
      ],
    },
    {
      title: 'Dot product, length and angle',
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
      ],
    },
    {
      title: 'Linear combinations and span',
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
          kind: 'check',
          prompt: r`Can $(2, 4)$ and $(-1, -2)$ together reach the point $(1, 0)$?`,
          answer: r`No. $(2, 4) = -2\cdot(-1, -2)$, so both vectors lie on the line $y = 2x$ and their span is only that line. The point $(1, 0)$ is not on it.`,
        },
      ],
    },
  ],
  questions: [
    {
      id: 'la-01-1',
      difficulty: 1,
      promptText: r`Let $\mathbf{u} = (2, -1, 3)$ and $\mathbf{v} = (1, 4, -2)$. Compute $2\mathbf{u} - \mathbf{v}$.`,
      options: [
        { id: 'a', label: r`$(3, -6, 8)$`, value: [3, -6, 8] },
        { id: 'b', label: r`$(5, 2, 4)$`, value: [5, 2, 4], trapExplanation: r`This is $2\mathbf{u} + \mathbf{v}$: the minus sign in front of $\mathbf{v}$ applies to every component.` },
        { id: 'c', label: r`$(2, -10, 10)$`, value: [2, -10, 10], trapExplanation: r`This is $2(\mathbf{u} - \mathbf{v})$: the factor 2 was applied to $\mathbf{v}$ as well. Only $\mathbf{u}$ is doubled.` },
        { id: 'd', label: r`$(-3, 6, -8)$`, value: [-3, 6, -8], trapExplanation: r`This is $\mathbf{v} - 2\mathbf{u}$, the subtraction in the wrong order. It is the right answer with every sign flipped.` },
      ],
      correctOptionId: 'a',
      stepByStepSolution: [
        r`Scale first: $2\mathbf{u} = (4, -2, 6)$.`,
        r`Subtract component by component: $(4 - 1,\ -2 - 4,\ 6 - (-2))$.`,
        r`Result: $(3, -6, 8)$. Watch the last component: subtracting $-2$ adds 2.`,
      ],
      keyConceptTag: 'Vector operations are componentwise',
    },
    {
      id: 'la-01-2',
      difficulty: 1,
      promptText: r`What is the angle between $\mathbf{u} = (3, -2)$ and $\mathbf{v} = (4, 6)$?`,
      options: [
        { id: 'a', label: r`$90^\circ$`, value: 90 },
        { id: 'b', label: r`$0^\circ$`, value: 0, trapExplanation: r`An angle of $0^\circ$ would mean the vectors point the same way, i.e. one is a positive multiple of the other. $(4, 6)$ is not a multiple of $(3, -2)$.` },
        { id: 'c', label: r`$45^\circ$`, value: 45, trapExplanation: r`$45^\circ$ needs $\cos\theta = \tfrac{1}{\sqrt2}$. Compute the dot product first — here it is exactly zero.` },
        { id: 'd', label: r`$180^\circ$`, value: 180, trapExplanation: r`$180^\circ$ means opposite directions, which needs a negative dot product equal to $-\|\mathbf{u}\|\|\mathbf{v}\|$. The dot product here is 0, not negative.` },
      ],
      correctOptionId: 'a',
      stepByStepSolution: [
        r`Dot product: $3\cdot 4 + (-2)\cdot 6 = 12 - 12 = 0$.`,
        r`$\cos\theta = 0 / (\|\mathbf{u}\|\|\mathbf{v}\|) = 0$.`,
        r`$\cos\theta = 0$ gives $\theta = 90^\circ$: the vectors are orthogonal. No lengths were needed.`,
      ],
      keyConceptTag: 'Zero dot product means perpendicular',
    },
    {
      id: 'la-01-3',
      difficulty: 2,
      promptText: r`What is the length of $\mathbf{v} = (2, -3, 6)$?`,
      options: [
        { id: 'a', label: r`$7$`, value: 7 },
        { id: 'b', label: r`$5$`, value: 5, trapExplanation: r`$2 - 3 + 6 = 5$ adds the components. Length squares them first, so signs never cancel.` },
        { id: 'c', label: r`$11$`, value: 11, trapExplanation: r`$2 + 3 + 6 = 11$ adds absolute values. That is a different "length" (the taxicab norm); the usual length is $\sqrt{v_1^2 + v_2^2 + v_3^2}$.` },
        { id: 'd', label: r`$49$`, value: 49, trapExplanation: r`$49 = \mathbf{v}\cdot\mathbf{v}$ is the length <i>squared</i>. The square root is missing.` },
      ],
      correctOptionId: 'a',
      stepByStepSolution: [
        r`$\|\mathbf{v}\|^2 = 2^2 + (-3)^2 + 6^2 = 4 + 9 + 36 = 49$.`,
        r`$\|\mathbf{v}\| = \sqrt{49} = 7$.`,
        r`Squaring makes every term non-negative, so a minus sign in a component never reduces the length.`,
      ],
      keyConceptTag: 'Length is the root of the sum of squares',
    },
    {
      id: 'la-01-4',
      difficulty: 2,
      promptText: r`What is the angle between $\mathbf{u} = (1, 0, 1)$ and $\mathbf{v} = (0, 1, 1)$?`,
      options: [
        { id: 'a', label: r`$60^\circ$`, value: 60 },
        { id: 'b', label: r`$45^\circ$`, value: 45, trapExplanation: r`$45^\circ$ would need $\cos\theta = \tfrac{1}{\sqrt2}$. You probably divided by only one length, $\sqrt2$, instead of the product $\sqrt2\cdot\sqrt2 = 2$.` },
        { id: 'c', label: r`$30^\circ$`, value: 30, trapExplanation: r`$\cos 30^\circ = \tfrac{\sqrt3}{2}$, but here $\cos\theta = \tfrac12$. The values of $\sin$ and $\cos$ for $30^\circ$ and $60^\circ$ are easy to swap.` },
        { id: 'd', label: r`$90^\circ$`, value: 90, trapExplanation: r`The vectors share a non-zero third component, so the dot product is $1$, not $0$. They are not perpendicular.` },
      ],
      correctOptionId: 'a',
      stepByStepSolution: [
        r`$\mathbf{u}\cdot\mathbf{v} = 1\cdot 0 + 0\cdot 1 + 1\cdot 1 = 1$.`,
        r`$\|\mathbf{u}\| = \|\mathbf{v}\| = \sqrt{2}$, so $\cos\theta = \dfrac{1}{\sqrt2\cdot\sqrt2} = \dfrac12$.`,
        r`$\cos\theta = \tfrac12$ gives $\theta = 60^\circ$.`,
      ],
      keyConceptTag: 'Angle from the dot product',
    },
    {
      id: 'la-01-5',
      difficulty: 3,
      promptText: r`For which value of $k$ are $\mathbf{u} = (k, 2, -1)$ and $\mathbf{v} = (3, k, 4)$ orthogonal?`,
      options: [
        { id: 'a', label: r`$k = \tfrac45$`, value: 4 / 5 },
        { id: 'b', label: r`$k = -\tfrac45$`, value: -4 / 5, trapExplanation: r`The last product is $(-1)\cdot 4 = -4$, so the equation is $5k - 4 = 0$. Treating that term as $+4$ flips the sign of the answer.` },
        { id: 'c', label: r`$k = \tfrac43$`, value: 4 / 3, trapExplanation: r`This solves $3k - 4 = 0$ and drops the middle product $2\cdot k$. The unknown appears in <i>both</i> vectors, so it shows up twice in the dot product.` },
        { id: 'd', label: r`$k = 2$`, value: 2, trapExplanation: r`This solves $2k - 4 = 0$ and drops the first product $k\cdot 3$. Every pair of matching components contributes.` },
      ],
      correctOptionId: 'a',
      stepByStepSolution: [
        r`Orthogonal means $\mathbf{u}\cdot\mathbf{v} = 0$.`,
        r`$\mathbf{u}\cdot\mathbf{v} = 3k + 2k + (-1)(4) = 5k - 4$.`,
        r`$5k - 4 = 0$ gives $k = \tfrac45$.`,
      ],
      keyConceptTag: 'Orthogonality condition',
    },
    {
      id: 'la-01-6',
      difficulty: 3,
      promptText: r`Find $a$ and $b$ such that $a(1, 2) + b(1, -1) = (1, 8)$.`,
      options: [
        { id: 'a', label: r`$a = 3,\ b = -2$`, value: [3, -2] },
        { id: 'b', label: r`$a = -2,\ b = 3$`, value: [-2, 3], trapExplanation: r`The values are swapped: check $-2(1, 2) + 3(1, -1) = (1, -7)$. Always substitute back.` },
        { id: 'c', label: r`$a = 3,\ b = 2$`, value: [3, 2], trapExplanation: r`$3(1, 2) + 2(1, -1) = (5, 4)$. From $a + b = 1$ and $a = 3$ you get $b = -2$; the sign was lost.` },
        { id: 'd', label: 'No such $a$, $b$ exist', value: [], trapExplanation: r`$(1, 2)$ and $(1, -1)$ are not parallel, so together they span the whole plane: <i>every</i> vector in $\mathbb{R}^2$ is a combination of them.` },
      ],
      correctOptionId: 'a',
      stepByStepSolution: [
        r`Componentwise: $a + b = 1$ and $2a - b = 8$.`,
        r`Add the equations to eliminate $b$: $3a = 9$, so $a = 3$. Then $b = 1 - 3 = -2$.`,
        r`Check: $3(1, 2) - 2(1, -1) = (3 - 2,\ 6 + 2) = (1, 8)$. ✓`,
      ],
      keyConceptTag: 'Coefficients of a linear combination',
    },
  ],
});
