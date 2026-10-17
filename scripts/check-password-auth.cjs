const vm = require('node:vm');
const fs = require('node:fs');
const assert = require('node:assert/strict');
function harness(auto = true) {
 const values = new Map(); const calls = [];
 const session = {access_token:'test-token',refresh_token:'test-refresh',user:{id:'test-id',email:'name@gmail.com'}};
 const context = {URL,URLSearchParams,Date,JSON,console,document:{title:''},localStorage:{getItem:k=>values.get(k)||null,setItem:(k,v)=>values.set(k,v),removeItem:k=>values.delete(k)},window:{location:{href:'https://texcontractor.com/auth.html',origin:'https://texcontractor.com',hostname:'texcontractor.com',hash:''}}};
 context.fetch = async (url, options={}) => { calls.push({url,options}); let data = {};
 if(url.endsWith('/settings')) data={mailer_autoconfirm:auto};
 else if(url.includes('/signup?')||url.includes('grant_type=password'))data=session;
 else if(url.includes('texcontractor_members?select'))data=[{status:'active'}];
 else if(url.includes('texcontractor_admins?'))data=[];
 return {ok:true,json:async()=>data}; };
 vm.runInNewContext(fs.readFileSync('tex-auth.js','utf8'),context);
 return {auth:context.window.TexAuth,calls,values};
}
(async()=>{
 let h=harness();
 for(const email of ['a..b@gmail.com','a@','x@@gmail.com','x@-gmail.com','x@gmial.com','x y@gmail.com']) await assert.rejects(()=>h.auth.passwordRequest(email,'abc123','customer','account.html'));
 await assert.rejects(()=>h.auth.passwordRequest('name@gmail.com','abcdef','customer','account.html'));
 assert.equal(h.calls.length,0,'Invalid input must never create an account');
 const result=await h.auth.passwordRequest('name@gmail.com','abc123','customer','account.html');
 assert.equal(result.signedIn,true); assert.ok(h.values.get('texcontractor-auth-session'));assert.equal(h.values.get('texcontractor-account-created'),'1');
 h=harness(false);await assert.rejects(()=>h.auth.passwordRequest('name@gmail.com','abc123','customer','account.html'),/configured/);assert.equal(h.calls.length,1,'Do not create a confirmation-required account');
 h=harness();assert.equal((await h.auth.passwordRequest('name@gmail.com','abc123',null,'account.html')).signedIn,true);
 assert.equal(h.calls.some(c=>c.url.endsWith('/settings')),false,'Existing login stays available');
 assert.equal(h.auth.safeReturnTo('https://other.example/'),'index.html');
 const page = fs.readFileSync('contractor.html','utf8');
 assert.ok(page.indexOf('src="tex-auth.js') < page.indexOf('async function loadProviders'), 'Auth must load before protected directory initialization');
 console.log('PASS: invalid email/password rejected; signup/login session saved; confirmation-required signup blocked; external redirect rejected.');
})().catch(e=>{console.error(e);process.exit(1)});
