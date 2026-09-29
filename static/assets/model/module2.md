# PUF specificity prediction and non-TRM sequence design

## Background and engineering objective

PUF variants can change RNA recognition, but stronger editing at a target does not necessarily imply greater specificity. We therefore ranked variants by target editing relative to two comparison sites, using the fixed score:

$$S=C_{388}-\frac{C_{295}+C_{871}}{2}.$$

Our two experimental batches contain 81 constructs. Sixty-six have measurements at all three sites; the remaining 15 lack at least one measurement. All 66 complete scores are positive. The current task is therefore **ranking among constructs with known positive S**. The S > 0 specificity classifier remains untrained because no negative class is available.

## Part I. Assay-informed specificity ranking

### Model principles

We adapted the approach of [Hsu et al.](https://doi.org/10.1038/s41587-021-01146-5), which combines evolutionary information with assay-labelled sequence features. Our implementation joins a frozen ESM-2 score with reference-centred one-hot sequence encoding, then fits Ridge regression to the measured editing outputs.

![Sequence features, training-side selection, three editing predictions and specificity ranking](figures/architecture/figure@2x.png)

*Figure 1. PUF-ESM combines an ESM-2 mutation score with one-hot features to predict C295, C388 and C871 using Ridge regression. Predictions define specificity score S.*

#### Sequence features and missing measurements

The evolutionary feature sums mutant-versus-reference log-probability differences at substituted residues. Each probability is computed from the reference sequence with that position masked, using frozen ESM-2 35M weights. This additive score captures sequence-model preferences; it does not directly measure editing specificity or model interactions between substitutions.

The second feature block encodes amino-acid substitutions relative to the fixed 493-residue reference. A separate Ridge regressor predicts each C value using only its observed training labels. Available labels from all 81 constructs contribute when eligible for the training fold; missing values are never replaced with zero. This model uses neither LoRA nor a structure input.

#### Grouped validation and parameter selection

Outer validation leaves out one sequence group at a time. Repeated measurements and identical sequences remain grouped, and every held-out group is excluded from all training records. Ranking metrics use the same 66 constructs with complete S throughout.

Within each outer training fold, two-fold grouped validation tests Ridge penalties of 0.1, 1, 10, 100 and 1,000, with evolutionary-feature weights of 1 or 10. Feature standardization uses training data only. Strategy A prioritizes inner Spearman correlation, followed by the measured mean S of the proportional predicted-top subset and then regression error. Outer test labels do not select parameters.

#### Core implementation

The following excerpt shows feature combination, masked per-target regression and specificity calculation. `selected_spec` is chosen using the inner training-side validation folds; `train_idx` excludes the held-out sequence group. `fit` uses only observed labels for each C output, and standardizes the ESM score within the training records. The full implementation is provided in [model.py](https://github.com/pdx12320/igem_module2/blob/main/wiki/ablation_experiment/model.py).

```python
from model import encode, fit, predict

onehot, esm_score = encode(sequences, reference, reference_logp)
models = fit(onehot, esm_score, Y, train_idx,
             "PUF_ESM", selected_spec)
C_hat = predict(models, onehot, esm_score, test_idx)
S_hat = C_hat[:, 1] - (C_hat[:, 0] + C_hat[:, 2]) / 2
```

Here, `Y` contains C295, C388 and C871 in that order. The excerpt uses the experiment's existing variables and functions; missing labels remain missing.

### Results: overall ranking and Top-K recovery

The PUF-ESM Specificity Ranker reached **Spearman ρ = 0.405** and **Kendall τ = 0.264**. It had the highest Spearman correlation among the original 12 methods in the matched comparison and among the five feature ablations below. This scope does not establish it as the best historical model or the best method for every Top30 objective.

Removing the evolutionary feature reduced Spearman correlation to 0.292 in the matched one-hot Ridge model using the same A selection rule. Frozen local ESM plus Ridge reached 0.289 under its existing B selection rule. The latter comparison changes both features and selection strategy, so it does not isolate the contribution of evolutionary augmentation.

![Observed Top5, Top15 and Top30 overlap versus random expectation](figures/topk_random/figure@2x.png)

*Figure 2. Top-K overlap between predicted and measured rankings among 66 constructs. Random expectation is K²/66; model bars show observed hit counts.*

The model recovered 1, 6 and 20 measured Top-K members at K = 5, 15 and 30, respectively. The displayed cutoffs exceeded their random expectations. At Top30, the model recovered 20 of the 30 highest-scoring constructs, corresponding to a 66.7% hit rate. Uniform random selection would recover 13.64 on average, or 45.5%. The selected constructs had a measured mean S of 0.292, compared with 0.245 across all 66 constructs.

Top30 was chosen for reporting after inspection of the existing predictions. This retrospective choice leaves model fitting and its original inner-selection rules unchanged. The comparison is descriptive development-stage evidence, not an independently validated improvement. Random selection here is not random generation of mutant sequences.

![Measured versus held-out predicted specificity for all 66 constructs](figures/oof_scatter/figure@2x.png)

*Figure 3. Measured versus out-of-fold predicted S for 66 constructs, highlighting the predicted Top30. The dashed line indicates perfect agreement.*

#### Feature ablations: position, amino-acid identity and evolutionary score

We tested whether ranking depended on mutation location, amino-acid identity or the evolutionary score. The position-only baseline uses a 493-dimensional binary vector, with one indicating a substitution at that residue. It contains no amino-acid identity. The amino-acid model uses the existing 493 × 20 reference-centred one-hot difference encoding: −1 for the reference residue and +1 for its replacement at each mutated position.

All supervised variants predict the three C values separately, using available labels from the same 81-construct pool. They reuse the identical 66 outer sequence-group folds, inner partitions, Ridge penalty grid and A selection rule. Test groups remain excluded from every training record. The historical inner-selection rule is unchanged; Top30 is the retrospective reporting cutoff.

The zero-shot control ranks the fixed ESM-2 mutation score directly, without using the current assay labels for training, scaling or sign selection. Higher pretrained log-odds remain ranked higher. An additional score-only Ridge control tests whether supervised calibration of that single feature is sufficient.

![Spearman correlation across five feature ablations](figures/ablation_spearman/figure@2x.png)

*Figure 4. Spearman correlation across five feature ablations evaluated on the same 66 constructs. Values are development-stage cross-validation estimates.*

![Top30 overlap across five feature ablations versus random expectation](figures/ablation_top30/figure@2x.png)

*Figure 5. Measured Top30 recovery across five feature ablations. The dashed line marks random expectation: 13.64 of 30 constructs.*

**Mutation position alone provides limited ranking information.** Position-only Ridge reached ρ = 0.155 and recovered 14 of the measured Top30, close to the random expectation of 13.64. Its selected mean S was 0.241, compared with 0.245 across the full cohort. Location alone therefore did not provide strong candidate enrichment in this evaluation.

**Amino-acid identity improves the point estimates.** Adding identity through position-specific one-hot features increased ρ from 0.155 to 0.292 and Top30 recovery from 14 to 16. These results suggest that the substituted residue contributes information beyond mutation location within this library.

**The uncalibrated ESM-2 score does not directly rank specificity well.** Its correlation was negative (ρ = −0.265), and Top30 recovery was 9, below the random expectation. The score was not sign-flipped after inspecting these results. This finding applies to the specified additive reference-masked score, not to every possible ESM representation. Fitting Ridge to the score increased recovery to 16 but yielded only ρ = 0.098.

**Combining the two feature sources performs best within this ablation.** The combined model reached ρ = 0.405 and recovered 20 of the measured Top30. Relative to amino-acid one-hot Ridge, this corresponds to Δρ = 0.113 and four additional hits; relative to score-only Ridge, Δρ = 0.307 and four additional hits. The combined selected mean S was 0.292, versus 0.259 for one-hot Ridge and 0.264 for score-only Ridge. Thus, this comparison supports a benefit from combining the features after assay-based fitting, despite poor direct zero-shot ranking.

These are descriptive differences from development-stage cross-validation, not evidence of statistically established improvement or independent experimental validation. Sequence-group holdout can retain examples at the same mutation positions in training; it does not test generalization to entirely unseen positions. Independent experiments remain necessary.

#### Original five constructs with high measured specificity

We retain the original five highlighted constructs alongside the rank-agreement examples below. All five belong to both the predicted and measured Top30 sets. They were highlighted for their measured specificity, rather than selected for the smallest rank errors; their prediction ranks differ from measured ranks by 7–20 places.

![Predicted and measured ranks of the original five high-specificity constructs](figures/five_targets/figure@2x.png)

*Figure 6. Predicted and measured ranks of five previously highlighted constructs among 66 candidates. All five fall within the predicted Top30.*

| Construct | Predicted S | Measured S | Predicted rank / 66 | Measured rank / 66 | Predicted Top30 |
|---|---:|---:|---:|---:|:---:|
| P8-GVE | 0.240 | 0.481 | 22 | 2 | Yes |
| P9-NTQ | 0.245 | 0.422 | 19 | 6 | Yes |
| P9-NPS | 0.270 | 0.375 | 15 | 8 | Yes |
| P9-NSG | 0.233 | 0.345 | 24 | 11 | Yes |
| P9-GNS | 0.339 | 0.342 | 4 | 13 | Yes |

#### Retrospective examples of agreement at higher and lower ranks

We selected five examples with higher specificity and five with lower specificity, excluding the five previously highlighted constructs. Higher-ranked examples must appear in both predicted and measured Top30 sets. Lower-ranked examples must appear in both bottom-30 sets, corresponding to ranks 37–66.

Within each eligible group, we chose the five smallest absolute differences between predicted and measured ranks, breaking ties by absolute S error and then construct identifier. This selection uses measured outcomes after prediction. The examples illustrate agreement and must not replace the full-cohort performance assessment. Lower specificity here means a lower relative S within this library, not S ≤ 0 or a non-working construct.

![Five concordant higher-ranked examples followed by five concordant lower-ranked examples](figures/selected_cases/figure@2x.png)

*Figure 7. Five higher-ranked and five lower-ranked examples selected retrospectively for close predicted–measured ranks. These illustrative cases do not represent full-cohort accuracy.*

##### Five higher-ranked examples

| Construct | Predicted S | Measured S | Predicted rank / 66 | Measured rank / 66 | Absolute rank error |
|---|---:|---:|---:|---:|---:|
| P9-NFP | 0.270 | 0.336 | 14 | 14 | 0 |
| P4-SNE + P7-SNE | 0.406 | 0.541 | 2 | 1 | 1 |
| P1-GVD | 0.243 | 0.257 | 21 | 23 | 2 |
| P9-QKQ | 0.266 | 0.264 | 16 | 19 | 3 |
| P9-NWP | 0.244 | 0.288 | 20 | 17 | 3 |

##### Five lower-ranked examples

| Construct | Predicted S | Measured S | Predicted rank / 66 | Measured rank / 66 | Absolute rank error |
|---|---:|---:|---:|---:|---:|
| P2-CKR | 0.180 | 0.133 | 60 | 60 | 0 |
| P5-AYE | 0.211 | 0.201 | 42 | 44 | 2 |
| P2-CRR | 0.176 | 0.106 | 61 | 63 | 2 |
| P2-TKR | 0.166 | 0.140 | 62 | 59 | 3 |
| P10-SRQ | 0.201 | 0.198 | 49 | 45 | 4 |

The higher-ranked examples differ from their measured ranks by 0–3 places; the lower-ranked examples differ by 0–4 places. Close ranks do not necessarily imply accurate absolute S values. For example, P4-SNE + P7-SNE ranks second by prediction and first by measurement, but its predicted S (0.406) underestimates the measured S (0.541).

The original five-target data remain available in the [original target summary](https://github.com/pdx12320/igem_module2/blob/main/wiki/data/five_target_summary.csv). The [ten selected cases](https://github.com/pdx12320/igem_module2/blob/main/wiki/data/selected_rank_cases.csv) and [explicit selection rule](https://github.com/pdx12320/igem_module2/blob/main/wiki/data/case_selection_protocol.json) make this illustrative selection auditable. Full-cohort Spearman and Top-K results are unchanged.

#### Sequence-only inference and next experimental cycle

The deployment model uses the prespecified A selection rule on all available training data. Its fitted weights are separate from the out-of-fold performance evidence. New candidates require only a 493-residue PUF FASTA sequence with standard amino acids; the fixed reference-scoring table is stored with the model. Insertions and deletions are outside the current model scope.

These data have been examined across multiple modelling rounds. All reported metrics therefore represent development-stage cross-validation. The next Design–Build–Test–Learn cycle should prospectively select candidates, measure all three C values, and compare predictions with an independent experimental batch.

## Part II. Structure-conditioned PUF design and experimental comparison

### Background and objective

PUF recognition residues help specify RNA binding, whereas other residues support the surrounding protein scaffold (Wang et al., 2002; Cheong & Hall, 2006). We examined both regions to nominate substitutions for the next experimental cycle. The objective was to identify structure-compatible candidates and compare their sequence preferences with measured editing profiles.

We followed the single-substitution screening logic of AiCE, which combines inverse-folding preferences with structural constraints (Fei et al., 2025). Our implementation is an **AiCE-inspired screen using PyDSSP three-state assignments**, rather than a complete reproduction of AiCE. We did not implement its multi-mutation evolutionary coupling analysis or establish increased RNA affinity.

### Models and two design spaces

ProteinMPNN conditions sequence generation on protein backbone geometry (Dauparas et al., 2022). LigandMPNN additionally represents nonprotein atomic context, including nucleotides (Dauparas et al., 2025). Here, LigandMPNN received the fixed RNA coordinates, whereas ProteinMPNN provided a protein-backbone comparison. Neither model was trained on our editing measurements.

Both analyses used the same 493-residue PUF reference and the 17-nucleotide RNA sequence `ACAUGGAGGACGUGCGC`. Protein substitutions use one-based residue numbering. C295, C388 and C871 identify assay endpoints; they are not protein residue numbers. RNA endpoint C388 maps to nucleotide 15 of this structural fragment.

![Two inverse-folding design spaces and their comparison with measured constructs](inverse_folding_20260928/figures/workflow/figure@2x.png)

*Figure 8. All-position and TRM-only design with ProteinMPNN and LigandMPNN, using 10,000 sequences per model and design space, followed by screening and experimental comparison.*

| Analysis | Mutable protein positions | Fixed protein positions | Sampling source | Reported screen |
|---|---:|---:|---|---|
| All-position sampling | 493 | 0 | Archived 10,000 sequences per model | Non-TRM substitutions after excluding 36 recognition positions |
| TRM-only sampling | 36 | 457 | Newly generated 10,000 sequences per model | All 36 recognition positions; all amino-acid substitutions permitted |

“All-position” means that every residue was eligible for replacement; individual sequences need not replace every residue. The archived samples did not preserve TRMs during generation. Their non-TRM single-mutant exports subsequently restored the WT background, including all recognition residues.

For each position, each model nominated its most frequent alternative when its frequency exceeded the WT frequency. The alternative also had to reach 0.8 globally, or 0.5 at a PyDSSP loop position. Exact dual-model consensus required both models to pass their applicable threshold for the **same replacement**. These rules, including β = 0.8 and γ = 0.5, were unchanged.

### All-position sampling expands the non-TRM candidate set

Completing the structural screen yielded **128 non-TRM substitutions at 125 positions**, including **46 exact dual-model consensus substitutions**. The previous global-only calculation yielded 81 substitutions at 81 positions, including 17 consensus substitutions. All 81 previous substitutions were retained, and 47 substitutions at 44 additional positions were added. Twenty-nine substitutions newly obtained consensus support; some were already nominated by one model.

![Non-TRM nomination counts before and after structural screening](inverse_folding_20260928/figures/nontrm_screen/figure@2x.png)

*Figure 9. Non-TRM nominations before and after completing structural screening. Exact consensus requires both models to support the same substitution.*

The earlier script tested PyDSSP loop assignments against `C`, although the installed three-state representation uses `-`, `H` and `E`. The corrected annotation identified 129 loop, 360 helical and four strand residues. A loop assignment is a structural proxy, not an experimental measurement of flexibility. Positions 177, 249 and 285 retained different model-supported substitutions and were excluded from exact consensus.

We also corrected substitution identities in the earlier exports. The supporting model frequencies nominate **N12G, M433L and V457I**, rather than N12S, M433A and V457L. Candidate tables now identify the supporting model and its exact replacement. All 128 single-mutant sequences were checked against the reference, with TRM positions unchanged.

### TRM-only generation produces model-specific nominations

The new TRM-only runs each completed 10,000 samples, with all 457 non-TRM residues verified unchanged. LigandMPNN produced 9,961 unique sequences and averaged 21.53 TRM substitutions per sample. ProteinMPNN produced 10,000 unique sequences and averaged 29.25 substitutions. Thus, sampled sequences usually combined many recognition changes.

All 36 TRM residues were assigned helix, so the 0.5 loop route did not apply. LigandMPNN nominated **10 substitutions**, whereas ProteinMPNN nominated **none**. Consequently, the TRM-only screen had **zero exact dual-model consensus substitutions**.

![Sampling frequencies for all ten nominated TRM substitutions](inverse_folding_20260928/figures/trm_frequencies/figure@2x.png)

*Figure 10. Frequencies of ten nominated substitutions in 10,000 TRM-only samples per model. The dashed line marks the 80% threshold; frequencies do not measure affinity.*

| Substitution | LigandMPNN frequency | ProteinMPNN frequency |
|---|---:|---:|
| Y37R | 99.40% | 18.08% |
| E40Q | 84.91% | 0.32% |
| S72C | 82.42% | 18.22% |
| R109L | 85.93% | 12.97% |
| E148Q | 90.06% | 40.09% |
| S180C | 99.78% | 22.96% |
| E184Q | 98.22% | 47.09% |
| E256Q | 94.50% | 49.12% |
| E292Q | 93.09% | 51.06% |
| R400Q | 87.25% | 55.74% |

The difference between models is compatible with their different conditioning and pretrained parameters. It does not isolate RNA context as the causal explanation, because the comparison changes the model as well as its inputs.

### Experimental overlap, similarity and disagreement

The two supplied workbooks contained 168 records, grouped into 81 mutant constructs and three control groups. Every group had two records, but their biological or technical replicate status was unspecified. Sequence mapping identified 121 distinct substitutions across 31 positions, all within the configured TRM region.

Accordingly, **none of the 128 non-TRM nominations has an exact substitution or position match in these experiments**. This is an untested design space, rather than evidence of experimental contradiction. Within the TRM nominations, **Y37R, E184Q and S72C** occurred among measured substitutions. Y37R and E184Q were tested individually; S72C appeared in multi-mutant constructs, preventing attribution of their outcomes to S72C alone.

These three substitutions represent 3/10 nominated substitutions and 3/121 measured distinct substitutions. These descriptive coverage fractions are not predictive accuracy. The full 81-construct table separately reports changed-residue matches, whole-TRM motif matches and exact full-sequence matches. A motif match does not establish identity of the remaining sequence.

![Editing changes for nominated single mutants and selected experimental examples](inverse_folding_20260928/figures/assay_comparison/figure@2x.png)

*Figure 11. Selected editing changes from same-batch controls; each mean uses two records of unspecified replicate type. Y37R is compared separately with both batch-2 controls. No significance testing.*


Across all 81 measured constructs, at least one TRM-only sample contained every specified substitution for 23 constructs with LigandMPNN and 35 with ProteinMPNN. Requiring the complete affected TRM triplets reduced coverage to 13 and 20 constructs, respectively. Neither model generated an exact full-length match to any measured construct. These coverage counts use any observed occurrence, not the 80% nomination threshold, and do not quantify editing accuracy.

| Match definition | LigandMPNN construct coverage | ProteinMPNN construct coverage |
|---|---:|---:|
| All specified substitutions present; other residues unconstrained | 23/81 (28.4%) | 35/81 (43.2%) |
| All affected TRM triplets match; other triplets unconstrained | 13/81 (16.0%) | 20/81 (24.7%) |
| Entire 493-residue experimental sequence matches | 0/81 | 0/81 |

**High sampling preference did not consistently indicate higher target editing.** Y37R occurred in 99.40% of LigandMPNN samples, but measured C388 was 60.39%. The two batch-2 controls measured 67.64% and 66.53%. E184Q occurred in 98.22% of samples, but its C388 mean was 59.12%, compared with 72.56% for the batch-1 control. These discrepancies challenge a direct interpretation of sampling frequency as target-editing benefit. They do not independently establish weaker binding, which was not measured.

**Several useful experimental profiles were rarely recovered by the sampler.** Y145N + Y253N increased C388 by 7.77 percentage points while reducing C295 and C871 by 13.15 and 34.90 points. P8-GVE, carrying S288G + Y289V, reduced C388 by 6.70 points but reduced C871 by 57.27 points. The joint S288G + Y289V substitution set was absent from both TRM-only sample sets. Zero observations mean absence from 10,000 samples, rather than biological impossibility.

**Position-level similarity can conceal different substitutions.** The model nominated E256Q, whereas the measured P7-SYVIRR construct changed E256R; its adjacent position 257 was already arginine. E256R increased C388 by 6.82 points and reduced C871 by 39.44 points, while increasing C295 by 12.30 points. This mixed profile cannot validate the untested E256Q substitution.

The spreadsheet comparison preserves nondetection flags alongside the recorded values, including displayed zeros. The existing ESM Ranker training cohort instead treats invalid or missing assay labels as missing. Its 66 complete-score constructs and frozen cross-validation metrics remain unchanged. The two data views therefore answer different questions and must not be merged by silently converting nondetection to valid training labels.

### WT-background scoring and interpretation

We additionally scored each nominated TRM substitution individually on the WT background using the official model scoring implementation. Scores averaged eight shared decoding orders and measured mean log probability over the 36 TRM positions. This diagnostic did not modify the nomination thresholds or remove candidates.

![Single-mutant scores relative to WT under both inverse-folding models](inverse_folding_20260928/figures/single_scores/figure@2x.png)

*Figure 12. Change in mean TRM log probability versus WT, averaged over eight decoding orders. Positive values indicate model preference, not measured binding improvement.*

For E292Q, the changes were −0.0756 for LigandMPNN and −0.0200 for ProteinMPNN. This mismatch shows why a marginal frequency from multi-mutant samples cannot be assigned directly to a WT single mutant. The other nine candidates increased both scores, but these model-based checks remain distinct from experimental validation.

## Next Design–Build–Test–Learn cycle

The next experiments should separate scaffold improvement, recognition changes and editing specificity. Non-TRM candidates should first be added individually to characterized TRM backgrounds, with unchanged parental controls. TRM candidates should be tested individually before evaluating combinations, including exact alternatives at shared positions such as E256Q and E256R.

Direct binding assays should compare the fixed target RNA with defined alternative RNAs. Matched editing experiments should measure all three endpoints, together with expression and protein integrity where feasible. Candidate selection and evaluation criteria should be recorded before collecting the next batch. These experiments would distinguish binding effects from changes in expression, catalytic positioning or cellular context.

The existing **PUF-ESM Specificity Ranker** can provide a separate assay-informed prioritization layer, following the integration of evolutionary and labelled data described by Hsu et al. (2022). Its frozen ESM-2 score, one-hot encoding and Ridge regressors differ from the structure-conditioned MPNN screen. Its existing grouped cross-validation remains developmental evidence; candidates from these new design spaces require prospective assessment, particularly at previously untested non-TRM positions.

## Data, figures and reproducibility

### Assay-informed ranking

The [ablation comparison](https://github.com/pdx12320/igem_module2/blob/main/wiki/data/ablation_metrics.csv), [per-construct predictions](https://github.com/pdx12320/igem_module2/blob/main/wiki/data/oof_ablation.csv), [locked ablation protocol](https://github.com/pdx12320/igem_module2/blob/main/wiki/data/ablation_protocol.json) and [validation record](https://github.com/pdx12320/igem_module2/blob/main/wiki/data/ablation_validation.json) accompany the new figures. The `ablation_experiment/` directory contains inputs, training code and all 66 fold-level parameter searches.

The package contains [all 66 ranked predictions](https://github.com/pdx12320/igem_module2/blob/main/wiki/data/hsu_A_oof_rankings.csv), the [five-target audit](https://github.com/pdx12320/igem_module2/blob/main/wiki/data/five_target_summary.csv), the [Top-K baseline comparison](https://github.com/pdx12320/igem_module2/blob/main/wiki/data/topk_random_comparison.csv), [all-method metrics](https://github.com/pdx12320/igem_module2/blob/main/wiki/data/comparison_all66.csv) and the [fixed protocol](https://github.com/pdx12320/igem_module2/blob/main/wiki/data/protocol.json). Batch-specific and double-repeat subset metrics are retained in [the complete subset table](https://github.com/pdx12320/igem_module2/blob/main/wiki/data/metrics_all_subsets.csv). Top30 is marked not evaluable for subsets with fewer than 30 constructs; it is not silently replaced with a smaller K.

### Structure-conditioned design

The main project repository is [pdx12320/igem_module2](https://github.com/pdx12320/igem_module2). The prepared repository update brings together the assay-informed ranker and the structure-conditioned design results. The earlier [PUF_alphafold repository](https://github.com/pdx12320/PUF_alphafold) remains the historical source for the archived structural inputs and all-position samples.

- [Current figures, plotted data and ORCA plotting script](https://github.com/pdx12320/igem_module2/tree/main/wiki/inverse_folding_20260928)
- [Non-TRM reanalysis, 128 single mutants and structural validation](https://github.com/pdx12320/igem_module2/tree/main/research/inverse_folding_20260928/nontrm)
- [TRM-only samples, ten nominations and reproducible sampling code](https://github.com/pdx12320/igem_module2/tree/main/research/inverse_folding_20260928/trm_only)
- [Complete experimental comparison and source-row audit](https://github.com/pdx12320/igem_module2/tree/main/research/inverse_folding_20260928/experimental_comparison)
- [Reusable PUF-ESM Specificity Ranker](https://github.com/pdx12320/igem_module2/tree/main/puf_reuse)
- [Upstream LigandMPNN implementation](https://github.com/dauparas/LigandMPNN)

Reproduction records retain seeds, masks, model versions, input checksums and validation results. The updated figures and prose do not retrain the ESM Ranker or introduce new wet-lab measurements.

### Figures and local reuse

Both workflows include editable PowerPoint sources and PNG previews. Data figures include PNG, SVG, PDF, plotted tables, captions and reproducible ORCA scripts. Image paths are relative to this document, so the local package does not depend on unpublished GitHub assets. Keep the accompanying folders beside the Markdown files. Standalone HTML previews embed every image for offline viewing.

The assay-informed model retains its existing training labels, folds and development-stage evaluation. The structure-conditioned analysis adds archived-sample reanalysis and new TRM-only sampling. No new assay measurements were introduced.

## References

Abramson, J., Adler, J., Dunger, J., Evans, R., Green, T., Pritzel, A., Ronneberger, O., Willmore, L., Ballard, A. J., Bambrick, J., Bodenstein, S. W., Evans, D. A., Hung, C.-C., O’Neill, M., Reiman, D., Tunyasuvunakool, K., Wu, Z., Žemgulytė, A., Arvaniti, E., … Jumper, J. M. (2024). Accurate structure prediction of biomolecular interactions with AlphaFold 3. *Nature, 630*(8016), 493–500. https://doi.org/10.1038/s41586-024-07487-w

Cheong, C. G., & Hall, T. M. T. (2006). Engineering RNA sequence specificity of Pumilio repeats. *Proceedings of the National Academy of Sciences, 103*(37), 13635–13639. https://doi.org/10.1073/pnas.0606294103

Dauparas, J., Anishchenko, I., Bennett, N., Bai, H., Ragotte, R. J., Milles, L. F., Wicky, B. I. M., Courbet, A., de Haas, R. J., Bethel, N., Leung, P. J. Y., Huddy, T. F., Pellock, S., Tischer, D., Chan, F., Koepnick, B., Nguyen, H., Kang, A., Sankaran, B., … Baker, D. (2022). Robust deep learning–based protein sequence design using ProteinMPNN. *Science, 378*(6615), 49–56. https://doi.org/10.1126/science.add2187

Dauparas, J., Lee, G. R., Pecoraro, R., An, L., Anishchenko, I., Glasscock, C., & Baker, D. (2025). Atomic context-conditioned protein sequence design using LigandMPNN. *Nature Methods, 22*(4), 717–723. https://doi.org/10.1038/s41592-025-02626-1

Fei, H., Li, Y., Liu, Y., Wei, J., Chen, A., & Gao, C. (2025). Advancing protein evolution with inverse folding models integrating structural and evolutionary constraints. *Cell, 188*(17), 4674–4692.e19. https://doi.org/10.1016/j.cell.2025.06.014

Hsu, C., Nisonoff, H., Fannjiang, C., & Listgarten, J. (2022). Learning protein fitness models from evolutionary and assay-labeled data. *Nature Biotechnology, 40*(7), 1114–1122. https://doi.org/10.1038/s41587-021-01146-5

Hu, E. J. et al. (2021). LoRA: Low-Rank Adaptation of Large Language Models. https://arxiv.org/abs/2106.09685

Lin, Z., Akin, H., Rao, R., Hie, B., Zhu, Z., Lu, W., Smetanin, N., Verkuil, R., Kabeli, O., Shmueli, Y., dos Santos Costa, A., Fazel-Zarandi, M., Sercu, T., Candido, S., & Rives, A. (2023). Evolutionary-scale prediction of atomic-level protein structure with a language model. *Science, 379*(6637), 1123–1130. https://doi.org/10.1126/science.ade2574

Radivojević, T., Costello, Z., Workman, K., & Garcia Martin, H. (2020). A machine learning Automated Recommendation Tool for synthetic biology. *Nature Communications, 11*, Article 4879. https://doi.org/10.1038/s41467-020-18008-4

Wang, X., McLachlan, J., Zamore, P. D., & Hall, T. M. (2002). Modular recognition of RNA by a human Pumilio-homology domain. *Cell, 110*(4), 501–512. https://doi.org/10.1016/S0092-8674(02)00873-5

Zhao, Y.-Y., Mao, M.-W., Zhang, W.-J., Wang, J., Li, H.-T., Yang, Y., Wang, Z., & Wu, J.-W. (2018). Expanding RNA binding specificity and affinity of engineered PUF domains. *Nucleic Acids Research, 46*(9), 4771–4782. https://doi.org/10.1093/nar/gky134
