(function () {
"use strict";

const WORK_IDS = ["gestia", "tronoss", "avm", "mercahogar", "agendax", "suite"];
const IMAGE_FILES = ["01.png", "02.png", "03.png"];

function prefersReducedMotion() {
  return Boolean(window.matchMedia?.("(prefers-reduced-motion: reduce)").matches);
}

function initWorkGallery({ t }) {
  const modal = document.getElementById("work-modal");
  const titleEl = document.getElementById("work-modal-title");
  const descEl = document.getElementById("work-modal-desc");
  const mainImg = document.getElementById("work-gallery-img");
  const thumbsEl = document.getElementById("work-gallery-thumbs");
  const prevBtn = document.getElementById("work-gallery-prev");
  const nextBtn = document.getElementById("work-gallery-next");
  if (!modal || !titleEl || !descEl || !mainImg || !thumbsEl) return;

  let images = [];
  let currentIndex = 0;

  function workIndex(id) {
    return WORK_IDS.indexOf(id);
  }

  function workTitle(id) {
    const idx = workIndex(id);
    return idx >= 0 ? t(`work_${idx + 1}_t`) : id;
  }

  function imageSrc(id, file) {
    return `assets/projects/${id}/${file}`;
  }

  function showImage(index) {
    if (!images.length) return;
    currentIndex = (index + images.length) % images.length;
    mainImg.src = images[currentIndex];
    mainImg.alt = `${workTitle(modal.dataset.workId || "")}  ${currentIndex + 1}`;
    thumbsEl.querySelectorAll("[data-thumb-index]").forEach((btn) => {
      const active = Number(btn.dataset.thumbIndex) === currentIndex;
      btn.classList.toggle("is-active", active);
      btn.setAttribute("aria-selected", String(active));
    });
    if (prevBtn) prevBtn.disabled = images.length <= 1;
    if (nextBtn) nextBtn.disabled = images.length <= 1;
  }

  function buildThumbs(id) {
    thumbsEl.replaceChildren();
    images.forEach((src, index) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "work-gallery-thumb";
      btn.dataset.thumbIndex = String(index);
      btn.setAttribute("role", "tab");
      btn.setAttribute("aria-label", `${workTitle(id)} ${index + 1}`);
      const img = document.createElement("img");
      img.src = src;
      img.alt = "";
      img.loading = "lazy";
      btn.append(img);
      btn.addEventListener("click", () => showImage(index));
      thumbsEl.append(btn);
    });
  }

  function openWork(id) {
    if (workIndex(id) < 0) return;
    modal.dataset.workId = id;
    images = IMAGE_FILES.map((file) => imageSrc(id, file));
    const idx = workIndex(id) + 1;
    titleEl.textContent = `${workTitle(id)}  ${t(`work_${idx}_cat`)}`;
    descEl.textContent = t(`work_${idx}_p`);
    buildThumbs(id);
    showImage(0);
    modal.hidden = false;
    document.body.classList.add("modal-open");
    modal.querySelector(".site-modal-close")?.focus();
  }

  function closeWork() {
    if (modal.hidden) return;
    modal.hidden = true;
    document.body.classList.remove("modal-open");
    modal.dataset.workId = "";
    images = [];
    mainImg.removeAttribute("src");
  }

  document.querySelectorAll("[data-work-open]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-work-open");
      if (id) openWork(id);
    });
  });

  modal.querySelectorAll("[data-work-modal-close]").forEach((el) => {
    el.addEventListener("click", () => closeWork());
  });

  if (prevBtn) {
    prevBtn.addEventListener("click", () => showImage(currentIndex - 1));
  }
  if (nextBtn) {
    nextBtn.addEventListener("click", () => showImage(currentIndex + 1));
  }

  document.addEventListener("keydown", (e) => {
    if (modal.hidden) return;
    if (e.key === "Escape") closeWork();
    if (e.key === "ArrowLeft") showImage(currentIndex - 1);
    if (e.key === "ArrowRight") showImage(currentIndex + 1);
  });
}

window.RVWork = { WORK_IDS, initWorkGallery };
})();
