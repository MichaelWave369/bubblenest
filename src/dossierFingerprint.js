// Bubble Nest v1.9: deterministic SHA-256 fingerprints for local untrusted dossier JSON.
// A matching fingerprint is content consistency, not trusted provenance or verified science.
import {validateDossierImport,MAX_DOSSIER_IMPORT_BYTES} from "./dossierDiff.js";

export const FINGERPRINT_ALGORITHM="SHA-256";
export const FINGERPRINT_CANON="BUBBLENEST_JSON_RECURSIVE_SORTED_KEYS_V1";
export const FINGERPRINT_POLICY="DECLARED_SHA256_NOT_SIGNED_NOT_SCIENCE";
const prohibited=new Set(["__proto__","prototype","constructor"]);
const plain=x=>x!==null&&typeof x==="object"&&!Array.isArray(x);
export function canonicalSnapshotJSON(input){
 const checked=validateDossierImport(input);
 if(!checked.ok)throw Error("Unsupported or malformed dossier: "+checked.errors.join(" "));
 const visit=(v,depth=0)=>{
  if(depth>80)throw Error("Dossier exceeds canonicalization depth.");
  if(v===null||typeof v==="string"||typeof v==="boolean")return v;
  if(typeof v==="number"){
   if(!Number.isFinite(v))throw Error("Dossier contains an invalid number.");
   return v;
  }
  if(Array.isArray(v))return v.map(a=>visit(a,depth+1));
  if(!plain(v))throw Error("Dossier contains unsupported data.");
  const result=Object.create(null);
  for(const k of Object.keys(v).sort()){
   if(prohibited.has(k))throw Error("Dossier contains a prohibited object key.");
   result[k]=visit(v[k],depth+1);
  }
  return result;
 };
 const json=JSON.stringify(visit(input));
 if(new TextEncoder().encode(json).byteLength>MAX_DOSSIER_IMPORT_BYTES)
  throw Error("Canonical dossier exceeds the 2 MiB fingerprint limit.");
 return json;
}
export async function fingerprintDossier(input,subtle=globalThis.crypto?.subtle){
 if(!subtle?.digest)throw Error("Secure browser SHA-256 is not available.");
 const bytes=new TextEncoder().encode(canonicalSnapshotJSON(input));
 const hashed=new Uint8Array(await subtle.digest("SHA-256",bytes));
 return {
  digest:[...hashed].map(b=>b.toString(16).padStart(2,"0")).join(""),
  canonicalization:FINGERPRINT_CANON,algorithm:FINGERPRINT_ALGORITHM,bytes:bytes.byteLength
 };
}
export function compareFingerprints(a,b){
 if(!a||!b||!Number.isSafeInteger(a.bytes)||!Number.isSafeInteger(b.bytes))return "UNAVAILABLE";
 if(typeof a.digest!=="string"||typeof b.digest!=="string"||
  !/^[a-f0-9]{64}$/.test(a.digest)||!/^[a-f0-9]{64}$/.test(b.digest))return "UNAVAILABLE";
 if(a.canonicalization!==b.canonicalization||a.algorithm!==b.algorithm)return "DIFFERENT_METHOD";
 return a.digest===b.digest&&a.bytes===b.bytes?"SAME_CANONICAL_CONTENT":"DIFFERENT_CANONICAL_CONTENT";
}
