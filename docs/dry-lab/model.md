---
title: Model
heading: Modeling decisions for RNA editing.
subtitle: Connecting measured editing profiles, protein design and off-target site prioritization in the ORCA project.
eyebrow: Dry Lab · Four Modules
---

Our APOE4 RNA-editing project needs an editor that preserves useful activity at the intended cytidine while limiting editing elsewhere. A strong target signal alone cannot establish that balance. The PUF recognition domain, the APOBEC catalytic domain and the surrounding RNA sequence each contribute a different part of the design problem.

The project therefore links measurement, editor design and site validation. RNA-seq describes where editing is detected and whether a narrower profile preserves useful target activity. Two complementary design routes then examine the protein: the PUF domain controls RNA recognition, while the APOBEC domain contributes catalytic activity and local substrate preference. A sequence model addresses the RNA side of the same problem by ranking sites that merit further testing.

1. **[Measure the editing profile](#module1).** Module 1 compares target signals and transcriptome-wide candidate sites under a common screening procedure. This gives the project an evidence base for distinguishing reduced unwanted editing from a general loss of activity.
2. **[Choose PUF variants](#module2).** Module 2 ranks recognition-domain variants against the measured balance between C388 and two comparison sites. Structure-conditioned sequence design provides additional substitutions to investigate.
3. **[Engineer APOBEC preference](#module3).** Module 3 uses protein–RNA structures to propose catalytic-domain changes, then assesses substrate preference alongside retained activity. Experimental results determine which designs remain useful leads.
4. **[Prioritize further site validation](#module4).** Module 4 adapts LAMAR to rank RNA regions and cytidines using RNA-seq-derived labels. Its intended output is a manageable candidate list for off-target testing.

The connection between modules is the evidence used to make the next decision. A low candidate-site count needs a retained target signal to be useful; a promising protein score needs measured editing; and a high-ranking RNA site needs experimental confirmation. PUF and APOBEC modeling provide complementary routes to editor improvement. Transcriptome-wide measurement and site prioritization supply the broader assessment needed beyond the three-site assay.

Parts of this process have already reached experiment: Module 2 includes model-guided selection and wet-lab testing of five PUF candidates, and Module 3 follows structural hypotheses through measured single and combined substitutions. Module 4 currently has held-out computational evaluation. Testing its ranked sites under a defined editor condition is the next step toward connecting candidate prioritization back to new measurements. Each module below states what it contributes, what the results support and which decision remains to be tested.
