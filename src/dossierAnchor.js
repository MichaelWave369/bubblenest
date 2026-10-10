// v1.9 voluntary public GitHub Issues record a contributor-declared dossier fingerprint,
// not an immutable notarization, remote binary verification or proof of scientific truth.
import{ROOM_REPO,parentIssueNumber}from"./roomData.js";
import{validateDossierImport}from"./dossierDiff.js";
import{FINGERPRINT_ALGORITHM,FINGERPRINT_CANON,FINGERPRINT_POLICY}from"./dossierFingerprint.js";
import{cleanEvidenceText}from"./evidenceData.js";
export const ANCHOR_MARKER="<!-- bubblenest:dossier-anchor:v1 -->";
export const ANCHOR_STATUS="USER_DECLARED_UNSIGNATURED_FINGERPRINT";
const issueURL=n=>ROOM_REPO+"/issues/"+n;
const section=(body,heading)=>{
 const k="\n## "+heading+"\n",i=body.indexOf(k);
 return i<0?"":body.slice(i+k.length).split(/\n## |\n---(?:\n|$)/)[0].trim().slice(0,1800);
};
const safe=value=>cleanEvidenceText(value,950).replace(/^---$/gm,"\\---");
const isSha=x=>typeof x==="string"&&/^[a-f0-9]{64}$/.test(x);
const positive=x=>Number.isSafeInteger(x)&&x>0;
const iso=x=>typeof x==="string"&&/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.\d+)?Z$/.test(x)&&
 !Number.isNaN(Date.parse(x));
export function makeAnchorDraft({dossier,fingerprint,limitations,acknowledged}={}){
 if(!validateDossierImport(dossier).ok||!fingerprint||!isSha(fingerprint.digest)||
  fingerprint.algorithm!==FINGERPRINT_ALGORITHM||
  fingerprint.canonicalization!==FINGERPRINT_CANON||
  !positive(fingerprint.bytes)||fingerprint.bytes>2*1024*1024||
  acknowledged!==true)return null;
 const p=dossier.provenance,notes=safe(limitations);
 if(!notes)return null;
 const trial=p.original_trial.issueNumber;
 const title="[Dossier Anchor] Trial #"+trial+" · SHA-256 "+fingerprint.digest.slice(0,12);
 const body=[
  ANCHOR_MARKER,
  "# Bubble Nest · declared dossier snapshot fingerprint",
  "## Original Trial\n"+p.original_trial.url,
  "## Fusion invitation\n"+p.fusion.url,
  "## Charter\n"+p.charter.url,
  "## Origin A\n"+p.origin_a.url,
  "## Origin B\n"+p.origin_b.url,
  "## Dossier schema\n"+dossier.schema_version,
  "## Snapshot generated at\n"+dossier.generated_at,
  "## Fingerprint algorithm\n"+FINGERPRINT_ALGORITHM,
  "## Canonicalization\n"+FINGERPRINT_CANON,
  "## Canonical UTF-8 byte length\n"+fingerprint.bytes,
  "## SHA-256 fingerprint\n"+fingerprint.digest,
  "## Context and limitations\n"+notes,
  "## Receipt state\n"+ANCHOR_STATUS,
  "## Receipt policy\n"+FINGERPRINT_POLICY,
  "---",
  "This Issue is a contributor-submitted claim about a locally fingerprinted dossier JSON. It is NOT an immutable timestamp, a signed attestation, a proof that the referenced bytes were published, evidence of authorship or permission, or a scientific verification. The full dossier JSON is not uploaded with this Issue."
 ].join("\n\n");
 return {title,body,url:ROOM_REPO+"/issues/new?title="+encodeURIComponent(title)+"&body="+encodeURIComponent(body)};
}
export function parseAnchorIssue(issue){
 if(!issue||issue.pull_request||!positive(issue.number)||typeof issue.body!=="string"||
  !issue.title?.startsWith("[Dossier Anchor] ")||!issue.body.includes(ANCHOR_MARKER))return null;
 const trialNumber=parentIssueNumber(section(issue.body,"Original Trial"));
 const fusionNumber=parentIssueNumber(section(issue.body,"Fusion invitation"));
 const charterNumber=parentIssueNumber(section(issue.body,"Charter"));
 const aNumber=parentIssueNumber(section(issue.body,"Origin A"));
 const bNumber=parentIssueNumber(section(issue.body,"Origin B"));
 const digest=section(issue.body,"SHA-256 fingerprint");
 const bytesText=section(issue.body,"Canonical UTF-8 byte length");
 const bytes=Number(bytesText);
 const timestamp=section(issue.body,"Snapshot generated at");
 const schema=section(issue.body,"Dossier schema");
 const limitations=section(issue.body,"Context and limitations");
 if(!trialNumber||!fusionNumber||!charterNumber||!aNumber||!bNumber||aNumber===bNumber||
  !isSha(digest)||!/^[1-9]\d*$/.test(bytesText)||!positive(bytes)||bytes>2*1024*1024||
  !iso(timestamp)||schema!=="1.7.0"||!limitations||
  section(issue.body,"Fingerprint algorithm")!==FINGERPRINT_ALGORITHM||
  section(issue.body,"Canonicalization")!==FINGERPRINT_CANON||
  section(issue.body,"Receipt state")!==ANCHOR_STATUS||
  section(issue.body,"Receipt policy")!==FINGERPRINT_POLICY)return null;
 return {id:"dossier-anchor-"+issue.number,issueNumber:issue.number,url:issueURL(issue.number),
  trialNumber,fusionNumber,charterNumber,aNumber,bNumber,digest,bytes,schema,timestamp,limitations,
  algorithm:FINGERPRINT_ALGORITHM,canonicalization:FINGERPRINT_CANON,
  author:issue.user?.login||"Unknown GitHub account",date:issue.created_at||null};
}
export function anchorsForDossier(anchors,dossier){
 if(!validateDossierImport(dossier).ok)return [];
 const p=dossier.provenance;
 return anchors.filter(a=>a.trialNumber===p.original_trial.issueNumber&&
  a.fusionNumber===p.fusion.issueNumber&&a.charterNumber===p.charter.issueNumber&&
  a.aNumber===parentIssueNumber(p.origin_a.url)&&
  a.bNumber===parentIssueNumber(p.origin_b.url))
  .sort((a,b)=>(b.date||"").localeCompare(a.date||"")||b.issueNumber-a.issueNumber);
}
