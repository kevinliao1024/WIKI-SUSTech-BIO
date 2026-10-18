# Engineering overview illustrations

The ten approved chapter PNGs are placed inside their corresponding Overview cards. MODEL is in the shared Dry Lab Overview. Original prose and figures are unchanged.

Desktop: float right at 44% of the content width, capped at 360 px, with a 24 px text gap. Original 5:3 aspect ratios are retained. Text continues below the illustration. Cards contain their floats.

Narrow cards (content width <= 520 px) and phone screens use a centred image above full-width text.

Verification: 30 existing content and Wiki tests passed; all ten images match the approved source SHA-256 values; all ten cards passed desktop (1440 x 1000) and phone (390 x 844) visibility, image-load, containment and overflow checks. Original Markdown prose verified unchanged after removing inserted image tags. Browser screenshots reviewed.

Local preview: http://127.0.0.1:8362/engineering#pod-overview
The original layout was approved by the user for merging to GitHub main.

After incorporating main commit e419845, 25 Wiki tests and 4 of 5 content tests pass. The remaining content test fails for the new Team page because it expects an h2 in Markdown although Team uses a custom template. The failing test, Team Markdown and content loader are byte-identical to origin/main; this is a pre-existing main-branch mismatch, unrelated to these illustrations.
