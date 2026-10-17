---
title: Future
subtitle: A research roadmap from reproducible measurements to stronger evidence across scales.
eyebrow: Project
status: pending
status_label: Content pending team review
status_message: This roadmap describes proposed work and remains subject to team review. Future goals are separate from demonstrated outcomes.
---

# Future

## From an integrated workflow to stronger evidence

ORCA connects experimental records, reporter-based measurement, RNA-seq analysis, editor comparisons and system-level modeling. The next stage is to strengthen the evidence connecting these parts. A favorable molecular measurement, a useful prediction and a plausible simulation each answer a different question. Progress depends on understanding where they agree, where they diverge and what remains untested.

The priorities below describe future development. They do not extend the scope of the results already reported or treat proposed work as completed validation.

## Short-Term: Platform Optimization {#short-term-platform-optimization}

### Make measurement comparisons easier to interpret

The first priority is a clearer connection between reporter behavior and independent molecular evidence. SONAR provides a framework for separating fluorescence responses, calibrated scores and sequencing-linked interpretations. Further work should establish how reliably these interpretations hold across the experimental contexts in which the platform is used.

A useful outcome would be a measurement record that makes its controls, reference context and uncertainty clear enough for another researcher to assess. Apparent improvements should remain distinguishable from changes in expression, background or the conditions of the comparison.

### Connect methods, records and analysis outputs

The Experiment library and Notebook already provide method identifiers and dated source records. The next step is more consistent traceability between these records and the figures, comparisons and model inputs derived from them.

This development would make it easier to inspect the origin of a conclusion, understand why an experiment was repeated and determine which resource version belongs to a particular analysis. Clear provenance is especially valuable when wet-lab and dry-lab work are revised at different times.

## Strengthen the wet–dry feedback loop

### Evaluate how far current conclusions transfer

The PUF and APOBEC studies connect model-informed questions with experimental comparisons. Further evaluation should clarify whether the observed relationships remain informative beyond the contexts already examined. Preserving the distinction between target activity and unintended editing will remain central to that interpretation.

RNA-seq candidate profiles and LAMAR rankings provide complementary evidence, but neither alone establishes the biological behavior of every ranked site. A stronger feedback loop would connect follow-up observations to the original predictions and document both agreement and disagreement. This would reveal where the computational tools are informative and where their scope remains limited.

### Improve the interpretation of uncertainty

The whole-body and spatial models bring molecular behavior into a broader system context. Their next contribution should be a clearer account of which conclusions remain stable when uncertain inputs change and which depend strongly on assumptions.

As appropriate evidence becomes available, model inputs and comparisons can be reviewed against it. Simulation outputs should retain their original units, assumptions and limitations. Agreement with one observation would support a particular part of the model, rather than establish that the entire system has been validated.

## Connect molecular readouts with cellular meaning

Changes in editing and changes in cellular phenotype answer related but distinct questions. Future work should examine how molecular observations relate to the functional readouts used in the project, while accounting for the model and conditions in which those observations were made.

The aim is an interpretation supported by converging evidence. A favorable reporter response should not stand in for a functional outcome, and a favorable cellular observation should not be presented as proof of long-term benefit. Unexpected or inconclusive findings are also useful when they clarify the limits of the current design.

## Make the platform easier to assess and reuse

A reusable platform needs more than a successful demonstration. Future releases should make the relationship between source data, software versions, example outputs and explanatory material easier to follow. Documentation should clearly identify what is included, what has been tested and what still requires review in a new context.

Feedback from other researchers can help identify confusing interfaces, incomplete documentation and assumptions that were obvious only to the original team. Addressing these issues would improve the practical value of the methods, records and computational resources already brought together by ORCA.

## Long-Term: Therapeutic Translation {#long-term-therapeutic-translation}

The long-term motivation is to contribute to RNA-editing research relevant to Alzheimer's disease. The current project provides a research workflow and evidence within defined experimental and computational settings. It does not establish a treatment or a clinical recommendation.

Any further translation would require a much broader body of evidence on biological relevance, unintended effects, durability and tolerability, assessed through appropriate independent expertise and oversight. Practical questions such as accessibility, manufacturing consistency and the needs of patients and caregivers would also need to be considered alongside scientific performance.

The most useful next milestone is therefore a better-supported claim: a result whose origin is clear, whose limitations are understood and whose interpretation can withstand independent scrutiny. That standard connects the project's immediate development priorities with its longer-term motivation.
