/**
 * Cotizador: rango estimado, no precio final.
 * Dominio y hosting no entran en el número.
 */

const QUOTE_RATES = {
  base: 100,
  extraPage: 40,
  landing: 80,
  forms: { 0: 0, 1: 20, 2: 50 },
  admin: { none: 0, basic: 80, advanced: 180 },
  seo: { none: 0, basic: 20, local: 50, advanced: 100 },
  designScratch: 50,
  identityCreate: 50,
  dualTheme: 10,
  multilingual: 10,
  images: 20,
  rangeLow: 0.88,
  rangeHigh: 1.12,
};

// Presets de páginas → número aproximado para el cálculo.
const PAGE_PRESETS = { one: 1, basic: 3, standard: 5, wide: 8 };

const DEFAULT_QUOTE = {
  type: "web",
  pages: "basic",
  forms: 1,
  admin: "none",
  seo: "basic",
  design: "preset",
  identity: "defined",
  theme: "light",
  languages: 1,
  images: "process",
  maintenance: "light",
};

function isInterviewType(type) {
  return type === "system" || type === "shop";
}

function presetPages(key) {
  return PAGE_PRESETS[key] ?? 3;
}

function midpointUsd(input) {
  const q = { ...DEFAULT_QUOTE, ...input };
  if (isInterviewType(q.type)) return null;

  const pages = q.type === "landing" ? 1 : presetPages(q.pages);
  const extraPages = Math.max(0, pages - 1);
  const formKey = q.forms >= 2 ? 2 : q.forms >= 1 ? 1 : 0;
  const landingFee = q.type === "landing" ? QUOTE_RATES.landing : 0;
  const imagesFee = q.images === "process" ? QUOTE_RATES.images : 0;

  const mid =
    QUOTE_RATES.base +
    extraPages * QUOTE_RATES.extraPage +
    landingFee +
    QUOTE_RATES.forms[formKey] +
    (QUOTE_RATES.admin[q.admin] ?? 0) +
    (QUOTE_RATES.seo[q.seo] ?? 0) +
    (q.design === "scratch" ? QUOTE_RATES.designScratch : 0) +
    (q.identity === "create" ? QUOTE_RATES.identityCreate : 0) +
    (q.theme === "both" ? QUOTE_RATES.dualTheme : 0) +
    (Number(q.languages) >= 2 ? QUOTE_RATES.multilingual : 0) +
    imagesFee;

  return Math.round(mid);
}

function rangeUsd(input) {
  const mid = midpointUsd(input);
  if (mid == null) return null;
  return {
    mid,
    low: Math.round(mid * QUOTE_RATES.rangeLow),
    high: Math.round(mid * QUOTE_RATES.rangeHigh),
  };
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
    forms: Number(get("forms") || 0),
    admin: get("admin") || "none",
    seo: get("seo") || "none",
    design: get("design") || "preset",
    identity: get("identity") || "defined",
    theme: get("theme") || "light",
    languages: Number(get("languages") || 1),
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
    [t("q.forms"), String(q.forms >= 2 ? "2+" : q.forms)],
    [t("q.admin"), t(`q.admin.${q.admin}`)],
    [t("q.seo"), t(`q.seo.${q.seo}`)],
    [t("q.design"), t(`q.design.${q.design}`)],
    [t("q.identity"), t(`q.identity.${q.identity}`)],
    [t("q.theme"), t(`q.theme.${q.theme}`)],
    [t("q.languages"), Number(q.languages) >= 2 ? t("q.languages.multi") : t("q.languages.one")],
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

  const range = rangeUsd(q);
  const rangeLine = range
    ? lang === "en"
      ? `Estimated range: ${formatUsd(range.low)} – ${formatUsd(range.high)} USD (not a final price). Domain and hosting are separate.`
      : `Rango estimado: ${formatUsd(range.low)} – ${formatUsd(range.high)} USD (no es precio final). Dominio y hosting van aparte.`
    : "";

  return `${header}\n\n${lines}\n\n${rangeLine}`;
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
  PAGE_PRESETS,
  DEFAULT_QUOTE,
  isInterviewType,
  presetPages,
  midpointUsd,
  rangeUsd,
  readQuoteForm,
  breakdownLines,
  formatUsd,
  quoteMessage,
  bindQuote,
};
