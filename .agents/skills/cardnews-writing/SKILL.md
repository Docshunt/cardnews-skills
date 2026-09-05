---
name: cardnews-writing
description: Create Korean editorial card-news carousels with source-backed copy, upload-ready 1080×1350 images, preserved image assets, an editable 4:5 PowerPoint deck, captions, and visual QA records. Use when turning a topic, article, interview, announcement, product, or source material into a readable Korean card-news story.
---

# Card News Writing

Create a source-backed Korean editorial carousel: one clear claim, evidence that advances the story, a restrained visual system, an editable PPTX, and upload-ready final PNGs.

## Workflow

1. Run `bash scripts/cardnews-session-preflight.sh` before work. Inspect incoming `origin/main` changes, approved source decks, brand assets, fonts, source files, crop helpers, and output conventions. This check must never merge, rebase, reset, or overwrite work.
2. Lock the brief: reader, one-sentence editorial claim, tension, evidence, takeaway, visual mode, close, and HSO (`Hook → Story → Offer`). A topic is not a claim. Treat fact, editorial interpretation, and offer as different things.
3. Build a source table before writing. Prefer primary, official, institutional, and original interview/video sources. Google and Pinterest are discovery layers only: trace final facts and images to their original rights-bearing page. Mark unconfirmed facts or rights as unknown; do not fill gaps with invented details.
4. Write the complete 4–10 card script before layout. One card is one readable paragraph within `claim → setup → complication → evidence → interpretation → close`; never add cards merely to meet a count. When the user supplies final script text, every word, number, quotation, order, and requested line break is canonical: place it verbatim and never paraphrase, reorder, or silently “improve” it.
5. Run the Korean editorial pass only before the user has locked the copy. Preserve all facts, figures, names, direct quotations, source labels, and intent; remove only translation-like phrasing, repetitive rhythm, needless connectors, decorative bullets, and generic filler. Follow [references/korean-editorial-pass.md](references/korean-editorial-pass.md).
6. Create `manifest.json`, `text.json`, and `image-plan.json` before rendering. Follow [references/manifest.md](references/manifest.md). Link every slide to layouts, source IDs, image provenance, and editability fields.
7. Start from the approved deck selected in `templates/cardnews/template-registry.json`; duplicate the selected source slides and replace only declared inherited text and image slots. A supplied PPTX is the acceptance benchmark for hierarchy, density, type, image frames, rhythm, whitespace, and object editability—not loose inspiration. Do not rebuild a compatible approved deck from scratch or introduce a new graphic language.
8. Build both outputs from that deck: editable PPTX plus PNG cards at exactly `1080×1350`. Preserve the PPTX page at `11.25×14.0625 in` (`10287000×12858750` EMU). Keep headline, body, emphasis, source label, photo, overlay, and logo separately selectable. A flattened full-card PNG is never an editable PPTX background.
9. Source images in this fixed order: **user-provided original → commissioned/self-shot or official asset → original source found through Google/Pinterest discovery → licensed/public-domain asset → generated non-factual concept only when necessary.** Use real originals for real people, companies, products, interfaces, events, data, and quotes. Preserve originals under `images/originals/`, pre-crop the used copy into `images/used/` with `scripts/prepare-cardnews-image.mjs`, retain aspect ratio, use `cover`, lock the aspect ratio, and inspect each crop after rendering. Never stretch, squash, or axis-scale a photograph; never bake Korean copy into generated imagery.
10. Render a complete draft and validate it:

    ```bash
    node .agents/skills/cardnews-writing/scripts/validate-cardnews.mjs outputs/<slug>
    node .agents/skills/cardnews-writing/scripts/check-cardnews-quality.mjs outputs/<slug>
    ```

    Save the draft and contact sheet under `qa/iterations/01-draft/`. Inspect every card full-size and at 320px wide, then record hierarchy, crop, spacing, contrast, Korean line breaks, rhythm, evidence, and editability findings in `qa/design-iterations.json`.
11. Apply at least one material correction when the draft review identifies an issue, rerender the complete set to the next iteration, and repeat until no issue remains. Only the passing final render goes to `slides/` and `final-images/`. Record final 1–5 scores for hierarchy, legibility, rhythm, image evidence, anti-slop, and editability in `qa/visual-review.json`; every score must be at least 4. See [references/quality-harness.md](references/quality-harness.md).
12. Open the PPTX and check each card: all Korean text, source lines, photos/placeholders, overlays, and marks must be individually editable. Write `qa/report.md`, then create aligned Instagram and Threads variants. Read [references/publishing.md](references/publishing.md) before publishing; publish only with explicit user authorization and account access.

## Template, archive, and batch contract

Read [references/template-and-archive.md](references/template-and-archive.md) before a production edit, batch job, or reusable-rule change. It defines the approved template registry, immutable archive snapshots, verbatim-copy lock, no-distortion image preparation, and repeatable batch builds.

## Editorial and visual system

Use a restrained documentary magazine treatment: the reader notices the image and sentence before any design device.

- Cover: full-bleed evidence photo, separate lower dark fade, 2–4 line white assertion, and a small mark only when appropriate.
- Story: use only `text-image`, `image-text`, or `interview-quote`; keep a straight text/photo divide and repeat two or three inherited forms across the issue.
- Close: quiet `centered-close`, a saved conclusion or real next action—not a generic thank-you card.
- Surface: off-white/white paper, black ink, and photograph colour only. No accent fills, badges, stickers, page numbers, mastheads, fake statistics, generic dashboards, decorative charts, or unrelated stock atmosphere.
- Use evidence images: a real person, scene, archive, product, document, or interface that advances the exact sentence.
- Keep copy short and edited. Put observed fact before interpretation; distinguish source fact from editorial reading.
- If copy overflows or wraps poorly, change the inherited compatible layout or split the story. Do not solve it by shrinking, stacking text boxes, or altering user-locked copy.

Read [references/visual-direction.md](references/visual-direction.md) for five page forms, spacing, photo treatment, review questions, and the source-deck quality bar.

## Typography floor

`22 pt` is a hard floor for every visible PowerPoint text element, including sources, labels, marks, placeholders, and CTA text. For the standing DocsHunt system use: cover title `80 pt`, story heading `38 pt`, body `24 pt` or larger, and emphasized body `28 pt`. In the raster renderer, use `30px` or larger for any visible text. If it does not fit, do not reduce the type.

## DocsHunt logo

For a DocsHunt issue, use only the supplied separate images:

- `assets/brand/docshunt-white.png` on the first cover;
- `assets/brand/docshunt-black.png` on the final closing card.

The logo is secondary and separately editable. It belongs on the first cover and final closing card only; it must never appear on an intermediate slide, be redrawn as text, or be flattened into a photograph.

## Output contract

```text
<slug>/
├── manifest.json
├── text.json
├── image-plan.json
├── <slug>-editable-vN.pptx
├── slides/01-cover.png …
├── final-images/01-cover.png …
├── images/{originals,used}/
├── captions/{instagram.txt,threads.md}
├── sources.json
└── qa/{contact-sheet.png,design-iterations.json,visual-review.json,report.md,iterations/}
```

Keep all issue-specific files under `outputs/<slug>/`; never add them to the reusable skill. `manifest.json` is the source of truth. `sources.json` records a direct URL, type, rights status, and optional retrieval date for each claim or asset; a search result/repost is never enough.

## Conversation and handoff

- Speak to the user in everyday Korean and report only useful outcome, review status, location, and an actual choice that remains.
- When asked to show a result, open `outputs/<slug>/final-images/` when it exists; otherwise open `outputs/<slug>/slides/`.
- When reusable material changes, share only reusable skills, templates, the root README, and operating guides. Never include topic-specific outputs.
- Keep the root `README.md` permanent; do not add another README inside this skill.
