#!/usr/bin/env node
'use strict';
// Runs only under a GitHub Actions workflow on the default branch. The issue
// sender and author are validated before any filesystem changes. A public
// GitHub Pages website never receives or stores a personal access token.
const fs=require('node:fs');
const path=require('node:path');
const zlib=require('node:zlib');

const PREFIX='DND_ASSET_DELETE_V1';
const ROOT=path.resolve(process.argv[2]||'site');
const DRY_RUN=process.argv.includes('--dry-run');
function fail(message){throw Error(message)}
function readJson(p){return JSON.parse(fs.readFileSync(p,'utf8'))}
function saveJson(p,data){if(!DRY_RUN)fs.writeFileSync(p,JSON.stringify(data,null,2)+'\n','utf8')}
function ensureInside(p){
 const output=path.resolve(ROOT,p);
 if(!output.startsWith(ROOT+path.sep))fail('Invalid repository path: '+p);
 return output;
}
function getEvent(){
 const filename=process.env.GITHUB_EVENT_PATH;
 if(!filename)fail('Missing GitHub Actions event');
 const evt=readJson(filename),owner=process.env.GITHUB_REPOSITORY_OWNER;
 if(process.env.GITHUB_REPOSITORY!==owner+'/DND')fail('Unexpected repository');
 if(evt.issue?.user?.login!==owner||evt.sender?.login!==owner)fail('Deletion request is not from repository owner');
 if(evt.issue?.title!=='[DND-ASSET-DELETE]')fail('Unexpected issue title');
 if(evt.issue?.state!=='open')fail('Issue is not open');
 const lines=String(evt.issue.body||'').trim().split(/\r?\n/).map(x=>x.trim()).filter(Boolean);
 if(lines.shift()!==PREFIX)fail('Invalid deletion request version');
 if(!lines.length||lines.length>150)fail('Choose 1–150 assets per request');
 const ids=new Set();
 for(const id of lines){
  if(!/^(pirates|cliffy_coast|coastal_tree)_[a-z0-9_]+$/.test(id))fail('Invalid asset ID: '+id);
  if(ids.has(id))fail('Duplicate ID: '+id);
  ids.add(id);
 }
 return [...ids];
}
function parseBundle(data){
 const b=zlib.gunzipSync(data);
 let pos=0;
 function take(n){if(pos+n>b.length)fail('Truncated GLB bundle');const v=b.subarray(pos,pos+n);pos+=n;return v}
 if(take(4).toString('ascii')!=='LCGB')fail('Invalid bundle magic');
 if(take(4).readUInt32LE(0)!==1)fail('Unknown bundle version');
 const count=take(4).readUInt32LE(0);
 if(count>1000)fail('Implausible bundle entry count');
 const entries=[];
 for(let i=0;i<count;i++){
  const length=take(2).readUInt16LE(0);
  if(!length||length>255)fail('Invalid bundle filename');
  const filename=take(length).toString('utf8');
  const size=take(4).readUInt32LE(0);
  if(size<20||size>100*1024*1024)fail('Invalid GLB entry size');
  const payload=take(size);
  if(entries.some(x=>x.filename===filename))fail('Duplicate bundle filename');
  entries.push({filename,payload});
 }
 if(pos!==b.length)fail('Unexpected bundle bytes');
 return entries;
}
function packBundle(entries){
 const chunks=[Buffer.from('LCGB'),Buffer.alloc(4),Buffer.alloc(4)];
 chunks[1].writeUInt32LE(1,0);
 chunks[2].writeUInt32LE(entries.length,0);
 for(const {filename,payload} of entries){
  const name=Buffer.from(filename,'utf8');
  if(name.length>255)fail('Filename too long');
  const len=Buffer.alloc(2),size=Buffer.alloc(4);
  len.writeUInt16LE(name.length,0);size.writeUInt32LE(payload.length,0);
  chunks.push(len,name,size,payload);
 }
 return zlib.gzipSync(Buffer.concat(chunks),{level:9,mtime:0});
}
function execute(){
 const ids=getEvent();
 const base='lighthouse-editor/assets/';
 const piratesPath=ensureInside(base+'pirates/manifest.json');
 const cliffyPath=ensureInside(base+'cliffy-coast/asset-manager-index.json');
 const removedPath=ensureInside(base+'cliffy-coast/removed.json');
 const palmsPath=ensureInside(base+'palms/manifest.json');
 const pirate=readJson(piratesPath),cliffy=readJson(cliffyPath),removed=readJson(removedPath),palms=readJson(palmsPath);
 if(!Array.isArray(pirate.assets)||!Array.isArray(cliffy.assets)||!Array.isArray(removed.ids)||!Array.isArray(palms.assets))
  fail('Malformed repository indices');
 const removedSet=new Set(removed.ids),toRemove=[],packs=new Map();
 for(const id of ids){
  if(id.startsWith('pirates_')){
   const match=pirate.assets.find(x=>x.id===id);
   if(!match)fail('Pirate asset no longer registered: '+id);
   if(!/^[A-Za-z0-9][A-Za-z0-9_.-]*\.glb$/.test(match.file))fail('Invalid pirate filename');
   const location=ensureInside(base+'pirates/'+match.file);
   if(!fs.existsSync(location))fail('Missing pirate GLB: '+match.file);
   toRemove.push({id,location,source:'pirates'});
  }else if(id.startsWith('coastal_tree_')){
   const match=palms.assets.find(x=>x.id===id);
   if(!match)fail('Palm asset no longer registered: '+id);
   if(!/^[A-Za-z0-9][A-Za-z0-9_.-]*\.glb$/.test(match.file))fail('Invalid palm filename');
   const location=ensureInside(base+'palms/'+match.file);
   if(!fs.existsSync(location))fail('Missing palm model '+match.file);
   toRemove.push({id,location,source:'palms'});
  }else{
   const match=cliffy.assets.find(x=>x.id===id);
   if(!match||removedSet.has(id))fail('Cliffy asset no longer registered: '+id);
   if(match.kind==='direct'){
    if(!/^[A-Za-z0-9][A-Za-z0-9_.-]*\.glb$/.test(match.file))fail('Invalid Cliffy filename');
    const location=ensureInside(base+'cliffy-coast/'+match.file);
    if(!fs.existsSync(location))fail('Missing Cliffy GLB: '+match.file);
    toRemove.push({id,location,source:'cliffy'});
   }else if(match.kind==='packed'){
    if(!/^cliffy_batch(?:06_07|08_10)\.glbpack\.gz$/.test(match.pack))fail('Unknown archive');
    const location=ensureInside(base+'cliffy-coast/'+match.pack);
    if(!fs.existsSync(location))fail('Missing Cliffy bundle: '+match.pack);
    if(!packs.has(location))packs.set(location,new Set());
    packs.get(location).add(match.file);
    toRemove.push({id,location,source:'cliffy',packed:true});
   }else fail('Unsupported asset kind: '+id);
  }
 }
 // Validate and prepare ALL packed mutations before touching any file.
 const repacked=new Map();
 for(const [p,filenames] of packs){
  const entries=parseBundle(fs.readFileSync(p));
  for(const name of filenames)if(!entries.some(e=>e.filename===name))fail('GLB missing from packed archive: '+name);
  repacked.set(p,packBundle(entries.filter(e=>!filenames.has(e.filename))));
 }
 if(!DRY_RUN){
  for(const item of toRemove)if(!item.packed)fs.unlinkSync(item.location);
  for(const [p,data] of repacked)fs.writeFileSync(p,data);
 }
 pirate.assets=pirate.assets.filter(x=>!ids.includes(x.id));
 palms.assets=palms.assets.filter(x=>!ids.includes(x.id));
 for(const id of ids)if(id.startsWith('cliffy_coast_'))removedSet.add(id);
 removed.ids=[...removedSet].sort();
 saveJson(piratesPath,pirate);
 saveJson(palmsPath,palms);
 saveJson(removedPath,removed);
 const result={deletedIds:ids,pirates:toRemove.filter(x=>x.source==='pirates').length,
  palms:toRemove.filter(x=>x.source==='palms').length,
  cliffyDirect:toRemove.filter(x=>x.source==='cliffy'&&!x.packed).length,
  cliffyPacked:toRemove.filter(x=>x.packed).length,
  updatedPacks:[...repacked.keys()].map(x=>path.basename(x)),dryRun:DRY_RUN};
 const report=process.env.GITHUB_OUTPUT;
 if(report)fs.appendFileSync(report,'asset_count='+ids.length+'\n');
 console.log('DND_ASSET_DELETION_RESULT',JSON.stringify(result));
}
try{execute()}catch(e){console.error('ASSET_DELETE_FAILED',String(e.message||e));process.exitCode=1}
