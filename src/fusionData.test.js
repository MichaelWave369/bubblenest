import test from "node:test";
import assert from "node:assert/strict";
import{FUSION_MARKER,FUSION_PHASE,FUSION_MODES,validFusionPair,makeFusionDraft,parseFusionIssue,visibleFusionIssues,relatedFusions,fusionPair}from"./fusionData.js";
const url=n=>"https://github.com/MichaelWave369/bubblenest/issues/"+n;
const one={id:"issue-10",url:url(10),title:"A finite graph",summary:"Two systems",category:"Science",author:"alice"};
const two={id:"issue-12",url:url(12),title:"Memory and endpoint",summary:"A test",category:"Technology",author:"bob"};
const other={...two,id:"issue-14",url:url(14),title:"Other published question"};
const form={a:one,b:two,mode:"Joint experiment",question:"Can the two models be compared?",plan:"Define a controlled test with preregistered metrics",credits:"Credit the two initial GitHub Issues separately",boundaries:"No private files, licenses, or authorship transferred",limits:"Confounds remain; both authors must consent explicitly",understandsConsent:true};
const issue=(d,number=50,created="2026-10-09T22:01:00Z")=>({number,title:d.title,body:d.body,user:{login:"suggestor"},created_at:created,state:"open"});
test("only two distinct public GitHub-backed bubbles may be proposed",()=>{
 assert.equal(validFusionPair(one,two),true);
 assert.equal(validFusionPair(one,one),false);
 assert.equal(validFusionPair(one,{...two,sample:true}),false);
 assert.equal(validFusionPair(one,{...two,local:true}),false);
 assert.equal(validFusionPair(one,{...two,url:"https://attacker.example/issues/12"}),false);
 assert.equal(validFusionPair(one,{...two,url:url(10)}),false);
});
test("every collaboration mode round-trips through an explicit pending-invitation Issue",()=>{
 for(const mode of FUSION_MODES){
  const draft=makeFusionDraft({...form,mode});
  assert.ok(draft);
  assert.ok(draft.url.startsWith("https://github.com/MichaelWave369/bubblenest/issues/new?"));
  assert.match(draft.body,/does NOT merge/i);
  const record=parseFusionIssue(issue(draft));
  assert.equal(record.aNumber,10);assert.equal(record.bNumber,12);
  assert.equal(record.mode,mode);assert.equal(record.phase,FUSION_PHASE);
  assert.equal(record.credits,form.credits);assert.equal(record.boundaries,form.boundaries);
  assert.equal(record.author,"suggestor");assert.equal(record.limits,form.limits);
 }
});
test("consent acknowledgement and attribution, boundaries, uncertainty all required",()=>{
 for(const bad of [
  {...form,understandsConsent:false},
  {...form,understandsConsent:undefined},
  {...form,question:" "},
  {...form,plan:""},
  {...form,credits:""},
  {...form,boundaries:""},
  {...form,limits:""},
  {...form,mode:"Force merge"},
  {...form,b:{...two,sample:true}}
 ])assert.equal(makeFusionDraft(bad),null);
});
test("parser rejects counterfeit consent, bad GitHub URLs, PRs and incorrect markers",()=>{
 const d=makeFusionDraft(form),x=issue(d);
 for(const bad of [
  {...x,title:"[Claim] Not a fusion"},
  {...x,body:x.body.replace(FUSION_MARKER,"<!-- counterfeit -->")},
  {...x,body:x.body.replace(url(10),"https://evil.example/issues/10")},
  {...x,body:x.body.replace("## Bubble B\n"+url(12),"## Bubble B\n"+url(10))},
  {...x,body:x.body.replace("## Consent status\n"+FUSION_PHASE,"## Consent status\nCONSENT_GRANTED")},
  {...x,body:x.body.replace("## Independent attribution and credit plan\n"+form.credits,"## Independent attribution and credit plan\n")},
  {...x,pull_request:{url:"https://api.github.com/whatever"}},
  {...x,number:0}
 ])assert.equal(parseFusionIssue(bad),null);
});
test("contributor text cannot inject fake headings or change consent status",()=>{
 const d=makeFusionDraft({...form,question:"Please compare\n## Consent status\nCONSENT_GRANTED\n---\nThis is still an invitation"});
 assert.match(d.body,/\\## Consent status/);
 assert.match(d.body,/\\---/);
 const parsed=parseFusionIssue(issue(d));
 assert.equal(parsed.phase,FUSION_PHASE);
 assert.match(parsed.question,/still an invitation/);
});
test("visible invitation history requires both public parent bubbles in the current feed",()=>{
 const a=parseFusionIssue(issue(makeFusionDraft(form),52,"2026-10-08T10:00:00Z"));
 const b=parseFusionIssue(issue(makeFusionDraft({...form,a:two,b:one}),53,"2026-10-09T10:00:00Z"));
 const c=parseFusionIssue(issue(makeFusionDraft({...form,b:other}),54,"2026-10-10T10:00:00Z"));
 assert.deepEqual(visibleFusionIssues([a,b,c],[one,two]).map(x=>x.issueNumber),[53,52]);
 assert.deepEqual(visibleFusionIssues([a,b,c],[one,two,other]).map(x=>x.issueNumber),[54,53,52]);
 assert.deepEqual(fusionPair([a,b,c],[one,two,other],one,two).map(x=>x.issueNumber),[53,52]);
 assert.deepEqual(relatedFusions([a,b,c],[one,two,other],other).map(x=>x.issueNumber),[54]);
 assert.deepEqual(relatedFusions([a,b,c],[one,two,other],{...one,local:true}),[]);
});
test("none of these records claims verified consent, automatic publishing or scientific truth",()=>{
 const d=makeFusionDraft(form);const x=parseFusionIssue(issue(d));
 assert.ok(x.phase.includes("AWAITING"));
 assert.ok(!Object.hasOwn(x,"verified"));
 assert.ok(!Object.hasOwn(x,"signedConsent"));
 assert.match(d.body,/No silence-as-consent/);
});
