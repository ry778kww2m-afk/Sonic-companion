# Sonic Companion v1.2 — Live Cues

This is the complete root-level GitHub Pages package.

## Install
1. Extract this ZIP on your phone.
2. In the existing GitHub repository, upload all files and folders in this ZIP to the repository root, replacing files with matching names. Do not put them inside a new folder.
3. Commit to `main`.
4. Open the version-check URL in `README_DEPLOY_PHONE.md`. Verify the v1.2 banner before testing Spotify.

## Behavior
- Follows the currently playing Spotify track, whether started through Sonic Companion or directly in Spotify. Polling checks current playback about every 4.2 seconds.
- Search result selection only loads/selects a guide; it does not start, pause, or switch Spotify playback. Use the separate Play button if you want to start the selected result.
- Focus mode shows the player and a large live cue; Full guide restores the broader app and all guide material.
- Mock content is local and free. No OpenAI or Cloudflare Worker request is made.
- Cue positions are estimates mapped to Spotify-reported playback progress. This build does not listen to audio or recognize exact musical events, and positions can differ by recording/edit.

## Tests
Run `node tests/run-build-tests.mjs` and `node tests/run-integration-tests.mjs` on a computer with Node.js to rerun the automated checks. The included test results were produced against this ZIP's `index.html`.
