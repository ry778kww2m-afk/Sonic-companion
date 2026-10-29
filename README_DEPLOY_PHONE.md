# iPhone deployment — v1.3

1. Download and extract `SonicCompanion_v1_3_Focus_Playback_ROOT.zip`.
2. Open `ry778kww2m-afk/Sonic-companion` on GitHub.
3. Upload **all contents inside the extracted folder** into the repository root and replace same-named files, especially `index.html`, `manifest.webmanifest`, and `sw.js`. Do not upload the ZIP itself or create a nested subfolder.
4. Commit to `main`.
5. Open `https://ry778kww2m-afk.github.io/Sonic-companion/?build=sonic-v13-now-playing-20261029` and check the `SONIC COMPANION v1.3` banner in Full mode.
6. In the app, tap **Disconnect**, then **Connect / authorize controls** and approve Spotify's updated permissions. This is required after the scope update.
7. Start a track directly in Spotify to test following, or search in Sonic Companion and tap a result to request playback.

If the player says Spotify returned no current track, do not keep retrying search: first reconnect permissions and choose an output device in Spotify. The app intentionally sends no Play/Pause command if it cannot identify a safe target device.

No Cloudflare Worker or OpenAI API key changes are needed for this local mock build.
