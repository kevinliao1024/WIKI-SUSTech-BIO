---
title: Model
heading: Modeling decisions for RNA editing.
subtitle: Connecting measured editing profiles, protein design and off-target site prioritization in the ORCA project.
eyebrow: Dry Lab · Four Modules
---

For APOE4 editing in Alzheimer's disease research, how can a programmable editor retain useful target activity while reducing unintended RNA editing?

The PUF recognition domain, the APOBEC catalytic domain and the surrounding RNA sequence each contribute a different part of the design problem. The working premise is that **specificity must be interpreted together with retained activity and the scope of measurement**.

**Reliable RNA-seq data underpin the entire workflow.** We iteratively refined parameter handling, read-quality checks, background screening and transcript orientation across 36 libraries. Excluding known matches from four HEK293T SNP catalogues helped distinguish editor-associated signals from genetic variation. Consistent coverage criteria and agreement across four treated biological replicates produced a traceable candidate-site resource for downstream analysis and model-label assessment.

**PUF modeling connected predictions to experimentally useful variants.** Before building new PUF constructs, we used model predictions to select five candidates for wet-lab testing. We then built and tested those candidates, using the measured outcomes to guide the next modeling iteration. Within that panel, the double-repeat SNE construct increased C388 by **7.77 percentage points**, while reducing C295 and C871 by **13.15 and 34.90 points**, respectively, relative to its matched control. Subsequent grouped evaluation of the PUF-ESM Specificity Ranker reached **Spearman ρ = 0.405** across 66 constructs. Its predicted Top30 recovered **20 of the measured Top30**, compared with 13.64 expected from random selection. In the separate RNA-seq comparison, GVE and SNE retained **97.0% and 66.0% fewer candidate sites** than PUF12, respectively. Both retained apparent C388 signals, which include endogenous T. Together, these measurements connect favorable three-site profiles with narrower transcriptome-wide candidate sets, while keeping the experimental panels distinct.

**APOBEC engineering completed a structure-to-experiment feedback loop.** Structural hypotheses guided single-mutant screening, experimental measurements informed combination design, and follow-up assays tested the resulting leads. The lead combination achieved a **target-to-comparison-site ratio of 2.156 while retaining 77.3% of parental target activity**, meeting both engineering criteria in the same batch. These results established a concrete route for improving substrate preference while preserving useful activity.

**LAMAR narrowed the search for off-target sites.** Human-transcript adaptation and cytidine ranking translated RNA-seq-supported patterns into shortlists for follow-up. In the reported Stage II test summary, the top 10 and top 20 candidates contained a supported site in **77.9% and 92.1% of 140 positive regions**, respectively. The median best rank was **four**. These regional rankings define a practical screening budget. Future applications include additional cell lines and species, using context-specific RNA-seq profiles to guide model adaptation.

**Toward RNA editing for Alzheimer's disease.** Published work has demonstrated PUF–APOBEC-mediated editing of APOE transcripts in cells (Han et al., 2025). ORCA connects that disease-relevant direction to a measurable engineering objective: retain intended RNA editing while reducing unwanted changes elsewhere. By linking experimental feedback, transcriptome-wide assessment and candidate prioritization, our modeling framework supports editor selection for disease-model studies that connect transcript conversion with APOE protein function and cellular outcomes.

1. **Measure the editing profile.** Module 1 compares target signals and transcriptome-wide candidate sites under a common screening procedure. This gives the project an evidence base for distinguishing reduced unwanted editing from a general loss of activity.
2. **Choose PUF variants.** Module 2 ranks recognition-domain variants against the measured balance between C388 and two comparison sites. Structure-conditioned sequence design provides additional substitutions to investigate.
3. **Engineer APOBEC preference.** Module 3 uses protein–RNA structures to propose catalytic-domain changes, then assesses substrate preference alongside retained activity. Experimental results determine which designs remain useful leads.
4. **Prioritize further site validation.** Module 4 adapts LAMAR to rank RNA regions and cytidines using RNA-seq-derived labels. Its intended output is a manageable candidate list for off-target testing.

The four modules connect candidate-site profiles, recognition-domain ranking, catalytic preference and RNA-context prioritization into a coordinated editor-design workflow.

Each module supplies evidence for the next design decision. PUF and APOBEC modeling guide complementary changes to recognition and catalytic preference. Reporter measurements establish the balance between activity and selectivity, RNA-seq describes the broader editing profile, and LAMAR prioritizes sites for follow-up. Together, these results guide editor selection for APOE4 RNA-editing research.
