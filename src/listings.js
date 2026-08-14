function processListings(data, isFirst) {
  if (isFirst) {
    listingsQueue.length = 0;
  }
  listingsQueue.push(...data);

  setTimeout(() => tryProcess(), 50);
}

function findMatchingItem(cardText, queue) {
  for (const obj of queue) {
    const item = obj.item || obj;
    if (!item) continue;

    let isMatch = false;

    if (item.float_value) {
      const floatStr = item.float_value.toString().substring(0, 10);
      isMatch = cardText.includes(floatStr);
      if (isMatch && item.paint_seed !== undefined) {
        isMatch = cardText.includes(item.paint_seed.toString());
      }
    } else if (item.paint_seed !== undefined) {
      isMatch = cardText.includes(item.paint_seed.toString());
    }

    if (isMatch) return item;
  }
  return null;
}

function tryProcess() {
  const cards = document.querySelectorAll("item-card");
  
  for (const card of cards) {
    const text = card.textContent || "";
    if (text.trim() === "") continue;

    if (card.dataset.mcbMatchedFloat && text.includes(card.dataset.mcbMatchedFloat)) {
      continue;
    }

    const item = findMatchingItem(text, listingsQueue);
    if (!item) continue;

    const floatStr = item.float_value ? item.float_value.toString().substring(0, 10) : item.paint_seed.toString();
    card.dataset.mcbMatchedFloat = floatStr;

    const phase = getPhase(item);
    const tier = getTier(item);

    if (phase && tier) {
      injectListingBadge(card, phase, tier);
    }
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
