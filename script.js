
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
const throwGraphCanvas = document.getElementById("throw-graph");
const visitGraphCanvas = document.getElementById("visit-graph");
const dartboardCanvas = document.querySelector(".dartboard-heatmap");
const dartMarkerCanvas = document.querySelector(".dartmarkers");
const heatmapCanvas = document.getElementById("all-time-heatmap");
const allCanvas = document.querySelectorAll("canvas");
const viewStatsSelect = document.getElementById("view-stats-select");

//for (let session of allSessions) {database.sessions.put(session)}

await database.sessions.filter(s => s.raw.throws.length <= 3).delete();

chartStyles();

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
  session.raw.throws.push({x:null, y:null, dx:null, dy:null, score:0, multiplier:0, segment:0, leg:gameState.leg, type:"bounceOut", scoreRemaining: gameState.scoreRemaining});
  update(session);
  session.meta.duration = Date.now() - session.meta.date;
  database.sessions.put(session);
})

btn.delLastThrow.addEventListener("click", () => {
  if (session.raw.throws.length == 0) return;
  if (gameState.isGame && session.raw.throws[session.raw.throws.length - 1].leg != gameState.leg) return;
  if (gameState.isGame && gameState.isPaused) {btn.newLeg.toggleAttribute("hidden"), gameState.isPaused = false, canvas.style.cursor="crosshair"};
  session.raw.throws.pop();
  update(session);
  session.meta.duration = Date.now() - session.meta.date;
  database.sessions.put(session);
});

btn.newLeg.addEventListener("click", () => {
  while (session.raw.throws.length % 3 != 0) {
          session.raw.throws.push({x:null, y:null, dx:null, dy:null, score:null, multiplier:null, segment:"-", type:"notThrown", leg:null, scoreRemaining:null, isCheckoutAttempt: null});
        }
  gameState.leg++;
  gameState.scoreRemaining = 501;
  update(session);
  gameState.isPaused = false;
  canvas.style.cursor = "crosshair";
  btn.newLeg.toggleAttribute("hidden");
})

btn.sessionStats.addEventListener("click", () => {
  slider.style.transform = "translateX(0%)";
  updateBarChart(throwGraph, Object.keys(session.stats.scoring.throws), Object.values(session.stats.scoring.throws), session.stats.basic.totalThrows);
  updateBarChart(visitGraph, ["180","171+","133+","95+","57+"], Object.values(session.stats.scoring.visits), session.stats.basic.totalVisits);
})

btn.allTimeStats.addEventListener("click", () => {
  slider.style.transform = "translateX(100%)";
  updateBarChart(throwGraph, Object.keys(longTermStats.scoring.throws), Object.values(longTermStats.scoring.throws), longTermStats.basic.totalThrows);
  updateBarChart(visitGraph, ["180","171+","133+","95+","57+"], Object.values(longTermStats.scoring.visits), longTermStats.basic.totalVisits);
  showAllTimeStats(longTermStats);
})

// PAGE SWITCH BUTTON - event listeners

btn.toPracticeMode.addEventListener("click", () => {
  return;
  gameState.leg = null;
  subtitle.innerText = "Practice Mode";
  page.style.transform = "translateX(-100vw)";
})

btn.toGameMode.addEventListener("click", () => {
  appState.page = "tracker";
  gameState.leg = 1;
  gameState.isGame = true;
  trackerPage.style.opacity = 1;
  session = createSession();
  database.sessions.add(session);
  init(session);
  throwGraph = createBarChart(throwGraphCanvas, Object.keys(session.stats.scoring.throws), Object.values(session.stats.scoring.throws));
  visitGraph = createBarChart(visitGraphCanvas, ["180","171+","133+","95+","57+"], Object.values(session.stats.scoring.visits)); 
  subtitle.innerText = "Game Mode";
  page.style.transform = "translateX(-100vw)";
  
})

btn.backToHomeFromTracker.addEventListener("click", () => {
  page.style.transform = "translateX(0vw)";
  appState.page = "home";
  gameState.isGame = false;
  page.addEventListener("transitionend", () => {
    allCanvas.forEach(c => {
    let ctx = c.getContext("2d")
    ctx.clearRect(0,0,c.width,c.height)
    if (throwGraph) throwGraph.destroy();
    if (visitGraph) visitGraph.destroy();
    })}, {once: true}
  );
})

btn.toStats.addEventListener("click", async () => {
  appState.page = "stats";
  showScoringStats();
  updateBarChart(throwGraph, Object.keys(session.stats.scoring.throws), Object.values(session.stats.scoring.throws), session.stats.basic.totalThrows);
  updateBarChart(visitGraph, ["180","171+","133+","95+","57+"], Object.values(session.stats.scoring.visits), session.stats.basic.totalVisits);
  slider.style.transform = "translateX(0%)";
  page.style.transform = "translateX(-200vw)";
  viewStatsSelect.style.display = "flex";
  allSessions = await database.sessions.toArray();
  longTermStats = calculateLongTermStats(allSessions);
})

btn.toQuickStats.addEventListener("click", async () => {
  appState.page = "stats";
  allSessions = await database.sessions.toArray();
  longTermStats = calculateLongTermStats(allSessions);
  showQuickViewStats(longTermStats);
  trackerPage.style.opacity = 0;
  btn.backToTracker.toggleAttribute("hidden");
  showSummaryStats();
  page.style.transition = "transform 1s cubic-bezier(0.4, 1, 0.3, 1)"
  page.style.transform = "translateX(-200vw)";
  viewStatsSelect.style.display = "none";
  createHeatmap(dartboardCanvas,dartMarkerCanvas,heatmapCanvas, allSessions);
})

btn.backToTracker.addEventListener("click", () => {
  appState.page = "tracker";
  viewStatsSelect.style.display = "none";
  toTracker();
})

btn.backToHomeFromStats.addEventListener("click", () => {
  appState.page = "home";
  trackerPage.style.opacity = 0;
  page.style.transform = "translateX(0vw)";
  viewStatsSelect.style.display = "none";
  page.addEventListener("transitionend", () => {
    trackerPage.style.opacity = 1;
    document.querySelectorAll(".stat-view").forEach(view => view.removeAttribute("show"));
    if (throwGraph && gameState.isGame) throwGraph.destroy();
    if (visitGraph && gameState.isGame) visitGraph.destroy();
    btn.backToTracker.removeAttribute("hidden");
    page.style.transition = "transform 0.7s cubic-bezier(0.3,0.2,0.2,1)"
  }, {once: true});
})

btn.viewQuickStats.addEventListener("click", async () => {
  showSummaryStats();
  allSessions = await database.sessions.toArray();
  longTermStats = calculateLongTermStats(allSessions);
  showQuickViewStats(longTermStats);
  createHeatmap(dartboardCanvas,dartMarkerCanvas,heatmapCanvas, allSessions);
})

btn.viewScoringStats.addEventListener("click", () => {
  showScoringStats();
})