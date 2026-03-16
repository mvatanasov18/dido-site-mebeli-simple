// Google Maps picker for contact forms (optional).
// Requires SITE_CONTACT.googleMapsApiKey to be set in config.js.

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
    var warning = $(".gmaps-warning", section);
    if (!warning) return;
    warning.textContent = message;
    show(warning);
  }

  function initToggle(section) {
    var radioText = $(".location-radio-text", section);
    var radioMap = $(".location-radio-map", section);
    var textWrap = $(".location-text-wrap", section);
    var mapWrap = $(".location-map-wrap", section);
    if (!radioText || !radioMap || !textWrap || !mapWrap) return;

    function applyMode(mode) {
      if (mode === "map") {
        hide(textWrap);
        show(mapWrap);
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
        ensureMapLoaded(section);
      }
    });

    applyMode(radioText.checked ? "text" : "map");
    if (radioMap.checked) ensureMapLoaded(section);
  }

  var googleMapsLoading = false;
  var googleMapsLoaded = false;
  var pendingSections = [];

  window.__initContactMap = function () {
    googleMapsLoaded = true;
    googleMapsLoading = false;
    pendingSections.splice(0).forEach(function (section) {
      tryInitMapInSection(section);
    });
  };

  function ensureMapLoaded(section) {
    if (googleMapsLoaded) {
      tryInitMapInSection(section);
      return;
    }

    pendingSections.push(section);

    if (googleMapsLoading) return;
    googleMapsLoading = true;

    var apiKey = window.SITE_CONTACT && window.SITE_CONTACT.googleMapsApiKey;
    if (!apiKey) {
      googleMapsLoading = false;
      setWarning(
        section,
        "Google Maps не е наличен (липсва API ключ). Моля, използвайте текстовото поле за локация."
      );
      // Force switch to text
      var radioText = $(".location-radio-text", section);
      if (radioText) radioText.checked = true;
      var textWrap = $(".location-text-wrap", section);
      var mapWrap = $(".location-map-wrap", section);
      show(textWrap);
      hide(mapWrap);
      return;
    }

    var script = document.createElement("script");
    script.async = true;
    script.defer = true;
    script.src =
      "https://maps.googleapis.com/maps/api/js?key=" +
      encodeURIComponent(apiKey) +
      "&libraries=places&callback=__initContactMap";

    script.onerror = function () {
      googleMapsLoading = false;
      googleMapsLoaded = false;
      pendingSections.splice(0).forEach(function (sec) {
        setWarning(
          sec,
          "Google Maps не можа да се зареди. Възможно е проблем с връзката/блокиране от разширение. Моля, използвайте текстовото поле."
        );
        var radioText = $(".location-radio-text", sec);
        if (radioText) radioText.checked = true;
        var textWrap = $(".location-text-wrap", sec);
        var mapWrap = $(".location-map-wrap", sec);
        show(textWrap);
        hide(mapWrap);
      });
    };

    // timeout fallback
    setTimeout(function () {
      if (googleMapsLoaded) return;
      script.onerror && script.onerror();
    }, 8000);

    document.head.appendChild(script);
  }

  function tryInitMapInSection(section) {
    if (!googleMapsLoaded || !window.google || !window.google.maps) return;
    var mapEl = $(".gmaps-map", section);
    var searchEl = $(".gmaps-search", section);
    var hiddenLat = $("input[name=\"Lat\"]", section);
    var hiddenLng = $("input[name=\"Lng\"]", section);
    var hiddenMapText = $("input[name=\"Локация (карта)\"]", section);
    if (!mapEl || !searchEl || !hiddenLat || !hiddenLng || !hiddenMapText) return;

    if (mapEl.getAttribute("data-map-initialized") === "1") return;
    mapEl.setAttribute("data-map-initialized", "1");

    var center = { lat: 42.5048, lng: 27.4626 }; // Burgas
    var map = new google.maps.Map(mapEl, {
      center: center,
      zoom: 12,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false
    });
    var marker = new google.maps.Marker({
      map: map,
      position: center,
      draggable: true
    });

    function updateFromLatLng(latLng, label) {
      var lat = typeof latLng.lat === "function" ? latLng.lat() : latLng.lat;
      var lng = typeof latLng.lng === "function" ? latLng.lng() : latLng.lng;
      hiddenLat.value = String(lat);
      hiddenLng.value = String(lng);
      hiddenMapText.value = label || "Избрана точка (" + lat.toFixed(6) + ", " + lng.toFixed(6) + ")";
    }

    updateFromLatLng(center, "Начална точка (Бургас)");

    map.addListener("click", function (e) {
      marker.setPosition(e.latLng);
      updateFromLatLng(e.latLng);
    });
    marker.addListener("dragend", function (e) {
      updateFromLatLng(e.latLng);
    });

    if (google.maps.places && google.maps.places.Autocomplete) {
      var autocomplete = new google.maps.places.Autocomplete(searchEl, {
        fields: ["geometry", "formatted_address", "name"],
        componentRestrictions: { country: ["bg"] }
      });
      autocomplete.addListener("place_changed", function () {
        var place = autocomplete.getPlace();
        if (!place || !place.geometry || !place.geometry.location) return;
        map.panTo(place.geometry.location);
        map.setZoom(15);
        marker.setPosition(place.geometry.location);
        var label =
          place.formatted_address || place.name || searchEl.value || "Избрана локация";
        updateFromLatLng(place.geometry.location, label);
      });
    } else {
      setWarning(
        section,
        "Търсенето в картата не е налично (Places). Можете да изберете точка с клик върху картата или да използвате текстовото поле."
      );
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    $all(".location-picker").forEach(initToggle);
  });
})();

