import React,{useEffect,useMemo,useRef,useState}from"react";
import{ArrowRightLeft,ClipboardCopy,Download,FileJson,FileText,History,Info,RefreshCw,ShieldAlert,X}from"lucide-react";
import{MAX_DOSSIER_IMPORT_BYTES,validateDossierImport,compareDossiers,dossierDiffMarkdown}from"./dossierDiff.js";
import"./dossierTimeMachine.css";

const save=(name,contents,type)=>{
 const blob=new Blob([contents],{type}),uri=URL.createObjectURL(blob);
 const anchor=document.createElement("a");anchor.href=uri;anchor.download=name;
 document.body.appendChild(anchor);anchor.click();anchor.remove();URL.revokeObjectURL(uri);
};
const pretty=x=>String(x??"").replace(/_/g," ");
const DiffGroup=({label,data})=><div className="dt-group">
 <div className="dt-group-title"><strong>{label}</strong><small>{data.added.length} newly visible · {data.noLongerVisible.length} no longer visible · {data.changed.length} changed</small></div>
 {data.added.map(r=><div key={"a"+r.issueNumber} className="dt-item"><span>NEWLY VISIBLE</span><a href={r.url} target="_blank" rel="noopener noreferrer">Issue #{r.issueNumber}</a></div>)}
 {data.noLongerVisible.map(r=><div key={"m"+r.issueNumber} className="dt-item"><span>NOT VISIBLE NOW</span><a href={r.url} target="_blank" rel="noopener noreferrer">Issue #{r.issueNumber}</a><small>May reflect API limits or edits; not evidence of deletion</small></div>)}
 {data.changed.map(r=><div key={"c"+r.issueNumber} className="dt-item"><span>FIELDS CHANGED</span><a href={r.url} target="_blank" rel="noopener noreferrer">Issue #{r.issueNumber}</a><small>{r.fields.map(pretty).join(", ")}</small></div>)}
 {!data.added.length&&!data.noLongerVisible.length&&!data.changed.length&&<p>No differences in compared fields. {data.unchanged} unchanged visible record(s).</p>}
 </div>;
export default function DossierTimeMachine({dossier}){
 const [opened,setOpened]=useState(false),[imported,setImported]=useState(null);
 const [fileName,setFileName]=useState(""),[error,setError]=useState(""),[message,setMessage]=useState("");
 const generation=useRef(0);
 const trialIssue=dossier?.provenance?.original_trial?.issueNumber;
 useEffect(()=>{generation.current++;setImported(null);setFileName("");setError("");setMessage("");setOpened(false)},[trialIssue]);
 const diff=useMemo(()=>imported&&dossier?compareDossiers(imported,dossier):null,[imported,dossier]);
 const choose=async(event)=>{
  const file=event.target.files?.[0];event.target.value="";
  if(!file)return;
  const ticket=++generation.current;
  setImported(null);setError("");setMessage("");setFileName("");
  if(file.size>MAX_DOSSIER_IMPORT_BYTES){setError("File exceeds the 2 MiB local import limit.");return;}
  try{
   const raw=await file.text();
   if(ticket!==generation.current)return;
   const value=JSON.parse(raw);
   const checked=validateDossierImport(value);
   if(!checked.ok){setError(checked.errors.join(" "));return;}
   const comparison=compareDossiers(value,dossier);
   if(!comparison.ok){setError(comparison.errors.join(" "));return;}
   setImported(value);setFileName(file.name.slice(0,180));
  }catch{
   if(ticket===generation.current)setError("Could not parse the selected JSON file as a supported Reproduction Dossier.");
  }
 };
 const clear=()=>{generation.current++;setImported(null);setFileName("");setError("");setMessage("")};
 const exportDiff=format=>{
  if(!diff?.ok)return;
  const base="dossier-diff-trial-"+trialIssue+"-v1-8";
  try{
   if(format==="json")save(base+".json",JSON.stringify(diff,null,2)+"\n","application/json");
   else save(base+".md",dossierDiffMarkdown(diff),"text/markdown");
   setMessage("Comparison saved in this browser; nothing was posted or uploaded.");
  }catch{setMessage("Browser download failed; the comparison remains visible here.");}
 };
 const copy=async()=>{
  try{await navigator.clipboard.writeText(dossierDiffMarkdown(diff));setMessage("Comparison summary copied locally. Imported records remain untrusted.");}
  catch{setMessage("Clipboard access unavailable. Download the comparison instead.");}
 };
 return <section className="dt-panel" aria-label="Reproduction Dossier Time Machine">
  <div className="dt-head"><div><span><History size={16}/> DOSSIER TIME MACHINE · v1.8</span><h3>What changed between snapshots?</h3>
    <p>Compare an exported dossier with the currently loaded record inventory. Track newly visible receipts, changed contributor fields, missing records and disagreement flags.</p></div>
    <button type="button" aria-expanded={opened} onClick={()=>setOpened(v=>!v)}><ArrowRightLeft size={16}/>{opened?"Hide comparison":"Compare snapshots"}</button>
  </div>
  {opened&&<>
   <div className="dt-warning"><ShieldAlert size={18}/><p><strong>No deletion or truth claims.</strong> An imported JSON file is untrusted and never treated as verified evidence or instructions. Current public feed coverage is partial or unknown. A missing Issue in either snapshot may be due to GitHub pagination or edited content.</p></div>
   <div className="dt-import">
    <label className="dt-file">Import a previous Bubble Nest reproduction dossier (JSON, max 2 MiB)
     <input type="file" accept=".json,application/json" aria-label="Import previous reproduction dossier JSON" onChange={choose}/></label>
    {fileName&&<button type="button" onClick={clear}><X size={14}/> Clear local import</button>}
   </div>
   {error&&<p className="dt-error" role="alert">{error}</p>}
   {diff?.ok&&<>
    <div className="dt-meta"><span>Imported: <b>{fileName}</b><small>{diff.imported_timestamp} · feed: {diff.imported_feed}</small></span>
     <ArrowRightLeft size={18}/><span>Currently visible:<small>{diff.visible_timestamp} · feed: {diff.visible_feed}</small></span></div>
    <div className="dt-counts"><span>Newly visible<b>{diff.artifacts.added.length+diff.byte_checks.added.length+diff.reproductions.added.length}</b></span>
     <span>No longer visible<b>{diff.artifacts.noLongerVisible.length+diff.byte_checks.noLongerVisible.length+diff.reproductions.noLongerVisible.length}</b></span>
     <span>Changed records<b>{diff.artifacts.changed.length+diff.byte_checks.changed.length+diff.reproductions.changed.length}</b></span></div>
    <DiffGroup label="Artifact records" data={diff.artifacts}/>
    <DiffGroup label="Byte Check records" data={diff.byte_checks}/>
    <DiffGroup label="Reproduction reports" data={diff.reproductions}/>
    {diff.sources.length>0&&<div className="dt-flags"><strong>Original source fields changed</strong>
      {diff.sources.map(s=><p key={s.node}>{pretty(s.node)}: {s.fields.map(pretty).join(", ")}</p>)}</div>}
    <div className="dt-flags"><strong>Visible gap flags</strong>
      <p>Newly flagged: {diff.flags.newlyVisible.map(pretty).join(", ")||"None"}</p>
      <p>No longer flagged: {diff.flags.noLongerVisible.map(pretty).join(", ")||"None"}</p></div>
    <div className="dt-actions"><button type="button" onClick={()=>exportDiff("json")}><FileJson size={15}/> Download diff JSON</button>
      <button type="button" onClick={()=>exportDiff("markdown")}><FileText size={15}/> Download diff Markdown</button>
      <button type="button" onClick={copy}><ClipboardCopy size={15}/> Copy summary</button></div>
    <p className="dt-note"><Info size={16}/> The comparison shows differences between two observations, not a chronological guarantee, audit certificate, real-world deletion event or scientific change. Feed and edit limitations still apply.</p>
   </>}
   {message&&<p className="dt-message" role="status">{message}</p>}
  </>}
 </section>;
}
