# ORCA `#synthesis` Integration Spec (v2.1)

**Task type: integration only.** Place the four shipped figures, write the text beats below, add the five verified external rulers to `#therapeutic-window`. **No new analysis, no new statistics, no new figures.** Every number you may use is in this package; all were independently re-verified (171/171 numeric checks match — see `evidence/final-review.md`).

## Package contents

- `figures/` — 4 figure folders, each with `figure@2x.png` (place this), `figure.svg`, `figure.pdf`, `caption.md` (**use verbatim** — they carry required honesty qualifiers), `alt-text.txt`, `figure-manifest.json`.
- `data/` — the CSVs behind every number below.
- `evidence/` — `RESULTS.md` (findings report), `external-rulers.md` + `external-benchmark-values.csv` (verified citations), `final-review.md` (independent QA).

## Hard rules (carried from prior passes)

1. Use only numbers from this package. No p-values, error bars, or significance language anywhere — the source analyses computed none.
2. Captions ship with the figures; do not paraphrase away their qualifiers.
3. **The APOBEC raw-records figure is excluded by team decision.** Its numbers appear as **text only**, anchored to existing Module 3 figures.
4. Label discipline: the 2,774-site construct is **PUF10** (not PUF8). E72A has zero retained sites — its rate comparisons are **NA**, never "zero editing". Write "reporter C388 signal", not "C388 activity".
5. Anti-tone guardrails: no three-item rhetorical parallels; never open a sentence with "Notably" / "Remarkably"; ≤14 new sentences in `#synthesis` total; conclusion-first per beat.
6. Do not touch any other section. Run existing tests; ship patch + short report.

## Beat S-A — extension raises rates at the *same* sites (figures 1 + 2)

**Figure 1** `figures/shared_PUF10_PUF12_rates/` — hexbin of 2,221 jointly retained sites; PUF12 higher at 73.1% of sites (1,624/2,221); median within-site Δ **+3.02 pp**; Spearman ρ = 0.723.

Text beat (hedged wording you may adapt, keep numbers exact):

> Extension did not only add sites. At the 2,221 sites retained by both scaffolds, PUF12 showed the higher reported rate at 73.1% of them, with a median within-site increase of 3.02 percentage points.

**Figure 2** `figures/selected_count_and_shared_rate_changes/` — left panel re-normalizes the Module 1 candidate counts as % of PUF12; right panel is new: median paired rate differences vs PUF12 (132D **−18.86 pp**, n = 195, *all 195 lower*; GVE −7.92 pp, n = 300; SNE −3.27 pp, n = 3,565; PUF10 −3.02 pp, n = 2,221; E72A NA).

- **Required cross-reference:** the left panel re-uses the counts already shown in Module 1 (candidate-counts figure) — say so in one clause ("counts as in Module 1, re-normalized to PUF12") so judges do not read it as a duplicated figure.
- Text beat:

> Fewer retained sites did not certify cleaner editing: 132D kept 1.5% of PUF12's sites, and all 195 sites it shares with PUF12 were edited less (median −18.86 pp). Count reduction co-occurs with activity attenuation — site counts alone cannot certify specificity.

## Beat S-A-context — the honest answer on *where* the new sites differ (figures 3 + 4)

**Figure 3** `figures/exclusive_neighbor_composition/` — three mutually exclusive sets (PUF10-only 553 / shared 2,221 / PUF12-only 10,687); GCA is the most common central triplet in all three (39.78% / 43.40% / 41.82%); −1 G ≥ 80% everywhere.

**Figure 4** `figures/exclusive_position_difference/` — full 101-nt × 4-base difference scan; largest single difference is **−6 G, −19.78 pp**, exploratory, no multiple-testing correction (caption says this; keep it).

- **Placement:** do NOT place figure 3 adjacent to the Module 1 motif-logo figure; add one clause noting they are complementary cuts (per-group logos vs exclusive-set composition).
- Text beat:

> The 10,687 PUF12-exclusive sites did not carry a different core motif — GCA remained the dominant central context. The largest difference sat in the flanks (−6 G, −19.8 pp, exploratory). Whether extension recruits half-site matches remains unresolved; the site-level inputs needed for that test are on the missing-inputs list.

## Beat S-C — APOBEC tradeoff (**text only, no figure**)

Anchor to the existing Module 3 single-site / targeting-ratio figures ("as shown in Module 3"). Numbers (same-batch archived records, parent PUF12-9 vs triple mutant, n = 2 records each):

- C388 reporter signal 67.3% → 52.0% (**−22.8%**); C871 56.5% → 24.1% (**−57.3%**); endpoint ratio 1.192 → **2.156**.

Text beat:

> Within the archived combination batch, the triple mutant cut the +1 endpoint more than twice as deeply as the on-target signal (−57.3% vs −22.8%), lifting the C388/C871 ratio from 1.192 to 2.156.

**Formula footnote (add once, verbatim meaning):** 2.156 is the ratio of means; 0.773 is mean(C388) against the historical fixed reference 0.673. Recomputing against the observed parent-record mean 0.67335 gives 0.772 — keep **0.773** with the formula stated; never mix in the separate script's mean-of-ratios value (2.157).

## `#therapeutic-window` — five external rulers (verified; DOI/PMID in `evidence/external-rulers.md`)

| Ruler | Verified numbers you may use | Allowed framing | Banned |
|---|---|---|---|
| **R-1** Grünewald et al., *Nature* 569:433–437 (2019), DOI 10.1038/s41586-019-1161-z | WT BE3: 90,509–192,088 transcriptome-wide RNA C-to-U sites (3 reps); BE3-R33A/K34A: 7–26; inactive comparator E63Q: 7–15 | "Within one study, engineering cut RNA off-targets by orders of magnitude — the field precedent ORCA's window follows" | Cross-platform safety ranking; "eliminated risk". NB: the *Nat Biotechnol* 2019 paper is SECURE-ABE follow-up — do not cite it for BE3 |
| **R-2a** Qu et al. 2019 (LEAPER), DOI 10.1038/s41587-019-0178-z | ~37% endogenous PPIB editing in the matched transcriptome experiment (~50% in targeted assay); 5 candidate off-targets vs 6 in control | Endogenous-recruitment efficiency/off-target coordinate | Calling the 5 sites verified guide-specific edits |
| **R-2b** Abudayyeh et al. 2019 (RESCUE), DOI 10.1126/science.aax7063 | ~80% Gluc reporter editing, 188 C-to-U + 1,695 A-to-I off-targets; RESCUE-S: ~76%, 103 + 139 | Fusion-editor coordinate; engineering step RESCUE→RESCUE-S as off-target reduction precedent | Treating reporter rates as endogenous efficiency |
| **R-2c** Monian et al. 2022 (AIMer), DOI 10.1038/s41587-022-01225-1 | Up to 50% endogenous ACTB editing in nonhuman-primate liver; persistence ≥1 month | Efficiency/durability coordinate | Any global off-target total (unverified). NB: AIMer is Monian; Yi 2022 is LEAPER 2.0 circRNA — do not mix |
| **R-3** — **REMOVED** | Han et al. 2025 (DOI 10.1038/s41467-025-64748-6) is a Mef2c-L35P autism-model study with social-behaviour/survival endpoints; a 2026 Author Correction repaired Fig. 7j | If cited at all, only for what the paper actually shows | **Never** the "–80% ↔ ÷5 epilepsy-risk multiplier" — it was not verified anywhere in the paper |
| **R-4** Conroy et al. 2022, DOI 10.1038/s41467-022-33061-x | SNP4 ~20-fold, SNP6 ~7-fold allelic discrimination (HTT reporters); optimized compounds >50-fold | "One study's reporter-system example of discrimination magnitudes" | "Industry standard", "clinical threshold", "20:1 requirement" |
| **R-5** REDIportal 2017 (DOI 10.1093/nar/gkw767) / 2025 update (DOI 10.1093/nar/gkae1083); Bazak et al. 2014 (DOI 10.1101/gr.164749.113) | >4.5 M cataloged A-to-I events across 55 body sites (2017); ~16 M putative sites (2025); most selected Alu sites edited <1% of transcripts, median 0.475% | "The human transcriptome already carries millions of low-level endogenous edits — biological context for background editing" | Converting this into a safety budget for an introduced editor; attributing Bazak's fractions to the Eisenberg & Levanon review |

Allowed framing sentence (≤2 sentences, adapt but keep numbers and qualifiers):

> RNA off-targets are engineerable: within one study, BE3 variants cut transcriptome-wide RNA edits from over 90,000 sites to 26 or fewer (Grünewald et al., 2019). Endogenous-recruitment platforms report ~37–50% editing with handfuls of candidate off-targets (LEAPER; AIMer), while a fusion editor reported higher reporter rates with larger off-target sets (RESCUE) — ORCA's window sits in this landscape.

## Deliverables from you (Codex)

1. Updated `docs/dry-lab/model.md` + affected `wiki/components/model/*.html`: 4 figures placed, captions verbatim, the 2 required cross-reference clauses, text beats above integrated into `#synthesis` and `#therapeutic-window`.
2. Figures copied into the repo asset tree following existing naming conventions; no other assets touched.
3. Patch + short report; existing tests must pass. If any number in this package conflicts with what is already on the page, STOP and report — do not silently overwrite.
