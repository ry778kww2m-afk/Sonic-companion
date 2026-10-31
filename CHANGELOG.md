# Sonic Companion v1.0.3 — 2026-10-31

## Fail-closed guide provenance

- Removed hard-coded demo-guide fallback from normal Spotify auto-follow and manual guide lookup.
- Unknown recordings now render an unavailable state rather than demo commentary.
- Preserved the supported offline Rachmaninoff album-section guide with explicit curated-offline provenance.
- Enabled Audio Lab DSP candidates to populate an empty analysis-only guide shell after exact Spotify track ID and duration validation.
- Added distinct `audio-analysis-only` guide state and explicit DSP-only labels/timing wording.
- Kept existing authored editorial cues additive and unchanged when matching DSP candidates are attached.
- Updated app version to `1.0.3` and bridge version to `1.0.2`.

## Known limitations

- No live research service is configured in this build.
- Audio Lab is signal analysis, not semantic music recognition.
- Manual recording confirmation is not acoustic fingerprinting.
- Live GitHub, iPhone Safari and Spotify end-to-end behaviour were not tested in this environment.
