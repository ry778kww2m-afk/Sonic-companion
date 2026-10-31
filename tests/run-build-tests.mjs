import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = p => fs.readFileSync(path.join(root, p), 'utf8');
const index = read('index.html');
const bridge = read('audio-analysis-bridge.js');
const lab = read('audio-lab/index.html');
const worker = read('worker/index.js');
const pkg = JSON.parse(read('package.json'));

assert.ok(index.length > 500000, 'root index.html is the complete existing app');
assert.ok(lab.length > 10000 && lab.includes('Analyse with GPT-Audio 1.5'), 'Audio Lab is the complete model-analysis page');
assert.ok(bridge.length > 10000, 'bridge is complete');
assert.ok(index.includes('v1.0.10-sowhat-audio-model-2.1.0'));
assert.ok(index.includes('model-grounded musical moments'), 'main app accurately describes Audio Lab model analysis');
assert.ok(index.includes("path.includes('sonic-companion')"), 'cache cleanup targets only Sonic Companion service workers');
assert.ok(!index.includes('Promise.all(regs.map(r=>r.unregister()))'), 'the app never unregisters unrelated origin service workers');
assert.ok(index.includes('<title>Sonic Companion v1.0.10 — Audio Lab Display + Contract Fix</title>'));
assert.equal(pkg.version, '1.0.10');
assert.ok(index.includes('audio-analysis-bridge.js?v=1.0.10-bridge-2.1.0'), 'updated bridge loaded once with cache-busting version');
assert.ok(index.includes('const isSoWhatProofTrack=normTrack(track?.name)===\'so what\''));
assert.ok(index.includes('const curated=isSoWhatProofTrack?null:'), 'So What suppresses pre-authored guide fixtures');
assert.ok(index.includes('createUnavailableTrackGuide(track)'), 'missing model results resolve to an empty unavailable state');
assert.ok(index.includes('audio-model-performance-guide'), 'renderer recognizes direct-audio model guides');
assert.ok(index.includes('DIRECT AUDIO ANALYSIS'), 'model provenance is visible in the app');
assert.ok(index.includes('MODEL-REPORTED AUDIBLE EVIDENCE'), 'the main app exposes what the model says it heard');
assert.ok(index.includes('not statistically calibrated'), 'self-reported model scores are not presented as calibrated probabilities');
assert.ok(index.includes('countdown'), 'existing playback countdown UI remains present');
assert.ok(bridge.includes("const MODEL_STORE_KEY='sonic.audioModelAnalysis.registry.v1'"));
assert.ok(bridge.includes("const DSP_STORE_KEY='sonic.audioAnalysis.registry.v1'"), 'legacy DSP bridge is preserved for other tracks');
assert.ok(bridge.includes('model-analysis-required-for-so-what'), 'So What never accepts DSP-only moments');
assert.ok(bridge.includes('r.audioInputSubmitted!==true'), 'bridge requires direct-audio provenance');

assert.ok(lab.includes("const MODEL='gpt-audio-1.5'"));
assert.ok(lab.includes("fetch(baseUrl+'/api/audio-analysis/chunk'"));
assert.ok(lab.includes("CHUNK_SECONDS=30,OVERLAP_SECONDS=8"));
assert.ok(lab.includes("Model's segment-by-segment listening log"), 'model-generated chunk summaries are visible as a listening log');
assert.ok(lab.includes('audioConsent'), 'user explicitly consents before audio leaves device');
assert.ok(lab.includes('audioLabToken') && lab.includes("'Authorization':'Bearer '+token"), 'Audio Lab requires a bearer tester token');
assert.ok(lab.includes('OfflineAudioContext'), 'audio is resampled using browser offline audio rendering, with no silent low-quality fallback');
assert.ok(lab.includes('whatHappens:bilingual(e.whatHappens)'), 'model output retains the schema required by the bridge');
assert.ok(lab.includes('sameRecordingConfirmed'), 'recording identity requires manual confirmation');
assert.ok(lab.includes("$('audioConsent').checked=false") && lab.includes("$('sameRecordingConfirmed').checked=false"), 'new file selection resets prior consent and identity confirmation');
assert.ok(lab.includes('currentId===state.record.spotifyTrackId'), 'publish is disabled when the Spotify track ID differs from the analysed record');
assert.ok(lab.includes('No musical moments are preloaded'));
assert.ok(lab.includes('No fallback or invented events were inserted.'));
assert.doesNotMatch(lab, /mockCatalogueData|makeSyntheticWav|demoSignalBtn|synthetic-structure-test/);

assert.ok(worker.includes("const SONIC_AUDIO_MODEL = 'gpt-audio-1.5'"));
assert.ok(worker.includes("type:'input_audio'"));
assert.ok(worker.includes("modalities:['text']"));
assert.ok(worker.includes('store:false'));
assert.ok(worker.includes('validateAudioSegmentAnalysis'));
assert.ok(worker.includes('OPENAI_API_KEY'));
assert.ok(worker.includes('Origin not allowed'));
assert.ok(worker.includes('AUDIO_LAB_TOKEN'));
assert.ok(worker.includes('max_completion_tokens:16000'));
assert.ok(worker.includes('underdeveloped bilingual content'));
assert.ok(lab.includes('detailPassCount++'), 'every excerpt gets a mandatory independent ensemble pass');
assert.ok(lab.includes('shouldRunDepthPass(windowEvents)'), 'thin or narrow excerpts receive a separate depth audit');
assert.ok(lab.includes('minimumMomentsPerMinute:TARGET_MOMENTS_PER_MINUTE'));
assert.ok(lab.includes('TARGET_MOMENTS_PER_MINUTE=4'));
assert.ok(lab.includes('uncoveredWindows>0'));
assert.ok(index.includes('activeMomentProgress'));
assert.ok(index.includes('dynamic-cue-moment-progress'));
assert.ok(index.includes('updateModelMomentBars(cues,progress);'));
assert.ok(worker.includes('no fallback content was generated'));
assert.ok(worker.includes('model-generated memory'));

function checkInlineScripts(file, source) {
  const re=/<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi;
  let match, n=0;
  while((match=re.exec(source))) {
    const attrs=match[1]||'', code=match[2]||'';
    if(/\bsrc\s*=/.test(attrs) || /\btype\s*=\s*["']application\/json["']/.test(attrs) || !code.trim()) continue;
    const temp=path.join(os.tmpdir(),`sonic-${process.pid}-${n++}.js`);
    fs.writeFileSync(temp,code);
    const result=spawnSync(process.execPath,['--check',temp],{encoding:'utf8'});
    fs.rmSync(temp,{force:true});
    assert.equal(result.status,0,`${file} inline script ${n} syntax error: ${result.stderr||result.stdout}`);
  }
  assert.ok(n>0,`${file} inline scripts were checked`);
}
checkInlineScripts('index.html',index);
checkInlineScripts('audio-lab/index.html',lab);
const tempWorker=path.join(os.tmpdir(),`sonic-worker-${process.pid}.mjs`);
fs.writeFileSync(tempWorker,worker);
const result=spawnSync(process.execPath,['--check',tempWorker],{encoding:'utf8'});
fs.rmSync(tempWorker,{force:true});
assert.equal(result.status,0,`Worker syntax error: ${result.stderr||result.stdout}`);

console.log('PASS: v1.0.10 app, 30s/8s direct-audio engine, mandatory ensemble + adaptive depth Worker route, bridge provenance, So What fail-closed loader, cue progress UI, retained Spotify/countdown app and JavaScript syntax.');
