# ORCA Home 文案讨论稿

日期：2026-10-11。修订：依据用户关于去掉口号式短句、减少动画与文字重复、斟酌单句与段落的反馈更新。用途：按当前实际首页整理内容策划和英文初稿，供团队逐区块讨论。本文件不接入网页，不代表科学结论已获团队审核。

## 1. 已确认的范围与项目表述

- 团队：南方科技大学 **SUSTech-BIO 2026 iGEM**。
- 当前项目：**ORCA — On-target RNA Correction of APOE4 for Alzheimer's Disease**。现有首页和部分说明仍使用缺少 “of APOE4” 的旧短版，后续应统一。
- 用户已明确：**REWIRE 是 PI 之前的项目；本队当前项目叫 ORCA**。不再把 REWIRE 当作 ORCA 的现名、当前编辑器名或待确认命名。历史仓库/路径若用于溯源，可保留字面名称；其中哪些方法、代码或构建被本项目沿用，仍须在 Attributions 和方法页具体交代。
- 设计目标：对 rs429358 对应 RNA 位点进行 C→U，将 CGC→UGC，使成熟 APOE 蛋白的 Arg112→Cys112，探索 APOE4→APOE3-like RNA 重编码。不是 APOE2 转换，也不是永久改写基因组。
- POD：PUF On-target Docking，承担可编程 RNA 识别；CETUS：Cytidine Editing, Tethered for Uridine Switching，承担 APOBEC 衍生脱氨酶编辑。首页短文只说明功能，完整缩写展开、构建关系及设计图放 Description/Parts。
- 最新七条研究任务线优先于历史页面和旧备忘。任务划分不等于各任务都已经完成。

## 2. 当前实际首页与内容来源

以当前工作区文件为准，未改动网页、样式、动画、导航、发布配置或现有未提交修改。

| 来源 | 当前作用 | 对文案策划的影响 |
|---|---|---|
| `app.py` | `/` 和 `/next` 都渲染 `wiki/pages/home.html`；`/next-crayon` 单独渲染另一模板 | 本稿只规划默认 Home，不能把 `home_next.html` 当作当前 `/next` 内容来源 |
| `wiki/pages/home.html` | 11 个动画叙事文字区块，之后是 Explore the project 导航区；文案直接写在模板中 | 默认 Home 的文字不从某个 Markdown 正文读取 |
| `static/onetake/onetake.js` | 脑内迷宫→脑→星形胶质细胞→RNA→蛋白/负担示意→编辑环与 C→U→回到脑 | 文案必须贴合已有镜头，不把尾部平静画面解释成已证明疾病逆转 |
| `static/onetake/onetake.css` | 左/右/下方叠字；正文最大约 48ch；三项统计；静态阅读降级 | 除项目名和导航外，不设逐屏叙事标题；正文仅在背景风险、编辑目标、验证问题三个位置出现；对象与机制信息优先通过图内标注表达 |
| `wiki/layout.html`、`wiki/menu.html`、`wiki/footer.html` | 全站壳、鲸鱼/RNA 导航、页脚；共享白洞切页效果 | 顶部品牌、元描述和页脚也应统一 ORCA 名称；切页效果不提供额外科学文案区块 |
| `wiki_content.py` | 五组导航：Team、Project、Wet Lab、Dry Lab、Human Practices；详细页路由与 Markdown 映射 | 使用既有详细页，不虚构 `/fundamental`、`/puFFER` 等新路由 |
| `docs/project/*.md`、`docs/wet-lab/*.md` | Description、Engineering、Results、Experiments、Measurement 等多为 pending 的内容骨架 | 有路由不等于已有完整研究内容；首页链接的承诺应与内页同步 |
| `wiki/pages/model.html` 及 `wiki/components/model/module1.html`、`module2.html` | 已有 RNA-seq 计算分析、PUF 设计与实验比较材料；Module 3/4 待补 | 不能笼统写“没有任何实验/分析”；也不能把现有材料直接升级为 ORCA 功能恢复证据 |
| `docs/dry-lab/software.md`、`wiki/pages/software.html` | 当前仍介绍 Brain Delivery Model 与 PUF-OffTarget Atlas | 不足以确认最新 PUFFER 的完整实现状态；后续 Software 内页需要按当前项目更新 |
| `docs/ORCA_HOMEPAGE.md`、`docs/BRAIN_JOURNEY.md`、`wiki/components/home_content.html` | 描述/实现了早期插画或六章节首页 | 可了解历史意图，不能据此断言默认首页仍有六个编辑章节 |

未发现当前工作区或检索到的父目录中的适用 `AGENTS.md`。已阅读 README、CLAUDE、CONTENT_GUIDE、docs/README 和 `.claude/RESPONSIBLE_AI_USE.md`。本稿遵循“不得编造数据、结果或引用；发布前由团队审核”的要求；当前仅制作讨论稿，无提交或发布。

布局约束：正式全称比现有副标题更长，而现有 Hero 副标题设有 `white-space: nowrap`。后续落地时需要检查换行和小屏显示，本稿只依据源代码控制长度，没有宣称已完成浏览器排版验证。

## 3. 当前方向：继续减少首页文字层级

用户进一步确认：图片应传递更多信息，首页不需要那么多文字层级；部分短句标题既无必要，也显得像AI文案。上一版虽然删去了口号，仍为不少镜头安排了“标签＋句子”或“两句段落”，正文分布仍然过密。以下方案进一步删减，并替代上一版。

保留当前动画顺序，不重做布局。除项目名和导航外，取消逐屏的叙事标题，也不默认给每个镜头配正文。整段动画暂只保留三个主要说明位置：**APOE4与疾病风险、ORCA的编辑目标、功能验证问题**。这些说明直接写完整句子，不再搭配小标题、导语或重复解释。

脑→细胞→RNA的推近过程无正文。星形胶质细胞、RNA、编辑器模块和蛋白差异通过对应对象旁的标注传达。Astrocyte、APOE RNA、POD、CETUS等标注用于识别图中的对象，与段落标题不同；不重复放进另一组独立大标题。

机制信息优先由图表达：

- 目标位点旁显示APOE4的CGC与APOE3的UGC，并对应成熟蛋白Arg112与Cys112。
- POD与其RNA识别位置对应，CETUS与C→U编辑位置对应；读者通过图中的位置、连线和必要标注理解模块分工。
- 不另用文字讲述镜头正在如何移动，或重复描述已经标明的C→U变化。

这是图像与文案的策划分工，不表示现有粒子动画已经能表达全部机制。当前画面主要突出C/U字母，尚不能仅凭它读出完整密码子、蛋白位点和模块身份。后续若采用图内标注，需逐项核对；如果图仍无法表达关键关系，则在同一说明位置补一句必要解释，而非另增加标题和正文层级。本次不绘制图片、不修改动画或网页。

文献身份、统计范围和研究意图不能由装饰画面自动传达，仍须保留准确的图注、数字说明或句子。它们跟随对应信息出现，不成为新的宣传标题。七条实验/软件任务线进入详细页，首页不逐项罗列。

## 4. 逐区块删减表

表中的“主要说明”只有三个位置；其余为项目识别、图内标注、来源说明、数据说明或导航。“图内标注”是后续内容配合方案，并非本次已实现的图像变化。时间区间来自现有模板，经加权映射，**不是页面滚动百分比**。

| 现有区块/场景 | 保留哪些文字 | 删去哪些文字及处理理由 | 必须保留的信息/详细页 |
|---|---|---|---|
| 00 Hero；-1–-0.13 | ORCA；On-target RNA Correction of APOE4 for Alzheimer's Disease；现有滚动提示可保留 | 不加介绍段、标语或副标语。疾病主题已包含在正式全称中 | 用户确认正式名称；团队署名沿用现有品牌/页脚位置。全称的小屏换行仍须检查 |
| 01 迷宫/开场；-0.10–0 | 不增加叙事文字 | 删除Familiar places、When the familiar feels unfamiliar，以及上一版的find the way home句子。迷宫画面承担感受表达，Hero已点明疾病，不再加一层煽情解释 | 不将情境动画当患者真实经历或引语；疾病背景详见`/description` |
| 02 脑；0.11–0.20 | 无叙事文字 | 删除Inside the brain及镜头路径说明，保留纯视觉过渡 | 静态阅读模式省略无文字转场，不留空白屏 |
| 03 星形胶质细胞；0.235–0.335 | 对应对象旁标注Astrocyte | 删除Meet the astrocyte和ORCA focuses…正文；研究对象身份用标签说明，细胞选择理由进入内页 | 细胞模型来源、基因型与选择依据→`/description`、`/experiments` |
| 04 RNA；0.395–0.485 | 对应RNA旁标注APOE RNA | 删除The APOE message和This RNA encodes…正文；与后续蛋白位点的关系由图内对应标注解释 | APOE一般功能与引用→`/description`。标注不是独立标题 |
| 05 位点C；0.52–0.605 | 图内对应标注：APOE4: CGC / Arg112；APOE3: UGC / Cys112 | 删除One base. A different codon.及上一版两句解释；通过碱基与氨基酸的对应关系呈现区别。只有图无法读懂时才补一句说明 | 用户确认的CGC→UGC、成熟蛋白Arg112→Cys112；编号体系与rs429358→`/description`、`/parts`。[ClinVar](https://www.ncbi.nlm.nih.gov/clinvar/RCV000019448/)记录的是c.388T>C/p.Cys130Arg，不能混用编号 |
| 06 负担示意；0.62–0.672 | 必要的文献图注：Published human cell studies found lower amyloid-β uptake in APOE4 astrocytes than in APOE3 astrocytes. 配来源 | 删除Amyloid can build up、APOE4 changes cell behavior等标题。文献观察只作为对应图注，不再配一段机制解说。当前粒子画面不能代替真实细胞对照结果 | [Lin et al., 2018](https://pubmed.ncbi.nlm.nih.gov/29861287/)；不是本队实测，uptake不直接等于clearance/degradation。背景→`/description`，本队证据→`/results` |
| 07 风险；0.689–0.731 | **主要说明1**：APOE4 increases Alzheimer's risk, but carrying it does not mean a person will develop the disease. | 删除Higher risk. Many factors.等标题；一句话同时表达风险和非必然性，不拆成两层 | [NIA genetics fact sheet](https://www.nia.nih.gov/health/alzheimers-causes-and-risk-factors/alzheimers-disease-genetics-fact-sheet)。分层风险与人群差异→`/description` |
| 08 统计；0.747–0.808 | 数字及说明：57 million — People living with dementia worldwide in 2021.<br>60–70% — Estimated share of dementia cases attributable to Alzheimer's disease.<br>Nearly 10 million — New dementia cases worldwide each year. | 删除Dementia affects millions标题；数字已传达规模，说明只用于准确界定范围和年份 | [WHO](https://www.who.int/news-room/fact-sheets/detail/dementia)。57 million不是2026年AD患者数；计数器“+”须后续核对 |
| 09 编辑环、C→U；0.825–0.905 | **主要说明2**：We aim to change APOE4 RNA to an APOE3-like sequence without altering genomic DNA.<br>POD、CETUS及其作用位置用图内标注 | 删除Recognize. Edit. Recode.、Targeting one letter in RNA.及上一版的模块解释段。图解释如何识别与编辑，句子只交代设计目标 | 是研究目标，不代表已验证精准、无脱靶编辑。标注不能编造未确认架构；具体POD/CETUS构建→`/description`、`/parts` |
| 10 返回脑；0.935–2 | **主要说明3**：We want to know whether this RNA edit changes how astrocytes take up amyloid-β. | 删除From editing to evidence及控制、测量、递送的罗列；以具体待回答的问题收尾，保持画面空间 | 脂质表型、编辑特异性、控制、SONAR测量、AAV9递送等→`/engineering`、`/experiments`、`/results`。平静画面不能被表述为功能已经恢复 |
| 11 项目入口 | 保留必要导航：Explore the project；Team / Project / Wet Lab / Dry Lab / Human Practices及链接名 | 不加总结段、宣传标题或七个新模块卡片 | 使用现有详细页。Results待补齐；PUFFER入口与Software内页同步 |

这三个主要说明的位置仍可在后续逐帧讨论中合并或调整，不要求每个位置都出现一整段文字。现在的讨论重点是图能否承载身份和机制信息，以及留下的句子是否提供了图片无法表达的事实或研究意图。

## 5. 五组项目入口：用既有卡片承接研究分工

首页可以保留常规短标签；下列清晰标签仅作为 Home 卡片的讨论选项，不要求同步改变全站菜单。七条研究线不等于七个新网页。

| 现有组 | 可讨论的英文入口标签 → 路由 | 读者进入后应该看到 | 当前就绪情况 |
|---|---|---|---|
| Team | **Our team** → `/team`；**Attributions** → `/attributions` | 团队角色、合作和来源贡献；REWIRE 作为 PI 既往工作时应准确归属 | 需团队完成/复核人员与贡献内容 |
| Project | **Project description** → `/description`；**Engineering cycles** → `/engineering`；**Our contribution** → `/contribution`；**Parts and constructs** → `/parts` | 为什么 APOE4；POD/CETUS 架构；Fundamental/Edit/Control/Deliver 的 DBTL；可复用贡献和构建记录 | 多为 pending 骨架，需填入当前方案与实证 |
| Wet Lab | **Experimental workflow** → `/experiments`；**Results and limitations** → `/results`；**Lab notebook** → `/notebook`；**SONAR measurement** → `/measurement`；**Alternative platform** → `/alternative-platform`；**Safety and security** → `/safety-and-security` | 实验问题、方案、原始记录、定量读出、结果边界和安全实践 | SONAR 名称与用途由最新任务线确认；具体方法、AC/INAC定义、结果和完成状态待确认 |
| Dry Lab | **Computational models** → `/model`；**PUFFER software** → `/software` | PUF 设计、全转录组脱靶、旁编辑、RNA accessibility 与实验数据推荐；模型假设和验证边界 | Model 已有具体分析材料；Software 仍是旧工具介绍。更新内页后再使用 PUFFER 入口标签，不能用首页文字替代软件实现确认 |
| Human Practices | **Human Practices** → `/human-practices`；**Education** → `/education`；**Entrepreneurship** → `/entrepreneurship`；**Inclusivity** → `/inclusivity`；**Sustainability** → `/sustainability` | 真实反馈怎样影响项目选择、传播与责任；活动证据 | 不虚构采访、引语、影响人数或项目采纳情况 |

首页不优先把旧 Brain Delivery Digital Twin 当作整个 ORCA 的核心工程流程，也不把其跨血脑屏障模拟当成 AAV9 细胞感染实证。`/brain-delivery`、`/offtarget-atlas`、`/dry-lab` 路由仍存在；是否作为当前 PUFFER 的子功能或历史独立工具保留，需依据团队实际软件整合情况确定。

## 6. 七条研究线：详细页职责与简短英文概括

此表用于内页策划与首页收尾的概念支撑，**不是新增七屏的要求，也不是完成清单**。所有任务状态暂记为“团队逐项确认”。

| 当前研究线 | 要回答的研究问题 | 英文短句（面向详细页/卡片说明） | 首页保留什么；细节放哪里 |
|---|---|---|---|
| Fundamental | 哪个 PUF repeat 架构值得进入后续工程？编辑器在 APOE/Reporter 上能否工作？ | **Establish an editor architecture and verify its baseline activity.** | 首页不列repeat架构；10R/12R/15–16R、构建、WB、Sanger 与基础编辑表征 → `/engineering`、`/experiments`、`/results` |
| Edit | PUF 和 APOBEC 两支优化怎样改变识别、效率与特异性的平衡？ | **Optimize recognition and catalysis while tracking unintended editing.** | 首页不逐项展开优化与特异性；突变筛选、识别偏好、效率/旁编辑/脱靶比较 → `/engineering`、`/results`；计算支持 → `/model` |
| Control | 何时、何处表达？怎样抑制或关闭？ | **Evaluate where the editor is expressed and how it can be suppressed or switched off.** | 首页不逐项展开控制模块；gfaABC1D、MRE、ASO synthetic tag、Cre-loxP 各自的输入/输出和对照 → `/parts`、`/experiments`、`/results`。不把待验证的特异性当作既定事实 |
| Measure | SONAR 荧光读出是否能可靠反映真实编辑？ | **Calibrate SONAR against defined controls and independently measured editing.** | 首页不逐项罗列measurement；WT、AC、INAC、TMP rescue、DNA梯度、真实编辑梯度、归一化和适用范围 → `/measurement`。AC/INAC 完整定义待团队提供 |
| Deliver | 团队自包装 AAV9 能否完成细胞递送 proof of concept？ | **Build, package and assess AAV9 delivery in cell models.** | 首页不逐项展开delivery；AAV9自包装路线在内页讲清；载体构建、包装、提取、定量、感染与成功标准 → `/experiments`、`/engineering`、`/results`。采用当前自包装线，不沿用历史外包计划 |
| Software | 给定目标 RNA 位点，能否产出可解释、可实验验证的 PUF 推荐设计？ | **Use PUFFER to prioritize PUF designs through transcriptome and RNA-context analysis.** | 首页主要从 Dry Lab 卡片进入；PUF design、全转录组搜索、旁编辑、RNA accessibility、实验数据推荐及功能实现状态 → `/software`、`/model` |
| Functional Validation | 模型内编辑是否伴随 AD 相关细胞功能变化？ | **Test whether RNA recoding changes amyloid-β handling and lipid phenotypes in astrocyte models.** | 首页收尾保留明确研究问题；细胞内编辑、Aβ uptake/clearance、上清 Aβ ELISA、BODIPY、对照/重复/统计 → `/experiments`、`/results` |

## 7. 落地前需要团队确认的内容

| 项目 | 目前可写 | 需要补齐后才能升级的表述 |
|---|---|---|
| 各任务完成状态 | 用具体研究问题或设计意图说明范围，不机械重复framework等抽象词 | 分别列“已完成且审核/已完成待审核/进行中/计划”。不能据最新任务线自动使用 demonstrated、validated、restored |
| 靶点与构建 | rs429358 对应 RNA 位点、CGC→UGC、成熟蛋白112，按用户确认 | Transcript accession、构建编号、RNA位点编号及112/130编号关系；确认 codon158 保持情况和旁编辑检测，不把蛋白112与 RNA C388 混为一种编号 |
| 基础编辑与优化 | 分别验证 PUF 架构、PUF/APOBEC 两支优化 | 编辑效率数值、检测方法、真实原始数据、重复、构建差异、表达/稳定性与靶向性的区分。现有 Model 的 C388 apparent rate 有 endogenous reference T 混入解释限制，不能直接搬为“ORCA校正率” |
| 编辑器命名与来源 | 当前 ORCA；REWIRE 是 PI 之前的项目 | 哪些既往方法、构建或软件被继承；由谁提供，怎样在 Attributions/方法页归属；不将既往结果当作本队今年结果 |
| POD/CETUS | 已确认全称和功能分工 | 实际组件版本、融合/连接方式、作用窗口、是否有获得结果支持的最优构型 |
| SONAR | 双荧光 reporter / measurement system 的研究方向 | WT/AC/INAC 的完整定义；TMP rescue 具体机制与用途；荧光比值是否与编辑率建立校准；DNA剂量不能自动当编辑梯度 |
| 时空控制 | 把各控制模块作为待分别验证的问题 | gfaABC1D 特异表达范围、MRE 抑制对象与幅度、ASO/Cre-loxP 的关闭证据；测量时间窗与对照 |
| AAV9 | 自包装和细胞感染 proof of concept 的任务 | 构建、包装/提取记录、滴度方法、感染条件、细胞表达/编辑结果。细胞感染不等于证明跨血脑屏障或脑内治疗 |
| PUFFER | 用户确认的功能范围与目标 | 每个子功能的 implemented/tested/planned 状态、公开代码/演示、输入输出、数据库版本、实验推荐的验证。不要把预测的结合/脱靶或 accessibility 当实測 |
| 功能表型 | 研究 RNA 重编码与 Aβ handling/脂质表型的关系 | Aβ uptake 与 clearance/degradation 的实验定义分别列出；上清ELISA变化的排他解释、活性/细胞数/吸附对照；BODIPY究竟标记什么。部分编辑不等于功能完全恢复 |
| 统计与背景引用 | WHO的2021年痴呆人数、AD占比、每年新增痴呆；Lin的模型观察；NIA的风险表述 | 团队复核所有来源；astrocyte一般生理功能和APOE脂质运输补齐引用；不得把57 million标成2026年AD患者数 |

## 8. 证据语言的使用规则

| 证据类型 | 建议写法 | 不应偷换成 |
|---|---|---|
| 文献 | **In published human cell models…**；注明研究/模型 | **We demonstrated…** |
| 团队实测 | **We measured… under…**；与数据、方法和对照对应 | 没有证据支持的疾病逆转或临床疗效 |
| RNA-seq计算分析 | **Analysis identified candidate sites…** | 已独立确认的全部生物学脱靶事件或整个构建的纯编辑率 |
| 计算预测/模拟 | **The model predicts… under its stated assumptions.** | 实测结合、实测编辑、真实穿越血脑屏障 |
| 任务/计划 | **We aim to… / We ask whether… / In our design…** | 各模块已完成或临床就绪 |

不建议继续使用旧插画场景里的 **What if we can reverse it? / clearance restored / Healthy neurons** 作为默认首页文案。现用粒子动画尾段颜色与形态变平静，用具体的细胞功能研究问题说明目标，工程验证细节进入内页，避免暗示恢复记忆、治愈AD或神经元已恢复健康。科学边界集中放在相关句子和详细页中，不在每屏附上一段重复的免责声明。

## 9. 本次核对的科学来源

1. [WHO — Dementia](https://www.who.int/news-room/fact-sheets/detail/dementia)。页面日期2026-07-03，查阅2026-10-11。支持痴呆规模、AD占比和日常功能影响；统计年与页面日期不同。
2. [Lin et al. (2018), APOE4 Causes Widespread Molecular and Cellular Alterations Associated with Alzheimer's Disease Phenotypes in Human iPSC-Derived Brain Cell Types](https://pubmed.ncbi.nlm.nih.gov/29861287/)。DOI：[10.1016/j.neuron.2018.05.008](https://doi.org/10.1016/j.neuron.2018.05.008)。此次核对PubMed摘要与图注；支持其人源iPSC细胞模型中APOE4 astrocyte的Aβ uptake/胆固醇积累观察。不是本队RNA编辑后的功能证据。
3. [NIA — Alzheimer's Disease Genetics Fact Sheet](https://www.nia.nih.gov/health/alzheimers-causes-and-risk-factors/alzheimers-disease-genetics-fact-sheet)。本次检索到官方页面摘录，直接打开返回错误；支持风险、基因型与人群差异及并非全部携带者患病的表述。发布前团队需再次打开核对。
4. [NCBI ClinVar — NM_000041.4(APOE):c.388T>C (p.Cys130Arg)](https://www.ncbi.nlm.nih.gov/clinvar/RCV000019448/)。直接打开核对，支持rs429358与数据库转录本/前体蛋白编号。数据库风险分类不作为首页临床判断依据。

本稿没有选择任何实验效率、最佳突变、AAV9滴度、功能改善幅度或“已完成”结果进入首页。下一轮讨论以本稿第4节为当前版本：优先检查图片能传递的信息，只保留三个主要说明位置及必要标注；不沿用逐屏标题、标签加正文的固定结构。

## 10. 后续首页文字调整：APOE4 的重要性

用户要求将风险说明位置的重点改为疾病涉及多条病理通路，以及 APOE4 对多条通路的影响。删除原来以“携带不一定患病”为重点的句子。

首页与 `/next` 的共用叙事文案改为：

> Alzheimer’s disease involves multiple interacting pathways. APOE4 influences several of them, including lipid metabolism, amyloid-β handling and inflammation.

使用 amyloid-β handling 概括相关通路，具体细胞模型观察仍在其他说明中写作 uptake，避免把摄入与降解混为同一种实测结果。机制依据参见上述 Lin et al. (2018)：在人源神经元、astrocyte 与 microglia-like 细胞中观察到不同的脂质代谢、Aβ 摄入/分泌与免疫相关表型。此处用于介绍靶点的生物学关联。
