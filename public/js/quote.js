/**
 * Cotizador: total exacto según opciones, no precio final.
 * Dominio y hosting no entran en el número.
 */

const QUOTE_RATES = {
  forms: { none: 0, contact: 20, multi: 50 },
  admin: { none: 0, basic: 150, advanced: 250 },
  seo: { none: 0, basic: 50, local: 100, advanced: 250 },
  designScratch: 50,
  identityCreate: 50,
  imageProcessBase: 20,
  imageCount: { small: 0, mid: 10, large: 20 },
};

/** Addon de tema claro/oscuro e idiomas según tamaño del sitio web (3 / 5 / 7 páginas) */
const PAGE_TIER_ADDON_USD = {
  one: 10,
  basic: 10,
  standard: 15,
  wide: 20,
};

/** Página de contacto o promoción: una sola página enfocada (por debajo de un sitio de 3 páginas) */
const LANDING_SUBTOTAL_USD = 120;

/** Precio base por tamaño de sitio web */
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
  imageCount: "small",
};

function isInterviewType(type) {
  return type === "system" || type === "shop";
}

function siteSubtotalUsd(q) {
  if (q.type === "landing") return LANDING_SUBTOTAL_USD;
  return PAGE_TIER_USD[q.pages] ?? PAGE_TIER_USD.basic;
}

function tierAddonUsd(q) {
  if (q.type === "landing") return PAGE_TIER_ADDON_USD.one;
  if (q.type !== "web") return PAGE_TIER_ADDON_USD.basic;
  return PAGE_TIER_ADDON_USD[q.pages] ?? PAGE_TIER_ADDON_USD.basic;
}

function imagesFeeUsd(q) {
  if (q.images !== "process") return 0;
  const countKey = q.imageCount || "small";
  return (
    QUOTE_RATES.imageProcessBase +
    (QUOTE_RATES.imageCount[countKey] ?? 0)
  );
}

function rawTotalUsd(input) {
  const q = { ...DEFAULT_QUOTE, ...input };
  if (isInterviewType(q.type)) return null;

  const tierAddon = tierAddonUsd(q);

  return (
    siteSubtotalUsd(q) +
    (QUOTE_RATES.forms[q.forms] ?? 0) +
    (QUOTE_RATES.admin[q.admin] ?? 0) +
    (QUOTE_RATES.seo[q.seo] ?? 0) +
    (q.design === "scratch" ? QUOTE_RATES.designScratch : 0) +
    (q.identity === "create" ? QUOTE_RATES.identityCreate : 0) +
    (q.theme === "both" ? tierAddon : 0) +
    (q.languages === "multi" ? tierAddon : 0) +
    imagesFeeUsd(q)
  );
}

function priceUsd(input) {
  return rawTotalUsd(input);
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
    imageCount: get("imageCount") || "small",
  };
}

function imagesBreakdownLabel(q, t) {
  if (q.images === "ready") return t(`q.images.${q.images}`);
  const countLabel = t(`q.imageCount.${q.imageCount || "small"}`);
  return `${t("q.images.process")} · ${countLabel}`;
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
    [t("q.images"), imagesBreakdownLabel(q, t)],
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
      lang === "en"
        ? "CRM / SaaS / management system / online store"
        : "CRM / SaaS / sistema de gestión / tienda online";
    return lang === "en"
      ? `Hi Roberto, I need a ${kind}. I'd like to review feasibility on WhatsApp.`
      : `Hola Roberto, necesito un proyecto de ${kind}. Quiero revisar la viabilidad por WhatsApp.`;
  }

  const price = priceUsd(q);
  const priceLine = price
    ? lang === "en"
      ? `Estimated total: ${formatUsd(price)} USD (I review and confirm). Domain and hosting are separate.`
      : `Total estimado: ${formatUsd(price)} USD (yo lo reviso y te confirmo). Dominio y hosting van aparte.`
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
  PAGE_TIER_ADDON_USD,
  LANDING_SUBTOTAL_USD,
  DEFAULT_QUOTE,
  isInterviewType,
  siteSubtotalUsd,
  tierAddonUsd,
  imagesFeeUsd,
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
