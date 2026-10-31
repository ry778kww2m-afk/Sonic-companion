# Sonic Companion v1.0.5 — Curated Jazz Guide Resolver

## Fixed
- Fixed the resolver/loader handoff that discarded valid Kind of Blue and Giant Steps catalogue matches because the loader only built Rachmaninoff guides.
- Freddie Freeloader on Kind Of Blue (Legacy Edition) now resolves to its existing curated track guide and four listening landmarks.
- Tightened jazz matching to require exact normalized track title, expected primary artist and matching album family. Feature-artist credits and remaster suffixes are normalized; live versions, alternate takes, studio sequences and unrelated compilations do not inherit the studio guide.
- Added an untimed-landmark presentation mode. Curated editorial topics do not receive synthetic percentages or estimated timestamps and can be selected manually in Full Guide.
- Kept Audio Lab DSP candidates in a separate lane for untimed guides; measured timestamps are never merged into untimed editorial topics.
- Preserved fail-closed behaviour for recordings without a valid catalogue match.

## Versioning
- App: 1.0.5
- MIE: 1.3 (unchanged)
- Audio Lab bridge: 1.0.3

## Verification
- Automated Node suites: build/syntax, bridge integration, Spotify permission UI, and curated guide resolution.
- Expanded Node regression coverage across every Kind of Blue and Giant Steps catalogue entry, strict identity negatives, remaster suffix normalization, and both manual lookup and automatic Spotify-follow status branches.
- Browser and device end-to-end verification was not run: Chromium navigation is blocked in the build sandbox, and no live Spotify or iPhone session is available.
- Not verified against live Spotify credentials, live GitHub Pages, or an actual iPhone session in this build environment.
