import Dexie from "https://unpkg.com/dexie@latest/dist/dexie.mjs";

export const database = new Dexie("dartStats")

database.version(1).stores({
    player: "id, name",
    sessions: "++id, meta.date"
})

export async function createPlayer() {
  const count = await database.player.count();

  if (count === 0) {
    const name = prompt("Enter your name:") || "Player";

    await database.player.put({
      id: "local",
      name,
      created: Date.now(),
      lifetimeStats: null
    });
  }
}


export function createSession() {
  return {
    meta: {
      date: Date.now(),
      duration: 0,
      format: "practice",
      gameType: "none"
    },

    raw: {
      throws: [],
      visits: []
    },

    stats: {
      basic: {
          totalThrows: 0,
          totalVisits: 0,
          totalLegs: 0,
          average: 0,
          throwsPerLeg: []
      },
      scoring: {
        scoringThrows: 0,
        scoringAverage: 0,
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
        },
        visits: {
          v180: 0,
          v171: 0,
          v133: 0,
          v95: 0,
          v57: 0
        }
      },
      checkout: {
        all: [],
        attempts: 0,
        success: 0,
        percentage: 0,
        tonPlus: 0,
        highest: 0,
        segments: {
          D20: {attempts: 0, success: 0, percentage: 0},
          D19: {attempts: 0, success: 0, percentage: 0},
          D18: {attempts: 0, success: 0, percentage: 0},
          D17: {attempts: 0, success: 0, percentage: 0},
          D16: {attempts: 0, success: 0, percentage: 0},
          D15: {attempts: 0, success: 0, percentage: 0},
          D14: {attempts: 0, success: 0, percentage: 0},
          D13: {attempts: 0, success: 0, percentage: 0},
          D12: {attempts: 0, success: 0, percentage: 0},
          D11: {attempts: 0, success: 0, percentage: 0},
          D10: {attempts: 0, success: 0, percentage: 0},
          D9: {attempts: 0, success: 0, percentage: 0},
          D8: {attempts: 0, success: 0, percentage: 0},
          D7: {attempts: 0, success: 0, percentage: 0},
          D6: {attempts: 0, success: 0, percentage: 0},
          D5: {attempts: 0, success: 0, percentage: 0},
          D4: {attempts: 0, success: 0, percentage: 0},
          D3: {attempts: 0, success: 0, percentage: 0},
          D2: {attempts: 0, success: 0, percentage: 0},
          D1: {attempts: 0, success: 0, percentage: 0},
          BULL: {attempts: 0, success: 0, percentage: 0}
        },
        when: {
          throw1: {attempts: 0, success: 0},
          visit1: {attempts: 0, success: 0},
          visit2: {attempts: 0, success: 0}
        }
      }
    }
  }
}