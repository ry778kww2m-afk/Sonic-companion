# Changelog

## v1.2 — Live Cues and Focus/Full modes
- Prominent current-cue hero with focus, listening detail, explanation, progress bar, and elapsed/duration display.
- Focus mode hides all surrounding app sections, leaving the player and highlighted cue; Full guide restores the full app.
- Playback polling drives guide identity and cue progress for tracks started either in Sonic Companion or directly in Spotify.
- Search-result selection no longer commands Spotify playback; explicit Play is separate and requires a confirmed active device.
- Fixes a duplicate `autoFollowPlayback` function that previously overrode the playback-source flag and allowed a search target to disturb live-guide state.
- Clears stale live guide content when Spotify reports no active track or the user disconnects.
- Local mock fixtures cover seven scenarios including Goldberg Aria and Variation 1, plus the five other works and a generic fallback.
- Includes build and controller integration tests.
