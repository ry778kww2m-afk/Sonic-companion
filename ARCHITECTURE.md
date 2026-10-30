# Sonic Companion v2.0 — Music Immersion architecture

## Cue model

A track-specific cue is an object with:

- `at`: approximate fraction of Spotify-reported track duration.
- `title`: the moment's short name.
- `focus`: what to direct attention toward.
- `listen`: a concrete musical detail to notice.
- `why`: why that detail matters to the arrangement, form or emotional arc.
- `question`: a short reflective prompt that encourages active listening.

Focus mode selects the active moment from `progress_ms` interpolated against a monotonic clock sample. Full view renders the complete moment sequence and approximate `m:ss` anchors. The current Spotify track ID remains authoritative; a guide is never attached to a search selection until Spotify confirms the exact track.

## Cue density by recording structure

- Coltrane Plays the Blues: six tracks, twelve individually written moments each.
- Kind of Blue: five tracks, twelve each. Sequences differ by modal design, shuffle blues, ballad architecture, compound-meter blues and five-mode improvisation.
- Giant Steps: seven original LP tracks. Twelve moments each except the 2:21 Countdown, which has eight. Track content distinguishes rapid harmonic cycles, blues, short-form reharmonization, recurring cycles, Syeeda's melodic character, Naima's ballad/session personnel, and Mr. P.C.'s minor blues.
- The Köln Concert: four Spotify sections with 22 / 15 / 14 / 9 moments. Long Part I is denser in moments than shorter Part IIc. Prompts follow changes in repetition, left/right hand roles, groove, blues inflection, register, density, spaciousness and closure.
- Goldberg (1981 Gould): 32 discrete Spotify tracks, six short prompts per movement. Per-movement metadata distinguishes canons at successive intervals, dance/genre variations, virtuoso/hand-crossing textures, the French Overture, the G-minor Adagio, Quodlibet and Aria da capo.

## Important identity and data rules

- Album identity is resolved before title matching. Featured artists cannot select a competing album profile.
- Goldberg title normalization strips Spotify's `Goldberg Variations, BWV 988:` prefix and variation performance-instrument suffixes while preserving the canonical movement number.
- Giant Steps includes all seven original LP tracks. Köln accepts `Part` and `Pt.` title conventions.
- Unknown albums/tracks remain fail-closed. No generic fallback content is shown.
- New cue records are interpreted by `mockCue`; legacy Coltrane array cues remain supported. The five-cue truncation was removed, allowing long journeys such as Köln Part I to render completely.

## Limits

Spotify provides playback identity and progress, not signal-level musical-event detection. `at` values are educational progress anchors estimated against the recording arc. They are not verified seconds of instrument entrances, score alignment or acoustic recognition. The content is offline educational mock material; no live research provider is connected.

## Future feature hypothesis

A potential personalisation layer could store opt-in listener notes for each exact Spotify track/recording and use them to shape later questions. Such notes must remain labelled as the listener's interpretation, separate from source-backed musical facts, with local-first storage and clear edit/delete controls. This is a product hypothesis, not included in v2.0.
