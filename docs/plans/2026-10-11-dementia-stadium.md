# Homepage dementia burden scene

Replaces the former three large counters in `wiki/pages/home.html` (take
0.747–0.784). The component, stylesheet and independent module are
`wiki/components/dementia_burden.html` and `static/onetake/dementia-burden.*`.
All illustration geometry is procedural, with no image, font, CDN or runtime
network dependency. The shared footer and license remain intact.

## Evidence and conversions

- WHO snapshot: **57 million people living with dementia in 2021**, **nearly
  10 million new cases per year**, and Alzheimer disease accounting for
  **60–70% of dementia cases**.
  Source: https://www.who.int/health-topics/dementia and
  https://www.who.int/news-room/fact-sheets/detail/dementia
- Narendra Modi Stadium reference capacity: **132,000**.
  Source: https://www.bcci.tv/venues?map=1
- Snapshot comparison: 57,000,000 / 132,000 = 431.818… ≈ **432 capacities**.
- Average incidence illustration uses 10,000,000/year and 365 days/year:
  31,536,000 seconds / 10,000,000 = 3.1536 seconds/case ≈ **3.2 seconds**;
  132,000 / 10,000,000 × 365 = **4.818 days** ≈ **4.8 days**.
  This is an approximate average, not a live patient/diagnosis counter.

## Separate projection series

The left chart uses only the GBD **2019** dementia forecasting study
(Nichols et al., *The Lancet Public Health*, 2022):
https://doi.org/10.1016/S2468-2667(21)00249-8
Full text: https://pmc.ncbi.nlm.nih.gov/articles/PMC8810394/

| Year | Million people | 95% uncertainty interval | Status |
| --- | ---: | --- | --- |
| 2019 | 57.4 | 50.4–65.1 | Historical model estimate |
| 2030 | 83.2 | 73.0–94.6 | Projection |
| 2040 | 116.0 | 100.7–132.1 | Projection |
| 2050 | 152.8 | 130.8–175.9 | Projection |

The dashed connectors only connect these published milestones. Dragging
snaps to these four points; no annual observations are fabricated. The WHO
2021 snapshot is **not** a point on this GBD 2019 curve. Selecting a curve
milestone changes the stadium comparison and its source/year label; selecting
“2021 snapshot” restores the independent WHO comparison.

## Visual and interaction behavior

- Same deep background, lavender particles and coral emphasis as the biology
  scenes; an oblique bowl of seating tiers and aisles, with a schematic pitch.
- A field of small stadiums compares capacity, rather than individual seats
  representing the entire worldwide population. One small stadium represents
  132,000 people; the final stadium can be partially filled.
- Choosing a year changes the comparison; dragging the line selects published
  milestones. Buttons provide the keyboard alternative.
- “How fast does it fill?” shows one bowl. A time slider permits direct
  scrubbing and a ten-second accelerated playback fills it in approximately
  4.8 simulated days. Seat dots are grouped, not an exact seat-by-seat census.
- Playback pauses when the chapter leaves view or the tab is hidden. Reduced
  motion avoids the entrance/rotation animation and completes a requested
  playback immediately; the slider remains usable. Without canvas, a local
  inline SVG bowl remains visible; without JavaScript the chart and qualified
  snapshot/incidence text remain readable.

Scientific wording remains a draft for the team's normal publication review.

## Normal-scroll visibility correction

The original chapter interval had only about half a viewport of reading
distance, making it easy to skip in normal browsing. `burden-pacing.mjs`
now splits the shared scroll mapping at take 0.747 and 0.784 and extends
only that interval. The story's scrollable height grows by the same ratio,
preserving the scroll speed of all surrounding camera morphs and editing
steps. The new comparison has about 2.8 viewports on desktop and 2.5 on
mobile. There is no forced pause or click gate.

Both `/` and `/next` use this mapping; the residue-112 structure remains
exclusive to `/next`. Browser checks use the shared mapping instead of
duplicating old weights, verify normal wheel navigation and exit pause,
and keep their artifacts under `/private/tmp/orca-burden-pacing-review`.

Files changed for this correction: `static/onetake/burden-pacing.mjs`,
`static/onetake/onetake.js`, `static/onetake/onetake.css`,
`tests/burden_pacing.mjs`, `tests/dementia_burden_browser.mjs`,
`tests/home_biology_browser.mjs`, and this record. Shared files were patched
under the cooperative integration lock; the task's lock has been released.

Verification: 48 Python checks, the isolated 26-page build/asset audit,
reversible pacing checks, edit-replay checks and the dementia browser suite
passed. Browser navigation allows for software-WebGL startup and uses an
instant initial scroll position so CSS smooth scrolling does not interfere
with the actual wheel-navigation regression.

The live 8081 preview was holding a cached pre-drag template (zero
`data-bio-hit` elements). Restarting this task's preview with template
refreshing enabled exposed both existing hit regions. POD and CETUS were
both manually dragged and snapped in that live in-app preview; it was then
reset to the unplaced state for the user. No protein-drag source files were
changed by this task.
