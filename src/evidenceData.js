// Evidence Ledger v0.5: public contributor receipts, never automatic verification.
import {parentIssueNumber, ROOM_REPO} from "./roomData.js";

export const EVIDENCE_MARKER="<!-- bubblenest:evidence:v1 -->";
export const EVIDENCE_KINDS=["Source","Test","Replication","Review"];
export const EVIDENCE_STANCES=["Supports","Challenges","Mixed","Undetermined"];
export const EVIDENCE_NOTICE="Contributor-reported only. No claim is certified or independently validated by Bubble Nest.";
const externalUrl=(value)=>{
 const s=String(value||"").trim();
 if(!s)return "";
 if(s.length>650)return null;
 try{
  const u=new URL(s);
  if(!["http:","https:"].includes(u.protocol)||u.username||u.password)return null;
  return u.href;
 }catch{return null;}
};
export function evidenceSection(body,title){
 const heading="## "+title+"\n";
 const i=body.indexOf(heading);
 if(i<0)return "";
 return body.slice(i+heading.length).split(/\n## |\n---(?:\n|$)/)[0].trim().slice(0,2500);
}
export function cleanEvidenceText(s,length=1300){
 return String(s||"").trim().slice(0,length).replace(/\r/g,"").replace(/^## /gm,"\\## ").replace(/^---$/gm,"\\---");
}
function publicBubble(b){return !!(b&&!b.local&&!b.sample&&parentIssueNumber(b.url));}
export function makeEvidenceDraft(value){
 if(!publicBubble(value?.bubble)||!EVIDENCE_KINDS.includes(value.kind)||!EVIDENCE_STANCES.includes(value.stance))return null;
 const summary=cleanEvidenceText(value.summary,800);
 const limitations=cleanEvidenceText(value.limitations,900);
 const method=cleanEvidenceText(value.method,1400);
 const next=cleanEvidenceText(value.next,500);
 const url=externalUrl(value.sourceUrl);
 const related=String(value.relatedEvolution||"").trim();
 if(!summary||!limitations||url===null)return null;
 if(value.kind==="Source"&&!url)return null;
 if(["Test","Replication"].includes(value.kind)&&!method)return null;
 if(value.kind==="Review"&&!method&&!url)return null;
 if(related&&parentIssueNumber(related)===null)return null;
 const parent=parentIssueNumber(value.bubble.url);
 const title="[Evidence] "+value.kind+": "+summary.replace(/\n/g," ").slice(0,85);
 const sections=[
  EVIDENCE_MARKER,
  "# Evidence Ledger · contributor receipt",
  "## Parent bubble\n"+ROOM_REPO+"/issues/"+parent,
  "## Evidence kind\n"+value.kind,
  "## Assessment\n"+value.stance,
  "## Receipt summary\n"+summary,
  "## Method and provenance\n"+(method||"Not supplied."),
  "## Public source URL\n"+(url||"Not supplied."),
  "## Related evolution issue\n"+(related||"Not supplied."),
  "## Limitations and alternatives\n"+limitations,
  "## Next question\n"+(next||"Open for further review."),
  "---",
  EVIDENCE_NOTICE
 ];
 const body=sections.join("\n\n");
 return {title,body,url:ROOM_REPO+"/issues/new?title="+encodeURIComponent(title)+"&body="+encodeURIComponent(body)};
}
export function parseEvidenceIssue(issue){
 if(!issue||issue.pull_request||!Number.isSafeInteger(issue.number)||issue.number<1||
    !issue.title?.startsWith("[Evidence] ")||typeof issue.body!=="string"||
    !issue.body.includes(EVIDENCE_MARKER))return null;
 const parentNumber=parentIssueNumber(evidenceSection(issue.body,"Parent bubble"));
 const kind=evidenceSection(issue.body,"Evidence kind");
 const stance=evidenceSection(issue.body,"Assessment");
 const summary=evidenceSection(issue.body,"Receipt summary");
 const method=evidenceSection(issue.body,"Method and provenance");
 const limitations=evidenceSection(issue.body,"Limitations and alternatives");
 const rawUrl=evidenceSection(issue.body,"Public source URL");
 const rawRelated=evidenceSection(issue.body,"Related evolution issue");
 const sourceUrl=rawUrl==="Not supplied."?"":externalUrl(rawUrl);
 const relatedEvolution=rawRelated==="Not supplied."?"":rawRelated;
 if(!parentNumber||!EVIDENCE_KINDS.includes(kind)||!EVIDENCE_STANCES.includes(stance)||!summary||!limitations||sourceUrl===null)return null;
 if(kind==="Source"&&!sourceUrl)return null;
 if(["Test","Replication"].includes(kind)&&(!method||method==="Not supplied."))return null;
 if(kind==="Review"&&(!method||method==="Not supplied.")&&!sourceUrl)return null;
 if(relatedEvolution&&parentIssueNumber(relatedEvolution)===null)return null;
 return {
  id:"evidence-"+issue.number,issueNumber:issue.number,parentNumber,kind,stance,summary,
  method:method==="Not supplied."?"":method,
  sourceUrl,relatedEvolution,limitations,
  next:evidenceSection(issue.body,"Next question"),
  author:issue.user?.login||"Unknown GitHub account",date:issue.created_at||null,
  updatedAt:issue.updated_at||null,closed:issue.state==="closed",
  url:ROOM_REPO+"/issues/"+issue.number
 };
}
export function evidenceForBubble(entries,bubble){
 const parent=parentIssueNumber(bubble?.url);
 if(!parent||bubble?.sample||bubble?.local)return [];
 return entries.filter(x=>x.parentNumber===parent).sort((a,b)=>(b.date||"").localeCompare(a.date||"")||b.issueNumber-a.issueNumber);
}
export function evidenceSummary(entries,bubble){
 const rows=evidenceForBubble(entries,bubble);
 return {total:rows.length,byKind:Object.fromEntries(EVIDENCE_KINDS.map(k=>[k,rows.filter(x=>x.kind===k).length])),byStance:Object.fromEntries(EVIDENCE_STANCES.map(k=>[k,rows.filter(x=>x.stance===k).length]))};
}
export function evidenceActivity(entries,bubble){
 return evidenceForBubble(entries,bubble).map(e=>({id:e.id,date:e.date,type:"Evidence · "+e.kind,description:e.summary,author:e.author,url:e.url}));
}
export function evidenceAccounts(entries,bubble){
 return [...new Set(evidenceForBubble(entries,bubble).map(e=>e.author).filter(a=>a!=="Unknown GitHub account"))].sort();
}
