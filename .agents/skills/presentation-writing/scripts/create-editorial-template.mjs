import path from "node:path";
import { mkdir } from "node:fs/promises";
import { Presentation, PresentationFile } from "@oai/artifact-tool";

const OUTPUT = path.resolve(
  process.argv[2] || "editorial-presentation-template.pptx",
);
const WIDTH = 1600;
const HEIGHT = 900;
const INK = "#111111";
const PAPER = "#FCFCFA";
const PLACEHOLDER = "#F1F1ED";
const MARGIN = 104;

function textbox(slide, name, text, position, style = {}) {
  const shape = slide.shapes.add({
    geometry: "textbox",
    name,
    position,
    fill: "none",
    line: { style: "solid", fill: "none", width: 0 },
  });
  shape.text = text;
  shape.text.style = {
    fontFace: "Pretendard",
    fontSize: 28,
    color: INK,
    ...style,
  };
  return shape;
}

function imagePlaceholder(slide, name, label, position, { framed = false } = {}) {
  const shape = slide.shapes.add({
    geometry: "rect",
    name,
    position,
    fill: { type: "solid", color: PLACEHOLDER },
    line: { style: "solid", fill: INK, width: framed ? 1.5 : 1 },
  });
  textbox(
    slide,
    name + "-label",
    label,
    {
      left: position.left + 36,
      top: position.top + position.height / 2 - 36,
      width: position.width - 72,
      height: 72,
    },
    {
      alignment: "center",
      fontSize: 20,
      color: "#555555",
      bold: true,
    },
  );
  return shape;
}

function sourceLine(
  slide,
  text = "출처: 최종 자료에서 확인",
  position = { left: MARGIN, top: 850, width: 640, height: 24 },
) {
  textbox(
    slide,
    "source-line",
    text,
    position,
    { fontSize: 14, color: "#666666" },
  );
}

function notes(slide, lines) {
  slide.speakerNotes.textFrame.setText([
    "[Sources]",
    ...lines,
  ]);
  slide.speakerNotes.setVisible(true);
}

function addOpening(deck) {
  const slide = deck.slides.add();
  slide.background.fill = PAPER;
  imagePlaceholder(
    slide,
    "image-placeholder-opening",
    "사진: 인물·현장·물건 중 하나 · 세로",
    { left: 760, top: 0, width: 840, height: 900 },
  );
  textbox(
    slide,
    "opening-title",
    "제목을 한 문장으로\n말합니다",
    { left: MARGIN, top: 262, width: 560, height: 176 },
    { fontSize: 64, bold: true },
  );
  textbox(
    slide,
    "opening-body",
    "발표가 끝난 뒤 청중이 기억할 핵심을 짧게 적습니다.",
    { left: MARGIN, top: 482, width: 530, height: 108 },
    { fontSize: 27, color: "#3D3D3D" },
  );
  notes(slide, ["사진: 사용자가 제공한 자료로 교체", "주장: 최종 발표 전 근거 확인"]);
}

function addQuote(deck) {
  const slide = deck.slides.add();
  slide.background.fill = PAPER;
  textbox(
    slide,
    "quote-text",
    "“한 문장 인용은\n문제를 선명하게 만듭니다.”",
    { left: MARGIN, top: 270, width: 530, height: 210 },
    {
      fontFace: "Noto Serif KR",
      fontSize: 44,
      alignment: "center",
    },
  );
  imagePlaceholder(
    slide,
    "image-placeholder-quote",
    "사진: 발언 중인 인물 · 가로",
    { left: 790, top: 190, width: 690, height: 390 },
    { framed: true },
  );
  sourceLine(slide, "인용 출처: 최종 자료에서 확인");
  notes(slide, ["인용: 원문과 발언자 확인", "사진: 사용자가 제공한 자료로 교체"]);
}

function addTextImage(deck) {
  const slide = deck.slides.add();
  slide.background.fill = PAPER;
  textbox(
    slide,
    "text-image-title",
    "설명은 먼저,\n사진은 그다음 보게 합니다",
    { left: MARGIN, top: 128, width: 540, height: 142 },
    { fontSize: 46, bold: true },
  );
  textbox(
    slide,
    "text-image-body",
    "맥락과 근거를 두세 문장으로 정리합니다.\n길어지면 다음 슬라이드로 넘깁니다.\n\n강조할 한 문장만 굵은 검정 밑줄로 처리합니다.",
    { left: MARGIN, top: 330, width: 510, height: 290 },
    { fontSize: 28, color: "#333333" },
  );
  imagePlaceholder(
    slide,
    "image-placeholder-text-image",
    "사진: 맥락을 보여주는 현장 · 가로",
    { left: 780, top: 80, width: 820, height: 740 },
  );
  sourceLine(slide);
  notes(slide, ["사진: 사용자가 제공한 자료로 교체", "사실·수치: 최종 발표 전 출처 추가"]);
}

function addImageText(deck) {
  const slide = deck.slides.add();
  slide.background.fill = PAPER;
  imagePlaceholder(
    slide,
    "image-placeholder-image-text",
    "사진: 감정을 만드는 인물 또는 현장 · 세로",
    { left: 0, top: 0, width: 865, height: 900 },
  );
  textbox(
    slide,
    "image-text-title",
    "사진이 먼저,\n맥락은 그다음 옵니다",
    { left: 980, top: 156, width: 500, height: 142 },
    { fontSize: 46, bold: true },
  );
  textbox(
    slide,
    "image-text-body",
    "사진이 만든 첫 인상을\n짧은 설명으로 해석합니다.\n\n한 슬라이드에는 한 가지\n판단만 남깁니다.",
    { left: 980, top: 362, width: 480, height: 250 },
    { fontSize: 28, color: "#333333" },
  );
  sourceLine(
    slide,
    undefined,
    { left: 980, top: 850, width: 500, height: 24 },
  );
  notes(slide, ["사진: 사용자가 제공한 자료로 교체", "설명: 근거와 해석을 구분"]);
}

function addClose(deck) {
  const slide = deck.slides.add();
  slide.background.fill = PAPER;
  textbox(
    slide,
    "close-title",
    "좋은 마무리는\n다음 행동을 남깁니다",
    { left: 350, top: 260, width: 900, height: 150 },
    { fontSize: 58, bold: true, alignment: "center" },
  );
  textbox(
    slide,
    "close-body",
    "결론 한 문장과,\n청중이 기억하거나 결정할 한 가지를 적습니다.",
    { left: 420, top: 475, width: 760, height: 120 },
    { fontSize: 29, alignment: "center", color: "#333333" },
  );
  notes(slide, ["결론: 발표의 첫 주장과 연결", "외부 사실을 추가하면 출처 기입"]);
}

async function main() {
  await mkdir(path.dirname(OUTPUT), { recursive: true });
  const deck = Presentation.create({ slideSize: { width: WIDTH, height: HEIGHT } });
  addOpening(deck);
  addTextImage(deck);
  addImageText(deck);
  addQuote(deck);
  addClose(deck);
  const pptx = await PresentationFile.exportPptx(deck);
  await pptx.save(OUTPUT);
  console.log(OUTPUT);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
