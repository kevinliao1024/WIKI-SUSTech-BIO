# Module 1 | RNA-seq analysis of PUF–APOBEC editing

## Overview

Programmable RNA editors need to combine target activity with control over editing elsewhere in the transcriptome. Module 1 characterizes these two aspects through RNA sequencing (RNA-seq), producing replicate-supported candidate sites and comparative editing profiles. These outputs inform PUF modeling, APOBEC variant analysis and the design of downstream LAMAR-based prioritization.

## Analysis objectives

Our analysis identifies editor-associated C-to-U candidates while accounting for read quality, genetic variation and control background. We use a shared coverage requirement to compare editors and retain replicate-level measurements for interpretation. The resulting positive-site evidence supports experimental prioritization; candidate sites remain subject to independent validation.

## Experimental design

We analysed 36 paired-end RNA-seq libraries from human HEK293T cells, with four biological replicates in each of nine groups.

GVE and SNE carry PUF mutations, whereas 132D and E72A carry APOBEC mutations. We therefore interpret changes in these two components separately.

| Component | Configuration |
|---|---|
| Editor treatments | PUF10, PUF12, 132D, E72A, GVE and SNE |
| Background controls | Control/mock, APOBEC-only and PUF-only |
| Reference | Human GRCh38 primary assembly with matching GENCODE v50 annotation |
| Candidate substitutions | Genomic C>T on the positive transcript strand and G>A on the negative transcript strand |
| Comparison scope | Positions with REF + target ALT depth ≥20 in all 36 libraries |

## Workflow

![Module 1 workflow showing adapter trimming, alignment, candidate detection, filtering, quantification and editor comparison.](assets/01_module1_workflow_illustrated.png)

*Figure 1. Module 1 RNA-seq workflow. Inputs comprise 36 libraries across nine groups, with four biological replicates per group, using GRCh38 and GENCODE v50. Outputs comprise computational candidate sites and editing profiles; training and evaluation are planned downstream work. RNA, aligned reads and the highlighted candidate are schematic illustrations, not measured sequences.*

### Read preprocessing and alignment

We removed paired-end Illumina adapters with fastp and retained its QC reports (Chen et al., 2018). Additional quality, length and poly-G filtering were disabled because read-quality selection was applied during allele counting.

STAR aligned reads to GRCh38 using the matching GENCODE v50 annotation, `--twopassMode Basic` and `--sjdbOverhang 149` for 150-nt reads (Dobin et al., 2013). GATK MarkDuplicates and SplitNCigarReads prepared coordinate-sorted alignments for site analysis (McKenna et al., 2010).

### Candidate detection and annotation

REDItools2 identified candidate positions with `-S -me 5 -bq 31 -q 31 -men 1` (Flati et al., 2020). Because `-me` measures total non-reference support, we recounted target alleles in every library using BQ ≥31, MAPQ ≥31 and `NH=1`. Unique-alignment tags were checked after preprocessing.

Recounting excluded duplicate, secondary, supplementary, QC-failed and unmapped reads, together with deleted, skipped and non-ACGT observations. Ensembl VEP, using an offline GRCh38 cache, identified transcript-compatible C>T and G>A candidates (McLaren et al., 2016).

### Genetic and sequence filtering

We excluded exact chromosome–position–REF–ALT matches to four HEK293T SNP catalogues after hg18-to-GRCh38 liftover and reference-allele checks. Each candidate required an unambiguous, transcript-oriented 101-nt sequence centred on cytosine. Low-complexity filtering required entropy ≥1.2, a homopolymer run <20 and a dinucleotide-repeat fraction <0.8.

### Background screening

Each control group required a median allele rate ≤0.02, median absolute deviation ≤0.02 and no formal caller detections. The APOBEC-only−Control and PUF-only−Control median differences each had to be ≤0.02. These gates permit low ALT counts; missing evidence was not treated as zero editing.

One-sided pooled-read Fisher tests compared each treatment with the three controls. The largest p-value per site underwent Benjamini–Hochberg correction across the eligible comparison set, with FDR ≤0.05 required (Benjamini & Hochberg, 1995). This statistic supports screening rather than inference across biological replicates.

### Site selection and editing quantification

Retained sites required formal detection in all four treated replicates, with target ALT ≥20, depth ≥100 and allele rate ≥0.005 in each. The median absolute deviation of treated rates had to be ≤0.05.

Replicate rates were calculated as `target ALT / (REF + target ALT)`. Each site was reported as the median of four replicate rates, without background subtraction.
Target positions C295, C388 and C871 are quantified separately, requiring depth ≥100 in all four treated replicates without the ALT20 gate. This preserves low target measurements. C388 is excluded from candidate-site counts, whereas C295 and C871 are not systematically excluded.

### Representative tool calls

The examples below illustrate tool invocation. Shell variables represent sample files, references and new output paths; `THREADS` specifies allocated CPU threads. They are selected commands, rather than a complete analysis launcher.

**Adapter trimming with fastp.** The two adapter sequences match the paired-end library configuration. Quality selection is deferred to candidate calling and recounting.

```bash
fastp -i "$R1" -I "$R2" -o "$TRIMMED_R1" -O "$TRIMMED_R2" \
  --adapter_sequence AGATCGGAAGAGCACACGTCTGAACTCCAGTCA \
  --adapter_sequence_r2 AGATCGGAAGAGCGTCGTGTAGGGAAAGAGTGT \
  --disable_quality_filtering --disable_length_filtering --disable_trim_poly_g \
  --thread "$THREADS" --json "$QC_JSON" --html "$QC_HTML"
```

**Splice-aware alignment with STAR.** This example uses gzip-compressed reads, a GRCh38 index and matching GENCODE annotation. Two-pass alignment uses detected splice junctions; `sjdbOverhang 149` matches 150-nt reads. Alignment tags and read groups preserve evidence needed downstream.

```bash
STAR --runThreadN "$THREADS" --genomeDir "$STAR_INDEX" \
  --readFilesIn "$TRIMMED_R1" "$TRIMMED_R2" --readFilesCommand zcat \
  --twopassMode Basic --sjdbGTFfile "$GTF" --sjdbOverhang 149 \
  --outSAMtype BAM SortedByCoordinate --outSAMattributes NH HI AS nM MD \
  --outSAMmapqUnique 60 \
  --outSAMattrRGline "ID:$READ_GROUP" "SM:$SAMPLE" "LB:$LIBRARY" PL:ILLUMINA \
  --outFileNamePrefix "$STAR_PREFIX"
```

**Candidate calling with REDItools2.** `PREPARED_BAM` denotes an indexed BAM after duplicate marking, splice processing and uniqueness-tag checks. `REDITOOLS_SCRIPT` is the installed script path, and `FASTA` is the indexed GRCh38 reference.

```bash
python2 "$REDITOOLS_SCRIPT" \
  -f "$PREPARED_BAM" -r "$FASTA" -o "$CALLS_TSV" \
  -S -q 31 -bq 31 -me 5 -men 1
```

Here, `-S` retains positions with mismatches, while `-q` and `-bq` set mapping and base quality thresholds. `-me 5` requires total non-reference support; `-men 1` avoids rejecting a position solely because another mismatch type has fewer than five observations. Target-ALT support and transcript strand are evaluated separately.

## Results and interpretation

### PUF12 showed broader editing without uniformly higher target activity

PUF12 produced the largest retained-site set, with 12,908 sites, whereas PUF10 produced 2,774. Their median rates across retained sites were similar, at 13.99% and 12.75%, respectively. The larger PUF12 set therefore reflected broader detectable editing rather than a comparable increase in the typical retained site's rate.

![Retained candidate-site counts for six editors.](assets/02_candidate_counts.png)

*Figure 2A. Retained candidate-site counts after screening. Counts represent sites, not biological replicates. C388 is excluded; C295 and C871 are not systematically excluded. E72A has no retained candidate sites.*

![Median editing rate across retained sites for each editor.](assets/03_site_rate_summary.png)

*Figure 2B. Median across retained-site editing rates; each site rate is itself the median across four biological replicates. E72A is NA because its retained set is empty. These points summarize the supplied data and do not depict the underlying distributions. No uncertainty intervals or statistical comparisons are inferred.*

[Original editing-distribution figure](assets/03_editing_distribution.png) is retained for reference. Per-site rates were not supplied, so the original boxplots have not been reconstructed.

| Editor | Retained sites | Median across sites (%) | Apparent C388 rate (%) |
|---|---:|---:|---:|
| PUF10 | 2,774 | 12.75 | 73.23 |
| PUF12 | 12,908 | 13.99 | 81.01 |
| 132D | 197 | 6.09 | 36.44 |
| E72A | 0 | NA | 0.32 |
| GVE | 383 | 8.66 | 64.98 |
| SNE | 4,389 | 11.86 | 76.91 |

The target comparison did not show uniform superiority of PUF12. PUF10 and PUF12 had similar apparent C295 rates, at 42.17% and 41.34%, while PUF10 had a higher C871 rate, at 75.10% versus 63.50%. PUF10 therefore warrants follow-up when activity at these positions and a smaller candidate-site set are priorities. A larger site set should not itself be interpreted as better editor performance.

### APOBEC variants showed reduced detectable activity

The APOBEC variants 132D and E72A showed lower measurements across the three monitored positions. PUF12 serves as a descriptive comparator, without assuming that every construct differs from it by only one substitution.

![Apparent editing rates at C295, C388 and C871 across six editors.](assets/04_target_comparison.png)

*Figure 3. Apparent target rates at C295, C388 and C871, reported as medians across four biological replicates, with matched percentage scales. Targets require depth ≥100 in all four treated replicates without the ALT20 gate. C388 includes endogenous reference T and therefore does not isolate transgene-editing efficiency. Raw replicate rates were not supplied; no error bars or statistical comparison are added.*

The 132D group retained only 197 sites, with apparent C295, C388 and C871 rates of 3.11%, 36.44% and 18.65%. This pattern is consistent with reduced detectable activity, rather than a selective reduction of unwanted editing alone. E72A had no retained candidate sites and very low rates at all three positions, ranging from 0.05% to 0.32%. Its empty site set is therefore better interpreted alongside activity loss than as evidence of an active, highly specific editor.

These APOBEC variants prioritize different engineering questions. The residual 132D signal motivates testing whether reduced broader activity can coexist with useful activity at selected targets. E72A instead highlights the need to preserve editing activity when modifying the APOBEC component. The measurements do not by themselves distinguish altered catalysis from changes in expression or construct stability.

### PUF variants shifted the balance between site breadth and target signals

The PUF variant GVE retained 383 sites, approximately 97.0% fewer than PUF12, while showing an apparent C388 rate of 64.98%. Its C295 and C871 rates were lower, at 19.78% and 6.20%. This combination makes GVE a candidate for testing reduced editing outside C388 while retaining a measurable C388 signal.

SNE retained 4,389 sites, approximately 66.0% fewer than PUF12, with an apparent C388 rate of 76.91%. Its C295 and C871 rates were 17.83% and 28.28%, respectively. Compared with GVE, SNE showed a higher apparent C388 signal but a larger candidate-site set and higher C871 activity. GVE thus favors a smaller screened set, whereas SNE offers a higher observed apparent C388 signal.

These patterns support prioritizing GVE and SNE for distinct engineering objectives, rather than declaring one variant universally better. C388 measurements require construct-aware confirmation because endogenous T contributes to the signal. Expression, coverage and screening effects also remain alternative explanations for differences between constructs. The comparisons are descriptive; replicate-level effect estimates and statistical support are needed to establish mutation-specific improvements.

### Sequence context was partly conserved across editor groups

Guanine remained prominent at position −1 in every non-empty editor set. This shared feature suggests that the variants retained a common local sequence bias despite differences in activity and site numbers. The GVE logo showed less pronounced −1 guanine dominance and a more visible −2 adenine component, suggesting a context shift worth testing.

![Sequence logos from positions minus two to plus one around the central cytosine.](assets/05_motif_logos.png)

*Figure 4. Local sequence composition around retained cytosines. The original sequence-logo image is retained unchanged because motif frequencies and source sequences were not supplied for redrawing. Logos are descriptive, without matched-background enrichment testing; E72A is NA because no sites were retained.*

Central cytosine was fixed by site selection and therefore does not independently demonstrate sequence preference. Differences in retained-set size and sequence availability can also affect the logos. A matched-background comparison would distinguish context enrichment from the composition of the screened transcripts.

### Chromosome normalization supported broadly distributed candidate editing

We compared chromosome profiles against a fixed reference of 899,942 callable cytosines defined using PUF12 and the three control groups. The reference required depth ≥100 in four PUF12 replicates and ≥20 in all twelve controls, together with quality, strand, SNP and sequence filters. Each editor's retained sites were intersected with this reference before normalization.

For editor g and chromosome c, let N(g,c) denote retained candidates within the reference and C(c) the number of reference cytosines. The plotted value is:

`Normalized share(g,c) = 100 × [N(g,c) / C(c)] / Σk [N(g,k) / C(k)]`

The sum includes chromosomes with a non-zero reference denominator. This adjusts for the number of measurable cytosines, then scales each editor's chromosome profile to 100%. It describes relative candidate density, rather than per-site editing efficiency or the raw fraction of candidates on a chromosome.

PUF10, PUF12 and SNE showed broadly distributed profiles, with normalized shares ranging from approximately 3.1% to 5.7%. Candidate densities were distributed across callable regions of autosomes and X, rather than restricted to chromosome 19. PUF12's profile is not forced to be flat because the denominator contains callable cytosines, not PUF12-positive sites.

The smaller 132D and GVE sets were more uneven, reaching their highest shares on X (7.8%) and chromosome 22 (7.6%), respectively. These peaks represented only 17 and 14 candidate sites. Sampling variability is therefore a plausible contributor, and the peaks alone do not establish chromosome preference.

![Chromosome distribution heatmap for the six editors.](assets/06_chromosome_distribution.png)

*Figure 5. Candidate densities within a shared callable-C reference, scaled to 100% per editor; n denotes reference-matched candidates. E72A has no candidates, and chromosome Y has no reference cytosines, so both are NA.*

Intersecting candidates with the reference explains the lower totals in this panel, including 12,903 rather than 12,908 for PUF12. The pattern is plausible after accounting for measurable cytosines, but it remains conditional on the PUF12-derived reference. Because every non-empty row sums to 100%, the heatmap cannot rank overall editing activity; candidate counts must be considered separately.

## Engineering implications

Module 1 connects measurements to the next design decision through three outputs:

- **PUF and APOBEC evaluation:** target measurements and candidate-site profiles support joint assessment of activity and broader editing patterns.
- **LAMAR-based prioritization:** transcript-oriented sequences provide positive candidate evidence; training labels and independent model evaluation require separate design.
- **Experimental follow-up:** candidate loci and replicate evidence guide site selection, while construct-aware measurements are needed to resolve C388 ambiguity.

The accompanying [DBTL account](02_Module1_DBTL_EN.md) connects these results to the next experimental cycle. Candidate sites require independent confirmation, and catalogue filtering cannot exclude every sample-specific genetic variant.

## Reproducibility and availability

The [REWIRE repository](https://github.com/pdx12320/REWIRE-RNA-editing-pipeline) provides workflow settings, environments, counting code and export tools. [Result summaries](assets/data/displayed_summary.tsv), [chromosome normalization data](assets/data/chromosome_reference_normalized.tsv) and [reference-intersection counts](assets/data/sample_scope_audit.tsv) accompany the figures. Raw sequencing data and a complete portable launcher are not included.

## References

Benjamini, Y., & Hochberg, Y. (1995). Controlling the false discovery rate: A practical and powerful approach to multiple testing. *Journal of the Royal Statistical Society: Series B (Methodological), 57*(1), 289–300. [https://doi.org/10.1111/j.2517-6161.1995.tb02031.x](https://doi.org/10.1111/j.2517-6161.1995.tb02031.x)

Chen, S., Zhou, Y., Chen, Y., & Gu, J. (2018). fastp: An ultra-fast all-in-one FASTQ preprocessor. *Bioinformatics, 34*(17), i884–i890. [https://doi.org/10.1093/bioinformatics/bty560](https://doi.org/10.1093/bioinformatics/bty560)

Dobin, A., Davis, C. A., Schlesinger, F., Drenkow, J., Zaleski, C., Jha, S., Batut, P., Chaisson, M., & Gingeras, T. R. (2013). STAR: Ultrafast universal RNA-seq aligner. *Bioinformatics, 29*(1), 15–21. [https://doi.org/10.1093/bioinformatics/bts635](https://doi.org/10.1093/bioinformatics/bts635)

Flati, T., Gioiosa, S., Spallanzani, N., Tagliaferri, I., Diroma, M. A., Pesole, G., Chillemi, G., Picardi, E., & Castrignanò, T. (2020). HPC-REDItools: A novel HPC-aware tool for improved large scale RNA-editing analysis. *BMC Bioinformatics, 21*(Suppl. 10), Article 353. [https://doi.org/10.1186/s12859-020-03562-x](https://doi.org/10.1186/s12859-020-03562-x)

McKenna, A., Hanna, M., Banks, E., Sivachenko, A., Cibulskis, K., Kernytsky, A., Garimella, K., Altshuler, D., Gabriel, S., Daly, M., & DePristo, M. A. (2010). The Genome Analysis Toolkit: A MapReduce framework for analyzing next-generation DNA sequencing data. *Genome Research, 20*(9), 1297–1303. [https://doi.org/10.1101/gr.107524.110](https://doi.org/10.1101/gr.107524.110)

McLaren, W., Gil, L., Hunt, S. E., Riat, H. S., Ritchie, G. R. S., Thormann, A., Flicek, P., & Cunningham, F. (2016). The Ensembl Variant Effect Predictor. *Genome Biology, 17*(1), Article 122. [https://doi.org/10.1186/s13059-016-0974-4](https://doi.org/10.1186/s13059-016-0974-4)
