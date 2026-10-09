// Bubble Rooms v0.3 public GitHub Issue protocol. Entries are proposals, not verified findings.
export const ROOM_MARKER="<!-- bubblenest:room:v1 -->";
export const ROOM_KINDS=["Experiment","Reference","Update"];
export const ROOM_STATES=["Proposed","In progress","Reported outcome"];
export const ROOM_REPO="https://github.com/MichaelWave369/bubblenest";
export function parentIssueNumber(url){
 const m=String(url||"").trim().match(/^https:\/\/github\.com\/MichaelWave369\/bubblenest\/issues\/([1-9]\d*)\/?$/);
 return m?Number(m[1]):null;
}
export function bubbleRoomPath(id){return "#/room/"+encodeURIComponent(String(id));}
export function roomIdFromHash(hash){
 const path=String(hash||"").replace(/^#\/?/,"").split("?")[0];
 if(!path.startsWith("room/"))return "";
 try{return decodeURIComponent(path.slice(5))}catch{return ""}
}
export function readRoomSection(body,heading){
 const part="## "+heading+"\n";
 const idx=body.indexOf(part);
 if(idx<0)return "";
 return body.slice(idx+part.length).split(/\n## |\n---(?:\n|$)/)[0].trim().slice(0,2500);
}
export function parseRoomEntry(issue){
 if(!issue||issue.pull_request||typeof issue.body!=="string"||!issue.body.includes(ROOM_MARKER)||!issue.title?.startsWith("[Room] "))return null;
 const n=parentIssueNumber(readRoomSection(issue.body,"Parent bubble"));
 const kind=readRoomSection(issue.body,"Entry kind");
 const status=readRoomSection(issue.body,"Status");
 const summary=readRoomSection(issue.body,"Summary");
 if(!n||!ROOM_KINDS.includes(kind)||!ROOM_STATES.includes(status)||!summary)return null;
 if(!Number.isInteger(issue.number)||issue.number<1)return null;
 return {
  id:"room-entry-"+issue.number,issueNumber:issue.number,parentNumber:n,kind,status,
  summary,method:readRoomSection(issue.body,"Method or context"),
  evidence:readRoomSection(issue.body,"Evidence and limitations"),
  next:readRoomSection(issue.body,"Next question"),
  author:issue.user?.login||"Unknown GitHub account",
  createdAt:issue.created_at||null,
  updatedAt:issue.updated_at||null,
  issueState:issue.state==="closed"?"closed":"open",
  url:ROOM_REPO+"/issues/"+issue.number
 };
}
export function roomEntriesForBubble(entries,bubble){
 const parent=parentIssueNumber(bubble?.url);
 if(!parent)return [];
 return entries.filter(e=>e.parentNumber===parent).sort((a,b)=>(b.createdAt||"").localeCompare(a.createdAt||"")||b.issueNumber-a.issueNumber);
}
export function roomParticipants(bubble,entries){
 if(!bubble)return [];
 const people=[bubble.author,...entries.map(e=>e.author)].filter(x=>x&&x!=="Unknown GitHub account");
 return [...new Set(people)].sort((a,b)=>a.localeCompare(b));
}
export function makeRoomEntry({bubble,kind,status,summary,method,evidence,next}){
 const parent=parentIssueNumber(bubble?.url);
 if(!parent||!ROOM_KINDS.includes(kind)||!ROOM_STATES.includes(status)||!String(summary||"").trim())return null;
 const clean=x=>String(x||"").trim().slice(0,2200).replace(/^## /gm,"\\## ");
 const title="[Room] "+kind+": "+clean(summary).slice(0,90).replace(/[\r\n]+/g," ");
 const body=[
  ROOM_MARKER,"# Bubble Room contribution",
  "## Parent bubble",ROOM_REPO+"/issues/"+parent,
  "## Entry kind",kind,
  "## Status",status,
  "## Summary",clean(summary),
  "## Method or context",clean(method)||"Not supplied.",
  "## Evidence and limitations",clean(evidence)||"Unverified proposal. Evidence and limitations not yet supplied.",
  "## Next question",clean(next)||"Open for discussion.",
  "---","This is a contributor-submitted record, not a verification verdict. Credit sources, describe limitations, and do not infer agreement or shared authorship."
 ].join("\n\n");
 // Heading sections have a required *single* newline after each heading for deterministic parsing.
 const normalized=body.replace(/(## (?:Parent bubble|Entry kind|Status|Summary|Method or context|Evidence and limitations|Next question))\n\n/g,"$1\n");
 return {title,body:normalized,url:ROOM_REPO+"/issues/new?title="+encodeURIComponent(title)+"&body="+encodeURIComponent(normalized)};
}
export function roomActivity(bubble,entries){
 const activity=entries.map(e=>({id:e.id,date:e.createdAt,type:e.kind,description:e.summary,author:e.author,url:e.url}));
 if(bubble?.createdAt)activity.push({id:"origin-"+bubble.id,date:bubble.createdAt,type:"Bubble created",description:bubble.title,author:bubble.author,url:bubble.url});
 return activity.sort((a,b)=>(b.date||"").localeCompare(a.date||"")||a.id.localeCompare(b.id));
}
