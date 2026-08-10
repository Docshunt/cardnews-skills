# Card-news manifest

Create `manifest.json` in the card-news output folder. It is intentionally small so the same package can feed a designer, a reviewer, a local validator, and a future publisher.

```json
{
  "slug": "teacher-workflow",
  "title": "교사의 시간을 돌려주는 작은 변화",
  "mode": "how-to",
  "editorial": {
    "claim": "교사의 시간을 줄이는 핵심은 새 도구가 아니라 업무 흐름을 다시 설계하는 일입니다.",
    "reader_takeaway": "이번 주에 바꿀 수 있는 반복 업무 하나를 고른다.",
    "narrative_arc": ["claim", "tension", "story", "evidence", "interpretation", "close"]
  },
  "canvas": { "width": 1080, "height": 1350 },
  "slides": [
    {
      "file": "slides/01-cover.png",
      "role": "cover",
      "headline": "교사의 시간을 돌려주는 작은 변화",
      "alt": "교사의 시간을 줄이는 방법을 소개하는 표지"
    },
    {
      "file": "slides/02-context.png",
      "role": "context",
      "headline": "문제는 도구가 아니라 흐름입니다",
      "alt": "반복 업무가 시간을 빼앗는 상황을 설명하는 카드"
    },
    {
      "file": "slides/03-action.png",
      "role": "action",
      "headline": "오늘 바로 바꿀 한 가지",
      "alt": "오늘 바로 적용할 한 가지 행동을 설명하는 카드"
    },
    {
      "file": "slides/04-close.png",
      "role": "close",
      "headline": "저장해 두고 다음 주에 확인하세요",
      "alt": "핵심 내용을 저장하고 실천하라는 마무리 카드"
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
    { "label": "공식 문서", "url": "https://example.com/source" }
  ]
}
```

## Required fields

- `slug`: one lowercase kebab-case path segment.
- `editorial`: record the supported `claim`, the reader's `reader_takeaway`, and the planned `narrative_arc`. Do not substitute a topic label for the claim. The claim can be an argued reading, but it must be distinguishable from the facts in the cards and sources.
- `canvas`: `1080×1350` is the default shared canvas; `1080×1440` is also accepted for the taller magazine treatment.
- `slides`: 4–10 ordered raster files. The first slide must have `role: "cover"`; every slide needs `file`, `headline`, and useful `alt` text. Use narrative roles such as `claim`, `tension`, `story`, `turn`, `evidence`, `interpretation`, and `close` when they make the sequence easier to review.
- `platforms.instagram.caption`: the final Instagram caption, including CTA and source notes when needed.
- `platforms.threads.root`: the first Threads post. Keep `replies` short enough to read as a sequence, not as copied Instagram paragraphs.
- `sources`: at least one source object for the review trail. Use an official or primary source for time-sensitive claims.

Paths are relative to the manifest folder. Never use absolute paths or `..` segments.
