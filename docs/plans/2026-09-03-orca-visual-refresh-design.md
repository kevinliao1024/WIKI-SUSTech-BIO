# ORCA Visual Refresh Design

## Goal

Replace the visible REWIRE branding with ORCA and align the wiki with the
team's initial homepage artwork without embedding or copying that artwork.

## Visual direction

The site becomes an **ORCA ocean-current editorial**. The homepage begins in a
deep ink-violet ocean framed by abstract whale-pod, current, bubble and coral
motifs. A curved white current opens into the scientific story below. Inner
pages retain the same palette with less ornament so tables and evidence labels
remain easy to read.

The reference palette is translated into CSS tokens:

- Abyss ink: `#090819`
- Deep indigo: `#30336B`
- Current blue: `#5759C7`
- Orca periwinkle: `#8D91EF`
- Pale lavender: `#D5D6FA`
- Coral: `#FB8E9D`
- White: `#FFFFFF`

Georgia remains the display face. Body copy uses a local geometric sans-serif
stack approximating Futura without requesting external font files.

## Homepage composition

The opening viewport centers `ORCA` and the expansion “On-target RNA Correction
for Alzheimer’s Disease”. Abstract CSS/SVG ornament frames, rather than covers,
the heading. A pod follows the upper current while coral accents anchor the
sides. The existing memory narrative follows inside the widening white current,
preserving the dry-lab links and evidence-aware copy.

Decorative SVG is inline, marked `aria-hidden="true"`, and contains no external
assets. Existing intentional scientific-art slots remain placeholders for later
team-approved uploads to iGEM infrastructure.

## Branding boundary

Visible project branding changes to ORCA in navigation, page metadata, homepage,
footer and accessibility labels. Literal source-repository paths containing
`REWIRE` remain unchanged because they are real paths required for reproducible
links and commands; they are not treated as the current project name.

## Accessibility and motion

The white/ink, lavender/ink and coral/ink combinations must remain legible.
Decorative elements do not enter the accessibility tree. The page remains fully
visible without JavaScript, reduced-motion mode disables animation, and mobile
layouts avoid horizontal overflow.

## Verification

- Unit tests assert ORCA branding and reject visible legacy branding.
- Unit tests assert the new palette tokens and homepage visual primitives.
- Frozen-Flask build and repository audit remain green.
- Playwright checks desktop, mobile, reduced-motion and no-JavaScript layouts.
- Desktop and mobile screenshots are inspected visually.

No commit or push is made, per the user's existing instruction.
