// Porta de entrada da casa.
//
// O endereço do site é público — não há como esconder um site estático.
// O que protege vocês é o cofre: sem a frase de acesso, quem abrir o
// endereço encontra um app vazio, e os dados gravados neste aparelho são
// ilegíveis, porque estão cifrados.

import { esc, toast } from '../core/util.js';
import { createVault, unlockVault, hasVault, cryptoSupported } from '../core/store.js';

export const HOUSEHOLD = ['Matheus', 'Thais', 'Leandro', 'Priscila'];

function roster() {
  return `<div class="roster">
    ${HOUSEHOLD.map(n => `<span class="roster-name">${esc(n)}</span>`).join('<i></i>')}
  </div>`;
}

function shell(inner) {
  return `<div class="lock">
    <div class="lock-frame">
      <div class="lock-mark" aria-hidden="true">
        <svg viewBox="0 0 120 120">
          <g stroke="var(--brass)" fill="none" stroke-width="1">
            ${Array.from({ length: 26 }, (_, i) => {
              const t = i / 25;
              const h = 8 + 52 * (t < 0.8 ? t / 0.8 : 0.18);
              return `<line x1="${12 + i * 3.8}" y1="82" x2="${12 + i * 3.8}" y2="${82 - h}" opacity="${0.18 + 0.5 * t}"/>`;
            }).join('')}
          </g>
        </svg>
      </div>
      ${inner}
    </div>
  </div>`;
}

export function render() {
  if (!cryptoSupported()) {
    return {
      lock: true,
      html: shell(`<h1 class="lock-title">Navegador antigo</h1>
        <p class="lock-text">Este aparelho não oferece as funções de criptografia que o app usa para proteger seus dados. Abra em um navegador atualizado (Safari, Chrome ou Firefox recentes).</p>`)
    };
  }
  return hasVault() ? unlockScreen() : setupScreen();
}

function setupScreen() {
  return {
    lock: true,
    html: shell(`
      <div class="lock-eyebrow">Primeira vez neste aparelho</div>
      <h1 class="lock-title">Domínio</h1>
      <p class="lock-text">Escolha a frase de acesso da casa. Ela abre o app e cifra tudo o que for gravado aqui — treinos, medidas, refeições.</p>
      ${roster()}
      <form class="lock-form" autocomplete="off">
        <input type="password" name="pass" placeholder="frase de acesso" autocomplete="new-password" inputmode="text">
        <input type="password" name="confirm" placeholder="repita a frase" autocomplete="new-password">
        <button class="primary block" data-criar>Criar o cofre</button>
      </form>
      <p class="lock-warn">Sem essa frase não há recuperação: nem eu nem ninguém consegue abrir os dados depois. Anote em lugar seguro e exporte um backup de vez em quando.</p>
    `),
    mount(root) {
      const form = root.querySelector('.lock-form');
      const pass = form.querySelector('[name="pass"]');
      const confirm = form.querySelector('[name="confirm"]');

      const submit = async e => {
        e?.preventDefault();
        const value = pass.value;
        if (value.length < 6) return toast('Use pelo menos 6 caracteres.');
        if (value !== confirm.value) return toast('As duas frases não são iguais.');
        const btn = form.querySelector('[data-criar]');
        btn.disabled = true;
        btn.textContent = 'Criando…';
        try {
          await createVault(value);
          toast('Cofre criado.');
        } catch (err) {
          console.error(err);
          btn.disabled = false;
          btn.textContent = 'Criar o cofre';
          toast('Não foi possível criar o cofre.');
        }
      };

      form.addEventListener('submit', submit);
      form.querySelector('[data-criar]').addEventListener('click', submit);
      setTimeout(() => pass.focus(), 350);
    }
  };
}

function unlockScreen() {
  return {
    lock: true,
    html: shell(`
      <div class="lock-eyebrow">Casa trancada</div>
      <h1 class="lock-title">Domínio</h1>
      ${roster()}
      <form class="lock-form" autocomplete="off">
        <input type="password" name="pass" placeholder="frase de acesso" autocomplete="current-password">
        <button class="primary block" data-abrir>Abrir</button>
      </form>
      <p class="lock-note">Os dados deste aparelho estão cifrados. Sem a frase, o app abre vazio.</p>
    `),
    mount(root) {
      const form = root.querySelector('.lock-form');
      const pass = form.querySelector('[name="pass"]');
      const btn = form.querySelector('[data-abrir]');

      const submit = async e => {
        e?.preventDefault();
        if (!pass.value) return;
        btn.disabled = true;
        btn.textContent = 'Abrindo…';
        const ok = await unlockVault(pass.value);
        if (!ok) {
          btn.disabled = false;
          btn.textContent = 'Abrir';
          pass.value = '';
          form.classList.remove('shake');
          void form.offsetWidth;
          form.classList.add('shake');
          toast('Frase incorreta.');
          pass.focus();
        }
      };

      form.addEventListener('submit', submit);
      btn.addEventListener('click', submit);
      setTimeout(() => pass.focus(), 350);
    }
  };
}
