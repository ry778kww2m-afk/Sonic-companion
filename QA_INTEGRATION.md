# Audio Lab → Sonic Companion Integration QA

**Package:** 1.0.0  
**Scope:** local DSP export + static browser bridge into the existing v2.7 cue model.  
**Spotify OAuth/player implementation:** deliberately untouched.

## Automated results

| Test | Result | Notes |
|---|---|---|
| Bridge JavaScript syntax | PASS | Node syntax validation |
| Audio Lab inline JavaScript syntax | PASS | Extracted from HTML; JSON catalogue excluded |
| Bridge registration | PASS | Registers `window.SonicAudioAnalysisBridge` |
| Record schema validation | PASS | Correct schema and Spotify ID accepted |
| Invalid Spotify ID rejected | PASS | Fail-closed |
| Candidate events strictly ordered | PASS | Non-monotonic candidates rejected |
| Additive guide merge | PASS | Candidate cues added; authored cue preserved |
| Bilingual labels and details | PASS | Both `en` and `pt` fields included |
| Timestamp conversion | PASS | Candidate `at` fraction derives from seconds / Spotify duration |
| Analysis provenance | PASS | Record ID, method, version and hash reference attached |
| Idempotency | PASS | Same analysis cannot be appended twice to same guide instance |
| Spotify ID mismatch | PASS | No candidate cues attached |
| Duration delta > 3 seconds | PASS | No candidate cues attached |
| Non-track-specific guide | PASS | No candidate cues attached |
| Publish control after analysis | PASS | Re-enabled after successful analysis |
| New file selection | PASS | Clears stale analysis result and disables publishing |
| Synthetic test publishing | PASS | Explicit state and filename guard |

## Not yet verified

- Live Spotify OAuth or playback. Existing app code is not changed, but this package has not run against a signed-in Spotify account.
- Real-device iOS Safari and installed-PWA storage behavior.
- Browser-local file analysis on every supported iPhone/audio codec.
- Acoustic identity between the local file and Spotify stream. The user confirmation is manual; duration is only a secondary consistency check, not proof of identical master.
- Musical meaning of candidate boundaries. DSP descriptors are signal changes, not semantic recognition.
- Whether a given app deployment origin matches the Audio Lab origin. JSON export/import is the fallback.

## Release gate

Do not describe these markers as verified musical events. Do not remove existing guide content. Before broad use, manually compare candidate times against the exact recording, document false positives/negatives, and review Spotify developer policy for the intended synchronization use case.
