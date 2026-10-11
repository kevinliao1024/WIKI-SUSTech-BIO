# Module 4 | LAMAR-guided off-target prioritization

## Background

Programmable RNA editing must balance desired activity with control over unintended changes elsewhere in the transcriptome. RNA sequencing (RNA-seq) identifies observed editing events, but testing every transcriptomic cytidine experimentally is impractical. A useful computational workflow should therefore prioritize candidates while preserving experimental confirmation as the standard for assessing off-target editing.

Our PUF-LIKER-APOBEC editing system performs C-to-U conversion, and we sought to prioritize cytidines for targeted follow-up. Two features of the available RNA-seq labels complicate this prediction task. Supported editing sites are sparse relative to all transcriptomic cytidines, creating substantial class imbalance. Moreover, unobserved cytidines may reflect limited coverage, low expression or condition-dependent editing rather than biological resistance to editing.

We organized the task into two stages using the LAMAR RNA foundation model. Stage I scores transcript windows for association with supported editing sites. Stage II ranks cytidines within candidate regions, providing a short list for experimental evaluation. This approach focuses the experimental search while keeping biological confirmation central to candidate assessment.

## Model overview

### Foundation model and human-transcriptome adaptation

LAMAR uses a bidirectional Transformer encoder with 12 layers, 12 attention heads, a hidden dimension of 768 and rotary positional embeddings. Its nucleotide vocabulary is `{A, T, C, G, N}`, with special tokens including `<cls>`, `<eos>`, `<mask>` and `<pad>`. The LAMAR-2k configuration supports sequence contexts of up to 2,048 nucleotides.

The published model was pretrained on approximately 15 million RNA sequences from 225 mammalian species and 1,569 mammal-infecting viral species. Its corpus included mRNAs, non-coding RNAs and annotated genes from RefSeq and RNAcentral. Clustering at 80% sequence identity yielded approximately 267 billion nucleotide tokens. Published applications include splice-site prediction, translation efficiency, RNA stability and internal ribosome entry site activity. [Zhou et al., 2025](https://doi.org/10.1186/s13059-025-03752-x).

We continued masked language modelling on human transcript sequences before downstream fine-tuning. This objective reconstructs masked nucleotides from their sequence context without using editing-site labels. Transcript sequences were generated with `gffread` using the following reference inputs. [Pertea and Pertea, 2020](https://doi.org/10.12688/f1000research.23297.2).

| Resource | Value |
|---|---|
| Gene annotation | `gencode.v50.chr_patch_hapl_scaff.annotation.gtf` |
| Genome sequence | `GRCh38.primary_assembly.genome.fa` |
| Transcriptome output | `gencode.v50.transcripts.fa` |
| Transcript sequences | 644,292 |
| Total nucleotides | 1,443,754,799 |

We retained GENCODE v50 and the GRCh38 reference inputs used for transcript extraction. GENCODE human release 50 was released in June 2026, as recorded in its official release history. [GENCODE v50](https://www.gencodegenes.org/human/release_50.html); [release history](https://www.gencodegenes.org/human/releases.html).

### RNA-seq-supported editing labels

A candidate site entered the positive-label set only when both supplied read-support criteria were met.

| Criterion | Retained threshold |
|---|---:|
| Editing-supporting reads | ≥20 |
| Total sequencing depth | ≥100 |

These thresholds define the project's supported positive labels and remain unchanged. Cytidines outside that set represent unobserved sites under the measured conditions. They are nominal negatives during classification, rather than experimentally confirmed non-editable sites. All sequences were represented in transcript orientation, with cytidines serving as candidates for site-level prediction.

### Two-stage candidate prioritization

Stage I uses transcript windows to identify regions associated with editing evidence. Transcripts containing supported sites were divided into 1,024-nt windows with 128-nt overlap. A window was labelled positive when it contained at least one supported editing site. Windows without detected sites received nominal negative labels, retaining the uncertainty described above.

The dataset was partitioned by transcript, with approximately 90%, 5% and 5% allocated to training, validation and testing. Windows were then generated within each partition for the downstream models. This design reduces overlap between windows from the same transcript across partitions. Leakage through related isoforms, shared genes or homologous sequences was not assessed.

| Split | Total windows | Positive windows | Nominal negative windows |
|---|---:|---:|---:|
| Training | 3,835 | 2,643 | 1,192 |
| Validation | 213 | 150 | 63 |
| Test | 212 | 140 | 72 |

Stage II extracts a 101-nt sequence centred on each cytidine in the corresponding Stage I sequences. Its binary-classification head assigns an editing-associated score to the central cytidine. At inference, the proposed workflow applies Stage II within regions prioritized by Stage I. Cytidines are sorted by score to guide subsequent experimental testing.

The two-stage design focuses scoring on candidate regions rather than treating every transcriptomic cytidine as equally relevant. It does not resolve uncertain negative labels or establish a calibrated probability of biological editability. Candidate selection therefore requires further evaluation alongside the experimental screening budget.

### Training configuration

Both stages used the LAMAR encoder with a linear binary-classification head. Hyperparameters were optimized with Optuna, using the shared architecture described below. The fixed random seed defines a computational setting rather than biological replication.

| Parameter | Value |
|---|---|
| Hidden size | 768 |
| Intermediate size | 3,072 |
| Attention heads | 12 |
| Transformer layers | 12 |
| Positional embedding | Rotary |
| Output labels | 2 |
| Classification head | Linear |
| Stage I maximum sequence length | 1,026 tokens, including special tokens |
| Random seed | 42 |

Stage I used validation PR-AUC, the area under the precision–recall curve, for model selection. Training allowed up to 15 epochs, with early-stopping patience set to 10 epochs. Stage II was optimized separately, using the selected settings listed alongside Stage I.

| Hyperparameter | Stage I | Stage II |
|---|---|---|
| Batch size per device | 4 | Not separately stated |
| Gradient accumulation steps | 2 | Not separately stated |
| Batch configuration | `batch4_accum2` | `batch4_accum2` |
| Learning rate | `5e-4` | `1.0139e-5` |
| Weight decay | `7.9194e-6` | `6.6122e-5` |
| Token dropout | `0.0` | `8.9809e-4` |
| Warmup ratio | `0.05338` | `0.09762` |
| Maximum epochs | 15 | Not stated |
| Early-stopping patience | 10 | Not stated |
| Selected Optuna trial | Not stated | 10 |

## Results

### Continued pretraining improved masked nucleotide prediction accuracy

Masked nucleotide prediction accuracy increased after continued pretraining on human transcript sequences. The original and human-adapted checkpoints reached accuracies of 0.505 and 0.575, respectively.

| Model | Masked nucleotide prediction accuracy |
|---|---:|
| Original LAMAR | 0.505 |
| Human-adapted LAMAR | 0.575 |

This improvement reflects better masked reconstruction within the evaluated human transcript sequences. The independence of that evaluation from continued-pretraining sequences remains to be confirmed. Better sequence reconstruction does not, by itself, establish improved downstream editing prediction.

### Direct classification motivated a change in task formulation

The initial design classified 101-nt cytidine-centred sequences as edited or unedited. It treated supported editing sites as positives and other transcriptomic cytidines as nominal negatives. The initial classifier performed poorly under this original label definition.

Class imbalance and uncertain negatives were considered plausible contributors to the poor performance. Their individual effects were not isolated by the available model comparisons. The engineering response was to prioritize candidate regions and rank their cytidines for experimental follow-up.

### Stage I distinguished windows associated with observed editing

Stage I reached a best validation PR-AUC of 0.813 and a test PR-AUC of 0.722. Validation performance was used for model selection, while the test partition provided a separate evaluation.

| Evaluation partition | Stage I PR-AUC |
|---|---:|
| Validation, best value | 0.813 |
| Test | 0.722 |

The dataset was constructed from transcripts containing supported sites, rather than a representative sample of the full transcriptome. Positive windows accounted for 140 of 212 test windows, approximately 66.0%. This enriched composition limits extrapolation of PR-AUC to a transcriptome-wide screen. The result does not quantify the candidate reduction or sensitivity of a specified Stage I selection threshold.

Comparisons included original LAMAR, encoder-frozen variants and randomly initialized models. Fine-tuned pretrained models showed lower training losses, while differences in validation PR-AUC were more limited. Human-adapted LAMAR showed a modest validation PR-AUC advantage in these qualitative comparisons. This pattern distinguishes improved fitting from downstream performance without establishing a quantified gain from continued pretraining.

### Stage II supported ranking-oriented evaluation

Stage II cytidine-level PR-AUC was approximately 0.2, indicating limited classification performance in the evaluated setting. This result did not support confident absolute discrimination of individual editing sites. We therefore evaluated ranking performance to match the intended experimental use of a limited candidate list.

| Metric | Definition |
|---|---|
| Hit@K | Fraction of evaluated units containing at least one supported site among their top K cytidines |
| Recall@K | Fraction of supported sites recovered among the top K cytidines within an evaluated unit |
| Mean reciprocal rank (MRR) | Mean reciprocal rank of the highest-ranked supported site across evaluated units |
| Best rank | Rank of the highest-ranked supported site within an evaluated unit |

The validation and test ranking denominators were 150 and 140, respectively. These units are labelled transcripts in the source, although the numbers also match Stage I positive-window counts. Their mapping to windows requires confirmation before transcript-level interpretation or complete-pipeline evaluation.

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

Within the test ranking set, Hit@10 and Hit@20 were 0.779 and 0.921, respectively. Thus, approximately 77.9% and 92.1% of evaluated units contained a supported site within those candidate budgets. The median best rank was 4 across the evaluated test units. These results describe recovery within the evaluated ranking set, rather than sensitivity of the complete two-stage workflow.

## Interpretation and limitations

Candidate ranking is the present engineering use supported by this module. Stage I associates sequence windows with observed editing labels, while Stage II orders cytidines for experimental follow-up. Neither stage establishes whether an unobserved site is biologically non-editable under another condition.

Interpretation remains constrained by label uncertainty, an enriched evaluation dataset and unresolved ranking units. Transcript-level partitioning addresses overlap from individual transcripts, but does not establish independence across isoforms or related sequences. The complete workflow still requires evaluation of candidate reduction and supported-site recovery at an explicit Stage I threshold.

Generalization across editor variants, biological replicates or cell contexts remains an open question. Ranking calibration and experimental confirmation of newly proposed off-target sites also require further study. These boundaries define the next iteration of computational and experimental evaluation.

## Conclusion

This module reframes off-target prediction as candidate prioritization using a human-adapted RNA foundation model. Stage I test PR-AUC was 0.722, and Stage II test Hit@10 was 0.779 within their respective evaluation sets. These results motivate targeted follow-up while requiring clarification of ranking units before complete-pipeline interpretation.

The next iteration should test selected high-ranked and low-ranked candidates with matched assays and documented biological replication. Newly measured editing outcomes can strengthen the evidence used for future model development. Complete-pipeline performance and transfer across experimental contexts require separate evaluation before broader specificity claims are justified.

## Data and code availability

This text-only release contains the Wiki, DBTL record and their [original text inputs](../provenance/input-drafts/). Project-specific numbers are preserved from those inputs and await reconciliation with the original results. The [revision notes](../provenance/REVISION_NOTES.md) record outstanding evidence and the required reproducibility details. Raw RNA-seq calls, split assignments, project checkpoints, training logs and per-site predictions are not included in this package.

The external LAMAR implementation is available from the [official code repository](https://github.com/rnasys/LAMAR), with pretrained weights hosted on [Hugging Face](https://huggingface.co/zhw-e8/LAMAR). Project-specific training code is not included in the current documentation package.

## References

1. Zhou, H. et al. A foundation language model to decipher diverse regulation of RNAs. *Genome Biology* **26**, 301 (2025). [doi:10.1186/s13059-025-03752-x](https://doi.org/10.1186/s13059-025-03752-x).
2. GENCODE. Human release 50 (2026). [Release information](https://www.gencodegenes.org/human/release_50.html); [release history](https://www.gencodegenes.org/human/releases.html).
3. Pertea, G. and Pertea, M. GFF utilities: GffRead and GffCompare. *F1000Research* **9**, 304 (2020). [doi:10.12688/f1000research.23297.2](https://doi.org/10.12688/f1000research.23297.2).
