import { addItem, savePreset, loadPreset } from './storage.js';
import { qs, setText, on } from './ui.js';

const PRESET_NAME = 'neonLab';

function apply(stage, { glow, hue, scan, pulse }){
  stage.style.setProperty('--glow', String(glow));
  stage.style.setProperty('--hue', String(hue));
  stage.style.setProperty('--scan', (scan/120).toFixed(3));
  stage.dataset.pulse = pulse ? '1' : '0';
}

function read(){
  return {
    glow: Number(qs('#glow')?.value ?? 70),
    hue: Number(qs('#hue')?.value ?? 290),
    scan: Number(qs('#scan')?.value ?? 20),
    pulse: Boolean(qs('#pulse')?.checked)
  };
}

on(document, 'DOMContentLoaded', () => {
  const stage = qs('#stage');
  const msg = qs('#neonMsg');

  let t = 0;
  function tick(){
    t += 1;
    if(stage && stage.dataset.pulse === '1') stage.style.setProperty('--t', String(Math.sin(t/22) * 10));
    else if(stage) stage.style.setProperty('--t','0');
    requestAnimationFrame(tick);
  }
  tick();

  const update = () => apply(stage, read());
  ['glow','hue','scan','pulse'].forEach(id => on(qs('#' + id), 'input', update));
  update();

  const collect = () => {
    const item = addItem({ type:'spark', name:'Spark', meta:{ realm:'neon', preset: read() } });
    setText(msg, `Collected a spark • ${new Date(item.at).toLocaleTimeString()}`);
    setTimeout(()=>setText(msg,''), 1400);
  };

  on(qs('#collectSpark'),'click', collect);

  on(qs('#savePreset'),'click', () => {
    savePreset(PRESET_NAME, read());
    setText(msg,'Preset saved.');
    setTimeout(()=>setText(msg,''), 1200);
  });

  on(qs('#loadPreset'),'click', () => {
    const p = loadPreset(PRESET_NAME);
    if(!p){ setText(msg,'No preset yet.'); setTimeout(()=>setText(msg,''), 1200); return; }
    qs('#glow').value = p.glow;
    qs('#hue').value = p.hue;
    qs('#scan').value = p.scan;
    qs('#pulse').checked = !!p.pulse;
    update();
    setText(msg,'Preset loaded.');
    setTimeout(()=>setText(msg,''), 1200);
  });

  on(document, 'keydown', (e) => {
    if(e.key.toLowerCase()==='s') qs('#savePreset')?.click();
    if(e.key.toLowerCase()==='l') qs('#loadPreset')?.click();
  });
});
