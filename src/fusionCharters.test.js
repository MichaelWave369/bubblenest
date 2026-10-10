import test from "node:test";
import assert from "node:assert/strict";
import {CHARTER_MARKER,CHARTER_PHASE,CHARTER_MODES,availableCharterProposal,makeCharterDraft,parseCharterIssue,chartersForFusion,charterCounts}from"./fusionCharters.js";
const url=n=>"https://github.com/MichaelWave369/bubblenest/issues/"+n;
const bubbles=[{id:"issue-10",url:url(10),title:"A",author:"alice"},{id:"issue-12",url:url(12),title:"B",author:"bob"}];
const proposal={id:"fusion-40",issueNumber:40,aNumber:10,bNumber:12,mode:"Joint experiment",question:"test",author:"starter",date:"2026-10-09T15:00:00Z",url:url(40)};
const args={proposal,bubbles,mode:"Experiment protocol",objective:"Compare observable outcomes under controls",deliverable:"Publish a frozen evaluation table and hash",methods:"Separate runs by independent participants",metrics:"State falsification criteria and sample counts",credit:"Both original bubble issues retained separately",rights:"No source code or license transfer authorized",privacy:"No private datasets; only open synthetic examples",stop:"Halt on withdrawal, safety issues or resource breach",checkpoint:"Review protocol before any experiment",limitations:"Confounders and sampling differences remain",acknowledged:true};
const record=(d,n=55,date="2026-10-09T16:00:00Z")=>({number:n,title:d.title,body:d.body,user:{login:"charterwriter"},created_at:date,state:"open"});
test("charter proposals require a valid public two-source Fusion invitation",()=>{
 assert.equal(availableCharterProposal(proposal,bubbles),true);
 assert.equal(availableCharterProposal(proposal,[bubbles[0]]),false);
 assert.equal(availableCharterProposal({...proposal,aNumber:12,bNumber:12},bubbles),false);
 assert.equal(makeCharterDraft({...args,bubbles:[{...bubbles[0],sample:true},bubbles[1]]}),null);
});
test("all charter modes round-trip with exact source links and unsigned draft status",()=>{
 for(const mode of CHARTER_MODES){
  const d=makeCharterDraft({...args,mode});assert.ok(d);
  assert.match(d.url,/\/issues\/new\?/);
  assert.ok(d.body.includes(CHARTER_MARKER));
  const p=parseCharterIssue(record(d));
  assert.equal(p.fusionNumber,40);assert.equal(p.aNumber,10);assert.equal(p.bNumber,12);
  assert.equal(p.mode,mode);assert.equal(p.objective,args.objective);
  assert.equal(p.stop,args.stop);assert.equal(p.privacy,args.privacy);
  assert.equal(p.phase,CHARTER_PHASE);assert.equal(p.author,"charterwriter");
 }
});
test("every required field and the explicit draft acknowledgement are mandatory",()=>{
 for(const key of ["objective","deliverable","methods","metrics","credit","rights","privacy","stop","checkpoint","limitations"]){
  assert.equal(makeCharterDraft({...args,[key]:"  "}),null,key);
 }
 assert.equal(makeCharterDraft({...args,acknowledged:false}),null);
 assert.equal(makeCharterDraft({...args,mode:"Contract Executed"}),null);
});
test("parser rejects fake status, invalid links, PRs and malformed charter fields",()=>{
 const d=makeCharterDraft(args),good=record(d);
 for(const bad of [
  {...good,title:"[Fusion] Other record"},
  {...good,body:good.body.replace(CHARTER_MARKER,"<!-- wrong -->")},
  {...good,body:good.body.replace(url(10),"https://other.example/issues/10")},
  {...good,body:good.body.replace("## Origin bubble B\n"+url(12),"## Origin bubble B\n"+url(10))},
  {...good,body:good.body.replace("## Charter status\n"+CHARTER_PHASE,"## Charter status\nACTIVE_AND_APPROVED")},
  {...good,body:good.body.replace("## Stop conditions and withdrawal\n"+args.stop,"## Stop conditions and withdrawal\n")},
  {...good,pull_request:{url:"other"}},
  {...good,number:0}
 ])assert.equal(parseCharterIssue(bad),null);
});
test("embedded heading and separator in user text cannot change charter status",()=>{
 const d=makeCharterDraft({...args,objective:"Explore\n## Charter status\nACTIVE\n---\nStill unapproved"});
 assert.match(d.body,/\\## Charter status/);
 assert.match(d.body,/\\---/);
 const parsed=parseCharterIssue(record(d));
 assert.equal(parsed.phase,CHARTER_PHASE);
 assert.match(parsed.objective,/Still unapproved/);
});
test("charters attach only to their actual public fusion and exact source pair",()=>{
 const a=parseCharterIssue(record(makeCharterDraft(args),55,"2026-10-09T16:00:00Z"));
 const b=parseCharterIssue(record(makeCharterDraft({...args,mode:"Prototype plan"}),56,"2026-10-10T16:00:00Z"));
 const otherProposal={...proposal,issueNumber:42};
 const c=parseCharterIssue(record(makeCharterDraft({...args,proposal:otherProposal}),57));
 assert.deepEqual(chartersForFusion([a,c,b],proposal,bubbles).map(x=>x.issueNumber),[56,55]);
 assert.equal(chartersForFusion([a,b],proposal,[bubbles[0]]).length,0);
 assert.equal(charterCounts([a,b,c],[proposal],bubbles),2);
 assert.equal(charterCounts([a,b,c],[proposal,otherProposal],bubbles),3);
});
test("nothing in the schema certifies permission, completion or scientific findings",()=>{
 const c=parseCharterIssue(record(makeCharterDraft(args)));
 assert.equal(c.phase,"DRAFT_FOR_PUBLIC_REVIEW_NOT_AUTHORIZED");
 assert.equal(Object.hasOwn(c,"participantApproved"),false);
 assert.equal(Object.hasOwn(c,"scientificallyVerified"),false);
 assert.equal(Object.hasOwn(c,"licenseGranted"),false);
});
