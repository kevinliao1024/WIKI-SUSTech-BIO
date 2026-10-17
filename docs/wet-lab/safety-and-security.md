---
title: Safety & Security
subtitle: Connecting wet-lab evidence, computational uncertainty and responsible research.
eyebrow: Wet Lab
status: pending
status_label: Content pending team review
status_message: This draft reflects the current wet- and dry-lab documentation. Project-specific safety arrangements and supporting records remain subject to team review.
---

# Safety & Security

## Safety Across Scales

ORCA investigates RNA editing at an APOE4-associated site. Safety assessment must consider both the intended molecular change and unintended effects: changes at other RNA sites, activity outside the intended cellular context, and the consequences of delivery and sustained expression. A favorable editing result alone cannot answer all of these questions.

We organize these questions across eight scales and four actions: **Anticipate → Constrain → Detect → Decide**. The current wet-lab work provides experimental records and measurement context; the dry-lab work connects RNA-seq analysis, editor comparisons, site prioritization and whole-body modeling. Their conclusions must remain tied to the evidence each approach can support.

## I. Anticipate

### Scale 01 — Sequence Scale

A targeted RNA editor may also affect other transcripts or nearby sites. The current [Model](/model) page brings RNA-seq candidate-site analysis and LAMAR site prioritization into the same evidence framework. RNA-seq provides candidate editing evidence under a documented analysis procedure; LAMAR ranks sites for follow-up.

Neither a sequence match nor a model ranking establishes that a site is edited in a particular cell. A smaller detected candidate set also does not prove that unintended editing is absent. Interpretation depends on the samples, background screening and detection limits, with independent validation needed for individual biological claims.

### Scale 02 — System Scale

The current [Whole-body Delivery Model](/software) connects delivery, tissue distribution, cellular expression and RNA editing. It examines intended and unintended editing alongside exposure and tissue coverage. Sensitivity and uncertainty analyses show how conclusions depend on the model inputs.

These outputs are simulations under specified assumptions. Model units, comparison criteria and risk proxies must retain their original meaning; they are not clinical doses, validated safety limits or evidence of successful delivery in a living organism. The model helps identify unanswered questions rather than resolving them experimentally.

## II. Constrain

### Scale 03 — Editor Scale

The PUF and APOBEC work documented in Model compares target activity with unwanted editing. For safety interpretation, these outcomes must be considered together: an apparent reduction in unwanted activity may also reflect a general reduction in editor activity.

Results from a tested panel support conclusions about that panel and its measurement context. They do not establish transcriptome-wide or long-term safety. The design decisions and remaining limitations belong alongside the experimental evidence in [Engineering](/engineering).

### Scale 04 — Cellular Scale

The wet-lab design includes a Control branch addressing where and when editor activity occurs. Such controls should be described as proposed or evaluated design features according to their actual evidence status.

Intended behavior, unintended activity and the persistence of expression all matter when judging whether a control provides protection. A design diagram or an isolated reporter response does not establish reliable restriction across cell types. Cellular controls also do not replace laboratory containment and institutional review.

## III. Detect

### Scale 05 — Measurement Scale

[SONAR](/project-contribution-sonar) connects a fluorescence reporter with a measurement and analysis framework. Its documentation distinguishes reporter activity, reference-calibrated scores and sequencing-linked estimates. Each level has its own evidence requirements, and fluorescence alone does not establish the fraction of edited RNA.

Controls, calibration context, uncertainty and software provenance must remain attached to the reported result. A delivery or expression readout must not be relabelled as editing evidence. The [Notebook](/notebook) provides the experimental chronology; the interpretation must still be checked against the underlying records and the measurement's validated scope.

### Scale 06 — Functional Scale

The wet-lab functional-validation work asks whether molecular changes are accompanied by changes in cellular phenotypes. These observations complement editing measurements but answer a different question.

A favorable cellular readout does not by itself establish a therapeutic benefit or long-term tolerability. Results need to identify the model, controls, uncertainty and alternative explanations. The [Results](/results) page remains pending team review, so this safety summary does not treat its framework as completed validation.

## IV. Decide

### Scale 07 — Treatment Scale

The documented project combines laboratory research with computational modeling. Its delivery branch raises questions about exposure, unintended activity and the duration of expression, which must be assessed within the reviewed scope of each study.

Cell experiments and simulation outputs do not establish safety for administration to people or animals. They also do not resolve immune effects, long-term distribution or the consequences of repeated exposure. Any future expansion of the research scope requires its own evidence and applicable institutional review.

Targeting RNA does not by itself establish that an intervention can be stopped immediately. Expression and downstream effects may persist, so claims about reversibility require supporting evidence.

### Scale 08 — Human & Societal Scale

A possible future intervention would need to consider the priorities of people receiving care and those supporting them. Monitoring, treatment burden, accessibility, cost and uncertainty about long-term effects all matter.

Stakeholder views can help frame research questions, but they cannot establish biological safety or substitute for informed consent. Any additional participant research needs an appropriate review of consent, privacy and accessibility before data collection.

Changes motivated by engagement should be traceable to the relevant discussion and clearly separated from clinical recommendations. This page does not claim that a treatment-burden study has been completed.

## V. Security Across the Same Scales

Laboratory security depends on documented access permissions, material accountability and reporting of loss or unauthorized use. Project-specific arrangements must be confirmed against institutional records rather than inferred from the Wiki.

For computational work, the repository's content guidance requires a clear distinction between experimental data, simulation outputs, heuristic prioritization and implemented software. Source data, analysis versions, run settings and limitations should accompany the claims they support. A working interface or a passing software check does not constitute biological validation.

Public releases must exclude credentials, personal data and confidential third-party information. Team review should consider the tools' actual capabilities, foreseeable misuse and data flows before release. AI-assisted text and analyses remain drafts until a responsible team member has verified the claims and their sources.

## VI. General Lab Safety

The wet-lab documentation covers molecular biology, cell-based research, measurement and functional validation. These activities require risk assessments appropriate to the materials and facilities involved. Detailed laboratory procedures and authorization records belong in the institution's controlled documentation.

### Facilities and supervision

The team must confirm that facilities, containment, training, supervision and permissions match the actual work before it begins. Changes in materials or scope require renewed consideration by the responsible supervisors and institutional safety staff.

Current training completion, facility certification and approval status should be reported only from verified records. This page does not replace those records or imply authorization from the presence of an experiment in the Notebook.

### Biological materials, chemicals and waste

Risk assessment must address accidental exposure, contamination, chemical injury, waste handling and unintended release. The following categories summarize the issues to review; they are not handling instructions.

| Area | Main concern | Required review |
|---|---|---|
| Cells and recombinant biological materials | Accidental exposure, contamination or loss | Institutional risk assessment, containment and material accountability |
| Hazardous chemicals | Toxicity, flammability and incompatible materials | Safety Data Sheets and applicable institutional controls |
| Biological waste, chemical waste and sharps | Injury or unintended release | Approved waste responsibilities and disposal arrangements |
| Unexpected events | Unrecognized exposure or a change in risk | Reporting, supervisor review and a decision on whether work can continue |

The team must verify the applicable arrangements before presenting them as implemented safeguards. Biological design controls supplement these protections; they do not replace them.

## VII. ORCA Safety Decision Gate

Before interpreting a result or advancing the work, review whether the evidence supports the claim, unintended effects and uncertainty have been addressed, and the planned activity falls within the approved scope. Where evidence is incomplete, record the unresolved question and the responsible reviewer.

We propose recording the outcome as GO, REDESIGN, MORE EVIDENCE REQUIRED or STOP, with the reason and supporting records. This is a documentation framework, not a new scientific threshold or an authorization decision. Assay criteria and project approvals remain the responsibility of the team and its supervisors.

## Current Project Evidence

This draft follows the current project pages listed below and the repository's evidence-labeling guidance. Their individual review status and limitations still apply. Institutional safety records require separate team verification.

- [Model](/model): RNA-seq evidence, PUF and APOBEC comparisons, and LAMAR prioritization.
- [Software](/software): whole-body delivery modeling and its assumptions.
- [Engineering](/engineering): the project's design and evidence cycle.
- [SONAR](/project-contribution-sonar): measurement context and limits of interpretation.
- [Notebook](/notebook) and [Results](/results): experimental records and the status of integrated reporting.
