# ORCA Wiki 内容编辑指南

这份指南给不写前端代码的队员使用。日常修改 Wiki 正文时，你只需要编辑 `docs/` 里的 Markdown 文件。

## 修改一个页面

1. 在下表找到页面对应的 `.md` 文件。
2. 只修改这个 Markdown 文件中的标题、段落、列表、链接、图片或表格。
3. 把页面图片放进 `assets/images/`；文件名只用小写英文字母、数字和连字符。
4. 在本地预览或提交 Pull Request，请 Wiki 开发者检查页面。
5. commit 并 push；合并到主分支后，GitLab CI 会自动构建网站。

普通内容维护请不要修改 `wiki/`、`static/`、`app.py`、页面 layout、JavaScript 或 CSS，除非你正在负责 Wiki 开发。

## 页面与文件

| Wiki 页面 | Markdown 文件 |
|---|---|
| Team | `docs/team/team.md` |
| Attributions | `docs/team/attributions.md` |
| Description | `docs/project/description.md` |
| Engineering | `docs/project/engineering.md` |
| Results | `docs/project/results.md` |
| Contribution | `docs/project/contribution.md` |
| Parts | `docs/project/parts.md` |
| Experiments | `docs/wet-lab/experiments.md` |
| Notebook | `docs/wet-lab/notebook.md` |
| Measurement | `docs/wet-lab/measurement.md` |
| Alternative Platform | `docs/wet-lab/alternative-platform.md` |
| Safety & Security | `docs/wet-lab/safety-and-security.md` |
| Dry Lab Overview | `docs/dry-lab/dry-lab.md` |
| Model | `docs/dry-lab/model.md` |
| Brain Delivery | `docs/dry-lab/brain-delivery.md` |
| Off-Target Atlas | `docs/dry-lab/offtarget-atlas.md` |
| Software | `docs/dry-lab/software.md` |
| Hardware | `docs/dry-lab/hardware.md` |
| Human Practices | `docs/human-practices/human-practices.md` |
| Education | `docs/human-practices/education.md` |
| Entrepreneurship | `docs/human-practices/entrepreneurship.md` |
| Inclusivity | `docs/human-practices/inclusivity.md` |
| Sustainability | `docs/human-practices/sustainability.md` |

Homepage 是特殊动画页面，仍由 Wiki 开发者维护，不在这张表里。

## 文件开头怎么写

每个页面开头都有一段 YAML front matter。`title` 是页面标题，`subtitle` 是标题下面的介绍，`eyebrow` 是标题上方的小分类：

```md
---
title: Project Description
subtitle: On-target RNA Correction for Alzheimer's Disease
eyebrow: Project
---

# Project Description

## Background

Write the page here.
```

正文里的第一个 `#` 一级标题可以保留，网站会自动把它作为页面标题，不会重复显示。用 `##` 和 `###` 写章节，网页会自动生成目录和链接锚点。

## 常用 Markdown

```md
## Section title

Normal paragraph with **bold**, *italic* and a [link](https://example.org).

- First item
- Second item

> This is an important quotation or note.

| Sample | Result |
|---|---:|
| Control | 0.00 |
| Test | 0.42 |

This statement has a footnote.[^1]

[^1]: Add the source or explanation here.
```

## 插入图片

先把图片放到 `assets/images/`，然后写：

```md
![APOE mechanism](/assets/images/apoe-mechanism.webp)

*Figure 1. Explain what the reader should notice, and record the creator/source.*
```

不要使用电脑上的本地绝对路径，也不要链接第三方图片 CDN。正式发布前，图片仍需按 iGEM 要求上传到 iGEM 基础设施，并由 Wiki 开发者完成最终路径核对。

## 发布前检查

- 所有科学结论和数字都由负责队员复核。
- 每张图片有清楚的 alt text、图注、来源和许可。
- 每条 DOI、链接和引用都能打开且内容正确。
- Simulation、heuristic、experimental data 不混写。
- 不提交账号、密钥、个人信息或未获许可的材料。

Dry Lab 的五个高设计页面保留了专用 Jinja 组件。它们的标题、简介和第一段叙述仍从对应 Markdown 读取；复杂模型卡片、证据标签和结果组件由 Wiki 开发者维护。
