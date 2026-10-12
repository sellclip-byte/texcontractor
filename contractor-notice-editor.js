(function(){
const DEFAULT='No calls or long forms. Tap “Text this contractor” and send the details from your phone.';
const BASE='https://rryehtaskbjnfbodymjj.supabase.co/rest/v1/texcontractor_site_settings';
const KEY='sb_publishable_10LgFmHximAplWyQXKNopw_2peqDb7r';
const field=document.getElementById('contractor-notice-message'),preview=document.getElementById('contractor-notice-preview'),status=document.getElementById('contractor-notice-status'),form=document.getElementById('contractor-notice-form');
if(!field||!form)return;
field.value=DEFAULT;preview.textContent=DEFAULT;
field.addEventListener('input',()=>preview.textContent=field.value);
document.getElementById('restore-contractor-notice').addEventListener('click',()=>{field.value=DEFAULT;preview.textContent=DEFAULT;status.textContent='Default loaded. Click Save notice to publish.'});
const auth=async()=>{const user=await TexAuth.getUser();if(!user)throw Error('Please sign in first.');const token=await TexAuth.getAccessToken();if(!token)throw Error('Session expired.');const headers={apikey:KEY,Authorization:'Bearer '+token,'Content-Type':'application/json'};const a=await fetch('https://rryehtaskbjnfbodymjj.supabase.co/rest/v1/texcontractor_admins?select=user_id&user_id=eq.'+encodeURIComponent(user.id)+'&limit=1',{headers});if(!a.ok||(await a.json()).length===0)throw Error('Administrator access required.');return {headers,user}};
const load=async()=>{try{const {headers}=await auth();const r=await fetch(BASE+'?select=message_text&key=eq.contractor_notice&limit=1',{headers});if(!r.ok)throw Error('Could not load notice.');const rows=await r.json();field.value=rows[0]?.message_text||DEFAULT;preview.textContent=field.value;}catch(e){status.textContent=e.message}};
load();
form.addEventListener('submit',async e=>{e.preventDefault();const message_text=field.value.trim();if(!message_text){status.textContent='Enter a message.';return;}const button=document.getElementById('save-contractor-notice');button.disabled=true;status.textContent='Saving…';try{const {headers,user}=await auth();const r=await fetch(BASE+'?on_conflict=key',{method:'POST',headers:{...headers,Prefer:'resolution=merge-duplicates,return=minimal'},body:JSON.stringify({key:'contractor_notice',message_text,updated_by:user.id})});if(!r.ok)throw Error((await r.text()).slice(0,200));status.textContent='Saved successfully. The notice updates for visitors after refresh.'}catch(e){status.textContent='Could not save: '+e.message}finally{button.disabled=false}});
})();