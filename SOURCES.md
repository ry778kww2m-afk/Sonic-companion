# Sonic Companion v1.9 — source references

The Coltrane content is grounded in the original album liner notes, track/recording credits and track metadata. Local mock commentary is educational listening guidance, not a claim that the app performs live research or audio analysis.

## John Coltrane — Coltrane Plays the Blues

- **Joe Goldberg — original LP liner notes**, including track-by-track observations and instrument roles: https://albumlinernotes.com/Coltrane_Plays_The_Blues.html
  - Blues to Elvin: near-gospel piano opening, tenor saxophone, direct blues solo and occasional harmonics.
  - Blues to Bechet: soprano saxophone with bass and drums only; short Bechet-evoking phrases, a more exploratory modern passage and a brief return to traditional soprano language near the close.
  - Blues to You: fast tenor trio without piano; blues harmony stretched toward near-atonality and culminating exchanges with Elvin Jones.
  - Mr. Day: hypnotic bass-and-piano support beneath Coltrane's intense tenor improvisation; Eastern-minor character.
  - Mr. Syms: soprano, minor blues with a bridge; Coltrane's opening/closing statements frame a McCoy Tyner piano solo.
  - Mr. Knight: distinctive piano figure and rhythmic basis described as West Indian/African synthesis, with a sparse theme and Indian-influenced melodic approach.
  - The liner notes list John Coltrane (soprano/tenor), McCoy Tyner (piano), Steve Davis (bass), Elvin Jones (drums), and identify the two piano-less tracks.
- **MusicBrainz — release and track credits**, including the six-track listing, recorded date and track-specific credits: https://musicbrainz.org/release/42dde702-f437-3875-bd91-a4884a1bd929
- **Qobuz — album track details, durations and credits**: https://www.qobuz.com/us-en/album/coltrane-plays-the-blues-john-coltrane/0603497894291
- **The Jazz Tome — album context and contemporary review excerpts**: https://thejazztome.info/john-coltrane-coltrane-plays-the-blues/

## Rachmaninoff 2023 Deutsche Grammophon album

- Spotify — exact album, Spotify album ID `0v3T6fPnrptRXOrd854hIl`: https://open.spotify.com/album/0v3T6fPnrptRXOrd854hIl
- Deutsche Grammophon — official album / recording credits: https://www.deutschegrammophon.com/en/catalogue/products/rachmaninoff-the-piano-concertos-paganini-rhapsody-wang-13022
- Los Angeles Philharmonic — recording and works listing: https://www.laphil.com/artists-and-media/recordings-and-media/recordings/rachmaninoff-the-piano-concertos-and-paganini-rhapsody

## Spotify Web API and platform caveats

- Start/Resume Playback (`PUT /me/player/play`): https://developer.spotify.com/documentation/web-api/reference/start-a-users-playback
- Get Information About the User's Current Playback (`GET /me/player`): https://developer.spotify.com/documentation/web-api/reference/get-information-about-the-users-current-playback
- The playback endpoints provide track identity and playback position, not audio-event recognition. All Coltrane cue boundaries in this local mock are approximate progress fractions, not verified musical event timestamps.
- Spotify's documentation/policies include restrictions relating to synchronizing sound recordings with visual media. Review the current Developer Terms and obtain platform guidance before distributing a playback-linked visual guide.

Last checked: 2026-10-29 / 2026-10-30 UTC.
