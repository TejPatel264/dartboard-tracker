let canvas = document.getElementById("dartboard")
let ctx = canvas.getContext("2d")
const width = canvas.width
const height = canvas.height
const center = {x: width/2, y: height/2}

export let appState = {
  canvas,
  ctx,
  width,
  height,
  center
};

export let gameState = {
    isPaused: false,
    isGame: false,
    leg: null
};

export let sessionState = {
    throws: [],
    visitScores: [],
    throwStats: {T20: 0, T19: 0, T18: 0, T17: 0, D20: 0, D16: 0, BULL: 0},
    visitStats: {s180:0, s171:0, s131:0, s91:0}
};