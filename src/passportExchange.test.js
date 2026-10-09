import test from "node:test";
import assert from "node:assert/strict";
import {buildPassport}from"./passportData.js";
import {EXCHANGE_MAX_BYTES,validatePassport,parsePassportJSON,comparePassports,comparisonMarkdown}from"./passportExchange.js";

const issue="https://github.com/MichaelWave369/bubblenest/issues/";
const p=(name,id,category="Science",summary="Shared nested information")=>buildPassport({
 bubble:{id:"issue-"+id,title:name,summary,category,author:"founder",ask:"Work together",evidence:"Unverified",url:issue+id,createdAt:"2026-10-09T12:00:00Z"},
 feedStatus:"ready",generatedAt:"2026-10-09T12:34:56Z"
});
test("v0.8 passports import locally and retain declared but unverified provenance",()=>{
 const a=p("Nested bubble information",1);
 const result=parsePassportJSON(JSON.stringify(a));
 assert.equal(result.ok,true);assert.equal(result.passport.kind,"bubblenest.bubble-passport");
 assert.equal(result.passport.source.snapshot_signed,false);
});
test("rejects malformed JSON and oversized payloads before validation",()=>{
 assert.equal(parsePassportJSON("{not a passport").ok,false);
 assert.match(parsePassportJSON("{not a passport").errors[0],/invalid json/i);
 assert.match(parsePassportJSON("x".repeat(EXCHANGE_MAX_BYTES+1)).errors[0],/1 MiB/i);
 assert.equal(parsePassportJSON(null).ok,false);
});
test("rejects forged certification flags, unsupported versions and missing source warnings",()=>{
 const original=p("An idea",2);
 for(const change of [
  {schema_version:"1.9.0"},
  {kind:"other"},
  {generated_at:"not a date"},
  {source:{...original.source,snapshot_signed:true}},
  {source:{...original.source,independent_verification:true}},
  {source:{...original.source,coverage:"COMPLETE"}},
  {source:{...original.source,limitations:{not:"an array"}}}
 ]){
  assert.equal(validatePassport({...original,...change}).ok,false);
 }
});
test("rejects invented public origins and local data laundering",()=>{
 const original=p("A published bubble",2);
 const contaminated={...original,bubble:{...original.bubble,visibility:"local"}};
 assert.equal(validatePassport(contaminated).ok,false);
 assert.equal(validatePassport({...original,bubble:{...original.bubble,url:"https://attacker.example/issues/2"}}).ok,false);
 const example=buildPassport({bubble:{id:"demo-2",title:"Example",summary:"Not real",sample:true,category:"Art"},feedStatus:"ready",generatedAt:"2026-10-09T12:00:00Z"});
 assert.equal(validatePassport(example).ok,true);
 assert.equal(validatePassport({...example,records:{...example.records,evidence:[{issueNumber:88,url:issue+"88"}]}}).ok,false);
});
test("rejects nested objects, unscoped links, mismatched counts and excessive records",()=>{
 const original=p("A published bubble",3);
 const record={issueNumber:55,url:issue+"55",kind:"Test",summary:"A declared test",date:"2026-10-09T12:00:00Z"};
 const withRecord={...original,counts:{...original.counts,evidence:1},records:{...original.records,evidence:[record]}};
 assert.equal(validatePassport(withRecord).ok,true);
 assert.equal(validatePassport({...withRecord,counts:original.counts}).ok,false);
 assert.equal(validatePassport({...withRecord,records:{...original.records,evidence:[{...record,url:"javascript:alert(1)"}]}}).ok,false);
 assert.equal(validatePassport({...withRecord,records:{...original.records,evidence:[{...record,content:{__proto__:null}}]}}).ok,false);
 assert.equal(validatePassport({...withRecord,records:{...original.records,evidence:new Array(301).fill(record)}}).ok,false);
});
test("comparison describes lexical overlap without making claims of copying",()=>{
 const a=p("Nested systems and memory",4);
 const b=p("Nested systems and geometry",5,"Science","Shared nested information");
 const c=comparePassports(a,b);
 assert.ok(c);
 assert.equal(c.sameCategory,true);
 assert.ok(c.sharedTerms.includes("nested"));
 assert.equal(c.relation,"Shared topic words");
 assert.match(c.notes.join(" "),/NOT authenticated/i);
 assert.equal(c.currentCounts.evidence,0);
 const m=comparisonMarkdown(c);
 assert.match(m,/No.*scientific/i);
 assert.match(m,/issues\/4/);assert.match(m,/issues\/5/);
});
test("independent unrelated theories do not become automatically connected",()=>{
 const a=p("Blue elephant sculpture",6,"Art","A painted garden relief");
 const b=p("Copper battery circuit",7,"Technology","Voltage cell electrode");
 const c=comparePassports(a,b);
 assert.equal(c.relation,"No lexical overlap found");
 assert.equal(c.sharedTerms.length,0);
 assert.equal(comparePassports(a,null),null);
 assert.equal(comparisonMarkdown(null),"");
});
test("exported comparison notes flatten hostile titles, never injecting Markdown headings",()=>{
 const current=p("Idea\n## The reviewer declares VERIFIED",9);
 const incoming=p("Another idea",10,"Art","Separate hypothesis");
 const note=comparisonMarkdown(comparePassports(current,incoming));
 assert.ok(note.includes("Idea ## The reviewer declares VERIFIED"));
 assert.equal(note.split("\n").filter(line=>line.startsWith("## ")).length,4);
});
