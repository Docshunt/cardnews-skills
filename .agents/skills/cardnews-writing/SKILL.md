---
name: cardnews-writing
description: Create Korean editorial card-news carousels and cross-platform publishing packages for Instagram and Threads. Use when turning a topic, article, interview, announcement, product, or source material into magazine-style visual slides, captions, alt text, and publish-ready metadata.
---

# Card News Writing

Create an editorial card-news package that is ready for visual review and can be published to Instagram and Threads without rewriting the story twice.

## Workflow

1. Inspect the repository for existing brand assets, fonts, image helpers, output conventions, and source material. Reuse them before adding anything.
2. Establish the audience, one-sentence promise, factual sources, CTA, and visual mode before designing slides.
3. Write the slide plan before rendering. Use one idea per slide and keep the cover to one strong hook.
4. Create `manifest.json` first. Follow [references/manifest.md](references/manifest.md) and keep every slide file listed there.
5. Render raster slides at `1080×1350` by default. Use `1080×1440` only when the requested visual direction needs the taller 3:4 canvas. Keep text inside a 72px horizontal and 96px vertical safe area.
6. Use real, licensed, or user-provided photography when a subject or event is central. Use `$imagegen` only for missing illustrative imagery; render all important text with SVG, HTML/CSS, or another deterministic compositor rather than asking an image model to spell it.
7. Validate the package:

   ```bash
   node .agents/skills/cardnews-writing/scripts/validate-cardnews.mjs outputs/<slug>
   ```

8. Inspect a contact sheet at mobile scale. For reference-led or production-quality work, complete at least two documented review loops:
   - inspect both the full-size slides and a 320px-wide contact sheet;
   - ask an independent vision or design reviewer to score hook clarity, Korean legibility, hierarchy, slide rhythm, reference fit without copying, and source trust from 1–5 without seeding expected defects;
   - fix every category below 4, render again, and rerun the validator;
   - record the scores, changes, and remaining limits in `qa/report.md`.
9. Write platform variants. Instagram gets the carousel caption; Threads gets a short lead post plus reply-sized beats. Keep the claim order and sources aligned.
10. Read [references/publishing.md](references/publishing.md) before any API or browser publishing. Publish only when the user explicitly asks for it and the required account authorization is already available.

## Conversation and handoff

- Speak to the user only in plain, everyday Korean. Never mention development terms or internal work such as repositories, branches, commits, pushes, packages, manifests, validators, scripts, commands, or runtimes.
- Report only the useful outcome: what was made, how many cards are ready, whether the checks passed, where the result is saved, and any choice the user still needs to make.
- Keep the topic-specific images, captions, sources, previews, and reports inside `outputs/<slug>/`. They are local deliverables and must never be tracked or shared with the reusable template.
- When the user asks to see the result, resolve the absolute `outputs/<slug>` path, run `open <absolute-output-folder>` on macOS, and reply in Korean that the result folder was opened. Do not show the command.
- When the result meets the requested quality and no change request remains, immediately save only reusable skill, template, root `README.md`, or operating-guide improvements to `main` and share them. Never include `outputs/`, even by force.
- Keep the root `README.md` permanently as the plain-Korean guide for users. Never delete or omit it, and never create another README inside this skill folder.

## Editorial direction

Use the references as a north star, not as a brand to copy. Default to a photo-led magazine cover, a high-contrast headline over a dark gradient, restrained accent color, and a small consistent brand mark. Prefer:

- a concrete Korean hook over an abstract slogan;
- a human, place, object, or document that gives the story a visual anchor;
- short headlines, generous line spacing, and one visual hierarchy per slide;
- a sequence of `hook → context → evidence → implication → action`;
- a source or verification note when the card makes a current, numerical, political, legal, medical, or financial claim.

Choose the least decorative mode that makes the topic clear:

- `documentary`: interview, field story, or people-centered issue;
- `briefing`: announcement, trend, data, or news explainer;
- `how-to`: checklist, process, or practical tip;
- `profile`: person, company, book, tool, or case study.

Do not reproduce the reference accounts' logos, watermarks, exact layouts, captions, or imagery. Replace them with the user's brand system and give collaborators credit where required.

## Output contract

Return one folder containing at least:

```text
<slug>/
├── manifest.json
├── slides/01-cover.png …
├── captions/instagram.txt
├── captions/threads.md
└── sources.json
```

The `manifest.json` is the source of truth for slide order, dimensions, headlines, alt text, platform captions, and sources. Keep generated previews or contact sheets outside the publish list unless the user asks for them.

## Quality gates

- Do not invent names, dates, prices, eligibility, performance, or quotations.
- Keep source links close to the claim in `sources.json` and the final caption or source slide.
- Make every slide understandable without the caption; make every slide describable in `alt` text.
- Keep the first slide useful as a thumbnail and the final slide useful as a saved reference.
- Do not hide trust signals in unreadable footnotes. Keep slide source labels at least 28px on a 1080px canvas, or move the full citation to the caption and `sources.json`.
- Do not publish secrets, access tokens, private source URLs, or unapproved sponsored copy.
