# Sonic Companion v1.9 — Spotify metadata matching and track-specific cue architecture

## Spotify metadata resolver

- The v1.8 matcher ranked fixture profiles using all credited track artists and the full display title before confirming the album. This caused featured artists (e.g. John Coltrane on Miles Davis's "So What") to influence album selection and remaster/feature suffixes to break exact title matching.
- v1.9 resolves the profile from the Spotify album name plus its expected primary artist first. Track-level artist credits are used only to confirm the album identity, never to rank competing profiles.
- Track titles are normalized for common Spotify decorations (`feat.`, `featuring`, `ft.`, remaster/year suffixes) before matching the canonical track entry.
- Köln Concert titles normalize `The Köln Concert, Pt. I`, `Pt. IIa`, and equivalent `Part I` spellings to the canonical `Part I`, `Part IIa` track keys.
- Album and artist identity are still required. The normalizer does not permit a title-only match or cross-album fallback; a same-title track on an unrelated album remains unavailable.
- Regression coverage exercises the same `buildSonicMockGuide` path called by Spotify live auto-follow and controller-level integration tests with Spotify-shaped metadata.

## Coltrane catalogue and cue model

- The former implementation defined a single five-item `profile.cues` array for the whole *Coltrane Plays the Blues* profile. The track entries held only short overviews, so each track inherited the same cue headings, same cue sequence and same approximate spacing. That was the root cause of the user's observation.
- v1.9 gives each of the six original LP tracks its own `tracks[trackTitle].cues` array, track-specific overview, personnel, form and interpretive summary.
- Each Coltrane track has 12 separate cue objects. The cues are unique in wording and subject, and use individually chosen progress fractions; no Coltrane track falls back to the profile-wide shared list.
- The builder now respects all 12 track cues instead of truncating the array at five.
- Each cue includes an attention prompt, a concrete listening detail, and a short explanation of why that feature matters. Full Guide lists every moment, while Focus mode shows the currently active one.
- Full Guide renders each cue as an approximate `m:ss` timestamp plus percentage using Spotify's reported duration. Focus mode selects the cue with the interpolated Spotify progress.
- The six tracks are: Blues to Elvin; Blues to Bechet; Blues to You; Mr. Day; Mr. Syms; Mr. Knight. The original release liner notes describe the recording session as October 24, 1960, list the quartet, and explicitly distinguish soprano/tenor saxophone and the two piano-less tracks.
- Track-specific roles correct prior inaccuracies: Blues to Bechet = soprano, bass, drums (no piano); Blues to You = tenor, bass, drums (no piano); Mr. Syms = soprano with a central McCoy Tyner piano solo; Mr. Day = tenor quartet with a hypnotic bass/piano backing; Blues to Elvin = tenor with a near-gospel piano opening; Mr. Knight = tenor with a distinctive piano/rhythm figure and sparse theme.
- Original Joe Goldberg liner notes are exposed as a source link in Full Guide, alongside MusicBrainz release/credits and Qobuz track credits/durations.

## Cue timing: explicit limitation

- Cue order and wording are song-specific; cue time boundaries are still approximate fractions of the current Spotify track duration.
- The app does not listen to or analyse the recording. Spotify's playback API returns the track ID and playback position, not the current musical event or instrument entrance.
- Therefore a cue timestamp is a convenient prompt boundary, not a verified score/audio event timestamp. UI labels explicitly say approximate. The build must not imply detection of a specific instrument or event at an exact second.
- To claim exact musical event timing, each cue boundary must be manually validated against the exact Spotify recording (or produced by a separately validated score/audio alignment workflow). This offline release does not claim that work is complete.

## Existing catalogue and player protections

- All six previous catalogues and the full Rachmaninoff 2023 DG catalogue are retained.
- The Rachmaninoff album is tied to Spotify album ID `0v3T6fPnrptRXOrd854hIl`: 12 concerto movements and 25 individually listed Rhapsody sections.
- Live guides are bound to the current Spotify track ID; search selection is only a requested destination.
- Player mutations are serialized with polling and one another; a switch-level lock is held through confirmation; duplicate search taps are rejected.
- Search-to-play never issues Pause, Stop or Transfer. An accepted HTTP 204 is not proof of playback; the current track must be read back and match the target ID.
- Playback clock interpolates from Spotify progress using a monotonic clock. Pause, seek, duration bounds and stale-state clearing remain covered.

## Tests

Run `npm test`. Tests parse all inline scripts, check all catalogue fixtures, require 12 unique cues for every Coltrane track, verify that all six have different cue sequences and dense cue coverage, assert track-specific instrument claims, and exercise the actual live auto-follow route and previous playback regression cases.
