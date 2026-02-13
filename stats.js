
export function calculateLongTermStats(sessions) {
    const longTermStats = {
        basic: {
            totalThrows: 0,
            totalVisits: 0,
            average: 0
        },
        scoring: {
            visits: {
            v180: 0,
            v171: 0,
            v131: 0,
            v91: 0,
            v51: 0
            },
            throws: {
                T20: 0,
                T19: 0,
                T18: 0,
                T17: 0,
                D20: 0,
                D16: 0,
                BULL: 0
            }
        }
    };

    sessions.forEach(s => {
        longTermStats.basic.totalThrows += s.stats.basic.totalThrows;
        longTermStats.basic.totalVisits += s.stats.basic.totalVisits;
        longTermStats.scoring.visits.v180 += s.stats.scoring.visits.v180;
        longTermStats.scoring.visits.v171 += s.stats.scoring.visits.v171;
        longTermStats.scoring.visits.v131 += s.stats.scoring.visits.v131;
        longTermStats.scoring.visits.v91 += s.stats.scoring.visits.v91;
        longTermStats.scoring.visits.v51 += s.stats.scoring.visits.v51;
        longTermStats.scoring.throws.T20 += s.stats.scoring.throws.T20;
        longTermStats.scoring.throws.T19 += s.stats.scoring.throws.T19;
        longTermStats.scoring.throws.T18 += s.stats.scoring.throws.T18;
        longTermStats.scoring.throws.T17 += s.stats.scoring.throws.T17;
        longTermStats.scoring.throws.D20 += s.stats.scoring.throws.D20;
        longTermStats.scoring.throws.D16 += s.stats.scoring.throws.D16;
        longTermStats.scoring.throws.BULL += s.stats.scoring.throws.BULL;
    })

    longTermStats.basic.average = longTermStats.basic.totalThrows ? (sessions.reduce((sum,s) => sum + s.stats.basic.average * s.stats.basic.totalThrows, 0)/(longTermStats.basic.totalThrows)).toFixed(2) : 0

    return longTermStats;
}