# cardnews-skills Agent Guide

## Scope

This repository publishes one reusable skill: `.agents/skills/cardnews-writing/`. Keep that folder portable so it works in Codex and other Agent Skills-compatible tools.

## Source of truth

- Edit `.agents/skills/cardnews-writing/SKILL.md` for the workflow and trigger description.
- Keep detailed, conditional guidance in that skill's `references/` folder.
- Keep deterministic checks in that skill's `scripts/` folder.
- Do not create a second copy under `skills/`; `package.json.npmSkills.publish.source` already maps the canonical `.agents/skills` tree for npm-skills packaging.

## Working rules

- Reuse existing templates and brand assets before adding code or dependencies.
- Keep important text out of generated raster backgrounds; render it deterministically.
- Treat reference Instagram accounts as editorial inspiration, never as assets or copy to reproduce.
- Never commit Meta tokens, private image URLs, generated client secrets, or account identifiers.
- Never publish to Instagram or Threads from a test, build, or QA command.

## Verification

Run these before handoff:

```bash
npm test
python3 /Users/sungwon/.codex/skills/.system/skill-creator/scripts/quick_validate.py .agents/skills/cardnews-writing
npm run pack:check
```

For a real card-news output, also run:

```bash
node .agents/skills/cardnews-writing/scripts/validate-cardnews.mjs outputs/<slug>
```

## Codex collaboration

For future changes, keep independent lanes small: use a researcher for current Meta/API facts, a designer or vision pass for visual QA, an executor for edits, and a verifier for the final skill/package checks. The final owner must reconcile the lanes and run the commands above.
