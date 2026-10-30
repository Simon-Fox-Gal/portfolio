import{normalise}from'./search.mjs?v=45cdfd28ef';

export function artistPalette(element,onChoose,signal){
 if(!element)return ()=>{};
 const summary=element.querySelector('summary'),links=[...element.querySelectorAll('[data-palette-value]')],letters=element.querySelector('.artist-letters');
 let timer,dismissed=false,keyboard=false,hoverOpened=false;
 const initial=a=>a.dataset.paletteInitial||normalise(a.dataset.paletteValue).charAt(0).toUpperCase()||'#';
 function close(returnFocus=false){clearTimeout(timer);dismissed=true;hoverOpened=false;const inside=element.contains(document.activeElement);element.open=false;if(returnFocus||inside)summary.focus({preventScroll:true})}
 function open(){clearTimeout(timer);if(!dismissed){document.querySelectorAll('.artist-palette[open]').forEach(other=>{if(other!==element)other.open=false});element.open=true}}
 const initials=[...new Set(links.map(initial))].sort();
 for(const value of ['All',...initials]){const b=document.createElement('button');b.type='button';b.textContent=value;b.setAttribute('aria-pressed',String(value==='All'));b.addEventListener('click',()=>{letters.querySelectorAll('button').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));for(const a of links)a.closest('li').hidden=value!=='All'&&initial(a)!==value;element.querySelector('.artist-palette-list').scrollTop=0});letters.append(b)}
 letters.hidden=false;
 element.addEventListener('pointerenter',ev=>{if(ev.pointerType==='mouse'&&matchMedia('(hover:hover)').matches){dismissed=false;keyboard=false;hoverOpened=!element.open;open()}});
 element.addEventListener('pointerleave',ev=>{if(ev.pointerType==='mouse'&&!keyboard){timer=setTimeout(()=>close(),180)}});
 element.addEventListener('keydown',ev=>{keyboard=true;if(ev.key==='Escape'){ev.preventDefault();ev.stopPropagation();close(true)}else if(ev.target===summary&&ev.key==='ArrowDown'){ev.preventDefault();dismissed=false;open();links.find(a=>!a.closest('li').hidden)?.focus()}else if(ev.key==='Tab')dismissed=false});
 element.addEventListener('focusin',ev=>{clearTimeout(timer);if(keyboard||ev.target!==summary)open()});
 element.addEventListener('focusout',ev=>{if(!element.contains(ev.relatedTarget)){dismissed=false;element.open=false}});
 summary.addEventListener('click',ev=>{dismissed=false;if(ev.detail>0&&hoverOpened&&element.open){ev.preventDefault();hoverOpened=false}});
 element.querySelector('[data-palette-close]').addEventListener('click',()=>close(true));
 document.addEventListener('pointerdown',ev=>{if(!element.contains(ev.target)){close();dismissed=false}},{signal});signal?.addEventListener('abort',()=>clearTimeout(timer),{once:true});
 links.forEach(a=>a.addEventListener('click',ev=>{ev.preventDefault();onChoose(a.dataset.paletteValue);close(true)}));
 return names=>links.forEach(a=>{const selected=names.includes(a.dataset.paletteValue);a.classList.toggle('selected',selected);if(selected)a.setAttribute('aria-current','true');else a.removeAttribute('aria-current')});
}
