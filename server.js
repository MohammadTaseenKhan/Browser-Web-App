// public/app.js

// Elements
const browserFrame = document.getElementById("browser");
const urlInput = document.getElementById("urlInput");

// Default home page
const HOME_URL = "https://example.com";

// Utility to normalize URLs
function normalizeUrl(url) {
  if (!url) return HOME_URL;
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    url = "https://" + url;
  }
  return url;
}

// Load a URL with proxy fallback
function load(url) {
  url = normalizeUrl(url);
  const proxyUrl = `https://browser-web-app.vercel.app/proxy?url=${encodeURIComponent(
    url
  )}`;

  // Always go through proxy (ensures iframe works)
  browserFrame.src = proxyUrl;
  urlInput.value = url;
}

// Navigation
function goBack() {
  browserFrame.contentWindow.history.back();
}

function goForward() {
  browserFrame.contentWindow.history.forward();
}

function reload() {
  browserFrame.contentWindow.location.reload();
}

function goHome() {
  load(HOME_URL);
}

// Event listeners
document.getElementById("goBtn").addEventListener("click", () => {
  const url = urlInput.value.trim();
  if (url) load(url);
});

urlInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    const url = urlInput.value.trim();
    if (url) load(url);
  }
});

// Init: load home page
window.addEventListener("DOMContentLoaded", () => {
  load(HOME_URL);
});
