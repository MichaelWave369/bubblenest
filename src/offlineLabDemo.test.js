import test from"node:test";
import assert from"node:assert/strict";
import{webcrypto}from"node:crypto";
import{makeSyntheticDossier,makeSyntheticCapsulePair,runSyntheticLabSelfTest,
 isSyntheticCapsule,DEMO_MARKER,DEMO_LABEL,DEMO_CREATED_AT}from"./offlineLabDemo.js";
import{validateDossierImport}from"./dossierDiff.js";
import{verifyEvidenceCapsule,createEvidenceCapsule,sameCapsuleChain}from"./evidenceCapsule.js";
import{compareCapsulePair,offlineComparisonMarkdown}from"./offlineCapsuleLab.js";
const options={subtle:webcrypto.subtle};
test("both fixtures are clearly marked fictional, use isolated high Issue placeholders and pass import schema",()=>{
 const a=makeSyntheticDossier("A"),b=makeSyntheticDossier("B");
 for(const x of [a,b]){
  assert.equal(validateDossierImport(x).ok,true);
  assert.equal(x.synthetic_demo.kind,DEMO_MARKER);
  assert.equal(x.synthetic_demo.published_issues,false);
  assert.equal(x.synthetic_demo.real_measurements,false);
  assert.match(x.synthetic_demo.display_label,/SYNTHETIC/);
  assert.match(x.source.system,/SYNTHETIC/);
  assert.ok(x.provenance.original_trial.issueNumber>90000000);
  assert.equal(x.generated_at,DEMO_CREATED_AT);
  assert.equal(x.source.coverage,"PARTIAL_OR_UNKNOWN");
  assert.equal(x.counts.artifacts,1);
  assert.equal(x.counts.byte_checks,1);
  assert.ok(!x.source.signed);
 }
 assert.equal(a.provenance.original_trial.url,b.provenance.original_trial.url);
 assert.equal(a.synthetic_demo.variant,"A");
 assert.equal(b.synthetic_demo.variant,"B");
 assert.notEqual(a.provenance.original_trial.observations,b.provenance.original_trial.observations);
 assert.throws(()=>makeSyntheticDossier("C"),/Unknown demo variant/);
});
test("reproducible local synthetic capsules need no fetch and verify canonical SHA-256",async()=>{
 const {a,b}=await makeSyntheticCapsulePair(options);
 for(const x of [a,b]){
  assert.equal(isSyntheticCapsule(x),true);
  assert.equal((await verifyEvidenceCapsule(x,options)).status,"INTERNAL_HASH_MATCH");
  assert.equal(x.signed,false);assert.equal(x.science_verified,false);
  assert.equal(x.source_authenticated,false);assert.equal(x.execution_authorized,false);
  assert.equal(x.coverage,"PARTIAL_OR_UNKNOWN");
  assert.equal(x.created_at,DEMO_CREATED_AT);
 }
 assert.equal(sameCapsuleChain(a.dossier,b.dossier),true);
 const repeat=await makeSyntheticCapsulePair(options);
 assert.equal(a.fingerprint.digest,repeat.a.fingerprint.digest);
 assert.equal(b.fingerprint.digest,repeat.b.fingerprint.digest);
});
test("self-test demonstrates changed observation, opposing byte result, and a B-only blocked report",async()=>{
 const r=await runSyntheticLabSelfTest(options);
 assert.equal(r.synthetic,true);assert.equal(r.ok,true);
 assert.equal(r.scope,"LOCAL_ALGORITHMS_ONLY_NOT_OFFLINE_RELOAD_OR_SCIENTIFIC_VALIDATION");
 assert.equal(r.checks.length,4);
 assert.ok(r.checks.every(x=>x.pass));
 const diff=r.report;
 assert.equal(diff.synthetic_demonstration,"SYNTHETIC DEMONSTRATION, NO PUBLISHED GITHUB ISSUES");
 assert.equal(diff.changes.only_a,0);
 assert.equal(diff.changes.only_b,1);
 assert.equal(diff.changes.changed,2);
 assert.equal(diff.diff.byte_checks.changed.length,1);
 assert.equal(diff.diff.reproductions.changed.length,1);
 assert.ok(diff.diff.sources[0].fields.includes("observations"));
 assert.equal(diff.scientific_verdict,false);
 assert.equal(diff.source_authenticated,false);
});
test("tampered training capsule is rejected without its checksum being recomputed",async()=>{
 const {b}=await makeSyntheticCapsulePair(options);
 const copy=JSON.parse(JSON.stringify(b));
 copy.dossier.provenance.original_trial.observations="FORGED";
 assert.equal((await verifyEvidenceCapsule(copy,options)).status,"INTERNAL_HASH_MISMATCH");
 const {a}=await makeSyntheticCapsulePair(options);
 const compared=await compareCapsulePair(a,copy,options);
 assert.equal(compared.ok,false);
 assert.equal(compared.status,"CAPSULE_INTEGRITY_NOT_CONFIRMED");
});
test("synthetic training capsules cannot silently mix with a research-labeled capsule",async()=>{
 const {a,b}=await makeSyntheticCapsulePair(options);
 const realLabel=JSON.parse(JSON.stringify(b));
 delete realLabel.dossier.synthetic_demo;
 const recalc=await createEvidenceCapsule(realLabel.dossier,{
  subtle:webcrypto.subtle,createdAt:DEMO_CREATED_AT
 });
 assert.equal((await verifyEvidenceCapsule(recalc,options)).ok,true);
 const compared=await compareCapsulePair(a,recalc,options);
 assert.equal(compared.ok,false);
 assert.equal(compared.status,"SYNTHETIC_REAL_MIX_BLOCKED");
 const foreignTag=JSON.parse(JSON.stringify(b));
 foreignTag.dossier.synthetic_demo.kind="other.demo";
 const altered=await createEvidenceCapsule(foreignTag.dossier,{
  subtle:webcrypto.subtle,createdAt:DEMO_CREATED_AT
 });
 assert.equal((await compareCapsulePair(a,altered,options)).status,"SYNTHETIC_REAL_MIX_BLOCKED");
});
test("synthetic reports and exported Markdown always disclose fictional and non-authenticated status",async()=>{
 const {a,b}=await makeSyntheticCapsulePair(options);
 const result=await compareCapsulePair(a,b,options);
 assert.equal(result.ok,true);
 const markdown=offlineComparisonMarkdown(result);
 assert.match(markdown,/SYNTHETIC TRAINING COMPARISON/);
 assert.match(markdown,/fictional placeholders/);
 assert.match(markdown,/NO AUTHENTICATED TIMELINE/);
 assert.match(markdown,/not proven deleted/);
 assert.match(DEMO_LABEL,/NOT GITHUB RESEARCH/);
 assert.ok(JSON.stringify(result).includes("synthetic_demonstration"));
});
test("missing Web Crypto fails closed without implying an offline browser reload was proven",async()=>{
 await assert.rejects(()=>makeSyntheticCapsulePair({subtle:null}),/SHA-256|available/);
 const r=await runSyntheticLabSelfTest(options);
 assert.equal("offline_reload_verified" in r,false);
 assert.equal(r.scope.includes("NOT_OFFLINE_RELOAD"),true);
});
