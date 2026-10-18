---
title: Description
subtitle: Build the complete case from Alzheimer’s disease and APOE4 to a precise, testable RNA-editing strategy.
eyebrow: Project
status: pending
status_label: Content pending team review
status_message: Scientific content, references and media attribution await team review.
---

# Description

## Alzheimer’s Disease: The Problem

<div class="description-intro">
  <p>Alzheimer’s disease (AD) is the most common cause of dementia, accounting for an estimated 60–70% of cases. In 2021, around 57 million people worldwide were living with dementia, creating a growing burden for patients, families, and healthcare systems. [4]</p>
  <div class="description-stats" data-description-stats role="group" aria-label="Global dementia burden">
    <div class="description-stats__pair">
      <div class="description-stats__metric">
        <div class="description-stats__context">Worldwide · 2021</div>
        <div class="description-stats__number">57<span class="description-stats__unit">million</span></div>
        <div class="description-stats__label">people living with dementia</div>
        <div class="description-stats__qualifier">Estimated global prevalence</div>
      </div>
      <div class="description-stats__metric description-stats__metric--share">
        <div class="description-stats__context">Alzheimer’s disease</div>
        <div class="description-stats__number">60–70<span class="description-stats__unit">%</span></div>
        <div class="description-stats__label">of all dementia cases</div>
        <div class="description-stats__qualifier">Estimated proportion</div>
      </div>
    </div>
    <div class="description-stats__scale" aria-hidden="true">
      <div class="description-stats__scale-caption">Alzheimer’s share of dementia cases</div>
      <div class="description-stats__ticks"></div>
      <div class="description-stats__axis"><span>0</span><span class="description-stats__interval">60–70%</span><span>100%</span></div>
    </div>
    <div class="description-stats__source">Source: <a href="https://www.who.int/news-room/fact-sheets/detail/dementia">World Health Organization</a> · [4]</div>
  </div>
</div>

AD is classically characterized by amyloid-β plaques and tau neurofibrillary tangles, but its pathology extends far beyond these hallmarks. Synaptic loss, glial dysfunction, inflammation, metabolic disturbance, and vascular changes all contribute to a complex disease process that can begin years before cognitive symptoms become apparent.

![Comparison of normal brain cells and Alzheimer’s disease pathological features](/assets/images/description/alzheimers-pathology.png)

*Figure 2. Alzheimer’s disease pathological features. Source: [Shajahan et al. (2024), Figure 1](https://www.frontiersin.org/journals/aging-neuroscience/articles/10.3389/fnagi.2023.1274452/full).*

Could an upstream, genetically defined risk factor provide a more precise point of intervention?

## APOE: From Lipid Biology to AD Risk

The APOE gene encodes apolipoprotein E (apoE), a major lipid carrier in the brain. Produced primarily by astrocytes, apoE redistributes cholesterol and other lipids between cells, supporting neuronal membranes, synapses, and repair.

Humans carry three major APOE alleles — ε2, ε3, and ε4. Their protein products differ only at residues 112 and 158: apoE2 is Cys112/Cys158, apoE3 is Cys112/Arg158, and apoE4 is Arg112/Arg158. Thus, apoE3 and apoE4 differ by only one amino acid.

![APOE structure and amino acid differences at residues 112 and 158](/assets/images/description/apoe-isoforms.png)

*Figure 3. ApoE structure and isoform differences. Source: [Liu et al. (2013), Figure 1a](https://pmc.ncbi.nlm.nih.gov/articles/PMC3726719/).*

Yet this small molecular difference is associated with a striking difference in disease risk. APOE ε4 is the strongest common genetic risk factor for late-onset AD, with risk increasing with ε4 gene dose, whereas ε2 is generally associated with reduced risk.

![APOE genotype odds ratios and genotype frequencies](/assets/images/description/apoe-risk.png)

*Figure 4. APOE genotype, odds ratios and genotype frequencies. Data shown in [Yamazaki et al. (2019), Table 2](https://pmc.ncbi.nlm.nih.gov/articles/PMC7055192/).*

ApoE4 also acts across multiple disease-relevant processes. Beyond amyloid metabolism, it has been linked to altered lipid homeostasis, synaptic function, inflammation, metabolism, vascular function, and tau-associated pathology. These effects have been described as a combination of gain of detrimental functions and loss of protective functions.

![ApoE4 gain of toxic function and potential loss of protective function](/assets/images/description/apoe4-functions.png)

*Figure 5. ApoE4 gain of toxic function and potential loss of protective function. Source: [Liu et al. (2013), Figure 3](https://pmc.ncbi.nlm.nih.gov/articles/PMC3726719/).*

This makes APOE4 an unusual therapeutic target: a major genetic determinant of AD risk separated from apoE3 by only a single amino acid.

## Existing Strategies <span class="description-heading-line">— and the Gap We Saw</span>

Alzheimer’s treatment has progressed from symptomatic drugs to disease-modifying therapies. The anti-amyloid antibodies lecanemab and donanemab are approved for early AD [13,14] and can slow cognitive decline in some patients [5,6]. However, these therapies primarily target downstream amyloid pathology rather than APOE4 itself.

![Symptomatic and disease-modifying treatments shown in the supplied illustration](/assets/images/description/current-treatments.png)

*Figure 6. Symptomatic and disease-modifying treatment approaches.*

Researchers have therefore begun targeting APOE biology more directly. One approach is to reduce apoE4. In a human APOE4 tauopathy mouse model, APOE-targeting antisense oligonucleotides reduced apoE4 protein and attenuated tau pathology, neurodegeneration, neuroinflammation, and synaptic loss [7]. This demonstrates the therapeutic potential of APOE4 suppression, but it removes the disease-associated isoform rather than correcting it.

Another strategy is to add a protective isoform. LX1001, an investigational AAVrh.10-APOE2 gene therapy, has been evaluated in a Phase 1/2 study of APOE4 homozygotes with AD. Fifteen participants received treatment, and APOE2 was detected in CSF in a dose-dependent manner [8].

![LX1001 APOE2 gene therapy overview](/assets/images/description/lx1001-overview.png)

*Figure 7. LX1001 APOE2 gene therapy overview.*

Protective APOE variants may extend this idea further. Prof. Keqiang Ye and colleagues showed that AAV-mediated expression of APOE3 Christchurch (R136S) produced protective effects in AD mouse models [9]. We later discussed APOE biology and therapeutic development directly with Prof. Ye; more about this conversation can be found on our [Human Practices page](/human-practices).

Together, these approaches establish APOE as a therapeutically actionable target. They also highlight two major strategies: reducing harmful apoE4 or adding a protective apoE variant. Our project pursued a different goal — preserving endogenous APOE expression while directly changing the disease-associated information carried by the APOE4 transcript.

## Why mRNA Editing?

Our goal was not simply to reduce apoE4, but to correct the information encoded by endogenous APOE4 while preserving its expression. This correction can, in principle, be approached at three molecular levels: DNA, RNA, or protein.

Genome editing offers durable sequence correction, and APOE4-to-APOE3 conversion has recently been demonstrated using the PE7 prime editor [10]. However, genomic edits are permanent, making unintended changes difficult to reverse and placing additional demands on long-term safety and CNS delivery. [PubMed](https://pubmed.ncbi.nlm.nih.gov/42467931/) At the protein level, small-molecule structure correctors such as PH002 can shift apoE4 toward an apoE3-like conformation and alleviate disease-related phenotypes in human iPSC-derived neurons, but the underlying APOE4 sequence remains unchanged [11]. [PubMed Central (PMC)](https://pmc.ncbi.nlm.nih.gov/articles/PMC5948154/)

RNA editing offered the middle ground that best matched our design goals. It enables direct correction of endogenous APOE4 transcripts without altering genomic DNA, while the natural turnover of RNA makes the intervention inherently transient and potentially tunable. Its limitation is equally clear: new APOE4 transcripts are continuously produced, so effective correction depends on maintaining sufficient editing activity.

![Comparison of DNA editing, RNA editing and protein-level correction](/assets/images/description/intervention-levels.png)

*Figure 8. DNA editing, RNA editing and protein-level correction.*

With the intervention layer defined, our next step was to build an RNA editor capable of recognizing and rewriting APOE4 with high precision.

## Building on REWIRE

Having chosen RNA as our intervention layer, we needed a programmable editor capable of converting the APOE4-associated cytidine without altering genomic DNA.

REWIRE (RNA Editing With Individual RNA-binding Enzyme) provided a natural starting point. It is a single-component, guide-RNA-free RNA editing platform that combines a programmable PUF RNA-binding domain with a deaminase. In its C-to-U branch, CU-REWIRE, PUF directs the editor to a defined RNA sequence, while APOBEC3A catalyzes cytidine-to-uridine editing — precisely the type of conversion required for APOE4 correction [12]. [OUP Academic](https://academic.oup.com/nar/article/50/16/9580/6677559)

Importantly, REWIRE was designed to be engineerable. The original study expanded the natural 8-repeat PUF to a 10-repeat PUF, generating upgraded CU-REWIRE variants with improved target recognition and reduced transcriptome-wide off-target editing. Figure 4D illustrates this transition from the original PUF8R architecture to the optimized PUF10R-based CU-REWIRE system. [OUP Academic](https://academic.oup.com/nar/article/50/16/9580/6677559)

![Original and upgraded CU-REWIRE architectures from the original study’s Figure 4D](/assets/images/description/rewire-architecture.png)

*Figure 9. Original and upgraded CU-REWIRE architectures, shown in [Figure 4D of the original REWIRE study](https://academic.oup.com/nar/article/50/16/9580/6677559).*

For us, this combination of programmable recognition, C-to-U editing, and modular design made CU-REWIRE an ideal foundation.

## Our Approach: <span class="description-heading-line">From an RNA Editor to ORCA</span>

CU-REWIRE provided a molecular starting point for APOE4 RNA editing. Building on this foundation, ORCA addresses a broader question: how can a programmable editor become a system whose activity can be refined, regulated, delivered, and meaningfully evaluated? We organized our work into three connected stages: **Fundamental Research, Platform Development, and Functional Validation**.

<div class="description-card" markdown="1">

### Fundamental Research <span class="description-heading-subtitle">— Establishing the Foundation</span>

We began by adapting the REWIRE framework to APOE4 and comparing PUF recognition architectures. These initial experiments examined how recognition-domain design affected editing at our target, informing the choice of a molecular backbone for subsequent engineering.

</div>

### Platform Development <span class="description-heading-subtitle">— Five Connected Workstreams</span>

Improving the editor alone would not address every requirement of the system. We therefore developed five complementary workstreams, each focused on a distinct engineering question.

<div class="description-card description-card--workstream" markdown="1">

**EDIT — Refining recognition and catalysis.**
{: .description-workstream-title}

Through POD and CETUS, we investigated changes to the PUF recognition domain and APOBEC catalytic domain. Integrated ORCA brought selected variants together to examine their combined behavior.

</div>

<div class="description-card description-card--workstream" markdown="1">

**CONTROL — Regulating expression and activity.**
{: .description-workstream-title}

We explored complementary strategies for cell-context-dependent expression and externally controlled suppression, addressing where the editor acts and how its activity might be limited.

</div>

<div class="description-card description-card--workstream" markdown="1">

**DELIVER — Developing a delivery route.**
{: .description-workstream-title}

We investigated AAV-compatible constructs and packaging as steps toward delivering the editing machinery to relevant cells.

</div>

<div class="description-card description-card--workstream" markdown="1">

**MEASURE — Making editing assessable.**
{: .description-workstream-title}

We developed an editing-responsive reporter and the SONAR analysis framework to support comparable fluorescence measurements and examine their relationship to sequencing-based editing evidence.

</div>

<div class="description-card description-card--workstream" markdown="1">

**MODEL — Supporting design decisions.**
{: .description-workstream-title}

We used computational approaches to investigate molecular recognition, prioritize candidate designs, and explore how delivery and editing parameters could influence system behavior.

</div>

<div class="description-card" markdown="1">

### Functional Validation <span class="description-heading-subtitle">— Connecting Editing to Biological Context</span>

Finally, we extended our investigation to APOE4-relevant cellular models, examining editor introduction and disease-related cellular readouts. This stage asks whether molecular editing is accompanied by measurable biological changes, while distinguishing evidence of editing from evidence of functional benefit.

</div>

Together, these stages connect the molecular rationale for ORCA with its engineering development and biological evaluation. Our [Engineering page](/engineering) presents the design–build–test–learn cycles behind this work, while [Results](/results) brings together the findings and their limitations.

<nav class="description-next" aria-label="Explore ORCA development and results">
  <a class="description-next__link" href="/engineering"><span>To Engineering</span><span class="description-next__arrow" aria-hidden="true">↗</span></a>
  <a class="description-next__link" href="/results"><span>To Results</span><span class="description-next__arrow" aria-hidden="true">↗</span></a>
</nav>

## References

1. Liu, C.-C., Kanekiyo, T., Xu, H. & Bu, G. [Apolipoprotein E and Alzheimer disease: risk, mechanisms, and therapy](https://pmc.ncbi.nlm.nih.gov/articles/PMC3726719/). *Nature Reviews Neurology* **9**, 106–118 (2013). DOI: 10.1038/nrneurol.2012.263.

2. Yamazaki, Y., Zhao, N., Caulfield, T. R., Liu, C.-C. & Bu, G. [Apolipoprotein E and Alzheimer disease: pathobiology and targeting strategies](https://pmc.ncbi.nlm.nih.gov/articles/PMC7055192/). *Nature Reviews Neurology* **15**, 501–518 (2019). DOI: 10.1038/s41582-019-0228-7.

3. Shajahan, S. R., Kumar, S. & Ramli, M. D. C. [Unravelling the connection between COVID-19 and Alzheimer’s disease: a comprehensive review](https://www.frontiersin.org/journals/aging-neuroscience/articles/10.3389/fnagi.2023.1274452/full). *Frontiers in Aging Neuroscience* **15**, 1274452 (2024). DOI: 10.3389/fnagi.2023.1274452.

4. World Health Organization. [Dementia](https://www.who.int/news-room/fact-sheets/detail/dementia). Fact sheet, updated 3 July 2026. Accessed 18 October 2026.

5. van Dyck, C. H., Swanson, C. J., Aisen, P. et al. [Lecanemab in early Alzheimer’s disease](https://doi.org/10.1056/NEJMoa2212948). *New England Journal of Medicine* **388**, 9–21 (2023). DOI: 10.1056/NEJMoa2212948.

6. Sims, J. R., Zimmer, J. A., Evans, C. D. et al. [Donanemab in early symptomatic Alzheimer disease: the TRAILBLAZER-ALZ 2 randomized clinical trial](https://doi.org/10.1001/jama.2023.13239). *JAMA* **330**, 512–527 (2023). DOI: 10.1001/jama.2023.13239.

7. Litvinchuk, A., Huynh, T.-P. V., Shi, Y. et al. [Apolipoprotein E4 reduction with antisense oligonucleotides decreases neurodegeneration in a tauopathy model](https://doi.org/10.1002/ana.26043). *Annals of Neurology* **89**, 952–966 (2021). DOI: 10.1002/ana.26043.

8. Johnson, K. G., Kaplitt, M., Kaminsky, S. et al. [Topline results from Phase 1/2 AAV gene therapy (LX1001) in APOE4/4 homozygotes with Alzheimer’s disease](https://doi.org/10.1002/alz70859_101538). *Alzheimer’s & Dementia* **21** (Suppl. 5), e101538 (2025). Conference abstract. DOI: 10.1002/alz70859_101538.

9. Chen, G., Wang, M., Zhang, Z. et al. [ApoE3 R136S binds to Tau and blocks its propagation, suppressing neurodegeneration in mice with Alzheimer’s disease](https://doi.org/10.1016/j.neuron.2024.12.015). *Neuron* **113**, 719–736.e5 (2025). DOI: 10.1016/j.neuron.2024.12.015.

10. Kim, Y., Lee, G., An, S. et al. [Therapeutic gene editing of APOE4 in sporadic Alzheimer’s disease via Prime Editor 7](https://doi.org/10.1002/advs.76658). *Advanced Science* **13**, e76658 (2026). DOI: 10.1002/advs.76658.

11. Wang, C., Najm, R., Xu, Q. et al. [Gain of toxic apolipoprotein E4 effects in human iPSC-derived neurons is ameliorated by a small-molecule structure corrector](https://doi.org/10.1038/s41591-018-0004-z). *Nature Medicine* **24**, 647–657 (2018). DOI: 10.1038/s41591-018-0004-z.

12. Han, W., Huang, W., Wei, T. et al. [Programmable RNA base editing with a single gRNA-free enzyme](https://doi.org/10.1093/nar/gkac713). *Nucleic Acids Research* **50**, 9580–9595 (2022). DOI: 10.1093/nar/gkac713.

13. U.S. Food and Drug Administration. [FDA converts novel Alzheimer’s disease treatment to traditional approval](https://www.fda.gov/news-events/press-announcements/fda-converts-novel-alzheimers-disease-treatment-traditional-approval). 6 July 2023. Accessed 18 October 2026.

14. U.S. Food and Drug Administration. [FDA approves treatment for adults with Alzheimer’s disease](https://www.fda.gov/drugs/news-events-human-drugs/fda-approves-treatment-adults-alzheimers-disease). 2 July 2024. Accessed 18 October 2026.
