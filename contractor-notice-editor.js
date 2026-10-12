(function(){
const DEFAULT='No calls or long forms. Tap “Text this contractor” and send the details from your phone.';
const BASE='https://rryehtaskbjnfbodymjj.supabase.co/rest/v1/texcontractor_site_settings';
const KEY='sb_publishable_10LgFmHximAplWyQXKNopw_2peqDb7r';
const field=document.getElementById('contractor-notice-message'),preview=document.getElementById('contractor-notice-preview'),status=document.getElementById('contractor-notice-status'),form=document.getElementById('contractor-notice-form');
if(!field||!form)return;
field.value=DEFAULT;preview.textContent=DEFAULT;
const inputs={text:document.getElementById('contractor-notice-text-color'),background:document.getElementById('contractor-notice-background-color'),border:document.getElementById('contractor-notice-border-color'),font:document.getElementById('contractor-notice-font'),flash:document.getElementById('contractor-notice-flash'),image:document.getElementById('contractor-notice-image'),link:document.getElementById('contractor-notice-image-link')};
const box=document.getElementById('contractor-notice-preview-box'),img=document.getElementById('contractor-notice-preview-image');
const validImage=s=>{try{const u=new URL(s);return ['https:','http:'].includes(u.protocol)?u.href:''}catch(e){return ''}};
const redraw=()=>{preview.textContent=field.value;box.style.backgroundColor=inputs.background.value;box.style.borderColor=inputs.border.value;preview.style.color=inputs.text.value;preview.style.fontWeight=inputs.font.value==='bold'?'700':'400';preview.style.fontStyle=inputs.font.value==='italic'?'italic':'normal';preview.style.textTransform=inputs.font.value==='uppercase'?'uppercase':'none';const src=validImage(inputs.image.value);img.style.display=src?'block':'none';if(src)img.src=src;box.style.animation=inputs.flash.value==='none'?'none':'noticePreviewPulse '+(inputs.flash.value==='fast'?'0.6s':'2.5s')+' ease-in-out infinite';};
const style=document.createElement('style');style.textContent='@keyframes noticePreviewPulse{50%{opacity:.45}}@media(prefers-reduced-motion:reduce){#contractor-notice-preview-box{animation:none!important}}';document.head.appendChild(style);
[field,...Object.values(inputs)].forEach(el=>el.addEventListener('input',redraw));redraw();
document.getElementById('restore-contractor-notice').addEventListener('click',()=>{field.value=DEFAULT;preview.textContent=DEFAULT;status.textContent='Default loaded. Click Save notice to publish.'});
const auth=async()=>{const user=await TexAuth.getUser();if(!user)throw Error('Please sign in first.');const token=await TexAuth.getAccessToken();if(!token)throw Error('Session expired.');const headers={apikey:KEY,Authorization:'Bearer '+token,'Content-Type':'application/json'};const a=await fetch('https://rryehtaskbjnfbodymjj.supabase.co/rest/v1/texcontractor_admins?select=user_id&user_id=eq.'+encodeURIComponent(user.id)+'&limit=1',{headers});if(!a.ok||(await a.json()).length===0)throw Error('Administrator access required.');return {headers,user}};
let edited=false;[field,...Object.values(inputs)].forEach(el=>el.addEventListener('input',()=>{edited=true}));
const uploadInput=document.getElementById('contractor-notice-image-file');
uploadInput.addEventListener('change',async()=>{const file=uploadInput.files?.[0];if(!file)return;const allowed=['image/jpeg','image/png','image/webp','image/gif','image/avif'];if(!allowed.includes(file.type)){status.textContent='Choose JPG, PNG, WebP, GIF or AVIF.';uploadInput.value='';return;}if(file.size>10*1024*1024){status.textContent='Image must be 10 MB or smaller.';uploadInput.value='';return;}uploadInput.disabled=true;status.textContent='Uploading image…';try{const {headers,user}=await auth();const ext=({ 'image/jpeg':'jpg','image/png':'png','image/webp':'webp','image/gif':'gif','image/avif':'avif'})[file.type];const path='contractor-notice/'+user.id+'/'+Date.now()+'-'+Math.random().toString(36).slice(2,9)+'.'+ext;const endpoint='https://rryehtaskbjnfbodymjj.supabase.co/storage/v1/object/texcontractor-side-ads/'+path;const response=await fetch(endpoint,{method:'POST',headers:{apikey:KEY,Authorization:headers.Authorization,'Content-Type':file.type,'cache-control':'3600'},body:file});if(!response.ok)throw Error((await response.text()).slice(0,250));const uploadedUrl='https://rryehtaskbjnfbodymjj.supabase.co/storage/v1/object/public/texcontractor-side-ads/'+path;
const save=await fetch(BASE+'?key=eq.contractor_notice',{method:'PATCH',headers:{...headers,Prefer:'return=representation'},body:JSON.stringify({notice_image_url:uploadedUrl})});if(!save.ok)throw Error('Uploaded but could not publish: '+(await save.text()).slice(0,160));const savedRows=await save.json();if(!savedRows.length||savedRows[0].notice_image_url!==uploadedUrl)throw Error('Image could not be verified in site settings.');inputs.image.value=uploadedUrl;redraw();status.textContent='Image uploaded and published automatically. Copy its URL to reuse it anywhere.';}catch(error){status.textContent='Image upload failed: '+error.message;}finally{uploadInput.disabled=false;uploadInput.value='';}});
document.getElementById('contractor-notice-copy-image').addEventListener('click',async()=>{if(!inputs.image.value){status.textContent='Upload an image first.';return;}try{await navigator.clipboard.writeText(inputs.image.value);status.textContent='Direct image URL copied. You can use it elsewhere on your site.'}catch(e){inputs.image.focus();inputs.image.select();status.textContent='Select and copy the image URL.'}});
document.getElementById('contractor-notice-remove-image').addEventListener('click',()=>{inputs.image.value='';redraw();status.textContent='Image removed from preview. Click Save notice to remove it from the public page.'});
const load=async()=>{try{const {headers}=await auth();const r=await fetch(BASE+'?select=message_text,text_color,background_color,accent_color,font_style,notice_flash_speed,notice_image_url,notice_image_link_url&key=eq.contractor_notice&limit=1',{headers});if(!r.ok)throw Error('Could not load notice.');const rows=await r.json();if(edited)return;const row=rows[0]||{};field.value=row.message_text||DEFAULT;inputs.text.value=row.text_color||'#111827';inputs.background.value=row.background_color||'#fff0b4';inputs.border.value=row.accent_color||'#eabf36';inputs.font.value=row.font_style||'bold';inputs.flash.value=row.notice_flash_speed||'none';inputs.image.value=row.notice_image_url||'';inputs.link.value=row.notice_image_link_url||'';redraw();}catch(e){status.textContent=e.message}};
load();
form.addEventListener('submit',async e=>{
 e.preventDefault();
 const message_text=field.value.trim();
 if(!message_text){status.textContent='Enter a message.';return;}
 const button=document.getElementById('save-contractor-notice');
 button.disabled=true;status.textContent='Saving…';
 try{
  const {headers,user}=await auth();
  const payload={message_text,text_color:inputs.text.value,background_color:inputs.background.value,accent_color:inputs.border.value,font_style:inputs.font.value,notice_flash_speed:inputs.flash.value,notice_image_url:validImage(inputs.image.value),notice_image_link_url:validImage(inputs.link.value),updated_by:user.id};
  const r=await fetch(BASE+'?key=eq.contractor_notice',{method:'PATCH',headers:{...headers,Prefer:'return=representation'},body:JSON.stringify(payload)});
  if(!r.ok)throw Error((await r.text()).slice(0,250));
  const rows=await r.json();
  if(!rows.length)throw Error('No settings record updated.');
  const saved=rows[0];
  const mismatch=Object.keys(payload).filter(k=>k!=='updated_by'&&String(saved[k]??'')!==String(payload[k]??''));
  if(mismatch.length)throw Error('Settings mismatch: '+mismatch.join(', '));
  status.textContent='Saved successfully. The image and notice are now published.';
 }catch(error){status.textContent='Could not save: '+error.message}
 finally{button.disabled=false}
});
})();
