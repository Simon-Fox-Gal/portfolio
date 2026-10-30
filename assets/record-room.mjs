import{prepare,matches as albumMatches}from'./search.mjs?v=e593d57080';
import{artistPalette}from'./artist-palette.mjs?v=e593d57080';

export async function startRecordRoom(signal){
 const room=document.querySelector('#record-room'),base=document.body.dataset.base||'';
 const response=await fetch(base+'/assets/catalogue-index.json?v=e593d57080');if(!response.ok)return;
 const data=(await response.json()).map(prepare);if(signal?.aborted)return;const byId=new Map(data.map(a=>[a.id,a]));
 const sleeves=[...room.querySelectorAll('[data-record]')],query=room.querySelector('#room-query'),status=room.querySelector('#room-status');
 const next=room.querySelector('#room-next'),clear=room.querySelector('#room-clear');
 let matches=sleeves,matchPosition=-1,filters={artist:[],composer:[],label:[]};
 const syncPalettes=Object.fromEntries(Object.keys(filters).map(key=>[key,artistPalette(room.querySelector(`[data-palette="${key}"]`),name=>{filters[key]=[name];query.value='';update()},signal)]));
 function address(){return location.pathname+location.search}
 function caption(el){const a=byId.get(el.dataset.record);if(!a)return;
  room.querySelector('#room-caption').textContent=a.title+' · '+a.year;
  room.querySelector('#room-credit').textContent=a.artists.slice(0,3).map(p=>p.name).join(' / ')+' · '+a.credit+(a.creditIncomplete?' (partial credit)':'');
 }
 function render(){const term=query.value.trim(),filtered=!!term||Object.values(filters).some(v=>v.length);matches=[];matchPosition=-1;
  for(const el of sleeves){const album=byId.get(el.dataset.record),hit=albumMatches(album,{q:term,filters});el.classList.toggle('dimmed',!hit);el.classList.toggle('illuminated',filtered&&hit);if(hit)matches.push(el);
   const url=new URL(el.href);url.searchParams.set('from',address());el.href=url.pathname+url.search;
  }
  status.textContent=filtered?`${matches.length} of ${sleeves.length} recordings selected`:`All ${sleeves.length} recordings`;
  if(filtered&&!matches.length)status.textContent='No matches. Choose another name or clear the selection.';
  next.hidden=!filtered||!matches.length;clear.hidden=!filtered;
  room.querySelector('#room-artist-label').textContent=filtered?[...Object.values(filters).flat(),`${matches.length} recordings`].join(' · '):'';
  room.querySelector('#room-caption').textContent='Select a cover for recording details.';room.querySelector('#room-credit').textContent='';
  for(const [key,sync]of Object.entries(syncPalettes))sync(filters[key]);
  const catalogueView=document.querySelector('.collection-views a');if(catalogueView){const p=new URLSearchParams;for(const [key,names]of Object.entries(filters))for(const name of names)p.append(key,name);if(term)p.set('q',term);catalogueView.href=base+'/recordings/'+(p.size?'?'+p:'')}
  room.querySelectorAll('.record-decade').forEach(section=>{section.querySelector('.decade-matches').textContent=filtered?' / '+section.querySelectorAll('.illuminated').length+' selected':''});
  room.querySelectorAll('[data-distance]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.distance===room.dataset.distance));
 }
 function update(){const p=new URLSearchParams;for(const [key,names]of Object.entries(filters))for(const name of names)p.append(key,name);if(query.value.trim())p.set('q',query.value.trim());if(room.dataset.distance==='near')p.set('distance','near');history.replaceState(null,'',location.pathname+(p.size?'?'+p:''));render()}
 function restore(){const p=new URL(location.href).searchParams;for(const key of Object.keys(filters))filters[key]=p.getAll(key);query.value=p.get('q')||'';room.dataset.distance=p.get('distance')==='near'?'near':'far';render()}
 room.querySelector('.room-tools').hidden=false;restore();
 const toggle=document.createElement('button');toggle.className='room-tools-toggle';toggle.textContent='Search / cover size +';toggle.setAttribute('aria-expanded','false');toggle.setAttribute('aria-controls','room-tools');room.querySelector('.room-tools').id='room-tools';room.querySelector('.room-controls').insertBefore(toggle,room.querySelector('.room-tools'));
 toggle.addEventListener('click',()=>{const open=toggle.getAttribute('aria-expanded')!=='true';toggle.setAttribute('aria-expanded',String(open));room.querySelector('.room-tools').classList.toggle('expanded',open);toggle.textContent=open?'Close controls −':'Search / cover size +'});
 if(query.value){toggle.setAttribute('aria-expanded','true');room.querySelector('.room-tools').classList.add('expanded');toggle.textContent='Close controls −'}
 room.querySelector('#room-search').addEventListener('submit',ev=>{ev.preventDefault();update()});
 query.addEventListener('input',update);
 clear.addEventListener('click',()=>{query.value='';for(const key of Object.keys(filters))filters[key]=[];update();room.querySelector('.artist-palette summary').focus()});
 next.addEventListener('click',()=>{matchPosition=(matchPosition+1)%matches.length;const el=matches[matchPosition];el.focus({preventScroll:true});el.scrollIntoView({block:'center',behavior:'instant'});caption(el)});
 room.querySelectorAll('button[data-distance]').forEach(b=>b.addEventListener('click',()=>{room.dataset.distance=b.dataset.distance;update()}));
 for(const el of sleeves){el.addEventListener('pointerenter',()=>caption(el));el.addEventListener('focus',()=>caption(el));el.addEventListener('click',()=>{try{sessionStorage.setItem('room-position',JSON.stringify({url:address(),scroll:scrollY,id:el.dataset.record}))}catch{}})}
 addEventListener('popstate',restore,{signal});
 try{const saved=JSON.parse(sessionStorage.getItem('room-position')||'null');if(saved?.url===address()&&!location.hash)requestAnimationFrame(()=>{if(signal?.aborted)return;const el=sleeves.find(x=>x.dataset.record===saved.id);window.scrollTo({top:saved.scroll,behavior:'instant'});el?.focus({preventScroll:true});if(el)caption(el)})}catch{}
}
