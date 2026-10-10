// Fusion Trial Receipts v1.3: observations linked to a proposed Charter, not execution authority.
import {ROOM_REPO,parentIssueNumber} from "./roomData.js";
import {cleanEvidenceText} from "./evidenceData.js";
import {chartersForFusion} from "./fusionCharters.js";

export const TRIAL_MARKER="<!-- bubblenest:fusion-trial:v1 -->";
export const TRIAL_POLICY="SELF_REPORTED_OBSERVATION_NOT_EXECUTION_AUTHORIZATION";
export const TRIAL_KINDS=["Planning note","Attempt report","Stopped or aborted"];
export const TRIAL_FINDINGS=["Supports","Challenges","Mixed","Inconclusive","Not assessed"];
const issueURL=n=>ROOM_REPO+"/issues/"+n;
const section=(body,heading)=>{
 const label="\n## "+heading+"\n",start=body.indexOf(label);
 return start<0?"":body.slice(start+label.length).split(/\n## |\n---(?:\n|$)/)[0].trim().slice(0,2700);
};
const safe=(s,max=1600)=>cleanEvidenceText(s,max).replace(/^---$/gm,"\\---");
const optionalURL=s=>{
 const v=String(s||"").trim();
 if(!v)return "";
 if(v.length>700)return null;
 try{const u=new URL(v);return u.protocol==="https:"&&!u.username&&!u.password?u.href:null}
 catch{return null;}
};
const correctLink=(charter,proposal,bubbles)=>{
 if(!charter||!proposal||!Number.isSafeInteger(charter.issueNumber)||charter.issueNumber<1)return false;
 return chartersForFusion([charter],proposal,bubbles).length===1;
};
export function makeTrialDraft({charter,proposal,bubbles,kind,finding,question,procedure,observations,
  controls,artifacts,limitations,stopNote,next,acknowledged}={}){
 if(!correctLink(charter,proposal,bubbles)||!TRIAL_KINDS.includes(kind)||!TRIAL_FINDINGS.includes(finding)||
    acknowledged!==true)return null;
 const fields={
  question:safe(question,850),procedure:safe(procedure,1350),observations:safe(observations,1400),
  controls:safe(controls,900),limitations:safe(limitations,1000),stopNote:safe(stopNote,850),next:safe(next,700)
 };
 const artifactURL=optionalURL(artifacts);
 if(!fields.question||!fields.procedure||!fields.observations||!fields.controls||!fields.limitations||artifactURL===null)return null;
 if(kind==="Planning note"&&finding!=="Not assessed")return null;
 if(kind==="Stopped or aborted"&&!fields.stopNote)return null;
 const title="[Fusion Trial] "+kind+": charter #"+charter.issueNumber+" · "+fields.question.replace(/\n/g," ").slice(0,55);
 const body=[
  TRIAL_MARKER,
  "# Bubble Fusion · trial observation receipt",
  "## Fusion invitation\n"+issueURL(proposal.issueNumber),
  "## Charter\n"+issueURL(charter.issueNumber),
  "## Origin A\n"+issueURL(proposal.aNumber),
  "## Origin B\n"+issueURL(proposal.bNumber),
  "## Record kind\n"+kind,
  "## Contributor interpretation\n"+finding,
  "## Question\n"+fields.question,
  "## Procedure and environment\n"+fields.procedure,
  "## Observations or reason not tested\n"+fields.observations,
  "## Controls and reproducibility\n"+fields.controls,
  "## Public artifact URL\n"+(artifactURL||"Not supplied."),
  "## Limitations and alternatives\n"+fields.limitations,
  "## Stop or withdrawal note\n"+(fields.stopNote||"Not supplied."),
  "## Next check\n"+(fields.next||"Not supplied."),
  "## Record policy\n"+TRIAL_POLICY,
  "---",
  "This GitHub Issue describes a **contributor-reported observation or plan**. Neither the Charter nor this receipt authorizes work, verifies participant permission, establishes independence, or certifies the finding. Do not upload third-party or private experimental data without appropriate permission."
 ].join("\n\n");
 return {title,body,url:ROOM_REPO+"/issues/new?title="+encodeURIComponent(title)+"&body="+encodeURIComponent(body)};
}
export function parseTrialIssue(issue){
 if(!issue||issue.pull_request||!Number.isSafeInteger(issue.number)||issue.number<1||
  typeof issue.body!=="string"||!issue.body.includes(TRIAL_MARKER)||!issue.title?.startsWith("[Fusion Trial] "))return null;
 const fusionNumber=parentIssueNumber(section(issue.body,"Fusion invitation"));
 const charterNumber=parentIssueNumber(section(issue.body,"Charter"));
 const aNumber=parentIssueNumber(section(issue.body,"Origin A"));
 const bNumber=parentIssueNumber(section(issue.body,"Origin B"));
 const kind=section(issue.body,"Record kind"),finding=section(issue.body,"Contributor interpretation");
 const question=section(issue.body,"Question"),procedure=section(issue.body,"Procedure and environment");
 const observations=section(issue.body,"Observations or reason not tested");
 const controls=section(issue.body,"Controls and reproducibility");
 const limitations=section(issue.body,"Limitations and alternatives");
 const rawArtifact=section(issue.body,"Public artifact URL"),artifacts=rawArtifact==="Not supplied."?"":optionalURL(rawArtifact);
 const rawStop=section(issue.body,"Stop or withdrawal note"),stopNote=rawStop==="Not supplied."?"":rawStop;
 const rawNext=section(issue.body,"Next check"),next=rawNext==="Not supplied."?"":rawNext;
 if(!fusionNumber||!charterNumber||!aNumber||!bNumber||aNumber===bNumber||
  !TRIAL_KINDS.includes(kind)||!TRIAL_FINDINGS.includes(finding)||!question||!procedure||!observations||!controls||
  !limitations||artifacts===null||kind==="Planning note"&&finding!=="Not assessed"||
  kind==="Stopped or aborted"&&!stopNote||section(issue.body,"Record policy")!==TRIAL_POLICY)return null;
 return {id:"fusion-trial-"+issue.number,issueNumber:issue.number,fusionNumber,charterNumber,aNumber,bNumber,kind,
  finding,question,procedure,observations,controls,limitations,artifacts,stopNote,next,
  author:issue.user?.login||"Unknown GitHub account",date:issue.created_at||null,
  url:issueURL(issue.number),closed:issue.state==="closed"};
}
export function trialsForCharter(trials,charter,proposal,bubbles){
 if(!correctLink(charter,proposal,bubbles))return [];
 return trials.filter(t=>t.charterNumber===charter.issueNumber&&t.fusionNumber===proposal.issueNumber&&
  t.aNumber===proposal.aNumber&&t.bNumber===proposal.bNumber)
  .sort((a,b)=>(b.date||"").localeCompare(a.date||"")||b.issueNumber-a.issueNumber);
}
export function trialCounts(trials,charter,proposal,bubbles){
 const records=trialsForCharter(trials,charter,proposal,bubbles);
 return {total:records.length,attempts:records.filter(r=>r.kind==="Attempt report").length,
  stopped:records.filter(r=>r.kind==="Stopped or aborted").length};
}
