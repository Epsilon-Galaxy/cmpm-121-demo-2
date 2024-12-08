import "./style.css";

// Application setup
const APP_NAME = "DEMO 2 TITLE";
const app: HTMLDivElement = document.querySelector<HTMLDivElement>("#app")!;
document.title = APP_NAME;

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
let currentColor = "white";
let stickerBrush = false;

// Brush thickness options
const thin: number = 1;
const thick: number = 10;
let currentThickness = thin;

// Interface defining a cursor command
interface CursorCommand {
  x: number;
  y: number;
  cursor: string;
  newPosition: (point: { x: number; y: number }) => void;
  display: (ctx: CanvasRenderingContext2D) => void;
}

// Create a new cursor object
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
    },
  };
}

// Interface for line drawing functionality
interface LineInterface {
  pointList: Array<{ x: number; y: number }>;
  thickness: number;
  color: string,
  display: (ctx: CanvasRenderingContext2D) => void;
  drag: (point: { x: number; y: number }) => void;
}

// Create a new line object
function createLine(): LineInterface {
  return {
    pointList: [],
    thickness: 10,
    color: "white",
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
        ctx.strokeStyle = this.color;
        ctx.stroke();
      }
    },
  };
}

// State and command lists
let currentCursor: CursorCommand | null = null;
const cursorCommandList: CursorCommand[] = [];
const commandList: LineInterface[] = [];
const redoList: LineInterface[] = [];
let lineObject: LineInterface | null = null;

// Event listeners
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
    lineObject.color = currentColor;
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
  // Redraw the canvas with the current lines and stickers
  ctx?.clearRect(0, 0, canvas.width, canvas.height);
  commandList.forEach((line) => line.display(ctx!));
  cursorCommandList.forEach((line) => line.display(ctx!));
});

canvas.addEventListener("cursor-changed", () => {
  canvas.dispatchEvent(evtDrawingChange);
  currentCursor?.display(ctx!);
});

/*  Helper functions to add buttons to the UI  */
function createButton(text: string, callback: () => void): HTMLButtonElement {
  const tmpButton = document.createElement("button");
  tmpButton.innerHTML = text;
  tmpButton.addEventListener("click", callback);
  return tmpButton;
}

function groupingButtons(buttons: HTMLButtonElement[]): HTMLDivElement {
  const tmpGroup = document.createElement("div");
  tmpGroup.classList.add("button-group");
  buttons.forEach((button) => tmpGroup.append(button));
  app.appendChild(tmpGroup);
  return tmpGroup;
}

function addToGroup(group: HTMLDivElement, button: HTMLButtonElement): void {
  group.appendChild(button);
}

// UI controls for brush and command management
/* Create buttons grouping for undo, redo, and clear  */
groupingButtons([
  createButton("Undo", () => {
    if (commandList.length != 0) {
      const temp = commandList.pop();
      if (temp) {
        redoList.push(temp);
      }
    }
    canvas.dispatchEvent(evtDrawingChange);
  }),
  createButton("Redo", () => {
    if (redoList.length != 0) {
      const temp = redoList.pop();
      if (temp) {
        commandList.push(temp);
      }
      canvas.dispatchEvent(evtDrawingChange);
    }
  }),
  createButton("Clear", () => {
    ctx?.clearRect(0, 0, canvas.width, canvas.height);
    commandList.length = 0;
    redoList.length = 0;
  }),
]);

/* Create buttons grouping for brush thickness */
groupingButtons([
  createButton("Thin Marker", () => {
    stickerBrush = false;
    currentEmoji = "*";
    currentThickness = thin;
  }),
  createButton("Thick Marker", () => {
    stickerBrush = false;
    currentEmoji = "*";
    currentThickness = thick;
  }),
]);

//Buttons to change color of marker
groupingButtons([
  createButton("Red", () => {
    currentColor = "red";
  }),
  createButton("Orange", () => {
    currentColor = "orange";
  }),
  createButton("Yellow", () => {
    currentColor = "Yellow";
  }),
  createButton("Blue", () => {
    currentColor = "Blue";
  }),
  createButton("Indigo", () => {
    currentColor = "Purple";
  }),
  createButton("Violet", () => {
    currentColor = "Violet";
  }),
])

// UI buttons to select emoji brushes
/* Create buttons grouping for emoji stickers */
groupingButtons([
  createButton("😀", () => {
    stickerBrush = true;
    currentEmoji = "😀";
  }),
  createButton("🤔", () => {
    stickerBrush = true;
    currentEmoji = "🤔";
  }),
  createButton("🍣", () => {
    stickerBrush = true;
    currentEmoji = "🍣";
  }),
]);

// Button to create a custom emoji sticker
/* Create buttons grouping for custom emoji stickers */
const customEmojiGroup = groupingButtons([]);
const createStickerButton = createButton("Create Sticker", () => {
  const newSticker = String(prompt("What is the new Emoji for the sticker?"));
  if (newSticker && newSticker.trim() !== "") {
    const newEmojiButton = createButton(newSticker, () => {
      stickerBrush = true;
      currentEmoji = newSticker;
    });
    addToGroup(customEmojiGroup, newEmojiButton);
  } else {
    alert("Error: empty string.");
  }
});

app.appendChild(createStickerButton);

const exportButton = createButton("Export to PNG", () => {
  const canvasScaled = document.createElement("canvas");
  canvasScaled.width = canvas.width * 4;
  canvasScaled.height = canvas.height * 4;
  const sCTX = canvasScaled.getContext("2d");

  if(sCTX){
    sCTX.scale(4,4);

    for(const cmd of commandList){
      cmd.display(sCTX);
    }
    for(const cmd of cursorCommandList){
      cmd.display(sCTX);
    }
    

    const achor = document.createElement("a");
    achor.href = canvasScaled.toDataURL("image/png");
    achor.download = "pictureDownload.png";
    achor.click();
  }
})

app.append(exportButton);