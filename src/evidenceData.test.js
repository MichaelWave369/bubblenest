import test from "node:test";
import assert from "node:assert/strict";
import {EVIDENCE_KINDS,EVIDENCE_STANCES,makeEvidenceDraft,parseEvidenceIssue,evidenceForBubble,evidenceSummary,evidenceActivity,evidenceAccounts} from "./evidenceData.js";
const issueBase="https://github.com/MichaelWave369/bubblenest/issues/";
const bubble={id:"issue-12",title:"A nested question",url:issueBase+"12",author:"origin"};
const defaults={bubble,kind:"Source",stance:"Undetermined",summary:"Published source to examine",method:"Author and date are listed",sourceUrl:"https://doi.org/10.5281/zenodo.123",relatedEvolution:"",limitations:"This source may not support the full claim",next:"Independent assessment"};
const issue=(d,number=44,date="2026-10-09T17:00:00Z",user="contributor")=>({number,title:d.title,body:d.body,user:{login:user},created_at:date,state:"open"});
test("enumerated kind and assessment vocabulary is bounded",()=>{
 assert.deepEqual(EVIDENCE_KINDS,["Source","Test","Replication","Review"]);
 assert.deepEqual(EVIDENCE_STANCES,["Supports","Challenges","Mixed","Undetermined"]);
});
test("all receipt types and stances round-trip with attribution",()=>{
 for(const kind of EVIDENCE_KINDS)for(const stance of EVIDENCE_STANCES){
  const d=makeEvidenceDraft({...defaults,kind,stance});
  assert.ok(d&&d.url.startsWith(issueBase.replace(/\/issues\/$/,"")+"/issues/new?"));
  const p=parseEvidenceIssue(issue(d));
  assert.equal(p.kind,kind);assert.equal(p.stance,stance);
  assert.equal(p.parentNumber,12);
  assert.equal(p.summary,defaults.summary);
  assert.equal(p.sourceUrl,defaults.sourceUrl);
  assert.equal(p.author,"contributor");
  assert.equal(p.limitations,defaults.limitations);
 }
});
test("a Source needs a public URL, Test and Replication need a method",()=>{
 assert.equal(makeEvidenceDraft({...defaults,sourceUrl:""}),null);
 assert.equal(makeEvidenceDraft({...defaults,kind:"Test",method:"",sourceUrl:""}),null);
 assert.equal(makeEvidenceDraft({...defaults,kind:"Replication",method:"",sourceUrl:""}),null);
 assert.ok(makeEvidenceDraft({...defaults,kind:"Test",method:"Controlled repeat",sourceUrl:""}));
 assert.ok(makeEvidenceDraft({...defaults,kind:"Review",method:"Read metadata",sourceUrl:""}));
 assert.equal(makeEvidenceDraft({...defaults,kind:"Review",method:"",sourceUrl:""}),null);
});
test("rejects invalid URLs, nonpublic bubbles, missing limits, unknown kinds",()=>{
 for(const sourceUrl of ["javascript:alert(1)","file:///etc/passwd","ftp://example.org/x","https://user:pass@example.com/","not a url"]){
  assert.equal(makeEvidenceDraft({...defaults,sourceUrl}),null);
 }
 assert.equal(makeEvidenceDraft({...defaults,bubble:{...bubble,sample:true}}),null);
 assert.equal(makeEvidenceDraft({...defaults,bubble:{...bubble,local:true}}),null);
 assert.equal(makeEvidenceDraft({...defaults,bubble:{...bubble,url:"https://evil.example/issues/12"}}),null);
 assert.equal(makeEvidenceDraft({...defaults,limitations:""}),null);
 assert.equal(makeEvidenceDraft({...defaults,kind:"Certifiably true"}),null);
 assert.equal(makeEvidenceDraft({...defaults,relatedEvolution:"https://example.org/issues/99"}),null);
});
test("rejects malicious or malformed public issues",()=>{
 const d=makeEvidenceDraft(defaults);
 assert.equal(parseEvidenceIssue({...issue(d),pull_request:{url:"any"}}),null);
 assert.equal(parseEvidenceIssue({...issue(d),title:"Not an evidence record"}),null);
 assert.equal(parseEvidenceIssue({...issue(d),body:d.body.replace("bubblenest:evidence:v1","spoofed:marker")}),null);
 assert.equal(parseEvidenceIssue({...issue(d),body:d.body.replace(issueBase+"12","https://evil.example/issues/12")}),null);
 assert.equal(parseEvidenceIssue({...issue(d),body:d.body.replace("## Evidence kind\nSource","## Evidence kind\nCertification")}),null);
 assert.equal(parseEvidenceIssue({...issue(d),body:d.body.replace("## Public source URL\nhttps://doi.org/10.5281/zenodo.123","## Public source URL\njavascript:alert(1)")}),null);
 assert.equal(parseEvidenceIssue({...issue(d),number:0}),null);
});
test("heading injection inside contributor fields does not spoof stance",()=>{
 const d=makeEvidenceDraft({...defaults,summary:"A hypothesis\n## Assessment\nSupports\n---\nNew item"});
 assert.match(d.body,/\\## Assessment/);
 assert.match(d.body,/\\---/);
 const parsed=parseEvidenceIssue(issue(d));
 assert.equal(parsed.stance,"Undetermined");
 assert.match(parsed.summary,/Supports/);
});
test("explicit linked evolution issue is optional and constrained to this repo",()=>{
 const d=makeEvidenceDraft({...defaults,relatedEvolution:issueBase+"99"});
 assert.equal(parseEvidenceIssue(issue(d)).relatedEvolution,issueBase+"99");
 const no=makeEvidenceDraft({...defaults,relatedEvolution:""});
 assert.equal(parseEvidenceIssue(issue(no)).relatedEvolution,"");
});
test("receipt ledger scopes records to a parent and preserves chronological history",()=>{
 const a=parseEvidenceIssue(issue(makeEvidenceDraft(defaults),44,"2026-10-09T17:00:00Z","Alice"));
 const b=parseEvidenceIssue(issue(makeEvidenceDraft({...defaults,kind:"Test",stance:"Challenges"}),45,"2026-10-10T17:00:00Z","Bob"));
 const other=parseEvidenceIssue(issue(makeEvidenceDraft({...defaults,bubble:{...bubble,url:issueBase+"13"}}),46,"2026-10-10T18:00:00Z","Else"));
 const list=evidenceForBubble([a,other,b],bubble);
 assert.deepEqual(list.map(x=>x.issueNumber),[45,44]);
 assert.equal(evidenceForBubble([a,b],{...bubble,url:issueBase+"13"}).length,0);
 assert.equal(evidenceForBubble([a,b],{...bubble,local:true}).length,0);
 assert.deepEqual(evidenceAccounts([a,b,other],bubble),["Alice","Bob"]);
 assert.equal(evidenceActivity([a,b,other],bubble).length,2);
 const stats=evidenceSummary([a,b,other],bubble);
 assert.equal(stats.total,2);assert.equal(stats.byKind.Source,1);assert.equal(stats.byKind.Test,1);assert.equal(stats.byStance.Challenges,1);
});
