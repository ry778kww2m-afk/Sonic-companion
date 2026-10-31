# Sonic Companion — So What Audio Model POC

## Scope
This package adds one real-audio proof of concept: **Miles Davis — “So What”, original 1959 studio recording from _Kind of Blue_**.

No sample moments, timestamps, event labels, or musical prose are hard-coded. The app sends overlapping excerpts from the user-selected audio file to **GPT-Audio 1.5**. The model returns the moments and their English/Brazilian Portuguese explanations. If it cannot substantiate a moment, it may return none. Parse errors and invalid timestamps fail closed.

The official Miles Davis discography supplies session personnel as identity constraints only: Miles Davis (trumpet), Julian “Cannonball” Adderley (alto saxophone), John Coltrane (tenor saxophone), Bill Evans (piano), Paul Chambers (bass), Jimmy Cobb (drums). It distinguishes the March 2, 1959 studio session from the 1960 live “So What”. The source does **not** supply event timestamps or musical moment text:
https://www.milesdavis.com/news/kind-of-blue-by-miles-davis-1959-jazz-standard-celebrates-50-years/

## Important limits
- The uploaded file is sent to the Cloudflare Worker and then to the OpenAI API. API charges may apply. The request uses `store:false`; do not treat that as a blanket statement about all API data-retention policies.
- Audio is split into 45-second excerpts with 10-second overlap, resampled by the browser OfflineAudioContext to 24 kHz PCM WAV, and sent to GPT-Audio 1.5. The Lab refuses a low-quality resampling fallback if OfflineAudioContext is unavailable.
- The model's event times and performer attributions are estimates. Its confidence scores are self-assessments, not statistically calibrated probabilities. Review the model-reported audible evidence, event boundaries and performer attributions against the original audio.
- The Spotify match is manual confirmation + exact Spotify track ID + duration tolerance (3 seconds). This is **not** an acoustic fingerprint or proof that the local file and Spotify stream are the same master.
- The tester token is visible to an authorized browser user (for example in developer tools) and only reduces casual endpoint abuse. Do not treat it as authentication for a public product. Rotate it and configure Cloudflare rate limiting before broader access.
- The Lab preserves each model-generated excerpt summary as a segment-by-segment listening log. This is not a separately invented whole-track analysis.
- No real So What output has been generated in this build because no source recording was supplied during development. The first run on an actual authorized audio file is the live model evaluation. The code-only test suite does not establish musical accuracy.
- GPT-Audio 1.5 does not support structured-output enforcement. The Worker asks for JSON and validates it strictly; malformed output is rejected, never repaired with synthetic content.

## Deploy

### 1. Cloudflare Worker
1. Open the existing `sonic-companion-research` Worker in Cloudflare.
2. Back up its current code.
3. Replace the Worker entrypoint with `worker/index.js` from this package. Existing `/api/guide` and `/health` behavior is retained; the new route is `/api/audio-analysis/chunk`.
4. Confirm the `OPENAI_API_KEY` secret exists in Worker settings. It must remain server-side; never put it in GitHub Pages or browser code.
5. Optionally set `ALLOWED_ORIGIN` to the exact GitHub Pages origin, e.g. `https://<your-github-user>.github.io` (include the project path only if your Worker CORS setup expects it; `Origin` itself contains the origin, not the path).
6. Deploy and visit `<worker-base-url>/health`; confirm `openaiKeyConfigured:true`.

### 2. GitHub Pages
Upload/replace only these files in the existing repository, preserving paths:
- `index.html`
- `audio-analysis-bridge.js`
- `audio-lab/index.html`

Do not replace unrelated OAuth, Spotify playback, translation or deployment files.

### 3. Run the proof of concept
1. Open `/Sonic-companion/audio-lab/` in Safari or another supported browser.
2. Select the exact original 1959 _Kind of Blue_ studio recording of “So What” (not the 1960 live version or an alternate take).
3. Enter the Worker base URL (the same Worker that serves `/health`).
4. Paste the Spotify track link for the exact same recording.
5. Confirm that the file is the exact same recording and acknowledge that the excerpts will be sent to OpenAI.
6. Run **Analyse with GPT-Audio 1.5**. A nine-minute track will result in roughly 16 model calls; usage charges may apply.
7. Review the model-generated timestamps and explanations against the local playback. Reject any weak performer attribution or false musical claim.
8. Publish to the original app, then refresh the root Sonic Companion app. For a different browser/PWA storage context, download the JSON backup and use **Import Audio Lab JSON** in the guide panel.

## Fail-closed behavior
- The Worker only accepts the So What / Kind of Blue track profile.
- Invalid JSON, missing audio, unsupported instrument/role values, invented roster names, and out-of-range event timestamps are rejected.
- The main app suppresses its pre-authored So What moments for this POC. It displays only a valid direct-audio model record.
- Legacy DSP markers are not used as musical explanations for So What.
- No model record means no So What moment guide. No mock fallback exists.

## Automated checks
Run `npm test` from the repository root. This checks source syntax, schema/provenance guards, Spotify/countdown regressions, the So What fail-closed behaviour and the Worker request contract. The Worker API contract test uses a mocked upstream response only inside the test harness; the production app never uses it. No test calls the live OpenAI API or validates actual musical understanding.
