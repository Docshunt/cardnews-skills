#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const skillRoot = path.join(repoRoot, ".agents/skills/cardnews-writing");
const requiredFiles = [
  "SKILL.md",
  "references/editable-ppt.md",
  "references/manifest.md",
  "references/template-and-archive.md",
  "references/visual-direction.md",
  "scripts/create-editable-card-deck.mjs",
  "scripts/validate-cardnews.mjs",
];

for (const relativeFile of requiredFiles) {
  await fs.access(path.join(skillRoot, relativeFile));
}

const skill = await fs.readFile(path.join(skillRoot, "SKILL.md"), "utf8");
const failures = [];
if (!skill.startsWith("---\nname: cardnews-writing\n")) failures.push("SKILL.md front matter must name cardnews-writing.");
for (const requiredPhrase of [
  "origin/main",
  "verbatim",
  "80 pt",
  "38 pt",
  "24 pt",
  "28 pt",
  "22 pt",
  "1080×1350",
  "11.25×14.0625 in",
  "cover",
  "lock the aspect ratio",
  "first cover and final closing card only",
  "template-and-archive.md",
]) {
  if (!skill.includes(requiredPhrase)) failures.push(`SKILL.md is missing the durable rule: ${requiredPhrase}`);
}

const registry = JSON.parse(await fs.readFile(path.join(repoRoot, "templates/cardnews/template-registry.json"), "utf8"));
if (registry.copyPolicy !== "verbatim") failures.push("Template registry must require verbatim copy.");
if (!Array.isArray(registry.templates) || registry.templates.length < 2) failures.push("Template registry must list at least two approved source decks.");
for (const template of registry.templates ?? []) {
  if (!template.id || !template.file || !template.slideCount) failures.push("Every template requires id, file, and slideCount.");
  if (template.canvas?.renderPx?.width !== 1080 || template.canvas?.renderPx?.height !== 1350
    || template.canvas?.pptx?.widthEmu !== 10287000 || template.canvas?.pptx?.heightEmu !== 12858750
    || template.canvas?.pptx?.widthIn !== 11.25 || template.canvas?.pptx?.heightIn !== 14.0625) {
    failures.push(`Template ${template.id} violates the 4:5 card-news size contract.`);
  }
  if (template.fixedType?.coverTitlePt !== 80 || template.fixedType?.storyHeadingPt !== 38 || template.fixedType?.bodyMinPt < 24 || template.fixedType?.bodyEmphasisPt < 28 || template.fixedType?.absoluteFloorPt < 22) {
    failures.push(`Template ${template.id} violates the shared typography contract.`);
  }
}

if (failures.length) {
  console.error(failures.map((failure) => `ERROR: ${failure}`).join("\n"));
  process.exitCode = 1;
} else {
  console.log("Card-news skill contract passed.");
}
