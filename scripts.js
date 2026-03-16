document.addEventListener("DOMContentLoaded", function () {
  // Apply contact details from config (single place to edit)
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
    document.querySelectorAll("form[data-contact-form-email]").forEach(function (form) {
      form.action = "mailto:" + c.email;
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

