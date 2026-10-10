import React,{useMemo,useState}from"react";
import{ArrowUpRight,ClipboardCopy,Download,FileJson,FileText,RefreshCw,ShieldAlert,ShieldCheck,FileSearch}from"lucide-react";
import{buildReproductionDossier,dossierMarkdown,dossierFileName}from"./reproductionDossier.js";
import"./reproductionDossier.css";

const save=(name,text,type)=>{
 const blob=new Blob([text],{type}),url=URL.createObjectURL(blob);
 const a=document.createElement("a");a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();
 URL.revokeObjectURL(url);
};
export default function ReproductionDossier({trial,charter,proposal,bubbles=[],artifacts=[],byteChecks=[],reproductions=[],feedStatus}){
 const [generatedAt,setGeneratedAt]=useState(()=>new Date().toISOString());
 const [showJSON,setShowJSON]=useState(false),[message,setMessage]=useState("");
 const dossier=useMemo(()=>buildReproductionDossier({trial,charter,proposal,bubbles,artifacts,byteChecks,
  reproductions,feedStatus,generatedAt}),[trial,charter,proposal,bubbles,artifacts,byteChecks,reproductions,feedStatus,generatedAt]);
 if(!dossier)return null;
 const markdown=dossierMarkdown(dossier),base=dossierFileName(dossier);
 const exportFile=(format)=>{
  try{
   if(format==="json")save(base+".json",JSON.stringify(dossier,null,2)+"\n","application/json");
   else save(base+".md",markdown,"text/markdown");
   setMessage(format.toUpperCase()+" dossier created locally. It has NOT been uploaded or published.");
  }catch{setMessage("Browser download is unavailable. The snapshot remains viewable below.");}
 };
 const copy=async()=>{
  try{await navigator.clipboard.writeText(markdown);setMessage("Markdown copied locally. Source statements remain unverified.");}
  catch{setMessage("Clipboard access was denied. Download Markdown or inspect the dossier instead.");}
 };
 const counts=dossier.counts;
 return <section className="rd-panel" aria-label={"Reproduction audit dossier for Trial "+trial.issueNumber}>
  <div className="rd-head"><div><span><FileSearch size={15}/> REPRODUCTION AUDIT · v1.7</span><h3>Bring the receipts together.</h3>
   <p>One local dossier for this Trial's source chain, public Artifacts, Byte Checks, repeated runs, contradictory findings and visible gaps.</p></div>
   <div className="rd-seal"><ShieldCheck size={26}/><small>NO CLAIM CERTIFIED</small></div>
  </div>
  <div className="rd-warning"><ShieldAlert size={18}/><p><strong>Inventory, not verdict.</strong> Every finding, byte check and author statement is contributor-reported. This snapshot is partial or of unknown completeness, unsigned and not independently verified.</p></div>
  <div className="rd-metrics">
   <div><strong>{counts.artifacts}</strong><span>Artifacts</span></div>
   <div><strong>{counts.byte_checks}</strong><span>Byte checks</span></div>
   <div><strong>{counts.reproduction_reports}</strong><span>Repeat reports</span></div>
   <div><strong>{dossier.gaps.length}</strong><span>Visible flags</span></div>
  </div>
  <div className="rd-contrast">
   <span>Reported matches <b>{counts.reproduction_outcomes.REPORTED_MATCH}</b></span>
   <span>Reported differences <b>{counts.reproduction_outcomes.REPORTED_DIFFERENCE}</b></span>
   <span>Inconclusive <b>{counts.reproduction_outcomes.INCONCLUSIVE}</b></span>
   <span>Blocked or stopped <b>{counts.reproduction_outcomes.NOT_RUN_BLOCKED+counts.reproduction_outcomes.STOPPED}</b></span>
  </div>
  <div className="rd-flags"><h4>Open questions and inconsistencies</h4>
   {dossier.gaps.length?<ul>{dossier.gaps.map(g=><li key={g.code}><strong>{g.code.replace(/_/g," ")}</strong><span>{g.message}</span></li>)}</ul>:
    <p>No rule-based gap detected in the currently visible records. This does <strong>not</strong> establish completeness or scientific validity.</p>}
  </div>
  <div className="rd-links"><h4>Source anchors</h4><div>
    <a href={dossier.provenance.origin_a.url} target="_blank" rel="noopener noreferrer">Bubble A <ArrowUpRight size={13}/></a>
    <a href={dossier.provenance.origin_b.url} target="_blank" rel="noopener noreferrer">Bubble B <ArrowUpRight size={13}/></a>
    <a href={dossier.provenance.fusion.url} target="_blank" rel="noopener noreferrer">Fusion <ArrowUpRight size={13}/></a>
    <a href={dossier.provenance.charter.url} target="_blank" rel="noopener noreferrer">Charter <ArrowUpRight size={13}/></a>
    <a href={dossier.provenance.original_trial.url} target="_blank" rel="noopener noreferrer">Original Trial <ArrowUpRight size={13}/></a>
   </div>
  </div>
  <div className="rd-export"><div><h4>Export for a researcher or agent</h4><p>Generated entirely in this browser from the visible public feed. Downloading does not post to GitHub, upload files, or grant an agent permission to act.</p></div>
   <div className="rd-actions">
    <button type="button" onClick={()=>exportFile("json")}><FileJson size={16}/> Download JSON</button>
    <button type="button" onClick={()=>exportFile("markdown")}><FileText size={16}/> Download Markdown</button>
    <button type="button" onClick={copy}><ClipboardCopy size={16}/> Copy summary</button>
   </div>
  </div>
  <div className="rd-preview-bar"><span>Generated {new Date(generatedAt).toLocaleString()} · GitHub feed: {dossier.source.feed_status}</span>
   <div><button type="button" onClick={()=>{setGeneratedAt(new Date().toISOString());setMessage("Snapshot rebuilt from currently loaded public records. No new network refresh was performed.");}}><RefreshCw size={14}/> Rebuild</button>
    <button type="button" onClick={()=>setShowJSON(v=>!v)} aria-expanded={showJSON}><FileJson size={14}/> {showJSON?"Hide JSON":"Inspect JSON"}</button></div>
  </div>
  {message&&<p role="status" className="rd-status">{message}</p>}
  {showJSON&&<pre className="rd-code">{JSON.stringify(dossier,null,2)}</pre>}
  <p className="rd-foot">No integrity seal, file contents, independently authenticated participants, complete history, science verdict or execution rights are supplied. <strong>Ledger Above Bruv.</strong></p>
 </section>;
}
