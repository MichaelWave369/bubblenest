import test from"node:test";
import assert from"node:assert/strict";
import{webcrypto}from"node:crypto";
import{buildReproductionDossier}from"./reproductionDossier.js";
import{fingerprintDossier}from"./dossierFingerprint.js";
import{createEvidenceCapsule,validateCapsuleEnvelope,parseCapsuleFile,verifyEvidenceCapsule,
 sameCapsuleChain,capsuleAnchorComparison,capsuleDownloadName,CAPSULE_KIND,CAPSULE_VERSION,
 CAPSULE_POLICY,CAPSULE_MAX_FILE_BYTES}from"./evidenceCapsule.js";
const u=n=>"https://github.com/MichaelWave369/bubblenest/issues/"+n;
const bubbles=[{id:"issue-10",title:"Original A",author:"alice",url:u(10)},
 {id:"issue-12",title:"Original B",author:"bob",url:u(12)}];
const proposal={issueNumber:40,url:u(40),aNumber:10,bNumber:12,mode:"Joint experiment"};
const charter={issueNumber:45,url:u(45),fusionNumber:40,aNumber:10,bNumber:12,phase:"DRAFT_FOR_PUBLIC_REVIEW_NOT_AUTHORIZED"};
const trial={issueNumber:80,url:u(80),fusionNumber:40,charterNumber:45,aNumber:10,bNumber:12,
 kind:"Attempt report",author:"originalauthor",finding:"Inconclusive",observations:"Original value 12.0",controls:"Baseline A"};
const artifact={issueNumber:100,url:u(100),trialNumber:80,charterNumber:45,fusionNumber:40,
 aNumber:10,bNumber:12,kind:"Dataset",name:"result.csv",version:"v1",digest:"a".repeat(64),
 fileBytes:"42",artifactURL:"https://example.org/results"};
const reference=buildReproductionDossier({trial,charter,proposal,bubbles,artifacts:[artifact],
 feedStatus:"ready",generatedAt:"2026-10-09T22:00:00.000Z"});
const at="2026-10-09T22:15:00.000Z";
const make=d=>createEvidenceCapsule(d,{subtle:webcrypto.subtle,createdAt:at});
const clone=x=>JSON.parse(JSON.stringify(x));
test("capsule v2.0 carries actual complete dossier, canonical SHA-256 and uncertainty labels",async()=>{
 const c=await make(reference);
 assert.equal(c.kind,CAPSULE_KIND);assert.equal(c.schema_version,CAPSULE_VERSION);
 assert.equal(c.policy,CAPSULE_POLICY);
 assert.deepEqual(c.dossier,reference);
 assert.equal(c.created_at,at);
 assert.equal(c.signed,false);assert.equal(c.science_verified,false);
 assert.equal(c.source_authenticated,false);assert.equal(c.execution_authorized,false);
 assert.equal(c.coverage,"PARTIAL_OR_UNKNOWN");
 assert.equal(c.fingerprint.digest,(await fingerprintDossier(reference,webcrypto.subtle)).digest);
 assert.equal(c.fingerprint.algorithm,"SHA-256");
 assert.equal(c.fingerprint.canonicalization,"BUBBLENEST_JSON_RECURSIVE_SORTED_KEYS_V1");
 assert.equal(validateCapsuleEnvelope(c).ok,true);
 assert.equal(capsuleDownloadName(c),"evidence-capsule-trial-80-v2");
});
test("transported JSON can be parsed locally and recomputed without server authentication",async()=>{
 const c=await make(reference);
 const text=JSON.stringify(c,null,2)+"\n";
 const imported=parseCapsuleFile(text);
 const verified=await verifyEvidenceCapsule(imported,{subtle:webcrypto.subtle});
 assert.equal(verified.ok,true);
 assert.equal(verified.status,"INTERNAL_HASH_MATCH");
 assert.equal(verified.source_trial,u(80));
 assert.equal(verified.authenticated,false);assert.equal(verified.scientific_verdict,false);
 assert.equal(verified.coverage,"PARTIAL_OR_UNKNOWN");
});
test("independent key ordering or formatting changes leave canonical content and checksum consistent",async()=>{
 const c=await make(reference);
 const reorder=x=>Array.isArray(x)?x.map(reorder):
  x&&typeof x==="object"?Object.fromEntries(Object.keys(x).reverse().map(k=>[k,reorder(x[k])])):x;
 const shuffled=parseCapsuleFile(JSON.stringify(reorder(c),null,4));
 const verified=await verifyEvidenceCapsule(shuffled,{subtle:webcrypto.subtle});
 assert.equal(verified.status,"INTERNAL_HASH_MATCH");
});
test("a changed scientific observation, artifact hash, or dossier timestamp breaks internal checksum",async()=>{
 const base=await make(reference);
 const edits=[
  c=>{c.dossier.provenance.original_trial.observations="Changed conclusion";},
  c=>{c.dossier.artifacts[0].digest="b".repeat(64);},
  c=>{c.dossier.generated_at="2026-10-09T22:00:01.000Z";}
 ];
 for(const edit of edits){
  const c=clone(base);edit(c);
  const verified=await verifyEvidenceCapsule(c,{subtle:webcrypto.subtle});
  assert.equal(verified.ok,false);
  assert.equal(verified.status,"INTERNAL_HASH_MISMATCH");
 }
});
test("changing the declared digest or byte length is not silently accepted",async()=>{
 const base=await make(reference);
 for(const x of [{...base,fingerprint:{...base.fingerprint,digest:"b".repeat(64)}},
  {...base,fingerprint:{...base.fingerprint,bytes:base.fingerprint.bytes+1}}]){
  const v=await verifyEvidenceCapsule(x,{subtle:webcrypto.subtle});
  assert.equal(v.status,"INTERNAL_HASH_MISMATCH");
 }
});
test("forged signed or certified envelope and wrong method are rejected outright",async()=>{
 const base=await make(reference);
 for(const c of [
  {...base,kind:"untrusted-other"},
  {...base,schema_version:"99.0.0"},
  {...base,policy:"CERTIFIED_SCIENCE"},
  {...base,signed:true},
  {...base,source_authenticated:true},
  {...base,science_verified:true},
  {...base,execution_authorized:true},
  {...base,coverage:"COMPLETE"},
  {...base,created_at:"yesterday"},
  {...base,fingerprint:{...base.fingerprint,algorithm:"SHA-1"}},
  {...base,fingerprint:{...base.fingerprint,digest:"WRONG"}},
  {...base,fingerprint:{...base.fingerprint,bytes:0}},
  {...base,privileged:true}
 ]){
  assert.equal(validateCapsuleEnvelope(c).ok,false);
  assert.equal((await verifyEvidenceCapsule(c,{subtle:webcrypto.subtle})).status,"INVALID_CAPSULE");
 }
});
test("foreign source chain and invalid nested dossier cannot masquerade as original Trial",async()=>{
 const base=await make(reference);
 const alien=clone(base);
 alien.dossier.provenance.fusion.url=u(41);
 alien.dossier.provenance.fusion.issueNumber=41;
 assert.equal(sameCapsuleChain(reference,alien.dossier),false);
 assert.equal(sameCapsuleChain(reference,reference),true);
 const verified=await verifyEvidenceCapsule(alien,{subtle:webcrypto.subtle});
 assert.equal(verified.status,"INTERNAL_HASH_MISMATCH");
 const bad=clone(base);bad.dossier.source.signed=true;
 assert.equal(validateCapsuleEnvelope(bad).ok,false);
});
test("visible published anchor matching is explicitly self-declared, not proof of notarization",async()=>{
 const c=await make(reference);
 const f=c.fingerprint;
 const anchors=[
  {id:"dossier-anchor-200",issueNumber:200,url:u(200),trialNumber:80,
   fusionNumber:40,charterNumber:45,aNumber:10,bNumber:12,author:"alice",
   date:at,digest:f.digest,bytes:f.bytes,algorithm:f.algorithm,canonicalization:f.canonicalization},
  {id:"dossier-anchor-201",issueNumber:201,url:u(201),trialNumber:80,
   fusionNumber:40,charterNumber:45,aNumber:10,bNumber:12,author:"bob",
   digest:"b".repeat(64),bytes:f.bytes,algorithm:f.algorithm,canonicalization:f.canonicalization},
  {id:"dossier-anchor-202",issueNumber:202,url:u(202),trialNumber:81,
   fusionNumber:40,charterNumber:45,aNumber:10,bNumber:12,author:"else",
   digest:f.digest,bytes:f.bytes,algorithm:f.algorithm,canonicalization:f.canonicalization}
 ];
 const checks=capsuleAnchorComparison(c,anchors);
 assert.deepEqual(checks.map(x=>x.issueNumber),[200,201]);
 assert.equal(checks[0].status,"DECLARED_ANCHOR_MATCH");
 assert.equal(checks[1].status,"DECLARED_ANCHOR_DIFFERENCE");
 assert.equal("trusted" in checks[0],false);
});
test("malformed file, 3 MiB limit, unsafe canonical content and unavailable crypto are handled",async()=>{
 assert.equal(CAPSULE_MAX_FILE_BYTES,3*1024*1024);
 assert.throws(()=>parseCapsuleFile("not json"),/Invalid Evidence Capsule JSON/);
 assert.throws(()=>parseCapsuleFile("x".repeat(CAPSULE_MAX_FILE_BYTES+1)),/3 MiB/);
 const base=await make(reference);
 const hostile=clone(base);hostile.dossier.injected=JSON.parse('{"__proto__":"pollution"}');
 const bad=await verifyEvidenceCapsule(hostile,{subtle:webcrypto.subtle});
 assert.equal(bad.status,"CHECK_UNAVAILABLE");
 const missing=await verifyEvidenceCapsule(base,{subtle:null});
 assert.equal(missing.status,"CHECK_UNAVAILABLE");
});
