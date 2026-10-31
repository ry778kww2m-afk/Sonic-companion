# Sonic Companion v1.0.10 — Audio Lab Engine 2.1

## Fixed
- Corrected the Engine 2.1 producer/consumer contract mismatch: Audio Lab 2.1 records are now accepted by the matching v2.1 bridge used by the main app.
- Added an end-to-end bridge-to-renderer regression test proving that a test-only 9½-minute/38-cue guide renders all 38 per-moment progress bars.
- Model-generated So What guides now open in Full view so the per-cue countdown/progress bars are visible without manually changing modes.
- The app exposes build version, bridge version and actual model cue count in the listening guide metadata and badge.
- Every audio window receives an independent ensemble/detail pass; a third depth audit is adaptive to thin or narrow analysis.
- Increased bounded Audio Lab concurrency to four windows to reduce waiting on iPhone.
- Improved overlap deduplication so distinct gestures in the same pass are retained.
- Reconfirmed the fail-closed rules: four moments per minute minimum, maximum 30-second gap, every audio window covered, no invented/fallback events.

## Preserved
- Spotify OAuth, playback controls, active-track verification and existing whole-track progress/countdown.
- Existing guide catalogue behavior for other recordings.
- So What has no pre-authored cue or DSP-only musical-content fallback; only direct audio-model results can populate the cue list.

## Scope and limitations
- Targeted overlay; not a full-repository replacement.
- Nine automated Node.js suites pass, including the bridge → app renderer integration test.
- No genuine So What model result, live OpenAI API run, Cloudflare deployment, Spotify session or physical iPhone Safari session was available for validation in this environment.
