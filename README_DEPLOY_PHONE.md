# Sonic Companion v1.2 — simple iPhone deployment

1. Download and extract this ZIP.
2. Open your existing repository: https://github.com/ry778kww2m-afk/Sonic-companion
3. Upload **all files and folders inside the ZIP to the repository root**, replacing files with the same names. Keep `index.html` directly at the root—do not create a new folder.
4. Commit the change to `main`. Do not change Cloudflare or API secrets.
5. Open this link: https://ry778kww2m-afk.github.io/Sonic-companion/?build=sonic-v12-live-cues-20261029
6. Confirm the banner reads `SONIC COMPANION v1.2 · LIVE CUES · FOCUS / FULL · BUILD 2026-10-29`. Do not test playback unless that exact banner is visible.

## What to expect
- Start or change music directly in Spotify. Sonic Companion follows the track Spotify reports, checks position about every 4.2 seconds, and highlights a cue.
- Tap **Focus · live cue** for only the player and prominent current cue. Tap **Full guide** to return to the full app and all sections.
- Selecting a search result does **not** issue a Play or Pause command. The separate **Play selected track in Spotify** button starts it only if Spotify confirms an active device.
- No API credits, Cloudflare Worker, or OpenAI request is used.

## Honest timing limit
The highlighted cue is mapped to an estimated percentage of track progress, interpolated between Spotify polls. It is not live audio analysis and does not detect the exact instant a musical event occurs. For the Goldberg Variations, Aria and each variation have different guidance; the change of energy is described for each selected/playing movement, with approximate cues inside that movement.
