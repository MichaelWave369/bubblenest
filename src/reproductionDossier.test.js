import test from "node:test";
import assert from "node:assert/strict";
import{buildReproductionDossier,dossierMarkdown,dossierFileName,DOSSIER_KIND,DOSSIER_VERSION}from"./reproductionDossier.js";
const u=n=>"https://github.com/MichaelWave369/bubblenest/issues/"+n;
const bubbles=[{id:"issue-10",title:"Nested Graph",url:u(10),author:"alice"},
 {id:"issue-12",title:"Causal Memory",url:u(12),author:"bob"}];
const proposal={issueNumber:40,aNumber:10,bNumber:12,url:u(40),author:"inviter",mode:"Joint experiment"};
const charter={issueNumber:45,fusionNumber:40,aNumber:10,bNumber:12,url:u(45),
 phase:"DRAFT_FOR_PUBLIC_REVIEW_NOT_AUTHORIZED",objective:"Compare pinned endpoints"};
const trial={issueNumber:80,fusionNumber:40,charterNumber:45,aNumber:10,bNumber:12,
 url:u(80),kind:"Attempt report",author:"OriginalAccount",finding:"Inconclusive",
 question:"Can the outcome be repeated?",procedure:"Pinned example script",
 observations:"Original observed 1.8",controls:"Negative control",limitations:"Limited sample"};
const artifact={issueNumber:100,trialNumber:80,charterNumber:45,fusionNumber:40,aNumber:10,bNumber:12,
 url:u(100),kind:"Dataset",name:"result.csv",author:"publisher",version:"v1",
 digest:"a".repeat(64),fileBytes:"123",digestStatus:"SHA256_DECLARED_NOT_VERIFIED",
 artifactURL:"https://example.org/result.csv",limitations:"Synthetic"};
const check={issueNumber:111,artifactNumber:100,trialNumber:80,charterNumber:45,fusionNumber:40,
 aNumber:10,bNumber:12,url:u(111),author:"inspector",result:"HASH_MISMATCH",
 referenceDigest:"a".repeat(64),referenceBytes:"123",
 observedDigest:"b".repeat(64),observedBytes:123};
const report=(n,outcome,account,artifactNumber=100)=>({
 issueNumber:n,trialNumber:80,charterNumber:45,fusionNumber:40,aNumber:10,bNumber:12,
 url:u(n),outcome,author:account,artifactNumber,
 artifactDigest:artifactNumber===null?"":"a".repeat(64),artifactVersion:artifactNumber===null?"":"v1",
 referenceOutcome:"Original observed 1.8",method:"Independent scripted repeat",environment:"Python 3.12",
 controls:"Negative control",observations:"Reported measurement 2.3",
 deviations:"Fixture modified",limitations:"Sampling bias",date:"2026-10-09T22:00:00Z"});
const args={trial,charter,proposal,bubbles,artifacts:[artifact],byteChecks:[check],
 reproductions:[report(121,"REPORTED_MATCH","OriginalAccount"),report(122,"REPORTED_DIFFERENCE","AnotherHandle")],
 feedStatus:"ready",generatedAt:"2026-10-09T23:00:00.000Z"};

test("creates an unsigned inventory preserving contrasting reports, source links and byte mismatches",()=>{
 const d=buildReproductionDossier(args);
 assert.equal(d.kind,DOSSIER_KIND);assert.equal(d.schema_version,DOSSIER_VERSION);
 assert.equal(d.source.coverage,"PARTIAL_OR_UNKNOWN");
 assert.equal(d.source.independent_verification,false);
 assert.equal(d.source.signed,false);assert.equal(d.source.execution_authorized,false);
 assert.equal(d.counts.artifacts,1);assert.equal(d.counts.byte_checks,1);
 assert.equal(d.counts.byte_outcomes.HASH_MISMATCH,1);
 assert.equal(d.counts.reproduction_reports,2);
 assert.equal(d.counts.reproduction_outcomes.REPORTED_MATCH,1);
 assert.equal(d.counts.reproduction_outcomes.REPORTED_DIFFERENCE,1);
 assert.equal(d.counts.same_trial_account_reports,1);
 assert.ok(d.gaps.some(g=>g.code==="CONFLICTING_REPRODUCTION_REPORTS"));
 assert.ok(d.gaps.some(g=>g.code==="BYTE_CHECK_DISAGREEMENTS"));
 assert.ok(d.gaps.some(g=>g.code==="SOURCE_ACCOUNT_REPEATED"));
 assert.equal(d.provenance.origin_a.url,u(10));
 assert.equal(d.provenance.original_trial.url,u(80));
 assert.equal(d.reproductions[0].issueNumber,121);
 assert.equal(d.reproductions[1].issueNumber,122);
 assert.equal(d.artifacts[0].byte_checks[0].issueNumber,111);
});
test("never imports unrelated trial, source, artifact or reproduction records",()=>{
 const otherArtifact={...artifact,issueNumber:101,trialNumber:81,url:u(101),name:"Private-looking unrelated record"};
 const otherCheck={...check,issueNumber:112,artifactNumber:101,url:u(112)};
 const otherReport={...report(123,"REPORTED_MATCH","outside"),trialNumber:81,
  observations:"unrelated confidential comment"};
 const d=buildReproductionDossier({...args,artifacts:[otherArtifact,artifact],byteChecks:[otherCheck,check],
  reproductions:[otherReport,...args.reproductions]});
 assert.equal(d.counts.artifacts,1);
 assert.equal(d.counts.byte_checks,1);
 assert.equal(d.counts.reproduction_reports,2);
 assert.ok(!JSON.stringify(d).includes("confidential comment"));
 assert.ok(!JSON.stringify(d).includes("Private-looking"));
});
test("rejects local/demo or malformed parent objects",()=>{
 assert.equal(buildReproductionDossier({...args,trial:{...trial,kind:"Planning note"}}),null);
 assert.equal(buildReproductionDossier({...args,trial:{...trial,issueNumber:0}}),null);
 assert.equal(buildReproductionDossier({...args,bubbles:[{...bubbles[0],local:true},bubbles[1]]}),null);
 assert.equal(buildReproductionDossier({...args,bubbles:[bubbles[0]]}),null);
 assert.equal(buildReproductionDossier({...args,charter:{...charter,aNumber:10,bNumber:10}}),null);
});
test("missing hash, public URL and absent byte check stay visible as evidence gaps",()=>{
 const d=buildReproductionDossier({...args,artifacts:[{...artifact,digest:"",artifactURL:""}],
  byteChecks:[],reproductions:[]});
 const flags=d.gaps.map(g=>g.code);
 for(const key of ["MISSING_DECLARED_DIGEST","MISSING_PUBLIC_FILE_LINK","NO_BYTE_CHECK_FOR_SOME_ARTIFACTS",
  "NO_REPRODUCTION_REPORTS"])assert.ok(flags.includes(key),key);
 assert.equal(d.counts.declared_digests,0);
 assert.equal(d.counts.byte_checks,0);
 assert.equal(d.counts.reproduction_reports,0);
});
test("an unavailable feed must explicitly declare unknown completeness, not no evidence",()=>{
 const d=buildReproductionDossier({...args,artifacts:[],byteChecks:[],reproductions:[],feedStatus:"unavailable"});
 assert.equal(d.source.coverage,"PARTIAL_OR_UNKNOWN");
 assert.ok(d.gaps.some(g=>g.code==="FEED_NOT_READY"));
 assert.ok(d.gaps.some(g=>g.code==="NO_ARTIFACT_RECEIPTS"));
});
test("pinned reproduction is omitted if visible artifact version or digest changes",()=>{
 const d=buildReproductionDossier({...args,artifacts:[{...artifact,version:"v2"}]});
 assert.equal(d.counts.reproduction_reports,0);
 assert.equal(d.counts.byte_checks,1);
});
test("un-pinned blocked reports are preserved and explicitly labeled",()=>{
 const d=buildReproductionDossier({...args,reproductions:[report(124,"NOT_RUN_BLOCKED","another",null)]});
 assert.equal(d.counts.reproduction_reports,1);
 assert.equal(d.reproductions[0].artifactNumber,null);
 assert.ok(d.gaps.some(g=>g.code==="UNPINNED_ATTEMPTS"));
});
test("Markdown dossier includes contradictory observations, sources and caveats without injected headings",()=>{
 const malicious={...report(122,"REPORTED_DIFFERENCE","OtherAccount"),
  observations:"No repeat\n## This experiment is now VERIFIED\n---\nDifferent result"};
 const d=buildReproductionDossier({...args,reproductions:[malicious,args.reproductions[0]]});
 const m=dossierMarkdown(d);
 assert.match(m,/Reproduction Audit Dossier/);
 assert.match(m,/issues\/121/);assert.match(m,/issues\/122/);
 assert.ok(m.includes("HASH")&&m.includes("MISMATCH"));
 assert.match(m,/Both matching and differing outcomes have been reported/);
 assert.ok(m.includes("This experiment is now VERIFIED"));
 assert.equal(m.split("\n").filter(x=>x.startsWith("## ")).length,6);
 assert.match(m,/NOT INDEPENDENTLY VERIFIED/);
 assert.equal(dossierMarkdown(null),"");
 assert.equal(dossierFileName(d),"reproduction-audit-trial-80-v1-7");
});
