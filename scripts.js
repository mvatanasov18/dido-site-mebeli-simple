document.addEventListener("DOMContentLoaded", function () {
  // Apply contact details from config
  if (window.SITE_CONTACT) {
    var c = window.SITE_CONTACT;
    document.querySelectorAll("[data-contact-phone]").forEach(function (el) {
      el.href = "tel:" + c.phone;
      el.textContent = c.phoneDisplay;
    });
    document.querySelectorAll("[data-contact-call]").forEach(function (el) {
      el.href = "tel:" + c.phone;
    });
    document.querySelectorAll("[data-contact-email]").forEach(function (el) {
      el.href = "mailto:" + c.email;
      el.textContent = c.email;
    });
    var ldJson = document.getElementById("site-ld-json");
    if (ldJson && ldJson.textContent) {
      try {
        var data = JSON.parse(ldJson.textContent);
        if (data.telephone !== c.phone) {
          data.telephone = c.phone;
          ldJson.textContent = JSON.stringify(data);
        }
      } catch (e) {}
    }
  }

  // Contact form submission via Formsubmit.co (AJAX, no mail app)
  document
    .querySelectorAll("form[data-contact-form]")
    .forEach(function (form) {
      form.addEventListener("submit", function (e) {
        e.preventDefault();

        var statusEl = form.querySelector(".form-status");
        var submitBtn = form.querySelector('button[type="submit"]');

        var name = (form.querySelector('[name="Име"]') || {}).value || "";
        var phone = (form.querySelector('[name="Телефон"]') || {}).value || "";
        var message =
          (form.querySelector('[name="Съобщение"]') || {}).value || "";

        var locationText = "";
        var mapsLink = "";
        var radioMap = form.querySelector(".location-radio-map");
        if (radioMap && radioMap.checked) {
          var mapEl = form.querySelector('[name="Локация (карта)"]');
          locationText = mapEl ? mapEl.value : "";
          var lat = (form.querySelector('[name="Lat"]') || {}).value;
          var lng = (form.querySelector('[name="Lng"]') || {}).value;
          if (lat && lng) {
            mapsLink = "https://www.google.com/maps?q=" + lat + "," + lng;
          }
        } else {
          var textEl = form.querySelector('[name="Населено място"]');
          locationText = textEl ? textEl.value : "";
          if (locationText) {
            mapsLink =
              "https://www.google.com/maps/search/?api=1&query=" +
              encodeURIComponent(locationText);
          }
        }

        submitBtn.disabled = true;
        submitBtn.textContent = "Изпращане...";
        if (statusEl) {
          statusEl.textContent = "";
          statusEl.hidden = true;
        }

        var email =
          (window.SITE_CONTACT && window.SITE_CONTACT.email) ||
          "contact@example.com";

        fetch("https://formsubmit.co/ajax/" + encodeURIComponent(email), {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            _subject: "Ново запитване от сайта – Монтаж Мебели Бургас",
            _template: "table",
            _captcha: "false",
            "Име": name,
            "Телефон": phone,
            "Локация": locationText,
            "Google Maps линк": mapsLink || "–",
            "Съобщение": message,
          }),
        })
          .then(function (res) {
            return res.json();
          })
          .then(function (data) {
            if (data.success === "true" || data.success === true) {
              if (statusEl) {
                statusEl.textContent =
                  "Запитването беше изпратено успешно! Ще се свържем с вас скоро.";
                statusEl.className = "form-status form-status-success";
                statusEl.hidden = false;
              }
              form.reset();
              var radioText = form.querySelector(".location-radio-text");
              if (radioText) radioText.dispatchEvent(new Event("change"));
            } else {
              throw new Error("fail");
            }
          })
          .catch(function () {
            if (statusEl) {
              statusEl.textContent =
                "Грешка при изпращането. Моля, опитайте отново или ни се обадете по телефон.";
              statusEl.className = "form-status form-status-error";
              statusEl.hidden = false;
            }
          })
          .finally(function () {
            submitBtn.disabled = false;
            submitBtn.textContent = "Изпрати запитване";
          });
      });
    });

  // Mobile navigation toggle
  const navToggle = document.querySelector(".nav-toggle");
  const mainNav = document.querySelector(".main-nav");

  if (navToggle && mainNav) {
    navToggle.addEventListener("click", () => {
      mainNav.classList.toggle("open");
    });
  }

  // Smooth scroll for anchor links on the index page
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      const targetId = this.getAttribute("href")?.substring(1);
      const target = targetId ? document.getElementById(targetId) : null;
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: "smooth", block: "start" });
        if (mainNav && mainNav.classList.contains("open")) {
          mainNav.classList.remove("open");
        }
      }
    });
  });

  // FAQ accordion
  document.querySelectorAll(".faq-item").forEach((item) => {
    const button = item.querySelector(".faq-question");
    if (!button) return;
    button.addEventListener("click", () => {
      const isOpen = item.classList.contains("open");
      document.querySelectorAll(".faq-item.open").forEach((openItem) => {
        if (openItem !== item) {
          openItem.classList.remove("open");
          const answer = openItem.querySelector(".faq-answer");
          if (answer) {
            answer.style.maxHeight = "0px";
          }
        }
      });

      const answer = item.querySelector(".faq-answer");
      if (!answer) return;

      if (isOpen) {
        item.classList.remove("open");
        answer.style.maxHeight = "0px";
      } else {
        item.classList.add("open");
        answer.style.maxHeight = answer.scrollHeight + "px";
      }
    });
  });

  // Dynamic year in footer
  const yearSpan = document.getElementById("year");
  if (yearSpan) {
    yearSpan.textContent = new Date().getFullYear().toString();
  }
});
