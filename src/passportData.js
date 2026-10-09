// Bubble Passport v0.8: a client-side snapshot of visible records, NOT signed provenance.
import {publicBubble} from "./bubbleGraph.js";
import {roomEntriesForBubble} from "./roomData.js";
import {eventsForBubble} from "./evolutionData.js";
import {evidenceForBubble} from "./evidenceData.js";
import {reviewsForBubble} from "./reviewData.js";
import {challengesForBubble} from "./flameData.js";
export const PASSPORT_SCHEMA="https://michaelwave369.github.io/bubblenest/agent-spec.json";
export const PASSPORT_VERSION="0.8.0";
export const PASSPORT_KIND="bubblenest.bubble-passport";
export const PROVENANCE_LABELS={
 public:"PUBLIC_GITHUB_ISSUE_RECORD",
 local:"LOCAL_BROWSER_DRAFT",
 example:"ILLUSTRATIVE_EXAMPLE"
};
const iso=(value)=>value||null;
const ordered=(items,dateKey="createdAt")=>[...items].sort((a,b)=>
 String(a[dateKey]||"").localeCompare(String(b[dateKey]||""))||
 Number(a.issueNumber||0)-Number(b.issueNumber||0));
const pick=(obj,fields)=>Object.fromEntries(fields.map(k=>[k,obj?.[k]??null]));
function visibilityOf(b){return b.sample?"example":b.local?"local":publicBubble(b)?"public":"unconfirmed";}
export function buildPassport({bubble,roomEntries=[],evolution=[],evidence=[],reviews=[],challenges=[],feedStatus="unavailable",generatedAt}={}){
 if(!bubble||!bubble.title||!bubble.id)return null;
 const visibility=visibilityOf(bubble);
 const published=visibility==="public";
 const rooms=published?ordered(roomEntriesForBubble(roomEntries,bubble)):[],
  steps=published?ordered(eventsForBubble(evolution,bubble),"date"):[],
  receipts=published?ordered(evidenceForBubble(evidence,bubble),"date"):[],
  checks=published?ordered(reviewsForBubble(reviews,bubble,evidence),"date"):[],
  flame=published?ordered(challengesForBubble(challenges,bubble,evidence),"date"):[];
 const records={
  room_entries:rooms.map(v=>pick(v,["issueNumber","kind","status","summary","method","evidence","next","author","createdAt","url"])),
  evolution:steps.map(v=>pick(v,["issueNumber","stage","outcome","statement","method","limits","next","author","date","url"])),
  evidence:receipts.map(v=>pick(v,["issueNumber","kind","stance","summary","method","sourceUrl","limitations","relatedEvolution","next","author","date","url"])),
  reviews:checks.map(v=>pick(v,["issueNumber","targetIssueNumber","kind","finding","summary","method","limitations","relationship","conflict","sameAccount","author","date","url"])),
  challenges:flame.map(v=>pick(v,["issueNumber","round","question","proposedCheck","limits","targetNumber","author","date","url"]))
 };
 const authors=published?[bubble.author,...Object.values(records).flat().map(v=>v.author)]
  .filter(v=>v&&v!=="Unknown GitHub account"):[];
 return {
  kind:PASSPORT_KIND,schema_version:PASSPORT_VERSION,schema_url:PASSPORT_SCHEMA,
  generated_at:iso(generatedAt)||new Date().toISOString(),
  source:{
   system:"Bubble Nest static GitHub Pages client",repo:"https://github.com/MichaelWave369/bubblenest",
   method:published?"public GitHub Issues REST API snapshot":visibility==="local"?"browser local storage":"bundled illustrative examples",
   feed_status:feedStatus,
   feed_window:"up to 300 issues including closed issues",
   coverage:"PARTIAL_OR_UNKNOWN",
   snapshot_signed:false,
   independent_verification:false,
   limitations:[
    "Current snapshot may omit records due to API limits, pagination, outages, or later edits.",
    "Issue submission and GitHub account handles do not certify factual accuracy, authorship, independence, originality or priority.",
    "Contributor assessments and evolution stages are self-reported, not peer-reviewed verdicts."
   ]
  },
  bubble:{
   id:String(bubble.id),title:bubble.title,category:bubble.category||"Wildcards",
   summary:bubble.summary||"",collaboration_request:bubble.ask||"",
   evidence_and_limitations:bubble.evidence||"",author:published?bubble.author||null:null,
   created_at:published?iso(bubble.createdAt):null,url:published?bubble.url:null,
   visibility,provenance:PROVENANCE_LABELS[visibility]||"UNKNOWN",
   record_policy:published?"read-only public issue snapshot":"no public records included"
  },
  counts:Object.fromEntries(Object.entries(records).map(([key,arr])=>[key,arr.length])),
  contributors:published?[...new Set(authors)].sort((a,b)=>a.localeCompare(b)):[],
  records
 };
}
const line=v=>String(v??"").replace(/[\u0000-\u001f]+/g," ").replace(/\s+/g," ").trim();
const quote=v=>String(v??"").split(/\r?\n/).map(s=>"> "+s).join("\n");
export function passportMarkdown(passport){
 if(!passport||passport.kind!==PASSPORT_KIND)return "";
 const b=passport.bubble,lines=[
  "# Bubble Passport: "+line(b.title),"",
  "**Visibility:** "+b.visibility+" · **Origin:** "+b.provenance,
  "**Generated:** "+passport.generated_at,
  "**Source:** "+(b.url||"Private/local or illustrative: no public issue"),
  "**Coverage:** "+passport.source.coverage+" ("+passport.source.feed_status+")",
  "","## Original proposal","",quote(b.summary),"",
  "### Collaboration request","",quote(b.collaboration_request),"",
  "### Evidence and limitations","",quote(b.evidence_and_limitations)
 ];
 const labels=[["room_entries","Room contributions","summary"],
  ["evolution","Evolution","statement"],["evidence","Evidence receipts","summary"],
  ["reviews","Review attempts","summary"],["challenges","Claim to Flame challenges","question"]];
 for(const [type,label,field]of labels){
  lines.push("","## "+label,"");
  const records=passport.records[type];
  if(!records.length){lines.push("No records present in this snapshot.");continue;}
  records.forEach((r,i)=>{
   lines.push("### "+(i+1)+". "+line(r.kind||r.stage||r.round||label));
   lines.push("**Submitted by:** "+line(r.author)+" · **GitHub receipt:** "+line(r.url));
   lines.push("",quote(r[field]),"");
   if(r.limitations)lines.push("**Limitations:**",quote(r.limitations),"");
   if(r.limits)lines.push("**Uncertainty:**",quote(r.limits),"");
   if(r.evidence)lines.push("**Evidence (self-reported):**",quote(r.evidence),"");
   if(r.method)lines.push("**Method (self-reported):**",quote(r.method),"");
  });
 }
 lines.push("","## Provenance and limitations","",
  "This is a generated snapshot of available, contributor-reported records. No claims are certified.",
  ...passport.source.limitations.map(s=>"- "+s));
 return lines.join("\n")+"\n";
}
export function passportFileBase(passport){
 const slug=String(passport?.bubble?.title||"bubble").toLowerCase().normalize("NFKD")
  .replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"").slice(0,52)||"bubble";
 return "bubble-passport-"+slug+"-"+String(passport?.bubble?.id||"draft").replace(/[^a-zA-Z0-9_-]/g,"").slice(0,30);
}
