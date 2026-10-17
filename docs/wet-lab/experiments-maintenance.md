# Experiments page maintenance

`/experiments` is the protocol library under Wet Lab. It uses the shared site shell
and the Model / Notebook palette and typography. The catalog and PDF links are
server-rendered; JavaScript adds an overview landing view, a separate How to read
guide, category filtering, search and a lazy modal PDF reader.
Protocol cards contain only an ID and name. Versions and download links are in
the reader. The overview and guide are maintained in `wiki/components/experiments/`.
The guide follows the maintained library classification and reading routes.
Every original PDF remains available without JavaScript or embedded-PDF support.

The current import contains **36 PDFs in eight categories**. Files came from the
current numbered folders in the team's maintained `Protocols` library, not from
`PDF_Collection`, historical versions, manufacturer sources or working folders.
The source index lists RP07 but there is no current RP07 PDF; it is intentionally
absent from the downloadable catalog. RP03–RP06 follow the current numbering.

To refresh the deployment copies, run from the repository root:

```bash
python scripts/sync_experiment_protocols.py /path/to/Protocols
```

This updates `docs/wet-lab/experiments.md` and copies the PDFs into
`static/experiments/pdf/`. The front matter records each ID, source title,
version, file size and SHA-256 checksum. Do not edit the copied PDFs: update
the maintained source library and import again. If a source is removed or renamed,
review and remove its obsolete deployment copy separately; the importer does not
delete files. The page body is a short introduction. The category descriptions
live in the importer; the title and version come from each source `protocol.json`.

Check with:

```bash
python -m unittest discover -s tests -p 'test_experiments.py' -v
node tests/experiments_browser.mjs
```

The browser check accepts `EXPERIMENTS_BASE`, `EXPERIMENTS_OUTPUT` and
`PLAYWRIGHT_MODULE`. It uses an installed Chrome and does not add a production
dependency. Include a frozen-build/link audit before publishing. PDFs are shipped
as same-origin static assets; no external PDF viewer or CDN is used.
