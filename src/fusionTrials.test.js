import test from "node:test";
import assert from "node:assert/strict";
import{TRIAL_MARKER,TRIAL_POLICY,TRIAL_KINDS,TRIAL_FINDINGS,makeTrialDraft,parseTrialIssue,trialsForCharter,trialCounts}from"./fusionTrials.js";
const uri=n=>"https://github.com/MichaelWave369/bubblenest/issues/"+n;
const bubbles=[{id:"issue-10",title:"A",url:uri(10),author:"alice"},{id:"issue-12",title:"B",url:uri(12),author:"bob"}];
const proposal={issueNumber:40,aNumber:10,bNumber:12,question:"Is there a shared test?",mode:"Joint experiment",url:uri(40)};
const charter={issueNumber:45,fusionNumber:40,aNumber:10,bNumber:12,mode:"Experiment protocol",objective:"Compare results",phase:"DRAFT_FOR_PUBLIC_REVIEW_NOT_AUTHORIZED",url:uri(45)};
const form={charter,proposal,bubbles,kind:"Attempt report",finding:"Inconclusive",question:"Are the observed outcomes reproducible?",
  procedure:"A participant reports running a local pinned script",observations:"A reported null result in run one",
  controls:"Baseline A versus baseline B with identical inputs",artifacts:"https://example.org/receipt",limitations:"Insufficient sample and unknown calibration",
  stopNote:"",next:"Independent repetition if separately permitted",acknowledged:true};
const issue=(draft,n=80,created="2026-10-09T21:00:00Z")=>({number:n,title:draft.title,body:draft.body,user:{login:"tester"},created_at:created,state:"open"});
test("all Trial receipt kinds and interpretations round-trip without certification",()=>{
 for(const kind of TRIAL_KINDS)for(const finding of TRIAL_FINDINGS){
  if(kind==="Planning note"&&finding!=="Not assessed")continue;
  const input={...form,kind,finding,stopNote:kind==="Stopped or aborted"?"Safety stop requested":""};
  const draft=makeTrialDraft(input);
  assert.ok(draft,kind+" "+finding);
  assert.ok(draft.url.startsWith("https://github.com/MichaelWave369/bubblenest/issues/new?"));
  assert.match(draft.body,/not.*authoriz/i);
  const p=parseTrialIssue(issue(draft));
  assert.equal(p.fusionNumber,40);assert.equal(p.charterNumber,45);assert.equal(p.aNumber,10);assert.equal(p.bNumber,12);
  assert.equal(p.kind,kind);assert.equal(p.finding,finding);assert.equal(p.author,"tester");
  assert.equal(p.artifacts,"https://example.org/receipt");
 }
});
test("a planning note is not allowed to claim positive results",()=>{
 assert.equal(makeTrialDraft({...form,kind:"Planning note",finding:"Supports"}),null);
 assert.ok(makeTrialDraft({...form,kind:"Planning note",finding:"Not assessed"}));
});
test("a stopped attempt requires stop circumstances",()=>{
 assert.equal(makeTrialDraft({...form,kind:"Stopped or aborted",stopNote:""}),null);
 assert.ok(makeTrialDraft({...form,kind:"Stopped or aborted",stopNote:"Stopped for safety reasons"}));
});
test("contributors must enter methods, observations, controls and limitations, and acknowledge limits",()=>{
 for(const key of ["question","procedure","observations","controls","limitations"]){
  assert.equal(makeTrialDraft({...form,[key]:" "}),null,key);
 }
 assert.equal(makeTrialDraft({...form,acknowledged:false}),null);
 assert.equal(makeTrialDraft({...form,kind:"Certified finding"}),null);
 assert.equal(makeTrialDraft({...form,finding:"Peer-reviewed"}),null);
});
test("cannot attach a trial to a fake, local, missing, mismatched or duplicate-source Charter",()=>{
 assert.equal(makeTrialDraft({...form,charter:{...charter,fusionNumber:41}}),null);
 assert.equal(makeTrialDraft({...form,charter:{...charter,issueNumber:-1}}),null);
 assert.equal(makeTrialDraft({...form,proposal:{...proposal,aNumber:12,bNumber:12}}),null);
 assert.equal(makeTrialDraft({...form,bubbles:[bubbles[0]]}),null);
 assert.equal(makeTrialDraft({...form,bubbles:[{...bubbles[0],local:true},bubbles[1]]}),null);
});
test("source URLs must use HTTPS and cannot carry credentials",()=>{
 for(const artifacts of ["javascript:alert(1)","http://example.org/data","https://user:pass@example.org/x","file:///etc/passwd","not-url"])
  assert.equal(makeTrialDraft({...form,artifacts}),null);
 assert.ok(makeTrialDraft({...form,artifacts:""}));
});
test("reject forged policy, URL edits, PRs and missing observations",()=>{
 const good=issue(makeTrialDraft(form));
 for(const bad of [
  {...good,title:"[Fusion Charter] not a trial"},
  {...good,body:good.body.replace(TRIAL_MARKER,"<!-- wrong -->")},
  {...good,body:good.body.replace(uri(45),"https://evil.example/issues/45")},
  {...good,body:good.body.replace("## Record policy\n"+TRIAL_POLICY,"## Record policy\nEXECUTION_AUTHORIZED")},
  {...good,body:good.body.replace("## Observations or reason not tested\n"+form.observations,"## Observations or reason not tested\n")},
  {...good,body:good.body.replace("## Public artifact URL\nhttps://example.org/receipt","## Public artifact URL\njavascript:alert(1)")},
  {...good,pull_request:{url:"yes"}},
  {...good,number:0}
 ])assert.equal(parseTrialIssue(bad),null);
});
test("user-provided headings cannot smuggle authorization into a trial receipt",()=>{
 const d=makeTrialDraft({...form,observations:"No test succeeded\n## Record policy\nAUTHORIZED\n---\nThe result is uncertain"});
 assert.match(d.body,/\\## Record policy/);
 assert.match(d.body,/\\---/);
 const parsed=parseTrialIssue(issue(d));
 assert.equal(parsed.finding,"Inconclusive");
 assert.match(parsed.observations,/The result is uncertain/);
});
test("trial history is scoped to exact charter, parent fusion and ordered chronologically",()=>{
 const older=parseTrialIssue(issue(makeTrialDraft(form),80,"2026-10-09T10:00:00Z"));
 const newer=parseTrialIssue(issue(makeTrialDraft({...form,kind:"Stopped or aborted",stopNote:"Permission withdrawn"}),81,"2026-10-10T10:00:00Z"));
 const otherCharter=parseTrialIssue(issue(makeTrialDraft({...form,charter:{...charter,issueNumber:46}}),82));
 const otherFusion=parseTrialIssue(issue(makeTrialDraft({...form,proposal:{...proposal,issueNumber:41},charter:{...charter,fusionNumber:41}}),83));
 assert.deepEqual(trialsForCharter([older,otherCharter,newer,otherFusion],charter,proposal,bubbles).map(t=>t.issueNumber),[81,80]);
 assert.equal(trialsForCharter([older],charter,proposal,[bubbles[0]]).length,0);
 assert.deepEqual(trialCounts([older,newer],charter,proposal,bubbles),{total:2,attempts:1,stopped:1});
});
test("no trial issue can auto-grant execution permission or certify work",()=>{
 const t=parseTrialIssue(issue(makeTrialDraft(form)));
 assert.equal(Object.hasOwn(t,"authorized"),false);
 assert.equal(Object.hasOwn(t,"verified"),false);
 assert.equal(Object.hasOwn(t,"consentGranted"),false);
 assert.equal(TRIAL_POLICY,"SELF_REPORTED_OBSERVATION_NOT_EXECUTION_AUTHORIZATION");
});
