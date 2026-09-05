# Card-news quality harness

Use the harness as a two-part gate. The deterministic check catches missing evidence and template drift; the visual review catches the things a file validator cannot see.

## Deterministic gate

Run:

```bash
node .agents/skills/cardnews-writing/scripts/validate-cardnews.mjs outputs/<slug>
node .agents/skills/cardnews-writing/scripts/check-cardnews-quality.mjs outputs/<slug>
```

The quality check requires:

- a 1080×1350 manifest with short, maximum-two-line headlines and bounded body density;
- a declared reference sequence when a supplied PPTX is the quality bar;
- explicit anti-slop constraints: no baked Korean copy, generic UI-card filler, decorative filler, or flattened slide background;
- one image-plan record per slide, with the original asset, used asset, placement, source URL, rights status, and alt text connected;
- one full-resolution user-facing PNG under `final-images/` for every manifest slide;
- source IDs that resolve to HTTPS sources with rights status;
- an editable PPTX inspect record containing text objects, image objects, and speaker notes;
- `qa/design-iterations.json` proving a complete draft review and at least one material correction before the final render;
- `qa/visual-review.json` with one 1–5 score for each category on every slide.

## Mandatory design iteration loop

Do not score the first render as final. Run this loop on the rendered deck:

1. Save the complete first render and its contact sheet under `qa/iterations/01-draft/`.
2. Inspect every slide at full size and 320px width. Record all reviewed slide IDs and concrete findings in `qa/design-iterations.json`; mark the pass `revise`.
3. Apply at least one material correction based on the render: improve hierarchy, crop, spacing, contrast, Korean line breaks, visual rhythm, or evidence choice. Decorative churn does not count.
4. Rerender the complete deck into the next numbered iteration and inspect every slide again. Repeat when any issue remains.
5. Mark only the corrected final pass `pass`, copy that pass into both `slides/` and `final-images/`, copy its contact sheet to `qa/contact-sheet.png`, then write `qa/visual-review.json` from the final images.

`qa/design-iterations.json` must contain at least two passes, every manifest slide ID in each pass's `reviewed_slide_ids`, one or more draft findings, one or more corresponding changes, and a `final_pass` that points to the last passing render. Keep each pass's contact sheet so the improvement can be checked instead of inferred from prose.

## Visual gate

Render every slide from the editable PPTX and inspect both the individual 1080×1350 images and the 320px-wide contact sheet. Score each slide on:

1. `hierarchy`: the hook, body, emphasis, and visual have an obvious order;
2. `legibility`: Korean line breaks, type size, contrast, and thumbnail read are clean;
3. `rhythm`: the card advances the story and preserves the reference's image/text alternation;
4. `image_evidence`: the image proves the current sentence instead of filling space;
5. `anti_slop`: no repeated dashboard grids, fake charts, stickers, generic stock, or AI-looking filler;
6. `editability`: the corresponding text, image, overlay, and logo remain separately selectable.

Every final score must be 4 or 5. A score of 3 or below is another iteration, not a warning. Record the reason, the applied change, and any remaining source-asset limit in `qa/report.md`.

## Reference-led sequence

For an approved source deck, preserve its inherited sequence using only the five defined forms:

```text
cover → text-image → image-text → text-image → image-text → centered-close
```

Shorter stories may omit a middle beat, but keep the opening hook, alternating visual bands, and quiet close. Keep all source-deck geometry in the editable starter and replace only declared copy and evidence-media slots.
