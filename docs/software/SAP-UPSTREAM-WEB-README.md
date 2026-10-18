# SAP 原版界面 · 案例引导预览

本包直接复用 `sonar_app/static` 的原版 SAP 页面、样式、导航、图谱、设计引擎和结果模板，不再使用独立设计的展示站。

- Design：保留原版三步设计、可视化选位、修改审核、序列检查与导出。
- Analysis：保留原版 Initialize → Upload controls → Preview Θ → Upload samples → Results，以及门控图、详情、参数和导出。
- Data Sources：保留原版 32 个参考样本、三种群体的详情、参考模型和材料浏览。
- 去掉文件上传窗口；提供 18 步新手教学对话框，逐步说明当前操作。加粗绿色框与呼吸光晕依次指向已有 Load example、确认勾选框、提交、导出、Design → Analysis 导航和结果详情关闭按钮。支持自动定位、Show me、关闭和恢复教学。开启减少动态效果时保持静态描边。

页面右上角标记 Example preview。序列设计仍在浏览器运行原版引擎；流式分析展示已有真实案例的保存结果，不在浏览器重新计算 FCS。固定案例的分析参数只读，避免将保存结果误当作修改参数后的新计算。目录选择不可用；进度保存在当前标签页的会话中。除这些必要的预览状态提示与上传区域调整，原版模板不改写。

案例为原始样本 90B，维护记录中的条件为 75% AC DNA mass；RAS 0.9562602659677871，选中事件 32,207，模型估计 RES 74.54898213131972%。跨批次迁移未验证，RES 不是 RNA 编辑百分比。设计与分析是两个独立案例。公开快照移除了本机绝对路径和仪器序列号；不包含原始 FCS。

## 本地预览

在本目录运行 `python3 -m http.server 8876 --bind 127.0.0.1 --directory public`，打开 `http://127.0.0.1:8876/#design`。

## 独立 GitLab Pages

1. 将本目录内全部内容（含隐藏文件 `.gitlab-ci.yml`）放入独立 Pages 仓库根目录，不是仅上传 ZIP。
2. 默认分支提交触发序列检查、引导逻辑检查、静态文件检查和 Pages 部署。
3. 在项目的 Pages 页面取得实际地址，验证无需登录后，再从 Contribution 链接。

这是独立 Pages 工作流模板，不要覆盖队伍现有 Wiki 的 `.gitlab-ci.yml`。

## 集成到已有官方 Wiki

将 `public/` 内的文件放到 Wiki 现有发布目录的 `sonar/` 子目录，并通过 Wiki 已有构建流程发布。Contribution 链接使用 `sonar/index.html#design` 的实际站点地址。所有静态资源使用相对路径，案例接口在浏览器内解析，不需要 Python 服务器或额外 API。需要先核对现有 Wiki 的构建方式与体积限制；本地生成不等于已经上传或上线。

## 维护

- 原版界面唯一来源为 `program/sonar_app/static/`；不要直接改生成副本。
- 预览适配层源文件位于 `program/web/demo/`。
- 使用原项目 Python 环境执行 `tools/build_web.py`，再运行 `web/scripts/seal_site.py`、检查与 `tools/package_web.py`。
- `public/data/provenance.json` 记录所有原版前端文件及其来源哈希。HTML 仅追加适配脚本和样式；资源路径改为相对路径。
- `site-integrity.json` 覆盖交付文件。ZIP 不包含 `_work`、原始 FCS、Python 环境或本机路径。

网页版和正式桌面程序是两份交付。正式程序下载链接由 Contribution 的独立入口提供，本包不包含安装程序。
