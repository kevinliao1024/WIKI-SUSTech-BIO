# Safety & Security｜安全与安保

**Safety Across Scales｜从 RNA 序列到潜在治疗应用。**

中文审阅稿，2026-10-12。对应英文正文 `docs/wet-lab/safety-and-security.md`，本文件未接入网站。已确认的实验室信息来自团队安全表单；实验结果仍需补入。

## Safety Across Scales｜跨尺度的安全

ORCA 的目标是修正 APOE4 RNA 上的特定位点。选择编辑器时，我们同样关心它在其他位置的活动：是否会识别别的转录本、改变目标附近的碱基，或在非目标细胞中持续表达。递送方式和测量方法也会影响我们对这些结果的判断。

这些问题沿着八个尺度展开：序列、系统、编辑器、细胞、测量、功能、治疗，以及人与社会。我们用**预判 → 约束 → 检测 → 决策**组织这条路径。先在序列和系统层面寻找风险，再通过编辑器设计与细胞表达控制限制活动，用分子测量和功能检测检查后果；进入递送和潜在治疗讨论时，再结合实验结果与未来使用者的需求决定下一步。

## I. Anticipate｜预判

### Scale 01 — 序列尺度

针对 APOE 设计的 PUF 可能遇到其他转录本中的相似序列。我们开发了 [PUF-OffTarget Atlas](/offtarget-atlas)，按照设定的错配条件搜索这些位点，并整理候选供检查。在数据可获得时，流程还加入组织表达、RNA 可及性和注释信息，帮助解释位点的优先级。运行设置和相关证据随排序一起导出。

Atlas 帮助我们选择要验证的对象。单凭序列匹配，还无法判断编辑器是否会在细胞中结合或编辑该 RNA。目前的[归档示例](/static/evidence/puf-atlas-example/run_metadata.json)采用肝脏上下文。下一步需要用最终 ORCA 序列运行，并在实验中检查选出的位点。

### Scale 02 — 系统尺度

[Brain Delivery Digital Twin](/brain-delivery)用于研究递送、脑内进入、编辑器表达和编辑之间的关系。模型把目标编辑与三类非预期活动分开表示：目标附近的旁观者编辑、PUF 错配相关编辑和脱氨酶背景。这样可以查看某项候选设计的收益和代价。

其中部分参数来自文献估计或归一化假设，因此模型用于比较假设设计，并帮助确定测量优先级。现有敏感性分析将运输过程和编辑动力学列为重要的不确定性来源；获得测量后，可以更新这些参数并重新比较。当前 [ProAPOBEC 示例](/static/evidence/brain-delivery-v4-summary.md)也使用占位的活性与背景参数，排序依赖这些输入。

## II. Constrain｜约束

### Scale 03 — 编辑器尺度

我们希望在 APOE 目标位点获得足够活性，同时减少非预期编辑。PUF 识别模块和 APOBEC 模块因此需要联合评价。候选比较应检查目标位点、邻近可编辑碱基、Atlas 发现的其他转录本，以及背景活性。

这是我们计划用于编辑器选择的比较方式。实验结果将决定候选是否适合继续，还是需要修改。构建之间的比较及修改原因将记录在 [Engineering](/engineering)。

### Scale 04 — 细胞尺度

我们考虑使用 gfaABC1D 启动子和 microRNA response elements（MREs），降低编辑器在非目标细胞环境中的表达。设计稿还讨论了 ASO synthetic tag 和 Cre-loxP 作为进一步控制的选项。

每个模块都需要同时检查预期响应，以及编辑器应当不活跃时的表达。背景表达、切换表现和活性下降所需的时间，同样影响控制效果。这些模块还需要实验评价，才能判断是否可以作为可靠的保护措施。

## III. Detect｜检测

### Scale 05 — 测量尺度

SONAR 是我们提出的 RNA 编辑报告体系。验证计划包括对照条件、DNA 和真实编辑梯度、Western blotting 及 Sanger sequencing，用于确认何时可以把报告信号归因于编辑，以及背景怎样影响读出。

荧光升高可能有多种解释。评价编辑器之前，需要将信号与对照比较，并核对分子变化。AAV 递送同样如此：独立的报告载体测量的是递送和报告蛋白表达；ORCA 编辑需要用携带 ORCA 的载体及相应测量来评价。对照定义和校准结果将放在 [Measurement](/measurement)。

### Scale 06 — 功能尺度

功能验证计划包括 Aβ 摄取和清除、上清 Aβ ELISA，以及 BODIPY 脂质表型。AAV9 实验还计划检查细胞存活情况。这些检测可以与编辑结果一起观察，发现可能出现的异常变化。

结果需要结合所用细胞模型和实验条件解释。它们可以帮助选择下一步实验；长期耐受性和整体动物中的效应则需要另外的研究。完成的检测及其对照将记录在 [Results](/results)。

## IV. Decide｜决策

### Scale 07 — 治疗尺度

我们已经使用质粒转染研究 ORCA 表达、编辑和调控模块，这些初始问题可以在不生产病毒颗粒的情况下研究。AAV9 计划针对另一个问题：病毒递送能否在所选细胞模型中支持 ORCA 功能。

团队的 [rAAV9 Check-In](https://teams.igem.org/6085/safety/safety-check-in-form/cebd1639-2deb-42da-a5ba-c0fb82806114)覆盖拟在 HEK293T 中生产、并在 HEK293T 和 CCF-STTG1 中评价的方案。ORCA 和报告载体分开制备，拟议体系不使用活的辅助病毒。提交内容写明包装当时尚未开始，并承诺启动前确认机构授权。2026-10-12 查看时，状态为 Approved；最新实验进度仍需从记录中补入。

这些细胞实验研究的是体外递送和功能。穿越血脑屏障、中枢组织分布、免疫效应及重复给药属于后续研究。payload、生产体系、受体细胞或实验范围发生变化时，也需要重新审查。

RNA 编辑避免了目标基因组上的永久改变，但干预能否立即停止，还取决于编辑器表达和递送的持续性。可逆性的判断需要测量实际持续时间和可控程度。

### Scale 08 — 人与社会尺度

未来治疗需要考虑接受治疗的人，以及支持他们的照护者。治疗频率、监测、费用、停止干预的能力、严重不良事件和长期不确定性都会影响选择。

我们提出 Acceptable Risk and Treatment Burden Study，希望了解不同群体怎样权衡这些因素。研究计划采用中性的情境描述，并在数据收集前核对知情同意、隐私、参与可及性和机构要求。当前 Human Practices 工作包括访谈与意见收集；这项拟议研究尚未产生结果。

反馈可以帮助决定优先改进哪些特征，例如监测或表达控制。实际造成的修改需要通过具体案例在 [Human Practices](/human-practices) 说明，参与可及性则结合 [Inclusivity](/inclusivity) 考虑。

## V. Security Across the Same Scales｜同一尺度上的安保

实验室访问控制和材料追踪用于减少未经授权使用或材料丢失的风险。计算工作还涉及数据处理和结果使用。

[软件文档](/software)要求保留输出的配置与来源，区分模拟、候选排序和实验发现。用于项目决定的分析及 AI 辅助材料需要队员和监督人员审核。公开发布中必须排除凭据、个人数据及第三方保密信息。

我们还计划审查工具的实际能力、可预见的有害使用和数据流，包括存储内容及是否传输至其他服务。这项审查尚未完成，需要针对具体风险开展；将工具用于其他研究靶标本身不等于误用。模型和 Atlas 用于支持研究，不能据此确定临床剂量或患者安全。

## VI. General Lab Safety｜实验室通用安全

当前 ORCA 项目限于体外研究。分子生物学工作使用 *E. coli* DH5α 和 Stbl3；细胞实验使用 HEK293T、U251MG、SH-SY5Y 和 CCF-STTG1 等已建立的人源细胞系。重组 AAV9 列入递送研究计划。我们不开展动物实验，不向人体或动物给药，不采集原代人体生物样本，也不向环境释放工程材料。早期考虑的 iPSC 来源星形胶质细胞方案已经取消。具体范围见团队的 [Project Safety Form](https://teams.igem.org/6085/safety/safety-project-form/5acc4aa8-798e-4a11-bc2b-fc7832f6116d)。

### 实验空间与人员监督

质粒构建、PCR、克隆和电泳在南方科技大学的 BSL-1 实验室进行。哺乳动物细胞培养和拟开展的 AAV9 工作使用共享 BSL-2 设施，细胞及含载体材料的开放操作使用经过认证的 Class II 生物安全柜。使用后清理安全柜，并对工作区域去污。

队员在开始实验前完成机构安全培训，并接受项目专项指导，内容包括实验室准入、安全设备、微生物操作、消毒、样本运输、应急处理、化学安全和生物安保。PI、研究助理、博士生导师及实验室管理顾问监督实验。遇到未知危害时，我们向负责人员报告，必要时暂停相关工作并寻求指导。

### 材料、化学试剂与废弃物

主要实验室风险包括意外接触重组材料、化学试剂造成的伤害，以及泄漏或不当处置导致的释放。相应管理措施如下。

| 工作或材料 | 主要风险 | 管理方式 |
|---|---|---|
| 哺乳动物细胞与重组生物材料 | 泼溅、泄漏或污染造成的暴露 | 合适的防护空间、生物安全柜、个人防护和访问控制 |
| 拟开展的 rAAV9 生产与操作 | 接触含载体材料及非预期转导 | BSL-2 设施、受训人员监督、清楚标识制备物并遵循机构规程 |
| TRIzol、氯仿等危险试剂 | 使用或处置中的化学暴露 | 核对安全数据表，使用适当防护，并按要求在通风橱操作 |
| 乙醇、异丙醇、甲醇 | 易燃性与化学暴露 | 遵循机构储存、操作及处置要求 |
| 生物废弃物、化学废液与锐器 | 处置中的伤害或释放 | 分类收集至指定容器，分别处置 |

我们也执行材料清点、访问控制、事故报告，以及单人或非工作时间作业规则。ORCA 内部拟议的生物控制是这些实验室防护的补充。

## VII. ORCA Safety Decision Gate｜安全决策门

进入下一项实验前，需要检查目标活性能否可靠解释、非预期效应是否得到足够检查、相关控制是否有效，以及拟议活动是否完成所需审查。我们提出用 GO、REDESIGN、MORE EVIDENCE REQUIRED 或 STOP 记录决定，同时保留理由和依据。各检测的验收标准仍需与监督人员商定。

## 来源

上述实验范围和实验室安排依据团队安全表单。2026-10-12 查看时，Project Safety Form 为 Final Submitted，仍有一个开放审查线程；rAAV9 Check-In 为 Approved。

- [SUSTech Project Safety Form](https://teams.igem.org/6085/safety/safety-project-form/5acc4aa8-798e-4a11-bc2b-fc7832f6116d)
- [SUSTech rAAV9 Check-In](https://teams.igem.org/6085/safety/safety-check-in-form/cebd1639-2deb-42da-a5ba-c0fb82806114)
- [iGEM Safety Policies](https://responsibility.igem.org/safety-policies)
- [iGEM Human Subjects Research Policy](https://responsibility.igem.org/safety-policies/human-subjects)
- Check-In 引用的 [UCSD AAV 指导](https://blink.ucsd.edu/safety/research-lab/biosafety/containment/adeno-bsl.html)与 [Addgene biosafety](https://www.addgene.org/biosafety/)。实际操作遵循适用的南科大要求。
