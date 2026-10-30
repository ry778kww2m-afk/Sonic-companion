# Sonic Companion v2.5 — MIE 1.3 Performer Notes + Next-Cue Countdown

This is an incremental patch for the existing Sonic Companion app, not a clean rebuild.

## What changed

- `index.html`: MIE 1.3 technical performer narratives, historical-context weighting, complete track-level performer/arrangement-note coverage across all 96 mock track fixtures, updated musical translation cache version, and a Focus-mode countdown to the next cue.
- `translation-worker/index.mjs`: musical translation prompt revision 5, preserving ensemble-role chronology and avoiding named-player inference from album-wide credits.
- Tests: full catalogue performer coverage, event timing/reading-gap assertions, translation shape/Worker checks and countdown pause/seek/boundary checks.

The Spotify controller and identity rules are retained. The countdown uses the same playback clock as cue selection. It is not a separate timer and does not use wall-clock time.

## Deployment

1. Back up the current root `index.html`.
2. Replace the repository-root `index.html` with the file in this package and commit it to GitHub Pages.
3. Update the existing Cloudflare translation Worker using `translation-worker/index.mjs` and deploy it. Prompt revision 5 invalidates prior shared Worker translations; the browser adapter is also versioned to revision 5.
4. Keep existing Spotify configuration, PWA assets, OAuth settings and GitHub workflow unchanged.
5. Open the deployed app with a fresh query string, for example `?build=sonic-v25-mie13-performer-timer-20261030`.
6. Verify Focus mode shows the shrinking next-cue bar and test pause, seek, next-cue transition and final-cue behaviour.

## Package contents

- `index.html` — replacement root app file.
- `translation-worker/index.mjs` — updated server-side musical translation adapter.
- `tests/translation-qa.mjs` — translation and catalogue traversal QA.
- `tests/mie13-qa.mjs` — MIE performer/cue/countdown QA.
- `MIE_1_3_PERFORMER_NARRATIVES_AND_COUNTDOWN.md` — model contract and limitations.
- `MIE_1_3_QA_REPORT.txt` — clean-extract test report.
- `TRANSLATION_SETUP.md` — Cloudflare translation Worker deployment and glossary.
- `SOURCES.md` — source references used to ground track and historical annotations.
- `wrangler.toml.example` — optional Worker configuration example.

## Run offline tests

```bash
node tests/translation-qa.mjs
node tests/mie13-qa.mjs
node --check translation-worker/index.mjs
```

These tests use fixture data and mocked Worker interfaces. They do not call OpenAI, deploy Cloudflare, connect to a Spotify account or verify real-time playback on an iPhone.
