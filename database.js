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
          average: 0,
          throwsPerLeg: []
      },
      scoring: {
        throws: {
          T20: 0,
          T19: 0,
          T18: 0,
          T17: 0,
          T16: 0,
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
        attempts: 0,
        success: 0,
        percentage: 0,
        highest: 0,
        segments: {
          D20: 0,
          D16: 0,
          D10: 0,
          BULL: 0
        }
      }
    }
  }
}