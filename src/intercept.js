(function () {
  "use strict";

  console.log("[MCB] intercept.js running");

  const OriginalXHR = window.XMLHttpRequest;

  // wrap XMLHttpRequest to intercept /api/v1/listings responses
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
      if (_url.includes("/api/v1/listings")) {
        xhr.addEventListener("load", function () {
          try {
            const data = JSON.parse(xhr.responseText);
            if (Array.isArray(data?.data)) {
              const isFirstPage = !new URL(
                _url,
                location.origin,
              ).searchParams.has("cursor");
              console.log(
                "[MCB] XHR listings caught, items:",
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
            console.error("[MCB] XHR parse error:", e);
          }
        });
      }
      return _send(...args);
    };

    return xhr;
  }

  // copy static properties from original XHR
  Object.setPrototypeOf(PatchedXHR, OriginalXHR);
  PatchedXHR.prototype = OriginalXHR.prototype;
  Object.defineProperties(
    PatchedXHR,
    Object.getOwnPropertyDescriptors(OriginalXHR),
  );

  window.XMLHttpRequest = PatchedXHR;
  console.log("[MCB] XHR wrapped successfully");
})();
