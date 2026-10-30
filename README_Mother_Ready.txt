SONIC COMPANION — ZERO-CONFIG SPOTIFY CONNECT
Build: MIE 1.3 / 2026-10-30

WHAT THIS PACKAGE CHANGES
- Embeds the Spotify public Client ID in the app.
- Removes the Spotify Client ID text field and Save Client ID button.
- Connect Spotify now starts OAuth authorization directly.
- Keeps Authorization Code with PKCE, S256 challenge, state validation, and browser-side token handling.
- Does not contain or use a Spotify Client Secret.
- If a browser has old tokens associated with a different Client ID, the app clears those stale Spotify tokens before use.

GITHUB PAGES DEPLOYMENT
1. Back up the current repository-root index.html.
2. Replace the repository-root index.html with this package's index.html.
3. Do not delete or replace the existing PWA assets, translation-worker directory, or other repo files.
4. Commit to the same branch/folder currently used by GitHub Pages.
5. After GitHub Pages finishes deploying, test this URL in a normal Safari tab:
   https://ry778kww2m-afk.github.io/Sonic-companion/?v=mom-ready-20261030

ONE-TIME SPOTIFY DEVELOPER DASHBOARD SETTINGS (OWNER ONLY)
A. Add this exact Redirect URI to the app's Redirect URIs allowlist:
   https://ry778kww2m-afk.github.io/Sonic-companion/
   The trailing slash matters. Spotify requires an exact match.
B. If the Spotify app is in Development Mode, add your mother's Spotify account
   to Users Management / allowlist before she tries to authorize.
C. Spotify currently requires the DEVELOPMENT-MODE APP OWNER to have an active
   Spotify Premium subscription. Development Mode allows up to 5 authenticated
   users; each one must be allowlisted.

TESTER EXPERIENCE
After the owner-side settings above are complete, your mother should only need to:
1. Open the link in Safari.
2. Tap Connect Spotify.
3. Sign in to Spotify and approve the requested access.
4. Return to Sonic Companion automatically.

NOTES / LIMITATIONS
- The app's redirect URI is derived from the deployed page's origin + path. If you
  move the app or change the GitHub Pages path, update the Spotify Dashboard URI.
- Playback control operations (play/pause/skip/volume) require the TESTER's Spotify
  Premium account. The app owner also needs Premium for a Development Mode app.
- This file passed inline-JavaScript syntax checks and static checks for removal of
  the Client ID UI and for consistent Client ID usage in authorization, token
  exchange, and refresh-token requests. A live Spotify OAuth round-trip and real
  iPhone test have NOT been performed in this environment.
- Spotify's current Player API reference includes a policy warning against
  synchronizing sound recordings with visual media. Sonic Companion displays
  time-positioned on-screen guide cues. Confirm that this use complies with
  Spotify's Developer Terms/Policy before broader distribution.
