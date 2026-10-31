# Sonic Companion v1.0.4 — 2026-10-31

## Spotify permission and connection UI correction

- Removed the unconditional Spotify permission/reconnect warning that appeared even when playback status and playback controls were working.
- Permission guidance is now hidden by default and appears only after an actual HTTP 403 from a permission-protected playback-status or playback-control endpoint.
- Status-permission and control-permission errors now have separate guidance; control guidance also calls out Premium eligibility and active-device requirements rather than implying OAuth reconnection alone will fix them.
- The temporary “connection found / checking playback status” message now resolves after the first poll: successful access, no active track (HTTP 204), or a concrete error.
- A successful playback-state response clears any previous permission warning; disconnect and a new OAuth attempt also clear stale guidance.
- Language changes re-render any active permission warning in the selected language.
- Product version updated to 1.0.4. MIE remains 1.3 and Audio Lab bridge remains 1.0.2.

## Scope

This is a focused UI/state correction. It does not change the guide provenance rules, mock-content fail-closed behaviour, Audio Lab DSP matching, Spotify OAuth client ID, redirect URI or requested scopes.

## Verification limits

Automated build, bridge and UI-state regression suites are included. No live GitHub deployment, iPhone Safari session or Spotify account/API request was available in this environment.
