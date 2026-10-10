// Bubble Fusion Charters v1.2: planned scope, not a contract or authorized execution.
import {ROOM_REPO,parentIssueNumber} from "./roomData.js";
import {cleanEvidenceText} from "./evidenceData.js";
import {visibleFusionIssues} from "./fusionData.js";

export const CHARTER_MARKER="<!-- bubblenest:fusion-charter:v1 -->";
export const CHARTER_PHASE="DRAFT_FOR_PUBLIC_REVIEW_NOT_AUTHORIZED";
export const CHARTER_MODES=["Experiment protocol","Prototype plan","Creative production","Research comparison","Other pilot"];
const issueLink=n=>ROOM_REPO+"/issues/"+n;
const scrub=(x,max=1800)=>cleanEvidenceText(x,max).replace(/^---$/gm,"\\---");
const section=(body,heading)=>{
 const tag="\n## "+heading+"\n",start=body.indexOf(tag);
 return start<0?"":body.slice(start+tag.length).split(/\n## |\n---(?:\n|$)/)[0].trim().slice(0,2600);
};
export function availableCharterProposal(proposal,bubbles){
 return !!proposal&&Number.isSafeInteger(proposal.issueNumber)&&proposal.issueNumber>0&&
  visibleFusionIssues([proposal],bubbles).length===1;
}
export function makeCharterDraft({proposal,bubbles,mode,objective,deliverable,methods,metrics,credit,rights,privacy,stop,checkpoint,limitations,acknowledged}={}){
 if(!availableCharterProposal(proposal,bubbles)||!CHARTER_MODES.includes(mode)||acknowledged!==true)return null;
 const fields={objective:scrub(objective,800),deliverable:scrub(deliverable,950),methods:scrub(methods,1300),
  metrics:scrub(metrics,900),credit:scrub(credit,850),rights:scrub(rights,950),privacy:scrub(privacy,850),
  stop:scrub(stop,800),checkpoint:scrub(checkpoint,750),limitations:scrub(limitations,900)};
 if(Object.values(fields).some(s=>!s))return null;
 const title="[Fusion Charter] "+mode+": #"+proposal.issueNumber+" · "+fields.objective.replace(/\n/g," ").slice(0,60);
 const body=[
  CHARTER_MARKER,
  "# Bubble Fusion · proposed collaboration charter",
  "## Fusion invitation\n"+issueLink(proposal.issueNumber),
  "## Origin bubble A\n"+issueLink(proposal.aNumber),
  "## Origin bubble B\n"+issueLink(proposal.bNumber),
  "## Charter mode\n"+mode,
  "## Shared objective\n"+fields.objective,
  "## Deliverable and acceptance criteria\n"+fields.deliverable,
  "## Method and responsibilities\n"+fields.methods,
  "## Evidence and evaluation plan\n"+fields.metrics,
  "## Separate origins and attribution\n"+fields.credit,
  "## Permissions and license boundaries\n"+fields.rights,
  "## Privacy and safety controls\n"+fields.privacy,
  "## Stop conditions and withdrawal\n"+fields.stop,
  "## Review checkpoint\n"+fields.checkpoint,
  "## Risks and uncertainty\n"+fields.limitations,
  "## Charter status\n"+CHARTER_PHASE,
  "---",
  "Charter is a **planning document only**. No assent, legal consent, rights transfer, authority to execute or peer-reviewed status is established here. Each source participant must separately approve specific permissions before work starts, and private data must not be uploaded without permission."
 ].join("\n\n");
 return {title,body,url:ROOM_REPO+"/issues/new?title="+encodeURIComponent(title)+"&body="+encodeURIComponent(body)};
}
export function parseCharterIssue(issue){
 if(!issue||issue.pull_request||!Number.isSafeInteger(issue.number)||issue.number<1||
  !issue.title?.startsWith("[Fusion Charter] ")||typeof issue.body!=="string"||
  !issue.body.includes(CHARTER_MARKER))return null;
 const fusionNumber=parentIssueNumber(section(issue.body,"Fusion invitation"));
 const aNumber=parentIssueNumber(section(issue.body,"Origin bubble A"));
 const bNumber=parentIssueNumber(section(issue.body,"Origin bubble B"));
 const mode=section(issue.body,"Charter mode");
 const fields={
  objective:section(issue.body,"Shared objective"),
  deliverable:section(issue.body,"Deliverable and acceptance criteria"),
  methods:section(issue.body,"Method and responsibilities"),
  metrics:section(issue.body,"Evidence and evaluation plan"),
  credit:section(issue.body,"Separate origins and attribution"),
  rights:section(issue.body,"Permissions and license boundaries"),
  privacy:section(issue.body,"Privacy and safety controls"),
  stop:section(issue.body,"Stop conditions and withdrawal"),
  checkpoint:section(issue.body,"Review checkpoint"),
  limitations:section(issue.body,"Risks and uncertainty")
 };
 const phase=section(issue.body,"Charter status");
 if(!fusionNumber||!aNumber||!bNumber||aNumber===bNumber||!CHARTER_MODES.includes(mode)||
  Object.values(fields).some(s=>!s)||phase!==CHARTER_PHASE)return null;
 return {id:"charter-"+issue.number,issueNumber:issue.number,fusionNumber,aNumber,bNumber,mode,...fields,phase,
  author:issue.user?.login||"Unknown GitHub account",date:issue.created_at||null,
  url:issueLink(issue.number),closed:issue.state==="closed"};
}
export function chartersForFusion(charters,proposal,bubbles){
 if(!availableCharterProposal(proposal,bubbles))return [];
 return charters.filter(c=>c.fusionNumber===proposal.issueNumber&&c.aNumber===proposal.aNumber&&c.bNumber===proposal.bNumber)
  .sort((a,b)=>(b.date||"").localeCompare(a.date||"")||b.issueNumber-a.issueNumber);
}
export function charterCounts(charters,proposals,bubbles){
 const valid=new Set(visibleFusionIssues(proposals,bubbles).map(p=>p.issueNumber));
 return charters.filter(c=>valid.has(c.fusionNumber)&&proposals.some(p=>p.issueNumber===c.fusionNumber&&
  p.aNumber===c.aNumber&&p.bNumber===c.bNumber)).length;
}
