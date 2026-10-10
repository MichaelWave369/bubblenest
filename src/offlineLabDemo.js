// Offline Lab v2.3: entirely SYNTHETIC fixtures, with no GitHub fetch or real research claims.
// Links deliberately use non-published high Issue numbers to satisfy legacy source-link grammar.
// They are not real GitHub Issue references, must never be published as evidence.
import {buildReproductionDossier} from "./reproductionDossier.js";
import {createEvidenceCapsule,verifyEvidenceCapsule} from "./evidenceCapsule.js";
import {compareCapsulePair} from "./offlineCapsuleLab.js";
export const DEMO_LABEL="SYNTHETIC DEMONSTRATION · NOT GITHUB RESEARCH";
export const DEMO_MARKER="bubblenest.synthetic-offline-self-test.v1";
export const DEMO_CREATED_AT="2000-01-01T00:00:00.000Z"; // Frozen fixture time; NOT historical evidence.
const link=n=>"https://github.com/MichaelWave369/bubblenest/issues/"+n;
const ids={a:99000010,b:99000012,fusion:99000040,charter:99000045,trial:99000080,
 artifact:99000100,check:99000101,repro:99000102,blocked:99000103};
const sha="a".repeat(64);
function seed(){
 const bubbles=[{id:"issue-"+ids.a,title:"SYNTHETIC SOURCE A · test-only idea",author:"synthetic-demo-a",url:link(ids.a)},
  {id:"issue-"+ids.b,title:"SYNTHETIC SOURCE B · test-only idea",author:"synthetic-demo-b",url:link(ids.b)}];
 const proposal={issueNumber:ids.fusion,aNumber:ids.a,bNumber:ids.b,url:link(ids.fusion),
  mode:"Joint experiment",question:"SYNTHETIC ONLY: illustrate trial comparison",author:"synthetic-demonstrator"};
 const charter={issueNumber:ids.charter,fusionNumber:ids.fusion,aNumber:ids.a,bNumber:ids.b,
  url:link(ids.charter),phase:"DRAFT_FOR_PUBLIC_REVIEW_NOT_AUTHORIZED",objective:"No real experiment exists"};
 const trial={issueNumber:ids.trial,fusionNumber:ids.fusion,charterNumber:ids.charter,
  aNumber:ids.a,bNumber:ids.b,url:link(ids.trial),kind:"Attempt report",author:"synthetic-original-account",
  date:DEMO_CREATED_AT,finding:"Inconclusive",question:"SYNTHETIC: illustrative instrument reading",
  procedure:"Fixture data only. No program or scientific procedure was executed.",
  observations:"SYNTHETIC A: claimed measurement 1.4",controls:"Fictional control A",
  limitations:"DEMO ONLY. No measurements were actually taken."};
 const artifact={issueNumber:ids.artifact,trialNumber:ids.trial,charterNumber:ids.charter,
  fusionNumber:ids.fusion,aNumber:ids.a,bNumber:ids.b,url:link(ids.artifact),kind:"Dataset",
  name:"SYNTHETIC-DEMO-NO-FILE.csv",version:"training-v1",digest:sha,fileBytes:"42",
  digestStatus:"SHA256_DECLARED_NOT_VERIFIED",artifactURL:"",
  author:"synthetic-demo-account",date:DEMO_CREATED_AT,limitations:"No actual file, source, or dataset exists."};
 const byte={issueNumber:ids.check,artifactNumber:ids.artifact,trialNumber:ids.trial,
  charterNumber:ids.charter,fusionNumber:ids.fusion,aNumber:ids.a,bNumber:ids.b,
  url:link(ids.check),author:"synthetic-check-account",date:DEMO_CREATED_AT,
  referenceDigest:sha,referenceBytes:"42",observedDigest:sha,observedBytes:42,
  result:"HASH_MATCH",filename:"SYNTHETIC-DEMO-NO-FILE.csv",
  limitations:"Simulated hash; no file was inspected."};
 const reproduction={issueNumber:ids.repro,trialNumber:ids.trial,charterNumber:ids.charter,
  fusionNumber:ids.fusion,aNumber:ids.a,bNumber:ids.b,url:link(ids.repro),date:DEMO_CREATED_AT,
  author:"synthetic-repeat-account",outcome:"REPORTED_MATCH",artifactNumber:ids.artifact,
  artifactDigest:sha,artifactVersion:"training-v1",
  referenceOutcome:"SYNTHETIC: example 1.4",method:"Simulation only. Nothing was run.",
  environment:"Fictional environment",controls:"Fictional comparison control",
  observations:"SYNTHETIC A: example 1.4",deviations:"None in this fabricated fixture",
  limitations:"No real research or authorized experiment.",stopReason:""};
 return {bubbles,proposal,charter,trial,artifact,byte,reproduction};
}
export function makeSyntheticDossier(variant="A"){
 if(!["A","B"].includes(variant))throw Error("Unknown demo variant.");
 const x=seed();
 const second=variant==="B";
 const trial=second?{...x.trial,observations:"SYNTHETIC B: changed example measurement 1.8"}:x.trial;
 const byte=second?{...x.byte,result:"HASH_MISMATCH",observedDigest:"b".repeat(64),
  limitations:"Simulated mismatch; no real bytes inspected."}:x.byte;
 const firstRepro=second?{...x.reproduction,outcome:"REPORTED_DIFFERENCE",
  observations:"SYNTHETIC B: differing example 1.8"}:x.reproduction;
 const reports=[firstRepro];
 if(second)reports.push({...firstRepro,issueNumber:ids.blocked,url:link(ids.blocked),
  author:"synthetic-blocked-account",outcome:"NOT_RUN_BLOCKED",artifactNumber:null,
  artifactDigest:"",artifactVersion:"",observations:"SYNTHETIC blocked: no real run took place",
  stopReason:"Illustration only, permission to run was not requested"});
 const dossier=buildReproductionDossier({trial,charter:x.charter,proposal:x.proposal,bubbles:x.bubbles,
  artifacts:[x.artifact],byteChecks:[byte],reproductions:reports,
  feedStatus:"ready",generatedAt:DEMO_CREATED_AT});
 if(!dossier)throw Error("Could not create a safe synthetic dossier.");
 return {
  ...dossier,source:{...dossier.source,system:"SYNTHETIC TRAINING ONLY · NO GITHUB API FETCH",
   feed_status:"synthetic_fixture_not_remote_data",
   warnings:[DEMO_LABEL,"All high-numbered Issue URLs are non-published placeholders and must never be cited as actual evidence.",
    ...dossier.source.warnings]},
  synthetic_demo:{kind:DEMO_MARKER,variant,
   display_label:DEMO_LABEL,published_issues:false,real_measurements:false,
   authenticated:false,license_or_execution_authority:false}
 };
}
export function isSyntheticCapsule(capsule){
 return capsule?.dossier?.synthetic_demo?.kind===DEMO_MARKER;
}
export async function makeSyntheticCapsulePair({subtle=globalThis.crypto?.subtle}={}){
 const [a,b]=await Promise.all(["A","B"].map(async variant=>
  createEvidenceCapsule(makeSyntheticDossier(variant),{subtle,createdAt:DEMO_CREATED_AT})));
 return {a,b};
}
export async function runSyntheticLabSelfTest({subtle=globalThis.crypto?.subtle}={}){
 const {a,b}=await makeSyntheticCapsulePair({subtle});
 const [va,vb,report]=await Promise.all([
  verifyEvidenceCapsule(a,{subtle}),verifyEvidenceCapsule(b,{subtle}),
  compareCapsulePair(a,b,{subtle})
 ]);
 const edited=JSON.parse(JSON.stringify(b));
 edited.dossier.provenance.original_trial.observations="TAMPERED WITHOUT HASH UPDATE";
 const tampered=await verifyEvidenceCapsule(edited,{subtle});
 const checks=[
  {id:"a",label:"Synthetic Capsule A integrity",pass:va.status==="INTERNAL_HASH_MATCH"},
  {id:"b",label:"Synthetic Capsule B integrity",pass:vb.status==="INTERNAL_HASH_MATCH"},
  {id:"difference",label:"Synthetic disagreement, changed fields and B-only report",pass:
   report.ok===true&&report.status==="DIFFERENT_CANONICAL_DOSSIER_CONTENT"&&
   report.changes.changed===2&&report.changes.only_b===1&&
   report.diff.sources.some(s=>s.node==="original_trial"&&s.fields.includes("observations"))},
  {id:"tamper",label:"Edited dossier without updated checksum is rejected",pass:
   tampered.status==="INTERNAL_HASH_MISMATCH"}
 ];
 return {ok:checks.every(c=>c.pass),checks,a,b,report,
  synthetic:true,scope:"LOCAL_ALGORITHMS_ONLY_NOT_OFFLINE_RELOAD_OR_SCIENTIFIC_VALIDATION"};
}
