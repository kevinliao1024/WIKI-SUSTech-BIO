# Module 4 | Design–Build–Test–Learn

## Engineering objective

Prioritize potential C-to-U off-target cytidines for targeted validation in the PUF-LIKER-APOBEC RNA editing system. RNA sequencing (RNA-seq) provides observed editing evidence, while unmeasured cytidines remain uncertain candidates. We retained the supplied positive-label thresholds of **editing-supporting reads ≥20 and total depth ≥100**.

This record organizes the design decisions, observed outcomes and proposed next iteration. Computational model development and future experimental validation are described as distinct steps. The next cycle will test prioritized candidates and strengthen the evidence used for model development.

## Cycle 1 | Adapting LAMAR to human transcript sequences

**Design.** We selected continued masked language modelling to adapt the LAMAR RNA foundation model to human transcript sequences. This objective reconstructs masked nucleotides from their context without requiring editing labels. The external pretrained model provided the starting RNA sequence representation. [Zhou et al., 2025](https://doi.org/10.1186/s13059-025-03752-x).

**Build.** We extracted transcript sequences with `gffread` and continued pretraining from the original LAMAR checkpoint. The annotation, genome and transcriptome dataset are summarized in the following table. Transcript extraction used the published GFF utility framework for processing annotation files. [Pertea and Pertea, 2020](https://doi.org/10.12688/f1000research.23297.2).

| Resource | Value |
|---|---|
| Annotation | `gencode.v50.chr_patch_hapl_scaff.annotation.gtf` |
| Genome | `GRCh38.primary_assembly.genome.fa` |
| Transcriptome output | `gencode.v50.transcripts.fa` |
| Transcript sequences | 644,292 |
| Total nucleotides | 1,443,754,799 |

**Test.** Masked nucleotide prediction accuracy increased from **0.505 for original LAMAR to 0.575 for human-adapted LAMAR**. This comparison evaluates reconstruction of masked nucleotides within human transcript sequences.

**Learn.** Improved sequence reconstruction motivated separate evaluation of downstream editing prediction. It does not establish that every downstream task benefits from adaptation. Independence of the masked-evaluation sequences from continued pretraining remains to be confirmed. GENCODE v50 was released in June 2026, as documented in the official release history. [GENCODE release history](https://www.gencodegenes.org/human/releases.html); [GENCODE v50](https://www.gencodegenes.org/human/release_50.html).

## Cycle 2 | Defining supported positive labels without assuming complete negatives

**Design.** We used read support and depth to define the positive editing-label set. These criteria identify supported observations rather than a complete catalogue of editable cytidines.

**Build.** Candidate sites were retained only when editing-supporting reads were at least 20 and total sequencing depth was at least 100. Corresponding sequences were represented in transcript orientation, with cytidines serving as candidates for site-level scoring.

**Test.** Applying both read-support criteria defined the supported positive-label set used for training. These thresholds increased the required sequencing evidence for positives without validating the remaining cytidines as negatives.

**Learn.** A cytidine may remain unobserved because of limited coverage, low expression or condition-dependent editing. Such sites cannot be treated as experimentally confirmed non-editable cytidines. This distinction informed the later change from absolute classification to candidate prioritization.

## Cycle 3 | Revising direct cytidine-level classification

**Design.** The initial model attempted binary classification using 101-nt sequences centred on cytidines. Supported editing sites were positive examples, and other transcriptomic cytidines received nominal negative labels.

**Build.** We trained the model to distinguish observed editing sites from other transcriptomic cytidines. This formulation exposed the model to substantial imbalance and uncertain nominal negatives.

**Test.** The initial classifier performed poorly under the original label definition. Class imbalance and uncertain negative labels were considered plausible contributors. Their individual effects were not isolated by the available comparisons.

**Learn.** Matching detection labels does not necessarily predict editing susceptibility under another condition. We therefore changed the operational task to prioritizing regions and ranking their cytidines. This redesign focuses experimental follow-up without resolving the uncertainty of negative labels.

## Cycle 4 | Separating candidate-region scoring from cytidine ranking

**Design.** Stage I scores 1,024-nt windows for association with supported editing sites. Stage II scores 101-nt cytidine-centred sequences within the corresponding windows. The intended output is an ordered candidate list for targeted follow-up.

**Build.** Transcripts containing supported sites were partitioned by transcript, then divided into windows with 128-nt overlap. A window was positive when it contained at least one supported site. Windows without detected sites remained nominal negatives in the classification dataset.

| Split | Total windows | Positive windows | Nominal negative windows |
|---|---:|---:|---:|
| Training | 3,835 | 2,643 | 1,192 |
| Validation | 213 | 150 | 63 |
| Test | 212 | 140 | 72 |

**Test.** Stage I achieved a best validation PR-AUC of **0.813** and test PR-AUC of **0.722**. PR-AUC denotes the area under the precision–recall curve used for evaluation. The test dataset contained 140 positive windows among 212 windows, approximately 66.0%.

**Learn.** Transcript-level partitioning reduces overlap from windows derived from the same transcript. Independence across isoforms, shared genes and homologous sequences remains unverified. The enriched evaluation dataset limits transcriptome-wide extrapolation, and no inference threshold or candidate-reduction count was supplied. Measuring complete-pipeline sensitivity therefore remains a requirement for the next evaluation.

## Cycle 5 | Distinguishing model fitting from downstream performance

**Design.** We compared human-adapted LAMAR, original LAMAR, encoder-frozen variants and randomly initialized models. These comparisons assessed representation adaptation separately from the ability to fit training data.

**Build.** Both stages used a LAMAR encoder with a linear binary-classification head. Optuna optimized hyperparameters, and validation PR-AUC selected the Stage I model. The recorded seed was 42, and selected settings were as follows.

| Hyperparameter | Stage I | Stage II |
|---|---|---|
| Batch configuration | `batch4_accum2` | `batch4_accum2` |
| Learning rate | `5e-4` | `1.0139e-5` |
| Weight decay | `7.9194e-6` | `6.6122e-5` |
| Token dropout | `0.0` | `8.9809e-4` |
| Warmup ratio | `0.05338` | `0.09762` |
| Maximum epochs | 15 | Not stated |
| Early-stopping patience | 10 | Not stated |
| Selected Optuna trial | Not stated | 10 |

**Test.** Fine-tuned pretrained models showed lower training losses than encoder-frozen and randomly initialized conditions. Human-adapted LAMAR showed a modest validation PR-AUC advantage over the comparison models. Differences in PR-AUC were smaller than the separation between training losses.

**Learn.** Lower training loss and improved evaluation performance answer different questions. The limited PR-AUC separation suggests constraints beyond representation quality alone. Label uncertainty and dataset size remain plausible contributors without establishing a unique explanation.

## Cycle 6 | Evaluating ranking within a limited experimental budget

**Design.** Stage II classification PR-AUC was approximately 0.2, indicating limited site-level classification performance. We therefore evaluated whether supported editing sites appeared near the top of a limited candidate list.

**Build.** Cytidines were ranked from highest to lowest editing-associated Stage II score. Hit@K measures the fraction of evaluated units containing a supported site among their top K cytidines. Recall@K measures the recovered fraction of supported sites within an evaluated unit. Mean reciprocal rank (MRR) averages the reciprocal rank of the highest-ranked supported site.

**Test.** Validation and test evaluation yielded the ranking summaries shown in the following table.

| Metric | Validation | Test |
|---|---:|---:|
| Hit@1 | 0.247 | 0.243 |
| Hit@5 | 0.607 | 0.607 |
| Hit@10 | 0.847 | 0.779 |
| Hit@20 | 0.953 | 0.921 |
| Recall@5 | 0.381 | 0.373 |
| Recall@10 | 0.635 | 0.573 |
| Recall@20 | 0.841 | 0.792 |
| MRR | 0.409 | 0.406 |
| Mean best rank | 6.527 | 7.429 |
| Median best rank | 4 | 4 |
| Reported evaluated units, labelled transcripts | 150 | 140 |

**Learn.** Test Hit@10 and Hit@20 correspond to supported-site recovery in approximately 77.9% and 92.1% of evaluated ranking units. The median best rank was 4 in the evaluated test set. These denominators are labelled transcripts in the source but match the Stage I positive-window counts. Their mapping to windows requires confirmation, and the ranking summaries do not establish complete-pipeline sensitivity.

## Next iteration | Testing prioritized candidates experimentally

**Design.** Select high-ranked cytidines from Stage I-prioritized regions for targeted validation. Include selected low-ranked candidates to assess how ranking corresponds to measured editing outcomes.

**Build.** Measure editing using targeted sequencing or another appropriate site-specific assay. Where feasible, compare relevant PUF and APOBEC variants under matched conditions with documented biological replication.

**Test.** Compare experimental editing outcomes with Stage II ranks and candidate scores. Evaluate precision among top-ranked candidates, false-positive rates, calibration and consistency across biological replicates.

**Learn.** Incorporate newly confirmed editing sites into the positive-label set for subsequent model development. Measurements with adequate detection sensitivity can provide stronger condition-specific negative evidence than unobserved transcriptomic cytidines. This feedback may support editor-specific models after independent evaluation of their performance.

Future models may incorporate local RNA structure, transcript abundance, sequencing coverage, RNA accessibility, PUF-binding features and APOBEC variant identity. Cell-type-specific expression and independently assessed negative examples are additional candidate inputs. These are proposed extensions rather than completed experiments or validated performance improvements.

## Engineering conclusion

The workflow reframes direct classification as hierarchical prioritization of off-target candidates. Stage I scores regions, while Stage II orders cytidines for experimental follow-up. Clarified ranking denominators and prospective testing remain necessary before broader performance claims can be supported.

## Data and code availability

The [Module 4 Wiki](module4.md) contains the model configuration and interpretation boundaries. Numerical summaries are preserved from the [original drafts](../provenance/input-drafts/) and await reconciliation with the original results. The [revision notes](../provenance/REVISION_NOTES.md) record outstanding evidence and the required reproducibility details. The external [LAMAR code](https://github.com/rnasys/LAMAR) and [pretrained weights](https://huggingface.co/zhw-e8/LAMAR) remain available from their respective upstream sources.

## References

1. Zhou, H. et al. A foundation language model to decipher diverse regulation of RNAs. *Genome Biology* **26**, 301 (2025). [doi:10.1186/s13059-025-03752-x](https://doi.org/10.1186/s13059-025-03752-x).
2. GENCODE. Human release 50 (2026). [Release information](https://www.gencodegenes.org/human/release_50.html); [release history](https://www.gencodegenes.org/human/releases.html).
3. Pertea, G. and Pertea, M. GFF utilities: GffRead and GffCompare. *F1000Research* **9**, 304 (2020). [doi:10.12688/f1000research.23297.2](https://doi.org/10.12688/f1000research.23297.2).
