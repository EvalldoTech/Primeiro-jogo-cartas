/**
 * Card.jsx — uma carta individual.
 *
 * COMPONENTE COM "PROPS"
 * Props são as informações que um componente recebe de quem o usa — como
 * parâmetros de uma função. Aqui: `card` (dados), `style` (visual),
 * `onClick` (o que fazer ao tocar).
 *
 * TRUQUE DO VISUAL: a aparência muda pelo atributo `data-style` no elemento
 * raiz. O CSS tem três blocos (card[data-style="esmeralda"] etc.) e o React
 * só troca o valor do atributo. Nenhuma cor está escrita no JavaScript —
 * quem manda na aparência é o CSS, como deve ser.
 */
import { RANK_LABEL, SUIT_GLYPH, SUIT_LABEL } from '../engine/deck.js';

// Set = lista que só guarda valores únicos e tem busca rápida (.has).
const RED_SUITS = new Set(['coracao', 'ouro']);

export default function Card({
  card,
  style = 'esmeralda',
  selected = false,
  disabled = false,
  highlighted = false,
  compact = false,
  onClick,
  label,
}) {
  // Desestruturação com valor padrão: se a carta não tiver esses campos,
  // o componente não quebra — mostra um vazio em vez de "undefined".
  const isRed = RED_SUITS.has(card.suit);
  const rank = RANK_LABEL[card.rank] ?? card.rank;
  const glyph = SUIT_GLYPH[card.suit];

  // Monta a lista de classes CSS. .filter(Boolean) joga fora os itens vazios
  // ('') que sobram quando um dos ternários dá falso.
  const classes = [
    'card',
    isRed ? 'card--red' : 'card--black',
    selected ? 'is-selected' : '',
    disabled ? 'is-disabled' : '',
    highlighted ? 'is-highlighted' : '',
    compact ? 'card--compact' : '',
  ].filter(Boolean).join(' ');

  return (
    <button
      type="button"
      className={classes}
      data-style={style}
      onClick={onClick}
      disabled={disabled}
      aria-label={`${rank} de ${SUIT_LABEL[card.suit]}`}
      aria-pressed={selected}
    >
      <span className="card__corner card__corner--tl">
        <span className="card__rank">{rank}</span>
        <span className="card__pip" aria-hidden="true">{glyph}</span>
      </span>

      <span className="card__suit" aria-hidden="true">{glyph}</span>

      {/* Canto oposto: espelhado, com o naipe antes do valor para ler corretamente */}
      <span className="card__corner card__corner--br" aria-hidden="true">
        <span className="card__pip">{glyph}</span>
        <span className="card__rank">{rank}</span>
      </span>

      {label ? <span className="card__label">{label}</span> : null}
    </button>
  );
}
