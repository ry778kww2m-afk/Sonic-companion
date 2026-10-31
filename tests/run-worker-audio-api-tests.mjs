import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const source=fs.readFileSync(path.join(root,'worker','index.js'),'utf8');
const mod=await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));
const worker=mod.default;
const originalFetch=globalThis.fetch;
let upstreamCalls=0, capturedRequest=null;
const testerToken='test-audio-lab-token-0123456789abcdef0123456789abcdef';
const bilingual=(en,pt)=>({en,pt});
const modelOutput={
 segmentSummary:bilingual('The excerpt presents a trumpet-led phrase, followed by a brief pause and an ensemble response.','O trecho apresenta uma frase conduzida pelo trompete, seguida por uma breve pausa e uma resposta do conjunto.'),
 segmentMemory:'Model-only continuity memory.',
 uncertainties:[],
 events:[{
  startSeconds:3.1,endSeconds:9.6,performerName:'Miles Davis',instrument:'trumpet',role:'lead',eventKind:'phrase',
  confidence:.81,performerConfidence:.82,timestampConfidence:.77,
  title:bilingual('A trumpet phrase turns downward and leaves a deliberate gap','Uma frase de trompete desce e deixa uma pausa deliberada'),
  whatHappens:bilingual('The trumpet shapes a compact descending phrase, then releases the line and leaves space before the next ensemble response.','O trompete desenha uma frase descendente e compacta, depois encerra a linha e deixa espaço antes da próxima resposta do conjunto.'),
  listenFor:bilingual('Listen to the downward contour and the small pocket of silence that follows it before the ensemble settles back into the pulse.','Ouça o contorno descendente e o pequeno espaço de silêncio que vem depois, antes de o conjunto voltar ao pulso.'),
  whyItMatters:bilingual('The pause makes the phrase feel conversational: the lead voice states an idea, then gives the ensemble room to answer.','A pausa dá à frase um caráter conversacional: a voz principal apresenta uma ideia e abre espaço para a resposta do conjunto.'),
  audibleEvidence:bilingual('A focused trumpet line is clearly foregrounded, with a descending ending and a short reduction in activity immediately afterward.','Uma linha de trompete em primeiro plano é claramente audível, termina em movimento descendente e deixa uma breve redução de atividade logo depois.'),
  question:bilingual('How does the brief pause change your sense of the trumpet phrase?','Como a breve pausa muda sua percepção da frase do trompete?')
 }]
};
try {
 globalThis.fetch=async(url,options={})=>{
  assert.equal(String(url),'https://api.openai.com/v1/chat/completions');
  upstreamCalls++;
  capturedRequest=JSON.parse(options.body);
  return new Response(JSON.stringify({choices:[{message:{content:JSON.stringify(modelOutput)}}]}),{status:200,headers:{'Content-Type':'application/json'}});
 };
 const body={
  model:'gpt-audio-1.5',engineVersion:'2.1.0',
  track:{title:'So What',artist:'Miles Davis',album:'Kind of Blue',recordingVersion:'Original 1959 studio recording'},
  clip:{startSeconds:0,durationSeconds:20,index:0,total:1,analysisEngineVersion:'2.1.0'},
  audio:{format:'wav',base64:'A'.repeat(1200)},
  previousSegmentMemory:''
 };
 const allowedRequest=new Request('https://worker.example/api/audio-analysis/chunk',{method:'POST',headers:{Origin:'https://app.example','Content-Type':'application/json','Authorization':'Bearer '+testerToken},body:JSON.stringify(body)});
 const ok=await worker.fetch(allowedRequest,{OPENAI_API_KEY:'test-secret',ALLOWED_ORIGIN:'https://app.example',AUDIO_LAB_TOKEN:testerToken});
 assert.equal(ok.status,200);
 const response=await ok.json();
 assert.equal(response.model,'gpt-audio-1.5');
 assert.equal(response.audioLabEngineVersion,'2.1.0');
 assert.equal(response.audioInputReceived,true);
 assert.equal(response.analysisPass,'primary');
 assert.equal(response.analysis.events.length,1);
 assert.equal(response.analysis.events[0].performerName,'Miles Davis');
 assert.equal(upstreamCalls,1);
 assert.equal(capturedRequest.model,'gpt-audio-1.5');
 assert.deepEqual(capturedRequest.modalities,['text']);
 assert.equal(capturedRequest.store,false);
 assert.equal(capturedRequest.max_completion_tokens,16000,'rich bilingual model output receives a sufficient response budget');
 const parts=capturedRequest.messages[0].content;
 assert.equal(parts.find(x=>x.type==='input_audio')?.input_audio?.data,body.audio.base64,'actual encoded audio is present in the upstream model request');
 assert.match(parts.find(x=>x.type==='text')?.text||'',/LISTEN TO THE ATTACHED AUDIO BYTES/);
 assert.match(parts.find(x=>x.type==='text')?.text||'',/normally identify 2–5 separate moments/);
 assert.match(parts.find(x=>x.type==='text')?.text||'',/substantive prose in both languages/);
 const detailBody={...body,clip:{...body.clip,analysisPass:'detail'}};
 const detailResponse=await worker.fetch(new Request('https://worker.example/api/audio-analysis/chunk',{method:'POST',headers:{Origin:'https://app.example','Content-Type':'application/json','Authorization':'Bearer '+testerToken},body:JSON.stringify(detailBody)}),{OPENAI_API_KEY:'test-secret',ALLOWED_ORIGIN:'https://app.example',AUDIO_LAB_TOKEN:testerToken});
 assert.equal(detailResponse.status,200);
 const detailJson=await detailResponse.json();
 assert.equal(detailJson.analysisPass,'detail');
 assert.match(capturedRequest.messages[0].content[0].text,/DETAIL PASS:/);
 assert.equal(capturedRequest.max_completion_tokens,16000);
 const depthBody={...body,clip:{...body.clip,analysisPass:'depth'}};
 const depthResponse=await worker.fetch(new Request('https://worker.example/api/audio-analysis/chunk',{method:'POST',headers:{Origin:'https://app.example','Content-Type':'application/json','Authorization':'Bearer '+testerToken},body:JSON.stringify(depthBody)}),{OPENAI_API_KEY:'test-secret',ALLOWED_ORIGIN:'https://app.example',AUDIO_LAB_TOKEN:testerToken});
 assert.equal(depthResponse.status,200);
 assert.equal((await depthResponse.json()).analysisPass,'depth');
 assert.match(capturedRequest.messages[0].content[0].text,/DEPTH PASS:/);
 const health=await worker.fetch(new Request('https://worker.example/health',{headers:{Origin:'https://app.example'}}),{OPENAI_API_KEY:'test-secret',ALLOWED_ORIGIN:'https://app.example',AUDIO_LAB_TOKEN:testerToken});
 const healthJson=await health.json();assert.equal(healthJson.audioLabEngineVersion,'2.1.0');assert.equal(healthJson.mandatoryDetailPass,true);
 const originalAnalysis=structuredClone(modelOutput.events[0]);
 modelOutput.events[0]={...originalAnalysis,whyItMatters:bilingual('Too short.','Muito curto.')};
 const thinText=await worker.fetch(new Request('https://worker.example/api/audio-analysis/chunk',{method:'POST',headers:{Origin:'https://app.example','Content-Type':'application/json','Authorization':'Bearer '+testerToken},body:JSON.stringify(body)}),{OPENAI_API_KEY:'test-secret',ALLOWED_ORIGIN:'https://app.example',AUDIO_LAB_TOKEN:testerToken});
 assert.equal(thinText.status,502,'underdeveloped moment explanations fail closed');
 modelOutput.events=Array.from({length:7},(_,i)=>({...originalAnalysis,startSeconds:i,endSeconds:i+2}));
 const overCap=await worker.fetch(new Request('https://worker.example/api/audio-analysis/chunk',{method:'POST',headers:{Origin:'https://app.example','Content-Type':'application/json','Authorization':'Bearer '+testerToken},body:JSON.stringify(body)}),{OPENAI_API_KEY:'test-secret',ALLOWED_ORIGIN:'https://app.example',AUDIO_LAB_TOKEN:testerToken});
 assert.equal(overCap.status,502,'more than six model events in one excerpt are rejected rather than silently truncated');
 modelOutput.events=[originalAnalysis];
 modelOutput.events[0]={...originalAnalysis,performerName:'Miles Davis',instrument:'piano',performerConfidence:.99};
 const mismatch=await worker.fetch(new Request('https://worker.example/api/audio-analysis/chunk',{method:'POST',headers:{Origin:'https://app.example','Content-Type':'application/json','Authorization':'Bearer '+testerToken},body:JSON.stringify(body)}),{OPENAI_API_KEY:'test-secret',ALLOWED_ORIGIN:'https://app.example',AUDIO_LAB_TOKEN:testerToken});
 const mismatchJson=await mismatch.json();
 assert.equal(mismatch.status,200);
 assert.equal(mismatchJson.analysis.events[0].performerName,null,'a roster name cannot be attached to an incompatible instrument');
 assert.equal(upstreamCalls,6);
 modelOutput.events[0]=originalAnalysis;


 const blocked=await worker.fetch(new Request('https://worker.example/api/audio-analysis/chunk',{method:'POST',headers:{Origin:'https://attacker.example','Content-Type':'application/json','Authorization':'Bearer '+testerToken},body:JSON.stringify(body)}),{OPENAI_API_KEY:'test-secret',ALLOWED_ORIGIN:'https://app.example',AUDIO_LAB_TOKEN:testerToken});
 assert.equal(blocked.status,403,'origin guard runs before model route');
 assert.equal(upstreamCalls,6,'blocked origin cannot incur an OpenAI call');

 const noKey=await worker.fetch(new Request('https://worker.example/api/audio-analysis/chunk',{method:'POST',headers:{Origin:'https://app.example','Content-Type':'application/json','Authorization':'Bearer '+testerToken},body:JSON.stringify(body)}),{ALLOWED_ORIGIN:'https://app.example',AUDIO_LAB_TOKEN:testerToken});
 assert.equal(noKey.status,503,'missing OpenAI key fails closed after access checks');

 const badToken=await worker.fetch(new Request('https://worker.example/api/audio-analysis/chunk',{method:'POST',headers:{Origin:'https://app.example','Content-Type':'application/json','Authorization':'Bearer wrong-token'},body:JSON.stringify(body)}),{OPENAI_API_KEY:'test-secret',ALLOWED_ORIGIN:'https://app.example',AUDIO_LAB_TOKEN:testerToken});
 assert.equal(badToken.status,401,'invalid tester token fails closed');
 assert.equal(upstreamCalls,6,'invalid tester token cannot incur an OpenAI call');

 const wrongTrack={...body,track:{...body.track,title:'Freddie Freeloader'}};
 const wrong=await worker.fetch(new Request('https://worker.example/api/audio-analysis/chunk',{method:'POST',headers:{Origin:'https://app.example','Content-Type':'application/json','Authorization':'Bearer '+testerToken},body:JSON.stringify(wrongTrack)}),{OPENAI_API_KEY:'test-secret',ALLOWED_ORIGIN:'https://app.example',AUDIO_LAB_TOKEN:testerToken});
 assert.equal(wrong.status,400,'Worker is restricted to the one-recording proof of concept');
 assert.equal(upstreamCalls,6,'wrong recording cannot incur an OpenAI call');
 console.log('PASS: Worker audio endpoint sends actual input_audio to GPT-Audio 1.5, enforces event caps and substantive bilingual content, validates analysis-pass identity, and enforces origin, tester-token, OpenAI-key and recording guards. Mocked response is test-only, never used by the app.');
} finally {
 globalThis.fetch=originalFetch;
}
