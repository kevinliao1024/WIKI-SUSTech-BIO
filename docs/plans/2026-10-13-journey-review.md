# /next-journey 实现与验收

交付目录：当前 Wiki 仓库；独立本地预览端口 8786。没有提升到 `/`，也没有替换 `/next` 或 `/next-crayon`。

## S0：先读代码得到的结论

1. `onetake-crayon.js` 通过 MutationObserver 观察根节点的 `--ot-p`，实际上是 DOM 图形叠层，没有持有 Three.js 场景。要让小人与粒子共享画布和相机，需要场景就绪与帧事件。
2. `createCrtOpening(root)` 在找不到 `data-crt-picture` 时返回 `null`，`boot()` 的 CRT 调用均允许空值。新模板自带 `.ot-stage`、`data-ot-canvas`、暗角和原来的 C/U 占位即可启动。
3. 现有 `KEYS` 从 take `-0.19` 开始，并非 `-1`；负值相机由 `sample()` 和相机样条驱动，`-0.075 → 0.03` 已有迷宫到大脑过渡。旅程独立增加 700vh 阅读距离，把 `-1 → -0.19` 接到原始滚动轨道，原有 KEYS、takeOf、章节时间和人数节奏均保留。
4. Bloom 的阈值是 0.12，GradeShader 还有暗角、色差和颗粒。截图证明降低白色材质照明会过暗，提高照明又有光晕；最终小人使用近白、roughness=1、零自发光材质，在同一个 scene/camera/renderer/canvas 的独立图层于后处理后绘制，排除辉光。每帧由原始帧事件的微任务完成，没有新增 RAF 或时钟；绘制后恢复相机图层和 renderer 状态。

## 叙事与接入

- 首帧已有几何小人、门、桥和路；项目身份标签在现有导航下方。
- 原生按钮跳到站点对应的滚动位置；键盘 Enter 同样有效。点击不创建访问完成状态，也不要求解谜。
- 路径以 CatmullRomCurve3 绘制，弧长表把滚动进度映射为路径参数；起伏、倾斜、道具错位和消退都只依赖进度。
- 门滑开、桥断开错位、路分岔并消退；少量道具点插值到现有 `aMaze` 点的位置。既有粒子随后复用 stage -1 → 0。
- 小人在三站路径结束后沿连续样条汇入迷宫入口，再复用 `createMazeNavigator` 走四格。导航每次从相同起点按进度推进；图结构与原 `mazeShape` 的每条边均有一致性测试。
- 比喻结束节点出现在大脑形成前，`.11` 起隐藏旅程 UI；后续星形胶质细胞、RNA、人数、拖拽和编辑继续由原模块负责。
- 固定入口跳到 `#ot-index-title`；无 WebGL、减少动态和关闭 JS 都有完整静态文字。动态开启减少动态时，也恢复静态站点按钮。
- 新体验文字只是感受式比喻，不新增医学事实、病例引述或疗效结论。

## 复制范围与后续同步风险

`wiki/pages/home_next_journey.html` 是从实时 `home.html` 复制并局部替换开场的页面外壳。以下区块目前是复制件：

- 页面头部的原有动画、人数和探索区资源引用。
- bio labels、SVG 拖拽命中区、POD/CETUS 按钮、放置提示和编辑跳过按钮。
- `data-in >= .11` 的全部章节文字、`data-in` / `data-out` 与组件引用。

人数和探索区内容本身通过原 `dementia_burden.html` / `explore_slides.html` include 共享；菜单和页脚也继续共享。Flask 测试逐字比较 `.11` 起到 `</main>` 的章节，能发现后续公共叙事更新导致的模板漂移。后续编辑首页公共章节时，应同时检查这份副本，并继续保留 `/next` 的结构预览隔离。

## 本任务实际文件

共享小补丁：`app.py`（新路由六行）、`static/onetake/onetake.js`（两行事件）、`tests/test_wiki.py`（路由与章节一致性检查）。

新增：`wiki/pages/home_next_journey.html`、`wiki/components/journey_opening.html`、`static/onetake/onetake-journey.js`、`static/onetake/onetake-journey.css`、`static/onetake/journey-path.mjs`、`tests/journey_path.mjs`、`tests/journey_browser.mjs`、本说明，以及项目内验收截图。

## 协作记录

开始时有多人预先存在的改动；没有清理或回退这些改动，也没有动当前备份或共享 `public/`。人数展示聊天无法认领遗留锁后，用户明确确认锁已停用并授权移走；旧锁保留在 `.local-task-locks/retired-dementia-redesign-map-ruler-journey-20261012/`，本任务原子取得新锁、重读实时共享文件、做小补丁并完成检查后已释放自己的锁。

继续验收时，新锁由 `nav-label-height-alignment` 持有，属于其他任务；本任务没有修改它保护的菜单或共享样式。完成核对时该锁已经由持有者释放，菜单及样式出现了它自己的新改动。页面沿用实时共享导航，因此导航后续变化可能影响布局，需要诚实区分本任务验收时的观察与未来并发状态。

核对期间另有任务新增了 `docs/plans/2026-10-12-journey-implementation.md`；本任务只读取并保留它，未将其中的完成声明当作验证证据。本说明对应实际运行的检查：人数组件仍位于原 `.747–.784` 章节，并未删除。

## 验证记录

- Python 64 项检查通过，包含新路由、原生画布、无 CRT 和后续章节逐字一致性。
- `node tests/journey_path.mjs` 通过：弧长反算、滚动站点往返、错位还原、道路分岔消退、迷宫全部边与路径一致。
- 现有 `maze_navigation.mjs`、`brain_correspondence.mjs`、`home_edit_replay.mjs` 通过。
- 原首页 `crt_browser.mjs` 通过：CRT、雪花→迷宫、相机、粒子大脑、RNA、回看、倒滚、手机与减少动态。
- 临时目录 Frozen-Flask 构建包含 `/next-journey`，原 `audit_build` 资源与链接审查通过；没有重建共享 `public/`。
- `git diff --check` 通过。
- 最终旅程浏览器检查通过：单画布、首帧真实近白像素、三个键盘站点、位置及粒子颜色的精确逆向还原、迷宫交接、项目跳转、390×844 触控区、减少动态与无 WebGL。没有页面脚本错误。
- 最终桌面/手机换行、身份标签避让导航已在刷新模板缓存后核对。截图和 `results.json`、来源校验记录保存在 [`docs/previews/next-journey-2026-10-13/`](../previews/next-journey-2026-10-13/)。

没有进行实际屏幕阅读器试听；本次完成的是静态阅读、键盘、语义标记与两种降级检查。未发布，所有代码已落在仓库，剩余的是 `/next-journey` 设计评审与是否提升到首页的决定，没有仅存在聊天预览的实现。

烟测命令（已有 Playwright 安装时）：

```sh
WIKI_BASE_URL=http://127.0.0.1:8786 node tests/journey_browser.mjs
```

自定义 Playwright 安装路径可通过 `PLAYWRIGHT_MODULE` 指定；输出目录可通过 `JOURNEY_OUTPUT` 指定。没有提交、推送或发布。
