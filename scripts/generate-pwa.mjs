// Built-in PWA precache generator: no extra dependencies or remote services.
import {readdir,readFile,writeFile,mkdir} from "node:fs/promises";
import {deflateSync} from "node:zlib";
import {createHash} from "node:crypto";
import {resolve,relative,join,sep} from "node:path";
import {fileURLToPath} from "node:url";

export const PWA_BASE="/bubblenest/";
export const CACHE_PREFIX="bubble-nest-shell-";
export const OMIT_FILES=new Set(["sw.js",".DS_Store"]);
const crcTable=Array.from({length:256},(_,n)=>{
 let c=n;for(let i=0;i<8;i++)c=c&1?0xedb88320^(c>>>1):c>>>1;
 return c>>>0;
});
function pngChunk(type,data){
 const name=Buffer.from(type,"ascii"),length=Buffer.alloc(4);
 length.writeUInt32BE(data.length,0);
 let crc=0xffffffff;
 for(const b of Buffer.concat([name,data]))crc=crcTable[(crc^b)&255]^(crc>>>8);
 const hash=Buffer.alloc(4);hash.writeUInt32BE((crc^0xffffffff)>>>0,0);
 return Buffer.concat([length,name,data,hash]);
}
export function generateIconPNG(size){
 if(!Number.isInteger(size)||size<64||size>1024)throw Error("Unsupported icon size.");
 const stride=size*4+1,raw=Buffer.alloc(size*stride);
 for(let y=0;y<size;y++){
  const offset=y*stride;raw[offset]=0;
  for(let x=0;x<size;x++){
   const nx=(x+.5-size/2)/(size/2),ny=(y+.5-size/2)/(size/2);
   const radius=Math.hypot(nx,ny),cos=Math.SQRT1_2;
   const rx=(nx+ny)*cos,ry=(ny-nx)*cos;
   const ellipse=Math.sqrt((rx/.66)**2+(ry/.30)**2);
   let color=[11,32,48];
   if(Math.abs(radius-.64)<.013)color=[161,248,212];
   if(Math.abs(ellipse-1)<.048)color=[130,188,217];
   if(Math.abs(radius-.38)<.013)color=[239,189,137];
   if(radius<.075)color=[151,250,215];
   const i=offset+1+x*4;raw[i]=color[0];raw[i+1]=color[1];raw[i+2]=color[2];raw[i+3]=255;
  }
 }
 const ihdr=Buffer.alloc(13);ihdr.writeUInt32BE(size,0);ihdr.writeUInt32BE(size,4);ihdr[8]=8;ihdr[9]=6;
 return Buffer.concat([Buffer.from("89504e470d0a1a0a","hex"),pngChunk("IHDR",ihdr),
  pngChunk("IDAT",deflateSync(raw,{level:9})),pngChunk("IEND",Buffer.alloc(0))]);
}
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
 await mkdir(join(dist,"icons"),{recursive:true});
 await Promise.all([192,512].map(async size=>writeFile(join(dist,"icons","icon-"+size+".png"),generateIconPNG(size))));
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
