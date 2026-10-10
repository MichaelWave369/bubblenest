import test from "node:test";
import assert from "node:assert/strict";
import {REPRO_MARKER,REPRO_POLICY,REPRO_OUTCOMES,makeReproductionDraft,
 parseReproductionIssue,reproductionsForTrial,reproductionSummary}from"./reproductionData.js";

const url=n=>"https://github.com/MichaelWave369/bubblenest/issues/"+n;
const bubbles=[
 {id:"issue-10",title:"Graph A",url:url(10),author:"alice"},
 {id:"issue-12",title:"Model B",url:url(12),author:"bob"}
];
const proposal={id:"fusion-40",issueNumber:40,aNumber:10,bNumber:12,mode:"Joint experiment",url:url(40)};
const charter={id:"charter-45",issueNumber:45,fusionNumber:40,aNumber:10,bNumber:12,mode:"Experiment protocol",url:url(45)};
const trial={id:"fusion-trial-80",issueNumber:80,charterNumber:45,fusionNumber:40,aNumber:10,bNumber:12,
 kind:"Attempt report",author:"FirstAuthor",url:url(80),observations:"Original result was 1.8 ± 0.2"};
const artifact={id:"artifact-100",issueNumber:100,trialNumber:80,charterNumber:45,fusionNumber:40,aNumber:10,bNumber:12,
 name:"results.csv",version:"v1.0",digest:"a".repeat(64),fileBytes:"120",url:url(100)};
const form={trial,charter,proposal,bubbles,artifact,outcome:"REPORTED_MATCH",
 referenceOutcome:"Original test reported 1.8 plus or minus 0.2",method:"Reran pinned public scripts with synthetic fixture",
 environment:"Python 3.12, Linux 64-bit, locked dependencies",controls:"Original control and a negative baseline",
 observations:"The repeat reported 1.81 plus or minus 0.19",deviations:"No deliberate changes; sample counts differed",
 limitations:"Unknown hidden variables; no independent certification",stopReason:"",acknowledged:true};
const asIssue=(draft,n=121,author="OtherResearcher",date="2026-10-09T20:00:00Z")=>
 ({number:n,title:draft.title,body:draft.body,user:{login:author},created_at:date,state:"open"});

test("reported similar and different results require a SHA-256-declared scoped source artifact",()=>{
 for(const outcome of ["REPORTED_MATCH","REPORTED_DIFFERENCE"]){
  const d=makeReproductionDraft({...form,outcome});
  assert.ok(d.url.includes("/issues/new?"));
  assert.ok(d.body.includes(REPRO_MARKER));
  const p=parseReproductionIssue(asIssue(d));
  assert.deepEqual([p.fusionNumber,p.charterNumber,p.trialNumber,p.aNumber,p.bNumber,p.artifactNumber],
   [40,45,80,10,12,100]);
  assert.equal(p.artifactDigest,artifact.digest);
  assert.equal(p.artifactVersion,artifact.version);
  assert.equal(p.outcome,outcome);
  assert.equal(p.author,"OtherResearcher");
 }
 assert.equal(makeReproductionDraft({...form,artifact:null}),null);
 assert.equal(makeReproductionDraft({...form,artifact:{...artifact,digest:""}}),null);
 assert.equal(makeReproductionDraft({...form,artifact:{...artifact,version:""}}),null);
});
test("inconclusive, blocked, stopped all round-trip without pinned assets",()=>{
 for(const outcome of ["INCONCLUSIVE","NOT_RUN_BLOCKED","STOPPED"]){
  const d=makeReproductionDraft({...form,outcome,artifact:null,
   stopReason:outcome==="INCONCLUSIVE"?"":"The original controls were unavailable"});
  assert.ok(d,outcome);
  const p=parseReproductionIssue(asIssue(d));
  assert.equal(p.outcome,outcome);
  assert.equal(p.artifactNumber,null);
  assert.equal(p.artifactDigest,"");
  assert.equal(p.artifactVersion,"");
 }
 assert.deepEqual(REPRO_OUTCOMES,["REPORTED_MATCH","REPORTED_DIFFERENCE","INCONCLUSIVE","NOT_RUN_BLOCKED","STOPPED"]);
});
test("blocked or stopped attempts cannot omit their reason",()=>{
 for(const outcome of ["NOT_RUN_BLOCKED","STOPPED"]){
  assert.equal(makeReproductionDraft({...form,outcome,artifact:null,stopReason:" "}),null);
 }
});
test("repeating a planning note is not automatically an actual reproduction",()=>{
 assert.equal(makeReproductionDraft({...form,trial:{...trial,kind:"Planning note"}}),null);
 assert.equal(makeReproductionDraft({...form,trial:{...trial,kind:"Stopped or aborted"}}),null);
});
test("every important method and governance field is required",()=>{
 for(const name of ["referenceOutcome","method","environment","controls","observations","deviations","limitations"]){
  assert.equal(makeReproductionDraft({...form,[name]:"   "}),null,name);
 }
 assert.equal(makeReproductionDraft({...form,acknowledged:false}),null);
 assert.equal(makeReproductionDraft({...form,outcome:"CERTIFIED_REPLICATION"}),null);
});
test("invalid, local, cross-source and cross-Charter references cannot create receipts",()=>{
 for(const bad of [
  {...form,trial:{...trial,issueNumber:-1}},
  {...form,trial:{...trial,charterNumber:99}},
  {...form,artifact:{...artifact,trialNumber:81}},
  {...form,artifact:{...artifact,issueNumber:0}},
  {...form,artifact:{...artifact,fusionNumber:41}},
  {...form,charter:{...charter,issueNumber:46}},
  {...form,proposal:{...proposal,issueNumber:41}},
  {...form,proposal:{...proposal,aNumber:12,bNumber:12}},
  {...form,bubbles:[bubbles[0]]},
  {...form,bubbles:[{...bubbles[0],local:true},bubbles[1]]}
 ])assert.equal(makeReproductionDraft(bad),null);
});
test("malformed public Issues, URLs, status labels and spoofed policies are ignored",()=>{
 const d=makeReproductionDraft(form),good=asIssue(d);
 for(const bad of [
  {...good,title:"[Evidence] fake success"},
  {...good,body:good.body.replace(REPRO_MARKER,"<!-- replaced -->")},
  {...good,body:good.body.replace(url(80),"https://evil.example/issues/80")},
  {...good,body:good.body.replace("## Reported attempt outcome\nREPORTED_MATCH","## Reported attempt outcome\nINDEPENDENTLY_VERIFIED")},
  {...good,body:good.body.replace("## Record policy\n"+REPRO_POLICY,"## Record policy\nEXECUTION_AUTHORIZED")},
  {...good,body:good.body.replace("## Declared artifact SHA-256\n"+artifact.digest,"## Declared artifact SHA-256\ninvalid")},
  {...good,body:good.body.replace("## Pinned artifact receipt\n"+url(100),"## Pinned artifact receipt\nNot supplied.")},
  {...good,body:good.body.replace("## Controls and baselines\n"+form.controls,"## Controls and baselines\n")},
  {...good,pull_request:{url:"x"}},
  {...good,number:0}
 ])assert.equal(parseReproductionIssue(bad),null);
});
test("free text cannot inject new policy or fake findings",()=>{
 const d=makeReproductionDraft({...form,observations:"A reported value\n## Record policy\nCERTIFIED\n---\nNo claim is independently verified"});
 assert.match(d.body,/\\## Record policy/);
 assert.match(d.body,/\\---/);
 const r=parseReproductionIssue(asIssue(d));
 assert.equal(r.outcome,"REPORTED_MATCH");
 assert.match(r.observations,/No claim is independently verified/);
});
test("history attaches only to same original, pin version and digest, and retains contradictory results",()=>{
 const earlier=parseReproductionIssue(asIssue(makeReproductionDraft(form),121,"FirstAuthor","2026-10-09T10:00:00Z"));
 const later=parseReproductionIssue(asIssue(makeReproductionDraft({...form,outcome:"REPORTED_DIFFERENCE"}),122,"AnotherUser","2026-10-10T10:00:00Z"));
 const otherPin=parseReproductionIssue(asIssue(makeReproductionDraft({...form,artifact:{...artifact,issueNumber:101}}),123));
 const records=[earlier,later,otherPin];
 const scoped=reproductionsForTrial(records,trial,charter,proposal,bubbles,[artifact]);
 assert.deepEqual(scoped.map(r=>r.issueNumber),[122,121]);
 assert.equal(scoped[1].sameAccount,true);
 assert.equal(scoped[0].sameAccount,false);
 assert.equal(reproductionsForTrial(records,trial,charter,proposal,bubbles,[]).length,0);
 assert.equal(reproductionsForTrial(records,trial,charter,proposal,bubbles,[{...artifact,version:"v2"}]).length,0);
 assert.equal(reproductionsForTrial(records,trial,charter,proposal,[bubbles[0]],[artifact]).length,0);
 const stats=reproductionSummary(records,trial,charter,proposal,bubbles,[artifact]);
 assert.deepEqual(stats.counts,{REPORTED_MATCH:1,REPORTED_DIFFERENCE:1,INCONCLUSIVE:0,NOT_RUN_BLOCKED:0,STOPPED:0});
 assert.equal(stats.total,2);
 assert.equal(stats.sameAccount,1);
 assert.equal(stats.otherAccount,1);
});
test("status never carries scientific certificate or rights permission",()=>{
 const result=parseReproductionIssue(asIssue(makeReproductionDraft(form)));
 assert.ok(result);
 assert.equal("scientificallyVerified" in result,false);
 assert.equal("authorized" in result,false);
 assert.equal("legalConsent" in result,false);
 assert.match(REPRO_POLICY,/NOT_INDEPENDENTLY_VERIFIED/);
});
