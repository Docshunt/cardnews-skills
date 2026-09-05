# Template, archive, and batch contract

## Approved template selection

`templates/cardnews/template-registry.json` lists the approved editable source decks. Select the one whose inherited slide forms fit the script, then preserve its slides rather than recreating the visual language.

Every registered source must declare and preserve the card-news size: `1080×1350 px` for rendered cards and `11.25×14.0625 in` (`10287000×12858750` EMU) for the editable PPTX. A batch job changes slots inside that source deck; it must never resize the deck or convert it to 16:9.

- `murakami-routine-v2` is the default for story-led, text-and-photo issues with dense but readable Korean copy.
- `canva-ai-transition-v7` is the default for product, company, or market-transition stories with stronger image-led openings.
- A template is a source deck, not inspiration. Map every output page to a source slide, reuse inherited text and image objects, and record each intentional departure.

## Verbatim-copy lock

When a user gives final page copy, store it in the batch job's `content_file` with `copy_policy: "verbatim"`. The build writes these strings directly to the named inherited text slots and stores a SHA-256 record beside the output.

- Do not improve wording, normalize line breaks, or replace a claim because a different version seems clearer.
- Correct a clear factual problem only by flagging it and receiving an explicit replacement.
- A later user correction that changes a standing rule belongs in the operating guide, skill, template contract, and test. A correction for one issue remains only in that issue's content file.

## Image preparation

Prepare each photo before it reaches PowerPoint:

```bash
node scripts/prepare-cardnews-image.mjs \
  --input <source-image> \
  --output <prepared-image> \
  --width <inherited-frame-width> \
  --height <inherited-frame-height>
```

The command centre-crops to the requested ratio without stretching. It is a preparation step, not visual approval: inspect the full rendered slide and choose a different crop or asset if it cuts off the person, product, or evidence. The batch builder only accepts `cover` or `contain` and always preserves the inherited image frame, crop coordinates, geometry, and aspect lock.

## Archive snapshots

Before changing an approved deck, its source assets, or a finished package, snapshot the workspace:

```bash
bash scripts/archive-cardnews-assets.sh
```

It copies `outputs/`, card-news working material, `tmp/`, and `qa/` into `archive/<timestamp>/materials/`, excluding Git metadata, dependencies, and the archive itself. `archive-index.json` records the source workspace, snapshot time, inclusions, and every top-level card-news artifact. Snapshots are intentionally local and ignored by Git because they contain large user deliverables.

## Batch jobs

Use one JSON job and one JSON content file per issue. Validate before build:

```bash
node scripts/build-cardnews-batch.mjs --job <job.json> --validate
```

Build one or more jobs only after the session preflight and asset preparation:

```bash
node scripts/build-cardnews-batch.mjs --job <job.json>
node scripts/build-cardnews-batch.mjs --jobs-dir <directory>
```

Each job selects an approved template; each content entry declares the source slide, named editable text slots, image slot indices, source notes, and no visual additions. The builder refuses missing templates, changed copy policy, inaccessible assets, undeclared targets, duplicate slide mappings, or output paths outside `outputs/`.
