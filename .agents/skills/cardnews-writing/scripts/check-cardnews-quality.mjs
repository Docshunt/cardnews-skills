#!/usr/bin/env node

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const QUALITY_SCORES = [
  "hierarchy",
  "legibility",
  "rhythm",
  "image_evidence",
  "anti_slop",
  "editability",
];
const TEMPLATE_LAYOUTS = [
  "cover",
  "text-image",
  "image-text",
  "text-image",
  "image-text-split",
  "image-text",
  "text-image",
  "centered-synthesis",
  "centered-close",
];
const ALLOWED_LAYOUTS = new Set(TEMPLATE_LAYOUTS);
const PLACEHOLDER_PATTERNS = [
  /lorem ipsum/i,
  /placeholder/i,
  /your (headline|copy|text)/i,
  /image prompt/i,
  /카피를 입력/i,
  /이미지를 넣어/i,
];

function readJson(filePath, errors, label) {
  if (!fs.existsSync(filePath)) {
    errors.push(`${label} is missing.`);
    return null;
  }
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (error) {
    errors.push(`${label} is not valid JSON: ${error.message}`);
    return null;
  }
}

function isInside(root, target) {
  const relative = path.relative(root, target);
  return relative === "" || (!relative.startsWith(`..${path.sep}`) && relative !== ".." && !path.isAbsolute(relative));
}

function safeRelativeFile(root, relativePath, label, errors) {
  if (typeof relativePath !== "string" || relativePath.trim() === "") {
    errors.push(`${label} must be a relative file path.`);
    return;
  }
  const resolved = path.resolve(root, relativePath);
  if (path.isAbsolute(relativePath) || relativePath.split(/[\\/]/).includes("..") || !isInside(root, resolved)) {
    errors.push(`${label} must stay inside the output folder: ${relativePath}`);
    return;
  }
  if (!fs.existsSync(resolved) || !fs.statSync(resolved).isFile() || fs.statSync(resolved).size === 0) {
    errors.push(`${label} does not point to a non-empty file: ${relativePath}`);
  }
}

function lineCount(value) {
  if (Array.isArray(value)) return value.join("\n").split(/\r?\n/).filter(Boolean).length;
  if (typeof value !== "string") return 0;
  return value.split(/\r?\n/).filter(Boolean).length;
}

function textValue(value) {
  if (Array.isArray(value)) return value.join("\n");
  return typeof value === "string" ? value : "";
}

function isSubsequence(actual, expected) {
  let cursor = 0;
  for (const item of actual) {
    while (cursor < expected.length && expected[cursor] !== item) cursor += 1;
    if (cursor === expected.length) return false;
    cursor += 1;
  }
  return true;
}

function checkQuality({ root, manifest, imagePlan, sources, designIterations, visualReview, inspectText, verifyFiles = true }) {
  const errors = [];
  const warnings = [];
  const slides = Array.isArray(manifest?.slides) ? manifest.slides : [];
  const sourceIds = new Set(Array.isArray(sources) ? sources.map((source) => source?.id).filter(Boolean) : []);
  const constraints = manifest?.design?.quality_constraints;

  if (!manifest || typeof manifest !== "object" || Array.isArray(manifest)) {
    errors.push("manifest.json must contain an object.");
    return { errors, warnings };
  }
  if (!Array.isArray(slides) || slides.length < 4 || slides.length > 10) {
    errors.push("manifest.slides must contain 4–10 slides.");
  }
  if (manifest.canvas?.width !== 1080 || manifest.canvas?.height !== 1350) {
    errors.push("The quality harness requires the shared 1080×1350 canvas.");
  }
  if (!manifest.design?.mode || !manifest.design?.visual_mode) {
    errors.push("manifest.design.mode and manifest.design.visual_mode are required.");
  }

  const requiredConstraints = [
    ["one_visual_proof_per_slide", true],
    ["source_media_preferred", true],
    ["baked_copy_in_raster", false],
    ["generic_ui_cards", false],
    ["decorative_fill", false],
    ["flattened_slide_background", false],
  ];
  for (const [key, expected] of requiredConstraints) {
    if (constraints?.[key] !== expected) {
      errors.push(`design.quality_constraints.${key} must be ${String(expected)}.`);
    }
  }

  const actualLayouts = slides.map((slide) => slide?.layout);
  const hasTemplateContract = Boolean(manifest.design?.template_contract || manifest.design?.template_sequence);
  if (hasTemplateContract) {
    if (!actualLayouts.every((layout) => ALLOWED_LAYOUTS.has(layout))) {
      errors.push("Template-following slides use an unsupported layout primitive.");
    }
    if (actualLayouts[0] !== "cover" || actualLayouts.at(-1) !== "centered-close") {
      errors.push("Template-following sequence must start with cover and end with centered-close.");
    }
    if (!isSubsequence(actualLayouts, TEMPLATE_LAYOUTS)) {
      errors.push("Template-following layouts must preserve the reference editorial sequence.");
    }
    if (manifest.design.template_sequence) {
      const declared = manifest.design.template_sequence;
      if (JSON.stringify(declared) !== JSON.stringify(actualLayouts)) {
        errors.push("design.template_sequence must match manifest.slides[].layout exactly.");
      }
    }
  }

  const slideIds = new Set();
  for (const [index, slide] of slides.entries()) {
    const label = `slides[${index}]`;
    if (!slide?.id || slideIds.has(slide.id)) errors.push(`${label}.id is missing or duplicated.`);
    slideIds.add(slide?.id);
    if (!slide?.headline || lineCount(slide.headline) > 2 || [...textValue(slide.headline)].length > 42) {
      errors.push(`${label}.headline must be a short, maximum-two-line hook.`);
    }
    if (lineCount(slide.body) > 7) errors.push(`${label}.body is too dense; keep it to seven lines or fewer.`);
    if (lineCount(slide.emphasis) > 3) errors.push(`${label}.emphasis is too dense; keep it to three lines or fewer.`);
    if (!Array.isArray(slide.source_ids)) errors.push(`${label}.source_ids must be an array.`);
    for (const sourceId of slide.source_ids ?? []) {
      if (!sourceIds.has(sourceId)) errors.push(`${label} references unknown source: ${sourceId}`);
    }
    const combinedCopy = [slide.headline, slide.body, slide.emphasis].map(textValue).join("\n");
    if (PLACEHOLDER_PATTERNS.some((pattern) => pattern.test(combinedCopy))) {
      errors.push(`${label} contains placeholder copy.`);
    }
    if (verifyFiles) {
      safeRelativeFile(root, slide.file, `${label}.file`, errors);
      safeRelativeFile(root, path.join("final-images", path.basename(slide.file)), `${label}.final_image`, errors);
    }
  }

  if (!Array.isArray(imagePlan?.slides) || imagePlan.slides.length !== slides.length) {
    errors.push("image-plan.json.slides must match manifest.slides exactly.");
  } else {
    const imageRecords = new Map(imagePlan.slides.map((record) => [record?.slide_id, record]));
    const assetCounts = new Map();
    for (const slide of slides) {
      const record = imageRecords.get(slide.id);
      if (!record) {
        errors.push(`image-plan.json is missing ${slide.id}.`);
        continue;
      }
      if (record.alt !== slide.alt) errors.push(`image-plan alt text must match ${slide.id}.alt.`);
      if (JSON.stringify(record.source_ids ?? []) !== JSON.stringify(slide.source_ids ?? [])) {
        errors.push(`image-plan source_ids must match ${slide.id}.source_ids.`);
      }
      if (!record.asset) continue;
      if (!Array.isArray(record.source_ids) || record.source_ids.length === 0) {
        errors.push(`image-plan ${slide.id}.source_ids is required for an image asset.`);
      }
      assetCounts.set(record.asset, (assetCounts.get(record.asset) ?? 0) + 1);
      for (const field of ["original_file", "used_file", "placement", "rights_status", "source_url"]) {
        if (!record[field]) errors.push(`image-plan ${slide.id}.${field} is required for an image asset.`);
      }
      if (record.source_url && !/^https:\/\//.test(record.source_url)) {
        errors.push(`image-plan ${slide.id}.source_url must be HTTPS.`);
      }
      if (verifyFiles) {
        safeRelativeFile(root, record.original_file, `image-plan ${slide.id}.original_file`, errors);
        safeRelativeFile(root, record.used_file, `image-plan ${slide.id}.used_file`, errors);
      }
    }
    for (const [asset, count] of assetCounts) {
      if (count > 2) warnings.push(`Visual asset ${asset} is reused ${count} times; confirm the carousel still feels editorial.`);
    }
  }

  for (const [index, source] of (Array.isArray(sources) ? sources : []).entries()) {
    if (!source?.id || !source?.url || !/^https:\/\//.test(source.url)) errors.push(`sources[${index}] needs an HTTPS url and id.`);
    if (!source?.rights_status) errors.push(`sources[${index}].rights_status is required.`);
  }

  if (!visualReview || typeof visualReview !== "object") {
    errors.push("qa/visual-review.json is required.");
  } else {
    if (!visualReview.reviewer || !visualReview.reference_quality_bar) errors.push("visual-review reviewer and reference_quality_bar are required.");
    if (verifyFiles) safeRelativeFile(root, visualReview.contact_sheet, "visual-review.contact_sheet", errors);
    const reviews = new Map((visualReview.slides ?? []).map((review) => [review?.slide_id, review]));
    if (reviews.size !== slides.length) errors.push("visual-review.json must contain one review per slide.");
    let minimum = 5;
    for (const slide of slides) {
      const review = reviews.get(slide.id);
      if (!review) {
        errors.push(`visual-review.json is missing ${slide.id}.`);
        continue;
      }
      for (const key of QUALITY_SCORES) {
        const score = review.scores?.[key];
        if (!Number.isInteger(score) || score < 1 || score > 5) errors.push(`${slide.id}.scores.${key} must be an integer from 1 to 5.`);
        minimum = Math.min(minimum, score ?? 0);
      }
      if (review.status !== "pass") errors.push(`${slide.id} visual review is not marked pass.`);
      if (!review.note) warnings.push(`${slide.id} visual review has no reviewer note.`);
    }
    if (minimum < 4) errors.push(`Visual review minimum score is ${minimum}; every category must be at least 4.`);
    if (visualReview.overall?.status !== "pass") errors.push("visual-review overall status must be pass.");
  }

  if (!designIterations || typeof designIterations !== "object" || Array.isArray(designIterations)) {
    errors.push("qa/design-iterations.json is required.");
  } else {
    const passes = Array.isArray(designIterations.passes) ? designIterations.passes : [];
    const changes = Array.isArray(designIterations.changes) ? designIterations.changes : [];
    const expectedSlideIds = [...slideIds].filter(Boolean).sort();
    const passIds = new Set();

    if (passes.length < 2) errors.push("design-iterations must retain at least a draft and a corrected final pass.");
    for (const [index, pass] of passes.entries()) {
      const label = `design-iterations.passes[${index}]`;
      if (!pass?.id || passIds.has(pass.id)) errors.push(`${label}.id is missing or duplicated.`);
      passIds.add(pass?.id);
      const reviewedSlideIds = (Array.isArray(pass?.reviewed_slide_ids) ? [...pass.reviewed_slide_ids] : []).sort();
      if (JSON.stringify(reviewedSlideIds) !== JSON.stringify(expectedSlideIds)) {
        errors.push(`${label}.reviewed_slide_ids must contain every manifest slide exactly once.`);
      }
      if (!Array.isArray(pass?.findings)) errors.push(`${label}.findings must be an array.`);
      for (const [findingIndex, finding] of (pass?.findings ?? []).entries()) {
        if (!slideIds.has(finding?.slide_id) || !finding?.issue || !finding?.recommended_change) {
          errors.push(`${label}.findings[${findingIndex}] needs a valid slide_id, issue, and recommended_change.`);
        }
      }
      if (verifyFiles) safeRelativeFile(root, pass?.contact_sheet, `${label}.contact_sheet`, errors);
    }

    const draft = passes[0];
    const finalPass = passes.at(-1);
    if (draft?.status !== "revise") errors.push("The first design iteration must be marked revise.");
    if (!Array.isArray(draft?.findings) || draft.findings.length === 0) errors.push("The draft design iteration must record at least one concrete finding.");
    if (finalPass?.status !== "pass") errors.push("The final design iteration must be marked pass.");
    if (!finalPass?.id || designIterations.final_pass !== finalPass.id) errors.push("design-iterations.final_pass must point to the last passing render.");
    if (changes.length === 0) errors.push("design-iterations must record at least one material design change.");

    const draftFindingSlides = new Set((draft?.findings ?? []).map((finding) => finding?.slide_id));
    for (const [index, change] of changes.entries()) {
      if (!slideIds.has(change?.slide_id) || !change?.from_pass || !change?.to_pass || !change?.change || !change?.reason) {
        errors.push(`design-iterations.changes[${index}] needs a valid slide_id, from_pass, to_pass, change, and reason.`);
        continue;
      }
      if (!passIds.has(change.from_pass) || !passIds.has(change.to_pass)) {
        errors.push(`design-iterations.changes[${index}] references an unknown pass.`);
      }
      if (!draftFindingSlides.has(change.slide_id)) {
        errors.push(`design-iterations.changes[${index}] must resolve a recorded draft finding.`);
      }
    }
  }

  if (!inspectText) {
    errors.push("An editable PPTX inspect record is required.");
  } else {
    const records = inspectText.split(/\r?\n/).filter(Boolean).map((line) => {
      try { return JSON.parse(line); } catch { return null; }
    }).filter(Boolean);
    const count = (kind) => records.filter((record) => record.kind === kind).length;
    if (count("slide") < slides.length) errors.push("Editable inspect record does not contain every slide.");
    if (count("textbox") < slides.length) errors.push("Editable inspect record contains too few text objects.");
    if (count("notes") < slides.length) errors.push("Editable inspect record does not contain speaker notes for every slide.");
    const plannedImageCount = Array.isArray(imagePlan?.slides) ? imagePlan.slides.filter((record) => record?.asset).length : 0;
    if (count("image") < plannedImageCount) {
      errors.push("Editable inspect record contains too few image objects for the image-led slides.");
    }
  }

  if (verifyFiles) {
    for (const required of ["qa/contact-sheet.png", "qa/design-iterations.json", "qa/report.md", "sources.json", "text.json", "image-plan.json"]) {
      safeRelativeFile(root, required, required, errors);
    }
  }
  return { errors, warnings };
}

function selfTest() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "cardnews-quality-"));
  try {
    fs.mkdirSync(path.join(root, "slides"));
    fs.mkdirSync(path.join(root, "final-images"));
    fs.mkdirSync(path.join(root, "qa", "iterations", "01-draft"), { recursive: true });
    fs.mkdirSync(path.join(root, "qa", "iterations", "02-final"), { recursive: true });
    for (let index = 1; index <= 4; index += 1) {
      fs.writeFileSync(path.join(root, "slides", `${index}.png`), "png");
      fs.writeFileSync(path.join(root, "final-images", `${index}.png`), "png");
    }
    fs.writeFileSync(path.join(root, "qa", "contact-sheet.png"), "png");
    fs.writeFileSync(path.join(root, "qa", "iterations", "01-draft", "contact-sheet.png"), "png");
    fs.writeFileSync(path.join(root, "qa", "iterations", "02-final", "contact-sheet.png"), "png");
    fs.writeFileSync(path.join(root, "qa", "design-iterations.json"), "{}");
    fs.writeFileSync(path.join(root, "qa", "report.md"), "report");
    fs.writeFileSync(path.join(root, "sources.json"), "[]");
    fs.writeFileSync(path.join(root, "text.json"), "{}");
    fs.writeFileSync(path.join(root, "image-plan.json"), "{}");
    const source = { id: "src-01", url: "https://example.com/source", rights_status: "reference-only" };
    const slides = [
      { id: "01-cover", file: "slides/1.png", layout: "cover", headline: "짧은 표지", body: "", emphasis: "", alt: "표지", source_ids: [source.id] },
      { id: "02-context", file: "slides/2.png", layout: "text-image", headline: "짧은 설명", body: "한 줄", emphasis: "한 줄", alt: "설명", source_ids: [source.id] },
      { id: "03-action", file: "slides/3.png", layout: "image-text", headline: "짧은 행동", body: "한 줄", emphasis: "한 줄", alt: "행동", source_ids: [source.id] },
      { id: "04-close", file: "slides/4.png", layout: "centered-close", headline: "짧은 마무리", body: "한 줄", emphasis: "한 줄", alt: "마무리", source_ids: [source.id] },
    ];
    const visualReview = {
      reviewer: "self-test",
      reference_quality_bar: "editorial",
      contact_sheet: "qa/contact-sheet.png",
      slides: slides.map((slide) => ({ slide_id: slide.id, status: "pass", note: "ok", scores: Object.fromEntries(QUALITY_SCORES.map((key) => [key, 4])) })),
      overall: { status: "pass" },
    };
    const designIterations = {
      passes: [
        {
          id: "01-draft",
          status: "revise",
          contact_sheet: "qa/iterations/01-draft/contact-sheet.png",
          reviewed_slide_ids: slides.map((slide) => slide.id),
          findings: [{ slide_id: "02-context", issue: "Evidence crop is too loose.", recommended_change: "Tighten the crop around the subject." }],
        },
        {
          id: "02-final",
          status: "pass",
          contact_sheet: "qa/iterations/02-final/contact-sheet.png",
          reviewed_slide_ids: slides.map((slide) => slide.id),
          findings: [],
        },
      ],
      changes: [{ slide_id: "02-context", from_pass: "01-draft", to_pass: "02-final", change: "Tightened the evidence crop.", reason: "The subject now reads at thumbnail size." }],
      final_pass: "02-final",
    };
    const result = checkQuality({
      root,
      manifest: {
        canvas: { width: 1080, height: 1350 },
        design: { mode: "editorial-magazine", visual_mode: "text-led", quality_constraints: {
          one_visual_proof_per_slide: true,
          source_media_preferred: true,
          baked_copy_in_raster: false,
          generic_ui_cards: false,
          decorative_fill: false,
          flattened_slide_background: false,
        } },
        slides,
      },
      imagePlan: { slides: slides.map((slide) => ({ slide_id: slide.id, asset: null, alt: slide.alt, source_ids: slide.source_ids })) },
      sources: [source],
      designIterations,
      visualReview,
      inspectText: slides.flatMap((slide) => [
        JSON.stringify({ kind: "slide", id: `sl/${slide.id}` }),
        JSON.stringify({ kind: "textbox", id: `sh/${slide.id}` }),
        JSON.stringify({ kind: "notes", id: `nt/${slide.id}` }),
      ]).join("\n") + "\n" + JSON.stringify({ kind: "image", id: "im/01" }),
    });
    if (result.errors.length > 0) throw new Error(result.errors.join("\n"));
    const missingChange = checkQuality({
      root,
      manifest: {
        canvas: { width: 1080, height: 1350 },
        design: { mode: "editorial-magazine", visual_mode: "text-led", quality_constraints: {
          one_visual_proof_per_slide: true,
          source_media_preferred: true,
          baked_copy_in_raster: false,
          generic_ui_cards: false,
          decorative_fill: false,
          flattened_slide_background: false,
        } },
        slides,
      },
      imagePlan: { slides: slides.map((slide) => ({ slide_id: slide.id, asset: null, alt: slide.alt, source_ids: slide.source_ids })) },
      sources: [source],
      designIterations: { ...designIterations, changes: [] },
      visualReview,
      inspectText: "",
      verifyFiles: false,
    });
    if (!missingChange.errors.some((error) => error.includes("at least one material design change"))) {
      throw new Error("Quality harness did not reject a design review with no material correction.");
    }
    console.log("Card-news quality harness self-test passed.");
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
}

function main(argv) {
  if (argv.includes("--self-test")) return selfTest();
  const outputDir = argv.find((value) => !value.startsWith("--"));
  if (!outputDir) {
    console.error("Usage: check-cardnews-quality.mjs <cardnews-output-dir>");
    console.error("       check-cardnews-quality.mjs --self-test");
    process.exitCode = 1;
    return;
  }

  const root = path.resolve(outputDir);
  const errors = [];
  const structureCheck = spawnSync(process.execPath, [
    path.join(path.dirname(fileURLToPath(import.meta.url)), "validate-cardnews.mjs"),
    root,
  ], { encoding: "utf8" });
  if (structureCheck.status !== 0) {
    errors.push(`validate-cardnews.mjs failed:\n${structureCheck.stderr || structureCheck.stdout}`);
  }

  const manifest = readJson(path.join(root, "manifest.json"), errors, "manifest.json");
  const imagePlan = readJson(path.join(root, "image-plan.json"), errors, "image-plan.json");
  const sources = readJson(path.join(root, "sources.json"), errors, "sources.json");
  const designIterations = readJson(path.join(root, "qa", "design-iterations.json"), errors, "qa/design-iterations.json");
  const visualReview = readJson(path.join(root, "qa", "visual-review.json"), errors, "qa/visual-review.json");
  const inspectFile = fs.existsSync(root) ? fs.readdirSync(root).find((file) => /^.+-editable-v\d+\.pptx\.inspect\.ndjson$/.test(file)) : null;
  const inspectText = inspectFile ? fs.readFileSync(path.join(root, inspectFile), "utf8") : "";
  const quality = checkQuality({ root, manifest, imagePlan, sources, designIterations, visualReview, inspectText });
  errors.push(...quality.errors);
  const warnings = [...quality.warnings];
  if (errors.length > 0) {
    console.error(errors.map((error) => `ERROR: ${error}`).join("\n"));
    process.exitCode = 1;
    return;
  }
  console.log(JSON.stringify({ status: "pass", output: root, warnings }, null, 2));
}

main(process.argv.slice(2));
