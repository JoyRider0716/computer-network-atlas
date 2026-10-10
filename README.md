# 网络结构工坊 · Network Atlas 3

面向大学计算机网络课程与实际工作的中文3D学习网站。通过双主机和路由器理解分层，再使用协议图文手册学习职责、工作原理、报文字段与协作关系。

## 主要功能

- 双主机与路由器的可旋转3D模型：层块点击、缩放、分层/紧凑视图、自动旋转与复位。
- OSI七层与TCP/IP四层切换，逐层可折叠定义、核心机制、协议知识与误区。
- **独立的“协议详解”界面**：32个常见协议、格式、机制和链路技术条目，按模型与层级浏览，支持本层关键词筛选。
- **32张工作原理图、133个可点击步骤**：消息交互图或功能流程图，与逐步文字说明同步高亮；支持前进、后退和从头查看。
- 每个条目另有协议协作关系图，可点击相关节点跳转；基本定义、机制与字段、协作关系可依次折叠。
- 从3D本层详情直接打开协议详解，从协议页返回对应3D层级。
- HTTP/TCP、DNS/UDP封装与逐跳转发，TCP握手/挥手、UDP丢失与乱序实验。
- 保留29节原理讲解、TCP/UDP/IPv4/以太网字段查看、5种网络计算器与8个排查案例。
- 完整源码下载与GitHub Pages自动部署。

页面不包含练习题、模型对照界面或面试问答栏目。

## 本地运行

没有第三方npm依赖或构建步骤。安装Python 3后，在仓库根目录运行：

```bash
python scripts/package_source.py --output dist/network-atlas-source.zip
python -m http.server 8000 --directory dist
```

打开 `http://localhost:8000`，点击顶部的 **协议详解**。Windows也可用 `py` 代替 `python`。请通过HTTP访问，直接双击HTML可能导致ES模块加载失败。

## 检查

安装Node.js 18或更高版本后：

```bash
node check.mjs
```

检查覆盖模块/资源关联、协议目录在两个模型中的完整性、图中节点和协作引用、所有32条目的步骤交互、模型切换、计算边界、封装流程和3D数学。DOM模拟检查不代替真实浏览器的排版与触摸验证。

## GitHub Pages部署

详见 [docs/GITHUB_PAGES.md](docs/GITHUB_PAGES.md)。

1. 把解压后的 `network-atlas/` 内全部内容上传到仓库根目录，包括 `.github/`。
2. 在 **Settings → Pages → Source** 选择 **GitHub Actions**。
3. 推送到 `main`，或在Actions手动运行部署工作流。
4. 打开GitHub返回的Pages地址。

工作流检查源码、重新生成源码ZIP并部署 `dist/`。所有运行资源使用相对路径，兼容 `/<仓库名>/`。无需API密钥、ChatGPT账号、数据库或运行时CDN。

## 源码结构

| 文件 | 作用 |
| --- | --- |
| `dist/index.html` | 页面入口与导航 |
| `dist/app.js` | 3D主界面与协议页面联动 |
| `dist/scene.js` | WebGL几何、镜头、点击检测与兼容投影 |
| `dist/content.js` | 原有层级、基础协议与传输实验数据 |
| `dist/protocol-data.js` | 32个图文条目、图节点、133步流程、协作关系与分类 |
| `dist/protocols.js` | 协议界面、SVG图、筛选、步骤选择与关联跳转 |
| `dist/protocols.css` | 协议页面及图形的响应式样式 |
| `dist/flows.js` | 封装流程 |
| `dist/curriculum.js` | 深入原理与故障案例 |
| `dist/packets.js` | 报文字段结构与解释 |
| `dist/calculators.js` | 网络计算逻辑 |
| `dist/learning.js` | 原理、字段、计算与排查栏目 |
| `dist/styles.css`、`dist/study.css` | 主界面与进阶栏目样式 |
| `check.mjs`、`tests/ui-smoke.mjs` | 数据、运算与交互逻辑验证 |
| `scripts/package_source.py` | 完整源码ZIP打包 |
| `.github/workflows/deploy-pages.yml` | GitHub Pages部署 |
| `docs/` | 部署指南与内容范围 |

## 扩充协议图文内容

`dist/protocol-data.js` 的每条数据包括 `layer`、`kind`、`role`、`diagram`、`actors`、`steps`、`links`、`focus` 与标准链接。

- `sequence` 绘制消息交互，步骤的 `from/to` 为参与者索引；相同索引表示本地处理。
- `flow` 绘制功能处理顺序，最多6个节点，自动使用蛇形布局。
- `steps` 中每一步包含图中标题和文字说明；红色 × 表示示例丢失。
- `links` 说明承载、格式或功能配合，并指向另一条目；它不是固定的封装链。
- 基础23个条目复用 `content.js` 的定义和知识点，新增条目在 `protocol-data.js` 中定义。

图是代码生成的SVG，保持清晰和可编辑，无需购买图片或3D模型。新增或修改后运行检查与打包命令。

## 人工浏览器检查

- 桌面与手机：导航和目录可用，页面不横向溢出；较宽的协议图可在图框内水平滚动。
- 模型切换：目录分类、协议数量与回到3D的位置正确。
- 协议：筛选、点击图中步骤、键盘Enter/Space、上一步/下一步、从头查看可用；文字与高亮匹配。
- 关联图：点击目标节点或文字卡片跳转，折叠项保持相应状态。
- 3D：旋转、缩放、点层块、复位、紧凑视图及从协议页返回后显示正确。
- 进阶：四个栏目、报文字段和计算器仍可用。
- 下载：源码包可独立解压、检查、运行与部署。

## 教学范围

模型是功能示意，并非主机内真实的七块硬件。TCP/UDP实验和协议步骤不会发出真实网络报文。

协议归属按功能与实际承载方式解释。表示层、会话层使用功能示例；UTF-8、JSON、会话管理、PHY和介质分别标注类别。BGP虽服务于路由控制，但由TCP承载，按应用层列出。TCP、UDP属于传输层，四层体系称为TCP/IP模型。

协议图展示常见流程，省略条件写在相应图下；覆盖32个常见条目，不能替代所有标准或课程教材。详见 [docs/CONTENT_MAP.md](docs/CONTENT_MAP.md)，各条目提供适用的RFC或IEEE参考。

交互灵感来自 [GordenSun/LearningCell](https://github.com/GordenSun/LearningCell)。网络场景、教学内容与代码独立实现，未复制其模型或源代码。
