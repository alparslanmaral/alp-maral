import { addItem, loadState } from './storage.js';
import { qs, setText, on, clamp } from './ui.js';

function spawnRipple(x, y){
  const banner = qs('#banner');
  if(!banner) return;
  const r = document.createElement('div');
  r.className = 'ripple';
  r.style.left = x + 'px';
  r.style.top = y + 'px';
  banner.append(r);
  setTimeout(()=>r.remove(), 950);
}

function setBannerVars(e){
  const banner = qs('#banner');
  if(!banner) return;
  const rect = banner.getBoundingClientRect();
  const x = clamp(((e.clientX - rect.left) / rect.width) * 100, 0, 100);
  const y = clamp(((e.clientY - rect.top) / rect.height) * 100, 0, 100);
  const dx = (x - 50) * .9;
  const dy = (y - 50) * .7;
  banner.style.setProperty('--x', x + '%');
  banner.style.setProperty('--y', y + '%');
  banner.style.setProperty('--dx', dx.toFixed(2));
  banner.style.setProperty('--dy', dy.toFixed(2));
  setText('#intensity', Math.round(Math.abs(dx) + Math.abs(dy)));
}

function updateCount(){
  const state = loadState();
  const c = (state.items || []).filter(i=>i.type==='ripple').length;
  setText('#rippleCount', String(c));
}

function collect(){
  const item = addItem({ type:'ripple', name:'Ripple', meta:{ realm:'wave' } });
  updateCount();
  setText('#waveHint', `Collected a ripple • ${new Date(item.at).toLocaleTimeString()}`);
  setTimeout(()=>setText('#waveHint',''), 1400);
}

on(document, 'DOMContentLoaded', () => {
  updateCount();

  const banner = qs('#banner');
  on(banner, 'pointermove', setBannerVars);
  on(banner, 'pointerdown', (e) => {
    const rect = banner.getBoundingClientRect();
    spawnRipple(e.clientX - rect.left, e.clientY - rect.top);
  });

  on(qs('#collectRipple'), 'click', collect);
  on(banner, 'keydown', (e) => {
    if(e.key.toLowerCase() === 'r'){ collect(); }
  });

  on(document, 'keydown', (e)=>{
    if(e.key.toLowerCase() === 'r') collect();
  });

  on(qs('#calm'),'click', ()=>{
    if(!banner) return;
    banner.style.setProperty('--dx', '0');
    banner.style.setProperty('--dy', '0');
    setText('#intensity','0');
    setText('#waveHint','Calm.');
    setTimeout(()=>setText('#waveHint',''), 1000);
  });
});
