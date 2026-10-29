# Install Sonic Companion v1.5 from iPhone

1. Download and extract this ZIP.
2. Open the GitHub repository `ry778kww2m-afk/Sonic-companion`.
3. Upload all files and folders INSIDE this ZIP to the repository root, replacing files with the same names.
4. Commit the changes to `main`.
5. Open `https://ry778kww2m-afk.github.io/Sonic-companion/?build=sonic-v15-track-truth-20261029`.
6. Confirm the banner says `SONIC COMPANION v1.5 · TRACK-TRUTH GUARDRAILS`.

No Cloudflare or API-key changes are needed. This build is local mock mode only and makes no paid API calls.

Important behavior: a known track-title fixture is required before any track-specific listening cues appear. For unsupported tracks, the app shows the exact Spotify title and artist plus “No verified cue for this track”; it hides the cue clock/progress bar rather than pretending the sample cues are synchronized. For supported fixtures, timing is still approximate progress-based guidance, not audio-event detection or verified timestamps.
