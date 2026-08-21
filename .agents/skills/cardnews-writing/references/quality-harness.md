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
- source IDs that resolve to HTTPS sources with rights status;
- an editable PPTX inspect record containing text objects, image objects, and speaker notes;
- `qa/visual-review.json` with one 1–5 score for each category on every slide.

## Visual gate

Render every slide from the editable PPTX and inspect both the individual 1080×1350 images and the 320px-wide contact sheet. Score each slide on:

1. `hierarchy`: the hook, body, emphasis, and visual have an obvious order;
2. `legibility`: Korean line breaks, type size, contrast, and thumbnail read are clean;
3. `rhythm`: the card advances the story and preserves the reference's image/text alternation;
4. `image_evidence`: the image proves the current sentence instead of filling space;
5. `anti_slop`: no repeated dashboard grids, fake charts, stickers, generic stock, or AI-looking filler;
6. `editability`: the corresponding text, image, overlay, and logo remain separately selectable.

Every score must be 4 or 5. A score of 3 or below is a fix, not a warning. Record the reason, the fix, and any remaining source-asset limit in `qa/report.md`.

## Reference-led sequence

For the supplied Canva-quality deck, use this as the default subsequence:

```text
cover → text-image → image-text → text-image → image-text-split → image-text → text-image → centered-synthesis → centered-close
```

Omit a beat when the story is shorter, but preserve the opening hook, alternating visual bands, sparse synthesis, and quiet close. Keep all source-deck geometry in the editable starter and replace only the story copy and evidence media.
