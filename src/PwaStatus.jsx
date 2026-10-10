import React,{useEffect,useRef,useState}from"react";
import{CheckCircle2,Download,RefreshCw,ShieldAlert,Wifi,WifiOff}from"lucide-react";
import"./pwaStatus.css";

export default function PwaStatus(){
 const [online,setOnline]=useState(()=>navigator.onLine);
 const [controlled,setControlled]=useState(()=>!!navigator.serviceWorker?.controller);
 const [waiting,setWaiting]=useState(false),[registration,setRegistration]=useState(null);
 const [installEvent,setInstallEvent]=useState(null),[installing,setInstalling]=useState(false);
 const [error,setError]=useState("");
 const reloadForUpdate=useRef(false),registrationRef=useRef(null);
 useEffect(()=>{
  const onlineChanged=()=>setOnline(navigator.onLine);
  const onControllerChange=()=>{
   setControlled(!!navigator.serviceWorker?.controller);
   if(reloadForUpdate.current){reloadForUpdate.current=false;window.location.reload();}
  };
  const captureInstall=event=>{event.preventDefault();setInstallEvent(event);};
  const installed=()=>setInstallEvent(null);
  window.addEventListener("online",onlineChanged);
  window.addEventListener("offline",onlineChanged);
  window.addEventListener("beforeinstallprompt",captureInstall);
  window.addEventListener("appinstalled",installed);
  if(!import.meta.env.PROD||!("serviceWorker" in navigator)){
   return ()=>{
    window.removeEventListener("online",onlineChanged);
    window.removeEventListener("offline",onlineChanged);
    window.removeEventListener("beforeinstallprompt",captureInstall);
    window.removeEventListener("appinstalled",installed);
   };
  }
  let active=true,reg=null,installedListener=null;
  const onUpdateFound=()=>{
   const worker=reg?.installing;
   if(!worker)return;
   installedListener=()=>{
    if(worker.state==="installed"&&navigator.serviceWorker.controller&&active)setWaiting(true);
   };
   worker.addEventListener("statechange",installedListener);
  };
  navigator.serviceWorker.addEventListener("controllerchange",onControllerChange);
  navigator.serviceWorker.register(import.meta.env.BASE_URL+"sw.js",{
   scope:import.meta.env.BASE_URL,updateViaCache:"none"
  }).then(async found=>{
   if(!active)return;
   reg=found;registrationRef.current=reg;setRegistration(reg);
   if(reg.waiting&&navigator.serviceWorker.controller)setWaiting(true);
   reg.addEventListener("updatefound",onUpdateFound);
   // An explicit update check on load, no background polling or surprise activation.
   if(navigator.onLine)try{await reg.update();}catch{}
   if(active)setControlled(!!navigator.serviceWorker.controller);
  }).catch(e=>{if(active)setError("Offline setup unavailable: "+String(e.message||e));});
  return ()=>{
   active=false;
   window.removeEventListener("online",onlineChanged);
   window.removeEventListener("offline",onlineChanged);
   window.removeEventListener("beforeinstallprompt",captureInstall);
   window.removeEventListener("appinstalled",installed);
   navigator.serviceWorker.removeEventListener("controllerchange",onControllerChange);
   if(reg)reg.removeEventListener("updatefound",onUpdateFound);
   if(reg?.installing&&installedListener)reg.installing.removeEventListener("statechange",installedListener);
  };
 },[]);
 const install=async()=>{
  if(!installEvent)return;
  try{
   setInstalling(true);
   await installEvent.prompt();
   await installEvent.userChoice;
   setInstallEvent(null);
  }catch{setError("Browser install prompt could not open.");}
  finally{setInstalling(false)}
 };
 const update=()=>{
  const reg=registrationRef.current||registration;
  if(!reg?.waiting)return;
  reloadForUpdate.current=true;
  reg.waiting.postMessage({type:"SKIP_WAITING"});
 };
 const recheck=async()=>{
  if(!registration)return;
  try{await registration.update();}catch{setError("Could not check for a newer app shell while disconnected.");}
 };
 return <section className="pwa-status" aria-label="Offline app and update status">
  <div className="pwa-status-line"><span className={online?"pwa-net online":"pwa-net offline"}>
    {online?<Wifi size={15}/>:<WifiOff size={15}/>}
    {online?"Browser reports online":"Browser reports offline"}
   </span><span className={controlled?"pwa-cache ready":"pwa-cache"}>
    {controlled?<CheckCircle2 size={14}/>:<ShieldAlert size={14}/>}
    {controlled?"Offline app shell ready":"Offline app shell not yet controlling this tab"}
   </span></div>
  <div className="pwa-controls">
   {waiting?<button type="button" className="pwa-update" onClick={update}>
     <RefreshCw size={15}/> Apply ready update and reload</button>:
    registration&&online?<button type="button" onClick={recheck}><RefreshCw size={14}/> Check app update</button>:null}
   {installEvent&&<button type="button" disabled={installing} onClick={install}>
    <Download size={14}/>{installing?"Opening install prompt…":"Install Bubble Nest"}</button>}
  </div>
  <p>Only the built app files are cached. GitHub records still need the network;
   saved capsules and the two-file comparison stay local. Offline support requires a successful first online load.</p>
  {error&&<p role="status" className="pwa-error">{error}</p>}
 </section>;
}
