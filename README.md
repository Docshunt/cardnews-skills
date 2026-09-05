# @docshunt/cardnews-skills

Codex-ready skills for Korean startup-support and business-plan content: search-led blog articles, editorial card news, and 16:9 presentations. They share a source-first, natural-Korean editorial process while keeping each output format's rules separate.

## Install into Codex

~~~bash
npx skills add Docshunt/cardnews-skills --skill cardnews-writing -a codex
npx skills add Docshunt/cardnews-skills --skill blog-writing -a codex
npx skills add Docshunt/cardnews-skills --skill presentation-writing -a codex
~~~

Invoke SEO-aware blog articles with `$blog-writing`, card news with `$cardnews-writing`, and editable 16:9 decks with `$presentation-writing`.

## Local development

```bash
npm test
npm run pack:check
```

The canonical skills live at `.agents/skills/blog-writing/`, `.agents/skills/cardnews-writing/`, and `.agents/skills/presentation-writing/`. npm packaging is configured through `npmSkills.publish.source` and includes all three skills plus this repository's operating files.

The blog skill starts from a source-and-keyword brief: overseas material supplies the insight or case, while Korean primary sources supply current support-programme terminology and rules. The card-news and blog skills both use a Korean editorial pass after facts are locked. It removes translation-like and formulaic writing while preserving claims, figures, names, citations, and direct quotations; it is not a claim of authorship detection.

## Card-news operating assets

Before a card-news task, run `bash scripts/cardnews-session-preflight.sh`. It compares the local working copy with `origin/main` and never merges, rebases, resets, or overwrites work.

Approved editable sources are registered in [templates/cardnews/template-registry.json](templates/cardnews/template-registry.json). The registry currently preserves the approved Canva v7 and Haruki v2 decks. A batch job selects one of those decks, supplies verbatim user copy in a separate content file, and changes only named inherited text and image slots:

```bash
node scripts/build-cardnews-batch.mjs --job <job.json> --validate
node scripts/build-cardnews-batch.mjs --job <job.json>
```

The user copy is the canonical source: it is transferred without paraphrase, reordering, or silent line-break changes. Before a photo enters the deck, `scripts/prepare-cardnews-image.mjs` centre-crops it to its inherited frame ratio without stretching; the final crop is still checked on the rendered slide.

Run `bash scripts/archive-cardnews-assets.sh` before replacing an approved deck or its working materials. It makes an immutable local snapshot in `archive/<timestamp>/` of existing outputs, working material, temporary renders, and QA evidence. Snapshots are intentionally ignored by Git because they preserve large user deliverables; the reusable archive command, template registry, batch job format, and checks remain in the package.

## Output

The card-news skill creates `1080×1350 px` (4:5) upload images and a matching editable `11.25×14.0625 in` (4:5) PowerPoint deck, plus platform-specific captions, alt text, and source tracking. Its bundled page system uses only a full-bleed photo cover, interview quote, text-over-image, image-over-text, and centered close. The text, source line, and every image placement remain separately editable in the PowerPoint deck. Read the bundled [manifest contract](.agents/skills/cardnews-writing/references/manifest.md), [editable PowerPoint guide](.agents/skills/cardnews-writing/references/editable-ppt.md), and [publishing notes](.agents/skills/cardnews-writing/references/publishing.md) when a task reaches QA or external publishing.

The presentation skill creates editable 16:9 PowerPoint decks with the same editorial rhythm: opening, quote, text-image, image-text, and centered close. Its bundled template leaves every photo as a labeled shape for the presenter to replace. Read its [visual direction](.agents/skills/presentation-writing/references/visual-direction.md) and [deck-manifest contract](.agents/skills/presentation-writing/references/deck-manifest.md) before preparing a deck.

Actual Meta publishing is intentionally opt-in and credential-gated; the skill does not send publish requests during generation or validation.
