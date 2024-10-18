import "./style.css";

const APP_NAME = "DEMO 2 TITLE";
const app: HTMLDivElement = document.querySelector<HTMLDivElement>("#app")!;
app.innerHTML = APP_NAME;
document.title = APP_NAME;


//Creates the title of the web page
const head = document.createElement("h1");
head.innerHTML = APP_NAME;
app.append(head);

const canvas = document.createElement("canvas");
canvas.width = 256;
canvas.height = 256;
app.append(canvas);







