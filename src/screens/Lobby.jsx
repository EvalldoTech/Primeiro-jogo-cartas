/**
 * Lobby.jsx — escolher jogadores e começar.
 */
import { useState } from 'react';

const LIMITS = [2, 3, 4];
const SUGGESTED = ['Você', 'Laila', 'Laís', 'Esmeralda'];

export default function Lobby({ prefs, onStart, onBack, onSettings }) {
  const [playerCount, setPlayerCount] = useState(2);
  const [names, setNames] = useState(SUGGESTED);
  const [useTimer, setUseTimer] = useState(prefs.timerOn);
  const [turnSeconds, setTurnSeconds] = useState(prefs.turnSeconds);

  const updateName = (index, value) => {
    setNames((prev) => prev.map((n, i) => (i === index ? value : n)));
  };

  const start = () => {
    const seatNames = names.slice(0, playerCount).map((n, i) => n.trim() || `Jogador ${i + 1}`);
    onStart(seatNames, useTimer ? turnSeconds : null);
  };

  return (
    <div className="screen screen--lobby">
      <header className="page-head">
        <button type="button" className="icon-btn" onClick={onBack} aria-label="Voltar">←</button>
        <h2>Nova partida</h2>
        <button type="button" className="icon-btn" onClick={onSettings} aria-label="Opções">◐</button>
      </header>

      <section className="panel">
        <h3>Quantos jogadores</h3>
        <div className="chips">
          {LIMITS.map((n) => (
            <button
              key={n}
              type="button"
              className={`chip ${playerCount === n ? 'is-active' : ''}`}
              onClick={() => setPlayerCount(n)}
            >
              {n}
            </button>
          ))}
        </div>

        <h3>Nomes</h3>
        <div className="seat-list">
          {names.slice(0, playerCount).map((name, index) => (
            <label key={index} className="field">
              <span className="field__label">Jogador {index + 1}</span>
              <input
                className="field__input"
                value={name}
                maxLength={14}
                onChange={(e) => updateName(index, e.target.value)}
                placeholder={`Jogador ${index + 1}`}
              />
            </label>
          ))}
        </div>
        <p className="hint">A ordem desta lista é o sentido horário da mesa.</p>
      </section>

      <section className="panel">
        <h3>Relógio de turno</h3>
        <label className="switch-row">
          <span>{useTimer ? `Ligado · ${turnSeconds}s por turno` : 'Desligado'}</span>
          <input
            type="checkbox"
            className="switch-input"
            checked={useTimer}
            onChange={(e) => setUseTimer(e.target.checked)}
          />
        </label>
        {useTimer ? (
          <div className="chips">
            {[30, 60, 120].map((s) => (
              <button
                key={s}
                type="button"
                className={`chip ${turnSeconds === s ? 'is-active' : ''}`}
                onClick={() => setTurnSeconds(s)}
              >
                {s}s
              </button>
            ))}
          </div>
        ) : null}
        <p className="hint">Opcional. Use só se todos na mesa concordarem.</p>
      </section>

      <button type="button" className="btn btn--primary btn--block btn--lg" onClick={start}>
        Começar partida
      </button>
    </div>
  );
}
