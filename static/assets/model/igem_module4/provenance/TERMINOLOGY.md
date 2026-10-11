# Module 4 terminology ledger

This ledger fixes terminology for the polished Wiki and Design–Build–Test–Learn record. Source labels remain unchanged where their meaning is unresolved.

| Canonical term | First-use definition | Source variants | Decision |
|---|---|---|---|
| Module 4 | LAMAR-guided off-target prioritization | Module X | Use the requested module number throughout. |
| LAMAR | RNA foundation model from Zhou et al. | LAMAR-based model, RNA language model | Name the external model without inventing an acronym expansion. |
| Human-adapted LAMAR | LAMAR after continued masked language modelling on human transcripts | continued-pretrained LAMAR, human-transcriptome continued-pretrained LAMAR | Use one label for the adapted checkpoint. |
| PUF-LIKER-APOBEC | Editor name supplied by the source drafts | PUF-LIKER-APOBEC system | Preserve verbatim. The meaning of LIKER and the complete construct identity were not supplied. |
| RNA-seq | RNA sequencing | RNA-seq-derived measurements | Expand at first use in each standalone document. |
| C-to-U editing | Conversion of cytidine to uridine in RNA | edited cytidines, RNA editing | Retain biological C-to-U nomenclature. The model's sequence alphabet uses T. |
| RNA-seq-supported editing site | Candidate meeting editing-supporting reads ≥20 and total depth ≥100 | high-confidence positive site, true editing site | Describe observed evidence without implying complete biological ground truth. |
| Unobserved cytidine | Cytidine outside the supplied positive-site set | negative site, non-editable site | Nominal negative labels remain uncertain; do not call these validated non-editable sites. |
| Stage I | 1,024-nt candidate-region classifier | region-level classifier, candidate enrichment | Use Stage I consistently. |
| Stage II | 101-nt cytidine-centred classifier used for ranking | site-level classifier, token-level model | Use Stage II consistently and describe its editing-associated score. |
| Transcript window | A 1,024-nt sequence unit in Stage I | region, transcript region | Use window for dataset counts; use candidate region for the proposed inference workflow. |
| Evaluated ranking unit | Unit underlying reported Stage II ranking averages | evaluated transcripts, candidate regions | Source calls n=150 and n=140 transcripts, matching Stage I positive-window counts. Do not silently equate transcripts and windows. |
| PR-AUC | Area under the precision–recall curve | validation PR-AUC, test PR-AUC | Preserve reported metric; calculation convention was not supplied. |
| Hit@K | Fraction of evaluated units with at least one supported site among their top K cytidines | Hit@K indicates whether | Distinguish aggregate Hit@K from each unit's binary hit indicator. |
| Recall@K | Fraction of supported sites recovered among a unit's top K cytidines | fraction of true sites | Aggregation or averaging convention was not supplied. Preserve reported summaries. |
| MRR | Mean reciprocal rank of the highest-ranked supported site per evaluated unit | reciprocal rank | Expand once and retain reported values. |
| Best rank | Rank of the highest-ranked supported site per evaluated unit | highest-scoring true site | Report supplied mean and median separately. |
| GENCODE v50 | Human annotation release 50, released June 2026 | GENCODE (2025) | Correct the bibliographic year to 2026; retain reference version and input filenames. |
| GRCh38 primary genome assembly | Reported reference genome for transcript extraction | GRCh38 | Preserve the supplied reference; flag contig compatibility with the all-region annotation. |
| gffread | Transcript-extraction program | GffRead | Use lowercase for the executable and the published capitalization in the reference title. |
| Design–Build–Test–Learn (DBTL) | Iterative engineering record | Design-Build-Test-Learn | Use the en-dash form consistently; future experiments remain proposed. |

## Naming collisions requiring confirmation

1. `PUF-LIKER-APOBEC` is preserved as supplied. No expansion or spelling correction is assumed.
2. Ranking denominators labelled transcripts in the drafts equal the positive-window counts. The mapping and deduplication rules are unavailable.
3. Biological RNA contains U, while the LAMAR vocabulary reported in the draft contains T. Token conversion was not specified, so illustrative sequences are omitted.
