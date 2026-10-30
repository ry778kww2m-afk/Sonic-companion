# Sonic Companion v2.6 — Offline Musical Translation

## What this package changes

This package replaces the previous AI-backed translation-worker design with a deterministic, zero-AI runtime translation memory for Brazilian Portuguese (`pt-BR`). English remains the only canonical guide content. The module looks up complete source phrases by a content hash and overlays the corresponding Portuguese text only at display time.

### Runtime properties

- No OpenAI API call, API key, translation Worker, Wrangler deployment, or paid translation service.
- No translation settings or tokens stored in browser local storage.
- No per-track/per-cue Portuguese copies written back into the guide catalogue.
- One static Portuguese translation-memory asset is shared across all tracks.
- Existing hand-authored Portuguese overrides are preserved.
- Unknown or newly edited English text stays in English. The module does not guess with word-by-word dictionary substitution.
- The memory is downloaded from the same GitHub Pages origin once per page session and is browser-cacheable. This is a normal static asset request, not a translation API request.

## Install into the existing GitHub repository

Do **not** upload this ZIP as a Cloudflare Worker. It is a GitHub Pages app patch.

1. Extract this ZIP.
2. In the existing repository `ry778kww2m-afk/Sonic-companion`, replace the root `index.html` with this package's `index.html`.
3. Upload the entire `translation/` folder to the repository root, preserving these files:
   - `translation/translation-core.js`
   - `translation/pt-BR.memory.json`
   - `translation/glossary.pt-BR.json`
4. Commit the changes to the production branch (`main`).
5. Let GitHub Pages publish the updated files, then refresh the app. If the browser retains an old page, close the tab and reopen the GitHub Pages URL.
6. Choose **Português (Brasil)** and load a curated track. The translation notice should report that the offline musical translation memory loaded.

Only `index.html` and the `translation/` folder are required for deployment. Keep your unrelated repository files unchanged.

## Cloudflare

No translation Worker is required. Do not deploy `SonicCompanion_MIE_1_3_Translation_Worker.mjs`, do not create `sonic-companion-musical-translation`, and do not add `OPENAI_API_KEY` or `TRANSLATION_ACCESS_TOKEN` for this feature.

Keep the existing `sonic-companion-research` Worker unchanged. It is a separate part of the app and is not used by the offline translation module.

## How the memory works

The current curated catalogue contains 2,622 user-facing English-only text occurrences across ten catalogue families. They reduce to 2,162 distinct source phrases. Each distinct phrase has one Brazilian Portuguese adaptation in the memory. The English source itself is not repeated in the memory file: the key is the first 128 bits of SHA-256 of the exact trimmed English string.

The module collects the English fields for the current guide, hashes each distinct string once, looks up the Portuguese adaptation, and overlays it on a temporary display copy. The original English object and cue timing/order remain unchanged. Identical phrases across albums share one memory entry.

The memory asset is currently about 316 KB uncompressed. There is still one Portuguese string per distinct English phrase; the saving comes from not storing duplicated translated copies throughout every track/guide record. This is a translation-memory solution, not zero-byte storage.

## Translation quality and future content

The phrase-level adaptations use Brazilian musician vocabulary for jazz, classical, orchestral and rock contexts. The accompanying glossary is an editorial reference for future additions; the runtime intentionally does not apply blind term replacement to unknown sentences.

A newly added or edited English phrase will remain in English until a corresponding Portuguese entry is authored, checked and added to `pt-BR.memory.json`. This is deliberate: a deterministic module cannot produce natural translations for arbitrary new prose without either a generative model or a pre-authored translation. This package chooses quality-safe fallback over pretending otherwise.

The memory format is locale-versioned and can be extended later with separate assets (for example, `es.memory.json` or `it.memory.json`) without duplicating the English catalogue. This release supplies Brazilian Portuguese only.

## QA scope and limits

The included build was tested for complete phrase coverage, one-entry reuse across repeated fields, preservation of canonical English, preservation of existing Portuguese overrides, fail-closed handling of unknown text, and absence of translation API/secret references. All five inline app JavaScript blocks and the offline translation core pass JavaScript syntax checks.

The 2,162 Portuguese adaptations have not yet received independent sign-off from a Brazilian musician/editor. They are a strong initial editorial memory, not a claim of external linguistic certification. The app's catalogue/timing content retains its existing QA limits.
