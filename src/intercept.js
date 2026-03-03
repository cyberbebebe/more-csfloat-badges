(function () {
  "use strict";

  console.log("[MoreCSFloatBadges] intercept.js loaded");

  const XHR = window.XMLHttpRequest.prototype;
  const originalOpen = XHR.open;
  const originalSend = XHR.send;

  XHR.open = function (method, url, ...rest) {
    this._mcbUrl = url;
    return originalOpen.call(this, method, url, ...rest);
  };

  XHR.send = function (...args) {
    this.addEventListener("load", () => {
      const url = this._mcbUrl || "";
      if (
        url.includes("/listings?") ||
        url.includes("/users") ||
        url.includes("/sales")
      ) {
        try {
          const resp = JSON.parse(this.responseText);

          if (url.includes("/listings?") || url.includes("/users")) {
            window.postMessage(
              {
                source: "MoreCSFloatBadges",
                type: "LISTINGS_DATA",
                payload: resp.data,
                isFirst: !url.includes("cursor="),
              },
              "*",
            );
          } else if (url.includes("/sales")) {
            window.postMessage(
              {
                source: "MoreCSFloatBadges",
                type: "SALES_DATA",
                payload: resp,
              },
              "*",
            );
          }
        } catch (e) {
          console.error("[MoreCSFloatBadges] XHR parse error:", e);
        }
      }
    });

    return originalSend.apply(this, args);
  };
  console.log("[MoreCSFloatBadges] Network interceptors active");
})();
