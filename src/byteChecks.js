// Bubble Nest v1.5: byte-comparison receipts, not scientific verification.
// Local file bytes are never transmitted; public Issues only contain reported metadata.
import {ROOM_REPO,parentIssueNumber} from "./roomData.js";
import {cleanEvidenceText} from "./evidenceData.js";
import {artifactsForTrial,ARTIFACT_MAX_LOCAL_HASH_BYTES} from "./artifactData.js";

export const BYTE_CHECK_MARKER="<!-- bubblenest:byte-check:v1 -->";
export const BYTE_CHECK_POLICY="CONTRIBUTOR_REPORTED_LOCAL_BYTE_COMPARISON_NOT_SCIENTIFIC_VERIFICATION";
export const BYTE_CHECK_RESULTS=["HASH_MATCH","HASH_MISMATCH","NO_REFERENCE_DIGEST","DECLARED_SIZE_CONFLICT"];
const link=n=>ROOM_REPO+"/issues/"+n;
const section=(body,title)=>{
 const label="\n## "+title+"\n",i=body.indexOf(label);
 return i<0?"":body.slice(i+label.length).split(/\n## |\n---(?:\n|$)/)[0].trim().slice(0,2800);
};
const clean=(v,max=1300)=>cleanEvidenceText(v,max).replace(/^---$/gm,"\\---");
const validSha=v=>typeof v==="string"&&/^[a-f0-9]{64}$/.test(v);
const sizeText=v=>typeof v==="string"&&/^(0|[1-9]\d*)$/.test(v)&&Number.isSafeInteger(Number(v))&&Number(v)<=1_000_000_000_000;
const declaredSize=v=>v===""||sizeText(v);
export function compareByteDigests(artifact,observedDigest,observedBytes){
 if(!artifact||!validSha(observedDigest)||!Number.isSafeInteger(observedBytes)||
  observedBytes<0||observedBytes>ARTIFACT_MAX_LOCAL_HASH_BYTES||
  !declaredSize(artifact.fileBytes)||!(artifact.digest===""||validSha(artifact.digest)))return null;
 if(artifact.fileBytes!==""&&Number(artifact.fileBytes)!==observedBytes)return "DECLARED_SIZE_CONFLICT";
 if(!artifact.digest)return "NO_REFERENCE_DIGEST";
 return artifact.digest===observedDigest?"HASH_MATCH":"HASH_MISMATCH";
}
function validTarget(artifact,trial,charter,proposal,bubbles){
 if(!artifact||!Number.isSafeInteger(artifact.issueNumber)||artifact.issueNumber<1||
  !trial||!charter||!proposal)return false;
 return artifactsForTrial([artifact],trial,charter,proposal,bubbles).length===1;
}
export function makeByteCheckDraft({artifact,trial,charter,proposal,bubbles,filename,observedDigest,observedBytes,
 acquisition,environment,limitations,acknowledged}={}){
 if(!validTarget(artifact,trial,charter,proposal,bubbles)||acknowledged!==true)return null;
 const outcome=compareByteDigests(artifact,observedDigest,observedBytes);
 const fields={filename:clean(filename,240),acquisition:clean(acquisition,1000),
  environment:clean(environment,900),limitations:clean(limitations,950)};
 if(!outcome||Object.values(fields).some(x=>!x))return null;
 const title="[Byte Check] "+outcome+": artifact #"+artifact.issueNumber+" · "+fields.filename.replace(/\n/g," ").slice(0,52);
 const body=[
  BYTE_CHECK_MARKER,
  "# Bubble Nest · contributor-reported byte comparison",
  "## Fusion invitation\n"+link(proposal.issueNumber),
  "## Charter\n"+link(charter.issueNumber),
  "## Trial receipt\n"+link(trial.issueNumber),
  "## Artifact receipt\n"+link(artifact.issueNumber),
  "## Origin A\n"+link(proposal.aNumber),
  "## Origin B\n"+link(proposal.bNumber),
  "## Artifact reference SHA-256\n"+(artifact.digest||"Not supplied."),
  "## Artifact reference byte size\n"+(artifact.fileBytes||"Not supplied."),
  "## Local filename\n"+fields.filename,
  "## Observed local byte size\n"+observedBytes,
  "## Observed local SHA-256\n"+observedDigest,
  "## Byte comparison result\n"+outcome,
  "## File acquisition and chain of custody\n"+fields.acquisition,
  "## Hashing environment and method\n"+fields.environment,
  "## Limitations and uncertainty\n"+fields.limitations,
  "## Record policy\n"+BYTE_CHECK_POLICY,
  "---",
  "This is an explicitly submitted GitHub contributor report of a SHA-256 calculation. File bytes stayed on their local device in the Bubble Nest form. A matching hash is a **byte-identification check against contributor-declared metadata**, not authentication of the source, scientific verification, independent reproducibility, IP ownership, rights clearance, or authorization to run experiments."
 ].join("\n\n");
 return {title,body,url:ROOM_REPO+"/issues/new?title="+encodeURIComponent(title)+"&body="+encodeURIComponent(body),outcome};
}
export function parseByteCheckIssue(issue){
 if(!issue||issue.pull_request||!Number.isSafeInteger(issue.number)||issue.number<1||
  !issue.title?.startsWith("[Byte Check] ")||typeof issue.body!=="string"||
  !issue.body.includes(BYTE_CHECK_MARKER))return null;
 const fusionNumber=parentIssueNumber(section(issue.body,"Fusion invitation"));
 const charterNumber=parentIssueNumber(section(issue.body,"Charter"));
 const trialNumber=parentIssueNumber(section(issue.body,"Trial receipt"));
 const artifactNumber=parentIssueNumber(section(issue.body,"Artifact receipt"));
 const aNumber=parentIssueNumber(section(issue.body,"Origin A"));
 const bNumber=parentIssueNumber(section(issue.body,"Origin B"));
 const rawReference=section(issue.body,"Artifact reference SHA-256");
 const referenceDigest=rawReference==="Not supplied."?"":rawReference;
 const rawSize=section(issue.body,"Artifact reference byte size");
 const referenceBytes=rawSize==="Not supplied."?"":rawSize;
 const filename=section(issue.body,"Local filename");
 const observedSizeText=section(issue.body,"Observed local byte size");
 const observedDigest=section(issue.body,"Observed local SHA-256");
 const result=section(issue.body,"Byte comparison result");
 const acquisition=section(issue.body,"File acquisition and chain of custody");
 const environment=section(issue.body,"Hashing environment and method");
 const limitations=section(issue.body,"Limitations and uncertainty");
 if(!fusionNumber||!charterNumber||!trialNumber||!artifactNumber||!aNumber||!bNumber||
  aNumber===bNumber||!(referenceDigest===""||validSha(referenceDigest))||
  !declaredSize(referenceBytes)||!sizeText(observedSizeText)||!validSha(observedDigest)||
  !filename||!acquisition||!environment||!limitations||
  section(issue.body,"Record policy")!==BYTE_CHECK_POLICY)return null;
 const observedBytes=Number(observedSizeText);
 const computed=compareByteDigests({digest:referenceDigest,fileBytes:referenceBytes},observedDigest,observedBytes);
 if(!computed||result!==computed||!BYTE_CHECK_RESULTS.includes(result))return null;
 return {
  id:"byte-check-"+issue.number,issueNumber:issue.number,fusionNumber,charterNumber,trialNumber,
  artifactNumber,aNumber,bNumber,referenceDigest,referenceBytes,filename,observedBytes,
  observedDigest,result,acquisition,environment,limitations,
  author:issue.user?.login||"Unknown GitHub account",date:issue.created_at||null,
  url:link(issue.number),closed:issue.state==="closed"
 };
}
export function byteChecksForArtifact(checks,artifact,trial,charter,proposal,bubbles){
 if(!validTarget(artifact,trial,charter,proposal,bubbles))return [];
 return checks.filter(c=>c.artifactNumber===artifact.issueNumber&&c.trialNumber===trial.issueNumber&&
  c.charterNumber===charter.issueNumber&&c.fusionNumber===proposal.issueNumber&&
  c.aNumber===proposal.aNumber&&c.bNumber===proposal.bNumber&&
  c.referenceDigest===artifact.digest&&c.referenceBytes===artifact.fileBytes)
 .sort((a,b)=>(b.date||"").localeCompare(a.date||"")||b.issueNumber-a.issueNumber);
}
export function byteCheckCounts(checks,artifact,trial,charter,proposal,bubbles){
 const list=byteChecksForArtifact(checks,artifact,trial,charter,proposal,bubbles);
 return Object.fromEntries(["total",...BYTE_CHECK_RESULTS].map(k=>[k,k==="total"?list.length:list.filter(x=>x.result===k).length]));
}
