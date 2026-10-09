import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist'
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url'
GlobalWorkerOptions.workerSrc = workerUrl

const clean = value => value.replace(/\s+/g, ' ').trim()
const joinByX = items => clean([...items].sort((a,b)=>a.x-b.x).map(i=>i.text).join(' '))

function makeLines(items) {
  const lines=[]
  for (const item of [...items].sort((a,b)=>b.y-a.y || a.x-b.x)) {
    const tolerance=Math.max(3,item.h*0.42)
    let line=lines.find(row=>Math.abs(row.y-item.y)<=tolerance)
    if(!line){line={y:item.y,items:[]};lines.push(line)}
    line.items.push(item)
  }
  return lines.sort((a,b)=>b.y-a.y)
}

function findColumnSplit(lines,pageWidth) {
  const candidates=[]
  for(const line of lines){
    const a=[...line.items].sort((x,y)=>x.x-y.x)
    for(let i=0;i<a.length-1;i++){
      const gap=a[i+1].x-(a[i].x+a[i].w)
      const split=(a[i].x+a[i].w+a[i+1].x)/2
      if(gap>22 && split>pageWidth*0.18 && split<pageWidth*0.68) candidates.push(split)
    }
  }
  if(!candidates.length) return pageWidth*0.34
  const bins=new Map()
  candidates.forEach(v=>{const key=Math.round(v/8)*8;bins.set(key,(bins.get(key)||0)+1)})
  return [...bins].sort((a,b)=>b[1]-a[1])[0][0]
}

export async function readWordCardsPdf(file) {
  const pdf=await getDocument({data:await file.arrayBuffer()}).promise
  const result=[]

  for(let pageNumber=1;pageNumber<=pdf.numPages;pageNumber++){
    const page=await pdf.getPage(pageNumber)
    const viewport=page.getViewport({scale:1})
    const content=await page.getTextContent()
    const items=content.items.filter(i=>i.str.trim()).map(i=>({
      text:i.str.trim(), x:i.transform[4], y:i.transform[5],
      w:i.width||0, h:Math.abs(i.transform[3])||10
    }))
    const lines=makeLines(items)
    const split=findColumnSplit(lines,viewport.width)

    // Een kaart begint alleen op een regel waarop zowel links als rechts tekst staat.
    // Hierdoor worden titels, paginanummers en tekst buiten de vakken genegeerd.
    const anchors=lines.map(line=>{
      const left=line.items.filter(i=>i.x<split)
      const right=line.items.filter(i=>i.x>=split)
      return {y:line.y,left:joinByX(left),right:joinByX(right)}
    }).filter(row=>
      row.left && row.right &&
      row.left.length<=70 &&
      !/^(woord|betekenis|thema|groep|staal|pagina)$/i.test(row.left)
    )

    for(let i=0;i<anchors.length;i++){
      const anchor=anchors[i]
      const nextY=i+1<anchors.length?anchors[i+1].y:-Infinity
      // Alleen tekst rechts, onder de startregel en boven het volgende kaartpaar,
      // hoort bij deze betekenis. Linkertekst op vervolgregels wordt niet toegevoegd.
      const continuation=lines.filter(line=>
        line.y<anchor.y-2 && line.y>nextY+2
      ).flatMap(line=>line.items.filter(item=>item.x>=split))
      const meaning=clean([anchor.right,joinByX(continuation)].filter(Boolean).join(' '))
      if(meaning) result.push({word:anchor.left,meaning,page:pageNumber})
    }
  }

  const seen=new Set()
  return result.filter(pair=>{
    const key=`${pair.word}\u0000${pair.meaning}`
    if(seen.has(key))return false
    seen.add(key);return true
  })
}
