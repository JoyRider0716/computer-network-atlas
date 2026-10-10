#!/usr/bin/env python3
"""Generate the English site from shared Chinese sources and reviewed translations.

Only text is translated: both sites keep identical algorithms and controls.
Use --check to verify the committed English output is up to date.
"""
from pathlib import Path
import argparse
import json
import re

ROOT = Path(__file__).resolve().parents[1]
HAN = re.compile(r'[\u3400-\u9fff]')


def render():
    translations = json.loads((ROOT / 'locales/en.json').read_text(encoding='utf-8'))
    if any(not key or not value for key, value in translations.items()):
        raise ValueError('Empty translation key or value')
    pattern = re.compile('|'.join(re.escape(key) for key in sorted(translations, key=len, reverse=True)))
    sources = sorted((ROOT / 'dist').glob('*.js')) + [ROOT / 'dist/index.html']
    for source in sources:
        text = source.read_text(encoding='utf-8')
        translated = pattern.sub(lambda m: translations[m.group()], text)
        translated = translated.replace('./network-atlas-source.zip', '../network-atlas-source.zip')
        if source.suffix == '.html':
            translated = translated.replace('lang="zh-CN"', 'lang="en"', 1)
            translated = translated.replace('href="./favicon.svg"', 'href="../favicon.svg"')
            for css in ('styles.css', 'study.css', 'protocols.css'):
                translated = translated.replace(f'href="./{css}"', f'href="../{css}"')
            translated = translated.replace('hreflang="zh-CN" href="./"', 'hreflang="zh-CN" href="../"')
            translated = translated.replace('hreflang="en" href="./en/"', 'hreflang="en" href="./"')
            translated = translated.replace('Network Atlas<small>NETWORK ATLAS</small>', 'Network Atlas<small>3D NETWORK LEARNING</small>')
            translated = translated.replace('data-language="zh" href="./" lang="zh-CN" aria-current="page"', 'data-language="zh" href="../" lang="zh-CN"')
            translated = translated.replace('data-language="en" href="./en/" lang="en"', 'data-language="en" href="./" lang="en" aria-current="page"')
        else:
            translated = translated.replace("'zh-CN'", "'en-US'")
        # Comments can retain source-language notes. The language-switch label is intentional.
        unresolved = [(i, line) for i, line in enumerate(translated.splitlines(), 1)
                      if not line.lstrip().startswith('//')
                      and HAN.search(line.replace('>中文</a>', '></a>'))]
        if unresolved:
            excerpt = '\n'.join(f'{source.name}:{i}: {line}' for i, line in unresolved)
            raise ValueError('Missing English translations:\n' + excerpt)
        yield ROOT / 'dist/en' / source.name, translated.rstrip() + '\n'


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--check', action='store_true')
    args = parser.parse_args()
    outputs = list(render())  # Validate everything before writing any generated file.
    for path, text in outputs:
        if args.check:
            if not path.exists() or path.read_text(encoding='utf-8') != text:
                raise SystemExit(f'English output is stale: {path.relative_to(ROOT)}; run python scripts/build_locales.py')
        else:
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_text(text, encoding='utf-8')
    print(f'PASS: {len(outputs)} English assets ' + ('are current' if args.check else 'generated'))


if __name__ == '__main__':
    main()
