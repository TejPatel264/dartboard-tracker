import { appState, gameState } from "./states.js"
import { btn } from "./buttons.js"

let { canvas, ctx, width, height, center, } = appState

const sectorScores = [20,1,18,4,13,6,10,15,2,17,3,19,7,16,8,11,14,9,12,5];

function drawCircle(r,w=1,fill="rgb(0,0,0,0)") {
    ctx.fillStyle = fill;
    ctx.beginPath();
    ctx.arc(center.x, center.y, r, 0, Math.PI*2);
    ctx.fill();
    ctx.strokeStyle = "#c0c0c0";
    ctx.lineWidth = w;
    ctx.stroke();
}

function drawLine(startx,starty,endx,endy) {
  ctx.beginPath();
  ctx.moveTo(startx, starty);
  ctx.lineTo(endx, endy);
  ctx.lineWidth = 1;
  ctx.strokeStyle = "#c0c0c0";
  ctx.stroke();
}

function drawRingSector(innerR, outerR, startAngle, endAngle, color) {
    ctx.beginPath();
    ctx.arc(center.x, center.y, outerR, startAngle, endAngle);
    ctx.arc(center.x, center.y, innerR, endAngle, startAngle, true);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill()
}

function drawNumbers(i,x,y) {
  ctx.fillStyle = "#fff";
  ctx.font = "bold 24px monospace";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  ctx.fillText(sectorScores[i],x,y);
}

function drawDartboard() {
  ctx.clearRect(0, 0, width, height);
  drawCircle(225.5, 2,"#222")
  for (let i=0; i<20; i++) {
    let angle = (i+1/2) * (Math.PI/10);
    const startx = center.x + Math.sin(angle) * 16;
    const starty = center.y - Math.cos(angle) * 16;
    const endx = center.x + Math.sin(angle) * 180;
    const endy = center.y - Math.cos(angle) * 180;
    drawLine(startx,starty,endx,endy);

    let colour = i % 2 == 0 ? "#b11226" : "#007a3d"
    drawRingSector(162, 170, angle, angle+Math.PI/10, colour);
    drawRingSector(99, 107, angle, angle+Math.PI/10, colour);

    colour = i % 2 == 0 ? "#1a1a1a" : "#f2e6c9"
    drawRingSector(107, 162, angle, angle+Math.PI/10, colour);
    drawRingSector(16, 99, angle, angle+Math.PI/10, colour);

    angle = i * (Math.PI/10);
    const x = center.x + Math.sin(angle) * 200;
    const y = center.y - Math.cos(angle) * 200;
    drawNumbers(i,x,y);

  }
  drawCircle(170)
  drawCircle(162)
  drawCircle(107)
  drawCircle(99)
  drawCircle(16, 1,"#007a3d")
  drawCircle(6.35,1,"#b11226")
}

export function getDartThrow(e) {
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  return {x,y}
}

export function handleDartThrow(dart, session) {
  const throws = session.raw.throws
  const {x,y} = dart;
  const dx = x - center.x;
  const dy = y - center.y;
  const dist = Math.sqrt(dx*dx + dy*dy);

  let angle = Math.atan2(dy, dx);
  let multiplier;
  let segment;

  while (angle < -11*Math.PI/20) angle += 2*Math.PI;
  const sector = Math.floor((angle + 11*Math.PI/20) / (Math.PI/10));
  let score = sectorScores[sector];

  if (dist < 6.35) {score = 50; multiplier = 2; segment = "BULL"}
  else if (dist < 16) {score = 25; multiplier = 1; segment = 25}
  else if (dist > 99 && dist < 107) {score *= 3; multiplier = 3; segment = `T${score/3}`}
  else if (dist > 162 && dist < 170) {score *= 2; multiplier = 2; segment = `D${score/2}`}
  else if (dist > 170) {score = 0; multiplier = 0; segment = 0}
  else {multiplier = 1; segment = score}

  throws.push({x, y, dx, dy, score, multiplier, segment, type:"normal", leg: gameState.leg, scoreRemaining:null, isCheckoutAttempt: false});
}

export function drawGameScore(num=501, leg=1) {
  ctx.fillStyle = "#111";
  ctx.font = "bold 20px monospace";
  ctx.textAlign = "left";
  ctx.textBaseline = "top";

  ctx.fillText(`Score: ${num}`,2,1);

  ctx.textAlign = "right";
  ctx.fillText(`Leg: ${leg}`,498,1);
}

export function updateGameScore(session) {

  const throws = session.raw.throws
  const currentThrow = throws[throws.length-1]
  let currentLeg = t => t.leg == gameState.leg
  let currentLegScores = throws.filter(currentLeg)
  
  if (currentLegScores.length == 0) {drawGameScore(gameState.scoreRemaining); return;}

  let isValidCheckout = currentThrow.multiplier == 2;
  if (gameState.scoreRemaining == 50 || (gameState.scoreRemaining <= 40 && gameState.scoreRemaining % 2 == 0)) {
    currentThrow.isCheckoutAttempt = true;
    session.stats.checkout.attempts++;
  }

  gameState.scoreRemaining = 501 - currentLegScores.reduce((sum,t) => sum + t.score, 0);
  currentThrow.scoreRemaining = gameState.scoreRemaining
  
  drawGameScore(gameState.scoreRemaining, gameState.leg);

  if (currentThrow.isCheckoutAttempt) {
    if (isValidCheckout) {
      session.stats.checkout.success++;
      if (currentThrow.segment in session.stats.checkout.segments) session.stats.checkout.segments[currentThrow.segment]++;
    }
    session.stats.checkout.percentage = ((session.stats.checkout.success / session.stats.checkout.attempts) * 100).toFixed(2);
  }

  
  if (gameState.scoreRemaining == 0 && isValidCheckout) {
    gameState.isPaused = true;
    session.stats.basic.throwsPerLeg.push(currentLegScores.length);
    session.stats.checkout.highest = Math.max(session.stats.checkout.highest, throws[throws.length-(throws.length%3||3)-1].scoreRemaining);
    setTimeout(() => {
      canvas.style.cursor = "default";
      ctx.fillStyle = "rgb(0,0,0,0.75)"
      ctx.fillRect(0,0,width,height);
      ctx.fillStyle = "#f5f5f5";
      ctx.font = "bold 48px monospace";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("CHECKOUT",250,240);

      ctx.strokeStyle = "#d4a017";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(190,260);
      ctx.lineTo(310,260);
      ctx.stroke();

      btn.newLeg.removeAttribute("hidden");
      btn.toStats.removeAttribute("hidden");
    }, 1000);
  }
  if (gameState.scoreRemaining < 0 || gameState.scoreRemaining == 1 || (gameState.scoreRemaining == 0 && !isValidCheckout)) {
    gameState.isPaused = true;
    setTimeout(() => {
      canvas.style.cursor = "default";
      ctx.fillStyle = "rgb(0,0,0,0.85)"
      ctx.fillRect(0,0,width,height);
      ctx.fillStyle = "#ddd";
      ctx.font = "bold 40px monospace";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("BUST",250,240);

      ctx.strokeStyle = "#888"
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(230,258);
      ctx.lineTo(270,258);
      ctx.stroke();
    }, 1000)
    setTimeout(() => {
      gameState.scoreRemaining = throws[throws.length-(throws.length%3||3)-1].scoreRemaining
      for (let i=0; i<(throws.length%3||3); i++) {
        throws[throws.length - 1 - i].score = 0;
        throws[throws.length - 1 - i].segment = 0;
        throws[throws.length - 1 - i].type = "bust"
        throws[throws.length - 1 - i].scoreRemaining = gameState.scoreRemaining;
      }
      while (throws.length % 3 != 0) {
        throws.push({x:null, y:null, dx:null, dy:null, score:null, segment:"-", type:"notThrown", leg:null, scoreRemaining:null, isCheckoutAttempt: null});
      }
      update(session);
      gameState.isPaused = false;
      canvas.style.cursor = "crosshair";
    }, 2500);
  }
}


function updateSessionStats(session) {
  const throws = session.raw.throws
  const thrown = t => t.type != "notThrown"
  
  session.stats.basic.totalThrows = throws.filter(thrown).length;
  const totalThrows = session.stats.basic.totalThrows
  
  session.raw.visits.length = 0;
  session.stats.scoring = {throws:{T20:0, T19:0, T18:0, T17:0, T16:0}, visits:{v180:0, v171:0, v133:0, v95:0, v57:0}}

  session.stats.basic.average = (3*throws.reduce((sum,t)=>sum+t.score,0)/Math.max(1,totalThrows)).toFixed(2);
  
  for (let i=0; i < throws.length; i+=3) {
    const visit = throws.slice(i,i+3);
    const visitScore = visit.reduce((sum, t) => sum + t.score, 0)
    session.raw.visits[i/3] = visitScore
  }
  session.stats.basic.totalVisits = session.raw.visits.length

  session.raw.visits.forEach(v => {
    if (v == 180) session.stats.scoring.visits.v180++;
    else if (v >= 171) session.stats.scoring.visits.v171++;
    else if (v >= 133) session.stats.scoring.visits.v133++;
    else if (v >= 95) session.stats.scoring.visits.v95++;
    else if (v >= 57) session.stats.scoring.visits.v57++;
  })

  throws.forEach(t => {
    for (let i in session.stats.scoring.throws) {
      if (t.segment == i) session.stats.scoring.throws[i]++
    }
  })
}

function updateSessionStatsUI(session) {
  const totalThrows = session.stats.basic.totalThrows
  const average = session.stats.basic.average
  
  function drawStats() {
    ctx.fillStyle = "#111";
    ctx.font = "bold 16px monospace";
    ctx.textAlign = "left";
    ctx.textBaseline = "bottom";

    ctx.fillText(`Throws: ${totalThrows}`,2,499);

    ctx.textAlign = "right";
    ctx.fillText(`Average: ${average}`,498,499);
  }
  
  drawStats()

  const statBox = document.querySelectorAll("#view-scoring .stat-box")
  statBox[0].innerText = totalThrows
  statBox[1].innerText = session.raw.visits.length
  statBox[2].innerText = average
  statBox[3].innerText = session.stats.scoring.throws.T20
  statBox[4].innerText = session.stats.scoring.throws.T19
  statBox[5].innerText = session.stats.scoring.throws.T18
  statBox[6].innerText = session.stats.scoring.throws.T17
  statBox[7].innerText = session.stats.scoring.throws.T16
  statBox[8].innerText = session.stats.scoring.visits.v180
  statBox[9].innerText = session.stats.scoring.visits.v171
  statBox[10].innerText = session.stats.scoring.visits.v133
  statBox[11].innerText = session.stats.scoring.visits.v95
  statBox[12].innerText = session.stats.scoring.visits.v57
}

export function showAllTimeStats(longTermStats) {
  const statBox = document.querySelectorAll("#view-scoring .stat-box")
  statBox[0].innerText = longTermStats.basic.totalThrows
  statBox[1].innerText = longTermStats.basic.totalVisits
  statBox[2].innerText = longTermStats.basic.average
  statBox[3].innerText = longTermStats.scoring.throws.T20
  statBox[4].innerText = longTermStats.scoring.throws.T19
  statBox[5].innerText = longTermStats.scoring.throws.T18
  statBox[6].innerText = longTermStats.scoring.throws.T17
  statBox[7].innerText = longTermStats.scoring.throws.T16
  statBox[8].innerText = longTermStats.scoring.visits.v180
  statBox[9].innerText = longTermStats.scoring.visits.v171
  statBox[10].innerText = longTermStats.scoring.visits.v133
  statBox[11].innerText = longTermStats.scoring.visits.v95
  statBox[12].innerText = longTermStats.scoring.visits.v57
}

export function showQuickViewStats(longTermStats) {
  const statBox = document.querySelectorAll("#view-quick .stat-box")
  statBox[0].innerText = longTermStats.basic.totalThrows
  statBox[1].innerText = longTermStats.basic.average
  statBox[2].innerText = longTermStats.checkout.percentage + "%"
  statBox[3].innerText = longTermStats.milestone.bestAverage
  statBox[4].innerText = longTermStats.milestone.bestPercentage + "%"
  statBox[5].innerText = longTermStats.checkout.highest
  statBox[6].innerText = longTermStats.milestone.shortestLeg + " throws"
}

export function showSessionStats(session) {
  const statBox = document.querySelectorAll("#view-session .stat-box")
  const s = session.stats
  const stats = [s.basic.totalThrows,s.basic.average,s.checkout.percentage + "%"] 
  statBox.forEach((box, i) => box.innerText = stats[i])
}

function drawDartMarker(x,y,current=false) {
  const size = current ? 4 : 3
  ctx.strokeStyle = "#d4a017";
  ctx.lineWidth = 2;

  ctx.beginPath();
  ctx.moveTo(x-size,y-size);
  ctx.lineTo(x+size,y+size);
  ctx.moveTo(x+size,y-size);
  ctx.lineTo(x-size,y+size);
  ctx.stroke()
}

function lastThreeThrows(session) {
  const throws = session.raw.throws
  const scoreBox = document.querySelectorAll(".score-box");
  const total = throws.length;
  const currentScoreBox = document.querySelector("[data-current]");
  const normalThrow = t => t.type == "normal"
  const currentThrowOfVisit = total % 3 || 3
  const currentVisit = throws.slice(-currentThrowOfVisit)

  scoreBox.forEach(score => score.innerText = ".");

  if (currentScoreBox) currentScoreBox.toggleAttribute("data-current");
  if (total == 0) return;

  let sum = 0;
  throws.forEach(t => sum += t.score)

  currentVisit
  .filter(normalThrow)
  .forEach((t,i,arr) => 
    drawDartMarker(t.x, t.y, i == arr.length - 1));

  currentVisit
  .forEach((t,i) => 
  scoreBox[i].innerText = t.segment);

  scoreBox[currentThrowOfVisit - 1].toggleAttribute("data-current");
}

export function init(session) {
  drawDartboard();
  updateSessionStats(session);
  updateSessionStatsUI(session);
  if (gameState.isGame) {drawGameScore(), gameState.leg = 1};
}

export function update(session) {
  drawDartboard();
  updateSessionStats(session);
  updateSessionStatsUI(session);
  lastThreeThrows(session);
  if (gameState.isGame) updateGameScore(session);
}