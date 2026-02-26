"use strict";

console.log("[MoreCSFloatBadges] loaded");

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

// create img badge wrapper for knives
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

// create gradient div badge for fade gloves
function createFadeBadgeWrap(tier, isDetail = false) {
  const width = isDetail ? "50px" : "45px";
  const height = isDetail ? "28px" : "22px";
  const fontSize = isDetail ? "20px" : "18px";
  const labelTop = isDetail ? "40px" : "30px";

  const wrap = document.createElement("div");
  wrap.className = isDetail ? "cfpb-wrap cfpb-detail" : "cfpb-wrap";

  const badge = document.createElement("div");
  const fade = FADE_GRADIENTS[tier];
  const gradient =
    fade?.gradient ??
    "linear-gradient(to right, #d9bba5, #e5903b, #db5977, #6775e1)";
  const position = fade?.position ?? "50%";

  badge.style.cssText = `
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
    font-size: ${fontSize};
    font-family: Roboto, sans-serif;
    color: #00000080;
    width: ${width};
    height: ${height};
    padding: 2px;
    border-radius: 7px;
    background-image: ${gradient};
    background-size: 170%;
    background-position-x: ${position};
    transition: transform 0.2s ease;
    transform-origin: center center;
    box-sizing: border-box;
  `;
  badge.textContent = FADE_BADGE_TEXT[tier] ?? tier;

  wrap.addEventListener("mouseenter", () => {
    badge.style.transform = "scale(1.5)";
  });
  wrap.addEventListener("mouseleave", () => {
    badge.style.transform = "";
  });

  const label = document.createElement("div");
  label.className = "cfpb-label";
  label.textContent = TIER_LABELS[tier] ?? tier;
  label.style.top = labelTop;

  wrap.appendChild(badge);
  wrap.appendChild(label);
  return wrap;
}

// pick correct badge creator based on item name
function createCorrectBadgeWrap(itemName, tier, isDetail = false) {
  return FADE_BADGE_ITEMS.has(itemName)
    ? createFadeBadgeWrap(tier, isDetail)
    : createBadgeWrap(tier, isDetail);
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
function injectListingBadge(cardEl, item, tier) {
  if (cardEl.querySelector(".cfpb-wrap")) return;
  const container = cardEl.querySelector(".container.ng-star-inserted");
  if (!container) return;
  if (getComputedStyle(container).position === "static")
    container.style.position = "relative";
  container.style.overflow = "visible";
  unclipParents(container);
  container.appendChild(createCorrectBadgeWrap(item?.item_name, tier, false));
}

// inject badge into detail/modal card
function injectDetailBadge(itemName, tier) {
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
      container.appendChild(createCorrectBadgeWrap(itemName, tier, true));
      return;
    }
  }
}

// poll until detail container is rendered then inject
function waitForDetail(itemName, tier) {
  let attempts = 0;
  const id = setInterval(() => {
    const done = document.querySelector(
      "app-item-detail .cfpb-wrap, mat-dialog-container .cfpb-wrap",
    );
    if (done || ++attempts > 20) {
      clearInterval(id);
      return;
    }
    injectDetailBadge(itemName, tier);
  }, 300);
}

// fetch single listing by id for /item/:id page
async function handleItemPage() {
  const match = location.pathname.match(/^\/item\/(\d+)$/);
  if (!match) return;
  try {
    const res = await fetch(`https://csfloat.com/api/v1/listings/${match[1]}`, {
      credentials: "include",
    });
    const data = await res.json();
    const tier = getTierForItem(data?.item);
    if (tier) waitForDetail(data.item.item_name, tier);
  } catch (e) {
    console.error("[MoreCSFloatBadges] item page error:", e);
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
  if (tier) waitForDetail(listing.item.item_name, tier);
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
    const item = listingsQueue[processedCount]?.item;
    const tier = getTierForItem(item);
    if (tier) injectListingBadge(cards[processedCount], item, tier);
    processedCount++;
  }

  checkDialogForBadge();
}

// ─── Sales history ────────────────────────────────────────────────────────────

// inject tier badge into sales history table row
function injectSalesBadge(rowEl, itemName, tier) {
  if (rowEl.querySelector(".cfpb-wrap")) return;

  let td = rowEl.querySelector("td.cdk-column-badges");
  let usesFallback = false;

  if (!td) {
    // fallback: stickers column for Talon and Fade Gloves
    td = rowEl.querySelector("td.cdk-column-stickers");
    usesFallback = true;
  }
  if (!td) return;

  const wrap = createCorrectBadgeWrap(itemName, tier, false);
  wrap.style.position = "relative";
  wrap.style.top = "0";
  wrap.style.left = "0";
  wrap.style.display = "inline-flex";

  const label = wrap.querySelector(".cfpb-label");
  if (label) {
    label.style.top = "0";
    label.style.left = "auto";
    label.style.right = "100%";
    label.style.marginTop = "0";
    label.style.marginRight = "6px";
  }

  td.appendChild(wrap);
}

// read paint_seed from 5th cell of table row
function getSeedFromRow(rowEl) {
  const cells = rowEl.querySelectorAll("td");
  if (cells.length >= 5) {
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
        injectSalesBadge(row, itemName, tier);
        break;
      }
    }
  });
}

// wait for sales table then inject badges into correct tbody
function processSales(itemName) {
  if (!PATTERN_DATA[itemName]) return;
  let attempts = 0;
  const id = setInterval(() => {
    let anchorCells = document.querySelectorAll("td.cdk-column-badges");
    const useStickers = !anchorCells.length;
    if (useStickers) {
      anchorCells = document.querySelectorAll("td.cdk-column-stickers");
    }

    if (anchorCells.length || ++attempts > 20) {
      clearInterval(id);
      if (!anchorCells.length) return;

      // rename stickers column header for items without badges column
      const allHeaders = document.querySelectorAll("th.mat-mdc-header-cell");
      const lastHeader = allHeaders[allHeaders.length - 1];
      if (lastHeader && !lastHeader.dataset.cfpbRenamed) {
        lastHeader.dataset.cfpbRenamed = "true";
        const span = lastHeader.querySelector("span") ?? lastHeader;
        span.textContent = "Ranking";
      }

      if (!useStickers && PATTERN_DATA[itemName]) {
        const stickerHeader = document.querySelector(
          "th.cdk-column-stickers, th.mat-column-stickers",
        );
        if (stickerHeader) stickerHeader.style.display = "none";

        document
          .querySelectorAll("td.cdk-column-stickers, td.mat-column-stickers")
          .forEach((td) => {
            td.style.display = "none";
          });
      }

      const tbody = anchorCells[0].closest("tbody");
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
