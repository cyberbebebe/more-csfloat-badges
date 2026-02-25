"use strict";

console.log("[CFPB] loaded");

// CSS

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
    transition: transform 0.15s ease, filter 0.15s ease;
    display: block;
    pointer-events: none;
  }

  .cfpb-wrap:hover img {
    transform: scale(1.75);
  }

  .cfpb-label {
    opacity: 0;
    pointer-events: none;
    white-space: nowrap;
    background: rgba(30, 30, 30, 0.92);
    color: #fff;
    font-size: 12px;
    font-family: Arial, sans-serif;
    padding: 4px 8px;
    margin-top: 10px;
    transition: opacity 0.15s ease;
    top: 100%;
    left: 0;
    z-index: 999;
  }

  .cfpb-wrap:hover .cfpb-label {
    opacity: 1;
  }

  .cfpb-wrap.cfpb-detail img {
    width: 56px;
  }
`;
document.head.appendChild(style);

// Status

const listingsQueue = [];
let processedCount = 0;
let nextCursor = null;
let isFetching = false;
let cursorRequested = new Set();
let lastHref = location.href;
let prevCardCount = 0;

function waitForDetailAndInject(tier) {
  let attempts = 0;
  const id = setInterval(() => {
    attempts++;

    const dialog = document.querySelector("mat-dialog-container");
    if (dialog) {
      const containers = dialog.querySelectorAll(".container.ng-star-inserted");
      containers.forEach((c, i) => {
        console.log(
          `[CFPB] dialog container ${i}:`,
          c.className,
          "| size:",
          c.offsetWidth,
          "x",
          c.offsetHeight,
          "| el:",
          c,
        );
      });
    }

    const done = document.querySelector(
      "app-item-detail .cfpb-wrap, mat-dialog-container .cfpb-wrap",
    );
    if (done) {
      clearInterval(id);
      return;
    }
    injectDetailBadge(tier);
    if (attempts > 20) clearInterval(id);
  }, 300);
}

// Utils

function getTierForItem(item) {
  if (!item) return null;
  const patterns = PATTERN_DATA[item.item_name];
  if (!patterns) return null;
  for (const tier of TIER_PRIORITY) {
    if (patterns[tier]?.includes(item.paint_seed)) return tier;
  }
  return null;
}

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

function unclipParents(el) {
  let node = el.parentElement;
  while (node && node !== document.body) {
    const ov = getComputedStyle(node).overflow;
    if (ov === "hidden" || ov === "clip") {
      node.style.overflow = "visible";
    }
    node = node.parentElement;
  }
}

// inject in /listings card

function injectListingBadge(cardEl, tier) {
  if (cardEl.querySelector(".cfpb-wrap")) return;

  const container = cardEl.querySelector(".container.ng-star-inserted");
  if (!container) return;

  if (getComputedStyle(container).position === "static") {
    container.style.position = "relative";
    container.style.overflow = "visible";
    unclipParents(container);
  }

  container.appendChild(createBadgeWrap(tier, false));
  console.log("[CFPB] listing badge:", tier);
}

// Inject in /item/*id*

function injectDetailBadge(tier) {
  const selectors = [
    "app-item-detail .container.ng-star-inserted",
    "mat-dialog-container app-item-image-actions .container.ng-star-inserted",
    "mat-dialog-container .container.ng-star-inserted",
  ];

  for (const sel of selectors) {
    const containers = document.querySelectorAll(sel);
    for (const container of containers) {
      if (container.offsetWidth < 100) continue;
      if (container.querySelector(".cfpb-wrap")) return;

      if (getComputedStyle(container).position === "static") {
        container.style.position = "relative";
      }
      container.style.overflow = "visible";
      unclipParents(container);

      const badge = createBadgeWrap(tier, true);
      container.appendChild(badge);
      console.log(
        "[CFPB] detail badge:",
        tier,
        "| sel:",
        sel,
        "| size:",
        container.offsetWidth,
      );
      return;
    }
  }
}

function waitForDetailAndInject(tier) {
  let attempts = 0;
  const id = setInterval(() => {
    attempts++;
    const done = document.querySelector(
      "app-item-detail .cfpb-wrap, mat-dialog-container .cfpb-wrap",
    );
    if (done) {
      clearInterval(id);
      return;
    }
    injectDetailBadge(tier);
    if (attempts > 20) clearInterval(id);
  }, 300);
}

// /item/*id*

async function handleItemPage() {
  const match = location.pathname.match(/^\/item\/(\d+)$/);
  if (!match) return;

  try {
    const res = await fetch(`https://csfloat.com/api/v1/listings/${match[1]}`, {
      credentials: "include",
    });
    const data = await res.json();
    const tier = getTierForItem(data?.item);
    if (tier) waitForDetailAndInject(tier);
  } catch (e) {
    console.error("[CFPB] item page error:", e);
  }
}

// /listings

function checkDialogForBadge() {
  const dialog = document.querySelector("mat-dialog-container");
  if (!dialog || dialog.querySelector(".cfpb-wrap")) return;

  const inspectLink = dialog.querySelector(
    'a[href*="csgo_econ_action_preview"]',
  );
  if (!inspectLink) return;

  const assetMatch = inspectLink.href.match(/A(\d+)D/);
  if (!assetMatch) return;

  const assetId = assetMatch[1];
  const listing = listingsQueue.find((l) => l.item?.asset_id === assetId);
  if (!listing) return;

  const tier = getTierForItem(listing.item);
  if (tier) waitForDetailAndInject(tier);
}

// process queue

function tryProcess() {
  const cards = document.querySelectorAll("item-card");
  const count = cards.length;

  if (prevCardCount >= 20 && count < prevCardCount / 2) {
    console.log(
      "[CFPB] card count dropped",
      prevCardCount,
      "→",
      count,
      "— resetting",
    );
    listingsQueue.length = 0;
    processedCount = 0;
    nextCursor = null;
    cursorRequested.clear();
    setTimeout(() => fetchListings(true), 200);
    prevCardCount = count;
    return;
  }
  prevCardCount = count;

  while (processedCount < count && processedCount < listingsQueue.length) {
    const tier = getTierForItem(listingsQueue[processedCount]?.item);
    if (tier) injectListingBadge(cards[processedCount], tier);
    processedCount++;
  }

  if (
    count > listingsQueue.length &&
    nextCursor &&
    !cursorRequested.has(nextCursor) &&
    !isFetching
  ) {
    fetchListings(false);
  }

  checkDialogForBadge();
}

// Fetch

async function fetchListings(reset = false) {
  if (isFetching) return;
  isFetching = true;

  try {
    const hash = location.hash;
    const search = hash.includes("?")
      ? hash.slice(hash.indexOf("?"))
      : location.search;
    const params = new URLSearchParams(search);
    params.set("limit", "40");

    if (!reset && nextCursor) {
      if (cursorRequested.has(nextCursor)) {
        isFetching = false;
        return;
      }
      params.set("cursor", nextCursor);
    } else {
      params.delete("cursor");
    }

    const url = `https://csfloat.com/api/v1/listings?${params.toString()}`;
    console.log("[CFPB] fetching:", url);

    const res = await fetch(url, { credentials: "include" });
    const data = await res.json();
    if (!Array.isArray(data?.data)) return;

    if (nextCursor) cursorRequested.add(nextCursor);
    nextCursor = data.cursor ?? null;

    if (reset) {
      listingsQueue.length = 0;
      processedCount = 0;
      cursorRequested.clear();
    }

    listingsQueue.push(...data.data);
    console.log(
      "[CFPB] queue:",
      listingsQueue.length,
      "| next cursor:",
      !!nextCursor,
    );
    tryProcess();
  } catch (e) {
    console.error("[CFPB] fetch error:", e);
  } finally {
    isFetching = false;
  }
}

// MutationObserver

const observer = new MutationObserver(() => {
  const currentHref = location.href;

  if (currentHref !== lastHref) {
    lastHref = currentHref;
    console.log("[CFPB] nav:", currentHref);

    if (/\/item\/\d+/.test(currentHref)) {
      setTimeout(() => handleItemPage(), 500);
    } else {
      setTimeout(() => fetchListings(true), 800);
    }
    return;
  }

  tryProcess();
});

function start() {
  observer.observe(document.body, { childList: true, subtree: true });

  if (/\/item\/\d+/.test(location.href)) {
    handleItemPage();
  } else {
    fetchListings(true);
  }
}

if (document.body) {
  start();
} else {
  document.addEventListener("DOMContentLoaded", start);
}
