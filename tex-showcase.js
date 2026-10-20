(function(){
 'use strict';
 const BASE='https://rryehtaskbjnfbodymjj.supabase.co',KEY='sb_publishable_10LgFmHximAplWyQXKNopw_2peqDb7r';
 const safeURL=value=>{try{const u=new URL(value);return u.protocol==='https:'?u.href:'';}catch{return '';}};
 const visible=row=>row.published===true&&(row.kind!=='testimonial'||(row.verified===true&&row.consent===true));
 const el=(tag,text,cls)=>{const node=document.createElement(tag);if(text)node.textContent=text;if(cls)node.className=cls;return node;};
 async function load(){
  const status=document.getElementById('load-status');
  try{
   let rows=[],offset=0;
   while(true){const r=await fetch(BASE+'/rest/v1/texcontractor_showcase?select=*&published=eq.true&order=sort_order.asc,created_at.asc,id.asc&limit=500&offset='+offset,{headers:{apikey:KEY,Authorization:'Bearer '+KEY}});if(!r.ok)throw Error('load');const page=await r.json();if(!Array.isArray(page))throw Error('load');rows.push(...page);if(page.length<500)break;offset+=page.length;}
   let count=0,rendered=0;
   for(const row of rows.filter(visible)){
    const group={story:'stories',video:'videos',image:'images',testimonial:'testimonials'}[row.kind];if(!group)continue;
    const url=safeURL(row.media_url);if(['video','image'].includes(row.kind)&&!url)continue;
    const card=el('article',null,row.kind==='story'?'story':'card');
    if(row.kind==='image'){const img=el('img');img.src=url;img.alt=row.title;img.loading='lazy';img.decoding='async';card.append(img);}
    if(row.kind==='video'){const video=el('video');video.controls=true;video.preload='metadata';video.playsInline=true;video.src=url;video.setAttribute('aria-label',row.title);video.append(el('p','Your browser cannot play this video.'));card.append(video);}
    const copy=el('div',null,row.kind==='story'?'story-copy':'card-copy');copy.append(el('h3',row.title));
    if(row.kind==='testimonial'){copy.append(el('blockquote',row.body));copy.append(el('p',row.attribution,'attribution'));count++;}else if(row.body)copy.append(el('p',row.body));
    card.append(copy);document.getElementById(group).append(card);document.getElementById(group+'-section').hidden=false;rendered++;
   }
   if(count)document.getElementById('review-count').textContent=count.toLocaleString()+' published community '+(count===1?'experience':'experiences');
   status.textContent=rendered?'':'New videos and community updates will appear here as they are published.';
  }catch{status.textContent='Our latest updates could not be loaded. Please try again shortly.';status.classList.add('error');}
 }
 document.getElementById('share-page').addEventListener('click',async()=>{const status=document.getElementById('share-status'),url='https://texcontractor.com/';try{if(navigator.share)await navigator.share({title:'TexContractor',text:'Add your service for free on TexContractor.',url});else{await navigator.clipboard.writeText(url);status.textContent='Website link copied.';}}catch(e){if(e.name!=='AbortError')status.textContent='Share this link: '+url;}});
 load();
})();
