# Network Atlas

[中文](README.md) · [English](README.en.md)

## Purpose

An interactive website for learning computer networking. Rotate a two-host and router model to explore seven-layer OSI and four-layer TCP/IP functions, and follow encapsulation, hop-by-hop forwarding and decapsulation.

The protocol guide contains diagrams and explanations for 32 protocols, formats and network technologies. The site also includes TCP establishment and closing, UDP loss and reordering examples, principles, packet fields, network calculators and troubleshooting cases. All demonstrations run in the browser with simulated data.

## Usage

The site uses static HTML, CSS and JavaScript, with no third-party npm dependencies. With Python 3 installed, serve it from the repository root:

```bash
python -m http.server 8000 --directory dist
```

Open <http://localhost:8000> for Chinese or <http://localhost:8000/en/> for English. Switch languages in the header. On Windows, use `py` in place of `python`. Access the site over HTTP so the browser can load ES modules.

- **Explore layers**: switch models and select a layer or 3D block. Drag to rotate and scroll to zoom. Play or step through communication below the model.
- **Protocol guide**: choose entries by layer and select diagram arrows or step buttons. Relationship nodes open related entries.
- **TCP / UDP labs**: select a handshake, connection closing or UDP example to inspect packets and state changes.
- **Learn more**: read principles, inspect packet fields, use calculators and explore troubleshooting cases.

After changing Chinese text, update `locales/en.json` and regenerate English assets:

```bash
python scripts/build_locales.py
```

Generate the archive used by the source-download button:

```bash
python scripts/package_source.py --output dist/network-atlas-source.zip
```

Run checks with Node.js 18 or later:

```bash
npm run check
```

GitHub Pages instructions are in the [deployment guide](docs/GITHUB_PAGES.en.md).

## Architecture

The browser loads the entry pages, scripts, styles and teaching data directly from `dist/`. Chinese files are maintained there; English files in `dist/en/` are generated from the same sources and translation map, and share the stylesheets.

| File or directory | Responsibility |
| --- | --- |
| `dist/index.html`, `dist/app.js` | Entry page, navigation, model selection and demonstrations |
| `dist/scene.js` | WebGL models, camera, layer picking and 2D fallback |
| `dist/content.js`, `dist/flows.js` | Layer definitions, core protocols, transport labs and encapsulation |
| `dist/protocol-data.js`, `dist/protocols.js` | Protocol data, SVG diagrams, filtering and related entries |
| `dist/curriculum.js`, `dist/packets.js`, `dist/calculators.js` | Principles and cases, packet fields and calculation logic |
| `dist/learning.js` | Principles, fields, calculators and troubleshooting interactions |
| `dist/styles.css`, `dist/study.css`, `dist/protocols.css` | Main interface, learning sections and protocol-page styles |
| `check.mjs`, `tests/` | Data relationships, calculation boundaries and interaction checks |
| `scripts/build_locales.py`, `locales/en.json`, `dist/en/` | Translation map, English generation and generated assets |
| `scripts/package_source.py` | Source ZIP generation |
| `.github/workflows/deploy-pages.yml` | Generate English, check, package and deploy `dist/` to GitHub Pages |
| `docs/` | Deployment instructions and teaching-content map |
