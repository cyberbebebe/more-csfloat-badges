"use strict";

let lastSalesPayload = null;

function processSales(payload) {
  lastSalesPayload = payload;

  // Clear previous row processing markers since it's a new payload
  document.querySelectorAll("tr.mat-mdc-row[data-mcb-processed]").forEach(row => {
    delete row.dataset.mcbProcessed;
  });

  setTimeout(() => tryProcessSales(), 150);
}

function tryProcessSales() {
  if (!lastSalesPayload) return;
  const sales = Array.isArray(lastSalesPayload) ? lastSalesPayload : lastSalesPayload?.data || [];
  if (sales.length === 0) return;

  // 1. Find sales table
  let anchorCells = document.querySelectorAll(
    "td.cdk-column-badges, td.mat-column-badges",
  );

  if (anchorCells.length === 0) {
    anchorCells = document.querySelectorAll(
      "td.cdk-column-stickers, td.mat-column-stickers",
    );
  }

  if (anchorCells.length === 0) {
    anchorCells = document.querySelectorAll("tr.mat-mdc-row td:first-child");
  }

  if (anchorCells.length === 0) return;

  const tbody = anchorCells[0].closest("tbody");
  if (!tbody) return;

  const table = tbody.closest("table");
  const headers = Array.from(
    table.querySelectorAll("thead tr.mat-mdc-header-row th"),
  );

  if (headers.length === 0) return;

  // Verify this is Latest Sales and not Pattern Sales
  const firstHeaderText = headers[0].textContent.trim();
  if (firstHeaderText !== "" && firstHeaderText !== "Action") return;

  let needsProcessing = false;
  if (!headers[0].dataset.mcbRenamedAction) needsProcessing = true;

  const rows = tbody.querySelectorAll("tr.mat-mdc-row");
  rows.forEach(row => {
    if (!row.dataset.mcbProcessed) needsProcessing = true;
  });

  if (!needsProcessing) return;

  let stickersColIdx = -1;
  let badgesColIdx = -1;

  headers.forEach((th, idx) => {
    if (th.className.includes("column-stickers")) stickersColIdx = idx;
    if (th.className.includes("column-badges")) badgesColIdx = idx;
  });

  // 2. Determine column roles
  const firstItem = sales[0]?.item;
  const itemName = firstItem?.item_name || "";
  const isKnifeOrGlove = itemName.includes("★");
  const isFade = itemName.includes("Fade") && !itemName.includes("Marble") && !itemName.includes("Gloves");
  const isCaseHardened = itemName.includes("Case Hardened");
  const hasSupportedItems = sales.some((sale) => {
    const item = sale?.item;
    return item && getPhase(item);
  });

  // Rename Action column
  if (headers[0] && !headers[0].textContent.trim() && !headers[0].dataset.mcbRenamedAction) {
    const span = headers[0].querySelector("span") || headers[0];
    span.textContent = "Action";
    headers[0].dataset.mcbRenamedAction = "true";
  }

  let targetColIdx = badgesColIdx;

  // If no native badges column found, try to find a nameless last column to use
  if (targetColIdx === -1) {
    const lastIdx = headers.length - 1;
    if (lastIdx > 0 && !headers[lastIdx].textContent.trim() && lastIdx !== stickersColIdx) {
      targetColIdx = lastIdx;
    }
  }

  // Fallback to stickers col if nothing else works
  if (targetColIdx === -1 && stickersColIdx !== -1) {
    targetColIdx = stickersColIdx;
  }

  // Determine target column name
  let colName = null;
  if (isCaseHardened) {
    colName = "Blue";
  } else if (isFade) {
    colName = "Fade";
  } else if (hasSupportedItems) {
    colName = "Tier";
  }

  // Rename our target column header
  if (targetColIdx !== -1 && colName) {
    const targetHeader = headers[targetColIdx];
    if (targetHeader && !targetHeader.dataset.mcbRenamed) {
      const span = targetHeader.querySelector("span") || targetHeader;
      span.textContent = colName;
      targetHeader.style.justifyContent = "center";
      targetHeader.style.textAlign = "center";
      targetHeader.dataset.mcbRenamed = "true";
    }
  }

  const isRepurposingStickers = (colName !== null && targetColIdx === stickersColIdx);

  // Hide stickers column if it's a knife/glove and we aren't using it for our badges
  if (stickersColIdx !== -1 && isKnifeOrGlove && !isRepurposingStickers) {
    if (headers[stickersColIdx]) headers[stickersColIdx].style.display = "none";
  }

  // 3. Inject badges
  rows.forEach((row, idx) => {
    const item = sales[idx]?.item;
    if (!item) return;

    const phase = getPhase(item);
    const tier = getTier(item);
    const cells = row.querySelectorAll("td");

    let targetCell = targetColIdx !== -1 ? cells[targetColIdx] : null;

    // Hide stickers cell if it's a knife/glove and we aren't using it for our badges
    if (stickersColIdx !== -1 && isKnifeOrGlove && !isRepurposingStickers) {
      if (cells[stickersColIdx]) cells[stickersColIdx].style.display = "none";
    }

    if (targetCell && targetColIdx === stickersColIdx && colName !== null) {
      if (!targetCell.dataset.mcbCleared) {
        targetCell.innerHTML = "";
        targetCell.dataset.mcbCleared = "true";
      }
    }

    if (targetCell) {
      // Create flex wrapper inside <td>
      let wrapper = targetCell.querySelector(".mcb-td-wrapper");
      if (!wrapper) {
        wrapper = document.createElement("div");
        wrapper.className = "mcb-td-wrapper";
        wrapper.style.display = "flex";
        wrapper.style.justifyContent = "center";
        wrapper.style.alignItems = "center";
        wrapper.style.gap = "6px";

        while (targetCell.firstChild) {
          wrapper.appendChild(targetCell.firstChild);
        }
        targetCell.appendChild(wrapper);

        // Fix display:flex for build-in Marble Fade badges
        const nativeContainers = wrapper.querySelectorAll(
          "app-item-badge .container",
        );
        nativeContainers.forEach((nc) => {
          nc.style.justifyContent = "center";
          nc.style.alignItems = "center";
        });
      }

      // Add badge
      if (phase && tier && !wrapper.querySelector(".mcb-badge")) {
        const badge = createBadge(phase, tier, false);
        wrapper.appendChild(badge);
      }
    }

    row.dataset.mcbProcessed = "true";
  });
}
