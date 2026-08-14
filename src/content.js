"use strict";

console.log("[MoreCSFloatBadges] content.js loaded");

// State

const listingsQueue = [];
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
  tryProcessTimeout = setTimeout(() => {
    tryProcess();
    if (typeof tryProcessSales === 'function') tryProcessSales();
  }, 150);
});

function start() {
  observer.observe(document.body, { childList: true, subtree: true });
  if (/\/item\/\d+/.test(location.href)) handleItemPage();

  // BetterFloat Pattern Sales compatibility fix
  document.addEventListener('click', (e) => {
    const toggle = e.target.closest('mat-button-toggle');
    if (toggle && toggle.textContent.includes('Latest Sales')) {
      const gridHistory = document.querySelector('.grid-history');
      if (!gridHistory) return;
      
      const bfTable = gridHistory.querySelector('.bf-table');
      if (bfTable) {
        // BetterFloat replaced the DOM. Force Angular to reload Latest Sales
        e.stopPropagation();
        e.preventDefault();
        
        const salesGraphTab = Array.from(gridHistory.querySelectorAll('mat-button-toggle'))
          .find(t => t.textContent.includes('Sales Graph'));
          
        if (salesGraphTab) {
          const btn1 = salesGraphTab.querySelector('button');
          if (btn1) {
            btn1.click(); // Switch to Sales Graph
            setTimeout(() => {
              const btn2 = toggle.querySelector('button');
              if (btn2) {
                btn2.click(); // Switch back to Latest Sales to trigger re-render
              }
            }, 10);
          }
        }
      }
    }
  }, true);
}

if (document.body) {
  start();
} else {
  document.addEventListener("DOMContentLoaded", start);
}
