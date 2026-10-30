# Sonic Companion v1.7 — full requested catalogue + playback safeguards

This free local-mock build preserves the six original catalogues and adds the first attached album: Rachmaninoff's 2023 Deutsche Grammophon `The Piano Concertos & Paganini Rhapsody` Spotify edition.

## Catalogue coverage

- The six original catalogues: Goldberg Variations (Glenn Gould 1981), Coltrane Plays the Blues, Kind of Blue, Giant Steps, The Köln Concert and Clair de lune.
- The Rachmaninoff album's 37 Spotify tracks: 12 concerto movements and 25 individually indexed Rhapsody sections.
- The new Rachmaninoff fixture is tied to Spotify album ID `0v3T6fPnrptRXOrd854hIl`, expected performer identity and exact track titles. It rejects same-title tracks from other recordings/releases.

## Playback behavior

- The guide always follows the track Spotify actually reports, not the search selection.
- A search request never pauses, stops or transfers current playback. It uses the album context and exact track offset when available, verifies the actual current track ID, and can make one guarded exact-track URI retry if Spotify accepts the request but the old/no track remains.
- Polling and player mutations are serialized. Duplicate taps and other transport commands are blocked until a track switch is confirmed or times out.
- A successful HTTP 204 is not treated as proof that playback started. The app reports success only after Spotify confirms the exact track ID.
- Selecting the current paused track triggers a play/resume request instead of a no-op.
- Playback time interpolates between Spotify progress snapshots using a monotonic clock. Pause, seek, track changes and duration bounds are handled explicitly.

## Important limitations

All guides are offline mock educational content. Most cue positions are approximate progress phases, not verified musical-event timestamps or audio analysis. The Rhapsody sections are linked to the 25 Spotify album tracks; their note covers the complete segment and the clock displays track progress only.

Client code cannot guarantee Spotify's external service, network, device firmware or third-party clients will never fail. The app guarantees only that its own search path does not send Pause/Stop/Transfer and does not claim success until Spotify confirms the requested track.

Spotify's current Developer Reference includes a prohibition on synchronizing sound recordings with visual media. Review the current policy and obtain platform guidance before distributing this playback-linked guide.

## Run tests

```bash
npm test
```

This runs static/build checks and controller integration tests. It does not replace a real Spotify account/device test or iOS Safari smoke test.

See `README_DEPLOY_PHONE.md` for GitHub Pages deployment and `SOURCES.md` for source references.
