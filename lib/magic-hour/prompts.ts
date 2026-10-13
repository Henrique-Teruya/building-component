/**
 * Specialized prompts for architectural blueprint generation.
 * Specifically tuned to preserve building geometry, floor count, facade features
 * and camera perspective while converting photo renders to high-end blueprints.
 */

export const ARCHITECTURAL_BLUEPRINT_PROMPT = `
Transform the provided architectural building image into a clean professional architectural blueprint visualization.
Use the supplied image as the only geometry reference. Trace its visible structure in place; do not generate a different building.

CRITICAL:
- Preserve the exact building geometry.
- Preserve the number and position of floors.
- Preserve windows, balconies, facade proportions and structural elements.
- Do not redesign the building.
- Do not add floors or architectural elements.
- Maintain the original camera perspective.
- Keep the building in the same frame and at the same scale. Align the roofline, floor slabs, facade edges, openings and ground line to the input image.
- When a detail is occluded or ambiguous, leave it understated instead of inventing it.
- Remove surrounding visual noise where appropriate.

STYLE:
- Premium architectural planning visualization.
- Technical blueprint / architectural CAD drawing.
- Linework only: no filled building surfaces, solid masses, facade shading, photo pixels or colored facade panels.
- Light SKR brand-blue architectural strokes (#0071e3) on a perfectly uniform pure white canvas (#ffffff), suitable for background removal.
- First identify the PRINCIPAL projecting building volumes: the large rectangular facade masses that define the building's shape. Apply the bold treatment ONLY to the left and right outer vertical corners bounding each principal volume, including shorter principal wings. For example, TWO projecting facade volumes should have FOUR bold vertical edge bundles, one pair per volume. Do not impose a two-edge limit for the whole development.
- A vertical drafting line is not automatically a volume corner. Keep facade subdivisions, panel seams, internal supports, window jambs, mullions, brise-soleil fins, balcony frames, railing posts and minor recesses THIN, even when they extend across many floors. Vegetation and surrounding objects never receive the bold treatment.
- Draw each selected principal corner as a close bundle of fine parallel blue strands forming a thick cylindrical stroke, with rounded ends and a subtle light-blue (#dbeafe) highlight across the bundle. Keep every bundle centered on its exact original volume boundary, with a combined width 6 to 8 times the fine drafting lines.
- Keep ALL interior columns, horizontal slabs, roof lines, foundations, windows, balcony railings and secondary facade details thin and precise.
- Leave all space between strokes completely blank, including window interiors, facade planes, sky and ground.
- No background grid, texture, paper shadows, gradient, border frame or checkerboard transparency pattern.
- High-end minimalist aesthetic suitable for a luxury real-estate application (SKR).
- High precision architectural linework.
- Crisp, continuous drafting lines with legible thin window and balcony details at full output resolution.
- No text, labels, logos, people, extra towers, dramatic glow or decorative objects.
`.trim();

export const ARCHITECTURAL_BLUEPRINT_NEGATIVE_PROMPT = `
photorealistic building, filled facade, solid building mass, shading, dark background, background grid, paper texture, checkerboard, glow, blurry, cartoon, sketch scribble, changed geometry, missing floors, added buildings, altered perspective, low resolution, artifacts, distorted windows, organic clutter, photorealistic trees covering facade
`.trim();
