import React,{useEffect,useMemo,useState} from "react";
import {ArrowUpRight,BookOpen,CheckCircle2,ClipboardList,ExternalLink,FileCheck2,FlaskConical,GitBranch,Info,Link2,Plus,RefreshCw,Search,ShieldCheck,Sparkles,Users,X} from "lucide-react";
import {EVIDENCE_KINDS,EVIDENCE_STANCES,makeEvidenceDraft,evidenceForBubble,evidenceSummary} from "./evidenceData.js";
import {publicBubble} from "./bubbleGraph.js";
import "./evidence.css";

const kindIcon={Source:BookOpen,Test:FlaskConical,Replication:RefreshCw,Review:FileCheck2};
const empty={kind:"Source",stance:"Undetermined",summary:"",method:"",sourceUrl:"",relatedEvolution:"",limitations:"",next:""};
const dateLabel=date=>{const d=new Date(date||"");return Number.isNaN(d.getTime())?"Date unavailable":d.toLocaleDateString(undefined,{year:"numeric",month:"short",day:"numeric"});};
function EvidenceCard({record}){
 const Icon=kindIcon[record.kind]||ClipboardList;
 return <article className="el-receipt">
  <div className="el-receipt-head"><span className="el-kind"><Icon size={16}/>{record.kind}</span><span className={"el-stance stance-"+record.stance.toLowerCase()}>{record.stance} · self-reported</span></div>
  <h4>{record.summary}</h4>
  {record.method&&<p><strong>Method / provenance:</strong> {record.method}</p>}
  {record.sourceUrl&&<p className="el-receipt-link"><Link2 size={15}/><a href={record.sourceUrl} target="_blank" rel="noopener noreferrer">Open submitted source <ExternalLink size={13}/></a></p>}
  {record.relatedEvolution&&<p className="el-receipt-link"><GitBranch size={15}/><a href={record.relatedEvolution} target="_blank" rel="noopener noreferrer">Related issue (not cross-checked) <ExternalLink size={13}/></a></p>}
  <p><strong>Limitations / alternatives:</strong> {record.limitations}</p>
  {record.next&&<p><strong>Next question:</strong> {record.next}</p>}
  <div className="el-receipt-footer"><span>@{record.author} · {dateLabel(record.date)} · issue #{record.issueNumber}</span><a href={record.url} target="_blank" rel="noopener noreferrer">Read GitHub receipt <ArrowUpRight size={15}/></a></div>
 </article>;
}
export default function EvidenceLedger({bubble,entries=[],feedStatus="ready"}){
 const [filter,setFilter]=useState("All"),[search,setSearch]=useState(""),[writing,setWriting]=useState(false),[entry,setEntry]=useState(empty);
 useEffect(()=>{setFilter("All");setSearch("");setWriting(false);setEntry(empty)},[bubble?.id]);
 const publicRoom=publicBubble(bubble);
 const records=useMemo(()=>evidenceForBubble(entries,bubble),[entries,bubble]);
 const stats=useMemo(()=>evidenceSummary(entries,bubble),[entries,bubble]);
 const visible=useMemo(()=>records.filter(r=>(filter==="All"||r.kind===filter)&&[r.summary,r.method,r.limitations,r.author,r.stance].join(" ").toLowerCase().includes(search.toLowerCase())),[records,filter,search]);
 const draft=makeEvidenceDraft({...entry,bubble});
 const update=(key,value)=>setEntry(x=>({...x,[key]:value}));
 return <section className="el-ledger">
  <div className="el-head"><div><span className="room-eyebrow"><Sparkles size={13}/> THE PUBLIC EVIDENCE LEDGER</span><h2>Bring the receipts.</h2><p>Collect source links, test records, replication attempts and reviews. Everything here is contributor-reported and open to correction.</p></div><div className="el-crest"><ShieldCheck size={36}/><span>SAUCE BEFORE SOURCE</span></div></div>
  <div className="el-counters">{EVIDENCE_KINDS.map(k=>{const Icon=kindIcon[k];return <div className="el-counter" key={k}><Icon size={21}/><strong>{stats.byKind[k]}</strong><span>{k==="Test"?"Test reports":k==="Replication"?"Replication attempts":k+" receipts"}</span></div>})}</div>
  <div className="el-trust"><Info size={20}/><div><strong>A receipt is a record, not a verdict.</strong><p>Evidence strength, truth, independent replication, author priority and scientific credibility are NOT established by a submitted Issue. “Supports” or “Challenges” describes the contributor's interpretation, not the site's judgment.</p></div></div>
  <div className="el-controls"><label className="el-search"><Search size={18}/><input aria-label="Search evidence receipts" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Find a method, claim, reviewer…"/></label><div className="el-chips" aria-label="Filter evidence type">{["All",...EVIDENCE_KINDS].map(k=><button type="button" key={k} className={filter===k?"selected":""} aria-pressed={filter===k} onClick={()=>setFilter(k)}>{k}{k==="All"?" ("+records.length+")":" ("+stats.byKind[k]+")"}</button>)}</div></div>
  <div className="el-status"><span>{visible.length} record(s) shown</span>{feedStatus==="loading"&&<span>Loading public GitHub records…</span>}{feedStatus==="unavailable"&&<span className="el-warning">GitHub feed unavailable. Results may be incomplete.</span>}</div>
  {visible.length?<div className="el-list">{visible.map(r=><EvidenceCard record={r} key={r.id}/>)}</div>:<div className="el-empty"><ClipboardList size={32}/><h3>{search||filter!=="All"?"No matching receipts":"No receipts recorded yet"}</h3><p>{publicRoom?"Open a public contribution and include its sources, uncertainties and reproducible methods.":"This is a preview. Public evidence only belongs to a published GitHub bubble."}</p></div>}
  {publicRoom?<div className="el-contribute"><div><span className="room-eyebrow">OPEN RESEARCH, NOT AUTOMATIC ENDORSEMENT</span><h3>Add a documented receipt.</h3><p>Every contribution is reviewed by its author on GitHub before publishing. No secret posting or paid backend.</p></div><button className="button primary" type="button" onClick={()=>setWriting(v=>!v)}>{writing?<X size={16}/>:<Plus size={16}/>} {writing?"Close form":"Add receipt"}</button></div>:<p className="el-preview"><ShieldCheck size={17}/> Publish this idea to GitHub before adding public evidence. Local drafts and examples never generate a public receipt.</p>}
  {writing&&publicRoom&&<form className="el-form" onSubmit={e=>e.preventDefault()}>
   <div className="el-two">
    <label className="field-label">Receipt type<select value={entry.kind} onChange={e=>update("kind",e.target.value)}>{EVIDENCE_KINDS.map(k=><option key={k}>{k}</option>)}</select></label>
    <label className="field-label">My interpretation (not an official verdict)<select value={entry.stance} onChange={e=>update("stance",e.target.value)}>{EVIDENCE_STANCES.map(s=><option key={s}>{s}</option>)}</select></label>
   </div>
   <label className="field-label">Precise receipt summary *<textarea rows={3} maxLength={800} value={entry.summary} onChange={e=>update("summary",e.target.value)} placeholder="What does this source, measurement or review actually report?"/></label>
   <label className="field-label">Method and provenance {["Test","Replication"].includes(entry.kind)?"*":""}<textarea rows={3} maxLength={1400} value={entry.method} onChange={e=>update("method",e.target.value)} placeholder="Source author, study design, dataset, procedures, controls, or how the attempt was performed…"/></label>
   <label className="field-label">Public source link {entry.kind==="Source"?"*":""}<input type="url" maxLength={650} value={entry.sourceUrl} onChange={e=>update("sourceUrl",e.target.value)} placeholder="https://doi.org/... or other public record"/></label>
   <label className="field-label">Related evolution Issue (optional)<input type="url" maxLength={650} value={entry.relatedEvolution} onChange={e=>update("relatedEvolution",e.target.value)} placeholder="https://github.com/MichaelWave369/bubblenest/issues/123"/></label>
   <label className="field-label">Limits, uncertainty, alternative explanations *<textarea rows={3} maxLength={900} value={entry.limitations} onChange={e=>update("limitations",e.target.value)} placeholder="What could make this result wrong, inapplicable, unrepeatable or incomplete?"/></label>
   <label className="field-label">What should someone test next?<textarea rows={2} maxLength={500} value={entry.next} onChange={e=>update("next",e.target.value)} placeholder="The next useful challenge or missing control…"/></label>
   <div className="el-form-end"><p><ShieldCheck size={17}/> A GitHub Issue is only created after you review and submit it while signed in.</p>{draft?<a className="button primary" href={draft.url} target="_blank" rel="noopener noreferrer">Review draft on GitHub <ArrowUpRight size={16}/></a>:<button className="button primary" disabled type="button">Complete required fields</button>}</div>
  </form>}
  <p className="el-smallprint">This ledger displays matching items from the site's bounded public GitHub Issues feed. Empty results do not guarantee no contributions exist. Public sources may change after submission; links are not checked for validity, accessibility or factual accuracy.</p>
 </section>;
}
