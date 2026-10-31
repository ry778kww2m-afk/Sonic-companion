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
assert.equal(bridge.version, '2.1.0');
const id = '1234567890123456789012';
const makeEvent=(startSeconds,endSeconds,chunkIndex,analysisPass,instrument,titleEn,titlePt,performerName=null)=>({
  startSeconds,endSeconds,chunkIndex,analysisPass,performerName,instrument,role:instrument==='trumpet'?'lead':'accompaniment',eventKind:'phrase',
  performerConfidence:performerName?0.9:0.2,confidence:0.86,timestampConfidence:0.82,
  title:{en:titleEn,pt:titlePt},
  whatHappens:{en:'The instrument shapes a distinct phrase, releases the line, and leaves room for another musical voice to answer within the ensemble texture.',pt:'O instrumento desenha uma frase distinta, encerra a linha e deixa espaço para outra voz musical responder dentro da textura do conjunto.'},
  listenFor:{en:'Listen for the contour of the phrase, its articulation, and the brief space that follows before the ensemble movement continues.',pt:'Ouça o contorno da frase, sua articulação e o breve espaço que vem depois, antes de o movimento do conjunto continuar.'},
  whyItMatters:{en:'This gesture gives the passage a conversational shape and makes the relationship between foreground and accompaniment easier to hear.',pt:'Esse gesto dá ao trecho um formato conversacional e torna mais audível a relação entre primeiro plano e acompanhamento.'},
  audibleEvidence:{en:'A clearly separated musical gesture is audible, followed by a change in the texture and a short opening for another part.',pt:'Um gesto musical claramente separado é audível, seguido por uma mudança na textura e uma breve abertura para outra parte.'},
  question:{en:'What does this gesture reveal about the way the ensemble listens and responds?',pt:'O que esse gesto revela sobre a maneira como o conjunto escuta e responde?'}
});
const testRecord = {
  schema:'sonic-audio-model-performance-record',schemaVersion:2,recordId:'unit-test-only',spotifyTrackId:id,
  trackTitle:'So What',artist:'Miles Davis',album:'Kind of Blue',recordingVersion:'Original 1959 studio recording',recordingMatchConfirmed:true,
  analysedAt:new Date().toISOString(),durationSeconds:60,durationMs:60000,
  sourceFile:{name:'unit-test-audio.wav',sizeBytes:1,sha256:'a'.repeat(64)},audioInputSubmitted:true,audioInputMode:'direct-audio-input-chunked',model:'gpt-audio-1.5',
  engineVersion:'2.1.0',analysisStrategy:'30s-overlapping-primary-plus-mandatory-detail-plus-adaptive-depth',
  qualityGate:{minimumMoments:4,minimumMomentsPerMinute:4,maximumSilentGapSeconds:30,observedMomentsPerMinute:4,observedMaxSilentGapSeconds:11,uncoveredWindows:0},
  chunking:{chunkSeconds:30,overlapSeconds:8,count:3,detailPassCount:3,depthPassCount:1},
  segmentSummaries:[
   {startSeconds:0,endSeconds:30,summary:{en:'This test-only listening summary describes the foreground phrase, its rhythmic shape, and the first ensemble response in this audio window.',pt:'Este resumo de escuta de teste descreve a frase em primeiro plano, seu desenho rítmico e a primeira resposta do conjunto nesta janela de áudio.'}},
   {startSeconds:22,endSeconds:52,summary:{en:'This test-only listening summary describes the piano accompaniment, bass support, and the way the ensemble carries the phrase forward in this overlapping window.',pt:'Este resumo de escuta de teste descreve o acompanhamento do piano, o apoio do baixo e a maneira como o conjunto leva a frase adiante nesta janela sobreposta.'}},
   {startSeconds:44,endSeconds:60,summary:{en:'This test-only listening summary describes the closing phrase, the final ensemble texture, and the transition toward the end of this sample recording.',pt:'Este resumo de escuta de teste descreve a frase de encerramento, a textura final do conjunto e a transição em direção ao fim desta gravação de amostra.'}}
  ],
  events:[
   makeEvent(4,9,0,'primary','trumpet','Unit-test trumpet phrase','Frase de trompete de teste','Miles Davis'),
   makeEvent(18,23,0,'detail','piano','Unit-test piano response','Resposta de piano de teste'),
   makeEvent(34,39,1,'depth','drums','Unit-test rhythmic response','Resposta rítmica de teste'),
   makeEvent(50,55,2,'primary','bass','Unit-test bass movement','Movimento de baixo de teste')
  ]
};
assert.equal(bridge.validateRecord(testRecord), null);
bridge.storeRecord(testRecord);
const guide = { analysisOnly: true, trackSpecificGuide: false, cues: [], guideKind: 'unavailable' };
const applied = bridge.applyToGuide(guide, { id, name: 'So What', artist:'Miles Davis', artists:['Miles Davis'], album: 'Kind of Blue', duration_ms: 60000 });
assert.equal(applied.applied, true);
assert.equal(guide.guideKind, 'audio-model-performance-guide');
assert.equal(guide.cues.length, 4, 'all validated model events become timed moment cards');
assert.equal(guide.cues[0].timeSeconds, 4);
assert.equal(guide.cues[0].performerName, 'Miles Davis');
const wrongIdentityGuide={analysisOnly:true,trackSpecificGuide:false,cues:[]};
const wrongIdentity=bridge.applyToGuide(wrongIdentityGuide,{id,name:'Freddie Freeloader',artists:['Miles Davis'],album:'Kind of Blue',duration_ms:60000});
assert.equal(wrongIdentity.applied,false,'a So What model record cannot attach to a different current track even if an ID is reused');

// Invalid provenance and invalid performer attributions are rejected.
assert.notEqual(bridge.validateRecord({ ...testRecord, schemaVersion:1 }), null, 'old low-density analysis records are rejected');
assert.notEqual(bridge.validateRecord({ ...testRecord, events:[{...testRecord.events[0],whatHappens:{en:'Nothing happened here.',pt:'Nada aconteceu aqui.'}},...testRecord.events.slice(1)] }), null, 'terse or placeholder-like moment prose is rejected');
assert.notEqual(bridge.validateRecord({ ...testRecord, events:Array.from({length:721},(_,i)=>({...testRecord.events[0],startSeconds:i/10,endSeconds:i/10+.05})) }), null, 'bridge event ceiling matches 18 possible events per window across 40 windows and rejects overflow');
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
