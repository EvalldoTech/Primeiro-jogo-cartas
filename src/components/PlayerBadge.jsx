/**
 * PlayerBadge.jsx — placa de cada jogador na mesa.
 * Mostra nome, quantidade de cartas, se já baixou e se é a vez dele.
 */
export default function PlayerBadge({ player, isCurrent, position }) {
  return (
    <div className={`player ${isCurrent ? 'is-current' : ''}`}>
      <div className="player__head">
        <span className="player__position">{position}</span>
        <span className="player__name">{player.name}</span>
        {isCurrent ? <span className="player__turn">sua vez</span> : null}
      </div>
      <div className="player__stats">
        <span>{player.hand.length} carta{player.hand.length === 1 ? '' : 's'}</span>
        <span className={player.hasLaidDown ? 'tag tag--ok' : 'tag'}>
          {player.hasLaidDown ? 'baixou' : 'não baixou'}
        </span>
      </div>
    </div>
  );
}
