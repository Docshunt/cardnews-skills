# cardnews-skills Agent Guide

## Scope

This repository publishes three reusable skills: `.agents/skills/blog-writing/`, `.agents/skills/cardnews-writing/`, and `.agents/skills/presentation-writing/`. Keep every folder portable so they work in Codex and other Agent Skills-compatible tools.

## Source of truth

- Edit each skill's `SKILL.md` for its workflow and trigger description.
- Keep detailed, conditional guidance in the matching skill's `references/` folder.
- Keep deterministic checks and reproducible template builders in the matching skill's `scripts/` folder.
- Do not create a second copy under `skills/`; `package.json.npmSkills.publish.source` already maps the canonical `.agents/skills` tree for npm-skills packaging.

## Card-news operating contract

### Session preflight

Before planning, sourcing assets, editing a deck, or creating a card-news output, run:

```bash
bash scripts/cardnews-session-preflight.sh
```

- It fetches `origin/main` and reports the incoming and local-only changes. It must never merge, rebase, reset, or overwrite work.
- If the remote has moved, inspect the reported paths before beginning a related change. Reconcile a shared-file conflict deliberately; never silently build from a stale visual system.
- If the check cannot reach the remote, state that the remote state is unverified. Do not claim that the current local templates are up to date.

### Canonical copy and templates

- A user-supplied page script, Notion block, caption, quotation, or requested line break is canonical copy. Transfer it verbatim into the selected inherited text slot. Do not shorten, paraphrase, reorder, substitute, or write a more “natural” version unless the user explicitly approves that exact change.
- Start every issue from an approved source deck in `templates/cardnews/template-registry.json`. Duplicate its selected source slides and edit inherited text and image slots in place; never rebuild a sparse deck from scratch when a compatible approved template exists.
- Every upload card is exactly `1080×1350 px` (4:5). Keep the inherited PowerPoint page at `11.25×14.0625 in` (`10287000×12858750` EMU, also 4:5); never substitute a 16:9 or square deck for a card-news issue.
- Preserve the template's fonts, type sizes, frames, crops, spacing, and hierarchy. The standing card-news sizes are: cover title 80 pt, story heading 38 pt, body 24 pt or larger, emphasized body 28 pt, and an absolute visible-text floor of 22 pt.
- For Docshunt issues, use the supplied logo image on the first cover and final closing card only. It must never appear on an intermediate card.
- Photos must keep their native proportions. Pre-crop a replacement to the exact inherited frame ratio with `scripts/prepare-cardnews-image.mjs`, then use `cover` fit with zero crop and a locked aspect ratio. Never stretch, squash, or resize an image independently on one axis.

### Archive, batch, and durable improvements

- Before a production edit that replaces an approved deck or its working material, create an immutable local snapshot with `scripts/archive-cardnews-assets.sh`. Snapshots live at `archive/<timestamp>/` and are ignored by Git because they contain large user deliverables; the archive command and index are the reproducible record.
- Use `scripts/build-cardnews-batch.mjs` with a job and verbatim content file for repeatable multi-issue work. It copies an approved source deck, changes only declared inherited slots, preserves image frames, records the copy hash, renders every slide, and keeps an edit map with the output.
- Treat a user correction as a durable rule when it applies to future card-news work, not only one named page. In the same task, update this guide, `.agents/skills/cardnews-writing/`, the matching `templates/cardnews/` contract, and the relevant test. Keep one-off copy, image choices, and layout exceptions inside that issue's job or manifest instead.

## Working rules

- Reuse existing templates and brand assets before adding code or dependencies.
- Keep important text out of generated raster backgrounds; render it deterministically.
- Treat reference Instagram accounts as editorial inspiration, never as assets or copy to reproduce.
- Never commit Meta tokens, private image URLs, generated client secrets, or account identifiers.
- Never publish to Instagram or Threads from a test, build, or QA command.

## User-facing language and delivery

- Speak to the user only in plain, everyday Korean that a non-technical person can understand.
- Never expose development terms or internal mechanics in progress updates or final messages. Do not mention repositories, branches, commits, pushes, packages, manifests, validators, scripts, commands, runtimes, or similar implementation details.
- Describe only what was made, what was checked, where it is saved, and whether any user choice remains. Translate internal status into phrases such as `준비를 마쳤습니다`, `확인을 마쳤습니다`, and `공유 공간에 반영했습니다`.
- Keep internal command output out of user-facing messages. Summarize it in one plain sentence.
- When the user asks to see the result, resolve the card-news output folder and open that exact folder in macOS Finder with `open <absolute-output-folder>`. Then say only that the result folder was opened.
- When the user explicitly asks to publish the reusable operating changes, commit and push only skill, template, and operating-guide changes to `main`. Keep every topic-specific result under `outputs/`, which must remain ignored and untracked. Never force-add anything from `outputs/`.
- Always keep the root `README.md` as the permanent project guide. Do not rewrite, delete, ignore, or omit it unless the user explicitly asks. Do not add a second README inside the skill folder.

## Verification

Run these before handoff:

```bash
npm test
node scripts/validate-cardnews-skill.mjs
npm run pack:check
npm run test:cardnews-system
```

For a real card-news output, also run:

```bash
node .agents/skills/cardnews-writing/scripts/validate-cardnews.mjs outputs/<slug>
```

## Codex collaboration

For future changes, keep independent lanes small: use a researcher for current Meta/API facts, a designer or vision pass for visual QA, an executor for edits, and a verifier for the final skill/package checks. The final owner must reconcile the lanes and run the commands above.
