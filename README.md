# Sonic Companion v1.9 — track-specific Coltrane listening moments

This release replaces the shared, generic five-cue Coltrane template with six song-specific listening sequences. It also preserves the complete seven-profile catalogue and previous Spotify playback safeguards.

## Spotify album matching fix (v1.9)

- Album profile selection now happens before track-title matching. Featured artist credits no longer make a Kind of Blue track look like a Coltrane album track.
- Spotify title decorations such as featured credits and remaster labels are normalized before matching.
- Köln Concert aliases such as `The Köln Concert, Pt. I` and `The Köln Concert, Pt. IIa` map to their canonical Part I / Part IIa fixtures.
- Album and primary-artist checks remain mandatory, so normalization does not weaken wrong-album collision protection.
- Regression tests cover the actual live auto-follow controller route for So What (with featured credits), Giant Steps (remaster label) and Köln Concert (Pt. naming).

## What changed for Coltrane Plays the Blues

- Covers all six original album tracks: **Blues to Elvin**, **Blues to Bechet**, **Blues to You**, **Mr. Day**, **Mr. Syms** and **Mr. Knight**.
- Each track has **12 individual listening prompts** (72 total), with unique titles, focus instructions, listening details, and explanations. The six tracks no longer inherit the same album-wide cue list.
- Prompts are distributed more frequently—roughly every 25–45 seconds depending on track duration—instead of one generic prompt every 1–2 minutes.
- Track-specific instrumentation is corrected: **Blues to Bechet** is soprano saxophone with bass and drums, no piano; **Blues to You** is tenor saxophone with bass and drums, no piano; **Mr. Syms** features soprano and a central McCoy Tyner piano solo; **Mr. Day** uses the full quartet and a hypnotic piano/bass bed; **Blues to Elvin** opens with a near-gospel piano figure; **Mr. Knight** has a distinctive piano/rhythm pattern and sparse theme.
- Full Guide now displays an approximate clock time (derived from Spotify's reported track duration) and percentage for each listening prompt. Focus mode switches the active prompt as playback progresses.
- Coltrane album metadata sources and Joe Goldberg's original liner notes are linked in Full Guide.

## Timing caveat

The prompt sequence and musical content are track-specific, but the cue boundaries remain **approximate progress anchors**, not verified event timestamps. Spotify provides playback position, not audio recognition. The prompts are based on the original liner notes, credited personnel and track-level musical descriptions; they do not claim that a particular instrument enters at the exact displayed second. Accurate event-level timing requires listening to the exact release recording and manually validating every boundary (or a separate permitted score/audio alignment workflow).

## Complete catalogue

- Bach / Glenn Gould — Goldberg Variations
- John Coltrane — Coltrane Plays the Blues (now all six original tracks)
- Miles Davis — Kind of Blue
- John Coltrane — Giant Steps
- Keith Jarrett — The Köln Concert
- Claude Debussy — Clair de lune
- Rachmaninoff / Yuja Wang / Los Angeles Philharmonic / Gustavo Dudamel — 2023 Deutsche Grammophon Piano Concertos & Paganini Rhapsody album (37 Spotify tracks)

## Playback safeguards retained

- Live guide changes only after Spotify confirms the exact current track ID.
- Search-to-play operations are serialized against status polling and each other.
- The search path never sends Pause, Stop or Transfer; it confirms the target after an accepted HTTP 204 and has one guarded exact-URI fallback.
- Playback time interpolates from Spotify position snapshots; pause, seek, track change, end-of-track and API errors are handled.

## Run tests

```bash
npm test
```

The suite validates all six Coltrane tracks through the fixture builder and actual automatic playback route, checks 12 unique cue titles per track, distinct sequences and cue spacing, tests key instrumentation claims, and runs the prior catalogue/playback regression suite.

This is still an offline mock build: no live research, audio recognition, or live Spotify / iOS browser test is included. See `SOURCES.md`, `ARCHITECTURE.md` and `TEST_RESULTS.txt`.
