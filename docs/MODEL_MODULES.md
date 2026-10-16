# Model content sources

The current `/model` page is authoritative. Edit `wiki/components/model/module1.html` through `module4.html`, with additions in `wiki/components/model/conclusions/`. The page introduction is maintained in `docs/dry-lab/model.md`.

Synchronize module-repository Wiki documents from these rendered components, including their current figures. Do not import earlier repository Markdown over the current page. The historical importer is disabled.

Obsolete Markdown exports, archived HTML prose and draft downloads have been removed. Historical provenance remains in Git. Scientific input tables, validation splits and evidence assets remain unchanged. Current table/code hashes, image attributes and chapter anchors are checked against `tests/fixtures/model-current-structure.json`; deleted presentation tables must not return.

Run `python -m unittest tests.test_model_modules tests.test_model_conclusions` after changes.
