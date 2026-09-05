#!/usr/bin/env node

import { execFile } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const args = process.argv.slice(2);

function option(name) {
  const index = args.indexOf(name);
  return index >= 0 ? args[index + 1] : undefined;
}

const input = option("--input");
const output = option("--output");
const width = Number(option("--width"));
const height = Number(option("--height"));

if (!input || !output || !Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) {
  throw new Error("Usage: prepare-cardnews-image.mjs --input <image> --output <image> --width <frame-width> --height <frame-height>");
}

const sourcePath = path.resolve(input);
const outputPath = path.resolve(output);
await fs.access(sourcePath);
await fs.mkdir(path.dirname(outputPath), { recursive: true });

const { stdout } = await execFileAsync("sips", ["-g", "pixelWidth", "-g", "pixelHeight", sourcePath]);
const sourceWidth = Number(stdout.match(/pixelWidth:\s*(\d+)/)?.[1]);
const sourceHeight = Number(stdout.match(/pixelHeight:\s*(\d+)/)?.[1]);
if (!Number.isFinite(sourceWidth) || !Number.isFinite(sourceHeight) || sourceWidth <= 0 || sourceHeight <= 0) {
  throw new Error(`Could not read image dimensions: ${sourcePath}`);
}

function gcd(a, b) {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y !== 0) [x, y] = [y, x % y];
  return x || 1;
}

// Derive the largest integer crop using the requested reduced ratio. Using a
// floating-point floor here can leave a one-pixel ratio mismatch, which then
// causes a tiny but real stretch when an image is placed into its PowerPoint
// frame. Exact integer dimensions keep every cover crop distortion-free.
const divisor = gcd(width, height);
const ratioWidth = width / divisor;
const ratioHeight = height / divisor;
const multiplier = Math.min(
  Math.floor(sourceWidth / ratioWidth),
  Math.floor(sourceHeight / ratioHeight),
);
const cropWidth = Math.max(ratioWidth, ratioWidth * multiplier);
const cropHeight = Math.max(ratioHeight, ratioHeight * multiplier);

await execFileAsync("sips", ["--cropToHeightWidth", String(cropHeight), String(cropWidth), sourcePath, "--out", outputPath]);
console.log(JSON.stringify({ input: sourcePath, output: outputPath, crop: { width: cropWidth, height: cropHeight }, frame: { width, height } }));
