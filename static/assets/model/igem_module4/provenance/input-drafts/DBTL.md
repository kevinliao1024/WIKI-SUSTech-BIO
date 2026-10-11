\# Module X | Design-Build-Test-Learn cycle for LAMAR-guided off-target prioritization



\## Overview



The PUF-LIKER-APOBEC system is designed to perform programmable C-to-U RNA editing. RNA-seq identifies experimentally supported editing events, but does not by itself predict which unmeasured cytidines could become off-target sites in future editor designs or experimental contexts.



We therefore developed a LAMAR-based computational module to prioritize potential off-target cytidines for validation. The module was refined through a Design-Build-Test-Learn cycle that addressed three engineering challenges:



1\. adapting a general RNA language model to human transcripts;

2\. learning from sparse RNA-seq-derived positive editing labels;

3\. avoiding the assumption that every unobserved cytidine is a confirmed negative site.



\## Cycle 1 | Adapt a general RNA language model to the human transcriptome



\*\*Difficulty.\*\* LAMAR was pretrained on RNA sequences from diverse mammalian and viral species. This broad training corpus provides general RNA sequence representations, but our editor was tested in human cells and acts on human transcripts. Sequence distributions, transcript structures and regulatory contexts may differ between the original pretraining corpus and the human transcriptome.



\*\*Design.\*\* We hypothesized that continued masked language model pretraining on human transcript sequences would adapt LAMAR representations toward the sequence context relevant to our system.



\*\*Build.\*\* We generated a human transcriptome FASTA file using `gffread`, GENCODE v50 annotation and the GRCh38 primary genome assembly.



| Resource | Value |

|---|---|

| Annotation | `gencode.v50.chr\_patch\_hapl\_scaff.annotation.gtf` |

| Genome | `GRCh38.primary\_assembly.genome.fa` |

| Transcriptome output | `gencode.v50.transcripts.fa` |

| Transcript sequences | 644,292 |

| Total nucleotides | 1,443,754,799 |



Starting from the original LAMAR checkpoint, we continued masked language model training on these human transcript sequences. LAMAR uses a bidirectional Transformer encoder with 12 layers, 12 attention heads, a hidden dimension of 768 and single-nucleotide tokenization.



\*\*Test.\*\* We evaluated masked nucleotide prediction accuracy on human transcript sequences.



| Model | Masked prediction accuracy |

|---|---:|

| Original LAMAR | 0.505 |

| Human-adapted LAMAR | 0.575 |



\*\*Learn.\*\* Continued pretraining improved masked nucleotide prediction accuracy from 0.505 to 0.575. This result supports the use of human-transcriptome adaptation before editing-site prediction.



The improvement demonstrates better reconstruction of masked human transcript sequences. It does not by itself prove that every downstream editing prediction will improve, so downstream fine-tuning was evaluated separately.



\*Training loss and masked prediction accuracy across continued-pretraining steps.\*



Figure 1. Continued pretraining of LAMAR on human transcript sequences. The figure should display training loss and masked nucleotide prediction accuracy over training steps.



\## Cycle 2 | Define high-confidence positive editing labels from RNA-seq



\*\*Difficulty.\*\* RNA-seq candidate calls vary in confidence. Weakly supported sites could introduce noise into model training, whereas overly restrictive filtering could remove biologically relevant low-frequency editing events.



\*\*Design.\*\* We selected a reproducible high-confidence positive-site definition based on sequencing support and coverage. These labels were used as observed editing evidence, rather than as a complete description of all editable cytidines.



\*\*Build.\*\* We retained RNA-seq candidate sites only when they met both criteria:



\- Editing-supporting reads: at least 20

\- Total sequencing depth: at least 100



The corresponding transcript-oriented sequences were then used to construct model inputs. Because the PUF-LIKER-APOBEC system performs C-to-U editing, cytidines were used as candidate nucleotides for site-level prediction.



\*\*Test.\*\* The resulting positive-site set supplied reproducibly supported editing labels for training. The depth and read-support thresholds reduced uncertainty among positives, but did not transform all remaining cytidines into validated negatives.



\*\*Learn.\*\* Positive evidence can be defined stringently from RNA-seq, but absence of observed editing is not equivalent to absence of editability. This distinction became central to the redesign of the prediction task.



\## Cycle 3 | Direct cytidine-level classification revealed an unreliable negative-label assumption



\*\*Difficulty.\*\* Our first model treated RNA-seq-detected editing sites as positives and all other transcriptomic cytidines as negatives.



The intended task was:



```text

101-nt sequence centered on C

&#x20;       |

&#x20;       v

Edited / not edited

```



This design produced poor predictive performance.



\*\*Design.\*\* The original assumption was that experimentally observed sites represented positive examples and unobserved cytidines represented negative examples.



\*\*Build.\*\* We constructed cytidine-centered windows and trained a token-level binary classifier to distinguish observed editing sites from other cytidines.



\*\*Test.\*\* Performance was unsatisfactory. We identified two major limitations.



First, the dataset was extremely imbalanced. The number of RNA-seq-supported editing sites was much smaller than the number of transcriptomic cytidines.



Second, the negative labels were uncertain. A cytidine may be absent from the observed positive set because of low coverage, low expression, limited sequencing sensitivity, low editing rate or experimental context. Such a site may still be editable under another condition or at a level below the current detection threshold.



\*\*Learn.\*\* A model trained to reproduce currently observed labels may learn experimental detection patterns instead of biological susceptibility to editing.



This led to the following engineering principle:



Unknown cytidines should not automatically be interpreted as confirmed non-editable sites.



The next design therefore changed the task from transcriptome-wide binary classification to hierarchical candidate prioritization.



\## Cycle 4 | A two-stage model enriched candidate regions before cytidine ranking



\*\*Difficulty.\*\* Directly predicting individual editable cytidines across the entire transcriptome retained both severe imbalance and uncertain-negative problems.



\*\*Design.\*\* We separated the task into two stages:



```text

Stage I:

Identify 1,024-nt transcript regions likely to contain editing sites

&#x20;       |

&#x20;       v

Stage II:

Rank cytidines within the enriched candidate regions

```



This design changes the operational question from:



Which cytidines across the whole transcriptome are edited?



to:



Which cytidines within candidate regions should be tested first?



\*\*Build.\*\* In Stage I, transcripts containing RNA-seq-supported editing sites were divided into 1,024-nt windows with 128-nt overlap. A window was labeled positive if it contained at least one observed editing site and negative if it did not.



The dataset was split at the transcript level before window generation for each partition. This reduced the risk that highly similar windows from the same transcript would appear in both training and evaluation datasets.



| Split | Total windows | Positive windows | Negative windows |

|---|---:|---:|---:|

| Training | 3,835 | 2,643 | 1,192 |

| Validation | 213 | 150 | 63 |

| Test | 212 | 140 | 72 |



The Stage II model extracted a 101-nt window centered on each cytidine in the corresponding Stage I sequences. It assigned a score to the central cytidine indicating its association with experimentally observed C-to-U editing.



\*\*Test.\*\* Stage I achieved a best validation PR-AUC of 0.813 and a test PR-AUC of 0.722.



| Dataset | Stage I PR-AUC |

|---|---:|

| Validation | 0.813 |

| Test | 0.722 |



\*\*Learn.\*\* The region-level classifier could enrich transcript windows containing experimentally supported editing sites. This made downstream cytidine-level ranking more practical than a direct transcriptome-wide scan.



\*Two-stage candidate-prioritization workflow.\*



Figure 2. Stage I identifies candidate 1,024-nt regions. Stage II ranks cytidines using 101-nt centered sequence windows. High-scoring cytidines remain candidates requiring experimental confirmation.



\## Cycle 5 | Pretrained representations improved fitting, while evaluation exposed a generalization limit



\*\*Difficulty.\*\* A model can show reduced training loss without showing a corresponding increase in validation precision-recall performance. We therefore needed to distinguish the ability to fit the available training data from the ability to generalize to held-out transcript sequences.



\*\*Design.\*\* We compared four Stage I training conditions:



\- human-transcriptome continued-pretrained LAMAR with fine-tuning;

\- original LAMAR with fine-tuning;

\- encoder-frozen LAMAR variants;

\- randomly initialized model training.



\*\*Build.\*\* All variants used the same broad architecture and Stage I dataset. The model used a LAMAR-based Transformer encoder and linear binary classification head. Hyperparameters were optimized using Optuna. Model selection was based on validation PR-AUC.



The selected Stage I configuration used:



| Hyperparameter | Value |

|---|---|

| Learning rate | 5e-4 |

| Weight decay | 7.9194e-6 |

| Batch size per device | 4 |

| Gradient accumulation | 2 |

| Token dropout | 0.0 |

| Warmup ratio | 0.05338 |

| Maximum epochs | 15 |

| Early stopping patience | 10 |

| Selection metric | PR-AUC |



\*\*Test.\*\* Fine-tuning from the continued-pretrained and original LAMAR checkpoints produced substantially lower training losses than encoder-frozen and randomly initialized conditions. The continued-pretrained model showed a modest advantage in validation PR-AUC, but the separation between PR-AUC curves was smaller than the separation between training-loss curves.



\*\*Learn.\*\* Pretrained RNA representations clearly improved optimization on the available dataset. However, the modest PR-AUC separation suggests that the present downstream task is constrained by more than representation quality alone.



Possible contributors include limited training-set size, uncertainty in negative labels and the intrinsic difficulty of predicting single-nucleotide editing from local sequence alone. These observations are consistent with limited generalization.



\*Training loss and validation PR-AUC for continued-pretrained LAMAR, original LAMAR, encoder-frozen variants and randomly initialized models.\*



Figure 3. Stage I model comparison. Fine-tuned continued-pretrained and original LAMAR models showed lower training loss than encoder-frozen and randomly initialized models. PR-AUC differences were more limited, indicating that downstream performance is constrained by the available editing-label dataset and task complexity.



\## Cycle 6 | Ranking metrics aligned model evaluation with experimental use



\*\*Difficulty.\*\* The Stage II cytidine-level classifier achieved low PR-AUC, around 0.2. This indicated that the model was not sufficiently reliable for direct edited/non-edited classification across all cytidines.



However, binary classification was not the only relevant experimental objective. Wet-lab validation can test a limited number of candidates from each predicted region.



\*\*Design.\*\* We evaluated whether the Stage II model ranked true editing sites near the top among all cytidines within a 1,024-nt candidate region.



We used the following ranking metrics:



\- Hit@K: fraction of regions with at least one true editing site among the top K predicted cytidines;

\- Recall@K: fraction of true editing sites recovered among the top K predictions;

\- MRR: mean reciprocal rank of the highest-ranked true editing site;

\- Best rank: rank of the highest-scoring true editing site in each region.



\*\*Build.\*\* For each Stage I candidate region, Stage II scored all cytidines. Cytidines were sorted from highest to lowest predicted score, and the ranking was compared with RNA-seq-supported editing labels.



\*\*Test.\*\* The independent test set included 140 evaluated transcripts.



| Metric | Test result |

|---|---:|

| Hit@1 | 0.243 |

| Hit@5 | 0.607 |

| Hit@10 | 0.779 |

| Hit@20 | 0.921 |

| Recall@5 | 0.373 |

| Recall@10 | 0.573 |

| Recall@20 | 0.792 |

| MRR | 0.406 |

| Mean best rank | 7.429 |

| Median best rank | 4 |



The validation set showed similar ranking behavior across 150 evaluated transcripts.



| Metric | Validation result |

|---|---:|

| Hit@1 | 0.247 |

| Hit@5 | 0.607 |

| Hit@10 | 0.847 |

| Hit@20 | 0.953 |

| Recall@5 | 0.381 |

| Recall@10 | 0.635 |

| Recall@20 | 0.841 |

| MRR | 0.409 |

| Mean best rank | 6.527 |

| Median best rank | 4 |



\*\*Learn.\*\* Although Stage II did not support high-confidence absolute classification, it showed useful candidate-ranking performance.



On the independent test set:



\- approximately 60.7% of regions contained a true editing site in the top 5 ranked cytidines;

\- approximately 77.9% of regions contained a true editing site in the top 10;

\- approximately 92.1% of regions contained a true editing site in the top 20.



The median best rank was 4. This means that, for a typical evaluated candidate region, the highest-ranked true editing site appeared among the first four proposed cytidines.



The model is therefore more useful as an experimental prioritization tool than as a standalone binary classifier.



Figure 4. Stage II ranking performance on the independent test set. The model prioritizes cytidines for experimental follow-up. Hit@K indicates whether at least one experimentally supported editing site appears among the top K scored cytidines in a candidate region.



\## Next DBTL cycle | Experimental validation will improve the model



The current workflow produces ranked candidate cytidines for targeted validation. The next cycle will use these predictions to generate more informative training evidence.



\*\*Design.\*\* Select high-ranked cytidines from Stage I-positive regions for targeted experimental validation. Include selected low-ranked candidates as controls to assess whether ranking scores correspond to observed editing probability.



\*\*Build.\*\* Measure editing at selected candidates using targeted sequencing or other site-specific validation assays. Perform validation across relevant PUF and APOBEC editor variants where possible.



\*\*Test.\*\* Compare experimentally measured editing outcomes with Stage II ranks. Evaluate precision among top-ranked candidates, false-positive rates, ranking calibration and consistency across biological replicates.



\*\*Learn.\*\* Add newly validated editing sites to the positive dataset. Validated non-edited candidates will provide more reliable negative evidence than transcriptome-wide unobserved cytidines. This feedback can support editor-specific models and improve the biological relevance of future predictions.



Future model versions may additionally incorporate:



\- local RNA secondary structure;

\- transcript abundance and sequencing coverage;

\- RNA accessibility;

\- PUF-binding sequence features;

\- APOBEC variant identity;

\- cell-type-specific transcript expression;

\- independently validated negative examples.



\## Engineering conclusion



The LAMAR-guided workflow transformed a difficult transcriptome-wide binary classification problem into an experimentally actionable candidate-prioritization task.



Continued pretraining improved human-transcript masked nucleotide prediction accuracy from 0.505 to 0.575. The Stage I model enriched 1,024-nt regions containing RNA-seq-supported editing sites with a test PR-AUC of 0.722. Although Stage II cytidine-level PR-AUC remained limited, its ranking performance identified a true editing site within the top 10 candidates in approximately 77.9% of independent test regions and within the top 20 in approximately 92.1%.



These results support using the model as a computational screening layer in the next editor-engineering cycle. The model reduces the number of cytidines requiring experimental follow-up while preserving experimental validation as the final standard for confirming off-target editing.



\## References



Zhou, H., Hu, Y., Zheng, Y., Li, J., Peng, J., Hu, J., ... \& Wang, Z. (2025). A foundation language model to decipher diverse regulation of RNAs. \*Genome Biology\*, 26(1), 301.



GENCODE. (2025). GENCODE human release 50. https://www.gencodegenes.org/human/



Pertea, G., \& Pertea, M. (2020). GFF utilities: GffRead and GffCompare. \*F1000Research\*, 9, ISCB Comm J-304. https://doi.org/10.12688/f1000research.23297.2

