import React,{useEffect,useMemo,useState}from"react";
import{ArrowUpRight,ClipboardCheck,ExternalLink,FlaskConical,GitCompareArrows,Info,Plus,ShieldAlert,ShieldCheck,X}from"lucide-react";
import{artifactsForTrial}from"./artifactData.js";
import{REPRO_OUTCOMES,makeReproductionDraft,reproductionsForTrial,reproductionSummary}from"./reproductionData.js";
import"./reproductions.css";

const start={outcome:"INCONCLUSIVE",artifactIssue:"",referenceOutcome:"",method:"",
 environment:"",controls:"",observations:"",deviations:"",limitations:"",stopReason:"",acknowledged:false};
const labels={
 REPORTED_MATCH:"Reported similar outcome",
 REPORTED_DIFFERENCE:"Reported differing outcome",
 INCONCLUSIVE:"Inconclusive attempt",
 NOT_RUN_BLOCKED:"Blocked / not run",
 STOPPED:"Stopped during attempt"
};
const date=s=>{const d=new Date(s||"");return Number.isNaN(d.getTime())?"Date unknown":d.toLocaleDateString(undefined,{year:"numeric",month:"short",day:"numeric"})};
export default function ReproductionPanel({trial,charter,proposal,bubbles=[],artifacts=[],reproductions=[]}){
 const [open,setOpen]=useState(false),[compose,setCompose]=useState(false),[fields,setFields]=useState(start),[filter,setFilter]=useState("All");
 useEffect(()=>{setOpen(false);setCompose(false);setFields(start);setFilter("All")},[trial.issueNumber]);
 const available=useMemo(()=>artifactsForTrial(artifacts,trial,charter,proposal,bubbles),
  [artifacts,trial,charter,proposal,bubbles]);
 const rows=useMemo(()=>reproductionsForTrial(reproductions,trial,charter,proposal,bubbles,artifacts),
  [reproductions,trial,charter,proposal,bubbles,artifacts]);
 const summary=useMemo(()=>reproductionSummary(reproductions,trial,charter,proposal,bubbles,artifacts),
  [reproductions,trial,charter,proposal,bubbles,artifacts]);
 const selected=available.find(a=>String(a.issueNumber)===fields.artifactIssue)||null;
 const pinRequired=["REPORTED_MATCH","REPORTED_DIFFERENCE"].includes(fields.outcome);
 const eligiblePin=!!selected?.digest&&!!selected?.version;
 const prepared=makeReproductionDraft({...fields,trial,charter,proposal,bubbles,artifact:selected});
 const shown=filter==="All"?rows:rows.filter(r=>r.outcome===filter);
 const update=(k,v)=>setFields(prev=>({...prev,[k]:v}));
 return <section className="rp-panel" aria-label={"Reproduction receipts for trial "+trial.issueNumber}>
   <div className="rp-heading"><div><strong><GitCompareArrows size={16}/> Reproduction Attempts</strong>
    <p>{summary.total} public report(s) · {summary.counts.REPORTED_MATCH} reported match(es) · {summary.counts.REPORTED_DIFFERENCE} reported differences</p></div>
    <button type="button" aria-expanded={open} onClick={()=>setOpen(v=>!v)}><ClipboardCheck size={15}/>{open?"Hide attempts":"Inspect attempts"}</button>
   </div>
   {open&&<>
    <div className="rp-caution"><ShieldAlert size={19}/><p><b>Reproduction means an attempt, not a verdict.</b> All outcomes below are submitted by GitHub accounts and are not independently checked by the site. A matching report doesn't establish that the original scientific claim is correct. This Charter remains unauthorized.</p></div>
    <div className="rp-stats">
     <span>Reported match <b>{summary.counts.REPORTED_MATCH}</b></span>
     <span>Reported difference <b>{summary.counts.REPORTED_DIFFERENCE}</b></span>
     <span>Inconclusive <b>{summary.counts.INCONCLUSIVE}</b></span>
     <span>Blocked/stopped <b>{summary.counts.NOT_RUN_BLOCKED+summary.counts.STOPPED}</b></span>
    </div>
    <div className="rp-filter"><span>Show</span><select aria-label="Filter reproduction outcomes" value={filter} onChange={e=>setFilter(e.target.value)}>
      <option value="All">All reported outcomes</option>{REPRO_OUTCOMES.map(v=><option key={v} value={v}>{labels[v]}</option>)}
     </select></div>
    {shown.length?<div className="rp-records">{shown.map(r=><article className="rp-record" key={r.id}>
       <div className="rp-record-top"><span>{labels[r.outcome]}</span><small>#{r.issueNumber} · @{r.author} · {date(r.date)}</small></div>
       <p className="rp-account">{r.sameAccount?"SAME GITHUB ACCOUNT AS ORIGINAL TRIAL · NOT AN INDEPENDENT ACCOUNT":"DIFFERENT GITHUB ACCOUNT · INDEPENDENCE NOT VERIFIED"}</p>
       <h4>{r.referenceOutcome}</h4>
       <p><b>Repeat procedure:</b> {r.method}</p>
       <p><b>Environment:</b> {r.environment}</p>
       <p><b>Controls:</b> {r.controls}</p>
       <p><b>Observations / no-run reason:</b> {r.observations}</p>
       <p><b>Deviations:</b> {r.deviations}</p>
       <p><b>Limitations:</b> {r.limitations}</p>
       {r.stopReason&&<p><b>Stop or block:</b> {r.stopReason}</p>}
       <p><b>Artifact:</b> {r.artifactNumber?"#"+r.artifactNumber+" · "+r.artifactVersion+" · SHA-256 "+(r.artifactDigest||"not declared"):"No pinned artifact referenced"}</p>
       <a href={r.url} target="_blank" rel="noopener noreferrer">Read submitted reproduction Issue <ExternalLink size={14}/></a>
      </article>)}</div>:<p className="rp-empty">No {filter==="All"?"public reproduction reports":"reports for this outcome"} are visible. GitHub pagination may omit some records.</p>}
    <button type="button" className="rp-compose" onClick={()=>setCompose(x=>!x)}>{compose?<X size={16}/>:<Plus size={16}/>} {compose?"Close report":"Document a reproduction attempt"}</button>
    {compose&&<form className="rp-form" onSubmit={e=>e.preventDefault()}>
      <p>Only report work you were independently authorized to perform, or explicitly document why no run occurred. The site's GitHub Issue workflow does not grant anyone permission to execute code, use another person's private data, or publish artifacts.</p>
      <label className="field-label">Attempt outcome<select value={fields.outcome} onChange={e=>update("outcome",e.target.value)}>
        {REPRO_OUTCOMES.map(v=><option key={v} value={v}>{labels[v]}</option>)}</select></label>
      <label className="field-label">Linked artifact receipt{pinRequired?" *":""}<select value={fields.artifactIssue} onChange={e=>update("artifactIssue",e.target.value)}>
        <option value="">No artifact selected</option>
        {available.map(a=><option key={a.id} value={String(a.issueNumber)}>#{a.issueNumber}: {a.name} · {a.version} {a.digest?"(SHA-256 declared)":"(no SHA-256)"}</option>)}
       </select></label>
      {pinRequired&&!eligiblePin&&<p className="rp-pin-note" role="status"><ShieldAlert size={16}/> A reported matching or different outcome requires a visible source Artifact Receipt with a declared SHA-256 and version. Without it, record an inconclusive or blocked attempt instead.</p>}
      {selected&&<div className="rp-pin"><strong>Source snapshot: #{selected.issueNumber}</strong><small>{selected.name} · {selected.version}</small><code>{selected.digest||"NO SHA-256 DECLARED"}</code><span>The original bytes and this digest have NOT been independently verified by the site.</span></div>}
      {[
       ["referenceOutcome","Original trial outcome to compare *","Describe the original measurement, prediction or output you attempted to reproduce.",900],
       ["method","Repeat method and procedure *","Steps, inputs, pinned commits, dataset version, and what was run or could not be run.",1350],
       ["environment","Execution environment *","Hardware, OS, dependencies, runtime version, seeds, or why unavailable.",900],
       ["controls","Controls and baselines *","Independent controls, baseline comparisons, or why they were unavailable.",900],
       ["observations","Observations or reason no run completed *","Report actual measured observations, differences, or explicitly no execution.",1400],
       ["deviations","Deviations from original protocol *","Any changes to inputs, sampling, environment, or missing details. State none if none.",850],
       ["limitations","Limitations and alternative explanations *","What this did not test, uncertainty, provenance/permissions caveats.",1000],
       ["stopReason","Stopped or blocked reason"+(["NOT_RUN_BLOCKED","STOPPED"].includes(fields.outcome)?" *":""),"Explain any withdrawal, safety stop, missing permission or unavailable artifact.",850]
      ].map(([k,label,placeholder,max])=><label className="field-label" key={k}>{label}<textarea rows={2} maxLength={max} value={fields[k]} onChange={e=>update(k,e.target.value)} placeholder={placeholder}/></label>)}
      <label className="rp-check"><input type="checkbox" checked={fields.acknowledged} onChange={e=>update("acknowledged",e.target.checked)}/><span>I understand this is a contributor report, not verified replication, legal authorization, proof of independence or a license to use private materials.</span></label>
      <div className="rp-submit"><span><ShieldCheck size={15}/> No submission occurs until you review and post on GitHub.</span>
       {prepared?<a href={prepared.url} target="_blank" rel="noopener noreferrer" className="button primary">Review reproduction Issue <ArrowUpRight size={15}/></a>:<button type="button" className="button primary" disabled>Complete report fields</button>}</div>
     </form>}
    <p className="rp-fine"><Info size={15}/> Issue bodies and linked artifacts may change; missing records may reflect GitHub API limitations. Accounts are not cryptographically authenticated researchers.</p>
   </>}
 </section>;
}
