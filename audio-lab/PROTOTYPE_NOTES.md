# Engineering notes — Audio Analysis Lab 0.1.0

## Separation of concerns

1. **Mock catalogue mode** is a fixture viewer. It preserves the existing MIE cues but simulates the playback clock with a slider/timer. Cue times are approximate editorial fractions.
2. **Audio analysis mode** accepts a user-authorised audio file and measures that file in the browser. Cue activation is driven by the decoded audio element's playback time.
3. **Semantic model stage** is intentionally absent. MOSS-Music or another cleared audio-language model can be integrated later as an optional enrichment stage, never as the source of sample-accurate playback timing.

## Why a hybrid is preferable

Audio signal processing should determine candidate timing. The language model should interpret candidates and describe their musical meaning. It should not invent seconds, and it should not be trusted to provide precise event timing from prose context alone.

Proposed future event schema:

```json
{
  "event_id": "stable-id",
  "time_seconds": 42.5,
  "window_start_seconds": 39.5,
  "window_end_seconds": 45.5,
  "dsp_evidence": {
    "harmonic_change": 0.41,
    "timbre_change": 0.58,
    "energy_change": 0.12,
    "rhythm_change": 0.22
  },
  "model_interpretation": {
    "description": "A new upper-register instrumental layer becomes prominent",
    "instruments": [],
    "event_type": "texture_change",
    "evidence_span": [39.5, 45.5],
    "status": "unverified"
  },
  "editorial_status": "candidate"
}
```

The inference model may propose an interpretation, but only the DSP/local playback clock supplies the event anchor. Human review (or a validated independent evaluation) promotes a candidate to a confirmed musical cue.

## Next implementation milestones

- Benchmark candidate boundary precision/recall against manually annotated passages from recordings that Sonic Companion is authorised to process.
- Add audio-source provenance and recording fingerprinting outside the Spotify audio stream.
- Add a server-side MOSS inference adapter after confirming the released model's serving API, compute needs, commercial licence terms and training-data provenance.
- Store analysis jobs by recording fingerprint + analysis-pipeline version; deduplicate concurrent jobs; cache validated results centrally.
- Add a review UI to accept, reject, merge or move candidate events.
- Only after written provider approval, evaluate any Spotify metadata-driven visual synchronisation. This prototype intentionally contains no Spotify integration.

## Known technical limitations in this prototype

- Frequency-domain features use a single 0.5 second analysis hop and a short Hann window; low-frequency pitch resolution and transient timing are limited.
- Chroma is an approximate mapping from spectral bins to pitch classes, not a transcription or key/chord estimator.
- The novelty measure is a browser-friendly checkerboard-like self-similarity contrast over short windows, not a full Foote/MSAF implementation or a research-grade trained segmenter. Candidate anchors use a 0.5-second analysis grid with a 3-second preceding and following comparison window; reported timestamps are therefore approximate transition anchors, not sample-accurate event times.
- Tempo uses autocorrelation of spectral flux and can return half/double tempo.
- Event `strength` ranks detected candidates; it is not a calibrated confidence probability.
