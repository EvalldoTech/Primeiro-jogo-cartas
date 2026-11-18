/**
 * Table.jsx — a mesa de jogo.
 *
 * Fluxo de interação (guiado, não arrastar):
 *  1. toque numa carta da sua mão -> ela fica selecionada;
 *  2. a tela mostra os destinos válidos (encaixar / combinação de origem);
 *  3. cada ação é validada pela engine antes de acontecer.
 */

/*
 * CONCEITOS DE REACT NESTA TELA
 * - useState: guarda o que só interessa a esta tela (cartas selecionadas,
 *   combinação escolhida). Se está no estado da partida, vem de `game`.
 * - Derivar em vez de guardar: `canLayDown` não é um useState; é calculado a
 *   cada desenho a partir das cartas selecionadas. Guardar cópia de algo que
 *   dá para calcular é a receita do bug "a tela discorda do jogo".
 * - Eventos no React: onClick={() => ...}. A função é passada, não chamada.
 *   `onClick={apagar()}` chamaria a função na hora do desenho — erro clássico.
 */
import { useEffect, useMemo, useState } from 'react';
import Card from '../components/Card.jsx';
import Combination from '../components/Combination.jsx';
import PlayerBadge from '../components/PlayerBadge.jsx';
import { PHASE } from '../engine/gameState.js';
import { isTableOpen, classifyCombination, insertionOptions, canRemoveFromCombination } from '../engine/rules.js';

export default function Table({ game, cardStyle = 'esmeralda', onRestart, onExit, onSettings }) {
  const { state, current, message, error, draw, layDown, append, moveCard, pass } = game;
  const [selectedHand, setSelectedHand] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);
  const [secondsLeft, setSecondsLeft] = useState(state?.turnSeconds ?? null);

  const tableOpen = useMemo(() => (state ? isTableOpen(state.players) : false), [state]);
  const isFinished = state?.phase === PHASE.FINISHED;
  const winner = isFinished && state.winnerId
    ? state.players.find((p) => p.id === state.winnerId)
    : null;

  // Relógio opcional por turno.
  useEffect(() => {
    if (!state?.turnSeconds || isFinished) return undefined;
    setSecondsLeft(state.turnSeconds);
    const timer = setInterval(() => {
      setSecondsLeft((s) => (s === null ? null : Math.max(0, s - 1)));
    }, 1000);
    return () => clearInterval(timer);
  }, [state?.turnIndex, state?.turnSeconds, isFinished]);

  // Limpa a seleção quando muda o jogador da vez.
  useEffect(() => {
    setSelectedHand([]);
    setSelectedTable(null);
  }, [state?.turnIndex]);

  if (!state) return null;

  const me = current;
  const selectedCards = me.hand.filter((c) => selectedHand.includes(c.id));
  const canLayDownSelection = selectedCards.length >= 3
    && classifyCombination(selectedCards).valid;

  /** Carta da mesa tocada: seleciona para reposicionar. */
  const handleTableCard = (card, combinationIndex) => {
    if (!tableOpen) return;
    setSelectedTable((prev) =>
      prev && prev.cardId === card.id ? null : { cardId: card.id, combinationIndex });
    setSelectedHand([]);
  };

  /** Destinos possíveis para a carta que está na mão. */
  const handTargets = useMemo(() => {
    if (selectedHand.length !== 1) return [];
    const card = me.hand.find((c) => c.id === selectedHand[0]);
    if (!card) return [];
    return state.tableau
      .map((combo, index) => ({ index, options: insertionOptions(combo, card) }))
      .filter((t) => t.options.length > 0);
  }, [selectedHand, me, state.tableau]);

  /** Destinos possíveis para uma carta retirada da mesa. */
  const tableTargets = useMemo(() => {
    if (!selectedTable) return [];
    const source = state.tableau[selectedTable.combinationIndex];
    const card = source.find((c) => c.id === selectedTable.cardId);
    if (!card) return [];
    const canLeave = canRemoveFromCombination(source, card.id);
    const targets = state.tableau
      .map((combo, index) => ({ index, options: index === selectedTable.combinationIndex ? [] : insertionOptions(combo, card) }))
      .filter((t) => t.options.length > 0);
    return { canLeave, targets };
  }, [selectedTable, state.tableau]);

  const toggleHandCard = (card) => {
    setSelectedTable(null);
    setSelectedHand((prev) =>
      prev.includes(card.id) ? prev.filter((id) => id !== card.id) : [...prev, card.id]);
  };

  const doLayDown = () => {
    if (layDown(selectedHand)) setSelectedHand([]);
  };

  const doAppend = (index) => {
    if (append(selectedHand[0], index)) setSelectedHand([]);
  };

  const doMove = (toIndex) => {
    if (!selectedTable) return;
    if (moveCard(selectedTable.cardId, selectedTable.combinationIndex, toIndex)) setSelectedTable(null);
  };

  return (
    <div className="screen screen--table">
      <header className="tablebar">
        <div className="tablebar__turn">
          <span className="dot" />
          <strong>{me.name}</strong>
          {state.turnSeconds ? <span className="clock">{secondsLeft}s</span> : null}
        </div>
        <div className="tablebar__actions">
          <span className="stat">monte <strong>{state.deck.length}</strong></span>
          <span className="stat">rodada <strong>{state.round}</strong></span>
          <button type="button" className="icon-btn" onClick={onSettings} aria-label="Opções">◐</button>
          <button type="button" className="icon-btn" onClick={onExit} aria-label="Sair para o menu">×</button>
        </div>
      </header>

      <section className="players-strip">
        {state.players.map((p, i) => (
          <PlayerBadge key={p.id} player={p} position={i + 1} isCurrent={p.id === me.id} />
        ))}
      </section>

      <section className="tableau">
        {state.tableau.length === 0 ? (
          <p className="empty">A mesa está vazia. Abra com 3 cartas: uma sequência do mesmo naipe ou um grupo de mesmo valor.</p>
        ) : null}

        <div className="tableau__grid">
          {state.tableau.map((cards, index) => (
            <Combination
              key={`c-${index}`}
              index={index}
              cards={cards}
              cardStyle={cardStyle}
              selectedCardId={selectedTable?.cardId}
              onCardClick={handleTableCard}
              targetable={Boolean(selectedTable && selectedTable.combinationIndex !== index && tableTargets.targets?.some((t) => t.index === index))
                || handTargets.some((t) => t.index === index)}
              onSelectTarget={(i) => {
                if (selectedTable) doMove(i);
                else if (selectedHand.length === 1) doAppend(i);
              }}
            />
          ))}
        </div>
      </section>

      {selectedTable ? (
        <p className="banner">
          {tableTargets.canLeave
            ? (tableTargets.targets.length > 0
              ? 'Carta da mesa selecionada. Toque em "Encaixar aqui" na combinação de destino.'
              : 'Essa carta não encaixa em nenhuma outra combinação da mesa.')
            : 'Você não pode retirar essa carta: a combinação de origem ficaria com menos de 3 cartas.'}
        </p>
      ) : null}

      {selectedHand.length === 1 && handTargets.length > 0 ? (
        <p className="banner">Toque em "Encaixar aqui" para colocar essa carta na mesa.</p>
      ) : null}

      <section className="hand">
        <div className="hand__head">
          <span>
            Sua mão · {me.hand.length} carta{me.hand.length === 1 ? '' : 's'}
            {me.hand.length > 5 ? <span className="hand__count"> — arraste para o lado</span> : null}
          </span>
          {selectedHand.length > 0 ? <span className="hand__sel">{selectedHand.length} selecionada(s)</span> : null}
        </div>
        <div className="hand__scroll">
          {me.hand.map((card) => (
            <Card
              key={card.id}
              card={card}
              style={cardStyle}
              selected={selectedHand.includes(card.id)}
              onClick={() => toggleHandCard(card)}
              disabled={isFinished}
            />
          ))}
        </div>
      </section>

      {message || error ? (
        <div className={`toast ${error ? 'toast--error' : ''}`} role="status">{error || message}</div>
      ) : null}

      <footer className="actions">
        <button type="button" className="btn btn--ghost" onClick={draw} disabled={isFinished}>
          Comprar
        </button>
        <button
          type="button"
          className="btn btn--primary"
          onClick={doLayDown}
          disabled={!canLayDownSelection || isFinished}
        >
          Baixar {selectedHand.length >= 3 ? `(${selectedHand.length})` : ''}
        </button>
        <button type="button" className="btn btn--ghost" onClick={pass} disabled={isFinished}>
          Passar vez
        </button>
      </footer>

      {isFinished ? (
        <div className="sheet-backdrop">
          <div className="sheet sheet--result">
            <h2>{winner ? `${winner.name} venceu!` : 'Partida encerrada'}</h2>
            <p>
              {winner
                ? 'Mão zerada. A próxima rodada começa com o jogador seguinte, no sentido horário.'
                : 'Ninguém zerou a mão. Venceu quem tinha menos cartas.'}
            </p>
            <ul className="final-list">
              {state.players.map((p) => (
                <li key={p.id}>
                  <span>{p.name}</span>
                  <strong>{p.hand.length} carta{p.hand.length === 1 ? '' : 's'}</strong>
                </li>
              ))}
            </ul>
            <button type="button" className="btn btn--primary btn--block" onClick={onRestart}>
              Nova partida
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
