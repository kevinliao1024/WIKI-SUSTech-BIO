# Monument Valley style journey preview

纪念碑谷风格的小人行走原型。

## 如何预览

### 方法 1：用项目的 Flask 服务器（推荐）

```bash
cd /path/to/wiki
python app.py
# 或者如果有 conda 环境：
# conda run -n xbx_env python app.py
```

然后浏览器访问：
```
http://127.0.0.1:8080/docs/previews/next-journey-monument/
```

### 方法 2：用 Python 的简单 HTTP 服务器

```bash
cd /path/to/wiki
python3 -m http.server 8080
```

然后访问同样的地址。

### 方法 3：如果上面都不行

我可以改成 CDN 版 three.js 的独立 HTML，这样你双击文件就能打开。

## 当前实现

- **等距相机** — 纪念碑谷经典倾角
- **三座实体建筑** — Home（塔 + 拱门）、Meeting（双岛 + 拱桥）、The way（台阶 + 道路）
- **会动的小人** — 行走时腿摆动、身体起伏、微微倾斜
- **建筑错位** — 门框滑开、桥断裂、路分岔下沉
- **分层水面** — 浅水 + 深水底营造深度
- **纪念碑谷配色** — 沙石色阶 + 青绿强调 + 橙色小人

## 交互

- 点按钮跳到各站
- 拖滑块或用左右方向键精确控制
- 左上角显示当前进度
