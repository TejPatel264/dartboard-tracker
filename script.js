const canvas = document.getElementById("dartboard");
const ctx = canvas.getContext("2d");
const width = canvas.width;
const height = canvas.height;
const center = {x: width/2, y: height/2};
const sectorScores = [20,1,18,4,13,6,10,15,2,17,3,19,7,16,8,11,14,9,12,5];

let throws = [];

function drawCircle(r,w=1,fill="#eee") {
    ctx.fillStyle = fill;
    ctx.beginPath();
    ctx.arc(center.x, center.y, r, 0, Math.PI*2);
    ctx.fill();
    ctx.strokeStyle = "#000";
    ctx.lineWidth = w;
    ctx.stroke();
}

function drawLine(startx,starty,endx,endy) {
  ctx.beginPath();
  ctx.moveTo(startx, starty);
  ctx.lineTo(endx, endy);
  ctx.lineWidth = 1;
  ctx.strokeStyle = "#444";
  ctx.stroke();
}

function drawNumbers(i,x,y) {
  ctx.fillStyle = "#fff";
  ctx.font = "bold 20px monospace";
  ctx.textAlign = "center";
  ctx.textBaseLine = "middle";

  ctx.fillText(sectorScores[i],x,y);
}

function drawDartMarker(x,y,size=4) {
  ctx.strokeStyle = "#f00";
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
  drawCircle(170)
  drawCircle(162)
  drawCircle(107)
  drawCircle(99)
  drawCircle(16, 1,"#0f0")
  drawCircle(6.35,1 ,"#f00")
  for (let i=0; i<20; i++) {
    let angle = (i+1/2) * (Math.PI/10);
    const startx = center.x + Math.sin(angle) * 16;
    const starty = center.y - Math.cos(angle) * 16;
    const endx = center.x + Math.sin(angle) * 200;
    const endy = center.y - Math.cos(angle) * 200;
    drawLine(startx,starty,endx,endy);

    angle = i * (Math.PI/10);
    const x = center.x + Math.sin(angle) * 195;
    const y = center.y - Math.cos(angle) * 195;
    drawNumbers(i,x,y)
  }
}

drawDartboard();

canvas.addEventListener("click", (e) => {
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  const dx = x - center.x;
  const dy = y - center.y;
  const dist = Math.sqrt(dx*dx + dy*dy);

  let score;
  let mult;
  let angle = Math.atan2(dy, dx);

  while (angle < -11*Math.PI/20) angle += 2*Math.PI;
  const sector = Math.floor((angle + 11*Math.PI/20) / (Math.PI/10));
  score = sectorScores[sector];

  if (dist < 6.35) {score = 50; mult = "BULL"}
  else if (dist < 16) score = 25;
  else if (dist > 99 && dist < 107) {score *= 3; mult = "T";}
  else if (dist > 162 && dist < 170) {score *= 2; mult = "D"}
  else if (dist > 170) score = 0;

  score = Math.floor(score);

  throws.push({x, y, score, mult});

  drawDartboard();
  updateStats();
  lastThreeThrows();
});

function updateStats() {
  const total = throws.length;
  const avg = (3*throws.reduce((sum,t)=>sum+t.score,0)/Math.max(1,total)).toFixed(2);

  document.getElementById("total").innerText = total;
  document.getElementById("avg").innerText = avg;
}

document.getElementById("reset").addEventListener("click", () => {
  throws = [];
  drawDartboard();
  updateStats();
  lastThreeThrows();
});

function lastThreeThrows() {
  const scoreBox = document.querySelectorAll(".score-box");
  const total = throws.length;
  const nextThrow = throws[throws.length-1];
  let nextScore = ".";

  if (total == 0) {
    scoreBox.forEach(score => score.innerText = ".");
    return;
  }

  if (!nextThrow.mult) {
    nextScore = nextThrow.score;
  } else if (nextThrow.mult == "BULL") {
    nextScore = "BULL"
  } else if (nextThrow.mult == "D") {
    nextScore = `D${nextThrow.score/2}`
  } else if (nextThrow.mult == "T") {
    nextScore = `T${nextThrow.score/3}`
  }

  if (total % 3 == 1) {
    scoreBox.forEach(score => score.innerText = ".");
    scoreBox[0].innerText = nextScore;
    drawDartMarker(nextThrow.x,nextThrow.y);
  } else if (total % 3 == 2) {
    scoreBox[1].innerText = nextScore;
    throws.slice(-2).forEach(t => drawDartMarker(t.x,t.y));
  } else {
    scoreBox[2].innerText = nextScore;
    throws.slice(-3).forEach(t => drawDartMarker(t.x,t.y));
  }
}

