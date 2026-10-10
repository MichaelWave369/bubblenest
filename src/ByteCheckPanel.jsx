import React,{useEffect,useMemo,useRef,useState}from"react";
import{ArrowUpRight,ClipboardCheck,ExternalLink,FileCheck2,FileUp,Fingerprint,Info,Plus,ShieldAlert,ShieldCheck,X}from"lucide-react";
import{ARTIFACT_MAX_LOCAL_HASH_BYTES}from"./artifactData.js";
import{BYTE_CHECK_RESULTS,compareByteDigests,makeByteCheckDraft,byteChecksForArtifact,byteCheckCounts}from"./byteChecks.js";
import"./byteChecks.css";
const empty={filename:"",observedDigest:"",observedBytes:null,acquisition:"",environment:"Web Crypto SHA-256 in a secure browser context",limitations:"",acknowledged:false};
const labels={
 HASH_MATCH:"SHA-256 matches declared reference",
 HASH_MISMATCH:"SHA-256 differs from declared reference",
 NO_REFERENCE_DIGEST:"Cannot compare: source has no declared SHA-256",
 DECLARED_SIZE_CONFLICT:"Declared and observed sizes conflict"
};
const date=s=>{const d=new Date(s||"");return Number.isNaN(d.getTime())?"Date unavailable":d.toLocaleDateString(undefined,{year:"numeric",month:"short",day:"numeric"})};
export default function ByteCheckPanel({artifact,trial,charter,proposal,bubbles=[],checks=[]}){
 const[expanded,setExpanded]=useState(false),[composing,setComposing]=useState(false),[form,setForm]=useState(empty);
 const[hashing,setHashing]=useState(false),[fileNote,setFileNote]=useState("");
 const sequence=useRef(0);
 useEffect(()=>{sequence.current++;setExpanded(false);setComposing(false);setForm(empty);setHashing(false);setFileNote("")},[artifact.issueNumber]);
 const visible=useMemo(()=>byteChecksForArtifact(checks,artifact,trial,charter,proposal,bubbles),[checks,artifact,trial,charter,proposal,bubbles]);
 const counts=useMemo(()=>byteCheckCounts(checks,artifact,trial,charter,proposal,bubbles),[checks,artifact,trial,charter,proposal,bubbles]);
 const result=compareByteDigests(artifact,form.observedDigest,form.observedBytes);
 const prepared=hashing?null:makeByteCheckDraft({...form,artifact,trial,charter,proposal,bubbles});
 const update=(key,value)=>setForm(f=>({...f,[key]:value}));
 const hashFile=async e=>{
  const file=e.target.files?.[0];e.target.value="";
  if(!file)return;
  const run=++sequence.current;
  setForm(f=>({...f,filename:"",observedDigest:"",observedBytes:null,acknowledged:false}));
  if(file.size>ARTIFACT_MAX_LOCAL_HASH_BYTES){
   setFileNote("File too large for this in-browser check (25 MiB limit). No comparison was made.");return;
  }
  if(!globalThis.crypto?.subtle){
   setFileNote("Browser Web Crypto unavailable. This tool cannot produce a comparison in this context.");return;
  }
  setHashing(true);setFileNote("Computing local SHA-256; no file bytes are uploaded.");
  try{
   const bytes=await file.arrayBuffer();
   const hashed=await globalThis.crypto.subtle.digest("SHA-256",bytes);
   if(run!==sequence.current)return;
   const digest=[...new Uint8Array(hashed)].map(b=>b.toString(16).padStart(2,"0")).join("");
   setForm(f=>({...f,filename:file.name,observedDigest:digest,observedBytes:file.size,
    environment:f.environment||"Web Crypto SHA-256 in a secure browser context"}));
   setFileNote("Hash calculated locally. This identifies selected bytes relative to the artifact's declared reference only.");
  }catch{
   if(run===sequence.current)setFileNote("Failed to hash the local file. No bytes were transmitted.");
  }finally{if(run===sequence.current)setHashing(false)}
 };
 return <section className="bc-panel" aria-label={"Byte comparison desk for artifact "+artifact.issueNumber}>
   <div className="bc-head"><div><strong><Fingerprint size={16}/> Byte Check Desk</strong><p>{counts.total} report(s) · {counts.HASH_MATCH} declared match(es) · {counts.HASH_MISMATCH} mismatch(es)</p></div>
   <button type="button" onClick={()=>setExpanded(v=>!v)} aria-expanded={expanded}><ClipboardCheck size={15}/>{expanded?"Hide checks":"Inspect checks"}</button></div>
   {expanded&&<>
    <div className="bc-warning"><ShieldAlert size={18}/><p><strong>Matching bytes are not verified science.</strong> The original digest is contributor-declared. A byte check does not authenticate the file's origin, its legal rights, experiment methods or the correctness of any reported result.</p></div>
    {visible.length?<div className="bc-entries">{visible.map(r=><article className="bc-entry" key={r.id}>
      <div className="bc-entry-meta"><span>{labels[r.result]} · contributor report</span><small>#{r.issueNumber} · @{r.author} · {date(r.date)}</small></div>
      <h4>{r.filename}</h4><p><b>Observed size:</b> {r.observedBytes} bytes</p>
      <p><b>Observed SHA-256:</b> <code>{r.observedDigest}</code></p>
      <p><b>Reference SHA-256:</b> <code>{r.referenceDigest||"Not supplied"}</code></p>
      <p><b>Acquisition:</b> {r.acquisition}</p><p><b>Method/environment:</b> {r.environment}</p><p><b>Limits:</b> {r.limitations}</p>
      <a href={r.url} target="_blank" rel="noopener noreferrer">Open submitted GitHub byte check <ExternalLink size={14}/></a>
     </article>)}</div>:<p className="bc-empty">No byte-check Issues visible for this artifact. Missing records do not establish that no checks were performed.</p>}
    <button className="bc-compose" type="button" onClick={()=>setComposing(v=>!v)}>{composing?<X size={16}/>:<Plus size={16}/>} {composing?"Close local comparison":"Compare a local file"}</button>
    {composing&&<form className="bc-form" onSubmit={e=>e.preventDefault()}>
      <p>Choose a file you already have permission to inspect. The browser hashes it locally (up to 25 MiB). Only a report you explicitly submit on GitHub becomes public; no file bytes leave this page.</p>
      <label className="bc-file"><FileUp size={17}/>{hashing?"Calculating SHA-256 locally…":"Choose a file to compare (max 25 MiB)"}<input type="file" aria-label="Choose local artifact copy for SHA-256 check" disabled={hashing} onChange={hashFile}/></label>
      {fileNote&&<p className="bc-feedback" role="status">{fileNote}</p>}
      {result&&<div className={"bc-result "+(result==="HASH_MATCH"?"match":"difference")}>
        <span>{labels[result]}</span><strong>{form.filename} · {form.observedBytes} bytes</strong>
        <code>{form.observedDigest}</code>
        <small>{result==="HASH_MATCH"?"These bytes have the same SHA-256 as the contributor-declared reference. No other aspect is certified.":result==="NO_REFERENCE_DIGEST"?"No original hash was declared; a direct SHA-256 comparison is unavailable.":result==="DECLARED_SIZE_CONFLICT"?"The source's declared byte length differs. Resolve the discrepancy before claiming byte identity.":"The local SHA-256 differs from the reference claim. This may indicate a different version, a changed file, or incorrect metadata."}</small>
       </div>}
      <label className="field-label">Where did you obtain the file? *<textarea maxLength={1000} rows={2} value={form.acquisition} onChange={e=>update("acquisition",e.target.value)} placeholder="Repository release, dataset mirror, generated output, or another specific source"/></label>
      <label className="field-label">Hashing procedure and environment *<textarea maxLength={900} rows={2} value={form.environment} onChange={e=>update("environment",e.target.value)} placeholder="Browser Web Crypto SHA-256; OS / browser version if known"/></label>
      <label className="field-label">What does this check NOT establish? *<textarea maxLength={950} rows={2} value={form.limitations} onChange={e=>update("limitations",e.target.value)} placeholder="Identity, origin, ownership, scientific claims, software safety and version issues"/></label>
      <label className="bc-check"><input type="checkbox" checked={form.acknowledged} onChange={e=>update("acknowledged",e.target.checked)}/><span>I understand this is a contributor-reported comparison to a declared checksum, not an authenticated scientific or legal verification.</span></label>
      <div className="bc-actions"><span><ShieldCheck size={15}/> Explicit GitHub publication required.</span>
       {prepared?<a href={prepared.url} target="_blank" rel="noopener noreferrer" className="button primary">Review byte-check Issue <ArrowUpRight size={15}/></a>:<button className="button primary" disabled type="button">Choose file and finish check</button>}</div>
     </form>}
    <p className="bc-fine"><Info size={15}/> Only the selected local file is hashed; neither artifact URLs nor remote file bytes are fetched. Issues are editable and public history may be incomplete.</p>
   </>}
  </section>;
}
