import React,{useEffect,useMemo,useState} from "react";
import {Orbit,Search,Network,GitCompareArrows,ExternalLink,ArrowRight,ArrowUpRight,Copy,Check,Info,Sparkles,ShieldCheck,Link2,Plus,X,Users} from "lucide-react";
import {categories} from "./data.js";
import {categoryColors,layoutGraph,touchingLinks,matchingNode,connectionDraft,publicBubble} from "./bubbleGraph.js";
import "./bubbleverse.css";

const repo="https://github.com/MichaelWave369/bubblenest";
function routeFocus(){try{return new URLSearchParams(location.hash.split("?")[1]||"").get("focus")||""}catch{return ""}}
function badge(b){return b.sample?"Illustrative example":b.local?"Private browser draft":"Public GitHub issue"}
function SelectionCard({b,reason,onOpen,onRoom}){
 return <div className="bv-compare-card"><span className="bv-meta">{badge(b)}</span><h4>{b.title}</h4><p>{b.summary}</p>{reason&&<small>{reason}</small>}<button className="bv-link" onClick={()=>onRoom(b)}>Open Bubble Room <ArrowUpRight size={15}/></button></div>;
}
export default function Bubbleverse({bubbles,onOpen,onRoom,onNew}){
 const[filter,setFilter]=useState("All"),[search,setSearch]=useState(""),[activeId,setActiveId]=useState(routeFocus),[compareId,setCompareId]=useState(""),[copied,setCopied]=useState(false),[onlyPublic,setOnlyPublic]=useState(false);
 const eligible=useMemo(()=>bubbles.filter(b=>(filter==="All"||b.category===filter)&&(!onlyPublic||publicBubble(b))&&([b.title,b.summary,b.ask,b.category,b.author].join(" ").toLowerCase().includes(search.trim().toLowerCase()))),[bubbles,filter,search,onlyPublic]);
 const graph=useMemo(()=>layoutGraph(eligible),[eligible]);
 useEffect(()=>{if(!graph.nodes.some(n=>n.id===activeId))setActiveId(graph.nodes[0]?.id||"");},[graph,activeId]);
 useEffect(()=>{if(compareId&&!graph.nodes.some(n=>n.id===compareId))setCompareId("");},[graph,compareId]);
 const active=matchingNode(graph,activeId);
 const connections=active?touchingLinks(graph,active.id).map(l=>({...l,other:matchingNode(graph,l.a===active.id?l.b:l.a)})).filter(x=>x.other):[];
 const compared=matchingNode(graph,compareId);
 const comparedEdge=compared&&active?graph.links.find(l=>l.a===active.id&&l.b===compared.id||l.b===active.id&&l.a===compared.id):null;
 const choose=id=>{setActiveId(id);setCompareId("");history.replaceState(null,"",location.pathname+location.search+"#/bubbleverse?focus="+encodeURIComponent(id));};
 const share=async()=>{if(!active)return;const url=location.origin+location.pathname+location.search+"#/bubbleverse?focus="+encodeURIComponent(active.id);try{await navigator.clipboard.writeText(url);setCopied(true);setTimeout(()=>setCopied(false),1800)}catch{setCopied(false)}};
 const issue=comparedEdge&&active&&compared?connectionDraft(active,compared,comparedEdge.reason):null;
 const topicCount=new Set(graph.nodes.map(n=>n.category)).size;
 return <section className="inner-page bubbleverse-page" id="bubbleverse">
  <span className="eyebrow"><Sparkles size={13}/> EXPLORE THE LIVING IDEA UNIVERSE</span>
  <div className="bv-head"><div><h1>The <em>Bubbleverse.</em></h1><p>Ideas have neighbors. Explore possible thematic overlaps, compare proposals, and invite collaboration without losing the trail of credit.</p></div><button className="button primary" onClick={onNew}><Plus size={17}/> Start a bubble</button></div>
  <div className="bv-toolbar">
   <label className="bv-search"><Search size={18}/><input value={search} onChange={e=>setSearch(e.target.value)} aria-label="Find bubbles on the map" placeholder="Find an idea or shared theme…"/></label>
   <label className="bv-category">Topic <select value={filter} onChange={e=>setFilter(e.target.value)}>{categories.map(c=><option key={c}>{c}</option>)}</select></label>
   <label className="bv-toggle"><input type="checkbox" checked={onlyPublic} onChange={e=>setOnlyPublic(e.target.checked)}/><span>Public only</span></label>
  </div>
  <div className="bv-stats"><span><Orbit size={15}/> <strong>{graph.nodes.length}</strong> visible bubbles</span><span><Network size={15}/> <strong>{graph.links.length}</strong> possible overlaps</span><span><Users size={15}/> <strong>{topicCount}</strong> topics</span>{graph.omitted>0&&<span className="bv-limit">First 30 shown; refine search to see {graph.omitted} more.</span>}</div>
  <div className="bv-layout">
   <div className="bv-map-wrap">
    <div className="bv-map" role="group" aria-label="Interactive bubble connections map. Select a bubble to inspect it.">
     <div className="bv-map-background" aria-hidden="true"/>
     <svg className="bv-wires" viewBox="0 0 1000 650" preserveAspectRatio="none" aria-hidden="true">
      <defs><linearGradient id="bv-wire" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#86fbd7"/><stop offset="1" stopColor="#9eaeff"/></linearGradient></defs>
      {graph.links.map(l=>{const a=matchingNode(graph,l.a),b=matchingNode(graph,l.b);if(!a||!b)return null;const highlighted=active?.id===l.a||active?.id===l.b;return <line key={l.a+"-"+l.b} x1={a.x} y1={a.y} x2={b.x} y2={b.y} className={highlighted?"bv-wire highlighted":"bv-wire"}/>;})}
     </svg>
     {graph.nodes.map(n=><button key={n.id} type="button" className={"bv-node "+(active?.id===n.id?"selected":"")+(n.sample?" demo":"")+(n.local?" private":"")} style={{left:(n.x/10)+"%",top:(n.y/6.5)+"%","--bubble-color":n.color}} onClick={()=>choose(n.id)} aria-pressed={active?.id===n.id} aria-label={n.title+"; "+badge(n)} title={n.title}><span className="bv-node-core"><span className="bv-node-category">{n.category}</span><span className="bv-node-title">{n.title}</span></span></button>)}
     {graph.nodes.length===0&&<div className="bv-empty"><Orbit size={38}/><h3>No bubbles in this orbit.</h3><p>Try another topic, or create a new idea.</p></div>}
     <span className="bv-map-stamp">BUBBLE NEST · IDEA ATLAS / v0.2</span>
    </div>
   </div>
   <aside className="bv-inspector" aria-live="polite">
    <div className="bv-inspector-heading"><div><span className="eyebrow">SELECTED BUBBLE</span><h2>Idea inspector</h2></div><Orbit size={26}/></div>
    {active?<><span className="bv-selected-tag" style={{"--bubble-color":active.color}}>{active.category} · {badge(active)}</span><h3>{active.title}</h3><p>{active.summary}</p><div className="bv-subsection"><strong>Looking for</strong><p>{active.ask||"Collaboration and discussion."}</p></div><div className="bv-subsection"><strong>Evidence status</strong><p>{active.evidence||"Not yet supplied."}</p></div>
    <div className="bv-inspector-actions"><button className="bv-pill-button" onClick={()=>onRoom(active)}>Enter Bubble Room <ArrowRight size={15}/></button><button className="bv-pill-button secondary" onClick={share}><Copy size={15}/>{copied?"Link copied":"Share selection"}</button></div>
    {publicBubble(active)&&<a className="bv-github-link" href={active.url} target="_blank" rel="noreferrer">Join its GitHub discussion <ExternalLink size={15}/></a>}
    <div className="bv-connections"><h4>Possible nearby ideas <span>{connections.length}</span></h4><p className="bv-fineprint">Suggestions are based on shared words or categories, not demonstrated origin, influence, or agreement.</p>
    {connections.length?connections.map(l=><div className="bv-related" key={l.other.id}><button onClick={()=>choose(l.other.id)}><span style={{background:l.other.color}} className="bv-mini-dot"/><span>{l.other.title}</span><ArrowRight size={15}/></button><small>{l.reason}</small><button className="bv-compare-action" onClick={()=>setCompareId(l.other.id)}><GitCompareArrows size={14}/> Compare side by side</button></div>):<p className="bv-fineprint">No overlaps inferred. That's okay; not every bubble needs a fabricated connection.</p>}
    </div>
    </>:<div className="bv-inspector-empty">Select a bubble on the map to explore it.</div>}
   </aside>
  </div>
  {active&&compared&&<section className="bv-comparison" aria-labelledby="bv-compare-title"><div className="bv-compare-heading"><div><span className="eyebrow">TWO IDEAS · ONE QUESTION</span><h2 id="bv-compare-title">Bubble comparison</h2></div><button aria-label="Close comparison" className="bv-close" onClick={()=>setCompareId("")}><X size={18}/></button></div><div className="bv-comparison-grid"><SelectionCard b={active} onOpen={onOpen} onRoom={onRoom}/><div className="bv-versus"><GitCompareArrows size={28}/><span>≠</span></div><SelectionCard b={compared} onOpen={onOpen} onRoom={onRoom}/></div><div className="bv-comparison-footer"><Info size={18}/><p><strong>Why suggested:</strong> {comparedEdge?.reason||"No algorithmic overlap found."} Comparing concepts is not establishing shared provenance or ownership.</p>{issue&&<a className="button primary" href={repo+"/issues/new?title="+encodeURIComponent(issue.title)+"&body="+encodeURIComponent(issue.body)} target="_blank" rel="noreferrer">Propose public connection <ArrowUpRight size={16}/></a>}</div></section>}
  <div className="bv-legend">{Object.entries(categoryColors).map(([name,color])=><span key={name}><i style={{background:color}}/>{name}</span>)}</div>
  <div className="bv-explanation"><ShieldCheck size={21}/><div><strong>Connected ideas aren't necessarily related by origin.</strong><p>This graph is a keyword-and-topic discovery aid. Connections are unreviewed suggestions. Only public GitHub bubbles can be proposed as a documented connection; local drafts remain in this browser, and demo content is never presented as real community research.</p></div></div>
  <section className="bv-index"><div className="bv-index-title"><h2>Bubble directory</h2><p>Prefer reading over maps? Every visible bubble is here too.</p></div><div className="bv-index-grid">{graph.nodes.map(n=><button key={n.id} onClick={()=>choose(n.id)}><span className="bv-mini-dot" style={{background:n.color}}/><span>{n.title}</span><ArrowUpRight size={14}/></button>)}</div></section>
 </section>;
}
