export interface GalleryItem {
  filePath: string;
  fileName: string;
  title: string;
  cover: string;
  type: string;
  subType: string;
  status: string;
  creators: string;
  rating: number | null;
  onlineRating: number | null;
  series: string;
  created: number;
  availableLangs: string[];

  // Language title fields
  portugueseBRTitle: string;
  portuguesePTTitle: string;
  englishUSTitle: string;
  englishGBTitle: string;
  englishCATitle: string;
  englishAUTitle: string;
  spanishESTitle: string;
  spanishMXTitle: string;
  spanishARTitle: string;
  frenchFRTitle: string;
  frenchCATitle: string;
  japaneseTitle: string;
  germanDETitle: string;
  germanATTitle: string;
  germanCHTitle: string;
  chineseCNTitle: string;
  chineseTWTitle: string;
  koreanTitle: string;
  italianTitle: string;
  russianTitle: string;
  latinTitle: string;
  ancientGreekTitle: string;
  egyptianTitle: string;
  akkadianTitle: string;
  sumerianTitle: string;
  oldNorseTitle: string;
  oldEnglishTitle: string;
  sanskritTitle: string;
  phoenicianTitle: string;
  aramaicTitle: string;
  biblicalHebrewTitle: string;
  copticTitle: string;
  quenyaTitle: string;
  sindarinTitle: string;
  khuzdulTitle: string;
  blackSpeechTitle: string;
  klingonTitle: string;
  romulanTitle: string;
  vulcanTitle: string;
  hutteseTitle: string;
  mandoaTitle: string;
  dothrakiTitle: string;
  valyrianTitle: string;
  parseltongueTitle: string;
  naviTitle: string;
  minioneseTitle: string;
  newspeakTitle: string;
  lapineTitle: string;
  esperantoTitle: string;
  idoTitle: string;
  interlinguaTitle: string;
  volapukTitle: string;
  lojbanTitle: string;
  tokiPonaTitle: string;

  [key: string]: unknown;
}

export interface GallerySettings {
  folders: string[];
  pageSize: number;
  defaultLanguage: string;
  defaultSortField: string;
  defaultSortDir: string;
}

export interface LanguageVariant {
  flag: string;
  name: string;
  color: string;
  field: string;
  baseLang: string;
}
