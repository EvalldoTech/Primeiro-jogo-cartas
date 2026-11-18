/**
 * Combination.jsx — uma combinação da mesa.
 * A mesa é única e pública: nenhuma combinação pertence a um jogador.
 */
import Card from './Card.jsx';
import { SUIT_LABEL, RANK_LABEL } from '../engine/deck.js';

/** Descreve a combinação em português: "Sequência de espada" ou "Grupo de reis". */
function describe(cards) {
  const sameSuit = cards.every((c) => c.suit === cards[0].suit);
  return sameSuit
    ? `Sequência · ${SUIT_LABEL[cards[0].suit]}`
    : `Grupo · ${RANK_LABEL[cards[0].rank]}`;
}

export default function Combination({
  cards,
  index,
  cardStyle,
  selectedCardId,
  onCardClick,
  targetable = false,
  onSelectTarget,
}) {
  return (
    <div className={`combination ${targetable ? 'is-targetable' : ''}`}>
      <div className="combination__cards">
        {cards.map((card) => (
          <Card
            key={card.id}
            card={card}
            style={cardStyle}
            selected={selectedCardId === card.id}
            highlighted={selectedCardId === card.id}
            onClick={() => onCardClick(card, index)}
            compact
          />
        ))}
      </div>
      <div className="combination__meta">
        <span>{describe(cards)}</span>
        {targetable ? (
          <button type="button" className="btn btn--tiny" onClick={() => onSelectTarget(index)}>
            Encaixar aqui
          </button>
        ) : null}
      </div>
    </div>
  );
}
