# SAP guided browser example

The complete original-interface SAP browser example is embedded in
`/contribution#sap-demo` and `/project-contribution-sonar#sap-demo`.
The standalone entry is `static/sap-demo/index.html#design` relative to the Wiki
root. The existing Flask / Frozen-Flask pipeline copies this directory; no new
server, API, package dependency or separate Pages workflow is required.

The iframe isolates SAP styles from the Wiki. It includes Design, Analysis and
Data Sources, all 18 guided actions, the original green highlights, maps,
reference diagnostics and exports. The surrounding toolbar provides a new-tab
link and fullscreen where the browser supports it. Desktop downloads and the
SAP source repository are linked in Resources. The desktop release is explicitly
labelled as the v1.4.0rc1 preview, not a final stable release.

## Media and source integrity

- All seven image assets are mapped in `static/sap-demo/wiki-media.json` to the
  team's uploads under `https://static.igem.wiki/teams/6085/wiki/sonar-web/`.
- Six SVG uploads are byte-identical to the reviewed originals. The upload tool
  converted the Apple touch icon from PNG to AVIF; the actual AVIF URL is used.
- The original, unchanged Manrope variable TTF is hosted in the same directory.
  Its SHA-256 is `3ae11c49db0455a3cc33e37d380f20fdb8c7f8b41dc07625c177e3d87a9d6ae6`.
  The OFL notice and original font provenance remain in `static/sap-demo/fonts/`.
- The local image and font binaries are omitted from this embedded package.
  Both map thumbnails and their enlarged viewers use the verified Wiki URLs.
- `data/provenance.json` describes the upstream example export and original
  frontend assets. Its original-source hashes are retained as provenance;
  `site-integrity.json` records the actual embedded package after URL adaptation.
- The sequence engines, saved analysis data and guided-tour adapter are
  byte-identical to the reviewed local demo. Only image / font addresses change
  in the imported HTML, app template and map viewer. The host toolbar is separate.
- The production media middleware leaves `/static/sap-demo/` responses unchanged.
  Otherwise JSON reserialization would break SAP's in-app SHA-256 validation.

SAP-derived code retains its MIT notice in `SAP-MIT-LICENSE.txt`. The parent Wiki
license and footer are unchanged. `SAP-UPSTREAM-WEB-README.md` is the original
standalone export's usage note; the paths in this document apply to this Wiki.

## Scientific scope

Design runs the original sequence engine in the browser. Analysis replays saved
real-data outputs; it does not accept new FCS files or recompute their analysis.
The analysis settings are fixed, and progress is stored in browser session
storage. The Design and Analysis cases are independent examples.

The saved 90B sample is labelled 75% AC DNA mass, with 32,207 selected events and
RAS 0.9562602659677871. The model estimate RES is 0.7454898213131972; routine RES
and validated RNA-editing fraction remain unavailable. No transfer validation or
RNA editing percentage is inferred. The package includes 96 reference snapshots
for 32 samples and three populations, not the original raw FCS files.

## Maintenance and checks

After an intentional embedded-source edit, run `python scripts/seal_sap_demo.py`.
Do not change scientific numbers or regenerate snapshots from invented data.
When refreshing from a reviewed SAP export, reapply the verified media mapping,
retain the license notices and verify the data against its upstream export.

Run the Wiki's existing Python suite and these dependency-free Node checks:

```
python -m unittest discover -s tests -v
node tests/sap_demo/reporter_design.cjs
node tests/sap_demo/control_oligos.cjs
node tests/sap_demo/demo_adapter.cjs
```

The checks cover the two embedding routes, subdirectory asset resolution,
production snapshot integrity, media URLs, scientific limits, 117 sequence
checks, 26 control-oligo checks and all 18 guided actions. Browser verification
also walked through Design export, the Analysis handoff, Mock controls, Theta
confirmation, saved sample results, the detail dialog and report export.

## Deployment boundary

Committing this integration to GitHub does not deploy the official iGEM Wiki.
The official GitLab repository must receive the change and its existing pipeline
must succeed. At the integration baseline, the full production asset audit also
reported two unrelated local videos in the Software page:
`static/assets/software/demo/orca-software-demo-20261016.mp4` and
`static/assets/software/puf-tutorial/puf-website-tutorial-en.mp4`.
Those existing video-hosting issues are outside this SAP embedding change.
