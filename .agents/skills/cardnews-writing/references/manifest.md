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
    "narrative_arc": ["claim", "setup", "complication", "evidence", "interpretation", "close"]
  },
  "design": {
    "system": "editorial-card-system",
    "surface": "#FCFCFA",
    "ink": "#111111",
    "photo_overlay": "rgba(0, 0, 0, .74)",
    "mark": "YOUR BRAND"
  },
  "canvas": { "width": 1080, "height": 1350 },
  "slides": [
    {
      "file": "slides/01-cover.png",
      "role": "cover",
      "layout": "cover",
      "headline": "가장 큰 회사는\n가장 조용할 수도 있습니다",
      "alt": "인물 사진 위에 조용한 회사에 대한 주장을 담은 표지"
    },
    {
      "file": "slides/02-context.png",
      "role": "setup",
      "layout": "text-image",
      "headline": "1. 큰 회사인데도, 얼굴을 아는 사람이 없습니다.",
      "alt": "회사의 배경을 설명하는 글과 창업자 사진"
    },
    {
      "file": "slides/03-turn.png",
      "role": "interpretation",
      "layout": "image-text",
      "headline": "2. 보이지 않는 방식이 원칙이었습니다.",
      "alt": "인물 사진과 회사의 선택을 설명하는 글"
    },
    {
      "file": "slides/04-close.png",
      "role": "close",
      "layout": "centered-close",
      "headline": "보여줄 필요가 없었던 겁니다.",
      "alt": "글의 결론을 여백 있게 정리한 카드"
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
- `editorial`: the supported `claim`, the reader's `reader_takeaway`, and a `narrative_arc` with at least three beats. The claim may be an editorial reading, but it must remain distinguishable from sourced facts.
- `design`: use `editorial-card-system` with one shared `surface`, `ink`, and `photo_overlay`. `mark` is optional; remove it from the page when the user has no publication mark. Do not add an accent-colour token.
- `canvas`: `1080×1350` for every slide.
- `slides`: 4–10 ordered raster files. The first slide must have `role: "cover"`; every slide needs `file`, `layout`, `headline`, and useful `alt` text. `layout` must be one of `cover`, `interview-quote`, `text-image`, `image-text`, or `centered-close`.
- `platforms.instagram.caption`: the final Instagram caption, including source notes or CTA when needed.
- `platforms.threads.root`: the first Threads post. Keep `replies` short enough to read as a sequence instead of pasted Instagram paragraphs.
- `sources`: at least one source object for review. Use an official or primary source for time-sensitive claims.

Paths are relative to the manifest folder. Never use absolute paths or `..` segments.
