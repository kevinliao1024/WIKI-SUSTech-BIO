# Module 2 | Five engineering iterations from AlphaFold to ESM

## Engineering objective

Our modelling began with a structural question: which PUF scaffolds were likely to remain functional? It developed into an assay-specific task: which sequence variants should be prioritized for a favourable target-versus-comparison-site editing profile? Five completed development iterations connect AlphaFold3 contact-probability (CP) matrices, model-guided wet-lab testing and the current ESM-based ranker.

The record includes one five-candidate model-to-experiment loop and subsequent computational iterations using the accumulated measurements. For the ESM stages, we ranked variants using:

$$S=C_{388}-\frac{C_{295}+C_{871}}{2}.$$

This score compares three measured editing endpoints; it does not establish transcriptome-wide specificity. Earlier scaffold labels and CP endpoint classes remain separate tasks. The [main Wiki](PUF_Dry_Lab_Wiki_EN_ESM.md) provides the full current methods and results.

## Iteration 1 | Use AlphaFold CP matrices to assess scaffold function

**Design.** We first asked whether protein-internal contact patterns could distinguish functional from non-functional PUF repeat arrangements. The aim was scaffold screening, before attempting to predict individual editing endpoints.

**Build.** We summarized AlphaFold3 CP matrices as length-normalized contact densities, S4, S12 and S24, counting residue pairs above CP = 0.5 at three minimum sequence separations. Structure and seed replicates were aggregated by construct. An initial shallow decision tree was followed by shallow random forests, including a nine-feature version with confidence and geometry descriptors. CP values were structural model outputs, not measured binding probabilities.

**Test.** A later fixed-panel reconstruction trained the nine-feature forest on 20 constructs and agreed with three of four held-out scaffold labels; Design 7 was a false positive. Input checks also exposed a 519-versus-512-residue boundary mismatch: matching the analysis region changed five of six complex-level calls without refolding or retraining. These six complexes represented only two proteins. Directly transferring the scaffold classifier to C388 activity in 31 TRM constructs gave balanced accuracy of 0.396.

**Learn.** Consistent sequence boundaries were essential, and a scaffold-function score did not reliably predict editing activity. We therefore separated scaffold assessment from the three editing tasks and examined protein–RNA contacts for those endpoints.

**Evidence:** [CP development record](history/README.md#iteration-1), [fixed scaffold split](history/cp/model1_split.json) and [four-design predictions](history/cp/model1_predictions.csv).

## Iteration 2 | Connect CP endpoint predictions to five wet-lab candidates

**Design.** We asked whether protein–RNA CP features could distinguish changes at C295, C388 and C871 relative to matched controls. This allowed target editing and comparison-site editing to influence candidate selection separately.

**Build.** We developed endpoint-specific CP models and used model predictions to select five candidates for wet-lab testing: **P9-GNS, P9-NPS, P9-NTQ, P8-GVE and P4-R5-SNE+P7-R5-SNE**. Candidate nomination followed by experimental testing formed the physical design–build–test loop.

**Test.** The wet-lab measurements revealed distinct endpoint effects. For example, P4-R5-SNE+P7-R5-SNE changed C388 by +7.77 percentage points, C295 by −13.15 and C871 by −34.90 relative to its matched control. A later fixed-five reconstruction excluded all five candidates and identical sequences together, selected models using only the remaining 76 constructs and masked test outcomes during fitting. Full protein–RNA CP models produced 11/15 matching endpoint calls: 5/5 at C295, 3/5 at C388 and 3/5 at C871. However, a training-majority reference also achieved 5/5 at both C295 and C871, whose test labels each contained only one class.

**Learn.** The experiments exposed errors that aggregate agreement concealed: the reconstructed model missed the C388 increase of the double-repeat candidate and predicted a C388 decrease for P8-GVE outside its measured class. Endpoint classification alone was insufficient for ranking the combined editing profile. We consequently evaluated sequence representations against the continuous three-endpoint readout.

The prediction-to-experiment sequence is recorded in the historical project narrative and confirmed by the team. The 11/15 result is a later reconstruction, not the original pre-assay prediction record. This historical panel is distinct from the later five ESM examples containing P9-NSG.

**Evidence:** [historical panel and reconstruction scope](history/README.md#iteration-2), [15 endpoint calls](history/cp/model2_predictions.csv) and [training-side model selections](history/cp/).

## Iteration 3 | Replace CP inputs with frozen ESM sequence representations

**Design.** We asked whether a pretrained protein sequence model could capture substitution information useful for editing-profile ranking without generating a new AlphaFold structure for every candidate.

**Build.** We froze ESM-2 35M and compared global representations with local embeddings pooled over mutated residues, ±5-residue windows, affected repeats and spatial neighbours from a fixed reference structure. Local embeddings fed separate Ridge regressors for the three endpoints. Available measurements from 81 constructs supported training; evaluation used the 66 with complete S values. Sequence groups stayed together, and scaling and dimensionality reduction used training data only.

**Test.** In the historical grouped evaluation, local ESM–Ridge reached Spearman ρ = 0.424 under selection rule A and 0.289 under rule B; both recovered six measured Top15 members. A prioritized inner-validation correlation, whereas B prioritized the measured mean S of the predicted-top subset. Missing endpoint labels were not replaced with zero.

**Learn.** Frozen sequence representations contained useful ranking information, but the recovery of high-scoring candidates remained limited and depended on the training-side selection rule. This motivated testing whether limited adaptation of ESM could better align its representation with the assay.

**Evidence:** [frozen-ESM methods](history/README.md#iteration-3), [historical protocol](history/esm/protocol.json) and [all per-seed and baseline metrics](history/esm/metrics_per_seed.csv).

## Iteration 4 | Test whether LoRA adaptation improves assay ranking

**Design.** We tested a small trainable adaptation of ESM while keeping most pretrained parameters frozen, then checked whether any benefit persisted across random seeds and evaluation subsets.

**Build.** Rank-4 LoRA adapters were added to the query and value projections of the final four Transformer blocks. Global and mutation-window pooling fed a three-output head. Training combined regression on observed endpoint labels with within-batch pairwise ranking, using three prespecified seeds. Frozen ESM–Ridge remained the comparator.

**Test.** Averaging predictions across the three seeds gave ρ = 0.452 under A and 0.497 under B, with seven Top15 hits under either rule, versus six for frozen Ridge in that historical evaluation. Individual B-seed correlations ranged from 0.388 to 0.586. In a separate 37-construct batch-two comparison that globally excluded five target groups, frozen Ridge reached ρ = 0.669 and 12/15 hits; the LoRA prediction ensemble reached 0.572 and 11/15.

**Learn.** Adaptation improved some cohort-level results but did not consistently outperform the simpler model. Seed variability and the batch comparison showed why a single favourable run was insufficient. We retained these findings as development evidence and examined a complementary, compact way to combine evolutionary information with assay-labelled substitutions.

**Evidence:** [LoRA protocol](history/esm/protocol.json), [seed-level metrics](history/esm/metrics_per_seed.csv) and [37-construct comparison](history/esm/batch2_cv_comparison.csv). These are computational evaluations, not additional wet-lab cycles.

## Iteration 5 | Combine an ESM mutation score with assay-labelled substitutions

**Design.** We asked whether evolutionary sequence preference added information beyond substitution identity when both were calibrated to the PUF assay.

**Build.** The current PUF-ESM Specificity Ranker combines a frozen ESM-2 masked-reference mutation score with reference-centred one-hot features and three Ridge regressors. The ESM score sums mutant-versus-reference log-probability differences; it is not an editing measurement. Matched ablations used the same grouped folds and A selection rule to isolate each feature block. The deployed model uses neither LoRA nor candidate-specific structure inputs.

**Test.** Adding the ESM score to one-hot Ridge increased Spearman correlation from 0.292 to **0.405** in the matched comparison. The raw zero-shot score gave −0.265. The combined model recovered **20/30** measured Top30 members, versus 13.64 expected under uniform selection from the same 66 constructs. Top15 recovery increased from four to six, although Top10 recovery fell from two to one. Top30 was selected retrospectively for reporting. These results use a different inner-split protocol from the earlier stability study and do not establish superiority over all historical LoRA models.

![Matched feature ablations for the current PUF-ESM ranker](figures/ablation_spearman/figure@2x.png)

*Matched feature ablations on the 66 constructs with complete S. Values are development-stage grouped-CV estimates.*

**Learn.** Evolutionary preference was more useful here when combined with substitution identity and assay-based fitting than when used directly as a functional score. This iteration produced a reusable model for ranking fixed-reference, 493-residue substitution variants. Cached reference scores allow prediction without rerunning ESM. The model supports candidate prioritization; its development metrics do not establish experimental success for new variants.

**Evidence:** [matched ablations](data/ablation_metrics.csv), [Top-K results](data/topk_random_comparison.csv), [comparison protocols](history/README.md#iteration-5) and [reusable prediction package](../puf_reuse/README.md).

The five iterations document changes in modelling decisions and their supporting evidence. No assay measurements, weights, partitions or scientific thresholds were changed for this DBTL revision.
