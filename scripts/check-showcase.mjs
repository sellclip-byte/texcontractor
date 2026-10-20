import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
class Node { constructor(tag='div'){this.tagName=tag.toUpperCase();this.children=[];this.hidden=true;this.classList={add(){}};}append(...nodes){this.children.push(...nodes);}addEventListener(){}setAttribute(){} }
const nodes=new Map(),get=id=>{if(!nodes.has(id))nodes.set(id,new Node());return nodes.get(id);};
const row=(kind,extra={})=>({kind,title:'<img src=x onerror=alert(1)>',body:'A real experience',published:true,verified:true,consent:true,media_url:'https://example.com/file',attribution:'Approved display name',...extra});
const data=[row('story'),row('image'),row('video'),row('testimonial'),row('testimonial',{verified:false}),row('story',{published:false}),row('video',{media_url:'javascript:alert(1)'})];
vm.runInNewContext(readFileSync('tex-showcase.js','utf8'),{document:{getElementById:get,createElement:tag=>new Node(tag)},URL,navigator:{},fetch:async()=>({ok:true,json:async()=>data})});
await new Promise(resolve=>setImmediate(resolve));
assert.equal(get('testimonials').children.length,1,'Only verified published reviews render');
assert.equal(get('stories').children.length,1,'Drafts remain hidden');
assert.equal(get('videos').children.length,1,'Unsafe media URL rejected');
assert.equal(get('stories').children[0].children[0].children[0].textContent,data[0].title,'Titles render as text');
assert.equal(get('videos').children[0].children[0].controls,true);
assert.equal(get('videos').children[0].children[0].preload,'metadata');
assert.equal(get('review-count').textContent,'1 published community experience');
for(const file of ['about-texcontractor.html','showcase-admin.html']){
 const html=readFileSync(file,'utf8'),ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);assert.equal(ids.length,new Set(ids).size,'Unique IDs: '+file);
 for(const m of html.matchAll(/(?:src|href)="([^"#?]+)(?:\?[^"#]*)?(?:#[^"]*)?"/g)){if(!/^(https?:|\/)/.test(m[1]))readFileSync(m[1]);}
}
assert(readFileSync('tex-showcase.css','utf8').includes('--service-green:#075c4b'));
assert(readFileSync('index.html','utf8').includes('--service-green: #075c4b'));
console.log('PASS showcase visibility, testimonial count, safe text, media URLs, video controls, local links and homepage brand color');
