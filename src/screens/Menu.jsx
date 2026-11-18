/**
 * Menu.jsx — menu principal do jogo.
 * Uma entrada clara para cada coisa: jogar, opções, regras e sobre.
 */
export default function Menu({ onPlay, onSettings, onRules, onAbout, prefs }) {
  return (
    <div className="screen screen--menu">
      <div className="menu-hero">
        <div className="menu-hero__gem" aria-hidden="true">
          <span className="gem-emoji">💚</span>
        </div>
        <h1 className="menu-hero__title">Esmeralda</h1>
        <p className="menu-hero__sub">Mesa compartilhada · sequências · recombinação livre</p>
        <div className="menu-hero__suits" aria-hidden="true">
          <span className="suit suit--red">♥</span>
          <span className="suit">♠</span>
          <span className="suit suit--red">♦</span>
          <span className="suit">♣</span>
        </div>
      </div>

      <nav className="menu-list">
        <button type="button" className="menu-item menu-item--primary" onClick={onPlay}>
          <span className="menu-item__icon">▶</span>
          <span className="menu-item__text">
            <strong>Jogar</strong>
            <small>2 a 4 jogadores, no mesmo aparelho</small>
          </span>
        </button>

        <button type="button" className="menu-item" onClick={onSettings}>
          <span className="menu-item__icon">◐</span>
          <span className="menu-item__text">
            <strong>Opções</strong>
            <small>Estilo das cartas, música e relógio</small>
          </span>
          <span className="menu-item__meta">{prefs.soundOn ? 'som on' : 'som off'}</span>
        </button>

        <button type="button" className="menu-item" onClick={onRules}>
          <span className="menu-item__icon">?</span>
          <span className="menu-item__text">
            <strong>Como jogar</strong>
            <small>Regras completas em uma tela</small>
          </span>
        </button>

        <button type="button" className="menu-item" onClick={onAbout}>
          <span className="menu-item__icon">✦</span>
          <span className="menu-item__text">
            <strong>Sobre</strong>
            <small>De onde veio este jogo</small>
          </span>
        </button>
      </nav>

      <p className="menu-footer">v0.2 · jogo original · feito para portfólio</p>
    </div>
  );
}
