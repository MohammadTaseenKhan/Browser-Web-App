// Telegram Mini Browser JS
const tg = window.Telegram.WebApp;
tg.expand();
tg.ready();

const browserFrame = document.getElementById("browser");
const urlInput = document.getElementById("urlInput");

const goBtn = document.getElementById("goBtn");
const backBtn = document.getElementById("backBtn");
const fwdBtn = document.getElementById("fwdBtn");
const reloadBtn = document.getElementById("reloadBtn");
const homeBtn = document.getElementById("homeBtn");

const HOME_URL = "https://en.wikipedia.org/";

let historyStack = [];
let historyIndex = -1;

// Normalize URL
function normalizeUrl(url) {
  if (!url) return HOME_URL;
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    url = "https://" + url;
  }
  return url;
}

// Build proxy URL
function buildProxyUrl(url) {
  return `https://browser-web-app.vercel.app/api/proxy?url=${encodeURIComponent(url)}`;
}

// Load URL in iframe
function load(url, pushHistory = true) {
  url = normalizeUrl(url);
  const proxyUrl = buildProxyUrl(url);
  browserFrame.src = proxyUrl;
  urlInput.value = url;

  if (pushHistory) {
    historyStack = historyStack.slice(0, historyIndex + 1);
    historyStack.push(url);
    historyIndex = historyStack.length - 1;
  }

  updateNavButtons();
}

function updateNavButtons() {
  backBtn.disabled = historyIndex <= 0;
  fwdBtn.disabled = historyIndex >= historyStack.length - 1;
}

// Navigation handlers
goBtn.onclick = () => load(urlInput.value);
homeBtn.onclick = () => load(HOME_URL);
backBtn.onclick = () => {
  if (historyIndex > 0) {
    historyIndex--;
    load(historyStack[historyIndex], false);
  }
};
fwdBtn.onclick = () => {
  if (historyIndex < historyStack.length - 1) {
    historyIndex++;
    load(historyStack[historyIndex], false);
  }
};
reloadBtn.onclick = () => {
  if (historyIndex >= 0) load(historyStack[historyIndex], false);
};

// Enter key
urlInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") load(urlInput.value);
});

// Initial load
window.addEventListener("DOMContentLoaded", () => {
  const initialUrl = new URLSearchParams(window.location.search).get("url") || HOME_URL;
  load(initialUrl);
});
