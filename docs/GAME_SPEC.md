# Especificação do Jogo — versão 1.0

Documento de referência única. Qualquer pessoa (ou IA) que for continuar o projeto deve
ler este arquivo antes de tocar no código.

---

## 1. Identidade do projeto

| Campo | Valor |
|---|---|
| Nome de trabalho | Jogo de Cartas — Mesa Compartilhada |
| Tema | Nenhuma narrativa fixa; os naipes carregam a identidade visual |
| Naipes | coração, ouro, paus, espada |
| Baralho | 2 × 52 cartas, sem curinga = 104 cartas |
| Jogadores | 2 a 4 |
| Duração alvo | 15–30 min (diminui com mais jogadores) |
| Público | Jovens e adultos que gostam de raciocínio e percepção |
| Plataforma | Navegador; instalável em celular/tablet como PWA |
| Objetivo do projeto | Portfólio de estudante de Análise e Desenvolvimento de Sistemas |
| Estado | v0.1 — modo local completo; IA planejada |

**Frase que define o jogo:** um jogo de percepção sob pressão — o jogador precisa
enxergar, antes que o tempo acabe, qual recombinação da mesa libera a sua mão.

---

## 2. Objetivo e condições de vitória

- **Objetivo:** ficar sem nenhuma carta na mão.
- **Vitória imediata:** ao jogar a última carta, a partida termina e o jogador vence.
- **Fim por monte vazio:** se o monte acabar e o jogador da vez não puder comprar,
  a partida termina e vence quem tiver **menos cartas na mão**.
- Empate em quantidade de cartas: a partida é declarada empate e uma nova rodada
  começa (comportamento padrão da v0.1: o desempate pega o primeiro jogador na ordem).

---

## 3. Preparação

1. Embaralhar os dois baralhos juntos.
2. Distribuir **9 cartas** por jogador, uma por vez, no sentido horário.
3. O restante forma o **monte de compra** (oculto).
4. Não há descarte separado: cartas jogadas vão para a mesa como combinações.
5. O jogador que começa a primeira rodada: o primeiro da ordem da mesa.
   Nas rodadas seguintes, ver a seção 8.

---

## 4. Combinações válidas

Mínimo de **3 cartas** em toda combinação.

### 4.1 Sequência
- Mesmo naipe;
- valores consecutivos;
- sem cartas repetidas.

Exemplos: `A,2,3` de espada · `7,8,9` de ouro · `J,Q,K` de paus.

### 4.2 Grupo (trinca ou mais)
- Mesmo valor;
- naipes diferentes entre si.

Exemplos: `K` de ouro + `K` de paus + `K` de coração.
Com dois baralhos existem no máximo 4 cartas de mesmo valor com naipes distintos.

### 4.3 O As
- Vale como **1** (antes do 2) e como **14** (depois do K).
- `A,2,3` e `J,Q,K,A` são ambas sequências válidas.
- Uma carta física representa apenas uma posição por vez; não funciona como ponte
  entre duas combinações.

### 4.4 O que NÃO é combinação válida
- 1 ou 2 cartas;
- sequência com naipes misturados;
- sequência com buraco (`2,4,5`);
- grupo com dois naipes iguais;
- carta solta na mesa.

---

## 5. A mesa

- **Mesa única e compartilhada.** Não existe área de jogador.
- Tudo que é baixado é **público e visível** para todos.
- Qualquer jogador pode encaixar ou remanejar cartas de qualquer combinação,
  respeitando as regras de validade.
- As mãos são **ocultas**. A única informação pública sobre a mão é a **quantidade**
  de cartas.

---

## 6. O turno

Na sua vez:

1. **Jogar** — quantas combinações/encaixes/remanejos conseguir, desde que a mesa
   permaneça válida em cada movimento.
2. **Comprar** — opcional, no máximo **1 carta por turno**. Se comprar e a carta
   servir, pode jogá-la imediatamente, no mesmo turno.
3. **Passar** — encerra a vez.

Regra da compra obrigatória: se o jogador não tem nenhuma jogada legal disponível,
ele **deve** comprar 1 carta. Se depois da compra ainda não houver jogada, a vez passa.

Sentido do jogo: **horário**.

---

## 7. Fases da partida

### 7.1 Fase travada (abertura)
Ativa enquanto **pelo menos um jogador não tiver baixado** a primeira combinação.

Permitido:
- baixar combinações de 3 ou mais cartas (sequência ou grupo).

Proibido:
- encaixar carta solta em combinação existente;
- remanejar cartas entre combinações.

### 7.2 Fase livre (mesa aberta)
Ativa quando **todos os jogadores já baixaram** ao menos uma combinação.

Permitido:
- encaixar cartas da mão em qualquer combinação da mesa;
- remanejar cartas entre combinações;
- baixar novas combinações.

### 7.3 Regra de ouro da mesa
Em **todo movimento**, cada combinação da mesa precisa continuar válida com
**no mínimo 3 cartas**. Nenhuma carta pode ficar solta.

Consequência: para retirar uma carta de uma combinação, é preciso que a sobra
continue sendo uma combinação válida.

| Situação | Pode retirar? |
|---|---|
| `A,2,3,4` de espada, retirar o `A` | Sim (`2,3,4` continua válida) |
| `A,2,3` de espada, retirar o `A` | Não (sobrariam 2 cartas) |
| `K,K,K`, retirar um `K` | Não (sobrariam 2 cartas) |
| `A,2,3,4,5`, retirar o `3` | Não (quebraria a sequência) |

---

## 8. Rodadas e ordem de início

- A partida é uma sequência de rodadas independentes.
- **Quem começa a próxima rodada é o jogador seguinte ao vencedor, no sentido horário.**
- Exemplo com a mesa `Você → Laila → Laís → Esmeralda`:

| Vencedor da rodada | Quem começa a próxima |
|---|---|
| Você | Laila |
| Laila | Laís |
| Laís | Esmeralda |
| Esmeralda | Você |

Essa regra foi escolhida por ser puramente posicional: não depende de contagem
de cartas e distribui o privilégio de abrir a rodada.

---

## 9. Relógio de turno (opcional)

- Desligado por padrão.
- Opções: 30 s, 60 s, 120 s. Padrão sugerido: 60 s.
- Deve ser usado apenas com concordância de todos os jogadores.
- Comportamento em caso de estouro do tempo (a definir na v0.2): a recomendação é
  passar a vez automaticamente e aplicar a compra obrigatória.

---

## 10. Interface e experiência

- Tela 1 — **Lobby**: número de jogadores, nomes editáveis, relógio opcional, regras.
- Tela 2 — **Mesa**: jogador da vez em destaque, placar de cartas por jogador,
  mesa com combinações, mão com rolagem horizontal, botões Comprar / Baixar / Passar.
- Feedback imediato de jogada inválida, explicando o motivo em linguagem natural.
- Alvo de toque mínimo: 44 px. Layout mobile-first, com suporte a tablet e desktop.

---

## 11. Modelo de dados

```js
// Carta
{ id: 'espada-1-0', rank: 1, suit: 'espada', copyIndex: 0 }

// Jogador
{ id: 'p0', name: 'Você', hand: Card[], hasLaidDown: boolean, connected: boolean }

// Estado da partida
{
  phase: 'playing' | 'finished',
  players: Player[],
  deck: Card[],
  tableau: Card[][],     // lista de combinações
  discard: Card[],
  turnIndex: number,
  winnerId: string | null,
  turnSeconds: number | null,
  round: number
}
```

---

## 12. Contrato das ações da engine

Toda ação devolve `{ ok, state, error?, events? }` e **nunca lança exceção** para a
interface.

| Ação | Assinatura | Pré-condições |
|---|---|---|
| Comprar | `draw(state)` | fase de jogo; monte com carta (senão encerra por menor mão) |
| Baixar | `layDown(state, playerId, cardIds)` | é a vez; cartas na mão; combinação válida |
| Encaixar | `appendToCombination(state, playerId, cardId, index)` | é a vez; mesa aberta; encaixe válido |
| Recombinar | `recombine(state, playerId, cardId, from, to)` | é a vez; mesa aberta; origem e destino válidos |
| Passar | `passTurn(state, playerId)` | é a vez |

---

## 13. Casos de borda já resolvidos

1. Comprar com o monte vazio encerra a partida por menor número de cartas.
2. Ação fora do próprio turno é recusada e não altera o estado.
3. Jogada inválida não altera o estado — a interface mostra apenas o erro.
4. Zerar a mão com o último encaixe também é vitória.
5. O monte não é recomposto: acabou, acabou.
6. Cartas da mesa podem ser remanejadas mesmo que o jogador não tenha baixado antes,
   desde que a mesa já esteja aberta (todos baixaram).

---

## 14. Decisões em aberto (para a próxima versão)

- [ ] Penalidade por estouro do relógio de turno.
- [ ] Critério de desempate quando dois jogadores têm o mesmo número de cartas.
- [ ] Se o jogador pode encaixar carta antes de ter baixado sua própria combinação
      (hoje: ele pode, assim que a mesa está aberta).
- [ ] Limite de tempo para a fase travada, evitando rodadas que não abrem.
- [ ] Persistência de placar entre rodadas.

---

## 15. Especificação da IA (próxima etapa)

Objetivo: um oponente que jogue de forma plausível, não perfeita.

Níveis sugeridos:
1. **Fácil** — joga a primeira combinação válida que encontrar; nunca remaneja.
2. **Médio** — avalia encaixes simples e baixa assim que possível; faz um remanejamento
   por turno quando ele libera uma carta da mão.
3. **Difícil** — busca em profundidade limitada (2–3 movimentos), priorizando
   remanejamentos que reduzam a mão; avalia o risco de abrir a mesa para os outros.

Contrato sugerido: `chooseMove(state, playerId) → Action`
Comparar contra a engine real, sem duplicar regra.

---

## 16. Vocabulário do projeto

| Termo | Significado |
|---|---|
| Baixar | colocar a primeira combinação na mesa |
| Mesa aberta | todos já baixaram ao menos uma vez |
| Recombinação / remanejo | mover carta entre combinações da mesa |
| Combinação | sequência ou grupo de 3+ cartas |
| Regra de ouro | toda combinação na mesa precisa manter 3+ cartas válidas |
