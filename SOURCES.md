# Source references

These links are included to make the album identity and platform API assumptions auditable. The listening commentary remains local mock content; it is not represented as live research.

## First attached album

- Spotify album, ID `0v3T6fPnrptRXOrd854hIl`, listing 37 tracks: https://open.spotify.com/album/0v3T6fPnrptRXOrd854hIl
- Deutsche Grammophon official album page: https://www.deutschegrammophon.com/en/catalogue/products/rachmaninoff-the-piano-concertos-paganini-rhapsody-wang-13022
- Los Angeles Philharmonic recording listing: https://www.laphil.com/artists-and-media/recordings-and-media/recordings/rachmaninoff-the-piano-concertos-and-paganini-rhapsody

## Spotify Web API references

- Start/Resume Playback (`PUT /me/player/play`), including album context / offset request shape, Premium and `user-modify-playback-state` requirement, command ordering warning, and platform policy notes: https://developer.spotify.com/documentation/web-api/reference/start-a-users-playback
- Get Playback State (`GET /me/player`), including current track, progress, active device, `user-read-playback-state` and platform policy notes: https://developer.spotify.com/documentation/web-api/reference/get-information-about-the-users-current-playback

## Platform caveat

Spotify's Developer Reference currently states that the execution order of the Start/Resume endpoint is not guaranteed when used with other Player API endpoints. It also states that sound recordings may not be synchronized with visual media. This project serializes its own API operations, but that does not override Spotify platform behavior or policy.
