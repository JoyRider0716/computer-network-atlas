# GitHub Pages部署指南

这是一套独立的静态网站，源代码、教学数据、3D渲染器、交互、测试和部署配置都已提供。无需ChatGPT、API密钥、数据库或付费模型接口。

## 一、解压后应该看到什么

打开`network-atlas/`目录。该目录中应同时存在`README.md`、`package.json`、`dist/`、`scripts/`和`.github/`。

请上传这个目录里面的内容作为仓库根目录。不要再嵌套一层`network-atlas/`，也不要只上传`dist/`而漏掉自动部署工作流。

`.github/`是隐藏目录，但它包含部署工作流，必须保留。源码包不包含任何当前在线网站的身份配置或凭据。

## 二、先在本地打开网站

安装Python 3后，在上述目录运行：

```bash
python scripts/package_source.py --output dist/network-atlas-source.zip
python -m http.server 8000 --directory dist
```

Windows如果`python`不可用，可以把它换成`py`。

浏览器打开`http://localhost:8000`。不要直接双击`index.html`，因为浏览器对本地文件的ES模块加载有限制。

如果安装了Node.js 18或更高版本，可以运行：

```bash
node check.mjs
```

没有第三方npm依赖，不需要`npm install`。

## 三、上传到自己的GitHub仓库

在GitHub新建一个仓库，例如`network-atlas`。使用GitHub Free时，普通GitHub Pages部署可选公开仓库；私有仓库Pages支持取决于账号方案与组织策略。

可用GitHub Desktop将解压目录作为本地仓库，再发布到自己的账号。也可在仓库根目录用Git命令：

```bash
git init
git add .
git commit -m "Add Network Atlas learning website"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/network-atlas.git
git push -u origin main
```

把`YOUR_USERNAME`和仓库名替换成自己的信息。如果仓库已经初始化，请按实际仓库状态提交，不要再次盲目添加同名remote。

## 四、启用GitHub Pages

1. 打开仓库的 **Settings → Pages**。
2. 在 **Build and deployment → Source** 中选择 **GitHub Actions**。
3. 打开 **Actions**，找到 **Deploy Network Atlas to GitHub Pages**。
4. 首次上传可能早于Pages启用。此时点击 **Run workflow** 手动运行一次。
5. 等待检查、源码打包、上传和部署完成。
6. 从部署任务或Settings → Pages打开实际网站地址。

普通项目仓库地址通常为：

```text
https://YOUR_USERNAME.github.io/network-atlas/
```

具体请以GitHub返回的地址为准。网站使用相对资源路径，兼容仓库子路径，不需要改写为根路径`/app.js`等。

## 五、后续修改怎样发布

修改源文件后，提交并推送到`main`即可自动部署。

- 修改定义和协议：`dist/content.js`。
- 修改原理、排查案例：`dist/curriculum.js`。
- 修改图文协议、流程节点和协作关系：`dist/protocol-data.js`。
- 修改协议界面与SVG绘图：`dist/protocols.js`。
- 修改报文字段：`dist/packets.js`。
- 修改计算逻辑：`dist/calculators.js`。
- 修改进阶交互：`dist/learning.js`。
- 修改3D模型：`dist/scene.js`。
- 修改布局：`dist/styles.css`、`dist/study.css`和`dist/protocols.css`。

工作流会重新生成网站内的完整源码下载包，因此在线下载内容会随推送更新。

## 六、常见部署问题

| 问题 | 优先检查 |
| --- | --- |
| Actions没有任务 | `.github/workflows/deploy-pages.yml`是否在仓库根目录对应位置；默认推送分支是否为`main` |
| configure-pages失败 | Settings → Pages是否已经选择GitHub Actions；账号或组织是否允许Pages |
| 部署权限错误 | 仓库Actions策略是否允许所需动作，以及`pages: write`、`id-token: write`权限 |
| 网站404 | 访问的是项目Pages地址而非仓库源码地址；部署任务是否成功 |
| 页面打开但脚本404 | 资源是否与`index.html`一起在`dist/`中；是否保留相对路径 |
| 源码下载404 | 是否运行源码打包步骤；是否从Actions部署了完整`dist/` |
| 修改后还是旧页面 | 确认新提交的部署成功，再刷新或清理浏览器缓存 |

参考GitHub官方文档：

- https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages
- https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site

## 七、验证范围

自动检查验证教学数据关联、协议字段宽度、网络计算边界、3D点击数学和封装流程。它不代替真实浏览器中的视觉与交互测试。正式用于课堂或考试复习时，可先用浏览器按README的人工检查清单走一遍。
