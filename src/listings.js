function processListings(data, isFirst) {
  if (isFirst) {
    listingsQueue.length = 0;
    processedCount = 0;
  }
  listingsQueue.push(...data);

  setTimeout(() => tryProcess(), 50);
}

function tryProcess() {
  const cards = document.querySelectorAll("item-card");
  while (
    processedCount < cards.length &&
    processedCount < listingsQueue.length
  ) {
    const item = listingsQueue[processedCount]?.item;
    const phase = getPhase(item);
    const tier = getTier(item);

    if (phase && tier) {
      injectListingBadge(cards[processedCount], phase, tier);
    }

    processedCount++;
  }
}

async function handleItemPage() {
  const match = location.pathname.match(/^\/item\/(\d+)$/);
  if (!match) return;

  try {
    const res = await fetch(`https://csfloat.com/api/v1/listings/${match[1]}`, {
      credentials: "include",
    });
    if (!res.ok) return;
    const data = await res.json();
    const phase = getPhase(data?.item);
    const tier = getTier(data?.item);

    if (phase && tier) waitForDetail(phase, tier);
  } catch (e) {
    console.error("[MCB] handleItemPage error:", e);
  }
}

function waitForDetail(phase, tier) {
  let attempts = 0;
  const id = setInterval(() => {
    const container = Array.from(
      document.querySelectorAll(
        "mat-card .image app-item-image-actions .container.ng-star-inserted",
      ),
    ).find((c) => c.offsetWidth > 300);

    if (!container) {
      if (++attempts > 10) clearInterval(id);
      return;
    }

    clearInterval(id);
    injectDetailBadge(container, phase, tier);
  }, 300);
}
