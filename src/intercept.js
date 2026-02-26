(function () {
  "use strict";

  console.log("[CFPB] intercept.js running");

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
              console.log(
                "[CFPB] XHR listings/stall caught, items:",
                data.data.length,
              );
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
            console.error("[CFPB] XHR parse error:", e);
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
            // strip wear from market_hash_name to get item_name
            // e.g. "★ Flip Knife | Marble Fade (Factory New)" → "★ Flip Knife | Marble Fade"
            const cleanName = itemName.replace(/\s*\([^)]+\)$/, "");
            const sales = Array.isArray(data) ? data : data?.data;
            if (!Array.isArray(sales)) return;
            console.log(
              "[CFPB] XHR sales caught:",
              cleanName,
              "items:",
              sales.length,
            );
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
            console.error("[CFPB] XHR sales parse error:", e);
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
  console.log("[CFPB] XHR wrapped successfully");
})();
