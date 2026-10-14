# Safety & Security 初稿审校记录

日期：2026-10-12（Asia/Shanghai）。本文为团队内部审校文件，不接入 Wiki 页面。

## 文本与来源

- 原始材料：用户指定文件夹中的 `ORCA_Safety_and_Security_Bilingual_Full_Draft.md`，846 行；原稿未修改。
- 原稿 SHA-256：`0b6acf5aefba8402fd985da746f521f9e10b0be17db2ae3288ad152fc2c2836a`。
- 英文页面来源：`docs/wet-lab/safety-and-security.md`，对应 `/safety-and-security`。
- 中文审阅稿：`docs/reviews/safety-and-security.zh.md`，供队内审核，未作为另一语言页面接入。
- 按用户授权登录后，通过页面只读查看 SUSTech #6085 Project Safety Form、Activity，以及关联的 rAAV9 Check-In 和 Activity。未修改、提交或回复任何表单。
- 原稿内 Munich 对照评论、写作建议和待补任务作为编辑材料处理，不作为用户指令，也不作为科学或团队事实的证据。未声称对 Munich 页面完成了事实核验。

## 本轮主要判断

保留 Anticipate → Constrain → Detect → Decide 与八个尺度；每个尺度围绕风险、控制、证据边界和下一步展开。压缩重复的安全哲学和中英混排；将通用实验室安全前移，让读者先看到实际项目边界。页面采用英文，中文审阅稿保留在仓库。

初稿的重要问题是混用了不同证据状态：已实现工具、计划实验、拟议控制模块和未来治疗讨论。正文分别标注，去掉面向作者的“这一节应该……”、Munich 对照评论、副标题备选库和材料征集清单。

“RNA 编辑不改基因组”不应推导成治疗可即时停止或已证明可逆。递送持续性、表达时长和额外控制架构需单独核实。Cre-loxP 的具体作用不能在没有构建设计时猜测。

将生物安保、数据治理、错误解读及研究伦理的关系写清楚。非治疗研究用途本身不等同恶意双用途；文档 guardrails 也不等同实际技术强制执行。没有把拟议问卷写成已完成或已改变项目设计。

## 表单核对结果

[Project Safety Form](https://teams.igem.org/6085/safety/safety-project-form/5acc4aa8-798e-4a11-bc2b-fc7832f6116d)，列表最后更新时间 2026-10-07；2026-10-12 查看时 Final 为 Submitted，早期反馈为 Feedback Available (superseded)，Activity 显示 1 open、0 resolved。未看到最终 Approved，不能写“全部安全审批完成”。

| Wiki 所用事实 | 表单位置 | 解释边界 |
|---|---|---|
| BSL-1 分子克隆；共享 BSL-2 细胞/AAV 设施；认证 Class II BSC | Q5 与 Q26–27 | 表单陈述；未独立核验设施证书 |
| DH5α、Stbl3；HEK293T、U251MG、SH-SY5Y、CCF-STTG1；AAV9 | Q7 | 列入项目范围，不能由名单推断每项实验已完成 |
| 无动物、人体给药、原代人体样本、临床测试及环境释放 | Q12、Q26–28 | 当前范围；未来用途另作讨论 |
| iPSC-derived astrocytes 方案取消 | Q28 | 不再把该细胞写入现行实验；不猜测取消原因 |
| 完成机构安全培训及项目指导 | Q24、Q26 | 可写已完成培训；日期、证书、课程名称仍需补证 |
| 物理和数据访问、材料清点、事故报告、单人/非工作时间规则 | Q25 | 报告采取这些措施，不推断实际系统实现细节 |
| 化学试剂与分流废弃物处置 | Q13、Q15、Q27 | 不发明消毒浓度、灭菌参数或应急细节 |
| HP 是访谈与意见/引语收集，声明无需正式审批 | Q4、Q12、Q28 | 不推断任何新增偏好研究都免审，也不声称已完成知情同意记录核验 |
| gfaABC1D、MRE 用于拟议表达调控 | Q6、Q12 | 不足以确认构建、测试或验证完成 |

[rAAV9 Check-In](https://teams.igem.org/6085/safety/safety-check-in-form/cebd1639-2deb-42da-a5ba-c0fb82806114)，列表创建日 2026-09-11、更新日 2026-09-16；查看时状态 Approved，Activity 亦显示审核结果 Approved。不能把更新日直接当作批准日期。

- 覆盖拟在 HEK293T 生产，并在 HEK293T 和 CCF-STTG1 体外评估的 rAAV9；ORCA 与报告载体分开；不使用 live helper virus。
- 提交内容明确 AAV9 packaging has not yet started。之后是否启动/完成需 notebook，不以批准状态推断实验完成。
- 包装前确认机构授权和适用规程。iGEM Approved 不替代机构批准。
- 报告载体仅用于递送和表达，不能用于 ORCA 特异性、疗效、安全结论；体外实验不证明 BBB crossing 或 in vivo CNS delivery。
- gfaABC1D/MRE 是待实验评估的补充生物控制，不替代物理 containment。
- 表单明确质粒转染可回答初始表达/编辑/调控问题；外部载体生产是可考虑的风险较低替代路径。正文保留此具体安全取舍，不虚构“模型已经淘汰某个编辑器”的案例。
- 实验范围、payload、production system、recipient cells 等实质变化需重新评估。

## 发布前优先补齐

| 优先级 | 需要的证据 | 能解锁的正文结论 |
|---|---|---|
| P0 | 负责队员姓名和审校日期；核对最新 safety 表单与开放反馈状态 | 正式发布、总体合规状态 |
| P0 | 四条细胞系供应商病原体检测/认证记录 | 回应 7 月反馈中细胞系来源与安全问题；不能凭 established cell line 推断合格 |
| P0 | AAV9 启动/完成记录、机构覆盖授权和现行 SOP | 当前实验状态与机构许可；不只是 iGEM 批准 |
| P0 | 安全培训记录、机构规程引用、实际废弃物/事故流程 | 可核验的实验室安全证据 |
| P1 | gfaABC1D、MRE、ASO tag、Cre-loxP 的最终构建设计及 designed/built/tested/validated 状态 | 哪些 safeguard 存在、哪些已有数据支持 |
| P1 | PUF/APOBEC 候选、on-target/bystander/mismatch/background 比较，重复与分析标准 | 实际 activity–specificity 取舍；候选降级/停止案例 |
| P1 | SONAR WT/AC/INAC/TMP 的定义与实验记录；gradient、背景、动态范围及分子验证 | 测量可靠性，不能仅凭荧光认定编辑 |
| P1 | 最终 ORCA motif run 和 shortlist；所选候选的实验验证 | 项目特异性 off-target 证据，而非通用工具示例 |
| P1 | 细胞功能/viability 原始记录、模型、对照、异常结果 | 特定细胞条件的功能证据与局限 |
| P1 | 一例模型影响实际实验选择的可追踪记录 | 闭合 dry-to-wet loop，避免仅宣称 integration |
| P2 | Responsible Release & Misuse Assessment：真实能力、data flow、存储/外传、controls、gap、release decision | 完成的软件安保评估，而非只有文档规则 |
| P2 | 若开展偏好研究：伦理路径、同意、情境、参与者、分析和结果 | stakeholder 证据改变具体技术要求 |
| P2 | Supervisor-approved assay acceptance criteria、具体 GO/REDESIGN/STOP 案例 | 实际使用的决策门，而非仅拟议框架 |

Q14 AI 回答以及部分长字段在页面可访问文本中末尾被截断；本轮仅使用读到的完整事实。最终审校应检查表单原字段完整性，不能把 UI 摘要当作完整导出。7 月开放反馈要求细胞系病原体认证、病毒 Check-In、BSC 管理、HP 范围及化学危害核对；本轮未向审核人回复，亦未把未关闭线程判定为当前违规。

## 软件证据与外部指导

Atlas 的仓库归档 `static/evidence/puf-atlas-example/run_metadata.json`：示例组织为 Liver，不是最终 ORCA 脑组织特异性验证。Brain Delivery 的 `static/evidence/brain-delivery-v4-summary.md` 明确 leading ProAPOBEC 是 hypothetical candidate，两个倍率为占位。已核对页面与归档的一致性；未重新运行上游研究软件。

2026-10-12 查询了官方 [iGEM Safety Policies](https://responsibility.igem.org/safety-policies)、[Human Practices 说明](https://responsibility.igem.org/human-practices/what-is-human-practices)、[Safety and Security 评审问题](https://competition.igem.org/judging/special-prizes)，以及 Check-In 引用的 [UCSD AAV guidance](https://blink.ucsd.edu/safety/research-lab/biosafety/containment/adeno-bsl.html) 和 [Addgene biosafety](https://www.addgene.org/biosafety/)。Human Subjects Policy 的准确链接由账号页面获得：`https://responsibility.igem.org/safety-policies/human-subjects`；该页面需 JavaScript，本轮未核验全部政策正文。

评审问题强调安全/安保贡献、具体项目风险管理及现实用途。四阶段框架的价值取决于可追踪的实证与决策，不取决于章节数量。

## 接入与检查

只修改 Safety Markdown，新增中文审阅稿和本记录；使用已有路由、目录和样式。未编辑共享模板、路由、首页或公共脚本；未重新生成共享 `public/`，未修改原稿及本地恢复备份。既有未提交变化保持原状。

验证结果：

- 现有 Python 检查 63 项全部通过。
- Safety 路由返回 200；20 个目录锚点均存在且唯一，内部页面及证据链接返回 200。
- 临时目录中 Frozen-Flask 全站构建及 `audit_build` 通过；未覆盖共享 `public/`。
- 最终文字微调后再次核对页面：3 张表、单一页面标题、20 个目录锚点；许可和仓库链接检查通过，无原稿对照评论或待作者填写指令泄漏。
- `git diff --check` 通过；原稿 SHA-256 与读取时一致。
- 本任务的本机预览：`http://127.0.0.1:8797/safety-and-security`；已请求在 Codex 打开。未完成浏览器桌面/手机视觉验收，不能将解析及构建检查等同于视觉验收。

应用内浏览器因依赖组件的系统签名问题未能连接；表单通过用户完成登录后的 Chrome 只读核对。没有保存凭据、完整账号页面截图或个人联系方式。

本轮实际交付为上列三个 Markdown 文件。Safety 正文已接入现有本地页面，中文稿仅供团队审阅；未提交、推送或正式发布。结束时观察到其他任务新增 `docs/research/`、reading-orbit 计划及预览目录等，不属于本轮改动；未观察到 Safety 正文重叠修改。检查通过只代表检查时的组合状态，不能保证后续并发写入安全。

## 第二轮：按用户反馈重写语气

用户指出第一版“太 AI”。英文和中文重新组织为团队叙述，直接解释靶向、测量、表达和递送中的具体问题。保留四个阶段及其对应技术内容，移除机械的尺度编号、开头框架表、独立决策门表和结尾口号。减少逐节重复的审校提醒，未完成的工作采用计划语气；详细材料任务仍集中在本文件。

英文由约 2,500 词缩至 1,851 词。没有新增实验结果、访谈引语或审批结论，来源仍为第一轮核对的文件和表单，本轮未重新访问账号。AAV9 批准、提交时尚未开始包装及当前进度需实验记录确认的区别仍保留。

写入前核对两份正文的实时哈希；无并发变化。上一版另存于 `.local-backups/safety-prose-20261012-g9y8vvmu/`，未覆盖此前备份。修改文件仍为英文正文、中文稿和本审校记录，未触及共享模板或路由。

新版页面、19 个目录锚点、内部链接及许可/仓库链接检查通过；现有 Markdown 与 Wiki 路由检查通过，`git diff --check` 通过。本轮没有重跑全站冻结构建或浏览器视觉验收；上面的 20 锚点、3 张表及全站构建记录对应第一版，新版只有一张实验室危害表。

## 第三轮：恢复 Safety Across Scales 主线

用户指出原稿以 Safety Across Scales 组织。第二轮把尺度标题当作应删的机械编号，削弱了原稿结构，本轮纠正这一改动。

恢复页面的 Safety Across Scales 标题与八个尺度名称；Anticipate 对应序列/系统，Constrain 对应编辑器/细胞，Detect 对应测量/功能，Decide 对应治疗/人与社会。安保、通用实验室安全及安全决策门按原稿顺序放在其后。开头说明尺度之间的推进关系，正文继续采用第二轮精简后的措辞，未恢复重复审校提示。

只修改英文正文、中文稿及本记录。第二轮正文备份在 `.local-backups/safety-scales-20261012-l2o17g5f/`；原稿和此前备份保留。八个尺度顺序及全部 19 个页面锚点检查通过，`git diff --check` 通过；未做部署或浏览器视觉验收。
