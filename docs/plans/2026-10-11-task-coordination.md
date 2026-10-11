# Wiki 任务状态与防覆盖记录

核对日期：2026-10-11，Asia/Shanghai。恢复基线采集于 18:50。

## 唯一交付目录

所有已检查的 Wiki 开发任务的实际工作目录相同：

```text
/Users/kevinliao/Documents/68fb7c278dc2c66b8963ea05/chenfan/university/竞赛/iGEM/igem/wiki
```

当前分支 `design/one-take-home`，HEAD `7b894a636688c10c744b1c781f03e33efed3f6d3`。
`git worktree list` 只有这个工作目录，没有待合并的独立 worktree。
应用中两个名为 wiki 的本地项目记录指向同一绝对路径；项目 ID 不同不代表文件隔离。
8080、8081、8082 是预览端口，不是源文件版本边界；进程可能缓存旧模板或路由。

这里的“同一份本地文件”按同一份完整项目理解。功能仍应拆在各自模块中，不能把所有任务集中到一个巨大文件里。

## 已检查的其他任务

以下是实际聊天标题及最近状态；“已完成”指最近一轮工作，不代表已经提交、上线或获得设计验收。

| 聊天标题 | 核对结果 | 本地落点与边界 |
| --- | --- | --- |
| 梳理 ORCA Home 首页文字 | 上一轮已完成并接入；最新一轮正在检查拖拽，修复直接抓取蛋白粒子外缘时无响应的问题 | `static/onetake/biology-scene.mjs`、`edit-replay.mjs`；共享入口 `onetake.js`、`onetake.css`、`wiki/pages/home.html` |
| 让金色路线跟随鼠标 | 最近一轮已完成；金色路线跟随速度已调慢，CRT/迷宫/大脑模块仍在 | `maze-navigation.mjs`、`brain-correspondence.mjs`、`crt-opening.mjs`、`crt-opening.css`、`wiki/components/crt_opening.html`；共享入口 `onetake.js` |
| 这个是claude写的记忆，然后我要重做阿尔兹海默症人数这个地方：igem-wiki iGEM 队伍 wiki 项目… | 上一轮已完成并接入；最新一轮正在检查用户正常滚动时没有看到该段的问题 | `static/onetake/dementia-burden.css`、`dementia-burden.mjs`、`wiki/components/dementia_burden.html`；首页只负责引用 |
| 蛋白三维图这件事，我建议换个做法 你要的是提升 specific 度，但一张裸的 ribbon 结构图其实是反效果的—… | 最近一轮已完成，等待用户确认预览；按先前要求只展示在 `/next` | `assets/figures/apoe112/`、`static/onetake/apoe112.*`、`wiki/components/apoe112.html`、`wiki/pages/home_next_structure.html`；`app.py` 中的 `/next` 路由 |
| 重设计导航 RNA 下拉菜单 | 最近一轮已完成；聊天未加载不等于代码未完成 | `wiki/menu.html`、`static/menu-refinements.css`、`static/wiki.js` |
| 实现白洞页面转场系统 | 最近一轮已完成；聊天未加载不等于代码未完成 | `static/transition/`、`wiki/components/whitehole_head.html`；`wiki/layout.html` 第 7 行引用 |
| 设计首页项目探索区样式 | 五种交互方案预览已完成；尚未接入正式首页 | 已于 18:54 留存项目内副本 `docs/previews/explore-directions-2026-10-11.html`；旁边的 provenance 文件记录原始路径和校验值 |

前六项成果都在本项目中，无需复制旧版本或重复合并。蛋白结构未出现在 `/` 是用户要求的预览隔离，不是丢失。

## 共享文件与冲突点

1. `wiki/pages/home.html`：首页叙事、CRT、人数展示和未来探索区都可能触及。保留已有组件引用，局部修改目标区段。
2. `static/onetake/onetake.js`：迷宫/CRT、大脑、生物场景、编辑回看，以及 `/next#apoe112` 的回看禁用条件共用。不能用任何任务早期保存的整文件替换。
3. `static/onetake/onetake.css`：首页动画与生物交互的共享样式；新组件优先放自己的样式文件。
4. `wiki/pages/home_next_structure.html`：当前是首页的独立副本，主体与首页相同，但有结构样式/脚本、`data-structure-preview`、结构组件和不同锚点。公共文案后续存在不同步风险。修改时逐段比较，保留这些有意差异。
5. `app.py` 和 `wiki/layout.html`：分别保护 `/next` 路由与白洞组件引用。
6. `tests/test_wiki.py`、依赖清单和仓库说明同样是共享文件；各任务不可撤销其他任务的检查或依赖。

执行防覆盖约定见根目录 `AGENTS.md`：写共享文件前先取得 `.local-task-locks/shared-integration/` 协作锁，再重读最新内容、做小补丁、检查并释放自己的锁。独立模块仍按上表分工。

这属于协作规则，不是强制文件权限或操作系统锁。用户已明确授权，审核聊天已成功向两个正在运行的首页交互与人数展示聊天发送具体协调要求：读取 AGENTS.md 和本记录、共用现有目录、使用共享文件锁、保留对方的实时改动、使用独立构建/验收输出。发送成功不等于已收到对方的执行确认；后续以聊天记录和实际锁使用为准。无需唤醒其他已完成任务，它们后续开始编辑时按项目内规则执行。

18:54 后对照恢复基线发现新的首页改动：蛋白表面的 SVG 抓取区域、触摸事件排除区域、对应样式、两个首页模板及浏览器验收脚本。已阅读差异，属于新的拖拽修复，没有发现它删除人数、CRT、白洞或蛋白结构预览的接入。新一轮视觉验收仍由原任务进行，不能把上一轮“已完成”当成当前已停止写文件。

最新进度：拖拽任务已报告桌面粒子外缘抓取、错误放置回位与固定正常，继续验证手机触摸。人数展示任务已确认段落接入，但停留时间太短，正在调整滚动节奏。

`static/wh/` 与 `wiki/components/wh_transition.html` 还留在目录中，但当前布局接入的是 `static/transition/`。未发现同时加载两套转场；保留旧文件，不在本次检查中删除。

## 本次验证

- `.venv/bin/python -m unittest discover -s tests -v`：48 项全部通过。
- `node tests/maze_navigation.mjs`：269 个目标可达及路线不穿墙检查通过。
- `node tests/brain_correspondence.mjs`：粒子身份保留与大脑对应检查通过。
- `node tests/home_edit_replay.mjs`：编辑顺序、等待拖放、一次手势播放、回看与减少动态检查通过。
- 使用临时目录运行 Frozen-Flask，再调用现有 `audit_build`：26 个必需页面、资源引用与链接检查通过；未覆盖共享 `public/`。
- `git diff --check`：通过。

收到新一轮拖拽修改后，再次运行 48 项 Python 检查与编辑回看逻辑检查，仍全部通过。后续人数段的时间轴修改正在进行，不能提前宣称其最终验收通过。

以上验证通过时对应本次核对过程中的代码状态；之后运行中任务仍可能更新文件。本次重新验证的是代码、路由和构建；此前各任务的完整视觉/浏览器验收记录由各聊天保留，本次未重复所有视觉操作。现有预览端口的 HTTP 探测受执行环境网络限制，不能据此确认各服务缓存是否刷新；页面渲染使用 Flask 测试客户端验证。

## 恢复与 Git 状态

恢复基线：`.local-backups/task-audit-20261011-185028/`。

补充快照：`.local-backups/task-audit-20261011-185812/`，包含 79 个文件及已经复制进项目的探索区方案，约 853 KiB；归档内容校验通过，采集期间无文件变化。此时两个修复任务仍在运行，快照是恢复点，不代表它们的最终完成状态。

- `working-files.tar.gz`：75 个改动/新增文件及关键说明的恢复副本，约 842 KiB。
- `manifest.json`：每个文件的 SHA-256、大小、原工作目录、分支与 HEAD。
- `tracked-changes.patch`：相对 HEAD 的已跟踪文件差异。
- `status.txt`：采集时的 Git 状态。

压缩包逐文件校验通过，采集过程中这些文件没有变化。快照不是整仓库备份；它依赖上述 Git 基线，并保存了本次各任务的未提交成果。若要恢复，先解到临时目录比较，再恢复需要的区段；不要整包覆盖正在工作的项目。

所有功能改动仍未提交。当前分支比已缓存的 upstream 跟踪分支领先 9 个提交；本次没有联网更新远端引用，所以这不是对远端实时状态的判断。本次没有提交或推送。

还发现一个 0 字节的 `.git/index.lock`（时间为 2026-10-10 20:50），检查时未找到打开它的进程。本次未删除 Git 锁文件；若之后提交报锁错误，应先再次确认没有运行中的 Git 写操作，再清理此锁。

本次新增的备份和协作锁目录均已加入 `.gitignore`，避免提交恢复包与临时占用记录。
