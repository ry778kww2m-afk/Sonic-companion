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
 segmentSummary:bilingual('A short model-only audio summary.','Um breve resumo de áudio gerado apenas pelo modelo.'),
 segmentMemory:'Model-only continuity memory.',
 uncertainties:[],
 events:[{
  startSeconds:3.1,endSeconds:9.6,performerName:'Miles Davis',instrument:'trumpet',role:'lead',eventKind:'phrase',
  confidence:.81,performerConfidence:.82,timestampConfidence:.77,
  title:bilingual('Model test phrase','Frase de teste do modelo'),
  whatHappens:bilingual('Model test description.','Descrição de teste do modelo.'),
  listenFor:bilingual('Model test listening detail.','Detalhe de escuta do teste.'),
  whyItMatters:bilingual('Model test significance.','Significado de teste do modelo.'),
  audibleEvidence:bilingual('Model test audible evidence.','Evidência audível de teste do modelo.'),
  question:bilingual('Model test question?','Pergunta de teste do modelo?')
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
  model:'gpt-audio-1.5',
  track:{title:'So What',artist:'Miles Davis',album:'Kind of Blue',recordingVersion:'Original 1959 studio recording'},
  clip:{startSeconds:0,durationSeconds:20,index:0,total:1},
  audio:{format:'wav',base64:'A'.repeat(1200)},
  previousSegmentMemory:''
 };
 const allowedRequest=new Request('https://worker.example/api/audio-analysis/chunk',{method:'POST',headers:{Origin:'https://app.example','Content-Type':'application/json','Authorization':'Bearer '+testerToken},body:JSON.stringify(body)});
 const ok=await worker.fetch(allowedRequest,{OPENAI_API_KEY:'test-secret',ALLOWED_ORIGIN:'https://app.example',AUDIO_LAB_TOKEN:testerToken});
 assert.equal(ok.status,200);
 const response=await ok.json();
 assert.equal(response.model,'gpt-audio-1.5');
 assert.equal(response.audioInputReceived,true);
 assert.equal(response.analysis.events.length,1);
 assert.equal(response.analysis.events[0].performerName,'Miles Davis');
 assert.equal(upstreamCalls,1);
 assert.equal(capturedRequest.model,'gpt-audio-1.5');
 assert.deepEqual(capturedRequest.modalities,['text']);
 assert.equal(capturedRequest.store,false);
 assert.equal(capturedRequest.max_completion_tokens,6000,'rich bilingual model output receives a sufficient response budget');
 const parts=capturedRequest.messages[0].content;
 assert.equal(parts.find(x=>x.type==='input_audio')?.input_audio?.data,body.audio.base64,'actual encoded audio is present in the upstream model request');
 assert.match(parts.find(x=>x.type==='text')?.text||'',/LISTEN TO THE ATTACHED AUDIO BYTES/);
 const originalAnalysis=modelOutput.events[0];
 modelOutput.events[0]={...originalAnalysis,performerName:'Miles Davis',instrument:'piano',performerConfidence:.99};
 const mismatch=await worker.fetch(new Request('https://worker.example/api/audio-analysis/chunk',{method:'POST',headers:{Origin:'https://app.example','Content-Type':'application/json','Authorization':'Bearer '+testerToken},body:JSON.stringify(body)}),{OPENAI_API_KEY:'test-secret',ALLOWED_ORIGIN:'https://app.example',AUDIO_LAB_TOKEN:testerToken});
 const mismatchJson=await mismatch.json();
 assert.equal(mismatch.status,200);
 assert.equal(mismatchJson.analysis.events[0].performerName,null,'a roster name cannot be attached to an incompatible instrument');
 assert.equal(upstreamCalls,2);
 modelOutput.events[0]=originalAnalysis;


 const blocked=await worker.fetch(new Request('https://worker.example/api/audio-analysis/chunk',{method:'POST',headers:{Origin:'https://attacker.example','Content-Type':'application/json','Authorization':'Bearer '+testerToken},body:JSON.stringify(body)}),{OPENAI_API_KEY:'test-secret',ALLOWED_ORIGIN:'https://app.example',AUDIO_LAB_TOKEN:testerToken});
 assert.equal(blocked.status,403,'origin guard runs before model route');
 assert.equal(upstreamCalls,2,'blocked origin cannot incur an OpenAI call');

 const noKey=await worker.fetch(new Request('https://worker.example/api/audio-analysis/chunk',{method:'POST',headers:{Origin:'https://app.example','Content-Type':'application/json','Authorization':'Bearer '+testerToken},body:JSON.stringify(body)}),{ALLOWED_ORIGIN:'https://app.example',AUDIO_LAB_TOKEN:testerToken});
 assert.equal(noKey.status,503,'missing OpenAI key fails closed after access checks');

 const badToken=await worker.fetch(new Request('https://worker.example/api/audio-analysis/chunk',{method:'POST',headers:{Origin:'https://app.example','Content-Type':'application/json','Authorization':'Bearer wrong-token'},body:JSON.stringify(body)}),{OPENAI_API_KEY:'test-secret',ALLOWED_ORIGIN:'https://app.example',AUDIO_LAB_TOKEN:testerToken});
 assert.equal(badToken.status,401,'invalid tester token fails closed');
 assert.equal(upstreamCalls,2,'invalid tester token cannot incur an OpenAI call');

 const wrongTrack={...body,track:{...body.track,title:'Freddie Freeloader'}};
 const wrong=await worker.fetch(new Request('https://worker.example/api/audio-analysis/chunk',{method:'POST',headers:{Origin:'https://app.example','Content-Type':'application/json','Authorization':'Bearer '+testerToken},body:JSON.stringify(wrongTrack)}),{OPENAI_API_KEY:'test-secret',ALLOWED_ORIGIN:'https://app.example',AUDIO_LAB_TOKEN:testerToken});
 assert.equal(wrong.status,400,'Worker is restricted to the one-recording proof of concept');
 assert.equal(upstreamCalls,2,'wrong recording cannot incur an OpenAI call');
 console.log('PASS: Worker audio endpoint sends actual input_audio to GPT-Audio 1.5, validates response, enforces origin, tester-token and OpenAI-key guards, and rejects non-So-What tracks. Mocked response is test-only, never used by the app.');
} finally {
 globalThis.fetch=originalFetch;
}
