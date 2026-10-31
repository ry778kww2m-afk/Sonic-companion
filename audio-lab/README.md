# Sonic Companion — Audio Analysis Lab (Prototype 0.1.0)

A separate, local-first proof of concept. It does **not** modify or replace the existing Sonic Companion application.

## What is included

- The existing MIE 1.3 mock catalogue, reduced to the same **10 album/work families and 96 track entries** from the supplied project fixture.
- A mock-catalogue mode with the previously authored cue content and approximate editorial positions. It is explicitly labelled as mock data.
- A real browser-local audio analysis mode. Select an audio file you are authorised to process; it remains on the device and is never sent to an API.
- Feature extraction using windowed FFT: chroma-like pitch-class energy, spectral bands, RMS energy, spectral flux and centroid-derived information. A checkerboard-like self-similarity contrast compares within-window similarity against cross-window similarity to identify candidate section changes.
- Change-point candidates using checkerboard-like self-similarity novelty plus harmonic, timbre, energy and onset-activity contrasts between preceding and following windows.
- Local audio playback; cue activation follows `HTMLAudioElement.currentTime`, not a separate timer.
- A generated synthetic test signal, so the analysis path can be tried without selecting copyrighted music.
- Mobile safety limits of 100 MB and 8 minutes per recording, with processing yielding periodically to keep the UI responsive.

## Run it

Open `SonicCompanion_AudioLab.html` directly in a modern browser, or host `index.html` as a static site (for example, GitHub Pages). The mock catalogue is embedded in the page, so no database or backend is required. For best iPhone compatibility, host it over HTTPS.

## Test it without any audio file

1. Open **Analyse an audio file**.
2. Press **Create synthetic test audio**.
3. Wait for local analysis to finish.
4. Play the generated test signal. The event card follows the actual audio playback clock.
5. Switch to **Mock catalogue** to browse the previously worked-on works and tracks.

The generated 40-second signal is only a technical test signal with deliberately varied sections. It is not a musical performance or a substitute for a real recording benchmark; its designed boundaries are at approximately 8, 16, 24 and 32 seconds.

## Method and honest limitations

This build uses signal-processing evidence, not a neural audio-language model. It identifies *candidate changes* in the measured recording:

- spectral-band / timbre distribution shifts;
- chroma-like pitch-class distribution shifts;
- local self-similarity novelty (within-window similarity versus between-window similarity);
- short-window RMS energy differences;
- onset-related spectral-flux activity changes.

A transition candidate is derived from differences between the mean feature vectors in a short window before and after a point. Nearby local maxima are selected with a minimum spacing constraint. A detected change is **not proof** of a new formal section, soloist entry, instrument entrance or harmonic modulation. The UI intentionally reports the dominant measured signal feature rather than hallucinating a named instrument.

Estimated tempo is coarse and may be half-time or double-time. The prototype does not estimate downbeats, transcribe notes, recognise performers, align a score, or validate event semantics. The `strength` score is a relative ranking score, not a calibrated probability or confidence percentage.

### MOSS-Music integration status

MOSS-Music is **not bundled or invoked** in this prototype. Its weights are large and require a separate inference runtime. No inference endpoint, credentials, GPU or AI service is configured here. The code is deliberately structured so a later server-side MOSS stage can enrich DSP candidates with semantic descriptions, but the model must be benchmarked and legally reviewed before being connected. Do not interpret the present signal labels as model-generated musicological understanding.

## Rights and safety

- Only process audio you have the right and permission to analyse.
- The prototype does not connect to Spotify or retrieve Spotify audio/metadata.
- No audio file is uploaded or transmitted; browser decoding and analysis are local.
- The included catalogue is mock/editorial data reused from the supplied Sonic Companion MIE 1.3 project file. Its cue positions are approximate authored guide positions, not the output of the analysis algorithm.
- Do not imply that any album's actual recording was analysed by this prototype unless you upload and analyse that exact recording.

## Files

- `SonicCompanion_AudioLab.html` — standalone single-file prototype.
- `index.html` — same page, ready to serve as the root of a static site.
- `data/mock-catalogue.json` — readable copy of the ten existing mock catalogue families and 96 tracks.
- `PROTOTYPE_NOTES.md` — engineering decisions and next steps.
