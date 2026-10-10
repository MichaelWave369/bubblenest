// Offline Capsule Lab v2.1: two independently selected, untrusted local v2.0 capsules.
// Neither matching SHA-256 nor a shared source chain establishes scientific or legal authority.
import {verifyEvidenceCapsule,sameCapsuleChain} from "./evidenceCapsule.js";
import {compareDossiers,dossierDiffMarkdown} from "./dossierDiff.js";

export const PAIR_KIND="bubblenest.offline-capsule-comparison";
export const PAIR_VERSION="2.1.0";
export const PAIR_POLICY="UNTRUSTED_OFFLINE_SNAPSHOTS_NOT_AUTHENTICATED_HISTORY";
const DEMO_MARKER="bubblenest.synthetic-offline-self-test.v1";
const isDemo=x=>x?.dossier?.synthetic_demo?.kind===DEMO_MARKER;
export async function compareCapsulePair(a,b,{subtle=globalThis.crypto?.subtle}={}){
 const [left,right]=await Promise.all([
  verifyEvidenceCapsule(a,{subtle}),verifyEvidenceCapsule(b,{subtle})
 ]);
 if(!left.ok||!right.ok)return {
  ok:false,status:"CAPSULE_INTEGRITY_NOT_CONFIRMED",
  errors:[...(!left.ok?["Capsule A: "+left.status+" · "+left.errors.join("; ")]:[]),
   ...(!right.ok?["Capsule B: "+right.status+" · "+right.errors.join("; ")]:[])],
  integrity:{a:left.status,b:right.status}
 };
 const demoA=isDemo(a),demoB=isDemo(b);
 if(demoA!==demoB||Boolean(a?.dossier?.synthetic_demo)!==demoA||
  Boolean(b?.dossier?.synthetic_demo)!==demoB)return {
  ok:false,status:"SYNTHETIC_REAL_MIX_BLOCKED",
  errors:["Fictional training capsules cannot be compared with research capsules or unknown demo formats."],
  integrity:{a:left.status,b:right.status}
 };
 if(!sameCapsuleChain(a.dossier,b.dossier))return {
  ok:false,status:"DIFFERENT_SOURCE_CHAINS",
  errors:["Capsules refer to different original Bubble/Fusion/Charter/Trial sources; comparison is blocked."],
  integrity:{a:left.status,b:right.status}
 };
 const diff=compareDossiers(a.dossier,b.dossier);
 if(!diff.ok)return {ok:false,status:"DIFF_UNAVAILABLE",errors:diff.errors,
  integrity:{a:left.status,b:right.status}};
 const fingerprintMatch=a.fingerprint.digest===b.fingerprint.digest&&
  a.fingerprint.bytes===b.fingerprint.bytes;
 const changes={
  only_a:diff.artifacts.noLongerVisible.length+diff.byte_checks.noLongerVisible.length+
   diff.reproductions.noLongerVisible.length,
  only_b:diff.artifacts.added.length+diff.byte_checks.added.length+
   diff.reproductions.added.length,
  changed:diff.artifacts.changed.length+diff.byte_checks.changed.length+
   diff.reproductions.changed.length,
  unchanged:diff.artifacts.unchanged+diff.byte_checks.unchanged+diff.reproductions.unchanged
 };
 return {
  ok:true,status:fingerprintMatch?"SAME_CANONICAL_DOSSIER_CONTENT":"DIFFERENT_CANONICAL_DOSSIER_CONTENT",
  kind:PAIR_KIND,schema_version:PAIR_VERSION,policy:PAIR_POLICY,
  synthetic_demonstration:demoA?"SYNTHETIC DEMONSTRATION, NO PUBLISHED GITHUB ISSUES":null,
  source_trial:a.dossier.provenance.original_trial.url,
  capsule_a:{claimed_created_at:a.created_at,dossier_generated_at:a.dossier.generated_at,
   canonical_sha256:a.fingerprint.digest,canonical_bytes:a.fingerprint.bytes},
  capsule_b:{claimed_created_at:b.created_at,dossier_generated_at:b.dossier.generated_at,
   canonical_sha256:b.fingerprint.digest,canonical_bytes:b.fingerprint.bytes},
  integrity:{a:left.status,b:right.status},
  claimed_times_authenticated:false,source_authenticated:false,scientific_verdict:false,
  signed:false,execution_authorized:false,coverage:"PARTIAL_OR_UNKNOWN",
  changes,diff,
  caution:"CONTENT_ONLY_UNTRUSTED_NO_INDEPENDENT_AUTHENTICATION_NO_ASSUMED_CHRONOLOGY"
 };
}
export function offlineComparisonMarkdown(report){
 if(!report?.ok||report.kind!==PAIR_KIND)return "";
 // The shared v1.8 Markdown serializer escapes data supplied through the capsules.
 const base=dossierDiffMarkdown(report.diff)
  .replace(/^# Reproduction Dossier Time Machine/m,"# Two-Capsule Evidence Comparison")
  .replace(/^- Imported export:/m,"- Capsule A dossier:")
  .replace(/^- Currently visible snapshot:/m,"- Capsule B dossier:")
  .replace(/^Missing now means.*$/m,"Records absent from one file are not proven deleted or disproven.")
  .replace(/^- Newly visible:/gm,"- Only in B:")
  .replace(/^- No longer visible:/gm,"- Only in A:")
  .replace(/^- NEW #/gm,"- ONLY IN B #")
  .replace(/^- NOT VISIBLE NOW #/gm,"- ONLY IN A #")
  .replace(/^- Newly visible flags:/gm,"- Flags only in B:")
  .replace(/^- Flags no longer visible:/gm,"- Flags only in A:");
 const summary=[
  "# Offline Evidence Capsule Comparison","",
  "**UNTRUSTED RESEARCH DATA · NO AUTHENTICATED TIMELINE OR SCIENCE VERDICT**","",
  "- Capsule A: "+report.integrity.a,
  "- Capsule B: "+report.integrity.b,
  "- Canonical content: "+report.status,
  "- Records only in A: "+report.changes.only_a,
  "- Records only in B: "+report.changes.only_b,
  "- Changed records: "+report.changes.changed,
  "- Unchanged compared records: "+report.changes.unchanged,"",
  "**A and B are reviewer-selected slots, not proven earlier/later dates.**",
  "**Missing records are absent from a provided snapshot, not proven deleted.**","",
  "## Detailed evidence inventory comparison","",
  base
 ];
 return (report.synthetic_demonstration?
  "# SYNTHETIC TRAINING COMPARISON · NOT REAL RESEARCH\n\n**All Issue references below are fictional placeholders and do not identify published GitHub records.**\n\n":"")+
  summary.join("\n");
}
export const capsulePairFileBase=(report)=>report?.ok?
 "capsule-compare-trial-"+report.diff.source_trial.split("/").at(-1)+"-v2-1":"capsule-compare-unavailable";
