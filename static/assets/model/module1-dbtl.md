# Module 1 | Design–Build–Test–Learn

## Engineering challenges shaped the RNA-seq workflow

Our RNA-seq analysis required more than connecting established tools. Parameter meanings, evidence thresholds and sequence orientation had to remain consistent before editor profiles could be interpreted. The six cycles below organize these engineering challenges, their adopted solutions and the evidence used to assess them. Software checks and computational observations are distinguished from biological validation.

![Module 1 RNA-seq processing workflow.](assets/01_module1_workflow_illustrated.png)

*RNA-seq workflow overview. Candidate sites and editing profiles are computational outputs; training and evaluation remain planned downstream work. RNA, aligned reads and the highlighted candidate are schematic illustrations, not measured sequences.*

## Cycle 1 | Tool parameters were aligned with the intended evidence

**Difficulty.** Similar parameter names did not always describe the same quantity. “Quality >30” requires integer scores of at least 31, whereas the general recount utility defaults to lower cutoffs. REDItools2 also distinguishes total non-reference support from support for each alternative nucleotide.

**Design.** We defined a shared read-evidence standard of BQ ≥31, MAPQ ≥31 and `NH=1`. Candidate discovery needed to retain potentially informative positions while leaving target-allele support to an explicit recount.

**Build.** We supplied the quality cutoffs directly and used REDItools2 with `-S -me 5 -bq 31 -q 31 -men 1`. The `-me` parameter controls total non-reference observations. Setting `-men` to 5 could instead reject an entire position when another mismatch type had fewer than five observations. We therefore used `-men 1` and evaluated target-ALT support separately.

**Test.** Inspection of the caller's filtering logic confirmed these different parameter meanings. A small synthetic check of the recount function accepted BQ31/MAPQ31 observations and rejected BQ30, MAPQ30, duplicate reads and missing or non-unique NH tags. This fixture tested counting logic, not the complete BAM-processing workflow.

**Learn.** Parameter names must be checked against tool behavior rather than translated directly from a biological requirement. The solution established consistent quality criteria without treating total mismatches as evidence for the intended substitution.

## Cycle 2 | Thresholds separated strong support from control background

**Difficulty.** High coverage alone does not guarantee convincing target-ALT support, and a treatment signal can also occur in controls. Conversely, an arbitrary large editing-rate cutoff would discard well-supported sites with modest allele fractions.

**Design.** We separated three requirements: sufficient observations, reproducibility across treated replicates and low background across complementary controls. The six-editor comparison used a shared coverage requirement across all 36 libraries.

**Build.** Each retained site required formal detection in four treated replicates, target ALT ≥20, depth ≥100 and allele rate ≥0.005 in each. Treated rate variability was limited by median absolute deviation ≤0.05. Control/mock, APOBEC-only and PUF-only each required low median rates, low variability and no formal detections. The screen also applied pooled-read Fisher comparisons and Benjamini–Hochberg FDR ≤0.05.

**Test.** Exporter fixtures accepted the ALT20/depth100 boundary and rejected a site when one replicate had ALT19 or depth99. Missing and duplicated replicate evidence were also rejected. In the analysis summary, adding background and FDR screening retained 12,908 of 24,398 PUF12 candidates that met the other criteria. For E72A, none of the 46 candidates meeting those other criteria passed the background screen.

**Learn.** Coverage, target support and background answer different questions and should not be collapsed into one threshold. The observed filtering demonstrates the contribution of the control screen, but does not establish that every excluded site was a false positive. These thresholds define a reproducible operating rule; their biological optimality remains untested.

![Retained candidate-site counts after screening for six editors.](assets/02_candidate_counts.png)

*Candidate counts after screening; these are site counts, not replicate counts. An empty E72A set does not establish editing specificity.*

## Cycle 3 | Genomic and transcript strands were reconciled

**Difficulty.** A transcript-level C-to-U event can appear as genomic C>T or G>A, depending on transcript strand. Genomic alleles, transcript orientation and sequencing-read direction are different representations. Reversing an already oriented sequence again would break the shared sequence convention.

**Design.** We required both transcript strands to retain their genomic coordinates while sharing a cytosine-centred sequence representation. Transcript annotation, rather than read direction or gene names alone, established compatibility.

**Build.** After transcript-aware filtering, the strand exporter labelled C>T candidates as `+` and G>A candidates as `−`. It preserved genomic alleles, coordinates, editing rates and already oriented sequences. Sequence contexts had to contain 101 unambiguous bases with C at zero-based index 50. REDItools2 `-S` was treated as strict mismatch reporting, not as a strand-correction option.

**Test.** Ten strand-export tests verified both mappings and preservation of original fields. They rejected conflicting strands, unsupported substitutions, duplicate sites and invalid sequence contexts. Reprocessing a correctly annotated table preserved its existing strand and sequence values.

**Learn.** Strand annotation should make an established biological convention explicit without transforming the evidence a second time. This resolved the representation problem in the exported tables, while leaving genomic coordinates available for validation and annotation.

## Cycle 4 | Replicate rates were preserved without depth weighting

**Difficulty.** Pooling all reads produces a different estimate from summarizing replicate rates. If sequencing depth varies, a deeply covered replicate can dominate the pooled value. Incomplete evidence can also be mistaken for a true zero.

**Design.** We defined the reported rate as the median of four replicate ALT/(REF+ALT) values. All four measurements had to be present, and the exported value had to match this definition.

**Build.** The exporter retained per-replicate depth, ALT support and rate, and checked the reported site rate against their median. It rejected incomplete or duplicated evidence instead of filling missing measurements with zero.

**Test.** A synthetic fixture used 20 ALT reads in each replicate with depths of 100, 200, 400 and 800. The four rates were 20%, 10%, 5% and 2.5%. The exporter accepted their median of 7.5% and rejected the pooled rate of 5.33%. These values are software-test examples, not biological measurements.

**Learn.** The aggregation rule is part of the measurement definition. Preserving replicate rates keeps the reported statistic interpretable and prevents sequencing depth from silently changing its meaning.

## Cycle 5 | Chromosome profiles used a shared detection reference

**Difficulty.** Raw chromosome counts depend on the number of cytosines that the experiment can measure. A chromosome with more callable sequence can contain more candidates without having a greater candidate density. Comparing unadjusted counts would mix detection opportunity with the distribution of editing.

**Design.** We compared all six editors against one fixed reference of callable cytosines defined using PUF12 and the controls. This provided the same chromosome-level denominator for every editor.

**Build.** The reference contained 899,942 cytosines meeting depth, quality, transcript-strand, SNP and sequence criteria; zero ALT support was allowed. We intersected each editor's retained candidates with this reference. For each chromosome, we divided the intersected candidate count by its reference-C count, then scaled the resulting rates to sum to 100%.

**Test.** Recalculation of all 144 editor–chromosome records reproduced the normalized values and reference-intersection counts. Every non-empty editor profile summed to 100%. The reference contained no chromosome Y cytosines, correctly giving NA; E72A also had an undefined profile because it had no retained candidates. Reference intersection explained the difference between PUF12's 12,908 total candidates and the 12,903 shown in the heatmap.

**Learn.** PUF10, PUF12 and SNE showed broadly distributed candidate densities, whereas the smaller 132D and GVE sets were more uneven. The normalization makes chromosome distributions comparable within the shared reference, but removes information about total candidate burden. We therefore interpreted the heatmap alongside candidate counts, rather than using its colors to rank overall activity.

![Chromosome-normalized candidate-density shares across six editors.](assets/06_chromosome_distribution.png)

*Candidate-density shares within the fixed 899,942-cytosine reference, normalized to 100% for each non-empty editor. n denotes reference-intersected candidates. E72A and chromosome Y are NA; relative shares do not rank total editing activity.*

## Cycle 6 | Target interpretation guided the next construct comparison

**Difficulty.** A smaller candidate-site set can reflect either improved selectivity or reduced editing activity. Target measurements also require their own interpretation: endogenous reference T contributes to C388, and applying a strong ALT gate would hide low target measurements.

**Design.** We evaluated candidate-site profiles together with measurements at C295, C388 and C871. PUF variants GVE and SNE were considered separately from APOBEC variants 132D and E72A.

**Build.** Target measurements required depth ≥100 in all four replicates without imposing ALT20. C388 was labelled as apparent and excluded from candidate-site counts; C295 and C871 were not systematically excluded. This preserved low target rates while making the measurement boundary explicit.

**Test.** The APOBEC variants showed attenuated signals, with E72A ranging from 0.05% to 0.32% across the monitored positions. Its empty candidate set therefore did not establish an active, highly specific editor. GVE combined fewer retained sites with lower C295/C871 signals, whereas SNE showed a higher apparent C388 signal and a larger candidate set.

**Learn.** The PUF variants support different follow-up priorities: GVE for a smaller candidate set, and SNE for its higher observed apparent C388 signal. The APOBEC variants emphasize the need to retain useful activity while reducing broader editing. Construct-aware C388 measurements and independent candidate validation are needed to establish whether these patterns translate into improved editor performance.

![Apparent editing rates at C295, C388 and C871.](assets/04_target_comparison.png)

*Apparent target rates are medians across four biological replicates. C388 includes endogenous reference T; no replicate uncertainty or statistical comparison is inferred from the supplied summary values.*

## Independent validation will extend the computational cycles

The next experimental iteration will prioritize representative candidate sites and a measurement that separates edited transgene from endogenous C388 sequence. New replicate-level measurements can test the candidate rankings and identify disagreements with the RNA-seq screen. This experimental feedback is proposed; it has not been demonstrated by the supplied analysis.

The [Module 1 manuscript](01_Module1_Wiki_EN.md) provides tool calls, analysis criteria and biological results. The [screening summary](assets/data/six_group_summary.tsv) records control-filtering outcomes. [Chromosome normalization data](assets/data/chromosome_reference_normalized.tsv) and [reference-intersection counts](assets/data/sample_scope_audit.tsv) support the shared-reference calculation.
