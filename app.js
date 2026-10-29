"use strict";

const WHATSAPP_BASE = "https://wa.me/5581989914332";

const cards = [
  ...document.querySelectorAll(".product-card")
];

const filterButtons = [
  ...document.querySelectorAll("[data-filter]")
];

const searchInput = document.querySelector("#product-search");
const emptyState = document.querySelector("#empty-state");
const resetButton = document.querySelector("#reset-search");

const menuToggle = document.querySelector(".menu-toggle");
const mainNav = document.querySelector("#main-nav");

let activeCategory = "todos";

/**
 * Cria um link do WhatsApp com uma mensagem personalizada.
 */
function createWhatsAppUrl(productName = "") {
  const message = productName
    ? `Olá! Vi o catálogo da Pratear Lumi e gostaria de consultar a disponibilidade de: ${productName}.`
    : "Olá! Vim pelo catálogo digital da Pratear Lumi e gostaria de conhecer as peças disponíveis.";

  return `${WHATSAPP_BASE}?text=${encodeURIComponent(message)}`;
}

/**
 * Aplica simultaneamente o filtro de categoria
 * e o texto digitado na busca.
 */
function applyFilters() {
  const query = (searchInput?.value || "")
    .trim()
    .toLocaleLowerCase("pt-BR");

  let visibleCount = 0;

  cards.forEach((card) => {
    const categories = (
      card.dataset.category || ""
    ).split(/\s+/);

    const matchesCategory =
      activeCategory === "todos" ||
      categories.includes(activeCategory);

    const searchableText = (
      `${card.dataset.name || ""} ${card.textContent || ""}`
    ).toLocaleLowerCase("pt-BR");

    const matchesSearch =
      query === "" || searchableText.includes(query);

    const visible =
      matchesCategory && matchesSearch;

    card.hidden = !visible;

    if (visible) {
      visibleCount += 1;
    }
  });

  if (emptyState) {
    emptyState.hidden = visibleCount > 0;
  }
}

/**
 * Eventos dos botões de categoria.
 */
filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    activeCategory = button.dataset.filter || "todos";

    filterButtons.forEach((item) => {
      const selected = item === button;

      item.classList.toggle("is-active", selected);
      item.setAttribute(
        "aria-pressed",
        String(selected)
      );
    });

    applyFilters();
  });
});

/**
 * Pesquisa produtos enquanto a pessoa digita.
 */
searchInput?.addEventListener("input", applyFilters);

/**
 * Limpa a pesquisa e retorna para todas as peças.
 */
resetButton?.addEventListener("click", () => {
  activeCategory = "todos";

  if (searchInput) {
    searchInput.value = "";
  }

  filterButtons.forEach((button) => {
    const selected = button.dataset.filter === "todos";

    button.classList.toggle("is-active", selected);
    button.setAttribute(
      "aria-pressed",
      String(selected)
    );
  });

  applyFilters();
  searchInput?.focus();
});

/**
 * Faz os botões de consulta abrirem o WhatsApp
 * com o nome da peça selecionada.
 */
document
  .querySelectorAll(".consult-link[data-item]")
  .forEach((link) => {
    link.href = createWhatsAppUrl(link.dataset.item);
  });

/**
 * Links gerais de contato recebem uma mensagem padrão.
 */
document
  .querySelectorAll('a[href="https://wa.me/5581989914332"]')
  .forEach((link) => {
    if (!link.classList.contains("consult-link")) {
      link.href = createWhatsAppUrl();
    }
  });

/**
 * Janela de ampliação: clicar na foto abre a imagem grande,
 * com setas para navegar entre as peças que estão na tela.
 */
const lightbox = document.querySelector("#lightbox");
const lightboxImage = document.querySelector("#lightbox-image");
const lightboxTitle = document.querySelector("#lightbox-title");
const lightboxCta = document.querySelector("#lightbox-cta");

let lightboxCard = null;

function showLightboxCard(card) {
  const link = card.querySelector(".product-image");
  const photo = link.querySelector("img");
  const itemName = card.querySelector("h3").textContent.trim();

  lightboxCard = card;
  lightboxImage.src = link.getAttribute("href");
  lightboxImage.alt = photo.alt;
  lightboxTitle.textContent = itemName;
  lightboxCta.href = createWhatsAppUrl(itemName);
}

function stepLightbox(direction) {
  const visibleCards = cards.filter((card) => !card.hidden);
  const index = visibleCards.indexOf(lightboxCard);

  if (visibleCards.length < 2 || index === -1) {
    return;
  }

  const next =
    (index + direction + visibleCards.length) % visibleCards.length;

  showLightboxCard(visibleCards[next]);
}

if (lightbox && typeof lightbox.showModal === "function") {
  document
    .querySelectorAll(".product-image")
    .forEach((link) => {
      link.addEventListener("click", (event) => {
        event.preventDefault();
        showLightboxCard(link.closest(".product-card"));
        lightbox.showModal();
        document.body.classList.add("lightbox-open");
      });
    });

  document
    .querySelector("#lightbox-close")
    ?.addEventListener("click", () => lightbox.close());

  document
    .querySelector("#lightbox-prev")
    ?.addEventListener("click", () => stepLightbox(-1));

  document
    .querySelector("#lightbox-next")
    ?.addEventListener("click", () => stepLightbox(1));

  // Clicar fora da foto (no fundo escuro) também fecha.
  lightbox.addEventListener("click", (event) => {
    if (event.target === lightbox) {
      lightbox.close();
    }
  });

  lightbox.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") {
      stepLightbox(-1);
    } else if (event.key === "ArrowRight") {
      stepLightbox(1);
    }
  });

  lightbox.addEventListener("close", () => {
    document.body.classList.remove("lightbox-open");
  });

  // Arrastar o dedo para os lados troca de foto no celular.
  let touchStartX = null;

  lightbox.addEventListener(
    "touchstart",
    (event) => {
      touchStartX = event.touches[0].clientX;
    },
    { passive: true }
  );

  lightbox.addEventListener("touchend", (event) => {
    if (touchStartX === null) {
      return;
    }

    const distance = event.changedTouches[0].clientX - touchStartX;
    touchStartX = null;

    if (Math.abs(distance) > 60) {
      stepLightbox(distance > 0 ? -1 : 1);
    }
  });
}

/**
 * Menu de navegação para celulares.
 */
menuToggle?.addEventListener("click", () => {
  const willOpen =
    menuToggle.getAttribute("aria-expanded") !== "true";

  menuToggle.setAttribute(
    "aria-expanded",
    String(willOpen)
  );

  menuToggle.setAttribute(
    "aria-label",
    willOpen ? "Fechar menu" : "Abrir menu"
  );

  mainNav?.classList.toggle("is-open", willOpen);
});

/**
 * Fecha o menu depois que um link é selecionado.
 */
mainNav?.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    mainNav.classList.remove("is-open");

    menuToggle?.setAttribute(
      "aria-expanded",
      "false"
    );

    menuToggle?.setAttribute(
      "aria-label",
      "Abrir menu"
    );
  });
});

/**
 * Atualiza o ano do rodapé automaticamente.
 */
const yearElement = document.querySelector("#year");

if (yearElement) {
  yearElement.textContent = String(
    new Date().getFullYear()
  );
}
