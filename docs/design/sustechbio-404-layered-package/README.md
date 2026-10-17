# SUSTech-BIO 404 Layered Package

## 图层说明

1. `background.png`：深色宇宙/海洋背景（静态）
2. `nav.png`：顶部导航（静态）
3. `content.png`：左侧 404 标题、文案和按钮（静态）
4. `island_sign.png`：右下小岛、水面与指示牌（静态）
5. `mascot.png`：吉祥物主体（建议轻微上下浮动）
6. `question_mark.png`：问号与强调线（建议轻微上下浮动）
7. `stars.png`：星星装饰层（建议轻微上下浮动）
8. `bubbles.png`：泡泡/发光圆点装饰层（建议轻微上下浮动）
9. `reference_full_mockup.png`：整张参考效果图，用来对照复刻效果

## 本地运行方法

### 方式一：直接双击
如果浏览器允许本地打开静态文件，可以直接打开 `index.html`。

### 方式二：推荐本地静态服务器
在当前目录执行：

```bash
python3 -m http.server 8080
```

然后访问：

```text
http://localhost:8080
```

## 调整建议

- 如果你想让吉祥物更靠右，可以在 `style.css` 里改 `.layer-mascot` 的 `right`。
- 如果你想让吉祥物更大或更小，可以改 `.layer-mascot` 的 `width`。
- 问号、星星、泡泡的浮动速度，可以分别调对应图层的 `animation` 时长。
- 如果之后想把按钮真正做成 HTML 文本按钮，可以保留现在的图片版式，同时把命中区域 `hitbox` 换成真正按钮组件。
