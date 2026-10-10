import React,{useEffect,useMemo,useState} from "react";
import{ArrowUpRight,ClipboardCheck,ExternalLink,FileText,Flag,GitPullRequest,Info,Plus,ShieldAlert,ShieldCheck,X}from"lucide-react";
import{CHARTER_MODES,makeCharterDraft,chartersForFusion}from"./fusionCharters.js";
import{fusionResponseSummary}from"./fusionResponses.js";
import FusionTrialPanel from "./FusionTrialPanel.jsx";
import"./fusionCharters.css";
const fresh={mode:"Experiment protocol",objective:"",deliverable:"",methods:"",metrics:"",credit:"",rights:"",privacy:"",stop:"",checkpoint:"",limitations:"",acknowledged:false};
const d=s=>{const x=new Date(s||"");return Number.isNaN(x.getTime())?"Date unavailable":x.toLocaleDateString(undefined,{year:"numeric",month:"short",day:"numeric"})};
export default function FusionCharterPanel({proposal,bubbles=[],responses=[],charters=[],trials=[],artifacts=[],byteChecks=[],reproductions=[]}){
 const [expanded,setExpanded]=useState(false),[writing,setWriting]=useState(false),[form,setForm]=useState(fresh);
 useEffect(()=>{setExpanded(false);setWriting(false);setForm(fresh)},[proposal.issueNumber]);
 const existing=useMemo(()=>chartersForFusion(charters,proposal,bubbles),[charters,proposal,bubbles]);
 const signals=useMemo(()=>fusionResponseSummary(responses,proposal,bubbles),[responses,proposal,bubbles]);
 const prepared=makeCharterDraft({...form,proposal,bubbles});
 const update=(key,value)=>setForm(p=>({...p,[key]:value}));
 return <section className="fc-panel" aria-label={"Charter planning for Fusion invitation "+proposal.issueNumber}>
  <div className="fc-head"><div><strong>Fusion Charter Desk</strong><p>{existing.length} visible scope proposal(s) · no execution authorization</p></div><button type="button" onClick={()=>setExpanded(v=>!v)} aria-expanded={expanded}><ClipboardCheck size={16}/>{expanded?"Hide charter desk":"Open charter desk"}</button></div>
  {expanded&&<>
   <div className="fc-guard"><ShieldAlert size={18}/><p><strong>Planning, not permission.</strong> A Charter is a public draft describing possible work. It does not certify that contributors agree, sign contracts, grant licenses, approve spending, or authorize agents to start experiments.</p></div>
   <div className="fc-signals">
     <div><span>Source A · latest matched response</span><strong>{signals.a?.kind||"No matching response visible"}</strong></div>
     <div><span>Source B · latest matched response</span><strong>{signals.b?.kind||"No matching response visible"}</strong></div>
   </div>
   <p className="fc-status">{signals.pairedInterest?"Both origin-account handles show interest in discussing. This still does not grant permissions or make a charter active.":"A charter may be drafted for discussion, but no mutual interest is visible in the current feed. Never infer agreement from silence."}</p>
   {existing.length?<div className="fc-list">{existing.map(c=><article className="fc-card" key={c.id}>
     <div className="fc-card-meta"><span>{c.mode}</span><small>#{c.issueNumber} · @{c.author} · {d(c.date)}</small></div>
     <h4>{c.objective}</h4><p><b>Deliverable:</b> {c.deliverable}</p><p><b>Method:</b> {c.methods}</p><p><b>Evaluation:</b> {c.metrics}</p>
     <details><summary>View credit, permissions, safety and stop conditions</summary>
       <p><b>Independent attribution:</b> {c.credit}</p><p><b>Rights boundaries:</b> {c.rights}</p>
       <p><b>Privacy / safety:</b> {c.privacy}</p><p><b>Stop / withdraw:</b> {c.stop}</p>
       <p><b>Checkpoint:</b> {c.checkpoint}</p><p><b>Limitations:</b> {c.limitations}</p>
     </details>
     <div className="fc-card-foot"><span>DRAFT ONLY · NOT AUTHORIZED</span><a href={c.url} target="_blank" rel="noopener noreferrer">Review charter Issue <ExternalLink size={14}/></a></div>
     <FusionTrialPanel charter={c} proposal={proposal} bubbles={bubbles} trials={trials} artifacts={artifacts} byteChecks={byteChecks} reproductions={reproductions}/>
   </article>)}</div>:<p className="fc-empty">No public charters for this invitation in the current GitHub feed. A missing charter does not prove none exists.</p>}
   <button className="fc-toggle" type="button" onClick={()=>setWriting(x=>!x)}>{writing?<X size={16}/>:<Plus size={16}/>} {writing?"Close charter draft":"Draft a proposed charter"}</button>
   {writing&&<form className="fc-form" onSubmit={e=>e.preventDefault()}>
     <p>Draft a narrow pilot with clear acceptance criteria and credit boundaries. This creates a GitHub Issue draft for your own review, not a live project.</p>
     <label className="field-label">Type of proposed work<select value={form.mode} onChange={e=>update("mode",e.target.value)}>{CHARTER_MODES.map(v=><option key={v}>{v}</option>)}</select></label>
     {[
      ["objective","Shared objective *","What specific question or creative goal connects the two ideas?",800],
      ["deliverable","Deliverable and acceptance criteria *","What tangible result would be produced? How could it be evaluated?",950],
      ["methods","Method and responsibilities *","Who would do what, subject to their later explicit agreement?",1300],
      ["metrics","Evidence and evaluation plan *","What would count as success, failure, or an inconclusive result?",900],
      ["credit","Original contributions and credit *","How are both separate ideas credited and future work attributed?",850],
      ["rights","Permissions and license boundaries *","Which assets, code, data and IP are out of scope without written permission?",950],
      ["privacy","Privacy and safety controls *","What information must stay private? Any safety constraints?",850],
      ["stop","Stop conditions and withdrawal *","When must work stop, or an individual withdraw or revoke access?",800],
      ["checkpoint","Review checkpoint *","What review must occur before progressing or spending resources?",750],
      ["limitations","Uncertainty and risks *","Which assumptions or dependencies remain untested?",900]
     ].map(([key,label,placeholder,max])=><label className="field-label" key={key}>{label}<textarea rows={2} maxLength={max} value={form[key]} onChange={e=>update(key,e.target.value)} placeholder={placeholder}/></label>)}
     <label className="fc-check"><input type="checkbox" checked={form.acknowledged} onChange={e=>update("acknowledged",e.target.checked)}/><span>I understand this is an unsigned, nonbinding proposal. Each participant's specific permissions and authorization must be obtained separately before execution.</span></label>
     <div className="fc-form-foot"><span><Info size={15}/> No GitHub submission occurs until you explicitly review and post.</span>
       {prepared?<a href={prepared.url} className="button primary" target="_blank" rel="noopener noreferrer"><FileText size={16}/> Review charter on GitHub <ArrowUpRight size={15}/></a>:<button disabled type="button" className="button primary">Complete the charter</button>}
     </div>
   </form>}
   <p className="fc-fine"><ShieldCheck size={15}/> GitHub Issue authorship is a public account label, not a signature or legal verification. All charter text remains contributor-reported and subject to editing, missing API records and independent approval.</p>
  </>}
 </section>;
}
