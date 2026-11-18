/**
 * App.jsx — o COMPONENTE RAIZ: decide qual tela aparece.
 *
 * O QUE É UM COMPONENTE?
 * Uma função que devolve "HTML do React" (chamado JSX). O React junta os
 * componentes como blocos de montar: App chama Menu, Lobby, Table...
 *
 * O QUE É UM ESTADO DE TELA?
 * `screen` guarda uma palavra ('menu', 'lobby', 'table'). Quando ela muda,
 * o React desenha a tela correspondente. Não existe "navegar de página":
 * existe trocar o valor e deixar o React redesenhar.
 *
 * As preferências (estilo de carta, música) vivem aqui, no componente mais
 * alto, porque várias telas precisam delas ao mesmo tempo.
 */
import { useCallback, useEffect, useState } from 'react';
import Menu from './screens/Menu.jsx';
import Lobby from './screens/Lobby.jsx';
import Table from './screens/Table.jsx';
import Rules from './screens/Rules.jsx';
import About from './screens/About.jsx';
import SettingsPanel from './components/SettingsPanel.jsx';
import useGame from './hooks/useGame.js';
import { loadPrefs, savePrefs } from './settings/themes.js';
import { music } from './settings/sound.js';
import useMusicUnlock from './hooks/useMusicUnlock.js';

// Constantes no lugar de textos soltos: se errar a digitação, o erro aparece
// na hora (e o editor autocompleta), em vez de uma tela em branco.
const SCREEN = {
  MENU: 'menu',
  LOBBY: 'lobby',
  TABLE: 'table',
  RULES: 'rules',
  ABOUT: 'about',
};

export default function App() {
  const game = useGame();
  const [screen, setScreen] = useState(SCREEN.MENU);
  const [settingsOpen, setSettingsOpen] = useState(false);
  // Passar uma FUNÇÃO para o useState faz a leitura do aparelho acontecer
  // UMA vez só (na criação). Sem a função, ela rodaria em todo redesenho.
  const [prefs, setPrefs] = useState(() => loadPrefs());
  const [seats, setSeats] = useState([]);
  const [round, setRound] = useState(1);

  // Aplica só o que mudou (patch) e salva no aparelho.
  // `...prev, ...patch` = "tudo que já tinha, por cima o que mudou".
  const updatePrefs = useCallback((patch) => {
    setPrefs((prev) => {
      const next = { ...prev, ...patch };
      savePrefs(next);
      return next;
    });
  }, []);

  // useEffect = "faça algo DEPOIS que a tela desenhou".
  // A lista [prefs.soundOn] no fim diz: só repita quando esse valor mudar.
  // É o lugar certo para efeitos colaterais, como tocar som ou salvar dados.
  // Liga e desliga a música conforme a preferência.
  useEffect(() => {
    if (prefs.soundOn) music.start();
    else music.stop();
  }, [prefs.soundOn]);

  // Volume acompanha o controle deslizante.
  useEffect(() => {
    music.setVolume(prefs.volume);
  }, [prefs.volume]);

  // Garante que a música comece mesmo com o bloqueio de áudio dos navegadores.
  useMusicUnlock(prefs.soundOn);

  const handlePlay = useCallback(() => setScreen(SCREEN.LOBBY), []);

  const handleStart = useCallback((names, turnSeconds) => {
    setSeats(names);
    setRound(1);
    game.startGame(names, turnSeconds ? { turnSeconds } : {});
    game.clearMessage();
    setScreen(SCREEN.TABLE);
  }, [game]);

  const handleRestart = useCallback(() => {
    const winnerId = game.state?.winnerId;
    const winnerIndex = game.state?.players.findIndex((p) => p.id === winnerId) ?? -1;
    const nextStart = winnerIndex >= 0 ? (winnerIndex + 1) % seats.length : 0;
    const rotated = [...seats.slice(nextStart), ...seats.slice(0, nextStart)];
    setRound((r) => r + 1);
    game.startGame(rotated, prefs.timerOn ? { turnSeconds: prefs.turnSeconds } : {});
    game.clearMessage();
  }, [game, seats, prefs.timerOn, prefs.turnSeconds]);

  const handleBackToMenu = useCallback(() => {
    game.reset();
    setScreen(SCREEN.MENU);
  }, [game]);

  // JSX: parece HTML, mas é JavaScript. As `{}` executam código.
  // `condição ? <Componente/> : null` = "se for verdade, mostre; senão, nada".
  // O `<> ... </>` é um "fragmento": agrupa vários elementos sem criar uma
  // div extra no HTML final.
  return (
    <>
      {screen === SCREEN.MENU ? (
        <Menu
          prefs={prefs}
          onPlay={handlePlay}
          onSettings={() => setSettingsOpen(true)}
          onRules={() => setScreen(SCREEN.RULES)}
          onAbout={() => setScreen(SCREEN.ABOUT)}
        />
      ) : null}

      {screen === SCREEN.LOBBY ? (
        <Lobby
          prefs={prefs}
          onStart={handleStart}
          onBack={() => setScreen(SCREEN.MENU)}
          onSettings={() => setSettingsOpen(true)}
        />
      ) : null}

      {screen === SCREEN.TABLE ? (
        <Table
          game={game}
          cardStyle={prefs.cardStyle}
          onRestart={handleRestart}
          onExit={handleBackToMenu}
          onSettings={() => setSettingsOpen(true)}
        />
      ) : null}

      {screen === SCREEN.RULES ? <Rules onBack={() => setScreen(SCREEN.MENU)} /> : null}
      {screen === SCREEN.ABOUT ? <About onBack={() => setScreen(SCREEN.MENU)} /> : null}

      {settingsOpen ? (
        <SettingsPanel
          prefs={prefs}
          onChange={updatePrefs}
          onClose={() => setSettingsOpen(false)}
        />
      ) : null}
    </>
  );
}
