import test from"node:test";
import assert from"node:assert/strict";
import{webcrypto}from"node:crypto";
import{buildReproductionDossier}from"./reproductionDossier.js";
import{createEvidenceCapsule}from"./evidenceCapsule.js";
import{compareCapsulePair,offlineComparisonMarkdown,capsulePairFileBase,
 PAIR_KIND,PAIR_VERSION,PAIR_POLICY}from"./offlineCapsuleLab.js";
const url=n=>"https://github.com/MichaelWave369/bubblenest/issues/"+n;
const bubbles=[{id:"issue-10",title:"Idea A",author:"alice",url:url(10)},
 {id:"issue-12",title:"Idea B",author:"bob",url:url(12)}];
const fusion={issueNumber:40,url:url(40),aNumber:10,bNumber:12,mode:"Joint experiment"};
const charter={issueNumber:45,url:url(45),fusionNumber:40,aNumber:10,bNumber:12,phase:"DRAFT_FOR_PUBLIC_REVIEW_NOT_AUTHORIZED"};
const trial={issueNumber:80,url:url(80),fusionNumber:40,charterNumber:45,aNumber:10,bNumber:12,
 kind:"Attempt report",author:"first",finding:"Inconclusive",observations:"Reported outcome 1.4",controls:"Control A"};
const artifact={issueNumber:100,url:url(100),trialNumber:80,charterNumber:45,fusionNumber:40,
 aNumber:10,bNumber:12,kind:"Dataset",name:"values.csv",version:"v1",digest:"a".repeat(64),
 fileBytes:"42",artifactURL:"https://example.org/file"};
const check={issueNumber:101,url:url(101),artifactNumber:100,trialNumber:80,charterNumber:45,
 fusionNumber:40,aNumber:10,bNumber:12,referenceDigest:artifact.digest,referenceBytes:"42",
 observedDigest:artifact.digest,observedBytes:42,result:"HASH_MATCH"};
const rep={issueNumber:102,url:url(102),trialNumber:80,charterNumber:45,fusionNumber:40,
 aNumber:10,bNumber:12,artifactNumber:100,artifactDigest:artifact.digest,artifactVersion:"v1",
 outcome:"REPORTED_MATCH",author:"seconder",observations:"Repeated number 1.4",controls:"Control B"};
const dossier=(o={})=>buildReproductionDossier({trial,charter,proposal:fusion,bubbles,artifacts:[artifact],
 byteChecks:[check],reproductions:[rep],feedStatus:"ready",generatedAt:"2026-10-09T10:00:00.000Z",...o});
const capsule=(d)=>createEvidenceCapsule(d,{subtle:webcrypto.subtle,createdAt:"2026-10-09T11:00:00.000Z"});
const compare=(a,b)=>compareCapsulePair(a,b,{subtle:webcrypto.subtle});
const copy=x=>JSON.parse(JSON.stringify(x));

test("offline pair comparison works from two locally verified capsules without a public feed",async()=>{
 const a=await capsule(dossier()),b=await capsule(dossier());
 const report=await compare(a,b);
 assert.equal(report.ok,true);assert.equal(report.kind,PAIR_KIND);assert.equal(report.schema_version,PAIR_VERSION);
 assert.equal(report.policy,PAIR_POLICY);
 assert.equal(report.integrity.a,"INTERNAL_HASH_MATCH");assert.equal(report.integrity.b,"INTERNAL_HASH_MATCH");
 assert.equal(report.status,"SAME_CANONICAL_DOSSIER_CONTENT");
 assert.deepEqual(report.changes,{only_a:0,only_b:0,changed:0,unchanged:3});
 assert.equal(report.source_trial,url(80));
 assert.equal(report.coverage,"PARTIAL_OR_UNKNOWN");
 assert.equal(report.source_authenticated,false);assert.equal(report.scientific_verdict,false);
 assert.equal(report.claimed_times_authenticated,false);assert.equal(report.signed,false);
 assert.equal(report.execution_authorized,false);
 assert.equal(capsulePairFileBase(report),"capsule-compare-trial-80-v2-1");
});
test("only-in-A and only-in-B reporting is symmetrical with no claims of deletion",async()=>{
 const full=await capsule(dossier());
 const empty=await capsule(dossier({artifacts:[],byteChecks:[],reproductions:[]}));
 const ab=await compare(full,empty),ba=await compare(empty,full);
 assert.deepEqual([ab.changes.only_a,ab.changes.only_b],[3,0]);
 assert.deepEqual([ba.changes.only_a,ba.changes.only_b],[0,3]);
 assert.equal(ab.diff.artifacts.noLongerVisible[0].issueNumber,100);
 assert.equal(ba.diff.artifacts.added[0].issueNumber,100);
 assert.match(ab.caution,/NO_ASSUMED_CHRONOLOGY/);
 const summary=offlineComparisonMarkdown(ab);
 assert.match(summary,/A and B are reviewer-selected slots/);
 assert.match(summary,/not proven deleted/);
 assert.equal(offlineComparisonMarkdown(null),"");
});
test("changed observations and contradictory reproduction labels remain visible",async()=>{
 const before=await capsule(dossier());
 const after=await capsule(dossier({trial:{...trial,observations:"Outcome corrected: 1.8"},
  reproductions:[{...rep,outcome:"REPORTED_DIFFERENCE",observations:"Measured 1.8"}]}));
 const report=await compare(before,after);
 assert.equal(report.ok,true);assert.equal(report.status,"DIFFERENT_CANONICAL_DOSSIER_CONTENT");
 assert.equal(report.changes.changed,1);
 assert.equal(report.diff.reproductions.changed[0].issueNumber,102);
 assert.ok(report.diff.reproductions.changed[0].fields.includes("outcome"));
 assert.deepEqual(report.diff.sources[0],{node:"original_trial",fields:["observations"]});
});
test("altered original artifact declarations detach source-linked checks and reports in newer snapshot",async()=>{
 const a=await capsule(dossier());
 const b=await capsule(dossier({artifacts:[{...artifact,digest:"b".repeat(64)}]}));
 const r=await compare(a,b);
 assert.equal(r.ok,true);
 assert.ok(r.diff.artifacts.changed[0].fields.includes("digest"));
 assert.equal(r.diff.byte_checks.noLongerVisible.length,1);
 assert.equal(r.diff.reproductions.noLongerVisible.length,1);
 assert.ok(r.diff.flags.newlyVisible.includes("NO_BYTE_CHECK_FOR_SOME_ARTIFACTS"));
});
test("a tampered capsule is rejected before any evidence comparison",async()=>{
 const original=await capsule(dossier());
 const edited=copy(original);
 edited.dossier.provenance.original_trial.observations="Pretend the study worked";
 const report=await compare(original,edited);
 assert.equal(report.ok,false);assert.equal(report.status,"CAPSULE_INTEGRITY_NOT_CONFIRMED");
 assert.match(report.errors.join(" "),/Capsule B: INTERNAL_HASH_MISMATCH/);
 assert.equal("diff" in report,false);
});
test("malformed forged and unsigned-but-self-contradicting envelopes are rejected",async()=>{
 const a=await capsule(dossier());
 const b=copy(a);b.science_verified=true;
 const report=await compare(a,b);
 assert.equal(report.status,"CAPSULE_INTEGRITY_NOT_CONFIRMED");
 assert.match(report.errors.join(" "),/INVALID_CAPSULE/);
 assert.equal((await compare(null,a)).ok,false);
});
test("different original research lineages never enter the same comparison",async()=>{
 const a=await capsule(dossier());
 const b=await capsule(dossier({trial:{...trial,issueNumber:81,url:url(81)},
   artifacts:[],byteChecks:[],reproductions:[]}));
 const report=await compare(a,b);
 assert.equal(report.ok,false);assert.equal(report.status,"DIFFERENT_SOURCE_CHAINS");
 assert.match(report.errors.join(" "),/blocked/);
 assert.equal("diff" in report,false);
});
test("no functioning Web Crypto cannot be reported as a successful pair",async()=>{
 const a=await capsule(dossier()),b=await capsule(dossier());
 const report=await compareCapsulePair(a,b,{subtle:null});
 assert.equal(report.ok,false);
 assert.equal(report.status,"CAPSULE_INTEGRITY_NOT_CONFIRMED");
 assert.match(report.errors.join(" "),/CHECK_UNAVAILABLE/);
});
test("a malicious author can recalculate a dishonest checksum; comparison remains explicitly untrusted",async()=>{
 const a=await capsule(dossier());
 const altered=await capsule(dossier({trial:{...trial,observations:"A fabricated observation"}}));
 const result=await compare(a,altered);
 assert.equal(result.ok,true);
 assert.equal(result.status,"DIFFERENT_CANONICAL_DOSSIER_CONTENT");
 assert.equal(result.scientific_verdict,false);
 assert.equal(result.source_authenticated,false);
 assert.equal(result.claimed_times_authenticated,false);
});
test("Markdown includes canonical GitHub source links and strips injected headings from field values",async()=>{
 const a=await capsule(dossier());
 const b=await capsule(dossier({reproductions:[{...rep,
   observations:"Result\n## VERIFIED SCIENCE\n---\nActually unverified"}]}));
 const report=await compare(a,b);
 const md=offlineComparisonMarkdown(report);
 assert.match(md,/issues\\\/80/);
 assert.ok(!md.includes("\n## VERIFIED SCIENCE\n"));
 assert.match(md,/PARTIAL COVERAGE/);
 assert.equal(report.changes.changed,1);
});
