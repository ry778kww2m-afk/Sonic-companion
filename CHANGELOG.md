# Sonic Companion v1.0.8 — Audio Lab Engine 2.0

## Fixed
- Removed the old Worker instruction/cap that limited each long excerpt to zero–five events.
- Changed to 30-second excerpts with 8-second overlap and a primary foreground pass.
- Added a complementary detail pass for excerpts with fewer than three primary events, targeting rhythm-section detail and ensemble interaction.
- Expanded deduplication to merge overlap copies without collapsing distinct instrument gestures.
- Added scaled density and continuity gates: minimum three moments per minute, maximum 45-second silent gap, and at least one event in every overlapping analysis window. Long sparse results are not publishable.
- Added per-moment progress bars to Audio Lab event cards, the active cue and full main-app cue list; retained the first-cue countdown, next-cue countdown and overall Spotify progress.
- Added stricter bilingual-content, timestamp and engine provenance validation in the Worker and browser bridge.
- Added production-function tests for the 9½-minute analysis plan, six-cue rejection, continuity-gap rejection, overlap deduplication and moment-bar accessibility state.

## Preserved
- Spotify playback integration and OAuth flows.
- Existing curated-guide behavior for non-So-What recordings.
- Existing Freddie Freeloader timeline/countdown regressions and guide catalogue routing.
- So What remains fail-closed: only direct-audio model output can populate its moments; no static or DSP fallback content is used.

## Scope and limitations
- Overlay package, not full-repository replacement.
- No real So What moments are bundled. A real audio/API run and human listening audit remain necessary to validate musical accuracy.
- No live Cloudflare deployment or physical iPhone Safari test was possible from this environment.
