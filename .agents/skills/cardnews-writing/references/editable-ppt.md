# Editable card-news PowerPoint

Create one editable `1080 × 1350` PowerPoint slide for every upload card. The deck repeats the card order and the five forms exactly; it is not a separate 16:9 presentation.

## What stays editable

- title, body, quote, emphasis, mark, and source line are separate text boxes;
- each photograph is one replaceable image object;
- when a photograph is not ready, use one removable shape labeled with the exact subject and crop needed;
- the dark cover fade is a separate shape, not part of the photo;
- never place one rendered card PNG behind editable text.

## Build from the card-news manifest

Use the included builder with the final `manifest.json`:

```bash
node .agents/skills/cardnews-writing/scripts/create-editable-card-deck.mjs \
  outputs/<slug>/manifest.json \
  outputs/<slug>/<slug>-editable.pptx
```

Before making or changing the PPTX, follow the PowerPoint environment and review process. Load the presentation workspace dependencies, use its supplied Node runtime, and record the creation operation. The output deck and any slide images must stay inside `outputs/<slug>/`.

## Per-slide fields

The image fields in `manifest.json` are relative to the manifest folder.

```json
{
  "editable_pptx": { "file": "quiet-company-editable.pptx" },
  "slides": [
    {
      "layout": "text-image",
      "headline": "1. 제목은 따로 고칠 수 있습니다.",
      "body": "문단도 별도 텍스트 상자로 남습니다.",
      "emphasis": "강조 문장도 독립적으로 고칩니다.",
      "image": "images/founder.jpg",
      "image_placeholder": "사진: 회의 중인 창업자 · 가로",
      "source_line": "사진: 회사 제공",
      "notes_sources": ["https://example.com/source"]
    }
  ]
}
```

- Use `image` only for a cleared local image. The builder embeds it as an editable PowerPoint image object.
- When `image` is missing, `image_placeholder` is required for a photo layout. Describe a real subject and `가로` or `세로` crop. A short default label is allowed only in the reusable template.
- `source_line` is visible only when attribution must be shown on the card. Put full links in `notes_sources` and the output's `sources.json`.
- For `interview-quote`, put the full attributed sentence in `quote`. For a `centered-close`, use `headline`, then optional `body` and `emphasis`.

## Review before handoff

Open the final PPTX and confirm on a cover, story, quote, and closing slide that each text element and each photo or placeholder can be selected independently. Render the whole deck, inspect every page, and fix clipping, unexpected text wrap, overlapped labels, wrong image crops, or leftover default copy before delivery.
