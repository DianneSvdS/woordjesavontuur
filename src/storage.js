const KEY='woordjesavontuur-lijsten-v3'
export function loadLists(fallback){try{return JSON.parse(localStorage.getItem(KEY))||fallback}catch{return fallback}}
export function saveLists(lists){localStorage.setItem(KEY,JSON.stringify(lists));localStorage.setItem(KEY+'-backup',JSON.stringify({savedAt:new Date().toISOString(),lists}))}
export function downloadBackup(lists){const b=new Blob([JSON.stringify({version:3,lists},null,2)],{type:'application/json'}),a=document.createElement('a');a.href=URL.createObjectURL(b);a.download='woordjesavontuur-backup.json';a.click();URL.revokeObjectURL(a.href)}
export async function readBackup(file){const x=JSON.parse(await file.text());return x.lists||x}