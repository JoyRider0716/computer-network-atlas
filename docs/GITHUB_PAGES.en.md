# GitHub Pages deployment

This independent static 3D computer network learning website includes sources, teaching data, rendering, interaction, tests and deployment configuration. It needs no ChatGPT account, API keys, database or paid model service.

## Extract and prepare

The extracted `network-atlas/` directory should contain `README.md`, `README.en.md`, `package.json`, `dist/`, `locales/`, `scripts/` and `.github/`. Upload its contents to the repository root, without adding another enclosing directory. Keep the hidden `.github/` directory, which contains the workflow. The source archive excludes Git history and credentials.

## Run locally

With Python 3:

```bash
python scripts/build_locales.py
python scripts/package_source.py --output dist/network-atlas-source.zip
python -m http.server 8000 --directory dist
```

On Windows, use `py` if necessary. Visit `http://localhost:8000` for Chinese or `http://localhost:8000/en/` for English; header links switch languages. Do not open HTML directly from disk because ES modules require supported HTTP loading.

With Node.js 18 or newer, run `node check.mjs`. No `npm install` is necessary.

## Create a GitHub repository

Create a repository such as `network-atlas`. Public repositories normally support Pages with GitHub Free; private-repository support depends on account plans and organization policies. Publish through GitHub Desktop or, for a new uninitialized repository:

```bash
git init
git add .
git commit -m "Add Network Atlas learning website"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/network-atlas.git
git push -u origin main
```

Replace the username and repository name. For an existing repository, follow its current state rather than blindly adding another origin.

## Enable Pages

1. Open **Settings → Pages**.
2. Choose **GitHub Actions** under **Build and deployment → Source**.
3. Open the **Deploy Network Atlas to GitHub Pages** workflow in **Actions**.
4. If the first push preceded Pages activation, select **Run workflow**.
5. Wait for language generation, checks, source packaging, upload and deployment.
6. Open the actual address reported by the deployment or Pages settings.

A project address typically resembles `https://YOUR_USERNAME.github.io/network-atlas/`, with English at `en/`. Use the address GitHub reports. Relative resources and language links support project subpaths.

## Publish changes

Edit shared files in `dist/` and corresponding translations in `locales/en.json`; run `python scripts/build_locales.py`. Do not directly edit generated `dist/en/` files. Commit and push to `main` for automatic deployment. The workflow regenerates English, validates both languages and rebuilds the source ZIP, so downloaded sources follow the deployed revision.

## Troubleshooting

| Problem | Check first |
| --- | --- |
| No Actions run | Workflow location and the `main` trigger branch |
| configure-pages fails | Pages source and account/organization policy |
| Permission failure | Allowed actions, `pages: write` and `id-token: write` |
| Site 404 | Actual Pages URL and successful deployment |
| Script or English-page 404 | Complete `dist/` including `en/`, with relative paths preserved |
| Source download 404 | Packaging step and deployment of the complete output |
| Old content | Latest deployment success, then browser cache |
| Missing English translation | Add the exact source text and English value to `locales/en.json`, then regenerate |

Official references:

- https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages
- https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site

## Validation scope

Automated checks exercise data links, field widths, numerical boundaries, 3D picking, encapsulation and DOM interactions in both languages. Use the README browser checklist for visual and touch verification before classroom use.
