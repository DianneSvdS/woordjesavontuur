import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist'
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url'
GlobalWorkerOptions.workerSrc = workerUrl
const join = a => [...a].sort((x,y)=>x.x-y.x).map(x=>x.text).join(' ').replace(/\s+/g,' ').trim()
export async function readWordCardsPdf(file) {
  const pdf=await getDocument({data:await file.arrayBuffer()}).promise, result=[]
  for(let p=1;p<=pdf.numPages;p++){
    const page=await pdf.getPage(p), view=page.getViewport({scale:1}), tc=await page.getTextContent()
    const items=tc.items.filter(i=>i.str.trim()).map(i=>({text:i.str.trim(),x:i.transform[4],y:i.transform[5],w:i.width||0,h:Math.abs(i.transform[3])||10}))
    const lines=[]
    for(const item of [...items].sort((a,b)=>b.y-a.y||a.x-b.x)){
      let line=lines.find(l=>Math.abs(l.y-item.y)<=Math.max(3,item.h*.42))
      if(!line){line={y:item.y,items:[]};lines.push(line)}
      line.items.push(item)
    }
    const gaps=[]
    for(const l of lines){const a=[...l.items].sort((x,y)=>x.x-y.x);for(let k=0;k<a.length-1;k++){const gap=a[k+1].x-(a[k].x+a[k].w),split=(a[k].x+a[k].w+a[k+1].x)/2;if(gap>18&&split>view.width*.15&&split<view.width*.72)gaps.push(split)}}
    let split=view.width*.34
    if(gaps.length){const bins=new Map();gaps.forEach(v=>{const k=Math.round(v/10)*10;bins.set(k,(bins.get(k)||0)+1)});split=[...bins].sort((a,b)=>b[1]-a[1])[0][0]}
    const words=lines.map(l=>({y:l.y,text:join(l.items.filter(i=>i.x<split))})).filter(r=>r.text&&!/^(woord|betekenis|thema|groep|staal)$/i.test(r.text)).sort((a,b)=>b.y-a.y)
    for(let n=0;n<words.length;n++){const top=words[n].y+10,bottom=n+1<words.length?words[n+1].y+5:-Infinity;const meaning=join(items.filter(i=>i.x>=split&&i.y<=top&&i.y>bottom));if(words[n].text.length<=70&&meaning)result.push({word:words[n].text,meaning,page:p})}
  }
  const seen=new Set();return result.filter(x=>{const k=x.word+'\0'+x.meaning;if(seen.has(k))return false;seen.add(k);return true})
}