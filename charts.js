export function chartStyles() {
    Chart.defaults.font.family = 'monospace';
}

export function createBarChart(ctx,x,y) {
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
                    }
                },
                y: {
                    position: "left",
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1,
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
                        stepSize: 1
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