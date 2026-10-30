// A shuffled album deck, retained through navigation and refresh in this tab.
export function createSessionDeck(albumIds, saved=null, random=Math.random){
 const ids=[...new Set(albumIds)],allowed=new Set(ids);
 const played=new Set((saved?.played||[]).filter(id=>allowed.has(id)));
 let remaining=[...new Set(saved?.remaining||[])].filter(id=>allowed.has(id)&&!played.has(id));
 const known=new Set([...remaining,...played]);
 const fresh=ids.filter(id=>!known.has(id));
 for(let i=fresh.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[fresh[i],fresh[j]]=[fresh[j],fresh[i]]}
 remaining.push(...fresh);
 return {
  mark(id){if(allowed.has(id)){played.add(id);remaining=remaining.filter(x=>x!==id)}},
  take(){const id=remaining.shift();if(id)played.add(id);return id||null},
  snapshot(){return {remaining:[...remaining],played:[...played]}},
  get remaining(){return remaining.length}
 };
}
