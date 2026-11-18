/**
 * Testes do fluxo da partida: turno, compra, baixada e transição de vez.
 * Rodar: node --test src/engine/
 */
import test from 'node:test';
import assert from 'node:assert/strict';

import { createGame, PHASE, currentPlayer, nextTurnIndex } from './gameState.js';
import { draw, layDown, passTurn, appendToCombination, recombine } from './engine.js';
import { isValidSequence } from './rules.js';

const c = (rank, suit, copy = 0) => ({ id: `${suit}-${rank}-${copy}`, rank, suit, copyIndex: copy });

/** Monta um estado fixo para testar uma regra específica. */
function stateWith({ hands, tableau = [], open = true, turnIndex = 0, deck = [] }) {
  return {
    phase: PHASE.PLAYING,
    players: hands.map((hand, i) => ({
      id: `p${i}`,
      name: `Jogador ${i + 1}`,
      hand,
      hasLaidDown: open,
      connected: true,
    })),
    deck,
    tableau,
    discard: [],
    turnIndex,
    lastAction: null,
    winnerId: null,
    turnSeconds: null,
    round: 1,
  };
}

test('createGame distribui 9 cartas e respeita o número de jogadores', () => {
  const state = createGame([{ name: 'Ana' }, { name: 'Bia' }, { name: 'Caio' }]);
  assert.equal(state.players.length, 3);
  state.players.forEach((p) => assert.equal(p.hand.length, 9));
  // 2 baralhos de 52 = 104 cartas; 3 jogadores x 9 = 27 na mão.
  assert.equal(state.deck.length, 104 - 27);
});

test('createGame rejeita menos de 2 e mais de 4 jogadores', () => {
  assert.throws(() => createGame([{ name: 'sozinho' }]));
  assert.throws(() => createGame([1, 2, 3, 4, 5].map((n) => ({ name: `J${n}` }))));
});

test('transição de turno segue o sentido horário e volta ao primeiro', () => {
  const state = createGame([{ name: 'Ana' }, { name: 'Bia' }, { name: 'Caio' }]);
  assert.equal(currentPlayer(state).name, 'Ana');
  const t1 = passTurn(state, 'p0').state;
  assert.equal(currentPlayer(t1).name, 'Bia');
  const t2 = passTurn(t1, 'p1').state;
  assert.equal(currentPlayer(t2).name, 'Caio');
  const t3 = passTurn(t2, 'p2').state;
  assert.equal(currentPlayer(t3).name, 'Ana', 'depois do último volta para o primeiro');
});

test('não é possível passar a vez fora do próprio turno', () => {
  const state = createGame([{ name: 'Ana' }, { name: 'Bia' }]);
  const result = passTurn(state, 'p1');
  assert.equal(result.ok, false);
  assert.equal(result.state.turnIndex, 0, 'estado não muda em jogada inválida');
});

test('comprar adiciona 1 carta e mantém a vez com o mesmo jogador', () => {
  const state = stateWith({ hands: [[c(1, 'espada')], [c(2, 'ouro')]], deck: [c(5, 'paus')] });
  const result = draw(state);
  assert.equal(result.ok, true);
  assert.equal(result.state.players[0].hand.length, 2);
  assert.equal(result.state.turnIndex, 0, 'a vez continua com quem comprou');
  assert.equal(result.state.deck.length, 0);
});

test('comprar com o monte vazio encerra por menor número de cartas', () => {
  const state = stateWith({
    hands: [[c(1, 'espada'), c(2, 'espada')], [c(3, 'ouro')]],
    deck: [],
  });
  const result = draw(state);
  assert.equal(result.ok, true);
  assert.equal(result.state.phase, PHASE.FINISHED);
  assert.equal(result.state.winnerId, 'p1');
});

test('baixar sequência de 3 válida funciona e passa a vez', () => {
  const cards = [c(1, 'espada'), c(2, 'espada'), c(3, 'espada')];
  const state = stateWith({
    hands: [[...cards, c(9, 'paus')], [c(4, 'ouro')]],
    open: false,
  });
  const result = layDown(state, 'p0', cards.map((x) => x.id));
  assert.equal(result.ok, true);
  assert.equal(result.state.tableau.length, 1);
  assert.equal(result.state.players[0].hand.length, 1);
  assert.equal(result.state.players[0].hasLaidDown, true);
  assert.equal(result.state.turnIndex, 1);
});

test('baixar 2 cartas soltas é recusado', () => {
  const state = stateWith({
    hands: [[c(1, 'espada'), c(2, 'espada'), c(7, 'paus')], [c(4, 'ouro')]],
    open: false,
  });
  const result = layDown(state, 'p0', ['espada-1-0', 'espada-2-0']);
  assert.equal(result.ok, false);
});

test('zerar a mão encerra a partida com vitória', () => {
  const cards = [c(1, 'espada'), c(2, 'espada'), c(3, 'espada')];
  const state = stateWith({ hands: [cards, [c(4, 'ouro')]], open: false });
  const result = layDown(state, 'p0', cards.map((x) => x.id));
  assert.equal(result.state.phase, PHASE.FINISHED);
  assert.equal(result.state.winnerId, 'p0');
});

test('encaixar carta é bloqueado enquanto alguém não baixou', () => {
  const state = stateWith({
    hands: [[c(5, 'espada')], [c(4, 'ouro')]],
    tableau: [[c(1, 'espada'), c(2, 'espada'), c(3, 'espada')]],
    open: false,
  });
  // 5 não encaixa (falta o 4) — usamos o 4, que é o encaixe real.
  const result = appendToCombination(state, 'p0', 'espada-4-0', 0);
  assert.equal(result.ok, false);
});

test('encaixar carta funciona com a mesa aberta', () => {
  const state = stateWith({
    hands: [[c(4, 'espada')], [c(4, 'ouro')]],
    tableau: [[c(1, 'espada'), c(2, 'espada'), c(3, 'espada')]],
    open: true,
  });
  const result = appendToCombination(state, 'p0', 'espada-4-0', 0);
  assert.equal(result.ok, true);
  assert.equal(result.state.tableau[0].length, 4, 'A,2,3 + 4 = 4 cartas');
  assert.equal(result.state.players[0].hand.length, 0);
  assert.equal(result.state.phase, PHASE.FINISHED, 'zerou a mão, venceu');
});

test('recombinar é proibido se a origem ficaria com 2 cartas', () => {
  const state = stateWith({
    hands: [[c(7, 'paus')], [c(8, 'ouro')]],
    tableau: [
      [c(1, 'espada'), c(2, 'espada'), c(3, 'espada')],
      [c(5, 'ouro'), c(5, 'paus'), c(5, 'coracao')],
    ],
    open: true,
  });
  const result = recombine(state, 'p0', 'espada-1-0', 0, 1);
  assert.equal(result.ok, false);
  assert.match(result.error, /mínimo 3/);
});

test('recombinar é permitido quando a origem mantém 3 válidas', () => {
  const state = stateWith({
    hands: [[c(7, 'paus')], [c(8, 'ouro')]],
    tableau: [
      [c(1, 'espada'), c(2, 'espada'), c(3, 'espada'), c(4, 'espada')],
      [c(5, 'ouro'), c(5, 'paus'), c(5, 'coracao')],
    ],
    open: true,
  });
  const result = recombine(state, 'p0', 'espada-4-0', 0, 1);
  assert.equal(result.ok, false, '4 de espada não vira grupo de 5');

  const target = stateWith({
    hands: [[c(7, 'paus')], [c(8, 'ouro')]],
    tableau: [
      [c(1, 'espada'), c(2, 'espada'), c(3, 'espada'), c(4, 'espada')],
      [c(4, 'ouro'), c(4, 'paus'), c(4, 'coracao')],
    ],
    open: true,
  });
  const ok = recombine(target, 'p0', 'espada-4-0', 0, 1);
  assert.equal(ok.ok, true);
  assert.equal(ok.state.players[0].hand.length, 1, 'recombinar não usa a mão');
});

test('As entra como alto: J,Q,K,A é sequência', () => {
  assert.equal(
    isValidSequence([c(11, 'coracao'), c(12, 'coracao'), c(13, 'coracao'), c(1, 'coracao', 1)]),
    true,
  );
});
