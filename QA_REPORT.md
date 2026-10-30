# Sonic Companion v2.7 — Atomic Offline Translation QA

Build date: 2026-10-30
Scope: dynamic Spotify-linked/mock guide display and the bundled deterministic `pt-BR` translation memory.

## Defects corrected

1. **Partial phrase overlay:** v2.6 applied every dictionary hit and let the renderer fall back to English per field. One guide could therefore show Portuguese overview text alongside English cue titles, focus descriptions, musician notes, or historical notes.
2. **Repeated translation attempts:** after a translation promise completed, rendering the guide called the translation routine again. A successful or incomplete result could repeatedly trigger another lookup/render cycle.
3. **Non-atomic error state:** the previous partial status treated untranslated fields as an acceptable presentation state. v2.7 makes incomplete coverage an explicit fail-closed outcome.

## Atomic display policy

- The renderer inventories every editorial field it displays: guide title and overview/context/form/personnel/emotional/listener/balanced sections, plus each cue's title/focus/listen-for/why-it-matters/musician-moment/historical-note/question.
- A field already carrying an editorial Portuguese override is accepted as covered.
- Every remaining English source field must resolve to a non-empty approved Portuguese memory entry.
- The Portuguese overlay is committed only when `missing.length === 0` and `translatedCount === totalCount`.
- If one or more fields are missing, the translation map is discarded and the *entire editorial guide* is rendered from its English source. It does not mix languages between cards or inside a card.
- Static interface labels and timing metadata continue to use their existing locale-specific labels. Spotify track/artist/album names and source names remain metadata, not translated editorial prose.
- A guide's translation result is evaluated once per guide object; a render after completion cannot recursively start another translation attempt.
- The curated Rhapsody adapter now keeps English canonical and does not fill absent Portuguese overrides with English text.
- If the memory fails to load or validate, the entire editorial guide remains English.

## Automated checks — PASS

- Translation core passes Node syntax validation.
- Atomic completeness rejects any result with missing fields.
- Atomic completeness rejects count mismatches even if the missing array is incorrectly empty.
- Atomic completeness validates the actual translation map has one entry per expected field.
- The localized field picker has no English fallback when Portuguese is selected; a broken invariant cannot reintroduce mixed-language content.
- Complete result is accepted only when translated and total counts match and missing is empty.
- Requested Portuguese resolves to Portuguese only for `ready` or `native` states; `loading`, `incomplete`, `error`, and `idle` resolve to English.
- Language picker uses one effective locale and never falls back per field from Portuguese to English.
- HTML translation flow discards partial maps and cannot assign `partial` as a display status.
- One-attempt-per-guide guard prevents render-triggered repeat translation loops.
- Curated Rhapsody regression test verifies that missing Portuguese values remain missing rather than being mislabeled English copy.
- Application and translation core JavaScript syntax checks pass.

## Known limitation — deliberate, not hidden

This remains an exact-phrase, pre-authored translation memory, not general machine translation. Newly generated or changed prose is not automatically translated. A coverage scan of the 84 available mock track guides across nine album fixtures found 27 fully covered guides (32%); 575 field occurrences were missing approved entries. In that scan, all 10 Dark Side of the Moon guides were incomplete. Therefore v2.7 will show those incomplete guides entirely in English rather than mixing languages. To make them fully available in Portuguese without AI/API cost, their missing strings must be translated and reviewed, then added to the shared memory. No partial Portuguese is presented as a complete translation.

## Deployment validation still required

This package has not been deployed to the live GitHub Pages repository or tested in the user's live iPhone/Spotify session. After uploading, verify the v2.7 build identifier and exercise both full-guide and focus modes with a known fully covered guide and a deliberately incomplete guide. The latter must remain entirely English in its editorial content.
