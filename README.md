# Sonic Companion v0.8 — responsive track search and playback selection

## What's included
- Spotify play/pause, previous/next, volume down/up, status and album artwork via official Web API.
- Language selector: English / Português (Brasil), with sonically adapted authoring for both languages.
- Listen & landmarks, History & meaning, and Listener voices views.
- Automatic playback-follow for supported curated tracks: the app matches the current Spotify track to the relevant guide and uses `progress_ms` / track duration to highlight an estimated landmark without manual selection. The Rachmaninoff segmented variation guide switches sections by track title; *Kind of Blue* and *Giant Steps* move through curated landmark cues as playback progresses.
- Explore another album via source searches based on text you type.

## Publish on GitHub Pages
Replace these repository-root files from this folder: `index.html`, `guide-data.js`, `sw.js`, and `manifest.webmanifest`. Keep the existing icons. Commit all four changes. If an older service worker persists on iPhone, reload the page and allow the service worker to update; if needed, open the URL in a private tab once to validate the new version.

## After deployment
The app remembers the selected language on the device. If the scope request changes, tap Disconnect and Connect again to reauthorize.

## Important limits
- Auto-follow only works for tracks that can be matched to the three curated guides. Its jazz landmark boundaries are evenly spaced estimates, not verified timing annotations, and may differ by recording, remaster, intro or live performance. Unknown tracks remain unmatched.
- Spotify’s published Developer Policy expressly restricts synchronization of Spotify recordings with visual media. Other apps may have different authorizations or rights. This prototype implements the playback-position mechanics but does not establish that this use is approved for your app. Confirm permissions with Spotify before distributing the feature publicly. Read `ARCHITECTURE.md` before extending the integration.
- The “Explore another album” area opens independent metadata/community searches. It is not a server-side AI guide generator yet. Full dynamic authoring needs a serverless endpoint and secured backend model/search credentials; do not place API keys in this PWA.
- Listener scores are snapshots from linked community sources and may change. Critic reviews are excluded from the headline score; the interface paraphrases user-reaction themes and provides links rather than copying long reviews.


## v0.7: track search and on-demand research
The app now searches Spotify tracks (up to 10 per query), lets the user choose a result and requests playback on an active Spotify device. The selected work can be sent to a separately deployed Cloudflare Worker to produce an on-demand bilingual guide with web-search sourcing. See `research-worker/README.md`. The backend is deliberately separate from GitHub Pages so model credentials remain server-side.


## v0.8 interaction improvements
- Spotify track search now runs automatically after a short typing pause (500 ms); queries shorter than two characters are ignored to reduce unnecessary requests.
- Search results open when a query returns matches and collapse immediately after a track is chosen; a Show/Hide results control lets the user reopen them.
- Each result is a single accessible tap target (artwork or title/metadata), removing the separate Play & select button and reducing mobile UI clutter.
- Search requests are cancelled/ignored when newer input arrives, preventing stale results from replacing the latest query.
- Selecting a track targets the active Spotify device, or a usable available device when none is marked active, and reports playback errors without clearing the selected track.

## Update the existing GitHub repository from an iPhone
At the repository root, replace `index.html`, `guide-data.js`, `sw.js`, and `manifest.webmanifest` with the same-named files in this package. Keep the existing icons. Also update the root `index.js` and `wrangler.toml` from this package so the Cloudflare Worker deployment includes the safer health status field. The Cloudflare Git build is configured to use the root `wrangler.toml`, whose `main` entry is `index.js`. Commit these replacements to `main`. Keep `OPENAI_API_KEY` only as a Cloudflare Worker Secret; it must never appear in GitHub.
