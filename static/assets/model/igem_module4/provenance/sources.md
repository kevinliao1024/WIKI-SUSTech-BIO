# Source and evidence record

Checked on 10 October 2026. The attached drafts provide the module-specific claims; external sources verify background and references only.

| Topic | Evidence status | Source and supporting location | Boundary |
|---|---|---|---|
| Module 4 results, splits, labels and hyperparameters | Reported in supplied drafts | Original `WIKI.md` and `DBTL.md`, preserved in `input-drafts/` | No original predictions, result tables, sequences or training logs were supplied for independent reproduction. |
| LAMAR architecture and pretraining corpus | Published background | [Zhou et al., 2025](https://doi.org/10.1186/s13059-025-03752-x), Results: The pretrained RNA foundation model; Methods: Model architecture | Literature results do not validate Module 4 editing predictions. |
| LAMAR source and checkpoints | Public upstream availability | [Official paper-linked repository](https://github.com/rnasys/LAMAR) and [checkpoint repository](https://huggingface.co/zhw-e8/LAMAR), also linked in the paper's Data availability section | These are upstream resources; the module-specific adapted and fine-tuned checkpoints were not provided. |
| GENCODE v50 release date | Official release metadata | [Human release history](https://www.gencodegenes.org/human/releases.html), release 50 row: release June 2026, freeze May 2025 | Bibliographic year corrected to 2026; reference version remains v50. |
| GENCODE annotation/genome region scope | Official resource descriptions | [Human Release 50](https://www.gencodegenes.org/human/release_50.html), GTF/GFF3 ALL vs PRI and FASTA descriptions | The reported ALL annotation and primary-assembly FASTA have different region scopes. Extraction logs and contig handling are needed to reproduce the draft's transcript count. No reference input was substituted. |
| GffRead citation | Verified bibliographic record | [Pertea and Pertea, 2020](https://pubmed.ncbi.nlm.nih.gov/32489650/), DOI 10.12688/f1000research.23297.2 | The exact module-specific extraction command and software version were not supplied. |
| Text organization | User-supplied examples | Module 1 English pages; Module 2 wiki pages; Module 3 `wiki/module3.md` and `wiki/DBTL.md` | Structure was adapted; module-specific scientific evidence was not transferred between modules. |

The user's later request limited this delivery to text. ORCA drawing and result-file reconciliation are deferred until the user provides results. No attached document directive was treated as authorization to run training, upload content or publish the wiki.
