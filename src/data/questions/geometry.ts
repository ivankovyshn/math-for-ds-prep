import type { Question } from '../../types.ts';

const r = String.raw;
const PI = Math.PI;
const S3 = Math.sqrt(3);

export const geometry: Question[] = [
  {
    id: 'geo-01',
    moduleId: 'geometry',
    difficulty: 1,
    promptText: r`A cylindrical water tank has radius $r = 31\ \text{cm}$ and height $h = 1.02\ \text{m}$. Its volume is $V = \pi r^2 h$.

Roughly how many litres of water does the tank hold?`,
    svgDiagramType: 'cylinder',
    options: [
      { id: 'a', label: r`$0.3\ \ell$`, value: 0.3, trapExplanation: r`Three powers of ten too small. A tank taller than a metre obviously holds far more than a cup of water — always sanity-check the size.` },
      { id: 'b', label: r`$3\ \ell$`, value: 3, trapExplanation: r`This is what you get if you treat $1\ \ell$ as $100\,000\ \text{cm}^3$. One litre is $1000\ \text{cm}^3$ (a $10\times10\times10$ cm cube).` },
      { id: 'c', label: r`$30\ \ell$`, value: 30, trapExplanation: r`Typical slip: leaving the height as $10.2$ instead of converting $1.02\ \text{m} = 102\ \text{cm}$. All lengths must be in the same unit before multiplying.` },
      { id: 'd', label: r`$300\ \ell$`, value: 300 },
      { id: 'e', label: r`$3000\ \ell$`, value: 3000, trapExplanation: r`That would be 3 cubic metres. You probably divided by $100$ instead of $1000$ when converting $\text{cm}^3$ to litres.` },
    ],
    correctOptionId: 'd',
    stepByStepSolution: [
      r`Put everything in centimetres: $r = 31$, $h = 102$.`,
      r`Round aggressively: $r^2 \approx 30^2 = 900$ (really $961 \approx 1000$), $h \approx 100$, $\pi \approx 3$.`,
      r`$V \approx 3 \cdot 1000 \cdot 100 = 300\,000\ \text{cm}^3$.`,
      r`$1\ \ell = 1000\ \text{cm}^3$, so $V \approx 300\ \ell$. The options differ by factors of ten, so rough rounding is enough.`,
    ],
    keyConceptTag: 'Mental estimation · cm³ to litres',
  },
  {
    id: 'geo-02',
    moduleId: 'geometry',
    difficulty: 1,
    promptText: r`An aquarium is a box measuring $50\ \text{cm} \times 40\ \text{cm} \times 30\ \text{cm}$.

How many litres does it hold when full?`,
    options: [
      { id: 'a', label: r`$6\ \ell$`, value: 6, trapExplanation: r`You divided by $10\,000$. One litre is a $10\ \text{cm}$ cube: $10^3 = 1000\ \text{cm}^3$.` },
      { id: 'b', label: r`$60\ \ell$`, value: 60 },
      { id: 'c', label: r`$120\ \ell$`, value: 120, trapExplanation: r`This is the sum $50+40+30$. Volume multiplies the three edges; it does not add them.` },
      { id: 'd', label: r`$600\ \ell$`, value: 600, trapExplanation: r`You divided by $100$ — that is the factor for cm to m in <i>one</i> dimension, not for cm³ to litres.` },
      { id: 'e', label: r`$60\,000\ \ell$`, value: 60000, trapExplanation: r`That is the volume in $\text{cm}^3$, not in litres. Divide by $1000$.` },
    ],
    correctOptionId: 'b',
    stepByStepSolution: [
      r`Think in decimetres, because $1\ \text{dm}^3 = 1\ \ell$ exactly.`,
      r`$50\ \text{cm} = 5\ \text{dm}$, $40\ \text{cm} = 4\ \text{dm}$, $30\ \text{cm} = 3\ \text{dm}$.`,
      r`$V = 5 \cdot 4 \cdot 3 = 60\ \text{dm}^3 = 60\ \ell$.`,
    ],
    keyConceptTag: 'Unit conversion · dm³ = litre',
  },
  {
    id: 'geo-03',
    moduleId: 'geometry',
    difficulty: 1,
    promptText: r`A circle is inscribed in a square, touching all four sides.

What proportion of the square's area lies outside the circle (shaded)?`,
    svgDiagramType: 'circleInSquare',
    options: [
      { id: 'a', label: r`$\dfrac{\pi}{4}$`, value: PI / 4, trapExplanation: r`This is the share covered <i>by</i> the circle (about 79%). The question asks for the leftover corners.` },
      { id: 'b', label: r`$1 - \dfrac{\pi}{4}$`, value: 1 - PI / 4 },
      { id: 'c', label: r`$1 - \dfrac{\pi}{2}$`, value: 1 - PI / 2, trapExplanation: r`This is negative ($\pi/2 > 1$), so it cannot be a proportion. It comes from mixing up radius and diameter.` },
      { id: 'd', label: r`$4 - \pi$`, value: 4 - PI, trapExplanation: r`This is the shaded <i>area</i> when the side is 2, not the proportion. You still have to divide by the square's area, 4.` },
      { id: 'e', label: r`$\dfrac{\pi}{2} - 1$`, value: PI / 2 - 1, trapExplanation: r`About 57% — but the four corners are visibly small. A quick look at the picture rules this out.` },
    ],
    correctOptionId: 'b',
    stepByStepSolution: [
      r`Choose a convenient size: let the square have side $2$, so its area is $4$.`,
      r`The inscribed circle has radius $1$, so its area is $\pi$.`,
      r`Shaded area $= 4 - \pi$. As a proportion: $\dfrac{4-\pi}{4} = 1 - \dfrac{\pi}{4} \approx 21\%$.`,
      r`The result does not depend on the chosen side length: proportions are scale-free.`,
    ],
    keyConceptTag: 'Area by subtraction · proportions',
  },
  {
    id: 'geo-04',
    moduleId: 'geometry',
    difficulty: 1,
    promptText: r`The radius of a sphere is doubled.

By what factor does its volume increase?`,
    options: [
      { id: 'a', label: r`$2$`, value: 2, trapExplanation: r`Only lengths scale by 2. Volume is three-dimensional, so the factor is applied three times.` },
      { id: 'b', label: r`$4$`, value: 4, trapExplanation: r`$2^2 = 4$ is how <i>areas</i> scale (for example the sphere's surface). Volume needs one more factor of 2.` },
      { id: 'c', label: r`$6$`, value: 6, trapExplanation: r`This is $2 \cdot 3$: the exponent was multiplied instead of used as a power. It is $2^3$, not $2\cdot 3$.` },
      { id: 'd', label: r`$8$`, value: 8 },
      { id: 'e', label: r`$16$`, value: 16, trapExplanation: r`$2^4$ — one factor too many. A volume has exactly three length dimensions.` },
    ],
    correctOptionId: 'd',
    stepByStepSolution: [
      r`$V = \tfrac{4}{3}\pi r^3$. The constant $\tfrac43\pi$ does not change, only $r^3$ does.`,
      r`Replace $r$ by $2r$: $(2r)^3 = 8r^3$.`,
      r`So the volume grows by a factor of $2^3 = 8$. General rule: scaling lengths by $k$ scales areas by $k^2$ and volumes by $k^3$.`,
    ],
    keyConceptTag: 'Scaling laws · k, k², k³',
  },
  {
    id: 'geo-05',
    moduleId: 'geometry',
    difficulty: 2,
    promptText: r`The picture shows an equilateral triangle with side length $2$ and three circular arcs of radius $1$, each centred at a vertex.

What is the area of the shaded region in the middle?`,
    svgDiagramType: 'triangleArcs',
    options: [
      { id: 'a', label: r`$\sqrt{3} - \pi$`, value: S3 - PI, trapExplanation: r`Negative, so impossible. The three sectors are $60^\circ$ each: together half a circle, not a full one.` },
      { id: 'b', label: r`$\sqrt{3} - \dfrac{\pi}{2}$`, value: S3 - PI / 2 },
      { id: 'c', label: r`$\sqrt{3} - \dfrac{\pi}{3}$`, value: S3 - PI / 3, trapExplanation: r`You removed only two of the three sectors. Each corner removes $\pi/6$; three corners remove $\pi/2$.` },
      { id: 'd', label: r`$2\sqrt{3} - \dfrac{\pi}{2}$`, value: 2 * S3 - PI / 2, trapExplanation: r`The triangle's area is $\tfrac12\cdot 2\cdot\sqrt3 = \sqrt3$. The factor $\tfrac12$ in "half base times height" was dropped.` },
      { id: 'e', label: r`$\sqrt{3} - \dfrac{\pi}{6}$`, value: S3 - PI / 6, trapExplanation: r`Only one sector was subtracted. There is one sector at each of the three vertices.` },
    ],
    correctOptionId: 'b',
    stepByStepSolution: [
      r`Shaded region = triangle minus the three corner sectors.`,
      r`Triangle: height $\sqrt{2^2-1^2} = \sqrt3$, so area $= \tfrac12\cdot 2\cdot\sqrt3 = \sqrt3$.`,
      r`Each sector has radius $1$ and angle $60^\circ$, i.e. $\tfrac16$ of a unit circle: area $\tfrac{\pi}{6}$.`,
      r`Three sectors: $3\cdot\tfrac{\pi}{6} = \tfrac{\pi}{2}$ (the angles of a triangle add to $180^\circ$ — half a circle).`,
      r`Shaded area $= \sqrt3 - \tfrac{\pi}{2} \approx 0.16$.`,
    ],
    keyConceptTag: 'Composite figures · sectors',
  },
  {
    id: 'geo-06',
    moduleId: 'geometry',
    difficulty: 2,
    promptText: r`A sphere fits exactly inside a cylinder: it touches the side wall, the top and the bottom.

What fraction of the cylinder's volume does the sphere occupy?`,
    svgDiagramType: 'sphereInCylinder',
    options: [
      { id: 'a', label: r`$\dfrac{1}{3}$`, value: 1 / 3, trapExplanation: r`$\tfrac13$ is the fraction for a <i>cone</i> inside a cylinder with the same base and height.` },
      { id: 'b', label: r`$\dfrac{1}{2}$`, value: 1 / 2, trapExplanation: r`The height is $2r$, which turns $\tfrac43$ into $\tfrac23$, not into $\tfrac12$. Write out both volumes before simplifying.` },
      { id: 'c', label: r`$\dfrac{2}{3}$`, value: 2 / 3 },
      { id: 'd', label: r`$\dfrac{3}{4}$`, value: 3 / 4, trapExplanation: r`This is $\tfrac43$ upside down — it appears when the cylinder's height is taken as $r$ and the ratio is inverted.` },
      { id: 'e', label: r`$\dfrac{\pi}{4}$`, value: PI / 4, trapExplanation: r`$\tfrac{\pi}{4}$ is the 2D answer (circle in a square). In 3D the $\pi$ cancels completely.` },
    ],
    correctOptionId: 'c',
    stepByStepSolution: [
      r`Let the sphere have radius $r$. Then the cylinder has radius $r$ and height $2r$.`,
      r`$V_{\text{sphere}} = \tfrac43\pi r^3$ and $V_{\text{cyl}} = \pi r^2\cdot 2r = 2\pi r^3$.`,
      r`Ratio: $\dfrac{\tfrac43\pi r^3}{2\pi r^3} = \dfrac{2}{3}$. Both $\pi$ and $r^3$ cancel — the answer is a pure number.`,
    ],
    keyConceptTag: 'Volume ratios · inscribed solids',
  },
  {
    id: 'geo-07',
    moduleId: 'geometry',
    difficulty: 2,
    promptText: r`A spherical balloon has a diameter of $60\ \text{cm}$. The volume of a sphere is $V = \tfrac{4}{3}\pi r^3$.

Roughly how many litres of air does it contain?`,
    options: [
      { id: 'a', label: r`$11\ \ell$`, value: 11, trapExplanation: r`Right digits, wrong power of ten: $113\,000\ \text{cm}^3$ is $113\ \ell$, because $1\ \ell = 1000\ \text{cm}^3$.` },
      { id: 'b', label: r`$36\ \ell$`, value: 36, trapExplanation: r`This is $\tfrac43 \cdot 27$ — the factor $\pi \approx 3$ was forgotten.` },
      { id: 'c', label: r`$110\ \ell$`, value: 110 },
      { id: 'd', label: r`$900\ \ell$`, value: 900, trapExplanation: r`The classic trap: using the diameter $60$ as the radius. That inflates the answer by $2^3 = 8$.` },
      { id: 'e', label: r`$1100\ \ell$`, value: 1100, trapExplanation: r`More than a cubic metre of air in a 60 cm balloon is impossible — the balloon fits inside a $60$ cm box of $216\ \ell$. You divided by 100 instead of 1000.` },
    ],
    correctOptionId: 'c',
    stepByStepSolution: [
      r`Radius is half the diameter: $r = 30\ \text{cm} = 3\ \text{dm}$.`,
      r`Work in decimetres so the result is directly in litres: $r^3 = 27$.`,
      r`$\tfrac43\pi \approx 4.2$, so $V \approx 4.2\cdot 27 \approx 113\ \text{dm}^3$.`,
      r`$V \approx 110\ \ell$.`,
    ],
    keyConceptTag: 'Mental estimation · sphere volume',
  },
  {
    id: 'geo-08',
    moduleId: 'geometry',
    difficulty: 2,
    promptText: r`A regular hexagon is inscribed in a circle of radius $1$.

What proportion of the circle's area is covered by the hexagon?`,
    svgDiagramType: 'hexagonInCircle',
    options: [
      { id: 'a', label: r`$\dfrac{2}{\pi}$`, value: 2 / PI, trapExplanation: r`$\tfrac{2}{\pi}$ is the answer for an inscribed <i>square</i> (area 2). A hexagon fills more of the circle.` },
      { id: 'b', label: r`$\dfrac{3}{\pi}$`, value: 3 / PI, trapExplanation: r`This is the ratio of the <i>perimeters</i> ($6$ to $2\pi$), not of the areas.` },
      { id: 'c', label: r`$\dfrac{3\sqrt{3}}{2\pi}$`, value: (3 * S3) / (2 * PI) },
      { id: 'd', label: r`$\dfrac{\sqrt{3}}{2}$`, value: S3 / 2, trapExplanation: r`$\tfrac{\sqrt3}{2}$ is the height of one small triangle — a length, not the area ratio.` },
      { id: 'e', label: r`$\dfrac{3\sqrt{3}}{\pi}$`, value: (3 * S3) / PI, trapExplanation: r`Greater than 1, which is impossible for a shape inside the circle. The $\tfrac12$ in the triangle area was dropped.` },
    ],
    correctOptionId: 'c',
    stepByStepSolution: [
      r`Join the centre to the six vertices: the hexagon splits into 6 equilateral triangles with side $1$.`,
      r`One such triangle has area $\tfrac12\cdot 1\cdot\tfrac{\sqrt3}{2} = \tfrac{\sqrt3}{4}$.`,
      r`Hexagon: $6\cdot\tfrac{\sqrt3}{4} = \tfrac{3\sqrt3}{2} \approx 2.6$.`,
      r`Circle: $\pi$. Proportion: $\dfrac{3\sqrt3}{2\pi} \approx 83\%$.`,
    ],
    keyConceptTag: 'Decomposition into triangles',
  },
  {
    id: 'geo-09',
    moduleId: 'geometry',
    difficulty: 3,
    promptText: r`A square has side length $2$. Two quarter-circles of radius $2$ are drawn inside it, centred at two opposite corners. Their overlap is shaded.

What proportion of the square is shaded?`,
    svgDiagramType: 'lensInSquare',
    options: [
      { id: 'a', label: r`$\dfrac{\pi}{4}$`, value: PI / 4, trapExplanation: r`This is the share of <i>one</i> quarter-circle. The lens is only the part that belongs to both.` },
      { id: 'b', label: r`$\dfrac{\pi}{2} - 1$`, value: PI / 2 - 1 },
      { id: 'c', label: r`$\pi - 2$`, value: PI - 2, trapExplanation: r`Greater than 1 — impossible for a proportion. This comes from dividing the lens area $2\pi - 4$ by $2$ instead of by the square's area $4$.` },
      { id: 'd', label: r`$1 - \dfrac{\pi}{4}$`, value: 1 - PI / 4, trapExplanation: r`This is one of the two unshaded corner pieces (square minus one quarter-circle), not the lens.` },
      { id: 'e', label: r`$\dfrac{\pi - 2}{4}$`, value: (PI - 2) / 4, trapExplanation: r`This is half of the lens: one circular segment on one side of the diagonal. The lens consists of two of them.` },
    ],
    correctOptionId: 'b',
    stepByStepSolution: [
      r`Inclusion–exclusion: add the two quarter-circles. Everything in the square is covered at least once and the lens exactly twice.`,
      r`So: quarter + quarter $=$ square $+$ lens.`,
      r`Each quarter-circle has area $\tfrac14\pi\cdot 2^2 = \pi$. The square has area $4$.`,
      r`Lens $= 2\pi - 4$. Proportion: $\dfrac{2\pi-4}{4} = \dfrac{\pi}{2} - 1 \approx 57\%$.`,
    ],
    keyConceptTag: 'Inclusion–exclusion for areas',
  },
  {
    id: 'geo-10',
    moduleId: 'geometry',
    difficulty: 3,
    promptText: r`In a circle of radius $6$, a chord subtends an angle of $60^\circ$ at the centre.

What is the area of the shaded segment between the chord and the arc?`,
    svgDiagramType: 'segment',
    options: [
      { id: 'a', label: r`$6\pi - 9\sqrt{3}$`, value: 6 * PI - 9 * S3 },
      { id: 'b', label: r`$6\pi - 18\sqrt{3}$`, value: 6 * PI - 18 * S3, trapExplanation: r`Negative, so impossible. The triangle's area is $\tfrac12 ab\sin C$; the $\tfrac12$ was left out.` },
      { id: 'c', label: r`$12\pi - 9\sqrt{3}$`, value: 12 * PI - 9 * S3, trapExplanation: r`$60^\circ$ is $\tfrac16$ of a full turn, not $\tfrac13$. The sector is $\tfrac{36\pi}{6} = 6\pi$.` },
      { id: 'd', label: r`$6\pi - 9$`, value: 6 * PI - 9, trapExplanation: r`$\sin 60^\circ = \tfrac{\sqrt3}{2}$, not $\tfrac12$ (that is $\sin 30^\circ$).` },
      { id: 'e', label: r`$36\pi - 9\sqrt{3}$`, value: 36 * PI - 9 * S3, trapExplanation: r`You subtracted the triangle from the <i>whole</i> circle. Only the $60^\circ$ sector is involved.` },
    ],
    correctOptionId: 'a',
    stepByStepSolution: [
      r`Segment = sector minus the triangle formed by the two radii and the chord.`,
      r`Sector: $\tfrac{60}{360}\cdot\pi\cdot 6^2 = 6\pi$.`,
      r`Two sides of length 6 with a $60^\circ$ angle between them form an equilateral triangle: area $\tfrac{\sqrt3}{4}\cdot 6^2 = 9\sqrt3$.`,
      r`Segment $= 6\pi - 9\sqrt3 \approx 18.8 - 15.6 = 3.3$.`,
    ],
    keyConceptTag: 'Circular segment = sector − triangle',
  },
  {
    id: 'geo-11',
    moduleId: 'geometry',
    difficulty: 3,
    promptText: r`A conical glass (pointing downwards) is filled with water up to half of its height.

What fraction of the glass's total volume is filled?`,
    svgDiagramType: 'coneHalf',
    options: [
      { id: 'a', label: r`$\dfrac{1}{2}$`, value: 1 / 2, trapExplanation: r`Half the height is not half the volume: the lower part of a cone is much narrower than the upper part.` },
      { id: 'b', label: r`$\dfrac{1}{3}$`, value: 1 / 3, trapExplanation: r`$\tfrac13$ is the constant in the cone formula $V=\tfrac13\pi r^2h$; it cancels when you compare two cones.` },
      { id: 'c', label: r`$\dfrac{1}{4}$`, value: 1 / 4, trapExplanation: r`$\left(\tfrac12\right)^2$ accounts for the smaller base area only. The height is halved as well, giving one more factor $\tfrac12$.` },
      { id: 'd', label: r`$\dfrac{1}{6}$`, value: 1 / 6, trapExplanation: r`This multiplies $\tfrac12$ by the formula's $\tfrac13$ — two unrelated numbers. Compare the two cones by similarity instead.` },
      { id: 'e', label: r`$\dfrac{1}{8}$`, value: 1 / 8 },
    ],
    correctOptionId: 'e',
    stepByStepSolution: [
      r`The water forms a small cone that is <i>similar</i> to the whole glass, with every length scaled by $\tfrac12$.`,
      r`Its height is $\tfrac12 h$ and, by similar triangles, its radius is $\tfrac12 r$.`,
      r`Volumes scale with the cube of the length factor: $\left(\tfrac12\right)^3 = \tfrac18$.`,
      r`So a glass "half full by height" contains only $12.5\%$ of its capacity.`,
    ],
    keyConceptTag: 'Similarity · cube law',
  },
  {
    id: 'geo-12',
    moduleId: 'geometry',
    difficulty: 3,
    promptText: r`A straight water pipe has an inner diameter of $20\ \text{cm}$ and is $16\ \text{m}$ long.

Roughly how many litres of water does the pipe hold?`,
    options: [
      { id: 'a', label: r`$160\ \ell$`, value: 160, trapExplanation: r`This is $r^2\cdot L$ without the factor $\pi \approx 3$.` },
      { id: 'b', label: r`$500\ \ell$`, value: 500 },
      { id: 'c', label: r`$2000\ \ell$`, value: 2000, trapExplanation: r`You used the diameter as the radius. Because the radius is squared, that makes the answer 4 times too big.` },
      { id: 'd', label: r`$5000\ \ell$`, value: 5000, trapExplanation: r`A power-of-ten slip in the conversion: $500\,000\ \text{cm}^3 = 500\ \ell$, since $1\ \ell = 1000\ \text{cm}^3$.` },
      { id: 'e', label: r`$50\,000\ \ell$`, value: 50000, trapExplanation: r`That is 50 cubic metres — the content of a swimming pool, not of a 20 cm pipe.` },
    ],
    correctOptionId: 'b',
    stepByStepSolution: [
      r`Use decimetres so the answer is in litres: $r = 10\ \text{cm} = 1\ \text{dm}$, $L = 16\ \text{m} = 160\ \text{dm}$.`,
      r`$V = \pi r^2 L = \pi\cdot 1^2\cdot 160 \approx 3.14\cdot 160$.`,
      r`$V \approx 500\ \text{dm}^3 = 500\ \ell$.`,
    ],
    keyConceptTag: 'Mental estimation · mixed units',
  },
];
