# Changelog

## v1.3 — 2026-10-29
- Made the current cue a dedicated panel beside the player, keeping it visible in Focus mode.
- Added Focus/Full state persistence; Full mode restores the long-form guide.
- Search-result taps now request playback, but only the current track reported by Spotify is shown as the live guide.
- Required an explicitly active Spotify device for play requests; inactive devices are never taken over automatically.
- Force Spotify consent display on reconnect so updated playback scopes can be approved.
- Improved the no-current-track and missing-permission messages, and cache cleanup.
- Validated inline-script syntax, all seven embedded track fixtures, cue progression, track changes, mode toggles, playback command count, safe device selection, and no-device safety.
