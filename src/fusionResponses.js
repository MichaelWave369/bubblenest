// Fusion Response Receipts v1.1: attributable signals, not authenticated legal consent.
import {ROOM_REPO,parentIssueNumber} from "./roomData.js";
import {publicBubble} from "./bubbleGraph.js";
import {cleanEvidenceText} from "./evidenceData.js";
import {visibleFusionIssues} from "./fusionData.js";
export const RESPONSE_MARKER="<!-- bubblenest:fusion-response:v1 -->";
export const RESPONSE_KINDS=["Interested in discussing","Request changes","Decline invitation","Withdraw earlier interest"];
export const RESPONSE_ROLES=["A","B"];
export const RESPONSE_POLICY="ACCOUNT_SIGNAL_ONLY_NOT_LEGAL_CONSENT";
const url=n=>ROOM_REPO+"/issues/"+n;
const section=(body,title)=>{
 const label="\n## "+title+"\n",at=body.indexOf(label);
 return at<0?"":body.slice(at+label.length).split(/\n## |\n---(?:\n|$)/)[0].trim().slice(0,2600);
};
const clean=(value,length=1200)=>cleanEvidenceText(value,length).replace(/^---$/gm,"\\---");
const signedAccount=name=>typeof name==="string"&&/^[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,37}[a-zA-Z0-9])?$/.test(name);
export function makeFusionResponseDraft({proposal,role,kind,scope,limits,note}={}){
 if(!proposal||!Number.isSafeInteger(proposal.issueNumber)||proposal.issueNumber<1||
  !Number.isSafeInteger(proposal.aNumber)||!Number.isSafeInteger(proposal.bNumber)||
  proposal.aNumber===proposal.bNumber||!RESPONSE_ROLES.includes(role)||!RESPONSE_KINDS.includes(kind))return null;
 const source=role==="A"?proposal.aNumber:proposal.bNumber;
 const scopeText=clean(scope,1100),limitsText=clean(limits,900),noteText=clean(note,650);
 if(!scopeText||!limitsText)return null;
 const title="[Fusion Response] "+kind+": #"+proposal.issueNumber+" / source "+role;
 const body=[
  RESPONSE_MARKER,
  "# Bubble Fusion · contributor response receipt",
  "## Fusion invitation\n"+url(proposal.issueNumber),
  "## Responding source\n"+url(source),
  "## Responding role\n"+role,
  "## Response\n"+kind,
  "## Scope and permission boundaries\n"+scopeText,
  "## Limitations and reservations\n"+limitsText,
  "## Additional context\n"+(noteText||"No extra context provided."),
  "## Policy\n"+RESPONSE_POLICY,
  "---",
  "This is a publicly submitted GitHub account response. It does **not** grant a license, establish real-world identity, bind another participant, or independently verify legal consent. An expression of interest is NOT permission to start joint work."
 ].join("\n\n");
 return {title,body,url:ROOM_REPO+"/issues/new?title="+encodeURIComponent(title)+"&body="+encodeURIComponent(body)};
}
export function parseFusionResponseIssue(issue){
 if(!issue||issue.pull_request||!Number.isSafeInteger(issue.number)||issue.number<1||
  typeof issue.body!=="string"||!issue.body.includes(RESPONSE_MARKER)||
  !issue.title?.startsWith("[Fusion Response] "))return null;
 const fusionNumber=parentIssueNumber(section(issue.body,"Fusion invitation"));
 const sourceNumber=parentIssueNumber(section(issue.body,"Responding source"));
 const role=section(issue.body,"Responding role"),kind=section(issue.body,"Response");
 const scope=section(issue.body,"Scope and permission boundaries");
 const limits=section(issue.body,"Limitations and reservations");
 const note=section(issue.body,"Additional context");
 const policy=section(issue.body,"Policy");
 if(!fusionNumber||!sourceNumber||!RESPONSE_ROLES.includes(role)||!RESPONSE_KINDS.includes(kind)||
  !scope||!limits||policy!==RESPONSE_POLICY)return null;
 return {id:"fusion-response-"+issue.number,issueNumber:issue.number,fusionNumber,sourceNumber,role,kind,scope,limits,note,
  author:issue.user?.login||"Unknown GitHub account",date:issue.created_at||null,
  url:url(issue.number),closed:issue.state==="closed",updatedAt:issue.updated_at||null};
}
export function fusionResponsesForProposal(responses,proposal,bubbles){
 if(!proposal||!Number.isSafeInteger(proposal.issueNumber))return [];
 const a=bubbles.find(b=>publicBubble(b)&&parentIssueNumber(b.url)===proposal.aNumber);
 const b=bubbles.find(b=>publicBubble(b)&&parentIssueNumber(b.url)===proposal.bNumber);
 if(!a||!b)return [];
 return responses.filter(r=>r.fusionNumber===proposal.issueNumber&&
  (r.role==="A"?r.sourceNumber===proposal.aNumber:r.role==="B"&&r.sourceNumber===proposal.bNumber))
  .map(r=>{
   const source=r.role==="A"?a:b;
   const expected=source.author||"";
   const isOriginAccount=signedAccount(expected)&&signedAccount(r.author)&&expected.toLowerCase()===r.author.toLowerCase();
   return {...r,originAccountMatch:isOriginAccount,sourceAuthor:expected};
  })
  .sort((x,y)=>(y.date||"").localeCompare(x.date||"")||y.issueNumber-x.issueNumber);
}
export function fusionResponseSummary(responses,proposal,bubbles){
 const all=fusionResponsesForProposal(responses,proposal,bubbles);
 const latest=role=>all.find(r=>r.role===role&&r.originAccountMatch)||null;
 const a=latest("A"),b=latest("B");
 return {all,a,b,unmatched:all.filter(r=>!r.originAccountMatch),
  pairedInterest:!!(a?.kind==="Interested in discussing"&&b?.kind==="Interested in discussing"),
  policy:RESPONSE_POLICY};
}
export function responsesForPublicFusions(responses,proposals,bubbles){
 return visibleFusionIssues(proposals,bubbles).flatMap(p=>fusionResponsesForProposal(responses,p,bubbles));
}
