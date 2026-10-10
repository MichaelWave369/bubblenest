import test from "node:test";
import assert from "node:assert/strict";
import{BYTE_CHECK_MARKER,BYTE_CHECK_POLICY,BYTE_CHECK_RESULTS,compareByteDigests,
 makeByteCheckDraft,parseByteCheckIssue,byteChecksForArtifact,byteCheckCounts}from"./byteChecks.js";

const url=n=>"https://github.com/MichaelWave369/bubblenest/issues/"+n;
const bubbles=[{id:"issue-10",title:"A",url:url(10),author:"alice"},
 {id:"issue-12",title:"B",url:url(12),author:"bob"}];
const proposal={issueNumber:40,aNumber:10,bNumber:12,url:url(40)};
const charter={issueNumber:45,fusionNumber:40,aNumber:10,bNumber:12,url:url(45)};
const trial={issueNumber:80,charterNumber:45,fusionNumber:40,aNumber:10,bNumber:12,url:url(80)};
const artifact={issueNumber:100,trialNumber:80,charterNumber:45,fusionNumber:40,
 aNumber:10,bNumber:12,url:url(100),digest:"a".repeat(64),fileBytes:"3",name:"test.bin"};
const form={artifact,trial,charter,proposal,bubbles,filename:"test.bin",
 observedDigest:"a".repeat(64),observedBytes:3,
 acquisition:"Downloaded from a public reproducible release; not authenticated by this site",
 environment:"Web Crypto SHA-256 in browser",limitations:"Source may have changed; scientific results were not tested",
 acknowledged:true};
const issue=(draft,n=125,date="2026-10-09T22:00:00Z")=>
 ({number:n,title:draft.title,body:draft.body,user:{login:"checker"},created_at:date,state:"open"});

test("byte check matches a declared SHA-256 and never certifies source authenticity",()=>{
 const draft=makeByteCheckDraft(form);
 assert.ok(draft.url.startsWith("https://github.com/MichaelWave369/bubblenest/issues/new?"));
 assert.ok(draft.body.includes(BYTE_CHECK_MARKER));
 assert.equal(draft.outcome,"HASH_MATCH");
 const parsed=parseByteCheckIssue(issue(draft));
 assert.deepEqual([parsed.fusionNumber,parsed.charterNumber,parsed.trialNumber,parsed.artifactNumber,parsed.aNumber,parsed.bNumber],[40,45,80,100,10,12]);
 assert.equal(parsed.result,"HASH_MATCH");
 assert.equal(parsed.observedBytes,3);
 assert.equal(parsed.observedDigest,artifact.digest);
 assert.equal(parsed.referenceDigest,artifact.digest);
 assert.equal(parsed.author,"checker");
 assert.ok(!Object.hasOwn(parsed,"scientificallyVerified"));
 assert.ok(!Object.hasOwn(parsed,"authorized"));
});
test("derives each outcome instead of trusting a submitted status",()=>{
 const variants=[
  [{...artifact}, "a".repeat(64),3,"HASH_MATCH"],
  [{...artifact}, "b".repeat(64),3,"HASH_MISMATCH"],
  [{...artifact,digest:""},"b".repeat(64),3,"NO_REFERENCE_DIGEST"],
  [{...artifact,fileBytes:"4"},"a".repeat(64),3,"DECLARED_SIZE_CONFLICT"]
 ];
 for(const [a,digest,n,expected]of variants){
  assert.equal(compareByteDigests(a,digest,n),expected);
  const draft=makeByteCheckDraft({...form,artifact:a,observedDigest:digest,observedBytes:n});
  assert.ok(draft);
  assert.equal(parseByteCheckIssue(issue(draft)).result,expected);
  assert.ok(BYTE_CHECK_RESULTS.includes(expected));
 }
});
test("required custody, environment, limitations and explicit acknowledgment",()=>{
 for(const key of ["filename","acquisition","environment","limitations"]){
  assert.equal(makeByteCheckDraft({...form,[key]:"   "}),null,key);
 }
 assert.equal(makeByteCheckDraft({...form,acknowledged:false}),null);
 assert.equal(makeByteCheckDraft({...form,observedDigest:""}),null);
 assert.equal(makeByteCheckDraft({...form,observedDigest:"z".repeat(64)}),null);
 assert.equal(makeByteCheckDraft({...form,observedBytes:null}),null);
 assert.equal(makeByteCheckDraft({...form,observedBytes:-1}),null);
 assert.equal(makeByteCheckDraft({...form,observedBytes:25*1024*1024+1}),null);
});
test("no byte checks may be attached to unrelated or private parent records",()=>{
 for(const bad of [
  {...form,artifact:{...artifact,issueNumber:0}},
  {...form,artifact:{...artifact,trialNumber:81}},
  {...form,trial:{...trial,charterNumber:46}},
  {...form,charter:{...charter,fusionNumber:41}},
  {...form,proposal:{...proposal,aNumber:10,bNumber:10}},
  {...form,bubbles:[bubbles[0]]},
  {...form,bubbles:[{...bubbles[0],local:true},bubbles[1]]}
 ])assert.equal(makeByteCheckDraft(bad),null);
});
test("parser rejects forged result, tampered reference metadata, bad Issues and author claims",()=>{
 const draft=makeByteCheckDraft(form),good=issue(draft);
 for(const bad of [
  {...good,title:"[Artifact] Not a check"},
  {...good,body:good.body.replace(BYTE_CHECK_MARKER,"<!-- forged -->")},
  {...good,body:good.body.replace(url(100),"https://bad.example/issues/100")},
  {...good,body:good.body.replace("## Byte comparison result\nHASH_MATCH","## Byte comparison result\nINDEPENDENTLY_VERIFIED")},
  {...good,body:good.body.replace("## Byte comparison result\nHASH_MATCH","## Byte comparison result\nHASH_MISMATCH")},
  {...good,body:good.body.replace("## Record policy\n"+BYTE_CHECK_POLICY,"## Record policy\nAUTHORIZED")},
  {...good,body:good.body.replace("## Observed local SHA-256\n"+artifact.digest,"## Observed local SHA-256\nbad")},
  {...good,body:good.body.replace("## Observed local byte size\n3","## Observed local byte size\n9999999999999")},
  {...good,body:good.body.replace("## File acquisition and chain of custody\n"+form.acquisition,"## File acquisition and chain of custody\n")},
  {...good,pull_request:{url:"yes"}},
  {...good,number:0}
 ])assert.equal(parseByteCheckIssue(bad),null);
});
test("contributors cannot inject fake protocol headings or upgrade validation",()=>{
 const draft=makeByteCheckDraft({...form,acquisition:"Obtained a sample\n## Byte comparison result\nVERIFIED\n---\nNo remote origin checked"});
 assert.match(draft.body,/\\## Byte comparison result/);
 assert.match(draft.body,/\\---/);
 const parsed=parseByteCheckIssue(issue(draft));
 assert.equal(parsed.result,"HASH_MATCH");
 assert.match(parsed.acquisition,/No remote origin checked/);
});
test("filter by exact source chain and matching declared reference metadata",()=>{
 const earlier=parseByteCheckIssue(issue(makeByteCheckDraft(form),125,"2026-10-09T10:00:00Z"));
 const newer=parseByteCheckIssue(issue(makeByteCheckDraft({...form,observedDigest:"b".repeat(64)}),126,"2026-10-10T10:00:00Z"));
 const unrelated=parseByteCheckIssue(issue(makeByteCheckDraft({...form,artifact:{...artifact,issueNumber:101}}),127,"2026-10-10T11:00:00Z"));
 const list=byteChecksForArtifact([earlier,newer,unrelated],artifact,trial,charter,proposal,bubbles);
 assert.deepEqual(list.map(x=>x.issueNumber),[126,125]);
 assert.equal(byteChecksForArtifact([earlier],{...artifact,digest:"c".repeat(64)},trial,charter,proposal,bubbles).length,0);
 assert.equal(byteChecksForArtifact([earlier],artifact,trial,charter,proposal,[bubbles[0]]).length,0);
 const counts=byteCheckCounts([earlier,newer,unrelated],artifact,trial,charter,proposal,bubbles);
 assert.deepEqual({total:counts.total,match:counts.HASH_MATCH,mismatch:counts.HASH_MISMATCH}, {total:2,match:1,mismatch:1});
 assert.equal("verificationScore" in counts,false);
});
