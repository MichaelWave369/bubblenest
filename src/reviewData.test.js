import test from "node:test";
import assert from "node:assert/strict";
import {REVIEW_KINDS,REVIEW_FINDINGS,REVIEW_RELATIONS,makeReviewDraft,parseReviewIssue,reviewsForBubble,reviewsForReceipt,reviewAccounts,reviewActivity}from"./reviewData.js";
const base="https://github.com/MichaelWave369/bubblenest/issues/";
const bubble={id:"issue-12",url:base+"12",author:"starter"};
const receipt={id:"evidence-42",parentNumber:12,issueNumber:42,url:base+"42",author:"author",kind:"Test",summary:"One trial",date:"2026-10-09T01:00:00Z"};
const form={bubble,receipt,kind:"Method audit",finding:"Inconclusive",relationship:"Unknown / not disclosed",conflict:"No known financial interest",summary:"Not enough evidence to confirm the outcome",method:"Checked published inputs and procedure",limitations:"Sample and controls need further work",next:"Repeat with controls"};
const make=(record=form,number=81,author="reviewer",time="2026-10-09T03:00:00Z")=>{
 const d=makeReviewDraft(record);
 return {number,title:d.title,body:d.body,user:{login:author},created_at:time,state:"open"};
};
test("review categories are finite and explicitly non-certifying",()=>{
 assert.deepEqual(REVIEW_KINDS,["Source inspection","Method audit","Reproduction attempt","Critical assessment"]);
 assert.deepEqual(REVIEW_FINDINGS,["Corroborates","Challenges","Inconclusive","More work needed"]);
 assert.ok(!REVIEW_FINDINGS.includes("Verified"));
});
test("every review kind and finding round-trips through an Issue",()=>{
 for(const kind of REVIEW_KINDS)for(const finding of REVIEW_FINDINGS){
  const draft=makeReviewDraft({...form,kind,finding});
  assert.ok(draft?.url.includes("/issues/new?"));
  const r=parseReviewIssue(make({...form,kind,finding}));
  assert.equal(r.parentNumber,12);
  assert.equal(r.targetIssueNumber,42);
  assert.equal(r.kind,kind);
  assert.equal(r.finding,finding);
  assert.equal(r.conflict,form.conflict);
  assert.equal(r.method,form.method);
  assert.equal(r.author,"reviewer");
 }
});
test("relationship declarations round-trip, without representing authenticated independence",()=>{
 for(const relationship of REVIEW_RELATIONS){
  const r=parseReviewIssue(make({...form,relationship}));
  assert.equal(r.relationship,relationship);
 }
});
test("publishing rejects examples, local drafts, mismatched receipts and incomplete reviews",()=>{
 for(const bad of [
  {...form,bubble:{...bubble,sample:true}},
  {...form,bubble:{...bubble,local:true}},
  {...form,bubble:{...bubble,url:"https://evil.example/issues/12"}},
  {...form,receipt:{...receipt,parentNumber:14}},
  {...form,receipt:{...receipt,url:"https://evil.example/issues/42"}},
  {...form,receipt:{...receipt,issueNumber:33}},
  {...form,kind:"Verified"},
  {...form,finding:"Certified"},
  {...form,relationship:"Official external auditor"},
  {...form,conflict:""},
  {...form,summary:" "},
  {...form,method:""},
  {...form,limitations:" "}
 ])assert.equal(makeReviewDraft(bad),null);
});
test("parser rejects spoofed title marker and invalid parent/receipt URLs",()=>{
 const valid=make();
 for(const invalid of [
  {...valid,title:"[Evidence] wrong type"},
  {...valid,body:valid.body.replace("bubblenest:review:v1","spoofed")},
  {...valid,body:valid.body.replace(base+"12","https://evil.example/issues/12")},
  {...valid,body:valid.body.replace(base+"42","https://evil.example/issues/42")},
  {...valid,body:valid.body.replace("## Finding\nInconclusive","## Finding\nCertified")},
  {...valid,pull_request:{url:"x"}},
  {...valid,number:0}
 ])assert.equal(parseReviewIssue(invalid),null);
});
test("heading and horizontal-rule injection cannot mutate a review's finding",()=>{
 const r=parseReviewIssue(make({...form,summary:"Observed behavior\n## Finding\nCorroborates\n---\nFake footer"}));
 assert.equal(r.finding,"Inconclusive");
 assert.match(r.summary,/Corroborates/);
 assert.match(r.summary,/\\## Finding/);
});
test("only actual evidence receipts from the same parent are counted",()=>{
 const a=parseReviewIssue(make(form,81,"author"));
 const b=parseReviewIssue(make({...form,finding:"Challenges"},82,"outside","2026-10-10T04:00:00Z"));
 const fakeTarget=parseReviewIssue(make({...form,receipt:{...receipt,url:base+"99",issueNumber:99}},83,"stranger"));
 const otherParent=parseReviewIssue(make({...form,bubble:{...bubble,url:base+"13"},receipt:{...receipt,parentNumber:13}},84,"outsider"));
 const ordered=reviewsForBubble([a,b,fakeTarget,otherParent],bubble,[receipt]);
 assert.deepEqual(ordered.map(x=>x.issueNumber),[82,81]);
 assert.equal(ordered[1].sameAccount,true);
 assert.equal(ordered[0].sameAccount,false);
 assert.equal(reviewsForReceipt([a,b,fakeTarget],bubble,[receipt],42).length,2);
 assert.equal(reviewsForBubble([a,b],{...bubble,local:true},[receipt]).length,0);
 assert.deepEqual(reviewAccounts([a,b],bubble,[receipt]),["author","outside"]);
 assert.equal(reviewActivity([a,b],bubble,[receipt]).length,2);
});
