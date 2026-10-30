# MIE 1.3 — Performer Narratives, Historical Context and Next-Cue Countdown

## Intent

MIE 1.3 makes the listening guide more like a technically attentive musician's annotation. A moment should identify the musical event and, where supported by the recording-specific evidence, explain who or what moves into the foreground, who yields, what the remaining performers continue to do, and how the texture changes. It must not merely say that the music becomes more intense or that a solo begins.

## Performer-role vocabulary and acceptance rules

A substantive `musicianMoment` should describe the audible hierarchy of parts where relevant:

- **Foreground:** named soloist/instrument or section currently carrying the principal line.
- **Handoff:** incoming voice, outgoing voice, and whether the previous soloist continues comping, shifts to background, or actually stops.
- **Foundation:** what bass, drums, piano/keys, percussion, strings, choir or other supporting layer continues to contribute.
- **Musical detail:** register, articulation, phrasing, breath length, voicing, counterpoint, rhythmic placement, groove, metre, accents or timbre that helps the listener hear the role change.
- **Return:** how the original theme, head, ostinato or ensemble figure re-enters and what changed while it was away.

A handoff must not be described as an instrument becoming silent unless the source supports that claim. A section joining the texture is not automatically a soloist. Where track-level credits do not establish an individual performer, describe the instrument or section rather than guessing a name. Recording/release identity remains album-first and fail-closed.

## Historical and recognition context

`historicalNote` gives relevant context about why a musical passage, performance, arrangement or recording is discussed or remembered. It may refer to documented influence, session context, critical reception or the history of a musical technique. It must:

1. Be attributable to a reliable source or clearly framed as interpretation.
2. Keep opinion distinct from fact; no unsupported superlatives or rankings.
3. Never infer that a well-known player is present on a particular recording without release-specific credits.
4. Never add a musical event that is absent from the authored event map.
5. Increase selection weight only for an existing, defensible musical event. Historical importance can justify closer attention to a real solo entrance or structural change, but not a fabricated cue.

## Adaptive density

There is no fixed cue quota. Structure and performer events are the primary drivers; duration and reading time constrain selection. As a practical soft reference, dense long-form passages may approach roughly one moment per minute, but quieter or repetitive stretches may need less and rapid passages with distinct handoffs may warrant more. MIE's selector uses weighted event types, explicit historical weight, protected solo/handoff events and a minimum reading interval calculated from cue text and track duration. Live Spotify `duration_ms` overrides catalogue fallback duration whenever available.

## Focus-mode countdown

The countdown is part of the active Focus cue panel. It measures **playback time remaining until the next cue**, not a separate wall-clock reading timer. It uses the same interpolated Spotify position used to activate the cue:

- begins full at the current moment and shrinks as Spotify progress advances;
- freezes while Spotify is paused;
- follows the new position after a seek/re-anchor;
- resets when the next cue becomes active;
- hides when there is no next cue, no valid current guide or the final cue has been reached.

The explanatory label describes the bar as the available playback window before the next prompt. It does not guarantee that every listener will finish reading within that window.

## Catalogue QA snapshot

The offline MIE 1.3 fixture traversal covers 96 track fixtures and 513 selected cues across 10 album/profile families. Every fixture has at least one selected technical musician/arrangement note. Across the selected cues there are 127 performer/arrangement notes and 49 historical notes. These counts are test outputs, not editorial quality scores.

The 32 Goldberg movements use their recording-specific approximate duration fallbacks, so very short variations are not tested as though they lasted five minutes. Live Spotify duration always wins. Cue positions remain approximate playback-progress anchors; the app does not detect audio events or align the guide to a score.

## Non-goals and limitations

- No audio is uploaded or analysed by the static app.
- No waveform/score-based event detector is included.
- No live OpenAI or Cloudflare request is performed by the QA suite.
- Historical notes are only as strong as the source record attached to each authored passage.
- A passing structural QA run does not replace musician review or testing on the user's actual Spotify account/device.
