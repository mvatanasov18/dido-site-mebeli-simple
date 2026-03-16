// OpenStreetMap location picker using Leaflet (no API key required).
// Geocoding via Nominatim (free, open-source).

(function () {
  function $(sel, root) {
    return (root || document).querySelector(sel);
  }
  function $all(sel, root) {
    return Array.from((root || document).querySelectorAll(sel));
  }
  function show(el) {
    if (el) el.hidden = false;
  }
  function hide(el) {
    if (el) el.hidden = true;
  }

  function setWarning(section, message) {
    var warning = $(".map-warning", section);
    if (!warning) return;
    warning.textContent = message;
    show(warning);
  }

  function clearWarning(section) {
    var warning = $(".map-warning", section);
    if (!warning) return;
    warning.textContent = "";
    hide(warning);
  }

  var leafletReady = false;
  var leafletLoading = false;
  var onReadyQueue = [];

  function loadLeaflet(cb) {
    if (leafletReady && window.L) {
      cb();
      return;
    }
    onReadyQueue.push(cb);
    if (leafletLoading) return;
    leafletLoading = true;

    var css = document.createElement("link");
    css.rel = "stylesheet";
    css.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    document.head.appendChild(css);

    var js = document.createElement("script");
    js.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    js.onload = function () {
      leafletReady = true;
      leafletLoading = false;
      onReadyQueue.splice(0).forEach(function (fn) {
        fn();
      });
    };
    js.onerror = function () {
      leafletLoading = false;
      onReadyQueue.splice(0).forEach(function (fn) {
        fn(new Error("load failed"));
      });
    };
    setTimeout(function () {
      if (!leafletReady && leafletLoading) {
        leafletLoading = false;
        onReadyQueue.splice(0).forEach(function (fn) {
          fn(new Error("timeout"));
        });
      }
    }, 12000);
    document.head.appendChild(js);
  }

  function reverseGeocode(lat, lng, cb) {
    fetch(
      "https://nominatim.openstreetmap.org/reverse?lat=" +
        lat +
        "&lon=" +
        lng +
        "&format=json&accept-language=bg"
    )
      .then(function (r) {
        return r.json();
      })
      .then(function (d) {
        cb(d.display_name || null);
      })
      .catch(function () {
        cb(null);
      });
  }

  function forwardGeocode(query, cb) {
    fetch(
      "https://nominatim.openstreetmap.org/search?q=" +
        encodeURIComponent(query) +
        "&format=json&countrycodes=bg&limit=1&accept-language=bg"
    )
      .then(function (r) {
        return r.json();
      })
      .then(function (results) {
        if (results && results.length) {
          cb(null, {
            lat: parseFloat(results[0].lat),
            lng: parseFloat(results[0].lon),
            name: results[0].display_name,
          });
        } else {
          cb(new Error("not found"));
        }
      })
      .catch(function () {
        cb(new Error("error"));
      });
  }

  function initPicker(section) {
    var radioText = $(".location-radio-text", section);
    var radioMap = $(".location-radio-map", section);
    var textWrap = $(".location-text-wrap", section);
    var mapWrap = $(".location-map-wrap", section);
    if (!radioText || !radioMap || !textWrap || !mapWrap) return;

    function applyMode(mode) {
      if (mode === "map") {
        hide(textWrap);
        show(mapWrap);
        var mc = $(".map-container", section);
        if (mc && mc.__leafletMap) {
          setTimeout(function () {
            mc.__leafletMap.invalidateSize();
          }, 150);
        }
      } else {
        show(textWrap);
        hide(mapWrap);
      }
    }

    radioText.addEventListener("change", function () {
      if (radioText.checked) applyMode("text");
    });
    radioMap.addEventListener("change", function () {
      if (radioMap.checked) {
        applyMode("map");
        ensureMap(section);
      }
    });

    applyMode(radioText.checked ? "text" : "map");
    if (radioMap.checked) ensureMap(section);
  }

  function ensureMap(section) {
    loadLeaflet(function (err) {
      if (err) {
        setWarning(
          section,
          "Картата не можа да се зареди. Моля, използвайте текстовото поле за адрес."
        );
        var rt = $(".location-radio-text", section);
        if (rt) {
          rt.checked = true;
          rt.dispatchEvent(new Event("change"));
        }
        return;
      }
      buildMap(section);
    });
  }

  function buildMap(section) {
    if (!window.L) return;
    var mapEl = $(".map-container", section);
    if (!mapEl || mapEl.getAttribute("data-init") === "1") return;
    mapEl.setAttribute("data-init", "1");

    var searchInput = $(".map-search", section);
    var searchBtn = $(".map-search-btn", section);
    var addrDisplay = $(".map-address-display", section);
    var hLat = $('input[name="Lat"]', section);
    var hLng = $('input[name="Lng"]', section);
    var hText = $('input[name="Локация (карта)"]', section);

    var center = [42.5048, 27.4626]; // Burgas
    var map = L.map(mapEl).setView(center, 12);
    mapEl.__leafletMap = map;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    var marker = L.marker(center, { draggable: true }).addTo(map);

    function update(lat, lng, label) {
      if (hLat) hLat.value = String(lat);
      if (hLng) hLng.value = String(lng);
      var txt =
        label ||
        "Избрана точка (" + lat.toFixed(5) + ", " + lng.toFixed(5) + ")";
      if (hText) hText.value = txt;
      if (addrDisplay) {
        addrDisplay.textContent = txt;
        show(addrDisplay);
      }
    }

    update(center[0], center[1], "Бургас (начална точка)");

    map.on("click", function (e) {
      marker.setLatLng(e.latlng);
      update(e.latlng.lat, e.latlng.lng);
      reverseGeocode(e.latlng.lat, e.latlng.lng, function (name) {
        if (name) update(e.latlng.lat, e.latlng.lng, name);
      });
    });

    marker.on("dragend", function () {
      var p = marker.getLatLng();
      update(p.lat, p.lng);
      reverseGeocode(p.lat, p.lng, function (name) {
        if (name) update(p.lat, p.lng, name);
      });
    });

    function doSearch() {
      if (!searchInput) return;
      var q = searchInput.value.trim();
      if (!q) return;
      clearWarning(section);
      forwardGeocode(q, function (err, result) {
        if (err) {
          setWarning(
            section,
            "Адресът не беше намерен. Опитайте с по-точен адрес или изберете точка на картата."
          );
          return;
        }
        var ll = L.latLng(result.lat, result.lng);
        map.setView(ll, 16);
        marker.setLatLng(ll);
        update(result.lat, result.lng, result.name);
      });
    }

    if (searchBtn) searchBtn.addEventListener("click", doSearch);
    if (searchInput)
      searchInput.addEventListener("keydown", function (e) {
        if (e.key === "Enter") {
          e.preventDefault();
          doSearch();
        }
      });

    setTimeout(function () {
      map.invalidateSize();
    }, 200);
  }

  document.addEventListener("DOMContentLoaded", function () {
    $all(".location-picker").forEach(initPicker);
  });
})();
