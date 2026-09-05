#!/usr/bin/env node

import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";

const [snapshotPath, sourceWorkspace, timestamp, ...included] = process.argv.slice(2);
if (!snapshotPath || !sourceWorkspace || !timestamp) {
  throw new Error("Usage: write-archive-index.mjs <snapshot-path> <source-workspace> <timestamp> [included-dir...]");
}

async function walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];
  let bytes = 0;
  for (const entry of entries) {
    if (entry.name === ".DS_Store") continue;
    const child = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      const childStats = await walk(child);
      files.push(...childStats.files.map((file) => path.join(entry.name, file)));
      bytes += childStats.bytes;
    } else if (entry.isFile()) {
      const stat = await fs.stat(child);
      files.push(entry.name);
      bytes += stat.size;
    }
  }
  return { files, bytes };
}

const materials = path.join(snapshotPath, "materials");
const directories = [];
for (const name of included) {
  const target = path.join(materials, name);
  try {
    const stats = await walk(target);
    directories.push({
      path: `materials/${name}`,
      file_count: stats.files.length,
      bytes: stats.bytes,
      top_level_entries: (await fs.readdir(target)).filter((entry) => entry !== ".DS_Store").sort(),
    });
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
}

const index = {
  schema_version: 1,
  created_at: timestamp,
  source_workspace: path.resolve(sourceWorkspace),
  copied_directories: directories,
  exclusions: [".git", "node_modules", ".DS_Store", "work/cardnews-skills", "archive"],
  snapshot_id: crypto.createHash("sha256").update(`${timestamp}:${path.resolve(sourceWorkspace)}`).digest("hex").slice(0, 16),
};

await fs.writeFile(path.join(snapshotPath, "archive-index.json"), `${JSON.stringify(index, null, 2)}\n`);
