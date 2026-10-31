import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const dataMatch=html.match(/<script id="sonic-guide-data-inline">([\s\S]*?)<\/script>/);
assert.ok(dataMatch,'curated source data block exists');
const window={SonicTranslationCore:{pick(value,locale){if(value&&typeof value==='object'&&!Array.isArray(value))return value[locale]??value.en??'';return value??'';}}};
const context={window,Date,console,Map,Array,String,Number,Math,JSON};
vm.createContext(context);
vm.runInContext(dataMatch[1],context,{timeout:10000});
function extract(startMarker,endMarker){const a=html.indexOf(startMarker);assert.notEqual(a,-1,`missing ${startMarker}`);const b=html.indexOf(endMarker,a);assert.notEqual(b,-1,`missing ${endMarker}`);return html.slice(a,b);}
vm.runInContext(extract('function normTrack(s){','\nfunction clearLiveGuideState(){'),context,{timeout:10000});
vm.runInContext(extract('function buildFreddieFreeloaderMoments(){','\nfunction buildCuratedAlbumTrackGuide(item,match){'),context,{timeout:10000});
vm.runInContext(extract('function buildCuratedAlbumTrackGuide(item,match){','\nfunction delay(ms){'),context,{timeout:10000});
const track={
 id:'A'.repeat(22),
 name:'Freddie Freeloader (feat. John Coltrane, Cannonball Adderley, Wynton Kelly & Paul Chambers)',
 artists:[{name:'Miles Davis'},{name:'John Coltrane'},{name:'Cannonball Adderley'},{name:'Wynton Kelly'},{name:'Paul Chambers'}],
 album:{id:'legacy-edition-test',name:'Kind Of Blue (Legacy Edition)'},duration_ms:588000
};
const match=context.findCuratedTrack(track);
assert.deepEqual(JSON.parse(JSON.stringify(match)),{key:'kind-blue',index:1,kind:'track',score:200},'featured artist credits and Legacy Edition title resolve to Freddie Freeloader exactly');
const built=context.buildCuratedAlbumTrackGuide(track,match);
assert.ok(built?.guide,'resolver must return a curated track guide, not an unavailable shell');
// Execute the actual production loader function, not only the low-level catalogue builder.
context.buildCuratedRhapsodyTrackGuide=()=>null;
context.window.SonicAudioAnalysisBridge={applyToGuide(guide,bodyTrack){
 assert.equal(bodyTrack.spotifyTrackId,track.id);
 assert.equal(bodyTrack.duration_ms,track.duration_ms);
 assert.equal(guide.guideKind,'curated-offline-track');
 return {applied:false,reason:'no-matching-record'};
}};
vm.runInContext(extract('function loadAvailableTrackGuide(track){','\nfunction showDynamicLoading(track){'),context,{timeout:10000});
const loaded=context.loadAvailableTrackGuide(track);
assert.equal(loaded.result.guide.guideKind,'curated-offline-track','production loader must return the jazz guide');
assert.equal(loaded.result.guide.cues.length,22,'production loader returns the expanded Freddie moment sequence');
assert.equal(loaded.analysis.reason,'no-matching-record','guide resolution does not depend on Audio Lab data');
assert.equal(built.guide.guideKind,'curated-offline-track');
assert.equal(built.guide.trackSpecificGuide,true);
assert.equal(built.guide.cueTimingBasis,'approximate-progress-proportions');
assert.equal(built.guide.cues.length,22,'all twenty-two expanded Freddie moments are present');
assert.equal(built.guide.cues[0].title.en,'The pocket before the story');
assert.equal(built.guide.cues[1].title.en,'The head states the blues');
assert.ok(built.guide.cues.every(c=>Number.isFinite(c.at)),'structure-derived editorial anchors have approximate timeline positions');
assert.ok(built.guide.sources.some(x=>x.url==='https://www.milesdavis.com/albums/kind-of-blue-legacy-edition/'));
assert.ok(built.guide.sources.some(x=>x.url==='https://www.milesdavis.com/track/freddie-freeloader-feat-john-coltrane-cannonball-adderley-wynton-kelly-paul-chambers/'));
assert.equal(built.guide.provenance.spotifyTrackId,track.id);
// Strict identity negatives: no primary artist mismatch, no album mismatch, no live version, no bonus studio sequence.
assert.equal(context.findCuratedTrack({...track,artists:[{name:'The Miles Davis Quintet'}]}),null,'wrong primary artist must not match');
assert.equal(context.findCuratedTrack({...track,album:{name:'Kind of Blue Live at Newport'}}),null,'live album must not match the studio guide');
assert.equal(context.findCuratedTrack({...track,name:'Freddie Freeloader — Studio Sequence 1'}),null,'bonus studio sequence must not inherit the main-track guide');
assert.equal(context.findCuratedTrack({...track,name:'Freddie Freeloader (Live at Newport)'}),null,'live recording must not inherit the studio-track guide');
assert.equal(context.findCuratedTrack({...track,album:{name:'Jazz Classics Compilation'}}),null,'a compilation without the album identity must fail closed');
// Every title in both jazz catalogues resolves only with the expected artist and album identity.
for (const [index, entry] of context.window.SONIC_GUIDES['kind-blue'].tracks.entries()) {
 const title=entry.title.en;
 const m=context.findCuratedTrack({...track,name:title});
 assert.equal(m?.key,'kind-blue',`${title} resolves inside Kind of Blue`);
 assert.equal(m?.index,index,`${title} resolves to the correct catalogue index`);
}
const giantArtists=[{name:'John Coltrane'}];
for (const [index, entry] of context.window.SONIC_GUIDES['giant-steps'].tracks.entries()) {
 const title=entry.title.en;
 const m=context.findCuratedTrack({...track,name:title,artists:giantArtists,album:{name:'Giant Steps'}});
 assert.equal(m?.key,'giant-steps',`${title} resolves inside Giant Steps`);
 assert.equal(m?.index,index,`${title} resolves to the correct catalogue index`);
}
const remaster=context.findCuratedTrack({...track,name:'Freddie Freeloader - 2013 Remaster'});
assert.equal(remaster?.index,1,'a remaster suffix resolves to the correct studio track');
// Explicitly verify the production loader cannot discard non-Rachmaninoff matches again.
assert.ok(html.includes('buildCuratedRhapsodyTrackGuide(track,match)||buildCuratedAlbumTrackGuide(track,match)'),'loader dispatch is wired to jazz guide builder');
assert.ok(html.includes("data.guide.guideKind==='curated-offline-track'"),'manual lookup recognizes the curated jazz track state');
assert.ok(html.includes("result.guide.guideKind==='curated-offline-track'"),'Spotify auto-follow recognizes the curated jazz track state');
// Render path requirements: untimed labels, manual selection, and separate DSP lane.
assert.ok(html.includes("if(displayGuide.cueTimingBasis==='untimed-landmarks')"));
assert.ok(html.includes("const dspCandidates=displayGuide.audioAnalysisCandidates||[]"));
assert.ok(html.includes("cueRoot.addEventListener('click'"));
assert.ok(html.includes("if(displayGuide.cueTimingBasis==='untimed-landmarks')"));
assert.ok(html.includes("Editorial topics are untimed and do not advance automatically with Spotify playback."));
assert.ok(html.includes("dynamicCueIndex=index;renderActiveCue();"));
console.log('PASS: Freddie Freeloader exact resolution, all Kind of Blue tracks, Giant Steps, strict identity rejection, official sources, untimed landmarks and production dispatch.');
