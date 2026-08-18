#!/usr/bin/env node

import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const CANVASES = new Set(["1080x1350"]);
const LAYOUTS = new Set(["cover", "interview-quote", "text-image", "image-text", "centered-close"]);
const JPEG_SOFS = new Set([
  0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf,
]);

function readDimensions(filePath) {
  const data = fs.readFileSync(filePath);

  if (data.length >= 24 && data.readUInt32BE(0) === 0x89504e47 && data.toString("ascii", 1, 4) === "PNG") {
    return { width: data.readUInt32BE(16), height: data.readUInt32BE(20) };
  }

  if (data.length >= 4 && data[0] === 0xff && data[1] === 0xd8) {
    let offset = 2;
    while (offset + 9 < data.length) {
      if (data[offset] !== 0xff) {
        offset += 1;
        continue;
      }

      const marker = data[offset + 1];
      offset += 2;
      if (marker === 0xd8 || marker === 0xd9 || (marker >= 0xd0 && marker <= 0xd7)) continue;
      if (offset + 2 > data.length) break;

      const segmentLength = data.readUInt16BE(offset);
      if (segmentLength < 2 || offset + segmentLength > data.length) break;
      if (JPEG_SOFS.has(marker)) {
        return { width: data.readUInt16BE(offset + 5), height: data.readUInt16BE(offset + 3) };
      }
      offset += segmentLength;
    }
  }

  throw new Error(`Unsupported or unreadable raster image: ${filePath}`);
}

function isInside(root, target) {
  const relative = path.relative(root, target);
  return relative === "" || (!relative.startsWith(`..${path.sep}`) && relative !== ".." && !path.isAbsolute(relative));
}

function nonEmpty(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function validateManifest(outputDir, manifestName = "manifest.json") {
  const root = path.resolve(outputDir);
  const manifestPath = path.resolve(root, manifestName);
  const errors = [];
  const warnings = [];
  let manifest;

  if (!fs.existsSync(manifestPath)) {
    return { errors: [`Manifest not found: ${manifestPath}`], warnings, manifest: null };
  }

  try {
    manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  } catch (error) {
    return { errors: [`Manifest is not valid JSON: ${error.message}`], warnings, manifest: null };
  }

  if (!manifest || typeof manifest !== "object" || Array.isArray(manifest)) {
    errors.push("Manifest root must be a JSON object.");
    return { errors, warnings, manifest };
  }

  if (!/^[-a-z0-9]+$/.test(manifest.slug ?? "")) errors.push("slug must be lowercase kebab-case.");
  if (!nonEmpty(manifest.title)) errors.push("title is required.");

  const editorial = manifest.editorial;
  if (!editorial || typeof editorial !== "object" || Array.isArray(editorial)) {
    errors.push("editorial with claim, reader_takeaway, and narrative_arc is required.");
  } else {
    if (!nonEmpty(editorial.claim)) errors.push("editorial.claim is required.");
    if (!nonEmpty(editorial.reader_takeaway)) errors.push("editorial.reader_takeaway is required.");
    if (!Array.isArray(editorial.narrative_arc) || editorial.narrative_arc.length < 3) {
      errors.push("editorial.narrative_arc must contain at least three story beats.");
    } else if (editorial.narrative_arc.some((beat) => !nonEmpty(beat))) {
      errors.push("editorial.narrative_arc must contain only non-empty story beats.");
    }
  }

  const design = manifest.design;
  if (!design || typeof design !== "object" || Array.isArray(design)) {
    errors.push("design with editorial-card-system tokens is required.");
  } else {
    if (design.system !== "editorial-card-system") errors.push("design.system must be editorial-card-system.");
    for (const token of ["surface", "ink", "photo_overlay"]) {
      if (!nonEmpty(design[token])) errors.push(`design.${token} is required.`);
    }
  }

  const canvas = manifest.canvas;
  const canvasKey = `${canvas?.width}x${canvas?.height}`;
  if (!CANVASES.has(canvasKey)) errors.push("canvas must be 1080x1350.");

  if (!Array.isArray(manifest.slides) || manifest.slides.length < 2 || manifest.slides.length > 20) {
    errors.push("slides must contain 2–20 ordered items. Choose the count from the completed story, not a template quota.");
  }

  if (Array.isArray(manifest.slides)) {
    manifest.slides.forEach((slide, index) => {
      const label = `slides[${index}]`;
      if (!slide || typeof slide !== "object") {
        errors.push(`${label} must be an object.`);
        return;
      }
      if (!nonEmpty(slide.file)) {
        errors.push(`${label}.file is required.`);
        return;
      }
      if (!nonEmpty(slide.headline)) errors.push(`${label}.headline is required.`);
      if (!nonEmpty(slide.alt)) errors.push(`${label}.alt is required.`);
      if (!LAYOUTS.has(slide.layout)) errors.push(`${label}.layout must be one of: ${[...LAYOUTS].join(", ")}.`);
      if (index === 0 && slide.role !== "cover") errors.push("slides[0].role must be cover.");
      if (index === 0 && slide.layout !== "cover") errors.push("slides[0].layout must be cover.");
      if ([...String(slide.headline ?? "")].length > 34) warnings.push(`${label}.headline is long; check it at thumbnail size.`);

      const relativeFile = String(slide.file);
      const imagePath = path.resolve(root, relativeFile);
      if (path.isAbsolute(relativeFile) || !isInside(root, imagePath)) {
        errors.push(`${label}.file must stay inside the output folder: ${relativeFile}`);
        return;
      }
      if (!fs.existsSync(imagePath)) {
        errors.push(`${label}.file does not exist: ${relativeFile}`);
        return;
      }
      if (!/\.(png|jpe?g)$/i.test(imagePath)) {
        errors.push(`${label}.file must be PNG or JPEG: ${relativeFile}`);
        return;
      }
      try {
        const dimensions = readDimensions(imagePath);
        if (dimensions.width !== canvas?.width || dimensions.height !== canvas?.height) {
          errors.push(`${label}.file is ${dimensions.width}x${dimensions.height}; expected ${canvasKey}.`);
        }
      } catch (error) {
        errors.push(error.message);
      }
    });
  }

  if (!nonEmpty(manifest.platforms?.instagram?.caption)) errors.push("platforms.instagram.caption is required.");
  if (!nonEmpty(manifest.platforms?.threads?.root)) errors.push("platforms.threads.root is required.");
  if (!Array.isArray(manifest.platforms?.threads?.replies)) warnings.push("platforms.threads.replies is missing; use [] for a text-only handoff.");
  if (!Array.isArray(manifest.sources) || manifest.sources.length === 0) errors.push("sources must contain at least one source.");

  const editablePptx = manifest.editable_pptx;
  if (!editablePptx || typeof editablePptx !== "object" || Array.isArray(editablePptx)) {
    errors.push("editable_pptx with a relative .pptx file is required.");
  } else if (!nonEmpty(editablePptx.file)) {
    errors.push("editable_pptx.file is required.");
  } else {
    const relativeDeck = String(editablePptx.file);
    const deckPath = path.resolve(root, relativeDeck);
    if (path.isAbsolute(relativeDeck) || !isInside(root, deckPath)) {
      errors.push(`editable_pptx.file must stay inside the output folder: ${relativeDeck}`);
    } else if (!/\.pptx$/i.test(deckPath)) {
      errors.push("editable_pptx.file must end in .pptx.");
    } else if (!fs.existsSync(deckPath)) {
      errors.push(`editable_pptx.file does not exist: ${relativeDeck}`);
    } else if (fs.statSync(deckPath).size === 0) {
      errors.push(`editable_pptx.file is empty: ${relativeDeck}`);
    }
  }

  return { errors, warnings, manifest };
}

function makeTestPng(width, height) {
  const data = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=", "base64");
  data.writeUInt32BE(width, 16);
  data.writeUInt32BE(height, 20);
  return data;
}

function selfTest() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "cardnews-validator-"));
  try {
    fs.mkdirSync(path.join(root, "slides"));
    for (let index = 1; index <= 4; index += 1) {
      fs.writeFileSync(path.join(root, "slides", `${String(index).padStart(2, "0")}.png`), makeTestPng(1080, 1350));
    }
    fs.writeFileSync(path.join(root, "self-test-editable.pptx"), "PPTX");
    const manifest = {
      slug: "self-test",
      title: "자체 검증",
      editorial: {
        claim: "좋은 카드뉴스는 주장으로 시작합니다.",
        reader_takeaway: "한 문장 주장을 먼저 쓴다.",
        narrative_arc: ["claim", "evidence", "interpretation", "close"],
      },
      design: {
        system: "editorial-card-system",
        surface: "#FCFCFA",
        ink: "#171717",
        photo_overlay: "rgba(0, 0, 0, .74)",
      },
      canvas: { width: 1080, height: 1350 },
      editable_pptx: { file: "self-test-editable.pptx" },
      slides: [1, 2, 3, 4].map((index) => ({
        file: `slides/${String(index).padStart(2, "0")}.png`,
        role: index === 1 ? "cover" : "body",
        layout: index === 1 ? "cover" : "text-image",
        headline: `카드 ${index}`,
        alt: `카드 ${index} 설명`,
      })),
      platforms: { instagram: { caption: "캡션" }, threads: { root: "첫 글", replies: [] } },
      sources: [{ label: "self-test", url: "https://example.com" }],
    };
    fs.writeFileSync(path.join(root, "manifest.json"), JSON.stringify(manifest));
    const result = validateManifest(root);
    if (result.errors.length > 0) throw new Error(result.errors.join("\n"));

    delete manifest.editorial;
    fs.writeFileSync(path.join(root, "manifest.json"), JSON.stringify(manifest));
    const missingEditorial = validateManifest(root);
    if (!missingEditorial.errors.includes("editorial with claim, reader_takeaway, and narrative_arc is required.")) {
      throw new Error("Missing editorial metadata was not rejected.");
    }

    manifest.editorial = {
      claim: "좋은 카드뉴스는 주장으로 시작합니다.",
      reader_takeaway: "한 문장 주장을 먼저 쓴다.",
      narrative_arc: ["claim", "evidence", "interpretation", "close"],
    };
    delete manifest.design;
    fs.writeFileSync(path.join(root, "manifest.json"), JSON.stringify(manifest));
    const missingDesign = validateManifest(root);
    if (!missingDesign.errors.includes("design with editorial-card-system tokens is required.")) {
      throw new Error("Missing design metadata was not rejected.");
    }

    manifest.design = {
      system: "editorial-card-system",
      surface: "#FCFCFA",
      ink: "#171717",
      photo_overlay: "rgba(0, 0, 0, .74)",
    };
    manifest.slides[1].layout = "poster";
    fs.writeFileSync(path.join(root, "manifest.json"), JSON.stringify(manifest));
    const invalidLayout = validateManifest(root);
    if (!invalidLayout.errors.some((error) => error.startsWith("slides[1].layout must be one of:"))) {
      throw new Error("Invalid layout was not rejected.");
    }

    manifest.slides[1].layout = "text-image";
    manifest.editable_pptx = { file: "slides/01.png" };
    fs.writeFileSync(path.join(root, "manifest.json"), JSON.stringify(manifest));
    const invalidDeck = validateManifest(root);
    if (!invalidDeck.errors.includes("editable_pptx.file must end in .pptx.")) {
      throw new Error("Non-PPTX editable deck was not rejected.");
    }
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

  const manifestName = argv.find((value, index) => index > argv.indexOf(outputDir) && !value.startsWith("--")) ?? "manifest.json";
  const result = validateManifest(outputDir, manifestName);
  if (result.errors.length > 0) {
    console.error(result.errors.map((error) => `ERROR: ${error}`).join("\n"));
    process.exitCode = 1;
    return;
  }
  console.log(`Card-news OK: ${result.manifest.slides.length} slides, ${result.manifest.canvas.width}x${result.manifest.canvas.height}.`);
  if (result.warnings.length > 0) console.warn(result.warnings.map((warning) => `WARN: ${warning}`).join("\n"));
}

main(process.argv.slice(2));
