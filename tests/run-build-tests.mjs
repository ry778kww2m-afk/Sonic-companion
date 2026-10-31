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
const pkg = JSON.parse(read('package.json'));
assert.ok(index.length > 500000, 'root index.html must be the complete app, not a patch');
assert.ok(lab.length > 500000, 'Audio Lab index.html must be complete');
assert.ok(bridge.length > 10000, 'bridge must be complete');
assert.ok(index.includes('SONIC COMPANION v1.0.2 · MIE 1.3 · AUDIO LAB BRIDGE 1.0.1 · BUILD 2026-10-31'));
assert.ok(index.includes('v1.0.2-mie-1.3-audio-analysis-bridge-1.0.1'));
assert.ok(index.includes('<title>Sonic Companion v1.0.2 — Audio Lab Integration</title>'));
assert.equal(pkg.version,'1.0.2','package metadata follows prototype version scheme');
for (const stale of ['v2.7','v2.3','v2.0']) assert.equal(index.includes(stale),false,`stale product version ${stale} remains`);
assert.equal((index.match(/audio-analysis-bridge\.js\?v=1\.0\.1/g)||[]).length,1,'bridge loads once with cache-busting version');
assert.ok(index.includes('if(result?.guide)window.SonicAudioAnalysisBridge?.applyToGuide(result.guide,body.track);'),'curated Rachmaninoff guide path is bridged');
assert.ok(index.includes('window.buildSonicMockGuide = buildMockGuide;'),'original guide builder remains');
assert.ok(index.includes("const SPOTIFY_CLIENT_ID='1693d995bc7941e38bb7a8fd15475321'"),'Spotify client ID retained');
assert.ok(index.includes("const SCOPES='user-read-playback-state user-read-currently-playing user-modify-playback-state'"),'Spotify scopes retained');
assert.ok(index.includes('function autoFollowPlayback(data,sampledAt=performance.now())'),'Spotify playback tracking retained');
assert.ok(lab.includes("const SONIC_ANALYSIS_STORE_KEY='sonic.audioAnalysis.registry.v1'"),'Audio Lab writes expected storage key');
assert.ok(bridge.includes("const STORE_KEY = 'sonic.audioAnalysis.registry.v1'"),'bridge reads same storage key');
assert.ok(lab.includes('publishAnalysisBtn'),'Audio Lab publish UI exists');
assert.ok(lab.includes('recordingMatchConfirmed:true'),'Audio Lab record carries exact-recording confirmation');
assert.ok(lab.includes('The synthetic test signal cannot be published'),'synthetic signal publication is blocked');
assert.equal(pkg.scripts.test,'node tests/run-build-tests.mjs && node tests/run-integration-tests.mjs');

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
const jsonMatch=lab.match(/<script\s+id=["']mockCatalogueData["']\s+type=["']application\/json["']>([\s\S]*?)<\/script>/i);
assert.ok(jsonMatch,'embedded mock catalogue exists');
const catalogue=JSON.parse(jsonMatch[1]);
assert.ok(Array.isArray(catalogue)&&catalogue.length>=5,'embedded catalogue parses and has expected coverage');
console.log('PASS: complete app/lab files, version banner, Spotify safeguards, bridge hooks, Audio Lab publisher contract, embedded catalogue and inline JavaScript syntax.');
