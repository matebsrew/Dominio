// "Quem vai treinar?" — seleção de perfil.

import { esc } from '../core/util.js';
import { profiles, setActive, pdata } from '../core/store.js';
import { GOAL_LABEL } from '../engine/energy.js';

export function render({ go }) {
  const list = profiles();

  const cards = list.map(p => {
    const data = pdata(p.id);
    const sessions = data.sessions.length;
    const initials = p.name.trim().slice(0, 2).toUpperCase();
    return `<button class="profile-card" data-id="${p.id}">
      <span class="avatar lg" style="background:${p.color}">${esc(initials)}</span>
      <b>${esc(p.name)}</b>
      <span class="meta">${esc(GOAL_LABEL[p.goal] || p.goal)}</span>
      <span class="meta">${sessions ? `${sessions} treino${sessions > 1 ? 's' : ''} registrado${sessions > 1 ? 's' : ''}` : 'ainda sem treinos'}</span>
    </button>`;
  }).join('');

  return {
    title: 'Perfis',
    html: `
      <div style="padding:calc(28px + env(safe-area-inset-top,0px)) 0 6px">
        <h1 style="font-size:27px">Quem vai treinar?</h1>
        <p class="muted">Cada pessoa tem treino, alimentação, cardio e histórico próprios.</p>
      </div>
      <div class="profile-grid">
        ${cards}
        <button class="profile-card add" data-new>
          <span style="font-size:30px;line-height:1">＋</span>
          <b>Novo perfil</b>
        </button>
      </div>
      <div class="row" style="justify-content:center;margin-top:24px">
        <button class="link" data-ajustes>Backup e ajustes</button>
      </div>`,
    mount(root) {
      root.querySelectorAll('.profile-card[data-id]').forEach(card => {
        card.addEventListener('click', () => {
          setActive(card.dataset.id);
          go('/hoje');
        });
      });
      root.querySelector('[data-new]')?.addEventListener('click', () => go('/novo'));
      root.querySelector('[data-ajustes]')?.addEventListener('click', () => {
        if (!profiles().length) return;
        setActive(profiles()[0].id);
        go('/ajustes');
      });
    }
  };
}
