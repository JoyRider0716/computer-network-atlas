#!/usr/bin/env python3
"""Package all distributable source; no Git history, hosting IDs or credentials."""
from __future__ import annotations
import argparse
from pathlib import Path
import zipfile

ROOT = Path(__file__).resolve().parents[1]
DIRECTORIES = ("dist", "scripts", "docs", "tests", ".github")
FILES = ("README.md", "package.json", "check.mjs", ".gitignore")

def source_files():
    for name in FILES:
        path = ROOT / name
        if path.is_file():
            yield path
    for name in DIRECTORIES:
        directory = ROOT / name
        if directory.is_dir():
            for path in sorted(directory.rglob("*")):
                if not path.is_file() or "__pycache__" in path.parts:
                    continue
                if path.suffix in (".zip", ".pyc", ".log"):
                    continue
                yield path

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--output", default="dist/network-atlas-source.zip")
    args = parser.parse_args()
    output = Path(args.output).resolve()
    output.parent.mkdir(parents=True, exist_ok=True)
    paths = sorted(source_files(), key=lambda path: path.relative_to(ROOT).as_posix())
    with zipfile.ZipFile(output, "w", zipfile.ZIP_DEFLATED, compresslevel=9) as archive:
        for path in paths:
            relative = path.relative_to(ROOT).as_posix()
            # Deterministic metadata makes unchanged exports identical.
            info = zipfile.ZipInfo("network-atlas/" + relative, date_time=(2026, 10, 10, 0, 0, 0))
            info.compress_type = zipfile.ZIP_DEFLATED
            info.external_attr = 0o100644 << 16
            archive.writestr(info, path.read_bytes())
    with zipfile.ZipFile(output) as archive:
        if archive.testzip():
            raise RuntimeError("Source ZIP integrity check failed")
    print(f"Source ZIP: {output} ({len(paths)} files, {output.stat().st_size} bytes)")

if __name__ == "__main__":
    main()
