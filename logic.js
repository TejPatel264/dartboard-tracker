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

  throws.push({x, y, dx, dy, score, multiplier, segment, type:"normal", throwNo: null, visit: null, leg: gameState.leg, scoreBefore:null, scoreAfter:null, isCheckoutAttempt: false});
}

function drawGameScore(num=501, leg=1, throwNo=1) {
  ctx.fillStyle = "#111";
  ctx.font = "bold 20px monospace";
  ctx.textAlign = "left";
  ctx.textBaseline = "top";

  ctx.fillText(`Score: ${num}`,2,1);

  ctx.textAlign = "right";
  ctx.fillText(`Leg: ${leg}`,498,1);
  ctx.fillText(`Throw: ${throwNo}`,498,25);
}

function updateGameScore(session) {

  const throws = session.raw.throws
  const currentThrow = throws[throws.length-1]
  let currentLeg = t => t.leg == gameState.leg
  let currentLegScores = throws.filter(currentLeg)
  let thrown = t => t.type != "notThrown"
  
  if (currentLegScores.length == 0) {drawGameScore(501, gameState.leg, 0); return;}

  if (currentThrow.type != "notThrown") currentThrow.throwNo = currentLegScores.filter(thrown).length
  currentThrow.visit = Math.ceil(currentLegScores.length / 3)

  gameState.scoreRemaining = 501 - currentLegScores.reduce((sum,t) => sum + t.score, 0);
  currentThrow.scoreBefore = gameState.scoreRemaining + currentThrow.score;
  currentThrow.scoreAfter = gameState.scoreRemaining;

  let isValidCheckout = currentThrow.multiplier == 2;
  if ((currentThrow.scoreBefore == 50 && currentLegScores.length % 3 == 0) || (currentThrow.scoreBefore <= 40 && currentThrow.scoreBefore % 2 == 0)) {
    currentThrow.isCheckoutAttempt = true;
  }
  
  drawGameScore(gameState.scoreRemaining, gameState.leg, currentLegScores.length);

  if (gameState.scoreRemaining == 0 && isValidCheckout) {
    gameState.isPaused = true;
    session.stats.basic.throwsPerLeg.push(currentLegScores.length);
    session.stats.basic.totalLegs = session.stats.basic.throwsPerLeg.length
    session.stats.checkout.highest = Math.max(session.stats.checkout.highest, throws[throws.length-(throws.length%3||3)-1].scoreAfter);
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
      gameState.scoreRemaining = throws[throws.length-(throws.length%3||3)-1].scoreAfter
      for (let i=0; i<(throws.length%3||3); i++) {
        throws[throws.length - 1 - i].score = 0;
        throws[throws.length - 1 - i].segment = 0;
        throws[throws.length - 1 - i].type = "bust"
        throws[throws.length - 1 - i].scoreRemaining = gameState.scoreRemaining;
      }
      while (throws.length % 3 != 0) {
        throws.push({x:null, y:null, dx:null, dy:null, score:null, segment:"-", type:"notThrown", throwNo:null, visit:null, leg:null, scoreBefore:null, scoreAfter:null, isCheckoutAttempt: null});
      }
      update(session);
      gameState.isPaused = false;
      canvas.style.cursor = "crosshair";
    }, 2500);
  }
}

export function updateSessionStats(session) {
  const throws = session.raw.throws
  const thrown = t => t.type != "notThrown"
  
  session.stats.basic.totalThrows = throws.filter(thrown).length;
  const totalThrows = session.stats.basic.totalThrows

  session.raw.visits.length = 0;
  session.stats.scoring = {
    scoringThrows:0, scoringAverage:0, 
    throws:{T20:0, T19:0, T18:0, T17:0, T16:0, T15:0, T14:0, T13:0, T12:0, T11:0, T10:0, T9:0, T8:0, T7:0, T6:0, T5:0, T4:0, T3:0, T2:0, T1:0}, 
    visits:{v180:0, v171:0, v133:0, v95:0, v57:0}}

  const scoringThrows = (t,i) => t.type != "notThrown" && ((t.scoreBefore > 220 && i % 3 == 0) || (t.scoreBefore > 160 && i % 3 == 1) || (t.scoreBefore > 100 && i % 3 == 2));
  const scoringThrowsCount = throws.filter(scoringThrows).length;
  session.stats.scoring.scoringThrows = scoringThrowsCount;
  session.stats.scoring.scoringAverage = scoringThrowsCount > 0 ? (3*(throws.filter(scoringThrows).reduce((sum,t) => sum + t.score, 0) / scoringThrowsCount)).toFixed(2) : 0;

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

  session.stats.checkout.attempts = throws.filter(t => t.isCheckoutAttempt).length
  session.stats.checkout.success = throws.filter(t => t.scoreAfter == 0).length
  session.stats.checkout.percentage = ((session.stats.checkout.success / session.stats.checkout.attempts) * 100).toFixed(2);

  session.stats.checkout.when.throw1.attempts = 0
  session.stats.checkout.when.visit1.attempts = 0
  session.stats.checkout.when.visit2.attempts = 0

  session.stats.checkout.when.throw1.success = 0
  session.stats.checkout.when.visit1.success = 0
  session.stats.checkout.when.visit2.success = 0
  session.stats.checkout.all = []
  session.stats.checkout.tonPlus = 0

  const legs = throws.reduce((acc, t) => {
    (acc[t.leg] ??= []).push(t);
    return acc;
  }, {})
  Object.values(legs).forEach(leg => {
    if (leg[leg.length-1]?.scoreAfter != 0) return;
    session.stats.checkout.all.push(leg[leg.length-(leg.length%3||3)-1].scoreAfter);
    if (leg[leg.length-(leg.length%3||3)-1].scoreAfter >= 100) session.stats.checkout.tonPlus++;
    const checkoutThrows = leg.filter(t => t.isCheckoutAttempt);
    session.stats.checkout.when.throw1.attempts++;
    session.stats.checkout.when.visit1.attempts++;
    if (checkoutThrows.length == 1) session.stats.checkout.when.throw1.success++
    if (checkoutThrows[checkoutThrows.length-1].visit == checkoutThrows[0].visit) session.stats.checkout.when.visit1.success++
    if (checkoutThrows[checkoutThrows.length-1].visit == checkoutThrows[0].visit+1) {
      session.stats.checkout.when.visit2.success++;
      session.stats.checkout.when.visit2.attempts++;
    }
    if (checkoutThrows[checkoutThrows.length-1].visit > checkoutThrows[0].visit+1) session.stats.checkout.when.visit2.attempts++;
  })

  session.stats.checkout.segments = { 
    D20:{attempts:0, success:0, percentage:0}, 
    D19:{attempts:0, success:0, percentage:0}, 
    D18:{attempts:0, success:0, percentage:0}, 
    D17:{attempts:0, success:0, percentage:0}, 
    D16:{attempts:0, success:0, percentage:0}, 
    D15:{attempts:0, success:0, percentage:0}, 
    D14:{attempts:0, success:0, percentage:0}, 
    D13:{attempts:0, success:0, percentage:0}, 
    D12:{attempts:0, success:0, percentage:0}, 
    D11:{attempts:0, success:0, percentage:0}, 
    D10:{attempts:0, success:0, percentage:0}, 
    D9:{attempts:0, success:0, percentage:0}, 
    D8:{attempts:0, success:0, percentage:0}, 
    D7:{attempts:0, success:0, percentage:0}, 
    D6:{attempts:0, success:0, percentage:0}, 
    D5:{attempts:0, success:0, percentage:0}, 
    D4:{attempts:0, success:0, percentage:0}, 
    D3:{attempts:0, success:0, percentage:0},
    D2:{attempts:0, success:0, percentage:0},
    D1:{attempts:0, success:0, percentage:0},
    BULL:{attempts:0, success:0, percentage:0}
  }

  throws.forEach(t => {
    if (!t.isCheckoutAttempt) return;
    if (t.scoreBefore == 50) session.stats.checkout.segments.BULL.attempts++;
    else session.stats.checkout.segments[`D${t.scoreBefore/2}`].attempts++;
    if (t.scoreAfter == 0) session.stats.checkout.segments[t.segment].success++
  })

  Object.values(session.stats.checkout.segments).forEach(s => s.percentage = s.attempts ? ((s.success / s.attempts) * 100).toFixed(0) : 0)
}

function updateTrackerUI(session) {
  const totalThrows = session.stats.basic.totalThrows
  const average = session.stats.basic.average
  
  ctx.fillStyle = "#111";
  ctx.font = "bold 16px monospace";
  ctx.textBaseline = "bottom";
  ctx.textAlign = "right";
  ctx.fillText(`Average: ${average}`,498,499);
  if (!gameState.isGame) {ctx.textAlign = "left"; ctx.fillText(`Throws: ${totalThrows}`,2,499);}
}

export function showSessionStats(session) {
  let statBox = document.querySelectorAll("#view-scoring .stat-box")
  statBox[0].innerText = session.stats.basic.totalThrows
  statBox[1].innerText = session.raw.visits.length
  statBox[2].innerText = session.stats.basic.average
  statBox[3].innerText = session.stats.scoring.scoringAverage

  const topScores = document.querySelectorAll(".top-scores");
  const trebleCount = Object.entries(session.stats.scoring.throws).sort((a, b) => b[1] - a[1]);

  topScores[0].innerText = session.stats.scoring.visits.v180
  topScores.forEach((box, i) => {
    if (i == 0) return;
    if (i < trebleCount.length) box.innerText = `${trebleCount[i-1][0]}: ${trebleCount[i-1][1]}`;
    else box.innerText = "";
  });

  statBox = document.querySelectorAll("#view-doubling .stat-box")
  statBox[0].innerText = session.stats.checkout.attempts
  statBox[1].innerText = session.stats.checkout.success
  statBox[2].innerText = session.stats.checkout.percentage + "%"
  statBox[3].innerText = session.stats.checkout.when.throw1.success + "/" + session.stats.checkout.when.throw1.attempts + " | " + (100*session.stats.checkout.when.throw1.success/session.stats.checkout.when.throw1.attempts).toFixed(0) + "%"
  statBox[4].innerText = session.stats.checkout.when.visit1.success + "/" + session.stats.checkout.when.visit1.attempts + " | " + (100*session.stats.checkout.when.visit1.success/session.stats.checkout.when.visit1.attempts).toFixed(0) + "%"
  statBox[5].innerText = session.stats.checkout.when.visit2.success + "/" + session.stats.checkout.when.visit2.attempts + " | " + (session.stats.checkout.when.visit2.attempts ? (100*session.stats.checkout.when.visit2.success/session.stats.checkout.when.visit2.attempts).toFixed(0) : 0) + "%"

  const topDoubles = document.querySelectorAll(".top-doubles");
  const doubleCount = Object.entries(session.stats.checkout.segments).sort((a, b) => b[1].percentage - a[1].percentage || b[1].attempts - a[1].attempts);

  topDoubles.forEach((box, i) => {
    if (i < doubleCount.length) box.innerText =  `${doubleCount[i][0]}: ${doubleCount[i][1].percentage}% (${doubleCount[i][1].success}/${doubleCount[i][1].attempts})`;
    else box.innerText = ""
  })
}

export function showAllTimeStats(longTermStats) {
  let statBox = document.querySelectorAll("#view-scoring .stat-box")
  statBox[0].innerText = longTermStats.basic.totalThrows
  statBox[1].innerText = longTermStats.basic.totalVisits
  statBox[2].innerText = longTermStats.basic.average
  statBox[3].innerText = longTermStats.scoring.scoringAverage

  const topScores = document.querySelectorAll(".top-scores");
  const trebleCount = Object.entries(longTermStats.scoring.throws).sort((a, b) => b[1] - a[1] || b[1].attempts - a[1].attempts);

  topScores[0].innerText = longTermStats.scoring.visits.v180
  topScores.forEach((box, i) => {
    if (i == 0) return;
    if (i < trebleCount.length) box.innerText = `${trebleCount[i-1][0]}: ${trebleCount[i-1][1]}`;
    else box.innerText = "";
  });

  statBox = document.querySelectorAll("#view-doubling .stat-box")
  statBox[0].innerText = longTermStats.checkout.attempts
  statBox[1].innerText = longTermStats.checkout.success
  statBox[2].innerText = longTermStats.checkout.percentage + "%"
  statBox[3].innerText = longTermStats.checkout.when.throw1.success + "/" + longTermStats.checkout.when.throw1.attempts + " | " + (100*longTermStats.checkout.when.throw1.success/longTermStats.checkout.when.throw1.attempts).toFixed(0) + "%"
  statBox[4].innerText = longTermStats.checkout.when.visit1.success + "/" + longTermStats.checkout.when.visit1.attempts + " | " + (100*longTermStats.checkout.when.visit1.success/longTermStats.checkout.when.visit1.attempts).toFixed(0) + "%"
  statBox[5].innerText = longTermStats.checkout.when.visit2.success + "/" + longTermStats.checkout.when.visit2.attempts + " | " + (longTermStats.checkout.when.visit2.attempts ? (100*longTermStats.checkout.when.visit2.success/longTermStats.checkout.when.visit2.attempts).toFixed(0) : 0) + "%"


  const topDoubles = document.querySelectorAll(".top-doubles");
  const doubleCount = Object.entries(longTermStats.checkout.segments).sort((a, b) => b[1].percentage - a[1].percentage);

  topDoubles.forEach((box, i) => {
    if (i < doubleCount.length) box.innerText =  `${doubleCount[i][0]}: ${doubleCount[i][1].percentage}% (${doubleCount[i][1].success}/${doubleCount[i][1].attempts})`;
    else box.innerText = ""
  })
}

export function showQuickViewStats(player, allSessions, longTermStats) {
  const summaryCard = document.querySelectorAll(".summary-card")
  const sessionCount = allSessions.filter(s => s.raw.throws.length > 0).length
  const doubleCount = Object.entries(longTermStats.checkout.segments).sort((a, b) => b[1].percentage - a[1].percentage);
  const trebleCount = Object.entries(longTermStats.scoring.throws).sort((a, b) => b[1] - a[1] || b[1].attempts - a[1].attempts);
  const hit170 = allSessions.reduce((best,s) => Math.max(best,s.stats.checkout.highest),0)==170
  const maxDuration = allSessions.reduce((max, s) => Math.max(max,Number(s.meta.duration)),0)
  const totalDuration = allSessions.reduce((sum, s) => sum + Number(s.meta.duration),0)
  const formatter = new Intl.DurationFormat("en", { style: "short" });
  const maxDurationString = {
    hours: Math.floor(maxDuration / 3600000),
    minutes: Math.floor((maxDuration % 3600000) / 60000),
    seconds: Math.floor((maxDuration % 60000) / 1000)
  };
  const totalDurationString = {
    hours: Math.floor(totalDuration / 3600000),
    minutes: Math.floor((totalDuration % 3600000) / 60000),
    seconds: Math.floor((totalDuration % 60000) / 1000)
  };
  
  const dates = [...new Set(allSessions.map(s => new Date(s.meta.date).toDateString()))]
    .map(d => new Date(d))
    .sort((a,b) => (a - b))
  let longest = 0
  let current = 1
  for (let i=1; i<dates.length; i++) {
    const diff = (dates[i]-dates[i-1])/1000*60*60*24
    if (diff == 1) current++
    else {longest = Math.max(longest, current); current=1}
  }
  longest = Math.max(longest, current)
  let currentStreak = 1;
  for (let i=1; i<dates.length; i++) {
    const diff = (dates[i]-dates[i-1])/1000*60*60*24
    if (diff == 1) currentStreak++
    else break
  }
  const diffFromToday = Math.floor((new Date() - dates[dates.length-1])/(1000*60*60*24))
  if (diffFromToday>1) currentStreak = 0;


  summaryCard[0].innerHTML = 
  `<div class="card-meta">
  <hr>
  <br>Days Played: ${dates.length} ${dates.length==1?"day":"days"}
  <br><br>Total Sessions: ${sessionCount}
  <br><br>Longest Session: ${formatter.format(maxDurationString)}
  <br><br>Total Play Time: ${formatter.format(totalDurationString)}
  </div>
  <br><hr>
  <br><span class="card-stat">Total Legs:</span> ${longTermStats.basic.totalLegs}
  <br><br><span class="card-stat">Total Visits:</span> ${longTermStats.basic.totalVisits}
  <br><br><span class="card-stat">Total Throws:</span> ${longTermStats.basic.totalThrows}
  <br><br><span class="card-stat">All Time Average:</span> ${longTermStats.basic.average}
  <br><br><span class="card-stat">Average Darts to Finish:</span> ${(longTermStats.basic.totalThrows/longTermStats.basic.totalLegs).toFixed(1)} darts
  <br><br><span class="card-stat">All Time Checkout %:</span> ${longTermStats.checkout.percentage}%
  <br><br><span class="card-stat">Checkout Attempts per Leg:</span> ${(longTermStats.checkout.attempts/longTermStats.basic.totalLegs).toFixed(1)} darts
  `

  summaryCard[1].innerHTML = `${player.name}'s All Time Stats<hr style="width:25%; margin-left:50; height:1px; border-width:0; background-color:#7c1f25">`

  summaryCard[2].innerHTML = 
  `<div class="card-meta">
  <hr>
  <br>🔥 ${currentStreak} ${currentStreak==1?"day":"days"} :Current Streak
  <br><br>🏆 ${longest} ${longest==1?"day":"days"} :Longest Streak
  </div>
  <br><hr>
  <br>${longTermStats.milestone.bestAverage} <span class="card-stat">:Best Average</span> 
  <br><br>${longTermStats.milestone.bestPercentage}% <span class="card-stat">:Best Checkout %</span>
  <br><br>${hit170?allSessions.reduce((sum,s) => sum + s.stats.checkout.all.reduce((total,c) => {if (c==170) total++}, 0), 0):longTermStats.checkout.highest} <span class="card-stat">${hit170?":Total 170 Checkouts":":Highest Checkout"}</span>
  <br><br>${longTermStats.checkout.tonPlus} <span class="card-stat">:100+ Checkouts</span>
  <br><br>${doubleCount[0][0]} <span class="card-meta">(${doubleCount[0][1].percentage}%)</span> <span class="card-stat">:Most Successful Double</span>
  <br><br>${trebleCount[0][0]} <span class="card-meta">(${trebleCount[0][1]} times)</span> <span class="card-stat">:Most Hit Treble</span>
  <br><br>${longTermStats.milestone.shortestLeg} throws <span class="card-stat">:Shortest Leg</span>
  <br><br>${longTermStats.scoring.visits.highest==180?longTermStats.scoring.visits.v180:longTermStats.scoring.visits.highest} <span class="card-stat">${longTermStats.scoring.visits.highest==180?":Total 180s":":Highest Visit"}</span>
  `
}

export function showSessionSummary(player, session, allSessions) {
  const s = session.stats
  const sessionCard = document.getElementById("session-card")
  const sessionCount = allSessions.filter(s => s.raw.throws.length > 0).length
  const formatter = new Intl.DurationFormat("en", { style: "short" });
  const duration = {
    hours: Math.floor(session.meta.duration / 3600000),
    minutes: Math.floor((session.meta.duration % 3600000) / 60000),
    seconds: Math.floor((session.meta.duration % 60000) / 1000)
  };
  const d = new Date(session.meta.date)
  const time = d.toLocaleTimeString('en-GB', { 
    hour: '2-digit', 
    minute: '2-digit', 
    hour12: false 
  });
  const dates = [...new Set(allSessions.map(s => new Date(s.meta.date).toDateString()))]
    .map(d => new Date(d))
    .sort((a,b) => (a - b))
  let currentStreak = 1;
  for (let i=1; i<dates.length; i++) {
    const diff = (dates[i]-dates[i-1])/1000*60*60*24
    if (diff == 1) currentStreak++
    else break
  }
  const legs = s.basic.throwsPerLeg.length
  
  sessionCard.innerHTML = 
  `<div class="card-meta">
  Name: ${player.name}
  <br>Session: ${sessionCount}
  <br>Streak: ${currentStreak} ${currentStreak==1?"day":"days"}
  <br>Date: ${d.toLocaleDateString()}
  <br>Time: ${time}
  <br>Duration: ${formatter.format(duration)}
  </div>
  <hr style="border-width:0; height:0.75px; width:75%; margin-left:0; background-color:gray;">
  <div id="session-summary">
  <br><span class="card-stat">Legs Played:</span> ${legs}
  <br><br><span class="card-stat">Throws:</span> ${s.basic.totalThrows}
  <br><br><span class="card-stat">Visits:</span> ${s.basic.totalVisits}
  <br><br><span class="card-stat">Average:</span> ${s.basic.average}
  <br><br><span class="card-stat">171+ visits:</span> ${s.scoring.visits.v171}
  <br><br><span class="card-stat">Highest visit:</span> ${Math.max(...session.raw.visits)}
  <br><br><span class="card-stat">Checkout %:</span> ${s.checkout.percentage}%
  <br><br><span class="card-stat">Highest Checkout:</span> ${s.checkout.highest}
  </div>
  `
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
  updateTrackerUI(session);
  if (gameState.isGame) {drawGameScore(), gameState.leg = 1};
}

export function update(session) {
  drawDartboard();
  if (gameState.isGame) updateGameScore(session);
  lastThreeThrows(session);
  updateSessionStats(session);
  updateTrackerUI(session);
}