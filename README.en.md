# Network Atlas 3 · 3D Computer Network Learning

[中文](README.md) | [English](README.en.md)

**A 3D learning website for computer networks, with complete Chinese and English versions.** Explore OSI and TCP/IP through interactive hosts and a router, follow encapsulation and hop-by-hop forwarding, and learn protocol mechanisms, packet fields and relationships. Designed for university computer networking courses, independent learning and practical reference.

The Chinese site is at the website root; the English site is at `en/`. Use **中文 / English** in the header to switch languages. Both versions include the same 32 illustrated entries, 29 lessons, five calculators and eight troubleshooting cases.

## Features

- Rotatable 3D hosts and router: select layers, zoom, switch between layered and compact views, auto-rotate and reset.
- Seven-layer OSI and four-layer TCP/IP views with expandable definitions, mechanisms, protocol knowledge and misconceptions.
- A dedicated **Protocol guide** for 32 protocols, formats, mechanisms and link technologies, organized by model and layer with keyword filtering.
- **32 workflow diagrams and 133 selectable steps**: message sequences or processing flows with synchronized explanations and highlighting; previous, next and restart controls.
- Relationship diagrams with links to related entries. Definitions, fields and relationships can be expanded independently.
- Navigate between a selected 3D layer and its illustrated protocol entries.
- HTTP/TCP and DNS/UDP encapsulation, hop-by-hop forwarding, TCP handshakes and closing, and UDP loss/reordering labs.
- 29 deeper lessons, TCP/UDP/IPv4/Ethernet field explorers, five calculators and eight troubleshooting cases.
- Complete source download and automatic GitHub Pages deployment.

The site has no quizzes, separate model-comparison screen or interview question section.

## Run locally

No third-party npm dependencies or compilation are required. English assets are generated from shared sources and `locales/en.json`. With Python 3 installed, run from the repository root:

```bash
python scripts/build_locales.py
python scripts/package_source.py --output dist/network-atlas-source.zip
python -m http.server 8000 --directory dist
```

Open `http://localhost:8000` for Chinese or `http://localhost:8000/en/` for English, then select **Protocol guide**. On Windows, `py` can replace `python`. Use HTTP; opening HTML directly from disk may prevent ES modules from loading.

## Checks

With Node.js 18 or newer:

```bash
node check.mjs
```

Checks cover module/resource links, complete protocol coverage in both models and languages, diagram nodes and relationships, all 32 entries and their steps, model switching, calculation boundaries, encapsulation and 3D mathematics. DOM simulation does not replace browser layout and touch checks.

To check whether generated English assets are current:

```bash
python scripts/build_locales.py --check
```

## GitHub Pages

See [the deployment guide](docs/GITHUB_PAGES.en.md).

1. Upload all contents of the extracted `network-atlas/` directory to your repository root, including `.github/`.
2. In **Settings → Pages → Source**, select **GitHub Actions**.
3. Push to `main` or manually run the deployment workflow in Actions.
4. Open the Pages address returned by GitHub.

The workflow generates English assets, checks both languages, rebuilds the source ZIP and deploys all of `dist/`. Resources and language links use relative paths and support `/<repository-name>/`. No API keys, ChatGPT account, database or runtime CDN are needed.

## Source layout

| File | Purpose |
| --- | --- |
| `dist/index.html` | Chinese entry page and navigation |
| `dist/en/` | Generated complete English site, sharing styles with Chinese |
| `locales/en.json` | English translations for interface, accessibility labels and learning content |
| `scripts/build_locales.py` | Generates English assets; `--check` verifies freshness |
| `dist/app.js` | Main 3D interface and protocol-page coordination |
| `dist/scene.js` | WebGL geometry, camera, picking and compatible projection |
| `dist/content.js` | Layers, core protocols and transport labs |
| `dist/protocol-data.js` | 32 entries, nodes, 133 steps, relationships and classification |
| `dist/protocols.js` | Protocol interface, SVG diagrams, filtering and related-entry navigation |
| `dist/protocols.css` | Responsive protocol-page and diagram styles |
| `dist/flows.js` | Encapsulation flows |
| `dist/curriculum.js` | Deeper principles and troubleshooting cases |
| `dist/packets.js` | Packet fields and explanations |
| `dist/calculators.js` | Network calculations |
| `dist/learning.js` | Principles, fields, calculators and troubleshooting sections |
| `dist/styles.css`, `dist/study.css` | Main interface and learning-section styles |
| `check.mjs`, `tests/ui-smoke.mjs`, `tests/locales.mjs` | Data, numerical, interaction and language validation |
| `scripts/package_source.py` | Complete source ZIP packaging |
| `.github/workflows/deploy-pages.yml` | GitHub Pages deployment |
| `docs/` | Deployment and content-scope documentation |

## Extend illustrated protocol content

Each entry in `dist/protocol-data.js` includes `layer`, `kind`, `role`, `diagram`, `actors`, `steps`, `links`, `focus` and standard references.

- `sequence` draws message interactions. Step `from/to` values index participants; equal indices indicate local processing.
- `flow` draws processing order, with up to six nodes arranged in a serpentine layout.
- Each step has a diagram label and explanation. A red × marks example loss.
- `links` describe transport, formats or functional cooperation and point to another entry. They do not define a mandatory encapsulation stack.
- The original 23 entries reuse definitions from `content.js`; additional entries are defined in `protocol-data.js`.

SVG diagrams are generated by code and remain editable without purchased images or models. After changing Chinese content, add the corresponding English translation to `locales/en.json`, run `python scripts/build_locales.py`, then checks and packaging. Do not edit generated files in `dist/en/` directly. Missing translations fail generation, helping keep both sites complete. IDs, structures, algorithms and controls remain consistent across languages.

## Manual browser checks

- Desktop and mobile: navigation works and the page has no horizontal overflow. Wide diagrams scroll inside their frame.
- Languages: both entry pages, language links, help and source downloads work. Check the following features in each language.
- Model switching: classification, entry counts and return-to-3D positions remain correct.
- Protocols: filtering, diagram selection, Enter/Space activation, previous/next and restart work; explanations match highlighting.
- Relationships: nodes and cards navigate correctly; expanded sections retain appropriate state.
- 3D: rotate, zoom, select layers, reset, compact view and return from protocols display correctly.
- Further learning: all four sections, fields and calculators remain available.
- Download: the source archive can be extracted, checked, served and deployed independently.

## Teaching scope

The model illustrates functions, not seven hardware blocks inside a host. Labs and diagram steps do not send real network traffic.

Classification reflects function and actual carriage. Presentation and session entries include functional examples; UTF-8, JSON, sessions, PHY and media are labeled by type. BGP serves routing control but uses TCP, so it appears at the application layer. TCP and UDP belong to transport; the four-layer model is TCP/IP.

Diagrams show typical flows, with omitted conditions stated below. The 32 common entries do not replace standards or a complete course. See [the content map](docs/CONTENT_MAP.en.md); entries reference applicable RFC or IEEE material.

Interaction inspiration: [GordenSun/LearningCell](https://github.com/GordenSun/LearningCell). The network scenes, teaching content and code were independently implemented without copying its models or source.
