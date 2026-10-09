import React,{useEffect,useMemo,useState} from "react";
import {ArrowRight,ArrowUpRight,BookOpen,CheckCircle2,ClipboardList,ExternalLink,Flame,FlaskConical,GitCompareArrows,HelpCircle,Info,MessageCircleQuestion,Plus,Search,ShieldCheck,Sparkles,X} from "lucide-react";
import {evidenceForBubble} from "./evidenceData.js";
import {reviewsForBubble} from "./reviewData.js";
import {publicBubble} from "./bubbleGraph.js";
import {FLAME_ROUNDS,makeFlameChallenge,challengesForBubble,arenaCounts} from "./flameData.js";
import "./flameArena.css";

const cleanDefault={round:"State the Claim",question:"",proposedCheck:"",limits:"",receiptNumber:""};
const fromHash=()=>{try{return new URLSearchParams(location.hash.split("?")[1]||"").get("bubble")||""}catch{return ""}};
const date=s=>{const d=new Date(s||"");return Number.isNaN(d.getTime())?"Date unavailable":d.toLocaleDateString(undefined,{year:"numeric",month:"short",day:"numeric"})};
export default function ClaimArena({bubbles=[],receipts=[],reviews=[],challenges=[],feedStatus="loading",onOpenRoom}){
 const [selectedId,setSelectedId]=useState(fromHash),[search,setSearch]=useState("");
 const [formOpen,setFormOpen]=useState(false),[draft,setDraft]=useState(cleanDefault);
 const [roundFilter,setRoundFilter]=useState("All");
 const publicBubbles=useMemo(()=>bubbles.filter(publicBubble),[bubbles]);
 const visible=useMemo(()=>publicBubbles.filter(b=>[b.title,b.summary,b.category,b.author].join(" ").toLowerCase().includes(search.toLowerCase())),[publicBubbles,search]);
 useEffect(()=>{const read=()=>{setSelectedId(fromHash())};window.addEventListener("hashchange",read);return()=>window.removeEventListener("hashchange",read)},[]);
 useEffect(()=>{if(!publicBubbles.some(b=>b.id===selectedId)){setSelectedId(publicBubbles[0]?.id||"")}},[publicBubbles,selectedId]);
 const chosen=publicBubbles.find(b=>b.id===selectedId)||null;
 const linkedEvidence=useMemo(()=>evidenceForBubble(receipts,chosen),[receipts,chosen]);
 const linkedReviews=useMemo(()=>reviewsForBubble(reviews,chosen,receipts),[reviews,chosen,receipts]);
 const linkedChallenges=useMemo(()=>challengesForBubble(challenges,chosen,receipts),[challenges,chosen,receipts]);
 const counts=useMemo(()=>arenaCounts(chosen,receipts,reviews,challenges),[chosen,receipts,reviews,challenges]);
 const filtered=linkedChallenges.filter(x=>roundFilter==="All"||x.round===roundFilter);
 const related=draft.receiptNumber?linkedEvidence.find(e=>String(e.issueNumber)===draft.receiptNumber)||null:null;
 const prepared=chosen?makeFlameChallenge({...draft,bubble:chosen,receipt:related}):null;
 const change=(name,value)=>setDraft(d=>({...d,[name]:value}));
 const pick=b=>{
  setSelectedId(b.id);setRoundFilter("All");setFormOpen(false);setDraft(cleanDefault);
  history.replaceState(null,"",location.pathname+location.search+"#/flame?bubble="+encodeURIComponent(b.id));
 };
 return <section className="arena" id="claim-to-flame-arena">
   <div className="arena-header"><div><span className="eyebrow"><Flame size={15}/> THE PUBLIC CLAIM TO FLAME ARENA</span><h2>Let the claims <em>face the heat.</em></h2><p>Bring a real Bubble Nest proposal into the arena. Examine submitted receipts, opposing interpretations, review methods and open challenges. No automatic verdicts. Just inspectable sauce.</p></div><div className="arena-sigil"><Flame size={54}/><span>SAUCE BEFORE SOURCE</span></div></div>
   <div className="arena-disclosure"><ShieldCheck size={20}/><p><strong>Not a truth leaderboard.</strong> Every count below means a public record exists, not that any claim is validated. Review independence, the factual quality of sources, and contributors' identities are not automatically verified. The self-check above is separate from these public records.</p></div>
   <div className="arena-workspace">
    <div className="arena-library"><h3>Choose a public bubble</h3><label className="arena-search"><Search size={16}/><input aria-label="Search arena bubbles" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Find a claim or idea…"/></label>
      {visible.length?<div className="arena-bubble-list">{visible.map(b=><button key={b.id} className={chosen?.id===b.id?"selected":""} onClick={()=>pick(b)} aria-pressed={chosen?.id===b.id}><span className="arena-bubble-category">{b.category} · @{b.author}</span><strong>{b.title}</strong><span className="arena-bubble-open">Inspect public records <ArrowRight size={14}/></span></button>)}</div>:<div className="arena-empty small"><Sparkles size={25}/><p>{feedStatus==="loading"?"Loading public proposals…":feedStatus==="unavailable"?"GitHub is unavailable; no public bubbles can be confirmed in this session.":"No public bubbles match. Example and private drafts are intentionally excluded."}</p></div>}
      <div className="arena-caution"><Info size={15}/> Only submitted public issues are eligible. Demo cards never become “real research” by accident.</div>
    </div>
    <div className="arena-stage">
     {chosen?<><div className="arena-selected"><span className="eyebrow">NOW UNDER EXAMINATION · USER-SUBMITTED PROPOSAL</span><h3>{chosen.title}</h3><p>{chosen.summary}</p><button className="arena-text-button" onClick={()=>onOpenRoom?.(chosen)}>Enter its Bubble Room <ArrowUpRight size={16}/></button></div>
      <div className="arena-metrics">{[{value:counts.evidence,label:"Evidence receipts"},{value:counts.reviews,label:"Linked reviews"},{value:counts.questions,label:"Open challenges"}].map(s=><div key={s.label}><strong>{s.value}</strong><span>{s.label}</span></div>)}</div>
      <div className="arena-subgrid">
       <div className="arena-mini-panel"><h4><BookOpen size={17}/> Contributor evidence stances</h4>{Object.entries(counts.stances).map(([name,n])=><div className="arena-count-row" key={name}><span>{name}</span><strong>{n}</strong></div>)}<small>Self-selected labels. Zero is not a negative result.</small></div>
       <div className="arena-mini-panel"><h4><GitCompareArrows size={17}/> Review findings</h4>{Object.entries(counts.findings).map(([name,n])=><div className="arena-count-row" key={name}><span>{name}</span><strong>{n}</strong></div>)}<small>Review attempts and disagreements are not weighted as votes.</small></div>
      </div>
      <div className="arena-records"><div className="arena-records-title"><h4>Evidence trail</h4><span>{linkedEvidence.length} receipt(s)</span></div>{linkedEvidence.length?linkedEvidence.slice(0,8).map(e=><div key={e.id} className="arena-record"><div><span>{e.kind} · {e.stance} (self-reported)</span><strong>{e.summary}</strong><small>@{e.author} · {date(e.date)}</small></div><a href={e.url} target="_blank" rel="noopener noreferrer" aria-label={"Inspect evidence receipt "+e.issueNumber}><ExternalLink size={16}/></a></div>):<p className="arena-no-data">No evidence receipts are visible in the current public feed. This is not a conclusion about the claim.</p>}</div>
      <div className="arena-records"><div className="arena-records-title"><h4>Bring the heat: open challenges</h4><button className="arena-create" onClick={()=>setFormOpen(v=>!v)}><Plus size={15}/>{formOpen?"Close challenge form":"Challenge this claim"}</button></div>
       <div className="arena-filters">{["All",...FLAME_ROUNDS.map(x=>x.name)].map(x=><button key={x} aria-pressed={roundFilter===x} className={roundFilter===x?"selected":""} onClick={()=>setRoundFilter(x)}>{x}</button>)}</div>
       {filtered.length?filtered.map(c=><article className="arena-challenge" key={c.id}><div className="arena-challenge-meta"><span>{c.round}</span><small>@{c.author} · {date(c.date)}</small></div><h5>{c.question}</h5><p><b>Proposed check:</b> {c.proposedCheck}</p><p><b>Limits:</b> {c.limits}</p><a href={c.url} target="_blank" rel="noopener noreferrer">Review on GitHub <ExternalLink size={14}/></a></article>):<p className="arena-no-data">No {roundFilter==="All"?"public challenges":"challenges in this round"} in the current feed. Asking a question is not the same as disproving an idea.</p>}
      </div>
      {formOpen&&<form className="arena-form" onSubmit={e=>e.preventDefault()}><h4>Open an accountable challenge</h4><p>This will prepare a GitHub Issue. You decide whether to publish it.</p>
       <label className="field-label">Sauce round<select value={draft.round} onChange={e=>change("round",e.target.value)}>{FLAME_ROUNDS.map(x=><option key={x.name}>{x.name}</option>)}</select></label>
       <div className="arena-round-hint">{FLAME_ROUNDS.find(x=>x.name===draft.round)?.prompt}</div>
       <label className="field-label">Your specific question *<textarea rows={3} maxLength={900} value={draft.question} onChange={e=>change("question",e.target.value)} placeholder="What precise claim needs clarification or testing?"/></label>
       <label className="field-label">What could discriminate the alternatives? *<textarea rows={3} maxLength={900} value={draft.proposedCheck} onChange={e=>change("proposedCheck",e.target.value)} placeholder="Describe a public source, test, control, or observable failure condition."/></label>
       <label className="field-label">Limitations and uncertainty *<textarea rows={3} maxLength={900} value={draft.limits} onChange={e=>change("limits",e.target.value)} placeholder="What might your challenge fail to establish?"/></label>
       <label className="field-label">Related evidence receipt (optional)<select value={draft.receiptNumber} onChange={e=>change("receiptNumber",e.target.value)}><option value="">No specific receipt</option>{linkedEvidence.map(e=><option key={e.id} value={String(e.issueNumber)}>#{e.issueNumber} · {e.kind}: {e.summary.slice(0,65)}</option>)}</select></label>
       <div className="arena-submit"><p><ShieldCheck size={15}/> GitHub sign-in and explicit submission required. No verdict is generated.</p>{prepared?<a className="button warm" href={prepared.url} target="_blank" rel="noopener noreferrer">Review GitHub challenge <ArrowUpRight size={16}/></a>:<button type="button" disabled className="button warm">Complete required fields</button>}</div>
      </form>}
     </>:<div className="arena-empty"><Flame size={45}/><h3>Waiting for public claims.</h3><p>Once a real Bubble Nest idea is published through GitHub, it'll be available for accountable scrutiny here. Examples and private drafts stay out of the public arena.</p></div>}
    </div>
   </div>
   <div className="arena-footer"><MessageCircleQuestion size={18}/><p>Our challenges are open questions, not accusations. Public GitHub records may be omitted by pagination, API limits, or outages. The Arena is for exploring evidence and disagreement, not certifying scientific outcomes.</p></div>
 </section>;
}
