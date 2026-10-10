import test from "node:test";
import assert from "node:assert/strict";
import{RESPONSE_MARKER,RESPONSE_KINDS,RESPONSE_POLICY,makeFusionResponseDraft,parseFusionResponseIssue,
 fusionResponsesForProposal,fusionResponseSummary,responsesForPublicFusions}from"./fusionResponses.js";
const url=n=>"https://github.com/MichaelWave369/bubblenest/issues/"+n;
const bubbles=[
 {id:"issue-11",url:url(11),author:"Alice-Dev",title:"Energy graph",category:"Science"},
 {id:"issue-12",url:url(12),author:"Bob-Builder",title:"Causal history",category:"Technology"}
];
const proposal={id:"fusion-40",issueNumber:40,aNumber:11,bNumber:12,mode:"Joint experiment",author:"inviter",date:"2026-10-09T12:00:00Z",url:url(40)};
const draft={proposal,role:"A",kind:"Interested in discussing",scope:"Discussion of a public experimental comparison only; no licenses granted",limits:"Source data and independent credit require separate review",note:"No other permissions implied"};
const issue=(v,n=60,author="Alice-Dev",date="2026-10-09T13:00:00Z")=>{
 const built=makeFusionResponseDraft(v);
 if(!built)throw Error("Draft unexpectedly invalid");
 return {number:n,title:built.title,body:built.body,user:{login:author},state:"open",created_at:date};
};
test("all response types and roles round-trip to the public Issue contract",()=>{
 for(const kind of RESPONSE_KINDS)for(const role of ["A","B"]){
  const d={...draft,kind,role};
  const created=makeFusionResponseDraft(d);
  assert.ok(created.url.startsWith("https://github.com/MichaelWave369/bubblenest/issues/new?"));
  assert.ok(created.body.includes(RESPONSE_MARKER));
  const p=parseFusionResponseIssue(issue(d));
  assert.equal(p.fusionNumber,40);assert.equal(p.sourceNumber,role==="A"?11:12);
  assert.equal(p.kind,kind);assert.equal(p.role,role);
  assert.equal(p.limits,d.limits);assert.equal(p.scope,d.scope);
  assert.equal(p.author,"Alice-Dev");
 }
});
test("incomplete, invalid and double-sourced drafts cannot become proposals",()=>{
 for(const bad of [
  {...draft,role:"Creator C"},
  {...draft,kind:"Legal consent granted"},
  {...draft,scope:""},
  {...draft,limits:"   "},
  {...draft,proposal:{...proposal,issueNumber:0}},
  {...draft,proposal:{...proposal,aNumber:11,bNumber:11}},
  {...draft,proposal:{...proposal,aNumber:-5}}
 ])assert.equal(makeFusionResponseDraft(bad),null);
});
test("rejects spoofed policy, bad parent URLs, malformed Issues and PRs",()=>{
 const good=issue(draft);
 for(const broken of [
  {...good,title:"[Fusion] Fake response"},
  {...good,body:good.body.replace(RESPONSE_MARKER,"<!-- wrong -->")},
  {...good,body:good.body.replace("## Fusion invitation\n"+url(40),"## Fusion invitation\nhttps://evil.example/issues/40")},
  {...good,body:good.body.replace("## Responding source\n"+url(11),"## Responding source\n"+url(12)+"?fake=1")},
  {...good,body:good.body.replace("## Policy\n"+RESPONSE_POLICY,"## Policy\nFULL_LEGAL_CONSENT_GRANTED")},
  {...good,body:good.body.replace("## Response\nInterested in discussing","## Response\nCertified owner")},
  {...good,pull_request:{url:"x"}},
  {...good,number:0}
 ])assert.equal(parseFusionResponseIssue(broken),null);
});
test("contributor text cannot inject fake headings or assert legal consent by a field",()=>{
 const d=makeFusionResponseDraft({...draft,scope:"Limited review\n## Policy\nLEGAL_CONSENT\n---\nNo permissions granted"});
 assert.match(d.body,/\\## Policy/);
 assert.match(d.body,/\\---/);
 const parsed=parseFusionResponseIssue({number:60,title:d.title,body:d.body,user:{login:"Alice-Dev"},state:"open"});
 assert.equal(parsed.role,"A");assert.match(parsed.scope,/LEGAL_CONSENT/);
 assert.ok(parsed.scope.includes("No permissions granted"));
});
test("only the originating GitHub account can produce a matching-account signal",()=>{
 const a=parseFusionResponseIssue(issue(draft,60,"ALICE-DEV"));
 const outsider=parseFusionResponseIssue(issue(draft,61,"random-reviewer","2026-10-10T09:00:00Z"));
 const b=parseFusionResponseIssue(issue({...draft,role:"B"},62,"Bob-Builder","2026-10-10T10:00:00Z"));
 const summary=fusionResponseSummary([a,outsider,b],proposal,bubbles);
 assert.equal(summary.all.length,3);
 assert.equal(summary.a.issueNumber,60);
 assert.equal(summary.b.issueNumber,62);
 assert.equal(summary.unmatched.length,1);
 assert.equal(summary.unmatched[0].issueNumber,61);
 assert.equal(summary.pairedInterest,true);
 assert.equal(summary.policy,"ACCOUNT_SIGNAL_ONLY_NOT_LEGAL_CONSENT");
 assert.equal("verifiedConsent" in summary,false);
});
test("later interest withdrawals supersede earlier interest without deleting public history",()=>{
 const earlier=parseFusionResponseIssue(issue(draft,60,"Alice-Dev","2026-10-09T13:00:00Z"));
 const later=parseFusionResponseIssue(issue({...draft,kind:"Withdraw earlier interest"},63,"Alice-Dev","2026-10-10T13:00:00Z"));
 const bob=parseFusionResponseIssue(issue({...draft,role:"B"},64,"Bob-Builder","2026-10-09T13:00:00Z"));
 const summary=fusionResponseSummary([earlier,later,bob],proposal,bubbles);
 assert.equal(summary.a.kind,"Withdraw earlier interest");
 assert.equal(summary.pairedInterest,false);
 assert.equal(summary.all.length,3);
});
test("cannot attach a response to the wrong invitation, source role or unavailable source",()=>{
 const a=parseFusionResponseIssue(issue(draft,60));
 const wrongFusion=parseFusionResponseIssue(issue({...draft,proposal:{...proposal,issueNumber:41}},61));
 const wrongRole=parseFusionResponseIssue(issue({...draft,role:"B"},62,"Alice-Dev"));
 const otherSource=parseFusionResponseIssue(issue({...draft,proposal:{...proposal,aNumber:13}},63));
 const all=fusionResponsesForProposal([a,wrongFusion,wrongRole,otherSource],proposal,bubbles);
 assert.deepEqual(all.map(x=>x.issueNumber),[62,60]);
 assert.equal(all[0].originAccountMatch,false);
 assert.equal(all[1].originAccountMatch,true);
 assert.equal(fusionResponsesForProposal([a],proposal,[bubbles[0]]).length,0);
 assert.equal(fusionResponsesForProposal([a],proposal,[{...bubbles[0],local:true},bubbles[1]]).length,0);
 assert.equal(responsesForPublicFusions([a],[proposal],bubbles).length,1);
});
test("two sources owned by the same GitHub account still require role-specific responses",()=>{
 const ownerB={...bubbles[1],author:"Alice-Dev"};
 const a=parseFusionResponseIssue(issue(draft,60,"Alice-Dev"));
 const status=fusionResponseSummary([a],proposal,[bubbles[0],ownerB]);
 assert.equal(status.a.kind,"Interested in discussing");
 assert.equal(status.b,null);
 assert.equal(status.pairedInterest,false);
 const b=parseFusionResponseIssue(issue({...draft,role:"B"},61,"Alice-Dev"));
 assert.equal(fusionResponseSummary([a,b],proposal,[bubbles[0],ownerB]).pairedInterest,true);
});
