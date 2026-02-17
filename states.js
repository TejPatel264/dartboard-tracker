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
  center,
  page: "home"
};

export let gameState = {
    isPaused: false,
    isGame: false,
    leg: null,
    scoreRemaining: 501
};