/**
 * engine.js — O JUIZ DA PARTIDA.
 *
 * Aqui ficam as AÇÕES do jogo: comprar, baixar, encaixar, remover, passar a vez.
 * Toda ação:
 *   1. valida se é legal naquele momento;
 *   2. devolve { state, ok, error?, events? } — nunca lança erro para o usuário.
 *
 * Isso deixa a interface simples: ela chama a ação e mostra o resultado.
 */

import {
  classifyCombination,
  validateTableau,
  canLayDown,
  canRemoveFromCombination,
  insertionOptions,
  isTableOpen,
  winnerByFewestCards,
  MIN_COMBINATION,
} from './rules.js';
import {
  PHASE,
  currentPlayer,
  nextTurnIndex,
  updatePlayer,
} from './gameState.js';

/**
 * Padrão importante do projeto: TODA ação devolve o MESMO formato.
 *   { ok: true,  state: novoEstado, events: [...] }  -> jogada aceita
 *   { ok: false, state: estadoAtual, error: 'texto' } -> jogada recusada
 *
 * Por que isso é bom? A tela não precisa saber se deu certo do jeito que for:
 * ela olha `ok` e escolhe o que mostrar. Sem try/catch espalhado, sem quebra.
 */
const ok = (state, events = []) => ({ ok: true, state, events });

/** Falha: o estado volta intacto, junto com a explicação para o jogador. */
const fail = (state, error) => ({ ok: false, state, error });

/**
 * COMPRAR — o jogador compra 1 carta do monte.
 * É a única compra do turno. Depois de comprar, o turno continua com ele.
 * Se o monte estiver vazio, encerra a partida por menor número de cartas.
 */
export function draw(state) {
  // Toda ação começa conferindo se ela é permitida AGORA. Isso se chama
  // "validação de entrada" e é o que impede estado impossível no jogo.
  if (state.phase !== PHASE.PLAYING) return fail(state, 'A partida não está em andamento.');
  if (state.deck.length === 0) return finishByFewestCards(state, 'O monte acabou.');

  // Desestruturação: `card` recebe a primeira carta; `rest` recebe o resto.
  // É o mesmo que: const card = deck[0]; const rest = deck.slice(1);
  const [card, ...rest] = state.deck;
  const player = currentPlayer(state);

  const withCard = updatePlayer(state, player.id, (p) => ({ hand: [...p.hand, card] }));
  const next = { ...withCard, deck: rest };

  return ok(next, [{ type: 'draw', playerId: player.id, card }]);
}

/**
 * BAIXAR — o jogador coloca suas primeiras cartas na mesa.
 *
 * Antes de todos baixarem, só é permitido baixar combinações válidas de 3+.
 * Depois de todos baixarem, esta função continua servindo para montar
 * combinações novas com 3+ cartas.
 *
 * @param {object} state
 * @param {string} playerId
 * @param {string[]} cardIds cartas da própria mão
 */
export function layDown(state, playerId, cardIds) {
  if (state.phase !== PHASE.PLAYING) return fail(state, 'A partida não está em andamento.');

  const player = currentPlayer(state);
  if (player.id !== playerId) return fail(state, 'Não é a sua vez.');

  const cards = pickFromHand(player, cardIds);
  if (!cards) return fail(state, 'Você só pode baixar cartas que estão na sua mão.');

  const check = canLayDown(cards);
  if (!check.allowed) return fail(state, check.reason);

  const remainingHand = player.hand.filter((c) => !cardIds.includes(c.id));
  const next = updatePlayer(state, playerId, () => ({
    hand: remainingHand,
    hasLaidDown: true,
  }));

  const withCombination = {
    ...next,
    tableau: [...next.tableau, cards],
  };

  return afterPlay(withCombination, playerId, [
    { type: 'layDown', playerId, cards, combinationType: check.type },
  ]);
}

/**
 * ENCAIXAR — adicionar uma carta da mão numa combinação já existente.
 * Só é permitido depois que a mesa está aberta (todos baixaram).
 *
 * @param {object} state
 * @param {string} playerId
 * @param {string} cardId
 * @param {number} combinationIndex índice da combinação na mesa
 */
export function appendToCombination(state, playerId, cardId, combinationIndex) {
  // A ordem das verificações vai da mais geral para a mais específica:
  // partida ativa -> mesa aberta -> é a sua vez -> carta existe -> encaixa.
  if (state.phase !== PHASE.PLAYING) return fail(state, 'A partida não está em andamento.');
  if (!isTableOpen(state.players)) {
    return fail(state, 'Ainda há jogador sem baixar. Enquanto isso, só é permitido baixar combinações de 3.');
  }

  const player = currentPlayer(state);
  if (player.id !== playerId) return fail(state, 'Não é a sua vez.');

  const card = player.hand.find((c) => c.id === cardId);
  if (!card) return fail(state, 'Essa carta não está na sua mão.');

  const combo = state.tableau[combinationIndex];
  if (!combo) return fail(state, 'Combinação inexistente na mesa.');

  const options = insertionOptions(combo, card);
  if (options.length === 0) return fail(state, 'Essa carta não encaixa nessa combinação.');

  // .filter cria a mão nova SEM a carta usada (devolve tudo que não é ela).
  // Mais uma vez: não alteramos a mão antiga, criamos outra.
  const next = updatePlayer(state, playerId, (p) => ({
    hand: p.hand.filter((c) => c.id !== cardId),
  }));

  const tableau = state.tableau.map((c, i) => (i === combinationIndex ? options[0] : c));

  return afterPlay({ ...next, tableau }, playerId, [
    { type: 'append', playerId, card, combinationIndex },
  ]);
}

/**
 * RECOMBINAR — move uma carta da mesa para outra combinação da mesa.
 *
 * É a ação mais delicada do jogo e por isso é validada com rigor:
 * a mesa inteira precisa continuar válida ANTES e DEPOIS.
 *
 * @param {object} state
 * @param {string} playerId
 * @param {string} cardId
 * @param {number} fromIndex combinação de origem
 * @param {number} toIndex combinação de destino
 * @param {number} [position] posição dentro da combinação de destino
 */
export function recombine(state, playerId, cardId, fromIndex, toIndex, position = null) {
  if (state.phase !== PHASE.PLAYING) return fail(state, 'A partida não está em andamento.');
  if (!isTableOpen(state.players)) {
    return fail(state, 'A mesa ainda não está aberta. Todos precisam baixar primeiro.');
  }

  const player = currentPlayer(state);
  if (player.id !== playerId) return fail(state, 'Não é a sua vez.');
  if (fromIndex === toIndex) return fail(state, 'A origem e o destino são a mesma combinação.');

  const from = state.tableau[fromIndex];
  const to = state.tableau[toIndex];
  if (!from || !to) return fail(state, 'Combinação inexistente na mesa.');

  const card = from.find((c) => c.id === cardId);
  if (!card) return fail(state, 'Essa carta não está nessa combinação.');

  // 1) A origem precisa continuar válida depois de perder a carta.
  const restOfFrom = from.filter((c) => c.id !== cardId);
  if (!classifyCombination(restOfFrom).valid) {
    return fail(
      state,
      `Retirar essa carta deixaria a origem com ${restOfFrom.length} carta(s). Toda combinação na mesa precisa de no mínimo ${MIN_COMBINATION}.`,
    );
  }

  // 2) A carta precisa encaixar no destino.
  const candidateAt = position === null
    ? insertionOptions(to, card)[0]
    : [...to.slice(0, position), card, ...to.slice(position)];

  if (!candidateAt || !classifyCombination(candidateAt).valid) {
    return fail(state, 'Essa carta não encaixa na combinação de destino.');
  }

  const tableau = state.tableau
    .map((c, i) => {
      if (i === fromIndex) return restOfFrom;
      if (i === toIndex) return candidateAt;
      return c;
    })
    .filter((c) => c.length > 0);

  // 3) Segurança final: a mesa inteira precisa estar válida.
  const check = validateTableau(tableau);
  if (!check.valid) return fail(state, check.errors[0]);

  return afterPlay({ ...state, tableau }, playerId, [
    { type: 'recombine', playerId, card, fromIndex, toIndex },
  ]);
}

/**
 * PASSAR A VEZ — encerra o turno do jogador atual.
 * Não há penalidade além de não ter jogado.
 */
export function passTurn(state, playerId) {
  // Passar não muda cartas: só troca de quem é a vez.
  // Usamos `nextTurnIndex`, que já faz a conta do "volta para o primeiro
  // quando chega no último" (o operador % é o resto da divisão).
  if (state.phase !== PHASE.PLAYING) return fail(state, 'A partida não está em andamento.');
  const player = currentPlayer(state);
  if (player.id !== playerId) return fail(state, 'Não é a sua vez.');

  return ok(
    { ...state, turnIndex: nextTurnIndex(state), lastAction: { type: 'pass', playerId } },
    [{ type: 'pass', playerId }],
  );
}

/**
 * Encerramento por menor número de cartas (monte vazio).
 */
export function finishByFewestCards(state, reason) {
  const winner = winnerByFewestCards(state.players);
  return ok(
    {
      ...state,
      phase: PHASE.FINISHED,
      winnerId: winner ? winner.id : null,
      lastAction: { type: 'finish', reason, winnerId: winner ? winner.id : null },
    },
    [{ type: 'finish', reason, winnerId: winner ? winner.id : null }],
  );
}

/**
 * Verificações pós-jogada:
 *  - Se o jogador zerou a mão, ele venceu e a partida acaba.
 *  - Senão, a vez passa para o próximo no sentido horário.
 */
/**
 * Esta função é chamada por TODA jogada que tira carta da mão.
 * Concentrar a verificação de vitória aqui evita repetir a mesma lógica
 * em baixar, encaixar e recombinar. Isso é o princípio DRY
 * ("Don't Repeat Yourself" — não se repita).
 *
 * @param {object} state estado depois da jogada
 * @param {string} playerId quem jogou
 * @param {object[]} events lista do que aconteceu, para a interface narrar
 */
function afterPlay(state, playerId, events) {
  const player = state.players.find((p) => p.id === playerId);

  if (player.hand.length === 0) {
    return ok(
      {
        ...state,
        phase: PHASE.FINISHED,
        winnerId: playerId,
        lastAction: { type: 'win', playerId },
      },
      [...events, { type: 'win', playerId }],
    );
  }

  return ok(
    { ...state, turnIndex: nextTurnIndex(state), lastAction: events[events.length - 1] },
    events,
  );
}

/** Separa as cartas da mão por id; devolve null se alguma não estiver na mão. */
function pickFromHand(player, cardIds) {
  const cards = cardIds.map((id) => player.hand.find((c) => c.id === id));
  if (cards.some((c) => !c)) return null;
  return cards;
}
