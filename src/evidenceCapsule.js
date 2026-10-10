// Evidence Capsules v2.0: transport a full dossier and its SHA-256 in one local JSON file.
// Internal checksum consistency does not establish external authenticity, scientific truth,
// immutable chronology, rights ownership, or authorization for any experiment or agent.
import {validateDossierImport} from "./dossierDiff.js";
import {fingerprintDossier,FINGERPRINT_ALGORITHM,FINGERPRINT_CANON,compareFingerprints} from "./dossierFingerprint.js";
import {anchorsForDossier} from "./dossierAnchor.js";

export const CAPSULE_KIND="bubblenest.evidence-capsule";
export const CAPSULE_VERSION="2.0.0";
export const CAPSULE_POLICY="SELF_CONTAINED_CHECKSUM_NOT_AUTHENTICATED_PROVENANCE";
export const CAPSULE_MAX_FILE_BYTES=3*1024*1024;
const issueKeys=["origin_a","origin_b","fusion","charter","original_trial"];
const object=x=>!!x&&typeof x==="object"&&!Array.isArray(x);
const sha=x=>typeof x==="string"&&/^[a-f0-9]{64}$/.test(x);
const positive=x=>Number.isSafeInteger(x)&&x>0;
const iso=x=>typeof x==="string"&&/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.\d+)?Z$/.test(x)&&!Number.isNaN(Date.parse(x));
const chain=d=>issueKeys.map(k=>d?.provenance?.[k]?.url||"");
const exactKeys=(obj,required)=>Object.keys(obj).length===required.length&&
 required.every(k=>Object.prototype.hasOwnProperty.call(obj,k));
export function sameCapsuleChain(a,b){
 return !!a&&!!b&&chain(a).every((x,i)=>!!x&&x===chain(b)[i]);
}
export async function createEvidenceCapsule(dossier,{subtle=globalThis.crypto?.subtle,createdAt}={}){
 const valid=validateDossierImport(dossier);
 if(!valid.ok)throw Error("Cannot package unsupported dossier: "+valid.errors.join(" "));
 const fingerprint=await fingerprintDossier(dossier,subtle);
 const created_at=createdAt??new Date().toISOString();
 if(!iso(created_at))throw Error("Capsule creation timestamp must be ISO UTC.");
 return {
  kind:CAPSULE_KIND,schema_version:CAPSULE_VERSION,created_at,
  policy:CAPSULE_POLICY,
  signed:false,source_authenticated:false,science_verified:false,execution_authorized:false,
  coverage:"PARTIAL_OR_UNKNOWN",
  fingerprint:{
   algorithm:FINGERPRINT_ALGORITHM,canonicalization:FINGERPRINT_CANON,
   digest:fingerprint.digest,bytes:fingerprint.bytes
  },
  dossier
 };
}
export function capsuleDownloadName(capsule){
 if(!capsule||capsule.kind!==CAPSULE_KIND)return "evidence-capsule";
 return "evidence-capsule-trial-"+capsule.dossier.provenance.original_trial.issueNumber+"-v2";
}
export function parseCapsuleFile(text){
 if(typeof text!=="string")throw Error("Expected a local JSON file.");
 if(new TextEncoder().encode(text).length>CAPSULE_MAX_FILE_BYTES)
  throw Error("Evidence Capsule exceeds the 3 MiB local import limit.");
 try{return JSON.parse(text)}catch{throw Error("Invalid Evidence Capsule JSON.");}
}
export function validateCapsuleEnvelope(capsule){
 const errors=[];
 if(!object(capsule))return {ok:false,errors:["Capsule must be a JSON object."]};
 if(!exactKeys(capsule,["kind","schema_version","created_at","policy","signed",
  "source_authenticated","science_verified","execution_authorized","coverage","fingerprint","dossier"]))
  errors.push("Capsule envelope has missing or unexpected fields.");
 if(capsule.kind!==CAPSULE_KIND||capsule.schema_version!==CAPSULE_VERSION)
  errors.push("Unsupported Evidence Capsule kind or schema.");
 if(!iso(capsule.created_at))errors.push("Invalid capsule creation timestamp.");
 if(capsule.policy!==CAPSULE_POLICY||capsule.coverage!=="PARTIAL_OR_UNKNOWN"||
  capsule.signed!==false||capsule.source_authenticated!==false||
  capsule.science_verified!==false||capsule.execution_authorized!==false)
  errors.push("Capsule must explicitly disclaim signature, source authentication, verification and authorization.");
 const f=capsule.fingerprint;
 if(!object(f)||!exactKeys(f,["algorithm","canonicalization","digest","bytes"])||
  f.algorithm!==FINGERPRINT_ALGORITHM||f.canonicalization!==FINGERPRINT_CANON||
  !sha(f.digest)||!positive(f.bytes)||f.bytes>2*1024*1024)
  errors.push("Invalid fingerprint method, SHA-256 or canonical byte count.");
 const validation=validateDossierImport(capsule.dossier);
 if(!validation.ok)errors.push(...validation.errors);
 return {ok:errors.length===0,errors:errors.slice(0,14)};
}
export async function verifyEvidenceCapsule(capsule,{subtle=globalThis.crypto?.subtle}={}){
 const validation=validateCapsuleEnvelope(capsule);
 if(!validation.ok)return {ok:false,status:"INVALID_CAPSULE",errors:validation.errors};
 try{
  const actual=await fingerprintDossier(capsule.dossier,subtle);
  const consistency=compareFingerprints(actual,capsule.fingerprint);
  const ok=consistency==="SAME_CANONICAL_CONTENT";
  return {
   ok,status:ok?"INTERNAL_HASH_MATCH":"INTERNAL_HASH_MISMATCH",
   claimed:capsule.fingerprint,computed:actual,
   source_trial:capsule.dossier.provenance.original_trial.url,
   coverage:"PARTIAL_OR_UNKNOWN",authenticated:false,scientific_verdict:false,
   errors:ok?[]:["The dossier content does not match the capsule's declared digest or canonical length."]
  };
 }catch(e){
  return {ok:false,status:"CHECK_UNAVAILABLE",errors:[String(e.message||e)]};
 }
}
export function capsuleAnchorComparison(capsule,anchors=[]){
 if(!validateCapsuleEnvelope(capsule).ok)return [];
 return anchorsForDossier(anchors,capsule.dossier).map(a=>{
  const status=compareFingerprints(capsule.fingerprint,a);
  return {
   issueNumber:a.issueNumber,url:a.url,author:a.author,date:a.date,
   status:status==="SAME_CANONICAL_CONTENT"?"DECLARED_ANCHOR_MATCH":
    status==="DIFFERENT_CANONICAL_CONTENT"?"DECLARED_ANCHOR_DIFFERENCE":"METHOD_UNAVAILABLE"
  };
 });
}
