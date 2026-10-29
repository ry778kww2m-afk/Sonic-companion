# Sonic Companion v0.9 — mock mode on iPhone

This is a free simulation of the research endpoint. It makes no OpenAI API call.

1. Deploy the updated PWA files from this package to the GitHub Pages repository as usual.
2. Deploy the updated Worker code: replace the repository-root `index.js` with the included `index.js` and commit it so Cloudflare's connected build can deploy it. Keep `OPENAI_API_KEY` as a Cloudflare secret; do not place it in GitHub.
3. Open Sonic Companion and set Research service URL to `https://sonic-companion-research.4bbth7bg45.workers.dev/api/guide?mode=mock` (or append `/api/guide?mode=mock` to your own Worker host).
4. Select any of the album tracks in Spotify search, then tap **Research selected track**. The response should show a visible **MOCK GUIDE** banner.
5. The visible guide is fixture content. It is not live researched, sources will be empty, and the mock is not evidence that live API research works.

To run real research later, remove `?mode=mock` from the endpoint. Real mode requires an available OpenAI API credit balance and the Worker secret.


The package also includes `MOCK_API_TEST_CASES.json`, containing the request payloads corresponding to the tracks visible in your screenshots. The app itself does not need that file; it documents the fixture coverage for repeatable testing.
