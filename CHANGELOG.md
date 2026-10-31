# Sonic Companion v1.0.7 — So What direct-audio model proof of concept

## Scope
- Adds a single-recording proof of concept for Miles Davis — “So What”, the original 1959 studio recording from *Kind of Blue*.
- The production Audio Lab contains no prewritten musical moments, sample timestamps, synthetic audio demo, or mock-result fallback.
- The user supplies an authorized audio file; the browser decodes it and sends 45-second PCM WAV excerpts with 10-second overlap to GPT-Audio 1.5 through the Cloudflare Worker.
- The model writes the event descriptions, listener guidance, audible-evidence statements and segment summaries in English and Brazilian Portuguese. It may return zero events.
- Each model-generated segment summary is retained as a chronological listening log. Events are deduplicated across overlap; no event is constructed from DSP feature shifts.

## Musical and provenance safeguards
- Recording personnel are supplied only as an identity-constrained roster, not as evidence that a player is audible.
- Named player/instrument combinations are checked against the session credits (e.g. Miles Davis/trumpet, Coltrane/tenor saxophone, Bill Evans/piano). An incompatible attribution is downgraded to an unidentified instrument.
- The bridge independently validates direct-audio model provenance, original So What / Kind of Blue identity, chunking metadata, event timestamps, bilingual content and player/instrument consistency.
- The main app suppresses its old pre-authored So What guide. No valid model record means no So What moments.
- Model confidence is labelled as self-reported and uncalibrated. The app exposes the model's reported audible evidence so the listener can audit it.
- File-to-Spotify identity uses user confirmation, Spotify track ID and duration tolerance only; it is not acoustic fingerprint verification.

## Security and deployment
- Adds an `AUDIO_LAB_TOKEN` tester secret and mandatory `ALLOWED_ORIGIN` check for the audio-analysis route.
- Keeps `OPENAI_API_KEY` server-side. Audio Lab sends a separate tester bearer token; it is not persisted in browser storage.
- The shared tester token is only an internal POC gate, not production user authentication. Add Cloudflare rate limiting and replace with per-user authorization before public exposure.
- Existing Spotify OAuth, playback controls, translation assets and countdown timeline remain in place.

## QA status
- Seven automated Node test suites pass, covering syntax, bridge provenance, catalogue routing, Spotify UI, legacy countdown timing, So What fail-closed behavior and the Worker audio-request contract.
- Worker API test mocks only the upstream response inside the test harness; the application itself has no mocked audio-model output.
- No live OpenAI request, browser device test, live Spotify playback test or model-level musical accuracy test was run. No actual So What audio file was present during this build.
