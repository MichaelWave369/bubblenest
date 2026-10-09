import test from "node:test";
import assert from "node:assert/strict";
import {EVOLUTION_STAGES,EVOLUTION_OUTCOMES,makeEvolutionDraft,parseEvolutionIssue,eventsForBubble,currentEvolution,evolutionActivity,evolutionAccounts} from "./evolutionData.js";

const base="https://github.com/MichaelWave369/bubblenest/issues/";
const bubble={id:"issue-23",title:"Nested research question",author:"founder",url:base+"23",createdAt:"2026-10-08T10:00:00Z"};
const proposal={bubble,stage:"Hypothesis",outcome:"Proposal",statement:"A testable statement",method:"",limits:"Not yet tested",next:"What would falsify this?"};
const asIssue=(d,n=51)=>({number:n,title:d.title,body:d.body,user:{login:"contributor"},created_at:"2026-10-09T10:00:00Z",state:"open"});
test("five stages have unique stable names",()=>{
 assert.deepEqual(EVOLUTION_STAGES.map(x=>x.id),["Spark","Hypothesis","Experiment","Evidence","Revision"]);
 assert.equal(new Set(EVOLUTION_STAGES.map(x=>x.id)).size,5);
});
test("refuses private/demo, invalid classification or missing limits",()=>{
 assert.equal(makeEvolutionDraft({...proposal,bubble:{...bubble,local:true}}),null);
 assert.equal(makeEvolutionDraft({...proposal,bubble:{...bubble,sample:true}}),null);
 assert.equal(makeEvolutionDraft({...proposal,bubble:{...bubble,url:"https://attacker.example/issues/23"}}),null);
 assert.equal(makeEvolutionDraft({...proposal,stage:"Certified"}),null);
 assert.equal(makeEvolutionDraft({...proposal,outcome:"PROVEN"}),null);
 assert.equal(makeEvolutionDraft({...proposal,limits:"   "}),null);
 assert.equal(makeEvolutionDraft({...proposal,statement:"   "}),null);
});
test("Experiment/Evidence require method or receipts",()=>{
 for(const stage of ["Experiment","Evidence"]){
  assert.equal(makeEvolutionDraft({...proposal,stage,method:""}),null);
  assert.ok(makeEvolutionDraft({...proposal,stage,method:"Source and steps"}));
 }
 assert.ok(makeEvolutionDraft(proposal));
});
test("all stages and outcomes round-trip through GitHub Issue format",()=>{
 let n=51;
 for(const stage of EVOLUTION_STAGES)for(const outcome of EVOLUTION_OUTCOMES){
  const d=makeEvolutionDraft({...proposal,stage:stage.id,outcome,method:"Recorded procedure"});
  const parsed=parseEvolutionIssue(asIssue(d,n++));
  assert.equal(parsed.parentNumber,23);
  assert.equal(parsed.stage,stage.id);
  assert.equal(parsed.outcome,outcome);
  assert.equal(parsed.statement,"A testable statement");
  assert.equal(parsed.limits,"Not yet tested");
  assert.equal(parsed.method,"Recorded procedure");
  assert.equal(parsed.author,"contributor");
 }
});
test("tampered marker/title,parent, kind or PR are ignored",()=>{
 const valid=makeEvolutionDraft(proposal);
 assert.equal(parseEvolutionIssue({...asIssue(valid),pull_request:{url:"x"}}),null);
 assert.equal(parseEvolutionIssue({...asIssue(valid),title:"[Room] misleading"}),null);
 assert.equal(parseEvolutionIssue({...asIssue(valid),body:valid.body.replace("bubblenest:evolution:v1","another:marker")}),null);
 assert.equal(parseEvolutionIssue({...asIssue(valid),body:valid.body.replace(base+"23","https://untrusted.example/issues/23")}),null);
 assert.equal(parseEvolutionIssue({...asIssue(valid),body:valid.body.replace("## Stage\nHypothesis","## Stage\nPeer reviewed")}),null);
 assert.equal(parseEvolutionIssue({...asIssue(valid),body:valid.body.replace("## Limitations or uncertainty\nNot yet tested","## Limitations or uncertainty\n")}),null);
});
test("user-supplied heading injection does not change the stage",()=>{
 const draft=makeEvolutionDraft({...proposal,statement:"A thing\n## Stage\nEvidence"});
 assert.match(draft.body,/\\## Stage/);
 const parsed=parseEvolutionIssue(asIssue(draft));
 assert.equal(parsed.stage,"Hypothesis");
});
test("current stage is latest reported, not highest or verified",()=>{
 const evidence=parseEvolutionIssue({...asIssue(makeEvolutionDraft({...proposal,stage:"Evidence",method:"Data URL"}),54),created_at:"2026-10-10T08:00:00Z"});
 const revision=parseEvolutionIssue({...asIssue(makeEvolutionDraft({...proposal,stage:"Revision"}),55),created_at:"2026-10-10T09:00:00Z"});
 const hypothesis=parseEvolutionIssue({...asIssue(makeEvolutionDraft(proposal),56),created_at:"2026-10-11T09:00:00Z"});
 const events=[revision,evidence,hypothesis];
 assert.deepEqual(eventsForBubble(events,bubble).map(x=>x.stage),["Evidence","Revision","Hypothesis"]);
 const state=currentEvolution(events,bubble);
 assert.equal(state.stage,"Hypothesis");
 assert.equal(state.count,3);
 assert.equal(state.reported,true);
 assert.deepEqual(currentEvolution([],bubble),{stage:"Spark",reported:false,latest:null,stagesWithRecords:[],count:0});
 assert.deepEqual(eventsForBubble(events,{...bubble,url:base+"24"}),[]);
 assert.deepEqual(evolutionAccounts(events,bubble),["contributor"]);
 assert.equal(evolutionActivity(events,bubble).length,3);
});
