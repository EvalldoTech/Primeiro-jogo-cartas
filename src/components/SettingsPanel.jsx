/**
 * SettingsPanel.jsx — painel de opções (abre por cima da tela).
 *
 * ESTE COMPONENTE NÃO GUARDA NADA.
 * Ele recebe `prefs` e avisa `onChange` quando o jogador escolhe outra opção.
 * Quem guarda e salva é o App. Isso se chama "componente controlado":
 * a fonte da verdade fica em um lugar só, e não espalhada em cada tela.
 */
import { CARD_STYLES } from '../settings/themes.js';

export default function SettingsPanel({ prefs, onChange, onClose }) {
  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <header className="sheet__head">
          <h2>Opções</h2>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Fechar">×</button>
        </header>

        <section className="setting-group">
          <h3>Estilo das cartas</h3>
          <div className="style-grid">
            {CARD_STYLES.map((style) => (
              <button
                key={style.id}
                type="button"
                className={`style-option ${prefs.cardStyle === style.id ? 'is-active' : ''}`}
                onClick={() => onChange({ cardStyle: style.id })}
              >
                <span className="style-option__preview" data-style={style.id}>
                  <span className="style-option__rank">A</span>
                  <span className="style-option__suit">♦</span>
                </span>
                <span className="style-option__name">{style.name}</span>
                <span className="style-option__desc">{style.description}</span>
              </button>
            ))}
          </div>
        </section>

        <section className="setting-group">
          <h3>Música de fundo</h3>
          <label className="switch-row">
            <span>{prefs.soundOn ? 'Ligada' : 'Desligada'}</span>
            <input
              type="checkbox"
              className="switch-input"
              checked={prefs.soundOn}
              onChange={(e) => onChange({ soundOn: e.target.checked })}
            />
          </label>
          {prefs.soundOn ? (
            <label className="slider-row">
              <span>Volume</span>
              <input
                type="range"
                min="0"
                max="100"
                value={Math.round(prefs.volume * 100)}
                onChange={(e) => onChange({ volume: Number(e.target.value) / 100 })}
              />
            </label>
          ) : null}
        </section>

        <button type="button" className="btn btn--primary btn--block" onClick={onClose}>
          Pronto
        </button>
      </div>
    </div>
  );
}
