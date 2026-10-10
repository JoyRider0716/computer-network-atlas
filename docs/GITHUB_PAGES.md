# GitHub Pages 部署

网站的运行文件位于 `dist/`，部署工作流位于 `.github/workflows/deploy-pages.yml`。工作流会检查源码、生成下载包，再将 `dist/` 发布到 GitHub Pages。

## 本地运行

在仓库根目录运行：

```bash
python scripts/package_source.py --output dist/network-atlas-source.zip
python -m http.server 8000 --directory dist
```

打开 <http://localhost:8000>。Windows 可用 `py` 代替 `python`。源码打包供页面下载按钮使用；仅浏览网站时可省略第一条命令。

安装 Node.js 18 或更高版本后，可运行 `npm run check`。项目无需安装 npm 依赖。

## 启用部署

1. 将项目放入自己的 GitHub 仓库。若使用源码 ZIP，解压后将 `network-atlas/` 内的内容作为仓库根目录，保留 `.github/`。
2. 在仓库的 **Settings → Pages → Build and deployment → Source** 中选择 **GitHub Actions**。
3. 推送到 `main`，或在 **Actions** 中选择 **Deploy Network Atlas to GitHub Pages**，点击 **Run workflow**。
4. 部署成功后，从部署任务或 **Settings → Pages** 打开网站地址。

项目仓库的 Pages 地址通常为 `https://用户名.github.io/仓库名/`。页面资源使用相对路径，可直接在仓库子路径下运行。私有仓库能否使用 Pages 取决于账号方案与组织策略。

## 更新网站

修改后提交并推送到 `main`，工作流会更新网站及源码下载包。若使用其他发布分支，请同步修改工作流中的 `on.push.branches`。

教学内容与模块的位置见 [README](../README.md#项目架构)，内容目录见 [CONTENT_MAP.md](CONTENT_MAP.md)。

## 排查部署问题

| 现象 | 检查项 |
| --- | --- |
| 没有运行部署任务 | 工作流路径是否正确，推送分支是否与 `on.push.branches` 一致 |
| `configure-pages` 失败 | Pages 是否选择 GitHub Actions，账号或组织是否允许 Pages |
| 权限错误 | 仓库 Actions 策略及工作流中的 `pages: write`、`id-token: write` 权限 |
| 网站返回 404 | 部署任务是否成功，访问的是否为 Pages 地址 |
| 脚本或样式返回 404 | 文件是否完整放在 `dist/`，页面中是否保留相对路径 |
| 源码下载返回 404 | 源码打包步骤是否成功，ZIP 是否包含在部署文件中 |
| 页面仍是旧内容 | 最新提交是否部署成功；刷新页面并检查浏览器缓存 |

自动检查覆盖数据、运算和交互逻辑。发布前还应在桌面和手机浏览器中检查模型标签、图文布局、导航及源码下载。

参考：[GitHub Pages 自定义工作流](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)。
