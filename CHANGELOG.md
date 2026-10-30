# Sonic Companion v1.9 — Spotify album/title metadata matching

- Fixed live guide lookup for Kind of Blue, Giant Steps and The Köln Concert by resolving the album from its own Spotify album metadata before examining track credits.
- Featured artists no longer influence album-profile selection; this fixes So What (feat. John Coltrane, Cannonball Adderley & Bill Evans) being misclassified as a Coltrane album track.
- Normalized common Spotify title decorations including feat./featuring credits, remaster/year suffixes, and Köln Concert part naming (Pt. I / Part I / Part IIa).
- Added both build-level and live-controller regression tests using realistic Spotify-style metadata, including wrong-album featured-artist collision rejection.

# Sonic Companion v1.9 — song-specific Coltrane moments

- Replaced the shared five-cue Coltrane album template with six individually authored track guides.
- Added all six original album tracks, including previously missing Mr. Syms and Mr. Knight.
- Each track now has 12 unique listening prompts (72 total), with track-specific attention instructions, musical detail and explanation; approximate progress anchors are spaced more frequently than the old generic 1–2 minute sequence.
- Removed the five-cue truncation so all 12 prompts are available in the UI and live cue engine.
- Added track-specific overview, personnel, form and emotional interpretation fields and made them override generic album profile text.
- Corrected Blues to Bechet to soprano saxophone with bass and drums and no piano; corrected Blues to You to tenor saxophone with bass and drums and no piano; identified the central piano solo in Mr. Syms; distinguished the hypnotic piano/bass support in Mr. Day; added the near-gospel piano opening and occasional saxophone harmonics to Blues to Elvin; and described the distinct rhythmic/piano setup and sparse theme in Mr. Knight.
- Added original Joe Goldberg liner notes, MusicBrainz track credits and Qobuz track credits as sources in the Coltrane Full Guide.
- Full Guide now shows an approximate `m:ss` cue position as well as a progress percentage, calculated from Spotify-reported track duration.
- Expanded tests to require six distinct ordered cue sequences, 12 unique moments per track, cue spacing no wider than 12% of the track, correct instrument presence/absence, and activation of all 72 cue thresholds through the live controller path.
- Retained prior album catalogue, Rachmaninoff route and serialized Spotify playback safeguards.
- Explicit non-claim: approximate progress anchors are not verified event timestamps or audio recognition.
