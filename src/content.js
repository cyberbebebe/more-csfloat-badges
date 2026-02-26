"use strict";

console.log("[CFPB] loaded");

const style = document.createElement("style");
style.textContent = `
  .cfpb-wrap {
    position: absolute;
    top: 6px;
    left: 6px;
    z-index: 20;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    pointer-events: auto;
    cursor: pointer;
    width: 35px;
    overflow: visible;
  }

  .cfpb-wrap img {
    width: 35px;
    height: auto;
    filter: drop-shadow(0 1px 3px rgba(0,0,0,0.9));
    transition: transform 0.2s ease;
    display: block;
    pointer-events: none;
    transform-origin: center center;
    image-rendering: crisp-edges;
  }

  .cfpb-wrap:hover img {
    transform: scale(1.75);
  }

  .cfpb-label {
    opacity: 0;
    pointer-events: none;
    white-space: nowrap;
    background: var(--backing-background-color);
    color: var(--primary-text-color);
    font-family: Roboto, "Helvetica Neue", sans-serif;
    font-size: 12px;
    font-weight: 400;
    line-height: 16px;
    letter-spacing: .0333333333em;
    padding: 4px 8px;
    box-sizing: initial;
    transition: opacity 0.2s ease;
    position: absolute;
    top: 50px;
    left: 0;
    z-index: 999;
    transform: none !important;
  }

  .cfpb-wrap:hover .cfpb-label {
    opacity: 1;
  }

  .cfpb-wrap.cfpb-detail img {
    width: 56px;
  }

  .cfpb-wrap.cfpb-detail .cfpb-label {
    top: 76px;
  }
`;
document.head.appendChild(style);

// ─── State ────────────────────────────────────────────────────────────────────

const listingsQueue = [];
let processedCount = 0;
let prevCardCount = 0;
let lastHref = location.href;

// ─── Utils ────────────────────────────────────────────────────────────────────

// find tier for item by item_name and paint_seed
function getTierForItem(item) {
  if (!item) return null;
  const patterns = PATTERN_DATA[item.item_name];
  if (!patterns) return null;
  for (const tier of TIER_PRIORITY) {
    if (patterns[tier]?.includes(item.paint_seed)) return tier;
  }
  return null;
}

// create badge wrapper with icon and label
function createBadgeWrap(tier, isDetail = false) {
  const wrap = document.createElement("div");
  wrap.className = isDetail ? "cfpb-wrap cfpb-detail" : "cfpb-wrap";

  const img = document.createElement("img");
  img.src = chrome.runtime.getURL(`icons/${tier}.png`);
  img.alt = tier;

  const label = document.createElement("div");
  label.className = "cfpb-label";
  label.textContent = TIER_LABELS[tier] ?? tier;

  wrap.appendChild(img);
  wrap.appendChild(label);
  return wrap;
}

// remove overflow:hidden from all parent elements
function unclipParents(el) {
  let node = el.parentElement;
  while (node && node !== document.body) {
    const ov = getComputedStyle(node).overflow;
    if (ov === "hidden" || ov === "clip") node.style.overflow = "visible";
    node = node.parentElement;
  }
}

// ─── Listings ─────────────────────────────────────────────────────────────────

// inject badge into small listing card
function injectListingBadge(cardEl, tier) {
  if (cardEl.querySelector(".cfpb-wrap")) return;
  const container = cardEl.querySelector(".container.ng-star-inserted");
  if (!container) return;
  if (getComputedStyle(container).position === "static")
    container.style.position = "relative";
  container.style.overflow = "visible";
  unclipParents(container);
  container.appendChild(createBadgeWrap(tier, false));
}

// inject badge into detail/modal card
function injectDetailBadge(tier) {
  const selectors = [
    "app-item-detail .container.ng-star-inserted",
    "mat-dialog-container app-item-image-actions .container.ng-star-inserted",
    "mat-dialog-container .container.ng-star-inserted",
  ];
  for (const sel of selectors) {
    for (const container of document.querySelectorAll(sel)) {
      if (container.offsetWidth < 100) continue;
      if (container.querySelector(".cfpb-wrap")) return;
      if (getComputedStyle(container).position === "static")
        container.style.position = "relative";
      container.style.overflow = "visible";
      unclipParents(container);
      container.appendChild(createBadgeWrap(tier, true));
      return;
    }
  }
}

// poll until detail container is rendered then inject
function waitForDetail(tier) {
  let attempts = 0;
  const id = setInterval(() => {
    const done = document.querySelector(
      "app-item-detail .cfpb-wrap, mat-dialog-container .cfpb-wrap",
    );
    if (done || ++attempts > 20) {
      clearInterval(id);
      return;
    }
    injectDetailBadge(tier);
  }, 300);
}

// fetch single listing by id for /item/:id page
async function handleItemPage() {
  const match = location.pathname.match(/^\/item\/(\d+)$/);
  if (!match) return;
  console.log("[CFPB] handleItemPage:", match[1]);
  try {
    const res = await fetch(`https://csfloat.com/api/v1/listings/${match[1]}`, {
      credentials: "include",
    });
    const data = await res.json();
    console.log(
      "[CFPB] item data:",
      data?.item?.item_name,
      "| seed:",
      data?.item?.paint_seed,
    );
    const tier = getTierForItem(data?.item);
    console.log("[CFPB] item tier:", tier);
    if (tier) waitForDetail(tier);
  } catch (e) {
    console.error("[CFPB] item page error:", e);
  }
}

// check open modal dialog and inject badge if listing found in queue
function checkDialogForBadge() {
  const dialog = document.querySelector("mat-dialog-container");
  if (!dialog || dialog.querySelector(".cfpb-wrap")) return;
  const inspectLink = dialog.querySelector(
    'a[href*="csgo_econ_action_preview"]',
  );
  if (!inspectLink) return;
  const m = inspectLink.href.match(/A(\d+)D/);
  if (!m) return;
  const listing = listingsQueue.find((l) => l.item?.asset_id === m[1]);
  if (!listing) return;
  const tier = getTierForItem(listing.item);
  if (tier) waitForDetail(tier);
}

// process queued listings against current DOM cards
function tryProcess() {
  const cards = document.querySelectorAll("item-card");
  const count = cards.length;

  if (prevCardCount >= 20 && count < prevCardCount / 2) {
    listingsQueue.length = 0;
    processedCount = 0;
    prevCardCount = count;
    return;
  }
  prevCardCount = count;

  while (processedCount < count && processedCount < listingsQueue.length) {
    const tier = getTierForItem(listingsQueue[processedCount]?.item);
    if (tier) injectListingBadge(cards[processedCount], tier);
    processedCount++;
  }

  checkDialogForBadge();
}

// ─── Sales history ────────────────────────────────────────────────────────────

// inject tier badge into sales history table row
function injectSalesBadge(rowEl, tier) {
  if (rowEl.querySelector(".cfpb-wrap")) return;
  const td = rowEl.querySelector("td.cdk-column-badges");
  if (!td) return;

  const wrap = createBadgeWrap(tier, false);
  wrap.style.position = "relative";
  wrap.style.top = "0";
  wrap.style.left = "0";
  wrap.style.display = "inline-flex";

  // place label to the left of the icon
  const label = wrap.querySelector(".cfpb-label");
  if (label) {
    label.style.top = "0";
    label.style.left = "auto";
    label.style.right = "100%";
    label.style.marginTop = "0";
    label.style.marginRight = "6px";
  }

  td.appendChild(wrap);
  console.log("[CFPB] sales badge:", tier);
}

// match sales rows to sales data by index and inject badges
function getSeedFromRow(rowEl) {
  // get all cells, Paint Seed is 5th column (index 4): Action, Sold, Price, Float Value, Paint Seed
  const cells = rowEl.querySelectorAll("td");
  if (cells.length >= 4) {
    const val = parseInt(cells[4].textContent.trim(), 10);
    if (!isNaN(val)) return val;
  }
  return null;
}

// inject badges by reading paint_seed directly from each row
function applySalesBadges(itemName, rows) {
  rows.forEach((row) => {
    if (row.querySelector(".cfpb-wrap")) return;
    const seed = getSeedFromRow(row);
    if (seed == null) return;
    const patterns = PATTERN_DATA[itemName];
    if (!patterns) return;
    for (const tier of TIER_PRIORITY) {
      if (patterns[tier]?.includes(seed)) {
        injectSalesBadge(row, tier);
        break;
      }
    }
  });
}

// wait for sales table then find its rows specifically
function processSales(itemName) {
  let attempts = 0;
  const id = setInterval(() => {
    // sales table is inside app-sales-table or similar — find the closest tbody
    // that contains td.cdk-column-badges which is the badge slot
    const badgeCells = document.querySelectorAll("td.cdk-column-badges");
    if (badgeCells.length || ++attempts > 20) {
      clearInterval(id);
      if (!badgeCells.length) return;
      // get rows from the same tbody as the badge cells
      const tbody = badgeCells[0].closest("tbody");
      if (!tbody) return;
      const rows = tbody.querySelectorAll("tr.mat-mdc-row");
      if (rows.length) applySalesBadges(itemName, rows);
    }
  }, 300);
}

// ─── Message listener ─────────────────────────────────────────────────────────

// receive intercepted data from intercept.js via postMessage
window.addEventListener("message", (event) => {
  if (event.source !== window) return;
  if (event.data?.source !== "CSFloatPatternBadge") return;

  if (event.data.type === "LISTINGS_DATA") {
    if (event.data.isFirstPage) {
      listingsQueue.length = 0;
      processedCount = 0;
    }
    listingsQueue.push(...event.data.payload);
    tryProcess();
  }

  if (event.data.type === "SALES_DATA") {
    processSales(event.data.itemName);
  }
});

// ─── MutationObserver ─────────────────────────────────────────────────────────

// observe DOM for new cards and SPA navigation changes
const observer = new MutationObserver(() => {
  const currentHref = location.href;
  if (currentHref !== lastHref) {
    lastHref = currentHref;
    console.log("[CFPB] nav:", currentHref);
    if (/\/item\/\d+/.test(currentHref))
      setTimeout(() => handleItemPage(), 500);
    return;
  }
  tryProcess();
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
