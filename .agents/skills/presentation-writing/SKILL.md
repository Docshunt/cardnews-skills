---
name: presentation-writing
description: Create Korean editorial presentation decks in a restrained 16:9 photograph-and-type treatment. Use when turning a brief, article, interview, announcement, proposal, or source material into a PowerPoint deck with a clear claim, five fixed slide forms, editable Korean text, and deliberately labeled image-placeholder shapes for the user to replace with photographs later.
---

# Editorial Presentation Writing

Create a Korean presentation that reads like a short editorial argument: one claim, enough context to understand it, grounded interpretation, and a deliberate final sentence. Build the text and composition first. Leave photographs as removable, labeled shape placeholders unless the user explicitly supplies or requests images.

## Workflow

1. Identify the audience, the communication job, factual sources, and the one sentence the deck must leave behind. A topic is not a claim; turn a title such as `회의 의사결정` into a clear, supportable reading.
2. Write a cumulative story before laying out slides: `claim → context → evidence or voice → interpretation → close`. Give every slide one job and one primary message. Split dense material over more slides instead of shrinking it.
3. Create `deck-manifest.json` first. Follow [references/deck-manifest.md](references/deck-manifest.md), choose a supplied form for every slide, and keep the source trail with the deck.
4. Read [references/visual-direction.md](references/visual-direction.md) before writing copy or changing the composition. Use only the five forms described there.
5. Start from [assets/editorial-presentation-template.pptx](assets/editorial-presentation-template.pptx). Replace the sample copy while preserving the 16:9 canvas, margins, type hierarchy, and image zones. If a fresh copy is needed, run `scripts/create-editorial-template.mjs`.
6. Use only editable text boxes and removable image-placeholder shapes. A placeholder must state the needed subject and crop, such as `사진: 발표 중인 인물 · 가로`. Do not generate a Korean title inside an image. Do not search for or generate images unless the user asks.
7. Keep facts, figures, quotations, and proposed outcomes distinct. Add a readable source line on a fact or quotation slide and include `[Sources]` in that slide's speaker notes. Do not invent names, dates, prices, quotations, or data.
8. Review the deck at full size and in presenter-view scale. Check reading order, text fit, Korean legibility, placeholder placement, speaker-note sources, and that every non-cover slide advances the argument. Resolve every overlap, clipping, accidental wrap, or empty placeholder before handoff.

## Five fixed forms

- `opening`: a concise claim on the left and one full-height photograph placeholder on the right.
- `quote`: one attributable sentence on quiet paper and a thinly bordered landscape photograph placeholder.
- `text-image`: explanatory title and body first, then a wide photograph placeholder to the right.
- `image-text`: photograph placeholder first on the left, then title and explanation to the right.
- `centered-close`: no photograph; one conclusion centered in generous white space.

For a five-slide deck, use `opening → text-image → image-text → quote → centered-close`. Omit `quote` only when no attributable quote is available; replace it with another evidence or interpretation slide in one of the two text-and-image forms. Do not add agenda, section-divider, thank-you, page-number, CTA, or decorative statement slides merely to lengthen the deck.

## Text and image rules

- Use Pretendard for every visible Korean text element: titles, body copy, quotations, source lines, and image-placeholder labels. Vary weight, size, and alignment instead of changing typeface.
- Keep opening titles to 2–4 short lines. Keep slide titles declarative and bodies brief; cut or split copy before reducing type below the sizes in the visual direction.
- Bold and underline only the factual turn, interpretation, or final reading. Keep the underline black, straight, and typographic.
- Treat a future photograph as evidence: specify a person, scene, object, document, or place directly related to the slide's message. Do not request decorative stock atmosphere.
- When the user inserts an image, delete the corresponding placeholder rectangle and let the photograph occupy that exact rectangle. Do not round its corners, add a shadow, or add a frame. The quote slide's thin black photo border is the one exception.

## Visual restrictions

- Use only black, white, warm off-white, and neutral gray placeholders. Do not add point colors, icons, stickers, decorative shapes, colored highlights, charts, or ornamental frames.
- Do not add top categories, page numbers, complex headers, logo stacks, or a generic footer. A small source line is allowed only where an image, figure, or quotation needs attribution.
- Do not put multiple unrelated messages, mini-cards, or long bullet inventories on one slide.
- Preserve open space. The effect must come from one sentence, one clean image zone, and a calm rhythm—not from decoration.

## Handoff

- Give the user only the completed deck, a brief summary of the slide count and text status, and any source or image choices still needed.
- Keep the final deck editable. Do not rasterize text, placeholder shapes, or source lines.
- Save issue-specific decks, source notes, and previews separately from this reusable skill. Improve this skill only with reusable layouts, guidance, or validation.
