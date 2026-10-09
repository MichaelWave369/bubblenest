import test from "node:test";
import assert from "node:assert/strict";
import {terms,proposeOverlap,layoutGraph,touchingLinks,matchingNode,publicBubble,connectionDraft} from "./bubbleGraph.js";
const make=(id,title,category="Technology",extra={})=>({id,title,category,summary:"Open research concept",ask:"Looking for collaborators",...extra});
test("tokenizer ignores punctuation and common filler",()=>{
 const t=terms(make("one","Agent network, the AGENT!"));
 assert.ok(t.includes("agent"));
 assert.ok(t.includes("network"));
 assert.ok(!t.includes("the"));
 assert.equal(t.filter(x=>x==="agent").length,1);
});
test("same idea never produces a suggested connection",()=>{
 const a=make("same","Local mesh");
 assert.equal(proposeOverlap(a,a),null);
});
test("topic links are explicitly suggestions, not causal claims",()=>{
 const a=make("a","Optical memory graph");
 const b=make("b","Optical memory maps","Science");
 const c=proposeOverlap(a,b);
 assert.ok(c);assert.match(c.reason,/Shared terms/);
 assert.equal(proposeOverlap(make("x","Pineapple sketch","Art"),make("y","Quantum battery","Science")),null);
});
test("layout is stable, capped, and all points remain in bounds",()=>{
 const all=Array.from({length:41},(_,i)=>make("n"+i,"A new community commons "+i,i%2?"Science":"Community"));
 const first=layoutGraph(all),second=layoutGraph(all);
 assert.deepEqual(first,second);
 assert.equal(first.nodes.length,30);assert.equal(first.omitted,11);
 for(const n of first.nodes){assert.ok(n.x>=67&&n.x<=932);assert.ok(n.y>=61&&n.y<=590);}
 for(const e of first.links){assert.ok(matchingNode(first,e.a));assert.ok(matchingNode(first,e.b));}
});
test("connected links come from visible matching nodes",()=>{
 const g=layoutGraph([make("a","Shared topic"),make("b","Shared topic too"),make("c","Unrelated","Art")]);
 assert.ok(touchingLinks(g,"a").some(e=>e.a==="b"||e.b==="b"));
 assert.equal(matchingNode(g,"missing"),null);
});
test("only public repository issue links may create connection drafts",()=>{
 const url=n=>"https://github.com/MichaelWave369/bubblenest/issues/"+n;
 const a=make("issue-1","A model","Science",{url:url(1)});
 const b=make("issue-2","Another model","Science",{url:url(2)});
 assert.equal(publicBubble(a),true);
 assert.equal(publicBubble({...a,local:true}),false);
 assert.equal(publicBubble({...a,sample:true}),false);
 assert.equal(publicBubble({...a,url:"https://evil.example/issues/1"}),false);
 assert.equal(connectionDraft(a,{...b,local:true},"Shared theme"),null);
 const result=connectionDraft(a,b,"Same broad category");
 assert.ok(result.title.startsWith("[Connection]"));
 assert.match(result.body,/not.*evidence of causal influence/i);
 assert.ok(result.body.includes(url(1))&&result.body.includes(url(2)));
});
