#!/usr/bin/env node

import { execFile } from "node:child_process";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const runtimeNode = process.env.RUNTIME_NODE || process.execPath;
const tempRoot = await fs.mkdtemp(path.join(os.tmpdir(), "cardnews-batch-build-"));
const outputRoot = path.join(tempRoot, "outputs");

const murakamiSlots = [
  "card-1-headline",
  "card-2-headline",
  "card-3-headline",
  "card-5-headline",
  "card-7-headline",
  "card-6-headline",
  "card-4-headline",
  "card-2-headline",
  "card-8-headline",
];

try {
  if (!process.env.RUNTIME_NODE_MODULES) {
    throw new Error("RUNTIME_NODE_MODULES is required for the editable-PPTX integration test.");
  }
  const jobDir = path.join(tempRoot, "job");
  await fs.mkdir(jobDir, { recursive: true });
  const content = {
    copy_policy: "verbatim",
    slides: murakamiSlots.map((slot, index) => ({
      template_slide: index + 1,
      text: { [slot]: `검증 원문 ${index + 1}` },
      notes_sources: ["https://example.com/cardnews-batch-test"],
    })),
  };
  const job = {
    version: 1,
    slug: "batch-build-integration-test",
    template_id: "murakami-routine-v2",
    content_file: "content.json",
    output_file: "batch-build-integration-test-editable.pptx",
  };
  await fs.writeFile(path.join(jobDir, "content.json"), `${JSON.stringify(content)}\n`);
  await fs.writeFile(path.join(jobDir, "job.json"), `${JSON.stringify(job)}\n`);
  await execFileAsync(runtimeNode, ["scripts/build-cardnews-batch.mjs", "--job", path.join(jobDir, "job.json")], {
    cwd: repoRoot,
    env: { ...process.env, CARDNEWS_OUTPUT_ROOT: outputRoot },
  });
  const resultDir = path.join(outputRoot, job.slug);
  await fs.access(path.join(resultDir, job.output_file));
  await fs.access(path.join(resultDir, "slide-montage.webp"));
  const rendered = await fs.readdir(path.join(resultDir, "slides"));
  if (rendered.filter((entry) => entry.endsWith(".png")).length !== 9) {
    throw new Error("Expected nine rendered slide previews.");
  }
  const copyLock = JSON.parse(await fs.readFile(path.join(resultDir, "copy-lock.json"), "utf8"));
  if (copyLock.copy_policy !== "verbatim" || copyLock.template_id !== job.template_id) {
    throw new Error("Batch output did not preserve its copy and template locks.");
  }
  console.log("Card-news editable-PPTX batch build passed.");
} finally {
  await fs.rm(tempRoot, { recursive: true, force: true });
}
