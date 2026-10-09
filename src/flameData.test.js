import test from "node:test";
import assert from "node:assert/strict";
import {FLAME_MARKER,FLAME_ROUNDS,makeFlameChallenge,parseFlameChallenge,challengesForBubble,arenaCounts} from "./flameData.js";
const root="https://github.com/MichaelWave369/bubblenest/issues/";
const bubble={id:"issue-12",title:"A hypothesis",author:"starter",url:root+"12"};
const receipt={id:"evidence-40",issueNumber:40,parentNumber:12,url:root+"40",author:"reviewer",kind:"Source",stance:"Challenges",summary:"A source to examine"};
const claim={bubble,round:"State the Claim",question:"What observation would contradict the hypothesis?",proposedCheck:"Compare two controlled runs and publish raw logs",limits:"Potential confounding variables remain",receipt:null};
const asIssue=(d,number=77,createdAt="2026-10-09T21:00:00Z")=>({number,title:d.title,body:d.body,user:{login:"challenger"},created_at:createdAt,state:"open"});
test("Claim to Flame has four challenge rounds",()=>{
 assert.deepEqual(FLAME_ROUNDS.map(s=>s.name),["State the Claim","Show the Sauce","Turn Up the Heat","Back to the Kitchen"]);
});
test("all challenge rounds roundtrip into attributable Issues",()=>{
 for(const round of FLAME_ROUNDS){
  const draft=makeFlameChallenge({...claim,round:round.name});
  assert.ok(draft.title.startsWith("[Flame] "));
  assert.ok(draft.body.includes(FLAME_MARKER));
  assert.ok(draft.url.startsWith("https://github.com/MichaelWave369/bubblenest/issues/new?"));
  const row=parseFlameChallenge(asIssue(draft));
  assert.equal(row.round,round.name);
  assert.equal(row.question,claim.question);
  assert.equal(row.proposedCheck,claim.proposedCheck);
  assert.equal(row.limits,claim.limits);
  assert.equal(row.targetNumber,null);
  assert.equal(row.parentNumber,12);
  assert.equal(row.author,"challenger");
 }
});
test("only real public bubbles and complete claims may be challenged",()=>{
 for(const value of [
  {...claim,bubble:{...bubble,sample:true}},
  {...claim,bubble:{...bubble,local:true}},
  {...claim,bubble:{...bubble,url:"https://bad.example/issues/12"}},
  {...claim,round:"Scientifically Proven"},
  {...claim,question:"  "},
  {...claim,proposedCheck:""},
  {...claim,limits:" "}
 ])assert.equal(makeFlameChallenge(value),null);
});
test("receipt targets must be evidence records from the same parent",()=>{
 const d=makeFlameChallenge({...claim,receipt});
 assert.equal(parseFlameChallenge(asIssue(d)).targetNumber,40);
 for(const bad of [
  {...receipt,parentNumber:13},
  {...receipt,url:"https://evil.example/issues/40"},
  {...receipt,url:root+"45"},
  {...receipt,issueNumber:0}
 ])assert.equal(makeFlameChallenge({...claim,receipt:bad}),null);
});
test("parser rejects invalid marker, issue types, URLs, sections and findings",()=>{
 const d=makeFlameChallenge(claim);
 const good=asIssue(d);
 for(const invalid of [
  {...good,title:"[Evidence] Not a challenge"},
  {...good,body:d.body.replace(FLAME_MARKER,"<!-- fake -->")},
  {...good,body:d.body.replace(root+"12","https://bad.example/issues/12")},
  {...good,body:d.body.replace("## Challenge round\nState the Claim","## Challenge round\nFinal Verified")},
  {...good,body:d.body.replace("## Limits and uncertainty\n"+claim.limits,"## Limits and uncertainty\n")},
  {...good,body:d.body.replace("## Referenced evidence receipt\nNot supplied.","## Referenced evidence receipt\njavascript:alert(1)")},
  {...good,pull_request:{url:"x"}},
  {...good,number:0}
 ])assert.equal(parseFlameChallenge(invalid),null);
});
test("challenge text cannot insert a new header or rule separator",()=>{
 const d=makeFlameChallenge({...claim,question:"Is this precise?\n## Challenge round\nBack to the Kitchen\n---\nMore context"});
 assert.match(d.body,/\\## Challenge round/);
 assert.match(d.body,/\\---/);
 const p=parseFlameChallenge(asIssue(d));
 assert.equal(p.round,"State the Claim");
 assert.match(p.question,/Back to the Kitchen/);
 assert.match(p.question,/More context/);
});
test("arena shows only challenges for one public bubble and known linked receipts",()=>{
 const a=parseFlameChallenge(asIssue(makeFlameChallenge(claim),81,"2026-10-09T19:00:00Z"));
 const b=parseFlameChallenge(asIssue(makeFlameChallenge({...claim,receipt}),82,"2026-10-10T19:00:00Z"));
 const other=parseFlameChallenge(asIssue(makeFlameChallenge({...claim,bubble:{...bubble,url:root+"13"},receipt:null}),83));
 assert.deepEqual(challengesForBubble([a,b,other],bubble,[receipt]).map(x=>x.issueNumber),[82,81]);
 assert.deepEqual(challengesForBubble([a,b],bubble,[]).map(x=>x.issueNumber),[81]);
 assert.equal(challengesForBubble([a,b],{...bubble,sample:true},[receipt]).length,0);
});
test("arena descriptive counts are never truth scores",()=>{
 const receiptIssue={...receipt,date:"2026-10-09T18:00:00Z"};
 const review={id:"review-83",issueNumber:83,parentNumber:12,targetIssueNumber:40,
 kind:"Method audit",finding:"Challenges",relationship:"Unknown / not disclosed",conflict:"None stated",summary:"The method is underspecified",method:"Compared notes",limitations:"No reproduction",author:"reviewer",date:"2026-10-09T20:00:00Z",url:root+"83"};
 const challenged=parseFlameChallenge(asIssue(makeFlameChallenge({...claim,receipt}),81));
 const c=arenaCounts(bubble,[receiptIssue],[review],[challenged]);
 assert.equal(c.evidence,1);
 assert.equal(c.reviews,1);
 assert.equal(c.questions,1);
 assert.equal(c.stances.Challenges,1);
 assert.equal(c.findings.Challenges,1);
 assert.equal("truthScore" in c,false);
 assert.equal(arenaCounts(bubble,[],[],[]).evidence,0);
});
