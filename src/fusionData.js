// Bubble Fusion v1.0: public invitations to collaborate, not automatic idea mergers.
// Every proposal preserves two independent source issues and requests explicit consent.
import {ROOM_REPO,parentIssueNumber} from "./roomData.js";
import {publicBubble} from "./bubbleGraph.js";
import {cleanEvidenceText} from "./evidenceData.js";
export const FUSION_MARKER="<!-- bubblenest:fusion:v1 -->";
export const FUSION_PHASE="PROPOSAL_AWAITING_CONTRIBUTOR_RESPONSES";
export const FUSION_MODES=["Joint experiment","Compare methods","Complementary prototypes","Creative collaboration","Open discussion"];
const issueUrl=n=>ROOM_REPO+"/issues/"+n;
const contentSection=(body,title)=>{
 const label="## "+title+"\n",i=body.indexOf(label);
 return i<0?"":body.slice(i+label.length).split(/\n## |\n---(?:\n|$)/)[0].trim().slice(0,2600);
};
const scrub=(s,max=1100)=>cleanEvidenceText(s,max).replace(/^---$/gm,"\\---");
export function validFusionPair(a,b){
 if(!publicBubble(a)||!publicBubble(b))return false;
 const one=parentIssueNumber(a.url),two=parentIssueNumber(b.url);
 return !!one&&!!two&&one!==two;
}
export function makeFusionDraft(v){
 const a=v?.a,b=v?.b;
 if(!validFusionPair(a,b)||!FUSION_MODES.includes(v.mode))return null;
 const question=scrub(v.question,750),
  plan=scrub(v.plan,1300),credits=scrub(v.credits,1100),
  boundaries=scrub(v.boundaries,1100),limits=scrub(v.limits,850);
 if(!question||!plan||!credits||!boundaries||!limits||v.understandsConsent!==true)return null;
 const na=parentIssueNumber(a.url),nb=parentIssueNumber(b.url);
 const title="[Fusion] "+v.mode+": #"+na+" + #"+nb+" · "+question.replace(/\n/g," ").slice(0,54);
 const body=[
  FUSION_MARKER,
  "# Bubble Fusion · invitation for collaboration",
  "## Bubble A\n"+issueUrl(na),
  "## Bubble B\n"+issueUrl(nb),
  "## Collaboration mode\n"+v.mode,
  "## Proposed shared question\n"+question,
  "## Suggested joint experiment or work\n"+plan,
  "## Independent attribution and credit plan\n"+credits,
  "## Ownership, consent and scope boundaries\n"+boundaries,
  "## Limitations and uncertainty\n"+limits,
  "## Consent status\n"+FUSION_PHASE,
  "---",
  "This issue is **an invitation only**. It does NOT merge either idea, grant permissions, assign intellectual ownership, imply that either original author has agreed, or certify scientific findings.",
  "Before actual joint work, invite both original contributors to respond on their own behalf and document any permissions and independent attribution. No silence-as-consent."
 ].join("\n\n");
 return {title,body,url:ROOM_REPO+"/issues/new?title="+encodeURIComponent(title)+"&body="+encodeURIComponent(body)};
}
export function parseFusionIssue(issue){
 if(!issue||issue.pull_request||!Number.isSafeInteger(issue.number)||issue.number<1||
  typeof issue.body!=="string"||!issue.body.includes(FUSION_MARKER)||!issue.title?.startsWith("[Fusion] "))return null;
 const aNumber=parentIssueNumber(contentSection(issue.body,"Bubble A"));
 const bNumber=parentIssueNumber(contentSection(issue.body,"Bubble B"));
 const mode=contentSection(issue.body,"Collaboration mode");
 const question=contentSection(issue.body,"Proposed shared question");
 const plan=contentSection(issue.body,"Suggested joint experiment or work");
 const credits=contentSection(issue.body,"Independent attribution and credit plan");
 const boundaries=contentSection(issue.body,"Ownership, consent and scope boundaries");
 const limits=contentSection(issue.body,"Limitations and uncertainty");
 const phase=contentSection(issue.body,"Consent status");
 if(!aNumber||!bNumber||aNumber===bNumber||!FUSION_MODES.includes(mode)||!question||!plan||!credits||!boundaries||!limits||phase!==FUSION_PHASE)return null;
 return {id:"fusion-"+issue.number,issueNumber:issue.number,aNumber,bNumber,mode,question,plan,credits,boundaries,limits,phase,
  author:issue.user?.login||"Unknown GitHub account",date:issue.created_at||null,
  url:issueUrl(issue.number),closed:issue.state==="closed"};
}
export function visibleFusionIssues(records,bubbles){
 const available=new Set(bubbles.filter(publicBubble).map(b=>parentIssueNumber(b.url)));
 return records.filter(x=>available.has(x.aNumber)&&available.has(x.bNumber))
  .sort((a,b)=>(b.date||"").localeCompare(a.date||"")||b.issueNumber-a.issueNumber);
}
export function relatedFusions(records,bubbles,bubble){
 const n=parentIssueNumber(bubble?.url);
 if(!n||!publicBubble(bubble))return [];
 return visibleFusionIssues(records,bubbles).filter(x=>x.aNumber===n||x.bNumber===n);
}
export function fusionPair(records,bubbles,a,b){
 if(!validFusionPair(a,b))return [];
 const na=parentIssueNumber(a.url),nb=parentIssueNumber(b.url);
 return visibleFusionIssues(records,bubbles).filter(x=>[x.aNumber,x.bNumber].includes(na)&&[x.aNumber,x.bNumber].includes(nb));
}
