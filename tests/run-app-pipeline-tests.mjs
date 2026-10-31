import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = p => fs.readFileSync(path.join(root, p), 'utf8');
const app = read('index.html');
const bridgeSource = read('audio-analysis-bridge.js');

const id = '1234567890123456789012';
const bilingual = s => ({ en: s, pt: s });
const long = (prefix, i) => `${prefix} ${i}: listen to the articulation, contour, timing, release, and response within the ensemble texture. This is a test-only sentence, not a real musical observation.`;
const durationSeconds = 570;
const count = 38;
const events = Array.from({ length: count }, (_, i) => {
  const startSeconds = Number((1 + i * 14.7).toFixed(2));
  const instrument = ['trumpet', 'piano', 'tenor saxophone', 'bass', 'drums', 'ensemble'][i % 6];
  const performerName = instrument === 'trumpet' ? 'Miles Davis' : null;
  return {
    startSeconds,
    endSeconds: Number((startSeconds + 6).toFixed(2)),
    chunkIndex: Math.min(25, Math.floor(startSeconds / 22)),
    analysisPass: ['primary', 'detail', 'depth'][i % 3],
    performerName,
    instrument,
    role: instrument === 'trumpet' ? 'lead' : 'accompaniment',
    eventKind: ['phrase', 'rhythmic_gesture', 'response'][i % 3],
    performerConfidence: performerName ? 0.9 : 0.2,
    confidence: 0.84,
    timestampConfidence: 0.82,
    title: bilingual(long('Moment', i + 1)),
    whatHappens: bilingual(long('The sound develops', i + 1)),
    listenFor: bilingual(long('Listen for the phrase', i + 1)),
    whyItMatters: bilingual(long('This interaction matters', i + 1)),
    audibleEvidence: bilingual(long('The reported audible evidence', i + 1)),
    question: bilingual(`What changes in this moment ${i + 1}, and how does it relate to the ensemble?`)
  };
});
const gaps = [events[0].startSeconds, ...events.slice(1).map((e, i) => Math.max(0, e.startSeconds - events[i].endSeconds)), durationSeconds - events.at(-1).endSeconds];
const maxGap = Math.max(...gaps);
const record = {
  schema: 'sonic-audio-model-performance-record', schemaVersion: 2,
  recordId: 'test-pipeline-9m30-38-events', spotifyTrackId: id,
  trackTitle: 'So What', artist: 'Miles Davis', album: 'Kind of Blue',
  recordingVersion: 'Original 1959 studio recording', recordingMatchConfirmed: true,
  analysedAt: '2026-10-31T12:00:00.000Z', durationSeconds, durationMs: durationSeconds * 1000,
  sourceFile: { name: 'unit-test-only.wav', sizeBytes: 1, sha256: 'a'.repeat(64) },
  audioInputSubmitted: true, audioInputMode: 'direct-audio-input-chunked', model: 'gpt-audio-1.5',
  engineVersion: '2.1.0', analysisStrategy: '30s-overlapping-primary-plus-mandatory-detail-plus-adaptive-depth',
  qualityGate: { minimumMoments: 38, minimumMomentsPerMinute: 4, maximumSilentGapSeconds: 30, observedMomentsPerMinute: 4, observedMaxSilentGapSeconds: maxGap, uncoveredWindows: 0 },
  chunking: { chunkSeconds: 30, overlapSeconds: 8, count: 26, detailPassCount: 26, depthPassCount: 0 },
  segmentSummaries: Array.from({ length: 26 }, (_, i) => ({
    startSeconds: i * 22,
    endSeconds: Math.min(durationSeconds, i * 22 + 30),
    summary: bilingual(`Window ${i + 1}: ${long('The model listening log describes', i + 1)}`)
  })),
  events
};

// Exercise the actual bridge producer/consumer contract.
const store = new Map();
const windowMock = { localStorage: { getItem: k => store.get(k) ?? null, setItem: (k, v) => store.set(k, String(v)) } };
vm.runInNewContext(bridgeSource, { window: windowMock, console, setTimeout });
const bridge = windowMock.SonicAudioAnalysisBridge;
assert.equal(bridge.version, '2.1.0');
assert.equal(bridge.validateRecord(record), null, 'dense test-only model record passes the real bridge validator');
bridge.storeRecord(record);
const guide = { analysisOnly: true, trackSpecificGuide: false, cues: [], guideKind: 'unavailable' };
const applied = bridge.applyToGuide(guide, {
  title: 'So What', artists: ['Miles Davis'], album: 'Kind of Blue', spotifyTrackId: id, duration_ms: 570000
});
assert.equal(applied.applied, true, `bridge applies the record: ${applied.reason || ''}`);
assert.equal(guide.cues.length, 38, 'all 38 model events survive bridge mapping');
assert.equal(guide.sourceStatus, 'direct-audio-model-analysis');
assert.equal(guide.audioModelAnalysis.momentCount, 38);
const sparseRecord = { ...record, events: events.slice(0, 6), qualityGate: { ...record.qualityGate, observedMomentsPerMinute: Number((6 / (durationSeconds / 60)).toFixed(2)) } };
assert.notEqual(bridge.validateRecord(sparseRecord), null, 'the real bridge rejects a four-to-six-moment result for a 9.5-minute recording');

// Minimal DOM implementation used to run the real app renderDynamicGuide function.
class MockElement {
  constructor(tag = 'div') {
    this.tagName = tag.toUpperCase(); this.children = []; this.parentNode = null;
    this.className = ''; this.dataset = {}; this.attrs = {}; this.style = {};
    this.textContent = ''; this.hidden = false; this.id = '';
    const classes = new Set();
    this.classList = {
      add: (...names) => names.forEach(x => classes.add(x)),
      remove: (...names) => names.forEach(x => classes.delete(x)),
      contains: name => classes.has(name),
      toggle: (name, force) => { const add = force === undefined ? !classes.has(name) : !!force; add ? classes.add(name) : classes.delete(name); return add; }
    };
  }
  append(...nodes) { for (const node of nodes) { if (node && typeof node === 'object') { node.parentNode = this; this.children.push(node); } } }
  appendChild(node) { this.append(node); return node; }
  setAttribute(k, v) { this.attrs[k] = String(v); }
  removeAttribute(k) { delete this.attrs[k]; }
  addEventListener() {}
  querySelectorAll(selector) {
    const out = [];
    const matches = n => selector.startsWith('#') ? n.id === selector.slice(1) : selector.startsWith('.') ? String(n.className).split(/\s+/).includes(selector.slice(1)) : selector.startsWith('[data-') ? Object.hasOwn(n.dataset, selector.slice(6, -1).replace(/-([a-z])/g, (_, c) => c.toUpperCase())) : false;
    const visit = n => { for (const c of n.children) { if (matches(c)) out.push(c); visit(c); } };
    visit(this); return out;
  }
  querySelector(selector) { return this.querySelectorAll(selector)[0] || null; }
  contains(node) { for (let p = node; p; p = p.parentNode) if (p === this) return true; return false; }
}
const elements = new Map();
const getEl = id => { if (!elements.has(id)) { const e = new MockElement(); e.id = id; elements.set(id, e); } return elements.get(id); };
const documentMock = {
  body: new MockElement('body'),
  createElement: tag => new MockElement(tag)
};
const context = {
  window: { SonicAudioAnalysisBridge: { version: '2.1.0' } }, document: documentMock,
  dynamicGuide: guide, dynamicGuideTrackId: id, dynamicCueIndex: 0,
  activePlaybackTrack: { id, name: 'So What', artists: [{ name: 'Miles Davis' }], album: { name: 'Kind of Blue' }, duration_ms: 570000 },
  selectedSearchTrack: null,
  lastPlaybackSnapshot: { trackId: id, progressMs: 0, durationMs: 570000, sampledAt: 0, isPlaying: false },
  guideViewMode: 'full', lang: 'en',
  isAudioModelGuide: g => !!(g && g.audioModelAnalysis?.model === 'gpt-audio-1.5' && Array.isArray(g.cues) && g.cues.length > 0 && Number(g.audioModelAnalysis.momentCount) === g.cues.length && g.sourceStatus === 'direct-audio-model-analysis'),
  getDisplayedDynamicGuide: () => guide,
  pickGuideText: value => typeof value === 'string' ? value : (value?.en || ''),
  renderTranslationNotice() {}, renderActiveCue() {},
  prettyMs(ms) { const s = Math.max(0, Math.floor(Number(ms) / 1000)); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; },
  $: getEl
};
vm.createContext(context);
const renderStart = app.indexOf('function renderDynamicGuide(){');
const renderEnd = app.indexOf('\nfunction autoFollowPlayback', renderStart);
assert.ok(renderStart >= 0 && renderEnd > renderStart, 'real renderer function is present');
vm.runInContext(app.slice(renderStart, renderEnd), context, { timeout: 10000 });
context.renderDynamicGuide();
const list = getEl('dynamicListeningContent').querySelector('#dynamicCueList');
assert.ok(list, 'full-view cue list is rendered');
const cards = list.querySelectorAll('.dynamic-cue');
const bars = list.querySelectorAll('.dynamic-cue-moment-progress');
assert.equal(cards.length, 38, 'real renderer displays all 38 mapped moments');
assert.equal(bars.length, 38, 'real renderer adds one timing/progress bar to every moment card');
assert.match(getEl('dynamicListeningBadge').textContent, /38 MOMENTS/, 'visible badge exposes actual model cue count');
assert.match(getEl('dynamicListeningMeta').textContent, /BUILD v1\.0\.10 · BRIDGE 2\.1\.0 · 38 AUDIO-DERIVED MOMENTS/);
assert.equal(context.guideViewMode, 'full', 'model guide defaults to full view so per-card timers are not hidden');

console.log('PASS: real bridge + real app renderer end-to-end; 9m30s test record maps 38 cues and renders 38 per-moment timing bars in Full view. Fixture is test-only; no mock data is bundled into app content.');
