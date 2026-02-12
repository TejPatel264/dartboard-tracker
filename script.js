
import { btn } from "./buttons.js"
import { database, createSession } from "./database.js"
import { appState, gameState} from "./states.js";
import { init, update } from "./logic.js";
import { getDartThrow, handleDartThrow } from "./logic.js";
import { calculateLongTermStats } from "./stats.js"
import { showAllTimeStats } from "./logic.js"

let {canvas,} = appState;
let session
let longTermStats;
let allSessions = await database.sessions.toArray()

const page = document.getElementById("pages");
const subtitle = document.getElementById("subtitle");
const slider = document.querySelector(".slider")

for (let session of allSessions) {
  session.stats.basic.totalVisits = session.raw.visits.length;
  database.sessions.put(session);
}


// THROW TRACKER

canvas.addEventListener("click", (e) => {
  if (gameState.isPaused) return;
  const dart = getDartThrow(e);
  handleDartThrow(dart, session);
  update(session);
  database.sessions.put(session);
});

// BUTTON - event listeners

btn.bounceOut.addEventListener("click", () => {
  if (gameState.isPaused) return;
  session.raw.throws.push({x:null, y:null, dx:null, dy:null, score:0, multiplier:0, segment:0, type:"bounceOut"});
  update(session);
  session.meta.duration = Date.now() - session.meta.date;
  database.sessions.put(session);
})

btn.delLastThrow.addEventListener("click", () => {
  if (session.raw.throws.length == 0) return;
  if (gameState.isGame & session.raw.throws[session.raw.throws.length - 1].leg != gameState.leg) return;
  if (gameState.isGame && gameState.isPaused) {btn.newLeg.toggleAttribute("hidden"), gameState.isPaused = false, canvas.style.cursor="crosshair"};
  session.raw.throws.pop();
  update(session);
  session.meta.duration = Date.now() - session.meta.date;
  database.sessions.put(session);
});

btn.newLeg.addEventListener("click", () => {
  while (session.raw.throws.length % 3 != 0) {
          session.raw.throws.push({x:null, y:null, dx:null, dy:null, score:null, multiplier:null, segment:"-", type:"notThrown"});
        }
  gameState.leg++;
  update(session);
  gameState.isPaused = false;
  canvas.style.cursor = "crosshair";
  btn.newLeg.toggleAttribute("hidden");
})

btn.sessionStats.addEventListener("click", () => {
  slider.style.transform = "translateX(0%)";
  update(session);
})

btn.allTimeStats.addEventListener("click", () => {
  slider.style.transform = "translateX(100%)";
  showAllTimeStats(longTermStats);
})

// PAGE SWITCH BUTTON - event listeners

document.getElementById("practice").addEventListener("click", () => {
  gameState.leg = null;
  session = createSession();
  database.sessions.add(session)
  init(session);
  subtitle.innerText = "Practice Mode";
  page.style.transform = "translateX(-100vw)";
})

document.getElementById("game").addEventListener("click", () => {
  gameState.isGame = true;
  session = createSession();
  database.sessions.add(session)
  init(session);
  subtitle.innerText = "Game Mode";
  page.style.transform = "translateX(-100vw)";
})

document.getElementById("home-page").addEventListener("click", () => {
  page.style.transform = "translateX(0vw)";
  gameState.isGame = false;
})

document.getElementById("view-stats").addEventListener("click", async () => {
  slider.style.transform = "translateX(0%)";
  update(session);
  page.style.transform = "translateX(-200vw)";
  allSessions = await database.sessions.toArray();
  longTermStats = calculateLongTermStats(allSessions);
})

document.getElementById("back-to-tracker").addEventListener("click", () => {
  page.style.transform = "translateX(-100vw)";
})
