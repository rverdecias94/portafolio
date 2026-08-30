/**
 * Cotizador: estimado redondeado (intervalos de $50), no precio final.
 * Dominio y hosting no entran en el número.
 */

const QUOTE_RATES = {
  forms: { none: 0, contact: 20, multi: 50 },
  admin: { none: 0, basic: 80, advanced: 180 },
  seo: { none: 0, basic: 20, local: 50, advanced: 100 },
  designScratch: 50,
  identityCreate: 50,
  dualTheme: 10,
  multilingual: 10,
  images: 20,
};

/** Página de contacto o promoción: una sola página enfocada (por debajo de un sitio de 3 páginas) */
const LANDING_SUBTOTAL_USD = 120;

/** Precio base por tamaño de sitio web (antes de addons y redondeo) */
const PAGE_TIER_USD = {
  one: 120,
  basic: 220,
  standard: 340,
  wide: 480,
};

const DEFAULT_QUOTE = {
  type: "web",
  pages: "basic",
  forms: "contact",
  admin: "none",
  seo: "basic",
  design: "preset",
  identity: "defined",
  theme: "light",
  languages: "one",
  images: "process",
  maintenance: "light",
};

function isInterviewType(type) {
  return type === "system" || type === "shop";
}

function roundUpTo50(amount) {
  return Math.ceil(amount / 50) * 50;
}

function siteSubtotalUsd(q) {
  if (q.type === "landing") return LANDING_SUBTOTAL_USD;
  return PAGE_TIER_USD[q.pages] ?? PAGE_TIER_USD.basic;
}

function rawTotalUsd(input) {
  const q = { ...DEFAULT_QUOTE, ...input };
  if (isInterviewType(q.type)) return null;

  const imagesFee = q.images === "process" ? QUOTE_RATES.images : 0;

  return (
    siteSubtotalUsd(q) +
    (QUOTE_RATES.forms[q.forms] ?? 0) +
    (QUOTE_RATES.admin[q.admin] ?? 0) +
    (QUOTE_RATES.seo[q.seo] ?? 0) +
    (q.design === "scratch" ? QUOTE_RATES.designScratch : 0) +
    (q.identity === "create" ? QUOTE_RATES.identityCreate : 0) +
    (q.theme === "both" ? QUOTE_RATES.dualTheme : 0) +
    (q.languages === "multi" ? QUOTE_RATES.multilingual : 0) +
    imagesFee
  );
}

function priceUsd(input) {
  const raw = rawTotalUsd(input);
  if (raw == null) return null;
  return roundUpTo50(raw);
}

/** @deprecated Usar priceUsd; mantiene compatibilidad temporal */
function rangeUsd(input) {
  const price = priceUsd(input);
  if (price == null) return null;
  return { mid: price, low: price, high: price };
}

function midpointUsd(input) {
  return priceUsd(input);
}

function readQuoteForm(form) {
  const get = (name) => {
    const el = form.elements.namedItem(name);
    if (!el) return undefined;
    if (typeof RadioNodeList !== "undefined" && el instanceof RadioNodeList) return el.value;
    if (el.type === "checkbox") return el.checked;
    return el.value;
  };

  return {
    type: get("type") || "web",
    pages: get("pages") || "basic",
    forms: get("forms") || "contact",
    admin: get("admin") || "none",
    seo: get("seo") || "basic",
    design: get("design") || "preset",
    identity: get("identity") || "defined",
    theme: get("theme") || "light",
    languages: get("languages") || "one",
    images: get("images") || "process",
    maintenance: get("maintenance") || "light",
  };
}

function breakdownLines(input, t) {
  const q = { ...DEFAULT_QUOTE, ...input };
  const pagesLabel =
    q.type === "landing" ? t("q.landingOnly") : t(`q.pages.${q.pages}`);
  return [
    [t("q.type"), t(`q.type.${q.type}`)],
    [t("q.pages"), pagesLabel],
    [t("q.forms"), t(`q.forms.${q.forms}`)],
    [t("q.admin"), t(`q.admin.${q.admin}`)],
    [t("q.seo"), t(`q.seo.${q.seo}`)],
    [t("q.design"), t(`q.design.${q.design}`)],
    [t("q.identity"), t(`q.identity.${q.identity}`)],
    [t("q.theme"), t(`q.theme.${q.theme}`)],
    [t("q.languages"), t(`q.languages.${q.languages}`)],
    [t("q.images"), t(`q.images.${q.images}`)],
    [t("q.maintenance"), t(`q.maintenance.${q.maintenance}`)],
  ];
}

function formatUsd(n) {
  return `$${Number(n).toLocaleString("en-US")}`;
}

function quoteMessage(input, t, lang) {
  const q = { ...DEFAULT_QUOTE, ...input };
  const header =
    lang === "en"
      ? "Hi Roberto, here is my website quote:"
      : "Hola Roberto, esta es mi cotización de sitio web:";
  const lines = breakdownLines(q, t)
    .map(([k, v]) => `• ${k}: ${v}`)
    .join("\n");

  if (isInterviewType(q.type)) {
    const kind =
      q.type === "shop"
        ? lang === "en" ? "online store" : "tienda online"
        : lang === "en" ? "CRM / SaaS / management system" : "CRM / SaaS / sistema de gestión";
    return lang === "en"
      ? `Hi Roberto, I need a ${kind}. I'd like to review feasibility on WhatsApp.`
      : `Hola Roberto, necesito un proyecto de ${kind}. Quiero revisar la viabilidad por WhatsApp.`;
  }

  const price = priceUsd(q);
  const priceLine = price
    ? lang === "en"
      ? `Estimated total: ${formatUsd(price)} USD (rounded up; I review and confirm). Domain and hosting are separate.`
      : `Total estimado: ${formatUsd(price)} USD (redondeado al alza; yo lo reviso y confirmo). Dominio y hosting van aparte.`
    : "";

  return `${header}\n\n${lines}\n\n${priceLine}`;
}

function bindQuote(form, { onChange }) {
  const render = () => onChange(readQuoteForm(form));
  form.addEventListener("input", render);
  form.addEventListener("change", render);
  render();
  return { refresh: render };
}

window.RVQuote = {
  QUOTE_RATES,
  PAGE_TIER_USD,
  LANDING_SUBTOTAL_USD,
  DEFAULT_QUOTE,
  isInterviewType,
  siteSubtotalUsd,
  roundUpTo50,
  rawTotalUsd,
  priceUsd,
  midpointUsd,
  rangeUsd,
  readQuoteForm,
  breakdownLines,
  formatUsd,
  quoteMessage,
  bindQuote,
};
