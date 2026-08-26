# Domínio — treinador da família

App web (PWA) para treino, alimentação, cardio e recuperação, com **um perfil separado para cada pessoa da casa**.
Não é uma ficha digital: o app lê o que você registra e responde — sugere carga, ajusta calorias e segura o treino quando a recuperação não está boa.

Tudo fica salvo **no próprio aparelho**. Sem conta, sem servidor, sem nuvem.

## Como funciona

### 1. Perfis
Na primeira abertura o app pergunta **"Quem vai treinar?"**. Cada perfil guarda nome, idade, sexo, altura,
peso, objetivo, experiência, dias disponíveis, tempo por sessão, equipamento, nível de atividade,
cardio atual, peso desejado, preferência alimentar e refeições por dia — e tem treino, comida, cardio,
medidas e histórico completamente separados.

Alguém de 1,90 m / 92 kg buscando hipertrofia e alguém de 1,60 m / 58 kg buscando saúde recebem
programas, calorias e cardio diferentes, porque os cálculos partem dos dados de cada um.

### 2. Treino
O treino não é a mesma coisa toda semana. Ele roda em **mesociclos** de 5 a 6 semanas:
a semana 1 começa no volume mínimo eficaz, o volume sobe a cada semana conforme a
recuperação, o esforço aperta (RIR-alvo cai de 3–4 para 0–1) e a última semana é de
**deload** — metade das séries e das repetições, com a carga caindo na segunda metade
da semana. Depois disso começa um novo ciclo, de volta ao volume mínimo com mais força.

Quem decide se o volume sobe é você, sem precisar entender de programação: depois de
cada treino o app pergunta três coisas sobre cada músculo — conexão, pump e o quanto
ficou fatigado. É o RSM de Israetel. Estímulo baixo soma 2 séries na semana seguinte;
no ponto, soma 1; alto demais, mantém; músculo ainda dolorido na sessão seguinte, corta.

Para quem está começando, o app **estima a primeira carga** de cada exercício a partir do
peso corporal, sexo, idade e experiência, e monta as **séries de aproximação** (rampa de
aquecimento) antes da primeira série valendo.

O programa é montado a partir dos dias disponíveis (corpo inteiro 2–3x, upper/lower 4–5x, push-pull-legs 6x),
do tempo por sessão e do equipamento. A seleção de exercícios busca cobrir o **volume mínimo semanal (MEV)**
de cada músculo; o que não couber no tempo disponível é mostrado como lacuna, sem fingir que cobriu.

A cada exercício o app calcula a sugestão do dia por **dupla progressão regulada por RIR**:

```
Supino Reto com Barra
Última sessão: 80 kg × 8 / 8 / 8   RIR 2 / 2 / 1
Sugestão de hoje: subir para 82,5 kg
Meta: 5–8 reps · RIR 1–2
```

- Fechou o topo da faixa com repetições em reserva → sobe a carga.
- Dentro da faixa → soma repetições antes de subir peso.
- Duas séries abaixo do mínimo → reduz ~8% e reconstrói.
- Sem ganho de força em 3 sessões → avisa a estagnação e sugere o que revisar.

O volume semanal por músculo é comparado com as faixas de referência **MEV / MAV / MRV**
(séries indiretas contam metade), e o app propõe **deload** quando dois sinais aparecem juntos:
volume acima do máximo recuperável, prontidão baixa, força caindo em vários exercícios ou 6+ semanas acumulando.

**Como executar**: cada exercício abre o movimento em 3 quadros (início → meio → final) ao lado do
**atlas anatômico** do músculo-alvo — dá para ver ao mesmo tempo como mover o corpo e onde deveria sentir —
mais posição inicial, execução e o erro a evitar.

### 3. Alimentação
As metas saem dos dados da pessoa e depois **aprendem com a evolução**:

- Gasto: TMB por Mifflin-St Jeor (ou Katch-McArdle quando há % de gordura da bioimpedância),
  multiplicador de rotina, mais o gasto estimado do treino e do cardio calculados à parte.
- Meta calórica: superávit ou déficit conforme o objetivo e a experiência, com piso de segurança.
- Macros: proteína 1,6–2,3 g/kg conforme objetivo, gordura mínima protegida, carboidrato no restante,
  fibra 14 g por 1000 kcal e meta de água por peso + treino.
- Divisão das refeições conforme quantas você faz por dia, com a faixa de proteína por
  refeição (entre 1/8 e 1/4 do total do dia) que o corpo realmente aproveita.
- **Ciclagem**: dia de treino recebe mais carboidrato, dia de descanso menos, mantendo a
  média da semana igual à meta.
- **Para fechar o dia**: com o que falta de caloria e proteína, o app monta combinações
  reais de comida e registra com um toque.
- Refeições favoritas para repetir o que você já come sempre.
- Os **poucos suplementos com evidência que se sustenta**, com dose e para que servem —
  e o aviso de que o resto, na prática, não muda nada.

O ajuste automático compara a **média semanal de peso** com o ritmo-alvo do objetivo:

```
Peso médio há 3 semanas: 79,8 kg
Semana passada: 80,0 kg
Esta semana: 80,0 kg
→ Ganho travado. Some 150 kcal/dia, quase tudo em carboidrato, e reavalie em 2 semanas.
```

Só sugere com pelo menos 3 pesagens por semana em 2 semanas seguidas, limita o ajuste a 250 kcal por vez
e espera 2 semanas entre ajustes. Registro de refeição com busca em tabela de alimentos ou entrada manual.

### 4. Cardio
Prescrito como ferramenta de saúde e apoio ao treino, não como programa à parte: dose semanal conforme
objetivo (150–300 min/semana para saúde, conforme a OMS; bem menos em hipertrofia), meta de passos,
faixa de zona 2 em batimentos e distribuição na semana **longe dos treinos pesados de perna**,
para não cair no efeito interferência.

### 5. Recuperação e dor
Check-in de 4 perguntas antes de treinar — sono, energia, dor muscular, motivação — que vira um índice
de prontidão e muda a sessão:

- **Alta**: siga as progressões, última série pode ir mais perto da falha.
- **Média**: mantenha as cargas, pare com 3 na reserva, corte a última série dos isolados.
- **Baixa**: ~60% das séries, carga leve, foco em execução.
- **Dor articular**: você marca a articulação (ombro, cotovelo, punho, lombar, quadril,
  joelho, tornozelo) e o app mostra quais exercícios do dia passam por ali, sugere
  substituições que poupam a articulação e reduz o volume da sessão. Dor não é motivo
  para parar de treinar — é motivo para trocar o movimento.

### 6. Corpo
Peso, bioimpedância completa (% gordura, massa muscular, água, gordura visceral, massa óssea) e
circunferências, com média semanal, tendência, projeção até o peso desejado e leitura da direção
de massa magra × massa gorda.

### 7. O treinador
Duas telas fazem o papel de quem acompanha:

- **Briefing do dia**, no topo do painel: os quatro recados que importam agora, em ordem
  de prioridade — dor ativa, deload em curso, feedback pendente, treino do dia, proteína
  atrasada, pesagens faltando, ajuste de calorias, sono curto.
- **Revisão da semana**: nota de aderência (treinos, calorias, proteína, passos, cardio,
  pesagens, sono, prontidão), volume de cada músculo contra o alvo daquela semana do
  mesociclo, e as **decisões para a semana seguinte** — o que sobe, o que desce e por quê.
  Na primeira semana, em vez de cobrar aderência que ainda não existe, ela vira um
  roteiro do que fazer primeiro.

## Painel principal
Briefing do treinador · mesociclo · treino do dia · calorias e macros · passos e cardio ·
prontidão · peso e tendência · ritmo do objetivo.

## Instalar no celular
Abra o site publicado no navegador e use **Compartilhar → Adicionar à Tela de Início** (iPhone) ou
**Instalar aplicativo** (Android). Funciona como app, em tela cheia.

## Backup
Ajustes → Backup exporta um arquivo `.json` com todos os perfis e históricos. Faça isso antes de trocar
de aparelho ou limpar o navegador — os dados existem só ali.

## Perfis da família
Na primeira abertura há um atalho que cria os quatro perfis de uma vez, já com altura,
peso e objetivo calibrados — nome e idade ficam editáveis antes de confirmar.

## Estrutura
```
js/core/      store (localStorage, perfis, backup) e utilitários
js/data/      exercícios, músculos com MEV/MAV/MRV, alimentos, suplementos,
              estresse articular por exercício, modelos de perfil da família
js/engine/    energia, ajuste adaptativo, progressão, mesociclo, feedback de estímulo,
              carga inicial e aquecimento, prontidão, cardio, programa, diário, treinador
js/views/     telas
js/components/guia de execução (movimento + atlas)
```

## Créditos e limites
O conteúdo de treino e nutrição segue as referências de *Scientific Principles of
Hypertrophy Training* (Israetel, Hoffmann, Davis, Feather), *The Renaissance Diet 2.0*,
*Science and Development of Muscle Hypertrophy* (Schoenfeld) e as recomendações de
atividade física da OMS.

Sequência dos movimentos: Workout Guide (Bryl Lim), arte derivada de Everkinetic — CC BY-SA 4.0.
Atlas anatômico: Wikimedia Commons, conforme a licença de cada arquivo.

As recomendações partem de referências bem estabelecidas de treinamento e nutrição, mas trabalham com
estimativas. Dor persistente, tontura, condição de saúde, gravidez ou uso de medicação pedem
acompanhamento de médico e nutricionista — nenhum cálculo aqui substitui isso.
