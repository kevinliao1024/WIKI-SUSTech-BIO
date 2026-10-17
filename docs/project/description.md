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
  <p>Alzheimer’s disease (AD) is the most common cause of dementia, accounting for an estimated 60–70% of cases. In 2021, around 57 million people worldwide were living with dementia, creating a growing burden for patients, families, and healthcare systems.</p>
  <img src="/assets/images/description/dementia-burden.png" alt="Worldwide dementia burden in 2021 and the estimated share of Alzheimer’s disease" width="605" height="641">
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

## Existing Strategies — and the Gap We Saw

Alzheimer’s treatment has progressed from symptomatic drugs to disease-modifying therapies. The anti-amyloid antibodies lecanemab and donanemab are approved for early AD and can slow cognitive decline in some patients. However, these therapies primarily target downstream amyloid pathology rather than APOE4 itself.

![Symptomatic and disease-modifying treatments shown in the supplied illustration](/assets/images/description/current-treatments.png)

*Figure 6. Symptomatic and disease-modifying treatment approaches.*

Researchers have therefore begun targeting APOE biology more directly. One approach is to reduce apoE4. In a human APOE4 tauopathy mouse model, APOE-targeting antisense oligonucleotides reduced apoE4 protein and attenuated tau pathology, neurodegeneration, neuroinflammation, and synaptic loss. This demonstrates the therapeutic potential of APOE4 suppression, but it removes the disease-associated isoform rather than correcting it.

Another strategy is to add a protective isoform. LX1001, an investigational AAVrh.10-APOE2 gene therapy, has been evaluated in a Phase 1/2 study of APOE4 homozygotes with AD. Fifteen participants received treatment, and APOE2 was detected in CSF in a dose-dependent manner.

![LX1001 APOE2 gene therapy overview](/assets/images/description/lx1001-overview.png)

*Figure 7. LX1001 APOE2 gene therapy overview.*

Protective APOE variants may extend this idea further. Prof. Keqiang Ye and colleagues showed that AAV-mediated expression of APOE3 Christchurch (R136S) produced protective effects in AD mouse models. We later discussed APOE biology and therapeutic development directly with Prof. Ye; more about this conversation can be found on our [Human Practices page](/human-practices).

Together, these approaches establish APOE as a therapeutically actionable target. They also highlight two major strategies: reducing harmful apoE4 or adding a protective apoE variant. Our project pursued a different goal — preserving endogenous APOE expression while directly changing the disease-associated information carried by the APOE4 transcript.

## Why mRNA Editing?

Our goal was not simply to reduce apoE4, but to correct the information encoded by endogenous APOE4 while preserving its expression. This correction can, in principle, be approached at three molecular levels: DNA, RNA, or protein.

Genome editing offers durable sequence correction, and APOE4-to-APOE3 conversion has recently been demonstrated using the PE7 prime editor. However, genomic edits are permanent, making unintended changes difficult to reverse and placing additional demands on long-term safety and CNS delivery. [PubMed](https://pubmed.ncbi.nlm.nih.gov/42467931/) At the protein level, small-molecule structure correctors such as PH002 can shift apoE4 toward an apoE3-like conformation and alleviate disease-related phenotypes in human iPSC-derived neurons, but the underlying APOE4 sequence remains unchanged. [PubMed Central (PMC)](https://pmc.ncbi.nlm.nih.gov/articles/PMC5948154/)

RNA editing offered the middle ground that best matched our design goals. It enables direct correction of endogenous APOE4 transcripts without altering genomic DNA, while the natural turnover of RNA makes the intervention inherently transient and potentially tunable. Its limitation is equally clear: new APOE4 transcripts are continuously produced, so effective correction depends on maintaining sufficient editing activity.

![Comparison of DNA editing, RNA editing and protein-level correction](/assets/images/description/intervention-levels.png)

*Figure 8. DNA editing, RNA editing and protein-level correction.*

With the intervention layer defined, our next step was to build an RNA editor capable of recognizing and rewriting APOE4 with high precision.

## Building on REWIRE

Having chosen RNA as our intervention layer, we needed a programmable editor capable of converting the APOE4-associated cytidine without altering genomic DNA.

REWIRE (RNA Editing With Individual RNA-binding Enzyme) provided a natural starting point. It is a single-component, guide-RNA-free RNA editing platform that combines a programmable PUF RNA-binding domain with a deaminase. In its C-to-U branch, CU-REWIRE, PUF directs the editor to a defined RNA sequence, while APOBEC3A catalyzes cytidine-to-uridine editing — precisely the type of conversion required for APOE4 correction. [OUP Academic](https://academic.oup.com/nar/article/50/16/9580/6677559)

Importantly, REWIRE was designed to be engineerable. The original study expanded the natural 8-repeat PUF to a 10-repeat PUF, generating upgraded CU-REWIRE variants with improved target recognition and reduced transcriptome-wide off-target editing. Figure 4D illustrates this transition from the original PUF8R architecture to the optimized PUF10R-based CU-REWIRE system. [OUP Academic](https://academic.oup.com/nar/article/50/16/9580/6677559)

![Original and upgraded CU-REWIRE architectures from the original study’s Figure 4D](/assets/images/description/rewire-architecture.png)

*Figure 9. Original and upgraded CU-REWIRE architectures, shown in [Figure 4D of the original REWIRE study](https://academic.oup.com/nar/article/50/16/9580/6677559).*

For us, this combination of programmable recognition, C-to-U editing, and modular design made CU-REWIRE an ideal foundation.

Together, these findings shaped the rationale for our project. Alzheimer’s disease is complex, yet APOE4 provides a genetically defined point of intervention. Existing APOE-directed strategies demonstrate that apoE biology is therapeutically actionable, while RNA editing offers a distinct route to directly rewrite the endogenous APOE4 transcript without permanently altering genomic DNA. With programmable PUF-mediated recognition and C-to-U editing, CU-REWIRE provided the molecular framework for turning this idea into an engineered system.

## References

1. Liu, C.-C., Kanekiyo, T., Xu, H. & Bu, G. [Apolipoprotein E and Alzheimer disease: risk, mechanisms, and therapy](https://pmc.ncbi.nlm.nih.gov/articles/PMC3726719/). *Nature Reviews Neurology* **9**, 106–118 (2013). DOI: 10.1038/nrneurol.2012.263.

2. Yamazaki, Y., Zhao, N., Caulfield, T. R., Liu, C.-C. & Bu, G. [Apolipoprotein E and Alzheimer disease: pathobiology and targeting strategies](https://pmc.ncbi.nlm.nih.gov/articles/PMC7055192/). *Nature Reviews Neurology* **15**, 501–518 (2019). DOI: 10.1038/s41582-019-0228-7.

3. Shajahan, S. R., Kumar, S. & Ramli, M. D. C. [Unravelling the connection between COVID-19 and Alzheimer’s disease: a comprehensive review](https://www.frontiersin.org/journals/aging-neuroscience/articles/10.3389/fnagi.2023.1274452/full). *Frontiers in Aging Neuroscience* **15**, 1274452 (2024). DOI: 10.3389/fnagi.2023.1274452.
