
export function calculateLongTermStats(sessions) {
    const longTermStats = {
        basic: {
            totalThrows: 0,
            totalVisits: 0,
            totalLegs: 0,
            average: 0
        },
        scoring: {
            scoringThrows: 0,
            scoringAverage: 0,
            visits: {
                v180: 0,
                v171: 0,
                v133: 0,
                v95: 0,
                v57: 0,
                highest: 0
            },
            throws: {
                T20: 0,
                T19: 0,
                T18: 0,
                T17: 0,
                T16: 0,
                T15: 0,
                T14: 0,
                T13: 0,
                T12: 0,
                T11: 0,
                T10: 0,
                T9: 0,
                T8: 0,
                T7: 0,
                T6: 0,
                T5: 0,
                T4: 0,
                T3: 0,
                T2: 0,
                T1: 0
            }
        },
        checkout: {
            attempts: 0,
            success: 0,
            percentage: 0,
            tonPlus: 0,
            segments: {
                D20:{attempts: 0, success: 0, percentage: 0}, 
                D19:{attempts: 0, success: 0, percentage: 0}, 
                D18:{attempts: 0, success: 0, percentage: 0},
                D17:{attempts: 0, success: 0, percentage: 0}, 
                D16:{attempts: 0, success: 0, percentage: 0}, 
                D15:{attempts: 0, success: 0, percentage: 0}, 
                D14:{attempts: 0, success: 0, percentage: 0}, 
                D13:{attempts: 0, success: 0, percentage: 0}, 
                D12:{attempts: 0, success: 0, percentage: 0}, 
                D11:{attempts: 0, success: 0, percentage: 0}, 
                D10:{attempts: 0, success: 0, percentage: 0}, 
                D9:{attempts: 0, success: 0, percentage: 0}, 
                D8:{attempts: 0, success: 0, percentage: 0}, 
                D7:{attempts: 0, success: 0, percentage: 0},
                D6:{attempts: 0, success: 0, percentage: 0}, 
                D5:{attempts: 0, success: 0, percentage: 0}, 
                D4:{attempts: 0, success: 0, percentage: 0}, 
                D3:{attempts: 0, success: 0, percentage: 0},
                D2:{attempts: 0, success: 0, percentage: 0},
                D1:{attempts: 0, success: 0, percentage: 0}, 
                BULL:{attempts: 0, success: 0, percentage: 0}},
            when: {throw1: {success: 0, attempts: 0}, visit1: {success: 0, attempts: 0}, visit2: {success: 0, attempts: 0}}
        },
        milestone: {
            bestAverage:0,
            bestPercentage: 0,
            shortestLeg: 0
        }
    };

    longTermStats.basic.totalThrows = sessions.reduce((sum,s) => sum + s.stats.basic.totalThrows, 0);
    longTermStats.basic.totalVisits = sessions.reduce((sum,s) => sum + s.stats.basic.totalVisits, 0);
    longTermStats.basic.totalLegs = sessions.reduce((sum,s) => sum + s.stats.basic.totalLegs, 0);
    ["v180", "v171", "v133", "v95", "v57"].forEach(v => longTermStats.scoring.visits[v] = sessions.reduce((sum, s) => sum + s.stats.scoring.visits[v], 0));
    const trebles = ["T20", "T19", "T18", "T17", "T16", "T15", "T14", "T13", "T12", "T11", "T10", "T9", "T8", "T7", "T6", "T5", "T4", "T3", "T2", "T1"];
    trebles.forEach(t => longTermStats.scoring.throws[t] = sessions.reduce((sum, s) => sum + s.stats.scoring.throws[t], 0));
    const doubles = ["D20", "D19", "D18", "D17", "D16", "D15", "D14", "D13", "D12", "D11", "D10", "D9", "D8", "D7", "D6", "D5", "D4", "D3", "D2", "D1", "BULL"];
    doubles.forEach(d => longTermStats.checkout.segments[d].attempts = sessions.reduce((sum, s) => sum + s.stats.checkout.segments[d].attempts, 0));
    doubles.forEach(d => longTermStats.checkout.segments[d].success = sessions.reduce((sum, s) => sum + s.stats.checkout.segments[d].success, 0));
    doubles.forEach(d => longTermStats.checkout.segments[d].percentage = (longTermStats.checkout.segments[d].attempts ? (100*longTermStats.checkout.segments[d].success/longTermStats.checkout.segments[d].attempts).toFixed(0) : 0));

    longTermStats.basic.average = longTermStats.basic.totalThrows ? (sessions.reduce((sum,s) => sum + s.stats.basic.average * s.stats.basic.totalThrows, 0)/longTermStats.basic.totalThrows).toFixed(2) : 0;
    longTermStats.scoring.scoringThrows = sessions.reduce((sum,s) => sum + s.stats.scoring.scoringThrows, 0);
    longTermStats.scoring.scoringAverage = longTermStats.scoring.scoringThrows ? (sessions.reduce((sum,s) => sum + s.stats.scoring.scoringAverage * s.stats.scoring.scoringThrows, 0)/(longTermStats.scoring.scoringThrows)).toFixed(2) : 0;
    longTermStats.scoring.visits.highest = sessions.reduce((best,s) => Math.max(best, Math.max(...s.raw.visits)), 0);
    longTermStats.checkout.attempts = sessions.reduce((sum,s) => sum + s.stats.checkout.attempts, 0);
    longTermStats.checkout.success = sessions.reduce((sum,s) => sum + s.stats.checkout.success, 0);
    longTermStats.checkout.percentage = longTermStats.checkout.attempts ? ((longTermStats.checkout.success/longTermStats.checkout.attempts)*100).toFixed(2) : 0;
    longTermStats.checkout.tonPlus = sessions.reduce((sum,s) => sum + s.stats.checkout.tonPlus, 0);
    longTermStats.milestone.bestAverage = sessions.reduce((best, s) => Math.max(best, s.stats.basic.average), 0);
    longTermStats.milestone.bestPercentage = sessions.reduce((best, s) => Math.max(best, s.stats.checkout.percentage), 0);
    longTermStats.milestone.shortestLeg = sessions.reduce((best, s) => {
        const shortest = s.stats.basic.throwsPerLeg.reduce((min, t) => Math.min(min, t), Infinity);
        return Math.min(best, shortest);
    }, Infinity);
    longTermStats.checkout.highest = sessions.reduce((best, s) => Math.max(best, s.stats.checkout.highest), 0);

    longTermStats.checkout.when.throw1.success = sessions.reduce((sum,s) => sum + s.stats.checkout.when.throw1.success, 0);
    longTermStats.checkout.when.throw1.attempts = sessions.reduce((sum,s) => sum + s.stats.checkout.when.throw1.attempts, 0);
    longTermStats.checkout.when.visit1.success = sessions.reduce((sum,s) => sum + s.stats.checkout.when.visit1.success, 0);
    longTermStats.checkout.when.visit1.attempts = sessions.reduce((sum,s) => sum + s.stats.checkout.when.visit1.attempts, 0);
    longTermStats.checkout.when.visit2.success = sessions.reduce((sum,s) => sum + s.stats.checkout.when.visit2.success, 0);
    longTermStats.checkout.when.visit2.attempts = sessions.reduce((sum,s) => sum + s.stats.checkout.when.visit2.attempts, 0);

    return longTermStats;
}


function createSessionCard(session) {
    const div = document.createElement("div")
    div.className = "session-card"

    const date = new Date(session.meta.date).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric"
    })

    div.innerHTML = `
    <div class="session-date">${date} - ${Math.round(session.meta.duration/60)} mins</div>
    <div class="session-stats">
    Avg: ${Number(session.stats.basic.average).toFixed(1)} | 
    CO: ${session.stats.checkout.percentage}% | 
    HC: ${session.stats.checkout.highest}
    </div>`

    return div
}


export async function loadSessionTimeline(db) {
    const sessions = await db.sessions.orderBy("meta.date").reverse().toArray()
    const container = document.getElementById("view-session-timeline")

    container.innerHTML = "<h2>Your Session Timeline</h2>"
    
    if (!sessions.length) {container.innerHTML = "<h2>No sessions yet</h2>"; return;}

    for (let s of sessions) container.appendChild(createSessionCard(s));
}