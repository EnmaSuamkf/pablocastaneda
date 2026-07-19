/* ─── Bilingual EN/ES toggle ────────────────────────────────────
 *
 * How it works:
 *  - Each page wraps language-specific content in elements carrying
 *    lang="en" / lang="es". Both copies live in the same DOM.
 *  - This script shows the active language copy and hides the other
 *    using the [hidden] attribute.
 *  - The active language is persisted in localStorage under "lang"
 *    and defaults to "en".
 *  - A segmented control EN | ES is auto-rendered inside any element
 *    with id="lang-toggle" (or created in the nav when data-lang-toggle
 *    is present on the nav element).
 *
 * Page integration:
 *  - <html lang="en" data-title-en="..." data-title-es="...">
 *  - add <div id="lang-toggle"></div> wherever the control should live
 *  - wrap text that differs per language in <... lang="en"> / <... lang="es">
 *  - include this script with <script src="assets/i18n.js" defer></script>
 *    (or ../assets/i18n.js from subfolders)
 * ------------------------------------------------------------------ */

(function () {
  "use strict";

  var SUPPORTED = ["en", "es"];
  var DEFAULT_LANG = "en";
  var STORAGE_KEY = "lang";

  function storedLang() {
    try {
      var v = localStorage.getItem(STORAGE_KEY);
      if (v && SUPPORTED.indexOf(v) !== -1) return v;
    } catch (e) {}
    return DEFAULT_LANG;
  }

  function applyLang(lang) {
    if (SUPPORTED.indexOf(lang) === -1) lang = DEFAULT_LANG;

    // <html lang="...">
    document.documentElement.lang = lang;

    // document.title from data-title-<lang> on <html>
    var titleAttr = "data-title-" + lang;
    var t = document.documentElement.getAttribute(titleAttr);
    if (t) document.title = t;

    // Toggle visibility of [lang="en"] / [lang="es"] blocks.
    // Skip the <html> element itself.
    var nodes = document.querySelectorAll('[lang="en"],[lang="es"]');
    for (var i = 0; i < nodes.length; i++) {
      var el = nodes[i];
      if (el === document.documentElement) continue;
      var elLang = el.getAttribute("lang");
      if (elLang === lang) {
        el.removeAttribute("hidden");
        el.style.display = "";
      } else if (SUPPORTED.indexOf(elLang) !== -1) {
        el.setAttribute("hidden", "");
        el.style.display = "none";
      }
    }

    // Update active state on every lang control
    var ctrls = document.querySelectorAll(".lang-toggle");
    for (var c = 0; c < ctrls.length; c++) {
      var btns = ctrls[c].querySelectorAll(".lang-toggle-btn");
      for (var b = 0; b < btns.length; b++) {
        var on = btns[b].getAttribute("data-lang") === lang;
        btns[b].classList.toggle("active", on);
        btns[b].setAttribute("aria-pressed", on ? "true" : "false");
      }
    }

    // Persist
    try { localStorage.setItem(STORAGE_KEY, lang); } catch (e) {}

    // Notify sliders / other widgets to recompute layout now that a
    // previously hidden block is visible.
    window.dispatchEvent(new Event("langchange"));
    window.dispatchEvent(new Event("resize"));
  }

  function buildToggle(host) {
    if (!host) return;
    if (host.querySelector(".lang-toggle")) return;
    var wrap = document.createElement("div");
    wrap.className = "lang-toggle";
    wrap.setAttribute("role", "group");
    wrap.setAttribute("aria-label", "Language");

    function mkBtn(lang, label) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "lang-toggle-btn";
      btn.setAttribute("data-lang", lang);
      btn.setAttribute("aria-pressed", "false");
      btn.textContent = label;
      btn.addEventListener("click", function () { applyLang(lang); });
      return btn;
    }

    wrap.appendChild(mkBtn("en", "EN"));
    wrap.appendChild(mkBtn("es", "ES"));
    host.appendChild(wrap);
  }

  function init() {
    // Build controls in every host
    var hosts = document.querySelectorAll("#lang-toggle, [data-lang-toggle]");
    for (var i = 0; i < hosts.length; i++) buildToggle(hosts[i]);

    // Apply persisted language (or default)
    applyLang(storedLang());
  }

  // Run as soon as DOM is parsed; the script is loaded with `defer`
  // so the DOM is ready, but guard just in case.
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  // Expose for debugging / programmatic switching
  window.setLang = applyLang;
  window.getLang = function () { return storedLang(); };
})();
