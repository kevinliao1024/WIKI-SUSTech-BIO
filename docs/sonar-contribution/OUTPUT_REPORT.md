# SONAR Contribution implementation report

Review branch: `codex/sonar-contribution` in `pdx12320/WIKI_SUSTech-BIO`.
Baseline: `2cc2d5a450d2be9c48ae563bcd2c613bc6c3fd84` (main).
Canonical route: `/project-contribution-sonar`, under Project → Contribution → SONAR.
No main merge or production Wiki deployment is included.

## Delivered

- Existing Flask/Jinja/Markdown page shell with navigation, directory and footer retained.
- Five tutorial subsections, Getting Started, Going Further, Adapting SONAR and Resources.
- Five separate static JS modules: Sequence Playground, Inside the Reporter, Flow Cytometry Playground, Explore SONAR Layers, Project Fit Guide.
- Flow supports real event plots, source gates, teaching rectangle drag, keyboard numeric bounds, reset and a disclosed full-reference handoff to Layers.
- Eight genuine SAP 1.3.1 screenshots embedded with captions and original-size links.
- Four source protocol PDFs plus Markdown; computational Universal Reporter GenBank; file checksums.
- Approved S7 teaching subset with exact original-event IDs, source FCS hashes, full-source counts and frozen engine statistics. No raw FCS files are bundled.
- All sharing authorized explicitly by the requesting human user after the concrete preview and review package.

## Scientific boundaries

The software sequence example is not a physical clone. RP01/RP02 historical vector
lengths are not relabeled as the current computational vector. Flow and Layer Explorer
use S7_50B; SAP screenshots use S7_90B (corrected 75% AC mass). RAS is the ratio of
paired corrected linear sums. RES is AC DNA mass equivalent, not RNA editing percent;
weak/boundary support, exploratory calibration and lack of routine qualification are
shown. No numeric PER is supplied. Mock tails are not presented as real reporter scores.

## Verification

- Python Wiki suite and SONAR-specific route/resource checks.
- Node sequence orientation/indexing, reporter states, real subset gating, ratio-of-sums edge cases, incompatible context and six fit scenarios.
- Independent source check: all 4,000 displayed events and masks match original FCS; full counts match; applicable RAS/RES difference < 1e-12.
- Real Chrome interactions at 1440/768/390/320px, keyboard/reset, invalid and empty gates, missing-data and no-JS fallback, mobile touch and no page overflow.
- Frozen-Flask export to isolated destination; audit_build zero issues; static-page browser interactions validated.
- git diff --check and scoped change review.

Exact run outcomes are recorded with the PR. The remaining deployment items are the
iGEM media-host mapping and final scientific/attribution review; see OPEN_ITEMS.md.
