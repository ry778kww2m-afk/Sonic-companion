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
assert.equal(bridge.version, '2.0.0');
const id = '1234567890123456789012';
const testRecord = {
  schema: 'sonic-audio-model-performance-record', schemaVersion: 2,
  recordId: 'unit-test-only', spotifyTrackId: id,
  trackTitle: 'So What', artist: 'Miles Davis', album: 'Kind of Blue',
  recordingVersion: 'Original 1959 studio recording',
  recordingMatchConfirmed: true,
  analysedAt: new Date().toISOString(), durationSeconds: 60, durationMs: 60000,
  sourceFile: { name: 'unit-test-audio.wav', sizeBytes: 1, sha256: 'a'.repeat(64) },
  audioInputSubmitted: true, audioInputMode: 'direct-audio-input-chunked', model: 'gpt-audio-1.5',
  engineVersion:'2.0', analysisStrategy:'30s-overlapping-primary-plus-adaptive-detail', qualityGate:{minimumMoments:3,minimumMomentsPerMinute:3,maximumSilentGapSeconds:45,observedMomentsPerMinute:3,observedMaxSilentGapSeconds:15,uncoveredWindows:0},
  chunking: { chunkSeconds: 30, overlapSeconds: 8, count: 2, detailPassCount:0 },
  segmentSummaries: [{ startSeconds:0, endSeconds:45, summary:{en:'This test-only summary describes a trumpet phrase and the surrounding ensemble response in this sample passage.',pt:'Este resumo de teste descreve uma frase de trompete e a resposta do conjunto ao redor neste trecho de exemplo.'} },{startSeconds:35,endSeconds:60,summary:{en:'This second test-only summary covers the later piano and drum details in the next sample passage.',pt:'Este segundo resumo de teste cobre os detalhes posteriores de piano e bateria no próximo trecho de exemplo.'}}],
  events: [{
    startSeconds: 11.2, endSeconds: 17.5, chunkIndex:0, analysisPass:'primary', performerName: 'Miles Davis',
    instrument: 'trumpet', role: 'lead', eventKind: 'phrase',
    performerConfidence: .9, confidence: .88, timestampConfidence: .81,
    title: { en: 'Unit test phrase', pt: 'Frase de teste' },
    whatHappens: { en: 'The trumpet shapes a short phrase, releases the line, and leaves room for the ensemble to respond.', pt: 'O trompete desenha uma frase curta, encerra a linha e deixa espaço para a resposta do conjunto.' },
    listenFor: { en: 'Listen for the downward phrase shape and the short space that appears immediately after the final note.', pt: 'Ouça o desenho descendente da frase e o breve espaço que aparece imediatamente após a última nota.' },
    whyItMatters: { en: 'The pause gives the musical statement a conversational quality and makes the next ensemble answer easier to hear.', pt: 'A pausa dá à declaração musical um caráter conversacional e torna mais fácil perceber a próxima resposta do conjunto.' },
    audibleEvidence: { en: 'A focused trumpet phrase is audible in the foreground, with a descending ending and a brief reduction in activity.', pt: 'Uma frase de trompete em primeiro plano é audível, com final descendente e uma breve redução de atividade.' },
    question: { en: 'How does the pause change your perception of the trumpet phrase?', pt: 'Como a pausa muda sua percepção da frase do trompete?' }
  },
  {startSeconds:22,endSeconds:28,chunkIndex:0,analysisPass:'primary',performerName:null,instrument:'piano',role:'accompaniment',eventKind:'rhythmic_gesture',performerConfidence:.2,confidence:.8,timestampConfidence:.8,title:{en:'Piano response',pt:'Resposta do piano'},whatHappens:{en:'The piano adds a distinct short response between the ensemble phrases.',pt:'O piano acrescenta uma resposta curta e distinta entre as frases do conjunto.'},listenFor:{en:'Listen for the compact chordal punctuation and the space it leaves afterward.',pt:'Ouça a pontuação compacta dos acordes e o espaço que ela deixa em seguida.'},whyItMatters:{en:'This gives the ensemble phrase a conversational answer rather than a continuous block of sound.',pt:'Isso dá à frase do conjunto uma resposta conversacional, em vez de um bloco contínuo de som.'},audibleEvidence:{en:'A brief piano attack is audible after the preceding ensemble phrase, followed by a short gap.',pt:'Um ataque breve do piano é audível após a frase anterior do conjunto, seguido por uma pequena pausa.'},question:{en:'How does the short piano reply change the feel of the phrase?',pt:'Como a breve resposta do piano muda a sensação da frase?'}},
  {startSeconds:43,endSeconds:50,chunkIndex:1,analysisPass:'detail',performerName:null,instrument:'drums',role:'pulse',eventKind:'rhythmic_gesture',performerConfidence:.2,confidence:.8,timestampConfidence:.8,title:{en:'Ride cymbal articulation',pt:'Articulação do prato de condução'},whatHappens:{en:'The ride cymbal pattern keeps the pulse moving while the foreground phrase settles.',pt:'O padrão do prato de condução mantém o pulso em movimento enquanto a frase em primeiro plano se acomoda.'},listenFor:{en:'Follow the repeated cymbal strokes and their spacing beneath the other instruments.',pt:'Acompanhe as batidas repetidas do prato e o espaçamento entre elas sob os outros instrumentos.'},whyItMatters:{en:'The steady timekeeping gives the ensemble room to phrase freely without losing the underlying motion.',pt:'A marcação constante do tempo dá espaço para o conjunto frasear livremente sem perder o movimento subjacente.'},audibleEvidence:{en:'Repeated high-frequency cymbal taps continue under the sustained ensemble sound.',pt:'Batidas repetidas e agudas do prato continuam sob o som sustentado do conjunto.'},question:{en:'What do you notice about the cymbal spacing as the phrase changes?',pt:'O que você percebe no espaçamento das batidas do prato quando a frase muda?'}}
  ]
};
assert.equal(bridge.validateRecord(testRecord), null);
bridge.storeRecord(testRecord);
const guide = { analysisOnly: true, trackSpecificGuide: false, cues: [], guideKind: 'unavailable' };
const applied = bridge.applyToGuide(guide, { id, name: 'So What', artist:'Miles Davis', artists:['Miles Davis'], album: 'Kind of Blue', duration_ms: 60000 });
assert.equal(applied.applied, true);
assert.equal(guide.guideKind, 'audio-model-performance-guide');
assert.equal(guide.cues.length, 3);
assert.equal(guide.cues[0].timeSeconds, 11.2);
assert.equal(guide.cues[0].performerName, 'Miles Davis');
const wrongIdentityGuide={analysisOnly:true,trackSpecificGuide:false,cues:[]};
const wrongIdentity=bridge.applyToGuide(wrongIdentityGuide,{id,name:'Freddie Freeloader',artists:['Miles Davis'],album:'Kind of Blue',duration_ms:60000});
assert.equal(wrongIdentity.applied,false,'a So What model record cannot attach to a different current track even if an ID is reused');

// Invalid provenance and invalid performer attributions are rejected.
assert.notEqual(bridge.validateRecord({ ...testRecord, schemaVersion:1 }), null, 'old low-density analysis records are rejected');
assert.notEqual(bridge.validateRecord({ ...testRecord, events:[{...testRecord.events[0],whatHappens:{en:'Nothing happened here.',pt:'Nada aconteceu aqui.'}},...testRecord.events.slice(1)] }), null, 'terse or placeholder-like moment prose is rejected');
assert.notEqual(bridge.validateRecord({ ...testRecord, events:Array.from({length:321},(_,i)=>({...testRecord.events[0],startSeconds:i/10,endSeconds:i/10+.05})) }), null, 'bridge event ceiling matches 8 possible events per adaptive window across 40 windows and rejects overflow');
assert.notEqual(bridge.validateRecord({ ...testRecord, qualityGate:{...testRecord.qualityGate,uncoveredWindows:1} }), null, 'uncovered timeline records are rejected');
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
