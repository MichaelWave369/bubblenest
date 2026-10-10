// v1.8 Dossier Time Machine: compare an UNTRUSTED imported snapshot against visible records.
// Does not authenticate a researcher, verify science, or prove a missing GitHub Issue was deleted.
import {DOSSIER_KIND,DOSSIER_VERSION} from "./reproductionDossier.js";
import {ROOM_REPO} from "./roomData.js";

export const DIFF_KIND="bubblenest.reproduction-dossier-diff";
export const DIFF_VERSION="1.8.0";
export const MAX_DOSSIER_IMPORT_BYTES=2*1024*1024;
const issue=n=>ROOM_REPO+"/issues/"+n;
const obj=x=>!!x&&typeof x==="object"&&!Array.isArray(x);
const str=(x,max=6000)=>typeof x==="string"&&x.length<=max;
const int=x=>Number.isSafeInteger(x)&&x>0;
const fields={
 artifact:["kind","name","version","fileBytes","digest","digestStatus","artifactURL","provenance","environment","steps","license","limitations","author","date"],
 check:["filename","observedBytes","observedDigest","referenceDigest","referenceBytes","result","acquisition","environment","limitations","author","date"],
 reproduction:["outcome","sameAccount","artifactNumber","artifactDigest","artifactVersion","referenceOutcome","method","environment","controls","observations","deviations","limitations","stopReason","author","date"]
};
const chainKeys=["origin_a","origin_b","fusion","charter","original_trial"];
const record=(r)=>{
 if(!obj(r)||!int(r.issueNumber)||r.url!==issue(r.issueNumber))return false;
 return Object.values(r).every(v=>typeof v==="string"?str(v):true);
};
const unique=records=>new Set(records.map(r=>r.issueNumber)).size===records.length;
function fieldDiff(before,after,names){
 return names.filter(k=>JSON.stringify(before[k]??null)!==JSON.stringify(after[k]??null));
}
const compareRows=(oldRows,newRows,keys)=>{
 const older=new Map(oldRows.map(x=>[x.issueNumber,x])),current=new Map(newRows.map(x=>[x.issueNumber,x]));
 const ids=[...new Set([...older.keys(),...current.keys()])].sort((a,b)=>a-b);
 return {
  added:ids.filter(id=>!older.has(id)).map(id=>current.get(id)),
  noLongerVisible:ids.filter(id=>!current.has(id)).map(id=>older.get(id)),
  changed:ids.filter(id=>older.has(id)&&current.has(id))
   .map(id=>({issueNumber:id,url:current.get(id).url,
    fields:fieldDiff(older.get(id),current.get(id),keys)})).filter(x=>x.fields.length>0),
  unchanged:ids.filter(id=>older.has(id)&&current.has(id)&&!fieldDiff(older.get(id),current.get(id),keys).length).length
 };
};
function normalize(d){
 const checkRows=d.artifacts.flatMap(a=>a.byte_checks.map(c=>({...c,parentArtifact:a.issueNumber})));
 return {artifacts:d.artifacts,reproductions:d.reproductions,checks:checkRows};
}
export function validateDossierImport(d){
 const errors=[];
 if(!obj(d))return {ok:false,errors:["Not an object."]};
 if(d.kind!==DOSSIER_KIND||d.schema_version!==DOSSIER_VERSION)errors.push("Expected a Bubble Nest reproduction dossier schema v1.7.0.");
 if(!str(d.generated_at,80)||Number.isNaN(Date.parse(d.generated_at)))errors.push("Invalid snapshot timestamp.");
 if(!obj(d.source)||d.source.repository!==ROOM_REPO||d.source.coverage!=="PARTIAL_OR_UNKNOWN"||
  d.source.signed!==false||d.source.independent_verification!==false||d.source.execution_authorized!==false)
  errors.push("Missing or altered source provenance and uncertainty declarations.");
 if(d.caveat!=="INVENTORY_ONLY_NOT_A_VERIFICATION_SCORE_OR_AUTHORIZATION")errors.push("Missing required epistemic caveat.");
 const p=d.provenance;
 if(!obj(p)||chainKeys.some(k=>!obj(p[k])))errors.push("Missing source chain.");
 else {
  for(const k of chainKeys){
   if(!str(p[k].url,200)||!/^https:\/\/github\.com\/MichaelWave369\/bubblenest\/issues\/[1-9]\d*$/.test(p[k].url))
    errors.push("Invalid source chain URL: "+k);
   if(k!=="origin_a"&&k!=="origin_b"&&(!int(p[k].issueNumber)||p[k].url!==issue(p[k].issueNumber)))
    errors.push("Inconsistent source Issue number: "+k);
  }
  if(p.origin_a.url===p.origin_b.url)errors.push("Original sources must remain distinct.");
 }
 if(!Array.isArray(d.artifacts)||!Array.isArray(d.reproductions)||d.artifacts.length>300||
  d.reproductions.length>300)errors.push("Missing or excessive record arrays.");
 else {
  if(!d.artifacts.every(record)||!d.reproductions.every(record)||
   !unique(d.artifacts)||!unique(d.reproductions))errors.push("Malformed or duplicate records.");
  const checks=[];
  for(const a of d.artifacts){
   if(!obj(a)||!Array.isArray(a.byte_checks)||a.byte_checks.length>300){errors.push("Malformed nested Byte Check records.");continue;}
   for(const c of a.byte_checks){
    if(!record(c))errors.push("Malformed Byte Check record.");
    checks.push(c);
   }
  }
  if(checks.length>600||!unique(checks))errors.push("Excessive or duplicate Byte Check records.");
  if(!d.artifacts.every(a=>obj(a)&&Array.isArray(a.byte_checks)&&a.byte_checks.every(c=>obj(c)&&str(c.result,80)))||
   !d.reproductions.every(r=>str(r.outcome,80)))errors.push("Invalid outcome fields.");
 }
 if(obj(d.counts)&&typeof d.counts.artifacts==="number"&&d.counts.artifacts!==d.artifacts?.length)
  errors.push("Artifact count contradicts snapshot inventory.");
 const ok=!errors.length;
 return {ok,errors:errors.slice(0,12)};
}
export function compareDossiers(imported,current){
 const oldCheck=validateDossierImport(imported),newCheck=validateDossierImport(current);
 if(!oldCheck.ok||!newCheck.ok)return {ok:false,errors:[...oldCheck.errors,...newCheck.errors].slice(0,12)};
 const oldP=imported.provenance,newP=current.provenance;
 if(chainKeys.some(k=>oldP[k].url!==newP[k].url))
  return {ok:false,errors:["These dossiers reference different source chains. Cross-project comparisons are blocked."]};
 const older=normalize(imported),newer=normalize(current);
 const checks=compareRows(older.checks,newer.checks,[...fields.check,"parentArtifact"]);
 const a=compareRows(older.artifacts,newer.artifacts,fields.artifact);
 const reps=compareRows(older.reproductions,newer.reproductions,fields.reproduction);
 const sourceChanges=chainKeys.map(k=>({
  node:k,fields:fieldDiff(oldP[k],newP[k],
   k==="original_trial"?["author","finding","question","procedure","observations","controls","limitations"]:
   k==="charter"?["objective","methods","metrics","limitations","phase"]:["title","author","question","mode"])
 })).filter(x=>x.fields.length);
 const oldGaps=Array.isArray(imported.gaps)?imported.gaps.filter(g=>obj(g)&&str(g.code,100)).map(g=>g.code):[];
 const newGaps=Array.isArray(current.gaps)?current.gaps.filter(g=>obj(g)&&str(g.code,100)).map(g=>g.code):[];
 return {
  ok:true,kind:DIFF_KIND,schema_version:DIFF_VERSION,
  source_trial:newP.original_trial.url,imported_timestamp:imported.generated_at,
  visible_timestamp:current.generated_at,imported_feed:imported.source.feed_status,visible_feed:current.source.feed_status,
  coverage:"PARTIAL_OR_UNKNOWN",import_trusted:false,signed:false,scientific_verdict:false,
  sources:sourceChanges,artifacts:a,byte_checks:checks,reproductions:reps,
  flags:{newlyVisible:newGaps.filter(g=>!oldGaps.includes(g)),noLongerVisible:oldGaps.filter(g=>!newGaps.includes(g))},
  caveat:"DIFFERENCES_BETWEEN_UNTRUSTED_SNAPSHOTS_NOT_PROOF_OF_ISSUE_DELETION_OR_SCIENTIFIC_CHANGE"
 };
}
const md=s=>String(s??"").replace(/[\r\n\t]+/g," ").replace(/([#*_~\x60\[\]<>|\\])/g,"\\$1").slice(0,1500);
export function dossierDiffMarkdown(d){
 if(!d?.ok||d.kind!==DIFF_KIND)return "";
 const lines=[
  "# Reproduction Dossier Time Machine","",
  "**UNTRUSTED SNAPSHOTS · PARTIAL COVERAGE · NO SCIENTIFIC VERDICT**","",
  "- Original Trial: "+md(d.source_trial),
  "- Imported export: "+md(d.imported_timestamp)+" (feed "+md(d.imported_feed)+")",
  "- Currently visible snapshot: "+md(d.visible_timestamp)+" (feed "+md(d.visible_feed)+")","",
  "Missing now means **not visible in the current snapshot**, not deleted or disproven.",""
 ];
 for(const [label,part]of [["Artifacts",d.artifacts],["Byte Checks",d.byte_checks],["Reproduction reports",d.reproductions]]){
  lines.push("## "+label,"",
   "- Newly visible: "+part.added.length,
   "- No longer visible: "+part.noLongerVisible.length,
   "- Changed fields: "+part.changed.length,
   "- Unchanged: "+part.unchanged,"");
  for(const r of part.added)lines.push("- NEW #"+r.issueNumber+": "+md(r.url));
  for(const r of part.noLongerVisible)lines.push("- NOT VISIBLE NOW #"+r.issueNumber+": "+md(r.url));
  for(const r of part.changed)lines.push("- CHANGED #"+r.issueNumber+" fields: "+r.fields.map(md).join(", ")+"; "+md(r.url));
  lines.push("");
 }
 lines.push("## Source record changes","");
 for(const v of d.sources)lines.push("- "+md(v.node)+": "+v.fields.map(md).join(", "));
 if(!d.sources.length)lines.push("- None detected in compared fields.");
 lines.push("","## Rule-based flag differences","",
  "- Newly visible flags: "+(d.flags.newlyVisible.map(md).join(", ")||"None"),
  "- Flags no longer visible: "+(d.flags.noLongerVisible.map(md).join(", ")||"None"),"",
  "**Comparison is untrusted data only. Ledger Above Bruv.**","");
 return lines.join("\n");
}
