/**
 * Specialized prompts for architectural blueprint generation.
 * Specifically tuned to preserve building geometry, floor count, facade features
 * and camera perspective while converting photo renders to high-end blueprints.
 */

export const ARCHITECTURAL_BLUEPRINT_PROMPT = `
Transform the provided architectural building image into a clean professional architectural blueprint visualization.

CRITICAL:
- Preserve the exact building geometry.
- Preserve the number and position of floors.
- Preserve windows, balconies, facade proportions and structural elements.
- Do not redesign the building.
- Do not add floors or architectural elements.
- Maintain the original camera perspective.
- Remove surrounding visual noise where appropriate.

STYLE:
- Premium architectural planning visualization.
- Technical blueprint / architectural CAD drawing.
- Fine white and cyan structural linework on deep architectural blueprint background.
- Subtle construction measurement grid, level markers, and precision drafting lines.
- Clean background with subtle drafting paper texture.
- High-end minimalist aesthetic suitable for a luxury real-estate application (SKR).
- High precision architectural linework.
`.trim();

export const ARCHITECTURAL_BLUEPRINT_NEGATIVE_PROMPT = `
photorealistic building, blurry, cartoon, sketch scribble, changed geometry, missing floors, added buildings, altered perspective, low resolution, artifacts, distorted windows, organic clutter, photorealistic trees covering facade
`.trim();
