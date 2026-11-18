/**
 * Testes da engine — node --test src/engine/rules.test.mjs
 *
 * Estes testes são a PROVA de que as regras do jogo funcionam.
 * Cada teste corresponde a um caso real que apareceu na definição do jogo.
 */
import test from 'node:test';
import assert from 'node:assert/strict';

import {
  isValidSequence,
  isValidGroup,
  classifyCombination,
  validateTableau,
  canRemoveFromCombination,
  canLayDown,
  MIN_COMBINATION,
} from './rules.js';

// Atalho para criar cartas nos testes.
const c = (rank, suit, copy = 0) => ({ id: `${suit}-${rank}-${copy}`, rank, suit, copyIndex: copy });

test('sequência de mesmo naipe é válida', () => {
  assert.equal(isValidSequence([c(1, 'espada'), c(2, 'espada'), c(3, 'espada')]), true);
  assert.equal(isValidSequence([c(11, 'ouro'), c(12, 'ouro'), c(13, 'ouro')]), true);
});

test('sequência com naipes misturados é inválida', () => {
  assert.equal(isValidSequence([c(1, 'espada'), c(2, 'ouro'), c(3, 'espada')]), false);
});

test('sequência com buraco é inválida', () => {
  assert.equal(isValidSequence([c(1, 'paus'), c(2, 'paus'), c(4, 'paus')]), false);
});

test('As vale nas duas pontas: A,2,3 e J,Q,K,A', () => {
  assert.equal(isValidSequence([c(1, 'coracao'), c(2, 'coracao'), c(3, 'coracao')]), true);
  assert.equal(isValidSequence([c(11, 'coracao'), c(12, 'coracao'), c(13, 'coracao'), c(1, 'coracao', 1)]), true);
});

test('grupo de mesmo valor e naipes diferentes é válido', () => {
  assert.equal(isValidGroup([c(13, 'ouro'), c(13, 'paus'), c(13, 'coracao')]), true);
});

test('grupo com dois naipes iguais é inválido', () => {
  assert.equal(isValidGroup([c(13, 'ouro'), c(13, 'ouro', 1), c(13, 'paus')]), false);
});

test('menos de 3 cartas nunca é combinação válida', () => {
  assert.equal(classifyCombination([c(1, 'espada'), c(2, 'espada')]).valid, false);
  assert.equal(MIN_COMBINATION, 3);
});

test('mesa com combinação de 2 cartas é inválida (regra de ouro)', () => {
  const tableau = [
    [c(1, 'espada'), c(2, 'espada'), c(3, 'espada')],
    [c(5, 'ouro'), c(6, 'ouro')],
  ];
  const result = validateTableau(tableau);
  assert.equal(result.valid, false);
  assert.equal(result.errors.length, 1);
});

test('retirar carta que deixa 2 na mesa é proibido', () => {
  const combo = [c(1, 'espada'), c(2, 'espada'), c(3, 'espada')];
  assert.equal(canRemoveFromCombination(combo, combo[0].id), false);
});

test('retirar carta de sequência de 4 é permitido', () => {
  const combo = [c(1, 'espada'), c(2, 'espada'), c(3, 'espada'), c(4, 'espada')];
  assert.equal(canRemoveFromCombination(combo, combo[0].id), true);
});

test('baixar carta solta é proibido', () => {
  assert.equal(canLayDown([c(7, 'paus')]).allowed, false);
});

test('baixar trinca de valor é permitido', () => {
  assert.equal(canLayDown([c(5, 'paus'), c(5, 'ouro'), c(5, 'coracao')]).allowed, true);
});
