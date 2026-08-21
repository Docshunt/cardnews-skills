# Visual direction

Observed on 2026-08-10 from the public feeds of [교생지](https://www.instagram.com/gyosaengji.mag/) and [dy1](https://www.instagram.com/dy1.mag/), and from the supplied Canva AI transition deck. Learn the editorial grammar and production quality, not a brand's copy, logo, watermark, exact layout, or image.

## Shared grammar

- Portrait feed cards with a strong cover image or subject.
- One readable Korean hook carries the thumbnail.
- High-contrast type is placed over a darkened photo, lower-third gradient, or simple editorial background.
- A small recurring mark gives the carousel a magazine identity.
- Captions add context, source framing, a question or CTA, and a compact hashtag set.
- Posts mix interviews, field observations, explainers, tools, and timely issues rather than using one template for every story.

When the user says the result must match the supplied deck, use it as the acceptance benchmark. It is not enough to borrow the palette or make a neat carousel:

- Use a 1080×1350 portrait canvas with a decisive cover, large short headlines, and generous white space.
- Alternate visual bands so the sequence breathes: full-bleed cover, white text section with an image band, image-led section with text below, evidence or product-screen section, and a centered close.
- Let one visual prove the current sentence. A product screen, real photograph, or chart belongs only when it advances the claim.
- Keep the close sparse and memorable: a principle or next action first, a small logo second.
- Preserve editability. The reference deck reads as text, image, overlay, and logo objects—not one baked slide image.

The nine-slide reference demonstrates the expected rhythm: a full-bleed hook, alternating text-and-visual evidence cards, then one or two sparse centered closing cards. Do not force every story to nine slides; preserve the same pacing, information density, and finish. A card that is technically valid but cramped, visually flat, generic, or not independently editable is below the target.

## 교생지 signal

Use this signal for people-centered education, school-life, and interview stories:

- documentary classroom or workplace photography;
- warm or muted colors with a restrained accent;
- headline that names a real tension or a person's practice;
- context-rich caption that introduces the subject and invites the reader into the full interview;
- credit the contributor and source visibly when the story is collaborative.

## dy1 signal

Use this signal for business, people, and idea-led magazine briefs:

- portrait or object image as the dominant visual;
- bold lower-third headline with a darker gradient;
- very short, curiosity-driven cover copy;
- consistent small publication mark;
- direct, declarative framing that makes the grid read like a row of magazine covers.

## House defaults

Start with these values, then adapt to the user's brand:

```text
canvas: 1080×1350
safe area: 72px left/right, 96px top/bottom
slides: 6–8
headline: 1–2 lines, one idea
cover headline: about 84–112px; keep the hook to 1–2 lines
body headline: about 58–66px; body copy: 31–38px
quote: 42–48px serif when a real quote is central
body: remove secondary copy before shrinking it
source labels: 28px minimum; keep full URLs in the caption or sources file
accent: one color only, unless the brand already has a palette
mark: one small placement, never over the subject
```

Use a cream/white editorial base for how-to and briefing cards, and a photo-plus-gradient treatment for documentary and profile cards. For the reference-led treatment, use a full-bleed cover with a separate dark lower fade, clean black text on white body sections, and a small replaceable logo PNG.

For the supplied deck's level of finish, use near-white body backgrounds (`#FCFCFA`), near-black text (`#111111`), Pretendard or the user's equivalent Korean sans, one restrained accent, and a clear type ladder: cover around 84–112px, body headline around 58–66px, body around 31–38px, and source labels at least 28px. These are starting values, not permission to shrink a crowded card; shorten copy or change the composition first.

## Layout primitives

Use only the least decorative primitive that fits the story:

- `cover`: full-bleed image, separate dark lower fade, lower-left hook, small mark;
- `interview-quote`: small real photo plus a centered quote and attribution;
- `text-image`: text first, one evidence image or screen below;
- `image-text`: one evidence image or screen first, text below;
- `centered-close`: centered principle or action with generous whitespace and optional mark.

Keep the headline, body, emphasis, source label, logo, photo, and overlays as separate selectable objects. Do not use stickers, decorative icons, page numbers, meaningless charts, generic atmosphere stock, or a single flattened card image as the PPT background. Check long Korean lines in the editable view, not only in a PNG render.

At 320px wide, the cover hook and each slide headline should read without zooming. If a title wraps unexpectedly, shorten it or change the primitive; do not rely on automatic shrinking.
