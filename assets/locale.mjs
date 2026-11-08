import{labels,terms}from'./locale-data.mjs?v=d4e5d29a41';

export const german=document.documentElement.lang==='de';
export const base=document.body.dataset.base||'';
export const pagePath=route=>base+(german?'/de':'')+route;
export const assetPath=route=>base+route;
export const t=text=>german?(labels[text]??text):text;
export const catalogueTerm=text=>german?(terms[text]??text):text;
export const catalogueCredit=album=>german?album.creditDe:album.credit;
export const catalogueTerms=album=>german?[...album.instruments,...album.repertoire].map(catalogueTerm):[];
export const recordingCount=count=>german?(count===1?'1 Aufnahme':count+' Aufnahmen'):count+' recording'+(count===1?'':'s');

export function switchLanguage(link){
 const prefix=base+(german?'/de':'');
 const targetPrefix=base+(link.hreflang==='de'?'/de':'');
 const current=new URL(location.href);
 const alternate=path=>targetPrefix+path.slice(prefix.length);
 current.pathname=alternate(current.pathname);
 const from=current.searchParams.get('from');
 if(from?.startsWith(prefix+'/recordings/'))current.searchParams.set('from',alternate(from));
 return current.pathname+current.search+current.hash;
}
