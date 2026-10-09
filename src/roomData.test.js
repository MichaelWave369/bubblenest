import test from "node:test";
import assert from "node:assert/strict";
import {
 ROOM_KINDS,ROOM_STATES,parentIssueNumber,bubbleRoomPath,roomIdFromHash,
 parseRoomEntry,makeRoomEntry,readRoomSection,roomEntriesForBubble,roomParticipants,roomActivity
}from"./roomData.js";
const root="https://github.com/MichaelWave369/bubblenest/issues/";
const bubble={id:"issue-12",title:"A public idea",author:"mikey",createdAt:"2026-10-09T11:00:00Z",url:root+"12"};
const contribution={bubble,kind:"Experiment",status:"Proposed",summary:"Try a reversible test",method:"Log two different runs",evidence:"No data yet",next:"Can others reproduce?"};
const asIssue=(draft,num=20)=>({number:num,title:draft.title,body:draft.body,user:{login:"reviewer"},state:"open",created_at:"2026-10-09T12:00:00Z"});
test("room paths support deep links and tolerate malformed escapes",()=>{
 assert.equal(bubbleRoomPath("issue-12"),"#/room/issue-12");
 assert.equal(roomIdFromHash("#/room/issue-12"),"issue-12");
 assert.equal(roomIdFromHash("#/room/issue-12?show=activity"),"issue-12");
 assert.equal(roomIdFromHash("#/explore"),"");
 assert.equal(roomIdFromHash("#/room/%XX"),"");
});
test("only literal repository issue URLs qualify as parents",()=>{
 assert.equal(parentIssueNumber(root+"12"),12);
 assert.equal(parentIssueNumber(root+"0000"),null);
 assert.equal(parentIssueNumber("https://github.com/other/repo/issues/12"),null);
 assert.equal(parentIssueNumber("https://github.com/MichaelWave369/bubblenest/pull/12"),null);
 assert.equal(parentIssueNumber(root+"12?redirect=1"),null);
});
test("proposals round trip through the public Issue protocol",()=>{
 for(const kind of ROOM_KINDS){
  const d=makeRoomEntry({...contribution,kind});
  assert.ok(d.url.startsWith("https://github.com/MichaelWave369/bubblenest/issues/new?"));
  const result=parseRoomEntry(asIssue(d));
  assert.equal(result.parentNumber,12);
  assert.equal(result.summary,contribution.summary);
  assert.equal(result.kind,kind);
  assert.equal(result.status,"Proposed");
  assert.equal(result.evidence,"No data yet");
  assert.equal(result.method,"Log two different runs");
  assert.equal(result.next,"Can others reproduce?");
  assert.equal(result.author,"reviewer");
 }
});
test("rejects spoofed, invalid and non-public linked entries",()=>{
 assert.equal(makeRoomEntry({...contribution,bubble:{id:"demo-1",sample:true}}),null);
 assert.equal(makeRoomEntry({...contribution,bubble:{url:"https://other.example/issues/12"}}),null);
 assert.equal(makeRoomEntry({...contribution,kind:"Certification"}),null);
 assert.equal(makeRoomEntry({...contribution,summary:"  "}),null);
 const valid=makeRoomEntry(contribution);
 assert.equal(parseRoomEntry({...asIssue(valid),pull_request:{url:"x"}}),null);
 assert.equal(parseRoomEntry({...asIssue(valid),title:"Something else"}),null);
 assert.equal(parseRoomEntry({...asIssue(valid),body:valid.body.replace("## Status\nProposed","## Status\nPeer-reviewed")}),null);
 assert.equal(parseRoomEntry({...asIssue(valid),body:valid.body.replace(root+"12","https://evil.example/issues/12")}),null);
});
test("multiline headers in user entries cannot become schema fields",()=>{
 const d=makeRoomEntry({...contribution,summary:"A note\n## Status\nReported outcome"});
 assert.ok(d.body.includes("\\## Status"));
 assert.equal(readRoomSection(d.body,"Status"),"Proposed");
 assert.equal(parseRoomEntry(asIssue(d)).status,"Proposed");
});
test("room contributions never appear in a different bubble",()=>{
 const x=parseRoomEntry(asIssue(makeRoomEntry(contribution),20));
 const y=parseRoomEntry(asIssue(makeRoomEntry({...contribution,bubble:{...bubble,url:root+"13"}}),21));
 assert.deepEqual(roomEntriesForBubble([y,x],bubble),[x]);
 assert.deepEqual(roomEntriesForBubble([y,x],{id:"demo",sample:true}),[]);
});
test("history sorts newest first, preserves distinct public accounts",()=>{
 const older=parseRoomEntry({...asIssue(makeRoomEntry(contribution),20),created_at:"2026-10-09T12:00:00Z"});
 const newer=parseRoomEntry({...asIssue(makeRoomEntry({...contribution,kind:"Update"}),21),created_at:"2026-10-10T12:00:00Z",user:{login:"another"}});
 const entries=roomEntriesForBubble([older,newer],bubble);
 assert.deepEqual(entries.map(e=>e.issueNumber),[21,20]);
 assert.deepEqual(roomParticipants(bubble,entries),["another","mikey","reviewer"]);
 const activity=roomActivity(bubble,entries);
 assert.equal(activity[0].type,"Update");
 assert.equal(activity.at(-1).type,"Bubble created");
});
