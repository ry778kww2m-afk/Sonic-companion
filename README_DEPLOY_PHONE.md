# Deploy Sonic Companion v2.0 — Music Immersion engine preview from iPhone

1. Download and extract the v2.0 ZIP.
2. Open the GitHub repository `ry778kww2m-afk/Sonic-companion`.
3. Upload every file and folder inside the ZIP to the repository root, replacing files with the same names. Preserve the `.github/workflows/qa.yml` path.
4. Commit the changes to `main`.
5. Wait for the GitHub Actions `Sonic Companion QA` workflow to pass. Do not rely on a green commit alone; verify that GitHub Pages has published the new build.
6. Open `https://ry778kww2m-afk.github.io/Sonic-companion/?build=sonic-v20-music-immersion-20261029` to bypass a stale browser cache.
7. Confirm the visible banner says `SONIC COMPANION v2.0 · MUSIC IMMERSION ENGINE PREVIEW · BUILD 2026-10-29`.
8. Check the enriched journeys:
   - All 32 Glenn Gould 1981 Goldberg tracks (six prompts each).
   - All five Kind of Blue tracks (12 prompts each).
   - All seven original Giant Steps tracks (12 prompts each, Countdown 8).
   - All four Köln Concert parts (22 / 15 / 14 / 9 prompts).
   - All six Coltrane Plays the Blues tracks (12 unique prompts each).
   Confirm the active question changes as playback progresses. Test a song started directly in Spotify and a track switch initiated from the app.

The browser build uses local mock guide content and no paid research API. Spotify Premium and an active, controllable Spotify device are required for remote track-start commands. If Spotify does not report an active output device, select one in Spotify; this app will not transfer or pause playback automatically.

Before public/commercial distribution, review Spotify's current Developer Reference policy about synchronizing audio recordings with visual media.
