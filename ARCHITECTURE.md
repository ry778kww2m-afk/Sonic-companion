# Sonic Companion v0.5 — architecture and next-step plan

## What this prototype contains

- Spotify OAuth/PKCE, now-playing state, play/pause, previous/next, and volume up/down.
- English and Brazilian Portuguese UI and authored music notes. The two languages are written as musical adaptations, not string-by-string translations.
- Three content views: **Listen & landmarks**, **History & meaning**, and **Listener voices**.
- Track-level listening landmarks for all five original *Kind of Blue* tracks and all seven original *Giant Steps* tracks. These are manual form/arrangement cues, not timestamps.
- Community-score snapshots with links to user-review pages. Professional critic scores are not used as the headline rating.
- “Explore another album” links that use the artist/album query typed by the user to open independent music metadata and listener-discussion searches. It does not send the live Spotify title to an AI service.

## A key Spotify constraint

Spotify's current Developer Policy says not to synchronize sound recordings accessed via Spotify with visual media or similar content, and says not to ingest Spotify Content into an AI model. See <https://developer.spotify.com/policy>. For that reason, this version keeps commentary selection independent of Spotify playback time. It does not automatically change passages when playback advances. Do not add automatic timestamp-based cues against Spotify playback without written approval from Spotify. If time-synchronized guidance is a non-negotiable product requirement, use a playback source for which synchronization rights are licensed, or obtain written authorization first.

## Recommended way to grow the catalogue without a huge database

Use a **serverless resolver + small cache**, rather than a relational database with one manually maintained row per song.

### Request flow

1. **User-typed lookup**: the user enters an artist and album/work in Sonic Companion and taps “Prepare guide”. Do not auto-forward the Spotify now-playing object or playback progress to a model.
2. **Resolve canonical work/release**: a Cloudflare Worker/Pages Function queries MusicBrainz by user-entered query. Store the MusicBrainz release-group/work ID, canonical artist credits, edition, tracklist, dates, recording credits and source URLs. MusicBrainz requires a meaningful `User-Agent` and no more than one request per second per client/IP; server-side proxying makes this easier to honour.
3. **Add factual context**: prefer official artist/estate/label pages, liner-note sources where legally accessible, institutional sources and reputable reference works. Keep every factual statement linked to at least one source. Keep source text small and do not republish long passages.
4. **Build a structured listening guide**: a server-side model can write a track overview and a small sequence of musical landmarks from independently sourced material. Each cue has a sound focus, what to listen for, why the detail matters, and confidence/source notes. Never ask the model to listen to or analyze Spotify audio. If future policy approval permits more, revise the flow only after that approval.
5. **Author in two languages**: give the model a shared factual outline and separate writing instructions for English and PT-BR. Require each language to use native musical language, not line-by-line translation; keep the musical claims equivalent. Apply a reviewed glossary: *ride cymbal → prato de condução; comping → acompanhamento harmônico rítmico (comping); head → tema; chord changes → mudanças harmônicas / sequência de acordes; walking bass → baixo em walking bass; voicing → disposição das notas do acorde; swing feel → balanço do swing*. A human-reviewed glossary and quality pass should validate the Portuguese notes.
6. **Community voices, not critic reviews**: query only sources whose APIs/terms allow use. Start with user-review/ratings sources that provide a permitted feed/API; where a source has no API or redistribution rights, link to it and let the user open the reviews rather than scraping its page. Reddit API access also has rules. Summarize recurring *themes* with links; store no bulk review text and avoid long quotes. Separate rating aggregates from qualitative claims and show sample sizes/date checked. Include a fair caveat without manufacturing a negative consensus.
7. **Cache results**: key by canonical MusicBrainz release-group ID, prompt/schema version and language pair. Cache metadata for 30–90 days; guide text for 30 days after validation; community rating snapshots for 1–7 days. Use Cloudflare KV or Cache API. Unknown queries are generated once, cached, and reused. Let users report an incorrect edition and re-resolve when needed.

### Minimal endpoints

- `GET /api/resolve?q=<user-typed-query>` → canonical releases/works, candidate tracks, source IDs and links.
- `POST /api/guide` with the selected non-Spotify release-group ID → bilingual structured guide, source list, confidence flags. API keys stay in server-side secrets; never embed model secrets in `index.html`.
- `GET /api/reception?mbid=<id>` → permitted user-score snapshots, a paraphrased theme summary, links, source and checked date.

No dedicated SQL database is needed at MVP scale. Keep the three starter albums as small versioned JSON seed files in the repository, then put only generated, source-linked JSON responses in short-lived KV cache. This avoids a large hand-maintained catalogue but still makes the output reproducible and auditable.

## Important sourcing rules

- Do not use Spotify's current track, album metadata or playback progress as the prompt/input to a model; the app displays Spotify's permitted playback state only for the playback-control surface.
- Search on an independently typed artist/album/work query.
- Never fabricate ratings, reviewer counts, track credits or passage timestamps.
- Use album editions carefully. The same album may have different track orders, bonus tracks, edits and remasters; resolve the actual release before showing track-specific material.
- No automatic time-coded updates in Spotify mode in this prototype. The landmark list is manually selectable. Time-aligned chapters should be reserved for a separately licensed audio source or written permission.


## v0.7 implementation note
`research-worker/index.js` is a Cloudflare Worker starter. It calls the OpenAI Responses API with required web search and a strict JSON schema for the bilingual guide. Deploy it separately and store `OPENAI_API_KEY` as a Worker secret. The PWA search function calls Spotify's track-search endpoint, and selecting a result requests playback via the Spotify Web API on an active device. A generated guide can follow that selected track using approximate duration-proportional cue divisions; the UI explicitly warns that these are not recording-verified timestamps. Add rate limits and caching before broader distribution.
