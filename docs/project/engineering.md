---
title: Engineering Success
subtitle: Engineering records for ORCA recognition, catalysis, control, delivery, reporting and modelling.
eyebrow: Project
status: pending
status_label: Content pending team review
status_message: Supplied engineering manuscripts and existing model records; scientific claims remain subject to team review.
---

# Engineering Success

## Fundamental Research {#fundamental-research .engineering-chapter-title}

### Overview {#fundamental-research-overview}

<img class="engineering-overview-illustration" src="/assets/images/engineering-overviews/fundamental-research.png" alt="Two foundational editor-design cycles: a PUF–APOBEC fusion followed by comparison of four PUF repeat architectures." width="1800" height="1080" decoding="async">

Before engineering ORCA as a complete system, we first needed a functional editor for the APOE4 transcript—and a recognition backbone suitable for further optimization. Two initial design–build–test–learn cycles established that foundation.

### Cycle 1 — Adapting 10R-REWIRE to APOE4 {#fundamental-research-cycle-01}

#### Design {#fundamental-research-cycle-01-design}

REWIRE combines a programmable PUF RNA-binding domain with a deaminase in a single protein. Each PUF repeat recognizes one RNA nucleotide [3,4], allowing an attached APOBEC domain to be positioned near a chosen cytidine for C-to-U editing [1]. Previous studies suggested that extending PUF recognition from eight to ten nucleotides could improve target discrimination, while PUF-binding affinity does not necessarily increase beyond approximately 9–10 repeats [1,2]. We therefore began with a **10-repeat PUF domain**.

Our 10R construct recognizes APOE4 nucleotides 376–385 (`5′-AUGGAGGACG-3′`). A two-nucleotide UG spacer separates this site from **C388**, and an XTEN linker connects PUF10R to APOBEC. The intended C-to-U edit converts `CGC` to `UGC`, producing the R130C substitution (Figure 1A).

#### Build {#fundamental-research-cycle-01-build}

We constructed the complete PUF10R–APOBEC editor alongside **PUF10R-only**, **APOBEC-only**, and empty-vector (EV) controls. FLAG Western blotting confirmed expression of the three protein constructs, with β-actin as the loading control (Figure 1B).

#### Test {#fundamental-research-cycle-01-test}

Amplicon sequencing showed **85.58 ± 0.65% C388 editing** with the complete editor (three biological replicates). Editing remained near background with EV (**0.052 ± 0.024%**), PUF10R-only (**0.10 ± 0.03%**), and APOBEC-only (**0.81 ± 0.21%**) (Figure 1C). Efficient editing therefore required both programmable recognition and catalytic activity.

#### Learn {#fundamental-research-cycle-01-learn}

Strong target editing did not produce uniformly clean APOE RNA. Across the sequenced APOE region, **63 bystander cytidines** showed consistently elevated editing relative to all three controls, including **14 sites predicted to introduce premature stop codons** (Figure 1D). Two prominent examples were **C295/Q99\*** (61.60% editing) and **C871/Q291\*** (87.26%).

More importantly, unwanted edits often occurred **on the same reads as the desired C388 edit**. Among C388-edited reads callable at each respective bystander site, **70.72 ± 2.37%** also carried C295 editing and **93.97 ± 0.39%** carried C871 editing (Figure 1E). These measurements describe bystanders within the sequenced APOE region, not transcriptome-wide off-target activity.

Cycle 1 established a highly active APOE4 editor, but also revealed the central constraint for the next iteration: **target efficiency had to be evaluated together with the integrity of the edited RNA**.

![Five-panel portrait. A spans the full width and shows a straight ten-repeat PUF array with real repeat names and recognition-residue codes aligned to the APOE RNA sequence; a non-circular APOBEC shape directly engages C388. B shows the source PowerPoint FLAG Western blot and C shows C388 editing with three biological observations per group. D shows 63 APOE bystander sites and explains synonymous, missense and stop-gained symbols. E shows conditional same-read co-occurrence: 70.72 ± 2.37% for C295 and 93.97 ± 0.39% for C871 among C388-edited callable reads.](/assets/images/submission-20261017/blueprint/core-editor-cycle-1.png)

**Figure 1 | Establishing the first APOE4-targeting 10R editor.**<br>
**(A)** PUF10R–XTEN–APOBEC architecture, recognition site, UG spacer, and intended C388 edit. **(B)** FLAG Western blot of PUF10R-only, APOBEC-only, and complete 10R constructs; β-actin loading control. **(C)** C388 editing in the complete-editor and control groups (mean ± SD; *n* = 3 biological replicates). **(D)** Editing landscape across the sequenced APOE region, highlighting 63 elevated bystander sites and their predicted coding consequences. **(E)** Same-read co-editing of C388 with the predicted stop-gained sites C295 and C871.

### Cycle 2 — Selecting the PUF Recognition Backbone {#fundamental-research-cycle-02}

#### Design {#fundamental-research-cycle-02-design}

To test whether recognition length could change the balance between desired and bystander editing, we designed four PUF arrays extending progressively upstream from the same APOE4 target. All retained a common downstream boundary at nucleotide 385 and the same UG spacer before C388 (Figure 2A):

- **10R:** `5′-AUGGAGGACG-3′` (nt 376–385)
- **12R:** `5′-ACAUGGAGGACG-3′` (nt 374–385)
- **13R:** `5′-GACAUGGAGGACG-3′` (nt 373–385)
- **15R:** `5′-CGGACAUGGAGGACG-3′` (nt 371–385)

This design varied the programmed recognition span while maintaining the local positioning of the catalytic domain at C388.

#### Build {#fundamental-research-cycle-02-build}

All four editors used the same **ProAPOBEC-1** sequence and XTEN linker. The 10R and 12R constructs shared one vector backbone; 13R and 15R used another, so comparisons involving those variants cannot be attributed solely to repeat number.

We tested the constructs in **three contexts**: a transient reporter assay in WT 293T cells (editor:reporter = 4:1; 1 μg total DNA per 12-well), and an APOE4-stable 293T model receiving either **0.5 μg** or **1.0 μg** editor plasmid per well. PUF10-E72A served as the within-context sequencing control; EV data provided a historical background reference rather than a matched control for each condition. Sequencing comparisons used **two biological replicates per condition**.

#### Test {#fundamental-research-cycle-02-test}

In this separate comparison series, we assessed C388 editing alongside the **mean C-to-U editing frequency at a fixed set of 290 non-target cytidines** in the APOE coding region. This bystander metric is an average across positions, **not** the percentage of transcripts containing an unwanted edit. We also measured the fraction of callable reads carrying **edited C388 but unedited C871**, directly connecting target editing with avoidance of one damaging bystander (Figure 2B–D).

| Experimental context | C388 editing, 10R → 12R | Mean bystander editing, 10R → 12R | C388 edited / C871 unedited reads, 10R → 12R |
|---|---:|---:|---:|
| Transient reporter | 72.14% → 51.57% | 4.560% → 2.818% | 6.52% → 13.50% |
| APOE4-stable; 0.5 μg editor | 15.59% → 24.11% | 0.650% → 0.940% | 5.61% → 11.87% |
| APOE4-stable; 1.0 μg editor | 42.85% → 37.45% | 2.235% → 1.581% | 10.66% → 18.14% |

*Values are means of two biological replicates within each context. These are descriptive engineering comparisons; the replicate-level distributions are shown in Figure 2.*

Extending 10R to 12R did **not** uniformly reduce absolute bystander activity: both target and mean bystander editing increased in the 0.5 μg stable-cell condition. Nevertheless, the fraction of reads with **C388 edited and C871 unedited increased in all three contexts**. Conditional co-editing at the other highlighted stop-gained site, C295, also decreased with 12R, although these read-level measures do not establish that a transcript is free of *all* bystander edits.

An accompanying APOE/APOE4-labelled Western blot provided qualitative protein-level observations but was **not used to select the recognition backbone** or to infer APOE isoform conversion (Figure 2E).

#### Learn {#fundamental-research-cycle-02-learn}

Longer recognition was not automatically better. **13R** lowered mean bystander editing relative to 12R in all three contexts, but also reduced C388 editing (**28.03% vs 51.57%**, **15.16% vs 24.11%**, and **32.38% vs 37.45%**, respectively). Its fraction of C388-edited/C871-unedited reads exceeded 12R only in the 1.0 μg stable-cell condition (**19.20% vs 18.14%**). **15R** reduced bystander activity further, but C388 editing fell to **3.91%, 2.82%, and 5.99%** across the same contexts.

We therefore selected **PUF12 as ORCA's working recognition backbone**: it retained substantial target activity, improved key read-level outcomes relative to 10R, and left room for further PUF and APOBEC engineering. This was a practical balance between activity and bystander editing—not a claim that 12R was optimal by every measure.

![Portrait A–E figure. A aligns PUF recognition sequences. B retains the original three scatter plots of C388 editing against mean bystander editing, with distinct mean shapes, direct labels, biological replicate dots, SD and 10R-to-12R arrows. C retains original three-color 100% stacked bars for C388/C871 paired-read outcomes with a shorter legend, TC replicate points and SD, and amber numerical TC means. D and the original WB in E are unchanged.](/assets/images/submission-20261017/blueprint/core-editor-cycle-2.png)

**Figure 2 | Recognition length shapes the activity–bystander trade-off.**<br>
**(A)** 10R, 12R, 13R, and 15R recognition spans and the three experimental contexts. **(B)** C388 editing plotted against mean editing across the same 290 non-target APOE cytidines. **(C)** Read-level classification at C388 and C871, highlighting edited-C388/unedited-C871 reads. **(D)** Conditional co-editing of C295 and C871 among C388-edited reads. **(E)** Qualitative APOE/APOE4-labelled Western blot with β-actin; the E72A lane is labelled PUF12-E72A in this blot, distinct from the PUF10-E72A sequencing control. Protein signals were not quantitatively normalized or assigned to a matched sequencing context.

### References {#fundamental-research-references}

1. Han W, Huang W, Wei T, et al. Programmable RNA base editing with a single gRNA-free enzyme. *Nucleic Acids Research*. 2022;50(16):9580–9595. <https://doi.org/10.1093/nar/gkac713>
2. Zhao YY, Mao MW, et al. Expanding RNA binding specificity and affinity of engineered PUF domains. *Nucleic Acids Research*. 2018;46(9):4771–4782. <https://doi.org/10.1093/nar/gky134>
3. Wang X, McLachlan J, Zamore PD, Hall TMT. Modular recognition of RNA by a human Pumilio-homology domain. *Cell*. 2002;110(4):501–512. <https://doi.org/10.1016/S0092-8674(02)00873-5>
4. Cheong CG, Hall TMT. Engineering RNA sequence specificity of Pumilio repeats. *Proceedings of the National Academy of Sciences USA*. 2006;103(37):13635–13639. <https://doi.org/10.1073/pnas.0606294103>

## POD {#pod .engineering-chapter-title}

Programmable On-target Docking
{.engineering-chapter-subtitle}

<span id="edit"></span>

### Overview {#pod-overview}

<img class="engineering-overview-illustration" src="/assets/images/engineering-overviews/pod.png" alt="POD recognition module bound to APOE4 RNA." width="1800" height="1080" decoding="async">

POD (Programmable On-target Docking) engineers the RNA-recognition motifs of PUF12 to improve editing specificity. We explored recognition variants designed to retain APOE4 C388 editing while limiting unwanted editing at other APOE sites.

### **Engineering Rationale** {#pod-engineering-rationale .engineering-section-title}

#### Why recognition needed further engineering {#pod-why-recognition-needed-further-engineering}

The parental PUF12 editor showed **72.56% editing at C388** in our first functional sequencing batch (B1), but also **67.50% at C871** and **32.96% at C295** (Figure 1). The intended C388 C-to-U conversion changes the APOE4 codon **CGC to UGC**, producing the Arg-to-Cys substitution associated with the APOE3-equivalent sequence. By contrast, C871 (CAG→UAG) and C295 (CAA→UAA) edits are predicted to introduce premature stop codons. Maintaining target activity without comparable editing at these positions therefore became an immediate engineering priority.

We named this effort *Programmable On-target Docking* because its focus is **where the PUF–APOBEC editor is positioned on RNA**. Rather than changing APOBEC catalysis, POD asks whether the recognition module can be retuned to favor the intended APOE sequence over competing local sequence contexts.

![Parental PUF12 editing and coding consequences at three APOE sites](/assets/images/submission-20261017/engineering/pod/Figure_01.png){.engineering-figure style="--engineering-figure-width:660px;--engineering-detail-width:960px"}

*Figure 1. Parental PUF12 editing at C388, C871 and C295, with the predicted coding consequences of each C-to-U change.*

#### The molecular handle: tripartite recognition motifs {#pod-the-molecular-handle-tripartite-recognition-motifs}

PUF (Pumilio and FBF homology) RNA-binding domains are built from tandem repeats arranged along a curved RNA-binding surface. In native human PUM1, eight repeats typically recognize eight consecutive RNA bases; the engineered PUF12 extends this modular arrangement to twelve. Protein and RNA run antiparallel, with each repeat contributing to recognition of a corresponding nucleotide (Figure 2A).

Much of this recognition is mediated by three residues within each repeat—positions **12, 13 and 16**, collectively the **TRM**. Positions 12 and 16 participate in base-specific contacts, while position 13 primarily supports base stacking. The native PUM1 structural example in Figure 2B illustrates how these interactions occur within a larger repeat environment [1,2]. **Changing a TRM provides a targeted way to alter recognition preferences without replacing the entire PUF scaffold.**

![Native PUM1 architecture and TRM-mediated nucleotide recognition](/assets/images/submission-20261017/engineering/pod/Figure_02.png){.engineering-figure style="--engineering-figure-width:720px;--engineering-detail-width:960px"}

*Figure 2. Native PUM1 repeat architecture and structural interactions underlying TRM-mediated RNA-base recognition.*

*Source credits: Panel A adapted from Zhou et al. (2021), CC BY 4.0; Panel B reproduces structural content from Ban et al. (2015), © Springer Basel 2014 [1,2].*

The RNA sequence itself suggested where this modularity might be useful. For the designated **+3 editing geometry**, we aligned twelve-nucleotide candidate recognition windows upstream of C388, C871 and C295, separated from each editable C by two spacer nucleotides (Figure 3). Relative to the intended C388 window, the C871 window differs at **five** positions and the C295 window at **eight**. These are candidate sequence registers rather than direct measurements of PUF binding, but they reveal exploitable differences. At **P5**, for example, the C388 and C871 windows present **G and A**, respectively; at **P7**, both present **G**. A useful TRM modification might therefore discriminate between different bases—or change recognition behavior even where the nominal base remains the same.

![Aligned candidate recognition windows for three APOE sites](/assets/images/submission-20261017/engineering/pod/Figure_03.png){.engineering-figure style="--engineering-figure-width:680px;--engineering-detail-width:960px"}

*Figure 3. Candidate twelve-nucleotide recognition windows at the three monitored APOE sites, aligned to the same +3 editing position.*

#### From published recognition rules to an engineering strategy {#pod-from-published-recognition-rules-to-an-engineering-strategy}

TRM choice is not a simple one-base–one-motif lookup. Zhou et al. mapped experimentally supported base-recognition preferences across the eight repeats of native PUM1, identifying multiple motifs for individual RNA bases and substantial **repeat-context dependence** [1] (Figure 4). Their repertoire gave us a more informed starting point than unrestricted mutagenesis: we could choose combinations with plausible base-recognition properties and test them at specific positions in PUF12.

However, a motif characterized in one native PUM1 repeat need not behave identically when transplanted into a different engineered repeat. Moreover, our experimental readout is **RNA editing**, which reflects the complete editor and its cellular context—not PUF binding affinity alone. POD therefore paired literature-guided TRM selection with functional evaluation of **C388 activity and relative selectivity at both C295 and C871**. The aim was a useful balance across these readouts, not simply the lowest bystander-editing value.

![Published PUM1 TRM base-recognition matrix](/assets/images/submission-20261017/engineering/pod/Figure_04.png){.engineering-figure style="--engineering-figure-width:620px;--engineering-detail-width:960px"}

*Figure 4. Published TRM preferences for A, C, G and U across native PUM1 repeats [1].*

*Source credit: Zhou et al. (2021), reproduced under CC BY 4.0 [1].*

### **Cycle 1**: Reliable TRM engineering {#pod-cycle-01 .engineering-cycle-title}

#### Design {#pod-cycle-01-design}

We started with two contrasting positions in the PUF12 recognition window. **P5** encounters different candidate bases at C388 and C871 (**G versus A**), offering an opportunity to explore discrimination between those sequences. **P7** encounters **G at both sites**, allowing us to test whether altering a shared-base recognition position could nevertheless change the editor's overall editing profile.

Our candidate-selection strategy evolved during this first round. For P5, we assembled an **exploratory set of 16 TRMs** to sample possible motif changes. For P7, we designed **16 additional TRMs** using published G-recognition preferences and amino-acid properties—such as the polarity, charge and side-chain features of residues at the three motif positions—as stronger guides (Figure 5). These were **32 planned designs**, not a claim that all 32 became verified constructs. The shift from exploratory sampling to informed selection became part of our subsequent workflow.

![TRM engineering design at P5 and P7](/assets/images/submission-20261017/engineering/pod/Figure_05.png){.engineering-figure style="--engineering-figure-width:700px;--engineering-detail-width:960px"}

*Figure 5. Initial P5/P7 design and the transition from exploratory TRM combinations to literature-informed candidate selection.*

#### Build {#pod-cycle-01-build}

We introduced selected TRM substitutions into the PUF12 backbone by PCR-based mutagenesis and DNA assembly, followed by cloning and Sanger sequencing. Because twelve related repeats contain highly similar DNA segments, a clone with the expected local mutation could still carry an alteration elsewhere in the repeat array. We therefore checked **actual sequence identity and repeat-region integrity**, rather than relying on the construct's planned name.

#### Test {#pod-cycle-01-test}

Sequence verification uncovered two informative construction outcomes (Figure 6). In some P7-derived clones, two matched sequence anchors were separated by **77 nt rather than 401 nt** in the PUF12 reference, indicating a **324-bp net deletion**. This showed that the repetitive architecture created a practical challenge for accurate assembly.

A second construct was initially labeled **P7-SNE**, with the intended **SYE→SNE** change at P7. Sanger reads instead supported the same motif change at **both P4 and P7**. We consequently identified the construct as **P4+P7-SNE** and retained its verified identity for subsequent functional analysis. The important distinction was not the name itself, but that a phenotype from a double-repeat variant could not be attributed to a single-repeat substitution.

![Sequence validation of modified PUF12 constructs](/assets/images/submission-20261017/engineering/pod/Figure_06.png){.engineering-figure style="--engineering-figure-width:760px;--engineering-detail-width:960px"}

*Figure 6. Sequence validation revealing a 324-bp deletion and an unexpected P4+P7-SNE double-repeat variant.*

#### Learn {#pod-cycle-01-learn}

Cycle 1 established two requirements for reliable POD engineering. **Candidate selection needed a defensible recognition rationale**, while **functional comparisons needed sequence-confirmed constructs**. The repeated PUF architecture made the latter especially important: an intended local TRM edit does not guarantee that other repeats remain unchanged. In our workflow, sequence verification thus served as an active engineering checkpoint, not simply a final administrative step. With this design-and-verification workflow in place, we could move from testing whether motifs could be constructed to asking how they altered RNA-editing performance.

### **Cycle 2**: Editing activity and selectivity {#pod-cycle-02 .engineering-cycle-title}

#### Design {#pod-cycle-02-design}

We extended TRM engineering to **P4, P6 and P8**, which recognize **G, A and G**, respectively, in the C388 window (Figure 7). The additional positions allowed us to test different repeat environments and base-recognition requirements while keeping the overall PUF12–APOBEC architecture unchanged. Drawing on published base preferences and residue chemistry, we planned **ten candidate TRMs per repeat**, or **30 new designs**. This broadened the search without treating any published motif as guaranteed to improve editing.

![Expanded TRM designs at P4, P6 and P8](/assets/images/submission-20261017/engineering/pod/Figure_07.png){.engineering-figure style="--engineering-figure-width:700px;--engineering-detail-width:960px"}

*Figure 7. Expansion of TRM designs to the P4, P6 and P8 positions of PUF12.*

#### Build {#pod-cycle-02-build}

We applied the mutagenesis, cloning and sequence-checking workflow developed in Cycle 1, then assembled available variants from **both early design rounds** for functional screening. **Batch 1 (B1) evaluated 30 PUF variants plus parental PUF12**; these 30 tested constructs are not identical to the 30 newly planned P4/P6/P8 designs. This distinction matters when interpreting the range of repeat positions represented in the results.

#### Test {#pod-cycle-02-test}

Targeted sequencing measured C-to-U editing at **C388, C295 and C871**. The B1 variants did not follow one uniform pattern (Figure 8). **P8-GVE** retained **65.86% C388 editing** versus **72.56%** in parental PUF12, while C871 editing fell sharply from **67.50% to 10.23%**. C295 editing also declined, but more modestly, from **32.96% to 25.22%**.

Other variants showed why a single bystander site could not describe the full outcome. **P5-SYQ** reduced C295 editing to **18.34%** while leaving C871 relatively high (**64.28%**). **P6-QRW** lowered both monitored bystanders (**20.00% at C295; 28.03% at C871**) but also reduced C388 editing to **60.43%**. In contrast, **P6-QFW** retained appreciable target editing while C295 editing increased above the parental level. The sequence-confirmed P4+P7-SNE construct added another distinct editing profile. These observations established that TRM changes could affect target activity and the two unwanted sites **in different directions**.

![B1 editing profiles for parental and representative PUF12 variants](/assets/images/submission-20261017/engineering/pod/Figure_08.png){.engineering-figure style="--engineering-figure-width:660px;--engineering-detail-width:960px"}

*Figure 8. B1 editing profiles at C388, C871 and C295 for parental PUF12 and representative TRM variants.*

To compare these patterns without favoring variants that merely suppressed editing everywhere, we used **two complementary measures**:

<div class="engineering-equation"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><msub><mi>R</mi><mrow><mi mathvariant="normal">t</mi><mi mathvariant="normal">a</mi><mi mathvariant="normal">r</mi><mi mathvariant="normal">g</mi><mi mathvariant="normal">e</mi><mi mathvariant="normal">t</mi></mrow></msub><mo stretchy="false" form="prefix">(</mo><mi>%</mi><mo stretchy="false" form="postfix">)</mo><mo>=</mo><mn>100</mn><mo>×</mo><mfrac><msub><mi>E</mi><mrow><mn>388</mn><mo>,</mo><mrow><mi mathvariant="normal">v</mi><mi mathvariant="normal">a</mi><mi mathvariant="normal">r</mi><mi mathvariant="normal">i</mi><mi mathvariant="normal">a</mi><mi mathvariant="normal">n</mi><mi mathvariant="normal">t</mi></mrow></mrow></msub><msub><mi>E</mi><mrow><mn>388</mn><mo>,</mo><mrow><mi mathvariant="normal">p</mi><mi mathvariant="normal">a</mi><mi mathvariant="normal">r</mi><mi mathvariant="normal">e</mi><mi mathvariant="normal">n</mi><mi mathvariant="normal">t</mi></mrow></mrow></msub></mfrac></mrow><annotation encoding="application/x-tex">&#10;&#82;&#95;&#123;&#92;&#109;&#97;&#116;&#104;&#114;&#109;&#123;&#116;&#97;&#114;&#103;&#101;&#116;&#125;&#125;&#40;&#92;&#37;&#41;&#61;&#49;&#48;&#48;&#92;&#116;&#105;&#109;&#101;&#115;&#92;&#102;&#114;&#97;&#99;&#123;&#69;&#95;&#123;&#51;&#56;&#56;&#44;&#92;&#109;&#97;&#116;&#104;&#114;&#109;&#123;&#118;&#97;&#114;&#105;&#97;&#110;&#116;&#125;&#125;&#125;&#123;&#69;&#95;&#123;&#51;&#56;&#56;&#44;&#92;&#109;&#97;&#116;&#104;&#114;&#109;&#123;&#112;&#97;&#114;&#101;&#110;&#116;&#125;&#125;&#125;&#10;</annotation></semantics></math></div>

<div class="engineering-equation"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><msub><mi>S</mi><mi>i</mi></msub><mo>=</mo><mfrac><mrow><msub><mi>E</mi><mrow><mn>388</mn><mo>,</mo><mrow><mi mathvariant="normal">v</mi><mi mathvariant="normal">a</mi><mi mathvariant="normal">r</mi><mi mathvariant="normal">i</mi><mi mathvariant="normal">a</mi><mi mathvariant="normal">n</mi><mi mathvariant="normal">t</mi></mrow></mrow></msub><mi>/</mi><msub><mi>E</mi><mrow><mi>i</mi><mo>,</mo><mrow><mi mathvariant="normal">v</mi><mi mathvariant="normal">a</mi><mi mathvariant="normal">r</mi><mi mathvariant="normal">i</mi><mi mathvariant="normal">a</mi><mi mathvariant="normal">n</mi><mi mathvariant="normal">t</mi></mrow></mrow></msub></mrow><msub><mi>R</mi><mrow><mi>i</mi><mo>,</mo><mrow><mi mathvariant="normal">p</mi><mi mathvariant="normal">a</mi><mi mathvariant="normal">r</mi><mi mathvariant="normal">e</mi><mi mathvariant="normal">n</mi><mi mathvariant="normal">t</mi></mrow></mrow></msub></mfrac><mo>,</mo><mspace width="2.0em" /><mi>i</mi><mo>∈</mo><mo stretchy="false" form="prefix">{</mo><mn>295</mn><mo>,</mo><mn>871</mn><mo stretchy="false" form="postfix">}</mo><mi>.</mi></mrow><annotation encoding="application/x-tex">&#10;&#83;&#95;&#105;&#61;&#92;&#102;&#114;&#97;&#99;&#123;&#69;&#95;&#123;&#51;&#56;&#56;&#44;&#92;&#109;&#97;&#116;&#104;&#114;&#109;&#123;&#118;&#97;&#114;&#105;&#97;&#110;&#116;&#125;&#125;&#47;&#69;&#95;&#123;&#105;&#44;&#92;&#109;&#97;&#116;&#104;&#114;&#109;&#123;&#118;&#97;&#114;&#105;&#97;&#110;&#116;&#125;&#125;&#125;&#123;&#82;&#95;&#123;&#105;&#44;&#92;&#109;&#97;&#116;&#104;&#114;&#109;&#123;&#112;&#97;&#114;&#101;&#110;&#116;&#125;&#125;&#125;&#44;&#92;&#113;&#113;&#117;&#97;&#100;&#32;&#105;&#92;&#105;&#110;&#92;&#123;&#50;&#57;&#53;&#44;&#56;&#55;&#49;&#92;&#125;&#46;&#10;</annotation></semantics></math></div>

Here, <span class="engineering-math"><math xmlns="http://www.w3.org/1998/Math/MathML" display="inline"><semantics><mi>E</mi><annotation encoding="application/x-tex">&#69;</annotation></semantics></math></span> is the mean editing frequency at a given site, and <span class="engineering-math"><math xmlns="http://www.w3.org/1998/Math/MathML" display="inline"><semantics><msub><mi>R</mi><mrow><mi>i</mi><mo>,</mo><mrow><mi mathvariant="normal">p</mi><mi mathvariant="normal">a</mi><mi mathvariant="normal">r</mi><mi mathvariant="normal">e</mi><mi mathvariant="normal">n</mi><mi mathvariant="normal">t</mi></mrow></mrow></msub><annotation encoding="application/x-tex">&#82;&#95;&#123;&#105;&#44;&#92;&#109;&#97;&#116;&#104;&#114;&#109;&#123;&#112;&#97;&#114;&#101;&#110;&#116;&#125;&#125;</annotation></semantics></math></span> is the **parental C388-to-site-<span class="engineering-math"><math xmlns="http://www.w3.org/1998/Math/MathML" display="inline"><semantics><mi>i</mi><annotation encoding="application/x-tex">&#105;</annotation></semantics></math></span> ratio from the same sequencing batch**. Target retention assesses preserved C388 activity; normalized selectivity <span class="engineering-math"><math xmlns="http://www.w3.org/1998/Math/MathML" display="inline"><semantics><mrow><msub><mi>S</mi><mi>i</mi></msub><mo>&gt;</mo><mn>1</mn></mrow><annotation encoding="application/x-tex">&#83;&#95;&#105;&#62;&#49;</annotation></semantics></math></span> indicates an improved target-to-bystander ratio at the specified position. We considered both <span class="engineering-math"><math xmlns="http://www.w3.org/1998/Math/MathML" display="inline"><semantics><msub><mi>S</mi><mn>295</mn></msub><annotation encoding="application/x-tex">&#83;&#95;&#123;&#50;&#57;&#53;&#125;</annotation></semantics></math></span> and <span class="engineering-math"><math xmlns="http://www.w3.org/1998/Math/MathML" display="inline"><semantics><msub><mi>S</mi><mn>871</mn></msub><annotation encoding="application/x-tex">&#83;&#95;&#123;&#56;&#55;&#49;&#125;</annotation></semantics></math></span> rather than combining them into a single score.

This analysis sharpened the differences among variants (Figure 9). **P8-GVE retained 90.76% of parental C388 activity and improved normalized C388/C871 selectivity 5.99-fold**, but improved C388/C295 selectivity only **1.19-fold**. **P5-SYQ** improved C388/C295 selectivity **1.46-fold** while falling below the parental C388/C871 ratio (**0.86-fold**). **P6-QRW** improved both ratios (**1.37-fold** and **2.01-fold**) but retained only **83.28%** of target activity. A favorable change in one measure was therefore not automatically favorable across the entire editing profile. Moreover, the contrasting responses to motifs placed at different repeats suggested that a recognition rule alone was insufficient to predict a whole-editor outcome.

![Activity retention versus two normalized selectivity measures in B1](/assets/images/submission-20261017/engineering/pod/Figure_09.png){.engineering-figure style="--engineering-figure-width:740px;--engineering-detail-width:960px"}

*Figure 9. Target-activity retention and normalized selectivity against C295 and C871 across evaluable B1 variants.*

#### Learn {#pod-cycle-02-learn}

The first functional screen demonstrated that recognition-domain mutations can **redistribute editing across APOE sites**, sometimes producing substantial relative discrimination without eliminating target activity. It also changed how we defined a useful variant. A low C871 value alone would overlook C295; low bystander editing caused by weak overall activity would be equally misleading. We therefore adopted **C388 retention plus two site-specific selectivity measures** as the basis for comparing POD candidates, and used this multi-objective view to guide a broader, knowledge-based screen.

### **Cycle 3**: Expanding recognition {#pod-cycle-03 .engineering-cycle-title}

#### Design {#pod-cycle-03-design}

Cycle 3 extended motif engineering to **P1, P2, P3, P9, P10 and P11**, recognizing **G, C, A, U, A and C** in the C388 window (Figure 10A). Instead of transferring only motifs from matching-numbered native PUM1 repeats, we searched the published TRM matrix for motifs associated with the **required RNA base across different repeat contexts**. We could then test whether those candidates remained useful when introduced at new positions in engineered PUF12.

**P9 illustrates the approach.** Its target-window base is **U**, and the published native PUM1 matrix includes **NTQ, GNS and NPS** among U-recognition motifs originating from different repeats (Figure 10B) [1]. We brought these forward as **parallel P9 candidates**, not sequential optimization steps. The evaluated library comprised **51 variants**: eight at P1, seven at P2, ten at P3, eleven at P9, ten at P10 and five at P11.

![Knowledge-guided design of PUF12 variants across six positions](/assets/images/submission-20261017/engineering/pod/Figure_10.png){.engineering-figure style="--engineering-figure-width:760px;--engineering-detail-width:960px"}

*Figure 10. Literature-guided TRM expansion to six PUF12 positions, illustrated by three candidate motifs for U recognition at P9.*

#### Build {#pod-cycle-03-build}

We constructed the expanded variants through targeted mutagenesis, assembly, cloning and Sanger-based sequence checks. Candidate construction proceeded in successive groups as different repeat positions were explored. **Fifty-one constructs entered Batch 2 (B2) functional sequencing.** After cell transfection, we collected RNA at **48 hours**, prepared APOE amplicons and measured editing by **Nanopore sequencing**. The established workflow allowed broader screening without changing the central readouts.

#### Test {#pod-cycle-03-test}

B2 contained **two recorded measurements for each of the 51 variants** and **four parental PUF12 measurements**. We assessed C388, C295 and C871 separately, excluding unavailable or filtered site results from the relevant quantitative comparisons (Figure 11). All 51 variants had evaluable C388 retention; **39** had sufficient site data for comparisons involving **both** normalized selectivity measures. The resulting heatmaps show a wide range of editing profiles, from variants with little retained C388 activity to others that maintained target editing while reducing one or both monitored bystanders.

![Complete B2 heatmaps for the expanded TRM library](/assets/images/submission-20261017/engineering/pod/Figure_11.png){.engineering-figure style="--engineering-figure-width:680px;--engineering-detail-width:960px"}

*Figure 11. B2 editing heatmaps for 51 variants, including per-record C388/C871 ratios that are not batch-normalized selectivity scores.*

The P9 candidates make these trade-offs particularly clear (Figure 12). B2 parental PUF12 averaged **67.08% C388**, **31.59% C295** and **57.06% C871** editing. **P9-GNS, P9-NPS and P9-NTQ** all preserved approximately **60–63% absolute C388 editing**, while lowering C871 to **26.37%, 20.39% and 18.46%**, respectively. Their C295 editing differed: **30.55%**, **25.52%** and **23.03%**. Thus, three motifs selected for the same target base yielded clearly different bystander outcomes within the same PUF12 repeat.

![B2 editing comparison among parental PUF12 and three P9 candidates](/assets/images/submission-20261017/engineering/pod/Figure_12.png){.engineering-figure style="--engineering-figure-width:600px;--engineering-detail-width:960px"}

*Figure 12. C388, C295 and C871 editing in B2 parental PUF12 and the P9-GNS, P9-NPS and P9-NTQ variants.*

Using the batch-matched parental reference, **P9-GNS** retained **93.44%** of C388 activity and improved C388/C871 selectivity **2.02-fold**, but did **not** improve relative C388/C295 selectivity (**0.97-fold**). **P9-NPS** retained **90.13%** of target activity with **1.11-fold** and **2.52-fold** selectivity at C295 and C871. **P9-NTQ** offered the strongest balance **among these three candidates**: **93.88%** C388 retention, **1.29-fold** C388/C295 selectivity and **2.90-fold** C388/C871 selectivity. The lower absolute C295 value seen with GNS, for example, did not by itself mean better C295 selectivity once target activity was accounted for.

The broader B2 library added important context beyond P9 (Figure 13). **P1-SWD** retained **96.26%** C388 activity while modestly improving both selectivity measures (**1.31-fold** at C295; **1.30-fold** at C871). **P3-SRQ** showed the opposite kind of divergence from GNS: improved C295 selectivity (**1.38-fold**) but essentially no improvement at C871 (**0.98-fold**). **P9-NFW** slightly exceeded parental C388 activity (**104.01% retention**) yet fell below parental C388/C295 selectivity (**0.90-fold**). Other P9 motifs achieved strong C871 selectivity only at a greater cost to target activity. Together these profiles illustrate why neither maximal C388 editing nor a single high selectivity ratio can rank every candidate meaningfully.

![Activity retention and C871 selectivity across the B2 library](/assets/images/submission-20261017/engineering/pod/Figure_13.png){.engineering-figure style="--engineering-figure-width:460px;--engineering-detail-width:960px"}

*Figure 13. B2 activity–selectivity landscape showing retained C388 editing against normalized C388/C871 selectivity.*

#### Learn {#pod-cycle-03-learn}

The expanded screen turned published TRM preferences into a **testable repertoire**, not a universal recognition code. Candidate motifs selected for the same nominal RNA base behaved differently within engineered PUF12; effects also varied among repeat positions and among bystander sites. These patterns are measured editing outcomes rather than direct determinations of RNA-binding affinity.

P9-NTQ was therefore a **promising balanced candidate in this screen**, not an automatically superior motif for every context. More generally, Cycle 3 established a practical strategy: select plausible TRMs from experimental recognition knowledge, test them in their intended engineered-repeat positions, and evaluate each by retained target editing **and** multiple unwanted sites.

### **Conclusion** {#pod-conclusion-from-trm-mutagenesis-to-recognition-engineering .engineering-section-title}

Across B1 and B2, POD evaluated **81 variant entries** (**30 + 51**) spanning different PUF12 positions from **P1 through P11**, including some multi-repeat constructs. The progression was deliberate: establish reliable motif engineering, learn how edits redistribute across sites, then expand the candidate space with published recognition knowledge. The result was not a single universal replacement for parental PUF12, but a set of experimentally characterized recognition variants with distinct activity–selectivity profiles.

Comparing results by repeat position revealed broad functional variation **between the sampled positions and within them** (Figure 14). Among the B2 candidates, median C388 retention ranged from **67.26% at P3** to **93.40% at P11**, with other sampled positions falling between those values. These distributions describe the particular TRMs tested at each position; because the candidate sets differed, they do not isolate repeat location from motif choice. Nevertheless, the varied outcomes underline why transferring a published base-recognition motif into engineered PUF12 requires functional screening rather than assuming that its native-repeat preference will transfer unchanged.

![Functional outcomes of TRM engineering across repeat positions](/assets/images/submission-20261017/engineering/pod/Figure_14.png){.engineering-figure style="--engineering-figure-width:800px;--engineering-detail-width:1020px"}

*Figure 14. Repeat-wise distributions of C388 activity retention and normalized C388/C871 selectivity across the two batches.*

A joint view of **C388 retention, C388/C295 selectivity and C388/C871 selectivity** made those alternatives easier to evaluate (Figure 15). **P8-GVE** stood out for a large relative improvement against C871; **P9-NTQ** represented a more balanced improvement across both monitored bystanders, while GNS and NPS offered related but distinct profiles (Figure 16). These are **site-specific screening results**, not evidence that the variants are free of transcriptome-wide unintended editing.

![Multi-objective landscape for engineered PUF variants](/assets/images/submission-20261017/engineering/pod/Figure_15.png){.engineering-figure style="--engineering-figure-width:660px;--engineering-detail-width:960px"}

*Figure 15. Joint normalized selectivity against C295 and C871, with C388 activity retention represented by color.*

![Representative engineered PUF variants compared with parental PUF12](/assets/images/submission-20261017/engineering/pod/Figure_16.png){.engineering-figure style="--engineering-figure-width:680px;--engineering-detail-width:960px"}

*Figure 16. Representative POD variants compared by C388 retention and both normalized selectivity measures.*

We carried **P8-GVE, P9-GNS, P9-NPS and P9-NTQ** forward into **Integrated ORCA**, where recognition-domain changes could be evaluated alongside engineered APOBEC variants. The accumulated motif–performance relationships also informed a separate **POD Model** presented under **PROGRAM**. POD thus moved beyond designing a fixed RNA-binding sequence toward **experimentally guided recognition engineering** tailored to a specific RNA-editing task.

---

#### References {#pod-references}

1. Zhou, W., Melamed, D., Banyai, G., et al. (2021). Expanding the binding specificity for RNA recognition by a PUF domain. *Nature Communications*, **12**, 5107. https://doi.org/10.1038/s41467-021-25433-6
2. Ban, T., Zhu, J.-K., Melcher, K., & Xu, H. E. (2015). Structural mechanisms of RNA recognition: sequence-specific and non-specific RNA-binding proteins and the Cas9-RNA-DNA complex. *Cellular and Molecular Life Sciences*, **72**, 1045–1058. https://doi.org/10.1007/s00018-014-1779-9

*Measurement note: Editing frequencies and normalized comparisons are descriptive summaries of recorded sequencing measurements; the available records do not independently establish biological-replicate status. B1 and B2 use their respective parental PUF12 reference measurements. In B2, the parental normalization denominator for each bystander is the average of the ratios calculated within the two labeled parental sets, not the ratio of the four-record pooled site means.*

## CETUS {#cetus .engineering-chapter-title}

Engineering APOBEC substrate selectivity
{.engineering-chapter-subtitle}

### Overview {#cetus-overview}

<img class="engineering-overview-illustration" src="/assets/images/engineering-overviews/cetus.png" alt="CETUS catalytic module and C-to-U RNA editing." width="1800" height="1080" decoding="async">

CETUS engineers ORCA’s APOBEC catalytic domain to improve cytidine selectivity. We tested deaminase variants for their ability to retain editing at APOE4 c.388 while limiting bystander editing at c.871 and c.295.

### **Engineering Rationale** {#cetus-engineering-rationale .engineering-section-title}

#### From RNA Recognition to Substrate Preference {#cetus-from-rna-recognition-to-substrate-preference}

**CETUS (Cytidine Editing, Tethered for Uridine Switching)** complements **POD (Programmable On-target Docking)**. The REWIRE framework established the programmable PUF–deaminase architecture [1], while subsequent ProAPOBEC engineering provided our **Pro.hA1** catalytic scaffold [2]. POD engineers PUF-mediated recognition of selected RNA sites; CETUS instead tunes which local sequence contexts APOBEC can efficiently edit. Our goal was not simply to reduce catalytic activity, but to improve **sequence preference while retaining productive editing at APOE4 c.388**.

APOBEC catalyzes Zn²⁺-dependent hydrolytic deamination of cytidine to uridine. In Pro.hA1, **H70, C102, and C105** coordinate zinc, while **E72** participates in catalysis. Surrounding substrate-binding regions, including **loop1, loop3, and loop7**, offered more plausible opportunities to adjust RNA recognition without directly targeting the conserved catalytic core [2–5].

The two principal sites share an upstream G but differ immediately after the edited cytidine: **c.388 is GCG (+1 G)**, whereas **c.871 is GCA (+1 A)**. A shift toward +1 G could therefore favor the intended edit. This direction also has a broader rationale: first-position C-to-U conversion turns **CAA** or **CAG** into stop codons, and both have +1 A. It cannot solve every stop-gained bystander, however; **CGA → UGA** also creates a stop codon despite having +1 G. Accordingly, our design targeted a *particular substrate preference*, not universal elimination of damaging edits (Figure 1).

![Complementary PUF-recognition and APOBEC-motif engineering strategies](/assets/images/submission-20261017/engineering/cetus/Figure_01.png){.engineering-figure style="--engineering-figure-width:780px;--engineering-detail-width:960px"}

*Figure 1. POD and CETUS provide complementary approaches to RNA-site recognition and APOBEC sequence-context preference.*

#### Shared Experimental Framework {#cetus-shared-experimental-framework}

We introduced amino-acid substitutions into Pro.hA1, verified constructs by **Sanger sequencing**, and tested them following transfection into **HEK293T** cells. At **48 h**, we extracted RNA and sequenced the amplified APOE region to estimate C-to-U editing from callable C/T reads after background correction. The primary comparisons used **c.388 (GCG)**, **c.871 (GCA)**, and **c.295 (ACA)**. Detailed procedures are available in **Protocols MX01–MX02**.

We evaluated preference and useful catalytic activity separately:

| Metric | Definition | What it measures |
|---|---|---|
| **+1 Ratio** | c.388 editing / c.871 editing | GCG/GCA preference at two selected sites |
| **Activity Retention** | Variant c.388 editing / same-batch parental c.388 editing | Retention of desired editing |
| **ROF** | Variant +1 Ratio / same-batch parental +1 Ratio | Batch-normalized change in preference |
| **Amplicon Targeting Ratio** | Sum of GCG-site editing frequencies / sum at non-GCG sites | Aggregate motif bias across the amplicon, **not** target-specific editing |

Our initial selection gate required **+1 Ratio ≥ 2.0** and **Activity Retention ≥ 0.70**. Undefined ratios were not treated as zero or as infinite selectivity; between-batch comparisons used their own parental references. These metrics were engineering criteria rather than tests of statistical significance.

---

### **Cycle 1**: Testing +1-base recognition {#cetus-cycle-01 .engineering-cycle-title}

#### Design {#cetus-cycle-01-design}

Could a modifiable Pro.hA1 residue distinguish **+1 G from +1 A**? We built AlphaFold 3 [6] models with three RNA contexts: **GUGCGCG** (c.388), **GUGCACG** (the same sequence with only +1 G→A), and **AUGCAGC** (the c.871 local context). The first comparison isolated the +1-base change; the third tested how surrounding RNA might alter the predicted interface.

We separated **side-chain–base** contacts, which could read base identity, from **backbone–base** contacts, which may instead reflect substrate positioning. **T31** contacted +1 A much more often than +1 G in the predictions (**1.00 versus 0.00**), motivating **T31A** as a test of the proposed hydroxyl-mediated interaction. Conversely, **Q58** showed no direct side-chain contact in either model, but could still influence selectivity indirectly. This design deliberately tested whether a striking structural contact actually predicted function.

#### Build {#cetus-cycle-01-build}

We selected residues across the putative reading region (**29–31**), **loop1 (25–28)**, **loop3 (57–60)**, the region near the **WS loop (98)**, and the **loop7 exit (129–133)**. We combined these structural hypotheses with conservation analysis of **3,504 APOBEC homologs** and a **position-specific scoring matrix (PSSM)** to nominate substitutions. The highly constrained zinc-coordinating/catalytic positions and other strongly conserved sites were not prioritized for the library.

**H29** illustrates why proximity alone was insufficient: about **94%** of its predicted +1-base contacts came from the backbone, so we retained it as a structural reference rather than constructing H29 variants. Conserved **H70/E72/C102/C105**, the near-invariant **W99**, and the strongly coevolving **N57** were also deliberately avoided as primary mutation targets. The PSSM provided a substitution prior, **not** an experimental exclusion rule: we still needed to test whether rare replacements could be useful in this engineered scaffold. In total, we generated **102 sequence-verified single mutants across 16 positions** and tested each in two independent transfections.

#### Test {#cetus-cycle-01-test}

Among single mutants retained by the activity screen, **K30H** had the highest **+1 Ratio (1.71)** at **0.84 Activity Retention**; **none** met both preset thresholds (Figure 2). Higher-ratio mutants such as **W130G (3.00)** and **T31G (2.22)** paid substantial activity costs, illustrating why a high ratio alone was not a sufficient selection criterion.

Two tests of our design assumptions were particularly revealing. First, **T31A** produced almost no functional shift: its +1 Ratio was **1.32**, versus **1.37** for the parent, with similar editing at c.388 (**0.501 versus 0.514**) and c.871 (**0.379 versus 0.375**). Thus, the predicted T31–adenine contact was not a reliable indicator of GCG/GCA preference. Second, the PSSM-derived rule classified only **53/102** mutant outcomes correctly. It discouraged **K30H**, whose substituted residue occurred at a frequency of only **0.0004** among the analyzed homologs, despite its favorable experimental performance.

The screen also exposed routes beyond a single direct +1 reader. **Q58M** improved the ratio without a modeled direct contact, while **G27D/G27T** reduced editing at **c.295 (ACA)**, suggesting a separable contribution from the upstream (−1) sequence context. Notably, **38 substitutions rejected by the PSSM rule still retained useful target activity**, emphasizing the difference between evolutionary frequency and engineered editing performance.

![Single-mutant screen of GCG/GCA preference against target-editing retention](/assets/images/submission-20261017/engineering/cetus/Figure_02.png){.engineering-figure style="--engineering-figure-width:660px;--engineering-detail-width:960px"}

*Figure 2. Single-mutant APOBEC variants plotted by GCG/GCA preference and target-editing retention.*

#### Learn {#cetus-cycle-01-learn}

**Structure and evolutionary sequence preferences generated useful hypotheses, but did not rank functional outcomes reliably.** This contrast was especially clear between T31, whose predicted +1 A contact barely affected editing after mutation, and **K30**, which showed predicted side-chain contacts to both +1 bases but more frequent contact with G (**0.81 versus 0.64**) and yielded the useful K30H phenotype. The limited +1 improvements of single substitutions contrasted with strong ACA suppression at G27: these appeared to be **different, potentially complementary recognition effects**. We therefore moved from isolated substitutions to combinations spanning distinct substrate-recognition regions.

### **Cycle 2**: Combining recognition layers {#cetus-cycle-02 .engineering-cycle-title}

#### Design {#cetus-cycle-02-design}

We sought to combine the complementary properties uncovered in Cycle 1: **K30H** improved GCG/GCA preference, **G27D/G27T** suppressed ACA-context editing, and **Q58M** offered a modest preference benefit with comparatively limited activity loss. We also included **M132D/E** to test whether a residue in the distant loop7 exit—approximately **15–20 Å** from the +1 base, without predicted direct base contact—could affect a combination's performance.

Rather than assemble every possible pair and triple, we used **two candidate-design routes**. One ranked combinations using **coevolution, structural coupling, and prior single-mutant data**; its candidate ordering was defined *before* the combination results were available. The other **enumerated biochemically plausible double and triple substitutions**, broadening coverage beyond structurally favored pairs. Both routes prioritized combinations with experimentally supported gains, favored substitutions spanning different regions, and distinguished optimization candidates from high-ratio/low-activity mechanistic controls such as **W130G**. The two strategies served different purposes: the first tested whether **predicted coupling could identify promising partners**, while the second reduced the risk of missing productive combinations that did not seem obvious from the modeled interface. This made the combination screen a test of **design strategies as well as mutant performance**.

#### Build {#cetus-cycle-02-build}

We evaluated **48 constructs**, including combinatorial variants and the single-mutant comparator **32F**. The panel deliberately included **six W130G-containing combinations** to challenge the preference–activity trade-off and **twelve M132D-containing combinations** to probe context-dependent effects. All constructs were tested using the common APOE assay.

#### Test {#cetus-cycle-02-test}

**G27T–K30H–Q58M** achieved **+1 Ratio = 2.156** and **Activity Retention = 0.773**, becoming the **only construct in this batch** to satisfy both engineering criteria (Figure 3). A higher ratio was not necessarily better: **Q58M–W130G** reached **3.714**, but retained just **0.292** of c.388 activity. In fact, every combination with a +1 Ratio above 2.5 retained less than 40% of parental target activity.

The panel also exposed **combination-background dependence**. Alone, **M132D** retained roughly **0.89** of parental target activity; across its twelve combinations, median c.388 editing was only **0.178**, versus **0.349** for M132E-containing combinations and **0.298** without a residue-132 substitution. **None of the twelve M132D combinations exceeded 0.30 c.388 editing.** Because these collections contained different partner mutations, their distributions motivated—but did not replace—the matched-pair experiment we performed later. A residue far from the modeled base-contact interface could therefore strongly influence the behavior of combined mutations. Twelve constructs with unquantifiable c.871 editing were excluded from finite-ratio comparisons rather than assigned artificial values.

![Combinatorial APOBEC variants and the trade-off between +1 preference and activity](/assets/images/submission-20261017/engineering/cetus/Figure_03.png){.engineering-figure style="--engineering-figure-width:640px;--engineering-detail-width:960px"}

*Figure 3. Combinatorial APOBEC screening identifies a favorable triple mutant within the preference–activity trade-off.*

#### Learn {#cetus-cycle-02-learn}

The triple mutant provided evidence that **cross-region combinations can surpass the single-mutation performance boundary**. We prioritized **G27T–K30H–Q58M** and deprioritized M132D as a general combination component, while retaining its behavior as a clue to functional coupling. Since a two-site GCG/GCA ratio still could not represent all unintended edits, we next examined the **full APOE amplicon**.

### **Cycle 3**: Selectivity beyond two sites {#cetus-cycle-03 .engineering-cycle-title}

#### Design {#cetus-cycle-03-design}

We expanded evaluation from selected cytidines to a **951-bp APOE amplicon containing 291 cytidines**: **47 GCG** and **244 non-GCG** sites. Using prior experiments, we compared site-resolved editing, bystander hotspots, overall editing burden, and motif-level ratios. We included **P-domain recognition variants** to see whether altering RNA recruitment could redistribute editing, and also explored **public transcriptomic datasets** for comparable sequence-context patterns beyond APOE. The quantitative comparisons reported here rely on our APOE amplicon data.

#### Build {#cetus-cycle-03-build}

Rather than construct another library, we established a uniform analysis across **117 existing sequencing samples from 57 constructs**. This enabled direct comparison of local motif preference with editing-site distributions and target activity.

#### Test {#cetus-cycle-03-test}

The same local motif could support very different editing outcomes. Among the parental editor's **47 GCG sites**, **26** exceeded a 5% detection threshold; c.388 reached **67.3%**, but another GCG cytidine, **c.390**, reached **61.7%**. Across the amplicon, we identified **74 bystander hotspots**, **68** preceded by G; these comprised **30 GCG, 16 GCA, 12 GCC, and 10 GCU** contexts. This mapping revealed that the favored GCG motif was also the **largest class of bystander hotspots**. Thus, improving GCG/GCA preference would not necessarily protect other GCG bystanders.

Editing at c.388 was positively associated with overall bystander burden (**Pearson r = 0.760**). Seven combinations showed no detectable c.871 signal in either replicate, but all had **Activity Retention < 0.22**. Separately, P-domain redesigns retained c.388 editing around **0.61–0.77**, yet changed the editing landscape and introduced **19 new bystander sites**, rather than improving it overall.

The **Amplicon Targeting Ratio** revealed a measurement trap: its median was **2.53** for constructs with 10%–20% target editing, versus **1.20** at 35%–60% (Figure 4). Weak non-GCG signals could disappear below detection as global activity fell, artificially inflating a ratio whose denominator shrank. In early rankings, the **top nine** values appeared infinite because their denominators had been recorded as zero; such ratios are **undefined**, not evidence of exceptional specificity. In addition, the ratio is mathematically coupled to its non-GCG denominator, so correlations with that quantity must be interpreted descriptively, not causally.

![Amplicon targeting ratio contrasted with target activity and non-GCG editing](/assets/images/submission-20261017/engineering/cetus/Figure_04.png){.engineering-figure style="--engineering-figure-width:780px;--engineering-detail-width:1020px"}

*Figure 4. Amplicon-level GCG/non-GCG ratios can become misleading when target activity and detectable bystander editing decline.*

#### Learn {#cetus-cycle-03-learn}

We revised our evaluation to consider **three distinct layers**: RNA-site recruitment and accessibility, **−1-context** discrimination, and **+1-context** preference. Each could alter the editing landscape without necessarily changing the others. For subsequent amplicon-level bystander comparisons, we introduced a **c.388 editing floor of 0.30** and interpreted ratios alongside their denominators, detection limits, and actual site-level editing. We next interrogated a different assumption: could predicted protein–RNA contact changes reliably stand in for these functional measurements?

### **Cycle 4**: Structural predictions versus function {#cetus-cycle-04 .engineering-cycle-title}

#### Design {#cetus-cycle-04-design}

Our early structure-guided designs relied on predicted contact probabilities (**CP**) between Pro.hA1 and RNA. To test whether these patterns tracked function, we selected experimentally characterized inactive variants (**T31D, N57W, and G27D–W130G**), a functional same-position comparator (**T31A**), and catalytic-related controls (**N57A and E72A**). **E72A** was especially informative: loss of an essential catalytic side chain need not entail major structural rearrangement.

We added two controls to isolate the modeling context: **hold the protein sequence constant and change RNA from GCGCG to GCACG**, and compare the same protein variants **with and without RNA**. These tests asked whether a high structural-deviation score actually reflected protein mutation, substrate identity, or both.

#### Build {#cetus-cycle-04-build}

We generated AlphaFold 3 protein–RNA models and **65 protein-only modeling tasks**. From predicted residue-contact probabilities, we used **principal-component analysis** and a **Mahalanobis distance (D_M)** to quantify departure from the parental contact pattern. Leave-one-out analysis of wild-type prediction seeds established an internal **95th-percentile reference of D_M = 1.57**. We also calculated residue-level **ΔΔCP** to localize contact redistribution, highlighting **22 residues across 21 mutant complexes** with substantial contact changes. Together, these analyses tested global and local descriptors rather than relying on one structural distance alone.

#### Test {#cetus-cycle-04-test}

Predicted deviation did **not** consistently separate functional states. **E72A** stayed near the wild-type contact pattern (**D_M = 0.903**), whereas the inactive **T31D** and **N57W** had larger deviations (**5.498** and **8.889**). Alternative pocket-distance and contact descriptors similarly failed to provide a simple activity ranking (Figure 5). A large D_M could therefore accompany functional disruption, but a small D_M did not guarantee an intact catalytic mechanism.

More strikingly, changing **only the RNA sequence** produced **D_M = 5.605**, comparable to a disruptive mutant despite an unchanged protein sequence. The **ΔΔCP** analysis pinpointed locally redistributed contacts, including around substrate-associated residues, but no universal active-versus-inactive signature (Figure 6). Comparing protein-only models with complexes further changed the picture: **T31D** fell from **5.498 to 1.202**, whereas **E72A** rose from **0.903 to 1.656** (Figure 7).

![Structural-distance and contact-based comparisons among functional APOBEC controls](/assets/images/submission-20261017/engineering/cetus/Figure_05.png){.engineering-figure style="--engineering-figure-width:740px;--engineering-detail-width:960px"}

*Figure 5. Predicted distance and contact descriptors compared across APOBEC variants with different functional states.*

![Residue-level differential contact-probability heatmap](/assets/images/submission-20261017/engineering/cetus/Figure_06.png){.engineering-figure style="--engineering-figure-width:860px;--engineering-detail-width:980px"}

*Figure 6. Residue-level ΔΔCP profiles reveal localized contact changes across predicted APOBEC structures.*

![Predicted structural deviation with and without RNA](/assets/images/submission-20261017/engineering/cetus/Figure_07.png){.engineering-figure style="--engineering-figure-width:700px;--engineering-detail-width:960px"}

*Figure 7. Modeling the same APOBEC variants with versus without RNA produces different structural-deviation estimates.*

#### Learn {#cetus-cycle-04-learn}

This was a **test of the design method itself**, not a failed attempt to find one more mutation. Static contact patterns can identify plausible interfaces and mechanistic hypotheses, but they did not reliably predict catalytic activity or GCG/GCA selectivity. RNA identity influenced the structural readout enough that apparent mutant-specific changes could not be interpreted in isolation. We therefore reassessed whether computational approaches rooted in **sequence compatibility or structural constraints** offered more useful candidate guidance.

### **Cycle 5**: Reassessing computational design {#cetus-cycle-05 .engineering-cycle-title}

#### Design {#cetus-cycle-05-design}

Our computational exploration had already included **mCSM-NA**, **PremPRI**, an **additive-prior approach**, ProteinMPNN sampling, and AlphaFold 3 contact analysis. None had established a reliable route to improved +1 G/A preference. We now examined why, separating three questions: does an inverse-folding model nominate functional mutations, can secondary-structure constraints improve its selections, and can experimental data support prediction of **activity** and **preference** as distinct tasks?

We therefore reevaluated **ProteinMPNN**, applied **AiCE** secondary-structure filtering, and trained supervised models separately for **Activity Retention** and **+1 Ratio**. In parallel, we designed a **matched M132D/M132E substitution pair** on an otherwise identical combination background. Our **61-entry candidate list** organized replication, new single mutants, combinations, controls, and exploratory designs (Figure 8); these were **proposals**, not 61 experimentally screened constructs.

![Candidate design categories and priorities for the next APOBEC variants](/assets/images/submission-20261017/engineering/cetus/Figure_08.png){.engineering-figure style="--engineering-figure-width:760px;--engineering-detail-width:960px"}

*Figure 8. Proposed APOBEC candidates organized by design purpose and priority.*

#### Build {#cetus-cycle-05-build}

We reanalyzed **48 ProteinMPNN-sampled sequences** against the measured single-mutant outcomes. For AiCE, we assigned secondary structure using a Python **DSSP** workflow and applied distinct thresholds to structured versus coil regions (**β = 0.8** and **γ = 0.5**). We also trained supervised models on the existing mutation dataset. Wet-lab screening covered **37 mutant groups and two PUF references**, including the controlled residue-132 comparison.

#### Test {#cetus-cycle-05-test}

ProteinMPNN sampling frequency was **negatively associated with measured +1 Ratio (r = −0.499)** and showed no clear relationship with Activity Retention. It **never sampled K30H**; none of the top **14** single mutants ranked by measured activity had received a candidate nomination through this sampling. Adding AiCE filtering provided little discrimination in the binding regions: **16 of 18** relevant positions were classified as coil and thus received the more permissive constraint.

Supervised learning exposed a more useful distinction. **Activity Retention** showed a measurable predictive relationship (**r = 0.613; p = 0.005; top-10 recovery 56.5% versus a 24.5% random baseline**), whereas **+1 Ratio** did not (**p = 0.164**). Sequence and structural descriptors could help rank some activity outcomes without resolving fine substrate discrimination.

The deliberately matched wet-lab comparison was more decisive for position 132. On a **G25E–K30H–Q58M** background, replacing **M132D with M132E** increased Activity Retention from **0.3398 to 0.7517**, while +1 Ratio fell from **2.58 to 1.66** (Figure 9). A related four-mutation candidate, **G27T–K30H–Q58M–M132E**, reached **2.08** for +1 Ratio but retained only **0.67** of target activity—close to, but below, our joint gate.

![Measured activity and ratio of computationally selected mutants and matched residue-132 pairs](/assets/images/submission-20261017/engineering/cetus/Figure_09.png){.engineering-figure style="--engineering-figure-width:620px;--engineering-detail-width:960px"}

*Figure 9. Evaluation of the designed-variant batch and a matched M132D/M132E comparison.*

#### Learn {#cetus-cycle-05-learn}

The methods were not interchangeable: **general sequence/structure compatibility was poorly aligned with +1 preference**, while supervised prediction offered some information about target activity. The matched M132D/E comparison identified **M132E as the more activity-retaining substitution on that combination background**, while the G27T–K30H–Q58M–M132E candidate remained below the joint activity gate. These results motivated testing **M132E alone** alongside the established triple mutant in the next batch. Computational outputs supplied hypotheses; functional assays and matched controls determined which candidates merited further evaluation.

### **Cycle 6**: Testing a new library background {#cetus-cycle-06 .engineering-cycle-title}

#### Design {#cetus-cycle-06-design}

The final cycle asked whether the promising **G27T–K30H–Q58M** combination remained competitive under a **different library-preparation background** and whether residue **G27** could be engineered more broadly for ACA suppression. We included **M132D/E single mutants** to contrast single and combination effects, plus **PUF reference groups** to assess GCG/GCA preference in the targeting context. Since library backgrounds differed, we compared **ROF and Activity Retention against the parent within each batch**, rather than directly comparing raw +1 Ratios between batches.

#### Build {#cetus-cycle-06-build}

The batch comprised **29 groups and 64 sequenced samples**: **ten** G27 substitutions, **eleven** other single mutants, **four** combinations, and **four** PUF references. All samples met the depth criterion **DP ≥ 500**.

#### Test {#cetus-cycle-06-test}

Among **25 mutant constructs**, **G27T–K30H–Q58M** attained **ROF = 1.218** and **Activity Retention = 0.980**, ranking **third by ROF** and appearing on the **Pareto front** (Figure 10). The two higher-ROF candidates, **G27I** and **G27D–K30H**, retained less target activity (**0.745** and **0.783**, respectively). A same-batch comparison showed that adding **G27T** to **K30H–Q58M** increased ROF from **1.146 to 1.218** with only a small change in retention (**1.005 → 0.980**).

The G27 scan provided a different benefit. **Seven of ten substitutions** brought **c.295 (ACA)** editing below the 5% detection threshold. **G27D** was particularly useful: c.295 editing was undetectable while **Activity Retention = 0.990**. Yet most G27 substitutions had little +1 effect (**seven of ten ROF ≤ 1.06**), reinforcing the distinction between −1- and +1-context optimization.

The new batch also revealed **context sensitivity in a previously strong single mutation**: **K30H**, the leading activity-retaining single mutant in Cycle 1, now showed **ROF = 1.050**, ranking **14th of 25**. This does not invalidate its earlier result or its role in the triple mutant; it shows that a single-mutant ranking is not universal across experimental backgrounds. **M132E** retained **1.018** of parental target activity with **ROF = 1.062**, whereas **M132D** retained **0.915**. M132E therefore offered a high-activity single-mutant candidate with only a modest GCG/GCA preference shift. Its **c.295 editing fraction was 0.1259**, so it did not reproduce the below-detection ACA result of G27D. All four PUF references had +1 Ratios close to **1.0**.

![Independent-batch performance of APOBEC candidates and position-27 substitutions](/assets/images/submission-20261017/engineering/cetus/Figure_10.png){.engineering-figure style="--engineering-figure-width:600px;--engineering-detail-width:960px"}

*Figure 10. Independent-batch performance of leading APOBEC combinations and a systematic G27 substitution series.*

#### Learn {#cetus-cycle-06-learn}

The triple mutant retained a strong **within-batch activity–preference balance**. **M132E** provided a complementary candidate with **near-parental target activity** and a simpler single-substitution background. Together with the matched residue-132 comparison in Cycle 5, these results justified carrying both directions into POD–CETUS integration. The G27 scan remained evidence that **ACA suppression and +1 G/A discrimination are distinct objectives**; its G27D result was not assigned to M132E. Integration still required matched functional measurements, because neither single-module activity nor a favorable combination result established compatibility with an engineered POD.

---

### **Conclusion** {#cetus-conclusion .engineering-section-title}

CETUS began by searching for residues that might distinguish the +1 base of an RNA substrate. Six DBTL cycles showed that **APOBEC sequence preference is distributed across recognition regions** and must be evaluated alongside the desired editing activity—not inferred from structural proximity or a high ratio alone.

Our clearest **GCG/GCA-preference candidate**, **G27T–K30H–Q58M**, was the only variant in its combination batch to meet both preset criteria (**+1 Ratio 2.156; Activity Retention 0.773**) and remained competitive in another library background (**ROF 1.218; Activity Retention 0.980**). **M132E** supplied the second candidate direction: it preserved **1.018** of parental target activity with **ROF 1.062** as a single mutant, and retained more activity than M132D in a matched combination comparison (**0.7517 versus 0.3398**). These findings supported advancing the triple mutant and M132E into **Integrated ORCA** for their distinct performance profiles. They did not establish M132E as an ACA-suppressing or universally specificity-enhancing mutation.

Equally important was the engineering method established along the way. **Matched controls exposed combination-dependent effects**, amplicon-wide analysis revealed the limits of local motif ratios, and computational predictions proved more useful for generating hypotheses than for assigning functional selectivity. Alongside POD's target-recognition engineering, these APOBEC-level advances form the catalytic optimization arm for subsequent **Integrated ORCA** design.

### References {#cetus-references}

1. Han W, Huang W, Wei T, et al. Programmable RNA base editing with a single gRNA-free enzyme. *Nucleic Acids Research*. 2022;50:9580–9595. https://doi.org/10.1093/nar/gkac713
2. Han W, Yuan B, Fan X, et al. Effective in vivo RNA base editing via engineered cytidine deaminase APOBECs fused with PUF proteins. *Nature Communications*. 2025;16:9727. https://doi.org/10.1038/s41467-025-64748-6
3. Wolfe AD, Li S, Goedderz C, Chen XS. The structure of APOBEC1 and insights into its RNA and DNA substrate selectivity. *NAR Cancer*. 2020;2:zcaa027. https://doi.org/10.1093/narcan/zcaa027
4. Thuronyi BW, et al. Continuous evolution of base editors with expanded target compatibility and improved activity. *Nature Biotechnology*. 2019;37:1070–1079. https://doi.org/10.1038/s41587-019-0193-0
5. Wu Y, Xiao Y-L, Tang W. High-precision cytosine base editors by evolving nucleic-acid-recognition hotspots in deaminase. *Nature Biotechnology*. 2026;44:587–601. https://doi.org/10.1038/s41587-025-02678-w
6. Abramson J, et al. Accurate structure prediction of biomolecular interactions with AlphaFold 3. *Nature*. 2024;630:493–500. https://doi.org/10.1038/s41586-024-07487-w

## Integrated ORCA {#integrated-orca .engineering-chapter-title}

Engineering the complete RNA editor
{.engineering-chapter-subtitle}

### Overview {#integrated-orca-overview}

<img class="engineering-overview-illustration" src="/assets/images/engineering-overviews/integrated-orca.png" alt="Integrated ORCA combines POD recognition and CETUS catalysis." width="1800" height="1080" decoding="async">

Integrated ORCA brings POD recognition variants and CETUS catalytic variants into a single editor. We compared their combinations with the original editor and single-module controls to assess the balance between target activity and bystander editing.

### **Engineering Rationale** {#integrated-orca-engineering-rationale .engineering-section-title}

#### Why integrate two independently optimized modules? {#integrated-orca-why-integrate-two-independently-optimized-modules}

ORCA combines programmable RNA recognition with cytidine deamination. Its recognition module, **POD (Programmable On-target Docking)**, uses engineered PUF repeats to position the editor near the intended RNA site. Its catalytic module, **CETUS (Cytidine Editing, Tethered for Uridine Switching)**, modifies APOBEC to reshape catalytic activity and sequence preference. In their respective engineering efforts, we explored ways to reduce unwanted editing without losing the C388 activity needed for APOE4-to-APOE3 conversion.

These improvements address different molecular functions, but the functions are coupled. Altering PUF recognition may change how a cytidine is presented to APOBEC; altering APOBEC may change which accessible cytidines are favored. Consequently, a POD variant with an advantageous editing profile and a CETUS variant with an advantageous editing profile might not preserve those properties when fused into the same editor. Their combined behavior must be measured rather than inferred.

The relevant engineering question was therefore **which POD–CETUS pairings preserve meaningful target activity while improving bystander control**. A comparison among integrated editors alone could not answer it. We needed matched references representing the original editor, each modification individually, and both modifications together. This would reveal whether an apparent improvement was actually attributable to integration rather than to one component by itself.

We also needed more than a single performance metric. A lower bystander signal may simply reflect loss of overall editing activity; a lower average burden may conceal an increase at a potentially damaging site; and site-wise frequencies cannot show which edits coexist on the same RNA-derived read. We therefore evaluated target editing, individual bystander sites, broader editing burden, and read-level co-editing as distinct but complementary outcomes.

### **Cycle 1**: Evaluating module compatibility {#integrated-orca-cycle-01 .engineering-cycle-title}

#### Design — A Combinatorial Test of Module Compatibility {#integrated-orca-cycle-01-design}

We selected four previously engineered **POD variants**—**P9-NTQ, P8-GVE, P9-GNS, and P9-NPS**—and four **CETUS variants**—**30H, 30H-58M, 27T-30H-58M, and M132E**. G27T–K30H–Q58M and M132E carried forward the two CETUS candidate directions: activity–preference balance and target-activity retention, respectively. The 30H and 30H–58M candidates retained earlier engineering backgrounds for comparison. Each pairing still required matched functional testing.

Pairing every POD with every CETUS produced a **4 × 4 design comprising 16 Integrated ORCA constructs**. All were based on the same PUF–APOBEC fusion architecture, with the engineered recognition and catalytic sequences as the variables (Figure 1A).

For each integrated construct, the planned comparison contained four editor states: **Original ORCA**, the matching **POD-only** modification, the matching **CETUS-only** modification, and **Integrated ORCA** with both modifications. We would first compare editing at the intended C388 site, then assess important bystanders, the wider APOE editing landscape, and co-editing within individual sequencing reads (Figure 1B). This design provided a direct test of module compatibility without presuming that two favorable single-module results would combine favorably.

![Figure 1. Combinatorial integration strategy and matched four-condition evaluation framework.](/assets/images/submission-20261017/engineering/integrated-orca/Figure_01.png){.engineering-figure style="--engineering-figure-width:740px;--engineering-detail-width:960px"}

*Figure 1. Four POD variants and four CETUS variants were combined in a 16-construct design and evaluated against original and matched single-module editors.*

#### Build — Constructing and Verifying the Integrated Library {#integrated-orca-cycle-01-build}

We assembled the 16 planned POD–CETUS expression constructs and verified their sequences before functional testing. Two combinations—**P8-GVE × 30H-58M** and **P8-GVE × M132E**—showed sequence abnormalities and were excluded from downstream assays. The other **14 constructs passed sequence verification** and were assigned stable identifiers, **IO-01 through IO-14**, according to the verified pairing matrix (Figure 2).

This distinction between **16 designed** and **14 experimentally evaluated** constructs is maintained throughout the analysis. The validated library was tested alongside Original ORCA and its corresponding POD-only and CETUS-only controls.

![Figure 2. Sequence-verified Integrated ORCA construct matrix.](/assets/images/submission-20261017/engineering/integrated-orca/Figure_02.png){.engineering-figure style="--engineering-figure-width:540px;--engineering-detail-width:960px"}

*Figure 2. Fourteen of the 16 planned POD–CETUS combinations passed sequence verification and were assigned IO-01–IO-14 identifiers.*

#### Test — Functional Evaluation of Integrated ORCA {#integrated-orca-cycle-01-test}

##### Test 1 — Target Editing Depends on the Module Pairing {#integrated-orca-test-1-target-editing-depends-on-the-module-pairing}

We expressed the 14 sequence-verified editors in HEK293T cells and measured C388 C-to-U editing through C-to-T signals in sequenced APOE cDNA. Each condition was assessed by **two independent PCR amplifications and sequencing runs from the same cDNA sample**. These were technical measurements, not independent biological replicates. The mean absolute difference between the paired measurements across the 14 integrated editors was **0.69 percentage points** (Figure 3B).

The resulting C388 editing rates ranged from **0.81% to 77.18%**, showing that module pairing substantially affected the activity of the complete editor (Figure 3A). **IO-09 (P9-GNS × 27T-30H-58M)** was the most active integrated construct at **77.18%**, followed by **IO-08 (P9-GNS × 30H-58M)** at **70.04%** and **IO-03 (P9-NTQ × 27T-30H-58M)** at **69.78%**. **IO-02 (P9-NTQ × 30H-58M)** retained **61.31%** target editing.

The differences were not explained by either module alone. With the same P9-GNS recognition domain, changing CETUS from 27T-30H-58M in IO-09 to M132E in IO-10 reduced C388 editing from **77.18% to 2.58%**. Conversely, 27T-30H-58M supported **69.78%** editing with P9-NTQ (IO-03) but only **0.81%** with P8-GVE (IO-06). These contrasts establish that successful independent optimization does not ensure functional compatibility in the assembled protein.

![Figure 3. C388 editing performance and technical reproducibility across the integrated library.](/assets/images/submission-20261017/engineering/integrated-orca/Figure_03.png){.engineering-figure style="--engineering-figure-width:740px;--engineering-detail-width:960px"}

*Figure 3. The validated POD–CETUS combinations produced widely different C388 editing rates, with close agreement between paired technical measurements.*

##### Test 2 — What Does Integration Add Beyond Either Module Alone? {#integrated-orca-test-2-what-does-integration-add-beyond-either-module-alone}

###### A matched comparison of target activity and bystander burden {#integrated-orca-a-matched-comparison-of-target-activity-and-bystander-burden}

Original ORCA achieved **85.54%** C388 editing in this experiment. The four POD-only editors retained **62.74%–83.83%** activity, while CETUS-only variants spanned **60.55%–90.32%** (Figure 4A). Nevertheless, **all 14 integrated editors edited C388 less efficiently than their matched CETUS-only controls**; only **IO-08 and IO-09** exceeded their matched POD-only reference (Figure 4B). Combining two individually active modules therefore often imposed an additional activity cost.

To ask whether that cost came with improved selectivity, we quantified editing at a fixed set of **147 non-target cytidines** predicted to cause a coding change if edited individually: **32 potential stop-gain** and **115 potential missense** positions. We used the **sum of their site-specific C-to-T frequencies** as a cumulative *potentially nonsynonymous bystander burden*. This is a site-based score, **not the percentage of RNA molecules bearing a bystander edit**.

The activity–burden comparison revealed meaningful differences among the pairings (Figure 5). **Thirteen of the 14 integrated editors** had lower cumulative potentially nonsynonymous burden than both matched single-module controls; **IO-09** was the exception. But a reduction in burden was not automatically useful: some combinations lost nearly all C388 activity. By contrast, **IO-02, IO-03, and IO-13** retained target editing of **61.31%, 69.78%, and 46.11%**, with cumulative burdens of **1.423, 1.689, and 0.817**, respectively.

![Figure 4. Target editing of original, single-module, and integrated ORCA editors.](/assets/images/submission-20261017/engineering/integrated-orca/Figure_04.png){.engineering-figure style="--engineering-figure-width:760px;--engineering-detail-width:960px"}

*Figure 4. Matched single-module references expose the activity changes associated with introducing both POD and CETUS modifications.*

![Figure 5. Activity and potentially nonsynonymous bystander burden changes after integration.](/assets/images/submission-20261017/engineering/integrated-orca/Figure_05.png){.engineering-figure style="--engineering-figure-width:780px;--engineering-detail-width:960px"}

*Figure 5. Changes in C388 activity and cumulative editing across 147 potentially nonsynonymous bystander sites are shown relative to each matched single-module control.*

###### Same POD, different catalytic partner: IO-08 versus IO-09 {#integrated-orca-same-pod-different-catalytic-partner-io-08-versus-io-09}

**IO-08 and IO-09** illustrate why increased target editing alone is an insufficient criterion (Figure 6). Both use P9-GNS, whose POD-only reference edited C388 at **63.74%** with a potentially nonsynonymous burden of **4.087**.

Adding CETUS **30H-58M** produced **IO-08**: target editing rose to **70.04%**, while the cumulative bystander burden fell to **2.697**—a **34.0% reduction** relative to P9-GNS-only. In this comparison, integration improved both measurements, although IO-08 still edited C388 less efficiently than 30H-58M-only.

Adding **27T-30H-58M** instead produced **IO-09**, with even higher C388 editing (**77.18%**) but a higher burden (**6.090**) than either matched single-module control. The same recognition variant thus supported two substantially different activity–selectivity outcomes depending on its catalytic partner.

![Figure 6. Contrasting outcomes with the same P9-GNS recognition module.](/assets/images/submission-20261017/engineering/integrated-orca/Figure_06.png){.engineering-figure style="--engineering-figure-width:700px;--engineering-detail-width:960px"}

*Figure 6. IO-08 improved C388 activity and reduced potentially nonsynonymous bystander burden relative to P9-GNS-only, whereas IO-09 increased both.*

###### Same CETUS, different recognition partner: IO-03 versus IO-06 {#integrated-orca-same-cetus-different-recognition-partner-io-03-versus-io-06}

The reverse comparison was equally revealing (Figure 7). With CETUS **27T-30H-58M**, **IO-03** retained **69.78%** target activity while reducing cumulative burden to **1.689**, compared with **6.146** for P9-NTQ-only and **5.041** for 27T-30H-58M-only. This was a meaningful activity–bystander trade-off.

With the same CETUS fused to **P8-GVE**, however, **IO-06** fell to **0.81%** C388 editing despite the substantial activity of both individual modules. Its burden was also very low (**0.092**), but this result chiefly reflected near-total loss of editing activity, not a desirable working editor.

![Figure 7. Contrasting outcomes with the same 27T-30H-58M catalytic module.](/assets/images/submission-20261017/engineering/integrated-orca/Figure_07.png){.engineering-figure style="--engineering-figure-width:700px;--engineering-detail-width:960px"}

*Figure 7. IO-03 retained substantial editing with a lower bystander burden, whereas the alternative POD pairing in IO-06 nearly abolished target activity.*

As a supplementary description of four-condition performance, we calculated an additive interaction contrast for the target editing rate:

<div class="engineering-equation"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><msub><mi mathvariant="normal">Δ</mi><mrow><mi mathvariant="normal">i</mi><mi mathvariant="normal">n</mi><mi mathvariant="normal">t</mi><mi mathvariant="normal">e</mi><mi mathvariant="normal">r</mi><mi mathvariant="normal">a</mi><mi mathvariant="normal">c</mi><mi mathvariant="normal">t</mi><mi mathvariant="normal">i</mi><mi mathvariant="normal">o</mi><mi mathvariant="normal">n</mi></mrow></msub><mo>=</mo><msub><mi>E</mi><mrow><mi mathvariant="normal">I</mi><mi mathvariant="normal">n</mi><mi mathvariant="normal">t</mi><mi mathvariant="normal">e</mi><mi mathvariant="normal">g</mi><mi mathvariant="normal">r</mi><mi mathvariant="normal">a</mi><mi mathvariant="normal">t</mi><mi mathvariant="normal">e</mi><mi mathvariant="normal">d</mi></mrow></msub><mo>−</mo><msub><mi>E</mi><mrow><mi mathvariant="normal">P</mi><mi mathvariant="normal">O</mi><mi mathvariant="normal">D</mi><mo mathvariant="normal">−</mo><mi mathvariant="normal">o</mi><mi mathvariant="normal">n</mi><mi mathvariant="normal">l</mi><mi mathvariant="normal">y</mi></mrow></msub><mo>−</mo><msub><mi>E</mi><mrow><mi mathvariant="normal">C</mi><mi mathvariant="normal">E</mi><mi mathvariant="normal">T</mi><mi mathvariant="normal">U</mi><mi mathvariant="normal">S</mi><mo mathvariant="normal">−</mo><mi mathvariant="normal">o</mi><mi mathvariant="normal">n</mi><mi mathvariant="normal">l</mi><mi mathvariant="normal">y</mi></mrow></msub><mo>+</mo><msub><mi>E</mi><mrow><mi mathvariant="normal">O</mi><mi mathvariant="normal">r</mi><mi mathvariant="normal">i</mi><mi mathvariant="normal">g</mi><mi mathvariant="normal">i</mi><mi mathvariant="normal">n</mi><mi mathvariant="normal">a</mi><mi mathvariant="normal">l</mi></mrow></msub><mi>.</mi></mrow><annotation encoding="application/x-tex">&#10;&#92;&#68;&#101;&#108;&#116;&#97;&#95;&#123;&#92;&#109;&#97;&#116;&#104;&#114;&#109;&#123;&#105;&#110;&#116;&#101;&#114;&#97;&#99;&#116;&#105;&#111;&#110;&#125;&#125;&#61;&#69;&#95;&#123;&#92;&#109;&#97;&#116;&#104;&#114;&#109;&#123;&#73;&#110;&#116;&#101;&#103;&#114;&#97;&#116;&#101;&#100;&#125;&#125;&#45;&#69;&#95;&#123;&#92;&#109;&#97;&#116;&#104;&#114;&#109;&#123;&#80;&#79;&#68;&#45;&#111;&#110;&#108;&#121;&#125;&#125;&#45;&#69;&#95;&#123;&#92;&#109;&#97;&#116;&#104;&#114;&#109;&#123;&#67;&#69;&#84;&#85;&#83;&#45;&#111;&#110;&#108;&#121;&#125;&#125;&#43;&#69;&#95;&#123;&#92;&#109;&#97;&#116;&#104;&#114;&#109;&#123;&#79;&#114;&#105;&#103;&#105;&#110;&#97;&#108;&#125;&#125;&#46;&#10;</annotation></semantics></math></div>

The contrasts were **+1.52** and **+10.08 percentage points** for IO-08 and IO-09, compared with **−17.42** and **−73.97** for IO-03 and IO-06. These values quantify departure from a simple additive reference; they do not, by themselves, demonstrate molecular synergy or antagonism. Taken together, the matched comparisons showed that **module compatibility is an experimentally determined property of each integrated editor**.

##### Test 3 — Where Does Unintended Editing Occur? {#integrated-orca-test-3-where-does-unintended-editing-occur}

###### Critical sites reveal different editing preferences {#integrated-orca-critical-sites-reveal-different-editing-preferences}

We extended the analysis across a **951-nt APOE coding-region reference** containing **291 cytidines**: the intended target C388 and **290 non-target positions**. The non-target sites comprise **32 potential stop-gain**, **115 potential missense**, and **143 synonymous** changes, classified by the predicted effect of an individual C-to-T substitution in that reference sequence.

We first examined nine representative bystanders, including the potential stop-gain sites **C295, C355, C757, C871, and C904** (Figure 8). Original ORCA edited **C295 at 36.56%** and **C871 at 79.17%**. In **IO-02**, these fell to **9.14%** and **13.84%**; in **IO-03**, to **8.15%** and **14.28%**. Yet the two candidates did not improve every position equally: for example, **IO-03** showed lower editing at C757, while **IO-02** showed lower editing at C874.

The synonymous neighbor **C390** also remained appreciably edited, despite not changing the encoded amino acid when considered alone. Its editing decreased from **76.89%** in Original ORCA to **37.01%** and **45.40%** in IO-02 and IO-03. Thus, focusing exclusively on predicted protein-altering sites would overlook an important part of the editor's RNA-level behavior.

![Figure 8. Editing at nine representative bystander sites and their predicted coding consequences.](/assets/images/submission-20261017/engineering/integrated-orca/Figure_08.png){.engineering-figure style="--engineering-figure-width:720px;--engineering-detail-width:960px"}

*Figure 8. Integrated ORCA variants show distinct editing profiles at representative stop-gain, missense, and synonymous bystander sites.*

Comparing the same sites against *matched* single-module editors showed that reduced cumulative burden did not mean uniform site-by-site suppression (Figure 9). For instance, **IO-08** reduced C871 and C874 editing relative to both matching single-module references, yet C295 and C757 were **12.41 and 14.16 percentage points higher** than in 30H-58M-only. **IO-09** likewise increased several hotspots relative to P9-GNS-only while suppressing others. The second engineered module changed the **distribution** of editing, not just its overall magnitude.

![Figure 9. Site-specific bystander redistribution relative to matched single-module references.](/assets/images/submission-20261017/engineering/integrated-orca/Figure_09.png){.engineering-figure style="--engineering-figure-width:740px;--engineering-detail-width:960px"}

*Figure 9. The direction and magnitude of bystander changes after integration depend on both the site examined and the matched reference used.*

###### Beyond hotspots: the full measured APOE region {#integrated-orca-beyond-hotspots-the-full-measured-apoe-region}

We next mapped C-to-T signals across all **290 non-target cytidines**, displaying the 951-nt region in three continuous sections for positional clarity (Figure 10). Original ORCA showed editing at numerous positions beyond the familiar hotspots. IO-02 and IO-03 attenuated signals across much of the measured region, although detectable editing remained at several sites. IO-09 retained broader and stronger hotspots, consistent with its higher cumulative burden.

![Figure 10. Regional editing landscape across the sequenced APOE coding segment.](/assets/images/submission-20261017/engineering/integrated-orca/Figure_10.png){.engineering-figure style="--engineering-figure-width:860px;--engineering-detail-width:1000px"}

*Figure 10. Position-resolved C-to-T editing across all 290 non-target cytidines highlights both widespread suppression and persistent hotspots in different editors.*

To compare the library more systematically, we summarized the **sum of site-editing frequencies** by predicted consequence and counted the number of non-target sites with mean editing **≥5%** (Figure 11). These complementary measures distinguish cumulative burden from the breadth of appreciable editing; the 5% cutoff is descriptive, not a validated detection threshold.

Original ORCA had a cumulative **290-site burden of 21.658**, with **87 sites** at or above 5% editing. IO-02 and IO-03 lowered these totals to **2.671 / 12 sites** and **3.420 / 18 sites**, respectively. Their cumulative **147-site potentially nonsynonymous burdens** were **1.423** and **1.689**. By comparison, IO-09 reached **10.373** across 290 sites and **53 sites** at or above 5%, despite its higher target editing rate.

Single-module optimization also remained competitive: **M132E-only** retained **60.55%** C388 editing, a 290-site burden of **1.683**, and only **five sites** at or above 5%. This reinforced the importance of the single-module controls: adding a second engineered module must earn its place through measured performance.

![Figure 11. Consequence-resolved cumulative bystander burden and number of edited sites.](/assets/images/submission-20261017/engineering/integrated-orca/Figure_11.png){.engineering-figure style="--engineering-figure-width:800px;--engineering-detail-width:960px"}

*Figure 11. Bystander burden and the number of sites edited at ≥5% are grouped by predicted stop-gain, missense, and synonymous consequences.*

##### Test 4 — Which Edits Occur on the Same Read? {#integrated-orca-test-4-which-edits-occur-on-the-same-read}

###### A stringent target-positive, bystander-exclusion metric {#integrated-orca-a-stringent-target-positive-bystander-exclusion-metric}

Site-level editing frequencies cannot determine whether the intended C388 edit and an unwanted change coexist on the same molecule. We therefore used **Nanopore long-read sequencing** to evaluate co-editing. For a directly comparable read-level analysis, we retained only reads meeting the base-quality requirement at **all 148 designated positions**: C388 and the 147 potentially nonsynonymous bystander sites. Our primary analysis used **MAPQ ≥20** and **base quality ≥Q13**.

Within this commonly callable set, we measured the fraction of reads containing **C388T and no detected C-to-T event at any of the other 147 sites**. The denominator was **all reads passing the 148-site requirement**, not all original RNA molecules. This is a stringent sequencing-based selectivity measure, **not a direct estimate of functional APOE3 production**.

In the matched four-condition comparison, this fraction was **4.17%** for Original ORCA and **8.76%** for P9-NTQ-only. The matching CETUS-only controls reached **5.23%** (30H-58M-only) and **6.21%** (27T-30H-58M-only). In contrast, the integrated editors reached **19.56% for IO-02** and **15.25% for IO-03** (Figure 12). Although both integrated variants lost some absolute C388 activity relative to single-module references, they yielded more reads satisfying this stricter combined criterion.

![Figure 12. Matched comparison of stringent read-level editing outcomes.](/assets/images/submission-20261017/engineering/integrated-orca/Figure_12.png){.engineering-figure style="--engineering-figure-width:680px;--engineering-detail-width:960px"}

*Figure 12. IO-02 and IO-03 increased the proportion of jointly callable reads carrying C388T without detected C-to-T edits at 147 specified potentially nonsynonymous sites.*

###### Different exclusion criteria change the preferred candidate {#integrated-orca-different-exclusion-criteria-change-the-preferred-candidate}

To understand what drove these differences, we progressively excluded target-edited reads with **C295T or C871T**, then with **any other potential stop-gain edit**, and finally with **any other potentially nonsynonymous edit**. Every step used the **same 148-site-callable denominator** (Figure 13).

Under Q13 filtering, **IO-03** retained more target-edited reads than **IO-02** after excluding potential stop-gain edits (**35.48% versus 30.59%**). When all 147 potentially nonsynonymous sites were included in the exclusion, the ranking reversed: **IO-02 reached 19.56%**, versus **15.25%** for IO-03 (Figure 13A). IO-03 therefore favored retention of target editing without the examined stop-gain events, while IO-02 performed better under the broader nonsynonymous-exclusion criterion.

The same analysis exposed a weakness in high-activity editors. Original ORCA began with **82.55%** target-edited reads in the common-callable subset, but only **11.49%** remained after excluding C295T and C871T. IO-09 fell from **76.51% to 17.74%** under the same exclusion. These losses reveal how frequently the desired edit co-occurred with the specified potentially damaging bystanders.

![Figure 13. Sequential exclusion of potentially consequential co-edits.](/assets/images/submission-20261017/engineering/integrated-orca/Figure_13.png){.engineering-figure style="--engineering-figure-width:800px;--engineering-detail-width:960px"}

*Figure 13. Successively excluding stop-gain and other potentially nonsynonymous edits changes the proportion of reads retained and the relative standing of IO-02 and IO-03.*

###### Similar averages can conceal different co-editing distributions {#integrated-orca-similar-averages-can-conceal-different-co-editing-distributions}

We also counted additional C-to-T events at the **147 designated bystander sites** among reads already containing C388T. The original editor averaged **12.57** such additional events per target-positive read; **77.14%** of its target-positive callable reads contained **at least five**. For IO-09, the corresponding average was **6.85**, but **67.02%** still carried at least five additional events (Figure 14A).

**IO-02 and IO-03** had nearly identical average additional-event counts (**2.04** and **2.00**), yet their distributions differed. **IO-02** had more target-positive reads with **zero detected additional designated nonsynonymous edits** (**32.02% versus 22.47%**), but also a larger fraction with **at least five** (**13.56% versus 9.77%**). Thus, even when mean co-editing burden is similar, the balance between clean reads and a highly edited tail can be different (Figure 14B).

![Figure 14. Co-editing burden distributions among reads containing the target edit.](/assets/images/submission-20261017/engineering/integrated-orca/Figure_14.png){.engineering-figure style="--engineering-figure-width:800px;--engineering-detail-width:960px"}

*Figure 14. The number of additional potentially nonsynonymous C-to-T events in C388-edited reads reveals differences obscured by average co-editing burden.*

###### Sensitivity to read-quality filtering {#integrated-orca-sensitivity-to-read-quality-filtering}

Requiring good base calls at 148 positions necessarily reduces usable read counts. At Q13, approximately **10.53%–19.44%** of reads met this requirement; at Q20, **3.45%–7.48%**; and at Q30, only **0.11%–0.79%**. Q30 typically left just **2–33 callable reads per PCR measurement**, making candidate ranking unreliable.

Importantly, the strict-exclusion advantage of IO-02 over IO-03 narrowed from **19.56% versus 15.25% at Q13** to **18.09% versus 17.47% at Q20**. These are analyses of different quality-filtered subsets, not independent biological confirmations. We therefore use read-level outcomes to characterize complementary candidate profiles, not to claim a definitive overall selectivity ranking or a measured yield of functional APOE3 transcripts.

#### Learn — Choosing Candidates by Multiple Objectives {#integrated-orca-cycle-01-learn}

The integrated library revealed three engineering lessons. First, **module compatibility is pairing-dependent**: individually active POD and CETUS variants can yield either a useful editor or a nearly inactive one. Second, an overall reduction in bystander burden may coexist with persistent or elevated editing at specific high-consequence positions. Third, **site-level editing and read-level co-editing answer different questions**; neither can substitute for the other.

To make the final choice explicit, we benchmarked all **14 sequence-verified Integrated ORCA variants** on four complementary outcomes (Figure 15):

1. **Target activity:** C388 editing rate.
2. **Stop-gain exclusion:** the proportion of jointly callable reads with C388T and no detected C-to-T at the 32 designated potential stop-gain sites.
3. **Potentially nonsynonymous burden:** the summed C-to-T frequencies across 147 specified non-target positions.
4. **Stringent nonsynonymous exclusion:** the proportion of jointly callable reads with C388T and no detected C-to-T at those 147 positions.

All read-level metrics in this benchmark used the Q13 primary analysis. Rather than combine the four outcomes into an arbitrarily weighted score, we retained their different biological interpretations. No editor dominated all four measures. The most active, **IO-09**, reached **77.18%** target editing but carried a comparatively high bystander burden. Some lower-burden constructs offered little residual target activity. **IO-02 and IO-03** instead provided two practical, distinct compromises.

![Figure 15. Multidimensional benchmark of all sequence-verified Integrated ORCA variants.](/assets/images/submission-20261017/engineering/integrated-orca/Figure_15.png){.engineering-figure style="--engineering-figure-width:840px;--engineering-detail-width:960px"}

*Figure 15. Four metrics compare target activity and increasingly stringent bystander control across 14 integrated editors. Dark highlighting distinguishes the two retained candidates; asterisks flag constructs with fewer than 100 target-positive, jointly callable reads in each technical measurement.*

**IO-03 (P9-NTQ × 27T-30H-58M)** prioritized target activity and avoidance of the specified potential stop-gain edits. It edited C388 at **69.78%**, and **35.48%** of Q13 jointly callable reads retained C388T without a detected potential stop-gain bystander, compared with **30.59%** for IO-02.

**IO-02 (P9-NTQ × 30H-58M)** favored broader suppression of potentially nonsynonymous editing. It retained **61.31%** C388 editing, with a lower cumulative 147-site burden than IO-03 (**1.423 versus 1.689**). Its stricter Q13 read-level fraction was **19.56%**, versus **15.25%** for IO-03, although their separation diminished markedly at Q20.

Both share the **P9-NTQ recognition domain**, while their different CETUS partners shape complementary outcomes. We therefore retained **IO-02 and IO-03** as the two Integrated ORCA candidates for downstream evaluation, rather than declaring the highest-activity editor or the lowest-burden editor universally best.

### **Conclusion** {#integrated-orca-conclusion-from-component-optimization-to-editor-level-selection .engineering-section-title}

Integrated ORCA turned independently engineered RNA-recognition and catalytic modules into a testable combinatorial system. Of **16 designed combinations**, **14 were sequence-verified** and evaluated against original and matched single-module references. Target editing, consequence-resolved bystander analysis, and long-read co-editing showed that successful assembly depends on the particular module pairing—and that no single metric captures the resulting editing profile.

By selecting **IO-02 and IO-03** for their complementary activity–selectivity balances, we moved beyond optimizing individual protein parts toward **evidence-based selection of the complete RNA editor**. This provides a defined foundation for subsequent ORCA functional evaluation and further engineering.

## GFA {#gfa .engineering-chapter-title .control-module-title}

<div class="control-milestones" data-control-module="gfa" role="group" aria-label="GFA: milestones achieved"><span class="control-milestone control-milestone--designed"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m15 5 4 4M4 20l4-1L20 7a2.8 2.8 0 0 0-4-4L4 15v5Z"/></svg>Designed</span><span class="control-milestone control-milestone--built"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m12 3 9 5v8l-9 5-9-5V8l9-5Zm-9 5 9 5 9-5M12 13v8M7.5 5.5l9 5"/></svg>Built</span><span class="control-milestone control-milestone--validated"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m5 12 4 4L19 6"/></svg>Validated</span></div>

Cell-context-dependent transcriptional control
{.engineering-chapter-subtitle}

<p class="control-evidence-note">Cell-context-dependent transcriptional regulation demonstrated; universal astrocyte specificity not established.</p>

<span id="control"></span>

### Overview {#gfa-overview}

<img class="engineering-overview-illustration" src="/assets/images/engineering-overviews/gfa.png" alt="GFA transcriptional control of ORCA." width="1800" height="1080" decoding="async">

To support astrocyte-oriented ORCA expression, we investigated gfaABC1D, a compact GFAP-derived promoter. We compared it with CMV across contrasting cellular backgrounds to assess its potential for transcriptional control.

### **Engineering Rationale** {#gfa-engineering-rationale .engineering-section-title}

#### From RNA Recognition to Cell-Context Control {#gfa-from-rna-recognition-to-cell-context-control}

ORCA's programmable PUF domain recognizes a target RNA sequence, regardless of which cell expresses it. For an editor intended to act primarily in astrocytes, restricting editor production provides a complementary means of limiting activity outside the intended cellular environment.

Glial fibrillary acidic protein (**GFAP**) is a well-established astrocyte-associated marker. Its regulatory sequences have been used to direct transgene expression toward astrocyte-related cellular populations, making a GFAP-derived promoter a logical starting point for ORCA's transcriptional control layer [1, 2].

#### Why gfaABC1D? {#gfa-why-gfaabc1d}

Promoter size was as important as its expression profile. The conventional human GFAP promoter, **gfa2**, is approximately 2.2 kb; together with ORCA's 2,157-nt coding sequence, these components alone would occupy roughly 4.36 kb, before additional expression elements are included. That is a poor fit for the limited packaging space of our planned AAV delivery system [3].

Simply shortening gfa2 was not an adequate solution, since earlier truncation studies showed that promoter architecture affects cell-type expression patterns [1, 2]. **gfaABC1D** instead combines selected A, B, C1, and D regulatory regions in a sequence of approximately **0.68 kb**, with astrocyte-associated expression characteristics reported in transgenic models [2]. It offered a practical compromise between regulatory specificity and cassette size. We therefore replaced CMV with gfaABC1D in an otherwise matched ORCA expression construct for direct testing (Figure 1).

![Figure 1 — GFAP promoter architecture and ORCA expression constructs](/assets/images/submission-20261017/engineering/gfa/Figure_1.png){.engineering-figure style="--engineering-figure-width:640px;--engineering-detail-width:960px"}

*Figure 1. Published GFAP promoter architecture (A; from Yeo et al. [2]) and our matched CMV–ORCA and gfaABC1D–ORCA expression constructs (B).*

### **Cycle 1**: Contrasting cellular backgrounds {#gfa-cycle-01 .engineering-cycle-title}

#### Design {#gfa-cycle-01-design}

Before evaluating an introduced promoter, we needed cellular models with different GFAP-associated expression backgrounds. We selected **U251**, a human glioblastoma-derived cell line with astrocyte-associated features, as a practical glial model [4]. **HEK293T**, a readily transfectable non-glial cell line, served as the comparison. We first examined endogenous GFAP to confirm that these models provided a useful contrast.

#### Build {#gfa-cycle-01-build}

We extracted total RNA from both cell lines, prepared cDNA, and measured endogenous *GFAP* by RT–qPCR. Three cDNA samples per cell line were each assessed in technical duplicate; melting curves were inspected alongside amplification signals.

#### Test {#gfa-cycle-01-test}

U251 showed reproducible GFAP amplification (**Cq 24.33 ± 0.12**) with a distinct melting peak. HEK293T showed only late amplification (**Cq 38.43 ± 0.66**) without a similarly defined peak (Figure 2). The latter signal was therefore not taken as reliable evidence of specific GFAP amplification. Together, the measurements established a clear contrast between the two cellular backgrounds.

![Figure 2 — Endogenous GFAP RT-qPCR in HEK293T and U251](/assets/images/submission-20261017/engineering/gfa/Figure_2.png){.engineering-figure style="--engineering-figure-width:660px;--engineering-detail-width:960px"}

*Figure 2. Endogenous GFAP RT–qPCR and melting curves in HEK293T and U251; three cDNA samples per cell line, with technical duplicates and mean ± SD shown.*

#### Learn {#gfa-cycle-01-learn}

The endogenous GFAP profiles supported using U251 and HEK293T for an initial comparison of glial-associated and non-glial contexts. However, endogenous *GFAP* expression cannot substitute for a direct test of the exogenous gfaABC1D promoter. The next cycle therefore measured ORCA expression and editing-related output from matched promoter constructs.

### **Cycle 2**: Testing gfaABC1D-driven ORCA {#gfa-cycle-02 .engineering-cycle-title}

#### Design {#gfa-cycle-02-design}

Our earlier control experiments had combined gfaABC1D with a microRNA response element (**MRE**), making weak expression signals difficult to attribute to either component. To isolate the transcriptional contribution, we separated the modules and compared **CMV–ORCA** directly with **gfaABC1D–ORCA** in both cell lines. The question was whether the promoter switch would reduce ORCA activity in HEK293T while retaining a useful output in the GFAP-associated U251 model.

#### Build {#gfa-cycle-02-build}

We generated gfaABC1D–ORCA by replacing CMV through homologous recombination, retaining the shared **PUF12-based ORCA** coding sequence and downstream expression elements. Each construct was transiently introduced into HEK293T or U251 together with the same APOE4 reporter, producing four cell line–promoter conditions. Each condition comprised **three independently transfected and RNA-extracted wells**.

ORCA-associated expression was assessed by RT–qPCR, normalized to **GAPDH** and **ACTB** using CMV as the within-cell-line reference. The reporter's **APOE c.388** site was examined by Sanger sequencing, with forward and reverse peak estimates averaged within each sample.

#### Test {#gfa-cycle-02-test}

Changing the promoter produced **opposite patterns in the two cellular backgrounds** (Figure 3). In HEK293T, gfaABC1D markedly reduced the ORCA-associated RT–qPCR signal relative to CMV (estimated GFA/CMV ratio: **0.0171**), accompanied by a lower c.388 editing-associated Sanger peak fraction. In U251, the relationship reversed: gfaABC1D produced the higher RT–qPCR signal (estimated GFA/CMV ratio: **37.2**) and the higher c.388 peak fraction (**57.05%**, versus **7.50%** under CMV).

The agreement between the expression-associated and editing-associated readouts supported a pronounced **cell-context-dependent response** to the promoter substitution. The RT–qPCR ratios describe relative signals **within each cell line**, not absolute expression differences between cell types. The qPCR ratios remain provisional because the editor no-template control showed amplification and −RT and assay-efficiency checks were unavailable. Sanger peak fractions are editing-associated estimates, not calibrated absolute RNA-editing efficiencies.

![Figure 3 — Promoter-dependent ORCA expression and APOE c.388 Sanger signals](/assets/images/submission-20261017/engineering/gfa/Figure_3.png){.engineering-figure style="--engineering-figure-width:620px;--engineering-detail-width:960px"}

*Figure 3. CMV versus gfaABC1D in HEK293T and U251: ORCA-associated RT–qPCR signals (A) and APOE c.388 Sanger peak fractions (B), from three independent transfections per condition (mean ± SD).*

#### Learn {#gfa-cycle-02-learn}

The reduction observed in HEK293T matched our intended regulatory direction. More unexpectedly, **CMV produced a weak ORCA-associated response in U251**, despite its conventional use as a broadly active promoter. Because gfaABC1D produced a stronger signal in the same cell line, generally poor U251 transfection alone could not explain this difference. The large GFA/CMV contrast should instead be treated as the relative performance of these constructs under the tested conditions, not an intrinsic, cell-independent measure of promoter strength.

This changed the way we approached promoter selection. Rather than treating CMV as a universally strong baseline, we would evaluate promoters in the relevant cellular background and consider both transcript-level and functional readouts. Given its compact size and the contrasting output observed in our two models, we retained **gfaABC1D** as ORCA's transcriptional control module.

### **Conclusion** {#gfa-conclusion .engineering-section-title}

GFA introduced a **compact, GFAP-derived transcriptional control layer** into ORCA. Our two-cycle evaluation first established contrasting GFAP-associated cellular models, then showed that replacing CMV with gfaABC1D changed ORCA-associated expression and reporter editing signals in opposite directions in HEK293T and U251. The unexpectedly weak CMV response in U251 reinforced a broader engineering lesson: **promoter performance must be tested in its intended cellular context**. These results supported retaining gfaABC1D in ORCA's control architecture, without treating a two-cell-line comparison as proof of astrocyte-specific expression.

### References {#gfa-references}

1. Lee Y, Messing A, Su M, Brenner M. GFAP promoter elements required for region-specific and astrocyte-specific expression. *Glia*. 2008;56(5):481–493. https://doi.org/10.1002/glia.20622
2. Yeo S, Bandyopadhyay S, Messing A, Brenner M. Transgenic analysis of GFAP promoter elements. *Glia*. 2013;61(9):1488–1499. https://doi.org/10.1002/glia.22536
3. Dong JY, Fan PD, Frizzell RA. Quantitative analysis of the packaging capacity of recombinant adeno-associated virus. *Human Gene Therapy*. 1996;7(17):2101–2112. https://doi.org/10.1089/hum.1996.7.17-2101
4. Grube S, Freitag D, Kalff R, Ewald C, Walter J. Characterization of adherent primary cell lines from fresh human glioblastoma tissue, defining glial fibrillary acidic protein as a reliable marker in establishment of glioblastoma cell culture. *Cancer Reports*. 2021;4(2):e1324. https://doi.org/10.1002/cnr2.1324

## MRE {#mre .engineering-chapter-title .control-module-title}

<div class="control-milestones" data-control-module="mre" role="group" aria-label="MRE: milestones achieved"><span class="control-milestone control-milestone--designed"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m15 5 4 4M4 20l4-1L20 7a2.8 2.8 0 0 0-4-4L4 15v5Z"/></svg>Designed</span><span class="control-milestone control-milestone--built"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m12 3 9 5v8l-9 5-9-5V8l9-5Zm-9 5 9 5 9-5M12 13v8M7.5 5.5l9 5"/></svg>Built</span></div>

Evaluating microRNA-mediated regulation
{.engineering-chapter-subtitle}

<p class="control-evidence-note">Constructed and tested; miRNA-specific suppression not established. Excluded from the final ORCA design.</p>

### Overview {#mre-overview}

<img class="engineering-overview-illustration" src="/assets/images/engineering-overviews/mre.png" alt="miRNA-responsive elements in the ORCA transcript 3-prime UTR." width="1800" height="1080" decoding="async">

We explored a 4×6T microRNA response element as a complementary layer for suppressing ORCA expression in non-target cellular environments. Testing examined miRNA responsiveness and its effects on editor expression and editing output.

### **Engineering Rationale** {#mre-engineering-rationale .engineering-section-title}

#### Two complementary levels of cellular control {#mre-two-complementary-levels-of-cellular-control}

Our GFA strategy used the **gfaABC1D** promoter to favor expression in a glial cellular context. During its development, we encountered a study by Gleichman *et al.* that paired this promoter with a **4×6T miRNA-target cassette** to reduce unwanted neuronal and endothelial expression in an AAV system [1]. The cassette contains four target sites for each of six miRNAs—five associated with neuronal enrichment and one with endothelial enrichment—offering a second layer of regulation after transcription.

We synthesized a **548-bp, 24-site 4×6T cassette** and placed it in the **3′ untranslated region (3′ UTR)** of the ORCA editor transcript, between the coding-sequence stop codon and the SV40 polyadenylation signal. We constructed versions driven by either **CMV** or **gfaABC1D** (Figure 1). This architecture was intended to act on the *editor transcript*, rather than directly on the APOE RNA substrate.

The engineering criterion was straightforward: an additional regulatory layer would be useful only if it produced a meaningful difference between cellular environments **while maintaining adequate editor expression and activity** in the desired setting. The published specificity gain motivated our design, but its compatibility with ORCA still had to be tested.

![Figure 1. Literature-inspired 4×6T design and its placement in the ORCA editor transcript.](/assets/images/submission-20261017/engineering/mre/Figure_01.png){.engineering-figure style="--engineering-figure-width:780px;--engineering-detail-width:1140px"}

*Figure 1. Literature-inspired 4×6T regulation and our ORCA-MRE expression architecture.* Panel A incorporates material from Gleichman *et al.* (2023), Figure 1e–f, cropped and rearranged under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/); [source article](https://doi.org/10.1038/s41467-023-42746-w). Panel B is our original schematic. The published cassette (529 nt) and our synthesized insert (548 bp) are distinct.

### **Cycle 1**: Profiling endogenous miRNAs {#mre-cycle-01 .engineering-cycle-title}

#### Design {#mre-cycle-01-design}

Before testing cellular de-targeting, we needed to establish whether our models actually differed in the miRNAs recognized by 4×6T. We selected **U251** and undifferentiated **SH-SY5Y** as contrasting glial-related and neuronal-lineage models and targeted **miR-124-3p, miR-137-3p, and miR-126-3p** for initial measurement. Cell-line origin alone could not establish their endogenous miRNA profiles.

#### Build {#mre-cycle-01-build}

We extracted RNA with TRIzol and established a custom **stem-loop RT-qPCR** assay, following the detection principle described by Chen *et al.* [2]. **U6** was evaluated as a reference. Each cell line contributed three independent culture wells with technical qPCR duplicates; no-reverse-transcription (no-RT), no-template (NTC), and dilution-series controls were also included.

#### Test {#mre-cycle-01-test}

The assay did not yield a dependable endogenous-miRNA baseline. **miR-124-3p** amplified late (Cq **36.08–39.97**), two of twelve sample reactions had no reported Cq, and some technical duplicates differed substantially. More critically, **U6 no-RT controls amplified within the sample Cq range**, while NTC signals and an unsatisfactory dilution response further weakened assay reliability (Figure 2). Without a trustworthy reference, we could not compare miRNA abundance between U251 and SH-SY5Y.

![Figure 2. Stem-loop RT-qPCR quality-control results for miR-124-3p and U6.](/assets/images/submission-20261017/engineering/mre/Figure_02.png){.engineering-figure style="--engineering-figure-width:620px;--engineering-detail-width:960px"}

*Figure 2. Late miR-124-3p amplification and overlapping U6 assay-control signals prevented reliable endogenous-miRNA normalization.*

#### Learn {#mre-cycle-01-learn}

The failure was methodological, not evidence that the two cell models shared the same miRNA environment. Primer–reverse-transcription compatibility was one possible issue, but its cause was not established. Because the ORCA-MRE constructs were already available, we shifted from measuring endogenous miRNAs to **testing the editor transcript directly**.

### **Cycle 2**: Testing MRE-containing constructs {#mre-cycle-02 .engineering-cycle-title}

#### Design {#mre-cycle-02-design}

Our next question was whether ORCA could retain detectable expression after 4×6T insertion. We compared **CMV**, **CMV–MRE**, **GFA–MRE**, and a **CMV-driven catalytically inactive E72A control** in HEK293T and U251 cells. The central comparison was **CMV versus CMV–MRE**, which differed by the 4×6T insertion. A GFA-only construct was not included in this experimental set, so GFA–MRE could not independently establish the promoter's contribution.

#### Build {#mre-cycle-02-build}

Each construct was co-transfected with an **APOE4 reporter** into three independently cultured wells per condition. We measured editor transcripts by RT-qPCR, with **GAPDH and ACTB** assessed as potential references, and attempted Sanger-based evaluation of APOE editing.

#### Test {#mre-cycle-02-test}

Adding 4×6T was associated with a consistently weaker editor transcript signal. Relative to CMV, **CMV–MRE showed a mean raw editor Cq increase of approximately 4.7 in HEK293T and 2.9 in U251** (Figure 3). GFA–MRE also produced weak signals, although its effect could not be separated from promoter activity without a GFA-only control.

These were **descriptive, unnormalized Cq differences**, not validated fold reductions in expression. NTC amplification and variable technical measurements limited interpretation; the U251 cultures also showed suboptimal cell condition. Because some Sanger sample identities could not be securely matched to their experimental conditions, those reads were not used for an editing-rate comparison.

![Figure 3. Editor RT-qPCR comparison of CMV, CMV–MRE, GFA–MRE, and E72A in HEK293T and U251.](/assets/images/submission-20261017/engineering/mre/Figure_03.png){.engineering-figure style="--engineering-figure-width:620px;--engineering-detail-width:960px"}

*Figure 3. The 4×6T-containing CMV editor showed later transcript amplification than the matched CMV construct in both cell models.*

#### Learn {#mre-cycle-02-learn}

The results raised a more immediate concern than cell selectivity: **the MRE-containing editor might already have an inadequate expression baseline**. Without reliable endogenous-miRNA measurements, we could not attribute the decrease to a specific miRNA or distinguish intended repression from other effects of the modified transcript. We therefore kept the cell background and promoter constant in the next cycle and experimentally varied one miRNA input.

### **Cycle 3**: Controlled miR-124 input {#mre-cycle-03 .engineering-cycle-title}

#### Design {#mre-cycle-03-design}

We introduced a synthetic **hsa-miR-124-3p mimic** in HEK293T cells and established a **2 × 2 design**: negative-control RNA (NC) or miR-124 mimic, each combined with a CMV-driven editor **with or without 4×6T**. This arrangement could reveal whether adding miR-124 produced further repression beyond any baseline difference associated with the MRE construct. Because 4×6T recognizes six miRNAs, changing miR-124 could test only one component of the cassette's potential regulation.

#### Build {#mre-cycle-03-build}

Cells received miR-124 mimic or NC first, followed by the corresponding ORCA plasmid in a second transfection. Three independent culture wells were collected per condition for **editor RT-qPCR** and **Sanger sequencing at APOE C388**.

#### Test {#mre-cycle-03-test}

The main limitation became apparent **before** comparing mimic treatment effects. Under NC treatment alone, the MRE-containing editor already showed an editor Cq near **26**, compared with approximately **16.5** for the construct without MRE. The MRE groups remained in the same weak-amplification range after miR-124 addition, but **the editor NTCs also amplified at Cq 25.67–26.00** (Figure 4A). Signals so close to these controls could not support a reliable estimate of incremental miR-124-dependent repression; no no-RT control was included in this cycle.

The functional readout showed a corresponding loss of measurable output. Without MRE, the **uncalibrated Sanger target-base peak ratios** averaged **57.6% (NC)** and **48.0% (miR-124)**. With MRE, the primary sequencing reads were marked **ND (not detected)** rather than assigned a numerical zero (Figure 4B). An additional reverse read contained a weak signal of approximately **6.3%**, reinforcing that ND should not be equated with proven absence of editing. These peak ratios are not absolute RNA-editing efficiencies.

![Figure 4. Editor transcript measurements and APOE C388 sequencing readouts in the miR-124 mimic experiment.](/assets/images/submission-20261017/engineering/mre/Figure_04.png){.engineering-figure style="--engineering-figure-width:680px;--engineering-detail-width:960px"}

*Figure 4. MRE-containing constructs lacked a reliable transcript and editing-output baseline under both NC and miR-124 treatment; ND denotes no detectable signal in the primary Sanger reads.*

#### Learn {#mre-cycle-03-learn}

The controlled design did not establish a miR-124-specific regulatory effect, because **the NC–MRE condition itself lacked sufficiently reliable output**. NC treatment also did not remove endogenous miRNAs, so the source of the low baseline remained unresolved. For ORCA, however, the engineering consequence was clear: without demonstrable functional output in the intended baseline condition, an additional silencing effect could not be meaningfully evaluated.

### Reassessing the Literature {#mre-reassessing-the-literature}

This finding prompted us to revisit the original design rationale. Gleichman *et al.* had demonstrated improved astrocyte specificity with 4×6T in their own AAV constructs [1], but that result could not guarantee preserved ORCA editing output. In another gfaABC1D-based study, **Taschenberger *et al.* (2017)** reported reduced transgene fluorescence after introducing miR-124 target sequences; importantly, reduced output was also observed with a reversed-sequence control [3]. Their observations illustrated that adding regulatory sequences can impose an **expression cost not explained solely by the intended miRNA-specific effect**.

These studies did not identify the mechanism behind our ORCA-MRE results. They instead sharpened the decision criterion: **cellular de-targeting is only valuable if the target-cell editor remains functional**. For the published comparisons, see [Taschenberger *et al.*, Figures 4 and 5](https://doi.org/10.1016/j.omtn.2017.03.009).

### **Conclusion** {#mre-conclusion .engineering-section-title}

Across three DBTL cycles, we moved from attempting to characterize endogenous miRNA inputs to directly evaluating editor output and then controlling miR-124 exposure. Although the tested **4×6T** construct repeatedly showed weaker transcript signals, we could not demonstrate a selective regulatory benefit, and the final mimic experiment failed to establish a reliable baseline for functional editing.

We therefore **did not incorporate this 4×6T MRE configuration into the selected ORCA system**. The decision was specific to the construct and evidence available, not a rejection of miRNA-based regulation in general. This branch established a practical design requirement for future control layers: **restrict unwanted expression without compromising the editing activity that ORCA is built to deliver**.

### References {#mre-references}

1. Gleichman, A. J., Kawaguchi, R., Sofroniew, M. V., & Carmichael, S. T. (2023). *A toolbox of astrocyte-specific, serotype-independent adeno-associated viral vectors using microRNA targeting sequences.* Nature Communications, **14**, 7426. https://doi.org/10.1038/s41467-023-42746-w
2. Chen, C., et al. (2005). *Real-time quantification of microRNAs by stem–loop RT–PCR.* Nucleic Acids Research, **33**(20), e179. https://doi.org/10.1093/nar/gni178
3. Taschenberger, G., Tereshchenko, J., & Kügler, S. (2017). *A MicroRNA124 Target Sequence Restores Astrocyte Specificity of gfaABC1D-Driven Transgene Expression in AAV-Mediated Gene Transfer.* Molecular Therapy – Nucleic Acids, **8**, 13–25. https://doi.org/10.1016/j.omtn.2017.03.009

## ASO {#aso .engineering-chapter-title .control-module-title}

<div class="control-milestones" data-control-module="aso" role="group" aria-label="ASO: milestones achieved"><span class="control-milestone control-milestone--designed"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m15 5 4 4M4 20l4-1L20 7a2.8 2.8 0 0 0-4-4L4 15v5Z"/></svg>Designed</span><span class="control-milestone control-milestone--built"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m12 3 9 5v8l-9 5-9-5V8l9-5Zm-9 5 9 5 9-5M12 13v8M7.5 5.5l9 5"/></svg>Built</span><span class="control-milestone control-milestone--validated"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m5 12 4 4L19 6"/></svg>Validated</span></div>

Engineering an external OFF interface
{.engineering-chapter-subtitle}

<p class="control-evidence-note">Tag-dependent suppression of editing demonstrated; recovery after ASO withdrawal remains unverified.</p>

### Overview {#aso-overview}

<img class="engineering-overview-illustration" src="/assets/images/engineering-overviews/aso.png" alt="Gapmer ASO, RNA tag and RNase H1 control of ORCA mRNA." width="1800" height="1080" decoding="async">

We investigated antisense oligonucleotides (ASOs) as an externally administered OFF signal for ORCA. A dedicated Synthetic ASO Tag was designed and tested for suppression of reporter expression and ORCA-mediated editing.

### **Engineering Rationale** {#aso-engineering-rationale-why-an-aso-controlled-interface .engineering-section-title}

An externally triggered OFF mechanism should act independently of the transcriptional controls already built into ORCA. Endogenous miRNA regulation is useful for exploiting cell-specific expression patterns, while engineered ribozymes and aptazymes can make RNA output responsive to molecular cues. For an intervention that could be administered separately from the editor, however, we favored a **gapmer ASO** (Figure 1).

A gapmer contains a central DNA segment flanked by chemically modified nucleotides. Hybridization to a complementary RNA can recruit endogenous **RNase H1**, promoting cleavage of the target transcript without requiring another regulatory protein or an additional expression cassette (Figure 2). Because this acts on RNA rather than removing the DNA template, expression could in principle resume as ASO exposure declines. Such recovery must still be demonstrated experimentally. The clinical use of ASOs for CNS disorders also provided a relevant precedent for an externally administered RNA-targeting modality.

The central engineering challenge was **target-site design**. A suitable ASO sequence should have few close matches to human RNAs, remain accessible within the folded ORCA transcript, and avoid concerning near-matches in relevant CNS cell types. Rather than treating these requirements as constraints on ASO selection alone, we asked whether the *target RNA itself* could become an independently designed component of ORCA.

![Comparison of RNA-level regulatory strategies](/assets/images/submission-20261017/engineering/aso/Figure_01.png){.engineering-figure style="--engineering-figure-width:640px;--engineering-detail-width:960px"}

*Figure 1. Comparison of miRNA, aptazyme, and gapmer ASO regulation for an externally triggered ORCA OFF interface; the aptazyme illustration was adapted from Xiang et al. (2019), CC BY 4.0.*

![RNase H1 mechanism of gapmer action](/assets/images/submission-20261017/engineering/aso/Figure_02.png){.engineering-figure style="--engineering-figure-width:880px;--engineering-detail-width:1040px"}

*Figure 2. RNase H1 recognition and cleavage of ASO–RNA hybrids; reproduced from Chiglintseva et al. (2025), CC BY 4.0.*

---

### **Cycle 1**: Targeting native ORCA RNA {#aso-cycle-01 .engineering-cycle-title}

#### Design {#aso-cycle-01-design}

We first evaluated whether a suitable ASO-binding site already existed within a GFA–ORCA reference transcript. Sliding **18-, 20-, and 22-nt windows** across the sequence allowed us to compare potential human-RNA cross-recognition with predicted target accessibility. Longer windows offer more sequence information for distinguishing targets, but do not necessarily remain accessible or behave identically as ASOs.

#### Build {#aso-cycle-01-build}

We developed a computational screen with three successive components:

1. **Sequence quality:** GC content of 30–70%, no homopolymer longer than three nucleotides, and exclusion of short periodic repeats.
2. **Human near-match screening:** comparisons against GENCODE v50 mature RNAs and genome-annotation-derived pre-mRNA regions, including indels and terminally trimmed near-full windows. Candidates with any qualifying match at **edit distance (ED) ≤ 2** were rejected.
3. **RNA accessibility:** RNAplfold estimates for the probability that the complete recognition window was unpaired. We used the more conservative result from two parameter settings:

   <div class="engineering-equation"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><mi>A</mi><mo>=</mo><mrow><mi mathvariant="normal">min</mi><mo>⁡</mo></mrow><mo stretchy="false" form="prefix">(</mo><msub><mi>P</mi><mrow><mn>240</mn><mi>/</mi><mn>160</mn></mrow></msub><mo>,</mo><mspace width="0.167em" /><msub><mi>P</mi><mrow><mn>360</mn><mi>/</mi><mn>240</mn></mrow></msub><mo stretchy="false" form="postfix">)</mo><mi>.</mi></mrow><annotation encoding="application/x-tex">&#65;&#61;&#92;&#109;&#105;&#110;&#40;&#80;&#95;&#123;&#50;&#52;&#48;&#47;&#49;&#54;&#48;&#125;&#44;&#92;&#44;&#80;&#95;&#123;&#51;&#54;&#48;&#47;&#50;&#52;&#48;&#125;&#41;&#46;</annotation></semantics></math></div>

For the remaining human near-matches, **H3** and **H4** counted distinct genes with closest qualifying matches at ED ≤ 3 and ED ≤ 4, respectively; H4 therefore includes H3. The combined near-match burden plotted in our design figures was **B = H3 + 0.25(H4 − H3)**. These metrics describe computational sequence similarity, not experimentally demonstrated ASO off-target activity.

#### Test {#aso-cycle-01-test}

The scan produced **9,270 positional windows** representing **8,243 unique recognition sequences**. After sequence quality control, 6,619 unique sequences remained, and **229** passed the human near-match screen: 226 of length 22 nt, three of length 20 nt, and none of length 18 nt. Of the passing sequences, 145 unique cores occurred within the ORCA coding sequence.

Yet favorable sequence similarity and structural accessibility did not consistently coincide. The native sites with fewer human near-matches tended to be poorly accessible, while more accessible sites often carried a greater near-match burden (Figure 3).

![Computational comparison of native ORCA targets](/assets/images/submission-20261017/engineering/aso/Figure_03.png){.engineering-figure style="--engineering-figure-width:680px;--engineering-detail-width:960px"}

*Figure 3. Human-RNA near-match burden and predicted accessibility of eligible native ORCA ASO-binding sites.*

#### Learn {#aso-cycle-01-learn}

Direct targeting was feasible, but a fixed transcript limited our ability to improve sequence discrimination and RNA accessibility simultaneously. Since ORCA is engineered, we could expand that design space by **creating a target for the ASO**, rather than accepting only sites already present in the editor transcript.

---

### **Cycle 2**: Designing a synthetic target {#aso-cycle-02 .engineering-cycle-title}

#### Design {#aso-cycle-02-design}

We proposed a **Synthetic ASO Tag** inserted downstream of the ORCA stop codon. Its recognition **core** would determine ASO complementarity, while flanking sequences could be varied to tune the local RNA structure without changing the encoded ORCA protein (Figures 4–5).

We initially tested 18-, 20-, and 22-nt cores, each either unflanked or surrounded by independently generated **7-nt left and right flanks**. This separated two otherwise coupled design variables: the sequence recognized by the ASO and the RNA context in which that sequence is presented.

![Native targeting versus synthetic tag design](/assets/images/submission-20261017/engineering/aso/Figure_04.png){.engineering-figure style="--engineering-figure-width:700px;--engineering-detail-width:960px"}

*Figure 4. Transition from screening fixed ORCA sequences to engineering a dedicated ASO-recognition site.*

![Synthetic tag architecture](/assets/images/submission-20261017/engineering/aso/Figure_05.png){.engineering-figure style="--engineering-figure-width:700px;--engineering-detail-width:960px"}

*Figure 5. Computational tag architecture, with a programmable recognition core between two structure-tuning flanks downstream of the ORCA stop codon.*

#### Build {#aso-cycle-02-build}

We generated **300 random cores per length**, organized as three independent blocks of 100. All 900 candidates underwent the same sequence-quality and human near-match criteria used in Cycle 1, followed by checks of valid initial tag configurations in the reference transcript.

#### Test {#aso-cycle-02-test}

The length comparison strongly favored 22 nt. Among 300 generated cores at each length, **62 of the 22-nt sequences** passed the human screen, compared with **four 20-nt cores and no 18-nt cores**. Sixty-one of the 22-nt cores also yielded valid initial tag designs. The pattern was consistent across independently generated blocks (Figure 6).

![Core length screen](/assets/images/submission-20261017/engineering/aso/Figure_06.png){.engineering-figure style="--engineering-figure-width:660px;--engineering-detail-width:960px"}

*Figure 6. Candidate retention from equal-sized random searches at 18, 20, and 22 nt.*

#### Learn {#aso-cycle-02-learn}

We selected a **22-nt recognition core** for subsequent optimization. The next question was no longer whether a synthetic sequence could pass the initial filters, but which complete tag design best balanced specificity, accessibility, and its biological context.

---

### **Cycle 3**: Screening with CNS context {#aso-cycle-03 .engineering-cycle-title}

#### Design {#aso-cycle-03-design}

We generated **5,000 new 22-nt cores** in five independent blocks of 1,000, expanding the search without seeding it from the previous candidates. Screening was extended beyond human sequence similarity to consider the inserted tag within ORCA and the consequences of residual near-matches in the intended CNS environment.

#### Build {#aso-cycle-03-build}

Each candidate was evaluated across **three linked contexts** (Figure 8):

- **Human:** H3 and H4, together with exclusion of close matches to the untagged ORCA reference and the experimental NeoR sequence.
- **ORCA:** validity of the tag junction and predicted accessibility **A** in the complete reference transcript.
- **CNS:** expression-weighted near-match burdens in astrocytes and neurons, plus functional concern associated with dosage-sensitive, loss-of-function-intolerant, or neurologically relevant genes, including APOE.

The CNS expression reference covered **32 astrocyte and neuronal populations** from adult human cortical and hippocampal datasets, with additional sensitivity checks using an independent dataset. ED3 matches received full weight; ED4-only matches received a reduced weight, with alternative weights examined for robustness.

We treated the six resulting metrics—**H3, H4, astrocyte burden, neuronal burden, functional burden, and A**—as a multi-objective problem. A candidate belonged to the **Pareto frontier** if no other candidate was at least as favorable across every metric and strictly better in at least one. This avoided assigning an arbitrary single score to competing design goals.

#### Test {#aso-cycle-03-test}

The expanded search progressed from **5,000 cores** to **3,705 quality-controlled**, **930 human-screened**, and **926 with valid initial ORCA-context designs** (Figure 7). Restricting human ED3 near-matches as aggressively as possible did not necessarily produce useful RNA targets: the four cores without near-full ED3 hits had very low predicted accessibility.

Increasing the search budget primarily improved **choice among competing objectives**, not the best accessibility value. While maximum initial A appeared early and remained at approximately **0.033**, the lowest H4 improved from **120 to 42**. Relative to a fixed frontier of 125 native ORCA target positions, the number conservatively dominated by the synthetic pool rose from **62 to 100** as sampling increased from 300 to 5,000 designs.

CNS information also changed decisions. Adding expression data replaced one position in the 40-core refinement queue and reordered 17 shared candidates; functional information replaced another position and reordered nine. The six final representative candidates were unchanged, but the candidates selected for further computational refinement were not.

![Expanded core search outcomes](/assets/images/submission-20261017/engineering/aso/Figure_07.png){.engineering-figure style="--engineering-figure-width:640px;--engineering-detail-width:960px"}

*Figure 7. Larger 22-nt searches increased near-match diversity and Pareto coverage without improving the early maximum initial accessibility.*

![Six-dimensional selection framework](/assets/images/submission-20261017/engineering/aso/Figure_08.png){.engineering-figure style="--engineering-figure-width:620px;--engineering-detail-width:960px"}

*Figure 8. Human, ORCA, and CNS evidence jointly informed six-objective candidate ranking and refinement allocation.*

#### Learn {#aso-cycle-03-learn}

Synthetic targeting greatly increased the available candidate space, but a favorable core alone was not enough. Many sequences with promising human-RNA discrimination remained locally inaccessible after insertion. We therefore moved to a second, more targeted design variable: **the flanks surrounding a fixed recognition core**.

---

### **Cycle 4**: Improving target accessibility {#aso-cycle-04 .engineering-cycle-title}

#### Design {#aso-cycle-04-design}

We sought to improve the structural presentation of selected cores while keeping each complementary ASO sequence unchanged. This would let us modify the RNA target environment independently of the sequence used to recognize it.

#### Build {#aso-cycle-04-build}

Forty cores were selected from the multi-objective evaluation. For each, we generated **32 new pairs of 7-nt flanks**, yielding **1,280 refinement attempts**, and compared the best new design against that core's best initial configuration. Native targeting remained the reference strategy for the final comparison.

#### Test {#aso-cycle-04-test}

Flank refinement improved predicted accessibility for **33 of 40 cores**. Across the expanded design space, the highest predicted A increased from **0.03299 to 0.10914**. The ultimately selected candidate, **C805**, illustrates the value of independently optimizing the surrounding RNA: its predicted accessibility rose **17.4-fold**, from **3.66 × 10⁻⁴ to 0.00637**, while the 22-nt core, complementary ASO, and human near-match metrics remained unchanged (**H3 = 14; H4 = 535**; Figure 9).

![Flank refinement analysis](/assets/images/submission-20261017/engineering/aso/Figure_09.png){.engineering-figure style="--engineering-figure-width:660px;--engineering-detail-width:960px"}

*Figure 9. Fixed-core flank engineering improved predicted accessibility in 33 of 40 candidates, including C805.*

We then compared the expanded synthetic design set with **145 native 22-nt coding-sequence cores** (146 positions), using the same six-objective evaluation. After flank optimization, synthetic candidates conservatively dominated **107 of the 125 native Pareto-frontier positions**, compared with 100 before refinement (Figure 10).

![Native and synthetic design landscape](/assets/images/submission-20261017/engineering/aso/Figure_10.png){.engineering-figure style="--engineering-figure-width:640px;--engineering-detail-width:960px"}

*Figure 10. Predicted accessibility and human near-match burden across native ORCA sites and refined synthetic designs.*

#### Learn — Selecting C805 {#aso-cycle-04-learn}

The final choice was not simply the most accessible or the most sequence-distinct candidate. **C0bb** offered the lowest near-match counts (H3 = 0; H4 = 42) but negligible predicted accessibility (**3.28 × 10⁻⁸**). **C5936** reached the highest A (**0.10914**) at a much greater human near-match burden (H3 = 160; H4 = 4,140). **C724** offered another accessibility-oriented option (A = 0.02526; H3 = 32; H4 = 884).

**C805** provided a more balanced computational profile, with lower CNS-associated burdens than the more accessibility-oriented C724 and C5936 designs. We therefore selected **C805f2e92b9eece34 (C805)** for the first cellular test, while retaining C724 as an alternative (Figure 11). This completed the computational transition from **finding an existing ASO site** to **engineering an ASO-responsive RNA interface**.

![Candidate selection comparison](/assets/images/submission-20261017/engineering/aso/Figure_11.png){.engineering-figure style="--engineering-figure-width:640px;--engineering-detail-width:960px"}

*Figure 11. C805 was chosen from candidates with distinct trade-offs between human near-matches and predicted accessibility.*

---

### **Cycle 5**: Testing the mCherry tag {#aso-cycle-05 .engineering-cycle-title}

#### Design {#aso-cycle-05-design}

Computational screening could predict candidate properties, but could not establish whether the tag would mediate suppression inside cells. We first evaluated C805 with an mCherry reporter, separating ASO responsiveness from the additional complexity of measuring RNA editing.

The **36-nt tag** consisted of a **22-nt C805 core flanked by 7 nt on each side** and was placed after the mCherry stop codon. We compared **mCherry-only** and **mCherry–ASOTag** reporters under either **C805 ASO** or a **non-targeting control (NC) ASO**, creating a 2 × 2 design that could distinguish a general ASO effect from tag-dependent suppression (Figure 12).

#### Build {#aso-cycle-05-build}

To insert the short tag, we replaced a proposed homology-assembly strategy—whose primers were predicted to form a stable hairpin—with **whole-plasmid inverse PCR and blunt-end ligation** using 5′-phosphorylated primers. Bidirectional Sanger sequencing verified the tag and both reporter junctions without changing the mCherry coding sequence.

The **22-nt C805 ASO** was synthesized as a **6–10–6 2′-MOE/DNA gapmer** with a fully phosphorothioate backbone. In HEK293T cells, reporter transfection was followed by **30 nM ASO** treatment. Flow cytometry was performed before treatment and at **24, 48, 72, and 96 h** afterward, with **two independent culture wells per condition and time point**. The primary readout was median mCherry fluorescence across the gated singlet population.

![mCherry reporter experiment](/assets/images/submission-20261017/engineering/aso/Figure_12.png){.engineering-figure style="--engineering-figure-width:900px;--engineering-detail-width:1120px"}

*Figure 12. Reporter architecture, factorial controls, and flow-cytometry time course for C805 tag validation.*

#### Test {#aso-cycle-05-test}

At **48 h**, C805 treatment left **98.0%** of NC-normalized fluorescence in the untagged reporter but only **21.4%** in mCherry–ASOTag—a **78.6% relative reduction** in the tagged construct (Figure 13). Both culture wells showed the same direction of response.

For the tagged reporter, relative fluorescence was **27.9%, 21.4%, 23.5%, and 31.6%** at 24, 48, 72, and 96 h, respectively, each normalized to the corresponding reporter's NC control at that time point. Thus, suppression was evident by 24 h, strongest at 48 h, and still substantial at 96 h (Figure 14). The later increase in the **C805/NC ratio** indicates a weakening *relative suppression effect*, not demonstrated recovery of absolute mCherry expression.

![Tag-dependent fluorescence suppression](/assets/images/submission-20261017/engineering/aso/Figure_13.png){.engineering-figure style="--engineering-figure-width:900px;--engineering-detail-width:1120px"}

*Figure 13. C805 ASO markedly reduced mCherry fluorescence at 48 h only when the reporter carried the synthetic tag.*

![mCherry suppression time course](/assets/images/submission-20261017/engineering/aso/Figure_14.png){.engineering-figure style="--engineering-figure-width:900px;--engineering-detail-width:1100px"}

*Figure 14. Tagged-reporter suppression persisted through 96 h, with a modest weakening of the normalized effect after 48 h.*

#### Learn {#aso-cycle-05-learn}

C805 was no longer only a computationally prioritized sequence: it produced a clear, tag-associated response in a cellular reporter. This established a practical basis for moving the same RNA-recognition interface into ORCA. The experiment measured fluorescence, not direct RNA cleavage or editing output; it also represented one experiment with two culture wells per condition and ASOs that were not fully matched in length and chemistry. Functional verification therefore required a direct RNA-editing assay.

---

### **Cycle 6**: Suppressing ORCA editing {#aso-cycle-06 .engineering-cycle-title}

#### Design {#aso-cycle-06-design}

We transferred the **same 36-nt C805 tag** downstream of the ORCA stop codon to test whether the reporter-level effect extended to the complete editor. A 2 × 2 comparison—**ORCA or ORCA–ASOTag**, each with **NC or C805 ASO**—was combined with an APOE4 RNA-editing reporter. This time, the primary endpoint was **C388 C-to-U editing**, not fluorescence (Figure 15).

#### Build {#aso-cycle-06-build}

The tag was inserted through inverse PCR and blunt-end ligation and verified by Sanger sequencing; the **2,157-bp ORCA coding sequence** remained unchanged. HEK293T cells were co-transfected with **800 ng editor plasmid and 200 ng APOE4 reporter** per well, then treated with **30 nM ASO**. Samples were collected before treatment and at **48 and 96 h** afterward.

Each condition and time point included **three independent culture wells**. Two separate PCR/sequencing measurements per well produced **72 sequencing results**, but were averaged within each well before calculating group means and standard deviations. All culture wells came from one experiment. Editing was quantified from the C388 T-read fraction in the APOE4 reporter amplicon:

<div class="engineering-equation"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><mrow><mi mathvariant="normal">E</mi><mi mathvariant="normal">d</mi><mi mathvariant="normal">i</mi><mi mathvariant="normal">t</mi><mi mathvariant="normal">i</mi><mi mathvariant="normal">n</mi><mi mathvariant="normal">g</mi><mspace width="0.222em" /><mi mathvariant="normal">r</mi><mi mathvariant="normal">a</mi><mi mathvariant="normal">t</mi><mi mathvariant="normal">e</mi></mrow><mo stretchy="false" form="prefix">(</mo><mi>%</mi><mo stretchy="false" form="postfix">)</mo><mo>=</mo><mfrac><mrow><mi mathvariant="normal">A</mi><mi mathvariant="normal">l</mi><mi mathvariant="normal">t</mi><mi mathvariant="normal">_</mi><mi mathvariant="normal">d</mi><mi mathvariant="normal">p</mi></mrow><mrow><mi mathvariant="normal">D</mi><mi mathvariant="normal">P</mi></mrow></mfrac><mo>×</mo><mn>100</mn><mi>%</mi><mi>.</mi></mrow><annotation encoding="application/x-tex">&#92;&#109;&#97;&#116;&#104;&#114;&#109;&#123;&#69;&#100;&#105;&#116;&#105;&#110;&#103;&#92;&#32;&#114;&#97;&#116;&#101;&#125;&#40;&#92;&#37;&#41;&#61;&#92;&#102;&#114;&#97;&#99;&#123;&#92;&#109;&#97;&#116;&#104;&#114;&#109;&#123;&#65;&#108;&#116;&#92;&#95;&#100;&#112;&#125;&#125;&#123;&#92;&#109;&#97;&#116;&#104;&#114;&#109;&#123;&#68;&#80;&#125;&#125;&#92;&#116;&#105;&#109;&#101;&#115;&#49;&#48;&#48;&#92;&#37;&#46;</annotation></semantics></math></div>

![ORCA tag experiment](/assets/images/submission-20261017/engineering/aso/Figure_15.png){.engineering-figure style="--engineering-figure-width:900px;--engineering-detail-width:1120px"}

*Figure 15. ORCA–ASOTag construction and four-condition APOE4 editing assay across pre-treatment, 48-h, and 96-h samples.*

#### Test {#aso-cycle-06-test}

Before treatment, the two assigned ASO groups had similar editing within each ORCA construct, so subsequent comparisons focused on the C805-versus-NC effect within each construct.

**At 48 h**, C805 ASO had no comparable suppressive effect on untagged ORCA (**44.43%** editing with NC versus **46.24%** with C805). In **ORCA–ASOTag**, however, editing fell from **57.13%** with NC to **28.54%** with C805: a **28.59-percentage-point**, or **50.04% relative**, decrease (Figure 16). Across the 12 paired PCR technical measurements at this time point, the median absolute difference was only **0.94 percentage points**, supporting the consistency of the sequencing readout.

**At 96 h**, ORCA–ASOTag still showed **66.23%** editing with NC versus **37.71%** with C805, a **28.53-percentage-point** difference (**43.07% relative**). Untagged ORCA again showed similar editing with either ASO (**74.58%** versus **75.39%**; Figure 17). Although editing rates increased over time in several groups, the absolute ASO-associated separation in the tagged construct remained close to **28.5 percentage points** at both post-treatment measurements.

![Editing suppression and technical concordance](/assets/images/submission-20261017/engineering/aso/Figure_16.png){.engineering-figure style="--engineering-figure-width:780px;--engineering-detail-width:960px"}

*Figure 16. Sequencing technical concordance and tag-dependent suppression of C388 editing 48 h after ASO treatment.*

![Editing suppression across time](/assets/images/submission-20261017/engineering/aso/Figure_17.png){.engineering-figure style="--engineering-figure-width:820px;--engineering-detail-width:1020px"}

*Figure 17. C805-associated suppression of ORCA–ASOTag editing persisted at 96 h, unlike the response of untagged ORCA.*

#### Learn {#aso-cycle-06-learn}

The synthetic interface now supported **externally induced suppression of ORCA's measured RNA-editing function**, not only reporter fluorescence. C805 reduced editing in the tagged construct under both tested post-treatment conditions, while the untagged editor did not show the same response. The effect was substantial but **not a complete shutdown**, and no functional rebound was established during the 96-h observation window. Measuring ORCA RNA and protein levels, alongside ASO withdrawal experiments, would help establish the suppression mechanism and determine whether expression and editing can recover.

---

### **Conclusion** {#aso-conclusion-from-aso-target-selection-to-an-engineered-off-interface .engineering-section-title}

Across six engineering cycles, we converted a constrained search for natural ASO sites into a modular RNA-control strategy. Computational screening led us to a **22-nt synthetic recognition core**, multi-objective selection incorporating human and CNS contexts, and flank engineering that improved C805's predicted accessibility **17.4-fold without changing its ASO-binding sequence**.

The same C805 interface produced a **78.6% reduction in tagged mCherry fluorescence** at 48 h and, more importantly, a **50.04% relative reduction in ORCA-mediated APOE4 editing** at 48 h, with suppression still evident at 96 h. These experiments establish **Synthetic ASO Tag as an externally addressable suppression interface for ORCA**. Full shutdown, mechanism-level RNA/protein confirmation, and recovery after ASO withdrawal remain the next objectives for realizing a demonstrably reversible control layer.

### References and Figure Credits {#aso-references-and-figure-credits}

1. Xiang JS, Kaplan M, Dykstra P, et al. *Massively parallel RNA device engineering in mammalian cells with RNA-Seq.* Nature Communications. 2019;10:4327. [doi:10.1038/s41467-019-12334-y](https://doi.org/10.1038/s41467-019-12334-y). Figure 1 includes an adapted aptazyme schematic; CC BY 4.0.
2. Chiglintseva DA, Patutina OA, Zenkova MA. *Endogenous Ribonucleases: Therapeutic Targeting of the Transcriptome Through Oligonucleotide-Triggered RNA Inactivation.* Biomolecules. 2025;15(7):965. [doi:10.3390/biom15070965](https://doi.org/10.3390/biom15070965). Figure 2 is reproduced from the original publication; CC BY 4.0.

<!-- Editorial QA (not rendered): Scientific content is adapted exclusively from the three supplied Chinese ASO drafts, covering Cycles 1–6. Detailed bibliography entries corresponding to numerical source markers [1]–[14] and internal dataset references [D1]–[D5] were not contained in the uploaded manuscripts and should be supplied/verified before publication. Figure 5 includes a 4×6T element as part of the historical computational reference schematic; do not present it as a component of the final experimental ORCA cassette. Figure 2 is reproduced from a CC BY 4.0 article; preserve full attribution and license. -->

## Cre–loxP {#cre-loxp .engineering-chapter-title .control-module-title}

<div class="control-milestones" data-control-module="cre-loxp" role="group" aria-label="Cre–loxP: milestones achieved"><span class="control-milestone control-milestone--designed"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m15 5 4 4M4 20l4-1L20 7a2.8 2.8 0 0 0-4-4L4 15v5Z"/></svg>Designed</span></div>

A proposed genetic off-switch
{.engineering-chapter-subtitle}

<p class="control-evidence-note">DNA-level shutdown strategy designed; excision and permanent shutdown remain experimentally unverified.</p>

### Overview {#cre-loxp-overview}

<img class="engineering-overview-illustration" src="/assets/images/engineering-overviews/cre-loxp.png" alt="Cre-mediated excision of a loxP-flanked ORCA cassette." width="1800" height="1080" decoding="async">

We proposed a Cre–loxP off-switch to stop further ORCA production by excising its coding sequence from the expression template. This DNA-level control complements ASO-mediated RNA suppression and remains experimentally unvalidated in ORCA.

### **Engineering Rationale** {#cre-loxp-engineering-rationale .engineering-section-title}

#### Why an RNA Editor Needs a DNA-Level Off-Switch {#cre-loxp-why-an-rna-editor-needs-a-dna-level-off-switch}

ORCA edits RNA without permanently altering the APOE genome, but transient RNA edits do not imply transient editor activity. Recombinant AAV genomes can persist predominantly as episomal DNA and sustain transgene expression, particularly in non-dividing cells [1]. An AAV-delivered ORCA cassette could therefore continue producing editor long after its initial administration.

Our ASO module addresses expression at the transcript level. For a more durable intervention, we also considered **removing the ORCA coding sequence itself**, so that successfully recombined templates could no longer generate new editor molecules.

#### Selecting the Recombination Architecture {#cre-loxp-selecting-the-recombination-architecture}

We considered three DNA-level shutdown strategies, prioritizing direct removal of ORCA, cassette simplicity, and compatibility with established CNS AAV methods (Figure 1).

**CRISPR–Cas9 — Cut and repair.** Two programmed cuts could remove the ORCA coding region, but the resulting DNA junction would depend on double-strand-break repair. Reports of complex repair outcomes in genomic CRISPR applications further motivated us to avoid a repair-dependent deletion strategy [2].

**Bxb1 integrase — Flip and lock.** Bxb1 recombines *attB* and *attP* sites to generate *attL* and *attR*, with reverse recombination strongly restricted without a recombination directionality factor [3,4]. We considered an inversion-based switch that would turn ORCA away from its promoter. Such a directional change could create a stable OFF state, but the coding sequence would remain in the cassette. Shutdown would therefore depend on the expression behavior of the inverted architecture rather than physical removal of ORCA. Our comparison concerned this inversion design—not every possible Bxb1 configuration.

**Cre–loxP — Excise and remove.** Cre recognizes 34-bp loxP sites; when the sites share the same orientation, recombination excises the intervening DNA and leaves one loxP site on the remaining template [5]. For ORCA, we preferred this direct loss of the coding region over a change in its orientation. The reaction does not require programmable DNA double-strand breaks, end-joining repair, or an additional mechanism to maintain an inverted OFF state. Two standard loxP sites add only **68 bp** of recognition sequence, making the design economical in an AAV-sized expression cassette.

![Figure 1. Comparison of CRISPR-mediated deletion, Bxb1-mediated inversion, and Cre–loxP-mediated excision as genetic shutdown architectures.](/assets/images/submission-20261017/engineering/cre-loxp/Figure_01.png){.engineering-figure style="--engineering-figure-width:840px;--engineering-detail-width:1040px"}

*Figure 1. Comparison of three DNA-level shutdown architectures considered for ORCA.*

#### Why Cre–loxP Fits an AAV-Based CNS Strategy {#cre-loxp-why-cre-loxp-fits-an-aav-based-cns-strategy}

The established use of AAV-delivered Cre was equally important to our choice. Kaspar and colleagues demonstrated AAV-mediated conditional recombination in the adult mouse brain [6]. Saunders and colleagues later developed Cre-On and Cre-Off AAV systems, showing how recombination can switch transgene expression on or off [5]. Wu and colleagues also used a GFAP-directed, AAV-based Cre strategy in an astrocyte-focused CNS study [7]. These studies supplied relevant delivery and recombination precedents, though they did not test our ORCA cassette.

We therefore favored integration of an established recombinase over development of a new shutdown enzyme. **Initial AAV9–ORCA delivery would establish editing; a separate, later AAV–Cre intervention would initiate shutdown.** This separation is central to the design: Cre need not be continuously co-expressed with ORCA, and the putative OFF intervention can be introduced only when needed.

### Proposed Design {#cre-loxp-proposed-design}

#### 1. Establish ORCA Expression {#cre-loxp-1-establish-orca-expression}

The initial AAV9–ORCA cassette places **two directly oriented loxP sites around the ORCA coding sequence**, leaving the promoter and polyadenylation signal outside the excision region. This positioning is deliberate: Cre should remove the editor's coding region rather than the entire regulatory cassette. In the absence of Cre, the cassette is intended to express ORCA normally, with the loxP sites remaining available for later recombination.

#### 2. Deliver Cre Separately {#cre-loxp-2-deliver-cre-separately}

When termination is desired, a second AAV vector would deliver the Cre coding sequence. Following transcription and translation, Cre protein would enter the nucleus and recognize the two loxP sites already present on the ORCA template. Recombination would generate a **remaining DNA template without the ORCA coding sequence** and an **excised DNA circle** containing that sequence, each carrying one loxP site (Figure 2). The promoter and polyadenylation signal would remain on the template from which ORCA was removed.

#### 3. Allow Existing Editor Molecules to Turn Over {#cre-loxp-3-allow-existing-editor-molecules-to-turn-over}

Excision would stop new ORCA production **from successfully recombined templates**, not instantly remove ORCA mRNA or protein already present. Editing activity would be expected to decline as these molecules turn over. This creates a two-stage shutdown mechanism: DNA-level termination of new production, followed by depletion of the existing editor pool. Its effectiveness would depend on Cre reaching ORCA-expressing cells and recombining their relevant vector copies.

![Figure 2. Proposed sequential AAV delivery and Cre–loxP-mediated removal of the ORCA coding sequence.](/assets/images/submission-20261017/engineering/cre-loxp/Figure_02.png){.engineering-figure style="--engineering-figure-width:900px;--engineering-detail-width:1120px"}

*Figure 2. Proposed two-stage AAV delivery and Cre-mediated excision of the ORCA coding sequence; the mechanism remains unvalidated in ORCA.*

### Design Scope and Future Validation {#cre-loxp-design-scope-and-future-validation}

Our contribution at this stage was **selection and system-level design**, not experimental engineering of Cre or loxP. We prioritized experimental work on ORCA optimization, regulation, delivery, and functional assessment, leaving this genetic off-switch for subsequent validation.

The first validation question is whether adding loxP sites alters ORCA expression or C388 editing before shutdown is triggered. Next, recombination-junction PCR and sequence analysis could verify the expected excision product after Cre delivery. Time-course measurements of ORCA mRNA, protein, and RNA editing would then determine both the magnitude and timing of functional shutdown, separating the DNA recombination event from the subsequent loss of pre-existing editor molecules.

Delivery introduces a further requirement: the second AAV must reach cells already carrying the ORCA cassette. Experiments would therefore need to assess AAV–Cre coverage, recombination across multiple vector copies, and barriers to repeat AAV administration, including immune responses [8]. These measurements are necessary before the proposed architecture can be described as an effective in-cell off-switch.

### **Conclusion** {#cre-loxp-conclusion .engineering-section-title}

We selected **Cre–loxP** over CRISPR-mediated deletion and Bxb1-mediated inversion because it combines **direct coding-sequence excision**, a compact cassette design, and substantial precedent for AAV–Cre use in the CNS. Coupled with sequential AAV delivery, it offers a proposed route to durable DNA-template-level shutdown, complementing the RNA-level suppression explored with ASOs. Whether it can reliably terminate ORCA activity remains a question for experimental validation.

### References {#cre-loxp-references}

1. Schultz BR, Chamberlain JS. Recombinant adeno-associated virus transduction and integration. *Molecular Therapy*. 2008;16(7):1189–1199. https://doi.org/10.1038/mt.2008.103
2. Kosicki M, Tomberg K, Bradley A. Repair of double-strand breaks induced by CRISPR–Cas9 leads to large deletions and complex rearrangements. *Nature Biotechnology*. 2018;36:765–771. https://doi.org/10.1038/nbt.4192
3. Ghosh P, Kim AI, Hatfull GF. The orientation of mycobacteriophage Bxb1 integration is solely dependent on the central dinucleotide of attP and attB. *Molecular Cell*. 2003;12(5):1101–1111. https://doi.org/10.1016/S1097-2765(03)00444-1
4. Rutherford K, Van Duyne GD. The ins and outs of serine integrase site-specific recombination. *Current Opinion in Structural Biology*. 2014;24:125–131. https://doi.org/10.1016/j.sbi.2014.01.003
5. Saunders A, Johnson CA, Sabatini BL. Novel recombinant adeno-associated viruses for Cre activated and inactivated transgene expression in neurons. *Frontiers in Neural Circuits*. 2012;6:47. https://doi.org/10.3389/fncir.2012.00047
6. Kaspar BK, et al. Adeno-associated virus effectively mediates conditional gene modification in the brain. *Proceedings of the National Academy of Sciences*. 2002;99(4):2320–2325. https://doi.org/10.1073/pnas.042678699
7. Wu Z, et al. Gene therapy conversion of striatal astrocytes into GABAergic neurons in mouse models of Huntington's disease. *Nature Communications*. 2020;11:1105. https://doi.org/10.1038/s41467-020-14855-3
8. Prasad S, et al. Immune responses and immunosuppressive strategies for adeno-associated virus-based gene therapy for treatment of central nervous system disorders: Current knowledge and approaches. *Human Gene Therapy*. 2022;33(23–24):1228–1245. https://doi.org/10.1089/hum.2022.138

## AAV9 {#deliver .engineering-chapter-title}

Delivery toward CNS applications
{.engineering-chapter-subtitle}

### Overview {#deliver-overview}

<img class="engineering-overview-illustration" src="/assets/images/engineering-overviews/deliver.png" alt="AAV9 delivery of an ITR-flanked ORCA cassette." width="1800" height="1080" decoding="async">

We explored AAV9 as a candidate delivery platform for sustained ORCA expression in a CNS-oriented application. Our proof-of-concept workflow examined vector production, ORCA cassette packaging, and transcript detection in recipient astrocytic cells.

### **Engineering Rationale** {#deliver-engineering-rationale .engineering-section-title}

#### Choosing a delivery platform {#deliver-choosing-a-delivery-platform}

Unlike permanent DNA modification, RNA editing must act on a continuously renewed pool of transcripts. A transient burst of ORCA expression may edit existing APOE4 RNA but cannot ensure that later transcripts will be edited. This temporal requirement matters for a chronic disease such as Alzheimer's disease, where sustained molecular intervention may be desirable.

We considered three delivery approaches (Figure 1). Lipid nanoparticles (LNPs) offer a flexible, nonviral way to deliver editor-encoding mRNA, but their typically transient expression and the challenges of CNS targeting would require further optimization for our application.[2,3] Extracellular vesicles (EVs) have demonstrated potential for brain-directed nucleic acid delivery, yet cargo loading, product heterogeneity, and reproducible manufacturing remain substantial engineering tasks.[4,5] AAV, by contrast, offers extensive CNS-delivery precedent, the potential for prolonged expression in relatively nondividing cells, and established vector-production workflows.[6,7]

AAV also entails trade-offs, notably packaging limits, immune responses, and difficulties with repeat administration. We selected it because its strengths align with ORCA's current engineering needs—not because it is universally superior to nonviral carriers.

![Comparison of LNP, EV and AAV delivery strategies](/assets/images/submission-20261017/engineering/deliver/Figure_01.png){.engineering-figure style="--engineering-figure-width:760px;--engineering-detail-width:960px"}

*Figure 1. Delivery-platform trade-offs evaluated against ORCA's requirements for CNS access, expression duration, and experimental feasibility.*

#### AAV and ORCA: a two-way engineering fit {#deliver-aav-and-orca-a-two-way-engineering-fit}

The rationale for combining AAV with ORCA is reciprocal: **AAV offers ORCA time, while ORCA gives AAV space** (Figure 2).

**Time — sustained editor availability.** Editing APOE4 mRNA does not change the underlying APOE4 gene. As new transcripts are synthesized, continued production of the editor could maintain opportunities for C-to-U conversion. AAV-mediated expression offers a potential solution to this recurring need. The same persistence also increases the importance of regulating where and for how long the editor acts, connecting delivery to our separate CONTROL engineering routes.

**Space — a compact, regulatable payload.** A conventional AAV genome accommodates approximately 4.7 kb, including the sequences required for vector function.[10] Some RNA-editing platforms built around large RNA-binding proteins face considerable constraints within that limit: the original Cas13-based REPAIR editor, for example, has a 4,473-bp editor coding sequence before promoter and additional elements are considered.[8] ORCA instead combines programmable PUF recognition and APOBEC catalysis in a guide-RNA-free editor of **2,157 bp**, including its linker, FLAG tag, and stop codon.[9]

We also assessed whether this compact architecture could accommodate candidate regulatory modules. A theoretical budget containing ORCA (2,157 bp), the gfaABC1D promoter (683 bp), a 4×6T MRE cassette (548 bp), an ASO tag (36 bp), and two loxP sites (68 bp) totals **3,492 bp**; adding two estimated AAV ITRs yields approximately **3,782 bp**. This was a design-space calculation, not a completed expression cassette: it omits other required sequences, and the MRE module was ultimately not retained. Separately, the ITR-flanked region reported for our constructed AAV–ORCA design was **3,748 bp**. These are different sequence configurations and should not be treated as the same length measurement.

Together, the two dimensions support a delivery strategy in which the editor can remain available while its relatively small footprint leaves room to consider expression control. Published work using AAV-PHP.eB to deliver a different PUF–APOBEC editor in mice provides an additional precedent for the broader architecture, but does not establish AAV9–ORCA delivery.[11]

![Time and size compatibility between AAV and ORCA](/assets/images/submission-20261017/engineering/deliver/Figure_02.png){.engineering-figure style="--engineering-figure-width:800px;--engineering-detail-width:960px"}

*Figure 2. Reciprocal compatibility between sustained AAV expression and the compact ORCA architecture, illustrated with a theoretical module-size budget.*

#### Why AAV9? {#deliver-why-aav9}

Because astrocytes are a major source of ApoE in the CNS, we sought an AAV capsid with evidence of CNS access and astrocyte transduction.[1] AAV9 has a substantial preclinical foundation: intravenous delivery produced prominent astrocyte transduction in adult mice in the study by Foust *et al.*[12] Subsequent work also identified neuronal and glial transduction, with important differences across species and experimental conditions.[13]

These studies made AAV9 a practical serotype for our initial experiments, while leaving cell specificity to be addressed separately through regulatory design. Animal transduction patterns are not proof of selective human astrocyte delivery.

![Published AAV9 CNS-transduction rationale](/assets/images/submission-20261017/engineering/deliver/Figure_03.png){.engineering-figure style="--engineering-figure-width:800px;--engineering-detail-width:960px"}

*Figure 3. Preclinical evidence motivating AAV9 as a candidate carrier for CNS- and astrocyte-oriented ORCA delivery.*

### **Cycle 1**: Reporter-based AAV9 production {#deliver-cycle-01 .engineering-cycle-title}

#### Design {#deliver-cycle-01-design}

Before introducing an RNA editor, we needed a production workflow that could be evaluated without measuring RNA editing itself. We therefore chose a commercial AAV transfer vector encoding **mCherry–T2A–Luc** and paired it with the packaging plasmid **pAAV2/9n** and helper plasmid **pAdDeltaF6**. Our first goal was to establish producer-cell expression, vector purification, genome quantification, and a basic recipient-cell assay.

#### Build {#deliver-cycle-01-build}

We co-transfected the three plasmids into HEK293T cells using Lipofectamine 3000 in two 10-cm dishes, with **15 μg total DNA per dish**. Producer cells displayed visible mCherry fluorescence around 48 hours after transfection (Figure 4). We harvested the preparation at approximately 96 hours, when some cells had begun to detach, and purified it using the Takara AAVpro Purification Kit Midi (6675).

![Initial AAV9 reporter packaging and producer-cell mCherry expression](/assets/images/submission-20261017/engineering/deliver/Figure_04.png){.engineering-figure style="--engineering-figure-width:800px;--engineering-detail-width:960px"}

*Figure 4. Initial three-plasmid AAV9 production workflow and mCherry expression in transfected producer cells.*

#### Test {#deliver-cycle-01-test}

The first genome-titration assay produced a qPCR standard curve with **R² = 0.9984** and **89.8% amplification efficiency**. Samples diluted 5-fold and 50-fold yielded extrapolated estimates of approximately **2.74 × 10⁸** and **5.79 × 10⁸ vg/mL**, respectively. However, both fell below the lowest calibrated standard; these numbers indicate a low-level signal, not reliable absolute titers (Figure 5).

For a preliminary delivery test, we added **10 μL** of the preparation to one 96-well culture containing approximately **10,000 HEK293T cells**. No detectable mCherry fluorescence appeared during observations from 24 to 120 hours after treatment. The fluorescent producer-cell images therefore could not be taken as evidence of successful recipient-cell transduction.

![Initial AAV qPCR calibration and single-well transduction assessment](/assets/images/submission-20261017/engineering/deliver/Figure_05.png){.engineering-figure style="--engineering-figure-width:860px;--engineering-detail-width:1000px"}

*Figure 5. qPCR signals below the calibrated range and an initial recipient-cell test without detectable mCherry expression.*

#### Learn {#deliver-cycle-01-learn}

This cycle established the basic packaging and purification workflow but exposed a gap between plasmid expression in producer cells and demonstrable delivery by the recovered preparation. The late harvest, producer-cell detachment, and limited production scale motivated changes to the next packaging attempt. More importantly, we were ready to replace the reporter cassette with **ORCA itself** and assess the actual vector intended for the system.

### **Cycle 2**: Packaging AAV9–ORCA {#deliver-cycle-02 .engineering-cycle-title}

#### Design {#deliver-cycle-02-design}

We advanced from the commercial reporter to two independently constructed ORCA transfer vectors: **GFA–ORCA**, driven by the astrocyte-oriented gfaABC1D promoter, and **CMV–ORCA**, driven by a conventional reference promoter. To improve the packaging workflow, we expanded production to 15-cm dishes and tested both **PEI** and **Lipofectamine 3000** transfection conditions.

#### Build {#deliver-cycle-02-build}

We linearized an MCS-AAV transfer backbone by restriction digestion and inserted PCR-amplified GFA–ORCA or CMV–ORCA expression regions by homologous recombination. Four 15-cm HEK293T dishes were used: one PEI and one Lipofectamine 3000 condition for each construct, with **40 μg total packaging-plasmid DNA per dish**.

After harvest, the products from the two transfection conditions were **pooled separately for each ORCA construct** before purification and concentration. This yielded one GFA–ORCA preparation and one CMV–ORCA preparation. Pooling supported material recovery but meant that the effect of the two transfection reagents could not be assessed independently.

#### Test {#deliver-cycle-02-test}

We quantified AAV ITR-associated genome sequences using qPCR across **5×, 10×, and 20×** sample dilutions, each measured in duplicate. Both preparations produced Cq values within the standard-curve range (**R² = 0.9981**). The descriptive mean estimates were **4.69 × 10¹² vg/mL** for GFA–ORCA and **3.40 × 10¹¹ vg/mL** for CMV–ORCA.

Unlike the first cycle's below-range estimates, these measurements supported preliminary quantification of the ORCA-containing preparations. Nevertheless, the back-calculated titer rose with sample dilution, the standard-curve amplification efficiency was **84.45%**, and late amplification appeared in the negative control. We therefore treated the titers as **provisional genome-concentration estimates**, not validated measures of intact or infectious AAV particles; calculation also assumed a pre-extraction dilution factor of 1 because any additional dilution was undocumented. The difference between the two preparations also cannot be attributed to promoter identity alone.

![AAV9–ORCA construction, packaging and provisional vector-genome quantification](/assets/images/submission-20261017/engineering/deliver/Figure_06.png){.engineering-figure style="--engineering-figure-width:880px;--engineering-detail-width:1040px"}

*Figure 6. Construction and pooled AAV9 production of GFA–ORCA and CMV–ORCA, with provisional genome-titer estimates and qPCR quality assessment.*

#### Learn {#deliver-cycle-02-learn}

The second cycle moved our system from a reporter-based production exercise to **self-constructed AAV9–ORCA preparations with measurable vector-genome signals**. It also made the next validation boundary clear: recovering AAV-associated DNA from a preparation does not demonstrate that the editor is expressed after recipient-cell treatment. We therefore turned from vector characterization to transcript detection in an astrocytic model.

### **Cycle 3**: Testing astrocytic transcript expression {#deliver-cycle-03 .engineering-cycle-title}

#### Design {#deliver-cycle-03-design}

To ask whether an ORCA-containing AAV9 preparation could produce a detectable transcript in recipient cells, we treated the human astrocytic cell line **CCF-STTG1** with the GFA–ORCA preparation from Cycle 2. We selected reverse transcription followed by ORCA-directed endpoint PCR as an initial molecular readout.

#### Build {#deliver-cycle-03-build}

Following AAV9 treatment, we collected cellular RNA, synthesized cDNA, amplified with ORCA-directed primers, and examined the products by agarose gel electrophoresis. A separate PCR reaction using an **ORCA plasmid DNA template** provided a reference for amplification from DNA; importantly, it did not test the RNA-isolation or reverse-transcription steps (Figure 7).

#### Test {#deliver-cycle-03-test}

No clear band corresponding to the expected ORCA amplicon was visible in the AAV-treated CCF-STTG1 cDNA lanes. Bands were visible in the plasmid-template lane, but their product identities were not independently confirmed. Thus, **ORCA transcript expression was not demonstrated** under the tested conditions. These data do not distinguish insufficient cell entry from low transcription or limitations of the RNA-to-PCR assay.

![ORCA transcript detection workflow and endpoint gel](/assets/images/submission-20261017/engineering/deliver/Figure_07.png){.engineering-figure style="--engineering-figure-width:700px;--engineering-detail-width:960px"}

*Figure 7. RT-PCR-based assessment of ORCA expression in AAV9-treated CCF-STTG1 cells, with no clearly detectable target product in the treated-cell cDNA lanes.*

#### Learn {#deliver-cycle-03-learn}

This experiment extended delivery assessment from vector preparations to recipient cells, but did not close the gap between the two. Further development requires separate evidence for **cell-associated vector DNA**, **ORCA RNA and protein expression**, and ultimately **C-to-U editing activity**. Establishing these successive readouts will be more informative than using vector-genome titer as a surrogate for functional delivery.

### **Conclusion** {#deliver-conclusion .engineering-section-title}

AAV9 was selected through a specific engineering match: its potential for sustained expression addresses the renewal of APOE4 transcripts, while ORCA's compact architecture fits within the spatial constraints of viral delivery. Our three cycles progressed from reporter-based packaging to construction and preliminary genome quantification of **GFA–ORCA** and **CMV–ORCA**, followed by a first expression assay in human astrocytic cells.

We established a practical foundation for AAV9–ORCA vector production and identified the next experimental requirement: **demonstrating expression and editing in recipient cells**. The current work supports the feasibility of preparing ORCA-associated AAV9 material; it does not yet establish functional ORCA delivery or therapeutic editing.

### References {#deliver-references}

[1] Mahley RW. Central nervous system lipoproteins: ApoE and regulation of cholesterol metabolism. *Arterioscler Thromb Vasc Biol.* 2016. https://doi.org/10.1161/ATVBAHA.116.307023

[2] Pardi N, et al. Expression kinetics of nucleoside-modified mRNA delivered in lipid nanoparticles to mice by various routes. *J Control Release.* 2015. https://doi.org/10.1016/j.jconrel.2015.08.007

[3] Cao D, et al. Lipid nanoparticles for mRNA delivery in brain via systemic administration. *Sci Adv.* 2025. https://doi.org/10.1126/sciadv.adw0730

[4] Alvarez-Erviti L, et al. Delivery of siRNA to the mouse brain by systemic injection of targeted exosomes. *Nat Biotechnol.* 2011. https://doi.org/10.1038/nbt.1807

[5] Welsh JA, et al. Minimal information for studies of extracellular vesicles (MISEV2023). *J Extracell Vesicles.* 2024. https://doi.org/10.1002/jev2.12404

[6] Davidsson M, et al. A comparison of AAV-vector production methods for gene therapy and preclinical assessment. *Sci Rep.* 2020. https://doi.org/10.1038/s41598-020-78521-w

[7] Chu Y, et al. Long-term post-mortem studies following neurturin gene therapy in patients with advanced Parkinson's disease. *Brain.* 2020. https://doi.org/10.1093/brain/awaa020

[8] Cox DBT, et al. RNA editing with CRISPR-Cas13. *Science.* 2017. https://doi.org/10.1126/science.aaq0180

[9] Han W, et al. Programmable RNA base editing with a single gRNA-free enzyme. *Nucleic Acids Res.* 2022. https://doi.org/10.1093/nar/gkac713

[10] Maurer AC, Weitzman MD. Adeno-associated virus genome interactions important for vector production and transduction. *Hum Gene Ther.* 2020. https://doi.org/10.1089/hum.2020.069

[11] Han W, et al. Effective in vivo RNA base editing via engineered cytidine deaminase APOBECs fused with PUF proteins. *Nat Commun.* 2025. https://doi.org/10.1038/s41467-025-64748-6

[12] Foust KD, et al. Intravascular AAV9 preferentially targets neonatal neurons and adult astrocytes. *Nat Biotechnol.* 2009. https://doi.org/10.1038/nbt.1515

[13] Gray SJ, et al. Preclinical differences of intravascular AAV9 delivery to neurons and glia. *Mol Ther.* 2011. https://doi.org/10.1038/mt.2011.72

## SONAR {#measure .engineering-chapter-title}

Engineering an editing-responsive reporter
{.engineering-chapter-subtitle}

### Overview {#measure-overview}

<img class="engineering-overview-illustration" src="/assets/images/engineering-overviews/measure.png" alt="SONAR reporter and SAP fluorescence analysis." width="1800" height="1080" decoding="async">

SONAR (System for Optical Normalization and Analysis of RNA Editing) couples an editing-responsive fluorescence reporter with a framework for interpreting its output. We engineered the reporter and evaluated optical readouts while distinguishing fluorescence signals from RNA-editing percentages.

### **Engineering Rationale** {#measure-engineering-rationale .engineering-section-title}

#### Why build a fluorescence reporter? {#measure-why-build-a-fluorescence-reporter}

Our initial ORCA assays relied on RT-PCR and Sanger sequencing. Sequencing directly probes nucleotide changes, but its multistep workflow becomes demanding when testing numerous editor variants. It also requires cell collection and primarily reports an aggregate signal, providing little information about how reporter expression and editor delivery vary among individual cells.

We therefore sought a complementary, optical readout: one compatible with rapid flow-cytometric comparisons, visualization of intact cells, and potentially simpler plate-based measurements. Crucially, we wanted to distinguish changes in reporter abundance from changes in editing-associated output. Sequencing would remain essential for verifying actual RNA editing.

#### Turning C-to-U editing into a positive signal {#measure-turning-c-to-u-editing-into-a-positive-signal}

EGFP offered a familiar optical output across these platforms (Figure 1). An editing-created stop codon could, in principle, diminish EGFP fluorescence; however, a decrease from an already bright background would be difficult to distinguish from variation in expression. We instead designed a switch in which the intended **C-to-U conversion increases EGFP accumulation**.

![Figure 1 — EGFP optical output](/assets/images/submission-20261017/engineering/measure/figure-01.png){.engineering-figure style="--engineering-figure-width:760px;--engineering-detail-width:960px"}

We positioned the programmable PUF recognition sequence and an editable **CGA** codon between EGFP and an *E. coli* dihydrofolate reductase-derived destabilizing domain (**ecDHFR-DD**). Without editing, translation continues through the CGA codon into DD, yielding a less stable EGFP–DD product. Editing changes **CGA to UGA**, terminating translation before DD so that EGFP can accumulate without the destabilizing tag (Figures 2 and 6). Because trimethoprim (TMP) stabilizes ecDHFR-DD, it also provides an independent way to probe the proposed mechanism [1].

![Figure 2 — Editing switch and destabilizing domain](/assets/images/submission-20261017/engineering/measure/figure-02.png){.engineering-figure style="--engineering-figure-width:760px;--engineering-detail-width:960px"}

#### Separating reporter expression from its green output {#measure-separating-reporter-expression-from-its-green-output}

We added **mCherry–P2A** upstream of EGFP to provide an internal expression reference. P2A supports production of separate upstream and downstream protein products from the same transcript [3]. Red fluorescence can therefore identify reporter-expressing cells and contextualize their green output, although it cannot eliminate every effect of protein stability or cellular variation (Figure 3).

![Figure 3 — mCherry expression reference](/assets/images/submission-20261017/engineering/measure/figure-03.png){.engineering-figure style="--engineering-figure-width:760px;--engineering-detail-width:960px"}

The PUF-binding sequence, spacer, and editable codon were grouped into a **replaceable target window**, flanked by BsaI sites for Golden Gate assembly [4]. This lets us exchange a recognition/editing window without rebuilding the fluorescence machinery (Figure 4). Because the surrounding RNA sequence can still affect target accessibility, that modularity would require experimental evaluation for each design.

![Figure 4 — Replaceable target window](/assets/images/submission-20261017/engineering/measure/figure-04.png){.engineering-figure style="--engineering-figure-width:760px;--engineering-detail-width:960px"}

Together, these elements define the initial architecture:

**mCherry–P2A–EGFP–[PUF recognition site–spacer–CGA]–ecDHFR-DD** (Figures 5–6).

![Figure 5 — Reporter architecture](/assets/images/submission-20261017/engineering/measure/figure-05.png){.engineering-figure style="--engineering-figure-width:760px;--engineering-detail-width:960px"}

![Figure 6 — Editing-responsive mechanism](/assets/images/submission-20261017/engineering/measure/figure-06.png){.engineering-figure style="--engineering-figure-width:760px;--engineering-detail-width:960px"}

*Figure 6. The reporter couples the intended RNA edit to a change in EGFP protein stability rather than direct alteration of EGFP itself.*

### Design–Build–Test–Learn {#measure-design-build-test-learn}

#### **Cycle 1**: Building the fluorescence switch {#measure-cycle-01 .engineering-cycle-title}

##### Design {#measure-cycle-01-design}

We first isolated reporter behavior from editor activity. Three matched constructs represented defined translation states: **WT**, retaining the editable CGA codon; **AC**, containing a preinstalled DNA-level TGA stop codon that prevents downstream DD translation; and **INAC**, using a replacement window that permits translation into DD. These references tested whether the switch produced separable fluorescence states without assuming an RNA-editing event had occurred.

##### Build {#measure-cycle-01-build}

We assembled the common reporter backbone and introduced each target window by BsaI–Golden Gate cloning, confirming the resulting sequences. WT, AC, and INAC were transfected separately into cells, with an untransfected Mock control; 48 h later we acquired mCherry and EGFP on the Sony MA900 (Figure 7).

##### Test {#measure-cycle-01-test}

After cell and singlet gating, Mock defined the fluorescence background, while mCherry identified reporter-expressing cells. An initial EGFP threshold derived from INAC proved uninformative because its bright tail obscured differences between populations. We therefore examined continuous EGFP intensities within matched mCherry-expression ranges. Across four such ranges, AC was approximately **2.72-fold brighter than WT** and **3.08-fold brighter than INAC**. Nevertheless, both DD-containing reporters retained appreciable basal EGFP.

##### Learn {#measure-cycle-01-learn}

A preinstalled stop codon increased green output as designed, but the high baseline meant that binary EGFP-positive fractions alone would not provide a useful activity measure. Our next task was to verify the role of DD in the observed difference.

![Figure 7 — Initial reporter characterization](/assets/images/submission-20261017/engineering/measure/figure-07.png){.engineering-figure style="--engineering-figure-width:640px;--engineering-detail-width:960px"}

*Figure 7. Sequence-defined reporter states show a distinguishable green-output switch but substantial background in DD-containing constructs.*

#### **Cycle 2**: Testing DD-dependent stability {#measure-cycle-02 .engineering-cycle-title}

##### Design {#measure-cycle-02-design}

If DD was responsible for suppressing fluorescence, stabilizing it with TMP should preferentially increase the signal from WT and INAC, not AC, whose EGFP lacks DD.

##### Build {#measure-cycle-02-build}

Each reporter was tested with **10 µM TMP** or a matched DMSO control, followed by flow cytometry 48 h after transfection (Figure 8).

##### Test {#measure-cycle-02-test}

Within matched mCherry-expression ranges, TMP increased EGFP output by approximately **5.17-fold for WT** and **4.47-fold for INAC**, while AC remained near **1.00-fold**. The selective response supported DD-dependent regulation of the reporter's green signal.

##### Learn {#measure-cycle-02-learn}

We had evidence for the designed protein-stability switch, but the decisive test was whether an *active RNA editor*—rather than an engineered DNA stop codon—could trigger it.

![Figure 8 — TMP experiment](/assets/images/submission-20261017/engineering/measure/figure-08.png){.engineering-figure style="--engineering-figure-width:660px;--engineering-detail-width:960px"}

*Figure 8. TMP selectively increases fluorescence from DD-linked reporters while leaving the DD-free AC reference largely unchanged.*

#### **Cycle 3**: Introducing active ORCA {#measure-cycle-03 .engineering-cycle-title}

##### Design {#measure-cycle-03-design}

We co-transfected WT reporter with active **PUF12–ORCA**, using catalytically inactive **E72A** and empty vector as controls. Two editor:reporter DNA ratios, **4:1 and 1:1**, tested whether the reporter could resolve editor-associated fluorescence under different expression loads.

##### Build {#measure-cycle-03-build}

The six-well experiments maintained **2 µg total DNA per well** and were analyzed by flow cytometry 48 h after transfection (Figure 9).

##### Test {#measure-cycle-03-test}

Contrary to the expected increase, PUF12 did **not** produce stronger green output than E72A. The expression-matched PUF12/E72A EGFP ratios were approximately **0.75** and **0.87** at the two DNA ratios. This was a failure to resolve the intended optical response, **not** a sequencing-based determination that PUF12 had failed to edit reporter RNA.

##### Learn {#measure-cycle-03-learn}

We prioritized three possible constraints: high basal EGFP at the reporter doses used, altered accessibility of the APOE-derived target after transplantation into the reporter, and unmeasured editor–reporter co-expression. We first addressed reporter dose, the most immediately adjustable factor.

![Figure 9 — Active editor test](/assets/images/submission-20261017/engineering/measure/figure-09.png){.engineering-figure style="--engineering-figure-width:640px;--engineering-detail-width:960px"}

*Figure 9. Active PUF12–ORCA did not increase WT reporter fluorescence relative to E72A under the initial co-transfection conditions.*

#### **Cycle 4**: Reducing basal fluorescence {#measure-cycle-04 .engineering-cycle-title}

##### Design {#measure-cycle-04-design}

Lower reporter input might reduce EGFP–DD background, but could also decrease the number of reporter-positive cells. We sought a practical balance between these outcomes.

##### Build {#measure-cycle-04-build}

WT reporter was tested at **50, 200, 400, 600, 1,000, and 2,000 ng per six-well**, using empty vector to hold total DNA at 2 µg (Figure 10).

##### Test {#measure-cycle-04-test}

Both the mCherry-positive fraction and basal EGFP increased with reporter dose. Reducing the input from **400 to 200 ng** lowered median EGFP by **50.4%**, while decreasing mCherry-positive coverage by only **5.5 percentage points**. A further reduction to 50 ng suppressed green background more strongly but lost substantially more reporter-positive cells.

##### Learn {#measure-cycle-04-learn}

We selected **200 ng reporter per six-well** as the next working starting point, later examining **100 ng per twelve-well**. Lowering background improved the assay conditions, but did not itself establish greater sensitivity to RNA editing.

![Figure 10 — Reporter dosage](/assets/images/submission-20261017/engineering/measure/figure-10.png){.engineering-figure style="--engineering-figure-width:620px;--engineering-detail-width:960px"}

*Figure 10. Reporter dose determines the trade-off between basal EGFP fluorescence and reporter-positive cell coverage.*

#### **Cycle 5**: Target access and editor tracking {#measure-cycle-05 .engineering-cycle-title}

##### Design {#measure-cycle-05-design}

Two uncertainties remained: whether the relocated PUF target was sufficiently accessible, and whether reporter-positive cells also expressed ORCA. We addressed them separately through **RepOpen**, a synonymous recoding strategy around the target window, and **P2A–BFP**, an editor-associated expression marker.

##### Build {#measure-cycle-05-build}

RNAplfold assessed predicted accessibility in the full **2,007-nt reporter RNA**, including the 12-nt PUF site (**P12**) and the 15-nt site–spacer–target region (**P15**) [2,6]. We retained the recognition sequence, spacer, and CGA codon while synonymously recoding **39 downstream nucleotides**, producing **OpenA** and **OpenB**. The candidates showed different predicted accessibility advantages: at a 70-nt folding window, P12 increased from **0.646% in WT to 5.209% in OpenA**, whereas OpenB showed the stronger P15 result. We sequence-verified both designs and constructed **ORCA–FLAG–P2A–BFP** (Figure 11).

![Figure 11 — RepOpen and BFP designs](/assets/images/submission-20261017/engineering/measure/figure-11.png){.engineering-figure style="--engineering-figure-width:640px;--engineering-detail-width:960px"}

*Figure 11. Synonymous recoding probes target-window accessibility, while P2A–BFP adds an editor-associated fluorescence channel.*

##### Test {#measure-cycle-05-test}

WT, OpenA, and OpenB were paired with empty vector, untagged PUF12, or BFP-tagged PUF12 in a **3 × 3 matrix**. Among reporter-positive cells in BFP-tagged editor conditions, approximately **55.8%–62.0%** also crossed the BFP threshold, enabling identification of an editor-associated co-expression population. In that branch, OpenA showed **11.1% higher absolute median EGFP** than WT; with untagged PUF12, however, WT was brightest. Reporter baselines also differed, and the EGFP comparison was not restricted to double-positive cells (Figure 12).

##### Learn {#measure-cycle-05-learn}

RepOpen offered a rational route to altering local RNA structure, but the fluorescence comparisons did not demonstrate a general improvement in editing sensitivity. The clearer advance was **BFP-based visibility of editor-associated expression**, allowing later analyses to distinguish reporter-positive and reporter/editor co-expression populations. Subsequent real-editor experiments used the sequence-confirmed **RepOpen-A-1 (OpenA-1)** clone.

![Figure 12 — RepOpen reporter comparison](/assets/images/submission-20261017/engineering/measure/figure-12.png){.engineering-figure style="--engineering-figure-width:680px;--engineering-detail-width:960px"}

*Figure 12. The RepOpen matrix reveals construct-dependent green outputs and shows the value of BFP for identifying reporter/editor co-expression.*

<section class="engineering-overview-card engineering-measurement-card" aria-labelledby="measure-from-fluorescence-to-measurement" markdown="1">

### From Fluorescence to Measurement {#measure-from-fluorescence-to-measurement}

The first five cycles established a fluorescence switch and improved how we observe its output. They also exposed a central problem: **green fluorescence is shaped by expression and protein processing, not just by the edited RNA fraction**. We therefore separated reporter engineering from the interpretation of its optical signals.

The **SONAR Measurement Pipeline** follows four layers. **Layer 0** establishes background correction and defined cell populations. **Layer 1** calculates the *Reporter Activity Score (RAS)* from background-corrected, linear EGFP and mCherry signals within a specified population. **Layer 2** seeks an empirical *Relative Editing Score (RES)* using mixtures of the preset AC and INAC references. **Layer 3** explores an optional *Predicted Editing Rate (PER)* by relating optical measures to independent molecular measurements. Their formulas, calibration assumptions, and limits are detailed on the **SONAR Measurement** page.

A crucial distinction guided the next experiments: **the AC fraction of mixed reporter DNA is not the fraction of edited RNA**. A reference series can characterize how the optical system responds to known input mixtures, but it cannot be presumed to measure an absolute editing percentage or to be invertible at every point.

<nav class="sonar-connections" aria-label="Explore connected SONAR chapters">
<a class="sonar-connection-card" href="/measurement"><span class="sonar-connection-label"><i class="sonar-connection-symbol" aria-hidden="true"></i>SONAR / Measurement</span><strong>Understand what the signal means</strong><span class="sonar-connection-description">Explore population selection, RAS and reference-calibrated RES, and the molecular evidence still needed for PER.</span><span class="sonar-connection-action">Explore Measurement<span aria-hidden="true"> →</span></span></a>
</nav>

</section>

#### **Cycle 6**: Establishing AC/INAC references {#measure-cycle-06 .engineering-cycle-title}

##### Design {#measure-cycle-06-design}

We moved beyond the AC and INAC endpoints to ask whether defined DNA mixtures produced a graded reporter response suitable for empirical calibration.

##### Build {#measure-cycle-06-build}

In HEK293T cells, we tested **seven nominal AC mass fractions**—0%, 10%, 25%, 50%, 75%, 90%, and 100%—with **100 ng total AC/INAC reporter per well** and **two independent transfection wells** per fraction. No editor was included (Figure 14).

##### Test {#measure-cycle-06-test}

Median EGFP increased overall, from approximately **13.6k a.u. at 0% AC** to **24.2k a.u. at 100% AC**, a **1.77-fold** endpoint separation. Yet 0%–25% mixtures substantially overlapped, while only **1.2%–3.4%** of singlets passed the mCherry-positive gate (approximately **602–1,759 cells per sample**). Differences in mCherry expression across conditions further complicated interpretation.

##### Learn {#measure-cycle-06-learn}

The reference mixtures produced an input-associated optical trend, but not a reliably resolvable calibration across the full range. We planned to increase sampling density at low AC fractions and improve the number of analyzable reporter-positive cells.

![Figure 14 — First AC/INAC reference](/assets/images/submission-20261017/engineering/measure/figure-14.png){.engineering-figure style="--engineering-figure-width:640px;--engineering-detail-width:960px"}

*Figure 14. Seven AC/INAC mixtures reveal an overall EGFP response but weak low-input discrimination and limited reporter-positive cell yield.*

<a class="sonar-evidence-link" href="/measurement#5-1-why-a-fluorescence-ratio-needs-its-own-reference"><i class="sonar-connection-symbol" aria-hidden="true"></i><span><span class="sonar-evidence-label">Measurement · Layer 2</span><span class="sonar-evidence-title">Why AC/INAC references are needed</span></span><span class="sonar-evidence-arrow" aria-hidden="true">→</span></a>

#### **Cycle 7**: Refining the reference experiment {#measure-cycle-07 .engineering-cycle-title}

##### Design {#measure-cycle-07-design}

We expanded to **ten AC input fractions** to examine local resolution while increasing the total DNA input. We also tested whether normalizing green output against the red expression reference clarified the trend.

##### Build {#measure-cycle-07-build}

Each HEK293T well received **100 ng AC/INAC reporter** plus **400 ng ORCA–P2A–BFP**, with two independent wells per fraction (Figure 15). This was an **editor-containing reference context**, not a neutral BFP-only supplement, and therefore differed from Cycle 6.

##### Test {#measure-cycle-07-test}

Reporter-positive coverage rose to **16.3%–38.9% of singlets**, providing many more analyzable cells. However, neighboring low-input EGFP distributions still overlapped. Raw EGFP did not change monotonically with AC fraction; background-corrected **RAS** showed a more coherent overall rise, from approximately **0.534** at 0% to **1.129** at 100% AC, while retaining poorly resolved intervals and a near-plateau at **90%–100%**. Thus a smoother overall trend did not establish a uniquely invertible calibration.

##### Learn {#measure-cycle-07-learn}

Increasing the number of reference points improved the description of the response, not necessarily its resolution. The larger reporter-positive population was useful, but different instruments, gating, and editor-containing backgrounds prevent us from attributing that improvement to DNA dose alone. Any future RES calibration must specify the experimental context and the regions in which the reference is actually distinguishable.

![Figure 15 — Second AC/INAC reference](/assets/images/submission-20261017/engineering/measure/figure-15.png){.engineering-figure style="--engineering-figure-width:660px;--engineering-detail-width:960px"}

*Figure 15. The expanded reference series increases analyzable cell yield and exposes differences between raw EGFP and expression-normalized RAS.*

<a class="sonar-evidence-link" href="/measurement#5-2-building-and-fitting-the-ac-inac-response-ladder"><i class="sonar-connection-symbol" aria-hidden="true"></i><span><span class="sonar-evidence-label">Measurement · Layer 2</span><span class="sonar-evidence-title">Reference fitting, RES and calibration limits</span></span><span class="sonar-evidence-arrow" aria-hidden="true">→</span></a>

#### **Cycle 8**: Exploring an accessible measurement platform {#measure-cycle-08 .engineering-cycle-title}

##### Design {#measure-cycle-08-design}

Flow cytometry resolves single-cell distributions, but is not available in every laboratory. We asked whether SONAR could also be read by a **fluorescence microplate reader**, using the same AC/INAC reference material while recognizing that whole-well measurements would require their own interpretation.

##### Build {#measure-cycle-08-build}

Using the Cycle 7 cell samples, we tested the **Thermo Scientific Varioskan LUX**. Initial single-position reads were followed by a revised protocol using PBS and **81 positions per well**, averaged into a whole-well measurement (Figure 16). The revised protocol changed both medium and sampling pattern.

##### Test {#measure-cycle-08-test}

With the revised measurements, the **0%–100% AC EGFP endpoint ratio** increased from approximately **1.09 to 1.54**, while the median between-well EGFP coefficient of variation decreased from **10.86% to 3.01%**. Spatial scans also showed substantial within-well variation. The mCherry channel suffered particularly weak, unstable position-level signals, and the ten-point EGFP series was not reliably monotonic.

##### Learn {#measure-cycle-08-learn}

SONAR's optical switch was detectable without single-cell flow cytometry, but the plate reader did not yet provide a validated reference-calibration method. Whole-well signal, background, spatial sampling, and expression normalization must be handled differently from cell-gated RAS.

![Figure 16 — Plate reader comparison](/assets/images/submission-20261017/engineering/measure/figure-16.png){.engineering-figure style="--engineering-figure-width:780px;--engineering-detail-width:960px"}

*Figure 16. An 81-point plate-reader scan improves well-level consistency while revealing spatial heterogeneity and calibration constraints.*

#### **Cycle 9**: Imaging with active ORCA {#measure-cycle-09 .engineering-cycle-title}

##### Design {#measure-cycle-09-design}

Reference mixtures describe preset translation states; they do not capture the full biology of ORCA editing reporter RNA. We returned to **RepOpen-A-1**, with six **reporter:editor DNA ratios (1:0 to 1:8)**, to observe the system under actual editor exposure before further quantitative and molecular analysis.

##### Build {#measure-cycle-09-build}

HEK293T cells received **100 ng OpenA-1** and variable **ORCA–P2A–BFP**. We acquired representative EGFP images at each dose using a **Nikon ECLIPSE Ti2** microscope, and imaged brightfield, EGFP, mCherry, and BFP in the same field at the **1:4** condition (Figure 17).

##### Test {#measure-cycle-09-test}

Visible EGFP appeared across all conditions, including the no-editor control, and fluorescence varied among individual cells. Multichannel images demonstrated how the three signals could be visualized alongside cell morphology. Because representative fields were not acquired under uniform exposure and gain settings, these images did not establish a quantitative dose–fluorescence relationship.

##### Learn {#measure-cycle-09-learn}

Microscopy added a direct, spatially informative way to inspect the reporter/editor system, complementing flow cytometry and whole-well readings. Establishing whether the observed signals tracked **actual OpenA-1 RNA editing**, however, required a molecular comparison.

![Figure 17 — Microscopy of real-editor conditions](/assets/images/submission-20261017/engineering/measure/figure-17.png){.engineering-figure style="--engineering-figure-width:720px;--engineering-detail-width:960px"}

*Figure 17. Representative microscopy shows heterogeneous SONAR fluorescence and three-channel reporter/editor visualization across the editor-dose series.*

#### **Cycle 10**: Linking fluorescence and RNA changes {#measure-cycle-10 .engineering-cycle-title}

##### Design {#measure-cycle-10-design}

Our final engineering cycle compared three related but distinct outputs in the real-editor series: **editor-associated co-expression (BFP), reporter activity (EGFP relative to mCherry), and sequence changes at the reporter target**. The objective was to test whether the optical data could support an empirical route toward PER, rather than assuming that greater editor input must yield more green fluorescence.

##### Build {#measure-cycle-10-build}

We used the same six-dose OpenA-1 design, keeping **100 ng reporter** and **1 µg total DNA per twelve-well** while varying ORCA–P2A–BFP from **0 to 800 ng**; each group comprised **two independent transfection wells**. Alongside microscopy and plate-reader observations, we acquired flow data and extracted RNA. Following an unsuccessful initial PCR, primers matched to the verified OpenA-1 sequence yielded a **523-bp amplicon** spanning the reporter switch. Its **C280** position corresponds to the intended C-to-U target (Figure 18).

##### Test {#measure-cycle-10-test}

The fraction of reporter-positive cells with detectable BFP rose from approximately **6.82% at the lowest nonzero editor dose** to **40.21% at 1:8**. However, RAS did not increase monotonically, whether calculated for all reporter-positive cells or only the BFP-positive co-expression population. In the overall reporter population, mean RAS was approximately **0.635 without editor**, declined at intermediate doses, and did not show a sustained increase at higher inputs.

Sequencing provided a different pattern. **47 of 48 Sanger reads** passed target-site quality checks. Compared with the no-editor control, higher-editor samples displayed a stronger substitution signal at C280, consistent with the intended RNA **C-to-U** event (C/T in forward cDNA reads; G/A in reverse reads). The **background-corrected relative substitution-signal index** increased overall with editor dose, reaching approximately **0.202 at 1:8**. This number is a *relative chromatogram-derived index*, **not a calibrated 20.2% RNA-editing rate**.

The resulting divergence was informative: **BFP-positive co-expression and target-site sequence signals increased with editor input, while normalized green output did not**. Matching RAS to the chromatogram index across transfection wells did not yield a stable predictive relationship. Moreover, the previous AC/INAC references were collected using different reporter/editor conditions and could not simply be transferred to OpenA-1 to obtain a validated RES–editing-rate relationship.

##### Learn {#measure-cycle-10-learn}

SONAR successfully connected fluorescence measurements with independent evidence of sequence changes at a defined reporter target, but **PER remained exploratory**. Predicting an absolute RNA-editing fraction will require calibrated molecular measurements and optical references matched to the relevant reporter and editor context. These constraints, along with the mathematical treatment of RAS, RES, and PER, form the basis of the accompanying Measurement page.

![Figure 18 — Flow and sequencing evidence](/assets/images/submission-20261017/engineering/measure/figure-18.png){.engineering-figure style="--engineering-figure-width:820px;--engineering-detail-width:960px"}

*Figure 18. A six-dose real-editor study compares BFP co-expression, optical RAS, and Sanger evidence of the OpenA-1 C280 substitution.*

<a class="sonar-evidence-link" href="/measurement#6-4-pairing-flow-cytometry-with-independent-molecular-measurements"><i class="sonar-connection-symbol" aria-hidden="true"></i><span><span class="sonar-evidence-label">Measurement · Layer 3</span><span class="sonar-evidence-title">Paired optical–molecular analysis and held-out prediction</span></span><span class="sonar-evidence-arrow" aria-hidden="true">→</span></a>

### **Conclusion** {#measure-conclusion .engineering-section-title}

Across ten cycles, SONAR evolved from a proposed **EGFP–ecDHFR-DD switch** into a modular, multichannel reporter and an experimental foundation for relative optical measurement. The preset AC state and TMP experiments supported the fluorescence mechanism; reporter-dose optimization, RepOpen design, and P2A–BFP improved our ability to characterize its output and the relevant expression context. Flow cytometry, plate-reader scans, and microscopy then revealed both the reach and the distinct limitations of different optical readouts.

Most importantly, the real-editor experiments showed why these channels must be interpreted separately. ORCA-associated expression and C280 substitution signals increased with editor input, but green fluorescence did not track them in a simple way. **SONAR therefore provides a measurable editing-responsive reporter platform, not an experimentally validated shortcut from fluorescence to absolute editing percentage.** The next step is the **SONAR Measurement** framework: defining how fluorescence can be normalized, referenced, and—where independent molecular calibration supports it—related to RNA editing.

<nav class="sonar-connections" aria-label="Explore connected SONAR chapters">
<a class="sonar-connection-card" href="/contribution#sonar"><span class="sonar-connection-label"><i class="sonar-connection-symbol" aria-hidden="true"></i>SONAR / Contribution</span><strong>Use SONAR in your next experiment</strong><span class="sonar-connection-description">Follow the design and analysis tutorial, try interactive examples, and inspect the resources for adapting SONAR.</span><span class="sonar-connection-action">Explore Contribution<span aria-hidden="true"> →</span></span></a>
</nav>

### References {#measure-references}

1. Iwamoto M, Björklund T, Lundberg C, Kirik D, Wandless TJ. A general chemical method to regulate protein stability in the mammalian central nervous system. *Chemistry & Biology*. 2010;17(9):981–988. https://doi.org/10.1016/j.chembiol.2010.07.009
2. ViennaRNA Package. *RNAplfold* and *RNAfold* manuals. https://www.tbi.univie.ac.at/RNA/RNAplfold and https://www.tbi.univie.ac.at/RNA/RNAfold
3. Kim JH, et al. High cleavage efficiency of a 2A peptide derived from porcine teschovirus-1 in human cell lines, zebrafish and mice. *PLoS ONE*. 2011;6(4):e18556. https://doi.org/10.1371/journal.pone.0018556
4. Engler C, Kandzia R, Marillonnet S. A one pot, one step, precision cloning method with high throughput capability. *PLoS ONE*. 2008;3(11):e3647. https://doi.org/10.1371/journal.pone.0003647
5. NCBI. *The Genetic Codes: Standard Code (transl_table=1).* https://www.ncbi.nlm.nih.gov/Taxonomy/Utils/wprintgc.cgi
6. Internal project design record: `StemBreak_synonymous_design_2026-09-01.md` and associated `rnaplfold_accessibility.csv` (source cited in the Chinese manuscript; not included in this archive).

## Model

### Dry Lab Engineering {#dry-dbtl}

#### Overview {#dry-dbtl-overview}

<img class="engineering-overview-illustration" src="/assets/images/engineering-overviews/dry-dbtl.png" alt="PUFFER modelling workflow: RNA-seq, PUF and APOBEC, LAMAR, and whole-body modelling." width="1800" height="1080" decoding="async">

ORCA aims to improve the specificity of programmable APOE4 RNA editing while preserving useful target activity. The PUF recognition domain, the APOBEC catalytic domain and the surrounding RNA sequence each contribute to this design problem. Our dry-lab workflow connects editor design and site prioritization with delivery, expression and RNA-product formation at the system scale.

**Reliable RNA-seq analysis underpins the workflow.** Module 1 receives sequencing libraries from the wet-lab team and converts them into consistently defined editing candidates, replicate-level rates and transcript-oriented sequence contexts. Iterations in quality control, allele counting, background screening and normalization establish a shared basis for comparing editors and training downstream models.

**PUF and APOBEC modelling address complementary parts of the editor.** Module 2 combines sequence representations with functional labels to rank recognition-domain variants. Structure-conditioned generation extends exploration into additional recognition and scaffold positions. Module 3 uses paired protein–RNA predictions, parent-corrected contact profiles and structural clustering to investigate the catalytic domain. Together, these models return ranked candidates, contact-based hypotheses and matched comparisons for experimental follow-up; new sequence and functional information informs subsequent model development.

**LAMAR translates editing profiles into site-level priorities.** Module 4 uses RNA-seq-derived labels and human transcript sequences to learn regional and local editing-associated patterns. Human-transcript adaptation, separate regional and cytidine tasks, and a ranking objective turn these patterns into candidate shortlists for follow-up under a limited screening budget.

**Whole-body modelling connects molecular design to delivery and tissue coverage.** Module 5 links systemic distribution, blood–brain barrier transport, expression and multisite RNA reactions through compartmental equations. Complementary spatial simulations resolve differences in cellular exposure across tissue. Literature-informed priors and scenario parameters support comparisons of intended-product retention, unwanted editing and coverage; an experimental-data interface supports future parameter updates.

Across the five models, Design–Build–Test–Learn cycles make the computational decisions explicit. Tests identify a limitation in the representation, assumptions or prediction objective; model revisions address that limitation; and the resulting comparisons determine what to retain or refine. The combined workflow returns candidate editors, prioritized RNA sites and delivery questions to the wet-lab team, linking each modelling output to a concrete next decision. Using model predictions to guide successive experiments follows a broader data-informed DBTL approach (Radivojević et al., 2020).

---

### RNA-seq {#model-rna-seq .engineering-chapter-title}

Mapping candidate RNA editing sites
{.engineering-chapter-subtitle}

#### Overview {#model-rna-seq-overview}

Module 1 turns RNA sequencing (RNA-seq) into candidate editing sites and comparative profiles for editor design. The wet-lab team supplied paired-end sequencing from six editor groups and three control groups, with four biological replicates each, giving 36 libraries.

Building on the REDItools framework (Picardi & Pesole, 2013), we extended REDItools2 discovery (Flati et al., 2020) with target-allele recounting, multiple-testing correction, transcript orientation, cell-line variant filtering and replicate consistency. Matched-site comparisons and normalization by callable cytosines then made differences between editors and chromosomes interpretable. The resulting site lists, rates and sequence contexts guide follow-up assays and provide consistent inputs for the PUF, APOBEC and LAMAR models.

[Read the full RNA-seq model](https://github.com/pdx12320/WIKI_SUSTech-BIO/blob/main/wiki/components/model/module1.html)

#### **Cycle 1**: Defining candidate signals {#model-rna-seq-cycle-01 .engineering-cycle-title}

##### Design {#model-rna-seq-cycle-01-design}

The initial workflow used Q20 filtering, without false discovery rate (FDR) control or transcript-strand annotation through the Ensembl Variant Effect Predictor (VEP). Low-frequency mismatches therefore combined base-call uncertainty, chance findings across many tests and ambiguous interpretation of negative-strand substitutions. We gave each source of uncertainty an explicit rule.

##### Build {#model-rna-seq-cycle-01-build}

Adapter trimming used fastp (Chen et al., 2018), followed by splice-aware alignment with STAR (Dobin et al., 2013). GATK prepared duplicate-marked, splice-processed alignments for site analysis (McKenna et al., 2010).

Base and mapping quality thresholds were raised above Q30, implemented as BQ≥31 and MAPQ≥31. Phred quality relates to predicted error probability through the following relationship (Illumina, 2014):

<div class="engineering-equation"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><mi>Q</mi><mo>=</mo><mi>−</mi><mn>10</mn><msub><mrow><mi mathvariant="normal">log</mi><mo>⁡</mo></mrow><mn>10</mn></msub><msub><mi>P</mi><mrow><mi mathvariant="normal">e</mi><mi mathvariant="normal">r</mi><mi mathvariant="normal">r</mi><mi mathvariant="normal">o</mi><mi mathvariant="normal">r</mi></mrow></msub><mo>,</mo><mspace width="2.0em" /><msub><mi>P</mi><mrow><mi mathvariant="normal">e</mi><mi mathvariant="normal">r</mi><mi mathvariant="normal">r</mi><mi mathvariant="normal">o</mi><mi mathvariant="normal">r</mi></mrow></msub><mo>=</mo><msup><mn>10</mn><mrow><mi>−</mi><mi>Q</mi><mi>/</mi><mn>10</mn></mrow></msup><mi>.</mi></mrow><annotation encoding="application/x-tex">&#10;&#81;&#61;&#45;&#49;&#48;&#92;&#108;&#111;&#103;&#95;&#123;&#49;&#48;&#125;&#80;&#95;&#123;&#92;&#109;&#97;&#116;&#104;&#114;&#109;&#123;&#101;&#114;&#114;&#111;&#114;&#125;&#125;&#44;&#92;&#113;&#113;&#117;&#97;&#100;&#32;&#80;&#95;&#123;&#92;&#109;&#97;&#116;&#104;&#114;&#109;&#123;&#101;&#114;&#114;&#111;&#114;&#125;&#125;&#61;&#49;&#48;&#94;&#123;&#45;&#81;&#47;&#49;&#48;&#125;&#46;&#10;</annotation></semantics></math></div>

At each site, one-sided pooled-read Fisher tests compared treatment with each of the three controls. The largest p-value entered Benjamini–Hochberg correction, with q≤0.05 required (Benjamini & Hochberg, 1995). For m ordered p-values:

<div class="engineering-equation"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><msub><mi>q</mi><mrow><mo stretchy="false" form="prefix">(</mo><mi>i</mi><mo stretchy="false" form="postfix">)</mo></mrow></msub><mo>=</mo><mrow><mi mathvariant="normal">min</mi><mo>⁡</mo></mrow><mrow><mo stretchy="true" form="prefix">{</mo><mn>1</mn><mo>,</mo><munder><mi mathvariant="normal">min</mi><mrow><mi>j</mi><mo>≥</mo><mi>i</mi></mrow></munder><mfrac><mrow><mi>m</mi><mspace width="0.167em" /><msub><mi>p</mi><mrow><mo stretchy="false" form="prefix">(</mo><mi>j</mi><mo stretchy="false" form="postfix">)</mo></mrow></msub></mrow><mi>j</mi></mfrac><mo stretchy="true" form="postfix">}</mo></mrow><mi>.</mi></mrow><annotation encoding="application/x-tex">&#10;&#113;&#95;&#123;&#40;&#105;&#41;&#125;&#61;&#92;&#109;&#105;&#110;&#92;&#108;&#101;&#102;&#116;&#92;&#123;&#49;&#44;&#92;&#109;&#105;&#110;&#95;&#123;&#106;&#92;&#103;&#101;&#113;&#32;&#105;&#125;&#92;&#102;&#114;&#97;&#99;&#123;&#109;&#92;&#44;&#112;&#95;&#123;&#40;&#106;&#41;&#125;&#125;&#123;&#106;&#125;&#92;&#114;&#105;&#103;&#104;&#116;&#92;&#125;&#46;&#10;</annotation></semantics></math></div>

VEP annotations aligned genomic C>T and G>A calls with transcript-oriented C-to-U editing (McLaren et al., 2016). Sequence contexts were exported as 101 nt centred on cytosine.

##### Test {#model-rna-seq-cycle-01-test}

Q20 and Q30 correspond to predicted single-base error probabilities of 1% and 0.1%, respectively. Raising the cutoff excluded less reliable observations from candidate discovery. Strand checks established a consistent orientation for comparing sequence contexts.

Inspecting the caller's count definition exposed another problem: its non-reference support combined multiple substitution types. Quality filtering alone could not establish how many reads supported the intended edit.

##### Learn {#model-rna-seq-cycle-01-learn}

Higher quality thresholds, FDR control and transcript-oriented export became the detection framework. We then separated candidate discovery from target-allele quantification, so every retained signal would be supported by the relevant substitution.

#### **Cycle 2**: Counting intended substitutions {#model-rna-seq-cycle-02 .engineering-cycle-title}

##### Design {#model-rna-seq-cycle-02-design}

REDItools2's minimum editing count measures total non-reference support. At a multiallelic position, several mismatch types can contribute to that count. Treating it as target-ALT evidence would blur the distinction between candidate discovery and C-to-U quantification.

##### Build {#model-rna-seq-cycle-02-build}

We added an allele-specific recount in every library. Reads had to satisfy the quality thresholds and unique-alignment requirement; duplicate and other excluded alignment classes contributed no support. Reference and target-alternative observations were counted separately:

<div class="engineering-equation"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><msub><mi>r</mi><mrow><mi>i</mi><mo>,</mo><mi>k</mi></mrow></msub><mo>=</mo><mfrac><msubsup><mrow><mi mathvariant="normal">A</mi><mi mathvariant="normal">L</mi><mi mathvariant="normal">T</mi></mrow><mrow><mi>i</mi><mo>,</mo><mi>k</mi></mrow><mrow><mi mathvariant="normal">t</mi><mi mathvariant="normal">a</mi><mi mathvariant="normal">r</mi><mi mathvariant="normal">g</mi><mi mathvariant="normal">e</mi><mi mathvariant="normal">t</mi></mrow></msubsup><mrow><msub><mrow><mi mathvariant="normal">R</mi><mi mathvariant="normal">E</mi><mi mathvariant="normal">F</mi></mrow><mrow><mi>i</mi><mo>,</mo><mi>k</mi></mrow></msub><mo>+</mo><msubsup><mrow><mi mathvariant="normal">A</mi><mi mathvariant="normal">L</mi><mi mathvariant="normal">T</mi></mrow><mrow><mi>i</mi><mo>,</mo><mi>k</mi></mrow><mrow><mi mathvariant="normal">t</mi><mi mathvariant="normal">a</mi><mi mathvariant="normal">r</mi><mi mathvariant="normal">g</mi><mi mathvariant="normal">e</mi><mi mathvariant="normal">t</mi></mrow></msubsup></mrow></mfrac><mo>,</mo><mspace width="2.0em" /><msub><mover><mi>r</mi><mo accent="true">̃</mo></mover><mi>i</mi></msub><mo>=</mo><msub><mrow><mi mathvariant="normal">median</mi><mo>⁡</mo></mrow><mrow><mi>k</mi><mo>=</mo><mn>1</mn><mo>,</mo><mi>…</mi><mo>,</mo><mn>4</mn></mrow></msub><msub><mi>r</mi><mrow><mi>i</mi><mo>,</mo><mi>k</mi></mrow></msub><mi>.</mi></mrow><annotation encoding="application/x-tex">&#10;&#114;&#95;&#123;&#105;&#44;&#107;&#125;&#61;&#92;&#102;&#114;&#97;&#99;&#123;&#92;&#109;&#97;&#116;&#104;&#114;&#109;&#123;&#65;&#76;&#84;&#125;&#94;&#123;&#92;&#109;&#97;&#116;&#104;&#114;&#109;&#123;&#116;&#97;&#114;&#103;&#101;&#116;&#125;&#125;&#95;&#123;&#105;&#44;&#107;&#125;&#125;&#10;&#123;&#92;&#109;&#97;&#116;&#104;&#114;&#109;&#123;&#82;&#69;&#70;&#125;&#95;&#123;&#105;&#44;&#107;&#125;&#43;&#92;&#109;&#97;&#116;&#104;&#114;&#109;&#123;&#65;&#76;&#84;&#125;&#94;&#123;&#92;&#109;&#97;&#116;&#104;&#114;&#109;&#123;&#116;&#97;&#114;&#103;&#101;&#116;&#125;&#125;&#95;&#123;&#105;&#44;&#107;&#125;&#125;&#44;&#10;&#92;&#113;&#113;&#117;&#97;&#100;&#10;&#92;&#119;&#105;&#100;&#101;&#116;&#105;&#108;&#100;&#101;&#32;&#114;&#95;&#105;&#61;&#92;&#111;&#112;&#101;&#114;&#97;&#116;&#111;&#114;&#110;&#97;&#109;&#101;&#123;&#109;&#101;&#100;&#105;&#97;&#110;&#125;&#95;&#123;&#107;&#61;&#49;&#44;&#92;&#108;&#100;&#111;&#116;&#115;&#44;&#52;&#125;&#114;&#95;&#123;&#105;&#44;&#107;&#125;&#46;&#10;</annotation></semantics></math></div>

Each treated replicate required target ALT≥20, depth≥100 and rate≥0.005. The four-replicate median defined the exported site rate, giving replicates equal standing when library depths differed.

##### Test {#model-rna-seq-cycle-02-test}

The counting check identified why the discovery count could not substitute for the new quantity: non-target mismatches contribute to total non-reference support but contribute zero to target ALT. Explicit recounting removed this ambiguity from the final screen.

The revised definition also kept the exported rate consistent with its numerator. Reference plus target ALT formed the denominator, and biological replicates remained separate until the median was calculated.

##### Learn {#model-rna-seq-cycle-02-learn}

We retained REDItools2 for discovery and used the recount for allele support and rate estimation. This established a common quantitative input for editor comparisons and downstream learning. The next question was whether a well-supported mismatch originated from editing or from the cell line itself.

#### **Cycle 3**: Filtering variants and background {#model-rna-seq-cycle-03 .engineering-cycle-title}

##### Design {#model-rna-seq-cycle-03-design}

A reproducible mismatch can reflect the HEK293T genotype or persistent cellular background. The initial analysis lacked systematic filtering for these sources. We added cell-line variation and control behaviour to the definition of an eligible editing candidate.

##### Build {#model-rna-seq-cycle-03-build}

Four HEK293T SNP catalogues were merged after conversion to GRCh38 and reference-allele checks. Exclusion used exact chromosome–position–REF–ALT matches:

<div class="engineering-equation"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><msub><mi>S</mi><mrow><mi mathvariant="normal">m</mi><mi mathvariant="normal">e</mi><mi mathvariant="normal">r</mi><mi mathvariant="normal">g</mi><mi mathvariant="normal">e</mi><mi mathvariant="normal">d</mi></mrow></msub><mo>=</mo><munderover><mo>⋃</mo><mrow><mi>j</mi><mo>=</mo><mn>1</mn></mrow><mn>4</mn></munderover><msub><mi>S</mi><mi>j</mi></msub><mo>,</mo><mspace width="2.0em" /><msub><mi>C</mi><mrow><mi mathvariant="normal">e</mi><mi mathvariant="normal">l</mi><mi mathvariant="normal">i</mi><mi mathvariant="normal">g</mi><mi mathvariant="normal">i</mi><mi mathvariant="normal">b</mi><mi mathvariant="normal">l</mi><mi mathvariant="normal">e</mi></mrow></msub><mo>=</mo><msub><mi>C</mi><mrow><mi mathvariant="normal">c</mi><mi mathvariant="normal">a</mi><mi mathvariant="normal">n</mi><mi mathvariant="normal">d</mi><mi mathvariant="normal">i</mi><mi mathvariant="normal">d</mi><mi mathvariant="normal">a</mi><mi mathvariant="normal">t</mi><mi mathvariant="normal">e</mi></mrow></msub><mo>\</mo><msub><mi>S</mi><mrow><mi mathvariant="normal">m</mi><mi mathvariant="normal">e</mi><mi mathvariant="normal">r</mi><mi mathvariant="normal">g</mi><mi mathvariant="normal">e</mi><mi mathvariant="normal">d</mi></mrow></msub><mi>.</mi></mrow><annotation encoding="application/x-tex">&#10;&#83;&#95;&#123;&#92;&#109;&#97;&#116;&#104;&#114;&#109;&#123;&#109;&#101;&#114;&#103;&#101;&#100;&#125;&#125;&#61;&#92;&#98;&#105;&#103;&#99;&#117;&#112;&#95;&#123;&#106;&#61;&#49;&#125;&#94;&#123;&#52;&#125;&#83;&#95;&#106;&#44;&#10;&#92;&#113;&#113;&#117;&#97;&#100;&#32;&#67;&#95;&#123;&#92;&#109;&#97;&#116;&#104;&#114;&#109;&#123;&#101;&#108;&#105;&#103;&#105;&#98;&#108;&#101;&#125;&#125;&#61;&#67;&#95;&#123;&#92;&#109;&#97;&#116;&#104;&#114;&#109;&#123;&#99;&#97;&#110;&#100;&#105;&#100;&#97;&#116;&#101;&#125;&#125;&#92;&#115;&#101;&#116;&#109;&#105;&#110;&#117;&#115;&#32;&#83;&#95;&#123;&#92;&#109;&#97;&#116;&#104;&#114;&#109;&#123;&#109;&#101;&#114;&#103;&#101;&#100;&#125;&#125;&#46;&#10;</annotation></semantics></math></div>

Each control group required a median allele rate and median absolute deviation of at most 0.02, with no formal caller detections. Median differences between APOBEC-only or PUF-only controls and the mock control also had to remain at or below 0.02.

Treatment candidates required detection in all four replicates and a median absolute deviation of at most 0.05. These consistency checks complemented the pooled-read significance test.

##### Test {#model-rna-seq-cycle-03-test}

Background and FDR screening substantially narrowed the candidate sets under otherwise matched filtering conditions. PUF12 decreased from 24,398 to 12,908 sites, PUF10 from 8,086 to 2,774, and E72A from 46 to zero.

![Candidate-site counts for six editors after a common filtering workflow.](/assets/images/engineering-dry-dbtl/module-1-image-01.png){.engineering-figure style="--engineering-figure-width:480px;--engineering-detail-width:960px"}

*Figure 1.1 | The common screening workflow produces comparable retained-site lists across the six editors.*

PUF12 still retained far more candidates than PUF10. This pattern persisted after applying the same genetic, background and replicate filters.

##### Learn {#model-rna-seq-cycle-03-learn}

SNP exclusion, control-background filtering and four-replicate consistency became fixed components of the workflow. The PUF12–PUF10 difference now required a matched comparison of editing profiles, with the screening rules held constant.

#### **Cycle 4**: Testing PUF12 editing breadth {#model-rna-seq-cycle-04 .engineering-cycle-title}

##### Design {#model-rna-seq-cycle-04-design}

PUF12's larger candidate set initially made us suspect an analysis error. Editor-specific totals and medians also summarized different sets of sites. We redesigned the comparison around matched genomic positions and local sequence preferences.

##### Build {#model-rna-seq-cycle-04-build}

Matching chromosome, position, REF and ALT identified 2,221 shared sites. At each site, we compared the four-replicate median rates:

<div class="engineering-equation"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><mi mathvariant="normal">Δ</mi><msub><mi>r</mi><mi>i</mi></msub><mo>=</mo><msub><mover><mi>r</mi><mo accent="true">̃</mo></mover><mrow><mrow><mi mathvariant="normal">P</mi><mi mathvariant="normal">U</mi><mi mathvariant="normal">F</mi><mn mathvariant="normal">12</mn></mrow><mo>,</mo><mi>i</mi></mrow></msub><mo>−</mo><msub><mover><mi>r</mi><mo accent="true">̃</mo></mover><mrow><mrow><mi mathvariant="normal">P</mi><mi mathvariant="normal">U</mi><mi mathvariant="normal">F</mi><mn mathvariant="normal">10</mn></mrow><mo>,</mo><mi>i</mi></mrow></msub><mo>,</mo><mspace width="2.0em" /><msub><mi>f</mi><mrow><mi mathvariant="normal">h</mi><mi mathvariant="normal">i</mi><mi mathvariant="normal">g</mi><mi mathvariant="normal">h</mi><mi mathvariant="normal">e</mi><mi mathvariant="normal">r</mi></mrow></msub><mo>=</mo><mfrac><mrow><mi>#</mi><mo stretchy="false" form="prefix">{</mo><mi>i</mi><mo>:</mo><mi mathvariant="normal">Δ</mi><msub><mi>r</mi><mi>i</mi></msub><mo>&gt;</mo><mn>0</mn><mo stretchy="false" form="postfix">}</mo></mrow><mrow><mn>2</mn><mo>,</mo><mn>221</mn></mrow></mfrac><mi>.</mi></mrow><annotation encoding="application/x-tex">&#10;&#92;&#68;&#101;&#108;&#116;&#97;&#32;&#114;&#95;&#105;&#61;&#92;&#119;&#105;&#100;&#101;&#116;&#105;&#108;&#100;&#101;&#32;&#114;&#95;&#123;&#92;&#109;&#97;&#116;&#104;&#114;&#109;&#123;&#80;&#85;&#70;&#49;&#50;&#125;&#44;&#105;&#125;&#45;&#92;&#119;&#105;&#100;&#101;&#116;&#105;&#108;&#100;&#101;&#32;&#114;&#95;&#123;&#92;&#109;&#97;&#116;&#104;&#114;&#109;&#123;&#80;&#85;&#70;&#49;&#48;&#125;&#44;&#105;&#125;&#44;&#10;&#92;&#113;&#113;&#117;&#97;&#100;&#10;&#102;&#95;&#123;&#92;&#109;&#97;&#116;&#104;&#114;&#109;&#123;&#104;&#105;&#103;&#104;&#101;&#114;&#125;&#125;&#61;&#92;&#102;&#114;&#97;&#99;&#123;&#92;&#35;&#92;&#123;&#105;&#58;&#92;&#68;&#101;&#108;&#116;&#97;&#32;&#114;&#95;&#105;&#62;&#48;&#92;&#125;&#125;&#123;&#50;&#44;&#50;&#50;&#49;&#125;&#46;&#10;</annotation></semantics></math></div>

Sequence logos spanning positions −2 to +1 around the edited cytosine tested whether the two candidate sets shared local preferences.

##### Test {#model-rna-seq-cycle-04-test}

PUF12 had higher rates at 1,624 shared sites, or 73.1%, with a median paired difference of +3.02 percentage points. Across each editor's full retained set, median rates were 12.75% for PUF10 and 13.99% for PUF12.

![Paired PUF10 and PUF12 editing rates at 2,221 shared candidate sites.](/assets/images/engineering-dry-dbtl/module-1-image-02.svg){.engineering-figure style="--engineering-figure-width:640px;--engineering-detail-width:960px"}

*Figure 1.2 | PUF12 has higher rates at most shared sites, with a median paired difference of +3.02 percentage points.*

Both editors retained a prominent −1 guanine preference, placing their different editing breadths within a similar local sequence pattern.

![Local sequence logos around retained cytosines.](/assets/images/engineering-dry-dbtl/module-1-image-03.png){.engineering-figure style="--engineering-figure-width:1000px;--engineering-detail-width:1480px"}

*Figure 1.3 | PUF10 and PUF12 share a prominent −1 guanine preference despite their different candidate-site counts.*

##### Learn {#model-rna-seq-cycle-04-learn}

The matched analysis supported a broadly consistent upward shift in PUF12 rates alongside its larger candidate set. We therefore expanded editor assessment to combine breadth, matched-site rates and sequence preferences.

Han et al. (2022) reported improved specificity for a ten-repeat PUF relative to an eight-repeat configuration. Our comparison made repeat length an empirical design variable, motivating the variant-specific modelling in Module 2. Binding studies likewise distinguish recognition length, affinity and sequence discrimination as separate properties (Zhao et al., 2018).

#### **Cycle 5**: Normalizing chromosome comparisons {#model-rna-seq-cycle-05 .engineering-cycle-title}

##### Design {#model-rna-seq-cycle-05-design}

Chromosome 1 stood out in candidate counts. Those counts mixed editing propensity with the number of RNA positions available for detection. We introduced a shared callable-site denominator to distinguish these contributions.

##### Build {#model-rna-seq-cycle-05-build}

A fixed reference contained 899,942 callable cytosines passing the quality, strand, SNP and sequence filters. Reference sites required depth≥100 in all four PUF12 libraries and depth≥20 in all twelve control libraries.

Each editor's candidates were intersected with this reference. Chromosome densities were then scaled to a relative distribution:

<div class="engineering-equation"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><msub><mi>d</mi><mrow><mi>g</mi><mo>,</mo><mi>c</mi></mrow></msub><mo>=</mo><mfrac><msub><mi>N</mi><mrow><mi>g</mi><mo>,</mo><mi>c</mi></mrow></msub><msub><mi>C</mi><mi>c</mi></msub></mfrac><mo>,</mo><mspace width="2.0em" /><msub><mi>P</mi><mrow><mi>g</mi><mo>,</mo><mi>c</mi></mrow></msub><mo>=</mo><mn>100</mn><mi>%</mi><mo>×</mo><mfrac><msub><mi>d</mi><mrow><mi>g</mi><mo>,</mo><mi>c</mi></mrow></msub><mrow><munder><mo>∑</mo><msup><mi>c</mi><mo>′</mo></msup></munder><msub><mi>d</mi><mrow><mi>g</mi><mo>,</mo><msup><mi>c</mi><mo>′</mo></msup></mrow></msub></mrow></mfrac><mi>.</mi></mrow><annotation encoding="application/x-tex">&#10;&#100;&#95;&#123;&#103;&#44;&#99;&#125;&#61;&#92;&#102;&#114;&#97;&#99;&#123;&#78;&#95;&#123;&#103;&#44;&#99;&#125;&#125;&#123;&#67;&#95;&#99;&#125;&#44;&#10;&#92;&#113;&#113;&#117;&#97;&#100;&#10;&#80;&#95;&#123;&#103;&#44;&#99;&#125;&#61;&#49;&#48;&#48;&#92;&#37;&#92;&#116;&#105;&#109;&#101;&#115;&#92;&#102;&#114;&#97;&#99;&#123;&#100;&#95;&#123;&#103;&#44;&#99;&#125;&#125;&#123;&#92;&#115;&#117;&#109;&#95;&#123;&#99;&#39;&#125;&#100;&#95;&#123;&#103;&#44;&#99;&#39;&#125;&#125;&#46;&#10;</annotation></semantics></math></div>

Here, N is the candidate count within the reference and C is the callable-cytosine count. Undefined denominators remained missing values.

##### Test {#model-rna-seq-cycle-05-test}

PUF12 contributed 1,889 candidates on chromosome 1, which contained 129,467 callable cytosines. After normalization, chromosome 1 accounted for 4.43% of its relative density profile. PUF10, PUF12 and SNE showed broadly distributed profiles, generally around 3.1%–5.7% per chromosome.

![Chromosome candidate densities normalized by a shared callable-cytosine reference.](/assets/images/engineering-dry-dbtl/module-1-image-04.png){.engineering-figure style="--engineering-figure-width:700px;--engineering-detail-width:960px"}

*Figure 1.4 | Callable-cytosine normalization places chromosome 1 within the broadly distributed candidate-density profiles.*

##### Learn {#model-rna-seq-cycle-05-learn}

Callable-site density replaced counts as the basis for chromosome comparisons. We retained both outputs for different decisions: counts describe editing breadth, while normalized density describes its relative distribution. Together, they guide follow-up site selection across genomic regions.

#### References {#model-rna-seq-references}

1. Benjamini, Y., & Hochberg, Y. (1995). Controlling the false discovery rate: A practical and powerful approach to multiple testing. *Journal of the Royal Statistical Society: Series B (Methodological), 57*(1), 289–300. [doi: 10.1111/j.2517-6161.1995.tb02031.x](<https://doi.org/10.1111/j.2517-6161.1995.tb02031.x>)

2. Chen, S., Zhou, Y., Chen, Y., & Gu, J. (2018). fastp: An ultra-fast all-in-one FASTQ preprocessor. *Bioinformatics, 34*(17), i884–i890. [doi: 10.1093/bioinformatics/bty560](<https://doi.org/10.1093/bioinformatics/bty560>)

3. Dobin, A., Davis, C. A., Schlesinger, F., Drenkow, J., Zaleski, C., Jha, S., Batut, P., Chaisson, M., & Gingeras, T. R. (2013). STAR: Ultrafast universal RNA-seq aligner. *Bioinformatics, 29*(1), 15–21. [doi: 10.1093/bioinformatics/bts635](<https://doi.org/10.1093/bioinformatics/bts635>)

4. Flati, T., Gioiosa, S., Spallanzani, N., Tagliaferri, I., Diroma, M. A., Pesole, G., Chillemi, G., Picardi, E., & Castrignanò, T. (2020). HPC-REDItools: A novel HPC-aware tool for improved large scale RNA-editing analysis. *BMC Bioinformatics, 21*(Suppl. 10), Article 353. [doi: 10.1186/s12859-020-03562-x](<https://doi.org/10.1186/s12859-020-03562-x>)

5. Han, W., Huang, W., Wei, T., Ye, Y., Mao, M., & Wang, Z. (2022). Programmable RNA base editing with a single gRNA-free enzyme. *Nucleic Acids Research, 50*(16), 9580–9595. [doi: 10.1093/nar/gkac713](<https://doi.org/10.1093/nar/gkac713>)

6. Illumina. (2014). *Understanding Illumina quality scores* (Publication No. 770-2012-058) [Technical note]. [Source](https://www.illumina.com/content/dam/illumina-marketing/documents/products/technotes/technote_understanding_quality_scores.pdf).

7. McKenna, A., Hanna, M., Banks, E., Sivachenko, A., Cibulskis, K., Kernytsky, A., Garimella, K., Altshuler, D., Gabriel, S., Daly, M., & DePristo, M. A. (2010). The Genome Analysis Toolkit: A MapReduce framework for analyzing next-generation DNA sequencing data. *Genome Research, 20*(9), 1297–1303. [doi: 10.1101/gr.107524.110](<https://doi.org/10.1101/gr.107524.110>)

8. McLaren, W., Gil, L., Hunt, S. E., Riat, H. S., Ritchie, G. R. S., Thormann, A., Flicek, P., & Cunningham, F. (2016). The Ensembl Variant Effect Predictor. *Genome Biology, 17*(1), Article 122. [doi: 10.1186/s13059-016-0974-4](<https://doi.org/10.1186/s13059-016-0974-4>)

9. Picardi, E., & Pesole, G. (2013). REDItools: High-throughput RNA editing detection made easy. *Bioinformatics, 29*(14), 1813–1814. [doi: 10.1093/bioinformatics/btt287](<https://doi.org/10.1093/bioinformatics/btt287>)

10. Radivojević, T., Costello, Z., Workman, K., & Garcia Martin, H. (2020). A machine learning Automated Recommendation Tool for synthetic biology. *Nature Communications, 11*(1), Article 4879. [doi: 10.1038/s41467-020-18008-4](<https://doi.org/10.1038/s41467-020-18008-4>)

11. Zhao, Y.-Y., Mao, M.-W., Zhang, W.-J., Wang, J., Li, H.-T., Yang, Y., Wang, Z., & Wu, J.-W. (2018). Expanding RNA binding specificity and affinity of engineered PUF domains. *Nucleic Acids Research, 46*(9), 4771–4782. [doi: 10.1093/nar/gky134](<https://doi.org/10.1093/nar/gky134>)


---

### PUF {#model-puf .engineering-chapter-title}

Specificity ranking and structure-conditioned design
{.engineering-chapter-subtitle}

#### Overview {#model-puf-overview}

Module 2 ranks PUF variants by relative specificity and proposes sequences for further evaluation. Wet-lab inputs comprised amino-acid sequences and labels for three endpoints: C295, C388 and C871. C388 was the target endpoint, with the other two representing bystander editing. Two batches contained 81 constructs, including 66 with complete endpoint labels; observed endpoints from the remaining constructs also contributed to training.

Our approach developed from AlphaFold 3 contact probabilities (CP) into the PUF-ESM ranker, combining substitution identity, an evolutionary prior and three-endpoint regression. Feedback guided revisions to the representation and evaluation, while structure-conditioned generation extended exploration into scaffold positions beyond the training coverage. Ranked variants, scaffold proposals and model-consensus candidates guide the next experimental comparisons.

[View the complete Module 2 model.](https://github.com/pdx12320/WIKI_SUSTech-BIO/blob/main/wiki/components/model/module2.html)

#### **Cycle 1**: Testing structural contact features {#model-puf-cycle-01 .engineering-cycle-title}

##### Design {#model-puf-cycle-01-design}

Contact differences in PUF–RNA complexes offered a structural starting point for predicting specificity. A CP matrix contains many interactions with different relevance to the target endpoints. We therefore examined whether feature selection and contact-region decomposition could extract a useful predictive representation before changing the source of information.

##### Build {#model-puf-cycle-01-build}

We extracted CP features from AlphaFold 3 outputs (Abramson et al., 2024) and tested alternative mappings: CP clustering, high-variance subsets, intraprotein contacts and protein–RNA interface contacts. These representations supplied classification and continuous regression models for each endpoint. With contact probability matrix <span class="engineering-math"><math xmlns="http://www.w3.org/1998/Math/MathML" display="inline"><semantics><mi>P</mi><annotation encoding="application/x-tex">&#80;</annotation></semantics></math></span> and feature mapping <span class="engineering-math"><math xmlns="http://www.w3.org/1998/Math/MathML" display="inline"><semantics><mi>ϕ</mi><annotation encoding="application/x-tex">&#92;&#112;&#104;&#105;</annotation></semantics></math></span>, the model relationships were:

<div class="engineering-equation"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><msub><mi>x</mi><mrow><mi mathvariant="normal">C</mi><mi mathvariant="normal">P</mi></mrow></msub><mo>=</mo><mi>ϕ</mi><mo stretchy="false" form="prefix">(</mo><mi>P</mi><mo stretchy="false" form="postfix">)</mo><mo>,</mo><mspace width="2.0em" /><msub><mover><mi>y</mi><mo accent="true">̂</mo></mover><mi>j</mi></msub><mo>=</mo><msub><mi>h</mi><mi>j</mi></msub><mo stretchy="false" form="prefix">(</mo><msub><mi>x</mi><mrow><mi mathvariant="normal">C</mi><mi mathvariant="normal">P</mi></mrow></msub><mo stretchy="false" form="postfix">)</mo><mo>,</mo><mspace width="2.0em" /><msub><mover><mi>C</mi><mo accent="true">̂</mo></mover><mi>j</mi></msub><mo>=</mo><msub><mi>f</mi><mi>j</mi></msub><mo stretchy="false" form="prefix">(</mo><msub><mi>x</mi><mrow><mi mathvariant="normal">C</mi><mi mathvariant="normal">P</mi></mrow></msub><mo stretchy="false" form="postfix">)</mo><mo>,</mo><mspace width="2.0em" /><mi>j</mi><mo>∈</mo><mo stretchy="false" form="prefix">{</mo><mn>295</mn><mo>,</mo><mn>388</mn><mo>,</mo><mn>871</mn><mo stretchy="false" form="postfix">}</mo><mi>.</mi></mrow><annotation encoding="application/x-tex">&#10;&#120;&#95;&#123;&#92;&#109;&#97;&#116;&#104;&#114;&#109;&#123;&#67;&#80;&#125;&#125;&#61;&#92;&#112;&#104;&#105;&#40;&#80;&#41;&#44;&#92;&#113;&#113;&#117;&#97;&#100;&#10;&#92;&#104;&#97;&#116;&#32;&#121;&#95;&#106;&#61;&#104;&#95;&#106;&#40;&#120;&#95;&#123;&#92;&#109;&#97;&#116;&#104;&#114;&#109;&#123;&#67;&#80;&#125;&#125;&#41;&#44;&#92;&#113;&#113;&#117;&#97;&#100;&#10;&#92;&#104;&#97;&#116;&#32;&#67;&#95;&#106;&#61;&#102;&#95;&#106;&#40;&#120;&#95;&#123;&#92;&#109;&#97;&#116;&#104;&#114;&#109;&#123;&#67;&#80;&#125;&#125;&#41;&#44;&#92;&#113;&#113;&#117;&#97;&#100;&#10;&#106;&#92;&#105;&#110;&#92;&#123;&#50;&#57;&#53;&#44;&#51;&#56;&#56;&#44;&#56;&#55;&#49;&#92;&#125;&#46;&#10;</annotation></semantics></math></div>

Here, <span class="engineering-math"><math xmlns="http://www.w3.org/1998/Math/MathML" display="inline"><semantics><msub><mi>h</mi><mi>j</mi></msub><annotation encoding="application/x-tex">&#104;&#95;&#106;</annotation></semantics></math></span> denotes classification and <span class="engineering-math"><math xmlns="http://www.w3.org/1998/Math/MathML" display="inline"><semantics><msub><mi>f</mi><mi>j</mi></msub><annotation encoding="application/x-tex">&#102;&#95;&#106;</annotation></semantics></math></span> denotes continuous regression. We converted the regression outputs into a common specificity objective:

<div class="engineering-equation"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><mover><mi>S</mi><mo accent="true">̂</mo></mover><mo>=</mo><msub><mover><mi>C</mi><mo accent="true">̂</mo></mover><mn>388</mn></msub><mo>−</mo><mfrac><mrow><msub><mover><mi>C</mi><mo accent="true">̂</mo></mover><mn>295</mn></msub><mo>+</mo><msub><mover><mi>C</mi><mo accent="true">̂</mo></mover><mn>871</mn></msub></mrow><mn>2</mn></mfrac><mi>.</mi></mrow><annotation encoding="application/x-tex">&#10;&#92;&#104;&#97;&#116;&#32;&#83;&#61;&#92;&#104;&#97;&#116;&#32;&#67;&#95;&#123;&#51;&#56;&#56;&#125;&#45;&#92;&#102;&#114;&#97;&#99;&#123;&#92;&#104;&#97;&#116;&#32;&#67;&#95;&#123;&#50;&#57;&#53;&#125;&#43;&#92;&#104;&#97;&#116;&#32;&#67;&#95;&#123;&#56;&#55;&#49;&#125;&#125;&#123;&#50;&#125;&#46;&#10;</annotation></semantics></math></div>

This formulation retained separate target and bystander predictions while providing one ranking for candidate selection.

##### Test {#model-puf-cycle-01-test}

The CP-Ridge comparator reached **Spearman <span class="engineering-math"><math xmlns="http://www.w3.org/1998/Math/MathML" display="inline"><semantics><mrow><mi>ρ</mi><mo>=</mo><mn>0.069</mn></mrow><annotation encoding="application/x-tex">&#92;&#114;&#104;&#111;&#61;&#48;&#46;&#48;&#54;&#57;</annotation></semantics></math></span> and recovered 12 reference Top30 members** under grouped out-of-fold evaluation of the 66 complete-label constructs. This result quantified the remaining weakness of the CP route after the feature-engineering exploration.

Clustering, variance selection and changes to the contact region left an information gap between predicted contacts and the specificity objective. The central problem was the weak ranking signal available to the downstream model. These findings made a different protein representation more promising than further rearrangement of the same contact features.

##### Learn {#model-puf-cycle-01-learn}

We retained three-endpoint regression and the specificity objective as the task definition. CP supplied features through an additional structural inference step, introducing uncertainty between sequence substitution and the final prediction. The next model would obtain its representation directly from sequence, allowing us to test whether the information source was limiting performance.

#### **Cycle 2**: Using frozen ESM-2 representations {#model-puf-cycle-02 .engineering-cycle-title}

##### Design {#model-puf-cycle-02-design}

Weak CP-based ranking motivated a direct comparison with protein language model features. ESM-2 offered sequence representations without per-candidate complex prediction. We tested global and local features to determine whether sequence context carried more useful information for the same three-endpoint task.

##### Build {#model-puf-cycle-02-build}

We froze ESM-2 (Lin et al., 2023) and extracted global and local representations for the candidate sequences. Each representation supplied ridge regression models for C295, C388 and C871, followed by the same specificity calculation. The prediction step can be written as:

<div class="engineering-equation"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><mi>x</mi><mo>=</mo><msub><mi>ϕ</mi><mrow><mi mathvariant="normal">E</mi><mi mathvariant="normal">S</mi><mi mathvariant="normal">M</mi></mrow></msub><mo stretchy="false" form="prefix">(</mo><mi>a</mi><mo stretchy="false" form="postfix">)</mo><mo>,</mo><mspace width="2.0em" /><msub><mover><mi>C</mi><mo accent="true">̂</mo></mover><mi>j</mi></msub><mo>=</mo><msub><mi>b</mi><mi>j</mi></msub><mo>+</mo><msubsup><mi>β</mi><mi>j</mi><mi mathvariant="sans-serif">𝖳</mi></msubsup><mi>x</mi><mo>,</mo></mrow><annotation encoding="application/x-tex">&#10;&#120;&#61;&#92;&#112;&#104;&#105;&#95;&#123;&#92;&#109;&#97;&#116;&#104;&#114;&#109;&#123;&#69;&#83;&#77;&#125;&#125;&#40;&#97;&#41;&#44;&#92;&#113;&#113;&#117;&#97;&#100;&#10;&#92;&#104;&#97;&#116;&#32;&#67;&#95;&#106;&#61;&#98;&#95;&#106;&#43;&#92;&#98;&#101;&#116;&#97;&#95;&#106;&#94;&#123;&#92;&#109;&#97;&#116;&#104;&#115;&#102;&#32;&#84;&#125;&#120;&#44;&#10;</annotation></semantics></math></div>

where <span class="engineering-math"><math xmlns="http://www.w3.org/1998/Math/MathML" display="inline"><semantics><mi>a</mi><annotation encoding="application/x-tex">&#97;</annotation></semantics></math></span> is the amino-acid sequence and <span class="engineering-math"><math xmlns="http://www.w3.org/1998/Math/MathML" display="inline"><semantics><msub><mi>ϕ</mi><mrow><mi mathvariant="normal">E</mi><mi mathvariant="normal">S</mi><mi mathvariant="normal">M</mi></mrow></msub><annotation encoding="application/x-tex">&#92;&#112;&#104;&#105;&#95;&#123;&#92;&#109;&#97;&#116;&#104;&#114;&#109;&#123;&#69;&#83;&#77;&#125;&#125;</annotation></semantics></math></span> denotes the selected frozen representation. The comparison used the same 66 complete-label constructs, grouped evaluation and parameter-selection rule for the CP, global ESM and local ESM models. This kept the prediction task fixed while changing the feature source.

##### Test {#model-puf-cycle-02-test}

**Both sequence representations improved ranking relative to CP-Ridge.** Global ESM features reached <span class="engineering-math"><math xmlns="http://www.w3.org/1998/Math/MathML" display="inline"><semantics><mrow><mi>ρ</mi><mo>=</mo><mn>0.220</mn></mrow><annotation encoding="application/x-tex">&#92;&#114;&#104;&#111;&#61;&#48;&#46;&#50;&#50;&#48;</annotation></semantics></math></span>, and local features reached <span class="engineering-math"><math xmlns="http://www.w3.org/1998/Math/MathML" display="inline"><semantics><mrow><mi>ρ</mi><mo>=</mo><mn>0.289</mn></mrow><annotation encoding="application/x-tex">&#92;&#114;&#104;&#111;&#61;&#48;&#46;&#50;&#56;&#57;</annotation></semantics></math></span>, compared with <span class="engineering-math"><math xmlns="http://www.w3.org/1998/Math/MathML" display="inline"><semantics><mn>0.069</mn><annotation encoding="application/x-tex">&#48;&#46;&#48;&#54;&#57;</annotation></semantics></math></span> for CP. Both ESM models recovered 18 reference Top30 members, compared with 12 for the structural representation.

| Representation and model | Spearman <span class="engineering-math"><math xmlns="http://www.w3.org/1998/Math/MathML" display="inline"><semantics><mi>ρ</mi><annotation encoding="application/x-tex">&#92;&#114;&#104;&#111;</annotation></semantics></math></span> | Top30 recovery |
|---|---:|---:|
| CP features + ridge regression | 0.069 | 12/30 |
| Frozen global ESM features + ridge regression | 0.220 | 18/30 |
| Frozen local ESM features + ridge regression | 0.289 | 18/30 |

Ranking agreement remained modest, and these aggregate comparisons left the contribution of substitution identity unresolved. A more explicit separation of position, residue identity and evolutionary preference was needed to guide the architecture.

##### Learn {#model-puf-cycle-02-learn}

We adopted sequence-derived features as the main predictive route and removed per-candidate AlphaFold 3 inference from ranking. The local ESM result supported retaining sequence-context information. We then tested explicit amino-acid features alongside a pretrained mutation score to identify complementary information that could be combined in one model.

#### **Cycle 3**: Adding evolutionary priors {#model-puf-cycle-03 .engineering-cycle-title}

##### Design {#model-puf-cycle-03-design}

Mutation position, replacement identity and evolutionary preference describe different aspects of a substitution. Position alone omits the replacement amino acid, while an ESM-2 score requires calibration to the specificity task. We compared these inputs separately and built a joint model from their complementary information.

##### Build {#model-puf-cycle-03-build}

Adapting the evolutionary-plus-assay strategy of Hsu et al. (2022), we combined reference-centred amino-acid one-hot features with a frozen ESM-2 masked mutation score. Its <span class="engineering-math"><math xmlns="http://www.w3.org/1998/Math/MathML" display="inline"><semantics><mrow><mn>493</mn><mo>×</mo><mn>20</mn></mrow><annotation encoding="application/x-tex">&#52;&#57;&#51;&#92;&#116;&#105;&#109;&#101;&#115;&#50;&#48;</annotation></semantics></math></span> encoding assigned <span class="engineering-math"><math xmlns="http://www.w3.org/1998/Math/MathML" display="inline"><semantics><mrow><mi>−</mi><mn>1</mn></mrow><annotation encoding="application/x-tex">&#45;&#49;</annotation></semantics></math></span> to the reference residue and <span class="engineering-math"><math xmlns="http://www.w3.org/1998/Math/MathML" display="inline"><semantics><mrow><mi>+</mi><mn>1</mn></mrow><annotation encoding="application/x-tex">&#43;&#49;</annotation></semantics></math></span> to the replacement at each mutated position. For mutation set <span class="engineering-math"><math xmlns="http://www.w3.org/1998/Math/MathML" display="inline"><semantics><mi>M</mi><annotation encoding="application/x-tex">&#77;</annotation></semantics></math></span>, the score was:

<div class="engineering-equation"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><mi>s</mi><mo stretchy="false" form="prefix">(</mo><mi>a</mi><mo stretchy="false" form="postfix">)</mo><mo>=</mo><munder><mo>∑</mo><mrow><mi>i</mi><mo>∈</mo><mi>M</mi></mrow></munder><mrow><mo stretchy="true" form="prefix">[</mo><mi mathvariant="normal">log</mi><mi>p</mi><mo stretchy="false" form="prefix">(</mo><msub><mi>a</mi><mi>i</mi></msub><mo>∣</mo><msub><mi>a</mi><mrow><mrow><mi mathvariant="normal">r</mi><mi mathvariant="normal">e</mi><mi mathvariant="normal">f</mi></mrow><mo>,</mo><mi>i</mi><mo>←</mo><mo stretchy="false" form="prefix">[</mo><mrow><mi mathvariant="normal">M</mi><mi mathvariant="normal">A</mi><mi mathvariant="normal">S</mi><mi mathvariant="normal">K</mi></mrow><mo stretchy="false" form="postfix">]</mo></mrow></msub><mo stretchy="false" form="postfix">)</mo><mo>−</mo><mi mathvariant="normal">log</mi><mi>p</mi><mo stretchy="false" form="prefix">(</mo><msub><mi>a</mi><mrow><mrow><mi mathvariant="normal">r</mi><mi mathvariant="normal">e</mi><mi mathvariant="normal">f</mi></mrow><mo>,</mo><mi>i</mi></mrow></msub><mo>∣</mo><msub><mi>a</mi><mrow><mrow><mi mathvariant="normal">r</mi><mi mathvariant="normal">e</mi><mi mathvariant="normal">f</mi></mrow><mo>,</mo><mi>i</mi><mo>←</mo><mo stretchy="false" form="prefix">[</mo><mrow><mi mathvariant="normal">M</mi><mi mathvariant="normal">A</mi><mi mathvariant="normal">S</mi><mi mathvariant="normal">K</mi></mrow><mo stretchy="false" form="postfix">]</mo></mrow></msub><mo stretchy="false" form="postfix">)</mo><mo stretchy="true" form="postfix">]</mo></mrow><mi>.</mi></mrow><annotation encoding="application/x-tex">&#10;&#115;&#40;&#97;&#41;&#61;&#92;&#115;&#117;&#109;&#95;&#123;&#105;&#92;&#105;&#110;&#32;&#77;&#125;&#92;&#108;&#101;&#102;&#116;&#91;&#10;&#92;&#108;&#111;&#103;&#32;&#112;&#40;&#97;&#95;&#105;&#92;&#109;&#105;&#100;&#32;&#97;&#95;&#123;&#92;&#109;&#97;&#116;&#104;&#114;&#109;&#123;&#114;&#101;&#102;&#125;&#44;&#105;&#92;&#108;&#101;&#102;&#116;&#97;&#114;&#114;&#111;&#119;&#91;&#92;&#109;&#97;&#116;&#104;&#114;&#109;&#123;&#77;&#65;&#83;&#75;&#125;&#93;&#125;&#41;&#10;&#45;&#92;&#108;&#111;&#103;&#32;&#112;&#40;&#97;&#95;&#123;&#92;&#109;&#97;&#116;&#104;&#114;&#109;&#123;&#114;&#101;&#102;&#125;&#44;&#105;&#125;&#92;&#109;&#105;&#100;&#32;&#97;&#95;&#123;&#92;&#109;&#97;&#116;&#104;&#114;&#109;&#123;&#114;&#101;&#102;&#125;&#44;&#105;&#92;&#108;&#101;&#102;&#116;&#97;&#114;&#114;&#111;&#119;&#91;&#92;&#109;&#97;&#116;&#104;&#114;&#109;&#123;&#77;&#65;&#83;&#75;&#125;&#93;&#125;&#41;&#10;&#92;&#114;&#105;&#103;&#104;&#116;&#93;&#46;&#10;</annotation></semantics></math></div>

Each endpoint used ridge regression (Hoerl & Kennard, 1970), its labelled training set <span class="engineering-math"><math xmlns="http://www.w3.org/1998/Math/MathML" display="inline"><semantics><msub><mi>O</mi><mi>j</mi></msub><annotation encoding="application/x-tex">&#79;&#95;&#106;</annotation></semantics></math></span> and training-derived score standardization:

<div class="engineering-equation"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><mo stretchy="false" form="prefix">(</mo><msub><mover><mi>β</mi><mo accent="true">̂</mo></mover><mi>j</mi></msub><mo>,</mo><msub><mover><mi>b</mi><mo accent="true">̂</mo></mover><mi>j</mi></msub><mo stretchy="false" form="postfix">)</mo><mo>=</mo><munder><mrow><mrow><mi mathvariant="normal">arg</mi><mo>⁡</mo></mrow><mi mathvariant="normal">min</mi></mrow><mrow><mi>β</mi><mo>,</mo><mi>b</mi></mrow></munder><mrow><mo stretchy="true" form="prefix">{</mo><munder><mo>∑</mo><mrow><mi>n</mi><mo>∈</mo><msub><mi>O</mi><mi>j</mi></msub></mrow></munder><mo stretchy="false" form="prefix">(</mo><msub><mi>C</mi><mrow><mi>n</mi><mi>j</mi></mrow></msub><mo>−</mo><mi>b</mi><mo>−</mo><msubsup><mi>x</mi><mi>n</mi><mi mathvariant="sans-serif">𝖳</mi></msubsup><mi>β</mi><msup><mo stretchy="false" form="postfix">)</mo><mn>2</mn></msup><mo>+</mo><mi>λ</mi><msubsup><mrow><mo stretchy="true" form="prefix">‖</mo><mi>β</mi><mo stretchy="true" form="postfix">‖</mo></mrow><mn>2</mn><mn>2</mn></msubsup><mo stretchy="true" form="postfix">}</mo></mrow><mo>,</mo><mspace width="2.0em" /><mi>x</mi><mo>=</mo><mo stretchy="false" form="prefix">[</mo><msub><mi>x</mi><mrow><mi mathvariant="normal">o</mi><mi mathvariant="normal">n</mi><mi mathvariant="normal">e</mi><mi mathvariant="normal">h</mi><mi mathvariant="normal">o</mi><mi mathvariant="normal">t</mi></mrow></msub><mo>,</mo><mspace width="0.167em" /><mi>w</mi><mover><mi>s</mi><mo accent="true">̃</mo></mover><mo stretchy="false" form="postfix">]</mo><mi>.</mi></mrow><annotation encoding="application/x-tex">&#10;&#40;&#92;&#104;&#97;&#116;&#92;&#98;&#101;&#116;&#97;&#95;&#106;&#44;&#92;&#104;&#97;&#116;&#32;&#98;&#95;&#106;&#41;&#61;&#92;&#117;&#110;&#100;&#101;&#114;&#115;&#101;&#116;&#123;&#92;&#98;&#101;&#116;&#97;&#44;&#98;&#125;&#123;&#92;&#97;&#114;&#103;&#92;&#109;&#105;&#110;&#125;&#10;&#92;&#108;&#101;&#102;&#116;&#92;&#123;&#92;&#115;&#117;&#109;&#95;&#123;&#110;&#92;&#105;&#110;&#32;&#79;&#95;&#106;&#125;&#40;&#67;&#95;&#123;&#110;&#106;&#125;&#45;&#98;&#45;&#120;&#95;&#110;&#94;&#123;&#92;&#109;&#97;&#116;&#104;&#115;&#102;&#32;&#84;&#125;&#92;&#98;&#101;&#116;&#97;&#41;&#94;&#50;&#43;&#92;&#108;&#97;&#109;&#98;&#100;&#97;&#92;&#108;&#86;&#101;&#114;&#116;&#92;&#98;&#101;&#116;&#97;&#92;&#114;&#86;&#101;&#114;&#116;&#95;&#50;&#94;&#50;&#92;&#114;&#105;&#103;&#104;&#116;&#92;&#125;&#44;&#10;&#92;&#113;&#113;&#117;&#97;&#100;&#32;&#120;&#61;&#91;&#120;&#95;&#123;&#92;&#109;&#97;&#116;&#104;&#114;&#109;&#123;&#111;&#110;&#101;&#104;&#111;&#116;&#125;&#125;&#44;&#92;&#44;&#119;&#92;&#119;&#105;&#100;&#101;&#116;&#105;&#108;&#100;&#101;&#123;&#115;&#125;&#93;&#46;&#10;</annotation></semantics></math></div>

Missing endpoints were masked during fitting, and identical sequences remained in the same group. Inner grouped validation selected <span class="engineering-math"><math xmlns="http://www.w3.org/1998/Math/MathML" display="inline"><semantics><mi>λ</mi><annotation encoding="application/x-tex">&#92;&#108;&#97;&#109;&#98;&#100;&#97;</annotation></semantics></math></span> and score weight <span class="engineering-math"><math xmlns="http://www.w3.org/1998/Math/MathML" display="inline"><semantics><mi>w</mi><annotation encoding="application/x-tex">&#119;</annotation></semantics></math></span>; outer holdouts assessed predictions.

##### Test {#model-puf-cycle-03-test}

**The joint model led the feature ablation, with Spearman <span class="engineering-math"><math xmlns="http://www.w3.org/1998/Math/MathML" display="inline"><semantics><mrow><mi>ρ</mi><mo>=</mo><mn>0.405</mn></mrow><annotation encoding="application/x-tex">&#92;&#114;&#104;&#111;&#61;&#48;&#46;&#52;&#48;&#53;</annotation></semantics></math></span> and Kendall <span class="engineering-math"><math xmlns="http://www.w3.org/1998/Math/MathML" display="inline"><semantics><mrow><mi>τ</mi><mo>=</mo><mn>0.264</mn></mrow><annotation encoding="application/x-tex">&#92;&#116;&#97;&#117;&#61;&#48;&#46;&#50;&#54;&#52;</annotation></semantics></math></span>.** Position-only features gave <span class="engineering-math"><math xmlns="http://www.w3.org/1998/Math/MathML" display="inline"><semantics><mrow><mi>ρ</mi><mo>=</mo><mn>0.155</mn></mrow><annotation encoding="application/x-tex">&#92;&#114;&#104;&#111;&#61;&#48;&#46;&#49;&#53;&#53;</annotation></semantics></math></span> and Top30 recovery of 14; amino-acid one-hot features reached <span class="engineering-math"><math xmlns="http://www.w3.org/1998/Math/MathML" display="inline"><semantics><mn>0.292</mn><annotation encoding="application/x-tex">&#48;&#46;&#50;&#57;&#50;</annotation></semantics></math></span> and recovered 16. Direct ESM-2 scores gave <span class="engineering-math"><math xmlns="http://www.w3.org/1998/Math/MathML" display="inline"><semantics><mrow><mi>ρ</mi><mo>=</mo><mi>−</mi><mn>0.265</mn></mrow><annotation encoding="application/x-tex">&#92;&#114;&#104;&#111;&#61;&#45;&#48;&#46;&#50;&#54;&#53;</annotation></semantics></math></span> and recovered 9 members, while regression on the score alone reached <span class="engineering-math"><math xmlns="http://www.w3.org/1998/Math/MathML" display="inline"><semantics><mn>0.098</mn><annotation encoding="application/x-tex">&#48;&#46;&#48;&#57;&#56;</annotation></semantics></math></span>.

![Spearman correlations for the five feature models, led by the combined model at 0.405.](/assets/images/engineering-dry-dbtl/module-2-image-01.png){.engineering-figure style="--engineering-figure-width:540px;--engineering-detail-width:960px"}

*Figure 2.1 | Matched feature ablation identified complementary contributions from substitution identity and the supervised evolutionary score.*

At the retrospectively reported Top30 cutoff, the joint model recovered **20 members, a 66.7% hit rate and 1.47-fold enrichment** over random selection. Random recovery was 13.64 on average; Top15 recovery was 6 against a random expectation of 3.41.

![Top5, Top15 and Top30 recovery of 1, 6 and 20 compared with random selection.](/assets/images/engineering-dry-dbtl/module-2-image-02.png){.engineering-figure style="--engineering-figure-width:540px;--engineering-detail-width:960px"}

*Figure 2.2 | The joint model enriched candidate lists within the development cohort relative to random overlap, calculated as <span class="engineering-math"><math xmlns="http://www.w3.org/1998/Math/MathML" display="inline"><semantics><mrow><msup><mi>K</mi><mn>2</mn></msup><mi>/</mi><mn>66</mn></mrow><annotation encoding="application/x-tex">&#75;&#94;&#50;&#47;&#54;&#54;</annotation></semantics></math></span>.*

Performance dropped when mutation positions were held out, exposing reliance on position-specific information. Top5 recovery also remained at 1, identifying limited resolution among the highest-ranked candidates.

##### Learn {#model-puf-cycle-03-learn}

We retained the combined architecture for prioritization within the labelled domain. Project labels calibrated the evolutionary prior, while position and residue identity supplied complementary information. Representation depth became the next adjustable component; unseen positions also motivated a separate route for candidate exploration.

#### **Cycle 4**: Choosing an ESM-2 layer {#model-puf-cycle-04 .engineering-cycle-title}

##### Design {#model-puf-cycle-04-design}

Work on protein language model transfer learning motivated examining how features vary with representation depth (Li et al., 2024). The final ESM-2 layer is optimized for the pretraining prediction objective. PUF specificity could depend on information represented at a different depth. We isolated the layer choice while keeping the joint features and downstream regression architecture fixed.

##### Build {#model-puf-cycle-04-build}

We read layers 1–12, masked each mutated position in the reference sequence, and applied the same frozen vocabulary head:

<div class="engineering-equation"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><msub><mi>s</mi><mi>ℓ</mi></msub><mo stretchy="false" form="prefix">(</mo><mi>a</mi><mo stretchy="false" form="postfix">)</mo><mo>=</mo><munder><mo>∑</mo><mrow><mi>i</mi><mo>∈</mo><mi>M</mi></mrow></munder><mrow><mo stretchy="true" form="prefix">[</mo><mi mathvariant="normal">log</mi><msub><mi>p</mi><mi>ℓ</mi></msub><mo stretchy="false" form="prefix">(</mo><msub><mi>a</mi><mi>i</mi></msub><mo>∣</mo><msub><mi>a</mi><mrow><mrow><mi mathvariant="normal">r</mi><mi mathvariant="normal">e</mi><mi mathvariant="normal">f</mi></mrow><mo>,</mo><mi>i</mi><mo>←</mo><mo stretchy="false" form="prefix">[</mo><mrow><mi mathvariant="normal">M</mi><mi mathvariant="normal">A</mi><mi mathvariant="normal">S</mi><mi mathvariant="normal">K</mi></mrow><mo stretchy="false" form="postfix">]</mo></mrow></msub><mo stretchy="false" form="postfix">)</mo><mo>−</mo><mi mathvariant="normal">log</mi><msub><mi>p</mi><mi>ℓ</mi></msub><mo stretchy="false" form="prefix">(</mo><msub><mi>a</mi><mrow><mrow><mi mathvariant="normal">r</mi><mi mathvariant="normal">e</mi><mi mathvariant="normal">f</mi></mrow><mo>,</mo><mi>i</mi></mrow></msub><mo>∣</mo><msub><mi>a</mi><mrow><mrow><mi mathvariant="normal">r</mi><mi mathvariant="normal">e</mi><mi mathvariant="normal">f</mi></mrow><mo>,</mo><mi>i</mi><mo>←</mo><mo stretchy="false" form="prefix">[</mo><mrow><mi mathvariant="normal">M</mi><mi mathvariant="normal">A</mi><mi mathvariant="normal">S</mi><mi mathvariant="normal">K</mi></mrow><mo stretchy="false" form="postfix">]</mo></mrow></msub><mo stretchy="false" form="postfix">)</mo><mo stretchy="true" form="postfix">]</mo></mrow><mo>,</mo><mspace width="2.0em" /><mi>ℓ</mi><mo>∈</mo><mo stretchy="false" form="prefix">{</mo><mn>1</mn><mo>,</mo><mi>…</mi><mo>,</mo><mn>12</mn><mo stretchy="false" form="postfix">}</mo><mi>.</mi></mrow><annotation encoding="application/x-tex">&#10;&#115;&#95;&#123;&#92;&#101;&#108;&#108;&#125;&#40;&#97;&#41;&#61;&#92;&#115;&#117;&#109;&#95;&#123;&#105;&#92;&#105;&#110;&#32;&#77;&#125;&#92;&#108;&#101;&#102;&#116;&#91;&#10;&#92;&#108;&#111;&#103;&#32;&#112;&#95;&#123;&#92;&#101;&#108;&#108;&#125;&#40;&#97;&#95;&#105;&#92;&#109;&#105;&#100;&#32;&#97;&#95;&#123;&#92;&#109;&#97;&#116;&#104;&#114;&#109;&#123;&#114;&#101;&#102;&#125;&#44;&#105;&#92;&#108;&#101;&#102;&#116;&#97;&#114;&#114;&#111;&#119;&#91;&#92;&#109;&#97;&#116;&#104;&#114;&#109;&#123;&#77;&#65;&#83;&#75;&#125;&#93;&#125;&#41;&#10;&#45;&#92;&#108;&#111;&#103;&#32;&#112;&#95;&#123;&#92;&#101;&#108;&#108;&#125;&#40;&#97;&#95;&#123;&#92;&#109;&#97;&#116;&#104;&#114;&#109;&#123;&#114;&#101;&#102;&#125;&#44;&#105;&#125;&#92;&#109;&#105;&#100;&#32;&#97;&#95;&#123;&#92;&#109;&#97;&#116;&#104;&#114;&#109;&#123;&#114;&#101;&#102;&#125;&#44;&#105;&#92;&#108;&#101;&#102;&#116;&#97;&#114;&#114;&#111;&#119;&#91;&#92;&#109;&#97;&#116;&#104;&#114;&#109;&#123;&#77;&#65;&#83;&#75;&#125;&#93;&#125;&#41;&#10;&#92;&#114;&#105;&#103;&#104;&#116;&#93;&#44;&#92;&#113;&#113;&#117;&#97;&#100;&#32;&#92;&#101;&#108;&#108;&#92;&#105;&#110;&#92;&#123;&#49;&#44;&#92;&#108;&#100;&#111;&#116;&#115;&#44;&#49;&#50;&#92;&#125;&#46;&#10;</annotation></semantics></math></div>

Layers 1–11 passed through the frozen final encoder normalization and vocabulary head; layer 12 used its native normalized output. Each layer's score was paired with identical one-hot features, samples, groups and ridge parameter searches. A nested evaluation selected the layer and regression parameters together within inner validation, testing the complete selection procedure. This separation of model selection from outer evaluation addresses selection bias in cross-validation (Varma & Simon, 2006).

##### Test {#model-puf-cycle-04-test}

**Layer 4 led the retrospective fixed-layer comparison, with Spearman <span class="engineering-math"><math xmlns="http://www.w3.org/1998/Math/MathML" display="inline"><semantics><mrow><mi>ρ</mi><mo>=</mo><mn>0.515</mn></mrow><annotation encoding="application/x-tex">&#92;&#114;&#104;&#111;&#61;&#48;&#46;&#53;&#49;&#53;</annotation></semantics></math></span>, compared with <span class="engineering-math"><math xmlns="http://www.w3.org/1998/Math/MathML" display="inline"><semantics><mn>0.405</mn><annotation encoding="application/x-tex">&#48;&#46;&#52;&#48;&#53;</annotation></semantics></math></span> for layer 12.** Both layers recovered 6/15 and 20/30 members at the Top15 and Top30 cutoffs. The gain was in overall rank correlation, with unchanged recovery at these cutoffs.

![Fixed-layer correlations across twelve ESM-2 layers, with layer 4 at 0.515 and nested layer selection at 0.323.](/assets/images/engineering-dry-dbtl/module-2-image-03.png){.engineering-figure style="--engineering-figure-width:520px;--engineering-detail-width:960px"}

*Figure 2.3 | Layer 4 led the fixed-layer comparison, with the dashed line marking out-of-fold performance after inner-validation layer selection.*

Nested selection reached <span class="engineering-math"><math xmlns="http://www.w3.org/1998/Math/MathML" display="inline"><semantics><mrow><mi>ρ</mi><mo>=</mo><mn>0.323</mn></mrow><annotation encoding="application/x-tex">&#92;&#114;&#104;&#111;&#61;&#48;&#46;&#51;&#50;&#51;</annotation></semantics></math></span>, with Top15 recovery of 4/15 and Top30 recovery of 20/30. Retrospective layer preference and automatic layer selection therefore had different performance profiles. Intermediate outputs served as diagnostic scores through a shared head trained for the final layer.

##### Learn {#model-puf-cycle-04-learn}

Layer 4 became a priority for independent evaluation, while layer 12 remained in the main model. The comparison identified representation depth as a useful design choice and demonstrated the importance of evaluating the selection procedure itself. Exploration beyond positions covered by existing labels called for complementary structural information.

#### **Cycle 5**: Extending scaffold design {#model-puf-cycle-05 .engineering-cycle-title}

##### Design {#model-puf-cycle-05-design}

PUF repeats provide modular RNA recognition, with recognition residues that can be engineered to change sequence preference (Cheong & Hall, 2006; Wang et al., 2002). Training labels mainly covered tripartite recognition motif (TRM) variants, leaving scaffold substitutions and additional TRM positions sparsely represented. The scaffold also shapes the arrangement of recognition residues (Zhao et al., 2018). We introduced structure-conditioned generation to explore these regions alongside the supervised ranker.

##### Build {#model-puf-cycle-05-build}

ProteinMPNN (Dauparas et al., 2022) and LigandMPNN (Dauparas et al., 2025) generated sequences from the same PUF backbone coordinates <span class="engineering-math"><math xmlns="http://www.w3.org/1998/Math/MathML" display="inline"><semantics><mi>B</mi><annotation encoding="application/x-tex">&#66;</annotation></semantics></math></span>. LigandMPNN additionally incorporated the fixed RNA atomic environment <span class="engineering-math"><math xmlns="http://www.w3.org/1998/Math/MathML" display="inline"><semantics><mi>R</mi><annotation encoding="application/x-tex">&#82;</annotation></semantics></math></span>:

<div class="engineering-equation"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><mi>a</mi><mo>∼</mo><msub><mi>p</mi><mrow><mi mathvariant="normal">P</mi><mi mathvariant="normal">r</mi><mi mathvariant="normal">o</mi><mi mathvariant="normal">t</mi><mi mathvariant="normal">e</mi><mi mathvariant="normal">i</mi><mi mathvariant="normal">n</mi><mi mathvariant="normal">M</mi><mi mathvariant="normal">P</mi><mi mathvariant="normal">N</mi><mi mathvariant="normal">N</mi></mrow></msub><mo stretchy="false" form="prefix">(</mo><mi>a</mi><mo>∣</mo><mi>B</mi><mo stretchy="false" form="postfix">)</mo><mo>,</mo><mspace width="2.0em" /><mi>a</mi><mo>∼</mo><msub><mi>p</mi><mrow><mi mathvariant="normal">L</mi><mi mathvariant="normal">i</mi><mi mathvariant="normal">g</mi><mi mathvariant="normal">a</mi><mi mathvariant="normal">n</mi><mi mathvariant="normal">d</mi><mi mathvariant="normal">M</mi><mi mathvariant="normal">P</mi><mi mathvariant="normal">N</mi><mi mathvariant="normal">N</mi></mrow></msub><mo stretchy="false" form="prefix">(</mo><mi>a</mi><mo>∣</mo><mi>B</mi><mo>,</mo><mi>R</mi><mo stretchy="false" form="postfix">)</mo><mi>.</mi></mrow><annotation encoding="application/x-tex">&#10;&#97;&#92;&#115;&#105;&#109;&#32;&#112;&#95;&#123;&#92;&#109;&#97;&#116;&#104;&#114;&#109;&#123;&#80;&#114;&#111;&#116;&#101;&#105;&#110;&#77;&#80;&#78;&#78;&#125;&#125;&#40;&#97;&#92;&#109;&#105;&#100;&#32;&#66;&#41;&#44;&#92;&#113;&#113;&#117;&#97;&#100;&#10;&#97;&#92;&#115;&#105;&#109;&#32;&#112;&#95;&#123;&#92;&#109;&#97;&#116;&#104;&#114;&#109;&#123;&#76;&#105;&#103;&#97;&#110;&#100;&#77;&#80;&#78;&#78;&#125;&#125;&#40;&#97;&#92;&#109;&#105;&#100;&#32;&#66;&#44;&#82;&#41;&#46;&#10;</annotation></semantics></math></div>

Each model generated 10,000 sequences. The global screen selected the most frequent non-reference residue when its frequency exceeded the reference frequency and reached <span class="engineering-math"><math xmlns="http://www.w3.org/1998/Math/MathML" display="inline"><semantics><mn>0.8</mn><annotation encoding="application/x-tex">&#48;&#46;&#56;</annotation></semantics></math></span>. Scaffold screening excluded 36 TRM positions and placed each selected replacement individually into the reference sequence. Exact consensus required both models to nominate the same substitution.

A parallel TRM-only comparison fixed all 457 scaffold residues and generated 10,000 sequences per model. Each nominated TRM substitution was also scored on the reference background, averaging eight shared decoding orders.

##### Test {#model-puf-cycle-05-test}

**The global scaffold screen yielded 81 substitutions and 17 exact consensus nominations**, establishing a candidate set beyond the labelled recognition variants. In the TRM-only comparison, LigandMPNN nominated 10 substitutions and ProteinMPNN nominated none, giving zero exact consensus.

Nine TRM nominations increased both model scores on the reference background. E292Q instead gave changes of **−0.0756 and −0.0200**, exposing a difference between frequency in multi-substitution samples and preference for an isolated replacement.

![Reference-background single-substitution score changes, with nine positive in both models and E292Q negative in both.](/assets/images/engineering-dry-dbtl/module-2-image-04.png){.engineering-figure style="--engineering-figure-width:540px;--engineering-detail-width:960px"}

*Figure 2.4 | Reference-background scoring distinguished nine jointly positive TRM nominations from the background-dependent E292Q proposal.*

Inspection of structural annotations identified a separate screening defect: the intended loop-specific route was inactive, leaving the scaffold output equivalent to the global-only rule.

##### Learn {#model-puf-cycle-05-learn}

Inverse folding supplied new candidate hypotheses, with model consensus and reference-background scores describing different aspects of support. The screening defect provided a concrete correction: restore the intended loop treatment using complete structural annotation. Single-substitution scores remained a diagnostic alongside the nomination rules.

#### **Cycle 6**: Restoring loop-specific screening {#model-puf-cycle-06 .engineering-cycle-title}

##### Design {#model-puf-cycle-06-design}

The global-only output omitted candidates that could satisfy the intended loop criterion. Incomplete structural annotation had prevented this route from contributing, making the implemented screen narrower than its design. We addressed the annotation and selection logic while preserving the established frequency thresholds and generated samples.

##### Build {#model-puf-cycle-06-build}

The screening strategy drew on inverse folding with structural and evolutionary constraints (Fei et al., 2025). We completed PyDSSP three-state annotation and recognized its loop code as `-`. This restored the existing loop threshold of <span class="engineering-math"><math xmlns="http://www.w3.org/1998/Math/MathML" display="inline"><semantics><mn>0.5</mn><annotation encoding="application/x-tex">&#48;&#46;&#53;</annotation></semantics></math></span> alongside the global threshold of <span class="engineering-math"><math xmlns="http://www.w3.org/1998/Math/MathML" display="inline"><semantics><mn>0.8</mn><annotation encoding="application/x-tex">&#48;&#46;&#56;</annotation></semantics></math></span>. For the most frequent non-reference replacement <span class="engineering-math"><math xmlns="http://www.w3.org/1998/Math/MathML" display="inline"><semantics><mi>a</mi><annotation encoding="application/x-tex">&#97;</annotation></semantics></math></span> at position <span class="engineering-math"><math xmlns="http://www.w3.org/1998/Math/MathML" display="inline"><semantics><mi>i</mi><annotation encoding="application/x-tex">&#105;</annotation></semantics></math></span>, the complete rule was:

<div class="engineering-equation"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><mrow><mi mathvariant="normal">retain</mi><mo>⁡</mo></mrow><mo stretchy="false" form="prefix">(</mo><mi>i</mi><mo>→</mo><mi>a</mi><mo stretchy="false" form="postfix">)</mo><mo>⇔</mo><msub><mi>f</mi><mi>i</mi></msub><mo stretchy="false" form="prefix">(</mo><mi>a</mi><mo stretchy="false" form="postfix">)</mo><mo>&gt;</mo><msub><mi>f</mi><mi>i</mi></msub><mo stretchy="false" form="prefix">(</mo><msub><mi>a</mi><mrow><mrow><mi mathvariant="normal">r</mi><mi mathvariant="normal">e</mi><mi mathvariant="normal">f</mi></mrow><mo>,</mo><mi>i</mi></mrow></msub><mo stretchy="false" form="postfix">)</mo><mspace width="0.278em" /><mo>∧</mo><mspace width="0.278em" /><mrow><mo stretchy="true" form="prefix">[</mo><msub><mi>f</mi><mi>i</mi></msub><mo stretchy="false" form="prefix">(</mo><mi>a</mi><mo stretchy="false" form="postfix">)</mo><mo>≥</mo><mn>0.8</mn><mspace width="0.278em" /><mo>∨</mo><mspace width="0.278em" /><mrow><mo stretchy="true" form="prefix">(</mo><mi>i</mi><mo>∈</mo><mi mathvariant="script">ℒ</mi><mspace width="0.278em" /><mo>∧</mo><mspace width="0.278em" /><msub><mi>f</mi><mi>i</mi></msub><mo stretchy="false" form="prefix">(</mo><mi>a</mi><mo stretchy="false" form="postfix">)</mo><mo>≥</mo><mn>0.5</mn><mo stretchy="true" form="postfix">)</mo></mrow><mo stretchy="true" form="postfix">]</mo></mrow><mo>,</mo></mrow><annotation encoding="application/x-tex">&#10;&#92;&#111;&#112;&#101;&#114;&#97;&#116;&#111;&#114;&#110;&#97;&#109;&#101;&#123;&#114;&#101;&#116;&#97;&#105;&#110;&#125;&#40;&#105;&#92;&#116;&#111;&#32;&#97;&#41;&#10;&#92;&#105;&#102;&#102;&#32;&#102;&#95;&#105;&#40;&#97;&#41;&#62;&#102;&#95;&#105;&#40;&#97;&#95;&#123;&#92;&#109;&#97;&#116;&#104;&#114;&#109;&#123;&#114;&#101;&#102;&#125;&#44;&#105;&#125;&#41;&#10;&#92;&#59;&#92;&#108;&#97;&#110;&#100;&#92;&#59;&#10;&#92;&#108;&#101;&#102;&#116;&#91;&#102;&#95;&#105;&#40;&#97;&#41;&#92;&#103;&#101;&#48;&#46;&#56;&#92;&#59;&#92;&#108;&#111;&#114;&#92;&#59;&#10;&#92;&#108;&#101;&#102;&#116;&#40;&#105;&#92;&#105;&#110;&#92;&#109;&#97;&#116;&#104;&#99;&#97;&#108;&#32;&#76;&#92;&#59;&#92;&#108;&#97;&#110;&#100;&#92;&#59;&#102;&#95;&#105;&#40;&#97;&#41;&#92;&#103;&#101;&#48;&#46;&#53;&#92;&#114;&#105;&#103;&#104;&#116;&#41;&#92;&#114;&#105;&#103;&#104;&#116;&#93;&#44;&#10;</annotation></semantics></math></div>

where <span class="engineering-math"><math xmlns="http://www.w3.org/1998/Math/MathML" display="inline"><semantics><msub><mi>f</mi><mi>i</mi></msub><annotation encoding="application/x-tex">&#102;&#95;&#105;</annotation></semantics></math></span> is the sampled residue frequency and <span class="engineering-math"><math xmlns="http://www.w3.org/1998/Math/MathML" display="inline"><semantics><mi mathvariant="script">ℒ</mi><annotation encoding="application/x-tex">&#92;&#109;&#97;&#116;&#104;&#99;&#97;&#108;&#32;&#76;</annotation></semantics></math></span> contains annotated loop positions. We reapplied the rule to the same 10,000 samples per model. The screen again excluded all 36 TRM positions and exported individual substitutions on the reference background, retaining exact substitution identity for consensus comparisons.

##### Test {#model-puf-cycle-06-test}

**Completing the structural screen retained all 81 existing scaffold nominations and added 47.** The final set contained **128 substitutions across 125 positions, including 46 exact two-model consensus substitutions**, compared with 17 consensus substitutions under the global-only rule.

![Scaffold screening expanded from 81 substitutions and 17 consensus nominations to 128 substitutions at 125 positions and 46 consensus nominations.](/assets/images/engineering-dry-dbtl/module-2-image-05.png){.engineering-figure style="--engineering-figure-width:620px;--engineering-detail-width:960px"}

*Figure 2.5 | Complete structural annotation restored the loop-specific route and expanded both scaffold nominations and exact two-model consensus.*

Every exported scaffold candidate preserved the TRM residues and contained one replacement. The expanded candidate set therefore reflected the corrected structural screen applied to the same generated sequence pool.

##### Learn {#model-puf-cycle-06-learn}

The final workflow combined a supervised ranker with structure-conditioned exploration and explicit candidate-screening rules. PUF-ESM prioritized sequences within the labelled domain; inverse folding proposed scaffold and additional TRM substitutions. Complete annotation made the structural rule operate as intended. Combining these proposals with existing TRM backgrounds and returning new functional labels would extend the next round of model development.

#### References {#model-puf-references}

1. Abramson, J., Adler, J., Dunger, J., Evans, R., Green, T., Pritzel, A., Ronneberger, O., Willmore, L., Ballard, A. J., Bambrick, J., Bodenstein, S. W., Evans, D. A., Hung, C.-C., O’Neill, M., Reiman, D., Tunyasuvunakool, K., Wu, Z., Žemgulytė, A., Arvaniti, E., … Jumper, J. M. (2024). Accurate structure prediction of biomolecular interactions with AlphaFold 3. *Nature, 630*(8016), 493–500. [doi: 10.1038/s41586-024-07487-w](<https://doi.org/10.1038/s41586-024-07487-w>)

2. Cheong, C.-G., & Hall, T. M. T. (2006). Engineering RNA sequence specificity of Pumilio repeats. *Proceedings of the National Academy of Sciences of the United States of America, 103*(37), 13635–13639. [doi: 10.1073/pnas.0606294103](<https://doi.org/10.1073/pnas.0606294103>)

3. Dauparas, J., Anishchenko, I., Bennett, N., Bai, H., Ragotte, R. J., Milles, L. F., Wicky, B. I. M., Courbet, A., de Haas, R. J., Bethel, N., Leung, P. J. Y., Huddy, T. F., Pellock, S., Tischer, D., Chan, F., Koepnick, B., Nguyen, H., Kang, A., Sankaran, B., … Baker, D. (2022). Robust deep learning–based protein sequence design using ProteinMPNN. *Science, 378*(6615), 49–56. [doi: 10.1126/science.add2187](<https://doi.org/10.1126/science.add2187>)

4. Dauparas, J., Lee, G. R., Pecoraro, R., An, L., Anishchenko, I., Glasscock, C., & Baker, D. (2025). Atomic context-conditioned protein sequence design using LigandMPNN. *Nature Methods, 22*(4), 717–723. [doi: 10.1038/s41592-025-02626-1](<https://doi.org/10.1038/s41592-025-02626-1>)

5. Fei, H., Li, Y., Liu, Y., Wei, J., Chen, A., & Gao, C. (2025). Advancing protein evolution with inverse folding models integrating structural and evolutionary constraints. *Cell, 188*(17), 4674–4692.e19. [doi: 10.1016/j.cell.2025.06.014](<https://doi.org/10.1016/j.cell.2025.06.014>)

6. Hoerl, A. E., & Kennard, R. W. (1970). Ridge regression: Biased estimation for nonorthogonal problems. *Technometrics, 12*(1), 55–67. [doi: 10.1080/00401706.1970.10488634](<https://doi.org/10.1080/00401706.1970.10488634>)

7. Hsu, C., Nisonoff, H., Fannjiang, C., & Listgarten, J. (2022). Learning protein fitness models from evolutionary and assay-labeled data. *Nature Biotechnology, 40*(7), 1114–1122. [doi: 10.1038/s41587-021-01146-5](<https://doi.org/10.1038/s41587-021-01146-5>)

8. Li, F.-Z., Amini, A. P., Yue, Y., Yang, K. K., & Lu, A. X. (2024). Feature reuse and scaling: Understanding transfer learning with protein language models. In R. Salakhutdinov, Z. Kolter, K. Heller, A. Weller, N. Oliver, J. Scarlett, & F. Berkenkamp (Eds.), *Proceedings of the 41st International Conference on Machine Learning* (Vol. 235, pp. 27351–27375). PMLR. [Source](https://proceedings.mlr.press/v235/li24a.html).

9. Lin, Z., Akin, H., Rao, R., Hie, B., Zhu, Z., Lu, W., Smetanin, N., Verkuil, R., Kabeli, O., Shmueli, Y., dos Santos Costa, A., Fazel-Zarandi, M., Sercu, T., Candido, S., & Rives, A. (2023). Evolutionary-scale prediction of atomic-level protein structure with a language model. *Science, 379*(6637), 1123–1130. [doi: 10.1126/science.ade2574](<https://doi.org/10.1126/science.ade2574>)

10. Varma, S., & Simon, R. (2006). Bias in error estimation when using cross-validation for model selection. *BMC Bioinformatics, 7*, Article 91. [doi: 10.1186/1471-2105-7-91](<https://doi.org/10.1186/1471-2105-7-91>)

11. Wang, X., McLachlan, J., Zamore, P. D., & Hall, T. M. T. (2002). Modular recognition of RNA by a human Pumilio-homology domain. *Cell, 110*(4), 501–512. [doi: 10.1016/S0092-8674(02)00873-5](<https://doi.org/10.1016/S0092-8674(02)00873-5>)

12. Zhao, Y.-Y., Mao, M.-W., Zhang, W.-J., Wang, J., Li, H.-T., Yang, Y., Wang, Z., & Wu, J.-W. (2018). Expanding RNA binding specificity and affinity of engineered PUF domains. *Nucleic Acids Research, 46*(9), 4771–4782. [doi: 10.1093/nar/gky134](<https://doi.org/10.1093/nar/gky134>)


---

### APOBEC {#model-apobec .engineering-chapter-title}

Refining catalytic-module structural models
{.engineering-chapter-subtitle}

#### Overview {#model-apobec-overview}

Module 3 used structural modelling to organize APOBEC variants for matched comparisons of substrate preference and activity. Published PUF–APOBEC fusion designs provide the platform context for examining recognition and catalytic domains together (Wang et al., 2002; Han et al., 2022, 2025). Wet-lab inputs included parent and variant sequences, functional labels, and requests for same-site, combination and sequence-background controls. These inputs defined the comparisons returned by the model.

Our modelling framework combined **contact decomposition, parent-corrected substrate differences, parallel complex and protein-only predictions, and contact-network clustering**. The revisions addressed ambiguous contact types, parental substrate effects, RNA-dependent deviations and unstable structural groups. The resulting contact maps and structural branches guided candidate combinations and mechanistic controls.

[View the complete Module 3 model.](https://github.com/pdx12320/WIKI_SUSTech-BIO/blob/main/wiki/components/model/module3.html)

#### **Cycle 1**: Interpreting predicted contacts {#model-apobec-cycle-01 .engineering-cycle-title}

##### Design {#model-apobec-cycle-01-design}

Our initial distance-based analysis identified residues close to RNA, but proximity combined several different interactions. Side-chain recognition of a base and backbone support of the RNA were counted together. This obscured which contacts could inform comparisons at the +1 nucleotide.

We therefore asked how the parent responded to a controlled +1-base substitution. The model needed both chemically interpretable contact categories and a continuous description of the predicted interface.

##### Build {#model-apobec-cycle-01-build}

We modelled the parent with GUGCGCG and GUGCACG, which differ only at +1. AUGCAGC provided an additional flanking-context comparison. Coordinate-based contacts were separated by protein side chain or backbone and RNA base or sugar–phosphate backbone.

We also extracted contact probability (CP) from AlphaFold 3 outputs, taking the larger directional value for each protein-residue–RNA-nucleotide pair:

<div class="engineering-equation"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><msub><mover><mrow><mi>C</mi><mi>P</mi></mrow><mo accent="true">¯</mo></mover><mrow><mi>v</mi><mo>,</mo><mi>r</mi><mo>,</mo><mi>i</mi></mrow></msub><mo>=</mo><mfrac><mn>1</mn><msub><mi>N</mi><mrow><mi>v</mi><mo>,</mo><mi>r</mi></mrow></msub></mfrac><munderover><mo>∑</mo><mrow><mi>m</mi><mo>=</mo><mn>1</mn></mrow><msub><mi>N</mi><mrow><mi>v</mi><mo>,</mo><mi>r</mi></mrow></msub></munderover><mrow><mi mathvariant="normal">max</mi><mo>⁡</mo></mrow><mrow><mo stretchy="true" form="prefix">(</mo><msubsup><mi>P</mi><mrow><mi>i</mi><mo>,</mo><mi>+</mi><mn>1</mn></mrow><mrow><mo stretchy="false" form="prefix">(</mo><mi>m</mi><mo stretchy="false" form="postfix">)</mo></mrow></msubsup><mo>,</mo><msubsup><mi>P</mi><mrow><mi>+</mi><mn>1</mn><mo>,</mo><mi>i</mi></mrow><mrow><mo stretchy="false" form="prefix">(</mo><mi>m</mi><mo stretchy="false" form="postfix">)</mo></mrow></msubsup><mo stretchy="true" form="postfix">)</mo></mrow><mo>,</mo><mspace width="2.0em" /><mi mathvariant="normal">Δ</mi><mi>C</mi><msub><mi>P</mi><mrow><mi>v</mi><mo>,</mo><mi>i</mi></mrow></msub><mo>=</mo><msub><mover><mrow><mi>C</mi><mi>P</mi></mrow><mo accent="true">¯</mo></mover><mrow><mi>v</mi><mo>,</mo><mrow><mi mathvariant="normal">G</mi><mi mathvariant="normal">C</mi><mi mathvariant="normal">A</mi></mrow><mo>,</mo><mi>i</mi></mrow></msub><mo>−</mo><msub><mover><mrow><mi>C</mi><mi>P</mi></mrow><mo accent="true">¯</mo></mover><mrow><mi>v</mi><mo>,</mo><mrow><mi mathvariant="normal">G</mi><mi mathvariant="normal">C</mi><mi mathvariant="normal">G</mi></mrow><mo>,</mo><mi>i</mi></mrow></msub><mi>.</mi></mrow><annotation encoding="application/x-tex">&#10;&#92;&#111;&#118;&#101;&#114;&#108;&#105;&#110;&#101;&#123;&#67;&#80;&#125;&#95;&#123;&#118;&#44;&#114;&#44;&#105;&#125;&#10;&#61;&#92;&#102;&#114;&#97;&#99;&#123;&#49;&#125;&#123;&#78;&#95;&#123;&#118;&#44;&#114;&#125;&#125;&#92;&#115;&#117;&#109;&#95;&#123;&#109;&#61;&#49;&#125;&#94;&#123;&#78;&#95;&#123;&#118;&#44;&#114;&#125;&#125;&#10;&#92;&#109;&#97;&#120;&#92;&#108;&#101;&#102;&#116;&#40;&#80;&#94;&#123;&#40;&#109;&#41;&#125;&#95;&#123;&#105;&#44;&#43;&#49;&#125;&#44;&#80;&#94;&#123;&#40;&#109;&#41;&#125;&#95;&#123;&#43;&#49;&#44;&#105;&#125;&#92;&#114;&#105;&#103;&#104;&#116;&#41;&#44;&#10;&#92;&#113;&#113;&#117;&#97;&#100;&#10;&#92;&#68;&#101;&#108;&#116;&#97;&#32;&#67;&#80;&#95;&#123;&#118;&#44;&#105;&#125;&#10;&#61;&#92;&#111;&#118;&#101;&#114;&#108;&#105;&#110;&#101;&#123;&#67;&#80;&#125;&#95;&#123;&#118;&#44;&#92;&#109;&#97;&#116;&#104;&#114;&#109;&#123;&#71;&#67;&#65;&#125;&#44;&#105;&#125;&#10;&#45;&#92;&#111;&#118;&#101;&#114;&#108;&#105;&#110;&#101;&#123;&#67;&#80;&#125;&#95;&#123;&#118;&#44;&#92;&#109;&#97;&#116;&#104;&#114;&#109;&#123;&#71;&#67;&#71;&#125;&#44;&#105;&#125;&#46;&#10;</annotation></semantics></math></div>

Here, <span class="engineering-math"><math xmlns="http://www.w3.org/1998/Math/MathML" display="inline"><semantics><mi>v</mi><annotation encoding="application/x-tex">&#118;</annotation></semantics></math></span> identifies the construct, <span class="engineering-math"><math xmlns="http://www.w3.org/1998/Math/MathML" display="inline"><semantics><mi>r</mi><annotation encoding="application/x-tex">&#114;</annotation></semantics></math></span> the RNA context, <span class="engineering-math"><math xmlns="http://www.w3.org/1998/Math/MathML" display="inline"><semantics><mi>i</mi><annotation encoding="application/x-tex">&#105;</annotation></semantics></math></span> the protein residue and <span class="engineering-math"><math xmlns="http://www.w3.org/1998/Math/MathML" display="inline"><semantics><msub><mi>N</mi><mrow><mi>v</mi><mo>,</mo><mi>r</mi></mrow></msub><annotation encoding="application/x-tex">&#78;&#95;&#123;&#118;&#44;&#114;&#125;</annotation></semantics></math></span> the available predicted models. Geometric contact frequencies described observed arrangements across predictions; CP supplied the continuous paired-substrate features.

##### Test {#model-apobec-cycle-01-test}

**Contact decomposition separated direct base contacts from backbone-associated interactions.** K30 side-chain–base contact frequencies were **0.81 for GCG and 0.64 for GCA**. Q58 had no side-chain–base contacts in either matched context, although its protein-backbone–RNA-backbone contact frequencies were **0.32 and 0.81**, respectively.

The continuous features also revealed a substantial parental substrate response. Parent <span class="engineering-math"><math xmlns="http://www.w3.org/1998/Math/MathML" display="inline"><semantics><mrow><mi mathvariant="normal">Δ</mi><mi>C</mi><mi>P</mi></mrow><annotation encoding="application/x-tex">&#92;&#68;&#101;&#108;&#116;&#97;&#32;&#67;&#80;</annotation></semantics></math></span> was **−0.2400 at K30** and **+0.1055 at Q58**. A substrate difference therefore existed before any substitution was introduced. Using that difference directly to interpret variants would mix the parent's response with the effect of the substitution.

##### Learn {#model-apobec-cycle-01-learn}

We retained contact categories to distinguish recognition from structural support and adopted continuous CP differences for paired comparisons. The nonzero parental response established the next correction: each variant required its own matched substrates and subtraction of the parent's <span class="engineering-math"><math xmlns="http://www.w3.org/1998/Math/MathML" display="inline"><semantics><mrow><mi mathvariant="normal">Δ</mi><mi>C</mi><mi>P</mi></mrow><annotation encoding="application/x-tex">&#92;&#68;&#101;&#108;&#116;&#97;&#32;&#67;&#80;</annotation></semantics></math></span>.

#### **Cycle 2**: Isolating substitution effects {#model-apobec-cycle-02 .engineering-cycle-title}

##### Design {#model-apobec-cycle-02-design}

The parental comparison located substrate-responsive residues, but its baseline could dominate a variant's apparent contact preference. A negative <span class="engineering-math"><math xmlns="http://www.w3.org/1998/Math/MathML" display="inline"><semantics><mrow><mi mathvariant="normal">Δ</mi><mi>C</mi><mi>P</mi></mrow><annotation encoding="application/x-tex">&#92;&#68;&#101;&#108;&#116;&#97;&#32;&#67;&#80;</annotation></semantics></math></span> could persist even when a substitution shifted contacts towards the A context relative to the parent. We needed to separate these two interpretations before comparing single substitutions and combinations.

##### Build {#model-apobec-cycle-02-build}

We extended paired GCG/GCA predictions to the variant panel and changed the comparison from substrate difference to a parent-corrected double difference:

<div class="engineering-equation"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><mi mathvariant="normal">Δ</mi><mi mathvariant="normal">Δ</mi><mi>C</mi><msub><mi>P</mi><mrow><mi>v</mi><mo>,</mo><mi>i</mi></mrow></msub><mo>=</mo><mi mathvariant="normal">Δ</mi><mi>C</mi><msub><mi>P</mi><mrow><mi>v</mi><mo>,</mo><mi>i</mi></mrow></msub><mo>−</mo><mi mathvariant="normal">Δ</mi><mi>C</mi><msub><mi>P</mi><mrow><mrow><mi mathvariant="normal">p</mi><mi mathvariant="normal">a</mi><mi mathvariant="normal">r</mi><mi mathvariant="normal">e</mi><mi mathvariant="normal">n</mi><mi mathvariant="normal">t</mi></mrow><mo>,</mo><mi>i</mi></mrow></msub><mi>.</mi></mrow><annotation encoding="application/x-tex">&#10;&#92;&#68;&#101;&#108;&#116;&#97;&#92;&#68;&#101;&#108;&#116;&#97;&#32;&#67;&#80;&#95;&#123;&#118;&#44;&#105;&#125;&#10;&#61;&#92;&#68;&#101;&#108;&#116;&#97;&#32;&#67;&#80;&#95;&#123;&#118;&#44;&#105;&#125;&#45;&#92;&#68;&#101;&#108;&#116;&#97;&#32;&#67;&#80;&#95;&#123;&#92;&#109;&#97;&#116;&#104;&#114;&#109;&#123;&#112;&#97;&#114;&#101;&#110;&#116;&#125;&#44;&#105;&#125;&#46;&#10;</annotation></semantics></math></div>

The correction was calculated residue by residue across the 199-residue scaffold. Positive <span class="engineering-math"><math xmlns="http://www.w3.org/1998/Math/MathML" display="inline"><semantics><mrow><mi mathvariant="normal">Δ</mi><mi mathvariant="normal">Δ</mi><mi>C</mi><mi>P</mi></mrow><annotation encoding="application/x-tex">&#92;&#68;&#101;&#108;&#116;&#97;&#92;&#68;&#101;&#108;&#116;&#97;&#32;&#67;&#80;</annotation></semantics></math></span> denotes a shift towards A-associated contacts relative to the parent. The resulting profiles preserved the location and direction of changes throughout the interface.

##### Test {#model-apobec-cycle-02-test}

**Parent correction changed the interpretation of specific contacts.** At K30, G25E–K30H had <span class="engineering-math"><math xmlns="http://www.w3.org/1998/Math/MathML" display="inline"><semantics><mrow><mi mathvariant="normal">Δ</mi><mi>C</mi><mi>P</mi><mo>=</mo><mi>−</mi><mn>0.0600</mn></mrow><annotation encoding="application/x-tex">&#92;&#68;&#101;&#108;&#116;&#97;&#32;&#67;&#80;&#61;&#45;&#48;&#46;&#48;&#54;&#48;&#48;</annotation></semantics></math></span>, compared with the parental value of <span class="engineering-math"><math xmlns="http://www.w3.org/1998/Math/MathML" display="inline"><semantics><mrow><mi>−</mi><mn>0.2400</mn></mrow><annotation encoding="application/x-tex">&#45;&#48;&#46;&#50;&#52;&#48;&#48;</annotation></semantics></math></span>. Its corrected change was therefore **<span class="engineering-math"><math xmlns="http://www.w3.org/1998/Math/MathML" display="inline"><semantics><mrow><mi mathvariant="normal">Δ</mi><mi mathvariant="normal">Δ</mi><mi>C</mi><mi>P</mi><mo>=</mo><mi>+</mi><mn>0.1800</mn></mrow><annotation encoding="application/x-tex">&#92;&#68;&#101;&#108;&#116;&#97;&#92;&#68;&#101;&#108;&#116;&#97;&#32;&#67;&#80;&#61;&#43;&#48;&#46;&#49;&#56;&#48;&#48;</annotation></semantics></math></span>**, revealing a relative A-context shift despite the negative uncorrected difference.

The selected heatmap displayed **22 residues across 21 constructs**. G27T–K30H–Q58M showed **+0.3300 at K30 and −0.1055 at Q58**, resolving opposite local responses within the same construct.

![Parent-corrected contact-probability differences across 22 residues and 21 constructs.](/assets/images/engineering-dry-dbtl/module-3-image-01.png){.engineering-figure style="--engineering-figure-width:860px;--engineering-detail-width:980px"}

*Figure 3.1 | Parent-corrected double differences resolved the direction and location of substitution-associated contact changes.*

The profiles still combined protein changes with RNA-dependent rearrangements within a complex. They identified where the interface changed, but could not establish whether the protein adopted a different contact network when RNA was absent. That ambiguity required a change to the model inputs.

##### Learn {#model-apobec-cycle-02-learn}

We replaced uncorrected variant comparisons with paired, parent-corrected contact profiles and used them to organize local and cross-region hypotheses. Structural work on APOBEC substrate recognition informed this interpretation (Wolfe et al., 2020). We then added a substrate-swap control with an unchanged parent protein and new protein-only predictions to separate the input-dependent responses.

#### **Cycle 3**: Separating RNA-dependent responses {#model-apobec-cycle-03 .engineering-cycle-title}

##### Design {#model-apobec-cycle-03-design}

A large deviation in a complex could arise from the substitution, the RNA context, or their combined response. Complex-only predictions left these contributions entangled. We asked whether deviations persisted when the protein was predicted without RNA.

##### Build {#model-apobec-cycle-03-build}

Alongside the paired complexes, we ran new AlphaFold 3 predictions containing only the protein chain (Abramson et al., 2024). Contact features were averaged within each computational seed and then equally across seeds. Parent seeds alone defined the projection basis and normalization scale:

<div class="engineering-equation"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><msub><mi>D</mi><mi>M</mi></msub><mo stretchy="false" form="prefix">(</mo><mi>v</mi><mo stretchy="false" form="postfix">)</mo><mo>=</mo><msqrt><mrow><mfrac><mn>1</mn><mi>K</mi></mfrac><munderover><mo>∑</mo><mrow><mi>k</mi><mo>=</mo><mn>1</mn></mrow><mi>K</mi></munderover><msup><mrow><mo stretchy="true" form="prefix">(</mo><mfrac><mrow><msub><mi>z</mi><mrow><mi>v</mi><mo>,</mo><mi>k</mi></mrow></msub><mo>−</mo><msub><mi>μ</mi><mrow><mrow><mi mathvariant="normal">p</mi><mi mathvariant="normal">a</mi><mi mathvariant="normal">r</mi><mi mathvariant="normal">e</mi><mi mathvariant="normal">n</mi><mi mathvariant="normal">t</mi></mrow><mo>,</mo><mi>k</mi></mrow></msub></mrow><msub><mi>σ</mi><mrow><mrow><mi mathvariant="normal">p</mi><mi mathvariant="normal">a</mi><mi mathvariant="normal">r</mi><mi mathvariant="normal">e</mi><mi mathvariant="normal">n</mi><mi mathvariant="normal">t</mi></mrow><mo>,</mo><mi>k</mi></mrow></msub></mfrac><mo stretchy="true" form="postfix">)</mo></mrow><mn>2</mn></msup></mrow></msqrt><mi>.</mi></mrow><annotation encoding="application/x-tex">&#10;&#68;&#95;&#77;&#40;&#118;&#41;&#61;&#92;&#115;&#113;&#114;&#116;&#123;&#92;&#102;&#114;&#97;&#99;&#123;&#49;&#125;&#123;&#75;&#125;&#92;&#115;&#117;&#109;&#95;&#123;&#107;&#61;&#49;&#125;&#94;&#123;&#75;&#125;&#10;&#92;&#108;&#101;&#102;&#116;&#40;&#92;&#102;&#114;&#97;&#99;&#123;&#122;&#95;&#123;&#118;&#44;&#107;&#125;&#45;&#92;&#109;&#117;&#95;&#123;&#92;&#109;&#97;&#116;&#104;&#114;&#109;&#123;&#112;&#97;&#114;&#101;&#110;&#116;&#125;&#44;&#107;&#125;&#125;&#10;&#123;&#92;&#115;&#105;&#103;&#109;&#97;&#95;&#123;&#92;&#109;&#97;&#116;&#104;&#114;&#109;&#123;&#112;&#97;&#114;&#101;&#110;&#116;&#125;&#44;&#107;&#125;&#125;&#92;&#114;&#105;&#103;&#104;&#116;&#41;&#94;&#50;&#125;&#46;&#10;</annotation></semantics></math></div>

Here, <span class="engineering-math"><math xmlns="http://www.w3.org/1998/Math/MathML" display="inline"><semantics><mi>z</mi><annotation encoding="application/x-tex">&#122;</annotation></semantics></math></span> denotes projected contact features, <span class="engineering-math"><math xmlns="http://www.w3.org/1998/Math/MathML" display="inline"><semantics><mi>K</mi><annotation encoding="application/x-tex">&#75;</annotation></semantics></math></span> the retained dimensions, and <span class="engineering-math"><math xmlns="http://www.w3.org/1998/Math/MathML" display="inline"><semantics><mi>μ</mi><annotation encoding="application/x-tex">&#92;&#109;&#117;</annotation></semantics></math></span> and <span class="engineering-math"><math xmlns="http://www.w3.org/1998/Math/MathML" display="inline"><semantics><mi>σ</mi><annotation encoding="application/x-tex">&#92;&#115;&#105;&#103;&#109;&#97;</annotation></semantics></math></span> the parental projection mean and standard deviation. Each input condition used its own parent reference. The complex and protein-only distances were compared side by side.

##### Test {#model-apobec-cycle-03-test}

**The unchanged-parent substrate swap exposed a large RNA-dependent response.** Replacing GCG with GCA produced a normalized protein–target-cytidine CP deviation of **58.75** and a complex-space <span class="engineering-math"><math xmlns="http://www.w3.org/1998/Math/MathML" display="inline"><semantics><msub><mi>D</mi><mi>M</mi></msub><annotation encoding="application/x-tex">&#68;&#95;&#77;</annotation></semantics></math></span> of **5.605**. Large complex deviations therefore did not require a protein substitution.

Relative to each input condition's parent reference, T31D had **<span class="engineering-math"><math xmlns="http://www.w3.org/1998/Math/MathML" display="inline"><semantics><mrow><msub><mi>D</mi><mi>M</mi></msub><mo>=</mo><mn>5.498</mn></mrow><annotation encoding="application/x-tex">&#68;&#95;&#77;&#61;&#53;&#46;&#52;&#57;&#56;</annotation></semantics></math></span> in the complex and <span class="engineering-math"><math xmlns="http://www.w3.org/1998/Math/MathML" display="inline"><semantics><mn>1.202</mn><annotation encoding="application/x-tex">&#49;&#46;&#50;&#48;&#50;</annotation></semantics></math></span> without RNA**. N57W had a protein-only distance of **6.395**; E72A had distances of **0.903 and 1.656**, respectively. These condition-specific departures distinguished the responses across model inputs.

![Normalized parental distances for ten constructs in RNA-containing complexes and protein-only models.](/assets/images/engineering-dry-dbtl/module-3-image-02.svg){.engineering-figure style="--engineering-figure-width:700px;--engineering-detail-width:960px"}

*Figure 3.2 | Parallel complex and protein-only predictions distinguished construct-specific responses to the model inputs.*

The plotted G27D-M130G label refers to the sequence containing G27D+W130G. Each <span class="engineering-math"><math xmlns="http://www.w3.org/1998/Math/MathML" display="inline"><semantics><msub><mi>D</mi><mi>M</mi></msub><annotation encoding="application/x-tex">&#68;&#95;&#77;</annotation></semantics></math></span> compressed many contact changes into one magnitude, discarding the identities and directions of the contacts separating constructs.

##### Learn {#model-apobec-cycle-03-learn}

We adopted parallel complex and protein-only analyses for structural interpretation. Complex predictions described substrate-associated responses; protein-only predictions examined contact changes with RNA absent. To identify shared structural patterns, we then retained the contact vectors themselves and introduced network-based grouping.

#### **Cycle 4**: Preserving contact patterns {#model-apobec-cycle-04 .engineering-cycle-title}

##### Design {#model-apobec-cycle-04-design}

The normalized distance measured how far a construct moved from the parent, but did not identify which contacts moved together. This loss of information limited comparisons among variants with different local changes. We asked whether complete protein contact vectors could resolve structural branches while retaining all constructs.

##### Build {#model-apobec-cycle-04-build}

For **11 constructs, 56 computational seeds and 280 predicted structures**, we extracted protein-internal CP matrices. Each seed's five predictions were symmetrized and averaged, followed by equal averaging across seeds:

<div class="engineering-equation"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><msub><mi>x</mi><mrow><mi>v</mi><mo>,</mo><mo stretchy="false" form="prefix">(</mo><mi>i</mi><mo>,</mo><mi>j</mi><mo stretchy="false" form="postfix">)</mo></mrow></msub><mo>=</mo><mfrac><mn>1</mn><msub><mi>S</mi><mi>v</mi></msub></mfrac><munderover><mo>∑</mo><mrow><mi>s</mi><mo>=</mo><mn>1</mn></mrow><msub><mi>S</mi><mi>v</mi></msub></munderover><mfrac><mn>1</mn><mn>5</mn></mfrac><munderover><mo>∑</mo><mrow><mi>m</mi><mo>=</mo><mn>1</mn></mrow><mn>5</mn></munderover><mfrac><mrow><msubsup><mi>P</mi><mrow><mi>i</mi><mi>j</mi></mrow><mrow><mo stretchy="false" form="prefix">(</mo><mi>v</mi><mo>,</mo><mi>s</mi><mo>,</mo><mi>m</mi><mo stretchy="false" form="postfix">)</mo></mrow></msubsup><mo>+</mo><msubsup><mi>P</mi><mrow><mi>j</mi><mi>i</mi></mrow><mrow><mo stretchy="false" form="prefix">(</mo><mi>v</mi><mo>,</mo><mi>s</mi><mo>,</mo><mi>m</mi><mo stretchy="false" form="postfix">)</mo></mrow></msubsup></mrow><mn>2</mn></mfrac><mo>,</mo><mspace width="2.0em" /><mo stretchy="false" form="prefix">|</mo><mi>i</mi><mo>−</mo><mi>j</mi><mo stretchy="false" form="prefix">|</mo><mo>≥</mo><mn>4</mn><mi>.</mi></mrow><annotation encoding="application/x-tex">&#10;&#120;&#95;&#123;&#118;&#44;&#40;&#105;&#44;&#106;&#41;&#125;&#61;&#10;&#92;&#102;&#114;&#97;&#99;&#123;&#49;&#125;&#123;&#83;&#95;&#118;&#125;&#92;&#115;&#117;&#109;&#95;&#123;&#115;&#61;&#49;&#125;&#94;&#123;&#83;&#95;&#118;&#125;&#10;&#92;&#102;&#114;&#97;&#99;&#123;&#49;&#125;&#123;&#53;&#125;&#92;&#115;&#117;&#109;&#95;&#123;&#109;&#61;&#49;&#125;&#94;&#123;&#53;&#125;&#10;&#92;&#102;&#114;&#97;&#99;&#123;&#80;&#94;&#123;&#40;&#118;&#44;&#115;&#44;&#109;&#41;&#125;&#95;&#123;&#105;&#106;&#125;&#43;&#80;&#94;&#123;&#40;&#118;&#44;&#115;&#44;&#109;&#41;&#125;&#95;&#123;&#106;&#105;&#125;&#125;&#123;&#50;&#125;&#44;&#10;&#92;&#113;&#113;&#117;&#97;&#100;&#32;&#124;&#105;&#45;&#106;&#124;&#92;&#103;&#101;&#113;&#52;&#46;&#10;</annotation></semantics></math></div>

Here, <span class="engineering-math"><math xmlns="http://www.w3.org/1998/Math/MathML" display="inline"><semantics><msub><mi>S</mi><mi>v</mi></msub><annotation encoding="application/x-tex">&#83;&#95;&#118;</annotation></semantics></math></span> is the number of seeds for construct <span class="engineering-math"><math xmlns="http://www.w3.org/1998/Math/MathML" display="inline"><semantics><mi>v</mi><annotation encoding="application/x-tex">&#118;</annotation></semantics></math></span>. The resulting representation contained **19,110 nonlocal residue pairs**, including **766 variable pairs**. We retained the CP probability scale and compared clustering methods on these construct vectors.

Following the spectral clustering framework of Ng et al. (2002), we connected constructs through radial-basis similarities:

<div class="engineering-equation"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><msub><mi>A</mi><mrow><mi>u</mi><mi>v</mi></mrow></msub><mo>=</mo><mrow><mi mathvariant="normal">exp</mi><mo>⁡</mo></mrow><mrow><mo stretchy="true" form="prefix">[</mo><mi>−</mi><mfrac><msup><mrow><mo stretchy="true" form="prefix">‖</mo><msub><mi>x</mi><mi>u</mi></msub><mo>−</mo><msub><mi>x</mi><mi>v</mi></msub><mo stretchy="true" form="postfix">‖</mo></mrow><mn>2</mn></msup><mrow><mn>2</mn><msup><mi>σ</mi><mn>2</mn></msup></mrow></mfrac><mo stretchy="true" form="postfix">]</mo></mrow><mo>,</mo><mspace width="2.0em" /><mi>σ</mi><mo>=</mo><msub><mrow><mi mathvariant="normal">median</mi><mo>⁡</mo></mrow><mrow><mi>u</mi><mo>&lt;</mo><mi>v</mi></mrow></msub><mrow><mo stretchy="true" form="prefix">‖</mo><msub><mi>x</mi><mi>u</mi></msub><mo>−</mo><msub><mi>x</mi><mi>v</mi></msub><mo stretchy="true" form="postfix">‖</mo></mrow><mi>.</mi></mrow><annotation encoding="application/x-tex">&#10;&#65;&#95;&#123;&#117;&#118;&#125;&#61;&#92;&#101;&#120;&#112;&#92;&#108;&#101;&#102;&#116;&#91;&#45;&#92;&#102;&#114;&#97;&#99;&#123;&#92;&#108;&#86;&#101;&#114;&#116;&#32;&#120;&#95;&#117;&#45;&#120;&#95;&#118;&#92;&#114;&#86;&#101;&#114;&#116;&#94;&#50;&#125;&#123;&#50;&#92;&#115;&#105;&#103;&#109;&#97;&#94;&#50;&#125;&#92;&#114;&#105;&#103;&#104;&#116;&#93;&#44;&#10;&#92;&#113;&#113;&#117;&#97;&#100;&#10;&#92;&#115;&#105;&#103;&#109;&#97;&#61;&#92;&#111;&#112;&#101;&#114;&#97;&#116;&#111;&#114;&#110;&#97;&#109;&#101;&#123;&#109;&#101;&#100;&#105;&#97;&#110;&#125;&#95;&#123;&#117;&#60;&#118;&#125;&#92;&#108;&#86;&#101;&#114;&#116;&#32;&#120;&#95;&#117;&#45;&#120;&#95;&#118;&#92;&#114;&#86;&#101;&#114;&#116;&#46;&#10;</annotation></semantics></math></div>

Cluster count was selected from two, three or four groups using silhouette in the selected CP space (Rousseeuw, 1987). We also compared partition recurrence with cluster count fixed or reselected during seed resampling.

##### Test {#model-apobec-cycle-04-test}

**The complete CP representation resolved structural groups while retaining all 11 constructs.** Spectral clustering on 766 variable pairs produced groups of **9 and 2**, with an original-space silhouette of **0.465**. With cluster count fixed, the complete partition recurred in **100%** of the 200 bootstrap replicates.

Allowing cluster count to be selected again reduced recurrence to **78.5%**. The fixed-count result had therefore concealed uncertainty in the number of structural groups. The full representation supplied an interpretable grouping, but its dependence on feature content and cluster-count selection remained too strong for consistent downstream comparisons.

##### Learn {#model-apobec-cycle-04-learn}

We retained contact-vector grouping and made cluster-count reselection part of model comparison. To reduce the influence of weakly varying contacts, we introduced variance-based feature selection while preserving the CP scale and complete construct coverage.

#### **Cycle 5**: Stabilizing contact-based clustering {#model-apobec-cycle-05 .engineering-cycle-title}

##### Design {#model-apobec-cycle-05-design}

The full contact model reproduced its partition reliably only when cluster count was fixed. We therefore tested whether a smaller, informative contact set could stabilize the complete grouping when both features and cluster count were selected again.

##### Build {#model-apobec-cycle-05-build}

We ranked contact pairs by variance across the 11 construct means and compared the highest-variance subsets with the full representation:

<div class="engineering-equation"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><msub><mi>V</mi><mi>f</mi></msub><mo>=</mo><mfrac><mn>1</mn><mrow><mi>n</mi><mo>−</mo><mn>1</mn></mrow></mfrac><munderover><mo>∑</mo><mrow><mi>v</mi><mo>=</mo><mn>1</mn></mrow><mi>n</mi></munderover><mo stretchy="false" form="prefix">(</mo><msub><mi>x</mi><mrow><mi>v</mi><mo>,</mo><mi>f</mi></mrow></msub><mo>−</mo><msub><mover><mi>x</mi><mo accent="true">¯</mo></mover><mi>f</mi></msub><msup><mo stretchy="false" form="postfix">)</mo><mn>2</mn></msup><mo>,</mo><mspace width="2.0em" /><mi>n</mi><mo>=</mo><mn>11</mn><mi>.</mi></mrow><annotation encoding="application/x-tex">&#10;&#86;&#95;&#102;&#61;&#92;&#102;&#114;&#97;&#99;&#123;&#49;&#125;&#123;&#110;&#45;&#49;&#125;&#92;&#115;&#117;&#109;&#95;&#123;&#118;&#61;&#49;&#125;&#94;&#123;&#110;&#125;&#40;&#120;&#95;&#123;&#118;&#44;&#102;&#125;&#45;&#92;&#111;&#118;&#101;&#114;&#108;&#105;&#110;&#101;&#123;&#120;&#125;&#95;&#102;&#41;&#94;&#50;&#44;&#10;&#92;&#113;&#113;&#117;&#97;&#100;&#32;&#110;&#61;&#49;&#49;&#46;&#10;</annotation></semantics></math></div>

The tested subsets contained 77, 154 or 230 pairs. Each workflow underwent **200 bootstrap replicates**, resampling whole seed groups within each construct. Feature selection, representation fitting and cluster-count selection were repeated within each replicate (bootstrap methodology: Efron, 1979). Complete-partition recurrence was calculated as:

<div class="engineering-equation"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><mi>R</mi><mo>=</mo><mfrac><mn>1</mn><mn>200</mn></mfrac><munderover><mo>∑</mo><mrow><mi>b</mi><mo>=</mo><mn>1</mn></mrow><mn>200</mn></munderover><mn mathvariant="bold">𝟏</mn><mspace width="-0.167em" /><mrow><mo stretchy="true" form="prefix">[</mo><mi mathvariant="normal">ARI</mi><mo stretchy="false" form="prefix">(</mo><msub><mi>L</mi><mi>b</mi></msub><mo>,</mo><msub><mi>L</mi><mn>0</mn></msub><mo stretchy="false" form="postfix">)</mo><mo>=</mo><mn>1</mn><mo stretchy="true" form="postfix">]</mo></mrow><mi>.</mi></mrow><annotation encoding="application/x-tex">&#10;&#82;&#61;&#92;&#102;&#114;&#97;&#99;&#123;&#49;&#125;&#123;&#50;&#48;&#48;&#125;&#92;&#115;&#117;&#109;&#95;&#123;&#98;&#61;&#49;&#125;&#94;&#123;&#50;&#48;&#48;&#125;&#10;&#92;&#109;&#97;&#116;&#104;&#98;&#102;&#123;&#49;&#125;&#92;&#33;&#92;&#108;&#101;&#102;&#116;&#91;&#92;&#111;&#112;&#101;&#114;&#97;&#116;&#111;&#114;&#110;&#97;&#109;&#101;&#123;&#65;&#82;&#73;&#125;&#40;&#76;&#95;&#98;&#44;&#76;&#95;&#48;&#41;&#61;&#49;&#92;&#114;&#105;&#103;&#104;&#116;&#93;&#46;&#10;</annotation></semantics></math></div>

Here, <span class="engineering-math"><math xmlns="http://www.w3.org/1998/Math/MathML" display="inline"><semantics><msub><mi>L</mi><mn>0</mn></msub><annotation encoding="application/x-tex">&#76;&#95;&#48;</annotation></semantics></math></span> is a workflow's baseline partition, <span class="engineering-math"><math xmlns="http://www.w3.org/1998/Math/MathML" display="inline"><semantics><msub><mi>L</mi><mi>b</mi></msub><annotation encoding="application/x-tex">&#76;&#95;&#98;</annotation></semantics></math></span> its resampled partition, and ARI the adjusted Rand index (Hubert & Arabie, 1985). An ARI of one indicates identical complete partitions. As a complementary control, confidence-filtered Ward clustering (Ward, 1963) retained pairs whose two endpoints had minimum construct-mean Cα pLDDT of at least 70 (confidence-score background: Jumper et al., 2021). The endpoint-confidence mask remained fixed across all 200 bootstrap replicates.

##### Test {#model-apobec-cycle-05-test}

**Selecting the 77 highest-variance pairs increased complete-partition recurrence from 78.5% to 97.5%.** The spectral model produced groups of **7, 2 and 2**, recovering its complete partition in **195 of 200 replicates**. All 11 constructs remained included.

The confidence filter retained **411 pairs**. Ward clustering recovered the same three-group partition with **94.0% recurrence** under cluster-count reselection. Fixed-count recurrence was **100%** for all three displayed workflows.

![Exact partition recurrence for all-variable spectral, top-77 spectral and confidence-filtered Ward clustering, with contact counts, group counts and original-space silhouette.](/assets/images/engineering-dry-dbtl/module-3-image-03.svg){.engineering-figure style="--engineering-figure-width:560px;--engineering-detail-width:960px"}

*Figure 3.3 | The 77-contact spectral model reproduced its complete partition in 97.5% of 200 seed bootstrap replicates.*

The original-space silhouette decreased slightly, from **0.465 to 0.455**. The compact model traded this small reduction for a more repeatable partition, with the same grouping recovered through confidence-filtered Ward clustering.

##### Learn {#model-apobec-cycle-05-learn}

We selected **spectral clustering on the 77 highest-variance contact pairs** as the main structural grouping and retained confidence-filtered Ward clustering as a sensitivity comparison. Selection combined complete construct coverage, the original CP scale and recurrence under feature and cluster-count reselection. The final output supplied three reproducible structural branches for matched comparisons of parents, single substitutions and combinations, alongside the local contact hypotheses from earlier cycles.

#### References {#model-apobec-references}

1. Abramson, J., Adler, J., Dunger, J., Evans, R., Green, T., Pritzel, A., Ronneberger, O., Willmore, L., Ballard, A. J., Bambrick, J., Bodenstein, S. W., Evans, D. A., Hung, C.-C., O’Neill, M., Reiman, D., Tunyasuvunakool, K., Wu, Z., Žemgulytė, A., Arvaniti, E., … Jumper, J. M. (2024). Accurate structure prediction of biomolecular interactions with AlphaFold 3. *Nature, 630*(8016), 493–500. [doi: 10.1038/s41586-024-07487-w](<https://doi.org/10.1038/s41586-024-07487-w>)

2. Efron, B. (1979). Bootstrap methods: Another look at the jackknife. *The Annals of Statistics, 7*(1), 1–26. [doi: 10.1214/aos/1176344552](<https://doi.org/10.1214/aos/1176344552>)

3. Han, W., Huang, W., Wei, T., Ye, Y., Mao, M., & Wang, Z. (2022). Programmable RNA base editing with a single gRNA-free enzyme. *Nucleic Acids Research, 50*(16), 9580–9595. [doi: 10.1093/nar/gkac713](<https://doi.org/10.1093/nar/gkac713>)

4. Han, W., Yuan, B., Fan, X., Li, W., Yuan, Y., Zhang, Y., Wang, S., Shan, S., Hafner, M., Wang, Z., & Qiu, Z. (2025). Effective in vivo RNA base editing via engineered cytidine deaminase APOBECs fused with PUF proteins. *Nature Communications, 16*, Article 9727. [doi: 10.1038/s41467-025-64748-6](<https://doi.org/10.1038/s41467-025-64748-6>)

5. Hubert, L., & Arabie, P. (1985). Comparing partitions. *Journal of Classification, 2*, 193–218. [doi: 10.1007/BF01908075](<https://doi.org/10.1007/BF01908075>)

6. Jumper, J., Evans, R., Pritzel, A., et al. (2021). Highly accurate protein structure prediction with AlphaFold. *Nature, 596*, 583–589. [doi: 10.1038/s41586-021-03819-2](<https://doi.org/10.1038/s41586-021-03819-2>)

7. Ng, A. Y., Jordan, M. I., & Weiss, Y. (2002). On spectral clustering: Analysis and an algorithm. In T. G. Dietterich, S. Becker, & Z. Ghahramani (Eds.), *Advances in neural information processing systems* (Vol. 14, pp. 849–856). MIT Press. [Source](https://proceedings.neurips.cc/paper/2001/hash/801272ee79cfde7fa5960571fee36b9b-Abstract.html).

8. Rousseeuw, P. J. (1987). Silhouettes: A graphical aid to the interpretation and validation of cluster analysis. *Journal of Computational and Applied Mathematics, 20*, 53–65. [doi: 10.1016/0377-0427(87)90125-7](<https://doi.org/10.1016/0377-0427(87)90125-7>)

9. Wang, X., McLachlan, J., Zamore, P. D., & Hall, T. M. T. (2002). Modular recognition of RNA by a human Pumilio-homology domain. *Cell, 110*(4), 501–512. [doi: 10.1016/S0092-8674(02)00873-5](<https://doi.org/10.1016/S0092-8674(02)00873-5>)

10. Ward, J. H., Jr. (1963). Hierarchical grouping to optimize an objective function. *Journal of the American Statistical Association, 58*(301), 236–244. [doi: 10.1080/01621459.1963.10500845](<https://doi.org/10.1080/01621459.1963.10500845>)

11. Wolfe, A. D., Li, S., Goedderz, C., & Chen, X. S. (2020). The structure of APOBEC1 and insights into its RNA and DNA substrate selectivity. *NAR Cancer, 2*(4), Article zcaa027. [doi: 10.1093/narcan/zcaa027](<https://doi.org/10.1093/narcan/zcaa027>)


---

### LAMAR {#model-lamar .engineering-chapter-title}

Prioritizing RNA editing candidates
{.engineering-chapter-subtitle}

#### Overview {#model-lamar-overview}

RNA sequencing from the wet-lab team supplied editing-site labels and their surrounding sequences. We extended the RNA language model LAMAR through human-transcript adaptation, regional prediction and cytidine ranking. The workflow separates sequence learning, region selection and local prioritization, with a ranking objective matched to the number of candidates the team can examine. Its ordered shortlists guide follow-up site selection, and new site labels provide feedback for further model development.

[Explore the Module 4 model and results](https://github.com/pdx12320/WIKI_SUSTech-BIO/blob/main/wiki/components/model/module4.html)

#### **Cycle 1**: Introducing pretrained RNA representations {#model-lamar-cycle-01 .engineering-cycle-title}

##### Design {#model-lamar-cycle-01-design}

Our initial machine-learning and task-specific deep-learning approaches sought to learn the relationship between RNA sequence and editing directly. Limited editing labels constrained how much sequence context these models could learn. Representations learned from large collections of unlabelled RNA offered a way to incorporate sequence information beyond the labelled dataset.

##### Build {#model-lamar-cycle-01-build}

Following advice from PI Zefeng Wang, we adopted the RNA language model LAMAR as a pretrained encoder. A task-specific prediction head connected its contextual representations to editing labels (Transformer background: Vaswani et al., 2017):

<div class="engineering-equation"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><mi>h</mi><mo>=</mo><msub><mi>E</mi><mi>θ</mi></msub><mo stretchy="false" form="prefix">(</mo><mi>x</mi><mo stretchy="false" form="postfix">)</mo><mo>,</mo><mspace width="2.0em" /><mover><mi>y</mi><mo accent="true">̂</mo></mover><mo>=</mo><msub><mi>g</mi><mi>ϕ</mi></msub><mo stretchy="false" form="prefix">(</mo><mi>h</mi><mo stretchy="false" form="postfix">)</mo><mi>.</mi></mrow><annotation encoding="application/x-tex">&#10;&#104;&#32;&#61;&#32;&#69;&#95;&#123;&#92;&#116;&#104;&#101;&#116;&#97;&#125;&#40;&#120;&#41;&#44;&#32;&#92;&#113;&#113;&#117;&#97;&#100;&#32;&#92;&#104;&#97;&#116;&#123;&#121;&#125;&#32;&#61;&#32;&#103;&#95;&#123;&#92;&#112;&#104;&#105;&#125;&#40;&#104;&#41;&#46;&#10;</annotation></semantics></math></div>

Here, <span class="engineering-math"><math xmlns="http://www.w3.org/1998/Math/MathML" display="inline"><semantics><mi>x</mi><annotation encoding="application/x-tex">&#120;</annotation></semantics></math></span> is the RNA sequence, <span class="engineering-math"><math xmlns="http://www.w3.org/1998/Math/MathML" display="inline"><semantics><msub><mi>E</mi><mi>θ</mi></msub><annotation encoding="application/x-tex">&#69;&#95;&#123;&#92;&#116;&#104;&#101;&#116;&#97;&#125;</annotation></semantics></math></span> is the LAMAR encoder, <span class="engineering-math"><math xmlns="http://www.w3.org/1998/Math/MathML" display="inline"><semantics><mi>h</mi><annotation encoding="application/x-tex">&#104;</annotation></semantics></math></span> is its contextual representation, and <span class="engineering-math"><math xmlns="http://www.w3.org/1998/Math/MathML" display="inline"><semantics><msub><mi>g</mi><mi>ϕ</mi></msub><annotation encoding="application/x-tex">&#103;&#95;&#123;&#92;&#112;&#104;&#105;&#125;</annotation></semantics></math></span> is the task head. This architecture separated general sequence learning from supervised prediction of editing-associated labels.

##### Test {#model-lamar-cycle-01-test}

A later initialization comparison in regional prediction supported the use of pretrained representations. Fine-tuning original LAMAR reached a maximum validation average precision (AP) of **0.7976**, compared with **0.7416** for random initialization.

LAMAR's multispecies pretraining also raised a specific adaptation question: how well did these representations capture the human-transcript contexts used in our task?

##### Learn {#model-lamar-cycle-01-learn}

We retained pretrained sequence representations and directed development toward human-transcript adaptation. H. Zhou et al. (2025) established the RNA pretraining and downstream fine-tuning framework in LAMAR; our work applied it to editing-site prioritization.

#### **Cycle 2**: Adapting to human transcripts {#model-lamar-cycle-02 .engineering-cycle-title}

##### Design {#model-lamar-cycle-02-design}

Human transcripts became the target domain for continued sequence learning. The immediate objective was to improve reconstruction of human RNA contexts before supervised editing prediction.

##### Build {#model-lamar-cycle-02-build}

We continued masked language modelling on human transcripts derived from GRCh38 and GENCODE release 50. GENCODE provides the reference gene-annotation framework (Mudge et al., 2025). The encoder learned to predict masked nucleotides from their surrounding sequence (masked-language-modelling background: Devlin et al., 2019):

<div class="engineering-equation"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><msub><mi mathvariant="script">ℒ</mi><mrow><mi mathvariant="normal">M</mi><mi mathvariant="normal">L</mi><mi mathvariant="normal">M</mi></mrow></msub><mo>=</mo><mi>−</mi><mfrac><mn>1</mn><mrow><mo stretchy="false" form="prefix">|</mo><mi>M</mi><mo stretchy="false" form="prefix">|</mo></mrow></mfrac><munder><mo>∑</mo><mrow><mi>i</mi><mo>∈</mo><mi>M</mi></mrow></munder><mrow><mi mathvariant="normal">log</mi><mo>⁡</mo></mrow><msub><mi>p</mi><mi>θ</mi></msub><mspace width="-0.167em" /><mrow><mo stretchy="true" form="prefix">(</mo><msub><mi>x</mi><mi>i</mi></msub><mo>∣</mo><msup><mi>x</mi><mrow><mi mathvariant="normal">m</mi><mi mathvariant="normal">a</mi><mi mathvariant="normal">s</mi><mi mathvariant="normal">k</mi></mrow></msup><mo stretchy="true" form="postfix">)</mo></mrow><mi>.</mi></mrow><annotation encoding="application/x-tex">&#10;&#92;&#109;&#97;&#116;&#104;&#99;&#97;&#108;&#123;&#76;&#125;&#95;&#123;&#92;&#109;&#97;&#116;&#104;&#114;&#109;&#123;&#77;&#76;&#77;&#125;&#125;&#10;&#61;&#32;&#45;&#92;&#102;&#114;&#97;&#99;&#123;&#49;&#125;&#123;&#124;&#77;&#124;&#125;&#92;&#115;&#117;&#109;&#95;&#123;&#105;&#92;&#105;&#110;&#32;&#77;&#125;&#10;&#92;&#108;&#111;&#103;&#32;&#112;&#95;&#123;&#92;&#116;&#104;&#101;&#116;&#97;&#125;&#92;&#33;&#92;&#108;&#101;&#102;&#116;&#40;&#120;&#95;&#105;&#92;&#109;&#105;&#100;&#32;&#120;&#94;&#123;&#92;&#109;&#97;&#116;&#104;&#114;&#109;&#123;&#109;&#97;&#115;&#107;&#125;&#125;&#92;&#114;&#105;&#103;&#104;&#116;&#41;&#46;&#10;</annotation></semantics></math></div>

<span class="engineering-math"><math xmlns="http://www.w3.org/1998/Math/MathML" display="inline"><semantics><mi>M</mi><annotation encoding="application/x-tex">&#77;</annotation></semantics></math></span> denotes the masked positions, and <span class="engineering-math"><math xmlns="http://www.w3.org/1998/Math/MathML" display="inline"><semantics><msup><mi>x</mi><mrow><mi mathvariant="normal">m</mi><mi mathvariant="normal">a</mi><mi mathvariant="normal">s</mi><mi mathvariant="normal">k</mi></mrow></msup><annotation encoding="application/x-tex">&#120;&#94;&#123;&#92;&#109;&#97;&#116;&#104;&#114;&#109;&#123;&#109;&#97;&#115;&#107;&#125;&#125;</annotation></semantics></math></span> denotes the masked input sequence. Updating the encoder with this objective adapted its parameters to the human transcript distribution.

##### Test {#model-lamar-cycle-02-test}

Across 100 evaluations, masked nucleotide accuracy increased from **0.5321** at step 1,000 to **0.5755** at step 100,000. Training loss also decreased overall as the encoder learned to reconstruct human sequences.

![Training loss and validation masked nucleotide accuracy during continued pretraining on human transcripts.](/assets/images/engineering-dry-dbtl/module-4-image-01.png){.engineering-figure style="--engineering-figure-width:1000px;--engineering-detail-width:1720px"}

*Figure 4.1 | Continued pretraining on human transcripts reduced training loss overall and increased validation masked nucleotide accuracy.*

##### Learn {#model-lamar-cycle-02-learn}

The adapted encoder supplied a human-specific starting point for supervised learning. Masked reconstruction and editing prediction measure different tasks, so regional validation AP guided subsequent choices about encoder training. The domain-adaptive pretraining study by Gururangan et al. (2020) provided the methodological basis for continued pretraining and task-level assessment.

#### **Cycle 3**: Regional and local prediction {#model-lamar-cycle-03 .engineering-cycle-title}

##### Design {#model-lamar-cycle-03-design}

Direct low-rank adaptation (LoRA) for cytidine editing remained unsatisfactory after human-transcript adaptation. Sparse supported positives and uncertain labels at undetected sites made task formulation central to the redesign. We separated the identification of candidate regions from the prediction of sites within each region.

##### Build {#model-lamar-cycle-03-build}

Stage I used a classification head to predict whether an input region contained a labelled positive:

<div class="engineering-equation"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><msub><mi>y</mi><mi>W</mi></msub><mo>=</mo><mn mathvariant="bold">𝟏</mn><mspace width="-0.167em" /><mrow><mo stretchy="true" form="prefix">(</mo><mo>∃</mo><mi>i</mi><mo>∈</mo><mi>W</mi><mo>:</mo><mspace width="0.222em" /><msub><mi>y</mi><mi>i</mi></msub><mo>=</mo><mn>1</mn><mo stretchy="true" form="postfix">)</mo></mrow><mo>,</mo><mspace width="2.0em" /><msub><mi>p</mi><mi>W</mi></msub><mo>=</mo><mrow><mi mathvariant="normal">softmax</mi><mo>⁡</mo></mrow><mspace width="-0.167em" /><msub><mrow><mo stretchy="true" form="prefix">(</mo><msub><mi>g</mi><mi mathvariant="normal">I</mi></msub><mo stretchy="false" form="prefix">(</mo><msub><mi>E</mi><mi>θ</mi></msub><mo stretchy="false" form="prefix">(</mo><mi>W</mi><mo stretchy="false" form="postfix">)</mo><mo stretchy="false" form="postfix">)</mo><mo stretchy="true" form="postfix">)</mo></mrow><mn>1</mn></msub><mi>.</mi></mrow><annotation encoding="application/x-tex">&#10;&#121;&#95;&#87;&#32;&#61;&#32;&#92;&#109;&#97;&#116;&#104;&#98;&#102;&#123;&#49;&#125;&#92;&#33;&#92;&#108;&#101;&#102;&#116;&#40;&#92;&#101;&#120;&#105;&#115;&#116;&#115;&#32;&#105;&#92;&#105;&#110;&#32;&#87;&#58;&#92;&#32;&#121;&#95;&#105;&#61;&#49;&#92;&#114;&#105;&#103;&#104;&#116;&#41;&#44;&#10;&#92;&#113;&#113;&#117;&#97;&#100;&#10;&#112;&#95;&#87;&#32;&#61;&#32;&#92;&#111;&#112;&#101;&#114;&#97;&#116;&#111;&#114;&#110;&#97;&#109;&#101;&#123;&#115;&#111;&#102;&#116;&#109;&#97;&#120;&#125;&#92;&#33;&#92;&#108;&#101;&#102;&#116;&#40;&#103;&#95;&#123;&#92;&#109;&#97;&#116;&#104;&#114;&#109;&#123;&#73;&#125;&#125;&#40;&#69;&#95;&#123;&#92;&#116;&#104;&#101;&#116;&#97;&#125;&#40;&#87;&#41;&#41;&#92;&#114;&#105;&#103;&#104;&#116;&#41;&#95;&#49;&#46;&#10;</annotation></semantics></math></div>

<span class="engineering-math"><math xmlns="http://www.w3.org/1998/Math/MathML" display="inline"><semantics><mi>W</mi><annotation encoding="application/x-tex">&#87;</annotation></semantics></math></span> denotes the input region, <span class="engineering-math"><math xmlns="http://www.w3.org/1998/Math/MathML" display="inline"><semantics><msub><mi>y</mi><mi>W</mi></msub><annotation encoding="application/x-tex">&#121;&#95;&#87;</annotation></semantics></math></span> its label, and <span class="engineering-math"><math xmlns="http://www.w3.org/1998/Math/MathML" display="inline"><semantics><msub><mi>p</mi><mi>W</mi></msub><annotation encoding="application/x-tex">&#112;&#95;&#87;</annotation></semantics></math></span> the positive-class output. Stage II used 101-nt cytidine-centred contexts for local prediction. The two tasks were trained separately from the human-adapted encoder; Stage II initialized directly from the human-pretraining checkpoint.

The regional partitions contained 3,835 training regions, 213 validation regions and 212 test regions. This decomposition gave each model a distinct prediction target and input scale.

##### Test {#model-lamar-cycle-03-test}

The regional classifier achieved **test AP of 0.7223** across 212 regions, including 140 labelled positives. Positive prevalence was **66.04%**, providing context for the regional score.

Local editing-efficiency regression remained modest. Decomposing the task organized candidate prediction at two scales, while accurate numerical efficiency estimates remained a separate challenge.

##### Learn {#model-lamar-cycle-03-learn}

We retained separate regional and local tasks, allowing their training strategies and objectives to be refined independently. LoRA addresses parameter-efficient adaptation (Hu et al., 2022), while Elkan and Noto (2008) distinguish positive labels from unlabelled examples. These perspectives helped separate the adaptation method from the uncertainty in editing labels.

#### **Cycle 4**: Adapting the regional encoder {#model-lamar-cycle-04 .engineering-cycle-title}

##### Design {#model-lamar-cycle-04-design}

Human-transcript pretraining optimized nucleotide reconstruction. Regional classification required a further decision: whether those representations should remain fixed or change with the editing-associated labels. We tested encoder freezing and full fine-tuning from the same human-adapted initialization.

##### Build {#model-lamar-cycle-04-build}

The frozen configuration trained the regional prediction head while keeping the encoder parameters fixed. Full fine-tuning updated both the encoder and the head. Original LAMAR configurations and random initialization provided additional reference conditions.

<div class="engineering-equation"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><msub><mover><mi>ϕ</mi><mo accent="true">̂</mo></mover><mrow><mi mathvariant="normal">f</mi><mi mathvariant="normal">r</mi><mi mathvariant="normal">o</mi><mi mathvariant="normal">z</mi><mi mathvariant="normal">e</mi><mi mathvariant="normal">n</mi></mrow></msub><mo>=</mo><munder><mrow><mrow><mi mathvariant="normal">arg</mi><mo>⁡</mo></mrow><mi mathvariant="normal">min</mi></mrow><mi>ϕ</mi></munder><mspace width="0.167em" /><msub><mi mathvariant="script">ℒ</mi><mrow><mi mathvariant="normal">c</mi><mi mathvariant="normal">l</mi><mi mathvariant="normal">s</mi></mrow></msub><mo stretchy="false" form="prefix">(</mo><msub><mi>θ</mi><mn>0</mn></msub><mo>,</mo><mi>ϕ</mi><mo stretchy="false" form="postfix">)</mo><mo>,</mo><mspace width="2.0em" /><mo stretchy="false" form="prefix">(</mo><mover><mi>θ</mi><mo accent="true">̂</mo></mover><mo>,</mo><mover><mi>ϕ</mi><mo accent="true">̂</mo></mover><msub><mo stretchy="false" form="postfix">)</mo><mrow><mi mathvariant="normal">f</mi><mi mathvariant="normal">u</mi><mi mathvariant="normal">l</mi><mi mathvariant="normal">l</mi></mrow></msub><mo>=</mo><munder><mrow><mrow><mi mathvariant="normal">arg</mi><mo>⁡</mo></mrow><mi mathvariant="normal">min</mi></mrow><mrow><mi>θ</mi><mo>,</mo><mi>ϕ</mi></mrow></munder><mspace width="0.167em" /><msub><mi mathvariant="script">ℒ</mi><mrow><mi mathvariant="normal">c</mi><mi mathvariant="normal">l</mi><mi mathvariant="normal">s</mi></mrow></msub><mo stretchy="false" form="prefix">(</mo><mi>θ</mi><mo>,</mo><mi>ϕ</mi><mo stretchy="false" form="postfix">)</mo><mi>.</mi></mrow><annotation encoding="application/x-tex">&#10;&#92;&#119;&#105;&#100;&#101;&#104;&#97;&#116;&#92;&#112;&#104;&#105;&#95;&#123;&#92;&#109;&#97;&#116;&#104;&#114;&#109;&#123;&#102;&#114;&#111;&#122;&#101;&#110;&#125;&#125;&#61;&#10;&#92;&#117;&#110;&#100;&#101;&#114;&#115;&#101;&#116;&#123;&#92;&#112;&#104;&#105;&#125;&#123;&#92;&#97;&#114;&#103;&#92;&#109;&#105;&#110;&#125;&#92;&#44;&#92;&#109;&#97;&#116;&#104;&#99;&#97;&#108;&#32;&#76;&#95;&#123;&#92;&#109;&#97;&#116;&#104;&#114;&#109;&#123;&#99;&#108;&#115;&#125;&#125;&#40;&#92;&#116;&#104;&#101;&#116;&#97;&#95;&#48;&#44;&#92;&#112;&#104;&#105;&#41;&#44;&#10;&#92;&#113;&#113;&#117;&#97;&#100;&#10;&#40;&#92;&#119;&#105;&#100;&#101;&#104;&#97;&#116;&#92;&#116;&#104;&#101;&#116;&#97;&#44;&#92;&#119;&#105;&#100;&#101;&#104;&#97;&#116;&#92;&#112;&#104;&#105;&#41;&#95;&#123;&#92;&#109;&#97;&#116;&#104;&#114;&#109;&#123;&#102;&#117;&#108;&#108;&#125;&#125;&#61;&#10;&#92;&#117;&#110;&#100;&#101;&#114;&#115;&#101;&#116;&#123;&#92;&#116;&#104;&#101;&#116;&#97;&#44;&#92;&#112;&#104;&#105;&#125;&#123;&#92;&#97;&#114;&#103;&#92;&#109;&#105;&#110;&#125;&#92;&#44;&#92;&#109;&#97;&#116;&#104;&#99;&#97;&#108;&#32;&#76;&#95;&#123;&#92;&#109;&#97;&#116;&#104;&#114;&#109;&#123;&#99;&#108;&#115;&#125;&#125;&#40;&#92;&#116;&#104;&#101;&#116;&#97;&#44;&#92;&#112;&#104;&#105;&#41;&#46;&#10;</annotation></semantics></math></div>

Here, <span class="engineering-math"><math xmlns="http://www.w3.org/1998/Math/MathML" display="inline"><semantics><msub><mi>θ</mi><mn>0</mn></msub><annotation encoding="application/x-tex">&#92;&#116;&#104;&#101;&#116;&#97;&#95;&#48;</annotation></semantics></math></span> is the human-adapted encoder initialization, <span class="engineering-math"><math xmlns="http://www.w3.org/1998/Math/MathML" display="inline"><semantics><mi>ϕ</mi><annotation encoding="application/x-tex">&#92;&#112;&#104;&#105;</annotation></semantics></math></span> denotes the head parameters, and <span class="engineering-math"><math xmlns="http://www.w3.org/1998/Math/MathML" display="inline"><semantics><msub><mi mathvariant="script">ℒ</mi><mrow><mi mathvariant="normal">c</mi><mi mathvariant="normal">l</mi><mi mathvariant="normal">s</mi></mrow></msub><annotation encoding="application/x-tex">&#92;&#109;&#97;&#116;&#104;&#99;&#97;&#108;&#32;&#76;&#95;&#123;&#92;&#109;&#97;&#116;&#104;&#114;&#109;&#123;&#99;&#108;&#115;&#125;&#125;</annotation></semantics></math></span> is the regional classification objective.

Validation AP guided regional hyperparameter and checkpoint selection, with Optuna used for the parameter search. Training loss tracked fitting to the training labels; validation AP assessed the ranking of labelled regions. We interpreted precision–recall performance in the context of positive-label prevalence (Davis & Goadrich, 2006; Saito & Rehmsmeier, 2015).

##### Test {#model-lamar-cycle-04-test}

With human-adapted initialization, full fine-tuning reached maximum validation AP of **0.8100**, compared with **0.7813** for a frozen encoder. The best hyperparameter-search trial reached **0.8134**, and the final retained model achieved validation AP of **0.8100**.

| Human-adapted regional model | Maximum validation AP |
|---|---:|
| Frozen encoder; trainable head | 0.7813 |
| Encoder and head jointly fine-tuned | 0.8100 |

Original LAMAR with a frozen encoder reached **0.8181** in this comparison, placing the benefit of full fine-tuning specifically within the human-adapted configurations.

![Stage I training loss across pretraining, encoder-freezing and random-initialization configurations.](/assets/images/engineering-dry-dbtl/module-4-image-02.png){.engineering-figure style="--engineering-figure-width:1000px;--engineering-detail-width:1520px"}

![Early Stage I validation average-precision trajectories across encoder configurations.](/assets/images/engineering-dry-dbtl/module-4-image-03.png){.engineering-figure style="--engineering-figure-width:1000px;--engineering-detail-width:1660px"}

*Figure 4.2 | Training loss and early validation trajectories compare encoder configurations; the plotted PR-AUC denotes AP.*

##### Learn {#model-lamar-cycle-04-learn}

We adopted full fine-tuning for the human-adapted regional model and retained original LAMAR as a reference configuration. The comparison made encoder training a task-specific choice: lower training loss alone did not identify the strongest validation result. The Optuna framework supported the hyperparameter search (Akiba et al., 2019).

#### **Cycle 5**: Training candidate ranking {#model-lamar-cycle-05 .engineering-cycle-title}

##### Design {#model-lamar-cycle-05-design}

The local model's modest efficiency regression performance prompted a change in objective. Following further advice from PI Zefeng Wang, we focused on placing useful candidates near the top of a shortlist. This matched the experimental team's need to choose a limited number of sites for follow-up.

##### Build {#model-lamar-cycle-05-build}

Stage II acquired a scalar centre-token head that assigned each cytidine a ranking score <span class="engineering-math"><math xmlns="http://www.w3.org/1998/Math/MathML" display="inline"><semantics><msub><mi>s</mi><mi>i</mi></msub><annotation encoding="application/x-tex">&#115;&#95;&#105;</annotation></semantics></math></span>. We trained the encoder and scoring head with a **multi-positive log-sum-exp ranking loss**:

<div class="engineering-equation"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><msub><mi mathvariant="script">ℒ</mi><mrow><mi mathvariant="normal">r</mi><mi mathvariant="normal">a</mi><mi mathvariant="normal">n</mi><mi mathvariant="normal">k</mi></mrow></msub><mo>=</mo><mi>−</mi><mrow><mi mathvariant="normal">log</mi><mo>⁡</mo></mrow><mrow><mo stretchy="true" form="prefix">[</mo><mfrac><mrow><munder><mo>∑</mo><mrow><mi>i</mi><mo>∈</mo><mi>P</mi></mrow></munder><mrow><mi mathvariant="normal">exp</mi><mo>⁡</mo></mrow><mo stretchy="false" form="prefix">(</mo><msub><mi>s</mi><mi>i</mi></msub><mo stretchy="false" form="postfix">)</mo></mrow><mrow><munder><mo>∑</mo><mrow><mi>j</mi><mo>∈</mo><mi>C</mi></mrow></munder><mrow><mi mathvariant="normal">exp</mi><mo>⁡</mo></mrow><mo stretchy="false" form="prefix">(</mo><msub><mi>s</mi><mi>j</mi></msub><mo stretchy="false" form="postfix">)</mo></mrow></mfrac><mo stretchy="true" form="postfix">]</mo></mrow><mi>.</mi></mrow><annotation encoding="application/x-tex">&#10;&#92;&#109;&#97;&#116;&#104;&#99;&#97;&#108;&#123;&#76;&#125;&#95;&#123;&#92;&#109;&#97;&#116;&#104;&#114;&#109;&#123;&#114;&#97;&#110;&#107;&#125;&#125;&#10;&#61;&#32;&#45;&#92;&#108;&#111;&#103;&#92;&#108;&#101;&#102;&#116;&#91;&#10;&#92;&#102;&#114;&#97;&#99;&#123;&#92;&#115;&#117;&#109;&#95;&#123;&#105;&#92;&#105;&#110;&#32;&#80;&#125;&#92;&#101;&#120;&#112;&#40;&#115;&#95;&#105;&#41;&#125;&#10;&#123;&#92;&#115;&#117;&#109;&#95;&#123;&#106;&#92;&#105;&#110;&#32;&#67;&#125;&#92;&#101;&#120;&#112;&#40;&#115;&#95;&#106;&#41;&#125;&#10;&#92;&#114;&#105;&#103;&#104;&#116;&#93;&#46;&#10;</annotation></semantics></math></div>

<span class="engineering-math"><math xmlns="http://www.w3.org/1998/Math/MathML" display="inline"><semantics><mi>C</mi><annotation encoding="application/x-tex">&#67;</annotation></semantics></math></span> contains the cytidine candidates included in training for a region, and <span class="engineering-math"><math xmlns="http://www.w3.org/1998/Math/MathML" display="inline"><semantics><mi>P</mi><annotation encoding="application/x-tex">&#80;</annotation></semantics></math></span> contains its labelled positives. The loss increases the relative score weight assigned to the positive set. We changed the output interpretation, training objective and checkpoint criterion together, selecting the model by validation **Hit@10**.

##### Test {#model-lamar-cycle-05-test}

The checkpoint selected at the second epoch reached validation **Hit@10 = 0.8467**. On the test set, the top ten candidates included a supported site in **77.9%** of positive windows; the top twenty reached **92.1%**. The highest-ranked supported site's median position across test windows was **4**.

| Metric | Validation: 150 positive windows | Test: 140 positive windows |
|---|---:|---:|
| Hit@5 | 0.607 | 0.607 |
| Hit@10 | 0.847 | 0.779 |
| Hit@20 | 0.953 | 0.921 |
| Recall@10 | 0.635 | 0.573 |
| Recall@20 | 0.841 | 0.792 |

Hit@K measures the proportion of evaluated positive windows with at least one supported site among the top K candidates. Recall@K averages the fraction of supported sites recovered within each positive window. These metrics describe finding a useful lead and recovering the known sites, respectively.

![Candidate ranking in 140 positive test windows, with top-ten and top-twenty hit rates of 77.9% and 92.1%.](/assets/images/engineering-dry-dbtl/module-4-image-04.png){.engineering-figure style="--engineering-figure-width:760px;--engineering-detail-width:960px"}

*Figure 4.3 | Ranking in 140 known positive test windows supplied directly to Stage II relates candidate list length to hit rate and recall.*

##### Learn {#model-lamar-cycle-05-learn}

The model now returned ordered cytidine candidates for the experimental team to examine within each region. Finding useful sites under a limited budget became the practical objective. Further evaluation will assess the complete workflow and newly proposed candidates. The learning-to-rank framework reviewed by T.-Y. Liu (2009) provides a methodological basis for aligning the training objective with this use.

#### References {#model-lamar-references}

1. Akiba, T., Sano, S., Yanase, T., Ohta, T., & Koyama, M. (2019). Optuna: A next-generation hyperparameter optimization framework. In *Proceedings of the 25th ACM SIGKDD International Conference on Knowledge Discovery & Data Mining* (pp. 2623–2631). Association for Computing Machinery. [doi: 10.1145/3292500.3330701](<https://doi.org/10.1145/3292500.3330701>)

2. Davis, J., & Goadrich, M. (2006). The relationship between precision-recall and ROC curves. In *Proceedings of the 23rd International Conference on Machine Learning* (pp. 233–240). [doi: 10.1145/1143844.1143874](<https://doi.org/10.1145/1143844.1143874>)

3. Devlin, J., Chang, M.-W., Lee, K., & Toutanova, K. (2019). BERT: Pre-training of deep bidirectional transformers for language understanding. In *Proceedings of NAACL-HLT 2019* (Vol. 1, pp. 4171–4186). [doi: 10.18653/v1/N19-1423](<https://doi.org/10.18653/v1/N19-1423>)

4. Elkan, C., & Noto, K. (2008). Learning classifiers from only positive and unlabeled data. In *Proceedings of the 14th ACM SIGKDD International Conference on Knowledge Discovery and Data Mining* (pp. 213–220). Association for Computing Machinery. [doi: 10.1145/1401890.1401920](<https://doi.org/10.1145/1401890.1401920>)

5. Gururangan, S., Marasović, A., Swayamdipta, S., Lo, K., Beltagy, I., Downey, D., & Smith, N. A. (2020). Don’t stop pretraining: Adapt language models to domains and tasks. In D. Jurafsky, J. Chai, N. Schluter, & J. Tetreault (Eds.), *Proceedings of the 58th Annual Meeting of the Association for Computational Linguistics* (pp. 8342–8360). Association for Computational Linguistics. [doi: 10.18653/v1/2020.acl-main.740](<https://doi.org/10.18653/v1/2020.acl-main.740>)

6. Hu, E. J., Shen, Y., Wallis, P., Allen-Zhu, Z., Li, Y., Wang, S., Wang, L., & Chen, W. (2022). LoRA: Low-rank adaptation of large language models. In *International Conference on Learning Representations*. [Source](https://openreview.net/forum?id=nZeVKeeFYf9).

7. Liu, T.-Y. (2009). Learning to rank for information retrieval. *Foundations and Trends in Information Retrieval, 3*(3), 225–331. [doi: 10.1561/1500000016](<https://doi.org/10.1561/1500000016>)

8. Mudge, J. M., Carbonell-Sala, S., Diekhans, M., Martinez, J. G., Hunt, T., Jungreis, I., Loveland, J. E., Arnan, C., Barnes, I., Bennett, R., Berry, A., Bignell, A., Cerdán-Vélez, D., Cochran, K., Cortés, L. T., Davidson, C., Donaldson, S., Dursun, C., Fatima, R., … Frankish, A. (2025). GENCODE 2025: Reference gene annotation for human and mouse. *Nucleic Acids Research, 53*(D1), D966–D975. [doi: 10.1093/nar/gkae1078](<https://doi.org/10.1093/nar/gkae1078>)

9. Saito, T., & Rehmsmeier, M. (2015). The precision-recall plot is more informative than the ROC plot when evaluating binary classifiers on imbalanced datasets. *PLOS ONE, 10*(3), Article e0118432. [doi: 10.1371/journal.pone.0118432](<https://doi.org/10.1371/journal.pone.0118432>)

10. Vaswani, A., Shazeer, N., Parmar, N., Uszkoreit, J., Jones, L., Gomez, A. N., Kaiser, Ł., & Polosukhin, I. (2017). Attention is all you need. *Advances in Neural Information Processing Systems, 30*, 5998–6008. [Conference paper](https://proceedings.neurips.cc/paper/2017/hash/3f5ee243547dee91fbd053c1c4a845aa-Abstract.html).

11. Zhou, H., Hu, Y., Zheng, Y., Li, J., Peng, J., Hu, J., Yang, Y., Chen, W., Zhang, G., & Wang, Z. (2025). A foundation language model to decipher diverse regulation of RNAs. *Genome Biology, 26*, Article 301. [doi: 10.1186/s13059-025-03752-x](<https://doi.org/10.1186/s13059-025-03752-x>)


---

### Whole-body Model {#model-whole-body .engineering-chapter-title}

Modelling delivery and multisite editing
{.engineering-chapter-subtitle}

#### Overview {#model-whole-body-overview}

The whole-body model connects vector input, tissue distribution, blood–brain barrier transport, cellular expression and RNA editing. It examines how delivery losses and competing reactions shape the final APOE RNA profile.

Its wet-lab interface accepts editor configurations, expression time courses, APOE 112/158 editing rates, and bystander and off-target measurements for parameter updates. The simulations presented here use literature-informed priors and scenario parameters. They guide the choice of measurements, product-specific assays, doses and observation times.

Our contribution combines compartmental ordinary differential equations, explicit multisite reactions and a three-dimensional cellular model. Intended-product retention, unwanted editing and tissue coverage become distinct design objectives. Doses are normalized model inputs, and all results below are simulated.

[Read the full whole-body delivery model](https://github.com/pdx12320/WIKI_SUSTech-BIO/blob/main/wiki/pages/software.html#L38)

#### **Cycle 1**: Tracking intended RNA products {#model-whole-body-cycle-01 .engineering-cycle-title}

##### Design {#model-whole-body-cycle-01-design}

The initial model combined edited RNA into one variable, merging the intended APOE3-like product with the APOE2-like product formed by further editing. This aggregation could favour a higher dose while the intended product was being consumed. We redesigned the reaction network around explicit product identities.

##### Build {#model-whole-body-cycle-01-build}

Whole-body AAV modelling informed the compartmental framework (S. Liu et al., 2024). A shared state vector links systemic delivery, transport and expression through flux balances:

<div class="engineering-equation"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><mfrac><mrow><mi>d</mi><msub><mi>x</mi><mi>i</mi></msub></mrow><mrow><mi>d</mi><mi>t</mi></mrow></mfrac><mo>=</mo><mo>∑</mo><msub><mi>J</mi><mrow><mi mathvariant="normal">i</mi><mi mathvariant="normal">n</mi></mrow></msub><mo>−</mo><mo>∑</mo><msub><mi>J</mi><mrow><mi mathvariant="normal">o</mi><mi mathvariant="normal">u</mi><mi mathvariant="normal">t</mi></mrow></msub><mo>+</mo><msub><mi>P</mi><mi>i</mi></msub><mo>−</mo><msub><mi>L</mi><mi>i</mi></msub><mi>.</mi></mrow><annotation encoding="application/x-tex">&#10;&#92;&#102;&#114;&#97;&#99;&#123;&#100;&#120;&#95;&#105;&#125;&#123;&#100;&#116;&#125;&#61;&#92;&#115;&#117;&#109;&#32;&#74;&#95;&#123;&#92;&#109;&#97;&#116;&#104;&#114;&#109;&#123;&#105;&#110;&#125;&#125;&#45;&#92;&#115;&#117;&#109;&#32;&#74;&#95;&#123;&#92;&#109;&#97;&#116;&#104;&#114;&#109;&#123;&#111;&#117;&#116;&#125;&#125;&#43;&#80;&#95;&#105;&#45;&#76;&#95;&#105;&#46;&#10;</annotation></semantics></math></div>

The editing layer tracks unedited RNA, 112-only editing, 158-only editing and double editing, together with binding, dissociation, catalysis and degradation. The product labels follow the amino-acid differences among APOE isoforms (Weisgraber et al., 1981). For free APOE3-like RNA, S₃:

<div class="engineering-equation"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><mfrac><mrow><mi>d</mi><msub><mi>S</mi><mn>3</mn></msub></mrow><mrow><mi>d</mi><mi>t</mi></mrow></mfrac><mo>=</mo><msub><mi>J</mi><mrow><mi mathvariant="normal">e</mi><mi mathvariant="normal">d</mi><mi mathvariant="normal">i</mi><mi mathvariant="normal">t</mi><mn mathvariant="normal">112</mn></mrow></msub><mo>−</mo><msub><mi>J</mi><mrow><mi mathvariant="normal">d</mi><mi mathvariant="normal">e</mi><mi mathvariant="normal">g</mi><mn mathvariant="normal">3</mn></mrow></msub><mo>−</mo><msub><mi>J</mi><mrow><mi mathvariant="normal">b</mi><mi mathvariant="normal">i</mi><mi mathvariant="normal">n</mi><mi mathvariant="normal">d</mi><mn mathvariant="normal">158</mn><mo stretchy="false" form="prefix" mathvariant="normal">|</mo><mn mathvariant="normal">112</mn></mrow></msub><mo>+</mo><msub><mi>J</mi><mrow><mi mathvariant="normal">u</mi><mi mathvariant="normal">n</mi><mi mathvariant="normal">b</mi><mi mathvariant="normal">i</mi><mi mathvariant="normal">n</mi><mi mathvariant="normal">d</mi><mn mathvariant="normal">158</mn><mo stretchy="false" form="prefix" mathvariant="normal">|</mo><mn mathvariant="normal">112</mn></mrow></msub><mi>.</mi></mrow><annotation encoding="application/x-tex">&#10;&#92;&#102;&#114;&#97;&#99;&#123;&#100;&#83;&#95;&#51;&#125;&#123;&#100;&#116;&#125;&#61;&#74;&#95;&#123;&#92;&#109;&#97;&#116;&#104;&#114;&#109;&#123;&#101;&#100;&#105;&#116;&#49;&#49;&#50;&#125;&#125;&#45;&#74;&#95;&#123;&#92;&#109;&#97;&#116;&#104;&#114;&#109;&#123;&#100;&#101;&#103;&#51;&#125;&#125;&#10;&#45;&#74;&#95;&#123;&#92;&#109;&#97;&#116;&#104;&#114;&#109;&#123;&#98;&#105;&#110;&#100;&#49;&#53;&#56;&#124;&#49;&#49;&#50;&#125;&#125;&#43;&#74;&#95;&#123;&#92;&#109;&#97;&#116;&#104;&#114;&#109;&#123;&#117;&#110;&#98;&#105;&#110;&#100;&#49;&#53;&#56;&#124;&#49;&#49;&#50;&#125;&#125;&#46;&#10;</annotation></semantics></math></div>

The subsequent bound complex can undergo further editing to form the double-edited product. APOE3-like and combined APOE3/APOE2-like fractions are reported separately, normalized by the total free and bound APOE RNA pool. The compartmental ODE chain was integrated with SciPy’s LSODA solver (Petzold, 1983; Virtanen et al., 2020).

##### Test {#model-whole-body-cycle-01-test}

The explicit states revealed a trade-off hidden by aggregate editing. At 168 h, the fine dose scan reached 46.22% APOE3-like RNA at normalized dose 0.9. Combined editing was 58.55%, including 12.33% APOE2-like RNA. At dose 10, APOE2-like RNA outnumbered the intended product by approximately 3.5 to one.

![Multisite dose simulations separating intended product retention from combined editing and unwanted products.](/assets/images/engineering-dry-dbtl/module-5-image-01.svg){.engineering-figure style="--engineering-figure-width:800px;--engineering-detail-width:980px"}

*Figure 5.1 | Intended-product retention plateaus and declines while combined editing and unwanted products continue to increase.*

Each scanned dose failed at least one model feasibility criterion. Dose escalation alone did not resolve the competing objectives.

##### Learn {#model-whole-body-cycle-01-learn}

We retained explicit product states and evaluated intended-product retention alongside unwanted editing burden. Linked readouts of positions 112 and 158 became a priority for calibration because they can reveal further conversion of the intended product.

#### **Cycle 2**: Separating editing error sources {#model-whole-body-cycle-02 .engineering-cycle-title}

##### Design {#model-whole-body-cycle-02-design}

A single off-target pool obscured the source of unwanted editing. Improving PUF recognition could appear to solve a risk that also arose from local bystanders and deaminase background. We separated these mechanisms so that changing one parameter group would have an interpretable effect. Reports of RNA off-target activity from DNA-base-editing deaminases also motivated modelling catalytic background separately from intended recognition (Grünewald et al., 2019; C. Zhou et al., 2019).

##### Build {#model-whole-body-cycle-02-build}

Three branches track local bystander production, PUF-mismatch editing and recognition-independent deaminase background. Their cumulative outputs, normalized by the total free and bound APOE RNA pool, define the unwanted editing burden:

<div class="engineering-equation"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><msub><mi>B</mi><mrow><mi mathvariant="normal">o</mi><mi mathvariant="normal">f</mi><mi mathvariant="normal">f</mi></mrow></msub><mo>=</mo><mfrac><mrow><msub><mi>B</mi><mrow><mi mathvariant="normal">l</mi><mi mathvariant="normal">o</mi><mi mathvariant="normal">c</mi><mi mathvariant="normal">a</mi><mi mathvariant="normal">l</mi></mrow></msub><mo>+</mo><msub><mi>E</mi><mrow><mi mathvariant="normal">P</mi><mi mathvariant="normal">U</mi><mi mathvariant="normal">F</mi><mo mathvariant="normal">−</mo><mi mathvariant="normal">o</mi><mi mathvariant="normal">f</mi><mi mathvariant="normal">f</mi></mrow></msub><mo>+</mo><msub><mi>E</mi><mrow><mi mathvariant="normal">b</mi><mi mathvariant="normal">g</mi></mrow></msub></mrow><mrow><msub><mi>S</mi><mrow><mi mathvariant="normal">A</mi><mi mathvariant="normal">P</mi><mi mathvariant="normal">O</mi><mi mathvariant="normal">E</mi><mo mathvariant="normal">,</mo><mi mathvariant="normal">t</mi><mi mathvariant="normal">o</mi><mi mathvariant="normal">t</mi><mi mathvariant="normal">a</mi><mi mathvariant="normal">l</mi></mrow></msub><mo>+</mo><mi>ε</mi></mrow></mfrac><mi>.</mi></mrow><annotation encoding="application/x-tex">&#10;&#66;&#95;&#123;&#92;&#109;&#97;&#116;&#104;&#114;&#109;&#123;&#111;&#102;&#102;&#125;&#125;&#61;&#92;&#102;&#114;&#97;&#99;&#123;&#66;&#95;&#123;&#92;&#109;&#97;&#116;&#104;&#114;&#109;&#123;&#108;&#111;&#99;&#97;&#108;&#125;&#125;&#43;&#69;&#95;&#123;&#92;&#109;&#97;&#116;&#104;&#114;&#109;&#123;&#80;&#85;&#70;&#45;&#111;&#102;&#102;&#125;&#125;&#43;&#69;&#95;&#123;&#92;&#109;&#97;&#116;&#104;&#114;&#109;&#123;&#98;&#103;&#125;&#125;&#125;&#10;&#123;&#83;&#95;&#123;&#92;&#109;&#97;&#116;&#104;&#114;&#109;&#123;&#65;&#80;&#79;&#69;&#44;&#116;&#111;&#116;&#97;&#108;&#125;&#125;&#43;&#92;&#118;&#97;&#114;&#101;&#112;&#115;&#105;&#108;&#111;&#110;&#125;&#46;&#10;</annotation></semantics></math></div>

Here, <span class="engineering-math"><math xmlns="http://www.w3.org/1998/Math/MathML" display="inline"><semantics><mi>ε</mi><annotation encoding="application/x-tex">&#92;&#118;&#97;&#114;&#101;&#112;&#115;&#105;&#108;&#111;&#110;</annotation></semantics></math></span> stabilizes the denominator near zero. PUF-mismatch editing proceeds through a bound complex, whereas background editing has its own substrate pool and reaction coefficient:

<div class="engineering-equation"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><msub><mi>J</mi><mrow><mi mathvariant="normal">P</mi><mi mathvariant="normal">U</mi><mi mathvariant="normal">F</mi><mo mathvariant="normal">−</mo><mi mathvariant="normal">o</mi><mi mathvariant="normal">f</mi><mi mathvariant="normal">f</mi></mrow></msub><mo>=</mo><msub><mi>k</mi><mrow><mi mathvariant="normal">c</mi><mi mathvariant="normal">a</mi><mi mathvariant="normal">t</mi><mo mathvariant="normal">,</mo><mi mathvariant="normal">o</mi><mi mathvariant="normal">f</mi><mi mathvariant="normal">f</mi></mrow></msub><msub><mi>C</mi><mrow><mi mathvariant="normal">o</mi><mi mathvariant="normal">f</mi><mi mathvariant="normal">f</mi></mrow></msub><mo>,</mo><mspace width="2.0em" /><msub><mi>J</mi><mrow><mi mathvariant="normal">b</mi><mi mathvariant="normal">g</mi></mrow></msub><mo>=</mo><msub><mi>k</mi><mrow><mi mathvariant="normal">b</mi><mi mathvariant="normal">g</mi></mrow></msub><mi>P</mi><msub><mi>S</mi><mrow><mi mathvariant="normal">b</mi><mi mathvariant="normal">g</mi></mrow></msub><mi>.</mi></mrow><annotation encoding="application/x-tex">&#10;&#74;&#95;&#123;&#92;&#109;&#97;&#116;&#104;&#114;&#109;&#123;&#80;&#85;&#70;&#45;&#111;&#102;&#102;&#125;&#125;&#61;&#107;&#95;&#123;&#92;&#109;&#97;&#116;&#104;&#114;&#109;&#123;&#99;&#97;&#116;&#44;&#111;&#102;&#102;&#125;&#125;&#67;&#95;&#123;&#92;&#109;&#97;&#116;&#104;&#114;&#109;&#123;&#111;&#102;&#102;&#125;&#125;&#44;&#10;&#92;&#113;&#113;&#117;&#97;&#100;&#10;&#74;&#95;&#123;&#92;&#109;&#97;&#116;&#104;&#114;&#109;&#123;&#98;&#103;&#125;&#125;&#61;&#107;&#95;&#123;&#92;&#109;&#97;&#116;&#104;&#114;&#109;&#123;&#98;&#103;&#125;&#125;&#80;&#32;&#83;&#95;&#123;&#92;&#109;&#97;&#116;&#104;&#114;&#109;&#123;&#98;&#103;&#125;&#125;&#46;&#10;</annotation></semantics></math></div>

Local bystander production scales with the site-specific catalytic fluxes. This structure allows recognition, catalytic activity and background to vary independently.

##### Test {#model-whole-body-cycle-02-test}

In paired eight-repeat and ten-repeat simulations, the PUF-mismatch burden ratio was approximately 461, while the total unwanted burden ratio was 1.79. The large recognition-specific change partly reflected the encoded PUF prior; other branches continued to contribute to the total.

A separate dose comparison increased deaminase background by 3.35-fold between doses 0.5 and 2.0. These simulations showed why a recognition-only metric could give an incomplete picture of overall risk.

##### Learn {#model-whole-body-cycle-02-learn}

We retained the three branches and their separate outputs. PUF design decisions now target the recognition-related component, while activity and background parameters govern additional trade-offs. Calibration therefore requires measurements that distinguish these sources of unwanted editing.

#### **Cycle 3**: Connecting design and kinetics {#model-whole-body-cycle-03 .engineering-cycle-title}

##### Design {#model-whole-body-cycle-03-design}

Fixed kinetic rates could not express how sequence context, editing distance and recognition design change a candidate's behaviour. We introduced a sequence-to-kinetics layer to compare these design variables within the same reaction network.

##### Build {#model-whole-body-cycle-03-build}

Local context and distance scale catalytic activity. PUF repeat number and mismatch count scale recognition-related off-target kinetics, while deaminase background remains independently adjustable:

<div class="engineering-equation"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><msub><mi>α</mi><mrow><mi mathvariant="normal">c</mi><mi mathvariant="normal">a</mi><mi mathvariant="normal">t</mi></mrow></msub><mo>=</mo><mo stretchy="false" form="prefix">(</mo><mn>0.04</mn><mo>+</mo><mn>0.96</mn><msub><mi>s</mi><mrow><mi mathvariant="normal">U</mi><mi mathvariant="normal">C</mi></mrow></msub><mo stretchy="false" form="postfix">)</mo><mrow><mi mathvariant="normal">exp</mi><mo>⁡</mo></mrow><mo stretchy="false" form="prefix">(</mo><mi>−</mi><mn>0.9</mn><mo stretchy="false" form="prefix">|</mo><mi>d</mi><mo>−</mo><mn>2</mn><mo stretchy="false" form="prefix">|</mo><mo stretchy="false" form="postfix">)</mo><mo>,</mo></mrow><annotation encoding="application/x-tex">&#10;&#92;&#97;&#108;&#112;&#104;&#97;&#95;&#123;&#92;&#109;&#97;&#116;&#104;&#114;&#109;&#123;&#99;&#97;&#116;&#125;&#125;&#61;&#40;&#48;&#46;&#48;&#52;&#43;&#48;&#46;&#57;&#54;&#115;&#95;&#123;&#92;&#109;&#97;&#116;&#104;&#114;&#109;&#123;&#85;&#67;&#125;&#125;&#41;&#10;&#92;&#101;&#120;&#112;&#40;&#45;&#48;&#46;&#57;&#124;&#100;&#45;&#50;&#124;&#41;&#44;&#10;</annotation></semantics></math></div>

<div class="engineering-equation"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><msub><mi>α</mi><mrow><mi mathvariant="normal">P</mi><mi mathvariant="normal">U</mi><mi mathvariant="normal">F</mi><mo mathvariant="normal">−</mo><mi mathvariant="normal">o</mi><mi mathvariant="normal">f</mi><mi mathvariant="normal">f</mi></mrow></msub><mo>=</mo><mrow><mi mathvariant="normal">exp</mi><mo>⁡</mo></mrow><mo stretchy="false" form="prefix">[</mo><mi>−</mi><mn>1.4</mn><mrow><mi mathvariant="normal">max</mi><mo>⁡</mo></mrow><mo stretchy="false" form="prefix">(</mo><mi>R</mi><mo>−</mo><mn>8</mn><mo>,</mo><mn>0</mn><mo stretchy="false" form="postfix">)</mo><mo stretchy="false" form="postfix">]</mo><mrow><mi mathvariant="normal">exp</mi><mo>⁡</mo></mrow><mo stretchy="false" form="prefix">(</mo><mn>0.45</mn><mi>m</mi><mo stretchy="false" form="postfix">)</mo><mi>.</mi></mrow><annotation encoding="application/x-tex">&#10;&#92;&#97;&#108;&#112;&#104;&#97;&#95;&#123;&#92;&#109;&#97;&#116;&#104;&#114;&#109;&#123;&#80;&#85;&#70;&#45;&#111;&#102;&#102;&#125;&#125;&#61;&#10;&#92;&#101;&#120;&#112;&#91;&#45;&#49;&#46;&#52;&#92;&#109;&#97;&#120;&#40;&#82;&#45;&#56;&#44;&#48;&#41;&#93;&#92;&#101;&#120;&#112;&#40;&#48;&#46;&#52;&#53;&#109;&#41;&#46;&#10;</annotation></semantics></math></div>

Here, sUC is the context score, d the relative editing distance, R the repeat number and m the mismatch count. These mappings specify adjustable priors informed by published PUF–APOBEC editing behaviour (Han et al., 2022).

##### Test {#model-whole-body-cycle-03-test}

The mappings distinguished candidates according to the intended context and recognition variables. Testing the complete reaction network exposed a quantitative mismatch: the simulated context ratio was 1.78 against a benchmark range of 5–18.

Although the encoded catalytic ratio was 25, saturation compressed the resulting editing ratio. The distance test showed a related issue: the simulated +7/+2 editing ratio was 0.225 against a criterion below 0.20.

##### Learn {#model-whole-body-cycle-03-learn}

Sequence priors made candidate differences explicit, and the benchmark identified where those priors required calibration. We retained separate sequence modifiers while treating their coefficients as adjustable. Saturation and parameter identifiability became central to interpreting context-dependent predictions (identifiability background: Raue et al., 2009).

The repeat-number prior applies to the configurations that informed it. Module 1's PUF12 profile highlights the need to recalibrate this relationship for other editor backgrounds.

#### **Cycle 4**: Exploring parameter-dependent outcomes {#model-whole-body-cycle-04 .engineering-cycle-title}

##### Design {#model-whole-body-cycle-04-design}

A favourable trajectory at one parameter setting gave little information about its robustness. The context benchmark also showed that reaction outputs could respond nonlinearly to assumed rates. We extended the model from a single parameter vector to an ensemble of parameterized predictions (uncertainty-analysis background: Marino et al., 2008).

##### Build {#model-whole-body-cycle-04-build}

For sampled parameter vectors, the same reaction model produces a distribution of outcomes. The fraction satisfying criterion j is:

<div class="engineering-equation"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><msup><mi>y</mi><mrow><mo stretchy="false" form="prefix">(</mo><mi>b</mi><mo stretchy="false" form="postfix">)</mo></mrow></msup><mo>=</mo><mi>f</mi><mo stretchy="false" form="prefix">(</mo><msup><mi>θ</mi><mrow><mo stretchy="false" form="prefix">(</mo><mi>b</mi><mo stretchy="false" form="postfix">)</mo></mrow></msup><mo stretchy="false" form="postfix">)</mo><mo>,</mo><mspace width="2.0em" /><msub><mover><mi>p</mi><mo accent="true">̂</mo></mover><mi>j</mi></msub><mo>=</mo><mfrac><mn>1</mn><mi>B</mi></mfrac><munderover><mo>∑</mo><mrow><mi>b</mi><mo>=</mo><mn>1</mn></mrow><mi>B</mi></munderover><mn mathvariant="bold">𝟏</mn><mo stretchy="false" form="prefix">{</mo><msup><mi>y</mi><mrow><mo stretchy="false" form="prefix">(</mo><mi>b</mi><mo stretchy="false" form="postfix">)</mo></mrow></msup><mrow><mspace width="0.333em" /><mtext mathvariant="normal"> meets criterion </mtext><mspace width="0.333em" /></mrow><mi>j</mi><mo stretchy="false" form="postfix">}</mo><mi>.</mi></mrow><annotation encoding="application/x-tex">&#10;&#121;&#94;&#123;&#40;&#98;&#41;&#125;&#61;&#102;&#40;&#92;&#116;&#104;&#101;&#116;&#97;&#94;&#123;&#40;&#98;&#41;&#125;&#41;&#44;&#10;&#92;&#113;&#113;&#117;&#97;&#100;&#10;&#92;&#119;&#105;&#100;&#101;&#104;&#97;&#116;&#32;&#112;&#95;&#106;&#61;&#92;&#102;&#114;&#97;&#99;&#123;&#49;&#125;&#123;&#66;&#125;&#92;&#115;&#117;&#109;&#95;&#123;&#98;&#61;&#49;&#125;&#94;&#123;&#66;&#125;&#10;&#92;&#109;&#97;&#116;&#104;&#98;&#102;&#123;&#49;&#125;&#92;&#123;&#121;&#94;&#123;&#40;&#98;&#41;&#125;&#92;&#116;&#101;&#120;&#116;&#123;&#32;&#109;&#101;&#101;&#116;&#115;&#32;&#99;&#114;&#105;&#116;&#101;&#114;&#105;&#111;&#110;&#32;&#125;&#106;&#92;&#125;&#46;&#10;</annotation></semantics></math></div>

We used B=200 parameter sets for a hypothetical 10R-proapobec scenario at dose 0.9 and 168 h. Activity and background multipliers of 1.25 and 0.5 were scenario assumptions. These frequencies summarize the sampled parameter space.

##### Test {#model-whole-body-cycle-04-test}

Specificity was more robust than intended-product yield across the ensemble. Median specificity was 8.20; 86% of sets met the specificity criterion and 96% met the APOE2-like product proxy criterion.

The intended-product criterion was met by 23% of sets. The APOE3-like fraction ranged from 0.16% to 74.02% between the 5th and 95th percentiles.

![Product and specificity distributions across 200 sampled parameter sets.](/assets/images/engineering-dry-dbtl/module-5-image-02.svg){.engineering-figure style="--engineering-figure-width:800px;--engineering-detail-width:980px"}

*Figure 5.2 | Parameter sampling reveals a broad intended-product distribution despite more consistent specificity within the selected scenario.*

##### Learn {#model-whole-body-cycle-04-learn}

We adopted outcome distributions and criterion-specific pass frequencies for scenario evaluation. This changed the design question from choosing a favourable trajectory to identifying which outcomes remain reliable as parameters vary.

Expression time courses, linked two-site editing and background measurements became calibration priorities. Their value lies in constraining the processes responsible for the broad product-yield distribution.

#### **Cycle 5**: Resolving tissue-specific delivery {#model-whole-body-cycle-05 .engineering-cycle-title}

##### Design {#model-whole-body-cycle-05-design}

A well-mixed brain compartment assigns similar exposure to cells occupying different positions in tissue. An increase in average editing could therefore obscure low exposure far from vessels. We added spatial structure to examine this coverage gap.

##### Build {#model-whole-body-cycle-05-build}

We coupled PhysiCell (Ghaffarizadeh et al., 2018) and BioFVM (Ghaffarizadeh et al., 2016) to the systemic model’s brain-blood input. The spatial model tracks barrier release, extracellular diffusion, cellular uptake and intracellular reactions. Spatial transport is summarized by:

<div class="engineering-equation"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><mfrac><mrow><mi>∂</mi><mi>A</mi></mrow><mrow><mi>∂</mi><mi>t</mi></mrow></mfrac><mo>=</mo><mi>D</mi><msup><mi>∇</mi><mn>2</mn></msup><mi>A</mi><mo>+</mo><msub><mi>Q</mi><mrow><mi mathvariant="normal">B</mi><mi mathvariant="normal">B</mi><mi mathvariant="normal">B</mi></mrow></msub><mo stretchy="false" form="prefix">(</mo><mi mathvariant="bold-italic">𝒙</mi><mo>,</mo><mi>t</mi><mo stretchy="false" form="postfix">)</mo><mo>−</mo><mi>λ</mi><mi>A</mi><mo>−</mo><mi>U</mi><mo stretchy="false" form="prefix">(</mo><mi mathvariant="bold-italic">𝒙</mi><mo>,</mo><mi>t</mi><mo stretchy="false" form="postfix">)</mo><mi>.</mi></mrow><annotation encoding="application/x-tex">&#10;&#92;&#102;&#114;&#97;&#99;&#123;&#92;&#112;&#97;&#114;&#116;&#105;&#97;&#108;&#32;&#65;&#125;&#123;&#92;&#112;&#97;&#114;&#116;&#105;&#97;&#108;&#32;&#116;&#125;&#61;&#68;&#92;&#110;&#97;&#98;&#108;&#97;&#94;&#50;&#32;&#65;&#43;&#81;&#95;&#123;&#92;&#109;&#97;&#116;&#104;&#114;&#109;&#123;&#66;&#66;&#66;&#125;&#125;&#40;&#92;&#109;&#97;&#116;&#104;&#98;&#102;&#123;&#120;&#125;&#44;&#116;&#41;&#10;&#45;&#92;&#108;&#97;&#109;&#98;&#100;&#97;&#32;&#65;&#45;&#85;&#40;&#92;&#109;&#97;&#116;&#104;&#98;&#102;&#123;&#120;&#125;&#44;&#116;&#41;&#46;&#10;</annotation></semantics></math></div>

A denotes extracellular vector concentration, D diffusion, QBBB barrier release, λ decay and U local uptake. With one-way coupling and identical cell positions, we compared doses 0.3, 1 and 3 over 72 h. The tissue contained 800 neurons, 400 astrocytes and 280 endothelial cells.

##### Test {#model-whole-body-cycle-05-test}

Maximum relative mass-balance error remained below 1×10⁻¹¹ in all three scenarios. Increasing dose tenfold raised mean editing almost tenfold. At each dose, cells in the nearest vessel-distance quartile retained approximately four times the mean editing of cells in the farthest quartile.

![Spatial outputs by vessel distance and cell type, alongside sensitivity and design comparisons.](/assets/images/engineering-dry-dbtl/module-5-image-03.svg){.engineering-figure style="--engineering-figure-width:840px;--engineering-detail-width:960px"}

*Figure 5.3 | Panels C–D reveal a spatial coverage gap that persists as mean editing rises.*

##### Learn {#model-whole-body-cycle-05-learn}

Spatial coverage became a separate output alongside mean editing, with vessel-distance groups retained as the diagnostic. Dose primarily changed the magnitude of editing in these simulations. Delivery comparisons must therefore examine barrier release, diffusion and uptake together to address the uneven distribution revealed by the model.

<span id="references"></span>

#### <span id="dry-dbtl-references">References</span> {#model-whole-body-references}

1. Ghaffarizadeh, A., Friedman, S. H., & Macklin, P. (2016). BioFVM: An efficient, parallelized diffusive transport solver for 3-D biological simulations. *Bioinformatics, 32*(8), 1256–1258. [doi: 10.1093/bioinformatics/btv730](<https://doi.org/10.1093/bioinformatics/btv730>)

2. Ghaffarizadeh, A., Heiland, R., Friedman, S. H., Mumenthaler, S. M., & Macklin, P. (2018). PhysiCell: An open source physics-based cell simulator for 3-D multicellular systems. *PLOS Computational Biology, 14*(2), Article e1005991. [doi: 10.1371/journal.pcbi.1005991](<https://doi.org/10.1371/journal.pcbi.1005991>)

3. Grünewald, J., Zhou, R., Garcia, S. P., Iyer, S., Lareau, C. A., Aryee, M. J., & Joung, J. K. (2019). Transcriptome-wide off-target RNA editing induced by CRISPR-guided DNA base editors. *Nature, 569*(7756), 433–437. [doi: 10.1038/s41586-019-1161-z](<https://doi.org/10.1038/s41586-019-1161-z>)

4. Han, W., Huang, W., Wei, T., Ye, Y., Mao, M., & Wang, Z. (2022). Programmable RNA base editing with a single gRNA-free enzyme. *Nucleic Acids Research, 50*(16), 9580–9595. [doi: 10.1093/nar/gkac713](<https://doi.org/10.1093/nar/gkac713>)

5. Liu, S., Chowdhury, E. A., Xu, V., Jerez, A., Mahmood, L., Ly, B. Q., Le, H. K., Nguyen, A., Rajwade, A., Meno-Tetang, G., & Shah, D. K. (2024). Whole-body disposition and physiologically based pharmacokinetic modeling of adeno-associated viruses and the transgene product. *Journal of Pharmaceutical Sciences, 113*(1), 141–157. [doi: 10.1016/j.xphs.2023.10.005](<https://doi.org/10.1016/j.xphs.2023.10.005>)

6. Marino, S., Hogue, I. B., Ray, C. J., & Kirschner, D. E. (2008). A methodology for performing global uncertainty and sensitivity analysis in systems biology. *Journal of Theoretical Biology, 254*(1), 178–196. [doi: 10.1016/j.jtbi.2008.04.011](<https://doi.org/10.1016/j.jtbi.2008.04.011>)

7. Petzold, L. (1983). Automatic selection of methods for solving stiff and nonstiff systems of ordinary differential equations. *SIAM Journal on Scientific and Statistical Computing, 4*(1), 136–148. [doi: 10.1137/0904010](<https://doi.org/10.1137/0904010>)

8. Raue, A., Kreutz, C., Maiwald, T., Bachmann, J., Schilling, M., Klingmüller, U., & Timmer, J. (2009). Structural and practical identifiability analysis of partially observed dynamical models by exploiting the profile likelihood. *Bioinformatics, 25*(15), 1923–1929. [doi: 10.1093/bioinformatics/btp358](<https://doi.org/10.1093/bioinformatics/btp358>)

9. Virtanen, P., Gommers, R., Oliphant, T. E., Haberland, M., Reddy, T., Cournapeau, D., Burovski, E., Peterson, P., Weckesser, W., Bright, J., van der Walt, S. J., Brett, M., Wilson, J., Millman, K. J., Mayorov, N., Nelson, A. R. J., Jones, E., Kern, R., Larson, E., … SciPy 1.0 Contributors. (2020). SciPy 1.0: Fundamental algorithms for scientific computing in Python. *Nature Methods, 17*(3), 261–272. [doi: 10.1038/s41592-019-0686-2](<https://doi.org/10.1038/s41592-019-0686-2>)

10. Weisgraber, K. H., Rall, S. C., Jr., & Mahley, R. W. (1981). Human E apoprotein heterogeneity. Cysteine-arginine interchanges in the amino acid sequence of the apo-E isoforms. *Journal of Biological Chemistry, 256*(17), 9077–9083. [doi: 10.1016/S0021-9258(19)52510-8](<https://doi.org/10.1016/S0021-9258(19)52510-8>)

11. Zhou, C., Sun, Y., Yan, R., Liu, Y., Zuo, E., Gu, C., Han, L., Wei, Y., Hu, X., Zeng, R., Li, Y., Zhou, H., Guo, F., & Yang, H. (2019). Off-target RNA mutation induced by DNA base editing and its elimination by mutagenesis. *Nature, 571*(7764), 275–278. [doi: 10.1038/s41586-019-1314-0](<https://doi.org/10.1038/s41586-019-1314-0>)

## Functional Validation {#functional-validation .engineering-chapter-title}

*From Molecular Editing to Disease-Relevant Cellular Function*

### Overview {#functional-validation-overview}

<img class="engineering-overview-illustration" src="/assets/images/engineering-overviews/functional-validation.png" alt="Three experimental schematics in a triangular arrangement: electroporation, lipid-droplet imaging, and an extracellular amyloid-beta assay." width="1800" height="1080" decoding="async">

ORCA was developed with a therapeutic objective: to redirect APOE4 RNA toward an APOE3-equivalent coding outcome through programmable C-to-U editing. Our preceding Engineering work improved the editor, examined ways to regulate its expression, explored delivery strategies, and established tools to measure editing-related signals. Yet molecular editing, however precise, is not itself a measure of therapeutic function.

The next question was whether ORCA could be studied in a cell model expressing endogenous APOE, and whether editor treatment might be associated with changes in biologically relevant phenotypes. We therefore moved beyond artificial reporters to a human astrocyte-related cell model and pursued three complementary experiments: establishing plasmid delivery, examining lipid-droplet-associated structures, and assessing extracellular Aβ42 handling. Together, these studies mark an initial transition from **engineering an RNA editor** to **investigating what its intended molecular correction might mean for cellular function**.

### Engineering Rationale {#functional-validation-engineering-rationale}

#### 1. Beyond Molecular Editing {#functional-validation-1-beyond-molecular-editing}

The significance of the APOE4-to-APOE3 conversion lies not simply in changing a nucleotide, but in the different biological properties of the resulting apoE isoforms. APOE4 is strongly associated with Alzheimer's disease (AD) risk, and its effects extend to lipid metabolism and amyloid-related processes in the central nervous system. An APOE4-targeting RNA editor is therefore meaningful only if its molecular activity can eventually be connected to those cellular functions.

Our artificial APOE reporters and editor benchmarks allow target activity and bystander editing to be evaluated under controlled conditions. Endogenous APOE, however, is expressed within a different RNA and cellular environment. Even a verified target-site edit would leave further questions: does the edited transcript yield functional apoE, is the amount of APOE3-equivalent product sufficient to alter the cellular phenotype, and are any changes attributable to the intended correction rather than another effect of treatment?

Astrocytes provide an appropriate starting point for investigating these questions. They are a major source of apoE in the brain, participate in lipid transport and cholesterol homeostasis, and contribute to extracellular Aβ processing. In human iPSC-derived brain-cell models, Lin et al. reported APOE4-associated astrocytic abnormalities—including altered cholesterol handling and reduced Aβ42 uptake—and improvement in selected phenotypes after APOE4-to-APOE3 DNA correction [1].

We therefore selected two complementary functional directions. **Lipid-droplet phenotyping** examines a cellular feature closely related to apoE's role in lipid metabolism. **Extracellular Aβ42 assessment** extends the investigation toward a process with more direct relevance to AD amyloid pathology. Neither is a stand-alone assay of therapeutic efficacy; together, they provide biologically motivated ways to begin testing the consequences that ORCA's molecular design is intended to achieve.

#### 2. Choosing a Disease-Relevant Cellular Model {#functional-validation-2-choosing-a-disease-relevant-cellular-model}

##### Our Initial Choice: APOE4/4 iPSC-Derived Astrocytes {#functional-validation-our-initial-choice-apoe4-4-ipsc-derived-astrocytes}

We initially prioritized human iPSC-derived APOE4/4 cortical astrocytes supplied by **BrainXell** [2]. Their human astrocytic background offered a more disease-relevant context than a conventional immortalized line, while the APOE4/4 genotype provided a relatively straightforward starting point for endogenous editing experiments. At the intended target position, unedited APOE4 transcripts would not already be mixed with the corresponding APOE3 signal from a second allele.

This model was also closely aligned with the literature motivating our functional assays. Studies in human iPSC-derived astrocytes have associated APOE4 with altered lipid storage, increased lipid-droplet accumulation, and impaired Aβ-related functions [1, 3]. Such cells would therefore have been valuable for investigating both the molecular correction and its possible consequences in a more physiological cellular setting. A rigorous genotype-specific functional comparison would still require suitably matched APOE3 controls; the APOE4/4 product alone would not provide an isogenic comparison.

Our interest progressed beyond preliminary planning. We contacted BrainXell, discussed the purchase, and received a formal quotation with an adjusted cell quantity and price. The procurement process reached the pre-order stage, but importing the cells presented an important practical obstacle.

Under the relevant 2025 Chinese customs biosafety classification schedule, one Category C1 provision applies to cells directly sourced from specified internationally recognized culture collections. Its accompanying list identifies six collections—ATCC, JCRB, DSMZ, RBRC, ECACC, and KCLB—and does not include BrainXell [4]. Our proposed purchase could not be placed under that particular direct-source criterion without further regulatory assessment. This did **not** mean that cells supplied by other organizations were prohibited; rather, the applicable classification, documentation, and approval route required additional clarification. Requirements for importing human-derived biological materials, combined with cold-chain logistics and our limited experimental timeline, made timely procurement uncertain [5].

We therefore discontinued this procurement route for the current project. The decision reflected feasibility within an iGEM schedule, not a change in the scientific value of the APOE4/4 iPSC model.

##### Our Final Choice: CCF-STTG1 {#functional-validation-our-final-choice-ccf-sttg1}

We selected **CCF-STTG1**, a human astrocytoma-derived cell line with astrocyte-associated characteristics, as an accessible model for initial functional studies. Importantly, it was not chosen solely because it was available. Published work has documented endogenous apoE expression and secretion in CCF-STTG1, and Fan et al. confirmed its **APOE3/APOE4** background while using the cells to examine apoE regulation, ABCA1-associated responses, and lipid-related processes [6, 7].

These properties make CCF-STTG1 useful in several specific ways. Its endogenous APOE provides a more natural transcript context than a transfected APOE4 reporter or overexpression plasmid. Its documented apoE-related biology supports exploratory investigation of lipid-associated cellular features. As an adherent, expandable line, it also enables repeated delivery experiments, fluorescence imaging, and collection of culture supernatants within a workable timeframe.

Nevertheless, **CCF-STTG1 is a substitute for particular experimental tasks, not a biological equivalent of APOE4/4 iPSC-derived astrocytes**. The distinction matters for three reasons.

First, CCF-STTG1 originates from a malignant astrocytoma. Its proliferative and metabolic state, abnormal karyotype, and degree of astrocytic differentiation may differ substantially from those of normal human astrocytes [6]. Detectable apoE secretion does not establish that all aspects of normal astrocytic lipid physiology are preserved.

Second, its APOE3/4 background complicates molecular interpretation. Endogenous APOE3 transcripts already carry the target-site base expected after APOE4 C-to-U editing. Consequently, a C388 T fraction in cDNA sequencing cannot be read directly as a newly generated editing percentage; allelic RNA abundance and assay bias also need to be considered. The tumor-derived genetic background adds further reasons not to assume simple allele dosage.

Third, findings established in isogenic APOE3/3 and APOE4/4 iPSC models cannot simply be transferred to CCF-STTG1. The coexistence of APOE3 and APOE4, together with tumor-associated metabolic differences, may alter baseline lipid droplets or Aβ42 handling. Moreover, a phenotype observed after editor treatment would not, on its own, demonstrate that endogenous APOE4 correction caused it.

These considerations defined our use of the model. **CCF-STTG1 could support delivery assessment and preliminary observations in human cells expressing endogenous APOE; APOE4/4 iPSC-derived astrocytes remain a more appropriate future setting for rigorous, genotype-controlled functional validation.**

![Figure 1 — From an Ideal Model to a Feasible Model](/assets/images/submission-20261017/results/figure-1-cell-model-selection.png)

*Figure 1. Selection of a feasible model for ORCA functional validation. BrainXell APOE4/4 iPSC-derived astrocytes were our preferred model and procurement reached the formal-quotation stage. Import-classification and scheduling constraints led us to adopt CCF-STTG1 for preliminary experiments. The quoted regulatory excerpt is an English translation of the cited Chinese classification provision [4].*

#### 3. Lipid Homeostasis: From APOE Function to a Cellular Phenotype {#functional-validation-3-lipid-homeostasis-from-apoe-function-to-a-cellular-phenotype}

Our first functional direction concerned lipid homeostasis, one of the cellular processes most closely connected to apoE biology. ApoE participates in lipid transport, while APOE isoforms differ in their effects on lipid-associated pathways. We therefore asked whether the intended APOE4-to-APOE3-equivalent correction might eventually be reflected in a visible change in cellular lipid storage.

Lipid droplets are dynamic organelles that store neutral lipids, including triacylglycerols and cholesteryl esters. Their abundance and morphology depend on lipid synthesis, storage, utilization, and cellular state. Farmer et al. observed altered fatty-acid metabolism and the formation of more, generally smaller lipid droplets in astrocytes expressing human APOE4 than in APOE3 counterparts [8]. In an independent human iPSC-derived glial model, Sienski et al. found increased triglyceride accumulation and more lipid droplets in APOE4/4 astrocytes; aspects of the lipid phenotype were responsive to metabolic intervention [3].

These studies suggested a specific hypothesis for ORCA: **if APOE4 RNA correction changes apoE-related cellular function, APOE4-associated lipid-droplet abnormalities may become less pronounced**. We selected **BODIPY 493/503** fluorescence imaging to investigate this possibility. The dye highlights neutral-lipid-rich structures and permits observation of punctate features, their dimensions, and their spatial distribution [9].

Lipid-droplet imaging is valuable because it moves the assessment beyond the RNA sequence itself. At the same time, a decrease in fluorescent puncta does not automatically mean restored lipid homeostasis: lipid droplets are physiologically important, and their appearance can change for reasons unrelated to APOE editing. We therefore treated BODIPY phenotyping as an exploratory cellular readout, rather than a direct measurement of therapeutic rescue.

![Figure 2 — APOE4-Associated Lipid-Droplet Dysregulation](/assets/images/submission-20261017/results/figure-2-lipid-droplet-rationale.png)

*Figure 2. Literature-based rationale for lipid-droplet phenotyping. Published astrocyte data from Sienski et al. [3] and Farmer et al. [8] illustrate APOE4-associated lipid-droplet alterations; the ORCA panel presents our proposed RNA-editing hypothesis, not an observed treatment outcome. Original studies used LipidTOX and LipidSpot, respectively.*

#### 4. Aβ42 Handling: Connecting Function to AD Pathology {#functional-validation-4-a-42-handling-connecting-function-to-ad-pathology}

Although lipid droplets offer a readout closely related to apoE's physiological role, they capture only one aspect of APOE4 biology. We therefore sought a complementary assay linked more directly to the amyloid pathology of AD: the ability of astrocytes to handle **extracellular Aβ42**.

Astrocytes participate in extracellular Aβ removal, and this function is influenced by APOE genotype. Lin et al. compared human iPSC-derived APOE3 and APOE4 astrocytes after an **exogenous Aβ42 oligomer challenge**. Measurement of the remaining peptide in culture medium, alongside complementary cellular evidence, showed impaired removal in APOE4 astrocytes. The same study found improved Aβ42-related function after CRISPR/Cas9-mediated **DNA** correction from APOE4/4 to APOE3/3 [1]. Additional work has connected ApoE4-related Aβ clearance defects to astrocytic endosomal trafficking [10].

These findings are especially relevant because they go beyond an association between genotype and phenotype: they show that correcting APOE4 at the DNA level can improve an AD-relevant cellular function in an appropriate model. ORCA acts at the RNA level, so an equivalent outcome cannot be assumed. Nevertheless, the findings provide a strong rationale for testing whether APOE4 RNA-directed intervention might affect Aβ42 handling.

We therefore designed an **exogenous Aβ42 challenge followed by supernatant ELISA**. Unlike BODIPY imaging, which examines intracellular neutral-lipid-associated structures, this assay measures the extracellular peptide remaining after incubation. Supernatant depletion alone does not prove uptake, since degradation, aggregation, adsorption, and recovery can also affect detectable Aβ42. With suitable controls, however, it offers a complementary starting point for investigating a disease-relevant cellular process.

![Figure 3 — APOE4-Dependent Aβ42 Clearance](/assets/images/submission-20261017/results/figure-3-abeta42-rationale.png)

*Figure 3. Rationale for assessing extracellular Aβ42 handling. Published data from Lin et al. [1] show APOE4-associated impairment of Aβ42 removal and improvement after APOE4-to-APOE3 DNA correction. The ORCA panel depicts a proposed RNA-editing application and an ELISA-based readout, not demonstrated ORCA efficacy.*

### Experiment I — Establishing Electroporation in CCF-STTG1 {#functional-validation-cycle-01 .engineering-cycle-title data-cycle-label="Experiment I"}

#### Design {#functional-validation-cycle-01-design}

Before testing ORCA-associated phenotypes, we needed a practical route to express plasmid constructs in CCF-STTG1. Zhao et al. had reported Neon electroporation of this cell line at **1200 V, 20 ms, two pulses**, providing a useful published starting point [11]. Rather than assuming that the same voltage was optimal for our plasmid and culture conditions, we retained the reported pulse width and number while screening **1100–1400 V in 50-V increments**.

We used an **mCherry-only expression plasmid** to assess delivery-associated expression without introducing RNA recognition or editing activity into the readout. Fluorescence measurements and observations of cell morphology were considered together when selecting a working condition.

#### Build {#functional-validation-cycle-01-build}

Each condition received approximately **1 × 10⁵ CCF-STTG1 cells** and **0.5 μg mCherry-only plasmid**. After electroporation and approximately 72 hours of culture, we collected brightfield and fluorescence images and acquired flow-cytometry data. Common FSC/SSC and downstream analysis gates were applied across voltage groups to compare ECD-A fluorescence and scatter-defined event fractions.

#### Test {#functional-validation-cycle-01-test}

Brightfield images showed an apparent reduction in spread, adherent cells at higher voltages (Figure 4A). At **1350 V**, microscopy demonstrated detectable mCherry expression (Figure 4B).

Within the P2 analysis gate, median ECD-A fluorescence generally increased with voltage, peaking at **3,684.30 a.u. at 1350 V** before falling to **2,955.60 a.u. at 1400 V** (Figure 4C1). In contrast, the fraction of acquired events inside the fixed FSC/SSC-defined P1 gate decreased progressively, from **55.80% at 1100 V** to **30.13% at 1400 V** (Figure 4C2). This fraction describes scatter-gating behavior; it is **not** a measured cell-viability rate.

![Figure 4 — Establishing Electroporation in CCF-STTG1](/assets/images/submission-20261017/results/figure-4-electroporation.png)

*Figure 4. Electroporation screening in CCF-STTG1. (A) Brightfield fields across selected voltages. (B) Brightfield and mCherry fluorescence at 1350 V. (C1) Median P2-gated ECD-A fluorescence for all seven voltages. (C2) Fraction of acquired events within the fixed P1 scatter gate. The latter is an operational flow-cytometry metric, not a direct viability measurement.*

[Supplementary Figure 4: selected fluorescence distributions](/assets/images/submission-20261017/results/supplementary-figure-4-fluorescence-distributions.png)

#### Learn {#functional-validation-cycle-01-learn}

Increasing voltage improved the observed reporter signal only up to a point, while the scatter-defined event population changed progressively. Moving from 1350 V to 1400 V reduced both median fluorescence and the P1-gated fraction. We therefore selected **1350 V, 20 ms, two pulses** as a **provisional working condition** for subsequent CCF-STTG1 experiments. This screen established a route to detectable plasmid expression, without claiming a calibrated transfection rate or a universally optimal voltage.

### Experiment II — Investigating Lipid-Droplet Phenotypes {#functional-validation-cycle-02 .engineering-cycle-title data-cycle-label="Experiment II"}

#### Design {#functional-validation-cycle-02-design}

With plasmid delivery established, we investigated whether treatment with our selected Integrated ORCA candidates was associated with lipid-droplet-related changes consistent with the functional direction motivated by APOE4 research. Four groups were included: **untreated CTRL**, **electroporated empty vector (EV)**, **IO-02**, and **IO-03**. CTRL provided an untreated image reference, while EV was the key comparator for the two electroporated editor groups.

#### Build {#functional-validation-cycle-02-build}

Following treatment and approximately three days of culture, we stained neutral-lipid-associated structures with **BODIPY 493/503**, counterstained nuclei with **DAPI**, and acquired images on a ZEISS LSM 800 confocal microscope.

Because subtle differences between EV and the IO groups were difficult to assess visually, we also implemented a reproducible analysis of the original CZI BODIPY channels. The workflow used **Difference-of-Gaussians (DoG)** filtering to emphasize local fluorescence contrast, local-peak detection, **watershed segmentation**, and common shape and contrast filters. The primary operational definition retained compact candidate puncta with apparent areas of **0.08–12 μm²**. Detection overlays and parameter-sensitivity analyses allowed the image-derived measurements to be reviewed rather than inferred from appearance alone.

#### Test {#functional-validation-cycle-02-test}

##### Direct Observation {#functional-validation-direct-observation}

Untreated CTRL images contained conspicuous bright BODIPY-positive puncta (Figure 5). The EV field also showed visibly fewer prominent punctate features than CTRL. We considered electroporation-associated membrane perturbation or stress as a possible contributor, while recognizing that CTRL and the treated groups also differed in their green-channel acquisition settings. The CTRL-to-EV contrast therefore could not establish a causal electroporation effect or support an uncalibrated quantitative intensity comparison.

Both IO-treated fields appeared to contain fewer prominent puncta than EV, but these differences were less obvious by eye. We consequently used the acquisition-compatible **EV-to-IO comparison** for our principal exploratory image analysis.

![Figure 5 — Confocal Observation of Lipid-Droplet Phenotypes](/assets/images/submission-20261017/results/figure-5-confocal-observation.png)

*Figure 5. Confocal BODIPY 493/503 (green) and DAPI (blue) images of CTRL, EV, IO-02, and IO-03 CCF-STTG1 cells. Arrows identify prominent punctate features in CTRL. The CTRL acquisition differed from the treated groups in green-channel settings; images are presented as observations, not calibrated cross-group intensity measurements.*

##### Quantitative Image Analysis {#functional-validation-quantitative-image-analysis}

Under the common primary detection settings, the EV field contained **12 high-contrast BODIPY-positive candidate puncta**, compared with **2 in IO-02 and 2 in IO-03**—an **83.3% lower operational count** in either IO field. Their total detected candidate areas were **32.41 μm²**, **2.35 μm²**, and **4.35 μm²**, respectively, corresponding to **92.8%** and **86.6%** lower detected areas relative to EV (Figure 6B).

To examine dependence on analysis choices, we evaluated **1,701 parameter combinations** and displayed an EV-normalized threshold-sensitivity comparison (Figure 6C). Across the illustrated threshold range, both IO fields retained fewer detected candidates than EV. This tests an image-analysis relationship, not biological reproducibility; object classification and parameter choices still affect the estimates.

Mean whole-field green intensities did **not** fall in parallel: **8.21 a.u. (EV), 8.47 a.u. (IO-02), and 8.36 a.u. (IO-03)** (Figure 6D). The observed difference therefore concerns prominent localized fluorescence features rather than a demonstrated decrease in overall neutral-lipid content.

![Figure 6 — Quantitative Characterization of BODIPY-Positive Puncta](/assets/images/submission-20261017/results/figure-6-quantitative-analysis.png)

*Figure 6. Exploratory analysis of BODIPY images. (A) DoG enhancement, candidate detection, watershed segmentation, and morphology-based filtering. (B) Operational candidate counts and detected areas in EV and IO fields. (C) EV-normalized threshold sensitivity. (D) Whole-field mean BODIPY signal. Measurements derive from one field per group; detected objects are image-analysis candidates, not validated individual lipid droplets.*

#### Learn {#functional-validation-cycle-02-learn}

Two observations shaped our interpretation. First, the difference between untreated CTRL and EV showed why a treatment-matched reference is essential: common experimental procedures may affect the lipid-associated phenotype, and imaging settings also constrain comparison. Second, the IO-02 and IO-03 fields yielded fewer prominent algorithm-detected BODIPY puncta than EV, a **preliminary direction consistent with the lipid phenotype we hoped to investigate**.

This result is exploratory. Each group contributed **one analyzable confocal field**, detected objects have not been independently validated as individual lipid droplets, and the endogenous APOE4 editing experiment did not establish a reliable estimate of newly generated target-site editing in CCF-STTG1. The images therefore identify a phenotype worth testing with matched, independently replicated imaging and molecular evidence; they do **not** establish lipid-homeostasis rescue or its causation by ORCA.

### Experiment III — Exploring Extracellular Aβ42 Handling {#functional-validation-cycle-03 .engineering-cycle-title data-cycle-label="Experiment III"}

#### Design {#functional-validation-cycle-03-design}

We next extended the functional assessment beyond lipid storage to extracellular Aβ42. We designed an **exogenous Aβ42 challenge followed by supernatant ELISA**, intending to compare residual peptide under different editor treatments rather than infer cellular uptake from imaging or endogenous secretion.

**EV, PUF12, IO-02, and IO-03** were included at **700 and 1400 ng** DNA input, alongside **PUF-only (700 ng)** and untreated **CTRL**. Two cell-free references were particularly important: **BLANK 0 h** represented the initial Aβ42-containing medium, whereas **BLANK 6 h** represented medium incubated for the same period without cells. They were designed to help distinguish cell-associated removal from noncellular changes in detectable Aβ42.

#### Build {#functional-validation-cycle-03-build}

Cells were challenged with a **nominal 200 nM Aβ42** concentration, and culture supernatants were collected after **6 hours**. We used the Elabscience Human Aβ1–42 ELISA Kit (**E-EL-H0543**), with standards covering **0–1000 pg/mL**. Each cellular condition included two prepared samples, each measured in three technical ELISA wells; cell-free reference preparations were also measured in triplicate.

The assay required substantial dilution to bring samples from the much higher challenge concentration into the kit's pg/mL calibration range. Our planned dilution was **2000-fold**.

#### Test {#functional-validation-cycle-03-test}

The standard series produced a clear concentration-dependent OD450 response. Four-parameter logistic fitting gave **R² = 0.999872** and an RMSE of **0.01249 OD**, supporting an internally consistent calibration within the tested range (Figure 7B).

Experimental samples also produced strong absorbance signals, but **all 72 cellular and cell-free reference wells** were above the highest measured standard. Sample OD450 values ranged from **4.5166 to 5.0361**, compared with **3.35245** for the mean of the **1000 pg/mL** standard (Figure 7C). The samples were therefore outside the calibrated range, preventing reliable back-calculation of residual Aβ42 concentrations or treatment-dependent clearance comparisons.

![Figure 7 — Exploring Extracellular Aβ42 Handling Through ELISA](/assets/images/submission-20261017/results/figure-7-extracellular-abeta42.png)

*Figure 7. (A) CCF-STTG1 treatment groups, cell-free Aβ42 references, and the planned supernatant ELISA workflow. (B) Experimental Aβ42 standard series and 4PL calibration. (C) All 72 sample/reference OD450 readings exceed the highest standard response. The calibration curve was obtained, but residual concentrations and functional clearance differences could not be quantified.*

#### Learn {#functional-validation-cycle-03-learn}

Review of the preparation workflow identified a **tenfold dilution-factor calculation and execution error**: samples had been diluted **200-fold rather than the planned 2000-fold**. Based on the nominal 200 nM starting concentration, 200-fold dilution would give approximately **4514 pg/mL**, compared with approximately **451 pg/mL** at 2000-fold. These are theoretical input-based estimates, not measured post-incubation concentrations. The insufficient dilution is consistent with the uniformly above-range sample readings.

The experiment established a usable within-range calibration response, but not a valid comparison of extracellular Aβ42 handling. A future run must verify the dilution calculation and test a pilot dilution series against the assay's calibrated range before repeating the same treatment and cell-free controls.

### Conclusion {#functional-validation-conclusion}

These three experiments moved ORCA beyond artificial reporters into an accessible human cell model expressing endogenous APOE. We established a preliminary electroporation condition, observed lipid-associated image features that warrant further investigation, and implemented an Aβ42 ELISA workflow whose calibration succeeded although the sample concentrations could not be recovered.

The studies also defined the remaining evidence gap. The BODIPY comparison requires independent biological replication and stronger identification of lipid droplets; the Aβ42 assay requires a verified dilution range; and both functional directions require reliable endogenous APOE editing measurements before any change can be attributed to APOE4-to-APOE3 RNA correction. **Functional Validation thus marks ORCA's first disease-relevant cellular exploration—not a demonstrated therapeutic rescue, but a concrete starting point for establishing one.**

### References {#functional-validation-references}

1. Lin, Y. T., et al. (2018). *APOE4 Causes Widespread Molecular and Cellular Alterations Associated with Alzheimer's Disease Phenotypes in Human iPSC-Derived Brain Cell Types.* **Neuron**, 98(6), 1141–1154.e7. https://doi.org/10.1016/j.neuron.2018.05.008
2. BrainXell. *Human iPSC-Derived Cortical Astrocytes* (product information). https://brainxell.com/product-category/astrocytes/cortical-astrocytes/
3. Sienski, G., et al. (2021). *APOE4 disrupts intracellular lipid homeostasis in human iPSC-derived glia.* **Science Translational Medicine**, 13(583), eaaz4564. https://doi.org/10.1126/scitranslmed.aaz4564
4. Guangzhou Customs / General Administration of Customs of China (2025). *Biosafety Risk Classification Schedule for Entry-Exit Special Items*, Category C1 and Appendix 2 (Chinese-language regulatory schedule). https://www.tid.gov.hk/en/tradecircular/files/2025/ci6102025a.pdf
5. General Administration of Customs of China (2026). *Regulations on Health Quarantine Administration of Special Goods and Articles Entering and Leaving China*, Order No. 281. https://policy.mofcom.gov.cn/claw/clawContent.shtml?id=104767
6. ATCC. *CCF-STTG1 (CRL-1718)*, cell-line information. https://www.atcc.org/products/crl-1718
7. Fan, J., et al. (2016). *Identification of a Chrysanthemic Ester as an Apolipoprotein E Inducer in Astrocytes.* **PLOS ONE**, 11(9), e0162384. https://doi.org/10.1371/journal.pone.0162384
8. Farmer, B. C., Kluemper, J., & Johnson, L. A. (2019). *Apolipoprotein E4 Alters Astrocyte Fatty Acid Metabolism and Lipid Droplet Formation.* **Cells**, 8(2), 182. https://doi.org/10.3390/cells8020182
9. Qiu, B., & Simon, M. C. (2016). *BODIPY 493/503 Staining of Neutral Lipid Droplets for Microscopy and Quantification by Flow Cytometry.* **Bio-protocol**, 6(17), e1912. https://doi.org/10.21769/BioProtoc.1912
10. Prasad, H., & Rao, R. (2018). *Amyloid clearance defect in ApoE4 astrocytes is reversed by epigenetic correction of endosomal pH.* **PNAS**, 115(28), E6640–E6649. https://doi.org/10.1073/pnas.1801612115
11. Zhao, W., et al. (2020). *Axl receptor tyrosine kinase is a regulator of apolipoprotein E.* **Molecular Brain**, 13, 66. https://doi.org/10.1186/s13041-020-00609-1
