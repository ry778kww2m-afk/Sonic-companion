# Sonic Companion v1.2 architecture

- `index.html` contains the UI, Spotify OAuth/player controller, local mock guide fixtures, and progress-based cue engine.
- `manifest.webmanifest` and the icon PNGs support browser/PWA metadata.
- `sw.js` is a one-time cache-cleanup worker for older app builds. The new page unregisters service workers and removes old shell caches; it does not register a new cache-first worker.
- `tests/run-build-tests.mjs` validates inline script syntax, timing helpers, UI markers, and seven guide fixtures.
- `tests/run-integration-tests.mjs` boots the embedded controller against a small simulated DOM and tests playback-follow behavior and selection safety.

## Playback contract
Spotify's `/v1/me/player` response is the source of truth. Search selection cannot issue play/pause commands. An explicit Play action requires Spotify to report an active, unrestricted device. Track changes replace the guide from the reported item. A 204/no-current-track response clears a guide that had been tied to live playback.

## Cue contract and limitation
Cue index is based on the cue's approximate fraction of Spotify-reported track duration. Progress is interpolated between polls while playing and held while paused. This does not inspect the audio waveform, recognize musical events, or guarantee score-verified timestamps. Fixtures are sample text, not live research; unknown tracks get generic listening prompts tied to their current metadata.
