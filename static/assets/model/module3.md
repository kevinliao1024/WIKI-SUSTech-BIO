# Module 3 | Engineering APOBEC substrate preference

## Background

Programmable RNA editing can alter a transcript without changing its genomic sequence. Pumilio/FBF (PUF) proteins offer a modular route to RNA recognition, and engineered PUF–APOBEC fusions have enabled targeted C-to-U editing in cells and animals. These systems provide a starting point for improving the balance between editing activity and substrate preference. [Wang et al., 2002](https://doi.org/10.1016/S0092-8674(02)00873-5); [Han et al., 2025](https://doi.org/10.1038/s41467-025-64748-6).

Recruiting an editor to RNA does not, by itself, make its catalytic domain selective for one cytosine. APOBEC1 structure–function studies distinguish features involved in RNA and DNA substrate recognition, while work on APOBEC-containing DNA editors has demonstrated substantial unintended RNA editing. These findings motivate direct measurement of both desired and undesired editing in the system being engineered. [Wolfe et al., 2020](https://doi.org/10.1093/narcan/zcaa027); [Grünewald et al., 2019](https://doi.org/10.1038/s41586-019-1161-z).

Deaminase engineering can change sequence-context compatibility. Directed evolution has expanded APOBEC1-based DNA editing in GC contexts, and later work produced TadA-derived enzymes with different preferences for bases flanking the target cytosine. These DNA-editor studies support context preference as an engineering objective, although their mechanisms and performance cannot be assumed to transfer directly to RNA editing. [Thuronyi et al., 2019](https://doi.org/10.1038/s41587-019-0193-0); [Wu et al., 2026](https://doi.org/10.1038/s41587-025-02678-w).

Here, we examined the 199-residue Pro.hA1 scaffold used in our PUF-directed APOE4 editing system. Our main comparison was between c.388 in a GCG context and c.871 in a GCA context. Both sites share G at the −1 position but differ at +1. Editing at c.295 in an ACA context provided a complementary readout. We asked whether structural analysis could guide substitutions that favour the intended site while retaining useful activity.

## Model overview

### Structural representation

We used AlphaFold 3 models to compare protein–RNA interactions across substrates and variants. AlphaFold 3 predicts biomolecular structures and interactions; its output supplies structural hypotheses rather than direct measurements of catalytic activity. [Abramson et al., 2024](https://doi.org/10.1038/s41586-024-07487-w).

The RNA inputs were **GUGCGCG**, **GUGCACG** and **AUGCAGC**. The first two isolate a +1-base substitution in a shared local sequence; the third changes the broader flanking context. The baseline modelling plan used 20 seeds and five models per seed for each substrate. Seeds represent computational sampling, not biological replication.

We used two complementary contact descriptions. Coordinate-based contact decomposition distinguished side-chain and backbone contacts with RNA bases or the sugar–phosphate backbone. Separately, contact probability (**CP**) was taken from the AF3 `contact_probs` matrices and averaged across available predictions. These model-derived probabilities are distinct from the frequency of a geometric contact across structures.

For residue contacts with the +1 RNA nucleotide, we defined:

- **ΔCP = CP(GCA) − CP(GCG)**
- **ΔΔCP = ΔCP(mutant) − ΔCP(parent)**

Positive ΔΔCP therefore indicates a relative shift towards A-associated contact. It does not automatically indicate improved preference for the intended GCG site.

![Workflow connecting RNA comparison, model auditing, single-mutant screening, combination selection, within-batch testing and revised designs.](figures/workflow/rendered/workflow.png)

**Workflow.** Structural comparisons guide candidate selection, and experimental measurements determine which designs to retain or revise. The central protein–RNA image is a conceptual illustration.

### Experimental readouts

Preference and activity were evaluated together, using the parent from the same experimental batch.

| Metric | Definition | Purpose |
|---|---|---|
| +1 ratio | Editing at c.388 / editing at c.871 | Compare the two GCG/GCA-context sites |
| Activity retention | Mutant c.388 editing / same-batch parental c.388 editing | Quantify retained on-target activity |
| ROF | Mutant +1 ratio / same-batch parental +1 ratio | Normalize preference within a batch |
| Amplicon targeting ratio | Summed GCG-site editing / summed non-GCG-site editing | Assess editing distribution beyond two sites |

We retained the existing selection target of **+1 ratio ≥2.0 and activity retention ≥0.70**. This is an engineering criterion, not a statistical significance threshold. Zero or unquantifiable denominators produce undefined ratios. Different batches were not pooled as interchangeable replicates.

## Results

### Contact changes generate hypotheses but do not predict activity alone

The contact decomposition identified K30 as a candidate for altering +1 preference: its side-chain–base contact frequencies were 0.81 for the G substrate and 0.64 for the A substrate. Mutant ΔΔCP profiles then showed how substitutions redistributed relative contacts across the interface. These patterns helped prioritize experimental questions without establishing a unique base-recognition mechanism.

![Heatmap of mutant-induced changes in relative contacts with the +1 RNA base.](figures/figure_03_ddcp_heatmap/figure_03_ddcp_heatmap.png)

**Figure 3.** ΔΔCP across 21 variants for the 22 residues with the largest maximum absolute changes. The complete 199-residue matrix is retained in the data package; colours span −0.395 to +0.395.

Control comparisons exposed a limitation of the geometric descriptors. T31A retained 0.97 of parental activity, whereas T31D had a reported retention of 0, despite their structural similarity. E72A and N57A were included as designed inactive controls, but matched experimental activity was unavailable for them in the clustering package. Their annotations therefore indicate design intent rather than measured outcomes.

![Catalytic geometry and contact-based deviations across variants and controls.](figures/figure_04_negctrl_diagnosis/figure_04_negctrl_diagnosis.png)

**Figure 4.** Catalytic-distance and contact-deviation summaries for 29 construct records. The E72-based distance is unavailable for E72A because the reference side chain is absent.

These comparisons supported using structures to organize hypotheses and controls, while relying on experimental measurements to assess editing performance. The protein-only versus complex comparison in the retained Figure 7 assets provides an additional representation check, rather than a causal decomposition of activity.

### Single substitutions reveal an activity–preference trade-off

The targeted screen covered 102 single mutants across 16 positions; 101 had defined +1 ratios. Among mutants retaining at least 70% of parental activity, **K30H had the highest +1 ratio, 1.71, with retention of 0.84**. Three variants exceeded a ratio of 2.0 but retained much less activity: W130G, 3.00 at 0.32 retention; K60Q, 2.55 at 0.17; and T31G, 2.22 at 0.13.

![Activity retention versus the GCG/GCA editing ratio for the single-mutant screen.](figures/figure_08_single_site/figure_08_single_site.png)

**Figure 8.** No tested single mutant meets both the ratio ≥2.0 and retention ≥0.70 criteria. K30H provides the strongest ratio among variants above the activity floor.

The screen established K30H as a starting point for combination design. It also showed why an apparently favourable ratio must be assessed alongside activity. The results motivated combinations within the tested design space; they did not establish a universal ceiling for all possible single substitutions.

### A combination reaches the joint selection target

We combined substitutions with distinct measured effects and putative structural roles, including changes at G27, K30 and Q58. The N1 comparison contains 48 construct records, including a single-mutant comparator, of which 36 have defined ratios. Six points lie on the empirical Pareto frontier, where no other measured point improves both ratio and retention simultaneously.

**G27T–K30H–Q58M reached a +1 ratio of 2.156 with activity retention of 0.773.** It was the only defined-ratio record in this table meeting both selection criteria. The combination-batch parental ratio was 1.192; the 1.371 parental reference from the earlier single-mutant batch is contextual rather than a same-batch control.

![Combination-screen Pareto frontier highlighting G27T-K30H-Q58M.](figures/N1_combinatorial_pareto/N1_combinatorial_pareto.png)

**Figure N1.** G27T–K30H–Q58M reaches the joint ratio–activity target in the combination batch. The frontier summarizes measured values without a formal test of superiority.

This result supported retaining the triple mutant as a lead. It did not establish that its substitutions have independent or additive mechanistic roles. Nor can its difference from K30H's earlier value be interpreted as a controlled estimate of the benefit of adding two substitutions.

### Broader editing readouts require denominator-aware interpretation

We next examined editing across the amplicon using the ratio of summed GCG-site to non-GCG-site editing. Among 41 non-parent constructs with defined ratios, targeting ratio was negatively associated with summed non-GCG editing: Pearson r = −0.390 and Spearman ρ = −0.557.

![Amplicon targeting ratio compared with on-target and non-GCG editing.](figures/figure_09_targeting_ratio/figure_09_targeting_ratio.png)

**Figure 9.** Amplicon targeting ratios vary with editing output. Their association with non-GCG editing is descriptive because that quantity also appears in the ratio's denominator.

A higher ratio can reflect increased desired editing, reduced undesired editing, or unequal effects of declining activity on the numerator and denominator. We therefore carried absolute editing measurements forward with normalized summaries. The need to examine a wider RNA editing profile is also supported by prior transcriptome-wide studies of APOBEC-containing editors. [Grünewald et al., 2019](https://doi.org/10.1038/s41586-019-1161-z).

### Follow-up designs test sequence background and batch context

The next candidate table contained 61 proposed entries, divided into groups of 18, 6, 12, 5 and 20. The groups separated lead-like designs, diagnostic comparisons and controls. This proposal is distinct from the later measured batch and should not be read as 61 completed experiments.

![Candidate groups and priorities for follow-up measurements.](figures/figure_10_candidates/figure_10_candidates.png)

**Figure 10.** Five groups organize 61 candidate entries and their priorities. Group membership records the design rationale, not a predicted probability of success.

The later designed-batch table contained 37 groups, with 35 entering the valid-ratio comparison after inherited exclusions. In the same sequence background, G25E–K30H–Q58M–M132D and the corresponding M132E construct had activity-retention values of **0.3398 and 0.7517**. This contrast motivates further testing of position 132. A triple-mutant well flagged as unusable by the source analysis remained excluded; its failure mechanism was not independently established.

![Designed-batch preference–activity results and selected retention comparisons.](figures/N3_designed_batch/N3_designed_batch.png)

**Figure N3.** Follow-up measurements reveal different outcomes for position-132 substitutions. Comparisons across distinct constructs or batches provide context and are not independent replicates of one variant.

In the third-batch table, the triple mutant had **ROF 1.2185 and activity retention 0.9799**, ranking third and tenth, respectively, among 25 mutant groups. The complete N4 panel remains available with the figure assets. This additional within-batch result supports further evaluation while showing why parental normalization and assay context must accompany each reported value.

### Clustering remains an exploratory structural check

The CP study comprised 11 constructs, 56 seeds and 280 predicted models. Its selected spectral partition was reproduced by an independent refit, and 6,400 stored bootstrap records were numerically audited. However, T31A and T31D remained together in most baseline configurations despite their different activity annotations.

We also compared sequence embeddings from ESM-2, a protein language model. [Lin et al., 2023](https://doi.org/10.1126/science.ade2574). Under a predeclared analysis plan, final-layer mean embeddings produced groups of ten and one, isolating E72A while retaining T31A and T31D together. A layer-6 sensitivity analysis produced different groups. These results describe representation-dependent structure in a small set of related sequences; they do not demonstrate prediction of editing function. The complete analysis, embeddings and distance matrices are retained with the code and data.

## Conclusion

Our analysis identifies **G27T–K30H–Q58M as a lead for further testing** and clarifies the role of structural modelling in APOBEC engineering. Predicted contacts help formulate candidate substitutions, whereas joint measurements of preference and retained activity determine whether a design is useful. Neither geometric proximity nor a stable cluster is sufficient evidence of improved editing function.

The next priority is a matched comparison of the parent, K30H, the triple mutant and selected position-132 variants, with biological replication and consistent read-depth criteria. Absolute editing at c.388, c.871 and c.295 should accompany normalized metrics. Broader RNA profiling and mechanistic experiments are required before claiming transcriptome-wide specificity or a causal recognition mechanism.

## Data and code availability

[Plot tables](../data/README.md), [ORCA figure sources](../figure-sources/), [historical workflow code](../code/README.md), [CP audit](../provenance/science-audit.json), and the [ESM-2 comparison](../analysis/esm2/REPORT.md) are available in this repository. Original structure and sequencing archives are provided in the [data release](https://github.com/pdx12320/igem_module3/releases/tag/module3-data-v1). Figure identifiers are retained from the source packages.

## References

1. Wang, X., McLachlan, J., Zamore, P. D. & Hall, T. M. T. Modular recognition of RNA by a human Pumilio-homology domain. *Cell* **110**, 501–512 (2002). [doi:10.1016/S0092-8674(02)00873-5](https://doi.org/10.1016/S0092-8674(02)00873-5).
2. Han, W. et al. Effective in vivo RNA base editing via engineered cytidine deaminase APOBECs fused with PUF proteins. *Nature Communications* **16**, 9727 (2025). [doi:10.1038/s41467-025-64748-6](https://doi.org/10.1038/s41467-025-64748-6). See also the [2026 author correction](https://doi.org/10.1038/s41467-026-76669-z).
3. Wolfe, A. D., Li, S., Goedderz, C. & Chen, X. S. The structure of APOBEC1 and insights into its RNA and DNA substrate selectivity. *NAR Cancer* **2**, zcaa027 (2020). [doi:10.1093/narcan/zcaa027](https://doi.org/10.1093/narcan/zcaa027).
4. Grünewald, J. et al. Transcriptome-wide off-target RNA editing induced by CRISPR-guided DNA base editors. *Nature* **569**, 433–437 (2019). [doi:10.1038/s41586-019-1161-z](https://doi.org/10.1038/s41586-019-1161-z).
5. Thuronyi, B. W. et al. Continuous evolution of base editors with expanded target compatibility and improved activity. *Nature Biotechnology* **37**, 1070–1079 (2019). [doi:10.1038/s41587-019-0193-0](https://doi.org/10.1038/s41587-019-0193-0).
6. Wu, Y., Xiao, Y.-L. & Tang, W. High-precision cytosine base editors by evolving nucleic-acid-recognition hotspots in deaminase. *Nature Biotechnology* **44**, 587–601 (2026; published online 2025). [doi:10.1038/s41587-025-02678-w](https://doi.org/10.1038/s41587-025-02678-w).
7. Abramson, J. et al. Accurate structure prediction of biomolecular interactions with AlphaFold 3. *Nature* **630**, 493–500 (2024). [doi:10.1038/s41586-024-07487-w](https://doi.org/10.1038/s41586-024-07487-w).
8. Lin, Z. et al. Evolutionary-scale prediction of atomic-level protein structure with a language model. *Science* **379**, 1123–1130 (2023). [doi:10.1126/science.ade2574](https://doi.org/10.1126/science.ade2574).
