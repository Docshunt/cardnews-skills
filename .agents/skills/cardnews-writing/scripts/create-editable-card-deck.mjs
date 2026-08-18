#!/usr/bin/env node

import path from "node:path";
import { readFile, writeFile, mkdir, stat } from "node:fs/promises";
import { pathToFileURL } from "node:url";

const runtimeNodeModules = process.env.RUNTIME_NODE_MODULES;
if (!runtimeNodeModules) {
  throw new Error("RUNTIME_NODE_MODULES is required. Load the PowerPoint workspace dependencies first.");
}
const artifactToolPath = path.join(runtimeNodeModules, "@oai", "artifact-tool", "dist", "artifact_tool.mjs");
const { Presentation, PresentationFile } = await import(pathToFileURL(artifactToolPath).href);

const WIDTH = 1080;
const HEIGHT = 1350;
const PAPER = "#FCFCFA";
const INK = "#111111";
const MUTED = "#5A5A56";
const PLACEHOLDER = "#E9E9E3";
const FONT = "Pretendard";
const SERIF = "Noto Serif KR";
const MARGIN = 72;
const LAYOUTS = new Set(["cover", "interview-quote", "text-image", "image-text", "centered-close"]);

function asText(value) {
  return typeof value === "string" ? value.trim() : "";
}

function addText(slide, name, text, position, style = {}) {
  const shape = slide.shapes.add({
    geometry: "textbox",
    name,
    position,
    fill: "none",
    line: { style: "solid", fill: "none", width: 0 },
  });
  shape.text = text;
  shape.text.style = {
    typeface: FONT,
    fontSize: 33,
    color: INK,
    lineSpacing: 1.58,
    wrap: "square",
    insets: { top: 0, right: 0, bottom: 0, left: 0 },
    ...style,
  };
  return shape;
}

function addPhotoPlaceholder(slide, name, label, position, { framed = false, dark = false } = {}) {
  const fill = dark ? "#383834" : PLACEHOLDER;
  slide.shapes.add({
    geometry: "rect",
    name: `${name}-placeholder`,
    position,
    fill,
    line: dark
      ? { style: "solid", fill: "none", width: 0 }
      : { style: "solid", fill: INK, width: framed ? 2 : 1 },
  });
  addText(
    slide,
    `${name}-placeholder-label`,
    label,
    {
      left: position.left + 56,
      top: position.top + position.height / 2 - 30,
      width: position.width - 112,
      height: 60,
    },
    {
      fontSize: 26,
      bold: true,
      alignment: "center",
      verticalAlignment: "middle",
      color: dark ? "#F6F6F1" : MUTED,
      lineSpacing: 1.2,
    },
  );
}

function imageContentType(filePath) {
  const extension = path.extname(filePath).toLowerCase();
  if (extension === ".png") return "image/png";
  if (extension === ".webp") return "image/webp";
  if (extension === ".jpg" || extension === ".jpeg") return "image/jpeg";
  throw new Error(`Unsupported image extension: ${extension || filePath}`);
}

function resolveInside(root, relativePath) {
  if (!asText(relativePath) || path.isAbsolute(relativePath)) return null;
  const resolved = path.resolve(root, relativePath);
  const relative = path.relative(root, resolved);
  if (relative === "" || (!relative.startsWith(`..${path.sep}`) && relative !== ".." && !path.isAbsolute(relative))) {
    return resolved;
  }
  return null;
}

async function addPhoto(slide, spec, index, root, position, options = {}) {
  const imagePath = resolveInside(root, spec.image);
  if (imagePath) {
    try {
      const imageStat = await stat(imagePath);
      if (!imageStat.isFile()) throw new Error("not a file");
      const imageBytes = await readFile(imagePath);
      slide.images.add({
        blob: imageBytes,
        contentType: imageContentType(imagePath),
        alt: asText(spec.alt) || "카드뉴스의 근거 사진",
        fit: "cover",
        geometry: "rect",
        position,
      });
      if (options.framed) {
        slide.shapes.add({
          geometry: "rect",
          name: `card-${index}-photo-frame`,
          position,
          fill: "none",
          line: { style: "solid", fill: INK, width: 2 },
        });
      }
      return;
    } catch (error) {
      throw new Error(`Could not add slide ${index} image ${spec.image}: ${error.message}`);
    }
  }

  const defaultLabel = options.defaultLabel || "사진: 최종 자료에서 교체 · 가로";
  addPhotoPlaceholder(
    slide,
    `card-${index}-photo`,
    asText(spec.image_placeholder) || defaultLabel,
    position,
    options,
  );
}

function addSourceLine(slide, index, text, position, { color = "#777772" } = {}) {
  const source = asText(text);
  if (!source) return;
  addText(slide, `card-${index}-source-line`, source, position, {
    fontSize: 20,
    color,
    lineSpacing: 1.2,
  });
}

function addNotes(slide, sources) {
  const lines = Array.isArray(sources)
    ? sources.filter((source) => asText(source)).map((source) => asText(source))
    : [];
  slide.speakerNotes.textFrame.setText(["[Sources]", ...(lines.length ? lines : ["외부 자료 없음 또는 sources.json 참고"])]);
  slide.speakerNotes.setVisible(true);
}

function addHeadline(slide, index, text, position, { white = false, centered = false, size = 62 } = {}) {
  addText(slide, `card-${index}-headline`, text, position, {
    fontSize: size,
    bold: true,
    color: white ? "#FFFFFF" : INK,
    alignment: centered ? "center" : "left",
    lineSpacing: 1.15,
  });
}

function addBody(slide, index, text, position, { centered = false, size = 33 } = {}) {
  const body = asText(text);
  if (!body) return;
  addText(slide, `card-${index}-body`, body, position, {
    fontSize: size,
    color: "#222222",
    alignment: centered ? "center" : "left",
    lineSpacing: 1.58,
  });
}

function addEmphasis(slide, index, text, position, { centered = false, size = 33 } = {}) {
  const emphasis = asText(text);
  if (!emphasis) return;
  addText(slide, `card-${index}-emphasis`, emphasis, position, {
    fontSize: size,
    bold: true,
    underline: "sng",
    color: INK,
    alignment: centered ? "center" : "left",
    lineSpacing: 1.48,
  });
}

async function addCover(deck, spec, index, root, mark) {
  const slide = deck.slides.add();
  slide.background.fill = PAPER;
  await addPhoto(slide, spec, index, root, { left: 0, top: 0, width: WIDTH, height: HEIGHT }, {
    dark: true,
    defaultLabel: "사진: 인물·현장·제품 중 하나 · 세로",
  });
  slide.shapes.add({
    geometry: "rect",
    name: `card-${index}-cover-fade`,
    position: { left: 0, top: 540, width: WIDTH, height: 810 },
    fill: "linear(0deg, #000000/78 0%, #000000/0 100%)",
    line: { style: "solid", fill: "none", width: 0 },
  });
  addHeadline(slide, index, asText(spec.headline) || "한 문장 주장을\n여기에 씁니다", {
    left: MARGIN,
    top: 880,
    width: WIDTH - MARGIN * 2,
    height: 320,
  }, { white: true, size: 98 });
  if (asText(mark)) {
    addText(slide, `card-${index}-mark`, mark, { left: 380, top: 1260, width: 320, height: 32 }, {
      fontSize: 27,
      bold: true,
      color: "#FFFFFF",
      alignment: "center",
      lineSpacing: 1,
    });
  }
  addNotes(slide, spec.notes_sources);
}

async function addInterviewQuote(deck, spec, index, root) {
  const slide = deck.slides.add();
  slide.background.fill = PAPER;
  await addPhoto(slide, spec, index, root, { left: 140, top: 254, width: 800, height: 500 }, {
    framed: true,
    defaultLabel: "사진: 발언 중인 인물 또는 현장 · 가로",
  });
  const quote = asText(spec.quote) || asText(spec.body) || asText(spec.headline) || "인용문을\n여기에 씁니다.";
  addText(slide, `card-${index}-quote`, quote, { left: 115, top: 834, width: 850, height: 335 }, {
    typeface: SERIF,
    fontSize: 46,
    alignment: "center",
    lineSpacing: 1.62,
    color: INK,
  });
  addSourceLine(slide, index, spec.source_line, { left: 72, top: 1274, width: 936, height: 28 });
  addNotes(slide, spec.notes_sources);
}

async function addTextImage(deck, spec, index, root) {
  const slide = deck.slides.add();
  slide.background.fill = PAPER;
  addHeadline(slide, index, asText(spec.headline) || "제목을 여기에\n적습니다", { left: MARGIN, top: 72, width: 936, height: 155 });
  addBody(slide, index, spec.body, { left: MARGIN, top: 275, width: 936, height: 230 });
  addEmphasis(slide, index, spec.emphasis, { left: MARGIN, top: 538, width: 936, height: 82 });
  addSourceLine(slide, index, spec.source_line, { left: MARGIN, top: 638, width: 936, height: 26 });
  await addPhoto(slide, spec, index, root, { left: 0, top: 688, width: WIDTH, height: 662 }, {
    defaultLabel: "사진: 맥락을 보여주는 현장 · 가로",
  });
  addNotes(slide, spec.notes_sources);
}

async function addImageText(deck, spec, index, root) {
  const slide = deck.slides.add();
  slide.background.fill = PAPER;
  await addPhoto(slide, spec, index, root, { left: 0, top: 0, width: WIDTH, height: 702 }, {
    defaultLabel: "사진: 인물·현장·제품 중 하나 · 가로",
  });
  addHeadline(slide, index, asText(spec.headline) || "사진 뒤의 의미를\n여기에 적습니다", { left: MARGIN, top: 758, width: 936, height: 145 });
  addBody(slide, index, spec.body, { left: MARGIN, top: 944, width: 936, height: 190 });
  addEmphasis(slide, index, spec.emphasis, { left: MARGIN, top: 1164, width: 936, height: 74 });
  addSourceLine(slide, index, spec.source_line, { left: MARGIN, top: 1284, width: 936, height: 26 });
  addNotes(slide, spec.notes_sources);
}

function addCenteredClose(deck, spec, index) {
  const slide = deck.slides.add();
  slide.background.fill = PAPER;
  addHeadline(slide, index, asText(spec.headline) || "마지막 문장을\n여기에 적습니다", { left: 110, top: 440, width: 860, height: 170 }, {
    centered: true,
    size: 62,
  });
  addBody(slide, index, spec.body, { left: 110, top: 678, width: 860, height: 145 }, { centered: true, size: 38 });
  addEmphasis(slide, index, spec.emphasis, { left: 110, top: 900, width: 860, height: 102 }, { centered: true, size: 38 });
  addSourceLine(slide, index, spec.source_line, { left: MARGIN, top: 1274, width: 936, height: 28 });
  addNotes(slide, spec.notes_sources);
}

function templateManifest() {
  return {
    title: "수정 가능한 카드뉴스 템플릿",
    design: { mark: "BRAND" },
    slides: [
      {
        layout: "cover",
        headline: "사진과 문구는\n따로 고칠 수 있습니다",
        image_placeholder: "사진: 인물·현장·제품 중 하나 · 세로",
        alt: "수정 가능한 카드뉴스 표지",
      },
      {
        layout: "text-image",
        headline: "1. 설명은 먼저,\n사진은 그다음입니다.",
        body: "제목과 본문을 각각 고친 뒤\n필요하면 다음 카드로 나눕니다.",
        emphasis: "한 장에는 하나의 주장만 남깁니다.",
        image_placeholder: "사진: 맥락을 보여주는 현장 · 가로",
        alt: "글과 사진 자리를 나눈 카드",
      },
      {
        layout: "image-text",
        headline: "2. 사진이 먼저\n첫 장면을 만듭니다.",
        body: "사진은 같은 자리에 넣고,\n글은 아래에서 해석합니다.",
        image_placeholder: "사진: 인물·현장·제품 중 하나 · 가로",
        alt: "사진이 먼저 보이는 카드",
      },
      {
        layout: "interview-quote",
        quote: "“인용문은 조용하게\n한 문장으로 남깁니다.”",
        image_placeholder: "사진: 발언 중인 인물 또는 현장 · 가로",
        source_line: "인용 출처: 최종 자료에서 확인",
        alt: "인용문과 사진 자리를 담은 카드",
      },
      {
        layout: "centered-close",
        headline: "마지막은\n한 문장으로 끝냅니다",
        body: "감사 인사 대신, 저장할 만한\n결론을 남깁니다.",
        emphasis: "그래야 다음 장면이 기억됩니다.",
        alt: "여백 있게 정리한 마지막 카드",
      },
    ],
  };
}

async function setThemeFont(pptxPath) {
  const jszipPath = path.resolve(runtimeNodeModules, "jszip/lib/index.js");
  const { default: JSZip } = await import(pathToFileURL(jszipPath).href);
  const archive = await JSZip.loadAsync(await readFile(pptxPath));
  const theme = await archive.file("ppt/theme/theme1.xml").async("string");
  const updatedTheme = theme.replace(/(<a:(?:latin|ea|cs)\s+typeface=")[^"]+(")/g, "$1Pretendard$2");
  archive.file("ppt/theme/theme1.xml", updatedTheme);
  await writeFile(pptxPath, await archive.generateAsync({ type: "nodebuffer", compression: "DEFLATE" }));
}

async function createDeck(manifest, root, output) {
  if (!Array.isArray(manifest.slides) || manifest.slides.length === 0) {
    throw new Error("The manifest needs at least one slide.");
  }
  const deck = Presentation.create({ slideSize: { width: WIDTH, height: HEIGHT } });
  const mark = asText(manifest.design?.mark);

  for (const [offset, spec] of manifest.slides.entries()) {
    const index = offset + 1;
    if (!LAYOUTS.has(spec?.layout)) throw new Error(`Slide ${index} has an unsupported layout: ${spec?.layout}`);
    if (spec.layout === "cover") await addCover(deck, spec, index, root, mark);
    if (spec.layout === "interview-quote") await addInterviewQuote(deck, spec, index, root);
    if (spec.layout === "text-image") await addTextImage(deck, spec, index, root);
    if (spec.layout === "image-text") await addImageText(deck, spec, index, root);
    if (spec.layout === "centered-close") addCenteredClose(deck, spec, index);
  }

  await mkdir(path.dirname(output), { recursive: true });
  const pptx = await PresentationFile.exportPptx(deck);
  await pptx.save(output);
  await setThemeFont(output);
}

async function main() {
  const [first, second] = process.argv.slice(2);
  if (first === "--template") {
    if (!second) throw new Error("Usage: create-editable-card-deck.mjs --template <output.pptx>");
    await createDeck(templateManifest(), process.cwd(), path.resolve(second));
    console.log(path.resolve(second));
    return;
  }
  if (!first || !second) {
    throw new Error("Usage: create-editable-card-deck.mjs <manifest.json> <output.pptx>");
  }
  const manifestPath = path.resolve(first);
  const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
  await createDeck(manifest, path.dirname(manifestPath), path.resolve(second));
  console.log(path.resolve(second));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
