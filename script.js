
import { btn } from "./buttons.js"
import { appState, gameState, sessionState } from "./states.js";
import { init, update } from "./logic.js";
import { getDartThrow, handleDartThrow } from "./logic.js";
import { drawGameScore } from "./logic.js";

let {canvas,} = appState;

const page = document.getElementById("pages");
const {bounceOutBtn, delLastThrowBtn, resetBtn, newLegBtn} = btn
const subtitle = document.getElementById("subtitle");


// THROW TRACKER

canvas.addEventListener("click", (e) => {
  if (gameState.isPaused) return;
  const dart = getDartThrow(e);
  handleDartThrow(dart, sessionState.throws);
  update(sessionState.throws);
});

// BUTTON - event listeners

bounceOutBtn.addEventListener("click", () => {
  if (gameState.isPaused) return;
  sessionState.throws.push({x:null, y:null, dx:null, dy:null, score:0, multiplier:0, segment:0, type:"bounceOut"});
  update(sessionState.throws);
})

delLastThrowBtn.addEventListener("click", () => {
  if (sessionState.throws.length == 0) return;
  if (gameState.isGame & sessionState.throws[sessionState.throws.length - 1].leg != gameState.leg) return;
  if (gameState.isGame && gameState.isPaused) newLegBtn.toggleAttribute("hidden");
  sessionState.throws.pop();
  update(sessionState.throws);
});

resetBtn.addEventListener("click", () => {
  if (sessionState.throws.length == 0) return;
  sessionState.throws.length = 0;
  update(sessionState.throws);
});

newLegBtn.addEventListener("click", () => {
  while (sessionState.throws.length % 3 != 0) {
          sessionState.throws.push({x:null, y:null, dx:null, dy:null, score:null, multiplier:null, segment:"-", type:"notThrown"});
        }
  gameState.leg++;
  update(sessionState.throws);
  gameState.isPaused = false;
  canvas.style.cursor = "crosshair";
  newLegBtn.toggleAttribute("hidden");
})

// PAGE SWITCH BUTTON - event listeners

document.getElementById("practice").addEventListener("click", () => {
  init(sessionState.throws);
  gameState.leg = null;
  subtitle.innerText = "Practice Mode";
  page.style.transform = "translateX(-100vw)";
})

document.getElementById("game").addEventListener("click", () => {
  init(sessionState.throws);
  subtitle.innerText = "Game Mode";
  page.style.transform = "translateX(-100vw)";
  gameState.isGame = true;
  gameState.leg = 1;
  drawGameScore();
})

document.getElementById("home-page").addEventListener("click", () => {
  page.style.transform = "translateX(0vw)";
  gameState.isGame = false;
})

document.getElementById("view-stats").addEventListener("click", () => {
  page.style.transform = "translateX(-200vw)";
})

document.getElementById("back-to-tracker").addEventListener("click", () => {
  page.style.transform = "translateX(-100vw)";
})

