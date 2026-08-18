---
name: cardnews-writing
description: Create Korean editorial card-news carousels with upload-ready 4:5 images and a matching editable PowerPoint deck. Use when turning a topic, article, interview, announcement, product, or source material into a readable magazine-style story with slides, captions, alt text, sources, and editable Korean text/photo layouts.
---

# Card News Writing

Create a Korean editorial card-news package that feels like a short article cut into pages: a strong cover, documented photographs, calm text pages, and a clear final reading.

## Workflow

1. Inspect the workspace for existing brand marks, fonts, image helpers, source material, and output conventions. Reuse them before adding anything.
2. Establish the reader, the editor's one-sentence claim, factual sources, intended takeaway, CTA, and visual mode. A topic is not a claim: turn `AI 시대의 교육 변화 5가지` into a specific, supportable point of view.
3. Write a page-by-page, swipeable script before rendering: `claim → setup → complication → evidence → interpretation → close`. Each slide is a paragraph, not an isolated bullet list. Choose the number of slides only after the story is complete; never add a page merely to reach a quota. When the user has asked for text first, hand off this script before laying out cards.
4. Run the Korean editorial pass before placing copy. Preserve all facts, figures, names, direct quotations, source labels, and editorial intent; remove only translation-like phrasing, repetitive rhythm, needless connectors, decorative bullets, and generic AI-style filler. Use `strict` mode for a long, high-stakes, or user-designated script. Follow [references/korean-editorial-pass.md](references/korean-editorial-pass.md).
5. Create `manifest.json` first. Follow [references/manifest.md](references/manifest.md), select a supplied layout for every slide, and keep every rendered slide and editable-PPT field listed there.
6. Build an editable 4:5 PowerPoint deck alongside the upload images. Every Korean line, source line, and photograph must remain a separate PowerPoint object; a full-card PNG is never an acceptable editable deck. Embed the chosen photograph when it is cleared for use. Otherwise leave a removable, labeled photo placeholder. Follow [references/editable-ppt.md](references/editable-ppt.md).
7. Start from the bundled [editorial card system](assets/editorial-card-system/) for upload images and [editable-card-template.pptx](assets/editable-card-template.pptx) for the PowerPoint treatment. Select only the forms the story needs, replace the placeholder copy, mark, and photographs, then render. Do not invent a different visual language for every page.
8. Render upload cards at `1080×1350`. Keep explanatory text within 72px left/right and 80px top/bottom, but let evidence photographs run full width when the selected form calls for it. Keep the matching PowerPoint deck at the same 4:5 ratio.
9. Use user-provided, licensed, archival, or otherwise verifiable photographs when the subject, person, event, or object is central. Use image generation only when an illustration is genuinely necessary and identify it as an illustration. Render Korean text deterministically, never inside a generated image or flattened into a card screenshot.
10. Validate the package:

   ```bash
   node .agents/skills/cardnews-writing/scripts/validate-cardnews.mjs outputs/<slug>
   ```

11. Review the rendered carousel twice at full size and as a 320px-wide contact sheet. Check Korean legibility, page rhythm, photograph relevance, type hierarchy, factual/source clarity, and the visual rules below. Open the PowerPoint too: verify that the title, body, emphasis, source line, photo or placeholder, and mark can each be selected separately. Fix every issue before handoff and record the review in `qa/report.md`.
12. Write platform variants. Instagram gets one complete carousel caption; Threads gets a short lead post plus reply-sized beats. Keep the claim, facts, interpretation, and sources aligned.
13. Read [references/publishing.md](references/publishing.md) before any API or browser publishing. Publish only when the user explicitly asks and the account authorization is available.

## Conversation and handoff

- Speak to the user only in plain, everyday Korean. Never mention internal implementation such as repositories, branches, commits, packages, manifests, validators, scripts, commands, or runtimes.
- Report only what helps the user: what was made, how many cards are ready, whether review passed, where the result is saved, and any choice still needed.
- Keep issue-specific images, editable PowerPoint decks, captions, sources, previews, and review reports inside `outputs/<slug>/`. They are local deliverables and must never be included with the reusable template.
- When asked to show a result, open the absolute `outputs/<slug>` folder on macOS and say in Korean that the result folder was opened.
- When reusable material is improved and the request is complete, save and share only reusable skill, template, root `README.md`, or operating-guide improvements. Never include `outputs/`.
- Keep the root `README.md` permanently as the project guide. Do not create another README inside this skill folder.

## Editorial direction

Use the supplied public references as a reading and composition study, never as a brand to copy. The treatment is documentary and restrained: the reader should notice the photograph and the sentence before they notice a design device.

- Start the cover with one concrete assertion, reversal, question, or contrast. Avoid course-title framing such as `~하는 5가지`.
- Write in short Korean sentences. Make line breaks carry meaning and leave an unanswered tension or completed thought at the end of a slide so the next swipe has a reason.
- Make the copy sound edited, not mechanically generated. Vary sentence length and endings across the issue, delete filler rather than replacing it, and retain lists only when a reader must compare, choose, or act. Do not turn concise card copy into literary prose in the name of “humanising” it.
- Put observed facts before the editor's interpretation. A conclusion can be personal or assertive, but distinguish it clearly from documented fact.
- Use photographs as evidence: a person, scene, archival image, product, place, or primary document. Do not use unrelated stock atmosphere merely to decorate a page.
- Use `interview` mode for quotation-led stories and `profile` mode for people or companies. A briefing or how-to story can use the same text-and-evidence forms when it has real visual material.
- Read [references/visual-direction.md](references/visual-direction.md) before selecting typography, image placement, or page rhythm.

## Layout system

Use the five supplied forms. They are intentionally narrow because repetition is the visual identity.

- `cover`: one full-bleed photograph, a lower dark gradient, and a 2–4 line white claim.
- `interview-quote`: a framed portrait or scene on quiet paper, followed by a centered direct quotation.
- `text-image`: black editorial copy in the upper half and one full-width evidence photograph below.
- `image-text`: one full-width evidence photograph above and black editorial copy below.
- `centered-close`: a generous white or paper page with the final reading centered in the middle.

Default story rhythm is `cover → text-image/image-text → text-image/image-text → centered-close`. Use `interview-quote` repeatedly in an interview issue. Do not add decorative “statement”, “data”, masthead, page-number, category-label, or CTA pages simply to make a carousel longer.

Across the issue:

- Use black, white, and the colors already present in the photograph. The only non-photo surface variation is an almost-white, subtle paper texture. Do not introduce an accent colour, graphic badge, chart, icon, sticker, border treatment, or large logo.
- Do not add a page number, masthead, eyebrow label, or footer by default. A small user-owned publication mark may appear at the bottom of a cover and, sparingly, at the lower edge of a story page.
- Headlines use a heavy sans-serif. Reading text uses the same sans-serif. Interview quotations may use a Korean serif. Do not mix decorative display typefaces.
- Underline only the sentence that carries the factual turn or interpretation. The underline is black, straight, and typographic—not a marker stroke or coloured highlight.
- Preserve empty space. The cover is image-led; quote pages have a small framed image and generous quiet space; story pages divide text and image in clear horizontal blocks; the close is centered and unhurried.

Copy `assets/editorial-card-system/` into the issue folder before editing. `card.css` holds the shared canvas and type rules; every named HTML file is a renderable page. Replace the `BRAND` placeholder with a user-owned mark or remove it. Do not put copy inside a generated photograph.

## Output contract

Return one folder containing at least:

```text
<slug>/
├── manifest.json
├── <slug>-editable.pptx
├── slides/01-cover.png …
├── captions/instagram.txt
├── captions/threads.md
└── sources.json
```

`manifest.json` is the source of truth for slide order, dimensions, editable copy, photo placement, alt text, platform captions, sources, and the editorial claim. The PPTX is the user-editable version; the PNG cards are the upload version. Keep generated previews and contact sheets out of the publish list unless the user asks for them.

## Quality gates

- Do not invent names, dates, prices, eligibility, performance, quotations, or visual evidence.
- Keep a source trail for time-sensitive, numerical, political, legal, medical, or financial claims.
- Make every slide understandable without its caption and describable in useful alt text.
- Keep every editable PPTX at 4:5. Do not rasterize a whole card into one background image. Any user-facing Korean copy must be editable text, and every photo area must be either one replaceable photo object or one removable labeled placeholder.
- At 320px wide, the cover claim must be readable immediately; body copy must remain comfortably readable. Split copy before shrinking it.
- Keep the full-bleed cover photo free of a busy logo stack. Place white type over the dark lower gradient, never across a face when a crop can avoid it.
- On an interview page, center one bordered photograph above the quote. On an explanatory page, use a crisp horizontal divide between the white copy block and the edge-to-edge photograph.
- Make the final slide a conclusion or implication worth saving, not a generic thank-you or engagement prompt.
- Before handoff, confirm that the Korean editorial pass did not change names, numbers, dates, direct quotes, source meaning, or the slide-level claim. Record the mode used and the styles corrected in `qa/report.md`; never claim that this review proves whether a text was AI-generated.
- Reject any page that gains its hierarchy from a coloured accent, a template label, a page number, a decorative illustration, a gradient other than photo contrast, or a fake statistic.
- Do not publish secrets, private source URLs, or unapproved sponsored copy.
