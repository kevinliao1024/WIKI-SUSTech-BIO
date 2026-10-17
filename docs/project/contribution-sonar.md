---
title: SONAR
subtitle: Design a reporter. Capture fluorescence. Interpret the response.
eyebrow: Project / Contribution
---

# SONAR

<div class="sonar-intro" id="intro">
<p class="sonar-kicker">A toolkit for the next experiment</p>
<p>SONAR — System for Optical Normalization and Analysis of RNA Editing — connects a modular fluorescence reporter to a stepwise measurement framework. A green output responds to an edit-sensitive coding switch, while a red signal provides a reporter-expression reference. Together, the reporter and SONAR Analysis Program (SAP) help you move from sequence design to a controlled, interpretable fluorescence experiment. This tutorial shares the design logic, a practical workflow and interactive examples. Reuse the parts that fit your question, validate a new construct, and keep its measurement context alongside the result. Fluorescence alone does not establish the fraction of edited RNA.</p>
<p class="sonar-review-note">Review edition · supplied resources are authorized for sharing; final Wiki publication review is ongoing.</p>
</div>

## Getting Started {#getting-started}

<div class="sonar-path"><a href="#step-1"><b>01</b><span>Build your reporter<small>Sequence → construct</small></span></a><a href="#step-2"><b>02</b><span>Read the response<small>Experiment → flow → analysis</small></span></a></div>

## Reporter Design & Construction {#step-1}

### 1.1 Oligo Design {#oligo-design}

**Map a candidate window before ordering an oligo.** In SAP, open **Design**, paste or upload a transcript-sense sequence written 5′→3′, and select the target C using its 1-based coordinate. Inspect the recognition region, spacer, reading-frame padding and proposed codon change. SAP preserves the input sequence and asks you to confirm the reporter adaptation before generating oligos.

The software example below starts from a CGC triplet. The selected adaptation changes the reporter triplet to CGA; a later RNA C→U event can then produce UGA. These are two different changes. The example demonstrates design software and is not evidence of a constructed or sequenced reporter.

1. Check the target strand, coordinate, recognition region and spacing.
2. Review every proposed reporter change, then check both oligos and the complete acceptor sequence.

<div id="sonar-sequence-playground" class="sonar-instrument"><h4>Sequence Playground</h4><p>Recognition region + spacer + response codon. RNA CGA → UGA introduces a stop before the destabilizing domain. Load the interactive view to inspect the verified SAP software example.</p></div>

<details class="sonar-drawer"><summary>Manual design rationale · RP01</summary><p>Each ordered strand is written 5′→3′. Verify the reading frame, reverse-complement pairing, junctions and restriction sites against the actual acceptor. RP01 v1.0 (13 October 2026) contains an older 2,027-bp cassette example; the current SAP reference is a computationally revised 2,022-bp CDS in a 7,498-bp plasmid. Do not combine lengths or recipes across versions.</p><p><a href="static/sonar-contribution/resources/RP01.pdf">Open full protocol (PDF)</a> · <a href="static/sonar-contribution/resources/RP01.md">Source text (Markdown)</a> · The numbered Protocols library remains the maintained source.</p></details>

<div class="sonar-screens" data-sap-gallery="design"><p>Actual SAP design walkthrough: enter the target, review the adaptation, then inspect the generated oligos.</p></div>

<p class="sonar-output"><strong>Your output</strong> A checked candidate insert and oligo pair, ready for independent sequence review.</p>

### 1.2 Reporter Construction {#reporter-construction}

**Connect the insert to a verified reporter backbone.** SONAR places a replaceable target window between EGFP and an ecDHFR destabilizing domain (DD). mCherry is an expression reference from the same reporter transcript; P2A enables ribosomal skipping between the upstream and downstream products. Incomplete skipping and differences in protein maturation can still influence the readout.

Use the explorer to follow the expected coding consequence. In the unedited RNA, translation continues into DD. After the intended CGA→UGA change, translation terminates before DD and EGFP without the downstream DD can accumulate. This is a mechanism illustration, not a measured fold change.

1. Match the oligo interfaces to the exact acceptor, then assemble using the applicable construction protocol.
2. Sequence the insert, both junctions and any repaired backbone sites before measuring a clone.
3. Prepare references appropriate to the experiment. AC has a **DNA-encoded TGA** stop; it is not an enzymatically edited RNA sample. INAC is an inactive reference and is not interchangeable with every unedited target.

<div id="sonar-reporter-explorer" class="sonar-instrument"><h4>Inside the Reporter</h4><p>mCherry → P2A → EGFP → target window → ecDHFR-DD. Unedited RNA CGA continues translation; edited RNA UGA terminates before DD.</p></div>

<details class="sonar-drawer"><summary>Reporter construction · RP02</summary><p>RP02 v1.0 (13 October 2026) describes short-oligo annealing and BsaI assembly as starting conditions for method establishment. Its 4,669-bp acceptor example differs from SAP’s 7,498-bp computational reference. Recalculate molar inputs for the actual vector and validate the assembly. The supplied design is not a sequence-confirmed physical clone.</p><p><a href="static/sonar-contribution/resources/RP02.pdf">Open full protocol (PDF)</a> · <a href="static/sonar-contribution/resources/RP02.md">Source text (Markdown)</a> · <a href="static/sonar-contribution/resources/Universal_Reporter_Plasmid.gb">Inspect the computational plasmid (GenBank)</a></p></details>

<p class="sonar-output"><strong>Your output</strong> A sequence-confirmed reporter and clearly identified reference constructs.</p>

## Fluorescence Measurement & Analysis {#step-2}

### 2.1 Transfection & Editing Experiment {#transfection-editing}

**Make the samples comparable before measuring them.** Choose a suitable cell model and record the exact reporter and editor identities. A condition established in one cell line does not automatically transfer to another. Keep reporter/editor loading, delivery method, harvest time and acquisition settings traceable within a batch.

Use matched Mock controls to define background. Include editor-free and editor conditions when testing an editor, and matched AC/INAC references when establishing a reference scale. Their nominal DNA mixing fraction does not specify an edited-transcript fraction. An editor-linked BFP signal can identify co-expression only in a design that actually links BFP to the editor; BFP is not the RAS denominator.

<div class="sonar-timeline"><div><b>01 · Prepare</b><p>Confirm cell model, clone identity and sample labels.</p></div><div><b>02 · Deliver</b><p>Record amounts, reagent, plate format, density and replicates.</p></div><div><b>03 · Collect</b><p>Keep timing consistent and preserve the sample-to-file map.</p></div></div>

<details class="sonar-drawer"><summary>Cell seeding and transfection · C04</summary><p>The maintained C04 protocol describes the team’s cell seeding and Lipofectamine 3000 workflow. Use its stated scope and scaling guidance; this tutorial does not prescribe a universal reporter/editor dose.</p><p><a href="static/sonar-contribution/resources/C04.pdf">Open full protocol (PDF)</a> · <a href="static/sonar-contribution/resources/C04.md">Source text (Markdown)</a></p></details>

<p class="sonar-output"><strong>Your output</strong> Labeled cell samples with matched controls and a complete experiment record.</p>

### 2.2 Flow Cytometry & Data Acquisition {#flow-cytometry}

**Select a quantitatively usable population and preserve the original FCS files.** Record scatter and pulse geometry, mCherry and EGFP channels, and BFP when relevant. Use matched controls to establish background and gates; retain their definitions when comparing samples in the same qualified context. Scatter selection alone does not establish cell viability.

The teaching dataset below comes from real S7 CytoFLEX S acquisitions in HEK293T cells. It shows every 50th original event for a bounded display. Full-source counts and reporter scores are computed separately by the frozen SONAR engine. The recorded identity compensation matrix is not evidence of validated multicolor compensation; these detector-scale results remain exploratory.

1. Preserve raw FCS, channel names, acquisition settings, compensation status and sample identities.
2. Inspect cells, singlets and the mCherry quantitative boundary. Avoid selecting cells on the green response being evaluated.
3. Compare a teaching gate with the source preset, then carry the sample identity into analysis.

<div id="sonar-flow-playground" class="sonar-instrument"><h4>Flow Cytometry Playground</h4><p>Real data will load here. Displayed-event selections and full-source analysis are separate. If data cannot load, no counts or scores are substituted.</p></div>

<details class="sonar-drawer"><summary>Acquisition method and instrument context · RP06</summary><p>RP06 v1.1 covers CytoFLEX S / CytExpert 2.3 acquisition. Its WT-only uncompensated workflow is distinct from the archived S7 reference-mixture context shown above. Preserve the acquisition-specific channel map and do not transfer gates by protocol name alone.</p><p><a href="static/sonar-contribution/resources/RP06.pdf">Open full protocol (PDF)</a> · <a href="static/sonar-contribution/resources/RP06.md">Source text (Markdown)</a></p></details>

<p class="sonar-output"><strong>Your output</strong> Original FCS files, acquisition metadata and an auditable gating context.</p>

### 2.3 Data Analysis {#data-analysis}

**Report the strongest readout supported by the controls.** SAP’s Analysis workflow creates an experiment, accepts matched controls, previews the calibration context Θ, then accepts experimental samples for calculation and export. Check the selected population and warnings before interpreting a result. The captured walkthrough uses the actual local application, version 1.3.1, with S7_90B (corrected 75% AC DNA mass). The interactive layer example below uses S7_50B (50% AC DNA mass); an end-user installer has not been verified for public download.

RAS compares summed background-corrected green and red signals from the same selected cells. A qualified reference curve can map RAS to RES, an AC DNA mass-equivalent response scale. Neither score is a directly measured RNA editing percentage. PER requires an independently validated relationship to paired reporter-RNA sequencing and is presented here only as a research extension.

<div class="sonar-screens" data-sap-gallery="analysis"><p>Actual SAP Analysis walkthrough: initialize, load matched controls, review Θ, add samples and inspect the result.</p></div>

<div id="sonar-layer-explorer" class="sonar-instrument"><h4>Explore SONAR Layers</h4><p>Layer 0: quality and context. Layer 1: RAS, the ratio of corrected signal sums. Layer 2: reference-calibrated RES. Layer 3: sequencing-anchored PER, conditional on a validated model.</p></div>

<details class="sonar-drawer"><summary>Reveal the manual calculation</summary><p class="sonar-equation">RAS = Σ(G − bg<sub>G</sub>) / Σ(R − bg<sub>R</sub>)</p><p>Sum both corrected channels over the same selected cells in their native linear detector scale. This is not the mean of per-cell green/red ratios. The checked engine retains signed green values without clipping or pseudocounts, requires a positive corrected red sum, and checks event support and denominator precision. Empty or insufficient populations are not estimable, rather than biological zeroes.</p></details>

<p class="sonar-output"><strong>Your output</strong> A context-qualified reporter result, with construct, population, source files and analysis version kept together.</p>

## Going Further {#going-further}

**Improve the reporter.** A new window can change accessibility, reading-frame behavior and protein output. Check sequence identity before interpreting a fluorescence difference. P2A separation, DD-linked stability, fluorophore maturation and background all contribute to the assay. Validate dynamic range in the actual cell system; a compatible coding switch is only the beginning of an assay.

**Improve experimental resolution.** Compare appropriate reporter/editor amounts under matched acquisition conditions. Inspect the usable reporter population as well as its score. If an editor-linked marker is present, distinguish reporter-only and co-expression populations explicitly. Keep experimental units and replicate relationships in the sample map: thousands of cells from one well do not become thousands of biological replicates. Continuous reporter scores can be more informative than an arbitrary green-positive percentage, but they still require quality checks.

**Strengthen the interpretation.** Begin with RAS for a relative reporter response. Add matched references for an empirical RES scale and record its valid domain, including batch and reporter identity. To connect fluorescence to transcript editing, collect paired reporter-RNA measurements and evaluate a model with appropriate held-out data. Reusing a curve across a new reporter or batch requires qualification; a familiar instrument name alone is insufficient. Preserve unavailable or out-of-domain results rather than forcing a numerical conclusion.

## Adapting SONAR {#adapting-sonar}

SONAR offers two kinds of reuse: the molecular reporter architecture and the measurement logic. A suitable C→U coding switch may let you adapt the target window, provided that the new construct’s sequence, expression and response are independently validated. A different editing chemistry may require a different molecular sensor entirely. A new target, cell system or readout can also change the calibration domain.

The control, normalization and reference-calibration principles can guide a redesigned fluorescence assay even when the original molecular switch is unsuitable. Define what the reporter detects, choose a meaningful expression reference, and separate reporter activity from molecular editing evidence. The guide below helps identify a next step from your mechanism and available evidence. It cannot establish biological compatibility, predict efficiency, or replace a pilot experiment. Paired sequencing is a prerequisite for developing an editing-rate model, not a switch that automatically makes PER available.

<div id="sonar-fit-guide" class="sonar-instrument"><h4>Can SONAR Work for You?</h4><p>A C→U stop-switch may support target-window adaptation after validation. Other mechanisms may reuse the measurement framework with a separately validated sensor. Matched fluorescence controls support RAS; references support RES; paired sequencing and model validation are needed before PER.</p></div>

## Resources {#resources}

These team-supplied resources are shared for inspection and adaptation. Keep the source version and stated method limits with each reuse; computational design files are not clone-verification records.

<div class="sonar-resources">
<div><h4>Design & construction</h4><p><a href="static/sonar-contribution/resources/RP01.pdf">RP01 · Oligo design · PDF</a><br><a href="static/sonar-contribution/resources/RP02.pdf">RP02 · Golden Gate construction · PDF</a><br><a href="static/sonar-contribution/resources/Universal_Reporter_Plasmid.gb">Universal Reporter · GenBank</a></p><small>Protocol source snapshots and computational plasmid.</small></div>
<div><h4>Experiment & acquisition</h4><p><a href="static/sonar-contribution/resources/C04.pdf">C04 · Cell seeding and transfection · PDF</a><br><a href="static/sonar-contribution/resources/RP06.pdf">RP06 · Flow cytometry · PDF</a><br><a href="static/sonar-contribution/data/provenance.json">Source checksums · JSON</a></p><small>Always match the source version to your assay.</small></div>
<div><h4>Software & example data</h4><p>SAP desktop release: not yet verified for public download.</p><p><a href="static/sonar-contribution/data/flow.v1.json">S7 teaching event subset · JSON</a><br>Deterministic display subset with full-source reference statistics; original raw FCS are not bundled.</p><small>No numerical PER model is supplied.</small></div>
</div>

SONAR is learned as a workflow. Reuse the components that fit your question, keep the assay context alongside your data, and recalibrate when the reporter or conditions change.
