export function chartStyles() {
    Chart.defaults.font.family = 'monospace';
}

export function createBarChart(canvas,x,y) {
    let ctx = canvas.getContext("2d")
    return new Chart (ctx, {
        type: "bar",
        data: {
            labels: x,
            datasets: [{
                label: "count",
                backgroundColor: "#2f7f6f",
                data: y
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    displayColors: false,
                    borderWidth: 1,
                    backgroundColor: "#333",
                    borderColor: "#111",
                    titleColor: "#ddd",
                    bodyColor: "#ddd",
                    titleAlign: "center",
                    bodyAlign: "center",
                    cornerRadius: 6,
                    padding: 10,
                    animation: {
                        duration: 250,
                        easing: "easeOutCubic"
                    }
                }
            },
            scales: {
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        autoskip: false,
                        font: {
                            size: x.length > 10 ? 10 : 12
                        }
                    }
                },
                y: {
                    position: "left",
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1,
                        precision: 0,
                        maxTicksLimit: 6,
                        callback: value => Math.round(value),
                        font: {
                            size: 12
                        }
                    },
                    grid: {
                        display: false
                    }
                },
                yRight: {
                    position: "right",
                    ticks: {
                        stepSize: 1,
                        maxTicksLimit: 6,
                        font: {
                            size: 12
                        }
                    },
                    grid: {
                        drawOnChartArea: false,
                        display: false
                    }
                }
            }
        }
    })
}

export function createLineChart(canvas,x,y) {
    let ctx = canvas.getContext("2d")
    return new Chart (ctx, {
        type: "line",
        data: {
            labels: x,
            datasets: [{
                label: "score",
                backgroundColor: "#2f7f6f",
                data: y
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    displayColors: false,
                    borderWidth: 1,
                    backgroundColor: "#333",
                    borderColor: "#111",
                    titleColor: "#ddd",
                    bodyColor: "#ddd",
                    titleAlign: "center",
                    bodyAlign: "center",
                    cornerRadius: 6,
                    padding: 10,
                    animation: {
                        duration: 250,
                        easing: "easeOutCubic"
                    }
                }
            },
            scales: {
                x: {
                    grid: {
                        display: false
                    }
                },
                y: {
                    position: "left",
                    beginAtZero: true,
                    ticks: {
                        stepSize: 5,
                        precision: 0,
                        callback: value => Math.round(value)
                    },
                    grid: {
                        display: false
                    }
                },
                yRight: {
                    position: "right",
                    ticks: {
                        stepSize: 5
                    },
                    grid: {
                        drawOnChartArea: false
                    }
                }
            }
        }
    })
}

export function updateBarChart(chart, x, y, total) {
    if (!chart) return;

    chart.data.labels = x
    chart.data.datasets[0].data = y
    chart.options.scales.y.suggestedMax = Math.max(...y,1)
    chart.options.scales.yRight.suggestedMax = Math.max(...y,1)
    chart.options.plugins.tooltip.callbacks.label = function (context) {return [`${context.raw} times`,`(${(100*context.raw/total).toFixed(2)}%)`]};
    chart.update();
}

export function updateLineChart(chart, x, y) {
    if (!chart) return;

    chart.data.labels = x
    chart.data.datasets[0].data = y
    chart.options.scales.y.suggestedMax = Math.max(...y,1)
    chart.options.scales.yRight.suggestedMax = Math.max(...y,1)

    chart.update();
}


function drawBlankDartboard(canvas) {
    const width = canvas.width
    const height = canvas.height
    const ctx = canvas.getContext("2d")
    const center = {x: width/2, y: height/2}
    
    ctx.clearRect(0, 0, width, height);

    function drawCircle(r,fill="rgb(0,0,0,0)") {
    ctx.fillStyle = fill;
    ctx.beginPath();
    ctx.arc(center.x, center.y, r, 0, Math.PI*2);
    ctx.fill();
    ctx.strokeStyle = "#11111199";
    ctx.lineWidth = 1;
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
    const sectorScores = [20,1,18,4,13,6,10,15,2,17,3,19,7,16,8,11,14,9,12,5];
    ctx.fillStyle = "#fff";
    ctx.font = "bold 24px monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    ctx.fillText(sectorScores[i],x,y);
    }

    drawCircle(225.5,"#55555555")
    drawCircle(170,"#eee")
    drawCircle(162)
    drawCircle(107)
    drawCircle(99)
    drawCircle(16,"#007a3d22")
    drawCircle(6.35,"#b1122622")
    for (let i=0; i<20; i++) {
        let angle = (i+1/2) * (Math.PI/10);
        const startx = center.x + Math.sin(angle) * 16;
        const starty = center.y - Math.cos(angle) * 16;
        const endx = center.x + Math.sin(angle) * 180;
        const endy = center.y - Math.cos(angle) * 180;
        drawLine(startx,starty,endx,endy);

        let colour = i % 2 == 0 ? "#b1122622" : "#007a3d22"
        drawRingSector(162, 170, angle, angle+Math.PI/10, colour);
        drawRingSector(99, 107, angle, angle+Math.PI/10, colour);

        colour = i % 2 == 0 ? "#1a1a1a33" : "#f2e6c933"
        drawRingSector(107, 162, angle, angle+Math.PI/10, colour);
        drawRingSector(16, 99, angle, angle+Math.PI/10, colour);

        angle = i * (Math.PI/10);
        const x = center.x + Math.sin(angle) * 200;
        const y = center.y - Math.cos(angle) * 200;
        drawNumbers(i,x,y);

    }
}

function drawAllDarts(canvas,sessions) {
    return new Promise(resolve => {
        let throws = []
        for (let session of sessions) throws.push(session.raw.throws);
        throws = [].concat(...throws).filter(t => t.x != null)

        const ctx = canvas.getContext("2d")
        const center = {x:canvas.width/2, y:canvas.height/2}
        ctx.clearRect(0,0,canvas.width,canvas.height)
        let size = 2
        ctx.lineWidth = 1;
        let i = 0;
        let dartsPerFrame = Math.ceil(throws.length / 150)

        function animate() {
            for (let k=0; k<dartsPerFrame && i < throws.length; k++) {
                if (i>=throws.length) {resolve(); return;}
                const t = throws[i]
                if (t.multiplier == 3 && t.score > 45) {ctx.strokeStyle = "#d4a017"; size = 2.5;}
                else if (t.multiplier == 2 && t.isCheckoutAttempt && t.scoreAfter == 0) {ctx.strokeStyle = "#007a3d"; size = 3;}
                else if (t.multiplier == 0 || t.isCheckoutAttempt) {ctx.strokeStyle = "#b11226"; size = 1;}
                else {ctx.strokeStyle = "#222"; size = 1.5;}
                ctx.beginPath();
                ctx.moveTo(center.x+t.dx-size,center.y+t.dy-size);
                ctx.lineTo(center.x+t.dx+size,center.y+t.dy+size);
                ctx.moveTo(center.x+t.dx+size,center.y+t.dy-size);
                ctx.lineTo(center.x+t.dx-size,center.y+t.dy+size);
                ctx.stroke();
                i++;
            }
            
            if (i < throws.length) requestAnimationFrame(animate);
            else resolve();
        }
        animate()
    });
}

function drawHeatmap(canvas, sessions) {
    const ctx = canvas.getContext("2d")
    const width = canvas.width
    const height = canvas.height
    const center = {x:width/2, y:height/2}

    ctx.clearRect(0,0,width,height)

    let throws = []
    for (let session of sessions) throws.push(session.raw.throws);
    throws = [].concat(...throws)

    for (let t of throws.filter(t => t.x != null)) {
        const alpha = Math.min(0.4, 3*16/throws.length);
        const g = ctx.createRadialGradient(center.x+t.dx, center.y+t.dy, 0, center.x+t.dx, center.y+t.dy, 8);
        g.addColorStop(0, `rgba(255, 255, 255, ${alpha})`);
        g.addColorStop(0.4, `rgba(255,255,255,${alpha*0.6})`);
        g.addColorStop(1, "rgba(255, 255, 255, 0)");
        ctx.fillStyle = g;
        ctx.fillRect(center.x+t.dx-8,center.y+t.dy-8,16,16)
    }

    const img = ctx.getImageData(0, 0, width, height);
    const data = img.data;

    function colourGradient(a) {
        a = Math.pow(a,0.6)

        if (a < 0.25) return [20,40,70];
        else if (a < 0.60) return [46,204,113];
        else if (a < 0.80) return [241,196,15];
        else if (a < 0.975) return [231,76,60];
        else return [255,255,255]
    }

    for (let i=0; i < data.length; i+=4) {
        const alpha = data[i+3]/255;
        const [r,g,b] = colourGradient(alpha)

        data[i] = r
        data[i+1] = g
        data[i+2] = b
        data[i+3] = Math.pow(alpha,0.6)*255
    }

    ctx.putImageData(img,0,0)
}

const page = document.getElementById("pages");

export function createHeatmap(dartboardCanvas, dartMarkerCanvas, heatmapCanvas, sessions, heatmap=true) {
    dartMarkerCanvas.style.opacity = 1;
    heatmapCanvas.style.opacity = 0;
    dartboardCanvas.getContext("2d").clearRect(0,0,dartboardCanvas.width,dartboardCanvas.height)
    dartMarkerCanvas.getContext("2d").clearRect(0,0,dartMarkerCanvas.width,dartMarkerCanvas.height)
    heatmapCanvas.getContext("2d", {willReadFrequently: true}).clearRect(0,0,heatmapCanvas.width,heatmapCanvas.height)
    drawBlankDartboard(dartboardCanvas);
    setTimeout(() => drawAllDarts(dartMarkerCanvas, sessions), 1500);
    if (heatmap)  {
        page.addEventListener("transitionend", () => {
            drawHeatmap(heatmapCanvas,sessions);
            setTimeout(() => dartMarkerCanvas.style.opacity = 0, 3500)
            setTimeout(() => heatmapCanvas.style.opacity = 1, 4000)
        }, {once: true});
    }
}