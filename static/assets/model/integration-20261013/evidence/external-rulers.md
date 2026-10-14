# 外部标尺核验

访问日期：2026-10-12。书目通过 PubMed DOI/PMID 或 Crossref Crossmark 核验；数字优先使用原始论文全文、原论文表格或可访问摘要。每条保留用途限制；UNUSABLE 的论断从可用结论中排除。

## 必须修正的提示词前提

- Grünewald 的 Nat Biotechnol 卷页指向 SECURE-ABE 后续研究；BE3 原始转录组前后对照应引用其 Nature 论文。
- AIMer 对应 Monian 等，而 Yi 等所述为 LEAPER2.0；RESCUE 使用外源融合编辑蛋白，不能归类为仅募集内源酶。
- Han 的癫痫风险倍数没有核实。HTT 选择性实例不等于行业标准。

数字逐条见 [external-benchmark-values.csv](external-benchmark-values.csv)，书目/证据表见 [external-source-ledger.csv](external-source-ledger.csv)。不同研究的筛选、表达、组织与终点不匹配，不能据此排名 ORCA 安全性。

## R1-cited — USABLE_AS_FOLLOWUP_CONTEXT

Grunewald et al., Nat Biotechnol 37:1041–1048 (2019)

DOI: [10.1038/s41587-019-0236-6](https://doi.org/10.1038/s41587-019-0236-6) · PMID: 31477922 · [书目核验](https://pubmed.ncbi.nlm.nih.gov/31477922/)

The inspected text reports miniABEmax and ABEmax produced mean RNA-edit counts 80-fold and 54-fold above GFP-only background respectively, in HEK293T transcriptome profiling. These are not the final optimized variant reductions. [原始来源](https://pmc.ncbi.nlm.nih.gov/articles/PMC6730565/)

短引文： “reduced off-target RNA editing and comparable on-target DNA activities” （PMC abstract）

适用边界：Direct PMC opening intermittently presented a browser check; indexed primary article content and PubMed verified. No final optimized-ABE absolute counts asserted. Use corrected Nature2019 entry for BE3 before/after.

## R1-BE3-corrected — USABLE

Grunewald et al., Nature 569:433–437 (2019)

DOI: [10.1038/s41586-019-1161-z](https://doi.org/10.1038/s41586-019-1161-z) · PMID: 30995674 · [书目核验](https://pubmed.ncbi.nlm.nih.gov/30995674/)

HEK293T RNF2-gRNA transcriptome RNA C-to-U counts, high-expression population. WT BE3 replicates: 91951, 192088, 90509; BE3-R33A: 236, 377, 197; BE3-R33A/K34A: 24, 26, 7; catalytic BE3-E63Q comparator: 15, 9. [原始来源](https://pmc.ncbi.nlm.nih.gov/articles/PMC6657343/)

短引文： “BE3-R33A/K34A inducing 26 or fewer of such edits” （Results preceding Figure2; Extended Data Table1 supplies exact counts.）

适用边界：Same-study comparison supports reduction near the inactive comparator, not zero risk. Expression population and calling pipeline differ from ORCA. Does not calibrate RNA therapeutic efficiency or clinical safety.

## R2-LEAPER — USABLE

Qu et al., Nat Biotechnol 37:1059–1069 (2019)

DOI: [10.1038/s41587-019-0178-z](https://doi.org/10.1038/s41587-019-0178-z) · PMID: 31308540 · [书目核验](https://pubmed.ncbi.nlm.nih.gov/31308540/)

LEAPER arRNA151-PPIB: about 50% endogenous PPIB editing in the targeted assay (Figure3b). Matched transcriptome experiment: about 37% PPIB editing, 5 potential off-targets versus 6 in control-RNA group (Figure4). [原始来源](https://weilab.pku.edu.cn/docs/20190916155718828552.pdf)

短引文： “the PPIB on-target rate based on NGS analysis was ~37%” （Published PDF page7 of16 (printed1065), Results RNA editing specificity.）

适用边界：Five sites were not established as sequence-dependent effects; two off-target transcripts occurred in both groups. Do not call five verified guide-specific edits or infer zero off-targets. Cell/target-specific assay; not ORCA-comparable.

## R2-RESCUE — USABLE

Abudayyeh et al., Science 365:382–386 (2019)

DOI: [10.1126/science.aax7063](https://doi.org/10.1126/science.aax7063) · PMID: 31296651 · [书目核验](https://pubmed.ncbi.nlm.nih.gov/31296651/)

Figure4 whole-transcriptome experiment: RESCUE reporter Gluc C-to-U editing about 80%, 188 C-to-U and 1695 A-to-I off-targets; RESCUE-S about 76%, 103 C-to-U and 139 A-to-I off-targets. Separate HEK293FT survey combined 24 endogenous sites across 9 genes and 24 synthetic disease targets, with rates up to 42%. [原始来源](https://pmc.ncbi.nlm.nih.gov/articles/PMC6956565/)

短引文： “103 C to U off-targets and 139 A to I off-targets” （Main text accompanying Figure4E–G.）

适用边界：About80/76% is Gluc reporter editing, not endogenous transcript performance. The42% sentence pools the target survey; do not assign its maximum to a specific endogenous site without source data. Exogenous fusion platform.

## R2-AIMer-corrected — USABLE_FOR_EFFICIENCY_ONLY

Monian et al., Nat Biotechnol 40:1093–1102 (2022)

DOI: [10.1038/s41587-022-01225-1](https://doi.org/10.1038/s41587-022-01225-1) · PMID: 35256816 · [书目核验](https://pubmed.ncbi.nlm.nih.gov/35256816/)

AIMers achieved up to 50% endogenous ACTB A-to-I editing in nonhuman-primate liver; abstract reports no bystander editing and persistence for at least one month. [原始来源](https://www.nature.com/articles/s41587-022-01225-1)

短引文： “editing persisting for at least one month” （PubMed abstract, matching publisher abstract.）

适用边界：Exact transcriptome-wide off-target total not verified. Publisher Extended Data Figure5 distinguishes in-vitro off-target discovery from examination of those sites in vivo; no bystanders does not mean zero global off-targets. Prompt author corrected from Yi to Monian.

## R2-Yi-identity-only — IDENTITY_VERIFIED_NOT_USED_AS_AIMER

Yi et al., Nat Biotechnol 40:946–955 (2022)

DOI: [10.1038/s41587-021-01180-3](https://doi.org/10.1038/s41587-021-01180-3) · PMID: 35145313 · [书目核验](https://pubmed.ncbi.nlm.nih.gov/35145313/)

Circular ADAR-recruiting RNAs (LEAPER2.0), not AIMer. No benchmark substituted. [原始来源](https://www.nature.com/articles/s41587-021-01180-3)

引文不适用：此项仅核对书目身份，未摘录原文，也未替换为 AIMer 数值。

适用边界：Identity-only correction; no benchmark substituted

## R-3 — UNUSABLE_FOR_REQUESTED_CLAIM

Han et al. (2025), Effective in vivo RNA base editing via engineered cytidine deaminase APOBECs fused with PUF proteins

DOI: [10.1038/s41467-025-64748-6](https://doi.org/10.1038/s41467-025-64748-6) · PMID: 41188225 · [书目核验](https://pubmed.ncbi.nlm.nih.gov/41188225/)

No 80% reduction or fivefold epilepsy-risk benchmark found. Study uses a Mef2c L35P mouse autism model and social-behaviour/survival endpoints. [原始来源](https://www.nature.com/articles/s41467-025-64748-6)

短引文： “rescued abnormal social behaviors.” （Figure 7 title; superscript normalized to inline text）

适用边界：Do not use a mouse social-behaviour endpoint as a human epilepsy-risk multiplier. Full publisher text searched for epilepsy, seizure, five, 80% and risk; none verified the requested relationship.

## R-3-correction — MANDATORY_CONTEXT

Han et al. (2026), Author Correction

DOI: [10.1038/s41467-026-76669-z](https://doi.org/10.1038/s41467-026-76669-z) · PMID: not verified · [书目核验](https://crossmark.crossref.org/dialog/?doi=10.1038%2Fs41467-026-76669-z)

Correction published 2026-08-12; Fig. 7j and associated source data repaired after mouse 12 data were overwritten with mouse 6 data. [原始来源](https://www.nature.com/articles/s41467-026-76669-z)

短引文： “data for mouse 12 were inadvertently overwritten by data from mouse 6” （Correction main paragraph）

适用边界：Correction concerns social-intruder sniffing-time data; it does not establish the requested epilepsy-risk relation.

## R-4 — USABLE_AS_STUDY_EXAMPLE_ONLY

Conroy et al. (2022), Chemical engineering of therapeutic siRNAs for allele-specific gene silencing in Huntington’s disease models

DOI: [10.1038/s41467-022-33061-x](https://doi.org/10.1038/s41467-022-33061-x) · PMID: 36192390 · [书目核验](https://pubmed.ncbi.nlm.nih.gov/36192390/)

SNP4 showed approximately 20-fold and SNP6 approximately 7-fold allelic discrimination in HTT luciferase reporters; target IC50 approximately 38 and 24 nM, respectively. Optimized compounds exceeded 50-fold in a cell-based assay. [原始来源](https://www.nature.com/articles/s41467-022-33061-x)

短引文： “demonstrated ~20-fold (SNP4) and ~7-fold (SNP6) discrimination against the non-target reporter” （Results, primary screen; Figure 1c）

适用边界：An experimental IC50 selectivity ratio in a reporter assay is not an industry standard, clinical acceptance threshold, or editing-rate ratio. The paper provides no universal 20:1 requirement.

## R-5-original — USABLE_CONTEXT_ONLY

Picardi et al. (2017 issue; online 2016), REDIportal: a comprehensive database of A-to-I RNA editing events in humans

DOI: [10.1093/nar/gkw767](https://doi.org/10.1093/nar/gkw767) · PMID: 27587585 · [书目核验](https://pubmed.ncbi.nlm.nih.gov/27587585/)

More than 4.5 million A-to-I events across 55 human body sites; aggregate catalog from thousands of RNA-seq experiments. [原始来源](https://doi.org/10.1093/nar/gkw767)

短引文： “more than 4.5 millions of A-to-I events detected in 55 body sites” （Abstract）

适用边界：Catalog union across samples; not millions of edits per transcript, per cell, or a demonstrated safety budget for an introduced editor.

## R-5-update — USABLE_CONTEXT_ONLY

D’Addabbo et al. (2025 issue; online 2024), REDIportal: toward an integrated view of the A-to-I editing

DOI: [10.1093/nar/gkae1083](https://doi.org/10.1093/nar/gkae1083) · PMID: 39588754 · [书目核验](https://pubmed.ncbi.nlm.nih.gov/39588754/)

Approximately 16 million putative A-to-I editing sites in the reported release, including TCGA data from 31 studies. [原始来源](https://doi.org/10.1093/nar/gkae1083)

短引文： “∼16 million of putative A-to-I editing sites” （Abstract）

适用边界：Release-specific aggregate, includes putative sites and heterogeneous tissues/conditions; do not present as a universal normal-cell burden.

## R-5-review — USABLE_QUALITATIVE_CONTEXT_ONLY

Eisenberg and Levanon (2018), A-to-I RNA editing — immune protector and transcriptome diversifier

DOI: [10.1038/s41576-018-0006-1](https://doi.org/10.1038/s41576-018-0006-1) · PMID: 29692414 · [书目核验](https://pubmed.ncbi.nlm.nih.gov/29692414/)

Review identity verified. No exact low-editing fraction was extracted from the accessible review. [原始来源](https://www.nature.com/articles/s41576-018-0006-1)

短引文： “The most common type of RNA editing is A-to-I editing” （PubMed abstract）

适用边界：Do not attribute Bazak’s measured low-level fractions to this review without checking its full text.

## R-5-low-fraction — USABLE_CONTEXT_ONLY

Bazak et al. (2014), A-to-I RNA editing occurs at over a hundred million genomic sites, located in a majority of human genes

DOI: [10.1101/gr.164749.113](https://doi.org/10.1101/gr.164749.113) · PMID: 24347612 · [书目核验](https://pubmed.ncbi.nlm.nih.gov/24347612/)

In ultradeep sequencing of selected editable Alu elements, most sites had editing below 1% of transcripts; median editing level 0.475%. Estimate exceeding 100 million potentially edited sites is an extrapolation, distinct from the 1.6 million sites detected in the large-scale dataset. [原始来源](https://pmc.ncbi.nlm.nih.gov/articles/PMC3941102/)

短引文： “Most sites are edited at low levels (<1% of transcripts)” （Results, Editing levels follow a log-normal distribution）

适用边界：Low fractions concern selected Alu repeats and endogenous ADAR A-to-I editing; cannot be generalized to coding sites or induced APOBEC C-to-U editing.

## 提示词所要求标尺的最终用途

| 标尺 | 决定 |
|---|---|
| R-1 | 采用更正后的论文身份；只支持同研究内 RNA 非预期编辑可下降的工程先例。 |
| R-2 | 保留靶点、组织和 reporter/endogenous 区别；未核实的全局脱靶数字留空。 |
| R-3 | UNUSABLE：不使用癫痫风险倍数。 |
| R-4 | “行业标准”论断 UNUSABLE；特定 reporter 选择性例证可用。 |
| R-5 | 内源 A-to-I 生物学背景可用；推导 APOBEC 安全预算不可用。 |
