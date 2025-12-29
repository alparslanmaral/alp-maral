import { addItem } from './storage.js';
import { qs, el, setText, loadJson, on } from './ui.js';

let all = [];
let filtered = [];
let activeTag = 'all';
let idx = -1;

function renderFilters(items){
  const wrap = qs('#tagFilters');
  if(!wrap) return;

  const tags = new Set(['all']);
  items.forEach(it => (it.tags || []).forEach(t => tags.add(t)));

  wrap.innerHTML = '';
  [...tags].forEach(tag => {
    const b = el('button', { className:'filter', type:'button', textContent: tag, ariaPressed: String(tag===activeTag) });
    b.addEventListener('click', () => { activeTag = tag; renderGallery(); renderFilters(all); });
    wrap.append(b);
  });
}

function renderGallery(){
  const g = qs('#gallery');
  if(!g) return;
  filtered = (activeTag==='all') ? all : all.filter(it => (it.tags||[]).includes(activeTag));
  g.innerHTML = '';

  filtered.forEach((it, i) => {
    const tile = el('div', { className:'tile', tabIndex: 0, role:'button', ariaLabel:`Open ${it.title}` });
    const thumb = el('div', { className:'thumb' });
    // Optional custom gradient per item
    if(it.accent){
      thumb.style.background = `radial-gradient(650px 260px at 30% 20%, ${it.accent}33, transparent 60%), linear-gradient(135deg, rgba(255,255,255,.04), rgba(255,255,255,.02))`;
    }
    const body = el('div', { className:'tile__body' });
    body.append(el('div', { className:'tile__title', textContent: it.title }));
    body.append(el('div', { className:'tile__desc', textContent: it.desc || '' }));
    tile.append(thumb, body);

    const open = () => openLightbox(i);
    tile.addEventListener('click', open);
    tile.addEventListener('keydown', (e)=>{ if(e.key==='Enter' || e.key===' '){ e.preventDefault(); open(); } });

    g.append(tile);
  });

  if(filtered.length === 0){
    g.append(el('div', { className:'tiny', textContent:'No items for this tag.' }));
  }
}

function setLightboxOpen(open){
  const lb = qs('#lightbox');
  if(!lb) return;
  lb.setAttribute('aria-hidden', open ? 'false' : 'true');
}

function openLightbox(i){
  idx = i;
  const it = filtered[idx];
  if(!it) return;

  const img = qs('#lightboxImg');
  if(img){
    img.src = it.src || '';
    img.alt = it.title || '';
  }
  setText('#lightboxTitle', it.title || '');
  setText('#lightboxDesc', it.desc || '');

  const tags = qs('#lightboxTags');
  if(tags){
    tags.innerHTML = '';
    (it.tags || []).forEach(t => tags.append(el('span', { className:'chip', textContent: t })));
  }

  setLightboxOpen(true);
}

function closeLightbox(){ setLightboxOpen(false); }

function nav(dir){
  if(filtered.length === 0) return;
  idx = (idx + dir + filtered.length) % filtered.length;
  openLightbox(idx);
}

on(document, 'DOMContentLoaded', async () => {
  all = (await loadJson('data/photography.json'))?.items || [];
  renderFilters(all);
  renderGallery();

  on(qs('#collectGrain'), 'click', () => {
    const item = addItem({ type:'grain', name:'Grain', meta:{ realm:'darkroom' } });
    setText('#darkMsg', `Collected grain • ${new Date(item.at).toLocaleTimeString()}`);
    setTimeout(()=>setText('#darkMsg',''), 1400);
  });

  on(qs('#closeLightbox'), 'click', closeLightbox);
  on(qs('#lightbox'), 'click', (e) => {
    if(e.target?.dataset?.close === 'true') closeLightbox();
  });

  on(document, 'keydown', (e) => {
    const lb = qs('#lightbox');
    const open = lb && lb.getAttribute('aria-hidden') === 'false';
    if(!open) return;
    if(e.key === 'Escape') closeLightbox();
    if(e.key === 'ArrowRight') nav(1);
    if(e.key === 'ArrowLeft') nav(-1);
  });
});
