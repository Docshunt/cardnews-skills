# Card-news manifest

Create `manifest.json` in the card-news output folder before rendering. It is the source of truth for the editorial claim, slide order, copy, layout, image replacement points, alt text, platform copy, and sources. Keep the editable original and derived views beside it so a reviewer can change copy or replace one asset without rebuilding the story.

```json
{
  "slug": "teacher-workflow",
  "title": "교사의 시간을 돌려주는 작은 변화",
  "mode": "how-to",
  "editorial_claim": "작은 흐름 변경이 반복 업무 시간을 돌려준다",
  "canvas": { "width": 1080, "height": 1350 },
  "design": {
    "mode": "editorial-magazine",
    "visual_mode": "photo-led",
    "template_sequence": ["cover", "text-image", "image-text", "centered-close"],
    "quality_constraints": {
      "one_visual_proof_per_slide": true,
      "source_media_preferred": true,
      "baked_copy_in_raster": false,
      "generic_ui_cards": false,
      "decorative_fill": false,
      "flattened_slide_background": false,
      "editable_source_required": true
    },
    "mark": {
      "white": "assets/brand/docshunt-white.png",
      "black": "assets/brand/docshunt-black.png"
    }
  },
  "slides": [
    {
      "id": "01-cover",
      "file": "slides/01-cover.png",
      "role": "cover",
      "layout": "cover",
      "headline": "교사의 시간을 돌려주는 작은 변화",
      "body": [],
      "emphasis": "반복 업무를 줄이는 한 가지 흐름",
      "alt": "교사의 반복 업무를 줄이는 방법을 소개하는 표지",
      "source_ids": ["src-01"]
    },
    {
      "id": "02-context",
      "file": "slides/02-context.png",
      "role": "context",
      "layout": "text-image",
      "headline": "문제는 도구가 아니라 흐름입니다",
      "body": ["반복 업무가 시간을 빼앗는 이유"],
      "emphasis": "시작하기 어려운 지점을 먼저 바꿉니다.",
      "alt": "반복 업무가 시간을 빼앗는 상황을 설명하는 카드",
      "source_ids": ["src-01"]
    },
    {
      "id": "03-action",
      "file": "slides/03-action.png",
      "role": "action",
      "layout": "image-text",
      "headline": "오늘 바로 바꿀 한 가지",
      "body": ["오늘 바로 적용할 한 가지 행동"],
      "emphasis": "작게 바꾸고 다시 확인합니다.",
      "alt": "오늘 바로 적용할 한 가지 행동을 설명하는 카드",
      "source_ids": ["src-01"]
    },
    {
      "id": "04-close",
      "file": "slides/04-close.png",
      "role": "close",
      "layout": "centered-close",
      "headline": "저장해 두고 다음 주에 확인하세요",
      "body": ["핵심 내용을 저장하고 실천합니다."],
      "emphasis": "한 가지 흐름부터 바꿔보세요.",
      "alt": "핵심 내용을 저장하고 실천하라는 마무리 카드",
      "source_ids": ["src-01"]
    }
  ],
  "platforms": {
    "instagram": {
      "caption": "캡션 본문과 CTA\n\n#카드뉴스 #콘텐츠"
    },
    "threads": {
      "root": "핵심 훅을 한 문장으로 줄인 Threads 첫 글",
      "replies": ["맥락", "근거", "실천 팁", "출처와 CTA"]
    }
  },
  "sources": [
    { "id": "src-01", "label": "공식 문서", "url": "https://example.com/source", "kind": "official", "rights_status": "reference-only", "accessed_at": "2026-08-21" }
  ]
}
```

## Required fields

- `slug`: one lowercase kebab-case path segment.
- `canvas`: `1080×1350` is the default shared canvas; `1080×1440` is also accepted for the taller magazine treatment.
- `editorial_claim`: the one sentence the carousel must prove.
- `design.mode`: the visual system name; keep `visual_mode` as `photo-led`, `text-led`, or `quote-led`.
- `slides`: 4–10 ordered raster files. The first slide must have `role: "cover"`; every slide needs `id`, `file`, `role`, `layout`, `headline`, useful `alt` text, and `source_ids` (use an empty array only when the slide contains no external claim or asset).
- `platforms.instagram.caption`: the final Instagram caption, including CTA and source notes when needed.
- `platforms.threads.root`: the first Threads post. Keep `replies` short enough to read as a sequence, not as copied Instagram paragraphs.
- `sources`: at least one source object for the review trail. Give each source an `id`, direct `url`, `kind`, `rights_status`, and `accessed_at`; use an official or primary source for time-sensitive claims.

Keep the derived package beside the manifest:

- `text.json`: copy-only view with slide IDs, headlines, body lines, emphasis, and source lines;
- `image-plan.json`: one entry per slide. Image-bearing entries must include `original_file`, `used_file`, `placement`, `alt`, `rights_status`, `source_url`, and `source_ids`; text-only synthesis or close cards may set `asset` to `null`;
- `<slug>-editable-vN.pptx`: versioned editable source, never silently overwrite the previous version;
- `images/originals/` and `images/used/`: preserve the downloaded or captured original separately from the crop or correction inserted into the PPT;
- `sources.json`: the full source and rights trail;
- `qa/contact-sheet.png`, `qa/visual-review.json`, and `qa/report.md`: mobile-scale review and 1–5 scores, fixes, and remaining limits. Every visual-review score must be at least 4 before handoff.

Paths are relative to the manifest folder. Never use absolute paths or `..` segments.
