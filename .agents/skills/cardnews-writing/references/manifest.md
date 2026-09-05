# Card-news manifest

Create `manifest.json` in the card-news output folder. It is deliberately small so the same package can guide writing, rendering, review, and later publishing.

```json
{
  "slug": "quiet-company",
  "title": "가장 큰 회사는 가장 조용할 수도 있습니다",
  "mode": "profile",
  "editorial": {
    "claim": "보이지 않는 경영 방식은 홍보를 못 해서가 아니라, 회사가 팔아야 할 것이 제품뿐이기 때문일 수 있습니다.",
    "reader_takeaway": "성장의 크기보다 회사가 무엇을 증명하려 하는지 살핀다.",
    "narrative_arc": ["claim", "setup", "complication", "evidence", "interpretation", "close"],
    "hso": {
      "hook": "표지의 한 문장 주장",
      "story": ["setup", "complication", "evidence", "interpretation"],
      "offer": "저장할 결론 또는 독자에게 자연스러운 다음 행동",
      "mode": "editorial-soft-offer"
    }
  },
  "design": {
    "system": "editorial-card-system",
    "surface": "#FCFCFA",
    "ink": "#111111",
    "photo_overlay": "rgba(0, 0, 0, .74)",
    "typography": { "min_font_size_pt": 22 },
    "mark": {
      "white": "assets/brand/docshunt-white.png",
      "black": "assets/brand/docshunt-black.png",
      "placement": "cover-and-final-only"
    }
  },
  "canvas": { "width": 1080, "height": 1350 },
  "editable_pptx": { "file": "quiet-company-editable.pptx" },
  "slides": [
    {
      "file": "slides/01-cover.png",
      "role": "cover",
      "layout": "cover",
      "headline": "가장 큰 회사는\n가장 조용할 수도 있습니다",
      "image_placeholder": "사진: 회사 창업자 또는 제품 현장 · 세로",
      "alt": "인물 사진 위에 조용한 회사에 대한 주장을 담은 표지",
      "image_source": "공식 자료 또는 라이선스 확인 자료",
      "license_status": "확인 필요",
      "copy_labels": { "headline": "hook", "image": "fact" }
    },
    {
      "file": "slides/02-context.png",
      "role": "setup",
      "layout": "text-image",
      "headline": "1. 큰 회사인데도, 얼굴을 아는 사람이 없습니다.",
      "body": "회사가 상장돼 있지 않고, 언론 인터뷰도 하지 않는다면\n사람들은 무엇으로 그 회사를 기억할까요.",
      "emphasis": "보이지 않는 방식에도 이유가 있습니다.",
      "image_placeholder": "사진: 행사장에 앉아 있는 창업자 · 가로",
      "alt": "회사의 배경을 설명하는 글과 창업자 사진",
      "copy_labels": { "headline": "fact", "body": "fact", "emphasis": "editorial_interpretation", "image": "fact" }
    },
    {
      "file": "slides/03-turn.png",
      "role": "interpretation",
      "layout": "image-text",
      "headline": "2. 보이지 않는 방식이 원칙이었습니다.",
      "body": "외부의 관심보다 제품과 고객을 먼저 쌓는 편이\n회사를 더 오래 설명할 수 있다고 믿었습니다.",
      "image_placeholder": "사진: 제품을 사용하는 장면 · 가로",
      "alt": "인물 사진과 회사의 선택을 설명하는 글",
      "copy_labels": { "headline": "interpretation", "body": "fact", "image": "fact" }
    },
    {
      "file": "slides/04-close.png",
      "role": "close",
      "layout": "centered-close",
      "headline": "보여줄 필요가 없었던 겁니다.",
      "body": "회사가 조용한 이유는 숨기기 위해서가 아니라,\n처음부터 제품이 말하게 하려는 선택일 수 있습니다.",
      "emphasis": "무엇을 보여줄지보다, 무엇이 남는지가 중요합니다.",
      "alt": "글의 결론을 여백 있게 정리한 카드",
      "copy_labels": { "headline": "offer", "body": "editorial_interpretation", "emphasis": "offer" }
    }
  ],
  "platforms": {
    "instagram": {
      "caption": "캡션 본문과 출처, CTA"
    },
    "threads": {
      "root": "핵심 훅을 한 문장으로 줄인 Threads 첫 글",
      "replies": ["맥락", "근거", "해석", "출처와 CTA"]
    }
  },
  "sources": [
    { "label": "공식 자료", "url": "https://example.com/source" }
  ]
}
```

## Required fields

- `slug`: one lowercase kebab-case path segment.
- `editorial`: the supported `claim`, the reader's `reader_takeaway`, and a `narrative_arc` with at least three beats. New packages also record `editorial.hso.hook`, `editorial.hso.story`, `editorial.hso.offer`, and `editorial.hso.mode = "editorial-soft-offer"`. The claim may be an editorial reading, but it must remain distinguishable from sourced facts.
- `design`: use `editorial-card-system` with one shared `surface`, `ink`, and `photo_overlay`. Set `typography.min_font_size_pt` to `22`; it is a hard floor for every visible text object. `mark` is optional; for Docshunt use separate `white` and `black` PNG paths and set `placement` to `cover-and-final-only`. Place the white mark only on the first cover and the black mark only on the final card. Remove it from the page when the user has no publication mark. Do not add an accent-colour token.
- `canvas`: `1080×1350` for every slide.
- `editable_pptx.file`: the matching editable PowerPoint deck inside the output folder. It must end in `.pptx` and contain the same cards in the same order. Every visible Korean text line and photo zone must be independently editable.
- `slides`: 2–20 ordered raster files. Choose the count from the completed story, not a template quota. The first slide must have `role: "cover"`; every slide needs `file`, `layout`, `headline`, and useful `alt` text. `layout` must be one of `cover`, `interview-quote`, `text-image`, `image-text`, or `centered-close`.
- `body`, `emphasis`, `quote`, `image`, `image_placeholder`, `source_line`, and `notes_sources`: optional but recommended fields used to create the editable PPTX. Use `image` for a cleared local image relative to the manifest. When an image is unavailable, make `image_placeholder` describe the needed subject and crop, such as `사진: 고객 인터뷰 중인 창업자 · 가로`. For every real image, record `image_source`, `source_url`, and `license_status` (or put the same trail in `sources.json`). Google/Pinterest URLs alone are not a source trail.
- `copy_labels`: recommended per-slide metadata distinguishing `fact`, `editorial_interpretation`, `hook`, and `offer`; this prevents the HSO frame from blurring reporting and promotion.
- `platforms.instagram.caption`: the final Instagram caption, including source notes or CTA when needed.
- `platforms.threads.root`: the first Threads post. Keep `replies` short enough to read as a sequence instead of pasted Instagram paragraphs.
- `sources`: at least one source object for review. Use an official or primary source for time-sensitive claims.

Paths are relative to the manifest folder. Never use absolute paths or `..` segments.
