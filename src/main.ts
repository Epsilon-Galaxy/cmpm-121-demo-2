import "./style.css";

const APP_NAME = "DEMO 2 TITLE";
const app: HTMLDivElement = document.querySelector<HTMLDivElement>("#app")!;
app.innerHTML = APP_NAME;
document.title = APP_NAME;
"use strict";

const head = document.createElement("h1");
head.innerHTML = APP_NAME;
app.append(head);

const canvas = document.createElement("canvas");
canvas.width = 256;
canvas.height = 256;
app.append(canvas);

const evtCursorChanged = new Event("cursor-changed");
const evtDrawingChange = new Event("drawing-changed");
const ctx = canvas.getContext("2d");
const mouse = { active: false, x: 0, y: 0 };

let currentEmoji = "*";
let stickerBrush = false;

const thin: number = 1;
const thick: number = 10;

let currentThickness = thin;

interface CursorCommand {
  x: number;
  y: number;
  cursor: string;
  newPosition: (point: { x: number; y: number }) => void;
  display: (ctx: CanvasRenderingContext2D) => void;
}

function createCursor(): CursorCommand {
  return {
    x: 0,
    y: 0,
    cursor: "*",
    newPosition(point: { x: number; y: number }): void {
      this.x = point.x;
      this.y = point.y;
    },
    display(ctx: CanvasRenderingContext2D): void {
      ctx.font = "32px monospace";
      ctx.fillText(this.cursor, this.x - 8, this.y + 16);
    }
  };
}

interface LineInterface {
  pointList: Array<{ x: number; y: number }>;
  thickness: number;
  display: (ctx: CanvasRenderingContext2D) => void;
  drag: (point: { x: number; y: number }) => void;
}

function createLine(): LineInterface {
  return {
    pointList: [],
    thickness: 10,
    drag(point: { x: number; y: number }): void {
      this.pointList.push(point);
    },
    display(ctx: CanvasRenderingContext2D) {
      if (this.pointList.length != 0) {
        ctx.beginPath();
        const { x, y } = this.pointList[0];
        ctx.moveTo(x, y);
        for (const { x, y } of this.pointList) {
          ctx.lineTo(x, y);
        }
        ctx.lineWidth = this.thickness;
        ctx.stroke();
      }
    }
  };
}

let currentCursor: CursorCommand | null = null;

const cursorCommandList: CursorCommand[] = [];
const commandList: LineInterface[] = [];
const redoList: LineInterface[] = [];
let lineObject: LineInterface | null = null;

canvas.addEventListener("mouseenter", (e) => {
  currentCursor = createCursor();
  currentCursor.cursor = currentEmoji;
  currentCursor.newPosition({ x: e.offsetX, y: e.offsetY });
  canvas.style.cursor = "none";
  canvas.dispatchEvent(evtCursorChanged);
});

canvas.addEventListener("mouseleave", () => {
  currentCursor = null;
  canvas.style.cursor = "default";
  canvas.dispatchEvent(evtCursorChanged);
});

canvas.addEventListener("mousedown", (newLoc) => {
  if (stickerBrush) {
    const stickerObject = createCursor();
    stickerObject.newPosition({ x: newLoc.offsetX, y: newLoc.offsetY });
    stickerObject.cursor = currentEmoji;
    cursorCommandList.push(stickerObject);
  } else {
    lineObject = createLine();
    lineObject.thickness = currentThickness;
    lineObject.drag({ x: newLoc.offsetX, y: newLoc.offsetY });
    commandList.push(lineObject);
  }
  mouse.active = true;
  canvas.dispatchEvent(evtDrawingChange);
});

canvas.addEventListener("mouseup", (newLoc) => {
  mouse.active = false;
  currentCursor = createCursor();
  currentCursor.cursor = currentEmoji;
  currentCursor?.newPosition({ x: newLoc.offsetX, y: newLoc.offsetY });
  canvas.dispatchEvent(evtCursorChanged);
});

canvas.addEventListener("mousemove", (newLoc) => {
  if (mouse.active) {
    if (!stickerBrush) {
      currentCursor = null;
      lineObject?.drag({ x: newLoc.offsetX, y: newLoc.offsetY });
    }
    canvas.dispatchEvent(evtDrawingChange);
  } else {
    currentCursor?.newPosition({ x: newLoc.offsetX, y: newLoc.offsetY });
    canvas.dispatchEvent(evtCursorChanged);
  }
});

canvas.addEventListener("drawing-changed", () => {
  ctx?.clearRect(0, 0, canvas.width, canvas.height);
  commandList.forEach((line) => line.display(ctx!));
  cursorCommandList.forEach((line) => line.display(ctx!));
});

canvas.addEventListener("cursor-changed", () => {
  canvas.dispatchEvent(evtDrawingChange);
  currentCursor?.display(ctx!);
});

const thinButton = document.createElement("button");
thinButton.innerHTML = "Thin Marker";
app.append(thinButton);

thinButton.addEventListener("click", () => {
  stickerBrush = false;
  currentEmoji = "*";
  currentThickness = thin;
});

const thickButton = document.createElement("button");
thickButton.innerHTML = "Thick Marker";
app.append(thickButton);

thickButton.addEventListener("click", () => {
  stickerBrush = false;
  currentEmoji = "*";
  currentThickness = thick;
});

const undoButton = document.createElement("button");
undoButton.innerHTML = "Undo";
app.append(undoButton);

undoButton.addEventListener("click", () => {
  if (commandList.length != 0) {
    const temp = commandList.pop();
    if (temp) {
      redoList.push(temp);
    }
  }
  canvas.dispatchEvent(evtDrawingChange);
});

const redoButton = document.createElement("button");
redoButton.innerHTML = "Redo";
app.append(redoButton);

redoButton.addEventListener("click", () => {
  if (redoList.length != 0) {
    const temp = redoList.pop();
    if (temp) {
      commandList.push(temp);
    }
    canvas.dispatchEvent(evtDrawingChange);
  }
});

const clearButton = document.createElement("button");
clearButton.innerHTML = "Clear";
app.append(clearButton);

clearButton.addEventListener("click", () => {
  ctx?.clearRect(0, 0, canvas.width, canvas.height);
  commandList.length = 0;
  redoList.length = 0;
});

const emojiButton1 = document.createElement("button");
emojiButton1.innerHTML = "😀";
app.append(emojiButton1);

emojiButton1.addEventListener("click", () => {
  stickerBrush = true;
  currentEmoji = "😀";
});

const emojiButton2 = document.createElement("button");
emojiButton2.innerHTML = "🤔";
app.append(emojiButton2);

emojiButton2.addEventListener("click", () => {
  stickerBrush = true;
  currentEmoji = "🤔";
});

const emojiButton3 = document.createElement("button");
emojiButton3.innerHTML = "🍣";
app.append(emojiButton3);

emojiButton3.addEventListener("click", () => {
  stickerBrush = true;
  currentEmoji = "🍣";
});

const createStickerButton = document.createElement("button");
createStickerButton.innerHTML = "Create Sticker";
app.append(createStickerButton);

createStickerButton.addEventListener("click", () => {
  const newSticker = String(prompt("What is the new Emoji for the sticker?"));
  const newEmojiButton = document.createElement("button");
  newEmojiButton.innerHTML = newSticker;
  app.append(newEmojiButton);

  newEmojiButton.addEventListener("click", () => {
    stickerBrush = true;
    currentEmoji = newSticker;
  });
});