#!/usr/bin/env node

import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const CANVASES = new Set(["1080x1350", "1080x1440"]);
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

function requireFile(root, relativePath, errors) {
  const filePath = path.resolve(root, relativePath);
  if (!isInside(root, filePath) || !fs.existsSync(filePath)) {
    errors.push(`Required package file is missing: ${relativePath}`);
    return false;
  }
  if (!fs.statSync(filePath).isFile() || fs.statSync(filePath).size === 0) {
    errors.push(`Required package file is empty: ${relativePath}`);
    return false;
  }
  return true;
}

function requireDirectory(root, relativePath, errors) {
  const directoryPath = path.resolve(root, relativePath);
  if (!isInside(root, directoryPath) || !fs.existsSync(directoryPath) || !fs.statSync(directoryPath).isDirectory()) {
    errors.push(`Required package directory is missing: ${relativePath}`);
    return false;
  }
  const entries = fs.readdirSync(directoryPath).filter((entry) => !entry.startsWith("."));
  if (entries.length === 0) errors.push(`Required package directory is empty: ${relativePath}`);
  return true;
}

function readJsonFile(root, relativePath, errors) {
  const filePath = path.resolve(root, relativePath);
  if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile() || fs.statSync(filePath).size === 0) return null;
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (error) {
    errors.push(`${relativePath} is not valid JSON: ${error.message}`);
    return null;
  }
}

function validatePackage(root, manifest, errors) {
  [
    "text.json",
    "image-plan.json",
    "captions/instagram.txt",
    "captions/threads.md",
    "sources.json",
    "qa/contact-sheet.png",
    "qa/report.md",
  ].forEach((relativePath) => requireFile(root, relativePath, errors));
  ["images/originals", "images/used"].forEach((relativePath) => requireDirectory(root, relativePath, errors));

  const pptxPattern = new RegExp(`^${manifest.slug}-editable-v\\d+\\.pptx$`);
  const editableFiles = fs.existsSync(root)
    ? fs.readdirSync(root).filter((entry) => pptxPattern.test(entry))
    : [];
  if (editableFiles.length === 0) errors.push(`Editable PPTX is missing: ${manifest.slug}-editable-vN.pptx`);

  const text = readJsonFile(root, "text.json", errors);
  if (text && (!Array.isArray(text.slides) || text.slides.length !== manifest.slides.length)) {
    errors.push("text.json.slides must match manifest.slides in length.");
  }
  const imagePlan = readJsonFile(root, "image-plan.json", errors);
  if (imagePlan && !Array.isArray(imagePlan.slides)) errors.push("image-plan.json.slides must be an array.");
  const sources = readJsonFile(root, "sources.json", errors);
  if (sources && (!Array.isArray(sources) || sources.length === 0)) errors.push("sources.json must contain at least one source.");
  if (Array.isArray(sources)) {
    sources.forEach((source, index) => {
      if (!nonEmpty(source?.id)) errors.push(`sources.json[${index}].id is required.`);
      if (!nonEmpty(source?.url)) errors.push(`sources.json[${index}].url is required.`);
    });
  }
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
  if (!nonEmpty(manifest.editorial_claim)) errors.push("editorial_claim is required.");
  if (!nonEmpty(manifest.design?.mode)) errors.push("design.mode is required.");
  if (!nonEmpty(manifest.design?.visual_mode)) errors.push("design.visual_mode is required.");

  const canvas = manifest.canvas;
  const canvasKey = `${canvas?.width}x${canvas?.height}`;
  if (!CANVASES.has(canvasKey)) errors.push("canvas must be 1080x1350 or 1080x1440.");

  if (!Array.isArray(manifest.slides) || manifest.slides.length < 4 || manifest.slides.length > 10) {
    errors.push("slides must contain 4–10 ordered items for Instagram-safe publishing.");
  }

  if (Array.isArray(manifest.slides)) {
    manifest.slides.forEach((slide, index) => {
      const label = `slides[${index}]`;
      if (!slide || typeof slide !== "object") {
        errors.push(`${label} must be an object.`);
        return;
      }
      if (!nonEmpty(slide.id)) errors.push(`${label}.id is required.`);
      if (!nonEmpty(slide.file)) {
        errors.push(`${label}.file is required.`);
        return;
      }
      if (!nonEmpty(slide.layout)) errors.push(`${label}.layout is required.`);
      if (!nonEmpty(slide.headline)) errors.push(`${label}.headline is required.`);
      if (!nonEmpty(slide.alt)) errors.push(`${label}.alt is required.`);
      if (!Array.isArray(slide.source_ids)) errors.push(`${label}.source_ids must be an array.`);
      if (index === 0 && slide.role !== "cover") errors.push("slides[0].role must be cover.");
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
  if (Array.isArray(manifest.sources)) {
    manifest.sources.forEach((source, index) => {
      if (!nonEmpty(source?.id)) errors.push(`sources[${index}].id is required.`);
      if (!nonEmpty(source?.url)) errors.push(`sources[${index}].url is required.`);
    });
  }

  if (manifest.slug && Array.isArray(manifest.slides)) validatePackage(root, manifest, errors);

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
    fs.mkdirSync(path.join(root, "images", "originals"), { recursive: true });
    fs.mkdirSync(path.join(root, "images", "used"), { recursive: true });
    fs.mkdirSync(path.join(root, "captions"));
    fs.mkdirSync(path.join(root, "qa"));
    for (let index = 1; index <= 4; index += 1) {
      fs.writeFileSync(path.join(root, "slides", `${String(index).padStart(2, "0")}.png`), makeTestPng(1080, 1350));
    }
    fs.writeFileSync(path.join(root, "images", "originals", "p01-original.png"), makeTestPng(10, 10));
    fs.writeFileSync(path.join(root, "images", "used", "p01-used.png"), makeTestPng(10, 10));
    fs.writeFileSync(path.join(root, "captions", "instagram.txt"), "캡션");
    fs.writeFileSync(path.join(root, "captions", "threads.md"), "첫 글");
    fs.writeFileSync(path.join(root, "qa", "contact-sheet.png"), makeTestPng(1080, 1350));
    fs.writeFileSync(path.join(root, "qa", "report.md"), "검수 완료");
    fs.writeFileSync(path.join(root, "self-test-editable-v1.pptx"), Buffer.from("PK\\x03\\x04"));
    fs.writeFileSync(path.join(root, "manifest.json"), JSON.stringify({
      slug: "self-test",
      title: "자체 검증",
      editorial_claim: "자체 검증이 통과한다",
      canvas: { width: 1080, height: 1350 },
      design: { mode: "editorial-magazine", visual_mode: "text-led" },
      slides: [1, 2, 3, 4].map((index) => ({
        id: `${String(index).padStart(2, "0")}-card`,
        file: `slides/${String(index).padStart(2, "0")}.png`,
        role: index === 1 ? "cover" : "body",
        layout: index === 1 ? "cover" : "text-image",
        headline: `카드 ${index}`,
        alt: `카드 ${index} 설명`,
        source_ids: ["src-01"],
      })),
      platforms: { instagram: { caption: "캡션" }, threads: { root: "첫 글", replies: [] } },
      sources: [{ id: "src-01", label: "self-test", url: "https://example.com", kind: "official", rights_status: "reference-only", accessed_at: "2026-08-21" }],
    }));
    fs.writeFileSync(path.join(root, "text.json"), JSON.stringify({ slides: [1, 2, 3, 4] }));
    fs.writeFileSync(path.join(root, "image-plan.json"), JSON.stringify({ slides: [{ slide_id: "01-card" }] }));
    fs.writeFileSync(path.join(root, "sources.json"), JSON.stringify([{ id: "src-01", url: "https://example.com" }]));
    const result = validateManifest(root);
    if (result.errors.length > 0) throw new Error(result.errors.join("\n"));
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
  console.log(`Card-news package structure OK: ${result.manifest.slides.length} slides, ${result.manifest.canvas.width}x${result.manifest.canvas.height}. Visual quality still requires full-size and 320px review.`);
  if (result.warnings.length > 0) console.warn(result.warnings.map((warning) => `WARN: ${warning}`).join("\n"));
}

main(process.argv.slice(2));
