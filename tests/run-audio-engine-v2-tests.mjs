import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const lab=fs.readFileSync(path.join(root,'audio-lab/index.html'),'utf8');
const app=fs.readFileSync(path.join(root,'index.html'),'utf8');
const worker=fs.readFileSync(path.join(root,'worker/index.js'),'utf8');
function scriptSlice(source,start,end){const a=source.indexOf(start),b=source.indexOf(end,a);assert.ok(a>=0&&b>a,`source range exists: ${start}`);return source.slice(a,b);}
const bilingual=s=>({en:s,pt:s});
const event=(start,end,instrument,kind,title,confidence=.8,chunkIndex=0,analysisPass='primary')=>({startSeconds:start,endSeconds:end,instrument,eventKind:kind,confidence,timestampConfidence:.8,performerConfidence:.2,chunkIndex,analysisPass,title:bilingual(title),audibleEvidence:bilingual(title),whatHappens:bilingual(title)});
// Exercise the production overlap deduplicator, not a reimplementation.
const dedupeContext={bilingual,CHUNK_SECONDS:30,OVERLAP_SECONDS:8};vm.createContext(dedupeContext);
vm.runInContext(scriptSlice(lab,'function jaccard(a,b){','\nasync function callModelForChunk'),dedupeContext,{timeout:10000});
const candidates=[
 event(25,33,'trumpet','phrase','A descending trumpet phrase releases into a pause',.8),
 event(28,34,'trumpet','phrase','The trumpet phrase descends and leaves a pause',.95,1), // same overlap event from next clip
 event(31,37,'piano','rhythmic_gesture','Piano chords punctuate the space after the horn line',.82,1),
 event(39,44,'trumpet','phrase','A separate trumpet response starts after the piano punctuation',.84,1)
];
const deduped=dedupeContext.deduplicateEvents(candidates);
assert.equal(deduped.length,3,'overlap copies merge, but independent piano and trumpet gestures remain distinct');
assert.equal(deduped[0].confidence,.95,'the stronger duplicate is retained');
assert.deepEqual(Array.from(deduped,x=>x.startSeconds),[28,31,39],'dedup output is chronologically ordered');
const samePassDistinct=dedupeContext.deduplicateEvents([event(10,16,'trumpet','phrase','A brief ascending trumpet phrase',.8,2),event(14,20,'trumpet','phrase','A new trumpet answer with a sharp falling ending',.8,2)]);
assert.equal(samePassDistinct.length,2,'separate events from the same model pass are never merged by overlap heuristics');
// Production event normalization must preserve source-window and pass provenance while offsetting to track time.
vm.runInContext(scriptSlice(lab,'function normalizeModelEvents(analysis,chunk,pass){','\nasync function runAudioModelAnalysis'),dedupeContext,{timeout:10000});
const one={startSeconds:5,endSeconds:9,performerName:null,instrument:'piano',role:'accompaniment',eventKind:'phrase',confidence:.8,performerConfidence:.2,timestampConfidence:.8,title:bilingual('A distinct piano phrase'),whatHappens:bilingual('The piano outlines a compact phrase before the ensemble continues.'),listenFor:bilingual('Listen to the short rising figure and the chord release that follows it.'),whyItMatters:bilingual('The phrase provides a clear response to the sustained ensemble texture.'),audibleEvidence:bilingual('A sequence of piano notes is audible in the foreground with a clear release.'),question:bilingual('How does this phrase answer the ensemble?')};
const normalized=dedupeContext.normalizeModelEvents({events:[one]},{start:30,duration:30,index:4},'detail');
assert.equal(normalized[0].startSeconds,35,'excerpt-relative timestamp is offset into the whole recording');
assert.equal(normalized[0].endSeconds,39);
assert.equal(normalized[0].analysisPass,'detail');
assert.equal(normalized[0].chunkIndex,4);
// Exercise the production 9.5-minute analysis plan and the actual fail-closed coverage evaluator.
vm.runInContext(scriptSlice(lab,'function buildAnalysisPlan(durationSeconds){','function normalizeModelEvents'),dedupeContext,{timeout:10000});
const plan=dedupeContext.buildAnalysisPlan(570);
assert.equal(plan.total,26,'a 9.5-minute recording is scanned in 26 overlapping windows, not four or six');
assert.equal(plan.minimumMoments,29,'the publish floor scales with duration at three moments per minute');
assert.equal(plan.step,22,'8-second overlap is included in the real production plan');
const denseEvents=Array.from({length:29},(_,i)=>({startSeconds:i*19.5,endSeconds:i*19.5+8}));
const goodCoverage=dedupeContext.evaluateModelCoverage(denseEvents,570,plan.total,plan);
assert.equal(goodCoverage.coverageGateFailed,false,'a sufficiently dense continuous 9.5-minute timeline passes');
assert.equal(dedupeContext.evaluateModelCoverage(denseEvents.slice(0,6),570,plan.total,plan).coverageGateFailed,true,'four-to-six cue regressions fail closed for a long recording');
const sparseTimeline=denseEvents.map((e,i)=>({...e,startSeconds:i>=10&&i<19?e.startSeconds+60:e.startSeconds,endSeconds:i>=10&&i<19?e.endSeconds+60:e.endSeconds})).sort((a,b)=>a.startSeconds-b.startSeconds);
assert.equal(dedupeContext.evaluateModelCoverage(sparseTimeline,570,plan.total,plan).coverageGateFailed,true,'a large uncovered time gap fails even when moment count is high');
assert.throws(()=>dedupeContext.buildAnalysisPlan(800),/duration/,'out-of-range recording duration is rejected');
assert.throws(()=>dedupeContext.normalizeModelEvents({events:[{...one,startSeconds:29}]},{start:30,duration:30,index:4},'detail'),/invalid timestamp/,'out-of-range relative timestamps fail closed');
// Production live moment progress bar updates fill, text and accessibility state.
const timerContext={lang:'en',prettyMs(ms){const sec=Math.max(0,Math.floor(ms/1000));return `${Math.floor(sec/60)}:${String(sec%60).padStart(2,'0')}`;}};
const timerEls=new Map();
function element(){const classes=new Set(['hidden']);return{textContent:'',style:{width:''},attrs:{},classList:{add(x){classes.add(x)},remove(x){classes.delete(x)},contains(x){return classes.has(x)}},setAttribute(k,v){this.attrs[k]=v;}};}
timerContext.$=id=>{if(!timerEls.has(id))timerEls.set(id,element());return timerEls.get(id)};
vm.createContext(timerContext);
vm.runInContext(scriptSlice(app,'function renderActiveMomentProgress(cue,progressMs){','\nfunction updateModelMomentBars'),timerContext,{timeout:10000});
timerContext.renderActiveMomentProgress({timeSeconds:10,endSeconds:20},12000);
assert.equal(timerContext.$('activeMomentProgress').classList.contains('hidden'),false,'active cue progress panel becomes visible');
assert.equal(timerContext.$('activeMomentProgressFill').style.width,'20.00%','active cue progress is relative to its own duration, not whole track');
assert.equal(timerContext.$('activeMomentProgressClock').textContent,'0:02 / 0:10');
assert.equal(timerContext.$('activeMomentProgressTrack').attrs['aria-valuenow'],'20');
timerContext.renderActiveMomentProgress({timeSeconds:10,endSeconds:20},5000);
assert.equal(timerContext.$('activeMomentProgressClock').textContent,'STARTS IN 0:05');
timerContext.renderActiveMomentProgress({timeSeconds:10,endSeconds:20},25000);
assert.equal(timerContext.$('activeMomentProgressClock').textContent,'COMPLETED');
// Production full-list updater moves each card's own progress bar.
const cards=[0,1].map(i=>{const bar={dataset:{cueIndex:String(i)},querySelector(sel){return sel==='[data-moment-fill]'?this.fill:sel==='[data-moment-clock]'?this.clock:sel==='[role="progressbar"]'?this.track:null;},fill:{style:{width:''}},clock:{textContent:''},track:{setAttribute(k,v){this.attrs??={};this.attrs[k]=v;}}};return bar;});
const listRoot={querySelectorAll(){return cards}};timerContext.$=id=>id==='dynamicCueList'?listRoot:timerEls.get(id)||element();
vm.runInContext(scriptSlice(app,'function updateModelMomentBars(cues,progressMs){','\nfunction renderCueExtras'),timerContext,{timeout:10000});
timerContext.updateModelMomentBars([{timeSeconds:10,endSeconds:20},{timeSeconds:30,endSeconds:40}],15000);
assert.equal(cards[0].fill.style.width,'50.00%');
assert.equal(cards[1].clock.textContent,'In 0:15');
assert.equal(cards[1].fill.style.width,'0.00%');
// Build-level checks for short windows, adaptive pass, parallelism and quality gates.
assert.match(lab,/CHUNK_SECONDS=30,OVERLAP_SECONDS=8/);
assert.match(lab,/batchStart<total;batchStart\+=2/,'two-window concurrency reduces serial API latency');
assert.match(lab,/Promise\.all\(indices\.map/);
assert.match(lab,/primary.events.length<3/);
assert.match(lab,/minimumMoments:Math\.ceil\(duration\/20\)/);
assert.match(lab,/maximumSilentGapSeconds:45/);
assert.match(lab,/maxSilentGapSeconds>plan.maximumSilentGapSeconds/);
assert.match(lab,/uncoveredWindows>0/);
assert.match(worker,/maximum six per 30-second excerpt/);
assert.match(worker,/DETAIL PASS:/);
assert.match(worker,/underdeveloped bilingual content/);
assert.match(app,/id="activeMomentProgress"/);
assert.match(app,/className='dynamic-cue-moment-progress'/);
console.log('PASS: Audio Lab Engine 2.0 overlap dedup, timestamp normalization, adaptive two-pass concurrency, density/continuity gates, live moment timer, per-card timers and accessibility state.');
