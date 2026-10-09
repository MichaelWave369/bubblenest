// Bubble Evolution v0.4: contributor-reported stages, not scientific certification.
import {parentIssueNumber,ROOM_REPO} from "./roomData.js";

export const EVOLUTION_MARKER="<!-- bubblenest:evolution:v1 -->";
export const EVOLUTION_STAGES=[
 {id:"Spark",detail:"The original question or idea",short:"Ask"},
 {id:"Hypothesis",detail:"A clear statement that can be challenged",short:"Explain"},
 {id:"Experiment",detail:"A planned or performed test",short:"Test"},
 {id:"Evidence",detail:"Documented observations or sources",short:"Inspect"},
 {id:"Revision",detail:"What changed after scrutiny",short:"Revise"}
];
export const EVOLUTION_STAGE_NAMES=EVOLUTION_STAGES.map(s=>s.id);
export const EVOLUTION_OUTCOMES=["Proposal","Work in progress","Reported result"];
export function splitSection(body,title){
 const prefix="## "+title+"\n";const at=body.indexOf(prefix);
 if(at<0)return "";
 return body.slice(at+prefix.length).split(/\n## |\n---(?:\n|$)/)[0].trim().slice(0,2500);
}
const isPublicParent=b=>!!(b&&!b.sample&&!b.local&&parentIssueNumber(b.url));
const validEntry=(v)=>!!(isPublicParent(v?.bubble)&&EVOLUTION_STAGE_NAMES.includes(v.stage)&&EVOLUTION_OUTCOMES.includes(v.outcome)&&String(v.statement||"").trim()&&String(v.limits||"").trim()&&(!["Experiment","Evidence"].includes(v.stage)||String(v.method||"").trim()));
function sanitize(v,limit=1900){return String(v||"").trim().slice(0,limit).replace(/^## /gm,"\\## ").replace(/\r/g,"");}
export function makeEvolutionDraft(v){
 if(!validEntry(v))return null;
 const number=parentIssueNumber(v.bubble.url),statement=sanitize(v.statement,900),limits=sanitize(v.limits,900),method=sanitize(v.method,1200),next=sanitize(v.next,800);
 const title="[Evolution] "+v.stage+": "+statement.replace(/\n/g," ").slice(0,75);
 const sections=[
  EVOLUTION_MARKER,
  "# Bubble Evolution · contributor-reported stage",
  "## Parent bubble\n"+ROOM_REPO+"/issues/"+number,
  "## Stage\n"+v.stage,
  "## Entry classification\n"+v.outcome,
  "## Claim or change\n"+statement,
  "## Method and receipts\n"+(method||"Not provided."),
  "## Limitations or uncertainty\n"+limits,
  "## Next question\n"+(next||"Open for further discussion."),
  "---",
  "Contributor-reported, **not** a verified scientific milestone. A stage may be revisited; this submission does not establish priority, authorship, originality, or truth."
 ];
 const body=sections.join("\n\n");
 return {title,body,url:ROOM_REPO+"/issues/new?title="+encodeURIComponent(title)+"&body="+encodeURIComponent(body)};
}
export function parseEvolutionIssue(issue){
 if(!issue||issue.pull_request||typeof issue.body!=="string"||!issue.body.includes(EVOLUTION_MARKER)||!issue.title?.startsWith("[Evolution] ")||!Number.isInteger(issue.number)||issue.number<1)return null;
 const parent=parentIssueNumber(splitSection(issue.body,"Parent bubble"));
 const stage=splitSection(issue.body,"Stage"),outcome=splitSection(issue.body,"Entry classification");
 const statement=splitSection(issue.body,"Claim or change"),method=splitSection(issue.body,"Method and receipts");
 const limits=splitSection(issue.body,"Limitations or uncertainty"),next=splitSection(issue.body,"Next question");
 if(!parent||!EVOLUTION_STAGE_NAMES.includes(stage)||!EVOLUTION_OUTCOMES.includes(outcome)||!statement||!limits||(["Experiment","Evidence"].includes(stage)&&(!method||method==="Not provided.")))return null;
 return {id:"evolution-"+issue.number,issueNumber:issue.number,parentNumber:parent,stage,outcome,statement,method,limits,next,
 author:issue.user?.login||"Unknown GitHub account",date:issue.created_at||null,
 updatedAt:issue.updated_at||null,closed:issue.state==="closed",
 url:ROOM_REPO+"/issues/"+issue.number};
}
export function eventsForBubble(events,bubble){
 const parent=parentIssueNumber(bubble?.url);
 if(!parent||bubble?.local||bubble?.sample)return [];
 return events.filter(e=>e.parentNumber===parent).sort((a,b)=>(a.date||"").localeCompare(b.date||"")||a.issueNumber-b.issueNumber);
}
export function currentEvolution(events,bubble){
 const ordered=eventsForBubble(events,bubble);
 const latest=ordered.at(-1);
 return {stage:latest?.stage||"Spark",reported:!!latest,latest:latest||null,stagesWithRecords:[...new Set(ordered.map(e=>e.stage))],count:ordered.length};
}
export function evolutionActivity(events,bubble){
 return eventsForBubble(events,bubble).map(e=>({id:e.id,date:e.date,type:"Evolution · "+e.stage,description:e.statement,author:e.author,url:e.url}));
}
export function evolutionAccounts(events,bubble){
 return [...new Set(eventsForBubble(events,bubble).map(e=>e.author).filter(s=>s!=="Unknown GitHub account"))].sort();
}
