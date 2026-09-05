#!/usr/bin/env node

import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const CANVAS = { width: 1080, height: 1350 };
const LAYOUTS = new Set(["cover", "interview-quote", "text-image", "image-text", "centered-close"]);
const MIN_VISIBLE_FONT_SIZE_PT = 22;
const JPEG_SOFS = new Set([0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf]);

function nonEmpty(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function isInside(root, target) {
  const relative = path.relative(root, target);
  return relative === "" || (!relative.startsWith(`..${path.sep}`) && relative !== ".." && !path.isAbsolute(relative));
}

function readDimensions(filePath) {
  const data = fs.readFileSync(filePath);
  if (data.length >= 24 && data.readUInt32BE(0) === 0x89504e47 && data.toString("ascii", 1, 4) === "PNG") {
    return { width: data.readUInt32BE(16), height: data.readUInt32BE(20) };
  }
  if (data.length >= 4 && data[0] === 0xff && data[1] === 0xd8) {
    let offset = 2;
    while (offset + 9 < data.length) {
      if (data[offset] !== 0xff) { offset += 1; continue; }
      const marker = data[offset + 1];
      offset += 2;
      if (marker === 0xd8 || marker === 0xd9 || (marker >= 0xd0 && marker <= 0xd7)) continue;
      if (offset + 2 > data.length) break;
      const segmentLength = data.readUInt16BE(offset);
      if (segmentLength < 2 || offset + segmentLength > data.length) break;
      if (JPEG_SOFS.has(marker)) return { width: data.readUInt16BE(offset + 5), height: data.readUInt16BE(offset + 3) };
      offset += segmentLength;
    }
  }
  throw new Error(`Unsupported or unreadable raster image: ${filePath}`);
}

function requireRelativeFile(root, relativeFile, label, errors, extension) {
  if (!nonEmpty(relativeFile)) {
    errors.push(`${label} is required.`);
    return null;
  }
  const filePath = path.resolve(root, relativeFile);
  if (path.isAbsolute(relativeFile) || relativeFile.split(/[\\/]/).includes("..") || !isInside(root, filePath)) {
    errors.push(`${label} must stay inside the output folder: ${relativeFile}`);
    return null;
  }
  if (extension && !extension.test(filePath)) errors.push(`${label} must use ${extension}.`);
  if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile() || fs.statSync(filePath).size === 0) {
    errors.push(`${label} does not point to a non-empty file: ${relativeFile}`);
    return null;
  }
  return filePath;
}

export function validateManifest(outputDir, manifestName = "manifest.json") {
  const root = path.resolve(outputDir);
  const errors = [];
  const warnings = [];
  const manifestPath = path.resolve(root, manifestName);
  if (!fs.existsSync(manifestPath)) return { errors: [`Manifest not found: ${manifestPath}`], warnings, manifest: null };

  let manifest;
  try {
    manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  } catch (error) {
    return { errors: [`Manifest is not valid JSON: ${error.message}`], warnings, manifest: null };
  }
  if (!manifest || typeof manifest !== "object" || Array.isArray(manifest)) {
    return { errors: ["Manifest root must be a JSON object."], warnings, manifest };
  }

  if (!/^[-a-z0-9]+$/.test(manifest.slug ?? "")) errors.push("slug must be lowercase kebab-case.");
  if (!nonEmpty(manifest.title)) errors.push("title is required.");

  const editorial = manifest.editorial;
  if (!editorial || typeof editorial !== "object" || Array.isArray(editorial)) {
    errors.push("editorial with claim, reader_takeaway, narrative_arc, and hso is required.");
  } else {
    if (!nonEmpty(editorial.claim)) errors.push("editorial.claim is required.");
    if (!nonEmpty(editorial.reader_takeaway)) errors.push("editorial.reader_takeaway is required.");
    if (!Array.isArray(editorial.narrative_arc) || editorial.narrative_arc.length < 3 || editorial.narrative_arc.some((value) => !nonEmpty(value))) {
      errors.push("editorial.narrative_arc must contain at least three non-empty beats.");
    }
    const hso = editorial.hso;
    if (!hso || !nonEmpty(hso.hook) || !Array.isArray(hso.story) || hso.story.length < 2 || hso.story.some((value) => !nonEmpty(value)) || !nonEmpty(hso.offer) || hso.mode !== "editorial-soft-offer") {
      errors.push("editorial.hso requires hook, two or more story beats, offer, and mode editorial-soft-offer.");
    }
  }

  const design = manifest.design;
  if (!design || typeof design !== "object" || Array.isArray(design)) {
    errors.push("design is required.");
  } else {
    if (design.system !== "editorial-card-system") errors.push("design.system must be editorial-card-system.");
    if (!nonEmpty(design.mode)) errors.push("design.mode is required.");
    if (!nonEmpty(design.visual_mode)) errors.push("design.visual_mode is required.");
    for (const key of ["surface", "ink", "photo_overlay", "template_id"]) {
      if (!nonEmpty(design[key])) errors.push(`design.${key} is required.`);
    }
    if (!Array.isArray(design.template_sequence) || design.template_sequence.length === 0) errors.push("design.template_sequence is required.");
    if (!Number.isFinite(Number(design.typography?.min_font_size_pt)) || Number(design.typography.min_font_size_pt) < MIN_VISIBLE_FONT_SIZE_PT) {
      errors.push(`design.typography.min_font_size_pt must be at least ${MIN_VISIBLE_FONT_SIZE_PT}.`);
    }
    const constraints = design.quality_constraints;
    for (const [key, value] of Object.entries({
      one_visual_proof_per_slide: true,
      source_media_preferred: true,
      baked_copy_in_raster: false,
      generic_ui_cards: false,
      decorative_fill: false,
      flattened_slide_background: false,
      editable_source_required: true,
    })) {
      if (constraints?.[key] !== value) errors.push(`design.quality_constraints.${key} must be ${String(value)}.`);
    }
  }

  if (manifest.canvas?.width !== CANVAS.width || manifest.canvas?.height !== CANVAS.height) errors.push("canvas must be 1080x1350.");
  const hasLogo = Boolean(design?.mark?.white && design?.mark?.black);
  if (hasLogo && design.mark.placement !== "cover-and-final-only") errors.push("design.mark.placement must be cover-and-final-only.");

  const slides = manifest.slides;
  if (!Array.isArray(slides) || slides.length < 4 || slides.length > 10) {
    errors.push("slides must contain 4–10 ordered items.");
  } else {
    const IDs = new Set();
    const sourceIDs = new Set((manifest.sources ?? []).map((source) => source?.id).filter(Boolean));
    slides.forEach((slide, index) => {
      const label = `slides[${index}]`;
      if (!nonEmpty(slide?.id) || IDs.has(slide.id)) errors.push(`${label}.id is missing or duplicated.`);
      IDs.add(slide?.id);
      if (!nonEmpty(slide?.headline)) errors.push(`${label}.headline is required.`);
      if (!nonEmpty(slide?.alt)) errors.push(`${label}.alt is required.`);
      if (!LAYOUTS.has(slide?.layout)) errors.push(`${label}.layout must use an approved form.`);
      if (!Array.isArray(slide?.source_ids)) errors.push(`${label}.source_ids must be an array.`);
      for (const sourceID of slide?.source_ids ?? []) if (!sourceIDs.has(sourceID)) errors.push(`${label} references unknown source: ${sourceID}`);
      if (index === 0 && (slide.role !== "cover" || slide.layout !== "cover")) errors.push("slides[0] must be a cover using layout cover.");
      const rendered = requireRelativeFile(root, slide?.file, `${label}.file`, errors, /\.(png|jpe?g)$/i);
      if (rendered) {
        try {
          const dimensions = readDimensions(rendered);
          if (dimensions.width !== CANVAS.width || dimensions.height !== CANVAS.height) errors.push(`${label}.file must be 1080x1350.`);
        } catch (error) { errors.push(error.message); }
      }
      if ([...String(slide?.headline ?? "")].length > 42) warnings.push(`${label}.headline is long; inspect at thumbnail size.`);
    });
    if (design?.template_sequence && JSON.stringify(design.template_sequence) !== JSON.stringify(slides.map((slide) => slide.layout))) {
      errors.push("design.template_sequence must match slide layouts exactly.");
    }
    if (hasLogo && slides.at(-1)?.layout !== "centered-close") errors.push("DocsHunt logo requires centered-close as the final card.");
  }

  if (!nonEmpty(manifest.platforms?.instagram?.caption)) errors.push("platforms.instagram.caption is required.");
  if (!nonEmpty(manifest.platforms?.threads?.root)) errors.push("platforms.threads.root is required.");
  if (!Array.isArray(manifest.platforms?.threads?.replies)) warnings.push("platforms.threads.replies is missing; use [] for a text-only handoff.");
  if (!Array.isArray(manifest.sources) || manifest.sources.length === 0) errors.push("sources must contain at least one source.");
  for (const [index, source] of (manifest.sources ?? []).entries()) {
    if (!nonEmpty(source?.id) || !/^https:\/\//.test(source?.url ?? "") || !nonEmpty(source?.kind) || !nonEmpty(source?.rights_status)) {
      errors.push(`sources[${index}] requires id, HTTPS url, kind, and rights_status.`);
    }
  }
  requireRelativeFile(root, manifest.editable_pptx?.file, "editable_pptx.file", errors, /\.pptx$/i);
  return { errors, warnings, manifest };
}

function makePng(width, height) {
  const data = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=", "base64");
  data.writeUInt32BE(width, 16);
  data.writeUInt32BE(height, 20);
  return data;
}

function selfTest() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "cardnews-validator-"));
  try {
    fs.mkdirSync(path.join(root, "slides"));
    for (let index = 1; index <= 4; index += 1) fs.writeFileSync(path.join(root, "slides", `${index}.png`), makePng(1080, 1350));
    fs.writeFileSync(path.join(root, "self-test-editable-v1.pptx"), "PPTX");
    const source = { id: "src-01", label: "self-test", url: "https://example.com/source", kind: "official", rights_status: "reference-only" };
    const layouts = ["cover", "text-image", "image-text", "centered-close"];
    const manifest = {
      slug: "self-test",
      title: "자체 검증",
      editorial: { claim: "검증", reader_takeaway: "확인", narrative_arc: ["hook", "evidence", "close"], hso: { hook: "훅", story: ["setup", "evidence"], offer: "결론", mode: "editorial-soft-offer" } },
      canvas: CANVAS,
      design: {
        system: "editorial-card-system", mode: "editorial-magazine", visual_mode: "text-led", template_id: "self-test", template_sequence: layouts,
        surface: "#FCFCFA", ink: "#111111", photo_overlay: "rgba(0,0,0,.74)", typography: { min_font_size_pt: 22 },
        quality_constraints: { one_visual_proof_per_slide: true, source_media_preferred: true, baked_copy_in_raster: false, generic_ui_cards: false, decorative_fill: false, flattened_slide_background: false, editable_source_required: true },
      },
      editable_pptx: { file: "self-test-editable-v1.pptx" },
      slides: layouts.map((layout, index) => ({ id: `0${index + 1}`, file: `slides/${index + 1}.png`, role: index === 0 ? "cover" : index === layouts.length - 1 ? "close" : "context", layout, headline: `카드 ${index + 1}`, alt: `카드 ${index + 1} 설명`, source_ids: [source.id] })),
      platforms: { instagram: { caption: "캡션" }, threads: { root: "첫 글", replies: [] } },
      sources: [source],
    };
    fs.writeFileSync(path.join(root, "manifest.json"), JSON.stringify(manifest));
    const result = validateManifest(root);
    if (result.errors.length > 0) throw new Error(result.errors.join("\n"));
    manifest.design.typography.min_font_size_pt = 18;
    fs.writeFileSync(path.join(root, "manifest.json"), JSON.stringify(manifest));
    if (!validateManifest(root).errors.some((error) => error.includes("min_font_size_pt"))) throw new Error("Type floor was not enforced.");
    console.log("Card-news validator self-test passed.");
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
}

function main(argv) {
  if (argv.includes("--self-test")) return selfTest();
  const outputDir = argv.find((value) => !value.startsWith("--"));
  if (!outputDir) {
    console.error("Usage: validate-cardnews.mjs <cardnews-output-dir> [manifest-name]");
    console.error("       validate-cardnews.mjs --self-test");
    process.exitCode = 1;
    return;
  }
  const result = validateManifest(outputDir);
  if (result.errors.length > 0) {
    console.error(result.errors.map((error) => `ERROR: ${error}`).join("\n"));
    process.exitCode = 1;
    return;
  }
  console.log(`Card-news manifest OK: ${result.manifest.slides.length} slides, 1080x1350.`);
  if (result.warnings.length > 0) console.warn(result.warnings.map((warning) => `WARN: ${warning}`).join("\n"));
}

main(process.argv.slice(2));
