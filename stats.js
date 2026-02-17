
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
            v133: 0,
            v95: 0,
            v57: 0
            },
            throws: {
                T20: 0,
                T19: 0,
                T18: 0,
                T17: 0,
                T16: 0,
            }
        },
        checkout: {
            attempts: 0,
            success: 0,
            percentage: 0
        },
        milestone: {
            bestAverage:0,
            bestPercentage: 0,
            shortestLeg: 0
        }
    };

    longTermStats.basic.totalThrows = sessions.reduce((sum,s) => sum + s.stats.basic.totalThrows, 0);
    longTermStats.basic.totalVisits = sessions.reduce((sum,s) => sum + s.stats.basic.totalVisits, 0);
    longTermStats.scoring.visits.v180 = sessions.reduce((sum,s) => sum + s.stats.scoring.visits.v180, 0);
    longTermStats.scoring.visits.v171 = sessions.reduce((sum,s) => sum + s.stats.scoring.visits.v171, 0);
    longTermStats.scoring.visits.v133 = sessions.reduce((sum,s) => sum + s.stats.scoring.visits.v133, 0);
    longTermStats.scoring.visits.v95 = sessions.reduce((sum,s) => sum + s.stats.scoring.visits.v95, 0);
    longTermStats.scoring.visits.v57 = sessions.reduce((sum,s) => sum + s.stats.scoring.visits.v57, 0);
    longTermStats.scoring.throws.T20 = sessions.reduce((sum,s) => sum + s.stats.scoring.throws.T20, 0);
    longTermStats.scoring.throws.T19 = sessions.reduce((sum,s) => sum + s.stats.scoring.throws.T19, 0);
    longTermStats.scoring.throws.T18 = sessions.reduce((sum,s) => sum + s.stats.scoring.throws.T18, 0);
    longTermStats.scoring.throws.T17 = sessions.reduce((sum,s) => sum + s.stats.scoring.throws.T17, 0);
    longTermStats.scoring.throws.T16 = sessions.reduce((sum,s) => sum + s.stats.scoring.throws.T16, 0);


    longTermStats.basic.average = longTermStats.basic.totalThrows ? (sessions.reduce((sum,s) => sum + s.stats.basic.average * s.stats.basic.totalThrows, 0)/(longTermStats.basic.totalThrows)).toFixed(2) : 0
    longTermStats.checkout.attempts = sessions.reduce((sum,s) => sum + s.stats.checkout.attempts, 0);
    longTermStats.checkout.success = sessions.reduce((sum,s) => sum + s.stats.checkout.success, 0);
    longTermStats.checkout.percentage = longTermStats.checkout.attempts ? ((longTermStats.checkout.success/longTermStats.checkout.attempts)*100).toFixed(2) : 0;
    longTermStats.milestone.bestAverage = sessions.reduce((best, s) => Math.max(best, s.stats.basic.average), 0);
    longTermStats.milestone.bestPercentage = sessions.reduce((best, s) => Math.max(best, s.stats.checkout.percentage), 0);
    longTermStats.milestone.shortestLeg = sessions.reduce((best, s) => {
        const shortest = s.stats.basic.throwsPerLeg.reduce((min, t) => Math.min(min, t), Infinity);
        return Math.min(best, shortest);
    }, Infinity);
    longTermStats.checkout.highest = sessions.reduce((best, s) => Math.max(best, s.stats.checkout.highest), 0);

    return longTermStats;
}