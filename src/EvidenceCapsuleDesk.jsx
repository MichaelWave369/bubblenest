import React,{useEffect,useMemo,useRef,useState}from"react";
import{ArrowUpRight,Archive,Download,FileCheck2,FileJson,ShieldAlert,ShieldCheck,UploadCloud,X}from"lucide-react";
import{createEvidenceCapsule,verifyEvidenceCapsule,parseCapsuleFile,sameCapsuleChain,
 capsuleAnchorComparison,capsuleDownloadName,CAPSULE_MAX_FILE_BYTES}from"./evidenceCapsule.js";
import"./evidenceCapsule.css";
const date=s=>{const d=new Date(s||"");return Number.isNaN(d.getTime())?"Unknown date":d.toLocaleString()};
const save=(name,content)=>{
 const blob=new Blob([content],{type:"application/json"}),url=URL.createObjectURL(blob);
 const a=document.createElement("a");a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();
 URL.revokeObjectURL(url);
};
export default function EvidenceCapsuleDesk({dossier,anchors=[]}){
 const[opened,setOpened]=useState(false),[capsule,setCapsule]=useState(null);
 const[imported,setImported]=useState(null),[checked,setChecked]=useState(null),[filename,setFilename]=useState("");
 const[working,setWorking]=useState(false),[error,setError]=useState(""),[message,setMessage]=useState("");
 const serial=useRef(0),fileSerial=useRef(0);
 const trialNumber=dossier?.provenance?.original_trial?.issueNumber;
 useEffect(()=>{const ticket=++serial.current;setCapsule(null);setError("");
  if(!dossier)return;
  createEvidenceCapsule(dossier).then(c=>{if(ticket===serial.current)setCapsule(c)})
   .catch(e=>{if(ticket===serial.current)setError(String(e.message||e))});
 },[dossier]);
 useEffect(()=>{fileSerial.current++;setOpened(false);setImported(null);setChecked(null);setFilename("");setMessage("")},[trialNumber]);
 const anchored=useMemo(()=>checked?.ok&&imported?capsuleAnchorComparison(imported,anchors):[],
  [checked,imported,anchors]);
 const download=()=>{
  if(!capsule)return;
  try{save(capsuleDownloadName(capsule)+".json",JSON.stringify(capsule,null,2)+"\n");
   setMessage("Portable capsule downloaded locally. Nothing uploaded or published.");
  }catch{setMessage("Could not download this capsule in the current browser.");}
 };
 const readFile=async event=>{
  const f=event.target.files?.[0];event.target.value="";
  if(!f)return;
  const ticket=++fileSerial.current;
  setImported(null);setChecked(null);setFilename("");setError("");setMessage("");
  if(f.size>CAPSULE_MAX_FILE_BYTES){setError("Evidence Capsule exceeds 3 MiB. No file was processed.");return;}
  setWorking(true);
  try{
   const item=parseCapsuleFile(await f.text());
   if(ticket!==fileSerial.current)return;
   const result=await verifyEvidenceCapsule(item);
   if(ticket!==fileSerial.current)return;
   // Only show same-source records under the current Trial. Never silently promote a foreign capsule.
   if(result.status!=="INVALID_CAPSULE"&&!sameCapsuleChain(item.dossier,dossier)){
    setError("This capsule refers to a different Trial or original source chain. Open that project's desk instead.");
    return;
   }
   setImported(item);setChecked(result);setFilename(f.name.slice(0,170));
   setMessage(result.ok?"Internal SHA-256 recalculated and matched the included reference. Source authenticity and science remain UNVERIFIED.":"Internal integrity could not be confirmed. Do not rely on this capsule's records.");
  }catch(e){if(ticket===fileSerial.current)setError(String(e.message||e))}
  finally{if(ticket===fileSerial.current)setWorking(false)}
 };
 const clear=()=>{fileSerial.current++;setImported(null);setChecked(null);setFilename("");setError("");setMessage("");setWorking(false)};
 const matchingAnchor=anchored.filter(a=>a.status==="DECLARED_ANCHOR_MATCH").length;
 return <section className="ec-desk" aria-label={"Evidence Capsule exchange for Trial "+trialNumber}>
  <div className="ec-head"><div><span><Archive size={16}/> EVIDENCE CAPSULES · v2.0</span>
   <h3>Take the complete evidence packet with you.</h3>
   <p>One portable JSON includes this Trial's full dossier, source links, caveats, and reproducible canonical SHA-256.</p></div>
   <button type="button" onClick={()=>setOpened(v=>!v)} aria-expanded={opened}><FileJson size={15}/>{opened?"Hide capsules":"Open capsule desk"}</button></div>
  {opened&&<>
   <div className="ec-warning"><ShieldAlert size={18}/><p><strong>Self-contained does not mean independently authenticated.</strong> Somebody can alter JSON and recalculate its checksum. The internal hash detects accidental/inconsistent changes relative to the included value, not deliberate forgery. A public fingerprint Issue is also editable and self-declared.</p></div>
   <div className="ec-export"><div><h4>Export the currently visible dossier</h4>
    <p>Snapshot data comes from a bounded GitHub Issues feed. This exports the full dossier JSON inside an envelope, unlike a fingerprint-only public receipt.</p>
    {capsule?<div className="ec-hash"><small>SHA-256 · {capsule.fingerprint.bytes} canonical bytes</small><code>{capsule.fingerprint.digest}</code></div>:
     <p className="ec-muted">Calculating the local fingerprint. Secure browser Web Crypto is required.</p>}</div>
    <button type="button" disabled={!capsule} onClick={download}><Download size={16}/> Download full Evidence Capsule</button>
   </div>
   <div className="ec-import"><h4>Inspect an Evidence Capsule somebody shared</h4>
    <p>Choose a local v2.0 capsule JSON (maximum 3 MiB). The browser validates the schema, recomputes SHA-256 over its enclosed dossier, checks this Trial's source chain, and compares declared public fingerprints when available. No file bytes leave your device.</p>
    <label className="ec-picker"><UploadCloud size={17}/>{working?"Checking local capsule…":"Choose a local Evidence Capsule"}<input type="file" accept=".json,application/json" aria-label="Select local Evidence Capsule JSON" disabled={working} onChange={readFile}/></label>
    {checked&&<div className={"ec-result "+(checked.ok?"ok":"bad")}>
      <div className="ec-result-title"><strong>{checked.status.replace(/_/g," ")}</strong><small>{filename}</small></div>
      {checked.claimed&&<p><b>Declared digest:</b> <code>{checked.claimed.digest}</code></p>}
      {checked.computed&&<p><b>Recomputed digest:</b> <code>{checked.computed.digest}</code></p>}
      {checked.errors?.map((err,i)=><p key={i} className="ec-error-item">{err}</p>)}
      <p>{checked.ok?"INTERNAL CONTENT CONSISTENCY ONLY · NOT A SIGNATURE OR SCIENCE VERDICT":"UNCONFIRMED CONTENT · CANNOT ACCEPT INTERNAL CHECKSUM CLAIM"}</p>
      <button type="button" onClick={clear}><X size={15}/> Clear selected file</button>
     </div>}
    {checked?.ok&&<div className="ec-anchors"><h4>Compare with visible public fingerprint receipts</h4>
      <p>{matchingAnchor} matching declared anchor(s) among {anchored.length} visible Issue(s). A matching GitHub declaration does not authenticate a person or original file history.</p>
      {anchored.length?anchored.map(a=><div className="ec-anchor" key={a.issueNumber}>
        <span>{a.status==="DECLARED_ANCHOR_MATCH"?"DECLARED DIGEST MATCH":a.status==="DECLARED_ANCHOR_DIFFERENCE"?"DECLARED DIGEST DIFFERENCE":"UNAVAILABLE METHOD"}</span>
        <a href={a.url} target="_blank" rel="noopener noreferrer">GitHub Issue #{a.issueNumber} <ArrowUpRight size={13}/></a>
        <small>@{a.author} · {date(a.date)}</small>
       </div>):<p className="ec-muted">No visible public fingerprint receipt. This is not evidence that none exists.</p>}
     </div>}
   </div>
   {error&&<p role="alert" className="ec-error">{error}</p>}
   {message&&<p role="status" className="ec-status">{message}</p>}
   <p className="ec-foot"><ShieldCheck size={15}/> An Evidence Capsule is portable, local-only, and unsignatured. No automatic GitHub submission, agent execution, legal permissions, or independent scientific authentication is supplied. <b>Ledger Above Bruv.</b></p>
  </>}
 </section>;
}
