# Sonic Companion v1.3 — Now Playing / Focus + Full

A static GitHub Pages companion that reads the track and progress Spotify reports, then displays an embedded **local mock guide**. It makes no OpenAI/Worker calls and has no API spend.

## What changed
- Moved the current listening cue and Focus/Full switch alongside the player, rather than burying it after a long article.
- Focus is the default. It shows only the compact player and one highlighted passage; the passage updates when reported Spotify progress crosses an approximate cue boundary.
- Full expands the guide and keeps the current cue available beside the player. The selected layout is remembered on that device.
- Tapping a search result explicitly requests playback. A guide for a different track is not treated as live until Spotify confirms the requested track.
- The app does not send a pause command as part of search selection. If no playback device is available, it tells the user and makes no play/pause request. It will not automatically transfer playback to an inactive device, to avoid interrupting the wrong output.
- A Spotify track started outside Sonic Companion is also followed, as soon as Spotify's Web API reports it.
- The previous service worker/cache is unregistered to reduce stale-page problems.

## Required Spotify reauthorization
After publishing this build, in the app tap **Disconnect**, then **Connect / authorize controls**, and approve the requested playback-status and playback-control scopes. This forces the consent screen. Spotify Premium is required for playback control. The app can only sync to the current track when Spotify's API reports a track and progress; if Spotify reports no current track, the UI explicitly says synchronization is unavailable rather than pretending it is live.

## Deploy from iPhone
1. Extract this ZIP.
2. In the root of the GitHub repository, upload and replace every file/folder from inside this ZIP (do not upload the ZIP itself).
3. Commit to `main`.
4. Open the version-check URL below. Confirm the `v1.3` banner in Full mode, then disconnect/reconnect Spotify once.

Version-check URL: `https://ry778kww2m-afk.github.io/Sonic-companion/?build=sonic-v13-now-playing-20261029`

## Verification
Run `node tests/run-build-tests.mjs` and `node tests/run-integration-tests.mjs` in a Node environment. Tests use mocked Spotify responses and a simulated DOM. They cannot validate your actual Spotify account, Premium status, connected device or the live deployment.

## Important timing limitation
Cue times are approximate fractions of a track's reported duration. This build does not analyze the audio waveform or detect phrase/instrument events, so it is not sample-accurate or score-verified. Mock text is content for interface testing, not current web research, listener-review retrieval or verified recording-specific sourcing.
