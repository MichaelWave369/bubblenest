import React,{useEffect,useMemo,useState}from"react";
import {ArrowUpRight,ClipboardList,ExternalLink,FlaskConical,Info,Plus,ShieldAlert,ShieldCheck,X}from"lucide-react";
import{TRIAL_KINDS,TRIAL_FINDINGS,makeTrialDraft,trialsForCharter,trialCounts}from"./fusionTrials.js";
import ArtifactReceiptPanel from "./ArtifactReceiptPanel.jsx";
import"./fusionTrials.css";

const blank={kind:"Planning note",finding:"Not assessed",question:"",procedure:"",observations:"",
 controls:"",artifacts:"",limitations:"",stopNote:"",next:"",acknowledged:false};
const formatDate=s=>{const d=new Date(s||"");return Number.isNaN(d.getTime())?"Date unavailable":d.toLocaleDateString(undefined,{year:"numeric",month:"short",day:"numeric"})};
export default function FusionTrialPanel({charter,proposal,bubbles=[],trials=[],artifacts=[],byteChecks=[]}){
 const[expanded,setExpanded]=useState(false),[writing,setWriting]=useState(false),[form,setForm]=useState(blank);
 useEffect(()=>{setExpanded(false);setWriting(false);setForm(blank)},[charter.issueNumber]);
 const records=useMemo(()=>trialsForCharter(trials,charter,proposal,bubbles),[trials,charter,proposal,bubbles]);
 const counts=useMemo(()=>trialCounts(trials,charter,proposal,bubbles),[trials,charter,proposal,bubbles]);
 const prepared=makeTrialDraft({...form,charter,proposal,bubbles});
 const update=(key,value)=>setForm(prev=>({...prev,[key]:value}));
 const updateKind=value=>setForm(prev=>({...prev,kind:value,finding:value==="Planning note"?"Not assessed":prev.finding}));
 return <section className="ft-panel" aria-label={"Trial receipt desk for Charter "+charter.issueNumber}>
  <div className="ft-head"><div><strong><FlaskConical size={16}/> Trial Receipt Ledger</strong>
   <p>{counts.total} recorded · {counts.attempts} attempt report(s) · {counts.stopped} stopped/aborted</p></div>
   <button type="button" onClick={()=>setExpanded(v=>!v)} aria-expanded={expanded}><ClipboardList size={16}/>{expanded?"Hide receipts":"Inspect receipts"}</button>
  </div>
  {expanded&&<>
   <div className="ft-guard"><ShieldAlert size={18}/><p><strong>Documentation does not grant permission.</strong> A Charter is still an unsigned proposal. These receipts record what someone claims to have planned, attempted, or stopped. The site cannot authorize, verify, execute, or independently reproduce anything.</p></div>
   {records.length?<div className="ft-list">{records.map(r=><article className="ft-receipt" key={r.id}>
    <div className="ft-receipt-meta"><span>{r.kind} · {r.finding} (self-reported)</span><small>#{r.issueNumber} · @{r.author} · {formatDate(r.date)}</small></div>
    <h4>{r.question}</h4>
    <p><b>Procedure:</b> {r.procedure}</p><p><b>Observations:</b> {r.observations}</p>
    <p><b>Controls/reproduction:</b> {r.controls}</p><p><b>Limitations:</b> {r.limitations}</p>
    {r.stopNote&&<p><b>Stop/withdrawal:</b> {r.stopNote}</p>}
    {r.next&&<p><b>Next check:</b> {r.next}</p>}
    {r.artifacts&&<a href={r.artifacts} target="_blank" rel="noopener noreferrer">Open submitted public artifact <ExternalLink size={13}/></a>}
    <div className="ft-receipt-foot"><span>REPORTED · NOT VERIFIED OR AUTHORIZED</span><a href={r.url} target="_blank" rel="noopener noreferrer">Read GitHub Issue <ArrowUpRight size={14}/></a></div>
    <ArtifactReceiptPanel trial={r} charter={charter} proposal={proposal} bubbles={bubbles} artifacts={artifacts} byteChecks={byteChecks}/>
   </article>)}</div>:<p className="ft-empty">No trial receipts are visible for this Charter. It might not have been used, or the bounded GitHub feed may omit earlier records.</p>}
   <button className="ft-toggle" type="button" onClick={()=>setWriting(v=>!v)}>{writing?<X size={16}/>:<Plus size={16}/>} {writing?"Close receipt draft":"Document a plan, attempt, or stopped test"}</button>
   {writing&&<form className="ft-form" onSubmit={e=>e.preventDefault()}>
    <p>Use this only to document authorized work you actually performed, a plan that is not yet executed, or why an attempt stopped. Never claim a Charter's existence authorized anyone to act.</p>
    <label className="field-label">Record type<select value={form.kind} onChange={e=>updateKind(e.target.value)}>{TRIAL_KINDS.map(k=><option key={k}>{k}</option>)}</select></label>
    <label className="field-label">Contributor interpretation<select value={form.finding} disabled={form.kind==="Planning note"} onChange={e=>update("finding",e.target.value)}>{TRIAL_FINDINGS.map(k=><option key={k}>{k}</option>)}</select></label>
    {[
     ["question","Question being examined *","What exact proposition or outcome is being investigated?",850],
     ["procedure","Procedure and environment *","Record versions, methods, hardware/software, or explain the planned method.",1350],
     ["observations","Observations, outcome, or reason not tested *","Report actual observations separately from your interpretation. Plans must say no run took place.",1400],
     ["controls","Controls / reproducibility information *","Controls, baselines, negative tests, repeat procedure, or missing information.",900],
     ["limitations","Limits, alternate explanations, uncertainty *","What remains unclear? Where can the interpretation break?",1000],
     ["stopNote","Stop or withdrawal reason"+(form.kind==="Stopped or aborted"?" *":""),"Why was the test stopped? Were any permissions withdrawn?",850],
     ["next","Next check","What would someone investigate or try next, after obtaining permission?",700]
    ].map(([name,label,hint,len])=><label className="field-label" key={name}>{label}<textarea rows={2} maxLength={len} value={form[name]} onChange={e=>update(name,e.target.value)} placeholder={hint}/></label>)}
    <label className="field-label">Public artifact URL (optional; HTTPS only)<input type="url" value={form.artifacts} maxLength={700} onChange={e=>update("artifacts",e.target.value)} placeholder="https://example.org/experiment/receipt"/></label>
    <label className="ft-check"><input type="checkbox" checked={form.acknowledged} onChange={e=>update("acknowledged",e.target.checked)}/><span>I understand this Issue is an unverified observation or plan, not permission to run experiments, publish private data, transfer rights or claim independent replication.</span></label>
    <div className="ft-form-foot"><span><ShieldCheck size={15}/> GitHub requires explicit review and submission. No action is run automatically.</span>
      {prepared?<a href={prepared.url} target="_blank" rel="noopener noreferrer" className="button primary">Review receipt on GitHub <ArrowUpRight size={15}/></a>:<button className="button primary" disabled type="button">Complete receipt fields</button>}</div>
   </form>}
   <p className="ft-footnote"><Info size={15}/> Source Issues, Charters and Trial receipts are editable public GitHub records. Their existence is not proof of scientific validity, legal consent, independence, or a completed test.</p>
  </>}
 </section>;
}
