# @docshunt/cardnews-skills

Codex-ready skill for making Korean text-led editorial card news that reads like a short magazine story, with a matching Threads publishing package.

## Install into Codex

```bash
npx skills add Docshunt/cardnews-skills --skill cardnews-writing -a codex
```

Then invoke it with `$cardnews-writing`.

## Local development

```bash
npm test
python3 /Users/sungwon/.codex/skills/.system/skill-creator/scripts/quick_validate.py .agents/skills/cardnews-writing
npm run pack:check
```

The canonical skill lives at `.agents/skills/cardnews-writing/`. npm packaging is configured through `npmSkills.publish.source` and includes only that skill plus this repository's operating files.

## Output

The skill creates a manifest, 4:5 raster slides by default, platform-specific captions, alt text, and source tracking. Read the bundled [manifest contract](.agents/skills/cardnews-writing/references/manifest.md) and [publishing notes](.agents/skills/cardnews-writing/references/publishing.md) when a task reaches QA or external publishing.

Actual Meta publishing is intentionally opt-in and credential-gated; the skill does not send publish requests during generation or validation.
