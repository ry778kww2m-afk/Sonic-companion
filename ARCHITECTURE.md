# Architecture — v1.3

- `index.html` contains the UI, Spotify OAuth PKCE flow, polling loop, guide fixtures, cue timing logic and test hooks.
- `buildSonicMockGuide()` returns local bilingual fixtures for screenshot albums and a labelled generic fallback for unknown tracks. It does not make network research or AI calls.
- `SonicLiveCore` maps Spotify-reported progress to approximate cue boundaries and interpolates the progress between polling updates.
- Actual Spotify playback identity is the source of truth: a selected search result does not replace a playing track's guide until Spotify reports the selected track. Result taps call the explicit Play path, never Pause.
- Playback requests require a Spotify-reported active, non-restricted device. Inactive devices are never transferred automatically. If no active target exists, the operation fails visibly without play/pause commands.
- `Focus` keeps player + one cue in the foreground. `Full` restores the complete app and guide. Mode preference is local to the browser.
- The page unregisters older service workers and clears the prior shell cache on load to avoid stale HTML.
