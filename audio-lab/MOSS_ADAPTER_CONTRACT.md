# Optional semantic audio-model adapter contract

**Status: specification only. No MOSS model, weights, endpoint or inference credentials are included or invoked by this prototype.**

The current prototype measures signal changes locally. A future, separately hosted MOSS-Music or other legally cleared audio-language model may add semantic interpretation. Keep the responsibilities separate:

- DSP supplies a measured candidate time and a local evidence window.
- The model describes what may be happening within that window.
- A review/evaluation process decides whether that interpretation is trustworthy enough to publish.
- The playback clock always comes from the audio player's actual `currentTime`.

## Proposed input

```json
{
  "recording_id": "sha256-of-authorised-recording",
  "audio_uri": "private-temporary-object-uri",
  "duration_seconds": 246.8,
  "candidate_events": [
    {
      "event_id": "candidate-001",
      "anchor_seconds": 62.5,
      "evidence_start_seconds": 59.5,
      "evidence_end_seconds": 65.5,
      "dsp_features": {
        "structural_novelty": 0.31,
        "chroma_change": 0.24,
        "timbre_change": 0.45,
        "energy_change": 0.13,
        "rhythm_change": 0.08
      }
    }
  ]
}
```

## Expected model output

```json
{
  "recording_id": "sha256-of-authorised-recording",
  "model_id": "provider/model/version",
  "events": [
    {
      "event_id": "candidate-001",
      "description": "A sustained upper-register layer becomes more prominent",
      "event_type": "texture_change",
      "instrument_candidates": [],
      "performer_candidates": [],
      "evidence_start_seconds": 59.5,
      "evidence_end_seconds": 65.5,
      "model_confidence": null,
      "status": "unverified"
    }
  ]
}
```

The model may return no instrument or performer name. A missing or uncertain identification is preferable to a guess. Model-reported timestamps are treated as observations, not authoritative playback anchors; the DSP candidate anchor remains attached until validated.

## Integration gates

1. Confirm the exact release licence and model-weight provenance for commercial use.
2. Confirm serving API, GPU memory, throughput and per-hour hosting costs.
3. Benchmark against a human-annotated set of authorised recordings spanning jazz, classical, progressive rock and long-form improvisation.
4. Measure boundary precision/recall and instrument/solo-handoff classification separately.
5. Require source/evidence traceability and preserve the raw model output for audit.
6. Keep model output unverified until the validation process promotes it.
