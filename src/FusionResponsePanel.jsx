import React,{useEffect,useMemo,useState}from"react";
import{ArrowUpRight,ClipboardList,ExternalLink,Info,MessageSquare,Plus,ShieldAlert,ShieldCheck,Users,X}from"lucide-react";
import{RESPONSE_KINDS,RESPONSE_ROLES,makeFusionResponseDraft,fusionResponseSummary}from"./fusionResponses.js";
import{parentIssueNumber}from"./roomData.js";
import"./fusionResponses.css";
const initial={role:"A",kind:"Interested in discussing",scope:"",limits:"",note:""};
const date=s=>{const d=new Date(s||"");return Number.isNaN(d.getTime())?"Date unavailable":d.toLocaleDateString(undefined,{year:"numeric",month:"short",day:"numeric"})};
function Signal({label,author,response}){
 return <div className="fr-signal"><span>{label} · @{author||"unknown"}</span><strong>{response?response.kind:"No matching-account response visible"}</strong><small>{response?"Account matched to source Issue author. Not proof of real-world identity or legal consent.":"Other people's responses cannot be counted as this originating account's signal."}</small></div>;
}
export default function FusionResponsePanel({proposal,bubbles=[],responses=[]}){
 const[expanded,setExpanded]=useState(false),[writing,setWriting]=useState(false),[draft,setDraft]=useState(initial);
 useEffect(()=>{setExpanded(false);setWriting(false);setDraft(initial)},[proposal.issueNumber]);
 const a=bubbles.find(b=>parentIssueNumber(b.url)===proposal.aNumber),b=bubbles.find(b=>parentIssueNumber(b.url)===proposal.bNumber);
 const info=useMemo(()=>fusionResponseSummary(responses,proposal,bubbles),[responses,proposal,bubbles]);
 const prepared=makeFusionResponseDraft({...draft,proposal});
 const change=(k,v)=>setDraft(prev=>({...prev,[k]:v}));
 return <section className="fr-panel" aria-label={"Fusion response desk for invitation "+proposal.issueNumber}>
  <div className="fr-top"><div><strong>Contributor Response Desk</strong><p>{info.all.length} public response(s) visible for this specific invitation</p></div><button type="button" onClick={()=>setExpanded(v=>!v)} aria-expanded={expanded}><MessageSquare size={15}/>{expanded?"Hide responses":"Inspect responses"}</button></div>
  {expanded&&<>
   <div className="fr-signals"><Signal label={"SOURCE A · #"+proposal.aNumber} author={a?.author} response={info.a}/><Signal label={"SOURCE B · #"+proposal.bNumber} author={b?.author} response={info.b}/></div>
   {info.pairedInterest&&<p className="fr-interest"><Info size={16}/> Both source-issue author accounts have submitted an interest signal. This is **not** a mutual agreement, license grant or authorization to begin joint work.</p>}
   <p className="fr-guard"><ShieldAlert size={17}/> Account matches are based on GitHub issue authorship only. Original source authorship, human identity, permissions and the content of edited issues are not independently verified. Later responses supersede earlier signals in this display but do not erase their records.</p>
   {info.all.length?<div className="fr-list">{info.all.map(r=><article className="fr-entry" key={r.id}>
    <div className="fr-entry-head"><span>{r.role==="A"?"Source A":"Source B"} · {r.kind}</span><small>{r.originAccountMatch?"Matches source Issue author account":"Other account · not counted as source response"}</small></div>
    <p><b>Scope:</b> {r.scope}</p><p><b>Reservations:</b> {r.limits}</p>{r.note&&<p><b>Context:</b> {r.note}</p>}
    <div className="fr-entry-foot"><span>@{r.author} · {date(r.date)}</span><a href={r.url} target="_blank" rel="noopener noreferrer">Review GitHub receipt <ExternalLink size={14}/></a></div>
   </article>)}</div>:<p className="fr-none">No public responses in the current feed. Silence never counts as consent or disapproval.</p>}
   <button className="fr-compose" type="button" onClick={()=>setWriting(x=>!x)}>{writing?<X size={16}/>:<Plus size={16}/>} {writing?"Close response draft":"Prepare a response receipt"}</button>
   {writing&&<form className="fr-form" onSubmit={e=>e.preventDefault()}>
     <p>Only the GitHub account that authored the chosen source Issue can produce a matching-account signal. Anyone may prepare a draft; a different account's submission will remain labeled as an unmatched response.</p>
     <label className="field-label">Which original idea are you responding for?<select value={draft.role} onChange={e=>change("role",e.target.value)}><option value="A">Source A · @{a?.author||"unknown"}</option><option value="B">Source B · @{b?.author||"unknown"}</option></select></label>
     <label className="field-label">Your response<select value={draft.kind} onChange={e=>change("kind",e.target.value)}>{RESPONSE_KINDS.map(k=><option key={k}>{k}</option>)}</select></label>
     <label className="field-label">What scope or permissions would need discussion? *<textarea rows={3} maxLength={1100} value={draft.scope} onChange={e=>change("scope",e.target.value)} placeholder="Describe proposed boundaries. Do not grant licenses via this form."/></label>
     <label className="field-label">Reservations or conditions *<textarea rows={3} maxLength={900} value={draft.limits} onChange={e=>change("limits",e.target.value)} placeholder="What needs clarification, protection, or further work?"/></label>
     <label className="field-label">Additional context<textarea rows={2} maxLength={650} value={draft.note} onChange={e=>change("note",e.target.value)} placeholder="Optional reasons or a later change of mind"/></label>
     <div className="fr-submit"><p><ShieldCheck size={16}/> Response submits only through a separately reviewed GitHub Issue. It records an account signal, never legal consent.</p>{prepared?<a className="button primary" href={prepared.url} target="_blank" rel="noopener noreferrer">Review response on GitHub <ArrowUpRight size={15}/></a>:<button className="button primary" disabled type="button">Complete required details</button>}</div>
   </form>}
  </>}
 </section>;
}
