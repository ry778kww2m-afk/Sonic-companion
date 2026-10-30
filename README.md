# Sonic Companion v2.0 — Music Immersion engine preview

This release expands the app from a sparse listening guide into a more engaging, track-specific **Music Immersion** experience. The app name remains **Sonic Companion** for now; “Music Immersion” is a product-direction and potential naming candidate, not a final rebrand.

## Immersion journeys in this build

| Catalogue | Coverage | Prompts per track / section | Total prompts |
|---|---:|---:|---:|
| Coltrane Plays the Blues | 6 tracks | 12 each | 72 |
| Kind of Blue | 5 original tracks | 12 each | 60 |
| Giant Steps | 7 original LP tracks | 12 each; Countdown 8 | 80 |
| The Köln Concert | Parts I, IIa, IIb, IIc | 22, 15, 14, 9 | 60 |
| Goldberg Variations (Glenn Gould 1981) | Aria + Variations 1–30 + Aria da capo | 6 each | 192 |
| **Total** | **54 track/section entries** | — | **464** |

Existing Rachmaninoff (12 concerto movements + 25 Rhapsody sections), Clair de lune, the six original album profiles and Spotify playback safeguards are retained.

## What changed

- Every Kind of Blue track now has its own sequence: the modal two-chord exchange of “So What,” the Wynton Kelly-led blues feel of “Freddie Freeloader,” the restrained ballad architecture of “Blue in Green,” the rolling 6/8 blues of “All Blues,” and the five-modal-area design of “Flamenco Sketches.”
- Giant Steps now covers all seven original LP tracks, including the previously missing “Syeeda’s Song Flute,” “Naima” and “Mr. P.C.” The cues reflect each tune’s distinct blues, ballad, harmonic and rhythmic character. “Countdown” has fewer moments because the recording is much shorter.
- The Köln Concert is treated as a continuous solo-piano improvisational journey. Long Part I gets 22 prompts; the other parts get their own distinct, denser or shorter sequences rather than an identical template.
- The complete 1981 Gould Goldberg recording is added as 32 Spotify movements. Each movement has six short, character-specific prompts so the short variations are not overloaded with an unrealistic number of moments. The sequence distinguishes canons, fughetta, gigue, French overture, Adagio, Quodlibet and the final Aria return.
- Every cue has a focus instruction, a concrete listening detail, why it matters, and a reflective question. Focus mode updates the current prompt as Spotify progress advances; Full view exposes the entire journey.
- The Coltrane Plays the Blues track-specific sequences remain intact at 12 prompts per song (72 total), including the corrected piano-less trios and soprano/tenor distinctions.

## Music Immersion naming and personalization — future exploration

“Music Immersion” is a promising descriptive name for the experience, but should be tested before replacing Sonic Companion. A future **My Interpretation** feature could let a listener save their own observations for a Spotify track or exact recording. Those notes could shape later prompts (for example, follow a listener’s interest in bass movement, melancholy, a particular instrument or a recurring motif). The product must keep the listener’s subjective interpretation separate from source-backed musical facts, be opt-in, allow editing/deletion, and avoid silently treating one user’s interpretation as objective truth. This feature is not implemented in v2.0.

## Timing and factual limits

Spotify supplies the current track ID and playback position; it does not provide acoustic event detection. Cue positions in this mock are **approximate progress anchors**, arranged to follow the musical arc and prompt attention. They are not manually verified event timestamps, score alignment or claims such as “the piano enters exactly at 1:42.” Exact recording-level synchronization still requires listening to each exact release master and validating cue boundaries against the audio/score.

New cue prose is authored in English; the app shell remains bilingual, but these new cue fields fall back to English in Portuguese mode until a reviewed translation pass is completed.

## Validation

Run:

```bash
npm test
```

The test suite verifies all 32 Goldberg movements, all five Kind of Blue tracks, all seven Giant Steps tracks, all four Köln sections, all six Coltrane tracks, the existing Rachmaninoff and other catalogues, question content, cue uniqueness and activation at every tested playback boundary. The complete ZIP must be extracted into a clean folder and tested before deployment.

This is still an offline educational mock build. No live Spotify account, iPhone playback device, GitHub Pages deployment, audio recognition or score-level cue validation was available for this release test.
