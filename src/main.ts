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

const evtDrawingChange = new Event("drawing-changed");

const content = canvas.getContext("2d");
const mouse = {active: false, x:0, y: 0}

const lines: Array<Array<{x: number; y: number}>> = [];


canvas.addEventListener("mousedown", (newLoc) => {
    mouse.active = true;
    mouse.x = newLoc.offsetX;
    mouse.y = newLoc.offsetY;

    

    lines.push([{x: mouse.x, y: mouse.y}]);


})

canvas.addEventListener("mouseup", (newLoc) => {
    mouse.active = false;
})

canvas.addEventListener("mousemove", (newLoc) => {
    if(mouse.active == true){
        lines[lines.length - 1].push({x: newLoc.offsetX, y: newLoc.offsetY});

        canvas.dispatchEvent(evtDrawingChange); 
        mouse.x = newLoc.offsetX;
        mouse.y = newLoc.offsetY;
        
        };
    }
);

canvas.addEventListener("drawing-changed", (newLoc) => {
    content?.clearRect(0, 0, canvas.width, canvas.height);
    for (const line of lines){
        if(line.length > 1){
            content?.beginPath();
            content?.moveTo(line[0].x, line[0].y);
            for(const point of line){
                content?.lineTo(point.x, point.y);
            }
            content?.stroke();
        }
    }
})

const clear = document.createElement("button");
clear.innerHTML = "Clear";
app.append(clear);

clear.addEventListener("click", () => {
    content?.clearRect(0,0, canvas.width, canvas.height);
});


