function injectListingBadge(cardEl, phase, tier) {
  if (cardEl.querySelector(".mcb-badge")) return;

  const mainContainer = cardEl.querySelector(
    "app-item-image-actions .container.ng-star-inserted",
  );
  if (!mainContainer) return;

  let badgeContainer = mainContainer.querySelector(".badge-container");

  if (!badgeContainer) {
    badgeContainer = document.createElement("div");
    badgeContainer.className =
      "badge-container ng-star-inserted mcb-badge-container";
    badgeContainer.style.position = "absolute";
    badgeContainer.style.top = "5px";
    badgeContainer.style.left = "5px";
    badgeContainer.style.zIndex = "20";
    badgeContainer.style.display = "flex";

    if (getComputedStyle(mainContainer).position === "static") {
      mainContainer.style.position = "relative";
    }
    mainContainer.appendChild(badgeContainer);
  }

  const badgeElement = createBadge(phase, tier, false);
  badgeContainer.appendChild(badgeElement);
}

function injectDetailBadge(container, phase, tier) {
  const doInject = () => {
    if (container.querySelector(".mcb-badge")) return;

    let badgeContainer = container.querySelector(".badge-container");

    if (!badgeContainer) {
      badgeContainer = document.createElement("div");
      badgeContainer.className =
        "badge-container ng-star-inserted mcb-badge-container";
      badgeContainer.style.position = "absolute";
      badgeContainer.style.top = "5px";
      badgeContainer.style.left = "5px";
      badgeContainer.style.zIndex = "20";
      badgeContainer.style.display = "flex";

      if (getComputedStyle(container).position === "static") {
        container.style.position = "relative";
      }
      container.appendChild(badgeContainer);
    }

    badgeContainer.appendChild(createBadge(phase, tier, true));
  };

  doInject();

  new MutationObserver(() => {
    doInject();
  }).observe(container, { childList: true });
}

function injectSalesBadge(td, phase, tier) {
  if (td.querySelector(".mcb-badge")) return;

  const badge = createBadge(phase, tier, false);

  badge.style.display = "inline-flex";
  badge.style.verticalAlign = "middle";

  td.appendChild(badge);
}
