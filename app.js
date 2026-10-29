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

document
  .querySelectorAll(".product-image")
  .forEach((link) => {
    const card = link.closest(".product-card");

    const itemName =
      card?.querySelector(".consult-link")?.dataset.item ||
      card?.dataset.name ||
      "uma joia";

    link.href = createWhatsAppUrl(itemName);
  });

/**
 * Links gerais de contato recebem uma mensagem padrão.
 */
document
  .querySelectorAll('a[href="https://wa.me/5581989914332"]')
  .forEach((link) => {
    if (
      !link.classList.contains("consult-link") &&
      !link.classList.contains("product-image")
    ) {
      link.href = createWhatsAppUrl();
    }
  });

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
