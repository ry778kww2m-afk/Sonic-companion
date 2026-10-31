# Sonic Companion — Full Audio Analysis Integration v1.1.0

This ZIP contains a complete replacement `index.html` with the integration hooks already applied. **No manual editing of HTML is required.**

## Repository layout

Extract this ZIP. The contents mirror the GitHub repository root:

```text
Sonic-companion/
├── index.html                         # COMPLETE replacement root app; Spotify flow retained
├── audio-analysis-bridge.js           # New analysis-to-guide adapter
├── translation/                       # v2.7 runtime translation files
│   ├── translation-core.js
│   ├── pt-BR.memory.json
│   └── glossary.pt-BR.json
└── audio-lab/
    ├── index.html                     # Updated Audio Lab with publish/export controls
    └── data/
        └── mock-catalogue.json        # Existing mock fixture catalogue
```

The ZIP also contains tests and QA/provenance notes at the root.

## What to upload to GitHub

Upload/replace the package contents at the **repository root**, preserving the folder paths:

- Replace root `index.html` with the included complete integrated file.
- Add root `audio-analysis-bridge.js`.
- Replace `audio-lab/index.html` with the included file.
- Add/replace `audio-lab/data/mock-catalogue.json`.
- Keep the included `translation/` files at the repository root; they are the v2.7 runtime dependencies.

Do not upload the ZIP itself and expect GitHub to extract it. Extract it first. Do not upload this package into Cloudflare or change `index.js`, the research Worker, Spotify credentials, `manifest.webmanifest`, icon assets, or other existing unrelated repository files. Those remain untouched.

## Integration behavior

- The full root HTML already loads `audio-analysis-bridge.js` immediately after `translation-core.js`.
- The standard `buildSonicMockGuide` path is wrapped by the bridge.
- The separate curated Rachmaninoff guide path explicitly calls the bridge too.
- Audio Lab stores local DSP candidate records in same-origin localStorage. The original app reads only the record keyed by the Spotify track ID currently confirmed by Spotify.
- The bridge checks schema, manually confirmed exact recording/version, valid timestamps, and recording duration within ±3 seconds.
- Authored guide cues are preserved. Candidate signal changes are added separately and clearly labelled; no instrument/solo/section claims are inferred from a signal-change detector.
- No paid AI/API calls are added. Spotify OAuth, playback polling, playback commands, and the existing progress clock are not changed.

Both pages must run on the same HTTPS origin and browser profile for automatic localStorage handoff. If storage is not shared (for example, between Safari and an installed home-screen app), use Audio Lab's JSON backup and the **Import Audio Lab JSON** control in the original app.

## Important limitations

The local browser DSP identifies measured changes in signal features; it does not semantically identify instruments, performers, solos, or formal sections. Manual confirmation of the recording match is not an acoustic fingerprint comparison against Spotify. Candidate timestamps require listening validation before editorial interpretation.

This is a static prototype adapter and has not been tested against a live Spotify account or on the user's iPhone after deployment. The automated checks below are not a substitute for that live acceptance test.

## Automated checks included

- `node --check audio-analysis-bridge.js`
- `node tests/bridge.test.cjs`
- `node tests/root-integration.test.cjs`
- Root HTML integration-hook presence checks
- Inline JavaScript syntax checks for root and Audio Lab HTML
- Catalogue JSON parse and schema checks
