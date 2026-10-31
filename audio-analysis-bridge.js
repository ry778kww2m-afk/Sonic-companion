/* Sonic Companion — Audio Lab bridge v1.0.1
 * Static/local integration only. Does not access Spotify audio, issue playback commands,
 * call an AI API, or change the OAuth/player implementation.
 */
(function (root) {
  'use strict';
  const STORE_KEY = 'sonic.audioAnalysis.registry.v1';
  const SCHEMA = 'sonic-audio-analysis-record';
  const MAX_EVENTS = 18;
  const DURATION_TOLERANCE_MS = 3000;

  function readRegistry() {
    try {
      const parsed = JSON.parse(root.localStorage.getItem(STORE_KEY) || '{"schemaVersion":1,"records":{}}');
      if (!parsed || parsed.schemaVersion !== 1 || !parsed.records || typeof parsed.records !== 'object' || Array.isArray(parsed.records)) return { schemaVersion: 1, records: {} };
      return parsed;
    } catch (_) { return { schemaVersion: 1, records: {} }; }
  }

  function validateRecord(record) {
    if (!record || record.schema !== SCHEMA || record.schemaVersion !== 1) return 'Unsupported analysis file format.';
    if (!/^[A-Za-z0-9]{22}$/.test(String(record.spotifyTrackId || ''))) return 'Invalid Spotify track ID.';
    if (record.recordingMatchConfirmed !== true) return 'The exact-recording confirmation is missing.';
    const duration = Number(record.durationMs);
    if (!Number.isFinite(duration) || duration < 10000 || duration > 480000) return 'Analysis duration is invalid or exceeds the prototype limit.';
    if (!Array.isArray(record.events) || record.events.length < 1 || record.events.length > MAX_EVENTS) return 'The analysis must contain between 1 and 18 candidate events.';
    let previous = 0;
    for (const event of record.events) {
      const time = Number(event && event.timeSeconds);
      const start = Number(event && event.evidenceWindow && event.evidenceWindow.start);
      const end = Number(event && event.evidenceWindow && event.evidenceWindow.end);
      if (!Number.isFinite(time) || time <= previous || time >= duration / 1000) return 'Candidate timestamps are invalid or not strictly increasing.';
      if (!Number.isFinite(start) || !Number.isFinite(end) || start < 0 || end <= start || start > time || end < time || end > duration / 1000 + 0.01) return 'An event evidence window is invalid.';
      previous = time;
    }
    return null;
  }

  function storeRecord(record) {
    const problem = validateRecord(record);
    if (problem) throw new Error(problem);
    const registry = readRegistry();
    registry.records[record.spotifyTrackId] = record;
    const retained = Object.entries(registry.records)
      .sort((a, b) => String(b[1] && b[1].analysedAt || '').localeCompare(String(a[1] && a[1].analysedAt || '')))
      .slice(0, 30);
    registry.records = Object.fromEntries(retained);
    root.localStorage.setItem(STORE_KEY, JSON.stringify(registry));
    return record;
  }

  function getRecord(trackId) {
    const id = String(trackId || '');
    if (!/^[A-Za-z0-9]{22}$/.test(id)) return null;
    const record = readRegistry().records[id];
    return validateRecord(record) ? null : record;
  }

  function bilingual(en, pt) { return { en, pt }; }
  function mmss(seconds) {
    const s = Math.max(0, Math.floor(Number(seconds) || 0));
    return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
  }

  function appendBalancedNote(guide, count) {
    const addEn = ` Audio Lab addendum: ${count} local DSP transition candidates are included below. Their timestamps come from measured signal changes on a 0.5-second analysis grid with approximately 3 seconds of evidence on either side. They do not identify instruments, performers, solos or formal sections. The exact Spotify recording match was confirmed manually by the analyst.`;
    const addPt = ` Complemento do Audio Lab: ${count} candidatos a transições detectados por DSP local foram incluídos abaixo. Os tempos vêm de mudanças mensuradas no sinal, em uma grade de 0,5 segundo e com aproximadamente 3 segundos de evidência de cada lado. Eles não identificam instrumentos, músicos, solos ou seções formais. A correspondência com a gravação exata do Spotify foi confirmada manualmente pelo analista.`;
    const existing = guide.balancedNote;
    if (existing && typeof existing === 'object' && !Array.isArray(existing)) {
      guide.balancedNote = {
        ...existing,
        en: String(existing.en || '') + addEn,
        pt: String(existing.pt || '') + addPt
      };
    } else {
      const source = String(existing || '');
      guide.balancedNote = bilingual(source + addEn, source + addPt);
    }
  }

  function applyToGuide(guide, track) {
    const trackId = String(track && track.spotifyTrackId || track && track.id || '');
    const record = getRecord(trackId);
    if (!record) return { applied: false, reason: 'no-matching-record' };
    const spotifyDuration = Number(track && (track.duration_ms || track.durationMs));
    if (!Number.isFinite(spotifyDuration) || spotifyDuration <= 0 || Math.abs(spotifyDuration - Number(record.durationMs)) > DURATION_TOLERANCE_MS) {
      return { applied: false, reason: 'duration-mismatch' };
    }
    if (!guide || guide.trackSpecificGuide !== true || !Array.isArray(guide.cues)) return { applied: false, reason: 'guide-not-track-specific' };
    if (guide.audioAnalysis && guide.audioAnalysis.recordId === record.recordId) return { applied: true, alreadyApplied: true, count: record.events.length };

    const measured = record.events.map((event, index) => {
      const time = Number(event.timeSeconds);
      const fraction = Math.max(0, Math.min(1, (time * 1000) / spotifyDuration));
      const n = index + 1;
      const timeLabel = mmss(time);
      const strength = Math.round(Number(event.strength) || 0);
      const feature = String(event.title || 'Measured signal change');
      const observation = String(event.observation || 'Measured audio features changed across the comparison windows.');
      const evidence = event.evidence || {};
      const featureSummary = `Structure ${Number(evidence.structure || 0).toFixed(2)} · harmonic ${Number(evidence.harmonic || 0).toFixed(2)} · timbre ${Number(evidence.timbre || 0).toFixed(2)} · energy ${Number(evidence.energy || 0).toFixed(2)} · rhythm ${Number(evidence.rhythm || 0).toFixed(2)}`;
      return {
        at: fraction,
        title: bilingual(`Audio analysis candidate ${String(n).padStart(2, '0')} — ${feature}`, `Candidato de análise ${String(n).padStart(2, '0')} — ${feature}`),
        focus: bilingual(`A local DSP pass found a measurable signal change near ${timeLabel}. This is a candidate boundary, not an identified musical event.`, `Uma análise DSP local encontrou uma mudança mensurável no sinal por volta de ${timeLabel}. Este é um limite candidato, não um evento musical identificado.`),
        listenFor: bilingual(observation, observation === 'Measured audio features changed across the comparison windows.' ? 'As características mensuradas do áudio mudaram entre as janelas de comparação.' : `Compare a passagem antes e depois de ${timeLabel}; a descrição acima resume a característica que mais mudou, sem atribuir uma causa musical específica.`),
        whyItMatters: bilingual(`Relative signal score: ${strength}/100. Dominant measured feature: ${feature}. ${featureSummary}. Evidence window: ${mmss(event.evidenceWindow.start)}–${mmss(event.evidenceWindow.end)}.`, `Pontuação relativa do sinal: ${strength}/100. Característica mensurada predominante: ${feature}. ${featureSummary}. Janela de evidência: ${mmss(event.evidenceWindow.start)}–${mmss(event.evidenceWindow.end)}.`),
        question: bilingual('Can you hear a change in texture, harmony, energy or rhythmic activity around this point?', 'Você percebe uma mudança de textura, harmonia, energia ou atividade rítmica neste ponto?'),
        audioAnalysisCandidate: true,
        analysisEventId: String(event.id || `dsp-${n}`),
        timeSeconds: time,
        evidenceWindow: { start: Number(event.evidenceWindow.start), end: Number(event.evidenceWindow.end) },
        strength,
        evidence: { ...evidence }
      };
    });

    // Keep the authored listening moments intact. Add measured, explicitly-labelled
    // candidate markers alongside them; never remap a musical claim to an unlabelled DSP peak.
    guide.cues = guide.cues.concat(measured).sort((a, b) => Number(a && a.at || 0) - Number(b && b.at || 0));
    guide.cueTimingBasis = 'audio-analysis-hybrid';
    guide.audioAnalysis = {
      recordId: record.recordId,
      spotifyTrackId: record.spotifyTrackId,
      analysedAt: record.analysedAt,
      candidateCount: measured.length,
      method: record.method,
      methodVersion: record.methodVersion,
      sourceFileSha256: record.sourceFile && record.sourceFile.sha256 || null,
      status: 'candidate-only',
      durationMatchDifferenceMs: Math.round(spotifyDuration - Number(record.durationMs))
    };
    appendBalancedNote(guide, measured.length);
    return { applied: true, count: measured.length, recordId: record.recordId };
  }

  function initImportControl() {
    const meta = root.document && root.document.getElementById('dynamicListeningMeta');
    if (!meta || root.document.getElementById('sonicAudioAnalysisImport')) return;
    const panel = root.document.createElement('div');
    panel.id = 'sonicAudioAnalysisImport';
    panel.style.cssText = 'display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin:8px 0 10px;padding:9px 10px;border:1px solid #454b57;border-radius:10px;background:#171b22';
    const button = root.document.createElement('button');
    button.type = 'button'; button.className = 'btn secondary';
    button.textContent = 'Import Audio Lab JSON';
    const input = root.document.createElement('input');
    input.type = 'file'; input.accept = 'application/json,.json'; input.hidden = true;
    const status = root.document.createElement('span');
    status.className = 'fine'; status.textContent = 'Local DSP results can be imported here if browser storage is not shared.';
    button.addEventListener('click', () => input.click());
    input.addEventListener('change', async () => {
      const file = input.files && input.files[0]; if (!file) return;
      try {
        if (file.size > 1024 * 1024) throw new Error('Analysis JSON is larger than 1 MB.');
        const record = JSON.parse(await file.text());
        storeRecord(record);
        status.textContent = 'Imported. Reloading to bind it to the Spotify-confirmed track…';
        root.setTimeout(() => root.location.reload(), 500);
      } catch (error) { status.textContent = 'Import failed: ' + (error.message || String(error)); }
      finally { input.value = ''; }
    });
    panel.append(button, input, status);
    meta.insertAdjacentElement('afterend', panel);
  }

  // The normal live guide path calls this public builder. Wrap it so ordinary
  // catalogues receive analysis markers without changing Spotify/player code.
  const originalBuilder = root.buildSonicMockGuide;
  if (typeof originalBuilder === 'function') {
    root.buildSonicMockGuide = function (payload) {
      const result = originalBuilder.apply(this, arguments);
      if (result && result.guide) applyToGuide(result.guide, payload && payload.track);
      return result;
    };
  }

  root.SonicAudioAnalysisBridge = Object.freeze({
    version: '1.0.1', storeKey: STORE_KEY, validateRecord, storeRecord, getRecord, applyToGuide
  });

  if (root.document) {
    if (root.document.readyState === 'loading') root.document.addEventListener('DOMContentLoaded', initImportControl, { once: true });
    else initImportControl();
  }
})(window);
