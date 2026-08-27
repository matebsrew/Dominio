// Catálogo de exercícios.
//
// primary/secondary   -> chaves de muscles.js (secundário conta como meia série)
// bw                  -> fração do peso corporal que o exercício carrega, para que
//                        barra fixa e flexão entrem na conta de progressão
// pattern             -> usado pelo gerador de programa para montar sessões equilibradas
// equip               -> barra | halter | maquina | cabo | smith | livre | elastico | kettlebell
// slug                -> pasta de imagens do movimento (@bryllim/workout-guide)
// feel/setup/exec/avoid -> conteúdo do guia "como executar"

export const EQUIPMENT_TIERS = {
  academia_completa: ['barra', 'halter', 'maquina', 'cabo', 'smith', 'livre', 'elastico', 'kettlebell'],
  academia_basica: ['barra', 'halter', 'maquina', 'smith', 'livre', 'elastico'],
  halteres_casa: ['halter', 'livre', 'elastico', 'kettlebell'],
  peso_corporal: ['livre', 'elastico']
};

export const EQUIPMENT_LABEL = {
  academia_completa: 'Academia completa (máquinas + cabos)',
  academia_basica: 'Academia básica (pesos livres + algumas máquinas)',
  halteres_casa: 'Casa com halteres/elásticos',
  peso_corporal: 'Só peso corporal'
};

const E = (id, name, o) => ({ id, name, type: 'composto', reps: [8, 12], rest: 120, secondary: [], level: 'iniciante', ...o });

export const EXERCISES = [
  /* ---------------- PEITO ---------------- */
  E('supino-reto-barra', 'Supino Reto com Barra', {
    primary: 'peito', secondary: ['triceps', 'ombro_ant'], pattern: 'peito_horizontal',
    equip: 'barra', slug: 'bench-press', reps: [5, 8], rest: 180, level: 'intermediario',
    feel: 'Peito, principalmente na porção média, com alongamento perto do peito.',
    setup: 'Escápulas retraídas e apoiadas, pés firmes no chão, barra alinhada ao meio do peito.',
    exec: 'Desça controlando até tocar de leve o peito e empurre mantendo os ombros estáveis.',
    avoid: 'Quicar a barra no peito ou soltar as escápulas para ganhar amplitude.'
  }),
  E('supino-reto-halteres', 'Supino Reto com Halteres', {
    primary: 'peito', secondary: ['triceps', 'ombro_ant'], pattern: 'peito_horizontal',
    equip: 'halter', slug: 'dumbbell-bench-press', reps: [6, 10], rest: 150,
    feel: 'Peito, com alongamento maior na descida que na barra.',
    setup: 'Halteres na altura do peito, punhos firmes, escápulas apoiadas.',
    exec: 'Desça até sentir alongamento confortável e empurre juntando levemente os halteres.',
    avoid: 'Descer além do que o ombro tolera sem dor.'
  }),
  E('supino-maquina', 'Supino na Máquina', {
    primary: 'peito', secondary: ['triceps', 'ombro_ant'], pattern: 'peito_horizontal',
    equip: 'maquina', slug: 'machine-chest-press', reps: [8, 12], rest: 120,
    feel: 'Peito, com trajetória guiada — bom para quem está voltando a treinar.',
    setup: 'Ajuste o banco para que as pegadas fiquem na linha do meio do peito.',
    exec: 'Empurre até quase estender e volte controlando até sentir o peito alongar.',
    avoid: 'Levantar os ombros do encosto no final do movimento.'
  }),
  E('supino-inclinado-halteres', 'Supino Inclinado com Halteres', {
    primary: 'peito', secondary: ['ombro_ant', 'triceps'], pattern: 'peito_inclinado',
    equip: 'halter', slug: 'incline-dumbbell-press', reps: [8, 12], rest: 150,
    feel: 'Parte superior do peito, junto à clavícula.',
    setup: 'Banco entre 30º e 45º, pés firmes, escápulas apoiadas.',
    exec: 'Desça na linha da parte alta do peito e empurre em trajetória levemente diagonal.',
    avoid: 'Inclinação muito alta, que transfere o trabalho para o ombro.'
  }),
  E('supino-inclinado-barra', 'Supino Inclinado com Barra', {
    primary: 'peito', secondary: ['ombro_ant', 'triceps'], pattern: 'peito_inclinado',
    equip: 'barra', slug: 'incline-bench-press', reps: [6, 10], rest: 150, level: 'intermediario',
    feel: 'Peitoral superior.',
    setup: 'Banco a 30º, pegada pouco mais larga que os ombros.',
    exec: 'Desça até a parte alta do peito e empurre mantendo os cotovelos a ~45º do tronco.',
    avoid: 'Abrir os cotovelos totalmente na linha dos ombros.'
  }),
  E('crucifixo-cabo', 'Crucifixo no Cabo', {
    primary: 'peito', pattern: 'peito_iso', type: 'isolado',
    equip: 'cabo', slug: 'cable-fly', reps: [10, 14], rest: 150,
    feel: 'Peito esticando na abertura e contraindo ao fechar.',
    setup: 'Um pé à frente, tronco levemente inclinado, cotovelos semiflexionados fixos.',
    exec: 'Abra até alongar sem desconforto e feche cruzando levemente à frente do corpo.',
    avoid: 'Transformar em supino flexionando e estendendo os cotovelos.'
  }),
  E('peck-deck', 'Peck Deck / Voador', {
    primary: 'peito', pattern: 'peito_iso', type: 'isolado',
    equip: 'maquina', slug: 'pec-deck', reps: [10, 14], rest: 150,
    feel: 'Peito na linha do esterno.',
    setup: 'Ajuste o banco para que as mãos fiquem na altura do peito.',
    exec: 'Feche conduzindo pelos cotovelos e volte controlando o alongamento.',
    avoid: 'Encolher os ombros durante a contração.'
  }),
  E('crucifixo-halteres', 'Crucifixo com Halteres', {
    primary: 'peito', pattern: 'peito_iso', type: 'isolado',
    equip: 'halter', slug: 'dumbbell-fly', reps: [10, 14], rest: 150,
    feel: 'Alongamento do peito na descida.',
    setup: 'Deitado, cotovelos levemente flexionados e fixos.',
    exec: 'Abra os braços em arco até a altura do peito e feche contraindo.',
    avoid: 'Descer muito com carga alta — risco no ombro.'
  }),
  E('flexao', 'Flexão de Braço', {
    bw: 0.64, primary: 'peito', secondary: ['triceps', 'ombro_ant', 'core'], pattern: 'peito_horizontal',
    equip: 'livre', slug: 'push-up', reps: [8, 14], rest: 120,
    feel: 'Peito e tríceps, com core estabilizando.',
    setup: 'Mãos pouco mais largas que os ombros, corpo em linha reta.',
    exec: 'Desça até o peito perto do chão e empurre mantendo o quadril alinhado.',
    avoid: 'Deixar o quadril cair ou subir.'
  }),
  E('flexao-inclinada', 'Flexão com Mãos Elevadas', {
    bw: 0.45, primary: 'peito', secondary: ['triceps', 'ombro_ant'], pattern: 'peito_horizontal',
    equip: 'livre', slug: 'incline-push-up', reps: [10, 15], rest: 120,
    feel: 'Peito, com menos carga que a flexão no chão.',
    setup: 'Mãos numa bancada, mesa ou banco firme.',
    exec: 'Desça o peito até perto do apoio e empurre.',
    avoid: 'Apoio instável.'
  }),
  E('mergulho-paralelas', 'Mergulho nas Paralelas', {
    bw: 1.0, primary: 'peito', secondary: ['triceps', 'ombro_ant'], pattern: 'peito_horizontal',
    equip: 'livre', slug: 'chest-dip', reps: [6, 12], rest: 150, level: 'intermediario',
    feel: 'Peito inferior e tríceps.',
    setup: 'Tronco levemente inclinado à frente, ombros longe das orelhas.',
    exec: 'Desça até sentir alongamento no peito e empurre de volta.',
    avoid: 'Descer além do conforto do ombro.'
  }),

  /* ---------------- COSTAS ---------------- */
  E('puxada-pronada', 'Puxada Alta Pronada', {
    primary: 'dorsais', secondary: ['biceps', 'ombro_post'], pattern: 'costas_vertical',
    equip: 'maquina', slug: 'wide-grip-lat-pulldown', reps: [8, 12], rest: 150,
    feel: 'Laterais das costas (grande dorsal), do cotovelo até a axila.',
    setup: 'Coxas travadas, peito aberto, pegada pouco mais larga que os ombros.',
    exec: 'Puxe a barra até a parte alta do peito conduzindo os cotovelos para baixo.',
    avoid: 'Jogar o tronco para trás ou puxar atrás da nuca.'
  }),
  E('puxada-neutra', 'Puxada com Pegada Neutra', {
    primary: 'dorsais', secondary: ['biceps'], pattern: 'costas_vertical',
    equip: 'maquina', slug: 'close-grip-lat-pulldown', reps: [8, 12], rest: 150,
    feel: 'Dorsais, com ombro em posição mais confortável.',
    setup: 'Pegada neutra no triângulo, peito elevado.',
    exec: 'Puxe até o peito e controle a subida até alongar as costas.',
    avoid: 'Encolher os ombros no início da puxada.'
  }),
  E('barra-fixa', 'Barra Fixa', {
    bw: 1.0, primary: 'dorsais', secondary: ['biceps', 'core'], pattern: 'costas_vertical',
    equip: 'livre', slug: 'pull-up', reps: [4, 10], rest: 180, level: 'intermediario',
    feel: 'Dorsais e bíceps.',
    setup: 'Pegada pronada na largura dos ombros, corpo sem balanço.',
    exec: 'Puxe até o queixo passar da barra e desça controlando.',
    avoid: 'Usar impulso de pernas se o objetivo é hipertrofia.'
  }),
  E('barra-fixa-assistida', 'Barra Fixa Assistida', {
    primary: 'dorsais', secondary: ['biceps'], pattern: 'costas_vertical',
    equip: 'maquina', slug: 'assisted-pull-up', reps: [6, 12], rest: 150,
    feel: 'Dorsais, com parte do peso corporal aliviado.',
    setup: 'Ajuste a assistência para conseguir a faixa de repetições com técnica.',
    exec: 'Puxe até o peito e desça controlando toda a amplitude.',
    avoid: 'Assistência tão alta que o exercício perde estímulo.'
  }),
  E('remada-curvada-barra', 'Remada Curvada com Barra', {
    primary: 'dorsais', secondary: ['ombro_post', 'biceps', 'lombar'], pattern: 'costas_horizontal',
    equip: 'barra', slug: 'barbell-row', reps: [6, 10], rest: 180, level: 'intermediario',
    feel: 'Meio das costas e dorsais.',
    setup: 'Quadril para trás, coluna neutra, tronco ~45º.',
    exec: 'Puxe a barra em direção ao umbigo e controle a descida.',
    avoid: 'Arredondar a lombar ou usar impulso de tronco.'
  }),
  E('remada-peito-apoiado', 'Remada com Peito Apoiado', {
    primary: 'dorsais', secondary: ['ombro_post', 'trapezio', 'biceps'], pattern: 'costas_horizontal',
    equip: 'maquina', slug: 'chest-supported-row', reps: [8, 12], rest: 150,
    feel: 'Meio das costas, sem exigir da lombar.',
    setup: 'Peito firme no apoio, ombros soltos.',
    exec: 'Puxe os cotovelos para trás até as escápulas se aproximarem.',
    avoid: 'Tirar o peito do apoio para puxar mais carga.'
  }),
  E('remada-baixa', 'Remada Baixa no Cabo', {
    primary: 'dorsais', secondary: ['ombro_post', 'biceps'], pattern: 'costas_horizontal',
    equip: 'cabo', slug: 'seated-row', reps: [8, 12], rest: 150,
    feel: 'Meio das costas, com alongamento no fim do retorno.',
    setup: 'Joelhos levemente flexionados, tronco na vertical.',
    exec: 'Puxe até o abdômen e volte deixando as escápulas alongarem.',
    avoid: 'Balançar o tronco para frente e para trás.'
  }),
  E('remada-unilateral-halter', 'Remada Unilateral com Halter', {
    primary: 'dorsais', secondary: ['ombro_post', 'biceps'], pattern: 'costas_horizontal',
    equip: 'halter', slug: 'one-arm-dumbbell-row', reps: [8, 12], rest: 120,
    feel: 'Dorsal do lado que trabalha.',
    setup: 'Uma mão e um joelho no banco, coluna neutra.',
    exec: 'Puxe o halter em direção ao quadril e controle a descida.',
    avoid: 'Girar o tronco para levantar mais peso.'
  }),
  E('remada-maquina', 'Remada na Máquina', {
    primary: 'dorsais', secondary: ['ombro_post', 'biceps'], pattern: 'costas_horizontal',
    equip: 'maquina', slug: 'machine-row', reps: [8, 12], rest: 120,
    feel: 'Meio das costas.',
    setup: 'Ajuste o assento para que as pegadas fiquem na linha do abdômen.',
    exec: 'Puxe conduzindo os cotovelos para trás e controle o retorno.',
    avoid: 'Encolher os ombros durante a puxada.'
  }),
  E('remada-invertida', 'Remada Invertida', {
    bw: 0.5, primary: 'dorsais', secondary: ['ombro_post', 'biceps', 'core'], pattern: 'costas_horizontal',
    equip: 'livre', slug: 'inverted-row', reps: [8, 14], rest: 120,
    feel: 'Meio das costas, usando o peso do corpo.',
    setup: 'Barra na altura do quadril, corpo em linha reta.',
    exec: 'Puxe o peito em direção à barra e desça controlando.',
    avoid: 'Deixar o quadril cair.'
  }),
  E('pulldown-braco-reto', 'Pulldown com Braços Estendidos', {
    primary: 'dorsais', pattern: 'costas_iso', type: 'isolado',
    equip: 'cabo', slug: 'straight-arm-pulldown', reps: [10, 14], rest: 150,
    feel: 'Dorsal isolado, sem participação do bíceps.',
    setup: 'Tronco levemente inclinado, braços quase estendidos.',
    exec: 'Leve a barra até as coxas mantendo os cotovelos fixos.',
    avoid: 'Flexionar os cotovelos e virar uma tríceps.'
  }),

  /* ---------------- OMBROS ---------------- */
  E('desenvolvimento-halteres', 'Desenvolvimento com Halteres', {
    primary: 'ombro_ant', secondary: ['ombro_lat', 'triceps'], pattern: 'ombro_press',
    equip: 'halter', slug: 'seated-dumbbell-press', reps: [8, 12], rest: 150,
    feel: 'Ombro, principalmente a porção frontal e lateral.',
    setup: 'Sentado com encosto, abdômen firme, halteres na altura das orelhas.',
    exec: 'Empurre acima da cabeça sem travar bruscamente os cotovelos.',
    avoid: 'Arquear a lombar para empurrar mais carga.'
  }),
  E('desenvolvimento-maquina', 'Desenvolvimento na Máquina', {
    primary: 'ombro_ant', secondary: ['ombro_lat', 'triceps'], pattern: 'ombro_press',
    equip: 'maquina', slug: 'machine-shoulder-press', reps: [8, 12], rest: 120,
    feel: 'Ombros, com trajetória guiada.',
    setup: 'Assento ajustado para as pegadas ficarem na altura dos ombros.',
    exec: 'Empurre para cima e volte controlando até a altura das orelhas.',
    avoid: 'Descer além do conforto do ombro.'
  }),
  E('desenvolvimento-militar', 'Desenvolvimento Militar em Pé', {
    primary: 'ombro_ant', secondary: ['ombro_lat', 'triceps', 'core'], pattern: 'ombro_press',
    equip: 'barra', slug: 'overhead-press', reps: [5, 8], rest: 180, level: 'intermediario',
    feel: 'Ombros e tríceps, com core estabilizando.',
    setup: 'Pés na largura do quadril, glúteo e abdômen contraídos.',
    exec: 'Empurre a barra acima da cabeça passando o rosto e finalize com a barra sobre o meio do corpo.',
    avoid: 'Hiperextender a lombar.'
  }),
  E('elevacao-lateral', 'Elevação Lateral com Halteres', {
    primary: 'ombro_lat', pattern: 'ombro_lateral', type: 'isolado',
    equip: 'halter', slug: 'lateral-raise', reps: [10, 15], rest: 150,
    feel: 'Lateral do ombro — queimação na parte de fora do deltoide.',
    setup: 'Tronco firme, cotovelos levemente flexionados.',
    exec: 'Conduza pelos cotovelos até a altura dos ombros e desça controlando.',
    avoid: 'Usar impulso do tronco ou subir muito acima da linha do ombro.'
  }),
  E('elevacao-lateral-cabo', 'Elevação Lateral no Cabo', {
    primary: 'ombro_lat', pattern: 'ombro_lateral', type: 'isolado',
    equip: 'cabo', slug: 'cable-lateral-raise', reps: [10, 15], rest: 150,
    feel: 'Lateral do ombro com tensão constante em toda a amplitude.',
    setup: 'Polia baixa, cabo cruzando à frente do corpo.',
    exec: 'Eleve até a altura do ombro e volte controlando.',
    avoid: 'Girar o tronco para ajudar.'
  }),
  E('elevacao-lateral-maquina', 'Elevação Lateral na Máquina', {
    primary: 'ombro_lat', pattern: 'ombro_lateral', type: 'isolado',
    equip: 'maquina', slug: 'machine-lateral-raise', reps: [10, 15], rest: 150,
    feel: 'Lateral do ombro, sem precisar estabilizar carga.',
    setup: 'Ajuste o assento para o eixo ficar na altura do ombro.',
    exec: 'Suba até a altura dos ombros e desça controlando.',
    avoid: 'Encolher os ombros.'
  }),
  E('crucifixo-inverso', 'Crucifixo Inverso', {
    primary: 'ombro_post', secondary: ['trapezio'], pattern: 'ombro_posterior', type: 'isolado',
    equip: 'maquina', slug: 'reverse-pec-deck', reps: [10, 15], rest: 150,
    feel: 'Parte de trás do ombro e meio das costas.',
    setup: 'Peito apoiado, braços na altura dos ombros.',
    exec: 'Abra conduzindo pelos cotovelos e volte controlando.',
    avoid: 'Encolher os ombros ou usar impulso.'
  }),
  E('face-pull', 'Face Pull no Cabo', {
    primary: 'ombro_post', secondary: ['trapezio'], pattern: 'ombro_posterior', type: 'isolado',
    equip: 'cabo', slug: 'face-pull', reps: [10, 15], rest: 150,
    feel: 'Ombro posterior e meio das costas — ótimo para saúde do ombro.',
    setup: 'Polia na altura do rosto, corda com pegada neutra.',
    exec: 'Puxe a corda em direção ao rosto abrindo as mãos e girando os ombros para fora.',
    avoid: 'Puxar com carga alta e perder a rotação externa.'
  }),
  E('crucifixo-inverso-halteres', 'Crucifixo Inverso com Halteres', {
    primary: 'ombro_post', secondary: ['trapezio'], pattern: 'ombro_posterior', type: 'isolado',
    equip: 'halter', slug: 'bent-over-rear-delt-raise', reps: [10, 15], rest: 150,
    feel: 'Parte posterior do ombro.',
    setup: 'Tronco inclinado à frente, coluna neutra.',
    exec: 'Abra os braços na linha dos ombros e desça controlando.',
    avoid: 'Levantar o tronco durante a série.'
  }),
  E('encolhimento', 'Encolhimento de Ombros', {
    primary: 'trapezio', pattern: 'trapezio', type: 'isolado',
    equip: 'halter', slug: 'dumbbell-shrug', reps: [10, 15], rest: 150,
    feel: 'Trapézio superior.',
    setup: 'Braços estendidos ao lado do corpo.',
    exec: 'Eleve os ombros em direção às orelhas e desça controlando.',
    avoid: 'Rodar os ombros durante o movimento.'
  }),

  /* ---------------- BRAÇOS ---------------- */
  E('triceps-pulley', 'Tríceps na Polia com Barra', {
    primary: 'triceps', pattern: 'triceps', type: 'isolado',
    equip: 'cabo', slug: 'tricep-pushdown', reps: [10, 15], rest: 150,
    feel: 'Tríceps, principalmente na extensão final.',
    setup: 'Cotovelos junto ao corpo, tronco levemente inclinado.',
    exec: 'Estenda os cotovelos até o fim e volte controlando.',
    avoid: 'Afastar os cotovelos do corpo e transformar em supino.'
  }),
  E('triceps-corda', 'Tríceps Corda', {
    primary: 'triceps', pattern: 'triceps', type: 'isolado',
    equip: 'cabo', slug: 'rope-tricep-pushdown', reps: [10, 15], rest: 150,
    feel: 'Tríceps, com contração forte ao abrir a corda no final.',
    setup: 'Cotovelos fixos ao lado do corpo.',
    exec: 'Estenda abrindo levemente a corda e volte controlando.',
    avoid: 'Usar o tronco para empurrar.'
  }),
  E('triceps-testa', 'Tríceps Testa', {
    primary: 'triceps', pattern: 'triceps', type: 'isolado',
    equip: 'barra', slug: 'skull-crusher', reps: [8, 12], rest: 150,
    feel: 'Tríceps, com alongamento na cabeça longa.',
    setup: 'Deitado, braços apontados levemente para trás.',
    exec: 'Flexione os cotovelos levando a barra até perto da testa e estenda.',
    avoid: 'Mover os ombros — só os cotovelos trabalham.'
  }),
  E('triceps-frances', 'Tríceps Francês com Halter', {
    primary: 'triceps', pattern: 'triceps', type: 'isolado',
    equip: 'halter', slug: 'overhead-tricep-extension', reps: [10, 15], rest: 150,
    feel: 'Alongamento da cabeça longa do tríceps.',
    setup: 'Halter acima da cabeça, cotovelos apontando para cima.',
    exec: 'Desça atrás da cabeça e estenda sem mover os cotovelos.',
    avoid: 'Abrir os cotovelos para os lados.'
  }),
  E('mergulho-banco', 'Mergulho no Banco', {
    bw: 0.55, primary: 'triceps', secondary: ['peito', 'ombro_ant'], pattern: 'triceps',
    equip: 'livre', slug: 'bench-dip', reps: [8, 14], rest: 120,
    feel: 'Tríceps.',
    setup: 'Mãos na borda do banco, quadril próximo ao apoio.',
    exec: 'Desça flexionando os cotovelos e empurre de volta.',
    avoid: 'Descer demais forçando o ombro à frente.'
  }),
  E('rosca-direta', 'Rosca Direta', {
    primary: 'biceps', secondary: ['antebraco'], pattern: 'biceps', type: 'isolado',
    equip: 'barra', slug: 'ez-bar-curl', reps: [8, 12], rest: 150,
    feel: 'Bíceps.',
    setup: 'Cotovelos próximos ao corpo, punhos firmes.',
    exec: 'Suba sem balançar o tronco e desça controlando toda a amplitude.',
    avoid: 'Jogar o tronco para trás para levantar a carga.'
  }),
  E('rosca-alternada', 'Rosca Alternada com Halteres', {
    primary: 'biceps', secondary: ['antebraco'], pattern: 'biceps', type: 'isolado',
    equip: 'halter', slug: 'bicep-curl', reps: [10, 15], rest: 150,
    feel: 'Bíceps de cada braço.',
    setup: 'Braços ao lado do corpo, cotovelos fixos.',
    exec: 'Suba girando levemente o punho e desça controlando.',
    avoid: 'Balançar os halteres.'
  }),
  E('rosca-martelo', 'Rosca Martelo', {
    primary: 'biceps', secondary: ['antebraco'], pattern: 'biceps', type: 'isolado',
    equip: 'halter', slug: 'hammer-curl', reps: [10, 15], rest: 150,
    feel: 'Bíceps e antebraço (braquial e braquiorradial).',
    setup: 'Pegada neutra, cotovelos junto ao corpo.',
    exec: 'Suba mantendo o punho neutro e desça controlando.',
    avoid: 'Usar impulso do quadril.'
  }),
  E('rosca-inclinada', 'Rosca Inclinada com Halteres', {
    primary: 'biceps', pattern: 'biceps', type: 'isolado',
    equip: 'halter', slug: 'incline-dumbbell-curl', reps: [10, 15], rest: 150,
    feel: 'Bíceps com maior alongamento na parte de baixo.',
    setup: 'Banco a ~60º, braços pendendo livremente.',
    exec: 'Suba sem mover os ombros e desça até estender.',
    avoid: 'Levar os cotovelos à frente.'
  }),
  E('rosca-cabo', 'Rosca no Cabo', {
    primary: 'biceps', pattern: 'biceps', type: 'isolado',
    equip: 'cabo', slug: 'cable-curl', reps: [10, 15], rest: 150,
    feel: 'Bíceps com tensão constante.',
    setup: 'Polia baixa, cotovelos ao lado do corpo.',
    exec: 'Flexione até o topo e volte controlando.',
    avoid: 'Recuar o tronco no fim da série.'
  }),

  /* ---------------- PERNAS ---------------- */
  E('agachamento-livre', 'Agachamento Livre', {
    primary: 'quadriceps', secondary: ['gluteos', 'isquiotibiais', 'lombar', 'core'], pattern: 'quad_composto',
    equip: 'barra', slug: 'squat', reps: [5, 8], rest: 210, level: 'intermediario',
    feel: 'Quadríceps e glúteos.',
    setup: 'Pés na largura dos ombros, ponta levemente para fora, core firme.',
    exec: 'Desça controlando até a profundidade que mantém a lombar neutra e suba empurrando o chão.',
    avoid: 'Joelhos colapsando para dentro ou lombar arredondando no fundo.'
  }),
  E('agachamento-smith', 'Agachamento no Smith', {
    primary: 'quadriceps', secondary: ['gluteos'], pattern: 'quad_composto',
    equip: 'smith', slug: 'smith-machine-squat', reps: [8, 12], rest: 180,
    feel: 'Quadríceps, com trajetória guiada.',
    setup: 'Pés um pouco à frente da barra, coluna neutra.',
    exec: 'Desça até coxa próxima ao paralelo e suba empurrando pelo pé inteiro.',
    avoid: 'Pés muito à frente a ponto de tirar o apoio do calcanhar.'
  }),
  E('hack-squat', 'Hack Squat', {
    primary: 'quadriceps', secondary: ['gluteos'], pattern: 'quad_composto',
    equip: 'maquina', slug: 'hack-squat', reps: [8, 12], rest: 180,
    feel: 'Quadríceps, forte alongamento na descida.',
    setup: 'Costas apoiadas, pés na metade da plataforma.',
    exec: 'Desça controlando e empurre sem travar bruscamente os joelhos.',
    avoid: 'Tirar a lombar do apoio no fundo.'
  }),
  E('leg-press', 'Leg Press 45º', {
    primary: 'quadriceps', secondary: ['gluteos', 'isquiotibiais'], pattern: 'quad_composto',
    equip: 'maquina', slug: 'leg-press', reps: [10, 15], rest: 150,
    feel: 'Quadríceps e glúteos.',
    setup: 'Lombar e quadril apoiados, pés na largura dos ombros.',
    exec: 'Desça até onde o quadril permanece apoiado e empurre pelo pé inteiro.',
    avoid: 'Deixar o quadril enrolar para cima no fundo.'
  }),
  E('agachamento-goblet', 'Agachamento Goblet', {
    primary: 'quadriceps', secondary: ['gluteos', 'core'], pattern: 'quad_composto',
    equip: 'halter', slug: 'goblet-squat', reps: [10, 15], rest: 120,
    feel: 'Quadríceps e glúteos, com o core ativo.',
    setup: 'Halter junto ao peito, cotovelos por dentro dos joelhos.',
    exec: 'Desça mantendo o peito alto e suba empurrando o chão.',
    avoid: 'Inclinar demais o tronco à frente.'
  }),
  E('agachamento-livre-corporal', 'Agachamento com Peso Corporal', {
    bw: 0.7, primary: 'quadriceps', secondary: ['gluteos'], pattern: 'quad_composto',
    equip: 'livre', slug: 'bodyweight-squat', reps: [10, 15], rest: 120,
    feel: 'Quadríceps e glúteos.',
    setup: 'Pés na largura dos ombros, braços à frente para equilíbrio.',
    exec: 'Desça até o paralelo e suba controlando.',
    avoid: 'Levantar os calcanhares do chão.'
  }),
  E('bulgaro', 'Agachamento Búlgaro', {
    bw: 0.75, primary: 'quadriceps', secondary: ['gluteos', 'abdutores'], pattern: 'quad_composto',
    equip: 'halter', slug: 'bulgarian-split-squat', reps: [8, 12], rest: 150, level: 'intermediario',
    feel: 'Quadríceps e glúteo da perna da frente.',
    setup: 'Pé de trás no banco, tronco levemente inclinado para focar glúteo.',
    exec: 'Desça vertical e suba empurrando pelo pé da frente.',
    avoid: 'Passo curto demais, que sobrecarrega o joelho.'
  }),
  E('afundo', 'Afundo / Passada', {
    bw: 0.7, primary: 'quadriceps', secondary: ['gluteos'], pattern: 'quad_composto',
    equip: 'halter', slug: 'walking-lunge', reps: [10, 15], rest: 120,
    feel: 'Quadríceps e glúteos.',
    setup: 'Tronco ereto, passo firme.',
    exec: 'Desça o joelho de trás em direção ao chão e volte empurrando o pé da frente.',
    avoid: 'Joelho da frente colapsando para dentro.'
  }),
  E('cadeira-extensora', 'Cadeira Extensora', {
    primary: 'quadriceps', pattern: 'quad_iso', type: 'isolado',
    equip: 'maquina', slug: 'leg-extension', reps: [10, 15], rest: 150,
    feel: 'Quadríceps isolado, queimação na frente da coxa.',
    setup: 'Eixo da máquina alinhado ao joelho.',
    exec: 'Estenda até quase o fim e desça controlando.',
    avoid: 'Chutar o peso e soltar na volta.'
  }),
  E('stiff', 'Stiff / Levantamento Romeno', {
    primary: 'isquiotibiais', secondary: ['gluteos', 'lombar'], pattern: 'posterior_composto',
    equip: 'barra', slug: 'romanian-deadlift', reps: [6, 10], rest: 180, level: 'intermediario',
    feel: 'Alongamento na parte de trás da coxa.',
    setup: 'Joelhos levemente flexionados, coluna neutra, barra rente às pernas.',
    exec: 'Empurre o quadril para trás descendo a barra e volte contraindo os glúteos.',
    avoid: 'Arredondar a lombar ou descer além do alongamento confortável.'
  }),
  E('stiff-halteres', 'Stiff com Halteres', {
    primary: 'isquiotibiais', secondary: ['gluteos'], pattern: 'posterior_composto',
    equip: 'halter', slug: 'dumbbell-romanian-deadlift', reps: [8, 12], rest: 150,
    feel: 'Posterior de coxa e glúteos.',
    setup: 'Halteres à frente das coxas, joelhos semiflexionados.',
    exec: 'Quadril para trás, desça até alongar e volte apertando o glúteo.',
    avoid: 'Afastar os halteres do corpo.'
  }),
  E('levantamento-terra', 'Levantamento Terra', {
    primary: 'isquiotibiais', secondary: ['gluteos', 'lombar', 'trapezio', 'dorsais'], pattern: 'posterior_composto',
    equip: 'barra', slug: 'deadlift', reps: [3, 6], rest: 240, level: 'avancado',
    feel: 'Cadeia posterior inteira.',
    setup: 'Barra sobre o meio do pé, coluna neutra, escápulas sobre a barra.',
    exec: 'Empurre o chão e estenda quadril e joelhos juntos, terminando ereto.',
    avoid: 'Arredondar a lombar em qualquer ponto.'
  }),
  E('mesa-flexora', 'Mesa Flexora', {
    primary: 'isquiotibiais', pattern: 'posterior_iso', type: 'isolado',
    equip: 'maquina', slug: 'lying-leg-curl', reps: [8, 12], rest: 150,
    feel: 'Parte de trás da coxa.',
    setup: 'Quadril colado no apoio, eixo alinhado ao joelho.',
    exec: 'Flexione até o fim e controle a volta.',
    avoid: 'Levantar o quadril para completar a repetição.'
  }),
  E('cadeira-flexora', 'Cadeira Flexora', {
    primary: 'isquiotibiais', pattern: 'posterior_iso', type: 'isolado',
    equip: 'maquina', slug: 'seated-leg-curl', reps: [10, 15], rest: 150,
    feel: 'Posterior de coxa, com alongamento maior que na mesa flexora.',
    setup: 'Coxas travadas, costas apoiadas.',
    exec: 'Flexione os joelhos e volte controlando.',
    avoid: 'Tirar o quadril do assento.'
  }),
  E('flexora-nordica', 'Flexora Nórdica', {
    bw: 0.6, primary: 'isquiotibiais', pattern: 'posterior_iso', type: 'isolado',
    equip: 'livre', slug: 'nordic-hamstring-curl', reps: [5, 8], rest: 120, level: 'avancado',
    feel: 'Posterior de coxa em contração excêntrica intensa.',
    setup: 'Joelhos apoiados, tornozelos travados, corpo em linha.',
    exec: 'Desça o mais devagar possível e volte com ajuda das mãos.',
    avoid: 'Dobrar o quadril para facilitar.'
  }),
  E('hip-thrust', 'Hip Thrust', {
    primary: 'gluteos', secondary: ['isquiotibiais'], pattern: 'gluteo',
    equip: 'barra', slug: 'hip-thrust', reps: [8, 12], rest: 150,
    feel: 'Glúteos, com contração forte no topo.',
    setup: 'Parte alta das costas no banco, pés firmes, queixo levemente para dentro.',
    exec: 'Suba até tronco e coxas alinhados e desça controlando.',
    avoid: 'Hiperestender a lombar no topo.'
  }),
  E('elevacao-pelvica', 'Elevação Pélvica no Solo', {
    bw: 0.45, primary: 'gluteos', secondary: ['isquiotibiais'], pattern: 'gluteo',
    equip: 'livre', slug: 'glute-bridge', reps: [10, 15], rest: 120,
    feel: 'Glúteos.',
    setup: 'Costas no chão, pés próximos ao quadril.',
    exec: 'Suba o quadril até alinhar tronco e coxas apertando o glúteo.',
    avoid: 'Empurrar com a lombar em vez do glúteo.'
  }),
  E('cable-pull-through', 'Pull Through no Cabo', {
    primary: 'gluteos', secondary: ['isquiotibiais'], pattern: 'gluteo',
    equip: 'cabo', slug: 'cable-pull-through', reps: [10, 14], rest: 120,
    feel: 'Glúteos e posterior, padrão de quadril sem carga na coluna.',
    setup: 'De costas para a polia baixa, corda entre as pernas.',
    exec: 'Empurre o quadril para trás e volte estendendo com o glúteo.',
    avoid: 'Puxar com os braços.'
  }),
  E('abducao-maquina', 'Abdução de Quadril na Máquina', {
    primary: 'abdutores', secondary: ['gluteos'], pattern: 'abdutor', type: 'isolado',
    equip: 'maquina', slug: 'hip-abduction-machine', reps: [10, 15], rest: 150,
    feel: 'Lateral do quadril (glúteo médio).',
    setup: 'Tronco levemente inclinado à frente para focar o glúteo médio.',
    exec: 'Abra as pernas contra a resistência e volte controlando.',
    avoid: 'Usar impulso do tronco.'
  }),
  E('aducao-maquina', 'Adução de Quadril na Máquina', {
    primary: 'adutores', pattern: 'adutor', type: 'isolado',
    equip: 'maquina', slug: 'hip-adduction-machine', reps: [10, 15], rest: 150,
    feel: 'Parte interna da coxa.',
    setup: 'Costas apoiadas, amplitude confortável.',
    exec: 'Feche as pernas e volte controlando o alongamento.',
    avoid: 'Abrir além do alongamento confortável.'
  }),
  E('panturrilha-em-pe', 'Panturrilha em Pé', {
    primary: 'panturrilhas', pattern: 'panturrilha', type: 'isolado',
    equip: 'maquina', slug: 'standing-calf-raise', reps: [8, 12], rest: 150,
    feel: 'Panturrilha (gastrocnêmio), alongando embaixo.',
    setup: 'Ponta dos pés na plataforma, joelhos quase estendidos.',
    exec: 'Desça o calcanhar até alongar e suba até o topo com pausa.',
    avoid: 'Quicar usando o tendão em vez do músculo.'
  }),
  E('panturrilha-sentado', 'Panturrilha Sentado', {
    primary: 'panturrilhas', pattern: 'panturrilha', type: 'isolado',
    equip: 'maquina', slug: 'seated-calf-raise', reps: [10, 15], rest: 150,
    feel: 'Panturrilha profunda (sóleo), com joelho flexionado.',
    setup: 'Joelhos a 90º sob o apoio.',
    exec: 'Suba até o topo e desça alongando.',
    avoid: 'Amplitude curta.'
  }),
  E('panturrilha-livre', 'Panturrilha em Pé sem Máquina', {
    bw: 0.9, primary: 'panturrilhas', pattern: 'panturrilha', type: 'isolado',
    equip: 'livre', slug: 'calf-raise', reps: [12, 18], rest: 120,
    feel: 'Panturrilha.',
    setup: 'De pé, ponta dos pés num degrau se possível.',
    exec: 'Suba até a ponta dos pés e desça alongando.',
    avoid: 'Movimento rápido sem controle.'
  }),

  /* ---------------- CORE E LOMBAR ---------------- */
  E('abdominal-polia', 'Abdominal na Polia Alta', {
    primary: 'core', pattern: 'core', type: 'isolado',
    equip: 'cabo', slug: 'cable-crunch', reps: [10, 15], rest: 150,
    feel: 'Reto abdominal encurtando.',
    setup: 'Ajoelhado de frente para a polia, corda ao lado da cabeça.',
    exec: 'Aproxime as costelas da pelve flexionando a coluna.',
    avoid: 'Puxar com braços e dorsal.'
  }),
  E('prancha', 'Prancha', {
    primary: 'core', pattern: 'core', type: 'isolado',
    equip: 'livre', slug: 'plank', reps: [30, 60], rest: 120,
    feel: 'Abdômen inteiro sustentando o tronco.',
    setup: 'Antebraços no chão, corpo em linha reta.',
    exec: 'Mantenha o tempo contraindo abdômen e glúteos (registre segundos no campo de reps).',
    avoid: 'Deixar o quadril cair.'
  }),
  E('elevacao-pernas', 'Elevação de Pernas Suspenso', {
    bw: 0.35, primary: 'core', pattern: 'core', type: 'isolado',
    equip: 'livre', slug: 'hanging-knee-raise', reps: [8, 14], rest: 150,
    feel: 'Abdômen inferior.',
    setup: 'Pendurado na barra, ombros ativos.',
    exec: 'Leve os joelhos ao peito enrolando a pelve e desça controlando.',
    avoid: 'Balançar o corpo.'
  }),
  E('abdominal-solo', 'Abdominal no Solo', {
    primary: 'core', pattern: 'core', type: 'isolado',
    equip: 'livre', slug: 'crunch', reps: [10, 15], rest: 120,
    feel: 'Reto abdominal.',
    setup: 'Costas no chão, joelhos flexionados.',
    exec: 'Enrole a coluna aproximando as costelas da pelve.',
    avoid: 'Puxar a cabeça com as mãos.'
  }),
  E('pallof-press', 'Pallof Press', {
    primary: 'core', pattern: 'core', type: 'isolado',
    equip: 'cabo', slug: 'pallof-press', reps: [10, 15], rest: 120,
    feel: 'Core resistindo à rotação.',
    setup: 'De lado para a polia, mãos no peito.',
    exec: 'Estenda os braços à frente sem deixar o tronco girar.',
    avoid: 'Girar o quadril.'
  }),
  E('extensao-lombar', 'Extensão Lombar (Banco Romano)', {
    primary: 'lombar', secondary: ['gluteos', 'isquiotibiais'], pattern: 'lombar', type: 'isolado',
    equip: 'maquina', slug: 'back-extension', reps: [10, 15], rest: 120,
    feel: 'Lombar e glúteos.',
    setup: 'Quadril na borda do apoio, coluna neutra.',
    exec: 'Desça controlando e suba até alinhar o tronco.',
    avoid: 'Hiperestender a coluna no topo.'
  }),
  E('bird-dog', 'Bird Dog', {
    primary: 'lombar', secondary: ['core', 'gluteos'], pattern: 'lombar', type: 'isolado',
    equip: 'livre', slug: 'bird-dog', reps: [8, 12], rest: 120,
    feel: 'Estabilizadores da coluna.',
    setup: 'Quatro apoios, coluna neutra.',
    exec: 'Estenda braço e perna opostos sem girar o quadril.',
    avoid: 'Arquear a lombar.'
  })
];

export const BY_ID = Object.fromEntries(EXERCISES.map(e => [e.id, e]));

export function findByName(name) {
  return EXERCISES.find(e => e.name.toLowerCase() === String(name).toLowerCase()) || null;
}

export function movementFrames(slug) {
  if (!slug) return [];
  return [1, 2, 3].map(n => `https://cdn.jsdelivr.net/npm/@bryllim/workout-guide@1.0.0/assets/${slug}/frame-${n}.png`);
}

export function availableFor(equipmentTier) {
  const allowed = new Set(EQUIPMENT_TIERS[equipmentTier] || EQUIPMENT_TIERS.academia_completa);
  return EXERCISES.filter(e => allowed.has(e.equip));
}

// Alternativa para quando o aparelho está ocupado ou o movimento incomoda.
export function alternatives(exerciseId, equipmentTier) {
  const base = BY_ID[exerciseId];
  if (!base) return [];
  return availableFor(equipmentTier)
    .filter(e => e.id !== base.id && (e.pattern === base.pattern || e.primary === base.primary))
    .slice(0, 4);
}
