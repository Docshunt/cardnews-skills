---
name: cardnews-writing
description: Create Korean text-led editorial card-news carousels and cross-platform publishing packages for Instagram and Threads. Use when turning a topic, article, interview, announcement, product, or source material into an opinionated magazine-style story with slides, captions, alt text, and publish-ready metadata.
---

# Card News Writing

Create an editorial card-news package that is ready for visual review and can be published to Instagram and Threads without rewriting the story twice.

## Workflow

1. Inspect the repository for existing brand assets, fonts, image helpers, output conventions, and source material. Reuse them before adding anything.
2. Establish the audience, the editor's one-sentence claim, factual sources, intended takeaway, CTA, and visual mode before designing slides. A topic is not a claim: turn “AI 시대의 교육 변화 5가지” into a specific point of view the evidence can support.
3. Write the slide plan before rendering. Build a swipeable argument rather than a list of isolated facts: `claim → tension → story → turn → evidence → interpretation → close`. Let a dense story use two or more short cards instead of shrinking the type.
4. Create `manifest.json` first. Follow [references/manifest.md](references/manifest.md), choose a layout primitive for every slide, and keep every slide file listed there.
5. Start from the bundled [editorial card system](assets/editorial-card-system/). Use its HTML/CSS source as the production base: set the three theme tokens, select the needed primitives, replace the placeholder copy and imagery, then render each card deterministically. Do not invent a new visual treatment for every slide.
6. Render raster slides at `1080×1350` by default. Use `1080×1440` only when the requested visual direction needs the taller 3:4 canvas. Keep text inside a 72px horizontal and 96px vertical safe area.
7. Use real, licensed, or user-provided photography when a subject or event is central. Use `$imagegen` only for missing illustrative imagery; render all important text with SVG, HTML/CSS, or another deterministic compositor rather than asking an image model to spell it.
8. Validate the package:

   ```bash
   node .agents/skills/cardnews-writing/scripts/validate-cardnews.mjs outputs/<slug>
   ```

9. Inspect a contact sheet at mobile scale. For reference-led or production-quality work, complete at least two documented review loops:
   - inspect both the full-size slides and a 320px-wide contact sheet;
   - ask an independent vision or design reviewer to score hook clarity, Korean legibility, hierarchy, slide rhythm, reference fit without copying, and source trust from 1–5 without seeding expected defects;
   - fix every category below 4, render again, and rerun the validator;
   - record the scores, changes, and remaining limits in `qa/report.md`.
10. Write platform variants. Instagram gets the carousel caption; Threads gets a short lead post plus reply-sized beats. Keep the claim, story beats, interpretation, and sources aligned.
11. Read [references/publishing.md](references/publishing.md) before any API or browser publishing. Publish only when the user explicitly asks for it and the required account authorization is already available.

## Conversation and handoff

- Speak to the user only in plain, everyday Korean. Never mention development terms or internal work such as repositories, branches, commits, pushes, packages, manifests, validators, scripts, commands, or runtimes.
- Report only the useful outcome: what was made, how many cards are ready, whether the checks passed, where the result is saved, and any choice the user still needs to make.
- Keep the topic-specific images, captions, sources, previews, and reports inside `outputs/<slug>/`. They are local deliverables and must never be tracked or shared with the reusable template.
- When the user asks to see the result, resolve the absolute `outputs/<slug>` path, run `open <absolute-output-folder>` on macOS, and reply in Korean that the result folder was opened. Do not show the command.
- When the result meets the requested quality and no change request remains, immediately save only reusable skill, template, root `README.md`, or operating-guide improvements to `main` and share them. Never include `outputs/`, even by force.
- Keep the root `README.md` permanently as the project guide. Never rewrite, delete, or omit it unless the user explicitly asks, and never create another README inside this skill folder.

## Editorial direction

Use the references as an editorial north star, never as a brand to copy. Treat the carousel as a small magazine article: its graphic design serves reading, its sequence creates momentum, and the editor's view is visible.

- Start the cover with a concrete, slightly surprising claim, question, or contrast—not a category label or a vague slogan. Make it strong enough to create curiosity but narrow enough that the carousel can prove it.
- Give the story a visual anchor when one exists: a person, place, object, document, or archival image. When the argument itself is the focus, let typography be the dominant visual instead of adding decoration.
- Write in short Korean sentences and deliberate line breaks. Use a sentence, contrast, or unanswered question as a slide-ending beat that makes the next swipe feel necessary.
- Give every slide one job, but allow 2–4 tightly related sentences when the reader needs narrative momentum. Split dense evidence across cards before reducing type size.
- Separate fact from interpretation. State the editor's reading plainly after the evidence, but never present a value judgment, prediction, or inference as verified fact.
- Use a source or verification note when the card makes a current, numerical, political, legal, medical, or financial claim.

Choose the least decorative mode that makes the story clear:

- `documentary`: interview, field story, or people-centered issue;
- `briefing`: announcement, trend, data, or news explainer;
- `how-to`: checklist, process, or practical tip;
- `profile`: person, company, book, tool, or case study.

Do not reproduce the reference accounts' logos, watermarks, exact layouts, captions, phrasing, or imagery. Replace them with the user's brand system and give collaborators credit where required. Read [references/visual-direction.md](references/visual-direction.md) before choosing type, imagery, or slide rhythm.

## Layout system

Use the seven bundled primitives, not a different template for each page:

- `cover`: one strong claim with either a dominant image or a type-led field;
- `statement`: one short editorial assertion or transition;
- `text`: a readable paragraph card with a stable left edge;
- `photo-text`: one evidence-bearing image with a short caption or claim;
- `quote`: a source-attributed quotation with enough whitespace to feel deliberate;
- `data`: one number, comparison, or compact evidence set—never a dashboard;
- `closing`: the thought, implication, or reference the reader should retain.

Use the same canvas, grid, masthead, page number, type scale, and three colour tokens across the whole carousel. Default to 2–4 primitive types in a 6–8 slide story; repeat `text`, `statement`, or `photo-text` when the narrative needs it. Change a layout only to clarify a new kind of evidence or create a meaningful turning point.

Copy `assets/editorial-card-system/` into the card-news working folder before editing. Its `card.css` contains the tokens and shared geometry; each named HTML file is one renderable 1080×1350 page. Do not put text inside a generated image. Set `--background`, `--ink`, and `--accent` once per issue, then change them only for intentional photo contrast.

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

The `manifest.json` is the source of truth for slide order, dimensions, headlines, alt text, platform captions, sources, and the editorial claim. Keep generated previews or contact sheets outside the publish list unless the user asks for them.

## Quality gates

- Do not invent names, dates, prices, eligibility, performance, or quotations.
- Keep source links close to the claim in `sources.json` and the final caption or source slide.
- Make every slide understandable without the caption; make every slide describable in `alt` text.
- Keep the first slide useful as a thumbnail: show the full claim at a glance, with no small explanatory deck competing for attention.
- Make the final slide a conclusion, invitation, or compact reference worth saving—not a generic “thank you” or engagement prompt.
- Reject ornamental icons, stickers, charts, gradients, and image treatments that do not clarify the story or improve reading contrast.
- Do not hide trust signals in unreadable footnotes. Keep slide source labels at least 28px on a 1080px canvas, or move the full citation to the caption and `sources.json`.
- Do not publish secrets, access tokens, private source URLs, or unapproved sponsored copy.
