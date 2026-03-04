// Create image badge for Marble Fade knives
function createImgBadge(phase, tier, isDetail = false) {
  const wrap = document.createElement("div");
  wrap.className = isDetail ? "mcb-badge mcb-detail" : "mcb-badge";

  const img = document.createElement("img");
  img.src = chrome.runtime.getURL(`icons/${tier}.png`);
  img.height = isDetail ? 45 : 32;

  let tooltip = null;

  wrap.addEventListener("mouseenter", () => {
    tooltip = document.createElement("div");
    tooltip.className = "mcb-label";
    tooltip.textContent = phase.labels[tier];
    document.body.appendChild(tooltip);

    const rect = img.getBoundingClientRect();

    requestAnimationFrame(() => {
      if (!tooltip) return;

      const w = tooltip.offsetWidth;
      let left = rect.left + rect.width / 2 - w / 2;

      left = Math.min(left, window.innerWidth - w - 8);
      left = Math.max(left, 8);

      tooltip.style.left = `${left}px`;
      tooltip.style.top = `${rect.bottom + 8}px`;
      tooltip.style.opacity = "1";
    });
  });

  wrap.addEventListener("mouseleave", () => {
    if (tooltip) {
      tooltip.remove();
      tooltip = null;
    }
  });

  wrap.appendChild(img);
  return wrap;
}

function createFadeBadge(phase, tier, isDetail = false) {
  // 1 app-item-badge
  const wrap = document.createElement("app-item-badge");
  wrap.className = isDetail ? "mcb-badge mcb-detail" : "mcb-badge";

  // 2 container div
  const innerContainer = document.createElement("div");
  innerContainer.className = "container";

  // 3 badge div
  const badge = document.createElement("div");
  badge.className =
    "mat-mdc-tooltip-trigger badge fade ng-star-inserted mcb-fade-badge";

  // 4. text
  const span = document.createElement("span");
  span.textContent = tier.split("_")[0]; // fix for different patterns for 1 skin (maxcyan and maxgreen gamma p3)
  span.style.color = "#00000080";
  span.style.pointerEvents = "none";

  const fadeInfo = phase.badge?.fade_type?.[tier];
  let gradient =
    fadeInfo?.gradient ??
    "linear-gradient(to right, #d9bba5, #e5903b, #db5977, #6775e1)";
  gradient = gradient.replace("to right", "to top right");
  const position = fadeInfo?.position ?? "50%";

  badge.style.cssText = `
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
    font-size: 18px;
    padding: 2px;
    border-radius: 7px;
    min-width: 40px;
    height: 26px;
    background-image: ${gradient};
    background-size: 170%;
    background-position-x: ${position};
    box-sizing: border-box;
    transition: all .2s ease-in-out;
  `;

  badge.appendChild(span);
  innerContainer.appendChild(badge);
  wrap.appendChild(innerContainer);

  let tooltip = null;

  wrap.addEventListener("mouseenter", () => {
    if (tooltip) return;

    tooltip = document.createElement("div");
    tooltip.className = "mcb-label";
    tooltip.textContent = phase.labels[tier];
    document.body.appendChild(tooltip);

    const rect = badge.getBoundingClientRect();

    requestAnimationFrame(() => {
      if (!tooltip) return;
      const w = tooltip.offsetWidth || 150;
      let left = rect.left + rect.width / 2 - w / 2;
      left = Math.min(left, window.innerWidth - w - 8);
      left = Math.max(left, 8);

      tooltip.style.left = `${left}px`;
      tooltip.style.top = `${rect.bottom + 8}px`;
      tooltip.style.opacity = "1";
    });
  });

  wrap.addEventListener("mouseleave", () => {
    if (tooltip) {
      tooltip.style.opacity = "0";
      const currentTooltip = tooltip;
      tooltip = null;
      setTimeout(() => currentTooltip.remove(), 200);
    }
  });

  return wrap;
}

function createBadge(phase, tier, isDetail = false) {
  if (phase.badge.type === "img") {
    return createImgBadge(phase, tier, isDetail);
  }
  return createFadeBadge(phase, tier, isDetail);
}
