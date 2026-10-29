# Sonic Companion v1.5 architecture and guardrails

- `index.html` contains the UI, Spotify Authorization Code with PKCE flow, track search, playback polling, guide fixtures and pure progress/cue logic.
- Search/result selection requests playback only through the explicit play path; live guide identity changes only after Spotify's current-playback endpoint reports that track.
- Local mock fixture matching requires both a recognized profile and a recognized track-title entry. An album/artist-only match is insufficient, preventing other movements/tracks from inheriting the wrong cue timeline.
- Unknown tracks use a no-guide state with no musical claims, no cue time, and no cue progress bar.
- Known fixture cues use percentage-of-track progress thresholds for interface testing. They are NOT recording-specific event timestamps, score alignment, or audio recognition. Exact recording-specific synchronization requires validated cue timings for that exact Spotify recording or an audio-analysis pipeline.
- This build does not call OpenAI, Cloudflare, or external research endpoints.
- `sw.js` exists only to unregister/clear stale shell caches; it intentionally does not cache page responses.
- Tests: `tests/run-build-tests.mjs` and `tests/run-integration-tests.mjs`.
