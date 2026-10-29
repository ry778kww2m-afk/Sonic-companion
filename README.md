# Sonic Companion v1.5 — Track-truth guardrails

A free, offline mock build that tests the Spotify-linked interface while prioritizing track identity accuracy.

## Guardrails
- A known title-level track fixture is required before track-specific content is displayed. Album-only matches cannot activate a different track's cues.
- Unknown tracks show their current Spotify metadata and a clear “No verified cue for this track” state; no unrelated guide or fake time-based progression is shown.
- Known fixtures show educational cue phases that follow Spotify progress approximately. These phases are not recording-specific event timestamps and are not derived by analyzing the audio.
- Focus mode shows the player and the current cue; Full view exposes the complete guide.
- Search selection requests playback; the guide remains attached to the actual current track until Spotify confirms the switch. Unknown/inactive devices are not taken over and playback is not automatically paused.
- No OpenAI API, external web search, or API credits are used.

See `README_DEPLOY_PHONE.md` for upload instructions and `TEST_RESULTS.txt` for local automated tests.
