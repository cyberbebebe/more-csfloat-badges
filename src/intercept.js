(function () {
  "use strict";

  console.log("[MoreCSFloatBadges] intercept.js running");

  const OriginalXHR = window.XMLHttpRequest;

  // wrap XMLHttpRequest to intercept /api/v1/listings, /stall and /sales responses
  function PatchedXHR() {
    const xhr = new OriginalXHR();
    const _open = xhr.open.bind(xhr);
    const _send = xhr.send.bind(xhr);
    let _url = "";

    xhr.open = function (method, url, ...rest) {
      _url = url;
      return _open(method, url, ...rest);
    };

    xhr.send = function (...args) {
      if (_url.includes("/api/v1/listings") || _url.includes("/stall")) {
        xhr.addEventListener("load", function () {
          try {
            const data = JSON.parse(xhr.responseText);
            if (Array.isArray(data?.data)) {
              const isFirstPage = !new URL(
                _url,
                location.origin,
              ).searchParams.has("cursor");
              window.postMessage(
                {
                  source: "CSFloatPatternBadge",
                  type: "LISTINGS_DATA",
                  payload: data.data,
                  cursor: data.cursor ?? null,
                  isFirstPage: isFirstPage,
                },
                "*",
              );
            }
          } catch (e) {
            console.error("[MoreCSFloatBadges] XHR parse error:", e);
          }
        });
      }

      if (_url.includes("/sales")) {
        xhr.addEventListener("load", function () {
          try {
            const data = JSON.parse(xhr.responseText);
            // decode item name from URL: /api/v1/history/<name>/sales
            const match = _url.match(/\/history\/(.+?)\/sales/);
            if (!match) return;
            const itemName = decodeURIComponent(match[1]);
            const cleanName = itemName.replace(/\s*\([^)]+\)$/, "");
            const sales = Array.isArray(data) ? data : data?.data;
            if (!Array.isArray(sales)) return;
            window.postMessage(
              {
                source: "CSFloatPatternBadge",
                type: "SALES_DATA",
                itemName: cleanName,
                payload: sales,
              },
              "*",
            );
          } catch (e) {
            console.error("[MoreCSFloatBadges] XHR sales parse error:", e);
          }
        });
      }

      return _send(...args);
    };

    return xhr;
  }

  Object.setPrototypeOf(PatchedXHR, OriginalXHR);
  PatchedXHR.prototype = OriginalXHR.prototype;
  Object.defineProperties(
    PatchedXHR,
    Object.getOwnPropertyDescriptors(OriginalXHR),
  );

  window.XMLHttpRequest = PatchedXHR;
})();
