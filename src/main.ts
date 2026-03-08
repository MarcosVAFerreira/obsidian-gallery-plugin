import { Plugin, WorkspaceLeaf } from "obsidian";
import { GalleryView, GALLERY_VIEW_TYPE } from "./GalleryView";
import { NoteGallerySettingsTab } from "./SettingsTab";
import { DEFAULT_SETTINGS } from "./constants";
import type { GallerySettings } from "./types";

export default class NoteGalleryPlugin extends Plugin {
  settings: GallerySettings = { ...DEFAULT_SETTINGS };

  async onload(): Promise<void> {
    await this.loadSettings();

    // Register the gallery view
    this.registerView(
      GALLERY_VIEW_TYPE,
      (leaf) => new GalleryView(leaf, this)
    );

    // Ribbon icon
    this.addRibbonIcon("layout-grid", "Open Note Gallery", () => {
      this.activateView();
    });

    // Command
    this.addCommand({
      id: "open-note-gallery",
      name: "Open Note Gallery",
      callback: () => this.activateView(),
    });

    // Settings tab
    this.addSettingTab(new NoteGallerySettingsTab(this.app, this));

    // Refresh gallery on metadata changes
    this.registerEvent(
      this.app.metadataCache.on("changed", () => {
        this.refreshGalleryViews();
      })
    );

    this.registerEvent(
      this.app.vault.on("create", () => this.refreshGalleryViews())
    );
    this.registerEvent(
      this.app.vault.on("delete", () => this.refreshGalleryViews())
    );
    this.registerEvent(
      this.app.vault.on("rename", () => this.refreshGalleryViews())
    );
  }

  onunload(): void {
    this.app.workspace.detachLeavesOfType(GALLERY_VIEW_TYPE);
  }

  async loadSettings(): Promise<void> {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings(): Promise<void> {
    await this.saveData(this.settings);
  }

  async activateView(): Promise<void> {
    const { workspace } = this.app;

    let leaf: WorkspaceLeaf | null = null;
    const leaves = workspace.getLeavesOfType(GALLERY_VIEW_TYPE);

    if (leaves.length > 0) {
      leaf = leaves[0];
    } else {
      leaf = workspace.getLeaf(false);
      await leaf.setViewState({ type: GALLERY_VIEW_TYPE, active: true });
    }

    workspace.revealLeaf(leaf);
  }

  private refreshGalleryViews(): void {
    for (const leaf of this.app.workspace.getLeavesOfType(GALLERY_VIEW_TYPE)) {
      const view = leaf.view;
      if (view instanceof GalleryView) {
        view.refresh();
      }
    }
  }
}
