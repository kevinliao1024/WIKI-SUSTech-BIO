---
title: Blueprint
subtitle: Map the project structure and connect each module to its supporting records.
eyebrow: Project
status: pending
status_label: Content pending team review
status_message: Replace this navigation framework with a team-reviewed design overview and verified source links.
---

# Blueprint

## Fundamental — Establishing an APOE4-Targeting Editor

Before engineering ORCA as a complete system, we first needed a functional editor for the APOE4 transcript—and a recognition backbone suitable for further optimization. Two initial design–build–test–learn cycles established that foundation.

### Cycle 1 — Adapting 10R-REWIRE to APOE4

#### Design

REWIRE combines a programmable PUF RNA-binding domain with a deaminase in a single protein. Each PUF repeat recognizes one RNA nucleotide, allowing an attached APOBEC domain to be positioned near a chosen cytidine for C-to-U editing [1]. Previous studies suggested that extending PUF recognition from eight to ten nucleotides could improve target discrimination, while PUF-binding affinity does not necessarily increase beyond approximately 9–10 repeats [1,2]. We therefore began with a **10-repeat PUF domain**.

Our 10R construct recognizes APOE4 nucleotides 376–385 (`5′-AUGGAGGACG-3′`). A two-nucleotide UG spacer separates this site from **C388**, and an XTEN linker connects PUF10R to APOBEC. The intended C-to-U edit converts `CGC` to `UGC`, producing the R130C substitution (Figure 1A).

#### Build

We constructed the complete PUF10R–APOBEC editor alongside **PUF10R-only**, **APOBEC-only**, and empty-vector (EV) controls. FLAG Western blotting confirmed expression of the three protein constructs, with β-actin as the loading control (Figure 1B).

#### Test

Amplicon sequencing showed **85.58 ± 0.65% C388 editing** with the complete editor (three biological replicates). Editing remained near background with EV (**0.052 ± 0.024%**), PUF10R-only (**0.10 ± 0.03%**), and APOBEC-only (**0.81 ± 0.21%**) (Figure 1C). Efficient editing therefore required both programmable recognition and catalytic activity.

#### Learn

Strong target editing did not produce uniformly clean APOE RNA. Across the sequenced APOE region, **63 bystander cytidines** showed consistently elevated editing relative to all three controls, including **14 sites predicted to introduce premature stop codons** (Figure 1D). Two prominent examples were **C295/Q99\*** (61.60% editing) and **C871/Q291\*** (87.26%).

More importantly, unwanted edits often occurred **on the same reads as the desired C388 edit**. Among C388-edited reads callable at each respective bystander site, **70.72 ± 2.37%** also carried C295 editing and **93.97 ± 0.39%** carried C871 editing (Figure 1E). These measurements describe bystanders within the sequenced APOE region, not transcriptome-wide off-target activity.

Cycle 1 established a highly active APOE4 editor, but also revealed the central constraint for the next iteration: **target efficiency had to be evaluated together with the integrity of the edited RNA**.

[![Five-panel portrait. A spans the full width and shows a straight ten-repeat PUF array with real repeat names and recognition-residue codes aligned to the APOE RNA sequence; a non-circular APOBEC shape directly engages C388. B shows the source PowerPoint FLAG Western blot and C shows C388 editing with three biological observations per group. D shows 63 APOE bystander sites and explains synonymous, missense and stop-gained symbols. E shows conditional same-read co-occurrence: 70.72 ± 2.37% for C295 and 93.97 ± 0.39% for C871 among C388-edited callable reads.](/assets/images/blueprint/core-editor-cycle-1.png)](/assets/images/blueprint/core-editor-cycle-1.png)

**Figure 1 | Establishing the first APOE4-targeting 10R editor.**<br>
**(A)** PUF10R–XTEN–APOBEC architecture, recognition site, UG spacer, and intended C388 edit. **(B)** FLAG Western blot of PUF10R-only, APOBEC-only, and complete 10R constructs; β-actin loading control. **(C)** C388 editing in the complete-editor and control groups (mean ± SD; *n* = 3 biological replicates). **(D)** Editing landscape across the sequenced APOE region, highlighting 63 elevated bystander sites and their predicted coding consequences. **(E)** Same-read co-editing of C388 with the predicted stop-gained sites C295 and C871.

### Cycle 2 — Selecting the PUF Recognition Backbone

#### Design

To test whether recognition length could change the balance between desired and bystander editing, we designed four PUF arrays extending progressively upstream from the same APOE4 target. All retained a common downstream boundary at nucleotide 385 and the same UG spacer before C388 (Figure 2A):

- **10R:** `5′-AUGGAGGACG-3′` (nt 376–385)
- **12R:** `5′-ACAUGGAGGACG-3′` (nt 374–385)
- **13R:** `5′-GACAUGGAGGACG-3′` (nt 373–385)
- **15R:** `5′-CGGACAUGGAGGACG-3′` (nt 371–385)

This design varied the programmed recognition span while maintaining the local positioning of the catalytic domain at C388.

#### Build

All four editors used the same **ProAPOBEC-1** sequence and XTEN linker. The 10R and 12R constructs shared one vector backbone; 13R and 15R used another, so comparisons involving those variants cannot be attributed solely to repeat number.

We tested the constructs in **three contexts**: a transient reporter assay in WT 293T cells (editor:reporter = 4:1; 1 μg total DNA per 12-well), and an APOE4-stable 293T model receiving either **0.5 μg** or **1.0 μg** editor plasmid per well. PUF10-E72A served as the within-context sequencing control; EV data provided a historical background reference rather than a matched control for each condition. Sequencing comparisons used **two biological replicates per condition**.

#### Test

In this separate comparison series, we assessed C388 editing alongside the **mean C-to-U editing frequency at a fixed set of 290 non-target cytidines** in the APOE coding region. This bystander metric is an average across positions, **not** the percentage of transcripts containing an unwanted edit. We also measured the fraction of callable reads carrying **edited C388 but unedited C871**, directly connecting target editing with avoidance of one damaging bystander (Figure 2B–D).

| Experimental context | C388 editing, 10R → 12R | Mean bystander editing, 10R → 12R | C388 edited / C871 unedited reads, 10R → 12R |
|---|---:|---:|---:|
| Transient reporter | 72.14% → 51.57% | 4.560% → 2.818% | 6.52% → 13.50% |
| APOE4-stable; 0.5 μg editor | 15.59% → 24.11% | 0.650% → 0.940% | 5.61% → 11.87% |
| APOE4-stable; 1.0 μg editor | 42.85% → 37.45% | 2.235% → 1.581% | 10.66% → 18.14% |

*Values are means of two biological replicates within each context. These are descriptive engineering comparisons; the replicate-level distributions are shown in Figure 2.*

Extending 10R to 12R did **not** uniformly reduce absolute bystander activity: both target and mean bystander editing increased in the 0.5 μg stable-cell condition. Nevertheless, the fraction of reads with **C388 edited and C871 unedited increased in all three contexts**. Conditional co-editing at the other highlighted stop-gained site, C295, also decreased with 12R, although these read-level measures do not establish that a transcript is free of *all* bystander edits.

An accompanying APOE/APOE4-labelled Western blot provided qualitative protein-level observations but was **not used to select the recognition backbone** or to infer APOE isoform conversion (Figure 2E).

#### Learn

Longer recognition was not automatically better. **13R** lowered mean bystander editing relative to 12R in all three contexts, but also reduced C388 editing (**28.03% vs 51.57%**, **15.16% vs 24.11%**, and **32.38% vs 37.45%**, respectively). Its fraction of C388-edited/C871-unedited reads exceeded 12R only in the 1.0 μg stable-cell condition (**19.20% vs 18.14%**). **15R** reduced bystander activity further, but C388 editing fell to **3.91%, 2.82%, and 5.99%** across the same contexts.

We therefore selected **PUF12 as ORCA's working recognition backbone**: it retained substantial target activity, improved key read-level outcomes relative to 10R, and left room for further PUF and APOBEC engineering. This was a practical balance between activity and bystander editing—not a claim that 12R was optimal by every measure.

[![Portrait A–E figure. A aligns PUF recognition sequences. B retains the original three scatter plots of C388 editing against mean bystander editing, with distinct mean shapes, direct labels, biological replicate dots, SD and 10R-to-12R arrows. C retains original three-color 100% stacked bars for C388/C871 paired-read outcomes with a shorter legend, TC replicate points and SD, and amber numerical TC means. D and the original WB in E are unchanged.](/assets/images/blueprint/core-editor-cycle-2.png)](/assets/images/blueprint/core-editor-cycle-2.png)

**Figure 2 | Recognition length shapes the activity–bystander trade-off.**<br>
**(A)** 10R, 12R, 13R, and 15R recognition spans and the three experimental contexts. **(B)** C388 editing plotted against mean editing across the same 290 non-target APOE cytidines. **(C)** Read-level classification at C388 and C871, highlighting edited-C388/unedited-C871 reads. **(D)** Conditional co-editing of C295 and C871 among C388-edited reads. **(E)** Qualitative APOE/APOE4-labelled Western blot with β-actin; the E72A lane is labelled PUF12-E72A in this blot, distinct from the PUF10-E72A sequencing control. Protein signals were not quantitatively normalized or assigned to a matched sequencing context.

---

## From an Editor to an Editing System

Selecting PUF12 established a working recognition backbone, but optimizing the editor alone could not address every requirement of programmable RNA editing. We also needed strategies to regulate activity, deliver the editor, measure its effects, and support systematic target design.

We organized the next stage of ORCA engineering into **five connected routes: EDIT, CONTROL, DELIVER, MEASURE, and PROGRAM**. Each addresses a distinct system-level challenge.

### 01. EDIT — Refining the Molecular Editor

We pursued three complementary approaches to the PUF–APOBEC machinery:

**POD — Programmable On-target Docking.** This route focused on the PUF recognition domain, introducing targeted mutations into individual repeats to investigate nucleotide recognition and target discrimination.

**CETUS — Cytidine Editing, Tethered for Uridine Switching.** This route focused on the APOBEC catalytic domain, designing and evaluating variants to investigate how catalytic modifications influence editing activity and specificity.

**Integrated ORCA (IO).** Combined engineered PUF and APOBEC variants to examine their behavior within a single editor.

### 02. CONTROL — Regulating Expression and Activity

Our **G.M.A.C.** framework explored four regulatory strategies:

**GFA — Transcriptional Control.** Investigated the gfaABC1D promoter for astrocyte-oriented expression.

**MRE — Post-Transcriptional Regulation.** Tested a 4×6T miRNA response-element architecture and a reduced 2× configuration.

**ASO — Reversible Suppression.** Developed an antisense oligonucleotide approach for externally induced suppression of editor expression.

**Cre–loxP — Permanent Shutdown.** Designed a recombinase-mediated excision strategy to permanently terminate editor expression.

### 03. DELIVER — Developing an AAV9 Delivery Strategy

We constructed AAV-compatible vectors and carried out two packaging rounds, progressing from an **mCherry-based proof of concept** to an **ORCA-containing vector**.

### 04. MEASURE — Quantifying RNA Editing

We redesigned a fluorescence-based editing reporter and developed **SONAR (System for Optical Normalization and Analysis of RNA Editing)**, a multilayer framework spanning flow-cytometry processing, normalized fluorescence readouts, empirical calibration, and exploratory sequencing-linked editing estimates.

### 05. MODEL — Guiding Editor Design through Computational Modelling
We developed an integrated modelling workflow to guide editor design and evaluation. Our models combine RNA-seq analysis, PUF variant ranking, APOBEC structural modelling, RNA editing-site prioritization, and whole-body delivery simulations. Together, they identify editing patterns, prioritize candidate variants and target sites, and evaluate how delivery and competing reactions shape the intended RNA product. Iterative model refinement turns these findings into focused questions for experimental follow-up.

### Bringing the Routes Together

The five routes extend ORCA beyond the editing reaction itself, providing a coordinated framework for **molecular optimization, biological regulation, delivery, measurement, and programmable design**.

---

## References

1. Han W, Huang W, Wei T, et al. Programmable RNA base editing with a single gRNA-free enzyme. *Nucleic Acids Research*. 2022;50(16):9580–9595. https://doi.org/10.1093/nar/gkac713
2. Zhao YY, Mao MW, et al. Expanding RNA binding specificity and affinity of engineered PUF domains. *Nucleic Acids Research*. 2018;46(9):4771–4782. https://doi.org/10.1093/nar/gky134
