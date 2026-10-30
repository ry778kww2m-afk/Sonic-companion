# Deploy Sonic Companion v1.7 from iPhone

1. Download and extract the ZIP.
2. Open the GitHub repository `ry778kww2m-afk/Sonic-companion`.
3. Upload every file and folder inside the ZIP to the repository root, replacing files with the same names.
4. Commit the changes to `main`.
5. Wait for the GitHub Actions `Sonic Companion QA` workflow to pass. Do not rely on a green commit alone; verify the deployed site after Pages publishes.
6. Open `https://ry778kww2m-afk.github.io/Sonic-companion/?build=sonic-v17-full-catalogue-player-lock-20261029`.
7. Confirm the visible build banner says `SONIC COMPANION v1.7 · ALBUM-CATALOGUE + PLAYER-OPERATION SERIALIZATION · BUILD 2026-10-29`.
8. Because the requested Spotify scopes changed, tap Disconnect, then Connect / authorize controls, and approve playback-status and playback-control permissions again.

The browser build uses only local mock guide content and no paid research API. Spotify Premium and an active, controllable Spotify device are required for remote track-start commands. If Spotify does not report an active output device, select one in Spotify; this app will not transfer or pause playback automatically.

Before public/commercial distribution, review Spotify's current Developer Reference policy about synchronizing audio recordings with visual media.
