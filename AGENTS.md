# cardnews-skills Agent Guide

## Scope

This repository publishes two reusable skills: `.agents/skills/cardnews-writing/` and `.agents/skills/presentation-writing/`. Keep both folders portable so they work in Codex and other Agent Skills-compatible tools.

## Source of truth

- Edit each skill's `SKILL.md` for its workflow and trigger description.
- Keep detailed, conditional guidance in the matching skill's `references/` folder.
- Keep deterministic checks and reproducible template builders in the matching skill's `scripts/` folder.
- Do not create a second copy under `skills/`; `package.json.npmSkills.publish.source` already maps the canonical `.agents/skills` tree for npm-skills packaging.

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
- When quality checks pass and no requested changes remain, immediately commit and push only reusable skill, template, and operating-guide changes to `main`. Keep every topic-specific result under `outputs/`, which must remain ignored and untracked. Never force-add anything from `outputs/`.
- Always keep the root `README.md` as the permanent project guide. Do not rewrite, delete, ignore, or omit it unless the user explicitly asks. Do not add a second README inside the skill folder.

## Verification

Run these before handoff:

```bash
npm test
python3 /Users/sungwon/.codex/skills/.system/skill-creator/scripts/quick_validate.py .agents/skills/cardnews-writing
python3 /Users/sungwon/.codex/skills/.system/skill-creator/scripts/quick_validate.py .agents/skills/presentation-writing
npm run pack:check
```

For a real card-news output, also run:

```bash
node .agents/skills/cardnews-writing/scripts/validate-cardnews.mjs outputs/<slug>
```

## Codex collaboration

For future changes, keep independent lanes small: use a researcher for current Meta/API facts, a designer or vision pass for visual QA, an executor for edits, and a verifier for the final skill/package checks. The final owner must reconcile the lanes and run the commands above.
