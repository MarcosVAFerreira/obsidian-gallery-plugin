import { App, PluginSettingTab, Setting } from "obsidian";
import type NoteGalleryPlugin from "./main";
import { LANG_SELECT_GROUPS } from "./constants";

export class NoteGallerySettingsTab extends PluginSettingTab {
  plugin: NoteGalleryPlugin;

  constructor(app: App, plugin: NoteGalleryPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();

    containerEl.createEl("h2", { text: "Note Gallery Settings" });

    // Folders
    new Setting(containerEl)
      .setName("Folders to include")
      .setDesc(
        "One folder path per line. Notes inside these folders will appear in the gallery."
      )
      .addTextArea((ta) => {
        ta.setValue(this.plugin.settings.folders.join("\n"))
          .setPlaceholder("1- Trajectory\n2- Mastery\nCore/People")
          .onChange(async (value) => {
            this.plugin.settings.folders = value
              .split("\n")
              .map((f) => f.trim())
              .filter(Boolean);
            await this.plugin.saveSettings();
          });
        ta.inputEl.rows = 6;
        ta.inputEl.style.width = "100%";
      });

    // Page size
    new Setting(containerEl)
      .setName("Cards per page")
      .setDesc("How many cards to show per page (default: 50).")
      .addSlider((sl) =>
        sl
          .setLimits(10, 200, 10)
          .setValue(this.plugin.settings.pageSize)
          .setDynamicTooltip()
          .onChange(async (value) => {
            this.plugin.settings.pageSize = value;
            await this.plugin.saveSettings();
          })
      );

    // Default language
    new Setting(containerEl)
      .setName("Default display language")
      .setDesc("Which language variant to show titles in by default.")
      .addDropdown((dd) => {
        for (const group of LANG_SELECT_GROUPS) {
          for (const opt of group.options) {
            dd.addOption(opt.value, opt.label);
          }
        }
        dd.setValue(this.plugin.settings.defaultLanguage).onChange(
          async (value) => {
            this.plugin.settings.defaultLanguage = value;
            await this.plugin.saveSettings();
          }
        );
      });

    // Default sort field
    new Setting(containerEl)
      .setName("Default sort field")
      .addDropdown((dd) => {
        dd.addOption("title", "Title");
        dd.addOption("created", "Creation Date");
        dd.addOption("fileName", "File Name");
        dd.setValue(this.plugin.settings.defaultSortField).onChange(
          async (value) => {
            this.plugin.settings.defaultSortField = value;
            await this.plugin.saveSettings();
          }
        );
      });

    // Default sort direction
    new Setting(containerEl)
      .setName("Default sort direction")
      .addDropdown((dd) => {
        dd.addOption("asc", "Ascending ↑");
        dd.addOption("desc", "Descending ↓");
        dd.setValue(this.plugin.settings.defaultSortDir).onChange(
          async (value) => {
            this.plugin.settings.defaultSortDir = value;
            await this.plugin.saveSettings();
          }
        );
      });

    // Separator
    containerEl.createEl("hr");
    containerEl.createEl("h3", { text: "Frontmatter Fields Reference" });
    containerEl.createEl("p", {
      text: "Your notes should use these frontmatter fields for the gallery to read them:",
    });

    const fields = [
      ["type", "Note type (book, movie, manga, etc.)"],
      ["subType", "Optional subtype/genre"],
      ["status", "Reading/watching status"],
      ["cover / coverUrl / poster", "Path to cover image (supports wikilinks)"],
      ["rating", "Personal rating (0–10)"],
      ["onlineRating", "Online rating score (0–10)"],
      ["author / writer / director / artist", "Creators (can be a list)"],
      ["series", "Series name"],
      ["englishGBTitle, englishUSTitle, portugueseBRTitle, ...", "Multilingual title fields"],
    ];

    const table = containerEl.createEl("table", { cls: "ng-ref-table" });
    const thead = table.createEl("thead");
    const headerRow = thead.createEl("tr");
    headerRow.createEl("th", { text: "Field" });
    headerRow.createEl("th", { text: "Description" });

    const tbody = table.createEl("tbody");
    for (const [field, desc] of fields) {
      const row = tbody.createEl("tr");
      row.createEl("td").createEl("code", { text: field });
      row.createEl("td", { text: desc });
    }
  }
}
