# Sonic Companion v1.0.8 — Audio Lab Engine 2.0

## What this release changes
This is an overlay release for the **Miles Davis — “So What”** proof of concept, restricted to the original 1959 studio recording on *Kind of Blue*.

The previous sparse-output failure had a direct cause: the old Worker explicitly asked for “zero to five” events per long excerpt and capped output at five. Engine 2.0 replaces that with:

- **30-second audio windows with 8-second overlap** (22-second stride), rather than 45-second windows.
- **A primary listening pass per window**, targeting distinct foreground performance events: phrases, motif development, articulation, rhythmic gestures, entries/exits, hand-offs and ensemble responses.
- **An adaptive complementary listening pass** whenever the primary pass returns fewer than three events. The second pass deliberately listens for piano comping/fills, bass motion, drum and ride-cymbal phrasing, counterlines, ensemble replies and other details missed by a foreground scan.
- Up to **six distinct events per pass/window**, with a 16,000-token response budget for detailed bilingual guidance. The model is asked for several separate moments in active passages, but must not split notes or invent cues to meet a quota.
- **Overlap deduplication** that merges repeated copies of the same audible event while retaining distinct instrument interactions.
- Detailed English and Brazilian Portuguese explanations for each event, plus a chronological excerpt-summary listening log.
- **Per-moment progress bars** in Audio Lab results, the main app’s active cue, and the full cue list. Bars show time until the moment, progress through its own duration, and completion. The existing next-cue countdown and Spotify track-level progress remain.
- **Fail-closed publication checks:** at least three distinct moments per minute, no silent gap longer than 45 seconds, and at least one event in every overlapping 30-second analysis window. For a 9½-minute recording, the current floor is 29 events; the exact accepted count is content-driven above that floor. Four or six cues cannot be published as a complete guide for a long recording.
- Strict event timestamp, bilingual-content, provenance, performer/instrument and exact-track checks in both Worker and browser bridge.

The model remains the sole source of musical moments. There are no pre-authored So What moments, preset timestamps, DSP-generated musical explanations, or mock results in the application path. **No `audio-lab/data` folder is needed**: the result is created only after processing the user-selected audio file and is stored only when the user publishes it.

## Pipeline and provenance
1. The browser decodes the selected audio and resamples excerpts to 24 kHz PCM WAV.
2. Each 30-second excerpt is sent as actual `input_audio` bytes through the Cloudflare Worker to `gpt-audio-1.5`.
3. The Worker requires JSON-shaped model output, validates it, and rejects malformed or underdeveloped content. It does not create replacement events.
4. The browser offsets excerpt-relative times into the complete track timeline, merges overlap duplicates, and evaluates density/continuity gates.
5. The browser bridge independently validates the record before it can be stored and applied to the matching Spotify guide.

The model API does not enforce structured output for this audio request. The Worker therefore parses and validates the response itself. The model’s confidence scores are subjective self-assessments, **not calibrated probabilities**.

## Important limitations — not to be overstated
- **No live musical validation is included in this code-only release.** No source recording or live API credentials were available to prove that the generated moments correctly describe the original master. The first successful real run must be audited by listening to the supplied file.
- The model may still mishear an instrument, phrase boundary or interaction. The density gate prevents a sparse guide from being published; it does not prove musical truth.
- File-to-Spotify identity is manual confirmation plus Spotify track ID and duration tolerance. It is **not acoustic fingerprinting** and does not prove the local file and Spotify stream are the same digital master.
- Performer attribution comes from the session roster only when the audible instrument and attribution are defensible. Model attribution and timestamp confidence remain uncalibrated.
- The tester token is visible to an authorized browser user and is only an internal POC gate, not production user authentication. Keep `OPENAI_API_KEY` server-side; add Cloudflare rate limiting and proper per-user authorization before broader use.
- This release has not been deployed to GitHub Pages or Cloudflare from this environment, and has not been exercised on a physical iPhone/Safari session. Local browser navigation was blocked by the execution environment. The automated tests use controlled DOM/API mocks for deterministic contracts; they do not substitute for live-device or listening validation.

## Deployment
See `UPLOAD_INSTRUCTIONS.txt`. This is a **targeted overlay**, not a full repository replacement. Keep the existing Spotify OAuth, icons, manifest, service worker, translation resources and other deployment files. The Worker must be deployed separately from the static GitHub Pages files.

## Automated QA
Run `npm test` from this package root (Node.js 20+). The eight suites cover source syntax/build integrity, bridge provenance and exact-track guards, Spotify permission UX, catalogue routing, existing guide timing/countdown regressions, So What model record validation, Worker audio/API contract, and Engine 2.0 overlap/density/timing behavior.

The Engine 2.0 suite calls the production planning and coverage functions for a synthetic 9½-minute timeline. The Worker API test stubs only the upstream OpenAI response inside the test harness. The application itself has no mock audio-analysis fallback.
