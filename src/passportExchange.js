// Passport Exchange v0.9: compare a local export with an explicitly selected user file.
// All imported content is UNTRUSTED, even if the JSON claims public provenance.
import {PASSPORT_KIND} from "./passportData.js";
import {terms} from "./bubbleGraph.js";
export const EXCHANGE_MAX_BYTES=1024*1024;
export const EXCHANGE_SUPPORTED_VERSIONS=["0.8.0","0.9.0"];
const collectionNames=["room_entries","evolution","evidence","reviews","challenges"];
const isObject=v=>v!==null&&typeof v==="object"&&!Array.isArray(v);
const nonempty=s=>typeof s==="string"&&s.trim().length>0;
const wellBounded=(s,n=5000)=>typeof s==="string"&&s.length<=n;
const publicIssue=url=>typeof url==="string"&&/^https:\/\/github\.com\/MichaelWave369\/bubblenest\/issues\/[1-9]\d*$/.test(url);
const genericUrl=url=>{try{const u=new URL(url);return ["https:","http:"].includes(u.protocol)&&!u.username&&!u.password}catch{return false}};
export function validatePassport(value){
 const errors=[];
 if(!isObject(value))return {ok:false,errors:["Not a JSON object."]};
 if(value.kind!==PASSPORT_KIND)errors.push("Incorrect passport kind.");
 if(!EXCHANGE_SUPPORTED_VERSIONS.includes(value.schema_version))errors.push("Unsupported passport version (supports v0.8.0 and v0.9.0).");
 if(!nonempty(value.generated_at)||!Number.isFinite(Date.parse(value.generated_at)))errors.push("Invalid generated_at timestamp.");
 if(!isObject(value.source)||!nonempty(value.source.feed_status)||!Array.isArray(value.source.limitations))errors.push("Missing source and coverage warnings.");
 if(!isObject(value.bubble)||!nonempty(value.bubble.title)||!nonempty(value.bubble.id))errors.push("Missing bubble identity.");
 if(isObject(value.bubble)){
  const b=value.bubble;
  if(!wellBounded(b.title,500)||!wellBounded(b.summary,10000)||!wellBounded(b.id,250))errors.push("Oversized or invalid bubble text.");
  if(!["public","local","example","unconfirmed"].includes(b.visibility))errors.push("Unknown bubble visibility.");
  if(b.visibility==="public"&&!publicIssue(b.url))errors.push("A public bubble needs a canonical Bubble Nest GitHub issue URL.");
  if(b.visibility!=="public"&&b.url!==null)errors.push("Local, example and unconfirmed exports cannot contain a public bubble URL.");
  if(!nonempty(b.provenance)||!nonempty(b.record_policy))errors.push("Missing provenance declarations.");
 }
 if(!isObject(value.records))errors.push("Missing record collections.");
 if(!isObject(value.counts))errors.push("Missing record counts.");
 if(!Array.isArray(value.contributors)||value.contributors.length>300||!value.contributors.every(x=>wellBounded(x,250)))errors.push("Invalid contributors.");
 if(isObject(value.records)){
  for(const key of collectionNames){
   const entries=value.records[key];
   if(!Array.isArray(entries)||entries.length>300){errors.push("Invalid or oversized "+key+" collection.");continue;}
   if(entries.some(x=>!isObject(x)||!Number.isInteger(x.issueNumber)||x.issueNumber<1||!publicIssue(x.url))){
    errors.push("Invalid or unscoped public issue receipt in "+key+".");
   }
   if(entries.some(x=>Object.entries(x).some(([k,v])=>typeof v==="string"&&v.length>10000||Array.isArray(v)||isObject(v)))){
    errors.push("Nested or oversized data in "+key+".");
   }
   if(value.counts?.[key]!==entries.length)errors.push("Count mismatch for "+key+".");
  }
  if(value.bubble?.visibility!=="public"&&collectionNames.some(k=>Array.isArray(value.records[k])&&value.records[k].length)){
   errors.push("Nonpublic passports must not include public research records.");
  }
 }
 if(value.source?.snapshot_signed!==false||value.source?.independent_verification!==false||value.source?.coverage!=="PARTIAL_OR_UNKNOWN")errors.push("Missing required uncertainty and unsigned-snapshot flags.");
 if(isObject(value.source)&&value.source.limitations?.some(x=>!wellBounded(x,1500)))errors.push("Malformed source limitations.");
 // This is a schema-consistency check only; the entire file is still an untrusted declaration.
 return {ok:errors.length===0,errors};
}
export function parsePassportJSON(raw){
 if(typeof raw!=="string"||new TextEncoder().encode(raw).length>EXCHANGE_MAX_BYTES)return {ok:false,errors:["Passport exceeds 1 MiB or isn't text."]};
 let value;try{value=JSON.parse(raw)}catch{return {ok:false,errors:["Invalid JSON file."]}};
 const validation=validatePassport(value);
 return validation.ok?{ok:true,passport:value,errors:[]}:{ok:false,errors:validation.errors};
}
function counts(p){return Object.fromEntries(collectionNames.map(k=>[k,p?.records?.[k]?.length||0]));}
export function comparePassports(current,imported){
 if(!validatePassport(current).ok||!validatePassport(imported).ok)return null;
 const a=new Set(terms({title:current.bubble.title,summary:current.bubble.summary}));
 const b=new Set(terms({title:imported.bubble.title,summary:imported.bubble.summary}));
 const shared=[...a].filter(x=>b.has(x)).sort();
 const onlyCurrent=[...a].filter(x=>!b.has(x)).sort();
 const onlyImported=[...b].filter(x=>!a.has(x)).sort();
 const sameCategory=!!current.bubble.category&&current.bubble.category===imported.bubble.category;
 return {
  currentTitle:current.bubble.title,importedTitle:imported.bubble.title,
  categories:[current.bubble.category,imported.bubble.category],
  sharedTerms:shared.slice(0,12),onlyCurrent:onlyCurrent.slice(0,12),onlyImported:onlyImported.slice(0,12),
  relation:shared.length?"Shared topic words":sameCategory?"Same broad category":"No lexical overlap found",
  sameCategory,publicUrls:[current.bubble.url,imported.bubble.url],
  currentCounts:counts(current),importedCounts:counts(imported),
  notes:[
   "This is an exploratory comparison of two snapshots, not evidence of collaboration, copying, common origin or verified science.",
   "Imported JSON can be edited or forged; its provenance, issue links and contributor identities are declared but NOT authenticated.",
   "Missing records or matching vocabulary are not findings about scientific truth."
  ]
 };
}
export function comparisonMarkdown(c){
 if(!c)return "";
 const lines=[
  "# Bubble Passport Exchange · Comparison","",
  "**Current:** "+c.currentTitle,"**Imported:** "+c.importedTitle,
  "**Heuristic:** "+c.relation,"",
  "## Topics and terms","",
  "**Current category:** "+String(c.categories[0]||"Unspecified"),
  "**Imported category:** "+String(c.categories[1]||"Unspecified"),
  "**Shared:** "+(c.sharedTerms.join(", ")||"None detected"),
  "**Current-only:** "+(c.onlyCurrent.join(", ")||"None detected"),
  "**Imported-only:** "+(c.onlyImported.join(", ")||"None detected"),
  "","## Source links (declared; not authenticated)","",
  "**Current:** "+(c.publicUrls[0]||"Not public"),
  "**Imported:** "+(c.publicUrls[1]||"Not public"),
  "","## Record counts · Not quality metrics",""
 ];
 for(const name of collectionNames)lines.push("- "+name+": current "+c.currentCounts[name]+" / imported "+c.importedCounts[name]);
 lines.push("","## Interpretation limits","",...c.notes.map(n=>"- "+n));
 return lines.join("\n")+"\n";
}
