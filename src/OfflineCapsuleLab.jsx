import React,{useRef,useState}from"react";
import{Archive,ArrowLeftRight,CheckCircle2,ClipboardCopy,Download,FileJson,FileText,GitCompareArrows,ShieldAlert,UploadCloud,X}from"lucide-react";
import{CAPSULE_MAX_FILE_BYTES,parseCapsuleFile,verifyEvidenceCapsule}from"./evidenceCapsule.js";
import{compareCapsulePair,offlineComparisonMarkdown,capsulePairFileBase}from"./offlineCapsuleLab.js";
import"./offlineCapsuleLab.css";

const blank={capsule:null,name:"",digest:"",state:"empty",message:""};
const save=(name,contents,type)=>{
 const objectURL=URL.createObjectURL(new Blob([contents],{type}));
 const link=document.createElement("a");link.href=objectURL;link.download=name;
 document.body.appendChild(link);link.click();link.remove();URL.revokeObjectURL(objectURL);
};
const statusLabel=s=>s.replaceAll("_"," ");
const groups=[["Artifacts","artifacts"],["Byte checks","byte_checks"],["Reproduction reports","reproductions"]];
function LocalSlot({label,item,busy,onFile,onClear}){
 return <section className="ocl-slot" aria-label={"Evidence Capsule "+label}>
  <div className="ocl-slot-top"><strong>Capsule {label}</strong><span>Local JSON only · max 3 MiB</span></div>
  <label className="ocl-file"><UploadCloud size={17}/>{busy?"Calculating SHA-256 locally…":item.capsule?"Choose a replacement capsule":"Choose an Evidence Capsule"}
   <input type="file" accept=".json,application/json" aria-label={"Select Capsule "+label+" JSON"} disabled={busy} onChange={e=>onFile(label.toLowerCase(),e)}/></label>
  {item.state==="verified"&&<div className="ocl-verified">
   <span><CheckCircle2 size={15}/> Internal hash matches supplied manifest</span>
   <strong>{item.name}</strong>
   <code>{item.digest}</code>
   <small>Original Trial: {item.capsule.dossier.provenance.original_trial.url}</small>
   <button type="button" onClick={()=>onClear(label.toLowerCase())}><X size={15}/> Clear</button>
  </div>}
  {item.state==="invalid"&&<p role="alert" className="ocl-error">{item.message}</p>}
  {item.state==="empty"&&<p className="ocl-hint">Use a previously exported Bubble Nest v2.0 Evidence Capsule. Its full dossier and checksum are checked entirely in this browser.</p>}
 </section>;
}
function RecordGroup({label,part}){
 return <section className="ocl-group">
  <div className="ocl-group-head"><strong>{label}</strong>
   <small>{part.added.length} B-only · {part.noLongerVisible.length} A-only · {part.changed.length} changed · {part.unchanged} unchanged</small></div>
  {part.added.map(x=><div key={"b"+x.issueNumber} className="ocl-record"><span>ONLY IN B</span><a target="_blank" rel="noopener noreferrer" href={x.url}>Issue #{x.issueNumber}</a></div>)}
  {part.noLongerVisible.map(x=><div key={"a"+x.issueNumber} className="ocl-record"><span>ONLY IN A</span><a target="_blank" rel="noopener noreferrer" href={x.url}>Issue #{x.issueNumber}</a></div>)}
  {part.changed.map(x=><div key={"c"+x.issueNumber} className="ocl-record"><span>FIELDS DIFFER</span>
   <a target="_blank" rel="noopener noreferrer" href={x.url}>Issue #{x.issueNumber}</a>
   <small>{x.fields.join(", ")}</small></div>)}
  {!part.added.length&&!part.noLongerVisible.length&&!part.changed.length&&
   <p className="ocl-hint">No differences detected in the compared fields. That does not establish scientific validity or a complete record.</p>}
 </section>;
}
export default function OfflineCapsuleLab(){
 const [items,setItems]=useState({a:blank,b:blank});
 const [loading,setLoading]=useState({a:false,b:false});
 const [result,setResult]=useState(null),[running,setRunning]=useState(false),[notice,setNotice]=useState("");
 const requests=useRef({a:0,b:0});
 const choose=async(slot,event)=>{
  const file=event.target.files?.[0];event.target.value="";
  if(!file)return;
  const id=++requests.current[slot];
  setItems(prev=>({...prev,[slot]:blank}));setResult(null);setNotice("");
  if(file.size>CAPSULE_MAX_FILE_BYTES){
   setItems(prev=>({...prev,[slot]:{...blank,state:"invalid",message:"The selected file exceeds 3 MiB and was not processed."}}));
   return;
  }
  setLoading(prev=>({...prev,[slot]:true}));
  try{
   const capsule=parseCapsuleFile(await file.text());
   const verification=await verifyEvidenceCapsule(capsule);
   if(id!==requests.current[slot])return;
   if(!verification.ok){
    setItems(prev=>({...prev,[slot]:{...blank,state:"invalid",
     message:"Rejected "+verification.status+": "+verification.errors.join("; ").slice(0,800)}}));
    return;
   }
   setItems(prev=>({...prev,[slot]:{state:"verified",capsule,
    name:file.name.slice(0,170),digest:verification.computed.digest,message:""}}));
  }catch(e){
   if(id===requests.current[slot])setItems(prev=>({...prev,[slot]:{...blank,state:"invalid",
    message:"Cannot read this local capsule: "+String(e.message||e).slice(0,500)}}));
  }finally{
   if(id===requests.current[slot])setLoading(prev=>({...prev,[slot]:false}));
  }
 };
 const clear=slot=>{
  requests.current[slot]++;
  setLoading(prev=>({...prev,[slot]:false}));setItems(prev=>({...prev,[slot]:blank}));
  setResult(null);setNotice("");
 };
 const swap=()=>{
  requests.current.a++;requests.current.b++;
  setItems(prev=>({a:prev.b,b:prev.a}));setResult(null);setNotice("");
 };
 const run=async()=>{
  if(!items.a.capsule||!items.b.capsule)return;
  setRunning(true);setResult(null);setNotice("");
  try{
   const report=await compareCapsulePair(items.a.capsule,items.b.capsule);
   setResult(report);
  }catch(e){
   setResult({ok:false,status:"COMPARISON_UNAVAILABLE",errors:[String(e.message||e)]});
  }finally{setRunning(false)}
 };
 const download=format=>{
  if(!result?.ok)return;
  try{
   const stem=capsulePairFileBase(result);
   save(stem+(format==="json"?".json":".md"),
    format==="json"?JSON.stringify(result,null,2)+"\n":offlineComparisonMarkdown(result),
    format==="json"?"application/json":"text/markdown");
   setNotice("Comparison downloaded locally. Nothing uploaded or published.");
  }catch{setNotice("Browser download is unavailable; comparison details remain on screen.");}
 };
 const copy=async()=>{
  if(!result?.ok)return;
  try{await navigator.clipboard.writeText(offlineComparisonMarkdown(result));
   setNotice("Comparison copied locally. Treat all research fields as untrusted data.");
  }catch{setNotice("Clipboard unavailable. Download the Markdown summary instead.");}
 };
 return <section className="ocl-page" aria-label="Offline Evidence Capsule Comparison Lab">
  <div className="ocl-hero"><div className="ocl-eyebrow"><Archive size={15}/> OFFLINE CAPSULE LAB · v2.1</div>
   <h1>Two capsules. <em>One evidence comparison.</em></h1>
   <p>Inspect two portable research records directly in your browser, even without a working GitHub feed.
   Each internal SHA-256 must match before their contents can be compared. Nothing is uploaded.</p></div>
  <div className="ocl-warning"><ShieldAlert size={20}/><p><strong>Locally consistent is not independently authenticated.</strong>
   Either publisher could have altered their dossier and recalculated its SHA-256. The lab compares untrusted snapshots.
   A missing record does not prove deletion, and different results do not by themselves disprove scientific claims.</p></div>
  <div className="ocl-pair">
   <LocalSlot label="A" item={items.a} busy={loading.a} onFile={choose} onClear={clear}/>
   <LocalSlot label="B" item={items.b} busy={loading.b} onFile={choose} onClear={clear}/>
  </div>
  <div className="ocl-controls"><button type="button" className="ocl-swap" onClick={swap} disabled={loading.a||loading.b||running}>
   <ArrowLeftRight size={16}/> Swap A and B</button>
   <button type="button" className="ocl-compare" onClick={run}
    disabled={!items.a.capsule||!items.b.capsule||loading.a||loading.b||running}>
    <GitCompareArrows size={17}/>{running?"Rechecking capsules…":"Verify both and compare evidence"}</button></div>
  {result&&!result.ok&&<div className="ocl-error-block" role="alert"><strong>{statusLabel(result.status)}</strong>
   {result.errors?.map((e,i)=><p key={i}>{e}</p>)}<p>Neither capsule's scientific contents have been certified.</p></div>}
  {result?.ok&&<div className="ocl-results">
   <h2>{result.status==="SAME_CANONICAL_DOSSIER_CONTENT"?"Same canonical dossier content":"Differences between the two dossiers"}</h2>
   <p className="ocl-result-note">Both included SHA-256 checks were recalculated locally. Neither source was authenticated, and the two snapshots have no proven chronological order.</p>
   <div className="ocl-metrics"><div><strong>{result.changes.only_a}</strong><span>Only in A</span></div>
    <div><strong>{result.changes.only_b}</strong><span>Only in B</span></div>
    <div><strong>{result.changes.changed}</strong><span>Changed records</span></div>
    <div><strong>{result.changes.unchanged}</strong><span>Unchanged records</span></div></div>
   {groups.map(([label,key])=><RecordGroup key={key} label={label} part={result.diff[key]}/>)}
   {result.diff.sources.length>0&&<div className="ocl-group"><strong>Original research fields also differ</strong>
    {result.diff.sources.map(s=><p key={s.node}>{s.node.replaceAll("_"," ")}: {s.fields.join(", ")}</p>)}</div>}
   <div className="ocl-group"><strong>Visible evidence-gap flags</strong>
    <p>Only in A: {result.diff.flags.noLongerVisible.join(", ")||"None"}</p>
    <p>Only in B: {result.diff.flags.newlyVisible.join(", ")||"None"}</p></div>
   <div className="ocl-export"><h3>Export this comparison</h3><p>The report contains references and untrusted contributor claims.
    Human interpretation is required; nothing is posted or automatically sent to an agent.</p>
    <div><button type="button" onClick={()=>download("json")}><FileJson size={16}/> Download JSON</button>
     <button type="button" onClick={()=>download("md")}><FileText size={16}/> Download Markdown</button>
     <button type="button" onClick={copy}><ClipboardCopy size={16}/> Copy summary</button></div></div>
  </div>}
  {notice&&<p className="ocl-notice" role="status">{notice}</p>}
  <p className="ocl-footer">Source lineage is compared by exact original Bubble A/B, Fusion, Charter and Trial Issue URLs.
   This is a browser-only research comparison, not an execution engine, a digital signature or a scientific verdict.
   <strong> Ledger Above Bruv.</strong></p>
 </section>;
}
