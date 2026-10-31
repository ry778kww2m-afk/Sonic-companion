import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const source=fs.readFileSync(path.join(root,'audio-analysis-bridge.js'),'utf8');
const memory=new Map();
const window={localStorage:{getItem:k=>memory.has(k)?memory.get(k):null,setItem:(k,v)=>memory.set(k,v)},buildSonicMockGuide(){return {guide:{trackSpecificGuide:true,cues:[{at:.2,title:{en:'Authored cue',pt:'Momento editorial'}}]}}}};
vm.runInNewContext(source,{window,console,Object,Array,Number,String,Math,JSON,Error});
const bridge=window.SonicAudioAnalysisBridge;assert.ok(bridge);assert.equal(bridge.version,'1.0.1');
const id='A'.repeat(22);
const record={schema:'sonic-audio-analysis-record',schemaVersion:1,recordId:'qa-1',spotifyTrackId:id,recordingMatchConfirmed:true,durationMs:240000,analysedAt:'2026-10-31T12:00:00.000Z',method:'qa-dsp',methodVersion:'qa',sourceFile:{sha256:'test-hash'},events:[
{id:'event-1',timeSeconds:30,evidenceWindow:{start:27,end:33},title:'Timbre change',observation:'Measured timbre bands changed.',strength:72,evidence:{structure:.2,harmonic:.1,timbre:.8,energy:.3,rhythm:.2}},
{id:'event-2',timeSeconds:120,evidenceWindow:{start:117,end:123},title:'Energy change',observation:'Measured energy changed.',strength:61,evidence:{structure:.2,harmonic:.1,timbre:.2,energy:.7,rhythm:.1}}
]};
assert.equal(bridge.validateRecord(record),null);bridge.storeRecord(record);
const payload={track:{id,duration_ms:240000}};
const guide=window.buildSonicMockGuide(payload).guide;
assert.equal(guide.cues.length,3);assert.ok(guide.cues.some(c=>c.title.en==='Authored cue'));
assert.equal(guide.cues.filter(c=>c.audioAnalysisCandidate).length,2);
assert.equal(guide.cues.find(c=>c.analysisEventId==='event-1').timeSeconds,30);
assert.equal(guide.audioAnalysis.candidateCount,2);
assert.equal(guide.cueTimingBasis,'audio-analysis-hybrid');
assert.match(guide.balancedNote.en,/do not identify instruments/i);
const originalLength=guide.cues.length;assert.equal(bridge.applyToGuide(guide,payload.track).alreadyApplied,true);assert.equal(guide.cues.length,originalLength);
const other=window.buildSonicMockGuide({track:{id:'B'.repeat(22),duration_ms:240000}}).guide;assert.equal(other.cues.length,1);
const mismatch=window.buildSonicMockGuide({track:{id,duration_ms:244000}}).guide;assert.equal(mismatch.cues.length,1);
assert.match(bridge.validateRecord({...record,recordingMatchConfirmed:false}),/confirmation/);
assert.match(bridge.validateRecord({...record,spotifyTrackId:'bad'}),/track ID/);
assert.match(bridge.validateRecord({...record,events:[record.events[1],record.events[0]]}),/strictly increasing/);
assert.match(bridge.validateRecord({...record,events:[{...record.events[0],timeSeconds:245}]}),/timestamps/);
console.log('PASS: exact Spotify ID and duration matching, fail-closed validation, additive bilingual candidates, authored cue preservation and duplicate prevention.');
