(function () {
"use strict";

const CONTACT_MAIL = "robertoverdeciasanchez@gmail.com";
const CONTACT_WA = "5356408532";

const {
  bindQuote,
  breakdownLines,
  formatUsd,
  isInterviewType,
  quoteMessage,
  priceUsd,
} = window.RVQuote;

const { initThemeLang } = window.RVLang;

function iconSun() {
  return `<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4 7 17M17 7l1.4-1.4"/></svg>`;
}
function iconMoon() {
  return `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 14.5A8.5 8.5 0 1 1 9.5 3 7 7 0 0 0 21 14.5z"/></svg>`;
}

function prefersReducedMotion() {
  return Boolean(window.matchMedia?.("(prefers-reduced-motion: reduce)").matches);
}

function renderBoard(listEl, quote, t) {
  listEl.replaceChildren();
  breakdownLines(quote, t).forEach(([label, value], index) => {
    const li = document.createElement("li");
    li.style.setProperty("--i", String(index));
    const k = document.createElement("span");
    const v = document.createElement("span");
    k.textContent = label;
    v.textContent = value;
    li.append(k, v);
    listEl.append(li);
  });
}

function updateThemeIcons() {
  const dark = document.body.classList.contains("theme-obsidian");
  document.querySelectorAll("[data-theme-toggle] .icon").forEach((el) => {
    el.innerHTML = dark ? iconSun() : iconMoon();
  });
}

function setMenuOpen(open) {
  const menu = document.getElementById("mobile-menu");
  const overlay = document.getElementById("menu-overlay");
  const burger = document.getElementById("menu-open");
  burger.setAttribute("aria-expanded", String(open));
  menu.hidden = !open;
  overlay.hidden = !open;
  document.body.classList.toggle("menu-open", open);
}

function initMenu() {
  const overlay = document.getElementById("menu-overlay");
  document.getElementById("menu-open").addEventListener("click", () => {
    setMenuOpen(document.getElementById("mobile-menu").hidden);
  });
  document.getElementById("menu-close").addEventListener("click", () => setMenuOpen(false));
  overlay.addEventListener("click", () => setMenuOpen(false));
  document.getElementById("mobile-menu").addEventListener("click", (e) => {
    if (e.target.closest("a")) setMenuOpen(false);
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") setMenuOpen(false);
  });
}

function waHref(text) {
  return `https://wa.me/${CONTACT_WA}?text=${encodeURIComponent(text)}`;
}

function pulseRange(el) {
  if (!el || prefersReducedMotion()) return;
  el.classList.remove("is-updating");
  void el.offsetWidth;
  el.classList.add("is-updating");
}

function chalkWrite(listEl) {
  if (!listEl || prefersReducedMotion()) return;
  listEl.classList.remove("is-writing");
  void listEl.offsetWidth;
  listEl.classList.add("is-writing");
}

const REVEAL_SELECTOR =
  "main section h2, main section .lede, .about-copy > p, .about-stats li, .panel, .work, .step, .care, #hosting .panel, .faq article, .quote-layout > *, .host-foot, .care-note, .contact-row";

function initMotion() {
  const hero = document.querySelector(".hero");
  if (hero) hero.classList.add("is-ready");

  const items = Array.from(document.querySelectorAll(REVEAL_SELECTOR)).filter(
    (el) => !el.closest("#quote")
  );

  if (prefersReducedMotion() || typeof IntersectionObserver === "undefined") {
    items.forEach((el) => el.classList.add("in"));
    return;
  }

  items.forEach((el) => {
    el.classList.add("reveal");
  });

  const groupDelay = (el) => {
    const siblings = Array.from(el.parentElement?.children || []).filter((n) =>
      n.classList.contains("reveal")
    );
    const idx = Math.max(0, siblings.indexOf(el));
    return Math.min(idx, 5) * 60;
  };

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        el.style.transitionDelay = `${groupDelay(el)}ms`;
        el.classList.add("in");
        io.unobserve(el);
      });
    },
    { rootMargin: "0px 0px -8% 0px", threshold: 0.12 }
  );

  items.forEach((el) => io.observe(el));
}

function formatPrice(price) {
  return `${formatUsd(price)} USD`;
}

function updatePriceDisplay(price) {
  if (!rangeEl) return;
  if (price == null) {
    rangeEl.textContent = t("quote_empty");
    return;
  }
  const next = formatPrice(price);
  if (rangeEl.textContent !== next) {
    rangeEl.textContent = next;
    pulseRange(rangeEl);
  }
}

function initSectionNav() {
  const scrollToQuote = () => {
    const section = document.getElementById("quote");
    if (!section) return;
    section.scrollIntoView({
      behavior: prefersReducedMotion() ? "auto" : "smooth",
      block: "start",
    });
  };

  document.querySelectorAll('a[href="#quote"]').forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      history.pushState(null, "", "#quote");
      scrollToQuote();
    });
  });

  window.addEventListener("hashchange", () => {
    if (location.hash === "#quote") scrollToQuote();
  });

  if (location.hash === "#quote") scrollToQuote();
}

let seoModalLevel = null;

function openSeoModal(level) {
  const modal = document.getElementById("seo-modal");
  const titleEl = document.getElementById("seo-modal-title");
  const bodyEl = document.getElementById("seo-modal-body");
  if (!modal || !titleEl || !bodyEl) return;
  seoModalLevel = level;
  titleEl.textContent = t(`q.seo.${level}`);
  bodyEl.textContent = t(`q.seo.${level}.modal`);
  modal.hidden = false;
  document.body.classList.add("modal-open");
  modal.querySelector(".site-modal-close")?.focus();
}

function closeSeoModal() {
  const modal = document.getElementById("seo-modal");
  if (!modal || modal.hidden) return;
  modal.hidden = true;
  document.body.classList.remove("modal-open");
  seoModalLevel = null;
}

function refreshSeoModalContent() {
  if (seoModalLevel) openSeoModal(seoModalLevel);
}

const { getLang, t } = initThemeLang({
  onLang: () => {
    updateThemeIcons();
    refreshSeoModalContent();
    document.getElementById("quote-form")?.dispatchEvent(new Event("input", { bubbles: true }));
  },
});

initMenu();
updateThemeIcons();

document.querySelectorAll("[data-theme-toggle]").forEach((btn) => {
  btn.addEventListener("click", () => requestAnimationFrame(updateThemeIcons));
});

const form = document.getElementById("quote-form");
const contactForm = document.getElementById("lead-form");
const board = document.getElementById("quote-board");
const totalEl = document.getElementById("quote-total");
const rangeEl = totalEl?.querySelector("[data-range]");
const noteEl = document.getElementById("quote-note");
const interviewNote = document.getElementById("quote-note-interview");
const interviewEl = document.getElementById("quote-interview");
const extras = document.getElementById("quote-extras");
const pagesField = document.getElementById("field-pages");
const imageCountField = document.getElementById("field-image-count");
const imageAdminHint = document.getElementById("image-admin-hint");
const imageAdminHintText = document.getElementById("image-admin-hint-text");
const imageAdminSwitch = document.getElementById("image-admin-switch");
const adminAdvancedInput = document.getElementById("admin-advanced-input");
const quoteWa = document.getElementById("quote-wa");
const boardWa = document.getElementById("board-wa");
const boardActions = document.getElementById("board-actions");
const boardSendWa = document.getElementById("board-send-wa");
const boardSendMail = document.getElementById("board-send-mail");

let lastQuote = null;

function currentBreakdownText() {
  return quoteMessage(lastQuote || {}, t, getLang());
}

function mailtoHref(quote) {
  const lang = getLang();
  const subject = lang === "en" ? "Website quote request" : "Solicitud de cotización de sitio";
  const body = quoteMessage(quote, t, lang);
  return `mailto:${CONTACT_MAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

function syncSendLinks(quote) {
  const href = waHref(quoteMessage(quote, t, getLang()));
  if (quoteWa) quoteWa.href = href;
  if (boardWa) boardWa.href = href;
  if (boardSendWa) boardSendWa.href = href;
  if (boardSendMail) boardSendMail.href = mailtoHref(quote);
}

function needsAdvancedForImages(quote) {
  return quote.images === "process" && quote.imageCount === "large";
}

function syncLargeImagesAdmin(quote) {
  const needs = needsAdvancedForImages(quote);
  const hasAdvanced = quote.admin === "advanced";
  const showHint = needs && !hasAdvanced;

  if (imageAdminHint) imageAdminHint.hidden = !showHint;
  if (imageAdminHintText && showHint) {
    imageAdminHintText.textContent = t("q.imageCount.large.admin");
  }
  if (imageAdminSwitch && showHint) {
    imageAdminSwitch.textContent = t("q.imageCount.large.admin_btn");
  }
}

if (form) {
  if (imageAdminSwitch && adminAdvancedInput) {
    imageAdminSwitch.addEventListener("click", () => {
      adminAdvancedInput.checked = true;
      form.dispatchEvent(new Event("input", { bubbles: true }));
      form.dispatchEvent(new Event("change", { bubbles: true }));
    });
  }

  bindQuote(form, {
    onChange(quote) {
      try {
        paintQuote(quote);
        syncLargeImagesAdmin(quote);
      } catch (err) {
        console.error("paintQuote failed:", err);
      }
    },
  });
}

function paintQuote(quote) {
  if (!board || !totalEl || !noteEl) return;

  lastQuote = quote;
  const interview = isInterviewType(quote.type);
  if (interviewEl) interviewEl.hidden = !interview;
  if (extras) extras.hidden = interview;
  totalEl.hidden = interview;
  if (boardWa) boardWa.hidden = !interview;
  if (boardActions) boardActions.hidden = interview;
  if (pagesField) pagesField.hidden = quote.type === "landing";
  if (imageCountField) imageCountField.hidden = quote.images !== "process";
  syncSendLinks(quote);

  if (interview) {
    board.replaceChildren();
    if (interviewNote) {
      interviewNote.hidden = false;
      interviewNote.textContent = t("quote_interview");
    }
    return;
  }

  if (interviewNote) interviewNote.hidden = true;

  const price = priceUsd(quote);
  renderBoard(board, quote, t);
  updatePriceDisplay(price);
  noteEl.textContent = t("quote_not_final");
}

if (contactForm) {
  contactForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const name = document.getElementById("lead-name").value.trim();
  const email = document.getElementById("lead-email").value.trim();
  const extra = document.getElementById("lead-message").value.trim();
  const lang = getLang();
  const subject = lang === "en" ? "Website quote request" : "Solicitud de cotización de sitio";
  const body = [
    lang === "en" ? `Name: ${name}` : `Nombre: ${name}`,
    lang === "en" ? `Email: ${email}` : `Correo: ${email}`,
    "",
    currentBreakdownText(),
    extra ? `\n${extra}` : "",
  ].join("\n");
  window.location.href = `mailto:${CONTACT_MAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  });
}

const waLink = document.getElementById("wa-link");
if (waLink) {
  waLink.addEventListener("click", (e) => {
    e.currentTarget.href = waHref(currentBreakdownText());
  });
}

function initToTop() {
  const btn = document.getElementById("to-top");
  if (!btn) return;
  const onScroll = () => {
    btn.hidden = window.scrollY < 520;
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
  btn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? "auto" : "smooth" });
  });
}

function initSeoModal() {
  const modal = document.getElementById("seo-modal");
  if (!modal) return;

  document.querySelectorAll(".seo-learn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      const level = btn.getAttribute("data-seo-level");
      if (level) openSeoModal(level);
    });
  });

  modal.querySelectorAll("[data-seo-modal-close]").forEach((el) => {
    el.addEventListener("click", () => closeSeoModal());
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !modal.hidden) closeSeoModal();
  });
}

initToTop();
initMotion();
initSectionNav();
initSeoModal();
window.RVWork?.initWorkGallery({ t });
})();
