// Reproduction Receipts v1.6: a contributor-reported repeat attempt, NEVER a science verdict.
import {ROOM_REPO,parentIssueNumber} from "./roomData.js";
import {cleanEvidenceText} from "./evidenceData.js";
import {trialsForCharter} from "./fusionTrials.js";
import {artifactsForTrial} from "./artifactData.js";

export const REPRO_MARKER="<!-- bubblenest:reproduction:v1 -->";
export const REPRO_POLICY="SELF_REPORTED_REPRODUCTION_NOT_INDEPENDENTLY_VERIFIED";
export const REPRO_OUTCOMES=["REPORTED_MATCH","REPORTED_DIFFERENCE","INCONCLUSIVE","NOT_RUN_BLOCKED","STOPPED"];
export const REPRO_ATTEMPT_OUTCOMES=["REPORTED_MATCH","REPORTED_DIFFERENCE","INCONCLUSIVE"];
const link=n=>ROOM_REPO+"/issues/"+n;
const get=(body,heading)=>{
 const token="\n## "+heading+"\n",start=body.indexOf(token);
 return start<0?"":body.slice(start+token.length).split(/\n## |\n---(?:\n|$)/)[0].trim().slice(0,2700);
};
const clean=(v,max=1200)=>cleanEvidenceText(v,max).replace(/^---$/gm,"\\---");
const shaOk=value=>typeof value==="string"&&/^[a-f0-9]{64}$/.test(value);
const sourceOk=(trial,charter,proposal,bubbles)=>!!trial&&
 Number.isSafeInteger(trial.issueNumber)&&trial.issueNumber>0&&
 trialsForCharter([trial],charter,proposal,bubbles).length===1;
const chosenArtifact=(artifact,trial,charter,proposal,bubbles)=>
 !!artifact&&Number.isSafeInteger(artifact.issueNumber)&&artifact.issueNumber>0&&
 artifactsForTrial([artifact],trial,charter,proposal,bubbles).length===1;
const outcomeIsComparison=value=>["REPORTED_MATCH","REPORTED_DIFFERENCE"].includes(value);

export function makeReproductionDraft({trial,charter,proposal,bubbles,artifact,outcome,
 referenceOutcome,method,environment,controls,observations,deviations,limitations,stopReason,acknowledged}={}){
 if(!sourceOk(trial,charter,proposal,bubbles)||trial.kind!=="Attempt report"||
  !REPRO_OUTCOMES.includes(outcome)||acknowledged!==true)return null;
 if(artifact&&!chosenArtifact(artifact,trial,charter,proposal,bubbles))return null;
 if(outcomeIsComparison(outcome)&&(!artifact||!shaOk(artifact.digest)||!artifact.version))return null;
 const values={referenceOutcome:clean(referenceOutcome,900),method:clean(method,1350),
  environment:clean(environment,900),controls:clean(controls,900),
  observations:clean(observations,1400),deviations:clean(deviations,850),
  limitations:clean(limitations,1000),stopReason:clean(stopReason,850)};
 if(Object.entries(values).some(([k,v])=>k!=="stopReason"&&!v))return null;
 if(["NOT_RUN_BLOCKED","STOPPED"].includes(outcome)&&!values.stopReason)return null;
 const title="[Reproduction] "+outcome+": trial #"+trial.issueNumber+" · "+values.referenceOutcome.replace(/\n/g," ").slice(0,52);
 const body=[
  REPRO_MARKER,
  "# Bubble Nest · contributor reproduction report",
  "## Fusion invitation\n"+link(proposal.issueNumber),
  "## Charter\n"+link(charter.issueNumber),
  "## Original trial\n"+link(trial.issueNumber),
  "## Origin A\n"+link(proposal.aNumber),
  "## Origin B\n"+link(proposal.bNumber),
  "## Pinned artifact receipt\n"+(artifact?link(artifact.issueNumber):"Not supplied."),
  "## Declared artifact SHA-256\n"+(artifact?.digest||"Not supplied."),
  "## Declared artifact version\n"+(artifact?.version||"Not supplied."),
  "## Reported attempt outcome\n"+outcome,
  "## Original trial endpoint under comparison\n"+values.referenceOutcome,
  "## Repeat method and procedure\n"+values.method,
  "## Execution environment\n"+values.environment,
  "## Controls and baselines\n"+values.controls,
  "## Observations or reason no run completed\n"+values.observations,
  "## Deviations and differences from source\n"+values.deviations,
  "## Limitations and alternative explanations\n"+values.limitations,
  "## Stop or blocked reason\n"+(values.stopReason||"Not supplied."),
  "## Record policy\n"+REPRO_POLICY,
  "---",
  "This is a GitHub-account contributor report, not an independently authenticated repetition, a verified scientific outcome, or permission to execute a Charter. 'Reported match' describes the submitter's claimed outcome only. The linked artifact digest was declared by another receipt, and no bytes were fetched or verified by the site."
 ].join("\n\n");
 return {title,body,url:ROOM_REPO+"/issues/new?title="+encodeURIComponent(title)+"&body="+encodeURIComponent(body)};
}

export function parseReproductionIssue(issue){
 if(!issue||issue.pull_request||!Number.isSafeInteger(issue.number)||issue.number<1||
  !issue.title?.startsWith("[Reproduction] ")||typeof issue.body!=="string"||
  !issue.body.includes(REPRO_MARKER))return null;
 const fusionNumber=parentIssueNumber(get(issue.body,"Fusion invitation"));
 const charterNumber=parentIssueNumber(get(issue.body,"Charter"));
 const trialNumber=parentIssueNumber(get(issue.body,"Original trial"));
 const aNumber=parentIssueNumber(get(issue.body,"Origin A"));
 const bNumber=parentIssueNumber(get(issue.body,"Origin B"));
 const rawArtifact=get(issue.body,"Pinned artifact receipt");
 const artifactNumber=rawArtifact==="Not supplied."?null:parentIssueNumber(rawArtifact);
 const rawDigest=get(issue.body,"Declared artifact SHA-256");
 const artifactDigest=rawDigest==="Not supplied."?"":rawDigest;
 const rawVersion=get(issue.body,"Declared artifact version");
 const artifactVersion=rawVersion==="Not supplied."?"":rawVersion;
 const outcome=get(issue.body,"Reported attempt outcome");
 const referenceOutcome=get(issue.body,"Original trial endpoint under comparison");
 const method=get(issue.body,"Repeat method and procedure");
 const environment=get(issue.body,"Execution environment");
 const controls=get(issue.body,"Controls and baselines");
 const observations=get(issue.body,"Observations or reason no run completed");
 const deviations=get(issue.body,"Deviations and differences from source");
 const limitations=get(issue.body,"Limitations and alternative explanations");
 const rawStop=get(issue.body,"Stop or blocked reason"),stopReason=rawStop==="Not supplied."?"":rawStop;
 if(!fusionNumber||!charterNumber||!trialNumber||!aNumber||!bNumber||aNumber===bNumber||
  !REPRO_OUTCOMES.includes(outcome)||rawArtifact!=="Not supplied."&&!artifactNumber||
  !referenceOutcome||!method||!environment||!controls||!observations||!deviations||!limitations||
  !((artifactNumber===null&&!artifactDigest&&!artifactVersion)||
    (artifactNumber!==null&&artifactVersion&&(artifactDigest===""||shaOk(artifactDigest))))||
  outcomeIsComparison(outcome)&&(!artifactNumber||!shaOk(artifactDigest))||
  ["NOT_RUN_BLOCKED","STOPPED"].includes(outcome)&&!stopReason||
  get(issue.body,"Record policy")!==REPRO_POLICY)return null;
 return {id:"repro-"+issue.number,issueNumber:issue.number,fusionNumber,charterNumber,trialNumber,aNumber,bNumber,
  artifactNumber,artifactDigest,artifactVersion,outcome,referenceOutcome,method,environment,
  controls,observations,deviations,limitations,stopReason,author:issue.user?.login||"Unknown GitHub account",
  date:issue.created_at||null,url:link(issue.number),closed:issue.state==="closed"};
}

export function reproductionsForTrial(records,trial,charter,proposal,bubbles,artifacts){
 if(!sourceOk(trial,charter,proposal,bubbles)||trial.kind!=="Attempt report")return [];
 const known=new Map(artifactsForTrial(artifacts,trial,charter,proposal,bubbles)
  .map(a=>[a.issueNumber,a]));
 return records.filter(r=>r.trialNumber===trial.issueNumber&&r.charterNumber===charter.issueNumber&&
  r.fusionNumber===proposal.issueNumber&&r.aNumber===proposal.aNumber&&r.bNumber===proposal.bNumber&&
  (r.artifactNumber===null||(
   known.has(r.artifactNumber)&&known.get(r.artifactNumber).digest===r.artifactDigest&&
   known.get(r.artifactNumber).version===r.artifactVersion
  )))
  .map(r=>({...r,sameAccount:!!trial.author&&!!r.author&&
   trial.author.toLowerCase()===r.author.toLowerCase()}))
  .sort((a,b)=>(b.date||"").localeCompare(a.date||"")||b.issueNumber-a.issueNumber);
}

export function reproductionSummary(records,trial,charter,proposal,bubbles,artifacts){
 const visible=reproductionsForTrial(records,trial,charter,proposal,bubbles,artifacts);
 return {total:visible.length,
  counts:Object.fromEntries(REPRO_OUTCOMES.map(v=>[v,visible.filter(x=>x.outcome===v).length])),
  sameAccount:visible.filter(v=>v.sameAccount).length,
  otherAccount:visible.filter(v=>!v.sameAccount).length};
}
