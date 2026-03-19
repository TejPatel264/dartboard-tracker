import { appState, gameState } from "./states.js"
import { btn } from "./buttons.js"

let { canvas, ctx, width, height, center, } = appState
//center.y += 25

const sectorScores = [20,1,18,4,13,6,10,15,2,17,3,19,7,16,8,11,14,9,12,5];

function drawCircle(r,w=1,fill="rgb(0,0,0,0)",stroke="#c0c0c0",centerx=center.x,centery=center.y) {
    ctx.fillStyle = fill;
    ctx.beginPath();
    ctx.arc(centerx, centery, r, 0, Math.PI*2);
    ctx.fill();
    ctx.strokeStyle = stroke;
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

function drawRingSector(innerR, outerR, startAngle, endAngle, color, c=ctx) {
    c.beginPath();
    c.arc(center.x, center.y, outerR, startAngle, endAngle);
    c.arc(center.x, center.y, innerR, endAngle, startAngle, true);
    c.closePath();
    c.fillStyle = color;
    c.fill()
}

function drawNumbers(i,x,y) {
  ctx.fillStyle = "#fff";
  ctx.font = "bold 20px monospace";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  ctx.fillText(sectorScores[i],x,y);
}

function drawDartboard() {
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = "#ddd";
  ctx.fillRect(0,0,width,height+50);
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
  const scaleX = width/rect.width;
  const scaleY = height/rect.height;
  const x = (e.clientX - rect.left)*scaleX;
  const y = (e.clientY - rect.top)*scaleY - 25;
  return {x,y}
}

export function drawMagnifier(dart) {
  const {x,y} = dart
  const dx = x - center.x;
  const dy = y - center.y;
  const dist = Math.sqrt(dx*dx + dy*dy);
  let angle = Math.atan2(dy, dx);
  while (angle < -11*Math.PI/20) angle += 2*Math.PI;
  const sector = Math.floor((angle + 11*Math.PI/20) / (Math.PI/10));
  let sectorAngle = (Math.round(angle / (Math.PI/10)) - 1/2) * Math.PI/10;
  const zoom = 2
  let size = 50
  let offsetY = 100
  let offsetX = 0

  //if (dist > 16 && dist < 200) drawRingSector(16, 170, sectorAngle, sectorAngle+Math.PI/10, "#ffffff77");

  if(dist > 275) return;

  ctx.save()

  if (y-offsetY-size < 0) {
    offsetY = y - size
    if (x < 200) offsetX = Math.min(150, (offsetY - 100) * Math.sqrt(Math.PI))
    else offsetX = Math.min(150, (100 - offsetY) * Math.sqrt(Math.PI))
  }

  if (x-offsetX-size < 0) offsetX = x - size
  if (x-offsetX+size > width) offsetX = x + size - width


  ctx.beginPath()
  ctx.arc(x-offsetX,y-offsetY,size,0,Math.PI*2)
  ctx.clip()

  ctx.drawImage(canvas, x-size/zoom, y-size/zoom, 2*size/zoom, 2*size/zoom, x-offsetX-size, y-offsetY-size, size*2, size*2);

  ctx.restore()

  drawCircle(size, 3, "#11111177", "#777", x-offsetX, y-offsetY)

  const grad = ctx.createRadialGradient(x-offsetX-size*0.25,y-offsetY-size*0.25,5,x-offsetX,y-offsetY,size)
  grad.addColorStop(0,"rgba(255,255,255,0.25)")
  grad.addColorStop(1,"rgba(255,255,255,0)")
  ctx.beginPath()
  ctx.arc(x-offsetX,y-offsetY,size,0,Math.PI*2)
  ctx.fillStyle = grad
  ctx.fill()

  ctx.font = "bold 20px monospace";
  ctx.textAlign = "center";
  ctx.textBaseline = "bottom";
  let mult = "";
  if (dist>99 && dist<107) mult="T"
  else if (dist>162 && dist<170) mult="D"
  const text = mult + sectorScores[sector]
  ctx.fillStyle = "#eeeeeeaa";
  if (dist > 16 && dist < 250) ctx.fillText(text,x-offsetX,y-offsetY+size*0.9);
  else if (dist <= 16) ctx.fillText(dist<6.35 ?"BULL":25,x-offsetX,y-offsetY+size*0.9);

  //drawDartMarker(x-offsetX,y-offsetY,false,5,"#ccc")

  size = 8
  ctx.strokeStyle = "#eee";
  ctx.lineWidth = 1.5;

  ctx.beginPath();
  ctx.moveTo(x-offsetX-size,y-offsetY-size);
  ctx.lineTo(x-offsetX-3,y-offsetY-3);
  ctx.moveTo(x-offsetX+3,y-offsetY+3);
  ctx.lineTo(x-offsetX+size,y-offsetY+size);
  ctx.moveTo(x-offsetX+size,y-offsetY-size);
  ctx.lineTo(x-offsetX+3,y-offsetY-3);
  ctx.moveTo(x-offsetX-3,y-offsetY+3);
  ctx.lineTo(x-offsetX-size,y-offsetY+size);
  ctx.stroke()

  drawCircle(0.75,1,"aaa","aaa",x-offsetX,y-offsetY)
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

  throws.push({x, y, angle, dist, dx, dy, score, multiplier, segment, type:"normal", throwNo: null, visit: null, leg: gameState.leg, scoreBefore:null, scoreAfter:null, isCheckoutAttempt: false});
}

function drawGameScore(num=501, leg=1, throwNo=1) {
  ctx.fillStyle = "#111";
  ctx.font = "bold 24px monospace";
  ctx.textAlign = "left";
  ctx.textBaseline = "top";

  ctx.fillText(`Score: ${num}`,2,2);

  ctx.textAlign = "right";
  ctx.fillText(`Leg: ${leg}`,width-2,2);
  ctx.fillText(`Throw: ${throwNo}`,width-2,30);
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
  if ((currentThrow.scoreBefore == 50 && currentLegScores.length % 3 == 0 && currentThrow.dist < 49) || (currentThrow.scoreBefore <= 40 && currentThrow.scoreBefore % 2 == 0)) {
    currentThrow.isCheckoutAttempt = true;
  }
  
  gameState.throw = currentLegScores.length
  drawGameScore(gameState.scoreRemaining, gameState.leg, gameState.throw);

  if (gameState.scoreRemaining == 0 && isValidCheckout) {
    gameState.isPaused = true;
    session.stats.basic.throwsPerLeg.push(currentLegScores.length);
    session.stats.basic.totalLegs = session.stats.basic.throwsPerLeg.length
    session.stats.checkout.highest = Math.max(session.stats.checkout.highest, throws[throws.length-(throws.length%3||3)-1].scoreAfter);
    setTimeout(() => {
      ctx.fillStyle = "rgb(0,0,0,0.75)"
      ctx.fillRect(0,0,width,height);
      ctx.fillStyle = "#f5f5f5";
      ctx.font = "bold 48px monospace";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("CHECKOUT",center.x,center.y-10);

      ctx.strokeStyle = "#d4a017";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(center.x-60,center.y+10);
      ctx.lineTo(center.x+60,center.y+10);
      ctx.stroke();

      btn.newLeg.removeAttribute("hidden");
      btn.toStats.removeAttribute("hidden");
    }, 1000);
  }
  if (gameState.scoreRemaining < 0 || gameState.scoreRemaining == 1 || (gameState.scoreRemaining == 0 && !isValidCheckout)) {
    gameState.isPaused = true;
    setTimeout(() => {
      ctx.fillStyle = "rgb(0,0,0,0.85)"
      ctx.fillRect(0,0,width,height);
      ctx.fillStyle = "#ddd";
      ctx.font = "bold 40px monospace";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("BUST",center.x,center.y-10);

      ctx.strokeStyle = "#888"
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(center.x-20,center.y+8);
      ctx.lineTo(center.x+20,center.y+8);
      ctx.stroke();
    }, 1000)
    setTimeout(() => {
      gameState.scoreRemaining = throws[throws.length-(throws.length%3||3)-1].scoreAfter
      for (let i=0; i<(throws.length%3||3); i++) {
        throws[throws.length - 1 - i].score = 0;
        throws[throws.length - 1 - i].type = "bust"
      }
      while (throws.length % 3 != 0) {
        throws.push({x:null, y:null, dx:null, dy:null, score:null, segment:"-", type:"notThrown", throwNo:null, visit:null, leg:null, scoreBefore:null, scoreAfter:null, isCheckoutAttempt: null});
      }
      update(session);
      gameState.isPaused = false;
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
  session.stats.checkout.percentage = session.stats.checkout.attempts ? ((session.stats.checkout.success / session.stats.checkout.attempts) * 100).toFixed(2) : 0;

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
    if (checkoutThrows.length == 0) return;
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
    if (t.scoreAfter == 0 && t.multiplier == 2) session.stats.checkout.segments[t.segment].success++;
  })

  Object.values(session.stats.checkout.segments).forEach(s => s.percentage = s.attempts ? ((s.success / s.attempts) * 100).toFixed(0) : 0)
}

function updateTrackerUI(session) {
  const totalThrows = session.stats.basic.totalThrows
  const average = session.stats.basic.average
  
  ctx.fillStyle = "#111";
  ctx.font = "bold 20px monospace";
  ctx.textBaseline = "bottom";
  ctx.textAlign = "right";
  ctx.fillText(`Average: ${average}`,width-2,height-2);
  if (!gameState.isGame) {ctx.textAlign = "left"; ctx.fillText(`Throws: ${totalThrows}`,2,height-1);}
}

export function showSessionStats(session) {
  let statBox = document.querySelectorAll("#view-scoring .stat-box")
  statBox[0].innerText = session.stats.basic.totalThrows
  statBox[1].innerText = session.raw.visits.length
  statBox[2].innerText = session.stats.basic.average
  statBox[3].innerText = session.stats.scoring.scoringAverage

  const topScores = document.querySelectorAll(".treble-count");
  let trebleCount = Object.entries(session.stats.scoring.throws).sort((a, b) => b[1] - a[1]);

  topScores[0].innerText = session.stats.scoring.visits.v180
  topScores.forEach((box, i) => {
    if (i == 0) return;
    if (i < trebleCount.length) box.innerText = `${trebleCount[i-1][0]}: ${trebleCount[i-1][1]}`;
    else box.innerText = "";
  });

  trebleCount = Object.entries(session.stats.scoring.throws).sort((a, b) => a[1] - b[1]);
  topScores.forEach((box, i) => {
    if (i < 4) return;
    if (i < trebleCount.length) box.innerText = `${trebleCount[i-4][0]}: ${trebleCount[i-4][1]}`;
    else box.innerText = "";
  });

  const topDoublesTable = document.getElementById("top-doubles-table")
  topDoublesTable.innerHTML = ""
  const worstDoublesTable = document.getElementById("worst-doubles-table")
  worstDoublesTable.innerHTML = ""
  statBox = document.querySelectorAll("#view-doubling .stat-box")
  statBox[0].innerText = session.stats.checkout.attempts
  statBox[1].innerText = session.stats.checkout.success
  statBox[2].innerText = session.stats.checkout.percentage + "%"
  statBox[3].innerText = session.stats.checkout.when.throw1.success + "/" + session.stats.checkout.when.throw1.attempts + " | " + (100*session.stats.checkout.when.throw1.success/session.stats.checkout.when.throw1.attempts).toFixed(0) + "%"
  statBox[4].innerText = session.stats.checkout.when.visit1.success + "/" + session.stats.checkout.when.visit1.attempts + " | " + (100*session.stats.checkout.when.visit1.success/session.stats.checkout.when.visit1.attempts).toFixed(0) + "%"
  statBox[5].innerText = session.stats.checkout.when.visit2.success + "/" + session.stats.checkout.when.visit2.attempts + " | " + (session.stats.checkout.when.visit2.attempts ? (100*session.stats.checkout.when.visit2.success/session.stats.checkout.when.visit2.attempts).toFixed(0) : 0) + "%"

  const topDoubles = document.querySelectorAll(".double-count");
  let doubleCount = Object.entries(session.stats.checkout.segments).sort((a, b) => b[1].percentage - a[1].percentage || b[1].attempts - a[1].attempts);

  topDoubles.forEach((box, i) => {
    if (i < doubleCount.length) box.innerText =  `${doubleCount[i][0]}: ${doubleCount[i][1].percentage}% (${doubleCount[i][1].success}/${doubleCount[i][1].attempts})`;
    else box.innerText = ""
  })
  topDoublesTable.innerHTML = 
  `
  <div class="stats-names">
  <div class="stat" style="background-color: #007a3d;">BEST</div>
  <div class="stat" style="background-color: #196b3a;">${doubleCount[0][0]}</div>
  <div class="stat" style="background-color: #335c36;">${doubleCount[1][0]}</div>
  <div class="stat" style="background-color: #4c4d33;">${doubleCount[2][0]}</div>
  </div>
  <div class="stats-numbers">
  <div class="stat-box" style="background-color: #007a3daa; color: #ccc; font-size: small; border: 1px solid #007a3daa;">Attempts</div>
  <div class="stat-box">${doubleCount[0][1].attempts}</div>
  <div class="stat-box">${doubleCount[1][1].attempts}</div>
  <div class="stat-box">${doubleCount[2][1].attempts}</div>
  </div>
  <div class="stats-numbers">
  <div class="stat-box" style="background-color: #007a3daa; color: #ccc; font-size: small; border: 1px solid #007a3daa;">Hits</div>
  <div class="stat-box">${doubleCount[0][1].success}</div>
  <div class="stat-box">${doubleCount[1][1].success}</div>
  <div class="stat-box">${doubleCount[2][1].success}</div>
  </div>
  <div class="stats-numbers">
  <div class="stat-box" style="background-color: #007a3daa; color: #ccc; font-size: small; border: 1px solid #007a3daa;">%</div>
  <div class="stat-box">${doubleCount[0][1].percentage}%</div>
  <div class="stat-box">${doubleCount[1][1].percentage}%</div>
  <div class="stat-box">${doubleCount[2][1].percentage}%</div>
  </div>
  `

  doubleCount = Object.entries(session.stats.checkout.segments).sort((a, b) => a[1].percentage - b[1].percentage || a[1].attempts - b[1].attempts);
  topDoubles.forEach((box, i) => {
    if (i<3) return;
    if (i < doubleCount.length) box.innerText =  `${doubleCount[i-3][0]}: ${doubleCount[i-3][1].percentage}% (${doubleCount[i-3][1].success}/${doubleCount[i-3][1].attempts})`;
    else box.innerText = ""
  })

  worstDoublesTable.innerHTML = 
  `
  <div class="stats-names">
  <div class="stat" style="background-color: #b11226;">WORST</div>
  <div class="stat" style="background-color: #982129;">${doubleCount[0][0]}</div>
  <div class="stat" style="background-color: #7e302d;">${doubleCount[1][0]}</div>
  <div class="stat" style="background-color: #653f30;">${doubleCount[2][0]}</div>
  </div>
  <div class="stats-numbers">
  <div class="stat-box" style="background-color: #b11226aa; color: #ccc; font-size: small; border: 1px solid #b11226aa;">Attempts</div>
  <div class="stat-box">${doubleCount[0][1].attempts}</div>
  <div class="stat-box">${doubleCount[1][1].attempts}</div>
  <div class="stat-box">${doubleCount[2][1].attempts}</div>
  </div>
  <div class="stats-numbers">
  <div class="stat-box" style="background-color: #b11226aa; color: #ccc; font-size: small; border: 1px solid #b11226aa;">Hits</div>
  <div class="stat-box">${doubleCount[0][1].success}</div>
  <div class="stat-box">${doubleCount[1][1].success}</div>
  <div class="stat-box">${doubleCount[2][1].success}</div>
  </div>
  <div class="stats-numbers">
  <div class="stat-box" style="background-color: #b11226aa; color: #ccc; font-size: small; border: 1px solid #b11226aa;">%</div>
  <div class="stat-box">${doubleCount[0][1].percentage}%</div>
  <div class="stat-box">${doubleCount[1][1].percentage}%</div>
  <div class="stat-box">${doubleCount[2][1].percentage}%</div>
  </div>
  `
}

export function showAllTimeStats(longTermStats) {
  let statBox = document.querySelectorAll("#view-scoring .stat-box")
  statBox[0].innerText = longTermStats.basic.totalThrows
  statBox[1].innerText = longTermStats.basic.totalVisits
  statBox[2].innerText = longTermStats.basic.average
  statBox[3].innerText = longTermStats.scoring.scoringAverage

  const topScores = document.querySelectorAll(".treble-count");
  let trebleCount = Object.entries(longTermStats.scoring.throws).sort((a, b) => b[1] - a[1]);

  topScores[0].innerText = longTermStats.scoring.visits.v180
  topScores.forEach((box, i) => {
    if (i == 0) return;
    if (i < trebleCount.length) box.innerText = `${trebleCount[i-1][0]}: ${trebleCount[i-1][1]}`;
    else box.innerText = "";
  });

  trebleCount = Object.entries(longTermStats.scoring.throws).sort((a, b) => a[1] - b[1]);
  topScores.forEach((box, i) => {
    if (i < 4) return;
    if (i < trebleCount.length) box.innerText = `${trebleCount[i-4][0]}: ${trebleCount[i-4][1]}`;
    else box.innerText = "";
  });

  const topDoublesTable = document.getElementById("top-doubles-table")
  topDoublesTable.innerHTML = ""
  const worstDoublesTable = document.getElementById("worst-doubles-table")
  worstDoublesTable.innerHTML = ""
  statBox = document.querySelectorAll("#view-doubling .stat-box")
  statBox[0].innerText = longTermStats.checkout.attempts
  statBox[1].innerText = longTermStats.checkout.success
  statBox[2].innerText = longTermStats.checkout.percentage + "%"
  statBox[3].innerText = longTermStats.checkout.when.throw1.success + "/" + longTermStats.checkout.when.throw1.attempts + " | " + (100*longTermStats.checkout.when.throw1.success/longTermStats.checkout.when.throw1.attempts).toFixed(0) + "%"
  statBox[4].innerText = longTermStats.checkout.when.visit1.success + "/" + longTermStats.checkout.when.visit1.attempts + " | " + (100*longTermStats.checkout.when.visit1.success/longTermStats.checkout.when.visit1.attempts).toFixed(0) + "%"
  statBox[5].innerText = longTermStats.checkout.when.visit2.success + "/" + longTermStats.checkout.when.visit2.attempts + " | " + (longTermStats.checkout.when.visit2.attempts ? (100*longTermStats.checkout.when.visit2.success/longTermStats.checkout.when.visit2.attempts).toFixed(0) : 0) + "%"


  const topDoubles = document.querySelectorAll(".double-count");
  let doubleCount = Object.entries(longTermStats.checkout.segments).sort((a, b) => b[1].percentage - a[1].percentage || b[1].attempts - a[1].attempts);

  topDoubles.forEach((box, i) => {
    if (i < doubleCount.length) box.innerText =  `${doubleCount[i][0]}: ${doubleCount[i][1].percentage}% (${doubleCount[i][1].success}/${doubleCount[i][1].attempts})`;
    else box.innerText = ""
  })
  topDoublesTable.innerHTML = 
  `
  <div class="stats-names">
  <div class="stat" style="background-color: #007a3d;">BEST</div>
  <div class="stat" style="background-color: #196b3a;">${doubleCount[0][0]}</div>
  <div class="stat" style="background-color: #335c36;">${doubleCount[1][0]}</div>
  <div class="stat" style="background-color: #4c4d33;">${doubleCount[2][0]}</div>
  </div>
  <div class="stats-numbers">
  <div class="stat-box" style="background-color: #007a3daa; color: #ccc; font-size: small; border: 1px solid #007a3daa;">Attempts</div>
  <div class="stat-box">${doubleCount[0][1].attempts}</div>
  <div class="stat-box">${doubleCount[1][1].attempts}</div>
  <div class="stat-box">${doubleCount[2][1].attempts}</div>
  </div>
  <div class="stats-numbers">
  <div class="stat-box" style="background-color: #007a3daa; color: #ccc; font-size: small; border: 1px solid #007a3daa;">Hits</div>
  <div class="stat-box">${doubleCount[0][1].success}</div>
  <div class="stat-box">${doubleCount[1][1].success}</div>
  <div class="stat-box">${doubleCount[2][1].success}</div>
  </div>
  <div class="stats-numbers">
  <div class="stat-box" style="background-color: #007a3daa; color: #ccc; font-size: small; border: 1px solid #007a3daa;">%</div>
  <div class="stat-box">${doubleCount[0][1].percentage}%</div>
  <div class="stat-box">${doubleCount[1][1].percentage}%</div>
  <div class="stat-box">${doubleCount[2][1].percentage}%</div>
  </div>
  `

  doubleCount = Object.entries(longTermStats.checkout.segments).sort((a, b) => a[1].percentage - b[1].percentage || b[1].attempts - a[1].attempts);
  topDoubles.forEach((box, i) => {
    if (i<3) return;
    if (i < doubleCount.length) box.innerText =  `${doubleCount[i-3][0]}: ${doubleCount[i-3][1].percentage}% (${doubleCount[i-3][1].success}/${doubleCount[i-3][1].attempts})`;
    else box.innerText = ""
  })
  worstDoublesTable.innerHTML = 
  `
  <div class="stats-names">
  <div class="stat" style="background-color: #b11226;">WORST</div>
  <div class="stat" style="background-color: #982129;">${doubleCount[0][0]}</div>
  <div class="stat" style="background-color: #7e302d;">${doubleCount[1][0]}</div>
  <div class="stat" style="background-color: #653f30;">${doubleCount[2][0]}</div>
  </div>
  <div class="stats-numbers">
  <div class="stat-box" style="background-color: #b11226aa; color: #ccc; font-size: small; border: 1px solid #b11226aa;">Attempts</div>
  <div class="stat-box">${doubleCount[0][1].attempts}</div>
  <div class="stat-box">${doubleCount[1][1].attempts}</div>
  <div class="stat-box">${doubleCount[2][1].attempts}</div>
  </div>
  <div class="stats-numbers">
  <div class="stat-box" style="background-color: #b11226aa; color: #ccc; font-size: small; border: 1px solid #b11226aa;">Hits</div>
  <div class="stat-box">${doubleCount[0][1].success}</div>
  <div class="stat-box">${doubleCount[1][1].success}</div>
  <div class="stat-box">${doubleCount[2][1].success}</div>
  </div>
  <div class="stats-numbers">
  <div class="stat-box" style="background-color: #b11226aa; color: #ccc; font-size: small; border: 1px solid #b11226aa;">%</div>
  <div class="stat-box">${doubleCount[0][1].percentage}%</div>
  <div class="stat-box">${doubleCount[1][1].percentage}%</div>
  <div class="stat-box">${doubleCount[2][1].percentage}%</div>
  </div>
  `
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
    minutes: Math.floor((maxDuration % 3600000) / 60000)
  };
  const totalDurationString = {
    hours: Math.floor(totalDuration / 3600000),
    minutes: Math.floor((totalDuration % 3600000) / 60000)
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

  summaryCard[0].innerHTML = `${player.name}'s All Time Stats<hr style="width:25%; margin-left:50; height:1px; border-width:0; background-color:#7c1f25">`

  summaryCard[1].innerHTML = 
  `
  <span class="card-stat">Days Played:</span> ${dates.length} ${dates.length==1?"day":"days"}
  <br><span class="card-stat">Play Time:</span> ${formatter.format(totalDurationString)}
  `

  summaryCard[3].innerHTML = 
  `
  ALL TIMES
  <hr style="width:50%; height:1px; border-width:0; background-color:#245e52">
  <span class="card-stat">Darts Thrown:</span> ${longTermStats.basic.totalThrows}
  <br><span class="card-stat">Legs Played:</span> ${longTermStats.basic.totalLegs}
  <br><span class="card-stat">Average:</span> ${longTermStats.basic.average}
  <br><span class="card-stat">Checkout %:</span> ${longTermStats.checkout.percentage}%
  <br><span class="card-stat">100+ Checkouts:</span> ${longTermStats.checkout.tonPlus}
  <br><span class="card-stat">${longTermStats.scoring.visits.highest==180?"Total 180s:":"Highest Visit:"}</span> ${longTermStats.scoring.visits.highest==180?longTermStats.scoring.visits.v180:longTermStats.scoring.visits.highest}
  <br><span class="card-stat">${hit170?"Total 170 Checkouts:":"Highest Checkout:"}</span> ${hit170?allSessions.reduce((sum,s) => sum + s.stats.checkout.all.reduce((total,c) => {if (c==170) total++}, 0), 0):longTermStats.checkout.highest}
  `

  summaryCard[2].innerHTML = 
  `
  🔥 <span class="card-stat">Current Streak: </span>${currentStreak} ${currentStreak==1?"day":"days"}
  <br>🏆 <span class="card-stat">Longest Streak:</span>${longest} ${longest==1?"day":"days"}
  `

  summaryCard[4].innerHTML = 
  `
  BESTS
  <hr style="width:50%; height:1px; border-width:0; background-color:#245e52">
  <span class="card-stat">Average:</span> ${longTermStats.milestone.bestAverage}
  <br><span class="card-stat">Checkout %: </span>${longTermStats.milestone.bestPercentage}%
  <br><span class="card-stat">Double:</span> ${doubleCount[0][0]} <span class="card-meta">(${doubleCount[0][1].percentage}%)</span>
  <br><span class="card-stat">Treble:</span> ${trebleCount[0][0]} <span class="card-meta">(x${trebleCount[0][1]})</span> 
  <br><span class="card-stat">Best Leg:</span> ${longTermStats.milestone.shortestLeg} darts
  `
}

export function showSessionSummary(player, session, allSessions) {
  const s = session.stats
  const sessionCard = document.querySelectorAll(".session-card")
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
  const targetT20 = t => t.type == "normal" && [20, 5, 1, 12, 18, 9, 4].includes((t.score/t.multiplier)) && t.scoreBefore > 160
  const allT20Throws = session.raw.throws.filter(targetT20)
  const dxT20 = allT20Throws.reduce((sum,t) => sum+t.dx,0)/allT20Throws.length
  const dyT20 = 103 + allT20Throws.reduce((sum,t) => sum+t.dy,0)/allT20Throws.length
  const dxT20Adjusted = dxT20>0 ? allT20Throws.filter(t=>t.dx>0).reduce((sum,t) => sum+Math.abs(t.dx),0)/allT20Throws.filter(t=>t.dx>0).length : allT20Throws.filter(t=>t.dx<0).reduce((sum,t) => sum+Math.abs(t.dx),0)/allT20Throws.filter(t=>t.dx<0).length
  const dyT20Adjusted = dyT20>0 ? 103-(allT20Throws.filter(t=>t.dy>-103).reduce((sum,t) => sum+Math.abs(t.dy),0)/allT20Throws.filter(t=>t.dy>-103).length) : (allT20Throws.filter(t=>t.dy<-103).reduce((sum,t) => sum+Math.abs(t.dy),0)/allT20Throws.filter(t=>t.dy<-103).length)-103
  const groupingDistance = allT20Throws.reduce((sum,t) => sum + allT20Throws.reduce((visitSum, ot) => visitSum + Math.sqrt((t.dx - ot.dx)**2 + (t.dy - ot.dy)**2), 0), 0) / (allT20Throws.length * allT20Throws.length)

  const visits = {};
  allT20Throws.forEach(t => {if (!visits[t.visitNo]) visits[t.visitNo] = []; visits[t.visitNo].push(t);});
  function visitGroupingScore(throws) {
    if (throws.length === 0) return 0;
    const cx = throws.reduce((sum, t) => sum + t.dx, 0) / throws.length;
    const cy = throws.reduce((sum, t) => sum + t.dy, 0) / throws.length;
    const avgDistance = throws.reduce((sum, t) => sum + Math.hypot(t.dx - cx, t.dy - cy), 0) / throws.length;
    return avgDistance;
  }
  const visitDistances = Object.values(visits).map(visitGroupingScore);
  const averageGroupingDistance = visitDistances.reduce((sum, d) => sum + d, 0) / visitDistances.length;
  const groupingScore = Math.max(0, Math.min(10, 10 * (1 - Math.pow((Math.max(0, 0.25 * groupingDistance + 0.75 * averageGroupingDistance - 10)) / 100, 0.75))));

  sessionCard[0].innerHTML = 
  `<div class="card-meta">
  Session: ${sessionCount}
  <br>Duration: ${formatter.format(duration)}
  `

  sessionCard[1].innerHTML = 
  `<div class="card-meta">
  Date: ${d.toLocaleDateString()}
  <br>Time: ${time}
  `

  sessionCard[2].innerHTML = 
  `
  SUMMARY
  <hr style="width:50%; height:1px; border-width:0; background-color:#245e52">
  <span class="card-stat">Legs Played:</span> ${legs}
  <br><span class="card-stat">Throws:</span> ${s.basic.totalThrows}
  <br><span class="card-stat">Visits:</span> ${s.basic.totalVisits}
  <br><span class="card-stat">Average:</span> ${s.basic.average}
  <br><span class="card-stat">171+ visits:</span> ${s.scoring.visits.v171}
  <br><span class="card-stat">Checkout %:</span> ${s.checkout.percentage}%
  <br><span class="card-stat">Highest Checkout:</span> ${s.checkout.highest}
  `

  sessionCard[3].innerHTML = 
  `
  PRECISION
  <hr style="width:50%; height:1px; border-width:0; background-color:#245e52">
  <span class="card-stat">Overall:</span> ${groupingDistance.toFixed(0)}mm 
  <br><span class="card-stat">Visit:</span> ${averageGroupingDistance.toFixed(0)}mm
  <br><span class="card-stat">Score:</span> ${groupingScore.toFixed(1)}/10<br><span class="card-stat">${"▰".repeat(Math.round(groupingScore)) + "▱".repeat(10-Math.round(groupingScore))}</span>
  <br><br>CONSISTENCY
  <hr style="width:50%; height:1px; border-width:0; background-color:#245e52">
  <span class="card-stat">Best Leg:</span> ${Math.min(...session.stats.basic.throwsPerLeg)} darts
  ${session.stats.basic.totalLegs>1?`<br><span class="card-stat">Worst Leg:</span> ${Math.max(...session.stats.basic.throwsPerLeg)} darts`:""}
  `

  sessionCard[4].innerHTML = 
  `
  <span class="card-stat">T20 Miss Pattern Tip: ${Math.ceil(dxT20Adjusted)}mm too ${dxT20>0?"right":"left"} / ${Math.ceil(dyT20Adjusted)}mm too ${dyT20>0?"low":"high"}</span>
  `

}

function drawDartMarker(x,y,current=false,size = current ? 4 : 3, col = "#d4a017") {
  ctx.strokeStyle = col;
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
    drawDartMarker(center.x+t.dx, center.y+t.dy, i == arr.length - 1));

  currentVisit
  .forEach((t,i) => 
  scoreBox[i].innerText = t.segment);

  scoreBox[currentThrowOfVisit - 1].toggleAttribute("data-current");
}

export function redrawCanvas(gameState, session) {
  drawDartboard()
  drawGameScore(gameState.scoreRemaining, gameState.leg, gameState.throw)
  updateTrackerUI(session)
  lastThreeThrows(session)
}

export function init(session) {
  drawDartboard();
  updateSessionStats(session);
  updateTrackerUI(session);
  if (gameState.isGame) {drawGameScore(), gameState.leg = 1, gameState.throw = 0};
}

export function update(session) {
  drawDartboard();
  if (gameState.isGame) updateGameScore(session);
  lastThreeThrows(session);
  updateSessionStats(session);
  updateTrackerUI(session);
}