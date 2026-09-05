# Card-news manifest

Create `manifest.json` before rendering. It remains the source of truth for script, layout, provenance, inherited slide slots, output order, and editable source deck.

```json
{
  "slug": "teacher-workflow",
  "title": "교사의 시간을 돌려주는 작은 변화",
  "mode": "how-to",
  "editorial": {
    "claim": "작은 흐름 변경이 반복 업무 시간을 돌려준다.",
    "reader_takeaway": "반복 업무는 도구보다 흐름을 먼저 바꾼다.",
    "narrative_arc": ["hook", "context", "evidence", "interpretation", "close"],
    "hso": {
      "hook": "교사의 시간을 돌려주는 작은 변화",
      "story": ["context", "evidence", "interpretation"],
      "offer": "한 가지 흐름부터 저장하고 바꾼다.",
      "mode": "editorial-soft-offer"
    }
  },
  "canvas": { "width": 1080, "height": 1350 },
  "design": {
    "system": "editorial-card-system",
    "mode": "editorial-magazine",
    "visual_mode": "photo-led",
    "template_id": "murakami-routine-v2",
    "template_sequence": ["cover", "text-image", "image-text", "centered-close"],
    "surface": "#FCFCFA",
    "ink": "#111111",
    "photo_overlay": "rgba(0, 0, 0, .74)",
    "typography": { "min_font_size_pt": 22 },
    "quality_constraints": {
      "baked_copy_in_raster": false,
      "generic_ui_cards": false,
      "decorative_fill": false,
      "flattened_slide_background": false,
      "editable_source_required": true
    },
    "mark": {
      "white": "assets/brand/docshunt-white.png",
      "black": "assets/brand/docshunt-black.png",
      "placement": "cover-and-final-only"
    }
  },
  "editable_pptx": { "file": "teacher-workflow-editable-v1.pptx" },
  "slides": [
    {
      "id": "01-cover",
      "file": "slides/01-cover.png",
      "role": "cover",
      "layout": "cover",
      "headline": "교사의 시간을\n돌려주는 작은 변화",
      "body": [],
      "emphasis": "반복 업무를 줄이는 한 가지 흐름",
      "alt": "교사의 반복 업무를 줄이는 방법을 소개하는 표지",
      "copy_labels": { "headline": "hook" },
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
      "copy_labels": { "headline": "fact", "body": "fact", "emphasis": "editorial_interpretation" },
      "source_ids": ["src-01"]
    },
    {
      "id": "03-close",
      "file": "slides/03-close.png",
      "role": "close",
      "layout": "centered-close",
      "headline": "저장해 두고\n다음 주에 확인하세요",
      "body": ["핵심 내용을 저장하고 실천합니다."],
      "emphasis": "한 가지 흐름부터 바꿔보세요.",
      "alt": "핵심 내용을 저장하고 실천하라는 마무리 카드",
      "copy_labels": { "headline": "offer", "body": "editorial_interpretation", "emphasis": "offer" },
      "source_ids": ["src-01"]
    }
  ],
  "platforms": {
    "instagram": { "caption": "캡션 본문과 출처, CTA" },
    "threads": { "root": "핵심 훅", "replies": ["맥락", "근거", "해석", "출처와 CTA"] }
  },
  "sources": [
    { "id": "src-01", "label": "공식 문서", "url": "https://example.com/source", "kind": "official", "rights_status": "reference-only", "accessed_at": "2026-09-06" }
  ]
}
```

## Required contract

- `slug` is one lowercase kebab-case path segment. Canvas is exactly `1080×1350` for all upload cards.
- `editorial` records supported claim, reader takeaway, narrative arc, and HSO. The claim may be editorial interpretation, but must be distinguishable from source facts.
- `design.system` is `editorial-card-system`; use its shared surface, ink, and photo overlay. `design.typography.min_font_size_pt` is `22` or larger.
- Set `design.template_id` to the selected registry entry and preserve its inherited frames, fonts, geometry, and spacing. `template_sequence` declares the selected forms.
- For a DocsHunt issue, set separate logo paths and `placement: "cover-and-final-only"`. White appears only on the first `cover`; black only on the final `centered-close`.
- `editable_pptx.file` is an output-relative versioned `.pptx`; it contains all cards in the same order and all visual elements as independently editable objects.
- An issue has 4–10 cards. Each slide needs `id`, `file`, `role`, allowed `layout`, `headline`, useful `alt`, `copy_labels`, and `source_ids`. Allowed forms: `cover`, `interview-quote`, `text-image`, `image-text`, `centered-close`.
- A user-finalized headline/body/quote includes its exact line breaks in `text.json`; copy it into the inherited PPTX text slot verbatim.
- `sources` use stable IDs, direct original URLs, kind, rights status, and retrieval date. Google/Pinterest/repost URLs are discovery references, not a final source trail.

## Derived package

Keep these relative paths beside the manifest:

```text
text.json                         # copy-only view using the same slide IDs
image-plan.json                   # original/used asset, crop, placement, alt, source URL, rights
<slug>-editable-vN.pptx           # editable native source
slides/                           # final rendered cards
final-images/                     # same final cards for handoff/upload
images/originals/                 # unchanged original media
images/used/                      # precise crop/correction placed in the deck
captions/instagram.txt
captions/threads.md
sources.json
qa/design-iterations.json
qa/iterations/01-draft/
qa/contact-sheet.png
qa/visual-review.json
qa/report.md
```

`image-plan.json` has one record per slide. Any image-bearing record includes `original_file`, `used_file`, `placement`, `alt`, `rights_status`, `source_url`, and `source_ids`; a text-only slide uses `asset: null`. The QA history retains a reviewed `revise` draft and corrected `pass` final; every final visual score is 4 or 5.
