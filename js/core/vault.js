// Cofre local: os dados da casa ficam cifrados no aparelho.
//
// O site é público — qualquer pessoa pode abrir o endereço. O que ninguém
// consegue é ler os dados de vocês sem a frase de acesso: o conteúdo é
// cifrado com AES-GCM, e a chave é derivada da frase por PBKDF2. Sem a
// frase não existe recuperação — nem por mim, nem por ninguém.

const ALGO = 'AES-GCM';
const ITERATIONS = 250_000;

const enc = new TextEncoder();
const dec = new TextDecoder();

const toB64 = buf => btoa(String.fromCharCode(...new Uint8Array(buf)));
const fromB64 = str => Uint8Array.from(atob(str), c => c.charCodeAt(0));

export const supported = () => !!(globalThis.crypto?.subtle);

export async function deriveKey(passphrase, salt) {
  const base = await crypto.subtle.importKey('raw', enc.encode(passphrase), 'PBKDF2', false, ['deriveKey']);
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: ITERATIONS, hash: 'SHA-256' },
    base,
    { name: ALGO, length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

export function newSalt() {
  return crypto.getRandomValues(new Uint8Array(16));
}

export async function seal(data, key, salt) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ct = await crypto.subtle.encrypt({ name: ALGO, iv }, key, enc.encode(JSON.stringify(data)));
  return { v: 1, salt: toB64(salt), iv: toB64(iv), ct: toB64(ct) };
}

export async function open(blob, key) {
  const plain = await crypto.subtle.decrypt(
    { name: ALGO, iv: fromB64(blob.iv) },
    key,
    fromB64(blob.ct)
  );
  return JSON.parse(dec.decode(plain));
}

export const saltOf = blob => fromB64(blob.salt);
