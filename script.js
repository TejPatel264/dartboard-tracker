const canvas = document.getElementById("dartboard");
const ctx = canvas.getContext("2d");
const width = canvas.width;
const height = canvas.height;
const center = {x: width/2, y: height/2};

const sectorScores = [20,1,18,4,13,6,10,15,2,17,3,19,7,16,8,11,14,9,12,5];
let throws = [];
let validThrows;


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

function drawDartboard() {
  ctx.clearRect(0, 0, width, height);
  drawCircle(225.5,2,"#222")
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

function update(){
  drawDartboard();
  updateStats();
  lastThreeThrows();
}

drawDartboard();
updateStats();

canvas.addEventListener("click", (e) => {
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  const dx = x - center.x;
  const dy = y - center.y;
  const dist = Math.sqrt(dx*dx + dy*dy);

  let score;
  let angle = Math.atan2(dy, dx);
  let scoreBoard;

  while (angle < -11*Math.PI/20) angle += 2*Math.PI;
  const sector = Math.floor((angle + 11*Math.PI/20) / (Math.PI/10));
  score = sectorScores[sector];

  if (dist < 6.35) {score = 50; scoreBoard = "BULL"}
  else if (dist < 16) {score = 25; scoreBoard = 25}
  else if (dist > 99 && dist < 107) {score *= 3; scoreBoard = `T${score/3}`}
  else if (dist > 162 && dist < 170) {score *= 2; scoreBoard = `D${score/2}`}
  else if (dist > 170) {score = 0; scoreBoard = 0}
  else scoreBoard = score

  score = Math.floor(score);

  throws.push({x, y, dx, dy, score, scoreBoard, bounce:false});
  validThrows = throws.filter(t => t.x !== null && t.y !== null);

  update();
});

function updateStats() {
  const total = throws.length;
  //const totalValid = validThrows.length;
  const visitScores = [];
  const visitStats = {s180:0, s171:0, s131:0, s91:0}
  const throwStats = {T20: 0, T19: 0, T18: 0, T17: 0, D20: 0, D16: 0, BULL: 0}

  const avg = (3*throws.reduce((sum,t)=>sum+t.score,0)/Math.max(1,total)).toFixed(2);
  
  function drawStats() {
    ctx.fillStyle = "#111";
    ctx.font = "bold 16px monospace";
    ctx.textAlign = "left";
    ctx.textBaseline = "bottom";

    ctx.fillText(`Throws: ${total}`,1,499);

    ctx.textAlign = "right";
    ctx.fillText(`Average: ${avg}`,499,499);
  }
  
  drawStats()
  
  for (let i=0; i < throws.length; i+=3) {
    const visit = throws.slice(i,i+3);
    const visitScore = visit.reduce((sum, t) => sum + t.score, 0)
    visitScores.push(visitScore)
  }

  visitScores.forEach(v => {
    if (v == 180) visitStats.s180++;
    else if (v >= 171) visitStats.s171++;
    else if (v >= 131) visitStats.s131++;
    else if (v >= 91) visitStats.s91++;
  })

  throws.forEach(t => {
    for (i in throwStats) {
      if (t.scoreBoard == i) {
        throwStats[i]++
      }
    }
})

  const statBox = document.querySelectorAll(".stat-box")
  statBox[0].innerText = visitScores.length
  statBox[1].innerText = visitStats.s180
  statBox[2].innerText = visitStats.s171
  statBox[3].innerText = visitStats.s131
  statBox[4].innerText = visitStats.s91
}

function lastThreeThrows() {
  const scoreBox = document.querySelectorAll(".score-box");
  const total = throws.length;
  const currentScoreBox = document.querySelector("[data-current]");
  const notBounceOut = t => !t.bounce
  const currentThrowOfVisit = total % 3 || 3
  const currentVisit = throws.slice(-currentThrowOfVisit)

  scoreBox.forEach(score => score.innerText = ".");

  if (total == 0 && currentScoreBox) {
    currentScoreBox.toggleAttribute("data-current");
    return;
  }

  currentVisit
  .filter(notBounceOut)
  .forEach((t,i,arr) => 
    drawDartMarker(t.x, t.y, i == arr.length - 1));

  currentVisit
  .forEach((t,i) => 
  scoreBox[i].innerText = t.scoreBoard);

  if (currentScoreBox) currentScoreBox.toggleAttribute("data-current");
  scoreBox[currentThrowOfVisit - 1].toggleAttribute("data-current");
}

document.getElementById("reset").addEventListener("click", () => {
  throws = [];
  update();
});

document.getElementById("delete-last-throw").addEventListener("click", () => {
  throws.pop()
  update()
});

document.getElementById("bounce-out").addEventListener("click", () => {
  throws.push({x:null, y:null, dx:null, dy:null, score:0, scoreBoard:0, bounce:true});
  update()
})

document.getElementById("view-stats").addEventListener("click", () => {
  document.getElementById("pages").style.transform = "translateX(-100vw)"
})

document.getElementById("back-to-tracker").addEventListener("click", () => {
  document.getElementById("pages").style.transform = "translateX(0vw)"
})

