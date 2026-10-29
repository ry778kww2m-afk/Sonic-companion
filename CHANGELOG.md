# Sonic Companion v1.5 — Track-truth guardrails

- Corrected a critical false-positive: a matching album/artist alone can no longer activate another track's timed cue sequence. A known track-title fixture is also required.
- For unsupported tracks (including Pianovus — Interstellar (Piano Version)) the live card identifies the Spotify track but refuses to invent instrument claims, musical events or time-aligned cues. The cue clock and progress bar are hidden for unverified selections.
- Supported mock fixtures retain approximate educational cue phases, explicitly labelled as progress-based estimates rather than audio/event detection or recording-verified timestamps.
- Corrected labels so the UI says Spotify progress is linked and cue timing is estimated; removed misleading “synchronized moment” language.
- Retained Focus/Full mode, playback-confirmation guard, no-pause-on-result behavior and no-active-device safety behavior.
- Automated build and controller integration tests cover all fixtures, unknown tracks, album-only false positives, progress updates, focus/full, external playback, track changes, no device, failed scope and no fabricated cue clocks.
- Offline mock only; no OpenAI call, external search or audio analysis.
