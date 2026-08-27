// Persistência local. Tudo fica no aparelho — nada sai para servidor algum.

import { uid, today, dateKey, weekStart } from './util.js';
import * as vault from './vault.js';

const VAULT = 'dominio.vault.v1';
const LEGACY_PLAIN = 'dominio.state.v1';   // versão anterior, sem cifra
const LEGACY_DATA = 'treinoV4Data';
const LEGACY_SETTINGS = 'treinoV4Settings';

const listeners = new Set();

function emptyProfileData() {
  return {
    sessions: [],      // treinos concluídos
    checkins: [],      // check-ins de prontidão
    body: [],          // peso, bioimpedância e medidas
    feedback: [],      // RSM pós-treino por músculo
    nutrition: {},     // dateKey -> { meals: [], water, notes }
    activity: {},      // dateKey -> { steps, cardio: [] }
    program: null,     // programa gerado
    settings: {
      kcalOffset: 0, mesoWeek: 1, weekTag: null, deloadUntil: null, deloadStart: null,
      lastAdjust: null, volumeBias: {}, pain: {}, favorites: []
    }
  };
}

function blankState() {
  return { version: 2, activeProfileId: null, profiles: [], data: {} };
}

let state = blankState();
let cryptoKey = null;
let salt = null;
let writeChain = Promise.resolve();

function migrate(loaded) {
  const s = { ...blankState(), ...loaded };
  s.profiles = Array.isArray(s.profiles) ? s.profiles : [];
  s.data = s.data && typeof s.data === 'object' ? s.data : {};
  for (const p of s.profiles) {
    const base = emptyProfileData();
    s.data[p.id] = { ...base, ...(s.data[p.id] || {}) };
    s.data[p.id].settings = { ...base.settings, ...(s.data[p.id].settings || {}) };
    s.data[p.id].feedback = s.data[p.id].feedback || [];
  }
  return s;
}

/* ---------- Cofre ---------- */

export const hasVault = () => !!localStorage.getItem(VAULT);
export const isUnlocked = () => !!cryptoKey;
export const cryptoSupported = () => vault.supported();

function readVault() {
  try { return JSON.parse(localStorage.getItem(VAULT) || 'null'); } catch { return null; }
}

/** Cria o cofre com a frase escolhida, trazendo dados antigos se existirem. */
export async function createVault(passphrase) {
  salt = vault.newSalt();
  cryptoKey = await vault.deriveKey(passphrase, salt);

  let seed = blankState();
  try {
    const plain = JSON.parse(localStorage.getItem(LEGACY_PLAIN) || 'null');
    if (plain && Array.isArray(plain.profiles)) seed = plain;
  } catch { /* ignora */ }

  state = migrate(seed);
  await writeVault();
  try { localStorage.removeItem(LEGACY_PLAIN); } catch { /* ignora */ }
  listeners.forEach(fn => fn(state));
}

/** Abre o cofre. Devolve false se a frase estiver errada. */
export async function unlockVault(passphrase) {
  const blob = readVault();
  if (!blob) return false;
  try {
    const s = vault.saltOf(blob);
    const key = await vault.deriveKey(passphrase, s);
    const data = await vault.open(blob, key);
    cryptoKey = key;
    salt = s;
    state = migrate(data);
    listeners.forEach(fn => fn(state));
    return true;
  } catch {
    return false;
  }
}

export function lockVault() {
  cryptoKey = null;
  salt = null;
  state = blankState();
  listeners.forEach(fn => fn(state));
}

export async function changePassphrase(current, next) {
  const ok = await unlockVault(current);
  if (!ok) return false;
  const snapshot = state;
  salt = vault.newSalt();
  cryptoKey = await vault.deriveKey(next, salt);
  state = snapshot;
  await writeVault();
  return true;
}

async function writeVault() {
  if (!cryptoKey) return;
  const blob = await vault.seal(state, cryptoKey, salt);
  localStorage.setItem(VAULT, JSON.stringify(blob));
}

export function persist() {
  listeners.forEach(fn => fn(state));
  if (!cryptoKey) return;
  // As escritas são encadeadas: a última a entrar é a última a gravar.
  writeChain = writeChain.then(writeVault).catch(err => console.error('Falha ao gravar:', err));
}

export function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export const getState = () => state;

export const profiles = () => state.profiles;

export function profile(id = state.activeProfileId) {
  return state.profiles.find(p => p.id === id) || null;
}

export const activeProfile = () => profile(state.activeProfileId);

export function setActive(id) {
  state.activeProfileId = id;
  persist();
}

export function pdata(id = state.activeProfileId) {
  if (!id) return emptyProfileData();
  if (!state.data[id]) state.data[id] = emptyProfileData();
  return state.data[id];
}

export function createProfile(fields) {
  const p = { id: uid(), createdAt: Date.now(), ...fields };
  state.profiles.push(p);
  state.data[p.id] = emptyProfileData();
  state.activeProfileId = p.id;
  persist();
  return p;
}

export function updateProfile(id, fields) {
  const p = profile(id);
  if (!p) return null;
  Object.assign(p, fields, { updatedAt: Date.now() });
  persist();
  return p;
}

export function deleteProfile(id) {
  state.profiles = state.profiles.filter(p => p.id !== id);
  delete state.data[id];
  if (state.activeProfileId === id) state.activeProfileId = state.profiles[0]?.id || null;
  persist();
}

/* ---------- Escritas de domínio ---------- */

export function saveSession(session) {
  const d = pdata();
  d.sessions.push({ id: uid(), ts: Date.now(), date: today(), ...session });
  d.sessions.sort((a, b) => b.ts - a.ts);
  bumpMesoWeek(d);
  persist();
}

// Conta as semanas seguidas acumulando volume — usado na decisão de deload.
function bumpMesoWeek(d) {
  const current = weekStart(today());
  if (d.settings.weekTag === current) return;
  const deloading = d.settings.deloadUntil && d.settings.deloadUntil >= today();
  d.settings.weekTag = current;
  d.settings.mesoWeek = deloading ? 1 : (d.settings.mesoWeek || 0) + 1;
}

export function deleteSession(id) {
  const d = pdata();
  d.sessions = d.sessions.filter(s => s.id !== id);
  persist();
}

export function saveCheckin(entry) {
  const d = pdata();
  const date = entry.date || today();
  d.checkins = d.checkins.filter(c => c.date !== date);
  d.checkins.push({ ...entry, date, ts: Date.now() });
  d.checkins.sort((a, b) => (a.date < b.date ? 1 : -1));
  persist();
}

export function deleteCheckin(date = today()) {
  const d = pdata();
  d.checkins = d.checkins.filter(c => c.date !== date);
  persist();
}

export function checkinFor(date = today()) {
  return pdata().checkins.find(c => c.date === date) || null;
}

export function saveBody(entry) {
  const d = pdata();
  const date = entry.date || today();
  const existing = d.body.find(b => b.date === date);
  if (existing) Object.assign(existing, entry, { date });
  else d.body.push({ ...entry, date });
  d.body.sort((a, b) => (a.date < b.date ? 1 : -1));
  const latestWeight = d.body[0]?.weight;
  const p = activeProfile();
  if (p && Number.isFinite(latestWeight)) p.weightKg = latestWeight;
  persist();
}

export function nutritionDay(date = today()) {
  const d = pdata();
  if (!d.nutrition[date]) d.nutrition[date] = { meals: [], water: 0 };
  return d.nutrition[date];
}

export function addMeal(date, meal) {
  const day = nutritionDay(date);
  day.meals.push({ id: uid(), ts: Date.now(), ...meal });
  persist();
}

export function removeMeal(date, id) {
  const day = nutritionDay(date);
  day.meals = day.meals.filter(m => m.id !== id);
  persist();
}

export function setWater(date, ml) {
  nutritionDay(date).water = Math.max(0, ml);
  persist();
}

export function activityDay(date = today()) {
  const d = pdata();
  if (!d.activity[date]) d.activity[date] = { steps: null, cardio: [] };
  return d.activity[date];
}

export function setSteps(date, steps) {
  activityDay(date).steps = steps;
  persist();
}

export function addCardio(date, entry) {
  activityDay(date).cardio.push({ id: uid(), ...entry });
  persist();
}

export function removeCardio(date, id) {
  const day = activityDay(date);
  day.cardio = day.cardio.filter(c => c.id !== id);
  persist();
}

export function saveFeedback(entry) {
  const d = pdata();
  d.feedback = (d.feedback || []).filter(f => !(f.date === entry.date && f.muscle === entry.muscle));
  d.feedback.push({ ...entry, ts: Date.now() });
  d.feedback.sort((a, b) => (a.date < b.date ? 1 : -1));
  persist();
}

export function applyVolumeBias(map) {
  const d = pdata();
  d.settings.volumeBias = { ...(d.settings.volumeBias || {}), ...map };
  persist();
}

export function setPain(regions) {
  const d = pdata();
  d.settings.pain = regions || {};
  persist();
}

export function saveFavoriteMeal(meal) {
  const d = pdata();
  d.settings.favorites = d.settings.favorites || [];
  if (d.settings.favorites.some(f => f.name === meal.name)) return;
  d.settings.favorites.unshift({ ...meal, id: uid() });
  d.settings.favorites = d.settings.favorites.slice(0, 20);
  persist();
}

export function removeFavoriteMeal(id) {
  const d = pdata();
  d.settings.favorites = (d.settings.favorites || []).filter(f => f.id !== id);
  persist();
}

export function setProgram(program) {
  pdata().program = program;
  persist();
}

// Troca definitiva de um exercício no programa (não só na sessão do dia) —
// usada na revisão de fim de mesociclo, quando um exercício estagnou ou dói.
export function swapProgramExercise(oldId, newExercise) {
  const d = pdata();
  if (!d.program) return;
  for (const day of d.program.days) {
    day.exercises = day.exercises.map(ex => ex.id === oldId
      ? { ...ex, id: newExercise.id, name: newExercise.name, primary: newExercise.primary,
          secondary: newExercise.secondary, pattern: newExercise.pattern, type: newExercise.type,
          reps: newExercise.reps, rest: newExercise.rest }
      : ex);
  }
  persist();
}

export function updateSettings(fields) {
  Object.assign(pdata().settings, fields);
  persist();
}

/* ---------- Backup ---------- */

export function exportAll() {
  return JSON.stringify({ app: 'dominio', exportedAt: new Date().toISOString(), state }, null, 2);
}

export function importAll(json) {
  const parsed = JSON.parse(json);
  const incoming = parsed.state || parsed;
  if (!incoming || !Array.isArray(incoming.profiles)) throw new Error('Backup inválido');
  state = migrate(incoming);
  persist();
}

/* ---------- Migração do app antigo (Treino V4) ---------- */

export function legacyRecords() {
  try {
    const raw = JSON.parse(localStorage.getItem(LEGACY_DATA) || '[]');
    return Array.isArray(raw) ? raw : [];
  } catch {
    return [];
  }
}

export function hasLegacyData() {
  return legacyRecords().length > 0;
}

// Agrupa os registros antigos (um por exercício) em sessões do novo formato.
export function importLegacyInto(profileId) {
  const records = legacyRecords();
  if (!records.length) return 0;
  const d = pdata(profileId);
  const groups = new Map();
  for (const r of records) {
    const date = dateKey(new Date(r.ts));
    const key = `${date}|${r.workout}`;
    if (!groups.has(key)) groups.set(key, { ts: r.ts, date, day: r.workout, exercises: [], legacy: true });
    groups.get(key).exercises.push({
      name: r.exercise,
      target: r.target,
      sets: (r.sets || []).map(s => ({ kg: s.kg, reps: s.reps, rir: s.rir }))
    });
  }
  const imported = [...groups.values()].map(g => ({ id: uid(), ...g }));
  const known = new Set(d.sessions.filter(s => s.legacy).map(s => `${s.date}|${s.day}`));
  const fresh = imported.filter(s => !known.has(`${s.date}|${s.day}`));
  d.sessions.push(...fresh);
  d.sessions.sort((a, b) => b.ts - a.ts);
  try { localStorage.setItem(LEGACY_SETTINGS + '.imported', '1'); } catch { /* ignora */ }
  persist();
  return fresh.length;
}

export function resetAll() {
  state = blankState();
  persist();
}
