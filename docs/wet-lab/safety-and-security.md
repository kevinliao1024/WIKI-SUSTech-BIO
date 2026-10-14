---
title: Safety & Security
subtitle: Safety Across Scales—from RNA sequence to potential treatment.
eyebrow: Wet Lab
status: pending
status_label: Content pending team review
status_message: This draft uses the team’s safety forms and current design plans. Experimental results are still being added.
---

# Safety & Security

## Safety Across Scales

ORCA is designed to edit an APOE4-associated site in RNA. When choosing an editor, we also need to understand its activity elsewhere: whether it recognizes other transcripts, changes nearby bases or remains active in cells where it is not intended to act. Delivery and the methods used to measure editing add further questions.

We follow these questions across eight scales: sequence, system, editor, cell, measurement, function, treatment, and people and society. The sections are grouped into four actions: **Anticipate → Constrain → Detect → Decide**. Sequence and system analysis identify risks; editor and cellular controls aim to limit them; molecular and functional measurements test the consequences. Delivery studies and the views of future users then inform decisions about further development.

## I. Anticipate

### Scale 01 — Sequence Scale

A PUF designed for APOE can encounter similar sequences in other transcripts. We developed the [PUF-OffTarget Atlas](/offtarget-atlas) to search for these sites under defined mismatch settings and organize the candidates for inspection. Where data are available, the workflow adds tissue expression, RNA accessibility and annotation to help explain why a site deserves attention. Run settings and evidence are exported alongside the ranking.

The Atlas helps select what to test. A sequence match alone does not tell us whether the editor binds or edits that RNA in a cell. Our [archived example](/static/evidence/puf-atlas-example/run_metadata.json) uses a liver context; applying the workflow to the final ORCA sequence and checking selected sites experimentally are the next steps.

### Scale 02 — System Scale

The [Brain Delivery Digital Twin](/brain-delivery) lets us examine how delivery, brain entry, editor expression and editing interact. It reports desired editing alongside three possible sources of unintended activity: nearby bystander editing, PUF-mismatch editing and deaminase background. Keeping these outputs separate helps us examine the trade-offs in a candidate design.

Several parameters are literature-informed estimates or normalized assumptions. The model therefore compares hypothetical designs and helps prioritize measurements. For example, its sensitivity analysis points to transport and editing kinetics as important sources of uncertainty. Measuring those parameters would let us update the comparison. The current [ProAPOBEC example](/static/evidence/brain-delivery-v4-summary.md) also uses placeholder activity and background values, so its ranking remains conditional on those inputs.

## II. Constrain

### Scale 03 — Editor Scale

We want enough activity at the APOE target while keeping unintended editing low. This means evaluating the PUF recognition domain and APOBEC module together. Candidate comparisons need to include the target site, nearby editable bases, other transcripts identified by the Atlas and background activity.

This is the comparison we plan to use in editor selection. The experimental activity–specificity results will determine whether a candidate can advance or needs to be changed. Construct comparisons and the reasons for changes will be documented in [Engineering](/engineering).

### Scale 04 — Cellular Scale

We are considering the gfaABC1D promoter and microRNA response elements (MREs) to reduce expression outside the intended cellular context. The design draft also describes an ASO synthetic tag and Cre-loxP control as further options.

For each module, we need to test both the intended response and expression under conditions where the editor should be inactive. Background expression, switching behaviour and the time taken for activity to fall matter as much as the desired signal. These proposed modules still need experimental evaluation before we can rely on them as safeguards.

## III. Detect

### Scale 05 — Measurement Scale

SONAR is our proposed reporter-based measurement system for RNA editing. Its validation plan includes control conditions, DNA and true-editing gradients, Western blotting and Sanger sequencing. Together, these measurements are intended to establish when a reporter signal can be attributed to editing and how background affects the readout.

A fluorescence increase can have more than one explanation. We therefore need to compare it with controls and check the underlying molecular change before using it to judge an editor. The same distinction applies to AAV delivery: our separate reporter vector measures delivery and reporter expression. Assessing ORCA editing requires the ORCA-containing vector and its own measurements. Assay definitions and calibration results will be included in [Measurement](/measurement).

### Scale 06 — Functional Scale

Our functional-validation plan includes Aβ uptake and clearance, supernatant Aβ ELISA and BODIPY-based lipid phenotyping. We also plan to assess cell viability in the AAV9 experiments. These readouts let us examine cellular effects alongside the editing result, including any unexpected changes.

The findings will need to be interpreted in the cell model and conditions tested. They can inform the next experiment, while long-term tolerability and effects in a whole organism require other studies. Completed assays and their controls will be reported in [Results](/results).

## IV. Decide

### Scale 07 — Treatment Scale

We already use plasmid transfection to study ORCA expression, editing and regulatory modules. This allows us to address initial questions without producing viral particles. The AAV9 plan addresses a different question: whether viral delivery supports ORCA function in the selected cell models.

Our [rAAV9 Check-In](https://teams.igem.org/6085/safety/safety-check-in-form/cebd1639-2deb-42da-a5ba-c0fb82806114) covers planned production in HEK293T cells and evaluation in HEK293T and CCF-STTG1 cells. ORCA and reporter vectors are separate preparations, and no live helper virus is used in the proposed system. The submission describes packaging as not yet started and commits to confirming institutional authorization before beginning. On 12 October 2026, its status was Approved; the current experimental progress still needs to be added from laboratory records.

These cell experiments address delivery and function in vitro. Questions about blood–brain barrier crossing, distribution in the CNS, immune effects and repeat administration belong to later studies. We would also need to review changes to the payload, production system, recipient cells or experimental scope before implementing them.

RNA editing avoids a permanent change at the genomic target, but this does not establish that an intervention can be stopped immediately. Editor expression and delivery may persist. Their duration and controllability need to be measured before making claims about reversibility.

### Scale 08 — Human & Societal Scale

A future treatment would need to be acceptable to the people receiving it and those supporting their care. Treatment frequency, monitoring, cost, ability to stop, serious adverse events and uncertainty about long-term effects all matter.

We propose an Acceptable Risk and Treatment Burden Study to examine how different groups weigh these factors. It would use neutrally worded scenarios and would require a review of consent, privacy, accessibility and institutional requirements before collecting data. Our current Human Practices work involves interviews and stakeholder opinions; the proposed study has not produced results.

Feedback could help us decide which features to prioritize, such as monitoring or expression control. Any resulting change should be explained through a specific example in [Human Practices](/human-practices), with participation accessibility considered in [Inclusivity](/inclusivity).

## V. Security Across the Same Scales

We control laboratory access and track biological materials to reduce the chance of unauthorized use or loss. Computational work raises additional concerns about data handling and the use of results.

Our [software documentation](/software) requires outputs to retain their configuration and sources, and to distinguish simulations, candidate rankings and experimental findings. Team members and supervisors must review analyses and AI-assisted material used in decisions. Public releases must exclude credentials, personal data and confidential third-party information.

We also plan a focused review of the tools’ actual capabilities, foreseeable harmful uses and data flows, including what is stored or sent to other services. This review remains to be completed. It should consider specific risks associated with the tools rather than treating every alternative research target as misuse. Model and Atlas outputs are intended to support research; they cannot establish a clinical dose or patient safety.

## VI. General Lab Safety

Our current project is limited to in vitro research. We use *E. coli* DH5α and Stbl3 for molecular biology work and the established human cell lines HEK293T, U251MG, SH-SY5Y and CCF-STTG1 for cell experiments. Recombinant AAV9 is included in our delivery research plan. We do not conduct animal experiments, administer ORCA to people or animals, collect primary human biological samples, or release engineered materials into the environment. The earlier plan to use iPSC-derived astrocytes has been discontinued. These activities and limits are described in our [Project Safety Form](https://teams.igem.org/6085/safety/safety-project-form/5acc4aa8-798e-4a11-bc2b-fc7832f6116d).

### Facilities and supervision

At SUSTech, plasmid construction, PCR, cloning and electrophoresis take place in a BSL-1 laboratory. Mammalian cell culture and planned AAV9 work use a shared BSL-2 facility, with certified Class II biosafety cabinets for open handling of cells and vector-containing material. Cabinets are cleared and decontaminated after use.

Before starting laboratory work, team members completed institutional safety training and received project-specific guidance. This covered laboratory access, biosafety equipment, microbial technique, disinfection, sample transport, emergency response, chemical safety and biosecurity. Our PI, research assistant, Ph.D. mentor and laboratory management advisor supervise the work. When an unexpected hazard arises, we report it and pause the affected work as appropriate while seeking advice.

### Biological materials, chemicals and waste

The main laboratory risks are accidental exposure to recombinant materials, chemical injury and unintended release through spills or improper disposal. We manage them through the following arrangements.

| Work or material | Main concern | How it is managed |
|---|---|---|
| Mammalian cells and recombinant biological materials | Exposure through spills, splashes or contamination | Appropriate containment, biosafety cabinets, PPE and controlled access |
| Planned rAAV9 production and handling | Exposure to vector-containing material and unintended transduction | BSL-2 facilities, trained supervision, clearly labelled preparations and institutional procedures |
| TRIzol, chloroform and other hazardous reagents | Exposure during use or disposal | Safety Data Sheet review, suitable PPE and a chemical fume hood where required |
| Ethanol, isopropanol and methanol | Flammability and chemical exposure | Institutional storage, handling and disposal rules |
| Biological waste, chemical waste and sharps | Injury or release during disposal | Separate waste streams and designated collection containers |

We also use inventory and access controls, accident reporting, and rules for lone or out-of-hours work. The proposed controls within ORCA add to these laboratory protections; they do not replace them.

## VII. ORCA Safety Decision Gate

Before the next experiment, we need to consider whether the target activity is interpretable, unintended effects have been adequately examined, the relevant controls work and the planned activity is covered by the required review. We propose recording the outcome as GO, REDESIGN, MORE EVIDENCE REQUIRED or STOP, together with the reason and supporting records. The acceptance criteria for each assay still need to be agreed with our supervisors.

## Sources

The project scope and laboratory arrangements above are based on the team’s safety submissions. At the 12 October 2026 review, the Project Safety Form showed Final Submitted and an open review thread; the rAAV9 Check-In showed Approved.

- [SUSTech Project Safety Form](https://teams.igem.org/6085/safety/safety-project-form/5acc4aa8-798e-4a11-bc2b-fc7832f6116d)
- [SUSTech rAAV9 Check-In](https://teams.igem.org/6085/safety/safety-check-in-form/cebd1639-2deb-42da-a5ba-c0fb82806114)
- [iGEM Safety Policies](https://responsibility.igem.org/safety-policies)
- [iGEM Human Subjects Research Policy](https://responsibility.igem.org/safety-policies/human-subjects)
- [UC San Diego AAV containment guidance](https://blink.ucsd.edu/safety/research-lab/biosafety/containment/adeno-bsl.html) and [Addgene biosafety guidance](https://www.addgene.org/biosafety/), cited in our Check-In. Our procedures follow the applicable SUSTech requirements.
