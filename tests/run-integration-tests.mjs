import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const source=fs.readFileSync(path.join(root,'audio-analysis-bridge.js'),'utf8');
const memory=new Map();
const window={localStorage:{getItem:k=>memory.has(k)?memory.get(k):null,setItem:(k,v)=>memory.set(k,v)},buildSonicMockGuide(){return {guide:{trackSpecificGuide:true,cues:[{at:.2,title:{en:'Demo-only authored cue',pt:'Momento demonstrativo'}}]}}}};
vm.runInNewContext(source,{window,console,Object,Array,Number,String,Math,JSON,Error});
const bridge=window.SonicAudioAnalysisBridge;assert.ok(bridge);assert.equal(bridge.version,'1.0.3');
const id='A'.repeat(22);
const record={schema:'sonic-audio-analysis-record',schemaVersion:1,recordId:'qa-1',spotifyTrackId:id,recordingMatchConfirmed:true,durationMs:240000,analysedAt:'2026-10-31T12:00:00.000Z',method:'qa-dsp',methodVersion:'qa',sourceFile:{sha256:'test-hash'},events:[
{id:'event-1',timeSeconds:30,evidenceWindow:{start:27,end:33},title:'Timbre change',observation:'Measured timbre bands changed.',strength:72,evidence:{structure:.2,harmonic:.1,timbre:.8,energy:.3,rhythm:.2}},
{id:'event-2',timeSeconds:120,evidenceWindow:{start:117,end:123},title:'Energy change',observation:'Measured energy changed.',strength:61,evidence:{structure:.2,harmonic:.1,timbre:.2,energy:.7,rhythm:.1}}
]};
assert.equal(bridge.validateRecord(record),null);bridge.storeRecord(record);
const track={id,spotifyTrackId:id,duration_ms:240000};
// Critical regression: an empty fail-closed shell may receive DSP candidates only on exact identity + duration.
const shell={title:{en:'Audio analysis — So What'},analysisOnly:true,trackSpecificGuide:false,cues:[],trackName:'So What'};
const applied=bridge.applyToGuide(shell,track);
assert.equal(applied.applied,true);assert.equal(applied.count,2);
assert.equal(shell.guideKind,'audio-analysis-only');assert.equal(shell.sourceStatus,'local-audio-analysis');
assert.equal(shell.trackSpecificGuide,true);assert.equal(shell.cueTimingBasis,'audio-analysis-only');
assert.equal(shell.cues.length,2);assert.ok(shell.cues.every(c=>c.audioAnalysisCandidate===true));
assert.equal(shell.audioAnalysis.status,'candidate-only');
assert.equal(bridge.applyToGuide(shell,track).alreadyApplied,true);
assert.equal(shell.cues.length,2,'duplicate application does not duplicate measured candidates');
// Recording mismatch and duration mismatch are fail-closed: no candidates are appended.
const wrongId={...track,id:'B'.repeat(22),spotifyTrackId:'B'.repeat(22)};
const wrongIdShell={analysisOnly:true,trackSpecificGuide:false,cues:[]};
assert.equal(bridge.applyToGuide(wrongIdShell,wrongId).applied,false);
assert.equal(wrongIdShell.cues.length,0);
const wrongDurationShell={analysisOnly:true,trackSpecificGuide:false,cues:[]};
assert.equal(bridge.applyToGuide(wrongDurationShell,{...track,duration_ms:244000}).applied,false);
assert.equal(wrongDurationShell.cues.length,0);
// Curated editorial cues remain intact when measured candidates are added.
const authored={trackSpecificGuide:true,cues:[{at:.2,title:{en:'Curated cue'}}]};
const hybrid=bridge.applyToGuide(authored,track);
assert.equal(hybrid.applied,true);assert.equal(authored.cues.filter(c=>!c.audioAnalysisCandidate).length,1);
assert.equal(authored.cues.filter(c=>c.audioAnalysisCandidate).length,2);
assert.equal(authored.cueTimingBasis,'audio-analysis-hybrid');
// Invalid records are rejected before storage.
assert.match(bridge.validateRecord({...record,recordingMatchConfirmed:false}),/confirmation/);
assert.match(bridge.validateRecord({...record,spotifyTrackId:'bad'}),/track ID/);
assert.match(bridge.validateRecord({...record,events:[record.events[1],record.events[0]]}),/strictly increasing/);
assert.match(bridge.validateRecord({...record,events:[{...record.events[0],timeSeconds:245}]}),/timestamps/);

// Untimed editorial landmarks must remain outside the timed DSP timeline.
const untimedId='C'.repeat(22);
const untimedRecord={...record,recordId:'qa-untimed',spotifyTrackId:untimedId};
bridge.storeRecord(untimedRecord);
const untimedGuide={guideKind:'curated-offline-track',cueTimingBasis:'untimed-landmarks',trackSpecificGuide:true,cues:[
 {title:{en:'Wynton Kelly sets the pocket'},focus:{en:'Untimed curated topic'}},
 {title:{en:'Miles’s blues phrases'},focus:{en:'Second untimed topic'}}
]};
const originalUntimedCues=JSON.stringify(untimedGuide.cues);
const untimedApplied=bridge.applyToGuide(untimedGuide,{id:untimedId,spotifyTrackId:untimedId,duration_ms:240000});
assert.equal(untimedApplied.applied,true);assert.equal(untimedApplied.separateLane,true);
assert.equal(untimedGuide.cueTimingBasis,'untimed-landmarks','DSP timestamps never convert editorial landmarks into timed cues');
assert.equal(JSON.stringify(untimedGuide.cues),originalUntimedCues,'editorial landmarks remain byte-for-byte unchanged');
assert.equal(untimedGuide.audioAnalysisCandidates.length,2,'DSP candidates are stored in a separate lane');
assert.equal(untimedGuide.audioAnalysis.status,'candidate-only');

console.log('PASS: DSP-only shell, exact Spotify ID/duration gates, measured-candidate labelling, authored-cue preservation, duplicate prevention and invalid-record rejection.');
