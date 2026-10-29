# Sonic Companion v1.0 — Auto Mock Guide Rendering

This build fixes the missing-content flow from v0.9. Choosing a Spotify search result automatically sends a request to the research Worker with `mode=mock`, so it does not make any OpenAI API call or live web search. The returned guide is rendered in the main **Listening guides** section and replaces the unrelated curated Rachmaninoff display until you tap **Return to curated guides**.

## Mock-covered recordings
- Bach / Glenn Gould — Goldberg Variations (1981 recording)
- John Coltrane — Coltrane Plays the Blues
- Miles Davis — Kind of Blue
- John Coltrane — Giant Steps
- Keith Jarrett — The Köln Concert
- Claude Debussy — Clair de lune

## Files to deploy
- Upload the files from this ZIP to the GitHub Pages repository root (including `index.html`, `guide-data.js`, `sw.js`, icons and manifest).
- Deploy `index.js` to the existing Cloudflare Worker.
- The UI defaults the Worker URL to `https://sonic-companion-research.4bbth7bg45.workers.dev/api/guide?mode=mock`. If an older base URL is already saved, the app normalizes it and forces `mode=mock` for safety.

## Verification
`MOCK_API_TEST_CASES.json` lists 21 sample fixture requests. Mock output contains no invented citations. `MOCK_MODE_PHONE_STEPS.md` has phone-specific deploy guidance.
