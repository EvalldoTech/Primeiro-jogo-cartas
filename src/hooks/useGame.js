/**
 * useGame.js — a PONTE entre a engine (JavaScript puro) e o React.
 *
 * O QUE É UM HOOK?
 * Um "hook" é uma função que começa com `use` e dá superpoderes ao componente.
 * `useState` guarda um valor que, quando muda, redesenha a tela.
 * `useCallback` guarda uma função para ela não ser recriada a cada desenho.
 *
 * A IDEIA DESTE ARQUIVO
 * A engine é JavaScript puro e não sabe que o React existe. Este hook é a
 * "tomada" entre os dois: recebe o clique da tela, chama a ação da engine,
 * e entrega o novo estado de volta para o React desenhar.
 *
 * Se amanhã o jogo virar um site com várias pessoas jogando juntas, esta é a
 * única camada que precisa mudar (para conversar com o servidor), porque as
 * regras continuam iguais dentro da engine.
 */
import { useCallback, useMemo, useState } from 'react';
import { createGame, PHASE, currentPlayer } from '../engine/gameState.js';
import {
  draw as drawAction,
  layDown as layDownAction,
  appendToCombination,
  recombine,
  passTurn,
} from '../engine/engine.js';

export default function useGame() {
  // Cada useState devolve [valorAtual, funcaoQueAltera].
  const [state, setState] = useState(null); // null = nenhuma partida iniciada
  const [message, setMessage] = useState(''); // aviso amigável ("Você comprou")
  const [error, setError] = useState('');     // erro de jogada inválida

  const startGame = useCallback((names, options) => {
    const game = createGame(names.map((name) => ({ name })), options);
    setState(game);
    setMessage('');
    setError('');
  }, []);

  /**
   * Trata o resultado padronizado da engine: `ok` decide o caminho.
   * Por isso as ações da engine devolvem sempre o mesmo formato —
   * aqui existe uma única porta de entrada para sucesso e erro.
   */
  const apply = useCallback((result, successText) => {
    if (!result.ok) {
      setError(result.error || 'Jogada inválida.');
      setMessage('');
      return false;
    }
    setState(result.state);
    setError('');
    setMessage(successText || '');
    return true;
  }, []);

  // IMPORTANTE: repare em `setState((current) => { ... })`.
  // Passamos uma FUNÇÃO em vez de um valor. O React entrega o estado mais
  // recente como `current`. Isso evita o bug clássico de "usei um estado
  // desatualizado" quando dois cliques chegam muito rápido.
  const draw = useCallback(() => {
    setState((current) => {
      if (!current) return current;
      const player = currentPlayer(current);
      const result = drawAction(current);
      if (!result.ok) {
        setError(result.error || 'Não foi possível comprar.');
        return current;
      }
      setError('');
      setMessage(result.state.phase === PHASE.FINISHED
        ? 'O monte acabou. Vence quem tem menos cartas.'
        : `${player.name} comprou uma carta.`);
      return result.state;
    });
  }, []);

  const layDown = useCallback((cardIds) => {
    setState((current) => {
      if (!current) return current;
      const player = currentPlayer(current);
      const result = layDownAction(current, player.id, cardIds);
      if (!result.ok) {
        setError(result.error);
        return current;
      }
      setError('');
      setMessage(`${player.name} baixou uma combinação.`);
      return result.state;
    });
  }, []);

  const append = useCallback((cardId, combinationIndex) => {
    setState((current) => {
      if (!current) return current;
      const player = currentPlayer(current);
      const result = appendToCombination(current, player.id, cardId, combinationIndex);
      if (!result.ok) {
        setError(result.error);
        return current;
      }
      setError('');
      setMessage(`${player.name} encaixou uma carta.`);
      return result.state;
    });
  }, []);

  const moveCard = useCallback((cardId, fromIndex, toIndex) => {
    setState((current) => {
      if (!current) return current;
      const player = currentPlayer(current);
      const result = recombine(current, player.id, cardId, fromIndex, toIndex);
      if (!result.ok) {
        setError(result.error);
        return current;
      }
      setError('');
      setMessage(`${player.name} reorganizou a mesa.`);
      return result.state;
    });
  }, []);

  const pass = useCallback(() => {
    setState((current) => {
      if (!current) return current;
      const player = currentPlayer(current);
      const result = passTurn(current, player.id);
      if (!result.ok) {
        setError(result.error);
        return current;
      }
      setError('');
      setMessage(`${player.name} passou a vez.`);
      return result.state;
    });
  }, []);

  const reset = useCallback(() => {
    setState(null);
    setMessage('');
    setError('');
  }, []);

  // useMemo só recalcula quando `state` muda. Aqui é exagero (a conta é
  // trivial), mas o padrão é útil quando o cálculo é pesado.
  const current = useMemo(() => (state ? currentPlayer(state) : null), [state]);

  return {
    state,
    current,
    message,
    error,
    startGame,
    draw,
    layDown,
    append,
    moveCard,
    pass,
    reset,
    clearMessage: () => { setMessage(''); setError(''); },
  };
}
