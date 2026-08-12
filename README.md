# @docshunt/cardnews-skills

Codex-ready skills for Korean editorial card news and 16:9 presentations. Both use a restrained photograph-and-type treatment, fixed editorial storytelling, and five reusable forms.

## Install into Codex

~~~bash
npx skills add Docshunt/cardnews-skills --skill cardnews-writing -a codex
npx skills add Docshunt/cardnews-skills --skill presentation-writing -a codex
~~~

Invoke card news with `$cardnews-writing` and editable 16:9 decks with `$presentation-writing`.

## Local development

```bash
npm test
python3 /Users/sungwon/.codex/skills/.system/skill-creator/scripts/quick_validate.py .agents/skills/cardnews-writing
python3 /Users/sungwon/.codex/skills/.system/skill-creator/scripts/quick_validate.py .agents/skills/presentation-writing
npm run pack:check
```

The canonical skills live at `.agents/skills/cardnews-writing/` and `.agents/skills/presentation-writing/`. npm packaging is configured through `npmSkills.publish.source` and includes both skills plus this repository's operating files.

## Output

The card-news skill creates a manifest, 4:5 raster slides by default, platform-specific captions, alt text, and source tracking. Its bundled page system uses only a full-bleed photo cover, interview quote, text-over-image, image-over-text, and centered close. Read the bundled [manifest contract](.agents/skills/cardnews-writing/references/manifest.md) and [publishing notes](.agents/skills/cardnews-writing/references/publishing.md) when a task reaches QA or external publishing.

The presentation skill creates editable 16:9 PowerPoint decks with the same editorial rhythm: opening, quote, text-image, image-text, and centered close. Its bundled template leaves every photo as a labeled shape for the presenter to replace. Read its [visual direction](.agents/skills/presentation-writing/references/visual-direction.md) and [deck-manifest contract](.agents/skills/presentation-writing/references/deck-manifest.md) before preparing a deck.

Actual Meta publishing is intentionally opt-in and credential-gated; the skill does not send publish requests during generation or validation.
