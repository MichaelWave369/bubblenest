// Artifact Receipts v1.4: declared file provenance, not cryptographic remote attestation.
// Local SHA-256 may be calculated client-side; no file bytes are uploaded by this feature.
import {ROOM_REPO,parentIssueNumber} from "./roomData.js";
import {cleanEvidenceText} from "./evidenceData.js";
import {trialsForCharter} from "./fusionTrials.js";

export const ARTIFACT_MARKER="<!-- bubblenest:artifact:v1 -->";
export const ARTIFACT_POLICY="DECLARED_ARTIFACT_METADATA_NOT_REMOTE_VERIFICATION";
export const ARTIFACT_KINDS=["Dataset","Source code","Test log","Results","Model or weights","Other"];
export const ARTIFACT_DIGEST_STATES=["SHA256_DECLARED_NOT_VERIFIED","NO_SHA256_DECLARED"];
export const ARTIFACT_MAX_LOCAL_HASH_BYTES=25*1024*1024;
const link=n=>ROOM_REPO+"/issues/"+n;
const clean=(v,max=1600)=>cleanEvidenceText(v,max).replace(/^---$/gm,"\\---");
const part=(body,title)=>{
 const tag="\n## "+title+"\n",start=body.indexOf(tag);
 return start<0?"":body.slice(start+tag.length).split(/\n## |\n---(?:\n|$)/)[0].trim().slice(0,2800);
};
const sha256=v=>{
 const x=String(v||"").trim().toLowerCase().replace(/^sha256:/,"");
 return x===""?"":/^[a-f0-9]{64}$/.test(x)?x:null;
};
const httpsURL=value=>{
 const s=String(value||"").trim();
 if(!s)return "";
 if(s.length>700)return null;
 try{const u=new URL(s);return u.protocol==="https:"&&!u.username&&!u.password?u.href:null}
 catch{return null;}
};
const fileSize=value=>{
 if(value===null||value===undefined||String(value).trim()==="")return "";
 const n=Number(String(value).trim());
 return Number.isSafeInteger(n)&&n>=0&&n<=1_000_000_000_000?n.toString():null;
};
function matchedTrial(trial,charter,proposal,bubbles){
 return !!trial&&Number.isSafeInteger(trial.issueNumber)&&trial.issueNumber>0&&
  trialsForCharter([trial],charter,proposal,bubbles).length===1;
}
export function makeArtifactDraft({trial,charter,proposal,bubbles,kind,name,version,fileBytes,digest,artifactURL,
  provenance,environment,steps,license,limitations,acknowledged}={}){
 if(!matchedTrial(trial,charter,proposal,bubbles)||!ARTIFACT_KINDS.includes(kind)||acknowledged!==true)return null;
 const fields={
  name:clean(name,250),version:clean(version,250),provenance:clean(provenance,1100),
  environment:clean(environment,1200),steps:clean(steps,1400),license:clean(license,650),
  limitations:clean(limitations,1000)
 };
 const digestValue=sha256(digest),url=httpsURL(artifactURL),size=fileSize(fileBytes);
 if(Object.values(fields).some(x=>!x)||digestValue===null||url===null||size===null)return null;
 const state=digestValue?"SHA256_DECLARED_NOT_VERIFIED":"NO_SHA256_DECLARED";
 const title="[Artifact] "+kind+": trial #"+trial.issueNumber+" · "+fields.name.replace(/\n/g," ").slice(0,61);
 const body=[
  ARTIFACT_MARKER,
  "# Bubble Fusion · versioned artifact receipt",
  "## Fusion invitation\n"+link(proposal.issueNumber),
  "## Charter\n"+link(charter.issueNumber),
  "## Trial receipt\n"+link(trial.issueNumber),
  "## Origin A\n"+link(proposal.aNumber),
  "## Origin B\n"+link(proposal.bNumber),
  "## Artifact kind\n"+kind,
  "## Filename or artifact name\n"+fields.name,
  "## Version or immutable tag\n"+fields.version,
  "## File size bytes\n"+(size||"Not supplied."),
  "## SHA-256 digest\n"+(digestValue||"Not supplied."),
  "## Digest status\n"+state,
  "## Public HTTPS artifact URL\n"+(url||"Not supplied."),
  "## Origin and acquisition method\n"+fields.provenance,
  "## Runtime and environment\n"+fields.environment,
  "## Reproduction instructions\n"+fields.steps,
  "## License and permission declaration\n"+fields.license,
  "## Limitations and uncertainty\n"+fields.limitations,
  "## Record policy\n"+ARTIFACT_POLICY,
  "---",
  "This receipt records **contributor-declared metadata**, not an independently inspected file. A SHA-256 digest is a reproducible identifier for bytes **only when independently recomputed on the same artifact**. It does NOT verify who created a file, ownership, license, scientific claims, the current contents of a URL, or permission to run a Charter."
 ].join("\n\n");
 return {title,body,url:ROOM_REPO+"/issues/new?title="+encodeURIComponent(title)+"&body="+encodeURIComponent(body)};
}
export function parseArtifactIssue(issue){
 if(!issue||issue.pull_request||!Number.isSafeInteger(issue.number)||issue.number<1||
  !issue.title?.startsWith("[Artifact] ")||typeof issue.body!=="string"||!issue.body.includes(ARTIFACT_MARKER))return null;
 const fusionNumber=parentIssueNumber(part(issue.body,"Fusion invitation"));
 const charterNumber=parentIssueNumber(part(issue.body,"Charter"));
 const trialNumber=parentIssueNumber(part(issue.body,"Trial receipt"));
 const aNumber=parentIssueNumber(part(issue.body,"Origin A"));
 const bNumber=parentIssueNumber(part(issue.body,"Origin B"));
 const kind=part(issue.body,"Artifact kind");
 const name=part(issue.body,"Filename or artifact name");
 const version=part(issue.body,"Version or immutable tag");
 const rawSize=part(issue.body,"File size bytes");
 const rawHash=part(issue.body,"SHA-256 digest");
 const status=part(issue.body,"Digest status");
 const rawURL=part(issue.body,"Public HTTPS artifact URL");
 const provenance=part(issue.body,"Origin and acquisition method");
 const environment=part(issue.body,"Runtime and environment");
 const steps=part(issue.body,"Reproduction instructions");
 const license=part(issue.body,"License and permission declaration");
 const limitations=part(issue.body,"Limitations and uncertainty");
 const digest=rawHash==="Not supplied."?"":sha256(rawHash);
 const fileBytes=rawSize==="Not supplied."?"":fileSize(rawSize);
 const artifactURL=rawURL==="Not supplied."?"":httpsURL(rawURL);
 if(!fusionNumber||!charterNumber||!trialNumber||!aNumber||!bNumber||aNumber===bNumber||
  !ARTIFACT_KINDS.includes(kind)||!name||!version||!provenance||!environment||!steps||!license||!limitations||
  digest===null||fileBytes===null||artifactURL===null||
  status!==(digest?"SHA256_DECLARED_NOT_VERIFIED":"NO_SHA256_DECLARED")||
  part(issue.body,"Record policy")!==ARTIFACT_POLICY)return null;
 return {id:"artifact-"+issue.number,issueNumber:issue.number,fusionNumber,charterNumber,trialNumber,aNumber,bNumber,
  kind,name,version,fileBytes,digest,digestStatus:status,artifactURL,provenance,environment,steps,license,limitations,
  author:issue.user?.login||"Unknown GitHub account",date:issue.created_at||null,
  url:link(issue.number),closed:issue.state==="closed"};
}
export function artifactsForTrial(artifacts,trial,charter,proposal,bubbles){
 if(!matchedTrial(trial,charter,proposal,bubbles))return [];
 return artifacts.filter(x=>x.trialNumber===trial.issueNumber&&x.charterNumber===charter.issueNumber&&
   x.fusionNumber===proposal.issueNumber&&x.aNumber===proposal.aNumber&&x.bNumber===proposal.bNumber)
  .sort((a,b)=>(b.date||"").localeCompare(a.date||"")||b.issueNumber-a.issueNumber);
}
export function artifactCounts(artifacts,trial,charter,proposal,bubbles){
 const values=artifactsForTrial(artifacts,trial,charter,proposal,bubbles);
 return {total:values.length,declaredSha256:values.filter(x=>!!x.digest).length,withoutDigest:values.filter(x=>!x.digest).length};
}
