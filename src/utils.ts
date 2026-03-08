import { TYPE_NORMALIZATION, LANGUAGE_VARIANTS, TRANSLATIONS } from "./constants";
import type { GalleryItem } from "./types";
import type { App, TFile } from "obsidian";

export function translate(language: string, key: string): string {
  return (
    TRANSLATIONS[language]?.[key] ??
    TRANSLATIONS["en-US"]?.[key] ??
    key
  );
}

export function normalizeType(typeRaw: unknown): string {
  if (!typeRaw) return "Others";
  const t = String(typeRaw).toLowerCase().trim();
  return TYPE_NORMALIZATION[t] ?? "Others";
}

export function normalizeSubType(subTypeRaw: unknown): string {
  if (!subTypeRaw) return "";
  const val = Array.isArray(subTypeRaw) ? subTypeRaw[0] : subTypeRaw;
  const s = String(val).trim();
  if (!s) return "";
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function normalizeList(value: unknown): string[] {
  if (!value) return [];
  return Array.isArray(value) ? value.map(String) : [String(value)];
}

export function joinList(value: unknown): string {
  return normalizeList(value).join(", ");
}

export function renderRating(score: number | null | undefined): string {
  if (score === undefined || score === null) return "";
  const r = Math.max(0, Math.min(10, Number(score))) / 2;
  const full = Math.floor(r);
  const half = r - full >= 0.5 ? 1 : 0;
  const empty = 5 - full - half;
  return "★".repeat(full) + "⯪".repeat(half) + "☆".repeat(empty);
}

export function resolveCoverPath(app: App, coverUrl: string): string {
  if (!coverUrl) return "";
  // Strip wikilink brackets
  let path = coverUrl.replace(/^\[\[/, "").replace(/\]\]$/, "");
  // Try to get the vault adapter base path (desktop only)
  const adapter = (app.vault.adapter as { basePath?: string });
  if (adapter.basePath) {
    const fullPath = `app://local/${adapter.basePath}/${path}`.replace(/\\/g, "/");
    return fullPath;
  }
  return path;
}

export function getDisplayTitle(item: GalleryItem, language: string): string {
  const variant = LANGUAGE_VARIANTS[language];
  if (!variant) return item.title;

  // Try the specific variant field
  const fieldVal = item[variant.field] as string;
  if (fieldVal) return fieldVal;

  // Fallback to other variants of the same base language
  const sameBase = Object.entries(LANGUAGE_VARIANTS).filter(
    ([, info]) => info.baseLang === variant.baseLang
  );
  for (const [, info] of sameBase) {
    const v = item[info.field] as string;
    if (v) return v;
  }

  // Final fallback
  return item.title;
}

export function buildItemFromFrontmatter(app: App, file: TFile): GalleryItem | null {
  const cache = app.metadataCache.getFileCache(file);
  const fm = cache?.frontmatter ?? {};

  const type = normalizeType(fm.type);
  const subType = normalizeSubType(fm.subType);

  const authors = [
    ...normalizeList(fm.author ?? fm.autor ?? fm.writer),
    ...normalizeList(fm.director ?? fm.diretor),
    ...normalizeList(fm.artist ?? fm.artista),
  ].filter(Boolean);
  const creators = authors.join(", ");

  const rawCover = fm.cover ?? fm.coverUrl ?? fm.poster ?? "";
  const cover = rawCover ? resolveCoverPath(app, String(rawCover)) : "";

  // Detect available base languages
  const availableLangs: string[] = [];
  if (fm.portugueseBRTitle || fm.portuguesePTTitle) availableLangs.push("pt");
  if (fm.englishUSTitle || fm.englishGBTitle || fm.englishCATitle || fm.englishAUTitle) availableLangs.push("en");
  if (fm.spanishESTitle || fm.spanishMXTitle || fm.spanishARTitle) availableLangs.push("es");
  if (fm.frenchFRTitle || fm.frenchCATitle) availableLangs.push("fr");
  if (fm.japaneseTitle) availableLangs.push("ja");
  if (fm.germanDETitle || fm.germanATTitle || fm.germanCHTitle) availableLangs.push("de");
  if (fm.chineseCNTitle || fm.chineseTWTitle) availableLangs.push("zh");
  if (fm.koreanTitle) availableLangs.push("ko");
  if (fm.italianTitle) availableLangs.push("it");
  if (fm.russianTitle) availableLangs.push("ru");
  if (fm.latinTitle) availableLangs.push("la");
  if (fm.ancientGreekTitle) availableLangs.push("grc");
  if (fm.egyptianTitle) availableLangs.push("egy");
  if (fm.akkadianTitle) availableLangs.push("akk");
  if (fm.sumerianTitle) availableLangs.push("sux");
  if (fm.oldNorseTitle) availableLangs.push("non");
  if (fm.oldEnglishTitle) availableLangs.push("ang");
  if (fm.sanskritTitle) availableLangs.push("san");
  if (fm.phoenicianTitle) availableLangs.push("phn");
  if (fm.aramaicTitle) availableLangs.push("arc");
  if (fm.biblicalHebrewTitle) availableLangs.push("hbo");
  if (fm.copticTitle) availableLangs.push("cop");
  if (fm.quenyaTitle) availableLangs.push("qya");
  if (fm.sindarinTitle) availableLangs.push("sjn");
  if (fm.khuzdulTitle) availableLangs.push("khz");
  if (fm.blackSpeechTitle) availableLangs.push("blk");
  if (fm.klingonTitle) availableLangs.push("tlh");
  if (fm.romulanTitle) availableLangs.push("rom");
  if (fm.vulcanTitle) availableLangs.push("vul");
  if (fm.hutteseTitle) availableLangs.push("hut");
  if (fm.mandoaTitle) availableLangs.push("mdk");
  if (fm.dothrakiTitle) availableLangs.push("dot");
  if (fm.valyrianTitle) availableLangs.push("hva");
  if (fm.parseltongueTitle) availableLangs.push("prs");
  if (fm.naviTitle) availableLangs.push("nav");
  if (fm.minioneseTitle) availableLangs.push("min");
  if (fm.newspeakTitle) availableLangs.push("nwv");
  if (fm.lapineTitle) availableLangs.push("lap");
  if (fm.esperantoTitle) availableLangs.push("epo");
  if (fm.idoTitle) availableLangs.push("ido");
  if (fm.interlinguaTitle) availableLangs.push("ina");
  if (fm.volapukTitle) availableLangs.push("vol");
  if (fm.lojbanTitle) availableLangs.push("jbo");
  if (fm.tokiPonaTitle) availableLangs.push("tok");

  return {
    filePath: file.path,
    fileName: file.name,
    title: fm.title ?? fm.englishGBTitle ?? fm.englishUSTitle ?? fm.portugueseBRTitle ?? file.basename,
    cover,
    type,
    subType,
    status: String(fm.status ?? "").trim(),
    creators,
    rating: fm.rating != null ? Number(fm.rating) : null,
    onlineRating: fm.onlineRating != null ? Number(fm.onlineRating) : null,
    series: fm.series ?? "",
    created: file.stat.ctime,
    availableLangs,

    portugueseBRTitle: fm.portugueseBRTitle ?? "",
    portuguesePTTitle: fm.portuguesePTTitle ?? "",
    englishUSTitle: fm.englishUSTitle ?? "",
    englishGBTitle: fm.englishGBTitle ?? "",
    englishCATitle: fm.englishCATitle ?? "",
    englishAUTitle: fm.englishAUTitle ?? "",
    spanishESTitle: fm.spanishESTitle ?? "",
    spanishMXTitle: fm.spanishMXTitle ?? "",
    spanishARTitle: fm.spanishARTitle ?? "",
    frenchFRTitle: fm.frenchFRTitle ?? "",
    frenchCATitle: fm.frenchCATitle ?? "",
    japaneseTitle: fm.japaneseTitle ?? "",
    germanDETitle: fm.germanDETitle ?? "",
    germanATTitle: fm.germanATTitle ?? "",
    germanCHTitle: fm.germanCHTitle ?? "",
    chineseCNTitle: fm.chineseCNTitle ?? "",
    chineseTWTitle: fm.chineseTWTitle ?? "",
    koreanTitle: fm.koreanTitle ?? "",
    italianTitle: fm.italianTitle ?? "",
    russianTitle: fm.russianTitle ?? "",
    latinTitle: fm.latinTitle ?? "",
    ancientGreekTitle: fm.ancientGreekTitle ?? "",
    egyptianTitle: fm.egyptianTitle ?? "",
    akkadianTitle: fm.akkadianTitle ?? "",
    sumerianTitle: fm.sumerianTitle ?? "",
    oldNorseTitle: fm.oldNorseTitle ?? "",
    oldEnglishTitle: fm.oldEnglishTitle ?? "",
    sanskritTitle: fm.sanskritTitle ?? "",
    phoenicianTitle: fm.phoenicianTitle ?? "",
    aramaicTitle: fm.aramaicTitle ?? "",
    biblicalHebrewTitle: fm.biblicalHebrewTitle ?? "",
    copticTitle: fm.copticTitle ?? "",
    quenyaTitle: fm.quenyaTitle ?? "",
    sindarinTitle: fm.sindarinTitle ?? "",
    khuzdulTitle: fm.khuzdulTitle ?? "",
    blackSpeechTitle: fm.blackSpeechTitle ?? "",
    klingonTitle: fm.klingonTitle ?? "",
    romulanTitle: fm.romulanTitle ?? "",
    vulcanTitle: fm.vulcanTitle ?? "",
    hutteseTitle: fm.hutteseTitle ?? "",
    mandoaTitle: fm.mandoaTitle ?? "",
    dothrakiTitle: fm.dothrakiTitle ?? "",
    valyrianTitle: fm.valyrianTitle ?? "",
    parseltongueTitle: fm.parseltongueTitle ?? "",
    naviTitle: fm.naviTitle ?? "",
    minioneseTitle: fm.minioneseTitle ?? "",
    newspeakTitle: fm.newspeakTitle ?? "",
    lapineTitle: fm.lapineTitle ?? "",
    esperantoTitle: fm.esperantoTitle ?? "",
    idoTitle: fm.idoTitle ?? "",
    interlinguaTitle: fm.interlinguaTitle ?? "",
    volapukTitle: fm.volapukTitle ?? "",
    lojbanTitle: fm.lojbanTitle ?? "",
    tokiPonaTitle: fm.tokiPonaTitle ?? "",
  };
}
