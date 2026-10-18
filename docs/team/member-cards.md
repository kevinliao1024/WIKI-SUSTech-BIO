# ORCA member cards

The live `/team` route uses `wiki/pages/team.html` and the reusable macro in
`wiki/components/team/member_card.html`. It reads `members` from the front matter
of `docs/team/team.md`; no route edits are needed to add another person.

## Add a portrait and personal sentence

```yaml
  - name: Preferred full name
    number: "18"
    photo: https://static.igem.wiki/teams/0000/your-approved-portrait.avif
    photo_position: "50% 35%"
    quote: |-
      The member's own words.
    quote_lang: en
    roles:
      - label: Design
        icon: design
      - label: Outreach
        icon: outreach
```

The URL above is a shape example, not a working upload. Use the URL returned by
the team's iGEM uploads tool. For a repository asset, omit `photo` and use
`photo_asset: assets/team/portraits/name.avif`. This goes through Flask's static
URL generation, including relative paths in Frozen-Flask builds.

- Supply the full preferred name. `card_name` optionally sets a shorter displayed name.
- Supported role icons: `design`, `outreach`, `wet`, `dry`, `other`, `compute`,
  `video`, `interview`, `inclusivity`, `illustration`.
- An empty role list shows the neutral “Team 2026” label; no workstream is inferred.
- Student Leader stays in the role data but renders once as a compact badge at
  the top right of the portrait, outside the bottom tag list. The card's accessible
  description includes both the badge and the remaining roles.
- `role_layout: two-rows` keeps four or five bottom tags in two compact rows;
  the last three share row two as text-only pills. Chenfan Liao uses this layout:
  HP on the first row and Wiki, Inclusivity, Builder on the second row, keeping
  Builder in column three and the identity block below the face.
- Empty `quote` shows an explicit pending message, without quotation marks.
- Keep one-liners around 10–100 English characters or 5–35 Chinese characters.
  Longer text wraps and shrinks to fit, with scrolling for the complete quote.
  Set `quote_lang: zh` for a Chinese one-liner. `quote_accent` optionally
  highlights an exact phrase in pink, without changing the sentence.
- Supply preferred line breaks using YAML `|-`. All content is escaped as text.
- `photo_position` accepts a CSS object position. Change it to protect a face
  during the browser's 3:4 crop. `photo_scale` (default 1.35) and
  `photo_origin` (default "50% 65%") set a reversible display zoom;
  the source image itself is not cropped or retouched.
- Quotes are imported verbatim from Sheet1 column B of the supplied workbook.
  Confirmed aliases: Pearl Sun → ping_sun, Lorraine Liu → xinyi_liu_advisor,
  Steven → muyin_guo. Hengwei Su and Xueyin Lu are Instructors per user.
  Current displayed names are Ping Sun (source alias Pearl Sun) and Muyin GUO
  (source alias Steven), as requested by the user.
  PI contains placeholder cards for Zefeng Wang (Primary PI), Fuxing Zeng and
  Min Zhang (Secondary PI), confirmed from the supplied screenshot. Their
  portraits and quotes remain empty. `category` accepts `team-members`, `advisors`,
  `instructor`, or `pi`.
- Desktop widths of 1200 px or more use eight cards per row. The current
  fifteen team members occupy two rows. Jacky Man-leuk Yuen is listed among the
  five Advisors, as confirmed by the user. Smaller screens reduce the column count.
  Every row is centered, including partially filled rows in Advisors and
  Instructor. All categories retain the same card width at a given breakpoint.
- Quotes remain complete on the card back; long quotes use a scrollable reading
  surface. The card itself is the reading surface; there is no separate quote control.

## Portraits and compression

Originals stay in `wiki相关文档/队伍合照&单人照_副本`. Web derivatives are in
`static/assets/team/portraits/`; the adjacent compression manifest records source
dimensions, output dimensions, encoder settings, and every file's size.

The compression corrects EXIF display orientation, preserves the full composition
and color profile, and uses AVIF. It performs no face generation, retouching,
sharpening, background replacement, or facial changes. The page applies only a
lower-edge readability gradient over the unfiltered color portrait.

Before publishing, upload the new images and fonts through the iGEM uploads tool
and replace local asset references as required by the repository's release process.
The four added portraits (Huiwen Ma, Junming Feng, Xueyin Lu and Yanfei Pu)
use their confirmed `static.igem.wiki/teams/6085/wiki/team/*.avif` URLs.

## Reference and asset provenance

- Primary card reference: original conversation attachment `image(4).png` (764 ×
  520): purple/pink frame, color portrait, large name, icon pills; black quote side.
- Secondary: questionnaire scroll originals, supplied in the same conversation.
  `questionnaire-scroll.png` and `questionnaire-orca.png` are unmodified copies.
- `image(5).png` is the team member's note about choosing an orca character.
  Its cloud-storage `/mnt/data` path does not exist on this Mac; the original
  conversation's local attachment paths were used instead.
- Cards contain no whale mascot or ORCA corner branding.
- Display/body fonts: the existing ORCA Wiki skill's Futura Bold / Extra Black
  files. Handwriting: Kalam Bold, from the Google Fonts repository under the
  included SIL OFL license: https://github.com/google/fonts/tree/main/ofl/kalam.
- No REA/reverse-engineering skill was found in the available skill catalog,
  installed Codex/Claude skill files, or Wiki configuration. Do not claim that
  REA was executed. Use the recorded reference/render/compare checks instead.

## Progressive enhancement

The unenhanced document exposes both faces in reading order. After JavaScript
initializes, one native button covers the card: pointer hover flips it on desktop, while click /
Enter / Space toggles it on touch and keyboard devices; Escape returns the portrait.
The button exposes `aria-pressed` and describes the currently shown roles or quote;
the opposite face is hidden from assistive technology. Reduced motion removes the
turn transition. Missing image requests show an explicit fallback.

## Package compilation

Clicking `ORCA_TEAM.pkg` starts the compilation log; waiting or scrolling does
not enter the roster. Background scrolling stays locked from the puzzle opening
through the blurred preview and compilation, then is restored when the roster
opens, including reduced-motion entry. The two log columns type one line at a time and scroll to
the newest line. Each member's `*_skill.md` appears once, followed by linking
and completion lines. Typing and line changes run at 1.1× speed. With the current
roster the sequence takes about 8.4 seconds, including the unchanged final reading
pause. The four questionnaire illustrations
use the verified iGEM uploads `team/pkg1.avif` through `team/pkg4.avif`,
configured once in `team.md` under `package_frames`. They are preloaded before the first click and play in the explicit order
1 → 2 → 3 → 4 → 1 → 2 → 3 → 4. Each image gets its full hold after loading;
delayed timers advance one frame instead of jumping ahead. Completion waits for
both the code and the second image cycle; slow loads can extend the sequence.
A bounded image-load fallback prevents an unavailable asset from trapping the
page. A 1.4-second package pop and “Unpacked” status
then signal completion before the longer particle transition reveals the cards.
The pseudo-code is white, with pink prompts on the extract lines.
The completed package and both full logs then remain in a compact header above
the Team members divider, using about one third of the viewport. Particles leave
that package icon and spread toward the cards. The header displays five unpacked
folders: Dry Lab, Wet Lab, Human Practices, Design and Wiki. These folders have no
links or membership assignments yet. The header also has a static fallback when
JavaScript is unavailable. Hovering over a folder opens its front flap, reveals
a paper sheet, highlights the icon and label, and lifts them together. The hover
area stays fixed to avoid flicker; reduced motion removes the lift and transitions.
The puzzle outline is 17 px on desktop and 14 px on mobile, five times its
previous width. The central light line has been removed. When blur appears,
the four letters in “Team” fall in sequence, bounce, and settle into one row;
reduced motion displays the title immediately.
Reduced motion presents the log without typing or scrolling and opens the roster
after a short pause. Switching to reduced motion while compiling also completes
the transition, so the disabled package button cannot strand the page.

Member roles are separate, editable tags and support multiple workstreams per
person. The 18 October verbal updates are recorded directly in `team.md`;
personal tags such as Inclusivity, Interview, Video Production, Hand-drawn Artist
and Supercomputing Contest do not imply any folder-to-member links.
