# Module 3 | Design–Build–Test–Learn

## Engineering objective

Improve the preference of the Pro.hA1 RNA editor for APOE4 c.388 (GCG) over c.871 (GCA), while retaining useful on-target activity. We kept the existing joint target of **+1 ratio ≥2.0 and activity retention ≥0.70**. Ratios, parental normalization and missing-value rules were held consistent within each assay batch.

This record organizes the project's decisions and feedback. Computational sampling, experimental batches and later retrospective checks are identified separately; they are not treated as equivalent replicates.

## Cycle 1 | From structural hypotheses to single substitutions

**Design.** We asked whether contacts around the downstream RNA base could identify substitutions that favour GCG over GCA. PUF–APOBEC RNA editors and context-engineered deaminases provided the starting rationale, while the relevance of individual contacts remained an experimental question. [Han et al., 2025](https://doi.org/10.1038/s41467-025-64748-6); [Wu et al., 2026](https://doi.org/10.1038/s41587-025-02678-w).

**Build.** We compared models with GUGCGCG, GUGCACG and AUGCAGC RNA inputs. The first two isolate the +1 substitution; the third tests broader context. Coordinate-based contact decomposition and AF3 contact-probability matrices supplied complementary descriptors. The experimental screen covered 102 single mutants across 16 positions.

**Test.** Of 101 mutants with defined ratios, K30H had the highest +1 ratio among those retaining at least 70% activity: **1.71 at 0.84 retention**. W130G, K60Q and T31G exceeded a ratio of 2.0 but retained only 0.32, 0.17 and 0.13 activity, respectively. No tested single mutant met both selection criteria.

**Learn.** K30H became a starting point for combinations. Strong contacts did not automatically indicate useful engineering targets, and a high ratio could accompany substantial loss of activity. The result justified expanding the tested design space without claiming that every possible single substitution had reached an intrinsic limit.

**Evidence:** [Figure 3](figures/figure_03_ddcp_heatmap/figure_03_ddcp_heatmap.png), [Figure 8](figures/figure_08_single_site/figure_08_single_site.png).

## Cycle 2 | Combining substitutions across candidate roles

**Design.** We combined substitutions with different measured effects and putative structural roles, including G27, K30 and Q58 variants. We treated these roles as hypotheses rather than assuming that single-mutant effects would add independently.

**Build.** The N1 analysis assembled 48 construct records, including a single-mutant comparator. Thirty-six had defined +1 ratios. Preference and retention were evaluated jointly using an empirical Pareto frontier.

**Test.** **G27T–K30H–Q58M reached a ratio of 2.156 and retention of 0.773**, the only defined-ratio record meeting both criteria. Six measured points were Pareto-optimal. The combination-batch parental ratio was 1.192, whereas the earlier single-mutant batch used 1.371.

**Learn.** The triple mutant was retained as a lead for follow-up. Cross-batch differences prevented a controlled numerical estimate of its improvement over K30H. Future comparisons therefore required a shared parental control, matched assay conditions and absolute editing measurements alongside ratios.

**Evidence:** [Figure N1](figures/N1_combinatorial_pareto/N1_combinatorial_pareto.png), [source table](../figure-sources/orca-n1-n4/input/data/combo_batch_ratio_vs_retention.csv).

## Cycle 3 | Auditing the structural and experimental readouts

**Design.** We asked whether our descriptors could distinguish functional differences and whether the two-site ratio adequately described editing elsewhere in the amplicon.

**Build.** We assembled catalytic-distance and contact-deviation summaries for 29 construct records, together with an amplicon-level GCG/non-GCG targeting ratio. E72A's E72-based distance remained missing; designed-control annotations were kept separate from measured activity.

**Test.** T31A and T31D had reported activity retentions of **0.97 and 0**, despite their structural similarity. Among 41 non-parent constructs with defined amplicon targeting ratios, correlation with summed non-GCG editing was **r = −0.390** and **ρ = −0.557**. The latter association is mathematically coupled because non-GCG editing is also the denominator.

**Learn.** Structural descriptors were retained for hypothesis generation and control selection, not treated as calibrated activity predictors. Absolute desired and undesired editing must accompany ratios; the current amplicon analysis cannot establish transcriptome-wide specificity. Previous APOBEC-editor studies reinforce the need for broader RNA measurements. [Grünewald et al., 2019](https://doi.org/10.1038/s41586-019-1161-z).

**Evidence:** [Figure 4](figures/figure_04_negctrl_diagnosis/figure_04_negctrl_diagnosis.png), [Figure 9](figures/figure_09_targeting_ratio/figure_09_targeting_ratio.png). Figure 7 remains an additional representation check in the retained assets.

## Cycle 4 | Refining candidates and testing sequence background

**Design.** We separated lead-like variants, diagnostic comparisons and controls in a 61-entry candidate proposal. Position-132 substitutions were used to examine how outcomes depend on both the replacement residue and the combination background.

**Build.** Candidate groups A–E contained 18, 6, 12, 5 and 20 entries. The later measured table contained 37 groups, of which 35 entered the valid-ratio comparison after the source's exclusions. The proposal and measured batch were kept distinct.

**Test.** In the same designed batch, G25E–K30H–Q58M–M132D and the corresponding M132E construct had retention values of **0.3398 and 0.7517**. A source-flagged unusable triple-mutant well remained excluded; its failure cause was not independently confirmed. In the separate third-batch table, G27T–K30H–Q58M had **ROF 1.2185 and retention 0.9799**.

**Learn.** The position-132 contrast merits matched follow-up; it does not establish a universal effect of either substitution in every background. The triple remains a candidate, with performance reported relative to its own batch parent. The next experiment should compare the parent, K30H, the triple and selected M132D/E variants together with biological replication.

**Evidence:** [Figure 10](figures/figure_10_candidates/figure_10_candidates.png), [Figure N3](figures/N3_designed_batch/N3_designed_batch.png), [retained N4 panel](figures/N4_third_batch/N4_third_batch.png).

## Cycle 5 | Testing whether clustering adds functional information

**Design.** We evaluated whether predicted protein contacts and sequence embeddings could organize the available constructs in a way useful for engineering. Representation choices and cluster selection for the new ESM-2 comparison were specified before inspecting outcomes.

**Build.** The existing CP study contained 11 constructs, 56 seeds and 280 models. We independently audited 32 non-UMAP baselines and 6,400 stored bootstrap partitions, then refitted the selected spectral baseline. Separately, we extracted ESM-2 embeddings for the same 11 sequence-audited constructs using local 35M-parameter weights and offline CPU inference. [Lin et al., 2023](https://doi.org/10.1126/science.ade2574).

**Test.** The selected CP partition was reproduced exactly, but T31A and T31D remained together. The predeclared primary ESM-2 representation, mean final-layer residue embeddings, selected two groups of sizes ten and one, isolating E72A. It also retained T31A and T31D together. Layer-6 embeddings yielded a different partition.

**Learn.** These analyses provide reproducible structural and sequence comparisons, but no independent validation of editing-function prediction. We retained their code, embeddings and results as supporting analyses rather than presenting a separated embedding plot as a functional success.

**Evidence:** [CP numerical audit](../provenance/science-audit.json), [ESM-2 frozen plan](../analysis/esm2/PLAN.md), [ESM-2 report](../analysis/esm2/REPORT.md).

## Next iteration

1. Measure the parent, K30H, G27T–K30H–Q58M and selected position-132 variants in the same assay with biological replication.
2. Apply consistent read-depth criteria and retain absolute c.388, c.871 and c.295 editing with +1 ratio, retention and ROF.
3. Document sequence background and the experimental basis for exclusions before comparing batches.
4. Assess broader RNA editing and test proposed recognition mechanisms independently.
5. Evaluate predictive models only after assembling a broader measured sequence set with a held-out validation plan.

These are proposed next steps, not completed experimental results.
