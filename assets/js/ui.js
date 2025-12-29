import { getTheme, setTheme, loadState, setNotes, clearNotes, clearItems, exportState, importState } from './storage.js';

export const qs = (sel, root=document) => root.querySelector(sel);
export const qsa = (sel, root=document) => Array.from(root.querySelectorAll(sel));
export const on = (el, ev, fn, opts) => el?.addEventListener(ev, fn, opts);

export function setText(sel, text){
  const n = typeof sel === 'string' ? qs(sel) : sel;
  if(n) n.textContent = text ?? '';
}

export function el(tag, props = {}){
  const node = document.createElement(tag);
  Object.assign(node, props);
  return node;
}

export function clamp(n, a, b){ return Math.max(a, Math.min(b, n)); }

export function fmtDate(d){
  try{
    return new Intl.DateTimeFormat(undefined, { year:'numeric', month:'short', day:'2-digit' }).format(d);
  }catch{ return d.toISOString().slice(0,10); }
}

export async function loadJson(path){
  const res = await fetch(path, { cache: 'no-store' });
  if(!res.ok) throw new Error(`Failed to load ${path}`);
  return await res.json();
}

function applyTheme(theme){
  const root = document.documentElement;
  if(theme === 'light') root.setAttribute('data-theme','light');
  else root.removeAttribute('data-theme');
}

function initThemeToggle(){
  const current = getTheme();
  applyTheme(current);
  const btn = qs('#themeToggle');
  if(!btn) return;
  btn.addEventListener('click', () => {
    const now = document.documentElement.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
    if(now === 'light'){ applyTheme('light'); setTheme('light'); }
    else { applyTheme('dark'); setTheme('dark'); }
  });
}

/* Inventory + Contact pages share this module. */
async function initContact(){
  const intro = qs('#contactIntro');
  const emailText = qs('#emailText');
  const links = qs('#contactLinks');
  if(!intro && !emailText && !links) return;

  const profile = await loadJson('data/profile.json');
  const social = await loadJson('data/social.json');

  if(intro) intro.textContent = profile?.contactIntro ?? 'You can reach me via email or links.';

  const email = profile?.email ?? 'hello@example.com';
  if(emailText) emailText.textContent = email;

  const mailto = qs('#mailto');
  if(mailto) mailto.href = `mailto:${encodeURIComponent(email)}?subject=${encodeURIComponent('Hello Alp')}`;

  if(links){
    links.innerHTML = '';
    (social?.links || []).forEach(l => {
      const a = el('a', { className:'soc', href:l.url || '#', target:'_blank', rel:'noreferrer' });
      a.append(el('div', { className:'soc__k', textContent: l.label || 'Link' }));
      a.append(el('div', { className:'soc__v', textContent: l.handle || l.url || '' }));
      links.append(a);
    });
  }

  const copyBtn = qs('#copyEmail');
  const msg = qs('#copyMsg');
  if(copyBtn){
    copyBtn.addEventListener('click', async () => {
      try{
        await navigator.clipboard.writeText(email);
        if(msg) msg.textContent = 'Copied.';
      }catch{
        if(msg) msg.textContent = 'Copy failed (clipboard unavailable).';
      }
      setTimeout(() => { if(msg) msg.textContent = ''; }, 1200);
    });
  }
}

function renderInventory(){
  const list = qs('#invList');
  const summary = qs('#invSummary');
  if(!list && !summary) return;

  const state = loadState();
  const items = state.items || [];

  if(summary){
    const counts = items.reduce((acc,it)=>{ acc[it.type]=(acc[it.type]||0)+1; return acc; },{});
    const parts = Object.entries(counts).map(([k,v])=>`${k}:${v}`);
    summary.textContent = items.length ? `${items.length} total • ${parts.join(' • ')}` : 'No items yet — visit Wave/Neon/Darkroom to collect.';
  }

  if(list){
    list.innerHTML = '';
    items.slice(0,50).forEach(it => {
      const row = el('div', { className:'item' });
      const left = el('div', { className:'item__left' });
      left.append(el('span', { className:'badge', textContent: it.type }));
      left.append(el('div', { className:'item__name', textContent: it.name }));
      const when = el('div', { className:'item__when', textContent: new Date(it.at).toLocaleString() });
      row.append(left, when);
      list.append(row);
    });
    if(items.length === 0){
      list.append(el('div',{ className:'tiny', textContent:'Nothing here yet.' }));
    }
  }

  const notes = qs('#invNotes');
  if(notes) notes.value = state.notes || '';
}

function initInventory(){
  const notes = qs('#invNotes');
  if(!notes && !qs('#invList')) return;

  renderInventory();

  on(qs('#saveNotes'), 'click', () => {
    setNotes(notes.value);
    setText('#notesMsg','Saved.');
    setTimeout(()=>setText('#notesMsg',''), 1200);
  });

  on(qs('#eraseNotes'), 'click', () => {
    clearNotes();
    if(notes) notes.value='';
    setText('#notesMsg','Erased.');
    setTimeout(()=>setText('#notesMsg',''), 1200);
  });

  on(qs('#clearInv'), 'click', () => {
    clearItems();
    renderInventory();
    setText('#invMsg','Cleared items.');
    setTimeout(()=>setText('#invMsg',''), 1200);
  });

  on(qs('#exportInv'), 'click', () => {
    const data = exportState();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type:'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'realms-inventory.json';
    a.click();
    URL.revokeObjectURL(a.href);
  });

  on(qs('#importInv'), 'change', async (e) => {
    const file = e.target.files?.[0];
    if(!file) return;
    try{
      const txt = await file.text();
      const obj = JSON.parse(txt);
      importState(obj);
      renderInventory();
      setText('#invMsg','Imported.');
    }catch{
      setText('#invMsg','Import failed. Invalid JSON.');
    }
    setTimeout(()=>setText('#invMsg',''), 1400);
    e.target.value = '';
  });
}

function initPageStamp(){
  const s = qs('#footerStamp');
  if(s && !s.textContent.trim()) s.textContent = new Date().toISOString().slice(0,10);
}

on(document, 'DOMContentLoaded', () => {
  initThemeToggle();
  initInventory();
  initContact();
  initPageStamp();
});
