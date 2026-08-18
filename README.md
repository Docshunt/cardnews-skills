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
python3 "${CODEX_HOME:-$HOME/.codex}/skills/.system/skill-creator/scripts/quick_validate.py" .agents/skills/cardnews-writing
python3 "${CODEX_HOME:-$HOME/.codex}/skills/.system/skill-creator/scripts/quick_validate.py" .agents/skills/blog-writing
python3 "${CODEX_HOME:-$HOME/.codex}/skills/.system/skill-creator/scripts/quick_validate.py" .agents/skills/presentation-writing
npm run pack:check
```

The canonical skills live at `.agents/skills/blog-writing/`, `.agents/skills/cardnews-writing/`, and `.agents/skills/presentation-writing/`. npm packaging is configured through `npmSkills.publish.source` and includes all three skills plus this repository's operating files.

The blog skill starts from a source-and-keyword brief: overseas material supplies the insight or case, while Korean primary sources supply current support-programme terminology and rules. The card-news and blog skills both use a Korean editorial pass after facts are locked. It removes translation-like and formulaic writing while preserving claims, figures, names, citations, and direct quotations; it is not a claim of authorship detection.

## Output

The card-news skill creates 4:5 upload images and a matching editable PowerPoint deck, plus platform-specific captions, alt text, and source tracking. Its bundled page system uses only a full-bleed photo cover, interview quote, text-over-image, image-over-text, and centered close. The text, source line, and every image placement remain separately editable in the PowerPoint deck. Read the bundled [manifest contract](.agents/skills/cardnews-writing/references/manifest.md), [editable PowerPoint guide](.agents/skills/cardnews-writing/references/editable-ppt.md), and [publishing notes](.agents/skills/cardnews-writing/references/publishing.md) when a task reaches QA or external publishing.

The presentation skill creates editable 16:9 PowerPoint decks with the same editorial rhythm: opening, quote, text-image, image-text, and centered close. Its bundled template leaves every photo as a labeled shape for the presenter to replace. Read its [visual direction](.agents/skills/presentation-writing/references/visual-direction.md) and [deck-manifest contract](.agents/skills/presentation-writing/references/deck-manifest.md) before preparing a deck.

Actual Meta publishing is intentionally opt-in and credential-gated; the skill does not send publish requests during generation or validation.
