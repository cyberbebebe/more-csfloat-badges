"use strict";

function processSales(payload) {
  const sales = Array.isArray(payload) ? payload : payload?.data || [];
  if (sales.length === 0) return;

  const hasSupportedItems = sales.some((sale) => {
    const item = sale?.item;
    return item && getPhase(item);
  });

  if (!hasSupportedItems) return;

  let attempts = 0;
  const id = setInterval(() => {
    // 1. Find sales table
    let anchorCells = document.querySelectorAll(
      "td.cdk-column-badges, td.mat-column-badges",
    );
    const hasBadgesColumn = anchorCells.length > 0;

    if (!hasBadgesColumn) {
      anchorCells = document.querySelectorAll(
        "td.cdk-column-stickers, td.mat-column-stickers",
      );
    }

    if (anchorCells.length === 0) {
      if (++attempts > 20) clearInterval(id);
      return;
    }

    clearInterval(id); // Table ready

    const tbody = anchorCells[0].closest("tbody");
    if (!tbody) return;
    const rows = tbody.querySelectorAll("tr.mat-mdc-row");

    // Find headers
    const table = tbody.closest("table");
    const headers = Array.from(
      table.querySelectorAll("thead tr.mat-mdc-header-row th"),
    );

    let stickersColIdx = -1;
    let badgesColIdx = -1;

    headers.forEach((th, idx) => {
      if (th.className.includes("column-stickers")) stickersColIdx = idx;
      if (th.className.includes("column-badges")) badgesColIdx = idx;
    });

    // 2. Rename column titles
    if (badgesColIdx !== -1) {
      const badgesHeader = headers[badgesColIdx];
      if (badgesHeader && !badgesHeader.dataset.mcbRenamed) {
        const span = badgesHeader.querySelector("span") || badgesHeader;
        span.textContent = "Tier";
        badgesHeader.style.justifyContent = "center";
        badgesHeader.style.textAlign = "center";
        badgesHeader.dataset.mcbRenamed = "true";
      }
      if (stickersColIdx !== -1 && headers[stickersColIdx]) {
        headers[stickersColIdx].style.display = "none";
      }
    } else if (stickersColIdx !== -1) {
      const stickersHeader = headers[stickersColIdx];
      if (stickersHeader && !stickersHeader.dataset.mcbRenamed) {
        const span = stickersHeader.querySelector("span") || stickersHeader;
        span.textContent = "Tier";
        stickersHeader.style.justifyContent = "center";
        stickersHeader.style.textAlign = "center";
        stickersHeader.dataset.mcbRenamed = "true";
      }
    }

    // 3. Inject badges
    rows.forEach((row, idx) => {
      const item = sales[idx]?.item;
      if (!item) return;

      const phase = getPhase(item);
      const tier = getTier(item);
      const cells = row.querySelectorAll("td");

      let targetCell = null;

      if (badgesColIdx !== -1) {
        if (cells[stickersColIdx]) cells[stickersColIdx].style.display = "none";
        targetCell = cells[badgesColIdx];
      } else if (stickersColIdx !== -1) {
        targetCell = cells[stickersColIdx];
        if (targetCell && !targetCell.dataset.mcbCleared) {
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
    });
  }, 300);
}
