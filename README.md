# @docshunt/cardnews-skills

Codex-ready skills for Korean startup-support and business-plan content: source-led blog articles, editorial card-news, and 16:9 presentations. They share a fact-first, natural-Korean editorial process while retaining output-specific rules.

## Install into Codex

```bash
npx skills add Docshunt/cardnews-skills --skill cardnews-writing -a codex
npx skills add Docshunt/cardnews-skills --skill blog-writing -a codex
npx skills add Docshunt/cardnews-skills --skill presentation-writing -a codex
```

Invoke the installed skills with `$blog-writing`, `$cardnews-writing`, or `$presentation-writing`.

## Local development

```bash
npm test
npm run pack:check
```

The canonical skills live at `.agents/skills/blog-writing/`, `.agents/skills/cardnews-writing/`, and `.agents/skills/presentation-writing/`. Packaging is configured through `npmSkills.publish.source`.

## Card-news operating assets

Before card-news work, run `bash scripts/cardnews-session-preflight.sh`. It compares the working copy with `origin/main` without merging, rebasing, resetting, or overwriting work.

Approved editable sources are registered in [templates/cardnews/template-registry.json](templates/cardnews/template-registry.json). A batch job selects one approved deck, supplies verbatim copy from a separate content file, and changes only named inherited text and image slots:

```bash
node scripts/build-cardnews-batch.mjs --job <job.json> --validate
node scripts/build-cardnews-batch.mjs --job <job.json>
```

User copy is canonical and must not be paraphrased, reordered, or silently re-line-broken. Before a photo enters a deck, `scripts/prepare-cardnews-image.mjs` crops it to the inherited frame ratio without stretching; the crop is checked again in the final render.

Run `bash scripts/archive-cardnews-assets.sh` before replacing an approved deck or its working material. It makes an immutable local snapshot in `archive/<timestamp>/`. Snapshots are ignored because they may hold large, user-specific deliverables; the repeatable archive command, registry, batch format, and checks remain in this package.

For a rendered card-news package, run both the manifest check and visual-quality harness:

```bash
node .agents/skills/cardnews-writing/scripts/validate-cardnews.mjs outputs/<slug>
node .agents/skills/cardnews-writing/scripts/check-cardnews-quality.mjs outputs/<slug>
```

## Output

The card-news skill delivers final `1080×1350px` PNG cards for upload, backed by an editable `11.25×14.0625in` 4:5 PPTX. It preserves original and used image crops, captions, alt text, sources, and a draft-to-final QA history. The deck uses a full-bleed photo cover, interview quote, text-image, image-text, and centered close; all text, source lines, photo areas, overlays, and mark images remain separately editable.

When a reference deck is supplied, it is the production benchmark. Keep the draft, record concrete findings, make at least one needed visual correction, rerender the complete deck, and do not approve a card only because its file structure is valid. Read the [manifest](.agents/skills/cardnews-writing/references/manifest.md), [visual direction](.agents/skills/cardnews-writing/references/visual-direction.md), [quality harness](.agents/skills/cardnews-writing/references/quality-harness.md), and [publishing notes](.agents/skills/cardnews-writing/references/publishing.md).

Actual Meta publishing remains opt-in and credential-gated; no generation, test, or QA command sends a publish request.
