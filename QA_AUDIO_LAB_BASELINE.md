# QA report — Sonic Companion Audio Analysis Lab 0.1.0

## Scope

The prototype is a standalone browser application with two modes: the pre-existing mock catalogue and local analysis of an authorised audio file. No live Spotify integration, hosted inference, MOSS weights or external AI API calls are included.

## Automated checks performed

| Check | Result | Detail |
|---|---|---|
| JavaScript syntax | PASS | Inline application script passes `node --check`. |
| Catalogue integrity | PASS | 10 profile/work families, 96 track entries, 934 existing cue records. |
| Album selection | PASS | All 10 album selectors populate and track counts sum to 96. |
| Mock cue rendering | PASS | Tested Kind of Blue and Thick as a Brick; 36 cues render for Thick as a Brick Part I. |
| Audio decode + DSP path | PASS | Browser-generated 40-second synthetic test audio decoded and analysed locally. |
| Expected synthetic boundaries | PASS | Four candidate changes found at 8, 16, 24 and 32 seconds, matching the designed synthetic transitions. |
| Estimated tempo | PASS, approximate | Synthetic example reports 120 BPM. The UI and documentation explain half/double-time ambiguity. |
| Playback-clock synchronisation | PASS | Seeking the audio element updates the active event based on its actual `currentTime`. |
| Browser JavaScript errors | PASS | No uncaught JavaScript errors during the tested flows. |
| Mobile layout | PASS | 390 px viewport; document width remains 390 px with no horizontal overflow. |
| File selection and decode | PASS | Playwright selected a local 1.7 MB WAV through the file input; the browser decoded and analysed it locally and produced the same four expected candidates. |

## Synthetic test result

- Duration: 40 seconds.
- Analysis hop: 0.5 seconds.
- Event candidates: 00:08, 00:16, 00:24, 00:32.
- The generated source deliberately changes rhythmic activity, harmonic content and energy at those transitions. It is a technical signal, not a musical performance.

## Not tested / not claimed

- No physical iPhone/iPad Safari session has been tested.
- No real copyrighted or user-owned recording has been included in the package or benchmarked here.
- No human-annotated ground-truth comparison has been performed.
- No MOSS-Music inference was run; MOSS is not connected or packaged.
- No instrument identification, soloist identification, downbeat estimation, score alignment or formal-section recognition is claimed.
- The relative event `strength` is not a calibrated probability.
- The app does not connect to Spotify and must not be interpreted as approval of Spotify-synchronised visual commentary.

## Release assessment

**Prototype ready for controlled experimentation, not production release.** The local playback clock is deterministic, but DSP novelty candidates still need benchmarking and human review before becoming published musical cues.
