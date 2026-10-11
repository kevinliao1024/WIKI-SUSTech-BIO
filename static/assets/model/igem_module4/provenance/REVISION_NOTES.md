# Module 4 revision notes

## Scope and structure

- Organized the main Wiki as background, model overview, results, interpretation, conclusion, availability and references, following the Module 3 narrative pattern.
- Recast the DBTL record into six explicit Design–Build–Test–Learn cycles, with original observations separated from proposed follow-up experiments.
- Applied the nature-polishing skill to an algorithmic document in English, using introduction, methods, results, discussion, conclusion and title guidance.
- Preserved reported thresholds, reference versions, window sizes, overlap, split counts, hyperparameters and evaluation metrics without generating new model results.
- Followed the user's revised text-only scope. No drawings, figure placeholders, synthetic training curves or reconstructed original training code are included.

## Evidence and interpretation

All project-specific quantitative results in the polished text are summaries from the supplied `WIKI.md` and `DBTL.md` drafts. They were not recomputed or independently verified against raw data, model outputs or original logs. The language has been adjusted accordingly.

| Issue | Source observation | Editorial treatment |
|---|---|---|
| Undefined editor name | `PUF-LIKER-APOBEC` appears without a construct definition. | Retained verbatim; no expansion or guessed correction of LIKER. |
| Uncertain negative labels | Unobserved cytidines and windows are labelled negative. | Describe nominal negatives and condition-specific non-detection, avoiding confirmed non-editability. |
| Adaptation evaluation | Masked prediction accuracies are 0.505 and 0.575. | Retain both values; independent holdout and masking protocol are unknown. |
| GENCODE chronology | Draft references GENCODE v50 as 2025. | Correct bibliographic year to 2026; official history records release in June 2026 and freeze in May 2025. |
| Reference contigs | All-region GTF is paired with a primary-assembly genome FASTA. | Preserve filenames; flag patch/alternate contig compatibility and extraction filtering for confirmation. |
| Transcriptome size | 644,292 sequences and 1,443,754,799 nucleotides are reported. | Preserve as reported counts; extraction was not reproduced. |
| Split timing | Wiki describes transcript-level partitioning before training; DBTL specifies partitioning before window generation. | Preserve transcript-level splitting and follow the more specific DBTL timing; confirm implementation with split and window records. |
| Leakage | Same-transcript partitioning is reported. | State reduction of same-transcript overlap; gene, isoform and homology leakage remain unverified. |
| Evaluation composition | Stage I test has 140 positive windows of 212 total. | State approximately 66.0% positive prevalence; avoid extrapolation to a representative transcriptome-wide screen. |
| Stage I selection | Validation PR-AUC 0.813 and test PR-AUC 0.722 are reported. | Preserve both; inference threshold, candidate reduction and complete-pipeline sensitivity are unknown. |
| Stage I ablations | Lower losses, modest PR-AUC separation and a modest human-adapted advantage are described qualitatively. | Preserve the project's qualitative observations; no quantified superiority or independent curve verification. |
| Stage II PR-AUC | Approximately 0.2, with no exact value or named partition. | Retain approximation and flag missing evaluation context. |
| Ranking units | n=150 validation and n=140 test are labelled transcripts but equal positive-window counts. | Use reported evaluated units, preserving the source label and stating the unresolved transcript-window mapping. |
| Ranking aggregation | Hit, recall and best-rank summaries are supplied. | Preserve all values; do not invent deduplication, tie handling or recall averaging conventions. |
| Prospective validation | Experimental confirmation is proposed. | Keep prospective wording; no claim of newly confirmed off-target sites. |

The median best rank of 4 is reported as a dataset summary, without extending it to a biological guarantee for each region. Hit@10 and Hit@20 are interpreted within the reported ranking set. They are not described as sensitivity of the complete two-stage pipeline.

## Information needed with future result files

1. RNA-seq call tables, sample identities, mapping conventions, retained-site counts and filtering records.
2. Transcript-extraction commands, `gffread` version, contig compatibility report and generated FASTA counts.
3. Transcript-level split assignments, gene/isoform relationships, window coordinates and site deduplication rules.
4. Original and human-adapted checkpoint identifiers, continued-pretraining configuration and masked-evaluation partition.
5. Optuna histories, software versions, training traces and matched baseline or ablation settings.
6. Stage I inference threshold, retained candidate counts and Stage II predictions before ranking.
7. Definitions of the ranking evaluation unit, aggregation method and treatment of overlapping windows, ties and units without supported sites.
8. Prospective experimental measurements with biological replication and editor/context metadata.

## Citation verification

Citation checks covered the LAMAR paper, official upstream code repository, model-hosting location and GENCODE release pages. The published LAMAR background is distinguished from this project's unverified summaries. References do not substitute for missing project-specific results.

## Validation performed for this release

Text checks cover preserved tables, terminology, sentence length, unresolved scientific claims and local Markdown links. These checks validate document consistency only. They do not establish computational reproduction or experimental validation.
