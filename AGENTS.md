# Shared Wiki workspace

Read `README.md`, `CLAUDE.md`, and `docs/plans/2026-10-11-task-coordination.md` before editing.

## One local project

- All Wiki tasks deliver into this repository. Check `pwd`, `git status --short --branch`, and `git worktree list` at the start of work.
- Separate chat/project entries or preview ports do not mean separate copies of the source. Do not replace this checkout with another task's snapshot or switch its branch while other tasks are working.
- `/` uses `wiki/pages/home.html`. `/next` is the residue-112 review page, `wiki/pages/home_next_structure.html`. Keep that review separate until the user approves promotion.
- `public/` is generated output. Edit `wiki/`, `static/`, `assets/`, or the appropriate content source instead. Put persistent design deliverables inside this repository as well as any chat preview.

## Prevent cross-task overwrites

- Preserve all pre-existing changes, including untracked files. Never run broad restore/reset/clean operations or copy an older full file over the live file.
- Use the module boundaries in the coordination document. Keep new features in their own component/style/script files and limit shared entry-point changes to small patches.
- Shared integration files include `app.py`, `wiki/pages/home*.html`, `wiki/layout.html`, `wiki/menu.html`, `static/onetake/onetake.js`, `static/onetake/onetake.css`, `static/wiki.js`, `static/menu-refinements.css`, `wiki_content.py`, dependency manifests/lockfiles, shared tests, and repository instructions.
- Before editing shared integration files, acquire the cooperative lock by creating `.local-task-locks/shared-integration/` with an atomic directory creation (create its parent first). Record the chat ID, affected files, and start time in `owner.json` inside it. If creation reports that it already exists, do not edit shared files; inspect the owner and continue independent work. Do not delete another task's lock merely because it is old.
- While holding the lock, reread the live file and its diff, make the smallest patch, inspect the resulting diff, and run relevant checks. Release only your own lock when finished. This is a cooperation rule, not an operating-system write barrier; tools and already-running chats must follow it for it to protect writes.
- Both home templates share animation modules but have separate markup. When editing common home content, check both templates; preserve `/next`'s structure component and keep it out of `/`.
- Use task-specific temporary build destinations, test output folders, browser profiles, and available preview ports. Do not rebuild shared `public/` concurrently or stop another task's server.
- Before finishing, list actual changed files, checks, and any work still confined to a preview. Preserve the current local backup; restore individual files only after comparing them with live changes.

## Verification

- Run the existing checks relevant to the affected module. The coordination document records the checks used for the current combined state.
- A passing test does not prove that future concurrent writes are safe. Report observed overlap and remaining uncertainty honestly.
