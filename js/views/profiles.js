// "Quem vai treinar?" — seleção de perfil.

import { esc } from '../core/util.js';
import { profiles, setActive, pdata, createProfile, setProgram } from '../core/store.js';
import { GOAL_LABEL, calorieTarget, macros, bmiInfo } from '../engine/energy.js';
import { generateProgram } from '../engine/program.js';
import { FAMILY_TEMPLATE } from '../data/family.js';
import { sheet, closeSheet, field } from '../ui.js';
import { toast, num, fmt } from '../core/util.js';

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
        <h1 style="font-size:27px">${list.length ? 'Quem vai treinar?' : 'Bem-vindo ao Domínio'}</h1>
        <p class="muted">${list.length
          ? 'Cada pessoa tem treino, alimentação, cardio e histórico próprios.'
          : 'Um treinador para a casa inteira. Cada pessoa com treino, alimentação, cardio e histórico próprios — tudo salvo só neste aparelho.'}</p>
      </div>
      <div class="profile-grid">
        ${cards}
        <button class="profile-card add" data-new>
          <span style="font-size:30px;line-height:1">＋</span>
          <b>Novo perfil</b>
        </button>
      </div>
      ${list.length === 0 ? `<div class="card mt">
        <div class="eyebrow">Atalho</div>
        <h3>Montar a casa inteira de uma vez</h3>
        <p class="muted">Cria os quatro perfis já com altura, peso e objetivo calibrados. Dá para revisar tudo antes.</p>
        <button class="primary block" data-familia>Criar perfis da família</button>
      </div>` : ''}
      <div class="row" style="justify-content:center;margin-top:24px;gap:16px">
        ${list.length ? '<button class="link" data-familia>Criar perfis da família</button>' : ''}
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
      root.querySelector('[data-familia]')?.addEventListener('click', () => openFamilySheet(go));
      root.querySelector('[data-ajustes]')?.addEventListener('click', () => {
        if (!profiles().length) return;
        setActive(profiles()[0].id);
        go('/ajustes');
      });
    }
  };
}

function openFamilySheet(go) {
  const existing = new Set(profiles().map(p => p.name.toLowerCase()));
  const pending = FAMILY_TEMPLATE.filter(t => !existing.has(t.name.toLowerCase()));

  if (!pending.length) {
    return sheet('<h2>Perfis já criados</h2><p class="muted">Os quatro perfis da família já existem neste aparelho.</p><button class="ghost block" data-close>Fechar</button>');
  }

  sheet(`
    <h2>Perfis da família</h2>
    <p class="muted">Revise nome e idade — o resto já está calibrado para cada um. Você pode mudar tudo depois em Ajustes.</p>
    ${pending.map(t => {
      const bmi = bmiInfo(t.weightKg, t.heightCm);
      const targets = previewTargets(t);
      return `<div class="card flat tight" data-tpl="${t.key}">
        <div class="row between">
          <span class="avatar" style="background:${t.color}">${t.name.slice(0, 2).toUpperCase()}</span>
          <label class="row" style="gap:7px;margin:0;font-size:13px;color:var(--text);font-weight:700">
            <input type="checkbox" data-usar checked style="width:19px;height:19px"> criar
          </label>
        </div>
        <div class="grid-2 mt">
          ${field('Nome', `<input data-nome value="${esc(t.name)}">`)}
          ${field('Idade', `<input type="number" data-idade value="${t.age}" min="12" max="99">`)}
        </div>
        <div class="dim tiny">${t.heightCm} cm · ${t.weightKg} kg · IMC ${bmi.bmi} (${esc(bmi.band)}) · ${esc(GOAL_LABEL[t.goal])}</div>
        <div class="muted tiny mt">${esc(t.note)}</div>
        <div class="dim tiny mt">Meta inicial: ${fmt(targets.kcal)} kcal · ${fmt(targets.protein)} g de proteína · treino ${t.daysPerWeek}x de ${t.sessionMin} min</div>
      </div>`;
    }).join('')}
    <button class="primary block mt" data-criar>Criar perfis selecionados</button>
    <button class="ghost block" data-close>Cancelar</button>`, {
    onMount(sheetEl) {
      sheetEl.querySelector('[data-criar]').addEventListener('click', () => {
        let created = 0;
        for (const card of sheetEl.querySelectorAll('[data-tpl]')) {
          if (!card.querySelector('[data-usar]').checked) continue;
          const tpl = FAMILY_TEMPLATE.find(t => t.key === card.dataset.tpl);
          const { key, note, ...fields } = tpl;
          const profile = createProfile({
            ...fields,
            name: card.querySelector('[data-nome]').value.trim() || tpl.name,
            age: num(card.querySelector('[data-idade]').value) || tpl.age,
            dislikes: []
          });
          setProgram(generateProgram(profile));
          created++;
        }
        closeSheet();
        toast(created ? `${created} perfis criados.` : 'Nenhum perfil selecionado.');
      });
    }
  });
}

function previewTargets(tpl) {
  const energy = calorieTarget(tpl, {}, 60, 0);
  return energy ? macros(tpl, energy.target, {}) : { kcal: 0, protein: 0 };
}
