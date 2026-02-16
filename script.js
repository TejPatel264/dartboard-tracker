
import { btn } from "./buttons.js"
import { database, createSession } from "./database.js"
import { appState, gameState} from "./states.js";
import { init, update } from "./logic.js";
import { getDartThrow, handleDartThrow } from "./logic.js";
import { calculateLongTermStats } from "./stats.js";
import { showQuickViewStats, showAllTimeStats } from "./logic.js";
import { chartStyles, createBarChart, updateBarChart, createHeatmap } from "./charts.js";
import { showSummaryStats, showScoringStats, toTracker } from "./statsviews.js";

let {canvas,} = appState;
let session
let longTermStats;
let throwGraph;
let visitGraph;
let allSessions = await database.sessions.toArray()

const page = document.getElementById("pages");
const subtitle = document.getElementById("subtitle");
const slider = document.querySelector(".slider")
const trackerPage = document.getElementById("tracker");
const throwGraphCanvas = document.getElementById("throw-graph").getContext("2d");
const visitGraphCanvas = document.getElementById("visit-graph").getContext("2d");
const dartboardCanvas = document.querySelector(".dartboard-heatmap")
const dartMarkerCanvas = document.querySelector(".dartmarkers")
const heatmapCanvas = document.getElementById("all-time-heatmap")
const allCanvas = document.querySelectorAll("canvas")
const viewStatsSelect = document.getElementById("view-stats-select")

//for (let session of allSessions) {database.sessions.put(session)}

await database.sessions.filter(s => s.raw.throws.length == 0).delete()
session = createSession();
database.sessions.add(session);

chartStyles()
throwGraph = createBarChart(throwGraphCanvas, Object.keys(session.stats.scoring.throws), Object.values(session.stats.scoring.throws));
visitGraph = createBarChart(visitGraphCanvas, ["180","171+","131+","91+","51+"], Object.values(session.stats.scoring.visits)); 

// THROW TRACKER

canvas.addEventListener("click", (e) => {
  if (gameState.isPaused) return;
  const dart = getDartThrow(e);
  handleDartThrow(dart, session);
  update(session);
  session.meta.duration = Date.now() - session.meta.date;
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
  updateBarChart(throwGraph, Object.keys(session.stats.scoring.throws), Object.values(session.stats.scoring.throws), session.stats.basic.totalThrows);
  updateBarChart(visitGraph, ["180","171+","131+","91+","51+"], Object.values(session.stats.scoring.visits), session.stats.basic.totalVisits);
  update(session);
})

btn.allTimeStats.addEventListener("click", () => {
  slider.style.transform = "translateX(100%)";
  updateBarChart(throwGraph, Object.keys(longTermStats.scoring.throws), Object.values(longTermStats.scoring.throws), longTermStats.basic.totalThrows);
  updateBarChart(visitGraph, ["180","171+","131+","91+","51+"], Object.values(longTermStats.scoring.visits), longTermStats.basic.totalVisits);
  showAllTimeStats(longTermStats);
})

// PAGE SWITCH BUTTON - event listeners

btn.toPracticeMode.addEventListener("click", () => {
  gameState.leg = null;
  session = createSession();
  database.sessions.add(session);
  init(session);
  subtitle.innerText = "Practice Mode";
  page.style.transform = "translateX(-100vw)";
})

btn.toGameMode.addEventListener("click", () => {
  gameState.isGame = true;
  session = createSession();
  database.sessions.add(session);
  init(session);
  subtitle.innerText = "Game Mode";
  page.style.transform = "translateX(-100vw)";
})

btn.backToHomeFromTracker.addEventListener("click", () => {
  page.style.transform = "translateX(0vw)";
  gameState.isGame = false;
  page.addEventListener("transitionend", () => {
    allCanvas.forEach(c => {
    let ctx = c.getContext("2d")
    ctx.clearRect(0,0,c.width,c.height)
    if (throwGraph) throwGraph.destroy();
    if (visitGraph) visitGraph.destroy();
  })}, {once: true}
)
})

btn.toStats.addEventListener("click", async () => {
  document.getElementById("view-scoring").toggleAttribute("show")
  updateBarChart(throwGraph, Object.keys(session.stats.scoring.throws), Object.values(session.stats.scoring.throws), session.stats.basic.totalThrows);
  updateBarChart(visitGraph, ["180","171+","131+","91+","51+"], Object.values(session.stats.scoring.visits), session.stats.basic.totalVisits);
  slider.style.transform = "translateX(0%)";
  update(session);
  page.style.transform = "translateX(-200vw)";
  viewStatsSelect.style.opacity = 1;
  allSessions = await database.sessions.toArray();
  longTermStats = calculateLongTermStats(allSessions);
})

btn.toQuickStats.addEventListener("click", async () => {
  allSessions = await database.sessions.toArray();
  longTermStats = calculateLongTermStats(allSessions);
  showQuickViewStats(longTermStats, allSessions);
  trackerPage.style.opacity = 0;
  btn.backToTracker.toggleAttribute("hidden");
  showSummaryStats()
  page.style.transition = "transform 1s cubic-bezier(0.4, 1, 0.3, 1)"
  page.style.transform = "translateX(-200vw)";
  viewStatsSelect.style.opacity = 1;
  createHeatmap(dartboardCanvas,dartMarkerCanvas,heatmapCanvas, allSessions);
})

btn.backToTracker.addEventListener("click", () => {
  toTracker();
})

btn.backToHomeFromStats.addEventListener("click", () => {
  page.style.transform = "translateX(0vw)";
  page.addEventListener("transitionend", () => {
    trackerPage.style.opacity = 1;
    document.querySelectorAll(".stat-view").forEach(view => view.removeAttribute("show"));
    if (throwGraph) throwGraph.destroy();
    if (visitGraph) visitGraph.destroy();
    btn.backToTracker.toggleAttribute("hidden");
    page.style.transition = "transform 0.7s cubic-bezier(0.3,0.2,0.2,1)"
  }, {once: true});
})

btn.viewQuickStats.addEventListener("click", () => {
  showSummaryStats()
})

btn.viewScoringStats.addEventListener("click", () => {
  showScoringStats()
})