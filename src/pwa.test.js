import test from "node:test";
import assert from "node:assert/strict";
import{mkdtemp,mkdir,writeFile,readFile,rm}from"node:fs/promises";
import{tmpdir}from"node:os";
import{join}from"node:path";
import{runInNewContext}from"node:vm";
import{PWA_BASE,CACHE_PREFIX,precachePaths,validRelativeAsset,
 generateIconPNG,generateWorker,generateDistWorker}from"../scripts/generate-pwa.mjs";

test("precache targets only safe app-relative static paths under Pages base",()=>{
 assert.deepEqual(precachePaths(["index.html","assets/main-B9.js","manifest.webmanifest"]),
  ["/bubblenest/","/bubblenest/assets/main-B9.js","/bubblenest/index.html","/bubblenest/manifest.webmanifest"]);
 for(const bad of ["/index.html","../private.txt","a/../b","a//b","a\\b","sw.js",""])
  assert.equal(validRelativeAsset(bad),false,bad);
 assert.throws(()=>precachePaths(["assets/main.js"]),/index.html/);
 assert.throws(()=>precachePaths(["index.html"],"https://evil.example/"),/Unsafe application scope/);
});
test("PWA icons use real PNG 192 and 512 dimensions without external binaries",()=>{
 for(const size of [192,512]){
  const png=generateIconPNG(size);
  assert.equal(png.subarray(0,8).toString("hex"),"89504e470d0a1a0a");
  assert.equal(png.toString("ascii",12,16),"IHDR");
  assert.equal(png.readUInt32BE(16),size);
  assert.equal(png.readUInt32BE(20),size);
  assert.ok(png.length>1000);
 }
 assert.throws(()=>generateIconPNG(16),/Unsupported/);
});
test("dist generator emits revisioned service worker with current assets and 192/512 icons",async()=>{
 const root=await mkdtemp(join(tmpdir(),"bubblenest-pwa-"));
 try{
  await mkdir(join(root,"assets"));
  await writeFile(join(root,"index.html"),"<h1>Bubble Nest</h1>");
  await writeFile(join(root,"assets","script-X.js"),"console.log('v1')");
  const first=await generateDistWorker(root);
  const worker=await readFile(join(root,"sw.js"),"utf8");
  assert.match(first.cacheName,/^bubble-nest-shell-[a-f0-9]{16}$/);
  assert.match(worker,/\/bubblenest\/assets\/script-X.js/);
  assert.match(worker,/\/bubblenest\/icons\/icon-192.png/);
  assert.match(worker,/\/bubblenest\/icons\/icon-512.png/);
  assert.match(worker,/cache\.addAll\(PRECACHE\)/);
  assert.ok((await readFile(join(root,"icons","icon-512.png"))).length>1000);
  const second=await generateDistWorker(root);
  assert.equal(second.revision,first.revision);
  await writeFile(join(root,"assets","script-X.js"),"console.log('v2')");
  const third=await generateDistWorker(root);
  assert.notEqual(third.revision,first.revision);
 }finally{await rm(root,{recursive:true,force:true})}
});
function serviceWorkerHarness(){
 const events={};
 const invoked=[];
 const cache=new Map();
 cache.set("/bubblenest/index.html",{type:"offline-shell"});
 cache.set("/bubblenest/assets/js-1.js",{type:"cached-asset"});
 const caches={
  match:async(path)=>cache.get(path),
  open:async()=>({addAll:async(paths)=>invoked.push(["precache",paths])}),
  keys:async()=>[],
  delete:async()=>{}
 };
 const self={
  location:{origin:"https://michaelwave369.github.io"},
  addEventListener:(type,fn)=>{events[type]=fn},
  skipWaiting:()=>invoked.push(["activate-update"]),
  clients:{claim:async()=>invoked.push(["claim"])}
 };
 const fetch=async request=>{
  invoked.push(["network",request.url||request]);
  throw Error("Offline");
 };
 const worker=generateWorker({files:["index.html","assets/js-1.js"],base:PWA_BASE,cacheName:CACHE_PREFIX+"abcde12345"});
 runInNewContext(worker,{self,caches,fetch,URL,Response:{error:()=>({type:"failed"})}});
 return{events,invoked,worker};
}
test("offline navigation to in-scope URL falls back to cached index.html",async()=>{
 const h=serviceWorkerHarness();
 const event={request:{method:"GET",url:"https://michaelwave369.github.io/bubblenest/",mode:"navigate"},
  respondWith(p){this.response=p}};
 h.events.fetch(event);
 assert.equal((await event.response).type,"offline-shell");
 assert.equal(h.invoked.filter(x=>x[0]==="network").length,1);
});
test("GitHub API, other origins and unknown same-origin requests are never cached or intercepted",()=>{
 const h=serviceWorkerHarness();
 for(const url of [
  "https://api.github.com/repos/MichaelWave369/bubblenest/issues",
  "https://github.com/MichaelWave369/bubblenest",
  "https://michaelwave369.github.io/another-project/",
  "https://michaelwave369.github.io/bubblenest/private-account-data"
 ]){
  let replied=false;
  h.events.fetch({request:{method:"GET",url,mode:"cors"},respondWith:()=>{replied=true}});
  assert.equal(replied,false,url);
 }
 let posted=false;
 h.events.fetch({request:{method:"POST",url:"https://michaelwave369.github.io/bubblenest/",mode:"cors"},
  respondWith:()=>{posted=true}});
 assert.equal(posted,false);
});
test("only precached shell file fetches are intercepted",async()=>{
 const h=serviceWorkerHarness();
 let result;
 h.events.fetch({request:{method:"GET",url:"https://michaelwave369.github.io/bubblenest/assets/js-1.js",mode:"cors"},
  respondWith(p){result=p}});
 assert.ok(result);
 assert.deepEqual(await result,{type:"cached-asset"});
 assert.equal(h.invoked.filter(x=>x[0]==="network").length,0);
});
test("update activation requires explicit SKIP_WAITING message",()=>{
 const h=serviceWorkerHarness();
 h.events.message({data:{type:"HELLO"}});
 assert.equal(h.invoked.some(x=>x[0]==="activate-update"),false);
 h.events.message({data:{type:"SKIP_WAITING"}});
 assert.equal(h.invoked.some(x=>x[0]==="activate-update"),true);
});
