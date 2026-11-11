import{base,pagePath,assetPath,t,german}from'./locale.mjs?v=838d8ba17f';
import {createSessionDeck} from './session-discovery.mjs';
let mounted=false,enabled=false,mountPage,controller,current=null,queue=[],items=[],loading,request=0,albumDeck;
const sessionKey='listening-album-deck-v1';
function saveDeck(){try{sessionStorage.setItem(sessionKey,JSON.stringify(albumDeck.snapshot()))}catch{}}
let panel,audio,title,record,art,status,opener,standalone=false;
export function initPlayer(mount){
 if(mounted)return;mounted=true;mountPage=mount;
 panel=document.createElement('section');panel.id='sample-player';panel.hidden=true;panel.setAttribute('aria-label',t('Recording sample player'));
 panel.innerHTML=`<img class="player-cover" alt="" width="64" height="64"><div class="player-description"><p class="player-kicker">${t('MP3 sample · one minute · not full recording quality')}</p><p id="sample-title"></p><a id="sample-recording"></a></div><div class="player-controls"><audio controls preload="none" aria-label="${t('Sample playback')}"></audio><div class="player-actions"><button type="button" data-player-next>${t('Next sample →')}</button><button type="button" data-player-random>${t('Choose something to listen to')}</button><button type="button" data-player-close aria-label="${t('Close sample player')}">${t('Close ×')}</button></div><p class="player-status" role="status"></p></div>`;
 document.body.append(panel);audio=panel.querySelector('audio');title=panel.querySelector('#sample-title');record=panel.querySelector('#sample-recording');art=panel.querySelector('img');status=panel.querySelector('[role=status]');
 new ResizeObserver(()=>document.documentElement.style.setProperty('--player-height',panel.hidden?'0px':panel.getBoundingClientRect().height+'px')).observe(panel);
 panel.querySelector('[data-player-next]').addEventListener('click',next);
 panel.querySelector('[data-player-random]').addEventListener('click',chooseRandom);
 panel.querySelector('[data-player-close]').addEventListener('click',()=>{audio.pause();audio.removeAttribute('src');audio.load();panel.hidden=true;document.body.classList.remove('has-player');document.documentElement.style.setProperty('--player-height','0px');if(opener?.isConnected)opener.focus({preventScroll:true})});
 audio.addEventListener('ended',()=>{if(!standalone)next(true)});audio.addEventListener('error',()=>{status.textContent=t('This sample could not be loaded. Try Play again, or choose another sample.')});
 audio.addEventListener('playing',()=>{status.textContent=''});
 document.addEventListener('click',async ev=>{
  const trigger=ev.target.closest('[data-play-sample],[data-random-sample]');if(trigger){ev.preventDefault();opener=trigger;try{await load();if(trigger.hasAttribute('data-random-sample'))chooseRandom();else select(trigger.dataset.playSample,false,trigger.hasAttribute('data-play-here'))}catch{trigger.textContent=t('Samples unavailable — try again')}return}
  const a=ev.target.closest('a[href]');if(!enabled||ev.defaultPrevented||!a||ev.button!==0||ev.metaKey||ev.ctrlKey||ev.shiftKey||ev.altKey||a.target||a.hreflang||a.hasAttribute('download'))return;
  const url=new URL(a.href);if(url.origin!==location.origin||!url.pathname.startsWith(base+'/')||!url.pathname.endsWith('/'))return;
  if(url.pathname===location.pathname&&url.search===location.search&&url.hash)return;
  ev.preventDefault();navigate(url.href);
 });
 document.addEventListener('submit',ev=>{const form=ev.target;if(!enabled||ev.defaultPrevented||form.method.toLowerCase()!=='get')return;const url=new URL(form.action);if(url.origin!==location.origin)return;ev.preventDefault();url.search=new URLSearchParams(new FormData(form));navigate(url.href)});
 addEventListener('popstate',ev=>{if(!enabled)return;if(document.querySelector('#catalogue')&&ev.state?.catalogue)return;if(document.querySelector('#record-room')&&location.pathname===pagePath('/recordings/archive/'))return;ev.stopImmediatePropagation();navigate(location.href,false)},true);
 load().catch(()=>{});
}
async function load(){if(items.length)return;loading??=fetch(assetPath('/assets/samples-index.json?v=838d8ba17f')).then(r=>{if(!r.ok)throw Error();return r.json()}).then(data=>{items=data;queue=items.map(x=>x.id);let saved;try{saved=JSON.parse(sessionStorage.getItem(sessionKey))}catch{}albumDeck=createSessionDeck(items.map(x=>x.albumId),saved);saveDeck()}).catch(e=>{loading=null;throw e});await loading}
function markCurrent(){document.querySelectorAll('[data-play-sample]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.playSample===current?.id)))}
async function select(id,automatic=false,playHere=false){
 const item=items.find(x=>x.id===id);if(!item)return;
 albumDeck.mark(item.albumId);saveDeck();
 const albumChanged=current?.albumId!==item.albumId;
 standalone=playHere;enabled=true;current=item;panel.hidden=false;document.body.classList.add('has-player');title.textContent=item.title;record.textContent=item.albumTitle+' →';record.href=pagePath('/recordings/'+item.slug+'/#'+item.workId);art.src=assetPath('/assets/covers/'+item.cover+'-240.webp');audio.src=item.src;status.textContent='';markCurrent();
 // Start within the listening gesture; page loading must never replace the audio element.
 const playing=audio.play().catch(()=>{if(current?.id===id)status.textContent=t('Press Play to listen to this sample.')});
 if(!playHere&&(!automatic||albumChanged)){
  const target=new URL(record.href);
  if(location.pathname!==target.pathname)await navigate(target.href);
  else{controller?.abort();request++;target.search=location.search;history.replaceState(history.state,'',target.href);document.getElementById(item.workId)?.scrollIntoView()}
 }
 await playing;
}
function next(automatic=false){if(!current||!queue.length)return;select(queue[(queue.indexOf(current.id)+1)%queue.length],automatic===true)}
async function chooseRandom(){await load();const albumId=albumDeck.take();saveDeck();if(!albumId){status.textContent=t('You’ve explored every album with samples in this session.');return}const choices=items.filter(x=>x.albumId===albumId);select(choices[Math.floor(Math.random()*choices.length)].id)}
export async function navigate(target,push=true){
 if(!enabled){location.href=target;return}
 const url=new URL(target,location.href);if(url.pathname.startsWith(base+'/de/')!==german){location.href=url.href;return}const ticket=++request;controller?.abort();controller=new AbortController();
 try{
  const response=await fetch(url.href,{signal:controller.signal});if(!response.ok)throw Error();const doc=new DOMParser().parseFromString(await response.text(),'text/html');const page=doc.querySelector('#site-page');if(!page||ticket!==request)throw Error();
  page.querySelectorAll('noscript').forEach(el=>el.remove());
  if(push)history.pushState({sitePage:true},'',url.href);
  document.querySelector('#site-page').replaceWith(document.importNode(page,true));document.title=doc.title;
  for(const selector of ['link[rel=canonical]','link[rel=alternate][hreflang=en]','link[rel=alternate][hreflang=de]','meta[name=description]','meta[property="og:title"]','meta[property="og:description"]']){const old=document.querySelector(selector),fresh=doc.querySelector(selector);if(old&&fresh)old.replaceWith(document.importNode(fresh,true))}
  window.scrollTo({top:0,behavior:'instant'});mountPage();markCurrent();const heading=document.querySelector('main h1');heading?.setAttribute('tabindex','-1');heading?.focus({preventScroll:true});if(url.hash)document.getElementById(decodeURIComponent(url.hash.slice(1)))?.scrollIntoView();
 }catch(error){if(error.name==='AbortError'||ticket!==request)return;status.textContent=t('That page could not be opened. Your sample is still playing; please try the link again.')}
}
