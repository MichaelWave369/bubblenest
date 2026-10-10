import test from"node:test";
import assert from"node:assert/strict";
import{buildReproductionDossier}from"./reproductionDossier.js";
import{validateDossierImport,compareDossiers,dossierDiffMarkdown,
 DIFF_KIND,DIFF_VERSION,MAX_DOSSIER_IMPORT_BYTES}from"./dossierDiff.js";

const url=n=>"https://github.com/MichaelWave369/bubblenest/issues/"+n;
const bubbles=[{id:"issue-10",title:"Graph",author:"alice",url:url(10)},
 {id:"issue-12",title:"Other",author:"bob",url:url(12)}];
const proposal={issueNumber:40,aNumber:10,bNumber:12,mode:"Joint experiment",url:url(40)};
const charter={issueNumber:45,fusionNumber:40,aNumber:10,bNumber:12,url:url(45),
 phase:"DRAFT_FOR_PUBLIC_REVIEW_NOT_AUTHORIZED"};
const trial={issueNumber:80,charterNumber:45,fusionNumber:40,aNumber:10,bNumber:12,
 kind:"Attempt report",author:"original",finding:"Inconclusive",url:url(80),observations:"Test result 1.2",controls:"Control 1"};
const a={issueNumber:100,trialNumber:80,charterNumber:45,fusionNumber:40,aNumber:10,bNumber:12,
 kind:"Dataset",name:"test.csv",version:"v1",digest:"a".repeat(64),fileBytes:"5",url:url(100),
 artifactURL:"https://example.org/data",digestStatus:"SHA256_DECLARED_NOT_VERIFIED"};
const check={issueNumber:101,artifactNumber:100,trialNumber:80,charterNumber:45,fusionNumber:40,
 aNumber:10,bNumber:12,referenceDigest:a.digest,referenceBytes:"5",
 observedBytes:5,observedDigest:a.digest,result:"HASH_MATCH",url:url(101)};
const rep={issueNumber:102,trialNumber:80,charterNumber:45,fusionNumber:40,
 aNumber:10,bNumber:12,artifactNumber:100,artifactDigest:a.digest,artifactVersion:"v1",
 outcome:"REPORTED_MATCH",author:"reviewer",url:url(102),
 observations:"Trial matched under pinned input",environment:"Node",controls:"Mock"};
const args={trial,charter,proposal,bubbles,artifacts:[a],byteChecks:[check],reproductions:[rep],
 feedStatus:"ready",generatedAt:"2026-10-08T10:00:00.000Z"};
const dossier=(changes={})=>buildReproductionDossier({...args,...changes});
const clone=x=>JSON.parse(JSON.stringify(x));
test("valid exported v1.7 dossier accepted but explicitly untrusted",()=>{
 const d=dossier();const v=validateDossierImport(d);
 assert.equal(v.ok,true);assert.equal(MAX_DOSSIER_IMPORT_BYTES,2*1024*1024);
 const diff=compareDossiers(d,clone(d));
 assert.equal(diff.ok,true);assert.equal(diff.kind,DIFF_KIND);assert.equal(diff.schema_version,DIFF_VERSION);
 assert.equal(diff.import_trusted,false);assert.equal(diff.signed,false);
 assert.equal(diff.scientific_verdict,false);
 assert.equal(diff.artifacts.unchanged,1);assert.equal(diff.byte_checks.unchanged,1);
 assert.equal(diff.reproductions.unchanged,1);
});
test("rejects forged certificate, wrong kind, missing provenance and unsupported schema",()=>{
 const d=dossier();
 for(const bad of [
  null,[],42,
  {...d,kind:"fake"},
  {...d,schema_version:"99.0.0"},
  {...d,source:{...d.source,signed:true}},
  {...d,source:{...d.source,independent_verification:true}},
  {...d,source:{...d.source,coverage:"COMPLETE"}},
  {...d,source:{...d.source,execution_authorized:true}},
  {...d,caveat:"OFFICIALLY_VERIFIED"},
  {...d,generated_at:"NOT_A_DATE"},
  {...d,source:{...d.source,repository:"https://malicious.example"}}
 ])assert.equal(validateDossierImport(bad).ok,false,JSON.stringify(bad)?.slice(0,150));
});
test("rejects cross-trial and unrelated source chain even when issue counts match",()=>{
 const old=dossier();
 const next=dossier({...args,proposal:{...proposal,issueNumber:41,url:url(41)},charter:{...charter,fusionNumber:41},
   trial:{...trial,fusionNumber:41},artifacts:[],byteChecks:[],reproductions:[]});
 assert.equal(next.provenance.fusion.url,url(41));
 const compare=compareDossiers(old,next);
 assert.equal(compare.ok,false);
 assert.match(compare.errors.join(" "),/different source chains/);
});
test("rejects malformed Issue URLs, duplicates, excessive records and missing arrays",()=>{
 const d=dossier();
 for(const bad of [
  {...d,artifacts:[...d.artifacts,d.artifacts[0]]},
  {...d,artifacts:[{...d.artifacts[0],url:"https://evil.example/issues/100"}]},
  {...d,artifacts:[{...d.artifacts[0],byte_checks:[...d.artifacts[0].byte_checks,...d.artifacts[0].byte_checks]}]},
  {...d,reproductions:[{...d.reproductions[0],issueNumber:0}]},
  {...d,artifacts:null},
  {...d,artifacts:[{...d.artifacts[0],byte_checks:null}]},
  {...d,artifacts:Array.from({length:301},(_,i)=>({...d.artifacts[0],issueNumber:1000+i,url:url(1000+i)}))}
 ])assert.equal(validateDossierImport(bad).ok,false);
});
test("detects newly visible records while counting unchanged records separately",()=>{
 const old=dossier({artifacts:[],byteChecks:[],reproductions:[]});
 const now=dossier({generatedAt:"2026-10-09T10:00:00.000Z"});
 const diff=compareDossiers(old,now);
 assert.equal(diff.ok,true);
 assert.deepEqual(diff.artifacts.added.map(r=>r.issueNumber),[100]);
 assert.deepEqual(diff.byte_checks.added.map(r=>r.issueNumber),[101]);
 assert.deepEqual(diff.reproductions.added.map(r=>r.issueNumber),[102]);
 assert.equal(diff.artifacts.noLongerVisible.length,0);
 assert.ok(diff.flags.noLongerVisible.includes("NO_ARTIFACT_RECEIPTS"));
});
test("reports no-longer-visible records without claiming GitHub deletion",()=>{
 const old=dossier(),now=dossier({artifacts:[],byteChecks:[],reproductions:[]});
 const diff=compareDossiers(old,now);
 assert.deepEqual(diff.artifacts.noLongerVisible.map(x=>x.issueNumber),[100]);
 assert.deepEqual(diff.byte_checks.noLongerVisible.map(x=>x.issueNumber),[101]);
 assert.deepEqual(diff.reproductions.noLongerVisible.map(x=>x.issueNumber),[102]);
 assert.match(diff.caveat,/NOT_PROOF_OF_ISSUE_DELETION/);
 assert.match(dossierDiffMarkdown(diff),/not deleted or disproven/);
});
test("detects changed declared hashes and associated disappeared byte/reproduction links",()=>{
 const old=dossier();
 const a2={...a,digest:"b".repeat(64)};
 const now=dossier({artifacts:[a2],byteChecks:[check],reproductions:[rep]});
 const diff=compareDossiers(old,now);
 assert.deepEqual(diff.artifacts.changed[0].fields,["digest"]);
 assert.equal(diff.byte_checks.noLongerVisible.length,1);
 assert.equal(diff.reproductions.noLongerVisible.length,1);
 assert.ok(diff.flags.newlyVisible.includes("NO_BYTE_CHECK_FOR_SOME_ARTIFACTS"));
});
test("detects changed original observations, not just downstream receipts",()=>{
 const old=dossier(),now=dossier({trial:{...trial,observations:"A different value"}});
 const diff=compareDossiers(old,now);
 assert.equal(diff.sources.length,1);
 assert.deepEqual(diff.sources[0],{node:"original_trial",fields:["observations"]});
});
test("preserves contradictory outcome counts and diff of reported result labels",()=>{
 const diff=compareDossiers(dossier(),dossier({
  reproductions:[{...rep,outcome:"REPORTED_DIFFERENCE"}]
 }));
 assert.equal(diff.reproductions.changed.length,1);
 assert.ok(diff.reproductions.changed[0].fields.includes("outcome"));
 assert.equal(diff.reproductions.added.length,0);
});
test("source text containing Markdown headings cannot create fake headings in exported diff",()=>{
 const old=dossier();
 const now=dossier({reproductions:[{...rep,observations:"Unverified\n## CERTIFIED SCIENCE\n---\nChanged"}]});
 const diff=compareDossiers(old,now);
 assert.equal(diff.reproductions.changed.length,1);
 const md=dossierDiffMarkdown(diff);
 assert.equal(md.split("\n").filter(line=>line.startsWith("## ")).length,5);
 assert.ok(!md.includes("## CERTIFIED SCIENCE"));
 assert.equal(dossierDiffMarkdown(null),"");
});
