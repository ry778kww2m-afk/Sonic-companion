# Sonic Companion v1.0.10 — Audio Lab Engine 2.1

## Release objective
This is a targeted overlay for the **Miles Davis — “So What”** proof of concept, restricted to the original 1959 studio recording on *Kind of Blue*. The release fixes a producer/consumer mismatch from v1.0.8: Audio Lab wrote Engine 2.1 records while the app bridge still accepted Engine 2.0 records. Those records were rejected before rendering. The matched v1.0.10 app and bridge now share the same versioned contract, and the actual renderer is covered by a 9½-minute/38-moment integration test.

## Audio analysis engine
- **30-second audio windows with 8-second overlap** (22-second stride). A 9½-minute file creates 26 overlapping windows.
- **Two mandatory passes for every window:** a foreground-performance pass and an independent ensemble pass that deliberately listens for piano, bass, drums/cymbal articulation, inner voices, counterlines and player-to-player responses. A third depth audit runs for windows with fewer than five moments or insufficient instrument/event-kind diversity.
- Up to **six distinct events per pass/window**. With up to three passes and 40 maximum windows, the bridge permits up to 720 model events before deduplication. The actual count is content-driven, not preloaded or fixed.
- **Four-window concurrency** reduces turnaround while keeping request fan-out bounded.
- **Overlap deduplication** merges likely copies of the same event from overlapping excerpts/passes while preserving independent same-pass gestures.
- Detailed English and Brazilian Portuguese explanations for every event, plus a segment-by-segment listening log.
- The audio bytes—not Spotify metadata, DSP features or general knowledge—are sent to GPT-Audio 1.5. The model is the sole source of musical event descriptions and timestamps. No static So What cue catalogue or synthetic fallback is in this path.

## Density and continuity gate
The release requires at least **four distinct moments per minute**, no gap longer than **30 seconds**, and at least one event in every overlapping analysis window. A 9½-minute recording therefore needs at least **38** model events. Four or six events are rejected; they cannot be published as a complete guide. This is a *minimum publication threshold*, not a request to fabricate events: the engine must reject thin output rather than manufacture filler. A high event count is not proof of musical correctness; the descriptions and timestamps still require listening-based validation.

## Timing UI and integration fix
- Every model-generated card in the full cue list has its own **countdown/progress bar**, showing time until its interval, progress through that interval and completion.
- Every active model cue also has its own progress bar. The existing next-cue countdown and whole-track Spotify progress remain.
- A model guide now opens in **Full view** so the per-card timing bars are visible immediately; the user can manually switch to Focus.
- The app displays build version, bridge version and actual model cue count. A stale/missing bridge is visible instead of being mistaken for a successful model guide.
- The app bridge validates engine version, direct-audio provenance, track ID, duration, recording identity, minimum density, continuity and full-window coverage before it applies a record.

## Pipeline and provenance
1. The browser decodes the selected audio and resamples excerpts to 24 kHz PCM WAV.
2. Each excerpt is sent as actual `input_audio` bytes through the Cloudflare Worker to `gpt-audio-1.5`.
3. The Worker parses and validates the model response, bilingual content, timestamps, instrument/role vocabulary and roster-constrained performer labels. It does not invent replacement events.
4. The browser offsets excerpt-relative timestamps to the full track, merges overlap duplicates, and evaluates the density/continuity gate.
5. The matching v2.1 bridge validates the full record again before storing and attaching it to the exact Spotify track.

The audio request does not use Structured Outputs. The Worker therefore performs explicit JSON parsing and schema validation. Model confidence values are subjective self-assessments, **not calibrated probabilities**.

## Automated QA
Run `npm test` from this package root (Node.js 20+). Nine Node.js suites cover:
1. Build integrity and inline/Worker JavaScript syntax.
2. Bridge provenance, exact Spotify ID/duration checks and invalid-record rejection.
3. Spotify permission guidance and UI regressions.
4. Guide catalogue routing and exact track resolution.
5. Existing track countdown, active-cue progress and full-list timing regressions.
6. So What direct-audio model record schema and performer attribution constraints.
7. Worker API request/response validation, token/origin/secret guards (upstream model response mocked only in the test harness).
8. Production Engine 2.1 window planning, coverage, deduplication, timestamp normalization and timer update functions.
9. **End-to-end producer/consumer/render test:** a test-only 9½-minute/38-event record is validated by the real v2.1 bridge, applied to the real guide shape, and passed through the app's actual `renderDynamicGuide()` function in a deterministic DOM harness. It asserts that all 38 cues and all 38 per-moment bars are rendered and Full view is active. Test fixture content is never part of the app's production content.

## Limitations — do not overstate validation
- **No live musical validation is included in this code release.** The actual original *So What* audio and live OpenAI API credentials were not available here. The 38-event integration fixture is synthetic test data used only to test the bridge and renderer; it is not real model output and is not included in app content.
- The model may still mishear instruments, phrase boundaries or interactions. Density/continuity gates catch sparse output, not semantic musical errors.
- File-to-Spotify identity is manual confirmation plus Spotify ID and a 3-second duration tolerance. It is **not acoustic fingerprinting** and cannot prove identical digital masters.
- Performer/timestamp confidence is not statistically calibrated.
- A physical iPhone/Safari session, live Spotify playback, live Cloudflare deployment and real GPT-Audio musical correctness remain untested. Headless browser navigation was blocked by this execution environment; the renderer test uses a deterministic DOM harness, not a real mobile browser.
- The tester token is browser-visible and is only an internal prototype gate. Keep `OPENAI_API_KEY` server-side; add rate limiting and per-user authorization before broader use.

## Deployment
See `UPLOAD_INSTRUCTIONS.txt`. This is a **targeted overlay**, not a full-repository replacement. Preserve the existing Spotify OAuth configuration, service worker, manifest, icons, translation assets and other unrelated files. The Cloudflare Worker is deployed separately; GitHub Pages cannot execute `worker/index.js`.
