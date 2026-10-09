import React,{useEffect,useMemo,useState}from"react";
import{ArrowLeftRight,Check,ClipboardCopy,FileJson,FileUp,GitCompareArrows,Info,ShieldAlert,ShieldCheck,Trash2}from"lucide-react";
import{EXCHANGE_MAX_BYTES,parsePassportJSON,comparePassports,comparisonMarkdown}from"./passportExchange.js";
import "./passportExchange.css";

export default function PassportExchange({currentPassport}){
 const [imported,setImported]=useState(null),[errors,setErrors]=useState([]),[fileName,setFileName]=useState(""),[status,setStatus]=useState("");
 useEffect(()=>{setImported(null);setErrors([]);setFileName("");setStatus("")},[currentPassport?.bubble?.id]);
 const comparison=useMemo(()=>imported&&currentPassport?comparePassports(currentPassport,imported):null,[currentPassport,imported]);
 const markdown=useMemo(()=>comparison?comparisonMarkdown(comparison):" ",[comparison]);
 const onFile=async e=>{
  const file=e.target.files?.[0];
  e.target.value=""; // allow selecting the same file again after a correction
  setImported(null);setErrors([]);setStatus("");setFileName(file?.name||"");
  if(!file)return;
  if(file.size>EXCHANGE_MAX_BYTES){setErrors(["Maximum supported file size: 1 MiB. Nothing was imported."]);return;}
  try{
   const parsed=parsePassportJSON(await file.text());
   if(!parsed.ok){setErrors(parsed.errors);return;}
   setImported(parsed.passport);
   setStatus("Passport structure accepted for local comparison. Authenticity has NOT been verified.");
  }catch{setErrors(["Could not read this file. No data was imported."])}
 };
 const copy=async()=>{
  try{await navigator.clipboard.writeText(markdown);setStatus("Comparison note copied. It contains unverified imported declarations.")}
  catch{setStatus("Clipboard is unavailable in this browser.")}
 };
 const clear=()=>{setImported(null);setErrors([]);setFileName("");setStatus("Imported content discarded from this page.")};
 return <section className="exchange" aria-label="Passport Exchange comparison tool">
  <div className="exchange-heading"><div><span className="room-eyebrow"><ArrowLeftRight size={14}/> PASSPORT EXCHANGE · v0.9</span><h3>Meet another idea.</h3><p>Compare this Bubble Room's Passport with one you already have. Nothing leaves this browser and no external connection is claimed.</p></div><div className="exchange-logo"><GitCompareArrows size={33}/></div></div>
  <div className="exchange-caution"><ShieldAlert size={20}/><p><strong>Untrusted import:</strong> A JSON file can claim any author, receipt or research result. Validation checks only the format and safety boundaries. It cannot authenticate provenance or prove that the source Issues exist.</p></div>
  <div className="exchange-upload">
   <div><strong>Choose a Bubble Passport JSON file</strong><span>v0.8 or v0.9 · Up to 1 MiB · Read locally, never uploaded</span></div>
   <label className="exchange-select"><FileUp size={17}/> Select JSON<input type="file" accept=".json,application/json" onChange={onFile} aria-label="Import Passport JSON file"/></label>
  </div>
  {!!errors.length&&<div className="exchange-error" role="alert"><strong>Import rejected</strong><ul>{errors.map((e,i)=><li key={i}>{e}</li>)}</ul></div>}
  {imported&&comparison&&<div className="exchange-compare">
   <div className="exchange-grid">
    <div className="exchange-item"><span>CURRENT ROOM · {currentPassport.bubble.visibility}</span><h4>{currentPassport.bubble.title}</h4><p>{currentPassport.bubble.summary}</p><small>Generated locally from the page's current data</small></div>
    <div className="exchange-arrow" aria-hidden="true"><ArrowLeftRight size={28}/></div>
    <div className="exchange-item imported"><span>IMPORTED FILE · {imported.bubble.visibility} (UNVERIFIED)</span><h4>{imported.bubble.title}</h4><p>{imported.bubble.summary}</p><small>{fileName} · declared origin not authenticated</small></div>
   </div>
   <div className="exchange-result"><strong>{comparison.relation}</strong><p>This is an exploratory topic comparison, not evidence of shared origin, copying, agreement, originality or scientific proof.</p>
    <div className="exchange-words"><b>Words appearing in both:</b>{comparison.sharedTerms.length?<div>{comparison.sharedTerms.map(t=><span key={t}>{t}</span>)}</div>:<em>No shared topic words detected.</em>}</div>
   </div>
   <h4 className="exchange-table-heading">Records represented in each snapshot</h4>
   <div className="exchange-counts">{Object.keys(comparison.currentCounts).map(key=><div key={key}><span>{key.replace(/_/g," ")}</span><strong>{comparison.currentCounts[key]}</strong><strong>{comparison.importedCounts[key]}</strong></div>)}</div>
   <div className="exchange-count-note">Numbers compare record presence only. They are not scientific scores. Both snapshots may be incomplete.</div>
   <div className="exchange-actions"><button className="button primary" type="button" onClick={copy}><ClipboardCopy size={17}/> Copy comparison note</button><button className="button plain" type="button" onClick={clear}><Trash2 size={16}/> Clear imported file</button></div>
  </div>}
  {status&&<p className="exchange-status" role="status"><Info size={16}/>{status}</p>}
  <div className="exchange-foot"><ShieldCheck size={18}/><p>Importing does not create an account, modify either Passport, upload anything or open GitHub Issues. To collaborate publicly, review the original source materials and use the normal human-approved Bubble Nest contribution workflow.</p></div>
 </section>;
}
