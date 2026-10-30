# MIE musical translation adapter — setup

## Design

The catalogue's canonical text remains English and is stored once in `index.html`. Explicitly hand-reviewed Portuguese fields remain as editorial overrides; English-only fields are translated from the English root when Portuguese is selected. This avoids shipping a second full language copy for every album while preserving reviewed work where it already exists. The translation is a musical-language adaptation, not a literal or word-for-word translation.

The browser then:

1. Collects only text fields without a reviewed Portuguese version.
2. Sends the text, stable field IDs and limited track context to the translation Worker.
3. Validates that every requested field is translated exactly once; no unknown or missing IDs are accepted.
4. Merges translations into a temporary display copy. It does not modify English source text, cue order, event types or timing.
5. Caches the translation locally by source-content hash, track ID, locale and translator-prompt version. English remains the source of truth. Editing canonical English invalidates the old cache automatically.

The browser cache is capped at about 650 KB and up to 60 guide entries; old entries are pruned. An optional Cloudflare KV binding can share the same translation cache across visits/devices. Newly generated translations are not written back into the static catalogue. Only the current track is translated; the model is not called again as the playback cursor moves between cues. Existing hand-reviewed translations are the intentional exception.

If the Worker is not configured or translation fails, the app explicitly says that it is showing the English source. It does not disguise English text as Portuguese.

## Deploy the translation Worker

The static GitHub Pages app cannot safely hold an OpenAI API key. Deploy `translation-worker/index.mjs` as a separate Cloudflare Worker.

1. In Cloudflare Dashboard, open **Workers & Pages** and create a Worker named `sonic-companion-musical-translation`.
2. Open **Edit code**, replace the starter script with the complete contents of `translation-worker/index.mjs`, and deploy.
3. In Worker **Settings → Variables and Secrets**, add:
   - `OPENAI_API_KEY` — **Secret**; your OpenAI API key. Never put this in GitHub or the HTML.
   - `TRANSLATION_ACCESS_TOKEN` — **Secret**; create a long random token for this app. This is not the OpenAI key.
   - `ALLOWED_ORIGIN` — text: `https://ry778kww2m-afk.github.io` (no trailing slash).
   - `OPENAI_TRANSLATION_MODEL` — text: `gpt-6.1-sol` (default if omitted; selected as the quality-first starting point for idiomatic musical prose).
4. Redeploy after adding the variables. Copy the Worker URL, for example `https://sonic-companion-musical-translation.<your-subdomain>.workers.dev`.
5. In Sonic Companion, paste the Worker URL into **Translation Worker URL** and the same `TRANSLATION_ACCESS_TOKEN` into **Personal translation access token**. Change the app language to Portuguese and load a track guide.

The token is saved in that browser's local storage and sent as a bearer token to the Worker. It is separate from the OpenAI key. This is suitable for a personal prototype; it is not per-user authentication for a public product. Before making the app public, add proper user authentication and a Cloudflare rate-limit/WAF rule for this endpoint. CORS is a browser policy, not authentication. Keep OpenAI project spending limits enabled.

## Optional shared cache

Create a Cloudflare KV namespace and bind it to the Worker with the binding name `MIE_TRANSLATIONS`. The script then caches validated translations for one year using a hash of the canonical text, locale, track identity, model and prompt version. Without KV, local browser caching still works.

## Translation quality contract

The Worker is a language adaptation layer, not an analysis engine. It must not add, remove or strengthen musical claims. It preserves the source cue IDs, event identities, order and timing by translating text strings only. Its prompt is written for a composer/musicologist and native-level musical editor. It explicitly distinguishes jazz form-language (for example, a 'head', a 'chorus' in a solo, a 'walking bass' line and comping) from everyday meanings, and classical terms (forma-sonata, exposição, desenvolvimento, recapitulação, anacruse, pedal and coda). It includes Brazilian musician vocabulary for drum kit and articulation, e.g. prato de condução, chimbal, caixa, bumbo, vassourinhas, arco and pizzicato. The instruction is to rebuild syntax and idiom to sound originally written in Brazilian Portuguese, not to translate sentence structure literally.

The default model is configurable through `OPENAI_TRANSLATION_MODEL`. GPT-6.1 Sol is the initial quality-first candidate for nuanced musical language. GPT-6 Luna is the cost-sensitive, high-volume alternative. The current model catalogue positions Sol as a higher-intelligence/cost balance and Luna for cost-sensitive high-volume work. Compare them on the same reviewed translations rather than assuming the more expensive model is automatically better. A structurally valid response is not proof of translation quality; retain human review for glossary decisions and a native musician/editor acceptance set. The Structured Outputs schema enforces the response shape, while application code independently validates every field ID; neither guarantees linguistic quality or factual accuracy.

## Privacy and cost

Only the current track guide's untranslated text fields and minimal Spotify metadata (track ID, track title, album title and artist names) are sent to the Worker. No audio is uploaded. Translations are cached, so playback progress and cue changes do not invoke the model. The OpenAI API is billed separately from a ChatGPT subscription.


## Translator revision and cache invalidation

The browser cache key includes `SonicTranslationCore.version`; the Worker cache key includes `PROMPT_VERSION` and the selected model. When you change the translator prompt, musical glossary or default model, bump both version constants in `index.html` and `translation-worker/index.mjs`. The current MIE 1.3 build uses browser adapter `MIE-MUSICAL-TRANSLATION-5` and Worker prompt `MIE-MUSICAL-PTBR-5`. This forces a fresh translation rather than reusing older wording. If you override the Worker model through `OPENAI_TRANSLATION_MODEL`, also bump the browser adapter version or clear `sc_mie_translation_cache_v1` on test devices. Keep a versioned set of English source passages and reviewed Brazilian Portuguese adaptations for regression review.

## Quality review checklist for Brazilian Portuguese

Review translations for musical accuracy and native idiom, not just grammatical correctness:

- Does a jazz `chorus` refer to a pass through the form rather than an invented lyric refrain?
- Does `head` become the tune/theme, not a literal body part?
- Are drum-kit roles distinguished (ride cymbal / prato de condução; hi-hat / chimbal; snare / caixa; kick / bumbo)?
- Are bowing and plucking described as arco and pizzicato where appropriate?
- Does the translation preserve differences among pulse, metre, groove, accent, harmony, texture, register, timbre and formal section?
- Is an invitation to listen still an invitation, not a factual claim that the audio event occurs at the approximate cue time?
- Are titles, artist names, work names, chord symbols and Italian tempo markings preserved?

No audio is supplied to the translator. It adapts the existing guide language only; it cannot independently verify the recording, detect an instrument entry or correct the musical source text.


## MIE 1.3 performer-context translation

The current app adds performer-level notes describing foreground lead, incoming/outgoing soloists, continuing comping, rhythm-section duties, choir/string/horn layers, instrumental colour and thematic returns. The Worker prompt preserves role chronology and explicitly avoids inferring individual names from album-wide credits when track-level credits are unavailable. Historical notes preserve attribution and uncertainty; the translator must not turn a critical opinion into objective ranking.
