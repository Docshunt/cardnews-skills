#!/usr/bin/env node

import { execFile } from "node:child_process";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const tempRoot = await fs.mkdtemp(path.join(os.tmpdir(), "cardnews-system-"));

async function command(commandPath, args, options = {}) {
  return execFileAsync(commandPath, args, { cwd: repoRoot, ...options });
}

async function readPptxPageSize(relativeDeckPath) {
  const { stdout } = await command("unzip", ["-p", relativeDeckPath, "ppt/presentation.xml"]);
  const match = stdout.match(/<p:sldSz\s+cx="(\d+)"\s+cy="(\d+)"/);
  if (!match) throw new Error(`Could not read the slide size from ${relativeDeckPath}.`);
  return { widthEmu: Number(match[1]), heightEmu: Number(match[2]) };
}

try {
  const registry = JSON.parse(await fs.readFile(path.join(repoRoot, "templates/cardnews/template-registry.json"), "utf8"));
  if (registry.copyPolicy !== "verbatim" || registry.templates.length < 2) throw new Error("Template registry is incomplete.");
  for (const template of registry.templates) {
    await fs.access(path.join(repoRoot, template.file));
    if (template.canvas?.renderPx?.width !== 1080 || template.canvas?.renderPx?.height !== 1350
      || template.canvas?.pptx?.widthEmu !== 10287000 || template.canvas?.pptx?.heightEmu !== 12858750) {
      throw new Error(`Card-news size contract is incomplete for ${template.id}.`);
    }
    const actualPptxSize = await readPptxPageSize(template.file);
    if (actualPptxSize.widthEmu !== template.canvas.pptx.widthEmu || actualPptxSize.heightEmu !== template.canvas.pptx.heightEmu) {
      throw new Error(`Approved PPTX page size does not match the registry for ${template.id}.`);
    }
    if (template.fixedType.bodyMinPt < 24 || template.fixedType.bodyEmphasisPt < 28 || template.fixedType.absoluteFloorPt < 22) {
      throw new Error(`Typography contract is incomplete for ${template.id}.`);
    }
  }

  const source = path.join(tempRoot, "source");
  const archive = path.join(tempRoot, "archive");
  await fs.mkdir(path.join(source, "outputs", "issue"), { recursive: true });
  await fs.mkdir(path.join(source, "work", "issue-build"), { recursive: true });
  await fs.mkdir(path.join(source, "tmp", "render"), { recursive: true });
  await fs.mkdir(path.join(source, "qa"), { recursive: true });
  await fs.writeFile(path.join(source, "outputs", "issue", "final.pptx"), "deck");
  await fs.writeFile(path.join(source, "work", "issue-build", "asset.jpg"), "asset");
  await fs.writeFile(path.join(source, "tmp", "render", "slide.png"), "image");
  await fs.writeFile(path.join(source, "qa", "report.md"), "checked");
  await command("bash", ["scripts/archive-cardnews-assets.sh", "20260903-120000-KST"], {
    env: { ...process.env, CARDNEWS_SOURCE_ROOT: source, CARDNEWS_ARCHIVE_ROOT: archive },
  });
  const archiveIndex = JSON.parse(await fs.readFile(path.join(archive, "20260903-120000-KST", "archive-index.json"), "utf8"));
  if (archiveIndex.copied_directories.length !== 4) throw new Error("Archive did not capture every required material directory.");
  await fs.access(path.join(archive, "20260903-120000-KST", "materials", "outputs", "issue", "final.pptx"));

  const jobDir = path.join(tempRoot, "job");
  await fs.mkdir(jobDir, { recursive: true });
  const content = {
    copy_policy: "verbatim",
    slides: Array.from({ length: registry.templates[0].slideCount }, (_, index) => ({
      template_slide: index + 1,
      text: { [`slot-${index + 1}`]: `원문 ${index + 1}` },
    })),
  };
  await fs.writeFile(path.join(jobDir, "content.json"), `${JSON.stringify(content)}\n`);
  await fs.writeFile(path.join(jobDir, "job.json"), `${JSON.stringify({
    version: 1,
    slug: "batch-system-test",
    template_id: registry.templates[0].id,
    content_file: "content.json",
    output_file: "batch-system-test-editable.pptx",
  })}\n`);
  const batchCheck = await command(process.execPath, ["scripts/build-cardnews-batch.mjs", "--job", path.join(jobDir, "job.json"), "--validate"]);
  if (!batchCheck.stdout.includes("VALID:")) throw new Error("Batch job validation did not report success.");

  const preflight = await command("bash", ["scripts/cardnews-session-preflight.sh", "--no-fetch"]);
  if (!preflight.stdout.includes("CARDNEWS_PREFLIGHT=OK")) throw new Error("Cached session preflight did not report success.");
  console.log("Card-news system tests passed.");
} finally {
  await fs.rm(tempRoot, { recursive: true, force: true });
}
