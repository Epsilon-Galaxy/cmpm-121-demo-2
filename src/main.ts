import "./style.css";

const APP_NAME = "DEMO 2 TITLE";
const app: HTMLDivElement = document.querySelector<HTMLDivElement>("#app")!;
app.innerHTML = APP_NAME;
document.title = APP_NAME;
"use strict";

//Creates the title of the web page
const head = document.createElement("h1");
head.innerHTML = APP_NAME;
app.append(head);

const canvas = document.createElement("canvas");
canvas.width = 256;
canvas.height = 256;
app.append(canvas);

const content = canvas.getContext("2d");
const mouse = {active: false, x:0, y: 0}

const lines: number[] = [];
let currentLine;


canvas.addEventListener("mousedown", (newLoc) => {
    mouse.active = true;
    mouse.x = newLoc.offsetX;
    mouse.y = newLoc.offsetY;

    currentLine.push({x: mouse.x, y: mouse.y});

    lines.push(currentLine);


})

canvas.addEventListener("mouseup", (newLoc) => {
    mouse.active = false;
    currentLine = [];
})

canvas.addEventListener("mousemove", (newLoc) => {
    if(mouse.active == true){
        mouse.x = newLoc.offsetX;
        mouse.y = newLoc.offsetY;
        currentLine.push({ x: mouse.x, y: mouse.y });
        };

    }
);

canvas.addEventListener("drawing-changed", (newLoc) => {

})

const clear = document.createElement("button");
clear.innerHTML = "Clear";
app.append(clear);

clear.addEventListener("click", () => {
    content?.clearRect(0,0, canvas.width, canvas.height);
});


