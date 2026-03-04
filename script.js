
import { btn } from "./buttons.js"
import { database, createPlayer, createSession } from "./database.js"
import { appState, gameState} from "./states.js";
import { init, update } from "./logic.js";
import { getDartThrow, handleDartThrow, updateSessionStats } from "./logic.js";
import { calculateLongTermStats } from "./stats.js";
import { showQuickViewStats, showSessionStats, showAllTimeStats, showSessionSummary } from "./logic.js";
import { chartStyles, createBarChart, updateBarChart, createHeatmap, createLineChart, updateLineChart } from "./charts.js";
import { showSummaryStatView, showSessionStatView, showScoringStatView, showDoublingStatView, toTracker } from "./statsviews.js";

let {canvas,} = appState;
let session
let throwGraph;
let visitGraph;
let doublesGraph;
let sessionTimeline;
let allSessions = await database.sessions.toArray();
let longTermStats = calculateLongTermStats(allSessions);

const page = document.getElementById("pages");
const subtitle = document.getElementById("subtitle");
const pill = document.querySelector(".pill");
const slider = document.querySelector(".slider")
const trackerPage = document.getElementById("tracker");
const throwGraphCanvas = document.getElementById("throw-graph");
const visitGraphCanvas = document.getElementById("visit-graph");
const doublesGraphCanvas = document.getElementById("doubles-graph");
const dartboardCanvas = document.querySelectorAll(".dartboard-heatmap");
const dartMarkerCanvas = document.querySelectorAll(".dartmarkers");
const heatmapCanvas = document.querySelectorAll(".heatmap");
const allCanvas = document.querySelectorAll("canvas");
const viewStatsSelect = document.getElementById("view-stats-select");
const summaryTitle = document.querySelector("#stats h2");

//for (let session of allSessions) {database.sessions.put(session)}

createPlayer()
const player = await database.player.get("local");
if (player) summaryTitle.innerText = `${player.name}'s Stats`;

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
  session.raw.throws.push({x:null, y:null, dx:null, dy:null, score:0, multiplier:0, segment:0, type:"bounceOut", throwNo:null, visit:null, leg:gameState.leg, scoreBefore:gameState.scoreRemaining, scoreAfter:gameState.scoreRemaining, isCheckoutAttempt: gameState.scoreRemaining == 50 || (gameState.scoreRemaining % 2 == 0 && gameState.scoreRemaining <= 40)});
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
          session.raw.throws.push({x:null, y:null, dx:null, dy:null, score:null, multiplier:null, segment:"-", type:"notThrown", throwNo:null, visit:null, leg:null, scoreBefore:null, scoreAfter:null, isCheckoutAttempt: null});
        }
  gameState.leg++;
  gameState.scoreRemaining = 501;
  update(session);
  database.sessions.put(session);
  gameState.isPaused = false;
  canvas.style.cursor = "crosshair";
  btn.newLeg.toggleAttribute("hidden");
  btn.toStats.toggleAttribute("hidden");
})

// STATS TYPE - event listeners

btn.sessionStats.addEventListener("click", () => {
  slider.style.transform = "translateX(0%)";
  updateBarChart(throwGraph, Object.keys(session.stats.scoring.throws), Object.values(session.stats.scoring.throws), session.stats.basic.totalThrows);
  updateBarChart(visitGraph, ["180","171+","133+","95+","57+"], Object.values(session.stats.scoring.visits), session.stats.basic.totalVisits);
  updateBarChart(doublesGraph, Object.keys(session.stats.checkout.segments), Object.keys(session.stats.checkout.segments).map(key => session.stats.checkout.segments[key].percentage), 100);
  showSessionStats(session)
})

btn.allTimeStats.addEventListener("click", () => {
  slider.style.transform = "translateX(100%)";
  updateBarChart(throwGraph, Object.keys(longTermStats.scoring.throws), Object.values(longTermStats.scoring.throws), longTermStats.basic.totalThrows);
  updateBarChart(visitGraph, ["180","171+","133+","95+","57+"], Object.values(longTermStats.scoring.visits), longTermStats.basic.totalVisits);
  updateBarChart(doublesGraph, Object.keys(longTermStats.checkout.segments), Object.keys(longTermStats.checkout.segments).map(key => longTermStats.checkout.segments[key].percentage), 100);
  showAllTimeStats(longTermStats);
})

// PAGE SWITCH BUTTON - event listeners

btn.toPracticeMode.addEventListener("click", () => {
  return;
  gameState.leg = null;
  subtitle.innerText = "Practice Mode";
  page.style.transform = "translateX(-100vw)";
})

btn.toGameMode.addEventListener("click", async () => {
  appState.page = "tracker";
  gameState.leg = 1;
  gameState.isGame = true;
  gameState.isPaused = false;
  gameState.scoreRemaining = 501;
  canvas.style.cursor = "crosshair";
  trackerPage.style.opacity = 1;
  session = createSession();
  database.sessions.add(session);
  session.meta.gameType = "501";
  session.meta.format = "game-single";
  database.sessions.put(session);
  init(session);
  throwGraph = createBarChart(throwGraphCanvas, Object.keys(session.stats.scoring.throws), Object.values(session.stats.scoring.throws));
  visitGraph = createBarChart(visitGraphCanvas, ["180","171+","133+","95+","57+"], Object.values(session.stats.scoring.visits));
  doublesGraph = createBarChart(doublesGraphCanvas, Object.keys(session.stats.checkout.segments), Object.keys(session.stats.checkout.segments).map(key => session.stats.checkout.segments[key].percentage));
  updateBarChart(throwGraph, Object.keys(longTermStats.scoring.throws), Object.values(longTermStats.scoring.throws), longTermStats.basic.totalThrows);
  updateBarChart(visitGraph, ["180","171+","133+","95+","57+"], Object.values(longTermStats.scoring.visits), longTermStats.basic.totalVisits);
  showAllTimeStats(longTermStats);
  //sessionTimeline = createLineChart(document.getElementById("session-timeline"), session.raw.throws.map((_,i) => i), session.raw.throws.map(t => t.score));\
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
  if (!gameState.isPaused) return;
  if (!pill.hasAttribute("hidden")) pill.toggleAttribute("hidden");
  allSessions = await database.sessions.toArray();
  showSessionStats(session);
  showSessionStatView();
  showSessionSummary(player,session, allSessions);
  appState.page = "stats";
  updateBarChart(throwGraph, Object.keys(session.stats.scoring.throws), Object.values(session.stats.scoring.throws), session.stats.basic.totalThrows);
  updateBarChart(visitGraph, ["180","171+","133+","95+","57+"], Object.values(session.stats.scoring.visits), session.stats.basic.totalVisits);
  updateBarChart(doublesGraph, Object.keys(session.stats.checkout.segments), Object.keys(session.stats.checkout.segments).map(key => session.stats.checkout.segments[key].percentage), 100);
  //updateLineChart(sessionTimeline, session.raw.throws.map((_,i) => i), session.raw.throws.map(t => t.score));
  slider.style.transform = "translateX(0%)";
  page.style.transform = "translateX(-200vw)";
  viewStatsSelect.style.display = "flex";
  longTermStats = calculateLongTermStats(allSessions);
  createHeatmap(dartboardCanvas[1],dartMarkerCanvas[1],heatmapCanvas[1], [session], false);
})

btn.toQuickStats.addEventListener("click", async () => {
  allSessions = await database.sessions.toArray();
  longTermStats = calculateLongTermStats(allSessions);
  showQuickViewStats(longTermStats);
  if (!pill.hasAttribute("hidden")) pill.toggleAttribute("hidden");
  trackerPage.style.opacity = 0;
  btn.backToTracker.toggleAttribute("hidden");
  showSummaryStatView();
  appState.page = "stats";
  page.style.transition = "transform 1s cubic-bezier(0.4, 1, 0.3, 1)"
  page.style.transform = "translateX(-200vw)";
  viewStatsSelect.style.display = "none";
  createHeatmap(dartboardCanvas[0],dartMarkerCanvas[0],heatmapCanvas[0], allSessions);
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
});

// STATS VIEWS - event listeners

btn.viewQuickStats.addEventListener("click", async () => {
  showSummaryStatView();
  allSessions = await database.sessions.toArray();
  longTermStats = calculateLongTermStats(allSessions);
  if (!pill.hasAttribute("hidden")) pill.toggleAttribute("hidden");
  showQuickViewStats(longTermStats);
  createHeatmap(dartboardCanvas[0],dartMarkerCanvas[0],heatmapCanvas[0], allSessions);
});

btn.viewSessionStats.addEventListener("click", async () => {
  if (!pill.hasAttribute("hidden")) pill.toggleAttribute("hidden");
  await showSessionStatView();
  createHeatmap(dartboardCanvas[1],dartMarkerCanvas[1],heatmapCanvas[1], [session], false);
});

btn.viewScoringStats.addEventListener("click", () => {
  if (pill.hasAttribute("hidden")) pill.toggleAttribute("hidden");
  showScoringStatView();
});

btn.viewDoublingStats.addEventListener("click", () => {
  if (pill.hasAttribute("hidden")) pill.toggleAttribute("hidden");
  showDoublingStatView();
})