// Atlas anatômico próprio, em SVG.
//
// Substitui as imagens externas por um corpo desenhado aqui: acende o
// músculo-alvo na cor do app, funciona sem internet e cabe dentro de um
// quadro de 40 px sem virar borrão.
//
// Duas vistas — frente e costas — em viewBox 0 0 120 264.

export const VIEW = { FRENTE: 'frente', COSTAS: 'costas' };

// Em que vista cada músculo é mostrado.
export const MUSCLE_VIEW = {
  peito: VIEW.FRENTE,
  ombro_ant: VIEW.FRENTE,
  ombro_lat: VIEW.FRENTE,
  biceps: VIEW.FRENTE,
  antebraco: VIEW.FRENTE,
  core: VIEW.FRENTE,
  quadriceps: VIEW.FRENTE,
  adutores: VIEW.FRENTE,
  panturrilhas: VIEW.COSTAS,
  dorsais: VIEW.COSTAS,
  trapezio: VIEW.COSTAS,
  ombro_post: VIEW.COSTAS,
  triceps: VIEW.COSTAS,
  lombar: VIEW.COSTAS,
  gluteos: VIEW.COSTAS,
  isquiotibiais: VIEW.COSTAS,
  abdutores: VIEW.COSTAS
};

/* ---------- Silhueta ---------- */
// Contorno comum às duas vistas: cabeça, tronco, braços e pernas.
const SILHOUETTE = `
  <ellipse cx="60" cy="19" rx="10.5" ry="13"/>
  <path d="M54,29.5 h12 v9 c-2.5,1.6 -9.5,1.6 -12,0 z"/>
  <path d="M60,38 c-8,0 -14.5,1.5 -19.5,4.5 -3.5,2 -5.5,5.5 -6,10
           l-1.5,13.5 c-0.5,6 0.5,13 2,19 l2.5,13
           c0.5,4 1,8 1,12 l-0.5,10 c0,9 2,15 6,18
           l32,0 c4,-3 6,-9 6,-18 l-0.5,-10 c0,-4 0.5,-8 1,-12
           l2.5,-13 c1.5,-6 2.5,-13 2,-19 l-1.5,-13.5
           c-0.5,-4.5 -2.5,-8 -6,-10 c-5,-3 -11.5,-4.5 -19.5,-4.5 z"/>
  <path d="M34,44.5 c-5,2.5 -8.5,6.5 -9.5,12 l-2,13
           c-1,6 -1,11.5 0,17.5 l2.5,14 c0.5,4 1,8 1,12
           l-1,18 c-0.5,7 0,13 1.5,18 l1.5,7
           c0.5,3 2.5,4 5,3.5 2.5,-0.5 3.5,-2.5 3,-5
           l-1.5,-8 c-0.5,-5 -0.5,-10 0,-15 l1.5,-18
           c0.5,-4 0.5,-8 0,-12 l-2,-14 c-0.5,-6 -0.5,-11.5 0.5,-17.5
           l2,-13 c0.5,-4.5 0,-8 -2.5,-10.5 z"/>
  <path d="M86,44.5 c5,2.5 8.5,6.5 9.5,12 l2,13
           c1,6 1,11.5 0,17.5 l-2.5,14 c-0.5,4 -1,8 -1,12
           l1,18 c0.5,7 0,13 -1.5,18 l-1.5,7
           c-0.5,3 -2.5,4 -5,3.5 -2.5,-0.5 -3.5,-2.5 -3,-5
           l1.5,-8 c0.5,-5 0.5,-10 0,-15 l-1.5,-18
           c-0.5,-4 -0.5,-8 0,-12 l2,-14 c0.5,-6 0.5,-11.5 -0.5,-17.5
           l-2,-13 c-0.5,-4.5 0,-8 2.5,-10.5 z"/>
  <path d="M38.5,137 c-1.5,10.5 -2,22.5 -1.5,34.5 l1.5,17
           c0.5,5 1,9 2,13 l2.5,19 c1,8 1.5,16 1.5,22 l0,10
           c0,2.5 1.5,4 4,4 h4 c2.5,0 4,-1.5 4,-4 l0.5,-10
           c0,-6 0.5,-14 1,-22 l2,-19 c0.5,-4 1,-8 1,-13 l0.5,-17
           c0.5,-12 0.5,-24 0,-34.5 z"/>
  <path d="M81.5,137 c1.5,10.5 2,22.5 1.5,34.5 l-1.5,17
           c-0.5,5 -1,9 -2,13 l-2.5,19 c-1,8 -1.5,16 -1.5,22 l0,10
           c0,2.5 -1.5,4 -4,4 h-4 c-2.5,0 -4,-1.5 -4,-4 l-0.5,-10
           c0,-6 -0.5,-14 -1,-22 l-2,-19 c-0.5,-4 -1,-8 -1,-13 l-0.5,-17
           c-0.5,-12 -0.5,-24 0,-34.5 z"/>
`;

/* ---------- Regiões musculares ---------- */

const FRONT = {
  ombro_ant: `
    <path d="M39,42 c-4.5,2 -7.5,5.5 -8.5,10.5 l-1.5,10 c3,-5.5 7,-9.5 12,-11.5 z"/>
    <path d="M81,42 c4.5,2 7.5,5.5 8.5,10.5 l1.5,10 c-3,-5.5 -7,-9.5 -12,-11.5 z"/>`,
  ombro_lat: `
    <path d="M34,44.5 c-5,2.5 -8.5,6.5 -9.5,12 l-1.6,10.5 c2.5,-8 6.5,-13.5 12,-17 z"/>
    <path d="M86,44.5 c5,2.5 8.5,6.5 9.5,12 l1.6,10.5 c-2.5,-8 -6.5,-13.5 -12,-17 z"/>`,
  peito: `
    <path d="M58.5,46 c-6,0.3 -11.5,1.6 -16,4 -1.5,0.8 -2.2,2 -2.2,3.6
             l0,12 c0,2.4 1.3,4 3.7,5 4.6,1.8 9.6,2.7 15,2.7
             1.3,0 1.8,-0.7 1.8,-2 l0,-23.3 c0,-1.3 -0.5,-2 -1.8,-2 z"/>
    <path d="M61.5,46 c6,0.3 11.5,1.6 16,4 1.5,0.8 2.2,2 2.2,3.6
             l0,12 c0,2.4 -1.3,4 -3.7,5 -4.6,1.8 -9.6,2.7 -15,2.7
             -1.3,0 -1.8,-0.7 -1.8,-2 l0,-23.3 c0,-1.3 0.5,-2 1.8,-2 z"/>`,
  biceps: `
    <path d="M32.5,60 c-3.4,1.6 -5.6,4.4 -6.4,8.4 l-2.2,12.8
             c-0.6,3.4 -0.4,6.2 0.6,8.6 l7.6,-1.2
             c-0.8,-6.6 -0.6,-12.4 0.4,-17.4 z"/>
    <path d="M87.5,60 c3.4,1.6 5.6,4.4 6.4,8.4 l2.2,12.8
             c0.6,3.4 0.4,6.2 -0.6,8.6 l-7.6,-1.2
             c0.8,-6.6 0.6,-12.4 -0.4,-17.4 z"/>`,
  antebraco: `
    <path d="M25.6,94 c0.6,3.4 0.9,6.8 0.8,10.2 l-1,17
             c-0.3,4.6 -0.2,8.8 0.2,12.4 l7.4,-1.4
             c-0.5,-4.4 -0.6,-8.8 -0.3,-13 l1.2,-16.6 z"/>
    <path d="M94.4,94 c-0.6,3.4 -0.9,6.8 -0.8,10.2 l1,17
             c0.3,4.6 0.2,8.8 -0.2,12.4 l-7.4,-1.4
             c0.5,-4.4 0.6,-8.8 0.3,-13 l-1.2,-16.6 z"/>`,
  core: `
    <path d="M60,74.5 c-4.8,0 -9.3,-0.5 -13.5,-1.5 -1.4,-0.3 -2.1,0.4 -2.1,1.9
             l0,25 c0,7 1.4,12.6 4.1,17 2.7,4.3 6.5,6.5 11.5,6.5
             5,0 8.8,-2.2 11.5,-6.5 2.7,-4.4 4.1,-10 4.1,-17
             l0,-25 c0,-1.5 -0.7,-2.2 -2.1,-1.9 -4.2,1 -8.7,1.5 -13.5,1.5 z"/>`,
  quadriceps: `
    <path d="M40,140 c-1.2,10 -1.6,20.5 -1.2,31 l1,14
             c0.4,4.6 1,8.4 2,11.8 3,-14.6 5.4,-28.4 7.2,-41.4
             0.8,-5.6 1.2,-10.8 1.2,-15.4 z"/>
    <path d="M80,140 c1.2,10 1.6,20.5 1.2,31 l-1,14
             c-0.4,4.6 -1,8.4 -2,11.8 -3,-14.6 -5.4,-28.4 -7.2,-41.4
             -0.8,-5.6 -1.2,-10.8 -1.2,-15.4 z"/>`,
  adutores: `
    <path d="M53,140 c-0.5,7.4 0.2,15.2 2,23.4 l5,22 5,-22
             c1.8,-8.2 2.5,-16 2,-23.4 z"/>`
};

const BACK = {
  trapezio: `
    <path d="M60,38 c-6.5,0 -12.2,1.2 -17.2,3.6 l-8.8,9 c4.6,-3 9.6,-5 15,-6
             l0,26.4 c0,1.6 0.8,2.4 2.4,2.4 l17.2,0 c1.6,0 2.4,-0.8 2.4,-2.4
             l0,-26.4 c5.4,1 10.4,3 15,6 l-8.8,-9 c-5,-2.4 -10.7,-3.6 -17.2,-3.6 z"/>`,
  ombro_post: `
    <path d="M36,43.5 c-5,2.4 -8.4,6.4 -9.4,11.8 l-1.6,10.6 c2.8,-8 7,-14 12.6,-17.6 z"/>
    <path d="M84,43.5 c5,2.4 8.4,6.4 9.4,11.8 l1.6,10.6 c-2.8,-8 -7,-14 -12.6,-17.6 z"/>`,
  dorsais: `
    <path d="M47,60 c-4,1.4 -6.5,3.6 -7.6,6.6 -1,3 -0.8,7 0.6,11.8
             l4,13.4 c1.4,4.8 4,8 7.6,9.8 l7.2,3.4 0,-45 z"/>
    <path d="M73,60 c4,1.4 6.5,3.6 7.6,6.6 1,3 0.8,7 -0.6,11.8
             l-4,13.4 c-1.4,4.8 -4,8 -7.6,9.8 l-7.2,3.4 0,-45 z"/>`,
  triceps: `
    <path d="M32,58.5 c-3.6,1.8 -5.9,4.8 -6.7,9 l-2.4,13.8
             c-0.6,3.6 -0.4,6.6 0.6,9.2 l7.8,-1.4
             c-0.9,-7 -0.7,-13.2 0.3,-18.6 z"/>
    <path d="M88,58.5 c3.6,1.8 5.9,4.8 6.7,9 l2.4,13.8
             c0.6,3.6 0.4,6.6 -0.6,9.2 l-7.8,-1.4
             c0.9,-7 0.7,-13.2 -0.3,-18.6 z"/>`,
  antebraco: `
    <path d="M25.6,94 c0.6,3.4 0.9,6.8 0.8,10.2 l-1,17
             c-0.3,4.6 -0.2,8.8 0.2,12.4 l7.4,-1.4
             c-0.5,-4.4 -0.6,-8.8 -0.3,-13 l1.2,-16.6 z"/>
    <path d="M94.4,94 c-0.6,3.4 -0.9,6.8 -0.8,10.2 l1,17
             c0.3,4.6 0.2,8.8 -0.2,12.4 l-7.4,-1.4
             c0.5,-4.4 0.6,-8.8 0.3,-13 l-1.2,-16.6 z"/>`,
  lombar: `
    <path d="M52,97 c-1.5,0.6 -2.2,1.8 -2.2,3.5 l0,14 c0,1.8 0.7,2.8 2.2,3
             l16,0 c1.5,-0.2 2.2,-1.2 2.2,-3 l0,-14 c0,-1.7 -0.7,-2.9 -2.2,-3.5 z"/>`,
  gluteos: `
    <path d="M59,119 c-6,0 -11,1 -15,3 -1.8,0.9 -2.8,2.4 -2.8,4.4 l0,7.6
             c0,4.4 1.9,7.8 5.7,10.3 3.3,2.1 7.3,3.1 12.1,3.1 z"/>
    <path d="M61,119 c6,0 11,1 15,3 1.8,0.9 2.8,2.4 2.8,4.4 l0,7.6
             c0,4.4 -1.9,7.8 -5.7,10.3 -3.3,2.1 -7.3,3.1 -12.1,3.1 z"/>`,
  abdutores: `
    <path d="M41.5,121 c-2.4,1.4 -3.9,3.7 -4.4,7 l-1.1,7.6 c2.4,-5.4 5.4,-9.6 9,-12.6 z"/>
    <path d="M78.5,121 c2.4,1.4 3.9,3.7 4.4,7 l1.1,7.6 c-2.4,-5.4 -5.4,-9.6 -9,-12.6 z"/>`,
  isquiotibiais: `
    <path d="M40.5,148 c-1.2,8.6 -1.6,17.4 -1.2,26 l0.9,13.5
             c0.4,4.2 1,7.8 1.9,11 2.7,-13 5,-25.4 6.7,-37
             0.8,-5.4 1.2,-10.4 1.2,-14.5 z"/>
    <path d="M79.5,148 c1.2,8.6 1.6,17.4 1.2,26 l-0.9,13.5
             c-0.4,4.2 -1,7.8 -1.9,11 -2.7,-13 -5,-25.4 -6.7,-37
             -0.8,-5.4 -1.2,-10.4 -1.2,-14.5 z"/>`,
  panturrilhas: `
    <path d="M41.5,200 c-1,4.4 -1.4,9.2 -1,14 l1.6,14.6
             c0.6,5.4 2,9.4 4.2,12 l8,-1.4
             c-1.6,-6.2 -2.6,-12.4 -3,-18.4 l-1,-14 z"/>
    <path d="M78.5,200 c1,4.4 1.4,9.2 1,14 l-1.6,14.6
             c-0.6,5.4 -2,9.4 -4.2,12 l-8,-1.4
             c1.6,-6.2 2.6,-12.4 3,-18.4 l1,-14 z"/>`
};

const REGIONS = { [VIEW.FRENTE]: FRONT, [VIEW.COSTAS]: BACK };

// Ponto de onde sai a linha de chamada de cada rótulo.
const ANCHOR = {
  peito: [44, 58], ombro_ant: [34, 48], ombro_lat: [28, 58],
  biceps: [29, 72], antebraco: [28, 110], core: [60, 92],
  quadriceps: [46, 160], adutores: [60, 158],
  trapezio: [60, 50], dorsais: [46, 80], ombro_post: [31, 52],
  triceps: [28, 70], lombar: [60, 106], gluteos: [48, 130],
  abdutores: [37, 128], isquiotibiais: [46, 168], panturrilhas: [46, 214]
};

// Nomes curtos o bastante para caber na margem da prancha.
const NOME = {
  peito: 'Peitoral', dorsais: 'Grande dorsal', trapezio: 'Trapézio',
  ombro_ant: 'Deltoide ant.', ombro_lat: 'Deltoide lat.', ombro_post: 'Deltoide post.',
  biceps: 'Bíceps', triceps: 'Tríceps', antebraco: 'Antebraço',
  quadriceps: 'Quadríceps', isquiotibiais: 'Isquiotibiais', gluteos: 'Glúteo máx.',
  abdutores: 'Glúteo méd.', adutores: 'Adutores', panturrilhas: 'Panturrilha',
  core: 'Reto abdominal', lombar: 'Eretores'
};

// Nome por extenso, para a legenda abaixo da prancha.
const NOME_LONGO = {
  ombro_ant: 'Deltoide anterior', ombro_lat: 'Deltoide lateral', ombro_post: 'Deltoide posterior',
  gluteos: 'Glúteo máximo', abdutores: 'Glúteo médio', lombar: 'Eretores da espinha'
};

export const muscleAnatomicalName = key => NOME_LONGO[key] || NOME[key] || key;

/** Só entram na prancha os secundários que aparecem na mesma vista do primário. */
export function visibleSecondary(primary, secondary = []) {
  const view = MUSCLE_VIEW[primary] || VIEW.FRENTE;
  return secondary.filter(k => (MUSCLE_VIEW[k] || VIEW.FRENTE) === view && REGIONS[view][k]);
}

function callout(key, side, tone, ty) {
  const a = ANCHOR[key];
  if (!a) return '';
  const [x, y] = a;
  const endX = side === 'esq' ? -8 : 128;
  const textX = side === 'esq' ? -13 : 133;
  return `<g class="callout">
    <circle cx="${x}" cy="${y}" r="2" fill="${tone}"/>
    <path d="M${x},${y} L${side === 'esq' ? x - 14 : x + 14},${ty} L${endX},${ty}" fill="none"
          stroke="${tone}" stroke-width="0.8" opacity="0.6"/>
    <text x="${textX}" y="${ty + 3.4}" text-anchor="${side === 'esq' ? 'end' : 'start'}"
          fill="${tone}" font-size="9.5" opacity="0.95">${NOME[key] || key}</text>
  </g>`;
}

// Mantém os rótulos na altura do músculo, afastando só o necessário para não colidirem.
function empilhar(itens) {
  const MIN = 19;
  const ordenados = itens.slice().sort((a, b) => a.y - b.y);
  let anterior = -Infinity;
  return ordenados.map(item => {
    const ty = Math.max(item.y, anterior + MIN, 16);
    anterior = ty;
    return { ...item, ty: Math.min(ty, 252) };
  });
}

/**
 * Corpo com o músculo-alvo aceso.
 * tone = cor do destaque; base = cor da silhueta.
 */
export function bodySvg(muscleKey, opts = {}) {
  const {
    tone = 'var(--brass)',
    toneSecondary = 'var(--steel)',
    base = 'currentColor',
    baseOpacity = 0.16,
    lineOpacity = 0.3,
    className = 'anat',
    secondary = [],
    labels = false
  } = opts;

  const view = MUSCLE_VIEW[muscleKey] || VIEW.FRENTE;
  const region = REGIONS[view][muscleKey] || '';
  const label = view === VIEW.COSTAS ? 'costas' : 'frente';
  const sec = labels ? visibleSecondary(muscleKey, secondary) : [];

  // Com rótulos a prancha precisa de margem lateral para o texto.
  const box = labels ? '-112 0 344 268' : '0 0 120 268';

  const pintar = (key, cor, op) => {
    const d = REGIONS[view][key];
    if (!d) return '';
    return `<g fill="${cor}" opacity="${op}">${d}</g>
            <g fill="none" stroke="${cor}" stroke-width="0.8" opacity="${op * 0.55}">${d}</g>`;
  };

  let chamadas = '';
  if (labels) {
    // O alvo fica à esquerda; os auxiliares à direita. Equilibra a prancha.
    const esq = [{ key: muscleKey, cor: tone, y: ANCHOR[muscleKey]?.[1] ?? 60 }];
    const dir = sec.map(k => ({ key: k, cor: toneSecondary, y: ANCHOR[k]?.[1] ?? 60 }));
    chamadas = [
      ...empilhar(esq).map(m => callout(m.key, 'esq', m.cor, m.ty)),
      ...empilhar(dir).map(m => callout(m.key, 'dir', m.cor, m.ty))
    ].join('');
  }

  return `<svg class="${className}" viewBox="${box}" role="img" aria-label="Corpo humano, vista de ${label}, com o músculo-alvo destacado">
    <g fill="${base}" opacity="${baseOpacity}">${SILHOUETTE}</g>
    <g fill="none" stroke="${base}" stroke-width="1" opacity="${lineOpacity}">${SILHOUETTE}</g>
    ${sec.map(k => pintar(k, toneSecondary, 0.55)).join('')}
    ${pintar(muscleKey, tone, 0.92)}
    ${chamadas}
  </svg>`;
}

export function viewLabel(muscleKey) {
  return (MUSCLE_VIEW[muscleKey] || VIEW.FRENTE) === VIEW.COSTAS ? 'costas' : 'frente';
}
