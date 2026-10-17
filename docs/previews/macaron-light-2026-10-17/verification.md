# Macaron light-page navigation

Live source changed: `static/menu-refinements.css` and `static/wiki.js`.

Light nodes derive pastel surfaces from the existing chapter hue variables with 32% base-color / 68% warm-white mixing, 22% sheen color and white highlights. Edges are slightly deeper than the milkier fills; glyphs remain readable dark slate. Hover/focus/current states use a stronger 42% pastel blend with a restrained glow. Light strands and bonds use mist lavender-gray (#AAA9C8) with pale lavender halo (#EBEAF8); arrival particles follow the actual stroke color. Dark Home's CSS treatment and particle strand color are preserved. Existing geometry and cutouts remain.

Checks: 22 existing Wiki tests passed; JS syntax and diff whitespace checks passed. Browser computed pastel gradients, lighter glow, lavender-gray line and six Wet Lab cutouts. Current Education page refreshed for user review. Screenshot: `navigation.png`. These changes are in live source, not confined to a preview.
