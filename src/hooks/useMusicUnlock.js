/**
 * useMusicUnlock.js — desbloqueia o áudio no primeiro toque.
 *
 * Navegadores (principalmente no celular) bloqueiam som até o usuário interagir
 * com a página. Este hook garante que, se a música estiver ligada, ela comece
 * no primeiro toque em qualquer lugar da tela.
 */
import { useEffect } from 'react';
import { music } from '../settings/sound.js';

export default function useMusicUnlock(soundOn) {
  // Quando soundOn mudar, o React roda a função de dentro.
  // O `return` no final é a "limpeza": o React chama essa função quando o
  // componente sai da tela ou quando o efeito é repetido. Sem limpar, os
  // listeners se acumulam e o navegador fica pesado (isso se chama “vazamento”).
  useEffect(() => {
    if (!soundOn) return undefined;

    // Tenta tocar já; se o navegador bloquear, tenta no primeiro toque.
    music.start();

    const unlock = () => {
      music.start();
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('keydown', unlock);
    };

    window.addEventListener('pointerdown', unlock, { once: true });
    window.addEventListener('keydown', unlock, { once: true });

    return () => {
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('keydown', unlock);
    };
  }, [soundOn]);
}
