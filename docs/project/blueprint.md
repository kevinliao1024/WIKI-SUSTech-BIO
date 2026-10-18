---
title: Blueprint
subtitle: From an APOE4-targeting editor to the ORCA editing system.
eyebrow: Project
---

# Blueprint

## Fundamental Research

The two initial design–build–test–learn cycles are now part of [Fundamental Research in Engineering](/engineering#fundamental-research):

- [Cycle 1 — Adapting 10R-REWIRE to APOE4](/engineering#fundamental-research-cycle-01)
- [Cycle 2 — Selecting the PUF Recognition Backbone](/engineering#fundamental-research-cycle-02)

---

## From an Editor to an Editing System

Selecting PUF12 established a working recognition backbone, but optimizing the editor alone could not address every requirement of programmable RNA editing. We also needed strategies to regulate activity, deliver the editor, measure its effects, and support systematic target design.

We organized the next stage of ORCA engineering into **five connected routes: EDIT, CONTROL, DELIVER, MEASURE, and MODEL**. Each addresses a distinct system-level challenge.

### 01. EDIT — Refining the Molecular Editor

We pursued three complementary approaches to the PUF–APOBEC machinery:

**POD — Programmable On-target Docking.** This route focused on the PUF recognition domain, introducing targeted mutations into individual repeats to investigate nucleotide recognition and target discrimination [3,4].

**CETUS — Cytidine Editing, Tethered for Uridine Switching.** This route focused on the APOBEC catalytic domain, designing and evaluating variants to investigate how catalytic modifications influence editing activity and specificity [5].

**Integrated ORCA (IO).** Combined engineered PUF and APOBEC variants to examine their behavior within a single editor.

### 02. CONTROL — Regulating Expression and Activity

Our **G.M.A.C.** framework explored four regulatory strategies:

<p class="control-milestone-legend">Milestones accumulate: Designed → Built → Validated. Validation refers to the function stated for each module.</p>

<div class="control-overview-grid">
<article class="control-overview-card" aria-labelledby="control-summary-gfa">
<h4 id="control-summary-gfa"><a href="/engineering#gfa">GFA</a></h4>
<p class="control-overview-role">Transcriptional control [6]</p>
<div class="control-milestones" data-control-module="gfa" role="group" aria-label="GFA: milestones achieved"><span class="control-milestone control-milestone--designed"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m15 5 4 4M4 20l4-1L20 7a2.8 2.8 0 0 0-4-4L4 15v5Z"/></svg>Designed</span><span class="control-milestone control-milestone--built"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m12 3 9 5v8l-9 5-9-5V8l9-5Zm-9 5 9 5 9-5M12 13v8M7.5 5.5l9 5"/></svg>Built</span><span class="control-milestone control-milestone--validated"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m5 12 4 4L19 6"/></svg>Validated</span></div>
<p class="control-evidence-note">Cell-context-dependent transcriptional regulation demonstrated; universal astrocyte specificity not established.</p>
</article>
<article class="control-overview-card" aria-labelledby="control-summary-mre">
<h4 id="control-summary-mre"><a href="/engineering#mre">MRE</a></h4>
<p class="control-overview-role">Post-transcriptional regulation [7]</p>
<div class="control-milestones" data-control-module="mre" role="group" aria-label="MRE: milestones achieved"><span class="control-milestone control-milestone--designed"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m15 5 4 4M4 20l4-1L20 7a2.8 2.8 0 0 0-4-4L4 15v5Z"/></svg>Designed</span><span class="control-milestone control-milestone--built"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m12 3 9 5v8l-9 5-9-5V8l9-5Zm-9 5 9 5 9-5M12 13v8M7.5 5.5l9 5"/></svg>Built</span></div>
<p class="control-evidence-note">Constructed and tested; miRNA-specific suppression not established. Excluded from the final ORCA design.</p>
</article>
<article class="control-overview-card" aria-labelledby="control-summary-aso">
<h4 id="control-summary-aso"><a href="/engineering#aso">ASO</a></h4>
<p class="control-overview-role">Externally induced suppression [8]</p>
<div class="control-milestones" data-control-module="aso" role="group" aria-label="ASO: milestones achieved"><span class="control-milestone control-milestone--designed"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m15 5 4 4M4 20l4-1L20 7a2.8 2.8 0 0 0-4-4L4 15v5Z"/></svg>Designed</span><span class="control-milestone control-milestone--built"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m12 3 9 5v8l-9 5-9-5V8l9-5Zm-9 5 9 5 9-5M12 13v8M7.5 5.5l9 5"/></svg>Built</span><span class="control-milestone control-milestone--validated"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m5 12 4 4L19 6"/></svg>Validated</span></div>
<p class="control-evidence-note">Tag-dependent suppression of editing demonstrated; recovery after ASO withdrawal remains unverified.</p>
</article>
<article class="control-overview-card" aria-labelledby="control-summary-cre-loxp">
<h4 id="control-summary-cre-loxp"><a href="/engineering#cre-loxp">Cre–loxP</a></h4>
<p class="control-overview-role">Proposed permanent shutdown [9]</p>
<div class="control-milestones" data-control-module="cre-loxp" role="group" aria-label="Cre–loxP: milestones achieved"><span class="control-milestone control-milestone--designed"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m15 5 4 4M4 20l4-1L20 7a2.8 2.8 0 0 0-4-4L4 15v5Z"/></svg>Designed</span></div>
<p class="control-evidence-note">DNA-level shutdown strategy designed; excision and permanent shutdown remain experimentally unverified.</p>
</article>
</div>

### 03. DELIVER — Developing an AAV9 Delivery Strategy

We constructed AAV-compatible vectors and carried out two packaging rounds, progressing from an **mCherry-based proof of concept** to an **ORCA-containing vector** (background on AAV9 delivery and mCherry: [10,11]).

### 04. MEASURE — Quantifying RNA Editing

We redesigned a fluorescence-based editing reporter and developed **SONAR (System for Optical Normalization and Analysis of RNA Editing)**, a multilayer framework spanning flow-cytometry processing, normalized fluorescence readouts, empirical calibration, and exploratory sequencing-linked editing estimates (related flow-cytometry calibration methodology: [12]).

### 05. MODEL — Connecting Editing Evidence, Editor Design and Delivery

Our [Model](/model) workflow connects experimental editing profiles with computational design to improve specificity while preserving useful target activity. **RNA-seq analysis** establishes candidate editing evidence under a common screening procedure. **PUF modeling** ranks recognition-domain variants and explores additional sequence designs, while **APOBEC modeling** connects structural hypotheses with experimental evaluation of catalytic-domain variants. **LAMAR** uses RNA-seq-derived labels to prioritize RNA regions and cytidines for further testing.

At the system scale, the [Whole-body Delivery Model](/software#rewire) connects delivery, tissue distribution, cellular expression and multisite RNA editing. Parameter scans, uncertainty analysis and complementary spatial simulations examine how these processes shape intended RNA products, unwanted editing and tissue coverage. Together, these models guide experimental choices and help evaluate trade-offs across the complete delivery and editing strategy.

### Bringing the Routes Together

The five routes extend ORCA beyond the editing reaction itself, providing a coordinated framework for **molecular optimization, biological regulation, delivery, measurement, and modeling**.

---

## References

1. Han W, Huang W, Wei T, et al. Programmable RNA base editing with a single gRNA-free enzyme. *Nucleic Acids Research*. 2022;50(16):9580–9595. <https://doi.org/10.1093/nar/gkac713>
2. Zhao YY, Mao MW, et al. Expanding RNA binding specificity and affinity of engineered PUF domains. *Nucleic Acids Research*. 2018;46(9):4771–4782. <https://doi.org/10.1093/nar/gky134>
3. Wang X, McLachlan J, Zamore PD, Hall TMT. Modular recognition of RNA by a human Pumilio-homology domain. *Cell*. 2002;110(4):501–512. <https://doi.org/10.1016/S0092-8674(02)00873-5>
4. Cheong CG, Hall TMT. Engineering RNA sequence specificity of Pumilio repeats. *Proceedings of the National Academy of Sciences USA*. 2006;103(37):13635–13639. <https://doi.org/10.1073/pnas.0606294103>
5. Sharma S, Patnaik SK, Taggart RT, et al. APOBEC3A cytidine deaminase induces RNA editing in monocytes and macrophages. *Nature Communications*. 2015;6:6881. <https://doi.org/10.1038/ncomms7881>
6. Lee Y, Messing A, Su M, Brenner M. GFAP promoter elements required for region-specific and astrocyte-specific expression. *Glia*. 2008;56(5):481–493. <https://doi.org/10.1002/glia.20622>
7. Brown BD, Venneri MA, Zingale A, Sergi Sergi L, Naldini L. Endogenous microRNA regulation suppresses transgene expression in hematopoietic lineages and enables stable gene transfer. *Nature Medicine*. 2006;12(5):585–591. <https://doi.org/10.1038/nm1398>
8. Wu H, Lima WF, Zhang H, et al. Determination of the role of the human RNase H1 in the pharmacology of DNA-like antisense drugs. *Journal of Biological Chemistry*. 2004;279(17):17181–17189. <https://doi.org/10.1074/jbc.M311683200>
9. Sauer B, Henderson N. Site-specific DNA recombination in mammalian cells by the Cre recombinase of bacteriophage P1. *Proceedings of the National Academy of Sciences USA*. 1988;85(14):5166–5170. <https://doi.org/10.1073/pnas.85.14.5166>
10. Foust KD, Nurre E, Montgomery CL, et al. Intravascular AAV9 preferentially targets neonatal neurons and adult astrocytes. *Nature Biotechnology*. 2009;27(1):59–65. <https://doi.org/10.1038/nbt.1515>
11. Shaner NC, Campbell RE, Steinbach PA, et al. Improved monomeric red, orange and yellow fluorescent proteins derived from Discosoma sp. red fluorescent protein. *Nature Biotechnology*. 2004;22(12):1567–1572. <https://doi.org/10.1038/nbt1037>
12. Castillo-Hair SM, Sexton JT, Landry BP, et al. FlowCal: a user-friendly, open source software tool for automatically converting flow cytometry data from arbitrary to calibrated units. *ACS Synthetic Biology*. 2016;5(7):774–780. <https://doi.org/10.1021/acssynbio.5b00284>
