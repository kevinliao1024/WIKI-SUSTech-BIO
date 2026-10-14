# DBTL component directions · 2026-10-12

The initial five interactive proposals were rejected by the user as unattractive.
They are retained below as an earlier exploration, not the current recommendation.
The current visual direction board is `dbtl-form-studies-v2.png`, generated with
the built-in image generation tool: COLOR LOOP, SOFT ROTOR, LIVING WEAVE.
SOFT ROTOR is the recommended new direction for its tangible form and readable
external labels. The board is conceptual artwork; it is not an implemented
interactive component, and its small alternate states are illustrative.
The exact generation prompt is retained in `form-studies-v2-prompt.md`.

Five interactive proposals: 分瓣环, 轨道罗盘, 折带循环, 分子四叶, 机械刻度盘.
The first and third are recommended for clear navigation and distinctive shape,
respectively. Each proposal contains four stage controls, an iteration selector,
a rotating marker or form, and a local destination-chapter preview.

`dbtl-directions.html` is the editable fragment used for the in-chat design board.
The five PNGs show the proposals at their default Design stage, after rotation
has settled. The chapter copy is illustrative navigation content, not research
results. The designs are proposals; this turn did not replace the live
Engineering component or edit any shared integration file.

Validation: five variants rendered, all four stages and both cycles responded,
360px viewport widths had no horizontal overflow, reduced motion disabled
transitions, and no page errors were observed. Default desktop previews were
visually inspected; orbit and molecule center labels received opaque backing
to keep their linework from crossing the text. `git diff --check` passed.

The fragment is also retained in the chat's durable visualization directory.
No shared public build, commit, or deployment occurred. Other workspace changes
present at the start were preserved.
