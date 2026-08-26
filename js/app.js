// Domínio — treinador pessoal da família. Roteador e casca do app.

import { $, esc } from './core/util.js';
import { getState, activeProfile, subscribe, hasLegacyData } from './core/store.js';
import { tabbar, avatarHtml } from './ui.js';

import * as profilesView from './views/profiles.js';
import * as onboardingView from './views/onboarding.js';
import * as todayView from './views/today.js';
import * as workoutView from './views/workout.js';
import * as sessionView from './views/session.js';
import * as nutritionView from './views/nutrition.js';
import * as activityView from './views/activity.js';
import * as bodyView from './views/body.js';
import * as historyView from './views/history.js';
import * as settingsView from './views/settings.js';
import * as weekView from './views/week.js';

const ROUTES = {
  perfis: profilesView,
  novo: onboardingView,
  hoje: todayView,
  treino: workoutView,
  sessao: sessionView,
  nutricao: nutritionView,
  atividade: activityView,
  corpo: bodyView,
  historico: historyView,
  ajustes: settingsView,
  semana: weekView
};

export function go(path) {
  location.hash = path.startsWith('#') ? path : `#${path}`;
}

function parseRoute() {
  const raw = location.hash.replace(/^#\/?/, '');
  const [name, ...rest] = raw.split('/').filter(Boolean);
  return { name: name || '', params: rest };
}

let currentCleanup = null;

async function render() {
  const state = getState();
  const { name, params } = parseRoute();

  // Sem perfil algum: tela de perfis, que oferece criar um a um ou a família inteira.
  if (!state.profiles.length && !['novo', 'perfis'].includes(name)) return go('/perfis');
  // Perfil não escolhido ainda.
  if (state.profiles.length && !state.activeProfileId && !['perfis', 'novo'].includes(name)) return go('/perfis');
  if (!name) return go(state.activeProfileId ? '/hoje' : '/perfis');

  const view = ROUTES[name];
  if (!view) return go('/hoje');

  currentCleanup?.();
  currentCleanup = null;

  const profile = activeProfile();
  const output = await view.render({ profile, params, go });
  const app = $('#app');
  const showChrome = !['perfis', 'novo'].includes(name);

  $('#topbar').innerHTML = showChrome ? `
    <div class="topbar-inner">
      <div style="flex:1;min-width:0">
        <h1>${esc(output.title || '')}</h1>
        ${output.subtitle ? `<div class="sub">${esc(output.subtitle)}</div>` : ''}
      </div>
      ${output.action || ''}
      ${avatarHtml(profile)}
    </div>` : '';
  $('#topbar').classList.toggle('hidden', !showChrome);

  app.innerHTML = output.html;
  $('#tabbar').innerHTML = showChrome ? tabbar(name) : '';

  window.scrollTo({ top: 0 });
  currentCleanup = output.mount?.(app) || null;

  document.querySelectorAll('[data-action="trocar-perfil"]').forEach(btn => {
    btn.addEventListener('click', () => go('/perfis'));
  });
}

window.addEventListener('hashchange', render);
subscribe(() => {
  // Redesenha apenas quando a tela depende do estado alterado.
  if (document.querySelector('.sheet-backdrop')) return;
  render();
});

// Aviso único sobre os dados do app anterior.
if (hasLegacyData()) document.documentElement.dataset.legacy = '1';

render();

// PWA: remove qualquer service worker antigo para não servir versão desatualizada.
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations?.().then(rs => rs.forEach(r => r.unregister())).catch(() => {});
}
