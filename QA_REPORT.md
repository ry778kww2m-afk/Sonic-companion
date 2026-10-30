# Sonic Companion v2.6 — Offline Translation QA

Build date: 2026-10-30
Scope: current curated Sonic Companion catalogue and the bundled deterministic `pt-BR` translation memory.

## Automated checks — PASS

- 2,162 distinct English source phrases each have one non-empty Brazilian Portuguese entry.
- The catalogue traversal identified 2,622 user-facing English-only text occurrences across ten catalogue families. Repeated source phrases share the same translation-memory entry.
- The one additional string in the raw extraction is `approximate-progress-proportions`, a technical timing-mode value, not user-facing prose; it is deliberately not translated.
- Exact-source SHA-256 lookup resolves all 2,162 phrase entries (128-bit key prefix).
- Repeated phrase in separate cue fields resolves to the same Portuguese translation.
- Unknown/new English copy is returned as missing; the UI keeps the English source and does not attempt dictionary substitution.
- Canonical English source objects remain unchanged after Portuguese overlay.
- Existing editorial Portuguese overrides are not overwritten.
- Translation memory is loaded once per page session and can be reused across all tracks.
- The current app HTML contains no translation Worker URL/token fields or OpenAI API key configuration.
- The offline translation core contains no OpenAI endpoint or API key reference.
- All five inline application JavaScript blocks and the offline translation core pass Node syntax checks.

## Architecture verified

- English stays canonical in the app catalogue.
- `translation/pt-BR.memory.json` contains one Portuguese adaptation for each distinct English phrase, keyed by a truncated SHA-256 digest. English source prose is not duplicated in that file.
- `translation/translation-core.js` selects fields, computes content hashes, retrieves exact phrase matches and overlays Portuguese only for display.
- No AI model, translation API, Cloudflare translation Worker, API secret, database write or per-track translation cache is used.
- Existing `sonic-companion-research` Worker is not modified by this package.

## Not tested / limitations

- No live GitHub Pages deployment, Cloudflare account, iPhone Safari session or Spotify account/device was used in this QA run.
- Portuguese wording has not received independent sign-off from a Brazilian musician/editor. The initial phrase memory was authored for this build and follows the supplied musical terminology policy, but should receive editorial review before public production release.
- Newly added or edited English wording has no translation until a matching Portuguese memory entry is authored and added. It deliberately remains in English in the meantime.
- This is an offline translation-memory system, not a general-purpose machine translation engine. It does not invent translations for arbitrary new prose.
