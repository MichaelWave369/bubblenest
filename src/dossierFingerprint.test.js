import test from "node:test";
import assert from "node:assert/strict";
import {createHash,webcrypto}from"node:crypto";
import {buildReproductionDossier}from"./reproductionDossier.js";
import{canonicalSnapshotJSON,fingerprintDossier,compareFingerprints,FINGERPRINT_CANON,
 FINGERPRINT_ALGORITHM,FINGERPRINT_POLICY}from"./dossierFingerprint.js";
import{ANCHOR_MARKER,ANCHOR_STATUS,makeAnchorDraft,parseAnchorIssue,anchorsForDossier}from"./dossierAnchor.js";
const url=n=>"https://github.com/MichaelWave369/bubblenest/issues/"+n;
const bubbles=[{id:"issue-10",title:"Research A",url:url(10),author:"originA"},
 {id:"issue-12",title:"Research B",url:url(12),author:"originB"}];
const proposal={issueNumber:40,aNumber:10,bNumber:12,url:url(40),mode:"Joint experiment",author:"inviter"};
const charter={issueNumber:45,aNumber:10,bNumber:12,fusionNumber:40,url:url(45),phase:"DRAFT_FOR_PUBLIC_REVIEW_NOT_AUTHORIZED"};
const trial={issueNumber:80,aNumber:10,bNumber:12,charterNumber:45,fusionNumber:40,url:url(80),
 kind:"Attempt report",finding:"Inconclusive",author:"tester",observations:"No certified result"};
const dossier=buildReproductionDossier({trial,charter,proposal,bubbles,
 generatedAt:"2026-10-09T22:00:00.000Z",feedStatus:"ready"});
const issue=(draft,n=120)=>({number:n,title:draft.title,body:draft.body,
 created_at:"2026-10-10T01:00:00Z",user:{login:"submitter"},state:"open"});
test("hash matches SHA-256 of canonical UTF-8 JSON, never a platform certificate",async()=>{
 const json=canonicalSnapshotJSON(dossier);
 const expected=createHash("sha256").update(Buffer.from(json,"utf8")).digest("hex");
 const h=await fingerprintDossier(dossier,webcrypto.subtle);
 assert.equal(h.digest,expected);
 assert.equal(h.bytes,Buffer.byteLength(json,"utf8"));
 assert.equal(h.algorithm,FINGERPRINT_ALGORITHM);
 assert.equal(h.canonicalization,FINGERPRINT_CANON);
 assert.equal(h.digest.length,64);
});
test("indentation and key ordering do not alter canonical fingerprint",async()=>{
 const swap=x=>{
  if(Array.isArray(x))return x.map(swap);
  if(x!==null&&typeof x==="object")return Object.fromEntries(Object.keys(x).reverse().map(k=>[k,swap(x[k])]));
  return x;
 };
 const a=await fingerprintDossier(dossier,webcrypto.subtle);
 const b=await fingerprintDossier(JSON.parse(JSON.stringify(swap(dossier),null,5)),webcrypto.subtle);
 assert.equal(compareFingerprints(a,b),"SAME_CANONICAL_CONTENT");
});
test("changed observations, feed timestamp, or text produce different fingerprints",async()=>{
 const base=await fingerprintDossier(dossier,webcrypto.subtle);
 for(const other of [
  {...dossier,generated_at:"2026-10-09T22:00:01.000Z"},
  {...dossier,provenance:{...dossier.provenance,original_trial:{...dossier.provenance.original_trial,observations:"A new observation"}}},
  {...dossier,source:{...dossier.source,feed_status:"unavailable"}}
 ]){
  const hashed=await fingerprintDossier(other,webcrypto.subtle);
  assert.equal(compareFingerprints(base,hashed),"DIFFERENT_CANONICAL_CONTENT");
 }
});
test("invalid, unofficially certified or dangerous JSON objects never receive a fingerprint",async()=>{
 for(const x of [
  null,{"kind":"fake"},{...dossier,source:{...dossier.source,signed:true}},
  {...dossier,provenance:{...dossier.provenance,original_trial:{...dossier.provenance.original_trial,url:url(99)}}},
  {...dossier,untrusted:{__proto__:null,evil:()=>{}}},
  {...dossier,extra:JSON.parse('{"__proto__":"malicious"}')},
  {...dossier,large:"x".repeat(2*1024*1024)}
 ]){
  await assert.rejects(()=>fingerprintDossier(x,webcrypto.subtle));
 }
});
test("comparison refuses missing inputs and incompatible digest method",()=>{
 const a={digest:"a".repeat(64),bytes:123,algorithm:FINGERPRINT_ALGORITHM,canonicalization:FINGERPRINT_CANON};
 assert.equal(compareFingerprints(a,{...a,digest:"b".repeat(64)}),"DIFFERENT_CANONICAL_CONTENT");
 assert.equal(compareFingerprints(a,{...a,bytes:124}),"DIFFERENT_CANONICAL_CONTENT");
 assert.equal(compareFingerprints(a,{...a,canonicalization:"OTHER"}),"DIFFERENT_METHOD");
 assert.equal(compareFingerprints(a,null),"UNAVAILABLE");
 assert.equal(compareFingerprints(a,{...a,digest:"bad"}),"UNAVAILABLE");
});
test("public Issue round-trips with exact Trial, Charter, Fusion, two sources and caveats",async()=>{
 const h=await fingerprintDossier(dossier,webcrypto.subtle);
 const d=makeAnchorDraft({dossier,fingerprint:h,limitations:"Coverage is incomplete; original researcher has not confirmed the contents",acknowledged:true});
 assert.ok(d.url.startsWith("https://github.com/MichaelWave369/bubblenest/issues/new?"));
 assert.ok(d.body.includes(ANCHOR_MARKER));
 const p=parseAnchorIssue(issue(d));
 assert.deepEqual([p.trialNumber,p.fusionNumber,p.charterNumber,p.aNumber,p.bNumber],[80,40,45,10,12]);
 assert.equal(p.digest,h.digest);assert.equal(p.bytes,h.bytes);
 assert.equal(p.timestamp,dossier.generated_at);assert.equal(p.author,"submitter");
 assert.equal(p.canonicalization,FINGERPRINT_CANON);
 assert.equal(ANCHOR_STATUS,"USER_DECLARED_UNSIGNATURED_FINGERPRINT");
 assert.equal(FINGERPRINT_POLICY,"DECLARED_SHA256_NOT_SIGNED_NOT_SCIENCE");
 assert.equal(Object.hasOwn(p,"verified"),false);
});
test("draft creation requires digest, limits acknowledgment and valid supported dossier",async()=>{
 const h=await fingerprintDossier(dossier,webcrypto.subtle);
 for(const bad of [
  {acknowledged:false},
  {limitations:" "},
  {fingerprint:{...h,digest:"invalid"}},
  {fingerprint:{...h,algorithm:"MD5"}},
  {fingerprint:{...h,bytes:-1}},
  {fingerprint:{...h,bytes:0}},
  {dossier:{...dossier,kind:"OTHER"}}
 ]){
  assert.equal(makeAnchorDraft({dossier,fingerprint:h,limitations:"Limited source data",acknowledged:true,...bad}),null);
 }
});
test("rejects forged status, altered hashes, wrong parent, PRs and missing declarations",async()=>{
 const h=await fingerprintDossier(dossier,webcrypto.subtle);
 const draft=makeAnchorDraft({dossier,fingerprint:h,limitations:"Not signed",acknowledged:true});
 const good=issue(draft);
 for(const bad of [
  {...good,title:"[Reproduction] not an anchor"},
  {...good,body:good.body.replace(ANCHOR_MARKER,"<!-- counterfeit -->")},
  {...good,body:good.body.replace("## Original Trial\n"+url(80),"## Original Trial\nhttps://evil.example/issues/80")},
  {...good,body:good.body.replace("## SHA-256 fingerprint\n"+h.digest,"## SHA-256 fingerprint\ninvalid")},
  {...good,body:good.body.replace("## Canonicalization\n"+FINGERPRINT_CANON,"## Canonicalization\nUNVERIFIED_METHOD")},
  {...good,body:good.body.replace("## Receipt state\n"+ANCHOR_STATUS,"## Receipt state\nSIGNED_AND_IMMUTABLE")},
  {...good,body:good.body.replace("## Receipt policy\n"+FINGERPRINT_POLICY,"## Receipt policy\nSCIENTIFICALLY_VERIFIED")},
  {...good,body:good.body.replace("## Canonical UTF-8 byte length\n"+h.bytes,"## Canonical UTF-8 byte length\n-1")},
  {...good,pull_request:{url:"any"}},
  {...good,number:0}
 ])assert.equal(parseAnchorIssue(bad),null);
});
test("heading injection in free-text limitations cannot spoof signed seal",async()=>{
 const h=await fingerprintDossier(dossier,webcrypto.subtle);
 const draft=makeAnchorDraft({dossier,fingerprint:h,limitations:"Some limitations\n## Receipt policy\nVERIFIED\n---\nStill unverified",acknowledged:true});
 assert.match(draft.body,/\\## Receipt policy/);assert.match(draft.body,/\\---/);
 const p=parseAnchorIssue(issue(draft));
 assert.equal(p.digest,h.digest);assert.match(p.limitations,/Still unverified/);
});
test("visible anchors only belong to the exact published Trial ancestry",async()=>{
 const h=await fingerprintDossier(dossier,webcrypto.subtle);
 const a=parseAnchorIssue(issue(makeAnchorDraft({dossier,fingerprint:h,limitations:"Partial coverage",acknowledged:true}),120));
 const b={...a,issueNumber:121,id:"dossier-anchor-121",url:url(121),trialNumber:81};
 const c={...a,issueNumber:122,id:"dossier-anchor-122",url:url(122),bNumber:13};
 const d={...a,issueNumber:123,id:"dossier-anchor-123",url:url(123),fusionNumber:41};
 assert.deepEqual(anchorsForDossier([a,b,c,d],dossier).map(x=>x.issueNumber),[120]);
 assert.deepEqual(anchorsForDossier([a],{...dossier,kind:"FAKE"}),[]);
});
