import React,{useEffect,useMemo,useState} from "react";
import {ArrowUpRight,BookOpen,ClipboardCheck,ExternalLink,FlaskConical,Info,MessageSquareText,Plus,Search,ShieldAlert,ShieldCheck,Sparkles,X} from "lucide-react";
import {makeReviewDraft,REVIEW_KINDS,REVIEW_FINDINGS,REVIEW_RELATIONS,reviewsForBubble,reviewsForReceipt} from "./reviewData.js";
import {evidenceForBubble} from "./evidenceData.js";
import {publicBubble} from "./bubbleGraph.js";
import "./review.css";
const empty={kind:"Source inspection",finding:"Inconclusive",relationship:"Unknown / not disclosed",conflict:"",summary:"",method:"",limitations:"",next:""};
const displayDate=s=>{const d=new Date(s||"");return Number.isNaN(d.getTime())?"Date unavailable":d.toLocaleDateString(undefined,{month:"short",day:"numeric",year:"numeric"})};
const short=(s,n=105)=>s.length>n?s.slice(0,n-1)+"…":s;
export default function BruvReviewDesk({bubble,receipts=[],reviews=[],feedStatus="ready",initialReceipt=null}){
 const [selected,setSelected]=useState(null),[showForm,setShowForm]=useState(false),[draft,setDraft]=useState(empty),[query,setQuery]=useState("");
 const eligible=publicBubble(bubble);
 const evidence=useMemo(()=>evidenceForBubble(receipts,bubble),[receipts,bubble]);
 const allReviews=useMemo(()=>reviewsForBubble(reviews,bubble,receipts),[reviews,bubble,receipts]);
 useEffect(()=>{setSelected(null);setShowForm(false);setDraft(empty);setQuery("")},[bubble?.id]);
 useEffect(()=>{if(initialReceipt&&evidence.some(e=>e.issueNumber===initialReceipt))setSelected(initialReceipt)},[initialReceipt,evidence]);
 const receipt=evidence.find(e=>e.issueNumber===selected)||null;
 const receiptReviews=receipt?reviewsForReceipt(reviews,bubble,receipts,receipt.issueNumber):[];
 const visibleReviews=allReviews.filter(r=>[r.summary,r.method,r.author,r.kind,r.finding].join(" ").toLowerCase().includes(query.toLowerCase()));
 const formDraft=receipt?makeReviewDraft({...draft,bubble,receipt}):null;
 const update=(field,value)=>setDraft(v=>({...v,[field]:value}));
 const pick=r=>{setSelected(r.issueNumber);setShowForm(false);setDraft(empty)};
 return <section className="bruvdesk">
  <div className="bruvdesk-head"><div><span className="room-eyebrow"><Sparkles size={13}/> THE GRAND COUNCIL OF CONDIMENTAL INTEGRITY</span><h2>Bruv Review Desk.</h2><p>Challenge a particular evidence receipt, not the person who submitted it. Explain the checks you performed and what you could not determine.</p></div><div className="bruvdesk-seal"><ClipboardCheck size={36}/><small>SAUCE BEFORE SOURCE</small></div></div>
  <div className="bruvdesk-notice"><ShieldAlert size={19}/><p><strong>Not peer review certification:</strong> These are public GitHub contributor assessments. Declared independence and conflicts are self-reported, not authenticated. Contradictory results stay visible. A review is not a vote on truth.</p></div>
  <div className="bruvdesk-summary"><span><strong>{evidence.length}</strong> visible evidence receipt(s)</span><span><strong>{allReviews.length}</strong> linked review(s)</span><span>{feedStatus==="unavailable"?"GitHub unavailable: displayed results may be incomplete":"Latest entries from the public GitHub feed"}</span></div>
  <div className="bruvdesk-section"><h3>1. Choose a receipt to examine</h3><p>Select an existing source, experiment, replication, or review record from this Bubble Room.</p>
   {evidence.length?<div className="bruvdesk-picks">{evidence.map(r=><button className={selected===r.issueNumber?"bruvdesk-pick selected":"bruvdesk-pick"} key={r.id} onClick={()=>pick(r)} aria-pressed={selected===r.issueNumber}><span>#{r.issueNumber} · {r.kind}</span><strong>{short(r.summary)}</strong><small>{reviewsForReceipt(reviews,bubble,receipts,r.issueNumber).length} linked review(s)</small></button>)}</div>:<div className="bruvdesk-empty"><BookOpen size={30}/><p>There are no visible eligible evidence receipts yet. Open the Evidence tab to contribute one before reviewing it.</p></div>}
  </div>
  {receipt&&<div className="bruvdesk-focus">
    <div><span className="room-eyebrow">TARGET RECEIPT · GITHUB #{receipt.issueNumber}</span><h3>{receipt.summary}</h3><p>{receipt.limitations}</p><p className="bruvdesk-byline">Original submission: @{receipt.author} · {receipt.kind} · contributor stance: {receipt.stance}</p><a href={receipt.url} target="_blank" rel="noopener noreferrer">Inspect original receipt <ExternalLink size={14}/></a></div>
    {eligible&&<button className="button primary" onClick={()=>setShowForm(v=>!v)}>{showForm?<X size={17}/>:<Plus size={17}/>} {showForm?"Close form":"Submit a review"}</button>}
   </div>}
  {receipt&&showForm&&eligible&&<form className="bruvdesk-form" onSubmit={e=>e.preventDefault()}>
    <h3>Document your check</h3><p>You will review the prepared public Issue on GitHub before deciding whether to submit.</p>
    <div className="bruvdesk-two"><label className="field-label">Check type<select value={draft.kind} onChange={e=>update("kind",e.target.value)}>{REVIEW_KINDS.map(k=><option key={k}>{k}</option>)}</select></label>
    <label className="field-label">Your interpretation<select value={draft.finding} onChange={e=>update("finding",e.target.value)}>{REVIEW_FINDINGS.map(k=><option key={k}>{k}</option>)}</select></label></div>
    <label className="field-label">Relationship to original contributors<select value={draft.relationship} onChange={e=>update("relationship",e.target.value)}>{REVIEW_RELATIONS.map(k=><option key={k}>{k}</option>)}</select></label>
    <label className="field-label">Conflicts or relevant relationships *<textarea maxLength={650} rows={2} value={draft.conflict} onChange={e=>update("conflict",e.target.value)} placeholder="Disclose funding, authorship, collaboration, or state that you know of none…"/></label>
    <label className="field-label">Precisely what did you find? *<textarea maxLength={900} rows={3} value={draft.summary} onChange={e=>update("summary",e.target.value)} placeholder="What does the specific receipt support, challenge, or leave unresolved?"/></label>
    <label className="field-label">Method and publicly inspectable checks *<textarea maxLength={1300} rows={3} value={draft.method} onChange={e=>update("method",e.target.value)} placeholder="Describe your procedure, sources, versions, controls, and why the check is informative…"/></label>
    <label className="field-label">Limitations, uncertainty, or alternative explanations *<textarea maxLength={900} rows={3} value={draft.limitations} onChange={e=>update("limitations",e.target.value)} placeholder="What remains uncertain? What would weaken your conclusion?"/></label>
    <label className="field-label">Next test<textarea maxLength={650} rows={2} value={draft.next} onChange={e=>update("next",e.target.value)} placeholder="What should another reviewer try next?"/></label>
    <div className="bruvdesk-form-end"><p><Info size={16}/> Submitting needs GitHub sign-in. The website never silently publishes or certifies anything.</p>{formDraft?<a className="button primary" href={formDraft.url} target="_blank" rel="noopener noreferrer">Review on GitHub <ArrowUpRight size={16}/></a>:<button className="button primary" type="button" disabled>Complete required details</button>}</div>
   </form>}
  {receipt&&<div className="bruvdesk-section"><h3>Reviews of receipt #{receipt.issueNumber}</h3>{receiptReviews.length?<div className="bruvdesk-reviews">{receiptReviews.map(r=><ReviewCard key={r.id} review={r}/>)}</div>:<div className="bruvdesk-empty"><MessageSquareText size={25}/><p>No matching public reviews in the current feed. That's not a claim that none exist elsewhere.</p></div>}</div>}
  <div className="bruvdesk-section"><h3>All linked reviews</h3><label className="bruvdesk-search"><Search size={16}/><input aria-label="Search published reviews" placeholder="Search reviewers, methods, or findings…" value={query} onChange={e=>setQuery(e.target.value)}/></label>
   {visibleReviews.length?<div className="bruvdesk-reviews">{visibleReviews.map(r=><ReviewCard key={r.id} review={r}/>)}</div>:<div className="bruvdesk-empty"><MessageSquareText size={25}/><p>No matching reviews in the visible feed. All findings remain contributor-reported.</p></div>}
  </div>
  <p className="bruvdesk-fine">A reviewed receipt must be a public, valid Bubble Nest evidence Issue associated with this specific Bubble Room. We do not count arbitrary URLs as verified receipts. GitHub issue edits, historical omissions, and API limits may affect what you see.</p>
 </section>;
}
function ReviewCard({review:r}){
 return <article className="bruvdesk-review">
  <div className="bruvdesk-review-top"><span>REVIEW #{r.issueNumber} · EVIDENCE #{r.targetIssueNumber}</span><span className={"bruvdesk-finding finding-"+r.finding.toLowerCase().replace(/\s+/g,"-")}>{r.finding} · self-reported</span></div>
  <h4>{r.summary}</h4><p><b>Method:</b> {r.method}</p><p><b>Limitations:</b> {r.limitations}</p><p><b>Disclosure:</b> {r.relationship}. {r.conflict}</p>
  {r.sameAccount&&<p className="bruvdesk-self"><ShieldAlert size={15}/> Same GitHub account as original receipt author. Not an independent account review.</p>}
  <div className="bruvdesk-review-foot"><span>@{r.author} · {displayDate(r.date)}</span><a href={r.url} target="_blank" rel="noopener noreferrer">Open review issue <ArrowUpRight size={14}/></a></div>
 </article>;
}
