# Sonic Companion v1.7 — architecture and release guardrails

## Catalogue and identity

- The six original local mock catalogues remain intact: Bach / Glenn Gould Goldberg Variations; Coltrane Plays the Blues; Miles Davis Kind of Blue; Coltrane Giant Steps; Keith Jarrett The Köln Concert; and Debussy Clair de lune.
- Added the exact Spotify album `0v3T6fPnrptRXOrd854hIl`: Rachmaninoff: The Piano Concertos & Paganini Rhapsody (Deutsche Grammophon, 2023). The Spotify edition has 37 tracks: 12 separately listed concerto movements plus 25 separately listed Rhapsody sections.
- The new album requires exact Spotify album ID, expected album/performer identity and exact movement title for the concerto mock fixtures. Rhapsody sections resolve through the curated 25-section catalogue using the exact album ID and track-title aliases (`Introduction`, `Tema`/`Theme`, `Var.`).
- The live guide is always bound to the current Spotify track ID returned by `GET /me/player`. Search selection is only a requested destination. The guide changes only after Spotify confirms the requested ID.
- Unknown or mismatched tracks show an unavailable state; they never inherit another album's cues.

## Playback controller

- App-originated Spotify Player API mutations are serialized against playback polling and one another. Polls arriving during a mutation are deferred.
- A switch-level lock remains active from search selection through Spotify read-after-write confirmation. Duplicate taps and other transport controls are blocked while a switch is unresolved.
- Search-to-play requires an active, non-restricted Spotify device. It first sends `PUT /me/player/play` using the documented album `context_uri` plus exact track `offset` when the result includes a Spotify album URI. If the old track (or no track) remains after four readbacks, it rechecks the same output device and makes one exact-track URI retry. It never sends Pause, Stop or Transfer from the search-selection path.
- A successful HTTP 204 is treated as command acceptance, not proof that the track is playing. The app does not report success or switch the guide until `GET /me/player` confirms the exact requested track ID. A failed confirmation is surfaced as a failure; it is not represented as successful playback.
- A selection of the already-current, paused track is treated as a request to resume/start it rather than a no-op.
- When no active controllable device is reported, no playback mutation is sent. The app asks the user to select an output device in Spotify rather than silently transferring or stopping playback.
- The visible clock is interpolated between Spotify `progress_ms` snapshots with `performance.now()`, clamped to track duration and frozen while paused. Spotify status polling runs every 2.5 seconds while visible; the UI clock updates every 250 ms.
- 429 responses trigger backoff. Failed or missing playback reads clear stale track/guide/time state.

## Timing and limitations

- Spotify provides playback progress, not audio-event recognition. The original mock cues are approximate progress phases, not score-verified musical-event timestamps.
- The Rhapsody's 25 Spotify album segments are separately listed score sections. Each section guide covers the complete current album-segment track; the clock shows Spotify track progress only and does not claim to detect an event inside that track.
- All content is local mock educational material. No OpenAI, external research, live reviews or paid API is called. This is not a source-verified music-research product.
- Spotify's current Developer Reference says Player API command execution order is not guaranteed when used with other Player API endpoints. This build serializes its own calls, but cannot guarantee that Spotify's service, device firmware, network or third-party Spotify clients never fail.
- Spotify's current Developer Reference also states that sound recordings may not be synchronized with visual media. Review the current Spotify Developer Terms and obtain platform guidance before public/commercial distribution of a playback-linked visual guide.

## Tests

Run `npm test`. The suite includes build parsing, 22 original track fixtures, 12 new concerto movements, 25 Rhapsody section mappings, exact album-ID mismatch rejection, clock interpolation/pause/seek bounds, stale-guide invalidation, search-to-play command serialization, album-context plus exact-track-offset request shape, one-time URI fallback, duplicate-tap rejection, paused-same-track resume, deferred polling during player mutations, missing/restricted device safety, 403/429 and sync-loss paths.
