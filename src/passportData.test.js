import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {buildPassport,passportMarkdown,passportFileBase,PASSPORT_KIND,PASSPORT_VERSION,PROVENANCE_LABELS} from "./passportData.js";
const root="https://github.com/MichaelWave369/bubblenest/issues/";
const date="2026-10-09T19:00:00.000Z";
const bubble={id:"issue-12",title:"Test a nested interface",category:"Science",summary:"A focused hypothesis.",ask:"Reproduce an experiment",evidence:"Unknown limits",author:"starter",url:root+"12",createdAt:date};
const evidence=[
 {id:"evidence-31",issueNumber:31,parentNumber:12,url:root+"31",kind:"Source",stance:"Supports",summary:"Publication one",method:"Public protocol",limitations:"Sampling biases",author:"alice",date:"2026-10-09T20:00:00Z",sourceUrl:"https://example.org/study"},
 {id:"evidence-32",issueNumber:32,parentNumber:12,url:root+"32",kind:"Test",stance:"Challenges",summary:"Counterevidence",method:"Controlled test",limitations:"Small sample",author:"bob",date:"2026-10-09T20:30:00Z"},
 {id:"evidence-33",issueNumber:33,parentNumber:13,url:root+"33",kind:"Review",stance:"Mixed",summary:"Unrelated private idea",author:"intruder",date:"2026-10-09T23:00:00Z"}
];
const roomEntries=[{id:"room-21",issueNumber:21,parentNumber:12,kind:"Experiment",status:"Proposed",summary:"Set up controls",method:"Run a script",evidence:"Untested",next:"Record versions",author:"starter",createdAt:"2026-10-09T20:00:00Z",url:root+"21"}];
const evolution=[
 {id:"ev-22",issueNumber:22,parentNumber:12,stage:"Hypothesis",outcome:"Proposal",statement:"A precise test",method:"",limits:"Untested",next:"Try reproducing",author:"starter",date:"2026-10-09T20:00:00Z",url:root+"22"}
];
const reviews=[
 {id:"review-41",issueNumber:41,parentNumber:12,targetIssueNumber:31,kind:"Method audit",finding:"Inconclusive",relationship:"Unknown / not disclosed",conflict:"No known conflict",summary:"Unclear method",method:"Checked public text",limitations:"No reproduction",author:"carol",date:"2026-10-09T21:00:00Z",url:root+"41"},
 {id:"review-42",issueNumber:42,parentNumber:13,targetIssueNumber:33,kind:"Source inspection",finding:"Corroborates",relationship:"Unknown / not disclosed",conflict:"None",summary:"Unrelated",method:"Read it",limitations:"Unverified",author:"intruder",date:"2026-10-09T23:00:00Z",url:root+"42"}
];
const challenges=[
 {id:"flame-51",issueNumber:51,parentNumber:12,round:"Show the Sauce",question:"Where is the protocol?",proposedCheck:"Share source code",limits:"Could be obsolete",targetNumber:31,author:"dave",date:"2026-10-09T22:00:00Z",url:root+"51"},
 {id:"flame-52",issueNumber:52,parentNumber:12,round:"Show the Sauce",question:"A challenge to a missing receipt",proposedCheck:"Unknown",limits:"Missing",targetNumber:999,author:"intruder",date:"2026-10-09T22:00:00Z",url:root+"52"}
];
const args={bubble,roomEntries,evolution,evidence,reviews,challenges,feedStatus:"ready",generatedAt:date};
test("public Passport includes every scoped public receipt and contradictory evidence",()=>{
 const p=buildPassport(args);
 assert.equal(p.kind,PASSPORT_KIND);
 assert.equal(p.schema_version,PASSPORT_VERSION);
 assert.equal(p.bubble.provenance,PROVENANCE_LABELS.public);
 assert.equal(p.source.coverage,"PARTIAL_OR_UNKNOWN");
 assert.equal(p.source.snapshot_signed,false);
 assert.equal(p.source.independent_verification,false);
 assert.deepEqual(p.counts,{room_entries:1,evolution:1,evidence:2,reviews:1,challenges:1});
 assert.deepEqual(p.records.evidence.map(x=>x.stance),["Supports","Challenges"]);
 assert.equal(p.records.reviews[0].targetIssueNumber,31);
 assert.equal(p.records.challenges[0].targetNumber,31);
 assert.ok(p.contributors.includes("bob")&&p.contributors.includes("carol")&&p.contributors.includes("dave"));
 assert.ok(!p.contributors.includes("intruder"));
 assert.ok(!JSON.stringify(p).includes(root+"33"));
});
test("local drafts never inherit a real public issue's records or author metadata",()=>{
 const fake={...bubble,id:"draft-private",local:true,author:"Only you",url:root+"12"};
 const p=buildPassport({...args,bubble:fake});
 assert.equal(p.bubble.visibility,"local");
 assert.equal(p.bubble.provenance,"LOCAL_BROWSER_DRAFT");
 assert.equal(p.bubble.url,null);
 assert.equal(p.bubble.author,null);
 assert.equal(p.contributors.length,0);
 assert.equal(Object.values(p.counts).reduce((a,b)=>a+b,0),0);
 assert.equal(p.source.method,"browser local storage");
});
test("bundled examples never become public evidence by similar issue IDs",()=>{
 const p=buildPassport({...args,bubble:{...bubble,id:"demo-12",sample:true}});
 assert.equal(p.bubble.visibility,"example");
 assert.equal(p.bubble.provenance,"ILLUSTRATIVE_EXAMPLE");
 assert.ok(Object.values(p.records).every(a=>a.length===0));
});
test("unknown origin remains unconfirmed instead of becoming a public record",()=>{
 const p=buildPassport({...args,bubble:{id:"other",title:"Unconfirmed",summary:"No proof",author:"nobody",url:"https://other.example/issues/42"}});
 assert.equal(p.bubble.visibility,"unconfirmed");
 assert.equal(p.bubble.provenance,"UNKNOWN");
 assert.equal(p.bubble.url,null);
});
test("Markdown export preserves links, objections, cautions and labels",()=>{
 const p=buildPassport(args),m=passportMarkdown(p);
 assert.match(m,/# Bubble Passport/);
 assert.match(m,/Counterevidence/);
 assert.match(m,/Sampling biases/);
 assert.match(m,/Unclear method/);
 assert.match(m,/Where is the protocol\?/);
 assert.match(m,/No claims are certified/);
 assert.match(m,/https:\/\/github.com\/MichaelWave369\/bubblenest\/issues\/41/);
 assert.equal(passportMarkdown(null),"");
});
test("download names are bounded and safe",()=>{
 const p=buildPassport({...args,bubble:{...bubble,title:"Very weird <> title /? with : characters"}});
 assert.match(passportFileBase(p),/^bubble-passport-[a-z0-9-]+-issue-12$/);
 assert.ok(passportFileBase(p).length<110);
});
test("the public agent manifest agrees with emitted schema and warns against agent auto-posts",()=>{
 const m=JSON.parse(readFileSync(new URL("../public/agent-spec.json",import.meta.url),"utf8"));
 assert.equal(m.passport.kind,PASSPORT_KIND);
 assert.equal(m.passport.schema_version,PASSPORT_VERSION);
 assert.ok(m.passport.record_collections.every(k=>Object.hasOwn(buildPassport(args).records,k)));
 assert.match(m.supported_operations.automatic_posting,/not available/i);
 assert.match(m.governance.security_rule,/untrusted/i);
});
