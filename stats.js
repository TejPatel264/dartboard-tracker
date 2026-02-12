
export function calculateLongTermStats(sessions) {
    const longTermStats = {
        totalThrows: 0,
        totalVisits: 0,
        average: 0,
        total180s: 0,
        total171: 0,
        total131: 0,
        total91: 0,
        totalT20s: 0,
        totalBigTrebles: 0,
        totalBulls: 0,
        totalD20s: 0,
        totalD16s: 0
    };

    sessions.forEach(s => {
        longTermStats.totalThrows += s.stats.basic.totalThrows;
        longTermStats.totalVisits += s.stats.basic.totalVisits;
        longTermStats.total180s += s.stats.scoring.visits.v180;
        longTermStats.total171 += s.stats.scoring.visits.v171;
        longTermStats.total131 += s.stats.scoring.visits.v131;
        longTermStats.total91 += s.stats.scoring.visits.v91;
        longTermStats.totalT20s += s.stats.scoring.throws.T20;
        longTermStats.totalBigTrebles += (s.stats.scoring.throws.T19 + s.stats.scoring.throws.T18 + s.stats.scoring.throws.T17)
        longTermStats.totalBulls += s.stats.scoring.throws.BULL;
        longTermStats.totalD20s += s.stats.scoring.throws.D20;
        longTermStats.totalD16s += s.stats.scoring.throws.D16;
    })

    longTermStats.average = longTermStats.totalThrows ? (sessions.reduce((sum,s) => sum + s.stats.basic.average * s.stats.basic.totalThrows, 0)/(longTermStats.totalThrows)).toFixed(2) : 0

    return longTermStats;
}