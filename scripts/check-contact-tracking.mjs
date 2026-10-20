import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const helper=readFileSync('tex-contact-tracking.js','utf8');
const directory=readFileSync('contractor.html','utf8'),profileHTML=readFileSync('profile.html','utf8');
function handler(html,prefix,until){const start=html.indexOf(prefix);assert(start>=0);const source=html.slice(start+prefix.length,html.indexOf(until,start)).trim();assert(source.endsWith(');'));return '('+source.slice(0,-2)+')';}
const handlers={
 call:handler(directory,"call.addEventListener('click', ",'\n      const text ='),
 directory:handler(directory,"textButton.addEventListener('click', ",'\n      const profileButton'),
 imported:handler(directory,"sms.addEventListener('click',",'\n              const profile='),
 profile:handler(profileHTML,"textLink.addEventListener('click', ","\n    document.getElementById('gallery-text-link')")
};
async function run(name,{authorized=true,phone='+18175550123',failed=false,analytics='normal'}={}){
 const events=[],errors=[],signIns=[];
 const window={location:{href:'unchanged',search:'?example'},alert:message=>errors.push(message)};
 if(analytics!=='absent')window.gtag=(...args)=>{if(analytics==='throws')throw Error('blocked analytics');events.push(args);};
 const context={window,Map,Object,Date,encodeURIComponent,String,
  call:{disabled:false},textButton:{textContent:''},textLink:{textContent:''},
  loadPhone:async()=>{if(failed)throw Error('lookup failed');return phone;},
  getContractorPhone:async()=>{if(failed)throw Error('lookup failed');return authorized?phone:'';},
  provider:{id:'provider-id',display_name:'Test provider'},entry:{id:'imported-id',business_name:'Test provider'},
  profile:{id:'profile-id',imported:false},SUPABASE_URL:'https://example.invalid',SUPABASE_KEY:'mock',
  messageTemplate:name==='profile'?'Original message':()=> 'Original message',
  TexAuth:{getAccessToken:async()=>authorized?'mock-token':null,requireUser:async path=>signIns.push(path)},
  fetch:async()=>({ok:!failed,json:async()=>name==='imported'?phone:[{phone}]}),alert:message=>errors.push(message)
 };
 vm.createContext(context);vm.runInContext(helper,context);
 assert.equal(events.length,0,'Loading the tracking script sends no conversion');
 const fn=vm.runInContext(handlers[name],context);await fn({preventDefault(){}});
 return {events,errors,signIns,window};
}
for(const name of Object.keys(handlers)){
 const result=await run(name);assert.equal(result.events.length,1,name+' tracks once');
 const [command,type,payload]=result.events[0];assert.equal(command,'event');assert.equal(type,'conversion');
 assert.equal(payload.send_to,'AW-18516159223/3-f9CL3Jvp4dEPfVmP1E');
 assert.equal(payload.value,1);assert.equal(payload.currency,'USD');assert.equal(payload.contact_method,name==='call'?'call':'sms');
 assert.deepEqual(Object.keys(payload).sort(),['contact_method','currency','send_to','value'],'No phone, user name or message is exported');
 assert.equal(result.window.location.href,name==='call'?'tel:+18175550123':'sms:+18175550123?body=Original%20message','Existing contact handoff is unchanged');
 for(const options of [{phone:''},{failed:true}]){const invalid=await run(name,options);assert.equal(invalid.events.length,0);assert.equal(invalid.window.location.href,'unchanged');}
 for(const analytics of ['absent','throws']){const blocked=await run(name,{analytics});assert.equal(blocked.events.length,0);assert.notEqual(blocked.window.location.href,'unchanged','Analytics failure never blocks contact');}
}
for(const name of ['directory','imported','profile']){const result=await run(name,{authorized:false});assert.equal(result.events.length,0,'Sign-in is not a conversion');assert.equal(result.window.location.href,'unchanged');}
const events=[],context={window:{gtag:(...args)=>events.push(args)},Map,Object,Date};vm.runInNewContext(helper,context);
assert.equal(context.window.TexContactTracking.record('sms'),true);assert.equal(context.window.TexContactTracking.record('sms'),false,'Rapid duplicate call is ignored');assert.equal(context.window.TexContactTracking.record('call'),true);assert.equal(context.window.TexContactTracking.record('page_view'),false);assert.equal(events.length,2);
for(const html of [directory,profileHTML]){assert.equal((html.match(/tex-contact-tracking\.js/g)||[]).length,1);assert.equal((html.match(/gtag\('config', 'AW-18516159223'\)/g)||[]).length,1,'Existing Google tag is not duplicated');}
console.log('PASS contact tracking: no page-load conversion, four authorized contact paths, denied/failed lookups, unchanged SMS/call links, analytics failures, duplicate suppression and minimal payload');
