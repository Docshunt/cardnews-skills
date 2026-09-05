#!/usr/bin/env node

import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

const repoRoot = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const workspaceRoot = path.resolve(repoRoot, "../..");
const registryPath = path.join(repoRoot, "templates/cardnews/template-registry.json");
const args = process.argv.slice(2);
const CARD_RENDER_SIZE = { width: 1080, height: 1350 };
const CARD_PPTX_SIZE = { widthEmu: 10287000, heightEmu: 12858750, widthIn: 11.25, heightIn: 14.0625 };

function usage() {
  return [
    "Usage:",
    "  node scripts/build-cardnews-batch.mjs --job <job.json> [--validate]",
    "  node scripts/build-cardnews-batch.mjs --jobs-dir <directory> [--validate]",
  ].join("\n");
}

function option(name) {
  const index = args.indexOf(name);
  return index >= 0 ? args[index + 1] : undefined;
}

function isInside(root, target) {
  const relative = path.relative(root, target);
  return relative === "" || (!relative.startsWith(`..${path.sep}`) && relative !== ".." && !path.isAbsolute(relative));
}

function sha256(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

async function readJson(filePath, label) {
  try {
    return JSON.parse(await fs.readFile(filePath, "utf8"));
  } catch (error) {
    throw new Error(`${label} is not valid JSON: ${error.message}`);
  }
}

async function resolveJob(jobPath, registry) {
  const absoluteJobPath = path.resolve(jobPath);
  const jobRoot = path.dirname(absoluteJobPath);
  const job = await readJson(absoluteJobPath, "Job file");
  const errors = [];
  if (job?.version !== 1) errors.push("job.version must be 1.");
  if (!/^[-a-z0-9]+$/.test(job?.slug ?? "")) errors.push("job.slug must be lowercase kebab-case.");
  if (typeof job?.template_id !== "string") errors.push("job.template_id is required.");
  if (typeof job?.content_file !== "string" || path.isAbsolute(job.content_file)) errors.push("job.content_file must be a relative path.");
  if (typeof job?.output_file !== "string" || !/\.pptx$/i.test(job.output_file)) errors.push("job.output_file must end in .pptx.");
  const template = registry.templates.find((entry) => entry.id === job.template_id);
  if (!template) errors.push(`Unknown template_id: ${job.template_id}`);
  if (template) {
    const renderSize = template.canvas?.renderPx;
    const pptxSize = template.canvas?.pptx;
    if (renderSize?.width !== CARD_RENDER_SIZE.width || renderSize?.height !== CARD_RENDER_SIZE.height) {
      errors.push(`Template ${template.id} must render at ${CARD_RENDER_SIZE.width}x${CARD_RENDER_SIZE.height}.`);
    }
    if (pptxSize?.widthEmu !== CARD_PPTX_SIZE.widthEmu || pptxSize?.heightEmu !== CARD_PPTX_SIZE.heightEmu
      || pptxSize?.widthIn !== CARD_PPTX_SIZE.widthIn || pptxSize?.heightIn !== CARD_PPTX_SIZE.heightIn) {
      errors.push(`Template ${template.id} must retain the approved 11.25x14.0625 in PPTX page size.`);
    }
  }

  const contentPath = typeof job?.content_file === "string" ? path.resolve(jobRoot, job.content_file) : null;
  if (contentPath && !isInside(jobRoot, contentPath)) errors.push("job.content_file must stay inside the job folder.");
  let content = null;
  if (contentPath && isInside(jobRoot, contentPath)) {
    try {
      content = await readJson(contentPath, "Content file");
    } catch (error) {
      errors.push(error.message);
    }
  }

  if (content) {
    if (content.copy_policy !== "verbatim") errors.push('content.copy_policy must be "verbatim".');
    if (!Array.isArray(content.slides)) errors.push("content.slides must be an array.");
    const slideNumbers = new Set();
    for (const [index, slide] of (content.slides ?? []).entries()) {
      const label = `content.slides[${index}]`;
      if (!Number.isInteger(slide?.template_slide) || slide.template_slide < 1 || slide.template_slide > (template?.slideCount ?? 0)) {
        errors.push(`${label}.template_slide must be an existing template slide.`);
      } else if (slideNumbers.has(slide.template_slide)) {
        errors.push(`${label}.template_slide is duplicated.`);
      } else {
        slideNumbers.add(slide.template_slide);
      }
      if (!slide?.text || typeof slide.text !== "object" || Array.isArray(slide.text) || Object.keys(slide.text).length === 0) {
        errors.push(`${label}.text must declare at least one inherited text slot.`);
      } else if (Object.entries(slide.text).some(([name, value]) => !name.trim() || typeof value !== "string")) {
        errors.push(`${label}.text must map non-empty slot names to exact strings.`);
      }
      if (slide.images !== undefined && !Array.isArray(slide.images)) errors.push(`${label}.images must be an array when provided.`);
      for (const [imageIndex, image] of (slide.images ?? []).entries()) {
        const imageLabel = `${label}.images[${imageIndex}]`;
        if (!Number.isInteger(image?.image_index) || image.image_index < 0) errors.push(`${imageLabel}.image_index must be a non-negative integer.`);
        if (typeof image?.file !== "string" || path.isAbsolute(image.file)) errors.push(`${imageLabel}.file must be a relative path.`);
        if (typeof image?.alt !== "string" || !image.alt.trim()) errors.push(`${imageLabel}.alt is required.`);
        if (image?.fit !== undefined && !["cover", "contain"].includes(image.fit)) errors.push(`${imageLabel}.fit must be cover or contain.`);
        if (!Number.isFinite(image?.frame?.width) || !Number.isFinite(image?.frame?.height) || image.frame.width <= 0 || image.frame.height <= 0) {
          errors.push(`${imageLabel}.frame width and height are required for pre-crop verification.`);
        }
        if (!image?.source || typeof image.source !== "object") {
          errors.push(`${imageLabel}.source must record provenance.`);
        } else {
          if (!["user-provided", "licensed", "official", "pinterest-original", "generated"].includes(image.source.kind)) {
            errors.push(`${imageLabel}.source.kind must identify the asset origin.`);
          }
          if (typeof image.source.rights_status !== "string" || !image.source.rights_status.trim()) {
            errors.push(`${imageLabel}.source.rights_status is required.`);
          }
          if (!["user-provided", "generated"].includes(image.source.kind) && (typeof image.source.url !== "string" || !image.source.url.trim())) {
            errors.push(`${imageLabel}.source.url is required for externally sourced assets.`);
          }
        }
      }
    }
    if (template && slideNumbers.size !== template.slideCount) {
      errors.push(`content.slides must map all ${template.slideCount} source slides exactly once; use a matching approved template rather than leaving source copy behind.`);
    }
  }

  const templatePath = template ? path.resolve(repoRoot, template.file) : null;
  if (templatePath && !isInside(repoRoot, templatePath)) errors.push("Template file must stay inside the repository.");
  try {
    if (templatePath) await fs.access(templatePath);
  } catch {
    errors.push(`Template file is missing: ${template?.file}`);
  }

  if (errors.length > 0) throw new Error(errors.join("\n"));
  return { job, content, jobRoot, absoluteJobPath, contentPath, template, templatePath };
}

function contentFileForImage(jobRoot, image) {
  const imagePath = path.resolve(jobRoot, image.file);
  if (!isInside(jobRoot, imagePath)) throw new Error(`Image path must stay inside the job folder: ${image.file}`);
  return imagePath;
}

function contentType(filePath) {
  const extension = path.extname(filePath).toLowerCase();
  if (extension === ".png") return "image/png";
  if (extension === ".jpg" || extension === ".jpeg") return "image/jpeg";
  if (extension === ".webp") return "image/webp";
  throw new Error(`Unsupported image type: ${filePath}`);
}

async function imageDimensions(filePath) {
  const data = await fs.readFile(filePath);
  if (data.length >= 24 && data.readUInt32BE(0) === 0x89504e47 && data.toString("ascii", 1, 4) === "PNG") {
    return { width: data.readUInt32BE(16), height: data.readUInt32BE(20) };
  }
  if (data.length >= 4 && data[0] === 0xff && data[1] === 0xd8) {
    const sof = new Set([0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf]);
    let offset = 2;
    while (offset + 9 < data.length) {
      if (data[offset] !== 0xff) {
        offset += 1;
        continue;
      }
      const marker = data[offset + 1];
      offset += 2;
      if (marker === 0xd8 || marker === 0xd9 || (marker >= 0xd0 && marker <= 0xd7)) continue;
      const length = data.readUInt16BE(offset);
      if (length < 2 || offset + length > data.length) break;
      if (sof.has(marker)) return { width: data.readUInt16BE(offset + 5), height: data.readUInt16BE(offset + 3) };
      offset += length;
    }
  }
  throw new Error(`Unsupported or unreadable raster image: ${filePath}`);
}

async function assertAssets(prepared) {
  for (const slide of prepared.content.slides) {
    for (const image of slide.images ?? []) {
      const imagePath = contentFileForImage(prepared.jobRoot, image);
      await fs.access(imagePath);
      const dimensions = await imageDimensions(imagePath);
      const ratioDelta = Math.abs((dimensions.width / dimensions.height) - (image.frame.width / image.frame.height));
      if (ratioDelta > 0.01) {
        throw new Error(`Prepared image ratio does not match the inherited frame on slide ${slide.template_slide}: ${image.file}. Run prepare-cardnews-image.mjs before building.`);
      }
    }
  }
}

async function writeBlob(filePath, blob) {
  await fs.writeFile(filePath, new Uint8Array(await blob.arrayBuffer()));
}

async function build(prepared) {
  await assertAssets(prepared);
  const outputRoot = path.resolve(process.env.CARDNEWS_OUTPUT_ROOT || path.join(workspaceRoot, "outputs"));
  const outputDir = path.resolve(outputRoot, prepared.job.slug);
  if (!isInside(outputRoot, outputDir)) throw new Error("Output must stay inside workspace outputs/.");
  try {
    await fs.access(outputDir);
    throw new Error(`Refusing to overwrite existing output: ${outputDir}`);
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
  await fs.mkdir(outputDir, { recursive: true });

  const runtimeNodeModules = process.env.RUNTIME_NODE_MODULES;
  if (!runtimeNodeModules) throw new Error("RUNTIME_NODE_MODULES is required. Load the workspace presentation dependencies first.");
  const artifactToolPath = path.join(runtimeNodeModules, "@oai", "artifact-tool", "dist", "artifact_tool.mjs");
  const { FileBlob, PresentationFile } = await import(pathToFileURL(artifactToolPath).href);
  const deck = await PresentationFile.importPptx(await FileBlob.load(prepared.templatePath));

  const frameMap = { template_id: prepared.template.id, output_slides: [] };
  for (const slideSpec of prepared.content.slides) {
    const slideIndex = slideSpec.template_slide - 1;
    const slide = deck.slides.items[slideIndex];
    if (!slide) throw new Error(`Template slide missing: ${slideSpec.template_slide}`);
    const textTargets = [];
    for (const [slotName, text] of Object.entries(slideSpec.text)) {
      const shape = slide.shapes.items.find((item) => item.name === slotName);
      if (!shape) throw new Error(`Missing inherited text slot on slide ${slideSpec.template_slide}: ${slotName}`);
      const existingStyle = shape.text.style;
      shape.text = text;
      shape.text.style = existingStyle;
      textTargets.push(slotName);
    }
    const imageTargets = [];
    for (const imageSpec of slideSpec.images ?? []) {
      const image = slide.images.items[imageSpec.image_index];
      if (!image) throw new Error(`Missing inherited image slot on slide ${slideSpec.template_slide}: ${imageSpec.image_index}`);
      const filePath = contentFileForImage(prepared.jobRoot, imageSpec);
      const frame = image.frame;
      const geometry = image.geometry;
      const borderRadius = image.borderRadius;
      const rotation = image.rotation;
      const flipHorizontal = image.flipHorizontal;
      const flipVertical = image.flipVertical;
      await image.replace({
        blob: await fs.readFile(filePath),
        contentType: contentType(filePath),
        alt: imageSpec.alt,
        fit: imageSpec.fit ?? "cover",
      });
      image.frame = frame;
      image.fit = imageSpec.fit ?? "cover";
      image.crop = { left: 0, top: 0, right: 0, bottom: 0 };
      image.geometry = geometry;
      image.borderRadius = borderRadius;
      image.rotation = rotation;
      image.flipHorizontal = flipHorizontal;
      image.flipVertical = flipVertical;
      image.lockAspectRatio = true;
      imageTargets.push({ image_index: imageSpec.image_index, file: imageSpec.file });
    }
    if (slideSpec.notes_sources) {
      slide.speakerNotes.textFrame.setText(["[Sources]", ...slideSpec.notes_sources].join("\n"));
      slide.speakerNotes.setVisible(true);
    }
    frameMap.output_slides.push({
      output_slide: slideSpec.template_slide,
      source_slide: slideSpec.template_slide,
      reuse_mode: "in-place-inherited-edit",
      text_targets: textTargets,
      image_targets: imageTargets,
    });
  }

  const renderDir = path.join(outputDir, "slides");
  await fs.mkdir(renderDir, { recursive: true });
  for (const [index, slide] of deck.slides.items.entries()) {
    const stem = String(index + 1).padStart(2, "0");
    await writeBlob(path.join(renderDir, `${stem}.png`), await deck.export({ slide, format: "png", scale: 1 }));
  }
  await writeBlob(path.join(outputDir, "slide-montage.webp"), await deck.export({ format: "webp", montage: true, scale: 1 }));

  const finalDeckPath = path.join(outputDir, prepared.job.output_file);
  const pptx = await PresentationFile.exportPptx(deck);
  await pptx.save(finalDeckPath);
  const contentBytes = await fs.readFile(prepared.contentPath);
  await fs.writeFile(path.join(outputDir, "template-frame-map.json"), `${JSON.stringify(frameMap, null, 2)}\n`);
  await fs.writeFile(path.join(outputDir, "copy-lock.json"), `${JSON.stringify({
    copy_policy: prepared.content.copy_policy,
    content_file: path.relative(prepared.jobRoot, prepared.contentPath),
    content_sha256: sha256(contentBytes),
    template_id: prepared.template.id,
  }, null, 2)}\n`);
  await fs.copyFile(prepared.absoluteJobPath, path.join(outputDir, "batch-job.json"));
  await fs.copyFile(prepared.contentPath, path.join(outputDir, "content.verbatim.json"));
  console.log(JSON.stringify({ output: finalDeckPath, slides: deck.slides.items.length, template: prepared.template.id }));
}

async function findJobs(directory) {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isFile() && entry.name.endsWith(".json") && !entry.name.endsWith(".content.json"))
    .map((entry) => path.join(directory, entry.name))
    .sort();
}

async function main() {
  const jobArg = option("--job");
  const jobsDir = option("--jobs-dir");
  const validateOnly = args.includes("--validate");
  if ((jobArg ? 1 : 0) + (jobsDir ? 1 : 0) !== 1) throw new Error(usage());
  const registry = await readJson(registryPath, "Template registry");
  const jobPaths = jobArg ? [path.resolve(jobArg)] : await findJobs(path.resolve(jobsDir));
  if (jobPaths.length === 0) throw new Error("No batch jobs found.");
  for (const jobPath of jobPaths) {
    const prepared = await resolveJob(jobPath, registry);
    if (validateOnly) {
      console.log(`VALID: ${path.basename(jobPath)} → ${prepared.template.id}`);
    } else {
      await build(prepared);
    }
  }
}

main().catch((error) => {
  console.error(error.message ?? error);
  process.exitCode = 1;
});
