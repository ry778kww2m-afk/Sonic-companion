# Sonic Companion — segmented Spotify track fix

## What this fixes

Spotify connection and playback polling were already working. The old matcher only accepted a Rhapsody recording with a duration of at least nine minutes, so it rejected the 27-second first track in the 2023 Yuja Wang / Los Angeles Philharmonic album. That album splits the Rhapsody across Spotify tracks 10–34.

The updated `index.html` maps Spotify track numbers 10–34 to the 25 existing commentary sections and uses the current track's progress to update each passage. It also keeps the old support for one long, full-work recording.

## Update the published app

In the `ry778kww2m-afk/Sonic-companion` GitHub repository, replace **only** these two existing files with the versions in this package:

- `index.html`
- `sw.js`

Commit them to `main`. The `sw.js` cache version has been bumped so the updated page can replace the old cached app. Keep the existing `manifest.webmanifest` and icon files unchanged.

## After publishing

1. Open `https://ry778kww2m-afk.github.io/Sonic-companion/` on the iPhone.
2. If it still shows the old code, close the app/web tab, reopen the URL, and wait for the service-worker update. If necessary, open the URL in a fresh browser tab rather than the Home Screen shortcut for the first check.
3. Play a track in the target album: `Rachmaninoff: The Piano Concertos & Paganini Rhapsody` (Yuja Wang / Los Angeles Philharmonic / Gustavo Dudamel). The Rhapsody occupies Spotify album tracks 10–34.
4. On track 10, the app should show section 1; track 11 should show section 2; this continues through track 34 / section 25. The commentary updates continuously within each track and switches when Spotify moves to the next variation.

This build is specifically mapped to that album's track order and also supports a single long recording when Spotify reports its duration as at least nine minutes. It is not yet a universal live music-analysis system; unsupported albums are still identified but won't receive mapped cues.
