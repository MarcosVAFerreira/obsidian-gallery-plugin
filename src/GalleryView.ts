import { ItemView, WorkspaceLeaf } from "obsidian";
import type NoteGalleryPlugin from "./main";
import type { GalleryItem } from "./types";
import {
  TYPE_COLORS,
  LANGUAGE_VARIANTS,
  LANG_FILTER_GROUPS,
  LANG_SELECT_GROUPS,
} from "./constants";
import { translate, buildItemFromFrontmatter, renderRating, getDisplayTitle } from "./utils";

export const GALLERY_VIEW_TYPE = "note-gallery-view";

export class GalleryView extends ItemView {
  private plugin: NoteGalleryPlugin;
  private allItems: GalleryItem[] = [];
  private filteredItems: GalleryItem[] = [];
  private currentPage = 1;
  private language: string;

  // Filter state
  private filterType = "";
  private filterSubtype = "";
  private filterStatus = "";
  private filterLang = "";
  private filterImage = "";
  private sortField = "title";
  private sortDir = "asc";

  constructor(leaf: WorkspaceLeaf, plugin: NoteGalleryPlugin) {
    super(leaf);
    this.plugin = plugin;
    this.language = plugin.settings.defaultLanguage;
    this.sortField = plugin.settings.defaultSortField;
    this.sortDir = plugin.settings.defaultSortDir;
  }

  getViewType(): string {
    return GALLERY_VIEW_TYPE;
  }

  getDisplayText(): string {
    return "Note Gallery";
  }

  getIcon(): string {
    return "layout-grid";
  }

  async onOpen(): Promise<void> {
    await this.loadItems();
    this.renderUI();
  }

  async onClose(): Promise<void> {
    // cleanup
  }

  // Called by plugin when vault changes
  async refresh(): Promise<void> {
    await this.loadItems();
    this.applyFilters();
    this.renderGrid();
    this.updatePagination();
  }

  private async loadItems(): Promise<void> {
    const { app } = this;
    const folders = this.plugin.settings.folders;
    this.allItems = [];

    const allFiles = app.vault.getMarkdownFiles();

    for (const file of allFiles) {
      const inFolder = folders.some(
        (folder) =>
          file.path.startsWith(folder + "/") || file.path === folder + ".md"
      );
      if (!inFolder) continue;

      const item = buildItemFromFrontmatter(app, file);
      if (item) this.allItems.push(item);
    }
  }

  private t(key: string): string {
    return translate(this.language, key);
  }

  private renderUI(): void {
    const container = this.containerEl.children[1] as HTMLElement;
    container.empty();
    container.addClass("ng-root");

    this.renderControls(container);

    const grid = container.createDiv({ cls: "ng-grid" });
    grid.id = "ng-grid";

    this.renderPagination(container);

    this.filteredItems = [...this.allItems];
    this.applyFilters();
    this.renderGrid();
    this.updatePagination();
  }

  private renderControls(parent: HTMLElement): void {
    const bar = parent.createDiv({ cls: "ng-controls" });

    // Type filter
    const typeSelect = bar.createEl("select", { cls: "ng-select" });
    typeSelect.id = "ng-type";
    typeSelect.createEl("option", { text: this.t("allTypes"), value: "" });
    const types = [...new Set(this.allItems.map((i) => i.type))].sort();
    for (const type of types) {
      typeSelect.createEl("option", { text: this.t(type), value: type });
    }
    typeSelect.value = this.filterType;
    typeSelect.onchange = () => {
      this.filterType = typeSelect.value;
      this.applyFilters();
    };

    // Subtype filter
    const subSelect = bar.createEl("select", { cls: "ng-select" });
    subSelect.id = "ng-subtype";
    subSelect.createEl("option", { text: this.t("allSubtypes"), value: "" });
    const subtypes = [...new Set(this.allItems.map((i) => i.subType).filter(Boolean))].sort();
    for (const sub of subtypes) {
      subSelect.createEl("option", { text: sub, value: sub });
    }
    subSelect.value = this.filterSubtype;
    subSelect.onchange = () => {
      this.filterSubtype = subSelect.value;
      this.applyFilters();
    };

    // Status filter
    const statusSelect = bar.createEl("select", { cls: "ng-select" });
    statusSelect.id = "ng-status";
    statusSelect.createEl("option", { text: this.t("allStatuses"), value: "" });
    const statuses = [...new Set(this.allItems.map((i) => i.status).filter(Boolean))].sort();
    for (const stat of statuses) {
      statusSelect.createEl("option", { text: stat, value: stat });
    }
    statusSelect.value = this.filterStatus;
    statusSelect.onchange = () => {
      this.filterStatus = statusSelect.value;
      this.applyFilters();
    };

    // Language filter
    const langFilter = bar.createEl("select", { cls: "ng-select" });
    langFilter.id = "ng-lang-filter";
    langFilter.createEl("option", { text: this.t("allLanguages"), value: "" });
    for (const group of LANG_FILTER_GROUPS) {
      const optgroup = langFilter.createEl("optgroup");
      optgroup.label = group.label;
      for (const opt of group.options) {
        optgroup.createEl("option", { text: opt.label, value: opt.value });
      }
    }
    langFilter.value = this.filterLang;
    langFilter.onchange = () => {
      this.filterLang = langFilter.value;
      this.applyFilters();
    };

    // Image filter
    const imgSelect = bar.createEl("select", { cls: "ng-select" });
    imgSelect.createEl("option", { text: this.t("all"), value: "" });
    imgSelect.createEl("option", { text: this.t("withImage"), value: "with" });
    imgSelect.createEl("option", { text: this.t("withoutImage"), value: "without" });
    imgSelect.value = this.filterImage;
    imgSelect.onchange = () => {
      this.filterImage = imgSelect.value;
      this.applyFilters();
    };

    // Sort field
    const orderSelect = bar.createEl("select", { cls: "ng-select" });
    orderSelect.createEl("option", { text: this.t("title"), value: "title" });
    orderSelect.createEl("option", { text: this.t("creationDate"), value: "created" });
    orderSelect.createEl("option", { text: this.t("fileName"), value: "fileName" });
    orderSelect.value = this.sortField;
    orderSelect.onchange = () => {
      this.sortField = orderSelect.value;
      this.applyFilters();
    };

    // Sort direction
    const dirSelect = bar.createEl("select", { cls: "ng-select" });
    dirSelect.createEl("option", { text: this.t("ascending"), value: "asc" });
    dirSelect.createEl("option", { text: this.t("descending"), value: "desc" });
    dirSelect.value = this.sortDir;
    dirSelect.onchange = () => {
      this.sortDir = dirSelect.value;
      this.applyFilters();
    };

    // Reset button
    const resetBtn = bar.createEl("button", { cls: "ng-btn", text: this.t("reset") });
    resetBtn.onclick = () => {
      this.filterType = "";
      this.filterSubtype = "";
      this.filterStatus = "";
      this.filterLang = "";
      this.filterImage = "";
      this.sortField = "title";
      this.sortDir = "asc";
      typeSelect.value = "";
      subSelect.value = "";
      statusSelect.value = "";
      langFilter.value = "";
      imgSelect.value = "";
      orderSelect.value = "title";
      dirSelect.value = "asc";
      this.applyFilters();
    };

    // UI language selector
    const langSelect = bar.createEl("select", { cls: "ng-select ng-lang-select" });
    langSelect.id = "ng-ui-lang";
    for (const group of LANG_SELECT_GROUPS) {
      const optgroup = langSelect.createEl("optgroup");
      optgroup.label = group.label;
      for (const opt of group.options) {
        optgroup.createEl("option", { text: opt.label, value: opt.value });
      }
    }
    langSelect.value = this.language;
    this.applyLangColor(langSelect);
    langSelect.onchange = () => {
      this.language = langSelect.value;
      this.applyLangColor(langSelect);
      this.renderUI(); // Full re-render to update all labels
    };
  }

  private applyLangColor(el: HTMLSelectElement): void {
    const variant = LANGUAGE_VARIANTS[this.language];
    if (variant) {
      el.style.background = variant.color;
      el.style.color = "#fff";
      el.style.borderColor = variant.color;
    }
  }

  private renderPagination(parent: HTMLElement): void {
    const pager = parent.createDiv({ cls: "ng-pager" });
    pager.id = "ng-pager";

    const prevBtn = pager.createEl("button", { cls: "ng-btn", text: this.t("previousPage") });
    prevBtn.id = "ng-prev";
    prevBtn.onclick = () => {
      if (this.currentPage > 1) {
        this.currentPage--;
        this.renderGrid();
        this.updatePagination();
        this.containerEl.children[1].scrollTop = 0;
      }
    };

    const pageLabel = pager.createEl("span", { cls: "ng-page-label" });
    pageLabel.id = "ng-page-label";

    const nextBtn = pager.createEl("button", { cls: "ng-btn", text: this.t("nextPage") });
    nextBtn.id = "ng-next";
    nextBtn.onclick = () => {
      const maxPage = Math.ceil(this.filteredItems.length / this.plugin.settings.pageSize);
      if (this.currentPage < maxPage) {
        this.currentPage++;
        this.renderGrid();
        this.updatePagination();
        this.containerEl.children[1].scrollTop = 0;
      }
    };

    const topBtn = pager.createEl("button", { cls: "ng-btn", text: this.t("top") });
    topBtn.onclick = () => {
      this.containerEl.children[1].scrollTop = 0;
    };
  }

  private applyFilters(): void {
    this.filteredItems = this.allItems.filter((p) => {
      if (this.filterType && p.type !== this.filterType) return false;
      if (this.filterSubtype && p.subType !== this.filterSubtype) return false;
      if (this.filterStatus && p.status !== this.filterStatus) return false;
      if (this.filterLang && !p.availableLangs.includes(this.filterLang)) return false;
      if (this.filterImage === "with" && !p.cover) return false;
      if (this.filterImage === "without" && p.cover) return false;
      return true;
    });

    this.filteredItems.sort((a, b) => {
      let A: string | number, B: string | number;
      if (this.sortField === "created") {
        A = a.created; B = b.created;
      } else if (this.sortField === "fileName") {
        A = a.fileName.toLowerCase(); B = b.fileName.toLowerCase();
      } else {
        A = a.title.toLowerCase(); B = b.title.toLowerCase();
      }
      if (A < B) return this.sortDir === "asc" ? -1 : 1;
      if (A > B) return this.sortDir === "asc" ? 1 : -1;
      return 0;
    });

    this.currentPage = 1;
    this.renderGrid();
    this.updatePagination();
  }

  private renderGrid(): void {
    const container = this.containerEl.children[1] as HTMLElement;
    const grid = container.querySelector("#ng-grid") as HTMLElement;
    if (!grid) return;
    grid.empty();

    const pageSize = this.plugin.settings.pageSize;
    const start = (this.currentPage - 1) * pageSize;
    const pageItems = this.filteredItems.slice(start, start + pageSize);

    if (pageItems.length === 0) {
      grid.createDiv({ cls: "ng-empty", text: this.t("noResults") });
      return;
    }

    for (const item of pageItems) {
      this.renderCard(grid, item);
    }
  }

  private renderCard(parent: HTMLElement, item: GalleryItem): void {
    const typeColor = TYPE_COLORS[item.type] ?? TYPE_COLORS["Others"];
    const displayTitle = getDisplayTitle(item, this.language);
    const rating = renderRating(item.rating);

    const [r, g, b] = [
      parseInt(typeColor.slice(1, 3), 16),
      parseInt(typeColor.slice(3, 5), 16),
      parseInt(typeColor.slice(5, 7), 16),
    ];
    const cardBg = item.subType
      ? `rgba(${r},${g},${b},0.12)`
      : "var(--background-secondary)";

    const card = parent.createDiv({ cls: "ng-card" });
    card.style.border = `2px solid ${typeColor}`;
    card.style.background = cardBg;

    // Build tooltip
    card.title = this.buildTooltip(item);

    // Media
    const media = card.createDiv({ cls: "ng-card-media" });
    const img = media.createEl("img");
    img.src = item.cover || "https://placehold.co/400x600?text=No+Cover";
    img.alt = displayTitle;
    img.loading = "lazy";

    const badges = media.createDiv({ cls: "ng-badges" });
    const badge = badges.createEl("span", { cls: "ng-badge", text: this.t(item.type) });
    badge.style.background = typeColor;

    if (item.subType) {
      const sub = badges.createEl("span", { cls: "ng-subtype", text: item.subType });
      sub.style.borderColor = typeColor;
      sub.style.color = typeColor;
    }

    // Body
    const body = card.createDiv({ cls: "ng-card-body" });
    body.createDiv({ cls: "ng-card-title", text: displayTitle });

    if (item.creators) {
      body.createDiv({ cls: "ng-card-sub", text: item.creators });
    }

    if (rating) {
      const ratingDiv = body.createDiv({ cls: "ng-card-rating" });
      ratingDiv.style.color = typeColor;
      ratingDiv.textContent = rating;
      if (item.onlineRating) {
        ratingDiv.createEl("div", {
          cls: "ng-online-rating",
          text: `🌐 ${item.onlineRating}/10`,
        });
      }
    }

    if (item.status) {
      body.createDiv({ cls: "ng-card-status", text: item.status });
    }

    card.onclick = () => {
      this.app.workspace.openLinkText(item.filePath, "/", false);
    };
  }

  private buildTooltip(item: GalleryItem): string {
    return [
      `📌 ${item.title}`,
      ``,
      item.englishGBTitle   ? `🇬🇧 EN-GB: ${item.englishGBTitle}`   : null,
      item.englishUSTitle   ? `🇺🇸 EN-US: ${item.englishUSTitle}`   : null,
      item.portugueseBRTitle? `🇧🇷 PT-BR: ${item.portugueseBRTitle}`: null,
      item.portuguesePTTitle? `🇵🇹 PT-PT: ${item.portuguesePTTitle}`: null,
      item.spanishESTitle   ? `🇪🇸 ES: ${item.spanishESTitle}`      : null,
      item.frenchFRTitle    ? `🇫🇷 FR: ${item.frenchFRTitle}`       : null,
      item.japaneseTitle    ? `🇯🇵 JA: ${item.japaneseTitle}`       : null,
      item.germanDETitle    ? `🇩🇪 DE: ${item.germanDETitle}`       : null,
      item.chineseCNTitle   ? `🇨🇳 ZH: ${item.chineseCNTitle}`      : null,
      item.koreanTitle      ? `🇰🇷 KO: ${item.koreanTitle}`         : null,
      item.italianTitle     ? `🇮🇹 IT: ${item.italianTitle}`        : null,
      item.russianTitle     ? `🇷🇺 RU: ${item.russianTitle}`        : null,
      ``,
      `Type: ${item.type}`,
      item.subType ? `Subtype: ${item.subType}` : null,
      item.status  ? `Status: ${item.status}`   : null,
    ]
      .filter((l) => l !== null)
      .join("\n");
  }

  private updatePagination(): void {
    const container = this.containerEl.children[1] as HTMLElement;

    const pageLabel = container.querySelector("#ng-page-label") as HTMLElement;
    if (pageLabel) {
      const pageSize = this.plugin.settings.pageSize;
      const total = this.filteredItems.length;
      const start = Math.min((this.currentPage - 1) * pageSize + 1, total);
      const end = Math.min(this.currentPage * pageSize, total);
      const maxPage = Math.max(1, Math.ceil(total / pageSize));
      pageLabel.textContent = `${this.t("page")} ${this.currentPage}/${maxPage}  (${start}–${end} ${this.t("ofItems")} ${total})`;
    }

    const prevBtn = container.querySelector("#ng-prev") as HTMLButtonElement;
    if (prevBtn) prevBtn.disabled = this.currentPage <= 1;

    const nextBtn = container.querySelector("#ng-next") as HTMLButtonElement;
    if (nextBtn) {
      const pageSize = this.plugin.settings.pageSize;
      nextBtn.disabled = this.currentPage * pageSize >= this.filteredItems.length;
    }
  }
}
