---
title: Results
subtitle: From Molecular Engineering to Therapeutic Exploration
eyebrow: Project
---

# Results

*From Molecular Engineering to Therapeutic Exploration*

ORCA began with a therapeutic question: could programmable C-to-U RNA editing redirect APOE4 transcripts toward an APOE3-equivalent coding outcome without altering the genome? Achieving the intended edit, however, is only one part of a useful RNA-editing system. The editor must also balance activity with specificity, be regulated and delivered to relevant cells, and produce results that can be measured and interpreted.

We addressed these challenges through five interconnected routes—**EDIT, CONTROL, DELIVER, MEASURE, and MODEL**—before taking our first steps toward disease-relevant cellular evaluation. Here, we bring together their principal outcomes and examine how far the resulting platform has progressed beyond molecular editing.

## 01. EDIT — Engineering a More Precise RNA Editor

We first improved ORCA at the molecular level, engineering the PUF recognition domain and APOBEC catalytic domain independently before evaluating them in combination. Throughout, the goal was not simply higher editing at the intended APOE4 cytidine, **C388**, but a more favorable balance between that edit and potentially damaging bystander conversions.

**POD (Programmable On-target Docking)** examined how targeted changes to PUF tripartite recognition motifs (TRMs) [5,6] affect RNA recognition and editing outcomes. Across 81 evaluated variants, performance depended strongly on both repeat position and recognition-motif composition. One representative candidate, **P9-NTQ**, retained **93.88%** of the parental PUF12 C388 activity while improving selectivity relative to C295 and C871 by **1.29-fold** and **2.90-fold**, respectively. These results showed that local recognition-interface engineering could improve particular specificity trade-offs without necessarily sacrificing most target activity.

**CETUS (Cytidine Editing, Tethered for Uridine Switching)** addressed APOBEC sequence-context preference. **G27T–K30H–Q58M** achieved a **GCG/GCA editing ratio of 2.156** while retaining **77.3%** of target activity in one combination batch, and remained competitive in a later batch (**ROF 1.218; activity retention 0.980**). **M132E** provided an activity-retaining single-mutant candidate (**retention 1.018; ROF 1.062**) and retained more activity than M132D in a matched combination background. These distinct performance profiles motivated their subsequent evaluation with POD in Integrated ORCA.

We then combined four POD and four CETUS candidates to design **16 Integrated ORCA configurations**, of which **14** were sequence-verified and functionally evaluated alongside the parental editor and relevant single-module controls. C388 editing varied widely, from **0.81% to 77.18%**. Some pairings preserved strong activity; others lost activity despite containing individually promising modules. **Optimization of separate domains was therefore not reliably additive.**

Selection also required looking beyond the target site. Relative to the parental editor's **79.17% C871 editing**, **IO-02** and **IO-03** reduced this potentially stop-generating bystander signal to **13.84%** and **14.28%**, respectively. We additionally evaluated editing across **290 non-target cytidines** in the sequenced APOE coding region and examined co-editing within individual sequencing reads. Integrating target activity, potentially disruptive bystanders, and read-level composition led us to select two complementary editors: **IO-02 (61.31% C388 editing)** and **IO-03 (69.78%)**. IO-02 offered a more favorable profile across broader potentially nonsynonymous bystanders, whereas IO-03 combined stronger target activity with advantages in avoiding selected predicted premature-stop changes.

**The outcome of EDIT was not a single maximum-efficiency variant, but a candidate-selection strategy that evaluates what happens to the edited RNA molecule as a whole.** Detailed mutation screens and comparative benchmarks are presented in POD, CETUS, and Integrated ORCA Engineering.

## 02. CONTROL — Regulating Expression and Editing Activity

Specificity at the RNA-binding interface cannot, by itself, control which cells express an editor or how long its activity persists. Our **G.M.A.C. framework** therefore explored four complementary regulatory approaches: transcriptional control, post-transcriptional regulation, externally induced suppression, and permanent shutdown.

For **transcriptional control**, we investigated the compact **gfaABC1D** promoter [7]. Relative to CMV within each cell background, gfaABC1D drove lower ORCA expression in HEK293T but higher expression in U251. Target-site Sanger measurements followed the same direction: the editing-associated signal changed from **73.5% under CMV to 8.5% under gfaABC1D** in HEK293T, but from **7.5% to 57.0%** in U251. These semi-quantitative observations supported strong **cell-context dependence**, rather than establishing universal astrocyte specificity.

For **post-transcriptional regulation** [8], we tested a **4×6T MRE** architecture and a reduced configuration. MRE-containing constructs repeatedly showed substantially attenuated expression, but the experiments did not establish convincing miRNA-specific suppression. We therefore **excluded the MRE module from the final ORCA design** instead of retaining a regulatory feature without adequate functional support.

The **ASO** [9] route provided a more direct means of external intervention. After engineering a synthetic ASO-binding tag, treatment with **C805 ASO** reduced tagged mCherry fluorescence by **78.6% at 48 hours**. Introducing the same tag into ORCA lowered C388 editing from **57.13% to 28.54%** at 48 hours—a **50.04% relative decrease**—with substantial suppression still observed at 96 hours. Untagged ORCA did not show the same response. This established **tag-dependent suppression of editing output**, although recovery after ASO withdrawal remains to be demonstrated.

Finally, we designed a **Cre–loxP** strategy in which a later AAV–Cre intervention could excise the ORCA expression cassette. This DNA-level shutdown mechanism remains **a proposed design, not an experimentally validated result**.

Taken together, CONTROL identified two particularly useful components for further work: **gfaABC1D** for cell-background-dependent transcriptional regulation and the **synthetic ASO tag** for externally induced attenuation of editing activity.

## 03. DELIVER — Exploring AAV9-Mediated Delivery

The intended APOE4 correction is transient at the RNA level: newly synthesized transcripts would continue to require editing. This made **AAV9** an attractive prospective delivery platform because of its potential for sustained expression, while ORCA's relatively compact architecture offered a path toward meeting AAV payload constraints.

We progressed through three experimental stages. First, **AAV–mCherry** was used to establish a three-plasmid packaging, recovery, purification, and genome-quantification workflow. Although mCherry expression was visible in producer cells, recovered viral-genome signals were low and no clear fluorescence was observed in the preliminary recipient-cell test.

Next, we independently constructed **GFA–ORCA** and **CMV–ORCA** AAV transfer vectors and completed packaging, purification, and concentration. Provisional genome-titer estimates were **4.69 × 10¹² vg/mL** and **3.40 × 10¹¹ vg/mL**, respectively. These values remained subject to dilution-related and other quality-control uncertainties; genome copies do not establish intact, infectious particles.

Finally, we applied the GFA–ORCA AAV9 preparation to human **CCF-STTG1** cells and assayed ORCA transcripts by reverse-transcription PCR. No clear expected ORCA band was detected in the treated-cell cDNA. Thus, we established an initial production and recipient-cell testing workflow, **but have not yet demonstrated functional AAV9-mediated ORCA expression or editing**. The next challenge is to connect viral preparation quality with verified transduction, expression, and molecular editing in recipient cells.

## 04. MEASURE — Making Reporter Signals Interpretable

To evaluate successive ORCA designs, we developed **SONAR (System for Optical Normalization and Analysis of RNA Editing)**, linking reporter construction, quantitative interpretation, and a reusable analysis workflow.

Across ten Engineering cycles, we established an editing-responsive reporter built around **mCherry** [11] as an expression reference, **EGFP** as an editing-associated readout, and an **ecDHFR destabilizing domain (DD)** to modulate reporter-protein stability [10]. AC/INAC reference constructs, TMP perturbation, reporter-dose optimization, the sequence-verified **RepOpen-A-1** reporter, and the **P2A–BFP** editor marker refined both the experimental system and its interpretation.

A critical result emerged when the reporter was tested with real editors: increasing ORCA input generally increased **BFP-positive coexpression** and the reporter's sequencing-based target-site substitution signal, but **normalized green fluorescence did not increase correspondingly**. An editing-responsive reporter therefore could not be treated as a direct readout of RNA editing percentage.

We organized the measurement problem into four layers. **Layer 0** standardizes cell-population selection and background handling. **Layer 1** calculates the **Reporter Activity Score (RAS)** from continuous EGFP and mCherry signals. **Layer 2** uses AC/INAC input mixtures to empirically calibrate a **Relative Editing Score (RES)**, which represents a reference-input equivalent rather than a measured fraction of edited RNA. **Layer 3** connects optical measurements with independent molecular evidence toward a **Predicted Editing Rate (PER)**. This final step remains exploratory: an absolutely calibrated PER has **not** yet been established.

The **SONAR Analysis Program (SAP)** brings these concepts into a software-oriented workflow for flow-cytometry processing, layered analysis, visualization, and reusable outputs. Together, Reporter Engineering and SONAR Measurement provide a clearer distinction between **reporter response**, **relative optical calibration**, and **molecular editing evidence**.

## 05. MODEL — Connecting Experimental Evidence with Computational Design

Our [Model](/model) workflow connected measured editing profiles with editor design and RNA-site prioritization. Analysis of **36 RNA-seq libraries** established candidate-site profiles under a common screening procedure, supporting comparisons of target signals and unintended editing.

**PUF modeling** linked candidate selection to experimental testing, followed by assay-informed assessment of specificity ranking. Across 66 constructs, the **PUF-ESM Specificity Ranker** achieved Spearman **ρ = 0.405** in grouped evaluation. Its predicted Top30 recovered **20 of the measured Top30**, compared with **13.64** expected from random selection within the same cohort. **APOBEC modeling** connected structural hypotheses, mutant screening and combination design. The lead combination reached a target-to-comparison-site ratio of **2.156** while retaining **77.3% of parental target activity** in the same experimental batch.

**LAMAR** translated RNA-seq-supported patterns into ranked shortlists for further site validation. In Stage II testing, the top 10 and top 20 candidates included a supported site in **77.9% and 92.1% of 140 positive windows**, respectively. These results describe prioritization within the evaluated data, rather than confirmed activity at every ranked site.

The [Whole-body Delivery Model](/software#rewire) extended this workflow to delivery, tissue distribution, expression and multisite RNA reactions. Parameter scans, sensitivity analysis, uncertainty analysis and spatial simulations examined trade-offs among intended-product retention, unwanted editing and tissue coverage. These simulation outputs support comparisons of delivery and editing assumptions and identify processes for experimental follow-up.

## 06. Functional Validation — Toward Disease-Relevant Cellular Effects

Molecular editing is necessary for ORCA's therapeutic ambition, but it is not sufficient. A transcript carrying the desired APOE4-to-APOE3-equivalent change must ultimately produce a meaningful biological consequence. We therefore moved beyond artificial APOE reporters to explore two functions associated with astrocytic apoE biology: **lipid homeostasis** and **extracellular Aβ42 handling**.

### Choosing an Endogenous-APOE Cell Model

Astrocytes are major contributors to apoE production and lipid transport in the central nervous system, and participate in extracellular Aβ processing. Published studies—including **Lin et al. (2018)** and **Sienski et al. (2021)**—have linked APOE4 astrocytes to altered lipid metabolism and Aβ-related phenotypes, providing a rationale for both experimental directions [1,2,3,12].

Our preferred model was initially **APOE4/4 human iPSC-derived astrocytes** from BrainXell. Purchasing advanced to quotation and pre-order discussions, but uncertainty around import requirements, cold-chain delivery, and the project schedule prevented their timely use. We instead selected **CCF-STTG1**, a human astrocytoma-derived line with documented apoE expression, secretion, and lipid-related responses. Its reported **APOE3/APOE4 background** [4] allowed us to investigate endogenous APOE-associated biology in an experimentally accessible human cell model.

This choice also defined the interpretation of our experiments. CCF-STTG1 is **not equivalent to a normal APOE4/4 astrocyte model**. In particular, endogenous APOE3 transcripts can already contribute a target-site T signal, complicating any attempt to attribute that signal to new C-to-U editing. We therefore treated these experiments as **initial functional exploration**, not proof of endogenous APOE4 correction.

![Figure 1 — Cell model selection](/assets/images/submission-20261017/results/figure-1-cell-model-selection.png)

*Figure 1. Selection of CCF-STTG1 as an experimentally feasible endogenous-APOE model following constraints on obtaining APOE4/4 iPSC-derived astrocytes.*

The two functional readouts were grounded in prior work connecting APOE4 with lipid-droplet abnormalities and altered Aβ42 processing. We first needed a reliable way to introduce plasmids into CCF-STTG1, then examined lipid-related cellular structures and extracellular Aβ42 signals.

![Figure 2 — Lipid-droplet rationale](/assets/images/submission-20261017/results/figure-2-lipid-droplet-rationale.png)

*Figure 2. Published astrocyte studies motivate lipid-droplet phenotyping as a possible functional readout of APOE4-directed intervention (adapted material from Sienski et al., 2021, and Farmer et al., 2019).*

![Figure 3 — Aβ42 handling rationale](/assets/images/submission-20261017/results/figure-3-abeta42-rationale.png)

*Figure 3. Published APOE4-associated Aβ42 uptake deficits and improvement after APOE4-to-APOE3 DNA correction motivate the corresponding ORCA RNA-editing hypothesis (panels A–B adapted from Lin et al., 2018).*

### Experiment I — Establishing CCF-STTG1 Electroporation

AAV9-mediated expression was not yet verified, so we used electroporation as an independent route for preliminary cellular studies. Starting from published CCF-STTG1 conditions, we screened **1100–1400 V in 50-V steps** while holding pulse width at **20 ms** and pulse number at **two**. Each condition received approximately **1 × 10⁵ cells** and **0.5 μg mCherry-only plasmid**, allowing delivery and expression to be evaluated without confounding them with ORCA activity.

At approximately 72 hours, both microscopy and flow cytometry showed exogenous mCherry expression. Median fluorescence generally increased with voltage, reaching its highest value at **1350 V** before declining at 1400 V. Higher voltages were also associated with fewer visibly spread adherent cells and a declining proportion of events within the fixed FSC/SSC gate. This scatter-gate fraction was **not** interpreted as a direct cell-viability measurement.

Balancing the stronger reporter signal with observed cell condition, we adopted **1350 V, 20 ms, two pulses** as a provisional working setting for subsequent experiments.

![Figure 4 — CCF-STTG1 electroporation](/assets/images/submission-20261017/results/figure-4-electroporation.png)

*Figure 4. Electroporation-voltage optimization in CCF-STTG1 using mCherry expression, cell morphology, and flow-cytometric scatter profiles.*

[Supplementary Figure 4: selected fluorescence distributions](/assets/images/submission-20261017/results/supplementary-figure-4-fluorescence-distributions.png)

### Experiment II — Investigating Lipid-Droplet-Related Phenotypes

We next compared four CCF-STTG1 conditions: **untreated CTRL**, **electroporated empty vector (EV)**, **IO-02**, and **IO-03**. Neutral-lipid-associated structures were stained with **BODIPY 493/503**, nuclei with DAPI, and the cells imaged by confocal microscopy.

CTRL cells displayed conspicuous bright BODIPY-positive puncta. Importantly, **EV also differed visibly from untreated CTRL**, indicating that the electroporation and vector-treatment background mattered. Acquisition settings for CTRL and the treated groups were not fully matched, so we did not use their displayed intensities for uncalibrated quantitative comparisons. Both IO-treated fields showed fewer prominent puncta, but the key comparison was **IO versus EV**, not IO versus untreated cells.

![Figure 5 — Confocal lipid-related observations](/assets/images/submission-20261017/results/figure-5-confocal-observation.png)

*Figure 5. Representative BODIPY 493/503 and DAPI confocal images of untreated, EV, IO-02, and IO-03 CCF-STTG1 cells.*

We quantified EV and IO images from the **original CZI BODIPY channels** using the same Difference-of-Gaussians enhancement, local-peak detection, watershed segmentation, and morphology filters. The primary analysis considered compact BODIPY-positive punctate candidates with areas of **0.08–12 μm²**.

Under these operational criteria, the analyzed **EV field contained 12 candidates**, versus **2 each** in the IO-02 and IO-03 fields—an **83.3% lower count** in either IO field. Total detected candidate areas were **32.41 μm² (EV)**, **2.35 μm² (IO-02)**, and **4.35 μm² (IO-03)**, corresponding to reductions of **92.8%** and **86.6%** relative to EV. The direction of the puncta-count difference remained consistent across the illustrated threshold-sensitivity analyses drawn from **1,701 parameter combinations**.

Crucially, mean whole-field BODIPY intensity did **not** decrease in parallel (**8.21, 8.47, and 8.36 a.u.** for EV, IO-02, and IO-03). The result therefore concerns the **distribution of prominent punctate structures**, not a demonstrated reduction in total neutral-lipid content.

![Figure 6 — Quantitative BODIPY image analysis](/assets/images/submission-20261017/results/figure-6-quantitative-analysis.png)

*Figure 6. Consistent image-analysis criteria identified fewer high-contrast BODIPY-positive punctate candidates in IO-treated fields than in EV, without a corresponding decline in mean whole-field fluorescence.*

These findings provide a **phenotypic signal worth following up**, not an established functional rescue. The quantitative comparison used **one analyzable confocal field per group**; the segmented objects have not been independently validated as individual lipid droplets; and **additional endogenous APOE4 RNA editing was not reliably confirmed** in these cells. Larger matched-acquisition datasets and molecular verification will be needed before linking the observed phenotype causally to ORCA-mediated APOE4 correction.

### Experiment III — Exploring Extracellular Aβ42 Handling

Our second functional direction examined **residual extracellular Aβ42** after a six-hour challenge, rather than assuming that supernatant depletion directly measures cellular uptake. Conditions included **EV, PUF12, IO-02, and IO-03** at **700 ng and 1400 ng** plasmid input, plus **PUF-only (700 ng)** and untreated **CTRL**. Cell-free **BLANK 0 h** and **BLANK 6 h** samples provided references for the starting Aβ42 signal and changes occurring in culture medium without cells. Each culture condition had two preparations with three ELISA technical wells per preparation.

Cells were exposed to a nominal **200 nM Aβ42** challenge. We assayed collected supernatants with the Elabscience Human Aβ1–42 ELISA kit (**E-EL-H0543**). The standard series, covering **0–1000 pg/mL**, showed a clear concentration–absorbance relationship; a four-parameter logistic fit gave **R² = 0.999872** (RMSE **0.01249 OD**).

However, **all 72 sample and cell-free reference wells** had OD450 values of **4.5166–5.0361**, exceeding the highest standard's mean OD450 of **3.35245**. The sample signals therefore lay outside the reliable quantification range. Rechecking the preparation records identified a **tenfold dilution-factor calculation and execution error**: samples had been diluted **200-fold instead of the planned 2000-fold**. From the nominal starting concentration, those dilutions would correspond to approximately **4514 pg/mL** and **451 pg/mL**, respectively; these are *theoretical starting-concentration estimates*, not measurements of Aβ42 remaining after incubation.

![Figure 7 — Extracellular Aβ42 ELISA](/assets/images/submission-20261017/results/figure-7-extracellular-abeta42.png)

*Figure 7. The Aβ42 ELISA standard curve was internally consistent, but every experimental and cell-free sample exceeded its calibrated range, preventing valid concentration comparisons.*

Thus, Experiment III established an initial ELISA workflow and demonstrated why sample dilution must be verified against the assay's dynamic range, but **did not yield valid residual-Aβ42 concentrations or evidence of a treatment-dependent clearance difference**. A verified dilution pilot, followed by the same cellular and cell-free controls, is needed before this functional question can be tested quantitatively.

## 07. Conclusion — What ORCA Has Established

Across EDIT, CONTROL, DELIVER, MEASURE, and MODEL, ORCA progressed from a programmable PUF–APOBEC editor toward a more integrated engineering platform. **POD, CETUS, and Integrated ORCA** produced and compared candidates using target activity and bystander consequences rather than target efficiency alone. **G.M.A.C.** identified promising transcriptional and externally responsive control strategies, while **AAV9 work** established an initial vector-production and recipient-cell testing workflow. **SONAR** clarified how fluorescence can—and cannot—be used to infer editing. **MODEL** connected RNA-seq evidence, PUF and APOBEC engineering, LAMAR site prioritization and whole-body simulations to guide further experimental evaluation.

The functional experiments broadened the investigation to a human cell model with endogenous APOE. They established working electroporation conditions, generated a preliminary image-based lipid phenotype for follow-up, and exposed a concrete calibration issue that must be resolved before extracellular Aβ42 responses can be measured. **They have not yet demonstrated causal phenotypic rescue, confirmed functional AAV9 delivery, or established an Alzheimer's disease therapy.**

The contribution of ORCA lies in making these next steps experimentally addressable: identifying stronger and more selective editor candidates, developing routes to regulate and eventually deliver them, distinguishing optical reporter signals from molecular evidence, and defining the validation still required to connect APOE4 RNA correction with meaningful cellular function.


## References

1. Lin, Y. T., et al. (2018). APOE4 Causes Widespread Molecular and Cellular Alterations Associated with Alzheimer's Disease Phenotypes in Human iPSC-Derived Brain Cell Types. *Neuron*, 98(6), 1141–1154.e7. [https://doi.org/10.1016/j.neuron.2018.05.008](https://doi.org/10.1016/j.neuron.2018.05.008). (Source for Figure 3A–B.)
2. Sienski, G., et al. (2021). APOE4 disrupts intracellular lipid homeostasis in human iPSC-derived glia. *Science Translational Medicine*, 13(583), eaaz4564. [https://doi.org/10.1126/scitranslmed.aaz4564](https://doi.org/10.1126/scitranslmed.aaz4564). (Source adapted in Figure 2.)
3. Farmer, B. C., Kluemper, J., & Johnson, L. A. (2019). Apolipoprotein E4 Alters Astrocyte Fatty Acid Metabolism and Lipid Droplet Formation. *Cells*, 8(2), 182. [https://doi.org/10.3390/cells8020182](https://doi.org/10.3390/cells8020182). (Source adapted in Figure 2.)
4. Fan, J., et al. (2016). Identification of a Chrysanthemic Ester as an Apolipoprotein E Inducer in Astrocytes. *PLOS ONE*, 11(9), e0162384. [https://doi.org/10.1371/journal.pone.0162384](https://doi.org/10.1371/journal.pone.0162384). (CCF-STTG1 model background.)
5. Wang, X., McLachlan, J., Zamore, P. D., & Hall, T. M. T. (2002). Modular recognition of RNA by a human pumilio-homology domain. *Cell*, 110(4), 501–512. [https://doi.org/10.1016/S0092-8674(02)00873-5](https://doi.org/10.1016/S0092-8674(02)00873-5).
6. Filipovska, A., Razif, M. F. M., Nygård, K. K. A., & Rackham, O. (2011). A universal code for RNA recognition by PUF proteins. *Nature Chemical Biology*, 7(7), 425–427. [https://doi.org/10.1038/nchembio.577](https://doi.org/10.1038/nchembio.577).
7. Lee, Y., Messing, A., Su, M., & Brenner, M. (2008). GFAP promoter elements required for region-specific and astrocyte-specific expression. *Glia*, 56(5), 481–493. [https://doi.org/10.1002/glia.20622](https://doi.org/10.1002/glia.20622).
8. Baek, D., Villén, J., Shin, C., Camargo, F. D., Gygi, S. P., & Bartel, D. P. (2008). The impact of microRNAs on protein output. *Nature*, 455, 64–71. [https://doi.org/10.1038/nature07242](https://doi.org/10.1038/nature07242).
9. Wu, H., Lima, W. F., Zhang, H., Fan, A., Sun, H., & Crooke, S. T. (2004). Determination of the role of the human RNase H1 in the pharmacology of DNA-like antisense drugs. *Journal of Biological Chemistry*, 279(17), 17181–17189. [https://doi.org/10.1074/jbc.M311683200](https://doi.org/10.1074/jbc.M311683200).
10. Iwamoto, M., Björklund, T., Lundberg, C., Kirik, D., & Wandless, T. J. (2010). A general chemical method to regulate protein stability in the mammalian central nervous system. *Chemistry & Biology*, 17(9), 981–988. [https://doi.org/10.1016/j.chembiol.2010.07.009](https://doi.org/10.1016/j.chembiol.2010.07.009).
11. Shaner, N. C., et al. (2004). Improved monomeric red, orange and yellow fluorescent proteins derived from Discosoma sp. red fluorescent protein. *Nature Biotechnology*, 22(12), 1567–1572. [https://doi.org/10.1038/nbt1037](https://doi.org/10.1038/nbt1037).
12. Qi, G., Mi, Y., Shi, X., Gu, H., Brinton, R. D., & Yin, F. (2021). ApoE4 Impairs Neuron-Astrocyte Coupling of Fatty Acid Metabolism. *Cell Reports*, 34(1), 108572. [https://doi.org/10.1016/j.celrep.2020.108572](https://doi.org/10.1016/j.celrep.2020.108572).
