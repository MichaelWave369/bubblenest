// Built-in PWA precache generator: no extra dependencies or remote services.
import {readdir,readFile,writeFile} from "node:fs/promises";
import {createHash} from "node:crypto";
import {resolve,relative,join,sep} from "node:path";
import {fileURLToPath} from "node:url";

export const PWA_BASE="/bubblenest/";
export const CACHE_PREFIX="bubble-nest-shell-";
export const OMIT_FILES=new Set(["sw.js",".DS_Store"]);
export function validRelativeAsset(path){
 return typeof path==="string" && path.length>0 && !path.startsWith("/") &&
  !path.includes("\\") && !path.split("/").some(part=>part===".."||part==="."||!part) &&
  !OMIT_FILES.has(path);
}
export async function collectAssets(dir){
 const assets=[];
 async function walk(folder){
  const entries=await readdir(folder,{withFileTypes:true});
  for(const entry of entries){
   const path=join(folder,entry.name);
   if(entry.isDirectory())await walk(path);
   else if(entry.isFile()){
    const name=relative(dir,path).split(sep).join("/");
    if(validRelativeAsset(name))assets.push({name,content:await readFile(path)});
   }
  }
 }
 await walk(dir);
 return assets.sort((a,b)=>a.name.localeCompare(b.name,"en"));
}
export function precachePaths(files,base=PWA_BASE){
 if(!/^\/[a-zA-Z0-9/_-]*\/$/.test(base))throw Error("Unsafe application scope.");
 const paths=[base];
 for(const file of files){
  if(!validRelativeAsset(file))throw Error("Unsafe asset path: "+file);
  paths.push(base+file);
 }
 if(!paths.includes(base+"index.html"))throw Error("Precache requires index.html.");
 return [...new Set(paths)].sort();
}
export function generateWorker({files,cacheName,base=PWA_BASE}){
 const paths=precachePaths(files,base);
 if(!cacheName.startsWith(CACHE_PREFIX)||!/^[a-zA-Z0-9-]+$/.test(cacheName))
  throw Error("Unsafe cache name.");
 const header=[
  '"use strict";',
  '/* Generated from dist by scripts/generate-pwa.mjs: offline application shell only. */',
  "const CACHE = "+JSON.stringify(cacheName)+";",
  "const PREFIX = "+JSON.stringify(CACHE_PREFIX)+";",
  "const ROOT = "+JSON.stringify(base)+";",
  "const PRECACHE = "+JSON.stringify(paths)+";",
  "const ALLOWED = new Set(PRECACHE);"
 ].join("\n");
 const worker="\nself.addEventListener(\"install\",event=>{\n  // Fail installation if an expected shell asset cannot be precached.\n  event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(PRECACHE)));\n});\nself.addEventListener(\"activate\",event=>{\n  event.waitUntil((async()=>{\n    const names=await caches.keys();\n    await Promise.all(names.filter(name=>name.startsWith(PREFIX)&&name!==CACHE).map(name=>caches.delete(name)));\n    await self.clients.claim();\n  })());\n});\nself.addEventListener(\"message\",event=>{\n  // A waiting worker only takes over after the person chooses the update in the UI.\n  if(event.data && event.data.type===\"SKIP_WAITING\")self.skipWaiting();\n});\nself.addEventListener(\"fetch\",event=>{\n  const request=event.request;\n  if(request.method!==\"GET\")return;\n  const url=new URL(request.url);\n  // No external data or GitHub API caching. Same-origin static app files only.\n  if(url.origin!==self.location.origin || !url.pathname.startsWith(ROOT))return;\n  if(request.mode===\"navigate\"){\n    event.respondWith((async()=>{\n      try{return await fetch(request);}\n      catch{\n        const cached=await caches.match(ROOT+\"index.html\");\n        return cached||Response.error();\n      }\n    })());\n    return;\n  }\n  // Cache-first only for static files included in this build.\n  if(!ALLOWED.has(url.pathname))return;\n  event.respondWith((async()=>{\n    const cached=await caches.match(url.pathname,{ignoreSearch:true});\n    return cached||fetch(request);\n  })());\n});\n";
 return header+"\n"+worker;
}
export async function generateDistWorker(dist,base=PWA_BASE){
 const assets=await collectAssets(dist);
 if(!assets.length)throw Error("No compiled assets were found.");
 const digest=createHash("sha256");
 for(const asset of assets){
  digest.update(asset.name,"utf8");digest.update("\0");
  digest.update(asset.content);digest.update("\0");
 }
 const revision=digest.digest("hex").slice(0,16);
 const cacheName=CACHE_PREFIX+revision;
 await writeFile(join(dist,"sw.js"),generateWorker({files:assets.map(a=>a.name),cacheName,base}),"utf8");
 return {revision,cacheName,assetCount:assets.length};
}
if(process.argv[1] && resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const dist=resolve(process.cwd(),"dist");
 try{
  const result=await generateDistWorker(dist);
  process.stdout.write("PWA shell precached: "+result.assetCount+" assets, revision "+result.revision+"\n");
 }catch(err){process.stderr.write(String(err.stack||err)+"\n");process.exitCode=1;}
}
