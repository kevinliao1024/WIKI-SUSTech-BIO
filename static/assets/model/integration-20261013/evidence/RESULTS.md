# 现有数据直接分析结果

本轮使用已经提供的 PUF 六组逐位点数据和 APOBEC 组合批原记录，完成位点配对、互斥集合序列比较、组间变化以及原指标公式复算。结果是现有筛选集合与报告子记录的描述性结论，不包含新显著性检验。

## 1. PUF12 与 PUF10 的差别也出现在共享位点的编辑率上

以染色体、位置、REF、ALT 联结两组，得到 **2,221 个共同保留位点**。其中 PUF12 率更高的有 **1,624 个（73.12%）**，更低的有 **597 个**。逐位点计算 PUF12 − PUF10 后，差值的中位数为 **+3.016 个百分点**；Spearman **ρ = 0.7232**。

因此，在两组都通过筛选的位点中，PUF12 常伴随更高的报告编辑率；其差别不只体现在候选位点总数上。这里联结的是同一基因组等位位点，各组率仍为源表四重复中位数，没有按样本编号制造配对。共享阳性位点本身是有条件选择的子集，这个结果不能直接推广到全部转录组位点。

[图：共享位点率比较](analysis/shared-rates/shared_PUF10_PUF12_rates.png) · [摘要 CSV](analysis/shared-rates/PUF10_PUF12_shared_summary.csv) · [全部配对原值](analysis/shared-rates/matched_site_rates.csv)

## 2. 较少的保留位点伴随共享位点编辑减弱

以下以 PUF12 为参考；率差先在各对共享位点内计算，再取中位数，**不是两个总体中位数相减**。

| 组别 | 保留位点 | 比 PUF12 少 | 与 PUF12 共享 | 共享位点率差中位数（组别−PUF12，百分点） |
|---|---:|---:|---:|---:|
| PUF10 | 2,774 | 78.51% | 2,221 | −3.02 |
| 132D | 197 | 98.47% | 195 | −18.86 |
| E72A | 0 | 100% | 0 | NA |
| GVE | 383 | 97.03% | 300 | −7.92 |
| SNE | 4,389 | 66.00% | 3,565 | −3.27 |

132D 与 PUF12 共享的 **195 个位点全部具有更低的 132D 报告率**。这些观察与活性减弱相容；不能仅用位点数量下降来断言特异性提升。不同组的共享集合不同，率差并非在同一公共子集上对变体作排名。E72A 的正位点数是零，其编辑率比较为 NA，未当作零编辑。

[图：保留数与共享位点变化](analysis/shared-rates/selected_count_and_shared_rate_changes.png) · [完整组比较](analysis/shared-rates/group_vs_PUF12_summary.csv)

## 3. PUF12 特有集合保留相似的中心邻域组成，同时有侧翼变化

按原正位点表形成三个互斥集合：PUF10-only **553**、共享 **2,221**、PUF12-only **10,687**。共享位点的序列核对一致，每个位点只计一次。

| 集合 | GCA 数 / 总数 | GCA 比例 | GCG 比例 |
|---|---:|---:|---:|
| PUF10-only | 220 / 553 | 39.78% | 8.32% |
| 共享 | 964 / 2,221 | 43.40% | 9.50% |
| PUF12-only | 4,469 / 10,687 | 41.82% | 7.92% |

GCA 都是三组最常见的中心三核苷酸。PUF12-only 的 GCA 比共享集合低 **1.587 个百分点**，相邻碱基组成没有变成完全不同的一类。另一方面，对全部 101 nt 的探索性位置扫描发现，PUF12-only 与 PUF10-only 最大的单位置碱基比例差出现在 **−6 位 G**：**23.98% 对 43.76%**，相差 **−19.78 个百分点**。图中展示全部位置与碱基，未只展示最大差值。

这支持“相似的中心编辑上下文伴随侧翼组成改变”的描述。最大差异是观察后的探索性特征，不是经过多重检验确认的结合位点；所有序列来自已筛选阳性集合，因此不是对转录组背景的富集，也尚不能把它命名为新增重复的半位点。

[邻位组成图](analysis/exclusive-contexts/exclusive_neighbor_composition.png) · [完整位置差图](analysis/exclusive-contexts/exclusive_position_difference.png) · [三核苷酸频数](analysis/exclusive-contexts/exclusive_context_triplets.csv) · [位置频率](analysis/exclusive-contexts/exclusive_context_positions.csv)

## 4. APOBEC 三突变体提高报告子端点比值，同时降低 C388 报告子信号

仅使用原组合批中明确标为 `PUF12-9` 与 `27T-30H-58M` 的记录，每组两条。下表为已归档、经过舍入的逐样本记录的均值。

| 端点 | 同批亲本 PUF12-9 | 三突变体 | 相对亲本下降 |
|---|---:|---:|---:|
| C388 | 67.335% | 52.005% | 22.77% |
| C871 | 56.500% | 24.125% | 57.30% |

C871 的相对下降大于 C388；C388/C871 的均值之比由 **1.192** 升至 **2.156**。这在该报告子批次支持端点比值与 C388 报告子信号之间的权衡。这里的信号为源表报告比例，未扣除背景，不能直接视为净编辑活性。每组只有两条源记录，独立重复性质未核实，因此不添加置信区间或显著性。

同时，原提示词的两个数字已按归档公式闭合：

- `ratio_p1 = mean(C388) / mean(C871)`：三突变体 **2.155648 → 2.156**。
- `retain_vs_parent = mean(C388) / 0.673`：源代码采用固定参考 **0.673**，得到 **0.772734 → 0.773**。
- 若单独描述相对于当前亲本记录均值 **0.67335** 的商，则为 **0.772332**；这不是把原 `retain_vs_parent` 改定义。
- 另一源脚本采用 `mean(C388_i / C871_i)`，得到 **2.156660 → 2.157**，不能与均值之比混用。

这是基于舍入后的源记录对公式与三位小数结果的核对，没有重跑完整原始工作簿。三个来源批次的六条三突变体记录继续原样保留，没有排除低信号、把未检出变成真零、混入四元组或进行跨批归一化。报告子结果不能推广为最终构建体的全转录组安全性。

[同批原点图](analysis/apobec-within-batch/figures/apobec_within_batch_records/figure@2x.png) · [指标复算](analysis/apobec-within-batch/descriptive-metrics.csv) · [端点变化](analysis/apobec-within-batch/endpoint_changes.csv) · [原公式证据](analysis/apobec-within-batch/sources-and-formulas.md)

## 可采用的结果表述

> Among jointly retained sites, PUF12 showed higher reported editing rates than PUF10 at 73.1% of sites, with a median within-site increase of 3.02 percentage points. The PUF12-exclusive set retained a similar central editing-context composition while showing differences in flanking sequence composition. In the archived combination-batch reporter assay, the APOBEC triple mutant increased the C388/C871 endpoint ratio while retaining approximately 77% of the parental C388 signal.

这段仅概括计算观察，不将候选位点选择差异解释为已验证的结合、动力学或临床机制。它也不把新的描述分析改标为原提示词严格机制假设已获支持。

## 方法与核验

源标签、位点选择、四重复汇总方式与参考声明全部沿用。各分析只作源值联结、频数/比例、已有公式、中位数和描述性相关；未补值、增加筛选、拟合模型或计算新 p 值。阈值来自既有源表，数值舍入容差仅用于一致性核验。5 张新图使用所附 ORCA helper、固定项目颜色和 Futura；图注在图外，CSV 与脚本同包。

数值可追溯到本包源表及每项分析的输入 SHA。另一分析脚本独立复核了六组对照的计数、率差与相关；复现与实际视觉检查见 `qa/`。原来源的目标计数配置差异、正集合选择偏倚和扩增子批次背景限制依然存在，未通过重新分析掩盖。
