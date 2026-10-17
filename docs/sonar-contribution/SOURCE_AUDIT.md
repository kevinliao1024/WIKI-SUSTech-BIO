# SONAR Contribution source audit

Review date: 2026-10-17 (Asia/Shanghai). Target: `pdx12320/WIKI_SUSTech-BIO`.
Baseline: remote main `2cc2d5a450d2be9c48ae563bcd2c613bc6c3fd84`.
Local review branch: `codex/sonar-contribution`, isolated from the active Protocol task.

## Route and implementation

User requested Project → Contribution → SONAR. Canonical flat route:
`/project-contribution-sonar`, linked from the existing Contribution page.
Flask also accepts `/project-contribution-SONAR` through existing case normalization.
The frozen host's canonical URL is lowercase. No global navigation redesign.

The page extends the existing Markdown content template, preserving the navigation,
left directory, footer, license, transition and shared reading behavior. Independent
modules live in `static/sonar-contribution/modules/`. Shared registry and hub edits
were made under the repository cooperative lock and verified before releasing it.

## Actual local sources inspected

Paths below are relative to the team source workspace; private machine paths are omitted.

- `REPORTER NEW NEW/program/README.md`, `sonar_app/__init__.py`, reporter designer/engine/vector JS.
- `scientific_reference/RELEASE_MANIFEST.json`: 883 frozen files verified by actual `Platform.verify_release()`.
- `scientific_reference/src/science_api.py` and `core.py`: full-FCS gates, signed linear backgrounds, ratio-of-sums and support policy.
- `scientific_reference/models/context_profiles/context_v1.json` and `models/res_primary/model.json`.
- Real `inputs/S7/MOCK1.fcs`, `MOCK2.fcs`, `50B.fcs`; hashes and event mapping in the local review fixture.
- `Protocols/RP01`, `RP02`, `C04`, `RP06`: maintained Markdown sources and version metadata.
- SAP `static/downloads/construction_manifest.json`: current computational 7,498-bp plasmid / 2,022-bp CDS.

## Important source boundaries

1. RP01 mentions an older 2,027-bp cassette; RP02 mentions a 4,669-bp acceptor.
   Neither is silently relabeled as the current SAP computational reference.
2. The SAP design example is source-generated, not an experimentally used clone.
   Position 18 is adapted C→A during design; target position 16 is the later RNA C→U site.
3. S7 AC/INAC constructs have unresolved exact sequence identity in the scientific manifest.
   The tutorial does not identify them with the computational Universal Reporter.
4. S7 has no linked editor; BFP is not exposed as an editor co-expression gate.
5. S7 same-series RES is exploratory and not qualified for routine use or external transfer.
6. SAP is a local application. No standalone public installer was verified.
7. The human user explicitly authorized the listed protocols, computational plasmid,
   de-identified S7 teaching subset and actual SAP captures for this public repository
   on 2026-10-17: “允许这些资料随页面公开”. Source-copy authorization is resolved.
   Final scientific sign-off and iGEM media hosting remain review items before deployment.

## Hosting

Repository rules require images/fonts on `static.igem.wiki`, code on iGEM infrastructure,
and no third-party runtime CDN. Official Wiki deliverables URL was checked but returned
only a JavaScript shell, so this audit does not claim to have independently read a newer rule revision.
Local captures are review artifacts, not approved published media URLs.
