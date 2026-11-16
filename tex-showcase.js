(function(){
 'use strict';
 const BASE='https://rryehtaskbjnfbodymjj.supabase.co',KEY='sb_publishable_10LgFmHximAplWyQXKNopw_2peqDb7r';
 const YT={"one-text-pro-near-you-en":"_dGEDL1cgAE","the-pros-are-coming-en":"rp3lzb8H0f0","day-laborers-red-light-en":"Uw59NiTlAWY","plomero-hablo-espanol-es":"WNXgYGMa4o0","roof-leak-story-en":"2ENecJyDMDI","get-a-pro-near-you-en":"m-ieMNcHxyQ","four-languages-couples-en":"Ay4BBnNCtbw","stop-waiting-on-hold-en":"l9sRC3wQxSw","interview-founders-en":"jngMN0rmm5Q","entrevista-fundadores-es":"g5brwRXd0RM","kitchen-drain-plumber-en":"p9IT88OXCGk","math-tutor-en":"8RKdl0xzuPY","techo-goteando-es":"JMiAK1C5fIs","pest-control-en":"PGn_jab9cE4","limpieza-casas-es":"hnfaFiKRTa4","movers-couple-en":"X5jFQSrfgKc","home-nurse-en":"GduZj2tBTSY","computer-repair-tech-en":"CJ8segstGoM","detallado-autos-es":"TUEzoabpW7s","tree-crew-en":"3SAm7j0izLw","barking-dog-en":"JKDJEb-bHP0","local-jobs-en":"YHpW3PAk7dg","jefe-es":"H995qEBWfyI","owner-technician-en":"oS5nze5gqtc","owner-customer-es":"q7Xo3q7gajw","car-breakdown-en":"mez2-7sbj94","car-breakdown-es":"GKECdSMlIuo","tech-leads-en":"POzJhjOLR70","tech-leads-es":"Fa9x9RKyfRw","babysitter-en":"CAQkn71pUak","babysitter-es":"Xeldm2To-Tg","ac-en":"zntDZ0yUaEE","ac-es":"st7z2zzivmo","home-en":"LHRmoIIMDtQ","home-es":"rixMgR2ngbo","tech-en":"WOgBsr3sc-g","tech-es":"7uGlKjTOHvY","dishwasher-en":"Q_ST8J1oKJk","dishwasher-es":"HKDcc4cDd54","top-en":"-qVIoA6ZylI","top-es":"1KLsypPui5c"};
 const safeURL=value=>{try{const u=new URL(value);return u.protocol==='https:'?u.href:'';}catch{return '';}};
 const visible=row=>row.published===true&&(row.kind!=='testimonial'||(row.verified===true&&row.consent===true));
 const el=(tag,text,cls)=>{const node=document.createElement(tag);if(text)node.textContent=text;if(cls)node.className=cls;return node;};
 async function load(){
  const status=document.getElementById('load-status');
  try{
   let rows=[],offset=0;
   while(true){const r=await fetch(BASE+'/rest/v1/texcontractor_showcase?select=*&published=eq.true&order=sort_order.asc,created_at.asc,id.asc&limit=500&offset='+offset,{headers:{apikey:KEY,Authorization:'Bearer '+KEY}});if(!r.ok)throw Error('load');const page=await r.json();if(!Array.isArray(page))throw Error('load');rows.push(...page);if(page.length<500)break;offset+=page.length;}
   let count=0,rendered=0;
   const ratings={client:[],professional:[]};
   for(const row of rows.filter(visible)){
    const group={story:'stories',video:'videos',image:'images',testimonial:'testimonials'}[row.kind];if(!group)continue;
    const url=safeURL(row.media_url);if(['video','image'].includes(row.kind)&&!url)continue;
    const card=el('article',null,row.kind==='story'?'story':'card');
    if(row.kind==='image'){const img=el('img');img.src=url;img.alt=row.title;img.loading='lazy';img.decoding='async';card.append(img);}
    if(row.kind==='video'){const ym=/^https:\/\/texcontractor\.com\/videos\/([a-z0-9-]+)\.mp4/.exec(url),yid=ym&&YT[ym[1]];if(yid){const f=el('iframe');f.src='https://www.youtube-nocookie.com/embed/'+yid+'?rel=0&playsinline=1';f.title=row.title;f.loading='lazy';f.allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';f.allowFullscreen=true;f.style.cssText='width:100%;aspect-ratio:9/16;border:0;display:block;background:#111';card.append(f);}else{const video=el('video');video.controls=true;video.preload='metadata';video.playsInline=true;video.src=url;video.setAttribute('aria-label',row.title);video.append(el('p','Your browser cannot play this video.'));card.append(video);}}
    const copy=el('div',null,row.kind==='story'?'story-copy':'card-copy');copy.append(el('h3',row.title));
    if(row.kind==='testimonial'){
     const role=row.feedback_role,bank=window.TexFeedback?.questions[role];
     if(bank)copy.append(el('p',role==='client'?'Client experience':'Professional experience','feedback-role'));
     if(Number.isInteger(row.rating)&&row.rating>=1&&row.rating<=5){
      const stars=el('p','★'.repeat(row.rating)+'☆'.repeat(5-row.rating),'feedback-stars');stars.setAttribute('aria-label','Website rating: '+row.rating+' out of 5 stars');copy.append(stars);
      if(bank)ratings[role].push(row.rating);
     }
     if(row.body)copy.append(el('blockquote',row.body));
     const answers=window.TexFeedback?.validAnswers(role,row.feedback_answers)||[];
     if(answers.length){const list=el('dl',null,'feedback-answers');for(const answer of answers)list.append(el('dt',bank[answer.key-1][0]),el('dd',answer.answer));copy.append(list);}
     copy.append(el('p',row.attribution,'attribution'));count++;
    }else if(row.body)copy.append(el('p',row.body));
    card.append(copy);document.getElementById(group).append(card);document.getElementById(group+'-section').hidden=false;rendered++;
   }
   if(count)document.getElementById('review-count').textContent=count.toLocaleString()+' published community '+(count===1?'experience':'experiences');
   for(const role of ['client','professional'])if(ratings[role].length){const values=ratings[role],average=(values.reduce((a,b)=>a+b,0)/values.length).toFixed(1);const summary=el('p',(role==='client'?'Client':'Professional')+' website ratings: '+average+' / 5 from '+values.length+' published '+(values.length===1?'rating':'ratings')+'.','counter');document.getElementById('testimonials').before(summary);}
   status.textContent=rendered?'':'New videos and community updates will appear here as they are published.';
  }catch{status.textContent='Our latest updates could not be loaded. Please try again shortly.';status.classList.add('error');}
 }
 document.getElementById('share-page').addEventListener('click',async()=>{const status=document.getElementById('share-status'),url='https://texcontractor.com/';try{if(navigator.share)await navigator.share({title:'TexContractor',text:'Add your service for free on TexContractor.',url});else{await navigator.clipboard.writeText(url);status.textContent='Website link copied.';}}catch(e){if(e.name!=='AbortError')status.textContent='Share this link: '+url;}});
 load();
})();
