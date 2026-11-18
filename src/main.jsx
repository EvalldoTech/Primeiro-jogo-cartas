/**
 * main.jsx — o ponto de partida do aplicativo no navegador.
 *
 * Este é o único arquivo que conversa direto com o HTML: ele encontra a
 * <div id="root"> do index.html e coloca o React dentro dela.
 * Daqui para frente, tudo é componente.
 */
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './styles/global.css';

// getElementById procura a div vazia do index.html;
// createRoot prepara essa div; render desenha <App /> lá dentro.
createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

// Registra o "service worker": um arquivo que o navegador guarda e usa para
// abrir o jogo sem internet (é o que faz do site um PWA instalável).
// Só em produção (import.meta.env.PROD), para não atrapalhar o desenvolvimento.
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`).catch(() => {
      // Sem service worker o jogo continua funcionando, apenas não fica offline.
    });
  });
}
