"use strict";

console.log("[MoreCSFloatBadges] content.js loaded");

// State

const listingsQueue = [];
let processedCount = 0;
let lastHref = location.href;
let tryProcessTimeout = null;

// Message listener

window.addEventListener("message", (event) => {
  if (event.source !== window) return;
  if (event.data?.source !== "MoreCSFloatBadges") return;

  if (event.data.type === "LISTINGS_DATA") {
    processListings(event.data.payload, event.data.isFirst);
  } else if (event.data.type === "SALES_DATA") {
    processSales(event.data.payload);
  }
});

// MutationObserver
// observe DOM for new cards and SPA navigation changes
const observer = new MutationObserver(() => {
  const currentHref = location.href;
  if (currentHref !== lastHref) {
    lastHref = currentHref;
    if (/\/item\/\d+/.test(currentHref))
      setTimeout(() => handleItemPage(), 500);
    return;
  }
  clearTimeout(tryProcessTimeout);
  tryProcessTimeout = setTimeout(() => tryProcess(), 150);
});

function start() {
  observer.observe(document.body, { childList: true, subtree: true });
  if (/\/item\/\d+/.test(location.href)) handleItemPage();
}

if (document.body) {
  start();
} else {
  document.addEventListener("DOMContentLoaded", start);
}
