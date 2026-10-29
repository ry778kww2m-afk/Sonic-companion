# Changelog

## v0.5 — expanded guide views and manual landmarks
- Keeps Spotify playback controls: play/pause, previous/next, volume down/up.
- Keeps English and Brazilian Portuguese with independent authored prose and instrument vocabulary.
- Adds Listen & landmarks / History & meaning / Listener voices tabs.
- Adds manual track landmarks for the original-album tracks of *Kind of Blue* and *Giant Steps*.
- Adds manual Previous/Next landmark buttons for longer pieces.
- Adds community-rating snapshots and direct links to user reviews/discussions; professional critic scores are not the headline score.
- Adds a typed-query source explorer for MusicBrainz, Album of the Year and Reddit.
- Adds an architecture document and example data schema for a cache-first serverless generation system.
- Keeps all guide cues independent of Spotify playback time due to Spotify’s published synchronization restriction.

## v0.6 — Automatic playback-follow
- Use Spotify playback progress to select a supported track guide automatically.
- For curated jazz albums, move the active listening landmark with playback progress.
- For Rachmaninoff segmented tracks, select the associated work section by track title.
- Bump service-worker cache to ensure iPhone PWA clients can receive the new build.
- Timing landmarks are estimated; Spotify permissions/policy need separate confirmation before public distribution.


## v0.7 — Track Search + Dynamic Research
- Added Spotify track search and a select-and-play action.
- Added on-demand bilingual musical-guide generation through an external Cloudflare Worker that uses web search and structured output.
- Added playback-follow selection for generated cues, with explicit approximate-boundary labeling.
- Added deployment guidance for server-side OpenAI secrets, CORS and rate limiting.
