function injectListingBadge(cardEl, phase, tier) {
  if (cardEl.querySelector(".mcb-badge")) return;

  const mainContainer = cardEl.querySelector("app-item-image-actions > div");
  if (!mainContainer) return;

  const badgeElement = createBadge(phase, tier, false);

  // If native badge already here
  const nativeContainer = mainContainer.querySelector(".badge-container");

  if (nativeContainer) {
    // A: there IS native badge container
    badgeElement.style.marginLeft = "6px";
    nativeContainer.style.display = "flex";
    nativeContainer.style.alignItems = "center";
    nativeContainer.appendChild(badgeElement);
  } else {
    // B: there is NO native badge container
    let wrapper = mainContainer.querySelector(".mcb-badge-wrapper");
    if (!wrapper) {
      wrapper = document.createElement("div");
      wrapper.className = "mcb-badge-wrapper";
      wrapper.style.position = "absolute";
      wrapper.style.top = "5px";
      wrapper.style.left = "5px";
      wrapper.style.zIndex = "20";
      wrapper.style.display = "flex";

      if (getComputedStyle(mainContainer).position === "static") {
        mainContainer.style.position = "relative";
      }
      mainContainer.appendChild(wrapper);
    }
    wrapper.appendChild(badgeElement);
  }
}

function injectDetailBadge(container, phase, tier) {
  const doInject = () => {
    if (container.querySelector(".mcb-badge")) return;

    const badgeElement = createBadge(phase, tier, true);
    const nativeContainer = container.querySelector(".badge-container");

    if (nativeContainer) {
      badgeElement.style.marginLeft = "8px";
      nativeContainer.style.display = "flex";
      nativeContainer.style.alignItems = "center";
      nativeContainer.appendChild(badgeElement);
    } else {
      let wrapper = container.querySelector(".mcb-badge-wrapper");
      if (!wrapper) {
        wrapper = document.createElement("div");
        wrapper.className = "mcb-badge-wrapper";
        wrapper.style.position = "absolute";
        wrapper.style.top = "5px";
        wrapper.style.left = "5px";
        wrapper.style.zIndex = "20";
        wrapper.style.display = "flex";

        if (getComputedStyle(container).position === "static") {
          container.style.position = "relative";
        }
        container.appendChild(wrapper);
      }
      wrapper.appendChild(badgeElement);
    }
  };

  doInject();

  new MutationObserver(() => {
    doInject();
  }).observe(container, { childList: true, subtree: true });
}

function injectSalesBadge(td, phase, tier) {
  if (td.querySelector(".mcb-badge")) return;

  const badge = createBadge(phase, tier, false);

  badge.style.display = "inline-flex";
  badge.style.verticalAlign = "middle";

  td.appendChild(badge);
}
