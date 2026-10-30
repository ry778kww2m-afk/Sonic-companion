# Sonic Companion v1.7 — full album catalogue and serialized playback

- Preserved all six original local mock catalogues and their 22 existing live-playback track fixtures.
- Added the complete 2023 Deutsche Grammophon Rachmaninoff Spotify album as a seventh catalogue: 12 concerto movements plus all 25 separately indexed Rhapsody sections (37 Spotify tracks total).
- Connected the Rhapsody's separate 25-section curated catalogue to the automatic live Spotify playback route; the live controller no longer bypasses it.
- Added exact Spotify album-ID identity checking for the 2023 DG album, plus expected performer and exact track-title checks.
- Reworked search-to-play: selection never replaces the live guide before Spotify confirms the actual track ID; accepted HTTP 204 is not treated as proof of playback.
- Search-to-play uses Spotify's documented album context + exact track offset when album metadata is available, then verifies the actual current track. If the old track or no item remains after four readbacks, it rechecks the same active device and tries the exact track URI once.
- Added player-operation serialization: playback polling waits during device lookup and mutations; transport controls and duplicate search selections are blocked while a switch is unresolved; a switch lock remains through read-after-write confirmation.
- Search selection never sends Pause, Stop or Transfer. Missing/restricted active devices cause no mutation and display recovery instructions.
- Fixed the paused-same-track search case so selecting the current paused track issues a play/resume request instead of silently doing nothing.
- Retained monotonic playback-clock interpolation, pause freeze, seek re-anchoring, track-duration clamping, polling backoff and fail-closed stale-state clearing.
- Added live-route integration tests for all 22 original fixtures, all 12 concerto movements, all 25 Rhapsody sections, the search-to-play race, one-time fallback, duplicate taps, paused-track resume and deferred polls.
- Offline mock only: no live research, no audio recognition, no verified cue-event timestamps, no paid API use.
