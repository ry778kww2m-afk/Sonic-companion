SONIC COMPANION — SPOTIFY SYNC PWA

This is a replacement for the previous file-upload prototype. It reads Spotify's current track and playback position through Spotify OAuth (Authorization Code with PKCE) and maps the Rachmaninoff Rhapsody guide to a full-work track. It does not stream music itself.

SETUP
1. In Spotify Developer Dashboard, create a Web API app. Development Mode currently requires the app owner to have Spotify Premium.
2. In the app's settings, add this exact Redirect URI: https://ry778kww2m-afk.github.io/Sonic-companion/
3. Copy the Client ID (not the Client Secret). Open Sonic Companion, paste it into the Client ID field, Save Client ID, then Connect Spotify.
4. Start a full-work recording of Rachmaninoff's Rhapsody on a Theme of Paganini in Spotify. Return to Sonic Companion; use Refresh playback if needed.

NOTES
- This guide currently contains commentary for the full Rhapsody only. It identifies other tracks but does not apply the Rhapsody guide to them.
- OAuth uses PKCE; the Client Secret is never requested or stored. Access/refresh tokens are stored in the browser's local storage on this device. Use Disconnect to clear them.
- Spotify's developer policy includes restrictions on synchronizing sound recordings with visual media. Confirm that your intended use is authorized before sharing or relying on this beyond personal testing; the existence of Opus does not establish permission for this separate project.
