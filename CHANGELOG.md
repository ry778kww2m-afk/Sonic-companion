# Changelog

## v1.0 — automatic mock guide display
- Automatically request the free mock guide when a Spotify search result is selected.
- Normalize Worker URLs and force `mode=mock` for this test build, avoiding paid OpenAI API calls.
- Display the returned guide in the primary Listening guides panel, rather than only under the Research button.
- Hide the unrelated curated guide while the dynamic guide is active; a button restores curated guides.
- Add clickable listening cues and approximate playback-follow highlighting.
- Render current guide language after English/Portuguese changes.
