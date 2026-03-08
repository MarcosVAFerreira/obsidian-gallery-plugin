# 🖼️ Note Gallery — Obsidian Plugin

A rich, visual gallery view for your Obsidian vault. Browse notes as cards with covers, ratings, type badges, and powerful filters — no Dataview required.

---

## ✨ Features

- **Visual card grid** — cover images, type-coloured badges, star ratings, status labels
- **Multi-folder support** — aggregate notes from any folders you choose
- **Rich filtering** — filter by type, subtype, status, available language, and image presence
- **Sorting** — sort by title, creation date, or file name (ascending or descending)
- **Multilingual titles** — display titles in 50+ languages including regional variants, ancient languages, and fictional languages (Klingon, Quenya, High Valyrian…)
- **Pagination** — configurable cards-per-page to keep large vaults snappy
- **Auto-refresh** — gallery updates automatically when you create, rename, or edit notes
- **Settings page** — configure folders, page size, and defaults without touching code

---

## 🚀 Installation

### From the Community Plugin Browser (recommended)
1. Open **Settings → Community Plugins → Browse**
2. Search for **Note Gallery**
3. Click **Install** then **Enable**

### Manual installation
1. Download the latest release from the [Releases page](https://github.com/yourusername/obsidian-note-gallery/releases)
2. Extract `main.js`, `manifest.json`, and `styles.css` into:
   `<your-vault>/.obsidian/plugins/obsidian-note-gallery/`
3. Enable the plugin in **Settings → Community Plugins**

---

## ⚙️ Setup

### 1. Configure folders
Go to **Settings → Note Gallery** and enter the folders to include (one per line):

```
1- Trajectory
2- Mastery
3- Wellness
Core/People
```

### 2. Add frontmatter to your notes
The gallery reads standard YAML frontmatter. Supported fields:

| Field | Description |
|---|---|
| `type` | Note type — see full list below |
| `subType` | Optional subtype / genre |
| `status` | Status label (e.g. "Reading", "Completed") |
| `cover` / `coverUrl` / `poster` | Cover image path (vault-relative or wikilink `[[path/to/image.jpg]]`) |
| `rating` | Personal score 0–10 |
| `onlineRating` | Online score 0–10 |
| `author` / `writer` / `director` / `artist` | Creator(s) — can be a YAML list |
| `series` | Series name |
| `englishGBTitle` | English (UK) title |
| `englishUSTitle` | English (US) title |
| `portugueseBRTitle` | Portuguese (BR) title |
| *(see full list below)* | All 50+ language title fields |

**Example frontmatter:**
```yaml
---
type: book
subType: Fantasy
status: Reading
cover: "[[Attachments/covers/dune.jpg]]"
rating: 9
author: Frank Herbert
englishGBTitle: Dune
portugueseBRTitle: Duna
---
```

### 3. Open the gallery
- Click the **grid icon** in the ribbon, or
- Run the command **Note Gallery: Open Note Gallery** from the command palette (`Ctrl/Cmd + P`)

---

## 🏷️ Supported Types

The `type` field accepts these values (English or Portuguese):

| Canonical | Aliases accepted |
|---|---|
| `Books` | book, livro |
| `Mangas` | manga, mangá |
| `Comics` | comic, hq |
| `Webtoons` | webtoon |
| `Manhwa` | manhwa |
| `Movies` | movie, filme |
| `Series` | series, série |
| `Music` | music, música, musicrelease |
| `Art` | art, arte |
| `Video Games` | video game, videogame |
| `Board Games` | board game |
| `Books` | book, livro |
| `Note` | note, anotação |
| `Reflection` | reflection, reflexão |
| `Quote` | quote, citação |
| `Academic Area` | academic area |
| `Knowledge Area` | knowledge area |
| `Professional Area` | professional area |
| `Scientific Experiment` | scientific experiment |
| `Log Date` | log date |
| `People` | person |
| `Wiki` | wiki |
| `Documents` | document, documento |
| `Others` | *(anything unrecognised)* |

---

## 🌍 Multilingual Title Fields

Add any of these fields to your frontmatter to enable multilingual display:

**Modern Languages**
`englishGBTitle` · `englishUSTitle` · `englishCATitle` · `englishAUTitle`  
`portugueseBRTitle` · `portuguesePTTitle`  
`spanishESTitle` · `spanishMXTitle` · `spanishARTitle`  
`frenchFRTitle` · `frenchCATitle`  
`germanDETitle` · `germanATTitle` · `germanCHTitle`  
`japaneseTitle` · `koreanTitle` · `chineseCNTitle` · `chineseTWTitle`  
`italianTitle` · `russianTitle`

**Ancient & Dead Languages**
`latinTitle` · `ancientGreekTitle` · `egyptianTitle` · `akkadianTitle`  
`sumerianTitle` · `oldNorseTitle` · `oldEnglishTitle` · `sanskritTitle`  
`phoenicianTitle` · `aramaicTitle` · `biblicalHebrewTitle` · `copticTitle`

**Fictional Languages**
`quenyaTitle` · `sindarinTitle` · `khuzdulTitle` · `blackSpeechTitle`  
`klingonTitle` · `romulanTitle` · `vulcanTitle`  
`hutteseTitle` · `mandoaTitle`  
`dothrakiTitle` · `valyrianTitle`  
`parseltongueTitle` · `naviTitle` · `minioneseTitle` · `newspeakTitle` · `lapineTitle`

**Constructed Languages**
`esperantoTitle` · `idoTitle` · `interlinguaTitle` · `volapukTitle` · `lojbanTitle` · `tokiPonaTitle`

---

## 🛠️ Development

```bash
# Clone
git clone https://github.com/yourusername/obsidian-note-gallery
cd obsidian-note-gallery

# Install dependencies
npm install

# Development build (watches for changes)
npm run dev

# Production build
npm run build
```

Copy `main.js`, `manifest.json`, and `styles.css` to your vault's plugin folder to test.

---

## 📄 License

MIT — see [LICENSE](LICENSE)

---

## 🙏 Acknowledgements

Originally inspired by a DataviewJS gallery script. This plugin removes the Dataview dependency and adds native Obsidian API integration, a settings UI, auto-refresh, and many improvements.
