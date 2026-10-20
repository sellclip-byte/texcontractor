// Regression harness: browsers expose a form control with id="reset" as form.reset.
// Exercise opening, saving and clearing an existing item with that named property.
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';

async function check(source) {
  class Element {
    constructor(tag = 'div') {
      this.tagName = tag.toUpperCase(); this.children = []; this.listeners = {};
      this.value = ''; this.checked = false; this.files = []; this.hidden = true;
      this.classList = { toggle() {} };
    }
    append(...nodes) { this.children.push(...nodes); }
    replaceChildren(...nodes) { this.children = nodes; }
    addEventListener(type, fn) { this.listeners[type] = fn; }
    querySelectorAll(tag) {
      return this.children.flatMap(node => [
        ...(node.tagName === tag.toUpperCase() ? [node] : []), ...node.querySelectorAll(tag)
      ]);
    }
    focus() { this.focused = true; }
    scrollIntoView() { this.scrolled = true; }
  }
  const ids = [...readFileSync('showcase-admin.html', 'utf8').matchAll(/\bid="([^"]+)"/g)].map(m => m[1]);
  const nodes = Object.fromEntries(ids.map(id => [id, new Element()]));
  const inputIds = ['kind','title','body','attribution','media-url','sort-order','published','verified','consent','media-file','save','reset'];
  class Form extends Element {
    reset() {
      for (const id of inputIds) { nodes[id].value = ''; nodes[id].checked = false; nodes[id].files = []; }
      nodes.kind.value = 'story'; nodes['sort-order'].value = '0';
    }
  }
  const form = new Form(); nodes['content-form'] = form;
  form.elements = inputIds.map(id => nodes[id]);
  form.reset = nodes.reset; // Browser named-property collision that caused the reported bug.
  const row = { id:'123', kind:'image', title:'Original photo', body:'Original description',
    media_url:'https://example.com/photo.png', attribution:'', published:true,
    verified:false, consent:false, sort_order:7 };
  const requests = [];
  vm.runInNewContext(source, {
    document: { getElementById:id => nodes[id], createElement:tag => new Element(tag) },
    HTMLFormElement:Form, URL, crypto:{}, location:{replace(){}}, confirm:() => true,
    TexAuth:{getUser:async() => ({id:'admin'}), getAccessToken:async() => 'mock-token'},
    TexAdminApi:{getAdminRecord:async() => ({role:'admin'})},
    fetch:async(url, options = {}) => {
      requests.push({url,...options});
      return {ok:true, text:async() => JSON.stringify([row])};
    }
  });
  await new Promise(resolve => setImmediate(resolve));
  const edit = nodes['content-list'].querySelectorAll('button').find(b => b.textContent === 'Edit');
  assert(edit, 'Existing item has an Edit button');
  edit.listeners.click();
  assert.equal(nodes.title.value, row.title);
  assert.equal(nodes['media-url'].value, row.media_url);
  assert.equal(nodes['sort-order'].value, row.sort_order);
  assert.equal(nodes.published.checked, true);
  assert.equal(form.scrolled, true);
  nodes.title.value = 'Updated photo';
  await form.listeners.submit({preventDefault(){}});
  const update = requests.find(r => r.method === 'PATCH');
  assert(update, 'Saving an edit updates an existing row');
  assert(update.url.endsWith('?id=eq.123'), 'Correct existing ID is preserved');
  assert.equal(JSON.parse(update.body).title, 'Updated photo');
  assert.equal(JSON.parse(update.body).media_url, row.media_url, 'Existing file is retained');
  assert(!requests.some(r => r.method === 'POST'), 'Editing does not create a duplicate');
  assert.equal(nodes.title.value, '', 'Form clears after a successful save');
  assert.equal(nodes['editor-title'].textContent, 'Add content');
  nodes.reset.listeners.click();
}
const current = readFileSync('tex-showcase-admin.js','utf8');
const broken = current.replace('HTMLFormElement.prototype.reset.call(form)', 'form.reset()');
assert.notEqual(broken, current, 'Regression fixture restores the browser named-property failure');
await assert.rejects(check(broken), /form.reset is not a function/);
await check(current);
console.log('PASS reproduced old Edit failure; fixed Edit, PATCH save, retained file and clear form in simulated DOM');
