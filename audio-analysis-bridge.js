/* Sonic Companion — Audio Lab bridge v2.1.0
 * Model records contain only content returned by direct GPT-Audio 1.5 input.
 * Legacy DSP records remain supported for non-So-What tracks and are never used
 * as musical explanations for the So What proof-of-concept.
 */
(function (root) {
 'use strict';
 const DSP_STORE_KEY='sonic.audioAnalysis.registry.v1';
 const MODEL_STORE_KEY='sonic.audioModelAnalysis.registry.v1';
 const DSP_SCHEMA='sonic-audio-analysis-record';
 const MODEL_SCHEMA='sonic-audio-model-performance-record';
 const MAX_EVENTS=720, DURATION_TOLERANCE_MS=3000;
 const ROSTER=['Miles Davis','Julian “Cannonball” Adderley','Cannonball Adderley','John Coltrane','Bill Evans','Paul Chambers','Jimmy Cobb'];
 function readStore(key){try{const p=JSON.parse(root.localStorage.getItem(key)||'{"schemaVersion":1,"records":{}}');if(!p||p.schemaVersion!==1||!p.records||typeof p.records!=='object'||Array.isArray(p.records))return{schemaVersion:1,records:{}};return p}catch(_){return{schemaVersion:1,records:{}}}}
 function bilingual(x){return !!x&&typeof x==='object'&&typeof x.en==='string'&&x.en.trim().length>0&&typeof x.pt==='string'&&x.pt.trim().length>0}
 function richBilingual(x,minWords=9,minChars=65){const words=v=>String(v||'').trim().split(/\s+/).filter(Boolean).length;return bilingual(x)&&x.en.trim().length>=minChars&&x.pt.trim().length>=minChars&&words(x.en)>=minWords&&words(x.pt)>=minWords}
 function validateModelRecord(r){
  if(!r||r.schema!==MODEL_SCHEMA||r.schemaVersion!==2)return 'Unsupported or obsolete model-analysis format. Re-run Audio Lab Engine 2.1 for this recording.';
  if(r.model!=='gpt-audio-1.5'||r.audioInputSubmitted!==true||r.audioInputMode!=='direct-audio-input-chunked')return 'The record does not prove direct GPT-Audio 1.5 audio input.';
  if(!/^[A-Za-z0-9]{22}$/.test(String(r.spotifyTrackId||'')))return 'Invalid Spotify track ID.';
  if(String(r.trackTitle||'').toLowerCase()!=='so what'||String(r.album||'').toLowerCase()!=='kind of blue'||String(r.recordingVersion||'')!=='Original 1959 studio recording')return 'This proof-of-concept only accepts the original studio So What recording from Kind of Blue.';
  if(r.recordingMatchConfirmed!==true)return 'The exact-recording confirmation is missing.';
  const duration=Number(r.durationMs);if(!Number.isFinite(duration)||duration<60000||duration>720000)return 'Model-analysis duration is invalid.';
  if(!r.sourceFile||!/^[a-f0-9]{64}$/i.test(String(r.sourceFile.sha256||'')))return 'The source audio file hash is missing or invalid.';
  if(!r.chunking||r.chunking.chunkSeconds!==30||r.chunking.overlapSeconds!==8||!Number.isInteger(r.chunking.count)||r.chunking.count<1||r.chunking.count>40||!Number.isInteger(r.chunking.detailPassCount)||r.chunking.detailPassCount!==r.chunking.count||!Number.isInteger(r.chunking.depthPassCount)||r.chunking.depthPassCount<0||r.chunking.depthPassCount>r.chunking.count)return 'Audio chunk provenance is invalid. Every window requires a detail pass; depth-pass count must be explicit.';
  if(!Array.isArray(r.events)||r.events.length>MAX_EVENTS)return 'Model moment collection is invalid.';
  if(r.engineVersion!=='2.1.0'||r.analysisStrategy!=='30s-overlapping-primary-plus-mandatory-detail-plus-adaptive-depth')return 'Audio Lab Engine 2.1 provenance is missing.';
  const gate=r.qualityGate,minimumMoments=Math.ceil((duration/1000)*4/60),observedRate=Number(r.events?.length)/(duration/60000);
  if(!gate||gate.minimumMoments!==minimumMoments||gate.minimumMomentsPerMinute!==4||gate.maximumSilentGapSeconds!==30||Number(gate.observedMomentsPerMinute)<4||Math.abs(Number(gate.observedMomentsPerMinute)-observedRate)>.15||!Number.isFinite(Number(gate.observedMaxSilentGapSeconds))||Number(gate.observedMaxSilentGapSeconds)>30||gate.uncoveredWindows!==0||r.events.length<minimumMoments)return 'Audio Lab density/continuity quality gate failed.';
  if(!Array.isArray(r.segmentSummaries)||r.segmentSummaries.length!==r.chunking.count)return 'Model listening-log summary collection is invalid or incomplete.';
  let summaryEnd=-1;for(const item of r.segmentSummaries){const start=Number(item.startSeconds),end=Number(item.endSeconds);if(!Number.isFinite(start)||!Number.isFinite(end)||start<0||end<=start||end>duration/1000+.5||start<summaryEnd||!richBilingual(item.summary,12,65))return 'Model listening-log summary data is invalid or too terse.';summaryEnd=start;}
  let previous=-1;
  for(const e of r.events){
   const start=Number(e.startSeconds),end=Number(e.endSeconds);if(!Number.isFinite(start)||!Number.isFinite(end)||start<0||end<=start||end>duration/1000+.5||start<previous)return 'Model moment timestamps are invalid or unsorted.';previous=start;
   if(!bilingual(e.title)||!richBilingual(e.whatHappens)||!richBilingual(e.listenFor)||!richBilingual(e.whyItMatters)||!richBilingual(e.audibleEvidence)||!richBilingual(e.question,4,18))return 'A model moment is missing substantive bilingual listening content.';
   const conf=Number(e.confidence),pc=Number(e.performerConfidence),tc=Number(e.timestampConfidence);if([conf,pc,tc].some(x=>!Number.isFinite(x)||x<0||x>1))return 'Model moment confidence is invalid.';
   if(!['primary','detail','depth'].includes(e.analysisPass)||!Number.isInteger(e.chunkIndex)||e.chunkIndex<0||e.chunkIndex>=r.chunking.count)return 'Model moment analysis-pass provenance is invalid.';
   if(e.performerName&&!ROSTER.includes(e.performerName))return 'A model moment attributes a performer outside the verified session roster.';
   if(e.performerName){const allowed={'Miles Davis':['trumpet'],'Julian “Cannonball” Adderley':['alto saxophone'],'Cannonball Adderley':['alto saxophone'],'John Coltrane':['tenor saxophone'],'Bill Evans':['piano'],'Paul Chambers':['bass','double bass'],'Jimmy Cobb':['drum kit','drums']};if(!allowed[e.performerName]?.includes(String(e.instrument||'').toLowerCase()))return 'A performer attribution conflicts with the instrument credited in the recording dossier.';}
  }
  const durationSeconds=duration/1000,step= r.chunking.chunkSeconds-r.chunking.overlapSeconds;
  const gaps=r.events.length?[r.events[0].startSeconds,...r.events.slice(1).map((e,i)=>Math.max(0,e.startSeconds-r.events[i].endSeconds)),Math.max(0,durationSeconds-r.events[r.events.length-1].endSeconds)]:[durationSeconds];
  const actualMaxGap=Math.max(...gaps);if(Math.abs(actualMaxGap-Number(r.qualityGate.observedMaxSilentGapSeconds))>.25)return 'Recorded silent-gap metric does not match the moment timeline.';
  for(let i=0;i<r.chunking.count;i++){const start=i*step,end=Math.min(durationSeconds,start+r.chunking.chunkSeconds);if(!r.events.some(e=>e.endSeconds>start&&e.startSeconds<end))return 'At least one audio-analysis window has no verified model moment.';}
  return null;
 }
 function validateDSPRecord(r){
  if(!r||r.schema!==DSP_SCHEMA||r.schemaVersion!==1)return 'Unsupported legacy analysis format.';
  if(!/^[A-Za-z0-9]{22}$/.test(String(r.spotifyTrackId||''))||r.recordingMatchConfirmed!==true)return 'Invalid legacy analysis identity.';
  const d=Number(r.durationMs);if(!Number.isFinite(d)||d<10000||d>720000)return 'Legacy analysis duration invalid.';
  if(!Array.isArray(r.events)||r.events.length<1||r.events.length>32)return 'Legacy event collection invalid.';
  let prev=0;for(const e of r.events){const t=Number(e.timeSeconds),s=Number(e.evidenceWindow?.start),n=Number(e.evidenceWindow?.end);if(!Number.isFinite(t)||t<=prev||t>=d/1000||!Number.isFinite(s)||!Number.isFinite(n)||s<0||n<=s||s>t||n<t||n>d/1000+.01)return 'Legacy event timestamp invalid.';prev=t;}return null;
 }
 function validateRecord(r){return r?.schema===MODEL_SCHEMA?validateModelRecord(r):validateDSPRecord(r)}
 function storeRecord(r){const error=validateRecord(r);if(error)throw new Error(error);const key=r.schema===MODEL_SCHEMA?MODEL_STORE_KEY:DSP_STORE_KEY,store=readStore(key);store.records[r.spotifyTrackId]=r;store.records=Object.fromEntries(Object.entries(store.records).sort((a,b)=>String(b[1]?.analysedAt||'').localeCompare(String(a[1]?.analysedAt||''))).slice(0,30));root.localStorage.setItem(key,JSON.stringify(store));return r}
 function getModelRecord(id){const r=readStore(MODEL_STORE_KEY).records[id];return r&&!validateModelRecord(r)?r:null}
 function getDSPRecord(id){const r=readStore(DSP_STORE_KEY).records[id];return r&&!validateDSPRecord(r)?r:null}
 function getRecord(id){if(!/^[A-Za-z0-9]{22}$/.test(String(id||'')))return null;return getModelRecord(id)||getDSPRecord(id)}
 function pair(en,pt){return{en,pt}}
 function mmss(s){s=Math.max(0,Math.floor(Number(s)||0));return Math.floor(s/60)+':'+String(s%60).padStart(2,'0')}
 function applyModelRecord(guide,track,record,spotifyDuration){
  if(!guide||(!guide.analysisOnly&&guide.trackSpecificGuide!==true)||!Array.isArray(guide.cues))return{applied:false,reason:'guide-not-analysis-shell'};
  if(guide.audioModelAnalysis?.recordId===record.recordId)return{applied:true,alreadyApplied:true,count:record.events.length};
  const cues=record.events.map((e,i)=>{
   const start=Number(e.startSeconds),end=Number(e.endSeconds),at=Math.max(0,Math.min(1,start*1000/spotifyDuration));
   const performer=e.performerName&&Number(e.performerConfidence)>=.78?e.performerName:null;
   const who=performer?`${performer} — ${e.instrument}`:e.instrument;
   const confidence=`${Math.round(Number(e.confidence)*100)}%`;
   const musician=pair(`${who}. The model self-reports ${Math.round(Number(e.performerConfidence)*100)}% attribution confidence; this estimate is not statistically calibrated.` ,`${who}. O modelo relata ${Math.round(Number(e.performerConfidence)*100)}% de confiança na atribuição; essa estimativa não é estatisticamente calibrada.`);
   return{at,title:e.title,focus:e.whatHappens,listenFor:e.listenFor,whyItMatters:e.whyItMatters,question:e.question,musicianMoment:musician,timeSeconds:start,endSeconds:end,eventKind:e.eventKind,instrument:e.instrument,performerName:performer,confidence:Number(e.confidence),timestampConfidence:Number(e.timestampConfidence),audibleEvidence:e.audibleEvidence,analysisEventId:`model-${i+1}`,analysisPass:e.analysisPass,chunkIndex:e.chunkIndex};
  });
  guide.cues=cues;guide.trackSpecificGuide=true;guide.analysisOnly=true;guide.guideKind='audio-model-performance-guide';guide.sourceStatus='direct-audio-model-analysis';guide.cueTimingBasis='audio-model-performance-moments';
  guide.title=pair('Audio analysis — So What','Análise de áudio — So What');
  guide.audioModelAnalysis={recordId:record.recordId,model:record.model,analysedAt:record.analysedAt,momentCount:cues.length,chunkCount:record.chunking.count,sourceFileSha256:record.sourceFile.sha256,spotifyTrackId:record.spotifyTrackId,durationMatchDifferenceMs:Math.round(spotifyDuration-record.durationMs),identityMatchMethod:'manual confirmation plus Spotify track ID and duration; not audio fingerprint verification'};
  guide.sources=[{label:'Miles Davis official discography — Kind of Blue session personnel',url:'https://www.milesdavis.com/news/kind-of-blue-by-miles-davis-1959-jazz-standard-celebrates-50-years/'}];
  return{applied:true,count:cues.length,recordId:record.recordId,model:record.model};
 }
 function applyLegacyDSP(guide,track,record,spotifyDuration){
  if(!guide||!(guide.trackSpecificGuide===true||guide.analysisOnly===true)||!Array.isArray(guide.cues))return{applied:false,reason:'guide-not-track-specific'};
  if(guide.audioAnalysis?.recordId===record.recordId)return{applied:true,alreadyApplied:true,count:record.events.length};
  const measured=record.events.map((e,i)=>{const time=Number(e.timeSeconds),n=i+1;return{at:Math.max(0,Math.min(1,time*1000/spotifyDuration)),title:pair(`Audio analysis candidate ${String(n).padStart(2,'0')} — ${e.title||'Measured signal change'}`,`Candidato de análise ${String(n).padStart(2,'0')} — ${e.title||'Mudança mensurada no sinal'}`),focus:pair(`Local DSP found a measurable signal change near ${mmss(time)}. This is not an identified musical event.`,`O DSP local encontrou uma mudança mensurável no sinal perto de ${mmss(time)}. Isso não identifica um evento musical.`),listenFor:pair(String(e.observation||'Compare the audio before and after this point.'),String(e.observation||'Compare o áudio antes e depois deste ponto.')),whyItMatters:pair('This is a signal-change marker only. It does not establish musical meaning.','Este é apenas um marcador de mudança de sinal. Não estabelece significado musical.'),question:pair('What changed in the sound here?','O que mudou no som neste ponto?'),timeSeconds:time,evidenceWindow:e.evidenceWindow,audioAnalysisCandidate:true};});
  guide.audioAnalysis={recordId:record.recordId,candidateCount:measured.length,status:'candidate-only'};guide.sourceStatus='local-audio-analysis';
  if(guide.cueTimingBasis==='untimed-landmarks'){
   guide.audioAnalysisCandidates=measured.map((cue,i)=>({timeSeconds:cue.timeSeconds,title:cue.title,listenFor:cue.listenFor,whyItMatters:cue.whyItMatters,evidenceWindow:cue.evidenceWindow,audioAnalysisCandidate:true,id:`dsp-${i+1}`}));
   return{applied:true,separateLane:true,count:measured.length};
  }
  const hadEditorialCues=guide.cues.length>0;
  guide.cues=guide.cues.concat(measured).sort((a,b)=>Number(a.at)-Number(b.at));guide.trackSpecificGuide=true;guide.guideKind=hadEditorialCues?'audio-analysis-hybrid':'audio-analysis-only';guide.cueTimingBasis=hadEditorialCues?'audio-analysis-hybrid':'audio-analysis-only';return{applied:true,count:measured.length};
 }
 function applyToGuide(guide,track){
  const id=String(track?.spotifyTrackId||track?.id||'');if(!/^[A-Za-z0-9]{22}$/.test(id))return{applied:false,reason:'invalid-track-id'};
  const modelRecord=getModelRecord(id),dspRecord=getDSPRecord(id),record=modelRecord||dspRecord;if(!record)return{applied:false,reason:'no-matching-record'};
  const spotifyDuration=Number(track?.duration_ms||track?.durationMs);if(!Number.isFinite(spotifyDuration)||spotifyDuration<=0||Math.abs(spotifyDuration-Number(record.durationMs))>DURATION_TOLERANCE_MS)return{applied:false,reason:'duration-mismatch'};
  if(modelRecord){const currentTitle=String(track?.title||track?.name||'').toLowerCase(),currentAlbum=String(track?.album||track?.albumName||'').toLowerCase(),currentArtists=Array.isArray(track?.artists)?track.artists.join(', ').toLowerCase():String(track?.artist||'').toLowerCase();if(currentTitle!=='so what'||!currentAlbum.includes('kind of blue')||!currentArtists.includes('miles davis'))return{applied:false,reason:'current-track-identity-mismatch'};return applyModelRecord(guide,track,modelRecord,spotifyDuration);}
  // The So What experiment deliberately rejects old DSP-only markers as musical content.
  const isSoWhat=String(track?.title||track?.name||'').toLowerCase()==='so what'&&String(track?.album||track?.albumName||'').toLowerCase().includes('kind of blue');
  if(isSoWhat)return{applied:false,reason:'model-analysis-required-for-so-what'};
  return applyLegacyDSP(guide,track,dspRecord,spotifyDuration);
 }
 function initImportControl(){const meta=root.document?.getElementById('dynamicListeningMeta');if(!meta||root.document.getElementById('sonicAudioAnalysisImport'))return;const panel=root.document.createElement('div');panel.id='sonicAudioAnalysisImport';panel.style.cssText='display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin:8px 0 10px;padding:9px 10px;border:1px solid #454b57;border-radius:10px;background:#171b22';const button=root.document.createElement('button');button.type='button';button.className='btn secondary';button.textContent='Import Audio Lab JSON';const input=root.document.createElement('input');input.type='file';input.accept='application/json,.json';input.hidden=true;const status=root.document.createElement('span');status.className='fine';status.textContent='Import a direct GPT-Audio 1.5 So What record, or a legacy DSP record for other tracks.';button.addEventListener('click',()=>input.click());input.addEventListener('change',async()=>{const file=input.files?.[0];if(!file)return;try{if(file.size>3*1024*1024)throw new Error('Analysis JSON exceeds 3 MB.');const r=JSON.parse(await file.text());storeRecord(r);status.textContent='Imported. Reloading to match the Spotify-confirmed track…';root.setTimeout(()=>root.location.reload(),500)}catch(e){status.textContent='Import failed: '+(e.message||String(e))}finally{input.value=''}});panel.append(button,input,status);meta.insertAdjacentElement('afterend',panel)}
 const original=root.buildSonicMockGuide;if(typeof original==='function')root.buildSonicMockGuide=function(payload){const result=original.apply(this,arguments);if(result?.guide)applyToGuide(result.guide,payload?.track);return result};
 root.SonicAudioAnalysisBridge=Object.freeze({version:'2.1.0',storeKey:MODEL_STORE_KEY,validateRecord,storeRecord,getRecord,applyToGuide});
 if(root.document){if(root.document.readyState==='loading')root.document.addEventListener('DOMContentLoaded',initImportControl,{once:true});else initImportControl()}
})(window);
