/**
 * rules.js — REGRAS PURAS do jogo.
 *
 * Este arquivo não importa React, não toca no DOM e não guarda estado.
 * Recebe dados, devolve resultado. Toda regra do jogo vive aqui.
 * Isso é o que permite testar o jogo sem abrir a interface.
 *
 * VOCABULÁRIO:
 * - "combinação" (combination) = grupo de 3+ cartas válido na mesa.
 *   Dois tipos:
 *     SEQUENCIA -> mesmo naipe, valores consecutivos. Ex: A,2,3 de espada.
 *     GRUPO     -> mesmo valor, naipes diferentes. Ex: K de ouros, K de paus, K de copas.
 * - "mesa" (tableau) = lista de combinações.
 * - "baixou" = o jogador já colocou sua primeira combinação de 3 na mesa.
 */

import { AS_LOW, AS_HIGH, RANKS } from './deck.js';

// Constante com nome: o "3" aparece em várias regras. Se um dia mudar,
// muda em um lugar só. Isso é "evitar número mágico".
export const MIN_COMBINATION = 3;

/** Tipos de combinação suportados. */
export const COMBINATION_TYPE = {
  SEQUENCE: 'sequence',
  GROUP: 'group',
};

/**
 * A sequência de valores considera o As nas duas pontas.
 * Ordem interna (baixa): A,2,3,4,5,6,7,Q,J,K
 * O As também pode fechar acima do K: ...,Q,J,K,A
 */
const SEQUENCE_ORDER = [AS_LOW, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];

/**
 * Verifica se um conjunto de cartas forma uma SEQUÊNCIA válida
 * (mesmo naipe + valores consecutivos, As em qualquer ponta).
 * @param {object[]} cards
 * @returns {boolean}
 */
export function isValidSequence(cards) {
  if (cards.length < MIN_COMBINATION) return false; // menos de 3 não é combinação

  // .every roda o teste em TODAS as cartas e devolve true/false.
  // Aqui: "todas têm o mesmo naipe da primeira?" Se alguma não tiver, já era.
  const suit = cards[0].suit;
  if (!cards.every((c) => c.suit === suit)) return false;

  const ranks = cards.map((c) => c.rank); // ["valores"] de todas as cartas
  // Truque conhecido: um Set não aceita repetição, então comparar o tamanho
  // do Set com o tamanho da lista revela duplicadas (ex: 5,5,6).
  if (new Set(ranks).size !== ranks.length) return false; // sem repetição

  const sorted = ranks.slice().sort((a, b) => a - b);
  const isConsecutivePlain = sorted.every(
    (r, i) => i === 0 || SEQUENCE_ORDER.indexOf(r) === SEQUENCE_ORDER.indexOf(sorted[i - 1]) + 1,
  );
  if (isConsecutivePlain) return true;

  // Caso especial: As como 14 (alto). Ex: J,Q,K,A  ->  [11,12,13,1]
  const withAceHigh = ranks.map((r) => (r === AS_LOW ? AS_HIGH : r)).sort((a, b) => a - b);
  return withAceHigh.every((r, i) => i === 0 || r === withAceHigh[i - 1] + 1);
}

/**
 * Verifica se um conjunto de cartas forma um GRUPO válido
 * (mesmo valor + naipes diferentes).
 * @param {object[]} cards
 * @returns {boolean}
 */
export function isValidGroup(cards) {
  if (cards.length < MIN_COMBINATION) return false;
  // Mesmo valor em todas as cartas...
  const rank = cards[0].rank;
  if (!cards.every((c) => c.rank === rank)) return false;
  // ...e nenhum naipe repetido (senão seriam duas cartas iguais).
  const suits = cards.map((c) => c.suit);
  return new Set(suits).size === suits.length; // naipes distintos
}

/**
 * Diz se um conjunto de cartas é uma combinação válida, de qualquer tipo.
 * @param {object[]} cards
 * @returns {{valid: boolean, type: string|null}}
 */
export function classifyCombination(cards) {
  if (isValidSequence(cards)) return { valid: true, type: COMBINATION_TYPE.SEQUENCE };
  if (isValidGroup(cards)) return { valid: true, type: COMBINATION_TYPE.GROUP };
  return { valid: false, type: null };
}

/**
 * Valida a mesa INTEIRA segundo a regra de ouro:
 * toda combinação precisa ter no mínimo 3 cartas e ser válida.
 * Nenhuma carta pode ficar solta.
 *
 * @param {object[][]} tableau lista de combinações (cada uma é um array de cartas)
 * @returns {{valid: boolean, errors: string[]}}
 */
export function validateTableau(tableau) {
  // Em vez de parar no primeiro erro, juntamos todos: a tela pode mostrar
  // todos os problemas de uma vez, em vez de um por tentativa.
  const errors = [];
  tableau.forEach((combo, index) => {
    if (combo.length < MIN_COMBINATION) {
      errors.push(`Combinação ${index + 1}: tem ${combo.length} carta(s), o mínimo é ${MIN_COMBINATION}.`);
      return;
    }
    if (!classifyCombination(combo).valid) {
      errors.push(`Combinação ${index + 1}: as cartas não formam sequência nem grupo válido.`);
    }
  });
  return { valid: errors.length === 0, errors };
}

/**
 * Tenta encaixar uma carta numa combinação existente, SEM alterar o original.
 * Retorna a nova combinação se for legal, ou null.
 *
 * @param {object[]} combo combinação atual na mesa
 * @param {object} card carta a encaixar
 * @returns {object[]|null} nova combinação ou null se ilegal
 */
export function tryAppendToCombination(combo, card) {
  // .some = "existe pelo menos uma?" Aqui: essa carta já está nessa combinação?
  if (combo.some((c) => c.id === card.id)) return null; // carta já está lá
  const candidate = [...combo, card]; // lista nova com a carta no fim
  // Devolver uma NOVA combinação (e não alterar a antiga) mantém a imutabilidade.
  return classifyCombination(candidate).valid ? candidate : null;
}

/**
 * Encontra todas as posições onde a carta pode entrar dentro de uma combinação
 * (início, meio ou fim). Devolve array de novas combinações candidatas.
 *
 * @param {object[]} combo
 * @param {object} card
 * @returns {object[][]} combinações válidas resultantes
 */
export function insertionOptions(combo, card) {
  const results = [];
  // Testa TODAS as posições possíveis: antes da 1ª carta, entre cartas, no fim.
  // Ex.: combinação de 3 cartas tem 4 posições possíveis.
  for (let pos = 0; pos <= combo.length; pos += 1) {
    // .slice(0, pos) = pedaço do início até pos; .slice(pos) = o resto.
    // O spread junta: [parte inicial, carta nova, parte final].
    const candidate = [...combo.slice(0, pos), card, ...combo.slice(pos)];
    if (classifyCombination(candidate).valid) results.push(candidate);
  }
  return results;
}

/**
 * Regra de remoção: posso tirar `card` da combinação `combo`,
 * contanto que o que sobra continue válido (mínimo 3 e ainda combinando).
 *
 * @param {object[]} combo
 * @param {string} cardId
 * @returns {boolean}
 */
export function canRemoveFromCombination(combo, cardId) {
  const rest = combo.filter((c) => c.id !== cardId);
  if (rest.length === combo.length) return false; // carta não estava lá
  return classifyCombination(rest).valid;
}

/**
 * Verifica se o jogador pode baixar (fazer o primeiro descarte).
 * Enquanto houver jogador sem baixar, os OUTROS continuam obrigados
 * a baixar apenas combinações de 3+.
 *
 * @param {object[]} cards cartas que ele quer jogar
 * @returns {{allowed: boolean, type: string|null, reason?: string}}
 */
export function canLayDown(cards) {
  const { valid, type } = classifyCombination(cards);
  if (!valid) {
    return { allowed: false, type: null, reason: 'Precisa ser uma sequência ou um grupo de pelo menos 3 cartas válidas.' };
  }
  return { allowed: true, type };
}

/**
 * Estado de abertura da mesa: a "primeira fase" termina quando todos baixaram.
 * @param {object[]} players
 * @returns {boolean} true se a mesa está aberta para encaixes livres
 */
export function isTableOpen(players) {
  // "a mesa abre quando TODOS já baixaram" — uma linha resolve.
  return players.every((p) => p.hasLaidDown);
}

/**
 * Conta quantas cartas cada jogador ainda tem. Util para o desempate final.
 * @param {object[]} players
 * @returns {number[]}
 */
export function handSizes(players) {
  return players.map((p) => p.hand.length);
}

/**
 * Decide o vencedor quando o monte acaba e ninguém zerou a mão:
 * vence quem tiver MENOS cartas.
 * @param {object[]} players
 * @returns {object|null} jogador vencedor
 */
export function winnerByFewestCards(players) {
  if (players.length === 0) return null;
  // .reduce percorre a lista carregando um "melhor até agora" (best).
  // Começa no primeiro jogador e vai trocando quando encontra mão menor.
  return players.reduce((best, p) => (p.hand.length < best.hand.length ? p : best), players[0]);
}
