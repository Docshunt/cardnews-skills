# 발표자료 설계표

발표자료 작업 폴더에 `deck-manifest.json`을 만든다. 이 파일은 발표의 주장, 슬라이드 순서, 텍스트, 사진 자리표시자, 출처를 한곳에서 검토하기 위한 설계표다.

~~~json
{
  "slug": "meeting-decisions",
  "title": "좋은 회의는 결정이 남습니다",
  "audience": "회의를 운영하는 팀 리더",
  "communication_job": "팀 리더가 회의의 품질을 말솜씨가 아니라 결정 기록으로 판단하게 한다.",
  "editorial": {
    "claim": "회의의 품질은 많이 말한 시간이 아니라, 다음 행동이 남았는지로 드러납니다.",
    "reader_takeaway": "회의를 마칠 때마다 결정, 담당자, 다음 시점을 한 줄로 남긴다.",
    "narrative_arc": ["claim", "context", "evidence", "interpretation", "close"]
  },
  "canvas": { "width": 1600, "height": 900 },
  "design": {
    "system": "editorial-presentation-template",
    "surface": "#FCFCFA",
    "ink": "#111111",
    "placeholder_fill": "#F1F1ED"
  },
  "slides": [
    {
      "order": 1,
      "role": "claim",
      "layout": "opening",
      "title": "좋은 회의는\n결정이 남습니다",
      "body": "회의가 끝난 뒤 무엇이 달라지는지로 품질을 확인합니다.",
      "image_placeholder": "사진: 회의 중인 인물 · 세로",
      "alt": "발표의 핵심 주장을 담은 표지"
    },
    {
      "order": 2,
      "role": "context",
      "layout": "text-image",
      "title": "회의는 끝났는데\n다음 일이 보이지 않을 때가 있습니다",
      "body": "논의한 내용과 결정한 내용이 섞이면, 회의 직후에도 담당자와 기한이 흐려집니다.",
      "image_placeholder": "사진: 회의실의 기록 장면 · 가로",
      "alt": "회의 맥락을 설명하는 글과 사진 자리"
    },
    {
      "order": 3,
      "role": "interpretation",
      "layout": "image-text",
      "title": "결정은 한 줄이어야\n다음 행동이 됩니다",
      "body": "무엇을, 누가, 언제까지 할지 남기면 회의는 말의 시간이 아니라 실행의 시작이 됩니다.",
      "image_placeholder": "사진: 노트에 쓰는 손 · 세로",
      "alt": "결정 기록의 의미를 설명하는 사진 자리와 글"
    },
    {
      "order": 4,
      "role": "voice",
      "layout": "quote",
      "quote": "“회의록은 기억이 아니라\n다음 행동을 위한 약속입니다.”",
      "source_line": "인용 출처: 최종 자료에서 확인",
      "image_placeholder": "사진: 발언 중인 인물 · 가로",
      "alt": "인용문과 인물 사진 자리를 담은 슬라이드"
    },
    {
      "order": 5,
      "role": "close",
      "layout": "centered-close",
      "title": "회의가 끝날 때\n다음 행동이 시작되어야 합니다",
      "body": "결정, 담당자, 다음 시점. 이 세 가지를 남깁니다.",
      "alt": "발표의 결론을 여백 있게 정리한 슬라이드"
    }
  ],
  "sources": [
    { "slide": 4, "label": "인용 원문", "url": "https://example.com/source" }
  ]
}
~~~

## 필수 항목

- `slug`: 소문자 케밥 표기 한 단어 경로.
- `audience`: 실제 발표를 듣는 사람.
- `communication_job`: 발표 뒤 청중이 이해·판단·결정·실행할 한 문장.
- `editorial`: 근거 있는 주장, 청중이 얻을 점, 최소 세 단계의 흐름.
- `canvas`: 모든 슬라이드에서 `1600×900`.
- `slides`: 순서, 역할, `opening`, `quote`, `text-image`, `image-text`, `centered-close` 중 하나의 `layout`, 읽을 수 있는 대체 설명.
- `image_placeholder`: 사진이 필요한 슬라이드에서 대상과 방향을 포함한 문구.
- `sources`: 실제 인용, 사진, 숫자, 비교가 있으면 슬라이드 번호와 원자료를 남긴다.

경로에는 절대 경로나 `..`를 사용하지 않는다. 발표자의 주장과 출처로 확인된 사실을 구별한다.
