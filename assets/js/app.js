import { loadJson, qs, setText, el, fmtDate, clamp, on } from './ui.js';
import { loadState } from './storage.js';

async function main(){
  const [profile, social, software] = await Promise.all([
    loadJson('data/profile.json'),
    loadJson('data/social.json'),
    loadJson('data/software.json')
  ]);

  setText('#profileName', profile?.name ?? '—');
  setText('#profileRole', profile?.role ?? '—');
  setText('#profileSummary', profile?.summary ?? '');

  const avatar = qs('#avatar');
  if(avatar){
    const initials = (profile?.name || 'AM').split(/\s+/).filter(Boolean).slice(0,2).map(s=>s[0].toUpperCase()).join('');
    avatar.textContent = initials || 'AM';
  }

  const skillChips = qs('#skillChips');
  if(skillChips){
    skillChips.innerHTML = '';
    const skills = Array.isArray(software?.highlights) ? software.highlights : [];
    skills.slice(0,10).forEach(s => skillChips.append(el('span', { className:'chip', textContent: s })));
  }

  const socialGrid = qs('#socialGrid');
  if(socialGrid){
    socialGrid.innerHTML = '';
    (Array.isArray(social?.links) ? social.links : []).slice(0,6).forEach(link => {
      const a = el('a', { className:'soc', href: link.url || '#', target:'_blank', rel:'noreferrer' });
      a.append(el('div', { className:'soc__k', textContent: link.label || 'Link' }));
      a.append(el('div', { className:'soc__v', textContent: link.handle || link.url || '' }));
      socialGrid.append(a);
    });
  }

  const state = loadState();
  const sparks = state.items?.length || 0;
  const fill = qs('#sparkFill');
  if(fill) fill.style.width = clamp(12 + sparks * 8, 12, 100) + '%';

  const footerStamp = qs('#footerStamp');
  if(footerStamp) footerStamp.textContent = `Updated ${fmtDate(new Date())}`;

  const nowPlaying = qs('#nowPlaying');
  if(nowPlaying){
    const phrases = [
      'Try collecting a Ripple in Wave →',
      'Save a Neon preset in Neon Lab →',
      'Open the lightbox in Darkroom →',
      'Back up in Inventory →'
    ];
    const i = Math.floor((Date.now()/5000) % phrases.length);
    nowPlaying.textContent = phrases[i];
  }
}

on(document, 'DOMContentLoaded', main);
