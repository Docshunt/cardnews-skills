---
name: cardnews-writing
description: Create Korean editorial card-news carousels and cross-platform publishing packages from topics, articles, interviews, announcements, products, or source files. Produce source-backed copy, editable 4:5 PPT originals, 1080×1350 PNG slides, preserved image assets, captions, alt text, and QA records for Instagram and Threads.
---

# Card News Writing

Create one source-backed package that keeps the story, evidence, images, editable original, previews, and publishing copy connected.

## Workflow

1. Inspect the available brand assets, fonts, logo PNGs, existing templates, source files, and output conventions. Reuse them before designing anything. When the user supplies a PPTX as the target quality, treat its rendered slides and editable object structure as the acceptance benchmark—not optional inspiration. Match its hierarchy, density, typography, slide rhythm, evidence use, whitespace, and editability without copying its proprietary copy, logo, exact layout, or imagery.
2. Lock the brief in one line each before writing:
   - reader: who needs this;
   - editorial claim: the one sentence the carousel must prove;
   - reader tension: why this matters now;
   - evidence: the primary facts, numbers, and quotes;
   - Docshunt angle: the startup, growth, AI, or business-plan lens;
   - close: one thing to save or do;
   - visual mode: photo-led, text-led, or quote-led;
   - HSO: Hook → Story → Offer.
3. Build a source table before polishing Korean copy. Prefer official newsrooms, product pages, original interviews, government or institutional records, statistics, and official videos; use trusted media only for cross-checking. Record the claim, direct URL, source text or metric, candidate image, rights status, and target slide. Search snippets, Google Images, and Pinterest are discovery layers only: trace every final image back to its original page and rights. If a fact, image, or permission is not confirmed, leave it marked unknown or use a placeholder; never fill the gap with an invented detail.
4. Separate fact, interpretation, and claim. Fact is what the source directly says; interpretation is the editorial meaning; claim is the carousel's message. Do not write interpretation as fact. Lock dates, numbers, names, and quotations before editorial rewriting.
5. Write the slide plan before rendering. Use one narrative job per slide and a cumulative flow such as `cover → context → story/evidence → complexity → interpretation → application → close`. HSO means a useful hook, a story that earns the conclusion, and a practical saved principle or next action—not a forced sales line. Keep the slide count flexible; remove repeated beats before adding cards.
6. Create `manifest.json` first. Follow [references/manifest.md](references/manifest.md), link each slide to its layout and source IDs, then create the copy-only `text.json` and image replacement map `image-plan.json`.
7. Source images in this order: user-provided originals, commissioned or self-shot work, official press or product assets, official video stills, licensed stock or public-domain material, then AI illustration. Use real originals for real people, companies, products, interfaces, events, statistics, and evidence. Use AI only for abstract concepts or non-factual atmosphere. Keep an unconfirmed image as a placeholder until its original and usage status are verified. Never bake final Korean copy into an AI image.
8. Use an editable 4:5 PPT as the authoring source, then export the user-facing result as full-resolution PNGs from that same file. Unless the user explicitly asks for a deck, present and open the final PNG folder first; keep the PPT only as the editable source behind those images. For PPTX authoring, follow the installed presentation workflow: use the bundled workspace dependencies and `@oai/artifact-tool` from JavaScript, render every slide, inspect each one, and fix overlap, clipping, wrapping, and empty placeholders before delivery. Keep each headline, body, emphasis, source label, logo PNG, photo, and overlay as a separately selectable object; keep the image and dark gradient separate on a cover; never use a flattened card image as the slide background. Read [references/visual-direction.md](references/visual-direction.md) before choosing the visual treatment.
9. Render every slide at `1080×1350` by default (`1080×1440` only when the taller 3:4 treatment is intentional). Keep text within a 72px horizontal and 96px vertical safe area. Preserve the original image and the cropped or corrected used image under `images/originals/` and `images/used/`, and record the source and rights status.
10. Validate and review the complete package:

   ```bash
   node .agents/skills/cardnews-writing/scripts/validate-cardnews.mjs outputs/<slug>
   node .agents/skills/cardnews-writing/scripts/check-cardnews-quality.mjs outputs/<slug>
   ```

   Treat the first render as a draft, never as the delivery render. Save its slides and contact sheet under `qa/iterations/01-draft/`, inspect every slide at full size and 320px width, and record concrete hierarchy, crop, spacing, contrast, line-break, rhythm, and evidence problems in `qa/design-iterations.json`. Apply at least one material design correction supported by that review, rerender the complete deck under the next numbered iteration, and repeat until the final pass has no unresolved issue and every visual score is at least 4. Copy only the final pass into both `slides/` and the user-facing `final-images/`, and copy its contact sheet to `qa/contact-sheet.png`. Follow [references/quality-harness.md](references/quality-harness.md). Record the final independent vision or design pass in `qa/visual-review.json`; score content hierarchy, legibility, rhythm, image evidence, anti-slop, editability, and parity with the supplied PPTX quality bar from 1–5. Record the before/after change and any remaining source-asset limit in `qa/report.md`. A structural check or a one-pass score sheet is not visual approval.
11. Write platform variants from the same claim order and sources. Instagram gets the carousel caption with CTA and source notes; Threads gets a short lead plus reply-sized beats. Read [references/publishing.md](references/publishing.md) before any API or browser publishing. Publish only when the user explicitly asks and the required account authorization is already available.

## Conversation and handoff

- Speak to the user only in plain, everyday Korean. Never mention development terms or internal work such as repositories, branches, commits, pushes, packages, manifests, validators, scripts, commands, or runtimes.
- Report only the useful outcome: how many final PNG cards are ready, whether the checks passed, where the image folder is saved, and any choice the user still needs to make. Mention the editable PPT only when it helps or the user asks for it.
- When the user asks to see the result, open the absolute `outputs/<slug>/final-images` folder when it exists; otherwise open `outputs/<slug>/slides`. Then say only that the result image folder was opened.
- When the user requests a PR, include only reusable skill, template, root `README.md`, or operating-guide changes. Keep every topic-specific result under `outputs/`, inspect the changed-file list before opening the PR, and never force-add anything from `outputs/`.
- Keep the root `README.md` as the permanent project guide. Never create another README inside this skill.

## Editorial direction

Use references as a north star, never as copy, logos, watermarks, exact layouts, or imagery to reproduce. The quality target is a restrained magazine carousel: a decisive cover, short declarative headlines, generous white space, one useful visual proof, and a closing principle worth saving. Prefer a real person, place, object, document, or product screen over generic atmosphere.

Choose the least decorative mode that makes the topic clear:

- `documentary`: interview, field story, or people-centered issue;
- `briefing`: announcement, trend, data, or news explainer;
- `how-to`: checklist, process, or practical tip;
- `profile`: person, company, book, tool, or case study.

## Output contract

Return one folder containing at least:

```text
<slug>/
├── manifest.json
├── text.json
├── image-plan.json
├── <slug>-editable-vN.pptx
├── slides/01-cover.png …
├── final-images/01-cover.png …
├── images/
│   ├── originals/
│   └── used/
├── captions/instagram.txt
├── captions/threads.md
├── sources.json
└── qa/
    ├── contact-sheet.png
    ├── design-iterations.json
    ├── iterations/
    │   ├── 01-draft/contact-sheet.png
    │   └── 02-final/contact-sheet.png
    ├── visual-review.json
    └── report.md
```

`manifest.json` is the source of truth for slide order, dimensions, layout, headlines, alt text, platform copy, and source IDs. Keep previews and contact sheets outside the publish list unless the user asks for them. Keep topic-specific outputs in `outputs/<slug>/`; never add them to the reusable skill.

## Quality gates

When a target PPTX is supplied, the output is ready only when it reaches the same production level: a strong thumbnail cover, clear title/body/emphasis hierarchy, alternating visual rhythm, one meaningful visual proof per relevant slide, generous whitespace, natural Korean line breaks, and an editable PPT whose text, images, overlays, and logo can be changed independently. Do not accept a lower-quality PNG simply because the package structure is complete.

- Do not invent names, dates, prices, eligibility, performance, or quotations.
- Keep source links close to the claim in `sources.json` and the final caption or source slide.
- Make every slide understandable without the caption; make every slide describable in `alt` text.
- Keep the first slide useful as a thumbnail and the final slide useful as a saved reference or clear next action.
- Do not hide trust signals in unreadable footnotes. Keep slide source labels at least 28px on a 1080px canvas, or move the full citation to the caption and `sources.json`.
- Use one accent color at most unless the brand already has a palette. Avoid decorative stickers, meaningless icons, page numbers, generic stock atmosphere, and charts that do not change the reader's understanding.
- For reference-led work, declare `design.template_sequence` and `design.quality_constraints` in the manifest. Keep `image-plan.json` connected to each original file, used file, placement, rights status, and source URL so the same visual standard can be regenerated rather than improvised.
- Keep at least two complete visual passes: a reviewed draft marked `revise` and a corrected final pass marked `pass`. `qa/design-iterations.json` must name every reviewed slide, the draft findings, and at least one material change carried into the final render.
- Do not publish secrets, access tokens, private source URLs, or unapproved sponsored copy.
