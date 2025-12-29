const KEY = 'am_realms_v1';
const THEME_KEY = 'am_theme_v1';

function nowISO(){ return new Date().toISOString(); }

export function loadState(){
  try{
    const raw = localStorage.getItem(KEY);
    if(!raw) return { items: [], notes: '', presets: {} };
    const parsed = JSON.parse(raw);
    return {
      items: Array.isArray(parsed.items) ? parsed.items : [],
      notes: typeof parsed.notes === 'string' ? parsed.notes : '',
      presets: (parsed.presets && typeof parsed.presets === 'object') ? parsed.presets : {}
    };
  }catch{
    return { items: [], notes: '', presets: {} };
  }
}

export function saveState(next){
  localStorage.setItem(KEY, JSON.stringify(next));
}

export function addItem({ type, name, meta = {} }){
  const state = loadState();
  const item = {
    id: crypto?.randomUUID ? crypto.randomUUID() : String(Date.now()) + Math.random().toString(16).slice(2),
    type,
    name,
    meta,
    at: nowISO()
  };
  state.items.unshift(item);
  saveState(state);
  return item;
}

export function clearItems(){
  const state = loadState();
  state.items = [];
  saveState(state);
  return state;
}

export function setNotes(text){
  const state = loadState();
  state.notes = String(text ?? '');
  saveState(state);
  return state;
}

export function clearNotes(){
  return setNotes('');
}

export function savePreset(name, preset){
  const state = loadState();
  state.presets = state.presets || {};
  state.presets[name] = preset;
  saveState(state);
}

export function loadPreset(name){
  const state = loadState();
  return state.presets?.[name] ?? null;
}

export function exportState(){
  return loadState();
}

export function importState(obj){
  const safe = {
    items: Array.isArray(obj?.items) ? obj.items : [],
    notes: typeof obj?.notes === 'string' ? obj.notes : '',
    presets: (obj?.presets && typeof obj.presets === 'object') ? obj.presets : {}
  };
  saveState(safe);
  return safe;
}

export function getTheme(){
  return localStorage.getItem(THEME_KEY) || '';
}

export function setTheme(theme){
  localStorage.setItem(THEME_KEY, theme);
}
