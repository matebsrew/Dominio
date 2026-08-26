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
- Divisão das refeições conforme quantas você faz por dia.

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

### 5. Recuperação
Check-in de 4 perguntas antes de treinar — sono, energia, dor muscular, motivação — que vira um índice
de prontidão e muda a sessão:

- **Alta**: siga as progressões, última série pode ir mais perto da falha.
- **Média**: mantenha as cargas, pare com 3 na reserva, corte a última série dos isolados.
- **Baixa**: ~60% das séries, carga leve, foco em execução.
- **Dor articular**: troca de exercício, sem progressão no dia.

### 6. Corpo
Peso, bioimpedância completa (% gordura, massa muscular, água, gordura visceral, massa óssea) e
circunferências, com média semanal, tendência, projeção até o peso desejado e leitura da direção
de massa magra × massa gorda.

## Painel principal
Treino do dia · calorias e macros · passos e cardio · prontidão · peso e tendência · ritmo do objetivo,
com os avisos acionáveis no topo.

## Instalar no celular
Abra o site publicado no navegador e use **Compartilhar → Adicionar à Tela de Início** (iPhone) ou
**Instalar aplicativo** (Android). Funciona como app, em tela cheia.

## Backup
Ajustes → Backup exporta um arquivo `.json` com todos os perfis e históricos. Faça isso antes de trocar
de aparelho ou limpar o navegador — os dados existem só ali.

## Estrutura
```
js/core/      store (localStorage, perfis, backup) e utilitários
js/data/      exercícios, grupos musculares com MEV/MAV/MRV, tabela de alimentos
js/engine/    energia, ajuste adaptativo, progressão, prontidão, cardio, programa, diário
js/views/     telas
js/components/guia de execução (movimento + atlas)
```

## Créditos e limites
Sequência dos movimentos: Workout Guide (Bryl Lim), arte derivada de Everkinetic — CC BY-SA 4.0.
Atlas anatômico: Wikimedia Commons, conforme a licença de cada arquivo.

As recomendações partem de referências bem estabelecidas de treinamento e nutrição, mas trabalham com
estimativas. Dor persistente, tontura, condição de saúde, gravidez ou uso de medicação pedem
acompanhamento de médico e nutricionista — nenhum cálculo aqui substitui isso.
