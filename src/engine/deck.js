/**
 * deck.js — Criação e embaralhamento do baralho.
 *
 * O QUE ESTE ARQUIVO FAZ
 * Monta a lista de cartas (dois baralhos de 52 = 104 cartas) e embaralha.
 * Nenhuma regra do jogo mora aqui: só "quais cartas existem" e "como sortear".
 *
 * POR QUE ESTE ARQUIVO É APENAS JAVASCRIPT
 * Porque não desenha nada na tela. Se amanhã o jogo for para um celular
 * nativo ou para um servidor em Node, este arquivo continua igual.
 */

// Uma "constante" é um valor que não muda durante o jogo.
// `export` = outros arquivos podem importar isso (é o "module" do JavaScript).
export const SUITS = {
  CORACAO: 'coracao',
  OURO: 'ouro',
  PAUS: 'paus',
  ESPADA: 'espada',
};

export const SUIT_LABEL = {
  coracao: 'Coração',
  ouro: 'Ouro',
  paus: 'Paus',
  espada: 'Espada',
};

export const SUIT_GLYPH = {
  coracao: '♥',
  ouro: '♦',
  paus: '♣',
  espada: '♠',
};

/**
 * Valores das cartas: 1 a 13.
 *
 * DECISÃO DO PROJETO: usamos 52 cartas por baralho (1..13), com os nomes de
 * naipe ibéricos. Dois baralhos = 104 cartas.
 * Se quisesse o baralho espanhol de 40 cartas, bastaria usar RANKS_SPANISH_40:
 * o resto do jogo não precisa mudar.
 */
export const RANKS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];

/** Baralho espanhol tradicional de 40 cartas (alternativa). */
export const RANKS_SPANISH_40 = [1, 2, 3, 4, 5, 6, 7, 10, 11, 12];

export const RANK_LABEL = {
  1: 'A', 2: '2', 3: '3', 4: '4', 5: '5', 6: '6', 7: '7', 8: '8', 9: '9',
  10: '10', 11: 'J', 12: 'Q', 13: 'K',
};

// O As vale 1 ou 14. Guardar os dois números aqui evita "número mágico"
// espalhado pelo código (boa prática: números com significado viram constante).
export const AS_LOW = 1;
export const AS_HIGH = 14; // o As alto fica logo acima do K (13)

/**
 * Cria UMA carta.
 * @param {number} rank valor nominal
 * @param {string} suit naipe
 * @param {number} copyIndex 0 ou 1 (qual dos dois baralhos)
 * @returns {object} carta
 *
 * `Object.freeze` impede que alguém altere a carta depois de criada.
 * Se o código tentar `card.rank = 5`, nada acontece (em modo estrito, dá erro).
 */
function makeCard(rank, suit, copyIndex) {
  return Object.freeze({
    // Repare: o id usa a string do naipe + valor + cópia.
    // Com dois baralhos, existem duas cartas "espada-7", por isso o copyIndex.
    id: `${suit}-${rank}-${copyIndex}`,
    rank,
    suit,
    copyIndex,
  });
}

/**
 * Monta a lista de cartas de N baralhos, sem embaralhar.
 * @param {number} deckCount quantidade de baralhos (2 no jogo oficial)
 * @returns {object[]} cartas
 *
 * `deckCount = 2` é um PARÂMETRO COM VALOR PADRÃO: se ninguém passar nada,
 * vale 2. Isso é JavaScript moderno (ES6) e economiza `if` no código.
 */
export function buildDeck(deckCount = 2) {
  const cards = [];
  // Laço dentro de laço dentro de laço: para cada baralho, cada naipe, cada valor.
  for (let copy = 0; copy < deckCount; copy += 1) {
    for (const suit of Object.values(SUITS)) {
      for (const rank of RANKS) {
        cards.push(makeCard(rank, suit, copy)); // .push adiciona no fim da lista
      }
    }
  }
  return cards;
}

/**
 * Embaralhamento "Fisher-Yates" — o algoritmo clássico e correto de embaralhar.
 *
 * Como funciona: percorre a lista do fim para o começo e troca cada carta por
 * outra sorteada entre as que ainda não foram fixadas. Assim toda ordem tem
 * a mesma chance de aparecer (embaralhar com `sort(() => Math.random() - 0.5)`
 * parece mais simples, mas é matematicamente errado).
 *
 * O gerador `rng` pode ser trocado por um gerador fixo. Isso permite testar
 * o jogo sem aleatoriedade — teste que varia não serve para encontrar bug.
 *
 * @param {object[]} cards cartas a embaralhar
 * @param {function():number} rng gerador de 0 a 1 (Math.random por padrão)
 * @returns {object[]} novo array embaralhado
 */
export function shuffle(cards, rng = Math.random) {
  const out = cards.slice(); // .slice() cria uma CÓPIA: não mexemos no original
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    // Desestruturação: troca os dois valores de lugar numa linha só.
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/**
 * Compara duas cartas por valor e depois por naipe (ordenação estável).
 */
export function compareCards(a, b) {
  if (a.rank !== b.rank) return a.rank - b.rank;
  const order = ['coracao', 'ouro', 'paus', 'espada'];
  return order.indexOf(a.suit) - order.indexOf(b.suit);
}
