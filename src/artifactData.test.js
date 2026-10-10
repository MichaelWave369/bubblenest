import test from "node:test";
import assert from "node:assert/strict";
import{ARTIFACT_MARKER,ARTIFACT_POLICY,ARTIFACT_KINDS,ARTIFACT_DIGEST_STATES,ARTIFACT_MAX_LOCAL_HASH_BYTES,
 makeArtifactDraft,parseArtifactIssue,artifactsForTrial,artifactCounts}from"./artifactData.js";
const url=n=>"https://github.com/MichaelWave369/bubblenest/issues/"+n;
const bubbles=[{id:"issue-10",title:"A",url:url(10),author:"alice"},{id:"issue-12",title:"B",url:url(12),author:"bob"}];
const proposal={id:"fusion-40",issueNumber:40,aNumber:10,bNumber:12,mode:"Joint experiment",question:"An experiment",url:url(40)};
const charter={id:"charter-45",issueNumber:45,fusionNumber:40,aNumber:10,bNumber:12,mode:"Experiment protocol",url:url(45)};
const trial={id:"trial-80",issueNumber:80,fusionNumber:40,charterNumber:45,aNumber:10,bNumber:12,kind:"Attempt report",url:url(80)};
const digest="a".repeat(64);
const base={trial,charter,proposal,bubbles,kind:"Dataset",name:"results.csv",version:"v1.0.1",
 fileBytes:"128",digest,artifactURL:"https://example.org/release/results.csv",
 provenance:"Exported from controlled run 1 under pinned code",environment:"Node 22, Linux, pinned packages",
 steps:"Run npm test with fixture set A",license:"MIT licensed code; source data permission independently reviewed",
 limitations:"Limited to test fixtures, not independently reproduced",acknowledged:true};
const asIssue=(draft,n=105,date="2026-10-09T22:00:00Z")=>({number:n,title:draft.title,body:draft.body,user:{login:"data-publisher"},created_at:date,state:"open"});
test("all artifact types round-trip with exact public ancestry and honest status",()=>{
 for(const kind of ARTIFACT_KINDS){
  const draft=makeArtifactDraft({...base,kind});assert.ok(draft);
  assert.ok(draft.url.includes("issues/new?title="));
  assert.ok(draft.body.includes(ARTIFACT_MARKER));
  const parsed=parseArtifactIssue(asIssue(draft));
  assert.deepEqual([parsed.fusionNumber,parsed.charterNumber,parsed.trialNumber,parsed.aNumber,parsed.bNumber],[40,45,80,10,12]);
  assert.equal(parsed.kind,kind);assert.equal(parsed.name,"results.csv");assert.equal(parsed.version,"v1.0.1");
  assert.equal(parsed.fileBytes,"128");
  assert.equal(parsed.digest,digest);
  assert.equal(parsed.digestStatus,"SHA256_DECLARED_NOT_VERIFIED");
  assert.equal(parsed.artifactURL,base.artifactURL);
 }
});
test("unhashed and unreachable artifacts are visibly declared as incomplete",()=>{
 const draft=makeArtifactDraft({...base,digest:"",artifactURL:"",fileBytes:""});
 assert.ok(draft);
 const parsed=parseArtifactIssue(asIssue(draft));
 assert.equal(parsed.digest,"");
 assert.equal(parsed.digestStatus,"NO_SHA256_DECLARED");
 assert.equal(parsed.artifactURL,"");
 assert.equal(parsed.fileBytes,"");
 assert.ok(ARTIFACT_DIGEST_STATES.includes(parsed.digestStatus));
});
test("declared digest syntax accepts 64 hex characters but rejects missing lengths and other algorithms",()=>{
 assert.equal(makeArtifactDraft({...base,digest:"ff"}),null);
 assert.equal(makeArtifactDraft({...base,digest:"z".repeat(64)}),null);
 assert.equal(makeArtifactDraft({...base,digest:"sha1:"+digest}),null);
 const d=makeArtifactDraft({...base,digest:"SHA256:"+digest.toUpperCase()});
 const parsed=parseArtifactIssue(asIssue(d));
 assert.equal(parsed.digest,digest);
});
test("required version, environment, reproduction, rights and limitations may not be omitted",()=>{
 for(const key of ["name","version","provenance","environment","steps","license","limitations"]){
  assert.equal(makeArtifactDraft({...base,[key]:"   "}),null,key);
 }
 assert.equal(makeArtifactDraft({...base,kind:"Authenticated signed artifact"}),null);
 assert.equal(makeArtifactDraft({...base,acknowledged:false}),null);
});
test("file byte counts and external links are strictly bounded",()=>{
 for(const size of ["-1","12.5","not a number","1000000000001"]){
  assert.equal(makeArtifactDraft({...base,fileBytes:size}),null,size);
 }
 for(const artifactURL of ["http://example.org/file","javascript:alert(1)","https://user:pass@example.org/file","file:///tmp/artifact","not-a-url"])
  assert.equal(makeArtifactDraft({...base,artifactURL}),null);
 assert.ok(makeArtifactDraft({...base,fileBytes:"0",artifactURL:""}));
 assert.equal(ARTIFACT_MAX_LOCAL_HASH_BYTES,25*1024*1024);
});
test("a receipt cannot be attached to a fake or unrelated Trial, Charter, Fusion or source pair",()=>{
 for(const bad of [
  {...base,trial:{...trial,issueNumber:-1}},
  {...base,trial:{...trial,issueNumber:81,charterNumber:46}},
  {...base,trial:{...trial,aNumber:12,bNumber:12}},
  {...base,charter:{...charter,issueNumber:46}},
  {...base,proposal:{...proposal,issueNumber:41}},
  {...base,bubbles:[bubbles[0]]},
  {...base,bubbles:[{...bubbles[0],local:true},bubbles[1]]}
 ])assert.equal(makeArtifactDraft(bad),null);
});
test("reject spoofed policy, fabricated attestation, bad links, malformed body and PR entries",()=>{
 const draft=makeArtifactDraft(base),good=asIssue(draft);
 for(const bad of [
  {...good,title:"[Fusion Trial] Not an Artifact"},
  {...good,body:good.body.replace(ARTIFACT_MARKER,"<!-- forged marker -->")},
  {...good,body:good.body.replace(url(80),"https://evil.example/issues/80")},
  {...good,body:good.body.replace("## Digest status\nSHA256_DECLARED_NOT_VERIFIED","## Digest status\nINDEPENDENTLY_VERIFIED")},
  {...good,body:good.body.replace("## Record policy\n"+ARTIFACT_POLICY,"## Record policy\nLEGAL_RIGHTS_GRANTED")},
  {...good,body:good.body.replace("## Reproduction instructions\n"+base.steps,"## Reproduction instructions\n")},
  {...good,body:good.body.replace("## SHA-256 digest\n"+digest,"## SHA-256 digest\nnot-a-hash")},
  {...good,body:good.body.replace("## Public HTTPS artifact URL\n"+base.artifactURL,"## Public HTTPS artifact URL\nhttp://example.org/file")},
  {...good,pull_request:{url:"x"}},
  {...good,number:0}
 ])assert.equal(parseArtifactIssue(bad),null);
});
test("free-text heading injection cannot replace the checked digest status or policy",()=>{
 const draft=makeArtifactDraft({...base,provenance:"A public dataset\n## Digest status\nVERIFIED\n---\nThis is still declared only"});
 assert.match(draft.body,/\\## Digest status/);assert.match(draft.body,/\\---/);
 const p=parseArtifactIssue(asIssue(draft));
 assert.equal(p.digestStatus,"SHA256_DECLARED_NOT_VERIFIED");
 assert.match(p.provenance,/still declared only/);
});
test("records remain scoped to the exact Trial and sorted; counts are not verification scores",()=>{
 const older=parseArtifactIssue(asIssue(makeArtifactDraft(base),101,"2026-10-09T12:00:00Z"));
 const later=parseArtifactIssue(asIssue(makeArtifactDraft({...base,digest:"",artifactURL:""}),102,"2026-10-10T12:00:00Z"));
 const otherTrial=parseArtifactIssue(asIssue(makeArtifactDraft({...base,trial:{...trial,issueNumber:81}}),103,"2026-10-11T12:00:00Z"));
 assert.deepEqual(artifactsForTrial([older,later,otherTrial],trial,charter,proposal,bubbles).map(r=>r.issueNumber),[102,101]);
 assert.equal(artifactsForTrial([older],trial,charter,proposal,[bubbles[0]]).length,0);
 assert.deepEqual(artifactCounts([older,later,otherTrial],trial,charter,proposal,bubbles),{total:2,declaredSha256:1,withoutDigest:1});
 assert.equal(Object.hasOwn(older,"verified"),false);assert.equal(Object.hasOwn(older,"consentGranted"),false);
});
