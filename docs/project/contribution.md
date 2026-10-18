---
title: Contribution
subtitle: Connecting experimental records, measurement and computational analysis for reuse.
eyebrow: Project
status: pending
status_label: Content pending team review
status_message: This overview is prepared for team review. Individual resources retain their own evidence and release status.
---

# Contribution

## <span class="sap-logo-label">SONAR</span>![SONAR — SAP logo](/assets/images/sonar/sap-logo.svg){.sap-logo width="485" height="165"} {#sonar data-toc-label="SONAR"}

<!-- SONAR_TUTORIAL: rendered from contribution-sonar.md, with headings nested under SONAR. -->

## <span class="puffer-logo-label">PUFFER</span>![PUFFER logo: teal pufferfish with an RNA recognition motif and navy wordmark](/assets/images/puffer/puffer-logo.png){.puffer-logo width="922" height="227"} {#puffer data-toc-label="PUFFER"}

<div class="sonar-intro" id="puffer-intro">
<p class="sonar-kicker">From a target sequence to candidate designs</p>
<p>PUFFER connects a browser-based PUF design workspace with local computational analysis. Start with a target RNA sequence, inspect recognition windows, assemble candidate PUF proteins and keep the designs alongside measured assay records. The companion application supports assay-informed protein ranking and LAMAR-based RNA-site prioritization, with these two outputs kept separate. Together, the tools help organize candidates for experimental follow-up while preserving the inputs and analysis context. Rankings guide prioritization; they do not establish RNA editing efficiency or replace experimental validation.</p>
</div>

[Explore PUFFER: overview, tutorial and workflow](/software#workbench).

## Other {#other}

### A shared experimental and computational workflow {#contribution-summary}

ORCA brings wet-lab measurements and dry-lab analysis into one research workflow. Experiments provide the observations needed to assess an RNA editor; computational analysis helps organize those observations, compare candidate designs and identify questions that remain unresolved. Our contribution is the connection between these activities, together with the records and tools that make the reasoning inspectable.

The resources collected here serve different purposes. The Experiment library documents methods, the Notebook preserves the research chronology, SONAR explains the measurement framework, and the Model and Software pages present computational work with its evidence and assumptions. These resources allow another team to follow how a question became an experiment, how an observation was interpreted and where further evidence is needed.

### Wet-lab methods and research records {#wet-lab-resources}

The Experiment library organizes the team's methods under stable identifiers and subject categories. Its browser reader and original PDFs provide complementary ways to consult the same source material. Keeping the identifiers and source documents together makes it easier to connect a method to the record of its use.

The Notebook adds the chronological context. Its tracks bring together foundational work, editor comparisons, regulatory modules, measurement and functional validation. Dated entries retain their experiment titles, contributors and original pages. This structure lets readers inspect the sequence of work, including repeated attempts and follow-up measurements, rather than seeing only a final summary.

Methods and records have distinct roles. A protocol describes an approach; a notebook entry documents an occasion on which work was recorded. Neither alone establishes the reproducibility of a biological result. Their value is that the underlying evidence remains available for comparison with the project's conclusions.

### Dry-lab analysis across molecular and system scales {#dry-lab-resources}

#### RNA-seq evidence and editor comparisons

The Model page connects candidate RNA-editing sites with the PUF and APOBEC work. RNA-seq analysis provides a documented basis for comparing detected candidate profiles, while the editor studies connect computational hypotheses with measured outcomes. Together, these views help distinguish a more favorable editing profile from a general loss of editor activity.

For reuse, the relevant contribution is the analysis context as well as the result: the comparison being made, the origin of the measurements and the limits of the evaluation. A result obtained in a tested panel remains a result for that panel; it does not establish the behavior of every possible editor or cellular setting.

#### Prioritization with LAMAR

LAMAR provides the complementary perspective of ranking RNA regions and sites for follow-up. Its outputs organize candidate evidence into a more manageable set of questions. A ranking helps allocate attention, while the biological interpretation still depends on independent evidence at the sites being considered.

#### Whole-body modeling

The Software page connects delivery, tissue distribution, cellular expression and RNA editing within a common modeling framework. Its figures and archived outputs make assumptions, uncertainty and differences between simulated scenarios visible. The spatial view adds a way to examine variation that can be obscured by an overall average.

These models extend the project beyond an isolated molecular comparison. They help describe how conclusions depend on processes at other scales. Their outputs remain simulations in the stated model context, rather than demonstrations of delivery or therapeutic effectiveness in a living organism.

### Bringing wet and dry work together {#how-to-reproduce}

The shared workflow begins with a defined question and a traceable observation. Experimental records establish what was measured. Computational work then examines patterns, comparisons and uncertainty. The resulting interpretation identifies which conclusions are supported and which questions should return to experimental review.

Another team can reuse this organization without assuming that ORCA's results transfer unchanged. Source records, resource versions and the stated scope of each analysis provide the starting point for a new comparison. Keeping these elements connected also makes disagreements useful: an unexpected measurement can be traced to its context, and a model can be revised when its assumptions no longer fit the evidence.

### Interpretation and limitations {#troubleshooting}

The project makes several kinds of evidence available, and each supports a different claim. A working interface demonstrates software functionality. A model ranking supports prioritization. A notebook page records an experiment. A biological conclusion requires the relevant measurements and controls to be assessed together.

This separation is part of the contribution. It prevents a convenient score, an illustrative simulation or a successful software test from becoming a stronger biological claim than the evidence allows. Resource-specific limitations and review status remain applicable when the material is reused.

### Reusable resources {#reusable-materials}

| Resource | What it contributes |
|---|---|
| [Experiment](/experiments) | A searchable method library with stable identifiers, browser readers and original PDFs. |
| [Notebook](/notebook) | Dated research records organized by experimental track. |
| [Model](/model) | RNA-seq analysis, editor comparisons and site-prioritization evidence. |
| [Software](/software) | Whole-body modeling, figures and archived computational resources. |

### Access and attribution {#license-access}

The Wiki provides the context for these contributions and preserves links to their source material. Reuse should retain resource names, versions, authorship and the relevant evidence limitations. The Wiki's content license is shown in the footer; separately distributed code, data and third-party resources must be used under their own stated terms.
