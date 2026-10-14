# 通用页面统一为 Model 阅读版式

2026-10-12，Asia/Shanghai。已接入正式 `wiki/pages/content_page.html`，不限于本目录预览。

## 本任务改动

- `wiki/pages/content_page.html`：紧凑标题、分组目录和阅读面板；保留原有 Engineering DBTL 引用。
- `wiki/components/content_directory.html`：桌面与手机共用的章节目录，独立展开控件及唯一控件 ID。
- `static/content-reading.css`：沿用 Model 的 224px 目录、56px 间距、圆角浅色面板、正文与标题层级；处理平板、手机和打印。
- `static/content-reading.js`：当前章节跟随、子目录展开、手机跳转收起目录，以及宽表格独立滚动。无脚本时保留原生目录链接和完整子目录。
- 本目录：候选模板副本、三个截图及本验收记录。模板副本在接入后与正式模板逐字比较一致；后续维护正式模板，勿用此副本覆盖实时文件。

未修改 Markdown 文案、Model 页、首页、全局导航、全局脚本及 DBTL 组件。现有科研内容直接渲染，未添加数据或结论。

## 已完成验收

- 现有 Python 检查：64 项通过。
- 所有普通页面渲染成功；正文原始 Markdown 渲染结果完整保留。
- 普通页面无重复 ID，目录锚点与 aria-controls 均有有效目标。
- JavaScript 语法和 git diff 空白检查通过。
- Frozen-Flask 构建与现有资源、内部链接审计通过，构建输出使用任务专属临时目录，未重建共享 `public/`。
- 桌面：Description 外观、Safety 主目录跳转、当前章同步及子目录展开。
- 390×844 手机：16px 正文、无横向页面溢出、目录展开、子章节跳转后收起，以及当前章和子章节同步。System Scale 标题顶部约 204px，固定目录底部 161px，没有遮挡。
- Engineering 手机：DBTL Test 跳转、当前阶段同步、无横向溢出；标题顶部约 280px，DBTL 固定目录底部 242px，没有遮挡。
- 临时浏览器尺寸已恢复。

截图：`description-desktop.png`、`safety-mobile.png`、`engineering-mobile.png`。

## 并发情况

开始时共享锁由 `dementia-redesign-map-ruler` 占用，先完成独立文件和候选模板。锁释放后原子取得本任务锁，重读正式模板和原有差异，保留 DBTL 接入后局部修改；检查完成后仅释放本任务锁。

浏览器验收期间其他任务切换了共享预览标签与尺寸，受影响的中间观察未作为最终通过依据。后续使用另一个标签和本任务 8776 端口完成记录中的验收。8776 候选预览与正式模板一致，8081 页面也已观察到正式接入。

仓库仍有其他任务持续修改首页、路由与检查文件。本记录对应实际验证时的本地状态，不能保证后续并发改动不会改变结果。未提交或推送。
