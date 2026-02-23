import { appState } from "./states.js";

const page = document.getElementById("pages");
const trackerPage = document.getElementById("tracker");

export function showSummaryStats() {
  if (document.getElementById("view-quick").hasAttribute("show")) return;
  document.querySelectorAll(".stat-view").forEach(view => view.removeAttribute("show"));
  document.getElementById("view-quick").toggleAttribute("show")
}

export async function showSessionStatView() {
  if (document.getElementById("view-session").hasAttribute("show")) return;
  document.querySelectorAll(".stat-view").forEach(view => view.removeAttribute("show"));
  document.getElementById("view-session").toggleAttribute("show")
}

export function showScoringStats() {
  if (document.getElementById("view-scoring").hasAttribute("show")) return;
  document.querySelectorAll(".stat-view").forEach(view => view.removeAttribute("show"));
  document.getElementById("view-scoring").toggleAttribute("show");
}

export function toTracker() {
  page.style.transform = "translateX(-100vw)";
    trackerPage.style.opacity = 1;
    page.addEventListener("transitionend", () => {
      document.querySelectorAll(".stat-view").forEach(view => view.removeAttribute("show"));
    }, {once: true});
}