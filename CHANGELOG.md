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

## v0.8 — track picker refinement
- Added debounced search-as-you-type and cancellation/stale-response protection.
- Added collapsible results with a persistent show/hide control.
- Changed each result to a single tap target; removed the redundant action button.
- Improved playback targeting when Spotify reports available but inactive devices.
- Bumped service-worker cache to v8.

## v0.8 — search and selection UX fix
- Search-as-you-type with a 500 ms debounce, aborting stale requests and ignoring stale responses.
- Results collapse after selection and can be expanded/collapsed with a dedicated control.
- The entire result row (artwork, title and metadata) is the accessible play/select tap target; removed the separate action button.
- Avoids sending a second playback request if the chosen track is already playing; available-device targeting improved.
- Health endpoint safely reports whether the API key binding is present, without revealing it.
- Service worker cache bumped to v8.
