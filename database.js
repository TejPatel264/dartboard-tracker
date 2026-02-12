import Dexie from "https://unpkg.com/dexie@latest/dist/dexie.mjs";

export const database = new Dexie("dartStats")

database.version(1).stores({
    sessions: "++id, meta.date"
})

export function createSession() {
  return {
    meta: {
      date: Date.now(),
      duration: 0,
      player: "",
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
        average: 0
    },
    scoring: {
      throws: {
        T20: 0,
        T19: 0,
        T18: 0,
        T17: 0,
        BULL: 0,
        D20: 0,
        D16: 0
      },
      visits: {
        v180: 0,
        v171: 0,
        v131: 0,
        v91: 0
      }},
      checkout: {
        attempts: 0,
        success: 0,
        percentage: 0
      }
    }
  }
}