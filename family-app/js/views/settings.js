// Ajustes do perfil, backup e privacidade.

import { esc, num, toast, download, today } from '../core/util.js';
import { activeProfile, updateProfile, pdata, setProgram, deleteProfile, exportAll, importAll, profiles, updateSettings, hasLegacyData, importLegacyInto } from '../core/store.js';
import { generateProgram } from '../engine/program.js';
import { ACTIVITY_LABEL, GOAL_LABEL, calorieTarget, macros } from '../engine/energy.js';
import { EQUIPMENT_LABEL } from '../data/exercises.js';
import { field, selectHtml, confirmSheet, coach } from '../ui.js';
import { targetsFor } from '../engine/diary.js';

export function render({ profile, go }) {
  const data = pdata();
  const targets = targetsFor(profile, data);
  const isDeload = !!data.settings.deloadUntil && data.settings.deloadUntil >= today();

  return {
    title: 'Ajustes',
    subtitle: esc(profile.name),
    html: `
      <form id="perfil" class="card">
        <div class="eyebrow mb">Perfil</div>
        ${field('Nome', `<input name="name" value="${esc(profile.name)}">`)}
        <div class="grid-2">
          ${field('Idade', `<input type="number" name="age" value="${profile.age ?? ''}">`)}
          ${field('Altura (cm)', `<input type="number" name="heightCm" value="${profile.heightCm ?? ''}">`)}
        </div>
        <div class="grid-2">
          ${field('Peso (kg)', `<input type="number" step="0.1" name="weightKg" value="${profile.weightKg ?? ''}">`)}
          ${field('Peso desejado (kg)', `<input type="number" step="0.1" name="targetWeightKg" value="${profile.targetWeightKg ?? ''}">`)}
        </div>
        ${field('Objetivo', selectHtml('goal', Object.entries(GOAL_LABEL).map(([value, label]) => ({ value, label })), profile.goal))}
        ${field('Experiência', selectHtml('experience', [
          { value: 'iniciante', label: 'Iniciante' },
          { value: 'intermediario', label: 'Intermediário' },
          { value: 'avancado', label: 'Avançado' }
        ], profile.experience))}
        <div class="grid-2">
          ${field('Dias por semana', selectHtml('daysPerWeek', [2, 3, 4, 5, 6], profile.daysPerWeek))}
          ${field('Minutos por sessão', selectHtml('sessionMin', [30, 45, 60, 75, 90], profile.sessionMin))}
        </div>
        ${field('Equipamento', selectHtml('equipment', Object.entries(EQUIPMENT_LABEL).map(([value, label]) => ({ value, label })), profile.equipment))}
        ${field('Atividade no dia a dia', selectHtml('activityLevel', Object.entries(ACTIVITY_LABEL).map(([value, label]) => ({ value, label })), profile.activityLevel))}
        ${field('Cardio atual', selectHtml('cardioLevel', [
          { value: 'nenhum', label: 'Nenhum' }, { value: 'pouco', label: 'Às vezes' },
          { value: 'regular', label: 'Regular' }, { value: 'alto', label: 'Bastante' }
        ], profile.cardioLevel))}
        <div class="grid-2">
          ${field('Preferência alimentar', selectHtml('dietPreference', [
            { value: 'onivoro', label: 'Sem restrição' }, { value: 'vegetariano', label: 'Vegetariano' },
            { value: 'vegano', label: 'Vegano' }, { value: 'low_carb', label: 'Low carb' },
            { value: 'sem_lactose', label: 'Sem lactose' }
          ], profile.dietPreference))}
          ${field('Refeições por dia', selectHtml('mealsPerDay', [2, 3, 4, 5, 6], profile.mealsPerDay))}
        </div>
        <button class="primary block" data-salvar>Salvar perfil</button>
        <p class="dim tiny mt">Mudanças em dias, tempo ou equipamento pedem um novo programa — o botão abaixo refaz o split.</p>
      </form>

      ${targets ? `<div class="card">
        <div class="eyebrow">Suas metas hoje</div>
        <div class="stat-line"><span class="muted">Gasto estimado</span><b>${targets.energy.maintenance} kcal</b></div>
        <div class="stat-line"><span class="muted">Meta calórica</span><b>${targets.macros.kcal} kcal</b></div>
        <div class="stat-line"><span class="muted">Proteína</span><b>${targets.macros.protein} g (${targets.macros.proteinPerKg} g/kg)</b></div>
        <div class="stat-line"><span class="muted">Carboidrato / Gordura</span><b>${targets.macros.carbs} g / ${targets.macros.fat} g</b></div>
        <div class="stat-line"><span class="muted">Método de cálculo</span><b>${esc(targets.energy.method)}</b></div>
      </div>` : ''}

      <div class="card">
        <div class="eyebrow">Treino</div>
        <div class="stat-line"><span class="muted">Programa atual</span><b>${esc(data.program?.split || '—')}</b></div>
        <div class="stat-line"><span class="muted">Semana do mesociclo</span><b>${data.settings.mesoWeek || 1}</b></div>
        <div class="stat-line"><span class="muted">Deload</span><b>${isDeload ? `até ${data.settings.deloadUntil}` : 'não'}</b></div>
        <button class="block mt" data-regerar>Refazer programa</button>
        ${isDeload ? '<button class="link block" data-cancelar-deload>Encerrar deload agora</button>' : ''}
      </div>

      <div class="card">
        <div class="eyebrow">Backup</div>
        <p class="muted">Tudo fica salvo apenas neste aparelho, sem conta e sem servidor. Exporte antes de trocar de celular ou limpar o navegador.</p>
        <div class="grid-2">
          <button data-exportar>Exportar backup</button>
          <button data-importar-btn>Importar backup</button>
        </div>
        <input type="file" id="importFile" accept=".json,application/json" class="hidden">
        ${hasLegacyData() ? '<button class="link block mt" data-legacy>Importar treinos do app anterior</button>' : ''}
      </div>

      <div class="card">
        <div class="eyebrow">Perfis</div>
        <p class="muted">${profiles().length} perfil${profiles().length > 1 ? 's' : ''} neste aparelho.</p>
        <button class="block" data-trocar>Trocar de perfil</button>
        <button class="block mt" data-novo>Criar novo perfil</button>
        <button class="danger block mt" data-apagar>Apagar o perfil ${esc(profile.name)}</button>
      </div>

      ${coach('Sobre as recomendações',
        'O app usa referências de treinamento e nutrição bem estabelecidas, mas trabalha com estimativas. Dor persistente, tontura, condição de saúde, gravidez ou uso de medicação pedem acompanhamento de médico e nutricionista — nenhum cálculo aqui substitui isso.', 'warn')}`,

    mount(root) {
      root.querySelector('[data-salvar]').addEventListener('click', e => {
        e.preventDefault();
        const form = root.querySelector('#perfil');
        const fields = {};
        form.querySelectorAll('input[name], select[name]').forEach(el => {
          fields[el.name] = el.type === 'number' ? num(el.value) : el.value;
        });
        ['daysPerWeek', 'sessionMin', 'mealsPerDay'].forEach(k => { fields[k] = +fields[k]; });
        if (!fields.name?.trim()) return toast('O nome não pode ficar vazio.');
        updateProfile(profile.id, fields);
        toast('Perfil atualizado.');
      });

      root.querySelector('[data-regerar]').addEventListener('click', async () => {
        const ok = await confirmSheet('Refazer o programa?', 'O split é remontado com seus dados atuais. O histórico continua intacto.', 'Refazer');
        if (!ok) return;
        setProgram(generateProgram(activeProfile()));
        toast('Programa atualizado.');
      });

      root.querySelector('[data-cancelar-deload]')?.addEventListener('click', () => {
        updateSettings({ deloadUntil: null });
        toast('Deload encerrado.');
      });

      root.querySelector('[data-exportar]').addEventListener('click', () => {
        download(`dominio-backup-${today()}.json`, exportAll());
        toast('Backup exportado.');
      });

      const fileInput = root.querySelector('#importFile');
      root.querySelector('[data-importar-btn]').addEventListener('click', () => fileInput.click());
      fileInput.addEventListener('change', async () => {
        const file = fileInput.files[0];
        if (!file) return;
        const ok = await confirmSheet('Importar backup?', 'Os dados atuais deste aparelho serão substituídos pelos do arquivo.', 'Importar');
        if (!ok) return;
        try {
          importAll(await file.text());
          toast('Backup importado.');
          go('/perfis');
        } catch {
          toast('Arquivo de backup inválido.');
        }
      });

      root.querySelector('[data-legacy]')?.addEventListener('click', () => {
        const n = importLegacyInto(profile.id);
        toast(n ? `${n} treinos importados.` : 'Nada novo para importar.');
      });

      root.querySelector('[data-trocar]').addEventListener('click', () => go('/perfis'));
      root.querySelector('[data-novo]').addEventListener('click', () => go('/novo'));
      root.querySelector('[data-apagar]').addEventListener('click', async () => {
        const ok = await confirmSheet(`Apagar ${profile.name}?`,
          'Todos os treinos, refeições, pesagens e medidas deste perfil serão perdidos. Exporte um backup antes se quiser guardar.', 'Apagar tudo');
        if (!ok) return;
        deleteProfile(profile.id);
        go('/perfis');
      });
    }
  };
}
