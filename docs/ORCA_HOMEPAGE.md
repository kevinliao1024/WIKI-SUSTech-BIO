# ORCA 首页：维护与动画地图

## 技术选择

保留现有 Flask / Jinja / Frozen-Flask，不迁移 React，不增加运行时依赖。
首页采用原生 SVG 路径采样、requestAnimationFrame 和 CSS sticky 实现“自动开场 + 可逆滚动下潜”。
内页的干实验材料、导航、许可证和 GitLab 页脚链接继续使用原有文件。

## 每个文件负责什么

| 文件 | 职责 | 通常在这里修改什么 |
| --- | --- | --- |
| `wiki/pages/home.html` | 首页装配入口 | 组件顺序、首页 CSS/JS 引入 |
| `wiki/layout.html` | 全站基础模板 | `navigation`、`page_styles`、`page_scripts` 扩展点；不放首页动画逻辑 |
| `wiki/components/home_nav.html` | 首页独立导航 | ORCA、Research、Approach、Results、Team、About 和移动菜单 |
| `wiki/components/intro/sequence.html` | 动画场景与鱼群配置 | 领航鲸、四条伴游鲸、十二条路径鲸的素材/尺寸/速度/延迟；项目名与副标题 |
| `wiki/components/intro/fish.html` | 可复用 Jinja `fish()` 宏 | 输出鲸鱼图片和动画参数；不绘制动物轮廓 |
| `wiki/components/intro/neural.html` | 完整原图裁窗 | 显示 visual-system-reference 左侧；SVG 仅保存不可见的鱼群运动轨迹 |
| `wiki/components/intro/ribbons.html` | 旧版丝带宏（已停用） | 保留历史实现，当前首页不调用，不能靠改它修改当前原图 |
| `wiki/components/home_content.html` | 科学内容区 | 项目简介、六个编号章节、到现有研究页的链接 |
| `static/intro.css` | 仅首页的视觉和响应式布局 | 配色、字体、留白、sticky 高度、静态降级、手机布局 |
| `static/intro.js` | 单一滚动时间线 | Bézier 入场、减速、标题出现、路径运动、镜头移动、菜单、偏好切换 |
| `scripts/prepare_intro_assets.py` | 离线原图处理 | 从白底 JPEG 提取透明鲸鱼；只处理素材，不影响网站运行依赖 |
| `static/assets/intro/` | 首页实际图片 | 未修改的参考 JPEG、小鱼素材、来源清单；旧脑回裁图已停用 |
| `tests/intro_browser.py` | 多设备时间线验证 | 桌面/平板/手机关键帧、进退、跳过、菜单、静态降级、溢出 |
| `tests/intro_autoplay.py` | 自动开场与接棒验证 | 不滚动入场、依次显现、等待滚动、提前下滑、返回页首 |
| `tests/intro_preferences.py` | 运行中切换无障碍偏好 | 保留鱼群尺寸，立即显示静态标题，恢复动画 |
| `tests/intro_composition.py` | 原图构图保护 | 五种尺寸下完整脑部可见、横纵比例一致、正确鲸鱼来源、原图尾线接入正文 |
| `tests/test_reference_art.py` | 原图素材契约 | 文件哈希不变、不用局部脑回、不叠加替代鲸鱼或绘制曲线 |
| `tests/intro_performance.py` | 桌面帧间隔采样 | 记录测试机的 median / p95，不保证所有设备帧率 |
| `tests/test_fish_component.py` | 组件契约测试 | 可选参数能正确进入页面 |

`static/style.css` 和 `static/wiki.js` 仍负责全站基础样式与内页交互。
优先在 `intro.css` 的 `.orca-story` 范围中修改首页，避免改坏干实验内页。

## 时间线与坐标

桌面外层为 `300svh`，可视舞台为 `100svh`；手机缩短为 `220svh`。
`progress = (scrollY - 场景起点) / (外层高度 - 舞台高度)`，限制在 0–1。
开场不需要滚动。图片解码后，`ARRIVAL_MS=4000` 的时钟推动叙事进度从 0 到 `HANDOFF=0.46`。
大鱼约 2.3 秒落位；约 2.4 秒开始渐显完整脑图及其中的 ORCA 标题，约 4 秒完成。
入场鲸鱼与原图对应位置重合后淡出，由原图中的同一鲸鱼接替；停留画面直接使用原图，不叠加第二条鲸鱼。
小鱼不会自动下潜。滚动才将叙事进度从 0.46 推向 1。
提前下滑会直接完成开场，不锁定滚动；返回顶部保留已显现的 ORCA，不重播。
页面隐藏时暂停开场时钟；减少动态效果直接显示静态版。

`data-progress` 是下潜滚动进度；`data-auto-progress` 是开场进度；`data-intro-state` 为 entering / revealing / ready / static。
叙事进度在开场时为 `0.46 × autoProgress`，接棒后为 `0.46 + 0.54 × scrollProgress`。
滚动进度有轻量平滑，向上滚动只倒放下潜段。

| 内部叙事进度（非单纯滚动比例） | 画面 |
| --- | --- |
| 0–0.26 | 领航鲸沿三次 Bézier 曲线从右上方游入并减速 |
| 0.28–0.42 | 完整原图渐显，图内鲸鱼、ORCA、副标题与脑部构图保持原始相对位置 |
| 0.48–0.97 | 第二鱼群从左侧进入，按各自延迟和速度沿曲线下降 |
| 0.65–1.00 | 镜头上移，跟随下行路径，接入科学内容 |

原文件是 `1241 × 1080`；网页裁窗只显示左侧 `712 × 1080` 的插画，不显示右侧设计说明。
原图、主鲸鱼落位和运动轨迹共用 `referenceScale`；横纵缩放相同，不拉伸。
首屏按原图脑部 `y=0..455` 的完整轮廓适配可视高度，长神经尾线继续向下延伸。
`neural-route` 是不可见的运动参考线，沿原图的真实脑回和神经尾线走向布置。不要给它加描边覆盖原图。
JS 对每条路径预采样 601 个点，每帧插值，避免每条鱼重复读取 DOM 几何。
鱼群分三条法向偏移轨道，并加轻微正弦摆动，避免完全重合。

原图运动轨迹末端为 `(453, 1048)`；镜头位移根据该点计算，使它在最后落到舞台高度的 70% 处，与正文上沿相接。
JS 把实际舞台高度写入 `--intro-stage-height`，正文重叠 0.3 个舞台高度。
不再拼接第二条绘制曲线；原图自己的长尾线完整保留。过渡背景透明，避免切掉鱼身，舞台不拦截正文点击。
滚动 85%–95% 时淡出开场底部提示，避免压住正文。

## 鲸鱼组件参数

```jinja
{% from 'components/intro/fish.html' import fish %}
{{ fish('fish-small-01', size=80, index=0, kind='route',
        speed=1.05, delay=0.03, wobble=4,
        path='#neural-route', rotation=0, opacity=1) }}
```

| 参数 | 含义 |
| --- | --- |
| `asset` | 普通鱼为 `static/assets/intro/` 下不含 `.png` 的文件名；主鲸鱼用专用值 `reference-leader` |
| `size` | 普通鱼为桌面 CSS 像素；主鲸鱼的 146 为原图裁窗宽度，随原图等比缩放 |
| `index` | 群内序号，决定编队、摆动相位、响应式隐藏顺序 |
| `kind` | `leader`、`escort` 或 `route` |
| `speed` | 进度倍率，1 为基准；入场和路径鱼均支持 |
| `delay` | 总滚动进度比例的延迟，不是秒 |
| `wobble` | 摆动幅度，CSS 像素 |
| `initial_x` / `initial_y` | 可选，舞台宽/高比例，例如 1.18 / 0.12；路径鱼会整体偏移路径起点 |
| `path` | 场景内 SVG 路径选择器，须使用同一坐标系 |
| `rotation` | 路径切线旋转之外的附加角度 |
| `opacity` | 最大透明度，0–1 |

默认不传起点时使用自然编队。桌面路径鱼 12 条、平板 8 条、手机 6 条。
手机伴游鲸从 4 条减为 2 条，领航鲸仍保留。

## 素材与视觉约束

主鲸鱼来自 `visual-system-reference.jpg` 标题左边的蓝白鲸鱼与粉色底纹，裁窗为 `(28,82)–(174,198)`。
它不是 `fish-large-01`。入场图层使用原生 SVG 透明度滤镜去除暗底、保留源图 RGB；停留画面直接使用完整原始 JPEG。
其余小鱼来自团队提供的 `fish-*.jpg`，不是 CSS/SVG 重绘，也没有使用 AI 重画。
白底通过边缘连通区域去除，保留眼睛和腹部的内部白色。低分辨率原图放大会显露 JPEG 边缘，后续可用团队高清透明原稿替换同名素材。
`provenance.json` 记录源文件名、SHA-256 和裁剪范围，不记录个人绝对路径。

主画布 `#FFFFFF` 与原图留白一致；正文文字 `#191B62`，珊瑚色 `#FF8194` 是克制的生物学强调色。插画内部颜色直接使用原图。
标题 Georgia Bold；正文 Futura → Futura PT → Avenir Next → Montserrat → sans-serif。
这些字体从设备本地解析，不加载外部字体 CDN。不要擅自提交未获授权的字体文件。

**首屏图内文字也是原图的一部分。** `reference-copy` 中的 HTML 标题只提供读屏语义，不覆盖原图。
若需修改首屏图内项目名、字形或鲸鱼与脑图的独立运动，应更新设计源图或提供分层素材；下方正文仍可直接编辑 HTML。

发布前仍需按仓库 README 的 iGEM 要求上传图片到团队上传工具并替换为相应 iGEM 素材地址。
本地目录用于开发预览；本地构建成功不等于图片托管规范已由团队审核完成。

## 运行与检查

```bash
conda activate xbx_env
python -m flask --app app run --host 127.0.0.1 --port 8080
```

另一个终端中运行：

```bash
conda activate xbx_env
python -m unittest discover -s tests -v
python tests/intro_autoplay.py
python tests/intro_browser.py
python tests/intro_preferences.py
python tests/intro_composition.py
python tests/intro_performance.py
python tests/browser_smoke.py
python -m flask --app app freeze
python scripts/audit_build.py
```

关键帧截图、时间线采样与性能报告输出到 `/private/tmp/orca-intro-qa`。
原图构图截图输出到 `/private/tmp/orca-reference-qa`。
默认预览地址是 `http://127.0.0.1:8080`。浏览器测试可用 `WIKI_BASE_URL` 指向其他预览服务。
Flask 当前不开自动重载；改 Jinja 模板后重启本地服务，避免在浏览器检查到缓存模板。

## 无障碍与内容审核

系统开启减少动态效果时直接显示静态 hero，取消长距离固定滚动，不走鱼群路径；无 JavaScript 也能阅读正文并使用导航。
动画可通过 Skip to research 跳过。鱼群为装饰图，避免读屏逐条播报。
科学简介是团队待审草稿；模拟和计算排序不等同于实验或临床结果。不得填入虚构实验数据、引用或成员信息。
