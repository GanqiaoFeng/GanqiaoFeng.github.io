/* =========================================================
   Guanqiao Feng — personal website
   Vanilla JavaScript: theme, navigation, scroll effects,
   typing animation and reveal-on-scroll. No dependencies.
   ========================================================= */

(function () {
  "use strict";

  var root = document.documentElement;
  var header = document.getElementById("siteHeader");
  var progress = document.getElementById("scrollProgress");
  var navToggle = document.getElementById("navToggle");
  var navMenu = document.getElementById("navMenu");
  var themeToggle = document.getElementById("themeToggle");
  var typedEl = document.getElementById("typedRole");
  var yearEl = document.getElementById("year");

  /* ---------- 1. Theme ---------- */
  var STORAGE_KEY = "gf-theme";

  function applyTheme(theme, persist) {
    root.setAttribute("data-theme", theme);
    if (persist !== false) {
      try { localStorage.setItem(STORAGE_KEY, theme); } catch (e) { /* private mode */ }
    }
    if (themeToggle) {
      themeToggle.setAttribute(
        "aria-label",
        theme === "dark" ? "Switch to light theme" : "Switch to dark theme"
      );
    }
  }

  var params = new URLSearchParams(window.location.search);
  var requestedTheme = params.get("theme"); /* optional override, e.g. ?theme=light */

  var stored = null;
  try { stored = localStorage.getItem(STORAGE_KEY); } catch (e) { stored = null; }

  if (requestedTheme === "light" || requestedTheme === "dark") {
    applyTheme(requestedTheme, false);
  } else if (stored === "light" || stored === "dark") {
    applyTheme(stored);
  } else if (window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches) {
    applyTheme("light");
  } else {
    applyTheme("dark");
  }

  if (themeToggle) {
    themeToggle.addEventListener("click", function () {
      applyTheme(root.getAttribute("data-theme") === "dark" ? "light" : "dark");
    });
  }

  /* ---------- 2. Header state + reading progress ---------- */
  function onScroll() {
    var y = window.scrollY || document.documentElement.scrollTop;
    if (header) header.classList.toggle("scrolled", y > 12);

    var doc = document.documentElement;
    var max = doc.scrollHeight - window.innerHeight;
    var pct = max > 0 ? (y / max) * 100 : 0;
    if (progress) progress.style.width = pct.toFixed(2) + "%";
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  onScroll();

  /* ---------- 3. Mobile navigation ---------- */
  function closeNav() {
    document.body.classList.remove("nav-open");
    if (navToggle) navToggle.setAttribute("aria-expanded", "false");
  }

  if (navToggle) {
    navToggle.addEventListener("click", function () {
      var open = document.body.classList.toggle("nav-open");
      navToggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  if (navMenu) {
    navMenu.addEventListener("click", function (event) {
      if (event.target.closest("a")) closeNav();
    });
  }

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") closeNav();
  });

  /* ---------- 4. Active nav link (scroll spy) ---------- */
  var sections = Array.prototype.slice.call(document.querySelectorAll("main section[id]"));
  var links = Array.prototype.slice.call(document.querySelectorAll(".nav-link"));

  function setActiveLink(id) {
    links.forEach(function (link) {
      link.classList.toggle("active", link.getAttribute("href") === "#" + id);
    });
  }

  if ("IntersectionObserver" in window && sections.length) {
    var spy = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) setActiveLink(entry.target.id);
        });
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
    );
    sections.forEach(function (section) { spy.observe(section); });
  }

  /* ---------- 5. Typing animation ---------- */
  var roles = [
    "Year 3 student · AIAT, XJTLU",
    "Networking & distributed systems",
    "Building things with Python",
    "Learning to measure, not guess"
  ];

  if (typedEl) {
    var roleIndex = 0;
    var charIndex = 0;
    var deleting = false;

    var typeLoop = function () {
      var current = roles[roleIndex];
      if (!deleting) {
        charIndex++;
        typedEl.textContent = current.slice(0, charIndex);
        if (charIndex === current.length) {
          deleting = true;
          return setTimeout(typeLoop, 1700);
        }
        return setTimeout(typeLoop, 55 + Math.random() * 45);
      }
      charIndex--;
      typedEl.textContent = current.slice(0, charIndex);
      if (charIndex === 0) {
        deleting = false;
        roleIndex = (roleIndex + 1) % roles.length;
        return setTimeout(typeLoop, 320);
      }
      return setTimeout(typeLoop, 26);
    };

    setTimeout(typeLoop, 550);
  }

  /* ---------- 6. Reveal on scroll + skill bars ---------- */
  var revealEls = Array.prototype.slice.call(document.querySelectorAll(".reveal"));

  revealEls.forEach(function (el, index) {
    el.style.setProperty("--reveal-delay", (index % 4) * 70 + "ms");
  });

  var fillBars = function () {
    document.querySelectorAll(".skill-bar").forEach(function (bar) {
      var level = parseInt(bar.getAttribute("data-level"), 10) || 0;
      var fill = bar.querySelector(".skill-fill");
      if (fill) fill.style.width = level + "%";
    });
  };

  if ("IntersectionObserver" in window) {
    var revealObserver = new IntersectionObserver(
      function (entries, observer) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.12 }
    );

    revealEls.forEach(function (el) { revealObserver.observe(el); });

    var skillsSection = document.getElementById("skills");
    if (skillsSection) {
      var skillsObserver = new IntersectionObserver(
        function (entries, observer) {
          entries.forEach(function (entry) {
            if (!entry.isIntersecting) return;
            fillBars();
            observer.unobserve(entry.target);
          });
        },
        { threshold: 0.25 }
      );
      skillsObserver.observe(skillsSection);
    } else {
      fillBars();
    }
  } else {
    revealEls.forEach(function (el) { el.classList.add("is-visible"); });
    fillBars();
  }

  /* ---------- 7. Small helpers ---------- */
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* Keep the page usable if a section link is opened directly. */
  window.addEventListener("load", function () {
    if (location.hash) {
      var target = document.querySelector(location.hash);
      if (target) setTimeout(function () { target.scrollIntoView(); }, 60);
    }
  });
})();
