import React,{useEffect,useMemo,useRef,useState}from"react";
import{ArrowUpRight,ClipboardCopy,FileCheck2,FileJson,Fingerprint,Info,ShieldAlert,ShieldCheck,UploadCloud,X}from"lucide-react";
import{MAX_DOSSIER_IMPORT_BYTES,validateDossierImport}from"./dossierDiff.js";
import{fingerprintDossier,compareFingerprints,FINGERPRINT_CANON}from"./dossierFingerprint.js";
import{makeAnchorDraft,anchorsForDossier}from"./dossierAnchor.js";
import"./dossierFingerprints.css";
const chain=d=>["origin_a","origin_b","fusion","charter","original_trial"].map(k=>d?.provenance?.[k]?.url||"");
const date=s=>{const d=new Date(s||"");return Number.isNaN(d.getTime())?"Date unavailable":d.toLocaleString()};
const describe=x=>x==="SAME_CANONICAL_CONTENT"?"CANONICAL CONTENT MATCH":
 x==="DIFFERENT_CANONICAL_CONTENT"?"HASH OR BYTE-LENGTH MISMATCH":
 x==="DIFFERENT_METHOD"?"HASHING METHOD DIFFERS":"UNAVAILABLE";
export default function DossierFingerprintDesk({dossier,anchors=[]}){
 const [opened,setOpened]=useState(false),[current,setCurrent]=useState(null);
 const [imported,setImported]=useState(null),[importName,setImportName]=useState("");
 const [note,setNote]=useState("Dossier data and all scientific conclusions remain contributor-reported and unverified.");
 const [ack,setAck]=useState(false),[error,setError]=useState(""),[status,setStatus]=useState("");
 const run=useRef(0),upload=useRef(0);
 const trialNumber=dossier?.provenance?.original_trial?.issueNumber;
 useEffect(()=>{
  const ticket=++run.current;
  setCurrent(null);setError("");setAck(false);
  if(!dossier)return;
  fingerprintDossier(dossier).then(f=>{if(ticket===run.current)setCurrent(f)})
   .catch(e=>{if(ticket===run.current)setError(e.message)});
 },[dossier]);
 useEffect(()=>{upload.current++;setImported(null);setImportName("");setOpened(false)},[trialNumber]);
 const visible=useMemo(()=>anchorsForDossier(anchors,dossier),[anchors,dossier]);
 const draft=current?makeAnchorDraft({dossier,fingerprint:current,limitations:note,acknowledged:ack}):null;
 const checkLocal=async event=>{
  const f=event.target.files?.[0];event.target.value="";
  if(!f)return;
  const ticket=++upload.current;
  setImported(null);setImportName("");setStatus("");setError("");
  if(f.size>MAX_DOSSIER_IMPORT_BYTES){setError("Local file exceeds the 2 MiB import limit.");return;}
  try{
   const json=JSON.parse(await f.text());
   if(ticket!==upload.current)return;
   const valid=validateDossierImport(json);
   if(!valid.ok){setError(valid.errors.join(" "));return;}
   if(chain(json).some((v,i)=>v!==chain(dossier)[i])){
    setError("This saved file belongs to a different research source chain; comparison is blocked.");return;
   }
   const hashed=await fingerprintDossier(json);
   if(ticket!==upload.current)return;
   setImported(hashed);setImportName(f.name.slice(0,150));
   setStatus("Local dossier fingerprint calculated; no file bytes uploaded.");
  }catch(e){if(ticket===upload.current)setError("Could not verify this file: "+String(e.message||e))}
 };
 const clear=()=>{upload.current++;setImported(null);setImportName("");setStatus("");setError("")};
 const copy=async()=>{
  if(!current)return;
  try{await navigator.clipboard.writeText(current.digest);
   setStatus("SHA-256 copied locally. It is not a signed seal or certification.");
  }catch{setStatus("Clipboard not available. Select and copy the digest manually.");}
 };
 const currentComparison=imported&&current?compareFingerprints(imported,current):null;
 return <section className="df-panel" aria-label={"Dossier Fingerprint Desk for Trial "+trialNumber}>
  <div className="df-head"><div><span><Fingerprint size={16}/> DOSSIER FINGERPRINT DESK · v1.9</span>
   <h3>Check the snapshot. Keep the receipts.</h3>
   <p>Canonical SHA-256 of locally visible research JSON. Compare an older copy, or document the declared fingerprint in a public Issue.</p></div>
   <button type="button" onClick={()=>setOpened(v=>!v)} aria-expanded={opened}>
    <FileCheck2 size={16}/>{opened?"Hide fingerprint desk":"Inspect fingerprints"}</button>
  </div>
  {opened&&<>
   <div className="df-warning"><ShieldAlert size={18}/><p><strong>Matching data is not authenticated history.</strong> These fingerprints identify canonical JSON content. They do not sign a file, prove when it existed, establish authorship, validate an experiment, or make GitHub Issues immutable.</p></div>
   {current?<div className="df-current">
    <strong>Current dossier fingerprint</strong><code>{current.digest}</code>
    <div><span>{current.bytes} canonical UTF-8 bytes</span><span>{FINGERPRINT_CANON}</span></div>
    <button type="button" onClick={copy}><ClipboardCopy size={15}/> Copy SHA-256</button>
   </div>:<p className="df-muted">Calculating local fingerprint. Requires Web Crypto in a secure browser.</p>}
   <div className="df-import"><h4>Verify a saved local dossier</h4>
    <p>Choose a v1.7 JSON export for this same Trial (up to 2 MiB). Its file contents remain in your browser, with no upload or remote file reads.</p>
    <label className="df-file"><UploadCloud size={17}/> Choose local dossier JSON<input type="file" accept=".json,application/json" aria-label="Select saved dossier JSON" onChange={checkLocal}/></label>
    {imported&&<div className="df-check-result"><span>Saved file: {importName}</span><code>{imported.digest}</code>
      <strong>{describe(currentComparison)}</strong>
      <small>Compares canonical JSON content. An older snapshot can differ legitimately from the current view.</small>
      <button type="button" onClick={clear}><X size={15}/> Clear local file</button>
     </div>}
   </div>
   <div className="df-history"><h4>Publicly declared fingerprint receipts <small>{visible.length} visible</small></h4>
    <p>The GitHub account and Issue date are public metadata. Neither constitutes signed, independent confirmation of a fingerprint or its creation time.</p>
    {visible.length?visible.map(a=><article key={a.id} className="df-anchor">
      <div className="df-anchor-top"><strong>#{a.issueNumber} · @{a.author}</strong><small>{date(a.date)}</small></div>
      <code>{a.digest}</code><p>{a.bytes} canonical bytes · claimed snapshot {a.timestamp}</p>
      <div className="df-verdicts"><span>Current view: {describe(current?compareFingerprints(current,a):"UNAVAILABLE")}</span>
       {imported&&<span>Saved copy: {describe(compareFingerprints(imported,a))}</span>}</div>
      <p className="df-caveat">{a.limitations}</p><a href={a.url} target="_blank" rel="noopener noreferrer">Read original Issue <ArrowUpRight size={14}/></a>
     </article>):<p className="df-muted">No public fingerprint receipts are visible. The bounded GitHub feed may omit older records.</p>}
   </div>
   <div className="df-publish"><h4>Optionally record the current fingerprint</h4>
    <p>Create a prefilled GitHub Issue with the Trial and source-chain links, snapshot timestamp, hashing method and declared checksum. <strong>The dossier JSON itself is NOT uploaded.</strong></p>
    <label className="field-label">Limits and context *<textarea rows={3} maxLength={950} value={note} onChange={e=>setNote(e.target.value)}/></label>
    <label className="df-ack"><input type="checkbox" checked={ack} onChange={e=>setAck(e.target.checked)}/>
     <span>I understand this is a voluntary, editable GitHub Issue, not an immutable notarization, an authenticated signature or verification of scientific claims.</span></label>
    {draft?<a className="button primary" href={draft.url} target="_blank" rel="noopener noreferrer">Review fingerprint Issue on GitHub <ArrowUpRight size={15}/></a>:<button type="button" disabled className="button primary">Complete fingerprint and acknowledgment</button>}
   </div>
   {error&&<p className="df-error" role="alert">{error}</p>}
   {status&&<p className="df-status" role="status">{status}</p>}
   <p className="df-foot"><Info size={15}/> No signing key, timestamp authority, remote file inspection, agent permission or automatic publishing is provided. <strong>Ledger Above Bruv.</strong></p>
  </>}
 </section>;
}
