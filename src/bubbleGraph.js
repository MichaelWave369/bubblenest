// An intentionally conservative thematic graph, not a provenance or causality model.
export const categoryColors={
 Science:"#8ff5d6",Technology:"#8bc8ff",Philosophy:"#ceb6ff",
 Art:"#ffb3d4",Community:"#ffe0a1",Wildcards:"#ffad83"
};
const centers={
 Science:[202,196],Technology:[503,144],Philosophy:[809,198],
 Art:[198,472],Community:[505,496],Wildcards:[806,471]
};
const stops=new Set("with this that what your their them from into about when where have been will could would should want some another together people there they which while through these those then than under after before being every idea ideas the and but for you are our can not how its his her she who why does same open more much like real work works this one two just make help lets get made experimental propose test tests experiment experiments asking something might between using use other research concept generic proposal proposals".split(" "));
export function terms(bubble){
 const sentence=[bubble.title||"",bubble.summary||""].join(" ").toLowerCase().replace(/[^a-z0-9 ]/g," ");
 return [...new Set(sentence.split(/\s+/).filter(t=>t.length>=4&&!stops.has(t)))].sort();
}
export function proposeOverlap(a,b){
 if(!a||!b||String(a.id)===String(b.id))return null;
 const overlap=terms(a).filter(t=>terms(b).includes(t));
 const sameCategory=!!a.category&&a.category===b.category;
 if(overlap.length===0&&!sameCategory)return null;
 const score=overlap.length*3+(sameCategory?2:0);
 return {score,reason:overlap.length?"Shared terms: "+overlap.slice(0,3).join(", "):"Same broad category: "+a.category,shared:overlap.slice(0,3)};
}
export function layoutGraph(bubbles,maxNodes=30){
 const selected=bubbles.slice(0,maxNodes);
 const seen=new Map();
 const nodes=selected.map(b=>{
  const cat=centers[b.category]?b.category:"Wildcards";
  const i=seen.get(cat)||0;seen.set(cat,i+1);
  const [cx,cy]=centers[cat];
  const ring=i===0?0:Math.floor((i-1)/7)+1;
  const theta=(i-1)*2.399963229728653;
  const r=ring===0?0:Math.min(128,64+ring*29);
  const x=Math.max(67,Math.min(932,cx+Math.cos(theta)*r));
  const y=Math.max(61,Math.min(590,cy+Math.sin(theta)*r));
  return {...b,id:String(b.id),x:Math.round(x),y:Math.round(y),color:categoryColors[cat]};
 });
 const candidates=[];
 for(let i=0;i<nodes.length;i++)for(let j=i+1;j<nodes.length;j++){
  const overlap=proposeOverlap(nodes[i],nodes[j]);
  if(overlap)candidates.push({...overlap,a:nodes[i].id,b:nodes[j].id});
 }
 candidates.sort((x,y)=>y.score-x.score||x.a.localeCompare(y.a)||x.b.localeCompare(y.b));
 const degree=new Map(),links=[];
 for(const c of candidates){
  if((degree.get(c.a)||0)>=3||(degree.get(c.b)||0)>=3)continue;
  links.push(c);degree.set(c.a,(degree.get(c.a)||0)+1);degree.set(c.b,(degree.get(c.b)||0)+1);
 }
 return {nodes,links,omitted:Math.max(0,bubbles.length-selected.length)};
}
export function touchingLinks(graph,id){return graph.links.filter(x=>x.a===id||x.b===id);}
export function matchingNode(graph,id){return graph.nodes.find(x=>x.id===id)||null;}
export function publicBubble(b){return !!(b&&!b.local&&!b.sample&&/^https:\/\/github\.com\/MichaelWave369\/bubblenest\/issues\/\d+$/.test(b.url||""));}
export function connectionDraft(a,b,reason){
 if(!publicBubble(a)||!publicBubble(b))return null;
 return {
  title:"[Connection] "+a.title.slice(0,55)+" ↔ "+b.title.slice(0,55),
  body:"<!-- bubblenest:connection:v1 -->\n\n# Proposed thematic connection (unverified)\n\n## Bubble A\n"+a.url+"\n\n## Bubble B\n"+b.url+"\n\n## Why these may relate\n"+reason+"\n\n## What needs review\n- [ ] Check terminology and actual subject overlap\n- [ ] Ask original contributors before claiming shared provenance\n- [ ] Document evidence and meaningful differences\n\nThis suggestion is **not** evidence of causal influence, copying, agreement, or shared authorship."
 };
}
