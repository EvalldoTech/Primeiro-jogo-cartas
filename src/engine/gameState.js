/**
 * gameState.js — O ESTADO da partida.
 *
 * O QUE É "ESTADO"
 * É o retrato completo do jogo num instante: quem está jogando, o que cada um
 * tem na mão, o que está na mesa, o que sobrou no monte, de quem é a vez.
 * Se você salvasse esse objeto num arquivo JSON e abrisse amanhã, saberia
 * exatamente como a partida estava.
 *
 * REGRA DE OURO DA ARQUITETURA: O ESTADO É IMUTÁVEL.
 * Nenhuma função altera o objeto recebido — todas devolvem um objeto NOVO.
 * Exemplo do porquê: se duas telas (a sua mão e a lista de jogadores) olharem
 * a mesma lista e uma mexer nela, a outra quebra. Criando um objeto novo,
 * cada leitura é segura.
 * Bônus: o React só desenha de novo quando percebe um objeto novo. Imutabilidade
 * é justamente o que faz o React funcionar bem.
 */

import { buildDeck, shuffle } from './deck.js';

export const HAND_SIZE = 9; // cartas na mão de cada jogador no início
export const MIN_PLAYERS = 2;
export const MAX_PLAYERS = 4;

// Fases da partida. Usar constantes evita erro de digitação como 'playng'.
export const PHASE = {
  LOBBY: 'lobby',
  PLAYING: 'playing',
  FINISHED: 'finished',
};

/**
 * Cria o estado inicial da partida — é a função que "dá as cartas".
 *
 * @param {Array<{name: string}>} seats nomes dos jogadores, na ordem da mesa
 *        (a ordem do array é a ordem do sentido horário)
 * @param {object} options
 * @param {number} [options.deckCount=2] quantos baralhos
 * @param {function} [options.rng] gerador aleatório (injetável para testes)
 * @param {number|null} [options.turnSeconds=null] relógio por turno; null = desligado
 * @returns {object} estado da partida
 */
export function createGame(seats, options = {}) {
  // Desestruturação com valores padrão: se a opção não vier, usa o padrão.
  const {
    deckCount = 2,
    rng = Math.random,
    turnSeconds = null,
  } = options;

  if (seats.length < MIN_PLAYERS || seats.length > MAX_PLAYERS) {
    throw new Error(`A partida aceita de ${MIN_PLAYERS} a ${MAX_PLAYERS} jogadores.`);
  }

  // Primeiro monta o baralho, depois embaralha.
  const deck = shuffle(buildDeck(deckCount), rng);

  // Distribui 9 cartas para cada jogador, uma por vez no sentido horário.
  // .map cria uma lista nova com o mesmo tamanho de `seats`,
  // cada posição recebendo uma lista vazia — a mão de cada jogador.
  const hands = seats.map(() => []);
  let cursor = 0;
  // Distribui 9 cartas, uma por jogador por rodada (como no jogo de verdade).
  for (let round = 0; round < HAND_SIZE; round += 1) {
    for (let p = 0; p < seats.length; p += 1) {
      hands[p].push(deck[cursor]);
      cursor += 1;
    }
  }

  const players = seats.map((seat, index) => ({
    id: `p${index}`,
    name: seat.name || `Jogador ${index + 1}`,
    hand: hands[index],
    hasLaidDown: false,
    connected: true,
  }));

  // Este é o objeto de estado. Tudo que a tela precisa mostrar vem daqui.
  return {
    phase: PHASE.PLAYING,
    players,
    deck: deck.slice(cursor),   // o que sobrou é o monte de compra
    tableau: [],                // combinações baixadas, todas públicas
    discard: [],                // cartas fora do jogo
    turnIndex: 0,               // de quem é a vez
    lastAction: null,           // para a interface mostrar o que aconteceu
    winnerId: null,             // preenchido ao final
    turnSeconds,                // relógio opcional
    round: 1,
  };
}

/** Jogador da vez. */
export function currentPlayer(state) {
  return state.players[state.turnIndex];
}

/** Próximo índice no sentido horário. */
export function nextTurnIndex(state, from = state.turnIndex) {
  return (from + 1) % state.players.length;
}

/** Busca jogador por id. */
export function findPlayer(state, playerId) {
  return state.players.find((p) => p.id === playerId) || null;
}

/**
 * Devolve uma CÓPIA do estado com um jogador alterado.
 *
 * `...state` (spread) copia todas as propriedades para um objeto novo.
 * Depois sobrescrevemos só `players`. É a forma mais usada de atualizar
 * estado imutável no JavaScript — e a mesma ideia que você vai usar em React.
 *
 * @param {object} state estado atual
 * @param {string} playerId id do jogador
 * @param {function(object): object} patch recebe o jogador e devolve o que muda
 */
export function updatePlayer(state, playerId, patch) {
  return {
    ...state,
    players: state.players.map((p) => (p.id === playerId ? { ...p, ...patch(p) } : p)),
  };
}

/** Resumo do estado, útil para depurar e para os testes. */
export function describeState(state) {
  return {
    phase: state.phase,
    turn: currentPlayer(state).name,
    deckCount: state.deck.length,
    tableauCombinations: state.tableau.length,
    tableauCards: state.tableau.reduce((sum, combo) => sum + combo.length, 0),
    hands: state.players.map((p) => ({ name: p.name, cards: p.hand.length, laidDown: p.hasLaidDown })),
    winner: state.winnerId,
  };
}
