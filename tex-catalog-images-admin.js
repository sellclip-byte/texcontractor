(function(){
const root=document.getElementById('catalog-image-settings');if(!root)return;
const S='https://rryehtaskbjnfbodymjj.supabase.co',KEY='sb_publishable_10LgFmHximAplWyQXKNopw_2peqDb7r';
const $=id=>document.getElementById(id),service=$('catalog-image-service'),file=$('catalog-image-file'),url=$('catalog-image-url'),link=$('catalog-image-link'),preview=$('catalog-image-preview'),status=$('catalog-image-status');
const normalize=s=>s.trim().replace(/\s+/g,' ').toLowerCase();
const valid=s=>{try{let u=new URL(s);return ['https:','http:'].includes(u.protocol)?u.href:''}catch{return ''}};
let records=new Map(),busy=false;
async function auth(){const user=await TexAuth.getUser(),token=await TexAuth.getAccessToken();if(!user||!token)throw Error('Sign in as administrator');return {user,token,headers:{apikey:KEY,Authorization:'Bearer '+token,'Content-Type':'application/json'}}}
function show(){const key=normalize(service.value),saved=records.get(key);url.value=saved?.image_url||'';link.value=saved?.click_url||'';preview.src=url.value;preview.style.display=url.value?'block':'none';status.textContent=saved?'Existing image loaded for this catalog.':'No custom image for this catalog yet.'}
async function load(){try{
 const r=await fetch(S+'/rest/v1/texcontractor_catalog_images?select=service_key,service_name,image_url,click_url',{headers:{apikey:KEY},cache:'no-store'});
 if(!r.ok)throw Error('Could not load catalog images');
 records=new Map((await r.json()).map(x=>[x.service_key,x]));
 const names=new Set([...records.values()].map(x=>x.service_name));
 const services=await fetch(S+'/rest/v1/texcontractor_public_services?select=service&limit=1000',{headers:{apikey:KEY},cache:'no-store'});
 if(services.ok)(await services.json()).forEach(x=>{if(x.service)names.add(x.service)});
 names.add('Babysitting & Childcare Services');
 const options=[...names].filter(Boolean).sort((a,b)=>a.localeCompare(b)).map(n=>{const o=document.createElement('option');o.value=n;o.textContent=n;return o});
 service.replaceChildren(Object.assign(document.createElement('option'),{value:'',textContent:'Select a contractor catalog'}),...options);
 if(!options.length)status.textContent='No catalogs loaded. Please refresh the Admin page.';
 if(service.value)show();
}catch(e){status.textContent=e.message}}
service.addEventListener('change',show);
service.addEventListener('blur',show);
file.addEventListener('change',async()=>{const f=file.files?.[0];if(!f)return;const key=normalize(service.value);if(!key){status.textContent='Choose the catalog before uploading.';file.value='';return}if(!['image/jpeg','image/png','image/webp','image/avif','image/gif'].includes(f.type)||f.size>10*1024*1024){status.textContent='Use a JPG, PNG, WebP, GIF or AVIF image under 10 MB.';return}file.disabled=true;status.textContent='Uploading catalog image…';try{const {user,token}=await auth();const ext=f.name.split('.').pop().replace(/[^a-z0-9]/gi,'').slice(0,6)||'jpg';const path='catalog-images/'+user.id+'/'+Date.now()+'-'+Math.random().toString(36).slice(2,8)+'.'+ext;const r=await fetch(S+'/storage/v1/object/texcontractor-side-ads/'+path,{method:'POST',headers:{apikey:KEY,Authorization:'Bearer '+token,'Content-Type':f.type},body:f});if(!r.ok)throw Error((await r.text()).slice(0,200));url.value=S+'/storage/v1/object/public/texcontractor-side-ads/'+path;preview.src=url.value;preview.style.display='block';status.textContent='Uploaded. Click Save this catalog image.'}catch(e){status.textContent='Upload failed: '+e.message}finally{file.disabled=false;file.value=''}});
$('catalog-image-save').addEventListener('click',async()=>{if(busy)return;const key=normalize(service.value),image=valid(url.value);if(!key||!image){status.textContent='Choose a catalog and upload an image first.';return}busy=true;status.textContent='Saving…';try{const {headers}=await auth();const data={service_key:key,service_name:service.value.trim(),image_url:image,click_url:valid(link.value),updated_at:new Date().toISOString()};const r=await fetch(S+'/rest/v1/texcontractor_catalog_images?on_conflict=service_key',{method:'POST',headers:{...headers,Prefer:'resolution=merge-duplicates,return=representation'},body:JSON.stringify(data)});if(!r.ok)throw Error((await r.text()).slice(0,200));const saved=(await r.json())[0];if(!saved||saved.image_url!==image)throw Error('Database did not confirm image');records.set(key,saved);status.textContent='Saved. This image will appear only in the selected catalog.'}catch(e){status.textContent='Could not save: '+e.message}finally{busy=false}});
$('catalog-image-remove').addEventListener('click',async()=>{const key=normalize(service.value);if(!key)return;try{const {headers}=await auth();const r=await fetch(S+'/rest/v1/texcontractor_catalog_images?service_key=eq.'+encodeURIComponent(key),{method:'DELETE',headers});if(!r.ok)throw Error((await r.text()).slice(0,200));records.delete(key);show();status.textContent='Custom catalog image removed.'}catch(e){status.textContent=e.message}});
$('catalog-image-copy').addEventListener('click',async()=>{if(!url.value)return;try{await navigator.clipboard.writeText(url.value);status.textContent='Direct image URL copied.'}catch(e){url.select();status.textContent='Select and copy the URL.'}});
load();
})();