# Visual direction

This is a narrow, reference-led grammar for Korean editorial card-news. Learn the supplied approved decks' hierarchy, density, image crop, whitespace, slide rhythm, and object editability. Do not copy another publisher's logo, words, watermarks, exact layout, or imagery.

## Non-negotiable visual system

The default DocsHunt issue is a calm editorial carousel: off-white/white paper, black Korean type, one meaningful real visual where one is needed, and no decorative system added because the topic changed.

- A cover is photo first, claim second: one full-bleed evidence image, lower dark fade, and a short white assertion.
- Story cards use a clean horizontal text/image divide. Alternate image position to create rhythm, but preserve source-deck image frames exactly.
- Quote cards use a single modest bordered landscape photo and a centered, attributable quote on quiet paper.
- Closing cards are sparse and centered. They end with an implication worth saving—not thanks, engagement bait, or a visual flourish.
- Use black ink, white/near-white paper, and image colour only. Do not introduce accent colours, header labels, page numbers, badges, stickers, fake charts, decorative dashboards, icons, or generic stock atmosphere.
- The source deck is the template. Edit declared slots in place; do not rebuild a compatible approved card from scratch.

## Five approved forms

| Form | Composition | Use |
| --- | --- | --- |
| `cover` | Full-bleed evidence photo; separate lower dark gradient; 2–4 line white claim; small mark. | A person, company, event, or object with one recognisable image. |
| `interview-quote` | Near-white paper; `800×480–520px` bordered landscape photo in upper middle; centered quote below. | A real direct quote. |
| `text-image` | White copy in upper ~51%; edge-to-edge evidence image in lower ~49%. | Setup, chronology, decision, or evidence. |
| `image-text` | Edge-to-edge evidence image in upper ~52%; white copy in lower ~48%. | Image-first evidence, then explanation. |
| `centered-close` | Quiet paper; centered title, short explanation, conclusion. | The final saved implication. |

Repeat only two or three forms across an issue. Preserve the opening hook, alternating evidence/text rhythm, and quiet close even in a shorter sequence. Every visual needs to prove the current sentence, not occupy empty space.

## Type and copy rules

- Use one Korean sans family for heading and reading copy. Korean serif is permitted only for a real interview quotation.
- The minimum visible size is `22 pt` / `30px` for every element. Standard DocsHunt sizes are: cover title `80 pt`, story heading `38 pt`, body `24 pt` or larger, emphasis `28 pt`.
- Do not make an overcrowded card fit by shrinking type, automatic scaling, narrow tracking, or stacked boxes. Preserve user-finalized copy verbatim; use a compatible inherited form or add a card when the user approves the new story structure.
- Use an underline only for the factual turn or central interpretation. It is straight, black, and typographic—not a coloured highlighter.
- Keep short Korean lines, with a visible pause between paragraphs. A card should read as one compact paragraph, not an isolated bullet dump.

## Photograph and crop rules

1. Choose user-provided original media first. Then use a commissioned/self-shot or official source, an original rights-bearing source discovered through Google/Pinterest, licensed/public-domain media, and only then a generated non-factual concept.
2. Use an actual photograph, primary document, interface, archive, or evidence scene. Do not use generic office/laptop décor to decorate text.
3. Preserve image aspect ratio. Copy the original into `images/originals/`, use `scripts/prepare-cardnews-image.mjs` to crop a new asset to the exact inherited frame ratio, save it in `images/used/`, insert it with `cover`, and lock aspect ratio. Never stretch, squash, or independently resize an axis.
4. On covers, keep faces outside the title zone where a crop can do so. Use the separate lower fade only for contrast, never as an excuse for text across a face.
5. Keep real people, products, events, statistics, screenshots, and quotes documentary. Do not substitute generated factual imagery. Never put Korean text inside a generated raster.

## Canvas and surfaces

```text
upload canvas:       1080 × 1350 px
editable PPT page:   11.25 × 14.0625 in (10287000 × 12858750 EMU)
story safe inset:    72px left/right, 74–96px top/bottom
story image split:   about 51/49 or 52/48 (only as inherited)
quote image:         800px × 480–520px, 2px black frame
paper:               #FCFCFA, optional imperceptible monochrome grain
ink:                 #111111
cover fade:          transparent upper half to near-black lower section
```

## DocsHunt mark

Use `docshunt-white.png` only on the first cover and `docshunt-black.png` only on the final close. Keep it small, secondary, separately selectable, and clear of the main subject. Never repeat it on intermediate cards.

## Review questions

At full size and as a 320px-wide contact sheet, reject and revise if any answer is no:

- Does the cover read as one sentence before any secondary element?
- Does every slide visibly belong to one approved form?
- Does each image prove its sentence and retain natural proportions?
- Are the headline, body, and emphasis clearly ordered and readable?
- Is every Korean line, image, overlay, and mark independently editable in the PPTX?
- Are all visible texts at or above the hard type floor?
- Have generic filler, page numbers, accent decoration, and invented evidence been removed?
- For a DocsHunt issue, is the logo present only on the first and final cards?
