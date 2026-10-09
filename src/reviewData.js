// Bruv Review Desk v0.6: challenge a specific public evidence receipt.
// No automatic truth, independence, or scientific certification is inferred.
import {ROOM_REPO,parentIssueNumber} from "./roomData.js";
import {evidenceForBubble,cleanEvidenceText} from "./evidenceData.js";
export const REVIEW_MARKER="<!-- bubblenest:review:v1 -->";
export const REVIEW_KINDS=["Source inspection","Method audit","Reproduction attempt","Critical assessment"];
export const REVIEW_FINDINGS=["Corroborates","Challenges","Inconclusive","More work needed"];
export const REVIEW_RELATIONS=["No known relationship (self-declared)","Collaborator or contributor","Unknown / not disclosed"];
const section=(body,head)=>{
 const label="## "+head+"\n",start=body.indexOf(label);
 return start<0?"":body.slice(start+label.length).split(/\n## |\n---(?:\n|$)/)[0].trim().slice(0,2400);
};
const clean=(s,max=1300)=>cleanEvidenceText(s,max);
export function makeReviewDraft(v){
 const parent=parentIssueNumber(v?.bubble?.url);
 const target=parentIssueNumber(v?.receipt?.url);
 if(!parent||v.bubble?.local||v.bubble?.sample||!target||v.receipt?.parentNumber!==parent||
  !Number.isSafeInteger(v.receipt?.issueNumber)||v.receipt.issueNumber!==target||
  !REVIEW_KINDS.includes(v.kind)||!REVIEW_FINDINGS.includes(v.finding)||!REVIEW_RELATIONS.includes(v.relationship))return null;
 const findingText=clean(v.summary,900),method=clean(v.method,1300),limits=clean(v.limitations,900),
       conflict=clean(v.conflict,650),next=clean(v.next,650);
 if(!findingText||!method||!limits||!conflict)return null;
 const title="[Bruv Review] "+v.finding+": #"+target+" "+findingText.replace(/\n/g," ").slice(0,65);
 const body=[
  REVIEW_MARKER,
  "# Bruv Review Desk · review receipt",
  "## Parent bubble\n"+ROOM_REPO+"/issues/"+parent,
  "## Reviewed evidence receipt\n"+ROOM_REPO+"/issues/"+target,
  "## Check type\n"+v.kind,
  "## Finding\n"+v.finding,
  "## Relationship declaration\n"+v.relationship,
  "## Potential conflicts\n"+conflict,
  "## Review summary\n"+findingText,
  "## Method and public checks\n"+method,
  "## Limitations and uncertainty\n"+limits,
  "## Next check\n"+(next||"Open for follow-up."),
  "---",
  "This is a GitHub contributor's reported assessment. It is not an independent-verification certificate, institutional peer review, or an ownership determination."
 ].join("\n\n");
 return {title,body,url:ROOM_REPO+"/issues/new?title="+encodeURIComponent(title)+"&body="+encodeURIComponent(body)};
}
export function parseReviewIssue(issue){
 if(!issue||issue.pull_request||!Number.isSafeInteger(issue.number)||issue.number<1||
  !issue.title?.startsWith("[Bruv Review] ")||typeof issue.body!=="string"||
  !issue.body.includes(REVIEW_MARKER))return null;
 const parentNumber=parentIssueNumber(section(issue.body,"Parent bubble")),
 targetIssueNumber=parentIssueNumber(section(issue.body,"Reviewed evidence receipt")),
 kind=section(issue.body,"Check type"),finding=section(issue.body,"Finding"),
 relationship=section(issue.body,"Relationship declaration"),conflict=section(issue.body,"Potential conflicts"),
 summary=section(issue.body,"Review summary"),method=section(issue.body,"Method and public checks"),
 limitations=section(issue.body,"Limitations and uncertainty");
 if(!parentNumber||!targetIssueNumber||!REVIEW_KINDS.includes(kind)||!REVIEW_FINDINGS.includes(finding)||
  !REVIEW_RELATIONS.includes(relationship)||!conflict||!summary||!method||!limitations)return null;
 return {
  id:"review-"+issue.number,issueNumber:issue.number,parentNumber,targetIssueNumber,
  kind,finding,relationship,conflict,summary,method,limitations,
  next:section(issue.body,"Next check"),author:issue.user?.login||"Unknown GitHub account",
  date:issue.created_at||null,url:ROOM_REPO+"/issues/"+issue.number,
  closed:issue.state==="closed",updatedAt:issue.updated_at||null
 };
}
export function reviewsForBubble(reviews,bubble,receipts){
 const parent=parentIssueNumber(bubble?.url);
 if(!parent||bubble?.sample||bubble?.local)return [];
 const known=new Map(evidenceForBubble(receipts,bubble).map(r=>[r.issueNumber,r]));
 return reviews.filter(r=>r.parentNumber===parent&&known.has(r.targetIssueNumber))
   .map(r=>({...r,receiptAuthor:known.get(r.targetIssueNumber).author,
    sameAccount:known.get(r.targetIssueNumber).author.toLowerCase()===r.author.toLowerCase()}))
   .sort((a,b)=>(b.date||"").localeCompare(a.date||"")||b.issueNumber-a.issueNumber);
}
export function reviewsForReceipt(reviews,bubble,receipts,receiptNumber){
 return reviewsForBubble(reviews,bubble,receipts).filter(r=>r.targetIssueNumber===receiptNumber);
}
export function reviewActivity(reviews,bubble,receipts){
 return reviewsForBubble(reviews,bubble,receipts).map(r=>({id:r.id,date:r.date,type:"Bruv Review · "+r.finding,description:r.summary,author:r.author,url:r.url}));
}
export function reviewAccounts(reviews,bubble,receipts){
 return [...new Set(reviewsForBubble(reviews,bubble,receipts).map(r=>r.author).filter(a=>a!=="Unknown GitHub account"))].sort();
}
