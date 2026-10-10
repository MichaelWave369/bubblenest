import React,{useEffect,useMemo,useState}from"react";
import{ArrowRight,ArrowUpRight,CheckCircle2,ExternalLink,FlaskConical,GitMerge,HeartHandshake,Info,Link2,Plus,Search,ShieldAlert,ShieldCheck,Sparkles,Users}from"lucide-react";
import{FUSION_MODES,makeFusionDraft,validFusionPair,visibleFusionIssues,fusionPair}from"./fusionData.js";
import{publicBubble}from"./bubbleGraph.js";
import{parentIssueNumber}from"./roomData.js";
import"./fusion.css";
import FusionResponsePanel from "./FusionResponsePanel.jsx";
import FusionCharterPanel from "./FusionCharterPanel.jsx";
const blank={mode:"Joint experiment",question:"",plan:"",credits:"",boundaries:"",limits:"",understandsConsent:false};
function ids(){try{const q=new URLSearchParams(location.hash.split("?")[1]||"");return{a:q.get("a")||"",b:q.get("b")||""}}catch{return{a:"",b:""}}}
function stamp(s){const d=new Date(s||"");return Number.isNaN(d.getTime())?"Date unavailable":d.toLocaleDateString(undefined,{year:"numeric",month:"short",day:"numeric"})}
function ConsentNote(){return <div className="fusion-consent"><ShieldAlert size={20}/><p><strong>Invitation is not agreement.</strong> Original authors retain their independent attribution. A proposed Fusion Issue does not authorize copying, sharing private work, combining licenses, or implying that anyone has consented. Participants must explicitly agree in a separate, inspectable discussion.</p></div>}
function FusionRecord({r,bubbles,onOpenRoom,responses,charters,trials,artifacts,byteChecks}){
 const a=bubbles.find(b=>parentIssueNumber(b.url)===r.aNumber);
 const b=bubbles.find(b=>parentIssueNumber(b.url)===r.bNumber);
 return <article className="fusion-record">
  <div className="fusion-record-meta"><span>{r.mode}</span><small>GitHub #{r.issueNumber} · @{r.author} · {stamp(r.date)}</small></div>
  <h4>{r.question}</h4><div className="fusion-record-pair">
    <button type="button" onClick={()=>a&&onOpenRoom(a)}>#{r.aNumber} · {a?.title||"Source A"} <ArrowUpRight size={14}/></button>
    <GitMerge size={18}/>
    <button type="button" onClick={()=>b&&onOpenRoom(b)}>#{r.bNumber} · {b?.title||"Source B"} <ArrowUpRight size={14}/></button>
  </div>
  <p><strong>Proposed work:</strong> {r.plan}</p><p><strong>Credit plan:</strong> {r.credits}</p>
  <p><strong>Scope and consent boundaries:</strong> {r.boundaries}</p><p><strong>Limitations:</strong> {r.limits}</p>
  <div className="fusion-record-foot"><span>CONSENT NOT VERIFIED · AWAITING CONTRIBUTOR RESPONSES</span><a href={r.url} target="_blank" rel="noopener noreferrer">Discuss this invitation <ExternalLink size={14}/></a></div>
  <FusionResponsePanel proposal={r} bubbles={bubbles} responses={responses}/>
  <FusionCharterPanel proposal={r} bubbles={bubbles} responses={responses} charters={charters} trials={trials} artifacts={artifacts} byteChecks={byteChecks}/>
 </article>;
}
export default function BubbleFusion({bubbles=[],proposals=[],responses=[],charters=[],trials=[],artifacts=[],byteChecks=[],feedStatus="loading",onOpenRoom}){
 const [chosen,setChosen]=useState(ids),[query,setQuery]=useState(""),[form,setForm]=useState(blank),[mode,setMode]=useState("All");
 useEffect(()=>{const change=()=>setChosen(ids());window.addEventListener("hashchange",change);return()=>window.removeEventListener("hashchange",change)},[]);
 const publicBubbles=useMemo(()=>bubbles.filter(publicBubble),[bubbles]);
 const a=publicBubbles.find(b=>b.id===chosen.a)||null,b=publicBubbles.find(b=>b.id===chosen.b)||null;
 const found=useMemo(()=>publicBubbles.filter(b=>[b.title,b.summary,b.author,b.category].join(" ").toLowerCase().includes(query.toLowerCase())),[publicBubbles,query]);
 const all=useMemo(()=>visibleFusionIssues(proposals,publicBubbles),[proposals,publicBubbles]);
 const matching=a&&b?fusionPair(proposals,publicBubbles,a,b):[];
 const shown=(a&&b?matching:all).filter(r=>mode==="All"||mode===r.mode);
 const ready=validFusionPair(a,b);
 const prepared=makeFusionDraft({...form,a,b});
 const setPart=(which,id)=>{
  const next={...chosen,[which]:id};setChosen(next);setForm(blank);
  history.replaceState(null,"",location.pathname+location.search+"#/fusion?a="+encodeURIComponent(next.a)+"&b="+encodeURIComponent(next.b));
 };
 const change=(key,value)=>setForm(v=>({...v,[key]:value}));
 return <section className="inner-page fusion-page" id="fusion">
  <div className="fusion-hero"><div><span className="eyebrow"><Sparkles size={14}/> A GOVERNED HUMAN + AI COLLABORATION COMMONS</span><h1>Bubble <em>Fusion.</em></h1><p>Two sparks can inspire a shared experiment without erasing the people behind either idea. Compare public proposals, prepare an invitation, and let the original contributors decide what comes next.</p><div className="fusion-hero-foot"><span><CheckCircle2 size={15}/> Preserve separate origins</span><span><CheckCircle2 size={15}/> Invite, don't assume</span><span><CheckCircle2 size={15}/> Review on GitHub</span></div></div><div className="fusion-hero-art" aria-hidden="true"><div className="fusion-orbit circle-a"/><div className="fusion-orbit circle-b"/><GitMerge size={56}/></div></div>
  <ConsentNote/>
  <div className="fusion-layout"><div className="fusion-picker">
    <div className="fusion-panel-title"><span className="eyebrow">01 · TWO INDEPENDENT IDEAS</span><h2>Choose the bubbles.</h2><p>Only actual public GitHub issue-backed ideas can be invited into Fusion. Demo content and private browser drafts remain excluded.</p></div>
    <label className="fusion-search"><Search size={17}/><input aria-label="Search public bubbles" placeholder="Search public ideas…" value={query} onChange={e=>setQuery(e.target.value)}/></label>
    <div className="fusion-selected"><div><small>BUBBLE A</small><strong>{a?.title||"Choose first idea"}</strong><span>{a?"#"+parentIssueNumber(a.url)+" · @"+a.author:"No public issue selected"}</span></div><GitMerge size={23}/><div><small>BUBBLE B</small><strong>{b?.title||"Choose second idea"}</strong><span>{b?"#"+parentIssueNumber(b.url)+" · @"+b.author:"No public issue selected"}</span></div></div>
    {found.length?<div className="fusion-list">{found.map(item=><article key={item.id}><span>{item.category} · #{parentIssueNumber(item.url)}</span><strong>{item.title}</strong><p>{item.summary}</p><div><button type="button" onClick={()=>setPart("a",item.id)} disabled={b?.id===item.id} aria-pressed={a?.id===item.id}>{a?.id===item.id?"Selected A":"Set as A"}</button><button type="button" onClick={()=>setPart("b",item.id)} disabled={a?.id===item.id} aria-pressed={b?.id===item.id}>{b?.id===item.id?"Selected B":"Set as B"}</button><button type="button" onClick={()=>onOpenRoom(item)} aria-label={"Open room for "+item.title}><ArrowUpRight size={16}/></button></div></article>)}</div>:<div className="fusion-empty"><Sparkles size={26}/><p>{feedStatus==="loading"?"Looking up published bubbles…":feedStatus==="unavailable"?"GitHub public feed unavailable, so eligible ideas can't be confirmed.":"No matching published bubbles yet. The Fusion Lab cannot invent two contributors."}</p></div>}
  </div>
  <div className="fusion-form-panel"><div className="fusion-panel-title"><span className="eyebrow">02 · DESIGN THE INVITATION</span><h2>Build together, by agreement.</h2><p>Propose a specific shared activity and an independent attribution plan before opening an Issue.</p></div>
   {ready?<form onSubmit={e=>e.preventDefault()} className="fusion-form">
    <label className="field-label">Collaboration type<select value={form.mode} onChange={e=>change("mode",e.target.value)}>{FUSION_MODES.map(k=><option key={k}>{k}</option>)}</select></label>
    <label className="field-label">Joint question or objective *<textarea maxLength={750} rows={3} placeholder="What would these two ideas investigate or create together?" value={form.question} onChange={e=>change("question",e.target.value)}/></label>
    <label className="field-label">Proposed shared experiment or creative work *<textarea maxLength={1300} rows={3} placeholder="Define a measurable test, deliverable or limited pilot. What would success or failure look like?" value={form.plan} onChange={e=>change("plan",e.target.value)}/></label>
    <label className="field-label">Independent contributions and credit plan *<textarea maxLength={1100} rows={3} placeholder="Credit both originating ideas separately. How will later contributions be acknowledged?" value={form.credits} onChange={e=>change("credits",e.target.value)}/></label>
    <label className="field-label">Permission, ownership and consent boundaries *<textarea maxLength={1100} rows={3} placeholder="What is explicitly NOT being licensed, shared, merged or assumed?" value={form.boundaries} onChange={e=>change("boundaries",e.target.value)}/></label>
    <label className="field-label">Uncertainty, risks and open questions *<textarea maxLength={850} rows={3} placeholder="What might go wrong or remain unproven?" value={form.limits} onChange={e=>change("limits",e.target.value)}/></label>
    <label className="fusion-check"><input type="checkbox" checked={form.understandsConsent} onChange={e=>change("understandsConsent",e.target.checked)}/><span>I understand this is only an invitation. Neither original contributor is presumed to have agreed, and their work stays independently credited.</span></label>
    {matching.length>0&&<div className="fusion-notice">There {matching.length===1?"is":"are"} already {matching.length} visible public invitation{matching.length===1?"":"s"} involving this pair. Consider joining an existing discussion rather than creating a duplicate.</div>}
    {prepared?<a href={prepared.url} target="_blank" rel="noopener noreferrer" className="button primary fusion-submit"><HeartHandshake size={18}/> Review invitation on GitHub <ArrowUpRight size={15}/></a>:<button type="button" className="button primary fusion-submit" disabled>Choose two bubbles and complete all fields</button>}
    <p className="fusion-submit-note">GitHub sign-in and an explicit submit action are required. Bubble Nest never grants contributor consent, posts automatically, or alters either original idea.</p>
   </form>:<div className="fusion-form-empty"><GitMerge size={40}/><h3>Every fusion needs two real bubbles.</h3><p>Choose two distinct published ideas on the left. Only then can an invitation be drafted.</p></div>}
  </div></div>
  <section className="fusion-history"><div className="fusion-history-title"><div><span className="eyebrow">03 · PUBLIC INVITATION LEDGER</span><h2>{ready?"Discussion history for this pair":"Community Fusion proposals"}</h2><p>Every invitation can collect attributable account responses, but these do not constitute verified legal consent.</p></div><label>Type <select value={mode} onChange={e=>setMode(e.target.value)}><option>All</option>{FUSION_MODES.map(k=><option key={k}>{k}</option>)}</select></label></div>
   {shown.length?<div className="fusion-history-grid">{shown.map(item=><FusionRecord key={item.id} r={item} bubbles={publicBubbles} responses={responses} charters={charters} trials={trials} artifacts={artifacts} byteChecks={byteChecks} onOpenRoom={onOpenRoom}/>)}</div>:<div className="fusion-empty"><GitMerge size={29}/><p>No matching invitations are visible in this GitHub feed. That doesn't mean nothing has been discussed elsewhere.</p></div>}
  </section>
  <div className="fusion-foot"><Info size={18}/><p>Issue existence, metadata, relationship claims and consent declarations are not independently verified. Fusion is a governed proposal flow, not a license transfer or intellectual property registry. Public feed pagination and API outages can hide older records.</p></div>
 </section>;
}
