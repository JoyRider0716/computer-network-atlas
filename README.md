# 网络结构工坊 · Network Atlas

[中文](README.md) · [English](README.en.md)

## 项目用途

一个用于学习计算机网络的交互式网站。通过可旋转的双主机与路由器模型，查看 OSI 七层和 TCP/IP 四层的职责，观察数据封装、逐跳转发与解封装过程。

协议详解提供 32 个协议、格式和网络技术条目的流程图与逐步说明。网站还包含 TCP 连接建立与关闭、UDP 丢失与乱序示例，以及原理讲解、报文字段、网络计算工具和故障排查案例。所有演示均在浏览器中运行，使用模拟数据。

## 使用方法

项目是静态网页，无第三方 npm 依赖。安装 Python 3 后，在仓库根目录运行：

```bash
python -m http.server 8000 --directory dist
```

浏览器打开 <http://localhost:8000> 查看中文，或 <http://localhost:8000/en/> 查看英文；顶部可切换语言。Windows 可用 `py` 代替 `python`。请通过 HTTP 访问，以便浏览器加载 ES 模块。

- **分层探索**：切换模型，点击网络层或 3D 层块查看内容；拖动模型旋转，滚轮缩放。每秒推进一步，同步查看首部的新增、移除、TTL 更新以及处理前后的报文结构。
- **协议详解**：按层选择条目，点击图中箭头或步骤按钮阅读说明；关系图中的节点可跳转到相关条目。
- **传输层实验**：在传输层详情的“在这次通信中做什么”中进入实验，选择握手、关闭连接或 UDP 示例，查看报文与状态变化。
- **深入学习**：查看当前层的原理、报文字段、计算工具与排查案例。

修改中文文案后，更新 `locales/en.json` 并生成英文页面：

```bash
python scripts/build_locales.py
```

若需使用页面上的源码下载按钮，先生成下载包：

```bash
python scripts/package_source.py --output dist/network-atlas-source.zip
```

修改后可用 Node.js 18 或更高版本运行检查：

```bash
npm run check
```

发布到 GitHub Pages 的步骤见 [部署指南](docs/GITHUB_PAGES.md)。

## 项目架构

网站入口、脚本、样式和教学数据都位于 `dist/`。中文源码直接由浏览器加载；`dist/en/` 根据相同源码与翻译表生成英文页面，两种语言共用样式。

| 文件或目录 | 职责 |
| --- | --- |
| `dist/index.html`、`dist/app.js` | 页面入口、导航、模型切换与演示控制 |
| `dist/scene.js` | WebGL 模型、镜头、层块点击检测及二维兼容绘制 |
| `dist/content.js`、`dist/flows.js` | 分层定义、基础协议、传输实验与封装流程 |
| `dist/protocol-data.js`、`dist/protocols.js` | 协议数据、SVG 流程图、目录筛选与条目跳转 |
| `dist/curriculum.js`、`dist/packets.js`、`dist/calculators.js` | 原理与案例、报文字段、网络计算逻辑 |
| `dist/learning.js` | 原理、字段、计算与排查栏目的交互 |
| `dist/styles.css`、`dist/study.css`、`dist/protocols.css` | 主界面、深入学习与协议页面的样式 |
| `check.mjs`、`tests/` | 数据关联、计算边界和交互检查 |
| `scripts/build_locales.py`、`locales/en.json` | 英文页面生成与翻译映射 |
| `scripts/package_source.py` | 生成源码 ZIP |
| `.github/workflows/deploy-pages.yml` | 检查源码、打包并部署 `dist/` 到 GitHub Pages |
| `docs/` | 部署说明与教学内容目录 |
