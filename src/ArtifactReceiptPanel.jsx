import React,{useEffect,useMemo,useState}from"react";
import{ArrowUpRight,ClipboardList,ExternalLink,FileArchive,FileCheck2,FileUp,Fingerprint,Info,Plus,ShieldAlert,ShieldCheck,X}from"lucide-react";
import{ARTIFACT_KINDS,ARTIFACT_MAX_LOCAL_HASH_BYTES,makeArtifactDraft,artifactsForTrial,artifactCounts}from"./artifactData.js";
import"./artifactReceipts.css";
const fresh={kind:"Dataset",name:"",version:"",fileBytes:"",digest:"",artifactURL:"",
 provenance:"",environment:"",steps:"",license:"",limitations:"",acknowledged:false};
const when=s=>{const d=new Date(s||"");return Number.isNaN(d.getTime())?"Date unavailable":d.toLocaleDateString(undefined,{year:"numeric",month:"short",day:"numeric"})};
export default function ArtifactReceiptPanel({trial,charter,proposal,bubbles=[],artifacts=[]}){
 const[expanded,setExpanded]=useState(false),[writing,setWriting]=useState(false),[form,setForm]=useState(fresh),
  [hashMessage,setHashMessage]=useState(""),[hashing,setHashing]=useState(false);
 useEffect(()=>{setExpanded(false);setWriting(false);setForm(fresh);setHashMessage("")},[trial.issueNumber]);
 const records=useMemo(()=>artifactsForTrial(artifacts,trial,charter,proposal,bubbles),[artifacts,trial,charter,proposal,bubbles]);
 const counts=useMemo(()=>artifactCounts(artifacts,trial,charter,proposal,bubbles),[artifacts,trial,charter,proposal,bubbles]);
 const prepared=makeArtifactDraft({...form,trial,charter,proposal,bubbles});
 const change=(key,value)=>setForm(v=>({...v,[key]:value}));
 const hashLocal=async(event)=>{
  const file=event.target.files?.[0];
  event.target.value="";
  if(!file)return;
  if(file.size>ARTIFACT_MAX_LOCAL_HASH_BYTES){
   setHashMessage("This file is larger than the 25 MiB in-browser hash limit. Compute SHA-256 locally with a trusted desktop tool and paste it manually.");
   return;
  }
  if(!globalThis.crypto?.subtle){
   setHashMessage("Secure-browser SHA-256 is unavailable here. Use a trusted local hashing tool.");
   return;
  }
  setHashing(true);setHashMessage("Hashing locally. File bytes are not uploaded.");
  try{
   const bytes=await file.arrayBuffer();
   const hash=Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256",bytes)),
    b=>b.toString(16).padStart(2,"0")).join("");
   setForm(v=>({...v,name:file.name,version:v.version||"Unversioned (needs review)",fileBytes:String(file.size),digest:hash}));
   setHashMessage("SHA-256 computed in this browser for the selected local file. It does not verify the linked public URL or file authorship.");
  }catch{
   setHashMessage("Could not calculate the local digest. No file bytes were sent anywhere.");
  }finally{setHashing(false)}
 };
 return <section className="ar-panel" aria-label={"Artifact ledger for Trial "+trial.issueNumber}>
  <div className="ar-head"><div><strong><FileArchive size={16}/> Artifact Receipts</strong>
    <p>{counts.total} receipt(s) · {counts.declaredSha256} SHA-256 declared · {counts.withoutDigest} without hash</p></div>
   <button type="button" onClick={()=>setExpanded(v=>!v)} aria-expanded={expanded}><ClipboardList size={15}/>{expanded?"Hide artifacts":"Inspect artifacts"}</button>
  </div>
  {expanded&&<>
   <div className="ar-guard"><ShieldAlert size={19}/><p><strong>Checksum ≠ verified research.</strong> A submitted hash is just a declaration until someone obtains the same bytes and independently recomputes it. Links, licenses, environments and ownership are also contributor-reported. This page does not upload, inspect or execute artifacts.</p></div>
   {records.length?<div className="ar-list">{records.map(r=><article className="ar-record" key={r.id}>
     <div className="ar-record-meta"><span>{r.kind} · {r.version}</span><small>#{r.issueNumber} · @{r.author} · {when(r.date)}</small></div>
     <h4>{r.name}</h4>
     <div className="ar-digest"><Fingerprint size={17}/><div><span>{r.digest?"DECLARED SHA-256 · NOT INDEPENDENTLY CHECKED":"NO DIGEST PROVIDED · NOT HASH-REPRODUCIBLE"}</span><code>{r.digest||"Not supplied"}</code></div></div>
     {r.fileBytes!==""&&<p><b>Declared size:</b> {r.fileBytes} bytes</p>}
     <p><b>Provenance:</b> {r.provenance}</p><p><b>Environment:</b> {r.environment}</p>
     <p><b>Reproduction:</b> {r.steps}</p><p><b>License / permissions:</b> {r.license}</p>
     <p><b>Limitations:</b> {r.limitations}</p>
     {r.artifactURL?<a className="ar-source" href={r.artifactURL} rel="noopener noreferrer" target="_blank">Open contributor-declared public artifact <ExternalLink size={14}/></a>:<p className="ar-source-missing">No public artifact URL. Independent retrieval is not available from this receipt.</p>}
     <div className="ar-record-foot"><span>METADATA · NOT VERIFIED</span><a href={r.url} rel="noopener noreferrer" target="_blank">Read GitHub receipt <ArrowUpRight size={14}/></a></div>
    </article>)}</div>:<p className="ar-empty">No artifact records visible for this Trial. The public feed is bounded, so this is not proof of absence.</p>}
   <button className="ar-compose" type="button" onClick={()=>setWriting(v=>!v)}>{writing?<X size={16}/>:<Plus size={16}/>} {writing?"Close metadata draft":"Add artifact metadata"}</button>
   {writing&&<form className="ar-form" onSubmit={e=>e.preventDefault()}>
     <p>Document the exact artifact version needed to inspect a reported result. If you include a hash, use SHA-256 of the actual file bytes. No source file is uploaded by this form.</p>
     <div className="ar-pair"><label className="field-label">Artifact category<select value={form.kind} onChange={e=>change("kind",e.target.value)}>{ARTIFACT_KINDS.map(k=><option key={k}>{k}</option>)}</select></label>
       <label className="field-label">Version, commit or frozen tag *<input value={form.version} maxLength={250} onChange={e=>change("version",e.target.value)} placeholder="v1.0 / git commit / data release 2"/></label></div>
     <label className="field-label">Filename or artifact name *<input value={form.name} maxLength={250} onChange={e=>change("name",e.target.value)} placeholder="trial-results.csv"/></label>
     <div className="ar-pair"><label className="field-label">Size in bytes (optional)<input type="number" min="0" step="1" value={form.fileBytes} onChange={e=>change("fileBytes",e.target.value)} placeholder="Number of bytes"/></label>
       <label className="field-label">Public HTTPS artifact URL (optional)<input type="url" maxLength={700} value={form.artifactURL} onChange={e=>change("artifactURL",e.target.value)} placeholder="https://..."/></label></div>
     <label className="field-label">Declared SHA-256 (optional, 64 hexadecimal digits)<input spellCheck={false} value={form.digest} onChange={e=>change("digest",e.target.value)} placeholder="64 hex characters, or leave empty for NO DIGEST"/></label>
     <label className="ar-file-hash"><FileUp size={17}/><span>{hashing?"Calculating locally…":"Hash a local file without uploading (max 25 MiB)"}</span><input type="file" aria-label="Compute local file SHA-256" disabled={hashing} onChange={hashLocal}/></label>
     {hashMessage&&<p className="ar-hash-message" role="status">{hashMessage}</p>}
     {[
      ["provenance","Origin and acquisition method *","Where was this file obtained or generated? Cite its original source.",1100],
      ["environment","Runtime / environment *","Runtime versions, hardware, dependencies, model version, seed or OS.",1200],
      ["steps","Reproduction instructions *","Exact inputs, commands, controls, expected output and constraints.",1400],
      ["license","License and permission declaration *","State the applicable license, rights or restrictions; do not claim rights you lack.",650],
      ["limitations","Uncertainty and known problems *","Data caveats, portability limits, incompleteness, potential version drift.",1000]
     ].map(([key,label,hint,max])=><label className="field-label" key={key}>{label}<textarea rows={2} maxLength={max} value={form[key]} onChange={e=>change(key,e.target.value)} placeholder={hint}/></label>)}
     <label className="ar-check"><input type="checkbox" checked={form.acknowledged} onChange={e=>change("acknowledged",e.target.checked)}/><span>These are contributor-declared metadata, not independently verified bytes, scientific results, legal permissions, or authorization to run a Charter.</span></label>
     <div className="ar-submit"><span><ShieldCheck size={15}/> GitHub Issue publication requires your explicit review.</span>
       {prepared?<a className="button primary" href={prepared.url} target="_blank" rel="noopener noreferrer">Review artifact on GitHub <ArrowUpRight size={15}/></a>:<button className="button primary" type="button" disabled>Complete required fields</button>}</div>
    </form>}
   <p className="ar-fine"><Info size={15}/> The browser can hash a selected local file, but does not verify any remote URL. File selection stays local and is not persisted by the app. GitHub Issues can be edited, and the public feed may be incomplete.</p>
  </>}
 </section>;
}
