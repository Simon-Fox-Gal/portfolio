// Day is UTC, so the same published catalogue gives everyone the same daily work.
export function hash(value){let n=2166136261;for(const c of value){n^=c.charCodeAt(0);n=Math.imul(n,16777619)}return n>>>0}
export function dailyChoice(pool,date=new Date()){if(!pool.length)return null;let day=date.toISOString().slice(0,10),a=pool[hash(day)%pool.length];return{album:a,work:a.works[hash(day+':work')%a.works.length]}}
export function randomChoice(pool,previous='',random=Math.random){if(!pool.length)return null;let available=pool.flatMap(a=>a.works.map(w=>({album:a,work:w}))).filter(x=>x.album.id+':'+x.work.id!==previous);if(!available.length)return{album:pool[0],work:pool[0].works[0]};return available[Math.min(available.length-1,Math.floor(random()*available.length))]}
