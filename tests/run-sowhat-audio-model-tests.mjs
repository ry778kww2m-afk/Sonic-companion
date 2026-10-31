import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';

const root = new URL('../', import.meta.url).pathname;
const lab = fs.readFileSync(root + 'audio-lab/index.html', 'utf8');
const bridgeSource = fs.readFileSync(root + 'audio-analysis-bridge.js', 'utf8');
const app = fs.readFileSync(root + 'index.html', 'utf8');
const worker = fs.readFileSync(root + 'worker/index.js', 'utf8');

function scriptFrom(html) {
  const m = html.match(/<script>([\s\S]*?)<\/script>/i);
  assert.ok(m, 'inline JavaScript block exists');
  return m[1];
}

// Syntax-check source scripts without executing browser code.
new Function(scriptFrom(lab));
new Function('window', bridgeSource);

// Production Audio Lab must use real audio input and contain no demo moment source.
assert.match(lab, /gpt-audio-1\.5/);
assert.match(lab, /fetch\(baseUrl\+'\/api\/audio-analysis\/chunk'/);
assert.match(lab, /audio:\{format:'wav',base64\}/);
assert.match(lab, /audioInputSubmitted:true/);
assert.match(lab, /No musical moments are preloaded/);
assert.doesNotMatch(lab, /mockCatalogueData|makeSyntheticWav|demoSignalBtn|synthetic-structure-test/);
assert.match(lab, /audioConsent/);
assert.match(lab, /sameRecordingConfirmed/);

// Worker must route actual audio bytes to the documented audio model and fail closed.
assert.match(worker, /api\/audio-analysis\/chunk/);
assert.match(worker, /model:SONIC_AUDIO_MODEL/);
assert.match(worker, /type:'input_audio'/);
assert.match(worker, /store:false/);
assert.match(worker, /validateAudioSegmentAnalysis/);
assert.match(worker, /no fallback content was generated/);
assert.doesNotMatch(worker, /mode=mock.*audio-analysis/i);

// So What must not fall back to pre-authored guide moments.
assert.match(app, /const isSoWhatProofTrack=normTrack\(track\?\.name\)==='so what'/);
assert.match(app, /const curated=isSoWhatProofTrack\?null:/);
assert.match(app, /audio-model-performance-guide/);
assert.match(app, /no pre-authored moments are allowed in this POC/);

// Exercise the bridge with a test-only record (not production content).
const memory = new Map();
const windowMock = {
  localStorage: {
    getItem: k => memory.has(k) ? memory.get(k) : null,
    setItem: (k, v) => memory.set(k, String(v))
  },
  document: null
};
vm.runInNewContext(bridgeSource, { window: windowMock, console, setTimeout });
const bridge = windowMock.SonicAudioAnalysisBridge;
assert.equal(bridge.version, '1.1.0');
const id = '1234567890123456789012';
const testRecord = {
  schema: 'sonic-audio-model-performance-record', schemaVersion: 1,
  recordId: 'unit-test-only', spotifyTrackId: id,
  trackTitle: 'So What', artist: 'Miles Davis', album: 'Kind of Blue',
  recordingVersion: 'Original 1959 studio recording',
  recordingMatchConfirmed: true,
  analysedAt: new Date().toISOString(), durationSeconds: 60, durationMs: 60000,
  sourceFile: { name: 'unit-test-audio.wav', sizeBytes: 1, sha256: 'a'.repeat(64) },
  audioInputSubmitted: true, audioInputMode: 'direct-audio-input-chunked', model: 'gpt-audio-1.5',
  chunking: { chunkSeconds: 45, overlapSeconds: 10, count: 2 },
  segmentSummaries: [{ startSeconds:0, endSeconds:45, summary:{en:'A test-only segment summary.',pt:'Resumo de segmento apenas para teste.'} },{startSeconds:35,endSeconds:60,summary:{en:'A second test-only segment summary.',pt:'Um segundo resumo de segmento apenas para teste.'}}],
  events: [{
    startSeconds: 11.2, endSeconds: 17.5, performerName: 'Miles Davis',
    instrument: 'trumpet', role: 'lead', eventKind: 'phrase',
    performerConfidence: .9, confidence: .88, timestampConfidence: .81,
    title: { en: 'Unit test phrase', pt: 'Frase de teste' },
    whatHappens: { en: 'Model test only.', pt: 'Somente teste do modelo.' },
    listenFor: { en: 'Test listening detail.', pt: 'Detalhe de escuta de teste.' },
    whyItMatters: { en: 'Test significance.', pt: 'Significado de teste.' },
    audibleEvidence: { en: 'Test evidence.', pt: 'Evidência de teste.' },
    question: { en: 'Test question?', pt: 'Pergunta de teste?' }
  }]
};
assert.equal(bridge.validateRecord(testRecord), null);
bridge.storeRecord(testRecord);
const guide = { analysisOnly: true, trackSpecificGuide: false, cues: [], guideKind: 'unavailable' };
const applied = bridge.applyToGuide(guide, { id, name: 'So What', artist:'Miles Davis', artists:['Miles Davis'], album: 'Kind of Blue', duration_ms: 60000 });
assert.equal(applied.applied, true);
assert.equal(guide.guideKind, 'audio-model-performance-guide');
assert.equal(guide.cues.length, 1);
assert.equal(guide.cues[0].timeSeconds, 11.2);
assert.equal(guide.cues[0].performerName, 'Miles Davis');
const wrongIdentityGuide={analysisOnly:true,trackSpecificGuide:false,cues:[]};
const wrongIdentity=bridge.applyToGuide(wrongIdentityGuide,{id,name:'Freddie Freeloader',artists:['Miles Davis'],album:'Kind of Blue',duration_ms:60000});
assert.equal(wrongIdentity.applied,false,'a So What model record cannot attach to a different current track even if an ID is reused');

// Invalid provenance and invalid performer attributions are rejected.
assert.notEqual(bridge.validateRecord({ ...testRecord, model: 'gpt-5.5' }), null);
assert.notEqual(bridge.validateRecord({ ...testRecord, audioInputSubmitted: false }), null);
assert.notEqual(bridge.validateRecord({ ...testRecord, events: [{ ...testRecord.events[0], performerName: 'Wynton Kelly' }] }), null);
assert.notEqual(bridge.validateRecord({ ...testRecord, events: [{ ...testRecord.events[0], instrument: 'piano', performerName: 'Miles Davis' }] }), null, 'cross-instrument performer attribution is rejected');
assert.notEqual(bridge.validateRecord({ ...testRecord, events: [{ ...testRecord.events[0], endSeconds: 80 }] }), null);

// Legacy DSP-only records are explicitly not permitted to become So What moments.
const dspId = '2234567890123456789012';
const dsp = {
  schema: 'sonic-audio-analysis-record', schemaVersion: 1, spotifyTrackId: dspId,
  recordingMatchConfirmed: true, durationMs: 60000,
  events: [{ timeSeconds: 12, evidenceWindow: { start: 10, end: 14 }, title: 'DSP', observation: 'DSP only' }]
};
bridge.storeRecord(dsp);
const noModelGuide = { analysisOnly: true, trackSpecificGuide: false, cues: [] };
const rejected = bridge.applyToGuide(noModelGuide, { id: dspId, name: 'So What', album: 'Kind of Blue', duration_ms: 60000 });
assert.equal(rejected.applied, false);
assert.equal(rejected.reason, 'model-analysis-required-for-so-what');

console.log('So What Audio Model POC tests passed. (Unit-test fixture content is not used by the app.)');
