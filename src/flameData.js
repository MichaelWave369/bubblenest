// Claim to Flame Arena v0.7: questions and references, not an automated truth engine.
import {ROOM_REPO,parentIssueNumber} from "./roomData.js";
import {cleanEvidenceText,evidenceForBubble} from "./evidenceData.js";
import {reviewsForBubble} from "./reviewData.js";

export const FLAME_MARKER="<!-- bubblenest:flame:v1 -->";
export const FLAME_ROUNDS=[
 {name:"State the Claim",prompt:"What exactly is being claimed, and what would make it false?"},
 {name:"Show the Sauce",prompt:"Which source, observation or method actually supports this claim?"},
 {name:"Turn Up the Heat",prompt:"What test could distinguish the claim from an alternative?"},
 {name:"Back to the Kitchen",prompt:"What correction, limitation or revision is needed?"}
];
const ROUND_NAMES=FLAME_ROUNDS.map(x=>x.name);
const section=(body,head)=>{
 const marker="## "+head+"\n",i=body.indexOf(marker);
 return i<0?"":body.slice(i+marker.length).split(/\n## |\n---(?:\n|$)/)[0].trim().slice(0,2400);
};
const safe=s=>cleanEvidenceText(s,1100).replace(/^---$/gm,"\\---");
export function makeFlameChallenge(v){
 const parent=parentIssueNumber(v?.bubble?.url);
 if(!parent||v.bubble?.sample||v.bubble?.local||!ROUND_NAMES.includes(v.round))return null;
 const question=safe(v.question),check=safe(v.proposedCheck),limits=safe(v.limits);
 if(!question||!check||!limits)return null;
 const target=v.receipt||null;
 if(target){
  const targetNumber=parentIssueNumber(target.url);
  if(!Number.isSafeInteger(target.issueNumber)||target.issueNumber!==targetNumber||target.parentNumber!==parent)return null;
 }
 const title="[Flame] "+v.round+": "+question.replace(/\n/g," ").slice(0,78);
 const body=[
  FLAME_MARKER,
  "# Claim to Flame · open evidence challenge",
  "## Parent bubble\n"+ROOM_REPO+"/issues/"+parent,
  "## Challenge round\n"+v.round,
  "## Question\n"+question,
  "## Proposed discriminating check\n"+check,
  "## Limits and uncertainty\n"+limits,
  "## Referenced evidence receipt\n"+(target?ROOM_REPO+"/issues/"+target.issueNumber:"Not supplied."),
  "---",
  "This is an open question from a contributor. Challenges and receipts are not proof of correctness, priority, scientific review, or wrongdoing. Sauce Before Source."
 ].join("\n\n");
 return {title,body,url:ROOM_REPO+"/issues/new?title="+encodeURIComponent(title)+"&body="+encodeURIComponent(body)};
}
export function parseFlameChallenge(issue){
 if(!issue||issue.pull_request||!Number.isSafeInteger(issue.number)||issue.number<1||
 !issue.title?.startsWith("[Flame] ")||typeof issue.body!=="string"||!issue.body.includes(FLAME_MARKER))return null;
 const parentNumber=parentIssueNumber(section(issue.body,"Parent bubble"));
 const round=section(issue.body,"Challenge round");
 const question=section(issue.body,"Question");
 const proposedCheck=section(issue.body,"Proposed discriminating check");
 const limits=section(issue.body,"Limits and uncertainty");
 const rawTarget=section(issue.body,"Referenced evidence receipt");
 const targetNumber=rawTarget==="Not supplied."?null:parentIssueNumber(rawTarget);
 if(!parentNumber||!ROUND_NAMES.includes(round)||!question||!proposedCheck||!limits||(rawTarget!=="Not supplied."&&!targetNumber))return null;
 return {id:"flame-"+issue.number,issueNumber:issue.number,parentNumber,round,question,proposedCheck,limits,
  targetNumber,author:issue.user?.login||"Unknown GitHub account",date:issue.created_at||null,url:ROOM_REPO+"/issues/"+issue.number};
}
export function challengesForBubble(challenges,bubble,receipts){
 const parent=parentIssueNumber(bubble?.url);
 if(!parent||bubble?.local||bubble?.sample)return [];
 const known=new Set(evidenceForBubble(receipts,bubble).map(x=>x.issueNumber));
 return challenges.filter(c=>c.parentNumber===parent&&(!c.targetNumber||known.has(c.targetNumber)))
 .sort((a,b)=>(b.date||"").localeCompare(a.date||"")||b.issueNumber-a.issueNumber);
}
export function arenaCounts(bubble,receipts,reviews,challenges){
 const evidence=evidenceForBubble(receipts,bubble);
 const checks=reviewsForBubble(reviews,bubble,receipts);
 const open=challengesForBubble(challenges,bubble,receipts);
 const stances=["Supports","Challenges","Mixed","Undetermined"];
 const findings=["Corroborates","Challenges","Inconclusive","More work needed"];
 return {
  evidence:evidence.length,reviews:checks.length,questions:open.length,
  stances:Object.fromEntries(stances.map(s=>[s,evidence.filter(x=>x.stance===s).length])),
  findings:Object.fromEntries(findings.map(s=>[s,checks.filter(x=>x.finding===s).length]))
 };
}
