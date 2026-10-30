# Deploy Sonic Companion v1.9 from iPhone

1. Download and extract the v1.9 ZIP.
2. Open the GitHub repository `ry778kww2m-afk/Sonic-companion`.
3. Upload every file and folder inside the ZIP to the repository root, replacing files with the same names. Preserve the `.github/workflows/qa.yml` path.
4. Commit the changes to `main`.
5. Wait for the GitHub Actions `Sonic Companion QA` workflow to pass. Do not rely on a green commit alone; verify that GitHub Pages has published the new build.
6. Open `https://ry778kww2m-afk.github.io/Sonic-companion/?build=sonic-v18-coltrane-track-cues-20261030` to bypass a stale browser cache.
7. Confirm the visible banner says `SONIC COMPANION v1.9 · TRACK-SPECIFIC COLTRANE CUES · BUILD 2026-10-30`.
8. Check the six Coltrane tracks one by one, including the correct instrumentation and 12 distinct listening prompts per track. Test playback started directly in Spotify and a track switch initiated from the app.

The browser build uses local mock guide content and no paid research API. Spotify Premium and an active, controllable Spotify device are required for remote track-start commands. If Spotify does not report an active output device, select one in Spotify; this app will not transfer or pause playback automatically.

Before public/commercial distribution, review Spotify's current Developer Reference policy about synchronizing audio recordings with visual media.
